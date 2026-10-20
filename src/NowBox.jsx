import { useState } from 'react'
import { skipTask, snoozeTask, swapTasks } from './goalActions.js'
import { dayEntries, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import { ImportanceIcon } from './TaskExtras.jsx'
import { showTime } from './settings.js'
import { topIds } from './routine.js'

// The time right now as '14:05', to compare with task times.
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// One task in the Now box, with its buttons. "Later" and "Swap" open a
// small row of choices under it.
function NowRow({ task, label, goals, items, apply, swapOptions }) {
  const [open, setOpen] = useState(null) // 'later' | 'swap' | null
  // Later and Swap only for tasks with their own time (not habits or chained).
  const timed = Boolean(task.time) && task.movable !== false

  return (
    <li className="now-row">
      <div className="now-main">
        <a href={`#goal/${task.id}`} className="goal-link goal-title">
          <span className="goal-dot" style={{ background: colorOf(goals, task) }} />
          {task.title}
          <ImportanceIcon importance={task.importance} color={colorOf(goals, task)} />
        </a>
        <span className="now-label">{label}</span>
      </div>
      <div className="now-actions">
        <a href={`#focus/${task.id}`} className="now-do">
          Do it
        </a>
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
              <span className="goal-dot" style={{ background: colorOf(goals, other) }} />
              {showTime(other.time)} {other.title}
              <ImportanceIcon importance={other.importance} color={colorOf(goals, other)} />
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
  // Today's timed tasks and habits (chained ones get their time from what
  // they follow), not done and not skipped for today.
  const timed = dayEntries(goals, today)
    .filter(e => e.time && !e.done && !(e.goal.hiddenUntil && e.goal.hiddenUntil > today))
    // `time` here is the real time (chains included); `movable` = it has its
    // own time, so Later and Swap can change it.
    .map(e => ({ ...e.goal, time: e.time, movable: !e.habit && !e.goal.after }))
  const due = timed.filter(t => t.time <= now)
  const next = timed.find(t => t.time > now)
  // ASAP tasks: only the ones you marked "Show in Now (ASAP)".
  const byImportance = (a, b) => (b.importance || 0) - (a.importance || 0)
  const asap = goals
    .filter(g => g.asap && !g.date && !g.done && !(g.hiddenUntil && g.hiddenUntil > today))
    .sort(byImportance)

  // ★ Top tasks from "Plan your day" that aren't already shown above
  // (untimed ones, or timed ones later today).
  const shown = new Set([...due, next].filter(Boolean).map(t => t.id))
  const top = topIds(items, today)
    .map(id => goals.find(g => g.id === id))
    .filter(g => g && !g.done && !shown.has(g.id) && !(g.hiddenUntil && g.hiddenUntil > today))

  if (due.length === 0 && !next && asap.length === 0 && top.length === 0) return null

  const row = (task, label) => (
    <NowRow
      key={task.id}
      task={task}
      label={label}
      goals={goals}
      items={items}
      apply={apply}
      // Swap suggests the most important tasks first.
      swapOptions={timed.filter(t => t.id !== task.id && t.movable).sort(byImportance)}
    />
  )

  return (
    <section className="now-box" aria-label="Now">
      <h2>Now</h2>
      <ul>
        {due.map(t => row(t, t.time === now ? `${showTime(t.time)} · now` : `${showTime(t.time)} · overdue`))}
        {top.map(t => row(t, t.time ? `★ top · ${showTime(t.time)}` : '★ top'))}
        {next && row(next, `next · ${showTime(next.time)}`)}
        {asap.map(t => row(t, 'ASAP'))}
      </ul>
    </section>
  )
}

export default NowBox
