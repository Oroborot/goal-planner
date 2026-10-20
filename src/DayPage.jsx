import { useState } from 'react'
import { activeGoals } from './progress.js'
import { addGoal } from './goalActions.js'
import {
  addDaysKey,
  dayCounts,
  dayLabel,
  dayLoad,
  endTime,
  formatMinutes,
  OVERLOAD_MINUTES,
  parseKey,
  todayKey,
} from './calendar.js'
import { TaskExtrasFields } from './TaskExtras.jsx'
import TimePicker from './TimePicker.jsx'
import { showTime } from './settings.js'
import { biggerGoals, labelOf } from './timeframes.js'
import DayList from './DayList.jsx'
import ViewSwitch from './ViewSwitch.jsx'
import NowBox from './NowBox.jsx'
import BackLink from './BackLink.jsx'

// One day of the calendar: the tasks planned for it (Day goals with that
// date) and the habits planned for that weekday. ← → move day by day.
function DayPage({ dateKey, items, apply }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [parentId, setParentId] = useState('')
  const [extras, setExtras] = useState({ importance: 0, duration: '' })

  const today = todayKey()
  const day = parseKey(dateKey)
  const goals = activeGoals(items)
  const { done, total } = dayCounts(goals, dateKey)
  const load = dayLoad(goals, dateKey)

  function go(n) {
    window.location.hash = `#day/${addDaysKey(dateKey, n)}`
  }

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    apply(
      addGoal(items, title.trim(), 'day', parentId ? [parentId] : [], '', {
        date: dateKey,
        time,
        importance: extras.importance,
        duration: Number(extras.duration) || null,
      }),
    )
    setTitle('')
    setTime('')
    setExtras({ importance: 0, duration: '' })
  }

  return (
    <div className="app">
      <BackLink fallback="#" />
      <ViewSwitch view="day" dateKey={dateKey} />

      <div className="day-nav">
        <button type="button" className="icon-button" onClick={() => go(-1)} aria-label="Previous day">
          ←
        </button>
        <div className="day-nav-title">
          <h1>{dayLabel(dateKey)}</h1>
          <p className="goal-meta">
            {day.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button type="button" className="icon-button" onClick={() => go(1)} aria-label="Next day">
          →
        </button>
      </div>
      {dateKey !== today && (
        <a href={`#day/${today}`} className="back today-link">
          Back to today
        </a>
      )}

      {dateKey === today && <NowBox goals={goals} items={items} apply={apply} />}

      <p className="goal-meta day-summary">
        {total === 0 ? 'Nothing planned yet.' : `${done} of ${total} done`}
        {load.total > 0 && ` · Planned ${formatMinutes(load.total)}`}
      </p>
      {load.total > OVERLOAD_MINUTES && (
        <p className="day-warning">
          ⚠ Over {formatMinutes(OVERLOAD_MINUTES)} planned. Maybe move something to another day.
        </p>
      )}
      {load.overlaps.map(([a, b]) => (
        <p key={`${a.id}-${b.id}`} className="day-warning">
          ⚠ {a.title} ({showTime(a.time)}–{showTime(endTime(a.time, a.duration))}) overlaps {b.title} ({showTime(b.time)})
        </p>
      ))}

      <form className="goal-form" onSubmit={submit}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={`Add a task for ${dayLabel(dateKey).toLowerCase()}…`}
          aria-label="New task"
        />
        <TimePicker value={time} onChange={setTime} label="Time" />
        <div className="row">
          <select value={parentId} onChange={e => setParentId(e.target.value)} aria-label="Goal">
            <option value="">No goal</option>
            {biggerGoals(goals, 'day').map(g => (
              <option key={g.id} value={g.id}>
                {g.title} ({labelOf(g.timeframe)})
              </option>
            ))}
          </select>
        </div>
        <TaskExtrasFields value={extras} onChange={setExtras} />
        <button type="submit">Add</button>
      </form>

      {total > 0 && <DayList dateKey={dateKey} goals={goals} items={items} apply={apply} />}
    </div>
  )
}

export default DayPage
