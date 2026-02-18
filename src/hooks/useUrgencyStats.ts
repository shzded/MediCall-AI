import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchUrgencyStats } from '@/api/stats'
import type { DateRange } from '@/api/stats'

export function useUrgencyStats(range?: DateRange) {
  const fetchFn = useCallback(() => fetchUrgencyStats(range), [range?.dateFrom, range?.dateTo])
  return useAsync(fetchFn)
}
