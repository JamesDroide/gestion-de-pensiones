import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Check,
  CalendarX,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import type { Pensionista, NoPensionPriceMode } from '@/features/pensioners/types'
import type { PensionerConsumption, PoliceConsumption, ExtraItem } from '@/features/consumption/types'
import { useConsumptionHistory } from '@/features/consumption/hooks/useConsumptionHistory'
import { usePricing } from '@/features/settings/hooks/useSettings'
import type { PricingConfig } from '@/features/settings/types'

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Devuelve el mes actual en formato 'YYYY-MM' */
function currentMonthStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** 'YYYY-MM' → 'Abril 2025' */
function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  return `${MONTHS_ES[parseInt(m, 10) - 1]} ${y}`
}

/** Resta un mes al string 'YYYY-MM' */
function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Suma un mes al string 'YYYY-MM' */
function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 'YYYY-MM-DD' → '12 Abr' */
function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  const monthName = MONTHS_ES[parseInt(m, 10) - 1].slice(0, 3)
  return `${parseInt(d, 10)} ${monthName}`
}

// ─── Helpers de datos ─────────────────────────────────────────────────────────

interface CustomPrices {
  priceMode: NoPensionPriceMode
  custom_price_1_meal?: string | null
  custom_price_2_meals?: string | null
  custom_price_3_meals?: string | null
  custom_breakfast_price?: string | null
  custom_lunch_price?: string | null
  custom_dinner_price?: string | null
}

/**
 * Calcula el total de una fila civil.
 * Si el día ya fue cerrado usa total_price (snapshot inmutable).
 * Si está abierto calcula en tiempo real con los precios actuales.
 */
function calcCivilTotal(
  row: PensionerConsumption,
  pricing: PricingConfig | undefined,
  noPensionRules: boolean = false,
  custom?: CustomPrices,
): number {
  if (row.total_price !== null && row.total_price !== undefined) {
    return parseFloat(String(row.total_price)) || 0
  }
  if (!pricing) return 0
  const extras = parseFloat(String(row.extras_total ?? '0')) || 0
  const uniqueMeals = [row.breakfast_count, row.lunch_count, row.dinner_count].filter(c => (c ?? 0) > 0).length

  if (!noPensionRules) {
    let mealTotal = 0
    if (uniqueMeals === 1) mealTotal = Number(pricing.menu_price_normal)
    else if (uniqueMeals === 2) mealTotal = Number(pricing.menu_price_2_meals) * 2
    else if (uniqueMeals === 3) mealTotal = Number(pricing.menu_price_3_meals) * 3
    return mealTotal + extras
  }

  const mode = custom?.priceMode ?? 'menu_price'

  if (mode === 'custom_tiered' && custom) {
    let mealTotal = 0
    if (uniqueMeals === 1) mealTotal = Number(custom.custom_price_1_meal ?? 0)
    else if (uniqueMeals === 2) mealTotal = Number(custom.custom_price_2_meals ?? 0) * 2
    else if (uniqueMeals === 3) mealTotal = Number(custom.custom_price_3_meals ?? 0) * 3
    return mealTotal + extras
  }

  if (mode === 'custom_by_type' && custom) {
    const mealTotal =
      Number(custom.custom_breakfast_price ?? 0) * (row.breakfast_count ?? 0) +
      Number(custom.custom_lunch_price    ?? 0) * (row.lunch_count    ?? 0) +
      Number(custom.custom_dinner_price   ?? 0) * (row.dinner_count   ?? 0)
    return mealTotal + extras
  }

  // menu_price (default)
  const totalPortions = (row.breakfast_count ?? 0) + (row.lunch_count ?? 0) + (row.dinner_count ?? 0)
  return Number(pricing.menu_price) * totalPortions + extras
}

