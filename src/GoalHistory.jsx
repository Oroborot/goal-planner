import { useState } from 'react'
import { childEventText, eventText, formatTime } from './history.js'

// How many entries to show before "Show all".
const SHORT_LIST = 10

function countOf(events, type) {
  return events.filter(e => e.type === type).length
}

function times(n) {
  return n === 1 ? '1 time' : `${n} times`
}

// The "History" section on a goal page: a few counts, then the diary of
// everything that happened to this goal, newest first. It also shows smaller
// goals being linked under it or unlinked from it.
function GoalHistory({ goalId, events }) {
  const [showAll, setShowAll] = useState(false)

  const own = events.filter(e => e.itemId === goalId)
  const fromChildren = events.filter(
    e => e.parentId === goalId && e.itemId !== goalId && (e.type === 'linked' || e.type === 'unlinked'),
  )
  const entries = [
    ...own.map(e => ({ event: e, text: eventText(e) })),
    ...fromChildren.map(e => ({ event: e, text: childEventText(e) })),
  ].sort((a, b) => b.event.at.localeCompare(a.event.at))
  const shown = showAll ? entries : entries.slice(0, SHORT_LIST)

  const ticked = countOf(own, 'ticked')
  const unticked = countOf(own, 'unticked')
  const auto = countOf(own, 'auto-completed')

  return (
    <section className="history">
      <h2>History</h2>
      <p className="goal-meta">
        Ticked {times(ticked)} · Unticked {times(unticked)}
        {auto > 0 && ` · Completed automatically ${times(auto)}`}
      </p>
      {entries.length === 0 ? (
        <p className="empty">Nothing recorded yet.</p>
      ) : (
        <ol className="history-list">
          {shown.map(({ event, text }) => (
            <li key={event.id}>
              <time dateTime={event.at}>{formatTime(event.at)}</time>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      )}
      {entries.length > SHORT_LIST && (
        <button type="button" className="secondary" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show less' : `Show all (${entries.length})`}
        </button>
      )}
    </section>
  )
}

export default GoalHistory
