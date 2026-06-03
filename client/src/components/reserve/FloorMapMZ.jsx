import DeskCell from './DeskCell'
import stLogo from '../../assets/SimplicyTechLogoCompleto.png'

/* ── Small helpers ────────────────────────── */

function DeskRow({ desks, selectedDesk, onSelect }) {
  return (
    <div className="flex gap-[3px]">
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

function Cluster({ desks, selectedDesk, onSelect, cols = 2, style }) {
  const rows = []
  for (let i = 0; i < desks.length; i += cols) {
    rows.push(desks.slice(i, i + cols))
  }
  return (
    <div
      className="absolute flex flex-col gap-[6px] rounded bg-[#0d001a] p-[6px]"
      style={style}
    >
      {rows.map((row, i) => (
        <DeskRow key={i} desks={row} selectedDesk={selectedDesk} onSelect={onSelect} />
      ))}
    </div>
  )
}

function Room({ name, code, style, restricted = false }) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center rounded-md"
      style={{
        backgroundColor: '#200040',
        border: `1px solid ${restricted ? '#ff324633' : '#A100FF33'}`,
        ...style,
      }}
    >
      <span
        className="font-mono font-semibold text-center leading-tight"
        style={{
          fontSize: 10,
          color: restricted ? '#ff324655' : '#96968c',
        }}
      >
        {name}
      </span>
      {code && (
        <span className="font-mono text-center" style={{ fontSize: 6, color: '#A100FF55' }}>
          {code}
        </span>
      )}
    </div>
  )
}

// Sala reservable: misma forma que Room pero clickeable, con estados
// available / occupied / selected igual que un DeskCell.
function SelectableRoom({ sala, name, code, style, selectedDesk, onSelect }) {
  // Si no hay sala (backend aún no responde o no existe en BD) se renderiza
  // como Room estático para no romper el mapa.
  if (!sala) {
    return <Room name={name} code={code} style={style} />
  }
  const isSelected = sala.id === selectedDesk
  const status = isSelected ? 'selected' : sala.status

  const palette = {
    available: { bg: '#05f0a533', border: '#05f0a5', label: '#05f0a5', cursor: 'pointer' },
    occupied:  { bg: '#ff324633', border: '#ff3246', label: '#ff3246', cursor: 'not-allowed' },
    selected:  { bg: '#a100ff55', border: '#ffffff', label: '#ffffff', cursor: 'pointer' },
  }
  const c = palette[status] || palette.available

  const handleClick = () => {
    if (status === 'occupied') return
    onSelect(sala.id)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`${name} — ${status}`}
      className="absolute flex flex-col items-center justify-center rounded-md transition-all"
      style={{
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        cursor: c.cursor,
        outline: 'none',
        padding: 0,
        ...style,
      }}
    >
      <span
        className="font-mono font-semibold text-center leading-tight"
        style={{ fontSize: 10, color: c.label }}
      >
        {name}
      </span>
      {code && (
        <span className="font-mono text-center" style={{ fontSize: 6, color: c.label, opacity: 0.7 }}>
          {code}
        </span>
      )}
    </button>
  )
}

/* ── Main component ────────────────────────── */

