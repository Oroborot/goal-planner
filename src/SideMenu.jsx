import { useEffect, useRef } from 'react'
import AppIcon from './icons.jsx'

// The menu, in groups like the Things 3 sidebar. Each link has one colored
// icon. `soon` ones aren't built yet and show greyed out.
// Archive and Rewards are hidden for now (their pages still work).
const GROUPS = [
  [
    { href: '#', icon: 'today', label: 'Today', color: '#EF9F27' },
    { href: '#day', icon: 'calendar', label: 'Calendar', color: '#E24B4A' },
    { href: '#goals', icon: 'goals', label: 'Goals', color: '#378ADD' },
    { href: '#notes', icon: 'notes', label: 'Notes', color: '#888780' },
  ],
  [
    { icon: 'shopping', label: 'Shopping', soon: true },
    { icon: 'dreams', label: 'Dreams', soon: true },
  ],
  [
    { href: '#stats', icon: 'stats', label: 'Stats', color: '#7F77DD' },
    { href: '#history', icon: 'history', label: 'History', color: '#888780' },
    { href: '#folders', icon: 'folders', label: 'Folders', color: '#888780' },
    { href: '#cover', icon: 'cover', label: 'Cover', color: '#1D9E75' },
  ],
]

// How close to the left edge a swipe must start, and how far it must go.
const EDGE = 24
const DISTANCE = 60

// The side menu. Opens by swiping right from the left edge of the screen
// (or tapping the round menu button at the bottom left); closes by
// swiping left, tapping outside, or picking something.
function SideMenu({ open, setOpen }) {
  const start = useRef(null)

  useEffect(() => {
    function onStart(e) {
      const x = e.touches[0].clientX
      start.current = open || x < EDGE ? x : null
    }
    function onEnd(e) {
      if (start.current === null) return
      const moved = e.changedTouches[0].clientX - start.current
      if (!open && moved > DISTANCE) setOpen(true)
      if (open && moved < -DISTANCE) setOpen(false)
      start.current = null
    }
    window.addEventListener('touchstart', onStart)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="menu-backdrop" onClick={() => setOpen(false)}>
      <nav className="side-menu" aria-label="Menu" onClick={e => e.stopPropagation()}>
        {GROUPS.map((group, i) => (
          <div key={i} className="side-menu-group">
            {group.map(link =>
              link.soon ? (
                <span key={link.label} className="side-menu-link soon">
                  <AppIcon name={link.icon} size={22} />
                  {link.label}
                  <span className="side-menu-note">soon</span>
                </span>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="side-menu-link"
                  onClick={() => setOpen(false)}
                >
                  <span style={{ color: link.color, display: 'flex' }}>
                    <AppIcon name={link.icon} size={22} />
                  </span>
                  {link.label}
                </a>
              ),
            )}
          </div>
        ))}
        <a href="#settings" className="side-menu-link side-menu-settings" onClick={() => setOpen(false)}>
          <AppIcon name="settings" size={20} />
          Settings
        </a>
      </nav>
    </div>
  )
}

export default SideMenu
