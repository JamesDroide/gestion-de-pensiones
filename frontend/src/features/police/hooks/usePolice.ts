import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { policeService } from '../services/policeService'
import type { CreatePoliceInput } from '../types'

export const POLICE_KEY = ['police']

export function usePolice() {
  return useQuery({
    queryKey: POLICE_KEY,
    queryFn: () => policeService.list(),
  })
}

export function useCreatePolice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePoliceInput) => policeService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POLICE_KEY }),
  })
}

export function useUpdatePolice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreatePoliceInput> }) =>
      policeService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POLICE_KEY }),
  })
}
