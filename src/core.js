'use strict';
// Core: seeded randomness, question registry, set building.
const PP = (typeof window !== 'undefined' ? window : globalThis).PP = { chapters: [], byId: {}, tests: [], testById: {} };

PP.groups = [
  { id: 'verbal', name: 'Words', blurb: 'Analogies, sentences, word groups, codes' },
  { id: 'quant', name: 'Numbers', blurb: 'Series, number puzzles, word problems, contest math' },
  { id: 'figural', name: 'Shapes & Patterns', blurb: 'Matrices, series, classification, paper folding' },
  { id: 'spatial', name: 'Space & Logic', blurb: 'Rotation, cubes, nets, directions, logic' },
];

PP.hash = function (str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
};

PP.rng = function (seed) {
  let a = seed >>> 0;
  const r = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.shuffle = (arr) => {
    const a2 = arr.slice();
    for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; }
    return a2;
  };
  r.sample = (arr, n) => r.shuffle(arr).slice(0, n);
  r.chance = (p) => r() < p;
  r.sign = () => (r() < 0.5 ? -1 : 1);
  return r;
};

// ---------- small helpers ----------
PP.esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
PP.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
PP.lcm = (a, b) => (a / PP.gcd(a, b)) * b;
PP.isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
PP.range = (n) => Array.from({ length: n }, (_, i) => i);
PP.sum = (a) => a.reduce((x, y) => x + y, 0);
PP.fmt = (n) => {
  if (typeof n !== 'number') return String(n);
  const s = Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
  return s.replace(/^-/, '−').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
PP.money = (c) => '$' + (c / 100).toFixed(2);
PP.frac = (n, d) => {
  if (d < 0) { n = -n; d = -d; }
  const g = PP.gcd(n, d) || 1; n /= g; d /= g;
  if (d === 1) return PP.fmt(n);
  return `<span class="fr"><sup>${n}</sup>&frasl;<sub>${d}</sub></span>`;
};
PP.fracKey = (n, d) => { const g = PP.gcd(n, d) || 1; return (n / g) + '/' + (d / g); };
PP.mixed = (n, d) => {
  const g = PP.gcd(n, d); n /= g; d /= g;
  if (n < d || d === 1) return PP.frac(n, d);
  const w = Math.floor(n / d), rem = n % d;
  return rem ? `${w} ${PP.frac(rem, d)}` : String(w);
};
PP.ord = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
PP.words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
PP.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
PP.plural = (n, w, pl) => n === 1 ? `1 ${w}` : `${PP.fmt(n)} ${pl || w + 's'}`;

PP.NAMES = ['Aarav', 'Maya', 'Liam', 'Zara', 'Noah', 'Priya', 'Leo', 'Ava', 'Ethan', 'Mia', 'Omar', 'Sofia', 'Kai', 'Nina', 'Ravi', 'Emma', 'Jin', 'Lucas', 'Anya', 'Sam', 'Diego', 'Hana', 'Owen', 'Ira', 'Theo', 'Lila', 'Arjun', 'Chloe', 'Felix', 'Rosa'];
PP.names = (r, n) => r.sample(PP.NAMES, n);

// ---------- multiple choice builder ----------
// correct: {h: html, k?: key}; wrongs: [{h, k?, why?}] in priority order.
PP.mc = function (r, correct, wrongs, n) {
  n = n || 5;
  const key = (o) => (o.k !== undefined ? String(o.k) : o.h);
  const seen = new Set([key(correct)]), seenH = new Set([correct.h]);
  const picked = [];
  for (const w of wrongs) {
    if (picked.length >= n - 1) break;
    if (w == null) continue;
    const k = key(w);
    if (seen.has(k) || seenH.has(w.h)) continue;
    seen.add(k); seenH.add(w.h); picked.push(w);
  }
  if (picked.length < n - 1) throw new Error('not enough distractors');
  const all = r.shuffle([Object.assign({}, correct, { ok: true }), ...picked]);
  return { opts: all.map((o) => o.h), ans: all.findIndex((o) => o.ok), why: all.map((o) => o.why || '') };
};

// numeric option helper: values with optional why; keys by value
PP.num = (v, why, fmt) => ({ h: (fmt || PP.fmt)(v), k: 'n' + v, why });
PP.nearMiss = (ans, step) => {
  step = step || 1;
  return [ans + step, ans - step, ans + 2 * step, ans - 2 * step, ans + 3 * step, ans + 10, ans - 10]
    .filter((v) => v >= 0 && v !== ans)
    .map((v) => PP.num(v, 'Close, but not quite. Check the working shown below step by step.'));
};

// ---------- registry ----------
PP.addChapter = function (c) {
  c.nOpts = c.nOpts || 5;
  if (c.bank) {
    c.order = PP.range(c.bank.length).sort((a, b) => (c.bank[a].d - c.bank[b].d) || (PP.hash(c.id + a) - PP.hash(c.id + b)));
  }
  PP.chapters.push(c); PP.byId[c.id] = c;
};

PP.make = function (chId, seed, lvl) {
  const ch = PP.byId[chId];
  if (!ch) throw new Error('unknown chapter ' + chId);
  let q = null, err = null;
  if (ch.bank) {
    const item = ch.bank[seed % ch.bank.length];
    q = ch.fromBank(item, PP.rng(PP.hash(chId + '#' + seed)), seed);
    lvl = item.d;
  } else {
    for (let a = 0; a < 60 && !q; a++) {
      try { q = ch.gen(PP.rng(PP.hash(chId + ':' + seed + ':' + a)), lvl); } catch (e) { err = e; }
    }
  }
  if (!q) throw err || new Error('generation failed ' + chId);
  q.ch = chId; q.seed = seed; q.lvl = lvl; q.id = chId + '~' + seed + '~' + lvl;
  return q;
};

PP.LEVELS = { 1: 'Warm-up', 2: 'Challenge', 3: 'Expert' };
PP.setLevel = (i) => (i < 3 ? 1 : i < 7 ? 2 : 3);
PP.setCount = (ch) => (ch.bank ? Math.ceil(ch.bank.length / 10) : 10);
PP.setLevelOf = (ch, i) => {
  if (!ch.bank) return PP.setLevel(i);
  const items = ch.order.slice(i * 10, i * 10 + 10).map((k) => ch.bank[k].d);
  return Math.round(PP.sum(items) / items.length);
};
PP._setCache = {};
PP.setRefs = function (ch, i) {
  const ck = ch.id + '/' + i;
  if (PP._setCache[ck]) return PP._setCache[ck];
  let refs;
  if (ch.bank) {
    refs = ch.order.slice(i * 10, i * 10 + 10).map((idx) => ({ ch: ch.id, seed: idx, lvl: ch.bank[idx].d }));
  } else {
    refs = []; const seen = new Set(); let k = 0;
    const lvl = PP.setLevel(i);
    while (refs.length < 10 && k < 80) {
      const seed = PP.hash(ch.id + '/set' + i + '/' + k++) % 1000000000;
      const q = PP.make(ch.id, seed, lvl);
      const key = q.prompt + q.stem + q.opts.join('');
      if (seen.has(key)) continue;
      seen.add(key); refs.push({ ch: ch.id, seed, lvl });
    }
  }
  return (PP._setCache[ck] = refs);
};

// pick n refs from a chapter for a test/daily, deterministic by key, ramping difficulty
PP.pickRefs = function (chId, n, key, levels) {
  const ch = PP.byId[chId];
  const refs = [];
  const r = PP.rng(PP.hash(key));
  if (ch.bank) {
    const used = new Set();
    for (let j = 0; j < n; j++) {
      const want = levels ? levels(j, n) : 2;
      let pool = ch.order.filter((k) => !used.has(k) && ch.bank[k].d === want);
      if (!pool.length) pool = ch.order.filter((k) => !used.has(k));
      if (!pool.length) break;
      const idx = r.pick(pool); used.add(idx);
      refs.push({ ch: chId, seed: idx, lvl: ch.bank[idx].d });
    }
  } else {
    const seen = new Set();
    for (let j = 0, k = 0; refs.length < n && k < n * 6; k++) {
      const lvl = levels ? levels(j, n) : 2;
      const seed = PP.hash(key + '/' + k) % 1000000000;
      const q = PP.make(chId, seed, lvl);
      const sk = q.prompt + q.stem + q.opts.join('');
      if (seen.has(sk)) continue;
      seen.add(sk); refs.push({ ch: chId, seed, lvl }); j++;
    }
  }
  return refs;
};
PP.ramp = (j, n) => (j < n * 0.3 ? 1 : j < n * 0.7 ? 2 : 3);
PP.rampHard = (j, n) => (j < n * 0.2 ? 1 : j < n * 0.55 ? 2 : 3);

// Parses compact bank lines: "a | b | c | ..." -> arrays
PP.lines = (txt) => txt.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
