import { useState, useEffect } from 'react'

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
  const [floor, setFloor] = useState('piso-3')
  const [reserveFor, setReserveFor] = useState('me')
  const [timeError, setTimeError] = useState('')

  // Notify parent whenever filters change so it can re-fetch availability
  useEffect(() => {
    onFiltersChange?.({ date, entryTime, exitTime, floor, reserveFor })
  }, [date, entryTime, exitTime, floor, reserveFor])

  const validateTimes = (entry, exit) => {
    const valid = isExitAfterEntry(entry, exit)
    setTimeError(valid ? '' : 'La hora de salida debe ser después de la hora de llegada.')
    return valid
  }

  const handleReserve = () => {
    if (!validateTimes(entryTime, exitTime)) {
      return
    }

    onReserve?.({ date, entryTime, exitTime, floor, reserveFor })
  }

  const handleEntryTimeChange = (value) => {
    setEntryTime(value)
    if (timeError) {
      validateTimes(value, exitTime)
    }
  }

  const handleExitTimeChange = (value) => {
    setExitTime(value)
    if (timeError) {
      validateTimes(entryTime, value)
    }
  }

  const displayStats = stats || { available: 0, occupied: 0, total: 0 }
  const isValidTimeRange = isExitAfterEntry(entryTime, exitTime)

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
              onChange={(e) => setDate(e.target.value)}
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
              <option value="piso-1">Piso 1 — Recepción</option>
              <option value="piso-2">Piso 2 — Área Ejecutiva</option>
              <option value="piso-3">Piso 3 — Área de Trabajo General</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">▾</span>
          </div>
        </div>

        <div className="h-px bg-surface-badge w-full" />

        {/* Disponibilidad */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] text-text-muted font-semibold uppercase tracking-wide">
            Disponibilidad piso 3
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

        {/* AI Suggestion */}
        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-accent bg-accent/10">
          <span className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wide">
            Sugerencia IA
          </span>
          <p className="font-mono text-[8px] text-white leading-[1.4]">
            Basado en tu historial, IC3015 tiene 92% de disponibilidad a esta hora
            y coincide con tu zona preferida.
          </p>
          <button className="h-[26px] rounded-md bg-accent font-mono text-[10px] text-surface font-semibold cursor-pointer border-none hover:bg-accent/80 transition-colors">
            Seleccionar IC3015
          </button>
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
