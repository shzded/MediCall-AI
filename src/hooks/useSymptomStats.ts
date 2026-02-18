import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchSymptomStats } from '@/api/stats'

export function useSymptomStats(limit = 10) {
  const fetchFn = useCallback(() => fetchSymptomStats(limit), [limit])
  return useAsync(fetchFn)
}
