import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import MainLayout from './layouts/MainLayout'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Login/LoginPage'
import AdminDashboardPage from './pages/Admin/AdminDashboardPage'
import ReservePage from './pages/Reserve/ReservePage'
import ParkingPage from './pages/Reserve/ParkingPage'
import ConfirmationPage from './pages/Reserve/ConfirmationPage'
import MyReservationsPage from './pages/Reserve/MyReservationsPage'
import ReservationDetailPage from './pages/Reserve/ReservationDetailPage'
import ReadQRPage from './pages/ReadQR/Readqr'

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route element={<AppLayout />}>
            <Route path="/reservar" element={<ReservePage />} />
            <Route path="/estacionamiento" element={<ParkingPage />} />
            <Route path="/confirmacion" element={<ConfirmationPage />} />
            <Route path="/mis-reservaciones" element={<MyReservationsPage />} />
            <Route path="/mis-reservaciones/:id" element={<ReservationDetailPage />} />
            <Route path="/ReadQR" element={<ReadQRPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
      </DashboardProvider>
    </AuthProvider>
  )
}

export default App
