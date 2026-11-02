// The Work tab's saved data: projects, finished sessions and the picks the
// tab remembers (project, timer length). The running session is in
// workTimer.js.
//
// A saved session (see finishWork in workTimer.js):
// { id, projectId, mode, startedAt, endedAt, plannedMs, finalPlannedMs,
//   focusMs, breakMs, breaks: [{ start, end, ms }], wallMs, status,
//   progress, gains, note }
// - progress: how far toward the project's goal, in % (optional)
// - gains: what the session brought (optional), each one of:
//     { type: 'money', currency: 'GBP', value: 100 }
//     { type: 'item', text: 'New phone' }
//     { type: 'number', value: 30, unit: 'pages' }
// Breaks are kept one by one, so weekly break stats (count, average,
// per project, focus-to-break ratio) can be worked out later.
import { addDaysKey, dateKey, mondayOf, parseKey, todayKey } from './calendar.js'
import { GOAL_COLORS } from './colors.js'

const SESSIONS_KEY = 'planner-work-sessions'
const PROJECTS_KEY = 'planner-work-projects'
const PREFS_KEY = 'planner-work-prefs'

// Starting projects until the Projects tab exists. Replace freely.
const MOCK_PROJECTS = [
  { id: 'reading', name: 'Reading', color: '#f76b15' },
  { id: 'coding', name: 'Coding', color: '#0090ff' },
  { id: 'youtube', name: 'YouTube', color: '#e5484d' },
  { id: 'writing', name: 'Writing', color: '#30a46c' },
]

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export const loadSessions = () => read(SESSIONS_KEY, [])
export const saveSessions = sessions => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
export const loadProjects = () => read(PROJECTS_KEY, MOCK_PROJECTS)
export const saveProjects = projects => localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))

// minutes: 60, 120, any custom number, or null for "No limit".
// currency: the last currency used for a money gain.
export const loadPrefs = () => ({ projectId: 'reading', minutes: 60, currency: 'EUR', ...read(PREFS_KEY, {}) })
export const savePrefs = prefs => localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))

// Training time is saved in the same log as Work sessions. Its sessions have
// projectId 'training' and kind 'training'. The color follows the theme.
export const TRAINING_ID = 'training'
export const TRAINING_PROJECT = { id: TRAINING_ID, name: 'Training', color: 'var(--accent)' }

// The Work projects plus Training, unless the list already has it.
export const withTraining = projects => (projects.some(p => p.id === TRAINING_ID) ? projects : [...projects, TRAINING_PROJECT])

// Saves one Training session into the log. The id is the same for the same
// workout, so saving it twice (e.g. at the end, then again) never doubles it.
export function saveTrainingSession(record) {
  const others = loadSessions().filter(s => s.id !== record.id)
  saveSessions([...others, record])
}

export function newProject(projects, name) {
  const color = GOAL_COLORS[projects.length % GOAL_COLORS.length].value
  return { id: `p${Date.now().toString(36)}`, name: name.trim(), color }
}

// Sessions that aren't deleted.
const live = sessions => sessions.filter(s => !s.deletedAt)

// The 7 day keys of the week that `key` is in, Monday first.
export function weekDays(key = todayKey()) {
  const monday = mondayOf(key)
  return Array.from({ length: 7 }, (_, i) => addDaysKey(monday, i))
}

// Focused time on a day, per project: { projectId: ms }.
// A session counts on the day it started.
export function dayTotals(sessions, key) {
  const totals = {}
  for (const s of live(sessions)) {
    if (dateKey(new Date(s.startedAt)) !== key) continue
    totals[s.projectId] = (totals[s.projectId] || 0) + s.focusMs
  }
  return totals
}

// Break time on a day for one project.
export function dayBreakMs(sessions, key, projectId) {
  return live(sessions)
    .filter(s => s.projectId === projectId && dateKey(new Date(s.startedAt)) === key)
    .reduce((sum, s) => sum + s.breakMs, 0)
}

// Sessions in the week that `key` is in, newest first.
export function weekSessions(sessions, key = todayKey()) {
  const days = weekDays(key)
  const start = parseKey(days[0]).getTime()
  const end = parseKey(addDaysKey(days[6], 1)).getTime()
  return live(sessions)
    .filter(s => s.startedAt >= start && s.startedAt < end)
    .sort((a, b) => b.startedAt - a.startedAt)
}

// Focused time this week: in total, or for one project.
export function weekFocusMs(sessions, projectId = null, key = todayKey()) {
  return weekSessions(sessions, key)
    .filter(s => !projectId || s.projectId === projectId)
    .reduce((sum, s) => sum + s.focusMs, 0)
}

// Break numbers for a list of sessions, ready for the future break stats.
export function breakStats(sessions) {
  const all = live(sessions)
  const focus = all.reduce((sum, s) => sum + s.focusMs, 0)
  const breakTotal = all.reduce((sum, s) => sum + s.breakMs, 0)
  const count = all.reduce((sum, s) => sum + s.breaks.length, 0)
  return { focus, breakTotal, count, average: count ? breakTotal / count : 0, ratio: breakTotal ? focus / breakTotal : null }
}

// The little tags under a session in the week list.
export function sessionTags(session) {
  const tags = []
  if (session.progress !== null && session.progress !== undefined) tags.push(`Progress ${session.progress}%`)
  for (const gain of session.gains || []) tags.push(gainText(gain))
  if (session.note) tags.push(session.note)
  return tags
}

// Currencies offered for money gains. The last one used is remembered.
export const CURRENCIES = ['EUR', 'GBP', 'USD', 'RON', 'CHF', 'CAD', 'AUD', 'JPY']

// One gain as text: "£100.00", "New phone", "30 pages".
export function gainText(gain) {
  if (gain.type === 'money') {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: gain.currency }).format(gain.value)
    } catch {
      return `${gain.value} ${gain.currency}`
    }
  }
  if (gain.type === 'number') return `${gain.value} ${gain.unit}`.trim()
  return gain.text
}
