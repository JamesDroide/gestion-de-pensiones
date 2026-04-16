import { useState, useEffect } from 'react'
import { Shield, Search, Calendar, X, Plus, Coffee, Sun, Moon, RefreshCw, Check } from 'lucide-react'
import { usePolice } from '@/features/police/hooks/usePolice'
import { useRegisterPoliceConsumption, usePoliceConsumptionByDate } from '../hooks/useConsumption'
import { usePricing } from '@/features/settings/hooks/useSettings'

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function avatarColor(name: string): string {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

const searchInputStyle: React.CSSProperties = {
  width: '100%', height: '48px', paddingLeft: '2.75rem', paddingRight: '1rem',
  fontSize: '13.5px', borderRadius: '12px', border: '1.5px solid #E2E8F0',
  backgroundColor: '#F8FAFC', color: '#1E293B', outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms, background-color 150ms',
}

const dateInputStyle: React.CSSProperties = {
  height: '48px', paddingLeft: '2.5rem', paddingRight: '0.75rem',
  fontSize: '13px', borderRadius: '12px', border: '1.5px solid #E2E8F0',
  backgroundColor: '#F8FAFC', color: '#1E293B', outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms, background-color 150ms',
  width: '160px', flexShrink: 0,
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  textTransform: 'uppercase' as const, letterSpacing: '0.07em',
  color: '#64748B', marginBottom: '10px',
}

function onFocusInput(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#6366F1'
  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
  e.target.style.backgroundColor = '#fff'
}

function onBlurInput(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#E2E8F0'
  e.target.style.boxShadow = 'none'
  e.target.style.backgroundColor = '#F8FAFC'
}

interface Extra { id: number; description: string; amount: string }

// ─── Stepper — todos los policías pueden registrar >1 porción ─────────────────

interface MealStepperProps {
  icon: React.ReactNode
  label: string
  count: number
  savedCount: number
  unitPrice: number
  onChange: (val: number) => void
}

function MealStepper({ icon, label, count, savedCount, unitPrice, onChange }: MealStepperProps) {
  const active = count > 0
  const wasSaved = savedCount > 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: active ? '#4F46E5' : '#94A3B8' }}>
        {icon}{label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count === 0}
          style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: count > 0 ? '#EEF2FF' : '#F1F5F9', color: count > 0 ? '#6366F1' : '#CBD5E1', fontSize: '18px', lineHeight: 1, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: count > 0 ? 'pointer' : 'not-allowed', transition: 'all 150ms', flexShrink: 0 }}
          onMouseEnter={e => { if (count > 0) e.currentTarget.style.backgroundColor = '#C7D2FE' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = count > 0 ? '#EEF2FF' : '#F1F5F9' }}
        >−</button>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', border: `2px solid ${active ? '#6366F1' : '#E2E8F0'}`, backgroundColor: active ? '#EEF2FF' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: active ? '#4F46E5' : '#CBD5E1', position: 'relative' }}>
          {count}
          {wasSaved && active && <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #fff' }} />}
        </div>
        <button
          type="button"
          onClick={() => onChange(count + 1)}
          style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: '#EEF2FF', color: '#6366F1', fontSize: '18px', lineHeight: 1, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#C7D2FE' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#EEF2FF' }}
        >+</button>
      </div>
      <span style={{ fontSize: '10px', fontWeight: 700, color: active ? '#4F46E5' : '#94A3B8' }}>
        S/ {(unitPrice * count).toFixed(2)}
      </span>
      {wasSaved && active && <span style={{ fontSize: '9px', color: '#10B981', fontWeight: 600 }}>guardado</span>}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PoliceConsumptionForm() {
  const { data: officers = [] } = usePolice()
  const { data: pricing } = usePricing()
  const mutation = useRegisterPoliceConsumption()

  const [policeId, setPoliceId] = useState<number | ''>('')
  const [date, setDate] = useState(today())
  const [search, setSearch] = useState('')
  const [meals, setMeals] = useState({ breakfast_count: 0, lunch_count: 0, dinner_count: 0 })
  const [savedMeals, setSavedMeals] = useState({ breakfast_count: 0, lunch_count: 0, dinner_count: 0 })
  const [extras, setExtras] = useState<Extra[]>([])
  const [extraDesc, setExtraDesc] = useState('')
  const [extraInput, setExtraInput] = useState('')
  const [nextExtraId, setNextExtraId] = useState(1)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const { data: existingRecord, isLoading: loadingDay } = usePoliceConsumptionByDate(policeId, date)

  useEffect(() => {
    if (existingRecord) {
      const counts = {
        breakfast_count: existingRecord.breakfast_count ?? (existingRecord.has_breakfast ? 1 : 0),
        lunch_count:     existingRecord.lunch_count     ?? (existingRecord.has_lunch     ? 1 : 0),
        dinner_count:    existingRecord.dinner_count    ?? (existingRecord.has_dinner    ? 1 : 0),
      }
      setMeals(counts)
      setSavedMeals(counts)
      if (existingRecord.extras?.length > 0) {
        const loaded = existingRecord.extras.map((e, i) => ({
          id: i + 1, description: e.dish_name,
          amount: parseFloat(String(e.unit_price_snapshot)).toFixed(2),
        }))
        setExtras(loaded)
        setNextExtraId(loaded.length + 1)
      } else {
        setExtras([])
        setNextExtraId(1)
      }
    } else if (existingRecord === null) {
      setMeals({ breakfast_count: 0, lunch_count: 0, dinner_count: 0 })
      setSavedMeals({ breakfast_count: 0, lunch_count: 0, dinner_count: 0 })
      setExtras([])
    }
  }, [existingRecord])

  useEffect(() => { setExtras([]); setSuccess(''); setError('') }, [policeId, date])

  const activeOfficers = officers.filter(p => p.is_active)
  const filteredList = activeOfficers
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.badge_code.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10)

  const selectedOfficer = activeOfficers.find(p => p.id === policeId)
  const setCount = (field: keyof typeof meals) => (val: number) => setMeals(prev => ({ ...prev, [field]: val }))

  const breakfastPrice = Number(pricing?.breakfast_ticket_value ?? 0)
  const lunchPrice     = Number(pricing?.lunch_ticket_value ?? 0)
  const dinnerPrice    = Number(pricing?.dinner_price ?? 0)

  const mealTotal = breakfastPrice * meals.breakfast_count + lunchPrice * meals.lunch_count + dinnerPrice * meals.dinner_count
  const extrasTotal = extras.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const totalConsumo = mealTotal + extrasTotal

  const addExtra = () => {
    const val = parseFloat(extraInput)
    if (!extraDesc.trim() || !extraInput || isNaN(val) || val <= 0) return
    setExtras(prev => [...prev, { id: nextExtraId, description: extraDesc.trim(), amount: val.toFixed(2) }])
    setNextExtraId(n => n + 1)
    setExtraDesc('')
    setExtraInput('')
  }

  const removeExtra = (id: number) => setExtras(prev => prev.filter(e => e.id !== id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!policeId) return
    setError(''); setSuccess('')
    try {
      await mutation.mutateAsync({
        police_id: Number(policeId), date,
        breakfast_count: meals.breakfast_count,
        lunch_count: meals.lunch_count,
        dinner_count: meals.dinner_count,
        extras: extras.map(ex => ({ dish_name: ex.description, unit_price: parseFloat(ex.amount), quantity: 1 })),
      })
      setSavedMeals({ ...meals })
      setSuccess(existingRecord ? 'Consumo actualizado correctamente' : 'Consumo registrado correctamente')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      setError(apiErr?.response?.data?.detail ?? 'Error al registrar el consumo')
    }
  }

  const officerSelected = policeId !== ''
  const isUpdating = !!existingRecord

  return (
    <form onSubmit={handleSubmit} className="bg-white" style={{ borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield style={{ width: '18px', height: '18px', color: '#6366F1' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Registrar consumo policial</h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Menú pensionista policía</p>
          </div>
        </div>
        {officerSelected && isUpdating && (
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', backgroundColor: '#FEF3C7', color: '#D97706' }}>Editando registro existente</span>
        )}
      </div>

      {/* Buscador + fecha */}
      <div>
        <label style={labelStyle}>Pensionista policía</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!policeId && (
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#94A3B8', pointerEvents: 'none', zIndex: 1 }} />
              <input type="text" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)} style={searchInputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
            </div>
          )}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Calendar style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8', pointerEvents: 'none' }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={dateInputStyle} onFocus={onFocusInput} onBlur={onBlurInput} />
          </div>
          {selectedOfficer && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '13px', fontWeight: 600, minWidth: 0, height: '48px' }}>
              <Check style={{ width: '14px', height: '14px', strokeWidth: 2.5, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedOfficer.full_name}</span>
              <button type="button" onClick={() => { setPoliceId(''); setSearch('') }} style={{ border: 'none', background: 'none', padding: '2px', color: '#1D4ED8', display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.7, flexShrink: 0 }}>
                <X style={{ width: '14px', height: '14px', strokeWidth: 2.5 }} />
              </button>
            </div>
          )}
        </div>

        {!policeId && (
          <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', marginTop: '8px' }}>
            {filteredList.length === 0
              ? <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>Sin resultados</div>
              : filteredList.map((p, index) => (
                <div key={p.id} onClick={() => setPoliceId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', backgroundColor: '#fff', borderLeft: '3px solid transparent', borderBottom: index < filteredList.length - 1 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', transition: 'background-color 150ms' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F8FAFC' }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: avatarColor(p.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 700, color: '#fff' }}>{getInitials(p.full_name)}</div>
                  <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name}</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8', flexShrink: 0 }}>{p.badge_code}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {officerSelected && loadingDay && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
          <RefreshCw style={{ width: '14px', height: '14px', color: '#94A3B8' }} className="animate-spin" />
          <span style={{ fontSize: '13px', color: '#94A3B8' }}>Cargando registro del día...</span>
        </div>
      )}

      {/* Tabla de comidas con stepper */}
      {officerSelected && !loadingDay && (
        <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.4fr', backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
            {[
              { label: 'Desayuno', icon: <Coffee style={{ width: '11px', height: '11px' }} /> },
              { label: 'Almuerzo', icon: <Sun    style={{ width: '11px', height: '11px' }} /> },
              { label: 'Cena',     icon: <Moon   style={{ width: '11px', height: '11px' }} /> },
              { label: 'Extras',   icon: null },
            ].map((col, i) => (
              <div key={col.label} style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', borderRight: i < 3 ? '1.5px solid #E2E8F0' : undefined }}>
                {col.icon}{col.label}
                {i < 3 && <span style={{ fontSize: '9px', color: '#3B82F6', fontWeight: 600, marginLeft: '2px' }}>×N</span>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.4fr' }}>
            <div style={{ borderRight: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
              <MealStepper icon={<Coffee style={{ width: '10px', height: '10px' }} />} label="Desayuno" count={meals.breakfast_count} savedCount={savedMeals.breakfast_count} unitPrice={breakfastPrice} onChange={setCount('breakfast_count')} />
            </div>
            <div style={{ borderRight: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
              <MealStepper icon={<Sun style={{ width: '10px', height: '10px' }} />} label="Almuerzo" count={meals.lunch_count} savedCount={savedMeals.lunch_count} unitPrice={lunchPrice} onChange={setCount('lunch_count')} />
            </div>
            <div style={{ borderRight: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
              <MealStepper icon={<Moon style={{ width: '10px', height: '10px' }} />} label="Cena" count={meals.dinner_count} savedCount={savedMeals.dinner_count} unitPrice={dinnerPrice} onChange={setCount('dinner_count')} />
            </div>

            {/* Extras */}
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="text" placeholder="Descripción del extra *" value={extraDesc} onChange={e => setExtraDesc(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExtra() } }} style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12.5px', borderRadius: '8px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#1E293B', outline: 'none' }} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.backgroundColor = '#fff' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC' }} />
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94A3B8', pointerEvents: 'none' }}>S/</span>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={extraInput} onChange={e => setExtraInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExtra() } }} style={{ width: '100%', height: '34px', paddingLeft: '24px', paddingRight: '6px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#1E293B', outline: 'none' }} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.backgroundColor = '#fff' }} onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC' }} />
                </div>
                <button type="button" onClick={addExtra} style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: extraDesc.trim() && extraInput ? '#6366F1' : '#E2E8F0', color: extraDesc.trim() && extraInput ? '#fff' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: extraDesc.trim() && extraInput ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'background-color 150ms' }} onMouseEnter={e => { if (extraDesc.trim() && extraInput) e.currentTarget.style.backgroundColor = '#4F46E5' }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = extraDesc.trim() && extraInput ? '#6366F1' : '#E2E8F0' }}>
                  <Plus style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
              {extras.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  {extras.map(ex => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EEF2FF', borderRadius: '7px', padding: '4px 6px 4px 8px', fontSize: '12px', color: '#4F46E5', fontWeight: 600 }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.description}</span>
                      <span style={{ flexShrink: 0 }}>S/ {ex.amount}</span>
                      <button type="button" onClick={() => removeExtra(ex.id)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6366F1', flexShrink: 0 }}>
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      {officerSelected && !loadingDay && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', backgroundColor: totalConsumo > 0 ? '#EEF2FF' : '#F8FAFC', border: `1.5px solid ${totalConsumo > 0 ? '#C7D2FE' : '#E2E8F0'}`, transition: 'background-color 200ms, border-color 200ms' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: '2px' }}>Total consumo</div>
            {mealTotal > 0 && (
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {[
                  meals.breakfast_count > 0 && `${meals.breakfast_count}× Desayuno S/${(breakfastPrice * meals.breakfast_count).toFixed(2)}`,
                  meals.lunch_count     > 0 && `${meals.lunch_count}× Almuerzo S/${(lunchPrice * meals.lunch_count).toFixed(2)}`,
                  meals.dinner_count    > 0 && `${meals.dinner_count}× Cena S/${(dinnerPrice * meals.dinner_count).toFixed(2)}`,
                ].filter(Boolean).join(' + ')}
                {extrasTotal > 0 && ` + S/ ${extrasTotal.toFixed(2)} extras`}
              </div>
            )}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: totalConsumo > 0 ? '#4F46E5' : '#CBD5E1', letterSpacing: '-0.02em' }}>
            S/ {totalConsumo.toFixed(2)}
          </div>
        </div>
      )}

      {/* Feedback */}
      {success && <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '13px', fontWeight: 600 }}>{success}</div>}
      {error && <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#FEF2F2', borderLeft: '3px solid #EF4444', color: '#DC2626', fontSize: '13px' }}>{error}</div>}

      {/* Submit */}
      <button type="submit" disabled={mutation.isPending || !policeId} style={{ height: '48px', borderRadius: '999px', backgroundColor: isUpdating ? '#F59E0B' : '#6366F1', fontSize: '13.5px', border: 'none', color: '#fff', fontWeight: 700, opacity: mutation.isPending || !policeId ? 0.6 : 1, cursor: mutation.isPending || !policeId ? 'not-allowed' : 'pointer', transition: 'background-color 150ms' }} onMouseEnter={e => { if (!mutation.isPending && policeId) e.currentTarget.style.backgroundColor = isUpdating ? '#D97706' : '#4F46E5' }} onMouseLeave={e => { if (!mutation.isPending) e.currentTarget.style.backgroundColor = isUpdating ? '#F59E0B' : '#6366F1' }}>
        {mutation.isPending ? 'Guardando...' : isUpdating ? 'Actualizar consumo del día' : 'Registrar consumo'}
      </button>
    </form>
  )
}
