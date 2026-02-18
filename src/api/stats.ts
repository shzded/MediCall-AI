import { api } from './client'
import { transformStats } from '@/utils/transform'
import { API_BASE_URL } from '@/constants/config'
import { mockStats, mockDailyStats, mockUrgencyStats, mockSymptomStats } from '@/mocks/data'
import { mockCalls } from '@/mocks/data'
import type { Stats, StatsRaw, DailyStats, UrgencyStats, SymptomStat } from '@/types'

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'

export interface DateRange {
  dateFrom?: string
  dateTo?: string
}

function filterCallsByRange(dateFrom?: string, dateTo?: string) {
  let calls = [...mockCalls]
  if (dateFrom) calls = calls.filter(c => c.time >= dateFrom)
  if (dateTo) calls = calls.filter(c => c.time <= dateTo + 'T23:59:59Z')
  return calls
}

export async function fetchStats(range?: DateRange): Promise<Stats> {
  if (!USE_BACKEND) {
    if (range?.dateFrom || range?.dateTo) {
      const calls = filterCallsByRange(range.dateFrom, range.dateTo)
      const urgentCalls = calls.filter(c => c.urgency === 'high')
      const totalDuration = calls.reduce((sum, c) => {
        const parts = c.duration.split(':').map(Number)
        return sum + (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0)
      }, 0)
      const avgSecs = calls.length ? Math.round(totalDuration / calls.length) : 0
      const mm = String(Math.floor(avgSecs / 60)).padStart(2, '0')
      const ss = String(avgSecs % 60).padStart(2, '0')
      return {
        todayCalls: calls.length,
        urgentCalls: urgentCalls.length,
        avgDuration: `00:${mm}:${ss}`,
        monthCalls: calls.length,
        yesterdayCalls: 0,
        unhandledUrgent: urgentCalls.filter(c => c.status === 'unread').length,
        avgDurationYesterday: '00:00:00',
        urgentPercentage: calls.length ? Math.round((urgentCalls.length / calls.length) * 100) : 0,
      }
    }
    return mockStats
  }
  try {
    const raw = await api.get<StatsRaw>('/stats')
    return transformStats(raw)
  } catch {
    return mockStats
  }
}

export async function fetchDailyStats(days: number = 7, range?: DateRange): Promise<DailyStats[]> {
  if (!USE_BACKEND) {
    if (range?.dateFrom || range?.dateTo) {
      const calls = filterCallsByRange(range.dateFrom, range.dateTo)
      const countByDate: Record<string, number> = {}
      calls.forEach(c => {
        const date = c.time.split('T')[0]
        countByDate[date] = (countByDate[date] ?? 0) + 1
      })
      return Object.entries(countByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
    return mockDailyStats.slice(-days)
  }
  try {
    return await api.get<DailyStats[]>('/stats/daily', { days })
  } catch {
    return mockDailyStats.slice(-days)
  }
}

export async function fetchUrgencyStats(range?: DateRange): Promise<UrgencyStats[]> {
  if (!USE_BACKEND) {
    if (range?.dateFrom || range?.dateTo) {
      const calls = filterCallsByRange(range.dateFrom, range.dateTo)
      const counts = { high: 0, medium: 0, low: 0 }
      calls.forEach(c => { counts[c.urgency]++ })
      const total = calls.length || 1
      return (['high', 'medium', 'low'] as const).map(urgency => ({
        urgency,
        count: counts[urgency],
        percentage: Math.round((counts[urgency] / total) * 100),
      }))
    }
    return mockUrgencyStats
  }
  try {
    return await api.get<UrgencyStats[]>('/stats/urgency')
  } catch {
    return mockUrgencyStats
  }
}

export async function fetchSymptomStats(limit: number = 10, range?: DateRange): Promise<SymptomStat[]> {
  if (!USE_BACKEND) {
    if (range?.dateFrom || range?.dateTo) {
      const calls = filterCallsByRange(range.dateFrom, range.dateTo)
      const counts: Record<string, number> = {}
      calls.forEach(c => c.symptoms.forEach(s => { counts[s] = (counts[s] ?? 0) + 1 }))
      return Object.entries(counts)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }
    return mockSymptomStats.slice(0, limit)
  }
  try {
    return await api.get<SymptomStat[]>('/stats/symptoms', { limit })
  } catch {
    return mockSymptomStats.slice(0, limit)
  }
}

export async function exportPdf(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/stats/export/pdf`)
  if (!response.ok) throw new Error('PDF export failed')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'medicall-report.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
