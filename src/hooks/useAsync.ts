import { useState, useCallback, useRef, useEffect } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useAsync<T>(asyncFn: () => Promise<T>, immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const result = await asyncFn()
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null })
      }
      return result
    } catch (err) {
      if (mountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten',
        })
      }
      throw err
    }
  }, [asyncFn])

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {})
    }
  }, [execute, immediate])

  const setData = useCallback((updater: T | null | ((prev: T | null) => T | null)) => {
    setState(prev => ({
      ...prev,
      data: typeof updater === 'function' ? (updater as (prev: T | null) => T | null)(prev.data) : updater,
    }))
  }, [])

  return { ...state, execute, setData }
}
