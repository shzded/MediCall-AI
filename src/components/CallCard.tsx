import { Phone, CheckCircle, Clock } from 'lucide-react'
import clsx from 'clsx'
import UrgencyBadge from './UrgencyBadge'
import { formatDate } from '@/utils/date'
import { formatDuration } from '@/utils/format'
import type { Call } from '@/types'

interface Props {
  call: Call
  onClick: () => void
  onToggleStatus?: () => void
}

export default function CallCard({ call, onClick, onToggleStatus }: Props) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm cursor-pointer',
        'hover:shadow-md transition-shadow',
        call.status === 'unread' && 'border-l-4 border-l-primary-blue',
      )}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick() }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-dark-gray truncate">{call.name}</span>
          {call.status === 'unread' && (
            <span className="h-2 w-2 rounded-full bg-primary-blue flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-medium-gray">
          <span className="flex items-center gap-1">
            <Phone size={12} />
            {call.phone}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(call.duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <UrgencyBadge urgency={call.urgency} />
        <span className="text-xs text-medium-gray whitespace-nowrap">
          {formatDate(call.time)}
        </span>
        {onToggleStatus && (
          <button
            onClick={e => { e.stopPropagation(); onToggleStatus() }}
            className={clsx(
              'rounded-lg p-1.5 transition-colors',
              call.status === 'read'
                ? 'text-success-green hover:bg-success-green-light'
                : 'text-medium-gray hover:bg-light-gray',
            )}
            aria-label={call.status === 'read' ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
          >
            <CheckCircle size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
