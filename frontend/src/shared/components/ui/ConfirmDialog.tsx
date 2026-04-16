// Diálogo de confirmación para acciones destructivas
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  children: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4"
            style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FEF2F2' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#1E293B' }}>{title}</h3>
                <p className="text-sm" style={{ color: '#64748B' }}>{description}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 text-sm font-medium rounded-xl border transition-all duration-150 cursor-pointer"
                style={{ height: '40px', borderColor: '#E2E8F0', color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              >
                Cancelar
              </button>
              <button
                onClick={() => { onConfirm(); setOpen(false) }}
                className="px-4 text-sm font-semibold text-white rounded-xl transition-all duration-150 cursor-pointer"
                style={{ height: '40px', backgroundColor: '#EF4444' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#DC2626')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#EF4444')}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
