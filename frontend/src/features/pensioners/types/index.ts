import type { PaymentMode } from '@/shared/types'

export type PensionerType = 'civil' | 'police'

export interface Pensionista {
  id: number
  pensioner_type: PensionerType
  full_name: string
  dni: string
  payment_mode?: PaymentMode
  no_pension_rules?: boolean
  rank?: string | null
  phone: string
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface CreatePensionerInput {
  pensioner_type: PensionerType
  full_name: string
  dni: string
  payment_mode?: PaymentMode
  no_pension_rules?: boolean
  rank?: string
  phone: string
  notes?: string
}

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
}


