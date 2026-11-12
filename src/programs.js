// Your own training programs, without any screen code.
//
// A program is a named list of workouts (for example Day A, Day B, Day C).
// Each workout is one interval session: exercise time, rest, a list of
// rounds, and how many sets. The workouts come up in order, so after you
// finish Day A the Training tab offers Day B, and so on round and round.
//
// Saved shape (localStorage 'planner-programs'):
// {
//   programs: [{ id, name, perWeek, workouts: [{ id, name, exerciseSeconds,
//                restSeconds, setRestSeconds, sets, rounds: [{ name, exerciseId }] }] }],
//   activeId: id of the program in use (or null),
//   log: [{ startedAt, programId, workoutId }]   // finished workouts
// }
import { EXERCISES } from './trainingData.js'

const KEY = 'planner-programs'

export function loadPrograms() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && Array.isArray(saved.programs)) return { activeId: null, log: [], ...saved }
  } catch {
    // Unreadable save: start empty.
  }
  return { programs: [], activeId: null, log: [] }
}

export function savePrograms(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export function newWorkout(name) {
  return {
    id: newId(),
    name,
    exerciseSeconds: 45,
    restSeconds: 10,
    setRestSeconds: 60,
    sets: 3,
    rounds: [{ name: '' }, { name: '' }, { name: '' }],
  }
}

export function newProgram(name) {
  return { id: newId(), name, perWeek: 3, workouts: [newWorkout('Day A')] }
}

export const activeProgram = state => state.programs.find(p => p.id === state.activeId) || null

// Whole number inside the limits; the fallback when it isn't a number.
function num(value, min, max, fallback) {
  const n = Math.round(Number(value))
  if (value === '' || Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

// Which workout of the program is next: one step further for every
// workout of this program that was finished.
export function nextWorkout(state, program) {
  if (!program || program.workouts.length === 0) return null
  const done = state.log.filter(entry => entry.programId === program.id).length
  return program.workouts[done % program.workouts.length]
}

// How many workouts of this program were finished since Monday.
export function doneThisWeek(state, program, now = Date.now()) {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  const monday = date.getTime()
  return state.log.filter(entry => entry.programId === program.id && entry.startedAt >= monday).length
}

// A workout turned into the plan the timer runs (same shape as the mock
// WORKOUT in trainingData.js). Round names that match a built-in exercise
// get its details; any other name is your own exercise.
export function workoutPlan(program, workout) {
  const byName = Object.fromEntries(Object.entries(EXERCISES).map(([id, e]) => [e.name.toLowerCase(), id]))
  const rounds = workout.rounds.map(r => {
    const name = r.name.trim()
    return { exerciseId: byName[name.toLowerCase()] || null, name: name || null }
  })
  return {
    name: workout.name,
    programId: program.id,
    workoutId: workout.id,
    exerciseSeconds: num(workout.exerciseSeconds, 5, 600, 45),
    restSeconds: num(workout.restSeconds, 0, 300, 10),
    setRestSeconds: num(workout.setRestSeconds, 0, 600, 60),
    sets: num(workout.sets, 1, 10, 1),
    rounds: rounds.length ? rounds : [{ exerciseId: null, name: null }],
  }
}

// Adds a finished workout to the log (once per start time).
export function withFinished(state, plan, startedAt) {
  if (!plan?.programId || state.log.some(entry => entry.startedAt === startedAt)) return state
  return { ...state, log: [...state.log, { startedAt, programId: plan.programId, workoutId: plan.workoutId }] }
}
