import { categoryTree } from './categoryActions.js'

// A dropdown of categories: main ones, with their sub-categories indented.
// '' means "no category".
function CategorySelect({ items, value, onChange, label = 'Category' }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value || null)} aria-label={label}>
      <option value="">No category</option>
      {categoryTree(items).map(({ category, depth }) => (
        <option key={category.id} value={category.id}>
          {depth === 1 ? `  └ ${category.name}` : category.name}
        </option>
      ))}
    </select>
  )
}

export default CategorySelect
