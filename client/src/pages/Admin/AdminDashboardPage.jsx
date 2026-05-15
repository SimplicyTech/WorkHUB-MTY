import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useDashboard } from '../../context/useDashboard'
import { useAuth } from '../../context/useAuth'
import './AdminDashboard.css'

const sidebarItems = [
  { label: 'Dashboard', icon: 'stack' },
  { label: 'Reportes', icon: 'bars' },
  { label: 'Espacios', icon: 'square' },
  { label: 'Usuarios', icon: 'user' },
  { label: 'Visitas', icon: 'group' },
  { label: 'Eventos', icon: 'calendar' },
  { label: 'Prediccion IA', icon: 'diamond' },
]

const emptyStats = [
  {
    label: 'Escritorios',
    value: '0',
    detail: 'sin datos',
    accent: 'admin-stat--violet',
    icon: 'desktop',
  },
  {
    label: 'Ocupados',
    value: '0',
    detail: 'sin datos',
    accent: 'admin-stat--rose',
    icon: 'userSquare',
  },
  {
    label: 'Disponibles',
    value: '0',
    detail: 'sin datos',
    accent: 'admin-stat--mint',
    icon: 'checkSquare',
  },
  {
    label: 'Cajones',
    value: '0',
    detail: 'sin datos',
    accent: 'admin-stat--violet',
    icon: 'car',
  },
  {
    label: '% Ocupacion',
    value: '0%',
    detail: 'sin datos',
    accent: 'admin-stat--outline',
    icon: null,
  },
  {
    label: 'Bloqueados',
    value: '0',
    detail: 'sin datos',
    accent: 'admin-stat--yellow',
    icon: 'lock',
  },
]

const loadingStats = emptyStats.map((stat) => ({
  ...stat,
  detail: 'cargando',
}))

const clampPercent = (value) => Math.min(Math.max(Math.round(Number(value) || 0), 0), 100)
const formatPercent = (value) => `${clampPercent(value)}%`

