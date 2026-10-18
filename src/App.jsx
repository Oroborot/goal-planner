import { useEffect, useState } from 'react'
import HomeScreen from './HomeScreen.jsx'
import GoalsScreen from './GoalsScreen.jsx'
import GoalPage from './GoalPage.jsx'
import './App.css'

// The name of the slot in the browser's localStorage where items are saved.
const STORAGE_KEY = 'planner-items'

// Which screen to show, read from the end of the web address:
//   #goals        -> the goals list
//   #goal/<id>    -> the page for one goal
//   anything else -> the home screen
function screenFromAddress() {
  const address = window.location.hash.slice(1)
  if (address === 'goals') return { name: 'goals' }
  if (address.startsWith('goal/')) return { name: 'goal', goalId: address.slice(5) }
  return { name: 'home' }
}

// Read saved items when the app opens. If nothing is saved yet, or the saved
// data is broken, start with an empty list instead of crashing.
// Older test items had a single `parentId`; they get turned into a
// `parentIds` list so everything uses the same shape.
function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    return saved.map(({ parentId, ...item }) => ({
      why: '',
      completedBy: item.done ? 'hand' : null,
      ...item,
      parentIds: item.parentIds ?? (parentId ? [parentId] : []),
    }))
  } catch {
    return []
  }
}

function App() {
  // Every item in the planner. Each one looks like:
  // { id, title, list, timeframe, done, createdAt, completedAt, completedBy,
  //   parentIds, why }
  // `parentIds` lists the bigger goals this goal counts toward.
  const [items, setItems] = useState(loadItems)
  const [screen, setScreen] = useState(screenFromAddress)
  // The goals list's selected tab, kept here so it's remembered when you
  // open a goal page and come back.
  const [goalsTab, setGoalsTab] = useState('day')

  // Save to localStorage every time the items change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // When the address changes (a link is tapped, or Back is pressed),
  // show the matching screen and start at the top of the page.
  useEffect(() => {
    function onAddressChange() {
      setScreen(screenFromAddress())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onAddressChange)
    return () => window.removeEventListener('hashchange', onAddressChange)
  }, [])

  if (screen.name === 'goals') {
    return (
      <GoalsScreen
        items={items}
        setItems={setItems}
        timeframe={goalsTab}
        setTimeframe={setGoalsTab}
      />
    )
  }
  if (screen.name === 'goal') {
    // `key` gives each goal a fresh page, so open forms don't carry over
    // when you move to another goal.
    return (
      <GoalPage key={screen.goalId} goalId={screen.goalId} items={items} setItems={setItems} />
    )
  }
  return <HomeScreen items={items} />
}

export default App
