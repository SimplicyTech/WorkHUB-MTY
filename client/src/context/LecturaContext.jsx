import { useState } from 'react'
import { lecturaqrContext } from './lecturaqr-context'
import { scanCodigoReservacion } from '../services/lectura'

export function LecturaProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const scanCodigo = async (ReservacionID, EmpleadoID) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const data = await scanCodigoReservacion(
        ReservacionID,
        EmpleadoID
      )

      setSuccess(data.message)

      return data

    } catch (err) {

      console.log('SCAN ERROR', err)

      const message =
        err.error ||
        err.message ||
        'Error al validar reservación'

      setError(message)

      throw err

    } finally {
      setLoading(false)
    }
  }

  return (
    <lecturaqrContext.Provider
      value={{
        loading,
        success,
        error,
        scanCodigo,
        setSuccess,
        setError
      }}
    >
      {children}
    </lecturaqrContext.Provider>
  )
}