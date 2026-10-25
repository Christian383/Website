import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CATEGORIES } from '../schachschritt/cards.js';
import { pickCard, AVOID_LAST } from '../schachschritt/pick.js';

function simulate(minutes, rounds) {
  const recent = [];
  const shown = [];
  for (let i = 0; i < rounds; i++) {
    const card = pickCard(CARDS, CATEGORIES, { minutes, recent });
    shown.push(card);
    recent.unshift(card.id);
    recent.length = Math.min(recent.length, 10);
  }
  return shown;
}

for (const minutes of [5, 15, 30]) {
  test(`${minutes} Minuten: nur passende Karten, keine Wiederholung der letzten ${AVOID_LAST}, kein Kategoriedoppel`, () => {
    const shown = simulate(minutes, 5000);
    shown.forEach((card, i) => {
      assert.equal(card.minutes, minutes);
      if (i === 0) return;
      assert.notEqual(card.category, shown[i - 1].category, `Kategorie doppelt bei ${i}`);
      const last = shown.slice(Math.max(0, i - AVOID_LAST), i).map((c) => c.id);
      assert.ok(!last.includes(card.id), `Wiederholung bei ${i}`);
    });
  });
}

test('Kategorien kommen ungefähr nach Gewicht vor', () => {
  const shown = [5, 15, 30].flatMap((m) => simulate(m, 20000));
  const total = Object.values(CATEGORIES).reduce((s, c) => s + c.weight, 0);
  const share = {};
  for (const c of shown) share[c.category] = (share[c.category] ?? 0) + 1 / shown.length;
  for (const [cat, { weight }] of Object.entries(CATEGORIES)) {
    const expected = weight / total;
    console.log(cat, (share[cat] * 100).toFixed(1), '% Ziel', (expected * 100).toFixed(0), '%');
    // Das Kategorieverbot verschiebt die Anteile etwas, daher großzügige Toleranz.
    assert.ok(Math.abs(share[cat] - expected) < 0.06, cat);
  }
});

test('lockert die Regeln, wenn zu wenige Karten da sind', () => {
  const few = CARDS.filter((c) => c.minutes === 5).slice(0, 2);
  const card = pickCard(few, CATEGORIES, { minutes: 5, recent: [few[0].id, few[1].id] });
  assert.equal(card.id, few[1].id);
  assert.equal(pickCard(few, CATEGORIES, { minutes: 15, recent: [] }), null);
});
