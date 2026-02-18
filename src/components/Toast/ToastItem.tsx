import { X } from 'lucide-react'
import clsx from 'clsx'
import type { Toast } from '@/types'

interface Props {
  toast: Toast
  onRemove: (id: string) => void
}

const borderColors = {
  success: 'border-l-success-green',
  error: 'border-l-error-red',
  info: 'border-l-primary-blue',
}

const iconColors = {
  success: 'text-success-green',
  error: 'text-error-red',
  info: 'text-primary-blue',
}

export default function ToastItem({ toast, onRemove }: Props) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-lg border-l-4 bg-white px-4 py-3 shadow-lg',
        'animate-slide-in min-w-[300px] max-w-[400px]',
        borderColors[toast.type],
      )}
      role="alert"
    >
      <span className={clsx('text-sm font-medium flex-1', iconColors[toast.type])}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-medium-gray hover:text-dark-gray transition-colors"
        aria-label="Schließen"
      >
        <X size={16} />
      </button>
    </div>
  )
}
