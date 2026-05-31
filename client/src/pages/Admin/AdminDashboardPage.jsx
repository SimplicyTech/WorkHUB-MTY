import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useDashboard } from '../../context/useDashboard'
import { useAuth } from '../../context/useAuth'
import { getAllEmpleados, getAllReservaciones, createEmpleado, deleteEmpleado, getAllEspacios, createEspacio, updateEspacioEstado, getPisos, getRoles, getEventos, createEvento, deleteEvento } from '../../services/reservations'
import CustomDatePicker from '../../components/reserve/CustomDatePicker'
import CustomTimePicker from '../../components/reserve/CustomTimePicker'
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

const PISO_ADMIN_FUNCIONAL_ID = 2

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
    trash: (
      <>
        <path {...common} d="M4 7h16" />
        <path {...common} d="M10 11v6" />
        <path {...common} d="M14 11v6" />
        <path {...common} d="M6 7l1 13h10l1-13" />
        <path {...common} d="M9 7V4h6v3" />
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

    </main>
  )
}

function EspaciosView() {
  const [espacios, setEspacios] = useState([])
  const [pisos, setPisos] = useState([])
  const [loadingPisos, setLoadingPisos] = useState(true)
  const [loadingEspacios, setLoadingEspacios] = useState(false)
  const [error, setError] = useState(null)
  
  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroPiso, setFiltroPiso] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ Nombre: '', Tipo: 'Escritorio', PisoID: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const cargarPisos = async () => {
    setLoadingPisos(true)
    setError(null)
    try {
      const resPisos = await getPisos()
      setPisos(resPisos.data || [])
      if (resPisos.data?.length > 0 && !form.PisoID) {
        const pisoFuncional = resPisos.data.find((p) => p.PisoID === PISO_ADMIN_FUNCIONAL_ID)
        setForm(f => ({ ...f, PisoID: String(pisoFuncional?.PisoID || resPisos.data[0].PisoID) }))
      }
    } catch (err) {
      setError('No se pudieron cargar los pisos')
    } finally {
      setLoadingPisos(false)
    }
  }

  const cargarEspacios = async (pisoId = filtroPiso) => {
    if (!pisoId) {
      setEspacios([])
      return
    }
    setLoadingEspacios(true)
    setError(null)
    try {
      const resEspacios = await getAllEspacios(pisoId)
      setEspacios(resEspacios.data || [])
    } catch (err) {
      setError('No se pudieron cargar los espacios')
    } finally {
      setLoadingEspacios(false)
    }
  }

  useEffect(() => { cargarPisos() }, [])

  useEffect(() => {
    cargarEspacios(filtroPiso)
  }, [filtroPiso])

  const filtrados = espacios.filter(e => {
    const nombre = (e.Nombre || '').toLowerCase()
    const id = String(e.EspacioID).toLowerCase()
    const matchSearch = nombre.includes(search.toLowerCase()) || id.includes(search.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || e.Tipo === filtroTipo
    const matchPiso = String(e.PisoID) === filtroPiso
    const matchEstado = filtroEstado === 'todos' || (e.Estado || 'Activo') === filtroEstado
    return matchSearch && matchTipo && matchPiso && matchEstado
  })

  const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.Nombre || !form.Tipo || !form.PisoID) {
      setFormError('Completa todos los campos')
      return
    }
    setSaving(true)
    try {
      await createEspacio(form)
      setShowModal(false)
      setForm(f => ({ ...f, Nombre: '' }))
      if (String(form.PisoID) === filtroPiso) cargarEspacios()
    } catch (err) {
      setFormError(err?.error || 'Error al crear espacio')
    } finally {
      setSaving(false)
    }
  }

  const toggleEstado = async (espacio) => {
    const estadoActual = espacio.Estado || 'Activo'
    const nuevoEstado = estadoActual === 'Activo' ? 'Bloqueado' : 'Activo'
    try {
      const res = await updateEspacioEstado(espacio.EspacioID, nuevoEstado)
      const estadoGuardado = res?.data?.Estado || nuevoEstado
      setEspacios(espacios.map(e => e.EspacioID === espacio.EspacioID ? { ...e, Estado: estadoGuardado } : e))
      await cargarEspacios()
    } catch (err) {
      alert(err?.error || 'Error al actualizar estado')
    }
  }

  const tiposUnicos = [...new Set(espacios.map(e => e.Tipo))].filter(Boolean)

  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión espacios</span>
          <h1>GESTION DE ESPACIOS</h1>
        </div>
      </header>

      <section className="admin-management-tools admin-management-tools--spaces">
        <label className="admin-search">
          <AdminIcon name="search" />
          <input type="search" placeholder="Buscar por ID o nombre..." value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <select className="admin-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Tipo: Todos</option>
          {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="admin-select" value={filtroPiso} onChange={e => setFiltroPiso(e.target.value)}>
          <option value="">{loadingPisos ? 'Cargando pisos...' : 'Selecciona piso'}</option>
          {pisos.map(p => (
            <option key={p.PisoID} value={String(p.PisoID)}>
              {p.Nombre}
            </option>
          ))}
        </select>
        <select className="admin-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Estado: Todos</option>
          <option value="Activo">Activo</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
      </section>

      <section className="admin-card admin-card--management-table">
        {!filtroPiso && !loadingPisos && <p className="admin-table-msg">Selecciona un piso para ver sus espacios.</p>}
        {loadingEspacios && <p className="admin-table-msg">Cargando espacios…</p>}
        {error && <p className="admin-table-msg admin-table-msg--error">{error}</p>}
        {filtroPiso && !loadingEspacios && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Piso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => {
                  const estadoActual = e.Estado || 'Activo';
                  return (
                    <tr key={e.EspacioID}>
                      <td className="admin-table__id">E-{e.EspacioID}</td>
                      <td>{e.Nombre}</td>
                      <td>{e.Tipo}</td>
                      <td>{e.PisoNombre || `Piso ${e.PisoID}`}</td>
                      <td>
                        <span className={`admin-badge ${
                          estadoActual === 'Activo' ? 'admin-badge--ok' : 'admin-badge--rose'
                        }`}>{estadoActual}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button type="button" className={estadoActual === 'Activo' ? 'admin-btn-danger-sm' : 'admin-btn-ghost-sm'} onClick={() => toggleEstado(e)}>
                            {estadoActual === 'Activo' ? 'Bloquear' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="admin-table-msg">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {filtroPiso && !loadingEspacios && !error && (
          <div className="admin-pagination">
            <span>Mostrando {filtrados.length} de {espacios.length} espacios</span>
          </div>
        )}
      </section>

      {/* ── Modal Agregar Espacio ── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Agregar Espacio</h2>
              <button type="button" className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSubmit}>
              <label className="admin-modal__label">
                Nombre del espacio
                <input className="admin-modal__input" name="Nombre" value={form.Nombre} onChange={handleFormChange} placeholder="Ej. Escritorio 42" />
              </label>
              <label className="admin-modal__label">
                Tipo
                <select className="admin-modal__input" name="Tipo" value={form.Tipo} onChange={handleFormChange}>
                  <option value="Escritorio">Escritorio</option>
                  <option value="Sala">Sala</option>
                  <option value="Estacionamiento">Estacionamiento</option>
                </select>
              </label>
              <label className="admin-modal__label">
                Piso
                <select className="admin-modal__input" name="PisoID" value={form.PisoID} onChange={handleFormChange}>
                  {pisos.map(p => (
                    <option key={p.PisoID} value={String(p.PisoID)} disabled={p.PisoID !== PISO_ADMIN_FUNCIONAL_ID}>
                      {p.Nombre}{p.PisoID === PISO_ADMIN_FUNCIONAL_ID ? '' : ' — Próximamente'}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="admin-modal__error" style={{ color: '#ff3246', fontSize: '0.85rem' }}>{formError}</p>}
              <div className="admin-modal__actions">
                <button type="button" className="admin-btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear Espacio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  )
}

function UsuariosView() {
  const { user } = useAuth()
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [roles, setRoles] = useState([])

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ Nombre: '', Correo: '', Contrasena: '', RolID: '3', NivelID: '1' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const cargarEmpleados = () => {
    setLoading(true)
    getAllEmpleados()
      .then((res) => setEmpleados(res.data || []))
      .catch(() => setError('No se pudo cargar la lista de empleados'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarEmpleados() }, [])
  useEffect(() => {
    getRoles().then((res) => setRoles(res.data || [])).catch(() => {})
  }, [])

  // Nombre del rol leído de la BD (tabla ROL), no hardcodeado.
  const rolNombre = (rolId) => roles.find((r) => Number(r.RolID) === Number(rolId))?.Nombre || `Rol ${rolId}`

  const filtrados = empleados.filter((u) => {
    const nombre = (u.Nombre || '').toLowerCase()
    const correo = (u.Correo || '').toLowerCase()
    const coincideBusqueda = nombre.includes(search.toLowerCase()) || correo.includes(search.toLowerCase())
    const coincideRol = filtroRol === 'todos' || String(u.RolID) === filtroRol
    return coincideBusqueda && coincideRol
  })

  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.Nombre || !form.Correo || !form.Contrasena) {
      setFormError('Nombre, Correo y Contraseña son obligatorios')
      return
    }
    setSaving(true)
    try {
      await createEmpleado({ ...form, RolID: Number(form.RolID), NivelID: Number(form.NivelID) })
      setShowModal(false)
      setForm({ Nombre: '', Correo: '', Contrasena: '', RolID: '3', NivelID: '1' })
      cargarEmpleados()
    } catch (err) {
      setFormError(err?.error || 'Error al crear el usuario')
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (empleado) => {
    setUserToDelete(empleado)
    setDeleteError(null)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setUserToDelete(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteEmpleado(userToDelete.EmpleadoID)
      setEmpleados((actuales) => actuales.filter((u) => u.EmpleadoID !== userToDelete.EmpleadoID))
      setUserToDelete(null)
    } catch (err) {
      setDeleteError(err?.error || 'No se pudo dar de baja al usuario')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión usuarios</span>
          <h1>GESTION DE USUARIOS</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary" onClick={() => setShowModal(true)}>
            <AdminIcon name="plusBox" />
            Agregar Usuario
          </button>
        </div>
      </header>

      <section className="admin-management-tools admin-management-tools--users">
        <label className="admin-search">
          <AdminIcon name="search" />
          <input
            type="search"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select className="admin-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
          <option value="todos">Rol: Todos</option>
          {roles.map((r) => (
            <option key={r.RolID} value={String(r.RolID)}>{r.Nombre}</option>
          ))}
        </select>
      </section>

      <section className="admin-card admin-card--management-table">
        {loading && <p className="admin-table-msg">Cargando empleados…</p>}
        {error && <p className="admin-table-msg admin-table-msg--error">{error}</p>}
        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Puntos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.EmpleadoID}>
                    <td className="admin-table__id">U-{u.EmpleadoID}</td>
                    <td>{u.Nombre}</td>
                    <td style={{ color: 'var(--admin-muted)', fontSize: '0.88rem' }}>{u.Correo}</td>
                    <td>
                      <span className={`admin-badge ${
                        u.RolID === 1 ? 'admin-badge--tipo' :
                        u.RolID === 2 ? 'admin-badge--yellow' :
                        'admin-badge--ok'
                      }`}>
                        {rolNombre(u.RolID)}
                      </span>
                    </td>
                    <td>{u.Puntos ?? 0}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn-danger-sm admin-btn-danger-sm--icon"
                        onClick={() => openDeleteModal(u)}
                        disabled={String(user?.empleadoId) === String(u.EmpleadoID)}
                        title={String(user?.empleadoId) === String(u.EmpleadoID) ? 'No puedes darte de baja a ti mismo' : 'Eliminar usuario'}
                        aria-label={`Eliminar usuario ${u.Nombre}`}
                      >
                        <AdminIcon name="trash" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="admin-table-msg">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="admin-pagination">
            <span>Mostrando {filtrados.length} de {empleados.length} empleados</span>
          </div>
        )}
      </section>

      {/* ── Modal Agregar Usuario ── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Agregar Usuario</h2>
              <button type="button" className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSubmit}>
              <label className="admin-modal__label">
                Nombre completo
                <input className="admin-modal__input" name="Nombre" value={form.Nombre} onChange={handleFormChange} placeholder="Ej. Juan Pérez" />
              </label>
              <label className="admin-modal__label">
                Correo electrónico
                <input className="admin-modal__input" type="email" name="Correo" value={form.Correo} onChange={handleFormChange} placeholder="correo@accenture.com" />
              </label>
              <label className="admin-modal__label">
                Contraseña
                <input className="admin-modal__input" type="password" name="Contrasena" value={form.Contrasena} onChange={handleFormChange} placeholder="••••••••" />
              </label>
              <label className="admin-modal__label">
                Rol
                <select className="admin-modal__input admin-modal__select" name="RolID" value={form.RolID} onChange={handleFormChange}>
                  {roles.map((r) => (
                    <option key={r.RolID} value={String(r.RolID)}>{r.Nombre}</option>
                  ))}
                </select>
              </label>
              {formError && <p className="admin-modal__error">{formError}</p>}
              <div className="admin-modal__actions">
                <button type="button" className="admin-btn-export" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-export admin-btn-export--primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="admin-modal-overlay" onClick={closeDeleteModal}>
          <div className="admin-modal admin-modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Confirmar baja</h2>
              <button type="button" className="admin-modal__close" onClick={closeDeleteModal} disabled={deleting}>✕</button>
            </div>
            <div className="admin-confirm">
              <p className="admin-confirm__title">¿Estás seguro que quieres dar de baja?</p>
              <p className="admin-confirm__body">
                Se eliminará a <strong>{userToDelete.Nombre}</strong> de la base de datos junto con sus reservaciones y registros relacionados.
              </p>
              {deleteError && <p className="admin-modal__error">{deleteError}</p>}
              <div className="admin-modal__actions">
                <button type="button" className="admin-btn-export" onClick={closeDeleteModal} disabled={deleting}>Cancelar</button>
                <button type="button" className="admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Eliminando…' : 'Dar de baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

// ── Visitas data ─────────────────────────────────────────
function VisitasView() {
  const [reservaciones, setReservaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filtroEstatus, setFiltroEstatus] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    getAllReservaciones()
      .then((res) => setReservaciones(res.data || []))
      .catch(() => setError('No se pudo cargar las reservaciones'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const hoy = reservaciones.filter((r) => {
    const fecha = r.Fecha ? String(r.Fecha).slice(0, 10) : ''
    return fecha === today
  })

  const programadas = hoy.length
  const activas = hoy.filter((r) => r.EstatusNombre === 'Activa').length
  const proximos = reservaciones.filter((r) => {
    const fecha = r.Fecha ? String(r.Fecha).slice(0, 10) : ''
    return fecha > today
  }).length

  const filtradas = reservaciones.filter((r) => {
    const fechaR = r.Fecha ? String(r.Fecha).slice(0, 10) : ''
    const nombre = (r.EmpleadoNombre || '').toLowerCase()
    const espacio = (r.EspacioNombre || '').toLowerCase()
    const coincide = nombre.includes(search.toLowerCase()) || espacio.includes(search.toLowerCase())
    const coincideEstatus = filtroEstatus === 'todos' || (r.EstatusNombre || '') === filtroEstatus
    const coincideFecha = !filtroFecha || fechaR === filtroFecha
    return coincide && coincideEstatus && coincideFecha
  })

  const fmtHora = (h) => (h ? String(h).slice(0, 5) : '—')
  const fmtFecha = (f) => {
    if (!f) return '—'
    const d = new Date(f)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
  }

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
        <article className="admin-visitas-stat">
          <span className="admin-visitas-stat__label">Programadas para Hoy</span>
          <strong className="admin-visitas-stat__value" style={{ color: '#f5efff' }}>{loading ? '…' : programadas}</strong>
        </article>
        <article className="admin-visitas-stat">
          <span className="admin-visitas-stat__label">Activas en Sitio</span>
          <strong className="admin-visitas-stat__value" style={{ color: '#12e0a4' }}>{loading ? '…' : activas}</strong>
        </article>
        <article className="admin-visitas-stat">
          <span className="admin-visitas-stat__label">Próximos Días</span>
          <strong className="admin-visitas-stat__value" style={{ color: '#b100ff' }}>{loading ? '…' : proximos}</strong>
        </article>
      </section>

      <section className="admin-management-tools" style={{ marginTop: '1.4rem', gridTemplateColumns: 'minmax(200px, 1fr) 150px 160px' }}>
        <label className="admin-search" style={{ flex: 1 }}>
          <AdminIcon name="search" />
          <input
            type="search"
            placeholder="Buscar por empleado o espacio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <input
          type="date"
          className="admin-select admin-select--date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
        <select className="admin-select" value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)}>
          <option value="todos">Estado: Todos</option>
          <option value="Activa">Activa</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </section>

      <section className="admin-card admin-card--management-table" style={{ marginTop: '1rem' }}>
        {loading && <p className="admin-table-msg">Cargando reservaciones…</p>}
        {error && <p className="admin-table-msg admin-table-msg--error">{error}</p>}
        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Empleado</th>
                  <th>Espacio</th>
                  <th>Fecha</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((r) => (
                  <tr key={r.ReservacionID}>
                    <td className="admin-table__id">R-{r.ReservacionID}</td>
                    <td>{r.EmpleadoNombre || '—'}</td>
                    <td>{r.EspacioNombre || '—'}</td>
                    <td>{fmtFecha(r.Fecha)}</td>
                    <td className="admin-table__mint">{fmtHora(r.HoraInicio)}</td>
                    <td>{fmtHora(r.HoraFin)}</td>
                    <td>
                      <span className={`admin-badge ${
                        r.EstatusNombre === 'Activa' ? 'admin-badge--ok' :
                        r.EstatusNombre === 'Cancelada' ? 'admin-badge--rose' :
                        'admin-badge--arch'
                      }`}>
                        {r.EstatusNombre === 'Activa' && <span className="admin-badge__dot" />}
                        {r.EstatusNombre || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr><td colSpan={7} className="admin-table-msg">Sin reservaciones para hoy</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="admin-pagination">
            <span>Mostrando {filtradas.length} de {hoy.length} reservaciones hoy</span>
          </div>
        )}
      </section>

    </main>
  )
}

// ── Eventos (bloqueo masivo de espacios) ──────────────────
function EventosView() {
  const [eventos, setEventos] = useState([])
  const [pisos, setPisos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // Modal crear
  const [showModal, setShowModal] = useState(false)
  const hoyStr = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    Nombre: '',
    Motivo: '',
    FechaInicio: hoyStr,
    FechaFin: hoyStr,
    todoElDia: true,
    HoraInicio: '09:00',
    HoraFin: '14:00',
    PisoID: String(PISO_ADMIN_FUNCIONAL_ID),
    bloquearPisoCompleto: true,
    EspacioIDs: [],
  })
  const [espaciosPiso, setEspaciosPiso] = useState([])
  const [loadingEspacios, setLoadingEspacios] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  // Eliminar
  const [eventoToDelete, setEventoToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const cargarEventos = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getEventos()
      setEventos(res.data || [])
    } catch {
      setError('No se pudieron cargar los eventos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarEventos() }, [])
  useEffect(() => { getPisos().then((res) => setPisos(res.data || [])).catch(() => {}) }, [])

  // Cuando NO se bloquea el piso completo, cargamos sus espacios para elegir.
  useEffect(() => {
    if (form.bloquearPisoCompleto || !form.PisoID) {
      setEspaciosPiso([])
      return
    }
    setLoadingEspacios(true)
    getAllEspacios(form.PisoID)
      .then((res) => setEspaciosPiso(res.data || []))
      .catch(() => setEspaciosPiso([]))
      .finally(() => setLoadingEspacios(false))
  }, [form.PisoID, form.bloquearPisoCompleto])

  const today = new Date().toISOString().slice(0, 10)
  const totalEspacios = eventos.reduce((acc, e) => acc + Number(e.EspaciosBloqueados || 0), 0)
  const vigentes = eventos.filter((e) => e.Estatus !== 'Cancelado' && (e.FechaFin ? String(e.FechaFin).slice(0, 10) >= today : false)).length

  // Estado mostrado: Cancelado (borrado lógico), Finalizado (su fecha fin ya
  // pasó) o Activo (vigente). Finalizado/Activo se derivan, no se guardan.
  const estadoEvento = (e) => {
    if (e.Estatus === 'Cancelado') return 'Cancelado'
    if (e.FechaFin && String(e.FechaFin).slice(0, 10) < today) return 'Finalizado'
    return 'Activo'
  }

  const filtrados = eventos.filter((e) => {
    const nombre = (e.Nombre || '').toLowerCase()
    const motivo = (e.Motivo || '').toLowerCase()
    return nombre.includes(search.toLowerCase()) || motivo.includes(search.toLowerCase())
  })

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const toggleEspacio = (espacioId) => {
    setForm((f) => {
      const exists = f.EspacioIDs.includes(espacioId)
      return {
        ...f,
        EspacioIDs: exists ? f.EspacioIDs.filter((id) => id !== espacioId) : [...f.EspacioIDs, espacioId],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.Nombre || !form.FechaInicio || !form.FechaFin) {
      setFormError('Nombre, fecha de inicio y fecha de fin son obligatorios')
      return
    }
    if (form.FechaFin < form.FechaInicio) {
      setFormError('La fecha de fin no puede ser anterior a la de inicio')
      return
    }
    if (!form.bloquearPisoCompleto && form.EspacioIDs.length === 0) {
      setFormError('Selecciona al menos un espacio o activa "Bloquear piso completo"')
      return
    }
    setSaving(true)
    try {
      await createEvento({
        Nombre: form.Nombre,
        Motivo: form.Motivo || null,
        FechaInicio: form.FechaInicio,
        FechaFin: form.FechaFin,
        HoraInicio: form.todoElDia ? null : form.HoraInicio,
        HoraFin: form.todoElDia ? null : form.HoraFin,
        PisoID: form.bloquearPisoCompleto ? Number(form.PisoID) : undefined,
        EspacioIDs: form.bloquearPisoCompleto ? undefined : form.EspacioIDs,
      })
      setShowModal(false)
      setForm((f) => ({ ...f, Nombre: '', Motivo: '', EspacioIDs: [] }))
      await cargarEventos()
    } catch (err) {
      setFormError(err?.error || 'Error al crear el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!eventoToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteEvento(eventoToDelete.EventoID)
      setEventoToDelete(null)
      await cargarEventos()
    } catch (err) {
      setDeleteError(err?.error || 'No se pudo cancelar el evento')
    } finally {
      setDeleting(false)
    }
  }

  const fmtFecha = (f) => {
    if (!f) return '—'
    const d = new Date(f)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
  }
  const fmtHora = (h) => (h ? String(h).slice(0, 5) : '')

  return (
    <main className="admin-main admin-main--management">
      <header className="admin-main__header">
        <div>
          <span className="admin-main__eyebrow">// gestión eventos</span>
          <h1>GESTIÓN DE EVENTOS</h1>
        </div>
        <div className="admin-main__actions">
          <button type="button" className="admin-btn-export admin-btn-export--primary" onClick={() => setShowModal(true)}>
            <AdminIcon name="plusBox" />
            Nuevo Evento
          </button>
        </div>
      </header>

      <section className="admin-visitas-stats">
        <article className="admin-visitas-stat">
          <span className="admin-visitas-stat__label">Eventos Registrados</span>
          <strong className="admin-visitas-stat__value" style={{ color: '#f5efff' }}>{loading ? '…' : eventos.length}</strong>
        </article>
        <article className="admin-visitas-stat">
          <span className="admin-visitas-stat__label">Vigentes / Próximos</span>
          <strong className="admin-visitas-stat__value" style={{ color: '#12e0a4' }}>{loading ? '…' : vigentes}</strong>
        </article>
        <article className="admin-visitas-stat">
          <span className="admin-visitas-stat__label">Espacios Bloqueados</span>
          <strong className="admin-visitas-stat__value" style={{ color: '#b100ff' }}>{loading ? '…' : totalEspacios}</strong>
        </article>
      </section>

      <section className="admin-management-tools" style={{ marginTop: '1.4rem' }}>
        <label className="admin-search" style={{ flex: 1 }}>
          <AdminIcon name="search" />
          <input
            type="search"
            placeholder="Buscar por nombre o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </section>

      <section className="admin-card admin-card--management-table" style={{ marginTop: '1rem' }}>
        {loading && <p className="admin-table-msg">Cargando eventos…</p>}
        {error && <p className="admin-table-msg admin-table-msg--error">{error}</p>}
        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Motivo</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Horario</th>
                  <th>Espacios</th>
                  <th>Estatus</th>
                  <th>Organizador</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => {
                  const estado = estadoEvento(e)
                  return (
                  <tr key={e.EventoID}>
                    <td>{e.Nombre}</td>
                    <td style={{ color: 'var(--admin-muted)' }}>{e.Motivo || '—'}</td>
                    <td>{fmtFecha(e.FechaInicio)}</td>
                    <td>{fmtFecha(e.FechaFin)}</td>
                    <td style={{ color: 'var(--admin-muted)', fontSize: '0.82rem' }}>{e.HoraInicio && e.HoraFin ? `${fmtHora(e.HoraInicio)}–${fmtHora(e.HoraFin)}` : 'Todo el día'}</td>
                    <td><span className="admin-badge admin-badge--yellow">{e.EspaciosBloqueados ?? 0}</span></td>
                    <td>
                      <span className={`admin-badge ${estado === 'Activo' ? 'admin-badge--ok' : estado === 'Cancelado' ? 'admin-badge--rose' : 'admin-badge--arch'}`}>{estado}</span>
                    </td>
                    <td style={{ color: 'var(--admin-muted)' }}>{e.OrganizadorNombre || e.EmpleadoID || '—'}</td>
                    <td>
                      {e.Estatus === 'Cancelado' ? (
                        <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>—</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn-danger-sm admin-btn-danger-sm--icon"
                          onClick={() => { setEventoToDelete(e); setDeleteError(null) }}
                          aria-label={`Cancelar evento ${e.Nombre}`}
                        >
                          <AdminIcon name="trash" />
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                  )
                })}
                {filtrados.length === 0 && (
                  <tr><td colSpan={9} className="admin-table-msg">Sin eventos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="admin-pagination">
            <span>Mostrando {filtrados.length} de {eventos.length} eventos</span>
          </div>
        )}
      </section>

      {/* ── Modal Nuevo Evento ── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ overflow: 'visible' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Nuevo Evento</h2>
              <button type="button" className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSubmit}>
              <label className="admin-modal__label">
                Nombre del evento
                <input className="admin-modal__input" name="Nombre" value={form.Nombre} onChange={handleFormChange} placeholder="Ej. Hackathon Q2" />
              </label>
              <label className="admin-modal__label">
                Motivo
                <input className="admin-modal__input" name="Motivo" value={form.Motivo} onChange={handleFormChange} placeholder="Ej. Evento corporativo" />
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label className="admin-modal__label" style={{ flex: 1 }}>
                  Desde
                  <CustomDatePicker
                    value={form.FechaInicio}
                    min={hoyStr}
                    onChange={(iso) => setForm((f) => ({
                      ...f,
                      FechaInicio: iso,
                      FechaFin: f.FechaFin && f.FechaFin < iso ? iso : f.FechaFin,
                    }))}
                  />
                </label>
                <label className="admin-modal__label" style={{ flex: 1 }}>
                  Hasta
                  <CustomDatePicker
                    value={form.FechaFin}
                    min={form.FechaInicio || hoyStr}
                    onChange={(iso) => setForm((f) => ({ ...f, FechaFin: iso }))}
                  />
                </label>
              </div>
              <label className="admin-check" style={{ marginTop: '0.2rem' }}>
                <input type="checkbox" name="todoElDia" checked={form.todoElDia} onChange={handleFormChange} />
                <span className="admin-check__box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10" /></svg>
                </span>
                <span className="admin-check__text">Todo el día</span>
              </label>
              {!form.todoElDia && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label className="admin-modal__label" style={{ flex: 1 }}>
                    Hora inicio
                    <CustomTimePicker
                      value={form.HoraInicio}
                      onChange={(hhmm) => setForm((f) => ({
                        ...f,
                        HoraInicio: hhmm,
                        HoraFin: f.HoraFin <= hhmm ? hhmm : f.HoraFin,
                      }))}
                    />
                  </label>
                  <label className="admin-modal__label" style={{ flex: 1 }}>
                    Hora fin
                    <CustomTimePicker
                      value={form.HoraFin}
                      min={form.HoraInicio}
                      onChange={(hhmm) => setForm((f) => ({ ...f, HoraFin: hhmm }))}
                    />
                  </label>
                </div>
              )}
              <label className="admin-modal__label">
                Piso a bloquear
                <div className="relative">
                  <select
                    name="PisoID"
                    value={form.PisoID}
                    onChange={handleFormChange}
                    className="w-full h-11 px-3 pr-8 rounded-lg bg-surface-badge font-mono text-[13px] text-white border-none outline-none cursor-pointer appearance-none [color-scheme:dark]"
                  >
                    {pisos.map((p) => (
                      <option key={p.PisoID} value={String(p.PisoID)}>
                        {p.Nombre}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">▾</span>
                </div>
              </label>
              <label className="admin-check" style={{ marginTop: '0.2rem' }}>
                <input type="checkbox" name="bloquearPisoCompleto" checked={form.bloquearPisoCompleto} onChange={handleFormChange} />
                <span className="admin-check__box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10" /></svg>
                </span>
                <span className="admin-check__text">Bloquear piso completo</span>
              </label>

              {!form.bloquearPisoCompleto && (
                <div className="admin-modal__label">
                  Espacios a bloquear {loadingEspacios && '(cargando…)'}
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid rgba(161,0,255,0.25)', borderRadius: '8px', padding: '0.6rem', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
                    {espaciosPiso.map((esp) => (
                      <label key={esp.EspacioID} className="admin-check">
                        <input type="checkbox" checked={form.EspacioIDs.includes(esp.EspacioID)} onChange={() => toggleEspacio(esp.EspacioID)} />
                        <span className="admin-check__box">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10" /></svg>
                        </span>
                        <span className="admin-check__text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{esp.Nombre}</span>
                      </label>
                    ))}
                    {!loadingEspacios && espaciosPiso.length === 0 && <span style={{ color: 'var(--admin-muted)', fontSize: '0.82rem' }}>Sin espacios</span>}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>{form.EspacioIDs.length} seleccionados</span>
                </div>
              )}

              {formError && <p className="admin-modal__error" style={{ color: '#ff3246', fontSize: '0.85rem' }}>{formError}</p>}
              <div className="admin-modal__actions">
                <button type="button" className="admin-btn-export" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="admin-btn-export admin-btn-export--primary" disabled={saving}>
                  {saving ? 'Creando…' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar Evento ── */}
      {eventoToDelete && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setEventoToDelete(null)}>
          <div className="admin-modal admin-modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Cancelar evento</h2>
              <button type="button" className="admin-modal__close" onClick={() => !deleting && setEventoToDelete(null)} disabled={deleting}>✕</button>
            </div>
            <div className="admin-confirm">
              <p className="admin-confirm__title">¿Cancelar este evento?</p>
              <p className="admin-confirm__body">
                Se liberarán los {eventoToDelete.EspaciosBloqueados ?? 0} espacio(s) que <strong>{eventoToDelete.Nombre}</strong> tenía bloqueados. El evento se conserva en el historial marcado como <strong>Cancelado</strong>.
              </p>
              {deleteError && <p className="admin-modal__error">{deleteError}</p>}
              <div className="admin-modal__actions">
                <button type="button" className="admin-btn-export" onClick={() => setEventoToDelete(null)} disabled={deleting}>Volver</button>
                <button type="button" className="admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Cancelando…' : 'Cancelar evento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

    </main>
  )
}

export default function AdminDashboardPage() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [roles, setRoles] = useState([])
  const { user } = useAuth()
  const { dashboard, loading, error } = useDashboard()

  useEffect(() => {
    getRoles().then((res) => setRoles(res.data || [])).catch(() => {})
  }, [])

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

  const navigate = useNavigate()
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand__topline">
            <span className="admin-brand__arrow">›</span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate('/')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              style={{ cursor: 'pointer' }}
              title="Volver al inicio"
            >accenture</span>
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
          <div className="admin-user__avatar">{user?.initials || '??'}</div>
          <div>
            <strong>{user?.name || 'Usuario'}</strong>
            <span>{
              roles.find((r) => Number(r.RolID) === Number(user?.rolId))?.Nombre || 'Administrador'
            }</span>
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
