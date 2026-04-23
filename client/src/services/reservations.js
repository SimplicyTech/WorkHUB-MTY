const RESERVATIONS_KEY = 'workhub-reservations'

export function getReservations() {
  const storedReservations = localStorage.getItem(RESERVATIONS_KEY)

  if (!storedReservations) {
    return []
  }

  try {
    const parsedReservations = JSON.parse(storedReservations)
    return Array.isArray(parsedReservations) ? parsedReservations : []
  } catch {
    return []
  }
}

export function saveReservation(reservation) {
  const currentReservations = getReservations()
  const nextReservations = [
    reservation,
    ...currentReservations.filter((item) => item.id !== reservation.id),
  ]

  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(nextReservations))
}
