import { useState } from 'react'
import './AdminDashboard.css'

const sidebarItems = [
  { label: 'Dashboard', icon: 'stack' },
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
    download: (
      <>
        <path {...common} d="M12 4v12M8 12l4 4 4-4" />
        <path {...common} d="M4 19h16" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

// ── Reportes data ────────────────────────────────────────
const reportesKpis = [
  { label: 'Total Reservaciones', value: '1,284', detail: '↑ 9% vs semana anterior', accent: 'admin-stat--violet', icon: 'calendar' },
  { label: 'Tasa Ocupacion', value: '75%', detail: '↑ 5% vs semana anterior', accent: 'admin-stat--outline', icon: null },
  { label: 'Check-ins Exitosos', value: '1,071', detail: '83% de reservaciones', accent: 'admin-stat--mint', icon: 'checkSquare' },
  { label: 'No-shows', value: '148', detail: '↓ 3% vs semana anterior', accent: 'admin-stat--rose', icon: 'userSquare' },
  { label: 'Cancelaciones', value: '65', detail: '5% del total', accent: 'admin-stat--yellow', icon: 'ban' },
]

const reportesSemana = [
  { day: 'Lun', value: 82 },
  { day: 'Mar', value: 91 },
  { day: 'Mie', value: 78 },
  { day: 'Jue', value: 95 },
  { day: 'Vie', value: 70 },
  { day: 'Sab', value: 34 },
  { day: 'Dom', value: 18 },
]

const reportesDept = [
  { dept: 'Tecnologia', value: 94, color: '#b100ff' },
  { dept: 'Finanzas', value: 78, color: '#16e0a3' },
  { dept: 'Operaciones', value: 67, color: '#ffe93b' },
  { dept: 'RRHH', value: 55, color: '#ff3153' },
  { dept: 'Marketing', value: 48, color: '#a100ff' },
  { dept: 'Legal', value: 32, color: '#9d89b8' },
]

const reportesHistorial = [
  { id: 'RPT-0041', periodo: 'Abr 21–27', tipo: 'Ocupacion', espacios: 248, pct: '75%', checkIns: 1071, noShows: 148, estado: 'Completado' },
  { id: 'RPT-0040', periodo: 'Abr 14–20', tipo: 'Ocupacion', espacios: 248, pct: '71%', checkIns: 998, noShows: 162, estado: 'Completado' },
  { id: 'RPT-0039', periodo: 'Abr 7–13', tipo: 'Ocupacion', espacios: 248, pct: '68%', checkIns: 944, noShows: 180, estado: 'Completado' },
  { id: 'RPT-0038', periodo: 'Mar 31–Abr 6', tipo: 'Departamento', espacios: 248, pct: '73%', checkIns: 1022, noShows: 155, estado: 'Completado' },
  { id: 'RPT-0037', periodo: 'Mar 24–30', tipo: 'Departamento', espacios: 248, pct: '69%', checkIns: 965, noShows: 171, estado: 'Archivado' },
]

// ── Espacios data ─────────────────────────────────────────
const espaciosResumen = [
  { label: 'Total Espacios', value: '248', accent: 'admin-stat--violet', icon: 'desktop' },
  { label: 'Libres', value: '52', accent: 'admin-stat--mint', icon: 'checkSquare' },
  { label: 'Ocupados', value: '187', accent: 'admin-stat--rose', icon: 'userSquare' },
  { label: 'Bloqueados', value: '9', accent: 'admin-stat--yellow', icon: 'lock' },
]

const espaciosList = [
  { id: 'D-101', tipo: 'Escritorio', piso: 'Piso 1', zona: 'Area General', estado: 'Libre', usuario: '—' },
  { id: 'D-102', tipo: 'Escritorio', piso: 'Piso 1', zona: 'Area General', estado: 'Ocupado', usuario: 'Carlos P.' },
  { id: 'D-103', tipo: 'Escritorio', piso: 'Piso 1', zona: 'Area General', estado: 'Bloqueado', usuario: 'Mantenimiento' },
  { id: 'S-201', tipo: 'Sala', piso: 'Piso 2', zona: 'Sala Conferencias', estado: 'Ocupado', usuario: 'Equipo Tech' },
  { id: 'D-202', tipo: 'Escritorio', piso: 'Piso 2', zona: 'Area General', estado: 'Libre', usuario: '—' },
  { id: 'D-301', tipo: 'Escritorio', piso: 'Piso 3', zona: 'Hot Desking', estado: 'Ocupado', usuario: 'Maria L.' },
  { id: 'D-302', tipo: 'Escritorio', piso: 'Piso 3', zona: 'Hot Desking', estado: 'Libre', usuario: '—' },
  { id: 'D-303', tipo: 'Escritorio', piso: 'Piso 3', zona: 'Area General', estado: 'Ocupado', usuario: 'Gilberto R.' },
  { id: 'S-401', tipo: 'Sala', piso: 'Piso 4', zona: 'Sala Conferencias', estado: 'Libre', usuario: '—' },
  { id: 'C-001', tipo: 'Cajon', piso: 'Sotano', zona: 'Estacionamiento', estado: 'Ocupado', usuario: 'Laura V.' },
]

function ReportesView() {
  return (
    <main className="admin-main">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// admin_reportes</span>
          <h1>REPORTES</h1>
        </div>
        <div className="admin-main__actions">
          <select className="admin-select" defaultValue="semana">
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Trimestre</option>
          </select>
          <button type="button" className="admin-btn-export">
            <AdminIcon name="download" />
            Exportar CSV
          </button>
        </div>
      </header>

      <section className="admin-stats admin-stats--5">
        {reportesKpis.map((k) => (
          <article key={k.label} className={`admin-stat ${k.accent}`}>
            <div className="admin-stat__top">
              <span>{k.label}</span>
              {k.icon ? <AdminIcon name={k.icon} /> : null}
            </div>
            <div className="admin-stat__bottom">
              <strong>{k.value}</strong>
              <span>{k.detail}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-grid admin-grid--2col">
        <article className="admin-card">
          <div className="admin-card__header">
            <h2>Reservaciones por Dia</h2>
            <span className="admin-pill">esta semana</span>
          </div>
          <div className="admin-weekly">
            {reportesSemana.map((d) => (
              <div key={d.day} className="admin-weekly__col">
                <div className="admin-weekly__track">
                  <div className="admin-weekly__bar" style={{ height: `${d.value}%` }} />
                </div>
                <span className="admin-weekly__label">{d.day}</span>
                <span className="admin-weekly__val">{d.value}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card__header">
            <h2>Uso por Departamento</h2>
            <span className="admin-pill">semana actual</span>
          </div>
          <div className="admin-dept">
            {reportesDept.map((d) => (
              <div key={d.dept} className="admin-dept__row">
                <span className="admin-dept__name">{d.dept}</span>
                <div className="admin-dept__track">
                  <div className="admin-dept__fill" style={{ width: `${d.value}%`, background: d.color }} />
                </div>
                <span className="admin-dept__val">{d.value}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-card" style={{ marginTop: '1.2rem' }}>
        <div className="admin-card__header">
          <h2>Historial de Reportes</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Periodo</th>
                <th>Tipo</th>
                <th>Espacios</th>
                <th>% Ocupacion</th>
                <th>Check-ins</th>
                <th>No-shows</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reportesHistorial.map((r) => (
                <tr key={r.id}>
                  <td className="admin-table__id">{r.id}</td>
                  <td>{r.periodo}</td>
                  <td><span className="admin-badge admin-badge--tipo">{r.tipo}</span></td>
                  <td>{r.espacios}</td>
                  <td className="admin-table__pct">{r.pct}</td>
                  <td className="admin-table__mint">{r.checkIns.toLocaleString()}</td>
                  <td className="admin-table__rose">{r.noShows}</td>
                  <td>
                    <span className={`admin-badge ${r.estado === 'Completado' ? 'admin-badge--ok' : 'admin-badge--arch'}`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function EspaciosView() {
  return (
    <main className="admin-main">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// admin_espacios</span>
          <h1>GESTION DE ESPACIOS</h1>
        </div>
        <div className="admin-main__actions">
          <select className="admin-select" defaultValue="todos">
            <option value="todos">Todos los pisos</option>
            <option value="1">Piso 1</option>
            <option value="2">Piso 2</option>
            <option value="3">Piso 3</option>
            <option value="4">Piso 4</option>
          </select>
          <select className="admin-select" defaultValue="todos-estados">
            <option value="todos-estados">Todos los estados</option>
            <option value="libre">Libre</option>
            <option value="ocupado">Ocupado</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </header>

      <section className="admin-stats admin-stats--4">
        {espaciosResumen.map((e) => (
          <article key={e.label} className={`admin-stat ${e.accent}`}>
            <div className="admin-stat__top">
              <span>{e.label}</span>
              <AdminIcon name={e.icon} />
            </div>
            <div className="admin-stat__bottom">
              <strong>{e.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-card" style={{ marginTop: '1.2rem' }}>
        <div className="admin-card__header">
          <h2>Listado de Espacios</h2>
          <span className="admin-pill">248 total</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Piso</th>
                <th>Zona</th>
                <th>Estado</th>
                <th>Usuario / Detalle</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {espaciosList.map((e) => (
                <tr key={e.id}>
                  <td className="admin-table__id">{e.id}</td>
                  <td>{e.tipo}</td>
                  <td>{e.piso}</td>
                  <td>{e.zona}</td>
                  <td>
                    <span className={`admin-badge ${
                      e.estado === 'Libre' ? 'admin-badge--ok' :
                      e.estado === 'Ocupado' ? 'admin-badge--rose' :
                      'admin-badge--yellow'
                    }`}>{e.estado}</span>
                  </td>
                  <td>{e.usuario}</td>
                  <td>
                    <button type="button" className="admin-btn-ghost-sm">
                      {e.estado === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default function AdminDashboardPage() {
  const [activePage, setActivePage] = useState('Dashboard')
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
              className={`admin-nav__item ${activePage === item.label ? 'is-active' : ''}`}
              onClick={() => setActivePage(item.label)}
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

      {activePage === 'Dashboard' && (
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
      )}
      {activePage === 'Reportes' && <ReportesView />}
      {activePage === 'Espacios' && <EspaciosView />}
    </div>
  )
}
