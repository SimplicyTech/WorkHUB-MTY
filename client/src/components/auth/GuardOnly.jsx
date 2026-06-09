// src/components/auth/RoleRedirect.jsx

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function GuardOnly() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const allowedRoutes = [
  '/ReadQR',
  '/login'
]

  useEffect(() => {
    if (!user) return

    if (
      user.rolId === 5 &&
      !allowedRoutes.includes(location.pathname)
    ) {
      navigate('/ReadQR', { replace: true })
    }
  }, [user, location.pathname, navigate])

  return null
}