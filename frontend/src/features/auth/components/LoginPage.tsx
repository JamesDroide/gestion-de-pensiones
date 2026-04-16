import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, ArrowRight, Eye, EyeOff, Mail, Lock, Check } from 'lucide-react'
import { login } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

/* ─────────────────────────────────────────────
   Datos estáticos
───────────────────────────────────────────── */
const features = [
  'Registro de consumo en segundos',
  'Precio escalonado automático',
  'Control de tickets de policías',
]

/* ─────────────────────────────────────────────
   Estilos de keyframes inyectados una sola vez
───────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes lp-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes lp-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes lp-glow-pulse {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 0.85; }
  }
  @keyframes lp-float {
    0%, 100% { transform: translateY(0px) rotate(-6deg); }
    50%       { transform: translateY(-8px) rotate(-6deg); }
  }
  .lp-spin    { animation: lp-spin 0.9s linear infinite; }
  .lp-fade-up { animation: lp-fade-up 0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .lp-glow    { animation: lp-glow-pulse 4s ease-in-out infinite; }
  .lp-float   { animation: lp-float 5s ease-in-out infinite; }

  .lp-input:focus {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.14), 0 1px 3px rgba(99,102,241,0.08) !important;
  }
  .lp-btn-submit:not(:disabled):hover {
    background-color: #4F46E5 !important;
    box-shadow: 0 8px 28px rgba(99,102,241,0.52) !important;
    transform: translateY(-1px) !important;
  }
  .lp-btn-submit:not(:disabled):active {
    transform: translateY(0) !important;
    box-shadow: 0 4px 14px rgba(99,102,241,0.38) !important;
  }
  .lp-btn-submit { transition: background-color 0.18s, box-shadow 0.18s, transform 0.12s; }

  .lp-eye-btn:hover { color: #6366F1 !important; }
  .lp-eye-btn { transition: color 0.15s; }

  .lp-forgot:hover { color: #4338CA !important; }
  .lp-forgot { transition: color 0.15s; }

  .lp-checkbox-label:hover { color: #334155 !important; }
  .lp-checkbox-label { transition: color 0.15s; }

  /* Decorative orbs */
  .lp-orb-1 {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
`

/* ─────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────── */
export function LoginPage() {
  const navigate     = useNavigate()
  const { saveUser } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      saveUser(user)
      navigate('/pensioners')
    } catch {
      setError('Email o contraseña incorrectos. Verifica tus datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Keyframes globales */}
      <style>{GLOBAL_STYLES}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          overflow: 'hidden',
        }}
      >
        {/* ══════════════════════════════════════════
            PANEL IZQUIERDO — oscuro, premium
        ══════════════════════════════════════════ */}
        <div
          style={{
            width: '48%',
            minHeight: '100vh',
            background: 'linear-gradient(155deg, #07061A 0%, #0D0B2A 55%, #0A0825 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 56px',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="hidden lg:flex"
        >
          {/* Orb superior — resplandor indigo principal */}
          <div
            className="lp-orb-1 lp-glow"
            style={{
              top: '-120px',
              right: '-80px',
              width: '520px',
              height: '520px',
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.38) 0%, rgba(79,70,229,0.18) 40%, transparent 70%)',
            }}
          />

          {/* Orb inferior izquierdo — acento violeta */}
          <div
            className="lp-orb-1"
            style={{
              bottom: '-160px',
              left: '-100px',
              width: '420px',
              height: '420px',
              background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.22) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Orb central sutil */}
          <div
            className="lp-orb-1"
            style={{
              top: '40%',
              left: '30%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Elemento decorativo flotante — tarjeta glassmorphism */}
          <div
            className="lp-float"
            style={{
              position: 'absolute',
              top: '38%',
              right: '-28px',
              width: '120px',
              height: '72px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3].map(i => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: i === 1 ? '#6366F1' : i === 2 ? '#8B5CF6' : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </div>
            <div style={{ width: '72px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(99,102,241,0.35)' }} />
            <div style={{ width: '50px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* ── Logo ── */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
              }}
            >
              <ChefHat style={{ width: '20px', height: '20px', color: '#fff' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.2px' }}>
              Gestión de Pensionistas
            </span>
          </div>

          {/* ── Contenido central ── */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '999px',
                padding: '5px 14px',
                marginBottom: '28px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366F1' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.3px' }}>
                Sistema de gestión
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: '62px',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.0,
                letterSpacing: '-3px',
                marginBottom: '24px',
              }}
            >
              Control total<br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #818CF8 0%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                de tu
              </span>
              <br />restaurante
            </h1>

            {/* Descripción */}
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.75',
                color: 'rgba(255,255,255,0.4)',
                maxWidth: '300px',
                marginBottom: '40px',
                fontWeight: 400,
              }}
            >
              Optimiza la gestión diaria de comensales, pagos y consumos en una plataforma centralizada diseñada para la eficiencia.
            </p>

            {/* Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {features.map((f, idx) => (
                <div
                  key={f}
                  className="lp-fade-up"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    animationDelay: `${0.1 + idx * 0.08}s`,
                  }}
                >
                  {/* Check badge */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99,102,241,0.18)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check style={{ width: '12px', height: '12px', color: '#818CF8' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Divider + stats */}
            <div
              style={{
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                gap: '32px',
              }}
            >
              {[
                { value: '100%', label: 'Digital' },
                { value: '24/7', label: 'Disponible' },
                { value: '0s', label: 'Setup' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer izquierdo ── */}
          <p style={{ position: 'relative', zIndex: 10, fontSize: '12px', color: 'rgba(255,255,255,0.18)' }}>
            &copy; 2026 Gestión de Pensionistas. Todos los derechos reservados.
          </p>
        </div>

        {/* ══════════════════════════════════════════
            PANEL DERECHO — fondo texturizado, card
        ══════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            position: 'relative',
            background: 'linear-gradient(145deg, #F5F3FF 0%, #EEF2FF 40%, #F0F4FF 100%)',
          }}
        >
          {/* Decoracion fondo derecho */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 65%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 65%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <div className="lp-fade-up" style={{ width: '100%', maxWidth: '448px', position: 'relative', zIndex: 1 }}>

            {/* Logo mobile (solo visible < lg) */}
            <div
              className="lg:hidden"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.38)',
                }}
              >
                <ChefHat style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>Gestión de Pensionistas</span>
            </div>

            {/* ── Card ── */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '28px',
                padding: '44px 40px 40px',
                boxShadow:
                  '0 0 0 1px rgba(99,102,241,0.06), 0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.07), 0 32px 80px rgba(99,102,241,0.1)',
              }}
            >
              {/* Header card */}
              <div style={{ marginBottom: '32px' }}>
                {/* Icono */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <ChefHat style={{ width: '24px', height: '24px', color: '#6366F1' }} />
                </div>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.8px',
                    marginBottom: '6px',
                    lineHeight: 1.2,
                  }}
                >
                  Bienvenido
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 400, lineHeight: 1.6 }}>
                  Ingresa tus credenciales para acceder al sistema.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* ── Campo email ── */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#475569',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Correo electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: '#94A3B8',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@pensionistas.com"
                      required
                      className="lp-input"
                      style={{
                        width: '100%',
                        height: '52px',
                        paddingLeft: '44px',
                        paddingRight: '16px',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        color: '#0F172A',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.18s, box-shadow 0.18s',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    />
                  </div>
                </div>

                {/* ── Campo contraseña ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#475569',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      className="lp-forgot"
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#6366F1',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                      tabIndex={-1}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: '#94A3B8',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="lp-input"
                      style={{
                        width: '100%',
                        height: '52px',
                        paddingLeft: '44px',
                        paddingRight: '52px',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        color: '#0F172A',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.18s, box-shadow 0.18s',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="lp-eye-btn"
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      tabIndex={-1}
                      aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                    </button>
                  </div>
                </div>

                {/* ── Mantener sesión ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="remember"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        accentColor: '#6366F1',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <label
                    htmlFor="remember"
                    className="lp-checkbox-label"
                    style={{
                      fontSize: '13px',
                      color: '#64748B',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Mantener sesión iniciada
                  </label>
                </div>

                {/* ── Error ── */}
                {error && (
                  <div
                    className="lp-fade-up"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 16px',
                      backgroundColor: '#FFF1F2',
                      border: '1px solid #FECDD3',
                      borderRadius: '12px',
                      color: '#BE123C',
                      fontSize: '13px',
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#FCA5A5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                      }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                    </div>
                    {error}
                  </div>
                )}

                {/* ── Botón submit ── */}
                <button
                  type="submit"
                  disabled={loading}
                  className="lp-btn-submit"
                  style={{
                    width: '100%',
                    height: '54px',
                    borderRadius: '999px',
                    background: loading
                      ? 'linear-gradient(135deg, #A5B4FC 0%, #818CF8 100%)'
                      : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: loading
                      ? 'none'
                      : '0 4px 18px rgba(99,102,241,0.4), 0 1px 3px rgba(99,102,241,0.2)',
                    marginTop: '4px',
                    letterSpacing: '-0.2px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        className="lp-spin"
                        style={{ width: '18px', height: '18px' }}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          style={{ opacity: 0.25 }}
                          cx="12" cy="12" r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          style={{ opacity: 0.85 }}
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight style={{ width: '18px', height: '18px' }} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer debajo de la card */}
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '24px', fontWeight: 400 }}>
              &copy; 2026 Gestión de Pensionistas. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
