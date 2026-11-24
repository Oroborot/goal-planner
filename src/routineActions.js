// Routines: repeating tasks. They are normal goals with a `repeat` field
// (see repeat.js). A routine can be switched Off with `paused: true`: it
// hides from the calendar but is never deleted, so it can come back later.
// Like the other action files, each function returns { items, events }.
import { addGoal } from './goalActions.js'
import { makeEvent } from './history.js'
import { EVERY_DAY } from './repeat.js'

// A new routine: a Day goal that repeats on `days` (default every day),
// with an optional time of day.
export function addRoutine(items, title, { days = EVERY_DAY, time = '', pinned = false } = {}) {
  const result = addGoal(items, title, 'day', [], '')
  const routine = result.items[result.items.length - 1]
  Object.assign(routine, {
    repeat: { days },
    target: { per: 'day', times: 1 },
    repeatSince: routine.createdAt,
    time: time || null,
    paused: false,
    pinned,
  })
  return result
}

// Change a routine's name, days or time.
export function updateRoutine(items, id, { title, days, time }) {
  const before = items.find(item => item.id === id)
  const after = {
    ...before,
    title: title.trim() || before.title,
    repeat: { ...before.repeat, days },
    time: time || null,
  }
  return {
    items: items.map(item => (item.id === id ? after : item)),
    events: [makeEvent('edited', after, { fields: ['title', 'repeat', 'time'] })],
  }
}

// Switch one routine On or Off. Switching On starts the counter from now,
// so the days it was Off don't count as missed.
export function setRoutinePaused(items, id, paused) {
  const before = items.find(item => item.id === id)
  const after = { ...before, paused }
  if (!paused) after.repeatSince = new Date().toISOString()
  return {
    items: items.map(item => (item.id === id ? after : item)),
    events: [makeEvent('edited', after, { fields: ['paused'] })],
  }
}

// The days a Repeat pick stands for: every day, or the chosen weekdays.
export const repeatDays = pick => (pick.mode === 'days' ? pick.days : EVERY_DAY)

// Every repeating goal that is not deleted.
export const routinesOf = items => items.filter(i => i.list === 'goals' && i.repeat && !i.deletedAt)

// One-time cleanup: switch all current routines Off. Returns null when
// there is nothing to change.
export function pauseAllRoutines(items) {
  const todo = routinesOf(items).filter(r => !r.paused)
  if (todo.length === 0) return null
  const ids = new Set(todo.map(r => r.id))
  return {
    items: items.map(item => (ids.has(item.id) ? { ...item, paused: true } : item)),
    events: [],
  }
}
