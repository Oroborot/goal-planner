import { WEEKDAYS } from './repeat.js'

// A small "Repeat" picker: how often, and on which weekdays.
// `value` is { mode, days }: mode is 'none', 'daily' or 'days'.
// With `allowNone` false, "No repeat" is not offered.
function DayPick({ value, onChange, allowNone = true }) {
  const set = changes => onChange({ ...value, ...changes })
  function toggleDay(day) {
    const days = value.days.includes(day) ? value.days.filter(d => d !== day) : [...value.days, day]
    set({ days })
  }
  return (
    <>
      <select value={value.mode} onChange={e => set({ mode: e.target.value })} aria-label="Repeat">
        {allowNone && <option value="none">No repeat</option>}
        <option value="daily">Every day</option>
        <option value="days">Certain days</option>
      </select>
      {value.mode === 'days' && (
        <div className="day-picker">
          {WEEKDAYS.map(d => (
            <label key={d.value} className={value.days.includes(d.value) ? 'day on' : 'day'}>
              <input type="checkbox" checked={value.days.includes(d.value)} onChange={() => toggleDay(d.value)} aria-label={d.short} />
              {d.short}
            </label>
          ))}
        </div>
      )}
    </>
  )
}

export default DayPick
