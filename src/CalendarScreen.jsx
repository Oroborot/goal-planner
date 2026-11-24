import { useState } from 'react'
import GearButton from './GearButton.jsx'
import { activeGoals } from './progress.js'
import { addDaysKey, endTime, formatMinutes, mondayOf, parseKey, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import { showTime } from './settings.js'
import { ImportanceIcon, TaskExtrasFields } from './TaskExtras.jsx'
import TimePicker from './TimePicker.jsx'
import { addGoal, toggleGoal } from './goalActions.js'
import { biggerGoals, labelOf } from './timeframes.js'
import { planWeek, weekTitle } from './calendarPlan.js'
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
  const feeds = goals.filter(g => goal.parentIds.includes(g.id)).map(g => g.title)
  const checklist = goal.checklist || []
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
        <ImportanceIcon importance={goal.importance} color={color} />
      </a>
      <div className="cal-detail-meta goal-meta">
        {goal.duration ? <span>⏱ {formatMinutes(goal.duration)}</span> : null}
        {checklist.length > 0 && (
          <span>
            ☑ {checklist.filter(c => c.done).length}/{checklist.length}
          </span>
        )}
        {feeds.length > 0 && <span>feeds {feeds.join(', ')}</span>}
      </div>
    </li>
  )
}

// The small "add task" form inside an opened day card.
// It makes a normal Day goal with this day's date, like the Day page does.
function AddTaskForm({ dateKey, goals, items, apply, onClose }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [parentId, setParentId] = useState('')
  const [extras, setExtras] = useState({ importance: 0, duration: '' })

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
    // Keep the form open for the next task; just empty it.
    setTitle('')
    setTime('')
    setExtras({ importance: 0, duration: '' })
  }

  return (
    <form className="goal-form cal-add-form" onSubmit={submit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="New task…"
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
  const done = day.entries.filter(e => e.done).length
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
            {count === 0
              ? 'Nothing planned'
              : `${done} of ${count} done${day.load > 0 ? ` · ${formatMinutes(day.load)}` : ''}`}
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
              goals={goals}
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

      {view === 'done' ? (
        <p className="empty">What you did (timed work and workouts) comes in the next step.</p>
      ) : (
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
            {week.map(day => (
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
      )}
    </div>
  )
}

export default CalendarScreen
