// ReadQR.jsx
// Requires: npm install html5-qrcode

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

import { useAuth } from '../../context/useAuth'
import { useLectura } from '../../context/useLecturaQr'

const QR_DIV_ID = 'qr-reader'

function parseQR(raw) {
  try {
    const obj = JSON.parse(raw.trim())

    if (!obj.ReservacionID || !obj.EmpleadoID) {
      return null
    }

    return {
      ReservacionID: Number(obj.ReservacionID),
      EmpleadoID: String(obj.EmpleadoID).trim()
    }

  } catch (error) {
    console.log('QR PARSE ERROR', error)
    return null
  }
}

export default function ReadQRPage() {
  const { user } = useAuth()

  const {
    scanCodigo,
    success,
    error,
    setError,
    setSuccess
  } = useLectura()

  const navigate = useNavigate()

  const [scanning, setScanning] = useState(false)
  const [payload, setPayload] = useState(null)

  const [qrerror, setqrError] = useState('')
  const [camError, setCamError] = useState('')

  const scanner = useRef(null)
  const didScan = useRef(false)

  const hasResult = payload || error || qrerror

  const stop = async () => {
    if (scanner.current) {
      try {
        if (scanner.current.isScanning) {
          await scanner.current.stop()
        }
      } catch (e) {
        console.log('stop error', e)
      }

      try {
        await scanner.current.clear()
      } catch (e) {
        console.log('clear error', e)
      }

      scanner.current = null
    }
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  const start = async () => {
    await stop()

    setCamError('')
    setqrError('')

    setError('')
    setSuccess('')

    setPayload(null)

    didScan.current = false
    setScanning(true)

    scanner.current = new Html5Qrcode(QR_DIV_ID)

    try {
      await scanner.current.start(
        { facingMode: 'environment' },

        {
          fps: 10,

          qrbox: (w, h) => {
            const size = Math.min(w, h) * 0.75

            return {
              width: size,
              height: size
            }
          }
        },

        async (text) => {

  if (didScan.current) return

  didScan.current = true

  await stop()

  setScanning(false)

  console.log('RAW QR', text)

  const result = parseQR(text)

  if (!result) {
    setqrError('QR inválido')
    return
  }

  try {

    console.log('QR RESULT', result)

    console.log('ReservacionID:', result.ReservacionID)
    console.log('EmpleadoID:', result.EmpleadoID)

    await scanCodigo(
      result.ReservacionID,
      result.EmpleadoID
    )

    setPayload(result)

  } catch (err) {

    console.log('SCAN ERROR', err)

  }
},

      )

    } catch (err) {

      setScanning(false)

      setCamError(
        err?.message || 'Error al acceder a la cámara'
      )
    }
  }

  const reset = async () => {
    await stop()

    setScanning(false)

    setPayload(null)

    setqrError('')
    setCamError('')

    setError('')
    setSuccess('')

    didScan.current = false
  }

  const restartScanner = async () => {
    await reset()

    setTimeout(() => {
      start()
    }, 200)
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: '#08000f' }}
    >

      {/* Header */}
      <div className="px-5 pt-7 pb-5">
        <p className="font-mono text-[10px] text-primary/60 mb-1">// lector QR</p>
        <h1 className="font-heading text-3xl font-bold text-white">LEER QR</h1>
        <p className="font-mono text-[11px] text-white/40 mt-1">
          Apunta al código QR de la reservación
        </p>

      </div>

      {/* Body */}
      <div className="flex-1 px-5 pb-10 flex flex-col gap-4">

        {/* Scanner */}
        <div
          id={QR_DIV_ID}
          className={`
            w-full
            rounded-2xl
            overflow-hidden
            border
            border-white/10
            ${scanning ? 'aspect-square' : 'hidden'}
          `}
        />

        {/* Idle */}
        {!scanning && !hasResult && (
          <div
            className="aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3"
            style={{ background: '#0f0020' }}
          >

            <svg
              className="w-12 h-12 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z"
              />
            </svg>

            <p className="font-mono text-xs text-white/30">
              Cámara inactiva
            </p>

          </div>
        )}

        {/* Camera error */}
        {camError && (
          <div
            className="rounded-xl px-4 py-3 border border-red-500/30"
            style={{ background: 'rgba(255,77,77,0.07)' }}
          >
            <p className="font-mono text-[11px] text-red-400">
              {camError}
            </p>
          </div>
        )}

        {/* Success */}
        {payload && (
          <div
            className="rounded-2xl border border-primary/30 overflow-hidden"
            style={{ background: '#0f0020' }}
          >

            <div className="px-5 py-4 border-b border-white/5">

              <p className="font-heading text-sm font-bold text-white">
                ✓ QR Leído
              </p>

              <p className="font-mono text-[10px] text-white/40">
                Datos de la reservación
              </p>

            </div>

            <div className="px-5 py-5 flex flex-col gap-4">
              <Field label="Empleado ID" value={payload.EmpleadoID} />
              <Field label="Reservación ID" value={payload.ReservacionID} />
            </div>

          </div>
        )}

        {/* Errors */}
        {(error || qrerror) && (
          <div
            className="rounded-xl px-4 py-3 border border-red-500/30"
            style={{ background: 'rgba(255,77,77,0.07)' }}
          >
            <p className="font-mono text-[11px] text-red-400">
              {error || qrerror}
            </p>
          </div>
        )}

        {/* Main button */}
        {!hasResult ? (
          <button
            onClick={scanning ? reset : start}
            className="w-full h-14 cursor-pointer rounded-xl border-none font-heading text-sm font-bold text-white tracking-wider transition-colors hover:opacity-90"
            style={{ background: scanning ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7C00FF,#460073)' }}
          >
            {scanning
              ? 'DETENER CÁMARA'
              : 'ACTIVAR CÁMARA'}
          </button>
        ) : (
          <button
            onClick={reset}
            className="w-full h-14 cursor-pointer rounded-xl font-heading text-sm font-bold text-white tracking-wider border border-white/10 transition-colors hover:border-primary/40"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            ESCANEAR OTRO
          </button>
        )}

        <button onClick={() => navigate(-1)}
          className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-white/25 transition-colors hover:text-white/50 text-center">
          ← volver
        </button>

      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">

      <span className="font-mono text-[10px] text-primary/60">
        {label}
      </span>

      <span className="font-mono text-sm text-white bg-white/5 rounded-lg px-3 py-2 break-all">
        {value}
      </span>

    </div>
  )
}