import { useEffect, useState } from 'react'
import './App.css'

// The timeframes a goal can belong to. `value` is what gets saved,
// `label` is what you see on screen.
const TIMEFRAMES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

// The name of the slot in the browser's localStorage where items are saved.
const STORAGE_KEY = 'planner-items'

// Read saved items when the app opens. If nothing is saved yet, or the saved
// data is broken, start with an empty list instead of crashing.
function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function App() {
  // Every item in the planner. Each one looks like:
  // { id, title, list, timeframe, done, createdAt, completedAt }
  const [items, setItems] = useState(loadItems)
  const [title, setTitle] = useState('')
  // The selected timeframe: drives both the tabs and the add-form dropdown.
  const [timeframe, setTimeframe] = useState('day')

  // Save to localStorage every time the items change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Only the "goals" list is shown for now; other lists come later.
  const goals = items.filter(item => item.list === 'goals')
  const visibleGoals = goals.filter(goal => goal.timeframe === timeframe)

  function countFor(value) {
    return goals.filter(goal => goal.timeframe === value).length
  }

  function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return
    const newItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      list: 'goals',
      timeframe,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    setItems([...items, newItem])
    setTitle('')
  }

  function toggleGoal(id) {
    setItems(
      items.map(item =>
        item.id === id
          ? {
              ...item,
              done: !item.done,
              completedAt: item.done ? null : new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  function deleteGoal(id) {
    setItems(items.filter(item => item.id !== id))
  }

  const currentLabel = TIMEFRAMES.find(t => t.value === timeframe).label

  return (
    <div className="app">
      <h1>Goal Planner</h1>

      <div className="tabs">
        {TIMEFRAMES.map(t => (
          <button
            key={t.value}
            type="button"
            className={t.value === timeframe ? 'tab active' : 'tab'}
            aria-pressed={t.value === timeframe}
            onClick={() => setTimeframe(t.value)}
          >
            {t.label} <span className="count">{countFor(t.value)}</span>
          </button>
        ))}
      </div>

      <form onSubmit={addGoal}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's your goal?"
          aria-label="Goal"
        />
        <select
          value={timeframe}
          onChange={e => setTimeframe(e.target.value)}
          aria-label="Timeframe"
        >
          {TIMEFRAMES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>

      {visibleGoals.length === 0 ? (
        <p className="empty">No {currentLabel.toLowerCase()} goals yet.</p>
      ) : (
        <ul>
          {visibleGoals.map(goal => (
            <li key={goal.id} className={goal.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={goal.done}
                onChange={() => toggleGoal(goal.id)}
                aria-label={`Mark "${goal.title}" as done`}
              />
              <span>{goal.title}</span>
              <button
                type="button"
                className="delete"
                onClick={() => deleteGoal(goal.id)}
                aria-label={`Delete "${goal.title}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
