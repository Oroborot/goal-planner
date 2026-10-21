import { useState } from 'react'
import BackLink from './BackLink.jsx'
import { activeGoals } from './progress.js'
import { labelOf } from './timeframes.js'
import { colorOf } from './colors.js'

// Folders, first version (two ready-made ones, worked out from your goals):
// - Achieved: finished bigger goals, with their "why" and the day they were done
// - Reasons to try: every "why" you wrote, to remind you why you do things
// Later: your own folders (create, rename, delete, move goals between them).
function FoldersPage({ items }) {
  const [open, setOpen] = useState('achieved')
  const goals = activeGoals(items)
  const achieved = goals
    .filter(g => g.done && !g.repeat && g.timeframe !== 'day')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
  const reasons = goals.filter(g => g.why && g.why.trim())

  const folders = [
    { id: 'achieved', title: '🏆 Achieved', count: achieved.length },
    { id: 'reasons', title: '💭 Reasons to try', count: reasons.length },
  ]

  return (
    <div className="app">
      <BackLink fallback="#" />
      <h1>Folders</h1>
      <div className="folder-tiles">
        {folders.map(f => (
          <button
            key={f.id}
            type="button"
            className={open === f.id ? 'folder-tile active' : 'folder-tile'}
            onClick={() => setOpen(f.id)}
            aria-pressed={open === f.id}
          >
            <span>{f.title}</span>
            <span className="goal-meta">{f.count}</span>
          </button>
        ))}
      </div>

      {open === 'achieved' &&
        (achieved.length === 0 ? (
          <p className="empty">No finished goals yet. They land here when you tick a Week, Month or bigger goal.</p>
        ) : (
          <ul className="folder-list">
            {achieved.map(g => (
              <li key={g.id}>
                <a href={`#goal/${g.id}`} className="goal-link goal-title">
                  <span className="goal-dot" style={{ background: colorOf(goals, g) }} />
                  {g.title}
                </a>
                <span className="goal-meta">
                  {labelOf(g.timeframe)} goal
                  {g.completedAt && ` · done ${new Date(g.completedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </span>
                {g.why && <p className="folder-why">“{g.why}”</p>}
              </li>
            ))}
          </ul>
        ))}

      {open === 'reasons' &&
        (reasons.length === 0 ? (
          <p className="empty">No reasons yet. Add a “why” to a goal and it shows up here.</p>
        ) : (
          <ul className="folder-list">
            {reasons.map(g => (
              <li key={g.id}>
                <p className="folder-why big">“{g.why}”</p>
                <a href={`#goal/${g.id}`} className="goal-link goal-meta">
                  for {g.title}
                </a>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}

export default FoldersPage
