import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pensionersService } from '../services/pensionersService'
import type { CreatePensionerInput } from '../types'

export const PENSIONERS_KEY = ['pensioners']

export function usePensioners() {
  return useQuery({
    queryKey: PENSIONERS_KEY,
    queryFn: () => pensionersService.list(),
  })
}

export function useCreatePensioner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePensionerInput) => pensionersService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PENSIONERS_KEY }),
  })
}

export function useUpdatePensioner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      pensioner_type,
      input,
    }: {
      id: number
      pensioner_type: 'civil' | 'police'
      input: Partial<CreatePensionerInput>
    }) => pensionersService.update(id, pensioner_type, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PENSIONERS_KEY }),
  })
}

export function useDeletePensioner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, pensioner_type }: { id: number; pensioner_type: 'civil' | 'police' }) =>
      pensionersService.delete(id, pensioner_type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PENSIONERS_KEY }),
  })
}
