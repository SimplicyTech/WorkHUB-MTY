import { API_URL, apiRequest, getToken } from './api'
import { notifyDashboardChanged } from './dashboard'

// Pide a Gemini TTS (vía backend) el audio de un texto en streaming.
// Devuelve la Response cruda para leer el cuerpo (PCM 16-bit LE) por chunks.
export async function requestSpeechStream(text, { voice, signal } = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}/ai/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(voice ? { text, voice } : { text }),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`TTS ${res.status}`)
  return res
}

export function createGeminiSession() {
  return apiRequest('/ai/gemini/session', {
    method: 'POST',
  })
}

export function proposeAiReservation(payload) {
  return apiRequest('/ai/reservations/propose', {
    method: 'POST',
    body: payload,
  })
}

export function processAiReservationText(payload) {
  return apiRequest('/ai/reservations/process-text', {
    method: 'POST',
    body: payload,
  }).then((response) => {
    if (response?.action === 'confirmed' || response?.action === 'cancelled-existing') notifyDashboardChanged()
    return response
  })
}

export function listMyAiReservations(fecha) {
  const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : ''
  return apiRequest(`/ai/reservations/mine${query}`, { method: 'GET' })
}

export function cancelAiReservation(payload) {
  return apiRequest('/ai/reservations/cancel-existing', {
    method: 'POST',
    body: payload,
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}

export function confirmAiReservation(proposalToken) {
  return apiRequest('/ai/reservations/confirm', {
    method: 'POST',
    body: { proposalToken },
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}
