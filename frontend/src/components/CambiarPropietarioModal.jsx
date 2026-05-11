import { useState, useEffect } from 'react'
import Modal from './Modal'
import { tarjetasService, propietariosService } from '../services/api'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius } from '../styles/theme'

export default function CambioPropietarioModal({ tarjeta, onClose, onSuccess }) {
  const [propietarios, setPropietarios]         = useState([])
  const [idPropietarioNuevo, setIdPropietarioNuevo] = useState('')
  const [motivoCambio, setMotivoCambio]         = useState('')
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState(null)

  useEffect(() => { propietariosService.getAll().then(r => setPropietarios(r.data)) }, [])

  const handleSubmit = async () => {
    if (!idPropietarioNuevo || !motivoCambio) { setError('Completá todos los campos.'); return }
    setLoading(true); setError(null)
    try {
      await tarjetasService.cambiarPropietario(tarjeta.num_tarjeta, {
        id_propietario_nuevo: parseInt(idPropietarioNuevo), motivo_cambio: motivoCambio
      })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Cambio de propietario" onClose={onClose}>
      <div style={{
        background: colors.primaryLight, border: `1px solid ${colors.primary}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: colors.primary, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tarjeta</p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: 'monospace', fontWeight: '600' }}>{tarjeta.num_tarjeta}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.placa}</p>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Propietario actual</label>
        <div style={{ ...inputStyle, background: colors.bgHover, color: colors.textSub }}>{tarjeta.propietario}</div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Nuevo propietario *</label>
        <select style={inputStyle} value={idPropietarioNuevo} onChange={e => setIdPropietarioNuevo(e.target.value)}>
          <option value="">Seleccioná el nuevo propietario</option>
          {propietarios.filter(p => p.id_propietario !== tarjeta.id_propietario).map(p => (
            <option key={p.id_propietario} value={p.id_propietario}>{p.nombre_completo} — {p.nit}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Motivo del cambio *</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Ej: Venta del vehículo, herencia..."
          value={motivoCambio} onChange={e => setMotivoCambio(e.target.value)}
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