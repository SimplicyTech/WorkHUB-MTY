import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { createReservacion, getReservacionesByEmpleado } from '../../services/reservations'
import Qrgenerator from '../../components/Confirmation/Qrgenerator'

function getDateKey(dateStr) {
  if (!dateStr) return null
  return String(dateStr).slice(0, 10)
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ]
  return `${d} / ${months[parseInt(m, 10) - 1]} / ${y}`
}

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const {
    deskId = 'D-304',
    espacioID,
    date,
    entryTime = '09:00',
    exitTime = '18:00',
    parking = true,
    reserveFor,
  } = location.state || {}

  const [reservationData, setReservationData] = useState(null)
  const [saving, setSaving] = useState(true)
  const [error, setError] = useState(null)
  const didSaveRef = useRef(false)

  const dateLabel = formatDateLabel(date)
  const timeLabel = `${entryTime} — ${exitTime}`

  useEffect(() => {
    if (didSaveRef.current) return
    didSaveRef.current = true

    async function save() {
      if (!espacioID || !user?.empleadoId) {
        setError('Datos de reservación incompletos. Vuelve a seleccionar un escritorio.')
        setSaving(false)
        return
      }

      try {
        const reservationsRes = await getReservacionesByEmpleado(user.empleadoId)
        const currentDateKey = getDateKey(date)
        const existingSameDay = (reservationsRes.data || []).some((r) => {
          const isSameDay = getDateKey(r.Fecha) === currentDateKey
          const isCancelled = (r.EstatusNombre || '').toLowerCase() === 'cancelada'
          return isSameDay && !isCancelled
        })

        if (existingSameDay) {
          setError('Ya tienes una reservación el mismo día. Solo se permite una reservación por día.')
          setSaving(false)
          return
        }

        // El backend ya hace auto-asignación de estacionamiento
        const res = await createReservacion({
          EmpleadoID: user.empleadoId,
          EspacioID: espacioID,
          Fecha: date,
          HoraInicio: entryTime,
          HoraFin: exitTime,
          Descripcion: parking ? 'Con estacionamiento' : 'Sin estacionamiento',
        })

        setReservationData(res.data)
        setSaving(false)
      } catch (err) {
        // Verificar si es un error de reservación solapada
        if (err?.reservacionExistente) {
          const { reservacionExistente } = err
          setError(`Ya tienes una reservación para el ${reservacionExistente.Fecha} de ${reservacionExistente.HoraInicio} a ${reservacionExistente.HoraFin}`)
        } else {
          setError(err?.error || 'Error al crear la reservación')
        }
        setSaving(false)
      }
    }

    save()
  }, [espacioID, user?.empleadoId, date, entryTime, exitTime, parking])

  const reservationId = reservationData?.ReservacionID
    ? `RES-${String(reservationData.ReservacionID).padStart(6, '0')}`
    : '—'

  const parkingDescription = reservationData?.Descripcion === 'Con estacionamiento'
    ? 'Estacionamiento asignado'
    : reservationData?.Descripcion

  const parkingLabel = reservationData?.EstacionamientoAsignado?.Nombre
    || reservationData?.EstacionamientoAsignado?.Etiqueta
    || reservationData?.CajonNombre
    || reservationData?.EstacionamientoAsignado?.Codigo
    || reservationData?.EstacionamientoAsignado?.Ubicacion
    || reservationData?.EstacionamientoAsignado?.Piso
    || parkingDescription
    || (parking ? 'No disponible' : 'No solicitado')

  const detailRows = [
    { label: 'Escritorio:', value: deskId },
    { label: 'Piso / Zona:', value: 'Piso 3 — Área General' },
    { label: 'Fecha:', value: dateLabel },
    { label: 'Horario:', value: timeLabel },
    {
      label: 'Estacionamiento:',
      value: parkingLabel,
    },
  ]

  if (error) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center gap-6 px-4"
        style={{ background: 'linear-gradient(180deg, #000000 0%, #460073 100%)' }}
      >
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white text-center">
          Error al confirmar
        </h1>
        <p className="font-mono text-xs text-text-muted text-center max-w-md">{error}</p>
        <button
          onClick={() => navigate('/reservar')}
          className="h-12 px-8 rounded-lg bg-primary font-heading text-sm font-semibold text-white cursor-pointer border-none hover:bg-primary-dark transition-colors"
        >
          VOLVER A RESERVAR
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* Progress Bar — all steps completed */}
      <div className="bg-surface-card px-4 sm:px-6 md:px-12 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="font-mono text-[11px] text-accent font-semibold">
          Escritorio reservado
        </span>
        <span className="text-text-muted text-sm">›</span>
        <span className="font-mono text-[11px] text-accent font-semibold">
          Estacionamiento
        </span>
        <span className="text-text-muted text-sm">›</span>
        <span className="font-mono text-[11px] text-accent font-semibold">
          Confirmación
        </span>
      </div>

      {/* Main Content with gradient background */}
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center gap-8 px-4 sm:px-6 py-10 md:px-12"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #460073 100%)',
        }}
      >
        {/* Spacer to push content to center when there's room */}
        <div className="flex-1" />

        {saving ? (
          <p className="font-mono text-sm text-text-muted animate-pulse">Creando reservación...</p>
        ) : (
          <>
            {/* Title */}
            <div className="flex flex-col items-center gap-3 animate-[fadeUp_0.6s_ease-out]">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white m-0 text-center">
                ¡RESERVACIÓN CONFIRMADA!
              </h1>
              <p className="font-mono text-xs text-text-muted leading-[1.5] text-center max-w-[600px] m-0">
                Tu espacio ha sido reservado exitosamente. A continuación el resumen
                de tu reservación.
              </p>
            </div>

            {/* Summary Card */}
            <div className="w-full max-w-[800px] rounded-lg bg-surface-card p-5 sm:p-8 flex flex-col gap-6 animate-[fadeUp_0.8s_ease-out]">
              {/* Two-column layout: Details + QR */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Detail Column */}
                <div className="flex-1 flex flex-col gap-4">
                  {detailRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[minmax(95px,auto)_1fr] items-center gap-2"
                    >
                      <span className="font-mono text-xs text-text-muted">
                        {row.label}
                      </span>
                      <span className="font-mono text-xs text-white font-semibold min-w-0 break-words">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* QR Column */}
                <div className="flex flex-col items-center justify-center gap-4 w-full md:w-[220px] shrink-0 p-4">
                  {/* QR Code */}
                  <div className="w-[180px] h-[180px] rounded-lg bg-white flex items-center justify-center p-3">
                    <Qrgenerator
                    ReservacionID = {reservationData?.ReservacionID}
                    EmpleadoID={user?.empleadoId}
                    size={160}/>
                  </div>
                  <span className="font-mono text-[10px] text-text-muted text-center">
                    Código QR de acceso
                  </span>
                  <span className="font-mono text-xs text-primary font-semibold">
                    {reservationId}
                  </span>
                  <span className="font-mono text-[8px] text-text-muted text-center leading-[1.5]">
                    Presenta este código en tu escritorio para hacer check-in
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-surface-badge w-full" />

              {/* Button Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/mis-reservaciones')}
                  className="flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-primary font-heading text-sm font-semibold text-white cursor-pointer border-none hover:bg-primary-dark transition-colors"
                >
                  VER MIS RESERVACIONES
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-surface-badge font-heading text-sm font-semibold text-text-muted cursor-pointer border-none hover:bg-surface-badge/80 transition-colors"
                >
                  IR AL INICIO
                </button>
              </div>
            </div>
          </>
        )}

        {/* Spacer to balance vertical centering */}
        <div className="flex-1" />
      </div>

    </div>
  )
}
