import { labelOf } from './timeframes.js'
import { deletedEvent, formatTime, tickCount } from './history.js'
import { restoreGoal } from './goalActions.js'

// The folded "Deleted goals" section at the bottom of the goals list.
// Deleted goals are kept (all data is good data); this is where you find
// them again. Tap a title to see that goal's page and full history.
function DeletedGoals({ items, events, apply }) {
  const deleted = items
    .filter(item => item.list === 'goals' && item.deletedAt)
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))

  if (deleted.length === 0) return null

  return (
    <details className="deleted-goals">
      <summary>Deleted goals ({deleted.length})</summary>
      <ul>
        {deleted.map(goal => {
          const entry = deletedEvent(events, goal.id)
          const ticks = tickCount(events, goal.id)
          return (
            <li key={goal.id}>
              <div className="goal-text">
                <a href={`#goal/${goal.id}`} className="goal-title goal-link">
                  {goal.title}
                </a>
                <span className="goal-meta">
                  {labelOf(goal.timeframe)} · deleted {formatTime(goal.deletedAt)}
                </span>
                <span className="goal-meta">
                  {entry?.progress !== undefined && `${entry.progress}% when deleted · `}
                  ticked {ticks === 1 ? '1 time' : `${ticks} times`}
                </span>
              </div>
              <button
                type="button"
                className="secondary restore-button"
                onClick={() => apply(restoreGoal(items, goal.id, entry))}
                aria-label={`Restore "${goal.title}"`}
              >
                Restore
              </button>
            </li>
          )
        })}
      </ul>
    </details>
  )
}

export default DeletedGoals
