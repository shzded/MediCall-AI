import { api } from './client'
import { transformStats } from '@/utils/transform'
import { API_BASE_URL } from '@/constants/config'
import { mockStats, mockDailyStats, mockUrgencyStats, mockSymptomStats } from '@/mocks/data'
import type { Stats, StatsRaw, DailyStats, UrgencyStats, SymptomStat } from '@/types'

export async function fetchStats(): Promise<Stats> {
  try {
    const raw = await api.get<StatsRaw>('/stats')
    return transformStats(raw)
  } catch {
    return mockStats
  }
}

export async function fetchDailyStats(days: number = 7): Promise<DailyStats[]> {
  try {
    return await api.get<DailyStats[]>('/stats/daily', { days })
  } catch {
    return mockDailyStats.slice(-days)
  }
}

export async function fetchUrgencyStats(): Promise<UrgencyStats[]> {
  try {
    return await api.get<UrgencyStats[]>('/stats/urgency')
  } catch {
    return mockUrgencyStats
  }
}

export async function fetchSymptomStats(limit: number = 10): Promise<SymptomStat[]> {
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
