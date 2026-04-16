// Estado vacío premium con ilustración SVG inline
interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}
    >
      {/* Ilustración */}
      <div style={{ position: 'relative', marginBottom: '28px' }}>
        {/* Anillos decorativos */}
        <div style={{
          position: 'absolute', inset: '-20px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(99,102,241,0.15)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: '-8px',
          borderRadius: '50%',
          border: '1.5px solid rgba(99,102,241,0.10)',
          pointerEvents: 'none',
        }} />

        {/* Círculo principal */}
        <div style={{
          width: '96px', height: '96px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99,102,241,0.14)',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="32" height="28" rx="4" fill="#C7D2FE" />
            <rect x="12" y="15" width="24" height="3" rx="1.5" fill="#818CF8" />
            <rect x="12" y="21" width="16" height="2.5" rx="1.25" fill="#A5B4FC" />
            <rect x="12" y="26" width="20" height="2.5" rx="1.25" fill="#A5B4FC" />
            <circle cx="35" cy="35" r="9" fill="#6366F1" />
            <path d="M31.5 35h7M35 31.5v7" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Texto */}
      <h3 style={{
        fontSize: '17px',
        fontWeight: 700,
        color: '#0F172A',
        margin: '0 0 8px',
        lineHeight: 1.3,
      }}>
        {title}
      </h3>

      {description && (
        <p style={{
          fontSize: '13.5px',
          color: '#94A3B8',
          margin: '0',
          lineHeight: 1.6,
          maxWidth: '280px',
        }}>
          {description}
        </p>
      )}

      {/* Botón — separado con línea divisoria sutil */}
      {action && (
        <>
          <div style={{
            width: '48px',
            height: '1px',
            backgroundColor: '#E2E8F0',
            margin: '28px auto 28px',
            borderRadius: '999px',
          }} />
          {action}
        </>
      )}
    </div>
  )
}
