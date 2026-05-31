import { apiRequest } from './api'
import { notifyDashboardChanged } from './dashboard'

// ── Empleados (Admin) ─────────────────────────────────────

export function getAllEmpleados() {
  return apiRequest('/empleados')
}

export function getEmpleadoRango(empleadoId) {
  return apiRequest(`/empleados/${empleadoId}/rango`)
}

export function getEmpleadoTransacciones(empleadoId) {
  return apiRequest(`/empleados/${empleadoId}/transacciones`)
}

export function getEmpleadoDisponibilidadFecha(empleadoId, fecha) {
  return apiRequest(`/empleados/${empleadoId}/disponibilidad-fecha?fecha=${fecha}`)
}

export function createEmpleado({ Nombre, Correo, Contrasena, RolID, NivelID }) {
  return apiRequest('/empleados', {
    method: 'POST',
    body: { Nombre, Correo, Contrasena, RolID, NivelID },
  })
}

export function deleteEmpleado(empleadoId) {
  return apiRequest(`/empleados/${empleadoId}`, {
    method: 'DELETE',
  })
}

// ── Reservaciones (Admin) ─────────────────────────────────

export function getAllReservaciones() {
  return apiRequest('/reservaciones')
}

// ── Espacios ──────────────────────────────────────────────

export function getAllEspacios(pisoId) {
  const query = pisoId !== undefined && pisoId !== null && pisoId !== ''
    ? `?pisoId=${pisoId}`
    : ''
  return apiRequest(`/espacios${query}`)
}

export function createEspacio({ Nombre, Tipo, PisoID }) {
  return apiRequest('/espacios', {
    method: 'POST',
    body: { Nombre, Tipo, PisoID },
  })
}

export function updateEspacioEstado(espacioId, estado) {
  const bloquear = estado === 'Bloqueado'
  return apiRequest(`/espacios/${espacioId}/bloqueo`, {
    method: bloquear ? 'POST' : 'DELETE',
    body: bloquear ? { motivo: 'Bloqueo administrativo' } : undefined,
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}

export function deleteEspacio(espacioId) {
  return apiRequest(`/espacios/${espacioId}`, {
    method: 'DELETE',
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}

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

// ── Roles ─────────────────────────────────────────────────

export function getRoles() {
  return apiRequest('/roles')
}

// ── Eventos (Admin) ───────────────────────────────────────

export function getEventos() {
  return apiRequest('/eventos')
}

export function createEvento({ Nombre, Motivo, FechaInicio, FechaFin, HoraInicio, HoraFin, PisoID, EspacioIDs }) {
  return apiRequest('/eventos', {
    method: 'POST',
    body: { Nombre, Motivo, FechaInicio, FechaFin, HoraInicio, HoraFin, PisoID, EspacioIDs },
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}

export function deleteEvento(eventoId) {
  return apiRequest(`/eventos/${eventoId}`, {
    method: 'DELETE',
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
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

export function checkInReservacion(reservacionId) {
  return apiRequest(`/reservaciones/${reservacionId}/checkin`, {
    method: 'POST',
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
