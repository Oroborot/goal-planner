// Settings: your preferences. For now the clock; colors, icons, fonts and
// themes come with "Customize" later.
function SettingsPage({ settings, onChange }) {
  const clocks = [
    { value: '24', label: '24-hour', example: '18:30' },
    { value: '12', label: '12-hour', example: '6:30 PM' },
  ]
  return (
    <div className="app">
      <h1>Settings</h1>

      <h2>Clock</h2>
      <div className="tabs">
        {clocks.map(c => (
          <button
            key={c.value}
            type="button"
            className={settings.clock === c.value ? 'tab active' : 'tab'}
            aria-pressed={settings.clock === c.value}
            onClick={() => onChange({ ...settings, clock: c.value })}
          >
            {c.label} <span className="goal-meta">{c.example}</span>
          </button>
        ))}
      </div>

      <h2>Customize</h2>
      <p className="empty">Colors, icons, fonts and themes are coming later.</p>
    </div>
  )
}

export default SettingsPage
