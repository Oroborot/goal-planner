// The pages visited inside the app, so "← Back" knows where you came from.
// App.jsx calls rememberPage() every time the address changes.
const visited = []

export function rememberPage(hash) {
  // Going back to the page before the last one: drop the last one.
  if (visited.length > 1 && visited[visited.length - 2] === hash) visited.pop()
  else if (visited[visited.length - 1] !== hash) visited.push(hash)
}

// True when there's an earlier page in the app to go back to.
export function canGoBack() {
  return visited.length > 1
}
