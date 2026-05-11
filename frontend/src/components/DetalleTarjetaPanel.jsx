import { useEffect, useState } from 'react'
import { tarjetasService } from '../services/api'
import { colors, shadows, radius } from '../styles/theme'

export default function DetalleTarjetaPanel({ tarjeta, onClose }) {
  const [detalle, setDetalle]   = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!tarjeta) return
    Promise.all([
      tarjetasService.getOne(tarjeta.num_tarjeta),
      tarjetasService.getHistorial(tarjeta.num_tarjeta)
    ])
      .then(([det, hist]) => { setDetalle(det.data); setHistorial(hist.data) })
      .finally(() => setLoading(false))
  }, [tarjeta])

  const fecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '—'

  const estadoConfig = {
    'Activa':                 { color: colors.success,  bg: colors.successBg  },
    'Vencida':                { color: colors.danger,   bg: colors.dangerBg   },
    'Desactivada':            { color: colors.danger,   bg: colors.dangerBg   },
    'Desactivada por impago': { color: colors.warning,  bg: colors.warningBg  },
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,26,46,0.4)',
      zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
      backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        width: '400px', background: colors.bgCard,
        borderLeft: `1px solid ${colors.border}`,
        height: '100%', overflowY: 'auto', padding: '24px',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
        animation: 'slideIn 0.2s ease'
      }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: colors.textMain }}>Detalle de tarjeta</h2>
          <button onClick={onClose} style={{
            background: colors.bgInput, border: 'none', color: colors.textSub,
            borderRadius: radius.sm, width: '30px', height: '30px',
            cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.dangerBg; e.currentTarget.style.color = colors.danger }}
            onMouseLeave={e => { e.currentTarget.style.background = colors.bgInput; e.currentTarget.style.color = colors.textSub }}
          >✕</button>
        </div>

        {loading && <p style={{ color: colors.textSub, fontSize: '13px' }}>Cargando...</p>}

        {!loading && detalle && (() => {
          const est = estadoConfig[detalle.estado] || estadoConfig['Activa']
          return (
            <>
              {/* PLACA Y ESTADO */}
              <div style={{
                background: colors.primaryLight,
                border: `1px solid ${colors.primary}22`,
                borderRadius: radius.md, padding: '16px', marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '22px', color: colors.primary, fontWeight: '700' }}>
                    {detalle.placa}
                  </span>
                  <span style={{
                    background: est.bg, color: est.color,
                    padding: '4px 12px', borderRadius: radius.pill,
                    fontSize: '11px', fontWeight: '600'
                  }}>{detalle.estado}</span>
                </div>
                <p style={{ fontSize: '12px', color: colors.textSub, fontFamily: 'monospace' }}>{detalle.num_tarjeta}</p>
              </div>

              <Section title="Tarjeta">
                <Row label="Certificado" value={detalle.num_certificado_propiedad || '—'} />
                <Row label="Emisión" value={fecha(detalle.fecha_emision)} />
                <Row label="Vencimiento" value={fecha(detalle.fecha_vencimiento)} />
                {detalle.motivo_desactivacion && <Row label="Motivo desactivación" value={detalle.motivo_desactivacion} />}
              </Section>

              <Section title="Propietario actual">
                <Row label="Nombre" value={detalle.propietario} />
                <Row label="NIT" value={detalle.nit} mono />
                <Row label="CUI" value={detalle.cui} mono />
                <Row label="Teléfono" value={detalle.telefono || '—'} />
                <Row label="Dirección" value={detalle.direccion || '—'} />
              </Section>

              <Section title="Vehículo">
                <Row label="Marca / Línea" value={`${detalle.nombre_marca} ${detalle.nombre_linea}`} />
                <Row label="Año" value={detalle.modelo_anio} />
                <Row label="Tipo" value={detalle.tipo_vehiculo} />
                <Row label="Uso" value={detalle.tipo_uso} />
                <Row label="VIN" value={detalle.vin || '—'} mono />
                <Row label="Num. motor" value={detalle.num_motor || '—'} mono />
                <Row label="Num. chasis" value={detalle.num_chasis || '—'} mono />
              </Section>

              <Section title={`Historial de propietarios (${historial.length})`}>
                {historial.length === 0 && <p style={{ fontSize: '12px', color: colors.textSub }}>Sin historial</p>}
                {historial.map((h, i) => (
                  <div key={i} style={{
                    background: colors.bgInput, border: `1px solid ${colors.border}`,
                    borderRadius: radius.md, padding: '12px', marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textMain }}>{h.propietario}</span>
                      {!h.fecha_fin && (
                        <span style={{ fontSize: '10px', color: colors.success, background: colors.successBg, padding: '2px 8px', borderRadius: radius.pill, fontWeight: '600' }}>
                          Actual
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: colors.textSub, fontFamily: 'monospace' }}>
                      {fecha(h.fecha_inicio)} → {h.fecha_fin ? fecha(h.fecha_fin) : 'presente'}
                    </p>
                    {h.motivo_cambio && <p style={{ fontSize: '11px', color: colors.textSub, marginTop: '4px' }}>{h.motivo_cambio}</p>}
                  </div>
                ))}
              </Section>
            </>
          )
        })()}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{
        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px',
        color: colors.textSub, fontWeight: '700', marginBottom: '10px',
        paddingBottom: '6px', borderBottom: `1px solid ${colors.border}`
      }}>{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', color: colors.textSub, minWidth: '100px' }}>{label}</span>
      <span style={{
        fontSize: '12px', color: colors.textMain, textAlign: 'right',
        maxWidth: '220px', fontFamily: mono ? 'monospace' : 'inherit',
        fontWeight: mono ? '600' : '400'
      }}>{value}</span>
    </div>
  )
}