import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Login/LoginPage'
import ReservePage from './pages/Reserve/ReservePage'
import ParkingPage from './pages/Reserve/ParkingPage'
import ConfirmationPage from './pages/Reserve/ConfirmationPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/reservar" element={<ReservePage />} />
            <Route path="/estacionamiento" element={<ParkingPage />} />
            <Route path="/confirmacion" element={<ConfirmationPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

