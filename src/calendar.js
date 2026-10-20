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

// The Monday of the week that `key` is in.
export function mondayOf(key) {
  const daysSinceMonday = (parseKey(key).getDay() + 6) % 7
  return addDaysKey(key, -daysSinceMonday)
}

// Tasks planned on a date: with a time first (earliest first), then the rest.
export function tasksOn(goals, key) {
  return goals
    .filter(g => g.date === key)
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return a.createdAt.localeCompare(b.createdAt)
    })
}

// Habits planned for that weekday, from the day they started repeating.
export function habitsOn(goals, key) {
  const day = parseKey(key)
  return goals.filter(
    g =>
      g.repeat &&
      g.repeat.days.includes(day.getDay()) &&
      key >= (g.repeatSince || g.createdAt).slice(0, 10),
  )
}

// A day counts as overloaded above this many planned minutes (8 hours).
// Later this can become a setting.
export const OVERLOAD_MINUTES = 8 * 60

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// '09:00' + 30 -> '09:30'.
export function endTime(time, duration) {
  const total = Math.min(24 * 60 - 1, toMinutes(time) + duration)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// 90 -> "1h 30m", 45 -> "45m", 120 -> "2h".
export function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

// A day's planned time and its problems:
// - total: all expected minutes of that day's tasks and habits
// - overlaps: pairs of timed tasks where one starts before the other ends
export function dayLoad(goals, key) {
  const all = [...tasksOn(goals, key), ...habitsOn(goals, key)]
  const total = all.reduce((sum, g) => sum + (g.duration || 0), 0)
  const timed = tasksOn(goals, key).filter(t => t.time && t.duration)
  const overlaps = []
  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i]
      const b = timed[j]
      if (toMinutes(b.time) < toMinutes(a.time) + a.duration) overlaps.push([a, b])
    }
  }
  return { total, overlaps }
}

// How many of a day's tasks and habits are done.
export function dayCounts(goals, key) {
  const tasks = tasksOn(goals, key)
  const habits = habitsOn(goals, key)
  return {
    done: tasks.filter(t => t.done).length + habits.filter(h => h.doneDates.includes(key)).length,
    total: tasks.length + habits.length,
  }
}

// "📅 Today · 07:00" for a task's date and optional time.
// Adds "(done early, planned for Tue 28 Oct)" for tasks done before their day.
export function whenLabel(goal) {
  if (!goal.date) return ''
  const when = goal.time ? `${dayLabel(goal.date)} · ${goal.time}` : dayLabel(goal.date)
  return goal.plannedDate ? `${when} (done early, planned for ${dayLabel(goal.plannedDate)})` : when
}
