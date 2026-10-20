// Everything that changes goals, shared by the goals list and the goal page.
// Each function takes the current items and returns
//   { items, events }
// - items:  the new items list
// - events: history entries for what just happened
// The screens hand that to `apply` (from App), which saves both.
import { activeGoals, percent, progressOf, settleCompletion } from './progress.js'
import { makeEvent } from './history.js'
import { sizeOf } from './timeframes.js'
import { todayKey } from './repeat.js'
import { addDaysKey } from './calendar.js'

// A new goal with all its fields filled in.
function makeGoal(title, timeframe, parentIds, why = '') {
  return {
    id: crypto.randomUUID(),
    title,
    list: 'goals',
    timeframe,
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    // 'hand' if you ticked it, 'auto' if it completed itself.
    completedBy: null,
    parentIds,
    why,
    // Set when the goal is deleted; deleted goals are hidden, not erased.
    deletedAt: null,
    // Its own color (see colors.js), or null to use its bigger goal's.
    color: null,
    // Repeating goals (see repeat.js); null for one-time goals.
    repeat: null,
    target: null,
    repeatSince: null,
    doneDates: [],
    // Calendar: the day a one-time Day goal is planned for ('2026-10-21'),
    // and an optional time ('07:00'). Only Day goals have these.
    date: null,
    time: null,
    // Set when a task is done before its planned day: the day it was
    // planned for (it then moves to the day it was actually done).
    plannedDate: null,
    // Show in the Now box as ASAP (only for tasks with no date); and the day
    // a task was skipped from, shown as "Skipped from Tue".
    asap: false,
    skippedFrom: null,
    // How important (0 none, 1 low, 2 medium, 3 high) and the expected time
    // in minutes (null = not set).
    importance: 0,
    duration: null,
    // Chain: the id of the task or habit this one comes right after
    // ("shower after workout"), or null.
    after: null,
    // Checklist inside the task: [{ id, text, done }].
    checklist: [],
  }
}

function titleOf(items, id) {
  return items.find(item => item.id === id)?.title ?? ''
}

// Run the automatic completion rules and add their events to ours.
function finish(items, events, idsToCheck) {
  const settled = settleCompletion(items, idsToCheck)
  return { items: settled.items, events: [...events, ...settled.events] }
}

// Add a goal. A new, unfinished goal can un-complete its bigger goals.
// `when` can put a Day goal on the calendar: { date, time } (both optional),
// and set { importance, duration } for any goal.
export function addGoal(items, title, timeframe, parentIds, why = '', when = {}) {
  const goal = makeGoal(title, timeframe, parentIds, why)
  if (timeframe === 'day') {
    goal.date = when.date || null
    goal.time = (when.date && when.time) || null
    goal.asap = !when.date && Boolean(when.asap)
  }
  if (when.importance) goal.importance = when.importance
  if (when.duration) goal.duration = when.duration
  const events = [
    makeEvent('created', goal, { timeframe }),
    ...parentIds.map(parentId =>
      makeEvent('linked', goal, { parentId, parentTitle: titleOf(items, parentId) }),
    ),
  ]
  return finish([...items, goal], events, parentIds)
}

// "Now" box: push a timed task later today by `minutes` (stops at 23:59).
export function snoozeTask(items, id, minutes) {
  const task = items.find(item => item.id === id)
  const [h, m] = task.time.split(':').map(Number)
  const total = Math.min(23 * 60 + 59, h * 60 + m + minutes)
  const time = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  return {
    items: items.map(item => (item.id === id ? { ...item, time } : item)),
    events: [makeEvent('snoozed', task, { minutes, time })],
  }
}

// Checklist inside a task (Things 3 style): "Buy food" → milk, eggs, …
// Each item is { id, text, done }. Ticking items doesn't tick the task;
// you tick the task yourself when you're done.
function updateChecklist(items, goalId, change, event) {
  const goal = items.find(item => item.id === goalId)
  return {
    items: items.map(item =>
      item.id === goalId ? { ...item, checklist: change(item.checklist || []) } : item,
    ),
    events: [makeEvent(event.type, goal, { text: event.text })],
  }
}

export function addChecklistItem(items, goalId, text) {
  return updateChecklist(
    items,
    goalId,
    list => [...list, { id: crypto.randomUUID(), text, done: false }],
    { type: 'subitem-added', text },
  )
}

export function toggleChecklistItem(items, goalId, itemId) {
  const goal = items.find(item => item.id === goalId)
  const entry = (goal.checklist || []).find(c => c.id === itemId)
  return updateChecklist(
    items,
    goalId,
    list => list.map(c => (c.id === itemId ? { ...c, done: !c.done } : c)),
    { type: entry.done ? 'subitem-unticked' : 'subitem-ticked', text: entry.text },
  )
}

