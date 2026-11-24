// Numbers for the Calendar tab's Done view. Plain functions, no screen code.
// The Done view shows what was done: timed Work sessions, workouts, and
// tasks that were ticked done that day.
import { addDaysKey, dateKey } from './calendar.js'
import { TRAINING_ID, withTraining } from './workLog.js'

// 1700000000000 -> "09:05" (your own time zone). Same style as task times,
// so showTime() can turn it into 12-hour text when needed.
export function clockOf(ms) {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Everything done on one day, in time order (earliest first).
// Each item: { id, kind, startedAt, endedAt, name, color, focusMs, goal }
// - kind: 'work', 'training' or 'task'
// - A session counts on the day it started. Deleted sessions are skipped.
// - A task counts on the day it was ticked (its completedAt). Habits count
//   on every day in their doneDates; they have no tick time, so they go last.
export function doneOnDay(sessions, projects, goals, key) {
  const all = withTraining(projects)
  const items = []

  for (const s of sessions) {
    if (s.deletedAt || dateKey(new Date(s.startedAt)) !== key) continue
    const training = s.kind === 'training' || s.projectId === TRAINING_ID
    const project = all.find(p => p.id === s.projectId)
    items.push({
      id: s.id,
      kind: training ? 'training' : 'work',
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      name: training ? 'Workout' : project ? project.name : 'Work',
      color: project ? project.color : 'var(--accent)',
      focusMs: s.focusMs || 0,
      goal: null,
    })
  }

  for (const goal of goals) {
    if (goal.deletedAt) continue
    if (goal.repeat) {
      if (!goal.doneDates.includes(key)) continue
      items.push({ id: `${goal.id}-${key}`, kind: 'task', startedAt: Infinity, endedAt: null, name: goal.title, color: null, focusMs: 0, goal })
    } else if (goal.done && goal.completedAt && dateKey(new Date(goal.completedAt)) === key) {
      const at = new Date(goal.completedAt).getTime()
      items.push({ id: goal.id, kind: 'task', startedAt: at, endedAt: null, name: goal.title, color: null, focusMs: 0, goal })
    }
  }

  return items.sort((a, b) => (a.startedAt === b.startedAt ? 0 : a.startedAt < b.startedAt ? -1 : 1))
}

// The 7 days of the week that starts on `mondayKey`: { key, items }.
export function doneWeek(sessions, projects, goals, mondayKey) {
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDaysKey(mondayKey, i)
    return { key, items: doneOnDay(sessions, projects, goals, key) }
  })
}
