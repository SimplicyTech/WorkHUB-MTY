import { useDashboard } from '../../context/useDashboard'

export default function StatsPanel() {
  const { data, loading } = useDashboard()

  if (loading) {
    return (
      <div className="text-white font-mono text-xs">
        Cargando dashboard...
      </div>
    )
  }


  const total = data.find(r => r.Piso === 'TOTAL')

  const stats = [
    {
      label: 'escritorios_libres',
      value: total?.disponibles || 0,
      color: 'text-accent'
    },
    {
      label: 'estacionamiento',
      value: total?.total || 0,
      color: 'text-primary'
    },
    {
      label: 'ocupación_hoy',
      value: total
        ? Math.round((total.ocupados / total.total) * 100) + '%'
        : '0%',
      color: 'text-white'
    }
  ]

  const bars = data
    .filter(r => r.Piso !== 'TOTAL')
    .map(r => ({
      label: `piso_${r.Piso}`,
      width: `${Math.round((r.ocupados / r.total) * 100)}%`,
      color: 'bg-red-500'
    }))
  return (
    <div className="bg-surface-card rounded-lg p-4 sm:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-text-muted font-semibold uppercase tracking-wide">
          Panel de ocupación
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[9px] text-accent font-semibold">
            EN VIVO
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 bg-surface-badge rounded-lg p-3 md:p-4 flex flex-col gap-1"
          >
            <span className="font-mono text-[8px] md:text-[9px] text-text-muted leading-tight">
              {stat.label}
            </span>
            <span className={`font-heading text-3xl md:text-4xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[9px] text-text-muted uppercase tracking-wide">
          Distribución por piso
        </span>

        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-text-muted w-10">
              {bar.label}
            </span>
            <div className="flex-1 bg-bar-bg rounded h-2">
              <div
                className={`${bar.color} rounded h-2`}
                style={{ width: bar.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
