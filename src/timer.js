// The timer: one at a time, for a goal or a note task.
// While it runs, its state is saved so a refresh doesn't lose it:
// { itemId, title, mode, startedAt, durationMs, pausedAt, pausedTotalMs }
// - mode:       'up' (how long I worked) or 'down' (time left)
// - durationMs: the countdown length (mode 'down' only)
// - pausedAt:   when it was paused, or null while running
// - pausedTotalMs: time spent paused so far, which doesn't count
// Finished sessions go into the history log as 'timed' events.

export const TIMER_KEY = 'planner-timer'

export function loadTimer() {
  try {
    return JSON.parse(localStorage.getItem(TIMER_KEY))
  } catch {
    return null
  }
}

export function saveTimer(timer) {
  if (timer) localStorage.setItem(TIMER_KEY, JSON.stringify(timer))
  else localStorage.removeItem(TIMER_KEY)
}

// `seconds` is the countdown length (mode 'down' only).
export function startTimer(item, mode, seconds) {
  return {
    itemId: item.id,
    title: item.title,
    mode,
    startedAt: Date.now(),
    durationMs: mode === 'down' ? seconds * 1000 : null,
    pausedAt: null,
    pausedTotalMs: 0,
  }
}

export function pauseTimer(timer) {
  return { ...timer, pausedAt: Date.now() }
}

export function resumeTimer(timer) {
  return {
    ...timer,
    pausedTotalMs: timer.pausedTotalMs + (Date.now() - timer.pausedAt),
    pausedAt: null,
  }
}

// Time actually worked so far (pauses left out).
export function elapsedMs(timer, now) {
  const end = timer.pausedAt ?? now
  return Math.max(0, end - timer.startedAt - timer.pausedTotalMs)
}

// Countdown only: time left, never below 0.
export function remainingMs(timer, now) {
  return Math.max(0, timer.durationMs - elapsedMs(timer, now))
}

// "4:05", or "1:02:03" past an hour.
export function formatClock(ms) {
  const total = Math.round(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = n => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

// "1 min 23 sec", "40 sec", …
export { formatSeconds as formatDuration } from './history.js'

// Total time and number of sessions for an item, from the history log.
export function timeTotals(events, itemId) {
  const sessions = events.filter(e => e.itemId === itemId && e.type === 'timed')
  return {
    seconds: sessions.reduce((sum, e) => sum + e.seconds, 0),
    sessions: sessions.length,
  }
}

// A short beep and a buzz (on phones) when a countdown ends.
export function alarm() {
  try {
    const audio = new AudioContext()
    const tone = audio.createOscillator()
    const volume = audio.createGain()
    tone.frequency.value = 880
    volume.gain.setValueAtTime(0.2, audio.currentTime)
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.2)
    tone.connect(volume).connect(audio.destination)
    tone.start()
    tone.stop(audio.currentTime + 1.2)
  } catch {
    // No sound available; the banner still shows.
  }
  navigator.vibrate?.([300, 150, 300])
}
