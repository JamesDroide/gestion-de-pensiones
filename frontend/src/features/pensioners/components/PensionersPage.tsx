import { useState } from 'react'
import { Plus, Search, Pencil, Users, Shield, UserCheck, History, Trash2 } from 'lucide-react'
import { usePensioners, useCreatePensioner, useUpdatePensioner, useDeletePensioner } from '../hooks/usePensioners'
import { PensionerFormModal } from './PensionerFormModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ConsumptionHistoryModal } from '@/features/consumption/components/ConsumptionHistoryModal'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { StatusBadge } from '@/shared/components/ui/StatusBadge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import type { Pensionista, CreatePensionerInput } from '../types'

const PAGE_SIZE = 8

function avatarColor(name: string): string {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

const TABLE_HEADERS = ['Nombre', 'Tipo', 'DNI', 'Teléfono', 'Estado', '']

export function PensionersPage() {
  const { data: pensioners = [], isLoading } = usePensioners()
  const createMutation = useCreatePensioner()
  const updateMutation = useUpdatePensioner()
  const deleteMutation = useDeletePensioner()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Pensionista | undefined>()
  const [historyTarget, setHistoryTarget] = useState<Pensionista | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Pensionista | undefined>()
  const [page, setPage] = useState(1)

  const filtered = pensioners.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.dni.includes(search)
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = async (data: CreatePensionerInput) => {
    await createMutation.mutateAsync(data)
    setModalOpen(false)
  }

  const handleUpdate = async (data: CreatePensionerInput) => {
    if (!editTarget) return
    await updateMutation.mutateAsync({ id: editTarget.id, pensioner_type: editTarget.pensioner_type, input: data })
    setEditTarget(undefined)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync({ id: deleteTarget.id, pensioner_type: deleteTarget.pensioner_type })
    setDeleteTarget(undefined)
  }

  const totalActive = pensioners.filter(p => p.is_active).length
  const totalCiviles = pensioners.filter(p => p.pensioner_type === 'civil').length
  const totalPolicia = pensioners.filter(p => p.pensioner_type === 'police').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Pensionistas"
        description="Gestión de pensionistas y policiales"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white cursor-pointer transition-all duration-150"
            style={{ backgroundColor: '#6366F1', height: '40px', padding: '0 20px', borderRadius: '999px', border: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4F46E5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6366F1')}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Nuevo pensionista
          </button>
        }
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

        {/* Card: Total */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 22px 18px',
          boxShadow: '0 4px 16px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          borderTop: '4px solid #6366F1', minHeight: '118px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#EEF2FF', opacity: 0.7, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Total</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={16} color="#6366F1" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#6366F1', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px' }}>
              {pensioners.length}
            </p>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#6366F1', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '999px' }}>
              Pensionistas registrados
            </span>
          </div>
        </div>

        {/* Card: Pensionistas */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 22px 18px',
          boxShadow: '0 4px 16px rgba(100,116,139,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          borderTop: '4px solid #64748B', minHeight: '118px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F1F5F9', opacity: 0.7, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Pensionistas</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCheck size={16} color="#64748B" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#64748B', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px' }}>
              {totalCiviles}
            </p>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '999px' }}>
              Activos: {totalActive}
            </span>
          </div>
        </div>

        {/* Card: Policías */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 22px 18px',
          boxShadow: '0 4px 16px rgba(59,130,246,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          borderTop: '4px solid #3B82F6', minHeight: '118px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#EFF6FF', opacity: 0.7, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Policías</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={16} color="#3B82F6" />
            </div>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#3B82F6', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px' }}>
              {totalPolicia}
            </p>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#3B82F6', backgroundColor: '#DBEAFE', padding: '2px 8px', borderRadius: '999px' }}>
              Personal policial
            </span>
          </div>
        </div>

      </div>

      {/* Barra búsqueda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          id="search-wrapper"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '300px', height: '44px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '0 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 180ms, box-shadow 180ms',
          }}
          onFocus={() => {
            const el = document.getElementById('search-wrapper')
            if (el) { el.style.borderColor = '#6366F1'; el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)' }
          }}
          onBlur={() => {
            const el = document.getElementById('search-wrapper')
            if (el) { el.style.borderColor = '#E2E8F0'; el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }
          }}
        >
          <Search style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre o DNI..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '13px', color: '#1E293B', fontFamily: 'inherit',
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '18px', height: '18px', borderRadius: '50%',
                backgroundColor: '#E2E8F0', border: 'none', cursor: 'pointer',
                color: '#64748B', fontSize: '12px', lineHeight: 1, flexShrink: 0,
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#CBD5E1')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
        {search && (
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabla */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay pensionistas registrados'}
          description={search ? 'Intenta con otro nombre o DNI' : 'Registra el primer pensionista'}
          action={
            !search && (
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  height: '48px',
                  padding: '0 28px 0 20px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  transition: 'transform 150ms ease, box-shadow 150ms ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'
                }}
              >
                {/* Icono en círculo */}
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '26px', height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.22)',
                  flexShrink: 0,
                }}>
                  <Plus style={{ width: '14px', height: '14px' }} />
                </span>
                Nuevo pensionista
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white overflow-hidden" style={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
                {TABLE_HEADERS.map((h, i) => (
                  <th key={i} className="text-left text-xs font-semibold uppercase tracking-wide" style={{ padding: '12px 20px', color: '#94A3B8' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr
                  key={`${p.pensioner_type}-${p.id}`}
                  className="transition-colors duration-150"
                  style={{ borderBottom: '1px solid #F8FAFC' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                >
                  {/* Nombre + avatar */}
                  <td style={{ padding: '12px 20px' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center flex-shrink-0 text-white font-bold"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: avatarColor(p.full_name), fontSize: '12px' }}
                      >
                        {getInitials(p.full_name)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#1E293B' }}>{p.full_name}</span>
                    </div>
                  </td>

                  {/* Tipo badge */}
                  <td style={{ padding: '12px 20px' }}>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase"
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        ...(p.pensioner_type === 'police'
                          ? { backgroundColor: '#DBEAFE', color: '#1E40AF' }
                          : { backgroundColor: '#F1F5F9', color: '#475569' }),
                      }}
                    >
                      {p.pensioner_type === 'police'
                        ? <Shield style={{ width: '11px', height: '11px' }} />
                        : <Users style={{ width: '11px', height: '11px' }} />}
                      {p.pensioner_type === 'police' ? 'Policía' : 'Pensionista'}
                    </span>
                  </td>

                  {/* DNI */}
                  <td className="font-mono text-xs" style={{ padding: '12px 20px', color: '#64748B' }}>
                    {p.dni}
                  </td>

                  {/* Teléfono */}
                  <td className="text-sm" style={{ padding: '12px 20px', color: '#64748B' }}>
                    {p.phone || '—'}
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '12px 20px' }}>
                    <StatusBadge status={p.is_active ? 'active' : 'inactive'} />
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setHistoryTarget(p)}
                        className="flex items-center justify-center cursor-pointer transition-all duration-150"
                        style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#94A3B8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0FDF4'; e.currentTarget.style.color = '#10B981' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
                        title="Ver historial de consumo"
                      >
                        <History style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => setEditTarget(p)}
                        className="flex items-center justify-center cursor-pointer transition-all duration-150"
                        style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#94A3B8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
                        title="Editar"
                      >
                        <Pencil style={{ width: '14px', height: '14px' }} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="flex items-center justify-center cursor-pointer transition-all duration-150"
                        style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#94A3B8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#EF4444' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
                        title="Eliminar"
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9' }}>
            <p className="text-xs" style={{ color: '#64748B' }}>
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} pensionistas
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center text-xs cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#64748B', backgroundColor: 'transparent' }}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-150"
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    ...(n === page
                      ? { backgroundColor: '#6366F1', color: '#fff', border: 'none' }
                      : { border: '1px solid #E2E8F0', color: '#64748B', backgroundColor: 'transparent' }),
                  }}
                >{n}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center text-xs cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#64748B', backgroundColor: 'transparent' }}
              >›</button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {modalOpen && (
        <PensionerFormModal
          onSubmit={handleCreate}
          onClose={() => setModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      )}
      {editTarget && (
        <PensionerFormModal
          initial={editTarget}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(undefined)}
          isLoading={updateMutation.isPending}
        />
      )}
      {historyTarget && (
        <ConsumptionHistoryModal
          pensioner={historyTarget}
          onClose={() => setHistoryTarget(undefined)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          pensioner={deleteTarget}
          isLoading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(undefined)}
        />
      )}
    </div>
  )
}
