import { useState, useEffect } from 'react'
import Modal from './Modal'
import { tarjetasService, vehiculosService, propietariosService } from '../services/api'

const inputStyle = {
  width: '100%', padding: '8px 12px',
  background: '#0D1B2A',
  border: '1px solid rgba(119,141,169,0.2)',
  borderRadius: '8px', color: '#E0E1DD',
  fontSize: '13px', outline: 'none',
  fontFamily: 'DM Sans, sans-serif'
}

const labelStyle = {
  display: 'block', fontSize: '11px',
  color: '#778DA9', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.5px'
}

const fieldStyle = { marginBottom: '14px' }

export default function NuevaTarjetaModal({ onClose, onSuccess }) {
  const [propietarios, setPropietarios] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    num_tarjeta: '',
    id_propietario: '',
    id_vehiculo: '',
    num_certificado_propiedad: '',
    fecha_emision: '',
    fecha_vencimiento: '',
  })

  useEffect(() => {
    propietariosService.getAll().then(r => setPropietarios(r.data))
    vehiculosService.getAll().then(r => setVehiculos(r.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.num_tarjeta || !form.id_propietario || !form.id_vehiculo || !form.fecha_emision || !form.fecha_vencimiento) {
      setError('Por favor completá todos los campos obligatorios.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await tarjetasService.create(form)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Nueva tarjeta de circulación" onClose={onClose}>

      <div style={fieldStyle}>
        <label style={labelStyle}>Número de tarjeta *</label>
        <input style={inputStyle} name="num_tarjeta" placeholder="TC-2025-0001" value={form.num_tarjeta} onChange={handleChange} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Propietario *</label>
        <select style={inputStyle} name="id_propietario" value={form.id_propietario} onChange={handleChange}>
          <option value="">Seleccioná un propietario</option>
          {propietarios.map(p => (
            <option key={p.id_propietario} value={p.id_propietario}>
              {p.nombre_completo} — {p.nit}
            </option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Vehículo *</label>
        <select style={inputStyle} name="id_vehiculo" value={form.id_vehiculo} onChange={handleChange}>
          <option value="">Seleccioná un vehículo</option>
          {vehiculos.map(v => (
            <option key={v.id_vehiculo} value={v.id_vehiculo}>
              {v.placa} — {v.nombre_marca} {v.nombre_linea} {v.modelo_anio}
            </option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Núm. certificado de propiedad</label>
        <input style={inputStyle} name="num_certificado_propiedad" placeholder="CERT-2025-001" value={form.num_certificado_propiedad} onChange={handleChange} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Fecha de emisión *</label>
          <input style={inputStyle} type="date" name="fecha_emision" value={form.fecha_emision} onChange={handleChange} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Fecha de vencimiento *</label>
          <input style={inputStyle} type="date" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} />
        </div>
      </div>

      {error && (
        <p style={{ color: '#E05C5C', fontSize: '12px', marginBottom: '12px' }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button onClick={onClose} style={{
          padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(119,141,169,0.2)',
          background: 'transparent', color: '#778DA9', cursor: 'pointer', fontSize: '13px'
        }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#415A77', color: '#f0f2f5', cursor: 'pointer',
          fontSize: '13px', fontWeight: '500'
        }}>
          {loading ? 'Guardando...' : 'Crear tarjeta'}
        </button>
      </div>
    </Modal>
  )
}