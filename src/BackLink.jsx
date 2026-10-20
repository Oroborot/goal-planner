import { canGoBack } from './navHistory.js'

// "← Back": returns to the previous page in the app. If you opened this page
// directly (nothing to go back to), it goes to `fallback` instead.
function BackLink({ fallback = '#' }) {
  function goBack(e) {
    if (canGoBack()) {
      e.preventDefault()
      window.history.back()
    }
  }
  return (
    <a href={fallback} className="back" onClick={goBack}>
      ← Back
    </a>
  )
}

export default BackLink
