import { useState } from 'react'
import { FileText } from 'lucide-react'
import { paymentsService } from '../services/paymentsService'
import { generatePensionerPDF, generatePolicePDF } from '../utils/generatePDF'

// Icono SVG de WhatsApp (oficial)
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function buildWhatsAppMessage(
  fullName: string,
  month: string,
  debtBalance: string,
  lastPaymentAmount: string | null,
): string {
  const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const [y, m] = month.split('-')
  const monthName = `${MONTHS_ES[parseInt(m,10)-1]} ${y}`
  const debt = parseFloat(debtBalance) || 0
  const lastName = lastPaymentAmount ? parseFloat(lastPaymentAmount) : null

  let msg = `Hola ${fullName}!\n\n`
  msg += `Le enviamos su resumen del mes de *${monthName}*:\n\n`
  if (lastName && lastName > 0) {
    msg += `- Ultimo pago registrado: *S/ ${lastName.toFixed(2)}*\n`
  }
  if (debt > 0) {
    msg += `- Deuda pendiente: *S/ ${debt.toFixed(2)}*\n\n`
    msg += `Por favor regularice su pago a la brevedad posible.\n`
  } else {
    msg += `- Estado: *Al dia* \n\n`
    msg += `Gracias por mantener sus pagos al dia!\n`
  }
  msg += `\nRestaurante Sabor y Tradición`
  return msg
}

function currentMonthStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

interface PensionerNotifyProps {
  type: 'pensioner'
  id: number
  fullName: string
  phone?: string | null
  debtBalance: string
  lastPaymentAmount: string | null
}

interface PoliceNotifyProps {
  type: 'police'
  id: number
  fullName: string
  phone?: string | null
  debtBalance: string
  lastPaymentAmount: string | null
}

type NotifyActionsProps = PensionerNotifyProps | PoliceNotifyProps

export function NotifyActions(props: NotifyActionsProps) {
  const [loadingPDF, setLoadingPDF] = useState(false)
  const month = currentMonthStr()
  const hasPhone = !!(props.phone && props.phone.trim())

  function handleWhatsApp() {
    if (!hasPhone) return
    // Limpiar número: quitar espacios, guiones, paréntesis; agregar código Perú si no tiene prefijo
    let raw = props.phone!.replace(/[\s\-\(\)]/g, '')
    if (!raw.startsWith('+')) raw = `+51${raw}`
    const msg = buildWhatsAppMessage(props.fullName, month, props.debtBalance, props.lastPaymentAmount)
    const url = `https://wa.me/${raw.replace('+', '')}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handlePDF() {
    setLoadingPDF(true)
    try {
      if (props.type === 'pensioner') {
        const summary = await paymentsService.getPensionerPaymentSummary(props.id, month)
        generatePensionerPDF(summary)
      } else {
        const summary = await paymentsService.getPolicePaymentSummary(props.id, month)
        generatePolicePDF(summary)
      }
    } finally {
      setLoadingPDF(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Botón WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsApp}
        disabled={!hasPhone}
        title={hasPhone ? `Enviar resumen por WhatsApp a ${props.phone}` : 'Sin número de teléfono registrado'}
        aria-label="Enviar resumen por WhatsApp"
        style={{
          width: '34px', height: '34px',
          borderRadius: '10px',
          border: '1.5px solid',
          borderColor: hasPhone ? '#BBF7D0' : '#E2E8F0',
          backgroundColor: hasPhone ? '#F0FDF4' : '#F8FAFC',
          color: hasPhone ? '#16A34A' : '#CBD5E1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: hasPhone ? 'pointer' : 'not-allowed',
          transition: 'all 150ms',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (hasPhone) {
            e.currentTarget.style.backgroundColor = '#DCFCE7'
            e.currentTarget.style.borderColor = '#86EFAC'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = hasPhone ? '#F0FDF4' : '#F8FAFC'
          e.currentTarget.style.borderColor = hasPhone ? '#BBF7D0' : '#E2E8F0'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <WhatsAppIcon size={15} />
      </button>

      {/* Botón PDF */}
      <button
        type="button"
        onClick={handlePDF}
        disabled={loadingPDF}
        title="Descargar resumen en PDF"
        aria-label="Descargar resumen en PDF"
        style={{
          width: '34px', height: '34px',
          borderRadius: '10px',
          border: '1.5px solid #FED7AA',
          backgroundColor: '#FFF7ED',
          color: '#EA580C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: loadingPDF ? 'not-allowed' : 'pointer',
          transition: 'all 150ms',
          opacity: loadingPDF ? 0.6 : 1,
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!loadingPDF) {
            e.currentTarget.style.backgroundColor = '#FFEDD5'
            e.currentTarget.style.borderColor = '#FDBA74'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(234,88,12,0.2)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#FFF7ED'
          e.currentTarget.style.borderColor = '#FED7AA'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {loadingPDF ? (
          <div style={{
            width: '13px', height: '13px', borderRadius: '50%',
            border: '2px solid #FED7AA', borderTopColor: '#EA580C',
            animation: 'spin 0.75s linear infinite',
          }} />
        ) : (
          <FileText style={{ width: '14px', height: '14px' }} />
        )}
      </button>
    </div>
  )
}
