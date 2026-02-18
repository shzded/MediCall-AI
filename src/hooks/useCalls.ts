import { useCallback, useMemo } from 'react'
import { useAsync } from './useAsync'
import { fetchCalls, updateCallStatus, deleteCall as apiDeleteCall } from '@/api/calls'
import { useToast } from './useToast'
import { t } from '@/constants/translations'
import type { Call, CallFilters } from '@/types'

export function useCalls(filters: CallFilters) {
  const { addToast } = useToast()

  const fetchFn = useCallback(
    () => fetchCalls(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(filters)],
  )

  const { data, loading, error, execute, setData } = useAsync(fetchFn)

  const calls = useMemo(() => data?.calls ?? [], [data])
  const total = data?.total ?? 0

  const toggleStatus = useCallback(async (call: Call) => {
    const previousData = data
    const newStatus: Call['status'] = call.status === 'unread' ? 'read' : 'unread'

    setData(prev => prev ? {
      ...prev,
      calls: prev.calls.map(c =>
        c.id === call.id ? { ...c, status: newStatus } : c
      ),
    } : prev)

    try {
      await updateCallStatus(call.id)
      addToast('success', t.toast.statusUpdated)
    } catch {
      setData(() => previousData)
      addToast('error', t.toast.statusUpdateFailed)
    }
  }, [data, setData, addToast])

  const removeCall = useCallback(async (id: number) => {
    const previousData = data

    setData(prev => prev ? {
      ...prev,
      calls: prev.calls.filter(c => c.id !== id),
      total: prev.total - 1,
    } : prev)

    try {
      await apiDeleteCall(id)
      addToast('success', t.toast.callDeleted)
    } catch {
      setData(() => previousData)
      addToast('error', t.toast.callDeleteFailed)
    }
  }, [data, setData, addToast])

  return { calls, total, loading, error, refetch: execute, toggleStatus, removeCall }
}
