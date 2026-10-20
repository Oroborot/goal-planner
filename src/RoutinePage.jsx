import { useState } from 'react'
import BackLink from './BackLink.jsx'
import DayList from './DayList.jsx'
import MoveMenu from './MoveMenu.jsx'
import TimePicker from './TimePicker.jsx'
import { activeGoals } from './progress.js'
import { addGoal, deleteGoal, moveToDay } from './goalActions.js'
import {
  addDaysKey,
  dayEntries,
  dayLabel,
  dayLoad,
  formatMinutes,
  leftovers,
  OVERLOAD_MINUTES,
  todayKey,
} from './calendar.js'
import { dayRecord, finishPlan, finishWrapUp, setEnergy, toggleTop, TOP_COUNT } from './routine.js'
import { shortDuration, timeByDay } from './stats.js'

// One task with a few buttons on the right, and the Move menu under it.
function TaskRow({ goal, note, items, apply, children }) {
  const [moving, setMoving] = useState(false)
  return (
    <li className="routine-row">
      <div className="routine-row-main">
        <a href={`#goal/${goal.id}`} className="goal-link">
          {goal.title}
        </a>
        {note && <span className="goal-meta">{note}</span>}
      </div>
      <div className="routine-row-actions">
        {children}
        <button
          type="button"
          className="icon-button"
          onClick={() => setMoving(!moving)}
          aria-label={moving ? 'Close move' : `Move "${goal.title}" to another day`}
        >
          {moving ? '✕' : '↷'}
        </button>
      </div>
      {moving && <MoveMenu goal={goal} items={items} apply={apply} onDone={() => setMoving(false)} />}
    </li>
  )
}

// ── Morning ──

function LeftoversSection({ goals, items, apply, today }) {
  const list = leftovers(goals)
  if (list.length === 0) return <p className="empty">Nothing left from earlier. Clean start.</p>
  return (
    <ul className="routine-list">
      {list.map(g => (
        <TaskRow key={g.id} goal={g} note={dayLabel(g.date)} items={items} apply={apply}>
          <button type="button" className="secondary" onClick={() => apply(moveToDay(items, [g.id], today))}>
            Today
          </button>
          <button type="button" className="secondary" onClick={() => apply(deleteGoal(items, g.id))}>
            Drop
          </button>
        </TaskRow>
      ))}
    </ul>
  )
}

function TodaySection({ goals, items, apply, today }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  function add(e) {
    e.preventDefault()
    if (!title.trim()) return
    apply(addGoal(items, title.trim(), 'day', [], '', { date: today, time }))
    setTitle('')
    setTime('')
  }
  return (
    <>
      <DayList dateKey={today} goals={goals} items={items} apply={apply} />
      <form className="goal-form routine-add" onSubmit={add}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a task for today…" aria-label="New task" />
        <TimePicker value={time} onChange={setTime} label="Time" />
        <button type="submit">Add</button>
      </form>
    </>
  )
}

