import { useState } from 'react'
import { formatTime } from './history.js'

// One history entry: time on the left, what happened on the right.
// In edit mode a small ✕ appears; tapping it asks "Delete? Yes / No"
// right in the row before anything is removed.
function EventRow({ event, editing, onDelete, children }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className={confirming ? 'confirming' : ''}>
      <time dateTime={event.at}>{formatTime(event.at)}</time>
      {confirming ? (
        <span className="row-confirm">
          Delete this entry?
          <button type="button" className="link-button danger" onClick={onDelete}>
            Yes
          </button>
          <button type="button" className="link-button" onClick={() => setConfirming(false)}>
            No
          </button>
        </span>
      ) : (
        <span>{children}</span>
      )}
      {editing && !confirming && (
        <button
          type="button"
          className="entry-delete"
          onClick={() => setConfirming(true)}
          aria-label="Delete this entry"
        >
          ✕
        </button>
      )}
    </li>
  )
}

export default EventRow
