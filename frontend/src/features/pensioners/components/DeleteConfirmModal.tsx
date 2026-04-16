import { Trash2 } from 'lucide-react'
import type { Pensionista } from '../types'

interface Props {
  pensioner: Pensionista
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirmModal({ pensioner, isLoading, onConfirm, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '420px',
          margin: '0 16px', padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icono */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          backgroundColor: '#FEF2F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '18px',
        }}>
          <Trash2 size={24} color="#EF4444" />
        </div>

        {/* Título y mensaje */}
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>
          Eliminar pensionista
        </h3>
        <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 6px', lineHeight: 1.6 }}>
          ¿Estás seguro de que deseas eliminar a{' '}
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{pensioner.full_name}</span>?
        </p>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 28px' }}>
          Esta acción no se puede deshacer.
        </p>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1, height: '42px', borderRadius: '10px',
              border: '1.5px solid #E2E8F0', backgroundColor: 'transparent',
              fontSize: '14px', fontWeight: 600, color: '#64748B', cursor: 'pointer',
              transition: 'background-color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1, height: '42px', borderRadius: '10px',
              border: 'none', backgroundColor: isLoading ? '#FCA5A5' : '#EF4444',
              fontSize: '14px', fontWeight: 600, color: '#FFFFFF', cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 150ms',
            }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#DC2626' }}
            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#EF4444' }}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
