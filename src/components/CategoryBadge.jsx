import { CATEGORY_COLORS, categoryColor } from '../data/theme'
export default function CategoryBadge({ category }) {
  const color = categoryColor(category)
  return <span className="category-badge" style={{ '--category-color': color }}><i aria-hidden="true"/>{category}</span>
}
