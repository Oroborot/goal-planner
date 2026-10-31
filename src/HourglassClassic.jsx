import { useId } from 'react'
import { BOTTOM_Y, GLASS, H, MID, NECK_TOP, W, surfaces } from './hourglassClassicShape.js'

// The classic hourglass (design "Option A"): a clear glass with two round
// chambers, a narrow neck and theme-colored sand. It only draws; the levels
// come from hourglassSand.js and the numbers are placed by Hourglass.jsx.
//
// Layers, back to front:
//   1. glass body (soft see-through fill)
//   2. sand (top chamber, bottom pile, the stream through the neck)
//   3. glass edge and reflections
// Colors come from CSS variables, so every theme recolors it.

function HourglassClassic({ levels, flowing }) {
  const id = useId()
  const { top, bottom } = surfaces(levels)
  // The top sand dips in the middle while it drains; the bottom pile is a
  // soft mound. Both shrink to flat when there's almost no sand.
  const dip = levels.surface === 'funnel' ? 9 * Math.min(1, levels.top * 6) * Math.min(1, (1 - levels.top) * 12) : 0
  // The pile grows into a cone as it fills, so a full bottom chamber
  // reaches up to the neck, just like the full top chamber at the start.
  const mound = Math.min(1, levels.bottom * 5) * (10 + 12 * levels.bottom)
  const showTop = levels.top > 0.002
  const showBottom = levels.bottom > 0.002
  const streamEnd = showBottom ? bottom - mound + 2 : BOTTOM_Y

  return (
    <svg className="hg-classic" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        {/* Only the upper chamber (used inside the glass clip below). */}
        <clipPath id={`${id}-top`}>
          <rect x="0" y="0" width={W} height={NECK_TOP + 2} />
        </clipPath>
        <clipPath id={`${id}-inside`}>
          <path d={GLASS} />
        </clipPath>
        <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="hg-sand-light" />
          <stop offset="1" className="hg-sand-deep" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="hg-glass-edge" />
          <stop offset="0.35" className="hg-glass-mid" />
          <stop offset="1" className="hg-glass-edge" />
        </linearGradient>
        {/* Fine grains, so the sand doesn't look like flat paint. */}
        <pattern id={`${id}-grain`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.7" className="hg-grain" />
          <circle cx="5" cy="4.5" r="0.55" className="hg-grain" />
        </pattern>
      </defs>

      {/* The caps at the top and bottom. */}
      <rect className="hg-cap" x="20" y="22" width="160" height="12" rx="6" />
      <rect className="hg-cap" x="20" y="306" width="160" height="12" rx="6" />

      <path d={GLASS} fill={`url(#${id}-glass)`} />

      <g clipPath={`url(#${id}-inside)`}>
        {showTop && (
          <g clipPath={`url(#${id}-top)`}>
            <path
              d={`M0,${top} Q${MID},${top + dip * 2} ${W},${top} L${W},${NECK_TOP + 2} L0,${NECK_TOP + 2} Z`}
              fill={`url(#${id}-sand)`}
            />
            <path
              d={`M0,${top} Q${MID},${top + dip * 2} ${W},${top} L${W},${NECK_TOP + 2} L0,${NECK_TOP + 2} Z`}
              fill={`url(#${id}-grain)`}
            />
          </g>
        )}
        {levels.stream && (
          <line
            className={flowing ? 'hg-stream flowing' : 'hg-stream'}
            x1={MID}
            y1={NECK_TOP - 2}
            x2={MID}
            y2={streamEnd}
          />
        )}
        {showBottom && (
          <>
            <path
              d={`M0,${BOTTOM_Y + 4} L0,${bottom + mound} Q${MID},${bottom - mound} ${W},${bottom + mound} L${W},${BOTTOM_Y + 4} Z`}
              fill={`url(#${id}-sand)`}
            />
            <path
              d={`M0,${BOTTOM_Y + 4} L0,${bottom + mound} Q${MID},${bottom - mound} ${W},${bottom + mound} L${W},${BOTTOM_Y + 4} Z`}
              fill={`url(#${id}-grain)`}
            />
          </>
        )}
      </g>

      {/* The glass edge and two soft reflections on the left. */}
      <path className="hg-edge" d={GLASS} />
      <path className="hg-shine" d="M42,62 C42,98 60,126 84,148" />
      <path className="hg-shine" d="M42,280 C42,246 58,220 82,198" />
      <path className="hg-shine soft" d="M158,70 C156,92 148,108 136,122" />
    </svg>
  )
}

export default HourglassClassic
