import { useState, useEffect } from 'react'

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function BookingSidebar({
  selectedDesk,
  onReserve,
  stats,
  loadingStats,
  onFiltersChange,
}) {
  const [date, setDate] = useState(getTodayString)
  const [entryTime, setEntryTime] = useState('09:00')
  const [exitTime, setExitTime] = useState('18:00')
  const [floor, setFloor] = useState('piso-3')
  const [reserveFor, setReserveFor] = useState('me')

  // Notify parent whenever filters change so it can re-fetch availability
  useEffect(() => {
    onFiltersChange?.({ date, entryTime, exitTime, floor, reserveFor })
  }, [date, entryTime, exitTime, floor, reserveFor])

  const handleReserve = () => {
    onReserve?.({ date, entryTime, exitTime, floor, reserveFor })
  }

  const displayStats = stats || { available: 0, occupied: 0, total: 0 }

  return (
    <div className="w-full lg:w-[360px] lg:shrink-0 bg-surface flex flex-col lg:h-full">
      {/* Header */}
      <div className="bg-surface-card px-4 sm:px-6 py-5 flex flex-col gap-2">
        <span className="font-mono text-[11px] text-primary font-semibold">
          // reservar_mi_lugar
        </span>
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
            reservar_para
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
            fecha
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getTodayString()}
              className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">📅</span>
          </div>
        </div>

        {/* Horario */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="font-mono text-[11px] text-white font-semibold">
              hora_entrada
            </label>
            <div className="relative">
              <input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">⏱</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="font-mono text-[11px] text-white font-semibold">
              hora_salida
            </label>
            <div className="relative">
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">⏱</span>
            </div>
          </div>
        </div>

        {/* Piso */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white font-semibold">
            piso
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
          <span className="font-mono text-[10px] text-primary font-semibold">
            // disponibilidad_piso_3
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
          <div className="flex items-center gap-1.5">
            <span className="text-accent text-sm">✨</span>
            <span className="font-mono text-[10px] text-accent font-semibold">
              sugerencia_ia
            </span>
          </div>
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
          disabled={!selectedDesk}
          className={`h-[52px] rounded-lg font-heading text-base font-semibold flex items-center justify-center gap-2 cursor-pointer border-none transition-colors ${
            selectedDesk
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
