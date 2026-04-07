import DeskCell from './DeskCell'
import stLogo from '../../assets/SimplicyTechLogoCompleto.png'

function DeskRow({ desks, selectedDesk, onSelect }) {
  return (
    <div className="flex gap-1">
      {desks.map((d) => (
        <DeskCell
          key={d.id}
          id={d.id}
          status={d.id === selectedDesk ? 'selected' : d.status}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function Cluster({ desks, selectedDesk, onSelect, cols = 2 }) {
  const rows = []
  for (let i = 0; i < desks.length; i += cols) {
    rows.push(desks.slice(i, i + cols))
  }
  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, i) => (
        <DeskRow key={i} desks={row} selectedDesk={selectedDesk} onSelect={onSelect} />
      ))}
    </div>
  )
}

function Room({ name, status }) {
  const isOccupied = status === 'occupied'
  return (
    <div
      className={`flex items-center justify-center rounded px-4 py-5 min-w-[80px] ${
        isOccupied ? 'bg-[#ff3246] text-white' : 'bg-accent/20 text-accent'
      }`}
    >
      <span className="font-mono text-[9px] font-semibold text-center leading-tight">
        {name}
      </span>
    </div>
  )
}

export default function FloorMap({ desks, rooms, selectedDesk, onSelectDesk }) {
  const byCluster = (c) => desks.filter((d) => d.cluster === c)

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-primary font-semibold">
            // mapa_interactivo
          </span>
          <span className="font-mono text-[13px] text-white font-semibold">
            Piso 3 — Vista de Planta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-accent/80" />
            <span className="font-mono text-[9px] text-text-muted">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#ff3246]" />
            <span className="font-mono text-[9px] text-text-muted">Ocupado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary ring-1 ring-white" />
            <span className="font-mono text-[9px] text-text-muted">Seleccionado</span>
          </div>
        </div>
      </div>

      {/* Map Canvas - scrollable */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-surface rounded-xl p-4 border border-surface-badge min-w-[700px]">
          {/* Plan Header */}
          <div className="flex items-center justify-between px-2 pb-3">
            <span className="font-mono text-[10px] text-text-muted font-semibold">
              PISO 3 — ATC MONTERREY
            </span>
            <span className="font-mono text-[9px] text-text-muted">escala 1:200</span>
          </div>

          {/* Plan Body */}
          <div className="bg-surface rounded-lg p-5 flex flex-col gap-8 border border-surface-badge/50">
            {/* Top Zone */}
            <div className="flex items-start justify-around gap-6">
              <Room name="Sala Juntas A" status={rooms[0].status} />
              <Cluster desks={byCluster(1)} selectedDesk={selectedDesk} onSelect={onSelectDesk} cols={3} />
              <Cluster desks={byCluster(2)} selectedDesk={selectedDesk} onSelect={onSelectDesk} cols={3} />
              <Room name="Sala Juntas B" status={rooms[1].status} />
            </div>

            {/* Mid Zone */}
            <div className="flex items-center justify-around gap-6">
              <Cluster desks={byCluster(3)} selectedDesk={selectedDesk} onSelect={onSelectDesk} cols={2} />
              <div className="flex items-center justify-center bg-surface-badge rounded-lg w-40 h-20">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">☕</span>
                  <span className="font-mono text-[8px] text-text-muted">ÁREA COMÚN</span>
                </div>
              </div>
              <Cluster desks={byCluster(5)} selectedDesk={selectedDesk} onSelect={onSelectDesk} cols={2} />
              <Cluster desks={byCluster(7)} selectedDesk={selectedDesk} onSelect={onSelectDesk} cols={2} />
            </div>

            {/* Bottom Zone */}
            <div className="flex items-start justify-around gap-6">
              <Room name="Media Scape" status={rooms[2].status} />
              <Cluster desks={byCluster(6)} selectedDesk={selectedDesk} onSelect={onSelectDesk} cols={3} />
            </div>

            {/* Cubículos */}
            <div className="flex justify-center">
              <DeskRow desks={byCluster('cubA')} selectedDesk={selectedDesk} onSelect={onSelectDesk} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-surface shrink-0">
        <span className="font-mono text-[9px] text-text-muted">
          Zona de Trabajo Piso 3 — 52 escritorios | Última actualización: hace 2 min
        </span>
        <span className="font-mono text-[9px] text-primary">
          Haz clic en un escritorio disponible (verde) para seleccionarlo
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-text-muted">Desarrollado por</span>
          <img src={stLogo} alt="SimplicyTech" className="h-5 w-auto" />
        </div>
      </div>
    </div>
  )
}
