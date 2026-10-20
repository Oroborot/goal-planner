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

      <BackupSection items={items} events={events} settings={settings} onRestore={onRestore} />
    </div>
  )
}

export default SettingsPage
