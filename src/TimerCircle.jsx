import { useId } from 'react'

// The big round timer on the Training tab: a thin orange ring and soft
// orange liquid. `fraction` is how much of the period is left (1 = full,
// 0 = done). Each period starts full to the top and drains to empty, and
// the ring shrinks clockwise with it. `phase` slowly moves the liquid's
// surface.
const SIZE = 320
const CENTER = SIZE / 2
const RING = 150 // radius of the ring
const INNER = 138 // radius of the disc that holds the liquid
const RING_LENGTH = 2 * Math.PI * RING

// The liquid's top edge: a gentle wave across the disc, filled down to the
// bottom. `level` is the y of the surface, `amp` the wave height.
function wavePath(level, phase, amp) {
  const points = []
  for (let x = 0; x <= SIZE; x += 8) {
    const y = level + Math.sin((x / SIZE) * 2 * Math.PI + phase) * amp
    points.push(`${x},${y.toFixed(1)}`)
  }
  return `M0,${SIZE} L${points.join(' L')} L${SIZE},${SIZE} Z`
}

function TimerCircle({ fraction, phase, label, clock }) {
  const id = useId()
  const f = Math.min(1, Math.max(0, fraction))
  // The surface goes from the top of the disc (full) to the bottom (empty),
  // in step with the time left.
  const bottom = CENTER + INNER
  const level = bottom - f * INNER * 2
  // A flatter wave when almost empty, so it never pokes up out of nothing.
  const amp = 7 * Math.min(1, f * 5)

  return (
    <div className="timer-circle" role="timer">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <defs>
          <clipPath id={`${id}-clip`}>
            <circle cx={CENTER} cy={CENTER} r={INNER} />
          </clipPath>
          <linearGradient id={`${id}-disc`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="timer-circle-disc-top" />
            <stop offset="1" className="timer-circle-disc-bottom" />
          </linearGradient>
          {/* Lighter at the top, a bit deeper toward the bottom. */}
          <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="timer-circle-liquid-top" />
            <stop offset="1" className="timer-circle-liquid-bottom" />
          </linearGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={INNER} fill={`url(#${id}-disc)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <path className="timer-circle-liquid back" d={wavePath(level - 4, phase + 1.8, amp)} />
          <path fill={`url(#${id}-liquid)`} d={wavePath(level, phase, amp)} />
        </g>
        <circle className="timer-circle-track" cx={CENTER} cy={CENTER} r={RING} />
        {/* The orange part ends at the top; its start moves clockwise from
            the top as time passes, so it shrinks clockwise. */}
        {f > 0 && (
          <circle
            className="timer-circle-ring"
            cx={CENTER}
            cy={CENTER}
            r={RING}
            strokeDasharray={`${f * RING_LENGTH} ${RING_LENGTH}`}
            strokeDashoffset={-(1 - f) * RING_LENGTH}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        )}
      </svg>
      <div className="timer-circle-text">
        {label && <span className="timer-circle-label">{label}</span>}
        <span className="timer-circle-clock">
          {clock.main}
          <small>.{clock.hundredths}</small>
        </span>
      </div>
    </div>
  )
}

export default TimerCircle
