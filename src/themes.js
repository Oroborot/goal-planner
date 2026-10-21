// Color themes. Every theme has a dark and a light version; the Mode
// setting (Dark / Light / Auto) picks which. All app colors come from these
// few values, so a theme changes the whole app at once.
// - bg: page background   - text: normal text   - textH: titles
// - border: lines         - accent: the theme color
// - fill: the ＋ and main buttons (a gradient for Iridescent)
// - glow: soft light behind the page ('' = none)

const glowTop = (rgb, a) => `radial-gradient(circle at 50% -10%, rgba(${rgb}, ${a}), transparent 60%)`
const glowCorner = (rgb, a, x) => `radial-gradient(circle at ${x}% -5%, rgba(${rgb}, ${a}), transparent 55%)`
const IRIDESCENT = 'linear-gradient(135deg, #a1c4fd, #c2a9f5, #fbc2eb)'
const WATER = 'linear-gradient(180deg, #2bb3a3, #2a7fd4)'
// Two thin diagonal lines, like veins in marble.
const marbleVeins = (rgb, a) =>
  `linear-gradient(118deg, transparent 38%, rgba(${rgb}, ${a}) 39%, transparent 41.5%), ` +
  `linear-gradient(152deg, transparent 63%, rgba(${rgb}, ${a * 0.8}) 63.6%, transparent 65%)`

export const THEMES = [
  {
    id: 'violet',
    name: 'Violet',
    dark: { bg: '#16171d', text: '#9ca3af', textH: '#f3f4f6', border: '#2e303a', accent: '#c084fc' },
    light: { bg: '#ffffff', text: '#6b6375', textH: '#08060d', border: '#e5e4e7', accent: '#9b3dea' },
  },
  {
    id: 'blackhole',
    name: 'Black hole',
    dark: { bg: '#050508', text: '#8a8fb3', textH: '#eef0ff', border: '#1c1c2e', accent: '#8b7cff', glow: glowTop('139, 124, 255', 0.3) },
    light: { bg: '#eef0f8', text: '#5b5f80', textH: '#12142b', border: '#d7d9ea', accent: '#5b4ce0', glow: glowTop('91, 76, 224', 0.12) },
  },
  {
    id: 'gold',
    name: 'Gold',
    dark: { bg: '#12100b', text: '#a89c7c', textH: '#efe6d0', border: '#2c2618', accent: '#c9a24a', glow: glowCorner('201, 162, 74', 0.18, 80) },
    light: { bg: '#fbf6ea', text: '#7a6a45', textH: '#2a2213', border: '#eadfc4', accent: '#9c7a23', glow: glowCorner('201, 162, 74', 0.18, 80) },
  },
  {
    id: 'iridescent',
    name: 'Iridescent',
    dark: { bg: '#12111a', text: '#a7a3c2', textH: '#f2effc', border: '#2a2838', accent: '#b49cf5', fill: IRIDESCENT, glow: 'linear-gradient(160deg, rgba(161, 196, 253, 0.12), rgba(251, 194, 235, 0.1))' },
    light: { bg: '#f4f2fa', text: '#6e6884', textH: '#1f1b2e', border: '#e3def0', accent: '#8b6fe0', fill: IRIDESCENT, glow: 'linear-gradient(160deg, rgba(161, 196, 253, 0.3), rgba(251, 194, 235, 0.25))' },
  },
  {
    id: 'clean',
    name: 'Clean',
    dark: { bg: '#1a1b1e', text: '#9a9ca3', textH: '#f1f2f4', border: '#2c2e33', accent: '#a78bfa' },
    light: { bg: '#f7f7f5', text: '#6b7280', textH: '#1f2328', border: '#e5e7eb', accent: '#7c3aed' },
  },
  {
    id: 'spring',
    name: 'Spring',
    dark: { bg: '#101812', text: '#94ad9a', textH: '#e8f3ea', border: '#22332a', accent: '#4cc283', glow: glowCorner('244, 167, 192', 0.15, 90) },
    light: { bg: '#f2f8f1', text: '#5f7564', textH: '#1d2b20', border: '#dbe9dc', accent: '#2f8f57', glow: glowCorner('244, 167, 192', 0.3, 90) },
  },
  {
    id: 'summer',
    name: 'Summer',
    dark: { bg: '#17130b', text: '#b3a07c', textH: '#fbf1dc', border: '#30281a', accent: '#f5a524', glow: glowCorner('14, 165, 233', 0.15, 10) },
    light: { bg: '#fff8ec', text: '#7c6a4c', textH: '#2a2215', border: '#f0e2c6', accent: '#d97706', glow: glowCorner('14, 165, 233', 0.2, 10) },
  },
  {
    id: 'autumn',
    name: 'Autumn',
    dark: { bg: '#1b130e', text: '#b39a85', textH: '#f3e9df', border: '#36271c', accent: '#e07a3a', glow: glowTop('224, 122, 58', 0.18) },
    light: { bg: '#fbf3ec', text: '#8a6a52', textH: '#2e1d12', border: '#eddccd', accent: '#c25a1c', glow: glowTop('224, 122, 58', 0.15) },
  },
  {
    id: 'winter',
    name: 'Winter',
    dark: { bg: '#0f1720', text: '#8aa3b8', textH: '#e8f1f8', border: '#22324a', accent: '#7cc4f0', glow: glowTop('124, 196, 240', 0.2) },
    light: { bg: '#f1f6fb', text: '#5d7487', textH: '#14222e', border: '#d8e4ee', accent: '#2b84c4', glow: glowTop('124, 196, 240', 0.25) },
  },
  // The three designs from design-mockups/index.html. These also change
  // the fonts (see FONTS below).
  {
    id: 'constellation',
    name: 'Constellation',
    fonts: 'constellation',
    dark: { bg: '#070818', text: '#a3a8cf', textH: '#eef0ff', border: '#23264a', accent: '#b79cff', glow: glowCorner('91, 70, 220', 0.35, 70) },
    light: { bg: '#eef0fb', text: '#4f5480', textH: '#12143a', border: '#d6d9ef', accent: '#6a4fd8', glow: glowCorner('106, 79, 216', 0.15, 70) },
  },
  {
    id: 'trail',
    name: 'Trail',
    fonts: 'trail',
    dark: { bg: '#0f1a14', text: '#9db3a4', textH: '#e8f0e6', border: '#22362a', accent: '#ff7a45', glow: glowCorner('255, 122, 69', 0.12, 85) },
    light: { bg: '#e6ece2', text: '#4a5e52', textH: '#14261c', border: '#c3d0bd', accent: '#c94410', fill: '#e8501a' },
  },
  {
    id: 'vessel',
    name: 'Vessel',
    fonts: 'vessel',
    dark: { bg: '#071a26', text: '#8fb0c0', textH: '#e6f4f7', border: '#173447', accent: '#3fc7b6', fill: WATER, glow: glowTop('43, 179, 163', 0.18) },
    light: { bg: '#e8f1f2', text: '#456272', textH: '#0b2233', border: '#c9dadd', accent: '#1f6fbf', fill: WATER, glow: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6), transparent 40%)' },
  },
  // Stoic: black and marble, like the Marcus Aurelius bust pictures,
  // with one bronze accent. Faint marble veins in the background, and
  // Stoic quotes on the cover (see quotes.js).
  {
    id: 'stoic',
    name: 'Stoic',
    fonts: 'stoic',
    dark: { bg: '#0c0c0d', text: '#a9a59d', textH: '#f4f2ed', border: '#29282b', accent: '#d8c08a', fill: '#f4f2ed', glow: marbleVeins('255, 255, 255', 0.05) },
    light: { bg: '#f3f2ef', text: '#57544e', textH: '#111111', border: '#dcd9d2', accent: '#8a6a2f', fill: '#111111', glow: marbleVeins('0, 0, 0', 0.045) },
  },
]

