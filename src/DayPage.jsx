import { useState } from 'react'
import { activeGoals } from './progress.js'
import { addGoal, toggleGoal } from './goalActions.js'
import { addDaysKey, dayLabel, parseKey, todayKey } from './calendar.js'
import { isScheduled } from './repeat.js'
import { biggerGoals } from './timeframes.js'
import { colorOf } from './colors.js'
import { labelOf } from './timeframes.js'

// One day of the calendar: the tasks planned for it (Day goals with that
// date) and the habits planned for that weekday. ← → move day by day.
function DayPage({ dateKey, items, apply }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [parentId, setParentId] = useState('')

  const today = todayKey()
  const isToday = dateKey === today
  const day = parseKey(dateKey)
  const goals = activeGoals(items)

  // Tasks on this date: with a time first (earliest first), then the rest.
  const tasks = goals
    .filter(g => g.date === dateKey)
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      return a.createdAt.localeCompare(b.createdAt)
    })
  // Habits planned for this weekday (from the day they started repeating).
  const habits = goals.filter(
    g =>
      g.repeat &&
      isScheduled(g, day) &&
      dateKey >= (g.repeatSince || g.createdAt).slice(0, 10),
  )
  const doneCount =
    tasks.filter(t => t.done).length + habits.filter(h => h.doneDates.includes(dateKey)).length
  const total = tasks.length + habits.length

  function go(n) {
    window.location.hash = `#day/${addDaysKey(dateKey, n)}`
  }

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    apply(addGoal(items, title.trim(), 'day', parentId ? [parentId] : [], '', { date: dateKey, time }))
    setTitle('')
    setTime('')
  }

  return (
    <div className="app">
      <a href="#" className="back">
        ← Home
      </a>

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
      {!isToday && (
        <a href={`#day/${today}`} className="back today-link">
          Back to today
        </a>
      )}

      <p className="goal-meta day-summary">
        {total === 0 ? 'Nothing planned yet.' : `${doneCount} of ${total} done`}
      </p>

      <form className="goal-form" onSubmit={submit}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={`Add a task for ${dayLabel(dateKey).toLowerCase()}…`}
          aria-label="New task"
        />
        <div className="row">
          <input type="time" value={time} onChange={e => setTime(e.target.value)} aria-label="Time (optional)" />
          <select value={parentId} onChange={e => setParentId(e.target.value)} aria-label="Goal">
            <option value="">No goal</option>
            {biggerGoals(goals, 'day').map(g => (
              <option key={g.id} value={g.id}>
                {g.title} ({labelOf(g.timeframe)})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add</button>
      </form>

      {tasks.length > 0 && (
        <ul className="day-list">
          {tasks.map(task => (
            <li key={task.id} className={task.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => apply(toggleGoal(items, task.id))}
                aria-label={`Mark "${task.title}" as done`}
              />
              <span className="day-time">{task.time || ''}</span>
              <div className="goal-text">
                <a href={`#goal/${task.id}`} className="goal-title goal-link">
                  <span className="goal-dot" style={{ background: colorOf(goals, task) }} />
                  {task.title}
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {habits.length > 0 && (
        <>
          <h2>Habits</h2>
          <ul className="day-list">
            {habits.map(habit => {
              const done = habit.doneDates.includes(dateKey)
              return (
                <li key={habit.id} className={done ? 'done' : ''}>
                  {isToday ? (
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => apply(toggleGoal(items, habit.id))}
                      aria-label={`Mark "${habit.title}" as done today`}
                    />
                  ) : (
                    <span className="habit-mark" aria-label={done ? 'Done' : 'Not done'}>
                      {done ? '✓' : '·'}
                    </span>
                  )}
                  <span className="day-time">↻</span>
                  <div className="goal-text">
                    <a href={`#goal/${habit.id}`} className="goal-title goal-link">
                      <span className="goal-dot" style={{ background: colorOf(goals, habit) }} />
                      {habit.title}
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default DayPage
