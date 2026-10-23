import AppIcon from './icons.jsx'

// Two round buttons floating at the bottom of every screen, like Things 3:
// the menu on the left, ＋ on the right (opens the add sheet:
// Task / Habit / Note / Goal). Everything else is reached from the menu.
function BottomBar({ onMenu, onAdd }) {
  return (
    <>
      <button type="button" className="float-menu" onClick={onMenu} aria-label="Open menu">
        <AppIcon name="menu" size={22} />
      </button>
      <button type="button" className="float-add" onClick={onAdd}>
        <AppIcon name="add" />
      </button>
    </>
  )
}

export default BottomBar
