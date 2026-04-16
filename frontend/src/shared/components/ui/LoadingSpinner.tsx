// Spinner de carga elegante con color del sistema
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 20, md: 36, lg: 56 }
  const d = dims[size]

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <style>{`
        @keyframes spin-smooth {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-ring {
          animation: spin-smooth 0.8s cubic-bezier(0.4,0,0.2,1) infinite;
        }
      `}</style>
      <div
        className="spinner-ring rounded-full"
        style={{
          width: d,
          height: d,
          border: `${size === 'sm' ? 2 : 3}px solid #E2E8F0`,
          borderTopColor: '#6366F1',
          borderRightColor: '#818CF8',
        }}
      />
      <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Cargando...</p>
    </div>
  )
}
