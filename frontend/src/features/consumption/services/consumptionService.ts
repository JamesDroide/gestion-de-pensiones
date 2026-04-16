import { apiClient } from '@/shared/services/api'
import type {
  PensionerConsumption,
  PoliceConsumption,
  RegisterPensionerInput,
  RegisterPoliceInput,
} from '../types'

export const consumptionService = {
  async registerPensioner(input: RegisterPensionerInput): Promise<PensionerConsumption> {
    const { data } = await apiClient.post('/consumption/pensioner', input)
    return data
  },

  async registerPolice(input: RegisterPoliceInput): Promise<PoliceConsumption> {
    const { data } = await apiClient.post('/consumption/police', input)
    return data
  },

  async getByDatePensioner(id: number, date: string): Promise<PensionerConsumption | null> {
    const { data } = await apiClient.get(`/consumption/pensioner/${id}/day`, { params: { date } })
    return data ?? null
  },

  async getByDatePolice(id: number, date: string): Promise<PoliceConsumption | null> {
    const { data } = await apiClient.get(`/consumption/police/${id}/day`, { params: { date } })
    return data ?? null
  },

  async getHistoryPensioner(id: number, month: string): Promise<PensionerConsumption[]> {
    const { data } = await apiClient.get(`/consumption/pensioner/${id}`, { params: { month } })
    return data
  },

  async getHistoryPolice(id: number, month: string): Promise<PoliceConsumption[]> {
    const { data } = await apiClient.get(`/consumption/police/${id}`, { params: { month } })
    return data
  },
}
