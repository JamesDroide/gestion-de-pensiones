import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { PensionerWithDebt } from '../types'
import { usePensionersWithDebt } from '../hooks/usePayments'
import { PaymentModal } from './PaymentModal'
import { NotifyActions } from './NotifyActions'

const PAYMENT_MODE_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
}

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

function formatLastPayment(isoDate: string | null, amount: string | null): string {
  if (!isoDate) return 'Sin pagos'
  const d = new Date(isoDate)
  const day = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  const amt = amount ? ` — S/ ${parseFloat(amount).toFixed(2)}` : ''
  return `${day}${amt}`
}

const PAGE_SIZE = 8

export function PensionersTable() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedPensioner, setSelectedPensioner] = useState<PensionerWithDebt | null>(null)

  const { data: pensioners = [], isLoading } = usePensionersWithDebt()

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return pensioners
    return pensioners.filter(c =>
      c.full_name.toLowerCase().includes(q) || c.id_code.toLowerCase().includes(q)
    )
  }, [pensioners, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Cabecera con búsqueda */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
              Pensionistas
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
              {pensioners.length} pensionistas activos
            </p>
          </div>

          {/* Búsqueda */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: '#94A3B8',
            }} />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: '36px', paddingRight: '12px',
                height: '38px', border: '1.5px solid #E2E8F0',
                borderRadius: '10px', fontSize: '13px', color: '#0F172A',
                outline: 'none', backgroundColor: '#F8FAFC',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.backgroundColor = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC' }}
            />
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #E2E8F0', borderTopColor: '#6366F1',
              animation: 'spin 0.75s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>Cargando pensionistas...</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
                {['Pensionista', 'Modalidad', 'Deuda Acumulada', 'Último Pago', 'Estado', 'Acción', 'Notificar'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 16px',
                    fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#94A3B8',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '13px' }}>
                    {search ? 'Sin resultados para esa búsqueda' : 'Sin pensionistas registrados'}
                  </td>
                </tr>
              ) : paginated.map(c => {
                const debt = parseFloat(c.debt_balance) || 0
                const hasDebt = debt > 0
                return (
                  <tr
                    key={c.pensioner_id}
                    style={{ borderBottom: '1px solid #F8FAFC', transition: 'background-color 120ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(99,102,241,0.03)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                  >
                    {/* Nombre + avatar */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          backgroundColor: avatarColor(c.full_name),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                        }}>
                          {getInitials(c.full_name)}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', margin: 0 }}>
                            {c.full_name}
                          </p>
                          <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', margin: 0 }}>
                            {c.id_code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Modalidad */}
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>
                      {PAYMENT_MODE_LABELS[c.payment_mode] ?? c.payment_mode}
                    </td>

                    {/* Deuda */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 700,
                        color: hasDebt ? '#EF4444' : '#10B981',
                      }}>
                        {hasDebt ? `S/ ${debt.toFixed(2)}` : 'Al día'}
                      </span>
                    </td>

                    {/* Último pago */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                      {formatLastPayment(c.last_payment_date, c.last_payment_amount)}
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '12px 16px' }}>
                      {hasDebt ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '999px',
                          backgroundColor: '#FEE2E2', color: '#DC2626',
                          fontSize: '11px', fontWeight: 700,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                          Con Deuda
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '999px',
                          backgroundColor: '#DCFCE7', color: '#15803D',
                          fontSize: '11px', fontWeight: 700,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                          Al día
                        </span>
                      )}
                    </td>

                    {/* Acción */}
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setSelectedPensioner(c)}
                        style={{
                          fontSize: '12px', fontWeight: 600,
                          border: `1.5px solid ${hasDebt ? '#6366F1' : '#E2E8F0'}`,
                          color: hasDebt ? '#6366F1' : '#94A3B8',
                          backgroundColor: 'transparent',
                          borderRadius: '8px', padding: '6px 14px',
                          cursor: 'pointer', transition: 'all 120ms',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = hasDebt ? '#EEF2FF' : '#F8FAFC'
                        }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {hasDebt ? 'Registrar Pago' : 'Ver detalle'}
                      </button>
                    </td>

                    {/* Notificar */}
                    <td style={{ padding: '12px 16px' }}>
                      <NotifyActions
                        type="pensioner"
                        id={c.pensioner_id}
                        fullName={c.full_name}
                        phone={c.phone}
                        debtBalance={c.debt_balance}
                        lastPaymentAmount={c.last_payment_amount}
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
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #F1F5F9',
          }}>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{
                  width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  backgroundColor: 'transparent', fontSize: '12px', color: '#64748B',
                  cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
                }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    border: n === page ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: n === page ? '#6366F1' : 'transparent',
                    fontSize: '12px', fontWeight: n === page ? 700 : 400,
                    color: n === page ? '#fff' : '#64748B', cursor: 'pointer',
                  }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{
                  width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  backgroundColor: 'transparent', fontSize: '12px', color: '#64748B',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
                }}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de cobro */}
      {selectedPensioner && (
        <PaymentModal
          pensioner={selectedPensioner}
          onClose={() => setSelectedPensioner(null)}
        />
      )}
    </>
  )
}
