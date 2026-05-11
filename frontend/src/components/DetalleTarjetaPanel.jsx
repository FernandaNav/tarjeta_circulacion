import { useEffect, useState } from 'react'
import { tarjetasService } from '../services/api'

export default function DetalleTarjetaPanel({ tarjeta, onClose }) {
  const [detalle, setDetalle] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tarjeta) return
    Promise.all([
      tarjetasService.getOne(tarjeta.num_tarjeta),
      tarjetasService.getHistorial(tarjeta.num_tarjeta)
    ])
      .then(([det, hist]) => {
        setDetalle(det.data)
        setHistorial(hist.data)
      })
      .finally(() => setLoading(false))
  }, [tarjeta])

  const fecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '—'

  const estadoColor = {
    'Activa':                 '#4CAF7D',
    'Vencida':                '#E05C5C',
    'Desactivada':            '#E05C5C',
    'Desactivada por impago': '#E05C5C',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex', justifyContent: 'flex-end'
    }}
      onClick={onClose}
    >
      <div
        style={{
          width: '420px',
          background: '#0f1e2d',
          borderLeft: '1px solid rgba(119,141,169,0.15)',
          height: '100%', overflowY: 'auto',
          padding: '24px',
          animation: 'slideIn 0.2s ease'
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#f0f2f5' }}>Detalle de tarjeta</h2>
          <button onClick={onClose} style={{
            background: 'rgba(119,141,169,0.1)', border: 'none',
            color: '#778DA9', borderRadius: '6px',
            width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px'
          }}>✕</button>
        </div>

        {loading && <p style={{ color: '#778DA9', fontSize: '13px' }}>Cargando...</p>}

        {!loading && detalle && (
          <>
            {/* PLACA Y ESTADO */}
            <div style={{
              background: 'rgba(65,90,119,0.15)',
              border: '1px solid rgba(119,141,169,0.2)',
              borderRadius: '10px', padding: '14px 16px', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '20px', color: '#9CADCE', fontWeight: '500' }}>
                  {detalle.placa}
                </span>
                <span style={{
                  background: `${estadoColor[detalle.estado]}18`,
                  color: estadoColor[detalle.estado],
                  padding: '3px 10px', borderRadius: '20px',
                  fontSize: '11px', fontWeight: '500'
                }}>{detalle.estado}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#778DA9', fontFamily: 'monospace' }}>{detalle.num_tarjeta}</p>
            </div>

            {/* SECCIÓN: TARJETA */}
            <Section title="Tarjeta">
              <Row label="Certificado" value={detalle.num_certificado_propiedad || '—'} />
              <Row label="Emisión" value={fecha(detalle.fecha_emision)} />
              <Row label="Vencimiento" value={fecha(detalle.fecha_vencimiento)} />
              {detalle.motivo_desactivacion && (
                <Row label="Motivo desactivación" value={detalle.motivo_desactivacion} />
              )}
            </Section>

            {/* SECCIÓN: PROPIETARIO */}
            <Section title="Propietario actual">
              <Row label="Nombre" value={detalle.propietario} />
              <Row label="NIT" value={detalle.nit} mono />
              <Row label="CUI" value={detalle.cui} mono />
              <Row label="Teléfono" value={detalle.telefono || '—'} />
              <Row label="Dirección" value={detalle.direccion || '—'} />
            </Section>

            {/* SECCIÓN: VEHÍCULO */}
            <Section title="Vehículo">
              <Row label="Marca / Línea" value={`${detalle.nombre_marca} ${detalle.nombre_linea}`} />
              <Row label="Año" value={detalle.modelo_anio} />
              <Row label="Tipo" value={detalle.tipo_vehiculo} />
              <Row label="Uso" value={detalle.tipo_uso} />
              <Row label="VIN" value={detalle.vin || '—'} mono />
              <Row label="Num. motor" value={detalle.num_motor || '—'} mono />
              <Row label="Num. chasis" value={detalle.num_chasis || '—'} mono />
            </Section>

            {/* SECCIÓN: HISTORIAL */}
            <Section title={`Historial de propietarios (${historial.length})`}>
              {historial.length === 0 && (
                <p style={{ fontSize: '12px', color: '#778DA9' }}>Sin historial</p>
              )}
              {historial.map((h, i) => (
                <div key={i} style={{
                  background: 'rgba(65,90,119,0.1)',
                  border: '1px solid rgba(119,141,169,0.1)',
                  borderRadius: '8px', padding: '10px 12px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#E0E1DD' }}>{h.propietario}</span>
                    {!h.fecha_fin && (
                      <span style={{ fontSize: '10px', color: '#4CAF7D', background: 'rgba(76,175,125,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                        Actual
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#778DA9', fontFamily: 'monospace' }}>
                    {fecha(h.fecha_inicio)} → {h.fecha_fin ? fecha(h.fecha_fin) : 'presente'}
                  </p>
                  {h.motivo_cambio && (
                    <p style={{ fontSize: '11px', color: '#778DA9', marginTop: '4px' }}>
                      {h.motivo_cambio}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <p style={{
        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px',
        color: '#778DA9', fontWeight: '500', marginBottom: '8px',
        paddingBottom: '6px', borderBottom: '1px solid rgba(119,141,169,0.1)'
      }}>{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <span style={{ fontSize: '11px', color: '#778DA9' }}>{label}</span>
      <span style={{
        fontSize: '11px', color: '#E0E1DD', textAlign: 'right', maxWidth: '220px',
        fontFamily: mono ? 'monospace' : 'inherit'
      }}>{value}</span>
    </div>
  )
}