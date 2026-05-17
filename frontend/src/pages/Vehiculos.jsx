import { useEffect, useState } from 'react'
import { vehiculosService } from '../services/api'
import { colors, shadows, radius } from '../styles/theme'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import Modal from '../components/Modal'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })
const coloresOpciones = ['Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Café', 'Beige', 'Naranja', 'Morado']

export default function Vehiculos() {
  const [vehiculos, setVehiculos]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [showNuevo, setShowNuevo]     = useState(false)
  const [showEditar, setShowEditar]   = useState(false)
  const [vehiculoSel, setVehiculoSel] = useState(null)
  const [error, setError]             = useState(null)
  const [loadingForm, setLoadingForm] = useState(false)
  const [marcas, setMarcas]           = useState([])
  const [lineas, setLineas]           = useState([])
  const [lineasFiltradas, setLineasFiltradas] = useState([])
  const [tiposVehiculo, setTiposVehiculo]     = useState([])
  const [tiposUso, setTiposUso]               = useState([])

  const formVacio = {
    placa: '', vin: '', num_chasis: '', num_serie: '',
    num_motor: '', modelo_anio: '',
    id_marca: '', id_linea: '', id_tipo_vehiculo: '', id_tipo_uso: ''
  }
  const [form, setForm] = useState(formVacio)
  const [colores, setColores] = useState([{ color: '', es_principal: true }])

  const cargar = () => {
    setLoading(true)
    vehiculosService.getAll()
      .then(r => setVehiculos(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
    api.get('/marcas').then(r => setMarcas(r.data))
    api.get('/lineas').then(r => setLineas(r.data))
    api.get('/tipos-vehiculo').then(r => setTiposVehiculo(r.data))
    api.get('/tipos-uso').then(r => setTiposUso(r.data))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'id_marca') {
      setLineasFiltradas(lineas.filter(l => l.id_marca === parseInt(value)))
      setForm(f => ({ ...f, id_marca: value, id_linea: '' }))
    }
  }

  const abrirEditar = (v) => {
    setVehiculoSel(v)
    const marcaLinea = lineas.find(l => l.nombre_linea === v.nombre_linea)
    const idMarca = marcaLinea?.id_marca || ''
    setLineasFiltradas(lineas.filter(l => l.id_marca === idMarca))
    setForm({
      placa: v.placa, vin: v.vin || '',
      num_chasis: v.num_chasis || '', num_serie: v.num_serie || '',
      num_motor: v.num_motor || '', modelo_anio: v.modelo_anio || '',
      id_marca: idMarca, id_linea: marcaLinea?.id_linea || '',
      id_tipo_vehiculo: tiposVehiculo.find(t => t.descripcion === v.tipo_vehiculo)?.id_tipo_vehiculo || '',
      id_tipo_uso: tiposUso.find(t => t.descripcion === v.tipo_uso)?.id_tipo_uso || ''
    })
    setShowEditar(true)
  }

  const handleColorChange = (i, field, value) => {
    const nuevos = [...colores]
    nuevos[i][field] = value
    if (field === 'es_principal' && value === true) {
      nuevos.forEach((c, idx) => { if (idx !== i) c.es_principal = false })
    }
    setColores(nuevos)
  }

  const agregarColor  = () => setColores([...colores, { color: '', es_principal: false }])
  const quitarColor   = (i) => setColores(colores.filter((_, idx) => idx !== i))

  const handleSubmitNuevo = async () => {
    if (!form.placa || !form.num_motor || !form.modelo_anio || !form.id_linea || !form.id_tipo_vehiculo || !form.id_tipo_uso) {
      setError('Completa los campos obligatorios.'); return
    }
    if (colores.some(c => !c.color)) {
      setError('Completa todos los colores o elimina los vacíos.'); return
    }
    setLoadingForm(true); setError(null)
    try {
      await vehiculosService.create({
        placa: form.placa, vin: form.vin || null,
        num_chasis: form.num_chasis || null, num_serie: form.num_serie || null,
        num_motor: form.num_motor, modelo_anio: parseInt(form.modelo_anio),
        id_linea: parseInt(form.id_linea),
        id_tipo_vehiculo: parseInt(form.id_tipo_vehiculo),
        id_tipo_uso: parseInt(form.id_tipo_uso),
        colores
      })
      cargar(); setShowNuevo(false)
      setForm(formVacio); setColores([{ color: '', es_principal: true }])
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoadingForm(false) }
  }

  const handleSubmitEditar = async () => {
    if (!form.placa || !form.modelo_anio || !form.id_linea || !form.id_tipo_vehiculo || !form.id_tipo_uso) {
      setError('Completa los campos obligatorios.'); return
    }
    setLoadingForm(true); setError(null)
    try {
      await api.patch(`/vehiculos/${vehiculoSel.id_vehiculo}`, {
        placa: form.placa, vin: form.vin || null,
        num_chasis: form.num_chasis || null, num_serie: form.num_serie || null,
        modelo_anio: parseInt(form.modelo_anio),
        id_linea: parseInt(form.id_linea),
        id_tipo_vehiculo: parseInt(form.id_tipo_vehiculo),
        id_tipo_uso: parseInt(form.id_tipo_uso)
      })
      cargar(); setShowEditar(false); setVehiculoSel(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoadingForm(false) }
  }

  const filtrados = vehiculos.filter(v =>
    v.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.nombre_marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.nombre_linea?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const camposBase = (esEditar) => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Placa *</label>
          <input style={inputStyle} name="placa" placeholder="P-123ABC" value={form.placa} onChange={handleChange} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Año del modelo *</label>
          <input style={inputStyle} name="modelo_anio" placeholder="2023" type="number" value={form.modelo_anio} onChange={handleChange} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Marca *</label>
          <select style={inputStyle} name="id_marca" value={form.id_marca} onChange={handleChange}>
            <option value="" disabled>Seleccionar</option>
            {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Línea *</label>
          <select style={inputStyle} name="id_linea" value={form.id_linea} onChange={handleChange} disabled={!form.id_marca}>
            <option value="" disabled>Seleccionar</option>
            {lineasFiltradas.map(l => <option key={l.id_linea} value={l.id_linea}>{l.nombre_linea}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tipo de vehículo *</label>
          <select style={inputStyle} name="id_tipo_vehiculo" value={form.id_tipo_vehiculo} onChange={handleChange}>
            <option value="" disabled>Seleccionar</option>
            {tiposVehiculo.map(t => <option key={t.id_tipo_vehiculo} value={t.id_tipo_vehiculo}>{t.descripcion}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tipo de uso *</label>
          <select style={inputStyle} name="id_tipo_uso" value={form.id_tipo_uso} onChange={handleChange}>
            <option value="" disabled>Seleccionar</option>
            {tiposUso.map(t => <option key={t.id_tipo_uso} value={t.id_tipo_uso}>{t.descripcion}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>VIN</label>
          <input style={inputStyle} name="vin" placeholder="17 caracteres" value={form.vin} onChange={handleChange} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Num. chasis</label>
          <input style={inputStyle} name="num_chasis" placeholder="CH-001" value={form.num_chasis} onChange={handleChange} />
        </div>
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Num. serie</label>
        <input style={inputStyle} name="num_serie" placeholder="SR-001" value={form.num_serie} onChange={handleChange} />
      </div>
      {!esEditar && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Numero de motor *</label>
            <input style={inputStyle} name="num_motor" placeholder="MOT-2023-XYZ" value={form.num_motor} onChange={handleChange} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>Colores del vehículo</label>
              <button onClick={agregarColor} style={{
                background: colors.primaryLight, border: 'none', color: colors.primary,
                borderRadius: radius.sm, padding: '3px 10px', fontSize: '12px',
                cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '600'
              }}>+ Agregar</button>
            </div>
            {colores.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <select style={{ ...inputStyle, flex: 1 }} value={c.color} onChange={e => handleColorChange(i, 'color', e.target.value)}>
                  <option value="" disabled>Color</option>
                  {coloresOpciones.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.textSub, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={c.es_principal} onChange={e => handleColorChange(i, 'es_principal', e.target.checked)} style={{ accentColor: colors.primary }} />
                  Principal
                </label>
                {colores.length > 1 && (
                  <button onClick={() => quitarColor(i)} style={{
                    background: colors.dangerBg, border: 'none', color: colors.danger,
                    borderRadius: radius.sm, width: '28px', height: '28px',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '700'
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {esEditar && (
        <div style={{
          background: colors.warningBg, border: `1px solid ${colors.warningDot}33`,
          borderRadius: radius.md, padding: '10px 14px', marginBottom: '12px'
        }}>
          <p style={{ fontSize: '12px', color: colors.warning }}>
            Para cambiar el motor o los colores usa los trámites correspondientes desde la pestaña de Tarjetas.
          </p>
        </div>
      )}
      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
    </>
  )

  return (
    <div style={{ padding: '28px 32px', background: colors.bgMain, minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.textMain, marginBottom: '4px', fontFamily: "'Poppins', sans-serif" }}>Vehículos</h1>
          <p style={{ fontSize: '13px', color: colors.textSub }}>{filtrados.length} vehículo{filtrados.length !== 1 ? 's' : ''} registrado{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setForm(formVacio); setColores([{ color: '', es_principal: true }]); setShowNuevo(true) }}
          style={{ ...btnPrimary, boxShadow: shadows.button }}
          onMouseEnter={e => { e.currentTarget.style.background = colors.primaryHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          + Nuevo vehículo
        </button>
      </div>

      {/* BÚSQUEDA */}
      <div style={{
        background: colors.bgCard, borderRadius: radius.lg,
        padding: '12px 16px', marginBottom: '16px',
        boxShadow: shadows.card, display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span style={{ color: colors.textSub, fontSize: '14px' }}>⌕</span>
        <input
          type="text" placeholder="Buscar por placa, marca o línea..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: colors.textMain, width: '100%', fontFamily: "'Poppins', sans-serif" }}
        />
      </div>

      {/* TABLA */}
      {loading && <p style={{ color: colors.textSub }}>Cargando...</p>}
      {!loading && (
        <div style={{ background: colors.bgCard, borderRadius: radius.lg, boxShadow: shadows.card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: colors.bgHover }}>
                {['Placa', 'Marca / Línea', 'Año', 'Tipo', 'Uso', 'VIN', 'Num. motor', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'center', padding: '12px 16px',
                    fontSize: '11px', color: colors.textSub,
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    fontWeight: '600', borderBottom: `1px solid ${colors.border}`
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((v, i) => (
                <tr key={i}
                  style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = colors.bgCard}
                >
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: colors.primaryLight, color: colors.primary, padding: '4px 10px', borderRadius: radius.sm, fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                      {v.placa}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '500', color: colors.textMain }}>{v.nombre_marca} {v.nombre_linea}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{v.modelo_anio}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{v.tipo_vehiculo}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{v.tipo_uso}</td>
                  <td style={{ padding: '13px 16px', fontSize: '11px', fontFamily: "'Poppins', sans-serif", color: colors.textSub }}>{v.vin || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: '11px', fontFamily: "'Poppins', sans-serif", color: colors.textSub }}>{v.num_motor || '—'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      onClick={() => abrirEditar(v)}
                      style={{
                        background: colors.primaryLight, border: 'none',
                        color: colors.primary, borderRadius: radius.sm,
                        padding: '5px 12px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600',
                        fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.background = colors.primaryLight; e.currentTarget.style.color = colors.primary }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: colors.textSub, fontSize: '13px' }}>
                    No se encontraron vehículos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL NUEVO */}
      {showNuevo && (
        <Modal title="Nuevo vehículo" onClose={() => { setShowNuevo(false); setError(null) }}>
          {camposBase(false)}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button style={btnSecondary} onClick={() => { setShowNuevo(false); setError(null) }}>Cancelar</button>
            <button style={btnPrimary} onClick={handleSubmitNuevo} disabled={loadingForm}>
              {loadingForm ? 'Guardando...' : 'Crear vehículo'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL EDITAR */}
      {showEditar && vehiculoSel && (
        <Modal title={`Editar — ${vehiculoSel.placa}`} onClose={() => { setShowEditar(false); setError(null) }}>
          {camposBase(true)}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button style={btnSecondary} onClick={() => { setShowEditar(false); setError(null) }}>Cancelar</button>
            <button style={btnPrimary} onClick={handleSubmitEditar} disabled={loadingForm}>
              {loadingForm ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}