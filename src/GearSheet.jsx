import AppIcon from './icons.jsx'

// What's behind the gear: the screens that aren't one of the 4 spaces.
const LINKS = [
  { href: '#settings', icon: 'gear', label: 'Settings' },
  { href: '#history', icon: 'history', label: 'History' },
  { href: '#archive', icon: 'archive', label: 'Archive' },
  { href: '#backup', icon: 'backup', label: 'Backup' },
  { href: '#stats', icon: 'stats', label: 'Stats' },
]

// The sheet that slides up from the bottom when the gear is tapped.
// Closes with ✕, by tapping the dimmed screen, or by picking a link.
function GearSheet({ onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet gear-sheet" role="dialog" aria-label="More" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="gear-sheet-head">
          <h2>More</h2>
          <button type="button" className="sheet-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="gear-sheet-list">
          {LINKS.map(link => (
            <a key={link.href} href={link.href} className="gear-sheet-link" onClick={onClose}>
              <AppIcon name={link.icon} size={22} />
              <span>{link.label}</span>
              <AppIcon name="chevron" size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GearSheet
