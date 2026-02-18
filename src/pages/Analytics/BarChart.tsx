import { formatShortDate } from '@/utils/date'
import type { DailyStats } from '@/types'

interface Props {
  data: DailyStats[]
}

export default function BarChart({ data }: Props) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const chartHeight = 200
  const padding = { top: 10, bottom: 40, left: 40, right: 10 }
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Grid lines
  const gridLines = 4
  const gridValues = Array.from({ length: gridLines + 1 }).map((_, i) =>
    Math.round((maxCount / gridLines) * i),
  )

  return (
    <svg viewBox={`0 0 400 ${chartHeight}`} className="w-full" role="img" aria-label="7-Tage-Trend">
      {/* Grid lines */}
      {gridValues.map((val, i) => {
        const y = padding.top + innerHeight - (val / maxCount) * innerHeight
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={400 - padding.right} y2={y} stroke="#E8E8E8" strokeWidth="0.5" />
            <text x={padding.left - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#B0B0B0">
              {val}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barW = (400 - padding.left - padding.right) / data.length * 0.6
        const gap = (400 - padding.left - padding.right) / data.length
        const x = padding.left + gap * i + (gap - barW) / 2
        const barH = (d.count / maxCount) * innerHeight
        const y = padding.top + innerHeight - barH

        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="#7FB3D5"
              className="hover:opacity-80 transition-opacity"
            />
            {/* Value on top */}
            <text
              x={x + barW / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#4A4A4A"
              fontWeight="600"
            >
              {d.count}
            </text>
            {/* Day label */}
            <text
              x={x + barW / 2}
              y={chartHeight - 5}
              textAnchor="middle"
              fontSize="9"
              fill="#B0B0B0"
            >
              {formatShortDate(d.date)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
