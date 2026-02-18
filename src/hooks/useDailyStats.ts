import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchDailyStats } from '@/api/stats'
import type { DateRange } from '@/api/stats'

export function useDailyStats(days = 7, range?: DateRange) {
  const fetchFn = useCallback(() => fetchDailyStats(days, range), [days, range?.dateFrom, range?.dateTo])
  return useAsync(fetchFn)
}
