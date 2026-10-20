import { useState } from 'react'
import { activeGoals, childrenOf, percent, progressOf } from './progress.js'
import { colorOf } from './colors.js'
import { labelOf, sizeOf } from './timeframes.js'
import ProgressBar from './ProgressBar.jsx'

// One goal in the outline, with its smaller goals indented under it.
// ▸ / ▾ folds or opens the branch. `path` stops endless loops.
function Branch({ goal, goals, depth, path, openIds, toggle }) {
  const children = childrenOf(goals, goal.id)
    .filter(c => !path.includes(c.id))
    .sort((a, b) => sizeOf(b.timeframe) - sizeOf(a.timeframe))
  const open = openIds.includes(goal.id)
  const progress = progressOf(goals, goal)
  const color = colorOf(goals, goal)

  return (
    <li className="tree-item">
      <div className="tree-row" style={{ paddingLeft: `${depth * 1.1}rem` }}>
        {children.length > 0 ? (
          <button
            type="button"
            className="tree-toggle"
            onClick={() => toggle(goal.id)}
            aria-expanded={open}
            aria-label={open ? `Fold ${goal.title}` : `Open ${goal.title}`}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="tree-toggle" />
        )}
        <div className="goal-text">
          <a href={`#goal/${goal.id}`} className="goal-title goal-link">
            <span className="goal-dot" style={{ background: color }} />
            {goal.title}
            {goal.repeat && ' ↻'}
          </a>
          <span className="goal-meta">
            {labelOf(goal.timeframe)} · {percent(progress)}%
            {children.length > 0 && ` · ${children.length} under it`}
          </span>
          <ProgressBar progress={progress} />
        </div>
      </div>
      {open && children.length > 0 && (
        <ul className="tree">
          {children.map(child => (
            <Branch
              key={child.id}
              goal={child}
              goals={goals}
              depth={depth + 1}
              path={[...path, goal.id]}
              openIds={openIds}
              toggle={toggle}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// The goal tree as a foldable outline: big goals at the top, smaller ones
// indented under them, each with its progress. A goal with several bigger
// goals shows up under each of them.
function GoalTree({ items }) {
  const goals = activeGoals(items)
  // The top: goals with no bigger goal, biggest timeframe first.
  const roots = goals
    .filter(g => g.parentIds.filter(p => goals.some(x => x.id === p)).length === 0)
    .sort((a, b) => sizeOf(b.timeframe) - sizeOf(a.timeframe))
  // Top-level goals start open, so the first level is visible right away.
  const [openIds, setOpenIds] = useState(() => roots.map(r => r.id))
  const toggle = id => setOpenIds(openIds.includes(id) ? openIds.filter(x => x !== id) : [...openIds, id])

  if (goals.length === 0) return <p className="empty">No goals yet.</p>

  return (
    <>
      <div className="row tree-actions">
        <button type="button" className="link-button" onClick={() => setOpenIds(goals.map(g => g.id))}>
          Open all
        </button>
        <button type="button" className="link-button" onClick={() => setOpenIds([])}>
          Fold all
        </button>
      </div>
      <ul className="tree">
        {roots.map(goal => (
          <Branch key={goal.id} goal={goal} goals={goals} depth={0} path={[]} openIds={openIds} toggle={toggle} />
        ))}
      </ul>
    </>
  )
}

export default GoalTree
