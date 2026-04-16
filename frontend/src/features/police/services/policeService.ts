import { apiClient } from '@/shared/services/api'
import type { Police, CreatePoliceInput } from '../types'

export const policeService = {
  async list(params?: { skip?: number; limit?: number; active_only?: boolean }): Promise<Police[]> {
    const { data } = await apiClient.get('/police/', { params })
    return data
  },

  async get(id: number): Promise<Police> {
    const { data } = await apiClient.get(`/police/${id}`)
    return data
  },

  async create(input: CreatePoliceInput): Promise<Police> {
    const { data } = await apiClient.post('/police/', input)
    return data
  },

  async update(id: number, input: Partial<CreatePoliceInput>): Promise<Police> {
    const { data } = await apiClient.patch(`/police/${id}`, input)
    return data
  },
}
