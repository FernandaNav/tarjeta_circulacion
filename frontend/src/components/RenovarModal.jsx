import { useState } from 'react'
import Modal from './Modal'
import { tarjetasService } from '../services/api'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius } from '../styles/theme'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export default function RenovarModal({ tarjeta, onClose, onSuccess }) {
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleSubmit = async () => {
    if (!fechaVencimiento) { setError('Selecciona la nueva fecha de vencimiento.'); return }
    if (new Date(fechaVencimiento) <= new Date()) { setError('La fecha debe ser futura.'); return }
    setLoading(true); setError(null)
    try {
      await api.patch(`/tarjetas/${tarjeta.num_tarjeta}/renovar`, { fecha_vencimiento: fechaVencimiento })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Renovar tarjeta" onClose={onClose}>
      <div style={{
        background: colors.successBg, border: `1px solid ${colors.successDot}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: colors.success, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tarjeta a renovar</p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>{tarjeta.num_tarjeta}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.placa} — {tarjeta.propietario}</p>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Nueva fecha de vencimiento *</label>
        <input
          type="date" style={inputStyle}
          value={fechaVencimiento}
          onChange={e => setFechaVencimiento(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Renovando...' : 'Confirmar renovación'}
        </button>
      </div>
    </Modal>
  )
}