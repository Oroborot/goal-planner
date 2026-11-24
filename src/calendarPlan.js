// Numbers for the Calendar tab's Plan view. Plain functions, no screen code.
import { addDaysKey, dayEntries, dayLoad } from './calendar.js'

// The 7 days of the week that starts on `mondayKey`, Monday first.
// Each day: { key, entries, load }
// - entries: tasks and habits of that day. Timed ones come first, earliest
//   first. Untimed ones come after. Empty hours never appear.
// - load: total planned minutes of the day.
export function planWeek(goals, mondayKey) {
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDaysKey(mondayKey, i)
    return { key, entries: dayEntries(goals, key), load: dayLoad(goals, key).total }
  })
}

// "21 – 27 Oct" or "28 Oct – 3 Nov": the title above the week.
export function weekTitle(mondayKey, parse) {
  const first = parse(mondayKey)
  const last = parse(addDaysKey(mondayKey, 6))
  const sameMonth = first.getMonth() === last.getMonth()
  const month = d => d.toLocaleDateString(undefined, { month: 'short' })
  return sameMonth
    ? `${first.getDate()} – ${last.getDate()} ${month(last)}`
    : `${first.getDate()} ${month(first)} – ${last.getDate()} ${month(last)}`
}
