import { Settings as SettingsIcon } from 'lucide-react'
import { t } from '@/constants/translations'

export default function Settings() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-blue/10 mb-6">
        <SettingsIcon className="text-primary-blue" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-dark-gray mb-2">
        {t.settings.title}
      </h2>
      <p className="text-lg text-primary-blue font-medium mb-2">
        {t.settings.comingSoon}
      </p>
      <p className="text-sm text-medium-gray max-w-sm">
        {t.settings.description}
      </p>
    </div>
  )
}
