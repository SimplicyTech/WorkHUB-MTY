import { useState, useEffect } from 'react'
import { getPisos } from '../../services/reservations'

// PisoID que actualmente tiene mapa interactivo implementado.
// El resto de los pisos se listan pero quedan deshabilitados.
const PISO_CON_MAPA_ID = 2

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTimeMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getDefaultTimes() {
  const now = new Date()
  const entry = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const later = new Date(now.getTime() + 60 * 60 * 1000)
  const exit = later.getDate() !== now.getDate()
    ? '23:59'
    : `${String(later.getHours()).padStart(2, '0')}:${String(later.getMinutes()).padStart(2, '0')}`
  return { entry, exit }
}

function isExitAfterEntry(entryTime, exitTime) {
  return getTimeMinutes(exitTime) > getTimeMinutes(entryTime)
}

function isToday(dateStr) {
  return dateStr === getTodayString()
}

function getNowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export default function BookingSidebar({
  selectedDesk,
  onReserve,
  stats,
  loadingStats,
  onFiltersChange,
}) {
  const defaultTimes = getDefaultTimes()
  const [date, setDate] = useState(getTodayString)
  const [entryTime, setEntryTime] = useState(defaultTimes.entry)
  const [exitTime, setExitTime] = useState(defaultTimes.exit)
  const [floor, setFloor] = useState(String(PISO_CON_MAPA_ID))
  const [pisos, setPisos] = useState([])

  useEffect(() => {
    let cancelled = false
    getPisos()
      .then((res) => {
        if (cancelled) return
        setPisos(res.data || [])
      })
      .catch((err) => {
        console.error('Error al cargar pisos:', err)
      })
    return () => {
      cancelled = true
    }
  }, [])
  const [reserveFor, setReserveFor] = useState('me')
  const [timeError, setTimeError] = useState('')

  // Notify parent whenever filters change so it can re-fetch availability
  useEffect(() => {
    onFiltersChange?.({ date, entryTime, exitTime, floor, reserveFor })
  }, [date, entryTime, exitTime, floor, reserveFor])

  const validateTimes = (entry, exit, selectedDate = date) => {
    if (!isExitAfterEntry(entry, exit)) {
      setTimeError('La hora de salida debe ser después de la hora de llegada.')
      return false
    }
    if (isToday(selectedDate) && getTimeMinutes(entry) < getNowMinutes()) {
      setTimeError('No puedes reservar en una hora que ya pasó.')
      return false
    }
    setTimeError('')
    return true
  }

  const handleReserve = () => {
    if (!validateTimes(entryTime, exitTime)) {
      return
    }

    onReserve?.({ date, entryTime, exitTime, floor, reserveFor })
  }

  const handleEntryTimeChange = (value) => {
    setEntryTime(value)
    validateTimes(value, exitTime)
  }

  const handleExitTimeChange = (value) => {
    setExitTime(value)
    validateTimes(entryTime, value)
  }

  const handleDateChange = (value) => {
    setDate(value)
    validateTimes(entryTime, exitTime, value)
  }

  const displayStats = stats || { available: 0, occupied: 0, total: 0 }
  const isPastEntryToday = isToday(date) && getTimeMinutes(entryTime) < getNowMinutes()
  const isValidTimeRange = isExitAfterEntry(entryTime, exitTime) && !isPastEntryToday

  return (
    <div className="w-full lg:w-[360px] lg:shrink-0 bg-surface flex flex-col lg:h-full">
      {/* Header */}
      <div className="bg-surface-card px-4 sm:px-6 py-5 flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-bold text-white">
          Nueva Reservación
        </h2>
        <p className="font-mono text-[11px] text-text-muted">
          Selecciona fecha, horario y ubicación
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-3.5 overflow-y-visible lg:overflow-y-auto">
        {/* Reservar para */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white font-semibold">
            Reservar para
          </label>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
            <button
              onClick={() => setReserveFor('me')}
              className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg font-mono text-xs cursor-pointer border-none transition-colors ${
                reserveFor === 'me'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-surface-badge text-text-muted hover:bg-surface-badge/80'
              }`}
            >
              Para mí
            </button>
            <button
              onClick={() => setReserveFor('visitor')}
              className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg font-mono text-xs cursor-pointer border-none transition-colors ${
                reserveFor === 'visitor'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-surface-badge text-text-muted hover:bg-surface-badge/80'
              }`}
            >
              Para un visitante
            </button>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white font-semibold">
            Fecha
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={getTodayString()}
              className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Horario */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="font-mono text-[11px] text-white font-semibold">
              Hora Entrada
            </label>
            <div className="relative">
              <input
                type="time"
                value={entryTime}
                min={isToday(date) ? `${String(Math.floor(getNowMinutes() / 60)).padStart(2, '0')}:${String(getNowMinutes() % 60).padStart(2, '0')}` : undefined}
                onChange={(e) => handleEntryTimeChange(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="font-mono text-[11px] text-white font-semibold">
              Hora Salida
            </label>
            <div className="relative">
              <input
                type="time"
                value={exitTime}
                min={entryTime}
                onChange={(e) => handleExitTimeChange(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
        {timeError && (
          <p className="font-mono text-[11px] text-red-400">
            {timeError}
          </p>
        )}

        {/* Piso */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white font-semibold">
            Piso
          </label>
          <div className="relative">
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer appearance-none [color-scheme:dark]"
            >
              {pisos.length === 0 ? (
                <option value="">Cargando pisos...</option>
              ) : (
                pisos.map((p) => {
                  const hasMap = p.PisoID === PISO_CON_MAPA_ID
                  return (
                    <option key={p.PisoID} value={String(p.PisoID)} disabled={!hasMap}>
                      {p.Nombre}{hasMap ? '' : ' — Próximamente'}
                    </option>
                  )
                })
              )}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">▾</span>
          </div>
        </div>

        <div className="h-px bg-surface-badge w-full" />

        {/* Disponibilidad */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] text-text-muted font-semibold uppercase tracking-wide">
            Disponibilidad {pisos.find((p) => String(p.PisoID) === floor)?.Nombre || ''}
          </span>
          <div className="flex gap-1.5">
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg bg-surface-badge">
              <span className="font-heading text-[22px] font-bold text-accent">
                {loadingStats ? '…' : displayStats.available}
              </span>
              <span className="font-mono text-[8px] text-text-muted">disponibles</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg bg-surface-badge">
              <span className="font-heading text-[22px] font-bold text-[#ff3246]">
                {loadingStats ? '…' : displayStats.occupied}
              </span>
              <span className="font-mono text-[8px] text-text-muted">ocupados</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg bg-surface-badge">
              <span className="font-heading text-[22px] font-bold text-white">
                {loadingStats ? '…' : displayStats.total}
              </span>
              <span className="font-mono text-[8px] text-text-muted">total</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="bg-surface-card px-4 sm:px-6 py-4 flex flex-col gap-2 lg:shrink-0">
        <button
          onClick={handleReserve}
          disabled={!selectedDesk || !isValidTimeRange}
          className={`h-[52px] rounded-lg font-heading text-base font-semibold flex items-center justify-center gap-2 cursor-pointer border-none transition-colors ${
            selectedDesk && isValidTimeRange
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-primary/50 text-white/50 cursor-not-allowed'
          }`}
        >
          RESERVAR ESPACIO
        </button>
        <p className="font-mono text-[9px] text-text-muted text-center">
          {selectedDesk
            ? `Escritorio seleccionado: ${selectedDesk}`
            : 'Selecciona un escritorio en el mapa para continuar'}
        </p>
      </div>
    </div>
  )
}
