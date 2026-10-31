import { useEffect, useRef, useState } from 'react'
import AppIcon from './icons.jsx'
import GearButton from './GearButton.jsx'
import Hourglass from './Hourglass.jsx'
import { countUpFill } from './hourglassSand.js'
import { getSettings } from './settings.js'
import { playBeep } from './sound.js'
import { todayKey } from './calendar.js'
import { CustomSheet, FinishSheet, ProjectPicker, SessionDetails, WeekPanel } from './WorkPanels.jsx'
import {
  dayBreakMs,
  dayTotals,
  loadPrefs,
  loadProjects,
  loadSessions,
  newProject,
  savePrefs,
  saveProjects,
  saveSessions,
  weekFocusMs,
} from './workLog.js'
import {
  addFiveMinutes,
  catchUpWork,
  clockText,
  durationText,
  finishWork,
  loadActive,
  resumeWork,
  saveActive,
  shortText,
  startWork,
  takeBreak,
  workView,
} from './workTimer.js'
import './Work.css'

// The length chips under the hourglass before a session starts.
// null = "No limit" (count-up).
const LENGTHS = [
  { minutes: 60, label: '1h' },
  { minutes: 120, label: '2h' },
]

// The Work tab: the project and today's time, the big hourglass, the
// project and week cards, and the Take break / Done / +5m buttons.
function WorkScreen({ onGear }) {
  const [projects, setProjects] = useState(loadProjects)
  const [sessions, setSessions] = useState(loadSessions)
  const [prefs, setPrefs] = useState(loadPrefs)
  const [active, setActive] = useState(() => catchUpWork(loadActive(), Date.now()))
  const [now, setNow] = useState(() => Date.now())
  // The open panel: { type: 'projects' | 'week' | 'session' | 'finish' | 'custom', … } or null.
  const [panel, setPanel] = useState(() => (active?.timeUpAt ? { type: 'finish', timeUp: true } : null))
  // The latest session, readable right away inside the clock below.
  const activeRef = useRef(active)

  function change(next) {
    activeRef.current = next
    setActive(next)
  }

  useEffect(() => saveActive(active), [active])
  useEffect(() => saveSessions(sessions), [sessions])
  useEffect(() => saveProjects(projects), [projects])
  useEffect(() => savePrefs(prefs), [prefs])

  // While a session is on, refresh twice a second. Each refresh also
  // checks if a countdown reached 00:00 (even while the phone slept).
  const running = Boolean(active)
  useEffect(() => {
    if (!running) return
    function tick() {
      const time = Date.now()
      const current = activeRef.current
      const next = catchUpWork(current, time)
      if (next !== current) {
        change(next)
        playBeep()
        setPanel({ type: 'finish', timeUp: true })
      }
      setNow(time)
    }
    const id = setInterval(tick, 500)
    // Coming back to the app: update right away instead of on the next tick.
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [running])

  // Run a button's change on the up-to-date session.
  function act(update) {
    const time = Date.now()
    change(update(catchUpWork(activeRef.current, time), time))
    setNow(time)
  }

  const project = projects.find(p => p.id === (active?.projectId ?? prefs.projectId)) || projects[0]
  // After Done is tapped the session has ended, so everything stays still
  // at that moment while the form is open.
  const view = active ? workView(active, panel?.record ? panel.record.endedAt : now) : null
  const liveFocus = active ? { projectId: active.projectId, focusMs: view.focusMs } : null
  const todayMs = (dayTotals(sessions, todayKey())[project.id] || 0) + (active?.projectId === project.id ? view.focusMs : 0)
  // Break time today for this project (saved sessions plus the running one).
  const todayBreakMs =
    dayBreakMs(sessions, todayKey(), project.id) + (active?.projectId === project.id ? view.breakMs : 0)
  const weekMs =weekFocusMs(sessions) + (view?.focusMs || 0)

  // ---- Buttons ----
  function start() {
    const time = Date.now()
    change(startWork(project.id, prefs.minutes, time))
    setNow(time)
  }

  function done() {
    setPanel({ type: 'finish', timeUp: view.status === 'timeUp', record: finishWork(active, Date.now()) })
  }

  function saveFinished(extras, thenNext) {
    // Done ends the session the moment it's tapped, so filling in the form
    // doesn't add focused time.
    const record = finishWork(active, panel.record?.endedAt ?? Date.now(), extras)
    setSessions(previous => [...previous, record])
    setPrefs(p => ({ ...p, currency: extras.currency }))
    afterFinish(thenNext)
  }

  function afterFinish(thenNext) {
    const switchTo = panel.switchTo
    change(null)
    if (switchTo) setPrefs(p => ({ ...p, projectId: switchTo }))
    setPanel(thenNext ? { type: 'projects' } : null)
  }

  function extend() {
    act(addFiveMinutes)
    setPanel(null)
  }

  function pickProject(id) {
    if (active && id !== active.projectId) {
      setPanel({ type: 'finish', switchTo: id, timeUp: view.status === 'timeUp', record: finishWork(active, Date.now()) })
      return
    }
    setPrefs(p => ({ ...p, projectId: id }))
    setPanel(null)
  }

  function addProject(name) {
    const created = newProject(projects, name)
    setProjects([...projects, created])
  }

  // ---- What the hourglass shows ----
  let amount = 0
  let mode = prefs.minutes ? 'countdown' : 'countup'
  let topText = prefs.minutes ? clockText(prefs.minutes * 60000) : clockText(0)
  let bottomText = ''
  if (active) {
    mode = active.mode
    if (mode === 'countdown') {
      amount = view.progress
      topText = clockText(view.remainingMs)
      bottomText = shortText(view.focusMs)
    } else {
      amount = countUpFill(view.focusMs)
      topText = clockText(view.focusMs)
    }
  }

  const onBreak = view?.status === 'break'
  const timeUp = view?.status === 'timeUp'
  const customLabel = prefs.minutes && !LENGTHS.some(l => l.minutes === prefs.minutes) ? durationText(prefs.minutes * 60000) : 'Custom'

  // The line under the hourglass: length chips before starting, the session's
  // state while it runs.
  let status
  if (!active) {
    status = (
      <div className="work-lengths" role="group" aria-label="Session length">
        {LENGTHS.map(l => (
          <button
            key={l.minutes}
            type="button"
            className={prefs.minutes === l.minutes ? 'chip active' : 'chip'}
            onClick={() => setPrefs(p => ({ ...p, minutes: l.minutes }))}
          >
            {l.label}
          </button>
        ))}
        <button type="button" className={customLabel !== 'Custom' ? 'chip active' : 'chip'} onClick={() => setPanel({ type: 'custom' })}>
          {customLabel}
        </button>
        <button type="button" className={prefs.minutes === null ? 'chip active' : 'chip'} onClick={() => setPrefs(p => ({ ...p, minutes: null }))}>
          No limit
        </button>
      </div>
    )
  } else if (onBreak) {
    status = (
      <p className="work-status break" role="status">
        <AppIcon name="cup" size={16} /> On break · {clockText(view.currentBreakMs)}
      </p>
    )
  } else if (timeUp) {
    status = <p className="work-status">Time's up</p>
  }

  const finishProject = panel?.type === 'finish' && active ? projects.find(p => p.id === active.projectId) || project : project

  return (
    <div className="training work">
      <header className="work-top">
        <div className="work-project-info">
          <strong>{project.name}</strong>
          <span>Today {durationText(todayMs)}</span>
          {todayBreakMs >= 60000 && <span className="work-break-today">Break {durationText(todayBreakMs)}</span>}
        </div>
        <GearButton onClick={onGear} />
      </header>

      <div className="work-glass-area">
        <Hourglass
          designId={getSettings().hourglass}
          mode={mode}
          amount={amount}
          flowing={Boolean(active) && !onBreak && !timeUp}
          topText={topText}
          bottomText={bottomText}
          dimmed={onBreak}
        />
      </div>

      <div className="work-status-row">{status}</div>

      <div className="training-cards">
        <button type="button" className="training-card current" onClick={() => setPanel({ type: 'projects' })}>
          <span className="work-dot" style={{ background: project.color }} />
          <span className="training-card-text">
            <strong>{project.name}</strong>
            <span>Current project</span>
          </span>
          <AppIcon name="chevron" size={20} />
        </button>
        <button type="button" className="training-card" onClick={() => setPanel({ type: 'week' })}>
          <span className="training-card-text">
            <span>This week</span>
            <strong>{durationText(weekMs)}</strong>
          </span>
          <AppIcon name="chevron" size={20} />
        </button>
      </div>

      <div className="training-buttons work-buttons">
        <button
          type="button"
          className="training-pause"
          disabled={!active || timeUp}
          onClick={() => act(onBreak ? resumeWork : takeBreak)}
        >
          <AppIcon name={onBreak ? 'play' : 'cup'} size={20} />
          {onBreak ? 'Resume' : 'Take break'}
        </button>
        <button type="button" className="training-skip work-done" onClick={active ? done : start}>
          <AppIcon name={active ? 'check' : 'play'} size={20} />
          {active ? 'Done' : 'Start'}
        </button>
        <button
          type="button"
          className="training-plus"
          disabled={!active || active.mode !== 'countdown'}
          onClick={() => act(addFiveMinutes)}
        >
          +5m
        </button>
      </div>

      {panel?.type === 'projects' && (
        <ProjectPicker
          projects={projects}
          sessions={sessions}
          activeId={project.id}
          live={liveFocus}
          onPick={pickProject}
          onAdd={addProject}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.type === 'week' && (
        <WeekPanel
          projects={projects}
          sessions={sessions}
          live={liveFocus}
          onOpenSession={id => setPanel({ type: 'session', id })}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.type === 'session' && (
        <SessionDetails
          session={sessions.find(s => s.id === panel.id)}
          projects={projects}
          onBack={() => setPanel({ type: 'week' })}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.type === 'custom' && (
        <CustomSheet
          minutes={prefs.minutes}
          onPick={minutes => {
            setPrefs(p => ({ ...p, minutes }))
            setPanel(null)
          }}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.type === 'finish' && active && (
        <FinishSheet
          record={panel.record || finishWork(active, now)}
          project={finishProject}
          timeUp={panel.timeUp}
          currency={prefs.currency}
          switchTo={panel.switchTo ? projects.find(p => p.id === panel.switchTo) : null}
          onSave={saveFinished}
          onDiscard={() => afterFinish(false)}
          onExtend={extend}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
}

export default WorkScreen
