import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getReservacionesByEmpleado } from '../../services/reservations'

const FILTERS = [
  { key: 'active', label: 'Activas' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'past', label: 'Pasadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

const GRACE_MINUTES = 11

const STATUS_STYLE = {
  active: {
    label: 'En periodo de grasa',
    text: '#05f0a5',
    bg: 'rgba(5,240,165,0.20)',
  },
  upcoming: {
    label: 'Confirmada',
    text: '#A100FF',
    bg: 'rgba(161,0,255,0.20)',
  },
  past: {
    label: 'Finalizada',
    text: '#96968c',
    bg: 'rgba(150,150,140,0.18)',
  },
  cancelled: {
    label: 'Cancelada',
    text: '#ff5c7a',
    bg: 'rgba(255,92,122,0.16)',
  },
}

function parseLocalDate(fecha) {
  if (!fecha) return null
  // Tomamos solo YYYY-MM-DD para evitar el desfase de zona horaria
  // que ocurre cuando MySQL devuelve la fecha como ISO en UTC.
  const dateOnly = String(fecha).slice(0, 10)
  const [y, m, d] = dateOnly.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function classifyReservation(r) {
  const estatusName = (r.EstatusNombre || '').toLowerCase()
  if (estatusName === 'cancelada') return 'cancelled'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const resDay = parseLocalDate(r.Fecha)
  if (!resDay) return 'past'

  if (resDay < today) return 'past'
  if (resDay > today) return 'upcoming'

  const [startH, startM] = (r.HoraInicio || '00:00').split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const graceEndMinutes = startMinutes + GRACE_MINUTES

  if (nowMinutes < startMinutes) return 'upcoming'
  if (nowMinutes < graceEndMinutes) return 'active'
  return 'past'
}

function formatDate(dateStr) {
  const d = parseLocalDate(dateStr)
  if (!d) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${day}/${months[d.getMonth()]}/${d.getFullYear()}`
}

function formatTime(start, end) {
  if (!start || !end) return '—'
  return `${start.slice(0, 5)} — ${end.slice(0, 5)}`
}

export default function MyReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('active')

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
      past: reservations.filter((r) => r.classification === 'past').length,
      cancelled: reservations.filter((r) => r.classification === 'cancelled').length,
    }),
    [reservations]
  )

  const filteredReservations = useMemo(
    () => reservations.filter((r) => r.classification === activeFilter),
    [activeFilter, reservations]
  )

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-64px)] bg-black flex items-center justify-center">
        <p className="font-mono text-sm text-text-muted animate-pulse">Cargando reservaciones...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-black px-6 py-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[2rem] font-bold uppercase leading-none text-white sm:text-[2.25rem]">
              Mis Reservaciones
            </h1>
          </div>

          <Link
            to="/reservar"
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#A100FF] px-6 font-heading text-[13px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#b524ff]"
          >
            Nueva reservación
          </Link>
        </div>

        {/* Tabs row */}
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`flex h-10 items-center gap-2 rounded-t-lg px-6 font-mono text-[11px] transition-colors ${
                  isActive
                    ? 'bg-[#1a0033] font-semibold text-white'
                    : 'bg-[#200040] font-normal text-text-muted hover:text-white'
                }`}
              >
                <span>
                  {filter.label} ({counts[filter.key]})
                </span>
              </button>
            )
          })}
        </div>

        {/* Content area */}
        {error ? (
          <section className="rounded-xl bg-[#1a0033] px-8 py-14">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <h2 className="font-heading text-2xl font-semibold uppercase text-white">
                Error
              </h2>
              <p className="mt-3 max-w-xl font-mono text-xs leading-6 text-text-muted">
                {error}
              </p>
              <button
                onClick={fetchReservations}
                className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-[#A100FF] px-6 font-heading text-[13px] font-semibold uppercase text-white hover:bg-[#b524ff]"
              >
                Reintentar
              </button>
            </div>
          </section>
        ) : filteredReservations.length === 0 ? (
          <section className="rounded-xl bg-[#1a0033] px-8 py-14">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <h2 className="font-heading text-2xl font-semibold uppercase text-white">
                No hay nada aquí
              </h2>
              <p className="mt-3 max-w-xl font-mono text-xs leading-6 text-text-muted">
                Aún no tienes reservaciones en esta categoría. Cuando confirmes
                una nueva, aparecerá listada en este espacio.
              </p>
              <Link
                to="/reservar"
                className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-[#A100FF] px-6 font-heading text-[13px] font-semibold uppercase text-white hover:bg-[#b524ff]"
              >
                Crear reservación
              </Link>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredReservations.map((reservation) => {
              const status = STATUS_STYLE[reservation.classification]

              return (
                <article
                  key={reservation.ReservacionID}
                  className="flex items-center gap-4 rounded-xl bg-[#1a0033] p-5"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="truncate font-heading text-base font-semibold text-white">
                        {reservation.EspacioNombre || `Espacio ${reservation.EspacioID}`}
                      </h2>
                      <span
                        className="rounded-xl px-3 py-1 font-mono text-[9px] font-semibold"
                        style={{ color: status.text, backgroundColor: status.bg }}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-text-muted">
                      <span>{formatDate(reservation.Fecha)}</span>
                      <span>{formatTime(reservation.HoraInicio, reservation.HoraFin)}</span>
                      {reservation.CajonNombre ? (
                        <span>{reservation.CajonNombre}</span>
                      ) : (
                        <span>{reservation.EmpleadoNombre || user?.name || '—'}</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      to={`/mis-reservaciones/${reservation.ReservacionID}`}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#A100FF] px-5 font-mono text-[10px] font-semibold text-white transition-colors hover:bg-[#b524ff]"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
