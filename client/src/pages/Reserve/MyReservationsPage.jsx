import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getReservacionesByEmpleado, cancelReservacion } from '../../services/reservations'

const FILTERS = [
  { key: 'active', label: 'Activas' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'cancelled', label: 'Canceladas' },
  { key: 'past', label: 'Pasadas' },
]

function classifyReservation(r) {
  const estatusName = (r.EstatusNombre || '').toLowerCase()
  if (estatusName === 'cancelada') return 'cancelled'

  const now = new Date()
  const reservationDate = new Date(r.Fecha)
  // Normalize to compare just dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const resDay = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate())

  if (resDay < today) return 'past'
  if (resDay > today) return 'upcoming'

  // Same day — check time
  const [endH, endM] = (r.HoraFin || '18:00').split(':').map(Number)
  const endMinutes = endH * 60 + endM
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (nowMinutes > endMinutes) return 'past'
  return 'active'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${day}/${months[d.getMonth()]}/${d.getFullYear()}`
}

function formatTime(start, end) {
  if (!start || !end) return '—'
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`
}

export default function MyReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('active')
  const [reservationToCancel, setReservationToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const fetchReservations = useCallback(async () => {
    if (!user?.empleadoId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getReservacionesByEmpleado(user.empleadoId)
      setReservations(
        (res.data || []).map((r) => ({
          ...r,
          classification: classifyReservation(r),
        }))
      )
    } catch (err) {
      console.error('Error fetching reservations:', err)
      setError(err?.error || 'Error al obtener reservaciones')
    } finally {
      setLoading(false)
    }
  }, [user?.empleadoId])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const counts = useMemo(
    () => ({
      active: reservations.filter((r) => r.classification === 'active').length,
      upcoming: reservations.filter((r) => r.classification === 'upcoming').length,
      cancelled: reservations.filter((r) => r.classification === 'cancelled').length,
      past: reservations.filter((r) => r.classification === 'past').length,
    }),
    [reservations]
  )

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.classification === activeFilter)
  }, [activeFilter, reservations])

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return
    setCancelling(true)
    try {
      await cancelReservacion(reservationToCancel.ReservacionID)
      // Re-fetch from backend to get updated data
      await fetchReservations()
    } catch (err) {
      console.error('Error cancelling:', err)
      alert(err?.error || 'Error al cancelar la reservación')
    } finally {
      setCancelling(false)
      setReservationToCancel(null)
      setActiveFilter('active')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-64px)] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="text-4xl">📋</span>
          <p className="font-mono text-sm text-text-muted">Cargando reservaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-black px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] text-primary">
              // mis_reservaciones
            </span>
            <h1 className="mt-3 font-heading text-[2.9rem] font-bold uppercase tracking-[0.01em] text-white sm:text-[3.25rem] lg:text-[3.6rem]">
              Mis reservaciones
            </h1>
          </div>

          <Link
            to="/reservar"
            className="inline-flex h-10 items-center justify-center gap-2.5 self-start rounded-xl bg-[linear-gradient(90deg,#a100ff_0%,#d31cff_100%)] px-5 font-heading text-[0.95rem] font-semibold uppercase text-white shadow-[0_18px_40px_rgba(161,0,255,0.22)] transition-transform hover:scale-[1.01]"
          >
            <span className="text-lg leading-none">⊞</span>
            Nueva reservación
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`min-w-[112px] rounded-t-xl px-5 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[#2b0650] text-white'
                    : 'bg-[#240542] text-text-muted hover:text-white'
                }`}
              >
                <span className="font-mono text-[12px] sm:text-[13px]">
                  {filter.label} ({counts[filter.key]})
                </span>
              </button>
            )
          })}
        </div>

        {error ? (
          <section className="rounded-[22px] border border-[#2b0a43] bg-[#180126] px-8 py-14 sm:px-12">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#25033d] text-4xl text-[#ff3246]">
                ⚠
              </div>
              <h2 className="mt-6 font-heading text-3xl font-semibold uppercase text-white">
                Error
              </h2>
              <p className="mt-4 max-w-xl font-mono text-xs leading-6 text-text-muted">
                {error}
              </p>
              <button
                onClick={fetchReservations}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-[linear-gradient(90deg,#a100ff_0%,#d31cff_100%)] px-6 font-heading text-base font-semibold uppercase text-white"
              >
                Reintentar
              </button>
            </div>
          </section>
        ) : filteredReservations.length === 0 ? (
          <section className="rounded-[22px] border border-[#2b0a43] bg-[#180126] px-8 py-14 sm:px-12">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#25033d] text-4xl text-primary">
                ⌁
              </div>
              <h2 className="mt-6 font-heading text-3xl font-semibold uppercase text-white">
                No hay nada aquí
              </h2>
              <p className="mt-4 max-w-xl font-mono text-xs leading-6 text-text-muted">
                Aún no tienes reservaciones en esta categoría. Cuando confirmes
                una nueva, aparecerá listada en este espacio.
              </p>
              <Link
                to="/reservar"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-[linear-gradient(90deg,#a100ff_0%,#d31cff_100%)] px-6 font-heading text-base font-semibold uppercase text-white"
              >
                Crear reservación
              </Link>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-4 pt-8">
            {filteredReservations.map((reservation) => (
              <article
                key={reservation.ReservacionID}
                className="flex flex-col gap-4 rounded-[18px] bg-[#1e0431] px-5 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.2)] sm:px-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] bg-[#290744] text-[1.6rem] text-primary">
                    ⌨
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-heading text-[1.75rem] font-semibold leading-none text-white sm:text-[1.95rem]">
                        {reservation.EspacioNombre || `Espacio ${reservation.EspacioID}`}
                      </h2>
                      {reservation.EstatusNombre && (
                        <span className="rounded-full bg-[#6c3600] px-2.5 py-1 font-mono text-[10px] text-[#ffb44c]">
                          {reservation.EstatusNombre}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[12px] sm:text-[13px] text-text-muted">
                      <span>{`📅 ${formatDate(reservation.Fecha)}`}</span>
                      <span>{`◔ ${formatTime(reservation.HoraInicio, reservation.HoraFin)}`}</span>
                      <span>{`👤 ${reservation.EmpleadoNombre || user?.name || '—'}`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {reservation.classification === 'cancelled' ? (
                    <span className="inline-flex h-8 items-center justify-center rounded-full bg-[#3a0857] px-4 font-mono text-[12px] text-primary">
                      Cancelada
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReservationToCancel(reservation)}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-[#6a1cb2] bg-[#2a0743] px-5 font-mono text-[12px] text-white transition-colors hover:bg-[#36095a]"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {reservationToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-[24px] border border-[#4a1475] bg-[#12031d] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Confirmar acción
            </span>
            <h2 className="mt-4 font-heading text-3xl font-semibold uppercase text-white">
              ¿Cancelar reservación?
            </h2>
            <p className="mt-4 font-mono text-xs leading-6 text-text-muted">
              Esta acción cancelará la reservación del espacio{' '}
              <span className="text-white">
                {reservationToCancel.EspacioNombre || `Espacio ${reservationToCancel.EspacioID}`}
              </span>{' '}
              del{' '}
              <span className="text-white">
                {formatDate(reservationToCancel.Fecha)}
              </span>.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReservationToCancel(null)}
                disabled={cancelling}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#241130] px-5 font-mono text-sm text-text-muted transition-colors hover:bg-[#2e163d] hover:text-white"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelReservation}
                disabled={cancelling}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[linear-gradient(90deg,#a100ff_0%,#d31cff_100%)] px-5 font-mono text-sm text-white"
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
