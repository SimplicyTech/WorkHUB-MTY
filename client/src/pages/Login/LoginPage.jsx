import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import stLogo from '../../assets/SimplicyTechLogoCompleto.png'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.success) {
      navigate(result.rolId === 5 ? '/ReadQR' : '/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Left Panel */}
      <div
        className="w-full lg:w-1/2 min-h-[260px] lg:min-h-dvh flex flex-col items-center justify-center gap-8 sm:gap-10 px-5 sm:px-10 lg:px-15 py-10 text-center"
        style={{
          background: 'linear-gradient(180deg, #460073 0%, #000000 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-2xl">›</span>
            <span className="text-white text-xl">accenture</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-primary">
            WORKHUB MTY
          </h1>
          <p className="font-mono text-sm text-text-muted">
            Gestión de Espacios — ATC Monterrey
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-text-muted">Desarrollado por</span>
          <img src={stLogo} alt="SimplicyTech" className="h-[37px] w-auto" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-surface flex items-center justify-center px-5 sm:px-10 lg:px-24 xl:px-30 py-10 lg:py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-[400px] flex flex-col gap-8">
          {/* Form Header */}
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-[32px] font-bold text-white">
              Accede a tu cuenta
            </h2>
            <p className="font-mono text-xs text-text-muted leading-relaxed">
              Usa tus credenciales corporativas de Accenture
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] text-white font-semibold">
                Correo corporativo
              </label>
              <input
                type="email"
                placeholder="nombre.apellido@accenture.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-card rounded-lg h-12 px-4 font-mono text-[13px] text-white placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] text-white font-semibold">
                contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-card rounded-lg h-12 px-4 font-mono text-[13px] text-white placeholder:text-text-muted outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <p className="font-mono text-xs text-[#FF4D4D]">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white font-heading text-base font-semibold h-[52px] rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>

          <p className="font-mono text-[10px] text-text-muted text-center leading-relaxed">
            ¿Problemas para acceder? Contacta a <a href="mailto:mesa_de_ayuda@accenture.com" className="text-primary underline">mesa de ayuda</a>
          </p>
        </form>
      </div>
    </div>
  )
}
