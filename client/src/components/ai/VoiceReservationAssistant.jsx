import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  confirmAiReservation,
  processAiReservationText,
  proposeAiReservation,
  requestSpeechStream,
} from '../../services/ai'
import { useGeminiLive } from '../../hooks/useGeminiLive'

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

// Reproduccion de Gemini TTS en streaming via Web Audio API.
let audioCtx = null
let ttsAbort = null
let ttsSources = []
let ttsEndTimer = null

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

function stopSpeaking() {
  window.speechSynthesis?.cancel()
  if (ttsAbort) {
    try { ttsAbort.abort() } catch { /* noop */ }
    ttsAbort = null
  }
  if (ttsEndTimer) {
    window.clearTimeout(ttsEndTimer)
    ttsEndTimer = null
  }
  for (const node of ttsSources) {
    try {
      node.onended = null
      node.stop()
    } catch { /* noop */ }
  }
  ttsSources = []
}

// Respaldo: voz del navegador si Gemini TTS no esta disponible.
function speakWithBrowser(text, { onStart, onEnd } = {}) {
  if (!text || !window.speechSynthesis) {
    onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-MX'
  utterance.onstart = onStart
  utterance.onend = onEnd
  utterance.onerror = onEnd
  window.speechSynthesis.speak(utterance)
}

// Parte el texto en frases para que la primera (corta) suene mientras se generan las demas.
function splitIntoSegments(text) {
  const raw = String(text).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
  const segments = []
  for (const piece of raw) {
    const last = segments[segments.length - 1]
    if (last && last.length < 30) segments[segments.length - 1] = `${last} ${piece}`
    else segments.push(piece)
  }
  return segments.length ? segments : [String(text)]
}

// Sintetiza UNA frase y agenda su PCM al final de la cola de audio compartida.
async function streamSegment(ctx, segText, state, signal, onStart) {
  const res = await requestSpeechStream(segText, { signal })
  const sampleRate = Number(res.headers.get('X-Sample-Rate')) || 24000
  const reader = res.body.getReader()
  let leftover = new Uint8Array(0)

  const schedulePcm = (incoming) => {
    let data = incoming
    if (leftover.length) {
      const merged = new Uint8Array(leftover.length + incoming.length)
      merged.set(leftover, 0)
      merged.set(incoming, leftover.length)
      data = merged
    }
    const sampleCount = Math.floor(data.length / 2)
    const usableBytes = sampleCount * 2
    leftover = data.slice(usableBytes)
    if (sampleCount === 0) return

    const view = new DataView(data.buffer, data.byteOffset, usableBytes)
    const buffer = ctx.createBuffer(1, sampleCount, sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < sampleCount; i += 1) {
      channel[i] = view.getInt16(i * 2, true) / 32768
    }

    const startAt = Math.max(state.nextTime, ctx.currentTime + 0.02)
    const node = ctx.createBufferSource()
    node.buffer = buffer
    node.connect(ctx.destination)
    node.onended = () => {
      const idx = ttsSources.indexOf(node)
      if (idx >= 0) ttsSources.splice(idx, 1)
    }
    node.start(startAt)
    ttsSources.push(node)

    if (!state.gotAudio) onStart?.()
    state.nextTime = startAt + buffer.duration
    state.scheduledEnd = state.nextTime
    state.gotAudio = true
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (value && value.length) schedulePcm(value)
  }
}

async function streamGeminiSpeech(text, { onStart, onEnd } = {}) {
  const ctx = getAudioContext()
  if (!ctx) throw new Error('AudioContext no disponible')
  if (ctx.state === 'suspended') await ctx.resume()

  const abort = new AbortController()
  ttsAbort = abort
  const base = ctx.currentTime + 0.08
  const state = { nextTime: base, scheduledEnd: base, gotAudio: false }

  for (const segment of splitIntoSegments(text)) {
    await streamSegment(ctx, segment, state, abort.signal, onStart)
  }

  if (!state.gotAudio) throw new Error('Sin audio')

  const delayMs = Math.max(0, (state.scheduledEnd - ctx.currentTime) * 1000) + 100
  ttsEndTimer = window.setTimeout(() => {
    ttsEndTimer = null
    if (ttsAbort === abort) ttsAbort = null
    onEnd?.()
  }, delayMs)
}

// Voz natural de Gemini TTS (frase por frase); si falla, cae al sintetizador del navegador.
async function speak(text, handlers = {}) {
  if (!text) {
    handlers.onEnd?.()
    return
  }
  stopSpeaking()
  try {
    await streamGeminiSpeech(text, handlers)
  } catch (error) {
    if (error?.name === 'AbortError') return
    speakWithBrowser(text, handlers)
  }
}

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
  const [voiceState, setVoiceState] = useState(null) // null | 'preparando' | 'hablando'
  const [liveStatus, setLiveStatus] = useState('idle') // idle | connecting | live | error
  const [userPartial, setUserPartial] = useState('')
  const [botPartial, setBotPartial] = useState('')

  const proposalRef = useRef(null)

  const pushMessage = useCallback((role, message) => {
    if (!message) return
    setMessages((current) => [...current.slice(-7), { role, text: message, time: nowTime() }])
  }, [])

  // Mensaje del path de TEXTO: se muestra y se habla con Gemini TTS.
  const addMessage = useCallback((role, message) => {
    if (!message) return
    pushMessage(role, message)
    if (role !== 'assistant') return
    setVoiceState('preparando')
    speak(message, {
      onStart: () => setVoiceState('hablando'),
      onEnd: () => setVoiceState(null),
    })
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
    addMessage('user', value)

    try {
      const processed = await processAiReservationText({
        text: value,
        proposalToken: proposalRef.current?.proposalToken || null,
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
        addMessage('assistant', `${error?.error || 'La propuesta anterior ya no esta disponible.'} ${error.data.message}`)
        return
      }
      if (/reservado|disponible|conflicto/i.test(error?.message || error?.error || '')) {
        setCurrentProposal(null)
      }
      addMessage(
        'assistant',
        error?.message || error?.error || 'No pude procesar la solicitud con Gemini.'
      )
    } finally {
      setStatus('idle')
    }
  }, [addMessage, setCurrentProposal])

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
    pushMessage('assistant', message || 'Hubo un problema con la voz en vivo.')
  }, [pushMessage])

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
  })

  const toggleLive = useCallback(() => {
    if (liveActive || liveStatus === 'connecting') {
      disconnectLive()
      setUserPartial('')
      setBotPartial('')
    } else {
      stopSpeaking()
      setVoiceState(null)
      connectLive()
    }
  }, [liveActive, liveStatus, connectLive, disconnectLive])

  const sendText = useCallback(async () => {
    const value = text.trim()
    if (!value) return
    setText('')
    if (liveActive) {
      pushMessage('user', value)
      sendLiveText(value)
      return
    }
    await sendPrompt(value)
  }, [liveActive, pushMessage, sendLiveText, sendPrompt, text])

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
        addMessage('assistant', `${error?.error || 'La propuesta anterior ya no esta disponible.'} ${error.data.message}`)
        setStatus('idle')
        return
      }
      addMessage('assistant', error?.error || 'No pude confirmar la reserva.')
      setStatus('idle')
    }
  }, [addMessage, proposal, setCurrentProposal])

  useEffect(() => () => {
    disconnectLive()
    stopSpeaking()
  }, [disconnectLive])

  const hasError = status === 'error' || liveStatus === 'error'
  const statusDotColor = hasError ? '#ff3246' : '#05f0a5'
  const statusText = liveStatus === 'connecting'
    ? 'Conectando voz…'
    : liveActive
      ? 'Escuchando…'
      : voiceState === 'preparando'
        ? 'Generando voz…'
        : voiceState === 'hablando'
          ? 'Hablando…'
          : status === 'processing'
            ? 'Procesando…'
            : 'En linea'
  const statusPulse = liveActive || liveStatus === 'connecting' || Boolean(voiceState)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-32px)] flex-col items-end gap-3">
      {open && (
        <section className="flex h-[min(560px,calc(100vh-96px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-surface-badge bg-[#0a0014] shadow-[0_8px_40px_rgba(161,0,255,0.20)]">
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
                  <div className="flex max-w-[280px] flex-col gap-1 rounded-xl rounded-tl-none bg-surface-card px-3.5 py-2.5">
                    <p className="font-mono text-[11px] leading-[1.5] text-white whitespace-pre-wrap">{message.text}</p>
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
                    className="rounded-full border border-primary bg-surface-badge px-3 py-1.5 font-mono text-[10px] font-semibold text-primary cursor-pointer hover:bg-primary hover:text-white"
                  >
                    Si, reservar
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
          </div>

          <div className="flex items-center gap-3 bg-surface-card px-4 py-3">
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
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border cursor-pointer ${
                liveActive
                  ? 'border-primary bg-primary text-white animate-pulse'
                  : liveStatus === 'connecting'
                    ? 'border-primary bg-surface-badge text-primary opacity-60'
                    : 'border-primary bg-surface-badge text-primary hover:bg-primary hover:text-white'
              }`}
              aria-label={liveActive ? 'Terminar conversacion de voz' : 'Hablar por voz'}
            >
              <MicIcon size={16} />
            </button>
            <button
              type="button"
              onClick={sendText}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-none bg-primary text-white cursor-pointer hover:bg-primary-dark"
              aria-label="Enviar mensaje"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full border-none bg-primary text-white shadow-[0_10px_28px_rgba(161,0,255,0.35)] cursor-pointer hover:bg-primary-dark"
        aria-label="Abrir asistente IA"
      >
        <BotIcon size={26} />
      </button>
    </div>
  )
}
