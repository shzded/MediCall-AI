import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-medium-gray mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-dark-gray mb-2">{title}</h3>
      <p className="text-sm text-medium-gray max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
