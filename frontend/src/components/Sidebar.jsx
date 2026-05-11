import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { icon: '⊞', path: '/', label: 'Inicio' },
  { icon: '◫', path: '/tarjetas', label: 'Tarjetas' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      width: '64px',
      background: '#08111A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: '8px',
      borderRight: '1px solid rgba(119,141,169,0.1)',
      minHeight: '100vh'
    }}>
      <div style={{
        width: '36px', height: '36px',
        background: '#415A77',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px',
        fontSize: '13px', fontWeight: '600', color: '#E0E1DD'
      }}>
        TC
      </div>

      {navItems.map((item) => (
        <div
          key={item.path}
          title={item.label}
          onClick={() => navigate(item.path)}
          style={{
            width: '40px', height: '40px',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            background: location.pathname === item.path ? '#415A77' : 'transparent',
            color: location.pathname === item.path ? '#f0f2f5' : '#778DA9',
            transition: 'all 0.2s'
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  )
}