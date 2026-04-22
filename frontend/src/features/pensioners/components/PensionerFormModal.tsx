import { useState } from 'react'
import { X, Save, Users, Shield, Ban, ChefHat, LayoutList } from 'lucide-react'
import type { Pensionista, CreatePensionerInput, PensionerType, NoPensionPriceMode } from '../types'
import { PAYMENT_MODE_LABELS } from '../types'
import type { PaymentMode } from '@/shared/types'
import { usePricing } from '@/features/settings/hooks/useSettings'

interface Props {
  initial?: Pensionista
  onSubmit: (data: CreatePensionerInput) => void
  onClose: () => void
  isLoading?: boolean
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#64748B',
  marginBottom: '8px',
}

const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 14px',
  fontSize: '14px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  backgroundColor: '#F8FAFC',
  color: '#1E293B',
  outline: 'none',
  transition: 'all 150ms',
}

const PRICE_INPUT: React.CSSProperties = {
  width: '100%',
  height: '40px',
  padding: '0 12px 0 36px',
  fontSize: '14px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  backgroundColor: '#F8FAFC',
  color: '#1E293B',
  outline: 'none',
  transition: 'all 150ms',
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#6366F1'
  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
  e.target.style.backgroundColor = '#ffffff'
}

function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#E2E8F0'
  e.target.style.boxShadow = 'none'
  e.target.style.backgroundColor = '#F8FAFC'
}

function onlyDigits(v: string) { return v.replace(/\D/g, '') }

const PRICE_MODE_OPTIONS: { value: NoPensionPriceMode; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'menu_price', label: 'Precio del menú', desc: 'Precio global por comida', icon: ChefHat },
  { value: 'custom_tiered', label: 'Escalonado propio', desc: '1, 2 o 3 comidas a precios distintos', icon: LayoutList },
  { value: 'custom_by_type', label: 'Por tipo de comida', desc: 'Desayuno, almuerzo y cena a precio fijo', icon: Users },
]

