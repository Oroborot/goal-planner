// Numbers for the Work part of the Stats page. Plain functions, no screen code.
// Time of day and the Week/Month/All time filter are shared with Training
// (see trainingStats.js).

// Only real Work sessions: not Training, not deleted.
// Missing numbers are filled in with 0, so old or odd sessions never break a sum.
export const workSessions = sessions =>
  sessions
    .filter(s => s.kind !== 'training' && !s.deletedAt)
    .map(s => ({ ...s, focusMs: s.focusMs || 0, breakMs: s.breakMs || 0, breaks: s.breaks || [] }))

// How many sessions, and the total focus time (in seconds).
export function focusTotals(sessions) {
  return { count: sessions.length, seconds: sessions.reduce((sum, s) => sum + s.focusMs, 0) / 1000 }
}

// Focus time per project, longest first: [{ id, name, color, ms }].
// Each bar is `share` of the longest one (0 to 1). A project that was
// deleted later still shows, under the name "Other".
export function focusByProject(sessions, projects) {
  const totals = {}
  for (const s of sessions) totals[s.projectId] = (totals[s.projectId] || 0) + s.focusMs
  const list = Object.entries(totals)
    .map(([id, ms]) => {
      const project = projects.find(p => p.id === id)
      return { id, name: project ? project.name : 'Other', color: project ? project.color : 'var(--accent)', ms }
    })
    .filter(p => p.ms > 0)
    .sort((a, b) => b.ms - a.ms)
  const max = list.length ? list[0].ms : 1
  return list.map(p => ({ ...p, share: p.ms / max }))
}

// Totals of everything the sessions brought:
// { money: [{ currency, value }], numbers: [{ unit, value }], items: n }
export function gainTotals(sessions) {
  const money = {}
  const numbers = {}
  let items = 0
  for (const s of sessions) {
    for (const g of s.gains || []) {
      if (g.type === 'money') money[g.currency] = (money[g.currency] || 0) + (Number(g.value) || 0)
      else if (g.type === 'number') {
        const unit = (g.unit || '').trim()
        numbers[unit] = (numbers[unit] || 0) + (Number(g.value) || 0)
      } else if (g.type === 'item') items += 1
    }
  }
  return {
    money: Object.entries(money).map(([currency, value]) => ({ currency, value })),
    numbers: Object.entries(numbers).map(([unit, value]) => ({ unit, value })),
    items,
  }
}

// True when there is nothing to show in the Gains section.
export const noGains = g => g.money.length === 0 && g.numbers.length === 0 && g.items === 0
