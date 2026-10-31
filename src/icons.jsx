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
  // Hub tabs (bottom bar) and the gear.
  training: {
    label: 'Training',
    shape: (
      <>
        <path d="M9 12h6M1.5 12H3M21 12h1.5" />
        <rect x="6" y="6" width="3" height="12" rx="1" />
        <rect x="15" y="6" width="3" height="12" rx="1" />
        <rect x="3" y="8.5" width="3" height="7" rx="1" />
        <rect x="18" y="8.5" width="3" height="7" rx="1" />
      </>
    ),
  },
  work: {
    label: 'Work',
    shape: (
      <>
        <circle cx="12" cy="13.5" r="7.5" />
        <path d="M12 13.5V9.5M10 2.5h4M12 2.5V6M18 7.5l1.5-1.5" />
      </>
    ),
  },
  cookbook: {
    label: 'Cookbook',
    shape: <path d="M6 3v6a3 3 0 0 0 6 0V3M9 3v6M9 12v9M18 21V3c-2 1.5-3.5 4.5-3.5 9H18" />,
  },
  projects: {
    label: 'Projects',
    shape: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <rect x="9" y="2.5" width="6" height="3" rx="1" />
        <path d="m9 13 2 2 4-4" />
      </>
    ),
  },
  gear: {
    label: 'More',
    shape: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      </>
    ),
  },
  backup: {
    label: 'Backup',
    shape: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14" />,
  },
  chevron: { label: 'Open', shape: <path d="m9 6 6 6-6 6" /> },
  chevronUp: { label: 'Open', shape: <path d="m6 15 6-6 6 6" /> },
  chevronLeft: { label: 'Back', shape: <path d="m15 6-6 6 6 6" /> },
  // Training buttons. Pause, play and skip are filled shapes.
  pause: {
    label: 'Pause',
    shape: (
      <>
        <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none" />
        <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none" />
      </>
    ),
  },
  play: { label: 'Play', shape: <path d="M7 5v14l12-7z" fill="currentColor" /> },
  skip: {
    label: 'Skip',
    shape: (
      <>
        <path d="M5 5v14l11-7z" fill="currentColor" />
        <path d="M18.5 5v14" strokeWidth="2.6" />
      </>
    ),
  },
  clock: {
    label: 'Clock',
    shape: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </>
    ),
  },
  updown: { label: 'Switch', shape: <path d="M8 4v16M4.5 7.5 8 4l3.5 3.5M16 20V4M12.5 16.5 16 20l3.5-3.5" /> },
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
