import { useState } from 'react'
import { useNow } from './useNow.js'
import { elapsedMs, formatClock, formatDuration, remainingMs, timeTotals } from './timer.js'

// The "Timer" section on a goal or note-task page.
// Start counting up (how long I worked) or down (time left), see the
// running clock, and the total time spent on this item so far.
function TimerPanel({ item, timer, events, controls }) {
  // Countdown length, as minutes plus seconds (e.g. 0 min 30 sec).
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const countdownSeconds = minutes * 60 + seconds
  const mine = timer?.itemId === item.id
  const now = useNow(mine && !timer.pausedAt)
  const totals = timeTotals(events, item.id)

  let body
  if (mine) {
    const isDown = timer.mode === 'down'
    const shown = isDown ? remainingMs(timer, now) : elapsedMs(timer, now)
    body = (
      <>
        <p className="timer-clock">{formatClock(shown)}</p>
        <p className="goal-meta">
          {isDown ? 'Time left' : 'Time worked'}
          {timer.pausedAt && ' · paused'}
        </p>
        <div className="row page-actions">
          {timer.pausedAt ? (
            <button type="button" className="secondary" onClick={controls.resume}>
              ▶ Resume
            </button>
          ) : (
            <button type="button" className="secondary" onClick={controls.pause}>
              ⏸ Pause
            </button>
          )}
          <button type="button" onClick={controls.stop}>
            ■ Stop and save
          </button>
        </div>
        <button type="button" className="secondary full" onClick={controls.cancel}>
          Cancel (don't save)
        </button>
      </>
    )
  } else if (timer) {
    body = (
      <p className="empty">
        A timer is already running for “{timer.title}”. Stop it first, from the bar at the top.
      </p>
    )
  } else {
    body = (
      <div className="goal-form">
        <button type="button" onClick={() => controls.start(item, 'up')}>
          ▶ Count up
        </button>
        <div className="row target-row">
          <input
            type="number"
            min="0"
            max="600"
            value={minutes}
            onChange={e => setMinutes(Math.min(600, Math.max(0, Number(e.target.value) || 0)))}
            aria-label="Countdown minutes"
          />
          <span>min</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={e => setSeconds(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
            aria-label="Countdown seconds"
          />
          <span>sec</span>
          <button
            type="button"
            disabled={countdownSeconds === 0}
            onClick={() => controls.start(item, 'down', countdownSeconds)}
            aria-label="Start countdown"
          >
            ▶ Start
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="timer-panel">
      <h2>Timer</h2>
      {body}
      <p className="goal-meta">
        Total time: {formatDuration(totals.seconds)} · {totals.sessions} session
        {totals.sessions === 1 ? '' : 's'}
      </p>
    </section>
  )
}

export default TimerPanel
