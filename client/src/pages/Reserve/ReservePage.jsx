import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingSidebar from '../../components/reserve/BookingSidebar'
import FloorMap from '../../components/reserve/FloorMap'
import { getEspaciosDisponibilidad } from '../../services/reservations'
import { rooms as fallbackRooms } from '../../data/floorData'

// Map backend ESPACIO rows into the shape our FloorMap expects
function mapEspaciosToDesks(espacios) {
  // Filter to only desk-type spaces (those with a Nombre like IC3xxx)
  return espacios
    .filter((e) => /^IC3\d+$/i.test(e.Nombre))
    .map((e) => ({
      id: e.Nombre,
      espacioID: e.EspacioID,
      cluster: getCluster(e.Nombre),
      status: e.status, // 'available' | 'occupied'
    }))
}

function getCluster(nombre) {
  const num = parseInt(nombre.replace(/\D/g, ''), 10)
  if (num >= 3001 && num <= 3005) return 'isa'
  if (num >= 3006 && num <= 3013) return 'c06_13'
  if (num >= 3014 && num <= 3021) return 'c14_21'
  if (num >= 3022 && num <= 3029) return 'c22_29'
  if (num >= 3030 && num <= 3035) return 'c30_35'
  if (num >= 3036 && num <= 3039) return 'c36_39'
  return 'unknown'
}

export default function ReservePage() {
  const navigate = useNavigate()
  const [selectedDesk, setSelectedDesk] = useState(null)
  const [deskData, setDeskData] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        filters.exitTime
      )
      const desks = mapEspaciosToDesks(res.data || [])
      setDeskData(desks)
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

    // Find the selected desk's backend EspacioID
    const desk = deskData.find((d) => d.id === selectedDesk)

    // Navigate to parking page, passing all real data
    navigate('/estacionamiento', {
      state: {
        deskId: selectedDesk,
        espacioID: desk?.espacioID,
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
            <span className="text-4xl">⚠️</span>
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
        <FloorMap
          desks={deskData}
          rooms={fallbackRooms}
          selectedDesk={selectedDesk}
          onSelectDesk={handleSelectDesk}
          loading={loading}
        />
      )}
    </div>
  )
}
