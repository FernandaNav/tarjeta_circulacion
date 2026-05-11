import { useState, useEffect } from 'react'
import Modal from './Modal'
import { tarjetasService, propietariosService } from '../services/api'

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

export default function CambioPropietarioModal({ tarjeta, onClose, onSuccess }) {
  const [propietarios, setPropietarios] = useState([])
  const [idPropietarioNuevo, setIdPropietarioNuevo] = useState('')
  const [motivoCambio, setMotivoCambio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    propietariosService.getAll().then(r => setPropietarios(r.data))
  }, [])

  const handleSubmit = async () => {
    if (!idPropietarioNuevo || !motivoCambio) {
      setError('Completá todos los campos.')
      return
    }
    if (parseInt(idPropietarioNuevo) === tarjeta.id_propietario) {
      setError('El propietario nuevo debe ser diferente al actual.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await tarjetasService.cambiarPropietario(tarjeta.num_tarjeta, {
        id_propietario_nuevo: parseInt(idPropietarioNuevo),
        motivo_cambio: motivoCambio
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
    <Modal title="Cambio de propietario" onClose={onClose}>

      {/* INFO TARJETA */}
      <div style={{
        background: 'rgba(65,90,119,0.15)',
        border: '1px solid rgba(119,141,169,0.2)',
        borderRadius: '8px', padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: '#778DA9', marginBottom: '4px' }}>TARJETA</p>
        <p style={{ fontSize: '13px', color: '#9CADCE', fontFamily: 'monospace' }}>{tarjeta.num_tarjeta}</p>
        <p style={{ fontSize: '12px', color: '#778DA9' }}>{tarjeta.placa}</p>
      </div>

      {/* PROPIETARIO ACTUAL */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Propietario actual</label>
        <div style={{
          ...inputStyle,
          background: 'rgba(119,141,169,0.05)',
          color: '#778DA9'
        }}>
          {tarjeta.propietario}
        </div>
      </div>

      {/* PROPIETARIO NUEVO */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Nuevo propietario *</label>
        <select
          style={inputStyle}
          value={idPropietarioNuevo}
          onChange={e => setIdPropietarioNuevo(e.target.value)}
        >
          <option value="">Seleccioná el nuevo propietario</option>
          {propietarios
            .filter(p => p.id_propietario !== tarjeta.id_propietario)
            .map(p => (
              <option key={p.id_propietario} value={p.id_propietario}>
                {p.nombre_completo} — {p.nit}
              </option>
            ))}
        </select>
      </div>

      {/* MOTIVO */}
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Motivo del cambio *</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          placeholder="Ej: Venta del vehículo, herencia, donación..."
          value={motivoCambio}
          onChange={e => setMotivoCambio(e.target.value)}
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
          background: '#415A77', color: '#f0f2f5',
          cursor: 'pointer', fontSize: '13px', fontWeight: '500'
        }}>
          {loading ? 'Guardando...' : 'Confirmar cambio'}
        </button>
      </div>
    </Modal>
  )
}