import { Fragment, useState } from 'react'
import GoalEditForm from './GoalEditForm.jsx'
import AddSmallerGoalForm from './AddSmallerGoalForm.jsx'
import { TIMEFRAMES, labelOf, biggerGoals } from './timeframes.js'

// A new goal with all its fields filled in.
function makeGoal(title, timeframe, parentIds, why = '') {
  return {
    id: crypto.randomUUID(),
    title,
    list: 'goals',
    timeframe,
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    parentIds,
    why,
  }
}

// The goals screen: timeframe tabs, the add form and the goal list.
// `items` and `setItems` come from App, which loads and saves them.
function GoalsScreen({ items, setItems }) {
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  // The id of the bigger goal the new goal belongs to ('' means none).
  // More parents can be added later with the ✎ button.
  const [parentId, setParentId] = useState('')
  // The selected timeframe: drives both the tabs and the add-form dropdown.
  const [timeframe, setTimeframe] = useState('day')
  // The goal being edited (✎), and the goal getting a new smaller goal (＋).
  // Only one of these is open at a time; null means none.
  const [editingId, setEditingId] = useState(null)
  const [addingUnderId, setAddingUnderId] = useState(null)

  const goals = items.filter(item => item.list === 'goals')
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

  function childCount(goal) {
    return goals.filter(g => g.parentIds.includes(goal.id)).length
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

  function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return
    setItems([...items, makeGoal(title.trim(), timeframe, parentId ? [parentId] : [], why.trim())])
    setTitle('')
    setWhy('')
    setParentId('')
  }

  // The ＋ button: a new smaller goal, already linked under `parentGoalId`.
  function addSmallerGoal(parentGoalId, newTitle, newTimeframe) {
    setItems([...items, makeGoal(newTitle, newTimeframe, [parentGoalId])])
    setAddingUnderId(null)
  }

  function toggleGoal(id) {
    setItems(
      items.map(item =>
        item.id === id
          ? {
              ...item,
              done: !item.done,
              completedAt: item.done ? null : new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  // Save the changes from the edit form. `childIds` are the smaller goals
  // that should sit under this goal: link the ticked ones, unlink the rest.
  // If its timeframe changed, switch to that tab so you can still see it.
  function saveGoal(id, changes, childIds) {
    setItems(
      items.map(item => {
        if (item.id === id) return { ...item, ...changes }
        if (item.list !== 'goals') return item
        const isLinked = item.parentIds.includes(id)
        const shouldLink = childIds.includes(item.id)
        if (isLinked && !shouldLink) {
          return { ...item, parentIds: item.parentIds.filter(p => p !== id) }
        }
        if (!isLinked && shouldLink) {
          return { ...item, parentIds: [...item.parentIds, id] }
        }
        return item
      }),
    )
    setEditingId(null)
    if (changes.timeframe !== timeframe) changeTimeframe(changes.timeframe)
  }

  // Deleting a goal also unlinks any smaller goals that pointed to it.
  function deleteGoal(id) {
    setItems(
      items
        .filter(item => item.id !== id)
        .map(item =>
          item.parentIds?.includes(id)
            ? { ...item, parentIds: item.parentIds.filter(p => p !== id) }
            : item,
        ),
    )
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

      <form className="goal-form" onSubmit={addGoal}>
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
                    onSave={(changes, childIds) => saveGoal(goal.id, changes, childIds)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              )
            }
            const parents = parentTitles(goal)
            const children = childCount(goal)
            return (
              <Fragment key={goal.id}>
                <li className={goal.done ? 'done' : ''}>
                  <input
                    type="checkbox"
                    checked={goal.done}
                    onChange={() => toggleGoal(goal.id)}
                    aria-label={`Mark "${goal.title}" as done`}
                  />
                  <div className="goal-text">
                    <span className="goal-title">{goal.title}</span>
                    {parents && <span className="goal-parent">↳ {parents}</span>}
                    {children > 0 && (
                      <span className="goal-children">
                        {children} smaller goal{children === 1 ? '' : 's'}
                      </span>
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
                    onClick={() => deleteGoal(goal.id)}
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
    </div>
  )
}

export default GoalsScreen
