// Zufallsauswahl einer Trainingskarte.
// Regeln: nach Zeit filtern, letzte 5 Karten meiden, nicht dieselbe Kategorie
// direkt hintereinander, Kategorie nach Gewicht ziehen, Karte gleichverteilt.
// Reichen die Karten nicht, werden die Regeln schrittweise gelockert.

export const AVOID_LAST = 5;

export function pickCard(cards, categories, { minutes, recent = [] }, rand = Math.random) {
  const pool = cards.filter((c) => c.minutes === minutes);
  if (pool.length === 0) return null;

  const lastCategory = cards.find((c) => c.id === recent[0])?.category;
  const blocked = new Set(recent.slice(0, AVOID_LAST));

  const rules = [
    (c) => !blocked.has(c.id) && c.category !== lastCategory,
    (c) => !blocked.has(c.id),
    (c) => c.id !== recent[0] && c.category !== lastCategory,
    (c) => c.id !== recent[0],
    () => true,
  ];

  for (const rule of rules) {
    const candidates = pool.filter(rule);
    if (candidates.length > 0) return weightedPick(candidates, categories, rand);
  }
  return null;
}

function weightedPick(candidates, categories, rand) {
  const byCategory = new Map();
  for (const c of candidates) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  }

  const entries = [...byCategory.entries()];
  const total = entries.reduce((sum, [cat]) => sum + (categories[cat]?.weight ?? 1), 0);
  let r = rand() * total;
  let group = entries[entries.length - 1][1];
  for (const [cat, cards] of entries) {
    r -= categories[cat]?.weight ?? 1;
    if (r < 0) { group = cards; break; }
  }
  return group[Math.floor(rand() * group.length)];
}
