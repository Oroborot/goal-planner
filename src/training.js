// The Training timer's logic, without any screen code.
//
// A workout becomes a list of "periods" in order: exercise, rest, exercise,
// rest, …, with a longer set rest after the last round of each set.
//
// Times are always worked out from timestamps, never by counting ticks, so
// the timer stays right when the phone sleeps. "Active time" is the time
// since Start minus the time spent paused; every period start is stored as
// an active time. The running session looks like:
// { startedAt, pausedAt, pausedMs, index, periodStartMs, extraSec, pendingExtraSec }
// - index:           which period is running (past the end = done)
// - periodStartMs:   active time when that period started
// - extraSec:        seconds added to this rest with +10s
// - pendingExtraSec: seconds added during an exercise, for the coming rest

import { ratingKey } from './ratings.js'

// Where the running session is saved, so a refresh or a closed app keeps it.
const TRAINING_KEY = 'planner-training'

// Turn a workout (see trainingData.js) into its list of periods.
// A workout with blocks (Set A, Set B, …) plays them one after another,
// with the finished block's set rest in between. Older workouts without
// blocks are one block.
// Each period knows its block: `round` counts across all sets of that
// block (0, 1, 2, …), `set` starts at 0, `rounds` and `sets` are the
// block's totals, `blockName` is null when there's only one block.
export function buildPeriods(workout) {
  const blocks = workout.blocks || [workout]
  const periods = []
  blocks.forEach((block, b) => {
    const perSet = block.rounds.length
    const total = perSet * block.sets
    const info = { blockName: blocks.length > 1 ? block.name : null, rounds: total, sets: block.sets }
    for (let i = 0; i < total; i++) {
      const set = Math.floor(i / perSet)
      const { exerciseId, name } = block.rounds[i % perSet]
      periods.push({ kind: 'exercise', round: i, set, exerciseId, name, seconds: block.exerciseSeconds, ...info })
      const lastOfBlock = i === total - 1
      if (lastOfBlock && b === blocks.length - 1) break
      const endOfSet = (i + 1) % perSet === 0
      periods.push({
        kind: endOfSet ? 'setRest' : 'rest',
        round: i,
        set,
        seconds: endOfSet ? block.setRestSeconds : block.restSeconds,
        ...info,
      })
    }
  })
  return periods
}

export function loadTraining() {
  try {
    return JSON.parse(localStorage.getItem(TRAINING_KEY))
  } catch {
    return null
  }
}

export function saveTraining(session) {
  if (session) localStorage.setItem(TRAINING_KEY, JSON.stringify(session))
  else localStorage.removeItem(TRAINING_KEY)
}

// `plan` is the settings the workout starts with. It's kept in the session,
// so changing the settings later never breaks a workout that's running.
export function startTraining(now, plan) {
  return { startedAt: now, pausedAt: null, pausedMs: 0, index: 0, periodStartMs: 0, extraSec: 0, pendingExtraSec: 0, plan }
}

// The numbers set in the Training settings sheet (rounds, sets and times).
const SETTINGS_KEY = 'planner-training-settings'

// Each setting's lowest and highest allowed value.
export const SETTING_LIMITS = {
  roundsPerSet: [1, 20],
  sets: [1, 10],
  exerciseSeconds: [5, 600],
  restSeconds: [0, 300],
  setRestSeconds: [0, 600],
}

// Whole number inside the limits; the fallback when it isn't a number.
function clampSetting(key, value, fallback) {
  const number = Math.round(Number(value))
  if (value === '' || Number.isNaN(number)) return fallback
  const [min, max] = SETTING_LIMITS[key]
  return Math.min(max, Math.max(min, number))
}

// The saved settings. Anything missing falls back to the default, so new
// settings can be added later without breaking old saves.
export function loadTrainingSettings(defaults) {
  let saved = null
  try {
    saved = JSON.parse(localStorage.getItem(SETTINGS_KEY))
  } catch {
    // Unreadable save: use the defaults.
  }
  const settings = {}
  for (const key of Object.keys(SETTING_LIMITS)) settings[key] = clampSetting(key, saved?.[key], defaults[key])
  return settings
}

// Saves the settings (each one kept inside its limits) and returns them.
export function saveTrainingSettings(values, defaults) {
  const settings = {}
  for (const key of Object.keys(SETTING_LIMITS)) settings[key] = clampSetting(key, values[key], defaults[key])
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  return settings
}

// Time since Start, not counting pauses.
function activeMs(session, now) {
  return (session.pausedAt ?? now) - session.startedAt - session.pausedMs
}

// How long the current period lasts, including any +10s.
function periodMs(session, periods) {
  return (periods[session.index].seconds + session.extraSec) * 1000
}

const isDone = (session, periods) => session.index >= periods.length

// A workout that stopped before this many seconds isn't saved (a mis-tap).
const MIN_SAVE_SECONDS = 10

