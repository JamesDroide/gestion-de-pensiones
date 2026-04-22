import { apiClient } from '@/shared/services/api'
import type { Pensionista, CreatePensionerInput, NoPensionPriceMode } from '../types'

// Adapta un civil del backend al tipo Pensionista unificado
function adaptCivil(raw: Record<string, unknown>): Pensionista {
  return {
    id: raw.id as number,
    pensioner_type: 'civil',
    full_name: raw.full_name as string,
    dni: (raw.id_code ?? raw.dni ?? '') as string,
    payment_mode: raw.payment_mode as Pensionista['payment_mode'],
    no_pension_rules: (raw.no_pension_rules ?? false) as boolean,
    no_pension_price_mode: (raw.no_pension_price_mode ?? 'menu_price') as NoPensionPriceMode,
    custom_price_1_meal: (raw.custom_price_1_meal ?? null) as string | null,
    custom_price_2_meals: (raw.custom_price_2_meals ?? null) as string | null,
    custom_price_3_meals: (raw.custom_price_3_meals ?? null) as string | null,
    custom_breakfast_price: (raw.custom_breakfast_price ?? null) as string | null,
    custom_lunch_price: (raw.custom_lunch_price ?? null) as string | null,
    custom_dinner_price: (raw.custom_dinner_price ?? null) as string | null,
    phone: (raw.phone ?? '') as string,
    notes: (raw.notes ?? null) as string | null,
    is_active: raw.is_active as boolean,
    created_at: raw.created_at as string,
  }
}

// Adapta un policía del backend al tipo Pensionista unificado
function adaptPolice(raw: Record<string, unknown>): Pensionista {
  return {
    id: raw.id as number,
    pensioner_type: 'police',
    full_name: raw.full_name as string,
    dni: (raw.badge_code ?? raw.dni ?? '') as string,
    rank: (raw.rank ?? null) as string | null,
    phone: (raw.phone ?? '') as string,
    notes: (raw.notes ?? null) as string | null,
    is_active: raw.is_active as boolean,
    created_at: raw.created_at as string,
  }
}

export const pensionersService = {
  async list(): Promise<Pensionista[]> {
    const [civRes, polRes] = await Promise.all([
      apiClient.get('/pensioners/'),
      apiClient.get('/police/'),
    ])
    const civiles: Pensionista[] = (civRes.data as Record<string, unknown>[]).map(adaptCivil)
    const policia: Pensionista[] = (polRes.data as Record<string, unknown>[]).map(adaptPolice)
    return [...civiles, ...policia].sort((a, b) => a.full_name.localeCompare(b.full_name, 'es'))
  },

  async create(input: CreatePensionerInput): Promise<Pensionista> {
    if (input.pensioner_type === 'civil') {
      const payload = {
        full_name: input.full_name,
        id_code: input.dni,
        payment_mode: input.payment_mode ?? 'monthly',
        no_pension_rules: input.no_pension_rules ?? false,
        no_pension_price_mode: input.no_pension_price_mode ?? 'menu_price',
        phone: input.phone,
        notes: input.notes,
        custom_price_1_meal: input.custom_price_1_meal ?? null,
        custom_price_2_meals: input.custom_price_2_meals ?? null,
        custom_price_3_meals: input.custom_price_3_meals ?? null,
        custom_breakfast_price: input.custom_breakfast_price ?? null,
        custom_lunch_price: input.custom_lunch_price ?? null,
        custom_dinner_price: input.custom_dinner_price ?? null,
      }
      const { data } = await apiClient.post('/pensioners/', payload)
      return adaptCivil(data as Record<string, unknown>)
    } else {
      const payload = {
        full_name: input.full_name,
        badge_code: input.dni,
        rank: input.rank,
        phone: input.phone,
        notes: input.notes,
      }
      const { data } = await apiClient.post('/police/', payload)
      return adaptPolice(data as Record<string, unknown>)
    }
  },

  async delete(id: number, pensioner_type: 'civil' | 'police'): Promise<void> {
    const endpoint = pensioner_type === 'civil' ? `/pensioners/${id}` : `/police/${id}`
    await apiClient.delete(endpoint)
  },

  async update(
    id: number,
    pensioner_type: 'civil' | 'police',
    input: Partial<CreatePensionerInput>,
  ): Promise<Pensionista> {
    if (pensioner_type === 'civil') {
      const payload: Record<string, unknown> = {
        full_name: input.full_name,
        phone: input.phone,
        notes: input.notes,
      }
      if (input.payment_mode) payload.payment_mode = input.payment_mode
      if (input.no_pension_rules !== undefined) payload.no_pension_rules = input.no_pension_rules
      if (input.no_pension_price_mode !== undefined) payload.no_pension_price_mode = input.no_pension_price_mode
      if (input.dni) payload.id_code = input.dni
      payload.custom_price_1_meal = input.custom_price_1_meal ?? null
      payload.custom_price_2_meals = input.custom_price_2_meals ?? null
      payload.custom_price_3_meals = input.custom_price_3_meals ?? null
      payload.custom_breakfast_price = input.custom_breakfast_price ?? null
      payload.custom_lunch_price = input.custom_lunch_price ?? null
      payload.custom_dinner_price = input.custom_dinner_price ?? null
      const { data } = await apiClient.patch(`/pensioners/${id}`, payload)
      return adaptCivil(data as Record<string, unknown>)
    } else {
      const payload: Record<string, unknown> = {
        full_name: input.full_name,
        phone: input.phone,
        notes: input.notes,
      }
      if (input.rank !== undefined) payload.rank = input.rank
      if (input.dni) payload.badge_code = input.dni
      const { data } = await apiClient.patch(`/police/${id}`, payload)
      return adaptPolice(data as Record<string, unknown>)
    }
  },
}
