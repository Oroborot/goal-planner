import { useState } from 'react'
import { blockName, newBlock, newProgram, newWorkout, workoutSummary } from './programs.js'
import { EXERCISES } from './trainingData.js'

// The three time fields of a workout, in the order they show.
const TIME_FIELDS = [
  { key: 'exerciseSeconds', label: 'Exercise' },
  { key: 'restSeconds', label: 'Rest' },
  { key: 'setRestSeconds', label: 'Set rest' },
]

// The Programs sheet on the Training tab. Three pages in one sheet:
// the list of programs -> one program (its workouts) -> one workout (its
// rounds). Every change is saved right away, so there is no Save button.
function ProgramsSheet({ state, onChange, onClose }) {
  // Where we are: { programId, workoutId } (both null = the list).
  const [at, setAt] = useState({ programId: null, workoutId: null })
  const program = state.programs.find(p => p.id === at.programId) || null
  const workout = program?.workouts.find(w => w.id === at.workoutId) || null
  // The block (Set A, Set B, …) picked in the workout editor's tabs.
  const [blockAt, setBlockAt] = useState(0)
  const block = workout ? workout.blocks[Math.min(blockAt, workout.blocks.length - 1)] : null

  function editProgram(id, change) {
    onChange({ ...state, programs: state.programs.map(p => (p.id === id ? { ...p, ...change } : p)) })
  }
  function editWorkout(change) {
    editProgram(program.id, { workouts: program.workouts.map(w => (w.id === workout.id ? { ...w, ...change } : w)) })
  }
  function editBlock(change) {
    editWorkout({ blocks: workout.blocks.map(b => (b.id === block.id ? { ...b, ...change } : b)) })
  }
  function addBlock() {
    editWorkout({ blocks: [...workout.blocks, newBlock(blockName(workout.blocks.length))] })
    setBlockAt(workout.blocks.length)
  }
  // The blocks left are named again A, B, C, … so there are no gaps.
  function deleteBlock() {
    if (workout.blocks.length < 2) return
    if (!window.confirm(`Delete "${block.name}"?`)) return
    const blocks = workout.blocks.filter(b => b.id !== block.id).map((b, i) => ({ ...b, name: blockName(i) }))
    editWorkout({ blocks })
    setBlockAt(0)
  }
  function openWorkout(id) {
    setBlockAt(0)
    setAt({ programId: program.id, workoutId: id })
  }

  function addProgram() {
    const created = newProgram('My program')
    onChange({ ...state, programs: [...state.programs, created], activeId: state.activeId || created.id })
    setAt({ programId: created.id, workoutId: null })
  }
  function deleteProgram() {
    if (!window.confirm(`Delete "${program.name}"?`)) return
    const programs = state.programs.filter(p => p.id !== program.id)
    onChange({ ...state, programs, activeId: state.activeId === program.id ? programs[0]?.id || null : state.activeId })
    setAt({ programId: null, workoutId: null })
  }
  function addWorkout() {
    const created = newWorkout(`Day ${String.fromCharCode(65 + program.workouts.length)}`)
    editProgram(program.id, { workouts: [...program.workouts, created] })
    openWorkout(created.id)
  }
  function deleteWorkout() {
    if (program.workouts.length < 2) return
    if (!window.confirm(`Delete "${workout.name}"?`)) return
    editProgram(program.id, { workouts: program.workouts.filter(w => w.id !== workout.id) })
    setAt({ programId: program.id, workoutId: null })
  }

  function back() {
    if (workout) setAt({ programId: program.id, workoutId: null })
    else if (program) setAt({ programId: null, workoutId: null })
    else onClose()
  }

  const title = workout ? 'Edit workout' : program ? program.name || 'Program' : 'Programs'

  return (
    <div className="training-backdrop" onClick={onClose}>
      <div className="training-panel" role="dialog" aria-label="Programs" onClick={e => e.stopPropagation()}>
        <div className="training-panel-grab">
          <div className="sheet-handle" />
          <div className="training-panel-head">
            {program && (
              <button type="button" className="training-panel-back" onClick={back} aria-label="Back">
                ‹
              </button>
            )}
            <h2>{title}</h2>
            <button type="button" className="sheet-x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="training-panel-body">
          {/* Page 1: all programs. Tap the dot to use one. */}
          {!program && (
            <>
              {state.programs.length === 0 && <p className="training-panel-note">No program yet. Make your own: workouts, exercises and times.</p>}
              <div className="program-list">
                {state.programs.map(p => (
                  <div key={p.id} className="program-row">
                    <button
                      type="button"
                      className={p.id === state.activeId ? 'program-dot on' : 'program-dot'}
                      onClick={() => onChange({ ...state, activeId: p.id })}
                      aria-label={`Use ${p.name}`}
                    />
                    <button type="button" className="program-name" onClick={() => setAt({ programId: p.id, workoutId: null })}>
                      <strong>{p.name}</strong>
                      <span>
                        {p.workouts.length} {p.workouts.length === 1 ? 'workout' : 'workouts'} · {p.perWeek} a week
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="training-settings-save" onClick={addProgram}>
                ＋ New program
              </button>
            </>
          )}

          {/* Page 2: one program. */}
          {program && !workout && (
            <>
              <label className="training-setting">
                <span>Name</span>
                <input className="program-text" value={program.name} onChange={e => editProgram(program.id, { name: e.target.value })} />
              </label>
              <label className="training-setting">
                <span>Workouts per week</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="14"
                  value={program.perWeek}
                  onChange={e => editProgram(program.id, { perWeek: e.target.value === '' ? '' : Math.min(14, Math.max(1, Number(e.target.value))) })}
                />
              </label>
              <h3 className="program-head">Workouts (they come up in this order)</h3>
              <div className="program-list">
                {program.workouts.map(w => (
                  <button key={w.id} type="button" className="program-row program-name" onClick={() => openWorkout(w.id)}>
                    <strong>{w.name}</strong>
                    <span>{workoutSummary(w)}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="program-link" onClick={addWorkout}>
                ＋ Add workout
              </button>
              <button type="button" className="program-link danger" onClick={deleteProgram}>
                Delete program
              </button>
            </>
          )}

          {/* Page 3: one workout. */}
          {workout && (
            <>
              <label className="workout-name">
                <span>Name</span>
                <input value={workout.name} onChange={e => editWorkout({ name: e.target.value })} />
              </label>
              {/* One tab per block; ＋ adds one. Everything below edits the picked block. */}
              <div className="workout-tabs" role="tablist">
                {workout.blocks.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    role="tab"
                    aria-selected={b.id === block.id}
                    className={b.id === block.id ? 'workout-tab on' : 'workout-tab'}
                    onClick={() => setBlockAt(workout.blocks.indexOf(b))}
                  >
                    {b.name}
                  </button>
                ))}
                <button type="button" className="workout-tab add" onClick={addBlock} aria-label="Add a set block">
                  ＋
                </button>
              </div>
              <div className="workout-times">
                {TIME_FIELDS.map(({ key, label }) => (
                  <label key={key} className="workout-time">
                    <span>{label}</span>
                    <input type="number" inputMode="numeric" value={block[key]} onChange={e => editBlock({ [key]: e.target.value })} />
                    <small>sec</small>
                  </label>
                ))}
              </div>
              <div className="workout-sets">
                <strong>Sets</strong>
                <div className="workout-stepper">
                  <button type="button" aria-label="Fewer sets" onClick={() => editBlock({ sets: Math.max(1, (Number(block.sets) || 1) - 1) })}>
                    −
                  </button>
                  <input type="number" inputMode="numeric" aria-label="Sets" value={block.sets} onChange={e => editBlock({ sets: e.target.value })} />
                  <button type="button" aria-label="More sets" onClick={() => editBlock({ sets: Math.min(99, (Number(block.sets) || 0) + 1) })}>
                    ＋
                  </button>
                </div>
              </div>
              <div className="workout-rounds-head">
                <strong>Rounds</strong>
                <span>Repeated for each set</span>
              </div>
              <datalist id="exercise-names">
                {Object.values(EXERCISES).map(e => (
                  <option key={e.name} value={e.name} />
                ))}
              </datalist>
              <div className="workout-rounds">
                {block.rounds.map((round, i) => (
                  <div key={i} className="workout-round">
                    <span className="workout-round-num">{String(i + 1).padStart(2, '0')}</span>
                    <input
                      list="exercise-names"
                      placeholder="Exercise (empty = Freestyle)"
                      value={round.name}
                      onChange={e => editBlock({ rounds: block.rounds.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)) })}
                    />
                    <button
                      type="button"
                      className="sheet-x"
                      aria-label="Remove round"
                      onClick={() => editBlock({ rounds: block.rounds.filter((_, j) => j !== i) })}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="workout-add" onClick={() => editBlock({ rounds: [...block.rounds, { name: '' }] })}>
                ＋ Add round
              </button>
              {workout.blocks.length > 1 && (
                <button type="button" className="program-link danger" onClick={deleteBlock}>
                  Delete {block.name}
                </button>
              )}
              <button type="button" className="training-settings-save workout-done" onClick={back}>
                Done
              </button>
              {program.workouts.length > 1 && (
                <button type="button" className="program-link danger" onClick={deleteWorkout}>
                  Delete workout
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgramsSheet
