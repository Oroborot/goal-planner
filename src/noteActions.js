// Notes: quick tasks, lists (like good restaurants), anything to remember.
// A note looks like:
// { id, shortId, list: 'notes', title, body, isTask, done, completedAt,
//   createdAt, updatedAt, links, deletedAt }
// - shortId: a small id like "N12", easy to read and refer to
// - links:   ids of other notes or goals this note is linked to
//
// Like goalActions.js, each function returns { items, events } for `apply`.
import { makeEvent } from './history.js'

// The notes in use; deleted notes are kept but hidden.
export function activeNotes(items) {
  return items.filter(item => item.list === 'notes' && !item.deletedAt)
}

// The next small id: one more than the highest so far (deleted notes count
// too, so an id is never reused).
function nextShortId(items) {
  const numbers = items
    .filter(item => item.list === 'notes')
    .map(item => Number(item.shortId.slice(1)))
  return `N${numbers.length === 0 ? 1 : Math.max(...numbers) + 1}`
}

function titleOf(items, id) {
  const item = items.find(i => i.id === id)
  if (!item) return ''
  return item.list === 'notes' ? `${item.shortId} ${item.title}` : item.title
}

export function addNote(items, title, isTask) {
  const now = new Date().toISOString()
  const note = {
    id: crypto.randomUUID(),
    shortId: nextShortId(items),
    list: 'notes',
    title,
    body: '',
    isTask,
    done: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    links: [],
    deletedAt: null,
  }
  return { items: [...items, note], events: [makeEvent('created', note, { shortId: note.shortId })] }
}

export function toggleNote(items, id) {
  const note = items.find(item => item.id === id)
  const now = new Date().toISOString()
  return {
    items: items.map(item =>
      item.id === id
        ? { ...item, done: !item.done, completedAt: item.done ? null : now, updatedAt: now }
        : item,
    ),
    events: [makeEvent(note.done ? 'unticked' : 'ticked', note)],
  }
}

// Save changes from the note's edit form, including its links.
export function saveNote(items, id, changes) {
  const before = items.find(item => item.id === id)
  const after = { ...before, ...changes, updatedAt: new Date().toISOString() }
  // A note that stops being a task can't stay ticked.
  if (!after.isTask) Object.assign(after, { done: false, completedAt: null })
  const events = []

  const fields = ['title', 'body', 'isTask'].filter(field => before[field] !== after[field])
  if (fields.length > 0) events.push(makeEvent('edited', after, { fields }))
  for (const linkId of after.links.filter(l => !before.links.includes(l))) {
    events.push(makeEvent('note-linked', after, { linkId, linkTitle: titleOf(items, linkId) }))
  }
  for (const linkId of before.links.filter(l => !after.links.includes(l))) {
    events.push(makeEvent('note-unlinked', after, { linkId, linkTitle: titleOf(items, linkId) }))
  }

  return { items: items.map(item => (item.id === id ? after : item)), events }
}

// Deleted notes are hidden, not erased; their links are kept so a restore
// brings everything back.
export function deleteNote(items, id) {
  const note = items.find(item => item.id === id)
  return {
    items: items.map(item =>
      item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item,
    ),
    events: [makeEvent('deleted', note)],
  }
}

export function restoreNote(items, id) {
  const note = items.find(item => item.id === id)
  return {
    items: items.map(item => (item.id === id ? { ...item, deletedAt: null } : item)),
    events: [makeEvent('restored', note)],
  }
}

// Notes that link to `id` (a note or a goal): the other direction of links.
export function notesLinkingTo(items, id) {
  return activeNotes(items).filter(note => note.links.includes(id))
}
