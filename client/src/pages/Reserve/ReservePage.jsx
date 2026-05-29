import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingSidebar from '../../components/reserve/BookingSidebar'
import FloorMap from '../../components/reserve/FloorMap'
import { getEspaciosDisponibilidad } from '../../services/reservations'
import { rooms as fallbackRooms } from '../../data/floorData'

function normalizeName(nombre) {
  return String(nombre || '').trim().toUpperCase()
}

function mapEstadoToStatus(estado) {
  const value = String(estado || '').trim().toLowerCase()
  if (['ocupado', 'reservado', 'no disponible', 'indisponible', 'inactivo', 'blocked'].includes(value)) {
    return 'occupied'
  }
  if (['activo', 'disponible', 'available', 'free'].includes(value)) {
    return 'available'
  }
  return 'available'
}

function mapEspaciosToDesks(espacios) {
  return (espacios || [])
    .filter((e) => {
      const name = normalizeName(e.Nombre)
      const tipo = String(e.Tipo || '').trim().toLowerCase()
      const isDeskType = ['oficina', 'escritorio', 'desk', 'office'].includes(tipo)
      const isDeskName = /^IC3\d+$/i.test(name) || /^PB0?\d{1,4}$/i.test(name) || /^MZ\d+$/i.test(name) || /^\d{3,4}$/.test(name)
      return isDeskType || isDeskName
    })
    .map((e) => {
      const name = String(e.Nombre || '').trim()
      return {
        id: name,
        espacioID: e.EspacioID,
        cluster: getCluster(name),
        status: mapEstadoToStatus(e.Estado || e.status),
      }
    })
}

// Salas reservables del piso (Tipo='Sala' en BD).
// El FloorMap las localiza por el código incrustado en el Nombre
// (ej. "Sierra Madre ICSJ-3040" contiene "ICSJ-3040").
function mapEspaciosToSalas(espacios) {
  return (espacios || [])
    .filter((e) => String(e.Tipo || '').trim().toLowerCase() === 'sala')
    .map((e) => ({
      id: String(e.Nombre || '').trim(),
      espacioID: e.EspacioID,
      status: mapEstadoToStatus(e.Estado || e.status),
    }))
}

function getCluster(nombre) {
  const normalized = normalizeName(nombre)
  const num = parseInt(normalized.replace(/\D/g, ''), 10)

  if (normalized.startsWith('MZ')) {
    if (num >= 1 && num <= 6) return 'MZ01_MZ06'
    if (num >= 7 && num <= 16) return 'MZ07_MZ16'
    if (num >= 17 && num <= 21) return 'MZ17_MZ21'
    if (num >= 22 && num <= 29) return 'MZ22_MZ29'
    if (num >= 30 && num <= 33) return 'MZ30_MZ33'
    if (num >= 34 && num <= 41) return 'MZ34_MZ41'
    if (num >= 42 && num <= 49) return 'MZ42_MZ49'
    if (num >= 50 && num <= 57) return 'MZ50_MZ57'
    if (num >= 58 && num <= 65) return 'MZ58_MZ65'
    if (num >= 66 && num <= 73) return 'MZ66_MZ73'
    if (num >= 74 && num <= 81) return 'MZ74_MZ81'
    if (num >= 82 && num <= 85) return 'MZ82_MZ85'
    if (num >= 86 && num <= 93) return 'MZ86_MZ93'
    if (num >= 94 && num <= 98) return 'MZ94_MZ98'
    if (num >= 99 && num <= 104) return 'MZ99_MZ104'
    if (num >= 105 && num <= 114) return 'MZ105_MZ114'
      else return 'mz'
  }

  if (/^PB/i.test(normalized) || /^\d{3,4}$/.test(normalized)) {
    if (num >= 1 && num <= 7) return 'PB01_PB07'
    if (num >= 8 && num <= 17) return 'PB08_PB17'
    if (num >= 18 && num <= 23) return 'PB18_PB23'
    if ((num >= 24 && num <= 27) || (num >= 40 && num <= 43)) return 'PB24_PB43'
    if ((num >= 28 && num <= 31) || (num >= 44 && num <= 47)) return 'PB28_PB47'
    if ((num >= 32 && num <= 35) || (num >= 48 && num <= 51)) return 'PB32_PB51'
    if ((num >= 36 && num <= 39) || (num >= 52 && num <= 55)) return 'PB36_PB55'
    if ((num >= 56 && num <= 59) || (num >= 64 && num <= 67)) return 'PB56_PB67'
    if ((num >= 60 && num <= 63) || (num >= 68 && num <= 71)) return 'PB60_PB71'
  }

  if (/^IC3/i.test(normalized)) {
    if (num >= 3001 && num <= 3005) return 'isa'
    if (num >= 3006 && num <= 3013) return 'c06_13'
    if (num >= 3014 && num <= 3021) return 'c14_21'
    if (num >= 3022 && num <= 3029) return 'c22_29'
    if (num >= 3030 && num <= 3035) return 'c30_35'
    if (num >= 3036 && num <= 3039) return 'c36_39'
  }

  if (num >= 9001 && num <= 9005) return '9001_9005'
  if (num >= 9006 && num <= 9015) return '9006_9015'
  if (num >= 9016 && num <= 9022) return '9016_9022'
  if (num >= 9023 && num <= 9030) return '9023_9030'
  if (num >= 9031 && num <= 9034) return '9031_9034'
  if (num >= 9035 && num <= 9036) return '9035_9036'
  if (num >= 9037 && num <= 9040) return '9037_9040'
  if (num >= 9041 && num <= 9048) return '9041_9048'
  if (num >= 9049 && num <= 9052) return '9049_9052'
  if (num >= 9053 && num <= 9056) return '9053_9056'
  if (num >= 9057 && num <= 9060) return '9057_9060'
  if (num >= 9061 && num <= 9064) return '9061_9064'
  if (num >= 9065 && num <= 9072) return '9065_9072'
  if (num >= 9073 && num <= 9074) return '9073_9074'
  if (num >= 9075 && num <= 9078) return '9075_9078'
  if (num >= 9079 && num <= 9086) return '9079_9086'

  return 'unknown'
}

