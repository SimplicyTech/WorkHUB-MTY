import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Mock users para desarrollo
const MOCK_USERS = {
  'oliver.v@accenture.com': {
    name: 'Oliver V.',
    initials: 'OV',
    email: 'oliver.v@accenture.com',
    password: '123456',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    const found = MOCK_USERS[email]
    if (found && found.password === password) {
      setUser({ name: found.name, initials: found.initials, email: found.email })
      return { success: true }
    }
    return { success: false, error: 'Credenciales incorrectas' }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
