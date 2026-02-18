import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchDailyStats } from '@/api/stats'

export function useDailyStats(days = 7) {
  const fetchFn = useCallback(() => fetchDailyStats(days), [days])
  return useAsync(fetchFn)
}
