import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '../services/paymentsService'
import type { RegisterPolicePaymentInput } from '../types'

export function usePoliceWithDebt(month?: string) {
  return useQuery({
    queryKey: ['payments-police', month],
    queryFn: () => paymentsService.getPoliceWithDebt(month),
    staleTime: 30_000,
  })
}

export function usePolicePaymentSummary(policeId: number | null, month?: string) {
  return useQuery({
    queryKey: ['payment-summary-police', policeId, month],
    queryFn: () => paymentsService.getPolicePaymentSummary(policeId!, month),
    enabled: policeId !== null,
    staleTime: 0,
  })
}

export function useRegisterPolicePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ policeId, input }: { policeId: number; input: RegisterPolicePaymentInput }) =>
      paymentsService.registerPolicePayment(policeId, input),
    onSuccess: (_data, { policeId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments-police'] })
      queryClient.invalidateQueries({ queryKey: ['payment-summary-police', policeId] })
    },
  })
}
