import { useState } from 'react'
import Modal from './Modal'
import { vehiculosService } from '../services/api'

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

export default function CambioMotorModal({ tarjeta, onClose, onSuccess }) {
  const [numMotorNuevo, setNumMotorNuevo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!numMotorNuevo || !motivo) {
      setError('Completá todos los campos.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await vehiculosService.cambiarMotor(tarjeta.id_vehiculo, {
        num_motor_nuevo: numMotorNuevo,
        motivo
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Cambio de motor" onClose={onClose}>

      <div style={{
        background: 'rgba(65,90,119,0.15)',
        border: '1px solid rgba(119,141,169,0.2)',
        borderRadius: '8px', padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: '#778DA9', marginBottom: '4px' }}>VEHÍCULO</p>
        <p style={{ fontSize: '13px', color: '#9CADCE', fontFamily: 'monospace' }}>{tarjeta.placa}</p>
        <p style={{ fontSize: '12px', color: '#778DA9' }}>{tarjeta.marca} {tarjeta.linea} — {tarjeta.propietario}</p>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Número de motor nuevo *</label>
        <input
          style={inputStyle}
          placeholder="Ej: MOT-2025-XYZ"
          value={numMotorNuevo}
          onChange={e => setNumMotorNuevo(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Motivo *</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Ej: Motor dañado, reemplazo por garantía..."
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
        />
      </div>

      {error && <p style={{ color: '#E05C5C', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          padding: '8px 16px', borderRadius: '8px',
          border: '1px solid rgba(119,141,169,0.2)',
          background: 'transparent', color: '#778DA9',
          cursor: 'pointer', fontSize: '13px'
        }}>Cancelar</button>
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#415A77', color: '#f0f2f5',
          cursor: 'pointer', fontSize: '13px', fontWeight: '500'
        }}>
          {loading ? 'Guardando...' : 'Confirmar cambio'}
        </button>
      </div>
    </Modal>
  )
}