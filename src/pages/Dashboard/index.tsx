import { useState, useCallback, useEffect, useRef } from 'react'
import { Phone, AlertTriangle, Clock, CalendarDays, RefreshCw, Inbox } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import StatCard from '@/components/StatCard'
import CallCard from '@/components/CallCard'
import CallCardSkeleton from '@/components/Skeletons/CallCardSkeleton'
import EmptyState from '@/components/EmptyState'
import CallDetailModal from '@/components/CallDetailModal'
import { useStats } from '@/hooks/useStats'
import { useCalls } from '@/hooks/useCalls'
import { useModal } from '@/hooks/useModal'
import { t } from '@/constants/translations'
import { REFRESH_INTERVAL } from '@/constants/config'
import { formatDuration } from '@/utils/format'

function DashboardContent() {
  const { data: stats, loading: statsLoading, error: statsError, execute: refreshStats } = useStats(true)
  const filters = { limit: 5 }
  const { calls, loading: callsLoading, error: callsError, refetch: refreshCalls, toggleStatus } = useCalls(filters)
  const modal = useModal()

  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-refresh indicator pulse
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRefreshing(true)
      refreshCalls().catch(() => {}).finally(() => {
        setTimeout(() => setRefreshing(false), 1000)
      })
    }, REFRESH_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refreshCalls])

  const handleManualRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([refreshStats(), refreshCalls()]).catch(() => {}).finally(() => {
      setTimeout(() => setRefreshing(false), 1000)
    })
  }, [refreshStats, refreshCalls])

  const yesterdayDiff = stats ? stats.todayCalls - stats.yesterdayCalls : 0

  return (
    <div className="space-y-6">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 text-xs text-medium-gray hover:text-dark-gray transition-colors"
          aria-label="Aktualisieren"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? t.dashboard.refreshing : 'Auto-Refresh 30s'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.dashboard.todayCalls}
          value={stats?.todayCalls ?? 0}
          icon={<Phone size={20} />}
          loading={statsLoading}
          trend={stats ? {
            value: `${Math.abs(yesterdayDiff)}`,
            positive: yesterdayDiff >= 0,
          } : null}
          subLabel={t.dashboard.vsYesterday}
        />
        <StatCard
          label={t.dashboard.urgentCalls}
          value={stats?.urgentCalls ?? 0}
          icon={<AlertTriangle size={20} />}
          loading={statsLoading}
          subLabel={stats ? `${stats.unhandledUrgent} ${t.dashboard.unhandled}` : undefined}
        />
        <StatCard
          label={t.dashboard.avgDuration}
          value={stats ? formatDuration(stats.avgDuration) : '0s'}
          icon={<Clock size={20} />}
          loading={statsLoading}
          trend={stats && stats.avgDurationYesterday ? {
            value: formatDuration(stats.avgDurationYesterday),
            positive: true,
          } : null}
          subLabel={t.dashboard.vsYesterday}
        />
        <StatCard
          label={t.dashboard.monthCalls}
          value={stats?.monthCalls ?? 0}
          icon={<CalendarDays size={20} />}
          loading={statsLoading}
        />
      </div>

      {/* Error retry */}
      {(statsError || callsError) && (
        <div className="rounded-xl bg-white p-6 text-center" role="alert">
          <p className="text-error-red text-sm mb-3">{t.common.error}</p>
          <button
            onClick={handleManualRefresh}
            className="rounded-lg bg-primary-mint px-4 py-2 text-sm font-medium text-dark-gray hover:bg-primary-mint-light transition-colors"
          >
            {t.common.retry}
          </button>
        </div>
      )}

      {/* Recent Calls */}
      <div>
        <h2 className="text-lg font-bold text-dark-gray mb-4">{t.dashboard.recentCalls}</h2>
        {callsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CallCardSkeleton key={i} />
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="rounded-xl bg-white">
            <EmptyState
              icon={<Inbox size={48} />}
              title={t.dashboard.noRecentCalls}
              description={t.dashboard.noRecentCallsDesc}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map(call => (
              <CallCard
                key={call.id}
                call={call}
                onClick={() => modal.open(call.id)}
                onToggleStatus={() => toggleStatus(call)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Call Detail Modal */}
      {modal.isOpen && modal.selectedId && (
        <CallDetailModal
          callId={modal.selectedId}
          onClose={modal.close}
          onStatusChange={() => refreshCalls().catch(() => {})}
          onDelete={() => {
            modal.close()
            refreshCalls().catch(() => {})
          }}
        />
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}
