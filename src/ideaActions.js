// Ideas: the thought map of clouds (the Ideas tab).
// An idea looks like:
// { id, list: 'ideas', title, how, parentId, color, createdAt, deletedAt }
// - how:      free text under the title (notes, "how it works"), optional
// - parentId: the idea it sits inside, or null for a main idea
// - color:    'purple' or 'green', only set on main ideas; the clouds
//             inside take their color from it
// A note and a sub-idea are the same thing: an idea with nothing inside yet.
// Moving a whole branch later = changing one parentId.
//
// Like goalActions.js, each function returns { items, events } for `apply`.
import { makeEvent } from './history.js'

const COLORS = ['purple', 'green']

// Every idea that isn't deleted.
export function activeIdeas(items) {
  return items.filter(item => item.list === 'ideas' && !item.deletedAt)
}

// The main ideas (the clouds on the overview), oldest first.
export function mainIdeas(items) {
  return activeIdeas(items).filter(idea => !idea.parentId)
}

// The ideas sitting directly inside one idea, oldest first.
export function childIdeas(items, id) {
  return activeIdeas(items).filter(idea => idea.parentId === id)
}

// The way from the main idea down to this one, e.g.
// [Crafting system, Recipes, Ingredients]. Empty if the idea (or any idea
// it sits in) is deleted or missing.
export function ideaPath(items, id) {
  const ideas = activeIdeas(items)
  const path = []
  let current = ideas.find(idea => idea.id === id)
  // The length check stops an endless loop if ideas ever point at each other.
  while (current && path.length < 50) {
    path.unshift(current)
    if (!current.parentId) return path
    current = ideas.find(idea => idea.id === current.parentId)
  }
  return []
}

// How many ideas sit inside this one, at every level.
export function countInside(items, id) {
  return childIdeas(items, id).reduce((sum, child) => sum + 1 + countInside(items, child.id), 0)
}

// Add an idea. Leave out `parentId` for a main idea.
export function addIdea(items, title, parentId = null) {
  // Main ideas take turns being purple and green.
  const mainsEver = items.filter(item => item.list === 'ideas' && !item.parentId).length
  const idea = {
    id: crypto.randomUUID(),
    list: 'ideas',
    title,
    parentId,
    color: parentId ? null : COLORS[mainsEver % COLORS.length],
    createdAt: new Date().toISOString(),
    deletedAt: null,
  }
  return { items: [...items, idea], events: [makeEvent('created', idea)] }
}

export function renameIdea(items, id, title) {
  const before = items.find(item => item.id === id)
  const after = { ...before, title }
  return {
    items: items.map(item => (item.id === id ? after : item)),
    events: [makeEvent('edited', after, { fields: ['title'] })],
  }
}

// Save the free text under an idea's title ("how it works", pasted notes).
// No length limit. Does nothing if the text didn't change.
export function setIdeaText(items, id, how) {
  const before = items.find(item => item.id === id)
  if (!before || (before.how ?? '') === how) return { items, events: [] }
  const after = { ...before, how }
  return {
    items: items.map(item => (item.id === id ? after : item)),
    events: [makeEvent('edited', after, { fields: ['text'] })],
  }
}

// Delete an idea (hidden, not erased). Only this one idea is marked; the
// ideas inside it can't be reached any more, so they disappear with it and
// would all come back if it's restored.
export function deleteIdea(items, id) {
  const idea = items.find(item => item.id === id)
  const now = new Date().toISOString()
  return {
    items: items.map(item => (item.id === id ? { ...item, deletedAt: now } : item)),
    events: [makeEvent('deleted', idea, { inside: countInside(items, id) })],
  }
}
