import './AdminDashboard.css'

const sidebarItems = [
  { label: 'Dashboard', icon: 'stack', active: true },
  { label: 'Reportes', icon: 'bars' },
  { label: 'Espacios', icon: 'square' },
  { label: 'Usuarios', icon: 'user' },
  { label: 'Bloqueos', icon: 'ban' },
  { label: 'Visitas', icon: 'group' },
  { label: 'Eventos', icon: 'calendar' },
  { label: 'Prediccion IA', icon: 'diamond' },
]

const stats = [
  {
    label: 'Escritorios',
    value: '248',
    detail: 'total',
    accent: 'admin-stat--violet',
    icon: 'desktop',
  },
  {
    label: 'Ocupados',
    value: '187',
    detail: '↑ 12% vs ayer',
    accent: 'admin-stat--rose',
    icon: 'userSquare',
  },
  {
    label: 'Disponibles',
    value: '52',
    detail: '↓ 8% vs ayer',
    accent: 'admin-stat--mint',
    icon: 'checkSquare',
  },
  {
    label: 'Cajones',
    value: '48',
    detail: '26 ocupados',
    accent: 'admin-stat--violet',
    icon: 'car',
  },
  {
    label: '% Ocupacion',
    value: '75%',
    detail: '↑ 5% vs ayer',
    accent: 'admin-stat--outline',
    icon: null,
  },
  {
    label: 'Bloqueados',
    value: '9',
    detail: 'mantenimiento',
    accent: 'admin-stat--yellow',
    icon: 'lock',
  },
]

const floors = [
  { label: 'Piso 1', occupied: 85 },
  { label: 'Piso 2', occupied: 72 },
  { label: 'Piso 3', occupied: 91 },
  { label: 'Piso 4', occupied: 58 },
]

const floorRows = [
  { label: 'Piso 1', value: '85%' },
  { label: 'Piso 2', value: '72%' },
  { label: 'Piso 3', value: '91%', accent: true },
  { label: 'Piso 4', value: '58%' },
  { label: 'Piso 5', value: '44%' },
]

const zones = [
  { label: 'Area General', value: '91%', color: '#a100ff' },
  { label: 'Sala Conferencias', value: '67%', color: '#16e0a3' },
  { label: 'Hot Desking', value: '45%', color: '#ffe83c' },
]

const activity = [
  { text: 'Check-in: D-304 — Gilberto R.', time: '09:02', color: '#16e0a3' },
  { text: 'Check-in: D-201 — Maria L.', time: '09:05', color: '#16e0a3' },
  { text: 'No-show: D-105 — Carlos P.', time: '09:15', color: '#ff3355' },
  { text: 'Liberado: D-105 — auto', time: '09:16', color: '#ffe83c' },
  { text: 'Check-out: D-402 — Pedro S.', time: '08:55', color: '#a100ff' },
  { text: 'Check-in: D-310 — Laura V.', time: '08:50', color: '#16e0a3' },
]