/** Devuelve el total formateado de una fila */
function totalRow(
  row: PensionerConsumption | PoliceConsumption,
  isCivil: boolean,
  pricing: PricingConfig | undefined,
  noPensionRules: boolean = false,
  custom?: CustomPrices,
): string {
  if (isCivil) {
    const n = calcCivilTotal(row as PensionerConsumption, pricing, noPensionRules, custom)
    return `S/ ${n.toFixed(2)}`
  }
  const r = row as PoliceConsumption
  const n = parseFloat(String(r.total)) || 0
  return `S/ ${n.toFixed(2)}`
}

/** Suma todos los totales del mes */
function calcMonthTotal(
  data: (PensionerConsumption | PoliceConsumption)[],
  isCivil: boolean,
  pricing: PricingConfig | undefined,
  noPensionRules: boolean = false,
  custom?: CustomPrices,
): number {
  return data.reduce((acc, row) => {
    if (isCivil) return acc + calcCivilTotal(row as PensionerConsumption, pricing, noPensionRules, custom)
    return acc + (parseFloat(String((row as PoliceConsumption).total)) || 0)
  }, 0)
}

// ─── Sub-componente: Pill de comida ───────────────────────────────────────────

function MealPill({ count }: { count: number }) {
  if (count > 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          backgroundColor: 'rgba(99,102,241,0.10)',
          borderRadius: '8px',
          padding: '4px 10px',
          color: '#6366F1',
        }}
      >
        <Check style={{ width: '13px', height: '13px', strokeWidth: 2.8 }} />
        {count > 1 && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '1px 5px',
              lineHeight: 1.4,
            }}
          >
            ×{count}
          </span>
        )}
      </span>
    )
  }
  return (
    <span style={{ color: '#CBD5E1', fontSize: '16px', lineHeight: 1 }}>
      —
    </span>
  )
}

// ─── Sub-componente: Spinner de carga ─────────────────────────────────────────

function Spinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ padding: '60px 0' }}
    >
      <style>{`
        @keyframes chm-spin {
          to { transform: rotate(360deg); }
        }
        .chm-spinner {
          animation: chm-spin 0.75s cubic-bezier(0.4,0,0.2,1) infinite;
        }
      `}</style>
      <div
        className="chm-spinner rounded-full"
        style={{
          width: 36,
          height: 36,
          border: '3px solid #E2E8F0',
          borderTopColor: '#6366F1',
          borderRightColor: '#818CF8',
        }}
      />
      <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', margin: 0 }}>
        Cargando historial...
      </p>
    </div>
  )
}

// ─── Sub-componente: Estado vacío ─────────────────────────────────────────────

function EmptyHistory() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      style={{ padding: '56px 24px' }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '18px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CalendarX style={{ width: 30, height: 30, color: '#CBD5E1' }} />
      </div>
      <div className="text-center">
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748B',
            margin: '0 0 4px',
          }}
        >
          Sin consumos en este período
        </p>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
          No se encontraron registros para el mes seleccionado
        </p>
      </div>
    </div>
  )
}

// ─── Sub-componente: Estado de error ─────────────────────────────────────────

function ErrorState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      style={{ padding: '56px 24px' }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '18px',
          backgroundColor: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X style={{ width: 28, height: 28, color: '#FCA5A5' }} />
      </div>
      <p
        style={{
          fontSize: '13px',
          color: '#EF4444',
          fontWeight: 500,
          margin: 0,
        }}
      >
        Error al cargar el historial
      </p>
    </div>
  )
}

// ─── Sub-componente: Tabla de historial ───────────────────────────────────────

const COL_HEADERS = [
  'Fecha',
  'Desayuno',
  'Almuerzo',
  'Cena',
  'Extras',
  'Total del día',
]

const COL_ICONS: (React.ReactNode | null)[] = [
  null,
  <Coffee key="bf" style={{ width: '11px', height: '11px' }} />,
  <Sun    key="lu" style={{ width: '11px', height: '11px' }} />,
  <Moon   key="di" style={{ width: '11px', height: '11px' }} />,
  null,
  null,
]

