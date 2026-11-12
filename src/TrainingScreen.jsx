import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppIcon from './icons.jsx'
import GearButton from './GearButton.jsx'
import TimerCircle from './TimerCircle.jsx'
import { playBeep } from './sound.js'
import TrainingPanel from './TrainingPanel.jsx'
import TrainingSettings from './TrainingSettings.jsx'
import { DEFAULT_SETTINGS, EXERCISES, workoutFrom } from './trainingData.js'
import {
  addTenSeconds,
  buildPeriods,
  catchUp,
  loadTraining,
  loadTrainingSettings,
  saveTrainingSettings,
  pauseTraining,
  resumeTraining,
  saveTraining,
  sessionClock,
  skipPeriod,
  splitClock,
  startTraining,
  trainingRecord,
  trainingView,
} from './training.js'
import { saveTrainingSession } from './workLog.js'
import ProgramsSheet from './ProgramsSheet.jsx'
import { activeProgram, doneThisWeek, loadPrograms, nextWorkout, savePrograms, withFinished, workoutPlan } from './programs.js'

// The small orange word above the numbers. Exercises have none.
const LABELS = { ready: 'Ready', rest: 'Rest', setRest: 'Set rest', done: 'Done' }

// The first exercise period at or after `from` (-1 when there's none left).
function nextExerciseAt(periods, from) {
  for (let i = from; i < periods.length; i++) if (periods[i].kind === 'exercise') return i
  return -1
}

