// Remembers where you were in the Ideas tab (which idea, how far scrolled),
// so coming back from another tab puts you in the same spot.
const KEY = 'planner-ideas-last'

export function loadIdeasSpot() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

// Save the idea you are in (null = the overview, which forgets the spot).
export function saveIdeasSpot(ideaId, scroll = 0) {
  try {
    if (ideaId) localStorage.setItem(KEY, JSON.stringify({ ideaId, scroll }))
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: just don't remember.
  }
}
