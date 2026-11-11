// Draws the outline of a cloud: a soft rounded box with round bumps all
// the way around, like a shape cut out of felt.

// Turn a text (an idea's id) into a list of "random" numbers between 0 and
// 1 that is the same every time, so a cloud keeps its shape.
export function randomFrom(text) {
  let seed = 2166136261
  for (let i = 0; i < text.length; i++) seed = Math.imul(seed ^ text.charCodeAt(i), 16777619)
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// The SVG path for a cloud that fills a box of `width` x `height` pixels.
export function cloudPath(width, height, seedText) {
  const random = randomFrom(seedText)
  // How wide one bump is: bigger clouds get bigger bumps.
  const bump = Math.max(18, Math.min(76, Math.min(width, height) * 0.34))
  // The bumps stick out, so the line they sit on is a bit inside the box.
  const inset = bump * 0.3
  const a = width / 2 - inset
  const b = height / 2 - inset

  // 1. Walk around a "squircle" (between an oval and a box) in tiny steps.
  const steps = 240
  const outline = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    outline.push({
      x: width / 2 + a * Math.sign(cos) * Math.abs(cos) ** 0.62,
      y: height / 2 + b * Math.sign(sin) * Math.abs(sin) ** 0.62,
    })
  }
  // How far along the line each tiny step is.
  const lengths = [0]
  for (let i = 1; i < outline.length; i++) {
    const dx = outline[i].x - outline[i - 1].x
    const dy = outline[i].y - outline[i - 1].y
    lengths.push(lengths[i - 1] + Math.hypot(dx, dy))
  }
  const total = lengths[steps]

  // 2. Pick evenly spread points on that line (nudged a little, so the
  //    bumps aren't all the same size).
  const count = Math.max(6, Math.round(total / bump))
  const points = []
  let step = 0
  for (let i = 0; i < count; i++) {
    const target = ((i + (random() - 0.5) * 0.4) / count) * total
    while (step < steps && lengths[step + 1] < target) step++
    points.push(outline[Math.max(0, step)])
  }

  // 3. Join each point to the next with a round arc that bulges outward.
  const fixed = n => n.toFixed(1)
  let path = `M${fixed(points[0].x)} ${fixed(points[0].y)}`
  for (let i = 1; i <= count; i++) {
    const from = points[i - 1]
    const to = points[i % count]
    const radius = Math.hypot(to.x - from.x, to.y - from.y) * 0.62
    path += `A${fixed(radius)} ${fixed(radius)} 0 0 1 ${fixed(to.x)} ${fixed(to.y)}`
  }
  return `${path}Z`
}
