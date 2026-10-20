import { useState } from 'react'
import { eventText, formatTime } from './history.js'
import EventRow from './EventRow.jsx'
import { restoreGoal } from './goalActions.js'
import { restoreNote } from './noteActions.js'
import { deletedEvent } from './history.js'

// How many history entries the History page shows.
const HISTORY_LIMIT = 100

function itemHref(item) {
  return item.list === 'notes' ? `#note/${item.id}` : `#goal/${item.id}`
}

// Everything that happened, newest first, across all goals and notes.
// "Edit" shows a ✕ on each entry; "Delete all history" asks first.
export function HistoryPage({ items, events, deleteEvents }) {
  const [editing, setEditing] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)
  const latest = [...events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, HISTORY_LIMIT)
  return (
    <div className="app">
      <div className="history-head">
        <h1>History</h1>
        {events.length > 0 && (
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setEditing(!editing)
              setConfirmAll(false)
            }}
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      {latest.length === 0 ? (
        <p className="empty">Nothing recorded yet.</p>
      ) : (
        <ol className="history-list">
          {latest.map(event => {
            const item = items.find(i => i.id === event.itemId)
            return (
              <EventRow
                key={event.id}
                event={event}
                editing={editing}
                onDelete={() => deleteEvents([event.id])}
              >
                {item && item.list !== 'categories' ? (
                  <a href={itemHref(item)} className="goal-link">
                    {event.title}
                  </a>
                ) : (
                  event.title
                )}
                : {eventText(event)}
              </EventRow>
            )
          })}
        </ol>
      )}
      {events.length > HISTORY_LIMIT && (
        <p className="goal-meta">Showing the latest {HISTORY_LIMIT} of {events.length}.</p>
      )}
      {editing &&
        (confirmAll ? (
          <div className="confirm-all">
            <p>Delete all {events.length} entries? This can't be undone. Counts like "ticked 3 times" and timer totals reset.</p>
            <div className="row">
              <button type="button" className="secondary" onClick={() => setConfirmAll(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  deleteEvents('all')
                  setConfirmAll(false)
                  setEditing(false)
                }}
              >
                Delete everything
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="link-button danger delete-all" onClick={() => setConfirmAll(true)}>
            Delete all history
          </button>
        ))}
    </div>
  )
}

// Deleted goals and notes in one place, each with Restore.
export function ArchivePage({ items, events, apply }) {
  const deleted = items
    .filter(item => item.deletedAt && (item.list === 'goals' || item.list === 'notes'))
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))

  function restore(item) {
    if (item.list === 'notes') apply(restoreNote(items, item.id))
    else apply(restoreGoal(items, item.id, deletedEvent(events, item.id)))
  }

  return (
    <div className="app">
      <h1>Archive</h1>
      <p className="goal-meta">Deleted goals and notes. Nothing here is erased.</p>
      {deleted.length === 0 ? (
        <p className="empty">Nothing deleted.</p>
      ) : (
        <ul>
          {deleted.map(item => (
            <li key={item.id}>
              <div className="goal-text">
                <a href={itemHref(item)} className="goal-title goal-link">
                  {item.list === 'notes' && <span className="short-id">{item.shortId}</span>}
                  {item.title}
                </a>
                <span className="goal-meta">
                  {item.list === 'notes' ? 'Note' : 'Goal'} · deleted {formatTime(item.deletedAt)}
                </span>
              </div>
              <button type="button" className="secondary restore-button" onClick={() => restore(item)}>
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Placeholder for sections that come later (Views, Settings).
export function ComingSoonPage({ title, text }) {
  return (
    <div className="app">
      <h1>{title}</h1>
      <p className="empty">{text}</p>
    </div>
  )
}
