const steps = [
  {
    num: '01',
    numColor: 'text-primary',
    title: 'BUSCA TU ESPACIO',
    desc: 'Abre WorkHub MTY y selecciona fecha, piso y zona. Ve la disponibilidad en tiempo real.',
  },
  {
    num: '02',
    numColor: 'text-accent',
    title: 'RESERVA Y CONFIRMA',
    desc: 'Elige tu escritorio o cajón de estacionamiento preferido y confirma con un clic.',
  },
  {
    num: '03',
    numColor: 'text-primary',
    title: 'CHECK-IN CON QR',
    desc: 'Al llegar al ATC, escanea el QR en tu escritorio. Si no confirmas en 15 min, el espacio se libera.',
  },
]

export default function HowItWorks() {
  return (
    <section className="flex flex-col items-center gap-10 md:gap-12 px-4 sm:px-5 md:px-12 py-12 md:py-20">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-[11px] text-accent font-semibold">
          // tu_flujo_diario
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center">
          ASÍ DE FÁCIL ES USARLO
        </h2>
      </div>

      {/* Steps */}
      <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="min-w-0 bg-surface-card rounded-lg p-5 md:p-7 flex flex-row md:flex-col items-start md:items-center gap-4"
          >
            <span className={`font-heading text-4xl md:text-5xl font-bold shrink-0 ${step.numColor}`}>
              {step.num}
            </span>
            <div className="flex flex-col gap-1 md:items-center">
              <span className="font-heading text-base md:text-lg font-semibold text-white md:text-center">
                {step.title}
              </span>
              <p className="font-mono text-xs text-text-muted md:text-center leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
