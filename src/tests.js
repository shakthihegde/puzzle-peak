'use strict';
// Timed tests modelled on the published structure of each exam (section order, item counts, timing).
(function () {
  const T = (t) => { PP.tests.push(t); PP.testById[t.id] = t; };
  PP.tests = [];
  T({ id: 'cogat-mini', mixed: true, name: 'CogAT / CCAT Mini', exam: 'CogAT · CCAT', blurb: 'All 9 subtests, 6 questions each, 3 minutes per subtest. A quick taste of the whole test.',
    sections: [['analogies', 'Verbal Analogies'], ['sentences', 'Sentence Completion'], ['classify', 'Verbal Classification'], ['number-analogies', 'Number Analogies'], ['number-puzzles', 'Number Puzzles'], ['number-series', 'Number Series'], ['figure-matrices', 'Figure Matrices'], ['paper-folding', 'Paper Folding'], ['figure-classify', 'Figure Classification']].map(([ch, title]) => ({ title, mix: [[ch, 6]], min: 3 })) });
  T({ id: 'cogat-verbal', name: 'CogAT / CCAT Verbal', exam: 'CogAT · CCAT', full: true, blurb: 'The verbal battery at full length: three subtests, 10 minutes each.',
    sections: [{ title: 'Verbal Analogies', mix: [['analogies', 22]], min: 10 }, { title: 'Sentence Completion', mix: [['sentences', 20]], min: 10 }, { title: 'Verbal Classification', mix: [['classify', 20]], min: 10 }] });
  T({ id: 'cogat-quant', name: 'CogAT / CCAT Quantitative', exam: 'CogAT · CCAT', full: true, blurb: 'The quantitative battery at full length: three subtests, 10 minutes each.',
    sections: [{ title: 'Number Analogies', mix: [['number-analogies', 18]], min: 10 }, { title: 'Number Puzzles', mix: [['number-puzzles', 16]], min: 10 }, { title: 'Number Series', mix: [['number-series', 18]], min: 10 }] });
  T({ id: 'cogat-nonverbal', name: 'CogAT / CCAT Nonverbal', exam: 'CogAT · CCAT', full: true, blurb: 'The nonverbal battery at full length: three subtests, 10 minutes each.',
    sections: [{ title: 'Figure Matrices', mix: [['figure-matrices', 22]], min: 10 }, { title: 'Paper Folding', mix: [['paper-folding', 16]], min: 10 }, { title: 'Figure Classification', mix: [['figure-classify', 22]], min: 10 }] });
  T({ id: 'olsat', mixed: true, name: 'OLSAT Style', exam: 'OLSAT Level D/E', full: true, blurb: 'Verbal and nonverbal questions mixed together (“spiral” order) like the OLSAT. One 40-minute section.',
    sections: [{ title: 'Mixed reasoning', min: 40, shuffle: true, mix: [['sentences', 4], ['vocab', 4], ['arrange', 4], ['directions', 4], ['analogies', 4], ['classify', 3], ['reasoning', 4], ['word-problems', 4], ['figure-matrices', 3], ['figure-series', 3], ['figure-classify', 3], ['pattern-grids', 3], ['number-series', 3], ['number-grids', 2]] }] });
  T({ id: 'nnat', name: 'NNAT Style', exam: 'NNAT3', full: true, blurb: 'Shapes and patterns only, no reading or math. 48 questions in 30 minutes.',
    sections: [{ title: 'Nonverbal matrices', min: 30, shuffle: true, mix: [['pattern-completion', 12], ['figure-matrices', 10], ['pattern-grids', 12], ['overlay', 7], ['paper-folding', 7]] }] });
  T({ id: 'isee', name: 'ISEE Lower Style', exam: 'ISEE Lower Level', full: true, blurb: 'For grades 5–6 entrance: vocabulary & sentence completion, then quantitative reasoning.',
    sections: [{ title: 'Verbal Reasoning', min: 20, mix: [['vocab', 17], ['sentences', 17]] }, { title: 'Quantitative Reasoning', min: 35, shuffle: true, mix: [['word-problems', 19], ['math-stretch', 19]] }] });
  T({ id: 'contest', name: 'Math Contest', exam: 'Math Kangaroo · Gauss', blurb: '24 contest-style problems that get harder as you go. 60 minutes, no calculator.',
    sections: [{ title: 'Contest', min: 60, ramp: true, mix: [['contest', 12], ['math-stretch', 6], ['logic', 2], ['cube-count', 2], ['cube-nets', 2]] }] });
  T({ id: 'mock', mixed: true, name: 'Mixed Mock Test', exam: 'All question types', blurb: '40 questions from all four areas, shuffled together, getting harder as you go. 30 minutes.',
    sections: [{ title: 'Mixed', min: 30, balanced: 40 }] });
  T({ id: 'cogat-full', mixed: true, full: true, name: 'CogAT / CCAT Full Test', exam: 'CogAT · CCAT', blurb: 'All three batteries back to back at real length: 9 subtests, 10 minutes each (90 minutes). Best done in two sittings at home.',
    sections: [['analogies', 'Verbal Analogies', 22], ['sentences', 'Sentence Completion', 20], ['classify', 'Verbal Classification', 20], ['number-analogies', 'Number Analogies', 18], ['number-puzzles', 'Number Puzzles', 16], ['number-series', 'Number Series', 18], ['figure-matrices', 'Figure Matrices', 22], ['paper-folding', 'Paper Folding', 16], ['figure-classify', 'Figure Classification', 22]].map(([ch, title, n]) => ({ title, mix: [[ch, n]], min: 10 })) });
  T({ id: 'sprint', mixed: true, name: 'Brain Sprint', exam: 'Everything', blurb: '20 questions from 20 different chapters in 12 minutes. Great for a quick daily workout.',
    sections: [{ title: 'Sprint', min: 12, sprint: 20 }] });

  PP.FORMS = ['A', 'B', 'C', 'D', 'E', 'F'];
  PP.testForm = function (t, form) {
    return t.sections.map((s, si) => {
      const key = `${t.id}/${form}/${si}`;
      let refs = [];
      if (s.balanced) refs = PP.balanced(PP.rng(PP.hash(key)), s.balanced, PP.rotatePick(key), (slot) => PP.ramp(slot, s.balanced), key);
      else if (s.sprint) {
        const r = PP.rng(PP.hash(key));
        const chs = r.sample(PP.chapters.map((c) => c.id), s.sprint);
        chs.forEach((ch, j) => { refs = refs.concat(PP.pickRefs(ch, 1, key + '/' + ch, () => (j < 6 ? 1 : j < 14 ? 2 : 3))); });
      } else {
        s.mix.forEach(([ch, n]) => { refs = refs.concat(PP.pickRefs(ch, n, key + '/' + ch, PP.ramp)); });
        if (s.shuffle) refs = PP.rng(PP.hash(key + '/order')).shuffle(refs);
        if (s.ramp) refs.sort((a, b) => a.lvl - b.lvl);
      }
      return { title: s.title, min: s.min, refs };
    });
  };
  PP.testSize = (t) => t.sections.reduce((n, s) => n + (s.balanced || s.sprint || s.mix.reduce((m, x) => m + x[1], 0)), 0);
  PP.testMinutes = (t) => t.sections.reduce((n, s) => n + s.min, 0);

  // ---------- mixed practice ----------
  // n questions spread evenly over the four groups and interleaved, so the same group never comes twice in a row.
  // pickCh(groupChapterIds, k, r) chooses k chapters; lvlFn(slot, ch) gives each question's level.
  PP.balanced = function (r, n, pickCh, lvlFn, key) {
    const G = PP.groups.map((g) => PP.chapters.filter((c) => c.group === g.id).map((c) => c.id));
    const counts = G.map(() => Math.floor(n / G.length));
    r.sample(PP.range(G.length), n % G.length).forEach((g) => counts[g]++);
    const queues = G.map((chs, g) => { const out = []; while (out.length < counts[g]) out.push(...pickCh(chs, Math.min(chs.length, counts[g] - out.length), r)); return out; });
    const seq = []; let last = -1;
    while (seq.length < n) {
      let order = r.shuffle(PP.range(G.length).filter((g) => queues[g].length));
      if (order.length > 1 && order[0] === last) order = order.slice(1).concat(order[0]);
      for (const g of order) { seq.push(queues[g].shift()); last = g; }
    }
    return seq.map((ch, slot) => PP.pickRefs(ch, 1, key + '/' + slot + '/' + ch, () => lvlFn(slot, ch))[0]);
  };
  // walk each group's chapters in a fixed shuffled order, so every chapter keeps coming round
  PP.rotatePick = (key) => { let calls = 0; return (chs, k, r) => { const order = PP.rng(PP.hash('rot/' + chs[0])).shuffle(chs); const start = (PP.hash(key) + calls++ * k) % order.length; return PP.range(k).map((j) => order[(start + j) % order.length]); }; };
  PP.MIX_SETS = 40;
  PP.MIX_N = 12;
  PP.mixLevel = (i) => (i < 10 ? 1 : i < 25 ? 2 : 3);
  PP.mixRefs = function (i) {
    const k = PP.MIX_N / 4;
    const pick = (chs, kk) => { const order = PP.rng(PP.hash('mixorder/' + chs[0])).shuffle(chs); return PP.range(kk).map((j) => order[(i * k + j) % order.length]); };
    return PP.balanced(PP.rng(PP.hash('mix/' + i)), PP.MIX_N, pick, () => PP.mixLevel(i), 'mix/' + i);
  };
  PP.dailyRefs = function (dateStr) {
    return PP.balanced(PP.rng(PP.hash('daily/' + dateStr)), 10, PP.rotatePick('daily/' + dateStr), (slot) => (slot < 3 ? 1 : slot < 7 ? 2 : 3), 'daily/' + dateStr);
  };

})();
