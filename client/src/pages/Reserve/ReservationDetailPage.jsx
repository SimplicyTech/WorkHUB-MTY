import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getReservacionById, cancelReservacion, checkInReservacion, checkOutReservacion } from '../../services/reservations'
import Qrgenerator from '../../components/Confirmation/Qrgenerator'
import { GRACE_MINUTES, classifyReservation } from '../../utils/reservationStatus'

function parseLocalDate(fecha) {
  if (!fecha) return null
  const dateOnly = String(fecha).slice(0, 10)
  const [y, m, d] = dateOnly.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateLong(dateStr) {
  const d = parseLocalDate(dateStr)
  if (!d) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${day} / ${months[d.getMonth()]} / ${d.getFullYear()}`
}

function formatTimeRange(start, end) {
  if (!start || !end) return '—'
  return `${start.slice(0, 5)} — ${end.slice(0, 5)}`
}

function reservationCode(id) {
  if (!id) return '—'
  return `RES-${String(id).padStart(6, '0')}`
}

function buildStartDate(fecha, horaInicio) {
  if (!fecha || !horaInicio) return null
  const dateOnly = String(fecha).slice(0, 10)
  const [y, m, d] = dateOnly.split('-').map(Number)
  const [h, min] = horaInicio.split(':').map(Number)
  return new Date(y, m - 1, d, h, min, 0)
}

function buildEndDate(fecha, horaFin) {
  if (!fecha || !horaFin) return null
  const dateOnly = String(fecha).slice(0, 10)
  const [y, m, d] = dateOnly.split('-').map(Number)
  const [h, min] = horaFin.split(':').map(Number)
  return new Date(y, m - 1, d, h, min, 0)
}

// Parsea un DATETIME "YYYY-MM-DD HH:MM:SS" como hora local (sin TZ).
function parseLocalDatetime(s) {
  if (!s) return null
  const str = String(s).replace('T', ' ').slice(0, 19)
  const [datePart, timePart] = str.split(' ')
  if (!datePart || !timePart) return null
  const [y, m, d] = datePart.split('-').map(Number)
  const [h, mi, se] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, h, mi, se || 0)
}

const PRE_CHECKIN_MINUTES = 10
const EARLY_CHECKIN_MINUTES = 5

export default function ReservationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const [now, setNow] = useState(() => new Date())

  const refetch = useCallback(() => {
    return getReservacionById(id)
      .then((res) => {
        setReservation(res.data || null)
      })
      .catch((err) => {
        setError(err?.error || 'Error al cargar la reservación')
      })
  }, [id])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getReservacionById(id)
      .then((res) => {
        if (cancelled) return
        setReservation(res.data || null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.error || 'Error al cargar la reservación')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Tick every second only while we may need to render the grace timer
  const startDate = useMemo(
    () => buildStartDate(reservation?.Fecha, reservation?.HoraInicio),
    [reservation?.Fecha, reservation?.HoraInicio]
  )
  const estatusNombreLower = (reservation?.EstatusNombre || '').toLowerCase().trim()
  const isCancelled = estatusNombreLower === 'cancelada'
  const endDate = useMemo(
    () => buildEndDate(reservation?.Fecha, reservation?.HoraFin),
    [reservation?.Fecha, reservation?.HoraFin]
  )
  const isPast = !!(endDate && now > endDate)

  const graceEndsAt = useMemo(
    () => (startDate ? new Date(startDate.getTime() + GRACE_MINUTES * 60_000) : null),
    [startDate]
  )

  const preCheckInAt = useMemo(
    () => (startDate ? new Date(startDate.getTime() - PRE_CHECKIN_MINUTES * 60_000) : null),
    [startDate]
  )
  const earlyCheckInAt = useMemo(
    () => (startDate ? new Date(startDate.getTime() - EARLY_CHECKIN_MINUTES * 60_000) : null),
    [startDate]
  )

  const checkInAt = useMemo(
    () => parseLocalDatetime(reservation?.CheckInHoraEntrada),
    [reservation?.CheckInHoraEntrada]
  )
  const checkOutAt = useMemo(
    () => parseLocalDatetime(reservation?.CheckInHoraSalida),
    [reservation?.CheckInHoraSalida]
  )

  // El estatus del backend manda. Solo mostramos el contador de gracia
  // si la BD dice 'En periodo de gracia' (y aún queda tiempo en el reloj
  // local, para que el countdown no muestre negativos si el reloj se desfasó).
  const inGracePeriod = !!(
    estatusNombreLower === 'en periodo de gracia' &&
    startDate &&
    graceEndsAt &&
    now < graceEndsAt
  )

  const isProxima = estatusNombreLower === 'próxima' || estatusNombreLower === 'proxima'
  const isActiva = estatusNombreLower === 'activa'
  const isCompleted = estatusNombreLower === 'completada'

  // Punto de corte de la sesión activa: si hubo check-out manual, esa hora;
  // si no, la hora de fin de la reservación. Mientras siga 'Activa' y no haya
  // llegado el fin, sigue corriendo en vivo.
  const sessionEndAt = useMemo(() => {
    if (checkOutAt) return checkOutAt
    if (isCompleted && endDate) return endDate
    return null
  }, [checkOutAt, isCompleted, endDate])

  // Pre-check-in: 10 min antes de la hora de inicio aparece la caja de aviso;
  // los últimos 5 min, además se habilita el botón de check-in.
  const inPreCheckInWindow = !!(
    isProxima && preCheckInAt && earlyCheckInAt &&
    now >= preCheckInAt && now < earlyCheckInAt
  )
  const inEarlyCheckInWindow = !!(
    isProxima && earlyCheckInAt && startDate &&
    now >= earlyCheckInAt && now < startDate
  )

  // El contador en vivo de sesión activa corre solo hasta llegar a la hora fin.
  const activeSessionRunning = !!(isActiva && checkInAt && endDate && now < endDate)
  const needsTick = inGracePeriod || inPreCheckInWindow || inEarlyCheckInWindow || activeSessionRunning

  useEffect(() => {
    if (!needsTick) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [needsTick])

  // Cuando la sesión activa alcanza la hora de fin, refrescamos una vez para
  // que el backend marque la reserva como 'Completada' y el contador quede
  // congelado en el tiempo total transcurrido.
  const refetchedOnEnd = useRef(false)
  useEffect(() => {
    if (!isActiva || !endDate) return
    if (now < endDate) return
    if (refetchedOnEnd.current) return
    refetchedOnEnd.current = true
    refetch()
  }, [isActiva, endDate, now, refetch])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await cancelReservacion(reservation.ReservacionID)
      navigate('/mis-reservaciones', { replace: true })
    } catch (err) {
      alert(err?.error || 'Error al cancelar la reservación')
      setCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const res = await checkInReservacion(reservation.ReservacionID)
      const newEstatusId = res?.data?.EstatusID
      const horaEntrada = res?.data?.HoraEntrada
        || new Date().toISOString().slice(0, 19).replace('T', ' ')
      setReservation((prev) => prev ? {
        ...prev,
        EstatusNombre: 'Activa',
        EstatusID: newEstatusId ?? prev.EstatusID,
        CheckInHoraEntrada: prev.CheckInHoraEntrada || horaEntrada,
      } : prev)
    } catch (err) {
      alert(err?.error || 'Error al hacer check-in')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      await checkOutReservacion(reservation.ReservacionID)
      // Refrescamos para mostrar el cronómetro congelado en el momento del
      // check-out (en vez de salir de la pantalla).
      await refetch()
    } catch (err) {
      alert(err?.error || 'Error al hacer check-out')
    } finally {
      setCheckingOut(false)
    }
  }

  // Reglas de visibilidad de los botones, derivadas del estatus del backend:
  //   - Cancelar: solo si la reservación está 'Próxima'
  //   - Check-out: solo si la reservación está 'Activa' (hubo check-in)
  const estatusActual = (reservation?.EstatusNombre || '').toLowerCase().trim()
  const canCancel = estatusActual === 'próxima' || estatusActual === 'proxima'
  // El botón de check-in se muestra durante los últimos 5 min antes de la
  // hora de inicio (estatus 'Próxima') y durante el periodo de gracia.
  const canCheckIn = inEarlyCheckInWindow || estatusActual === 'en periodo de gracia'
  const canCheckOut = estatusActual === 'activa'

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-black">
        <p className="font-mono text-sm text-text-muted animate-pulse">Cargando reservación...</p>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center gap-6 bg-black px-4">
        <h1 className="font-heading text-2xl font-bold uppercase text-white">
          No se pudo cargar
        </h1>
        <p className="max-w-md text-center font-mono text-xs text-text-muted">
          {error || 'Reservación no encontrada.'}
        </p>
        <Link
          to="/mis-reservaciones"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#A100FF] px-6 font-heading text-[13px] font-semibold uppercase text-white hover:bg-[#b524ff]"
        >
          Volver
        </Link>
      </div>
    )
  }

  const tipo = reservation.EspacioTipo || 'Espacio'
  const identificador = reservation.EspacioNombre || `#${reservation.EspacioID}`
  const pisoZona = reservation.EspacioPisoNombre || 'Sin asignar'
  const fechaLabel = formatDateLong(reservation.Fecha)
  const horarioLabel = formatTimeRange(reservation.HoraInicio, reservation.HoraFin)
  const parkingLabel = reservation.EstacionamientoNombre
    || reservation.EstacionamientoAsignado?.Nombre
    || (reservation.Descripcion === 'Sin estacionamiento' ? 'Sin estacionamiento' : 'No asignado')
  const code = reservationCode(reservation.ReservacionID)

  // Grace period countdown
  const remainingMs = inGracePeriod && graceEndsAt ? graceEndsAt - now : 0
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60_000))
  const remainingSeconds = Math.max(0, Math.floor((remainingMs % 60_000) / 1000))

  // Pre-check-in countdown: tiempo restante hasta que se habilite el botón
  // (es decir, hasta que falten 5 min para el inicio).
  const preCheckInMs = inPreCheckInWindow && earlyCheckInAt ? earlyCheckInAt - now : 0
  const preCheckInMinutes = Math.max(0, Math.floor(preCheckInMs / 60_000))
  const preCheckInSeconds = Math.max(0, Math.floor((preCheckInMs % 60_000) / 1000))

  // Early check-in countdown: tiempo restante hasta la hora de inicio
  // (cuenta los últimos 5 minutos antes del periodo de gracia).
  const earlyMs = inEarlyCheckInWindow && startDate ? startDate - now : 0
  const earlyMinutes = Math.max(0, Math.floor(earlyMs / 60_000))
  const earlySeconds = Math.max(0, Math.floor((earlyMs % 60_000) / 1000))

  // Elapsed time desde el check-in.
  //   - Si la reserva está Activa y aún no termina: corre en vivo, capado al endDate.
  //   - Si ya fue Completada (manual o automáticamente): se congela en
  //     checkOutAt (si lo hay) o en endDate.
  const sessionShown = !!checkInAt && (isActiva || isCompleted)
  const elapsedEndPoint = !sessionShown
    ? null
    : (sessionEndAt ? sessionEndAt : (endDate && now > endDate ? endDate : now))
  const elapsedMs = sessionShown && checkInAt && elapsedEndPoint
    ? Math.max(0, elapsedEndPoint - checkInAt)
    : 0
  const elapsedHours = Math.floor(elapsedMs / 3_600_000)
  const elapsedMinutes = Math.floor((elapsedMs % 3_600_000) / 60_000)
  const elapsedSeconds = Math.floor((elapsedMs % 60_000) / 1000)
  const sessionFrozen = sessionShown && (isCompleted || !!checkOutAt || (endDate && now >= endDate))

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-black px-6 py-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/mis-reservaciones"
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[#200040] hover:text-white"
          >
            <span className="text-xl leading-none">←</span>
          </Link>
          <h1 className="font-heading text-[1.75rem] font-bold uppercase leading-none text-white sm:text-[2rem]">
            Detalle de reservación
          </h1>
        </div>

        {/* Body */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Pre-check-in: 10 → 5 min antes del inicio. Cuenta regresiva sin botón. */}
            {inPreCheckInWindow && (
              <section
                className="flex flex-col gap-3 rounded-xl border border-[#05f0a5] p-5"
                style={{ backgroundColor: 'rgba(5,240,165,0.12)' }}
              >
                <p className="font-mono text-[11px] font-semibold text-[#05f0a5]">
                  Check-in disponible pronto — Podrás registrarte cuando falten 5 minutos
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.20)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(preCheckInMinutes).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">min</span>
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#05f0a5]">:</span>
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.20)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(preCheckInSeconds).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">seg</span>
                  </div>
                </div>
              </section>
            )}

            {/* Últimos 5 min antes del inicio: check-in ya disponible. */}
            {inEarlyCheckInWindow && (
              <section
                className="flex flex-col gap-3 rounded-xl border border-[#05f0a5] p-5"
                style={{ backgroundColor: 'rgba(5,240,165,0.20)' }}
              >
                <p className="font-mono text-[11px] font-semibold text-[#05f0a5]">
                  Check-in disponible — Tu reservación inicia en breve
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(earlyMinutes).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">min</span>
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#05f0a5]">:</span>
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(earlySeconds).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">seg</span>
                  </div>
                </div>
              </section>
            )}

            {/* Sesión: corre en vivo mientras la reserva está Activa y no termina;
                se congela cuando hay check-out o cuando se alcanza la hora fin. */}
            {sessionShown && (
              <section
                className="flex flex-col gap-3 rounded-xl border border-[#05f0a5] p-5"
                style={{ backgroundColor: sessionFrozen ? 'rgba(5,240,165,0.10)' : 'rgba(5,240,165,0.20)' }}
              >
                <p className="font-mono text-[11px] font-semibold text-[#05f0a5]">
                  {sessionFrozen
                    ? '✓ Sesión finalizada — Tiempo total que estuviste activo'
                    : '✓ Check-in realizado — Sesión activa'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(elapsedHours).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">hr</span>
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#05f0a5]">:</span>
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(elapsedMinutes).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">min</span>
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#05f0a5]">:</span>
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(5,240,165,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(elapsedSeconds).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#05f0a5]">seg</span>
                  </div>
                </div>
              </section>
            )}

            {/* Grace period alert */}
            {inGracePeriod && (
              <section
                className="flex flex-col gap-3 rounded-xl border border-[#ff3246] p-5"
                style={{ backgroundColor: 'rgba(255,50,70,0.20)' }}
              >
                <p className="font-mono text-[11px] font-semibold text-[#ff3246]">
                  Periodo de gracia activo — Haz check-in antes de que se cancele tu reserva
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(255,50,70,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(remainingMinutes).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#ff3246]">min</span>
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#ff3246]">:</span>
                  <div
                    className="flex h-14 w-14 flex-col items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(255,50,70,0.33)' }}
                  >
                    <span className="font-heading text-2xl font-bold leading-none text-white">
                      {String(remainingSeconds).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-[#ff3246]">seg</span>
                  </div>
                </div>
              </section>
            )}

            {/* Detail card */}
            <section className="flex flex-col gap-4 rounded-xl bg-[#1a0033] p-6">
              <DetailRow label="Tipo:" value={tipo} />
              <DetailRow label="Identificador:" value={identificador} />
              <DetailRow label="Piso / Zona:" value={pisoZona} />
              <DetailRow label="Fecha:" value={fechaLabel} />
              <DetailRow label="Horario:" value={horarioLabel} />
              <DetailRow label="Estacionamiento:" value={parkingLabel} />
            </section>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-lg border-none px-8 font-heading text-base font-semibold uppercase text-[#ff3246] transition-colors hover:bg-[rgba(255,50,70,0.32)]"
                  style={{ backgroundColor: 'rgba(255,50,70,0.20)' }}
                >
                  Cancelar
                </button>
              )}
              {canCheckIn && (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-lg border border-[#05f0a5] px-8 font-heading text-base font-semibold uppercase text-[#05f0a5] transition-colors hover:bg-[rgba(5,240,165,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: 'rgba(5,240,165,0.20)' }}
                >
                  {checkingIn ? 'Registrando...' : 'Hacer Check-in'}
                </button>
              )}
              {canCheckOut && (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-lg border border-[#ff3246] px-8 font-heading text-base font-semibold uppercase text-[#ff3246] transition-colors hover:bg-[rgba(255,50,70,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: 'rgba(255,50,70,0.20)' }}
                >
                  {checkingOut ? 'Cerrando...' : 'Check-out'}
                </button>
              )}
            </div>
          </div>

          {/* Right column — QR */}
          <aside className="flex flex-col gap-4 rounded-xl bg-[#1a0033] p-6">
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-white p-3">
              <Qrgenerator 
                ReservacionID = {reservation.ReservacionID}
                EmpleadoID={reservation.EmpleadoID}
                size={240}/>
            </div>
            <p className="text-center font-mono text-xs font-semibold text-white">{code}</p>
            <p className="text-center font-mono text-[9px] leading-[1.5] text-text-muted">
              Presenta este código con un guardia para hacer check-in
            </p>
          </aside>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a0033] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <h2 className="font-heading text-2xl font-bold uppercase text-white">
              ¿Cancelar reservación?
            </h2>
            <p className="mt-4 font-mono text-xs leading-6 text-text-muted">
              Se cancelará la reservación de{' '}
              <span className="text-white">{identificador}</span> del{' '}
              <span className="text-white">{fechaLabel}</span>. Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border-none bg-[#200040] px-5 font-mono text-xs text-text-muted transition-colors hover:bg-[#2d0058] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border-none px-5 font-mono text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: '#ff3246' }}
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] text-text-muted">{label}</span>
      <span className="font-mono text-[11px] font-semibold text-white">{value}</span>
    </div>
  )
}
