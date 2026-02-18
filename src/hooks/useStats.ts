import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchStats } from '@/api/stats'
import type { DateRange } from '@/api/stats'

export function useStats(_autoRefresh = false, range?: DateRange) {
  const fetchFn = useCallback(() => fetchStats(range), [range?.dateFrom, range?.dateTo])
  return useAsync(fetchFn)
}
