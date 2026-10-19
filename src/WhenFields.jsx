import { todayKey } from './repeat.js'

// "Add to calendar" for a Day goal: off = no date or time;
// on = a date (today to start) and an optional time.
// `when` is { date, time } with '' meaning "not set".
function WhenFields({ when, onChange }) {
  const onCalendar = Boolean(when.date)
  return (
    <div className="when-fields">
      <label className="done-toggle">
        <input
          type="checkbox"
          checked={onCalendar}
          onChange={e => onChange(e.target.checked ? { date: todayKey(), time: '' } : { date: '', time: '' })}
          aria-label="Add to calendar"
        />
        <span>📅 Add to calendar</span>
      </label>
      {onCalendar && (
        <div className="row">
          <input
            type="date"
            value={when.date}
            onChange={e => onChange({ ...when, date: e.target.value })}
            aria-label="Date"
            required
          />
          <input
            type="time"
            value={when.time}
            onChange={e => onChange({ ...when, time: e.target.value })}
            aria-label="Time (optional)"
          />
        </div>
      )}
    </div>
  )
}

export default WhenFields
