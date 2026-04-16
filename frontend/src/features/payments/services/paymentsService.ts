import { apiClient } from '@/shared/services/api'
import type {
  PensionerWithDebt,
  PensionerPaymentSummary,
  PaymentRecord,
  RegisterPaymentInput,
  PoliceWithDebt,
  PolicePaymentSummary,
  RegisterPolicePaymentInput,
} from '../types'

export const paymentsService = {
  // ─── Pensionistas ─────────────────────────────────────────────────────────
  async getPensionersWithDebt(month?: string): Promise<PensionerWithDebt[]> {
    const params = month ? `?month=${month}` : ''
    const res = await apiClient.get(`/payments/pensioners${params}`)
    return (res.data as PensionerWithDebt[]).sort((a, b) => a.full_name.localeCompare(b.full_name, 'es'))
  },

  async getPensionerPaymentSummary(pensionerId: number, month?: string): Promise<PensionerPaymentSummary> {
    const params = month ? `?month=${month}` : ''
    const res = await apiClient.get(`/payments/pensioners/${pensionerId}/summary${params}`)
    return res.data
  },

  async registerPensionerPayment(pensionerId: number, input: RegisterPaymentInput): Promise<PaymentRecord> {
    const res = await apiClient.post(`/payments/pensioners/${pensionerId}/pay`, input)
    return res.data
  },

  async getMonthlyTotal(month?: string, type?: 'civil' | 'police'): Promise<{ month: string; total: string }> {
    const p = new URLSearchParams()
    if (month) p.set('month', month)
    if (type) p.set('type', type)
    const qs = p.toString() ? `?${p.toString()}` : ''
    const res = await apiClient.get(`/payments/monthly-total${qs}`)
    return res.data
  },

  // ─── Policías ─────────────────────────────────────────────────────────────
  async getPoliceWithDebt(month?: string): Promise<PoliceWithDebt[]> {
    const params = month ? `?month=${month}` : ''
    const res = await apiClient.get(`/payments/police${params}`)
    return (res.data as PoliceWithDebt[]).sort((a, b) => a.full_name.localeCompare(b.full_name, 'es'))
  },

  async getPolicePaymentSummary(policeId: number, month?: string): Promise<PolicePaymentSummary> {
    const params = month ? `?month=${month}` : ''
    const res = await apiClient.get(`/payments/police/${policeId}/summary${params}`)
    return res.data
  },

  async registerPolicePayment(policeId: number, input: RegisterPolicePaymentInput): Promise<PaymentRecord> {
    const res = await apiClient.post(`/payments/police/${policeId}/pay`, input)
    return res.data
  },
}
