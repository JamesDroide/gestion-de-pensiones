import { useState, useEffect, useCallback } from 'react'
import {
  X,
  Coffee,
  Sun,
  Moon,
  Check,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Banknote,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import type { PensionerWithDebt } from '../types'
import { usePensionerPaymentSummary, useRegisterPensionerPayment } from '../hooks/usePayments'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function currentMonthStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  return `${MONTHS_ES[parseInt(m, 10) - 1]} ${y}`
}

function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d, 10)} ${MONTHS_ES[parseInt(m, 10) - 1].slice(0, 3)}`
}

function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function n(val: string | number | undefined): number {
  return parseFloat(String(val ?? '0')) || 0
}

// ─── MealPill ─────────────────────────────────────────────────────────────────

function MealPill({ count }: { count: number }) {
  if (count > 0) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        backgroundColor: 'rgba(99,102,241,0.10)', borderRadius: '8px',
        padding: '4px 10px', color: '#6366F1',
      }}>
        <Check style={{ width: '13px', height: '13px', strokeWidth: 2.8 }} />
        {count > 1 && (
          <span style={{
            fontSize: '10px', fontWeight: 700, backgroundColor: '#6366F1',
            color: '#FFFFFF', borderRadius: '999px', padding: '1px 5px', lineHeight: 1.4,
          }}>
            ×{count}
          </span>
        )}
      </span>
    )
  }
  return <span style={{ color: '#CBD5E1', fontSize: '16px' }}>—</span>
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  pensioner: PensionerWithDebt
  onClose: () => void
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PaymentModal({ pensioner, onClose }: Props) {
  const [month, setMonth] = useState(currentMonthStr)
  const [payAmount, setPayAmount] = useState('')
  const [payMode, setPayMode] = useState<'cash' | 'yape'>('cash')
  const [showPayForm, setShowPayForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { data: summary, isLoading, isError, refetch, isFetching } = usePensionerPaymentSummary(
    pensioner.pensioner_id,
    month,
  )

  const registerPayment = useRegisterPensionerPayment()

  // Cierra con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Bloquea scroll del body
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose() },
    [onClose],
  )

  const debtBalance = n(summary?.debt_balance)
  const totalConsumed = n(summary?.total_consumed)
  const totalPaid = n(summary?.total_paid)

  function handlePay() {
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) return
    registerPayment.mutate(
      { pensionerId: pensioner.pensioner_id, input: { amount, payment_type: payMode } },
      {
        onSuccess: () => {
          setSuccessMsg(`Pago de S/ ${amount.toFixed(2)} registrado`)
          setPayAmount('')
          setShowPayForm(false)
          setTimeout(() => setSuccessMsg(''), 4000)
        },
      },
    )
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '860px', backgroundColor: '#FFFFFF',
        borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 32px)', overflow: 'hidden',
      }}>

        {/* ═══ HEADER ═══ */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #FAFBFF 0%, #F5F3FF 100%)',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {pensioner.full_name}
              </h2>
              <span style={{
                backgroundColor: '#F1F5F9', color: '#475569',
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const,
                letterSpacing: '0.07em', borderRadius: '999px', padding: '3px 10px',
              }}>
                Pensionista
              </span>
              <span style={{
                backgroundColor: '#EEF2FF', color: '#6366F1',
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const,
                letterSpacing: '0.07em', borderRadius: '999px', padding: '3px 10px',
              }}>
                {PAYMENT_MODE_LABELS[pensioner.payment_mode] ?? pensioner.payment_mode}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
              {pensioner.id_code} — Módulo de Cobros
            </p>
          </div>

          {/* Controles: mes + refrescar + cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* Navegador de mes */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0',
              borderRadius: '12px', padding: '4px',
            }}>
              <button type="button" onClick={() => setMonth(prev => prevMonth(prev))}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                  backgroundColor: 'transparent', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#64748B',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E2E8F0' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <span style={{
                fontSize: '12.5px', fontWeight: 600, color: '#0F172A',
                minWidth: '110px', textAlign: 'center', padding: '0 4px',
              }}>
                {monthLabel(month)}
              </span>
              <button type="button" onClick={() => setMonth(prev => nextMonth(prev))}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                  backgroundColor: 'transparent', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#64748B',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E2E8F0' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Refrescar */}
            <button type="button" onClick={() => refetch()} disabled={isFetching}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isFetching ? 'not-allowed' : 'pointer', color: '#64748B',
                opacity: isFetching ? 0.6 : 1,
              }}
              onMouseEnter={e => {
                if (!isFetching) {
                  e.currentTarget.style.backgroundColor = '#EEF2FF'
                  e.currentTarget.style.borderColor = '#C7D2FE'
                  e.currentTarget.style.color = '#6366F1'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFC'
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.color = '#64748B'
              }}
            >
              <RefreshCw style={{
                width: '15px', height: '15px',
                animation: isFetching ? 'spin 0.75s linear infinite' : 'none',
              }} />
            </button>

            {/* Cerrar */}
            <button type="button" onClick={onClose}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748B',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#FEF2F2'
                e.currentTarget.style.borderColor = '#FECACA'
                e.currentTarget.style.color = '#EF4444'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFC'
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.color = '#64748B'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* ═══ CUERPO ═══ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Mensaje de éxito */}
          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0',
              borderRadius: '12px', padding: '12px 16px',
            }}>
              <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803D', margin: 0 }}>{successMsg}</p>
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid #E2E8F0', borderTopColor: '#6366F1',
                animation: 'spin 0.75s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>
              Error al cargar el resumen
            </div>
          ) : !summary ? null : (
            <>
              {/* ── Resumen financiero ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Total consumido', value: `S/ ${totalConsumed.toFixed(2)}`, color: '#0F172A', bg: '#F8FAFC', border: '#E2E8F0' },
                  { label: 'Total pagado', value: `S/ ${totalPaid.toFixed(2)}`, color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
                  {
                    label: 'Deuda pendiente',
                    value: `S/ ${Math.max(0, debtBalance).toFixed(2)}`,
                    color: debtBalance > 0 ? '#EF4444' : '#10B981',
                    bg: debtBalance > 0 ? '#FEF2F2' : '#F0FDF4',
                    border: debtBalance > 0 ? '#FECACA' : '#BBF7D0',
                  },
                ].map(card => (
                  <div key={card.label} style={{
                    backgroundColor: card.bg, border: `1.5px solid ${card.border}`,
                    borderRadius: '14px', padding: '14px 16px',
                  }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#94A3B8', margin: '0 0 6px' }}>
                      {card.label}
                    </p>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: card.color, margin: 0, letterSpacing: '-0.02em' }}>
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Tabla de consumos ── */}
              {summary.consumptions.length > 0 ? (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#64748B', margin: '0 0 10px' }}>
                    Consumos del mes
                  </p>
                  <div style={{
                    border: '1.5px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#FAFAFA' }}>
                          {[
                            { label: 'Fecha', align: 'left' as const },
                            { label: <><Coffee style={{ width: '10px', height: '10px', display: 'inline' }} /> Desayuno</>, align: 'center' as const },
                            { label: <><Sun style={{ width: '10px', height: '10px', display: 'inline' }} /> Almuerzo</>, align: 'center' as const },
                            { label: <><Moon style={{ width: '10px', height: '10px', display: 'inline' }} /> Cena</>, align: 'center' as const },
                            { label: 'Extras', align: 'center' as const },
                            { label: 'Total del día', align: 'center' as const },
                          ].map((col, i) => (
                            <th key={i} style={{
                              padding: '9px 14px', fontSize: '10px', fontWeight: 700,
                              textTransform: 'uppercase' as const, letterSpacing: '0.07em',
                              color: '#64748B', textAlign: col.align,
                              borderBottom: '1.5px solid #E2E8F0',
                            }}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summary.consumptions.map((row, idx) => {
                          const isAlt = idx % 2 === 1
                          const bg = isAlt ? '#FAFCFF' : '#FFFFFF'
                          const extrasTotal = n(row.extras_total)
                          return (
                            <tr key={row.id} style={{ backgroundColor: bg }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F5F3FF' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = bg }}
                            >
                              <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A', borderBottom: '1px solid #F1F5F9' }}>
                                {formatDate(row.date)}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                <MealPill count={row.breakfast_count} />
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                <MealPill count={row.lunch_count} />
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                <MealPill count={row.dinner_count} />
                              </td>
                              <td style={{ padding: '8px 14px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                                {row.extras.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    {row.extras.map((e, i) => (
                                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#B45309' }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B', flexShrink: 0, display: 'inline-block' }} />
                                        <span style={{ flex: 1 }}>{e.dish_name}</span>
                                        <span style={{ fontWeight: 700 }}>S/ {n(e.unit_price_snapshot).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '12.5px', color: extrasTotal > 0 ? '#F59E0B' : '#CBD5E1', display: 'block', textAlign: 'center', fontWeight: extrasTotal > 0 ? 600 : 400 }}>
                                    {extrasTotal > 0 ? `S/ ${extrasTotal.toFixed(2)}` : '—'}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #F1F5F9' }}>
                                S/ {n(row.daily_total).toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: '13px' }}>
                  Sin consumos registrados en {monthLabel(month)}
                </div>
              )}

              {/* ── Historial de pagos ── */}
              {summary.payments.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#64748B', margin: '0 0 10px' }}>
                    Pagos registrados este mes
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {summary.payments.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
                        borderRadius: '10px', padding: '10px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Banknote style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                              {p.payment_type === 'cash' ? 'Efectivo' : 'Yape'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                              {formatDateTime(p.created_at)}
                              {p.description && ` — ${p.description}`}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A' }}>
                          + S/ {n(p.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Aviso de deuda que pasa al siguiente mes ── */}
              {debtBalance > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  backgroundColor: '#FFFBEB', border: '1px solid #FDE68A',
                  borderRadius: '12px', padding: '12px 16px',
                }}>
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                    Si la deuda de <strong>S/ {debtBalance.toFixed(2)}</strong> no se regulariza antes del inicio del próximo mes, se acumulará automáticamente.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ═══ FOOTER — pago ═══ */}
        {!isLoading && !isError && summary && (
          <div style={{
            padding: '16px 24px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            flexShrink: 0,
          }}>
            {!showPayForm ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp style={{ width: '18px', height: '18px', color: '#6366F1' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#94A3B8', margin: '0 0 2px' }}>
                      Deuda actual
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                      {monthLabel(month)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: debtBalance > 0 ? '#EF4444' : '#10B981', letterSpacing: '-0.03em' }}>
                    S/ {Math.max(0, debtBalance).toFixed(2)}
                  </span>
                  {debtBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPayForm(true)}
                      style={{
                        backgroundColor: '#10B981', color: '#fff', border: 'none',
                        borderRadius: '12px', padding: '10px 22px',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'background-color 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#059669' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#10B981' }}
                    >
                      <Banknote style={{ width: '16px', height: '16px' }} />
                      Registrar Pago
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Formulario de pago */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Monto */}
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                      Monto a pagar
                    </label>
                    <div style={{ position: 'relative' as const }}>
                      <span style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', fontWeight: 600, color: '#64748B' }}>S/</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder={debtBalance > 0 ? debtBalance.toFixed(2) : '0.00'}
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        style={{
                          width: '100%', boxSizing: 'border-box' as const,
                          paddingLeft: '32px', paddingRight: '12px',
                          height: '44px', border: '1.5px solid #E2E8F0',
                          borderRadius: '10px', fontSize: '15px', fontWeight: 600,
                          color: '#0F172A', outline: 'none',
                          backgroundColor: '#fff',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#6366F1' }}
                        onBlur={e => { e.target.style.borderColor = '#E2E8F0' }}
                      />
                    </div>
                  </div>

                  {/* Modalidad de pago */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                      Tipo
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['cash', 'yape'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPayMode(type)}
                          style={{
                            height: '44px', padding: '0 14px', border: '1.5px solid',
                            borderColor: payMode === type ? '#6366F1' : '#E2E8F0',
                            borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: payMode === type ? '#EEF2FF' : '#fff',
                            color: payMode === type ? '#6366F1' : '#64748B',
                            transition: 'all 120ms',
                          }}
                        >
                          {type === 'cash' ? 'Efectivo' : 'Yape'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingBottom: '0px' }}>
                    <button
                      type="button"
                      onClick={() => { setShowPayForm(false); setPayAmount('') }}
                      style={{
                        height: '44px', padding: '0 16px', border: '1.5px solid #E2E8F0',
                        borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                        color: '#64748B', cursor: 'pointer', backgroundColor: '#fff',
                        marginTop: '22px',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      disabled={!payAmount || parseFloat(payAmount) <= 0 || registerPayment.isPending}
                      style={{
                        height: '44px', padding: '0 20px',
                        backgroundColor: '#10B981', color: '#fff', border: 'none',
                        borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: !payAmount || parseFloat(payAmount) <= 0 || registerPayment.isPending ? 'not-allowed' : 'pointer',
                        opacity: !payAmount || parseFloat(payAmount) <= 0 || registerPayment.isPending ? 0.6 : 1,
                        marginTop: '22px',
                        transition: 'background-color 150ms',
                      }}
                      onMouseEnter={e => { if (!registerPayment.isPending) e.currentTarget.style.backgroundColor = '#059669' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#10B981' }}
                    >
                      {registerPayment.isPending ? 'Guardando...' : 'Confirmar Pago'}
                    </button>
                  </div>
                </div>

                {/* Aviso si pago parcial */}
                {payAmount && parseFloat(payAmount) > 0 && parseFloat(payAmount) < debtBalance && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#FFFBEB', border: '1px solid #FDE68A',
                    borderRadius: '8px', padding: '8px 12px',
                  }}>
                    <AlertCircle style={{ width: '14px', height: '14px', color: '#D97706', flexShrink: 0 }} />
                    <p style={{ fontSize: '11.5px', color: '#92400E', margin: 0 }}>
                      Queda pendiente <strong>S/ {(debtBalance - parseFloat(payAmount)).toFixed(2)}</strong> que se registrará como deuda.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
