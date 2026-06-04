import { useCallback, useRef, useState } from 'react'
import { GoogleGenAI } from '@google/genai'
import { createGeminiSession } from '../services/ai'

const INPUT_SAMPLE_RATE = 16000
const OUTPUT_SAMPLE_RATE = 24000

// Promedia muestras para bajar de la tasa del navegador (~48k) a 16k que pide Gemini Live.
function downsampleTo16k(input, inRate) {
  if (inRate === INPUT_SAMPLE_RATE) return input
  const ratio = inRate / INPUT_SAMPLE_RATE
  const newLength = Math.round(input.length / ratio)
  const result = new Float32Array(newLength)
  let pos = 0
  for (let i = 0; i < newLength; i += 1) {
    const next = Math.round((i + 1) * ratio)
    let sum = 0
    let count = 0
    for (let j = pos; j < next && j < input.length; j += 1) {
      sum += input[j]
      count += 1
    }
    result[i] = count ? sum / count : 0
    pos = next
  }
  return result
}

function floatToPcm16Base64(float32) {
  const pcm = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i += 1) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  const bytes = new Uint8Array(pcm.buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// Crea el AudioContext de salida a 24kHz (tasa nativa del audio de Gemini Live)
// para reproducir sin re-muestreo, que es lo que causaba el audio entrecortado.
function createOutputContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  try {
    return new Ctx({ sampleRate: OUTPUT_SAMPLE_RATE })
  } catch {
    return new Ctx()
  }
}

function base64ToInt16(b64) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const usableBytes = bytes.length - (bytes.length % 2)
  return new Int16Array(bytes.buffer, 0, usableBytes / 2)
}

