import { createContext, useContext, useState, useEffect } from 'react'
import { getDashboardRequest } from '../services/dashboard'

const DashboardContext = createContext()

export const useDashboard = () => useContext(DashboardContext)

export function DashboardProvider({ children }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardRequest()
      setData(res.data) // 👈 porque tu backend regresa { data: rows }
    } catch (err) {
      console.error('Error dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return (
    <DashboardContext.Provider value={{ data, loading, refresh: fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  )
}