import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { createReservacionVisitante } from '../../services/reservations'

function formatDateLabel(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = String(dateStr).slice(0, 10).split('-')
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d} / ${months[parseInt(m, 10) - 1]} / ${y}`
}

export default function InvitacionEnviadaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const { espacioID, date, entryTime = '09:00', exitTime = '18:00', visitor = {} } = location.state || {}

  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const didSaveRef = useRef(false)

  useEffect(() => {
    if (didSaveRef.current) return
    didSaveRef.current = true

    async function save() {
      if (!espacioID || !user?.empleadoId || !visitor?.nombre || !visitor?.correo) {
        setError('Datos incompletos. Vuelve a iniciar la invitación.')
        setSaving(false)
        return
      }
      try {
        const res = await createReservacionVisitante({
          NombreVisitante: visitor.nombre,
          CorreoVisitante: visitor.correo,
          Empresa: visitor.empresa || null,
          EspacioID: espacioID,
          Fecha: date,
          HoraInicio: entryTime,
          HoraFin: exitTime,
        })
        setData(res.data)
        setSaving(false)
      } catch (err) {
        setError(err?.error || 'No se pudo enviar la invitación')
        setSaving(false)
      }
    }
    save()
  }, [espacioID, user?.empleadoId, date, entryTime, exitTime, visitor])

  const copyLink = async () => {
    if (!data?.Link) return
    try {
      await navigator.clipboard.writeText(data.Link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard no disponible */
    }
  }

  if (error) {
    return (
      <div
        className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center gap-6 px-4"
        style={{ background: 'linear-gradient(180deg, #000000 0%, #460073 100%)' }}
      >
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white text-center">
          No se pudo enviar la invitación
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
    <div
      className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center gap-8 px-4 py-10"
      style={{ background: 'linear-gradient(180deg, #000000 0%, #460073 100%)' }}
    >
      {saving ? (
        <p className="font-mono text-sm text-text-muted animate-pulse">Enviando invitación...</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3 animate-[fadeUp_0.6s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h20v12H2z" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white text-center m-0">
              ¡INVITACIÓN ENVIADA!
            </h1>
            <p className="font-mono text-xs text-text-muted text-center max-w-[600px] m-0 leading-[1.6]">
              Se apartó el espacio para <span className="text-white">{visitor.nombre}</span> el {formatDateLabel(date)} de {entryTime} a {exitTime}.{' '}
              {data?.CorreoEnviado
                ? <>Le enviamos un correo a <span className="text-white">{data.CorreoVisitante}</span> para confirmar su asistencia. Si no le llega, comparte el link de abajo.</>
                : 'Comparte el siguiente link con el visitante para que confirme su asistencia.'}
            </p>
          </div>

          {/* Stub: mientras no hay envío de correo, mostramos el link directo */}
          <div className="w-full max-w-[640px] rounded-lg bg-surface-card p-5 sm:p-6 flex flex-col gap-3 animate-[fadeUp_0.8s_ease-out]">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wide">
              {data?.CorreoEnviado ? 'Link directo (por si lo necesitas)' : 'Link de confirmación — compártelo con el visitante'}
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={data?.Link || ''}
                className="flex-1 h-10 rounded-md bg-surface-badge px-3 font-mono text-[11px] text-white border-none outline-none"
              />
              <button
                onClick={copyLink}
                className="h-10 px-4 rounded-md bg-primary font-mono text-xs font-semibold text-white cursor-pointer border-none hover:bg-primary-dark transition-colors shrink-0"
              >
                {copied ? 'Copiado ✓' : 'Copiar link'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate('/mis-reservaciones')}
              className="h-12 px-8 rounded-lg bg-primary font-heading text-sm font-semibold text-white cursor-pointer border-none hover:bg-primary-dark transition-colors"
            >
              VER MIS RESERVACIONES
            </button>
            <button
              onClick={() => navigate('/')}
              className="h-12 px-8 rounded-lg bg-surface-badge font-heading text-sm font-semibold text-text-muted cursor-pointer border-none hover:bg-surface-badge/80 transition-colors"
            >
              IR AL INICIO
            </button>
          </div>
        </>
      )}
    </div>
  )
}
