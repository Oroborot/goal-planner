import { useEffect, useState } from 'react'
import HomeScreen from './HomeScreen.jsx'
import GoalsScreen from './GoalsScreen.jsx'
import './App.css'

// The name of the slot in the browser's localStorage where items are saved.
const STORAGE_KEY = 'planner-items'

// The screens the app can show. The web address ends in #goals for the
// goals screen; with nothing after it, the home screen is shown.
const SCREENS = ['home', 'goals']

function screenFromAddress() {
  const name = window.location.hash.slice(1)
  return SCREENS.includes(name) ? name : 'home'
}

// Read saved items when the app opens. If nothing is saved yet, or the saved
// data is broken, start with an empty list instead of crashing.
// Items saved before goal linking existed get an empty parent and why.
function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    return saved.map(item => ({ parentId: null, why: '', ...item }))
  } catch {
    return []
  }
}

function App() {
  // Every item in the planner. Each one looks like:
  // { id, title, list, timeframe, done, createdAt, completedAt, parentId, why }
  const [items, setItems] = useState(loadItems)
  const [screen, setScreen] = useState(screenFromAddress)

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

  if (screen === 'goals') {
    return <GoalsScreen items={items} setItems={setItems} />
  }
  return <HomeScreen items={items} />
}

export default App
