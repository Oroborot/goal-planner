// All app icons in one place, so a whole icon set can be swapped later
// (see "Customize" in DESIGN-IDEAS.md). Simple line icons, 24×24.
// Use as <AppIcon name="home" />.

const SHAPES = {
  home: {
    label: 'Home',
    shape: (
      <>
        <path d="M4 11 12 4l8 7" />
        <path d="M6 10v9h12v-9" />
      </>
    ),
  },
  calendar: {
    label: 'Calendar',
    shape: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16M9 3v4M15 3v4" />
      </>
    ),
  },
  add: { label: 'Add', shape: <path d="M12 5v14M5 12h14" /> },
  goals: {
    label: 'Goals',
    shape: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.8" />
      </>
    ),
  },
  notes: {
    label: 'Notes',
    shape: (
      <>
        <path d="M6 4h9l3 3v13H6z" />
        <path d="M9 10h6M9 14h6M9 18h3" />
      </>
    ),
  },
}

function AppIcon({ name }) {
  const { label, shape } = SHAPES[name]
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      {shape}
    </svg>
  )
}

export default AppIcon
