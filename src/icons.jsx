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
  // Side menu icons.
  today: { label: 'Today', shape: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" /> },
  focus: {
    label: 'Focus',
    shape: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m10 9 5 3-5 3z" />
      </>
    ),
  },
  stats: { label: 'Stats', shape: <path d="M5 20V11M10 20V5M15 20v-7M20 20V8" /> },
  history: {
    label: 'History',
    shape: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  folders: { label: 'Folders', shape: <path d="M4 7v11h16V9h-8l-2-2z" /> },
  cover: {
    label: 'Cover',
    shape: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="m4 16 5-5 4 4 2-2 5 5" />
      </>
    ),
  },
  shopping: {
    label: 'Shopping',
    shape: (
      <>
        <path d="M3 4h2l2 11h11l2-8H6" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="17" cy="19" r="1" />
      </>
    ),
  },
  dreams: { label: 'Dreams', shape: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" /> },
  settings: {
    label: 'Settings',
    shape: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      </>
    ),
  },
  menu: { label: 'Menu', shape: <path d="M5 7h14M5 12h14M5 17h14" /> },
}

// `size` is the width and height in pixels.
function AppIcon({ name, size = 26 }) {
  const { label, shape } = SHAPES[name]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
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
