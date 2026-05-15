import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

// Guarda la ruta para que solo el rol Administrador (RolID = 2)
// pueda acceder. Cualquier otro usuario o invitado es redirigido al home.
export default function RequireAdmin({ children }) {
  const { user } = useAuth()
  if (!user || user.rolId !== 2) {
    return <Navigate to="/" replace />
  }
  return children
}
