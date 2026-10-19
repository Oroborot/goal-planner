import { useState } from 'react'
import NoteEditForm from './NoteEditForm.jsx'
import GoalHistory from './GoalHistory.jsx'
import { deleteNote, notesLinkingTo, restoreNote, saveNote, toggleNote } from './noteActions.js'
import { formatTime } from './history.js'
import { labelOf } from './timeframes.js'

// A link to a note or a goal, shown as "N3 Title" or "Title (Week goal)".
function ItemLink({ item }) {
  if (item.list === 'notes') {
    return (
      <a href={`#note/${item.id}`} className="goal-link">
        <span className="short-id">{item.shortId}</span>
        {item.title}
      </a>
    )
  }
  return (
    <a href={`#goal/${item.id}`} className="goal-link">
      {item.title} <span className="link-timeframe">({labelOf(item.timeframe)} goal)</span>
    </a>
  )
}

// The page for one note: its text, its links both ways, and its history.
function NotePage({ noteId, items, events, apply }) {
  const [editing, setEditing] = useState(false)
  const note = items.find(item => item.id === noteId && item.list === 'notes')

  if (!note) {
    return (
      <div className="app">
        <a href="#notes" className="back">
          ← Notes
        </a>
        <p className="empty">This note doesn't exist.</p>
      </div>
    )
  }

  // Links this note makes, and notes that link to it. Deleted ones are hidden.
  const linked = note.links
    .map(id => items.find(item => item.id === id && !item.deletedAt))
    .filter(Boolean)
  const linkedFrom = notesLinkingTo(items, note.id)

  return (
    <div className="app">
      <a href="#notes" className="back">
        ← Notes
      </a>
      <p className="goal-page-timeframe">
        <span className="short-id">{note.shortId}</span>
        {note.isTask ? 'Task' : 'Note'}
        {note.deletedAt && ` · deleted ${formatTime(note.deletedAt)}`}
      </p>

      {editing ? (
        <NoteEditForm
          note={note}
          items={items}
          onSave={changes => {
            apply(saveNote(items, note.id, changes))
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <h1>{note.title}</h1>
          {note.isTask && !note.deletedAt && (
            <label className="done-toggle">
              <input
                type="checkbox"
                checked={note.done}
                onChange={() => apply(toggleNote(items, note.id))}
                aria-label={`Mark "${note.title}" as done`}
              />
              <span>Done</span>
            </label>
          )}
          {note.body && <p className="note-body">{note.body}</p>}

          {note.deletedAt ? (
            <button
              type="button"
              className="secondary restore-page-button"
              onClick={() => apply(restoreNote(items, note.id))}
            >
              Restore this note
            </button>
          ) : (
            <div className="row page-actions">
              <button type="button" className="secondary" onClick={() => setEditing(true)}>
                ✎ Edit
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => apply(deleteNote(items, note.id))}
              >
                ✕ Delete
              </button>
            </div>
          )}
        </>
      )}

      <h2>Links</h2>
      {linked.length === 0 ? (
        <p className="empty">No links yet. Use ✎ to link notes or goals.</p>
      ) : (
        <ul className="plain-links">
          {linked.map(item => (
            <li key={item.id}>
              <ItemLink item={item} />
            </li>
          ))}
        </ul>
      )}

      {linkedFrom.length > 0 && (
        <>
          <h2>Linked from</h2>
          <ul className="plain-links">
            {linkedFrom.map(item => (
              <li key={item.id}>
                <ItemLink item={item} />
              </li>
            ))}
          </ul>
        </>
      )}

      <GoalHistory goalId={note.id} events={events} />
    </div>
  )
}

export default NotePage
