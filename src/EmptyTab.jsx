import GearButton from './GearButton.jsx'

const TITLES = { training: 'Training', work: 'Work', cookbook: 'Cookbook', projects: 'Projects' }

// A tab that isn't built yet: its name, the gear, and "To be worked on".
function EmptyTab({ tab, onGear }) {
  return (
    <div className="app">
      <div className="tab-head">
        <h1>{TITLES[tab]}</h1>
        <GearButton onClick={onGear} />
      </div>
      <p className="empty">To be worked on</p>
    </div>
  )
}

export default EmptyTab
