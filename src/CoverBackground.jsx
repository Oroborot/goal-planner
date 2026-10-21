// The cover screen's background, which fills up as today gets done.
// `progress` is 0–1. Three styles (a first version; a new feel comes later):
// - tree:   leaves grow in as you finish things
// - liquid: the screen fills up like a glass
// - plank:  a wooden plank burns from the bottom up

// Leaf spots for the tree, spiralling out from the middle of the crown,
// so they fill in from the inside out.
const LEAVES = Array.from({ length: 60 }, (_, i) => {
  const angle = i * 2.39996
  const r = 8 + Math.sqrt(i) * 11
  return { x: 100 + Math.cos(angle) * r * 1.2, y: 200 + Math.sin(angle) * r * 0.85, r: 10 + ((i * 7) % 6) }
})

function Tree({ progress }) {
  const shown = Math.round(LEAVES.length * progress)
  return (
    <svg className="cover-bg" viewBox="0 0 200 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect x="0" y="330" width="200" height="50" fill="#639922" opacity="0.25" />
      <path
        d="M96 340 L98 250 L84 215 M98 255 L116 212 M98 280 L78 252 M98 235 L104 195"
        stroke="#6b4a2b"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      {LEAVES.map((leaf, i) => (
        <circle
          key={i}
          className={i < shown ? 'leaf on' : 'leaf'}
          cx={leaf.x}
          cy={leaf.y}
          r={leaf.r}
          fill={i % 3 ? '#4f8a1f' : '#86b84a'}
          style={{ transitionDelay: `${(i % 10) * 40}ms` }}
        />
      ))}
    </svg>
  )
}

// A wave line across the full width, used for the liquid's surface.
const WAVE = 'M0 0 Q 25 -6 50 0 T 100 0 T 150 0 T 200 0 T 250 0 T 300 0 T 350 0 T 400 0 V 400 H 0 Z'

function Liquid({ progress }) {
  // The surface sits at (1 - progress) of the height; a little shows even at 0.
  const level = 380 - 372 * progress
  return (
    <svg className="cover-bg" viewBox="0 0 200 380" preserveAspectRatio="none" aria-hidden="true">
      <g className="cover-rise" style={{ transform: `translateY(${level}px)` }}>
        <path className="wave wave-back" d={WAVE} fill="var(--accent)" opacity="0.3" />
        <path className="wave wave-front" d={WAVE} transform="translate(0 6)" fill="var(--accent)" opacity="0.35" />
      </g>
    </svg>
  )
}

function Plank({ progress }) {
  // The burnt part grows from the bottom; the glowing edge sits on top of it.
  const edge = 380 - 380 * progress
  return (
    <svg className="cover-bg" viewBox="0 0 200 380" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ember" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0" />
          <stop offset="0.45" stopColor="#ff8a1f" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2a1a12" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="200" height="380" fill="#b07a45" opacity="0.55" />
      {[30, 75, 120, 165].map(x => (
        <path key={x} d={`M${x} 0 C ${x + 6} 120 ${x - 6} 250 ${x + 4} 380`} stroke="#7a4f27" strokeWidth="1.2" fill="none" opacity="0.5" />
      ))}
      <g className="cover-rise" style={{ transform: `translateY(${edge}px)` }}>
        <rect className="ember" y="-14" width="200" height="22" fill="url(#ember)" />
        <rect y="8" width="200" height="400" fill="#2a1a12" opacity="0.92" />
      </g>
    </svg>
  )
}

function CoverBackground({ style, progress }) {
  if (style === 'liquid') return <Liquid progress={progress} />
  if (style === 'plank') return <Plank progress={progress} />
  return <Tree progress={progress} />
}

export default CoverBackground
