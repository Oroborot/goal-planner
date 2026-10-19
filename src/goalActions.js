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
    // Repeating goals (see repeat.js); null for one-time goals.
    repeat: null,
    target: null,
    repeatSince: null,
    doneDates: [],
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
export function addGoal(items, title, timeframe, parentIds, why = '') {
  const goal = makeGoal(title, timeframe, parentIds, why)
  const events = [
    makeEvent('created', goal, { timeframe }),
    ...parentIds.map(parentId =>
      makeEvent('linked', goal, { parentId, parentTitle: titleOf(items, parentId) }),
    ),
  ]
  return finish([...items, goal], events, parentIds)
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
  const updated = items.map(item =>
    item.id === id
      ? {
          ...item,
          done: !item.done,
          completedAt: item.done ? null : new Date().toISOString(),
          completedBy: item.done ? null : 'hand',
        }
      : item,
  )
  const events = [makeEvent(goal.done ? 'unticked' : 'ticked', goal)]
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
  const events = []

  // Which fields changed.
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  const fields = ['title', 'timeframe', 'why', 'repeat', 'target'].filter(
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
