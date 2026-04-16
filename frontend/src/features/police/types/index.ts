export interface Police {
  id: number
  full_name: string
  badge_code: string
  rank: string | null
  phone: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface CreatePoliceInput {
  full_name: string
  badge_code: string
  rank?: string
  phone?: string
  notes?: string
}
