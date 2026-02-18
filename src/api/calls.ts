import { api } from './client'
import { transformCall } from '@/utils/transform'
import type { Call, CallRaw, CallsResponse, CallFilters } from '@/types'

export async function fetchCalls(filters: CallFilters = {}): Promise<{ calls: Call[]; total: number }> {
  const response = await api.get<CallsResponse>('/calls', {
    search: filters.search,
    status: filters.status,
    urgency: filters.urgency,
    skip: filters.skip,
    limit: filters.limit,
    sort: filters.sort,
    order: filters.order,
  })
  return {
    calls: response.calls.map(transformCall),
    total: response.total,
  }
}

export async function fetchCall(id: number): Promise<Call> {
  const raw = await api.get<CallRaw>(`/calls/${id}`)
  return transformCall(raw)
}

export async function updateCallStatus(id: number): Promise<Call> {
  const raw = await api.patch<CallRaw>(`/calls/${id}/status`)
  return transformCall(raw)
}

export async function updateCallNotes(id: number, notes: string): Promise<Call> {
  const raw = await api.patch<CallRaw>(`/calls/${id}/notes`, { notes })
  return transformCall(raw)
}

export async function updateCallCallback(id: number): Promise<Call> {
  const raw = await api.patch<CallRaw>(`/calls/${id}/callback`)
  return transformCall(raw)
}

export async function deleteCall(id: number): Promise<void> {
  await api.delete(`/calls/${id}`)
}
