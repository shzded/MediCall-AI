import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { t } from '@/constants/translations'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title = t.confirm.deleteTitle,
  message = t.confirm.deleteMessage,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        className="relative rounded-xl bg-white p-6 shadow-xl max-w-sm w-full animate-scale-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-red-light">
            <AlertTriangle className="text-error-red" size={20} />
          </div>
          <h3 id="confirm-title" className="text-lg font-semibold text-dark-gray">
            {title}
          </h3>
        </div>
        <p id="confirm-message" className="text-sm text-medium-gray mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-lg border border-light-gray px-4 py-2 text-sm font-medium text-dark-gray hover:bg-light-gray transition-colors"
          >
            {t.confirm.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-error-red px-4 py-2 text-sm font-medium text-white hover:bg-error-red/90 transition-colors"
          >
            {t.confirm.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
