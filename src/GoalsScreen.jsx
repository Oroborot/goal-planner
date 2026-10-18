import { Fragment, useState } from 'react'
import GoalEditForm from './GoalEditForm.jsx'
import AddSmallerGoalForm from './AddSmallerGoalForm.jsx'
import ProgressBar from './ProgressBar.jsx'
import DeletedGoals from './DeletedGoals.jsx'
import { TIMEFRAMES, labelOf, biggerGoals } from './timeframes.js'
import { activeGoals, childrenOf, progressOf, percent } from './progress.js'
import { addGoal, deleteGoal, saveGoal, toggleGoal } from './goalActions.js'

// The goals list: timeframe tabs, the add form and the goals. This is where
// goals are created; tap a goal's title to open its page and track it.
// `items` comes from App; every change is handed to `apply`, which saves the
// goals and records the change in the history log.
// `timeframe` (the selected tab) also comes from App, so it's remembered.
function GoalsScreen({ items, events, apply, timeframe, setTimeframe }) {
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  // The id of the bigger goal the new goal belongs to ('' means none).
  // More parents can be added later with the ✎ button.
  const [parentId, setParentId] = useState('')
  // The goal being edited (✎), and the goal getting a new smaller goal (＋).
  // Only one of these is open at a time; null means none.
  const [editingId, setEditingId] = useState(null)
  const [addingUnderId, setAddingUnderId] = useState(null)

  const goals = activeGoals(items)
  const visibleGoals = goals.filter(goal => goal.timeframe === timeframe)

  // A goal can only belong to a goal with a bigger timeframe,
  // e.g. a Day goal can link to a Week, Month or Year goal.
  const parentOptions = biggerGoals(goals, timeframe)

  function countFor(value) {
    return goals.filter(goal => goal.timeframe === value).length
  }

  function parentTitles(goal) {
    return goal.parentIds
      .map(id => goals.find(g => g.id === id)?.title)
      .filter(Boolean)
      .join(' · ')
  }

  // Switching timeframe clears the chosen parent, because the list of
  // allowed parents changes with the timeframe.
  function changeTimeframe(value) {
    setTimeframe(value)
    setParentId('')
  }

  function openEdit(id) {
    setAddingUnderId(null)
    setEditingId(id)
  }

  function openAddUnder(id) {
    setEditingId(null)
    setAddingUnderId(id)
  }

  function submitNewGoal(e) {
    e.preventDefault()
    if (!title.trim()) return
    apply(addGoal(items, title.trim(), timeframe, parentId ? [parentId] : [], why.trim()))
    setTitle('')
    setWhy('')
    setParentId('')
  }

  // The ＋ button: a new smaller goal, already linked under `parentGoalId`.
  function addSmallerGoal(parentGoalId, newTitle, newTimeframe) {
    apply(addGoal(items, newTitle, newTimeframe, [parentGoalId]))
    setAddingUnderId(null)
  }

  // Save the changes from the edit form.
  // If its timeframe changed, switch to that tab so you can still see it.
  function saveEdits(id, changes, childIds) {
    apply(saveGoal(items, id, changes, childIds))
    setEditingId(null)
    if (changes.timeframe !== timeframe) changeTimeframe(changes.timeframe)
  }

  return (
    <div className="app">
      <a href="#" className="back">
        ← Home
      </a>
      <h1>Goals</h1>

      <div className="tabs">
        {TIMEFRAMES.map(t => (
          <button
            key={t.value}
            type="button"
            className={t.value === timeframe ? 'tab active' : 'tab'}
            aria-pressed={t.value === timeframe}
            onClick={() => changeTimeframe(t.value)}
          >
            {t.label} <span className="count">{countFor(t.value)}</span>
          </button>
        ))}
      </div>

      <form className="goal-form" onSubmit={submitNewGoal}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's your goal?"
          aria-label="Goal"
        />
        <div className="row">
          <select
            value={timeframe}
            onChange={e => changeTimeframe(e.target.value)}
            aria-label="Timeframe"
          >
            {TIMEFRAMES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            aria-label="Parent goal"
            disabled={parentOptions.length === 0}
          >
            <option value="">No parent goal</option>
            {parentOptions.map(goal => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({labelOf(goal.timeframe)})
              </option>
            ))}
          </select>
        </div>
        <input
          value={why}
          onChange={e => setWhy(e.target.value)}
          placeholder="Why does this matter to you? (optional)"
          aria-label="Why"
        />
        <button type="submit">Add</button>
      </form>

      {visibleGoals.length === 0 ? (
        <p className="empty">No {labelOf(timeframe).toLowerCase()} goals yet.</p>
      ) : (
        <ul>
          {visibleGoals.map(goal => {
            if (goal.id === editingId) {
              return (
                <li key={goal.id} className="editing">
                  <GoalEditForm
                    goal={goal}
                    goals={goals}
                    onSave={(changes, childIds) => saveEdits(goal.id, changes, childIds)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              )
            }
            const parents = parentTitles(goal)
            const children = childrenOf(goals, goal.id).length
            const progress = progressOf(goals, goal)
            return (
              <Fragment key={goal.id}>
                <li className={goal.done ? 'done' : ''}>
                  <input
                    type="checkbox"
                    checked={goal.done}
                    onChange={() => apply(toggleGoal(items, goal.id))}
                    aria-label={`Mark "${goal.title}" as done`}
                  />
                  <div className="goal-text">
                    <a href={`#goal/${goal.id}`} className="goal-title goal-link">
                      {goal.title}
                    </a>
                    {parents && <span className="goal-parent">↳ {parents}</span>}
                    {children > 0 && (
                      <>
                        <span className="goal-children">
                          {children} smaller goal{children === 1 ? '' : 's'} ·{' '}
                          {percent(progress)}%
                        </span>
                        <ProgressBar progress={progress} />
                      </>
                    )}
                    {goal.why && <span className="goal-why">Why: {goal.why}</span>}
                  </div>
                  {goal.timeframe !== 'day' && (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => openAddUnder(goal.id)}
                      aria-label={`Add a smaller goal under "${goal.title}"`}
                    >
                      ＋
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => openEdit(goal.id)}
                    aria-label={`Edit "${goal.title}"`}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => apply(deleteGoal(items, goal.id))}
                    aria-label={`Delete "${goal.title}"`}
                  >
                    ✕
                  </button>
                </li>
                {goal.id === addingUnderId && (
                  <li className="editing">
                    <AddSmallerGoalForm
                      parent={goal}
                      onAdd={(newTitle, newTimeframe) =>
                        addSmallerGoal(goal.id, newTitle, newTimeframe)
                      }
                      onCancel={() => setAddingUnderId(null)}
                    />
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>
      )}

      <DeletedGoals items={items} events={events} />
    </div>
  )
}

export default GoalsScreen
