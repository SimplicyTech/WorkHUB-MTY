const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api/workhub'

const TOKEN_KEY = 'workhub_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw { error: 'No se pudo conectar al servidor' }
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) clearToken()
    throw data.error ? data : { error: 'Error en la solicitud' }
  }

  return data
}
