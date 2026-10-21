import { useState } from 'react'
import { activeGoals, progressOf, percent } from './progress.js'
import { addDaysKey, dateKey as toKey, dayCounts, dayLabel, habitsOn, mondayOf, parseKey, tasksOn, todayKey } from './calendar.js'
import { addGoal } from './goalActions.js'
import { colorOf } from './colors.js'
import { WEEKDAYS } from './repeat.js'
import DayList from './DayList.jsx'
import ProgressBar from './ProgressBar.jsx'
import ViewSwitch from './ViewSwitch.jsx'
import BackLink from './BackLink.jsx'

// How many colored dots fit in one day of the grid before "+2".
const MAX_DOTS = 3

// One month of the calendar (iPhone Calendar style): your Month goals with
// their progress on top, then a grid of days with a colored dot per task.
// Tap a day to see its tasks under the grid.
function MonthPage({ monthKey, items, apply }) {
  const today = todayKey()
  const inThisMonth = today.startsWith(monthKey)
  const [selected, setSelected] = useState(inThisMonth ? today : `${monthKey}-01`)
  const goals = activeGoals(items)
  const monthGoals = goals.filter(g => g.timeframe === 'month')

  // The grid starts on the Monday on or before the 1st and ends on the
  // Sunday on or after the last day, so every row is a full week.
  const first = `${monthKey}-01`
  const lastDate = parseKey(first)
  lastDate.setMonth(lastDate.getMonth() + 1, 0)
  const last = toKey(lastDate)
  const cells = []
  for (let key = mondayOf(first); key <= addDaysKey(mondayOf(last), 6); key = addDaysKey(key, 1)) {
    cells.push(key)
  }

  function go(n) {
    const date = parseKey(first)
    date.setMonth(date.getMonth() + n)
    window.location.hash = `#month/${toKey(date).slice(0, 7)}`
  }

  // Each week row of the grid: done / planned and %, Monday to Sunday.
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    const counts = cells.slice(i, i + 7).map(key => dayCounts(goals, key))
    const done = counts.reduce((s, c) => s + c.done, 0)
    const total = counts.reduce((s, c) => s + c.total, 0)
    weeks.push({ monday: cells[i], done, total })
  }

  // Quick add: a task on the selected day, or a Month goal.
  const [taskTitle, setTaskTitle] = useState('')
  const [goalTitle, setGoalTitle] = useState('')
  function addTask(e) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    apply(addGoal(items, taskTitle.trim(), 'day', [], '', { date: selected }))
    setTaskTitle('')
  }
  function addMonthGoal(e) {
    e.preventDefault()
    if (!goalTitle.trim()) return
    apply(addGoal(items, goalTitle.trim(), 'month', []))
    setGoalTitle('')
  }

  const title = parseKey(first).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="app">
      <BackLink fallback="#" />
      <ViewSwitch view="month" dateKey={selected} />

      <div className="day-nav">
        <button type="button" className="icon-button" onClick={() => go(-1)} aria-label="Previous month">
          ←
        </button>
        <div className="day-nav-title">
          <h1>{title}</h1>
        </div>
        <button type="button" className="icon-button" onClick={() => go(1)} aria-label="Next month">
          →
        </button>
      </div>
      {!inThisMonth && (
        <a href="#month" className="back today-link">
          Back to this month
        </a>
      )}

      <section className="month-goals">
        <h2>Month goals</h2>
        {monthGoals.length === 0 ? (
          <p className="empty">No Month goals yet. Add them in Goals → Month.</p>
        ) : (
          <ul className="plain-links">
            {monthGoals.map(goal => {
              const progress = progressOf(goals, goal)
              return (
                <li key={goal.id}>
                  <div className="goal-text">
                    <a href={`#goal/${goal.id}`} className="goal-title goal-link">
                      <span className="goal-dot" style={{ background: colorOf(goals, goal) }} />
                      {goal.title}
                    </a>
                    <span className="goal-meta">{percent(progress)}%</span>
                    <ProgressBar progress={progress} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <form className="inline-add" onSubmit={addMonthGoal}>
          <input value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder="＋ Add a Month goal" aria-label="New Month goal" />
          {goalTitle.trim() && <button type="submit">Add</button>}
        </form>
      </section>

      <div className="month-grid" role="grid" aria-label={title}>
        {WEEKDAYS.map(d => (
          <span key={d.value} className="month-weekday">
            {d.short.slice(0, 2)}
          </span>
        ))}
        {cells.map(key => {
          const dayGoals = [...tasksOn(goals, key), ...habitsOn(goals, key)]
          const classes = ['month-day']
          if (!key.startsWith(monthKey)) classes.push('other-month')
          if (key === today) classes.push('today')
          if (key === selected) classes.push('selected')
          return (
            <button
              key={key}
              type="button"
              className={classes.join(' ')}
              onClick={() => setSelected(key)}
              aria-label={`${dayLabel(key)}, ${dayGoals.length} planned`}
              aria-pressed={key === selected}
            >
              <span className="month-day-number">{parseKey(key).getDate()}</span>
              <span className="month-dots">
                {dayGoals.slice(0, MAX_DOTS).map(g => (
                  <span key={g.id} className="goal-dot" style={{ background: colorOf(goals, g) }} />
                ))}
                {dayGoals.length > MAX_DOTS && <span className="month-more">+{dayGoals.length - MAX_DOTS}</span>}
              </span>
            </button>
          )
        })}
      </div>

      <ul className="month-weeks" aria-label="Weeks">
        {weeks.map(w => (
          <li key={w.monday}>
            <a href={`#week/${w.monday}`} className="goal-link">
              Week of {parseKey(w.monday).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </a>
            <span className="goal-meta">
              {w.total === 0 ? '–' : `${w.done}/${w.total} · ${Math.round((w.done / w.total) * 100)}%`}
            </span>
            <ProgressBar progress={w.total === 0 ? 0 : w.done / w.total} />
          </li>
        ))}
      </ul>

      <section className="month-selected">
        <h2>{dayLabel(selected)}</h2>
        <DayList dateKey={selected} goals={goals} items={items} apply={apply} compact />
        <form className="inline-add" onSubmit={addTask}>
          <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder={`＋ Add a task for ${dayLabel(selected).toLowerCase()}`} aria-label="New task" />
          {taskTitle.trim() && <button type="submit">Add</button>}
        </form>
        <a href={`#day/${selected}`} className="back">
          Open day →
        </a>
      </section>
    </div>
  )
}

export default MonthPage
