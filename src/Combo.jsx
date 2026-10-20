import { useEffect, useRef, useState } from 'react'

// A text box with a short scrollable list under it: type anything, or tap
// an option. Used for times, expected time and the "Do after" search.
// - options: [{ value, label }]
// - format(value) -> the text shown in the box
// - parse(text) -> a value, or undefined if the text isn't valid
// - filter: true = the list narrows to what you type (search);
//   false = the whole list always shows, jumping to the closest match
function Combo({ value, onChange, options, format, parse, placeholder, label, filter = false }) {
  const [open, setOpen] = useState(false)
  // What you're typing. While the list is closed the box just shows the
  // saved value, so it always stays in sync.
  const [draft, setDraft] = useState('')
  const text = open ? draft : format(value)
  const listRef = useRef(null)

  const query = text.trim().toLowerCase()
  const shown = filter && query ? options.filter(o => o.label.toLowerCase().includes(query)) : options
  // The option to highlight: the current value, or the first that starts
  // with what's typed.
  const match =
    (query && options.find(o => o.label.toLowerCase().startsWith(query))) ||
    options.find(o => o.value === value)

  // Scroll the list so the highlighted option is in view.
  useEffect(() => {
    if (!open || !match || !listRef.current) return
    const el = listRef.current.querySelector(`[data-value="${CSS.escape(String(match.value))}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, match])

  function choose(next) {
    onChange(next)
    setOpen(false)
  }

  // Leaving the box: keep what was typed if it makes sense, otherwise
  // go back to the saved value.
  function commit() {
    const parsed = parse(text)
    if (parsed !== undefined) choose(parsed)
    else setOpen(false)
  }

  return (
    <div className="combo">
      <input
        value={text}
        onChange={e => {
          setDraft(e.target.value)
          setOpen(true)
        }}
        onFocus={e => {
          setDraft(format(value))
          setOpen(true)
          e.target.select()
        }}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder={placeholder}
        aria-label={label}
        aria-expanded={open}
        autoComplete="off"
      />
      {open && shown.length > 0 && (
        <ul className="combo-list" ref={listRef} role="listbox" aria-label={label}>
          {shown.map(o => (
            <li
              key={String(o.value)}
              data-value={String(o.value)}
              role="option"
              aria-selected={match?.value === o.value}
              className={match?.value === o.value ? 'match' : ''}
              // mousedown runs before the box loses focus, so the tap counts
              onMouseDown={e => {
                e.preventDefault()
                choose(o.value)
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Combo
