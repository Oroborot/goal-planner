import { useState } from 'react'
import './App.css'

function App() {
  const [goals, setGoals] = useState([])
  const [text, setText] = useState('')

  function addGoal(e) {
    e.preventDefault()
    if (!text.trim()) return
    setGoals([...goals, { id: Date.now(), text: text.trim(), done: false }])
    setText('')
  }

  function toggleGoal(id) {
    setGoals(goals.map(g => (g.id === id ? { ...g, done: !g.done } : g)))
  }

  function deleteGoal(id) {
    setGoals(goals.filter(g => g.id !== id))
  }

  return (
    <div className="app">
      <h1>Goal Planner</h1>
      <form onSubmit={addGoal}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's your goal?"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {goals.map(g => (
          <li key={g.id} className={g.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={g.done}
              onChange={() => toggleGoal(g.id)}
            />
            <span>{g.text}</span>
            <button onClick={() => deleteGoal(g.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App