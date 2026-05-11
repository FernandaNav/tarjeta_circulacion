import { useEffect, useState } from 'react'
import { tarjetasService } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { colors, shadows, radius } from '../styles/theme'

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
  const diasRestantes = (f) => Math.ceil((new Date(f) - new Date()) / (1000 * 60 * 60 * 24))

  const stats = data?.estadisticas
  const proximas = data?.proximas_a_vencer || []

  const cards = [
    { label: 'Total tarjetas', value: stats?.total || 0,               color: colors.primary,  bg: colors.primaryLight  },
    { label: 'Activas',        value: stats?.activas || 0,             color: colors.success,  bg: colors.successBg     },
    { label: 'Por vencer',     value: stats?.por_vencer || 0,          color: colors.warning,  bg: colors.warningBg     },
    { label: 'Vencidas',       value: stats?.vencidas || 0,            color: colors.danger,   bg: colors.dangerBg      },
    { label: 'Desactivadas',   value: stats?.desactivadas || 0,        color: colors.danger,   bg: colors.dangerBg      },
    { label: 'Por impago',     value: stats?.desactivadas_impago || 0, color: colors.coral,    bg: colors.coralLight    },
  ]

  return (
    <div style={{ padding: '28px 32px', background: colors.bgMain, minHeight: '100vh', fontFamily: 'Inter, DM Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.textMain, marginBottom: '4px' }}>
          Resumen general
        </h1>
        <p style={{ fontSize: '13px', color: colors.textSub }}>
          Sistema de Tarjetas de Circulación — Guatemala
        </p>
      </div>

      {loading && <p style={{ color: colors.textSub }}>Cargando estadísticas...</p>}

      {!loading && (
        <>
          {/* STATS CARDS */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px', marginBottom: '24px'
          }}>
            {cards.map((c, i) => (
              <div key={i} style={{
                background: colors.bgCard, borderRadius: radius.lg,
                padding: '20px 22px', boxShadow: shadows.card,
                borderLeft: `4px solid ${c.color}`,
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadows.card }}
              >
                <p style={{ fontSize: '11px', color: colors.textSub, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', fontWeight: '600' }}>
                  {c.label}
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <p style={{ fontSize: '36px', fontWeight: '700', color: c.color, lineHeight: 1 }}>
                    {c.value}
                  </p>
                  <span style={{
                    background: c.bg, color: c.color,
                    padding: '3px 8px', borderRadius: radius.pill,
                    fontSize: '11px', fontWeight: '600', marginBottom: '4px'
                  }}>tarjetas</span>
                </div>
              </div>
            ))}
          </div>

          {/* PRÓXIMAS A VENCER */}
          <div style={{
            background: colors.bgCard, borderRadius: radius.lg,
            boxShadow: shadows.card, overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textMain }}>
                  Próximas a vencer
                </span>
                <span style={{ fontSize: '12px', color: colors.textSub, marginLeft: '8px' }}>
                  próximos 60 días
                </span>
              </div>
              <button onClick={() => navigate('/tarjetas')} style={{
                background: colors.primaryLight, border: 'none',
                color: colors.primary, borderRadius: radius.md,
                padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter, DM Sans, sans-serif'
              }}
                onMouseEnter={e => e.currentTarget.style.background = colors.primary && (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => { e.currentTarget.style.background = colors.primaryLight; e.currentTarget.style.color = colors.primary }}
              >
                Ver todas →
              </button>
            </div>

            {proximas.length === 0 ? (
              <p style={{ padding: '32px', textAlign: 'center', color: colors.textSub, fontSize: '13px' }}>
                No hay tarjetas próximas a vencer
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafbff' }}>
                    {['Num. tarjeta', 'Placa', 'Propietario', 'Marca / Línea', 'Vencimiento', 'Días restantes'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '11px 16px',
                        fontSize: '11px', color: colors.textSub,
                        textTransform: 'uppercase', letterSpacing: '0.6px',
                        fontWeight: '600', borderBottom: `1px solid ${colors.border}`
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proximas.map((t, i) => {
                    const dias = diasRestantes(t.fecha_vencimiento)
                    const colorDias = dias <= 15 ? colors.danger : dias <= 30 ? colors.warning : colors.primary
                    const bgDias = dias <= 15 ? colors.dangerBg : dias <= 30 ? colors.warningBg : colors.primaryLight
                    return (
                      <tr key={i}
                        style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.bgHover}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        onClick={() => navigate('/tarjetas')}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: colors.primary, fontWeight: '600' }}>{t.num_tarjeta}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: colors.primaryLight, color: colors.primary,
                            padding: '3px 10px', borderRadius: radius.sm,
                            fontSize: '12px', fontFamily: 'monospace', fontWeight: '600'
                          }}>{t.placa}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: colors.textMain, fontWeight: '500' }}>{t.propietario}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: colors.textSub }}>{t.marca} {t.linea}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: colors.textSub }}>{fecha(t.fecha_vencimiento)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: bgDias, color: colorDias,
                            padding: '4px 10px', borderRadius: radius.pill,
                            fontSize: '11px', fontWeight: '600'
                          }}>{dias} días</span>
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