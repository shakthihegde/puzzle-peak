'use strict';
// Words chapters: bank-based CogAT/CCAT verbal battery, ISEE/SSAT vocabulary, OLSAT verbal reasoning,
// plus generated letter series, codes and sentence arrangement.
(function () {
  const { mc, esc } = PP;
  const parse = (txt) => PP.lines(txt).map((l) => {
    const [stem, rest] = l.split(' => ');
    const [ans, ds, why, d] = rest.split(' | ');
    return { stem: stem.trim(), ans: ans.trim(), ds: ds.split(', ').map((x) => x.trim()), why: why.trim(), d: +d };
  });
  const w = (s) => `<span class="word">${esc(s)}</span>`;
  const bankQ = (r, it, prompt, stem, whyFn) => Object.assign({ prompt, stem, explain: `<p>${esc(it.why)}</p>` },
    mc(r, { h: esc(it.ans), k: it.ans }, it.ds.map((d) => ({ h: esc(d), k: d, why: whyFn(d) })), it.ds.length + 1));

  PP.addChapter({ id: 'analogies', group: 'verbal', name: 'Verbal Analogies', exams: 'CogAT · CCAT · SSAT · OLSAT', bank: parse(PP.BANK.analogies),
    tip: 'Make a sentence that links the first pair: “A puppy is a baby dog.” Then use the same sentence for the second pair: “A kitten is a baby ___.”',
    fromBank: (it, r) => { const [a, b, c] = it.stem.split(/::|:/).map((x) => x.trim()).filter(Boolean); return bankQ(r, it, 'The first two words go together. Which word goes with the third word in the same way?', `<div class="analogy">${w(a)}<span class="arr">→</span>${w(b)}<span class="sep"></span>${w(c)}<span class="arr">→</span><span class="word q">?</span></div>`, (d) => `“${d}” has something to do with “${c}”, but not in the same way that “${b}” goes with “${a}”.`); } });

  PP.addChapter({ id: 'sentences', group: 'verbal', name: 'Sentence Completion', exams: 'CogAT · CCAT · ISEE', bank: parse(PP.BANK.sentences),
    tip: 'Read the whole sentence first and look for clue words like “because”, “so”, “although” and “but”. Try each answer in the blank.',
    fromBank: (it, r) => bankQ(r, it, 'Which word best completes the sentence?', `<p class="sentence">${esc(it.stem).replace('___', '<span class="blank">______</span>')}</p>`, (d) => `Put “${d}” in the blank and read it again. It doesn’t make sense with the rest of the sentence.`) });

  PP.addChapter({ id: 'classify', group: 'verbal', name: 'Verbal Classification', exams: 'CogAT · CCAT · OLSAT', bank: parse(PP.BANK.classify),
    tip: 'Name the group all three words belong to, as exactly as you can. Watch out for words that are only related (like “nest” for birds).',
    fromBank: (it, r) => bankQ(r, it, 'The three words go together in some way. Which word below belongs with them?', `<div class="wordset">${it.stem.split(', ').map(w).join('')}</div>`, (d) => `“${d}” is connected to these words, but it isn’t the same kind of thing.`) });

  PP.addChapter({ id: 'vocab', group: 'verbal', name: 'Synonyms & Antonyms', exams: 'ISEE · SSAT · OLSAT', bank: parse(PP.BANK.vocab), nOpts: 4,
    tip: 'Read carefully: SAME meaning (synonym) or OPPOSITE meaning (antonym)? Tests love to put the opposite in the answers as a trap.',
    fromBank: (it, r) => { const [t, word] = it.stem.split(' '); return bankQ(r, it, t === 'syn' ? `Which word means the <b>same</b> as <b>${esc(word)}</b>?` : `Which word means the <b>opposite</b> of <b>${esc(word)}</b>?`, `<div class="wordset one">${w(word)}</div>`, (d) => `“${d}” doesn’t mean the ${t === 'syn' ? 'same as' : 'opposite of'} “${word}”.`); } });

  PP.addChapter({ id: 'reasoning', group: 'verbal', name: 'Verbal Reasoning', exams: 'OLSAT logical selection & inference', bank: parse(PP.BANK.reasoning),
    tip: 'Choose only what MUST be true. If something is true only some of the time, it is not the answer.',
    fromBank: (it, r) => { const always = /always (has|needs|shows|measures)$/.test(it.stem); return bankQ(r, it, always ? 'Which answer is <b>always</b> true?' : 'Read carefully. Which answer is correct?', `<p class="sentence">${esc(it.stem)}${always ? ' …' : ''}</p>`, (d) => (always ? `“${d}” is true only sometimes, not always.` : `“${d}” doesn’t have to be true from these facts.`)); } });

  // ================= LETTER SERIES =================
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const L = (i) => A[i];
  const pos = (s) => s.replace(/[A-Z]/g, (c) => `${c}<sub>${A.indexOf(c) + 1}</sub>`);
  const bump = (s, k, d) => s.split('').map((c, i) => (i === k && A.includes(c) && A.indexOf(c) + d >= 0 && A.indexOf(c) + d < 26 ? L(A.indexOf(c) + d) : c)).join('');
  function letterSeries(r, lvl) {
    const T = {
      1: [
        () => { const k = r.int(1, 3), s = r.int(0, 25 - 6 * k); return { t: PP.range(6).map((i) => L(s + k * i)), rule: k === 1 ? 'the letters go in alphabet order' : `each letter skips ${k - 1} letter${k > 2 ? 's' : ''} (+${k})` }; },
        () => { const k = r.int(1, 3), s = r.int(6 * k, 25); return { t: PP.range(6).map((i) => L(s - k * i)), rule: `the letters go backwards through the alphabet, ${k} at a time` }; },
        () => { const s = r.int(0, 14); return { t: PP.range(5).map((i) => L(s + 2 * i) + L(s + 2 * i + 1)), rule: 'the pairs continue in alphabet order: two letters at a time' }; },
      ],
      2: [
        () => { const s = r.int(0, 8); const t = [s]; for (let i = 1; i < 6; i++) t.push(t[i - 1] + i); return { t: t.map(L), rule: 'the jumps grow: +1, +2, +3, +4…' }; },
        () => { const a = r.int(1, 2), b = r.int(3, 4), s = r.int(0, 6); const t = [s]; for (let i = 1; i < 7; i++) t.push(t[i - 1] + (i % 2 ? a : b)); if (t[6] > 25) throw new Error('x'); return { t: t.map(L), rule: `the jumps take turns: +${a}, then +${b}` }; },
        () => { const s = r.int(0, 8); return { t: PP.range(5).map((i) => L(s + i) + L(25 - s - i)), rule: 'the first letter moves forward from the start of the alphabet while the second moves backward from the end' }; },
        () => { const k = r.int(1, 3), s = r.int(0, 25 - 5 * k); return { t: PP.range(5).map((i) => L(s + k * i) + (s + k * i + 1)), rule: 'each letter is followed by its number in the alphabet (A = 1, B = 2…)' }; },
        () => { const s = r.int(0, 8); const t = []; for (let i = 0; i < 4; i++) { t.push(L(s + i)); t.push(L(25 - s - i)); } return { t, rule: 'two series take turns: one goes forward from the start, the other backward from the end' }; },
      ],
      3: [
        () => { const k = r.int(1, 2), s = r.int(0, 10); return { t: PP.range(5).map((i) => L(s + i) + L(s + i + k) + L(s + i + 2 * k)), rule: `each group starts one letter later, and inside a group the letters go up by ${k}` }; },
        () => { const s = r.int(0, 9); return { t: [0, 1, 3, 7, 15].map((g) => L(s + g)), rule: 'the jumps double: +1, +2, +4, +8' }; },
        () => { const s = r.int(0, 6), a = 2, b = 3; return { t: PP.range(5).map((i) => L(s + a * i) + L(s + 1 + b * i)), rule: `in each pair, the first letter moves +${a} and the second letter moves +${b}` }; },
        () => { const s = r.int(0, 15); const t = [s]; for (let i = 1; i < 8; i++) t.push(t[i - 1] + (i % 2 ? 2 : -1)); return { t: t.map(L), rule: 'the steps take turns: forward 2, back 1' }; },
        () => { const s = r.int(0, 12); const t = []; for (let i = 0; i < 4; i++) { t.push(L(s + 2 * i)); t.push(L(25 - 3 * i)); } return { t, rule: 'two series take turns: one moves forward by 2, the other moves backward by 3 from Z' }; },
      ],
    };
    const s = r.pick(T[lvl])();
    const show = s.t.slice(0, -1), ans = s.t[s.t.length - 1];
    if (s.t.some((x) => x.includes('undefined'))) throw new Error('range');
    const wrongs = [];
    for (let k = 0; k < ans.length; k++) for (const d of [1, -1, 2]) { const b = bump(ans, k, d); if (b !== ans) wrongs.push({ h: b, k: b, why: 'Close! Check the positions of each letter in the alphabet.' }); }
    const nm = ans.match(/^([A-Z])(\d+)$/);
    if (nm) [+nm[2] + 1, +nm[2] - 1, +nm[2] + 2].forEach((v) => wrongs.push({ h: nm[1] + v, k: nm[1] + v, why: `${nm[1]} is letter number ${A.indexOf(nm[1]) + 1} in the alphabet.` }));
    wrongs.push({ h: show[show.length - 1], k: show[show.length - 1], why: 'That repeats the last item.' });
    const res = mc(r, { h: ans, k: ans }, r.shuffle(wrongs), 5);
    return Object.assign({ prompt: 'Which comes next in the series?', stem: `<div class="seq letters">${show.map((x) => `<span class="chip">${x}</span>`).join('')}<span class="chip q">?</span></div>`,
      explain: `<p>The rule: <b>${s.rule}</b>.</p><p class="work">${show.map(pos).join('&nbsp; ')} &nbsp;→ <b>${pos(ans)}</b></p><p>The small numbers show each letter’s place in the alphabet.</p>` }, res);
  }

  // ================= CODES =================
  const WORDS = ['CAT', 'DOG', 'SUN', 'HAT', 'PEN', 'BUS', 'MAP', 'FISH', 'BIRD', 'FROG', 'CAKE', 'STAR', 'TREE', 'MOON', 'KITE', 'LAMP', 'ROSE', 'BOOK', 'DUCK', 'GAME', 'RAIN', 'LION', 'BEAR', 'WOLF', 'SHIP', 'CAMP', 'JUMP', 'NEST', 'GOLD', 'MILK'];
  const shift = (wd, k) => wd.split('').map((c) => L((A.indexOf(c) + k + 26) % 26)).join('');
  const TRI = [['CAT', 'DOG', 'COG'], ['PEN', 'HAT', 'NAP'], ['SUN', 'MAP', 'SPAN'], ['FISH', 'BOAT', 'BATH'], ['LAMP', 'RING', 'GRIP'], ['STAR', 'MOON', 'ROAM'], ['BIRD', 'CAKE', 'BAKE'], ['FROG', 'LIME', 'FILM'], ['DUCK', 'STEP', 'TUCK'], ['WOLF', 'MAZE', 'FOAM'], ['TREE', 'SHIP', 'PIER'], ['KITE', 'MOLD', 'TOLD']];
  const codeBox = (s) => `<span class="code">${s}</span>`;
  function codes(r, lvl) {
    const type = lvl === 1 ? r.pick(['shift1', 'sum']) : lvl === 2 ? r.pick(['shiftk', 'decode', 'reverse']) : r.pick(['subst', 'subst', 'positions', 'shiftrev']);
    const [w1, w2] = r.sample(WORDS, 2);
    if (type === 'shift1' || type === 'shiftk') {
      const k = type === 'shift1' ? 1 : r.pick([2, 3, -1]);
      const ans = shift(w2, k);
      const wrongs = [shift(w2, -k), shift(w2, k + 1), shift(w2, k - 1 || 2), w2.split('').reverse().join(''), shift(w2[0], k) + w2.slice(1), shift(w2, k).split('').reverse().join('')].map((x) => ({ h: codeBox(x), k: x, why: 'Use the same shift on every letter.' }));
      return Object.assign({ prompt: `In a secret code, <b>${w1}</b> is written as <b>${shift(w1, k)}</b>. How is <b>${w2}</b> written in the same code?`, stem: '',
        explain: `<p>Each letter moves ${Math.abs(k)} place${Math.abs(k) > 1 ? 's' : ''} ${k > 0 ? 'forward' : 'back'} in the alphabet: ${w1.split('').map((c, i) => `${c}→${shift(w1, k)[i]}`).join(', ')}.</p><p>So ${w2} becomes ${w2.split('').map((c, i) => `${c}→${ans[i]}`).join(', ')} = <b>${ans}</b>.</p>` }, mc(r, { h: codeBox(ans), k: ans }, wrongs, 5));
    }
    if (type === 'decode') {
      const k = r.pick([1, 2]);
      const code = shift(w2, k);
      const pool = WORDS.filter((x) => x.length === w2.length && x !== w2);
      const wrongs = r.shuffle(pool).slice(0, 3).map((x) => ({ h: codeBox(x), k: x, why: `Shift each letter of ${code} back ${k}.` })).concat([{ h: codeBox(shift(code, k)), k: shift(code, k), why: `To decode, go BACK ${k}, not forward.` }]);
      return Object.assign({ prompt: `In a code, <b>${w1}</b> is written <b>${shift(w1, k)}</b>. What word is written as <b>${code}</b>?`, stem: '',
        explain: `<p>The code moves every letter ${k} forward (${w1[0]}→${shift(w1, k)[0]}). To decode, move each letter ${k} back: ${code.split('').map((c, i) => `${c}→${w2[i]}`).join(', ')} = <b>${w2}</b>.</p>` }, mc(r, { h: codeBox(w2), k: w2 }, wrongs, 5));
    }
    if (type === 'reverse' || type === 'shiftrev') {
      const enc = (x) => (type === 'reverse' ? x.split('').reverse().join('') : shift(x, 1).split('').reverse().join(''));
      const ans = enc(w2);
      const wrongs = [w2, w2.split('').reverse().join(''), shift(w2, 1), w2.slice(1) + w2[0], ans.slice(1) + ans[0], shift(w2, -1).split('').reverse().join('')].filter((x) => x !== ans).map((x) => ({ h: codeBox(x), k: x, why: type === 'reverse' ? 'The code writes the word backwards.' : 'The code moves each letter forward 1 AND writes it backwards.' }));
      return Object.assign({ prompt: `In a code, <b>${w1}</b> is written <b>${enc(w1)}</b>. How is <b>${w2}</b> written?`, stem: '',
        explain: type === 'reverse' ? `<p>The code writes the word backwards: ${w1} → ${enc(w1)}. So ${w2} → <b>${ans}</b>.</p>` : `<p>Two steps: move each letter forward 1 (${w1} → ${shift(w1, 1)}), then write it backwards (→ ${enc(w1)}).</p><p>${w2} → ${shift(w2, 1)} → <b>${ans}</b>.</p>` }, mc(r, { h: codeBox(ans), k: ans }, wrongs, 5));
    }
    if (type === 'sum') {
      const word = r.pick(['BAD', 'CAB', 'BED', 'FED', 'ACE', 'DAB', 'BEG', 'FIG', 'HIDE', 'CAGE', 'FACE', 'BEAD']);
      const vals = word.split('').map((c) => A.indexOf(c) + 1);
      const ans = PP.sum(vals);
      return Object.assign({ prompt: `If A = 1, B = 2, C = 3 and so on, what do the letters of <b>${word}</b> add up to?`, stem: '',
        explain: `<p class="work">${word.split('').map((c, i) => `${c} = ${vals[i]}`).join(', ')} → ${vals.join(' + ')} = <b>${ans}</b></p>` }, mc(r, PP.num(ans), PP.nearMiss(ans), 5));
    }
    if (type === 'positions') {
      const ans = w2.split('').map((c) => A.indexOf(c) + 1).join('-');
      const wrongs = [w2.split('').reverse().map((c) => A.indexOf(c) + 1).join('-'), w2.split('').map((c) => A.indexOf(c) + 2).join('-'), w2.split('').map((c, i) => A.indexOf(c) + (i === 1 ? 2 : 1)).join('-'), w2.split('').map((c) => A.indexOf(c)).join('-')].map((x) => ({ h: codeBox(x), k: x, why: 'Each number is the letter’s place in the alphabet (A = 1).' }));
      return Object.assign({ prompt: `In a code, <b>${w1}</b> is written <b>${w1.split('').map((c) => A.indexOf(c) + 1).join('-')}</b>. How is <b>${w2}</b> written?`, stem: '',
        explain: `<p>Each letter becomes its position in the alphabet: ${w2.split('').map((c) => `${c} = ${A.indexOf(c) + 1}`).join(', ')} → <b>${ans}</b>.</p>` }, mc(r, { h: codeBox(ans), k: ans }, wrongs, 5));
    }
    // substitution: deduce letter → digit from two examples
    const [a, b, t] = r.pick(TRI);
    const letters = [...new Set((a + b).split(''))];
    const digits = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], letters.length);
    const map = {}; letters.forEach((c, i) => { map[c] = digits[i]; });
    const enc = (x) => x.split('').map((c) => map[c]).join('');
    const ans = enc(t);
    const wrongs = [];
    const perm = (s) => r.shuffle(s.split('')).join('');
    for (let i = 0; i < 12; i++) { const p = perm(ans); if (p !== ans) wrongs.push({ h: codeBox(p), k: p, why: 'The right digits, but in the wrong order. Write the code for each letter in order.' }); }
    const one = ans.split(''); one[r.int(0, one.length - 1)] = String(r.pick(digits.filter((d) => !ans.includes(String(d))).concat([0]))); wrongs.unshift({ h: codeBox(one.join('')), k: one.join(''), why: 'One digit doesn’t match its letter.' });
    return Object.assign({ prompt: `In a secret number code, <b>${a}</b> is written <b>${enc(a)}</b> and <b>${b}</b> is written <b>${enc(b)}</b>. How is <b>${t}</b> written?`, stem: '',
      explain: `<p>Match each letter to its digit: ${letters.map((c) => `${c} = ${map[c]}`).join(', ')}.</p><p>${t} → ${t.split('').map((c) => map[c]).join(' ')} = <b>${ans}</b>.</p>` }, mc(r, { h: codeBox(ans), k: ans }, wrongs, 5));
  }

  // ================= SENTENCE ARRANGEMENT (OLSAT) =================
  const SENT = PP.lines(PP.BANK.arrange);
  function arrange(r, lvl) {
    const pool = SENT.filter((s) => { const n = s.split(' ').length; return lvl === 1 ? n <= 5 : lvl === 2 ? n <= 6 : n >= 5; });
    const s = r.pick(pool.length ? pool : SENT);
    const words = s.split(' ');
    const low = (x, i) => (i === 0 && !/^(Tom's|Zara|My|Our)$/.test(x) ? x.toLowerCase() : x === 'My' || x === 'Our' ? x.toLowerCase() : x);
    const shown = words.map(low);
    const uniqueIdx = PP.range(words.length).filter((i) => shown.filter((x) => x === shown[i]).length === 1);
    const ask = lvl === 1 ? r.pick(['last', 'first']) : r.pick(['last', 'first', 'nth', 'nth']);
    let idx;
    if (ask === 'last') idx = words.length - 1;
    else if (ask === 'first') idx = 0;
    else idx = r.int(1, words.length - 2);
    if (!uniqueIdx.includes(idx)) throw new Error('dup word');
    let scr = r.shuffle(shown); for (let t = 0; t < 5 && scr.join(' ') === shown.join(' '); t++) scr = r.shuffle(shown);
    const q = ask === 'last' ? 'Which word would come <b>last</b>?' : ask === 'first' ? 'Which word would come <b>first</b>?' : `Which word would be <b>${PP.ord(idx + 1)}</b>?`;
    const others = [...new Set(shown.filter((x, i) => i !== idx && x !== shown[idx]))];
    const res = mc(r, { h: esc(shown[idx]), k: shown[idx] }, r.shuffle(others).map((x) => ({ h: esc(x), k: x, why: `Put the words in order first: “${s}.” Then count.` })), Math.min(4, others.length + 1));
    return Object.assign({ prompt: `If these words were put in order to make a good sentence, ${q.charAt(0).toLowerCase() + q.slice(1)}`, stem: `<div class="wordset">${scr.map((x) => `<span class="word">${esc(x)}</span>`).join('')}</div>`,
      explain: `<p>The sentence is: <b>${esc(s)}.</b></p><p>The ${ask === 'last' ? 'last' : ask === 'first' ? 'first' : PP.ord(idx + 1)} word is <b>${esc(shown[idx])}</b>.</p>` }, res);
  }

  PP.addChapter({ id: 'letter-series', group: 'verbal', name: 'Letter Series', exams: 'OLSAT · aptitude tests', gen: letterSeries,
    tip: 'Turn letters into numbers (A = 1, B = 2…) and look at the jumps. Write the alphabet at the top of your scrap paper.' });
  PP.addChapter({ id: 'codes', group: 'verbal', name: 'Codes & Ciphers', exams: 'Aptitude & reasoning tests', gen: codes,
    tip: 'Line up the word and its code letter by letter and see what happened to each one.' });
  PP.addChapter({ id: 'arrange', group: 'verbal', name: 'Sentence Arrangement', exams: 'OLSAT verbal comprehension', gen: arrange, nOpts: 4,
    tip: 'Find who or what the sentence is about, then the action, then the rest. Say it in your head before you count.' });
})();
