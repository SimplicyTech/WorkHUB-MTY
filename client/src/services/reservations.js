import { apiRequest } from './api'
import { notifyDashboardChanged } from './dashboard'

// ── Empleados (Admin) ─────────────────────────────────────

export function getAllEmpleados() {
  return apiRequest('/empleados')
}

export function createEmpleado({ Nombre, Correo, Contrasena, RolID, NivelID }) {
  return apiRequest('/empleados', {
    method: 'POST',
    body: { Nombre, Correo, Contrasena, RolID, NivelID },
  })
}

// ── Reservaciones (Admin) ─────────────────────────────────

export function getAllReservaciones() {
  return apiRequest('/reservaciones')
}

// ── Espacios ──────────────────────────────────────────────

export function getEspaciosDisponibilidad(fecha, horaInicio, horaFin, pisoId) {
  let url = `/espacios/disponibilidad?fecha=${fecha}&horaInicio=${horaInicio}&horaFin=${horaFin}`
  if (pisoId !== undefined && pisoId !== null && pisoId !== '') {
    url += `&pisoId=${pisoId}`
  }
  return apiRequest(url)
}

// ── Pisos ─────────────────────────────────────────────────

export function getPisos() {
  return apiRequest('/pisos')
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
  RequiereEstacionamiento,
}) {
  return apiRequest('/reservaciones', {
    method: 'POST',
    body: {
      EmpleadoID,
      EspacioID,
      VisitaID,
      Fecha,
      HoraInicio,
      HoraFin,
      Descripcion,
      RequiereEstacionamiento,
    },
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

export function checkOutReservacion(reservacionId) {
  return apiRequest(`/reservaciones/${reservacionId}/checkout`, {
    method: 'POST',
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}
