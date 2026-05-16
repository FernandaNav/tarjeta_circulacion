import { useState } from 'react'
import Modal from './Modal'
import { tarjetasService } from '../services/api'
import { inputStyle, labelStyle, btnSecondary, btnDanger } from '../styles/form'
import { colors, radius } from '../styles/theme'

export default function DesactivarModal({ tarjeta, onClose, onSuccess }) {
  const [motivo, setMotivo]   = useState('')
  const [tipo, setTipo]       = useState('Desactivada por impago')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async () => {
    if (!motivo) { setError('Ingresá un motivo.'); return }
    setLoading(true); setError(null)
    try {
      await tarjetasService.updateEstado(tarjeta.num_tarjeta, { estado: tipo, motivo_desactivacion: motivo })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Desactivar tarjeta" onClose={onClose}>
      <div style={{
        background: colors.dangerBg, border: `1px solid ${colors.danger}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '12px', color: colors.danger, marginBottom: '4px', fontWeight: '600' }}>
          Estás por desactivar la siguiente tarjeta
        </p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>{tarjeta.num_tarjeta}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.propietario} — {tarjeta.placa}</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Tipo de desactivación *</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Desactivada por impago', 'Desactivada'].map(t => (
            <button key={t} onClick={() => setTipo(t)} style={{
              flex: 1, padding: '9px', borderRadius: radius.md,
              border: `1.5px solid ${tipo === t ? colors.danger : colors.border}`,
              background: tipo === t ? colors.dangerBg : 'transparent',
              color: tipo === t ? colors.danger : colors.textSub,
              cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              fontFamily: 'Inter, DM Sans, sans-serif', transition: 'all 0.15s'
            }}>
              {t === 'Desactivada por impago' ? '💳 Por impago' : '📅 Por vencimiento'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Observación *</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Describí el motivo..."
          value={motivo} onChange={e => setMotivo(e.target.value)}
        />
      </div>

      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={btnDanger} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Desactivando...' : 'Desactivar tarjeta'}
        </button>
      </div>
    </Modal>
  )
}