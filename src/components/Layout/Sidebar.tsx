import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Phone, BarChart3, Settings, X, Stethoscope } from 'lucide-react'
import clsx from 'clsx'
import { t } from '@/constants/translations'
import { APP_VERSION } from '@/constants/config'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: t.nav.dashboard },
  { to: '/calls', icon: Phone, label: t.nav.calls },
  { to: '/analytics', icon: BarChart3, label: t.nav.analytics },
  { to: '/settings', icon: Settings, label: t.nav.settings },
]

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-light-gray">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-mint">
              <Stethoscope className="text-dark-gray" size={20} />
            </div>
            <span className="text-lg font-bold text-dark-gray">MediCall AI</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-medium-gray hover:bg-light-gray transition-colors"
            aria-label="Menü schließen"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-mint/20 text-dark-gray'
                    : 'text-medium-gray hover:bg-primary-beige hover:text-dark-gray',
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Version */}
        <div className="p-4 border-t border-light-gray">
          <span className="text-xs text-medium-gray">v{APP_VERSION}</span>
        </div>
      </aside>
    </>
  )
}
