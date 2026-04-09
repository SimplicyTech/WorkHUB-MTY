import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingSidebar from '../../components/reserve/BookingSidebar'
import FloorMap from '../../components/reserve/FloorMap'
import desks, { rooms } from '../../data/floorData'

export default function ReservePage() {
  const navigate = useNavigate()
  const [selectedDesk, setSelectedDesk] = useState(null)
  const [deskData, setDeskData] = useState(desks)

  const handleSelectDesk = (id) => {
    setSelectedDesk(id === selectedDesk ? null : id)
  }

  const handleReserve = () => {
    if (!selectedDesk) return
    setDeskData((prev) =>
      prev.map((d) =>
        d.id === selectedDesk ? { ...d, status: 'occupied' } : d
      )
    )
    // Navigate to parking confirmation page
    navigate('/estacionamiento', { state: { deskId: selectedDesk } })
  }

  return (
    <div className="flex h-[calc(100vh-60px)]">
      <BookingSidebar selectedDesk={selectedDesk} onReserve={handleReserve} />
      <FloorMap
        desks={deskData}
        rooms={rooms}
        selectedDesk={selectedDesk}
        onSelectDesk={handleSelectDesk}
      />
    </div>
  )
}

