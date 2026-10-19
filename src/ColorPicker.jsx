import { GOAL_COLORS } from './colors.js'

// A row of color dots to pick a goal's color. The first dot means
// "no color of its own": the goal then uses its bigger goal's color.
// `inherited` is the color it would get from its bigger goal.
function ColorPicker({ value, onChange, inherited }) {
  return (
    <fieldset className="link-list color-picker">
      <legend>Color</legend>
      <div className="swatches">
        <button
          type="button"
          className={!value ? 'swatch inherit selected' : 'swatch inherit'}
          style={{ '--swatch': inherited }}
          onClick={() => onChange(null)}
          aria-label="Use the bigger goal's color"
          aria-pressed={!value}
          title="Use the bigger goal's color"
        >
          ↑
        </button>
        {GOAL_COLORS.map(c => (
          <button
            key={c.value}
            type="button"
            className={value === c.value ? 'swatch selected' : 'swatch'}
            style={{ '--swatch': c.value }}
            onClick={() => onChange(c.value)}
            aria-label={c.label}
            aria-pressed={value === c.value}
            title={c.label}
          />
        ))}
      </div>
    </fieldset>
  )
}

export default ColorPicker
