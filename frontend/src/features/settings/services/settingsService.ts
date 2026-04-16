import { apiClient } from '@/shared/services/api'
import type { PricingConfig, PricingConfigUpdateInput } from '../types'

export const settingsService = {
  async getPricing(): Promise<PricingConfig> {
    const { data } = await apiClient.get('/settings/pricing')
    return data
  },

  async updatePricing(input: PricingConfigUpdateInput): Promise<PricingConfig> {
    const { data } = await apiClient.patch('/settings/pricing', input)
    return data
  },
}