export default function FloorMapPB({ desks, salas = [], rooms, selectedDesk, onSelectDesk, loading }) {
  const byCluster = (c) => desks.filter((d) => d.cluster === c)

  const findRoom = (id) => rooms.find((r) => r.id === id)
  // Localiza una sala del backend por el código embebido en su Nombre
  // (ej. "Sierra Madre ICSJ-3040" matchea "ICSJ-3040").
  const findSala = (code) => salas.find((s) => s.id.includes(code))

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden">
      {/* Map Canvas - scrollable */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="font-mono text-sm text-white animate-pulse">Cargando mapa...</span>
          </div>
        )}
        <div
          className="rounded-lg border border-[#200040] relative"
          style={{
            width: '120%',
            minWidth: 1160,
            height: 798,
            backgroundColor: '#0a0014',
            flexShrink: 0,
          }}
        >
          {/* Plan Header */}
          <div
            className="absolute flex items-center justify-between"
            style={{ left: 0, top: 0, right: 0, height: 40, padding: '16px 24px' }}
          >
            <span className="font-heading text-sm text-white font-semibold">Mezzanine</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-accent" />
                <span className="font-mono text-text-muted" style={{ fontSize: 8 }}>
                  Disponible
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#ff3246]" />
                <span className="font-mono text-text-muted" style={{ fontSize: 8 }}>
                  Ocupado
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#77707f]" />
                <span className="font-mono text-text-muted" style={{ fontSize: 8 }}>
                  Bloqueado
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-primary" />
                <span className="font-mono text-text-muted" style={{ fontSize: 8 }}>
                  Selección
                </span>
              </div>
            </div>
          </div>

          {/* Cluster 9001–9005 (4 cols × 1 row) */}
          {/* Desks absolute placement (hardcoded bases per cluster). */}
          {(() => {
            const cellW = 50
            const cellH = 25
            const gap = 6
            const clusterBases = {
              'MZ01_MZ06': { left: 20, top: 40, cols: 6 },
              'MZ07_MZ16': { left: 20, top: 90, cols: 5 },
              'MZ17_MZ21': { left: 150, top: 200, cols: 5 },
              'MZ22_MZ29': { left: 160, top: 300, cols: 4 },
              'MZ30_MZ33': { left: 160, top: 400, cols: 2 },
              'MZ34_MZ41': { left: 160, top: 530, cols: 4 },
              'MZ42_MZ49': { left: 400, top: 530, cols: 4 },
              'MZ58_MZ65': { left: 640, top: 530, cols: 4 },
              'MZ74_MZ81': { left: 880, top: 530, cols: 4 },
              'MZ50_MZ57': { left: 400, top: 610, cols: 4 },
              'MZ66_MZ73': { left: 640, top: 610, cols: 4 },
              'MZ74_MZ81': { left: 880, top: 530, cols: 4 },
              'MZ82_MZ85': { left: 990, top: 400, cols: 2 },
              'MZ86_MZ93': { left: 880, top: 300, cols: 4 },
              'MZ94_MZ98': { left: 840, top: 200, cols: 5 },
              'MZ99_MZ104': { left: 800, top: 40, cols: 6 },
              'MZ105_MZ114': { left: 856, top: 90, cols: 5 },
            }

            return desks.map((d) => {
              const c = d.cluster || 'unknown'
              const group = desks.filter((x) => x.cluster === c).sort((a, b) => a.id.localeCompare(b.id))
              const idx = group.findIndex((x) => x.id === d.id)
              const base = clusterBases[c] || { left: 160, top: 140, cols: 4 }
              const col = idx % base.cols
              const row = Math.floor(idx / base.cols)
              const left = base.left + col * (cellW + gap)
              const top = base.top + row * (cellH + gap)

              return (
                <div
                  key={d.id}
                  style={{ position: 'absolute', left, top }}
                >
                  <DeskCell
                    id={d.id}
                    status={d.id === selectedDesk ? 'selected' : d.status}
                    onSelect={onSelectDesk}
                  />
                </div>
              )
            })
          })()}

          <SelectableRoom
            sala={findSala('Sala Mitras MZSJ-115')}
            name="Sala Mitras MZSJ-115"
            code={findRoom('SM-MZ115')?.code}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            style={{ left: 400, top: 420, width: 110, height: 90 }}
          />

          <SelectableRoom
            sala={findSala('Chipinque MZSJ-116')}
            name="Chipinque MZSJ-116"
            code={findRoom('CH-MZ116')?.code}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            style={{ left: 540, top: 420, width: 110, height: 90 }}
          />

          <SelectableRoom
            sala={findSala('Santa Lucia MZSJ-117')}
            name="Santa Lucia MZSJ-117"
            code={findRoom('SL-MZ117')?.code}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            style={{ left: 780, top: 420, width: 110, height: 90 }}
          />

        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-col gap-2 px-4 py-3 bg-surface shrink-0 md:flex-row md:items-center md:justify-between md:px-6 md:py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`w-2 h-2 rounded ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-accent'}`} />
          <span className="font-mono text-[9px] text-text-muted">
            {loading ? 'Actualizando disponibilidad...' : 'Datos en tiempo real'}
          </span>
        </div>
        <span className="font-mono text-[9px] text-primary font-bold">
          Haz clic en un escritorio disponible (verde) para seleccionarlo
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] text-text-muted">Desarrollado por</span>
          <img src={stLogo} alt="SimplicyTech" className="h-5 w-auto" />
        </div>
      </div>
    </div>
  )
}