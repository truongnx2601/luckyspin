export function weightedRandom<T extends { weight: number }>(items: T[]): T {
  if (!items.length) {
    throw new Error('weightedRandom: empty items')
  }

  const total = items.reduce((sum, i) => sum + i.weight, 0)

  if (total <= 0) {
    throw new Error('weightedRandom: total weight must be > 0')
  }

  let rand = Math.random() * total

  for (const item of items) {
    if (rand < item.weight) return item
    rand -= item.weight
  }

  return items[items.length - 1]
}
