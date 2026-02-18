export interface Call {
  id: number
  name: string
  phone: string
  urgency: 'high' | 'medium' | 'low'
  time: string
  duration: string
  summary: string
  status: 'unread' | 'read'
  symptoms: string[]
  callbackRequested: boolean
  callbackCompleted: boolean
  callbackCompletedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CallRaw {
  id: number
  name: string
  phone: string
  urgency: 'high' | 'medium' | 'low'
  time: string
  duration: string
  summary: string
  status: 'unread' | 'read'
  symptoms: string[]
  callback_requested: boolean
  callback_completed: boolean
  callback_completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Stats {
  todayCalls: number
  urgentCalls: number
  avgDuration: string
  monthCalls: number
  yesterdayCalls: number
  unhandledUrgent: number
  avgDurationYesterday: string
  urgentPercentage: number
}

export interface StatsRaw {
  today_calls: number
  urgent_calls: number
  avg_duration: string
  month_calls: number
  yesterday_calls: number
  unhandled_urgent: number
  avg_duration_yesterday: string
  urgent_percentage: number
}

export interface DailyStats {
  date: string
  count: number
}

export interface UrgencyStats {
  urgency: 'high' | 'medium' | 'low'
  count: number
  percentage: number
}

export interface SymptomStat {
  symptom: string
  count: number
}

export interface CallsResponse {
  calls: CallRaw[]
  total: number
  skip: number
  limit: number
}

export interface CallFilters {
  search?: string
  status?: 'unread' | 'read' | ''
  urgency?: 'high' | 'medium' | 'low' | ''
  dateFrom?: string
  dateTo?: string
  skip?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}
