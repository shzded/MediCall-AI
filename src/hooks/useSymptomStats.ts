import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchSymptomStats } from '@/api/stats'
import type { DateRange } from '@/api/stats'

export function useSymptomStats(limit = 10, range?: DateRange) {
  const fetchFn = useCallback(() => fetchSymptomStats(limit, range), [limit, range?.dateFrom, range?.dateTo])
  return useAsync(fetchFn)
}
