import { useState } from 'react'
import { Menu, Search, Bell, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '@/constants/translations'

interface Props {
  onMenuToggle: () => void
  unreadCount?: number
}

const pageTitles: Record<string, string> = {
  '/': t.nav.dashboard,
  '/calls': t.nav.calls,
  '/analytics': t.nav.analytics,
  '/settings': t.nav.settings,
}

export default function TopBar({ onMenuToggle, unreadCount = 0 }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const title = pageTitles[location.pathname] ?? 'MediCall AI'
  const [searchValue, setSearchValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/calls?search=${encodeURIComponent(searchValue.trim())}`)
      setSearchValue('')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm sm:px-6">
      <button
        onClick={onMenuToggle}
        className="lg:hidden rounded-lg p-2 text-medium-gray hover:bg-light-gray transition-colors"
        aria-label="Menü öffnen"
      >
        <Menu size={22} />
      </button>

      <h1 className="text-lg font-bold text-dark-gray">{title}</h1>

      <div className="flex-1" />

      {/* Search (hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-2 rounded-lg bg-primary-beige px-3 py-2 max-w-xs flex-1">
        <Search size={16} className="text-medium-gray flex-shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.topbar.search}
          className="bg-transparent text-sm text-dark-gray placeholder-medium-gray outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative rounded-lg p-2 text-medium-gray hover:bg-light-gray transition-colors"
          aria-label={`${t.topbar.notifications}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error-red text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-blue text-white">
            <User size={16} />
          </div>
          <span className="hidden sm:block text-sm font-medium text-dark-gray">
            Dr. Sarah Weber
          </span>
        </div>
      </div>
    </header>
  )
}
