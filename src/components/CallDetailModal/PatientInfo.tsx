import { Phone, Clock, CalendarDays } from 'lucide-react'
import UrgencyBadge from '@/components/UrgencyBadge'
import { formatDate } from '@/utils/date'
import { formatDuration, formatPhone } from '@/utils/format'
import { t } from '@/constants/translations'
import type { Call } from '@/types'

interface Props {
  call: Call
}

export default function PatientInfo({ call }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-medium-gray uppercase tracking-wide">
        {t.modal.patientInfo}
      </h3>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-bold text-dark-gray">{call.name}</span>
        <UrgencyBadge urgency={call.urgency} />
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-medium-gray">
        <span className="flex items-center gap-1.5">
          <Phone size={14} />
          {formatPhone(call.phone)}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays size={14} />
          {formatDate(call.time)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {t.modal.duration}: {formatDuration(call.duration)}
        </span>
      </div>
    </div>
  )
}
