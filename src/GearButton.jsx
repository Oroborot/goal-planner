import AppIcon from './icons.jsx'

// The gear at the top right of every tab. Opens the gear sheet.
function GearButton({ onClick }) {
  return (
    <button type="button" className="gear-button" onClick={onClick} aria-label="Settings and more">
      <AppIcon name="gear" size={26} />
    </button>
  )
}

export default GearButton
