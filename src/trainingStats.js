// Numbers for the Training part of the Stats page. Plain functions, no screen code.
import { EXERCISES } from './trainingData.js'
import { lastDays } from './stats.js'
import { parseKey } from './calendar.js'

// Only Training sessions from the Work log (not deleted).
export const trainingSessions = sessions => sessions.filter(s => s.kind === 'training' && !s.deletedAt)

// Sessions inside a range. `days` is 7, 30, or null for all time.
export function inRange(sessions, days) {
  if (!days) return sessions
  const start = parseKey(lastDays(days)[0]).getTime()
  return sessions.filter(s => s.startedAt >= start)
}

// How many workouts, and the total time spent (in seconds).
export function workoutTotals(sessions) {
  return { count: sessions.length, seconds: sessions.reduce((sum, s) => sum + (s.focusMs || 0), 0) / 1000 }
}

// The four parts of the day, by the hour a workout started.
export const DAY_PARTS = [
  { value: 'morning', label: 'Morning', hint: '5–12' },
  { value: 'afternoon', label: 'Afternoon', hint: '12–17' },
  { value: 'evening', label: 'Evening', hint: '17–22' },
  { value: 'night', label: 'Night', hint: '22–5' },
]

function partOf(hour) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

// { morning: n, afternoon: n, evening: n, night: n } and the most common one.
export function timeOfDay(sessions) {
  const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  for (const s of sessions) counts[partOf(new Date(s.startedAt).getHours())] += 1
  let top = null
  for (const part of DAY_PARTS) {
    if (counts[part.value] > 0 && (!top || counts[part.value] > counts[top])) top = part.value
  }
  return { counts, top }
}

// A readable name for an exercise key: the library name, or the custom
// name with a capital first letter.
export function exerciseName(key) {
  if (EXERCISES[key]) return EXERCISES[key].name
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : ''
}

// Exercises ranked by how many workouts they were in. Old workouts have no
// `exercises` list, so they are skipped. `hasData` is false when no workout
// has a list yet.
export function topExercises(sessions) {
  const counts = {}
  let hasData = false
  for (const s of sessions) {
    if (!Array.isArray(s.exercises) || s.exercises.length === 0) continue
    hasData = true
    for (const key of s.exercises) counts[key] = (counts[key] || 0) + 1
  }
  const list = Object.entries(counts)
    .map(([key, count]) => ({ key, name: exerciseName(key), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  return { list, hasData }
}

// Every rated exercise, best score first (score = ＋ minus −), plus the
// total of all votes: { rows, plus, minus }.
export function ratingTotals(ratings) {
  const rows = Object.entries(ratings)
    .map(([key, r]) => ({ key, name: exerciseName(key), plus: r?.plus || 0, minus: r?.minus || 0 }))
    .filter(r => r.plus + r.minus > 0)
    .sort((a, b) => b.plus - b.minus - (a.plus - a.minus) || a.name.localeCompare(b.name))
  return {
    rows,
    plus: rows.reduce((sum, r) => sum + r.plus, 0),
    minus: rows.reduce((sum, r) => sum + r.minus, 0),
  }
}

// Best (most ＋) and worst (most −) exercises from the ratings.
// Only exercises with at least one vote of that kind are listed.
export function ratingLists(ratings, limit = 3) {
  const all = Object.entries(ratings).map(([key, r]) => ({
    key,
    name: exerciseName(key),
    plus: r?.plus || 0,
    minus: r?.minus || 0,
  }))
  const best = all
    .filter(r => r.plus > 0)
    .sort((a, b) => b.plus - a.plus || a.minus - b.minus)
    .slice(0, limit)
  const worst = all
    .filter(r => r.minus > 0)
    .sort((a, b) => b.minus - a.minus || a.plus - b.plus)
    .slice(0, limit)
  return { best, worst }
}