interface TableProps {
  data: (PensionerConsumption | PoliceConsumption)[]
  isCivil: boolean
  pricing: PricingConfig | undefined
  noPensionRules: boolean
  custom?: CustomPrices
}

function HistoryTable({ data, isCivil, pricing, noPensionRules, custom }: TableProps) {
  return (
    <div
      style={{
        overflowY: 'auto',
        maxHeight: '420px',
        border: '1.5px solid #E2E8F0',
        borderRadius: '14px',
        margin: '0 24px',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {/* Cabecera fija */}
        <thead>
          <tr
            style={{
              backgroundColor: '#FAFAFA',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {COL_HEADERS.map((header, i) => (
              <th
                key={header}
                style={{
                  padding: '10px 14px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.07em',
                  color: '#64748B',
                  textAlign: i === 0 ? 'left' : 'center',
                  borderBottom: '1.5px solid #E2E8F0',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: i === 0 ? 'flex-start' : 'center',
                  }}
                >
                  {COL_ICONS[i]}
                  {header}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Filas de datos */}
        <tbody>
          {data.map((row, idx) => {
            const isAlt = idx % 2 === 1
            const bgDefault = isAlt ? '#FAFCFF' : '#FFFFFF'
            const extrasTotal = parseFloat(String(row.extras_total)) || 0
            const rowExtras: ExtraItem[] = isCivil
              ? ((row as PensionerConsumption).extras ?? [])
              : ((row as PoliceConsumption).extras ?? [])
            const hasExtras = rowExtras.length > 0 || extrasTotal > 0

            return (
              <tr
                key={row.id}
                style={{ backgroundColor: bgDefault, transition: 'background-color 100ms' }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F5F3FF'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = bgDefault
                }}
              >
                {/* Fecha */}
                <td
                  style={{
                    padding: '11px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#0F172A',
                    borderBottom: '1px solid #F1F5F9',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDate(row.date)}
                </td>

                {/* Desayuno */}
                <td style={{ padding: '11px 14px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                  <MealPill count={row.breakfast_count} />
                </td>

                {/* Almuerzo */}
                <td style={{ padding: '11px 14px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                  <MealPill count={row.lunch_count} />
                </td>

                {/* Cena */}
                <td style={{ padding: '11px 14px', textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
                  <MealPill count={row.dinner_count} />
                </td>

                {/* Extras */}
                <td
                  style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid #F1F5F9',
                    verticalAlign: 'top',
                  }}
                >
                  {rowExtras.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {rowExtras.map((e, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            color: '#B45309',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: '#F59E0B',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ flex: 1 }}>{e.dish_name}</span>
                          <span style={{ fontWeight: 700, flexShrink: 0 }}>
                            S/ {parseFloat(String(e.unit_price_snapshot)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: hasExtras ? 600 : 400,
                        color: hasExtras ? '#F59E0B' : '#CBD5E1',
                        display: 'block',
                        textAlign: 'center',
                      }}
                    >
                      {hasExtras ? `S/ ${extrasTotal.toFixed(2)}` : '—'}
                    </span>
                  )}
                </td>

                {/* Total del día */}
                <td
                  style={{
                    padding: '11px 14px',
                    textAlign: 'center',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  {totalRow(row, isCivil, pricing, noPensionRules, custom)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  pensioner: Pensionista
  onClose: () => void
}

// ─── Componente principal: ConsumptionHistoryModal ───────────────────────────

export function ConsumptionHistoryModal({ pensioner, onClose }: Props) {
  const isCivil = pensioner.pensioner_type === 'civil'
  const noPensionRules = isCivil && (pensioner.no_pension_rules ?? false)
  const custom: CustomPrices | undefined = noPensionRules ? {
    priceMode: pensioner.no_pension_price_mode ?? 'menu_price',
    custom_price_1_meal:    pensioner.custom_price_1_meal,
    custom_price_2_meals:   pensioner.custom_price_2_meals,
    custom_price_3_meals:   pensioner.custom_price_3_meals,
    custom_breakfast_price: pensioner.custom_breakfast_price,
    custom_lunch_price:     pensioner.custom_lunch_price,
    custom_dinner_price:    pensioner.custom_dinner_price,
  } : undefined

  const [month, setMonth] = useState<string>(currentMonthStr)

  const { data, isLoading, isError, isFetching, refetch } = useConsumptionHistory(
    pensioner.id,
    pensioner.pensioner_type,
    month,
  )
  const { data: pricing } = usePricing()

  const rows = (data ?? []) as (PensionerConsumption | PoliceConsumption)[]
  const total = useMemo(() => calcMonthTotal(rows, isCivil, pricing, noPensionRules, custom), [rows, isCivil, pricing, noPensionRules, custom])

  // Bloquea el scroll del body mientras el modal está abierto
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Cierra el modal al presionar Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Click en el overlay (no en el card) cierra el modal
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  const badgeStyle: React.CSSProperties = isCivil
    ? { backgroundColor: '#F1F5F9', color: '#64748B' }
    : { backgroundColor: '#EFF6FF', color: '#3B82F6' }

  return (
    /* ── Overlay ── */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Historial de consumo de ${pensioner.full_name}`}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* ── Card del modal ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
        }}
      >
        {/* ════════ HEADER ════════ */}
        <div
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #FAFBFF 0%, #F5F3FF 100%)',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexShrink: 0,
          }}
        >
          {/* Nombre + badge de tipo */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <h2
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: 0,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pensioner.full_name}
              </h2>
              <span
                style={{
                  ...badgeStyle,
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  flexShrink: 0,
                }}
              >
                {isCivil ? 'Pensionista' : 'Policía'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
              DNI {pensioner.dni} — Historial de consumo
            </p>
          </div>

          {/* Controles: selector de mes + botón cerrar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            {/* Navegador prev / label / next */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                padding: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setMonth(prev => prevMonth(prev))}
                aria-label="Mes anterior"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                  transition: 'background-color 120ms, color 120ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#E2E8F0'
                  e.currentTarget.style.color = '#0F172A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#64748B'
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>

              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  minWidth: '110px',
                  textAlign: 'center',
                  userSelect: 'none',
                  padding: '0 4px',
                }}
              >
                {monthLabel(month)}
              </span>

              <button
                type="button"
                onClick={() => setMonth(prev => nextMonth(prev))}
                aria-label="Mes siguiente"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                  transition: 'background-color 120ms, color 120ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#E2E8F0'
                  e.currentTarget.style.color = '#0F172A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#64748B'
                }}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Botón refrescar */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refrescar historial"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isFetching ? 'not-allowed' : 'pointer',
                color: '#64748B',
                transition: 'all 120ms',
                flexShrink: 0,
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
              title="Refrescar datos"
            >
              <RefreshCw
                style={{
                  width: '15px',
                  height: '15px',
                  animation: isFetching ? 'chm-spin 0.75s linear infinite' : 'none',
                }}
              />
            </button>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar historial"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                transition: 'all 120ms',
                flexShrink: 0,
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

        {/* ════════ CUERPO ════════ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorState />
          ) : rows.length === 0 ? (
            <EmptyHistory />
          ) : (
            <HistoryTable data={rows} isCivil={isCivil} pricing={pricing} noPensionRules={noPensionRules} custom={custom} />
          )}
        </div>

        {/* ════════ FOOTER ════════ */}
        {!isLoading && !isError && rows.length > 0 && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            {/* Icono + etiqueta + subtext */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TrendingUp style={{ width: '18px', height: '18px', color: '#6366F1' }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#94A3B8',
                    margin: '0 0 2px',
                  }}
                >
                  Total del mes
                </p>
                {total > 0 && (
                  <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                    Basado en {rows.length}{' '}
                    {rows.length === 1 ? 'registro' : 'registros'}
                  </p>
                )}
              </div>
            </div>

            {/* Monto total destacado */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
              }}
            >
              S/ {total.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
