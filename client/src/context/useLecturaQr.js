import { useContext } from 'react'
import { lecturaqrContext } from './lecturaqr-context'

export const useLectura = () => {
  const context = useContext(lecturaqrContext)

  if (!context) {
    throw new Error('useLectura debe usarse dentro de LecturaProvider')
  }

  return context
}