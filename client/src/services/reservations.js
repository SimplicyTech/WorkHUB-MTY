import { apiRequest } from './api'
import { notifyDashboardChanged } from './dashboard'
import { hashPassword } from './auth'

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

export function getEmpleadoDisponibilidadFecha(empleadoId, fecha, horaInicio, horaFin) {
  let url = `/empleados/${empleadoId}/disponibilidad-fecha?fecha=${fecha}`
  if (horaInicio && horaFin) {
    url += `&horaInicio=${horaInicio}&horaFin=${horaFin}`
  }
  return apiRequest(url)
}

export async function createEmpleado({ Nombre, Correo, Contrasena, RolID, NivelID }) {
  const hashed = await hashPassword(Contrasena)
  return apiRequest('/empleados', {
    method: 'POST',
    body: { Nombre, Correo, Contrasena: hashed, RolID, NivelID },
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

export function getReportes({ fechaInicio, fechaFin, pisoId = 'todos', tipo = 'todos' }) {
  const params = new URLSearchParams()
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin) params.set('fechaFin', fechaFin)
  if (pisoId) params.set('pisoId', pisoId)
  if (tipo) params.set('tipo', tipo)
  return apiRequest(`/reportes?${params.toString()}`)
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

// ── Visitas ───────────────────────────────────────────────

// Anfitrión: crea la invitación (visita + reserva apartada). Devuelve el link.
export function createReservacionVisitante({ NombreVisitante, CorreoVisitante, Empresa, Motivo, EspacioID, Fecha, HoraInicio, HoraFin, Descripcion }) {
  return apiRequest('/reservaciones/visitante', {
    method: 'POST',
    body: { NombreVisitante, CorreoVisitante, Empresa, Motivo, EspacioID, Fecha, HoraInicio, HoraFin, Descripcion },
  }).then((response) => {
    notifyDashboardChanged()
    return response
  })
}

// Públicas (el visitante entra por el token del link, sin login).
export function getVisita(token) {
  return apiRequest(`/visita/${token}`, { auth: false })
}

export function confirmarVisita(token, requiereEstacionamiento) {
  return apiRequest(`/visita/${token}/confirmar`, {
    method: 'POST',
    auth: false,
    body: { requiereEstacionamiento },
  })
}

export function rechazarVisita(token) {
  return apiRequest(`/visita/${token}/rechazar`, {
    method: 'POST',
    auth: false,
  })
}
