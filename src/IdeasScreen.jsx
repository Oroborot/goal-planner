import { useState } from 'react'
import AppIcon from './icons.jsx'
import GearButton from './GearButton.jsx'
import IdeaCloud from './IdeaCloud.jsx'
import { randomFrom } from './cloudShape.js'
import {
  addIdea,
  childIdeas,
  countInside,
  deleteIdea,
  ideaPath,
  ideasInside,
  mainIdeas,
  moveIdea,
  renameIdea,
  setIdeaText,
} from './ideaActions.js'
import './Ideas.css'

function openIdea(id) {
  window.location.hash = `idea/${id}`
}

// Which felt color a cloud gets. Clouds with nothing inside are cream.
// The others take turns with the main idea's color, level by level, and
// get paler from the third level down.
function toneFor(mainColor, depth, isEmpty) {
  if (isEmpty) return 'cream'
  const first = mainColor === 'green' ? 'green' : 'purple'
  const second = first === 'green' ? 'purple' : 'green'
  const color = depth % 2 === 0 ? first : second
  return depth >= 2 ? `${color}-soft` : color
}

// A small nudge left/right and up/down, so the overview looks loosely
// spread out instead of lined up. Always the same for the same idea.
function drift(id) {
  const random = randomFrom(`${id}-drift`)
  const x = Math.round((random() - 0.5) * 22)
  const y = Math.round((random() - 0.5) * 26)
  return { transform: `translate(${x}px, ${y}px)` }
}

// A small ≡ mark after a cloud's title when the idea has text written in it.
function NoteMark({ idea }) {
  if (!idea.how?.trim()) return null
  return <span className="cloud-note" aria-label="has notes" title="Has notes"> ≡</span>
}

// The free text under an idea's title. It is saved when you tap away from
// the field (not on every letter), so the history log stays tidy.
function IdeaText({ idea, onSave }) {
  const [text, setText] = useState(idea.how ?? '')
  return (
    <textarea
      className="idea-text"
      value={text}
      onChange={e => setText(e.target.value)}
      onBlur={() => text !== (idea.how ?? '') && onSave(text)}
      placeholder="Notes, how it works… (paste anything)"
      aria-label="Notes"
      rows={4}
    />
  )
}

