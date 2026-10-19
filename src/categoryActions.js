// Note categories ("archetypes"): main categories like Ideas, Thoughts,
// Reminders, and sub-categories under them like Ideas › App ideas.
// A category looks like:
// { id, list: 'categories', name, parentId, createdAt, deletedAt }
// - parentId: the main category it sits under, or null for a main one
// A note points to one category with `categoryId` (or null).
//
// Like goalActions.js, each function returns { items, events } for `apply`.
import { makeEvent } from './history.js'

export const STARTER_CATEGORIES = ['Ideas', 'Thoughts', 'Reminders']

export function activeCategories(items) {
  return items.filter(item => item.list === 'categories' && !item.deletedAt)
}

// Main categories, each followed by its sub-categories, sorted by name.
// Each entry: { category, depth } where depth 0 = main, 1 = sub.
export function categoryTree(items) {
  const all = activeCategories(items)
  const byName = (a, b) => a.name.localeCompare(b.name)
  return all
    .filter(c => !c.parentId || !all.some(p => p.id === c.parentId))
    .sort(byName)
    .flatMap(main => [
      { category: main, depth: 0 },
      ...all
        .filter(c => c.parentId === main.id)
        .sort(byName)
        .map(sub => ({ category: sub, depth: 1 })),
    ])
}

// "Ideas › App ideas" for a sub-category, "Ideas" for a main one.
export function categoryPath(items, id) {
  const category = activeCategories(items).find(c => c.id === id)
  if (!category) return ''
  const parent = activeCategories(items).find(c => c.id === category.parentId)
  return parent ? `${parent.name} › ${category.name}` : category.name
}

// A category and everything under it, for filtering notes.
export function categoryAndSubs(items, id) {
  return [id, ...activeCategories(items).filter(c => c.parentId === id).map(c => c.id)]
}

function makeCategory(name, parentId) {
  return {
    id: crypto.randomUUID(),
    list: 'categories',
    title: name,
    name,
    parentId,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  }
}

export function addCategory(items, name, parentId = null) {
  const category = makeCategory(name, parentId)
  return { items: [...items, category], events: [makeEvent('created', category)] }
}

export function addStarterCategories(items) {
  const existing = activeCategories(items).map(c => c.name.toLowerCase())
  const added = STARTER_CATEGORIES.filter(name => !existing.includes(name.toLowerCase())).map(
    name => makeCategory(name, null),
  )
  return {
    items: [...items, ...added],
    events: added.map(category => makeEvent('created', category)),
  }
}

export function renameCategory(items, id, name) {
  const before = items.find(item => item.id === id)
  const after = { ...before, name, title: name }
  return {
    items: items.map(item => (item.id === id ? after : item)),
    events: [makeEvent('edited', after, { fields: ['name'] })],
  }
}

// Delete a category (hidden, not erased). Its sub-categories move up to
// become main categories, and its notes keep their text but lose the
// category.
export function deleteCategory(items, id) {
  const category = items.find(item => item.id === id)
  const now = new Date().toISOString()
  return {
    items: items.map(item => {
      if (item.id === id) return { ...item, deletedAt: now }
      if (item.list === 'categories' && item.parentId === id) return { ...item, parentId: null }
      if (item.list === 'notes' && item.categoryId === id) return { ...item, categoryId: null }
      return item
    }),
    events: [makeEvent('deleted', category)],
  }
}
