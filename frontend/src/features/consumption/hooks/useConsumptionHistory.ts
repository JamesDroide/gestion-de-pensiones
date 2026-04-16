import { useQuery } from '@tanstack/react-query'
import { consumptionService } from '../services/consumptionService'
import type { PensionerConsumption, PoliceConsumption } from '../types'
import type { PensionerType } from '@/features/pensioners/types'

type HistoryRow = PensionerConsumption | PoliceConsumption

export function useConsumptionHistory(
  id: number,
  type: PensionerType,
  month: string,
) {
  return useQuery<HistoryRow[]>({
    queryKey: ['consumption-history', type, id, month],
    queryFn: async (): Promise<HistoryRow[]> =>
      type === 'civil'
        ? consumptionService.getHistoryPensioner(id, month)
        : consumptionService.getHistoryPolice(id, month),
    enabled: !!id,
  })
}
