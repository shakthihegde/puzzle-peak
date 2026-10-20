'use strict';
// Figural chapters: CogAT/CCAT nonverbal battery (matrices, folding, classification),
// NNAT (pattern completion, serial reasoning), OLSAT figure series.
(function () {
  const F = PP.fig, { mc } = PP, C = F.clone, svg = F.svg, fn = (f) => F.fillName[f];
  const cell = (inner, q) => `<div class="cell${q ? ' q' : ''}">${inner}</div>`;

  // ================= FIGURE MATRICES (A is to B as C is to ?) =================
  function makeT(id, r) {
    switch (id) {
      case 'fill': { const [p, q] = r.sample(F.FILLS, 2); return { tag: 'fill', init: (s) => { s.f = p; }, apply: (s) => { s.f = q; }, text: `changes from ${fn(p)} to ${fn(q)}`, wrong: (s) => F.FILLS.filter((x) => x !== q).map((x) => ({ sp: Object.assign(C(s), { f: x }), why: x === p ? 'The colour didn’t change here, but it does in the top row.' : `The colour should become ${fn(q)}, like in the top row.` })) }; }
      case 'size': { const up = r.chance(0.5); return { tag: 'size', size: true, init: (s) => { s.z = up ? 1 : 3; }, apply: (s) => { s.z = up ? 3 : 1; }, text: up ? 'gets bigger' : 'gets smaller', wrong: (s) => [{ sp: Object.assign(C(s), { z: 2 }), why: `Not ${up ? 'big' : 'small'} enough. Compare the sizes in the top row.` }, { sp: Object.assign(C(s), { z: up ? 1 : 3 }), why: 'The size should change, like in the top row.' }] }; }
      case 'count': { return { tag: 'count', init: (s) => { s.n = r.int(1, 3); }, apply: (s) => { s.n += 1; }, text: 'gets one more shape', wrong: (s) => [{ sp: Object.assign(C(s), { n: s.n + 2 }), why: 'That adds two shapes. The top row adds just one.' }, { sp: C(s), why: 'The number should go up by one.' }] }; }
      case 'double': { return { tag: 'count', init: (s) => { s.n = r.int(1, 3); }, apply: (s) => { s.n *= 2; }, text: 'doubles the number of shapes', wrong: (s) => [{ sp: Object.assign(C(s), { n: s.n + 1 }), why: 'The top row doubles the number of shapes. This only adds one.' }, { sp: C(s), why: 'The number of shapes should double.' }] }; }
      case 'inner': { return { tag: 'inner', init: (s) => { s.in = null; }, apply: (s) => { s.in = { s: 'circle' }; }, text: 'gets a dot inside', wrong: (s) => [{ sp: Object.assign(C(s), { in: { s: 'square' } }), why: 'The thing added in the top row is a round dot, not a square.' }, { sp: Object.assign(C(s), { in: null }), why: 'A dot should be added inside, like in the top row.' }] }; }
      case 'rot90': case 'rot180': case 'rot45': case 'rotccw': {
        const deg = { rot90: 90, rot180: 180, rot45: 45, rotccw: -90 }[id];
        const txt = { 90: 'turns a quarter turn clockwise (90°)', 180: 'turns upside down (a half turn)', 45: 'turns an eighth of a turn clockwise (45°)', '-90': 'turns a quarter turn counter-clockwise' }[deg];
        return { tag: 'rot', need: 'rot', init: (s) => { s.r = r.pick(deg === 45 ? [0, 45, 90, 180, 270] : [0, 90, 180, 270]); }, apply: (s) => { s.r += deg; }, text: txt,
          wrong: (s) => [{ sp: Object.assign(C(s), { r: s.r - deg }), why: 'That turns the wrong way.' }, { sp: Object.assign(C(s), { r: s.r + 2 * deg }), why: 'That turns too far.' }, { sp: Object.assign(C(s), { r: s.r + deg + 180 }), why: 'Check how far the shape turns in the top row.' }, { sp: F.mirror(s), why: 'That is flipped like a mirror image, not turned.' }, { sp: C(s), why: 'The shape should turn, like in the top row.' }] };
      }
      case 'mirror': return { tag: 'rot', need: 'chiral', init: (s) => { s.r = r.pick([0, 90, 180, 270]); }, apply: (s) => { const m = F.mirror(s); s.r = m.r; s.fl = m.fl; }, text: 'flips over left-to-right, like a mirror image',
        wrong: (s) => { const fl = F.mirror(s); return [{ sp: Object.assign(C(s), { r: s.r + 90 }), why: 'That is turned, not flipped.' }, { sp: Object.assign(C(s), { r: s.r + 180 }), why: 'That is turned upside down, not flipped.' }, { sp: Object.assign(C(fl), { r: fl.r + 180 }), why: 'That is flipped top-to-bottom. The top row flips left-to-right.' }, { sp: C(s), why: 'The shape should flip, like in the top row.' }]; } };
      case 'sides': return { tag: 'shape', need: 'poly', init: () => {}, apply: (s) => { s.s = F.POLY[F.POLY.indexOf(s.s) + 1]; }, text: 'gets one more side',
        wrong: (s) => { const i = F.POLY.indexOf(s.s); return [F.POLY[i + 2], F.POLY[i - 1], F.POLY[i]].filter(Boolean).map((x) => ({ sp: Object.assign(C(s), { s: x }), why: `Count the sides: the top row gains exactly one side.` })); } };
    }
  }
  const SIMPLE = ['fill', 'size', 'count', 'inner', 'rot90', 'rot180'];
  const ADV = ['rot45', 'rotccw', 'mirror', 'sides', 'double'];
  function matrices(r, lvl) {
    let ids;
    if (lvl === 1) ids = [r.pick(SIMPLE)];
    else if (lvl === 2) ids = r.chance(0.5) ? [r.pick(ADV)] : r.sample(SIMPLE, 2);
    else ids = [r.pick(ADV), r.pick(SIMPLE)];
    const ts = ids.map((id) => makeT(id, r));
    const tags = ts.map((t) => t.tag);
    if (new Set(tags).size !== tags.length) throw new Error('dup tag');
    if (tags.includes('size') && tags.includes('count')) throw new Error('size+count');
    const needs = ts.map((t) => t.need).filter(Boolean);
    if (needs.includes('poly') && needs.length > 1) throw new Error('need conflict');
    const pool = needs.includes('poly') ? ['triangle', 'square', 'pentagon'] : needs.includes('chiral') ? ['lshape', 'flag', 'arrow', 'pac', 'moon'] : needs.includes('rot') ? F.ROT : F.BASIC.concat(['arrow', 'moon']);
    const [sA, sC] = r.sample(pool, 2);
    const base = (s) => ({ s, f: r.pick(F.FILLS), z: 3, r: 0, n: 1 });
    const A = base(sA), Cc = base(sC);
    if (!needs.length && F.ROT.includes(sA)) A.r = r.pick([0, 90, 180, 270]);
    if (!needs.length && F.ROT.includes(sC)) Cc.r = r.pick([0, 90, 180, 270]);
    ts.forEach((t) => { t.init(A); t.init(Cc); });
    const run = (s, list) => { const o = C(s); list.forEach((t) => t.apply(o)); return o; };
    const B = run(A, ts), D = run(Cc, ts);
    if (F.key(A) === F.key(B) || F.key(Cc) === F.key(D)) throw new Error('no visible change');
    const wrongs = [F.opt(Cc, 'That is the bottom-left picture unchanged. Something has to change, like in the top row.')];
    if (ts.length > 1) ts.forEach((t, i) => wrongs.push(F.opt(run(Cc, ts.filter((_, j) => j !== i)), `Only part of the rule. Don’t forget: the shape also ${t.text}.`)));
    ts.forEach((t, i) => { const pre = run(Cc, ts.filter((_, j) => j !== i)); t.wrong(pre).forEach((w) => wrongs.push(F.opt(w.sp, w.why))); });
    wrongs.push(F.opt(B, 'That copies the top-right picture. The bottom row starts with a different shape.'));
    wrongs.push(F.opt(Object.assign(C(D), { f: r.pick(F.FILLS.filter((x) => x !== D.f)) }), 'The colour is not right.'));
    wrongs.push(F.opt(Object.assign(C(D), { s: sA }), 'The shape should stay the same kind as the bottom-left picture.'));
    const m = mc(r, F.opt(D), r.shuffle(wrongs.slice(0, 3)).concat(wrongs.slice(3)), 5);
    const sz = ts.some((t) => t.size);
    const stem = `<div class="mx2">${cell(svg(A))}<span class="arr">→</span>${cell(svg(B))}${cell(svg(Cc))}<span class="arr">→</span>${cell(F.blank(), 1)}</div>`;
    return Object.assign({ prompt: 'The top two pictures go together. Which picture goes with the bottom one in the same way?', stem, optStyle: 'fig',
      explain: `<p>In the top row, the shape <b>${ts.map((t) => t.text).join('</b> and <b>')}</b>.</p><p>Do the same to ${F.desc(Cc, { size: sz })}: it ${ts.map((t) => t.text).join(' and ')}${tags.includes('rot') ? '' : `, giving ${F.desc(D, { size: sz })}`}.</p>` }, m);
  }

  // ================= PATTERN GRIDS (3×3 serial reasoning) =================
  const ATTR = { s: 'shape', n: 'number of shapes', f: 'colour', r: 'direction', z: 'size' };
  const vdesc = (a, v, sp) => a === 's' ? F.nameOf(v, 2) : a === 'n' ? `${PP.words[v]} shape${v > 1 ? 's' : ''}` : a === 'f' ? fn(v) : a === 'r' ? `pointing ${F.dirName(v)}` : F.sizeName[v];
  const DEP = { row: (i) => i, col: (i, j) => j, latA: (i, j) => (i + j) % 3, latB: (i, j) => (j - i + 3) % 3 };
  function patternGrid(r, lvl) {
    const PLANS = {
      1: [{ s: 'row', n: 'col' }, { s: 'col', f: 'row' }, { s: 'latA' }, { r: 'col', f: 'row' }, { f: 'latA', s: 'row' }],
      2: [{ s: 'latA', f: 'row' }, { s: 'latA', n: 'col' }, { f: 'latA', n: 'row', s: 'col' }, { r: 'latA', f: 'row' }, { s: 'latB', f: 'col' }],
      3: [{ s: 'latA', f: 'latB' }, { s: 'latA', n: 'latB' }, { s: 'latB', f: 'latA', n: 'col' }, { r: 'latA', f: 'latB' }, { s: 'latA', f: 'latB', n: 'row' }],
    };
    const plan = r.pick(PLANS[lvl]);
    const rotShape = r.pick(['arrow', 'pac', 'heart', 'flag']);
    const dom = {
      s: plan.r ? [rotShape, rotShape, rotShape] : r.sample(F.BASIC, 3),
      n: [1, 2, 3], f: r.sample(F.FILLS, 3),
      r: r.pick([[0, 90, 180], [270, 0, 90], [0, 45, 90], [180, 225, 270]]), z: [1, 2, 3],
    };
    if (plan.n && plan.n !== 'col') dom.n = r.shuffle([1, 2, 3]);
    const constVal = { s: dom.s[0], n: 1, f: r.pick(F.FILLS), r: 0, z: 3 };
    if (!plan.f && plan.s && !plan.n) constVal.f = r.pick(['w', 'b', 'h']);
    const at = (i, j) => {
      const sp = { s: constVal.s, n: constVal.n, f: constVal.f, r: constVal.r, z: constVal.z };
      for (const a in plan) sp[a] = dom[a][DEP[plan[a]](i, j)];
      if (sp.n > 1) sp.z = 3;
      return sp;
    };
    const ans = at(2, 2);
    const rows = [0, 1, 2].map((i) => [0, 1, 2].map((j) => at(i, j)));
    const html = `<div class="mx3">${rows.flat().map((sp, k) => (k === 8 ? cell(F.blank(), 1) : cell(svg(sp)))).join('')}</div>`;
    const wrongs = [];
    const attrs = Object.keys(plan);
    for (const a of attrs) for (const v of dom[a]) if (v !== ans[a]) wrongs.push(F.opt(Object.assign(C(ans), { [a]: v }), `The ${ATTR[a]} is wrong. ${ruleText(a, plan[a], dom[a], ans[a])}`));
    wrongs.push(F.opt(rows[2][1], 'That copies the box to its left.'));
    wrongs.push(F.opt(rows[1][2], 'That copies the box above.'));
    if (attrs.length > 1) for (const a of attrs) for (const b of attrs) if (a < b) wrongs.push(F.opt(Object.assign(C(ans), { [a]: dom[a][(dom[a].indexOf(ans[a]) + 1) % 3], [b]: dom[b][(dom[b].indexOf(ans[b]) + 1) % 3] }), `Both the ${ATTR[a]} and the ${ATTR[b]} are wrong.`));
    wrongs.push(F.opt(Object.assign(C(ans), { f: F.FILLS.find((x) => !dom.f.includes(x)) || 'g' }), 'That colour isn’t used in this grid.'));
    const m = mc(r, F.opt(ans), r.shuffle(wrongs.slice(0, 4)).concat(wrongs.slice(4)), 5);
    function ruleText(a, dep, d, v) {
      if (dep === 'row') return `In each row the ${ATTR[a]} stays the same, and the bottom row uses ${vdesc(a, v)}.`;
      if (dep === 'col') return `Going across each row, the ${ATTR[a]} goes ${d.map((x) => vdesc(a, x)).join(', then ')}. So the last box has ${vdesc(a, v)}.`;
      return `Each row and each column has one of each ${ATTR[a]}: ${d.map((x) => vdesc(a, x)).join(', ')}. The bottom row is still missing ${vdesc(a, v)}.`;
    }
    return Object.assign({ prompt: 'Which picture completes the pattern?', stem: html, optStyle: 'fig',
      explain: attrs.map((a) => `<p>${ruleText(a, plan[a], dom[a], ans[a])}</p>`).join('') + `<p>So the answer is ${F.desc(ans)}.</p>` }, m);
  }

  // ================= FIGURE SERIES =================
  function figSeries(r, lvl) {
    const all = ['rot', 'dot', 'fill', 'count'];
    let rules = lvl === 1 ? [r.pick(all)] : lvl === 2 ? r.sample(all, 2) : r.sample(['rot', 'dot', 'fill'], 3);
    if (rules.includes('rot') && rules.includes('count') && lvl < 3) rules = ['rot', 'dot'];
    const p = {};
    p.s = rules.includes('rot') ? r.pick(['arrow', 'pac', 'flag', 'moon']) : r.pick(F.BASIC);
    p.rStep = lvl === 3 ? r.pick([45, -45, 90, -90]) : r.pick([90, -90, 45]);
    p.r0 = r.pick([0, 90, 180, 270]);
    p.dStep = lvl === 3 ? r.pick([2, 3, -1, -2]) : r.pick([1, 2, -1]);
    p.d0 = r.int(0, 7);
    p.fills = lvl === 3 ? r.sample(F.FILLS, 3) : r.sample(F.FILLS, r.pick([2, 3]));
    const fConst = r.pick(['w', 'b', 'h']);
    const term = (i) => ({
      s: p.s, frame: true, z: 3,
      r: rules.includes('rot') ? p.r0 + p.rStep * i : 0,
      dot: rules.includes('dot') ? (((p.d0 + p.dStep * i) % 8) + 8) % 8 : undefined,
      f: rules.includes('fill') ? p.fills[i % p.fills.length] : fConst,
      n: rules.includes('count') ? i + 1 : 1,
    });
    const terms = [0, 1, 2, 3].map(term), ans = term(4);
    const wrongs = [];
    const prev = term(3), next = term(5);
    const mix = (src, a) => { const o = C(ans); if (a === 'rot') { o.r = src.r; } else if (a === 'dot') o.dot = src.dot; else if (a === 'fill') o.f = src.f; else o.n = src.n; return o; };
    const WHY = { rot: 'The turning is off. ', dot: 'The dot is in the wrong place. ', fill: 'The colour is wrong. ', count: 'The number of shapes is wrong. ' };
    for (const a of rules) {
      wrongs.push(F.opt(mix(prev, a), WHY[a] + 'It looks like it didn’t move on from the last box.'));
      wrongs.push(F.opt(mix(next, a), WHY[a] + 'That skips a step.'));
      if (a === 'rot') wrongs.push(F.opt(Object.assign(C(ans), { r: prev.r - p.rStep }), WHY.rot + 'That turns the wrong way.'));
      if (a === 'dot') wrongs.push(F.opt(Object.assign(C(ans), { dot: (((prev.dot - p.dStep) % 8) + 8) % 8 }), WHY.dot + 'That moves the wrong way.'));
      if (a === 'rot') wrongs.push(F.opt(F.mirror(ans), WHY.rot + 'That is a mirror image.'));
      if (a === 'fill') wrongs.push(F.opt(Object.assign(C(ans), { f: F.FILLS.find((x) => !p.fills.includes(x)) || 'g' }), WHY.fill + 'That colour isn’t in the pattern.'));
      if (a === 'count') wrongs.push(F.opt(Object.assign(C(ans), { n: 6 }), WHY.count));
    }
    wrongs.push(F.opt(prev, 'That is the same as the last box.'));
    if (!rules.includes('count')) wrongs.push(F.opt(Object.assign(C(ans), { n: 2 }), 'The number of shapes never changes.'));
    if (!rules.includes('dot')) wrongs.push(F.opt(Object.assign(C(ans), { dot: r.int(0, 7) }), 'There is no dot in this pattern.'));
    wrongs.push(F.opt(Object.assign(C(ans), { z: 2 }), 'The size never changes.'));
    wrongs.push(F.opt(Object.assign(C(ans), { s: r.pick(F.BASIC.filter((x) => x !== p.s)) }), 'The shape itself never changes.'));
    const m = mc(r, F.opt(ans), r.shuffle(wrongs), 5);
    const say = [];
    if (rules.includes('rot')) say.push(`The ${F.SH[p.s].name} turns ${Math.abs(p.rStep)}° ${p.rStep > 0 ? 'clockwise' : 'counter-clockwise'} each step.`);
    if (rules.includes('dot')) say.push(`The dot moves ${Math.abs(p.dStep)} place${Math.abs(p.dStep) > 1 ? 's' : ''} ${p.dStep > 0 ? 'clockwise' : 'counter-clockwise'} around the box each step.`);
    if (rules.includes('fill')) say.push(`The colours repeat: ${p.fills.map(fn).join(', ')}, then start again.`);
    if (rules.includes('count')) say.push('Each box has one more shape than the one before.');
    return Object.assign({ prompt: 'The pictures change in a pattern from left to right. Which picture comes next?', stem: `<div class="srow">${terms.map((t) => cell(svg(t))).join('')}${cell(F.blank(), 1)}</div>`, optStyle: 'fig', explain: say.map((s) => `<p>${s}</p>`).join('') }, m);
  }

  // ================= FIGURE CLASSIFICATION =================
  const FAM = { 3: ['triangle', 'rtri'], 4: ['square', 'rect', 'diamond', 'trap'] };
  function figClassify(r, lvl) {
    const kinds = lvl === 1 ? ['shape', 'fill', 'count', 'inner'] : lvl === 2 ? ['shape', 'fill', 'count', 'inner', 'sides'] : ['sides', 'fillcount', 'sidesfill', 'inner'];
    const kind = r.pick(kinds);
    let mk, ok, prop, viol;
    const others = (arr, x) => arr.filter((v) => v !== x);
    const anyShape = F.BASIC.concat(['arrow', 'moon']);
    if (kind === 'shape') {
      const s = r.pick(anyShape);
      mk = (good) => ({ s: good ? s : r.pick(others(anyShape, s)), f: r.pick(F.FILLS), r: F.ROT.includes(s) || s === 'triangle' ? r.pick([0, 90, 180, 270]) : 0, n: 1, z: 3 });
      prop = `${F.nameOf(s, 2)}`; ok = (sp) => sp.s === s; viol = (sp) => `This is a ${F.SH[sp.s].name}, not a ${F.SH[s].name}.`;
    } else if (kind === 'fill') {
      const f = r.pick(F.FILLS);
      mk = (good) => ({ s: r.pick(anyShape), f: good ? f : r.pick(others(F.FILLS, f)), r: 0, n: 1, z: 3 });
      prop = `${fn(f)}`; ok = (sp) => sp.f === f; viol = (sp) => `This one is ${fn(sp.f)}, not ${fn(f)}.`;
    } else if (kind === 'count') {
      const k = r.int(2, 4);
      mk = (good) => ({ s: r.pick(F.BASIC), f: r.pick(F.FILLS), r: 0, n: good ? k : r.pick(others([1, 2, 3, 4, 5], k)), z: 3 });
      prop = `groups of ${PP.words[k]} shapes`; ok = (sp) => sp.n === k; viol = (sp) => `This one has ${sp.n} shape${sp.n > 1 ? 's' : ''}, not ${k}.`;
    } else if (kind === 'inner') {
      mk = (good) => ({ s: r.pick(['circle', 'square', 'hexagon', 'pentagon', 'diamond', 'heart', 'octagon']), f: r.pick(['w', 'h', 'g', 'b']), r: 0, n: 1, z: 3, in: good ? { s: 'circle' } : r.chance(0.3) ? { s: 'square' } : null });
      prop = 'shapes with a dot inside'; ok = (sp) => sp.in && sp.in.s === 'circle'; viol = (sp) => (sp.in ? 'This has a square inside, not a dot.' : 'This one has nothing inside.');
    } else if (kind === 'sides' || kind === 'sidesfill') {
      const k = r.pick([3, 4]);
      const wrongShapes = ['pentagon', 'hexagon', 'circle', 'star', 'octagon', 'cross'].concat(FAM[7 - k]);
      const f = r.pick(F.FILLS);
      mk = (good, alt) => {
        const sideOk = kind === 'sides' ? good : good || alt === 1;
        const fillOk = kind === 'sides' ? true : good || alt === 2;
        return { s: sideOk ? r.pick(FAM[k]) : r.pick(wrongShapes), f: kind === 'sides' ? r.pick(F.FILLS) : fillOk ? f : r.pick(others(F.FILLS, f)), r: r.pick([0, 90, 180, 270]), n: 1, z: 3 };
      };
      prop = kind === 'sides' ? `shapes with exactly ${k} sides` : `${fn(f)} shapes with ${k} sides`;
      ok = (sp) => F.SH[sp.s].sides === k && (kind === 'sides' || sp.f === f);
      viol = (sp) => (F.SH[sp.s].sides !== k ? `A ${F.SH[sp.s].name} doesn’t have ${k} sides.` : `It has ${k} sides, but it is ${fn(sp.f)}.`);
    } else {
      const k = r.int(2, 3), f = r.pick(F.FILLS);
      mk = (good, alt) => ({ s: r.pick(F.BASIC), f: good || alt === 1 ? f : r.pick(others(F.FILLS, f)), n: good || alt === 2 ? k : r.pick(others([1, 2, 3, 4], k)), r: 0, z: 3 });
      prop = `groups of ${PP.words[k]} ${fn(f)} shapes`; ok = (sp) => sp.n === k && sp.f === f;
      viol = (sp) => (sp.f !== f ? `This group is ${fn(sp.f)}, not ${fn(f)}.` : `This group has ${sp.n} shapes, not ${k}.`);
    }
    // examples: must vary in shape and colour unless that is the rule
    let ex;
    for (let t = 0; t < 30; t++) {
      ex = [mk(true), mk(true), mk(true)];
      const vary = (a) => new Set(ex.map((e) => (a === 's' ? F.SH[e.s].name : e[a]))).size > 1;
      const needS = !['shape'].includes(kind), needF = !['fill', 'sidesfill', 'fillcount'].includes(kind);
      if ((!needS || vary('s')) && (!needF || vary('f')) && new Set(ex.map(F.key)).size === 3) break;
      ex = null;
    }
    if (!ex) throw new Error('examples');
    const exKeys = new Set(ex.map(F.key));
    let good = null;
    for (let t = 0; t < 20 && !good; t++) { const g = mk(true); if (!exKeys.has(F.key(g))) good = g; }
    if (!good) throw new Error('good');
    const wrongs = [];
    for (let t = 0; t < 60 && wrongs.length < 10; t++) {
      const w = mk(false, (t % 3) + (kind === 'sidesfill' || kind === 'fillcount' ? 0 : 9));
      if (ok(w) || exKeys.has(F.key(w))) continue;
      wrongs.push(F.opt(w, viol(w)));
    }
    const m = mc(r, F.opt(good), wrongs, 5);
    return Object.assign({ prompt: 'The three pictures in the top box are alike in some way. Which picture below goes with them?', stem: `<div class="srow ex">${ex.map((e) => cell(svg(e))).join('')}</div>`, optStyle: 'fig',
      explain: `<p>All three are <b>${prop}</b>.</p><p>Only ${F.desc(good)} fits that rule too.</p>` }, m);
  }

  // ================= PAPER FOLDING =================
  const FOLDS = {
    L: { keep: (x, y) => x > 50, m: ([x, y]) => [100 - x, y], hp: [1, 0, -50], line: [[50, 0], [50, 100]], from: [25, 50], to: [75, 50], t: 'the left half is folded over to the right' },
    R: { keep: (x, y) => x < 50, m: ([x, y]) => [100 - x, y], hp: [-1, 0, 50], line: [[50, 0], [50, 100]], from: [75, 50], to: [25, 50], t: 'the right half is folded over to the left' },
    T: { keep: (x, y) => y > 50, m: ([x, y]) => [x, 100 - y], hp: [0, 1, -50], line: [[0, 50], [100, 50]], from: [50, 25], to: [50, 75], t: 'the top half is folded down' },
    B: { keep: (x, y) => y < 50, m: ([x, y]) => [x, 100 - y], hp: [0, -1, 50], line: [[0, 50], [100, 50]], from: [50, 75], to: [50, 25], t: 'the bottom half is folded up' },
    D: { keep: (x, y) => y > x, m: ([x, y]) => [y, x], hp: [-1, 1, 0], line: [[0, 0], [100, 100]], from: [70, 30], to: [30, 70], t: 'the top-right corner is folded down to the bottom-left' },
    E: { keep: (x, y) => x + y < 100, m: ([x, y]) => [100 - y, 100 - x], hp: [-1, -1, 100], line: [[100, 0], [0, 100]], from: [70, 70], to: [30, 30], t: 'the bottom-right corner is folded up to the top-left' },
  };
  function clip(poly, [a, b, c]) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i], Q = poly[(i + 1) % poly.length];
      const fp = a * P[0] + b * P[1] + c, fq = a * Q[0] + b * Q[1] + c;
      if (fp >= 0) out.push(P);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
    }
    return out;
  }
  const SQ = [[0, 0], [100, 0], [100, 100], [0, 100]];
  const paperSvg = (poly, extra) => `<svg viewBox="-8 -8 116 116" class="fig fold" aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="none" stroke="#c9cfdb" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M${poly.map((p) => p.map((v) => Math.round(v * 10) / 10).join(' ')).join(' L')} Z" fill="#fff" stroke="${F.INK}" stroke-width="2.4" stroke-linejoin="round"/>${extra || ''}</svg>`;
  const centroid = (pts) => [PP.sum(pts.map((p) => p[0])) / pts.length, PP.sum(pts.map((p) => p[1])) / pts.length];
  const foldMarks = (f, poly) => {
    const moving = clip(poly, f.hp.map((v) => -v));
    const from = moving.length ? centroid(moving) : f.from, to = f.m(from);
    const [[x1, y1], [x2, y2]] = f.line, [fx, fy] = from, [tx, ty] = to;
    const mx = (fx + tx) / 2, my = (fy + ty) / 2, nx = -(ty - fy), ny = tx - fx, L = Math.hypot(nx, ny);
    const cx = mx + (nx / L) * 18, cy = my + (ny / L) * 18;
    const ang = Math.atan2(ty - cy, tx - cx), ah = 7;
    const head = `${tx},${ty} ${tx - ah * Math.cos(ang - 0.5)},${ty - ah * Math.sin(ang - 0.5)} ${tx - ah * Math.cos(ang + 0.5)},${ty - ah * Math.sin(ang + 0.5)}`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${F.INK}" stroke-width="2" stroke-dasharray="5 4"/><path d="M${fx} ${fy} Q${cx} ${cy} ${tx} ${ty}" fill="none" stroke="#e0613f" stroke-width="2.6"/><polygon points="${head}" fill="#e0613f"/>`;
  };
  const holeSvg = (hs) => hs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${F.INK}"/>`).join('');
  const hkey = (hs) => hs.map((h) => h.map((v) => Math.round(v)).join(',')).sort().join(';');
  const uniq = (hs) => { const m = new Map(); hs.forEach((h) => m.set(h.map(Math.round).join(','), h)); return [...m.values()]; };
  const unfold = (holes, seq) => { let hs = holes.slice(); for (let i = seq.length - 1; i >= 0; i--) hs = uniq(hs.concat(hs.map(FOLDS[seq[i]].m))); return hs; };
  function folding(r, lvl) {
    const combos = { 1: [['L'], ['R'], ['T'], ['B']], 2: [['D'], ['E'], ['L', 'T'], ['R', 'B'], ['T', 'L'], ['B', 'R']], 3: [['L', 'T'], ['R', 'B'], ['T', 'R'], ['B', 'L'], ['D', 'E'], ['E', 'D']] };
    const seq = r.pick(combos[lvl]);
    const nh = lvl === 1 ? 1 : lvl === 2 ? (seq.length === 1 ? r.int(1, 2) : 1) : r.int(1, 2);
    const grid = []; for (const x of [12.5, 37.5, 62.5, 87.5]) for (const y of [12.5, 37.5, 62.5, 87.5]) grid.push([x, y]);
    const inRegion = (p) => seq.every((k) => FOLDS[k].keep(p[0], p[1])) && Math.abs(p[0] - p[1]) > 1 && Math.abs(p[0] + p[1] - 100) > 1;
    const cand = grid.filter(inRegion);
    if (cand.length < nh) throw new Error('no space');
    const holes = r.sample(cand, nh);
    const ans = unfold(holes, seq);
    // steps
    let poly = SQ;
    const steps = [];
    seq.forEach((k) => { steps.push(paperSvg(poly, foldMarks(FOLDS[k], poly))); poly = clip(poly, FOLDS[k].hp); });
    steps.push(paperSvg(poly, holeSvg(holes)));
    const opt = (hs, why) => ({ h: paperSvg(SQ, holeSvg(hs)), k: hkey(hs), why });
    const wrongs = [opt(holes, 'Those are only the holes you punched. When you unfold, each fold makes a mirror copy of the holes.')];
    if (seq.length > 1) wrongs.push(opt(unfold(holes, seq.slice(1)), 'That only undoes one fold. There were two folds.'));
    const other = { L: 'T', R: 'B', T: 'L', B: 'R', D: 'E', E: 'D' };
    wrongs.push(opt(unfold(holes, seq.map((k) => other[k])), 'The copies are mirrored across the wrong line.'));
    wrongs.push(opt(ans.map(([x, y]) => [100 - x, y]), 'That is the right number of holes in the wrong places. Check which side the holes were on.'));
    wrongs.push(opt(ans.map(([x, y]) => [x, 100 - y]), 'That is the right number of holes in the wrong places. Check which side the holes were on.'));
    if (ans.length > 1) wrongs.push(opt(ans.slice(1), 'A hole is missing.'));
    const extra = r.pick(grid.filter((g) => !ans.some((a) => hkey([a]) === hkey([g]))));
    wrongs.push(opt(ans.concat([extra]), 'There is an extra hole.'));
    wrongs.push(opt(ans.map(([x, y]) => [y, x]), 'Those holes are flipped across the diagonal.'));
    const m = mc(r, opt(ans), wrongs, 5);
    const stem = `<div class="srow fold">${steps.map((s) => `<div class="cell">${s}</div>`).join('<span class="arr">→</span>')}</div>`;
    return Object.assign({ prompt: `A square sheet of paper is folded${seq.length > 1 ? ' twice' : ''} (the dashed line shows the fold). Then holes are punched through all the layers. What does the paper look like when it is opened up?`, stem, optStyle: 'fig',
      explain: `<p>First ${FOLDS[seq[0]].t}${seq[1] ? `, then ${FOLDS[seq[1]].t}` : ''}.</p><p>Every hole goes through all the layers. When you unfold, each fold makes a <b>mirror copy</b> of the holes across the fold line. ${seq.length > 1 ? 'Undo the last fold first.' : ''}</p><p>${holes.length} hole${holes.length > 1 ? 's' : ''} punched × ${2 ** seq.length} layers = <b>${ans.length} holes</b>.</p>` }, m);
  }

  // ================= PATTERN COMPLETION (NNAT) =================
  const MOT = ['t0', 't1', 't2', 't3', 'sl', 'bs', 'dot', 'ring', 'aA', 'aB', 'pl', 'em', 'sq'];
  const MIR = { t0: 't1', t1: 't0', t2: 't3', t3: 't2', sl: 'bs', bs: 'sl', aA: 'aB', aB: 'aA' };
  function motif(m, x, y, u) {
    const P = (pts) => `<polygon points="${pts.map(([a, b]) => `${x + a * u},${y + b * u}`).join(' ')}" fill="${F.INK}"/>`;
    const S = `stroke="${F.INK}" stroke-width="2.2" fill="none"`;
    switch (m) {
      case 't0': return P([[0, 0], [1, 0], [0, 1]]);
      case 't1': return P([[0, 0], [1, 0], [1, 1]]);
      case 't2': return P([[1, 0], [1, 1], [0, 1]]);
      case 't3': return P([[0, 0], [1, 1], [0, 1]]);
      case 'sl': return `<line x1="${x}" y1="${y + u}" x2="${x + u}" y2="${y}" ${S}/>`;
      case 'bs': return `<line x1="${x}" y1="${y}" x2="${x + u}" y2="${y + u}" ${S}/>`;
      case 'dot': return `<circle cx="${x + u / 2}" cy="${y + u / 2}" r="${u * 0.2}" fill="${F.INK}"/>`;
      case 'ring': return `<circle cx="${x + u / 2}" cy="${y + u / 2}" r="${u * 0.3}" ${S}/>`;
      case 'aA': return `<path d="M${x + u / 2} ${y} A${u / 2} ${u / 2} 0 0 1 ${x} ${y + u / 2} M${x + u} ${y + u / 2} A${u / 2} ${u / 2} 0 0 0 ${x + u / 2} ${y + u}" ${S}/>`;
      case 'aB': return `<path d="M${x + u / 2} ${y} A${u / 2} ${u / 2} 0 0 0 ${x + u} ${y + u / 2} M${x} ${y + u / 2} A${u / 2} ${u / 2} 0 0 1 ${x + u / 2} ${y + u}" ${S}/>`;
      case 'pl': return `<path d="M${x + u / 2} ${y + u * 0.2} V${y + u * 0.8} M${x + u * 0.2} ${y + u / 2} H${x + u * 0.8}" ${S}/>`;
      case 'sq': return `<rect x="${x + u * 0.25}" y="${y + u * 0.25}" width="${u * 0.5}" height="${u * 0.5}" fill="${F.INK}"/>`;
      default: return '';
    }
  }
  function patternCompletion(r, lvl) {
    const N = lvl === 1 ? 5 : 6, u = 100 / N;
    const types = lvl === 1 ? ['checker', 'rows', 'cols', 'diag'] : lvl === 2 ? ['diag', 'anti', 'diamond', 'checker3'] : ['mirror', 'diamond', 'anti', 'block'];
    const type = r.pick(types);
    let at, why;
    const ms = r.sample(MOT.filter((m) => m !== 'em'), 3);
    if (type === 'checker') { at = (i, j) => ms[(i + j) % 2]; why = 'The two tiles take turns like a checkerboard.'; }
    else if (type === 'rows') { at = (i) => ms[i % 2]; why = 'Each row is all the same tile, and the rows take turns.'; }
    else if (type === 'cols') { at = (i, j) => ms[j % 2]; why = 'Each column is all the same tile, and the columns take turns.'; }
    else if (type === 'diag') { at = (i, j) => ms[(i + j) % 3]; why = 'The same tile runs along each diagonal (going down to the left), repeating every 3 tiles.'; }
    else if (type === 'anti') { at = (i, j) => ms[(((j - i) % 3) + 3) % 3]; why = 'The same tile runs along each diagonal (going down to the right), repeating every 3 tiles.'; }
    else if (type === 'checker3') { const k = r.pick([2, 3]); at = (i, j) => (Math.floor(i / k) + Math.floor(j / k)) % 2 ? ms[0] : ms[1]; why = `It is a checkerboard of ${k}×${k} blocks.`; }
    else if (type === 'diamond') { const T = r.pick([[['t2', 't3'], ['t1', 't0']], [['t0', 't1'], ['t3', 't2']]]); at = (i, j) => T[i % 2][j % 2]; why = 'The triangles repeat in 2×2 groups, making the same big shape over and over.'; }
    else if (type === 'block') { const B = [[r.pick(MOT), r.pick(MOT)], [r.pick(MOT), r.pick(MOT)]]; if (new Set(B.flat()).size < 3) throw new Error('dull'); at = (i, j) => B[i % 2][j % 2]; why = 'The same 2×2 block of tiles repeats across and down.'; }
    else {
      const half = N / 2; const Q = PP.range(half).map(() => PP.range(half).map(() => r.pick(MOT)));
      const mir = (m) => MIR[m] || m;
      at = (i, j) => { let ii = i, jj = j, flips = 0; if (jj >= half) { jj = N - 1 - jj; flips++; } let m = Q[ii >= half ? N - 1 - ii : ii][jj]; if (flips) m = mir(m); if (ii >= half) m = ({ t0: 't3', t3: 't0', t1: 't2', t2: 't1', sl: 'bs', bs: 'sl', aA: 'aB', aB: 'aA' }[m] || m); return m; };
      why = 'The design is a mirror image: the right half mirrors the left half, and the bottom half mirrors the top half.';
    }
    const pi = r.int(type === 'mirror' ? 0 : 1, N - 2), pj = r.int(0, N - 2);
    const patch = (oi, oj, fx) => [[at(oi, oj), at(oi, oj + 1)], [at(oi + 1, oj), at(oi + 1, oj + 1)]].map((rw) => (fx ? fx(rw) : rw));
    const patchSvg = (P) => svg(`<rect width="100" height="100" fill="#fff"/>${P.flat().map((m, k) => motif(m, (k % 2) * 50, Math.floor(k / 2) * 50, 50)).join('')}<path d="M50 0V100M0 50H100" stroke="#e3e7ef" stroke-width="1"/>`);
    const pkey = (P) => P.flat().join(',');
    const opt = (P, w) => ({ h: patchSvg(P), k: pkey(P), why: w });
    const ans = patch(pi, pj);
    let big = `<rect width="100" height="100" fill="#fff"/>`;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!(i >= pi && i <= pi + 1 && j >= pj && j <= pj + 1)) big += motif(at(i, j), j * u, i * u, u);
    big += `<rect x="${pj * u}" y="${pi * u}" width="${2 * u}" height="${2 * u}" fill="#fff" stroke="#e0613f" stroke-width="1.6" stroke-dasharray="3 2"/><text x="${(pj + 1) * u}" y="${(pi + 1) * u + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#e0613f">?</text>`;
    const wrongs = [];
    const shifts = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [2, 0]];
    for (const [di, dj] of shifts) { const oi = pi + di, oj = pj + dj; if (oi < 0 || oj < 0 || oi > N - 2 || oj > N - 2) continue; wrongs.push(opt(patch(oi, oj), 'That piece comes from a different part of the pattern. Check how it lines up with the tiles around the gap.')); }
    wrongs.push(opt(ans.map((rw) => rw.slice().reverse().map((m) => MIR[m] || m)), 'That piece is flipped (mirror image).'));
    wrongs.push(opt(ans.slice().reverse(), 'The top and bottom rows of that piece are swapped.'));
    const swap = C(ans); swap[1][1] = r.pick(MOT.filter((m) => m !== ans[1][1])); wrongs.push(opt(swap, 'Almost! One tile doesn’t match the pattern.'));
    const swap2 = C(ans); swap2[0][0] = r.pick(MOT.filter((m) => m !== ans[0][0])); wrongs.push(opt(swap2, 'Almost! One tile doesn’t match the pattern.'));
    const m = mc(r, opt(ans), r.shuffle(wrongs.slice(0, 6)).concat(wrongs.slice(6)), 5);
    return Object.assign({ prompt: 'Which piece fits in the empty space to complete the design?', stem: `<div class="bigpat">${svg(big, 'big')}</div>`, optStyle: 'fig', explain: `<p>${why}</p><p>Look at the tiles touching the gap on every side and continue the pattern into it.</p>` }, m);
  }

  PP.addChapter({ id: 'figure-matrices', group: 'figural', name: 'Figure Matrices', exams: 'CogAT · CCAT · NNAT', gen: matrices,
    tip: 'Name what changes from the first picture to the second: colour? size? turning? number? Then make exactly the same change to the third picture.' });
  PP.addChapter({ id: 'pattern-grids', group: 'figural', name: 'Pattern Grids', exams: 'NNAT · Raven-style', gen: patternGrid,
    tip: 'Check each feature on its own: shape, colour, number, direction. Often every row has one of each.' });
  PP.addChapter({ id: 'figure-series', group: 'figural', name: 'Figure Series', exams: 'OLSAT · NNAT', gen: figSeries,
    tip: 'Follow one thing at a time across the boxes: the dot, then the turning, then the colour.' });
  PP.addChapter({ id: 'figure-classify', group: 'figural', name: 'Figure Classification', exams: 'CogAT · CCAT · OLSAT', gen: figClassify,
    tip: 'Find what ALL three pictures share. Count sides, look at colours and count shapes. Then find the only answer that shares it too.' });
  PP.addChapter({ id: 'pattern-completion', group: 'figural', name: 'Pattern Completion', exams: 'NNAT', gen: patternCompletion,
    tip: 'Look at the tiles just outside the gap on every side. The missing piece must continue all of them.' });
  PP.addChapter({ id: 'paper-folding', group: 'figural', name: 'Paper Folding', exams: 'CogAT · CCAT · NNAT', gen: folding,
    tip: 'Each fold doubles the holes. When unfolding, mirror each hole across the fold line, undoing the last fold first.' });
})();
