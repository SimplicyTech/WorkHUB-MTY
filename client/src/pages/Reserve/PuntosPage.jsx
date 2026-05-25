import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEmpleadoTransacciones } from '../../services/reservations'
import { useAuth } from '../../context/useAuth'

const RANGO_COLORS = {
  Bronce:  { fg: '#CD7F32', bg: 'rgba(205,127,50,0.18)', border: 'rgba(205,127,50,0.55)' },
  Plata:   { fg: '#C0C0C0', bg: 'rgba(192,192,192,0.16)', border: 'rgba(192,192,192,0.55)' },
  Oro:     { fg: '#FFD700', bg: 'rgba(255,215,0,0.16)',   border: 'rgba(255,215,0,0.55)' },
  Platino: { fg: '#B9F2FF', bg: 'rgba(185,242,255,0.16)', border: 'rgba(185,242,255,0.55)' },
}

const REGLAS = [
  {
    titulo: 'Check-in a tiempo',
    delta: +10,
    desc: 'Cada vez que llegas y registras tu entrada dentro del periodo de gracia.',
  },
  {
    titulo: 'Check-out',
    delta: +5,
    desc: 'Al cerrar tu sesión manualmente cuando terminas de usar tu espacio.',
  },
  {
    titulo: 'No-show',
    delta: -25,
    desc: 'Si tu reservación llega al final del periodo de gracia sin que hagas check-in, el espacio se libera y se descuenta este monto.',
  },
  {
    titulo: 'Cancelación',
    delta: -10,
    desc: 'Tienes 1 cancelación gratis por semana. A partir de la segunda cancelación dentro de la misma semana, se descuentan 10 puntos por cada una.',
  },
  {
    titulo: 'Bonus quincenal',
    delta: +40,
    desc: 'Cada 15 días, si completaste al menos 5 reservaciones con check-in y check-out correctos, y no acumulaste no-shows ni cancelaciones penalizadas en ese periodo, recibes este bonus automáticamente.',
  },
]

function formatDateLong(s) {
  if (!s) return '—'
  const [datePart, timePart] = String(s).replace('T', ' ').split(' ')
  const [y, m, d] = datePart.split('-').map(Number)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const date = `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
  if (!timePart) return date
  return `${date} · ${timePart.slice(0, 5)}`
}

function RangoBadge({ nombre }) {
  if (!nombre) return null
  const c = RANGO_COLORS[nombre] || RANGO_COLORS.Bronce
  return (
    <span
      className="font-mono text-[10px] font-semibold uppercase tracking-wide px-2 py-[3px] rounded-md border"
      style={{ color: c.fg, backgroundColor: c.bg, borderColor: c.border }}
    >
      {nombre}
    </span>
  )
}

export default function PuntosPage() {
  const { user } = useAuth()
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.empleadoId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getEmpleadoTransacciones(user.empleadoId)
      .then((res) => {
        if (cancelled) return
        setInfo(res.data || null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.error || 'Error al cargar puntos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.empleadoId])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-black">
        <p className="font-mono text-sm text-text-muted animate-pulse">Cargando puntos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center gap-4 bg-black px-4">
        <h1 className="font-heading text-2xl font-bold uppercase text-white">No se pudo cargar</h1>
        <p className="max-w-md text-center font-mono text-xs text-text-muted">{error}</p>
        <Link
          to="/mis-reservaciones"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#A100FF] px-6 font-heading text-[13px] font-semibold uppercase text-white hover:bg-[#b524ff]"
        >
          Volver
        </Link>
      </div>
    )
  }

  const puntos = Number(info?.Puntos || 0)
  const rango = info?.Rango || 'Bronce'
  const diasActuales = Number(info?.DiasAnticipacion || 1)
  const siguiente = info?.SiguienteRango || null
  const transacciones = info?.Transacciones || []

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-black px-6 py-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[1.75rem] font-bold uppercase leading-none text-white sm:text-[2rem]">
            Mis Puntos
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            Sistema de gamificación — Gana puntos para subir de rango y reservar con más anticipación.
          </p>
        </div>

        {/* Summary card */}
        <section className="rounded-xl bg-[#1a0033] p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase text-text-muted">Saldo actual</span>
              <span className="font-heading text-4xl font-bold text-white leading-none">
                {puntos}
                <span className="ml-2 font-mono text-xs font-normal text-text-muted">pts</span>
              </span>
            </div>
            <div className="h-12 w-px bg-surface-badge" />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase text-text-muted">Rango</span>
              <div className="flex items-center gap-2">
                <RangoBadge nombre={rango} />
                <span className="font-mono text-[11px] text-white">
                  {diasActuales} día{diasActuales === 1 ? '' : 's'} de anticipación
                </span>
              </div>
            </div>
          </div>
          {siguiente ? (
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="font-mono text-[10px] uppercase text-text-muted">Próximo rango</span>
              <div className="flex items-center gap-2">
                <RangoBadge nombre={siguiente.Nombre} />
                <span className="font-mono text-[11px] text-white">
                  Te faltan <span className="text-accent">{siguiente.PuntosFaltantes} pts</span>
                </span>
              </div>
            </div>
          ) : (
            <span className="font-mono text-[11px] text-accent">¡Estás en el rango máximo!</span>
          )}
        </section>

        {/* Reglas */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold uppercase text-white">¿Cómo ganas o pierdes puntos?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {REGLAS.map((r) => {
              const positive = r.delta > 0
              const color = positive ? '#05f0a5' : '#ff3246'
              const bg = positive ? 'rgba(5,240,165,0.08)' : 'rgba(255,50,70,0.08)'
              const border = positive ? 'rgba(5,240,165,0.35)' : 'rgba(255,50,70,0.35)'
              return (
                <div
                  key={r.titulo}
                  className="rounded-xl border p-4 flex flex-col gap-2"
                  style={{ backgroundColor: bg, borderColor: border }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[12px] font-semibold text-white">{r.titulo}</span>
                    <span
                      className="font-heading text-base font-bold"
                      style={{ color }}
                    >
                      {positive ? '+' : ''}{r.delta} pts
                    </span>
                  </div>
                  <p className="font-mono text-[11px] leading-[1.6] text-text-muted">{r.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Historial */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-bold uppercase text-white">Historial de movimientos</h2>
          {transacciones.length === 0 ? (
            <div className="rounded-xl bg-[#1a0033] p-8 text-center">
              <p className="font-mono text-[12px] text-text-muted">
                Aún no tienes movimientos de puntos. Empieza haciendo check-in a tus próximas reservaciones.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-[#1a0033] overflow-hidden">
              <ul className="flex flex-col">
                {transacciones.map((t, idx) => {
                  const cantidad = Number(t.Cantidad)
                  const positive = cantidad >= 0
                  const color = positive ? '#05f0a5' : '#ff3246'
                  return (
                    <li
                      key={t.TransaccionID}
                      className={`flex items-center justify-between gap-4 px-5 py-4 ${
                        idx > 0 ? 'border-t border-surface-badge' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="font-mono text-[12px] font-semibold text-white truncate">
                          {t.Motivo || 'Movimiento'}
                        </span>
                        <span className="font-mono text-[10px] text-text-muted">
                          {formatDateLong(t.Fecha)}
                          {t.ReservacionID ? ` · Reserva RES-${String(t.ReservacionID).padStart(6, '0')}` : ''}
                        </span>
                      </div>
                      <span
                        className="font-heading text-base font-bold whitespace-nowrap"
                        style={{ color }}
                      >
                        {positive ? '+' : ''}{cantidad} pts
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
