// Goal colors. A goal can have its own color; if it doesn't, it uses its
// bigger goal's color (the first one it counts toward), all the way up.
// With no color anywhere in the chain, it's grey.

export const GOAL_COLORS = [
  { value: '#e5484d', label: 'Red' },
  { value: '#f76b15', label: 'Orange' },
  { value: '#ffc53d', label: 'Yellow' },
  { value: '#30a46c', label: 'Green' },
  { value: '#12a594', label: 'Teal' },
  { value: '#0090ff', label: 'Blue' },
  { value: '#8e4ec6', label: 'Purple' },
  { value: '#d6409f', label: 'Pink' },
]

export const NO_COLOR = '#8b8d98'

// The color a goal shows: its own, or the nearest bigger goal's.
// `seen` stops endless loops if links ever go in a circle.
export function colorOf(goals, goal, seen = new Set()) {
  if (goal.color) return goal.color
  if (seen.has(goal.id)) return NO_COLOR
  seen.add(goal.id)
  for (const parentId of goal.parentIds) {
    const parent = goals.find(g => g.id === parentId)
    if (parent) {
      const color = colorOf(goals, parent, seen)
      if (color !== NO_COLOR) return color
    }
  }
  return NO_COLOR
}
