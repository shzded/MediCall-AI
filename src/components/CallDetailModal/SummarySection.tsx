import { t } from '@/constants/translations'

interface Props {
  summary: string
}

export default function SummarySection({ summary }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-medium-gray uppercase tracking-wide">
        {t.modal.summary}
      </h3>
      <p className="text-sm text-dark-gray leading-relaxed bg-primary-beige rounded-lg p-3">
        {summary}
      </p>
    </div>
  )
}
