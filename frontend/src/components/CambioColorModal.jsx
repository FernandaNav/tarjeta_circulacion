import { useState } from 'react'
import Modal from './Modal'
import { vehiculosService } from '../services/api'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius } from '../styles/theme'

const colores = ['Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Café', 'Beige', 'Naranja', 'Morado']

export default function CambioColorModal({ tarjeta, onClose, onSuccess }) {
  const [colorAnterior, setColorAnterior] = useState('')
  const [colorNuevo, setColorNuevo]       = useState('')
  const [esPrincipal, setEsPrincipal]     = useState(false)
  const [motivo, setMotivo]               = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)

  const handleSubmit = async () => {
    if (!colorNuevo || !motivo) { setError('Completá todos los campos obligatorios.'); return }
    setLoading(true); setError(null)
    try {
      await vehiculosService.cambiarColor(tarjeta.id_vehiculo, {
        color_anterior: colorAnterior || null, color_nuevo: colorNuevo, es_principal: esPrincipal, motivo
      })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Cambio de color" onClose={onClose}>
      <div style={{
        background: colors.primaryLight, border: `1px solid ${colors.primary}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: colors.primary, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehículo</p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: 'monospace', fontWeight: '600' }}>{tarjeta.placa}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.marca} {tarjeta.linea} — {tarjeta.propietario}</p>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Color anterior (si aplica)</label>
        <select style={inputStyle} value={colorAnterior} onChange={e => setColorAnterior(e.target.value)}>
          <option value="">Ninguno / Es color nuevo</option>
          {colores.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Color nuevo *</label>
        <select style={inputStyle} value={colorNuevo} onChange={e => setColorNuevo(e.target.value)}>
          <option value="">Seleccioná un color</option>
          {colores.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="checkbox" id="principal" checked={esPrincipal} onChange={e => setEsPrincipal(e.target.checked)} style={{ cursor: 'pointer', accentColor: colors.primary }} />
        <label htmlFor="principal" style={{ fontSize: '13px', color: colors.textMain, cursor: 'pointer' }}>Es el color principal del vehículo</label>
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Motivo *</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Ej: Repintado por choque, cambio estético..."
          value={motivo} onChange={e => setMotivo(e.target.value)}
        />
      </div>

      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Confirmar cambio'}
        </button>
      </div>
    </Modal>
  )
}