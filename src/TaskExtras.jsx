// Importance and expected time: the input fields, and the small icon.
// The icon is kept simple on purpose; themes can change it later.

const IMPORTANCE = [
  { value: 0, label: 'No importance' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
]

const DURATIONS = [15, 30, 45, 60, 90, 120]

// The two fields side by side. `value` is { importance, duration } where
// duration is minutes or '' while empty.
export function TaskExtrasFields({ value, onChange, showDuration = true }) {
  return (
    <div className="row task-extras">
      <select
        value={value.importance}
        onChange={e => onChange({ ...value, importance: Number(e.target.value) })}
        aria-label="Importance"
      >
        {IMPORTANCE.map(i => (
          <option key={i.value} value={i.value}>
            {i.value === 0 ? 'Importance' : `${'●'.repeat(i.value)} ${i.label}`}
          </option>
        ))}
      </select>
      {showDuration && (
        <>
          <input
            type="number"
            min="1"
            max="720"
            list="duration-options"
            value={value.duration}
            onChange={e =>
              onChange({ ...value, duration: e.target.value === '' ? '' : Math.min(720, Math.max(1, Number(e.target.value))) })
            }
            placeholder="Time (min)"
            aria-label="Expected time in minutes"
          />
          <datalist id="duration-options">
            {DURATIONS.map(d => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </>
      )}
    </div>
  )
}

// ● / ●● / ●●● in the goal's color; nothing when importance isn't set.
export function ImportanceIcon({ importance, color }) {
  if (!importance) return null
  return (
    <span className="importance" style={{ color }} title={IMPORTANCE[importance].label} aria-label={`${IMPORTANCE[importance].label} importance`}>
      {'●'.repeat(importance)}
    </span>
  )
}
