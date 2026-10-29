// Single source of truth for categories, badges, legends, and charts.
export const CATEGORY_COLORS = {
  'Food & Drinks': '#f4a340',
  Transportation: '#428ce8',
  Shopping: '#8666ed',
  'Bills & Utilities': '#ed6d69',
  Entertainment: '#e87db3',
  Health: '#31ad9d',
  Education: '#d6af39',
  Groceries: '#26aa7f',
  'Rent & Housing': '#667de8',
  Subscriptions: '#c97d43',
  Insurance: '#c65f95',
  'Personal Care': '#9d6add',
  Others: '#8a99a7',
}
export const CATEGORY_ICONS = {
  'Food & Drinks': 'utensils', Transportation: 'car-front', Shopping: 'shopping-bag',
  'Bills & Utilities': 'receipt-text', Entertainment: 'clapperboard', Health: 'heart-pulse',
  Education: 'graduation-cap', Groceries: 'shopping-basket', 'Rent & Housing': 'house', Subscriptions: 'repeat', Insurance: 'shield', 'Personal Care': 'heart', Others: 'wallet',
}

// Custom expense categories receive a stable accessible accent instead of generic grey.
const customPalette = ['#428ce8', '#8666ed', '#e87db3', '#31ad9d', '#e49a3d', '#667de8', '#d36864']
export function categoryColor(name) {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name]
  const label = String(name || 'Others')
  let hash = 0
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return customPalette[hash % customPalette.length]
}
