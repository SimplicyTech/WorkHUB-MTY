import { useState } from 'react'
import { loginRequest } from '../services/auth'
import { setToken, clearToken, getToken } from '../services/api'
import { AuthContext, USER_KEY } from './useAuth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken()
    const stored = localStorage.getItem(USER_KEY)
    if (!token || !stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem(USER_KEY)
      clearToken()
      return null
    }
  })
  const loading = false

  const login = async (email, password) => {
    try {
      const res = await loginRequest(email, password)
      const data = res.data || {}
      const userData = {
        empleadoId: data.empleadoId,
        name: data.nombre,
        email: data.correo,
        rolId: data.rolId,
        nivelId: data.nivelId,
        puntos: data.puntos,
        initials: (data.nombre || '')
          .split(' ')
          .map((p) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      }
      setToken(res.token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
      return { success: true, rolId: userData.rolId } 
    } catch (err) {
      return { success: false, error: err?.error || 'Credenciales incorrectas' }
    }
  }

  const logout = () => {
    clearToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
