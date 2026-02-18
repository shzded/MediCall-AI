import { useState, useEffect } from 'react'
import { Building2, Bell, Monitor } from 'lucide-react'
import { t } from '@/constants/translations'
import { useToast } from '@/hooks/useToast'

const STORAGE_KEY = 'medicall-settings'

interface SettingsData {
  emailNotifications: boolean
  smsNotifications: boolean
  urgentAlerts: boolean
  callsPerPage: number
}

const defaults: SettingsData = {
  emailNotifications: true,
  smsNotifications: false,
  urgentAlerts: true,
  callsPerPage: 10,
}

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaults
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-blue' : 'bg-medium-gray/30'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-medium-gray mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-dark-gray">{value}</dd>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-dark-gray">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>(loadSettings)
  const { addToast } = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const update = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    addToast('success', t.settings.saved)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Practice Info */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-blue/10">
            <Building2 size={18} className="text-primary-blue" />
          </div>
          <h2 className="text-base font-semibold text-dark-gray">{t.settings.practiceInfo}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label={t.settings.practiceName} value="Praxis Dr. Weber" />
          <InfoRow label={t.settings.doctorName} value="Dr. Sarah Weber" />
          <InfoRow label={t.settings.phone} value="+43 1 234 5678" />
          <InfoRow label={t.settings.address} value="Hauptstraße 12, 1010 Wien" />
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-blue/10">
            <Bell size={18} className="text-primary-blue" />
          </div>
          <h2 className="text-base font-semibold text-dark-gray">{t.settings.notifications}</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label={t.settings.emailNotifications}
            checked={settings.emailNotifications}
            onChange={v => update('emailNotifications', v)}
          />
          <ToggleRow
            label={t.settings.smsNotifications}
            checked={settings.smsNotifications}
            onChange={v => update('smsNotifications', v)}
          />
          <ToggleRow
            label={t.settings.urgentAlerts}
            checked={settings.urgentAlerts}
            onChange={v => update('urgentAlerts', v)}
          />
        </div>
      </section>

      {/* Display Settings */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-blue/10">
            <Monitor size={18} className="text-primary-blue" />
          </div>
          <h2 className="text-base font-semibold text-dark-gray">{t.settings.display}</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-gray">{t.settings.callsPerPage}</span>
            <select
              value={settings.callsPerPage}
              onChange={e => update('callsPerPage', Number(e.target.value))}
              className="rounded-lg bg-primary-beige px-3 py-2 text-sm text-dark-gray border-0 outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-gray">{t.settings.language}</span>
            <select
              disabled
              value="de"
              className="rounded-lg bg-primary-beige px-3 py-2 text-sm text-dark-gray border-0 outline-none opacity-60 cursor-not-allowed"
            >
              <option value="de">{t.settings.german}</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}