export function removeChecklistItem(items, goalId, itemId) {
  const goal = items.find(item => item.id === goalId)
  const entry = (goal.checklist || []).find(c => c.id === itemId)
  return updateChecklist(items, goalId, list => list.filter(c => c.id !== itemId), {
    type: 'subitem-removed',
    text: entry.text,
  })
}

// Timeline ↑ ↓: move a timed task earlier (negative) or later by `minutes`,
// staying within the day (00:00–23:59).
export function moveTask(items, id, minutes) {
  const task = items.find(item => item.id === id)
  const [h, m] = task.time.split(':').map(Number)
  const total = Math.min(23 * 60 + 59, Math.max(0, h * 60 + m + minutes))
  const time = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  return {
    items: items.map(item => (item.id === id ? { ...item, time } : item)),
    events: [makeEvent('moved', task, { minutes, time })],
  }
}

// "Now" box: not today. A dated task moves to tomorrow; an ASAP task (no
// date) is hidden from the Now box until tomorrow.
export function skipTask(items, id) {
  const task = items.find(item => item.id === id)
  const tomorrow = addDaysKey(todayKey(), 1)
  const changes = task.date ? { date: tomorrow, skippedFrom: task.date } : { hiddenUntil: tomorrow }
  return {
    items: items.map(item => (item.id === id ? { ...item, ...changes } : item)),
    events: [makeEvent('skipped', task, { asap: !task.date })],
  }
}

// Move: put tasks on another day (Today / Tomorrow / Next week / a date).
// Works for one task or many ("Move all to today").
export function moveToDay(items, ids, date) {
  const moving = items.filter(item => ids.includes(item.id))
  return {
    items: items.map(item =>
      ids.includes(item.id) ? { ...item, date, skippedFrom: null } : item,
    ),
    events: moving.map(task => makeEvent('rescheduled', task, { from: task.date, to: date })),
  }
}

// "Now" box: two of today's timed tasks trade their time slots.
export function swapTasks(items, id, otherId) {
  const a = items.find(item => item.id === id)
  const b = items.find(item => item.id === otherId)
  return {
    items: items.map(item => {
      if (item.id === a.id) return { ...item, time: b.time }
      if (item.id === b.id) return { ...item, time: a.time }
      return item
    }),
    events: [makeEvent('swapped', a, { withId: b.id, withTitle: b.title })],
  }
}

// Quick add from the ＋ sheet: a Day goal that repeats every day.
// `more` can set { importance, duration }.
export function addHabit(items, title, more = {}) {
  const result = addGoal(items, title, 'day', [], '', more)
  const habit = result.items[result.items.length - 1]
  Object.assign(habit, {
    repeat: { days: [0, 1, 2, 3, 4, 5, 6] },
    target: { per: 'day', times: 1 },
    repeatSince: habit.createdAt,
  })
  return result
}

// Tick or untick a goal by hand, then let its bigger goals react.
// A repeating goal is ticked for today only: today's date is added to (or
// taken off) its list of done days.
export function toggleGoal(items, id) {
  const goal = items.find(item => item.id === id)
  if (goal.repeat) {
    const today = todayKey()
    const doneToday = goal.doneDates.includes(today)
    const updated = items.map(item =>
      item.id === id
        ? {
            ...item,
            doneDates: doneToday
              ? item.doneDates.filter(d => d !== today)
              : [...item.doneDates, today],
          }
        : item,
    )
    const events = [makeEvent(doneToday ? 'unticked' : 'ticked', goal, { date: today })]
    return finish(updated, events, goal.parentIds)
  }
  // A calendar task ticked before its planned day was done early: it moves
  // to today, and remembers the day it was planned for. Unticking it puts
  // it back on that planned day.
  const today = todayKey()
  const early = !goal.done && goal.date && goal.date > today
  const backToPlan = goal.done && goal.plannedDate
  const updated = items.map(item => {
    if (item.id !== id) return item
    const changed = {
      ...item,
      done: !item.done,
      completedAt: item.done ? null : new Date().toISOString(),
      completedBy: item.done ? null : 'hand',
    }
    if (early) Object.assign(changed, { date: today, plannedDate: item.date })
    if (backToPlan) Object.assign(changed, { date: item.plannedDate, plannedDate: null })
    return changed
  })
  const events = [
    early
      ? makeEvent('ticked', goal, { early: true, plannedDate: goal.date })
      : makeEvent(goal.done ? 'unticked' : 'ticked', goal),
  ]
  return finish(updated, events, goal.parentIds)
}

