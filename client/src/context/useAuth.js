import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export const USER_KEY = 'workhub_user'

export function useAuth() {
  return useContext(AuthContext)
}
