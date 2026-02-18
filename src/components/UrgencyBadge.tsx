import clsx from 'clsx'
import { t } from '@/constants/translations'

interface Props {
  urgency: 'high' | 'medium' | 'low'
  className?: string
}

const styles = {
  high: 'bg-error-red-light text-error-red',
  medium: 'bg-warning-orange-light text-warning-orange',
  low: 'bg-success-green-light text-success-green',
}

const labels = {
  high: t.calls.high,
  medium: t.calls.medium,
  low: t.calls.low,
}

export default function UrgencyBadge({ urgency, className }: Props) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      styles[urgency],
      className,
    )}>
      {labels[urgency]}
    </span>
  )
}
