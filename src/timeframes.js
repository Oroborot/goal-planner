// The timeframes a goal can belong to, from smallest to biggest.
// `value` is what gets saved, `label` is what you see on screen.
export const TIMEFRAMES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

// How big a timeframe is: day = 0, week = 1, month = 2, year = 3.
export function sizeOf(timeframe) {
  return TIMEFRAMES.findIndex(t => t.value === timeframe)
}

export function labelOf(timeframe) {
  return TIMEFRAMES[sizeOf(timeframe)].label
}

// The goals that `timeframe` is allowed to link up to: only bigger ones,
// closest timeframe first. `excludeId` leaves out the goal being edited.
export function parentOptionsFor(goals, timeframe, excludeId = null) {
  return goals
    .filter(goal => goal.id !== excludeId && sizeOf(goal.timeframe) > sizeOf(timeframe))
    .sort((a, b) => sizeOf(a.timeframe) - sizeOf(b.timeframe))
}
