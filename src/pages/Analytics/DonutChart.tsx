import type { UrgencyStats } from '@/types'

interface Props {
  data: UrgencyStats[]
}

const colors: Record<string, string> = {
  high: '#EF5350',
  medium: '#FFB74D',
  low: '#88C97B',
}

export default function DonutChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1
  const radius = 60
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <svg viewBox="0 0 180 180" className="w-full max-w-[180px]" role="img" aria-label="Dringlichkeitsverteilung">
      {data.map(d => {
        const percentage = d.count / total
        const dash = percentage * circumference
        const currentOffset = offset
        offset += dash

        return (
          <circle
            key={d.urgency}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={colors[d.urgency] ?? '#E8E8E8'}
            strokeWidth="20"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
          />
        )
      })}
      {/* Center text */}
      <text x="90" y="85" textAnchor="middle" fontSize="24" fontWeight="700" fill="#4A4A4A">
        {total}
      </text>
      <text x="90" y="105" textAnchor="middle" fontSize="11" fill="#B0B0B0">
        Gesamt
      </text>
    </svg>
  )
}
