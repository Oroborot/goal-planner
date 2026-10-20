import { useState } from 'react'
import { skipTask, snoozeTask, swapTasks, toggleGoal } from './goalActions.js'
import { tasksOn, todayKey } from './calendar.js'
import { colorOf } from './colors.js'

// The time right now as '14:05', to compare with task times.
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// One task in the Now box, with its buttons. "Later" and "Swap" open a
// small row of choices under it.
function NowRow({ task, label, goals, items, apply, swapOptions }) {
  const [open, setOpen] = useState(null) // 'later' | 'swap' | null
  const timed = Boolean(task.time)

  return (
    <li className="now-row">
      <div className="now-main">
        <a href={`#goal/${task.id}`} className="goal-link goal-title">
          <span className="goal-dot" style={{ background: colorOf(goals, task) }} />
          {task.title}
        </a>
        <span className="now-label">{label}</span>
      </div>
      <div className="now-actions">
        <button type="button" onClick={() => apply(toggleGoal(items, task.id))}>
          Do it
        </button>
        {timed && (
          <button type="button" className="secondary" onClick={() => setOpen(open === 'later' ? null : 'later')}>
            Later
          </button>
        )}
        <button type="button" className="secondary" onClick={() => apply(skipTask(items, task.id))}>
          Skip
        </button>
        {timed && swapOptions.length > 0 && (
          <button type="button" className="secondary" onClick={() => setOpen(open === 'swap' ? null : 'swap')}>
            Swap
          </button>
        )}
      </div>
      {open === 'later' && (
        <div className="now-choices">
          {[15, 30, 60].map(m => (
            <button key={m} type="button" className="chip" onClick={() => apply(snoozeTask(items, task.id, m))}>
              +{m} min
            </button>
          ))}
        </div>
      )}
      {open === 'swap' && (
        <div className="now-choices">
          {swapOptions.map(other => (
            <button
              key={other.id}
              type="button"
              className="chip"
              onClick={() => apply(swapTasks(items, task.id, other.id))}
            >
              {other.time} {other.title}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}

// The "Now" box at the top of Today: what's due or overdue today, the next
// timed task, and tasks you marked ASAP (no date). Yesterday's never show.
function NowBox({ goals, items, apply }) {
  const today = todayKey()
  const now = nowTime()
  const open = tasksOn(goals, today).filter(t => !t.done)
  const timed = open.filter(t => t.time)
  const due = timed.filter(t => t.time <= now)
  const next = timed.find(t => t.time > now)
  // ASAP tasks: only the ones you marked "Show in Now (ASAP)".
  const asap = goals.filter(
    g => g.asap && !g.date && !g.done && !(g.hiddenUntil && g.hiddenUntil > today),
  )

  if (due.length === 0 && !next && asap.length === 0) return null

  const row = (task, label) => (
    <NowRow
      key={task.id}
      task={task}
      label={label}
      goals={goals}
      items={items}
      apply={apply}
      swapOptions={timed.filter(t => t.id !== task.id)}
    />
  )

  return (
    <section className="now-box" aria-label="Now">
      <h2>Now</h2>
      <ul>
        {due.map(t => row(t, t.time === now ? `${t.time} · now` : `${t.time} · overdue`))}
        {next && row(next, `next · ${next.time}`)}
        {asap.map(t => row(t, 'ASAP'))}
      </ul>
    </section>
  )
}

export default NowBox
