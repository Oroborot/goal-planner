// Numbers for the Stats page and the stats box on a goal's page.
// Everything is worked out from the goals and the history log; nothing
// extra is saved.
import { addDaysKey, dateKey, todayKey } from './calendar.js'
import { childrenOf } from './progress.js'

// An ISO time ('2026-10-20T13:05:00Z') -> its day on this phone.
function dayOf(iso) {
  return dateKey(new Date(iso))
}

// The last `n` days up to today, oldest first.
export function lastDays(n) {
  const today = todayKey()
  return Array.from({ length: n }, (_, i) => addDaysKey(today, i - n + 1))
}

// A goal plus every smaller goal under it, all the way down.
export function withSmaller(goals, id) {
  const ids = new Set([id])
  const queue = [id]
  while (queue.length > 0) {
    for (const child of childrenOf(goals, queue.shift())) {
      if (!ids.has(child.id)) {
        ids.add(child.id)
        queue.push(child.id)
      }
    }
  }
  return ids
}

// How many things were done on each day: { '2026-10-20': 3, … }.
// Habits count once per day ticked; other goals on the day they were done.
// `ids` limits it to some goals (a goal and its smaller goals).
export function doneByDay(goals, ids = null) {
  const counts = {}
  for (const goal of goals) {
    if (ids && !ids.has(goal.id)) continue
    const days = goal.repeat ? goal.doneDates : goal.done && goal.completedAt ? [dayOf(goal.completedAt)] : []
    for (const day of days) counts[day] = (counts[day] || 0) + 1
  }
  return counts
}

// Timer seconds on each day: { '2026-10-20': 1500, … }.
export function timeByDay(events, ids = null) {
  const seconds = {}
  for (const e of events) {
    if (e.type !== 'timed' || (ids && !ids.has(e.itemId))) continue
    const day = dayOf(e.at)
    seconds[day] = (seconds[day] || 0) + e.seconds
  }
  return seconds
}

// How many history entries of these types, from `fromKey` on (or ever).
export function countEvents(events, types, fromKey = null, ids = null) {
  return events.filter(
    e =>
      types.includes(e.type) &&
      (!fromKey || dayOf(e.at) >= fromKey) &&
      (!ids || ids.has(e.itemId)),
  ).length
}

// Timer seconds per goal from `fromKey` on, most first: [{ id, title, seconds }].
export function timeByGoal(events, fromKey) {
  const byId = {}
  for (const e of events) {
    if (e.type !== 'timed' || dayOf(e.at) < fromKey) continue
    byId[e.itemId] = byId[e.itemId] || { id: e.itemId, title: e.title, seconds: 0 }
    byId[e.itemId].seconds += e.seconds
  }
  return Object.values(byId).sort((a, b) => b.seconds - a.seconds)
}

// Adds up a { day: number } map over some days.
export function sumOver(map, days) {
  return days.reduce((sum, day) => sum + (map[day] || 0), 0)
}

// "2 h 5 min", "25 min", or "0 min".
export function shortDuration(seconds) {
  const minutes = Math.round(seconds / 60)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`
  return `${m} min`
}
