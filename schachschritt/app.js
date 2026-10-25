import { CARDS, CATEGORIES } from './cards.js';
import { pickCard } from './pick.js';

const STORAGE_KEY = 'schachschritt.v1';
const ALLOWED_MINUTES = [5, 15, 30];
const KEEP_RECENT = 10;
const KEEP_DONE = 200;

// Zustand: gewählte Zeit, zuletzt gezeigte Karten, aktuelle Karte, erledigte Karten.
const state = load();

function load() {
  const fallback = { minutes: 15, recent: [], current: null, done: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      minutes: ALLOWED_MINUTES.includes(saved.minutes) ? saved.minutes : 15,
      recent: Array.isArray(saved.recent) ? saved.recent : [],
      current: typeof saved.current === 'string' ? saved.current : null,
      done: Array.isArray(saved.done) ? saved.done : [],
    };
  } catch {
    return fallback;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ohne Speicher läuft die App trotzdem, nur ohne Verlauf.
  }
}

const $ = (id) => document.getElementById(id);

function showNext() {
  const card = pickCard(CARDS, CATEGORIES, { minutes: state.minutes, recent: state.recent });
  if (!card) return;
  state.current = card.id;
  state.recent = [card.id, ...state.recent.filter((id) => id !== card.id)].slice(0, KEEP_RECENT);
  save();
  $('status').textContent = '';
  render();
  $('card-title').focus({ preventScroll: true });
  $('card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function markDone() {
  if (!state.current) return;
  state.done = [{ id: state.current, at: new Date().toISOString() }, ...state.done].slice(0, KEEP_DONE);
  state.current = null;
  save();
  render();
  $('status').textContent = 'Gespeichert. Gut gemacht.';
}

function render() {
  for (const input of document.querySelectorAll('input[name="minutes"]')) {
    input.checked = Number(input.value) === state.minutes;
  }

  const card = CARDS.find((c) => c.id === state.current && c.minutes === state.minutes);
  $('card').hidden = !card;
  $('actions').hidden = !card;
  if (!card) return;

  $('card-category').textContent = CATEGORIES[card.category].label;
  $('card-minutes').textContent = `${card.minutes} Minuten`;
  $('card-title').textContent = card.title;
  $('card-why').textContent = card.why;
  $('card-steps').replaceChildren(...card.steps.map((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }));
  $('card-done').textContent = card.done;

  const link = $('card-link');
  link.hidden = !card.link;
  if (card.link) {
    link.firstElementChild.href = card.link.url;
    link.firstElementChild.textContent = card.link.label;
  }
}

for (const input of document.querySelectorAll('input[name="minutes"]')) {
  input.addEventListener('change', () => {
    state.minutes = Number(input.value);
    state.current = null;
    save();
    $('status').textContent = '';
    render();
  });
}
$('draw').addEventListener('click', showNext);
$('other').addEventListener('click', showNext);
$('done').addEventListener('click', markDone);

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
