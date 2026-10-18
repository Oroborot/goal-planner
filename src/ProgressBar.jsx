import { percent } from './progress.js'

// A bar that fills up from 0% to 100%. `progress` is a number from 0 to 1.
// `size` is 'large' (goal page) or 'small' (lists).
function ProgressBar({ progress, size = 'small' }) {
  const value = percent(progress)
  return (
    <div
      className={`progress progress-${size}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  )
}

export default ProgressBar
