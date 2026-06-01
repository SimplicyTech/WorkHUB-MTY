import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getVisita, confirmarVisita, rechazarVisita } from '../../services/reservations'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fmtFecha(f) {
  if (!f) return '—'
  const [y, m, d] = String(f).slice(0, 10).split('-')
  return `${d} / ${MESES[parseInt(m, 10) - 1]} / ${y}`
}
function fmtHora(h) {
  return h ? String(h).slice(0, 5) : '—'
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#A100FF] text-sm shrink-0">{icon}</span>
      <span className="font-mono text-xs text-[#96968c]">{label}</span>
      <span className="font-mono text-xs text-white font-semibold">{value}</span>
    </div>
  )
}

export default function VisitaConfirmacionPage() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conCajon, setConCajon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resultado, setResultado] = useState(null) // 'confirmado' | 'rechazado'

  useEffect(() => {
    if (!token) {
      setError('Link inválido: falta el token.')
      setLoading(false)
      return
    }
    getVisita(token)
      .then((res) => {
        setData(res.data)
        setConCajon(Boolean(res.data?.RequiereEstacionamiento))
        if (Number(res.data?.Confirmada) === 1) setResultado('confirmado')
        if ((res.data?.EstatusNombre || '').toLowerCase() === 'cancelada') setResultado('rechazado')
      })
      .catch((err) => setError(err?.error || 'Invitación no encontrada o inválida.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleConfirmar = async () => {
    setSubmitting(true)
    try {
      const res = await confirmarVisita(token, conCajon)
      setData((d) => ({ ...d, EstacionamientoNombre: res.data?.EstacionamientoAsignado?.Nombre || d?.EstacionamientoNombre }))
      setResultado('confirmado')
    } catch (err) {
      setError(err?.error || 'No se pudo confirmar la asistencia.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRechazar = async () => {
    setSubmitting(true)
    try {
      await rechazarVisita(token)
      setResultado('rechazado')
    } catch (err) {
      setError(err?.error || 'No se pudo procesar tu respuesta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'linear-gradient(180deg, #000000 0%, #460073 100%)' }}
    >
      {/* Nav */}
      <div className="bg-black px-6 sm:px-12 py-3 flex items-center gap-2">
        <span className="font-mono text-sm text-white lowercase">accenture</span>
        <span className="font-mono text-sm text-[#A100FF]">//</span>
        <span className="font-heading text-sm text-white font-semibold">WORKHUB MTY</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-10">
        {loading ? (
          <p className="font-mono text-sm text-[#96968c] animate-pulse">Cargando invitación...</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="font-heading text-2xl font-bold text-white">Invitación no válida</h1>
            <p className="font-mono text-xs text-[#96968c] max-w-md">{error}</p>
          </div>
        ) : (
          <>
            {/* Encabezado */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: '#A100FF22', border: '2px solid #A100FF' }}
              >
                <svg className="w-9 h-9 text-[#A100FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h20v12H2z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white text-center m-0">
                {resultado === 'confirmado' ? '¡ASISTENCIA CONFIRMADA!' : resultado === 'rechazado' ? 'INVITACIÓN RECHAZADA' : 'HAS SIDO INVITADO'}
              </h1>
              <p className="font-mono text-[13px] text-[#96968c] text-center leading-[1.5] max-w-[600px] m-0">
                {resultado === 'confirmado'
                  ? `Tu lugar quedó reservado. Presenta el código RES-${String(data?.ReservacionID || '').padStart(6, '0')} con el guardia al llegar.`
                  : resultado === 'rechazado'
                    ? 'Avisaste que no podrás asistir. El espacio fue liberado. ¡Gracias por avisar!'
                    : `${data?.AnfitrionNombre || 'Tu anfitrión'} te ha invitado a visitar el ATC Monterrey de Accenture. Por favor confirma tu asistencia.`}
              </p>
            </div>

            {/* Card */}
            <div className="w-full max-w-[720px] rounded-2xl p-6 sm:p-8 flex flex-col gap-6" style={{ background: '#1a0033' }}>
              <span className="font-mono text-[10px] font-semibold text-[#A100FF]">// detalles_de_visita</span>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Detalles */}
                <div className="flex-1 flex flex-col gap-4">
                  <Row icon="👤" label="Anfitrión:" value={data?.AnfitrionNombre || '—'} />
                  <Row icon="📍" label="Ubicación:" value={`ATC Monterrey${data?.PisoNombre ? ` — ${data.PisoNombre}` : ''}`} />
                  <Row icon="📅" label="Fecha:" value={fmtFecha(data?.Fecha)} />
                  <Row icon="🕒" label="Horario:" value={`${fmtHora(data?.HoraInicio)} — ${fmtHora(data?.HoraFin)}`} />
                  {data?.Empresa && <Row icon="💼" label="Empresa:" value={data.Empresa} />}
                  {data?.EspacioNombre && <Row icon="🪑" label="Espacio:" value={data.EspacioNombre} />}
                </div>

                {/* Estacionamiento */}
                <div
                  className="w-full md:w-[240px] shrink-0 rounded-xl p-5 flex flex-col items-center justify-center gap-4"
                  style={{ background: '#0a0010' }}
                >
                  <svg className="w-8 h-8 text-[#05f0a5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17h14M6 17V9l1.5-3.5h9L18 9v8M7 17v2M17 17v2" />
                    <circle cx="8" cy="13" r="1" /><circle cx="16" cy="13" r="1" />
                  </svg>
                  <span className="font-heading text-sm font-semibold text-white text-center">¿Necesitas estacionamiento?</span>
                  {resultado === 'confirmado' ? (
                    <span className="font-mono text-[11px] text-[#05f0a5] font-semibold text-center">
                      {data?.EstacionamientoNombre ? `Cajón asignado: ${data.EstacionamientoNombre}` : conCajon ? 'Sin cajones disponibles' : 'No solicitaste cajón'}
                    </span>
                  ) : (
                    <>
                      <span className="font-mono text-[10px] text-[#96968c] text-center leading-[1.5]">
                        Si llegarás en auto, activa esta opción para reservar un cajón.
                      </span>
                      <button
                        type="button"
                        onClick={() => setConCajon((v) => !v)}
                        disabled={resultado === 'rechazado'}
                        className="flex items-center gap-3 cursor-pointer border-none bg-transparent"
                      >
                        <span
                          className="w-11 h-6 rounded-full flex items-center transition-colors px-0.5"
                          style={{ background: conCajon ? '#05f0a5' : '#33334a', justifyContent: conCajon ? 'flex-end' : 'flex-start' }}
                        >
                          <span className="w-5 h-5 rounded-full bg-white" />
                        </span>
                        <span className="font-mono text-[11px] font-semibold" style={{ color: conCajon ? '#05f0a5' : '#96968c' }}>
                          {conCajon ? 'Sí, necesito cajón' : 'No, gracias'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="h-px w-full" style={{ background: '#200040' }} />

              {/* Botones */}
              {resultado ? (
                <p className="font-mono text-xs text-[#96968c] text-center">
                  Ya registramos tu respuesta. Puedes cerrar esta ventana.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleConfirmar}
                    disabled={submitting}
                    className="h-12 px-10 rounded-lg flex items-center justify-center gap-2 font-heading text-sm font-semibold cursor-pointer border-none transition-opacity disabled:opacity-60"
                    style={{ background: '#05f0a5', color: '#000000' }}
                  >
                    {submitting ? 'Procesando...' : '✓ CONFIRMAR ASISTENCIA'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRechazar}
                    disabled={submitting}
                    className="h-12 px-10 rounded-lg flex items-center justify-center gap-2 font-heading text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-60"
                    style={{ background: '#200040', color: '#96968c', border: '1px solid #96968c44' }}
                  >
                    ✕ NO PODRÉ ASISTIR
                  </button>
                </div>
              )}
            </div>

            <p className="font-mono text-[13px] text-[#96968c] text-center leading-[1.5] max-w-[640px]">
              Si tienes dudas sobre esta visita, contacta a tu anfitrión.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
