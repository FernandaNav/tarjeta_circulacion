import { useEffect, useState } from 'react'
import { tarjetasService } from '../services/api'
import NuevaTarjetaModal from '../components/NuevaTarjetaModal'
import DesactivarModal from '../components/DesactivarModal'
import CambiarPropietarioModal from '../components/CambiarPropietarioModal'
import CambioMotorModal from '../components/CambioMotorModal'
import CambioColorModal from '../components/CambioColorModal'
import DetalleTarjetaPanel from '../components/DetalleTarjetaPanel'

const estadoColor = {
  'Activa':                 { bg: 'rgba(76,175,125,0.12)',  color: '#4CAF7D' },
  'Vencida':                { bg: 'rgba(224,92,92,0.12)',   color: '#E05C5C' },
  'Desactivada':            { bg: 'rgba(224,92,92,0.12)',   color: '#E05C5C' },
  'Desactivada por impago': { bg: 'rgba(224,92,92,0.12)',   color: '#E05C5C' },
  'Por vencer':             { bg: 'rgba(232,168,56,0.12)',  color: '#E8A838' },
}

export default function Tarjetas() {
  const [tarjetas, setTarjetas]                       = useState([])
  const [loading, setLoading]                         = useState(true)
  const [error, setError]                             = useState(null)
  const [busqueda, setBusqueda]                       = useState('')
  const [filtroEstado, setFiltroEstado]               = useState('todos')
  const [showNueva, setShowNueva]                     = useState(false)
  const [showDesactivar, setShowDesactivar]           = useState(false)
  const [showCambioProp, setShowCambioProp]           = useState(false)
  const [showCambioMotor, setShowCambioMotor]         = useState(false)
  const [showCambioColor, setShowCambioColor]         = useState(false)
  const [showDetalle, setShowDetalle]                 = useState(false)
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null)

  const cargarTarjetas = () => {
    setLoading(true)
    tarjetasService.getAll()
      .then(res => setTarjetas(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarTarjetas() }, [])

  const filtradas = tarjetas.filter(t => {
    const matchEstado = filtroEstado === 'todos' || t.estado === filtroEstado
    const matchBusqueda =
      t.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.propietario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.num_tarjeta?.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  const fecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '-'

  const abrirModal = (modal, tarjeta, e) => {
    e.stopPropagation()
    setTarjetaSeleccionada(tarjeta)
    if (modal === 'desactivar')   setShowDesactivar(true)
    if (modal === 'propietario')  setShowCambioProp(true)
    if (modal === 'motor')        setShowCambioMotor(true)
    if (modal === 'color')        setShowCambioColor(true)
  }

  const cerrarModales = () => {
    setShowDesactivar(false)
    setShowCambioProp(false)
    setShowCambioMotor(false)
    setShowCambioColor(false)
    setTarjetaSeleccionada(null)
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#f0f2f5' }}>
          Tarjetas de circulación
        </h1>
        <button onClick={() => setShowNueva(true)} style={{
          background: '#415A77', border: 'none', color: '#f0f2f5',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '13px', fontWeight: '500'
        }}>
          + Nueva tarjeta
        </button>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar placa, propietario..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            background: '#1B2637', border: '1px solid rgba(119,141,169,0.2)',
            borderRadius: '8px', padding: '7px 12px', color: '#E0E1DD',
            fontSize: '13px', outline: 'none', width: '240px'
          }}
        />
        {['todos', 'Activa', 'Vencida', 'Desactivada', 'Desactivada por impago'].map(f => (
          <button key={f} onClick={() => setFiltroEstado(f)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
            fontWeight: '500', cursor: 'pointer', border: '1px solid',
            borderColor: filtroEstado === f ? '#415A77' : 'rgba(119,141,169,0.2)',
            background: filtroEstado === f ? '#415A77' : 'transparent',
            color: filtroEstado === f ? '#f0f2f5' : '#778DA9',
            transition: 'all 0.2s'
          }}>
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* TABLA */}
      {loading && <p style={{ color: '#778DA9' }}>Cargando...</p>}
      {error && <p style={{ color: '#E05C5C' }}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{
          background: '#1B2637',
          border: '1px solid rgba(119,141,169,0.12)',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(8,17,26,0.3)' }}>
                {['Num. tarjeta', 'Placa', 'Propietario', 'Marca / Línea', 'Emisión', 'Vencimiento', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 16px',
                    fontSize: '10px', color: '#778DA9',
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    fontWeight: '500', borderBottom: '1px solid rgba(119,141,169,0.08)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((t, i) => {
                const est = estadoColor[t.estado] || estadoColor['Activa']
                return (
                  <tr key={i}
                    style={{ borderBottom: '1px solid rgba(119,141,169,0.06)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(65,90,119,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => { setTarjetaSeleccionada(t); setShowDetalle(true) }}
                  >
                    <td style={{ padding: '11px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#9CADCE' }}>{t.num_tarjeta}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: 'rgba(65,90,119,0.4)', color: '#9CADCE',
                        padding: '3px 8px', borderRadius: '5px',
                        fontSize: '11px', fontFamily: 'monospace'
                      }}>{t.placa}</span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: '500', color: '#E0E1DD' }}>{t.propietario}</td>
                    <td style={{ padding: '11px 16px', fontSize: '12px', color: '#778DA9' }}>{t.marca} {t.linea}</td>
                    <td style={{ padding: '11px 16px', fontSize: '11px', fontFamily: 'monospace', color: '#778DA9' }}>{fecha(t.fecha_emision)}</td>
                    <td style={{ padding: '11px 16px', fontSize: '11px', fontFamily: 'monospace', color: '#778DA9' }}>{fecha(t.fecha_vencimiento)}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: est.bg, color: est.color,
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '500'
                      }}>{t.estado}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {t.estado === 'Activa' && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button onClick={(e) => abrirModal('propietario', t, e)} style={{
                            background: 'rgba(156,173,206,0.1)', border: '1px solid rgba(156,173,206,0.2)',
                            color: '#9CADCE', borderRadius: '6px', padding: '4px 8px',
                            fontSize: '11px', cursor: 'pointer'
                          }}>Dueño</button>
                          <button onClick={(e) => abrirModal('motor', t, e)} style={{
                            background: 'rgba(156,173,206,0.1)', border: '1px solid rgba(156,173,206,0.2)',
                            color: '#9CADCE', borderRadius: '6px', padding: '4px 8px',
                            fontSize: '11px', cursor: 'pointer'
                          }}>Motor</button>
                          <button onClick={(e) => abrirModal('color', t, e)} style={{
                            background: 'rgba(156,173,206,0.1)', border: '1px solid rgba(156,173,206,0.2)',
                            color: '#9CADCE', borderRadius: '6px', padding: '4px 8px',
                            fontSize: '11px', cursor: 'pointer'
                          }}>Color</button>
                          <button onClick={(e) => abrirModal('desactivar', t, e)} style={{
                            background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)',
                            color: '#E05C5C', borderRadius: '6px', padding: '4px 8px',
                            fontSize: '11px', cursor: 'pointer'
                          }}>Desactivar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#778DA9', fontSize: '13px' }}>
                    No se encontraron tarjetas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALES */}
      {showNueva && <NuevaTarjetaModal onClose={() => setShowNueva(false)} onSuccess={cargarTarjetas} />}
      {showDesactivar && tarjetaSeleccionada && <DesactivarModal tarjeta={tarjetaSeleccionada} onClose={cerrarModales} onSuccess={cargarTarjetas} />}
      {showCambioProp && tarjetaSeleccionada && <CambioPropietarioModal tarjeta={tarjetaSeleccionada} onClose={cerrarModales} onSuccess={cargarTarjetas} />}
      {showCambioMotor && tarjetaSeleccionada && <CambioMotorModal tarjeta={tarjetaSeleccionada} onClose={cerrarModales} onSuccess={cargarTarjetas} />}
      {showCambioColor && tarjetaSeleccionada && <CambioColorModal tarjeta={tarjetaSeleccionada} onClose={cerrarModales} onSuccess={cargarTarjetas} />}
      {showDetalle && tarjetaSeleccionada && (
        <DetalleTarjetaPanel
          tarjeta={tarjetaSeleccionada}
          onClose={() => { setShowDetalle(false); setTarjetaSeleccionada(null) }}
        />
      )}
    </div>
  )
}