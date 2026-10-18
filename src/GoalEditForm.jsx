import { useState } from 'react'
import { TIMEFRAMES, labelOf, parentOptionsFor } from './timeframes.js'

// The form shown in place of a goal while you edit it.
// It starts filled in with the goal's current values. Nothing is changed
// until you tap Save; Cancel throws the changes away.
function GoalEditForm({ goal, goals, onSave, onCancel }) {
  const [title, setTitle] = useState(goal.title)
  const [timeframe, setTimeframe] = useState(goal.timeframe)
  const [parentId, setParentId] = useState(goal.parentId || '')
  const [why, setWhy] = useState(goal.why || '')

  const parentOptions = parentOptionsFor(goals, timeframe, goal.id)

  // If the new timeframe makes the chosen parent no longer bigger, clear it.
  function changeTimeframe(value) {
    setTimeframe(value)
    const stillAllowed = parentOptionsFor(goals, value, goal.id).some(g => g.id === parentId)
    if (!stillAllowed) setParentId('')
  }

  function save(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      timeframe,
      parentId: parentId || null,
      why: why.trim(),
    })
  }

  return (
    <form className="goal-form edit-form" onSubmit={save}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        aria-label="Goal"
        autoFocus
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
          {parentOptions.map(g => (
            <option key={g.id} value={g.id}>
              {g.title} ({labelOf(g.timeframe)})
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
