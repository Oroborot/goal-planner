import { useState } from 'react'
import BackLink from './BackLink.jsx'
import TimePicker from './TimePicker.jsx'
import DayPick from './DayPick.jsx'
import { addRoutine, repeatDays, routinesOf, setRoutinePaused, updateRoutine } from './routineActions.js'
import { deleteGoal } from './goalActions.js'
import { repeatLabel } from './repeat.js'
import { showTime } from './settings.js'

// A routine as a pick: every day, or certain days.
const pickOf = routine => ({
  mode: routine.repeat.days.length === 7 ? 'daily' : 'days',
  days: routine.repeat.days,
})

// The form for a new routine, or for editing one.
function RoutineForm({ start, onSave, onClose, saveLabel }) {
  const [title, setTitle] = useState(start.title)
  const [time, setTime] = useState(start.time)
  const [pick, setPick] = useState(start.pick)
  const days = repeatDays(pick)
  function submit(e) {
    e.preventDefault()
    if (!title.trim() || days.length === 0) return
    onSave({ title, time, days })
  }
  return (
    <form className="goal-form" onSubmit={submit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Routine name…" aria-label="Routine name" autoFocus />
      <TimePicker value={time} onChange={setTime} label="Time" />
      <DayPick value={pick} onChange={setPick} allowNone={false} />
      <div className="row">
        <button type="button" className="secondary" onClick={onClose}>
          Close
        </button>
        <button type="submit">{saveLabel}</button>
      </div>
    </form>
  )
}

// One row of the library: name, days and time, On/Off switch, Edit.
function Row({ routine, items, apply }) {
  const [editing, setEditing] = useState(false)
  const on = !routine.paused
  return (
    <li className={on ? 'routine-row' : 'routine-row off'}>
      <div className="routine-main">
        <div className="routine-text">
          <strong>{routine.title}</strong>
          <span className="goal-meta">
            {repeatLabel(routine)}
            {routine.time ? ` · ${showTime(routine.time)}` : ''}
          </span>
        </div>
        <label className="routine-switch">
          <input
            type="checkbox"
            checked={on}
            onChange={() => apply(setRoutinePaused(items, routine.id, on))}
            aria-label={`${routine.title}: ${on ? 'On' : 'Off'}`}
          />
          <span>{on ? 'On' : 'Off'}</span>
        </label>
      </div>
      {editing ? (
        <>
          <RoutineForm
            start={{ title: routine.title, time: routine.time || '', pick: pickOf(routine) }}
            saveLabel="Save"
            onClose={() => setEditing(false)}
            onSave={changes => {
              apply(updateRoutine(items, routine.id, changes))
              setEditing(false)
            }}
          />
          <button
            type="button"
            className="secondary"
            onClick={() => {
              if (window.confirm(`Delete "${routine.title}"?`)) apply(deleteGoal(items, routine.id))
            }}
          >
            Delete
          </button>
        </>
      ) : (
        <button type="button" className="secondary" onClick={() => setEditing(true)}>
          Edit
        </button>
      )}
    </li>
  )
}

// The Routines library: every repeating task, even old ones. Switch the ones
// you want On; Off ones stay here and hide from the calendar.
function RoutinesScreen({ items, apply }) {
  const [adding, setAdding] = useState(false)
  // On ones first, then by name.
  const routines = routinesOf(items).sort(
    (a, b) => Number(Boolean(a.paused)) - Number(Boolean(b.paused)) || a.title.localeCompare(b.title),
  )
  return (
    <div className="app">
      <BackLink fallback="#calendar" />
      <h1>Routines</h1>
      <p className="goal-meta">Repeating tasks. On ones show on the calendar. Off ones wait here until you want them back.</p>

      {adding ? (
        <RoutineForm
          start={{ title: '', time: '', pick: { mode: 'daily', days: [1, 2, 3, 4, 5] } }}
          saveLabel="Add"
          onClose={() => setAdding(false)}
          onSave={({ title, time, days }) => {
            apply(addRoutine(items, title.trim(), { days, time }))
            setAdding(false)
          }}
        />
      ) : (
        <button type="button" className="secondary add-toggle" onClick={() => setAdding(true)}>
          ＋ New routine
        </button>
      )}

      {routines.length === 0 ? (
        <p className="empty">No routines yet.</p>
      ) : (
        <ul className="routine-list">
          {routines.map(r => (
            <Row key={r.id} routine={r} items={items} apply={apply} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default RoutinesScreen
