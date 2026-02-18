export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (target.getTime() === today.getTime()) {
    return `Heute, ${formatTime(isoString)}`
  }
  if (target.getTime() === yesterday.getTime()) {
    return `Gestern, ${formatTime(isoString)}`
  }

  return date.toLocaleDateString('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ', ' + formatTime(isoString)
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('de-AT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
}
