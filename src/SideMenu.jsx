import { useEffect, useRef } from 'react'

const LINKS = [
  { href: '#plan', label: '☀ Plan my day' },
  { href: '#wrapup', label: '🌙 Wrap up' },
  { href: '#stats', label: 'Stats' },
  { href: '#views', label: 'Views' },
  { href: '#settings', label: 'Settings' },
  { href: '#history', label: 'History' },
  { href: '#archive', label: 'Archive' },
  { href: '#notes', label: 'Note categories' },
]
const LATER = ['Folders', 'Backup', 'Help and about']

// How close to the left edge a swipe must start, and how far it must go.
const EDGE = 24
const DISTANCE = 60

// The side menu. Opens by swiping right from the left edge of the screen
// (or tapping the thin strip on the left, for computers); closes by
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

  if (!open) {
    return (
      <button
        type="button"
        className="menu-edge"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      />
    )
  }

  return (
    <div className="menu-backdrop" onClick={() => setOpen(false)}>
      <nav className="side-menu" aria-label="Menu" onClick={e => e.stopPropagation()}>
        <p className="side-menu-title">Menu</p>
        {LINKS.map(link => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <p className="side-menu-later">Later</p>
        {LATER.map(label => (
          <span key={label} className="side-menu-soon">
            {label}
          </span>
        ))}
      </nav>
    </div>
  )
}

export default SideMenu
