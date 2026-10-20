import { useState } from 'react'
import BackLink from './BackLink.jsx'
import ProgressBar from './ProgressBar.jsx'
import { activeGoals, progressOf, percent } from './progress.js'
import { repeatStats, bestStreak } from './repeat.js'
import { labelOf } from './timeframes.js'
import { parseKey } from './calendar.js'
import { countEvents, doneByDay, lastDays, shortDuration, sumOver, timeByDay, timeByGoal } from './stats.js'

const RANGES = [
  { value: 7, label: 'Week' },
  { value: 30, label: 'Month' },
]

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

// Menu → Stats: how much you did lately, where your time went, and how
// far along your bigger goals are (Todoist / Screen Time style).
function StatsPage({ items, events }) {
  const [range, setRange] = useState(7)
  const goals = activeGoals(items)
  const days = lastDays(range)
  const from = days[0]

  const done = doneByDay(goals)
  const time = timeByDay(events)
  const skipped = countEvents(events, ['skipped'], from)
  const moved = countEvents(events, ['rescheduled', 'snoozed'], from)

  // The habit with the longest streak going right now, and the best ever.
  const habits = goals.filter(g => g.repeat)
  const current = habits
    .map(g => ({ goal: g, streak: repeatStats(g).streak }))
    .sort((a, b) => b.streak - a.streak)[0]
  const best = Math.max(0, ...habits.map(bestStreak))

  const topTime = timeByGoal(events, from).slice(0, 5)
  const bigGoals = goals
    .filter(g => g.timeframe !== 'day' && !g.done)
    .map(g => ({ goal: g, progress: progressOf(goals, g) }))
    .sort((a, b) => b.progress - a.progress)

  return (
    <div className="app">
      <BackLink fallback="#" />
      <h1>Stats</h1>

      <div className="tabs">
        {RANGES.map(r => (
          <button
            key={r.value}
            type="button"
            className={range === r.value ? 'tab active' : 'tab'}
            aria-pressed={range === r.value}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p className="goal-meta stats-range">Last {range} days</p>

      <div className="stat-cards">
        <div className="stat-card">
          <strong>{sumOver(done, days)}</strong>
          <span>done</span>
        </div>
        <div className="stat-card">
          <strong>{shortDuration(sumOver(time, days))}</strong>
          <span>on the timer</span>
        </div>
        <div className="stat-card">
          <strong>{current ? current.streak : 0}</strong>
          <span>{current && current.streak > 0 ? `in a row: ${current.goal.title}` : 'streak now'}</span>
        </div>
        <div className="stat-card">
          <strong>{best}</strong>
          <span>best streak ever</span>
        </div>
        <div className="stat-card">
          <strong>{skipped}</strong>
          <span>skipped</span>
        </div>
        <div className="stat-card">
          <strong>{moved}</strong>
          <span>moved or put off</span>
        </div>
      </div>

      <section className="stats-section">
        <h2>Done per day</h2>
        <DayBars days={days} values={done} />
      </section>

      <section className="stats-section">
        <h2>Time per day</h2>
        <DayBars days={days} values={time} format={shortDuration} />
      </section>

      <section className="stats-section">
        <h2>Where the time went</h2>
        {topTime.length === 0 ? (
          <p className="empty">No timer sessions in these days.</p>
        ) : (
          <ul className="stats-list">
            {topTime.map(t => (
              <li key={t.id}>
                <a href={`#goal/${t.id}`} className="goal-link">
                  {t.title}
                </a>
                <span className="goal-meta">{shortDuration(t.seconds)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stats-section">
        <h2>Bigger goals</h2>
        {bigGoals.length === 0 ? (
          <p className="empty">No open bigger goals.</p>
        ) : (
          <ul className="stats-list">
            {bigGoals.map(({ goal, progress }) => (
              <li key={goal.id} className="stats-goal">
                <div className="stats-goal-head">
                  <a href={`#goal/${goal.id}`} className="goal-link">
                    {goal.title}
                  </a>
                  <span className="goal-meta">
                    {labelOf(goal.timeframe)} · {percent(progress)}%
                  </span>
                </div>
                <ProgressBar progress={progress} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default StatsPage
