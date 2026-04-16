// Tipos globales del sistema

export type UserRole = 'administrator' | 'cashier'

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type PaymentMode = 'daily' | 'weekly' | 'biweekly' | 'monthly'

export type TicketType = 'breakfast' | 'lunch'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  detail: string
  code?: string
}
