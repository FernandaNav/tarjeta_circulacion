import { useState } from 'react'
import Modal from './Modal'
import { tarjetasService } from '../services/api'

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

export default function DesactivarModal({ tarjeta, onClose, onSuccess }) {
  const [motivo, setMotivo] = useState('')
  const [tipo, setTipo] = useState('Desactivada por impago')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!motivo) {
      setError('Ingresá un motivo de desactivación.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await tarjetasService.updateEstado(tarjeta.num_tarjeta, {
        estado: tipo,
        motivo_desactivacion: motivo
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
    <Modal title="Desactivar tarjeta" onClose={onClose}>

      {/* INFO TARJETA */}
      <div style={{
        background: 'rgba(224,92,92,0.08)',
        border: '1px solid rgba(224,92,92,0.2)',
        borderRadius: '8px', padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '12px', color: '#E05C5C', marginBottom: '4px', fontWeight: '500' }}>
          ⚠ Estás por desactivar la siguiente tarjeta
        </p>
        <p style={{ fontSize: '13px', color: '#E0E1DD', fontFamily: 'monospace' }}>{tarjeta.num_tarjeta}</p>
        <p style={{ fontSize: '12px', color: '#778DA9' }}>{tarjeta.propietario} — {tarjeta.placa}</p>
      </div>

      {/* TIPO DE DESACTIVACIÓN */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Motivo de desactivación *</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Desactivada por impago', 'Desactivada'].map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px',
                border: '1px solid',
                borderColor: tipo === t ? '#E05C5C' : 'rgba(119,141,169,0.2)',
                background: tipo === t ? 'rgba(224,92,92,0.1)' : 'transparent',
                color: tipo === t ? '#E05C5C' : '#778DA9',
                cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                fontFamily: 'DM Sans, sans-serif'
              }}
            >
              {t === 'Desactivada por impago' ? '💳 Por impago' : '📅 Por vencimiento'}
            </button>
          ))}
        </div>
      </div>

      {/* OBSERVACIÓN */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Observación *</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Describí el motivo de la desactivación..."
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
        />
      </div>

      {error && (
        <p style={{ color: '#E05C5C', fontSize: '12px', marginBottom: '12px' }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          padding: '8px 16px', borderRadius: '8px',
          border: '1px solid rgba(119,141,169,0.2)',
          background: 'transparent', color: '#778DA9',
          cursor: 'pointer', fontSize: '13px'
        }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={loading} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: 'rgba(224,92,92,0.8)', color: '#f0f2f5',
          cursor: 'pointer', fontSize: '13px', fontWeight: '500'
        }}>
          {loading ? 'Desactivando...' : 'Desactivar tarjeta'}
        </button>
      </div>
    </Modal>
  )
}