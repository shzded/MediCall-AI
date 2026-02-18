import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, Check } from 'lucide-react'
import { updateCallNotes } from '@/api/calls'
import { useToast } from '@/hooks/useToast'
import { t } from '@/constants/translations'
import { NOTES_SAVE_DELAY } from '@/constants/config'

interface Props {
  callId: number
  initialNotes: string | null
}

export default function NotesSection({ callId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const { addToast } = useToast()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  const saveNotes = useCallback(async (value: string) => {
    setSaveState('saving')
    try {
      await updateCallNotes(callId, value)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('idle')
      addToast('error', t.toast.notesSaveFailed)
    }
  }, [callId, addToast])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveNotes(notes)
    }, NOTES_SAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [notes, saveNotes])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-medium-gray uppercase tracking-wide">
          {t.modal.notes}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-medium-gray">
          {saveState === 'saving' && (
            <>
              <Loader2 size={12} className="animate-spin" />
              {t.modal.saving}
            </>
          )}
          {saveState === 'saved' && (
            <>
              <Check size={12} className="text-success-green" />
              {t.modal.saved}
            </>
          )}
        </div>
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={t.modal.notesPlaceholder}
        className="w-full rounded-lg border border-light-gray bg-white p-3 text-sm text-dark-gray placeholder-medium-gray outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/30 resize-y min-h-[80px]"
        rows={3}
      />
    </div>
  )
}
