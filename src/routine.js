// Morning plan and evening wrap-up (Sunsama style).
// Each day you plan or wrap up gets a "day record" in the items list:
// { id: 'day-2026-10-20', list: 'days', date, plannedAt, wrappedAt,
//   top: [goal ids], energy: 1–5 | null, note }
// It lives with the goals, so the backup includes it automatically.
import { makeEvent } from './history.js'

// After this hour, Today offers the wrap-up instead of the plan.
export const EVENING_HOUR = 17

// How many tasks can be starred as the day's top ones.
export const TOP_COUNT = 3

export function dayRecord(items, date) {
  return (
    items.find(item => item.list === 'days' && item.date === date) || {
      id: `day-${date}`,
      list: 'days',
      date,
      title: `Day ${date}`,
      createdAt: new Date().toISOString(),
      plannedAt: null,
      wrappedAt: null,
      top: [],
      energy: null,
      note: '',
    }
  )
}

// Saves changes to a day's record (creating it the first time).
function saveDay(items, date, changes, events = []) {
  const record = { ...dayRecord(items, date), ...changes }
  const exists = items.some(item => item.id === record.id)
  return {
    items: exists ? items.map(item => (item.id === record.id ? record : item)) : [...items, record],
    events,
  }
}

// ★ a task as one of the day's top 3 (or un-star it). Ignored past 3.
export function toggleTop(items, date, goalId) {
  const { top } = dayRecord(items, date)
  if (top.includes(goalId)) return saveDay(items, date, { top: top.filter(id => id !== goalId) })
  if (top.length >= TOP_COUNT) return { items, events: [] }
  return saveDay(items, date, { top: [...top, goalId] })
}

export function setEnergy(items, date, energy, note) {
  return saveDay(items, date, { energy, note })
}

export function finishPlan(items, date) {
  const record = dayRecord(items, date)
  return saveDay(items, date, { plannedAt: new Date().toISOString() }, [
    makeEvent('day-planned', record, { top: record.top.length }),
  ])
}

export function finishWrapUp(items, date) {
  const record = dayRecord(items, date)
  return saveDay(items, date, { wrappedAt: new Date().toISOString() }, [
    makeEvent('day-wrapped', record, { energy: record.energy }),
  ])
}

// The ids starred for a day (only ones that still exist).
export function topIds(items, date) {
  return dayRecord(items, date).top
}

// Energy per day: { '2026-10-20': 4, … }, for Stats.
export function energyByDay(items) {
  const energy = {}
  for (const item of items) {
    if (item.list === 'days' && item.energy) energy[item.date] = item.energy
  }
  return energy
}
