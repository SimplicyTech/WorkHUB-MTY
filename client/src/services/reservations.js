import { apiRequest } from './api'
import { notifyDashboardChanged } from './dashboard'

// ── Espacios ──────────────────────────────────────────────

export function getEspaciosDisponibilidad(fecha, horaInicio, horaFin) {
  return apiRequest(
    `/espacios/disponibilidad?fecha=${fecha}&horaInicio=${horaInicio}&horaFin=${horaFin}`
  )
}

// ── Reservaciones ─────────────────────────────────────────

export function getReservacionesByEmpleado(empleadoId) {
  return apiRequest(`/reservaciones/empleado/${empleadoId}`)
}

export function getReservacionById(reservacionId) {
  return apiRequest(`/reservaciones/${reservacionId}`)
}

export function createReservacion({
  EmpleadoID,
  EspacioID,
  VisitaID,
  Fecha,
  HoraInicio,
  HoraFin,
  Descripcion,
}) {
  return apiRequest('/reservaciones', {
    method: 'POST',
    body: { EmpleadoID, EspacioID, VisitaID, Fecha, HoraInicio, HoraFin, Descripcion },
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}

export function cancelReservacion(reservacionId) {
  return apiRequest(`/reservaciones/${reservacionId}`, {
    method: 'DELETE',
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}
