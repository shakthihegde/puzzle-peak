'use strict';
// Number chapters: CogAT/CCAT quantitative battery, OLSAT number matrix, ISEE quantitative reasoning,
// grade 5-7 math stretch, and Math Kangaroo / Gauss style contest puzzles.
(function () {
  const { fmt, num, nearMiss, mc } = PP;
  const chips = (terms, hole) => `<div class="seq">${terms.map((t, i) => i === hole || t === null ? '<span class="chip q">?</span>' : `<span class="chip">${fmt(t)}</span>`).join('')}${hole === undefined ? '<span class="chip q">?</span>' : ''}</div>`;
  const numQ = (r, n, prompt, stem, ans, wrongs, explain, extra) =>
    Object.assign({ prompt, stem, explain }, mc(r, num(ans), (wrongs || []).filter((w) => ans < 0 || !String(w.k).startsWith('n-')).concat(nearMiss(ans, Math.max(1, Math.round(Math.abs(ans) / 20)))), n), extra || {});
  const gapChain = (t) => t.map((v, i) => i === 0 ? fmt(v) : ` <span class="gap">${t[i] - t[i - 1] >= 0 ? '+' : '−'}${fmt(Math.abs(t[i] - t[i - 1]))}</span> ${fmt(v)}`).join('');
  const opChain = (t, ops) => t.map((v, i) => i === 0 ? fmt(v) : ` <span class="gap">${ops[i - 1]}</span> ${fmt(v)}`).join('');

  // ================= NUMBER SERIES =================
  function series(r, lvl) {
    const L = {
      1: [
        () => { const a = r.int(1, 40), d = r.int(2, 12); const t = PP.range(7).map((i) => a + d * i); return { t, rule: `add ${d} each time`, ch: gapChain(t) }; },
        () => { const d = r.int(3, 9), a = d * 6 + r.int(5, 40); const t = PP.range(7).map((i) => a - d * i); return { t, rule: `subtract ${d} each time`, ch: gapChain(t) }; },
        () => { const a = r.int(1, 6); const t = PP.range(6).map((i) => a * 2 ** i); return { t, rule: 'double the number each time (×2)', ch: opChain(t, t.map(() => '×2')) }; },
        () => { const a = r.int(1, 20), p = r.int(1, 9); let q = r.int(1, 9); if (q === p) q = p + 2; const t = [a]; for (let i = 1; i < 7; i++) t.push(t[i - 1] + (i % 2 ? p : q)); return { t, rule: `the jumps take turns: +${p}, then +${q}, then +${p}…`, ch: gapChain(t) }; },
      ],
      2: [
        () => { const a = r.int(1, 20), k = r.int(1, 4); const t = [a]; for (let i = 1; i < 7; i++) t.push(t[i - 1] + k + i - 1); return { t, rule: `the jump grows by 1 each time (+${k}, +${k + 1}, +${k + 2}…)`, ch: gapChain(t) }; },
        () => { const a = r.int(1, 4), m = r.pick([3, 3, 4]); const t = PP.range(5).map((i) => a * m ** i); return { t, rule: `multiply by ${m} each time`, ch: opChain(t, t.map(() => '×' + m)) }; },
        () => { const p = r.int(5, 12), q = r.int(2, p - 1), a = r.int(5, 30); const t = [a]; for (let i = 1; i < 8; i++) t.push(t[i - 1] + (i % 2 ? p : -q)); return { t, rule: `the steps take turns: +${p}, then −${q}`, ch: gapChain(t) }; },
        () => { const a = r.int(1, 10), p = r.int(2, 6), b = r.int(30, 60), q = r.int(2, 5); const t = []; for (let i = 0; i < 8; i++) t.push(i % 2 ? b - q * ((i - 1) / 2) : a + p * (i / 2)); return { t, rule: `two series are mixed together: every other number goes up by ${p} (${t.filter((_, i) => !(i % 2)).slice(0, 3).join(', ')}…), and the ones in between go down by ${q} (${t.filter((_, i) => i % 2).slice(0, 3).join(', ')}…)`, ch: '' }; },
        () => { const e = r.int(1, 3), x = 2 ** (4 + e) * r.int(1, 3); const t = PP.range(6).map((i) => x / 2 ** i); return { t, rule: 'halve the number each time (÷2)', ch: opChain(t, t.map(() => '÷2')) }; },
        () => { const a = r.int(1, 4), b = r.int(a, a + 4); const t = [a, b]; for (let i = 2; i < 8; i++) t.push(t[i - 1] + t[i - 2]); return { t, rule: 'each number is the sum of the two numbers before it', ch: t.slice(2).map((v, i) => `${t[i]} + ${t[i + 1]} = ${v}`).join(', ') }; },
        () => { const a = r.int(1, 5), s = r.sign(); const t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] * 2 + s); return { t, rule: `double the number, then ${s > 0 ? 'add' : 'subtract'} 1`, ch: opChain(t, t.map(() => s > 0 ? '×2 +1' : '×2 −1')) }; },
      ],
      3: [
        () => { const k = r.int(1, 6), c = r.pick([0, 0, 1, -1, 2]); const t = PP.range(6).map((i) => (k + i) ** 2 + c); return { t, rule: c === 0 ? 'they are square numbers (1×1, 2×2, 3×3…)' : `each number is a square number ${c > 0 ? 'plus' : 'minus'} ${Math.abs(c)}`, ch: t.map((v, i) => `${k + i}×${k + i}${c ? (c > 0 ? '+' : '−') + Math.abs(c) : ''} = ${v}`).join(', ') }; },
        () => { const k = r.int(1, 2); const t = PP.range(5).map((i) => (k + i) ** 3); return { t, rule: 'they are cube numbers (n × n × n)', ch: t.map((v, i) => `${k + i}×${k + i}×${k + i} = ${v}`).join(', ') }; },
        () => { const a = r.int(1, 15), g = r.int(1, 4), s = r.pick([2, 3]); const t = [a]; for (let i = 1; i < 7; i++) t.push(t[i - 1] + g + s * (i - 1)); return { t, rule: `the jumps grow by ${s} each time`, ch: gapChain(t) }; },
        () => { const a = r.int(1, 6), c = r.int(1, 6); const t = [a]; for (let i = 1; i < 8; i++) t.push(i % 2 ? t[i - 1] * 2 : t[i - 1] + c); return { t, rule: `the steps take turns: ×2, then +${c}`, ch: opChain(t, t.map((_, i) => i % 2 ? '+' + c : '×2')) }; },
        () => { const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]; const s = r.int(0, 6); const t = ps.slice(s, s + 7); return { t, rule: 'they are the prime numbers in order (numbers with exactly two factors)', ch: '' }; },
        () => { const s = r.int(1, 4); const t = PP.range(7).map((i) => ((s + i) * (s + i + 1)) / 2); return { t, rule: 'the jumps grow by 1 each time: these are triangle numbers', ch: gapChain(t) }; },
        () => { const a = r.int(1, 20); const t = [a]; for (let i = 1; i < 7; i++) t.push(t[i - 1] + 2 ** (i - 1)); return { t, rule: 'the jump doubles each time (+1, +2, +4, +8…)', ch: gapChain(t) }; },
        () => { const a = r.int(2, 4), c = r.pick([1, 2]); const t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] * 3 - c); return { t, rule: `multiply by 3, then subtract ${c}`, ch: opChain(t, t.map(() => '×3 −' + c)) }; },
        () => { const a = r.int(1, 3); const t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] * (i + 1)); return { t, rule: 'multiply by 2, then 3, then 4, then 5…', ch: opChain(t, t.map((_, i) => '×' + (i + 2))) }; },
        () => { const a = r.int(40, 90), p = r.int(3, 9), b = r.int(1, 10), q = r.int(3, 8); const t = []; for (let i = 0; i < 8; i++) t.push(i % 2 ? b + q * ((i - 1) / 2) : a - p * (i / 2)); return { t, rule: `two series take turns: one goes down by ${p} (${t[0]}, ${t[2]}, ${t[4]}…) and the other goes up by ${q} (${t[1]}, ${t[3]}, ${t[5]}…)`, ch: '' }; },
      ],
    };
    const s = r.pick(L[lvl])();
    const show = s.t.slice(0, -1), ans = s.t[s.t.length - 1];
    if (show.some((v) => v < 0 || !Number.isInteger(v)) || ans < 0) throw new Error('bad');
    const last = show[show.length - 1], prev = show[show.length - 2];
    const wrongs = [
      num(last + (last - prev), `That repeats the last jump (${last - prev >= 0 ? '+' : '−'}${Math.abs(last - prev)}). The rule is: ${s.rule}.`),
      num(ans + 1, 'Very close! Recheck your last step.'), num(ans - 1, 'Very close! Recheck your last step.'),
      num(last + (ans - last) * 2, 'That jumps too far.'),
      num(show[show.length - 2] + (ans - last), 'The jump was added to the wrong number.'),
      num(ans + (last - prev), 'That adds one jump too many.'),
    ];
    return numQ(r, 5, 'Which number comes next in the series?', chips(show), ans, wrongs,
      `<p>The rule: <b>${s.rule}</b>.</p>${s.ch ? `<p class="work">${s.ch} → <b>${fmt(ans)}</b></p>` : `<p class="work">${show.map(fmt).join(', ')}, <b>${fmt(ans)}</b></p>`}`);
  }

  // ================= NUMBER ANALOGIES =================
  const RULES = [];
  for (let k = 1; k <= 25; k++) { RULES.push({ f: (x) => x + k, t: `add ${k}`, lv: 1 }); RULES.push({ f: (x) => x - k, t: `subtract ${k}`, lv: 1 }); }
  for (let k = 2; k <= 10; k++) { RULES.push({ f: (x) => x * k, t: `multiply by ${k}`, lv: k <= 5 ? 1 : 2 }); RULES.push({ f: (x) => (x % k ? NaN : x / k), t: `divide by ${k}`, lv: k <= 5 ? 1 : 2 }); }
  for (let k = 2; k <= 5; k++) for (let m = 1; m <= 9; m++) { RULES.push({ f: (x) => x * k + m, t: `multiply by ${k}, then add ${m}`, lv: 3 }); RULES.push({ f: (x) => x * k - m, t: `multiply by ${k}, then subtract ${m}`, lv: 3 }); }
  for (let k = 2; k <= 4; k++) for (let m = 1; m <= 9; m++) RULES.push({ f: (x) => (x % k ? NaN : x / k + m), t: `divide by ${k}, then add ${m}`, lv: 3 });
  RULES.push({ f: (x) => x * x, t: 'multiply the number by itself', lv: 3 });
  RULES.push({ f: (x) => x * x + 1, t: 'multiply the number by itself, then add 1', lv: 3 });
  for (let m = 1; m <= 9; m++) RULES.push({ f: (x) => (x + m) * 2, t: `add ${m}, then double`, lv: 3 });

  function analogies(r, lvl) {
    const pool = RULES.filter((x) => (lvl === 1 ? x.lv === 1 : lvl === 2 ? x.lv <= 2 && (x.lv === 2 || r.chance(0.5)) : x.lv === 3));
    const rule = r.pick(pool.length ? pool : RULES);
    const inputs = r.sample(PP.range(lvl === 3 ? 12 : 30).map((i) => i + 2), 3);
    const outs = inputs.map(rule.f);
    if (outs.some((v) => !Number.isInteger(v) || v < 0 || v > 999)) throw new Error('bad');
    const ans = outs[2];
    // reject if another rule explains both example pairs but gives a different answer
    for (const g of RULES) if (g.f(inputs[0]) === outs[0] && g.f(inputs[1]) === outs[1] && g.f(inputs[2]) !== ans) throw new Error('ambiguous');
    const wrongs = [];
    const d = outs[0] - inputs[0];
    if (inputs[2] + d !== ans) wrongs.push(num(inputs[2] + d, `That adds ${d} like the first pair, but check the second pair: ${inputs[1]} + ${d} isn't ${outs[1]}.`));
    if (inputs[0] && outs[0] % inputs[0] === 0) { const m = outs[0] / inputs[0]; if (inputs[2] * m !== ans) wrongs.push(num(inputs[2] * m, `That multiplies by ${m} like the first pair only. It doesn't work for the second pair.`)); }
    wrongs.push(num(inputs[2], 'That is the starting number, unchanged.'));
    const d2 = outs[1] - inputs[1]; if (inputs[2] + d2 !== ans) wrongs.push(num(inputs[2] + d2, 'That only matches the second pair.'));
    const stem = `<div class="pairs">${inputs.map((x, i) => `<span class="pair">[ ${fmt(x)} → ${i < 2 ? fmt(outs[i]) : '<b class="qm">?</b>'} ]</span>`).join('')}</div>`;
    return numQ(r, 5, 'Find the rule that changes the first number into the second. Use it on the last pair.', stem, ans, wrongs,
      `<p>The rule is <b>${rule.t}</b>.</p><p class="work">${inputs.map((x, i) => `${fmt(x)} → ${fmt(outs[i])}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</p><p>Always test your rule on <i>both</i> example pairs before using it.</p>`);
  }

  // ================= NUMBER PUZZLES =================
  const SYM = ['▲', '●', '■', '◆', '★'];
  function puzzles(r, lvl) {
    const type = lvl === 1 ? r.pick(['bal', 'bal', 'sym1']) : lvl === 2 ? r.pick(['bal2', 'sym1', 'sym2']) : r.pick(['sym3', 'sym4', 'bal3']);
    if (type === 'bal' || type === 'bal2' || type === 'bal3') {
      const ops = type === 'bal' ? ['+', '−'] : ['+', '−', '×'];
      const rop = r.pick(ops), lop = r.pick(type === 'bal' ? ['+', '−'] : ['+', '−', '×', '÷']);
      let y = r.int(2, 12), z = r.int(1, 9);
      if (rop === '−' && z > y) [y, z] = [z, y];
      const R = rop === '+' ? y + z : rop === '−' ? y - z : y * z;
      const a = r.int(2, 9);
      let x; // ? lop a = R
      if (lop === '+') x = R - a; else if (lop === '−') x = R + a; else if (lop === '×') { if (R % a) throw new Error('x'); x = R / a; } else x = R * a;
      if (x < 0) throw new Error('neg');
      const inv = { '+': '−', '−': '+', '×': '÷', '÷': '×' }[lop];
      const wrongs = [num(R, `${fmt(R)} is the value of the right side. The ? still has to be worked out from it.`)];
      const wrongX = lop === '+' ? R + a : lop === '−' ? R - a : lop === '×' ? R * a : R / a;
      if (Number.isInteger(wrongX) && wrongX >= 0) wrongs.push(num(wrongX, `That does ${lop} ${a} instead of undoing it. To find ?, do the opposite: ${inv} ${a}.`));
      return numQ(r, 5, 'Which number should replace the ? so both sides are equal?', `<div class="eq">? ${lop} ${a} = ${y} ${rop} ${z}</div>`, x, wrongs,
        `<p>First work out the right side: ${y} ${rop} ${z} = <b>${R}</b>.</p><p>So ? ${lop} ${a} = ${R}. Undo it: ${R} ${inv} ${a} = <b>${fmt(x)}</b>.</p><p class="work">Check: ${fmt(x)} ${lop} ${a} = ${R} ✓</p>`);
    }
    const [A, B, C] = r.sample(SYM, 3);
    if (type === 'sym1') {
      const a = r.int(2, 12), b = r.int(1, 12);
      return numQ(r, 5, 'Each shape stands for a number. What number is the last shape?', `<div class="eqs"><div>${A} + ${A} = ${2 * a}</div><div>${A} + ${B} = ${a + b}</div><div>${B} = ?</div></div>`, b,
        [num(a, `That's ${A}, not ${B}.`), num(a + b, `That's the total of ${A} + ${B}.`), num(2 * a, 'That is the first total.')],
        `<p>${A} + ${A} = ${2 * a}, so ${A} = ${2 * a} ÷ 2 = <b>${a}</b>.</p><p>${A} + ${B} = ${a + b}, so ${B} = ${a + b} − ${a} = <b>${b}</b>.</p>`);
    }
    if (type === 'sym2') {
      const a = r.int(2, 9), k = r.int(2, 4), b = r.int(2, 12);
      return numQ(r, 5, 'Each shape stands for a number. What number is the last shape?', `<div class="eqs"><div>${A} × ${k} = ${a * k}</div><div>${B} − ${A} = ${b}</div><div>${B} = ?</div></div>`, a + b,
        [num(b - a >= 0 ? b - a : b + 2 * a, `${B} − ${A} = ${b} means ${B} is ${b} MORE than ${A}.`), num(a, `That is ${A}.`), num(a * k + b, `That adds ${b} to ${a * k}, but ${a * k} is ${A} × ${k}, not ${A}.`)],
        `<p>${A} × ${k} = ${a * k}, so ${A} = ${a * k} ÷ ${k} = <b>${a}</b>.</p><p>${B} − ${a} = ${b}, so ${B} = ${b} + ${a} = <b>${a + b}</b>.</p>`);
    }
    if (type === 'sym3') {
      const a = r.int(5, 20), b = r.int(1, a - 1);
      return numQ(r, 5, 'Each shape stands for a number. What number is the last shape?', `<div class="eqs"><div>${A} + ${B} = ${a + b}</div><div>${A} − ${B} = ${a - b}</div><div>${A} = ?</div></div>`, a,
        [num(b, `That is ${B}.`), num(a + b, 'That is the sum.'), num(a - b, 'That is the difference.')],
        `<p>Add the two equations: (${A} + ${B}) + (${A} − ${B}) = ${a + b} + ${a - b}, so two ${A}s make ${2 * a}.</p><p>${A} = ${2 * a} ÷ 2 = <b>${a}</b>. (And ${B} = ${b}.)</p>`);
    }
    // sym4: chain of three
    const c = r.int(2, 9), d = r.int(2, 6), e = r.int(2, 4);
    const a = c + d, b = e * c;
    return numQ(r, 5, 'Each shape stands for a number. What is the value of the question?', `<div class="eqs"><div>${C} + ${C} + ${C} = ${3 * c}</div><div>${A} = ${C} + ${d}</div><div>${B} = ${C} × ${e}</div><div>${A} + ${B} = ?</div></div>`, a + b,
      [num(a, `That is just ${A}.`), num(b, `That is just ${B}.`), num(c + d + e, 'Those numbers were added instead of using the rules.'), num(a * b, 'That multiplies instead of adding.')],
      `<p>${C} = ${3 * c} ÷ 3 = <b>${c}</b>.</p><p>${A} = ${c} + ${d} = <b>${a}</b>. &nbsp;${B} = ${c} × ${e} = <b>${b}</b>.</p><p>${A} + ${B} = ${a} + ${b} = <b>${a + b}</b>.</p>`);
  }

  // ================= NUMBER GRIDS (OLSAT number matrix) =================
  const GRULES = [
    { f: (a, b) => a + b, t: 'the first number plus the second', lv: 1 },
    { f: (a, b) => a - b, t: 'the first number minus the second', lv: 1 },
    { f: (a, b) => a * b, t: 'the first number times the second', lv: 2 },
    { f: (a, b) => 2 * a + b, t: 'double the first number, then add the second', lv: 3 },
    { f: (a, b) => a + 2 * b, t: 'the first number plus double the second', lv: 3 },
    { f: (a, b) => (a + b) * 2, t: 'add the two numbers, then double', lv: 3 },
    { f: (a, b) => a * b + 1, t: 'multiply the two numbers, then add 1', lv: 3 },
    { f: (a, b) => a * b - a, t: 'multiply the two numbers, then subtract the first', lv: 3 },
    { f: (a, b) => a * a + b, t: 'multiply the first by itself, then add the second', lv: 3 },
    { f: (a, b) => (a % b ? NaN : a / b), t: 'the first number divided by the second', lv: 2 },
  ];
  const gridHtml = (rows, cols) => `<div class="ngrid" style="--cols:${cols}">${rows.flat().map((v) => v === null ? '<span class="q">?</span>' : `<span>${fmt(v)}</span>`).join('')}</div>`;
  function grids(r, lvl) {
    const t = lvl === 1 ? r.pick(['row', 'pyr']) : lvl === 2 ? r.pick(['row', 'pyr', 'magic']) : r.pick(['row', 'pyr', 'magic']);
    if (t === 'row') {
      const pool = GRULES.filter((g) => (lvl === 3 ? g.lv >= 2 : g.lv <= lvl));
      const g = r.pick(pool);
      const rows = [];
      for (let i = 0; i < 3; i++) {
        let a = r.int(2, lvl === 1 ? 20 : 12), b = r.int(1, lvl === 1 ? 15 : 9);
        if (g.t.includes('minus') || g.t.includes('divided')) { if (b >= a) [a, b] = [b + a, b]; }
        if (g.t.includes('divided')) { b = Math.max(2, b); a = b * r.int(2, 9); }
        const c = g.f(a, b);
        if (!Number.isInteger(c) || c < 0) throw new Error('bad');
        rows.push([a, b, c]);
      }
      const ans = rows[2][2];
      for (const h of GRULES) if (h.f(rows[0][0], rows[0][1]) === rows[0][2] && h.f(rows[1][0], rows[1][1]) === rows[1][2] && h.f(rows[2][0], rows[2][1]) !== ans) throw new Error('ambiguous');
      const shown = rows.map((rw, i) => (i === 2 ? [rw[0], rw[1], null] : rw));
      const wrongs = GRULES.filter((h) => h !== g).map((h) => h.f(rows[2][0], rows[2][1])).filter((v) => Number.isInteger(v) && v >= 0).map((v) => num(v, 'That uses a different rule. Test it on the first two rows: it doesn’t work there.'));
      return numQ(r, 5, 'The numbers in each row follow the same rule. Which number replaces the ?', gridHtml(shown, 3), ans, wrongs,
        `<p>In every row, the third number is <b>${g.t}</b>.</p><p class="work">${rows.map((rw) => `${rw[0]}, ${rw[1]} → ${rw[2]}`).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</p>`);
    }
    if (t === 'pyr') {
      const n = lvl === 1 ? 3 : 4;
      const base = PP.range(n).map(() => r.int(1, lvl === 1 ? 9 : 12));
      const rows = [base];
      while (rows[0].length > 1) { const b = rows[0]; rows.unshift(b.slice(1).map((v, i) => b[i] + v)); }
      // rows[0] = top. choose a hidden cell; at lvl3 hide a base cell (needs subtraction)
      let ri, ci;
      if (lvl === 3) { ri = n - 1; ci = r.int(0, n - 1); } else if (lvl === 2 && r.chance(0.5)) { ri = n - 2; ci = r.int(0, n - 2); } else { ri = 0; ci = 0; }
      const ans = rows[ri][ci];
      // what must be shown for solvability: show everything except hidden (and at L3 also hide the top to force reasoning)
      const shown = rows.map((rw, i) => rw.map((v, j) => (i === ri && j === ci ? null : v)));
      let why;
      if (ri === n - 1) {
        const pj = ci > 0 ? ci - 1 : ci; const above = rows[n - 2][pj]; const sib = ci > 0 ? rows[n - 1][ci - 1] : rows[n - 1][ci + 1];
        why = `The block above it is ${above}, and its neighbour is ${sib}. So the missing number is ${above} − ${sib} = <b>${ans}</b>.`;
      } else {
        why = `The two blocks under it are ${rows[ri + 1][ci]} and ${rows[ri + 1][ci + 1]}, so it is ${rows[ri + 1][ci]} + ${rows[ri + 1][ci + 1]} = <b>${ans}</b>.`;
      }
      const html = `<div class="pyr">${shown.map((rw) => `<div>${rw.map((v) => (v === null ? '<span class="q">?</span>' : `<span>${v}</span>`)).join('')}</div>`).join('')}</div>`;
      const wrongs = [num(ri === n - 1 ? ans + 2 * rows[n - 1][ci === 0 ? 1 : ci - 1] : ans - 1, 'Each block equals the two blocks underneath it added together.')];
      if (ri === n - 1) { const pj = ci > 0 ? ci - 1 : ci; wrongs.push(num(rows[n - 2][pj] + (ci > 0 ? rows[n - 1][ci - 1] : rows[n - 1][ci + 1]), 'That adds when you need to subtract: the missing block is underneath.')); }
      return numQ(r, 5, 'In this number wall, each block is the sum of the two blocks right under it. What number goes in the ? block?', html, ans, wrongs, `<p>${why}</p>`);
    }
    // magic square
    const lo = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
    let sq = lo.map((rw) => rw.slice());
    for (let k = r.int(0, 3); k > 0; k--) sq = sq[0].map((_, j) => sq.map((rw) => rw[j]).reverse());
    if (r.chance(0.5)) sq = sq.map((rw) => rw.slice().reverse());
    const m = r.int(1, 3), add = r.int(0, 10);
    sq = sq.map((rw) => rw.map((v) => v * m + add));
    const S = PP.sum(sq[0]);
    const cells = PP.range(9);
    const hideN = lvl === 2 ? 2 : 4;
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (let tries = 0; tries < 50; tries++) {
      const hidden = r.sample(cells, hideN);
      if (!lines.some((l) => l.every((c) => !hidden.includes(c)))) continue;
      // propagate
      const known = new Set(cells.filter((c) => !hidden.includes(c)));
      const steps = [];
      let progress = true;
      while (progress) {
        progress = false;
        for (const l of lines) {
          const unk = l.filter((c) => !known.has(c));
          if (unk.length === 1) { known.add(unk[0]); steps.push([l, unk[0]]); progress = true; }
        }
      }
      if (known.size < 9) continue;
      const target = lvl === 3 ? steps[steps.length - 1][1] : steps[0][1];
      const ans = sq[Math.floor(target / 3)][target % 3];
      const shown = sq.map((rw, i) => rw.map((v, j) => (hidden.includes(i * 3 + j) ? (i * 3 + j === target ? null : '') : v)));
      const html = `<div class="ngrid magic" style="--cols:3">${shown.flat().map((v) => (v === null ? '<span class="q">?</span>' : v === '' ? '<span class="blank"></span>' : `<span>${v}</span>`)).join('')}</div>`;
      const full = lines.find((l) => l.every((c) => !hidden.includes(c)));
      return numQ(r, 5, 'This is a magic square: every row, column and diagonal adds up to the same total. What number replaces the ?', html, ans,
        [num(S, 'That is the magic total, not the missing number.'), num(ans + m, 'Close. Add up the line again.'), num(ans - m, 'Close. Add up the line again.')],
        `<p>A full line tells you the magic total: ${full.map((c) => sq[Math.floor(c / 3)][c % 3]).join(' + ')} = <b>${S}</b>.</p><p>${lvl === 3 ? 'Fill in the empty squares one line at a time, using lines that are missing only one number. ' : ''}The line through the ? gives ${S} minus the other two numbers = <b>${ans}</b>.</p>`);
    }
    throw new Error('magic failed');
  }

  // ================= WORD PROBLEMS (ISEE QR / OLSAT arithmetic reasoning) =================
  const ITEMS = [['sticker', 'stickers'], ['marble', 'marbles'], ['card', 'cards'], ['pencil', 'pencils'], ['cookie', 'cookies'], ['shell', 'shells'], ['stamp', 'stamps']];
  const time = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`; };
  const WP = [
    { lv: 1, f: (r) => { const [n] = PP.names(r, 1); const [it, its] = r.pick(ITEMS); const a = r.int(20, 60), b = r.int(3, 6), c = r.int(4, 10), d = r.int(5, 25); const ans = a + b * c - d; return { text: `${n} has ${a} ${its}. ${n} buys ${b} packs with ${c} ${its} in each pack, then gives ${d} ${its} to a friend. How many ${its} does ${n} have now?`, ans, wrongs: [num(a + b * c, `That forgets the ${d} given away.`), num(a + b + c - d, `${b} packs of ${c} is ${b} × ${c}, not ${b} + ${c}.`), num(a - b * c + d, 'The packs are added and the gift is taken away.')], ex: `${a} + (${b} × ${c}) − ${d} = ${a} + ${b * c} − ${d} = <b>${ans}</b>` }; } },
    { lv: 1, f: (r) => { const [n] = PP.names(r, 1); const k = r.int(3, 8), each = r.int(4, 9), left = r.int(1, k - 1); const tot = k * each + left; return { text: `${n} shares ${tot} cookies equally among ${k} friends and keeps the leftovers. How many cookies does ${n} keep?`, ans: left, wrongs: [num(each, `${each} is how many each friend gets.`), num(k, 'That is the number of friends.'), num(left + k, 'Divide first, then find what is left over.')], ex: `${tot} ÷ ${k} = ${each} with <b>${left}</b> left over (${k} × ${each} = ${k * each}, and ${tot} − ${k * each} = ${left}).` }; } },
    { lv: 1, f: (r) => { const [n] = PP.names(r, 1); const st = r.int(14, 34) * 30 + r.pick([0, 15, 45]), d = r.int(2, 9) * 5 + r.int(1, 2) * 60 * r.int(0, 1); const ans = st + d; return { text: `${n} starts reading at ${time(st)} and reads for ${d >= 60 ? `${Math.floor(d / 60)} hour${d >= 120 ? 's' : ''} ${d % 60 ? `and ${d % 60} minutes` : ''}` : `${d} minutes`}. What time does ${n} stop?`, ans, opt: time, wrongs: [{ h: time(ans + 60), k: ans + 60, why: 'That is one hour too late.' }, { h: time(ans - 10), k: ans - 10, why: 'Count the minutes again.' }, { h: time(st + (d % 60) * 2), k: st + (d % 60) * 2, why: 'Count the minutes again.' }, { h: time(ans + 10), k: ans + 10, why: 'Count the minutes again.' }, { h: time(ans - 60), k: ans - 60, why: 'That is one hour too early.' }], ex: `Start at ${time(st)} and add ${d} minutes → <b>${time(ans)}</b>.` }; } },
    { lv: 2, f: (r) => { const [n] = PP.names(r, 1); const k = r.int(3, 6), p = r.int(35, 95) * 5, bill = Math.ceil((k * p) / 1000 + 0.01) * 1000; const ans = bill - k * p; return { text: `${n} buys ${k} notebooks that cost ${PP.money(p)} each and pays with ${PP.money(bill).replace('.00', '')}. How much change should ${n} get?`, ans, opt: PP.money, wrongs: [{ h: PP.money(bill - p), k: bill - p, why: `That's the change for only one notebook. ${n} bought ${k}.` }, { h: PP.money(k * p), k: k * p, why: 'That is the total cost, not the change.' }, { h: PP.money(ans + 100), k: ans + 100, why: 'Recheck the subtraction.' }, { h: PP.money(ans - 50), k: ans - 50, why: 'Recheck the subtraction.' }, { h: PP.money(ans + 50), k: ans + 50, why: 'Recheck the subtraction.' }], ex: `Cost: ${k} × ${PP.money(p)} = ${PP.money(k * p)}. Change: ${PP.money(bill)} − ${PP.money(k * p)} = <b>${PP.money(ans)}</b>.` }; } },
    { lv: 2, f: (r) => { const [n] = PP.names(r, 1); const p = r.int(6, 15), N = p * r.int(8, 20) + r.int(1, p - 1); const ans = Math.ceil(N / p); return { text: `A book has ${N} pages. ${n} reads ${p} pages every day. How many days will it take ${n} to finish the book?`, ans, wrongs: [num(Math.floor(N / p), `After ${Math.floor(N / p)} days there are still ${N - p * Math.floor(N / p)} pages left, so ${n} needs one more day.`)], ex: `${N} ÷ ${p} = ${Math.floor(N / p)} remainder ${N % p}. The leftover pages need one more day: <b>${ans}</b> days.` }; } },
    { lv: 2, f: (r) => { const [a, b] = PP.names(r, 2); const ba = r.int(5, 10), k = r.int(3, 9), y = r.int(2, 8); const aa = ba + k; const ans = aa + y + ba + y; return { text: `${a} is ${k} years older than ${b}. ${b} is ${ba} now. What will their ages add up to in ${y} years?`, ans, wrongs: [num(aa + ba, `That's their ages now. Both of them get ${y} years older.`), num(aa + ba + y, `Both children get ${y} years older, so add ${y} twice.`), num(aa + y, `That is just ${a}'s age then.`)], ex: `${a} is ${ba} + ${k} = ${aa}. In ${y} years: ${aa + y} + ${ba + y} = <b>${ans}</b>.` }; } },
    { lv: 2, f: (r) => { const d = r.pick([3, 4, 5, 6, 8]), nn = r.int(1, d - 1), tot = d * r.int(4, 10); if (PP.gcd(nn, d) !== 1) throw new Error('x'); const part = (tot / d) * nn; const ans = tot - part; return { text: `There are ${tot} students in a club. ${PP.frac(nn, d)} of them play chess. How many students do <b>not</b> play chess?`, ans, wrongs: [num(part, 'That is how many DO play chess.'), num(tot / d, `That is ${PP.frac(1, d)} of the club.`), num(tot - tot / d, `That takes away only ${PP.frac(1, d)}.`)], ex: `${PP.frac(1, d)} of ${tot} is ${tot / d}, so ${PP.frac(nn, d)} is ${tot / d} × ${nn} = ${part}. Not chess: ${tot} − ${part} = <b>${ans}</b>.` }; } },
    { lv: 2, f: (r) => { const l = r.int(5, 15), w = r.int(3, l - 1), c = r.int(2, 6); const per = 2 * (l + w); const ans = per * c; return { text: `A rectangular garden is ${l} m long and ${w} m wide. Fencing costs $${c} per metre. How much does it cost to put a fence all the way around?`, ans, opt: (v) => '$' + v, wrongs: [{ h: '$' + l * w * c, k: l * w * c, why: 'That uses the area. A fence goes around the edge (perimeter).' }, { h: '$' + (l + w) * c, k: (l + w) * c, why: 'That only covers two sides. A rectangle has four.' }, { h: '$' + per, k: per, why: 'That is the perimeter in metres. Now multiply by the cost.' }, { h: '$' + (ans + c * 2), k: ans + c * 2, why: 'Recheck the perimeter.' }], ex: `Perimeter = ${l} + ${w} + ${l} + ${w} = ${per} m. Cost = ${per} × $${c} = <b>$${ans}</b>.` }; } },
    { lv: 2, f: (r) => { const [n] = PP.names(r, 1); const x = r.int(3, 15), m = r.int(2, 4), a = r.int(2, 12); const res = x * m + a; return { text: `${n} thinks of a number, multiplies it by ${m}, then adds ${a}. The answer is ${res}. What number did ${n} start with?`, ans: x, wrongs: [num(res - a, `That only undoes the +${a}. Now undo the ×${m}.`), num((res + a) / m, 'Undo in reverse order: first subtract, then divide.'), num(res * m + a, 'Work backwards: undo each step.')], ex: `Work backwards: ${res} − ${a} = ${res - a}, then ${res - a} ÷ ${m} = <b>${x}</b>.` }; } },
    { lv: 2, f: (r) => { const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; const s = r.int(0, 6), k = r.int(9, 40); const ans = (s + k) % 7; return { text: `Today is ${DAYS[s]}. What day of the week will it be ${k} days from today?`, ans, opt: (v) => DAYS[v], wrongs: PP.range(7).filter((v) => v !== ans).map((v) => ({ h: DAYS[v], k: v, why: `Every 7 days it is ${DAYS[s]} again. ${k} = ${Math.floor(k / 7)} weeks + ${k % 7} days.` })), ex: `${k} days = ${Math.floor(k / 7)} full weeks and ${k % 7} extra day${k % 7 === 1 ? '' : 's'}. ${k % 7} day${k % 7 === 1 ? '' : 's'} after ${DAYS[s]} is <b>${DAYS[ans]}</b>.` }; } },
    { lv: 2, f: (r) => { const k = r.int(2, 5), p = r.int(2, 9) * k, m = r.int(6, 12); if (m === k) throw new Error('x'); const ans = (p / k) * m; return { text: `${k} pens cost $${p}. At the same price, how much do ${m} pens cost?`, ans, opt: (v) => '$' + v, wrongs: [{ h: '$' + (p + m - k), k: p + m - k, why: 'Find the cost of ONE pen first, then multiply.' }, { h: '$' + p * m, k: p * m, why: `$${p} is for ${k} pens, not one pen.` }, { h: '$' + p / k, k: p / k, why: 'That is the price of one pen.' }, { h: '$' + (ans + p / k), k: ans + p / k, why: 'That is one pen too many.' }], ex: `One pen costs $${p} ÷ ${k} = $${p / k}. ${m} pens cost ${m} × $${p / k} = <b>$${ans}</b>.` }; } },
    { lv: 3, f: (r) => { const H = r.int(8, 20), cows = r.int(2, H - 2); const L = cows * 4 + (H - cows) * 2; return { text: `A farm has chickens and cows. Altogether there are ${H} heads and ${L} legs. How many cows are there?`, ans: cows, wrongs: [num(H - cows, 'That is the number of chickens.'), num(L / 4, 'Not every animal has 4 legs.'), num(Math.round(L / 6), 'Try: if every animal were a chicken, how many legs would there be?')], ex: `If all ${H} animals were chickens: ${H * 2} legs. There are ${L - H * 2} extra legs, and each cow adds 2 extra. Cows = ${L - H * 2} ÷ 2 = <b>${cows}</b>.` }; } },
    { lv: 3, f: (r) => { const [n] = PP.names(r, 1); const k = 3, avg = r.int(75, 88), sc = PP.range(k).map(() => r.int(avg - 10, avg + 8)); const tgt = avg + 2; const need = tgt * 4 - PP.sum(sc); if (need > 100 || need < 50) throw new Error('x'); return { text: `${n} scored ${sc.join(', ')} on three tests. What score does ${n} need on the fourth test to have an average of ${tgt}?`, ans: need, wrongs: [num(tgt, `Scoring ${tgt} only works if the others already average ${tgt}.`), num(tgt * 3 - PP.sum(sc) + tgt, 'Use 4 tests in the total.'), num(Math.round(PP.sum(sc) / 3), 'That is the current average.')], ex: `An average of ${tgt} over 4 tests means a total of ${tgt} × 4 = ${tgt * 4}. So far: ${sc.join(' + ')} = ${PP.sum(sc)}. Needed: ${tgt * 4} − ${PP.sum(sc)} = <b>${need}</b>.` }; } },
    { lv: 3, f: (r) => { const price = r.int(4, 30) * 4, pct = r.pick([10, 20, 25, 50, 30, 40]); if ((price * pct) % 100) throw new Error('x'); const off = (price * pct) / 100; const ans = price - off; return { text: `A game costs $${price}. It is on sale for ${pct}% off. What is the sale price?`, ans, opt: (v) => '$' + v, wrongs: [{ h: '$' + off, k: off, why: 'That is the discount, not the new price.' }, { h: '$' + (price - pct), k: price - pct, why: `${pct}% off is not the same as $${pct} off.` }, { h: '$' + (price + off), k: price + off, why: 'A sale makes the price go down.' }, { h: '$' + (ans - 2), k: ans - 2, why: 'Recheck the percentage.' }], ex: `${pct}% of $${price} = $${off}. Sale price = $${price} − $${off} = <b>$${ans}</b>.` }; } },
    { lv: 3, f: (r) => { const [a, b] = PP.names(r, 2); const x = r.int(1, 5), y = r.int(x + 1, 8); if (PP.gcd(x, y) !== 1) throw new Error('x'); const unit = r.int(3, 12); const tot = (x + y) * unit; return { text: `${a} and ${b} share ${tot} marbles in the ratio ${x} : ${y}. How many marbles does ${b} get?`, ans: y * unit, wrongs: [num(x * unit, `That is ${a}'s share.`), num(tot / 2, 'A ratio of ' + x + ':' + y + ' is not an equal split.'), num(Math.round(tot / y), `Split into ${x + y} equal parts first.`)], ex: `${x} + ${y} = ${x + y} parts. One part = ${tot} ÷ ${x + y} = ${unit}. ${b} gets ${y} × ${unit} = <b>${y * unit}</b>.` }; } },
    { lv: 3, f: (r) => { const [a, b] = PP.names(r, 2); const t = r.int(2, 6), va = r.int(3, 9) * 10, vb = va + r.int(1, 3) * 10; const ans = (va + vb) * t; return { text: `Two trains leave the same station at the same time, going in opposite directions. One travels at ${va} km/h and the other at ${vb} km/h. How far apart are they after ${t} hours?`, ans, wrongs: [num((vb - va) * t, 'They go in OPPOSITE directions, so the distances add.'), num(va + vb, `That is the distance after 1 hour; they travel for ${t}.`), num(vb * t, 'That is only one train.')], ex: `Each hour they get ${va} + ${vb} = ${va + vb} km further apart. After ${t} hours: ${va + vb} × ${t} = <b>${ans}</b> km.` }; } },
  ];
  function wordProblem(r, lvl) {
    const pool = WP.filter((w) => w.lv === lvl || (lvl === 3 && w.lv === 2 && r.chance(0.2)) || (lvl === 2 && w.lv === 1 && r.chance(0.2)));
    const w = r.pick(pool.length ? pool : WP).f(r);
    const correct = w.opt ? { h: w.opt(w.ans), k: w.ans } : num(w.ans);
    const near = w.opt ? [] : nearMiss(w.ans);
    const m = mc(r, correct, w.wrongs.map((x) => (w.opt && x.k !== undefined && !String(x.k).startsWith('n') ? x : x)).concat(near), 4);
    return Object.assign({ prompt: w.text, stem: '', explain: `<p class="work">${w.ex}</p>` }, m);
  }

  // ================= MATH STRETCH (grades 5-7) =================
  const MS = [
    { lv: 1, f: (r) => { const d = r.pick([3, 4, 5, 6, 8, 10]), n = r.int(1, d - 1), k = r.int(2, 12); const x = d * k; if (PP.gcd(n, d) !== 1) throw new Error('x'); return { p: `What is ${PP.frac(n, d)} of ${x}?`, ans: n * k, w: [num(k, `That is ${PP.frac(1, d)} of ${x}. Multiply by ${n}.`), num(x - n * k, 'That is the part that is left.')], ex: `${x} ÷ ${d} = ${k}, then × ${n} = <b>${n * k}</b>.` }; } },
    { lv: 1, f: (r) => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, 9); const ans = a + b * c; return { p: `What is ${a} + ${b} × ${c}?`, ans, w: [num((a + b) * c, 'Multiply before you add (order of operations).')], ex: `Multiply first: ${b} × ${c} = ${b * c}. Then ${a} + ${b * c} = <b>${ans}</b>.` }; } },
    { lv: 1, f: (r) => { const n = r.int(1234, 9876); const p = r.pick([10, 100, 1000]); const ans = Math.round(n / p) * p; return { p: `Round ${fmt(n)} to the nearest ${fmt(p)}.`, ans, w: [num(Math.floor(n / p) * p === ans ? Math.ceil(n / p) * p : Math.floor(n / p) * p, 'Look at the digit to the right of the place you are rounding to: 5 or more rounds up.')], ex: `The digit after the ${p}s place decides. ${fmt(n)} is closer to <b>${fmt(ans)}</b>.` }; } },
    { lv: 1, f: (r) => { const l = r.int(3, 12), w = r.int(2, 9), h = r.int(2, 6); return { p: `A box is ${l} cm long, ${w} cm wide and ${h} cm tall. What is its volume in cubic centimetres?`, ans: l * w * h, w: [num(l + w + h, 'Volume is length × width × height.'), num(l * w, 'That is just the bottom layer. Multiply by the height too.'), num(2 * (l * w + l * h + w * h), 'That is the surface area.')], ex: `${l} × ${w} × ${h} = <b>${l * w * h}</b> cm³.` }; } },
    { lv: 2, f: (r) => { const [d1, d2] = r.sample([2, 3, 4, 5, 6, 8], 2); const n1 = r.int(1, d1 - 1), n2 = r.int(1, d2 - 1); const L = PP.lcm(d1, d2); const N = n1 * (L / d1) + n2 * (L / d2); return { p: `What is ${PP.frac(n1, d1)} + ${PP.frac(n2, d2)}?`, ansH: PP.mixed(N, L), ansK: PP.fracKey(N, L), w: [{ h: PP.frac(n1 + n2, d1 + d2), k: PP.fracKey(n1 + n2, d1 + d2), why: 'You can’t add the bottoms. Find a common denominator first.' }, { h: PP.mixed(n1 * n2, d1 * d2), k: PP.fracKey(n1 * n2, d1 * d2), why: 'That multiplies the fractions.' }, { h: PP.mixed(N + 1, L), k: PP.fracKey(N + 1, L), why: 'Recheck the conversion to a common denominator.' }, { h: PP.mixed(N, L * 2), k: PP.fracKey(N, L * 2), why: 'Recheck the denominator.' }, { h: PP.mixed(n1 + n2, L), k: PP.fracKey(n1 + n2, L), why: 'When you change the denominator, change the top too.' }], ex: `Common denominator ${L}: ${PP.frac(n1 * (L / d1), L)} + ${PP.frac(n2 * (L / d2), L)} = ${PP.frac(N, L)} → <b>${PP.mixed(N, L)}</b>.` }; } },
    { lv: 2, f: (r) => { const p = r.pick([10, 20, 25, 50, 75, 5, 15]); const x = r.int(2, 30) * 20; const ans = (p * x) / 100; return { p: `What is ${p}% of ${x}?`, ans, w: [num(x / p, 'Percent means “out of 100”.'), num(p * x / 10, 'Divide by 100, not 10.'), num(x - ans, 'That is what is left over.')], ex: `${p}% = ${p}/100. ${x} × ${p} ÷ 100 = <b>${fmt(ans)}</b>.` }; } },
    { lv: 2, f: (r) => { const a = r.int(2, 9), b = r.int(2, 6); const ans = a ** 2 + b ** 3; return { p: `What is ${a}² + ${b}³?`, ans, w: [num(a * 2 + b * 3, `${a}² means ${a} × ${a}, not ${a} × 2.`), num((a + b) ** 2, 'Work out each power separately.')], ex: `${a}² = ${a * a}, ${b}³ = ${b ** 3}. ${a * a} + ${b ** 3} = <b>${ans}</b>.` }; } },
    { lv: 2, f: (r) => { const g = r.int(2, 9), x = r.int(2, 7), y = r.int(2, 7); if (PP.gcd(x, y) !== 1 || x === y) throw new Error('x'); const A = g * x, B = g * y; return r.chance(0.5) ? { p: `What is the greatest common factor (GCF) of ${A} and ${B}?`, ans: g, w: [num(A * B / g, 'That is the least common multiple.'), num(Math.min(x, y), 'Find the biggest number that divides both.'), num(g * 2 <= Math.min(A, B) && A % (g * 2) ? g * 2 : g + 1, `Check: does it divide both ${A} and ${B}?`)], ex: `${A} = ${g} × ${x} and ${B} = ${g} × ${y}, and ${x}, ${y} share no factor. GCF = <b>${g}</b>.` } : { p: `What is the least common multiple (LCM) of ${A} and ${B}?`, ans: (A * B) / g, w: [num(A * B, 'That is a common multiple, but not the smallest.'), num(g, 'That is the GCF.')], ex: `LCM = ${A} × ${B} ÷ GCF(${g}) = <b>${(A * B) / g}</b>.` }; } },
    { lv: 2, f: (r) => { const a = r.int(2, 6), x = r.int(2, 15), b = r.int(1, 20); const c = a * x + b; return { p: `Solve: ${a}<i>n</i> + ${b} = ${c}. What is <i>n</i>?`, ans: x, w: [num(c - b, `Then divide by ${a}.`), num((c + b) / a, `Subtract ${b} first, don’t add.`), num(c / a - b, 'Undo the + first, then the ×.')], ex: `${a}n = ${c} − ${b} = ${c - b}, so n = ${c - b} ÷ ${a} = <b>${x}</b>.` }; } },
    { lv: 2, f: (r) => { const a = r.int(30, 80), b = r.int(20, 150 - a - 10); const ans = 180 - a - b; return { p: `Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`, ans, opt: (v) => v + '°', w: [{ h: 360 - a - b + '°', k: 360 - a - b, why: 'A triangle’s angles add to 180°, not 360°.' }, { h: a + b + '°', k: a + b, why: 'That is the two angles added.' }, { h: 90 - Math.min(a, 90) + b + '°', k: 90 - Math.min(a, 90) + b, why: 'Angles in a triangle add to 180°.' }, { h: ans + 10 + '°', k: ans + 10, why: 'Recheck the subtraction.' }], ex: `180° − ${a}° − ${b}° = <b>${ans}°</b>.` }; } },
    { lv: 2, f: (r) => { const ns = PP.range(r.int(5, 7)).map(() => r.int(2, 20)); const s = PP.sum(ns); if (s % ns.length) throw new Error('x'); const ans = s / ns.length; return { p: `What is the mean (average) of ${ns.join(', ')}?`, ans, w: [num(ns.slice().sort((a, b) => a - b)[Math.floor(ns.length / 2)], 'That is the median (middle number).'), num(s, 'That is the total. Divide by how many numbers there are.')], ex: `Total = ${s}, there are ${ns.length} numbers. ${s} ÷ ${ns.length} = <b>${ans}</b>.` }; } },
    { lv: 2, f: (r) => { const a = r.int(2, 9), b = r.int(5, 15), c = r.int(1, 12); const ans = -a + b - c; return { p: `What is −${a} + ${b} − ${c}?`, ans, w: [num(a + b - c, `It starts at −${a}, not ${a}.`), num(-a - b - c, `+${b} moves up the number line.`), num(-ans, 'Check the sign of your answer.')], ex: `−${a} + ${b} = ${fmt(b - a)}; ${fmt(b - a)} − ${c} = <b>${fmt(ans)}</b>.` }; } },
    { lv: 2, f: (r) => { const [u, k, w1, w2] = r.pick([['km', 1000, 'kilometres', 'metres'], ['m', 100, 'metres', 'centimetres'], ['kg', 1000, 'kilograms', 'grams'], ['L', 1000, 'litres', 'millilitres']]); const v = r.int(12, 95) / 10; const ans = Math.round(v * k); return { p: `How many ${w2} are in ${v} ${w1}?`, ans, w: [num(ans / 10, 'Check how many are in ONE unit.'), num(ans * 10, 'Check how many are in ONE unit.'), num(v * 100 === ans ? ans * 10 : v * 100, `1 ${u} = ${fmt(k)} of the smaller unit.`)], ex: `1 ${w1.slice(0, -1)} = ${fmt(k)} ${w2}, so ${v} × ${fmt(k)} = <b>${fmt(ans)}</b>.` }; } },
    { lv: 3, f: (r) => { const [d1, d2] = r.sample([2, 3, 4, 5, 6], 2); const n1 = r.int(1, d1 * 2), n2 = r.int(1, d2 - 1); const N = n1 * n2, D = d1 * d2; return { p: `What is ${PP.frac(n1, d1)} × ${PP.frac(n2, d2)}? Give the simplest form.`, ansH: PP.mixed(N, D), ansK: PP.fracKey(N, D), w: [{ h: PP.mixed(n1 * d2 + n2 * d1, D), k: PP.fracKey(n1 * d2 + n2 * d1, D), why: 'That adds the fractions.' }, { h: PP.mixed(n1 * d2, d1 * n2), k: PP.fracKey(n1 * d2, d1 * n2), why: 'That divides the fractions.' }, { h: PP.mixed(N + 1, D), k: PP.fracKey(N + 1, D), why: 'Multiply top × top and bottom × bottom.' }, { h: PP.mixed(N, D + 1), k: PP.fracKey(N, D + 1), why: 'Multiply top × top and bottom × bottom.' }], ex: `Top × top = ${N}, bottom × bottom = ${D}: ${PP.frac(N, D)} = <b>${PP.mixed(N, D)}</b>.` }; } },
    { lv: 3, f: (r) => { const a = r.int(2, 9), b = r.int(2, 9); const ans = (a * b) / 100; return { p: `What is 0.${a} × 0.${b}?`, ans, opt: (v) => String(v), w: [{ h: String((a * b) / 10), k: (a * b) / 10, why: 'Count decimal places: 1 + 1 = 2 places in the answer.' }, { h: String((a + b) / 10), k: (a + b) / 10, why: 'That adds instead of multiplying.' }, { h: String(a * b), k: a * b, why: 'Don’t forget the decimal point.' }, { h: String((a * b) / 1000), k: (a * b) / 1000, why: 'Count decimal places: 1 + 1 = 2.' }], ex: `${a} × ${b} = ${a * b}. Two decimal places in total → <b>${ans}</b>.` }; } },
    { lv: 3, f: (r) => { const lo = r.int(1, 6) * 10, hi = lo + r.int(15, 30); const ps = PP.range(hi - lo - 1).map((i) => lo + 1 + i).filter(PP.isPrime); return { p: `How many prime numbers are there between ${lo} and ${hi}?`, ans: ps.length, w: [num(ps.length + 1, 'Check each odd number: is it divisible by 3, 5 or 7?'), num(ps.length - 1, 'You may have missed one.'), num(Math.ceil((hi - lo) / 2), 'Not all odd numbers are prime.')], ex: `The primes are ${ps.join(', ')}: <b>${ps.length}</b> of them.` }; } },
    { lv: 3, f: (r) => { const W = r.int(6, 12), H = r.int(6, 10), cw = r.int(2, W - 3), ch = r.int(2, H - 3); const ans = W * H - cw * ch; const svg = `<svg viewBox="0 0 160 130" class="diagram"><path d="M10 10 H${10 + W * 10} V${10 + H * 10 - ch * 10} H${10 + W * 10 - cw * 10} V${10 + H * 10} H10 Z" fill="var(--soft)" stroke="var(--ink)" stroke-width="2"/><text x="${10 + W * 5}" y="7" font-size="9" text-anchor="middle" fill="var(--ink)">${W} cm</text><text x="5" y="${10 + H * 5}" font-size="9" text-anchor="end" fill="var(--ink)" transform="rotate(-90 5 ${10 + H * 5})">${H} cm</text><text x="${10 + (W - cw) * 10 + 5}" y="${10 + (H - ch / 2) * 10 + 3}" font-size="9" fill="var(--ink)">${ch} cm</text><text x="${10 + (W - cw / 2) * 10}" y="${10 + (H - ch) * 10 + 12}" font-size="9" text-anchor="middle" fill="var(--ink)">${cw} cm</text></svg>`; return { p: `A ${cw} cm × ${ch} cm corner is cut from a ${W} cm × ${H} cm rectangle. What is the area of the shape that is left?`, stem: svg, ans, opt: (v) => v + ' cm²', w: [{ h: W * H + ' cm²', k: W * H, why: 'Subtract the corner that was cut out.' }, { h: 2 * (W + H) + ' cm²', k: 2 * (W + H), why: 'That is the perimeter.' }, { h: cw * ch + ' cm²', k: cw * ch, why: 'That is the piece that was cut out.' }, { h: ans + cw + ' cm²', k: ans + cw, why: 'Recheck the cut-out area.' }], ex: `Big rectangle: ${W} × ${H} = ${W * H}. Corner: ${cw} × ${ch} = ${cw * ch}. Left: ${W * H} − ${cw * ch} = <b>${ans} cm²</b>.` }; } },
    { lv: 3, f: (r) => { const n = r.int(4, 15); return { p: `What is the square root of ${n * n}?`, ans: n, w: [num((n * n) / 2, 'Square root means: which number times itself gives this?'), num(n + 1, `${n + 1} × ${n + 1} = ${(n + 1) ** 2}.`), num(n - 1, `${n - 1} × ${n - 1} = ${(n - 1) ** 2}.`)], ex: `${n} × ${n} = ${n * n}, so √${n * n} = <b>${n}</b>.` }; } },
    { lv: 3, f: (r) => { const a = r.int(2, 5), b = r.int(2, 6), c = r.int(2, 4), d = r.int(1, 9); const ans = (a + b) ** 2 - c * d; return { p: `What is (${a} + ${b})² − ${c} × ${d}?`, ans, w: [num(a * a + b * b - c * d, `(${a} + ${b})² means add first, then square.`), num(((a + b) ** 2 - c) * d, 'Multiply before subtracting.'), num(2 * (a + b) - c * d, 'Squaring means multiply by itself, not by 2.')], ex: `(${a + b})² = ${(a + b) ** 2}; ${c} × ${d} = ${c * d}; ${(a + b) ** 2} − ${c * d} = <b>${ans}</b>.` }; } },
  ];
  function stretch(r, lvl) {
    const pool = MS.filter((m) => m.lv === lvl || (lvl === 3 && m.lv === 2 && r.chance(0.25)));
    const m = r.pick(pool).f(r);
    let correct;
    if (m.ansH) correct = { h: m.ansH, k: m.ansK };
    else if (m.opt) correct = { h: m.opt(m.ans), k: m.ans };
    else correct = num(m.ans);
    const near = m.ansH || m.opt ? [] : nearMiss(m.ans);
    const res = mc(r, correct, m.w.concat(near), 5);
    return Object.assign({ prompt: m.p, stem: m.stem || '', explain: `<p class="work">${m.ex}</p>` }, res);
  }

  // ================= CONTEST PUZZLES (Math Kangaroo / Gauss style) =================
  const choose = (n, k) => { let v = 1; for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i; return Math.round(v); };
  const KG = [
    { lv: 1, f: (r) => { const n = r.int(4, 9); const ans = (n * (n - 1)) / 2; return { p: `${n} friends meet at a party. Each friend shakes hands with every other friend exactly once. How many handshakes are there?`, ans, w: [num(n * (n - 1), 'Each handshake involves two people, so that counts every handshake twice.'), num(n * n, 'Nobody shakes their own hand.'), num(n - 1, `That is how many hands ONE person shakes.`)], ex: `The first person shakes ${n - 1} hands, the next ${n - 2} new ones, and so on: ${PP.range(n - 1).map((i) => n - 1 - i).join(' + ')} = <b>${ans}</b>.` }; } },
    { lv: 1, f: (r) => { const L = r.int(4, 12) * r.pick([2, 3, 5]), g = r.pick([2, 3, 5]); if (L % g) throw new Error('x'); const ans = L / g + 1; return { p: `A straight fence is ${L} m long. There is a post at each end and a post every ${g} m along it. How many posts are there?`, ans, w: [num(L / g, 'Don’t forget the post at the very start!'), num(L / g - 1, 'Count the end posts too.')], ex: `${L} ÷ ${g} = ${L / g} gaps. Posts = gaps + 1 = <b>${ans}</b>.` }; } },
    { lv: 1, f: (r) => { const k = r.int(3, 9), m = r.int(2, 6); const ans = (k - 1) * m; return { p: `It takes ${m} minutes to make one cut through a log. How many minutes does it take to cut the log into ${k} pieces?`, ans, w: [num(k * m, `${k} pieces only need ${k - 1} cuts.`)], ex: `${k} pieces need ${k - 1} cuts. ${k - 1} × ${m} = <b>${ans}</b> minutes.` }; } },
    { lv: 2, f: (r) => { const D = r.int(6, 15), up = r.int(3, 5), dn = r.int(1, up - 1); const ans = Math.ceil((D - up) / (up - dn)) + 1; return { p: `A snail is at the bottom of a ${D} m well. Each day it climbs up ${up} m, and each night it slides back ${dn} m. On which day does it reach the top?`, ans, w: [num(Math.ceil(D / (up - dn)), `On the last day it climbs out before sliding back.`), num(ans + 1, 'On the last day it climbs out before night comes.')], ex: `Each full day+night it gains ${up - dn} m. It needs to be within ${up} m of the top at the start of a day: after ${ans - 1} days it is at ${(ans - 1) * (up - dn)} m, and on day <b>${ans}</b> it climbs ${up} m and gets out.` }; } },
    { lv: 2, f: (r) => { const a = r.int(2, 4), b = r.int(2, 4); const ans = choose(a + b, a); const u = 18, w = a * u, h = b * u; let g = ''; for (let i = 0; i <= a; i++) g += `<line x1="${10 + i * u}" y1="10" x2="${10 + i * u}" y2="${10 + h}" stroke="var(--ink)" stroke-width="1.5"/>`; for (let j = 0; j <= b; j++) g += `<line x1="10" y1="${10 + j * u}" x2="${10 + w}" y2="${10 + j * u}" stroke="var(--ink)" stroke-width="1.5"/>`; g += `<circle cx="10" cy="${10 + h}" r="5" fill="var(--good)"/><text x="10" y="${h + 26}" font-size="10" text-anchor="middle" fill="var(--ink)">A</text><circle cx="${10 + w}" cy="10" r="5" fill="var(--bad)"/><text x="${w + 18}" y="14" font-size="10" fill="var(--ink)">B</text>`; return { p: `You walk along the lines from A to B, moving only <b>right</b> or <b>up</b>. How many different paths are there?`, stem: `<svg viewBox="0 0 ${w + 30} ${h + 32}" class="diagram">${g}</svg>`, ans, w: [num(a + b, 'That is the number of steps in each path, not the number of paths.'), num(a * b, 'Try writing the number of ways to reach each corner.'), num(ans - 1, 'Close. Count again using corners.')], ex: `Write at each corner how many ways reach it: corners on the bottom row and left side have 1 way; every other corner = (left) + (below). The top-right corner gets <b>${ans}</b>.` }; } },
    { lv: 2, f: (r) => { const c = r.int(2, 5); return { p: `A drawer has socks in ${c} different colours, all mixed up. It is dark, so you can’t see the colours. What is the smallest number of socks you must take out to be <b>sure</b> you have two of the same colour?`, ans: c + 1, w: [num(2, 'Two socks could be different colours.'), num(c, `You could get one of each of the ${c} colours, with no pair yet.`), num(2 * c, 'Fewer are enough.')], ex: `In the worst case you first get one sock of each colour (${c} socks). The next one must match: <b>${c + 1}</b>.` }; } },
    { lv: 2, f: (r) => { const a = r.int(2, 4), b = r.int(2, 4), c = r.int(2, 3); return { p: `On a balance, ${a} apples weigh the same as ${b} pears, and 1 pear weighs the same as ${c} plums. How many plums weigh the same as ${a * 2} apples?`, ans: 2 * b * c, w: [num(b * c, `That is for ${a} apples. You need ${a * 2}.`), num(a * 2 * c, 'Change apples into pears first.'), num(2 * b, 'That is in pears, not plums.')], ex: `${a * 2} apples = ${2 * b} pears (double). Each pear = ${c} plums, so ${2 * b} × ${c} = <b>${2 * b * c}</b> plums.` }; } },
    { lv: 2, f: (r) => { const n = r.int(10, 40); const s = 3 * n + 3; return { p: `Three numbers in a row (like 7, 8, 9) add up to ${s}. What is the largest of the three?`, ans: n + 2, w: [num(n + 1, 'That is the middle number.'), num(n, 'That is the smallest.'), num(s / 3 + 2, 'Close, but check.') ], ex: `The middle number is ${s} ÷ 3 = ${n + 1}. The numbers are ${n}, ${n + 1}, ${n + 2}; the largest is <b>${n + 2}</b>.` }; } },
    { lv: 3, f: (r) => { const a = r.int(4, 12), k = r.int(3, 4), y = (k - 2) * a; if (y <= 0) throw new Error('x'); const mom = k * a; return { p: `Today Mom is ${k} times as old as Ana. In ${y} years, Mom will be twice as old as Ana. How old is Ana today?`, ans: a, w: [num(mom, 'That is Mom’s age.'), num(a + y, `That is Ana's age in ${y} years.`), num(y, 'Test it: does it make Mom twice Ana’s age later?')], ex: `If Ana is ${a}, Mom is ${mom}. In ${y} years: Ana ${a + y}, Mom ${mom + y} = 2 × ${a + y} ✓. Ana is <b>${a}</b>.` }; } },
    { lv: 3, f: (r) => { const N = r.int(30, 150); let dg = 0; for (let i = 1; i <= N; i++) dg += String(i).length; return { p: `A book has pages numbered 1 to ${N}. How many digits are printed in total to number all the pages?`, ans: dg, w: [num(N, 'Pages 10 and up use 2 digits each.'), num(N * 2, 'Pages 1–9 use only one digit.'), num(dg - 9, 'Count pages 1–9 too.')], ex: `Pages 1–9: 9 digits. Pages 10–${Math.min(N, 99)}: ${Math.min(N, 99) - 9} × 2 = ${(Math.min(N, 99) - 9) * 2}.${N >= 100 ? ` Pages 100–${N}: ${N - 99} × 3 = ${(N - 99) * 3}.` : ''} Total <b>${dg}</b>.` }; } },
    { lv: 3, f: (r) => { const n = r.int(3, 5); const ans = PP.sum(PP.range(n).map((i) => (i + 1) ** 2)); let g = ''; const u = 16; for (let i = 0; i <= n; i++) g += `<line x1="${6 + i * u}" y1="6" x2="${6 + i * u}" y2="${6 + n * u}" stroke="var(--ink)" stroke-width="1.5"/><line x1="6" y1="${6 + i * u}" x2="${6 + n * u}" y2="${6 + i * u}" stroke="var(--ink)" stroke-width="1.5"/>`; return { p: `How many squares of <b>any size</b> are in this ${n} × ${n} grid?`, stem: `<svg viewBox="0 0 ${n * u + 12} ${n * u + 12}" class="diagram sm">${g}</svg>`, ans, w: [num(n * n, 'Count bigger squares too, like 2 × 2.'), num(n * n + 1, 'There are more mid-size squares.'), num(ans - 1, 'You may have missed one big square.')], ex: `${PP.range(n).map((i) => `${i + 1}×${i + 1}: ${(n - i) ** 2}`).join(', ')}. Total = <b>${ans}</b>.` }; } },
    { lv: 3, f: (r) => { const S = r.int(5, 15); let c = 0; for (let x = 10; x <= 99; x++) if (Math.floor(x / 10) + (x % 10) === S) c++; return { p: `How many two-digit numbers have digits that add up to ${S}?`, ans: c, w: [num(c + 1, `The tens digit can’t be 0, and each digit is at most 9.`), num(c - 1, 'List them in order of the tens digit.'), num(S, 'Each digit can only be 0–9.')], ex: `List by tens digit: ${PP.range(90).map((i) => i + 10).filter((x) => Math.floor(x / 10) + (x % 10) === S).join(', ')}: <b>${c}</b> numbers.` }; } },
    { lv: 3, f: (r) => { const n = r.int(5, 8), k = r.int(2, 3), m = r.int(4, 9); const NM = PP.names(r, n); const who = (k * m) % n; return { p: `${n} children stand in a circle: ${NM.join(', ')} (in that order, then back to ${NM[0]}). ${NM[0]} has the ball and passes it to the child ${k} places to the left. Each child does the same. Who has the ball after ${m} passes?`, ansH: NM[who], ansK: NM[who], w: NM.filter((_, i) => i !== who).map((x) => ({ h: x, k: x, why: `Each pass moves ${k} places. ${m} passes × ${k} = ${k * m} places around a circle of ${n}.` })), ex: `${m} passes × ${k} places = ${k * m} places. Around a circle of ${n}: ${k * m} = ${Math.floor((k * m) / n)} full laps + ${(k * m) % n}. Count ${(k * m) % n} from ${NM[0]}: <b>${NM[who]}</b>.` }; } },
    { lv: 3, f: (r) => { const h = r.pick([2, 3, 4, 5, 7, 8, 9, 10]); const ang = Math.min(h * 30, 360 - h * 30); return { p: `What is the smaller angle between the hour hand and the minute hand of a clock at exactly ${h}:00?`, ans: ang, opt: (v) => v + '°', w: [{ h: h * 5 + '°', k: h * 5, why: 'Each hour mark is 360° ÷ 12 = 30° apart.' }, { h: 360 - ang + '°', k: 360 - ang, why: 'That is the bigger angle.' }, { h: h * 10 + '°', k: h * 10, why: 'Each hour mark is 30° apart.' }, { h: ang + 30 + '°', k: ang + 30, why: 'Count the hour gaps again.' }], ex: `At ${h}:00 the hands are ${Math.min(h, 12 - h)} hour marks apart. 360° ÷ 12 = 30° per mark, so ${Math.min(h, 12 - h)} × 30° = <b>${ang}°</b>.` }; } },
  ];
  function contest(r, lvl) {
    const pool = KG.filter((m) => m.lv === lvl || (lvl > 1 && m.lv === lvl - 1 && r.chance(0.2)));
    const m = r.pick(pool).f(r);
    let correct;
    if (m.ansH) correct = { h: m.ansH, k: m.ansK };
    else if (m.opt) correct = { h: m.opt(m.ans), k: m.ans };
    else correct = num(m.ans);
    const near = m.ansH || m.opt ? [] : nearMiss(m.ans);
    return Object.assign({ prompt: m.p, stem: m.stem || '', explain: `<p class="work">${m.ex}</p>` }, mc(r, correct, m.w.concat(near), 5));
  }

  PP.addChapter({ id: 'number-series', group: 'quant', name: 'Number Series', exams: 'CogAT · CCAT · OLSAT', gen: series,
    tip: 'Look at the jumps between numbers. Are they the same? Growing? Taking turns? If adding doesn’t work, try multiplying.' });
  PP.addChapter({ id: 'number-analogies', group: 'quant', name: 'Number Analogies', exams: 'CogAT · CCAT · OLSAT', gen: analogies,
    tip: 'Find ONE rule that turns the first number into the second in both example pairs. A rule that works for only one pair is a trap.' });
  PP.addChapter({ id: 'number-puzzles', group: 'quant', name: 'Number Puzzles', exams: 'CogAT · CCAT', gen: puzzles,
    tip: 'Work out the side you know first. Then undo the operation next to the ?. Shapes that stand for numbers: solve the simplest line first.' });
  PP.addChapter({ id: 'number-grids', group: 'quant', name: 'Number Grids', exams: 'OLSAT number matrix', gen: grids,
    tip: 'Find a rule that works in every complete row before using it on the row with the ?.' });
  PP.addChapter({ id: 'word-problems', group: 'quant', name: 'Word Problems', exams: 'ISEE · OLSAT', gen: wordProblem, nOpts: 4,
    tip: 'Read twice. Underline what the question actually asks for (the leftovers? the change? the cows?). Then do one step at a time.' });
  PP.addChapter({ id: 'math-stretch', group: 'quant', name: 'Math Stretch', exams: 'Grade 5–7 · ISEE math', gen: stretch,
    tip: 'Fractions, percents, powers, equations and geometry from grades 5–7. Write the steps down: it helps.' });
  PP.addChapter({ id: 'contest', group: 'quant', name: 'Contest Puzzles', exams: 'Math Kangaroo · Gauss', gen: contest,
    tip: 'Contest problems hide a trick. Draw a picture, try small cases, and watch for “off by one” traps (posts vs gaps, cuts vs pieces).' });
})();
