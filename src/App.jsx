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
import { makeEvent } from './history.js'
import { loadEvents, loadItems, saveEvents, saveItems, stampItems } from './store.js'
import TimerBar from './TimerBar.jsx'
import FocusPage from './FocusPage.jsx'
import StatsPage from './StatsPage.jsx'
import RoutinePage from './RoutinePage.jsx'
import CoverScreen from './CoverScreen.jsx'
import FoldersPage from './FoldersPage.jsx'
import RewardsPage from './RewardsPage.jsx'
import GoalTree from './GoalTree.jsx'
import SettingsPage from './SettingsPage.jsx'
import { loadSettings, saveSettings } from './settings.js'
import { applyTheme } from './themes.js'
import { rememberPage } from './navHistory.js'
import TabBar from './TabBar.jsx'
import GearSheet from './GearSheet.jsx'
import EmptyTab from './EmptyTab.jsx'
import TrainingScreen from './TrainingScreen.jsx'
import WorkScreen from './WorkScreen.jsx'
import IdeasScreen from './IdeasScreen.jsx'
import BackupSection from './BackupSection.jsx'
import { restoreExtras } from './backup.js'
import { ArchivePage, HistoryPage } from './MenuPages.jsx'
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

// The 5 tabs of the hub, shown in the bar at the bottom.
const TABS = ['training', 'work', 'cookbook', 'projects', 'ideas']

// Which screen to show, read from the end of the web address:
//   no address    -> the Training tab
//   #work, #cookbook, #projects, #ideas -> the other tabs
//   #idea/<id>    -> inside one idea (still the Ideas tab)
//   #home         -> the old Today home screen (hidden, still works)
//   #goals        -> the goals list
//   #goal/<id>    -> the page for one goal
//   #notes        -> the notes list
//   #note/<id>    -> the page for one note
//   #day          -> today in the calendar
//   #day/<date>   -> one day in the calendar, e.g. #day/2026-10-21
//   #week         -> this week; #week/<date> -> the week with that date
//   #month        -> this month; #month/2026-10 -> that month
//   anything else -> the Training tab
function screenFromAddress() {
  const address = window.location.hash.slice(1)
  if (['home', 'backup', 'history', 'archive', 'views', 'settings', 'stats', 'plan', 'wrapup', 'cover', 'folders', 'rewards', ...TABS].includes(address)) return { name: address }
  if (address.startsWith('focus/')) return { name: 'focus', goalId: address.slice(6) }
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
  if (address.startsWith('idea/')) return { name: 'idea', ideaId: address.slice(5) }
  return { name: 'training' }
}

// The "show cover when the app opens" setting is ignored for now: the
// cover is hidden from navigation and the app opens on Training.
function firstScreen() {
  return screenFromAddress()
}

