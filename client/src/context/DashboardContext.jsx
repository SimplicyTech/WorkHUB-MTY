import { useState, useEffect } from 'react'
import { DashboardContext } from './dashboard-context'
import { useAuth } from './useAuth'
import { getDashboardRequest } from '../services/dashboard'
import { getToken } from '../services/api'

export function DashboardProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    if (!getToken()) {
      setData([])
      setDashboard(null)
      setError('Inicia sesion para ver datos reales del dashboard')
      setLoading(false)
      return
    }

    try {
      const res = await getDashboardRequest()
      setData(res.data || [])
      setDashboard(res)
    } catch (err) {
      console.warn('Error dashboard:', err)
      setData([])
      setDashboard(null)
      setError(err?.error || 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [user])

  return (
    <DashboardContext.Provider value={{ data, dashboard, loading, error, refresh: fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  )
}
