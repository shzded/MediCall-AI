import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  icon: ReactNode
  trend?: { value: string; positive: boolean } | null
  subLabel?: string
  loading?: boolean
}

export default function StatCard({ label, value, icon, trend, subLabel, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton-shimmer h-4 w-24 rounded" />
          <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
        </div>
        <div className="skeleton-shimmer h-8 w-16 rounded mb-2" />
        <div className="skeleton-shimmer h-3 w-20 rounded" />
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-medium-gray font-medium">{label}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-beige text-primary-blue">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-dark-gray mb-1">{value}</div>
      {(trend || subLabel) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={clsx(
              'flex items-center gap-0.5 font-medium',
              trend.positive ? 'text-success-green' : 'text-error-red',
            )}>
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </span>
          )}
          {subLabel && <span className="text-medium-gray">{subLabel}</span>}
        </div>
      )}
    </div>
  )
}
