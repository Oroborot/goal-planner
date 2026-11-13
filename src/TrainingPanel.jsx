import { useRef, useState } from 'react'
import AppIcon from './icons.jsx'
import { VARIATIONS } from './trainingData.js'
import { addVote, getTally, ratingKey } from './ratings.js'

// How far (in px) the panel has to be pulled down before it closes.
const SWIPE_CLOSE = 80

// A drawing slot. Shows the real picture when `src` is set; until then a
// soft placeholder box with a small label, so real images can be dropped
// into the data later without code changes.
function Drawing({ src, label, className }) {
  if (src) return <img className={`training-drawing ${className}`} src={src} alt={label} />
  return (
    <div className={`training-drawing placeholder ${className}`} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  )
}

// Everything about one exercise or variation: 2 position drawings, the
// primary muscles (body figure + list) and numbered instructions.
// `exercise` can be null for a Freestyle round.
function ExerciseDetails({ exercise, fallback }) {
  if (!exercise) {
    return <p className="training-panel-note">No set exercise this round. Do any move you like.</p>
  }
  // Your own exercise name: no pictures or steps, just a short note.
  if (exercise.custom) {
    return <p className="training-panel-note">Your own exercise. No instructions or pictures yet.</p>
  }
  const images = exercise.images || {}
  const muscles = exercise.muscles || fallback?.muscles || []
  const instructions = exercise.instructions || []

  return (
    <>
      <div className="training-details-top">
        <div className="training-positions">
          <Drawing src={images.positions?.[0]} label="Start position" className="position" />
          <Drawing src={images.positions?.[1]} label="End position" className="position" />
        </div>
        <div className="training-muscles">
          <h3>Primary muscles</h3>
          <Drawing src={images.muscles} label="Body" className="body" />
          <ul>
            {muscles.map(muscle => (
              <li key={muscle}>{muscle}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="training-instructions">
        <h3>Instructions</h3>
        {instructions.length > 0 ? (
          <ol>
            {instructions.map((step, i) => (
              <li key={i}>
                <span className="training-step">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="training-panel-note">{exercise.description}</p>
        )}
      </div>
    </>
  )
}

// Small − and ＋ buttons. Each tap adds one vote for this exercise (saved
// with the date) and the running tally is shown next to them. The buttons
// flash briefly so you can feel the tap. `rateKey` is the exercise id (or
// the lowercase custom name).
function RateBar({ rateKey }) {
  const [tally, setTally] = useState(() => getTally(rateKey))
  const [flash, setFlash] = useState(null)

  function vote(v) {
    setTally(addVote(rateKey, v))
    setFlash(v)
    setTimeout(() => setFlash(null), 250)
  }

  return (
    <div className="rate-bar">
      <button type="button" className={`rate-btn${flash === -1 ? ' flash' : ''}`} onClick={() => vote(-1)} aria-label="Dislike this exercise">
        −
      </button>
      <span className="rate-tally">− {tally.minus} · ＋ {tally.plus}</span>
      <button type="button" className={`rate-btn${flash === 1 ? ' flash' : ''}`} onClick={() => vote(1)} aria-label="Like this exercise">
        ＋
      </button>
    </div>
  )
}

// The bottom panel on the Training tab. `type` is 'details' (the current
// exercise) or 'variations' (its variations list). It sits above the
// Pause / Skip / +10s buttons, so they stay usable, and the timer keeps
// running behind it. Closes with ✕, a tap on the dimmed screen, or a swipe
// down on the top part.
function TrainingPanel({ type, exercise: given, exerciseId, name, onClose }) {
  // A round with your own exercise name has no data: show just the name.
  const exercise = given || (name ? { name, custom: true } : null)
  // The variation picked in the list (only shows its details, never changes
  // the exercise in the workout).
  const [pickedId, setPickedId] = useState(null)
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef(null)

  function dragBegin(e) {
    dragStart.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function dragMove(e) {
    if (dragStart.current === null) return
    setDragY(Math.max(0, e.clientY - dragStart.current))
  }
  function dragEnd() {
    if (dragStart.current === null) return
    dragStart.current = null
    if (dragY > SWIPE_CLOSE) onClose()
    else setDragY(0)
  }

  const picked = pickedId ? VARIATIONS[pickedId] : null
  const variationIds = exercise?.variations || []

  // What the votes are saved under: the picked variation's id, the exercise
  // id, or the lowercase custom name.
  const rateId = picked ? ratingKey(pickedId) : ratingKey(exerciseId, exercise?.name)

  let title = exercise ? exercise.name : 'Freestyle'
  if (type === 'variations') title = picked ? picked.name : 'Variations'

  return (
    <div className="training-backdrop" onClick={onClose}>
      <div
        className="training-panel"
        role="dialog"
        aria-label={title}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="training-panel-grab"
          onPointerDown={dragBegin}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
        >
          <div className="sheet-handle" />
          <div className="training-panel-head">
            {picked && (
              <button
                type="button"
                className="training-panel-back"
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setPickedId(null)}
                aria-label="Back to variations"
              >
                <AppIcon name="chevronLeft" size={22} />
              </button>
            )}
            <h2>{title}</h2>
            <button
              type="button"
              className="sheet-x"
              onPointerDown={e => e.stopPropagation()}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="training-panel-body">
          {type === 'details' && <ExerciseDetails exercise={exercise} />}
          {type === 'variations' && picked && <ExerciseDetails exercise={picked} fallback={exercise} />}
          {type === 'variations' && !picked && (
            <div className="training-variations">
              {variationIds.map(id => {
                const variation = VARIATIONS[id]
                return (
                  <button key={id} type="button" className="training-variation" onClick={() => setPickedId(id)}>
                    <Drawing src={variation.images?.thumb} label="Picture" className="thumb" />
                    <span className="training-variation-text">
                      <strong>{variation.name}</strong>
                      <span>{variation.description}</span>
                    </span>
                    <AppIcon name="chevron" size={18} />
                  </button>
                )
              })}
            </div>
          )}
          {/* Rating: for the exercise itself, or the picked variation. Not for Freestyle. */}
          {exercise && (type === 'details' || picked) && (
            <RateBar
              key={rateId}
              rateKey={rateId}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainingPanel
