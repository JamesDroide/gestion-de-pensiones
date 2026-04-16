import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { PoliceWithDebt } from '../types'
import { usePoliceWithDebt } from '../hooks/usePolicePayments'
import { PolicePaymentModal } from './PolicePaymentModal'
import { NotifyActions } from './NotifyActions'

function avatarColor(name: string): string {
  const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}
function formatLastPayment(isoDate: string | null, amount: string | null): string {
  if (!isoDate) return 'Sin pagos'
  const d = new Date(isoDate)
  const day = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  const amt = amount ? ` — S/ ${parseFloat(amount).toFixed(2)}` : ''
  return `${day}${amt}`
}

const PAGE_SIZE = 8

export function PoliciesTable() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOfficer, setSelectedOfficer] = useState<PoliceWithDebt | null>(null)

  const { data: officers = [], isLoading } = usePoliceWithDebt()

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return officers
    return officers.filter(o =>
      o.full_name.toLowerCase().includes(q) ||
      o.badge_code.toLowerCase().includes(q) ||
      (o.rank ?? '').toLowerCase().includes(q)
    )
  }, [officers, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(value: string) { setSearch(value); setPage(1) }

  return (
    <>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Cabecera */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Pensionistas Policías</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{officers.length} policías activos</p>
          </div>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8' }} />
            <input
              type="text" placeholder="Buscar por nombre, placa o rango..."
              value={search} onChange={e => handleSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '12px', height: '38px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#0F172A', outline: 'none', backgroundColor: '#F8FAFC' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.backgroundColor = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC' }}
            />
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #DBEAFE', borderTopColor: '#3B82F6', animation: 'spin 0.75s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>Cargando policías...</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
                {['Policía', 'Placa / Rango', 'Deuda Acumulada', 'Último Pago', 'Estado', 'Acción', 'Notificar'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#94A3B8' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '13px' }}>
                    {search ? 'Sin resultados para esa búsqueda' : 'Sin policías registrados'}
                  </td>
                </tr>
              ) : paginated.map(o => {
                const debt = parseFloat(o.debt_balance) || 0
                const hasDebt = debt > 0
                return (
                  <tr key={o.police_id}
                    style={{ borderBottom: '1px solid #F8FAFC', transition: 'background-color 120ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.03)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: avatarColor(o.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                          {getInitials(o.full_name)}
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', margin: 0 }}>{o.full_name}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#1E293B', margin: '0 0 2px', fontWeight: 600 }}>{o.badge_code}</p>
                      {o.rank && <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{o.rank}</p>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: hasDebt ? '#EF4444' : '#10B981' }}>
                        {hasDebt ? `S/ ${debt.toFixed(2)}` : 'Al día'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                      {formatLastPayment(o.last_payment_date, o.last_payment_amount)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {hasDebt ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 700 }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                          Con Deuda
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: 700 }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                          Al día
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSelectedOfficer(o)}
                        style={{ fontSize: '12px', fontWeight: 600, border: `1.5px solid ${hasDebt ? '#3B82F6' : '#E2E8F0'}`, color: hasDebt ? '#3B82F6' : '#94A3B8', backgroundColor: 'transparent', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', transition: 'all 120ms' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = hasDebt ? '#EFF6FF' : '#F8FAFC' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {hasDebt ? 'Registrar Pago' : 'Ver detalle'}
                      </button>
                    </td>

                    {/* Notificar */}
                    <td style={{ padding: '12px 16px' }}>
                      <NotifyActions
                        type="police"
                        id={o.police_id}
                        fullName={o.full_name}
                        phone={o.phone}
                        debtBalance={o.debt_balance}
                        lastPaymentAmount={o.last_payment_amount}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'transparent', fontSize: '12px', color: '#64748B', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button key={num} onClick={() => setPage(num)}
                  style={{ width: '28px', height: '28px', borderRadius: '8px', border: num === page ? 'none' : '1px solid #E2E8F0', backgroundColor: num === page ? '#3B82F6' : 'transparent', fontSize: '12px', fontWeight: num === page ? 700 : 400, color: num === page ? '#fff' : '#64748B', cursor: 'pointer' }}>
                  {num}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: 'transparent', fontSize: '12px', color: '#64748B', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>›</button>
            </div>
          </div>
        )}
      </div>

      {selectedOfficer && (
        <PolicePaymentModal officer={selectedOfficer} onClose={() => setSelectedOfficer(null)} />
      )}
    </>
  )
}
