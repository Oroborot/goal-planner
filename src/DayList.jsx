import { toggleGoal } from './goalActions.js'
import { dayLabel, endTime, formatMinutes, habitsOn, tasksOn, todayKey } from './calendar.js'
import { ImportanceIcon } from './TaskExtras.jsx'
import { colorOf } from './colors.js'

// One row: tick box (or a mark), time, color dot and title.
function Row({ goal, goals, time, done, onToggle, label }) {
  return (
    <li className={done ? 'done' : ''}>
      {onToggle ? (
        <input type="checkbox" checked={done} onChange={onToggle} aria-label={label} />
      ) : (
        <span className="habit-mark" aria-label={done ? 'Done' : 'Not done'}>
          {done ? '✓' : '·'}
        </span>
      )}
      <span className="day-time">
        {time}
        {goal.duration && (
          <span className="day-duration">
            {goal.time ? `–${endTime(goal.time, goal.duration)}` : formatMinutes(goal.duration)}
          </span>
        )}
      </span>
      <div className="goal-text">
        <a href={`#goal/${goal.id}`} className="goal-title goal-link">
          <span className="goal-dot" style={{ background: colorOf(goals, goal) }} />
          {goal.title}
          <ImportanceIcon importance={goal.importance} color={colorOf(goals, goal)} />
        </a>
        {goal.plannedDate && (
          <span className="goal-meta">Done early · planned for {dayLabel(goal.plannedDate)}</span>
        )}
        {goal.skippedFrom && !goal.done && (
          <span className="goal-meta">Skipped from {dayLabel(goal.skippedFrom)}</span>
        )}
      </div>
    </li>
  )
}

// The tasks and habits of one day, used by both the Day and Week pages.
// Tasks can be ticked any day; habits only today (they're ticked per day).
function DayList({ dateKey, goals, items, apply, compact = false }) {
  const tasks = tasksOn(goals, dateKey)
  const habits = habitsOn(goals, dateKey)
  const isToday = dateKey === todayKey()

  if (tasks.length === 0 && habits.length === 0) {
    return <p className="empty">Nothing planned.</p>
  }

  return (
    <>
      {tasks.length > 0 && (
        <ul className={compact ? 'day-list compact' : 'day-list'}>
          {tasks.map(task => (
            <Row
              key={task.id}
              goal={task}
              goals={goals}
              time={task.time || ''}
              done={task.done}
              onToggle={() => apply(toggleGoal(items, task.id))}
              label={`Mark "${task.title}" as done`}
            />
          ))}
        </ul>
      )}
      {habits.length > 0 && (
        <>
          {!compact && <h2>Habits</h2>}
          <ul className={compact ? 'day-list compact' : 'day-list'}>
            {habits.map(habit => (
              <Row
                key={habit.id}
                goal={habit}
                goals={goals}
                time="↻"
                done={habit.doneDates.includes(dateKey)}
                onToggle={isToday ? () => apply(toggleGoal(items, habit.id)) : null}
                label={`Mark "${habit.title}" as done today`}
              />
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default DayList
