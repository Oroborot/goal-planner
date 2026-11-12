import { useState } from 'react'
import { newProgram, newWorkout } from './programs.js'
import { EXERCISES } from './trainingData.js'

// The number fields of a workout, in the order they show.
const NUMBER_FIELDS = [
  { key: 'exerciseSeconds', label: 'Exercise', unit: 'sec' },
  { key: 'restSeconds', label: 'Rest', unit: 'sec' },
  { key: 'setRestSeconds', label: 'Set rest', unit: 'sec' },
  { key: 'sets', label: 'Sets', unit: '' },
]

// The Programs sheet on the Training tab. Three pages in one sheet:
// the list of programs -> one program (its workouts) -> one workout (its
// rounds). Every change is saved right away, so there is no Save button.
function ProgramsSheet({ state, onChange, onClose }) {
  // Where we are: { programId, workoutId } (both null = the list).
  const [at, setAt] = useState({ programId: null, workoutId: null })
  const program = state.programs.find(p => p.id === at.programId) || null
  const workout = program?.workouts.find(w => w.id === at.workoutId) || null

  function editProgram(id, change) {
    onChange({ ...state, programs: state.programs.map(p => (p.id === id ? { ...p, ...change } : p)) })
  }
  function editWorkout(change) {
    editProgram(program.id, { workouts: program.workouts.map(w => (w.id === workout.id ? { ...w, ...change } : w)) })
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
    setAt({ programId: program.id, workoutId: created.id })
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

  const title = workout ? workout.name || 'Workout' : program ? program.name || 'Program' : 'Programs'

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
                  <button key={w.id} type="button" className="program-row program-name" onClick={() => setAt({ programId: program.id, workoutId: w.id })}>
                    <strong>{w.name}</strong>
                    <span>
                      {w.rounds.length} rounds × {w.sets} sets · {w.exerciseSeconds}s
                    </span>
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
              <label className="training-setting">
                <span>Name</span>
                <input className="program-text" value={workout.name} onChange={e => editWorkout({ name: e.target.value })} />
              </label>
              {NUMBER_FIELDS.map(({ key, label, unit }) => (
                <label key={key} className="training-setting">
                  <span>{label}</span>
                  <input type="number" inputMode="numeric" value={workout[key]} onChange={e => editWorkout({ [key]: e.target.value })} />
                  <span className="training-setting-unit">{unit}</span>
                </label>
              ))}
              <h3 className="program-head">Rounds (repeated for each set)</h3>
              <datalist id="exercise-names">
                {Object.values(EXERCISES).map(e => (
                  <option key={e.name} value={e.name} />
                ))}
              </datalist>
              <div className="program-list">
                {workout.rounds.map((round, i) => (
                  <div key={i} className="program-row">
                    <span className="program-num">{i + 1}</span>
                    <input
                      className="program-text"
                      list="exercise-names"
                      placeholder="Exercise (empty = Freestyle)"
                      value={round.name}
                      onChange={e => editWorkout({ rounds: workout.rounds.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)) })}
                    />
                    <button
                      type="button"
                      className="sheet-x"
                      aria-label="Remove round"
                      onClick={() => editWorkout({ rounds: workout.rounds.filter((_, j) => j !== i) })}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="program-actions">
                <button type="button" className="program-link" onClick={() => editWorkout({ rounds: [...workout.rounds, { name: '' }] })}>
                  ＋ Add round
                </button>
                <button type="button" className="program-link" onClick={back}>
                  Done
                </button>
              </div>
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
