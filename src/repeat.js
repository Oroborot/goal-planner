// Repeating goals: goals you do again and again (habits), not once.
// A repeating goal has:
//   repeat:    { days: [0..6] }  which weekdays it's planned (0 = Sunday)
//   target:    { times, per }    when it counts as "done" for its bigger
//                                goals: per 'day', 'week' or 'month'
//   doneDates: ['2026-10-19', …] every day you ticked it
// It never becomes "finished"; ticking marks it done for today only.

// Monday first, the way most calendars outside the US show the week.
export const WEEKDAYS = [
  { value: 1, short: 'Mon' },
  { value: 2, short: 'Tue' },
  { value: 3, short: 'Wed' },
  { value: 4, short: 'Thu' },
  { value: 5, short: 'Fri' },
  { value: 6, short: 'Sat' },
  { value: 0, short: 'Sun' },
]
export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6]

// A day as text, e.g. '2026-10-19', in your own time zone.
export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return dateKey(new Date())
}

function addDays(date, n) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + n)
  return copy
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isScheduled(goal, date) {
  return goal.repeat.days.includes(date.getDay())
}

// Done "now": today for repeating goals, otherwise ticked or not.
export function isDoneNow(goal) {
  return goal.repeat ? goal.doneDates.includes(todayKey()) : goal.done
}

// "Every day", or the chosen days like "Mon, Wed, Fri".
export function repeatLabel(goal) {
  if (goal.repeat.days.length === 7) return 'Every day'
  return WEEKDAYS.filter(d => goal.repeat.days.includes(d.value))
    .map(d => d.short)
    .join(', ')
}

export function targetLabel(target) {
  if (target.per === 'day') return 'each planned day'
  return `${target.times} time${target.times === 1 ? '' : 's'} a ${target.per}`
}

// How many times it was done in the current day, week (Mon–Sun) or month.
function countThisPeriod(goal) {
  const today = startOfDay(new Date())
  const { per } = goal.target
  if (per === 'day') return goal.doneDates.includes(dateKey(today)) ? 1 : 0
  let start
  if (per === 'week') {
    const daysSinceMonday = (today.getDay() + 6) % 7
    start = addDays(today, -daysSinceMonday)
  } else {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
  }
  const from = dateKey(start)
  const to = dateKey(today)
  return goal.doneDates.filter(d => d >= from && d <= to).length
}

// Progress toward the target in the current period, from 0 to 1.
// This is what a repeating goal adds to its bigger goals' progress.
export function periodProgress(goal) {
  const times = goal.target.per === 'day' ? 1 : goal.target.times
  return Math.min(1, countThisPeriod(goal) / times)
}

// The counter on the goal page.
// - total:  every day it was done
// - streak: planned days done in a row, up to today (today doesn't break it
//           until the day is over)
// - missed: planned days since it was created that weren't done (not today)
// - thisPeriod / periodTarget: progress toward the target right now
export function repeatStats(goal) {
  const done = new Set(goal.doneDates)
  const today = startOfDay(new Date())
  const created = startOfDay(new Date(goal.repeatSince || goal.createdAt))

  let streak = 0
  let counting = true
  let missed = 0
  for (let day = today; day >= created; day = addDays(day, -1)) {
    if (!isScheduled(goal, day)) continue
    const isToday = dateKey(day) === dateKey(today)
    const wasDone = done.has(dateKey(day))
    if (wasDone && counting) streak++
    if (!wasDone && !isToday) {
      counting = false
      missed++
    }
  }

  return {
    total: goal.doneDates.length,
    streak,
    missed,
    thisPeriod: countThisPeriod(goal),
    periodTarget: goal.target.per === 'day' ? 1 : goal.target.times,
  }
}

// The last `n` days, oldest first, for the little strip on the goal page:
// each day is 'done', 'missed', 'open' (today, not done yet) or 'off'
// (not planned).
export function recentDays(goal, n = 14) {
  const done = new Set(goal.doneDates)
  const today = startOfDay(new Date())
  const created = startOfDay(new Date(goal.repeatSince || goal.createdAt))
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const day = addDays(today, -i)
    const key = dateKey(day)
    let state
    if (done.has(key)) state = 'done'
    else if (day < created || !isScheduled(goal, day)) state = 'off'
    else if (i === 0) state = 'open'
    else state = 'missed'
    days.push({ key, state, label: day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) })
  }
  return days
}
