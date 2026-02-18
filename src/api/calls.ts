import { api } from './client'
import { transformCall } from '@/utils/transform'
import { mockCalls } from '@/mocks/data'
import type { Call, CallRaw, CallsResponse, CallFilters } from '@/types'

function filterMockCalls(filters: CallFilters): { calls: Call[]; total: number } {
  let result = [...mockCalls]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }
  if (filters.status) {
    result = result.filter(c => c.status === filters.status)
  }
  if (filters.urgency) {
    result = result.filter(c => c.urgency === filters.urgency)
  }

  if (filters.sort) {
    const order = filters.order === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const field = filters.sort as keyof Call
      const av = a[field] ?? ''
      const bv = b[field] ?? ''
      return av < bv ? -order : av > bv ? order : 0
    })
  }

  const total = result.length
  const skip = filters.skip ?? 0
  const limit = filters.limit ?? 10
  result = result.slice(skip, skip + limit)

  return { calls: result, total }
}

export async function fetchCalls(filters: CallFilters = {}): Promise<{ calls: Call[]; total: number }> {
  try {
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
  } catch {
    return filterMockCalls(filters)
  }
}

export async function fetchCall(id: number): Promise<Call> {
  try {
    const raw = await api.get<CallRaw>(`/calls/${id}`)
    return transformCall(raw)
  } catch {
    const call = mockCalls.find(c => c.id === id)
    if (call) return call
    throw new Error('Call not found')
  }
}

export async function updateCallStatus(id: number): Promise<Call> {
  try {
    const raw = await api.patch<CallRaw>(`/calls/${id}/status`)
    return transformCall(raw)
  } catch {
    const call = mockCalls.find(c => c.id === id)
    if (call) {
      call.status = call.status === 'unread' ? 'read' : 'unread'
      return call
    }
    throw new Error('Call not found')
  }
}

export async function updateCallNotes(id: number, notes: string): Promise<Call> {
  try {
    const raw = await api.patch<CallRaw>(`/calls/${id}/notes`, { notes })
    return transformCall(raw)
  } catch {
    const call = mockCalls.find(c => c.id === id)
    if (call) {
      call.notes = notes
      return call
    }
    throw new Error('Call not found')
  }
}

export async function updateCallCallback(id: number): Promise<Call> {
  try {
    const raw = await api.patch<CallRaw>(`/calls/${id}/callback`)
    return transformCall(raw)
  } catch {
    const call = mockCalls.find(c => c.id === id)
    if (call) {
      call.callbackCompleted = true
      call.callbackCompletedAt = new Date().toISOString()
      return call
    }
    throw new Error('Call not found')
  }
}

export async function deleteCall(id: number): Promise<void> {
  try {
    await api.delete(`/calls/${id}`)
  } catch {
    const idx = mockCalls.findIndex(c => c.id === id)
    if (idx !== -1) mockCalls.splice(idx, 1)
  }
}