function TopSection({ goals, items, apply, today }) {
  const top = dayRecord(items, today).top
  const open = dayEntries(goals, today).filter(e => !e.done)
  if (open.length === 0) return <p className="empty">Nothing open today to pick from.</p>
  return (
    <>
      <p className="goal-meta">
        {top.length} of {TOP_COUNT} picked. These come first in the Now box.
      </p>
      <ul className="routine-list">
        {open.map(({ goal }) => {
          const starred = top.includes(goal.id)
          return (
            <li key={goal.id} className="routine-row">
              <button
                type="button"
                className={starred ? 'star-button on' : 'star-button'}
                onClick={() => apply(toggleTop(items, today, goal.id))}
                aria-pressed={starred}
                aria-label={starred ? `Un-star "${goal.title}"` : `Star "${goal.title}" as a top task`}
              >
                <span className="routine-row-main">{goal.title}</span>
                <span className="star">{starred ? '★' : '☆'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function LoadSection({ goals, items, today }) {
  const load = dayLoad(goals, today)
  const top = dayRecord(items, today)
    .top.map(id => goals.find(g => g.id === id))
    .filter(Boolean)
  const tooMuch = load.total > OVERLOAD_MINUTES
  return (
    <>
      <p className="routine-big">{load.total > 0 ? formatMinutes(load.total) : 'No times set'}</p>
      <p className="goal-meta">
        {load.total > 0 ? (tooMuch ? 'planned · that is a lot, maybe move something' : 'planned · looks OK') : 'Add expected times to see your load.'}
      </p>
      {load.overlaps.length > 0 && <p className="day-warning">⚠ {load.overlaps.length} overlap(s) on today's list.</p>}
      {top.length > 0 && (
        <ul className="routine-list">
          {top.map(g => (
            <li key={g.id} className="routine-row">
              <span className="routine-row-main">★ {g.title}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// ── Evening ──

function DoneSection({ goals, events, today }) {
  const done = dayEntries(goals, today).filter(e => e.done)
  const seconds = timeByDay(events)[today] || 0
  return (
    <>
      <p className="routine-big">{done.length} done</p>
      {seconds > 0 && <p className="goal-meta">{shortDuration(seconds)} on the timer</p>}
      {done.length === 0 ? (
        <p className="empty">Nothing ticked today. Tomorrow is a new one.</p>
      ) : (
        <ul className="routine-list">
          {done.map(({ goal }) => (
            <li key={goal.id} className="routine-row">
              <span className="routine-row-main">✓ {goal.title}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function NotDoneSection({ goals, items, apply, today }) {
  const tomorrow = addDaysKey(today, 1)
  const open = dayEntries(goals, today).filter(e => !e.done && !e.habit)
  if (open.length === 0) return <p className="empty">Everything for today is done.</p>
  return (
    <ul className="routine-list">
      {open.map(({ goal }) => (
        <TaskRow key={goal.id} goal={goal} items={items} apply={apply}>
          <button type="button" className="secondary" onClick={() => apply(moveToDay(items, [goal.id], tomorrow))}>
            Tomorrow
          </button>
        </TaskRow>
      ))}
    </ul>
  )
}

function EnergySection({ items, apply, today }) {
  const record = dayRecord(items, today)
  return (
    <>
      <p className="goal-meta">Energy today (1 = drained, 5 = full of it)</p>
      <div className="energy-picker">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={record.energy === n ? 'tab active' : 'tab'}
            aria-pressed={record.energy === n}
            onClick={() => apply(setEnergy(items, today, n, record.note))}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        className="routine-note"
        value={record.note}
        onChange={e => apply(setEnergy(items, today, record.energy, e.target.value))}
        placeholder="How did it go? (optional)"
        aria-label="Note about today"
        rows={3}
      />
    </>
  )
}

function TomorrowSection({ goals, items, apply, today }) {
  const tomorrow = addDaysKey(today, 1)
  const load = dayLoad(goals, tomorrow)
  return (
    <>
      <DayList dateKey={tomorrow} goals={goals} items={items} apply={apply} compact />
      {load.total > 0 && <p className="goal-meta">{formatMinutes(load.total)} planned</p>}
    </>
  )
}

// The steps of each routine, in order.
const ROUTINES = {
  plan: {
    title: 'Plan your day',
    icon: '☀',
    finishLabel: 'Start the day',
    finish: finishPlan,
    steps: [
      { title: 'Left from earlier', Section: LeftoversSection },
      { title: "Today's list", Section: TodaySection },
      { title: `Pick your top ${TOP_COUNT}`, Section: TopSection },
      { title: 'Your day', Section: LoadSection },
    ],
  },
  wrapup: {
    title: 'Wrap up',
    icon: '🌙',
    finishLabel: 'Done, good night',
    finish: finishWrapUp,
    steps: [
      { title: 'What you got done', Section: DoneSection },
      { title: 'Not done yet', Section: NotDoneSection },
      { title: 'How did it go?', Section: EnergySection },
      { title: 'Tomorrow', Section: TomorrowSection },
    ],
  },
}

// Morning plan (#plan) and evening wrap-up (#wrapup), in two views:
// Stepped: one step per screen with Back / Next (Sunsama style).
// Compact: every step on one page (Things 3 / Todoist style).
function RoutinePage({ kind, items, events, apply, settings, onChangeSettings }) {
  const [step, setStep] = useState(0)
  const routine = ROUTINES[kind]
  const today = todayKey()
  const goals = activeGoals(items)
  const view = settings.routineView || 'stepped'
  const props = { goals, items, events, apply, today }

  function finish() {
    apply(routine.finish(items, today))
    window.location.hash = '#day'
  }

  const switcher = (
    <div className="tabs routine-view-switch">
      {[
        { value: 'stepped', label: 'Stepped' },
        { value: 'compact', label: 'Compact' },
      ].map(v => (
        <button
          key={v.value}
          type="button"
          className={view === v.value ? 'tab active' : 'tab'}
          aria-pressed={view === v.value}
          onClick={() => onChangeSettings({ ...settings, routineView: v.value })}
        >
          {v.label}
        </button>
      ))}
    </div>
  )

  if (view === 'compact') {
    return (
      <div className="app routine">
        <BackLink fallback="#day" />
        <h1>
          {routine.icon} {routine.title}
        </h1>
        {switcher}
        {routine.steps.map(({ title, Section }) => (
          <section key={title} className="routine-card">
            <h2>{title}</h2>
            <Section {...props} />
          </section>
        ))}
        <button type="button" className="routine-finish" onClick={finish}>
          {routine.finishLabel}
        </button>
      </div>
    )
  }

  const { title, Section } = routine.steps[step]
  const last = step === routine.steps.length - 1
  return (
    <div className="app routine">
      <BackLink fallback="#day" />
      <h1>
        {routine.icon} {routine.title}
      </h1>
      {switcher}
      <div className="routine-progress" aria-hidden="true">
        {routine.steps.map((s, i) => (
          <span key={s.title} className={i <= step ? 'on' : ''} />
        ))}
      </div>
      <p className="goal-meta">
        Step {step + 1} of {routine.steps.length}
      </p>
      <section className="routine-card">
        <h2>{title}</h2>
        <Section {...props} />
      </section>
      <div className="row routine-nav">
        {step > 0 && (
          <button type="button" className="secondary" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="button" onClick={last ? finish : () => setStep(step + 1)}>
          {last ? routine.finishLabel : 'Next'}
        </button>
      </div>
    </div>
  )
}

export default RoutinePage
