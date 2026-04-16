import { useState } from 'react'
import { X, Save, Users, Shield, Ban } from 'lucide-react'
import type { Pensionista, CreatePensionerInput, PensionerType } from '../types'
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
  height: '48px',
  padding: '0 16px',
  fontSize: '14px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '12px',
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

export function CivilianFormModal({ initial, onSubmit, onClose, isLoading }: Props) {
  const isEditing = !!initial
  const { data: pricing } = usePricing()

  const [form, setForm] = useState<CreatePensionerInput>({
    pensioner_type: initial?.pensioner_type ?? 'civil',
    full_name: initial?.full_name ?? '',
    dni: initial?.dni ?? '',
    payment_mode: initial?.payment_mode ?? 'monthly',
    no_pension_rules: initial?.no_pension_rules ?? false,
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
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: active ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                        backgroundColor: active ? '#EEF2FF' : '#FAFAFA',
                        color: active ? '#4F46E5' : '#64748B',
                        fontWeight: active ? 700 : 500,
                        fontSize: '14px',
                        boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.10)' : 'none',
                      }}
                    >
                      <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                      {type === 'civil' ? 'Civil' : 'Policía'}
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

          {/* DNI — solo creación, 8 dígitos */}
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
                  borderRadius: '12px',
                  border: form.no_pension_rules ? '1.5px solid #F97316' : '1.5px solid #E2E8F0',
                  backgroundColor: form.no_pension_rules ? '#FFF7ED' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {/* Switch visual */}
                <div
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '999px',
                    backgroundColor: form.no_pension_rules ? '#F97316' : '#CBD5E1',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'background-color 180ms',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: form.no_pension_rules ? '19px' : '3px',
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
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: form.no_pension_rules ? '#C2410C' : '#1E293B' }}>
                    No aplica reglas de pensiones
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                    Cobra el precio del menú directo
                  </p>
                </div>

                <Ban style={{ width: '15px', height: '15px', color: form.no_pension_rules ? '#F97316' : '#CBD5E1', flexShrink: 0 }} />
              </button>

              {/* Modalidad de cobro — oculta si no_pension_rules está activo */}
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
                /* Card de precio del menú cuando no aplican reglas */
                <div
                  style={{
                    borderRadius: '12px',
                    border: '1.5px solid #FED7AA',
                    backgroundColor: '#FFF7ED',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#FFEDD5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#EA580C' }}>S/</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Precio del menú
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 800, color: '#C2410C', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      S/ {Number(menuPrice).toFixed(2)}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#EA580C' }}>
                      Configurable en Ajustes del sistema
                    </p>
                  </div>
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

          {/* Teléfono — obligatorio, 9 dígitos */}
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
              style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '1.5px solid #E2E8F0', borderRadius: '12px', backgroundColor: '#F8FAFC', color: '#1E293B', outline: 'none', resize: 'none', transition: 'all 150ms' }}
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
              style={{ height: '48px', borderRadius: '999px', border: '1.5px solid #6366F1', color: '#6366F1', backgroundColor: 'transparent', fontSize: '14px', fontWeight: 600 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF2FF' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 transition-all duration-150"
              style={{ height: '48px', borderRadius: '999px', border: 'none', backgroundColor: '#6366F1', color: '#ffffff', fontSize: '14px', fontWeight: 600, opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4F46E5' }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#6366F1' }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
