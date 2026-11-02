import { useState } from 'react'
import { SETTING_LIMITS } from './training.js'

// The fields, in the order they show.
const FIELDS = [
  { key: 'roundsPerSet', label: 'Rounds per set', unit: '' },
  { key: 'sets', label: 'Number of sets', unit: '' },
  { key: 'exerciseSeconds', label: 'Exercise', unit: 'sec' },
  { key: 'restSeconds', label: 'Rest', unit: 'sec' },
  { key: 'setRestSeconds', label: 'Set rest', unit: 'sec' },
]

// The settings sheet on the Training tab: plain number fields.
// `running` is true while a workout is on, so we can say that the new
// numbers only count from the next start.
function TrainingSettings({ settings, running, onSave, onClose }) {
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map(f => [f.key, String(settings[f.key])])))

  return (
    <div className="training-backdrop" onClick={onClose}>
      <div className="training-panel" role="dialog" aria-label="Workout settings" onClick={e => e.stopPropagation()}>
        <div className="training-panel-grab">
          <div className="sheet-handle" />
          <div className="training-panel-head">
            <h2>Workout</h2>
            <button type="button" className="sheet-x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="training-panel-body">
          <div className="training-settings">
            {FIELDS.map(({ key, label, unit }) => (
              <label key={key} className="training-setting">
                <span>{label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={SETTING_LIMITS[key][0]}
                  max={SETTING_LIMITS[key][1]}
                  value={values[key]}
                  onChange={e => setValues({ ...values, [key]: e.target.value })}
                />
                <span className="training-setting-unit">{unit}</span>
              </label>
            ))}
          </div>
          {running && <p className="training-panel-note">Your workout is running. These numbers count from the next start.</p>}
          <button type="button" className="training-settings-save" onClick={() => onSave(values)}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrainingSettings
