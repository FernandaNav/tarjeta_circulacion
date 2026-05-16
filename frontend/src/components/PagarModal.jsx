import { useState } from 'react'
import Modal from './Modal'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius } from '../styles/theme'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export default function PagarModal({ tarjeta, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [motivo, setMotivo]   = useState('')

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      await api.patch(`/tarjetas/${tarjeta.num_tarjeta}/pagar`, { motivo })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Registrar pago" onClose={onClose}>
      <div style={{
        background: colors.warningBg, border: `1px solid ${colors.warningDot}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: colors.warning, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tarjeta a reactivar</p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>{tarjeta.num_tarjeta}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.placa} — {tarjeta.propietario}</p>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Observación (opcional)</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Ej: Pago recibido en ventanilla..."
          value={motivo} onChange={e => setMotivo(e.target.value)}
        />
      </div>

      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar pago'}
        </button>
      </div>
    </Modal>
  )
}