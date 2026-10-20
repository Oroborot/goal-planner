import { useState } from 'react'
import { activeNotes, addNote, restoreNote, toggleNote } from './noteActions.js'
import { formatTime } from './history.js'
import {
  activeCategories,
  categoryAndSubs,
  categoryPath,
  categoryTree,
} from './categoryActions.js'
import CategorySelect from './CategorySelect.jsx'
import ManageCategories from './ManageCategories.jsx'
import BackLink from './BackLink.jsx'
import { activeGoals } from './progress.js'
import { colorOf } from './colors.js'
import { labelOf } from './timeframes.js'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'notes', label: 'Notes' },
  { value: 'goals', label: 'Goals' },
]

// The first line of a note's text, as a short preview.
function preview(body) {
  const firstLine = body.split('\n').find(line => line.trim()) ?? ''
  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine
}

// The notes list: quick add, search, filter, and every note as a card.
// Tap a note's title to open it, edit it and link it.
function NotesScreen({ items, apply }) {
  const [title, setTitle] = useState('')
  const [isTask, setIsTask] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  // The selected category chip (null = all). Also the default category for
  // new notes, so a note added while viewing "Ideas" lands in Ideas.
  const [categoryId, setCategoryId] = useState(null)
  const [newCategoryId, setNewCategoryId] = useState(null)
  // The add form is folded until you tap "＋ Add a note".
  const [showAdd, setShowAdd] = useState(false)

  const categories = activeCategories(items)
  const selected = categories.find(c => c.id === categoryId)
  // The main category of the selection, to show its sub-categories.
  const mainId = selected ? (selected.parentId ?? selected.id) : null
  const mains = categoryTree(items).filter(entry => entry.depth === 0).map(entry => entry.category)
  const subs = categories.filter(c => mainId && c.parentId === mainId)
  // Only filter by a category that still exists (it may have been deleted).
  const inCategory = selected ? categoryAndSubs(items, selected.id) : null

  function pickCategory(id) {
    setCategoryId(id)
    setNewCategoryId(id)
  }

  const notes = activeNotes(items)
  const query = search.trim().toLowerCase()
  const visible = notes
    .filter(note => !inCategory || inCategory.includes(note.categoryId))
    .filter(note => filter === 'all' || (filter === 'tasks') === note.isTask)
    .filter(
      note =>
        !query ||
        `${note.shortId} ${note.title} ${note.body}`.toLowerCase().includes(query),
    )
    // Open tasks first, then newest changes first.
    .sort((a, b) => {
      const openA = a.isTask && !a.done
      const openB = b.isTask && !b.done
      if (openA !== openB) return openA ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  const deleted = items.filter(item => item.list === 'notes' && item.deletedAt)
  // The Goals chip: search your goals here too (title and "why").
  const goalsFound = activeGoals(items).filter(
    g => !query || `${g.title} ${g.why}`.toLowerCase().includes(query),
  )

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    apply(addNote(items, title.trim(), isTask, newCategoryId))
    setTitle('')
  }

  return (
    <div className="app">
      <BackLink fallback="#" />
      <h1>Notes</h1>

      {!showAdd ? (
        <button type="button" className="secondary add-toggle" onClick={() => setShowAdd(true)}>
          ＋ Add a note
        </button>
      ) : (
      <form className="goal-form" onSubmit={submit}>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Write a note or a task…"
          aria-label="New note"
        />
        {categories.length > 0 && (
          <CategorySelect items={items} value={newCategoryId} onChange={setNewCategoryId} />
        )}
        <div className="row">
          <label className="done-toggle task-toggle">
            <input
              type="checkbox"
              checked={isTask}
              onChange={e => setIsTask(e.target.checked)}
              aria-label="It's a task"
            />
            <span>It's a task (has a tick box)</span>
          </label>
        </div>
        <div className="row">
          <button type="button" className="secondary" onClick={() => setShowAdd(false)}>
            Close
          </button>
          <button type="submit">Add</button>
        </div>
      </form>
      )}

      <input
        className="search"
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search notes, or an id like N3"
        aria-label="Search notes"
      />
      {mains.length > 0 && (
        <div className="chips" aria-label="Categories">
          <button
            type="button"
            className={!selected ? 'chip active' : 'chip'}
            onClick={() => pickCategory(null)}
          >
            All
          </button>
          {mains.map(c => (
            <button
              key={c.id}
              type="button"
              className={mainId === c.id ? 'chip active' : 'chip'}
              onClick={() => pickCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      {subs.length > 0 && (
        <div className="chips sub-chips" aria-label="Sub-categories">
          {subs.map(c => (
            <button
              key={c.id}
              type="button"
              className={categoryId === c.id ? 'chip active' : 'chip'}
              onClick={() => pickCategory(categoryId === c.id ? mainId : c.id)}
            >
              └ {c.name}
            </button>
          ))}
        </div>
      )}
      <div className="tabs">
        {FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            className={f.value === filter ? 'tab active' : 'tab'}
            aria-pressed={f.value === filter}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === 'goals' ? (
        goalsFound.length === 0 ? (
          <p className="empty">No goals match.</p>
        ) : (
          <ul>
            {goalsFound.map(goal => (
              <li key={goal.id}>
                <div className="goal-text">
                  <a href={`#goal/${goal.id}`} className="goal-title goal-link">
                    <span className="goal-dot" style={{ background: colorOf(activeGoals(items), goal) }} />
                    {goal.title}
                  </a>
                  <span className="goal-meta">
                    {labelOf(goal.timeframe)} goal{goal.why && ` · ${goal.why}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : visible.length === 0 ? (
        <p className="empty">{notes.length === 0 ? 'No notes yet.' : 'Nothing matches.'}</p>
      ) : (
        <ul>
          {visible.map(note => (
            <li key={note.id} className={note.done ? 'done' : ''}>
              {note.isTask && (
                <input
                  type="checkbox"
                  checked={note.done}
                  onChange={() => apply(toggleNote(items, note.id))}
                  aria-label={`Mark "${note.title}" as done`}
                />
              )}
              <div className="goal-text">
                <span>
                  <span className="short-id">{note.shortId}</span>
                  <a href={`#note/${note.id}`} className="goal-title goal-link">
                    {note.title}
                  </a>
                </span>
                {note.categoryId && categoryPath(items, note.categoryId) && (
                  <span className="goal-meta">🏷 {categoryPath(items, note.categoryId)}</span>
                )}
                {note.body && <span className="goal-why">{preview(note.body)}</span>}
                {note.links.length > 0 && (
                  <span className="goal-children">
                    🔗 {note.links.length} link{note.links.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ManageCategories items={items} apply={apply} />

      {deleted.length > 0 && (
        <details className="deleted-goals">
          <summary>Deleted notes ({deleted.length})</summary>
          <ul>
            {deleted.map(note => (
              <li key={note.id}>
                <div className="goal-text">
                  <span>
                    <span className="short-id">{note.shortId}</span>
                    <a href={`#note/${note.id}`} className="goal-title goal-link">
                      {note.title}
                    </a>
                  </span>
                  <span className="goal-meta">deleted {formatTime(note.deletedAt)}</span>
                </div>
                <button
                  type="button"
                  className="secondary restore-button"
                  onClick={() => apply(restoreNote(items, note.id))}
                  aria-label={`Restore "${note.title}"`}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

export default NotesScreen
