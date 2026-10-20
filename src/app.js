'use strict';
// UI: home, chapters, practice quizzes, timed tests, results, progress report, trophies.
(function () {
  const app = document.getElementById('app');
  const esc = PP.esc;
  const KEY = 'puzzle-peak-v1';
  const dstr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => dstr(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); };
  const GCOL = { verbal: 'var(--verbal)', quant: 'var(--quant)', figural: 'var(--figural)', spatial: 'var(--spatial)' };
  const LET = 'ABCDE';
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

  // ================= saved progress =================
  const blank = () => ({ v: 1, name: '', sound: true, xp: 0, correct: 0, answered: 0, bestStreak: 0, timeMs: 0, sets: {}, stats: {}, tests: [], mistakes: {}, fixed: {}, fixedCount: 0, badges: {}, daily: {}, last: '', parent: { pin: '', lock: false } });
  let S = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* storage unavailable */ }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ }
    Sync.push();
  }
  function merge(a, b) {
    const o = Object.assign(blank(), b, a);
    ['xp', 'correct', 'answered', 'bestStreak', 'fixedCount', 'timeMs'].forEach((k) => { o[k] = Math.max(a[k] || 0, b[k] || 0); });
    o.name = a.name || b.name || '';
    o.sets = Object.assign({}, b.sets, a.sets);
    for (const k in b.sets || {}) { const x = (a.sets || {})[k], y = b.sets[k]; if (x && y) o.sets[k] = { best: Math.max(x.best, y.best), stars: Math.max(x.stars, y.stars), n: Math.max(x.n, y.n) }; }
    o.stats = Object.assign({}, b.stats);
    for (const k in a.stats || {}) { const x = a.stats[k], y = o.stats[k]; o.stats[k] = y ? x.map((v, i) => Math.max(v, y[i] || 0)) : x; }
    const seen = new Set();
    o.tests = [...(a.tests || []), ...(b.tests || [])].filter((t) => { const k = t.id + t.form + t.date; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => y.date - x.date).slice(0, 60);
    o.fixed = Object.assign({}, b.fixed, a.fixed);
    o.mistakes = Object.assign({}, b.mistakes, a.mistakes);
    for (const k in o.mistakes) if (o.fixed[k] && o.fixed[k] >= o.mistakes[k].t) delete o.mistakes[k];
    o.badges = Object.assign({}, b.badges, a.badges);
    o.daily = Object.assign({}, b.daily, a.daily);
    o.parent = a.parent && a.parent.pin ? a.parent : b.parent || a.parent || { pin: '', lock: false };
    return o;
  }
  // Optional cross-device sync when the page runs inside a signed-in claude.ai viewer.
  const Sync = {
    on: false, busy: false, dirty: false, ref: null, t: null,
    async init() {
      try {
        if (!window.claude || !window.claude.use) return;
        const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
        if (!db || !user) return;
        const uid = await user.id();
        if (!uid) return;
        this.ref = db.doc('data/users/' + uid + '/progress');
        const snap = await this.ref.get();
        if (snap.exists && snap.data().s) { S = merge(S, JSON.parse(snap.data().s)); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
        this.on = true;
        this.dirty = true; this.flush();
        if (!Q && !T) render();
      } catch (e) { this.on = false; }
    },
    push() { if (!this.on) return; this.dirty = true; clearTimeout(this.t); this.t = setTimeout(() => this.flush(), 1500); },
    async flush() {
      if (this.busy || !this.dirty || !this.ref) return;
      this.busy = true; this.dirty = false;
      try { await this.ref.set({ s: JSON.stringify(S), at: Date.now() }); } catch (e) { if (e && e.code === 'invalid_argument') this.on = false; }
      this.busy = false;
      if (this.dirty) this.flush();
    },
  };

  // ================= levels, stars, badges =================
  const lvlOf = (xp) => { let L = 1; while (xp >= 50 * L * (L + 1)) L++; return L; };
  const lvlStart = (L) => 50 * (L - 1) * L;
  const TITLES = ['Explorer', 'Explorer', 'Puzzler', 'Puzzler', 'Thinker', 'Thinker', 'Sharp Mind', 'Sharp Mind', 'Mastermind', 'Mastermind', 'Genius'];
  const title = (L) => TITLES[Math.min(L - 1, TITLES.length - 1)] + (L > TITLES.length ? ' ' + (L - TITLES.length + 1) : '');
  const starsFor = (c, n) => { const p = c / n; return p >= 0.9 ? 3 : p >= 0.7 ? 2 : p >= 0.5 ? 1 : 0; };
  const chStars = (ch) => { let s = 0; for (let i = 0; i < PP.setCount(ch); i++) s += (S.sets[ch.id + '.' + i] || {}).stars || 0; return s; };
  const chDone = (ch) => { let s = 0; for (let i = 0; i < PP.setCount(ch); i++) if (S.sets[ch.id + '.' + i]) s++; return s; };
  const mixDone = () => PP.range(PP.MIX_SETS).filter((i) => S.sets['mix.' + i]).length;
  const mixStars = () => PP.range(PP.MIX_SETS).reduce((s, i) => s + ((S.sets['mix.' + i] || {}).stars || 0), 0);
  const nextMix = () => { const i = PP.range(PP.MIX_SETS).find((k) => !S.sets['mix.' + k]); return i === undefined ? PP.range(PP.MIX_SETS).sort((a, b) => S.sets['mix.' + a].stars - S.sets['mix.' + b].stars)[0] : i; };
  const locked = () => !!(S.parent && S.parent.lock);
  const grpStars = (g) => PP.chapters.filter((c) => c.group === g).reduce((s, c) => s + chStars(c), 0);
  const dailyStreak = () => { let n = 0; const d = new Date(); if (!S.daily[today()]) d.setDate(d.getDate() - 1); while (S.daily[dstr(d)] !== undefined) { n++; d.setDate(d.getDate() - 1); } return n; };

  const BADGES = [
    ['first-set', 'First Climb', 'Finish your first practice set', '1', () => Object.keys(S.sets).length >= 1],
    ['three-star', 'Perfect Peak', 'Get 3 stars on a set', '★', () => Object.values(S.sets).some((x) => x.stars >= 3)],
    ['expert', 'Expert Climber', 'Get 3 stars on an Expert set', '◆', (ev) => ev.expert3],
    ['streak-5', 'On Fire', '5 correct in a row', '5', () => S.bestStreak >= 5],
    ['streak-10', 'Unstoppable', '10 correct in a row', '10', () => S.bestStreak >= 10],
    ['streak-20', 'Legend', '20 correct in a row', '20', () => S.bestStreak >= 20],
    ['c100', 'Century', '100 correct answers', '100', () => S.correct >= 100],
    ['c500', 'High Five Hundred', '500 correct answers', '500', () => S.correct >= 500],
    ['c1000', 'Thousand Club', '1,000 correct answers', '1K', () => S.correct >= 1000],
    ['g-verbal', 'Word Wizard', '15 stars in Words', 'Aa', () => grpStars('verbal') >= 15],
    ['g-quant', 'Number Ninja', '15 stars in Numbers', '123', () => grpStars('quant') >= 15],
    ['g-figural', 'Shape Shifter', '15 stars in Shapes & Patterns', '▲', () => grpStars('figural') >= 15],
    ['g-spatial', 'Space Explorer', '15 stars in Space & Logic', '⬢', () => grpStars('spatial') >= 15],
    ['all-rounder', 'All-Rounder', 'Finish a set in every chapter', '∞', () => PP.chapters.every((c) => chDone(c) > 0)],
    ['test-1', 'Test Taker', 'Finish a practice test', '✓', () => S.tests.length > 0],
    ['test-ace', 'Test Ace', 'Score 90% or more on a test', 'A+', () => S.tests.some((t) => t.pct >= 90)],
    ['marathon', 'Marathon', 'Finish a full-length test', '⏱', () => S.tests.some((t) => PP.testById[t.id] && PP.testById[t.id].full)],
    ['fixer', 'Fixer', 'Fix 10 old mistakes', '⚒', () => S.fixedCount >= 10],
    ['daily-3', 'Three in a Row', 'Do the Daily 10 three days in a row', '3', () => dailyStreak() >= 3],
    ['daily-7', 'Week Warrior', 'Do the Daily 10 seven days in a row', '7', () => dailyStreak() >= 7],
    ['speedy', 'Quick Thinker', '9+ on a set, under 30 s per question', '⚡', (ev) => ev.speedy],
    ['mix-10', 'Trail Blazer', 'Finish 10 Mixed Climb sets', 'M10', () => mixDone() >= 10],
    ['mix-all', 'Summit', 'Finish all 40 Mixed Climb sets', 'TOP', () => mixDone() >= PP.MIX_SETS],
  ];
  const medal = (glyph, on) => `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M20 2 L28 24 M40 2 L32 24" stroke="${on ? 'var(--verbal)' : 'var(--line)'}" stroke-width="7" stroke-linecap="round"/><circle cx="30" cy="38" r="19" fill="${on ? 'var(--sun)' : 'var(--soft)'}" stroke="${on ? 'var(--sun-ink)' : 'var(--line)'}" stroke-width="2"/><text x="30" y="${glyph.length > 2 ? 43 : 45}" text-anchor="middle" font-family="Fredoka, system-ui, sans-serif" font-weight="700" font-size="${glyph.length > 2 ? 13 : 18}" fill="${on ? 'var(--sun-ink)' : 'var(--muted)'}">${glyph}</text></svg>`;
  function checkBadges(ev) {
    ev = ev || {};
    const got = [];
    for (const [id, name, , glyph, test] of BADGES) if (!S.badges[id] && test(ev)) { S.badges[id] = Date.now(); got.push([name, glyph]); }
    if (got.length) { save(); got.forEach(([n, g], i) => setTimeout(() => { toast(`${medal(g, true)}<div><b>New badge!</b><br>${esc(n)}</div>`); sfx.badge(); }, 700 + i * 2200)); }
  }

  // ================= sound & effects =================
  const sfx = {
    ctx: null,
    tone(f, t0, d, type, vol) {
      if (!S.sound) return;
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        const c = this.ctx, o = c.createOscillator(), g = c.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, c.currentTime + t0);
        g.gain.exponentialRampToValueAtTime(vol || 0.12, c.currentTime + t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + d);
        o.connect(g).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + d + 0.05);
      } catch (e) { /* audio unavailable */ }
    },
    ok() { this.tone(880, 0, 0.12); this.tone(1320, 0.08, 0.18); },
    no() { this.tone(220, 0, 0.22, 'triangle', 0.1); },
    win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.11, 0.25, 'triangle', 0.1)); },
    badge() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, i * 0.07, 0.2, 'sine', 0.08)); },
  };
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function confetti(power) {
    if (reduced()) return;
    let cv = document.getElementById('confetti');
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'confetti'; document.body.appendChild(cv); }
    const ctx = cv.getContext('2d'), W = (cv.width = innerWidth), H = (cv.height = innerHeight);
    const cols = ['#f5b400', '#e0613f', '#138e96', '#3f6be0', '#6a9a1f', '#ff8fb1'];
    const ps = PP.range(Math.round(120 * (power || 1))).map(() => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)] }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => { p.vy += 0.38; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (t - t0 < 2800) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  }
  function toast(html) {
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.innerHTML = html;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3400);
  }
  function floatXP(n, el) {
    if (!el) return;
    const r = el.getBoundingClientRect(); const f = document.createElement('div');
    f.className = 'xpfloat'; f.textContent = `+${n} XP`; f.style.left = r.left + r.width / 2 - 30 + 'px'; f.style.top = r.top - 10 + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1000);
  }

  // ================= icons =================
  const I = {
    back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 6H3a3 3 0 003 4M17 6h4a3 3 0 01-3 4"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    star: (on) => `<svg viewBox="0 0 24 24" class="${on ? 's-on' : ''}"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z" fill="${on ? 'var(--sun)' : 'var(--soft)'}" stroke="${on ? 'var(--sun-ink)' : 'var(--line)'}" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  };
  const owl = (mood) => `<svg viewBox="0 0 120 120" class="owl" aria-hidden="true">
    <path d="M30 34 L36 10 L54 28 Z M90 34 L84 10 L66 28 Z" fill="var(--owl)"/>
    <ellipse cx="60" cy="68" rx="40" ry="44" fill="var(--owl)"/>
    <ellipse cx="60" cy="82" rx="25" ry="26" fill="var(--owl-belly)"/>
    <path d="M50 78 q5 4 10 0 q5 4 10 0 M46 90 q7 5 14 0 q7 5 14 0" fill="none" stroke="var(--owl)" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
    <circle cx="44" cy="52" r="15" fill="#fff"/><circle cx="76" cy="52" r="15" fill="#fff"/>
    ${mood === 'happy' ? '<path d="M36 55 q8 -9 16 0 M68 55 q8 -9 16 0" fill="none" stroke="#1b2440" stroke-width="4" stroke-linecap="round"/>' : `<g class="pupils"><circle cx="${mood === 'think' ? 48 : 46}" cy="${mood === 'think' ? 49 : 54}" r="7" fill="#1b2440"/><circle cx="${mood === 'think' ? 80 : 74}" cy="${mood === 'think' ? 49 : 54}" r="7" fill="#1b2440"/><circle cx="48" cy="51" r="2" fill="#fff"/><circle cx="76" cy="51" r="2" fill="#fff"/></g>`}
    <path d="M54 64 L66 64 L60 74 Z" fill="var(--sun)"/>
    <path d="M44 110 l4 -6 l4 6 M68 110 l4 -6 l4 6" stroke="var(--sun)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  const starsTxt = (n, of) => `<span class="stars" aria-label="${n} of ${of || 3} stars">${'★'.repeat(n)}<span class="off">${'★'.repeat((of || 3) - n)}</span></span>`;

  // ================= routing =================
  let view = { name: 'home' };
  let Q = null; // practice session
  let T = null; // test session
  let token = '';
  function go(tk) {
    token = tk;
    try { if (location.hash.slice(1) !== tk) history.pushState(null, '', '#' + tk); } catch (e) { /* sandboxed frame */ }
    route(tk);
  }
  function route(tk) {
    tk = tk || 'home'; token = tk;
    const m = tk.match(/^([a-z-]+)\.(\d+)$/);
    const single = PP.byId[tk] || (m && PP.byId[m[1]]) || (tk.startsWith('test-') && PP.testById[tk.slice(5)] && !PP.testById[tk.slice(5)].mixed);
    if (locked() && single) view = { name: 'locked' };
    else if (tk === 'home') view = { name: 'home' };
    else if (tk === 'mix') view = { name: 'mix' };
    else if (m && m[1] === 'mix' && +m[2] >= 1 && +m[2] <= PP.MIX_SETS) { if (!(Q && Q.token === tk && view.name === 'quiz')) startMix(+m[2] - 1); }
    else if (tk === 'smart') startSmart();
    else if (PP.byId[tk]) view = { name: 'chapter', ch: tk, lvl: 2 };
    else if (m && PP.byId[m[1]] && +m[2] >= 1 && +m[2] <= PP.setCount(PP.byId[m[1]])) { if (!(Q && Q.token === tk && view.name === 'quiz')) startSet(m[1], +m[2] - 1); }
    else if (tk.startsWith('test-') && PP.testById[tk.slice(5)]) { if (!(T && view.name === 'test')) view = { name: 'testIntro', t: tk.slice(5), form: 0 }; }
    else if (tk === 'daily') startDaily();
    else if (['mistakes', 'progress', 'trophies', 'profile', 'about'].includes(tk)) view = { name: tk };
    else view = { name: 'home' };
    render(); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== token) route(h); });

  // ================= practice sessions =================
  function startSession(o) { Q = Object.assign({ i: 0, answers: [], qs: [], streak: 0, best: 0, xp: 0, start: Date.now(), qStart: Date.now() }, o); view = { name: 'quiz' }; }
  function startSet(chId, i) { const ch = PP.byId[chId]; startSession({ kind: 'set', ch: chId, set: i, refs: PP.setRefs(ch, i).slice(), title: `${ch.name} · Set ${i + 1}`, token: chId + '.' + (i + 1) }); }
  function startEndless(chId, lvl) { const ch = PP.byId[chId]; startSession({ kind: 'endless', ch: chId, lvl, refs: [], title: `${ch.name} · Endless (${PP.LEVELS[lvl]})`, token: chId }); }
  function startDaily() { startSession({ kind: 'daily', refs: PP.dailyRefs(today()), title: `Daily 10 · ${new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`, token: 'daily' }); }
  function startMix(i) { startSession({ kind: 'mix', set: i, refs: PP.mixRefs(i).slice(), title: `Mixed Climb · Set ${i + 1}`, token: 'mix.' + (i + 1) }); }
  // weak or barely-tried chapters come up more often; each chapter's level follows his accuracy there
  function startSmart() {
    const w = (id) => { const st = S.stats[id]; return !st || st[1] < 6 ? 3 : 1 + 4 * (1 - st[0] / st[1]); };
    const pick = (chs, k, r) => { const pool = chs.slice(), out = []; while (out.length < k && pool.length) { let x = r() * PP.sum(pool.map(w)), i = 0; for (; i < pool.length - 1; i++) { x -= w(pool[i]); if (x <= 0) break; } out.push(pool.splice(i, 1)[0]); } return out; };
    const lv = (slot, id) => { const st = S.stats[id]; if (!st || st[1] < 8) return 2; const a = st[0] / st[1]; return a >= 0.85 ? 3 : a >= 0.6 ? 2 : 1; };
    const seed = Math.floor(Math.random() * 1e9);
    startSession({ kind: 'smart', refs: PP.balanced(PP.rng(seed), 12, pick, lv, 'smart/' + seed), title: 'Smart Mix', token: 'smart' });
  }
  function startMistakes() { const refs = Object.values(S.mistakes).sort((a, b) => a.t - b.t).slice(0, 10).map((m) => ({ ch: m.ch, seed: m.seed, lvl: m.lvl })); if (!refs.length) return; startSession({ kind: 'mistakes', refs, title: 'Fix my mistakes', token: 'mistakes' }); }
  function nextEndlessRef() {
    const ch = PP.byId[Q.ch];
    if (ch.bank) { const pool = ch.order.filter((k) => Q.lvl === 0 || ch.bank[k].d === Q.lvl); return { ch: ch.id, seed: pool[Math.floor(Math.random() * pool.length)], lvl: 0 }; }
    return { ch: ch.id, seed: Math.floor(Math.random() * 1e9), lvl: Q.lvl };
  }
  function qAt(sess, i) {
    if (!sess.qs[i]) {
      if (!sess.refs[i]) sess.refs[i] = nextEndlessRef();
      const r = sess.refs[i];
      try { sess.qs[i] = PP.make(r.ch, r.seed, r.lvl); } catch (e) { sess.refs[i] = { ch: r.ch, seed: r.seed + 1, lvl: r.lvl }; sess.qs[i] = PP.make(r.ch, r.seed + 1, r.lvl); }
    }
    return sess.qs[i];
  }
  function record(q, ok, ms, kind) {
    S.answered++; if (ok) S.correct++;
    S.timeMs += Math.min(ms, 180000);
    const st = S.stats[q.ch] || (S.stats[q.ch] = [0, 0, 0]);
    st[1]++; if (ok) st[0]++; st[2] += Math.min(ms, 180000);
    if (!ok) S.mistakes[q.id] = { ch: q.ch, seed: q.seed, lvl: q.lvl, t: Date.now() };
    else if (S.mistakes[q.id] && kind === 'mistakes') { delete S.mistakes[q.id]; S.fixed[q.id] = Date.now(); S.fixedCount++; }
    const ks = Object.keys(S.mistakes);
    if (ks.length > 300) ks.sort((a, b) => S.mistakes[a].t - S.mistakes[b].t).slice(0, ks.length - 300).forEach((k) => delete S.mistakes[k]);
  }
  function answer(i, btn) {
    const q = qAt(Q, Q.i);
    if (Q.answers[Q.i]) return;
    const ok = i === q.ans, ms = Date.now() - Q.qStart;
    Q.answers[Q.i] = { pick: i, ok, ms };
    record(q, ok, ms, Q.kind);
    if (ok) { Q.streak++; Q.best = Math.max(Q.best, Q.streak); S.bestStreak = Math.max(S.bestStreak, Q.streak); const g = 10 + (Q.streak >= 5 ? 5 : 0); Q.xp += g; S.xp += g; sfx.ok(); }
    else { Q.streak = 0; Q.xp += 2; S.xp += 2; sfx.no(); }
    save();
    render();
    const el = app.querySelector(`.opt[data-i="${i}"]`);
    if (el) el.classList.add(ok ? 'pop' : 'shake');
    if (ok) floatXP(10 + (Q.streak >= 5 ? 5 : 0), el);
    const fb = app.querySelector('.feedback');
    if (fb && fb.getBoundingClientRect().top > innerHeight - 80) fb.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
    const nx = app.querySelector('[data-act="next"]'); if (nx) nx.focus({ preventScroll: true });
    checkBadges({});
  }
  function next() {
    Q.i++; Q.qStart = Date.now();
    if (Q.kind !== 'endless' && Q.i >= Q.refs.length) return finish();
    render(); window.scrollTo(0, 0);
  }
  function finish() {
    const n = Q.answers.filter(Boolean).length, c = Q.answers.filter((a) => a && a.ok).length;
    Q.done = true; Q.n = n; Q.c = c; Q.secs = Math.round((Date.now() - Q.start) / 1000);
    const ev = {};
    if (Q.kind === 'set' || Q.kind === 'mix') {
      const key = Q.kind === 'mix' ? 'mix.' + Q.set : Q.ch + '.' + Q.set, prev = S.sets[key] || { best: 0, stars: 0, n: 0 };
      const st = starsFor(c, n); Q.stars = st; Q.newBest = c > prev.best;
      const bonus = Math.max(0, st - prev.stars) * 15; Q.xp += bonus; S.xp += bonus;
      S.sets[key] = { best: Math.max(prev.best, c), stars: Math.max(prev.stars, st), n: prev.n + 1 };
      if (st === 3 && (Q.kind === 'mix' ? PP.mixLevel(Q.set) : PP.setLevelOf(PP.byId[Q.ch], Q.set)) === 3) ev.expert3 = true;
      const avg = Q.answers.reduce((s, a) => s + (a ? a.ms : 0), 0) / Math.max(1, n) / 1000;
      if (c >= 9 && avg < 30) ev.speedy = true;
      if (Q.kind === 'set') S.last = Q.ch;
    }
    if (Q.kind === 'daily' && S.daily[today()] === undefined) { S.daily[today()] = c; Q.xp += 50; S.xp += 50; Q.dailyBonus = true; }
    save();
    view = { name: 'result' };
    render(); window.scrollTo(0, 0);
    if (n && c / n >= 0.8) { confetti(c === n ? 1.6 : 1); sfx.win(); }
    checkBadges(ev);
  }

  // ================= tests =================
  let timer = null;
  function startTest(tid, form) {
    const t = PP.testById[tid];
    T = { tid, form, secs: PP.testForm(t, form).map((s) => Object.assign(s, { picks: Array(s.refs.length).fill(null), flags: {}, left: s.min * 60, used: 0, qs: [] })), si: 0, i: 0, paused: false, confirm: false, started: Date.now(), qStart: Date.now(), times: {} };
    view = { name: 'test' };
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    render(); window.scrollTo(0, 0);
  }
  function tick() {
    if (!T || view.name !== 'test' || T.paused || T.breakFor !== undefined) return;
    const s = T.secs[T.si]; s.left--; s.used++;
    const el = document.getElementById('tleft');
    if (el) { el.textContent = mmss(s.left); el.classList.toggle('low', s.left <= 60); }
    if (s.left <= 0) endSection(true);
  }
  function tq(si, i) { const s = T.secs[si]; if (!s.qs[i]) { const r = s.refs[i]; s.qs[i] = PP.make(r.ch, r.seed, r.lvl); } return s.qs[i]; }
  function endSection(timeUp) {
    const s = T.secs[T.si]; s.done = true; s.timeUp = !!timeUp; T.confirm = false;
    if (T.si < T.secs.length - 1) { T.breakFor = T.si + 1; render(); window.scrollTo(0, 0); }
    else finishTest();
  }
  function finishTest() {
    clearInterval(timer);
    let c = 0, n = 0;
    T.secs.forEach((s, si) => { s.c = 0; s.refs.forEach((_, i) => { const q = tq(si, i); const p = s.picks[i]; n++; if (p === q.ans) { c++; s.c++; } if (p !== null) record(q, p === q.ans, T.times[si + ':' + i] || 30000, 'test'); }); });
    T.c = c; T.n = n; T.pct = Math.round((100 * c) / n);
    const gain = c * 5; S.xp += gain; T.xp = gain;
    S.tests.unshift({ id: T.tid, form: PP.FORMS[T.form], c, n, pct: T.pct, date: Date.now(), secs: T.secs.map((s) => [s.title, s.c, s.refs.length, s.used]) });
    S.tests = S.tests.slice(0, 60);
    save();
    view = { name: 'testResult' };
    render(); window.scrollTo(0, 0);
    if (T.pct >= 80) { confetti(1.4); sfx.win(); }
    checkBadges({});
  }
  function testMove(to) {
    const k = T.si + ':' + T.i; T.times[k] = (T.times[k] || 0) + (Date.now() - T.qStart); T.qStart = Date.now();
    const s = T.secs[T.si]; T.i = Math.max(0, Math.min(s.refs.length - 1, to)); T.confirm = false; render();
  }

  // ================= rendering helpers =================
  const optsHTML = (q, st) => {
    // st: {pick, reveal, test}
    const fig = q.optStyle === 'fig' || q.opts.some((o) => o.startsWith('<svg'));
    return `<div class="opts ${fig ? 'figs' : 'text'} ${q.opts.length === 4 ? 'n4' : ''}" role="group" aria-label="Answer choices">${q.opts.map((o, i) => {
      let cls = 'opt';
      if (st.reveal) { if (i === q.ans) cls += ' right'; else if (i === st.pick) cls += ' wrong'; else cls += ' dim'; }
      else if (st.pick === i) cls += ' sel';
      return `<button class="${cls}" data-act="${st.test ? 'tpick' : 'pick'}" data-i="${i}" ${st.reveal ? 'disabled' : ''} aria-label="Choice ${LET[i]}"><span class="L">${LET[i]}</span>${o}</button>`;
    }).join('')}</div>`;
  };
  const feedbackHTML = (q, pick) => {
    const ok = pick === q.ans;
    if (ok) return `<div class="feedback ok" role="status"><h3>${I.check} Correct!</h3><details><summary>See why</summary><div class="how">${q.explain}</div></details></div>`;
    const why = pick !== null && pick !== undefined ? q.why[pick] : '';
    return `<div class="feedback no" role="status"><h3>${I.x} ${pick === null || pick === undefined ? 'Not answered' : 'Not quite'}. The answer is ${LET[q.ans]}.</h3>${why ? `<p class="why">Why ${LET[pick]} doesn’t work: ${why}</p>` : ''}<div class="how"><b>How to solve it</b>${q.explain}</div></div>`;
  };
  const qBody = (q, st) => `<div class="prompt">${q.prompt}</div>${q.stem ? `<div class="stem">${q.stem}</div>` : ''}${optsHTML(q, st)}`;
  const chName = (id) => PP.byId[id] ? PP.byId[id].name : id;
  const summ = (q) => { const st = /<svg/.test(q.stem) || !q.stem ? '' : plain(q.stem); const t = st.length >= 3 ? st + ' — ' + plain(q.prompt) : plain(q.prompt); return t.length > 90 ? t.slice(0, 88) + '…' : t; };
  const plain = (h) => h.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const topbar = () => {
    const L = lvlOf(S.xp), a = lvlStart(L), b = lvlStart(L + 1), pct = Math.round((100 * (S.xp - a)) / (b - a));
    const ds = dailyStreak();
    return `<header class="top"><div class="wrap">
      <button class="brand" data-go="home" aria-label="Home">${owl()}<span>Puzzle Peak</span></button>
      <div class="lvl" title="${S.xp} XP"><span class="lvl-badge">Lv ${L} · ${title(L)}</span><span class="xpbar" aria-hidden="true"><i style="width:${pct}%"></i></span>${ds ? `<span class="flame" title="Daily streak">${I.flame}${ds}</span>` : ''}</div>
      <button class="iconbtn" data-act="sound" aria-label="${S.sound ? 'Turn sound off' : 'Turn sound on'}">${S.sound ? I.sound : I.mute}</button>
      <button class="iconbtn" data-go="trophies" aria-label="Trophies">${I.trophy}</button>
      <button class="iconbtn" data-go="progress" aria-label="Progress report">${I.chart}</button>
      <button class="iconbtn" data-go="profile" aria-label="Profile">${I.user}</button>
    </div></header>`;
  };
  const backBtn = (to, label) => `<button class="back" data-go="${to}">${I.back} ${label}</button>`;

  // ================= views =================
  function vHome() {
    const doneToday = S.daily[today()] !== undefined, nm = Object.keys(S.mistakes).length;
    const last = !locked() && S.last && PP.byId[S.last];
    const greet = S.name ? `Hi, ${esc(S.name)}!` : 'Hi there, puzzler!';
    const nx = nextMix(), md = mixDone();
    const tiles = (g) => PP.chapters.filter((c) => c.group === g).map((c) => {
      const sc = PP.setCount(c), st = chStars(c), done = chDone(c);
      const inner = `<span class="tag">${esc(c.exams)}</span><span class="ttl">${esc(c.name)}</span><span class="prog" aria-hidden="true"><i style="width:${Math.round((100 * done) / sc)}%"></i></span><span class="meta"><span>${done}/${sc} sets</span><span class="stars">★ ${st}<span class="muted">/${sc * 3}</span></span></span>`;
      return locked() ? `<div class="tile locked" style="--g:${GCOL[g]}">${inner}</div>` : `<button class="tile" data-go="${c.id}" style="--g:${GCOL[g]}">${inner}</button>`;
    }).join('');
    const tests = PP.tests.filter((t) => t.id !== 'sprint' && (!locked() || t.mixed)).sort((a, b) => (b.mixed ? 1 : 0) - (a.mixed ? 1 : 0));
    return `<main class="wrap">
      <section class="hello">${owl(doneToday ? 'happy' : '')}<div><h1>${greet}</h1><p class="muted" style="margin:0">Climb the mixed trail: every set mixes words, numbers, shapes and logic, just like the real tests. Every wrong answer comes with an explanation.</p></div></section>
      <section class="climb">
        <div class="row"><div class="grow"><span class="chip-s full">Start here</span><h2 style="margin-top:6px">Mixed Climb</h2><p class="muted small" style="margin:2px 0 0">${PP.MIX_SETS} sets of ${PP.MIX_N} questions · ${md} done · ★ ${mixStars()}/${PP.MIX_SETS * 3}</p></div>${owl(md ? 'happy' : '')}</div>
        <div class="mixmap" aria-label="Your Mixed Climb trail">${PP.range(PP.MIX_SETS).map((i) => { const r = S.sets['mix.' + i]; return `<button class="s${r ? r.stars : 0} ${i === nx ? 'cur' : ''}" data-go="mix.${i + 1}" aria-label="Set ${i + 1}${r ? `, ${r.stars} stars` : ''}" title="Set ${i + 1} · ${PP.LEVELS[PP.mixLevel(i)]}"></button>`; }).join('')}</div>
        <div class="row"><button class="btn sun" data-go="mix.${nx + 1}">${md ? 'Continue' : 'Start'}: Set ${nx + 1} · ${PP.LEVELS[PP.mixLevel(nx)]} →</button><button class="btn ghost" data-go="smart">Smart Mix (my weak spots)</button><button class="back" style="margin:0" data-go="mix">See all sets</button></div>
      </section>
      <div class="quick">
        <button class="qcard hot" data-go="daily"><b>${doneToday ? 'Daily 10 done ✓' : 'Daily 10'}</b><span class="small muted">${doneToday ? `You scored ${S.daily[today()]}/10. Play again for practice.` : '10 mixed questions, new every day. +50 XP'}</span></button>
        <button class="qcard" data-go="mistakes"><b>Fix my mistakes</b><span class="small muted">${nm ? `${nm} question${nm > 1 ? 's' : ''} to try again` : 'Nothing to fix yet'}</span></button>
        <button class="qcard" data-go="test-sprint"><b>Brain Sprint</b><span class="small muted">20 mixed questions · 12 minutes</span></button>
        ${last ? `<button class="qcard" data-go="${last.id}"><b>Keep going</b><span class="small muted">${esc(last.name)}</span></button>` : ''}
      </div>
      <section class="section"><div class="section-head"><h2>Practice tests</h2><span class="muted small">Timed, scored at the end, with every answer explained afterwards.</span></div>
        <div class="tests">${tests.map((t) => { const best = S.tests.filter((x) => x.id === t.id).reduce((m, x) => Math.max(m, x.pct), -1); return `<button class="tcard" data-go="test-${t.id}"><span class="chips">${t.mixed ? '<span class="chip-s full">Mixed</span>' : ''}<span class="chip-s">${t.full ? 'Full length' : 'Short'}</span><span class="chip-s">${PP.testSize(t)} questions</span><span class="chip-s">${PP.testMinutes(t)} min</span></span><span class="ttl">${esc(t.name)}</span><span class="small muted">${esc(t.blurb)}</span>${best >= 0 ? `<span class="small">Best: <b>${best}%</b></span>` : ''}</button>`; }).join('')}</div>
      </section>
      <section class="section"><div class="section-head"><h2>One skill at a time</h2><span class="muted small">${locked() ? 'Turned off by a parent. Your stars from mixed practice still count here.' : 'Practise a single question type.'}</span></div></section>
      ${PP.groups.map((g) => `<section class="section" style="margin-top:14px"><div class="section-head" style="--g:${GCOL[g.id]}"><span class="grp-dot"></span><h3>${g.name}</h3><span class="muted small">${g.blurb}</span><span class="stars" style="margin-left:auto">★ ${grpStars(g.id)}</span></div><div class="tiles">${tiles(g.id)}</div></section>`).join('')}
      <p class="small muted" style="margin-top:32px">Questions are original and written in the style of each test. Not affiliated with the test publishers. <button class="back" style="display:inline;margin:0" data-go="about">About the questions</button></p>
    </main>`;
  }
  function vMix() {
    return `<main class="wrap">${backBtn('home', 'Home')}
      <div class="chead"><span class="chip-s full" style="justify-self:start">All question types</span><h1>Mixed Climb</h1><p class="muted" style="margin:0">${PP.MIX_N} questions per set: three from each area, never the same area twice in a row. Sets 1–10 are Warm-up, 11–25 Challenge, 26–40 Expert.</p></div>
      <section class="section"><div class="sets">${PP.range(PP.MIX_SETS).map((i) => { const r = S.sets['mix.' + i]; return `<button class="setbtn ${r ? 'done' : ''}" data-go="mix.${i + 1}"><b>Set ${i + 1}</b><span class="lv">${PP.LEVELS[PP.mixLevel(i)]}</span>${starsTxt(r ? r.stars : 0)}${r ? `<span class="lv">Best ${r.best}/${PP.MIX_N}</span>` : ''}</button>`; }).join('')}</div></section>
      <section class="section tipbox"><b>Smart Mix</b> picks 12 questions from the areas you find hardest (and the ones you haven’t tried much), at a level that matches how you’re doing. <button class="btn sun" style="margin-top:10px" data-go="smart">Start Smart Mix</button></section>
    </main>`;
  }
  function vLocked() {
    return `<main class="wrap"><section class="result">${owl('think')}<h2>Mixed practice only</h2><p>A parent has turned off single-skill practice, so every question type gets a turn. Try the Mixed Climb, Smart Mix or a mixed test instead!</p><div class="row" style="justify-content:center"><button class="btn sun" data-go="mix.${nextMix() + 1}">Continue Mixed Climb</button><button class="btn ghost" data-go="home">Home</button></div></section></main>`;
  }
  function vChapter() {
    const ch = PP.byId[view.ch], g = GCOL[ch.group], sc = PP.setCount(ch);
    const st = S.stats[ch.id];
    return `<main class="wrap" style="--g:${g}">${backBtn('home', 'All chapters')}
      <div class="chead"><span class="chip-s" style="justify-self:start">${esc(ch.exams)}</span><h1>${esc(ch.name)}</h1>
      ${st ? `<p class="muted" style="margin:0">${st[1]} answered · ${Math.round((100 * st[0]) / st[1])}% correct · ${chStars(ch)}/${sc * 3} stars</p>` : ''}</div>
      <div class="tipbox" style="margin-top:16px"><b>How to crack it:</b> ${esc(ch.tip)}</div>
      <section class="section"><div class="section-head"><h2>Sets</h2><span class="muted small">10 questions each, getting harder as you go</span></div>
        <div class="sets">${PP.range(sc).map((i) => { const r = S.sets[ch.id + '.' + i]; return `<button class="setbtn ${r ? 'done' : ''}" data-go="${ch.id}.${i + 1}"><b>Set ${i + 1}</b><span class="lv">${PP.LEVELS[PP.setLevelOf(ch, i)]}</span>${starsTxt(r ? r.stars : 0)}${r ? `<span class="lv">Best ${r.best}/10</span>` : ''}</button>`; }).join('')}</div></section>
      <section class="section"><div class="section-head"><h2>Endless practice</h2><span class="muted small">${ch.bank ? 'Random questions from this chapter.' : 'Brand-new questions every time. Keep going as long as you like.'}</span></div>
        <div class="endless"><span class="seg" role="group" aria-label="Difficulty">${(ch.bank ? [0, 1, 2, 3] : [1, 2, 3]).map((l) => `<button data-act="lvl" data-l="${l}" aria-pressed="${view.lvl === l || (ch.bank && !view.lvl && l === 0)}">${l ? PP.LEVELS[l] : 'Any'}</button>`).join('')}</span><button class="btn sun" data-act="endless">Start endless</button></div></section>
    </main>`;
  }
  function vQuiz() {
    const q = qAt(Q, Q.i), a = Q.answers[Q.i];
    const total = Q.kind === 'endless' ? 0 : Q.refs.length;
    const bar = total ? `<span class="qprog" aria-label="Question ${Q.i + 1} of ${total}">${PP.range(total).map((k) => `<i class="${Q.answers[k] ? (Q.answers[k].ok ? 'ok' : 'no') : k === Q.i ? 'cur' : ''}"></i>`).join('')}</span>` : `<span class="grow small muted">${Q.answers.filter((x) => x && x.ok).length} correct of ${Q.answers.filter(Boolean).length}</span>`;
    return `<main class="wrap">
      <div class="qbar"><div class="row"><button class="iconbtn" data-act="quit" aria-label="Leave">${I.x}</button>${bar}${Q.streak >= 2 ? `<span class="flame">${I.flame}${Q.streak}</span>` : ''}</div></div>
      <article class="qcardx">
        <div class="qhead"><span>${esc(Q.title)}${Q.kind !== 'set' ? ` · ${esc(chName(q.ch))}` : ''}</span><span>${total ? `Question ${Q.i + 1} of ${total}` : `#${Q.i + 1}`} · ${PP.LEVELS[q.lvl] || ''}</span></div>
        ${qBody(q, { pick: a ? a.pick : null, reveal: !!a })}
        ${a ? feedbackHTML(q, a.pick) : ''}
        <div class="qfoot">${Q.kind === 'endless' ? '<button class="btn ghost" data-act="finish">Finish</button>' : '<span></span>'}${a ? `<button class="btn sun" data-act="next">${Q.kind !== 'endless' && Q.i === Q.refs.length - 1 ? 'See results' : 'Next'} →</button>` : '<span class="small muted">Tap an answer (or press 1–5)</span>'}</div>
      </article>
    </main>`;
  }
  function reviewList(items) {
    return `<div class="review">${items.map(({ q, pick, n }) => `<details><summary><span class="dot" style="background:${pick === q.ans ? 'var(--good)' : 'var(--bad)'}"></span><span class="grow">${n}. ${esc(summ(q))}</span><span class="small muted">${esc(chName(q.ch))}</span></summary><div class="inner">${qBody(q, { pick, reveal: true })}${feedbackHTML(q, pick)}</div></details>`).join('')}</div>`;
  }
  function vResult() {
    const pct = Q.n ? Q.c / Q.n : 0;
    const mood = pct >= 0.7 ? 'happy' : pct >= 0.5 ? '' : 'think';
    const msg = pct >= 0.9 ? 'Brilliant! That was top-notch thinking.' : pct >= 0.7 ? 'Great work! Check the ones you missed below.' : pct >= 0.5 ? 'Good effort. Read the explanations, then try again.' : 'That was a tricky one! The explanations below will help a lot.';
    const avg = Q.n ? Math.round(Q.answers.reduce((s, a) => s + (a ? a.ms : 0), 0) / Q.n / 1000) : 0;
    const items = Q.answers.map((a, i) => (a ? { q: Q.qs[i], pick: a.pick, n: i + 1 } : null)).filter(Boolean);
    const wrong = items.filter((x) => x.pick !== x.q.ans);
    const ch = Q.ch && PP.byId[Q.ch];
    const setLike = Q.kind === 'set' || Q.kind === 'mix';
    const nextSet = Q.kind === 'set' && Q.set + 1 < PP.setCount(ch) ? `${ch.id}.${Q.set + 2}` : Q.kind === 'mix' && Q.set + 1 < PP.MIX_SETS ? `mix.${Q.set + 2}` : '';
    return `<main class="wrap">
      <section class="result">${owl(mood)}<h1>${esc(Q.title)}</h1>
        <div class="bigscore">${Q.c}<span class="muted" style="font-size:.5em"> / ${Q.n}</span></div>
        ${setLike ? `<div class="bigstars">${[1, 2, 3].map((k) => I.star(k <= Q.stars)).join('')}</div>` : ''}
        <p style="margin:0">${msg}${Q.newBest && setLike ? ' <b>New best!</b>' : ''}${Q.dailyBonus ? ' <b>+50 XP daily bonus!</b>' : ''}</p>
        <div class="statrow"><div class="stat"><b>+${Q.xp}</b><span>XP earned</span></div><div class="stat"><b>${Q.best}</b><span>best streak</span></div><div class="stat"><b>${avg}s</b><span>per question</span></div></div>
        ${avg > 45 ? '<p class="small muted" style="margin:0">Real tests allow about 30–40 seconds per question. Speed comes with practice.</p>' : ''}
        <div class="row" style="justify-content:center">
          ${setLike ? `<button class="btn ghost" data-act="again">Try again</button>` : ''}
          ${nextSet ? `<button class="btn sun" data-go="${nextSet}">Next set →</button>` : ''}
          ${wrong.length && Q.kind !== 'mistakes' ? `<button class="btn ghost" data-act="fixnow">Retry the ${wrong.length} I missed</button>` : ''}
          <button class="btn" data-go="${Q.kind === 'mix' ? 'mix' : ch && (Q.kind === 'set' || Q.kind === 'endless') && !locked() ? ch.id : 'home'}">Done</button>
        </div>
      </section>
      ${items.length ? `<section class="section"><div class="section-head"><h2>Review</h2><span class="muted small">Tap a question to see it again with the explanation.</span></div>${reviewList(items)}</section>` : ''}
    </main>`;
  }
  function vTestIntro() {
    const t = PP.testById[view.t];
    const hist = S.tests.filter((x) => x.id === t.id);
    return `<main class="wrap">${backBtn('home', 'Home')}
      <div class="chead"><span class="chip-s" style="justify-self:start">${esc(t.exam)}</span><h1>${esc(t.name)}</h1><p class="muted" style="margin:0">${esc(t.blurb)}</p></div>
      <section class="section"><div class="tablewrap"><table class="plain"><thead><tr><th>Section</th><th class="n">Questions</th><th class="n">Time</th></tr></thead><tbody>
        ${t.sections.map((s) => `<tr><td>${esc(s.title)}</td><td class="n">${s.balanced || s.sprint || s.mix.reduce((m, x) => m + x[1], 0)}</td><td class="n">${s.min} min</td></tr>`).join('')}
        <tr><td><b>Total</b></td><td class="n"><b>${PP.testSize(t)}</b></td><td class="n"><b>${PP.testMinutes(t)} min</b></td></tr></tbody></table></div></section>
      <section class="section stack"><div class="tipbox"><b>How it works:</b> Each section has its own timer, like the real test. You can skip questions, flag them and come back. You won’t see answers until the end. Then you can review every question with its explanation.</div>
        <div class="row"><span>Test form:</span><span class="seg" role="group" aria-label="Test form">${PP.FORMS.map((f, i) => `<button data-act="form" data-f="${i}" aria-pressed="${view.form === i}">${f}</button>`).join('')}</span><span class="small muted">Each form has different questions.</span></div>
        <div><button class="btn sun" data-act="starttest">Start test</button></div>
        ${hist.length ? `<div class="small muted">Past attempts: ${hist.slice(0, 6).map((h) => `Form ${h.form}: <b>${h.pct}%</b>`).join(' · ')}</div>` : ''}
      </section></main>`;
  }
  function vTest() {
    const t = PP.testById[T.tid];
    if (T.breakFor !== undefined) {
      const done = T.secs[T.breakFor - 1], nx = T.secs[T.breakFor];
      return `<main class="wrap"><section class="result">${owl('happy')}<h2>${esc(done.title)} finished${done.timeUp ? ' (time’s up)' : ''}</h2><p>Take a short breath. Next: <b>${esc(nx.title)}</b>, ${nx.refs.length} questions in ${nx.min} minutes.</p><button class="btn sun" data-act="nextsec">Start ${esc(nx.title)}</button></section></main>`;
    }
    const s = T.secs[T.si], q = tq(T.si, T.i);
    const answered = s.picks.filter((p) => p !== null).length;
    return `<main class="wrap">
      <div class="qbar"><div class="row"><span class="grow"><b>${esc(t.name)}</b><span class="small muted"> · ${esc(s.title)}${T.secs.length > 1 ? ` (section ${T.si + 1} of ${T.secs.length})` : ''}</span></span><button class="btn ghost" data-act="askquit" style="padding:8px 12px">Leave</button><button class="btn ghost" data-act="pause" style="padding:8px 12px">${T.paused ? 'Resume' : 'Pause'}</button><span id="tleft" class="timer ${s.left <= 60 ? 'low' : ''}" aria-label="Time left">${mmss(s.left)}</span></div></div>
      ${T.quit ? `<div class="confirm" style="margin-bottom:12px"><span class="grow">Leave this test? Your answers so far won’t be saved.</span><button class="btn ghost" data-act="noquit">Keep going</button><button class="btn" style="background:var(--bad)" data-act="doquit">Leave test</button></div>` : ''}
      ${T.paused ? `<section class="pausecover">${owl()}<h2>Paused</h2><p class="muted">The timer is stopped. The question is hidden.</p><button class="btn sun" data-act="pause">Resume</button></section>` : `
      <article class="qcardx">
        <div class="qhead"><span>Question ${T.i + 1} of ${s.refs.length}</span><button class="back" style="margin:0" data-act="flag">${s.flags[T.i] ? '★ Flagged' : '☆ Flag to come back'}</button></div>
        ${qBody(q, { pick: s.picks[T.i], test: true })}
        <div class="qfoot"><button class="btn ghost" data-act="tprev" ${T.i === 0 ? 'disabled' : ''}>← Back</button><button class="btn" data-act="tnext" ${T.i === s.refs.length - 1 ? 'disabled' : ''}>Next →</button></div>
      </article>
      <section class="section stack"><div class="tnav" aria-label="Jump to question">${s.refs.map((_, i) => `<button class="${s.picks[i] !== null ? 'ans' : ''} ${i === T.i ? 'cur' : ''} ${s.flags[i] ? 'flag' : ''}" data-act="tjump" data-i="${i}">${i + 1}</button>`).join('')}</div>
        ${T.confirm ? `<div class="confirm"><span class="grow">${answered < s.refs.length ? `You have ${s.refs.length - answered} unanswered question${s.refs.length - answered > 1 ? 's' : ''}. ` : ''}Finish this section? You can’t come back to it.</span><button class="btn ghost" data-act="cancelend">Keep working</button><button class="btn sun" data-act="endsec">Yes, finish</button></div>` : `<div><button class="btn ghost" data-act="askend">Finish section (${answered}/${s.refs.length} answered)</button></div>`}
      </section>`}
    </main>`;
  }
  function vTestResult() {
    const t = PP.testById[T.tid];
    const mood = T.pct >= 70 ? 'happy' : T.pct >= 50 ? '' : 'think';
    let n = 0;
    const items = T.secs.flatMap((s, si) => s.refs.map((_, i) => ({ q: tq(si, i), pick: s.picks[i], n: ++n, si })));
    const onlyWrong = view.onlyWrong;
    return `<main class="wrap">
      <section class="result">${owl(mood)}<h1>${esc(t.name)} · Form ${PP.FORMS[T.form]}</h1><div class="bigscore">${T.pct}%</div><p style="margin:0">${T.c} of ${T.n} correct · +${T.xp} XP</p>
        <div class="tablewrap" style="width:100%;max-width:520px"><table class="plain"><thead><tr><th>Section</th><th class="n">Score</th><th class="n">Time used</th></tr></thead><tbody>${T.secs.map((s) => `<tr><td>${esc(s.title)}</td><td class="n">${s.c}/${s.refs.length}</td><td class="n">${mmss(s.used)}${s.timeUp ? ' ⏱' : ''}</td></tr>`).join('')}</tbody></table></div>
        <p class="small muted" style="margin:0">This is a practice score, not an official percentile. Look at which sections were hardest, then practise those chapters.</p>
        <div class="row" style="justify-content:center"><button class="btn ghost" data-go="test-${t.id}">Try another form</button><button class="btn" data-go="home">Done</button></div>
      </section>
      <section class="section"><div class="section-head"><h2>Review answers</h2><span class="seg" role="group"><button data-act="rw" data-v="0" aria-pressed="${!onlyWrong}">All</button><button data-act="rw" data-v="1" aria-pressed="${!!onlyWrong}">Only mistakes</button></span></div>
        ${reviewList(items.filter((x) => !onlyWrong || x.pick !== x.q.ans))}</section>
    </main>`;
  }
  function vMistakes() {
    const ms = Object.values(S.mistakes), by = {};
    ms.forEach((m) => { by[m.ch] = (by[m.ch] || 0) + 1; });
    return `<main class="wrap">${backBtn('home', 'Home')}<h1>Fix my mistakes</h1>
      <p class="muted">Every question you miss is saved here. Get it right to clear it. ${S.fixedCount ? `You’ve fixed <b>${S.fixedCount}</b> so far.` : ''}</p>
      ${ms.length ? `<div class="stack"><div><button class="btn sun" data-act="mistakes">Try ${Math.min(10, ms.length)} of my ${ms.length} mistakes</button></div>
      <div class="tablewrap"><table class="plain"><thead><tr><th>Chapter</th><th class="n">To fix</th></tr></thead><tbody>${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([c, k]) => `<tr><td>${esc(chName(c))}</td><td class="n">${k}</td></tr>`).join('')}</tbody></table></div></div>` : `<section class="result">${owl('happy')}<p>No mistakes saved. Go practise something tricky!</p><button class="btn" data-go="home">Back home</button></section>`}
    </main>`;
  }
  function vProgress() {
    const acc = S.answered ? Math.round((100 * S.correct) / S.answered) : 0;
    const pill = (p) => `<span class="pill ${p >= 80 ? 'good' : p >= 60 ? 'mid' : 'low'}">${p}%</span>`;
    const weak = PP.chapters.filter((c) => S.stats[c.id] && S.stats[c.id][1] >= 10).map((c) => [c, S.stats[c.id][0] / S.stats[c.id][1]]).sort((a, b) => a[1] - b[1]).filter((x) => x[1] < 0.7).slice(0, 4);
    return `<main class="wrap">${backBtn('home', 'Home')}<h1>Progress report</h1><p class="muted">For parents and puzzlers. ${Sync.on ? 'Progress is synced across devices signed in to this account.' : 'Progress is saved in this browser on this device.'}</p>
      <section class="section"><div class="statrow" style="justify-content:flex-start"><div class="stat"><b>${S.answered}</b><span>questions answered</span></div><div class="stat"><b>${acc}%</b><span>correct overall</span></div><div class="stat"><b>${Math.round(S.timeMs / 60000)} min</b><span>practice time</span></div><div class="stat"><b>${S.bestStreak}</b><span>best streak</span></div><div class="stat"><b>${S.tests.length}</b><span>tests taken</span></div><div class="stat"><b>${Object.keys(S.badges).length}/${BADGES.length}</b><span>badges</span></div></div></section>
      ${weak.length ? `<section class="section tipbox"><b>Worth more practice:</b> ${weak.map(([c, p]) => `<button class="back" style="display:inline;margin:0 8px 0 0" data-go="${c.id}">${esc(c.name)} (${Math.round(p * 100)}%)</button>`).join('')}</section>` : ''}
      ${PP.groups.map((g) => `<section class="section"><div class="section-head" style="--g:${GCOL[g.id]}"><span class="grp-dot"></span><h2>${g.name}</h2></div><div class="tablewrap"><table class="plain"><thead><tr><th>Chapter</th><th class="n">Answered</th><th class="n">Correct</th><th class="n">Avg time</th><th class="n">Sets</th><th class="n">Stars</th></tr></thead><tbody>${PP.chapters.filter((c) => c.group === g.id).map((c) => { const st = S.stats[c.id]; return `<tr><td><button class="back" style="margin:0" data-go="${c.id}">${esc(c.name)}</button></td><td class="n">${st ? st[1] : 0}</td><td class="n">${st ? pill(Math.round((100 * st[0]) / st[1])) : '–'}</td><td class="n">${st ? Math.round(st[2] / st[1] / 1000) + 's' : '–'}</td><td class="n">${chDone(c)}/${PP.setCount(c)}</td><td class="n">${chStars(c)}</td></tr>`; }).join('')}</tbody></table></div></section>`).join('')}
      <section class="section"><div class="section-head"><h2>Tests</h2></div>${S.tests.length ? `<div class="tablewrap"><table class="plain"><thead><tr><th>Date</th><th>Test</th><th class="n">Score</th><th>Sections</th></tr></thead><tbody>${S.tests.slice(0, 20).map((x) => `<tr><td>${new Date(x.date).toLocaleDateString()}</td><td>${esc((PP.testById[x.id] || {}).name || x.id)} · ${x.form}</td><td class="n">${pill(x.pct)}</td><td class="small">${x.secs.map((s) => `${esc(s[0])} ${s[1]}/${s[2]}`).join(' · ')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No tests yet.</p>'}</section>
    </main>`;
  }
  function vTrophies() {
    return `<main class="wrap">${backBtn('home', 'Home')}<h1>Trophy shelf</h1><p class="muted">${Object.keys(S.badges).length} of ${BADGES.length} badges earned · ${S.xp} XP · Level ${lvlOf(S.xp)} ${title(lvlOf(S.xp))}</p>
      <div class="badges">${BADGES.map(([id, name, desc, glyph]) => `<div class="badge ${S.badges[id] ? '' : 'locked'}">${medal(glyph, !!S.badges[id])}<b>${esc(name)}</b><span class="small muted">${esc(desc)}</span></div>`).join('')}</div></main>`;
  }
  const pinHash = (pin) => PP.hash('pp-pin:' + pin).toString(36);
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function packState() {
    const json = JSON.stringify(Object.assign({}, S, { parent: undefined }));
    try { const buf = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer(); return 'PP1' + b64(new Uint8Array(buf)); }
    catch (e) { return 'PP0' + b64(new TextEncoder().encode(json)); }
  }
  async function unpackState(code) {
    code = (code || '').replace(/\s+/g, '');
    if (code.startsWith('PP1')) return JSON.parse(await new Response(new Blob([unb64(code.slice(3))]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
    if (code.startsWith('PP0')) return JSON.parse(new TextDecoder().decode(unb64(code.slice(3))));
    throw new Error('not a code');
  }
  function vProfile() {
    const P = S.parent || { pin: '', lock: false }, ok = !P.pin || view.parentOk;
    const parent = !P.pin
      ? `<p class="small muted" style="margin:0">Set a PIN so only you can change these settings or reset progress.</p>
        <label for="pp-pin">New parent PIN (4–8 digits)<input id="pp-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label>
        <label style="display:flex;gap:10px;align-items:center;font-weight:400"><input id="pp-lock" type="checkbox" checked> Mixed practice only (hides single-skill chapters and single-skill tests)</label>
        <div><button class="btn" data-act="setpin">Save parent settings</button></div>`
      : !view.parentOk
        ? `<p class="small" style="margin:0">Mixed practice only is <b>${P.lock ? 'on' : 'off'}</b>. Enter the parent PIN to change it.</p>
        <label for="pp-pin-in">Parent PIN<input id="pp-pin-in" type="password" inputmode="numeric" maxlength="8" autocomplete="off"></label><div><button class="btn" data-act="unlockparent">Unlock</button></div>`
        : `<label style="display:flex;gap:10px;align-items:center;font-weight:400"><input id="pp-lock" type="checkbox" ${P.lock ? 'checked' : ''}> Mixed practice only (hides single-skill chapters and single-skill tests)</label>
        <div class="row"><button class="btn" data-act="savelock">Save</button><button class="btn ghost" data-act="droppin">Remove PIN</button></div>`;
    return `<main class="wrap">${backBtn('home', 'Home')}<h1>Profile</h1>
      <form class="form" data-form="profile" style="margin-top:16px"><label for="pp-name">Your name<input id="pp-name" type="text" maxlength="24" value="${esc(S.name)}" placeholder="e.g. Arjun" autocomplete="off"></label>
        <label style="display:flex;gap:10px;align-items:center;font-weight:400"><input id="pp-sound" type="checkbox" ${S.sound ? 'checked' : ''}> Sounds on</label>
        <div><button class="btn" type="submit">Save</button></div></form>
      <section class="section form"><h3>Parent controls</h3>${parent}${view.pmsg ? `<p class="small" style="margin:0">${esc(view.pmsg)}</p>` : ''}</section>
      <section class="section form"><h3>Move progress to another device</h3>
        <p class="small muted" style="margin:0">${Sync.on ? 'Progress already syncs while you are signed in. Codes are for devices that aren’t.' : 'Each device keeps its own progress.'} Make a code here, send it to the other device (AirDrop, Messages or email), and paste it there. Progress from both devices is combined, so nothing is lost.</p>
        <div class="row"><button class="btn ghost" data-act="mkcode">Make transfer code</button>${view.code ? '<button class="btn ghost" data-act="copycode">Copy code</button>' : ''}</div>
        ${view.code ? `<textarea id="pp-code-out" readonly rows="3" aria-label="Transfer code">${view.code}</textarea>` : ''}
        <label for="pp-code-in">Paste a code from another device<textarea id="pp-code-in" rows="3" placeholder="PP1…"></textarea></label>
        <div><button class="btn" data-act="usecode">Add this progress</button></div>
        ${view.codeMsg ? `<p class="small" style="margin:0">${esc(view.codeMsg)}</p>` : ''}</section>
      <section class="section form"><h3>Reset</h3>${!ok ? '<p class="small muted" style="margin:0">Unlock parent controls above to reset progress.</p>' : view.reset ? `<div class="confirm"><span class="grow">This erases all stars, badges, XP and saved mistakes. Are you sure?</span><button class="btn ghost" data-act="noreset">Cancel</button><button class="btn" style="background:var(--bad)" data-act="doreset">Erase everything</button></div>` : '<div><button class="btn ghost" data-act="askreset">Reset all progress…</button></div>'}</section>
      <p><button class="back" data-go="about">About the questions and sources</button></p></main>`;
  }
  function vAbout() {
    return `<main class="wrap prose">${backBtn('home', 'Home')}<h1>About the questions</h1>
      <p>Every question here is original. The formats, question types and timing follow the published descriptions of each test, so practice here feels like the real thing:</p>
      <ul>
        <li><b>CogAT (US) and CCAT (Canada)</b>: three batteries (Verbal, Quantitative, Nonverbal), each with three subtests, 10 minutes per subtest at Level 9 and up.</li>
        <li><b>OLSAT</b>: verbal comprehension, verbal reasoning (logical selection, inference, sentence arrangement), figural and quantitative reasoning, mixed together.</li>
        <li><b>NNAT</b>: pattern completion, reasoning by analogy, serial reasoning and spatial visualization. Shapes only, no reading.</li>
        <li><b>ISEE Lower Level</b>: synonyms and sentence completion; word-problem quantitative reasoning and math.</li>
        <li><b>Math Kangaroo and the Waterloo Gauss contest</b>: multi-step logic, counting and “trick” problems.</li>
      </ul>
      <p>Most number, shape and logic questions are built by a program from a rule, so the answer is always checked and the explanation shows the rule. Word questions are written by hand.</p>
      <p><b>Difficulty:</b> sets 1–3 are Warm-up (about grade 3–4), 4–7 Challenge (grade 4–5), and 8–10 Expert (grade 5–7).</p>
      <p><b>Free official practice worth knowing about:</b> past contests from the <a href="https://cemc.uwaterloo.ca/contests" target="_blank" rel="noopener">University of Waterloo CEMC</a>, and sample problems from <a href="https://mathkangaroo.org" target="_blank" rel="noopener">Math Kangaroo</a>. Test publishers: <a href="https://www.riversideinsights.com" target="_blank" rel="noopener">Riverside Insights</a> (CogAT), <a href="https://www.nelson.com" target="_blank" rel="noopener">Nelson</a> (CCAT), <a href="https://www.pearsonassessments.com" target="_blank" rel="noopener">Pearson</a> (OLSAT, NNAT), <a href="https://www.erblearn.org" target="_blank" rel="noopener">ERB</a> (ISEE).</p>
      <p class="small muted">Puzzle Peak is an independent practice tool. It is not affiliated with or endorsed by any test publisher. Scores here are practice scores, not official percentiles.</p>
    </main>`;
  }

  function render() {
    const V = { home: vHome, chapter: vChapter, quiz: vQuiz, result: vResult, testIntro: vTestIntro, test: vTest, testResult: vTestResult, mistakes: vMistakes, progress: vProgress, trophies: vTrophies, profile: vProfile, about: vAbout, mix: vMix, locked: vLocked }[view.name] || vHome;
    app.innerHTML = (['quiz', 'test'].includes(view.name) ? '' : topbar()) + V();
  }

  // ================= events =================
  app.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); if (view.name === 'test' && T && !g.dataset.go.startsWith('test-')) { /* leaving a test */ clearInterval(timer); T = null; } go(g.dataset.go); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'pick') answer(+b.dataset.i, b);
    else if (act === 'next') next();
    else if (act === 'finish') finish();
    else if (act === 'quit') { const back = Q.kind === 'mix' ? 'mix' : (Q.kind === 'set' || Q.kind === 'endless') && !locked() ? Q.ch : Q.kind === 'mistakes' ? 'mistakes' : 'home'; Q = null; go(back); }
    else if (act === 'again') { if (Q.kind === 'mix') startMix(Q.set); else startSet(Q.ch, Q.set); render(); window.scrollTo(0, 0); }
    else if (act === 'fixnow') { const refs = Q.answers.map((a, i) => (a && !a.ok ? Q.refs[i] : null)).filter(Boolean); startSession({ kind: 'mistakes', refs, title: 'Retry missed questions', token: 'mistakes' }); render(); window.scrollTo(0, 0); }
    else if (act === 'mistakes') { startMistakes(); render(); window.scrollTo(0, 0); }
    else if (act === 'lvl') { view.lvl = +b.dataset.l; render(); }
    else if (act === 'endless') { const ch = PP.byId[view.ch]; startEndless(view.ch, view.lvl === undefined ? (ch.bank ? 0 : 2) : view.lvl); render(); window.scrollTo(0, 0); }
    else if (act === 'sound') { S.sound = !S.sound; save(); render(); }
    else if (act === 'form') { view.form = +b.dataset.f; render(); }
    else if (act === 'starttest') startTest(view.t, view.form || 0);
    else if (act === 'tpick') { const s = T.secs[T.si]; s.picks[T.i] = +b.dataset.i; render(); }
    else if (act === 'tnext') testMove(T.i + 1);
    else if (act === 'tprev') testMove(T.i - 1);
    else if (act === 'tjump') testMove(+b.dataset.i);
    else if (act === 'flag') { const s = T.secs[T.si]; s.flags[T.i] = !s.flags[T.i]; render(); }
    else if (act === 'pause') { T.paused = !T.paused; render(); }
    else if (act === 'askquit') { T.quit = true; render(); window.scrollTo(0, 0); }
    else if (act === 'noquit') { T.quit = false; render(); }
    else if (act === 'doquit') { const id = T.tid; clearInterval(timer); T = null; go('test-' + id); }
    else if (act === 'askend') { T.confirm = true; render(); }
    else if (act === 'cancelend') { T.confirm = false; render(); }
    else if (act === 'endsec') { testMove(T.i); endSection(false); }
    else if (act === 'nextsec') { T.si = T.breakFor; T.breakFor = undefined; T.i = 0; T.qStart = Date.now(); render(); window.scrollTo(0, 0); }
    else if (act === 'rw') { view.onlyWrong = b.dataset.v === '1'; render(); }
    else if (act === 'askreset') { view.reset = true; render(); }
    else if (act === 'noreset') { view.reset = false; render(); }
    else if (act === 'setpin') { const pin = document.getElementById('pp-pin').value.trim(); if (!/^\d{4,8}$/.test(pin)) { view.pmsg = 'Use 4 to 8 digits.'; render(); return; } S.parent = { pin: pinHash(pin), lock: document.getElementById('pp-lock').checked }; view.parentOk = true; view.pmsg = 'Saved.'; save(); render(); }
    else if (act === 'unlockparent') { if (pinHash(document.getElementById('pp-pin-in').value.trim()) === S.parent.pin) { view.parentOk = true; view.pmsg = ''; } else view.pmsg = 'That PIN doesn’t match.'; render(); }
    else if (act === 'savelock') { S.parent.lock = document.getElementById('pp-lock').checked; view.pmsg = 'Saved.'; save(); render(); }
    else if (act === 'droppin') { S.parent = { pin: '', lock: false }; view.parentOk = false; view.pmsg = 'PIN removed. Every chapter is open.'; save(); render(); }
    else if (act === 'mkcode') { packState().then((c) => { view.code = c; view.codeMsg = ''; render(); }); }
    else if (act === 'copycode') { const ta = document.getElementById('pp-code-out'); navigator.clipboard.writeText(view.code).then(() => toast('<div>Code copied.</div>'), () => { ta.focus(); ta.select(); }); }
    else if (act === 'usecode') { unpackState(document.getElementById('pp-code-in').value).then((inc) => { S = merge(S, inc); save(); view.codeMsg = `Added! You now have ${S.answered} answers and ${Object.keys(S.badges).length} badges here.`; render(); }, () => { view.codeMsg = 'That code didn’t work. Copy the whole code and try again.'; render(); }); }
    else if (act === 'doreset') { const keepName = S.name, keepParent = S.parent; S = blank(); S.name = keepName; S.parent = keepParent; save(); view.reset = false; toast('<div>Progress erased.</div>'); render(); }
  });
  app.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form="profile"]');
    if (!f) return;
    e.preventDefault();
    S.name = document.getElementById('pp-name').value.trim().slice(0, 24);
    S.sound = document.getElementById('pp-sound').checked;
    save(); toast('<div>Saved.</div>'); go('home');
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.matches && e.target.matches('input, textarea')) return;
    const k = e.key.toLowerCase();
    const idx = '12345'.indexOf(k) >= 0 ? '12345'.indexOf(k) : 'abcde'.indexOf(k);
    if (view.name === 'quiz' && Q) {
      const q = qAt(Q, Q.i);
      if (!Q.answers[Q.i] && idx >= 0 && idx < q.opts.length) { e.preventDefault(); answer(idx); }
      else if (Q.answers[Q.i] && (k === 'arrowright' || (k === 'enter' && !(document.activeElement && document.activeElement.matches('button, summary, a'))))) { e.preventDefault(); next(); }
    } else if (view.name === 'test' && T && !T.paused && T.breakFor === undefined) {
      const q = tq(T.si, T.i);
      if (idx >= 0 && idx < q.opts.length) { T.secs[T.si].picks[T.i] = idx; render(); }
      else if (k === 'arrowright') testMove(T.i + 1);
      else if (k === 'arrowleft') testMove(T.i - 1);
    }
  });

  // keep an in-progress quiz or test alive across live updates of the page
  try {
    if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ token, view, Q: Q && Object.assign({}, Q, { qs: [] }), T: T && Object.assign({}, T, { secs: T.secs.map((s) => Object.assign({}, s, { qs: [] })) }) }));
  } catch (e) { /* not in a viewer */ }

  function start(data) {
    document.body.insertAdjacentHTML('afterbegin', PP.fig.DEFS);
    if (data && data.view) {
      token = data.token || ''; view = data.view; Q = data.Q || null; T = data.T || null;
      if (T && view.name === 'test') { clearInterval(timer); timer = setInterval(tick, 1000); }
      render();
    } else route(location.hash.slice(1));
    Sync.init();
  }
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();
