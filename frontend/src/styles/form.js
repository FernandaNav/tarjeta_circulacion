import { colors, radius } from './theme'

export const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: colors.bgInput,
  border: `1.5px solid ${colors.border}`,
  borderRadius: radius.md,
  color: colors.textMain,
  fontSize: '13px', outline: 'none',
  fontFamily: "'Poppins', sans-serif",
  transition: 'border-color 0.15s'
}

export const labelStyle = {
  display: 'block', fontSize: '12px',
  color: colors.textSub, marginBottom: '6px',
  fontWeight: '600', letterSpacing: '0.3px'
}

export const fieldStyle = { marginBottom: '16px' }

export const btnPrimary = {
  padding: '9px 18px', borderRadius: radius.md, border: 'none',
  background: colors.primary, color: 'white',
  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  fontFamily: "'Poppins', sans-serif",
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  transition: 'all 0.15s'
}

export const btnSecondary = {
  padding: '9px 18px', borderRadius: radius.md,
  border: `1.5px solid ${colors.border}`,
  background: 'transparent', color: colors.textSub,
  cursor: 'pointer', fontSize: '13px',
  fontFamily: 'Inter, DM Sans, sans-serif',
  transition: 'all 0.15s'
}

export const btnDanger = {
  padding: '9px 18px', borderRadius: radius.md, border: 'none',
  background: colors.danger, color: 'white',
  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  fontFamily: 'Inter, DM Sans, sans-serif',
  transition: 'background 0.15s'
}