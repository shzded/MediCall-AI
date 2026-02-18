import { t } from '@/constants/translations'

interface Props {
  symptoms: string[]
}

export default function SymptomsSection({ symptoms }: Props) {
  if (symptoms.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-medium-gray uppercase tracking-wide">
        {t.modal.symptoms}
      </h3>
      <div className="flex flex-wrap gap-2">
        {symptoms.map(symptom => (
          <span
            key={symptom}
            className="inline-flex rounded-full bg-soft-coral-light px-3 py-1 text-xs font-medium text-soft-coral"
          >
            {symptom}
          </span>
        ))}
      </div>
    </div>
  )
}
