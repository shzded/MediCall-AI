export function formatDuration(duration: string): string {
  const parts = duration.split(':')
  if (parts.length === 3) {
    const hours = parseInt(parts[0]!, 10)
    const minutes = parseInt(parts[1]!, 10)
    const seconds = parseInt(parts[2]!, 10)
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }
  return duration
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\+43)(\d{3})(\d+)/, '$1 $2 $3')
}
