import { apiRequest } from './api'

export async function hashPassword(password) {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback: return the raw password (not ideal) if Web Crypto unavailable
    return password
  }

  const enc = new TextEncoder()
  const data = enc.encode(password)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function loginRequest(correo, contrasena) {
  const hashed = await hashPassword(contrasena)
  return apiRequest('/login', {
    method: 'POST',
    auth: false,
    body: { correo, contrasena: hashed },
  })
}
