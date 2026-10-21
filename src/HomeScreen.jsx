import { activeGoals } from './progress.js'
import { isDoneNow, isScheduled, todayKey } from './repeat.js'
import { activeNotes } from './noteActions.js'

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

  // A short summary for the Calendar button: today's tasks and
  // the habits planned for today.
  const todayTasks = activeGoals(items).filter(
    goal => goal.date === todayKey() || (goal.repeat && isScheduled(goal, now)),
  )
  const todayDone = todayTasks.filter(isDoneNow).length
  const todaySummary =
    todayTasks.length === 0
      ? 'Nothing planned today'
      : `${todayDone} of ${todayTasks.length} done today`

  // A short summary for the Notes button: open tasks first.
  const notes = activeNotes(items)
  const openTasks = notes.filter(note => note.isTask && !note.done).length
  const notesSummary =
    notes.length === 0
      ? 'No notes yet'
      : `${openTasks} open task${openTasks === 1 ? '' : 's'} · ${notes.length} note${notes.length === 1 ? '' : 's'}`

  return (
    <div className="app">
      <p className="date">{today}</p>
      <h1>{greeting(now.getHours())}</h1>
      <p className="subtitle">What do you want to do?</p>

      <nav className="tiles">
        <a href="#day" className="tile">
          <span className="tile-title">Calendar</span>
          <span className="tile-sub">{todaySummary}</span>
        </a>
        <a href="#goals" className="tile">
          <span className="tile-title">Goals</span>
          <span className="tile-sub">{goalsSummary}</span>
        </a>
        <a href="#notes" className="tile">
          <span className="tile-title">Notes</span>
          <span className="tile-sub">{notesSummary}</span>
        </a>
        <a href="#folders" className="tile">
          <span className="tile-title">Folders</span>
          <span className="tile-sub">Achieved · Reasons to try</span>
        </a>
      </nav>
    </div>
  )
}

export default HomeScreen
