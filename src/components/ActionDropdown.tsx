import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import clsx from 'clsx'

interface Action {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface Props {
  actions: Action[]
}

export default function ActionDropdown({ actions }: Props) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setFocusedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % actions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => (prev - 1 + actions.length) % actions.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) {
          actions[focusedIndex]?.onClick()
          setOpen(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        break
    }
  }

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="rounded-lg p-1.5 text-medium-gray hover:bg-light-gray hover:text-dark-gray transition-colors"
        aria-label="Aktionen"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-lg bg-white py-1 shadow-lg border border-light-gray animate-fade-in"
          role="menu"
        >
          {actions.map((action, i) => (
            <button
              key={action.label}
              onClick={e => {
                e.stopPropagation()
                action.onClick()
                setOpen(false)
              }}
              className={clsx(
                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                i === focusedIndex && 'bg-primary-beige',
                action.variant === 'danger'
                  ? 'text-error-red hover:bg-error-red-light'
                  : 'text-dark-gray hover:bg-primary-beige',
              )}
              role="menuitem"
              tabIndex={-1}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
