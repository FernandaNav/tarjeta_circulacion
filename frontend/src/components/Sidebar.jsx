import { useNavigate, useLocation } from 'react-router-dom'
import { colors } from '../styles/theme'

const navItems = [
  {
    label: 'Resumen',
    path: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    label: 'Propietarios',
    path: '/propietarios',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    label: 'Vehículos',
    path: '/vehiculos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    )
  },
  {
    label: 'Tarjetas',
    path: '/tarjetas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    )
  },
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
      <div style={{ padding: '24px 20px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'white', lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>Tarjetas de Circulacion</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Management Console</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ padding: '0 12px', flex: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '10px',
                cursor: 'pointer', marginBottom: '2px',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.15s',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ color: active ? 'white' : 'rgba(255,255,255,0.45)', display: 'flex' }}>{item.icon}</span>
              <span style={{
                fontSize: '14px', fontWeight: active ? '600' : '400',
                fontFamily: "'Poppins', sans-serif"
              }}>{item.label}</span>
            </div>
          )
        })}
      </div>

      {/* FOOTER */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Base de Datos I - Proyecto Final<br/>
          Fernanda Navarro - 2026
        </p>
      </div>
    </div>
  )
}