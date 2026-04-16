type StatusType = 'active' | 'inactive' | 'paid' | 'pending' | 'debt'
type ModalidadType = 'daily' | 'weekly' | 'biweekly' | 'monthly'

interface StatusBadgeProps {
  status?: StatusType
  modalidad?: ModalidadType
  type?: 'status' | 'modalidad'
}

const statusConfig: Record<StatusType, { label: string; bg: string; color: string; dot: string }> = {
  active:   { label: 'Activo',    bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
  inactive: { label: 'Inactivo',  bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
  paid:     { label: 'Al día',    bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
  pending:  { label: 'Pendiente', bg: '#FEF3C7', color: '#B45309', dot: '#F59E0B' },
  debt:     { label: 'Con deuda', bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' },
}

const modalidadConfig: Record<ModalidadType, { label: string; bg: string; color: string; dot: string }> = {
  monthly:   { label: 'Mensual',   bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  daily:     { label: 'Diario',    bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  weekly:    { label: 'Semanal',   bg: '#FEF9C3', color: '#854D0E', dot: '#EAB308' },
  biweekly:  { label: 'Quincenal', bg: '#CCFBF1', color: '#0F766E', dot: '#14B8A6' },
}

export function StatusBadge({ status, modalidad, type = 'status' }: StatusBadgeProps) {
  let cfg: { label: string; bg: string; color: string; dot: string }

  if (type === 'modalidad' && modalidad) {
    cfg = modalidadConfig[modalidad]
  } else if (status) {
    cfg = statusConfig[status]
  } else {
    return null
  }

  const { label, bg, color, dot } = cfg

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      {label}
    </span>
  )
}
