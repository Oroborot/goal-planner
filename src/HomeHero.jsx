// The picture at the top of Home. Each design theme shows your progress its
// own way (see design-mockups/index.html); other themes show today's bar.
// - Constellation: your biggest goal as a star map; done goals light up
// - Trail: this week as a climb; every task or habit done goes up
// - Vessel: today as a glass that fills, with small tubes for the week,
//   month and year goals
import { childrenOf, progressOf } from './progress.js'
import { addDaysKey, dayCounts, mondayOf, todayKey } from './calendar.js'
import { labelOf, sizeOf } from './timeframes.js'
import ProgressBar from './ProgressBar.jsx'

const isLit = (goals, goal) => progressOf(goals, goal) >= 1

// Every goal under `goal`, all the way down (each once).
function allUnder(goals, goal) {
  const seen = new Set()
  const queue = [goal.id]
  while (queue.length > 0) {
    for (const child of childrenOf(goals, queue.shift())) {
      if (!seen.has(child.id)) {
        seen.add(child.id)
        queue.push(child.id)
      }
    }
  }
  return goals.filter(g => seen.has(g.id))
}

// Faint background stars, always in the same places.
const DUST = [
  [30, 30], [270, 24], [230, 138], [70, 140], [110, 14], [290, 70], [16, 84], [196, 12], [252, 150], [44, 64],
]

function Sky({ goals }) {
  // The biggest unfinished goal; with a tie, the one with most under it.
  const root = goals
    .filter(g => !g.done && !g.repeat)
    .sort((a, b) => sizeOf(b.timeframe) - sizeOf(a.timeframe) || childrenOf(goals, b.id).length - childrenOf(goals, a.id).length)[0]

  if (!root) {
    return (
      <a href="#goals" className="hero hero-empty">
        Add a year goal and the goals under it to start your sky.
      </a>
    )
  }

  const under = allUnder(goals, root)
  const lit = under.filter(g => isLit(goals, g)).length
  // Two rows of stars: the goals right under it, then theirs.
  const kids = childrenOf(goals, root.id).slice(0, 5)
  const stars = []
  kids.forEach((kid, i) => {
    const x = 30 + (240 * (i + 0.5)) / kids.length
    const grand = childrenOf(goals, kid.id).slice(0, 3)
    stars.push({ goal: kid, x, y: 74, from: [150, 24], size: 4.5 })
    grand.forEach((g, j) => {
      const gx = Math.min(290, Math.max(10, x + (j - (grand.length - 1) / 2) * 24))
      stars.push({ goal: g, x: gx, y: 122, from: [x, 74], size: 3.2 })
    })
  })

  return (
    <a href={`#goal/${root.id}`} className="hero hero-sky">
      <svg viewBox="0 0 300 150" role="img" aria-label={`${root.title}: ${lit} of ${under.length} goals lit`}>
        {DUST.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1" className="sky-dust" />
        ))}
        {stars.map(s => (
          <line
            key={`l-${s.goal.id}-${s.x}`}
            x1={s.from[0]} y1={s.from[1]} x2={s.x} y2={s.y}
            className={isLit(goals, s.goal) ? 'sky-line lit' : 'sky-line'}
          />
        ))}
        <circle cx="150" cy="24" r="15" className="sky-halo" />
        <circle cx="150" cy="24" r="7" className="sky-root" />
        {stars.map(s =>
          isLit(goals, s.goal) ? (
            <g key={`s-${s.goal.id}-${s.x}`}>
              <circle cx={s.x} cy={s.y} r={s.size * 2.2} className="sky-glow" />
              <circle cx={s.x} cy={s.y} r={s.size} className="sky-star lit" />
            </g>
          ) : (
            <circle key={`s-${s.goal.id}-${s.x}`} cx={s.x} cy={s.y} r={s.size} className="sky-star" />
          ),
        )}
      </svg>
      <span className="hero-caption">
        <span>
          {labelOf(root.timeframe)} · <b>{root.title}</b>
        </span>
        <span>
          {lit} / {under.length} lit
        </span>
      </span>
    </a>
  )
}

