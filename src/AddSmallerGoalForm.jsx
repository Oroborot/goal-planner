import { useState } from 'react'
import { smallerTimeframes } from './timeframes.js'

// The mini form behind the ＋ button: add a new smaller goal straight
// under a bigger one. It starts on the next timeframe down,
// e.g. Month -> Week.
function AddSmallerGoalForm({ parent, onAdd, onCancel }) {
  const options = smallerTimeframes(parent.timeframe)
  const [title, setTitle] = useState('')
  const [timeframe, setTimeframe] = useState(options[options.length - 1].value)

  function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), timeframe)
  }

  return (
    <form className="goal-form edit-form" onSubmit={add}>
      <p className="form-heading">New smaller goal under “{parent.title}”</p>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What's the smaller goal?"
        aria-label="Smaller goal"
        autoFocus
      />
      <select
        value={timeframe}
        onChange={e => setTimeframe(e.target.value)}
        aria-label="Timeframe"
      >
        {options.map(t => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <div className="row">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={!title.trim()}>
          Add
        </button>
      </div>
    </form>
  )
}

export default AddSmallerGoalForm
