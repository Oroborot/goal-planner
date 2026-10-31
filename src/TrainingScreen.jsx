import { useEffect, useRef, useState } from 'react'
import AppIcon from './icons.jsx'
import GearButton from './GearButton.jsx'
import TimerCircle from './TimerCircle.jsx'
import { playBeep } from './sound.js'
import TrainingPanel from './TrainingPanel.jsx'
import { EXERCISES, WORKOUT } from './trainingData.js'
import {
  addTenSeconds,
  buildPeriods,
  catchUp,
  loadTraining,
  pauseTraining,
  resumeTraining,
  saveTraining,
  sessionClock,
  skipPeriod,
  splitClock,
  startTraining,
  trainingView,
} from './training.js'

// The workout's periods, worked out once from the mock data.
const PERIODS = buildPeriods(WORKOUT)
const TOTAL_ROUNDS = WORKOUT.rounds.length * WORKOUT.sets

// The small orange word above the numbers. Exercises have none.
const LABELS = { ready: 'Ready', rest: 'Rest', setRest: 'Set rest', done: 'Done' }

// The first exercise period at or after `from` (-1 when there's none left).
function nextExerciseAt(from) {
  for (let i = from; i < PERIODS.length; i++) if (PERIODS[i].kind === 'exercise') return i
  return -1
}

// An exercise's name, or "Freestyle" for a round without one.
function exerciseName(period) {
  return period.exerciseId ? EXERCISES[period.exerciseId].name : 'Freestyle'
}

// The Training tab: round and set counters, the session timer, the big
// circle timer, and the Pause / Skip / +10s buttons.
function TrainingScreen({ onGear }) {
  const [session, setSession] = useState(loadTraining)
  const [now, setNow] = useState(() => Date.now())
  // The session timer shows time spent (false) or time left (true).
  const [showLeft, setShowLeft] = useState(false)
  // The open bottom panel: { type: 'details' | 'variations', exerciseId } or null.
  const [panel, setPanel] = useState(null)
  // The latest session, readable right away inside the animation loop.
  const sessionRef = useRef(session)

  function change(next) {
    sessionRef.current = next
    setSession(next)
  }

  useEffect(() => saveTraining(session), [session])

  const running = Boolean(session) && !session.pausedAt && session.index < PERIODS.length

  // While running, redraw every frame (for the hundredths and the liquid).
  // Each frame also moves on to the next period when one runs out.
  useEffect(() => {
    if (!running) return
    let frame
    function tick() {
      const time = Date.now()
      const { session: next, ended } = catchUp(sessionRef.current, PERIODS, time)
      if (ended > 0) {
        sessionRef.current = next
        setSession(next)
        playBeep()
      }
      setNow(time)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  // Run a button's change on the up-to-date session.
  function act(update) {
    const time = Date.now()
    const current = catchUp(sessionRef.current, PERIODS, time).session
    change(update(current, time))
    setNow(time)
  }

  const current = catchUp(session, PERIODS, now).session
  const view = trainingView(current, PERIODS, now)
  const { status, period } = view
  const idle = status === 'ready' || status === 'done'

  // The cards show the exercise that's on now, or during a rest the one
  // that's coming up, plus the exercise after it.
  const index = status === 'ready' ? 0 : status === 'done' ? PERIODS.length - 1 : current.index
  const shownAt = nextExerciseAt(index)
  const shown = shownAt === -1 ? null : PERIODS[shownAt]
  const exercise = shown?.exerciseId ? EXERCISES[shown.exerciseId] : null
  const nextAt = shownAt === -1 ? -1 : nextExerciseAt(shownAt + 1)
  const variationCount = exercise?.variations.length || 0

  function primary() {
    if (idle) act((_, time) => startTraining(time))
    else if (status === 'paused') act(resumeTraining)
    else act(pauseTraining)
  }

  const sessionSeconds = showLeft
    ? Math.ceil((WORKOUT.sessionSeconds * 1000 - view.activeMs) / 1000)
    : Math.floor(view.activeMs / 1000)

  const label = idle ? LABELS[status] : LABELS[period.kind]
  const primaryButton = {
    ready: { icon: 'play', text: 'Start' },
    done: { icon: 'play', text: 'Again' },
    paused: { icon: 'play', text: 'Resume' },
    running: { icon: 'pause', text: 'Pause' },
  }[status]

  return (
    <div className="training">
      <header className="training-top">
        <div className="training-counts">
          <span>
            Round {period.round + 1} / {TOTAL_ROUNDS}
          </span>
          <span className="training-set">
            Set {period.set + 1} / {WORKOUT.sets}
          </span>
        </div>
        <div className="training-session">
          <span className="training-session-clock">{sessionClock(sessionSeconds)}</span>
          <button
            type="button"
            className="training-swap"
            onClick={() => setShowLeft(!showLeft)}
            aria-label={showLeft ? 'Show time spent' : 'Show time left'}
          >
            <AppIcon name="updown" size={20} />
          </button>
        </div>
        <GearButton onClick={onGear} />
      </header>

      <div className="training-circle-area">
        <TimerCircle
          fraction={view.remainingMs / view.totalMs}
          phase={view.activeMs / 700}
          label={label}
          clock={splitClock(view.remainingMs)}
        />
      </div>

      <div className="training-cards">
        <button type="button" className="training-card current" onClick={() => setPanel({ type: 'details', exerciseId: shown?.exerciseId })}>
          <span className="training-card-text">
            <strong>{shown ? exerciseName(shown) : 'Done'}</strong>
            <span>{nextAt === -1 ? 'Last exercise' : `Next: ${exerciseName(PERIODS[nextAt])}`}</span>
          </span>
          <AppIcon name="chevronUp" size={20} />
        </button>
        <button
          type="button"
          className="training-card"
          disabled={variationCount === 0}
          onClick={() => setPanel({ type: 'variations', exerciseId: shown?.exerciseId })}
        >
          <span className="training-card-text">
            <strong>Variations</strong>
            <span>{variationCount === 0 ? 'No options' : `${variationCount} ${variationCount === 1 ? 'option' : 'options'}`}</span>
          </span>
          <AppIcon name="chevronUp" size={20} />
        </button>
      </div>

      {/* The panel keeps the exercise it was opened for, so it doesn't jump
          to the next one while you're reading. */}
      {panel && (
        <TrainingPanel
          type={panel.type}
          exercise={panel.exerciseId ? EXERCISES[panel.exerciseId] : null}
          onClose={() => setPanel(null)}
        />
      )}

      <div className="training-buttons">
        <button type="button" className="training-pause" onClick={primary}>
          <AppIcon name={primaryButton.icon} size={22} />
          {primaryButton.text}
        </button>
        <button
          type="button"
          className="training-skip"
          disabled={idle}
          onClick={() => act((current, time) => skipPeriod(current, PERIODS, time))}
        >
          <AppIcon name="skip" size={20} />
          Skip
        </button>
        <button
          type="button"
          className="training-plus"
          disabled={idle}
          onClick={() => act(current => addTenSeconds(current, PERIODS))}
        >
          <AppIcon name="clock" size={20} />
          +10s
        </button>
      </div>
    </div>
  )
}

export default TrainingScreen