// The small box with one text field, used for "new idea", "new note" and
// "rename". It sits near the top so the iPhone keyboard doesn't cover it.
function IdeaDialog({ heading, start = '', saveLabel, onSave, onClose }) {
  const [text, setText] = useState(start)
  function submit(event) {
    event.preventDefault()
    const title = text.trim()
    if (title) onSave(title)
    onClose()
  }
  return (
    <div className="idea-dialog-backdrop" onClick={onClose}>
      <form className="idea-dialog" role="dialog" aria-label={heading} onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h2>{heading}</h2>
        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type it here"
          aria-label={heading}
          maxLength={80}
        />
        <div className="idea-dialog-buttons">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={!text.trim()}>
            {saveLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

// The overview: only the main ideas, floating loosely.
function IdeasOverview({ items, apply, onGear }) {
  const [adding, setAdding] = useState(false)
  const mains = mainIdeas(items)
  return (
    <div className="app ideas">
      <div className="tab-head">
        <h1>Ideas</h1>
        <GearButton onClick={onGear} />
      </div>
      {mains.length === 0 && <p className="empty">No ideas yet. Tap ＋ to add your first one.</p>}
      <div className="ideas-sky">
        {mains.map(idea => (
          <IdeaCloud
            key={idea.id}
            seed={idea.id}
            kind="main"
            tone={toneFor(idea.color, 0, false)}
            tail
            label={`Open ${idea.title}`}
            style={drift(idea.id)}
            onOpen={() => openIdea(idea.id)}
          >
            <span className="cloud-title">{idea.title}<NoteMark idea={idea} /></span>
          </IdeaCloud>
        ))}
      </div>
      {/* Where deleted ideas can be restored. */}
      <p className="goal-meta">
        <a href="#archive" className="goal-link">Deleted ideas (Archive)</a>
      </p>
      <button type="button" className="ideas-round ideas-add" onClick={() => setAdding(true)} aria-label="Add idea">
        ＋
      </button>
      {adding && (
        <IdeaDialog
          heading="New idea"
          saveLabel="Add"
          onSave={title => apply(addIdea(items, title))}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}

// Inside one idea: a big cloud holding its sub-ideas and notes. Two levels
// are drawn; tap any cloud to go into it and see the next levels.
function IdeaInside({ ideaId, items, apply }) {
  // Which box is open: null, 'add', 'menu', 'rename' or 'delete'.
  const [open, setOpen] = useState(null)
  const close = () => setOpen(null)

  const path = ideaPath(items, ideaId)
  const idea = path[path.length - 1]
  if (!idea) {
    return (
      <div className="app ideas">
        <p className="empty">This idea isn't here any more.</p>
        <a href="#ideas">Back to Ideas</a>
      </div>
    )
  }

  const main = path[0]
  const parent = path[path.length - 2]
  const depth = path.length - 1
  const children = childIdeas(items, idea.id)
  const inside = countInside(items, idea.id)
  const backHref = parent ? `#idea/${parent.id}` : '#ideas'

  // The "Move to…" list: every idea, in tree order, with how deep it sits.
  const insideIds = new Set(ideasInside(items, idea.id).map(i => i.id))
  const moveRows = []
  const addRows = (list, level) =>
    list.forEach(row => {
      moveRows.push({ row, depth: level })
      addRows(childIdeas(items, row.id), level + 1)
    })
  addRows(mainIdeas(items), 0)

  function moveTo(newParentId) {
    apply(moveIdea(items, idea.id, newParentId))
    close()
  }

  function remove() {
    apply(deleteIdea(items, idea.id))
    // Replace this page in the Back history, so Back never lands on the
    // deleted idea.
    window.location.replace(backHref)
  }

  return (
    <div className="app ideas">
      <div className="ideas-head">
        <a href={backHref} className="ideas-round" aria-label="Back">
          <AppIcon name="chevronLeft" size={22} />
        </a>
        <h1>{idea.title}</h1>
        <button type="button" className="ideas-round" onClick={() => setOpen('menu')} aria-label="Rename or delete">
          ···
        </button>
      </div>
      {parent && <p className="ideas-crumbs">{path.slice(0, -1).map(step => step.title).join(' › ')}</p>}

      {/* key = id, so each idea starts with its own saved text */}
      <IdeaText key={idea.id} idea={idea} onSave={how => apply(setIdeaText(items, idea.id, how))} />

      <IdeaCloud seed={idea.id} kind="big" tone={toneFor(main.color, depth, false)} tail>
        {children.length === 0 && <p className="cloud-hint">Nothing in here yet.</p>}
        <div className="cloud-kids">
          {children.map(child => {
            const grandchildren = childIdeas(items, child.id)
            if (grandchildren.length === 0) {
              return (
                <IdeaCloud key={child.id} seed={child.id} kind="leaf" tone="cream" label={`Open ${child.title}`} onOpen={() => openIdea(child.id)}>
                  <span className="cloud-title">{child.title}<NoteMark idea={child} /></span>
                </IdeaCloud>
              )
            }
            return (
              <IdeaCloud
                key={child.id}
                seed={child.id}
                kind="mid"
                tone={toneFor(main.color, depth + 1, false)}
                label={`Open ${child.title}`}
                onOpen={() => openIdea(child.id)}
              >
                <span className="cloud-title">{child.title}<NoteMark idea={child} /></span>
                <div className="cloud-kids">
                  {grandchildren.map(grandchild => {
                    const more = countInside(items, grandchild.id)
                    return (
                      <IdeaCloud
                        key={grandchild.id}
                        seed={grandchild.id}
                        kind="leaf"
                        tone={more > 0 ? toneFor(main.color, depth + 2, false) : 'cream'}
                        label={`Open ${grandchild.title}`}
                        onOpen={() => openIdea(grandchild.id)}
                      >
                        <span className="cloud-title">
                          {grandchild.title}
                          <NoteMark idea={grandchild} />
                          {more > 0 && <span className="cloud-more"> +{more}</span>}
                        </span>
                      </IdeaCloud>
                    )
                  })}
                </div>
              </IdeaCloud>
            )
          })}
        </div>
      </IdeaCloud>

      <button type="button" className="ideas-add-note" onClick={() => setOpen('add')}>
        ＋ Add note
      </button>

      {open === 'add' && (
        <IdeaDialog
          heading={`New note in “${idea.title}”`}
          saveLabel="Add"
          onSave={title => apply(addIdea(items, title, idea.id))}
          onClose={close}
        />
      )}
      {open === 'rename' && (
        <IdeaDialog
          heading="Rename"
          start={idea.title}
          saveLabel="Save"
          onSave={title => title !== idea.title && apply(renameIdea(items, idea.id, title))}
          onClose={close}
        />
      )}
      {(open === 'menu' || open === 'delete' || open === 'move') && (
        <div className="sheet-backdrop" onClick={close}>
          <div className="sheet" role="dialog" aria-label={idea.title} onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            {open === 'move' ? (
              <>
                <p className="idea-sure">Move “{idea.title}” to…</p>
                <div className="idea-move-list">
                  {parent && (
                    <button type="button" className="idea-move-row" onClick={() => moveTo(null)}>
                      ☁ Make it a main idea
                    </button>
                  )}
                  {moveRows.map(({ row, depth: level }) => {
                    // Not allowed: itself, anything inside it, or where it already is.
                    const blocked = row.id === idea.id || insideIds.has(row.id) || row.id === idea.parentId
                    return (
                      <button
                        key={row.id}
                        type="button"
                        className="idea-move-row"
                        style={{ paddingLeft: `${0.9 + level * 1.1}rem` }}
                        disabled={blocked}
                        onClick={() => moveTo(row.id)}
                      >
                        {row.title}
                        {row.id === idea.parentId && ' (now here)'}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : open === 'menu' ? (
              <>
                <button type="button" onClick={() => setOpen('rename')}>
                  ✎ Rename
                </button>
                <button type="button" onClick={() => setOpen('move')}>
                  Move to…
                </button>
                <button type="button" className="secondary idea-danger" onClick={() => setOpen('delete')}>
                  Delete
                </button>
              </>
            ) : (
              <>
                <p className="idea-sure">
                  Delete “{idea.title}”
                  {inside > 0 && ` and the ${inside} ${inside === 1 ? 'note' : 'notes'} inside it`}?
                </p>
                <button type="button" className="idea-danger-fill" onClick={remove}>
                  Yes, delete
                </button>
              </>
            )}
            <button type="button" className="secondary" onClick={close}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// The Ideas tab. Without `ideaId` it shows the overview.
function IdeasScreen({ ideaId, items, apply, onGear }) {
  if (ideaId) return <IdeaInside ideaId={ideaId} items={items} apply={apply} />
  return <IdeasOverview items={items} apply={apply} onGear={onGear} />
}

export default IdeasScreen
