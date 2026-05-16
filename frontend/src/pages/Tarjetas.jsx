import { useEffect, useState, useRef } from 'react'
import { tarjetasService } from '../services/api'
import NuevaTarjetaModal from '../components/NuevaTarjetaModal'
import DesactivarModal from '../components/DesactivarModal'
import CambioPropietarioModal from '../components/CambiarPropietarioModal'
import CambioMotorModal from '../components/CambioMotorModal'
import CambioColorModal from '../components/CambioColorModal'
import DetalleTarjetaPanel from '../components/DetalleTarjetaPanel'
import RenovarModal from '../components/RenovarModal'
import { colors, shadows, radius } from '../styles/theme'

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

  if (tarjeta.estado !== 'Activa' && tarjeta.estado !== 'Vencida') return null

  if (tarjeta.estado === 'Vencida') return (
    <div onClick={e => e.stopPropagation()}>
      <button
        onClick={() => onAccion('renovar', tarjeta)}
        style={{
          background: colors.successBg, border: 'none', borderRadius: radius.md,
          padding: '5px 12px', cursor: 'pointer', fontSize: '12px',
          color: colors.success, fontWeight: '600', fontFamily: "'Poppins', sans-serif",
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        ↺ Renovar
      </button>
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? colors.primary : colors.primaryLight,
          border: 'none', borderRadius: radius.md,
          width: '32px', height: '32px',
          cursor: 'pointer', fontSize: '16px',
          color: open ? 'white' : colors.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', fontWeight: '700'
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = colors.primaryHover; e.currentTarget.style.color = 'white' }}}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = colors.primaryLight; e.currentTarget.style.color = colors.primary }}}
      >
        ⋯
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '36px',
          background: colors.bgCard, borderRadius: radius.lg,
          boxShadow: shadows.dropdown,
          border: `1px solid ${colors.borderCard}`,
          zIndex: 100, minWidth: '160px', overflow: 'hidden'
        }}>
          {[
            { label: 'Cambio de dueño', key: 'propietario' },
            { label: 'Cambio de motor', key: 'motor'       },
            { label: 'Cambio de color', key: 'color'       },
          ].map(item => (
            <div key={item.key}
              onClick={() => { onAccion(item.key, tarjeta); setOpen(false) }}
              style={{
                padding: '10px 14px', fontSize: '11px', cursor: 'pointer',
                color: colors.textMain, transition: 'background 0.15s',
                borderBottom: `1px solid ${colors.border}`
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.bgMain}
              onMouseLeave={e => e.currentTarget.style.background = colors.bgCard}
            >
              {item.label}
            </div>
          ))}
          <div
            onClick={() => { onAccion('desactivar', tarjeta); setOpen(false) }}
            style={{
              padding: '10px 14px', fontSize: '11px', cursor: 'pointer',
              color: colors.danger, transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = colors.dangerBg}
            onMouseLeave={e => e.currentTarget.style.background = colors.bgCard}
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
  const [showRenovar, setShowRenovar]                 = useState(false)
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
    if (modal === 'renovar')     setShowRenovar(true)
  }

  const cerrarModales = () => {
    setShowDesactivar(false)
    setShowCambioProp(false)
    setShowCambioMotor(false)
    setShowCambioColor(false)
    setShowRenovar(false)
    setTarjetaSeleccionada(null)
  }

  const filtros = ['todos', 'Activa', 'Vencida', 'Desactivada', 'Desactivada por impago']

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Poppins', sans-serif", background: colors.bgMain, minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.textMain, marginBottom: '4px', fontFamily: "'Poppins', sans-serif" }}>Tarjetas de Circulación</h1>
          <p style={{ fontSize: '13px', color: colors.textSub }}>
            {filtradas.length} registro{filtradas.length !== 1 ? 's' : ''} encontrado{filtradas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowNueva(true)}
          style={{
            background: colors.primary, border: 'none', color: 'white',
            padding: '10px 20px', borderRadius: radius.md, cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            boxShadow: shadows.button,
            transition: 'all 0.15s', fontFamily: "'Poppins', sans-serif"
          }}
          onMouseEnter={e => e.currentTarget.style.background = colors.primaryHover}
          onMouseLeave={e => e.currentTarget.style.background = colors.primary}
        >
          + Nueva tarjeta
        </button>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div style={{
        background: colors.bgCard, borderRadius: radius.lg, padding: '14px 16px',
        marginBottom: '16px', display: 'flex', gap: '12px',
        alignItems: 'center', flexWrap: 'wrap',
        boxShadow: shadows.card
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: colors.bgInput, borderRadius: radius.sm, padding: '7px 12px', flex: 1, maxWidth: '260px' }}>
          <span style={{ color: colors.textSub, fontSize: '14px' }}>⌕</span>
          <input
            type="text"
            placeholder="Buscar placa, propietario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: '13px', color: colors.textMain, width: '100%',
              fontFamily: "'Poppins', sans-serif"
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button key={f} onClick={() => setFiltroEstado(f)} style={{
              padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px',
              fontWeight: '500', cursor: 'pointer', border: 'none',
              background: filtroEstado === f ? colors.primary : colors.bgInput,
              color: filtroEstado === f ? 'white' : colors.textSub,
              transition: 'all 0.15s', fontFamily: "'Poppins', sans-serif"
            }}
              onMouseEnter={e => { if (filtroEstado !== f) e.currentTarget.style.background = colors.primaryLight }}
              onMouseLeave={e => { if (filtroEstado !== f) e.currentTarget.style.background = colors.bgInput }}
            >
              {f === 'todos' ? 'Todos' : f}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA */}
      {loading && <p style={{ color: colors.textSub, padding: '24px' }}>Cargando...</p>}
      {error && <p style={{ color: colors.danger, padding: '24px' }}>Error: {error}</p>}
      {!loading && !error && (
        <div style={{
          background: colors.bgCard, borderRadius: radius.lg,
          boxShadow: shadows.card, overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                {['Num. tarjeta', 'Placa', 'Propietario', 'Marca / Línea', 'Emisión', 'Vencimiento', 'Estado', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'center', padding: '12px 16px',
                    fontSize: '11px', color: colors.textSub,
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    fontWeight: '600', background: colors.bgHover
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((t, i) => {
                const est = estadoConfig[t.estado] || estadoConfig['Activa']
                return (
                  <tr key={i}
                    style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = colors.bgHover}
                    onMouseLeave={e => e.currentTarget.style.background = colors.bgCard}
                    onClick={() => { setTarjetaSeleccionada(t); setShowDetalle(true) }}
                  >
                    <td style={{ padding: '13px 16px', fontSize: '12px', fontFamily: "'Poppins', sans-serif", color: colors.primary, fontWeight: '600' }}>
                      {t.num_tarjeta}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        background: colors.primaryLight, color: colors.primary,
                        padding: '4px 10px', borderRadius: radius.sm,
                        fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600'
                      }}>{t.placa}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '500', color: colors.textMain }}>{t.propietario}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: colors.textSub }}>{t.marca} {t.linea}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: colors.textSub }}>{fecha(t.fecha_emision)}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: colors.textSub }}>{fecha(t.fecha_vencimiento)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        background: est.bg, color: est.color,
                        padding: '4px 10px', borderRadius: radius.pill,
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
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: colors.textSub, fontSize: '13px' }}>
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
      {showRenovar && tarjetaSeleccionada && <RenovarModal tarjeta={tarjetaSeleccionada} onClose={cerrarModales} onSuccess={cargarTarjetas} />}
      {showDetalle && tarjetaSeleccionada && (
        <DetalleTarjetaPanel
          tarjeta={tarjetaSeleccionada}
          onClose={() => { setShowDetalle(false); setTarjetaSeleccionada(null) }}
        />
      )}
    </div>
  )
}