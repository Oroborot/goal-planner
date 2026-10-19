// Progress and automatic completion for goals.
import { makeEvent } from './history.js'
import { periodProgress } from './repeat.js'

// The goals that are in use: deleted goals are kept in the saved data
// (all data is good data) but hidden everywhere else.
export function activeGoals(items) {
  return items.filter(item => item.list === 'goals' && !item.deletedAt)
}

// The goals linked directly under `id`.
export function childrenOf(goals, id) {
  return goals.filter(g => g.parentIds.includes(id))
}

// How far along a goal is, from 0 (nothing done) to 1 (all done).
// - A repeating goal: progress toward its target right now
//   (e.g. done 2 of 3 times this week = 0.67).
// - A ticked goal is always 1.
// - A goal with nothing under it is 0 until it's ticked.
// - Otherwise it's the average of the goals under it, all the way down.
export function progressOf(goals, goal) {
  if (goal.repeat) return periodProgress(goal)
  if (goal.done) return 1
  const children = childrenOf(goals, goal.id)
  if (children.length === 0) return 0
  const total = children.reduce((sum, child) => sum + progressOf(goals, child), 0)
  return total / children.length
}

export function percent(progress) {
  return Math.round(progress * 100)
}

// Check the goals in `idsToCheck`, and then their bigger goals, one level
// at a time:
// - everything under a goal is done -> it completes itself ("auto")
// - something under an auto-completed goal isn't done -> it un-completes
// A goal you ticked by hand is never unticked automatically.
// Returns the new items list and history events for what changed.
export function settleCompletion(items, idsToCheck) {
  const byId = new Map(items.map(item => [item.id, item]))
  const queue = [...idsToCheck]
  const events = []

  while (queue.length > 0) {
    const goal = byId.get(queue.shift())
    if (!goal || goal.list !== 'goals' || goal.deletedAt) continue

    const children = activeGoals([...byId.values()]).filter(g => g.parentIds.includes(goal.id))
    // A repeating goal is a habit that's never "finished", so a goal with
    // one under it never completes itself; tick it by hand instead.
    const allDone =
      children.length > 0 && children.every(child => !child.repeat && child.done)

    let updated = null
    if (allDone && !goal.done) {
      updated = { ...goal, done: true, completedAt: new Date().toISOString(), completedBy: 'auto' }
      events.push(makeEvent('auto-completed', goal))
    } else if (!allDone && goal.done && goal.completedBy === 'auto') {
      updated = { ...goal, done: false, completedAt: null, completedBy: null }
      events.push(makeEvent('auto-uncompleted', goal))
    }

    // If this goal changed, its own bigger goals need checking too.
    if (updated) {
      byId.set(goal.id, updated)
      queue.push(...goal.parentIds)
    }
  }

  return { items: items.map(item => byId.get(item.id)), events }
}
