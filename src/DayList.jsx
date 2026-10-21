import { useState } from 'react'
import { toggleGoal } from './goalActions.js'
import MoveMenu from './MoveMenu.jsx'
import { topIds } from './routine.js'
import { dayEntries, dayLabel, endTime, formatMinutes, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import { ImportanceIcon } from './TaskExtras.jsx'
import { showTime } from './settings.js'

// One row: tick box (or a mark), time (and end time), color dot, title.
// Habits get a ↻; chained ones say what they come after.
function Row({ entry, goals, items, apply, onToggle, top, showFeeds }) {
  const { goal, time, done, habit, level } = entry
  // The Move menu under the title, open or folded.
  const [moving, setMoving] = useState(false)
  const canMove = !habit && !done && apply
  const anchor = goal.after && goals.find(g => g.id === goal.after)
  // The bigger goals this one counts toward (shown on Home).
  const feeds = showFeeds ? goals.filter(g => goal.parentIds.includes(g.id)).map(g => g.title) : []
  const classes = [done ? 'done' : '', level ? `chained level-${Math.min(level, 3)}` : '']
  return (
    <li className={classes.join(' ').trim()}>
      {onToggle ? (
        <input
          type="checkbox"
          checked={done}
          onChange={onToggle}
          aria-label={`Mark "${goal.title}" as done`}
        />
      ) : (
        <span className="habit-mark" aria-label={done ? 'Done' : 'Not done'}>
          {done ? '✓' : '·'}
        </span>
      )}
      <span className="day-time">
        {showTime(time)}
        {goal.duration && (
          <span className="day-duration">
            {time ? `–${showTime(endTime(time, goal.duration))}` : formatMinutes(goal.duration)}
          </span>
        )}
      </span>
      <div className="goal-text">
        <a href={`#goal/${goal.id}`} className="goal-title goal-link">
          <span className="goal-dot" style={{ background: colorOf(goals, goal) }} />
          {goal.title}
          {habit && <span className="habit-tag"> ↻</span>}
          {top && <span className="top-star" aria-label="Top task"> ★</span>}
          <ImportanceIcon importance={goal.importance} color={colorOf(goals, goal)} />
        </a>
        {feeds.length > 0 && <span className="goal-meta feeds">feeds {feeds.join(', ')}</span>}
        {anchor && <span className="goal-meta chain-note">⛓ after {anchor.title}</span>}
        {goal.checklist?.length > 0 && (
          <span className="goal-meta">
            ☑ {goal.checklist.filter(c => c.done).length}/{goal.checklist.length}
          </span>
        )}
        {goal.plannedDate && (
          <span className="goal-meta">Done early · planned for {dayLabel(goal.plannedDate)}</span>
        )}
        {goal.skippedFrom && !goal.done && (
          <span className="goal-meta">Skipped from {dayLabel(goal.skippedFrom)}</span>
        )}
        {moving && (
          <MoveMenu goal={goal} items={items} apply={apply} onDone={() => setMoving(false)} />
        )}
      </div>
      {canMove && (
        <button
          type="button"
          className="icon-button move-button"
          onClick={() => setMoving(!moving)}
          aria-label={moving ? 'Close move' : `Move "${goal.title}" to another day`}
          aria-expanded={moving}
        >
          {moving ? '✕' : '↷'}
        </button>
      )}
    </li>
  )
}

// Everything on one day in time order (tasks and habits together, chained
// ones placed right after what they follow). Used by Day, Week and Month.
// Tasks can be ticked any day; habits only today (they're ticked per day).
// `showFeeds` adds the bigger goals each one counts toward.
function DayList({ dateKey, goals, items, apply, compact = false, showFeeds = false }) {
  const entries = dayEntries(goals, dateKey)
  const isToday = dateKey === todayKey()
  // The day's ★ top tasks, picked in "Plan your day".
  const top = topIds(items, dateKey)

  if (entries.length === 0) {
    return <p className="empty">Nothing planned.</p>
  }

  return (
    <ul className={compact ? 'day-list compact' : 'day-list'}>
      {entries.map(entry => (
        <Row
          key={entry.goal.id}
          entry={entry}
          goals={goals}
          items={items}
          apply={compact ? null : apply}
          top={top.includes(entry.goal.id)}
          showFeeds={showFeeds}
          onToggle={
            entry.habit && !isToday ? null : () => apply(toggleGoal(items, entry.goal.id))
          }
        />
      ))}
    </ul>
  )
}

export default DayList
