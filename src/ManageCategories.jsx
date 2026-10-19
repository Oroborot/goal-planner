import { useState } from 'react'
import {
  activeCategories,
  addCategory,
  addStarterCategories,
  categoryTree,
  deleteCategory,
  renameCategory,
} from './categoryActions.js'

// The folded "Manage categories" section on the Notes screen:
// add main or sub categories, rename them, delete them.
function ManageCategories({ items, apply }) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [newName, setNewName] = useState('')

  const tree = categoryTree(items)
  const mains = activeCategories(items).filter(c => !c.parentId)

  function add(e) {
    e.preventDefault()
    if (!name.trim()) return
    apply(addCategory(items, name.trim(), parentId || null))
    setName('')
  }

  function saveRename(e, id) {
    e.preventDefault()
    if (newName.trim()) apply(renameCategory(items, id, newName.trim()))
    setRenamingId(null)
  }

  return (
    <details className="deleted-goals manage-categories">
      <summary>Manage categories ({tree.length})</summary>

      {tree.length === 0 && (
        <button type="button" className="secondary full" onClick={() => apply(addStarterCategories(items))}>
          Add starter categories: Ideas, Thoughts, Reminders
        </button>
      )}

      <ul>
        {tree.map(({ category, depth }) => (
          <li key={category.id} className={depth === 1 ? 'sub-category' : ''}>
            {renamingId === category.id ? (
              <form className="row rename-row" onSubmit={e => saveRename(e, category.id)}>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  aria-label={`New name for ${category.name}`}
                  autoFocus
                />
                <button type="submit">Save</button>
              </form>
            ) : (
              <>
                <span className="goal-text goal-title">
                  {depth === 1 ? '└ ' : ''}
                  {category.name}
                </span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    setRenamingId(category.id)
                    setNewName(category.name)
                  }}
                  aria-label={`Rename ${category.name}`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => apply(deleteCategory(items, category.id))}
                  aria-label={`Delete ${category.name}`}
                >
                  ✕
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <form className="goal-form" onSubmit={add}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New category name"
          aria-label="New category name"
        />
        <div className="row">
          <select value={parentId} onChange={e => setParentId(e.target.value)} aria-label="Put it under">
            <option value="">Main category</option>
            {mains.map(m => (
              <option key={m.id} value={m.id}>
                Under {m.name}
              </option>
            ))}
          </select>
          <button type="submit">Add</button>
        </div>
      </form>
    </details>
  )
}

export default ManageCategories
