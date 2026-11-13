import { useState } from 'react'
import BackLink from './BackLink.jsx'
import { parseKey } from './calendar.js'
import { shortDuration } from './stats.js'
import { loadSessions } from './workLog.js'
import { loadRatings } from './ratings.js'
import { DAY_PARTS, inRange, ratingLists, ratingTotals, timeOfDay, topExercises, trainingSessions, workoutTotals } from './trainingStats.js'

// Week / Month / All time. `value` is the number of days (null = everything).
const RANGES = [
  { value: 7, label: 'Week' },
  { value: 30, label: 'Month' },
  { value: null, label: 'All time' },
]

// The chips at the top: look at everything, or one tab of the app.
const SCOPES = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'training', label: 'Training' },
  { value: 'ideas', label: 'Ideas' },
]
const DEFAULT_SCOPE = 'training'
const SCOPE_KEY = 'planner-stats-scope'

// Bars for one number per day, tallest = the best day.
// Labels: weekday letters for a week, a date every 5 days for a month.
export function DayBars({ days, values, format = v => v }) {
  const max = Math.max(1, ...days.map(d => values[d] || 0))
  return (
    <div className={`day-bars ${days.length > 7 ? 'many' : ''}`}>
      {days.map((day, i) => {
        const value = values[day] || 0
        const date = parseKey(day)
        const label =
          days.length <= 7
            ? date.toLocaleDateString(undefined, { weekday: 'narrow' })
            : i % 5 === 0 || i === days.length - 1
              ? date.getDate()
              : ''
        return (
          <div key={day} className="day-bar" title={`${day}: ${format(value)}`}>
            <span className="day-bar-value">{days.length <= 7 && value > 0 ? format(value) : ''}</span>
            <div className="day-bar-track">
              <div className="day-bar-fill" style={{ height: `${(value / max) * 100}%` }} />
            </div>
            <span className="day-bar-label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// One line per exercise: "Squats  − 1 ・ ＋ 4".
function RatingList({ rows }) {
  if (rows.length === 0) return <p className="empty">No votes yet.</p>
  return (
    <ul className="stats-list">
      {rows.map(r => (
        <li key={r.key}>
          <span className="goal-link">{r.name}</span>
          <span className="goal-meta">
            − {r.minus} ・ ＋ {r.plus}
          </span>
        </li>
      ))}
    </ul>
  )
}

// The Training chip: workouts, time of day, favourite exercises, ratings.
function TrainingStats() {
  const [days, setDays] = useState(7)
  // Read once when the chip opens (the data lives in localStorage).
  const [all] = useState(() => trainingSessions(loadSessions()))
  const [ratings] = useState(() => loadRatings())

  const sessions = inRange(all, days)
  const totals = workoutTotals(sessions)
  const parts = timeOfDay(sessions)
  const topPart = DAY_PARTS.find(p => p.value === parts.top)
  const maxPart = Math.max(1, ...DAY_PARTS.map(p => parts.counts[p.value]))
  const exercises = topExercises(sessions)
  const { best, worst } = ratingLists(ratings)
  const total = ratingTotals(ratings)

  return (
    <>
      <div className="tabs">
        {RANGES.map(r => (
          <button
            key={r.label}
            type="button"
            className={days === r.value ? 'tab active' : 'tab'}
            aria-pressed={days === r.value}
            onClick={() => setDays(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <strong>{totals.count}</strong>
          <span>workouts</span>
        </div>
        <div className="stat-card">
          <strong>{shortDuration(totals.seconds)}</strong>
          <span>total time</span>
        </div>
      </div>

      <section className="stats-section">
        <h2>Time of day</h2>
        {totals.count === 0 ? (
          <p className="empty">No workouts in this range.</p>
        ) : (
          <>
            <div className="day-bars">
              {DAY_PARTS.map(p => {
                const n = parts.counts[p.value]
                return (
                  <div key={p.value} className="day-bar" title={`${p.label} (${p.hint}): ${n}`}>
                    <span className="day-bar-value">{n > 0 ? n : ''}</span>
                    <div className="day-bar-track">
                      <div className="day-bar-fill" style={{ height: `${(n / maxPart) * 100}%` }} />
                    </div>
                    <span className="day-bar-label">{p.label}</span>
                  </div>
                )
              })}
            </div>
            <p className="goal-meta">Most often: {topPart.label.toLowerCase()} ({topPart.hint} h).</p>
          </>
        )}
      </section>

      <section className="stats-section">
        <h2>Most-used exercises</h2>
        {!exercises.hasData ? (
          <p className="empty">Counts start from your next workout.</p>
        ) : (
          <ul className="stats-list">
            {exercises.list.map(e => (
              <li key={e.key}>
                <span className="goal-link">{e.name}</span>
                <span className="goal-meta">{e.count}×</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stats-section">
        <h2>Best rated</h2>
        <RatingList rows={best} />
      </section>

      <section className="stats-section">
        <h2>Worst rated</h2>
        <RatingList rows={worst} />
      </section>

      <section className="stats-section">
        <h2>All ratings</h2>
        <p className="goal-meta">
          Total: − {total.minus} ・ ＋ {total.plus}
        </p>
        <RatingList rows={total.rows} />
      </section>
    </>
  )
}

// Menu → Stats: one chip per tab of the app. Training works now; the
// others come in a later step.
function StatsPage() {
  // The chip that is open. It is remembered, so the page opens where you left it.
  // An old saved value (like 'goals') falls back to Training.
  const [scope, setScope] = useState(() => {
    try {
      const saved = localStorage.getItem(SCOPE_KEY)
      return SCOPES.some(s => s.value === saved) ? saved : DEFAULT_SCOPE
    } catch {
      return DEFAULT_SCOPE
    }
  })
  function chooseScope(value) {
    setScope(value)
    try {
      localStorage.setItem(SCOPE_KEY, value)
    } catch {
      // Storage blocked: the choice just isn't remembered.
    }
  }

  return (
    <div className="app">
      <BackLink fallback="#" />
      <h1>Stats</h1>

      <div className="chips" role="group" aria-label="Stats for">
        {SCOPES.map(s => (
          <button
            key={s.value}
            type="button"
            className={scope === s.value ? 'chip active' : 'chip'}
            aria-pressed={scope === s.value}
            onClick={() => chooseScope(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {scope === 'training' ? (
        <TrainingStats />
      ) : (
        <p className="empty">{SCOPES.find(s => s.value === scope).label} stats are coming in the next step.</p>
      )}
    </div>
  )
}

export default StatsPage
