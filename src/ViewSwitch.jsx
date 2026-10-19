import { mondayOf } from './calendar.js'

// Day / Week buttons at the top of the calendar pages. Switching keeps you
// around the same date. (Month comes in the next step.)
function ViewSwitch({ view, dateKey }) {
  const views = [
    { value: 'day', label: 'Day', href: `#day/${dateKey}` },
    { value: 'week', label: 'Week', href: `#week/${mondayOf(dateKey)}` },
  ]
  return (
    <nav className="tabs view-switch" aria-label="Calendar view">
      {views.map(v => (
        <a
          key={v.value}
          href={v.href}
          className={v.value === view ? 'tab active' : 'tab'}
          aria-current={v.value === view ? 'page' : undefined}
        >
          {v.label}
        </a>
      ))}
    </nav>
  )
}

export default ViewSwitch
