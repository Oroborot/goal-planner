import { useState } from 'react'
import { moveToDay } from './goalActions.js'
import { dayLabel, leftovers, todayKey } from './calendar.js'

// On Today: "3 left from earlier · Move all to today". Nothing moves on its
// own; you move them all, or open the list and move one by one.
function Leftovers({ goals, items, apply }) {
  const [open, setOpen] = useState(false)
  const list = leftovers(goals)
  const today = todayKey()
  if (list.length === 0) return null

  return (
    <section className="leftovers">
      <div className="leftovers-head">
        <button type="button" className="link-button" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? '▾' : '▸'} {list.length} left from earlier
        </button>
        <button type="button" onClick={() => apply(moveToDay(items, list.map(g => g.id), today))}>
          Move all to today
        </button>
      </div>
      {open && (
        <ul className="leftovers-list">
          {list.map(g => (
            <li key={g.id}>
              <a href={`#goal/${g.id}`} className="goal-link">
                {g.title}
              </a>
              <span className="goal-meta">{dayLabel(g.date)}</span>
              <button type="button" className="secondary" onClick={() => apply(moveToDay(items, [g.id], today))}>
                Today
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Leftovers