const activityColor = (status = '') => {
  const normalized = status.toLowerCase()
  if (normalized.includes('cancel') || normalized.includes('no-show')) return '#ff3355'
  if (normalized.includes('liber') || normalized.includes('dispon')) return '#ffe83c'
  if (normalized.includes('check-out')) return '#a100ff'
  return '#16e0a3'
}

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
    search: (
      <>
        <circle {...common} cx="10.5" cy="10.5" r="6.5" />
        <path {...common} d="m16 16 4 4" />
      </>
    ),
    plusBox: (
      <>
        <rect {...common} x="5" y="5" width="14" height="14" rx="3" />
        <path {...common} d="M12 8v8" />
        <path {...common} d="M8 12h8" />
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
const reportesSemana = [
  { day: 'Lun', value: 82 },
  { day: 'Mar', value: 91 },
  { day: 'Mie', value: 78 },
  { day: 'Jue', value: 95 },
  { day: 'Vie', value: 70 },
  { day: 'Sab', value: 34 },
  { day: 'Dom', value: 18 },
]

const espaciosList = [
  { id: 'D-301', tipo: 'Escritorio', piso: 'Piso 3', zona: 'Area General', estado: 'Activo' },
  { id: 'D-302', tipo: 'Escritorio', piso: 'Piso 3', zona: 'Area General', estado: 'Activo' },
  { id: 'D-105', tipo: 'Escritorio', piso: 'Piso 1', zona: 'Area General', estado: 'Bloqueado' },
  { id: 'A-05', tipo: 'Cajon Estac.', piso: 'B1', zona: 'Fila A', estado: 'Activo' },
  { id: 'D-410', tipo: 'Escritorio', piso: 'Piso 4', zona: 'Hot Desking', estado: 'Inactivo' },
  { id: 'D-504', tipo: 'Escritorio', piso: 'Piso 5', zona: 'Sala Conf.', estado: 'Activo' },
]

const usuariosList = [
  { id: 'U-1024', nombre: 'Ana Martinez', email: 'ana.martinez@accenture.com', rol: 'Admin', depto: 'Operaciones', estado: 'Activo' },
  { id: 'U-1018', nombre: 'Gilberto R.', email: 'gilberto.r@accenture.com', rol: 'Usuario', depto: 'Tecnologia', estado: 'Activo' },
  { id: 'U-1007', nombre: 'Maria L.', email: 'maria.l@accenture.com', rol: 'Usuario', depto: 'Finanzas', estado: 'Activo' },
  { id: 'U-0998', nombre: 'Carlos P.', email: 'carlos.p@accenture.com', rol: 'Usuario', depto: 'Legal', estado: 'Bloqueado' },
  { id: 'U-0975', nombre: 'Laura V.', email: 'laura.v@accenture.com', rol: 'Supervisor', depto: 'RRHH', estado: 'Activo' },
  { id: 'U-0961', nombre: 'Pedro S.', email: 'pedro.s@accenture.com', rol: 'Usuario', depto: 'Marketing', estado: 'Inactivo' },
]

const reportZones = [
  { zona: 'Area General', piso: 'P3', pct: '91%', tone: 'hot' },
  { zona: 'Area General', piso: 'P1', pct: '85%', tone: 'hot' },
  { zona: 'Hot Desking', piso: 'P4', pct: '45%', tone: 'mint' },
  { zona: 'Sala Conf.', piso: 'P5', pct: '52%', tone: 'mint' },
]

function ReportesView() {
  return (
    <main className="admin-main admin-main--reports">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// reportes</span>
          <h1>REPORTES Y ANALITICA</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary">
            <AdminIcon name="download" />
            Exportar PDF
          </button>
          <button type="button" className="admin-btn-export">
            <AdminIcon name="download" />
            Exportar CSV
          </button>
        </div>
      </header>

      <section className="admin-filterbar admin-filterbar--reports">
        <button type="button" className="admin-filter-chip">01/Feb/2026</button>
        <span className="admin-filterbar__arrow">→</span>
        <button type="button" className="admin-filter-chip">28/Feb/2026</button>
        <select className="admin-select" defaultValue="todos">
          <option value="todos">Todos los pisos</option>
        </select>
        <select className="admin-select" defaultValue="tipo">
          <option value="tipo">Tipo: Todos</option>
        </select>
      </section>

      <section className="admin-reports-layout">
        <article className="admin-card admin-card--average">
          <div className="admin-card__header">
            <h2>Ocupacion Promedio</h2>
            <div className="admin-segmented" aria-label="Rango de tiempo">
              <button type="button" className="is-active">Dia</button>
              <button type="button">Semana</button>
              <button type="button">Mes</button>
            </div>
          </div>
          <div className="admin-scatter">
            {reportesSemana.map((d, index) => (
              <span
                key={d.day}
                className="admin-scatter__point"
                style={{
                  left: `${4 + index * 6}%`,
                  top: `${31 - Math.min(d.value, 95) * 0.18}%`,
                }}
              />
            ))}
            <div className="admin-scatter__labels">
              {reportesSemana.map((d) => (
                <span key={d.day}>{d.day}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="admin-card admin-card--no-shows">
          <div className="admin-card__header">
            <h2>Tasa de No-Shows</h2>
          </div>
          <strong className="admin-no-show__value">6.2%</strong>
          <p className="admin-no-show__trend">↘ ↓ 1.3% vs mes anterior</p>
          <p className="admin-no-show__detail">15 no-shows en Feb 2026</p>
          <div className="admin-no-show__floors">
            <span>Por piso:</span>
            <div><small>P3</small><i style={{ width: '86%' }} /></div>
            <div><small>P1</small><i style={{ width: '72%' }} /></div>
          </div>
        </article>

        <article className="admin-card admin-card--demand">
          <div className="admin-card__header">
            <h2>Horarios de Mayor Demanda</h2>
          </div>
          <div className="admin-demand-chart">
            {['07:00', '08:00', '09:00', '10:00', '11:00'].map((hour) => (
              <div key={hour} className="admin-demand-chart__row">
                <span>{hour}</span>
                <i />
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card admin-card--zones-used">
          <div className="admin-card__header">
            <h2>Zonas Mas / Menos Utilizadas</h2>
          </div>
          <div className="admin-zone-table">
            <div className="admin-zone-table__head">
              <span>Zona</span>
              <span>Piso</span>
              <span>%</span>
            </div>
            {reportZones.map((zone) => (
              <div key={`${zone.zona}-${zone.piso}`} className="admin-zone-table__row">
                <span>{zone.zona}</span>
                <span>{zone.piso}</span>
                <strong className={zone.tone === 'hot' ? 'is-hot' : 'is-mint'}>{zone.pct}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <button type="button" className="admin-fab" aria-label="Abrir soporte">
        <AdminIcon name="message" />
      </button>
    </main>
  )
}

function EspaciosView() {
  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión espacios</span>
          <h1>GESTION DE ESPACIOS</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary">
            <AdminIcon name="plusBox" />
            Agregar Espacio
          </button>
        </div>
      </header>

      <section className="admin-management-tools">
        <label className="admin-search">
          <AdminIcon name="search" />
          <input type="search" placeholder="Buscar por ID o nombre..." />
        </label>
        <select className="admin-select" defaultValue="tipo">
          <option value="tipo">Tipo: Todos</option>
        </select>
        <select className="admin-select" defaultValue="piso">
          <option value="piso">Piso: Todos</option>
        </select>
        <select className="admin-select" defaultValue="estado">
          <option value="estado">Estado: Todos</option>
        </select>
      </section>

      <section className="admin-card admin-card--management-table">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Piso</th>
                <th>Zona</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                      e.estado === 'Activo' ? 'admin-badge--ok' :
                      e.estado === 'Inactivo' ? 'admin-badge--rose' :
                      'admin-badge--yellow'
                    }`}>{e.estado}</span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="admin-btn-ghost-sm">Editar</button>
                      <button type="button" className={e.estado === 'Activo' ? 'admin-btn-danger-sm' : 'admin-btn-ghost-sm'}>
                        {e.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <span>Mostrando 1-6 de 296 espacios</span>
          <div>
            <button type="button" className="is-active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">→</button>
          </div>
        </div>
      </section>

      <button type="button" className="admin-fab" aria-label="Abrir soporte">
        <AdminIcon name="message" />
      </button>
    </main>
  )
}

function UsuariosView() {
  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión usuarios</span>
          <h1>GESTION DE USUARIOS</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary">
            <AdminIcon name="plusBox" />
            Agregar Usuario
          </button>
        </div>
      </header>

      <section className="admin-management-tools admin-management-tools--users">
        <label className="admin-search">
          <AdminIcon name="search" />
          <input type="search" placeholder="Buscar por nombre o correo..." />
        </label>
        <select className="admin-select" defaultValue="rol">
          <option value="rol">Rol: Todos</option>
        </select>
        <select className="admin-select" defaultValue="depto">
          <option value="depto">Depto: Todos</option>
        </select>
        <select className="admin-select" defaultValue="estado">
          <option value="estado">Estado: Todos</option>
        </select>
      </section>

      <section className="admin-card admin-card--management-table">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Depto.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosList.map((u) => (
                <tr key={u.id}>
                  <td className="admin-table__id">{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{u.depto}</td>
                  <td>
                    <span className={`admin-badge ${
                      u.estado === 'Activo' ? 'admin-badge--ok' :
                      u.estado === 'Inactivo' ? 'admin-badge--rose' :
                      'admin-badge--yellow'
                    }`}>{u.estado}</span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="admin-btn-ghost-sm">Editar</button>
                      <button type="button" className={u.estado === 'Activo' ? 'admin-btn-danger-sm' : 'admin-btn-ghost-sm'}>
                        {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <span>Mostrando 1-6 de 128 usuarios</span>
          <div>
            <button type="button" className="is-active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">→</button>
          </div>
        </div>
      </section>

      <button type="button" className="admin-fab" aria-label="Abrir soporte">
        <AdminIcon name="message" />
      </button>
    </main>
  )
}

// ── Visitas data ─────────────────────────────────────────
const visitasBigStats = [
  { label: 'Programadas para Hoy', value: '27', color: '#f5efff' },
  { label: 'Visitantes en Sitio', value: '12', color: '#12e0a4' },
  { label: 'Próximos Días', value: '45', color: '#b100ff' },
]

const visitasList = [
  { visitante: 'Maria Fernández', empresa: 'Cemex', anfitrion: 'Ana Martinez', fechaHora: '10/Mar 10:00AM', estado: 'Pre-registrado', acciones: ['Ver', 'ID'] },
  { visitante: 'Juan Gómez', empresa: 'IBM', anfitrion: 'Gilberto R.', fechaHora: '10/Mar 11:30AM', estado: 'En sitio', acciones: ['Check-out'] },
  { visitante: 'Laura Salas', empresa: 'Freelance', anfitrion: 'Carlos L.', fechaHora: '09/Mar 04:00PM', estado: 'Finalizada', acciones: ['Detalle'] },
]

function VisitasView() {
  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión visitas</span>
          <h1>GESTIÓN DE VISITAS</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary">
            <AdminIcon name="plusBox" />
            Registrar Visita
          </button>
        </div>
      </header>

      <section className="admin-visitas-stats">
        {visitasBigStats.map((s) => (
          <article key={s.label} className="admin-visitas-stat">
            <span className="admin-visitas-stat__label">{s.label}</span>
            <strong className="admin-visitas-stat__value" style={{ color: s.color }}>{s.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-management-tools" style={{ marginTop: '1.4rem' }}>
        <label className="admin-search" style={{ flex: 1 }}>
          <AdminIcon name="search" />
          <input type="search" placeholder="Buscar por nombre, empresa o anfitrión..." />
        </label>
        <select className="admin-select" defaultValue="estado">
          <option value="estado">Estado: Todos</option>
          <option value="preregistrado">Pre-registrado</option>
          <option value="ensitio">En sitio</option>
          <option value="finalizada">Finalizada</option>
        </select>
      </section>

      <section className="admin-card admin-card--management-table" style={{ marginTop: '1rem' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Empresa</th>
                <th>Anfitrión</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visitasList.map((v) => (
                <tr key={v.visitante}>
                  <td>{v.visitante}</td>
                  <td>{v.empresa}</td>
                  <td>{v.anfitrion}</td>
                  <td>{v.fechaHora}</td>
                  <td>
                    <span className={`admin-badge ${
                      v.estado === 'En sitio' ? 'admin-badge--ok' :
                      v.estado === 'Pre-registrado' ? 'admin-badge--yellow' :
                      'admin-badge--arch'
                    }`}>
                      {v.estado === 'En sitio' && <span className="admin-badge__dot" />}
                      {v.estado === 'Pre-registrado' && <span className="admin-badge__dot admin-badge__dot--yellow" />}
                      {v.estado}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {v.acciones.map((a) => (
                        <button key={a} type="button" className={a === 'Check-out' ? 'admin-btn-ghost-sm admin-btn-ghost-sm--mint' : a === 'Detalle' ? 'admin-btn-ghost-sm admin-btn-ghost-sm--muted' : 'admin-btn-ghost-sm'}>{a}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button type="button" className="admin-fab" aria-label="Abrir soporte">
        <AdminIcon name="message" />
      </button>
    </main>
  )
}

// ── Eventos data ──────────────────────────────────────────
const eventosBigStats = [
  { label: 'Eventos Activos', value: '3', color: '#12e0a4' },
  { label: 'Próximos 7 días', value: '5', color: '#12e0a4' },
  { label: 'Participantes Registrados', value: '86', color: '#b100ff' },
]

const eventosList = [
  { dot: '#12e0a4', nombre: 'Town Hall Q1', descripcion: 'Presentación de resultados trimestrales', fecha: '15/Mar/26', hora: '10:00-12:00', ubicacion: 'Piso 5 – Auditorio', acciones: ['Desbloquear'] },
  { dot: '#12e0a4', nombre: 'Workshop UX', descripcion: 'Taller de diseño centrado en usuario', fecha: '18/Mar/26', hora: '14:00-17:00', ubicacion: 'Piso 3 – Sala A', acciones: ['Editar', 'Desprogramar'] },
  { dot: '#ffe93b', nombre: 'Onboarding Marzo', descripcion: 'Inducción nuevos ingresos wave 3', fecha: '22/Mar/26', hora: '09:00-13:00', ubicacion: 'Piso 2 – Training', acciones: ['Editar', 'Desprogramar'] },
]

function EventosView() {
  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión eventos</span>
          <h1>GESTIÓN DE EVENTOS</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary">
            <AdminIcon name="plusBox" />
            Nuevo Evento
          </button>
        </div>
      </header>

      <section className="admin-visitas-stats">
        {eventosBigStats.map((s) => (
          <article key={s.label} className="admin-visitas-stat">
            <span className="admin-visitas-stat__label">{s.label}</span>
            <strong className="admin-visitas-stat__value" style={{ color: s.color }}>{s.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-card admin-card--management-table" style={{ marginTop: '1.4rem' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventosList.map((e) => (
                <tr key={e.nombre}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '0.55rem', height: '0.55rem', borderRadius: '999px', background: e.dot, flexShrink: 0 }} />
                      {e.nombre}
                    </span>
                  </td>
                  <td style={{ color: 'var(--admin-muted)' }}>{e.descripcion}</td>
                  <td>{e.fecha}</td>
                  <td>{e.hora}</td>
                  <td>{e.ubicacion}</td>
                  <td>
                    <div className="admin-table-actions">
                      {e.acciones.map((a) => (
                        <button key={a} type="button" className={a === 'Desprogramar' ? 'admin-btn-danger-sm' : 'admin-btn-ghost-sm'}>{a}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button type="button" className="admin-fab" aria-label="Abrir soporte">
        <AdminIcon name="message" />
      </button>
    </main>
  )
}

// ── Prediccion IA data ────────────────────────────────────
const iaScatterPoints = [
  { dia: 'Lun 09', x: 14, y: 62 },
  { dia: 'Mar 10', x: 27, y: 50 },
  { dia: 'Mié 11', x: 40, y: 57 },
  { dia: 'Jue 12', x: 54, y: 38 },
  { dia: 'Vie 13', x: 67, y: 28 },
  { dia: 'Sáb 14', x: 80, y: 50 },
  { dia: 'Dom 15', x: 90, y: 70 },
]

const iaInsights = [
  {
    titulo: 'Alta Demanda el Jueves 12',
    texto: 'Se proyecta un 92% de ocupación en Piso 3 y Piso 4. Sugerimos habilitar hot-desking extra.',
    tipo: 'alerta',
    accion: 'Habilitar espacios',
  },
  {
    titulo: 'Baja Ocupación el Viernes',
    texto: 'Piso 1 proyecta < 30%. Puede considerar cierre por ahorro de energía.',
    tipo: 'mint',
    accion: null,
  },
  {
    titulo: 'Optimización de Limpieza',
    texto: 'Zonas B y C del Piso 2 no tendrán uso el fin de semana.',
    tipo: 'violet',
    accion: null,
  },
]

function PrediccionIAView() {
  return (
    <main className="admin-main admin-main--ia">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// predicción IA</span>
          <h1>PREDICCIÓN DE OCUPACIÓN</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export">
            Proyección: Próximos 7 Días
          </button>
        </div>
      </header>

      <div className="admin-ia-layout">
        <article className="admin-card admin-ia-chart-card">
          <div className="admin-card__header">
            <h2>Ocupación Proyectada vs Capacidad</h2>
          </div>
          <div className="admin-ia-scatter">
            {iaScatterPoints.map((p) => (
              <span
                key={p.dia}
                className="admin-ia-scatter__point"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                title={`${p.dia}: ~${Math.round(100 - p.y)}%`}
              />
            ))}
            <div className="admin-ia-scatter__capacity">Capacidad Max 100%</div>
            <div className="admin-ia-scatter__xaxis">
              {iaScatterPoints.map((p) => (
                <span key={p.dia}>{p.dia}</span>
              ))}
            </div>
          </div>
        </article>

        <aside className="admin-ia-insights">
          <h2 className="admin-ia-insights__title">Insights y Recomendaciones</h2>
          {iaInsights.map((ins) => (
            <div key={ins.titulo} className={`admin-ia-insight admin-ia-insight--${ins.tipo}`}>
              <div className="admin-ia-insight__header">
                <span className="admin-ia-insight__icon">
                  {ins.tipo === 'alerta' ? '⚠' : ins.tipo === 'mint' ? '↘' : '▷'}
                </span>
                <strong>{ins.titulo}</strong>
              </div>
              <p>{ins.texto}</p>
              {ins.accion && (
                <button type="button" className="admin-ia-insight__btn">{ins.accion}</button>
              )}
            </div>
          ))}
        </aside>
      </div>

      <button type="button" className="admin-fab" aria-label="Abrir soporte">
        <AdminIcon name="message" />
      </button>
    </main>
  )
}

export default function AdminDashboardPage() {
  const [activePage, setActivePage] = useState('Dashboard')
  const { user } = useAuth()
  const { dashboard, loading, error } = useDashboard()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const isBackendConnected = Boolean(dashboard) && !error
  const hasBackendData = Boolean(dashboard?.hasBackendData)

  const dashboardStats = dashboard?.stats
    ? [
        {
          label: 'Escritorios',
          value: String(dashboard.stats.totalSpaces ?? 0),
          detail: 'total',
          accent: 'admin-stat--violet',
          icon: 'desktop',
        },
        {
          label: 'Ocupados',
          value: String(dashboard.stats.occupiedSpaces ?? 0),
          detail: 'en uso ahora',
          accent: 'admin-stat--rose',
          icon: 'userSquare',
        },
        {
          label: 'Disponibles',
          value: String(dashboard.stats.availableSpaces ?? 0),
          detail: 'libres ahora',
          accent: 'admin-stat--mint',
          icon: 'checkSquare',
        },
        {
          label: 'Cajones',
          value: String(dashboard.stats.parkingTotal ?? 0),
          detail: `${dashboard.stats.parkingOccupied ?? 0} ocupados`,
          accent: 'admin-stat--violet',
          icon: 'car',
        },
        {
          label: '% Ocupacion',
          value: formatPercent(dashboard.stats.occupancyPercent),
          detail: 'en vivo',
          accent: 'admin-stat--outline',
          icon: null,
        },
        {
          label: 'Bloqueados',
          value: String(dashboard.stats.blockedSpaces ?? 0),
          detail: 'mantenimiento',
          accent: 'admin-stat--yellow',
          icon: 'lock',
        },
      ]
    : loading
      ? loadingStats
      : emptyStats

  const dashboardFloors = dashboard?.floors?.length
    ? dashboard.floors.map((floor) => ({
        label: floor.label,
        occupied: clampPercent(floor.occupancyPercent),
      }))
    : []

  const dashboardFloorRows = dashboard?.floors?.length
    ? dashboard.floors.map((floor) => ({
        label: floor.label,
        value: formatPercent(floor.occupancyPercent),
        percent: clampPercent(floor.occupancyPercent),
        accent: floor.label === dashboard.selectedFloor,
      }))
    : []

  const dashboardZones = dashboard?.zones?.length
    ? dashboard.zones.map((zone) => ({
        label: zone.label,
        value: formatPercent(zone.value),
        color: zone.color,
      }))
    : []

  const dashboardActivity = dashboard?.recentActivity?.length
    ? dashboard.recentActivity.map((entry) => ({
        text: entry.text,
        time: entry.time,
        color: activityColor(entry.status),
      }))
    : [
        {
          text: loading
            ? 'Cargando datos reales...'
            : error
              ? error
              : isBackendConnected
                ? 'Backend conectado, sin actividad reciente'
                : 'Sin datos del backend',
          time: '',
          color: error ? '#ff3355' : '#16e0a3',
        },
      ]

  const selectedZonePercent = dashboardZones[0]?.value || '0%'
  const selectedZoneValue = clampPercent(Number.parseInt(selectedZonePercent, 10))
  const liveStatus = loading
    ? 'Cargando datos...'
    : error
      ? error
      : hasBackendData
        ? 'En vivo - actualizado'
        : 'Conectado - sin registros'
  const liveClassName = `admin-main__live ${error ? 'is-error' : !hasBackendData && !loading ? 'is-warning' : ''}`

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
            <span className="admin-main__eyebrow">// dashboard ocupación</span>
            <h1>OCUPACION EN TIEMPO REAL</h1>
          </div>
          <div className={liveClassName}>
            <span className="admin-main__dot" />
            <span>{liveStatus}</span>
          </div>
        </header>

        <section className="admin-stats">
          {dashboardStats.map((stat) => (
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
              {dashboardFloors.length > 0 ? (
                dashboardFloors.map((floor) => (
                  <div key={floor.label} className="admin-bars__item" title={floor.label}>
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
                ))
              ) : (
                <div className="admin-empty-state">
                  {loading ? 'Cargando pisos...' : 'Sin pisos para mostrar'}
                </div>
              )}
            </div>

            <div className="admin-floor-list">
              {dashboardFloorRows.length > 0 ? (
                dashboardFloorRows.map((floor) => (
                  <div key={floor.label} className="admin-floor-list__row">
                    <span>{floor.label}</span>
                    <div className="admin-floor-list__bar">
                      <div
                        className="admin-floor-list__bar-fill"
                        style={{ width: `${floor.percent}%` }}
                      />
                    </div>
                    <strong className={floor.accent ? 'is-accent' : ''}>{floor.value}</strong>
                  </div>
                ))
              ) : (
                <div className="admin-empty-state admin-empty-state--compact">
                  {loading ? 'Cargando pisos...' : 'Sin pisos para mostrar'}
                </div>
              )}
            </div>
          </article>

          <article className="admin-card admin-card--zones">
            <div className="admin-card__header admin-card__header--stacked">
              <h2>Ocupacion por Zona</h2>
              <span>{dashboard?.selectedFloor ? `${dashboard.selectedFloor} seleccionado` : 'Piso 3 seleccionado'}</span>
            </div>

            <div className="admin-donut">
              <div
                className="admin-donut__chart"
                style={{ '--admin-donut-value': `${selectedZoneValue}%` }}
              >
                <div className="admin-donut__inner">{selectedZonePercent}</div>
              </div>
            </div>

            <div className="admin-legend">
              {dashboardZones.length > 0 ? (
                dashboardZones.map((zone) => (
                  <div key={zone.label} className="admin-legend__item">
                    <span className="admin-legend__dot" style={{ backgroundColor: zone.color }} />
                    <span>{zone.label}: {zone.value}</span>
                  </div>
                ))
              ) : (
                <div className="admin-empty-state admin-empty-state--compact">
                  {loading ? 'Cargando zonas...' : 'Sin zonas del backend'}
                </div>
              )}
            </div>
          </article>

          <article className="admin-card admin-card--activity">
            <div className="admin-card__header">
              <h2>Actividad Reciente</h2>
            </div>

            <div className="admin-activity">
              {dashboardActivity.map((entry) => (
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
      {activePage === 'Usuarios' && <UsuariosView />}
      {activePage === 'Visitas' && <VisitasView />}
      {activePage === 'Eventos' && <EventosView />}
      {activePage === 'Prediccion IA' && <PrediccionIAView />}
    </div>
  )
}
