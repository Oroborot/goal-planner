import { useState } from 'react'
import BackLink from './BackLink.jsx'
import ProgressBar from './ProgressBar.jsx'
import { activeGoals } from './progress.js'
import { labelOf } from './timeframes.js'
import {
  activeRewards,
  addReward,
  claimReward,
  deleteReward,
  REWARD_KINDS,
  rewardProgress,
} from './rewardActions.js'

// Rewards you set yourself (Menu → Rewards): pick what counts (times done,
// minutes on the timer, or a habit streak), for one goal or everything,
// and how much. When it's reached you claim it. 🎉
function RewardsPage({ items, events, apply }) {
  const goals = activeGoals(items)
  const rewards = activeRewards(items)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', goalId: '', kind: 'times', target: 10 })
  const set = changes => setForm({ ...form, ...changes })

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || !(Number(form.target) > 0)) return
    apply(addReward(items, { ...form, title: form.title.trim(), target: Number(form.target) }))
    setForm({ title: '', goalId: '', kind: 'times', target: 10 })
    setAdding(false)
  }

  const open = rewards.filter(r => !r.claimedAt)
  const claimed = rewards.filter(r => r.claimedAt)
  const kindLabel = kind => REWARD_KINDS.find(k => k.value === kind)?.label

  return (
    <div className="app">
      <BackLink fallback="#" />
      <h1>Rewards</h1>

      {!adding ? (
        <button type="button" className="secondary add-toggle" onClick={() => setAdding(true)}>
          ＋ Add a reward
        </button>
      ) : (
        <form className="goal-form" onSubmit={submit}>
          <input
            autoFocus
            value={form.title}
            onChange={e => set({ title: e.target.value })}
            placeholder="The reward (e.g. new running shoes)"
            aria-label="Reward"
          />
          <div className="row">
            <input
              type="number"
              min="1"
              value={form.target}
              onChange={e => set({ target: e.target.value })}
              aria-label="How many"
              className="reward-target"
            />
            <select value={form.kind} onChange={e => set({ kind: e.target.value })} aria-label="What counts">
              {REWARD_KINDS.map(k => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <select value={form.goalId} onChange={e => set({ goalId: e.target.value })} aria-label="For which goal">
            <option value="">{form.kind === 'streak' ? 'Pick a habit…' : 'Any goal or task'}</option>
            {goals
              .filter(g => form.kind !== 'streak' || g.repeat)
              .map(g => (
                <option key={g.id} value={g.id}>
                  {g.title} ({labelOf(g.timeframe)})
                </option>
              ))}
          </select>
          <div className="row">
            <button type="button" className="secondary" onClick={() => setAdding(false)}>
              Close
            </button>
            <button type="submit">Add</button>
          </div>
        </form>
      )}

      {open.length === 0 && claimed.length === 0 && (
        <p className="empty">No rewards yet. Set one: “10 workouts → new shoes”.</p>
      )}

      <ul className="reward-list">
        {open.map(r => {
          const p = rewardProgress(items, events, r)
          const goal = goals.find(g => g.id === r.goalId)
          return (
            <li key={r.id} className={p.reached ? 'reached' : ''}>
              <div className="reward-head">
                <strong>🎁 {r.title}</strong>
                <button type="button" className="icon-button" onClick={() => apply(deleteReward(items, r.id))} aria-label={`Delete reward "${r.title}"`}>
                  ✕
                </button>
              </div>
              <span className="goal-meta">
                {p.value}/{p.target} {kindLabel(r.kind)}
                {goal ? ` · ${goal.title}` : ' · any goal'}
              </span>
              <ProgressBar progress={p.value / p.target} />
              {p.reached && (
                <button type="button" onClick={() => apply(claimReward(items, r.id))}>
                  🎉 Claim it
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {claimed.length > 0 && (
        <>
          <h2>Claimed</h2>
          <ul className="reward-list">
            {claimed.map(r => (
              <li key={r.id} className="claimed">
                <strong>🏆 {r.title}</strong>
                <span className="goal-meta">
                  Claimed {new Date(r.claimedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default RewardsPage
