import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getEmpleadoRango } from '../../services/reservations'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Reservar', to: '/reservar' },
  { label: 'Mis Reservaciones', to: '/mis-reservaciones' },
  { label: 'Mis Puntos', to: '/puntos' },
]

// Paleta para los badges de rango.
const RANGO_COLORS = {
  Bronce:  { fg: '#CD7F32', bg: 'rgba(205,127,50,0.18)', border: 'rgba(205,127,50,0.55)' },
  Plata:   { fg: '#C0C0C0', bg: 'rgba(192,192,192,0.16)', border: 'rgba(192,192,192,0.55)' },
  Oro:     { fg: '#FFD700', bg: 'rgba(255,215,0,0.16)',   border: 'rgba(255,215,0,0.55)' },
  Platino: { fg: '#B9F2FF', bg: 'rgba(185,242,255,0.16)', border: 'rgba(185,242,255,0.55)' },
}

function RangoBadge({ rango }) {
  if (!rango?.Rango) return null
  const c = RANGO_COLORS[rango.Rango] || RANGO_COLORS.Bronce
  return (
    <span
      className="font-mono text-[10px] font-semibold uppercase tracking-wide px-2 py-[3px] rounded-md border"
      style={{ color: c.fg, backgroundColor: c.bg, borderColor: c.border }}
      title={`Rango ${rango.Rango} — ${rango.DiasAnticipacion} día${rango.DiasAnticipacion === 1 ? '' : 's'} de anticipación`}
    >
      {rango.Rango}
    </span>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [rango, setRango] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!user?.empleadoId) {
      setRango(null)
      return
    }
    let cancelled = false
    getEmpleadoRango(user.empleadoId)
      .then((res) => {
        if (cancelled) return
        setRango(res.data || null)
      })
      .catch(() => {
        if (cancelled) return
        setRango(null)
      })
    return () => {
      cancelled = true
    }
  }, [user?.empleadoId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar menu al cambiar tamaño de pantalla a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <nav className="bg-surface relative z-40">
      {/* Barra principal */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-5 md:px-12 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="text-primary text-2xl shrink-0">›</span>
          <span className="hidden min-[380px]:inline text-white text-base">accenture</span>
          <span className="font-mono text-sm text-text-muted">//</span>
          <span className="font-heading text-sm text-primary font-semibold truncate">WORKHUB MTY</span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive =
              link.to === '/reservar'
                ? ['/reservar', '/estacionamiento', '/confirmacion'].includes(
                    location.pathname
                  )
                : location.pathname === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`font-mono text-xs transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Acciones desktop + hamburguesa mobile */}
        <div className="flex items-center gap-3">
          {/* Perfil / acciones — visible solo en desktop */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 cursor-pointer bg-transparent border-none"
                >
                  <div className="flex items-center gap-3">
                    <RangoBadge rango={rango} />
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
                      <span className="font-mono text-xs text-[#FF4D4D]">Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="bg-primary text-white font-heading text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-primary-dark transition-colors"
                >
                  INICIAR SESIÓN
                </Link>
              </div>
            )}
          </div>

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
                (link.to === '/reservar'
                  ? ['/reservar', '/estacionamiento', '/confirmacion'].includes(
                      location.pathname
                    )
                  : location.pathname === link.to)
                  ? 'text-primary font-semibold'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Sección perfil en mobile */}
          <div className="pt-3 mt-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <RangoBadge rango={rango} />
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
                  <span className="font-mono text-xs text-[#FF4D4D]">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="bg-primary text-white font-heading text-sm font-semibold px-5 py-3 rounded-2xl hover:bg-primary-dark transition-colors text-center"
                >
                  INICIAR SESIÓN
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
