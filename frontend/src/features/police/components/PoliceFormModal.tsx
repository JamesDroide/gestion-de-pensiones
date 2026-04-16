import { useState } from 'react'
import { X, Save } from 'lucide-react'
import type { Police, CreatePoliceInput } from '../types'

interface PoliceFormModalProps {
  initial?: Police
  onSubmit: (data: CreatePoliceInput) => void
  onClose: () => void
  isLoading?: boolean
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748B',
  marginBottom: '8px',
}

const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  height: '48px',
  padding: '0 16px',
  fontSize: '13.5px',
  borderRadius: '12px',
  border: '1.5px solid #E2E8F0',
  backgroundColor: '#F8FAFC',
  color: '#1E293B',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms, background-color 150ms',
}

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#6366F1'
  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'
  e.target.style.backgroundColor = '#ffffff'
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#E2E8F0'
  e.target.style.boxShadow = 'none'
  e.target.style.backgroundColor = '#F8FAFC'
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  )
}

export function PoliceFormModal({ initial, onSubmit, onClose, isLoading }: PoliceFormModalProps) {
  const [form, setForm] = useState<CreatePoliceInput>({
    full_name: initial?.full_name ?? '',
    badge_code: initial?.badge_code ?? '',
    rank: initial?.rank ?? '',
    phone: initial?.phone ?? '',
    notes: initial?.notes ?? '',
  })

  const set = (field: keyof CreatePoliceInput, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white w-full mx-4"
        style={{
          maxWidth: '448px',
          borderRadius: '20px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div>
            <h2
              className="font-bold"
              style={{ fontSize: '15px', color: '#0F172A', lineHeight: 1.3 }}
            >
              {initial ? 'Editar policía' : 'Nuevo pensionista policía'}
            </h2>
            <p
              className="mt-1"
              style={{ fontSize: '12px', color: '#94A3B8' }}
            >
              {initial
                ? 'Modifica los datos del registro'
                : 'Completa los datos del nuevo oficial'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl cursor-pointer"
            style={{
              width: '32px',
              height: '32px',
              color: '#94A3B8',
              backgroundColor: '#F8FAFC',
              border: 'none',
              transition: 'background-color 150ms, color 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#F1F5F9'
              e.currentTarget.style.color = '#475569'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#F8FAFC'
              e.currentTarget.style.color = '#94A3B8'
            }}
            aria-label="Cerrar"
          >
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <Field label="Nombre completo *">
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              required
              placeholder="Ej: Juan Carlos Pérez"
              style={INPUT_BASE}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </Field>

          {!initial && (
            <Field label="Placa o código *">
              <input
                type="text"
                value={form.badge_code}
                onChange={e => set('badge_code', e.target.value)}
                required
                placeholder="Único en el sistema"
                style={INPUT_BASE}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </Field>
          )}

          <Field label="Grado">
            <input
              type="text"
              value={form.rank ?? ''}
              onChange={e => set('rank', e.target.value)}
              placeholder="Ej: Subteniente, Mayor, Coronel"
              style={INPUT_BASE}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </Field>

          <Field label="Teléfono">
            <input
              type="text"
              value={form.phone ?? ''}
              onChange={e => set('phone', e.target.value)}
              placeholder="Opcional"
              style={INPUT_BASE}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </Field>

          <Field label="Notas">
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Observaciones opcionales"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '13.5px',
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#1E293B',
                outline: 'none',
                resize: 'none',
                transition: 'border-color 150ms, box-shadow 150ms, background-color 150ms',
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </Field>

          {/* Divisor */}
          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-semibold rounded-full cursor-pointer"
              style={{
                height: '48px',
                fontSize: '13.5px',
                border: '1.5px solid #6366F1',
                color: '#6366F1',
                backgroundColor: 'transparent',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF2FF' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 font-semibold text-white rounded-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                height: '48px',
                fontSize: '13.5px',
                backgroundColor: '#6366F1',
                border: 'none',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4F46E5' }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#6366F1' }}
            >
              <Save style={{ width: '15px', height: '15px' }} />
              {isLoading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
