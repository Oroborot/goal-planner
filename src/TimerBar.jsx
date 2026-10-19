import { useEffect } from 'react'
import { useNow } from './useNow.js'
import { elapsedMs, formatClock, remainingMs } from './timer.js'

// The small bar at the top of every screen while a timer runs, so it's
// never lost when you move around the app. Tap the title to go to its page.
function TimerBar({ timer, items, controls }) {
  const now = useNow(!timer.pausedAt)
  const isDown = timer.mode === 'down'
  const left = isDown ? remainingMs(timer, now) : null
  const shown = isDown ? left : elapsedMs(timer, now)

  // A countdown that reaches zero finishes by itself.
  useEffect(() => {
    if (isDown && left === 0) controls.finish()
  }, [isDown, left, controls])

  const item = items.find(i => i.id === timer.itemId)
  const href = item?.list === 'notes' ? `#note/${timer.itemId}` : `#goal/${timer.itemId}`

  return (
    <div className="timer-bar" role="timer">
      <a href={href} className="timer-bar-title">
        ⏱ {timer.title}
      </a>
      <span className="timer-bar-clock">
        {formatClock(shown)}
        {timer.pausedAt && ' ⏸'}
      </span>
      {timer.pausedAt ? (
        <button type="button" className="secondary" onClick={controls.resume}>
          Resume
        </button>
      ) : (
        <button type="button" className="secondary" onClick={controls.pause}>
          Pause
        </button>
      )}
      <button type="button" onClick={controls.stop}>
        Stop
      </button>
    </div>
  )
}

export default TimerBar
