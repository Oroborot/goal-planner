import { useLayoutEffect, useRef, useState } from 'react'
import { cloudPath } from './cloudShape.js'

// One felt cloud. Whatever is put inside decides its size; the cloud shape
// is then drawn behind it to fit.
// - seed:   the idea's id, so each cloud keeps its own bumps
// - tone:   'purple', 'green', 'purple-soft', 'green-soft' or 'cream'
// - kind:   'main' (overview), 'big' (the open idea), 'mid' or 'leaf'
// - tail:   show the two little thought bubbles under the cloud
// - onOpen: what happens on tap (leave out for a cloud you can't tap)
function IdeaCloud({ seed, tone, kind, tail = false, onOpen, label, style, children }) {
  const box = useRef(null)
  const [size, setSize] = useState(null)

  // Measure the cloud, and measure again whenever its content changes size.
  useLayoutEffect(() => {
    const element = box.current
    const observer = new ResizeObserver(() => {
      const width = element.offsetWidth
      const height = element.offsetHeight
      setSize(old => (old && old.width === width && old.height === height ? old : { width, height }))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Tapping a small cloud inside a bigger one must open only the small one.
  function open(event) {
    event.stopPropagation()
    onOpen()
  }
  const tappable = onOpen
    ? {
        role: 'link',
        tabIndex: 0,
        'aria-label': label,
        onClick: open,
        onKeyDown: event => event.key === 'Enter' && open(event),
      }
    : {}

  // The thought bubbles grow a little with the cloud.
  const scale = size ? Math.max(0.7, Math.min(1.7, Math.min(size.width, size.height) / 95)) : 1

  return (
    <div ref={box} className={`cloud cloud-${kind} cloud-${tone}`} style={style} {...tappable}>
      {size && (
        <svg className="cloud-shape" width={size.width} height={size.height} aria-hidden="true">
          <path d={cloudPath(size.width, size.height, seed)} />
          {tail && (
            <>
              <circle cx={size.width * 0.17} cy={size.height + 2 * scale} r={7 * scale} />
              <circle cx={size.width * 0.17 - 12 * scale} cy={size.height + 12 * scale} r={4 * scale} />
            </>
          )}
        </svg>
      )}
      <div className="cloud-body">{children}</div>
    </div>
  )
}

export default IdeaCloud
