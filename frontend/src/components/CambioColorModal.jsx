import { useState, useEffect } from 'react'
import Modal from './Modal'
import { vehiculosService } from '../services/api'
import { inputStyle, labelStyle, fieldStyle, btnPrimary, btnSecondary } from '../styles/form'
import { colors, radius } from '../styles/theme'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })
const coloresOpciones = ['Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Café', 'Beige', 'Naranja', 'Morado']

export default function CambioColorModal({ tarjeta, onClose, onSuccess }) {
  const [coloresActuales, setColoresActuales] = useState([])
  const [colorAnterior, setColorAnterior]     = useState('')
  const [colorNuevo, setColorNuevo]           = useState('')
  const [esPrincipal, setEsPrincipal]         = useState(false)
  const [motivo, setMotivo]                   = useState('')
  const [loading, setLoading]                 = useState(false)
  const [loadingColores, setLoadingColores]   = useState(true)
  const [error, setError]                     = useState(null)

  useEffect(() => {
    api.get(`/vehiculos/${tarjeta.id_vehiculo}/colores`)
      .then(r => {
        setColoresActuales(r.data)
        // preseleccionar el color principal
        const principal = r.data.find(c => c.es_principal)
        if (principal) {
          setColorAnterior(principal.color)
          setEsPrincipal(true)
        }
      })
      .catch(() => setColoresActuales([]))
      .finally(() => setLoadingColores(false))
  }, [])

  const handleColorAnteriorChange = (color) => {
    setColorAnterior(color)
    const seleccionado = coloresActuales.find(c => c.color === color)
    setEsPrincipal(seleccionado?.es_principal || false)
  }

  const handleSubmit = async () => {
    if (!colorAnterior || !colorNuevo || !motivo) {
      setError('Completá todos los campos obligatorios.')
      return
    }
    if (colorAnterior === colorNuevo) {
      setError('El color nuevo debe ser diferente al anterior.')
      return
    }
    setLoading(true); setError(null)
    try {
      await vehiculosService.cambiarColor(tarjeta.id_vehiculo, {
        color_anterior: colorAnterior,
        color_nuevo: colorNuevo,
        es_principal: esPrincipal,
        motivo
      })
      onSuccess(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Cambio de color" onClose={onClose}>
      {/* INFO VEHÍCULO */}
      <div style={{
        background: colors.primaryLight, border: `1px solid ${colors.primary}33`,
        borderRadius: radius.md, padding: '12px 16px', marginBottom: '18px'
      }}>
        <p style={{ fontSize: '11px', color: colors.primary, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehículo</p>
        <p style={{ fontSize: '13px', color: colors.textMain, fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>{tarjeta.placa}</p>
        <p style={{ fontSize: '12px', color: colors.textSub }}>{tarjeta.marca} {tarjeta.linea} — {tarjeta.propietario}</p>
      </div>

      {loadingColores ? (
        <p style={{ color: colors.textSub, fontSize: '13px', marginBottom: '16px' }}>Cargando colores del vehículo...</p>
      ) : (
        <>
          {/* COLOR ANTERIOR */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Color a cambiar *</label>
            <select style={inputStyle} value={colorAnterior} onChange={e => handleColorAnteriorChange(e.target.value)}>
              <option value="" disabled>Selecciona el color actual</option>
              {coloresActuales.map(c => (
                <option key={c.color} value={c.color}>
                  {c.color}{c.es_principal ? ' (principal)' : ' (secundario)'}
                </option>
              ))}
            </select>
          </div>

          {/* COLOR NUEVO */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Color nuevo *</label>
            <select style={inputStyle} value={colorNuevo} onChange={e => setColorNuevo(e.target.value)}>
              <option value="" disabled>Selecciona el color nuevo</option>
              {coloresOpciones.filter(c => c !== colorAnterior).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* ES PRINCIPAL */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox" id="principal"
              checked={esPrincipal}
              onChange={e => setEsPrincipal(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: colors.primary }}
            />
            <label htmlFor="principal" style={{ fontSize: '13px', color: colors.textMain, cursor: 'pointer' }}>
              Es el color principal del vehículo
            </label>
          </div>

          {/* MOTIVO */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Motivo *</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              placeholder="Ej: Repintado por choque, cambio estético..."
              value={motivo} onChange={e => setMotivo(e.target.value)}
            />
          </div>
        </>
      )}

      {error && <p style={{ color: colors.danger, fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button style={btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={btnPrimary} onClick={handleSubmit} disabled={loading || loadingColores}>
          {loading ? 'Guardando...' : 'Confirmar cambio'}
        </button>
      </div>
    </Modal>
  )
}