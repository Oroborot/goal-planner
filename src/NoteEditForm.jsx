import { useState } from 'react'
import { activeNotes } from './noteActions.js'
import { activeGoals } from './progress.js'
import { labelOf } from './timeframes.js'

// The edit form on a note's page: title, text, task or not, and links.
// Links can go to any other note or any goal. Nothing changes until Save.
function NoteEditForm({ note, items, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)
  const [isTask, setIsTask] = useState(note.isTask)
  const [links, setLinks] = useState(note.links)
  const [linkSearch, setLinkSearch] = useState('')

  // Everything this note could link to, filtered by the search box.
  const query = linkSearch.trim().toLowerCase()
  const options = [
    ...activeNotes(items)
      .filter(n => n.id !== note.id)
      .map(n => ({ id: n.id, label: `${n.shortId} ${n.title}`, kind: 'Note' })),
    ...activeGoals(items).map(g => ({
      id: g.id,
      label: g.title,
      kind: `${labelOf(g.timeframe)} goal`,
    })),
  ].filter(o => !query || `${o.label} ${o.kind}`.toLowerCase().includes(query))

  function toggleLink(id) {
    setLinks(links.includes(id) ? links.filter(l => l !== id) : [...links, id])
  }

  function save(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), body, isTask, links })
  }

  return (
    <form className="goal-form edit-form" onSubmit={save}>
      <input value={title} onChange={e => setTitle(e.target.value)} aria-label="Title" autoFocus />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Details, a list, anything… (one item per line works well)"
        aria-label="Text"
        rows={6}
      />
      <label className="done-toggle">
        <input
          type="checkbox"
          checked={isTask}
          onChange={e => setIsTask(e.target.checked)}
          aria-label="It's a task"
        />
        <span>It's a task (has a tick box)</span>
      </label>

      <fieldset className="link-list">
        <legend>Links ({links.length})</legend>
        <input
          type="search"
          value={linkSearch}
          onChange={e => setLinkSearch(e.target.value)}
          placeholder="Find a note or goal to link"
          aria-label="Find a note or goal to link"
        />
        {options.length === 0 ? (
          <p className="link-empty">Nothing to link yet.</p>
        ) : (
          options.map(o => (
            <label key={o.id}>
              <input
                type="checkbox"
                checked={links.includes(o.id)}
                onChange={() => toggleLink(o.id)}
                aria-label={`Link to ${o.label}`}
              />
              <span>
                {o.label} <span className="link-timeframe">({o.kind})</span>
              </span>
            </label>
          ))
        )}
      </fieldset>

      <div className="row">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={!title.trim()}>
          Save
        </button>
      </div>
    </form>
  )
}

export default NoteEditForm