export default function ReservePage() {
  const navigate = useNavigate()
  const [selectedDesk, setSelectedDesk] = useState(null)
  const [deskData, setDeskData] = useState([])
  const [salasData, setSalasData] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fechaBloqueada, setFechaBloqueada] = useState(null)
  const [floor, setFloor] = useState(null)

  // Track current filters from the sidebar
  const filtersRef = useRef({ date: '', entryTime: '09:00', exitTime: '18:00' })

  const fetchAvailability = useCallback(async (filters) => {
    if (!filters.date || !filters.entryTime || !filters.exitTime) return
    setLoading(true)
    setError(null)
    try {
      const res = await getEspaciosDisponibilidad(
        filters.date,
        filters.entryTime,
        filters.exitTime,
        filters.floor
      )
      const desks = mapEspaciosToDesks(res.data || [])
      const salas = mapEspaciosToSalas(res.data || [])
      setDeskData(desks)
      setSalasData(salas)
      setStats(res.stats || null)
    } catch (err) {
      console.error('Error fetching availability:', err)
      setError(err?.error || 'Error al obtener disponibilidad')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFiltersChange = useCallback(
    (filters) => {
      filtersRef.current = filters
      setFloor(filters?.floor || null)
      setFechaBloqueada(filters?.fechaBloqueada || null)
      // Deselect desk when filters change
      setSelectedDesk(null)
      fetchAvailability(filters)
    },
    [fetchAvailability]
  )

  const handleSelectDesk = (id) => {
    setSelectedDesk(id === selectedDesk ? null : id)
  }

  const handleReserve = (formData) => {
    if (!selectedDesk) return

    // El elemento seleccionado puede ser un escritorio (IC3xxx) o una sala.
    const item =
      deskData.find((d) => d.id === selectedDesk) ||
      salasData.find((s) => s.id === selectedDesk)

    navigate('/estacionamiento', {
      state: {
        deskId: selectedDesk,
        espacioID: item?.espacioID,
        date: formData.date,
        entryTime: formData.entryTime,
        exitTime: formData.exitTime,
        reserveFor: formData.reserveFor,
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] flex-col lg:h-[calc(100dvh-64px)] lg:flex-row">
      <BookingSidebar
        selectedDesk={selectedDesk}
        onReserve={handleReserve}
        stats={stats}
        loadingStats={loading}
        onFiltersChange={handleFiltersChange}
      />
      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <p className="font-mono text-sm text-[#ff3246]">{error}</p>
            <button
              onClick={() => fetchAvailability(filtersRef.current)}
              className="h-10 px-6 rounded-lg bg-primary font-mono text-sm text-white border-none cursor-pointer hover:bg-primary-dark transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 flex">
          {/**
           * Dynamically load `FloorMap<PisoID>.jsx` when available.
           * Fallback order:
           *  - FloorMap{floor}.jsx (dynamic)
           *  - FloorMap9.jsx (for historical Piso 9 mapping)
           *  - FloorMap.jsx (default)
           */}
          {(() => {
            const LazyComp = useMemo(() => {
              if (!floor) return null
              return lazy(() =>
                import(`../../components/reserve/FloorMap${floor}.jsx`).catch(() => {
                  if (floor === '1') return import('../../components/reserve/FloorMap9.jsx')
                  if (floor === '2') return import('../../components/reserve/FloorMap.jsx')
                  if (floor === '3') return import('../../components/reserve/FloorMapPB.jsx')
                  if (floor === '4') return import('../../components/reserve/FloorMapMZ.jsx')
                  return import('../../components/reserve/FloorMap.jsx')
                })
              )
            }, [floor])

            return (
              <Suspense fallback={<div className="flex-1 flex items-center justify-center">Cargando mapa...</div>}>
                {LazyComp ? (
                  <LazyComp
                    desks={deskData}
                    salas={salasData}
                    rooms={fallbackRooms}
                    selectedDesk={selectedDesk}
                    onSelectDesk={fechaBloqueada ? () => {} : handleSelectDesk}
                    loading={loading}
                  />
                ) : (
                  <FloorMap
                    desks={deskData}
                    salas={salasData}
                    rooms={fallbackRooms}
                    selectedDesk={selectedDesk}
                    onSelectDesk={fechaBloqueada ? () => {} : handleSelectDesk}
                    loading={loading}
                  />
                )}
              </Suspense>
            )
          })()}
          {fechaBloqueada && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-6">
              <div
                className="max-w-md w-full rounded-2xl border p-6 flex flex-col gap-3 text-center"
                style={{
                  backgroundColor: 'rgba(255,50,70,0.10)',
                  borderColor: 'rgba(255,50,70,0.55)',
                }}
              >
                <h3 className="font-heading text-xl font-bold uppercase text-white">
                  No puedes reservar este día
                </h3>
                <p
                  className="font-mono text-[12px] leading-[1.6]"
                  style={{ color: '#ff3246' }}
                >
                  {fechaBloqueada.motivo}
                </p>
                <p className="font-mono text-[11px] text-text-muted">
                  Selecciona otra fecha en el calendario para continuar.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