// An exercise's name, or "Freestyle" for a round without one.
function exerciseName(period) {
  return (period.exerciseId && EXERCISES[period.exerciseId].name) || period.name || 'Freestyle'
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
  // The numbers set in the settings sheet, used for the next start.
  const [settings, setSettings] = useState(() => loadTrainingSettings(DEFAULT_SETTINGS))
  const [settingsOpen, setSettingsOpen] = useState(false)

  // A running workout keeps the numbers it started with (older saved
  // workouts have none, so they use the defaults). With no workout started,
  // the screen shows the next one, built from the settings.
  // Your programs: with one in use, the next workout of it is what starts.
  const [programs, setPrograms] = useState(loadPrograms)
  const [programsOpen, setProgramsOpen] = useState(false)
  const program = activeProgram(programs)
  const next = nextWorkout(programs, program)
  const nextPlan = useMemo(() => (next ? workoutPlan(program, next) : null), [program, next])
  const plan = session ? session.plan || DEFAULT_SETTINGS : nextPlan || settings
  const workout = useMemo(() => workoutFrom(plan), [plan])
  const periods = useMemo(() => buildPeriods(workout), [workout])
  const totalRounds = workout.rounds.length * workout.sets
  // The whole workout's length in seconds, for the "time left" clock.
  const sessionTotalSeconds = periods.reduce((sum, p) => sum + p.seconds, 0)

  function change(next) {
    sessionRef.current = next
    setSession(next)
    logIfFinished(next)
  }

  useEffect(() => saveTraining(session), [session])

  // When a workout reaches its end, save it as a Training session in the
  // Work log. Saving the same workout again just replaces it.
  useEffect(() => {
    if (!session || session.index < periods.length) return
    saveTrainingSession(trainingRecord(session, periods, Date.now()))
  }, [session, periods])

  // A finished program workout moves the program on to its next workout.
  // Logging the same start time twice does nothing.
  const logIfFinished = useCallback(
    updated => {
      if (!updated || updated.index < periods.length) return
      setPrograms(current => {
        const result = withFinished(current, updated.plan, updated.startedAt)
        if (result !== current) savePrograms(result)
        return result
      })
    },
    [periods],
  )

  function changePrograms(updated) {
    savePrograms(updated)
    setPrograms(updated)
  }

  function saveSettings(values) {
    setSettings(saveTrainingSettings(values, DEFAULT_SETTINGS))
    setSettingsOpen(false)
  }

  // Restart asks twice: the first tap turns the button into "Restart?", the
  // second one restarts. It goes back to normal after 3 seconds.
  const [confirmRestart, setConfirmRestart] = useState(false)
  useEffect(() => {
    if (!confirmRestart) return
    const timer = setTimeout(() => setConfirmRestart(false), 3000)
    return () => clearTimeout(timer)
  }, [confirmRestart])

  function restart() {
    if (!confirmRestart) {
      setConfirmRestart(true)
      return
    }
    setConfirmRestart(false)
    // A workout stopped halfway still counts as Training time.
    const time = Date.now()
    const record = trainingRecord(catchUp(sessionRef.current, periods, time).session, periods, time)
    if (record) saveTrainingSession(record)
    change(null)
    setNow(Date.now())
  }

  const running = Boolean(session) && !session.pausedAt && session.index < periods.length

  // While running, redraw every frame (for the hundredths and the liquid).
  // Each frame also moves on to the next period when one runs out.
  useEffect(() => {
    if (!running) return
    let frame
    function tick() {
      const time = Date.now()
      const { session: next, ended } = catchUp(sessionRef.current, periods, time)
      if (ended > 0) {
        sessionRef.current = next
        setSession(next)
        logIfFinished(next)
        playBeep()
      }
      setNow(time)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, periods, logIfFinished])

  // Run a button's change on the up-to-date session.
  function act(update) {
    const time = Date.now()
    const current = catchUp(sessionRef.current, periods, time).session
    change(update(current, time))
    setNow(time)
  }

  const current = catchUp(session, periods, now).session
  const view = trainingView(current, periods, now)
  const { status, period } = view
  const idle = status === 'ready' || status === 'done'

  // The cards show the exercise that's on now, or during a rest the one
  // that's coming up, plus the exercise after it.
  const index = status === 'ready' ? 0 : status === 'done' ? periods.length - 1 : current.index
  const shownAt = nextExerciseAt(periods, index)
  const shown = shownAt === -1 ? null : periods[shownAt]
  const exercise = shown?.exerciseId ? EXERCISES[shown.exerciseId] : null
  const nextAt = shownAt === -1 ? -1 : nextExerciseAt(periods, shownAt + 1)
  const variationCount = exercise?.variations.length || 0

  function primary() {
    if (idle) act((_, time) => startTraining(time, nextPlan || settings))
    else if (status === 'paused') act(resumeTraining)
    else act(pauseTraining)
  }

  const sessionSeconds = showLeft
    ? Math.ceil((sessionTotalSeconds * 1000 - view.activeMs) / 1000)
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
        {/* Tap the round and set numbers to change them. */}
        <button type="button" className="training-counts" onClick={() => (nextPlan ? setProgramsOpen(true) : setSettingsOpen(true))} aria-label="Workout settings">
          <span>
            Round {period.round + 1} / {totalRounds}
          </span>
          <span className="training-set">
            Set {period.set + 1} / {workout.sets} ✎
          </span>
        </button>
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
        <div className="training-top-right">
          {/* Restart shows once a workout has started (running, paused or done). */}
          {session && (
            <button
              type="button"
              className={confirmRestart ? 'training-restart sure' : 'training-restart'}
              onClick={restart}
              aria-label={confirmRestart ? 'Tap again to restart' : 'Restart workout'}
            >
              {confirmRestart ? 'Restart?' : <AppIcon name="restart" size={22} />}
            </button>
          )}
          <GearButton onClick={onGear} />
        </div>
      </header>

      <div className="training-circle-area">
        <TimerCircle
          fraction={view.remainingMs / view.totalMs}
          phase={view.activeMs / 700}
          label={label}
          clock={splitClock(view.remainingMs)}
        />
      </div>

      {/* Your program: which workout is next and how the week is going. */}
      <button type="button" className="training-program" onClick={() => setProgramsOpen(true)}>
        {program && next ? (
          <>
            <strong>{(session?.plan?.name) || next.name}</strong>
            <span>
              · {program.name} · {doneThisWeek(programs, program)} of {program.perWeek} this week
            </span>
          </>
        ) : (
          <strong>＋ Add your program</strong>
        )}
      </button>

      <div className="training-cards">
        <button type="button" className="training-card current" onClick={() => setPanel({ type: 'details', exerciseId: shown?.exerciseId })}>
          <span className="training-card-text">
            <strong>{shown ? exerciseName(shown) : 'Done'}</strong>
            <span>{nextAt === -1 ? 'Last exercise' : `Next: ${exerciseName(periods[nextAt])}`}</span>
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
      {settingsOpen && (
        <TrainingSettings settings={settings} running={Boolean(session) && status !== 'done'} onSave={saveSettings} onClose={() => setSettingsOpen(false)} />
      )}

      {programsOpen && <ProgramsSheet state={programs} onChange={changePrograms} onClose={() => setProgramsOpen(false)} />}

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
          onClick={() => act((current, time) => skipPeriod(current, periods, time))}
        >
          <AppIcon name="skip" size={20} />
          Skip
        </button>
        <button
          type="button"
          className="training-plus"
          disabled={idle}
          onClick={() => act(current => addTenSeconds(current, periods))}
        >
          <AppIcon name="clock" size={20} />
          +10s
        </button>
      </div>
    </div>
  )
}

export default TrainingScreen
