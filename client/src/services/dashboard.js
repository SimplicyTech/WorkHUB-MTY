import { apiRequest } from './api'

export const DASHBOARD_REFRESH_EVENT = 'workhub:dashboard-refresh'
export const DASHBOARD_REFRESH_KEY = 'workhub_dashboard_refresh'

export function notifyDashboardChanged() {
  const timestamp = String(Date.now())
  localStorage.setItem(DASHBOARD_REFRESH_KEY, timestamp)
  window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT, { detail: { timestamp } }))
}

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const firstValue = (source, keys, fallback = 0) => {
  if (!source) return fallback

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key]
  }

  return fallback
}

const formatFloorLabel = (row) => {
  const label = firstValue(row, ['label', 'Label', 'nombre', 'Nombre', 'PisoNombre'], '')
  if (label) return String(label)

  const piso = firstValue(row, ['Piso', 'piso', 'PisoID', 'pisoId'], '')
  return piso ? `Piso ${piso}` : 'Sin piso'
}

const isTotalRow = (row) => {
  if (row?.Piso === null || row?.piso === null) return true

  const piso = firstValue(row, ['Piso', 'piso', 'label', 'Label'], '')
  const normalized = String(piso).trim().toUpperCase()
  return normalized === 'TOTAL' || normalized === '0'
}

const normalizeRollupRows = (rows = []) => rows.map((row) => ({
  ...row,
  Piso: firstValue(row, ['Piso', 'piso', 'PisoID', 'pisoId'], ''),
  total: toNumber(firstValue(row, ['total', 'Total', 'totalSpaces', 'total_espacios'])),
  ocupados: toNumber(firstValue(row, ['ocupados', 'occupied', 'occupiedSpaces', 'ocupadosSpaces'])),
  disponibles: toNumber(firstValue(row, ['disponibles', 'available', 'availableSpaces'])),
}))

const buildStats = (raw, rows) => {
  const rawStats = raw?.stats || raw?.estadisticas || {}
  const totalRow = rows.find(isTotalRow)

  const totalSpaces = toNumber(firstValue(rawStats, ['totalSpaces', 'totalEspacios', 'total_espacios', 'total'])) || toNumber(totalRow?.total)
  const occupiedSpaces = toNumber(firstValue(rawStats, ['occupiedSpaces', 'ocupados', 'espaciosOcupados', 'occupied'])) || toNumber(totalRow?.ocupados)
  const availableSpaces = toNumber(firstValue(rawStats, ['availableSpaces', 'disponibles', 'espaciosDisponibles', 'available'])) || toNumber(totalRow?.disponibles)
  const parkingTotal = toNumber(firstValue(rawStats, ['parkingTotal', 'totalParking', 'estacionamientos', 'cajones'], 0))
  const parkingOccupied = toNumber(firstValue(rawStats, ['parkingOccupied', 'occupiedParking', 'cajonesOcupados'], 0))
  const blockedSpaces = toNumber(firstValue(rawStats, ['blockedSpaces', 'bloqueados', 'mantenimiento'], 0))
  const rawPercent = firstValue(rawStats, ['occupancyPercent', 'porcentajeOcupacion', 'ocupacion', 'ocupacionPercent'], null)
  const occupancyPercent = rawPercent !== null
    ? toNumber(rawPercent)
    : totalSpaces > 0
      ? Math.round((occupiedSpaces / totalSpaces) * 100)
      : 0

  return {
    totalSpaces,
    occupiedSpaces,
    availableSpaces,
    parkingTotal,
    parkingOccupied,
    blockedSpaces,
    occupancyPercent,
  }
}

const buildFloors = (raw, rows) => {
  const source = Array.isArray(raw?.floors)
    ? raw.floors
    : Array.isArray(raw?.pisos)
      ? raw.pisos
      : rows.filter((row) => !isTotalRow(row))

  return source.map((floor) => {
    const total = toNumber(firstValue(floor, ['total', 'Total', 'totalSpaces']))
    const occupied = toNumber(firstValue(floor, ['occupied', 'ocupados', 'occupiedSpaces']))
    const available = toNumber(firstValue(floor, ['available', 'disponibles', 'availableSpaces'], Math.max(total - occupied, 0)))
    const rawPercent = firstValue(floor, ['occupancyPercent', 'porcentajeOcupacion', 'value'], null)

    return {
      label: formatFloorLabel(floor),
      pisoId: firstValue(floor, ['pisoId', 'PisoID', 'Piso', 'piso'], null),
      total,
      occupied,
      available,
      occupancyPercent: rawPercent !== null
        ? toNumber(rawPercent)
        : total > 0
          ? Math.round((occupied / total) * 100)
          : 0,
    }
  }).filter((floor) => floor.total > 0 || floor.occupied > 0 || floor.available > 0)
}

const buildZones = (raw, selectedFloor) => {
  const source = Array.isArray(raw?.zones)
    ? raw.zones
    : Array.isArray(raw?.zonas)
      ? raw.zonas
      : []

  if (source.length > 0) {
    return source.map((zone, index) => ({
      label: String(firstValue(zone, ['label', 'zona', 'Zona', 'nombre', 'Nombre'], `Zona ${index + 1}`)),
      value: toNumber(firstValue(zone, ['value', 'occupancyPercent', 'porcentajeOcupacion', 'ocupacion'])),
      color: firstValue(zone, ['color'], index === 1 ? '#16e0a3' : '#a100ff'),
    }))
  }

  if (!selectedFloor) return []

  return [
    { label: selectedFloor.label, value: selectedFloor.occupancyPercent, color: '#a100ff' },
    {
      label: 'Disponibles',
      value: selectedFloor.total > 0 ? Math.round((selectedFloor.available / selectedFloor.total) * 100) : 0,
      color: '#16e0a3',
    },
    { label: 'Ocupados', value: selectedFloor.occupancyPercent, color: '#ff3355' },
  ]
}

const buildRecentActivity = (raw) => {
  const source = Array.isArray(raw?.recentActivity)
    ? raw.recentActivity
    : Array.isArray(raw?.actividadReciente)
      ? raw.actividadReciente
      : []

  return source.map((entry, index) => ({
    id: firstValue(entry, ['id', 'ReservacionID', 'reservacionId'], index),
    text: String(firstValue(entry, ['text', 'texto', 'descripcion', 'Descripcion'], 'Movimiento registrado')),
    time: String(firstValue(entry, ['time', 'hora', 'HoraInicio'], '')).slice(0, 5),
    status: String(firstValue(entry, ['status', 'estatus', 'EstatusNombre'], 'Reservacion')),
  }))
}

export const normalizeDashboardResponse = (raw = {}) => {
  const rows = normalizeRollupRows(Array.isArray(raw.data) ? raw.data : [])
  const stats = buildStats(raw, rows)
  const floors = buildFloors(raw, rows)
  const selectedFloor = floors.find((floor) => Number(floor.pisoId) === 3)
    || floors.find((floor) => floor.label.toLowerCase() === String(raw.selectedFloor || '').toLowerCase())
    || floors[0]
    || null

  return {
    ...raw,
    success: raw.success !== false,
    data: rows,
    stats,
    floors,
    zones: buildZones(raw, selectedFloor),
    selectedFloor: raw.selectedFloor || selectedFloor?.label || null,
    recentActivity: buildRecentActivity(raw),
    lastUpdated: raw.lastUpdated || new Date().toISOString(),
    hasBackendData: stats.totalSpaces > 0 || floors.length > 0 || rows.length > 0,
  }
}

export const getDashboardRequest = async () => {
  const response = await apiRequest('/dashboard')
  return normalizeDashboardResponse(response)
}
