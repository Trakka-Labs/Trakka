/**
 * Human-first date and time formatting used across the app. Times should read
 * as words ("Today", "Yesterday", "Friday, 14 November 2026", "5 minutes
 * ago") rather than raw numbers or ISO strings.
 */

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * "Today", "Tomorrow", "Yesterday", "Friday, 14 November" (this year), or
 * "Friday, 14 November 2025" across years. Returns an em dash for empties and
 * passes through unparseable values unchanged.
 */
export function humanDate(value, { weekday = true, year = 'auto' } = {}) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const dayDiff = Math.round((target.getTime() - today.getTime()) / 86_400_000)

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Tomorrow'
  if (dayDiff === -1) return 'Yesterday'

  const includeYear =
    year === true || (year === 'auto' && target.getFullYear() !== today.getFullYear())
  return new Intl.DateTimeFormat('en-GB', {
    ...(weekday ? { weekday: 'long' } : {}),
    day: 'numeric',
    month: 'long',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(date)
}

/** "Today, 3:42 PM" / "Friday, 14 November, 3:42 PM". */
export function humanDateTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = humanDate(date)
  const clock = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  return `${day}, ${clock}`
}

/** Clock only, e.g. "3:42 PM". */
export function humanTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

/** Compact relative wording for feeds: "Just now", "5 minutes ago", "3 days ago". */
export function relativeTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (seconds < 86_400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  const days = Math.floor(seconds / 86_400)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return humanDate(date, { weekday: false })
}
