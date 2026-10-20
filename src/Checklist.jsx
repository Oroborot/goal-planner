import { useState } from 'react'
import { addChecklistItem, removeChecklistItem, toggleChecklistItem } from './goalActions.js'

// The checklist inside a task (Things 3 style): small items you tick one
// by one, like the ingredients under "Buy food". Type and press Enter to add.
function Checklist({ goal, items, apply }) {
  const [text, setText] = useState('')
  const list = goal.checklist || []
  const done = list.filter(c => c.done).length

  // Adds what's typed. Runs on Enter, on ＋, and when you tap elsewhere,
  // so typed text never sits there without becoming an item.
  function add(e) {
    e?.preventDefault()
    if (!text.trim()) return
    apply(addChecklistItem(items, goal.id, text.trim()))
    setText('')
  }

  return (
    <section className="checklist">
      <h2>
        Checklist {list.length > 0 && <span className="goal-meta">{done}/{list.length}</span>}
      </h2>
      {list.length > 0 && (
        <ul className="checklist-items">
          {list.map(c => (
            <li key={c.id} className={c.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={c.done}
                onChange={() => apply(toggleChecklistItem(items, goal.id, c.id))}
                aria-label={`Tick "${c.text}"`}
              />
              <span className="checklist-text">{c.text}</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => apply(removeChecklistItem(items, goal.id, c.id))}
                aria-label={`Remove "${c.text}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="checklist-add">
        <span className="checklist-new-box" aria-hidden="true" />
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={() => add()}
          placeholder="Add an item"
          aria-label="New checklist item"
          enterKeyHint="done"
        />
        <button type="submit" className="icon-button" aria-label="Add item">
          ＋
        </button>
      </form>
    </section>
  )
}

export default Checklist
