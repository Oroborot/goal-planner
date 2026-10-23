import { activeGoals } from './progress.js'
import { dayCounts, todayKey } from './calendar.js'
import NowBox from './NowBox.jsx'
import DayList from './DayList.jsx'
import HomeHero from './HomeHero.jsx'
import AppIcon from './icons.jsx'

// The start screen, in the Things 3 look: the date, a big ★ Today title,
// links to plan and wrap up the day, the theme's picture of your progress
// (see HomeHero), what to do now, and today's tasks and habits, each with
// the goal it feeds. Things from 18:00 on sit under "This evening".
function HomeScreen({ items, apply, settings }) {
  const now = new Date()
  const today = todayKey()
  const goals = activeGoals(items)
  const { total } = dayCounts(goals, today)

  return (
    <div className="app home">
      <p className="date">
        {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h1 className="home-title">
        <AppIcon name="today" size={30} />
        Today
      </h1>
      <nav className="home-routines" aria-label="Day routines">
        <a href="#plan">☀ Plan my day</a>
        <a href="#wrapup">🌙 Wrap up</a>
      </nav>

      <HomeHero theme={settings.theme} goals={goals} />

      <NowBox goals={goals} items={items} apply={apply} />

      {total > 0 ? (
        <DayList dateKey={today} goals={goals} items={items} apply={apply} showFeeds splitEvening />
      ) : (
        <p className="empty">
          Nothing planned today. <a href="#day">Open the calendar</a> or tap ＋ to add a task.
        </p>
      )}
    </div>
  )
}

export default HomeScreen
