import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Users, Shield, Save, X, Info,
  Coffee, Utensils, Moon, CheckCircle2,
  TrendingDown, Receipt,
} from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { usePricing, useUpdatePricing } from '../hooks/useSettings'
import { useAuth } from '@/features/auth/hooks/useAuth'

const FONT = "'Inter', system-ui, sans-serif"

// ── Estilos globales inyectados una sola vez ──────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .cfg-input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    height: 34px;
    border-radius: 8px;
    border: 1.5px solid #E2E8F0;
    background-color: #F8FAFC;
    color: #1E293B;
    font-size: 13px;
    font-weight: 600;
    padding: 0 10px;
    outline: none;
    font-family: ${FONT};
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cfg-input:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    background-color: #fff;
  }
  .cfg-save-btn {
    width: 100%;
    height: 38px;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    font-family: ${FONT};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    letter-spacing: -0.01em;
    transition: background-color 0.18s, box-shadow 0.18s, transform 0.1s;
  }
  .cfg-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .cfg-save-btn:active:not(:disabled) { transform: translateY(0); }
  .cfg-save-btn:disabled { background-color: #94A3B8 !important; cursor: not-allowed; }
`

// ── Sub-component: tarjeta de precio inline ───────────────────────────────────
interface InlinePriceCardProps {
  label: string
  sublabel: string
  icon: React.ReactNode
  iconBg: string
  borderColor: string
  cardBg: string
  value: string
  onChange: (v: string) => void
}

function InlinePriceCard({
  label, sublabel, icon, iconBg, borderColor, cardBg, value, onChange,
}: InlinePriceCardProps) {
  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: '10px',
      border: `1.5px solid ${borderColor}`,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      minWidth: 0,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '6px',
          backgroundColor: iconBg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#0F172A', fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '9px', color: '#94A3B8', fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sublabel}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
        <span style={{
          width: '26px', flexShrink: 0,
          height: '34px', borderRadius: '7px',
          border: '1.5px solid #E2E8F0',
          backgroundColor: '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 800, color: '#475569', fontFamily: FONT,
        }}>S/</span>
        <input
          className="cfg-input"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

// ── Sub-component: campo ancho completo ───────────────────────────────────────
interface FullWidthFieldProps {
  label: string
  sublabel: string
  icon: React.ReactNode
  iconBg: string
  accentColor: string
  value: string
  onChange: (v: string) => void
  total: string
}

function FullWidthField({ label, sublabel, icon, iconBg, accentColor, value, onChange, total }: FullWidthFieldProps) {
  return (
    <div style={{
      backgroundColor: '#FAFBFF',
      borderRadius: '10px',
      border: '1.5px solid #F1F5F9',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px',
          backgroundColor: iconBg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#0F172A', fontFamily: FONT }}>{label}</p>
          <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8', fontFamily: FONT }}>{sublabel}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: '9px', color: '#94A3B8', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>total</p>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: accentColor, fontFamily: FONT, letterSpacing: '-0.03em', lineHeight: 1.1 }}>S/ {total}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        <span style={{
          width: '34px', flexShrink: 0,
          height: '34px', borderRadius: '8px',
          border: '1.5px solid #E2E8F0',
          backgroundColor: '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 800, color: '#475569', fontFamily: FONT,
        }}>S/</span>
        <input
          className="cfg-input"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

// ── Sub-component: CardHeader ─────────────────────────────────────────────────
function SectionHeader({
  icon, iconBg, accentColor, title, subtitle, badge, badgeBg, badgeColor,
}: {
  icon: React.ReactNode; iconBg: string; accentColor: string
  title: string; subtitle: string; badge: string; badgeBg: string; badgeColor: string
}) {
  return (
    <div style={{
      padding: '12px 16px 10px',
      borderBottom: '1.5px solid #F1F5F9',
      background: `linear-gradient(135deg, ${accentColor}07 0%, transparent 60%)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 10px ${accentColor}22` }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: FONT, letterSpacing: '-0.02em' }}>{title}</h3>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0', fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>
        </div>
        <div style={{ padding: '3px 8px', borderRadius: '999px', backgroundColor: badgeBg, color: badgeColor, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
          {badge}
        </div>
      </div>
    </div>
  )
}

// ── Sub-component: SuccessToast ───────────────────────────────────────────────
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', borderRadius: '14px', backgroundColor: '#fff',
      border: '1.5px solid #BBF7D0',
      boxShadow: '0 8px 32px rgba(16,185,129,0.18), 0 2px 8px rgba(0,0,0,0.06)',
      fontFamily: FONT, minWidth: '260px', animation: 'slideInRight 0.3s ease',
    }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10B981' }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#064E3B' }}>Cambios guardados</p>
        <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#10B981', fontWeight: 500 }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '6px', color: '#94A3B8', display: 'flex' }}>
        <X style={{ width: '13px', height: '13px' }} />
      </button>
    </div>
  )
}

// ── Separador visual ──────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
    </div>
  )
}

// ── Botón guardar ─────────────────────────────────────────────────────────────
function SaveBtn({ isPending, label, accentColor, shadowColor }: {
  isPending: boolean; label: string; accentColor: string; shadowColor: string
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="cfg-save-btn"
      style={{
        backgroundColor: accentColor,
        color: '#fff',
        boxShadow: isPending ? 'none' : `0 4px 14px ${shadowColor}`,
      }}
    >
      {isPending ? (
        <>
          <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          Guardando...
        </>
      ) : (
        <>
          <Save style={{ width: '14px', height: '14px' }} />
          {label}
        </>
      )}
    </button>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function SettingsPage() {
  const { isAdmin } = useAuth()
  const { data: pricing, isLoading } = usePricing()
  const updateMutation = useUpdatePricing()

  const [civilForm, setCivilForm] = useState({
    menu_price: '12.00',
    menu_price_normal: '10.00',
    menu_price_2_meals: '9.00',
    menu_price_3_meals: '8.00',
  })
  const [policeForm, setPoliceForm] = useState({
    breakfast_ticket_value: '4.00',
    lunch_ticket_value: '8.00',
    dinner_price: '6.00',
    dinner_ticket_equivalence: 2,
  })
  const [saved, setSaved] = useState('')

  useEffect(() => {
    if (pricing) {
      setCivilForm({
        menu_price: pricing.menu_price,
        menu_price_normal: pricing.menu_price_normal,
        menu_price_2_meals: pricing.menu_price_2_meals,
        menu_price_3_meals: pricing.menu_price_3_meals,
      })
      setPoliceForm({
        breakfast_ticket_value: pricing.breakfast_ticket_value,
        lunch_ticket_value: pricing.lunch_ticket_value,
        dinner_price: pricing.dinner_price,
        dinner_ticket_equivalence: pricing.dinner_ticket_equivalence,
      })
    }
  }, [pricing])

  if (!isAdmin) return <Navigate to="/pensioners" replace />
  if (isLoading) return <LoadingSpinner />

  const handleSaveCivil = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMutation.mutateAsync({
      menu_price: Number(civilForm.menu_price),
      menu_price_normal: Number(civilForm.menu_price_normal),
      menu_price_2_meals: Number(civilForm.menu_price_2_meals),
      menu_price_3_meals: Number(civilForm.menu_price_3_meals),
    })
    setSaved('Precios de pensionistas actualizados')
    setTimeout(() => setSaved(''), 3500)
  }

  const handleSavePolice = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateMutation.mutateAsync({
      breakfast_ticket_value: Number(policeForm.breakfast_ticket_value),
      lunch_ticket_value: Number(policeForm.lunch_ticket_value),
      dinner_price: Number(policeForm.dinner_price),
      dinner_ticket_equivalence: Number(policeForm.dinner_ticket_equivalence),
    })
    setSaved('Valores de tickets actualizados')
    setTimeout(() => setSaved(''), 3500)
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {saved && <SuccessToast message={saved} onClose={() => setSaved('')} />}

      <div style={{ fontFamily: FONT }}>

        <PageHeader
          title="Configuración"
          description="Precios del sistema — los cambios no afectan registros históricos"
        />

        {/* Banner aviso */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 14px', borderRadius: '10px',
          backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A',
          marginBottom: '14px',
        }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info style={{ width: '14px', height: '14px', color: '#D97706' }} />
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#92400E', fontFamily: FONT, fontWeight: 500, lineHeight: 1.4 }}>
            <strong>Los cambios aplican solo hacia adelante</strong>, no alteran registros ni cobros ya generados.
          </p>
        </div>

        {/* Grid de los 2 formularios */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '14px',
          alignItems: 'stretch',
        }}>

          {/* ── FORM PENSIONISTAS ─────────────────────────────────────────── */}
          <form onSubmit={handleSaveCivil} style={{
            backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(99,102,241,0.06)',
            border: '1.5px solid #F1F5F9',
          }}>
            <SectionHeader
              icon={<Users style={{ width: '18px', height: '18px', color: '#6366F1' }} />}
              iconBg="#EEF2FF" accentColor="#6366F1"
              title="Pensionistas"
              subtitle="Precio del menú + descuento escalonado por comidas"
              badge="Pensionista" badgeBg="#EEF2FF" badgeColor="#6366F1"
            />

            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* Precio base — fila completa */}
              <FullWidthField
                label="Precio base del menú"
                sublabel="Para pensionistas sin reglas de pensión"
                icon={<Receipt style={{ width: '13px', height: '13px', color: '#F97316' }} />}
                iconBg="#FFF7ED"
                accentColor="#F97316"
                value={civilForm.menu_price}
                onChange={v => setCivilForm(p => ({ ...p, menu_price: v }))}
                total={Number(civilForm.menu_price).toFixed(2)}
              />

              <Divider label="Precios escalonados por comida" />

              {/* 3 tarjetas en una sola fila — grid con minWidth 0 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '6px',
              }}>
                <InlinePriceCard
                  label="1 Comida"
                  sublabel={`= S/ ${Number(civilForm.menu_price_normal).toFixed(2)}`}
                  icon={<Utensils style={{ width: '12px', height: '12px', color: '#6366F1' }} />}
                  iconBg="#EEF2FF" borderColor="#E0E7FF" cardBg="#F8F9FF"
                  value={civilForm.menu_price_normal}
                  onChange={v => setCivilForm(p => ({ ...p, menu_price_normal: v }))}
                />
                <InlinePriceCard
                  label="2 Comidas"
                  sublabel={`= S/ ${(Number(civilForm.menu_price_2_meals) * 2).toFixed(2)}`}
                  icon={<Utensils style={{ width: '12px', height: '12px', color: '#8B5CF6' }} />}
                  iconBg="#F3F0FF" borderColor="#DDD6FE" cardBg="#FAF8FF"
                  value={civilForm.menu_price_2_meals}
                  onChange={v => setCivilForm(p => ({ ...p, menu_price_2_meals: v }))}
                />
                <InlinePriceCard
                  label="3 Comidas"
                  sublabel={`= S/ ${(Number(civilForm.menu_price_3_meals) * 3).toFixed(2)}`}
                  icon={<TrendingDown style={{ width: '12px', height: '12px', color: '#10B981' }} />}
                  iconBg="#ECFDF5" borderColor="#A7F3D0" cardBg="#F0FDF8"
                  value={civilForm.menu_price_3_meals}
                  onChange={v => setCivilForm(p => ({ ...p, menu_price_3_meals: v }))}
                />
              </div>

              <SaveBtn
                isPending={updateMutation.isPending}
                label="Guardar precios pensionistas"
                accentColor="#6366F1"
                shadowColor="rgba(99,102,241,0.35)"
              />
            </div>
          </form>

          {/* ── FORM POLICÍAS ─────────────────────────────────────────────── */}
          <form onSubmit={handleSavePolice} style={{
            backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(59,130,246,0.06)',
            border: '1.5px solid #F1F5F9',
          }}>
            <SectionHeader
              icon={<Shield style={{ width: '18px', height: '18px', color: '#3B82F6' }} />}
              iconBg="#EFF6FF" accentColor="#3B82F6"
              title="Pensionistas Policías"
              subtitle="Valores de tickets físicos por tiempo de comida"
              badge="PNP" badgeBg="#EFF6FF" badgeColor="#3B82F6"
            />

            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

              <FullWidthField
                label="Precio de cena (sin ticket)"
                sublabel="Valor en efectivo cuando no hay ticket físico"
                icon={<Moon style={{ width: '13px', height: '13px', color: '#8B5CF6' }} />}
                iconBg="#F3F0FF"
                accentColor="#8B5CF6"
                value={policeForm.dinner_price}
                onChange={v => setPoliceForm(p => ({ ...p, dinner_price: v }))}
                total={Number(policeForm.dinner_price).toFixed(2)}
              />

              <Divider label="Valor de tickets por comida" />

              {/* 2 tarjetas de tickets */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '6px',
              }}>
                <InlinePriceCard
                  label="Desayuno"
                  sublabel={`S/ ${Number(policeForm.breakfast_ticket_value).toFixed(2)}`}
                  icon={<Coffee style={{ width: '12px', height: '12px', color: '#F59E0B' }} />}
                  iconBg="#FFFBEB" borderColor="#FDE68A" cardBg="#FFFDF5"
                  value={policeForm.breakfast_ticket_value}
                  onChange={v => setPoliceForm(p => ({ ...p, breakfast_ticket_value: v }))}
                />
                <InlinePriceCard
                  label="Almuerzo"
                  sublabel={`S/ ${Number(policeForm.lunch_ticket_value).toFixed(2)}`}
                  icon={<Utensils style={{ width: '12px', height: '12px', color: '#3B82F6' }} />}
                  iconBg="#EFF6FF" borderColor="#BFDBFE" cardBg="#F0F7FF"
                  value={policeForm.lunch_ticket_value}
                  onChange={v => setPoliceForm(p => ({ ...p, lunch_ticket_value: v }))}
                />
              </div>

              <SaveBtn
                isPending={updateMutation.isPending}
                label="Guardar valores de policía"
                accentColor="#3B82F6"
                shadowColor="rgba(59,130,246,0.35)"
              />
            </div>
          </form>

        </div>

      </div>
    </>
  )
}
