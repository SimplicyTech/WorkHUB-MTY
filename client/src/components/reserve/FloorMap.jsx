import DeskCell from './DeskCell'
import stLogo from '../../assets/SimplicyTechLogoCompleto.png'

/* ── Small helpers ────────────────────────── */

function DeskRow({ desks, selectedDesk, onSelect }) {
  return (
    <div className="flex gap-[6px]">
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

function Cluster({ desks, selectedDesk, onSelect, cols = 4, style }) {
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

function ISAArea({ desks, selectedDesk, onSelect }) {
  const row1 = desks.slice(0, 3)
  const row2 = desks.slice(3)
  return (
    <div
      className="absolute flex flex-col gap-1 rounded-md p-3"
      style={{
        left: 52,
        top: 60,
        backgroundColor: '#200040',
        border: '1px solid #A100FF33',
      }}
    >
      <span
        className="font-mono font-semibold leading-tight"
        style={{ fontSize: 10, color: '#96968c', maxWidth: 129 }}
      >
        AREA DE ATENCION A USUARIOS ISA/IT
      </span>
      <div className="flex gap-[6px]">
        {row1.map((d) => (
          <DeskCell
            key={d.id}
            id={d.id}
            status={d.id === selectedDesk ? 'selected' : d.status}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="flex gap-[6px]">
        {row2.map((d) => (
          <DeskCell
            key={d.id}
            id={d.id}
            status={d.id === selectedDesk ? 'selected' : d.status}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────── */

export default function FloorMap({ desks, salas = [], rooms, selectedDesk, onSelectDesk, loading }) {
  const byCluster = (c) => desks.filter((d) => d.cluster === c)

  const findRoom = (id) => rooms.find((r) => r.id === id)
  // Localiza una sala del backend por el código embebido en su Nombre
  // (ej. "Sierra Madre ICSJ-3040" matchea "ICSJ-3040").
  const findSala = (code) => salas.find((s) => s.id.includes(code))

  return (
    <div className="flex-1 flex flex-col min-h-[620px] lg:h-full min-w-0">
      {/* Map Canvas - scrollable */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="font-mono text-sm text-white animate-pulse">Cargando mapa...</span>
          </div>
        )}
        <div
          className="rounded-lg border border-[#200040] relative"
          style={{
            width: '100%',
            minWidth: 1010,
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
            <span className="font-heading text-sm text-white font-semibold">Piso 3</span>
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
                <span className="w-2 h-2 rounded bg-primary" />
                <span className="font-mono text-text-muted" style={{ fontSize: 8 }}>
                  Selección
                </span>
              </div>
            </div>
          </div>


          {/* ISA/IT Area with desks */}
          <ISAArea
            desks={byCluster('isa')}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
          />

          {/* Comedor 1 */}
          <Room
            name="COMEDOR 1"
            code={findRoom('comedor-1')?.code}
            style={{ left: 312, top: 80, width: 200, height: 70 }}
          />

          {/* Sala Lectura */}
          <Room
            name="SALA LECTURA"
            code={findRoom('sala-lectura')?.code}
            style={{ left: 662, top: 60, width: 90, height: 60 }}
          />

          {/* Data Center (restricted) */}
          <Room
            name="DATA CENTER"
            restricted
            style={{ left: 872, top: 60, width: 130, height: 60 }}
          />

          {/* Cluster IC3006–IC3013 (4 cols × 2 rows) */}
          <Cluster
            desks={byCluster('c06_13')}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            cols={4}
            style={{ left: 582, top: 140 }}
          />

          {/* Cluster IC3030–IC3035 (3 cols × 2 rows) */}
          <Cluster
            desks={byCluster('c30_35')}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            cols={3}
            style={{ left: 832, top: 140 }}
          />

          {/* Cluster IC3014–IC3021 (4 cols × 2 rows) */}
          <Cluster
            desks={byCluster('c14_21')}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            cols={4}
            style={{ left: 582, top: 260 }}
          />

          {/* Cluster IC3036–IC3039 (2 cols × 2 rows) */}
          <Cluster
            desks={byCluster('c36_39')}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            cols={2}
            style={{ left: 832, top: 261 }}
          />

          {/* Comedor 2 */}
          <Room
            name="COMEDOR 2"
            code={findRoom('comedor-2')?.code}
            style={{ left: 73, top: 320, width: 180, height: 70 }}
          />

          {/* Sierra Madre */}
          <SelectableRoom
            sala={findSala('ICSJ-3040')}
            name="SIERRA MADRE"
            code={findRoom('sierra-madre')?.code}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            style={{ left: 335, top: 350, width: 200, height: 80 }}
          />

          {/* Cluster IC3022–IC3029 (4 cols × 2 rows) */}
          <Cluster
            desks={byCluster('c22_29')}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            cols={4}
            style={{ left: 582, top: 390 }}
          />

          {/* Bunker */}
          <Room
            name="Bunker"
            style={{ left: 632, top: 510, width: 90, height: 50 }}
          />

          {/* Lounge */}
          <Room
            name="LOUNGE"
            code={findRoom('lounge')?.code}
            style={{ left: 96, top: 514, width: 150, height: 60 }}
          />

          {/* Touch Point */}
          <SelectableRoom
            sala={findSala('ICTP-3042')}
            name="TOUCH POINT"
            code={findRoom('touch-point')?.code}
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            style={{ left: 370, top: 524, width: 150, height: 60 }}
          />

          {/* La Silla */}
          <SelectableRoom
            sala={findSala('ICSJ-3041')}
            name="LA SILLA"
            code="ICSJ-3041 · Sala Junta Grande"
            selectedDesk={selectedDesk}
            onSelect={onSelectDesk}
            style={{ left: 230, top: 632, width: 380, height: 110 }}
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
