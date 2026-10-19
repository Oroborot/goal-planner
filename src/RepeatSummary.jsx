import { repeatLabel, repeatStats } from './repeat.js'

// One short line for a repeating goal in lists, e.g.
// "↻ Every day · 5 in a row · 2 of 3 this week".
function RepeatSummary({ goal }) {
  const stats = repeatStats(goal)
  return (
    <span className="goal-repeat">
      ↻ {repeatLabel(goal)} · {stats.streak} in a row
      {goal.target.per !== 'day' &&
        ` · ${stats.thisPeriod} of ${stats.periodTarget} this ${goal.target.per}`}
    </span>
  )
}

export default RepeatSummary