// The workout as a saved session for the Work log (same shape as a Work
// session, plus kind: 'training'). Call it with the caught-up session.
// A finished workout always counts; a stopped one only after 10 seconds.
// Returns null when there is nothing to save.
export function trainingRecord(session, periods, now) {
  if (!session) return null
  const done = isDone(session, periods)
  const focusMs = done ? session.periodStartMs : activeMs(session, now)
  if (!done && focusMs < MIN_SAVE_SECONDS * 1000) return null
  const endedAt = done ? session.startedAt + session.periodStartMs + session.pausedMs : (session.pausedAt ?? now)
  const plannedMs = periods.reduce((sum, p) => sum + p.seconds * 1000, 0)
  // The exercises that were actually reached: every period up to the one
  // running now (all of them when the workout finished). Each exercise is
  // listed once per workout: its id, or the lowercase custom name.
  const reached = periods.slice(0, done ? periods.length : session.index + 1)
  const exercises = [
    ...new Set(
      reached
        .filter(p => p.kind === 'exercise')
        .map(p => ratingKey(p.exerciseId, p.name))
        .filter(Boolean),
    ),
  ]
  return {
    id: `training-${session.startedAt}`,
    projectId: 'training',
    kind: 'training',
    mode: 'countdown',
    startedAt: session.startedAt,
    endedAt,
    plannedMs,
    finalPlannedMs: plannedMs,
    focusMs,
    breakMs: 0,
    breaks: [],
    wallMs: endedAt - session.startedAt,
    status: done ? 'completed' : 'ended',
    progress: null,
    gains: [],
    note: null,
    exercises,
  }
}

// Move to period `index`, starting at active time `startMs`. A rest picks
// up the seconds that were added during the exercise before it.
function enter(session, periods, index, startMs) {
  const isRest = periods[index] && periods[index].kind !== 'exercise'
  return {
    ...session,
    index,
    periodStartMs: startMs,
    extraSec: isRest ? session.pendingExtraSec : 0,
    pendingExtraSec: isRest ? 0 : session.pendingExtraSec,
  }
}

// Move past every period that has run out by `now` (more than one if the
// phone slept). Returns the new session and how many periods ended.
export function catchUp(session, periods, now) {
  if (!session) return { session, ended: 0 }
  const active = activeMs(session, now)
  let next = session
  let ended = 0
  while (!isDone(next, periods) && active >= next.periodStartMs + periodMs(next, periods)) {
    next = enter(next, periods, next.index + 1, next.periodStartMs + periodMs(next, periods))
    ended++
  }
  return { session: next, ended }
}

export function pauseTraining(session, now) {
  return session.pausedAt ? session : { ...session, pausedAt: now }
}

export function resumeTraining(session, now) {
  if (!session.pausedAt) return session
  return { ...session, pausedAt: null, pausedMs: session.pausedMs + (now - session.pausedAt) }
}

// Skip: during an exercise go to the next rest; during a rest start the
// next exercise right away.
export function skipPeriod(session, periods, now) {
  if (isDone(session, periods)) return session
  return enter(session, periods, session.index + 1, activeMs(session, now))
}

// +10s: during a rest it's added right away; during an exercise it's
// saved for the coming rest. Taps add up.
export function addTenSeconds(session, periods) {
  if (isDone(session, periods)) return session
  if (periods[session.index].kind === 'exercise') {
    return { ...session, pendingExtraSec: session.pendingExtraSec + 10 }
  }
  return { ...session, extraSec: session.extraSec + 10 }
}

// Everything the screen needs to draw, at time `now`.
// status: 'ready' (not started), 'running', 'paused' or 'done'.
export function trainingView(session, periods, now) {
  const first = periods[0]
  if (!session) {
    return { status: 'ready', period: first, remainingMs: first.seconds * 1000, totalMs: first.seconds * 1000, activeMs: 0 }
  }
  if (isDone(session, periods)) {
    // The workout's active time stops where the last period ended.
    return { status: 'done', period: periods[periods.length - 1], remainingMs: 0, totalMs: 1, activeMs: session.periodStartMs }
  }
  const active = activeMs(session, now)
  const total = periodMs(session, periods)
  return {
    status: session.pausedAt ? 'paused' : 'running',
    period: periods[session.index],
    remainingMs: Math.min(total, Math.max(0, session.periodStartMs + total - active)),
    totalMs: total,
    activeMs: active,
  }
}

const pad = n => String(n).padStart(2, '0')

// 32480 ms -> { main: '00:32', hundredths: '48' }, for the big circle.
export function splitClock(ms) {
  const hundredths = Math.max(0, Math.floor(ms / 10))
  const seconds = Math.floor(hundredths / 100)
  return { main: `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`, hundredths: pad(hundredths % 100) }
}

// Whole seconds -> "27:35", or "1:05:00" from an hour up.
export function sessionClock(seconds) {
  const s = Math.max(0, seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}
