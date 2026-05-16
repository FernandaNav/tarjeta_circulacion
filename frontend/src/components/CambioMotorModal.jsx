import { useState } from 'react'
import Modal from './Modal'
import { vehiculosService } from '../services/api'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius } from '../styles/theme'

export default function CambioMotorModal({ tarjeta, onClose, onSuccess }) {
  const [numMotorNuevo, setNumMotorNuevo] = useState('')
  const [motivo, setMotivo]               = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)

  const handleSubmit = async () => {
    if (!numMotorNuevo || !motivo) { setError('Completá todos los campos.'); return }
    setLoading(true); setError(null)
    try {
      await vehiculosService.cambiarMotor(tarjeta.id_vehiculo, { num_motor_nuevo: numMotorNuevo, motivo })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Cambio de motor" onClose={onClose}>
      <div style={{
        background: colors.primaryLight, border: `1px solid ${colors.primary}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: colors.primary, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehículo</p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>{tarjeta.placa}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.marca} {tarjeta.linea} — {tarjeta.propietario}</p>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Número de motor nuevo *</label>
        <input style={inputStyle} placeholder="Ej: MOT-2025-XYZ" value={numMotorNuevo} onChange={e => setNumMotorNuevo(e.target.value)} />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Motivo *</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Ej: Motor dañado, reemplazo por garantía..."
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