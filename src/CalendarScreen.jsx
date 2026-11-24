import { useState } from 'react'
import GearButton from './GearButton.jsx'
import { activeGoals } from './progress.js'
import { addDaysKey, endTime, mondayOf, parseKey, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import { showTime } from './settings.js'
import TimePicker from './TimePicker.jsx'
import { addGoal, toggleGoal } from './goalActions.js'
import { addRoutine } from './routineActions.js'
import { EVERY_DAY, WEEKDAYS } from './repeat.js'
import { planWeek, weekTitle } from './calendarPlan.js'
import { clockOf, doneWeek } from './calendarDone.js'
import { loadProjects, loadSessions } from './workLog.js'
import { durationText } from './workTimer.js'
import './Calendar.css'

// The two views of the tab: what we will do, and what we did.
const VIEWS = [
  { value: 'plan', label: 'Plan' },
  { value: 'done', label: 'Done' },
]

// "09:00–09:30", "09:00", "45m" or "" for one entry.
function timeText(entry) {
  const { time, goal } = entry
  if (time && goal.duration) return `${showTime(time)}–${showTime(endTime(time, goal.duration))}`
  if (time) return showTime(time)
  return ''
}

// One activity, folded: time, color dot, title (one line).
function Line({ entry, goals }) {
  const { goal, done, habit } = entry
  return (
    <li className={done ? 'cal-line done' : 'cal-line'}>
      <span className="cal-line-time">{timeText(entry)}</span>
      <span className="goal-dot" style={{ background: colorOf(goals, goal) }} />
      <span className="cal-line-title">
        {goal.title}
        {habit && ' ↻'}
      </span>
    </li>
  )
}

// One activity, opened: its own little card with the details.
function Detail({ entry, goals, onToggle }) {
  const { goal, done, habit } = entry
  const color = colorOf(goals, goal)
  return (
    <li className={done ? 'cal-detail done' : 'cal-detail'} style={{ borderLeftColor: color }}>
      <div className="cal-detail-top">
        <span className="cal-detail-time">{timeText(entry) || 'Any time'}</span>
        {/* Tick box: marks the task done (habits only on their own day). */}
        {onToggle ? (
          <input
            type="checkbox"
            className="cal-tick"
            checked={done}
            onChange={onToggle}
            aria-label={`Mark "${goal.title}" as done`}
          />
        ) : (
          <span className="goal-meta">{done ? '✓ Done' : ''}</span>
        )}
      </div>
      <a href={`#goal/${goal.id}`} className="goal-link cal-detail-title">
        {goal.title}
        {habit && ' ↻'}
      </a>
    </li>
  )
}

// The small "add task" form inside an opened day card.
// It makes a normal Day goal with this day's date, like the Day page does.
function AddTaskForm({ dateKey, items, apply, onClose }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  // Repeat is a tick: when on, pick the weekdays (all seven to begin with).
  const [repeat, setRepeat] = useState(false)
  const [days, setDays] = useState(EVERY_DAY)
  // Top: show this task first on its day.
  const [pinned, setPinned] = useState(false)

  function toggleDay(day) {
    setDays(days.includes(day) ? days.filter(d => d !== day) : [...days, day])
  }

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    if (!repeat) {
      apply(addGoal(items, title.trim(), 'day', [], '', { date: dateKey, time, pinned }))
    } else {
      if (days.length === 0) return
      // A repeating task: it shows on every chosen weekday from now on.
      apply(addRoutine(items, title.trim(), { days, time, pinned }))
    }
    // Keep the form open for the next task; just empty it.
    setTitle('')
    setTime('')
    setRepeat(false)
    setPinned(false)
    setDays(EVERY_DAY)
  }

  return (
    <form className="goal-form cal-add-form" onSubmit={submit}>
      {/* Row 1: the task name, with a small time box on its right. */}
      <div className="cal-add-top">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New task…"
          aria-label="New task"
          autoFocus
        />
        <div className="cal-add-time">
          <TimePicker value={time} onChange={setTime} label="Time" placeholder="Time" />
        </div>
      </div>
      {/* Row 2: a tick for repeating; the weekdays slide in when it is on. */}
      <div className="cal-add-repeat">
        <label className={repeat ? 'repeat-pill on' : 'repeat-pill'}>
          <input type="checkbox" checked={repeat} onChange={e => setRepeat(e.target.checked)} />
          <span aria-hidden="true">↻</span> Repeat
        </label>
        <label className={pinned ? 'repeat-pill on' : 'repeat-pill'}>
          <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
          <span aria-hidden="true">▲</span> Top
        </label>
        {repeat && (
          <div className="day-picker">
            {WEEKDAYS.map(d => (
              <label key={d.value} className={days.includes(d.value) ? 'day on' : 'day'}>
                <input type="checkbox" checked={days.includes(d.value)} onChange={() => toggleDay(d.value)} aria-label={d.short} />
                {d.short}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="row">
        <button type="button" className="secondary" onClick={onClose}>
          Close
        </button>
        <button type="submit">Add</button>
      </div>
    </form>
  )
}

// One day card. Tap the header to open or fold it.
function DayCard({ day, goals, items, apply, open, onToggle, isToday }) {
  // The add form is folded until you tap "＋ Add task".
  const [adding, setAdding] = useState(false)
  const date = parseKey(day.key)
  const count = day.entries.length
  return (
    <section className={`cal-day ${isToday ? 'today' : ''} ${count === 0 ? 'empty-day' : ''}`}>
      <button type="button" className="cal-day-head" aria-expanded={open} onClick={onToggle}>
        <span className="cal-date">
          <strong>{date.getDate()}</strong>
          <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
        </span>
        <span className="cal-day-title">
          {isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'long' })}
          <span className="goal-meta">
            {count === 0 ? 'Nothing planned' : `${count} planned`}
          </span>
        </span>
        <span className="cal-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {/* Folded: one short line per activity. Opened: a card per activity. */}
      {count > 0 && !open && (
        <ul className="cal-lines">
          {day.entries.map(e => (
            <Line key={e.goal.id} entry={e} goals={goals} />
          ))}
        </ul>
      )}
      {open && (
        <div className="cal-open">
          {count > 0 && (
            <ul className="cal-details">
              {day.entries.map(e => (
                <Detail
                  key={e.goal.id}
                  entry={e}
                  goals={goals}
                  onToggle={e.habit && !isToday ? null : () => apply(toggleGoal(items, e.goal.id))}
                />
              ))}
            </ul>
          )}
          {adding ? (
            <AddTaskForm
              dateKey={day.key}
              items={items}
              apply={apply}
              onClose={() => setAdding(false)}
            />
          ) : (
            <button type="button" className="secondary add-toggle" onClick={() => setAdding(true)}>
              ＋ Add task
            </button>
          )}
          <a href={`#day/${day.key}`} className="cal-day-link">
            Open day
          </a>
        </div>
      )}
    </section>
  )
}

// One line of the Done view: time range, name, focus time.
function DoneLine({ item, goals }) {
  const { kind, startedAt, endedAt, name, focusMs, goal } = item
  const color = goal ? colorOf(goals, goal) : item.color
  let when
  if (kind === 'task') {
    // A task has only the moment it was ticked (habits have none).
    when = Number.isFinite(startedAt) ? showTime(clockOf(startedAt)) : ''
  } else {
    when = `${showTime(clockOf(startedAt))}–${showTime(clockOf(endedAt || startedAt))}`
  }
  return (
    <li className="cal-line cal-done-line">
      <span className="cal-line-time">{when}</span>
      <span className="goal-dot" style={{ background: color }} />
      <span className="cal-line-title">
        {kind === 'task' ? '✓ ' : ''}
        {name}
      </span>
      <span className="cal-line-focus goal-meta">{kind === 'task' ? '' : durationText(focusMs)}</span>
    </li>
  )
}

// One day card of the Done view. Same look as the Plan card.
function DoneCard({ day, goals, open, onToggle, isToday }) {
  const date = parseKey(day.key)
  const count = day.items.length
  const focus = day.items.reduce((sum, i) => sum + i.focusMs, 0)
  return (
    <section className={`cal-day ${isToday ? 'today' : ''} ${count === 0 ? 'empty-day' : ''}`}>
      <button type="button" className="cal-day-head" aria-expanded={open} onClick={onToggle}>
        <span className="cal-date">
          <strong>{date.getDate()}</strong>
          <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
        </span>
        <span className="cal-day-title">
          {isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'long' })}
          <span className="goal-meta">
            {count === 0 ? 'Nothing logged' : focus > 0 ? `${durationText(focus)} focused` : `${count} done`}
          </span>
        </span>
        <span className="cal-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {/* Folded and opened show the same lines; opened adds some space. */}
      {count > 0 && (
        <ul className={open ? 'cal-lines open' : 'cal-lines'}>
          {day.items.map(i => (
            <DoneLine key={i.id} item={i} goals={goals} />
          ))}
        </ul>
      )}
    </section>
  )
}

// The Calendar tab. Plan: the week as day cards, only what is planned,
// in time order. Done: what you did (comes in a later step).
function CalendarScreen({ items, apply, onGear }) {
  const [view, setView] = useState('plan')
  const [monday, setMonday] = useState(() => mondayOf(todayKey()))
  // Which days are opened. Today starts opened.
  const [opened, setOpened] = useState(() => new Set([todayKey()]))

  const today = todayKey()
  const goals = activeGoals(items)
  const week = planWeek(goals, monday)
  // Done view: read the saved Work sessions each time it draws (cheap).
  const doneDays = view === 'done' ? doneWeek(loadSessions(), loadProjects(), goals, monday) : []
  const isThisWeek = monday === mondayOf(today)

  function toggle(key) {
    setOpened(previous => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="app">
      <div className="tab-head">
        <h1>Calendar</h1>
        <GearButton onClick={onGear} />
      </div>

      <a href="#routines" className="cal-routines-link">
        Routines ↻
      </a>

      <div className="tabs">
        {VIEWS.map(v => (
          <button
            key={v.value}
            type="button"
            className={view === v.value ? 'tab active' : 'tab'}
            aria-pressed={view === v.value}
            onClick={() => setView(v.value)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <>
          <div className="day-nav">
            <button type="button" className="icon-button" onClick={() => setMonday(addDaysKey(monday, -7))} aria-label="Previous week">
              ←
            </button>
            <div className="day-nav-title">
              <h2 className="cal-week-title">{weekTitle(monday, parseKey)}</h2>
              {!isThisWeek && (
                <button type="button" className="back today-link" onClick={() => setMonday(mondayOf(today))}>
                  Back to this week
                </button>
              )}
            </div>
            <button type="button" className="icon-button" onClick={() => setMonday(addDaysKey(monday, 7))} aria-label="Next week">
              →
            </button>
          </div>

          <div className="cal-week">
            {view === 'done'
              ? doneDays.map(day => (
                  <DoneCard
                    key={day.key}
                    day={day}
                    goals={goals}
                    open={opened.has(day.key)}
                    onToggle={() => toggle(day.key)}
                    isToday={day.key === today}
                  />
                ))
              : week.map(day => (
              <DayCard
                key={day.key}
                day={day}
                goals={goals}
                items={items}
                apply={apply}
                open={opened.has(day.key)}
                onToggle={() => toggle(day.key)}
                isToday={day.key === today}
              />
            ))}
          </div>
        </>
    </div>
  )
}

export default CalendarScreen
