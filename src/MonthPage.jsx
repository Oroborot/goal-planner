import { useState } from 'react'
import { activeGoals, progressOf, percent } from './progress.js'
import { addDaysKey, dateKey as toKey, dayLabel, habitsOn, mondayOf, parseKey, tasksOn, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import { WEEKDAYS } from './repeat.js'
import DayList from './DayList.jsx'
import ProgressBar from './ProgressBar.jsx'
import ViewSwitch from './ViewSwitch.jsx'

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

  const title = parseKey(first).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="app">
      <a href="#" className="back">
        ← Home
      </a>
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

      <section className="month-selected">
        <h2>{dayLabel(selected)}</h2>
        <DayList dateKey={selected} goals={goals} items={items} apply={apply} compact />
        <a href={`#day/${selected}`} className="back">
          Open day →
        </a>
      </section>
    </div>
  )
}

export default MonthPage
