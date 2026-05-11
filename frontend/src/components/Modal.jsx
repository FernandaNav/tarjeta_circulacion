import { colors, shadows, radius } from '../styles/theme'

export default function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,26,46,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: colors.bgCard,
        borderRadius: radius.lg,
        padding: '24px',
        width: '480px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: shadows.dropdown,
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: colors.textMain }}>{title}</h2>
          <button onClick={onClose} style={{
            background: colors.bgInput, border: 'none',
            color: colors.textSub, borderRadius: radius.sm,
            width: '30px', height: '30px', cursor: 'pointer',
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.dangerBg; e.currentTarget.style.color = colors.danger }}
            onMouseLeave={e => { e.currentTarget.style.background = colors.bgInput; e.currentTarget.style.color = colors.textSub }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}