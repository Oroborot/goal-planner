import { moveToDay } from './goalActions.js'
import { addDaysKey, mondayOf, todayKey } from './calendar.js'

// Move a task to another day (Todoist style): Today / Tomorrow /
// Next week (its Monday) / any date. The day it's on now isn't offered.
function MoveMenu({ goal, items, apply, onDone }) {
  const today = todayKey()
  const choices = [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDaysKey(today, 1) },
    { label: 'Next week', date: addDaysKey(mondayOf(today), 7) },
  ].filter(c => c.date !== goal.date)

  function move(date) {
    if (!date || date === goal.date) return
    apply(moveToDay(items, [goal.id], date))
    onDone()
  }

  return (
    <div className="move-menu">
      {choices.map(c => (
        <button key={c.label} type="button" className="secondary" onClick={() => move(c.date)}>
          {c.label}
        </button>
      ))}
      <input
        type="date"
        aria-label="Pick a date"
        onChange={e => move(e.target.value)}
      />
    </div>
  )
}

export default MoveMenu
