import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { saveReservation } from '../../services/reservations'

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const deskId = location.state?.deskId || 'D-304'
  const parking = location.state?.parking ?? true

  // Generate a mock reservation ID
  const reservationId = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const seq = deskId.replace(/\D/g, '').slice(-2).padStart(2, '0')
    return `RES-${y}${m}${d}${seq}`
  }, [deskId])

  const detailRows = [
    { icon: '🖥️', label: 'Escritorio:', value: deskId },
    { icon: '📍', label: 'Piso / Zona:', value: 'Piso 3 — Área General' },
    { icon: '📅', label: 'Fecha:', value: '27 / Feb / 2026' },
    { icon: '⏱', label: 'Horario:', value: '09:00 — 17:00' },
    {
      icon: '🚗',
      label: 'Estacionamiento:',
      value: parking ? 'Nivel B1' : 'No solicitado',
    },
  ]

  useEffect(() => {
    saveReservation({
      id: reservationId,
      deskId,
      parking,
      parkingLabel: parking ? 'Nivel B1' : 'No solicitado',
      zoneLabel: 'Piso 3 - Area General',
      dateLabel: '27 / Feb / 2026',
      timeLabel: '09:00 - 17:00',
      createdAt: new Date().toISOString(),
    })
  }, [deskId, parking, reservationId])

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* Progress Bar — all steps completed */}
      <div className="bg-surface-card px-4 sm:px-6 md:px-12 py-3 flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm">✓</span>
          <span className="font-mono text-[11px] text-accent font-semibold">
            Escritorio reservado
          </span>
        </div>
        <span className="text-text-muted text-sm">›</span>
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm">✓</span>
          <span className="font-mono text-[11px] text-accent font-semibold">
            Estacionamiento
          </span>
        </div>
        <span className="text-text-muted text-sm">›</span>
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm">✓</span>
          <span className="font-mono text-[11px] text-accent font-semibold">
            Confirmación
          </span>
        </div>
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

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center shrink-0 animate-[fadeScaleIn_0.5s_ease-out]">
          <span className="text-accent text-4xl">✓</span>
        </div>

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
              <span className="font-mono text-[10px] text-primary font-semibold">
                
              </span>

              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[20px_minmax(95px,auto)_1fr] items-center gap-2"
                >
                  <span className="text-primary text-sm w-5 shrink-0 text-center">
                    {row.icon}
                  </span>
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
              {/* QR Code placeholder */}
              <div className="w-[180px] h-[180px] rounded-lg bg-white flex items-center justify-center p-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${reservationId}&bgcolor=FFFFFF&color=000000`}
                  alt="QR Code de acceso"
                  className="w-full h-full object-contain"
                />
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

        {/* Spacer to balance vertical centering */}
        <div className="flex-1" />
      </div>

      {/* Chatbot FAB */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[52px] h-[52px] rounded-full bg-primary flex items-center justify-center cursor-pointer border-none shadow-[0_4px_20px_rgba(161,0,255,0.4)] hover:shadow-[0_4px_30px_rgba(161,0,255,0.6)] transition-shadow z-50"
        aria-label="Chatbot"
      >
        <span className="text-white text-xl">💬</span>
      </button>
    </div>
  )
}
