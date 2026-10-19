import { recentDays, repeatLabel, repeatStats, targetLabel } from './repeat.js'

// The counter for a repeating goal on its page: how often it repeats,
// the numbers, and a strip of the last 14 days.
function RepeatPanel({ goal }) {
  const stats = repeatStats(goal)
  const days = recentDays(goal)

  return (
    <section className="repeat-panel">
      <p className="goal-meta">
        ↻ Repeats: {repeatLabel(goal)} · target {targetLabel(goal.target)}
      </p>
      <div className="repeat-stats">
        <div>
          <strong>{stats.total}</strong>
          <span>times done</span>
        </div>
        <div>
          <strong>{stats.streak}</strong>
          <span>in a row</span>
        </div>
        <div>
          <strong>{stats.missed}</strong>
          <span>missed</span>
        </div>
        {goal.target.per !== 'day' && (
          <div>
            <strong>
              {stats.thisPeriod}/{stats.periodTarget}
            </strong>
            <span>this {goal.target.per}</span>
          </div>
        )}
      </div>
      <ol className="day-strip" aria-label="Last 14 days">
        {days.map(day => (
          <li key={day.key} className={`day-cell ${day.state}`} title={`${day.label}: ${day.state}`}>
            <span className="visually-hidden">
              {day.label}: {day.state}
            </span>
          </li>
        ))}
      </ol>
      <p className="goal-meta day-strip-legend">Last 14 days: filled = done, outlined = missed, faded = not planned</p>
    </section>
  )
}

export default RepeatPanel
