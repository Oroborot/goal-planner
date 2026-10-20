// Dates for the calendar. Days are saved as text like '2026-10-21'
// (see dateKey in repeat.js) and times as '07:00', in your own time zone.
import { dateKey, todayKey } from './repeat.js'
import { showTime } from './settings.js'

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

// Is a task or habit on this day? Tasks by their date, habits by weekday.
function occursOn(goal, key) {
  if (goal.repeat) return habitsOn([goal], key).length > 0
  return goal.date === key
}

// The time a task or habit happens on a day.
// - Chained ("do after X"): right after X ends, if X is on that day and has
//   a time (and its expected time, if set, is added).
// - Otherwise: the task's own time (habits have none of their own).
// `depth` stops endless loops if chains ever go in a circle.
export function timeOn(goals, goal, key, depth = 0) {
  if (goal.after && depth < 10) {
    const anchor = goals.find(g => g.id === goal.after)
    if (anchor && occursOn(anchor, key)) {
      const start = timeOn(goals, anchor, key, depth + 1)
      if (start) return anchor.duration ? endTime(start, anchor.duration) : start
    }
  }
  return goal.date === key ? goal.time : null
}

// Everything on a day, as one list: tasks and habits, each with the time it
// happens (chains included) and whether it's done that day. Timed first,
// earliest first; then untimed tasks; then untimed habits.
export function dayEntries(goals, key) {
  const entries = [...tasksOn(goals, key), ...habitsOn(goals, key)].map(goal => ({
    goal,
    time: timeOn(goals, goal, key),
    habit: Boolean(goal.repeat),
    done: goal.repeat ? goal.doneDates.includes(key) : goal.done,
  }))
  entries.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time !== b.time) return a.time ? -1 : 1
    if (a.habit !== b.habit) return a.habit ? 1 : -1
    return a.goal.createdAt.localeCompare(b.goal.createdAt)
  })

  // Chained entries go right under what they follow (indented one level
  // per link), even when that has no time.
  const onDay = new Set(entries.map(e => e.goal.id))
  const isRoot = e => !e.goal.after || !onDay.has(e.goal.after)
  const ordered = []
  const placed = new Set()
  const place = (entry, level) => {
    if (placed.has(entry.goal.id) || level > 10) return
    placed.add(entry.goal.id)
    ordered.push({ ...entry, level })
    entries.filter(e => e.goal.after === entry.goal.id).forEach(e => place(e, level + 1))
  }
  entries.filter(isRoot).forEach(e => place(e, 0))
  // Anything left (only possible if links go in a circle) goes at the end.
  entries.filter(e => !placed.has(e.goal.id)).forEach(e => ordered.push({ ...e, level: 0 }))
  return ordered
}

// A day's planned time and its problems:
// - total: all expected minutes of that day's tasks and habits
// - overlaps: pairs of timed entries where one starts before the other ends
export function dayLoad(goals, key) {
  const entries = dayEntries(goals, key)
  const total = entries.reduce((sum, e) => sum + (e.goal.duration || 0), 0)
  const timed = entries.filter(e => e.time && e.goal.duration)
  const overlaps = []
  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i]
      const b = timed[j]
      if (toMinutes(b.time) < toMinutes(a.time) + a.goal.duration) {
        overlaps.push([
          { ...a.goal, time: a.time },
          { ...b.goal, time: b.time },
        ])
      }
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
  const when = goal.time ? `${dayLabel(goal.date)} · ${showTime(goal.time)}` : dayLabel(goal.date)
  return goal.plannedDate ? `${when} (done early, planned for ${dayLabel(goal.plannedDate)})` : when
}
