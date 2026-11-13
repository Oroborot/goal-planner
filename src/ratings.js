// Exercise ratings: every tap on − or ＋ in the Training panel is ONE vote.
// Votes are never replaced, they add up. Saved in localStorage as:
//   { [exerciseKey]: { plus, minus, votes: [{ at, v }] } }
// `v` is 1 (liked, ＋) or -1 (disliked, −). `at` is the date and time.
const KEY = 'planner-ratings'

// The key for an exercise: its id, or the lowercase custom name.
export function ratingKey(id, name) {
  if (id) return id
  return (name || '').trim().toLowerCase()
}

// Reads all ratings. Returns {} if nothing is saved or it is unreadable.
export function loadRatings() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

// The tally for one exercise: { plus, minus }.
export function getTally(key) {
  const entry = loadRatings()[key]
  return { plus: entry?.plus || 0, minus: entry?.minus || 0 }
}

// Adds one vote (v = 1 or -1) and returns the new tally.
export function addVote(key, v) {
  if (!key) return { plus: 0, minus: 0 }
  const all = loadRatings()
  const entry = all[key] || { plus: 0, minus: 0, votes: [] }
  entry.votes.push({ at: new Date().toISOString(), v })
  if (v > 0) entry.plus += 1
  else entry.minus += 1
  all[key] = entry
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // Storage full or blocked: the vote is just not saved.
  }
  return { plus: entry.plus, minus: entry.minus }
}
