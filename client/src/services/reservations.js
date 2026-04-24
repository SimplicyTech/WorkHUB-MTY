import { apiRequest } from './api'

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

export function createReservacion({
  EmpleadoID,
  EspacioID,
  VisitaID,
  EstatusID,
  Fecha,
  HoraInicio,
  HoraFin,
  Descripcion,
}) {
  return apiRequest('/reservaciones', {
    method: 'POST',
    body: { EmpleadoID, EspacioID, VisitaID, EstatusID, Fecha, HoraInicio, HoraFin, Descripcion },
  })
}

export function cancelReservacion(reservacionId) {
  return apiRequest(`/reservaciones/${reservacionId}`, {
    method: 'DELETE',
  })
}
