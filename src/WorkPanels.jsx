import { useState } from 'react'
import AppIcon from './icons.jsx'
import { parseKey, todayKey } from './calendar.js'
import { showTime } from './settings.js'
import { clockText, durationText } from './workTimer.js'
import { CURRENCIES, dayTotals, gainText, sessionTags, weekDays, weekFocusMs, weekSessions } from './workLog.js'

// The bottom panels of the Work tab: project picker, this week, one
// session's details, the end-of-session form and the custom length.

// A panel that slides up over the tab, with a dimmed screen behind it.
// Same look as the Training panels. `onBack` adds a ‹ before the title.
function WorkSheet({ title, onClose, onBack, children }) {
  return (
    <div className="work-backdrop" onClick={onClose}>
      <div className="training-panel work-panel" role="dialog" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="training-panel-grab">
          <div className="sheet-handle" />
          <div className="training-panel-head">
            {onBack && (
              <button type="button" className="training-panel-back" onClick={onBack} aria-label="Back">
                <AppIcon name="chevronLeft" size={22} />
              </button>
            )}
            <h2>{title}</h2>
            <button type="button" className="sheet-x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="training-panel-body">{children}</div>
      </div>
    </div>
  )
}

const projectOf = (projects, id) => projects.find(p => p.id === id) || { id, name: 'Deleted project', color: '#8b8d98' }

const pad = n => String(n).padStart(2, '0')
const clockAt = ms => {
  const d = new Date(ms)
  return showTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)
}
const dateAt = ms => new Date(ms).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

// Projects: colored dot, name, time this week, chevron. "New project" at
// the bottom. `liveMs` adds the running session to its project's time.
export function ProjectPicker({ projects, sessions, activeId, live, onPick, onAdd, onClose }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  function add(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name)
    setName('')
    setAdding(false)
  }

  return (
    <WorkSheet title="Projects" onClose={onClose}>
      {live && <p className="work-panel-note">Picking another project first saves or discards the running session.</p>}
      <div className="work-rows">
        {projects.map(project => {
          const week = weekFocusMs(sessions, project.id) + (live?.projectId === project.id ? live.focusMs : 0)
          return (
            <button
              key={project.id}
              type="button"
              className={project.id === activeId ? 'work-row selected' : 'work-row'}
              onClick={() => onPick(project.id)}
            >
              <span className="work-dot" style={{ background: project.color }} />
              <span className="work-row-name">{project.name}</span>
              <span className="work-row-time">{durationText(week)}</span>
              <AppIcon name="chevron" size={18} />
            </button>
          )
        })}
      </div>
      {adding ? (
        <form className="work-new-form" onSubmit={add}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Project name" maxLength={40} />
          <button type="submit" className="work-small-primary">
            Add
          </button>
        </form>
      ) : (
        <button type="button" className="work-new" onClick={() => setAdding(true)}>
          <AppIcon name="add" size={20} />
          New project
        </button>
      )}
    </WorkSheet>
  )
}

// One row in the sessions list.
function SessionRow({ session, project, onOpen }) {
  const tags = sessionTags(session)
  return (
    <button type="button" className="work-session" onClick={() => onOpen(session.id)}>
      <span className="work-dot" style={{ background: project.color }} />
      <span className="work-session-text">
        <span className="work-session-top">
          <strong>{project.name}</strong>
          <span>{durationText(session.focusMs)}</span>
        </span>
        <span className="work-session-when">
          {dateAt(session.startedAt)} · {clockAt(session.startedAt)}
        </span>
        {tags.length > 0 && (
          <span className="work-tags">
            {tags.map(tag => (
              <span key={tag} className="work-tag">
                {tag}
              </span>
            ))}
          </span>
        )}
      </span>
      <AppIcon name="chevron" size={18} />
    </button>
  )
}

