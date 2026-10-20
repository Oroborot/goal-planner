// Your preferences, saved in localStorage. More (colors, icons, fonts,
// themes) come with "Customize" later.
// { clock: '24' | '12', theme: 'violet' | 'gold' | …, mode: 'dark' | 'light' | 'auto',
//   routineView: 'stepped' | 'compact' (plan and wrap-up) }

const SETTINGS_KEY = 'planner-settings'
const DEFAULTS = { clock: '24', theme: 'violet', mode: 'dark', routineView: 'stepped' }

export function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  current = settings
}

// The settings in use right now, so helpers like showTime() can read them.
let current = loadSettings()

export function getSettings() {
  return current
}

// '18:30' -> '18:30' (24-hour clock) or '6:30 PM' (12-hour clock).
export function showTime(time) {
  if (!time) return ''
  if (current.clock !== '12') return time
  const [h, m] = time.split(':').map(Number)
  const suffix = h < 12 ? 'AM' : 'PM'
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`
}
