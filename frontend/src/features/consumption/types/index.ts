export interface ExtraItem {
  dish_name: string
  unit_price_snapshot: string
  quantity: number
  subtotal: string
}

export interface PensionerConsumption {
  id: number
  pensioner_id: number
  date: string
  breakfast_count: number
  lunch_count: number
  dinner_count: number
  has_breakfast: boolean
  has_lunch: boolean
  has_dinner: boolean
  meal_count: number
  extras_total: string
  extras: ExtraItem[]
  unit_price_snapshot: string | null
  total_price: string | null
  is_closed: boolean
}

export interface PoliceConsumption {
  id: number
  police_id: number
  date: string
  breakfast_count: number
  lunch_count: number
  dinner_count: number
  has_breakfast: boolean
  has_lunch: boolean
  has_dinner: boolean
  breakfast_ticket_value_snapshot: string
  lunch_ticket_value_snapshot: string
  dinner_price_snapshot: string
  extras_total: string
  extras: ExtraItem[]
  total: string
}

export interface RegisterPensionerInput {
  pensioner_id: number
  date: string
  breakfast_count: number
  lunch_count: number
  dinner_count: number
  extras: { dish_name: string; unit_price: number; quantity: number }[]
}

export interface RegisterPoliceInput {
  police_id: number
  date: string
  breakfast_count: number
  lunch_count: number
  dinner_count: number
  extras: { dish_name: string; unit_price: number; quantity: number }[]
}

export const MEAL_LABELS = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
} as const
