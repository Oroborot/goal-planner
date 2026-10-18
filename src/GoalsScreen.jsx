import { useState } from 'react'

// The timeframes a goal can belong to, from smallest to biggest.
// `value` is what gets saved, `label` is what you see on screen.
const TIMEFRAMES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

// How big a timeframe is: day = 0, week = 1, month = 2, year = 3.
function sizeOf(timeframe) {
  return TIMEFRAMES.findIndex(t => t.value === timeframe)
}

function labelOf(timeframe) {
  return TIMEFRAMES[sizeOf(timeframe)].label
}

// The goals screen: timeframe tabs, the add form and the goal list.
// `items` and `setItems` come from App, which loads and saves them.
function GoalsScreen({ items, setItems }) {
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  // The id of the bigger goal the new goal belongs to ('' means none).
  const [parentId, setParentId] = useState('')
  // The selected timeframe: drives both the tabs and the add-form dropdown.
  const [timeframe, setTimeframe] = useState('day')

  const goals = items.filter(item => item.list === 'goals')
  const visibleGoals = goals.filter(goal => goal.timeframe === timeframe)

  // A goal can only belong to a goal with a bigger timeframe,
  // e.g. a Day goal can link to a Week, Month or Year goal.
  const parentOptions = goals
    .filter(goal => sizeOf(goal.timeframe) > sizeOf(timeframe))
    .sort((a, b) => sizeOf(a.timeframe) - sizeOf(b.timeframe))

  function countFor(value) {
    return goals.filter(goal => goal.timeframe === value).length
  }

  function titleOf(id) {
    const parent = items.find(item => item.id === id)
    return parent ? parent.title : null
  }

  // Switching timeframe clears the chosen parent, because the list of
  // allowed parents changes with the timeframe.
  function changeTimeframe(value) {
    setTimeframe(value)
    setParentId('')
  }

  function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return
    const newItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      list: 'goals',
      timeframe,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      parentId: parentId || null,
      why: why.trim(),
    }
    setItems([...items, newItem])
    setTitle('')
    setWhy('')
    setParentId('')
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

  // Deleting a goal also unlinks any smaller goals that pointed to it.
  function deleteGoal(id) {
    setItems(
      items
        .filter(item => item.id !== id)
        .map(item => (item.parentId === id ? { ...item, parentId: null } : item)),
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

      <form className="add-form" onSubmit={addGoal}>
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
          {visibleGoals.map(goal => (
            <li key={goal.id} className={goal.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={goal.done}
                onChange={() => toggleGoal(goal.id)}
                aria-label={`Mark "${goal.title}" as done`}
              />
              <div className="goal-text">
                <span className="goal-title">{goal.title}</span>
                {goal.parentId && titleOf(goal.parentId) && (
                  <span className="goal-parent">↳ {titleOf(goal.parentId)}</span>
                )}
                {goal.why && <span className="goal-why">Why: {goal.why}</span>}
              </div>
              <button
                type="button"
                className="delete"
                onClick={() => deleteGoal(goal.id)}
                aria-label={`Delete "${goal.title}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GoalsScreen
