import { useState } from 'react'
import { TIMEFRAMES, labelOf, biggerGoals, smallerGoals } from './timeframes.js'
import { EVERY_DAY } from './repeat.js'
import WhenFields from './WhenFields.jsx'
import { TaskExtrasFields } from './TaskExtras.jsx'
import RepeatFields from './RepeatFields.jsx'
import ColorPicker from './ColorPicker.jsx'
import { colorOf } from './colors.js'

// A list of goals with a checkbox each, used for linking.
// `checkedIds` are the ticked ones; `onToggle(id)` ticks or unticks one.
function LinkList({ legend, goals, checkedIds, onToggle, emptyText }) {
  return (
    <fieldset className="link-list">
      <legend>{legend}</legend>
      {goals.length === 0 ? (
        <p className="link-empty">{emptyText}</p>
      ) : (
        goals.map(g => (
          <label key={g.id}>
            <input
              type="checkbox"
              checked={checkedIds.includes(g.id)}
              onChange={() => onToggle(g.id)}
              aria-label={`${legend}: ${g.title}`}
            />
            <span>
              {g.title} <span className="link-timeframe">({labelOf(g.timeframe)})</span>
            </span>
          </label>
        ))
      )}
    </fieldset>
  )
}

// Add `id` to the list if it's missing, or take it out if it's there.
function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
}

// The form shown in place of a goal while you edit it.
// It starts filled in with the goal's current values. Nothing is changed
// until you tap Save; Cancel throws the changes away.
// Links work both ways: tick the bigger goals this goal counts toward,
// and the smaller goals that sit under it.
function GoalEditForm({ goal, goals, onSave, onCancel }) {
  const [title, setTitle] = useState(goal.title)
  const [timeframe, setTimeframe] = useState(goal.timeframe)
  const [why, setWhy] = useState(goal.why || '')
  const [color, setColor] = useState(goal.color ?? null)
  const [extras, setExtras] = useState({
    importance: goal.importance || 0,
    duration: goal.duration || '',
  })
  const [parentIds, setParentIds] = useState(goal.parentIds)
  // The smaller goals that currently list this goal as a parent.
  const [childIds, setChildIds] = useState(
    goals.filter(g => g.parentIds.includes(goal.id)).map(g => g.id),
  )
  // Repeat settings, in the shape RepeatFields uses.
  const [repeat, setRepeat] = useState({
    mode: !goal.repeat ? 'none' : goal.repeat.days.length === 7 ? 'daily' : 'days',
    days: goal.repeat?.days ?? [1, 3, 5],
    per: goal.target?.per ?? 'day',
    times: goal.target?.times ?? 3,
  })
  const noDaysPicked = repeat.mode === 'days' && repeat.days.length === 0
  // Date and optional time, for one-time Day goals (calendar tasks).
  const [when, setWhen] = useState({ date: goal.date || '', time: goal.time || '', asap: Boolean(goal.asap) })
  const onCalendar = timeframe === 'day' && repeat.mode === 'none'

  const parentOptions = biggerGoals(goals, timeframe, goal.id)
  const childOptions = smallerGoals(goals, timeframe, goal.id)

  // A new timeframe changes which goals are bigger and smaller,
  // so drop any ticks that are no longer allowed.
  function changeTimeframe(value) {
    setTimeframe(value)
    const bigger = biggerGoals(goals, value, goal.id).map(g => g.id)
    const smaller = smallerGoals(goals, value, goal.id).map(g => g.id)
    setParentIds(parentIds.filter(id => bigger.includes(id)))
    setChildIds(childIds.filter(id => smaller.includes(id)))
  }

  function save(e) {
    e.preventDefault()
    if (!title.trim() || noDaysPicked) return
    const repeats = repeat.mode !== 'none'
    onSave(
      {
        title: title.trim(),
        timeframe,
        why: why.trim(),
        parentIds,
        color,
        date: onCalendar ? when.date || null : null,
        time: onCalendar && when.date ? when.time || null : null,
        asap: onCalendar && !when.date ? Boolean(when.asap) : false,
        importance: extras.importance,
        duration: timeframe === 'day' && extras.duration ? Number(extras.duration) : null,
        repeat: repeats ? { days: repeat.mode === 'daily' ? EVERY_DAY : repeat.days } : null,
        target: repeats
          ? { per: repeat.per, times: repeat.per === 'day' ? 1 : Number(repeat.times) || 1 }
          : null,
      },
      childIds,
    )
  }

  return (
    <form className="goal-form edit-form" onSubmit={save}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        aria-label="Goal"
        autoFocus
      />
      <select
        value={timeframe}
        onChange={e => changeTimeframe(e.target.value)}
        aria-label="Timeframe"
      >
        {TIMEFRAMES.map(t => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        value={why}
        onChange={e => setWhy(e.target.value)}
        placeholder="Why does this matter to you? (optional)"
        aria-label="Why"
      />
      <ColorPicker
        value={color}
        onChange={setColor}
        inherited={colorOf(goals, { ...goal, color: null, parentIds })}
      />
      <RepeatFields value={repeat} onChange={setRepeat} />
      {onCalendar && <WhenFields when={when} onChange={setWhen} />}
      <TaskExtrasFields value={extras} onChange={setExtras} showDuration={timeframe === 'day'} />
      <LinkList
        legend="Counts toward"
        goals={parentOptions}
        checkedIds={parentIds}
        onToggle={id => setParentIds(toggleId(parentIds, id))}
        emptyText="No bigger goals yet."
      />
      <LinkList
        legend="Smaller goals under this"
        goals={childOptions}
        checkedIds={childIds}
        onToggle={id => setChildIds(toggleId(childIds, id))}
        emptyText={
          timeframe === 'day' ? 'Day is the smallest timeframe.' : 'No smaller goals yet.'
        }
      />
      <div className="row">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={!title.trim() || noDaysPicked}>
          Save
        </button>
      </div>
    </form>
  )
}

export default GoalEditForm
