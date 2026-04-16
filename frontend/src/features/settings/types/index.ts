export interface PricingConfig {
  id: number
  menu_price: string
  menu_price_normal: string
  menu_price_2_meals: string
  menu_price_3_meals: string
  breakfast_ticket_value: string
  lunch_ticket_value: string
  dinner_price: string
  dinner_ticket_equivalence: number
}

export interface PricingConfigUpdateInput {
  menu_price?: number
  menu_price_normal?: number
  menu_price_2_meals?: number
  menu_price_3_meals?: number
  breakfast_ticket_value?: number
  lunch_ticket_value?: number
  dinner_price?: number
  dinner_ticket_equivalence?: number
}
