import { useState, useEffect, useCallback } from 'react'
import {
  X, Coffee, Sun, Moon, Check, TrendingUp, ChevronLeft, ChevronRight,
  Banknote, AlertCircle, CheckCircle2, RefreshCw, Ticket, Plus, Minus,
} from 'lucide-react'
import type { PoliceWithDebt } from '../types'
import { usePolicePaymentSummary, useRegisterPolicePayment } from '../hooks/usePolicePayments'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function currentMonthStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
function monthLabel(m: string): string {
  const [y, mo] = m.split('-')
  return `${MONTHS_ES[parseInt(mo, 10) - 1]} ${y}`
}
function prevMonth(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function nextMonth(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function formatDate(dateStr: string): string {
  const [, mo, d] = dateStr.split('-')
  return `${parseInt(d, 10)} ${MONTHS_ES[parseInt(mo, 10) - 1].slice(0, 3)}`
}
function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}
function n(val: string | number | undefined): number {
  return parseFloat(String(val ?? '0')) || 0
}

// ─── MealPill ─────────────────────────────────────────────────────────────────

function MealPill({ count }: { count: number }) {
  if (count > 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(99,102,241,0.10)', borderRadius: '8px', padding: '4px 10px', color: '#6366F1' }}>
      <Check style={{ width: '13px', height: '13px', strokeWidth: 2.8 }} />
      {count > 1 && (
        <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#6366F1', color: '#FFFFFF', borderRadius: '999px', padding: '1px 5px', lineHeight: 1.4 }}>
          ×{count}
        </span>
      )}
    </span>
  )
  return <span style={{ color: '#CBD5E1', fontSize: '16px' }}>—</span>
}

// ─── Counter ─────────────────────────────────────────────────────────────────

interface CounterProps {
  label: string
  sublabel: string
  value: number
  onChange: (v: number) => void
  color?: string
  plusDisabled?: boolean
}

function Counter({ label, sublabel, value, onChange, color = '#3B82F6', plusDisabled = false }: CounterProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: 0, textAlign: 'center' }}>
        {label}
      </p>
      <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>{sublabel}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            width: '34px', height: '34px', borderRadius: '8px',
            border: '1.5px solid #E2E8F0', backgroundColor: value === 0 ? '#F8FAFC' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: value === 0 ? 'not-allowed' : 'pointer',
            color: value === 0 ? '#CBD5E1' : '#64748B',
          }}
        >
          <Minus style={{ width: '14px', height: '14px' }} />
        </button>
        <div style={{
          minWidth: '48px', height: '42px', borderRadius: '10px',
          border: `2px solid ${value > 0 ? color : '#E2E8F0'}`,
          backgroundColor: value > 0 ? `${color}10` : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 800,
          color: value > 0 ? color : '#CBD5E1',
          transition: 'all 150ms',
        }}>
          {value}
        </div>
        <button type="button"
          onClick={() => { if (!plusDisabled) onChange(value + 1) }}
          disabled={plusDisabled}
          style={{
            width: '34px', height: '34px', borderRadius: '8px',
            border: `1.5px solid ${plusDisabled ? '#E2E8F0' : color}`,
            backgroundColor: plusDisabled ? '#F8FAFC' : `${color}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: plusDisabled ? 'not-allowed' : 'pointer',
            color: plusDisabled ? '#CBD5E1' : color,
            transition: 'all 120ms',
          }}
          onMouseEnter={e => { if (!plusDisabled) e.currentTarget.style.backgroundColor = `${color}25` }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = plusDisabled ? '#F8FAFC' : `${color}10` }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  officer: PoliceWithDebt
  onClose: () => void
}

type PayMethod = 'cash' | 'yape' | 'tickets'

// ─── Componente principal ─────────────────────────────────────────────────────

export function PolicePaymentModal({ officer, onClose }: Props) {
  const [month, setMonth] = useState(currentMonthStr)
  const [payMethod, setPayMethod] = useState<PayMethod>('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [bfTickets, setBfTickets] = useState(0)
  const [luTickets, setLuTickets] = useState(0)
  const [showPayForm, setShowPayForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { data: summary, isLoading, isError, refetch, isFetching } =
    usePolicePaymentSummary(officer.police_id, month)

  const register = useRegisterPolicePayment()

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleOverlay = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose() },
    [onClose],
  )

  // Resetear contadores al cambiar método
  useEffect(() => {
    setBfTickets(0)
    setLuTickets(0)
    setCashAmount('')
  }, [payMethod])

  const debtBalance = n(summary?.debt_balance)
  const totalPaid = n(summary?.total_paid)
  const totalMenus = n(summary?.total_menus)
  const totalExtras = n(summary?.total_extras)
  const bfPrice = n(summary?.current_breakfast_ticket_value)
  const luPrice = n(summary?.current_lunch_ticket_value)

  // Calcular valor de tickets
  const ticketValue = bfTickets * bfPrice + luTickets * luPrice

  // Pagos previos se aplican también en orden: primero menús, luego extras
  const paidToMenus  = Math.min(totalPaid, totalMenus)
  const paidToExtras = Math.max(0, totalPaid - totalMenus)
  const unpaidMenus  = Math.max(0, totalMenus - paidToMenus)
  const unpaidExtras = Math.max(0, totalExtras - paidToExtras)

  // Cobertura de tickets sobre el saldo pendiente (no sobre el bruto)
  const menusCovered   = Math.min(ticketValue, unpaidMenus)
  const ticketOverflow = Math.max(0, ticketValue - unpaidMenus)
  const extrasCovered  = Math.min(ticketOverflow, unpaidExtras)
  const menusFullyCovered  = unpaidMenus === 0 || ticketValue >= unpaidMenus
  const extrasFullyCovered = menusFullyCovered && (unpaidExtras === 0 || ticketOverflow >= unpaidExtras)
  const remainingAfterTickets = Math.max(0, debtBalance - ticketValue)
  const creditoSobrante = Math.max(0, ticketValue - debtBalance)

  // Bloquear + cuando agregar un ticket más excede la deuda
  const bfPlusBlocked = debtBalance > 0 && (ticketValue + bfPrice) > debtBalance
  const luPlusBlocked = debtBalance > 0 && (ticketValue + luPrice) > debtBalance
  const allTicketsMaxed = (bfPlusBlocked && luPlusBlocked) && ticketValue > 0 && remainingAfterTickets > 0

  function handlePay() {
    if (payMethod === 'tickets') {
      if (ticketValue <= 0) return
      register.mutate(
        { policeId: officer.police_id, input: { payment_type: 'tickets', breakfast_tickets: bfTickets, lunch_tickets: luTickets } },
        {
          onSuccess: () => {
            setSuccessMsg(`Tickets registrados: S/ ${ticketValue.toFixed(2)}`)
            setBfTickets(0); setLuTickets(0); setShowPayForm(false)
            setTimeout(() => setSuccessMsg(''), 4000)
          },
        },
      )
    } else {
      const amount = parseFloat(cashAmount)
      if (!amount || amount <= 0) return
      register.mutate(
        { policeId: officer.police_id, input: { payment_type: payMethod, amount } },
        {
          onSuccess: () => {
            setSuccessMsg(`Pago de S/ ${amount.toFixed(2)} registrado`)
            setCashAmount(''); setShowPayForm(false)
            setTimeout(() => setSuccessMsg(''), 4000)
          },
        },
      )
    }
  }

  const canSubmit = payMethod === 'tickets'
    ? ticketValue > 0 && !register.isPending
    : parseFloat(cashAmount) > 0 && !register.isPending

  const METHODS: { key: PayMethod; label: string; icon: React.ReactNode }[] = [
    { key: 'cash', label: 'Efectivo', icon: <Banknote style={{ width: '14px', height: '14px' }} /> },
    { key: 'yape', label: 'Yape', icon: null },
    { key: 'tickets', label: 'Tickets', icon: <Ticket style={{ width: '14px', height: '14px' }} /> },
  ]

  return (
    <div onClick={handleOverlay} style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(4px)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '900px', backgroundColor: '#FFFFFF',
        borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 32px)', overflow: 'hidden',
      }}>

        {/* ═══ HEADER ═══ */}
        <div style={{
          padding: '22px 24px',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderBottom: '1px solid #BFDBFE',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {officer.full_name}
              </h2>
              <span style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', borderRadius: '999px', padding: '3px 10px' }}>
                Policía
              </span>
              {officer.rank && (
                <span style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '10px', fontWeight: 600, borderRadius: '999px', padding: '3px 10px' }}>
                  {officer.rank}
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              DNI:  {officer.badge_code} — Módulo de Cobros
            </p>
          </div>
          {/* Mes + Refrescar + Cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff', border: '1.5px solid #BFDBFE', borderRadius: '12px', padding: '4px' }}>
              <button type="button" onClick={() => setMonth(prev => prevMonth(prev))}
                style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DBEAFE' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', minWidth: '110px', textAlign: 'center', padding: '0 4px' }}>
                {monthLabel(month)}
              </span>
              <button type="button" onClick={() => setMonth(prev => nextMonth(prev))}
                style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DBEAFE' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <button type="button" onClick={() => refetch()} disabled={isFetching}
              style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #BFDBFE', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', opacity: isFetching ? 0.6 : 1 }}
              onMouseEnter={e => { if (!isFetching) { e.currentTarget.style.backgroundColor = '#DBEAFE'; e.currentTarget.style.color = '#1D4ED8' } }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#64748B' }}
            >
              <RefreshCw style={{ width: '15px', height: '15px', animation: isFetching ? 'spin 0.75s linear infinite' : 'none' }} />
            </button>
            <button type="button" onClick={onClose}
              style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #BFDBFE', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.color = '#EF4444' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.color = '#64748B' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* ═══ CUERPO ═══ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '12px 16px' }}>
              <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803D', margin: 0 }}>{successMsg}</p>
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '60px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #DBEAFE', borderTopColor: '#3B82F6', animation: 'spin 0.75s linear infinite' }} />
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>Error al cargar el resumen</div>
          ) : !summary ? null : (
            <>
              {/* Resumen financiero */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Total Menús', value: `S/ ${n(summary.total_menus).toFixed(2)}`, color: '#0F172A', bg: '#F8FAFC', border: '#E2E8F0' },
                  { label: 'Total Extras', value: `S/ ${totalExtras.toFixed(2)}`, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
                  { label: 'Total Pagado', value: `S/ ${totalPaid.toFixed(2)}`, color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
                  {
                    label: 'Deuda Pendiente',
                    value: `S/ ${Math.max(0, debtBalance).toFixed(2)}`,
                    color: debtBalance > 0 ? '#EF4444' : '#10B981',
                    bg: debtBalance > 0 ? '#FEF2F2' : '#F0FDF4',
                    border: debtBalance > 0 ? '#FECACA' : '#BBF7D0',
                  },
                ].map(card => (
                  <div key={card.label} style={{ backgroundColor: card.bg, border: `1.5px solid ${card.border}`, borderRadius: '14px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#94A3B8', margin: '0 0 5px' }}>{card.label}</p>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: card.color, margin: 0, letterSpacing: '-0.02em' }}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Tabla de consumos */}
              {summary.consumptions.length > 0 ? (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#64748B', margin: '0 0 10px' }}>
                    Consumos del mes
                  </p>
                  <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#FAFAFA' }}>
                          {[
                            { l: 'Fecha', a: 'left' as const },
                            { l: 'Desayuno', a: 'center' as const, icon: <Coffee style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} /> },
                            { l: 'Almuerzo', a: 'center' as const, icon: <Sun style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} /> },
                            { l: 'Cena', a: 'center' as const, icon: <Moon style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} /> },
                            { l: 'Menú', a: 'center' as const },
                            { l: 'Extras', a: 'center' as const },
                            { l: 'Total día', a: 'center' as const },
                          ].map((col, i) => (
                            <th key={i} style={{ padding: '9px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#64748B', textAlign: col.a, borderBottom: '1.5px solid #E2E8F0' }}>
                              {col.icon}{col.l}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summary.consumptions.map((row, idx) => {
                          const bg = idx % 2 === 1 ? '#FAFCFF' : '#FFFFFF'
                          const extTotal = n(row.extras_total)
                          return (
                            <tr key={row.id} style={{ backgroundColor: bg }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#EFF6FF' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = bg }}
                            >
                              <td style={{ padding: '10px 12px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A', borderBottom: '1px solid #F1F5F9' }}>{formatDate(row.date)}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <MealPill count={row.breakfast_count} />
                                  {row.breakfast_count > 0 && <span style={{ fontSize: '10px', color: '#94A3B8' }}>S/{n(row.breakfast_value).toFixed(2)}</span>}
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <MealPill count={row.lunch_count} />
                                  {row.lunch_count > 0 && <span style={{ fontSize: '10px', color: '#94A3B8' }}>S/{n(row.lunch_value).toFixed(2)}</span>}
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <MealPill count={row.dinner_count} />
                                  {row.dinner_count > 0 && <span style={{ fontSize: '10px', color: '#94A3B8' }}>S/{n(row.dinner_value).toFixed(2)}</span>}
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#1E293B', borderBottom: '1px solid #F1F5F9' }}>
                                S/ {n(row.menu_total).toFixed(2)}
                              </td>
                              <td style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                                {row.extras.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    {row.extras.map((e, i) => (
                                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#B45309' }}>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#F59E0B', flexShrink: 0, display: 'inline-block' }} />
                                        <span style={{ flex: 1 }}>{e.dish_name}</span>
                                        <span style={{ fontWeight: 700 }}>S/{parseFloat(String(e.unit_price_snapshot)).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '12px', color: extTotal > 0 ? '#F59E0B' : '#CBD5E1', display: 'block', textAlign: 'center', fontWeight: extTotal > 0 ? 600 : 400 }}>
                                    {extTotal > 0 ? `S/ ${extTotal.toFixed(2)}` : '—'}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #F1F5F9' }}>
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

              {/* Historial de pagos */}
              {summary.payments.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#64748B', margin: '0 0 10px' }}>
                    Pagos registrados este mes
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {summary.payments.map(p => {
                      const typeColors: Record<string, { bg: string; icon: string }> = {
                        cash: { bg: '#F0FDF4', icon: '#16A34A' },
                        yape: { bg: '#FAF5FF', icon: '#7C3AED' },
                        tickets: { bg: '#EFF6FF', icon: '#1D4ED8' },
                      }
                      const tc = typeColors[p.payment_type] ?? typeColors.cash
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: tc.bg, border: '1px solid', borderColor: p.payment_type === 'cash' ? '#BBF7D0' : p.payment_type === 'yape' ? '#DDD6FE' : '#BFDBFE', borderRadius: '10px', padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${tc.icon}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {p.payment_type === 'tickets'
                                ? <Ticket style={{ width: '15px', height: '15px', color: tc.icon }} />
                                : p.payment_type === 'yape'
                                ? <span style={{ fontSize: '12px', fontWeight: 800, color: tc.icon }}>Y</span>
                                : <Banknote style={{ width: '15px', height: '15px', color: tc.icon }} />
                              }
                            </div>
                            <div>
                              <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                {p.payment_type === 'cash' ? 'Efectivo' : p.payment_type === 'yape' ? 'Yape' : 'Tickets'}
                              </p>
                              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                                {formatDateTime(p.created_at)}{p.description && ` — ${p.description}`}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: tc.icon }}>
                            + S/ {n(p.amount).toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Aviso de deuda */}
              {debtBalance > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px 16px' }}>
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
          <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
            {!showPayForm ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp style={{ width: '18px', height: '18px', color: '#3B82F6' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#94A3B8', margin: '0 0 2px' }}>
                      Deuda actual
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                      Menús S/ {totalMenus.toFixed(2)} + Extras S/ {totalExtras.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: debtBalance > 0 ? '#EF4444' : '#10B981', letterSpacing: '-0.03em' }}>
                    S/ {Math.max(0, debtBalance).toFixed(2)}
                  </span>
                  {debtBalance > 0 && (
                    <button type="button" onClick={() => setShowPayForm(true)}
                      style={{ backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563EB' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3B82F6' }}
                    >
                      <Banknote style={{ width: '16px', height: '16px' }} />
                      Registrar Pago
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Selector de método */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {METHODS.map(m => (
                    <button key={m.key} type="button" onClick={() => setPayMethod(m.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '10px',
                        border: `1.5px solid ${payMethod === m.key ? '#3B82F6' : '#E2E8F0'}`,
                        backgroundColor: payMethod === m.key ? '#EFF6FF' : '#fff',
                        color: payMethod === m.key ? '#1D4ED8' : '#64748B',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 120ms',
                      }}
                    >
                      {m.icon}{m.icon ? ' ' : ''}{m.label}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <button type="button" onClick={() => setShowPayForm(false)}
                    style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#fff', fontSize: '12px', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>

                {/* Formulario según método */}
                {payMethod === 'tickets' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Contadores */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
                      <Counter
                        label="Tickets Desayuno"
                        sublabel={`S/ ${bfPrice.toFixed(2)} c/u`}
                        value={bfTickets}
                        onChange={setBfTickets}
                        color="#6366F1"
                        plusDisabled={bfPlusBlocked}
                      />
                      <Counter
                        label="Tickets Almuerzo"
                        sublabel={`S/ ${luPrice.toFixed(2)} c/u`}
                        value={luTickets}
                        onChange={setLuTickets}
                        color="#3B82F6"
                        plusDisabled={luPlusBlocked}
                      />
                      {/* Advertencia: tickets maxeados */}
                      {allTicketsMaxed && (
                        <div style={{
                          gridColumn: '1 / -1',
                          display: 'flex', alignItems: 'flex-start', gap: '10px',
                          padding: '12px 14px', borderRadius: '12px',
                          backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A',
                        }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                          <div>
                            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                              No se pueden agregar más tickets
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#B45309' }}>
                              El saldo restante de{' '}
                              <strong>S/ {remainingAfterTickets.toFixed(2)}</strong>{' '}
                              debe pagarse con <strong>efectivo</strong> o <strong>Yape</strong>.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Valor total de tickets */}
                      {(bfTickets > 0 || luTickets > 0) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'flex-end', paddingBottom: '2px' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: 0 }}>
                            Valor total
                          </p>
                          <p style={{ fontSize: '26px', fontWeight: 800, color: '#1D4ED8', margin: 0, letterSpacing: '-0.02em' }}>
                            S/ {ticketValue.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Visualización de cobertura priorizada */}
                    {ticketValue > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                        {/* 1. Menús pendientes */}
                        {unpaidMenus > 0 || menusCovered > 0 ? (
                          <div style={{
                            borderRadius: '12px', padding: '12px 16px',
                            backgroundColor: menusFullyCovered ? '#F0FDF4' : '#EFF6FF',
                            border: `1.5px solid ${menusFullyCovered ? '#BBF7D0' : '#BFDBFE'}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: menusFullyCovered ? '#15803D' : '#1D4ED8' }}>
                                  {menusFullyCovered ? '✓ Menús cubiertos' : 'Cubriendo menús primero'}
                                </span>
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>
                                  (Desayuno + Almuerzo + Cena)
                                </span>
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: menusFullyCovered ? '#16A34A' : '#1D4ED8' }}>
                                S/ {menusCovered.toFixed(2)} / S/ {unpaidMenus.toFixed(2)}
                              </span>
                            </div>
                            <div style={{ height: '8px', backgroundColor: menusFullyCovered ? '#BBF7D0' : '#DBEAFE', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: '999px',
                                backgroundColor: menusFullyCovered ? '#22C55E' : '#3B82F6',
                                width: `${unpaidMenus > 0 ? Math.min(100, (menusCovered / unpaidMenus) * 100) : 100}%`,
                                transition: 'width 200ms ease',
                              }} />
                            </div>
                          </div>
                        ) : null}

                        {/* 2. Mensaje de transición cuando menús están completos y hay extras */}
                        {menusFullyCovered && unpaidExtras > 0 && ticketOverflow > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px' }}>
                            <span style={{ fontSize: '14px' }}>→</span>
                            <p style={{ fontSize: '12px', color: '#92400E', margin: 0, fontWeight: 500 }}>
                              Menús cubiertos. El excedente de{' '}
                              <strong>S/ {ticketOverflow.toFixed(2)}</strong> se aplica a extras.
                            </p>
                          </div>
                        )}

                        {/* 3. Extras pendientes (solo si hay excedente tras cubrir menús) */}
                        {menusFullyCovered && unpaidExtras > 0 && (
                          <div style={{
                            borderRadius: '12px', padding: '12px 16px',
                            backgroundColor: extrasFullyCovered ? '#F0FDF4' : '#FFFBEB',
                            border: `1.5px solid ${extrasFullyCovered ? '#BBF7D0' : '#FDE68A'}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: extrasFullyCovered ? '#15803D' : '#B45309' }}>
                                {extrasFullyCovered ? '✓ Extras cubiertos' : 'Cubriendo extras'}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: extrasFullyCovered ? '#16A34A' : '#B45309' }}>
                                S/ {extrasCovered.toFixed(2)} / S/ {unpaidExtras.toFixed(2)}
                              </span>
                            </div>
                            <div style={{ height: '8px', backgroundColor: extrasFullyCovered ? '#BBF7D0' : '#FDE68A', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: '999px',
                                backgroundColor: extrasFullyCovered ? '#22C55E' : '#F59E0B',
                                width: `${unpaidExtras > 0 ? Math.min(100, (extrasCovered / unpaidExtras) * 100) : 100}%`,
                                transition: 'width 200ms ease',
                              }} />
                            </div>
                          </div>
                        )}

                        {/* 4. Resultado final */}
                        {remainingAfterTickets > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>
                              Saldo pendiente tras tickets — pagar en efectivo/Yape
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#EF4444' }}>
                              S/ {remainingAfterTickets.toFixed(2)}
                            </span>
                          </div>
                        ) : creditoSobrante > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                                ✓ Deuda cubierta completamente
                              </span>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>¡Pagado!</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px' }}>
                              <span style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 500 }}>
                                S/ {creditoSobrante.toFixed(2)} sobrantes → se acreditan para el próximo consumo
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8' }}>
                                Crédito
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                              ✓ Deuda cubierta exactamente
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>¡Pagado!</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botón confirmar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={handlePay} disabled={!canSubmit}
                        style={{
                          padding: '10px 24px', backgroundColor: '#3B82F6', color: '#fff',
                          border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                          cursor: canSubmit ? 'pointer' : 'not-allowed',
                          opacity: canSubmit ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.backgroundColor = '#2563EB' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3B82F6' }}
                      >
                        <Ticket style={{ width: '15px', height: '15px' }} />
                        {register.isPending ? 'Guardando...' : `Confirmar S/ ${ticketValue.toFixed(2)}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Efectivo / Yape */
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        Monto a pagar
                      </label>
                      <div style={{ position: 'relative' as const }}>
                        <span style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', fontWeight: 600, color: '#64748B' }}>S/</span>
                        <input
                          type="number" min="0.01" step="0.01"
                          placeholder={debtBalance > 0 ? debtBalance.toFixed(2) : '0.00'}
                          value={cashAmount}
                          onChange={e => setCashAmount(e.target.value)}
                          style={{
                            width: '100%', boxSizing: 'border-box' as const,
                            paddingLeft: '32px', paddingRight: '12px',
                            height: '44px', border: '1.5px solid #E2E8F0',
                            borderRadius: '10px', fontSize: '15px', fontWeight: 600,
                            color: '#0F172A', outline: 'none', backgroundColor: '#fff',
                          }}
                          onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
                          onBlur={e => { e.target.style.borderColor = '#E2E8F0' }}
                        />
                      </div>
                    </div>
                    <button type="button" onClick={handlePay} disabled={!canSubmit}
                      style={{
                        height: '44px', padding: '0 22px', backgroundColor: '#10B981', color: '#fff',
                        border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5,
                      }}
                      onMouseEnter={e => { if (canSubmit) e.currentTarget.style.backgroundColor = '#059669' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#10B981' }}
                    >
                      {register.isPending ? 'Guardando...' : 'Confirmar'}
                    </button>
                  </div>
                )}

                {/* Aviso pago parcial (efectivo/yape) */}
                {payMethod !== 'tickets' && cashAmount && parseFloat(cashAmount) > 0 && parseFloat(cashAmount) < debtBalance && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px 12px' }}>
                    <AlertCircle style={{ width: '14px', height: '14px', color: '#D97706', flexShrink: 0 }} />
                    <p style={{ fontSize: '11.5px', color: '#92400E', margin: 0 }}>
                      Queda pendiente <strong>S/ {(debtBalance - parseFloat(cashAmount)).toFixed(2)}</strong> que se registrará como deuda.
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
