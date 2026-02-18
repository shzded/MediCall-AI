import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import PatientInfo from './PatientInfo'
import SummarySection from './SummarySection'
import SymptomsSection from './SymptomsSection'
import NotesSection from './NotesSection'
import CallbackSection from './CallbackSection'
import ConfirmDialog from '@/components/ConfirmDialog'
import { fetchCall, updateCallStatus, updateCallCallback, deleteCall } from '@/api/calls'
import { useToast } from '@/hooks/useToast'
import { t } from '@/constants/translations'
import type { Call } from '@/types'

interface Props {
  callId: number
  onClose: () => void
  onStatusChange?: () => void
  onDelete?: () => void
}

export default function CallDetailModal({ callId, onClose, onStatusChange, onDelete }: Props) {
  const [call, setCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { addToast } = useToast()
  const modalRef = useRef<HTMLDivElement>(null)

  // Load call data
  useEffect(() => {
    setLoading(true)
    fetchCall(callId)
      .then(setCall)
      .catch(() => addToast('error', t.common.error))
      .finally(() => setLoading(false))
  }, [callId, addToast])

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusableElements[0]
    const last = focusableElements[focusableElements.length - 1]

    first?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => modal.removeEventListener('keydown', handleTab)
  }, [loading])

  const handleToggleStatus = useCallback(async () => {
    if (!call) return
    const prevStatus = call.status
    const newStatus = prevStatus === 'unread' ? 'read' : 'unread'
    setCall(prev => prev ? { ...prev, status: newStatus } : prev)
    try {
      await updateCallStatus(call.id)
      addToast('success', t.toast.statusUpdated)
      onStatusChange?.()
    } catch {
      setCall(prev => prev ? { ...prev, status: prevStatus } : prev)
      addToast('error', t.toast.statusUpdateFailed)
    }
  }, [call, addToast, onStatusChange])

  const handleCallbackComplete = useCallback(async () => {
    if (!call) return
    try {
      const updated = await updateCallCallback(call.id)
      setCall(updated)
      addToast('success', t.toast.callbackUpdated)
    } catch {
      addToast('error', t.toast.callbackFailed)
    }
  }, [call, addToast])

  const handleDelete = useCallback(async () => {
    if (!call) return
    try {
      await deleteCall(call.id)
      addToast('success', t.toast.callDeleted)
      onDelete?.()
    } catch {
      addToast('error', t.toast.callDeleteFailed)
    }
    setShowConfirmDelete(false)
  }, [call, addToast, onDelete])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] sm:items-center sm:pt-4">
        <div
          className="absolute inset-0 bg-black/40 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={clsx(
            'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto',
            'rounded-xl bg-white shadow-xl animate-scale-in',
            'sm:max-h-[85vh]',
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary-blue" size={32} />
            </div>
          ) : call ? (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-light-gray px-5 py-4 rounded-t-xl">
                <h2 id="modal-title" className="text-lg font-bold text-dark-gray">
                  {t.modal.callDetail}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleStatus}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      call.status === 'unread'
                        ? 'bg-primary-blue-light text-primary-blue hover:bg-primary-blue/20'
                        : 'bg-light-gray text-medium-gray hover:bg-medium-gray/20',
                    )}
                  >
                    {call.status === 'unread' ? <Eye size={14} /> : <EyeOff size={14} />}
                    {call.status === 'unread' ? t.calls.markRead : t.calls.markUnread}
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-medium-gray hover:bg-light-gray transition-colors"
                    aria-label={t.modal.close}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-5 p-5">
                <PatientInfo call={call} />
                <SummarySection summary={call.summary} />
                <SymptomsSection symptoms={call.symptoms} />
                <NotesSection callId={call.id} initialNotes={call.notes} />
                <CallbackSection call={call} onMarkComplete={handleCallbackComplete} />
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-between bg-white border-t border-light-gray px-5 py-4 rounded-b-xl">
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-error-red hover:bg-error-red-light transition-colors"
                >
                  <Trash2 size={16} />
                  {t.modal.delete}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-light-gray px-4 py-2 text-sm font-medium text-dark-gray hover:bg-light-gray transition-colors"
                >
                  {t.modal.close}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-20 text-sm text-error-red" role="alert">
              {t.common.error}
            </div>
          )}
        </div>
      </div>

      {/* Nested confirm dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  )
}
