import { useContext } from 'react'
import { DashboardContext } from './dashboard-context'

export const useDashboard = () => useContext(DashboardContext)
