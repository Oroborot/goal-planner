// The shape of the classic hourglass (see HourglassClassic.jsx): its outline,
// and where the sand surface and the numbers sit for given sand levels.
// Kept apart from the drawing so screens can use it without React.

export const W = 200
export const H = 340
export const MID = W / 2
export const NECK_TOP = 166
export const NECK_BOTTOM = 174
const TOP_Y = 36 // inside top of the upper chamber
export const BOTTOM_Y = 304 // inside bottom of the lower chamber
const DEPTH = NECK_TOP - TOP_Y // how tall each chamber is (130)

// The glass outline: rounded chambers, narrow neck. The two halves mirror
// each other around the neck.
export const GLASS =
  'M36,36 H164 C170,36 172,42 172,54 C172,106 138,142 105,166 L105,174 ' +
  'C138,198 172,234 172,286 C172,298 170,304 164,304 H36 C30,304 28,298 28,286 ' +
  'C28,234 62,198 95,174 L95,166 C62,142 28,106 28,54 C28,42 30,36 36,36 Z'

// Sand only ever fills this share of a chamber, so a full chamber still
// has a little air at the top, like a real hourglass.
const MAX_SHARE = 0.95

// The chamber's half-width at each distance from the neck (0..DEPTH), read
// off the curved side of the outline (a cubic Bézier from the neck out).
function halfWidths() {
  const p = [
    [95, 166],
    [62, 142],
    [28, 106],
    [28, 54],
  ]
  const points = []
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    const u = 1 - t
    const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0]
    const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]
    points.push([NECK_TOP - y, MID - x])
  }
  const widths = []
  for (let d = 0; d <= DEPTH; d++) {
    const next = points.findIndex(([pd]) => pd >= d)
    if (next <= 0) widths.push(next === 0 ? points[0][1] : MID - 28)
    else {
      const [d0, w0] = points[next - 1]
      const [d1, w1] = points[next]
      widths.push(w0 + ((w1 - w0) * (d - d0)) / (d1 - d0))
    }
  }
  return widths
}

// Sand space from the neck out to each distance, so a share of sand can be
// turned into a height (the chamber is wider at the top, so the same
// amount of sand is a thinner layer there).
const WIDTHS = halfWidths()
const AREA = [0]
for (let d = 1; d <= DEPTH; d++) AREA.push(AREA[d - 1] + WIDTHS[d - 1] + WIDTHS[d])
const FULL = AREA[DEPTH]

// The distance from the neck where a given amount of sand space ends.
function distanceFor(area) {
  const d = AREA.findIndex(a => a >= area)
  if (d === -1) return DEPTH
  if (d === 0) return 0
  return d - 1 + (area - AREA[d - 1]) / (AREA[d] - AREA[d - 1])
}

// Where the sand surface is in each chamber (y in the drawing).
// Top: sand sits on the neck and reaches up. Bottom: sand sits on the floor.
export function surfaces(levels) {
  const topArea = levels.top * MAX_SHARE * FULL
  const bottomArea = levels.bottom * MAX_SHARE * FULL
  return {
    top: NECK_TOP - distanceFor(topArea),
    bottom: NECK_BOTTOM + distanceFor(FULL - bottomArea),
  }
}

// Where the two time labels go, as y in the drawing: one in the upper
// chamber, one low in the lower chamber. They stay put while the sand moves.
export function textSpots() {
  return { top: 102, bottom: 288 }
}
