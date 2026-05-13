import { QRCodeSVG } from 'qrcode.react'

export default function Qrgenerator({
  ReservacionID,
  EmpleadoID,
  size = 240
}) {
  const qrData = JSON.stringify({
    ReservacionID,
    EmpleadoID,
  })

  return (
    <QRCodeSVG
      value={qrData}
      size={size}
      level="H"
      includeMargin
    />
  )
}