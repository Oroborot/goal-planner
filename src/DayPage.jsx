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
import DayTimeline from './DayTimeline.jsx'

// Where the List / Timeline choice is remembered.
const VIEW_KEY = 'planner-day-view'
import { showTime } from './settings.js'
import { biggerGoals, labelOf } from './timeframes.js'
import DayList from './DayList.jsx'
import ViewSwitch from './ViewSwitch.jsx'
import NowBox from './NowBox.jsx'
import Leftovers from './Leftovers.jsx'
import { dayRecord, EVENING_HOUR } from './routine.js'

// On Today: "☀ Plan your day" in the morning, "🌙 Wrap up" from 17:00,
// until you've done it. Both are also in the side menu any time.
function RoutineCard({ items, today }) {
  const record = dayRecord(items, today)
  const evening = new Date().getHours() >= EVENING_HOUR
  if (evening ? record.wrappedAt : record.plannedAt) return null
  return (
    <a href={evening ? '#wrapup' : '#plan'} className="routine-start">
      <span>{evening ? '🌙 Wrap up your day' : '☀ Plan your day'}</span>
      <span className="goal-meta">{evening ? 'Review, move leftovers, rate energy' : 'Leftovers, top 3, check the load'} →</span>
    </a>
  )
}
import BackLink from './BackLink.jsx'

// One day of the calendar: the tasks planned for it (Day goals with that
// date) and the habits planned for that weekday. ← → move day by day.
function DayPage({ dateKey, items, apply }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [parentId, setParentId] = useState('')
  const [extras, setExtras] = useState({ importance: 0, duration: '' })
  // The add form is folded until you open it.
  const [adding, setAdding] = useState(false)
  // List or Timeline, remembered on this device.
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) || 'list'
    } catch {
      return 'list'
    }
  })
  function changeView(next) {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Not saved; the switch still works for now.
    }
  }

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

      {dateKey === today && <RoutineCard items={items} today={today} />}
      {dateKey === today && <Leftovers goals={goals} items={items} apply={apply} />}
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

      {/* The add form stays folded until you tap "＋ Add a task". */}
      {!adding ? (
        <button type="button" className="secondary add-toggle" onClick={() => setAdding(true)}>
          ＋ Add a task for {dayLabel(dateKey).toLowerCase()}
        </button>
      ) : (
      <form className="goal-form" onSubmit={submit}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={`Add a task for ${dayLabel(dateKey).toLowerCase()}…`}
          aria-label="New task"
          autoFocus
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
        <div className="row">
          <button type="button" className="secondary" onClick={() => setAdding(false)}>
            Close
          </button>
          <button type="submit">Add</button>
        </div>
      </form>
      )}

      <div className="tabs day-view-switch">
        {[
          { value: 'list', label: 'List' },
          { value: 'timeline', label: 'Timeline' },
        ].map(v => (
          <button
            key={v.value}
            type="button"
            className={view === v.value ? 'tab active' : 'tab'}
            aria-pressed={view === v.value}
            onClick={() => changeView(v.value)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'timeline' ? (
        <DayTimeline dateKey={dateKey} goals={goals} items={items} apply={apply} />
      ) : (
        total > 0 && <DayList dateKey={dateKey} goals={goals} items={items} apply={apply} />
      )}
    </div>
  )
}

export default DayPage
