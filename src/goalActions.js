// Everything that changes goals, shared by the goals list and the goal page.
// Each function takes the current items and returns a new items list;
// the screens pass that to setItems.
import { settleCompletion } from './progress.js'

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
  }
}

// Add a goal. A new, unfinished goal can un-complete its bigger goals.
export function addGoal(items, title, timeframe, parentIds, why = '') {
  const goal = makeGoal(title, timeframe, parentIds, why)
  return settleCompletion([...items, goal], parentIds)
}

// Tick or untick a goal by hand, then let its bigger goals react.
export function toggleGoal(items, id) {
  const goal = items.find(item => item.id === id)
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
  return settleCompletion(updated, goal.parentIds)
}

// Save changes from the edit form. `childIds` are the smaller goals that
// should sit under this goal: link the ticked ones, unlink the rest.
export function saveGoal(items, id, changes, childIds) {
  const oldParentIds = items.find(item => item.id === id).parentIds
  const updated = items.map(item => {
    if (item.id === id) return { ...item, ...changes }
    if (item.list !== 'goals') return item
    const isLinked = item.parentIds.includes(id)
    const shouldLink = childIds.includes(item.id)
    if (isLinked && !shouldLink) {
      return { ...item, parentIds: item.parentIds.filter(p => p !== id) }
    }
    if (!isLinked && shouldLink) {
      return { ...item, parentIds: [...item.parentIds, id] }
    }
    return item
  })
  // The goal's own smaller goals may have changed, and so may its parents.
  return settleCompletion(updated, [id, ...oldParentIds, ...changes.parentIds])
}

// Delete a goal and unlink any smaller goals that pointed to it.
export function deleteGoal(items, id) {
  const goal = items.find(item => item.id === id)
  const updated = items
    .filter(item => item.id !== id)
    .map(item =>
      item.parentIds?.includes(id)
        ? { ...item, parentIds: item.parentIds.filter(p => p !== id) }
        : item,
    )
  return settleCompletion(updated, goal.parentIds)
}
