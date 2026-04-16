import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { civiliansService } from '../services/civiliansService'
import type { CreatePensionerInput } from '../types'

export const PENSIONERS_KEY = ['pensioners']

export function useCivilians() {
  return useQuery({
    queryKey: PENSIONERS_KEY,
    queryFn: () => civiliansService.list(),
  })
}

export function useCreateCivilian() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePensionerInput) => civiliansService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PENSIONERS_KEY }),
  })
}

export function useUpdateCivilian() {
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
    }) => civiliansService.update(id, pensioner_type, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PENSIONERS_KEY }),
  })
}
