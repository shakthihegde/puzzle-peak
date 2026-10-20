'use strict';
// Figure renderer: shapes drawn into a 100x100 tile. Tiles are always "paper" (light) so
// black / white / striped / grey read the same way they do in a printed test booklet.
(function () {
  const F = (PP.fig = {});
  const INK = '#1b2440', PAPER = '#ffffff', GREY = '#a3abbd';
  F.INK = INK; F.PAPER = PAPER;
  F.FILL = { w: PAPER, b: INK, h: 'url(#pp-hatch)', g: GREY, d: 'url(#pp-dots)' };
  F.fillName = { w: 'white', b: 'black', h: 'striped', g: 'grey', d: 'dotted' };
  F.FILLS = ['w', 'b', 'h', 'g'];

  const poly = (pts) => [['M', ...pts[0]], ...pts.slice(1).map((p) => ['L', ...p]), ['Z']];
  const ngon = (n, rad, start, dy) => PP.range(n).map((k) => {
    const a = ((start + (360 / n) * k) * Math.PI) / 180;
    return [rad * Math.cos(a), rad * Math.sin(a) + (dy || 0)];
  });
  const star = () => PP.range(10).map((k) => {
    const a = ((-90 + 36 * k) * Math.PI) / 180, rr = k % 2 ? 0.42 : 1;
    return [rr * Math.cos(a), rr * Math.sin(a) + 0.05];
  });

  // sym: rotational symmetry in degrees (360 = none). axis: mirror axis angle in base frame (null = chiral).
  F.SH = {
    circle: { name: 'circle', sym: 1, axis: 0, sides: 0, path: null },
    square: { name: 'square', sym: 90, axis: 0, sides: 4, path: poly([[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]]) },
    rect: { name: 'rectangle', sym: 180, axis: 0, sides: 4, path: poly([[-0.95, -0.55], [0.95, -0.55], [0.95, 0.55], [-0.95, 0.55]]) },
    diamond: { name: 'diamond', sym: 180, axis: 0, sides: 4, path: poly([[0, -1], [0.68, 0], [0, 1], [-0.68, 0]]) },
    trap: { name: 'trapezoid', sym: 360, axis: 90, sides: 4, path: poly([[-0.5, -0.6], [0.5, -0.6], [0.95, 0.6], [-0.95, 0.6]]) },
    triangle: { name: 'triangle', sym: 120, axis: 90, sides: 3, path: poly(ngon(3, 1, -90, 0.15)) },
    rtri: { name: 'right triangle', sym: 360, axis: 135, sides: 3, path: poly([[-0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) },
    pentagon: { name: 'pentagon', sym: 72, axis: 90, sides: 5, path: poly(ngon(5, 0.95, -90, 0.06)) },
    hexagon: { name: 'hexagon', sym: 60, axis: 0, sides: 6, path: poly(ngon(6, 0.95, 0, 0)) },
    octagon: { name: 'octagon', sym: 45, axis: 0, sides: 8, path: poly(ngon(8, 0.95, 22.5, 0)) },
    star: { name: 'star', sym: 72, axis: 90, sides: 10, path: poly(star()) },
    cross: { name: 'cross', sym: 90, axis: 0, sides: 12, path: poly([[-0.3, -0.9], [0.3, -0.9], [0.3, -0.3], [0.9, -0.3], [0.9, 0.3], [0.3, 0.3], [0.3, 0.9], [-0.3, 0.9], [-0.3, 0.3], [-0.9, 0.3], [-0.9, -0.3], [-0.3, -0.3]]) },
    heart: { name: 'heart', sym: 360, axis: 90, sides: 0, path: [['M', 0, 0.88], ['C', -1.35, -0.05, -0.65, -1.1, 0, -0.42], ['C', 0.65, -1.1, 1.35, -0.05, 0, 0.88], ['Z']] },
    moon: { name: 'moon', sym: 360, axis: 0, sides: 0, path: [['M', 0.5333, -0.8459], ['A', 1, 1, 0, 1, 0, 0.5333, 0.8459], ['A', 0.85, 0.85, 0, 1, 1, 0.5333, -0.8459], ['Z']] },
    arrow: { name: 'arrow', sym: 360, axis: 0, sides: 7, path: poly([[-0.92, -0.26], [0.18, -0.26], [0.18, -0.62], [0.95, 0], [0.18, 0.62], [0.18, 0.26], [-0.92, 0.26]]) },
    pac: { name: 'pac-man', sym: 360, axis: 0, sides: 0, path: [['M', 0, 0], ['L', 0.819, -0.574], ['A', 1, 1, 0, 1, 0, 0.819, 0.574], ['Z']] },
    lshape: { name: 'L-shape', sym: 360, axis: null, sides: 6, path: poly([[-0.6, -0.9], [-0.08, -0.9], [-0.08, 0.38], [0.65, 0.38], [0.65, 0.9], [-0.6, 0.9]]) },
    flag: { name: 'flag', sym: 360, axis: null, sides: 0, path: [['M', -0.62, -0.92], ['L', -0.44, -0.92], ['L', -0.44, 0.92], ['L', -0.62, 0.92], ['Z'], ['M', -0.44, -0.92], ['L', 0.78, -0.52], ['L', -0.44, -0.12], ['Z']] },
  };
  F.ROT = ['arrow', 'pac', 'moon', 'flag', 'lshape', 'heart']; // visibly change when turned
  F.BASIC = ['circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon', 'star', 'cross', 'heart'];
  F.POLY = ['triangle', 'square', 'pentagon', 'hexagon'];

  const rad = (d) => (d * Math.PI) / 180;
  const n2 = (v) => Math.round(v * 100) / 100;

  // transform a base path: flip (x→-x) in base frame, rotate r clockwise, scale s, translate cx,cy
  function tpath(cmds, cx, cy, s, r, fl) {
    const c = Math.cos(rad(r)), sn = Math.sin(rad(r));
    const tp = (x, y) => { if (fl) x = -x; return [n2(cx + s * (x * c - y * sn)), n2(cy + s * (x * sn + y * c))]; };
    let d = '';
    for (const cmd of cmds) {
      const t = cmd[0];
      if (t === 'Z') d += 'Z';
      else if (t === 'M' || t === 'L') d += t + tp(cmd[1], cmd[2]).join(' ') + ' ';
      else if (t === 'C') d += 'C' + [tp(cmd[1], cmd[2]), tp(cmd[3], cmd[4]), tp(cmd[5], cmd[6])].map((p) => p.join(' ')).join(' ') + ' ';
      else if (t === 'A') {
        const p = tp(cmd[6], cmd[7]);
        const sweep = fl ? 1 - cmd[5] : cmd[5];
        d += `A${n2(cmd[1] * s)} ${n2(cmd[2] * s)} 0 ${cmd[4]} ${sweep} ${p[0]} ${p[1]} `;
      }
    }
    return d.trim();
  }

  F.shape = function (s, cx, cy, size, rot, fill, fl, sw) {
    const def = F.SH[s];
    const stroke = `stroke="${INK}" stroke-width="${sw || 2.6}" stroke-linejoin="round"`;
    const f = F.FILL[fill] || fill;
    if (!def.path) return `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(size * 0.92)}" fill="${f}" ${stroke}/>`;
    return `<path d="${tpath(def.path, cx, cy, size, rot || 0, fl)}" fill="${f}" ${stroke} fill-rule="evenodd"/>`;
  };

  const LAYOUT = {
    1: [[50, 50]],
    2: [[28, 50], [72, 50]],
    3: [[50, 28], [28, 71], [72, 71]],
    4: [[29, 29], [71, 29], [29, 71], [71, 71]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[24, 32], [50, 32], [76, 32], [24, 68], [50, 68], [76, 68]],
  };
  const LR = { 1: 34, 2: 19, 3: 17, 4: 17, 5: 12.5, 6: 12.5 };
  const ZS = { 1: 0.5, 2: 0.74, 3: 1 };
  F.DOTS = [[14, 14], [50, 9], [86, 14], [91, 50], [86, 86], [50, 91], [14, 86], [9, 50]];

  // spec: {s, f, z, r, fl, n, in:{s,f}, dot, frame}
  F.inner = function (sp) {
    const n = sp.n || 1, R = LR[n] * ZS[sp.z || 3] * (sp.frame ? 0.82 : 1);
    let out = '';
    if (sp.frame) out += `<rect x="4" y="4" width="92" height="92" rx="6" fill="none" stroke="#c9cfdb" stroke-width="1.5"/>`;
    for (const [x, y] of LAYOUT[n]) {
      const cx = sp.frame ? 50 + (x - 50) * 0.8 : x, cy = sp.frame ? 50 + (y - 50) * 0.8 : y;
      out += F.shape(sp.s, cx, cy, R, sp.r, sp.f, sp.fl);
      if (sp.in) out += F.shape(sp.in.s, cx, cy, R * 0.38, sp.r, sp.f === 'b' ? 'w' : 'b', sp.fl, 2);
    }
    if (sp.dot !== undefined && sp.dot !== null) {
      const [x, y] = F.DOTS[sp.dot];
      out += `<circle cx="${x}" cy="${y}" r="5.2" fill="${INK}"/>`;
    }
    return out;
  };
  F.svg = (sp, cls) => `<svg viewBox="0 0 100 100" class="fig ${cls || ''}" aria-hidden="true">${typeof sp === 'string' ? sp : F.inner(sp)}</svg>`;
  F.blank = () => `<svg viewBox="0 0 100 100" class="fig q" aria-hidden="true"><text x="50" y="66" text-anchor="middle" font-size="46" font-weight="700" fill="${INK}" opacity=".35">?</text></svg>`;

  F.clone = (o) => JSON.parse(JSON.stringify(o));
  // screen-space mirror (left↔right)
  F.mirror = (sp) => { const o = F.clone(sp); o.r = -(o.r || 0); o.fl = !o.fl; return o; };
  const lcm = (a, b) => PP.lcm(a, b);
  F.canon = function (sp) {
    const o = F.clone(sp); const d = F.SH[o.s];
    o.r = o.r || 0; o.fl = !!o.fl; o.n = o.n || 1; o.z = o.z || 3;
    let sym = d.sym;
    if (o.in) sym = Math.min(360, lcm(sym, F.SH[o.in.s].sym));
    if (o.fl && d.axis !== null && (!o.in || F.SH[o.in.s].axis !== null)) { o.r += 180 - 2 * d.axis; o.fl = false; }
    o.r = ((o.r % sym) + sym) % sym;
    if (d.sym === 1 && (!o.in || F.SH[o.in.s].sym === 1)) o.r = 0;
    return o;
  };
  F.key = function (sp) {
    const o = F.canon(sp);
    return [o.s, o.f, o.z, o.r, o.fl ? 1 : 0, o.n, o.in ? o.in.s : '', o.dot === undefined ? '' : o.dot, o.frame ? 1 : 0].join('|');
  };
  F.opt = (sp, why) => ({ h: F.svg(sp), k: F.key(sp), why });

  const DIRS = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'];
  F.dirName = (r) => DIRS[(((Math.round(r / 45)) % 8) + 8) % 8];
  F.sizeName = { 1: 'small', 2: 'medium', 3: 'big' };
  F.nameOf = (s, n) => {
    const nm = F.SH[s].name;
    if (n === 1 || n === undefined) return nm;
    return nm === 'cross' ? 'crosses' : nm + 's';
  };
  F.desc = function (sp, opts) {
    opts = opts || {};
    const n = sp.n || 1;
    const parts = [];
    if (opts.size) parts.push(F.sizeName[sp.z || 3]);
    parts.push(F.fillName[sp.f]);
    let d = (n === 1 ? (/^[aeiou]/.test(parts[0]) ? 'an ' : 'a ') : PP.words[n] + ' ') + parts.join(' ') + ' ' + F.nameOf(sp.s, n);
    if (['arrow', 'pac'].includes(sp.s)) d += ` pointing ${F.dirName(F.canon(sp).r)}`;
    if (sp.in) d += ` with a dot inside`;
    return d;
  };

  // shared <defs>: hatch + dots patterns
  F.DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <pattern id="pp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${PAPER}"/><line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-width="2.6"/></pattern>
  <pattern id="pp-dots" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${PAPER}"/><circle cx="3.5" cy="3.5" r="1.4" fill="${INK}"/></pattern>
  </defs></svg>`;

  // ---- grid/polyomino helpers shared by spatial generators ----
  F.cellsSvg = function (cells, opts) {
    opts = opts || {};
    const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
    const w = Math.max(...xs) + 1, h = Math.max(...ys) + 1;
    const span = Math.max(w, h, opts.minSpan || 0);
    const u = 84 / span, ox = 50 - (w * u) / 2, oy = 50 - (h * u) / 2;
    let out = '';
    cells.forEach((c, i) => {
      const x = ox + c[0] * u, y = oy + c[1] * u;
      const fill = opts.fill ? opts.fill(c, i) : '#5fb3a6';
      out += `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(u)}" height="${n2(u)}" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
      if (opts.label) {
        const lb = opts.label(c, i);
        if (lb) out += `<text x="${n2(x + u / 2)}" y="${n2(y + u / 2 + u * 0.17)}" text-anchor="middle" font-size="${n2(u * 0.5)}" font-weight="700" font-family="system-ui,sans-serif" fill="${INK}">${lb}</text>`;
      }
    });
    return F.svg(out, opts.cls);
  };
})();
