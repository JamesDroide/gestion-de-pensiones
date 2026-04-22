import type { PaymentMode } from '@/shared/types'

export type PensionerType = 'civil' | 'police'
export type NoPensionPriceMode = 'menu_price' | 'custom_tiered' | 'custom_by_type'

export interface Pensionista {
  id: number
  pensioner_type: PensionerType
  full_name: string
  dni: string
  payment_mode?: PaymentMode
  no_pension_rules?: boolean
  no_pension_price_mode?: NoPensionPriceMode
  custom_price_1_meal?: string | null
  custom_price_2_meals?: string | null
  custom_price_3_meals?: string | null
  custom_breakfast_price?: string | null
  custom_lunch_price?: string | null
  custom_dinner_price?: string | null
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
  no_pension_price_mode?: NoPensionPriceMode
  custom_price_1_meal?: number | null
  custom_price_2_meals?: number | null
  custom_price_3_meals?: number | null
  custom_breakfast_price?: number | null
  custom_lunch_price?: number | null
  custom_dinner_price?: number | null
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
