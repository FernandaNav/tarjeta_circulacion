import { useEffect, useState } from 'react'
import { tarjetasService } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    tarjetasService.getEstadisticas()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const fecha = (f) => f ? new Date(f).toLocaleDateString('es-GT') : '-'

  const diasRestantes = (f) => {
    const hoy = new Date()
    const venc = new Date(f)
    return Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
  }

  const stats = data?.estadisticas
  const proximas = data?.proximas_a_vencer || []

  const cards = [
    { label: 'Total tarjetas',   value: stats?.total || 0,               color: '#9CADCE', bg: 'rgba(156,173,206,0.08)' },
    { label: 'Activas',          value: stats?.activas || 0,             color: '#4CAF7D', bg: 'rgba(76,175,125,0.08)'  },
    { label: 'Por vencer',       value: stats?.por_vencer || 0,          color: '#E8A838', bg: 'rgba(232,168,56,0.08)'  },
    { label: 'Vencidas',         value: stats?.vencidas || 0,            color: '#E05C5C', bg: 'rgba(224,92,92,0.08)'   },
    { label: 'Desactivadas',     value: stats?.desactivadas || 0,        color: '#E05C5C', bg: 'rgba(224,92,92,0.08)'   },
    { label: 'Por impago',       value: stats?.desactivadas_impago || 0, color: '#E05C5C', bg: 'rgba(224,92,92,0.08)'   },
  ]

  return (
    <div style={{ padding: '24px', fontFamily: 'DM Sans, sans-serif', width: '100%' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#f0f2f5', marginBottom: '4px' }}>
          Resumen general
        </h1>
        <p style={{ fontSize: '13px', color: '#778DA9' }}>
          Sistema de Tarjetas de Circulación
        </p>
      </div>

      {loading && <p style={{ color: '#778DA9' }}>Cargando estadísticas...</p>}

      {!loading && (
        <>
          {/* STATS CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {cards.map((c, i) => (
              <div key={i} style={{
                background: '#1B2637',
                border: `1px solid ${c.color}22`,
                borderRadius: '12px',
                padding: '18px 20px',
              }}>
                <p style={{ fontSize: '11px', color: '#778DA9', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                  {c.label}
                </p>
                <p style={{ fontSize: '32px', fontWeight: '600', color: c.color, fontFamily: 'monospace', lineHeight: 1 }}>
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          {/* PRÓXIMAS A VENCER */}
          <div style={{
            background: '#1B2637',
            border: '1px solid rgba(119,141,169,0.12)',
            borderRadius: '12px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(119,141,169,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#f0f2f5' }}>
                  Próximas a vencer
                </span>
                <span style={{ fontSize: '12px', color: '#778DA9', marginLeft: '8px' }}>
                  (próximos 60 días)
                </span>
              </div>
              <button
                onClick={() => navigate('/tarjetas')}
                style={{
                  background: 'rgba(156,173,206,0.1)', border: '1px solid rgba(156,173,206,0.2)',
                  color: '#9CADCE', borderRadius: '6px', padding: '4px 12px',
                  fontSize: '12px', cursor: 'pointer'
                }}
              >
                Ver todas →
              </button>
            </div>

            {proximas.length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', color: '#778DA9', fontSize: '13px' }}>
                No hay tarjetas próximas a vencer
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(8,17,26,0.3)' }}>
                    {['Num. tarjeta', 'Placa', 'Propietario', 'Marca / Línea', 'Vencimiento', 'Días restantes'].map(h => (
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
                  {proximas.map((t, i) => {
                    const dias = diasRestantes(t.fecha_vencimiento)
                    const colorDias = dias <= 15 ? '#E05C5C' : dias <= 30 ? '#E8A838' : '#9CADCE'
                    return (
                      <tr key={i}
                        style={{ borderBottom: '1px solid rgba(119,141,169,0.06)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(65,90,119,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => navigate('/tarjetas')}
                      >
                        <td style={{ padding: '11px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#9CADCE' }}>{t.num_tarjeta}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            background: 'rgba(65,90,119,0.4)', color: '#9CADCE',
                            padding: '3px 8px', borderRadius: '5px',
                            fontSize: '11px', fontFamily: 'monospace'
                          }}>{t.placa}</span>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#E0E1DD' }}>{t.propietario}</td>
                        <td style={{ padding: '11px 16px', fontSize: '12px', color: '#778DA9' }}>{t.marca} {t.linea}</td>
                        <td style={{ padding: '11px 16px', fontSize: '11px', fontFamily: 'monospace', color: '#778DA9' }}>{fecha(t.fecha_vencimiento)}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            background: `${colorDias}18`, color: colorDias,
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '500'
                          }}>
                            {dias} días
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}