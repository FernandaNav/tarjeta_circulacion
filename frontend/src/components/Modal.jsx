export default function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1B2637',
        border: '1px solid rgba(119,141,169,0.2)',
        borderRadius: '14px',
        padding: '24px',
        width: '500px',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#f0f2f5' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'rgba(119,141,169,0.1)', border: 'none',
            color: '#778DA9', borderRadius: '6px',
            width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px'
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}