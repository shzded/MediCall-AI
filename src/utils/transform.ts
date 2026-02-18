import type { Call, CallRaw, Stats, StatsRaw } from '@/types'

export function transformCall(raw: CallRaw): Call {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    urgency: raw.urgency,
    time: raw.time,
    duration: raw.duration,
    summary: raw.summary,
    status: raw.status,
    symptoms: raw.symptoms,
    callbackRequested: raw.callback_requested,
    callbackCompleted: raw.callback_completed,
    callbackCompletedAt: raw.callback_completed_at,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function transformStats(raw: StatsRaw): Stats {
  return {
    todayCalls: raw.today_calls,
    urgentCalls: raw.urgent_calls,
    avgDuration: raw.avg_duration,
    monthCalls: raw.month_calls,
    yesterdayCalls: raw.yesterday_calls,
    unhandledUrgent: raw.unhandled_urgent,
    avgDurationYesterday: raw.avg_duration_yesterday,
    urgentPercentage: raw.urgent_percentage,
  }
}