// Font pairs: titles and everything else. Themes without `fonts` use the
// phone's own font. Loaded from Google Fonts (free) only when picked.
const SYSTEM = "system-ui, 'Segoe UI', Roboto, sans-serif"
const FONTS = {
  constellation: {
    heading: `Syne, ${SYSTEM}`,
    body: `Manrope, ${SYSTEM}`,
    url: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap',
  },
  trail: {
    heading: `'Bricolage Grotesque', ${SYSTEM}`,
    body: `'Atkinson Hyperlegible', ${SYSTEM}`,
    url: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Atkinson+Hyperlegible:wght@400;700&display=swap',
  },
  vessel: {
    heading: `'Instrument Serif', Georgia, serif`,
    body: `'Inter Tight', ${SYSTEM}`,
    url: 'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter+Tight:wght@400;500;600;700&display=swap',
  },
  // Cinzel: Roman inscription capitals. Spectral: a sharp serif made for screens.
  stoic: {
    heading: `Cinzel, Georgia, serif`,
    body: `Spectral, Georgia, serif`,
    url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Spectral:wght@400;500;600&display=swap',
  },
}

// Adds a theme's font file to the page once.
function loadFonts(url) {
  if (document.querySelector(`link[href="${url}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)
}

// '#c084fc', 0.15 -> 'rgba(192, 132, 252, 0.15)'
function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// Dark or light right now: the Mode setting, or the phone's own setting
// when Mode is Auto.
export function currentMode(mode) {
  if (mode === 'light' || mode === 'dark') return mode
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

// The colors of a theme in a mode.
export function paletteOf(themeId, mode) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
  return theme[currentMode(mode)]
}

// Puts a theme on the whole app by setting the color variables the styles
// use (--bg, --text, --accent, …).
export function applyTheme(themeId, mode) {
  const p = paletteOf(themeId, mode)
  const root = document.documentElement.style
  root.setProperty('--bg', p.bg)
  root.setProperty('--text', p.text)
  root.setProperty('--text-h', p.textH)
  root.setProperty('--border', p.border)
  root.setProperty('--accent', p.accent)
  root.setProperty('--accent-bg', alpha(p.accent, 0.14))
  root.setProperty('--accent-border', alpha(p.accent, 0.5))
  root.setProperty('--fill', p.fill || p.accent)
  // Cards: a slightly lighter layer on dark themes, a whiter layer on
  // tinted light themes (or a faint grey on pure white).
  const dark = currentMode(mode) === 'dark'
  root.setProperty(
    '--surface',
    dark ? 'rgba(255, 255, 255, 0.045)' : p.bg === '#ffffff' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.7)',
  )
  root.setProperty('--glow', p.glow || 'none')
  const fonts = FONTS[(THEMES.find(t => t.id === themeId) || THEMES[0]).fonts]
  if (fonts) loadFonts(fonts.url)
  root.setProperty('--sans', fonts ? fonts.body : SYSTEM)
  root.setProperty('--heading', fonts ? fonts.heading : SYSTEM)
  root.colorScheme = currentMode(mode)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', p.bg)
}