export function PensionerFormModal({ initial, onSubmit, onClose, isLoading }: Props) {
  const isEditing = !!initial
  const { data: pricing } = usePricing()

  const [form, setForm] = useState<CreatePensionerInput>({
    pensioner_type: initial?.pensioner_type ?? 'civil',
    full_name: initial?.full_name ?? '',
    dni: initial?.dni ?? '',
    payment_mode: initial?.payment_mode ?? 'monthly',
    no_pension_rules: initial?.no_pension_rules ?? false,
    no_pension_price_mode: initial?.no_pension_price_mode ?? 'menu_price',
    custom_price_1_meal: initial?.custom_price_1_meal ? Number(initial.custom_price_1_meal) : null,
    custom_price_2_meals: initial?.custom_price_2_meals ? Number(initial.custom_price_2_meals) : null,
    custom_price_3_meals: initial?.custom_price_3_meals ? Number(initial.custom_price_3_meals) : null,
    custom_breakfast_price: initial?.custom_breakfast_price ? Number(initial.custom_breakfast_price) : null,
    custom_lunch_price: initial?.custom_lunch_price ? Number(initial.custom_lunch_price) : null,
    custom_dinner_price: initial?.custom_dinner_price ? Number(initial.custom_dinner_price) : null,
    rank: initial?.rank ?? '',
    phone: initial?.phone ?? '',
    notes: initial?.notes ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const menuPrice = pricing?.menu_price ?? '0.00'

  function set<K extends keyof CreatePensionerInput>(field: K, value: CreatePensionerInput[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'El nombre es obligatorio'
    if (!isEditing && form.dni.length !== 8) e.dni = 'El DNI debe tener exactamente 8 dígitos'
    if (form.phone.length !== 9) e.phone = 'El teléfono debe tener exactamente 9 dígitos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const priceMode = form.no_pension_price_mode ?? 'menu_price'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white w-full mx-4 overflow-y-auto"
        style={{
          maxWidth: '480px',
          maxHeight: '90vh',
          borderRadius: '20px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {isEditing ? 'Editar pensionista' : 'Nuevo pensionista'}
            </h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              {isEditing ? 'Modifica los datos del registro' : 'Completa los datos del nuevo pensionista'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center cursor-pointer"
            style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#F8FAFC', color: '#94A3B8', border: 'none', transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#94A3B8' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Tipo — solo en creación */}
          {!isEditing && (
            <div>
              <label style={LABEL_STYLE}>Tipo de pensionista *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['civil', 'police'] as PensionerType[]).map(type => {
                  const active = form.pensioner_type === type
                  const Icon = type === 'civil' ? Users : Shield
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('pensioner_type', type)}
                      className="flex items-center gap-2 cursor-pointer transition-all duration-150"
                      style={{
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: active ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                        backgroundColor: active ? '#EEF2FF' : '#FAFAFA',
                        color: active ? '#4F46E5' : '#64748B',
                        fontWeight: active ? 700 : 500,
                        fontSize: '14px',
                        boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.10)' : 'none',
                      }}
                    >
                      <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      {type === 'civil' ? 'Pensionista' : 'Policía'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label style={LABEL_STYLE}>Nombre completo *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              required
              placeholder="Ej: Carlos Mendoza"
              style={INPUT_BASE}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {errors.full_name && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.full_name}</p>}
          </div>

          {/* DNI — solo creación */}
          {!isEditing && (
            <div>
              <label style={LABEL_STYLE}>DNI *</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.dni}
                onChange={e => set('dni', onlyDigits(e.target.value).slice(0, 8))}
                required
                placeholder="8 dígitos"
                maxLength={8}
                style={INPUT_BASE}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <p style={{ fontSize: '11px', color: form.dni.length === 8 ? '#10B981' : '#94A3B8', marginTop: '4px' }}>
                {form.dni.length}/8 dígitos · solo números
              </p>
              {errors.dni && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>{errors.dni}</p>}
            </div>
          )}

          {/* Modalidad + toggle — solo civil */}
          {form.pensioner_type === 'civil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Toggle: No aplica reglas de pensiones */}
              <button
                type="button"
                onClick={() => set('no_pension_rules', !form.no_pension_rules)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: form.no_pension_rules ? '1.5px solid #6366F1' : '1.5px solid #E2E8F0',
                  backgroundColor: form.no_pension_rules ? '#EEF2FF' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '18px',
                    borderRadius: '999px',
                    backgroundColor: form.no_pension_rules ? '#6366F1' : '#CBD5E1',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'background-color 180ms',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: form.no_pension_rules ? '18px' : '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
                      transition: 'left 180ms',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: form.no_pension_rules ? '#4F46E5' : '#1E293B' }}>
                    No aplica reglas de pensiones
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                    Precio personalizado por este pensionista
                  </p>
                </div>
                <Ban style={{ width: '14px', height: '14px', color: form.no_pension_rules ? '#6366F1' : '#CBD5E1', flexShrink: 0 }} />
              </button>

              {/* Modalidad de cobro — oculta si no_pension_rules activo */}
              {!form.no_pension_rules ? (
                <div>
                  <label style={LABEL_STYLE}>Modalidad de cobro *</label>
                  <select
                    value={form.payment_mode}
                    onChange={e => set('payment_mode', e.target.value as PaymentMode)}
                    style={{ ...INPUT_BASE, cursor: 'pointer' }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    {(Object.entries(PAYMENT_MODE_LABELS) as [PaymentMode, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Selector de modo de precio */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={LABEL_STYLE}>Modo de precio *</label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {PRICE_MODE_OPTIONS.map(opt => {
                      const active = priceMode === opt.value
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set('no_pension_price_mode', opt.value)}
                          className="flex items-center gap-10px cursor-pointer transition-all duration-150"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: active ? '1.5px solid #6366F1' : '1.5px solid #E2E8F0',
                            backgroundColor: active ? '#EEF2FF' : '#FAFAFA',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 150ms',
                          }}
                        >
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                            backgroundColor: active ? '#E0E7FF' : '#F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon style={{ width: '14px', height: '14px', color: active ? '#4F46E5' : '#94A3B8' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? '#4F46E5' : '#1E293B' }}>
                              {opt.label}
                            </p>
                            <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94A3B8' }}>{opt.desc}</p>
                          </div>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                            border: active ? '5px solid #6366F1' : '1.5px solid #CBD5E1',
                            backgroundColor: '#fff',
                          }} />
                        </button>
                      )
                    })}
                  </div>

                  {/* Campos según modo seleccionado */}
                  {priceMode === 'menu_price' && (
                    <div
                      style={{
                        borderRadius: '10px',
                        border: '1.5px solid #E0E7FF',
                        backgroundColor: '#EEF2FF',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#4F46E5' }}>S/</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Precio del menú actual
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#4F46E5', lineHeight: 1 }}>
                          S/ {Number(menuPrice).toFixed(2)}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6366F1' }}>
                          Configurable en Ajustes del sistema
                        </p>
                      </div>
                    </div>
                  )}

                  {priceMode === 'custom_tiered' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { key: 'custom_price_1_meal' as const, label: '1 comida' },
                        { key: 'custom_price_2_meals' as const, label: '2 comidas' },
                        { key: 'custom_price_3_meals' as const, label: '3 comidas' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label style={{ ...LABEL_STYLE, marginBottom: '4px' }}>{label}</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>S/</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={form[key] ?? ''}
                              onChange={e => set(key, e.target.value === '' ? null : Number(e.target.value))}
                              placeholder="0.00"
                              style={PRICE_INPUT}
                              onFocus={onFocus}
                              onBlur={onBlur}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {priceMode === 'custom_by_type' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { key: 'custom_breakfast_price' as const, label: 'Desayuno' },
                        { key: 'custom_lunch_price' as const, label: 'Almuerzo' },
                        { key: 'custom_dinner_price' as const, label: 'Cena' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label style={{ ...LABEL_STYLE, marginBottom: '4px' }}>{label}</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>S/</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={form[key] ?? ''}
                              onChange={e => set(key, e.target.value === '' ? null : Number(e.target.value))}
                              placeholder="0.00"
                              style={PRICE_INPUT}
                              onFocus={onFocus}
                              onBlur={onBlur}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grado — solo policía */}
          {form.pensioner_type === 'police' && (
            <div>
              <label style={LABEL_STYLE}>Grado</label>
              <input
                type="text"
                value={form.rank ?? ''}
                onChange={e => set('rank', e.target.value)}
                placeholder="Ej: Subteniente, Mayor, Coronel"
                style={INPUT_BASE}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          )}

          {/* Teléfono */}
          <div>
            <label style={LABEL_STYLE}>Teléfono *</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.phone}
              onChange={e => set('phone', onlyDigits(e.target.value).slice(0, 9))}
              required
              placeholder="9 dígitos"
              maxLength={9}
              style={INPUT_BASE}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p style={{ fontSize: '11px', color: form.phone.length === 9 ? '#10B981' : '#94A3B8', marginTop: '4px' }}>
              {form.phone.length}/9 dígitos · solo números
            </p>
            {errors.phone && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>{errors.phone}</p>}
          </div>

          {/* Notas */}
          <div>
            <label style={LABEL_STYLE}>Notas</label>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Observaciones opcionales"
              style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC', color: '#1E293B', outline: 'none', resize: 'none', transition: 'all 150ms' }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer transition-all duration-150"
              style={{ height: '46px', borderRadius: '999px', border: '1.5px solid #6366F1', color: '#6366F1', backgroundColor: 'transparent', fontSize: '14px', fontWeight: 600 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF2FF' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 transition-all duration-150"
              style={{ height: '46px', borderRadius: '999px', border: 'none', backgroundColor: '#6366F1', color: '#ffffff', fontSize: '14px', fontWeight: 600, opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4F46E5' }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#6366F1' }}
            >
              <Save style={{ width: '15px', height: '15px' }} />
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
