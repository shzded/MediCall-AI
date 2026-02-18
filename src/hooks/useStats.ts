import { useCallback, useEffect, useRef } from 'react'
import { useAsync } from './useAsync'
import { fetchStats } from '@/api/stats'
import { REFRESH_INTERVAL } from '@/constants/config'

export function useStats(autoRefresh = false) {
  const fetchFn = useCallback(() => fetchStats(), [])
  const result = useAsync(fetchFn)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        result.execute().catch(() => {})
      }, REFRESH_INTERVAL)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, result.execute])

  return result
}
