import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { consumptionService } from '../services/consumptionService'
import type { RegisterPensionerInput, RegisterPoliceInput } from '../types'

export function useConsumptionByDate(pensionerId: number | '', date: string) {
  return useQuery({
    queryKey: ['consumption-day', pensionerId, date],
    queryFn: () => consumptionService.getByDatePensioner(Number(pensionerId), date),
    enabled: !!pensionerId && !!date,
    staleTime: 0,
  })
}

export function usePoliceConsumptionByDate(policeId: number | '', date: string) {
  return useQuery({
    queryKey: ['consumption-day-police', policeId, date],
    queryFn: () => consumptionService.getByDatePolice(Number(policeId), date),
    enabled: !!policeId && !!date,
    staleTime: 0,
  })
}

export function useRegisterPensionerConsumption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterPensionerInput) => consumptionService.registerPensioner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumption'] })
    },
  })
}

export function useRegisterPoliceConsumption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterPoliceInput) => consumptionService.registerPolice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumption'] })
    },
  })
}