function App() {
  // Every item in the planner. Each one looks like:
  // { id, title, list, timeframe, done, createdAt, completedAt, completedBy,
  //   parentIds, why, deletedAt }
  // `parentIds` lists the bigger goals this goal counts toward.
  const [items, setItems] = useState(loadItems)
  // The history log: one entry for everything that happened (see history.js).
  const [events, setEvents] = useState(loadEvents)
  const [screen, setScreen] = useState(firstScreen)
  // The goals list's selected tab, kept here so it's remembered when you
  // open a goal page and come back.
  const [goalsTab, setGoalsTab] = useState('day')

  // Save to localStorage every time the items or the history change.
  // (store.js decides where: localStorage now, a server later.)
  useEffect(() => saveItems(items), [items])
  useEffect(() => saveEvents(events), [events])

  // Every change goes through here: the goal actions return the new items
  // plus history entries for what happened, and both get saved.
  // New and changed items get their owner and timestamps here (see store.js).
  function apply({ items: newItems, events: newEvents }) {
    setItems(previous => stampItems(previous, newItems))
    if (newEvents.length > 0) setEvents(previous => [...previous, ...newEvents])
  }

  // History cleanup: remove some entries by id, or 'all' of them.
  // Only the diary changes; goals and notes stay as they are.
  function deleteEvents(ids) {
    setEvents(previous => (ids === 'all' ? [] : previous.filter(e => !ids.includes(e.id))))
  }

  // When the address changes (a link is tapped, or Back is pressed),
  // show the matching screen and start at the top of the page.
  useEffect(() => {
    rememberPage(window.location.hash)
    function onAddressChange() {
      rememberPage(window.location.hash)
      setScreen(screenFromAddress())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onAddressChange)
    return () => window.removeEventListener('hashchange', onAddressChange)
  }, [])

  // The timer (see timer.js), saved so a refresh keeps it running.
  const [timer, setTimer] = useState(loadTimer)
  // Your preferences (12/24-hour clock, …). Changing them redraws every
  // screen, so times show the new way right away.
  const [settings, setSettings] = useState(loadSettings)
  function changeSettings(next) {
    saveSettings(next)
    setSettings(next)
  }

  // Put the chosen theme on the whole app. In Auto mode, also follow the
  // phone when it switches between light and dark.
  useEffect(() => {
    applyTheme(settings.theme, settings.mode)
    if (settings.mode !== 'auto' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const follow = () => applyTheme(settings.theme, settings.mode)
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [settings.theme, settings.mode])
  // Load a backup: everything on this device is replaced by the file's data.
  function restoreBackup(backup) {
    setItems(backup.items)
    setEvents(backup.events)
    changeSettings({ ...loadSettings(), ...backup.settings })
    restoreExtras(backup.extras)
  }
  // True while the gear sheet (Settings, History, Backup, Stats) is open.
  const [gearOpen, setGearOpen] = useState(false)
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
        deleteEvents={deleteEvents}
      />
    )
  } else if (screen.name === 'day') {
    page = <DayPage key={screen.dateKey} dateKey={screen.dateKey} items={items} apply={apply} />
  } else if (screen.name === 'week') {
    page = <WeekPage key={screen.mondayKey} mondayKey={screen.mondayKey} items={items} apply={apply} />
  } else if (screen.name === 'month') {
    page = <MonthPage key={screen.monthKey} monthKey={screen.monthKey} items={items} apply={apply} />
  } else if (screen.name === 'focus') {
    page = (
      <FocusPage
        key={screen.goalId}
        goalId={screen.goalId}
        items={items}
        events={events}
        apply={apply}
        timer={timer}
        timerControls={timerControls}
      />
    )
  } else if (screen.name === 'rewards') {
    page = <RewardsPage items={items} events={events} apply={apply} />
  } else if (screen.name === 'folders') {
    page = <FoldersPage items={items} />
  } else if (screen.name === 'cover') {
    page = <CoverScreen items={items} settings={settings} />
  } else if (screen.name === 'plan' || screen.name === 'wrapup') {
    page = (
      <RoutinePage
        key={screen.name}
        kind={screen.name}
        items={items}
        events={events}
        apply={apply}
        settings={settings}
        onChangeSettings={changeSettings}
      />
    )
  } else if (screen.name === 'stats') {
    page = <StatsPage />
  } else if (screen.name === 'history') {
    page = <HistoryPage items={items} events={events} deleteEvents={deleteEvents} />
  } else if (screen.name === 'archive') {
    page = <ArchivePage items={items} events={events} apply={apply} />
  } else if (screen.name === 'views') {
    page = (
      <div className="app">
        <h1>Goal tree</h1>
        <p className="goal-meta">More views (table, map, big tree) come with the design pass.</p>
        <GoalTree items={items} />
      </div>
    )
  } else if (screen.name === 'backup') {
    page = (
      <div className="app">
        <BackupSection items={items} events={events} settings={settings} onRestore={restoreBackup} />
      </div>
    )
  } else if (screen.name === 'settings') {
    page = (
      <SettingsPage
        settings={settings}
        onChange={changeSettings}
        items={items}
        events={events}
        onRestore={restoreBackup}
      />
    )
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
        deleteEvents={deleteEvents}
      />
    )
  } else if (screen.name === 'home') {
    page = <HomeScreen items={items} apply={apply} settings={settings} />
  } else if (screen.name === 'training') {
    page = <TrainingScreen onGear={() => setGearOpen(true)} />
  } else if (screen.name === 'work') {
    page = <WorkScreen onGear={() => setGearOpen(true)} />
  } else if (screen.name === 'ideas' || screen.name === 'idea') {
    // `key` gives each idea a fresh page, so open boxes don't carry over.
    page = (
      <IdeasScreen
        key={screen.ideaId || 'overview'}
        ideaId={screen.ideaId}
        items={items}
        apply={apply}
        onGear={() => setGearOpen(true)}
      />
    )
  } else {
    // Cookbook or Projects: not built yet.
    page = <EmptyTab key={screen.name} tab={screen.name} onGear={() => setGearOpen(true)} />
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
      {screen.name !== 'focus' && screen.name !== 'cover' && (
        <TabBar active={screen.name === 'idea' ? 'ideas' : TABS.includes(screen.name) ? screen.name : null} />
      )}
      {gearOpen && <GearSheet onClose={() => setGearOpen(false)} />}
    </>
  )
}

export default App
