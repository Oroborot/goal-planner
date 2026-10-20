import { useState } from 'react'
import { activeGoals } from './progress.js'
import { addDaysKey, dayCounts, mondayOf, parseKey, tasksOn, habitsOn, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import DayList from './DayList.jsx'
import ViewSwitch from './ViewSwitch.jsx'
import BackLink from './BackLink.jsx'

// One week of the calendar, Monday to Sunday, stacked. Each day folds open
// or closed, so the page never becomes a huge list. Today starts open.
function WeekPage({ mondayKey, items, apply }) {
  const today = todayKey()
  const days = Array.from({ length: 7 }, (_, i) => addDaysKey(mondayKey, i))
  const [openDays, setOpenDays] = useState(() => (days.includes(today) ? [today] : []))
  const goals = activeGoals(items)

  function toggleDay(key) {
    setOpenDays(openDays.includes(key) ? openDays.filter(k => k !== key) : [...openDays, key])
  }

  function go(n) {
    window.location.hash = `#week/${addDaysKey(mondayKey, n * 7)}`
  }

  const first = parseKey(days[0])
  const last = parseKey(days[6])
  const range = `${first.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${last.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
  const thisWeek = days.includes(today)
  // "This week", "Next week", "Last week", otherwise just "Week".
  const currentMonday = mondayOf(today)
  let weekName = 'Week'
  if (thisWeek) weekName = 'This week'
  else if (mondayKey === addDaysKey(currentMonday, 7)) weekName = 'Next week'
  else if (mondayKey === addDaysKey(currentMonday, -7)) weekName = 'Last week'

  return (
    <div className="app">
      <BackLink fallback="#" />
      <ViewSwitch view="week" dateKey={thisWeek ? today : mondayKey} />

      <div className="day-nav">
        <button type="button" className="icon-button" onClick={() => go(-1)} aria-label="Previous week">
          ←
        </button>
        <div className="day-nav-title">
          <h1>{weekName}</h1>
          <p className="goal-meta">{range}</p>
        </div>
        <button type="button" className="icon-button" onClick={() => go(1)} aria-label="Next week">
          →
        </button>
      </div>
      {!thisWeek && (
        <a href="#week" className="back today-link">
          Back to this week
        </a>
      )}

      <div className="week">
        {days.map(key => {
          const open = openDays.includes(key)
          const { done, total } = dayCounts(goals, key)
          const day = parseKey(key)
          // Folded days show a small dot per task, in its goal's color.
          const dots = [...tasksOn(goals, key), ...habitsOn(goals, key)].slice(0, 8)
          return (
            <section key={key} className={key === today ? 'week-day today' : 'week-day'}>
              <button
                type="button"
                className="week-day-head"
                onClick={() => toggleDay(key)}
                aria-expanded={open}
              >
                <span className="week-day-name">
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}{' '}
                  <span className="goal-meta">{day.getDate()}</span>
                </span>
                {!open && (
                  <span className="week-dots" aria-hidden="true">
                    {dots.map(g => (
                      <span key={g.id} className="goal-dot" style={{ background: colorOf(goals, g) }} />
                    ))}
                  </span>
                )}
                <span className="goal-meta week-count">{total === 0 ? '–' : `${done}/${total}`}</span>
                <span className="chevron">{open ? '▾' : '▸'}</span>
              </button>
              {open && (
                <div className="week-day-body">
                  <DayList dateKey={key} goals={goals} items={items} apply={apply} compact />
                  <a href={`#day/${key}`} className="back">
                    Open day →
                  </a>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default WeekPage
