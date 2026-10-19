// Dates for the calendar. Days are saved as text like '2026-10-21'
// (see dateKey in repeat.js) and times as '07:00', in your own time zone.
import { dateKey, todayKey } from './repeat.js'

export { dateKey, todayKey }

// '2026-10-21' -> a Date at midnight that day.
export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// The day `n` days after `key` ('2026-10-21', 1 -> '2026-10-22').
export function addDaysKey(key, n) {
  const date = parseKey(key)
  date.setDate(date.getDate() + n)
  return dateKey(date)
}

// "Today", "Tomorrow", "Yesterday", or e.g. "Tue 21 Oct".
export function dayLabel(key) {
  const today = todayKey()
  if (key === today) return 'Today'
  if (key === addDaysKey(today, 1)) return 'Tomorrow'
  if (key === addDaysKey(today, -1)) return 'Yesterday'
  return parseKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// "📅 Today · 07:00" for a task's date and optional time.
export function whenLabel(goal) {
  if (!goal.date) return ''
  return goal.time ? `${dayLabel(goal.date)} · ${goal.time}` : dayLabel(goal.date)
}
