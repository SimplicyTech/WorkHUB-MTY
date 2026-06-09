import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import { LecturaProvider } from './context/LecturaContext'

import MainLayout from './layouts/MainLayout'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Login/LoginPage'
import AdminDashboardPage from './pages/Admin/AdminDashboardPage'
import RequireAdmin from './components/auth/RequireAdmin'
import ReservePage from './pages/Reserve/ReservePage'
import ParkingPage from './pages/Reserve/ParkingPage'
import ConfirmationPage from './pages/Reserve/ConfirmationPage'
import MyReservationsPage from './pages/Reserve/MyReservationsPage'
import ReservationDetailPage from './pages/Reserve/ReservationDetailPage'
import PuntosPage from './pages/Reserve/PuntosPage'
import InvitacionEnviadaPage from './pages/Reserve/InvitacionEnviadaPage'
import VisitaConfirmacionPage from './pages/Visita/VisitaConfirmacionPage'
import ReadQRPage from './pages/ReadQR/Readqr'
import GuardOnly from './components/auth/GuardOnly'

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <LecturaProvider>
      <BrowserRouter>
      <GuardOnly/>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route element={<AppLayout />}>
            <Route path="/reservar" element={<ReservePage />} />
            <Route path="/estacionamiento" element={<ParkingPage />} />
            <Route path="/confirmacion" element={<ConfirmationPage />} />
            <Route path="/invitacion-enviada" element={<InvitacionEnviadaPage />} />
            <Route path="/mis-reservaciones" element={<MyReservationsPage />} />
            <Route path="/mis-reservaciones/:id" element={<ReservationDetailPage />} />
            <Route path="/puntos" element={<PuntosPage />} />
            <Route path="/ReadQR" element={<ReadQRPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/visita/confirmar" element={<VisitaConfirmacionPage />} />
        </Routes>
      </BrowserRouter>
      </LecturaProvider>
      </DashboardProvider>
    </AuthProvider>
  )
}

export default App
