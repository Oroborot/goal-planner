import { activeGoals } from './progress.js'
import { toggleGoal } from './goalActions.js'
import { isDoneNow } from './repeat.js'
import { colorOf } from './colors.js'
import { canGoBack } from './navHistory.js'
import BackLink from './BackLink.jsx'
import TimerPanel from './TimerPanel.jsx'

// Focus mode: one task fills the screen with its "why" and the timer.
// Calm and simple for now; visuals and sounds come with the design pass
// (see "Focus mode" in DESIGN-IDEAS.md).
function FocusPage({ goalId, items, events, apply, timer, timerControls }) {
  const goals = activeGoals(items)
  const task = goals.find(g => g.id === goalId)

  if (!task) {
    return (
      <div className="app">
        <BackLink fallback="#day" />
        <p className="empty">This task doesn't exist.</p>
      </div>
    )
  }

  const done = isDoneNow(task)

  // Done: tick it (if it isn't yet) and return to where you came from.
  function finish() {
    if (!done) apply(toggleGoal(items, task.id))
    if (canGoBack()) window.history.back()
    else window.location.assign('#day')
  }

  return (
    <div className="app focus">
      <BackLink fallback="#day" />
      <div className="focus-card">
        <span className="goal-dot big" style={{ background: colorOf(goals, task) }} />
        <h1>{task.title}</h1>
        {task.why ? (
          <p className="focus-why">{task.why}</p>
        ) : (
          <a href={`#goal/${task.id}`} className="focus-why muted">
            No "why" yet. Add one on its page.
          </a>
        )}
      </div>

      <TimerPanel item={task} timer={timer} events={events} controls={timerControls} />

      <button type="button" className="focus-done" onClick={finish}>
        {done ? 'Already done · Back' : '✓ Done'}
      </button>
    </div>
  )
}

export default FocusPage
