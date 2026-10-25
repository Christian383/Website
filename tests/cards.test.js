import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CATEGORIES } from '../schachschritt/cards.js';

test('mindestens 30 Karten mit eindeutigen IDs', () => {
  assert.ok(CARDS.length >= 30);
  assert.equal(new Set(CARDS.map((c) => c.id)).size, CARDS.length);
});

test('jede Karte ist vollständig', () => {
  for (const c of CARDS) {
    assert.ok([5, 15, 30].includes(c.minutes), c.id);
    assert.ok(CATEGORIES[c.category], c.id);
    assert.ok(c.title && c.why && c.done, c.id);
    assert.ok(c.steps.length >= 3 && c.steps.length <= 5, c.id);
  }
});

test('jedes Zeitbudget hat Karten aus allen Kategorien', () => {
  for (const m of [5, 15, 30]) {
    const cats = new Set(CARDS.filter((c) => c.minutes === m).map((c) => c.category));
    assert.deepEqual([...cats].sort(), Object.keys(CATEGORIES).sort(), `${m} Minuten`);
  }
});
