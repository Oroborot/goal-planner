import { useState } from 'react'
import CoverBackground from './CoverBackground.jsx'
import { activeGoals } from './progress.js'
import { dayCounts, todayKey } from './calendar.js'
import { dateKey } from './repeat.js'
import { quoteFor } from './quotes.js'
import { useNow } from './useNow.js'
import { showTime } from './settings.js'

// "Good morning" 5–12, "Good afternoon" 12–18, "Good evening" 18–22,
// otherwise "Good night".
function greeting(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 18) return 'Good afternoon'
  if (hour >= 18 && hour < 22) return 'Good evening'
  return 'Good night'
}

// The cover (lock-screen style): date, clock, greeting, today's quote, and
// a background that fills up as today's tasks and habits get done.
// Shown when the app opens and/or when tapping Home (see Settings).
function CoverScreen({ items, settings }) {
  const now = new Date(useNow(true))
  const [offset, setOffset] = useState(0)
  const today = todayKey()
  const { done, total } = dayCounts(activeGoals(items), today)
  const progress = total === 0 ? 0 : done / total
  const quote = quoteFor(dateKey(now), offset)
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div className="cover">
      <CoverBackground style={settings.coverStyle} progress={progress} />
      <span className="cover-count" aria-label={`${done} of ${total} done today`}>
        {done}/{total}
      </span>
      <div className="cover-content">
        <p className="cover-date">
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <p className="cover-clock">{showTime(time)}</p>
        <p className="cover-greeting">{greeting(now.getHours())}</p>
        <button type="button" className="cover-quote" onClick={() => setOffset(offset + 1)} aria-label="Next quote">
          “{quote.text}”
          {quote.author && <span className="cover-author">{quote.author}</span>}
        </button>
        <a href="#day" className="cover-open">
          Open today
        </a>
        <a href="#" className="cover-sections">
          All sections
        </a>
      </div>
    </div>
  )
}

export default CoverScreen
