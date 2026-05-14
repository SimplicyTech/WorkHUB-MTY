import { useState, useEffect, useCallback } from 'react'
import { DashboardContext } from './dashboard-context'
import { useAuth } from './useAuth'
import {
  DASHBOARD_REFRESH_EVENT,
  DASHBOARD_REFRESH_KEY,
  getDashboardRequest,
} from '../services/dashboard'
import { getToken } from '../services/api'

export function DashboardProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError(null)

    if (!getToken()) {
      setData([])
      setDashboard(null)
      setError('Inicia sesion para ver datos reales del dashboard')
      if (!silent) setLoading(false)
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
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard, user])

  useEffect(() => {
    if (!user || !getToken()) return undefined

    const refreshSilently = () => fetchDashboard({ silent: true })
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshSilently()
    }
    const handleStorage = (event) => {
      if (event.key === DASHBOARD_REFRESH_KEY) refreshSilently()
    }

    const intervalId = window.setInterval(refreshSilently, 30000)

    window.addEventListener('focus', refreshSilently)
    window.addEventListener(DASHBOARD_REFRESH_EVENT, refreshSilently)
    window.addEventListener('storage', handleStorage)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshSilently)
      window.removeEventListener(DASHBOARD_REFRESH_EVENT, refreshSilently)
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchDashboard, user])

  return (
    <DashboardContext.Provider value={{ data, dashboard, loading, error, refresh: fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  )
}
