import Combo from './Combo.jsx'
import { showTime } from './settings.js'

const pad = n => String(n).padStart(2, '0')

// Every 15 minutes through the day, for the list.
const TIMES = Array.from({ length: 96 }, (_, i) => `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`)

// Reads what you type: "18:45", "1845", "6:45 pm", "6pm", "6".
// Returns '18:45', '' for an empty box, or undefined if it makes no sense.
function parseTime(text) {
  const t = text.trim().toLowerCase().replace(/\s+/g, '')
  if (!t) return ''
  const m = t.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)?$/)
  if (!m) return undefined
  let h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  if (m[3]) {
    if (h < 1 || h > 12) return undefined
    const pm = m[3].startsWith('p')
    h = (h % 12) + (pm ? 12 : 0)
  }
  if (h > 23 || min > 59) return undefined
  return `${pad(h)}:${pad(min)}`
}

// One box for a time: type any time, or pick from a short list (every 15
// minutes, shown the 12h or 24h way from Settings). No endless wheel.
// `value` is '18:30' or '' for no time.
function TimePicker({ value, onChange, label = 'Time' }) {
  return (
    <Combo
      value={value}
      onChange={onChange}
      options={TIMES.map(t => ({ value: t, label: showTime(t) }))}
      format={v => (v ? showTime(v) : '')}
      parse={parseTime}
      placeholder={`${label} (optional)`}
      label={label}
    />
  )
}

export default TimePicker
