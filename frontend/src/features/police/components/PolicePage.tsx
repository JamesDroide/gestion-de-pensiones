import { useState } from 'react'
import { Plus, Search, Pencil, Shield, UserCheck, Clock, SlidersHorizontal, Download } from 'lucide-react'
import { usePolice, useCreatePolice, useUpdatePolice } from '../hooks/usePolice'
import { PoliceFormModal } from './PoliceFormModal'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { StatusBadge } from '@/shared/components/ui/StatusBadge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import type { Police, CreatePoliceInput } from '../types'

const PAGE_SIZE = 8

function avatarColor(name: string): string {
  const colors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
    '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

const TABLE_HEADERS = ['NOMBRE', 'PLACA/CÓDIGO', 'GRADO', 'TELÉFONO', 'ESTADO', '']

export function PolicePage() {
  const { data: policeList = [], isLoading } = usePolice()
  const createMutation = useCreatePolice()
  const updateMutation = useUpdatePolice()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Police | undefined>()
  const [page, setPage] = useState(1)

  const filtered = policeList.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.badge_code.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = async (data: CreatePoliceInput) => {
    await createMutation.mutateAsync(data)
    setModalOpen(false)
  }

  const handleUpdate = async (data: CreatePoliceInput) => {
    if (!editTarget) return
    await updateMutation.mutateAsync({ id: editTarget.id, input: data })
    setEditTarget(undefined)
  }

  const totalActive = policeList.filter(p => p.is_active).length

  return (
    <div>
      <PageHeader
        title="Pensionistas Policías"
        description="Gestión de pensionistas del menú policial"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 font-semibold text-white rounded-full cursor-pointer"
            style={{
              backgroundColor: '#6366F1',
              height: '40px',
              padding: '0 20px',
              fontSize: '13.5px',
              border: 'none',
              transition: 'background-color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4F46E5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6366F1')}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            Nuevo pensionista
          </button>
        }
      />

      {/* Barra de búsqueda y acciones */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1" style={{ maxWidth: '320px' }}>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: '15px', height: '15px', color: '#94A3B8' }}
          />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre o placa..."
            className="w-full rounded-xl border bg-white outline-none"
            style={{
              height: '40px',
              paddingLeft: '40px',
              paddingRight: '16px',
              fontSize: '13.5px',
              borderColor: '#E2E8F0',
              color: '#1E293B',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#6366F1'
              e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#E2E8F0'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <button
          className="flex items-center justify-center rounded-xl border bg-white cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            borderColor: '#E2E8F0',
            color: '#64748B',
            transition: 'background-color 150ms, color 150ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#F8FAFC'
            e.currentTarget.style.color = '#1E293B'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.color = '#64748B'
          }}
          title="Filtros"
        >
          <SlidersHorizontal style={{ width: '15px', height: '15px' }} />
        </button>

        <button
          className="flex items-center justify-center rounded-xl border bg-white cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            borderColor: '#E2E8F0',
            color: '#64748B',
            transition: 'background-color 150ms, color 150ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#F8FAFC'
            e.currentTarget.style.color = '#1E293B'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.color = '#64748B'
          }}
          title="Exportar"
        >
          <Download style={{ width: '15px', height: '15px' }} />
        </button>
      </div>

      {/* Contenido: tabla o estados alternativos */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay policías registrados'}
          description={search ? 'Intenta con otro nombre o placa' : 'Registra el primer pensionista policial'}
          action={
            !search ? (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 font-semibold text-white rounded-full cursor-pointer"
                style={{
                  backgroundColor: '#6366F1',
                  height: '40px',
                  padding: '0 20px',
                  fontSize: '13.5px',
                  border: 'none',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4F46E5')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6366F1')}
              >
                <Plus style={{ width: '15px', height: '15px' }} />
                Nuevo pensionista
              </button>
            ) : undefined
          }
        />
      ) : (
        <div
          className="bg-white overflow-hidden"
          style={{
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                {TABLE_HEADERS.map((h, idx) => (
                  <th
                    key={idx}
                    className="text-left font-semibold"
                    style={{
                      padding: '12px 20px',
                      fontSize: '11px',
                      color: '#94A3B8',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((officer, index) => (
                <tr
                  key={officer.id}
                  style={{
                    borderBottom: index < paginated.length - 1 ? '1px solid #F8FAFC' : 'none',
                    transition: 'background-color 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                >
                  {/* Nombre con avatar */}
                  <td style={{ padding: '12px 20px' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: avatarColor(officer.full_name),
                          color: '#ffffff',
                          fontSize: '11px',
                        }}
                      >
                        {getInitials(officer.full_name)}
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: '#1E293B', fontSize: '13.5px' }}
                      >
                        {officer.full_name}
                      </span>
                    </div>
                  </td>

                  {/* Placa/Código */}
                  <td style={{ padding: '12px 20px' }}>
                    <span
                      className="font-mono"
                      style={{ color: '#64748B', fontSize: '12px' }}
                    >
                      {officer.badge_code}
                    </span>
                  </td>

                  {/* Grado */}
                  <td style={{ padding: '12px 20px', color: '#475569', fontSize: '13.5px' }}>
                    {officer.rank ?? '—'}
                  </td>

                  {/* Teléfono */}
                  <td style={{ padding: '12px 20px', color: '#64748B', fontSize: '13.5px' }}>
                    {officer.phone ?? '—'}
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '12px 20px' }}>
                    <StatusBadge status={officer.is_active ? 'active' : 'inactive'} />
                  </td>

                  {/* Acción editar */}
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => setEditTarget(officer)}
                      className="flex items-center justify-center rounded-lg cursor-pointer"
                      style={{
                        width: '30px',
                        height: '30px',
                        color: '#94A3B8',
                        backgroundColor: 'transparent',
                        border: 'none',
                        marginLeft: 'auto',
                        transition: 'background-color 150ms, color 150ms',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#EEF2FF'
                        e.currentTarget.style.color = '#4F46E5'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#94A3B8'
                      }}
                      title="Editar"
                    >
                      <Pencil style={{ width: '14px', height: '14px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <p style={{ color: '#64748B', fontSize: '12px' }}>
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} pensionistas
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: '14px',
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                  backgroundColor: 'transparent',
                  transition: 'background-color 150ms',
                }}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="flex items-center justify-center rounded-lg font-semibold cursor-pointer"
                  style={
                    n === page
                      ? {
                          width: '28px',
                          height: '28px',
                          fontSize: '12px',
                          backgroundColor: '#6366F1',
                          color: '#ffffff',
                          border: 'none',
                        }
                      : {
                          width: '28px',
                          height: '28px',
                          fontSize: '12px',
                          color: '#64748B',
                          border: '1px solid #E2E8F0',
                          backgroundColor: 'transparent',
                          transition: 'background-color 150ms',
                        }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: '14px',
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                  backgroundColor: 'transparent',
                  transition: 'background-color 150ms',
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas estadísticas */}
      {!isLoading && (
        <div
          className="grid mt-6"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
        >
          {/* Total Policías */}
          <div
            className="flex items-center gap-4 rounded-2xl"
            style={{
              backgroundColor: '#6366F1',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: 'rgba(255,255,255,0.20)',
              }}
            >
              <Shield style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <p
                className="font-bold text-white tracking-tight"
                style={{ fontSize: '26px', lineHeight: 1 }}
              >
                {policeList.length}
              </p>
              <p
                className="font-medium mt-1"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}
              >
                Total Policías
              </p>
            </div>
          </div>

          {/* Activos Hoy */}
          <div
            className="flex items-center gap-4 rounded-2xl"
            style={{
              backgroundColor: '#10B981',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: 'rgba(255,255,255,0.20)',
              }}
            >
              <UserCheck style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <p
                className="font-bold text-white tracking-tight"
                style={{ fontSize: '26px', lineHeight: 1 }}
              >
                {totalActive}
              </p>
              <p
                className="font-medium mt-1"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}
              >
                Activos Hoy
              </p>
            </div>
          </div>

          {/* Próximos Pagos */}
          <div
            className="flex items-center gap-4 rounded-2xl"
            style={{
              backgroundColor: '#F59E0B',
              padding: '18px 20px',
              boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: 'rgba(255,255,255,0.20)',
              }}
            >
              <Clock style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <p
                className="font-bold text-white tracking-tight"
                style={{ fontSize: '26px', lineHeight: 1 }}
              >
                —
              </p>
              <p
                className="font-medium mt-1"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}
              >
                Próximos Pagos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo pensionista */}
      {modalOpen && (
        <PoliceFormModal
          onSubmit={handleCreate}
          onClose={() => setModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Modal editar pensionista */}
      {editTarget && (
        <PoliceFormModal
          initial={editTarget}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(undefined)}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  )
}
