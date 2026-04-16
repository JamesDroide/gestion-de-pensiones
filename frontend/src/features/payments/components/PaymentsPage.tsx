import { useState } from 'react'
import { TrendingDown, Banknote, Users } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { PensionersTable } from './PensionersTable'
import { PoliciesTable } from './PoliciesTable'
import { usePensionersWithDebt, useMonthlyTotal } from '../hooks/usePayments'
import { usePoliceWithDebt } from '../hooks/usePolicePayments'

type Tab = 'civil' | 'police'

function toMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function formatMonthLabel(monthStr: string) {
  const [y, m] = monthStr.split('-').map(Number)
  return new Date(y, m - 1, 1)
    .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
    .replace(/^./, s => s.toUpperCase())
}

export function PaymentsPage() {
  const [tab, setTab] = useState<Tab>('civil')
  const [month, setMonth] = useState(toMonthStr(new Date()))

  const { data: pensioners = [] } = usePensionersWithDebt()
  const { data: officers = [] } = usePoliceWithDebt()
  const { data: monthlyData } = useMonthlyTotal(month, tab === 'civil' ? 'civil' : 'police')

  const activeList = tab === 'civil' ? pensioners : officers
  const totalDebt = activeList.reduce((sum, p) => sum + Math.max(0, parseFloat(p.debt_balance) || 0), 0)
  const pendingCount = activeList.filter(p => (parseFloat(p.debt_balance) || 0) > 0).length

  const monthlyTotal = parseFloat(monthlyData?.total ?? '0') || 0
  const monthLabel = formatMonthLabel(month)
  const isCurrentMonth = month === toMonthStr(new Date())

  function prevMonth() {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setMonth(toMonthStr(d))
  }
  function nextMonth() {
    if (isCurrentMonth) return
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m, 1)
    setMonth(toMonthStr(d))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Cobros"
        description="Control de pagos y deudas por pensionista"
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

        {/* Card: Total Deuda */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px 22px 18px',
          boxShadow: '0 4px 16px rgba(239,68,68,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          borderTop: '4px solid #EF4444',
          minHeight: '118px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Fondo decorativo */}
          <div style={{
            position: 'absolute', top: '-18px', right: '-18px',
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#FEF2F2', opacity: 0.7, pointerEvents: 'none',
          }} />
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#94A3B8',
            }}>
              Total Deuda
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <TrendingDown size={16} color="#EF4444" />
            </div>
          </div>
          {/* Valor */}
          <div>
            <p style={{
              fontSize: '28px', fontWeight: 800, color: '#EF4444',
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px',
            }}>
              S/ {totalDebt.toFixed(2)}
            </p>
            <span style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600,
              color: '#EF4444', backgroundColor: '#FEE2E2',
              padding: '2px 8px', borderRadius: '999px',
            }}>
              Total acumulado
            </span>
          </div>
        </div>

        {/* Card: Pagos del Mes */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px 22px 18px',
          boxShadow: '0 4px 16px rgba(16,185,129,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          borderTop: '4px solid #10B981',
          minHeight: '118px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-18px', right: '-18px',
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#F0FDF4', opacity: 0.7, pointerEvents: 'none',
          }} />
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#94A3B8', display: 'block',
              }}>
                Pagos del Mes
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <button onClick={prevMonth} style={{ width: '18px', height: '18px', borderRadius: '5px', border: '1px solid #D1FAE5', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>‹</button>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>{monthLabel}</span>
                <button onClick={nextMonth} disabled={isCurrentMonth} style={{ width: '18px', height: '18px', borderRadius: '5px', border: '1px solid #D1FAE5', backgroundColor: 'transparent', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', fontSize: '11px', color: isCurrentMonth ? '#A7F3D0' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>›</button>
              </div>
            </div>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Banknote size={16} color="#10B981" />
            </div>
          </div>
          {/* Valor */}
          <div>
            <p style={{
              fontSize: '28px', fontWeight: 800, color: '#10B981',
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px',
            }}>
              S/ {monthlyTotal.toFixed(2)}
            </p>
            <span style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600,
              color: '#10B981', backgroundColor: '#DCFCE7',
              padding: '2px 8px', borderRadius: '999px',
            }}>
              Cobrado este mes
            </span>
          </div>
        </div>

        {/* Card: Pendientes */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px 22px 18px',
          boxShadow: '0 4px 16px rgba(245,158,11,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          borderTop: '4px solid #F59E0B',
          minHeight: '118px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-18px', right: '-18px',
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: '#FFFBEB', opacity: 0.7, pointerEvents: 'none',
          }} />
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#94A3B8',
            }}>
              Pendientes
            </span>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Users size={16} color="#F59E0B" />
            </div>
          </div>
          {/* Valor */}
          <div>
            <p style={{
              fontSize: '28px', fontWeight: 800, color: '#F59E0B',
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: '8px 0 4px',
            }}>
              {pendingCount}
            </p>
            <span style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 600,
              color: '#F59E0B', backgroundColor: '#FEF3C7',
              padding: '2px 8px', borderRadius: '999px',
            }}>
              Con saldo pendiente
            </span>
          </div>
        </div>

      </div>

      {/* Tabs Civil / Policía */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', borderRadius: '14px', padding: '4px', width: 'fit-content' }}>
          {([
            { key: 'civil' as Tab, label: 'Pensionistas', count: pensioners.length },
            { key: 'police' as Tab, label: 'Policías', count: officers.length },
          ] as { key: Tab; label: string; count: number }[]).map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: tab === t.key ? '#fff' : 'transparent',
                boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                color: tab === t.key ? '#0F172A' : '#64748B',
                fontSize: '13px', fontWeight: tab === t.key ? 700 : 500,
                cursor: 'pointer', transition: 'all 150ms',
              }}
            >
              {t.label}
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px',
                backgroundColor: tab === t.key
                  ? (t.key === 'civil' ? '#EEF2FF' : '#EFF6FF')
                  : '#E2E8F0',
                color: tab === t.key
                  ? (t.key === 'civil' ? '#6366F1' : '#3B82F6')
                  : '#94A3B8',
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '16px' }}>
          {tab === 'civil' ? <PensionersTable /> : <PoliciesTable />}
        </div>
      </div>
    </div>
  )
}
