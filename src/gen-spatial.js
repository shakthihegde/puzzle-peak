'use strict';
// Space & Logic chapters: mental rotation, see-through card overlays (NNAT spatial),
// cube nets, counting cubes, OLSAT following directions, ordering logic.
(function () {
  const F = PP.fig, { mc, num, fmt } = PP, svg = F.svg;
  const cell = (inner, q) => `<div class="cell${q ? ' q' : ''}">${inner}</div>`;

  // ---------- polyomino helpers ----------
  const norm = (cs) => { const mx = Math.min(...cs.map((c) => c[0])), my = Math.min(...cs.map((c) => c[1])); return cs.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const ckey = (cs) => norm(cs).map((c) => c.join(',')).join(';');
  const rot90 = (cs) => norm(cs.map(([x, y]) => [-y, x])); // clockwise on screen
  const flipX = (cs) => norm(cs.map(([x, y]) => [-x, y]));
  const rots = (cs) => { const out = [norm(cs)]; for (let i = 0; i < 3; i++) out.push(rot90(out[out.length - 1])); return out; };
  function grow(r, n) {
    const cs = [[0, 0]]; const has = (x, y) => cs.some((c) => c[0] === x && c[1] === y);
    while (cs.length < n) { const [x, y] = r.pick(cs); const [dx, dy] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!has(x + dx, y + dy)) cs.push([x + dx, y + dy]); }
    return norm(cs);
  }
  const marked = (cs, mk) => F.cellsSvg(cs, { minSpan: 4, fill: (c) => (mk && c[0] === mk[0] && c[1] === mk[1] ? '#e0613f' : '#5fb3a6') });

  // ================= ROTATION =================
  function rotation(r, lvl) {
    const n = lvl === 1 ? r.int(4, 5) : lvl === 2 ? r.int(5, 6) : r.int(6, 7);
    let base;
    for (let t = 0; t < 40; t++) {
      const g = grow(r, n), R = rots(g), keys = new Set(R.map(ckey)), M = rots(flipX(g));
      if (keys.size === 4 && !M.some((m) => keys.has(ckey(m)))) { base = g; break; }
    }
    if (!base) throw new Error('no chiral shape');
    const R = rots(base), M = rots(flipX(base));
    const mirrorQ = lvl > 1 && r.chance(0.4);
    const turnName = ['not turned', 'turned a quarter turn clockwise', 'turned upside down (half turn)', 'turned a quarter turn counter-clockwise'];
    if (!mirrorQ) {
      const k = r.int(1, 3);
      const wrongs = M.map((m) => ({ h: marked(m), k: ckey(m), why: 'This one is a mirror image (flipped over). Turning can never make it match.' }));
      const res = mc(r, { h: marked(R[k]), k: ckey(R[k]) }, r.shuffle(wrongs), lvl === 1 ? 4 : 5);
      return Object.assign({ prompt: 'Which shape is the same as the first shape, just turned around? (No flipping!)', stem: `<div class="srow">${cell(marked(base))}</div>`, optStyle: 'fig',
        explain: `<p>The answer is the shape <b>${turnName[k]}</b>.</p><p>All the other choices are mirror images: you would have to pick the shape up and flip it over to make them.</p><p>Tip: pick one corner square, and follow where it goes as the shape turns.</p>` }, res);
    }
    const ans = flipX(base);
    const wrongs = R.map((x, i) => ({ h: marked(x), k: ckey(x), why: i === 0 ? 'That is the shape unchanged. A mirror swaps left and right.' : 'That is the shape turned, not reflected.' }))
      .concat(M.slice(1).map((x) => ({ h: marked(x), k: ckey(x), why: 'That is a mirror image that has also been turned. A mirror doesn’t turn things.' })));
    const res = mc(r, { h: marked(ans), k: ckey(ans) }, r.shuffle(wrongs), 5);
    return Object.assign({ prompt: 'A mirror stands to the right of this shape. Which picture shows its reflection in the mirror?', stem: `<div class="srow">${cell(marked(base))}<div class="mirror" aria-hidden="true"></div></div>`, optStyle: 'fig',
      explain: '<p>A mirror swaps left and right, but keeps top and bottom the same. Squares that stick out to the left now stick out to the right.</p><p>The reflection is never turned.</p>' }, res);
  }

  // ================= OVERLAY (see-through cards) =================
  const PTS = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) PTS.push([x, y]);
  const SEGS = [];
  for (let y = 0; y < 3; y++) for (let x = 0; x < 2; x++) SEGS.push([y * 3 + x, y * 3 + x + 1]);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 3; x++) SEGS.push([y * 3 + x, (y + 1) * 3 + x]);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { SEGS.push([y * 3 + x, (y + 1) * 3 + x + 1]); SEGS.push([y * 3 + x + 1, (y + 1) * 3 + x]); }
  const segFlip = (si) => { const [a, b] = SEGS[si].map((p) => { const [x, y] = PTS[p]; return (y * 3) + (2 - x); }); return SEGS.findIndex((s) => (s[0] === a && s[1] === b) || (s[0] === b && s[1] === a)); };
  const cardSvg = (set) => svg(`<rect x="6" y="6" width="88" height="88" rx="4" fill="#fff" stroke="#c9cfdb" stroke-width="1.5"/>${PTS.map(([x, y]) => `<circle cx="${18 + x * 32}" cy="${18 + y * 32}" r="2.6" fill="#b5bccb"/>`).join('')}${[...set].map((si) => { const [a, b] = SEGS[si]; return `<line x1="${18 + PTS[a][0] * 32}" y1="${18 + PTS[a][1] * 32}" x2="${18 + PTS[b][0] * 32}" y2="${18 + PTS[b][1] * 32}" stroke="${F.INK}" stroke-width="5" stroke-linecap="round"/>`; }).join('')}`);
  const skey = (set) => [...set].sort((a, b) => a - b).join(',');
  function overlay(r, lvl) {
    const nCards = lvl === 3 && r.chance(0.5) ? 3 : 2;
    const flipB = lvl === 3 && nCards === 2;
    const per = lvl === 1 ? 2 : 3;
    const cards = [];
    for (let c = 0; c < nCards; c++) cards.push(new Set(r.sample(PP.range(SEGS.length), per)));
    const eff = cards.map((s, i) => (flipB && i === 1 ? new Set([...s].map(segFlip)) : s));
    const ans = new Set(eff.flatMap((s) => [...s]));
    if (ans.size < per * nCards - 1) throw new Error('too much overlap');
    const opt = (set, why) => ({ h: cardSvg(set), k: skey(set), why });
    const wrongs = [];
    [...ans].forEach((si) => { const s = new Set(ans); s.delete(si); wrongs.push(opt(s, 'A line is missing. Every line from every card shows through.')); });
    const extra = r.pick(PP.range(SEGS.length).filter((i) => !ans.has(i)));
    wrongs.push(opt(new Set([...ans, extra]), 'There is an extra line that isn’t on any card.'));
    if (flipB) wrongs.push(opt(new Set([...cards[0], ...cards[1]]), 'The second card has to be flipped over first.'));
    wrongs.push(opt(new Set([...ans].map(segFlip)), 'That is a mirror image of the answer.'));
    const moved = new Set(ans); const rem = r.pick([...ans]); moved.delete(rem); moved.add(extra); wrongs.push(opt(moved, 'One line is in the wrong place.'));
    const res = mc(r, opt(ans), r.shuffle(wrongs.slice(0, 3)).concat(wrongs.slice(3)), 5);
    const prompt = flipB ? 'The cards are see-through. The second card is flipped over left-to-right, then laid on top of the first card. What do you see?' : `These ${nCards === 2 ? 'two' : 'three'} see-through cards are stacked on top of each other. What do you see?`;
    return Object.assign({ prompt, stem: `<div class="srow">${cards.map((s, i) => cell(cardSvg(s)) + (i < cards.length - 1 ? '<span class="arr">+</span>' : '')).join('')}</div>`, optStyle: 'fig',
      explain: `<p>When see-through cards are stacked, <b>every</b> line from every card shows.${flipB ? ' But first the second card is flipped, so its lines swap left and right.' : ''}</p><p>The answer has ${ans.size} lines. Check them one card at a time.</p>` }, res);
  }

  // ================= CUBE NETS =================
  // fold simulation: roll a cube over the net; valid iff the six squares land on six different faces
  const V = { add: (a, b) => a.map((v, i) => v + b[i]), neg: (a) => a.map((v) => -v), eq: (a, b) => a.every((v, i) => v === b[i]) };
  function foldFaces(cells) {
    const key = (c) => c.join(',');
    const idx = new Map(cells.map((c, i) => [key(c), i]));
    const st = []; st[0] = { d: [0, 0, -1], n: [0, -1, 0], e: [1, 0, 0] };
    const q = [0];
    while (q.length) {
      const i = q.shift(); const [x, y] = cells[i]; const o = st[i];
      const moves = [[1, 0, (s) => ({ d: s.e, e: V.neg(s.d), n: s.n })], [-1, 0, (s) => ({ d: V.neg(s.e), e: s.d, n: s.n })], [0, -1, (s) => ({ d: s.n, n: V.neg(s.d), e: s.e })], [0, 1, (s) => ({ d: V.neg(s.n), n: s.d, e: s.e })]];
      for (const [dx, dy, f] of moves) { const j = idx.get(key([x + dx, y + dy])); if (j !== undefined && !st[j]) { st[j] = f(o); q.push(j); } }
    }
    return st.map((s) => s.d);
  }
  const validNet = (cells) => { const fs = foldFaces(cells).map((f) => f.join(',')); return new Set(fs).size === 6; };
  const freeKey = (cs) => { const all = rots(cs).concat(rots(flipX(cs))).map(ckey).sort(); return all[0]; };
  let HEX = null;
  function hexominoes() {
    if (HEX) return HEX;
    let cur = new Map([[ckey([[0, 0]]), [[0, 0]]]]);
    for (let n = 1; n < 6; n++) {
      const next = new Map();
      for (const cs of cur.values()) for (const [x, y] of cs) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (cs.some((c) => c[0] === x + dx && c[1] === y + dy)) continue;
        const nc = norm(cs.concat([[x + dx, y + dy]])); const k = freeKey(nc); if (!next.has(k)) next.set(k, nc);
      }
      cur = next;
    }
    const all = [...cur.values()];
    HEX = { valid: all.filter(validNet), invalid: all.filter((c) => !validNet(c)) };
    return HEX;
  }
  const has2x2 = (cs) => cs.some(([x, y]) => [[1, 0], [0, 1], [1, 1]].every(([a, b]) => cs.some((c) => c[0] === x + a && c[1] === y + b)));
  const randOrient = (r, cs) => { let c = cs; for (let k = r.int(0, 3); k > 0; k--) c = rot90(c); return r.chance(0.5) ? flipX(c) : c; };
  const netSvg = (cs, labels) => F.cellsSvg(cs, { minSpan: 4, fill: () => '#ffd56b', label: labels ? (c, i) => labels[i] : null });
  const whyBad = (cs) => has2x2(cs) ? 'This one can’t fold into a cube: it has a 2×2 block of squares, and those can’t all fold around one corner.' : 'This one can’t fold into a cube: when you fold it, two squares end up on the same side and one side is left open.';
  function cubeNets(r, lvl) {
    const H = hexominoes();
    const type = lvl === 1 ? 'which' : lvl === 2 ? r.pick(['which', 'cannot']) : r.pick(['cannot', 'opposite', 'opposite']);
    if (type === 'which' || type === 'cannot') {
      const good = type === 'which' ? 1 : 3;
      const vs = r.sample(H.valid, good).map((c) => randOrient(r, c));
      const bs = r.sample(H.invalid, 6).map((c) => randOrient(r, c));
      if (type === 'which') {
        const res = mc(r, { h: netSvg(vs[0]), k: ckey(vs[0]) }, bs.map((b) => ({ h: netSvg(b), k: ckey(b), why: whyBad(b) })), 4);
        return Object.assign({ prompt: 'Which of these can be folded along the lines to make a cube?', stem: '', optStyle: 'fig',
          explain: '<p>Imagine one square as the bottom of the cube, then fold the others up around it. In a good net every square becomes a different face.</p><p>Quick checks: a net with a 2×2 block never works, and a row of more than 4 squares never works.</p>' }, res);
      }
      const bad = bs[0];
      const res = mc(r, { h: netSvg(bad), k: ckey(bad) }, vs.map((v) => ({ h: netSvg(v), k: ckey(v), why: 'This one does fold into a cube.' })).concat(bs.slice(1).map((b) => ({ h: netSvg(b), k: ckey(b), why: '' }))), 4);
      return Object.assign({ prompt: 'Which of these can <b>NOT</b> be folded into a cube?', stem: '', optStyle: 'fig', explain: `<p>${whyBad(bad)}</p><p>The other three fold up with each square on its own side.</p>` }, res);
    }
    const net = randOrient(r, r.pick(H.valid));
    const L = r.shuffle(['A', 'B', 'C', 'D', 'E', 'F']);
    const faces = foldFaces(net);
    const xi = r.int(0, 5);
    const oi = faces.findIndex((f) => V.eq(f, V.neg(faces[xi])));
    const others = PP.range(6).filter((i) => i !== xi && i !== oi);
    const res = mc(r, { h: `<span class="big-letter">${L[oi]}</span>`, k: L[oi] }, r.shuffle(others).map((i) => ({ h: `<span class="big-letter">${L[i]}</span>`, k: L[i], why: `${L[i]} ends up next to ${L[xi]} (they share an edge), not opposite.` })), 5);
    const [ax, ay] = net[xi], [bx, by] = net[oi];
    const inLine = (ax === bx && Math.abs(ay - by) === 2 && net.some((c) => c[0] === ax && c[1] === (ay + by) / 2)) || (ay === by && Math.abs(ax - bx) === 2 && net.some((c) => c[1] === ay && c[0] === (ax + bx) / 2));
    return Object.assign({ prompt: `This net is folded into a cube. Which letter ends up on the side <b>opposite</b> ${L[xi]}?`, stem: `<div class="srow big">${cell(netSvg(net, L))}</div>`, optStyle: 'text',
      explain: `<p><b>${L[oi]}</b> is opposite ${L[xi]}.</p><p>${inLine ? `They are in a straight line with one square between them. Squares like that always end up opposite each other.` : 'Fold it in your head: pick ' + L[xi] + ' as the bottom, fold the squares next to it up as walls, and the one left over becomes the top.'}</p><p>Tip: squares that touch along an edge can never be opposite.</p>` }, res);
  }

  // ================= COUNTING CUBES =================
  function cubeCount(r, lvl) {
    const W = lvl === 1 ? 2 : r.int(2, 3), D = lvl === 3 ? 3 : r.int(2, 3), Hm = lvl === 1 ? 2 : 3;
    const h = PP.range(W).map(() => PP.range(D).map(() => 0));
    for (let x = 0; x < W; x++) for (let y = 0; y < D; y++) {
      const lim = Math.min(x > 0 ? h[x - 1][y] : Hm, y > 0 ? h[x][y - 1] : Hm);
      h[x][y] = x === 0 && y === 0 ? r.int(Math.max(1, Hm - 1), Hm) : r.int(lvl === 1 ? 1 : 0, lim);
    }
    const total = PP.sum(h.flat());
    if (total < 4) throw new Error('small');
    const a = 17.3, b = 10, cz = 20;
    const P = (x, y, z) => [(x - y) * a, (x + y) * b - z * cz];
    const cubes = [];
    for (let x = 0; x < W; x++) for (let y = 0; y < D; y++) for (let z = 0; z < h[x][y]; z++) cubes.push([x, y, z]);
    cubes.sort((p, q) => p[0] + p[1] + p[2] - (q[0] + q[1] + q[2]) || p[2] - q[2]);
    const face = (pts, fill) => `<polygon points="${pts.map(([x, y, z]) => P(x, y, z).map((v) => Math.round(v * 10) / 10).join(',')).join(' ')}" fill="${fill}" stroke="${F.INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
    let g = '';
    for (const [x, y, z] of cubes) {
      g += face([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], '#f4f6fa');
      g += face([[x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x + 1, y, z]], '#7cc4b8');
      g += face([[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x, y + 1, z]], '#b9e1da');
    }
    const minX = -D * a - 4, maxX = W * a + 4, minY = -Hm * cz - 4, maxY = (W + D) * b + 4;
    const pic = `<svg viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" class="diagram iso" aria-hidden="true">${g}</svg>`;
    const hidden = cubes.filter(([x, y, z]) => z + 1 < h[x][y] && x + 1 < W && h[x + 1][y] > z && y + 1 < D && h[x][y + 1] > z).length;
    const tops = h.flat().filter((v) => v > 0).length;
    const wrongs = [];
    if (hidden) wrongs.push(num(total - hidden, 'That counts only the cubes you can see. Some cubes are hidden underneath, holding the others up.'));
    wrongs.push(num(tops, 'That counts only the top faces. Some stacks are more than one cube tall.'));
    wrongs.push(num(total - 1, 'One cube is missing from the count. Did you count the hidden ones?'));
    const res = mc(r, num(total), wrongs.concat(PP.nearMiss(total)), 5);
    const view = `<table class="topview">${PP.range(D).map((y) => `<tr>${PP.range(W).map((x) => `<td>${h[x][y]}</td>`).join('')}</tr>`).join('')}</table>`;
    return Object.assign({ prompt: 'How many cubes are in this stack? (Every cube is resting on the table or on another cube, so some may be hidden.)', stem: `<div class="srow">${pic}</div>`,
      explain: `<p>Count each stack from the top. Seen from above, the heights are:</p>${view}<p>${h.flat().filter((v) => v).join(' + ')} = <b>${total}</b> cubes.</p>` }, res);
  }

  // ================= FOLLOWING DIRECTIONS (OLSAT) =================
  const DIR8 = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const WORDS6 = ['GARDEN', 'PLANET', 'BRIDGE', 'CASTLE', 'FOREST', 'MARBLE', 'POCKET', 'TURTLE', 'WINTER', 'ROCKET', 'SILVER', 'JUNGLE', 'PENCIL', 'BASKET', 'DRAGON', 'MONKEY', 'ISLAND', 'PURPLE', 'ORANGE', 'FROZEN'];
  const letterOpts = (r, ans, pool, why) => mc(r, { h: `<span class="big-letter">${ans}</span>`, k: ans }, r.shuffle(pool.filter((x) => x !== ans)).map((x) => ({ h: `<span class="big-letter">${x}</span>`, k: x, why })), 5);
  const DIRS = [
    (r, lvl) => {
      const [who] = PP.names(r, 1), n = lvl + 1, TURN = { right: 2, left: -2, around: 4, 'half-right': 1, 'half-left': -1 };
      const start = r.pick([0, 2, 4, 6]); let d = start; const steps = [], trail = [];
      for (let i = 0; i < n; i++) {
        let opts = lvl === 3 ? ['right', 'left', 'half-right', 'half-left', 'around'] : lvl === 2 ? ['right', 'left', 'around'] : ['right', 'left'];
        if (steps.includes('around')) opts = opts.filter((o) => o !== 'around');
        const t = r.pick(opts); steps.push(t); d = (d + TURN[t] + 8) % 8; trail.push(DIR8[d]);
      }
      const say = { right: 'turns right', left: 'turns left', around: 'turns all the way around', 'half-right': 'turns 45° to the right', 'half-left': 'turns 45° to the left' };
      const pool = steps.some((s) => s.startsWith('half')) ? DIR8 : ['north', 'east', 'south', 'west'];
      return { p: `${who} is facing <b>${DIR8[start]}</b>. ${who} ${steps.map((s) => say[s]).join(', then ')}. Which way is ${who} facing now?`,
        ...mc(r, { h: PP.cap(DIR8[d]), k: d }, r.shuffle(pool.map((x) => DIR8.indexOf(x)).filter((x) => x !== d)).map((x) => ({ h: PP.cap(DIR8[x]), k: x, why: 'Draw a compass and turn step by step. A right turn moves clockwise: north → east → south → west.' })), 4),
        ex: `Start facing ${DIR8[start]}: ${steps.map((s, i) => `${say[s].replace('turns ', '')} → ${trail[i]}`).join(', ')}. Final answer: <b>${DIR8[d]}</b>. (45° is half of a right turn, like north → northeast.)`.replace(lvl === 3 ? '' : ' (45° is half of a right turn, like north → northeast.)', lvl === 3 ? '' : '') };
    },
    (r, lvl) => { const w = r.pick(WORDS6); const k = r.int(1, lvl === 1 ? 3 : 5); const fromEnd = r.chance(0.5); const ans = fromEnd ? w[w.length - k] : w[k - 1]; if (w.split('').filter((c) => c === ans).length > 1) throw new Error('dup'); return { p: `In the word <b>${w}</b>, which letter is ${PP.ord(k)} from the ${fromEnd ? 'end' : 'start'}?`, ...letterOpts(r, ans, w.split(''), `Count again, starting from the ${fromEnd ? 'last' : 'first'} letter as 1.`), ex: `${w.split('').map((c, i) => (c === ans && (fromEnd ? i === w.length - k : i === k - 1) ? `<b>${c}</b>` : c)).join(' ')}: the ${PP.ord(k)} letter from the ${fromEnd ? 'end' : 'start'} is <b>${ans}</b>.` }; },
    (r, lvl) => { const k = r.int(3, lvl === 1 ? 6 : 10); const ans = ABC[25 - (k - 1)]; return { p: `If the alphabet were written backwards (Z, Y, X …), which letter would be ${PP.ord(k)}?`, ...letterOpts(r, ans, [ABC[25 - k], ABC[25 - k + 2], ABC[k - 1], ABC[25 - k - 1], ABC[26 - k + 2]].filter(Boolean), 'Count back from Z, with Z as number 1.'), ex: `Z is 1st, Y is 2nd, X is 3rd … the ${PP.ord(k)} is <b>${ans}</b>.` }; },
    (r) => { const [a, b, c] = r.sample(WORDS6, 3); const both = [...new Set(a.split(''))].filter((x) => b.includes(x) && !c.includes(x)); if (both.length !== 1) throw new Error('not unique'); const pool = [...new Set((a + b + c).split(''))]; return { p: `Which letter is in BOTH <b>${a}</b> and <b>${b}</b>, but NOT in <b>${c}</b>?`, ...letterOpts(r, both[0], pool, 'Check all three words, letter by letter.'), ex: `Letters in both ${a} and ${b}: ${[...new Set(a.split(''))].filter((x) => b.includes(x)).join(', ')}. Of those, only <b>${both[0]}</b> is not in ${c}.` }; },
    (r, lvl) => { const t = r.int(0, 6), off = r.pick([-1, 1]), k = r.int(2, lvl === 1 ? 4 : 9); const today = (t - off + 7) % 7; const ans = (today + 1 + k) % 7; return { p: `If ${off === 1 ? 'yesterday' : 'tomorrow'} was${off === 1 ? '' : ' going to be'} <b>${DAYS[t]}</b>, what day will it be ${k} days after tomorrow?`.replace('was going to be', 'is'), ...mc(r, { h: DAYS[ans], k: ans }, PP.range(7).filter((x) => x !== ans).map((x) => ({ h: DAYS[x], k: x, why: 'First work out what day TODAY is, then tomorrow, then count on.' })), 4), ex: `${off === 1 ? 'Yesterday' : 'Tomorrow'} is ${DAYS[t]}, so today is ${DAYS[today]} and tomorrow is ${DAYS[(today + 1) % 7]}. ${k} days after that is <b>${DAYS[ans]}</b>.` }; },
    (r, lvl) => { const a = r.int(0, 16), b = a + r.int(3, 9); const ans = b - a - 1; return { p: `How many letters come <b>between</b> ${ABC[a]} and ${ABC[b]} in the alphabet?`, ...mc(r, num(ans), [num(ans + 1, `That counts ${ABC[b]} too. “Between” leaves out both end letters.`), num(ans + 2, 'That counts both end letters.'), num(ans - 1, 'You missed one.')].concat(PP.nearMiss(ans)), 4), ex: `${ABC.slice(a + 1, b).split('').join(', ')}: <b>${ans}</b> letters.` }; },
    (r, lvl) => { const front = r.int(2, 9), back = r.int(2, 9); const tot = front + back - 1; const [n] = PP.names(r, 1); return { p: `Some children stand in a line. ${n} is ${PP.ord(front)} from the front and ${PP.ord(back)} from the back. How many children are in the line?`, ...mc(r, num(tot), [num(front + back, `That counts ${n} twice.`), num(front + back - 2, `${n} has to be counted once.`)].concat(PP.nearMiss(tot)), 4), ex: `${front - 1} children are in front of ${n}, and ${back - 1} are behind. ${front - 1} + 1 + ${back - 1} = <b>${tot}</b>.` }; },
    (r, lvl) => { const s = r.int(2, 9), ops = []; let v = s; const n = lvl + 2; for (let i = 0; i < n; i++) { const o = r.pick(['×2', '+', '−', '×3']); if (o === '×2') { v *= 2; ops.push('Double it'); } else if (o === '×3') { if (v > 30) { v += 4; ops.push('Add 4'); continue; } v *= 3; ops.push('Multiply by 3'); } else if (o === '+') { const k = r.int(2, 9); v += k; ops.push('Add ' + k); } else { const k = r.int(1, Math.min(9, v - 1)); v -= k; ops.push('Subtract ' + k); } } return { p: `Start with <b>${s}</b>. ${ops.join('. ')}. What number do you have now?`, ...mc(r, num(v), PP.nearMiss(v, 2), 4), ex: `${s} → ${(() => { let x = s; return ops.map((o) => { if (o === 'Double it') x *= 2; else if (o === 'Multiply by 3') x *= 3; else if (o.startsWith('Add')) x += +o.split(' ')[1]; else x -= +o.split(' ')[1]; return x; }).join(' → '); })()} = <b>${v}</b>` }; },
  ];
  function directions(r, lvl) {
    const pool = lvl === 1 ? [0, 1, 2, 5, 7] : lvl === 2 ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 3, 4, 6, 7];
    const d = DIRS[r.pick(pool)](r, lvl);
    return { prompt: d.p, stem: '', opts: d.opts, ans: d.ans, why: d.why, explain: `<p class="work">${d.ex}</p>` };
  }

  // ================= LOGIC: ORDERING PUZZLES =================
  const ATTRS = [['taller', 'shorter', 'tallest', 'shortest'], ['older', 'younger', 'oldest', 'youngest'], ['faster', 'slower', 'fastest', 'slowest'], ['heavier', 'lighter', 'heaviest', 'lightest']];
  function perms(a) { if (a.length <= 1) return [a]; const out = []; a.forEach((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).forEach((p) => out.push([x].concat(p)))); return out; }
  function logic(r, lvl) {
    const n = lvl === 3 ? 5 : 4;
    const names = PP.names(r, n);
    const order = r.shuffle(PP.range(n)); // order[0] = most
    const rank = []; order.forEach((p, i) => { rank[p] = i; });
    const [more, less, most, least] = r.pick(ATTRS);
    const qType = lvl === 1 ? r.pick(['most', 'least']) : r.pick(['most', 'least', 'second', 'secondLeast']);
    const target = { most: order[0], least: order[n - 1], second: order[1], secondLeast: order[n - 2] }[qType];
    const qText = { most: `Who is the ${most}?`, least: `Who is the ${least}?`, second: `Who is the second ${most}?`, secondLeast: `Who is the second ${least}?` }[qType];
    const all = perms(PP.range(n));
    const pairs = []; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (rank[a] < rank[b]) pairs.push([a, b]);
    const clues = [];
    let cand = all;
    const ansOf = (p) => ({ most: p[0], least: p[n - 1], second: p[1], secondLeast: p[n - 2] }[qType]);
    for (const [a, b] of r.shuffle(pairs)) {
      if (new Set(cand.map(ansOf)).size === 1) break;
      const next = cand.filter((p) => p.indexOf(a) < p.indexOf(b));
      if (next.length === cand.length) continue;
      clues.push([a, b]); cand = next;
    }
    if (new Set(cand.map(ansOf)).size !== 1) throw new Error('not unique');
    if (clues.length < n - 1) throw new Error('too easy');
    const txt = clues.map(([a, b]) => (r.chance(0.5) ? `${names[a]} is ${more} than ${names[b]}.` : `${names[b]} is ${less} than ${names[a]}.`));
    const fullKnown = cand.length === 1;
    const res = mc(r, { h: names[target], k: target }, PP.range(n).filter((i) => i !== target).map((i) => ({ h: names[i], k: i, why: `Check the clues again. Line everyone up from ${most} to ${least}.` })), Math.min(5, n));
    return { prompt: `${txt.join(' ')} <b>${qText}</b>`, stem: '', ...res,
      explain: `<p>Turn every clue into “A is above B” and build a line from ${most} to ${least}:</p><p class="work">${fullKnown ? order.map((i) => names[i]).join(' → ') : `Not everyone’s place is known, but every possible order gives the same answer.`}</p><p>So the answer is <b>${names[target]}</b>.</p>` };
  }

  PP.addChapter({ id: 'rotation', group: 'spatial', name: 'Turn & Mirror', exams: 'Spatial reasoning · WISC-style', gen: rotation,
    tip: 'Turning a shape never changes which way it “curls”. A mirror image does. Track one special square as you turn.' });
  PP.addChapter({ id: 'overlay', group: 'spatial', name: 'See-Through Cards', exams: 'NNAT spatial visualization', gen: overlay,
    tip: 'Every line on every card shows when they are stacked. Check the cards one at a time against each answer.' });
  PP.addChapter({ id: 'cube-nets', group: 'spatial', name: 'Cube Nets', exams: 'Spatial reasoning · Kangaroo', gen: cubeNets, nOpts: 4,
    tip: 'Choose a bottom square, then fold the neighbours up. Squares in a line with one between them end up opposite.' });
  PP.addChapter({ id: 'cube-count', group: 'spatial', name: 'Counting Cubes', exams: 'Spatial reasoning · Kangaroo', gen: cubeCount,
    tip: 'Count stack by stack, from the back. A cube sitting high up must have cubes underneath holding it up.' });
  PP.addChapter({ id: 'directions', group: 'spatial', name: 'Following Directions', exams: 'OLSAT verbal comprehension', gen: directions, nOpts: 4,
    tip: 'Do exactly one step at a time, and write down where you are after each step.' });
  PP.addChapter({ id: 'logic', group: 'spatial', name: 'Logic Lines', exams: 'OLSAT inference · Kangaroo', gen: logic,
    tip: 'Draw a ladder. Put each person on it as you read the clues. “Shorter than” means lower on the ladder.' });
})();
