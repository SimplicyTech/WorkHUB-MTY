// ReadQR.jsx
// Requires: npm install html5-qrcode

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuth } from '../../context/useAuth'

const QR_DIV_ID = 'qr-reader'

function parseQR(raw) {
  const trimmed = raw.trim()

  try {
    const obj = JSON.parse(trimmed)
    if (obj.userId && obj.reservacionId) return obj
  } catch { /* not JSON */ }

  const parts = trimmed.replace(/[()]/g, '').split(',')
  if (parts.length === 2) {
    const [userId, reservacionId] = parts.map(s => s.trim())
    if (userId && reservacionId) return { userId, reservacionId }
  }

  return null
}

export default function ReadQRPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [scanning, setScanning] = useState(false)
  const [payload,  setPayload]  = useState(null)   // { userId, reservacionId }
  const [error,    setError]    = useState('')
  const [camError, setCamError] = useState('')

  const scanner   = useRef(null)
  const didScan   = useRef(false)

  const stop = async () => {
    if (scanner.current?.isScanning) {
      await scanner.current.stop()
      scanner.current.clear()
    }
  }

  useEffect(() => () => { stop() }, [])

  const start = async () => {
    setCamError('')
    setError('')
    setPayload(null)
    didScan.current = false
    setScanning(true)

    scanner.current = new Html5Qrcode(QR_DIV_ID)
    try {
      await scanner.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          if (didScan.current) return
          didScan.current = true
          await stop()
          setScanning(false)
          const result = parseQR(text)
          if (result) setPayload(result)
          else setError('QR inválido. Formato esperado: (userID, reservacionID)')
        },
        () => {}
      )
    } catch (err) {
      setScanning(false)
      setCamError(`No se pudo acceder a la cámara: ${err?.message ?? err}`)
    }
  }

  const reset = async () => {
    await stop()
    setScanning(false)
    setPayload(null)
    setError('')
    setCamError('')
    didScan.current = false
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#08000f' }}>


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

        {/* Camera mount — always in DOM so html5-qrcode can attach */}
        <div
          id={QR_DIV_ID}
          className={`w-full rounded-2xl overflow-hidden border border-white/10 ${scanning ? 'aspect-square' : 'hidden'}`}
        />

        {/* Idle placeholder */}
        {!scanning && !payload && !error && (
          <div className="aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3"
               style={{ background: '#0f0020' }}>
            <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
            <p className="font-mono text-xs text-white/30">Cámara inactiva</p>
          </div>
        )}

        {/* Camera error */}
        {camError && (
          <div className="rounded-xl px-4 py-3 border border-red-500/30" style={{ background: 'rgba(255,77,77,0.07)' }}>
            <p className="font-mono text-[11px] text-red-400">{camError}</p>
          </div>
        )}

        {/* Success */}
        {payload && (
          <div className="rounded-2xl border border-primary/30 overflow-hidden" style={{ background: '#0f0020' }}>
            <div className="px-5 py-4 border-b border-white/5">
              <p className="font-heading text-sm font-bold text-white">✓ QR Leído</p>
              <p className="font-mono text-[10px] text-white/40">Datos de la reservación</p>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <Field label="Empleado ID" value={payload.userId} />
              <Field label="Reservación ID" value={payload.reservacionId} />
            </div>
          </div>
        )}

        {/* Parse error */}
        {error && (
          <div className="rounded-xl px-4 py-3 border border-red-500/30" style={{ background: 'rgba(255,77,77,0.07)' }}>
            <p className="font-mono text-[11px] text-red-400">{error}</p>
          </div>
        )}

        {/* Primary button */}
        {!payload && !error ? (
          <button
            onClick={scanning ? reset : start}
            className="w-full h-14 cursor-pointer rounded-xl border-none font-heading text-sm font-bold text-white tracking-wider transition-colors hover:opacity-90"
            style={{ background: scanning ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7C00FF,#460073)' }}
          >
            {scanning ? 'DETENER CÁMARA' : 'ACTIVAR CÁMARA'}
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
      <span className="font-mono text-[10px] text-primary/60">{label}</span>
      <span className="font-mono text-sm text-white bg-white/5 rounded-lg px-3 py-2 break-all">{value}</span>
    </div>
  )
}