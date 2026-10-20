import { todayKey } from './repeat.js'
import TimePicker from './TimePicker.jsx'

// "Add to calendar" for a Day goal: off = no date or time;
// on = a date (today to start) and an optional time.
// When it's off, "Show in Now (ASAP)" puts it in the Now box on Today.
// `when` is { date, time, asap } with '' meaning "not set".
function WhenFields({ when, onChange }) {
  const onCalendar = Boolean(when.date)
  return (
    <div className="when-fields">
      <label className="done-toggle">
        <input
          type="checkbox"
          checked={onCalendar}
          onChange={e =>
            onChange(e.target.checked ? { date: todayKey(), time: '', asap: false } : { date: '', time: '', asap: when.asap })
          }
          aria-label="Add to calendar"
        />
        <span>📅 Add to calendar</span>
      </label>
      {onCalendar ? (
        <div className="row">
          <input
            type="date"
            value={when.date}
            onChange={e => onChange({ ...when, date: e.target.value })}
            aria-label="Date"
            required
          />
        </div>
      ) : null}
      {onCalendar ? (
        <TimePicker value={when.time} onChange={time => onChange({ ...when, time })} label="Time" />
      ) : (
        <label className="done-toggle">
          <input
            type="checkbox"
            checked={Boolean(when.asap)}
            onChange={e => onChange({ ...when, asap: e.target.checked })}
            aria-label="Show in Now (ASAP)"
          />
          <span>⚡ Show in Now (ASAP)</span>
        </label>
      )}
    </div>
  )
}

export default WhenFields
