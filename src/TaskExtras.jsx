import Combo from './Combo.jsx'

// Importance and expected time: the input fields, and the small icon.
// The icon is kept simple on purpose; themes can change it later.

const IMPORTANCE = [
  { value: 0, label: 'No importance' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
]

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180]

// 90 -> "1h 30m" for the dropdown.
function durationLabel(m) {
  if (m < 60) return `${m} min`
  return m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`
}

// Reads what you type as minutes: "25", "1h", "1h 30", "1:30", "90m".
// Returns minutes, '' for an empty box, or undefined if it makes no sense.
function parseDuration(text) {
  const t = text.trim().toLowerCase().replace(/\s+/g, '')
  if (!t) return ''
  let m = t.match(/^(\d+)(m|min)?$/)
  if (m) return Math.min(720, Math.max(1, Number(m[1])))
  m = t.match(/^(\d+)(?:h|:)(\d{1,2})?m?$/)
  if (m) return Math.min(720, Math.max(1, Number(m[1]) * 60 + Number(m[2] || 0)))
  return undefined
}

// The two fields side by side. `value` is { importance, duration } where
// duration is minutes or '' while empty. Expected time: type any length,
// or pick from the short list under the box.
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
        <Combo
          value={value.duration}
          onChange={duration => onChange({ ...value, duration })}
          options={DURATIONS.map(d => ({ value: d, label: durationLabel(d) }))}
          format={d => (d ? durationLabel(Number(d)) : '')}
          parse={parseDuration}
          placeholder="Expected time"
          label="Expected time"
        />
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
