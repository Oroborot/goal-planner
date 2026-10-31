import { EVENTS_KEY, loadEvents } from './history.js'

// The one place that reads and writes the app's data. Today it uses the
// browser's localStorage. Later only this file switches to a server
// (Supabase), so the screens and action files don't need to change.

// The name of the slot in the browser's localStorage where items are saved.
const ITEMS_KEY = 'planner-items'

// Who owns new items. There are no accounts yet, so everything belongs to
// "local" (this phone) and no team. Login fills these in later.
const LOCAL_OWNER = 'local'

// Read saved items when the app opens. If nothing is saved yet, or the saved
// data is broken, start with an empty list instead of crashing.
// Older test items had a single `parentId`; they get turned into a
// `parentIds` list so everything uses the same shape.
export function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(ITEMS_KEY))
    if (!Array.isArray(saved)) return []
    return saved.map(({ parentId, ...item }) => ({
      why: '',
      completedBy: item.done ? 'hand' : null,
      color: null,
      date: null,
      time: null,
      plannedDate: null,
      importance: 0,
      duration: null,
      after: null,
      repeat: null,
      target: null,
      repeatSince: null,
      doneDates: [],
      ...item,
      parentIds: item.parentIds ?? (parentId ? [parentId] : []),
    }))
  } catch {
    return []
  }
}

export function saveItems(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export { loadEvents }

export function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

// Give every new or changed item the fields a server will need:
// ownerId, teamId, createdAt, updatedAt and deletedAt (all times in UTC).
// The action files always return a new object for an item they change, so
// "not the same object as before" means it was added or changed.
export function stampItems(previous, next) {
  const now = new Date().toISOString()
  const unchanged = new Set(previous)
  return next.map(item => {
    if (unchanged.has(item)) return item
    return {
      ownerId: LOCAL_OWNER,
      teamId: null,
      createdAt: now,
      deletedAt: null,
      ...item,
      updatedAt: now,
    }
  })
}
