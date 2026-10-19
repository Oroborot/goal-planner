import AppIcon from './icons.jsx'

// Which bottom-bar button each screen belongs to.
const SECTION = {
  home: 'home',
  day: 'calendar',
  week: 'calendar',
  month: 'calendar',
  goals: 'goals',
  goal: 'goals',
  notes: 'notes',
  note: 'notes',
}

// The bar at the bottom of every screen: Home, Calendar, ＋, Goals, Notes.
// Icons only. ＋ opens today's page with its add form for now; a sheet
// with Task / Habit / Goal / Note comes in the next step.
function BottomBar({ screen }) {
  const active = SECTION[screen]
  const item = (name, href) => (
    <a
      href={href}
      className={active === name ? 'bar-item active' : 'bar-item'}
      aria-current={active === name ? 'page' : undefined}
    >
      <AppIcon name={name} />
    </a>
  )

  return (
    <nav className="bottom-bar" aria-label="Main">
      {item('home', '#')}
      {item('calendar', '#day')}
      <a href="#day" className="bar-add">
        <AppIcon name="add" />
      </a>
      {item('goals', '#goals')}
      {item('notes', '#notes')}
    </nav>
  )
}

export default BottomBar
