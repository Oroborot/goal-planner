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

// The goals with a bigger timeframe than `timeframe`: the ones a goal can
// count toward. Closest timeframe first. `excludeId` leaves out one goal
// (the goal being edited).
export function biggerGoals(goals, timeframe, excludeId = null) {
  return goals
    .filter(goal => goal.id !== excludeId && sizeOf(goal.timeframe) > sizeOf(timeframe))
    .sort((a, b) => sizeOf(a.timeframe) - sizeOf(b.timeframe))
}

// The goals with a smaller timeframe than `timeframe`: the ones that can be
// linked under a goal. Closest timeframe first.
export function smallerGoals(goals, timeframe, excludeId = null) {
  return goals
    .filter(goal => goal.id !== excludeId && sizeOf(goal.timeframe) < sizeOf(timeframe))
    .sort((a, b) => sizeOf(b.timeframe) - sizeOf(a.timeframe))
}

// The timeframes smaller than `timeframe`, e.g. Month -> Day and Week.
export function smallerTimeframes(timeframe) {
  return TIMEFRAMES.filter(t => sizeOf(t.value) < sizeOf(timeframe))
}
