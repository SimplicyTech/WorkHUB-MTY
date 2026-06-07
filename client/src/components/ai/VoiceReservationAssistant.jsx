import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cancelAiReservation,
  confirmAiReservation,
  listMyAiReservations,
  processAiReservationText,
  proposeAiReservation,
} from '../../services/ai'
import { useGeminiLive } from '../../hooks/useGeminiLive'

const SUGGESTIONS = [
  'Reservar un escritorio para hoy',
  'Quiero un lugar mañana en la mañana',
  'Necesito estacionamiento',
]

function nowTime() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`)
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

const Icon = ({ path, size = 16, className = '', strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {path}
  </svg>
)

const BotIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect width="18" height="10" x="3" y="11" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" x2="8" y1="16" y2="16" />
        <line x1="16" x2="16" y1="16" y2="16" />
      </>
    }
  />
)

const CloseIcon = (props) => (
  <Icon {...props} path={<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>} />
)

const MicIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </>
    }
  />
)

const SendIcon = (props) => (
  <Icon {...props} path={<><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>} />
)

export default function VoiceReservationAssistant() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hola. Soy el asistente de WorkHub MTY. En que puedo ayudarte hoy?',
      time: nowTime(),
    },
  ])
  const [text, setText] = useState('')
  const [proposal, setProposal] = useState(null)
  const [reservationId, setReservationId] = useState(null)
  const [liveStatus, setLiveStatus] = useState('idle') // idle | connecting | live | error
  const [userPartial, setUserPartial] = useState('')
  const [botPartial, setBotPartial] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [mobileTyping, setMobileTyping] = useState(false) // en cel: false = voz, true = teclado

  const proposalRef = useRef(null)
  const scrollRef = useRef(null)

  const pushMessage = useCallback((role, message, isError = false) => {
    if (!message) return
    setMessages((current) => [...current.slice(-99), { role, text: message, time: nowTime(), isError }])
  }, [])

  // Mensaje del path de TEXTO: solo se muestra (sin voz; la voz va por modo Live).
  const addMessage = useCallback((role, message, isError = false) => {
    pushMessage(role, message, isError)
  }, [pushMessage])

  const setCurrentProposal = useCallback((data) => {
    const next = data || null
    proposalRef.current = next
    setProposal(next)
  }, [])

  const sendPrompt = useCallback(async (prompt) => {
    const value = String(prompt || '').trim()
    if (!value) return

    setStatus('processing')
    // Historial ANTES de agregar el mensaje nuevo (contexto para resolver referencias).
    const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }))
    addMessage('user', value)

    try {
      const processed = await processAiReservationText({
        text: value,
        proposalToken: proposalRef.current?.proposalToken || null,
        history,
      })

      if (processed?.data?.proposalToken) {
        setCurrentProposal(processed.data)
      }
      if (processed?.action === 'confirmed') {
        const createdId = processed?.data?.ReservacionID
        setReservationId(createdId || null)
        setCurrentProposal(null)
      }
      if (processed?.action === 'cancelled') {
        setCurrentProposal(null)
      }

      addMessage('assistant', processed?.message || processed?.data?.message)
    } catch (error) {
      if (error?.data?.proposalToken) {
        setCurrentProposal(error.data)
        addMessage('assistant', `${error?.error || 'La propuesta anterior ya no esta disponible.'} ${error.data.message}`, true)
        return
      }
      if (/reservado|disponible|conflicto/i.test(error?.message || error?.error || '')) {
        setCurrentProposal(null)
      }
      addMessage(
        'assistant',
        error?.message || error?.error || 'No pude procesar la solicitud con Gemini.',
        true
      )
    } finally {
      setStatus('idle')
    }
  }, [addMessage, setCurrentProposal, messages])

  // Tool calls de Gemini Live -> reusan la logica de reservas del backend (REST).
  const handleLiveToolCall = useCallback(async (call) => {
    const name = call?.name
    const args = call?.args || {}

    if (name === 'propose_reservation') {
      try {
        const result = await proposeAiReservation(args)
        if (result?.data?.proposalToken) {
          setCurrentProposal(result.data)
          return { ok: true, ...result.data }
        }
        return { ok: false, error: 'No encontre disponibilidad para ese horario.' }
      } catch (error) {
        return { ok: false, error: error?.error || error?.message || 'No encontre disponibilidad.' }
      }
    }

    if (name === 'cancel_reservation') {
      if (!args.confirmed) return { ok: false, error: 'El usuario no confirmo la cancelacion.' }
      try {
        const result = await cancelAiReservation({
          reservacionId: args.reservacionId,
          fecha: args.fecha,
          horaInicio: args.horaInicio,
        })
        return { ok: true, ...result?.data }
      } catch (error) {
        if (error?.data?.opciones) return { ok: false, error: error.error, opciones: error.data.opciones }
        return { ok: false, error: error?.error || error?.message || 'No pude cancelar la reserva.' }
      }
    }

    if (name === 'get_my_reservations') {
      try {
        const result = await listMyAiReservations(args.fecha || undefined)
        const reservaciones = result?.data?.reservaciones || []
        return { ok: true, total: reservaciones.length, reservaciones }
      } catch (error) {
        return { ok: false, error: error?.error || error?.message || 'No pude obtener tus reservaciones.' }
      }
    }

    if (name === 'confirm_reservation') {
      if (!args.confirmed) return { ok: false, error: 'El usuario no confirmo la reserva.' }
      const token = proposalRef.current?.proposalToken
      if (!token) return { ok: false, error: 'No hay una propuesta pendiente para confirmar.' }
      try {
        const result = await confirmAiReservation(token)
        const createdId = result?.data?.ReservacionID
        setReservationId(createdId || null)
        setCurrentProposal(null)
        return { ok: true, folio: createdId ? `RES-${String(createdId).padStart(6, '0')}` : null }
      } catch (error) {
        if (error?.data?.proposalToken) setCurrentProposal(error.data)
        return { ok: false, error: error?.error || error?.message || 'No pude confirmar la reserva.' }
      }
    }

    return { ok: false, error: `Accion no soportada: ${name}` }
  }, [setCurrentProposal])

  const handleInputTranscript = useCallback((value, isFinal) => {
    if (isFinal) {
      setUserPartial('')
      pushMessage('user', value)
    } else {
      setUserPartial(value)
    }
  }, [pushMessage])

  const handleOutputTranscript = useCallback((value, isFinal) => {
    if (isFinal) {
      setBotPartial('')
      pushMessage('assistant', value)
    } else {
      setBotPartial(value)
    }
  }, [pushMessage])

  const handleLiveError = useCallback((message) => {
    pushMessage('assistant', message || 'Hubo un problema con la voz en vivo.', true)
  }, [pushMessage])

  const handleLevel = useCallback((level) => setMicLevel(level), [])

  const {
    active: liveActive,
    connect: connectLive,
    disconnect: disconnectLive,
    sendText: sendLiveText,
  } = useGeminiLive({
    onStatus: setLiveStatus,
    onInputTranscript: handleInputTranscript,
    onOutputTranscript: handleOutputTranscript,
    onToolCall: handleLiveToolCall,
    onError: handleLiveError,
    onLevel: handleLevel,
  })

  const toggleLive = useCallback(() => {
    if (liveActive || liveStatus === 'connecting') {
      disconnectLive()
      setUserPartial('')
      setBotPartial('')
    } else {
      connectLive()
    }
  }, [liveActive, liveStatus, connectLive, disconnectLive])

  const submitValue = useCallback(async (raw) => {
    const value = String(raw || '').trim()
    if (!value) return
    if (liveActive) {
      pushMessage('user', value)
      sendLiveText(value)
      return
    }
    await sendPrompt(value)
  }, [liveActive, pushMessage, sendLiveText, sendPrompt])

  const sendText = useCallback(async () => {
    const value = text.trim()
    if (!value) return
    setText('')
    await submitValue(value)
  }, [submitValue, text])

  const confirmPending = useCallback(async () => {
    if (!proposal?.proposalToken) return
    setStatus('confirming')
    try {
      const result = await confirmAiReservation(proposal.proposalToken)
      const createdId = result?.data?.ReservacionID
      setReservationId(createdId || null)
      setCurrentProposal(null)
      addMessage('assistant', createdId ? `Reserva confirmada. Tu folio es RES-${String(createdId).padStart(6, '0')}.` : 'Reserva confirmada.')
      setStatus('idle')
    } catch (error) {
      if (error?.data?.proposalToken) {
        setCurrentProposal(error.data)
        addMessage('assistant', `${error?.error || 'La propuesta anterior ya no esta disponible.'} ${error.data.message}`, true)
        setStatus('idle')
        return
      }
      addMessage('assistant', error?.error || 'No pude confirmar la reserva.', true)
      setStatus('idle')
    }
  }, [addMessage, proposal, setCurrentProposal])

  // Baja el scroll al ultimo mensaje cada que cambia la conversacion.
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, userPartial, botPartial, proposal, reservationId, status])

  useEffect(() => () => {
    disconnectLive()
  }, [disconnectLive])

  const hasError = status === 'error' || liveStatus === 'error'
  const statusDotColor = hasError ? '#ff3246' : '#05f0a5'
  const statusText = liveStatus === 'connecting'
    ? 'Conectando voz…'
    : liveActive
      ? 'Escuchando…'
      : status === 'processing'
        ? 'Procesando…'
        : 'En linea'
  const statusPulse = liveActive || liveStatus === 'connecting'

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-32px)] flex-col items-end gap-3">
      {open && (
        <section className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0a0014] sm:static sm:h-[min(560px,calc(100vh-96px))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-surface-badge sm:shadow-[0_8px_40px_rgba(161,0,255,0.20)]">
          <div className="flex items-center justify-between gap-3 bg-surface-card px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <BotIcon size={18} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-semibold text-white">WorkHub Asistente</span>
                <span className="flex items-center gap-1.5 font-mono text-[9px]" style={{ color: statusDotColor }}>
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${statusPulse ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: statusDotColor }}
                  />
                  {statusText}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full border-none bg-surface-badge text-text-muted cursor-pointer hover:text-white"
              aria-label="Cerrar asistente"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5">
            {messages.map((message, index) => (
              message.role === 'assistant' ? (
                <div key={`${message.role}-${index}`} className="flex w-full items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <BotIcon size={14} />
                  </div>
                  <div className={`flex max-w-[280px] flex-col gap-1 rounded-xl rounded-tl-none px-3.5 py-2.5 ${message.isError ? 'border border-[#ff3246]/50 bg-[#ff3246]/10' : 'bg-surface-card'}`}>
                    <p className={`font-mono text-[11px] leading-[1.5] whitespace-pre-wrap ${message.isError ? 'text-[#ff8a96]' : 'text-white'}`}>{message.text}</p>
                    {message.time && <span className="font-mono text-[8px] text-text-muted">{message.time}</span>}
                  </div>
                </div>
              ) : (
                <div key={`${message.role}-${index}`} className="flex w-full justify-end">
                  <div className="flex max-w-[250px] flex-col gap-1 rounded-xl rounded-tr-none bg-primary px-3.5 py-2.5">
                    <p className="font-mono text-[11px] leading-[1.5] text-white whitespace-pre-wrap">{message.text}</p>
                    {message.time && <span className="font-mono text-[8px] text-white/60">{message.time}</span>}
                  </div>
                </div>
              )
            ))}

            {userPartial && (
              <div className="flex w-full justify-end">
                <div className="max-w-[250px] rounded-xl rounded-tr-none bg-primary/70 px-3.5 py-2.5">
                  <p className="font-mono text-[11px] leading-[1.5] text-white/90">{userPartial}</p>
                </div>
              </div>
            )}

            {botPartial && (
              <div className="flex w-full items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <BotIcon size={14} />
                </div>
                <div className="max-w-[280px] rounded-xl rounded-tl-none bg-surface-card px-3.5 py-2.5">
                  <p className="font-mono text-[11px] leading-[1.5] text-white/80">{botPartial}</p>
                </div>
              </div>
            )}

            {status === 'processing' && !liveActive && !botPartial && (
              <div className="flex w-full items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <BotIcon size={14} />
                </div>
                <div className="flex items-center gap-1 rounded-xl rounded-tl-none bg-surface-card px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
                </div>
              </div>
            )}

            {proposal && (
              <div className="ml-8 flex max-w-[280px] flex-col gap-3 rounded-xl border border-primary/40 bg-surface-card p-3">
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted">Espacio</span>
                    <span className="font-semibold text-white">{proposal.proposal?.espacioNombre || 'Disponible'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted">Piso</span>
                    <span className="font-semibold text-white">{proposal.proposal?.pisoNombre || 'Asignado'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted">Fecha</span>
                    <span className="font-semibold text-white">{formatDate(proposal.proposal?.fecha)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted">Horario</span>
                    <span className="font-semibold text-white">
                      {proposal.proposal?.horaInicio} - {proposal.proposal?.horaFin}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={confirmPending}
                    disabled={status === 'confirming'}
                    className="rounded-full border border-primary bg-surface-badge px-3 py-1.5 font-mono text-[10px] font-semibold text-primary cursor-pointer hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'confirming' ? 'Reservando…' : 'Si, reservar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentProposal(null)}
                    className="rounded-full border border-primary bg-surface-badge px-3 py-1.5 font-mono text-[10px] font-semibold text-primary cursor-pointer hover:bg-primary hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {reservationId && (
              <div className="ml-8 flex items-center gap-2 rounded-xl bg-surface-card p-3">
                <span className="flex-1 font-mono text-[11px] text-text-muted">
                  RES-{String(reservationId).padStart(6, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/mis-reservaciones')}
                  className="rounded-full border-none bg-primary px-3 py-1.5 font-mono text-[10px] font-semibold text-white cursor-pointer"
                >
                  Ver
                </button>
              </div>
            )}

            {messages.length <= 1 && !proposal && !reservationId && !liveActive && status !== 'processing' && (
              <div className="ml-8 flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitValue(suggestion)}
                    className="self-start rounded-full border border-primary/40 bg-surface-card px-3 py-1.5 text-left font-mono text-[10px] text-primary cursor-pointer hover:bg-primary hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* ENTRADA — ESCRITORIO: fila texto + mic + enviar (sin cambios) */}
          <div className="hidden items-center gap-3 bg-surface-card px-4 py-3 sm:flex">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendText()
              }}
              placeholder="Escribe tu mensaje..."
              className="h-10 min-w-0 flex-1 rounded-full border-none bg-surface-badge px-4 font-mono text-[11px] text-white outline-none placeholder:text-text-muted"
            />
            <button
              type="button"
              onClick={toggleLive}
              style={liveActive ? { boxShadow: `0 0 0 ${Math.min(micLevel * 90, 12)}px rgba(161,0,255,0.25)` } : undefined}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border cursor-pointer transition-[box-shadow] duration-75 ${
                liveActive
                  ? 'border-primary bg-primary text-white'
                  : liveStatus === 'connecting'
                    ? 'border-primary bg-surface-badge text-primary opacity-60 animate-pulse'
                    : 'border-primary bg-surface-badge text-primary hover:bg-primary hover:text-white'
              }`}
              aria-label={liveActive ? 'Terminar conversacion de voz' : 'Hablar por voz'}
            >
              <MicIcon size={16} />
            </button>
            <button
              type="button"
              onClick={sendText}
              disabled={!liveActive && status === 'processing'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-none bg-primary text-white cursor-pointer hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              <SendIcon size={16} />
            </button>
          </div>

          {/* ENTRADA — CELULAR: voz primero (mic grande); escribir es secundario */}
          <div className="flex flex-col items-center gap-2.5 bg-surface-card px-4 pb-7 pt-5 sm:hidden">
            {mobileTyping ? (
              <div className="flex w-full items-center gap-2">
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendText()
                  }}
                  placeholder="Escribe tu mensaje..."
                  autoFocus
                  className="h-11 min-w-0 flex-1 rounded-full border-none bg-surface-badge px-4 font-mono text-[13px] text-white outline-none placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={sendText}
                  disabled={!liveActive && status === 'processing'}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-none bg-primary text-white disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  <SendIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTyping(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary bg-surface-badge text-primary"
                  aria-label="Volver a voz"
                >
                  <MicIcon size={18} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleLive}
                  style={liveActive ? { boxShadow: `0 0 0 ${Math.min(micLevel * 120, 22)}px rgba(161,0,255,0.25)` } : undefined}
                  className={`flex h-20 w-20 items-center justify-center rounded-full border-2 transition-[box-shadow] duration-75 ${
                    liveActive
                      ? 'border-primary bg-primary text-white'
                      : liveStatus === 'connecting'
                        ? 'border-primary bg-surface-badge text-primary opacity-60 animate-pulse'
                        : 'border-primary bg-surface-badge text-primary'
                  }`}
                  aria-label={liveActive ? 'Terminar conversacion de voz' : 'Hablar por voz'}
                >
                  <MicIcon size={30} />
                </button>
                <span className="font-mono text-[11px] text-text-muted">
                  {liveStatus === 'connecting'
                    ? 'Conectando…'
                    : liveActive
                      ? 'Escuchando… toca para terminar'
                      : 'Toca para hablar'}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileTyping(true)}
                  className="font-mono text-[10px] text-primary underline-offset-2 hover:underline"
                >
                  o escribir
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`h-14 w-14 items-center justify-center rounded-full border-none bg-primary text-white shadow-[0_10px_28px_rgba(161,0,255,0.35)] cursor-pointer hover:bg-primary-dark ${open ? 'hidden sm:flex' : 'flex'}`}
        aria-label="Abrir asistente IA"
      >
        <BotIcon size={26} />
      </button>
    </div>
  )
}
