import { useCallback } from 'react'
import { useAsync } from './useAsync'
import { fetchUrgencyStats } from '@/api/stats'

export function useUrgencyStats() {
  const fetchFn = useCallback(() => fetchUrgencyStats(), [])
  return useAsync(fetchFn)
}
