import { apiRequest } from './api'

export const scanCodigoReservacion = async (ReservacionID,EmpleadoID) => {
  return await apiRequest('/lecturaqr', {
    method: 'PUT',
    body: {
      ReservacionID,
      EmpleadoID
    },
    auth: true
  })
}