import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'mi_espacio', to: '/' },
  { label: 'reservar', to: '/reservar', active: true },
  { label: 'mapa_de_pisos', to: '/' },
  { label: 'mis_reservaciones', to: '/' },
]

export default function AppLayout() {
  const { user } = useAuth()

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Navbar interno */}
      <nav className="flex items-center justify-between px-12 py-3 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl">›</span>
          <span className="text-white text-base">accenture</span>
          <span className="font-mono text-sm text-text-muted">//</span>
          <span className="font-heading text-sm text-primary font-semibold">WORKHUB MTY</span>
        </div>

        <div className="flex items-center gap-6">
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

        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center">
              <span className="font-mono text-[11px] text-white font-bold">
                {user.initials}
              </span>
            </div>
            <span className="font-mono text-xs text-white">{user.name}</span>
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
