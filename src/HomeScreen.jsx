import { activeGoals } from './progress.js'
import { dayCounts, todayKey } from './calendar.js'
import NowBox from './NowBox.jsx'
import DayList from './DayList.jsx'
import HomeHero from './HomeHero.jsx'

// "Good morning" before 12, "Good afternoon" before 18, otherwise "Good evening".
function greeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// The start screen: date and greeting, the theme's picture of your progress
// (see HomeHero), what to do now, and today's tasks and habits, each with
// the goal it feeds.
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
      <h1>{greeting(now.getHours())}</h1>

      <HomeHero theme={settings.theme} goals={goals} />

      <NowBox goals={goals} items={items} apply={apply} />

      <h2>Today</h2>
      {total > 0 ? (
        <DayList dateKey={today} goals={goals} items={items} apply={apply} showFeeds />
      ) : (
        <p className="empty">
          Nothing planned today. <a href="#day">Open the calendar</a> or tap ＋ to add a task.
        </p>
      )}
    </div>
  )
}

export default HomeScreen
