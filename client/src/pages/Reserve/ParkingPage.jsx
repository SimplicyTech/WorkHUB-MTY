import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ParkingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    deskId = 'D-304',
    espacioID,
    date,
    entryTime,
    exitTime,
    reserveFor,
  } = location.state || {}

  const [selectedOption, setSelectedOption] = useState('yes')

  const handleContinue = () => {
    navigate('/confirmacion', {
      state: {
        deskId,
        espacioID,
        date,
        entryTime,
        exitTime,
        reserveFor,
        parking: selectedOption === 'yes',
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col">
      {/* Progress Bar */}
      <div className="bg-surface-card px-4 sm:px-6 md:px-12 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="font-mono text-[11px] text-accent font-semibold">
          Escritorio reservado
        </span>
        <span className="text-text-muted text-sm">›</span>
        <span className="font-mono text-[11px] text-primary font-semibold">
          Estacionamiento
        </span>
        <span className="text-text-muted text-sm">›</span>
        <span className="font-mono text-[11px] text-text-muted">
          Confirmación
        </span>
      </div>

      {/* Centered Content */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="parking-card w-full max-w-[560px] rounded-lg overflow-hidden border border-[#1f003d] my-auto">
          {/* Card Header */}
          <div className="bg-surface-card px-5 sm:px-10 py-7 sm:py-8 flex flex-col gap-3">
            <h2 className="font-heading text-2xl sm:text-[28px] font-bold text-white m-0">
              ¿Necesitas Estacionamiento?
            </h2>
            <p className="font-mono text-[11px] text-text-muted leading-[1.6] m-0">
              Tu escritorio {deskId} en Piso 3 está reservado. Indica si
              necesitas un espacio de estacionamiento para tu visita.
            </p>
          </div>

          {/* Options */}
          <div className="px-5 sm:px-10 py-6 flex flex-col gap-4 bg-[#0d0015]">
            {/* Yes Option */}
            <button
              onClick={() => setSelectedOption('yes')}
              className={`parking-option w-full flex items-start sm:items-center gap-4 p-4 sm:p-5 rounded-lg border-none cursor-pointer transition-all ${
                selectedOption === 'yes'
                  ? 'bg-[#200040] ring-2 ring-primary'
                  : 'bg-[#0d0015] ring-1 ring-[#2a2a2a] hover:ring-primary/50'
              }`}
            >
              <div className="flex-1 flex flex-col gap-1 text-left">
                <span
                  className={`font-heading text-lg font-semibold transition-colors ${
                    selectedOption === 'yes' ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  Sí, necesito estacionamiento
                </span>
                <span
                  className={`font-mono text-[10px] leading-[1.5] transition-colors ${
                    selectedOption === 'yes'
                      ? 'text-text-muted'
                      : 'text-[#5a5a5a]'
                  }`}
                >
                  Se asignará un espacio de estacionamiento automáticamente para
                  tu reserva
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full shrink-0 transition-all ${
                  selectedOption === 'yes' ? 'bg-primary' : 'border-2 border-[#5a5a5a]'
                }`}
              />
            </button>

            {/* No Option */}
            <button
              onClick={() => setSelectedOption('no')}
              className={`parking-option w-full flex items-start sm:items-center gap-4 p-4 sm:p-5 rounded-lg border-none cursor-pointer transition-all ${
                selectedOption === 'no'
                  ? 'bg-[#200040] ring-2 ring-primary'
                  : 'bg-[#0d0015] ring-1 ring-[#2a2a2a] hover:ring-primary/50'
              }`}
            >
              <div className="flex-1 flex flex-col gap-1 text-left">
                <span
                  className={`font-heading text-lg font-semibold transition-colors ${
                    selectedOption === 'no' ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  No, continuar sin estacionamiento
                </span>
                <span
                  className={`font-mono text-[10px] leading-[1.5] transition-colors ${
                    selectedOption === 'no'
                      ? 'text-text-muted'
                      : 'text-[#5a5a5a]'
                  }`}
                >
                  Ir directamente a la confirmación de tu reserva
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full shrink-0 transition-all ${
                  selectedOption === 'no' ? 'bg-primary' : 'border-2 border-[#5a5a5a]'
                }`}
              />
            </button>

          </div>

          {/* Info Section */}
          <div className="px-5 sm:px-10 py-4 bg-[#0d0015]">
            <span className="font-mono text-[10px] text-text-muted leading-[1.5]">
              La asignación de cajón será automática y se confirmará al momento
              de tu llegada.
            </span>
          </div>

          {/* Bottom Action */}
          <div className="bg-surface-card px-5 sm:px-10 py-6 flex flex-col gap-3">
            <button
              onClick={handleContinue}
              className="parking-continue-btn h-[52px] rounded-lg bg-primary font-heading text-base font-semibold text-white flex items-center justify-center cursor-pointer border-none hover:bg-primary-dark transition-colors"
            >
              CONTINUAR
            </button>
            <p className="font-mono text-[9px] text-text-muted text-center m-0">
              Al continuar, se confirmará tu preferencia de estacionamiento
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
