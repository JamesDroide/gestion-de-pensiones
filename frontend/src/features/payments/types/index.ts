export interface ExtraItemPayment {
  dish_name: string
  unit_price_snapshot: string
  quantity: number
  subtotal: string
}

export interface ConsumptionDay {
  id: number
  date: string
  breakfast_count: number
  lunch_count: number
  dinner_count: number
  has_breakfast: boolean
  has_lunch: boolean
  has_dinner: boolean
  meal_count: number
  extras_total: string
  extras: ExtraItemPayment[]
  daily_total: string
  is_closed: boolean
}

export interface PaymentRecord {
  id: number
  amount: string
  payment_type: string
  description: string | null
  created_at: string
}

export interface PensionerPaymentSummary {
  pensioner_id: number
  full_name: string
  id_code: string
  payment_mode: string
  month: string
  consumptions: ConsumptionDay[]
  total_consumed: string
  total_paid: string
  debt_balance: string
  payments: PaymentRecord[]
}

export interface PensionerWithDebt {
  pensioner_id: number
  full_name: string
  id_code: string
  payment_mode: string
  phone?: string | null
  debt_balance: string
  last_payment_date: string | null
  last_payment_amount: string | null
  status: 'paid' | 'debt'
}


export interface RegisterPaymentInput {
  amount: number
  payment_type: 'cash' | 'tickets' | 'yape'
  description?: string
}

// ─── Tipos de policías ────────────────────────────────────────────────────────

export interface PoliceConsumptionDay {
  id: number
  date: string
  breakfast_count: number
  lunch_count: number
  dinner_count: number
  has_breakfast: boolean
  has_lunch: boolean
  has_dinner: boolean
  breakfast_value: string
  lunch_value: string
  dinner_value: string
  extras_total: string
  extras: ExtraItemPayment[]
  menu_total: string
  daily_total: string
}

export interface PolicePaymentSummary {
  police_id: number
  full_name: string
  badge_code: string
  rank: string | null
  month: string
  consumptions: PoliceConsumptionDay[]
  total_menus: string
  total_extras: string
  total_consumed: string
  total_paid: string
  debt_balance: string
  payments: PaymentRecord[]
  current_breakfast_ticket_value: string
  current_lunch_ticket_value: string
}

export interface PoliceWithDebt {
  police_id: number
  full_name: string
  badge_code: string
  rank: string | null
  phone?: string | null
  debt_balance: string
  last_payment_date: string | null
  last_payment_amount: string | null
  status: 'paid' | 'debt'
}

export interface RegisterPolicePaymentInput {
  payment_type: 'cash' | 'yape' | 'tickets'
  amount?: number
  breakfast_tickets?: number
  lunch_tickets?: number
  description?: string
}
