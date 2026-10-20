// Generates every fixed set plus many random questions per chapter and checks their structure.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
const ORDER = require(path.join(SRC, 'order.json'));
const ctx = { console, Math, JSON, Set, Map, Array, Object, String, Number, Error, globalThis: null };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ORDER.filter((f) => !f.startsWith('app'))) vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f });
const PP = ctx.PP;
const RANDOM = +(process.argv[2] || 300);
const only = process.argv[3];
let problems = 0, total = 0;
const bad = (ch, q, msg) => { problems++; if (problems < 60) console.log(`  ✗ ${ch} ${q ? q.id : ''}: ${msg}`); };
function check(q, ch) {
  total++;
  const n = q.opts.length;
  const min = PP.byId[ch].nOpts === 4 ? 4 : 4;
  if (n < min) bad(ch, q, `only ${n} options`);
  if (!(q.ans >= 0 && q.ans < n)) bad(ch, q, `answer index ${q.ans}`);
  if (new Set(q.opts).size !== n) bad(ch, q, 'duplicate option html');
  const all = [q.prompt, q.stem, q.explain, ...q.opts, ...(q.why || [])].join(' ');
  if (/undefined|NaN|\[object|Infinity/.test(all)) bad(ch, q, 'bad token: ' + all.match(/.{40}(undefined|NaN|\[object|Infinity).{20}/)?.[0]);
  if (!q.explain || q.explain.length < 15) bad(ch, q, 'no explanation');
  if (!q.prompt) bad(ch, q, 'no prompt');
}
const t0 = Date.now();
const stats = [];
for (const ch of PP.chapters) {
  if (only && ch.id !== only) continue;
  const t = Date.now();
  let made = 0;
  const sc = PP.setCount(ch);
  for (let i = 0; i < sc; i++) {
    let refs;
    try { refs = PP.setRefs(ch, i); } catch (e) { bad(ch.id, null, `set ${i}: ${e.message}`); continue; }
    if (refs.length !== 10 && !(ch.bank && i === sc - 1)) bad(ch.id, null, `set ${i} has ${refs.length} questions`);
    for (const ref of refs) { try { check(PP.make(ref.ch, ref.seed, ref.lvl), ch.id); made++; } catch (e) { bad(ch.id, null, `make: ${e.message}`); } }
  }
  if (!ch.bank) for (const lvl of [1, 2, 3]) for (let k = 0; k < RANDOM; k++) {
    try { check(PP.make(ch.id, 7000000 + lvl * 100000 + k, lvl), ch.id); made++; } catch (e) { bad(ch.id, null, `L${lvl} seed ${k}: ${e.message}`); }
  }
  else for (let k = 0; k < ch.bank.length; k++) { try { check(PP.make(ch.id, k, 0), ch.id); made++; } catch (e) { bad(ch.id, null, `bank ${k}: ${e.message}`); } }
  stats.push(`${ch.id.padEnd(20)} sets:${String(sc).padStart(3)} checked:${String(made).padStart(5)} ${Date.now() - t}ms`);
}
console.log(stats.join('\n'));
console.log(`\nChapters: ${PP.chapters.length}. Fixed-set questions: ${PP.chapters.reduce((s, c) => s + (c.bank ? c.bank.length : PP.setCount(c) * 10), 0)}. Checked ${total} in ${Date.now() - t0}ms. Problems: ${problems}`);
if (PP.tests && PP.tests.length) {
  let tq = 0;
  for (const t of PP.tests) for (const form of [0, 1, 2]) { try { const secs = PP.testForm(t, form); secs.forEach((s) => s.refs.forEach((ref) => { check(PP.make(ref.ch, ref.seed, ref.lvl), ref.ch); tq++; })); } catch (e) { bad(t.id, null, 'test form: ' + e.message); } }
  console.log(`Tests: ${PP.tests.length}, checked ${tq} test questions. Problems total: ${problems}`);
}
// mixed sets: every set must cover all four groups with no group twice in a row
let mixBad = 0;
for (let i = 0; i < PP.MIX_SETS; i++) {
  const refs = PP.mixRefs(i);
  const gs = refs.map((r) => PP.byId[r.ch].group);
  if (refs.length !== PP.MIX_N || new Set(gs).size !== 4 || gs.some((g, k) => k && g === gs[k - 1])) { mixBad++; console.log('  ✗ mix set', i, gs.join(',')); }
  refs.forEach((ref) => check(PP.make(ref.ch, ref.seed, ref.lvl), ref.ch));
}
const cover = new Set(); for (let i = 0; i < PP.MIX_SETS; i++) PP.mixRefs(i).forEach((r) => cover.add(r.ch));
console.log(`Mixed sets: ${PP.MIX_SETS}, chapters covered: ${cover.size}/${PP.chapters.length}, bad: ${mixBad}`);
process.exit(problems || mixBad || cover.size !== PP.chapters.length ? 1 : 0);
