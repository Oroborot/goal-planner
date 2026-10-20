import { useState } from 'react'
import { bestStreak } from './repeat.js'
import { addDaysKey, mondayOf, todayKey } from './calendar.js'
import { countEvents, doneByDay, shortDuration, sumOver, timeByDay, withSmaller } from './stats.js'

// How many weeks the done-days grid shows.
const WEEKS = 12

// The stats box on a goal's page (Streaks / Habitify style): numbers for
// this goal and every smaller goal under it, plus a grid of the last 12
// weeks (one square per day, darker = more done), like GitHub's squares.
// Folded until you open it, so the page stays calm.
function GoalStats({ goal, goals, events }) {
  const [open, setOpen] = useState(false)
  const ids = withSmaller(goals, goal.id)
  const done = doneByDay(goals, ids)
  const time = timeByDay(events, ids)

  const today = todayKey()
  const start = addDaysKey(mondayOf(today), -7 * (WEEKS - 1))
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => addDaysKey(start, i))
  const max = Math.max(1, ...days.map(d => done[d] || 0))
  const hasSmaller = ids.size > 1

  return (
    <section className="goal-stats">
      <button type="button" className="link-button goal-stats-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? '▾' : '▸'} Stats
      </button>
      {open && (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <strong>{sumOver(done, Object.keys(done))}</strong>
              <span>times done{hasSmaller ? ' (with smaller goals)' : ''}</span>
            </div>
            <div className="stat-card">
              <strong>{shortDuration(sumOver(time, Object.keys(time)))}</strong>
              <span>on the timer{hasSmaller ? ' (with smaller goals)' : ''}</span>
            </div>
            {goal.repeat && (
              <div className="stat-card">
                <strong>{bestStreak(goal)}</strong>
                <span>best streak</span>
              </div>
            )}
            <div className="stat-card">
              <strong>{countEvents(events, ['skipped'], null, ids)}</strong>
              <span>skipped</span>
            </div>
            <div className="stat-card">
              <strong>{countEvents(events, ['rescheduled', 'snoozed'], null, ids)}</strong>
              <span>moved or put off</span>
            </div>
          </div>
          <div className="done-grid" aria-label={`Done days, last ${WEEKS} weeks`}>
            {days.map(day => {
              const count = done[day] || 0
              const level = day > today ? 'future' : count === 0 ? 0 : Math.ceil((count / max) * 3)
              return <span key={day} className={`done-square level-${level}`} title={`${day}: ${count} done`} />
            })}
          </div>
          <p className="goal-meta">Last {WEEKS} weeks, Mon at the top · darker = more done</p>
        </>
      )}
    </section>
  )
}

export default GoalStats
