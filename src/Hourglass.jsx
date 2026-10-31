import { useEffect, useRef, useState } from 'react'
import { hourglassById } from './hourglasses.js'
import { sandLevels } from './hourglassSand.js'

// True when the phone asks for less motion (an accessibility setting).
function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const media = window.matchMedia?.(query)
    if (!media) return
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Glides a number to its new value over ~0.7s when it jumps (e.g. after
// +5m), so the sand settles instead of snapping. Small steps (the normal
// second-by-second flow) are shown right away.
function useGlide(target, off) {
  const [shown, setShown] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = from.current
    if (off || Math.abs(target - start) < 0.01) {
      from.current = target
      setShown(target)
      return
    }
    let frame
    const began = performance.now()
    function step(time) {
      const t = Math.min(1, (time - began) / 700)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = start + (target - start) * eased
      from.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, off])
  return shown
}

// The hourglass on the Work tab, in the design picked in settings.
// - mode:      'countdown' or 'countup'
// - amount:    countdown: share of the plan done; countup: countUpFill()
// - flowing:   false freezes the sand (break, time's up, not started)
// - topText, bottomText: the two numbers (either can be empty)
function Hourglass({ designId, mode, amount, flowing, topText, bottomText, dimmed }) {
  const design = hourglassById(designId)
  const reduced = useReducedMotion()
  const shown = useGlide(amount, reduced)
  const levels = sandLevels(mode, shown)
  const { Component } = design
  const spots = design.text === 'inside' ? design.textSpots(levels) : null
  const percent = y => `${(y / design.height) * 100}%`

  return (
    <div className={dimmed ? 'hourglass dimmed' : 'hourglass'} role="timer">
      <div className="hourglass-art" style={{ aspectRatio: `${design.width} / ${design.height}` }}>
        <Component levels={levels} flowing={flowing && !reduced} />
        {spots && (
          <>
            {topText && (
              <span className="hourglass-text top" style={{ top: percent(spots.top) }}>
                {topText}
              </span>
            )}
            {bottomText && (
              <span className="hourglass-text bottom" style={{ top: percent(spots.bottom) }}>
                {bottomText}
              </span>
            )}
          </>
        )}
      </div>
      {!spots && (
        <div className="hourglass-below">
          {topText && <span className="hourglass-text top">{topText}</span>}
          {bottomText && <span className="hourglass-text bottom">{bottomText}</span>}
        </div>
      )}
    </div>
  )
}

export default Hourglass
