import { THEMES, currentMode } from './themes.js'

// A small preview card for each theme, in the current mode (dark or
// light): its background, glow, a task line and the ＋ button. Tapping one
// switches the whole app right away.
function ThemePicker({ themeId, mode, onPick }) {
  const shown = currentMode(mode)
  return (
    <div className="theme-grid">
      {THEMES.map(theme => {
        const p = theme[shown]
        const fill = p.fill || p.accent
        return (
          <button
            key={theme.id}
            type="button"
            className={theme.id === themeId ? 'theme-card selected' : 'theme-card'}
            onClick={() => onPick(theme.id)}
            aria-pressed={theme.id === themeId}
            aria-label={`${theme.name} theme`}
          >
            <span
              className="theme-swatch"
              style={{ background: p.bg, backgroundImage: p.glow || 'none', borderColor: p.border }}
            >
              <span className="theme-line" style={{ background: p.border }}>
                <span style={{ background: p.accent }} />
              </span>
              <span className="theme-line short" style={{ background: p.border }} />
              <span className="theme-plus" style={{ background: fill, color: p.bg }}>
                +
              </span>
            </span>
            <span className="theme-name">{theme.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ThemePicker
