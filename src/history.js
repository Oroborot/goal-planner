// The history log: a diary of everything that happens to goals.
// Each entry ("event") looks like:
// { id, at, type, itemId, title, ...extra }
// - at:     when it happened
// - type:   what happened (see EVENT_TEXT below)
// - itemId: which goal it happened to
// - title:  the goal's title at that moment, so renamed or deleted goals
//           still make sense later
// Some types carry extra details, such as the parent goal for "linked".

// The name of the slot in the browser's localStorage where events are saved.
export const EVENTS_KEY = 'planner-events'

export function makeEvent(type, goal, extra = {}) {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    type,
    itemId: goal.id,
    title: goal.title,
    ...extra,
  }
}

// Read saved events when the app opens; an empty diary if there are none.
export function loadEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(EVENTS_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// How each event reads on the goal page.
const EVENT_TEXT = {
  created: () => 'Created',
  edited: e => `Edited: ${e.fields.join(', ')}`,
  linked: e => `Linked under “${e.parentTitle}”`,
  unlinked: e => `Unlinked from “${e.parentTitle}”`,
  ticked: () => 'Ticked done',
  unticked: () => 'Unticked',
  'auto-completed': () => 'Completed automatically',
  'auto-uncompleted': () => 'Un-completed automatically',
  deleted: () => 'Deleted',
  restored: () => 'Restored',
  'note-linked': e => `Linked to “${e.linkTitle}”`,
  'note-unlinked': e => `Unlinked from “${e.linkTitle}”`,
}

export function eventText(event) {
  const text = EVENT_TEXT[event.type]
  return text ? text(event) : event.type
}

// How an event about a smaller goal reads on its bigger goal's page.
export function childEventText(event) {
  if (event.type === 'linked') return `“${event.title}” was linked under this`
  if (event.type === 'unlinked') return `“${event.title}” was unlinked from this`
  return eventText(event)
}

// How many times a goal was ticked by hand, from the history log.
export function tickCount(events, goalId) {
  return events.filter(e => e.itemId === goalId && e.type === 'ticked').length
}

// The "deleted" entry for a goal: it holds the progress at that moment.
export function deletedEvent(events, goalId) {
  return events.find(e => e.itemId === goalId && e.type === 'deleted')
}

export function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
