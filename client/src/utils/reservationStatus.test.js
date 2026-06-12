import { describe, it, expect } from 'vitest'
import {
  GRACE_MINUTES,
  classifyReservation,
  getStatusStyle,
  STATUS_STYLE,
} from './reservationStatus'

describe('classifyReservation', () => {
  it('clasifica Próxima como upcoming (con y sin acento)', () => {
    expect(classifyReservation({ EstatusNombre: 'Próxima' })).toBe('upcoming')
    expect(classifyReservation({ EstatusNombre: 'Proxima' })).toBe('upcoming')
  })

  it('clasifica Activa y En periodo de gracia como active', () => {
    expect(classifyReservation({ EstatusNombre: 'Activa' })).toBe('active')
    expect(classifyReservation({ EstatusNombre: 'En periodo de gracia' })).toBe('active')
  })

  it('clasifica Cancelada como cancelled', () => {
    expect(classifyReservation({ EstatusNombre: 'Cancelada' })).toBe('cancelled')
  })

  it('clasifica Liberada y Completada como past', () => {
    expect(classifyReservation({ EstatusNombre: 'Liberada' })).toBe('past')
    expect(classifyReservation({ EstatusNombre: 'Completada' })).toBe('past')
  })

  it('ignora mayúsculas y espacios alrededor', () => {
    expect(classifyReservation({ EstatusNombre: '  ACTIVA  ' })).toBe('active')
  })

  it('cae a past con estatus desconocido, nulo o reservación inexistente', () => {
    expect(classifyReservation({ EstatusNombre: 'algo raro' })).toBe('past')
    expect(classifyReservation({})).toBe('past')
    expect(classifyReservation(null)).toBe('past')
  })
})

describe('getStatusStyle', () => {
  it('distingue En periodo de gracia de Activa aunque ambas sean active', () => {
    const gracia = getStatusStyle({ EstatusNombre: 'En periodo de gracia' })
    const activa = getStatusStyle({ EstatusNombre: 'Activa' })
    expect(gracia.label).toBe('En periodo de gracia')
    expect(activa.label).toBe('En curso')
  })

  it('etiqueta Liberada como No-show', () => {
    expect(getStatusStyle({ EstatusNombre: 'Liberada' }).label).toBe('No-show')
  })

  it('normaliza proxima sin acento al estilo de Próxima', () => {
    expect(getStatusStyle({ EstatusNombre: 'proxima' }).label).toBe('Confirmada')
  })

  it('cae al estilo de la categoría general con estatus desconocido', () => {
    expect(getStatusStyle({ EstatusNombre: 'inexistente' })).toBe(STATUS_STYLE.past)
  })
})

describe('GRACE_MINUTES', () => {
  it('es un número positivo (default 15 según SRS)', () => {
    expect(GRACE_MINUTES).toBeGreaterThan(0)
  })
})
