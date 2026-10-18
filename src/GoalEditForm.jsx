import { useState } from 'react'
import { TIMEFRAMES, labelOf, biggerGoals, smallerGoals } from './timeframes.js'

// A list of goals with a checkbox each, used for linking.
// `checkedIds` are the ticked ones; `onToggle(id)` ticks or unticks one.
function LinkList({ legend, goals, checkedIds, onToggle, emptyText }) {
  return (
    <fieldset className="link-list">
      <legend>{legend}</legend>
      {goals.length === 0 ? (
        <p className="link-empty">{emptyText}</p>
      ) : (
        goals.map(g => (
          <label key={g.id}>
            <input
              type="checkbox"
              checked={checkedIds.includes(g.id)}
              onChange={() => onToggle(g.id)}
              aria-label={`${legend}: ${g.title}`}
            />
            <span>
              {g.title} <span className="link-timeframe">({labelOf(g.timeframe)})</span>
            </span>
          </label>
        ))
      )}
    </fieldset>
  )
}

// Add `id` to the list if it's missing, or take it out if it's there.
function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
}

// The form shown in place of a goal while you edit it.
// It starts filled in with the goal's current values. Nothing is changed
// until you tap Save; Cancel throws the changes away.
// Links work both ways: tick the bigger goals this goal counts toward,
// and the smaller goals that sit under it.
function GoalEditForm({ goal, goals, onSave, onCancel }) {
  const [title, setTitle] = useState(goal.title)
  const [timeframe, setTimeframe] = useState(goal.timeframe)
  const [why, setWhy] = useState(goal.why || '')
  const [parentIds, setParentIds] = useState(goal.parentIds)
  // The smaller goals that currently list this goal as a parent.
  const [childIds, setChildIds] = useState(
    goals.filter(g => g.parentIds.includes(goal.id)).map(g => g.id),
  )

  const parentOptions = biggerGoals(goals, timeframe, goal.id)
  const childOptions = smallerGoals(goals, timeframe, goal.id)

  // A new timeframe changes which goals are bigger and smaller,
  // so drop any ticks that are no longer allowed.
  function changeTimeframe(value) {
    setTimeframe(value)
    const bigger = biggerGoals(goals, value, goal.id).map(g => g.id)
    const smaller = smallerGoals(goals, value, goal.id).map(g => g.id)
    setParentIds(parentIds.filter(id => bigger.includes(id)))
    setChildIds(childIds.filter(id => smaller.includes(id)))
  }

  function save(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), timeframe, why: why.trim(), parentIds }, childIds)
  }

  return (
    <form className="goal-form edit-form" onSubmit={save}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        aria-label="Goal"
        autoFocus
      />
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
      <input
        value={why}
        onChange={e => setWhy(e.target.value)}
        placeholder="Why does this matter to you? (optional)"
        aria-label="Why"
      />
      <LinkList
        legend="Counts toward"
        goals={parentOptions}
        checkedIds={parentIds}
        onToggle={id => setParentIds(toggleId(parentIds, id))}
        emptyText="No bigger goals yet."
      />
      <LinkList
        legend="Smaller goals under this"
        goals={childOptions}
        checkedIds={childIds}
        onToggle={id => setChildIds(toggleId(childIds, id))}
        emptyText={
          timeframe === 'day' ? 'Day is the smallest timeframe.' : 'No smaller goals yet.'
        }
      />
      <div className="row">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={!title.trim()}>
          Save
        </button>
      </div>
    </form>
  )
}

export default GoalEditForm
