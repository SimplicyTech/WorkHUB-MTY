// Periodo de gracia para hacer check-in después de HoraInicio.
// El backend es la fuente de verdad: este valor solo se usa para
// el contador visual en ReservationDetailPage. Si difiere del backend
// es solo cosmético.
const parsed = Number(import.meta.env.VITE_GRACE_MINUTES)
export const GRACE_MINUTES = Number.isFinite(parsed) && parsed > 0 ? parsed : 15

// Mapea el EstatusNombre que viene de la BD a la categoría visual
// usada por los filtros y el badge.
//
//   Próxima              -> 'upcoming'
//   En periodo de gracia -> 'active'
//   Activa               -> 'active'   (check-in hecho, dentro del horario)
//   Cancelada            -> 'cancelled'
//   Liberada             -> 'past'     (no-show)
//   Completada           -> 'past'
export function classifyReservation(r) {
  const estatus = (r?.EstatusNombre || '').toLowerCase().trim()
  switch (estatus) {
    case 'próxima':
    case 'proxima':
      return 'upcoming'
    case 'en periodo de gracia':
    case 'activa':
      return 'active'
    case 'cancelada':
      return 'cancelled'
    case 'liberada':
    case 'completada':
      return 'past'
    default:
      return 'past'
  }
}

// Etiqueta y colores del badge por categoría (fallback).
export const STATUS_STYLE = {
  active: {
    label: 'En curso',
    text: '#05f0a5',
    bg: 'rgba(5,240,165,0.20)',
  },
  upcoming: {
    label: 'Confirmada',
    text: '#A100FF',
    bg: 'rgba(161,0,255,0.20)',
  },
  past: {
    label: 'Finalizada',
    text: '#96968c',
    bg: 'rgba(150,150,140,0.18)',
  },
  cancelled: {
    label: 'Cancelada',
    text: '#ff5c7a',
    bg: 'rgba(255,92,122,0.16)',
  },
}

// Estilo del badge directamente desde el EstatusNombre de la BD.
// Esto permite diferenciar "En periodo de gracia" de "Activa" (post check-in)
// aunque ambos caen en la categoría 'active' para los filtros.
const STATUS_STYLE_BY_ESTATUS = {
  'próxima': {
    label: 'Confirmada',
    text: '#A100FF',
    bg: 'rgba(161,0,255,0.20)',
  },
  'en periodo de gracia': {
    label: 'En periodo de gracia',
    text: '#ffb648',
    bg: 'rgba(255,182,72,0.18)',
  },
  'activa': {
    label: 'En curso',
    text: '#05f0a5',
    bg: 'rgba(5,240,165,0.20)',
  },
  'completada': {
    label: 'Finalizada',
    text: '#96968c',
    bg: 'rgba(150,150,140,0.18)',
  },
  'liberada': {
    label: 'No-show',
    text: '#ff5c7a',
    bg: 'rgba(255,92,122,0.16)',
  },
  'cancelada': {
    label: 'Cancelada',
    text: '#ff5c7a',
    bg: 'rgba(255,92,122,0.16)',
  },
}

// Devuelve el estilo de badge para una reservación. Si el EstatusNombre
// no coincide con ninguno conocido, cae al estilo de la categoría general.
export function getStatusStyle(r) {
  const estatus = (r?.EstatusNombre || '').toLowerCase().trim()
  // 'proxima' sin acento por si la BD viene mal codificada
  const normalized = estatus === 'proxima' ? 'próxima' : estatus
  return STATUS_STYLE_BY_ESTATUS[normalized] || STATUS_STYLE[classifyReservation(r)]
}
