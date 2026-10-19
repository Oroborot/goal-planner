import { useEffect, useRef, useState } from 'react'
import HomeScreen from './HomeScreen.jsx'
import GoalsScreen from './GoalsScreen.jsx'
import GoalPage from './GoalPage.jsx'
import NotesScreen from './NotesScreen.jsx'
import NotePage from './NotePage.jsx'
import DayPage from './DayPage.jsx'
import WeekPage from './WeekPage.jsx'
import MonthPage from './MonthPage.jsx'
import { mondayOf, todayKey } from './calendar.js'
import { EVENTS_KEY, loadEvents, makeEvent } from './history.js'
import TimerBar from './TimerBar.jsx'
import BottomBar from './BottomBar.jsx'
import AddSheet from './AddSheet.jsx'
import {
  alarm,
  elapsedMs,
  loadTimer,
  pauseTimer,
  resumeTimer,
  saveTimer,
  startTimer,
} from './timer.js'
import './App.css'

// The name of the slot in the browser's localStorage where items are saved.
const STORAGE_KEY = 'planner-items'

// Which screen to show, read from the end of the web address:
//   #goals        -> the goals list
//   #goal/<id>    -> the page for one goal
//   #notes        -> the notes list
//   #note/<id>    -> the page for one note
//   #day          -> today in the calendar
//   #day/<date>   -> one day in the calendar, e.g. #day/2026-10-21
//   #week         -> this week; #week/<date> -> the week with that date
//   #month        -> this month; #month/2026-10 -> that month
//   anything else -> the home screen
function screenFromAddress() {
  const address = window.location.hash.slice(1)
  if (address === 'day') return { name: 'day', dateKey: todayKey() }
  if (address === 'week') return { name: 'week', mondayKey: mondayOf(todayKey()) }
  if (address === 'month') return { name: 'month', monthKey: todayKey().slice(0, 7) }
  if (/^month\/\d{4}-\d{2}$/.test(address)) return { name: 'month', monthKey: address.slice(6) }
  if (/^week\/\d{4}-\d{2}-\d{2}$/.test(address)) return { name: 'week', mondayKey: mondayOf(address.slice(5)) }
  if (/^day\/\d{4}-\d{2}-\d{2}$/.test(address)) return { name: 'day', dateKey: address.slice(4) }
  if (address === 'goals') return { name: 'goals' }
  if (address.startsWith('goal/')) return { name: 'goal', goalId: address.slice(5) }
  if (address === 'notes') return { name: 'notes' }
  if (address.startsWith('note/')) return { name: 'note', noteId: address.slice(5) }
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
      color: null,
      date: null,
      time: null,
      plannedDate: null,
      repeat: null,
      target: null,
      repeatSince: null,
      doneDates: [],
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
  //   parentIds, why, deletedAt }
  // `parentIds` lists the bigger goals this goal counts toward.
  const [items, setItems] = useState(loadItems)
  // The history log: one entry for everything that happened (see history.js).
  const [events, setEvents] = useState(loadEvents)
  const [screen, setScreen] = useState(screenFromAddress)
  // The goals list's selected tab, kept here so it's remembered when you
  // open a goal page and come back.
  const [goalsTab, setGoalsTab] = useState('day')

  // Save to localStorage every time the items or the history change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])
  useEffect(() => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  }, [events])

  // Every change goes through here: the goal actions return the new items
  // plus history entries for what happened, and both get saved.
  function apply({ items: newItems, events: newEvents }) {
    setItems(newItems)
    if (newEvents.length > 0) setEvents(previous => [...previous, ...newEvents])
  }

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

  // The timer (see timer.js), saved so a refresh keeps it running.
  const [timer, setTimer] = useState(loadTimer)
  // True while the ＋ add sheet is open.
  const [adding, setAdding] = useState(false)
  // Set when a countdown ends, for the "Time's up" banner.
  const [timesUp, setTimesUp] = useState(null)
  useEffect(() => saveTimer(timer), [timer])

  // The running timer, readable right away (state updates arrive later),
  // so a finishing countdown is never saved twice.
  const timerRef = useRef(timer)
  useEffect(() => {
    timerRef.current = timer
  }, [timer])

  // End the timer and, if `save`, record the session in the history log.
  function endTimer(save) {
    const current = timerRef.current
    if (!current) return null
    timerRef.current = null
    setTimer(null)
    const seconds = Math.round(elapsedMs(current, Date.now()) / 1000)
    if (save && seconds > 0) {
      const item = { id: current.itemId, title: current.title }
      setEvents(previous => [...previous, makeEvent('timed', item, { seconds, mode: current.mode })])
    }
    return current
  }

  const timerControls = {
    start: (item, mode, seconds) => setTimer(startTimer(item, mode, seconds)),
    pause: () => setTimer(t => pauseTimer(t)),
    resume: () => setTimer(t => resumeTimer(t)),
    stop: () => endTimer(true),
    cancel: () => endTimer(false),
    finish: () => {
      const finished = endTimer(true)
      if (finished) {
        alarm()
        setTimesUp(finished.title)
      }
    },
  }

  // The screen to show, picked from the web address.
  let page
  if (screen.name === 'goals') {
    page = (
      <GoalsScreen
        items={items}
        events={events}
        apply={apply}
        timeframe={goalsTab}
        setTimeframe={setGoalsTab}
      />
    )
  } else if (screen.name === 'goal') {
    // `key` gives each goal a fresh page, so open forms don't carry over
    // when you move to another goal.
    page = (
      <GoalPage
        key={screen.goalId}
        goalId={screen.goalId}
        items={items}
        events={events}
        apply={apply}
        timer={timer}
        timerControls={timerControls}
      />
    )
  } else if (screen.name === 'day') {
    page = <DayPage key={screen.dateKey} dateKey={screen.dateKey} items={items} apply={apply} />
  } else if (screen.name === 'week') {
    page = <WeekPage key={screen.mondayKey} mondayKey={screen.mondayKey} items={items} apply={apply} />
  } else if (screen.name === 'month') {
    page = <MonthPage key={screen.monthKey} monthKey={screen.monthKey} items={items} apply={apply} />
  } else if (screen.name === 'notes') {
    page = <NotesScreen items={items} apply={apply} />
  } else if (screen.name === 'note') {
    page = (
      <NotePage
        key={screen.noteId}
        noteId={screen.noteId}
        items={items}
        events={events}
        apply={apply}
        timer={timer}
        timerControls={timerControls}
      />
    )
  } else {
    page = <HomeScreen items={items} />
  }

  return (
    <>
      {timer && <TimerBar timer={timer} items={items} controls={timerControls} />}
      {timesUp && (
        <div className="times-up" role="alert">
          <span>⏰ Time's up: {timesUp}</span>
          <button type="button" className="secondary" onClick={() => setTimesUp(null)}>
            OK
          </button>
        </div>
      )}
      {page}
      <BottomBar screen={screen.name} onAdd={() => setAdding(true)} />
      {adding && <AddSheet items={items} apply={apply} onClose={() => setAdding(false)} />}
    </>
  )
}

export default App
