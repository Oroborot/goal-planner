import { useState } from 'react'
import GoalEditForm from './GoalEditForm.jsx'
import AddSmallerGoalForm from './AddSmallerGoalForm.jsx'
import ProgressBar from './ProgressBar.jsx'
import { labelOf, sizeOf } from './timeframes.js'
import { activeGoals, childrenOf, progressOf, percent } from './progress.js'
import { addGoal, saveGoal, toggleGoal } from './goalActions.js'
import { deletedEvent, formatTime } from './history.js'
import GoalHistory from './GoalHistory.jsx'

// One row in the "smaller goals" or "counts toward" lists: a link to that
// goal's page, its timeframe and how far along it is.
function LinkedGoal({ goal, goals, onToggle }) {
  const progress = progressOf(goals, goal)
  return (
    <li className={goal.done ? 'done' : ''}>
      {onToggle && (
        <input
          type="checkbox"
          checked={goal.done}
          onChange={onToggle}
          aria-label={`Mark "${goal.title}" as done`}
        />
      )}
      <div className="goal-text">
        <a href={`#goal/${goal.id}`} className="goal-title goal-link">
          {goal.title}
        </a>
        <span className="goal-meta">
          {labelOf(goal.timeframe)} · {percent(progress)}%
        </span>
        <ProgressBar progress={progress} />
      </div>
    </li>
  )
}

// The page for one goal: its progress, the smaller goals under it and the
// bigger goals it counts toward. This is where goals are tracked.
// `apply` saves a change and records it in the history log; `events` is the
// history log itself.
function GoalPage({ goalId, items, events, apply }) {
  // 'edit' while the ✎ form is open, 'add' while the ＋ form is open.
  const [mode, setMode] = useState(null)

  const goals = activeGoals(items)
  const goal = goals.find(g => g.id === goalId)

  // A deleted goal is hidden everywhere, but its page still shows its history.
  if (!goal) {
    const deleted = items.find(item => item.id === goalId && item.deletedAt)
    const entry = deleted && deletedEvent(events, goalId)
    return (
      <div className="app">
        <a href="#goals" className="back">
          ← Goals
        </a>
        {deleted ? (
          <>
            <p className="goal-page-timeframe">{labelOf(deleted.timeframe)} goal · deleted</p>
            <h1>{deleted.title}</h1>
            {deleted.why && <p className="goal-page-why">Why: {deleted.why}</p>}
            <section className="goal-page-progress">
              {entry?.progress !== undefined && (
                <>
                  <ProgressBar progress={entry.progress / 100} size="large" />
                  <p>
                    Progress when deleted: {entry.progress}%
                    {entry.wasDone && ' (it was done)'}
                  </p>
                </>
              )}
              <p className="goal-meta">Deleted on {formatTime(deleted.deletedAt)}.</p>
            </section>
            <GoalHistory goalId={goalId} events={events} />
          </>
        ) : (
          <p className="empty">This goal doesn't exist.</p>
        )}
      </div>
    )
  }

  const progress = progressOf(goals, goal)
  const children = childrenOf(goals, goal.id).sort(
    (a, b) => sizeOf(b.timeframe) - sizeOf(a.timeframe),
  )
  const doneCount = children.filter(child => child.done).length
  const parents = goal.parentIds.map(id => goals.find(g => g.id === id)).filter(Boolean)

  // The line under the progress bar.
  const childSummary = `${doneCount} of ${children.length} smaller goals done`
  let summary
  if (goal.done && goal.completedBy === 'hand') {
    summary = children.length > 0 ? `Done, ticked by hand (${childSummary})` : 'Done'
  } else if (goal.done) {
    summary = 'Done: completed automatically, everything under it is done'
  } else if (children.length > 0) {
    summary = `${childSummary} · ${percent(progress)}%`
  } else {
    summary = 'Not done yet'
  }

  return (
    <div className="app">
      <a href="#goals" className="back">
        ← Goals
      </a>
      <p className="goal-page-timeframe">{labelOf(goal.timeframe)} goal</p>
      <h1>{goal.title}</h1>
      {goal.why && <p className="goal-page-why">Why: {goal.why}</p>}

      <section className="goal-page-progress">
        <ProgressBar progress={progress} size="large" />
        <p>{summary}</p>
        <label className="done-toggle">
          <input
            type="checkbox"
            checked={goal.done}
            onChange={() => apply(toggleGoal(items, goal.id))}
            aria-label={`Mark "${goal.title}" as done`}
          />
          <span>Done</span>
        </label>
      </section>

      {mode === 'edit' ? (
        <GoalEditForm
          goal={goal}
          goals={goals}
          onSave={(changes, childIds) => {
            apply(saveGoal(items, goal.id, changes, childIds))
            setMode(null)
          }}
          onCancel={() => setMode(null)}
        />
      ) : mode === 'add' ? (
        <AddSmallerGoalForm
          parent={goal}
          onAdd={(title, timeframe) => {
            apply(addGoal(items, title, timeframe, [goal.id]))
            setMode(null)
          }}
          onCancel={() => setMode(null)}
        />
      ) : (
        <div className="row page-actions">
          <button type="button" className="secondary" onClick={() => setMode('edit')}>
            ✎ Edit
          </button>
          {goal.timeframe !== 'day' && (
            <button type="button" className="secondary" onClick={() => setMode('add')}>
              ＋ Smaller goal
            </button>
          )}
        </div>
      )}

      <h2>Smaller goals under this</h2>
      {children.length === 0 ? (
        <p className="empty">
          {goal.timeframe === 'day'
            ? 'Day goals are the smallest.'
            : 'Nothing under this yet. Use ＋ to add one.'}
        </p>
      ) : (
        <ul>
          {children.map(child => (
            <LinkedGoal
              key={child.id}
              goal={child}
              goals={goals}
              onToggle={() => apply(toggleGoal(items, child.id))}
            />
          ))}
        </ul>
      )}

      <h2>Counts toward</h2>
      {parents.length === 0 ? (
        <p className="empty">Not linked to a bigger goal yet. Use ✎ to link it.</p>
      ) : (
        <ul>
          {parents.map(parent => (
            <LinkedGoal key={parent.id} goal={parent} goals={goals} />
          ))}
        </ul>
      )}

      <GoalHistory goalId={goal.id} events={events} />
    </div>
  )
}

export default GoalPage
