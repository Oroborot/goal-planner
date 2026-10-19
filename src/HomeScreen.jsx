import { activeGoals } from './progress.js'
import { isDoneNow } from './repeat.js'

// "Good morning" before 12, "Good afternoon" before 18, otherwise "Good evening".
function greeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// The start screen: a greeting, today's date, and one button per section.
function HomeScreen({ items }) {
  const now = new Date()
  const today = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // A short summary for the Goals button, based on the Day goals.
  const dayGoals = activeGoals(items).filter(goal => goal.timeframe === 'day')
  const doneCount = dayGoals.filter(isDoneNow).length
  const goalsSummary =
    dayGoals.length === 0
      ? 'No day goals yet'
      : `${doneCount} of ${dayGoals.length} day goals done`

  return (
    <div className="app">
      <p className="date">{today}</p>
      <h1>{greeting(now.getHours())}</h1>
      <p className="subtitle">What do you want to do?</p>

      <nav className="tiles">
        <a href="#goals" className="tile">
          <span className="tile-title">Goals</span>
          <span className="tile-sub">{goalsSummary}</span>
        </a>
        <div className="tile disabled" aria-disabled="true">
          <span className="tile-title">Notes</span>
          <span className="tile-sub">Coming soon</span>
        </div>
        <div className="tile disabled" aria-disabled="true">
          <span className="tile-title">Folders</span>
          <span className="tile-sub">Coming soon</span>
        </div>
      </nav>
    </div>
  )
}

export default HomeScreen
