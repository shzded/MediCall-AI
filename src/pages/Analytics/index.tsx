import { useState, useCallback } from 'react'
import { CalendarDays, Clock, AlertTriangle, AlertCircle, FileDown } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import StatCard from '@/components/StatCard'
import BarChart from './BarChart'
import DonutChart from './DonutChart'
import { useStats } from '@/hooks/useStats'
import { useDailyStats } from '@/hooks/useDailyStats'
import { useUrgencyStats } from '@/hooks/useUrgencyStats'
import { useSymptomStats } from '@/hooks/useSymptomStats'
import { useToast } from '@/hooks/useToast'
import { exportPdf } from '@/api/stats'
import { t } from '@/constants/translations'
import { formatDuration } from '@/utils/format'

const urgencyLabels: Record<string, string> = {
  high: t.calls.high,
  medium: t.calls.medium,
  low: t.calls.low,
}

const urgencyColors: Record<string, string> = {
  high: 'bg-error-red',
  medium: 'bg-warning-orange',
  low: 'bg-success-green',
}

const urgencyBgColors: Record<string, string> = {
  high: 'bg-error-red-light',
  medium: 'bg-warning-orange-light',
  low: 'bg-success-green-light',
}

function AnalyticsContent() {
  const { data: stats, loading: statsLoading } = useStats()
  const { data: daily, loading: dailyLoading } = useDailyStats()
  const { data: urgency, loading: urgencyLoading } = useUrgencyStats()
  const { data: symptoms, loading: symptomsLoading } = useSymptomStats(5)
  const { addToast } = useToast()
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await exportPdf()
      addToast('success', t.toast.pdfExported)
    } catch {
      addToast('error', t.toast.pdfExportFailed)
    } finally {
      setExporting(false)
    }
  }, [addToast])

  const maxSymptomCount = symptoms ? Math.max(...symptoms.map(s => s.count), 1) : 1

  return (
    <div className="space-y-6">
      {/* Header with PDF export */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-primary-mint px-4 py-2 text-sm font-medium text-dark-gray hover:bg-primary-mint-light disabled:opacity-50 transition-colors"
        >
          <FileDown size={16} />
          {exporting ? t.analytics.exporting : t.analytics.exportPdf}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.analytics.monthTotal}
          value={stats?.monthCalls ?? 0}
          icon={<CalendarDays size={20} />}
          loading={statsLoading}
        />
        <StatCard
          label={t.analytics.avgDuration}
          value={stats ? formatDuration(stats.avgDuration) : '0s'}
          icon={<Clock size={20} />}
          loading={statsLoading}
        />
        <StatCard
          label={t.analytics.urgentPercent}
          value={stats ? `${stats.urgentPercentage}%` : '0%'}
          icon={<AlertTriangle size={20} />}
          loading={statsLoading}
        />
        <StatCard
          label={t.analytics.unhandledUrgent}
          value={stats?.unhandledUrgent ?? 0}
          icon={<AlertCircle size={20} />}
          loading={statsLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-day trend */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-dark-gray mb-4">{t.analytics.weeklyTrend}</h3>
          {dailyLoading ? (
            <div className="skeleton-shimmer h-[200px] rounded-lg" />
          ) : daily && daily.length > 0 ? (
            <BarChart data={daily} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-medium-gray">
              Keine Daten verfügbar
            </div>
          )}
        </div>

        {/* Urgency distribution */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-dark-gray mb-4">{t.analytics.urgencyDistribution}</h3>
          {urgencyLoading ? (
            <div className="skeleton-shimmer h-[200px] rounded-lg" />
          ) : urgency && urgency.length > 0 ? (
            <div className="flex items-center gap-6">
              <DonutChart data={urgency} />
              <div className="flex-1 space-y-3">
                {urgency.map(u => (
                  <div key={u.urgency}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-dark-gray font-medium">{urgencyLabels[u.urgency] ?? u.urgency}</span>
                      <span className="text-medium-gray">{u.count} ({u.percentage}%)</span>
                    </div>
                    <div className={`h-2 rounded-full ${urgencyBgColors[u.urgency] ?? 'bg-light-gray'}`}>
                      <div
                        className={`h-2 rounded-full transition-all ${urgencyColors[u.urgency] ?? 'bg-medium-gray'}`}
                        style={{ width: `${u.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-medium-gray">
              Keine Daten verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Top Symptoms */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-dark-gray mb-4">{t.analytics.topSymptoms}</h3>
        {symptomsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-10 rounded-lg" />
            ))}
          </div>
        ) : symptoms && symptoms.length > 0 ? (
          <div className="space-y-3">
            {symptoms.map((s, i) => (
              <div key={s.symptom} className="flex items-center gap-4">
                <span className="text-sm font-bold text-medium-gray w-6 text-right">
                  {i + 1}.
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-dark-gray">{s.symptom}</span>
                    <span className="text-xs text-medium-gray">
                      {s.count} {t.analytics.calls}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-soft-coral-light">
                    <div
                      className="h-2 rounded-full bg-soft-coral transition-all"
                      style={{ width: `${(s.count / maxSymptomCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-sm text-medium-gray">
            Keine Symptom-Daten verfügbar
          </div>
        )}
      </div>
    </div>
  )
}

export default function Analytics() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  )
}
