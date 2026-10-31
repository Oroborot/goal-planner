// How full each chamber of the hourglass is, worked out from the timer.
// This file knows nothing about how an hourglass looks, so every hourglass
// design uses the same rules. Levels are shares of a chamber's sand space:
// 0 = empty, 1 = as full as the design allows.

// Count-up mode's curve. The glass fills fast at first and then slower and
// slower, and never gets completely full (it creeps toward MAX_FILL).
// - MAX_FILL: the most the whole glass can ever look, 0..1
// - HALF_MINUTES: after this many minutes the glass is half of MAX_FILL
// With 0.94 and 75: 1h ≈ 40%, 2h ≈ 63%, 4h ≈ 82%, 10h ≈ 94% (never 100%).
export const COUNTUP_CURVE = { MAX_FILL: 0.94, HALF_MINUTES: 75 }

// Share of the whole glass the bottom chamber holds. Count-up fills the
// bottom first, then the top.
const BOTTOM_SHARE = 0.5

// 0..MAX_FILL: how full the whole glass looks after `focusMs` of count-up.
// A smooth "saturation" curve: 1 - 0.5^(minutes / HALF_MINUTES).
export function countUpFill(focusMs, curve = COUNTUP_CURVE) {
  const minutes = Math.max(0, focusMs) / 60000
  return curve.MAX_FILL * (1 - Math.pow(0.5, minutes / curve.HALF_MINUTES))
}

// The levels for a design to draw.
// - countdown: `amount` is the share of the plan done (0..1). Sand falls
//   from the top chamber into the bottom one.
// - countup: `amount` is countUpFill(). The bottom fills first, then the
//   top fills upward from the neck ("reverse gravity").
// Returns { top, bottom, stream, surface }:
// - stream:  true when sand should run through the neck
// - surface: 'funnel' (top sand dips in the middle as it drains) or 'flat'
export function sandLevels(mode, amount) {
  const a = Math.min(1, Math.max(0, amount))
  if (mode === 'countdown') {
    return { top: 1 - a, bottom: a, stream: a > 0 && a < 1, surface: 'funnel' }
  }
  const bottom = Math.min(1, a / BOTTOM_SHARE)
  const top = Math.max(0, (a - BOTTOM_SHARE) / (1 - BOTTOM_SHARE))
  return { top, bottom, stream: bottom > 0 && bottom < 1, surface: 'flat' }
}
