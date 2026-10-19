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
