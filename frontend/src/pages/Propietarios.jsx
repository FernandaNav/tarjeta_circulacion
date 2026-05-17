import { useEffect, useState } from 'react'
import { propietariosService } from '../services/api'
import { colors, shadows, radius } from '../styles/theme'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import Modal from '../components/Modal'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export default function Propietarios() {
  const [propietarios, setPropietarios]           = useState([])
  const [loading, setLoading]                     = useState(true)
  const [busqueda, setBusqueda]                   = useState('')
  const [showNuevo, setShowNuevo]                 = useState(false)
  const [showEditar, setShowEditar]               = useState(false)
  const [propSeleccionado, setPropSeleccionado]   = useState(null)
  const [departamentos, setDepartamentos]         = useState([])
  const [municipios, setMunicipios]               = useState([])
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([])
  const [error, setError]                         = useState(null)
  const [loadingForm, setLoadingForm]             = useState(false)

  const formVacio = { nombres: '', apellidos: '', nit: '', cui: '', direccion: '', telefono: '', id_departamento: '', id_municipio: '' }
  const [form, setForm] = useState(formVacio)

  const cargar = () => {
    setLoading(true)
    propietariosService.getAll()
      .then(r => setPropietarios(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
    api.get('/departamentos').then(r => setDepartamentos(r.data))
    api.get('/municipios').then(r => setMunicipios(r.data))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'id_departamento') {
      setMunicipiosFiltrados(municipios.filter(m => m.id_departamento === parseInt(value)))
      setForm(f => ({ ...f, id_departamento: value, id_municipio: '' }))
    }
  }

  const abrirEditar = (p) => {
    setPropSeleccionado(p)
    setMunicipiosFiltrados(municipios.filter(m => m.id_departamento === parseInt(p.id_departamento)))
    setForm({
      nombres: p.nombres, apellidos: p.apellidos,
      nit: p.nit, cui: p.cui,
      direccion: p.direccion || '', telefono: p.telefono || '',
      id_departamento: p.id_departamento || '', id_municipio: p.id_municipio || ''
    })
    setShowEditar(true)
  }

  const handleSubmitNuevo = async () => {
    if (!form.nombres || !form.apellidos || !form.nit || !form.cui || !form.id_municipio) {
      setError('Completa los campos obligatorios.'); return
    }
    setLoadingForm(true); setError(null)
    try {
      await propietariosService.create({
        nombres: form.nombres, apellidos: form.apellidos,
        nit: form.nit, cui: form.cui,
        direccion: form.direccion, telefono: form.telefono,
        id_municipio: parseInt(form.id_municipio)
      })
      cargar(); setShowNuevo(false); setForm(formVacio)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoadingForm(false) }
  }

  const handleSubmitEditar = async () => {
    if (!form.nombres || !form.apellidos || !form.nit || !form.cui || !form.id_municipio) {
      setError('Completa los campos obligatorios.'); return
    }
    setLoadingForm(true); setError(null)
    try {
      await api.patch(`/propietarios/${propSeleccionado.id_propietario}`, {
        nombres: form.nombres, apellidos: form.apellidos,
        nit: form.nit, cui: form.cui,
        direccion: form.direccion, telefono: form.telefono,
        id_municipio: parseInt(form.id_municipio)
      })
      cargar(); setShowEditar(false); setPropSeleccionado(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoadingForm(false) }
  }

  const filtrados = propietarios.filter(p =>
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nit?.includes(busqueda) ||
    p.cui?.includes(busqueda)
  )

  const formPropietario = (esEditar) => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Nombres *</label>
          <input style={inputStyle} name="nombres" placeholder="Ej: Ana Lucía" value={form.nombres} onChange={handleChange} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Apellidos *</label>
          <input style={inputStyle} name="apellidos" placeholder="Ej: Fuentes Morales" value={form.apellidos} onChange={handleChange} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>NIT *</label>
          <input style={inputStyle} name="nit" placeholder="1234567-8" value={form.nit} onChange={handleChange} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>CUI *</label>
          <input style={inputStyle} name="cui" placeholder="2345 12345 0101" value={form.cui} onChange={handleChange} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Departamento *</label>
          <select style={inputStyle} name="id_departamento" value={form.id_departamento} onChange={handleChange}>
            <option value="" disabled>Seleccionar</option>
            {departamentos.map(d => <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Municipio *</label>
          <select style={inputStyle} name="id_municipio" value={form.id_municipio} onChange={handleChange} disabled={!form.id_departamento}>
            <option value="" disabled>Seleccionar</option>
            {municipiosFiltrados.map(m => <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>)}
          </select>
        </div>
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Dirección</label>
        <input style={inputStyle} name="direccion" placeholder="Ej: 5a Avenida 10-20 Zona 1" value={form.direccion} onChange={handleChange} />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Teléfono</label>
        <input style={inputStyle} name="telefono" placeholder="55551234" value={form.telefono} onChange={handleChange} />
      </div>
      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
    </>
  )

  return (
    <div style={{ padding: '28px 32px', background: colors.bgMain, minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.textMain, marginBottom: '4px', fontFamily: "'Poppins', sans-serif" }}>Propietarios</h1>
          <p style={{ fontSize: '13px', color: colors.textSub }}>{filtrados.length} propietario{filtrados.length !== 1 ? 's' : ''} registrado{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setForm(formVacio); setShowNuevo(true) }}
          style={{ ...btnPrimary, boxShadow: shadows.button }}
          onMouseEnter={e => { e.currentTarget.style.background = colors.primaryHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          + Nuevo propietario
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
          type="text" placeholder="Buscar por nombre, NIT o CUI..."
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
                {['Nombre completo', 'NIT', 'CUI', 'Teléfono', 'Municipio', 'Departamento', ''].map(h => (
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
              {filtrados.map((p, i) => (
                <tr key={i}
                  style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = colors.bgCard}
                >
                  <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '600', color: colors.textMain }}>{p.nombre_completo}</td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', fontFamily: "'Poppins', sans-serif", color: colors.primary }}>{p.nit}</td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', fontFamily: "'Poppins', sans-serif", color: colors.textSub }}>{p.cui}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{p.telefono || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{p.municipio}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{p.departamento}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      onClick={() => abrirEditar(p)}
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
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: colors.textSub, fontSize: '13px' }}>
                    No se encontraron propietarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL NUEVO */}
      {showNuevo && (
        <Modal title="Nuevo propietario" onClose={() => { setShowNuevo(false); setError(null) }}>
          {formPropietario(false)}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button style={btnSecondary} onClick={() => { setShowNuevo(false); setError(null) }}>Cancelar</button>
            <button style={btnPrimary} onClick={handleSubmitNuevo} disabled={loadingForm}>
              {loadingForm ? 'Guardando...' : 'Crear propietario'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL EDITAR */}
      {showEditar && propSeleccionado && (
        <Modal title={`Editar — ${propSeleccionado.nombre_completo}`} onClose={() => { setShowEditar(false); setError(null) }}>
          {formPropietario(true)}
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