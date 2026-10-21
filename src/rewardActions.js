// Rewards you set yourself: "10 workouts → new shoes".
// Each reward is an item: { id, list: 'rewards', title, goalId (or null =
// everything), kind: 'times' | 'minutes' | 'streak', target, createdAt,
// claimedAt }. Progress counts from the day the reward was made.
import { makeEvent } from './history.js'
import { activeGoals } from './progress.js'
import { repeatStats } from './repeat.js'
import { dateKey } from './calendar.js'
import { doneByDay, timeByDay, withSmaller } from './stats.js'

export const REWARD_KINDS = [
  { value: 'times', label: 'times done' },
  { value: 'minutes', label: 'minutes on the timer' },
  { value: 'streak', label: 'days in a row (habit)' },
]

export function activeRewards(items) {
  return items.filter(item => item.list === 'rewards' && !item.deletedAt)
}

// How far along a reward is: { value, target, reached }.
export function rewardProgress(items, events, reward) {
  const goals = activeGoals(items)
  const goal = reward.goalId && goals.find(g => g.id === reward.goalId)
  const ids = goal ? withSmaller(goals, goal.id) : null
  const from = dateKey(new Date(reward.createdAt))
  let value
  if (reward.kind === 'streak') {
    value = goal && goal.repeat ? repeatStats(goal).streak : 0
  } else if (reward.kind === 'minutes') {
    const time = timeByDay(events, ids)
    value = Math.floor(Object.keys(time).filter(d => d >= from).reduce((s, d) => s + time[d], 0) / 60)
  } else {
    const done = doneByDay(goals, ids)
    value = Object.keys(done).filter(d => d >= from).reduce((s, d) => s + done[d], 0)
  }
  return { value: Math.min(value, reward.target), target: reward.target, reached: value >= reward.target }
}

export function addReward(items, { title, goalId, kind, target }) {
  const reward = {
    id: crypto.randomUUID(),
    list: 'rewards',
    title,
    goalId: goalId || null,
    kind,
    target,
    createdAt: new Date().toISOString(),
    claimedAt: null,
    deletedAt: null,
  }
  return { items: [...items, reward], events: [makeEvent('reward-added', reward)] }
}

export function claimReward(items, id) {
  const reward = items.find(item => item.id === id)
  return {
    items: items.map(item => (item.id === id ? { ...item, claimedAt: new Date().toISOString() } : item)),
    events: [makeEvent('reward-claimed', reward)],
  }
}

export function deleteReward(items, id) {
  const reward = items.find(item => item.id === id)
  return {
    items: items.map(item => (item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item)),
    events: [makeEvent('deleted', reward)],
  }
}
