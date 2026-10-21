import { useState } from 'react'
import { moveTask, toggleGoal } from './goalActions.js'
import { dayEntries, endTime, todayKey } from './calendar.js'
import { colorOf } from './colors.js'
import { showTime } from './settings.js'
import { ImportanceIcon } from './TaskExtras.jsx'

// Height of one hour on screen, and the block height for tasks without an
// expected time (they show as a short dashed block).
const HOUR_PX = 56
const PX_PER_MIN = HOUR_PX / 60
const NO_DURATION = 30
// How far ↑ ↓ move a task, and what dragging snaps to.
const STEP = 30
const SNAP = 15
// The hours shown at least; earlier or later tasks stretch the range.
const FIRST_HOUR = 6
const LAST_HOUR = 22

const toMin = t => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// The day as a timeline (a simple day calendar): hours down the left, tasks
// as blocks sized by their expected time, untimed ones in "Anytime" on top.
// Tap a block to show ⠿ (drag it up or down, snaps to 15 min) and ↑ ↓
// (30 minutes); chained items follow
// what they come after (they move with it).
function DayTimeline({ dateKey, goals, items, apply }) {
  // The block you tapped: it shows its ↑ ↓ buttons (others stay clean).
  const [selectedId, setSelectedId] = useState(null)
  // While dragging the ⠿ handle: { id, startY, minutes } (how far it moved).
  const [drag, setDrag] = useState(null)

  function startDrag(ev, id) {
    ev.preventDefault()
    ev.currentTarget.setPointerCapture(ev.pointerId)
    setDrag({ id, startY: ev.clientY, minutes: 0 })
  }
  function moveDrag(ev) {
    if (!drag) return
    const minutes = Math.round((ev.clientY - drag.startY) / PX_PER_MIN / SNAP) * SNAP
    if (minutes !== drag.minutes) setDrag({ ...drag, minutes })
  }
  function endDrag() {
    if (drag && drag.minutes !== 0) apply(moveTask(items, drag.id, drag.minutes))
    setDrag(null)
  }
  const entries = dayEntries(goals, dateKey)
  const isToday = dateKey === todayKey()
  const timed = entries.filter(e => e.time)
  const anytime = entries.filter(e => !e.time)

  // The hour range: 6–22, stretched to fit every timed task.
  let first = FIRST_HOUR
  let last = LAST_HOUR
  for (const e of timed) {
    const start = toMin(e.time)
    const end = start + (e.goal.duration || NO_DURATION)
    first = Math.min(first, Math.floor(start / 60))
    last = Math.max(last, Math.ceil(end / 60))
  }
  last = Math.min(24, last)
  const hours = Array.from({ length: last - first }, (_, i) => first + i)

  // Overlapping tasks sit side by side. Tasks that touch each other form a
  // group; inside a group each task gets the first free "lane", and the
  // group's width is split between its lanes. Tasks alone get full width.
  const sorted = timed
    .map(e => ({ ...e, start: toMin(e.time), end: toMin(e.time) + (e.goal.duration || NO_DURATION) }))
    .sort((a, b) => a.start - b.start)
  const placed = []
  let group = []
  let groupEnd = -1
  let laneEnds = []
  const closeGroup = () => {
    group.forEach(e => placed.push({ ...e, lanes: laneEnds.length }))
    group = []
    laneEnds = []
  }
  for (const e of sorted) {
    if (e.start >= groupEnd) closeGroup()
    let lane = laneEnds.findIndex(laneEnd => laneEnd <= e.start)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = e.end
    group.push({ ...e, lane })
    groupEnd = Math.max(groupEnd, e.end)
  }
  closeGroup()

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const showNow = isToday && nowMin >= first * 60 && nowMin <= last * 60

  const tick = e =>
    e.habit && !isToday ? undefined : () => apply(toggleGoal(items, e.goal.id))

  return (
    <div className="timeline-wrap">
      {anytime.length > 0 && (
        <div className="anytime">
          <span className="goal-meta">Anytime</span>
          {anytime.map(e => (
            <label key={e.goal.id} className={e.done ? 'anytime-chip done' : 'anytime-chip'}>
              <input
                type="checkbox"
                checked={e.done}
                disabled={!tick(e)}
                onChange={tick(e)}
                aria-label={`Mark "${e.goal.title}" as done`}
              />
              <span className="goal-dot" style={{ background: colorOf(goals, e.goal) }} />
              <a href={`#goal/${e.goal.id}`} className="goal-link">
                {e.goal.title}
                {e.habit && ' ↻'}
              </a>
            </label>
          ))}
        </div>
      )}

      <div className="timeline" style={{ height: hours.length * HOUR_PX }}>
        {hours.map(h => (
          <div key={h} className="timeline-hour" style={{ top: (h - first) * HOUR_PX }}>
            <span>{showTime(`${String(h).padStart(2, '0')}:00`)}</span>
          </div>
        ))}

        {showNow && (
          <div className="timeline-now" style={{ top: (nowMin - first * 60) * PX_PER_MIN }} aria-label="Now" />
        )}

        {placed.map(e => {
          const color = colorOf(goals, e.goal)
          const movable = !e.habit && !e.goal.after
          const height = Math.max(26, (e.end - e.start) * PX_PER_MIN - 2)
          const classes = ['timeline-block']
          if (e.done) classes.push('done')
          if (!e.goal.duration) classes.push('no-duration')
          if (e.goal.after) classes.push('chained')
          const selected = selectedId === e.goal.id
          if (selected) classes.push('selected')
          const offset = drag?.id === e.goal.id ? drag.minutes : 0
          if (offset) classes.push('dragging')
          return (
            <div
              key={e.goal.id}
              className={classes.join(' ')}
              onClick={ev => {
                // Taps on the tick box, title link or arrows do their own thing.
                if (ev.target.closest('input, a, button')) return
                setSelectedId(selected ? null : e.goal.id)
              }}
              style={{
                top: (e.start + offset - first * 60) * PX_PER_MIN + 1,
                height,
                left: `calc(3.6rem + (100% - 3.6rem) * ${e.lane / e.lanes})`,
                width: `calc((100% - 3.6rem) / ${e.lanes} - 4px)`,
                borderLeftColor: color,
              }}
            >
              <div className="timeline-block-main">
                <input
                  type="checkbox"
                  checked={e.done}
                  disabled={!tick(e)}
                  onChange={tick(e)}
                  aria-label={`Mark "${e.goal.title}" as done`}
                />
                <a href={`#goal/${e.goal.id}`} className="goal-link timeline-title">
                  {e.goal.after && '⛓ '}
                  {e.goal.title}
                  {e.habit && ' ↻'}
                  <ImportanceIcon importance={e.goal.importance} color={color} />
                </a>
              </div>
              {height > 34 && (
                <span className="timeline-time">
                  {showTime(offset ? endTime(e.time, offset) : e.time)}
                  {e.goal.duration && `–${showTime(endTime(e.time, e.goal.duration + offset))}`}
                </span>
              )}
              {movable && selected && (
                <span className="timeline-move">
                  <button
                    type="button"
                    className="timeline-drag"
                    onPointerDown={ev => startDrag(ev, e.goal.id)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={() => setDrag(null)}
                    aria-label={`Drag "${e.goal.title}" up or down`}
                  >
                    ⠿
                  </button>
                  <button
                    type="button"
                    onClick={() => apply(moveTask(items, e.goal.id, -STEP))}
                    aria-label={`Move "${e.goal.title}" 30 minutes earlier`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => apply(moveTask(items, e.goal.id, STEP))}
                    aria-label={`Move "${e.goal.title}" 30 minutes later`}
                  >
                    ↓
                  </button>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DayTimeline
