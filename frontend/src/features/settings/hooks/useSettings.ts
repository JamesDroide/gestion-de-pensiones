import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'
import type { PricingConfigUpdateInput } from '../types'

export const PRICING_KEY = ['pricing']

export function usePricing() {
  return useQuery({
    queryKey: PRICING_KEY,
    queryFn: settingsService.getPricing,
  })
}

export function useUpdatePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PricingConfigUpdateInput) => settingsService.updatePricing(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRICING_KEY }),
  })
}
