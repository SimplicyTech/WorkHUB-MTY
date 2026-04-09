import { useState } from 'react'
import { floorStats } from '../../data/floorData'

export default function BookingSidebar({ selectedDesk, onReserve }) {
  const [date, setDate] = useState('2026-02-27')
  const [entryTime, setEntryTime] = useState('09:00')
  const [exitTime, setExitTime] = useState('18:00')
  const [floor, setFloor] = useState('piso-3')
  const [reserveFor, setReserveFor] = useState('me')
  const [spaceType, setSpaceType] = useState('desk')

  return (
    <div className="w-[360px] shrink-0 bg-surface flex flex-col h-full">
      {/* Header */}
      <div className="bg-surface-card px-6 py-5 flex flex-col gap-2">
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
      <div className="flex-1 px-6 py-5 flex flex-col gap-3.5 overflow-y-auto">
        {/* Reservar para */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white font-semibold">
            reservar_para
          </label>
          <div className="flex gap-2">
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
              className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer [color-scheme:dark]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">📅</span>
          </div>
        </div>

        {/* Horario */}
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
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
          <div className="flex-1 flex flex-col gap-1.5">
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

        {/* Tipo de espacio */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] text-white font-semibold">
            tipo_de_espacio
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSpaceType('desk')}
              className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg font-mono text-[11px] cursor-pointer border-none transition-colors ${
                spaceType === 'desk'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-surface-badge text-text-muted hover:bg-surface-badge/80'
              }`}
            >
              Escritorio
            </button>
            <button
              onClick={() => setSpaceType('parking')}
              className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg font-mono text-[11px] cursor-pointer border-none transition-colors ${
                spaceType === 'parking'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-surface-badge text-text-muted hover:bg-surface-badge/80'
              }`}
            >
              Estacionamiento
            </button>
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
                {floorStats.available}
              </span>
              <span className="font-mono text-[8px] text-text-muted">disponibles</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg bg-surface-badge">
              <span className="font-heading text-[22px] font-bold text-[#ff3246]">
                {floorStats.occupied}
              </span>
              <span className="font-mono text-[8px] text-text-muted">ocupados</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg bg-surface-badge">
              <span className="font-heading text-[22px] font-bold text-white">
                {floorStats.total}
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
      <div className="bg-surface-card px-6 py-4 flex flex-col gap-2">
        <button
          onClick={onReserve}
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
