import { apiClient } from '@/shared/services/api'
import type { Pensionista, CreatePensionerInput } from '../types'

// Adapta un civil del backend al tipo Pensionista unificado
function adaptCivil(raw: Record<string, unknown>): Pensionista {
  return {
    id: raw.id as number,
    pensioner_type: 'civil',
    full_name: raw.full_name as string,
    dni: (raw.id_code ?? raw.dni ?? '') as string,
    payment_mode: raw.payment_mode as Pensionista['payment_mode'],
    no_pension_rules: (raw.no_pension_rules ?? false) as boolean,
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
        phone: input.phone,
        notes: input.notes,
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
      if (input.dni) payload.id_code = input.dni
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
