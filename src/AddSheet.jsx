import { useState } from 'react'
import { addGoal, addHabit } from './goalActions.js'
import { addNote } from './noteActions.js'
import { todayKey } from './calendar.js'

// The sheet that slides up from the ＋ button: type something, then pick
// what it is. Task = today, Habit = every day, Note = Notes.
// Goal opens the Goals page, where you pick its timeframe.
function AddSheet({ items, apply, onClose }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  function add(kind) {
    if (kind === 'goal') {
      window.location.hash = '#goals'
      onClose()
      return
    }
    if (!title.trim()) {
      setError('Type something first')
      return
    }
    const text = title.trim()
    if (kind === 'task') {
      apply(addGoal(items, text, 'day', [], '', { date: todayKey() }))
      window.location.hash = '#day'
    } else if (kind === 'habit') {
      apply(addHabit(items, text))
      window.location.hash = '#day'
    } else {
      apply(addNote(items, text, false))
      window.location.hash = '#notes'
    }
    onClose()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Add something"
        onClick={e => e.stopPropagation()}
      >
        <input
          value={title}
          onChange={e => {
            setTitle(e.target.value)
            setError('')
          }}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          placeholder="What do you want to add?"
          aria-label="What do you want to add?"
          autoFocus
        />
        {error && <p className="sheet-error">{error}</p>}
        <div className="sheet-choices">
          <button type="button" onClick={() => add('task')}>
            Task <span>today</span>
          </button>
          <button type="button" onClick={() => add('habit')}>
            Habit <span>every day</span>
          </button>
          <button type="button" onClick={() => add('note')}>
            Note
          </button>
          <button type="button" className="secondary" onClick={() => add('goal')}>
            Goal <span>pick timeframe</span>
          </button>
        </div>
        <button type="button" className="secondary sheet-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default AddSheet