// Save changes from the edit form. `childIds` are the smaller goals that
// should sit under this goal: link the ticked ones, unlink the rest.
export function saveGoal(items, id, changes, childIds) {
  const before = items.find(item => item.id === id)
  const after = { ...before, ...changes }
  // Turning repeat on starts the counter from now, so days before that
  // don't count as missed. A repeating goal is never "done" once and for all.
  if (after.repeat && !before.repeat) after.repeatSince = new Date().toISOString()
  if (after.repeat) Object.assign(after, { done: false, completedAt: null, completedBy: null })
  // Only one-time Day goals sit on a calendar date; repeating goals use
  // their repeat days instead. Being on the calendar is optional.
  if (after.timeframe !== 'day' || after.repeat || !after.date) Object.assign(after, { date: null, time: null })
  // ASAP is only for one-time Day tasks without a date.
  if (after.timeframe !== 'day' || after.repeat || after.date) after.asap = false
  const events = []

  // Which fields changed.
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  const fields = ['title', 'timeframe', 'why', 'repeat', 'target', 'color', 'date', 'time', 'asap', 'importance', 'duration', 'after'].filter(
    field => !same(before[field], after[field]),
  )
  if (fields.length > 0) events.push(makeEvent('edited', after, { fields }))

  // Bigger goals this goal was linked to or unlinked from.
  for (const parentId of after.parentIds.filter(p => !before.parentIds.includes(p))) {
    events.push(makeEvent('linked', after, { parentId, parentTitle: titleOf(items, parentId) }))
  }
  for (const parentId of before.parentIds.filter(p => !after.parentIds.includes(p))) {
    events.push(makeEvent('unlinked', after, { parentId, parentTitle: titleOf(items, parentId) }))
  }

  // Smaller goals linked under or unlinked from this goal.
  const updated = items.map(item => {
    if (item.id === id) return after
    if (item.list !== 'goals' || item.deletedAt) return item
    const isLinked = item.parentIds.includes(id)
    const shouldLink = childIds.includes(item.id)
    if (isLinked && !shouldLink) {
      events.push(makeEvent('unlinked', item, { parentId: id, parentTitle: after.title }))
      return { ...item, parentIds: item.parentIds.filter(p => p !== id) }
    }
    if (!isLinked && shouldLink) {
      events.push(makeEvent('linked', item, { parentId: id, parentTitle: after.title }))
      return { ...item, parentIds: [...item.parentIds, id] }
    }
    return item
  })

  // The goal's own smaller goals may have changed, and so may its parents.
  return finish(updated, events, [id, ...before.parentIds, ...after.parentIds])
}

// Delete a goal: it's hidden, not erased, so its history stays.
// Smaller goals that pointed to it get unlinked.
// The "deleted" entry remembers how far along the goal was at that moment,
// because its progress can't be worked out again once it's unlinked.
export function deleteGoal(items, id) {
  const goal = items.find(item => item.id === id)
  const progress = percent(progressOf(activeGoals(items), goal))
  // The smaller goals under it, so a restore can link them back.
  const childIds = activeGoals(items)
    .filter(item => item.parentIds.includes(id))
    .map(item => item.id)
  const events = [makeEvent('deleted', goal, { progress, wasDone: goal.done, childIds })]
  const updated = items.map(item => {
    if (item.id === id) return { ...item, deletedAt: new Date().toISOString() }
    if (item.parentIds?.includes(id) && !item.deletedAt) {
      events.push(makeEvent('unlinked', item, { parentId: id, parentTitle: goal.title }))
      return { ...item, parentIds: item.parentIds.filter(p => p !== id) }
    }
    return item
  })
  return finish(updated, events, goal.parentIds)
}

// Bring a deleted goal back, with its history.
// - Its bigger goals stay linked if they still exist and are still bigger.
// - Smaller goals that were unlinked when it was deleted get linked back,
//   if they still exist and are still smaller.
// `deletedEntry` is the goal's "deleted" history entry (it lists those
// smaller goals); older entries may not have that list.
export function restoreGoal(items, id, deletedEntry) {
  const goal = items.find(item => item.id === id)
  const active = activeGoals(items)
  const activeTimeframe = otherId => active.find(item => item.id === otherId)?.timeframe
  const events = [makeEvent('restored', goal)]

  // Bigger goals: keep the ones still around and still bigger.
  const parentIds = goal.parentIds.filter(p => {
    const timeframe = activeTimeframe(p)
    return timeframe && sizeOf(timeframe) > sizeOf(goal.timeframe)
  })
  for (const parentId of goal.parentIds.filter(p => !parentIds.includes(p))) {
    events.push(makeEvent('unlinked', goal, { parentId, parentTitle: titleOf(items, parentId) }))
  }

  // Smaller goals: link back the ones still around and still smaller.
  const childIds = (deletedEntry?.childIds ?? []).filter(c => {
    const timeframe = activeTimeframe(c)
    return timeframe && sizeOf(timeframe) < sizeOf(goal.timeframe)
  })

  const updated = items.map(item => {
    if (item.id === id) return { ...item, deletedAt: null, parentIds }
    if (childIds.includes(item.id) && !item.parentIds.includes(id)) {
      events.push(makeEvent('linked', item, { parentId: id, parentTitle: goal.title }))
      return { ...item, parentIds: [...item.parentIds, id] }
    }
    return item
  })
  return finish(updated, events, [id, ...parentIds])
}
