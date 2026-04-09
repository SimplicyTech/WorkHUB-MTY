import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'mi_espacio', to: '/' },
  { label: 'reservar', to: '/reservar', active: true },
  { label: 'mapa_de_pisos', to: '/' },
  { label: 'mis_reservaciones', to: '/' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Navbar interno */}
      <nav className="bg-surface relative z-40">
        <div className="flex items-center justify-between px-5 md:px-12 py-3">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">›</span>
            <span className="text-white text-base">accenture</span>
            <span className="font-mono text-sm text-text-muted">//</span>
            <span className="font-heading text-sm text-primary font-semibold">WORKHUB MTY</span>
          </div>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`font-mono text-xs ${
                  link.active ? 'text-primary font-semibold' : 'text-text-muted'
                } hover:text-white transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Perfil desktop + hamburguesa mobile */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-3">
                <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center">
                  <span className="font-mono text-[11px] text-white font-bold">
                    {user.initials}
                  </span>
                </div>
                <span className="font-mono text-xs text-white">{user.name}</span>
              </div>
            )}

            {/* Botón hamburguesa — solo mobile */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 bg-transparent border-none cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
            >
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Menú mobile desplegable */}
        {menuOpen && (
          <div className="md:hidden border-t border-surface-badge bg-surface px-5 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`font-mono text-[13px] py-3 border-b border-surface-badge last:border-0 transition-colors ${
                  link.active ? 'text-primary font-semibold' : 'text-text-muted hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <div className="pt-3 mt-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center">
                    <span className="font-mono text-[12px] text-white font-bold">
                      {user.initials}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-white font-semibold">{user.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">{user.email}</span>
                  </div>
                </div>
                <button className="flex items-center gap-3 py-3 w-full border-b border-surface-badge bg-transparent border-none cursor-pointer text-left">
                  <span className="text-text-muted text-base">⚙</span>
                  <span className="font-mono text-xs text-white">Configuración</span>
                </button>
                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                    navigate('/')
                  }}
                  className="flex items-center gap-3 py-3 w-full bg-transparent border-none cursor-pointer text-left"
                >
                  <span className="text-[#FF4D4D] text-base">⏻</span>
                  <span className="font-mono text-xs text-[#FF4D4D]">Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