function Climb({ goals }) {
  const today = todayKey()
  const days = Array.from({ length: 7 }, (_, i) => addDaysKey(mondayOf(today), i))
  const counts = days.map(key => dayCounts(goals, key))
  const todayIndex = days.indexOf(today)
  // Height so far: what got done each day, added up. The dashed part is what
  // is still planned for the rest of the week.
  let height = 0
  const done = counts.map((c, i) => (height += i <= todayIndex ? c.done : 0))
  const planned = counts.map((c, i) => (i <= todayIndex ? done[i] : (height += c.total)))
  const top = Math.max(1, ...planned)
  const point = (value, i) => `${(i * 280) / 6},${64 - (value / top) * 56}`
  const solid = done.slice(0, todayIndex + 1).map(point).join(' L')
  const dashed = planned.slice(todayIndex).map((v, i) => point(v, i + todayIndex)).join(' L')
  const [tx, ty] = point(done[todayIndex], todayIndex).split(',')

  return (
    <a href="#week" className="hero hero-climb">
      <span className="hero-head">
        <b>{done[todayIndex]} done</b>
        <span>this week's climb</span>
      </span>
      <svg viewBox="-6 0 292 70" role="img" aria-label={`${done[todayIndex]} tasks and habits done this week`}>
        <path d={`M${solid} L${tx},70 L0,70Z`} className="climb-area" />
        <path d={`M${solid}`} className="climb-line" />
        {todayIndex < 6 && <path d={`M${dashed}`} className="climb-ahead" />}
        <circle cx={tx} cy={ty} r="6" className="climb-marker" />
      </svg>
      <span className="climb-days" aria-hidden="true">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className={i === todayIndex ? 'today' : ''}>{d}</span>
        ))}
      </span>
    </a>
  )
}

// Average progress of the goals in one timeframe (0 if there are none).
function fillOf(goals, timeframe) {
  const list = goals.filter(g => g.timeframe === timeframe)
  if (list.length === 0) return null
  return list.reduce((sum, g) => sum + progressOf(goals, g), 0) / list.length
}

function Glass({ goals }) {
  const { done, total } = dayCounts(goals, todayKey())
  const fill = total === 0 ? 0 : done / total
  // The water line: y 140 (empty) to 12 (full) inside the glass.
  const level = 140 - fill * 128
  const tubes = ['week', 'month', 'year'].map(t => ({ t, fill: fillOf(goals, t) }))

  return (
    <div className="hero hero-glass">
      <svg viewBox="0 0 110 150" role="img" aria-label={`Today ${Math.round(fill * 100)} percent full`}>
        <defs>
          <clipPath id="home-glass">
            <path d="M14 8 H96 L88 138 Q87 146 79 146 H31 Q23 146 22 138 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#home-glass)">
          {fill > 0 && (
            <path
              className="glass-water"
              d={`M-10 ${level} Q10 ${level - 7} 30 ${level} T70 ${level} T110 ${level} T150 ${level} V160 H-10Z`}
            />
          )}
        </g>
        <path d="M14 8 H96 L88 138 Q87 146 79 146 H31 Q23 146 22 138 Z" className="glass-edge" />
        <path d="M24 20 L30 120" className="glass-shine" />
      </svg>
      <div>
        <b className="glass-big">{Math.round(fill * 100)}%</b>
        <p className="glass-note">
          {total === 0 ? 'Nothing planned today.' : `${done} of ${total} done today.`}
        </p>
        <div className="glass-tubes">
          {tubes.map(({ t, fill: f }) => (
            <span key={t} className="glass-tube">
              <span className="tube-body" role="img" aria-label={f === null ? `No ${t} goals` : `${labelOf(t)} goals ${Math.round(f * 100)}%`}>
                <span className="tube-water" style={{ height: `${Math.round((f || 0) * 100)}%` }} />
              </span>
              <span className="tube-label">{labelOf(t)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TodayBar({ goals }) {
  const { done, total } = dayCounts(goals, todayKey())
  return (
    <a href="#day" className="hero hero-bar">
      <span className="hero-head">
        <b>
          {done} of {total}
        </b>
        <span>done today</span>
      </span>
      <ProgressBar progress={total === 0 ? 0 : done / total} size="large" />
    </a>
  )
}

function HomeHero({ theme, goals }) {
  if (theme === 'constellation') return <Sky goals={goals} />
  if (theme === 'trail') return <Climb goals={goals} />
  if (theme === 'vessel') return <Glass goals={goals} />
  return <TodayBar goals={goals} />
}

export default HomeHero
