import { PhoneCall, Check } from 'lucide-react'
import { t } from '@/constants/translations'
import { formatDate } from '@/utils/date'
import type { Call } from '@/types'

interface Props {
  call: Call
  onMarkComplete: () => void
}

export default function CallbackSection({ call, onMarkComplete }: Props) {
  if (!call.callbackRequested) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-medium-gray uppercase tracking-wide">
          {t.modal.callback}
        </h3>
        <p className="text-sm text-medium-gray">{t.modal.callbackNotRequested}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-medium-gray uppercase tracking-wide">
        {t.modal.callback}
      </h3>
      <div className="rounded-lg border border-light-gray p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall size={16} className="text-primary-blue" />
            <span className="text-sm font-medium text-dark-gray">
              {t.modal.callbackRequested}
            </span>
          </div>
          {!call.callbackCompleted ? (
            <button
              onClick={onMarkComplete}
              className="flex items-center gap-1.5 rounded-lg bg-primary-mint px-3 py-1.5 text-xs font-medium text-dark-gray hover:bg-primary-mint-light transition-colors"
            >
              <Check size={14} />
              {t.modal.markCallbackDone}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-success-green font-medium">
              <Check size={14} />
              {t.modal.callbackCompletedAt}: {call.callbackCompletedAt ? formatDate(call.callbackCompletedAt) : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
