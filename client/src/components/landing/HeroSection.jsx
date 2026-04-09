import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatsPanel from './StatsPanel'

export default function HeroSection() {
  const { user } = useAuth()
  return (
    <section
      className="flex flex-col md:flex-row items-center gap-8 md:gap-12 px-5 md:px-12 py-10 md:py-20"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #460073 100%)',
      }}
    >
      {/* Hero Left */}
      <div className="flex-1 flex flex-col gap-5 w-full">
        <div className="flex items-center gap-2 bg-surface-badge rounded-2xl px-3 py-1.5 w-fit">
          <span className="font-mono text-[11px] text-text-muted">
            // tiempo_real
          </span>
          <span className="font-mono text-[11px] text-accent">
            /// ATC Monterrey
          </span>
        </div>

        <h1 className="font-heading text-[38px] md:text-[56px] font-bold leading-[1.05] text-white">
          BIENVENIDO AL ATC MONTERREY
        </h1>

        <p className="font-mono text-sm text-text-muted leading-relaxed">
          Reserva tu escritorio o cajón de estacionamiento para hoy. Consulta
          disponibilidad en tiempo real, haz check-in con QR y optimiza tu
          jornada en la oficina.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={user ? '/reservar' : '/login'}
            className="bg-primary text-white font-heading text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-primary-dark transition-colors"
          >
            RESERVAR MI LUGAR →
          </Link>
          {user && (
            <Link
              to="/"
              className="border border-white/20 text-white font-heading text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Hero Right - Stats Panel */}
      <div className="w-full md:flex-1">
        <StatsPanel />
      </div>
    </section>
  )
}
