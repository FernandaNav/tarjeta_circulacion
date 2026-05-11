import { useEffect, useState, useRef } from 'react'
import { tarjetasService } from '../services/api'
import NuevaTarjetaModal from '../components/NuevaTarjetaModal'
import DesactivarModal from '../components/DesactivarModal'
import CambioPropietarioModal from '../components/CambiarPropietarioModal'
import CambioMotorModal from '../components/CambioMotorModal'
import CambioColorModal from '../components/CambioColorModal'
import DetalleTarjetaPanel from '../components/DetalleTarjetaPanel'

const estadoConfig = {
  'Activa':                 { bg: '#E8F5EE', color: '#2E7D52', dot: '#4CAF7D' },
  'Vencida':                { bg: '#FEF0F0', color: '#C0392B', dot: '#E05C5C' },
  'Desactivada':            { bg: '#FEF0F0', color: '#C0392B', dot: '#E05C5C' },
  'Desactivada por impago': { bg: '#FFF4E5', color: '#B35C00', dot: '#E8A838' },
  'Por vencer':             { bg: '#FFF4E5', color: '#B35C00', dot: '#E8A838' },
}

function MenuAcciones({ tarjeta, onAccion }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (tarjeta.estado !== 'Activa') return null

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? '#4F6FF5' : '#F0F3FF',
          border: 'none', borderRadius: '8px',
          width: '32px', height: '32px',
          cursor: 'pointer', fontSize: '16px',
          color: open ? 'white' : '#4F6FF5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', fontWeight: '700'
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = '#F88379'; e.currentTarget.style.color = 'white' }}}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = '#F0F3FF'; e.currentTarget.style.color = '#4F6FF5' }}}
      >
        ⋯
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '36px',
          background: 'white', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          border: '1px solid #eef0f8',
          zIndex: 100, minWidth: '160px', overflow: 'hidden'
        }}>
          {[
            { label: '👤 Cambio de dueño',  key: 'propietario' },
            { label: '⚙ Cambio de motor',   key: 'motor'       },
            { label: '🎨 Cambio de color',   key: 'color'       },
          ].map(item => (
            <div key={item.key}
              onClick={() => { onAccion(item.key, tarjeta); setOpen(false) }}
              style={{
                padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                color: '#1a1a2e', transition: 'background 0.15s',
                borderBottom: '1px solid #f5f5f5'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F6FB'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              {item.label}
            </div>
          ))}
          <div
            onClick={() => { onAccion('desactivar', tarjeta); setOpen(false) }}
            style={{
              padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
              color: '#C0392B', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF0F0'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            ✕ Desactivar tarjeta
          </div>
        </div>
      )}
    </div>
  )
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

  const abrirModal = (modal, tarjeta) => {
    setTarjetaSeleccionada(tarjeta)
    if (modal === 'desactivar')  setShowDesactivar(true)
    if (modal === 'propietario') setShowCambioProp(true)
    if (modal === 'motor')       setShowCambioMotor(true)
    if (modal === 'color')       setShowCambioColor(true)
  }

  const cerrarModales = () => {
    setShowDesactivar(false)
    setShowCambioProp(false)
    setShowCambioMotor(false)
    setShowCambioColor(false)
    setTarjetaSeleccionada(null)
  }

  const filtros = ['todos', 'Activa', 'Vencida', 'Desactivada', 'Desactivada por impago']

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Inter, DM Sans, sans-serif', background: '#F4F6FB', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '2px' }}>
            Tarjetas de circulación
          </h1>
          <p style={{ fontSize: '13px', color: '#8892b0' }}>
            {filtradas.length} registro{filtradas.length !== 1 ? 's' : ''} encontrado{filtradas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNueva(true)}
          style={{
            background: '#4F6FF5', border: 'none', color: 'white',
            padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            boxShadow: '0 4px 12px rgba(79,111,245,0.35)',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#3d5ce0'}
          onMouseLeave={e => e.currentTarget.style.background = '#4F6FF5'}
        >
          + Nueva tarjeta
        </button>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '14px 16px',
        marginBottom: '16px', display: 'flex', gap: '12px',
        alignItems: 'center', flexWrap: 'wrap',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F4F6FB', borderRadius: '8px', padding: '7px 12px', flex: 1, maxWidth: '260px' }}>
          <span style={{ color: '#8892b0', fontSize: '14px' }}>⌕</span>
          <input
            type="text"
            placeholder="Buscar placa, propietario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: '13px', color: '#1a1a2e', width: '100%',
              fontFamily: 'Inter, DM Sans, sans-serif'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button key={f} onClick={() => setFiltroEstado(f)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              fontWeight: '500', cursor: 'pointer', border: 'none',
              background: filtroEstado === f ? '#4F6FF5' : '#F4F6FB',
              color: filtroEstado === f ? 'white' : '#8892b0',
              transition: 'all 0.15s',
              fontFamily: 'Inter, DM Sans, sans-serif'
            }}
              onMouseEnter={e => { if (filtroEstado !== f) e.currentTarget.style.background = '#eef0fb' }}
              onMouseLeave={e => { if (filtroEstado !== f) e.currentTarget.style.background = '#F4F6FB' }}
            >
              {f === 'todos' ? 'Todos' : f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA */}
      {loading && <p style={{ color: '#8892b0', padding: '24px' }}>Cargando...</p>}
      {error && <p style={{ color: '#E05C5C', padding: '24px' }}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{
          background: 'white', borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f2f8' }}>
                {['Num. tarjeta', 'Placa', 'Propietario', 'Marca / Línea', 'Emisión', 'Vencimiento', 'Estado', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: '11px', color: '#8892b0',
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    fontWeight: '600', background: '#fafbff'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((t, i) => {
                const est = estadoConfig[t.estado] || estadoConfig['Activa']
                return (
                  <tr key={i}
                    style={{ borderBottom: '1px solid #f8f9fc', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    onClick={() => { setTarjetaSeleccionada(t); setShowDetalle(true) }}
                  >
                    <td style={{ padding: '13px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#4F6FF5', fontWeight: '600' }}>
                      {t.num_tarjeta}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        background: '#F0F3FF', color: '#4F6FF5',
                        padding: '4px 10px', borderRadius: '6px',
                        fontSize: '12px', fontFamily: 'monospace', fontWeight: '600'
                      }}>{t.placa}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>{t.propietario}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#8892b0' }}>{t.marca} {t.linea}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#8892b0' }}>{fecha(t.fecha_emision)}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#8892b0' }}>{fecha(t.fecha_vencimiento)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        background: est.bg, color: est.color,
                        padding: '4px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '600',
                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: est.dot, display: 'inline-block' }}></span>
                        {t.estado}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <MenuAcciones tarjeta={t} onAccion={abrirModal} />
                    </td>
                  </tr>
                )
              })}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8892b0', fontSize: '13px' }}>
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