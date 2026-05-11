import { useNavigate, useLocation } from 'react-router-dom'
import { colors } from '../styles/theme'

const navItems = [
  { icon: '⊞', path: '/',         label: 'Dashboard' },
  { icon: '◫', path: '/tarjetas', label: 'Tarjetas'  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      width: '220px', minWidth: '220px',
      background: colors.sidebar,
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0
    }}>
      {/* LOGO */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: colors.primary,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: 'white',
            boxShadow: '0 4px 10px rgba(79,111,245,0.4)'
          }}>TC</div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'white', lineHeight: 1 }}>Tarjetas</p>
            <p style={{ fontSize: '11px', color: colors.sidebarText, marginTop: '3px' }}>Circulación</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ padding: '20px 12px', flex: 1 }}>
        <p style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
          marginBottom: '10px', paddingLeft: '8px'
        }}>General</p>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                cursor: 'pointer', marginBottom: '4px',
                background: active ? colors.sidebarActive : 'transparent',
                borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '16px', color: active ? colors.primary : colors.sidebarText }}>{item.icon}</span>
              <span style={{
                fontSize: '13px', fontWeight: active ? '600' : '400',
                color: active ? 'white' : colors.sidebarText
              }}>{item.label}</span>
            </div>
          )
        })}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          SAT Guatemala © 2025
        </p>
      </div>
    </div>
  )
}