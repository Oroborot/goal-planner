import BackupSection from './BackupSection.jsx'
import ThemePicker from './ThemePicker.jsx'

// Settings: look (theme + dark/light), clock, and the backup.
// Icons, fonts, text size and your own colors come with "Customize" later.
function SettingsPage({ settings, onChange, items, events, onRestore }) {
  const modes = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'auto', label: 'Auto (phone)' },
  ]
  const clocks = [
    { value: '24', label: '24-hour', example: '18:30' },
    { value: '12', label: '12-hour', example: '6:30 PM' },
  ]

  const coverStyles = [
    { value: 'tree', label: 'Tree' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'plank', label: 'Burning plank' },
  ]
  const routineViews = [
    { value: 'stepped', label: 'Stepped' },
    { value: 'compact', label: 'Compact' },
  ]

  // A row of choices where one is picked (dark/light/auto, 24h/12h).
  const choices = (list, key) => (
    <div className="tabs">
      {list.map(c => (
        <button
          key={c.value}
          type="button"
          className={settings[key] === c.value ? 'tab active' : 'tab'}
          aria-pressed={settings[key] === c.value}
          onClick={() => onChange({ ...settings, [key]: c.value })}
        >
          {c.label} {c.example && <span className="goal-meta">{c.example}</span>}
        </button>
      ))}
    </div>
  )

  return (
    <div className="app">
      <h1>Settings</h1>

      <h2>Look</h2>
      {choices(modes, 'mode')}
      <ThemePicker
        themeId={settings.theme}
        mode={settings.mode}
        onPick={theme => onChange({ ...settings, theme })}
      />
      <p className="goal-meta">More (icons, fonts, text size, your own colors) comes with Customize later.</p>

      <h2>Clock</h2>
      {choices(clocks, 'clock')}

      <h2>Cover screen</h2>
      {choices(coverStyles, 'coverStyle')}
      <label className="done-toggle">
        <input
          type="checkbox"
          checked={settings.coverOnOpen}
          onChange={e => onChange({ ...settings, coverOnOpen: e.target.checked })}
        />
        <span>Show when the app opens</span>
      </label>
      <label className="done-toggle">
        <input
          type="checkbox"
          checked={settings.coverOnHome}
          onChange={e => onChange({ ...settings, coverOnHome: e.target.checked })}
        />
        <span>Show when tapping Home</span>
      </label>
      <p className="goal-meta">It fills up as today gets done. Pictures and more quotes come later.</p>

      <h2>Plan and wrap-up</h2>
      {choices(routineViews, 'routineView')}
      <p className="goal-meta">Stepped: one step per screen. Compact: everything on one page.</p>

      <BackupSection items={items} events={events} settings={settings} onRestore={onRestore} />
    </div>
  )
}

export default SettingsPage
