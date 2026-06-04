const categoryColors = {
  Food: '#a78bfa',
  Travel: '#38bdf8',
  Shopping: '#f97316',
  Bills: '#22c55e',
}

const fallbackColors = ['#a78bfa', '#38bdf8', '#f97316', '#22c55e', '#ec4899', '#14b8a6', '#f59e0b']

export function getCategoryColor(category, index) {
  return categoryColors[category] ?? fallbackColors[index % fallbackColors.length]
}
