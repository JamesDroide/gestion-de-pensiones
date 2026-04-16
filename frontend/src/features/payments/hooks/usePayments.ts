import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsService } from '../services/paymentsService'
import type { RegisterPaymentInput } from '../types'

export function usePensionersWithDebt(month?: string) {
  return useQuery({
    queryKey: ['payments-pensioners', month],
    queryFn: () => paymentsService.getPensionersWithDebt(month),
    staleTime: 30_000,
  })
}


export function usePensionerPaymentSummary(pensionerId: number | null, month?: string) {
  return useQuery({
    queryKey: ['payment-summary', pensionerId, month],
    queryFn: () => paymentsService.getPensionerPaymentSummary(pensionerId!, month),
    enabled: pensionerId !== null,
    staleTime: 0,
  })
}


export function useMonthlyTotal(month?: string, type?: 'civil' | 'police') {
  return useQuery({
    queryKey: ['payments-monthly-total', month, type],
    queryFn: () => paymentsService.getMonthlyTotal(month, type),
    staleTime: 30_000,
  })
}

export function useRegisterPensionerPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pensionerId, input }: { pensionerId: number; input: RegisterPaymentInput }) =>
      paymentsService.registerPensionerPayment(pensionerId, input),
    onSuccess: (_data, { pensionerId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments-pensioners'] })
      queryClient.invalidateQueries({ queryKey: ['payment-summary', pensionerId] })
    },
  })
}

