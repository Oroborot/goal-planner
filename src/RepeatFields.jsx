import { WEEKDAYS } from './repeat.js'

// The "Repeat" part of the edit form.
// `value` is { mode, days, per, times }:
// - mode:  'none' (one-time goal), 'daily' or 'days' (only certain days)
// - days:  the chosen weekdays when mode is 'days'
// - per / times: the target, e.g. 3 times a 'week'
function RepeatFields({ value, onChange }) {
  const set = changes => onChange({ ...value, ...changes })

  function toggleDay(day) {
    const days = value.days.includes(day)
      ? value.days.filter(d => d !== day)
      : [...value.days, day]
    set({ days })
  }

  return (
    <fieldset className="link-list repeat-fields">
      <legend>Repeat</legend>
      <select
        value={value.mode}
        onChange={e => set({ mode: e.target.value })}
        aria-label="Repeat"
      >
        <option value="none">Doesn't repeat (one-time goal)</option>
        <option value="daily">Every day</option>
        <option value="days">Certain days</option>
      </select>

      {value.mode === 'days' && (
        <div className="day-picker">
          {WEEKDAYS.map(d => (
            <label key={d.value} className={value.days.includes(d.value) ? 'day on' : 'day'}>
              <input
                type="checkbox"
                checked={value.days.includes(d.value)}
                onChange={() => toggleDay(d.value)}
                aria-label={d.short}
              />
              {d.short}
            </label>
          ))}
        </div>
      )}

      {value.mode !== 'none' && (
        <div className="row target-row">
          <span>Target:</span>
          {value.per !== 'day' && (
            <input
              type="number"
              min="1"
              max="31"
              value={value.times}
              onChange={e => set({ times: Math.max(1, Number(e.target.value) || 1) })}
              aria-label="Times"
            />
          )}
          <select
            value={value.per}
            onChange={e => set({ per: e.target.value })}
            aria-label="Target period"
          >
            <option value="day">each planned day</option>
            <option value="week">times a week</option>
            <option value="month">times a month</option>
          </select>
        </div>
      )}
    </fieldset>
  )
}

export default RepeatFields
