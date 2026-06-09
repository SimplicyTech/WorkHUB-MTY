import { Outlet, Navigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import VoiceReservationAssistant from '../components/ai/VoiceReservationAssistant'
import { useAuth } from '../context/useAuth'

export default function AppLayout() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hideAssistant =
    location.pathname.toLowerCase() === '/ReadQR'

  return (
    <div className="min-h-dvh flex flex-col bg-surface">
      <Navbar />

      {/* Content */}
      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        <Outlet />
      </main>
      {!hideAssistant && (
        <VoiceReservationAssistant />
      )}
      <VoiceReservationAssistant />
    </div>
  )
}
