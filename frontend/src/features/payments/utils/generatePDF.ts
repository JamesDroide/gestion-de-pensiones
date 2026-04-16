import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PensionerPaymentSummary, PolicePaymentSummary } from '../types'

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  return `${MONTHS_ES[parseInt(m,10)-1]} ${y}`
}

function fmtDate(dateStr: string): string {
  const [,m,d] = dateStr.split('-')
  return `${parseInt(d,10)} ${MONTHS_ES[parseInt(m,10)-1].slice(0,3)}`
}

function n(val: string | number | undefined): number {
  return parseFloat(String(val ?? '0')) || 0
}

export function generatePensionerPDF(summary: PensionerPaymentSummary): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de Consumo', 14, 11)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${summary.full_name}  |  DNI: ${summary.id_code}  |  ${monthLabel(summary.month)}`, 14, 19)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, pageW - 14, 19, { align: 'right' })

  // ── KPI boxes ───────────────────────────────────────────────────────────────
  const debt = n(summary.debt_balance)
  const kpis = [
    { label: 'Total consumido', value: `S/ ${n(summary.total_consumed).toFixed(2)}`, color: [15,23,42] as [number,number,number] },
    { label: 'Total pagado',    value: `S/ ${n(summary.total_paid).toFixed(2)}`,     color: [16,185,129] as [number,number,number] },
    { label: 'Deuda pendiente', value: `S/ ${Math.max(0,debt).toFixed(2)}`,           color: debt > 0 ? [239,68,68] as [number,number,number] : [16,185,129] as [number,number,number] },
  ]
  const boxW = (pageW - 28 - 8) / 3
  kpis.forEach((k, i) => {
    const x = 14 + i * (boxW + 4)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, 34, boxW, 18, 3, 3, 'F')
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.text(k.label.toUpperCase(), x + 4, 40)
    doc.setFontSize(12)
    doc.setTextColor(...k.color)
    doc.setFont('helvetica', 'bold')
    doc.text(k.value, x + 4, 48)
  })

  // ── Tabla de consumos ────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'bold')
  doc.text('CONSUMOS DEL MES', 14, 60)

  autoTable(doc, {
    startY: 63,
    head: [['Fecha', 'Desayuno', 'Almuerzo', 'Cena', 'Extras', 'Total del día']],
    body: summary.consumptions.map(c => [
      fmtDate(c.date),
      c.breakfast_count > 0 ? (c.breakfast_count > 1 ? `×${c.breakfast_count}` : '✓') : '—',
      c.lunch_count > 0     ? (c.lunch_count > 1     ? `×${c.lunch_count}`     : '✓') : '—',
      c.dinner_count > 0    ? (c.dinner_count > 1    ? `×${c.dinner_count}`    : '✓') : '—',
      n(c.extras_total) > 0 ? `S/ ${n(c.extras_total).toFixed(2)}` : '—',
      `S/ ${n(c.daily_total).toFixed(2)}`,
    ]),
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { fontStyle: 'bold' }, 5: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  })

  // ── Pagos ────────────────────────────────────────────────────────────────────
  if (summary.payments.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 6
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.text('PAGOS REGISTRADOS', 14, finalY)

    autoTable(doc, {
      startY: finalY + 3,
      head: [['Fecha', 'Tipo', 'Monto']],
      body: summary.payments.map(p => [
        new Date(p.created_at).toLocaleDateString('es-PE'),
        p.payment_type === 'cash' ? 'Efectivo' : 'Yape',
        `S/ ${n(p.amount).toFixed(2)}`,
      ]),
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 14, right: 14 },
    })
  }

  doc.save(`consumo_${summary.id_code}_${summary.month}.pdf`)
}

export function generatePolicePDF(summary: PolicePaymentSummary): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFillColor(59, 130, 246)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de Consumo — Policía', 14, 11)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const rank = summary.rank ? `${summary.rank} ` : ''
  doc.text(`${rank}${summary.full_name}  |  Badge: ${summary.badge_code}  |  ${monthLabel(summary.month)}`, 14, 19)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, pageW - 14, 19, { align: 'right' })

  const debt = n(summary.debt_balance)
  const kpis = [
    { label: 'Total consumido', value: `S/ ${n(summary.total_consumed).toFixed(2)}`, color: [15,23,42] as [number,number,number] },
    { label: 'Total pagado',    value: `S/ ${n(summary.total_paid).toFixed(2)}`,     color: [16,185,129] as [number,number,number] },
    { label: 'Deuda pendiente', value: `S/ ${Math.max(0,debt).toFixed(2)}`,           color: debt > 0 ? [239,68,68] as [number,number,number] : [16,185,129] as [number,number,number] },
  ]
  const boxW = (pageW - 28 - 8) / 3
  kpis.forEach((k, i) => {
    const x = 14 + i * (boxW + 4)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, 34, boxW, 18, 3, 3, 'F')
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.text(k.label.toUpperCase(), x + 4, 40)
    doc.setFontSize(12)
    doc.setTextColor(...k.color)
    doc.setFont('helvetica', 'bold')
    doc.text(k.value, x + 4, 48)
  })

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'bold')
  doc.text('CONSUMOS DEL MES', 14, 60)

  autoTable(doc, {
    startY: 63,
    head: [['Fecha', 'Desayuno', 'Almuerzo', 'Cena', 'Extras', 'Total']],
    body: summary.consumptions.map(c => [
      fmtDate(c.date),
      c.breakfast_count > 0 ? (c.breakfast_count > 1 ? `×${c.breakfast_count} S/${n(c.breakfast_value).toFixed(2)}` : `S/${n(c.breakfast_value).toFixed(2)}`) : '—',
      c.lunch_count > 0     ? (c.lunch_count > 1     ? `×${c.lunch_count} S/${n(c.lunch_value).toFixed(2)}`         : `S/${n(c.lunch_value).toFixed(2)}`)     : '—',
      c.dinner_count > 0    ? (c.dinner_count > 1    ? `×${c.dinner_count} S/${n(c.dinner_value).toFixed(2)}`       : `S/${n(c.dinner_value).toFixed(2)}`)    : '—',
      n(c.extras_total) > 0 ? `S/ ${n(c.extras_total).toFixed(2)}` : '—',
      `S/ ${n(c.daily_total).toFixed(2)}`,
    ]),
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: { 0: { fontStyle: 'bold' }, 5: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  })

  if (summary.payments.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 6
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.text('PAGOS REGISTRADOS', 14, finalY)
    autoTable(doc, {
      startY: finalY + 3,
      head: [['Fecha', 'Tipo', 'Monto']],
      body: summary.payments.map(p => [
        new Date(p.created_at).toLocaleDateString('es-PE'),
        p.payment_type === 'cash' ? 'Efectivo' : p.payment_type === 'yape' ? 'Yape' : 'Tickets',
        `S/ ${n(p.amount).toFixed(2)}`,
      ]),
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 14, right: 14 },
    })
  }

  doc.save(`consumo_${summary.badge_code}_${summary.month}.pdf`)
}