// Maneja una sesion de Gemini Live (audio nativo): mic en tiempo real, reproduccion,
// transcripciones y tool calls. La logica de reservas se inyecta vía onToolCall.
export function useGeminiLive({
  onStatus,
  onInputTranscript,
  onOutputTranscript,
  onToolCall,
  onError,
} = {}) {
  const [active, setActive] = useState(false)

  const sessionRef = useRef(null)
  const streamRef = useRef(null)
  const inputCtxRef = useRef(null)
  const processorRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const outputCtxRef = useRef(null)
  const playSourcesRef = useRef([])
  const nextTimeRef = useRef(0)
  const inTranscriptRef = useRef('')
  const outTranscriptRef = useRef('')
  const readyRef = useRef(false)

  const stopPlayback = useCallback(() => {
    for (const node of playSourcesRef.current) {
      try {
        node.onended = null
        node.stop()
      } catch { /* noop */ }
    }
    playSourcesRef.current = []
    if (outputCtxRef.current) nextTimeRef.current = outputCtxRef.current.currentTime
  }, [])

  const playPcm = useCallback((int16) => {
    if (!int16.length) return
    let ctx = outputCtxRef.current
    if (!ctx) {
      ctx = createOutputContext()
      if (!ctx) return
      outputCtxRef.current = ctx
      nextTimeRef.current = ctx.currentTime
    }
    if (ctx.state === 'suspended') ctx.resume()

    const buffer = ctx.createBuffer(1, int16.length, OUTPUT_SAMPLE_RATE)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < int16.length; i += 1) channel[i] = int16[i] / 32768

    const startAt = Math.max(nextTimeRef.current, ctx.currentTime + 0.08)
    const node = ctx.createBufferSource()
    node.buffer = buffer
    node.connect(ctx.destination)
    node.onended = () => {
      const idx = playSourcesRef.current.indexOf(node)
      if (idx >= 0) playSourcesRef.current.splice(idx, 1)
    }
    node.start(startAt)
    playSourcesRef.current.push(node)
    nextTimeRef.current = startAt + buffer.duration
  }, [])

  const disconnect = useCallback(() => {
    setActive(false)
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null
      try { processorRef.current.disconnect() } catch { /* noop */ }
      processorRef.current = null
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect() } catch { /* noop */ }
      sourceNodeRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (inputCtxRef.current) {
      try { inputCtxRef.current.close() } catch { /* noop */ }
      inputCtxRef.current = null
    }
    stopPlayback()
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch { /* noop */ }
      sessionRef.current = null
    }
    inTranscriptRef.current = ''
    outTranscriptRef.current = ''
    readyRef.current = false
    onStatus?.('idle')
  }, [onStatus, stopPlayback])

  const handleMessage = useCallback((message) => {
    const serverContent = message?.serverContent

    if (message?.setupComplete) {
      readyRef.current = true
      console.log('[live] setupComplete (listo para enviar audio)')
    }
    if (message?.toolCall) console.log('[live] toolCall', message.toolCall.functionCalls?.map((c) => c.name))

    if (serverContent?.interrupted) stopPlayback()

    // El audio viene en parts[].inlineData; message.data es el MISMO audio agregado.
    // Usar solo uno (parts), o caer a message.data si no hay parts. Reproducir ambos
    // hacia que cada fragmento sonara dos veces (trabado / palabras repetidas).
    let audioChunks = 0
    const parts = serverContent?.modelTurn?.parts || []
    for (const part of parts) {
      if (part.inlineData?.data) { playPcm(base64ToInt16(part.inlineData.data)); audioChunks += 1 }
    }
    if (audioChunks === 0 && message?.data) { playPcm(base64ToInt16(message.data)); audioChunks += 1 }
    if (audioChunks) console.log('[live] audio recibido x', audioChunks)

    if (serverContent?.inputTranscription?.text) {
      inTranscriptRef.current += serverContent.inputTranscription.text
      onInputTranscript?.(inTranscriptRef.current, false)
    }
    if (serverContent?.outputTranscription?.text) {
      outTranscriptRef.current += serverContent.outputTranscription.text
      onOutputTranscript?.(outTranscriptRef.current, false)
    }
    if (serverContent?.turnComplete || serverContent?.generationComplete) {
      if (inTranscriptRef.current.trim()) onInputTranscript?.(inTranscriptRef.current.trim(), true)
      if (outTranscriptRef.current.trim()) onOutputTranscript?.(outTranscriptRef.current.trim(), true)
      inTranscriptRef.current = ''
      outTranscriptRef.current = ''
    }

    const calls = message?.toolCall?.functionCalls
    if (calls?.length && sessionRef.current) {
      (async () => {
        const functionResponses = []
        for (const call of calls) {
          let response
          try {
            response = await onToolCall?.(call)
          } catch (error) {
            response = { ok: false, error: error?.message || 'Error ejecutando la accion.' }
          }
          functionResponses.push({ id: call.id, name: call.name, response: response || { ok: false } })
        }
        try { sessionRef.current?.sendToolResponse({ functionResponses }) } catch { /* noop */ }
      })()
    }
  }, [onInputTranscript, onOutputTranscript, onToolCall, playPcm, stopPlayback])

  const connect = useCallback(async () => {
    if (sessionRef.current) return
    onStatus?.('connecting')

    let token
    let model
    try {
      const res = await createGeminiSession()
      token = res?.data?.token
      model = res?.data?.model
    } catch (error) {
      onError?.(error?.error || 'No se pudo iniciar la sesion de voz.')
      onStatus?.('error')
      return
    }
    if (!token || !model) {
      onError?.('La sesion de voz no esta disponible.')
      onStatus?.('error')
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
    } catch {
      onError?.('No tengo permiso para usar el microfono.')
      onStatus?.('error')
      return
    }
    streamRef.current = stream

    const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } })
    let session
    try {
      // Sin config: el token efimero ya trae horneado el config (modalidades,
      // transcripcion, systemInstruction y tools). Pasar config aqui causa "Internal error".
      session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => { console.log('[live] sesion abierta'); onStatus?.('live') },
          onmessage: handleMessage,
          onerror: (event) => {
            console.error('[live] error de sesion:', event)
            onError?.(event?.message || 'Error en la sesion de voz.')
          },
          onclose: (event) => {
            console.log('[live] sesion cerrada:', event?.reason || event?.code || '')
            sessionRef.current = null
          },
        },
      })
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      onError?.(error?.message || 'No se pudo conectar la voz en vivo.')
      onStatus?.('error')
      return
    }
    sessionRef.current = session

    const Ctx = window.AudioContext || window.webkitAudioContext

    // Contexto de salida (reproduccion): crearlo y reanudarlo ya, mientras hay gesto del usuario.
    if (!outputCtxRef.current) {
      outputCtxRef.current = createOutputContext()
      if (outputCtxRef.current) nextTimeRef.current = outputCtxRef.current.currentTime
    }
    try { await outputCtxRef.current?.resume() } catch { /* noop */ }

    const inputCtx = new Ctx()
    inputCtxRef.current = inputCtx
    const sourceNode = inputCtx.createMediaStreamSource(stream)
    sourceNodeRef.current = sourceNode
    const processor = inputCtx.createScriptProcessor(4096, 1, 1)
    processorRef.current = processor

    let framesSent = 0
    let sendErrorLogged = false
    processor.onaudioprocess = (event) => {
      if (!sessionRef.current || !readyRef.current) return
      // No enviar el mic mientras el asistente esta hablando (incluye 150ms de cola):
      // evita el eco/feedback que hacia que la IA se trabara y repitiera palabras.
      const outCtx = outputCtxRef.current
      if (outCtx && outCtx.currentTime < nextTimeRef.current + 0.15) return
      const input = event.inputBuffer.getChannelData(0)
      const downsampled = downsampleTo16k(input, inputCtx.sampleRate)
      const data = floatToPcm16Base64(downsampled)
      try {
        sessionRef.current.sendRealtimeInput({ audio: { data, mimeType: 'audio/pcm;rate=16000' } })
        framesSent += 1
        if (framesSent === 1) console.log('[live] enviando audio del mic…')
      } catch (error) {
        if (!sendErrorLogged) {
          sendErrorLogged = true
          console.error('[live] sendRealtimeInput error:', error)
        }
      }
    }
    sourceNode.connect(processor)
    processor.connect(inputCtx.destination)

    // Clave: reanudar el contexto del mic (suele nacer "suspended" tras los awaits).
    try { await inputCtx.resume() } catch { /* noop */ }
    console.log('[live] mic listo, ctx:', inputCtx.state, 'sampleRate:', inputCtx.sampleRate)

    setActive(true)
  }, [handleMessage, onError, onStatus])

  const sendText = useCallback((text) => {
    const value = String(text || '').trim()
    if (!sessionRef.current || !value) return
    try {
      sessionRef.current.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: value }] }],
        turnComplete: true,
      })
    } catch { /* noop */ }
  }, [])

  return { active, connect, disconnect, sendText }
}
