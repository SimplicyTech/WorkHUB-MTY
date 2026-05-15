import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getReservacionById, cancelReservacion, checkOutReservacion } from '../../services/reservations'
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

export default function ReservationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  const [now, setNow] = useState(() => new Date())

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

  // El estatus del backend manda. Solo mostramos el contador de gracia
  // si la BD dice 'En periodo de gracia' (y aún queda tiempo en el reloj
  // local, para que el countdown no muestre negativos si el reloj se desfasó).
  const inGracePeriod = !!(
    estatusNombreLower === 'en periodo de gracia' &&
    startDate &&
    graceEndsAt &&
    now < graceEndsAt
  )

  useEffect(() => {
    if (!inGracePeriod) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [inGracePeriod])

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

  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      await checkOutReservacion(reservation.ReservacionID)
      navigate('/mis-reservaciones', { replace: true })
    } catch (err) {
      alert(err?.error || 'Error al hacer check-out')
      setCheckingOut(false)
    }
  }

  // Reglas de visibilidad de los botones, derivadas del estatus del backend:
  //   - Cancelar: solo si la reservación está 'Próxima'
  //   - Check-out: solo si la reservación está 'Activa' (hubo check-in)
  const estatusActual = (reservation?.EstatusNombre || '').toLowerCase().trim()
  const canCancel = estatusActual === 'próxima' || estatusActual === 'proxima'
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
              {canCheckOut && (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-lg border-none px-8 font-heading text-base font-semibold uppercase text-[#05f0a5] transition-colors hover:bg-[rgba(5,240,165,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: 'rgba(5,240,165,0.20)' }}
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