function AdminIcon({ name }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const icons = {
    stack: (
      <>
        <path {...common} d="M4 7h16" />
        <path {...common} d="M4 12h16" />
        <path {...common} d="M4 17h16" />
      </>
    ),
    bars: (
      <>
        <path {...common} d="M5 19V9" />
        <path {...common} d="M12 19V5" />
        <path {...common} d="M19 19v-7" />
      </>
    ),
    square: <rect {...common} x="5" y="5" width="14" height="14" rx="3" />,
    user: (
      <>
        <path {...common} d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path {...common} d="M5 19a7 7 0 0 1 14 0" />
      </>
    ),
    ban: (
      <>
        <circle {...common} cx="12" cy="12" r="8" />
        <path {...common} d="m7 7 10 10" />
      </>
    ),
    group: (
      <>
        <path {...common} d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path {...common} d="M17 12a2.5 2.5 0 1 0 0-5" />
        <path {...common} d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path {...common} d="M15.5 19a4 4 0 0 0-3-3.9" />
      </>
    ),
    calendar: (
      <>
        <rect {...common} x="4.5" y="5.5" width="15" height="14" rx="2" />
        <path {...common} d="M8 3.5v4" />
        <path {...common} d="M16 3.5v4" />
        <path {...common} d="M4.5 9.5h15" />
      </>
    ),
    diamond: <path {...common} d="m12 4 8 8-8 8-8-8 8-8Z" />,
    desktop: (
      <>
        <rect {...common} x="4" y="5" width="16" height="11" rx="2" />
        <path {...common} d="M10 19h4" />
        <path {...common} d="M12 16v3" />
      </>
    ),
    userSquare: (
      <>
        <rect {...common} x="4" y="4" width="16" height="16" rx="3" />
        <path {...common} d="M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path {...common} d="M8 17a4 4 0 0 1 8 0" />
      </>
    ),
    checkSquare: (
      <>
        <rect {...common} x="4" y="4" width="16" height="16" rx="3" />
        <path {...common} d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    car: (
      <>
        <path {...common} d="M6 16V9.5L8 6h8l2 3.5V16" />
        <path {...common} d="M4.5 11h15" />
        <path {...common} d="M7 16v2" />
        <path {...common} d="M17 16v2" />
      </>
    ),
    lock: (
      <>
        <rect {...common} x="5" y="10" width="14" height="10" rx="2" />
        <path {...common} d="M8 10V8a4 4 0 1 1 8 0v2" />
      </>
    ),
    message: (
      <>
        <path {...common} d="M5 6.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand__topline">
            <span className="admin-brand__arrow">›</span>
            <span>accenture</span>
            <span className="admin-brand__slashes">//</span>
            <span className="admin-brand__name">WORKHUB MTY</span>
          </div>
          <div className="admin-brand__badge">ADMIN PANEL</div>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`admin-nav__item ${item.active ? 'is-active' : ''}`}
            >
              <span className="admin-nav__icon">
                <AdminIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-user">
          <div className="admin-user__avatar">AM</div>
          <div>
            <strong>Ana Martinez</strong>
            <span>Administradora</span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-main__header">
          <div>
            <span className="admin-main__eyebrow">// dashboard_ocupacion</span>
            <h1>OCUPACION EN TIEMPO REAL</h1>
          </div>
          <div className="admin-main__live">
            <span className="admin-main__dot" />
            <span>En vivo — Actualizado hace 12s</span>
          </div>
        </header>

        <section className="admin-stats">
          {stats.map((stat) => (
            <article key={stat.label} className={`admin-stat ${stat.accent}`}>
              <div className="admin-stat__top">
                <span>{stat.label}</span>
                {stat.icon ? <AdminIcon name={stat.icon} /> : null}
              </div>
              <div className="admin-stat__bottom">
                <strong>{stat.value}</strong>
                <span>{stat.detail}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="admin-grid">
          <article className="admin-card admin-card--floors">
            <div className="admin-card__header">
              <h2>Ocupacion por Piso</h2>
              <span className="admin-pill">hoy</span>
            </div>

            <div className="admin-bars">
              {floors.map((floor) => (
                <div key={floor.label} className="admin-bars__item">
                  <div className="admin-bars__track">
                    <div
                      className="admin-bars__available"
                      style={{ height: `${100 - floor.occupied}%` }}
                    />
                    <div
                      className="admin-bars__occupied"
                      style={{ height: `${floor.occupied}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-floor-list">
              {floorRows.map((floor) => (
                <div key={floor.label} className="admin-floor-list__row">
                  <span>{floor.label}</span>
                  <div className="admin-floor-list__bar" />
                  <strong className={floor.accent ? 'is-accent' : ''}>{floor.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card admin-card--zones">
            <div className="admin-card__header admin-card__header--stacked">
              <h2>Ocupacion por Zona</h2>
              <span>Piso 3 seleccionado</span>
            </div>

            <div className="admin-donut">
              <div className="admin-donut__chart">
                <div className="admin-donut__inner">91%</div>
              </div>
            </div>

            <div className="admin-legend">
              {zones.map((zone) => (
                <div key={zone.label} className="admin-legend__item">
                  <span className="admin-legend__dot" style={{ backgroundColor: zone.color }} />
                  <span>{zone.label}: {zone.value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card admin-card--activity">
            <div className="admin-card__header">
              <h2>Actividad Reciente</h2>
            </div>

            <div className="admin-activity">
              {activity.map((entry) => (
                <div key={`${entry.text}-${entry.time}`} className="admin-activity__row">
                  <span className="admin-activity__dot" style={{ backgroundColor: entry.color }} />
                  <span className="admin-activity__text">{entry.text}</span>
                  <span className="admin-activity__time">{entry.time}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <button type="button" className="admin-fab" aria-label="Abrir soporte">
          <AdminIcon name="message" />
        </button>
      </main>
    </div>
  )
}
