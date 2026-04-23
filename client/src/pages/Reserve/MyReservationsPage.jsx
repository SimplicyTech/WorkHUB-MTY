import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getReservations } from '../../services/reservations'

function formatReservationDate(date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export default function MyReservationsPage() {
  const reservations = useMemo(() => getReservations(), [])

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#05010a] px-4 py-8 sm:px-6 md:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-[#2a1340] bg-[linear-gradient(135deg,#12031d_0%,#22043a_55%,#0a0812_100%)] p-6 sm:p-8">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Historial
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            Mis reservaciones
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-xs leading-6 text-text-muted">
            Consulta los espacios que has confirmado y revisa rápidamente sus
            detalles.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#35214a] bg-surface-card px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-3xl text-primary">
              📭
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold text-white">
              No hay reservaciones
            </h2>
            <p className="mt-3 max-w-md font-mono text-xs leading-6 text-text-muted">
              Cuando confirmes una reservación aparecerá aquí para que puedas
              consultarla cuando quieras.
            </p>
            <Link
              to="/reservar"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Hacer una reservación
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="rounded-2xl border border-[#2a1340] bg-surface-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-heading text-xl font-semibold text-white">
                        {reservation.deskId}
                      </span>
                      <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        Confirmada
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-text-muted">
                      ID: {reservation.id}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[420px]">
                    <div className="rounded-xl bg-[#120a1d] p-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        Fecha
                      </span>
                      <p className="mt-2 font-heading text-lg text-white">
                        {reservation.dateLabel ||
                          formatReservationDate(reservation.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#120a1d] p-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        Horario
                      </span>
                      <p className="mt-2 font-heading text-lg text-white">
                        {reservation.timeLabel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#120a1d] p-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        Ubicación
                      </span>
                      <p className="mt-2 font-heading text-lg text-white">
                        {reservation.zoneLabel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#120a1d] p-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        Estacionamiento
                      </span>
                      <p className="mt-2 font-heading text-lg text-white">
                        {reservation.parkingLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
