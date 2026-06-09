import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import VoiceReservationAssistant from '../components/ai/VoiceReservationAssistant'
import { useAuth } from '../context/useAuth'

export default function MainLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* El rol Guardia (rolId 5) solo escanea QR: no debe ver el chatbot. */}
      {user && user.rolId !== 5 && <VoiceReservationAssistant />}
    </div>
  )
}
