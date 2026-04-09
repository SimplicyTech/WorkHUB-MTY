import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Reservar', to: '/reservar' },
  { label: 'Mis Reservaciones', to: '/mis-reservaciones' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="flex items-center justify-between px-12 py-4 bg-surface">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-primary text-2xl">›</span>
        <span className="text-white text-base">accenture</span>
        <span className="font-mono text-sm text-text-muted">//</span>
        <span className="font-heading text-sm text-primary font-semibold">WORKHUB MTY</span>
      </Link>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`font-mono text-xs transition-colors ${
              location.pathname === link.to
                ? 'text-primary font-semibold'
                : 'text-text-muted hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none"
          >
            <span className="font-mono text-xs text-primary font-semibold">
              // mi_perfil
            </span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center">
                <span className="font-mono text-[11px] text-white font-bold">
                  {user.initials}
                </span>
              </div>
              <span className="font-mono text-xs text-white">{user.name}</span>
              <span className="text-primary text-sm">▾</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-[220px] bg-surface-card border border-surface-badge rounded-xl p-2 flex flex-col gap-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-50">
              <div className="p-4 rounded-lg flex flex-col gap-2">
                <span className="font-mono text-[13px] text-white font-semibold">
                  {user.name}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  {user.email}
                </span>
              </div>

              <div className="h-px bg-surface-badge w-full" />

              <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-badge transition-colors cursor-pointer bg-transparent border-none w-full text-left">
                <span className="text-text-muted text-lg">⚙</span>
                <span className="font-mono text-xs text-white">Configuración</span>
              </button>

              <button
                onClick={() => {
                  logout()
                  setDropdownOpen(false)
                  navigate('/')
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-badge transition-colors cursor-pointer bg-transparent border-none w-full text-left"
              >
                <span className="text-[#FF4D4D] text-lg">⏻</span>
                <span className="font-mono text-xs text-[#FF4D4D]">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-primary font-mono text-xs font-semibold">
            // mi_perfil
          </Link>
          <Link
            to="/login"
            className="bg-primary text-white font-heading text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-primary-dark transition-colors"
          >
            INICIAR SESIÓN
          </Link>
        </div>
      )}
    </nav>
  )
}