// This week: a Monday-to-Sunday stacked bar chart (one color per project,
// focused time only, no breaks), the week's total, and the sessions list.
export function WeekPanel({ projects, sessions, live, onOpenSession, onClose }) {
  const days = weekDays()
  const today = todayKey()
  const perDay = days.map(key => {
    const totals = dayTotals(sessions, key)
    if (live && key === today) totals[live.projectId] = (totals[live.projectId] || 0) + live.focusMs
    return totals
  })
  const dayMs = perDay.map(totals => Object.values(totals).reduce((a, b) => a + b, 0))
  const total = dayMs.reduce((a, b) => a + b, 0)
  // The tallest bar fills the chart; at least 1 hour so short days stay short.
  const scale = Math.max(3600000, ...dayMs)
  const list = weekSessions(sessions)

  return (
    <WorkSheet title="This week" onClose={onClose}>
      <div className="work-week-total">
        <strong>{durationText(total)}</strong>
        <span>focused</span>
      </div>
      <div className="work-chart" role="img" aria-label={`Focused time per day, ${durationText(total)} in total`}>
        {days.map((key, i) => (
          <div key={key} className={key === today ? 'work-chart-day today' : 'work-chart-day'}>
            <div className="work-chart-track">
              <div className="work-chart-stack" style={{ height: `${(dayMs[i] / scale) * 100}%` }}>
                {projects
                  .filter(p => perDay[i][p.id])
                  .map(p => (
                    <span key={p.id} style={{ flexGrow: perDay[i][p.id], background: p.color }} />
                  ))}
              </div>
            </div>
            <span className="work-chart-label">{parseKey(key).toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
          </div>
        ))}
      </div>
      <h3 className="work-list-title">Sessions</h3>
      {list.length === 0 ? (
        <p className="work-panel-note">No sessions saved this week yet.</p>
      ) : (
        <div className="work-rows">
          {list.map(s => (
            <SessionRow key={s.id} session={s} project={projectOf(projects, s.projectId)} onOpen={onOpenSession} />
          ))}
        </div>
      )}
    </WorkSheet>
  )
}

// Every saved detail of one session, including each break.
export function SessionDetails({ session, projects, onBack, onClose }) {
  const project = projectOf(projects, session.projectId)
  const rows = [
    ['Date', dateAt(session.startedAt)],
    ['Time', `${clockAt(session.startedAt)} – ${clockAt(session.endedAt)}`],
    ['Timer', session.mode === 'countdown' ? 'Countdown' : 'No limit'],
    session.plannedMs && ['Planned', durationText(session.plannedMs)],
    session.finalPlannedMs && session.finalPlannedMs !== session.plannedMs && ['With extra time', durationText(session.finalPlannedMs)],
    ['Focused', clockText(session.focusMs)],
    ['Breaks', `${clockText(session.breakMs)} (${session.breaks.length})`],
    ['Total time', clockText(session.wallMs)],
    ['Result', session.status === 'completed' ? 'Ran to the end' : 'Ended early'],
    session.progress !== null && ['Goal progress', `${session.progress}%`],
    ...(session.gains || []).map((gain, i) => [i === 0 ? 'Gains' : `Gain ${i + 1}`, gainText(gain)]),
    session.note && ['Note', session.note],
  ].filter(Boolean)

  return (
    <WorkSheet title={project.name} onBack={onBack} onClose={onClose}>
      <dl className="work-details">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {session.breaks.length > 0 && (
        <>
          <h3 className="work-list-title">Breaks</h3>
          <dl className="work-details">
            {session.breaks.map((b, i) => (
              <div key={b.start}>
                <dt>
                  {i + 1}. {clockAt(b.start)} – {clockAt(b.end)}
                </dt>
                <dd>{clockText(b.ms)}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </WorkSheet>
  )
}

const GAIN_TYPES = [
  { id: 'money', label: 'Money' },
  { id: 'item', label: 'Item' },
  { id: 'number', label: 'Number' },
]

// The gain being typed, as a gain object, or null when it isn't filled in.
function draftGain(draft) {
  const value = Number(draft.value)
  if (draft.type === 'money') return draft.value.trim() && !Number.isNaN(value) ? { type: 'money', currency: draft.currency, value } : null
  if (draft.type === 'number') return draft.value.trim() && !Number.isNaN(value) ? { type: 'number', value, unit: draft.unit.trim() } : null
  return draft.text.trim() ? { type: 'item', text: draft.text.trim() } : null
}

// Gains of the session: any number of money amounts (in any currency),
// items (a new phone, a card) or numbers with a unit (30 pages).
function GainsField({ gains, setGains, draft, setDraft }) {
  const set = changes => setDraft({ ...draft, ...changes })
  const ready = draftGain(draft)

  function add() {
    if (!ready) return
    setGains([...gains, ready])
    setDraft({ ...draft, value: '', text: '', unit: draft.unit })
  }

  return (
    <div className="work-gains">
      <span className="work-gains-label">Gains</span>
      {gains.length > 0 && (
        <div className="work-tags">
          {gains.map((gain, i) => (
            <button key={i} type="button" className="work-tag removable" onClick={() => setGains(gains.filter((_, j) => j !== i))} aria-label={`Remove ${gainText(gain)}`}>
              {gainText(gain)} ✕
            </button>
          ))}
        </div>
      )}
      <div className="work-gain-types" role="group" aria-label="Kind of gain">
        {GAIN_TYPES.map(t => (
          <button key={t.id} type="button" className={draft.type === t.id ? 'chip active' : 'chip'} onClick={() => set({ type: t.id })}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="work-gain-row">
        {draft.type === 'money' && (
          <>
            <select value={draft.currency} onChange={e => set({ currency: e.target.value })} aria-label="Currency">
              {CURRENCIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input inputMode="decimal" value={draft.value} onChange={e => set({ value: e.target.value })} placeholder="100" aria-label="Amount" />
          </>
        )}
        {draft.type === 'item' && (
          <input value={draft.text} onChange={e => set({ text: e.target.value })} placeholder="New phone" maxLength={40} aria-label="Item" />
        )}
        {draft.type === 'number' && (
          <>
            <input inputMode="decimal" value={draft.value} onChange={e => set({ value: e.target.value })} placeholder="30" aria-label="Number" />
            <input value={draft.unit} onChange={e => set({ unit: e.target.value })} placeholder="pages" maxLength={20} aria-label="Unit" />
          </>
        )}
        <button type="button" className="work-small-secondary" disabled={!ready} onClick={add}>
          Add
        </button>
      </div>
    </div>
  )
}

// The end of a session: what was done, the optional fields, and the
// buttons. `record` is the finished session (see finishWork), worked out
// when Done was tapped or the time ran out.
// - timeUp: shows "Extend +5m" and "Save & next project"
// - switchTo: the project to switch to after saving or discarding
// - currency: the currency picked first for a money gain
export function FinishSheet({ record, project, timeUp, switchTo, currency, onSave, onDiscard, onExtend, onClose }) {
  const [progress, setProgress] = useState('')
  const [gains, setGains] = useState([])
  const [draft, setDraft] = useState({ type: 'money', currency, value: '', text: '', unit: '' })
  const [note, setNote] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const number = text => (text.trim() === '' || Number.isNaN(Number(text)) ? null : Number(text))
  // A gain typed in but not added with "Add" is still saved.
  const extras = () => {
    const pending = draftGain(draft)
    return { progress: number(progress), gains: pending ? [...gains, pending] : gains, note, currency: draft.currency }
  }
  const title = switchTo ? `Switch to ${switchTo.name}?` : timeUp ? "Time's up" : 'Session done'

  return (
    <WorkSheet title={title} onClose={onClose}>
      <div className="work-summary">
        <div>
          <strong>{clockText(record.focusMs)}</strong>
          <span>Focused</span>
        </div>
        <div>
          <strong>{clockText(record.breakMs)}</strong>
          <span>
            {record.breaks.length} {record.breaks.length === 1 ? 'break' : 'breaks'}
          </span>
        </div>
        <div>
          <strong>{clockText(record.wallMs)}</strong>
          <span>Total</span>
        </div>
      </div>
      <p className="work-panel-note">
        <span className="work-dot" style={{ background: project.color }} /> {project.name} · all fields below are optional
      </p>
      <div className="work-fields">
        <label className="wide">
          <span>Goal progress % (how far toward this project's goal)</span>
          <input inputMode="numeric" value={progress} onChange={e => setProgress(e.target.value)} placeholder="60" />
        </label>
        <div className="wide">
          <GainsField gains={gains} setGains={setGains} draft={draft} setDraft={setDraft} />
        </div>
        <label className="wide">
          <span>Note</span>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Chapter 3 done" maxLength={60} />
        </label>
      </div>
      <div className="work-finish-buttons">
        {timeUp && (
          <button type="button" className="work-small-secondary" onClick={onExtend}>
            Extend +5m
          </button>
        )}
        <button type="button" className="work-small-primary" onClick={() => onSave(extras(), false)}>
          <AppIcon name="check" size={18} />
          {switchTo ? 'Save and switch' : 'Save'}
        </button>
        {timeUp && !switchTo && (
          <button type="button" className="work-small-secondary" onClick={() => onSave(extras(), true)}>
            Save & next project
          </button>
        )}
        <button
          type="button"
          className={confirmDiscard ? 'work-discard sure' : 'work-discard'}
          onClick={() => (confirmDiscard ? onDiscard() : setConfirmDiscard(true))}
        >
          {confirmDiscard ? 'Tap again to discard this session' : switchTo ? 'Discard and switch' : 'Discard session'}
        </button>
      </div>
    </WorkSheet>
  )
}

const PRESETS = [15, 25, 30, 45, 90, 180]

// Pick a custom length in minutes.
export function CustomSheet({ minutes, onPick, onClose }) {
  const [value, setValue] = useState(String(minutes || 45))
  const chosen = Math.round(Number(value))
  const valid = chosen >= 1 && chosen <= 24 * 60

  return (
    <WorkSheet title="Custom length" onClose={onClose}>
      <div className="work-presets">
        {PRESETS.map(m => (
          <button key={m} type="button" className="chip" onClick={() => onPick(m)}>
            {durationText(m * 60000)}
          </button>
        ))}
      </div>
      <form
        className="work-new-form"
        onSubmit={e => {
          e.preventDefault()
          if (valid) onPick(chosen)
        }}
      >
        <input inputMode="numeric" value={value} onChange={e => setValue(e.target.value)} aria-label="Minutes" />
        <span className="work-unit">min</span>
        <button type="submit" className="work-small-primary" disabled={!valid}>
          Set
        </button>
      </form>
    </WorkSheet>
  )
}
