// The Work timer's logic, without any screen code.
//
// Like the Training timer, every time is worked out from timestamps, never
// by counting ticks, so it stays right when the phone sleeps or the app is
// closed. The running session looks like:
// { id, projectId, mode, startedAt, plannedMs, extraMs,
//   breaks, breakStartedAt, timeUpAt, idleMs }
// - mode:           'countdown' (a set length) or 'countup' (no limit)
// - plannedMs:      the length picked at the start (countdown only)
// - extraMs:        time added with +5m (taps add up)
// - breaks:         finished breaks, [{ start, end }]
// - breakStartedAt: when the break that's on now started (null = working)
// - timeUpAt:       when a countdown reached 00:00 (null = not yet)
// - idleMs:         time spent waiting at 00:00 before +5m was tapped
//
// The rule that matters most: focused time = time since start minus breaks
// minus waiting at 00:00. Breaks never count as focused time.

const ACTIVE_KEY = 'planner-work-active'
export const FIVE_MINUTES = 5 * 60 * 1000

export function loadActive() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_KEY))
  } catch {
    return null
  }
}

export function saveActive(session) {
  if (session) localStorage.setItem(ACTIVE_KEY, JSON.stringify(session))
  else localStorage.removeItem(ACTIVE_KEY)
}

// `minutes` is null for a count-up session.
export function startWork(projectId, minutes, now) {
  return {
    id: `w${now.toString(36)}`,
    projectId,
    mode: minutes ? 'countdown' : 'countup',
    startedAt: now,
    plannedMs: minutes ? minutes * 60 * 1000 : null,
    extraMs: 0,
    breaks: [],
    breakStartedAt: null,
    timeUpAt: null,
    idleMs: 0,
  }
}

// The planned length including every +5m.
export function totalPlannedMs(session) {
  return session.plannedMs === null ? null : session.plannedMs + session.extraMs
}

// Time spent on finished breaks, plus the break that's on now.
export function breakMs(session, now) {
  const done = session.breaks.reduce((sum, b) => sum + (b.end - b.start), 0)
  return done + (session.breakStartedAt ? now - session.breakStartedAt : 0)
}

// Focused time before the 00:00 limit is applied.
function rawFocusMs(session, now) {
  const until = session.timeUpAt ?? now
  const ongoingBreak = session.breakStartedAt ? until - session.breakStartedAt : 0
  const doneBreaks = session.breaks.reduce((sum, b) => sum + (b.end - b.start), 0)
  return until - session.startedAt - doneBreaks - ongoingBreak - session.idleMs
}

export function focusMs(session, now) {
  const raw = Math.max(0, rawFocusMs(session, now))
  const total = totalPlannedMs(session)
  return total === null ? raw : Math.min(raw, total)
}

// A countdown that has run out gets `timeUpAt` set to the exact moment it
// hit 00:00 (even if the phone was asleep then). Returns the same session
// when nothing changed.
export function catchUpWork(session, now) {
  if (!session || session.mode !== 'countdown' || session.timeUpAt || session.breakStartedAt) return session
  const over = rawFocusMs(session, now) - totalPlannedMs(session)
  return over >= 0 ? { ...session, timeUpAt: now - over } : session
}

export function takeBreak(session, now) {
  if (session.breakStartedAt || session.timeUpAt) return session
  return { ...session, breakStartedAt: now }
}

export function resumeWork(session, now) {
  if (!session.breakStartedAt) return session
  return { ...session, breaks: [...session.breaks, { start: session.breakStartedAt, end: now }], breakStartedAt: null }
}

// +5m: adds to the plan. After 00:00 it also starts the clock again; the
// wait at 00:00 is kept as idle time, so it's neither focus nor break.
export function addFiveMinutes(session, now) {
  if (session.mode !== 'countdown') return session
  const idle = session.timeUpAt ? now - session.timeUpAt : 0
  return { ...session, extraMs: session.extraMs + FIVE_MINUTES, timeUpAt: null, idleMs: session.idleMs + idle }
}

// Everything the screen and the hourglass need, at time `now`.
// status: 'working', 'break' or 'timeUp'.
// progress: share of the plan done (0..1), countdown only.
export function workView(session, now) {
  const focused = focusMs(session, now)
  const total = totalPlannedMs(session)
  const status = session.breakStartedAt ? 'break' : session.timeUpAt ? 'timeUp' : 'working'
  return {
    status,
    mode: session.mode,
    focusMs: focused,
    remainingMs: total === null ? null : Math.max(0, total - focused),
    progress: total === null ? null : Math.min(1, focused / total),
    breakMs: breakMs(session, now),
    currentBreakMs: session.breakStartedAt ? now - session.breakStartedAt : 0,
  }
}

// Turn the running session into the record that gets saved. A break that's
// still on is closed at `now`. `extras` are the optional fields from the
// end-of-session form: { progress, gains, note } (see workLog.js).
export function finishWork(session, now, extras = {}) {
  const closed = resumeWork(catchUpWork(session, now), now)
  return {
    id: closed.id,
    projectId: closed.projectId,
    mode: closed.mode,
    startedAt: closed.startedAt,
    endedAt: now,
    plannedMs: closed.plannedMs,
    finalPlannedMs: totalPlannedMs(closed),
    focusMs: focusMs(closed, now),
    breakMs: breakMs(closed, now),
    breaks: closed.breaks.map(b => ({ ...b, ms: b.end - b.start })),
    wallMs: now - closed.startedAt,
    // 'completed' = the countdown reached 00:00; 'ended' = Done was tapped
    // before that (or a count-up session was ended).
    status: closed.timeUpAt ? 'completed' : 'ended',
    progress: extras.progress ?? null,
    gains: extras.gains || [],
    note: extras.note?.trim() || null,
  }
}

const pad = n => String(n).padStart(2, '0')

// 2832000 -> "47:12", 4320000 -> "1:12:00".
export function clockText(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

// 768000 -> "12m 48s", 4380000 -> "1h 13m".
export function shortText(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${pad(m)}m`
  return `${m}m ${pad(s % 60)}s`
}

// 4800000 -> "1h 20m", 0 -> "0m". For totals.
export function durationText(ms) {
  const minutes = Math.floor(Math.max(0, ms) / 60000)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
