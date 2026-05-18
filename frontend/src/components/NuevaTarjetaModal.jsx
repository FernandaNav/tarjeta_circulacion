import { useState, useEffect, useRef } from 'react'
import Modal from './Modal'
import { tarjetasService, vehiculosService, propietariosService } from '../services/api'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius, shadows } from '../styles/theme'

function SearchSelect({ label, placeholder, items, value, onSelect, renderLabel, renderSub }) {
  const [busqueda, setBusqueda] = useState('')
  const [open, setOpen]         = useState(false)
  const ref                     = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtrados = items.filter(i =>
    renderLabel(i).toLowerCase().includes(busqueda.toLowerCase()) ||
    (renderSub && renderSub(i).toLowerCase().includes(busqueda.toLowerCase()))
  )

  const seleccionado = items.find(i => String(i.id) === String(value))

  return (
    <div style={fieldStyle} ref={ref}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          style={{ ...inputStyle, cursor: 'pointer' }}
          placeholder={seleccionado ? renderLabel(seleccionado) : placeholder}
          value={open ? busqueda : (seleccionado ? renderLabel(seleccionado) : '')}
          onChange={e => { setBusqueda(e.target.value); setOpen(true) }}
          onFocus={() => { setBusqueda(''); setOpen(true) }}
        />
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: colors.bgCard, borderRadius: radius.md,
            boxShadow: shadows.dropdown, border: `1px solid ${colors.border}`,
            zIndex: 200, maxHeight: '200px', overflowY: 'auto', marginTop: '4px'
          }}>
            {filtrados.length === 0 && (
              <div style={{ padding: '12px 14px', fontSize: '12px', color: colors.textSub }}>
                No se encontraron resultados
              </div>
            )}
            {filtrados.map(item => (
              <div key={item.id}
                onClick={() => { onSelect(item.id); setBusqueda(''); setOpen(false) }}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  borderBottom: `1px solid ${colors.border}`,
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = colors.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = colors.bgCard}
              >
                <p style={{ fontSize: '13px', color: colors.textMain, fontWeight: '500', margin: 0 }}>{renderLabel(item)}</p>
                {renderSub && <p style={{ fontSize: '11px', color: colors.textSub, margin: '2px 0 0' }}>{renderSub(item)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NuevaTarjetaModal({ onClose, onSuccess }) {
  const [propietarios, setPropietarios] = useState([])
  const [vehiculos, setVehiculos]       = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const hoy = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    id_propietario: '', id_vehiculo: '',
    num_certificado_propiedad: '', fecha_emision: hoy, fecha_vencimiento: '',
  })

  useEffect(() => {
    propietariosService.getAll().then(r => setPropietarios(r.data))
    vehiculosService.getSinTarjeta().then(r => setVehiculos(r.data))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

 const validarCertificado = (c) => /^[A-Z0-9\-]{5,30}$/i.test(c)

  const handleSubmit = async () => {
    if (!form.id_propietario || !form.id_vehiculo || !form.num_certificado_propiedad || !form.fecha_emision || !form.fecha_vencimiento) {
      setError('Completa todos los campos obligatorios.'); return
    }
    if (!validarCertificado(form.num_certificado_propiedad)) {
      setError('Certificado inválido. Solo letras, números y guiones (mín. 5 caracteres).'); return
    }
    if (form.fecha_vencimiento <= hoy) {
      setError('La fecha de vencimiento debe ser futura.'); return
    }
    if (form.fecha_vencimiento <= form.fecha_emision) {
      setError('La fecha de vencimiento debe ser posterior a la de emisión.'); return
    }
    setLoading(true); setError(null)
    try {
      await tarjetasService.create(form)
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  const propietariosConId = propietarios.map(p => ({ ...p, id: p.id_propietario }))
  const vehiculosConId    = vehiculos.map(v => ({ ...v, id: v.id_vehiculo }))

  return (
    <Modal title="Nueva tarjeta de circulación" onClose={onClose}>

      <SearchSelect
        label="Propietario *"
        placeholder="Buscar por nombre o NIT..."
        items={propietariosConId}
        value={form.id_propietario}
        onSelect={id => setForm(f => ({ ...f, id_propietario: id }))}
        renderLabel={p => p.nombre_completo}
        renderSub={p => `NIT: ${p.nit} — CUI: ${p.cui}`}
      />

      <SearchSelect
        label="Vehículo *"
        placeholder="Buscar por placa o marca..."
        items={vehiculosConId}
        value={form.id_vehiculo}
        onSelect={id => setForm(f => ({ ...f, id_vehiculo: id }))}
        renderLabel={v => v.placa}
        renderSub={v => `${v.nombre_marca} ${v.nombre_linea} ${v.modelo_anio}`}
      />

      <div style={fieldStyle}>
        <label style={labelStyle}>Num. certificado de propiedad</label>
        <input style={inputStyle} name="num_certificado_propiedad" placeholder="CERT-2025-001" value={form.num_certificado_propiedad} onChange={handleChange} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Fecha de emisión *</label>
          <input style={inputStyle} type="date" name="fecha_emision" value={form.fecha_emision} onChange={handleChange} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Fecha de vencimiento *</label>
          <input
            style={inputStyle} type="date" name="fecha_vencimiento"
            value={form.fecha_vencimiento}
            min={form.fecha_emision || hoy}
            onChange={handleChange}
          />
        </div>
      </div>
      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Crear tarjeta'}
        </button>
      </div>
    </Modal>
  )
}