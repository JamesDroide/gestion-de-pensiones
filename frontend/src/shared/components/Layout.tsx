import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Users, UtensilsCrossed, CreditCard, Settings, LogOut, Bell,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

const navItems = [
  { to: '/pensioners', icon: Users, label: 'Pensionistas' },
  { to: '/consumption', icon: UtensilsCrossed, label: 'Consumo' },
  { to: '/payments', icon: CreditCard, label: 'Cobros' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0][0].toUpperCase()
}

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F5F3FF' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: '240px',
          background: 'linear-gradient(180deg, #0F0E2E 0%, #1a1745 60%, #1E1B4B 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '22px 20px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <img
            src="/Logo/Logo.jpg"
            alt="Logo"
            style={{ maxHeight: '52px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Etiqueta MENÚ */}
        <div style={{ padding: '18px 18px 6px' }}>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            MENÚ
          </span>
        </div>

        {/* Navegación */}
        <nav
          style={{
            flex: 1,
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            overflowY: 'auto',
          }}
        >
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(99,102,241,0.22)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'background-color 160ms, color 160ms',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(99,102,241,0.30)' : 'none',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget
                if (!el.getAttribute('aria-current')) {
                  el.style.backgroundColor = 'rgba(255,255,255,0.07)'
                  el.style.color = 'rgba(255,255,255,0.88)'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                if (!el.getAttribute('aria-current')) {
                  el.style.backgroundColor = 'transparent'
                  el.style.color = 'rgba(255,255,255,0.55)'
                }
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Indicador izquierdo activo */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '22px',
                        backgroundColor: '#818CF8',
                        borderRadius: '0 4px 4px 0',
                        boxShadow: '0 0 8px rgba(129,140,248,0.6)',
                      }}
                    />
                  )}
                  {/* Icono con fondo cuando activo */}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(99,102,241,0.35)' : 'transparent',
                      flexShrink: 0,
                      transition: 'background-color 160ms',
                    }}
                  >
                    <Icon style={{ width: '15px', height: '15px' }} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ margin: '4px 18px 12px', height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />

        {/* Bloque usuario */}
        <div style={{ padding: '0 12px 18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'Admin'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: 0, lineHeight: 1.3 }}>
                {user?.role === 'administrator' ? 'Administrador' : 'Cajero'}
              </p>
            </div>
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={() => { logout(); navigate('/login') }}
            aria-label="Cerrar sesión"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '9px 12px',
              borderRadius: '11px',
              border: '1px solid rgba(239,68,68,0)',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.38)',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget
              btn.style.backgroundColor = 'rgba(239,68,68,0.10)'
              btn.style.color = '#FCA5A5'
              btn.style.borderColor = 'rgba(239,68,68,0.22)';
              (btn.querySelector('.logout-icon-wrap') as HTMLElement | null)!.style.backgroundColor = 'rgba(239,68,68,0.22)';
              (btn.querySelector('.logout-icon-wrap') as HTMLElement | null)!.style.transform = 'translateX(2px)';
              (btn.querySelector('.logout-icon-wrap svg') as HTMLElement | null)!.style.color = '#F87171'
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget
              btn.style.backgroundColor = 'transparent'
              btn.style.color = 'rgba(255,255,255,0.38)'
              btn.style.borderColor = 'rgba(239,68,68,0)';
              (btn.querySelector('.logout-icon-wrap') as HTMLElement | null)!.style.backgroundColor = 'rgba(255,255,255,0.07)';
              (btn.querySelector('.logout-icon-wrap') as HTMLElement | null)!.style.transform = 'translateX(0px)';
              (btn.querySelector('.logout-icon-wrap svg') as HTMLElement | null)!.style.color = 'rgba(255,255,255,0.45)'
            }}
          >
            {/* Icono con fondo */}
            <span
              className="logout-icon-wrap"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.07)',
                flexShrink: 0,
                transition: 'background-color 180ms ease, transform 180ms ease',
              }}
            >
              <LogOut style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.45)', transition: 'color 180ms ease' }} />
            </span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Columna derecha ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar — sin buscador */}
        <header
          style={{
            flexShrink: 0,
            height: '58px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            gap: '12px',
          }}
        >
          {/* Campana */}
          <button
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 150ms, color 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#F1F5F9'
              e.currentTarget.style.color = '#1E293B'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#64748B'
            }}
            aria-label="Notificaciones"
          >
            <Bell style={{ width: '17px', height: '17px' }} />
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: '2px solid #fff',
              }}
            />
          </button>

          {/* Separador */}
          <div style={{ width: '1px', height: '22px', backgroundColor: '#E2E8F0' }} />

          {/* Avatar + nombre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default', userSelect: 'none' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <p style={{ color: '#0F172A', fontSize: '12px', fontWeight: 600, margin: 0 }}>
                {user?.name ?? 'Admin User'}
              </p>
              <p style={{ color: '#64748B', fontSize: '11px', margin: 0 }}>
                {user?.role === 'administrator' ? 'Administrador' : 'Cajero'}
              </p>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto">
          <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
