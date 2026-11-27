/* The interactives for practice.html: loaded only when one is shown (see ixReady in practice.html).
   After changing this file, run  python3 walks/ix-split.py  so the index in practice.html matches. */
// ---- Unit circle: drag the point; sin, cos, tan (and the reciprocals) update; the quadrant's signs and the reference angle show
const IX_EXACT = { // reference angle -> [sin, cos, tan, csc, sec, cot] (first-quadrant values)
  0: ['0', '1', '0', 'undefined', '1', 'undefined'], 30: ['1/2', '√3/2', '√3/3', '2', '2√3/3', '√3'], 45: ['√2/2', '√2/2', '1', '√2', '√2', '1'],
  60: ['√3/2', '1/2', '√3', '2√3/3', '2', '√3/3'], 90: ['1', '0', 'undefined', '1', 'undefined', '0'] };
IX.unitCircle = { subjects: ['precalc'],
  title: 'The unit circle', hint: 'Drag the point around the circle (or use the buttons). Watch the signs change from quadrant to quadrant.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 520), ctx = cv._ctx; main.append(cv);
    const S = { deg: +o.deg || 30, snap: o.snap !== '0', ref: o.ref !== '0', recip: o.recip === '1', vals: o.vals !== '0' };
    const cx = 280, cy = 262, R = 200;
    const P = () => [cx + R * Math.cos(S.deg * Math.PI / 180), cy - R * Math.sin(S.deg * Math.PI / 180)];
    const exactOK = () => S.deg % 30 === 0 || S.deg % 45 === 0;
    const quad = () => { const d = ((S.deg % 360) + 360) % 360; return d % 90 === 0 ? 0 : Math.ceil(d / 90); };
    const refAng = () => { const d = ((S.deg % 360) + 360) % 360; return d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d; };
    const vals = () => {
      const t = S.deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), z = (v) => (Math.abs(v) < 1e-12 ? 0 : v);
      const num = [z(s), z(c), Math.abs(c) < 1e-12 ? NaN : z(s / c), Math.abs(s) < 1e-12 ? NaN : 1 / s, Math.abs(c) < 1e-12 ? NaN : 1 / c, Math.abs(s) < 1e-12 ? NaN : z(c / s)];
      if (!exactOK()) return num.map((v) => (isFinite(v) ? '≈ ' + ixN(v, 3) : 'undefined'));
      const base = IX_EXACT[refAng()], sg = [Math.sign(z(s)), Math.sign(z(c)), Math.sign(z(s)) * Math.sign(z(c)), Math.sign(z(s)), Math.sign(z(c)), Math.sign(z(s)) * Math.sign(z(c))];
      return base.map((v, i) => (v === 'undefined' || v === '0' ? v : (sg[i] < 0 ? '−' : '') + v));
    };
    const angText = () => { const r = S.deg / 180; return `${ixN(S.deg)}° = ${S.deg % 15 === 0 ? ixPi(r) : ixN(S.deg * Math.PI / 180, 3)}${S.deg % 15 === 0 ? '' : ' radians'}`; };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      const q = quad(), names = ['', 'I', 'II', 'III', 'IV'], tips = ['', 'All +', 'sin +', 'tan +', 'cos +'];
      // the current quadrant, shaded
      if (q) { ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.07)'; const xs = q === 1 || q === 4 ? cx : 0, ys = q <= 2 ? 0 : cy; ctx.fillRect(xs, ys, q === 1 || q === 4 ? cv._w - cx : cx, q <= 2 ? cy : cv._h - cy); ctx.restore(); }
      [[1, cv._w - 16, 16, 'right'], [2, 16, 16, 'left'], [3, 16, cv._h - 44, 'left'], [4, cv._w - 16, cv._h - 44, 'right']].forEach(([k, x, y, al]) => {
        ixLabel(ctx, `${names[k]}: ${tips[k]}`, x, y, 18, al, k === q ? IXC.blue : '#b0aca2'); });
      ixLine(ctx, [20, cy], [cv._w - 20, cy], IXC.ink, 1.6); ixLine(ctx, [cx, 14], [cx, cv._h - 14], IXC.ink, 1.6);
      ixLabel(ctx, '1', cx + R + 4, cy + 4, 15, 'left', IXC.axis); ixLabel(ctx, '−1', cx - R - 6, cy + 4, 15, 'right', IXC.axis);
      ixLabel(ctx, '1', cx + 6, cy - R - 18, 15, 'left', IXC.axis); ixLabel(ctx, '−1', cx + 6, cy + R + 2, 15, 'left', IXC.axis);
      ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
      // special angle ticks
      ctx.save(); ctx.strokeStyle = '#c9c5bb'; ctx.lineWidth = 1.5;
      for (let d = 0; d < 360; d += 15) if (d % 30 === 0 || d % 45 === 0) { const a = d * Math.PI / 180; ctx.beginPath(); ctx.moveTo(cx + (R - 7) * Math.cos(a), cy - (R - 7) * Math.sin(a)); ctx.lineTo(cx + (R + 7) * Math.cos(a), cy - (R + 7) * Math.sin(a)); ctx.stroke(); }
      ctx.restore();
      const [px, py] = P(), t = S.deg * Math.PI / 180;
      // the angle θ from the positive x-axis
      ctx.save(); ctx.strokeStyle = IXC.purple; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, -t, t > 0); ctx.stroke(); ctx.restore();
      ixLabel(ctx, 'θ', cx + 46 * Math.cos(t / 2), cy - 46 * Math.sin(t / 2), 20, 'center', IXC.purple, 'middle');
      // the reference angle, between the terminal side and the x-axis
      if (S.ref && quad() > 1) {
        const d = ((S.deg % 360) + 360) % 360, tt = d * Math.PI / 180;
        const [s0, s1] = d < 90 ? [0, tt] : d < 180 ? [tt, Math.PI] : d < 270 ? [Math.PI, tt] : [tt, 2 * Math.PI];
        ctx.save(); ctx.fillStyle = 'rgba(210,123,18,.28)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 70, -s0, -s1, true);
        ctx.closePath(); ctx.fill(); ctx.restore();
        const mid = (s0 + s1) / 2;
        ixLabel(ctx, 'θ′', cx + 92 * Math.cos(mid), cy - 92 * Math.sin(mid), 19, 'center', IXC.orange, 'middle');
      }
      // cos (along the x-axis) and sin (up or down to the point)
      ixLine(ctx, [cx, cy], [px, cy], IXC.red, 5); ixLine(ctx, [px, cy], [px, py], IXC.blue, 5);
      ixLine(ctx, [cx, cy], [px, py], IXC.ink, 2.5);
      if (S.vals) {
        if (Math.abs(px - cx) > 30) ixLabel(ctx, 'cos θ', (cx + px) / 2, cy + (py < cy ? 8 : -28), 17, 'center', IXC.red);
        if (Math.abs(py - cy) > 30) ixLabel(ctx, 'sin θ', px + (px >= cx ? 8 : -8), (cy + py) / 2, 17, px >= cx ? 'left' : 'right', IXC.blue, 'middle');
      }
      ixDot(ctx, px, py, IXC.blue, 9, true);
      if (S.vals) {
        const v = vals(), lab = exactOK() ? `(${v[1]}, ${v[0]})` : `(${ixN(Math.cos(t), 2)}, ${ixN(Math.sin(t), 2)})`;
        const right = px >= cx, up = py <= cy;
        ixLabel(ctx, lab, px + (right ? 16 : -16), py + (up ? -36 : 14), 19, right ? 'left' : 'right');
      }
      paintRead();
    }
    function paintRead() {
      const v = vals(), q = quad();
      const L = [{ h: 'The angle' }, `θ = ${angText()}`, q ? `Quadrant ${['', 'I', 'II', 'III', 'IV'][q]}` : 'On an axis (a quadrantal angle)'];
      if (S.ref && q) L.push(`Reference angle θ′ = ${ixN(refAng())}°${q === 1 ? ' (in Quadrant I, θ′ = θ)' : ''}`);
      if (S.vals) {
        L.push({ h: 'The point (cos θ, sin θ)' });
        if (S.recip) L.push(`sin θ = ${v[0]}     csc θ = ${v[3]}`, `cos θ = ${v[1]}     sec θ = ${v[4]}`, `tan θ = ${v[2]}     cot θ = ${v[5]}`);
        else L.push(`sin θ = ${v[0]}`, `cos θ = ${v[1]}`, `tan θ = ${v[2]}`);
        if (!exactOK()) L.push({ note: 'Snap to a special angle (a multiple of 30° or 45°) to see exact values.' });
      }
      ixRead(read, L);
    }
    const setDeg = (d) => { S.deg = Math.round(((d % 360) + 360) % 360 * 10) / 10; if (S.snap) S.deg = Math.round(S.deg); draw(); };
    ixDrag(cv, () => 'P', (h, x, y) => {
      if (Math.hypot(x - cx, y - cy) < 8) return;
      let d = Math.atan2(cy - y, x - cx) * 180 / Math.PI; if (d < 0) d += 360;
      if (S.snap) { const sp = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].find((a) => Math.abs(a - d) < 5); if (sp != null) d = sp % 360; }
      setDeg(d);
    });
    ctl.append(el('div', { class: 'ix-btns' }, ixBtn('◀ 15°', () => setDeg(S.deg - 15)), ixBtn('15° ▶', () => setDeg(S.deg + 15)),
        ixBtn('◀ 1°', () => setDeg(S.deg - 1)), ixBtn('1° ▶', () => setDeg(S.deg + 1))),
      ixCheck('Snap to special angles', S.snap, (v) => { S.snap = v; draw(); }),
      ixCheck('Show the reference angle', S.ref, (v) => { S.ref = v; draw(); }),
      ixCheck('Show the values', S.vals, (v) => { S.vals = v; draw(); }),
      ixCheck('Show csc, sec, and cot', S.recip, (v) => { S.recip = v; draw(); }));
    draw();
  } };

// ---- Wave builder: y = a·f(bx − c) + d, with sliders; for sine and cosine the point on a circle traces the height
const IX_TRIG = { sin: Math.sin, cos: Math.cos, tan: Math.tan, csc: (t) => 1 / Math.sin(t), sec: (t) => 1 / Math.cos(t), cot: (t) => Math.cos(t) / Math.sin(t) };
IX.wave = { subjects: ['precalc'],
  wide: true, title: 'Graphs of trig functions', hint: 'Move the sliders, or press Play (or drag across the graph) to trace the wave from the circle.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(900, 400), ctx = cv._ctx; main.append(cv);
    const S = { fn: IX_TRIG[o.fn] ? o.fn : 'sin', a: +(o.a ?? 1), b: +(o.b ?? 1), c4: +(o.c ?? 0), d: +(o.d ?? 0), t: 0.6, play: false, ghost: true, circle: true };
    const circOK = () => (S.fn === 'sin' || S.fn === 'cos') && S.circle;
    const yr = [-5, 5];
    const view = () => { const left = circOK() ? 250 : 10; const V = ixView({ _w: cv._w - left, _h: cv._h }, [-Math.PI, 3 * Math.PI], yr, 24); const X0 = V.X; V.X = (x) => left + X0(x); const ix0 = V.ix; V.ix = (px) => ix0(px - left); V.left = left; return V; };
    const c = () => S.c4 * Math.PI / 4, f = (x) => S.a * IX_TRIG[S.fn](S.b * x - c()) + S.d;
    const per = () => (S.fn === 'tan' || S.fn === 'cot' ? Math.PI : 2 * Math.PI) / S.b;
    const eq = () => {
      const inner = (S.b === 1 ? 'x' : ixFrac(S.b) + (/\//.test(ixFrac(S.b)) ? '·x' : 'x')) + (S.c4 ? (S.c4 > 0 ? ' − ' : ' + ') + ixPi(Math.abs(S.c4) / 4) : '');
      const arg = inner === 'x' ? ' x' : `(${inner})`;
      const a = S.a === 0 ? '0' : ixCoef(S.a);
      return S.a === 0 ? `y = ${ixFrac(S.d)}` : `y = ${a}${a && a !== '−' ? ' ' : ''}${S.fn}${arg}${ixTerm(S.d)}`;
    };
    function draw() {
      const V = view(); ctx.clearRect(0, 0, cv._w, cv._h);
      ixGrid(ctx, V, { piX: 0.5, step: 1, lab: 1, px: 15 });
      const x0 = c() / S.b, P = per();
      // midline and the parent graph
      ixLine(ctx, [V.X(V.xr[0]), V.Y(S.d)], [V.X(V.xr[1]), V.Y(S.d)], IXC.green, 2, true);
      if (S.ghost) ixCurve(ctx, V, (x) => IX_TRIG[S.fn](x), '#b9b4a8', { w: 2, dash: true });
      if (S.fn === 'sec' || S.fn === 'csc') ixCurve(ctx, V, (x) => S.a * (S.fn === 'sec' ? Math.cos : Math.sin)(S.b * x - c()) + S.d, '#9fb9d8', { w: 2, dash: true });
      if (S.fn === 'cot') ixCurve(ctx, V, (x) => S.a * Math.tan(S.b * x - c()) + S.d, '#9fb9d8', { w: 2, dash: true }); // cot is the reciprocal of tan
      // asymptotes
      if (S.fn !== 'sin' && S.fn !== 'cos') {
        const off = S.fn === 'tan' || S.fn === 'sec' ? Math.PI / 2 : 0, step = Math.PI / S.b;
        for (let k = -40; k <= 40; k++) { const x = (off + c() + k * Math.PI) / S.b; if (x > V.xr[0] && x < V.xr[1]) ixLine(ctx, [V.X(x), V.Y(yr[0])], [V.X(x), V.Y(yr[1])], IXC.red, 1.6, true); }
        void step;
      }
      ixCurve(ctx, V, f, IXC.blue, { w: 3.4, n: 1600 });
      // one period, marked under the graph
      if (S.a !== 0) {
        const yb = Math.max(yr[0] + 0.5, (S.fn === 'sin' || S.fn === 'cos' ? S.d - Math.abs(S.a) : S.d - 3) - 0.7), xa = Math.max(V.xr[0], x0 - (x0 > V.xr[1] - P ? P : 0));
        if (xa + P <= V.xr[1] + 1e-9) {
          ctx.save(); ctx.strokeStyle = IXC.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(V.X(xa), V.Y(yb)); ctx.lineTo(V.X(xa + P), V.Y(yb)); ctx.stroke();
          [xa, xa + P].forEach((x) => { ctx.beginPath(); ctx.moveTo(V.X(x), V.Y(yb) - 8); ctx.lineTo(V.X(x), V.Y(yb) + 8); ctx.stroke(); }); ctx.restore();
          ixLabel(ctx, 'one period', V.X(xa + P / 2), V.Y(yb) + 6, 15, 'center', IXC.orange);
        }
      }
      // the circle and the tracing point
      const tx = S.t, ty = f(tx);
      if (circOK() && S.a !== 0) {
        const r = Math.abs(S.a) * V.sy, ccx = 125, ccy = V.Y(S.d);
        let u = S.b * tx - c(); if (S.fn === 'cos') u += Math.PI / 2; if (S.a < 0) u += Math.PI;
        ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ccx, ccy, r, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        ixLine(ctx, [ccx - r - 10, ccy], [ccx + r + 10, ccy], IXC.green, 1.5, true);
        const qx = ccx + r * Math.cos(u), qy = ccy - r * Math.sin(u);
        ixLine(ctx, [ccx, ccy], [qx, qy], IXC.ink, 2.2);
        ixLine(ctx, [qx, qy], [qx, ccy], IXC.blue, 4);
        if (isFinite(ty) && ty > yr[0] && ty < yr[1]) ixLine(ctx, [qx, qy], [V.X(tx), V.Y(ty)], IXC.purple, 1.6, true);
        ixDot(ctx, qx, qy, IXC.purple, 7);
        ixLabel(ctx, S.fn === 'cos' ? 'height = cosine' : 'height = sine', ccx, Math.min(cv._h - 24, ccy + r + 12), 15, 'center', IXC.axis);
      }
      if (isFinite(ty) && ty > yr[0] && ty < yr[1]) { ixLine(ctx, [V.X(tx), V.Y(S.d)], [V.X(tx), V.Y(ty)], IXC.purple, 2); ixDot(ctx, V.X(tx), V.Y(ty), IXC.purple, 8, true); }
      ixLabel(ctx, 'midline y = ' + ixFrac(S.d), V.X(V.xr[0]) + 6, V.Y(S.d) - 24, 15, 'left', IXC.green);
      { // the equation, on the graph (top right, on a white card so the curve doesn't hide it)
        // fractions (π/2, 3/2, 2π/3) are drawn stacked
        const parts = eq().replace(/\((−?\d+\/\d+)\)\s*/, '$1 ').replace(/(\d\/\d+)·x/, '$1x').split(/((?:\d*π|\d+)\/\d+)/).filter(Boolean), big = 'bold 22px "Times New Roman", serif', small = 'bold 17px "Times New Roman", serif';
        ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        const wid = (q) => { const m = /^(.+)\/(\d+)$/.exec(q); if (m && /\//.test(q)) { ctx.font = small; return Math.max(ctx.measureText(m[1]).width, ctx.measureText(m[2]).width) + 6; } ctx.font = big; return ctx.measureText(q).width; };
        const W = parts.reduce((t, q) => t + wid(q), 0), hasFr = parts.some((q) => /\//.test(q)), H = hasFr ? 56 : 38;
        const x0 = cv._w - W - 34, y0 = 10, mid = y0 + H / 2 + 1;
        ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.strokeStyle = IXC.blue; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, W + 24, H, 8) : ctx.rect(x0, y0, W + 24, H); ctx.fill(); ctx.stroke();
        ctx.fillStyle = IXC.blue; ctx.strokeStyle = IXC.blue; let x = x0 + 12;
        parts.forEach((q) => {
          const w = wid(q), m = /^(.+)\/(\d+)$/.exec(q);
          if (m) { ctx.font = small; ctx.textAlign = 'center'; ctx.fillText(m[1], x + w / 2, mid - 11); ctx.fillText(m[2], x + w / 2, mid + 13); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + 1, mid + 1); ctx.lineTo(x + w - 1, mid + 1); ctx.stroke(); ctx.textAlign = 'left'; }
          else { ctx.font = big; ctx.fillText(q, x, mid); }
          x += w;
        });
        ctx.restore();
      }
      paintRead();
    }
    function paintRead() {
      const P = per(), sh = c() / S.b, wave = S.fn === 'sin' || S.fn === 'cos';
      const L = [{ h: 'The function' }, eq(), { h: 'What the numbers do' },
        wave ? `Amplitude = |a| = ${ixFrac(Math.abs(S.a))}` : `a = ${ixFrac(S.a)} (stretch; ${S.fn} has no amplitude)`,
        `Period = ${wave || S.fn === 'sec' || S.fn === 'csc' ? '2π' : 'π'}/b = ${ixPi(P / Math.PI)}`,
        `Phase shift = c/b = ${Math.abs(sh) < 1e-9 ? '0 (none)' : (sh > 0 ? 'right ' : 'left ') + ixPi(Math.abs(sh) / Math.PI)}`,
        `Vertical shift = d = ${S.d === 0 ? '0 (none)' : (S.d > 0 ? 'up ' : 'down ') + ixFrac(Math.abs(S.d))}`];
      if (wave && S.a) L.push(`Maximum ${ixFrac(S.d + Math.abs(S.a))}, minimum ${ixFrac(S.d - Math.abs(S.a))}`);
      if (S.a < 0) L.push({ note: 'a is negative: the graph is reflected in the midline.' });
      if (!wave) L.push({ note: 'Red dashed lines are the vertical asymptotes.' });
      ixRead(read, L);
    }
    const sl = {
      a: ixSlider('a', -3, 3, 0.5, S.a, ixFrac, (v) => { S.a = v; draw(); }),
      b: ixSlider('b', 0.5, 4, 0.5, S.b, ixFrac, (v) => { S.b = v; draw(); }),
      c: ixSlider('c', -8, 8, 1, S.c4, (v) => ixPi(v / 4), (v) => { S.c4 = v; draw(); }),
      d: ixSlider('d', -2, 2, 0.5, S.d, ixFrac, (v) => { S.d = v; draw(); }) };
    let raf = 0, last = 0;
    const tick = (ts) => { if (!S.play || !cv.isConnected) { S.play = false; playB.textContent = '▶ Play'; return; } if (last) S.t += (ts - last) / 1000 * 1.2; last = ts; if (S.t > 3 * Math.PI) S.t = -Math.PI; draw(); raf = requestAnimationFrame(tick); };
    const playB = ixBtn('▶ Play', () => { S.play = !S.play; playB.textContent = S.play ? '❚❚ Pause' : '▶ Play'; last = 0; if (S.play) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); });
    ctl.append(el('div', { class: 'ix-h' }, 'y = a · f(bx − c) + d'),
      ixSeg([['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan'], ['csc', 'csc'], ['sec', 'sec'], ['cot', 'cot']], S.fn, (k) => { S.fn = k; draw(); }),
      sl.a, sl.b, sl.c, sl.d,
      el('div', { class: 'ix-btns' }, playB, ixBtn('Reset', () => { Object.assign(S, { a: 1, b: 1, c4: 0, d: 0 }); Object.entries(sl).forEach(([k, s]) => s.set(k === 'b' || k === 'a' ? 1 : 0)); draw(); })),
      ixCheck('Show the parent graph (dashed)', S.ghost, (v) => { S.ghost = v; draw(); }),
      ixCheck('Show the circle (sine and cosine)', S.circle, (v) => { S.circle = v; draw(); }));
    ixDrag(cv, (x) => (x > view().left ? 't' : null), (h, x) => { const V = view(); S.t = Math.max(V.xr[0], Math.min(V.xr[1], V.ix(x))); draw(); });
    draw();
  } };

// ---- Transformations of functions: y = a·f(b(x − h)) + k with the parent dashed behind
const IX_PARENTS = {
  line: { name: 'f(x) = x', f: (x) => x, key: [0, 0], eq: (a, inner, k) => `y = ${ixCoef(a)}${inner === 'x' ? 'x' : '(' + inner + ')'}${ixTerm(k)}` },
  quad: { name: 'f(x) = x²', f: (x) => x * x, key: [0, 0], eq: (a, inner, k) => `y = ${ixCoef(a)}${inner === 'x' ? 'x²' : '(' + inner + ')²'}${ixTerm(k)}` },
  abs: { name: 'f(x) = |x|', f: Math.abs, key: [0, 0], eq: (a, inner, k) => `y = ${ixCoef(a)}|${inner}|${ixTerm(k)}` },
  sqrt: { name: 'f(x) = √x', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), key: [0, 0], eq: (a, inner, k) => `y = ${ixCoef(a)}√(${inner})${ixTerm(k)}` },
  cube: { name: 'f(x) = x³', f: (x) => x * x * x, key: [0, 0], eq: (a, inner, k) => `y = ${ixCoef(a)}${inner === 'x' ? 'x³' : '(' + inner + ')³'}${ixTerm(k)}` },
  recip: { name: 'f(x) = 1/x', f: (x) => (Math.abs(x) < 1e-12 ? NaN : 1 / x), key: [1, 1], eq: (a, inner, k) => `y = ${ixN(a) === '1' ? '1' : ixFrac(a)}/(${inner})${ixTerm(k)}` },
  exp: { name: 'f(x) = 2ˣ', f: (x) => Math.pow(2, x), key: [0, 1], eq: (a, inner, k) => { const up = ixSup(inner); return `y = ${ixCoef(a)}${a !== 1 && a !== -1 ? ' · ' : ''}${up ? '2' + up : '2^(' + inner + ')'}${ixTerm(k)}`; } } ,
  log: { name: 'f(x) = log₂ x', f: (x) => (x > 0 ? Math.log2(x) : NaN), key: [1, 0], eq: (a, inner, k) => `y = ${ixCoef(a)}log₂(${inner})${ixTerm(k)}` } };
// an exponent written with superscript characters (null if it has a character with no superscript)
function ixSup(t) { const m = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', x: 'ˣ', '−': '⁻', '+': '⁺', '(': '⁽', ')': '⁾', ' ': '' };
  let o = ''; for (const c of String(t)) { if (!(c in m)) return null; o += m[c]; } return o; }
IX.transform = { subjects: ['algebra1', 'algebra2', 'precalc'],
  title: 'Transformations of functions', hint: 'Drag the blue point to shift the graph, and use the sliders to stretch and reflect it. The dashed graph is the parent.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 560), ctx = cv._ctx; main.append(cv);
    const S = { p: IX_PARENTS[o.parent] ? o.parent : 'quad', a: +(o.a ?? 1), b: +(o.b ?? 1), h: +(o.h ?? 0), k: +(o.k ?? 0) };
    const V = ixView(cv, [-10, 10], [-9, 9], 26);
    const g = (x) => S.a * IX_PARENTS[S.p].f(S.b * (x - S.h)) + S.k;
    const keyPt = () => { const [px, py] = IX_PARENTS[S.p].key; return [S.h + px / S.b, S.a * py + S.k]; };
    const inner = () => { const sh = ixShift(S.h); if (S.b === 1) return sh; const bb = S.b === -1 ? '−' : ixCoef(S.b); return sh === 'x' ? `${bb}x` : `${bb}(${sh})`; };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); ixGrid(ctx, V, { step: 1, lab: 2 });
      ixCurve(ctx, V, IX_PARENTS[S.p].f, '#a9a49a', { w: 2.4, dash: true });
      if (S.p === 'recip') { ixLine(ctx, [V.X(S.h), V.Y(V.yr[0])], [V.X(S.h), V.Y(V.yr[1])], IXC.red, 1.6, true); ixLine(ctx, [V.X(V.xr[0]), V.Y(S.k)], [V.X(V.xr[1]), V.Y(S.k)], IXC.red, 1.6, true); }
      if (S.p === 'exp') ixLine(ctx, [V.X(V.xr[0]), V.Y(S.k)], [V.X(V.xr[1]), V.Y(S.k)], IXC.red, 1.6, true);
      if (S.p === 'log') ixLine(ctx, [V.X(S.h), V.Y(V.yr[0])], [V.X(S.h), V.Y(V.yr[1])], IXC.red, 1.6, true);
      ixCurve(ctx, V, g, IXC.blue, { w: 3.4, n: 1400 });
      const [kx, ky] = keyPt(), [px, py] = IX_PARENTS[S.p].key;
      ixDot(ctx, V.X(px), V.Y(py), '#a9a49a', 5);
      if (Math.hypot(kx - px, ky - py) > 0.01) ixLine(ctx, [V.X(px), V.Y(py)], [V.X(kx), V.Y(ky)], IXC.purple, 1.6, true);
      ixDot(ctx, V.X(kx), V.Y(ky), IXC.blue, 9, true);
      ixLabel(ctx, `(${ixFrac(kx)}, ${ixFrac(ky)})`, V.X(kx) + 14, V.Y(ky) + 8, 17);
      paintRead();
    }
    function paintRead() {
      const L = [{ h: 'Parent' }, IX_PARENTS[S.p].name, { h: 'The new function' }, IX_PARENTS[S.p].eq(S.a, inner(), S.k), { h: 'What happened' }];
      if (S.h) L.push(`${S.h > 0 ? 'Right' : 'Left'} ${ixFrac(Math.abs(S.h))}  (h = ${ixFrac(S.h)})`);
      if (Math.abs(S.a) !== 1) L.push(`Vertical ${Math.abs(S.a) > 1 ? 'stretch' : 'shrink'} by a factor of ${ixFrac(Math.abs(S.a))}`);
      if (Math.abs(S.b) !== 1) L.push(`Horizontal ${Math.abs(S.b) > 1 ? 'shrink' : 'stretch'} by a factor of ${ixFrac(1 / Math.abs(S.b))}`);
      if (S.a < 0) L.push('Reflection in the x-axis (a < 0)');
      if (S.b < 0) L.push('Reflection in the y-axis (b < 0)');
      if (S.k) L.push(`${S.k > 0 ? 'Up' : 'Down'} ${ixFrac(Math.abs(S.k))}  (k = ${ixFrac(S.k)})`);
      if (L.length === 5) L.push('Nothing yet: it is the parent function.');
      if (S.p === 'exp') L.push({ h: 'Asymptote (red)' }, `y = ${ixFrac(S.k)}`); if (S.p === 'log') L.push({ h: 'Asymptote (red)' }, `x = ${ixFrac(S.h)}`); if (S.p === 'recip') L.push({ h: 'Asymptotes (red)' }, `x = ${ixFrac(S.h)} and y = ${ixFrac(S.k)}`);
      L.push({ note: 'Changes inside the function (h and b) act on x, the opposite of what you might expect: x − 3 moves the graph right. Changes outside (a and k) act on y, the way you expect.' });
      ixRead(read, L);
    }
    const sl = { a: ixSlider('a (outside)', -4, 4, 0.5, S.a, ixFrac, (v) => { S.a = v || 0.5; draw(); }), b: ixSlider('b (inside)', -3, 3, 0.5, S.b, ixFrac, (v) => { S.b = v || 0.5; draw(); }),
      h: ixSlider('h (right/left)', -8, 8, 1, S.h, ixN, (v) => { S.h = v; draw(); }), k: ixSlider('k (up/down)', -8, 8, 1, S.k, ixN, (v) => { S.k = v; draw(); }) };
    const parents = (o.parents || 'line,quad,abs,sqrt,cube,recip,exp').split(',').filter((p) => IX_PARENTS[p]);
    ctl.append(el('div', { class: 'ix-h' }, 'y = a · f(b(x − h)) + k'),
      ixSeg(parents.map((p) => [p, IX_PARENTS[p].name.replace('f(x) = ', '')]), S.p, (p) => { S.p = p; draw(); }), sl.a, sl.b, sl.h, sl.k,
      el('div', { class: 'ix-btns' }, ixBtn('Reset', () => { Object.assign(S, { a: 1, b: 1, h: 0, k: 0 }); sl.a.set(1); sl.b.set(1); sl.h.set(0); sl.k.set(0); draw(); })));
    ixDrag(cv, (x, y) => { const [kx, ky] = keyPt(); return Math.hypot(x - V.X(kx), y - V.Y(ky)) < 36 ? 'k' : null; }, (hh, x, y) => {
      const [px, py] = IX_PARENTS[S.p].key;
      S.h = Math.max(-8, Math.min(8, Math.round(V.ix(x) - px / S.b))); S.k = Math.max(-8, Math.min(8, Math.round(V.iy(y) - S.a * py))); sl.h.set(S.h); sl.k.set(S.k); draw(); });
    draw();
  } };

// ---- Inverse functions: the reflection in y = x, a point and its mirror, and the Horizontal Line Test
const IX_INV = {
  lin: { name: 'f(x) = 2x + 1', f: (x) => 2 * x + 1, inv: 'f⁻¹(x) = (x − 1)/2' },
  cube: { name: 'f(x) = x³', f: (x) => x * x * x, inv: 'f⁻¹(x) = ∛x' },
  quad: { name: 'f(x) = x²', f: (x) => x * x, inv: null, restrict: { name: 'f(x) = x², x ≥ 0', a: 0, inv: 'f⁻¹(x) = √x' } },
  sqrt: { name: 'f(x) = √x', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), a: 0, inv: 'f⁻¹(x) = x², x ≥ 0' },
  wave: { name: 'f(x) = x³ − 3x', f: (x) => x * x * x - 3 * x, inv: null },
  exp: { name: 'f(x) = 2ˣ', f: (x) => Math.pow(2, x), inv: 'f⁻¹(x) = log₂ x' } };
IX.inverse = { subjects: ['algebra2', 'precalc'],
  title: 'Inverse functions', hint: 'Drag the blue point along the graph to see its mirror point. Drag the red line up and down for the Horizontal Line Test.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const S = { fn: IX_INV[o.fn] ? o.fn : 'lin', restrict: false, refl: true, hlt: true, px: 1, ly: 2.5 };
    const V = ixView(cv, [-8, 8], [-8, 8], 26);
    const F = () => IX_INV[S.fn], lo = () => (S.restrict && F().restrict ? F().restrict.a : F().a ?? -Infinity);
    const f = (x) => (x < lo() ? NaN : F().f(x));
    const hits = (y) => { const out = []; let px = null, pv = null; for (let j = 0; j <= 3200; j++) { const x = -8 + 16 * j / 3200, v = f(x) - y; if (!isFinite(v)) { px = null; continue; }
      if (Math.abs(v) < 1e-12) { if (!out.length || Math.abs(out[out.length - 1] - x) > 0.05) out.push(x); } else if (px !== null && pv * v < 0) out.push(px - pv * (x - px) / (v - pv)); px = x; pv = v; } return out; };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); ixGrid(ctx, V, { step: 1, lab: 2 });
      ixLine(ctx, [V.X(-8), V.Y(-8)], [V.X(8), V.Y(8)], IXC.gray, 2, true); ixLabel(ctx, 'y = x', V.X(6.6), V.Y(7.6), 16, 'left', IXC.gray);
      ixCurve(ctx, V, f, IXC.blue, { w: 3.4, n: 1600 });
      if (S.refl) { // the reflection: swap every point
        ctx.save(); ctx.strokeStyle = IXC.orange; ctx.lineWidth = 3; ctx.beginPath(); let pen = false;
        ctx.rect(V.X(-8), V.Y(8), V.X(8) - V.X(-8), V.Y(-8) - V.Y(8)); ctx.clip(); ctx.beginPath();
        for (let j = 0; j <= 1600; j++) { const x = -8 + 16 * j / 1600, y = f(x); if (!isFinite(y) || Math.abs(y) > 60) { pen = false; continue; } if (pen) ctx.lineTo(V.X(y), V.Y(x)); else { ctx.moveTo(V.X(y), V.Y(x)); pen = true; } }
        ctx.stroke(); ctx.restore();
      }
      if (S.hlt) {
        ixLine(ctx, [V.X(-8), V.Y(S.ly)], [V.X(8), V.Y(S.ly)], IXC.red, 2.6);
        ixDot(ctx, V.X(-7.4), V.Y(S.ly), IXC.red, 9, true);
        hits(S.ly).forEach((x) => ixDot(ctx, V.X(x), V.Y(S.ly), IXC.red, 7));
      }
      const x = S.px, y = f(x);
      if (isFinite(y) && Math.abs(y) < 8) {
        ixLine(ctx, [V.X(x), V.Y(y)], [V.X(y), V.Y(x)], IXC.purple, 1.8, true);
        ixDot(ctx, V.X(x), V.Y(y), IXC.blue, 9, true); ixLabel(ctx, `(${ixN(x, 1)}, ${ixN(y, 1)})`, V.X(x) + 14, V.Y(y) - 30, 17, 'left', IXC.blue);
        if (S.refl) { ixDot(ctx, V.X(y), V.Y(x), IXC.orange, 8); ixLabel(ctx, `(${ixN(y, 1)}, ${ixN(x, 1)})`, V.X(y) + 14, V.Y(x) + 6, 17, 'left', IXC.orange); }
      }
      paintRead();
    }
    function paintRead() {
      const name = S.restrict && F().restrict ? F().restrict.name : F().name, inv = S.restrict && F().restrict ? F().restrict.inv : F().inv, n = hits(S.ly).length;
      const L = [{ h: 'The function (blue)' }, name, { h: 'Its reflection in y = x (orange)' }, inv || 'not a function, so f has no inverse function'];
      if (S.hlt) L.push({ h: 'Horizontal Line Test' }, `The red line meets the graph ${n} time${n === 1 ? '' : 's'}.`,
        inv ? { note: 'Every horizontal line meets it at most once: f is one-to-one and has an inverse function.', good: true } : n > 1 ? { note: 'This line meets it more than once: f fails the test.', bad: true } : { note: 'Keep dragging: find a line that meets the graph more than once.' });
      L.push({ h: 'A point and its mirror' }, `(a, b) on f  ↔  (b, a) on the reflection`);
      ixRead(read, L);
    }
    const restrictCk = ixCheck('Restrict the domain to x ≥ 0', S.restrict, (v) => { S.restrict = v; if (S.px < 0) S.px = 1; draw(); });
    const showRestrict = () => { restrictCk.style.display = F().restrict ? '' : 'none'; };
    const fns = (o.fns || 'lin,cube,quad,sqrt,wave,exp').split(',').filter((k) => IX_INV[k]);
    ctl.append(ixSeg(fns.map((k) => [k, IX_INV[k].name.replace('f(x) = ', '')]), S.fn, (k) => { S.fn = k; S.restrict = false; restrictCk.querySelector('input').checked = false; S.px = Math.max(lo() === -Infinity ? 1 : lo() + 1, 1); showRestrict(); draw(); }),
      restrictCk, ixCheck('Show the reflection', S.refl, (v) => { S.refl = v; draw(); }), ixCheck('Horizontal Line Test', S.hlt, (v) => { S.hlt = v; draw(); }));
    showRestrict();
    ixDrag(cv, (x, y) => (S.hlt && Math.abs(y - V.Y(S.ly)) < 26 && Math.abs(y - V.Y(f(S.px))) > 6 ? 'line' : 'pt'), (h, x, y) => {
      if (h === 'line') S.ly = Math.max(-7.5, Math.min(7.5, Math.round(V.iy(y) * 4) / 4)); else { const v = Math.round(V.ix(x) * 4) / 4; if (isFinite(f(v))) S.px = Math.max(-8, Math.min(8, v)); }
      draw(); });
    draw();
  } };

// ---- Systems of linear equations: drag two points on each line
IX.systems = { subjects: ['algebra1', 'algebra2'],
  title: 'Systems of linear equations', hint: 'Drag the dots to move each line. Where they cross is the solution. Try to make no solution, or infinitely many.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const V = ixView(cv, [-10, 10], [-10, 10], 26);
    const P = o.preset === 'special' ? [[[0, 1], [2, 5]], [[0, -2], [2, 2]]] : [[[0, 1], [2, 5]], [[0, 4], [3, 1]]];
    const col = [IXC.blue, IXC.orange];
    const abc = (L) => { const [[x1, y1], [x2, y2]] = L, a = y2 - y1, b = x1 - x2; return [a, b, a * x1 + b * y1]; };
    const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; n /= g; d /= g; return d === 1 ? ixN(n) : (n < 0 ? '−' : '') + Math.abs(n) + '/' + d; };
    const eqOf = (L) => {
      const [[x1, y1], [x2, y2]] = L;
      if (x1 === x2) return `x = ${ixN(x1)}`;
      const dn = x2 - x1, nm = y2 - y1, g0 = gcd(Math.abs(nm), Math.abs(dn)) || 1; let mn = nm / g0, md = dn / g0; if (md < 0) { mn = -mn; md = -md; }
      const bN = y1 * md - mn * x1; // b = bN/md
      const m = md === 1 ? (mn === 1 ? '' : mn === -1 ? '−' : ixN(mn)) : (mn < 0 ? '−' : '') + '(' + Math.abs(mn) + '/' + md + ')';
      const bS = bN === 0 ? '' : bN > 0 ? ' + ' + fr(bN, md) : ' − ' + fr(-bN, md);
      return mn === 0 ? `y = ${fr(bN, md)}` : `y = ${m}x${bS}`;
    };
    const slope = (L) => { const [[x1, y1], [x2, y2]] = L; return x1 === x2 ? 'undefined' : fr(y2 - y1, x2 - x1); };
    function solve() {
      const [a1, b1, c1] = abc(P[0]), [a2, b2, c2] = abc(P[1]), det = a1 * b2 - a2 * b1;
      if (det === 0) return a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1 ? { kind: 'same' } : { kind: 'none' };
      return { kind: 'one', x: [c1 * b2 - c2 * b1, det], y: [a1 * c2 - a2 * c1, det] };
    }
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); ixGrid(ctx, V, { step: 1, lab: 2 });
      const s = solve();
      P.forEach((L, i) => ixInf(ctx, cv, [V.X(L[0][0]), V.Y(L[0][1])], [V.X(L[1][0]), V.Y(L[1][1])], col[i], s.kind === 'same' && i === 1 ? 3 : 3.2, s.kind === 'same' && i === 1));
      if (s.kind === 'one') {
        const x = s.x[0] / s.x[1], y = s.y[0] / s.y[1];
        if (Math.abs(x) <= 10 && Math.abs(y) <= 10) {
          ixLine(ctx, [V.X(x), V.Y(y)], [V.X(x), V.Y(0)], IXC.green, 1.4, true); ixLine(ctx, [V.X(x), V.Y(y)], [V.X(0), V.Y(y)], IXC.green, 1.4, true);
          ixDot(ctx, V.X(x), V.Y(y), IXC.green, 8, true); ixLabel(ctx, `(${fr(...s.x)}, ${fr(...s.y)})`, V.X(x) + 14, V.Y(y) + 10, 19, 'left', IXC.green);
        }
      }
      P.forEach((L, i) => L.forEach(([x, y]) => ixDot(ctx, V.X(x), V.Y(y), col[i], 9, true)));
      const s2 = solve(), L = [{ h: 'Line 1 (blue)' }, eqOf(P[0]), `slope ${slope(P[0])}`, { h: 'Line 2 (orange)' }, eqOf(P[1]), `slope ${slope(P[1])}`, { h: 'Solution' }];
      if (s2.kind === 'one') L.push(`(${fr(...s2.x)}, ${fr(...s2.y)})`, { note: 'One solution: the lines cross at exactly one point. Check it in both equations.', good: true });
      else if (s2.kind === 'none') L.push('No solution', { note: 'Same slope, different y-intercepts: parallel lines never meet.', bad: true });
      else L.push('Infinitely many solutions', { note: 'Same slope and same y-intercept: it is the same line, so every point on it works.', good: true });
      ixRead(read, L);
    }
    let lastHit = null;
    ixDrag(cv, (x, y) => { let best = null, bd = 34; P.forEach((L, i) => L.forEach((p, j) => { const d = Math.hypot(x - V.X(p[0]), y - V.Y(p[1])); if (d < bd) { bd = d; best = [i, j]; } })); return best; }, (h, x, y) => {
      const [i, j] = h, nx = Math.max(-10, Math.min(10, Math.round(V.ix(x)))), ny = Math.max(-10, Math.min(10, Math.round(V.iy(y)))), other = P[i][1 - j];
      if (nx === other[0] && ny === other[1]) return; P[i][j] = [nx, ny]; lastHit = h; draw(); });
    ctl.append(el('div', { class: 'ix-btns' },
      ixBtn('One solution', () => { P[0] = [[0, 1], [2, 5]]; P[1] = [[0, 4], [3, 1]]; draw(); }),
      ixBtn('Parallel', () => { P[0] = [[0, 1], [2, 5]]; P[1] = [[0, -3], [2, 1]]; draw(); }),
      ixBtn('Same line', () => { P[0] = [[0, 1], [2, 5]]; P[1] = [[-1, -1], [3, 7]]; draw(); })),
      el('p', { class: 'small' }, 'Each line goes through its two dots. The dots snap to the grid.'));
    draw();
  } };

// ---- Quadratics: drag the vertex, change a; vertex, standard, and factored forms together
IX.quadratic = { subjects: ['algebra1', 'algebra2'],
  title: 'Quadratic functions', hint: 'Drag the vertex and change a. Watch all three forms of the equation, the zeros, and the axis of symmetry change together.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const S = { a: +(o.a ?? 1), h: +(o.h ?? 1), k: +(o.k ?? -4) };
    const V = ixView(cv, [-10, 10], [-10, 10], 26);
    const f = (x) => S.a * (x - S.h) ** 2 + S.k;
    const coefs = () => [S.a, -2 * S.a * S.h, S.a * S.h * S.h + S.k];
    const poly = (a, b, c) => { let s = `y = ${ixCoef(a)}x²`; if (b) s += (b > 0 ? ' + ' : ' − ') + (Math.abs(b) === 1 ? '' : Number.isInteger(+Math.abs(b).toFixed(9)) ? ixN(Math.abs(b)) : '(' + ixFrac(Math.abs(b)) + ')') + 'x'; return s + ixTerm(c); };
    const zeros = () => { const q = -S.k / S.a; if (q < -1e-12) return []; if (Math.abs(q) < 1e-12) return [S.h]; const r = Math.sqrt(q); return [S.h - r, S.h + r]; };
    const isNice = (v) => Math.abs(v * 4 - Math.round(v * 4)) < 1e-9;
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); ixGrid(ctx, V, { step: 1, lab: 2 });
      ixLine(ctx, [V.X(S.h), V.Y(-10)], [V.X(S.h), V.Y(10)], IXC.purple, 1.8, true);
      ixCurve(ctx, V, f, IXC.blue, { w: 3.4 });
      const z = zeros(), c = coefs()[2];
      z.forEach((x) => { ixDot(ctx, V.X(x), V.Y(0), IXC.red, 7); const ty = V.Y(0) + (S.a > 0 ? -34 : 12), t = isNice(x) ? ixFrac(x) : '≈ ' + ixN(x, 2); ctx.save(); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(V.X(x) - 26, ty - 2, 52, 24); ctx.restore(); ixLabel(ctx, t, V.X(x), ty, 17, 'center', IXC.red); });
      if (Math.abs(c) <= 10) { ixDot(ctx, V.X(0), V.Y(c), IXC.green, 6); }
      ixDot(ctx, V.X(S.h), V.Y(S.k), IXC.blue, 9, true); ixLabel(ctx, `(${ixN(S.h)}, ${ixN(S.k)})`, V.X(S.h) + 14, V.Y(S.k) + (S.a > 0 ? 8 : -30), 18, 'left', IXC.blue);
      ixLabel(ctx, `x = ${ixN(S.h)}`, V.X(S.h) + 6, V.Y(9.6), 16, 'left', IXC.purple);
      const [a, b] = coefs(), disc = b * b - 4 * a * c;
      const L = [{ h: 'Vertex form' }, `y = ${ixCoef(S.a)}(${ixShift(S.h)})²${ixTerm(S.k)}`.replace('(x)²', 'x²'), { h: 'Standard form' }, poly(a, b, c), { h: 'Factored form' }];
      if (!z.length) L.push('No real zeros, so it doesn’t factor over the real numbers.');
      else if (z.every(isNice)) L.push(z.length === 1 ? `y = ${ixCoef(S.a)}(${ixShift(z[0])})²`.replace('(x)²', 'x²') : `y = ${ixCoef(S.a)}(${ixShift(z[0])})(${ixShift(z[1])})`);
      else L.push(`The zeros x = ${ixN(S.h)} ± √${ixFrac(-S.k / S.a)} are irrational, so it doesn’t factor over the integers.`);
      L.push({ h: 'Features' }, `Vertex (${ixN(S.h)}, ${ixN(S.k)}); axis of symmetry x = ${ixN(S.h)}`, `Opens ${S.a > 0 ? 'up: minimum' : 'down: maximum'} value ${ixN(S.k)}`,
        `y-intercept ${ixFrac(c)}`, `Zeros: ${z.length ? z.map((x) => (isNice(x) ? ixFrac(x) : '≈ ' + ixN(x, 2))).join(' and ') : 'none'}`,
        `Discriminant b² − 4ac = ${ixFrac(disc)}: ${disc > 1e-9 ? 'two real zeros' : disc < -1e-9 ? 'no real zeros' : 'one real zero'}`);
      ixRead(read, L);
    }
    const sa = ixSlider('a', -3, 3, 0.25, S.a, ixFrac, (v) => { S.a = v || 0.25; draw(); });
    ctl.append(sa, el('p', { class: 'small' }, 'Drag the blue vertex; it snaps to the grid.'),
      el('div', { class: 'ix-btns' }, ixBtn('Two zeros', () => { Object.assign(S, { a: 1, h: 1, k: -4 }); sa.set(1); draw(); }), ixBtn('One zero', () => { Object.assign(S, { a: 1, h: -2, k: 0 }); sa.set(1); draw(); }), ixBtn('No zeros', () => { Object.assign(S, { a: 1, h: 0, k: 3 }); sa.set(1); draw(); })));
    ixDrag(cv, (x, y) => (Math.hypot(x - V.X(S.h), y - V.Y(S.k)) < 40 ? 'v' : null), (h, x, y) => { S.h = Math.max(-9, Math.min(9, Math.round(V.ix(x)))); S.k = Math.max(-9, Math.min(9, Math.round(V.iy(y)))); draw(); });
    draw();
  } };

// ---- geometry helpers (canvas coordinates; y down)
const ixV = { sub: (p, q) => [p[0] - q[0], p[1] - q[1]], add: (p, q) => [p[0] + q[0], p[1] + q[1]], mul: (p, k) => [p[0] * k, p[1] * k], dot: (p, q) => p[0] * q[0] + p[1] * q[1],
  len: (p) => Math.hypot(p[0], p[1]), mid: (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], dist: (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) };
// the angle at v between rays v→p and v→q, in degrees
const ixAng = (v, p, q) => { const a = ixV.sub(p, v), b = ixV.sub(q, v); return Math.acos(Math.max(-1, Math.min(1, ixV.dot(a, b) / (ixV.len(a) * ixV.len(b) || 1)))) * 180 / Math.PI; };
// where lines p1p2 and q1q2 meet (null if parallel)
const ixMeet = (p1, p2, q1, q2) => { const d = (p1[0] - p2[0]) * (q1[1] - q2[1]) - (p1[1] - p2[1]) * (q1[0] - q2[0]); if (Math.abs(d) < 1e-9) return null;
  const t = ((p1[0] - q1[0]) * (q1[1] - q2[1]) - (p1[1] - q1[1]) * (q1[0] - q2[0])) / d; return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]; };
// an angle mark at v between rays to p and q, with a label
function ixAngMark(ctx, v, p, q, r, color, label, fill = true) {
  const a1 = Math.atan2(p[1] - v[1], p[0] - v[0]), a2 = Math.atan2(q[1] - v[1], q[0] - v[0]); let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.4; if (fill) { ctx.fillStyle = color; ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.moveTo(v[0], v[1]); ctx.arc(v[0], v[1], r, a1, a1 + d, d < 0); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.beginPath(); ctx.arc(v[0], v[1], r, a1, a1 + d, d < 0); ctx.stroke(); ctx.restore();
  if (label) { const m = a1 + d / 2; ixLabel(ctx, label, v[0] + (r + 22) * Math.cos(m), v[1] + (r + 22) * Math.sin(m), 18, 'center', color, 'middle'); }
}
function ixRightMark(ctx, v, p, q, color = IXC.ink, z = 12) {
  const u = ixV.mul(ixV.sub(p, v), 1 / (ixV.dist(p, v) || 1)), w = ixV.mul(ixV.sub(q, v), 1 / (ixV.dist(q, v) || 1));
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(v[0] + u[0] * z, v[1] + u[1] * z); ctx.lineTo(v[0] + (u[0] + w[0]) * z, v[1] + (u[1] + w[1]) * z); ctx.lineTo(v[0] + w[0] * z, v[1] + w[1] * z); ctx.stroke(); ctx.restore();
}
function ixName(ctx, p, name, from, color = IXC.ink) { const d = ixV.sub(p, from), L = ixV.len(d) || 1; ixLabel(ctx, name, p[0] + d[0] / L * 22, p[1] + d[1] / L * 22, 22, 'center', color, 'middle'); }

// ---- Angles in circles: points ride on the circle
IX.circleAngles = { subjects: ['geometry'],
  title: 'Angles and arcs in circles', hint: 'Drag the points around the circle. The measures update, and the relationship between the angle and its arc stays true.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 560), ctx = cv._ctx; main.append(cv);
    const C = [300, 285], R = 210;
    const MODES = { central: ['A', 'B'], inscribed: ['A', 'B', 'C'], same: ['A', 'B', 'C', 'D'], semi: ['A', 'B', 'C'], quad: ['A', 'B', 'C', 'D'], lines: ['A', 'B', 'C', 'D'] };
    const START = { central: [20, 120], inscribed: [-20, 60, 230], same: [-20, 60, 200, 250], semi: [180, 0, 70], quad: [10, 100, 170, 260], lines: [150, 20, 100, 260] };
    const S = { mode: MODES[o.mode] ? o.mode : 'inscribed', deg: {} };
    const reset = () => { S.deg = {}; MODES[S.mode].forEach((n, i) => (S.deg[n] = START[S.mode][i])); };
    const pt = (n) => { const a = S.deg[n] * Math.PI / 180; return [C[0] + R * Math.cos(a), C[1] - R * Math.sin(a)]; };
    const norm = (d) => ((d % 360) + 360) % 360;
    // the arc from p to q (counterclockwise) in degrees, or the other way if it holds one of 'avoid'
    const arcAvoid = (p, q, avoid) => { const a = S.deg[p], b = S.deg[q], ccw = norm(b - a); const inside = (n) => { const t = norm(S.deg[n] - a); return t > 0 && t < ccw; };
      return avoid.some(inside) ? { m: 360 - ccw, from: b, sweep: 360 - ccw } : { m: ccw, from: a, sweep: ccw }; };
    const drawArc = (arc, color, w = 7) => { ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); const s = arc.from * Math.PI / 180;
      ctx.arc(C[0], C[1], R, -s, -(s + arc.sweep * Math.PI / 180), true); ctx.stroke(); ctx.restore();
      const m = (arc.from + arc.sweep / 2) * Math.PI / 180; ixLabel(ctx, `${ixN(arc.m, 2)}°`, C[0] + (R + 30) * Math.cos(m), C[1] - (R + 30) * Math.sin(m), 19, 'center', color, 'middle'); };
    const seg = (p, q, c = IXC.ink, w = 2.6) => ixLine(ctx, p, q, c, w);
    const r = (v) => ixN(v, 2); // decimals when it isn't whole (60.5°, 30.25°)
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      if (S.mode === 'semi') { S.deg.A = 180; S.deg.B = 0; }
      ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(C[0], C[1], R, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
      const P = {}; MODES[S.mode].forEach((n) => (P[n] = pt(n)));
      const L = [];
      if (S.mode === 'central' || S.mode === 'inscribed') {
        const avoid = S.mode === 'inscribed' ? ['C'] : [], arc = arcAvoid('A', 'B', avoid);
        drawArc(arc, IXC.orange);
        const big = arc.m > 180 + 1e-9;
        if (S.mode === 'central' || o.central !== '0') { seg(C, P.A, IXC.blue); seg(C, P.B, IXC.blue); if (!big) ixAngMark(ctx, C, P.A, P.B, 38, IXC.blue, `${r(ixAng(C, P.A, P.B))}°`); }
        if (S.mode === 'inscribed') { seg(P.C, P.A); seg(P.C, P.B); ixAngMark(ctx, P.C, P.A, P.B, 40, IXC.purple, `${r(ixAng(P.C, P.A, P.B))}°`); }
        ixDot(ctx, C[0], C[1], IXC.ink, 4); ixLabel(ctx, 'P', C[0] - 16, C[1] + 4, 20, 'center');
        if (S.mode === 'central') L.push({ h: 'Central angle ∠APB' }, `m∠APB = ${r(ixAng(C, P.A, P.B))}°`, `m(arc AB) = ${r(arc.m)}°`, { note: big ? 'This is a major arc (more than 180°): its measure is 360° minus the central angle.' : 'A minor arc has the same measure as its central angle.', good: true });
        else L.push({ h: 'Inscribed angle ∠ACB' }, `m∠ACB = ${r(ixAng(P.C, P.A, P.B))}°`, `Intercepted arc AB = ${r(arc.m)}°`, `1/2 · ${r(arc.m)}° = ${ixN(arc.m / 2, 2)}°`, { note: 'An inscribed angle is half its intercepted arc (and half the central angle).', good: true });
      } else if (S.mode === 'same') {
        const arc = arcAvoid('A', 'B', ['C', 'D']); drawArc(arc, IXC.orange);
        const sideOK = norm(S.deg.C - S.deg.A) > norm(S.deg.B - S.deg.A) === norm(S.deg.D - S.deg.A) > norm(S.deg.B - S.deg.A);
        seg(P.C, P.A); seg(P.C, P.B); seg(P.D, P.A, IXC.green); seg(P.D, P.B, IXC.green);
        ixAngMark(ctx, P.C, P.A, P.B, 36, IXC.purple, `${r(ixAng(P.C, P.A, P.B))}°`); ixAngMark(ctx, P.D, P.A, P.B, 36, IXC.green, `${r(ixAng(P.D, P.A, P.B))}°`);
        L.push({ h: 'Two inscribed angles' }, `m∠ACB = ${r(ixAng(P.C, P.A, P.B))}°`, `m∠ADB = ${r(ixAng(P.D, P.A, P.B))}°`,
          sideOK ? { note: 'They intercept the same arc, so they are congruent.', good: true } : { note: 'C and D are on opposite sides of the chord, so they intercept different arcs: the two angles add to 180°.', bad: true });
      } else if (S.mode === 'semi') {
        seg(P.A, P.B, IXC.blue, 2); seg(P.C, P.A); seg(P.C, P.B); ixRightMark(ctx, P.C, P.A, P.B, IXC.purple, 16);
        ixDot(ctx, C[0], C[1], IXC.ink, 4);
        L.push({ h: 'Angle inscribed in a semicircle' }, `m∠ACB = ${r(ixAng(P.C, P.A, P.B))}°`, { note: 'AB is a diameter, so the intercepted arc is 180° and the angle is always 1/2 · 180° = 90°.', good: true });
      } else if (S.mode === 'quad') {
        const order = ['A', 'B', 'C', 'D'].sort((u, v) => norm(S.deg[u]) - norm(S.deg[v]));
        ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.08)'; ctx.beginPath(); order.forEach((n, i) => (i ? ctx.lineTo(...P[n]) : ctx.moveTo(...P[n]))); ctx.closePath(); ctx.fill(); ctx.restore();
        order.forEach((n, i) => seg(P[n], P[order[(i + 1) % 4]]));
        const ang = {}; order.forEach((n, i) => { ang[n] = ixAng(P[n], P[order[(i + 3) % 4]], P[order[(i + 1) % 4]]); ixAngMark(ctx, P[n], P[order[(i + 3) % 4]], P[order[(i + 1) % 4]], 30, i % 2 ? IXC.green : IXC.purple, `${r(ang[n])}°`); });
        L.push({ h: `Inscribed quadrilateral ${order.join('')}` }, `m∠${order[0]} + m∠${order[2]} = ${r(ang[order[0]])}° + ${r(ang[order[2]])}° = ${r(ang[order[0]] + ang[order[2]])}°`,
          `m∠${order[1]} + m∠${order[3]} = ${r(ang[order[1]])}° + ${r(ang[order[3]])}° = ${r(ang[order[1]] + ang[order[3]])}°`, { note: 'Opposite angles of an inscribed quadrilateral are supplementary.', good: true });
      } else { // two lines through A, B and C, D
        const X = ixMeet(P.A, P.B, P.C, P.D);
        ixInf(ctx, cv, P.A, P.B, IXC.blue, 2.4); ixInf(ctx, cv, P.C, P.D, IXC.green, 2.4);
        if (!X || ixV.dist(X, C) > 2000) L.push({ h: 'Two lines' }, { note: 'The lines are parallel (or nearly): they don’t meet. Drag a point.' });
        else {
          const inside = ixV.dist(X, C) < R - 1;
          ixDot(ctx, X[0], X[1], IXC.red, 7); ixLabel(ctx, 'E', X[0] + 12, X[1] - 30, 20, 'left', IXC.red);
          if (inside) { // ∠AEC and its vertical angle ∠BED
            const a1 = arcAvoid('A', 'C', ['B', 'D']), a2 = arcAvoid('B', 'D', ['A', 'C']);
            drawArc(a1, IXC.orange); drawArc(a2, IXC.purple); const m = ixAng(X, P.A, P.C); ixAngMark(ctx, X, P.A, P.C, 30, IXC.red, `${r(m)}°`);
            L.push({ h: 'Chords meet inside the circle' }, `m∠AEC = ${r(m)}°`, `1/2 (${r(a1.m)}° + ${r(a2.m)}°) = ${ixN((a1.m + a2.m) / 2, 2)}°`, { note: 'Inside: the angle is half the SUM of the two intercepted arcs.', good: true });
          } else { // secants from E: near and far points on each line
            const nearAB = ixV.dist(X, P.A) < ixV.dist(X, P.B) ? ['A', 'B'] : ['B', 'A'], nearCD = ixV.dist(X, P.C) < ixV.dist(X, P.D) ? ['C', 'D'] : ['D', 'C'];
            const far = arcAvoid(nearAB[1], nearCD[1], [nearAB[0], nearCD[0]]), near = arcAvoid(nearAB[0], nearCD[0], [nearAB[1], nearCD[1]]);
            drawArc(far, IXC.orange); drawArc(near, IXC.purple); const m = ixAng(X, P[nearAB[1]], P[nearCD[1]]);
            if (ixV.dist(X, C) < 1400) ixAngMark(ctx, X, P[nearAB[1]], P[nearCD[1]], 30, IXC.red, `${r(m)}°`);
            L.push({ h: 'Secants meet outside the circle' }, `m∠E = ${r(m)}°`, `1/2 (${r(far.m)}° − ${r(near.m)}°) = ${ixN((far.m - near.m) / 2, 2)}°`, { note: 'Outside: the angle is half the DIFFERENCE of the far arc and the near arc.', good: true });
          }
        }
      }
      MODES[S.mode].forEach((n) => { const fixed = S.mode === 'semi' && n !== 'C'; ixDot(ctx, P[n][0], P[n][1], fixed ? IXC.ink : IXC.blue, fixed ? 6 : 9, !fixed); ixName(ctx, P[n], n, C); });
      ixRead(read, L);
    }
    ixDrag(cv, (x, y) => { let best = null, bd = 40; MODES[S.mode].forEach((n) => { if (S.mode === 'semi' && n !== 'C') return; const p = pt(n), d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; best = n; } }); return best; },
      (n, x, y) => { let d = Math.round(Math.atan2(C[1] - y, x - C[0]) * 360 / Math.PI) / 2; /* half-degree steps */ const others = MODES[S.mode].filter((m) => m !== n);
        if (others.some((m) => Math.abs(norm(S.deg[m] - d + 180) - 180) < 4)) return; S.deg[n] = d; draw(); });
    const modes = (o.modes || 'central,inscribed,same,semi,quad,lines').split(',').filter((m) => MODES[m]);
    const names = { central: 'Central angle', inscribed: 'Inscribed angle', same: 'Same arc', semi: 'Semicircle', quad: 'Inscribed quadrilateral', lines: 'Chords and secants' };
    ctl.append(ixSeg(modes.map((m) => [m, names[m]]), S.mode, (m) => { S.mode = m; reset(); draw(); }), el('div', { class: 'ix-btns' }, ixBtn('Reset', () => { reset(); draw(); })));
    reset(); draw();
  } };

// ---- Points of concurrency: drag the vertices
IX.triCenters = { subjects: ['geometry'],
  title: 'Points of concurrency', hint: 'Drag the vertices. Watch where each center goes when the triangle is acute, right, or obtuse.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 540), ctx = cv._ctx; main.append(cv);
    const T = { A: [140, 430], B: [520, 440], C: [300, 110] };
    const on = new Set((o.show || 'circum,in').split(','));
    const U = 40; // pixels per unit for lengths
    const foot = (p, a, b) => { const d = ixV.sub(b, a), t = ixV.dot(ixV.sub(p, a), d) / ixV.dot(d, d); return ixV.add(a, ixV.mul(d, t)); };
    const where = (p) => { const s = (a, b) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); const v = [s(T.A, T.B), s(T.B, T.C), s(T.C, T.A)];
      if (v.some((x) => Math.abs(x) < 300)) return 'on the triangle'; return v.every((x) => x > 0) || v.every((x) => x < 0) ? 'inside' : 'outside'; };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      ctx.save(); ctx.strokeStyle = '#efede7'; ctx.lineWidth = 1; for (let x = 0; x <= cv._w; x += U) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv._h); ctx.stroke(); } for (let y = 0; y <= cv._h; y += U) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv._w, y); ctx.stroke(); } ctx.restore();
      const { A, B, C } = T, angs = { A: ixAng(A, B, C), B: ixAng(B, C, A), C: ixAng(C, A, B) }, big = Math.max(...Object.values(angs));
      ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.06)'; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.lineTo(...C); ctx.closePath(); ctx.fill(); ctx.restore();
      const L = [{ h: 'The triangle' }, `m∠A = ${Math.round(angs.A)}°, m∠B = ${Math.round(angs.B)}°, m∠C = ${Math.round(angs.C)}°`,
        Math.abs(big - 90) < 0.5 ? 'A right triangle' : big > 90 ? 'An obtuse triangle' : 'An acute triangle'];
      if (on.has('circum')) {
        const mAB = ixV.mid(A, B), mBC = ixV.mid(B, C), perp = (p, q, m) => [m, ixV.add(m, [-(q[1] - p[1]), q[0] - p[0]])];
        const [p1, p2] = perp(A, B, mAB), [q1, q2] = perp(B, C, mBC), O = ixMeet(p1, p2, q1, q2), mCA = ixV.mid(C, A), [r1, r2] = perp(C, A, mCA);
        [[p1, p2], [q1, q2], [r1, r2]].forEach(([p, q]) => ixInf(ctx, cv, p, q, IXC.red, 1.6, true));
        [[A, B, mAB], [B, C, mBC], [C, A, mCA]].forEach(([p, q, m]) => { ixRightMark(ctx, m, q, ixV.add(m, [-(q[1] - p[1]), q[0] - p[0]]), IXC.red, 10); });
        if (O) { const rr = ixV.dist(O, A); ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(O[0], O[1], rr, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
          ixDot(ctx, O[0], O[1], IXC.red, 7); ixLabel(ctx, 'circumcenter', O[0] + 10, O[1] + 8, 15, 'left', IXC.red);
          L.push({ h: 'Circumcenter (red): perpendicular bisectors' }, `It is ${where(O)}.`, `Distance to each vertex: ${ixN(ixV.dist(O, A) / U, 1)}, ${ixN(ixV.dist(O, B) / U, 1)}, ${ixN(ixV.dist(O, C) / U, 1)}`); }
      }
      if (on.has('in')) {
        const a = ixV.dist(B, C), b = ixV.dist(C, A), c = ixV.dist(A, B), s = a + b + c, I = [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s];
        [A, B, C].forEach((v) => ixLine(ctx, v, I, IXC.green, 1.6, true));
        const ft = [foot(I, A, B), foot(I, B, C), foot(I, C, A)], rr = ixV.dist(I, ft[0]);
        ctx.save(); ctx.strokeStyle = IXC.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(I[0], I[1], rr, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        ft.forEach((f) => ixLine(ctx, I, f, IXC.green, 1.4));
        ixDot(ctx, I[0], I[1], IXC.green, 7); ixLabel(ctx, 'incenter', I[0] + 10, I[1] - 26, 15, 'left', IXC.green);
        L.push({ h: 'Incenter (green): angle bisectors' }, `It is always inside.`, `Distance to each side: ${ixN(rr / U, 1)} (the same for all three)`);
      }
      if (on.has('centroid')) {
        const mids = [ixV.mid(B, C), ixV.mid(C, A), ixV.mid(A, B)], G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
        [A, B, C].forEach((v, i) => { ixLine(ctx, v, mids[i], IXC.purple, 2); ixDot(ctx, mids[i][0], mids[i][1], IXC.purple, 4); });
        ixDot(ctx, G[0], G[1], IXC.purple, 7); ixLabel(ctx, 'centroid', G[0] + 10, G[1] + 6, 15, 'left', IXC.purple);
        const AG = ixV.dist(A, G) / U, GD = ixV.dist(G, mids[0]) / U;
        L.push({ h: 'Centroid (purple): medians' }, 'It is always inside.', `From A: AG = ${ixN(AG, 1)}, GD = ${ixN(GD, 1)} (AG is 2/3 of the median)`);
      }
      if (on.has('ortho')) {
        const H = ixMeet(A, foot(A, B, C), B, foot(B, C, A));
        [[A, B, C], [B, C, A], [C, A, B]].forEach(([v, p, q]) => { const f = foot(v, p, q); ixLine(ctx, v, f, IXC.orange, 2); ixRightMark(ctx, f, v, p, IXC.orange, 10);
          const t = ixV.dot(ixV.sub(f, p), ixV.sub(q, p)) / ixV.dot(ixV.sub(q, p), ixV.sub(q, p)); if (t < 0) ixLine(ctx, f, p, IXC.orange, 1.4, true); if (t > 1) ixLine(ctx, f, q, IXC.orange, 1.4, true);
          if (H) ixLine(ctx, v, H, IXC.orange, 1.2, true); });
        if (H) { ixDot(ctx, H[0], H[1], IXC.orange, 7); ixLabel(ctx, 'orthocenter', H[0] + 10, H[1] - 26, 15, 'left', IXC.orange); L.push({ h: 'Orthocenter (orange): altitudes' }, `It is ${where(H)}.`); }
      }
      ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.lineTo(...C); ctx.closePath(); ctx.stroke(); ctx.restore();
      const G0 = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      ['A', 'B', 'C'].forEach((n) => { ixDot(ctx, T[n][0], T[n][1], IXC.blue, 9, true); ixName(ctx, T[n], n, G0, IXC.blue); });
      if (on.size) L.push({ note: 'Drag C until the triangle is obtuse: the circumcenter and the orthocenter move outside; the incenter and the centroid never do.' });
      ixRead(read, L);
    }
    ixDrag(cv, (x, y) => { let best = null, bd = 42; Object.entries(T).forEach(([n, p]) => { const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; best = n; } }); return best; },
      (n, x, y) => { const p = [Math.max(14, Math.min(cv._w - 14, x)), Math.max(14, Math.min(cv._h - 14, y))]; const o2 = Object.entries(T).filter(([m]) => m !== n).map(([, q]) => q);
        const area = Math.abs((o2[0][0] - p[0]) * (o2[1][1] - p[1]) - (o2[1][0] - p[0]) * (o2[0][1] - p[1])); if (area < 3000) return; T[n] = p; draw(); });
    const ck = (k, t) => ixCheck(t, on.has(k), (v) => { if (v) on.add(k); else on.delete(k); draw(); });
    ctl.append(ck('circum', 'Circumcenter (perpendicular bisectors)'), ck('in', 'Incenter (angle bisectors)'), ck('centroid', 'Centroid (medians)'), ck('ortho', 'Orthocenter (altitudes)'),
      el('div', { class: 'ix-btns' }, ixBtn('Acute', () => { Object.assign(T, { A: [140, 430], B: [520, 440], C: [300, 110] }); draw(); }), ixBtn('Right', () => { Object.assign(T, { A: [160, 440], B: [480, 440], C: [160, 160] }); draw(); }), ixBtn('Obtuse', () => { Object.assign(T, { A: [100, 420], B: [560, 420], C: [200, 300] }); draw(); })));
    draw();
  } };

// ---- Transformations in the coordinate plane: translate, reflect, rotate, dilate a triangle
IX.geoTransform = { subjects: ['geometry'],
  title: 'Transformations', hint: 'Drag the vertices of triangle ABC (they snap to the grid). Pick a transformation and watch the image A′B′C′.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const V = ixView(cv, [-10, 10], [-10, 10], 26);
    const S = { mode: ['translate', 'reflect', 'rotate', 'dilate'].includes(o.mode) ? o.mode : 'translate', P: { A: [1, 1], B: [4, 2], C: [2, 5] }, a: 3, b: -4, line: 'y', rot: 90, ctr: [0, 0], k: 2 };
    if (S.mode === 'dilate') S.k = 2;
    const img = ([x, y]) => {
      if (S.mode === 'translate') return [x + S.a, y + S.b];
      if (S.mode === 'reflect') return { x: [x, -y], y: [-x, y], yx: [y, x], ynx: [-y, -x] }[S.line];
      const [cx, cy] = S.ctr, dx = x - cx, dy = y - cy;
      if (S.mode === 'rotate') { const t = S.rot * Math.PI / 180, c = Math.round(Math.cos(t) * 1e9) / 1e9, s = Math.round(Math.sin(t) * 1e9) / 1e9; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; }
      return [cx + S.k * dx, cy + S.k * dy];
    };
    const rule = () => {
      if (S.mode === 'translate') return `(x, y) → (${ixShift(-S.a)}, ${ixShift(-S.b, 'y')})`;
      if (S.mode === 'reflect') return { x: '(x, y) → (x, −y)', y: '(x, y) → (−x, y)', yx: '(x, y) → (y, x)', ynx: '(x, y) → (−y, −x)' }[S.line];
      const org = !S.ctr[0] && !S.ctr[1];
      if (S.mode === 'rotate') return org ? { 90: '(x, y) → (−y, x)', 180: '(x, y) → (−x, −y)', 270: '(x, y) → (y, −x)' }[S.rot] : `about (${S.ctr.join(', ')}), not the origin`;
      return org ? `(x, y) → (${ixCoef(S.k)}x, ${ixCoef(S.k)}y)`.replace(/\(\(/g, '(') : `about (${S.ctr.join(', ')}), not the origin`;
    };
    const tri = (pts, color, fill, dash) => { ctx.save(); ctx.fillStyle = fill; ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash(dash ? [8, 6] : []); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(V.X(p[0]), V.Y(p[1])) : ctx.moveTo(V.X(p[0]), V.Y(p[1])))); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); ixGrid(ctx, V, { step: 1, lab: 2 });
      const names = ['A', 'B', 'C'], pre = names.map((n) => S.P[n]), im = pre.map(img), cen = [(pre[0][0] + pre[1][0] + pre[2][0]) / 3, (pre[0][1] + pre[1][1] + pre[2][1]) / 3];
      if (S.mode === 'reflect') { const L2 = { x: [[-10, 0], [10, 0]], y: [[0, -10], [0, 10]], yx: [[-10, -10], [10, 10]], ynx: [[-10, 10], [10, -10]] }[S.line]; ixLine(ctx, [V.X(L2[0][0]), V.Y(L2[0][1])], [V.X(L2[1][0]), V.Y(L2[1][1])], IXC.purple, 3.4); }
      pre.forEach((p, i) => { const q = im[i];
        if (S.mode === 'translate' || S.mode === 'reflect') ixLine(ctx, [V.X(p[0]), V.Y(p[1])], [V.X(q[0]), V.Y(q[1])], IXC.purple, 1.6, true);
        else if (S.mode === 'rotate') { ixLine(ctx, [V.X(S.ctr[0]), V.Y(S.ctr[1])], [V.X(p[0]), V.Y(p[1])], '#9fb9d8', 1.4, true); ixLine(ctx, [V.X(S.ctr[0]), V.Y(S.ctr[1])], [V.X(q[0]), V.Y(q[1])], '#f0b37a', 1.4, true); }
        else ixInf(ctx, cv, [V.X(S.ctr[0]), V.Y(S.ctr[1])], [V.X(p[0]), V.Y(p[1])], '#cfc9bd', 1.2, true); });
      if (S.mode === 'rotate') ixAngMark(ctx, [V.X(S.ctr[0]), V.Y(S.ctr[1])], [V.X(pre[0][0]), V.Y(pre[0][1])], [V.X(im[0][0]), V.Y(im[0][1])], 34, IXC.purple, S.rot === 180 ? '' : `${S.rot}°`, false);
      tri(pre, IXC.blue, 'rgba(31,95,168,.12)'); tri(im, IXC.orange, 'rgba(210,123,18,.14)');
      const cim = img(cen);
      pre.forEach((p, i) => { ixDot(ctx, V.X(p[0]), V.Y(p[1]), IXC.blue, 8, true); ixName(ctx, [V.X(p[0]), V.Y(p[1])], names[i], [V.X(cen[0]), V.Y(cen[1])], IXC.blue); });
      im.forEach((p, i) => { ixDot(ctx, V.X(p[0]), V.Y(p[1]), IXC.orange, 6); ixName(ctx, [V.X(p[0]), V.Y(p[1])], names[i] + '′', [V.X(cim[0]), V.Y(cim[1])], IXC.orange); });
      if (S.mode === 'rotate' || S.mode === 'dilate') { ixDot(ctx, V.X(S.ctr[0]), V.Y(S.ctr[1]), IXC.purple, 9, true); ixLabel(ctx, 'center', V.X(S.ctr[0]) + 12, V.Y(S.ctr[1]) + 6, 15, 'left', IXC.purple); }
      if (S.mode === 'translate') { const p = pre[0], q = im[0]; ixDot(ctx, V.X(q[0]), V.Y(q[1]), IXC.orange, 9, true); void p; }
      const c = (p) => `(${ixFrac(p[0])}, ${ixFrac(p[1])})`;
      const L = [{ h: { translate: `Translation by ⟨${ixN(S.a)}, ${ixN(S.b)}⟩`, reflect: 'Reflection', rotate: `Rotation ${S.rot}° counterclockwise`, dilate: `Dilation, scale factor ${ixFrac(S.k)}` }[S.mode] }, rule(), { h: 'Coordinates' },
        ...names.map((n, i) => `${n}${c(pre[i])}  →  ${n}′${c(im[i])}`)];
      const side = (p, q) => ixV.dist(p, q);
      if (S.mode === 'dilate') L.push({ h: 'Side lengths' }, `AB = ${ixN(side(pre[0], pre[1]), 2)}, A′B′ = ${ixN(side(im[0], im[1]), 2)}`, { note: `Each side is multiplied by |k| = ${ixFrac(Math.abs(S.k))}: the image is ${Math.abs(S.k) > 1 ? 'an enlargement' : Math.abs(S.k) < 1 ? 'a reduction' : 'the same size'} and similar to ABC.${S.k < 0 ? ' A negative k puts it on the other side of the center.' : ''}`, good: true });
      else L.push({ note: 'A rigid motion: the image is congruent to ABC (same side lengths and angles).', good: true });
      ixRead(read, L);
    }
    const panes = {};
    const sa = ixSlider('a (right/left)', -10, 10, 1, S.a, ixN, (v) => { S.a = v; draw(); }), sb = ixSlider('b (up/down)', -10, 10, 1, S.b, ixN, (v) => { S.b = v; draw(); });
    panes.translate = el('div', {}, sa, sb, el('p', { class: 'small' }, 'Or drag A′.'));
    panes.reflect = el('div', {}, el('div', { class: 'ix-h' }, 'Line of reflection'), ixSeg([['x', 'x-axis'], ['y', 'y-axis'], ['yx', 'y = x'], ['ynx', 'y = −x']], S.line, (k) => { S.line = k; draw(); }));
    panes.rotate = el('div', {}, el('div', { class: 'ix-h' }, 'Angle (counterclockwise)'), ixSeg([[90, '90°'], [180, '180°'], [270, '270°']], S.rot, (k) => { S.rot = +k; draw(); }), el('p', { class: 'small' }, 'Drag the purple center of rotation.'));
    const sk = ixSlider('k', -3, 3, 0.25, S.k, ixFrac, (v) => { S.k = v || 0.25; draw(); });
    panes.dilate = el('div', {}, sk, el('p', { class: 'small' }, 'Drag the purple center of dilation.'));
    const showPane = () => Object.entries(panes).forEach(([k, p]) => (p.style.display = k === S.mode ? '' : 'none'));
    const modes = (o.modes || 'translate,reflect,rotate,dilate').split(',');
    ctl.append(ixSeg([['translate', 'Translate'], ['reflect', 'Reflect'], ['rotate', 'Rotate'], ['dilate', 'Dilate']].filter(([k]) => modes.includes(k)), S.mode, (k) => { S.mode = k; showPane(); draw(); }), ...Object.values(panes));
    showPane();
    ixDrag(cv, (x, y) => {
      if ((S.mode === 'rotate' || S.mode === 'dilate') && Math.hypot(x - V.X(S.ctr[0]), y - V.Y(S.ctr[1])) < 30) return 'ctr';
      let best = null, bd = 34; Object.entries(S.P).forEach(([n, p]) => { const d = Math.hypot(x - V.X(p[0]), y - V.Y(p[1])); if (d < bd) { bd = d; best = n; } });
      if (!best && S.mode === 'translate') { const q = img(S.P.A); if (Math.hypot(x - V.X(q[0]), y - V.Y(q[1])) < 34) return 'img'; }
      return best; },
    (h, x, y) => { const p = [Math.max(-10, Math.min(10, Math.round(V.ix(x)))), Math.max(-10, Math.min(10, Math.round(V.iy(y))))];
      if (h === 'ctr') S.ctr = p; else if (h === 'img') { S.a = p[0] - S.P.A[0]; S.b = p[1] - S.P.A[1]; sa.set(S.a); sb.set(S.b); } else S.P[h] = p; draw(); });
    draw();
  } };

// ======== more interactives (each lists the subjects it's for) ========
// side tick marks and an angle's arcs, so equal parts look alike and different parts look different
function ixTicks(ctx, p, q, n, color = IXC.ink) {
  const m = ixV.mid(p, q), d = ixV.sub(q, p), L = ixV.len(d) || 1, u = [d[0] / L, d[1] / L], nrm = [-u[1], u[0]];
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.2;
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 6, c = [m[0] + u[0] * o, m[1] + u[1] * o]; ctx.beginPath(); ctx.moveTo(c[0] - nrm[0] * 8, c[1] - nrm[1] * 8); ctx.lineTo(c[0] + nrm[0] * 8, c[1] + nrm[1] * 8); ctx.stroke(); }
  ctx.restore();
}
function ixArcs(ctx, v, p, q, n, color, r = 26) { for (let i = 0; i < n; i++) ixAngMark(ctx, v, p, q, r + i * 6, color, null, i === 0); }
function ixTri(ctx, P, color = IXC.ink, fill = 'rgba(31,95,168,.07)', w = 3, dash = false) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(...P[0]); P.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash ? [8, 6] : []); ctx.stroke(); ctx.restore();
}
const ixPick = (pts, x, y, r = 40) => { let best = null, bd = r; Object.entries(pts).forEach(([k, p]) => { const d = Math.hypot(x - p[0], y - p[1]); if (d < bd) { bd = d; best = k; } }); return best; };

// ---- Triangle congruence: which parts prove it? SSA can make two different triangles
IX.congruence = { subjects: ['geometry'],
  title: 'Triangle congruence (SSS, SAS, ASA, AAS, SSA)', hint: 'Pick a shortcut. The marked parts are given; on the right are all the triangles you can build from just those parts. Drag A, B, and C.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(820, 470), ctx = cv._ctx; main.append(cv);
    const T = { A: [70, 390], B: [330, 400], C: [170, 140] }, S = { k: o.k || 'SSS' }, U = 40;
    if (S.k === 'SSA') Object.assign(T, { A: [60, 390], B: [300, 390], C: [260, 170] });
    const parts = { SSS: { s: ['AB', 'BC', 'CA'], a: [] }, SAS: { s: ['AB', 'CA'], a: ['A'] }, ASA: { s: ['AB'], a: ['A', 'B'] }, AAS: { s: ['BC'], a: ['A', 'B'] }, SSA: { s: ['CA', 'BC'], a: ['A'] } };
    const angColors = { A: IXC.red, B: IXC.green, C: IXC.purple };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      ixLine(ctx, [410, 20], [410, 450], '#e4e1d9', 2);
      ixLabel(ctx, 'Given', 20, 14, 18, 'left', IXC.gray); ixLabel(ctx, 'Every triangle with exactly those parts', 430, 14, 18, 'left', IXC.gray);
      const { A, B, C } = T, P = parts[S.k], cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      const sideN = { AB: 1, BC: 2, CA: 3 }, ends = { AB: [A, B], BC: [B, C], CA: [C, A] }, vv = { A: [A, B, C], B: [B, C, A], C: [C, A, B] };
      ixTri(ctx, [A, B, C]);
      P.s.forEach((s) => ixTicks(ctx, ...ends[s], sideN[s], IXC.blue));
      P.a.forEach((a, i) => ixArcs(ctx, ...vv[a], i + 1, angColors[a]));
      ['A', 'B', 'C'].forEach((n) => { ixDot(ctx, T[n][0], T[n][1], IXC.blue, 8, true); ixName(ctx, T[n], n, cen, IXC.blue); });
      // the copies: build from the given parts only
      const a = ixV.dist(B, C), b = ixV.dist(C, A), c = ixV.dist(A, B), angA = ixAng(A, B, C) * Math.PI / 180, angB = ixAng(B, C, A) * Math.PI / 180;
      const base = [470, 400], dir = (t, L) => [base[0] + L * Math.cos(t), base[1] - L * Math.sin(t)];
      let sols = [];
      if (S.k === 'SSA') { const h = b * Math.sin(angA), disc = a * a - h * h;
        if (disc >= -1e-6) { const r = Math.sqrt(Math.max(0, disc)), c1 = b * Math.cos(angA) + r, c2 = b * Math.cos(angA) - r; [c1, c2].forEach((cc) => { if (cc > 1 && !sols.some((x) => Math.abs(x - cc) < 2)) sols.push(cc); }); }
        sols = sols.map((cc) => [base, [base[0] + cc, base[1]], dir(angA, b)]);
      } else sols = [[base, [base[0] + c, base[1]], dir(angA, b)]];
      const k = Math.min(1, 330 / Math.max(...sols.map((s) => s[1][0] - base[0]), 1), 330 / (b + 1));
      const fit = (p) => [base[0] + (p[0] - base[0]) * k, base[1] + (p[1] - base[1]) * k];
      sols = sols.map((s) => s.map(fit));
      const cols = [IXC.orange, IXC.green];
      if (S.k === 'SSA') { const Cc = sols[0] ? sols[0][2] : fit(dir(angA, b)); ixLine(ctx, base, [800, base[1]], IXC.gray, 1.5, true);
        ixLine(ctx, base, Cc, IXC.blue, 3); ctx.save(); ctx.strokeStyle = IXC.gray; ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(Cc[0], Cc[1], a * k, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
      sols.forEach((s, i) => { ixTri(ctx, s, cols[i], i ? 'rgba(46,125,79,.08)' : 'rgba(210,123,18,.08)', 3);
        if (S.k === 'SSA') ixLabel(ctx, i ? 'B₂' : 'B₁', s[1][0], s[1][1] + 10, 18, 'center', cols[i]); });
      const L = [{ h: S.k }, { SSS: 'Three sides.', SAS: 'Two sides and the angle between them.', ASA: 'Two angles and the side between them.', AAS: 'Two angles and a side that is not between them.', SSA: 'Two sides and an angle that is not between them.' }[S.k]];
      if (S.k === 'SSA') {
        L.push(`Possible triangles: ${sols.length}`);
        L.push(sols.length === 2 ? { note: 'Two different triangles have these same three parts, so SSA does not prove triangles congruent.', bad: true } : sols.length === 1 ? { note: 'This time only one triangle fits, but drag C (or B) and you can get two. SSA is not a congruence shortcut.' } : { note: 'Side BC is too short to reach the base: no triangle at all.' });
      } else L.push({ note: `Only one triangle can be built from these parts (it may be turned or flipped), so ${S.k} proves triangles congruent.`, good: true });
      L.push({ h: 'The parts' }, `AB = ${ixN(c / U, 1)}, BC = ${ixN(a / U, 1)}, CA = ${ixN(b / U, 1)}`, `m∠A = ${Math.round(angA * 180 / Math.PI)}°, m∠B = ${Math.round(angB * 180 / Math.PI)}°, m∠C = ${Math.round(ixAng(C, A, B))}°`);
      if (S.k === 'AAS' || S.k === 'ASA') L.push({ note: 'With two angles given, the third angle is fixed too (they add to 180°).' });
      ixRead(read, L);
    }
    ctl.append(ixSeg(['SSS', 'SAS', 'ASA', 'AAS', 'SSA'].map((k) => [k, k]), S.k, (k) => { S.k = k; if (k === 'SSA') Object.assign(T, { A: [60, 390], B: [300, 390], C: [260, 170] }); draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Reset', () => { Object.assign(T, { A: [70, 390], B: [330, 400], C: [170, 140] }); draw(); })));
    ixDrag(cv, (x, y) => ixPick(T, x, y), (n, x, y) => { const p = [Math.max(20, Math.min(395, x)), Math.max(40, Math.min(450, y))]; const others = Object.entries(T).filter(([m]) => m !== n).map(([, q]) => q);
      if (Math.abs((others[0][0] - p[0]) * (others[1][1] - p[1]) - (others[1][0] - p[0]) * (others[0][1] - p[1])) < 2500) return; T[n] = p; draw(); });
    draw();
  } };

// ---- Similar triangles and dilations: drag the triangle and the center; the scale factor slides
IX.similar = { subjects: ['geometry'],
  title: 'Dilations and similar triangles', hint: 'Drag A, B, C, or the center O. Slide the scale factor k. Watch the side ratios, the perimeter ratio, and the area ratio.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 560), ctx = cv._ctx; main.append(cv);
    const V = ixView(cv, [-2, 14], [-2, 12], 22), S = { k: +(o.k || 2), O: [1, 1], A: [3, 2], B: [6, 2], C: [3, 5] };
    const img = (p) => [S.O[0] + S.k * (p[0] - S.O[0]), S.O[1] + S.k * (p[1] - S.O[1])];
    const c = (p) => [V.X(p[0]), V.Y(p[1])];
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); ixGrid(ctx, V, { step: 1, lab: 2 });
      const P = ['A', 'B', 'C'].map((n) => S[n]), Q = P.map(img);
      P.forEach((p, i) => ixLine(ctx, c(S.O), c(Q[i]), IXC.gray, 1.4, true));
      ixTri(ctx, Q.map(c), IXC.orange, 'rgba(210,123,18,.10)', 3); ixTri(ctx, P.map(c), IXC.blue, 'rgba(31,95,168,.10)', 3);
      ['A', 'B', 'C'].forEach((n, i) => { ixDot(ctx, ...c(P[i]), IXC.blue, 8, true); ixLabel(ctx, n, c(P[i])[0] - 18, c(P[i])[1] - 26, 20, 'left', IXC.blue); ixDot(ctx, ...c(Q[i]), IXC.orange, 6); ixLabel(ctx, n + '′', c(Q[i])[0] + 8, c(Q[i])[1] - 26, 20, 'left', IXC.orange); });
      ixDot(ctx, ...c(S.O), IXC.red, 8, true); ixLabel(ctx, 'O', c(S.O)[0] - 22, c(S.O)[1] + 4, 20, 'left', IXC.red);
      const len = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]), per = (T) => len(T[0], T[1]) + len(T[1], T[2]) + len(T[2], T[0]), area = (T) => Math.abs((T[1][0] - T[0][0]) * (T[2][1] - T[0][1]) - (T[2][0] - T[0][0]) * (T[1][1] - T[0][1])) / 2;
      const kf = ixFrac(S.k);
      ixRead(read, [{ h: 'Scale factor' }, `k = ${kf}`, S.k > 1 ? { note: 'k > 1: an enlargement.' } : S.k < 1 ? { note: '0 < k < 1: a reduction.' } : { note: 'k = 1: the same size (congruent).' },
        { h: 'Coordinates (center O)' }, `A(${ixN(S.A[0], 2)}, ${ixN(S.A[1], 2)}) → A′(${ixN(Q[0][0], 2)}, ${ixN(Q[0][1], 2)})`, S.O[0] === 0 && S.O[1] === 0 ? `(x, y) → (${kf}x, ${kf}y)` : 'Each image point is k times as far from O, on the same ray.',
        { h: 'Sides' }, `A′B′ / AB = ${ixN(len(Q[0], Q[1]), 2)} / ${ixN(len(P[0], P[1]), 2)} = ${ixN(S.k, 2)}`, `B′C′ / BC = ${ixN(len(Q[1], Q[2]) / len(P[1], P[2]), 2)}, C′A′ / CA = ${ixN(len(Q[2], Q[0]) / len(P[2], P[0]), 2)}`,
        { h: 'Angles' }, 'All three angles stay the same, so the triangles are similar.',
        { h: 'Perimeter and area' }, `perimeter ratio = ${ixN(per(Q) / per(P), 2)} = k`, `area ratio = ${ixN(area(Q), 2)} / ${ixN(area(P), 2)} = ${ixN(area(Q) / area(P), 2)} = k²`]);
    }
    ctl.append(ixSlider('Scale factor k', 0.25, 3, 0.25, S.k, (v) => ixFrac(v), (v) => { S.k = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Center at the origin', () => { S.O = [0, 0]; draw(); }), ixBtn('Center at a vertex', () => { S.O = [...S.A]; draw(); })));
    ixDrag(cv, (x, y) => ixPick({ O: c(S.O), A: c(S.A), B: c(S.B), C: c(S.C) }, x, y), (n, x, y) => { S[n] = [Math.max(-2, Math.min(14, Math.round(V.ix(x)))), Math.max(-2, Math.min(12, Math.round(V.iy(y))))]; draw(); });
    draw();
  } };

// ---- Right triangle trigonometry: SOH CAH TOA; snaps to 30-60-90 and 45-45-90
IX.rightTrig = { subjects: ['geometry', 'precalc'],
  title: 'Right triangle trig (SOH CAH TOA)', hint: 'Drag the blue corner to change the angle θ, or drag the right end to make the triangle bigger. The ratios stay the same for the same angle.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { th: +(o.angle || 35), adj: 380, at: 'A', snap: true }, A = [80, 450];
    const geom = () => { const B = [A[0] + S.adj, A[1]], C = [B[0], A[1] - S.adj * Math.tan(S.th * Math.PI / 180)]; return { B, C }; };
    const EX = { 30: ['1/2', '√3/2', '√3/3'], 45: ['√2/2', '√2/2', '1'], 60: ['√3/2', '1/2', '√3'] };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      const { B, C } = geom(), U = 40, adj = S.adj / U, opp = (A[1] - C[1]) / U, hyp = Math.hypot(adj, opp);
      ixTri(ctx, [A, B, C], IXC.ink, 'rgba(31,95,168,.06)', 3); ixRightMark(ctx, B, A, C, IXC.ink, 16);
      const atA = S.at === 'A', th = atA ? S.th : 90 - S.th, V0 = atA ? A : C, oppSide = atA ? [B, C] : [A, B], adjSide = atA ? [A, B] : [B, C];
      ixLine(ctx, ...oppSide, IXC.red, 5); ixLine(ctx, ...adjSide, IXC.green, 5); ixLine(ctx, A, C, IXC.blue, 5);
      ixAngMark(ctx, V0, atA ? B : A, atA ? C : B, 40, IXC.orange, 'θ');
      const lab = (p, q, t, col, off) => { const m = ixV.mid(p, q); ixLabel(ctx, t, m[0] + off[0], m[1] + off[1], 19, 'center', col, 'middle'); };
      const [o_, a_, h_] = atA ? [opp, adj, hyp] : [adj, opp, hyp];
      lab(...oppSide, `opposite ${ixN(o_, 2)}`, IXC.red, atA ? [62, 0] : [0, 24]); lab(...adjSide, `adjacent ${ixN(a_, 2)}`, IXC.green, atA ? [0, 24] : [62, 0]); lab(A, C, `hypotenuse ${ixN(h_, 2)}`, IXC.blue, [-70, -18]);
      ixDot(ctx, C[0], C[1], IXC.blue, 9, true); ixDot(ctx, B[0], B[1], IXC.gray, 7, true);
      const t = Math.round(th), ex = EX[Math.round(th * 10) / 10] || null, d = (v) => ixN(v, 4);
      ixRead(read, [{ h: 'The angle' }, `θ = ${ixN(th, 1)}°`,
        { h: 'SOH: sine = opposite / hypotenuse' }, `sin θ = ${ixN(o_, 2)}/${ixN(h_, 2)} ≈ ${d(o_ / h_)}${ex ? ` = ${ex[0]}` : ''}`,
        { h: 'CAH: cosine = adjacent / hypotenuse' }, `cos θ = ${ixN(a_, 2)}/${ixN(h_, 2)} ≈ ${d(a_ / h_)}${ex ? ` = ${ex[1]}` : ''}`,
        { h: 'TOA: tangent = opposite / adjacent' }, `tan θ = ${ixN(o_, 2)}/${ixN(a_, 2)} ≈ ${d(o_ / a_)}${ex ? ` = ${ex[2]}` : ''}`,
        ex ? { note: t === 45 ? '45°-45°-90°: legs equal, hypotenuse = leg · √2.' : '30°-60°-90°: hypotenuse = 2 · short leg, long leg = short leg · √3.', good: true } : { note: 'Drag the right end: the sides change but the ratios don’t. They depend only on the angle.' }]);
    }
    ctl.append(ixSeg([['A', 'θ at the bottom left'], ['C', 'θ at the top']], S.at, (k) => { S.at = k; draw(); }),
      ixCheck('Snap to whole degrees', S.snap, (v) => { S.snap = v; }),
      el('div', { class: 'ix-btns' }, ixBtn('30°', () => { S.th = 30; draw(); }), ixBtn('45°', () => { S.th = 45; draw(); }), ixBtn('60°', () => { S.th = 60; draw(); })));
    ixDrag(cv, (x, y) => { const { B, C } = geom(); return ixPick({ C, B }, x, y, 44); }, (n, x, y) => {
      if (n === 'C') { const { B } = geom(); let th = Math.atan2(A[1] - Math.max(20, y), S.adj) * 180 / Math.PI; th = Math.max(8, Math.min(80, th)); S.th = S.snap ? Math.round(th) : th; }
      else S.adj = Math.round(Math.max(120, Math.min(520, x - A[0])) / 10) * 10;
      const { C } = geom(); if (C[1] < 15) S.adj = (A[1] - 15) / Math.tan(S.th * Math.PI / 180);
      draw(); });
    draw();
  } };

// ---- Solids: volume and surface area, with the formula filled in; nets for prisms and cylinders
IX.solids = { subjects: ['geometry'],
  title: 'Volume and surface area', hint: 'Pick a solid and slide its measurements. The formulas fill themselves in. Show the net to see where the surface area comes from.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: o.solid || 'prism', l: 4, w: 3, h: 5, r: 2, net: false }; let U = 34;
    const iso = (x, y, z, ox = 260, oy = 400) => [ox + x * U + y * U * 0.5, oy - z * U - y * U * 0.35];
    const poly = (pts, fill, stroke = IXC.ink, dash = false) => { ctx.save(); ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = stroke; ctx.lineWidth = 2.4; ctx.setLineDash(dash ? [6, 5] : []); ctx.stroke(); ctx.restore(); };
    const ell = (cx, cy, rx, ry, half = 0, fill = null, dash = false) => { ctx.save(); ctx.beginPath(); if (half === 1) ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); else if (half === -1) ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 2 * Math.PI); else ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.4; ctx.setLineDash(dash ? [6, 5] : []); ctx.stroke(); ctx.restore(); };
    const sl = {};
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h); const { l, w, h, r } = S, π = Math.PI; let L = [];
      if (S.k === 'prism' || S.k === 'pyramid') {
        if (S.net && S.k === 'prism') { // the net: a cross of rectangles
          const s = Math.min(U, 600 / (2 * l + 2 * w), 480 / (h + 2 * w)), x0 = (640 - (2 * l + 2 * w) * s) / 2, y0 = (520 - (h + 2 * w) * s) / 2 + w * s;
          const R = (x, y, a, b, c) => poly([[x, y], [x + a * s, y], [x + a * s, y + b * s], [x, y + b * s]], c);
          R(x0, y0, w, h, 'rgba(46,125,79,.14)'); R(x0 + w * s, y0, l, h, 'rgba(31,95,168,.14)'); R(x0 + (w + l) * s, y0, w, h, 'rgba(46,125,79,.14)'); R(x0 + (2 * w + l) * s, y0, l, h, 'rgba(31,95,168,.14)');
          R(x0 + w * s, y0 - w * s, l, w, 'rgba(210,123,18,.16)'); R(x0 + w * s, y0 + h * s, l, w, 'rgba(210,123,18,.16)');
        } else {
          U = Math.min(48, 540 / (l + w / 2), 440 / (h + w * 0.35)); const ox = 320 - (l + w / 2) * U / 2, oy = 270 + (h * U + w * U * 0.35) / 2, P = (x, y, z) => iso(x, y, z, ox, oy);
          if (S.k === 'prism') { const b = [P(0, 0, 0), P(l, 0, 0), P(l, w, 0), P(0, w, 0)], t = [P(0, 0, h), P(l, 0, h), P(l, w, h), P(0, w, h)];
            ixLine(ctx, b[3], b[0], IXC.ink, 2, true); ixLine(ctx, b[3], b[2], IXC.ink, 2, true); ixLine(ctx, b[3], t[3], IXC.ink, 2, true);
            poly([b[0], b[1], t[1], t[0]], 'rgba(31,95,168,.12)'); poly([b[1], b[2], t[2], t[1]], 'rgba(46,125,79,.12)'); poly(t, 'rgba(210,123,18,.14)');
          } else { const b = [P(0, 0, 0), P(l, 0, 0), P(l, w, 0), P(0, w, 0)], ap = P(l / 2, w / 2, h);
            ixLine(ctx, b[3], b[0], IXC.ink, 2, true); ixLine(ctx, b[3], b[2], IXC.ink, 2, true); ixLine(ctx, b[3], ap, IXC.ink, 2, true);
            poly([b[0], b[1], ap], 'rgba(31,95,168,.12)'); poly([b[1], b[2], ap], 'rgba(46,125,79,.12)'); ixLine(ctx, ap, P(l / 2, w / 2, 0), IXC.red, 2, true); }
          const b0 = P(0, 0, 0), b1 = P(l, 0, 0); ixLabel(ctx, `ℓ = ${l}`, (b0[0] + b1[0]) / 2, b0[1] + 10, 19, 'center', IXC.blue);
          const b2 = P(l, w, 0); ixLabel(ctx, `w = ${w}`, (b1[0] + b2[0]) / 2 + 18, (b1[1] + b2[1]) / 2, 19, 'left', IXC.green, 'middle');
          ixLabel(ctx, `h = ${h}`, P(0, 0, h / 2)[0] - 14, P(0, 0, h / 2)[1], 19, 'right', IXC.red, 'middle');
        }
        if (S.k === 'prism') L = [{ h: 'Rectangular prism' }, 'V = ℓwh', `V = ${l} · ${w} · ${h} = ${l * w * h} cubic units`, 'S = 2ℓw + 2ℓh + 2wh', `S = 2(${l * w}) + 2(${l * h}) + 2(${w * h}) = ${2 * (l * w + l * h + w * h)} square units`];
        else { const sA = Math.hypot(h, w / 2), sB = Math.hypot(h, l / 2); L = [{ h: 'Rectangular pyramid' }, 'V = (1/3)Bh', `V = (1/3)(${l} · ${w})(${h}) = ${ixN(l * w * h / 3, 2)} cubic units`, { note: 'A pyramid holds 1/3 of the prism with the same base and height.' },
          { h: 'Surface area' }, `slant heights: ${ixN(sA, 2)} and ${ixN(sB, 2)}`, `S = ${l * w} + ${ixN(l * sA, 2)} + ${ixN(w * sB, 2)} = ${ixN(l * w + l * sA + w * sB, 2)} square units`]; }
      } else if (S.k === 'cylinder' || S.k === 'cone') { U = Math.min(40, 250 / S.r, 380 / S.h);
        if (S.net && S.k === 'cylinder') { const s = Math.min(U * 0.8, 560 / (2 * π * r), 470 / (h + 4 * r)), W = 2 * π * r * s, x0 = (640 - W) / 2, y0 = 30 + 2 * r * s;
          poly([[x0, y0], [x0 + W, y0], [x0 + W, y0 + h * s], [x0, y0 + h * s]], 'rgba(31,95,168,.14)');
          ctx.save(); ctx.fillStyle = 'rgba(210,123,18,.16)'; ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.4; [[y0 - r * s], [y0 + h * s + r * s]].forEach(([cy]) => { ctx.beginPath(); ctx.arc(320, cy, r * s, 0, 2 * π); ctx.fill(); ctx.stroke(); }); ctx.restore();
          ixLabel(ctx, `2πr = ${ixN(2 * π * r, 2)}`, 320, y0 + h * s / 2, 19, 'center', IXC.blue, 'middle');
        } else { const cx = 320, by = 430, rx = r * U, ry = r * U * 0.32, ty = by - h * U;
          if (S.k === 'cylinder') { ell(cx, by, rx, ry, -1, null, true); ell(cx, by, rx, ry, 1); ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.10)'; ctx.fillRect(cx - rx, ty, 2 * rx, h * U); ctx.restore(); ixLine(ctx, [cx - rx, by], [cx - rx, ty], IXC.ink, 2.4); ixLine(ctx, [cx + rx, by], [cx + rx, ty], IXC.ink, 2.4); ell(cx, ty, rx, ry, 0, 'rgba(210,123,18,.14)'); }
          else { ell(cx, by, rx, ry, -1, null, true); ell(cx, by, rx, ry, 1); ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.10)'; ctx.beginPath(); ctx.moveTo(cx - rx, by); ctx.lineTo(cx, ty); ctx.lineTo(cx + rx, by); ctx.fill(); ctx.restore(); ixLine(ctx, [cx - rx, by], [cx, ty], IXC.ink, 2.4); ixLine(ctx, [cx + rx, by], [cx, ty], IXC.ink, 2.4); }
          ixLine(ctx, [cx, by], [cx + rx, by], IXC.green, 2.4); ixLabel(ctx, `r = ${r}`, cx + rx / 2, by + 8, 19, 'center', IXC.green);
          ixLine(ctx, [cx, by], [cx, ty], IXC.red, 2, true); ixLabel(ctx, `h = ${h}`, cx - 8, (by + ty) / 2, 19, 'right', IXC.red, 'middle');
          if (S.k === 'cone') { const sl_ = Math.hypot(r, h); ixLabel(ctx, `ℓ = ${ixN(sl_, 2)}`, cx + rx / 2 + 14, (by + ty) / 2, 19, 'left', IXC.blue, 'middle'); } }
        if (S.k === 'cylinder') L = [{ h: 'Cylinder' }, 'V = πr²h', `V = π(${r})²(${h}) = ${ixN(r * r * h, 2)}π ≈ ${ixN(π * r * r * h, 2)} cubic units`, 'S = 2πr² + 2πrh', `S = 2π(${r * r}) + 2π(${r})(${h}) = ${ixN(2 * r * r + 2 * r * h, 2)}π ≈ ${ixN(2 * π * r * r + 2 * π * r * h, 2)} square units`, { note: 'Unrolled, the side is a rectangle: 2πr wide and h tall.' }];
        else { const sl_ = Math.hypot(r, h); L = [{ h: 'Cone' }, 'V = (1/3)πr²h', `V = (1/3)π(${r})²(${h}) = ${ixFrac(r * r * h / 3)}π ≈ ${ixN(π * r * r * h / 3, 2)} cubic units`, { note: 'A cone holds 1/3 of the cylinder with the same base and height.' }, 'S = πr² + πrℓ', `ℓ = √(${r}² + ${h}²) = ${ixN(sl_, 2)}`, `S = π(${r * r}) + π(${r})(${ixN(sl_, 2)}) ≈ ${ixN(π * r * r + π * r * sl_, 2)} square units`]; }
      } else { U = 40; // sphere
        const cx = 320, cy = 270, R = S.r * U; ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.10)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * π); ctx.fill(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
        ell(cx, cy, R, R * 0.3, 1); ell(cx, cy, R, R * 0.3, -1, null, true); ixLine(ctx, [cx, cy], [cx + R, cy], IXC.green, 2.4); ixLabel(ctx, `r = ${S.r}`, cx + R / 2, cy - 28, 19, 'center', IXC.green); ixDot(ctx, cx, cy, IXC.ink, 4);
        L = [{ h: 'Sphere' }, 'V = (4/3)πr³', `V = (4/3)π(${S.r})³ = ${ixFrac(4 * S.r ** 3 / 3)}π ≈ ${ixN(4 / 3 * π * S.r ** 3, 2)} cubic units`, 'S = 4πr²', `S = 4π(${S.r})² = ${4 * S.r * S.r}π ≈ ${ixN(4 * π * S.r * S.r, 2)} square units`, { note: 'Double the radius: the surface area is 4 times as big and the volume is 8 times as big.' }];
      }
      ixRead(read, L);
    }
    sl.l = ixSlider('length ℓ', 1, 8, 1, S.l, String, (v) => { S.l = v; draw(); }); sl.w = ixSlider('width w', 1, 6, 1, S.w, String, (v) => { S.w = v; draw(); });
    sl.h = ixSlider('height h', 1, 9, 1, S.h, String, (v) => { S.h = v; draw(); }); sl.r = ixSlider('radius r', 1, 5, 1, S.r, String, (v) => { S.r = v; draw(); });
    const netCk = ixCheck('Show the net', S.net, (v) => { S.net = v; draw(); });
    const show = () => { const k = S.k; sl.l.style.display = sl.w.style.display = k === 'prism' || k === 'pyramid' ? '' : 'none'; sl.h.style.display = k === 'sphere' ? 'none' : ''; sl.r.style.display = k === 'cylinder' || k === 'cone' || k === 'sphere' ? '' : 'none'; netCk.style.display = k === 'prism' || k === 'cylinder' ? '' : 'none'; };
    ctl.append(ixSeg([['prism', 'Prism'], ['pyramid', 'Pyramid'], ['cylinder', 'Cylinder'], ['cone', 'Cone'], ['sphere', 'Sphere']], S.k, (k) => { S.k = k; S.net = false; netCk.querySelector('input').checked = false; show(); draw(); }), sl.l, sl.w, sl.h, sl.r, netCk);
    show(); draw();
  } };

// ---- Parallel lines cut by a transversal: tap an angle to see which angles match it
IX.parallel = { subjects: ['geometry'],
  title: 'Parallel lines and a transversal', hint: 'Drag the orange dots to turn the transversal. Tap any of the 8 angles to see which angles are congruent to it and which are supplementary.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { P: [250, 120], Q: [390, 420], tilt: 0, pick: 1 }, y1 = 190, y2 = 340;
    const lineY = (i, x) => (i === 1 ? y1 : y2 + (x - 320) * Math.tan(S.tilt * Math.PI / 180));
    const meet = (i) => { const a = i === 1 ? [0, y1] : [0, lineY(2, 0)], b = i === 1 ? [640, y1] : [640, lineY(2, 640)]; return ixMeet(a, b, S.P, S.Q); };
    // angles at each crossing: 1 top-left of the top crossing, then clockwise: 1 2 / 3 4 and 5 6 / 7 8
    const angleAt = (n) => { const I = meet(n <= 4 ? 1 : 2), up = ixV.sub(S.P, S.Q), d = ixV.mul(up, 1 / ixV.len(up)), lineDir = n <= 4 ? [1, 0] : (() => { const v = [1, Math.tan(S.tilt * Math.PI / 180)]; return ixV.mul(v, 1 / ixV.len(v)); })();
      const m = (n - 1) % 4, ray1 = m === 0 || m === 2 ? ixV.mul(lineDir, -1) : lineDir, ray2 = m <= 1 ? d : ixV.mul(d, -1); return { I, p: ixV.add(I, ixV.mul(ray1, 100)), q: ixV.add(I, ixV.mul(ray2, 100)) }; };
    const meas = (n) => { const { I, p, q } = angleAt(n); return ixAng(I, p, q); };
    const REL = { 1: { 5: 'corresponding', 4: 'vertical', 8: 'alternate exterior', 2: 'linear pair', 3: 'linear pair', 6: 'same side', 7: 'same side' } };
    const relation = (a, b) => { if (a === b) return 'the same angle'; const pos = (n) => ({ row: n <= 4 ? 0 : 1, m: (n - 1) % 4 }), A = pos(a), B = pos(b);
      if (A.row === B.row) return A.m + B.m === 3 ? 'vertical angles' : 'a linear pair';
      if (A.m === B.m) return 'corresponding angles';
      const inner = (p) => (p.row === 0 ? p.m >= 2 : p.m <= 1); const left = (p) => p.m % 2 === 0;
      if (inner(A) && inner(B)) return left(A) !== left(B) ? 'alternate interior angles' : 'consecutive (same-side) interior angles';
      if (!inner(A) && !inner(B)) return left(A) !== left(B) ? 'alternate exterior angles' : 'consecutive (same-side) exterior angles';
      return 'no special name'; };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      ixLine(ctx, [0, y1], [640, y1], IXC.ink, 3); ixLine(ctx, [0, lineY(2, 0)], [640, lineY(2, 640)], IXC.ink, 3);
      if (!S.tilt) { [y1, y2].forEach((y) => { ctx.save(); ctx.fillStyle = IXC.ink; ctx.beginPath(); ctx.moveTo(600, y - 7); ctx.lineTo(612, y); ctx.lineTo(600, y + 7); ctx.fill(); ctx.restore(); }); }
      ixInf(ctx, cv, S.P, S.Q, IXC.orange, 3);
      const base = meas(S.pick), cong = [], supp = [];
      for (let n = 1; n <= 8; n++) { const m = meas(n), { I, p, q } = angleAt(n); const same = Math.abs(m - base) < 0.5;
        const col = n === S.pick ? IXC.blue : same ? IXC.blue : IXC.red; ixAngMark(ctx, I, p, q, same ? 30 : 22, col, null, n === S.pick || true);
        if (same && n !== S.pick) cong.push(n); else if (n !== S.pick) supp.push(n);
        const mid = ixV.mid(ixV.mul(ixV.sub(p, I), 0.55), ixV.mul(ixV.sub(q, I), 0.55)); ixLabel(ctx, String(n), I[0] + mid[0], I[1] + mid[1], 20, 'center', col, 'middle'); }
      ixDot(ctx, ...S.P, IXC.orange, 9, true); ixDot(ctx, ...S.Q, IXC.orange, 9, true);
      const L = [{ h: `Angle ${S.pick}` }, `m∠${S.pick} = ${Math.round(base)}°`];
      if (!S.tilt) { L.push({ h: 'Congruent to it (blue)' }, cong.length ? cong.map((n) => `∠${n}: ${relation(S.pick, n)}`).join('; ') : '—', { h: `Supplementary to it (red): ${Math.round(180 - base)}°` }, supp.map((n) => `∠${n}: ${relation(S.pick, n)}`).join('; '));
        if (Math.abs(base - 90) < 0.6) L.push({ note: 'The transversal is perpendicular: all eight angles are right angles.' }); }
      else L.push({ note: 'The lines are not parallel now: corresponding and alternate angles are no longer equal. Only vertical angles and linear pairs still work.', bad: true }, `m∠1 = ${Math.round(meas(1))}°, m∠5 = ${Math.round(meas(5))}°`);
      ixRead(read, L);
    }
    ctl.append(ixSlider('Tilt the bottom line', -15, 15, 1, 0, (v) => (v ? v + '°' : 'parallel'), (v) => { S.tilt = v; draw(); }));
    ixDrag(cv, (x, y) => { const p = ixPick({ P: S.P, Q: S.Q }, x, y, 30); if (p) return p; for (let n = 1; n <= 8; n++) { const { I, p: a, q: b } = angleAt(n), mid = ixV.add(I, ixV.mid(ixV.mul(ixV.sub(a, I), 0.5), ixV.mul(ixV.sub(b, I), 0.5))); if (Math.hypot(x - mid[0], y - mid[1]) < 34) return 'a' + n; } return null; },
      (h, x, y) => { if (h[0] === 'a') { S.pick = +h.slice(1); draw(); return; } const p = [Math.max(20, Math.min(620, x)), h === 'P' ? Math.max(15, Math.min(y1 - 40, y)) : Math.max(y2 + 40, Math.min(505, y))]; if (Math.abs(p[0] - (h === 'P' ? S.Q : S.P)[0]) > 500) return; S[h] = p; draw(); });
    draw();
  } };

// ---- Law of Sines, the ambiguous case (SSA): swing side a and count the triangles
IX.ambiguous = { subjects: ['precalc'],
  title: 'Law of Sines: the ambiguous case', hint: 'Slide angle A and sides a and b. Side a swings from C like a door: it can miss the base, touch it once, or hit it twice.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(680, 500), ctx = cv._ctx; main.append(cv);
    const S = { A: +(o.A || 35), b: 10, a: 7 };
    function draw() {
      ctx.clearRect(0, 0, cv._w, cv._h);
      const R = S.A * Math.PI / 180, U = 30, A0 = [50, 440], C = [A0[0] + S.b * U * Math.cos(R), A0[1] - S.b * U * Math.sin(R)], h = S.b * Math.sin(R);
      ixLine(ctx, A0, [670, A0[1]], IXC.ink, 2.6);
      const Hf = [C[0], A0[1]]; ixLine(ctx, C, Hf, IXC.gray, 2, true); ixLabel(ctx, 'h', C[0] + 6, (C[1] + Hf[1]) / 2 + 20, 19, 'left', IXC.gray, 'middle');
      ctx.save(); ctx.strokeStyle = IXC.red; ctx.globalAlpha = 0.35; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(C[0], C[1], S.a * U, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
      const disc = S.a * S.a - h * h, sols = [];
      if (disc >= -1e-9) { const r = Math.sqrt(Math.max(0, disc)), base = S.b * Math.cos(R); [base + r, base - r].forEach((c) => { if (c > 1e-6 && !sols.some((x) => Math.abs(x - c) < 1e-6)) sols.push(c); }); }
      const cols = [IXC.orange, IXC.green];
      sols.forEach((c, i) => { const B = [A0[0] + c * U, A0[1]]; ixTri(ctx, [A0, B, C], cols[i], i ? 'rgba(46,125,79,.10)' : 'rgba(210,123,18,.10)', 3); ixLine(ctx, C, B, IXC.red, 4); ixDot(ctx, ...B, cols[i], 7); ixLabel(ctx, sols.length > 1 ? `B${i ? '₂' : '₁'}` : 'B', B[0], B[1] + 10, 19, 'center', cols[i]); });
      if (!sols.length) { const end = [C[0] + S.a * U * Math.cos(Math.PI / 2 + 0.25), C[1] + S.a * U * Math.sin(Math.PI / 2 + 0.25)]; ixLine(ctx, C, end, IXC.red, 4); }
      ixLine(ctx, A0, C, IXC.blue, 4); ixAngMark(ctx, A0, [A0[0] + 50, A0[1]], C, 44, IXC.purple, `${S.A}°`);
      ixLabel(ctx, `b = ${S.b}`, (A0[0] + C[0]) / 2 - 14, (A0[1] + C[1]) / 2 - 12, 19, 'right', IXC.blue); ixLabel(ctx, 'A', A0[0] - 14, A0[1] - 6, 21, 'right', IXC.ink); ixLabel(ctx, 'C', C[0] - 6, C[1] - 30, 21, 'center', IXC.ink); ixDot(ctx, ...C, IXC.ink, 6);
      const L = [{ h: 'Given' }, `A = ${S.A}°, b = ${S.b}, a = ${S.a}`, `h = b sin A = ${S.b} sin ${S.A}° ≈ ${ixN(h, 2)}`, { h: 'How many triangles?' }];
      if (S.A >= 90) L.push(S.a > S.b ? { note: 'A is not acute and a > b: one triangle.', good: true } : { note: 'A is not acute and a ≤ b: no triangle.', bad: true });
      else if (S.a < h - 1e-9) L.push({ note: 'a < h: side a is too short to reach the base. No triangle.', bad: true });
      else if (Math.abs(S.a - h) < 1e-9) L.push({ note: 'a = h: it just touches. One right triangle.', good: true });
      else if (S.a < S.b) L.push({ note: 'h < a < b: side a hits the base twice. Two triangles!', good: true });
      else L.push({ note: 'a ≥ b: one triangle (the other crossing is behind A).', good: true });
      sols.forEach((c, i) => { const Bdeg = Math.asin(Math.min(1, S.b * Math.sin(R) / S.a)) * 180 / Math.PI, B = i ? 180 - Bdeg : (c >= S.b * Math.cos(R) ? Bdeg : 180 - Bdeg), Cd = 180 - S.A - B;
        L.push({ h: sols.length > 1 ? `Triangle ${i + 1}` : 'The triangle' }, `B ≈ ${ixN(B, 1)}°, C ≈ ${ixN(Cd, 1)}°, c ≈ ${ixN(c, 2)}`); });
      if (sols.length === 2) L.push({ note: 'sin B = b sin A / a gives one angle B; the other is 180° − B.' });
      ixRead(read, L);
    }
    ctl.append(ixSlider('angle A', 10, 150, 1, S.A, (v) => v + '°', (v) => { S.A = v; draw(); }), ixSlider('side b', 4, 14, 0.5, S.b, (v) => ixN(v), (v) => { S.b = v; draw(); }), ixSlider('side a', 1, 16, 0.25, S.a, (v) => ixN(v), (v) => { S.a = v; draw(); }));
    draw();
  } };

// ---- Polar graphs: watch r trace the curve as θ goes around
IX.polar = { subjects: ['precalc'],
  title: 'Polar graphs', hint: 'Pick a type and slide a, b, and n. Press ▶ to watch the curve get traced as θ goes from 0 to 2π (or drag the θ slider).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const S = { k: o.type || 'limcos', a: 2, b: 3, n: 3, th: 2 * Math.PI, play: null };
    const f = (t) => S.k === 'limcos' ? S.a + S.b * Math.cos(t) : S.k === 'limsin' ? S.a + S.b * Math.sin(t) : S.k === 'rosesin' ? S.a * Math.sin(S.n * t) : S.k === 'rosecos' ? S.a * Math.cos(S.n * t) : S.k === 'circle' ? 2 * S.a * Math.cos(t) : S.a * t / 2;
    const name = () => { if (S.k === 'limcos' || S.k === 'limsin') { const r = S.a / S.b; return Math.abs(S.a) < 1e-9 ? 'circle' : Math.abs(S.a - S.b) < 1e-9 ? 'cardioid' : r < 1 ? 'limaçon with an inner loop' : r < 2 ? 'dimpled limaçon' : 'convex limaçon'; }
      if (S.k === 'rosesin' || S.k === 'rosecos') return `rose with ${S.n % 2 ? S.n : 2 * S.n} petals`; if (S.k === 'circle') return 'circle'; return 'spiral of Archimedes'; };
    const eq = () => ({ limcos: `r = ${S.a} + ${S.b} cos θ`, limsin: `r = ${S.a} + ${S.b} sin θ`, rosesin: `r = ${S.a} sin ${S.n}θ`, rosecos: `r = ${S.a} cos ${S.n}θ`, circle: `r = ${2 * S.a} cos θ`, spiral: `r = θ/2` }[S.k]);
    function draw() {
      ctx.clearRect(0, 0, 600, 600); const cx = 300, cy = 300, M = S.k === 'spiral' ? 7 : Math.max(2, ...[S.a + S.b, S.a, 2 * S.a].filter(isFinite)) + 0.5, U = 270 / M;
      ctx.save(); ctx.strokeStyle = IXC.grid; ctx.lineWidth = 1; for (let r = 1; r <= M; r++) { ctx.beginPath(); ctx.arc(cx, cy, r * U, 0, 2 * Math.PI); ctx.stroke(); }
      for (let k = 0; k < 12; k++) { const t = k * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + M * U * Math.cos(t), cy - M * U * Math.sin(t)); ctx.stroke(); } ctx.restore();
      [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2']].forEach(([t, s]) => ixLabel(ctx, s, cx + (M * U + 2) * Math.cos(t) - (t === 0 ? 18 : 0), cy - (M * U + 2) * Math.sin(t) + (t === Math.PI / 2 ? 4 : t === 3 * Math.PI / 2 ? -26 : -10), 16, 'center', IXC.axis));
      for (let r = 1; r <= M; r++) if (r % (M > 6 ? 2 : 1) === 0) ixLabel(ctx, String(r), cx + r * U, cy + 3, 13, 'center', IXC.axis);
      const end = S.k === 'spiral' ? Math.min(S.th * 2, 4 * Math.PI) : S.th;
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3.2; ctx.lineJoin = 'round'; ctx.beginPath();
      for (let j = 0; j <= 1200; j++) { const t = end * j / 1200, r = f(t), x = cx + r * U * Math.cos(t), y = cy - r * U * Math.sin(t); if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
      const t = end, r = f(t), P = [cx + r * U * Math.cos(t), cy - r * U * Math.sin(t)];
      ixLine(ctx, [cx, cy], [cx + M * U * Math.cos(t), cy - M * U * Math.sin(t)], IXC.gray, 1.5, true); ixLine(ctx, [cx, cy], P, IXC.red, 3); ixDot(ctx, ...P, IXC.red, 8, true);
      const cyc = S.k === 'spiral' ? 4 * Math.PI : 2 * Math.PI;
      ixRead(read, [{ h: 'Equation' }, eq(), { h: 'Shape' }, name(), { h: 'Right now' }, `θ = ${ixN(t, 2)} (${Math.round(t * 180 / Math.PI)}°), r = ${ixN(r, 2)}`,
        r < -1e-9 ? { note: 'r is negative: the point is plotted in the opposite direction from θ.' } : null,
        S.k.startsWith('lim') ? { note: 'b > a: inner loop. a = b: cardioid. b < a < 2b: dimple. a ≥ 2b: convex.' } : S.k.startsWith('rose') ? { note: 'n odd: n petals. n even: 2n petals. Petal length = |a|.' } : null]);
      void cyc;
    }
    const thS = ixSlider('θ', 0, 6.2832, 0.02, S.th, (v) => ixN(v, 2), (v) => { stop(); S.th = v; draw(); });
    const stop = () => { if (S.play) { clearInterval(S.play); S.play = null; } };
    const sa = ixSlider('a', 0, 5, 0.5, S.a, (v) => ixN(v), (v) => { S.a = v; draw(); }), sb = ixSlider('b', 0, 5, 0.5, S.b, (v) => ixN(v), (v) => { S.b = v; draw(); }), sn = ixSlider('n', 1, 8, 1, S.n, String, (v) => { S.n = v; draw(); });
    const show = () => { sb.style.display = S.k.startsWith('lim') ? '' : 'none'; sn.style.display = S.k.startsWith('rose') ? '' : 'none'; sa.style.display = S.k === 'spiral' ? 'none' : ''; };
    ctl.append(ixSeg([['limcos', 'a + b cos θ'], ['limsin', 'a + b sin θ'], ['rosesin', 'a sin nθ'], ['rosecos', 'a cos nθ'], ['circle', '2a cos θ'], ['spiral', 'θ/2']], S.k, (k) => { S.k = k; if (k.startsWith('rose') && S.a < 1) { S.a = 3; sa.set(3); } show(); draw(); }), sa, sb, sn, thS,
      el('div', { class: 'ix-btns' }, ixBtn('▶ Trace it', () => { stop(); S.th = 0; S.play = setInterval(() => { S.th = Math.min(2 * Math.PI, S.th + 0.04); thS.set(S.th); draw(); if (S.th >= 2 * Math.PI) stop(); }, 30); })));
    show(); draw();
  } };

// ---- Vectors: drag u and v; components, magnitude and direction, u + v, u − v, dot product and the angle between them
IX.vectors = { subjects: ['precalc', 'calc3'],
  title: 'Vectors', hint: 'Drag the tips of u (blue) and v (red). Turn on u + v or u − v, and watch the dot product and the angle between them.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const V = ixView(cv, [-8, 8], [-8, 8], 26), S = { u: [4, 1], v: [1, 3], mode: o.mode || 'sum', comp: true };
    const arrow = (p, q, col, w = 3.4, dash = false) => { const P = [V.X(p[0]), V.Y(p[1])], Q = [V.X(q[0]), V.Y(q[1])]; ixLine(ctx, P, Q, col, w, dash); const a = Math.atan2(Q[1] - P[1], Q[0] - P[0]);
      if (Math.hypot(Q[0] - P[0], Q[1] - P[1]) < 8) return; ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(...Q); ctx.lineTo(Q[0] - 16 * Math.cos(a - 0.4), Q[1] - 16 * Math.sin(a - 0.4)); ctx.lineTo(Q[0] - 16 * Math.cos(a + 0.4), Q[1] - 16 * Math.sin(a + 0.4)); ctx.fill(); ctx.restore(); };
    const ij = (w) => { const t = [[w[0], 'i'], [w[1], 'j']].filter(([c]) => c).map(([c, e], k) => (k ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : '') + (Math.abs(c) === 1 ? '' : ixN(Math.abs(c))) + e).join(''); return t || '0'; };
    const mag = (w) => Math.hypot(...w), dir = (w) => { let d = Math.atan2(w[1], w[0]) * 180 / Math.PI; if (d < 0) d += 360; return d; };
    const sq = (w) => { const s = w[0] * w[0] + w[1] * w[1], r = Math.sqrt(s); return Number.isInteger(r) ? String(r) : `√${s} ≈ ${ixN(r, 2)}`; };
    function draw() {
      ctx.clearRect(0, 0, 600, 600); ixGrid(ctx, V, { step: 1, lab: 2 }); const { u, v } = S, O = [0, 0];
      if (S.comp) { [[u, IXC.blue], [v, IXC.red]].forEach(([w, c]) => { ixLine(ctx, [V.X(0), V.Y(0)], [V.X(w[0]), V.Y(0)], c, 1.6, true); ixLine(ctx, [V.X(w[0]), V.Y(0)], [V.X(w[0]), V.Y(w[1])], c, 1.6, true); }); }
      if (S.mode === 'sum') { const s = [u[0] + v[0], u[1] + v[1]]; arrow(u, s, IXC.red, 2, true); arrow(v, s, IXC.blue, 2, true); arrow(O, s, IXC.purple, 4); ixLabel(ctx, 'u + v', V.X(s[0]) + 10, V.Y(s[1]) - 28, 19, 'left', IXC.purple); }
      if (S.mode === 'diff') { const d = [u[0] - v[0], u[1] - v[1]]; arrow(v, u, IXC.purple, 4); ixLabel(ctx, 'u − v', V.X((u[0] + v[0]) / 2) + 8, V.Y((u[1] + v[1]) / 2), 19, 'left', IXC.purple); arrow(O, d, IXC.purple, 2, true); }
      if (S.mode === 'dot') { const a1 = Math.atan2(-u[1], u[0]), a2 = Math.atan2(-v[1], v[0]); let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; ctx.save(); ctx.strokeStyle = IXC.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), 40, a1, a1 + d, d < 0); ctx.stroke(); ctx.restore();
        const t = (u[0] * v[0] + u[1] * v[1]) / (v[0] ** 2 + v[1] ** 2 || 1), pr = [v[0] * t, v[1] * t]; ixLine(ctx, [V.X(u[0]), V.Y(u[1])], [V.X(pr[0]), V.Y(pr[1])], IXC.gray, 1.6, true); arrow(O, pr, IXC.orange, 3.5); ixLabel(ctx, 'proj of u onto v', V.X(pr[0]) + 8, V.Y(pr[1]) + 6, 16, 'left', IXC.orange); }
      arrow(O, u, IXC.blue); arrow(O, v, IXC.red); ixLabel(ctx, 'u', V.X(u[0]) + 10, V.Y(u[1]) - 8, 22, 'left', IXC.blue, 'bottom'); ixLabel(ctx, 'v', V.X(v[0]) + 10, V.Y(v[1]) - 8, 22, 'left', IXC.red, 'bottom');
      ixDot(ctx, V.X(u[0]), V.Y(u[1]), IXC.blue, 7, true); ixDot(ctx, V.X(v[0]), V.Y(v[1]), IXC.red, 7, true);
      const dot = u[0] * v[0] + u[1] * v[1], ang = mag(u) && mag(v) ? Math.acos(Math.max(-1, Math.min(1, dot / (mag(u) * mag(v))))) * 180 / Math.PI : 0;
      const L = [{ h: 'Components' }, `u = ⟨${ixN(u[0])}, ${ixN(u[1])}⟩ = ${ij(u)}`, `v = ⟨${ixN(v[0])}, ${ixN(v[1])}⟩`,
        { h: 'Magnitude and direction' }, `‖u‖ = ${sq(u)}, direction ${ixN(dir(u), 1)}°`, `‖v‖ = ${sq(v)}, direction ${ixN(dir(v), 1)}°`];
      if (S.mode === 'sum') L.push({ h: 'Sum (head to tail)' }, `u + v = ⟨${ixN(u[0] + v[0])}, ${ixN(u[1] + v[1])}⟩`, `‖u + v‖ = ${sq([u[0] + v[0], u[1] + v[1]])}`);
      if (S.mode === 'diff') L.push({ h: 'Difference' }, `u − v = ⟨${ixN(u[0] - v[0])}, ${ixN(u[1] - v[1])}⟩`, { note: 'u − v goes from the tip of v to the tip of u.' });
      if (S.mode === 'dot') L.push({ h: 'Dot product' }, `u · v = (${ixN(u[0])})(${ixN(v[0])}) + (${ixN(u[1])})(${ixN(v[1])}) = ${ixN(dot)}`, `cos θ = (u · v)/(‖u‖‖v‖), θ ≈ ${ixN(ang, 1)}°`,
        dot === 0 ? { note: 'u · v = 0: the vectors are orthogonal (perpendicular).', good: true } : Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-9 ? { note: 'The vectors are parallel (θ = 0° or 180°).', good: true } : { note: dot > 0 ? 'u · v > 0: the angle is acute.' : 'u · v < 0: the angle is obtuse.' });
      ixRead(read, L);
    }
    ctl.append(ixSeg([['sum', 'u + v'], ['diff', 'u − v'], ['dot', 'Dot product and angle']], S.mode, (k) => { S.mode = k; draw(); }), ixCheck('Show the components', S.comp, (v) => { S.comp = v; draw(); }));
    ixDrag(cv, (x, y) => ixPick({ u: [V.X(S.u[0]), V.Y(S.u[1])], v: [V.X(S.v[0]), V.Y(S.v[1])] }, x, y, 34), (k, x, y) => { S[k] = [Math.max(-8, Math.min(8, Math.round(V.ix(x)))), Math.max(-8, Math.min(8, Math.round(V.iy(y))))]; draw(); });
    draw();
  } };

// ---- Sinusoidal modeling: fit y = A sin(B(x − C)) + D to data with sliders
const IX_SINDATA = {
  wheel: { name: 'Ferris wheel', x: 'time (seconds)', y: 'height (feet)', xr: [0, 60], yr: [0, 70], A: 30, P: 40, C: 10, D: 35, n: 16, note: 'A rider’s height on a Ferris wheel 60 feet across, 5 feet off the ground, one turn every 40 seconds.' },
  tide: { name: 'Tides', x: 'hours after midnight', y: 'water depth (feet)', xr: [0, 30], yr: [0, 16], A: 4.5, P: 12.4, C: 2, D: 8, n: 16, note: 'Water depth at a harbor; high tide about every 12.4 hours.' },
  temp: { name: 'Temperature', x: 'month (1 = January)', y: 'average high (°F)', xr: [0, 13], yr: [30, 105], A: 21, P: 12, C: 4, D: 72, n: 12, note: 'Average monthly high temperature in southeastern Oklahoma.' } };
IX.sinModel = { subjects: ['precalc'],
  title: 'Modeling with sine curves', hint: 'Pick a data set. Slide the amplitude, period, phase shift, and midline until the curve runs through the points.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_SINDATA[o.data] ? o.data : 'wheel' }, sl = {};
    let pts = [];
    const mk = () => { const d = IX_SINDATA[S.k], r = mulberry32(7); pts = Array.from({ length: d.n }, (_, i) => { const x = d.k === 'temp' ? i + 1 : d.xr[0] + (d.xr[1] - d.xr[0]) * (i + 0.5) / d.n; const x2 = S.k === 'temp' ? i + 1 : x;
      return [x2, d.A * Math.sin(2 * Math.PI / d.P * (x2 - d.C)) + d.D + (r() - 0.5) * d.A * 0.12]; }); Object.assign(S, { A: Math.round(d.A * 0.6), P: Math.round(d.P * 1.3), C: 0, D: Math.round(d.D * 0.85) }); };
    const f = (x) => S.A * Math.sin(2 * Math.PI / S.P * (x - S.C)) + S.D;
    function draw() {
      const d = IX_SINDATA[S.k], V = ixView(cv, d.xr, d.yr, 44); ctx.clearRect(0, 0, 640, 520);
      const sx = (d.xr[1] - d.xr[0]) >= 50 ? 10 : (d.xr[1] - d.xr[0]) >= 20 ? 3 : 1, sy = (d.yr[1] - d.yr[0]) >= 40 ? 10 : 2;
      ctx.save(); ctx.strokeStyle = IXC.grid; ctx.lineWidth = 1;
      for (let k = Math.ceil(d.xr[0] / sx) * sx; k <= d.xr[1] + 1e-9; k += sx) { ctx.beginPath(); ctx.moveTo(V.X(k), V.Y(d.yr[0])); ctx.lineTo(V.X(k), V.Y(d.yr[1])); ctx.stroke(); ixLabel(ctx, String(k), V.X(k), V.Y(d.yr[0]) + 4, 13, 'center', IXC.axis); }
      for (let k = Math.ceil(d.yr[0] / sy) * sy; k <= d.yr[1] + 1e-9; k += sy) { ctx.beginPath(); ctx.moveTo(V.X(d.xr[0]), V.Y(k)); ctx.lineTo(V.X(d.xr[1]), V.Y(k)); ctx.stroke(); ixLabel(ctx, String(k), V.X(d.xr[0]) - 6, V.Y(k), 13, 'right', IXC.axis, 'middle'); }
      ctx.strokeStyle = IXC.ink; ctx.lineWidth = 1.6; ctx.strokeRect(V.X(d.xr[0]), V.Y(d.yr[1]), V.X(d.xr[1]) - V.X(d.xr[0]), V.Y(d.yr[0]) - V.Y(d.yr[1])); ctx.restore();
      ixLabel(ctx, d.x, 320, 500, 15, 'center', IXC.axis); ixLabel(ctx, d.y, 8, 8, 15, 'left', IXC.axis);
      ixLine(ctx, [V.X(d.xr[0]), V.Y(S.D)], [V.X(d.xr[1]), V.Y(S.D)], IXC.gray, 1.6, true);
      ixCurve(ctx, V, f, IXC.blue, { w: 3.2 }); pts.forEach(([x, y]) => ixDot(ctx, V.X(x), V.Y(y), IXC.red, 6));
      const err = Math.sqrt(pts.reduce((s, [x, y]) => s + (f(x) - y) ** 2, 0) / pts.length), good = err < d.A * 0.12;
      ixRead(read, [{ h: d.name }, { note: d.note }, { h: 'Your model' }, `y = ${ixN(S.A, 1)} sin(${'2π/' + ixN(S.P, 1)} · ${Math.abs(S.C) < 0.05 ? 'x' : '(' + ixShift(+S.C.toFixed(1)) + ')'}) + ${ixN(S.D, 1)}`,
        `amplitude ${ixN(S.A, 1)} · period ${ixN(S.P, 1)} · phase shift ${ixN(S.C, 1)} · midline y = ${ixN(S.D, 1)}`,
        { h: 'How close' }, `typical miss: ${ixN(err, 1)} ${d.y.split('(')[1] ? d.y.split('(')[1].replace(')', '') : ''}`,
        good ? { note: 'That fits the data well!', good: true } : { note: 'Tips: midline = (max + min)/2, amplitude = (max − min)/2, period = time from one peak to the next.' }]);
    }
    const mkS = () => { const d = IX_SINDATA[S.k]; ctl.querySelectorAll('.ix-sl').forEach((n) => n.remove());
      sl.A = ixSlider('amplitude', 0, d.A * 2, d.A > 10 ? 1 : 0.5, S.A, (v) => ixN(v, 1), (v) => { S.A = v; draw(); });
      sl.P = ixSlider('period', d.P * 0.4, d.P * 2, d.P > 20 ? 1 : 0.2, S.P, (v) => ixN(v, 1), (v) => { S.P = v; draw(); });
      sl.C = ixSlider('phase shift', -d.P / 2, d.P / 2, d.P > 20 ? 1 : 0.2, S.C, (v) => ixN(v, 1), (v) => { S.C = v; draw(); });
      sl.D = ixSlider('midline', d.yr[0], d.yr[1], d.D > 20 ? 1 : 0.5, S.D, (v) => ixN(v, 1), (v) => { S.D = v; draw(); });
      ctl.insertBefore(sl.D, btns); ctl.insertBefore(sl.C, sl.D); ctl.insertBefore(sl.P, sl.C); ctl.insertBefore(sl.A, sl.P); };
    const btns = el('div', { class: 'ix-btns' }, ixBtn('Show a good fit', () => { const d = IX_SINDATA[S.k]; Object.assign(S, { A: d.A, P: d.P, C: d.C, D: d.D }); mkS(); draw(); }));
    ctl.append(ixSeg(Object.entries(IX_SINDATA).map(([k, d]) => [k, d.name]), S.k, (k) => { S.k = k; mk(); mkS(); draw(); }), btns);
    mk(); mkS(); draw();
  } };

// a grid with separate x and y steps (sx, sy) and label steps (lx, ly)
function ixGrid2(ctx, V, sx, sy, lx, ly) {
  const [x0, x1] = V.xr, [y0, y1] = V.yr; ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = IXC.grid;
  for (let k = Math.ceil(x0 / sx - 1e-9); k * sx <= x1 + 1e-9; k++) { ctx.beginPath(); ctx.moveTo(V.X(k * sx), V.Y(y0)); ctx.lineTo(V.X(k * sx), V.Y(y1)); ctx.stroke(); }
  for (let k = Math.ceil(y0 / sy - 1e-9); k * sy <= y1 + 1e-9; k++) { ctx.beginPath(); ctx.moveTo(V.X(x0), V.Y(k * sy)); ctx.lineTo(V.X(x1), V.Y(k * sy)); ctx.stroke(); }
  ctx.strokeStyle = IXC.ink; ctx.lineWidth = 1.6; const ax = Math.max(x0, Math.min(x1, 0)), ay = Math.max(y0, Math.min(y1, 0));
  ctx.beginPath(); ctx.moveTo(V.X(x0), V.Y(ay)); ctx.lineTo(V.X(x1), V.Y(ay)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(V.X(ax), V.Y(y0)); ctx.lineTo(V.X(ax), V.Y(y1)); ctx.stroke(); ctx.restore();
  for (let k = Math.ceil(x0 / lx - 1e-9) * lx; k <= x1 + 1e-9; k += lx) if (Math.abs(k) > 1e-9) ixLabel(ctx, ixN(k), V.X(k), V.Y(ay) + 4, 13, 'center', IXC.axis);
  for (let k = Math.ceil(y0 / ly - 1e-9) * ly; k <= y1 + 1e-9; k += ly) if (Math.abs(k) > 1e-9) ixLabel(ctx, ixN(k), V.X(ax) - 6, V.Y(k), 13, 'right', IXC.axis, 'middle');
}

// ---- Slope and equations of lines: drag two points
IX.slope = { subjects: ['algebra1', 'algebra2', 'geometry'],
  title: 'Slope and equations of lines', hint: 'Drag the two points. The rise-over-run triangle, the slope, and the equation in three forms update. Line them up to see horizontal and vertical lines.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const V = ixView(cv, [-10, 10], [-10, 10], 26), S = { P: [-3, -2], Q: [3, 2], tri: true };
    const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
    const frac = (n, d) => { if (!d) return 'undefined'; if (d < 0) { n = -n; d = -d; } const k = g(n, d) || 1; n /= k; d /= k; return d === 1 ? ixN(n) : `${n < 0 ? '−' : ''}${Math.abs(n)}/${d}`; };
    function draw() {
      ctx.clearRect(0, 0, 600, 600); ixGrid(ctx, V, { step: 1, lab: 2 });
      const [x1, y1] = S.P, [x2, y2] = S.Q, run = x2 - x1, rise = y2 - y1, c = (p) => [V.X(p[0]), V.Y(p[1])];
      if (run || rise) ixInf(ctx, cv, c(S.P), c(S.Q), IXC.blue, 3.4);
      if (S.tri && run && rise) { const K = [x2, y1]; ixLine(ctx, c(S.P), c(K), IXC.green, 3.4); ixLine(ctx, c(K), c(S.Q), IXC.red, 3.4);
        ixLabel(ctx, `run = ${ixN(run)}`, (c(S.P)[0] + c(K)[0]) / 2, c(K)[1] + (rise > 0 ? 8 : -30), 18, 'center', IXC.green); ixLabel(ctx, `rise = ${ixN(rise)}`, c(K)[0] + (run > 0 ? 10 : -10), (c(K)[1] + c(S.Q)[1]) / 2, 18, run > 0 ? 'left' : 'right', IXC.red, 'middle'); }
      [['P', S.P], ['Q', S.Q]].forEach(([n, p]) => { ixDot(ctx, ...c(p), IXC.blue, 8, true); ixLabel(ctx, `(${ixN(p[0])}, ${ixN(p[1])})`, c(p)[0] + 12, c(p)[1] - 30, 18, 'left', IXC.blue); });
      const L = [{ h: 'Slope' }];
      if (!run && !rise) L.push({ note: 'The two points are the same point. Drag one away.' });
      else if (!run) L.push(`m = ${ixN(rise)}/0: undefined`, { note: 'A vertical line: the run is 0, so the slope is undefined.', bad: true }, { h: 'Equation' }, `x = ${ixN(x1)}`);
      else { const m = frac(rise, run), mv = rise / run, b = y1 - mv * x1, bs = Number.isInteger(+b.toFixed(9)) ? ixN(b) : frac(Math.round(b * run), run);
        const pn = (v) => (v < 0 ? `(${ixN(v)})` : ixN(v)); L.push(`m = rise/run = (${ixN(y2)} − ${pn(y1)})/(${ixN(x2)} − ${pn(x1)}) = ${ixN(rise)}/${ixN(run)} = ${m}`);
        L.push(!rise ? { note: 'A horizontal line: the rise is 0, so the slope is 0.', good: true } : mv > 0 ? { note: 'Positive slope: the line goes up from left to right.' } : { note: 'Negative slope: the line goes down from left to right.' });
        L.push({ h: 'Slope-intercept form' }, !rise ? `y = ${ixN(y1)}` : `y = ${mv === 1 ? '' : mv === -1 ? '−' : m}x${b ? (b > 0 ? ' + ' : ' − ') + bs.replace('−', '') : ''}`);
        L.push({ h: 'Point-slope form' }, `y ${y1 < 0 ? '+ ' + ixN(-y1) : '− ' + ixN(y1)} = ${m}(x ${x1 < 0 ? '+ ' + ixN(-x1) : '− ' + ixN(x1)})`);
        let A = -rise, B = run, C = -rise * x1 + run * y1; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } const k = g(g(A, B), C) || 1; A /= k; B /= k; C /= k;
        L.push({ h: 'Standard form' }, `${A ? (A === 1 ? '' : ixN(A)) + 'x' : ''}${B ? (A ? (B > 0 ? ' + ' : ' − ') : B < 0 ? '−' : '') + (Math.abs(B) === 1 ? '' : ixN(Math.abs(B))) + 'y' : ''} = ${ixN(C)}`); }
      ixRead(read, L);
    }
    ctl.append(ixCheck('Show rise and run', S.tri, (v) => { S.tri = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Horizontal', () => { S.Q = [S.Q[0] === S.P[0] ? S.P[0] + 4 : S.Q[0], S.P[1]]; draw(); }), ixBtn('Vertical', () => { S.Q = [S.P[0], S.Q[1] === S.P[1] ? S.P[1] + 4 : S.Q[1]]; draw(); }), ixBtn('Reset', () => { S.P = [-3, -2]; S.Q = [3, 2]; draw(); })));
    ixDrag(cv, (x, y) => ixPick({ P: [V.X(S.P[0]), V.Y(S.P[1])], Q: [V.X(S.Q[0]), V.Y(S.Q[1])] }, x, y, 34), (k, x, y) => { S[k] = [Math.max(-10, Math.min(10, Math.round(V.ix(x)))), Math.max(-10, Math.min(10, Math.round(V.iy(y))))]; draw(); });
    draw();
  } };

// ---- Exponential growth and decay (and compound interest), next to linear growth
IX.exponential = { subjects: ['algebra1', 'algebra2', 'precalc'],
  title: 'Exponential growth and decay', hint: 'Slide a and b. Compare with a line that starts at the same place. Switch to compound interest to see how often interest is added.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const S = { mode: o.mode || 'exp', a: 2, b: 1.5, m: 2, lin: true, P: 1000, r: 6, n: 12, t: 10 }, sl = {};
    function draw() {
      ctx.clearRect(0, 0, 600, 520); let L;
      if (S.mode === 'exp') {
        const f = (x) => S.a * S.b ** x, g = (x) => S.a + S.m * x, top = Math.max(10, Math.min(200, Math.ceil(Math.max(f(6), S.lin ? g(6) : 0) / 10) * 10)), V = ixView(cv, [-1, 6.5], [-top * 0.08, top], 40);
        ixGrid2(ctx, V, 1, top / 10, 1, top / 5); ixCurve(ctx, V, f, IXC.blue, { w: 3.4 }); if (S.lin) ixCurve(ctx, V, g, IXC.orange, { w: 2.6, dash: true });
        for (let x = 0; x <= 6; x++) { ixDot(ctx, V.X(x), V.Y(f(x)), IXC.blue, 5); if (S.lin) ixDot(ctx, V.X(x), V.Y(g(x)), IXC.orange, 4); }
        const tbl = el('table', { style: 'border-collapse:collapse;font:19px "Times New Roman",serif;margin:4px 0' }, el('tr', {}, ...['x', ...[0, 1, 2, 3, 4, 5]].map((t) => el('td', { style: 'border:1px solid #ddd;padding:2px 7px;font-weight:700' }, String(t)))),
          el('tr', {}, el('td', { style: 'border:1px solid #ddd;padding:2px 7px;color:#1f5fa8' }, 'y'), ...[0, 1, 2, 3, 4, 5].map((x) => el('td', { style: 'border:1px solid #ddd;padding:2px 7px;color:#1f5fa8' }, ixN(f(x), 2)))),
          S.lin ? el('tr', {}, el('td', { style: 'border:1px solid #ddd;padding:2px 7px;color:#d27b12' }, 'line'), ...[0, 1, 2, 3, 4, 5].map((x) => el('td', { style: 'border:1px solid #ddd;padding:2px 7px;color:#d27b12' }, ixN(g(x), 2)))) : '');
        const pct = Math.round((S.b - 1) * 100);
        ixRead(read, [{ h: 'Exponential (blue)' }, `y = ${ixN(S.a)}(${ixN(S.b)})ˣ`, S.b > 1 ? { note: `b > 1: growth. Each step multiplies by ${ixN(S.b)} (a ${pct}% increase).`, good: true } : S.b < 1 ? { note: `0 < b < 1: decay. Each step multiplies by ${ixN(S.b)} (a ${-pct}% decrease).` } : { note: 'b = 1: no change (a flat line).' },
          S.lin ? { h: 'Linear (orange)' } : null, S.lin ? `y = ${ixN(S.a)} + ${ixN(S.m)}x: adds ${ixN(S.m)} each step` : null]);
        read.append(tbl, el('div', { class: 'ix-note' }, S.lin && S.b > 1 ? 'Adding the same amount (linear) vs. multiplying by the same amount (exponential): eventually exponential growth passes any line.' : 'y-intercept = a. The ratio between consecutive y-values is always b.'));
        return;
      }
      const T = S.t, A = (t, n) => (n === 'c' ? S.P * Math.exp(S.r / 100 * t) : S.P * (1 + S.r / 100 / n) ** (n * t)), top = Math.ceil(A(T, 'c') / 500) * 500, V = ixView(cv, [0, T], [0, top], 56);
      ixGrid2(ctx, V, T > 20 ? 5 : T > 8 ? 2 : 1, top / 10, T > 20 ? 5 : T > 8 ? 2 : 1, top / 5); ixLabel(ctx, 'years', 590, 470, 14, 'right', IXC.axis); ixCurve(ctx, V, (t) => S.P * (1 + S.r / 100 * t), IXC.gray, { w: 2, dash: true }); ixCurve(ctx, V, (t) => A(t, S.n), IXC.blue, { w: 3.4 });
      const per = { 1: 'yearly', 4: 'quarterly', 12: 'monthly', 365: 'daily', c: 'continuously' }[S.n];
      L = [{ h: 'Compound interest' }, S.n === 'c' ? 'A = Pe^(rt)' : 'A = P(1 + r/n)^(nt)', S.n === 'c' ? `A = ${S.P}e^(${S.r / 100} · ${T})` : `A = ${S.P}(1 + ${S.r / 100}/${S.n})^(${S.n} · ${T})`, `A ≈ $${A(T, S.n).toFixed(2)} (compounded ${per})`,
        { h: 'Compare' }, ...[1, 4, 12, 365, 'c'].map((n) => `${{ 1: 'yearly', 4: 'quarterly', 12: 'monthly', 365: 'daily', c: 'continuously' }[n]}: $${A(T, n).toFixed(2)}`), `simple interest (gray): $${(S.P * (1 + S.r / 100 * T)).toFixed(2)}`];
      ixRead(read, L);
    }
    sl.a = ixSlider('a (start)', 0.5, 10, 0.5, S.a, (v) => ixN(v), (v) => { S.a = v; draw(); }); sl.b = ixSlider('b (factor)', 0.25, 3, 0.05, S.b, (v) => ixN(v), (v) => { S.b = v; draw(); });
    sl.m = ixSlider('line adds', 0, 10, 0.5, S.m, (v) => ixN(v), (v) => { S.m = v; draw(); }); sl.lin = ixCheck('Compare with a line', S.lin, (v) => { S.lin = v; draw(); });
    sl.P = ixSlider('P (deposit)', 100, 5000, 100, S.P, (v) => '$' + v, (v) => { S.P = v; draw(); }); sl.r = ixSlider('r (rate)', 1, 15, 0.5, S.r, (v) => v + '%', (v) => { S.r = v; draw(); }); sl.t = ixSlider('t (years)', 1, 40, 1, S.t, String, (v) => { S.t = v; draw(); });
    sl.n = ixSeg([[1, 'yearly'], [4, 'quarterly'], [12, 'monthly'], [365, 'daily'], ['c', 'continuous']], S.n, (k) => { S.n = k; draw(); });
    const show = () => { const e = S.mode === 'exp'; [sl.a, sl.b, sl.m, sl.lin].forEach((x) => (x.style.display = e ? '' : 'none')); [sl.P, sl.r, sl.t, sl.n].forEach((x) => (x.style.display = e ? 'none' : '')); };
    ctl.append(ixSeg([['exp', 'y = a · bˣ'], ['money', 'Compound interest']], S.mode, (k) => { S.mode = k; show(); draw(); }), sl.a, sl.b, sl.m, sl.lin, sl.P, sl.r, sl.t, sl.n);
    show(); draw();
  } };

// ---- Linear inequalities, systems of inequalities, and linear programming
IX.inequalities = { subjects: ['algebra1', 'algebra2'],
  title: 'Linear inequalities and feasible regions', hint: 'Drag the dots to move each boundary line. Tap the sign buttons to change < ≤ > ≥. The region where all the shading overlaps is the solution. Drag the star to test a point.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const V = ixView(cv, [-2, 12], [-2, 12], 26), cols = [IXC.blue, IXC.red, IXC.green];
    const S = { n: +(o.n || 2), lp: o.lp === '1', test: [3, 2], obj: [3, 2],
      L: [{ p: [0, 8], q: [8, 0], s: '≤' }, { p: [0, 2], q: [8, 6], s: '≤' }, { p: [6, 0], q: [6, 10], s: '≤' }] };
    // a x + b y (sign) c through p and q, written with b ≥ 0 when possible
    const coef = (l) => { const a = l.q[1] - l.p[1], b = -(l.q[0] - l.p[0]), c = a * l.p[0] + b * l.p[1]; return { a, b, c }; };
    const sat = (l, x, y) => { const { a, b, c } = coef(l), v = a * x + b * y - c, e = 1e-9;
      // ≤ means below (or left of a vertical line); flip if b < 0 (or a < 0 when vertical)
      const flip = b < 0 || (b === 0 && a < 0) ? -1 : 1, w = v * flip; return l.s === '≤' ? w <= e : l.s === '<' ? w < -e : l.s === '≥' ? w >= -e : w > e; };
    const lines = () => S.L.slice(0, S.n);
    const half = (poly, l) => { const { a, b, c } = coef(l), flip = b < 0 || (b === 0 && a < 0) ? -1 : 1, up = l.s === '≥' || l.s === '>', f = (p) => (a * p[0] + b * p[1] - c) * flip * (up ? -1 : 1);
      const out = []; for (let i = 0; i < poly.length; i++) { const P = poly[i], Q = poly[(i + 1) % poly.length], fp = f(P), fq = f(Q); if (fp <= 1e-9) out.push(P); if ((fp < -1e-9 && fq > 1e-9) || (fp > 1e-9 && fq < -1e-9)) { const t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); } } return out; };
    const nm = (l) => { const { a, b, c } = coef(l); let A = a, B = b, C = c, s = l.s; if (B < 0 || (B === 0 && A < 0)) { A = -A; B = -B; C = -C; }
      const g = (x, y) => (y ? g(y, x % y) : Math.abs(x)), k = g(g(A, B), C) || 1; A /= k; B /= k; C /= k;
      if (B) { const m = -A / B, bb = C / B, mf = ixFrac(m), bf = ixFrac(Math.abs(bb)); return `y ${s} ${m ? (Math.abs(m - 1) < 1e-9 ? '' : Math.abs(m + 1) < 1e-9 ? '−' : mf) + 'x' : ''}${bb ? (m ? (bb > 0 ? ' + ' : ' − ') : bb < 0 ? '−' : '') + bf : m ? '' : '0'}`; }
      const sx = { '≤': '≤', '<': '<', '≥': '≥', '>': '>' }[s]; return `x ${A > 0 ? sx : { '≤': '≥', '<': '>', '≥': '≤', '>': '<' }[s]} ${ixFrac(C / A)}`; };
    function draw() {
      ctx.clearRect(0, 0, 600, 600); ixGrid(ctx, V, { step: 1, lab: 2 }); const c = (p) => [V.X(p[0]), V.Y(p[1])];
      let region = [[-2, -2], [12, -2], [12, 12], [-2, 12]]; if (S.lp) { region = half(region, { p: [0, 0], q: [0, 1], s: '≥' }); region = half(region, { p: [0, 0], q: [1, 0], s: '≥' }); }
      lines().forEach((l, i) => { let h = half([[-2, -2], [12, -2], [12, 12], [-2, 12]], l); ctx.save(); ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.08; ctx.beginPath(); h.forEach((p, k) => (k ? ctx.lineTo(...c(p)) : ctx.moveTo(...c(p)))); ctx.closePath(); ctx.fill(); ctx.restore(); region = half(region, l); });
      if (region.length > 2) { ctx.save(); ctx.fillStyle = IXC.purple; ctx.globalAlpha = 0.22; ctx.beginPath(); region.forEach((p, k) => (k ? ctx.lineTo(...c(p)) : ctx.moveTo(...c(p)))); ctx.closePath(); ctx.fill(); ctx.restore(); }
      lines().forEach((l, i) => { ixInf(ctx, cv, c(l.p), c(l.q), cols[i], 3, l.s === '<' || l.s === '>'); ixDot(ctx, ...c(l.p), cols[i], 7, true); ixDot(ctx, ...c(l.q), cols[i], 7, true); });
      const ok = lines().map((l) => sat(l, ...S.test)), inAll = ok.every(Boolean) && (!S.lp || (S.test[0] >= 0 && S.test[1] >= 0));
      ctx.save(); ctx.fillStyle = inAll ? IXC.green : IXC.ink; ctx.font = `30px ${IXF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', ...c(S.test)); ctx.restore();
      const L = [{ h: 'The inequalities' }, ...lines().map((l, i) => nm(l)), S.lp ? 'x ≥ 0, y ≥ 0' : null, { h: `Test the star (${ixN(S.test[0])}, ${ixN(S.test[1])})` },
        ...lines().map((l, i) => `${nm(l)}: ${ok[i] ? '✓ true' : '✗ false'}`), inAll ? { note: 'The star makes every inequality true: it is a solution.', good: true } : { note: 'The star is not a solution: at least one inequality is false.', bad: true },
        { note: 'Dashed line: < or > (points on the line don’t count). Solid line: ≤ or ≥ (they do).' }];
      if (S.lp && region.length > 2) { const val = (p) => S.obj[0] * p[0] + S.obj[1] * p[1], vs = region.map((p) => [p, val(p)]), mx = vs.reduce((a, b) => (b[1] > a[1] ? b : a)), mn = vs.reduce((a, b) => (b[1] < a[1] ? b : a)), bounded = region.every((p) => p[0] < 11.9 && p[1] < 11.9);
        region.forEach((p) => ixDot(ctx, ...c(p), IXC.purple, 6));
        L.push({ h: `Linear programming: P = ${S.obj[0]}x + ${S.obj[1]}y` }, ...vs.map(([p, v]) => `(${ixN(p[0], 2)}, ${ixN(p[1], 2)}): P = ${ixN(v, 2)}`),
          bounded ? { note: `Maximum ${ixN(mx[1], 2)} at (${ixN(mx[0][0], 2)}, ${ixN(mx[0][1], 2)}); minimum ${ixN(mn[1], 2)} at (${ixN(mn[0][0], 2)}, ${ixN(mn[0][1], 2)}). The best values are always at corners.`, good: true } : { note: 'The region is unbounded (it runs off the screen), so there may be no maximum.' }); }
      ixRead(read, L);
    }
    const signs = el('div', {}); const mkSigns = () => { signs.innerHTML = ''; lines().forEach((l, i) => signs.append(el('div', { style: `display:flex;gap:8px;align-items:center;color:${cols[i]};font-weight:700` }, `Line ${i + 1}:`, ixSeg(['<', '≤', '>', '≥'].map((k) => [k, k]), l.s, (k) => { l.s = k; draw(); })))); };
    const objS = el('div', {}, ixSlider('P: x worth', 0, 10, 1, S.obj[0], String, (v) => { S.obj[0] = v; draw(); }), ixSlider('P: y worth', 0, 10, 1, S.obj[1], String, (v) => { S.obj[1] = v; draw(); }));
    ctl.append(ixSeg([[1, '1 inequality'], [2, '2'], [3, '3']], S.n, (k) => { S.n = k; mkSigns(); draw(); }), signs, ixCheck('Linear programming (x ≥ 0, y ≥ 0, and P = ax + by)', S.lp, (v) => { S.lp = v; objS.style.display = v ? '' : 'none'; draw(); }), objS);
    objS.style.display = S.lp ? '' : 'none'; mkSigns();
    ixDrag(cv, (x, y) => { const pts = { test: [V.X(S.test[0]), V.Y(S.test[1])] }; lines().forEach((l, i) => { pts['p' + i] = [V.X(l.p[0]), V.Y(l.p[1])]; pts['q' + i] = [V.X(l.q[0]), V.Y(l.q[1])]; }); return ixPick(pts, x, y, 30); },
      (k, x, y) => { const p = [Math.max(-2, Math.min(12, Math.round(V.ix(x)))), Math.max(-2, Math.min(12, Math.round(V.iy(y))))]; if (k === 'test') S.test = p; else { const l = S.L[+k[1]], other = k[0] === 'p' ? l.q : l.p; if (p[0] === other[0] && p[1] === other[1]) return; l[k[0]] = p; } draw(); });
    draw();
  } };

// ---- Probability simulator: experimental vs. theoretical probability
const IX_PROB = {
  die: { name: 'One die', out: ['1', '2', '3', '4', '5', '6'], p: [1, 1, 1, 1, 1, 1].map((x) => x / 6), roll: (r) => Math.floor(r() * 6) },
  sum: { name: 'Sum of two dice', out: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], p: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((x) => x / 36), roll: (r) => Math.floor(r() * 6) + Math.floor(r() * 6) },
  coins: { name: 'Heads in 3 coin flips', out: ['0', '1', '2', '3'], p: [1, 3, 3, 1].map((x) => x / 8), roll: (r) => (r() < 0.5) + (r() < 0.5) + (r() < 0.5) },
  heads10: { name: 'Heads in 10 coin flips', out: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], p: [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1].map((x) => x / 1024), roll: (r) => { let h = 0; for (let i = 0; i < 10; i++) h += r() < 0.5; return h; } },
  coindie: { name: 'Coin and die: heads and an even number', out: ['yes', 'no'], p: [0.25, 0.75], roll: (r) => (r() < 0.5 && Math.floor(r() * 6) % 2 === 1 ? 0 : 1) },
  card: { name: 'Suit of a card', out: ['♠', '♥', '♦', '♣'], p: [0.25, 0.25, 0.25, 0.25], roll: (r) => Math.floor(r() * 4) },
  spinner: { name: 'Spinner (1/2, 1/4, 1/8, 1/8)', out: ['red', 'blue', 'green', 'gold'], p: [0.5, 0.25, 0.125, 0.125], roll: (r) => { const v = r(); return v < 0.5 ? 0 : v < 0.75 ? 1 : v < 0.875 ? 2 : 3; } } };
IX.probability = { subjects: ['act', 'algebra1', 'algebra2', 'geometry'],
  title: 'Probability simulator', hint: 'Pick an experiment and run it 1, 10, 100, or 1,000 times. The bars (what happened) get closer to the outlines (the theoretical probability) the more you run it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 460), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_PROB[o.exp] ? o.exp : 'sum', cnt: [], n: 0, last: null }, rnd = mulberry32((Date.now() % 1e9) | 0);
    const reset = () => { S.cnt = IX_PROB[S.k].out.map(() => 0); S.n = 0; S.last = null; };
    const run = (m) => { const E = IX_PROB[S.k]; for (let i = 0; i < m; i++) { const j = E.roll(rnd); S.cnt[j]++; S.last = j; } S.n += m; draw(); };
    function draw() {
      const E = IX_PROB[S.k], k = E.out.length, top = Math.max(0.3, ...E.p.map((x) => x * 1.25), ...S.cnt.map((c) => (S.n ? c / S.n : 0) * 1.1)), X0 = 60, W = 560, H = 360, Y0 = 400, bw = W / k;
      ctx.clearRect(0, 0, 640, 460); ctx.save(); ctx.strokeStyle = IXC.grid; ctx.fillStyle = IXC.axis; ctx.font = `13px ${IXF}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let v = 0; v <= top + 1e-9; v += 0.05) { const y = Y0 - v / top * H; ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X0 + W, y); ctx.stroke(); if (Math.round(v * 100) % 10 === 0) ctx.fillText(Math.round(v * 100) + '%', X0 - 6, y); } ctx.restore();
      E.out.forEach((lab, i) => { const x = X0 + i * bw, f = S.n ? S.cnt[i] / S.n : 0, h = f / top * H, th = E.p[i] / top * H;
        ctx.save(); ctx.fillStyle = i === S.last ? IXC.orange : IXC.blue; ctx.globalAlpha = 0.8; ctx.fillRect(x + bw * 0.15, Y0 - h, bw * 0.7, h); ctx.restore();
        ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2.6; ctx.setLineDash([6, 4]); ctx.strokeRect(x + bw * 0.12, Y0 - th, bw * 0.76, th); ctx.restore();
        ixLabel(ctx, lab, x + bw / 2, Y0 + 6, 18, 'center', lab === '♥' || lab === '♦' ? IXC.red : IXC.ink); });
      ixLine(ctx, [X0, Y0], [X0 + W, Y0], IXC.ink, 2);
      const L = [{ h: E.name }, `Trials: ${S.n}`, S.last !== null ? `Last result: ${E.out[S.last]}` : null, { h: 'Experimental vs. theoretical' },
        ...E.out.map((t, i) => `${t}: ${S.cnt[i]} times = ${S.n ? (100 * S.cnt[i] / S.n).toFixed(1) : '0.0'}% · theory ${(100 * E.p[i]).toFixed(1)}%`)];
      if (S.n) { const dev = Math.max(...E.p.map((p, i) => Math.abs(S.cnt[i] / S.n - p))); L.push({ note: S.n < 100 ? 'With only a few trials, the results bounce around a lot.' : dev < 0.02 ? 'With many trials, the experimental probabilities are very close to the theoretical ones (the law of large numbers).' : 'Keep going: more trials bring the bars closer to the outlines.', good: S.n >= 100 && dev < 0.02 }); }
      if (S.k === 'sum') L.push({ note: 'A sum of 7 is most likely: 6 of the 36 outcomes (1+6, 2+5, 3+4, 4+3, 5+2, 6+1).' });
      ixRead(read, L);
    }
    ctl.append(ixSeg(Object.entries(IX_PROB).map(([k, E]) => [k, E.name]), S.k, (k) => { S.k = k; reset(); draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Run 1', () => run(1)), ixBtn('Run 10', () => run(10)), ixBtn('Run 100', () => run(100)), ixBtn('Run 1,000', () => run(1000)), ixBtn('Start over', () => { reset(); draw(); })),
      el('div', { class: 'small', style: 'color:#5c5a55' }, 'Blue bars: what happened. Red outlines: the theoretical probability.'));
    reset(); draw();
  } };

// ---- TI-Nspire CX II: which keys to press, one step at a time
const IX_NS_KEYS = (() => { // [label, x, y, w, h, kind, label above] on a 400 × 900 drawing, laid out like the CX II
  const K = [];
  [['esc', 330, ''], ['▤', 380, 'save'], ['tab', 430, '']].forEach(([l, y, a]) => K.push([l, 56, y, 54, 30, 'w', a]));
  [['⌂on', 330, 'off'], ['doc', 380, '+page'], ['menu', 430, '']].forEach(([l, y, a]) => K.push([l, 290, y, 54, 30, 'w', a]));
  [['ctrl', 56, 'g', ''], ['⇧shift', 142, 'w', 'CAPS'], ['var', 216, 'w', 'sto→'], ['del', 290, 'w', 'clear']].forEach(([l, x, k, a]) => K.push([l, x, 500, l === 'ctrl' ? 54 : 54, 30, k, a]));
  const L = [[['=', '≠≥▸'], ['trig', '?']], [['^', 'ⁿ√x'], ['x²', '√']], [['eˣ', 'ln'], ['10ˣ', 'log']], [['(', '[ ]'], [')', '{ }']]];
  const R = [[['⊞', ':='], ['📖', '∞β°']], [['×', '“□”'], ['÷', '□/□']], [['+', ''], ['−', '']]];
  const N = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['0', '.', '(−)']], NA = [['', '', ''], ['', '', ''], ['', '', ''], ['', 'capture', 'ans']];
  for (let r = 0; r < 4; r++) { const y = 560 + r * 46;
    L[r].forEach(([l, a], c) => K.push([l, 52 + c * 38, y, 36, 30, 'w', a]));
    N[r].forEach((l, c) => K.push([l, 138 + c * 50, y - 1, 44, 33, 'd', NA[r][c]]));
    if (r < 3) R[r].forEach(([l, a], c) => K.push([l, 286 + c * 34, y, 30, 30, 'w', a])); }
  K.push(['enter', 286, 698, 64, 30, 'w', '≈']);
  const rows = [['EE', 'A', 'B', 'C', 'D', 'E', 'F', 'G', '?!▸'], ['π▸', 'H', 'I', 'J', 'K', 'L', 'M', 'N', '⚑▸'], [',', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', '↵'], ['V', 'W', 'X', 'Y', 'Z', '␣']];
  rows.forEach((row, r) => row.forEach((l, c) => { const x = (r === 3 ? 74 : 44) + c * 36, dark = r === 3 && /[XYZ]/.test(l); K.push([l, x, 750 + r * 31, l === '␣' ? 62 : 30, 24, dark ? 'd' : 'w', '']); }));
  return K; })();
const IX_NS_ALIAS = { '⌂ on': '⌂on', shift: '⇧shift' };
const IX_NS_STEPS = {
  trig: { title: 'sin 35° (degree mode)', steps: [['', 'Check the corner: it should say DEG. (If it says RAD, click it.)', ''], ['trig', 'Press trig. The trig palette opens at the bottom of the screen, with sin picked.', 'TRIG:sin'], ['enter', 'sin is already picked: press enter (or click it).', 'sin(▮)'], ['3', 'Type the angle.', 'sin(3▮)'], ['5', '', 'sin(35▮)'], ['enter', 'Press enter.', 'sin(35)      0.573576']] },
  invtrig: { title: 'tan⁻¹(8/5) (degree mode)', steps: [['trig', 'Press trig. The trig palette opens, with sin picked.', 'TRIG:sin'], ['touchpad', 'On the touchpad, press ▼ to go down to the inverses, then ▶ twice to get to tan⁻¹.', 'TRIG:tan⁻¹'], ['enter', 'Press enter.', 'tan⁻¹(▮)'], ['ctrl', 'For a fraction box, press ctrl …', 'tan⁻¹(▮)'], ['÷', '… then ÷.', 'tan⁻¹(▮/□)'], ['8', 'Type the top.', 'tan⁻¹(8/□)'], ['tab', 'Press tab (or ▼ on the touchpad) to get to the bottom.', 'tan⁻¹(8/▮)'], ['5', 'Type the bottom.', 'tan⁻¹(8/5)'], ['enter', 'Press enter.', 'tan⁻¹(8/5)     57.9946']] },
  decimal: { title: '2/3 as a decimal', steps: [['ctrl', 'Press ctrl …', ''], ['÷', '… then ÷ for a fraction box.', '▮/□'], ['2', '', '2/□'], ['tab', 'Press tab to move to the bottom.', '2/▮'], ['3', '', '2/3'], ['ctrl', 'Press ctrl enter instead of enter …', '2/3'], ['enter', '… to get the decimal (≈).', '2/3      0.666667']] },
  sqrt: { title: '√(5² + 12²)', steps: [['ctrl', 'Press ctrl …', ''], ['x²', '… then x² for a square root.', '√(▮)'], ['5', '', '√(5▮)'], ['x²', 'x² squares it.', '√(5²▮)'], ['+', '', '√(5²+▮)'], ['1', '', '√(5²+1▮)'], ['2', '', '√(5²+12▮)'], ['x²', '', '√(5²+12²)'], ['enter', 'Press enter.', '√(5²+12²)      13']] },
  log: { title: 'log(25) and ln(10)', steps: [['ctrl', 'For log (base 10): press ctrl …', ''], ['10ˣ', '… then 10ˣ.', 'log(▮)'], ['2', '', 'log(2▮)'], ['5', '', 'log(25)'], ['enter', 'Press enter.', 'log(25)      1.39794'], ['ctrl', 'For ln: press ctrl …', ''], ['eˣ', '… then eˣ.', 'ln(▮)'], ['1', '', 'ln(1▮)'], ['0', '', 'ln(10)'], ['enter', 'Press enter.', 'ln(10)      2.30259']] },
  ncr: { title: 'Combinations: 10 C 3', steps: [['menu', 'Press menu.', '1 Actions\n2 Number\n…\n5 Probability'], ['5', 'Press 5 for Probability.', '1 Factorial (!)\n2 Permutations\n3 Combinations'], ['3', 'Press 3 for Combinations.', 'nCr(▮)'], ['1', '', 'nCr(1▮)'], ['0', '', 'nCr(10▮)'], [',', 'Press the comma key.', 'nCr(10,▮)'], ['3', '', 'nCr(10,3)'], ['enter', 'Press enter.', 'nCr(10,3)      120']] },
  sci: { title: 'Scientific notation: 3.2 × 10⁵', steps: [['3', 'Type 3.2.', '3▮'], ['.', '', '3.▮'], ['2', '', '3.2▮'], ['EE', 'Press EE (its own key) for “× 10 to the”.', '3.2E▮'], ['5', '', '3.2E5'], ['enter', 'Press enter.', '3.2E5      320000.']] },
  neg: { title: 'A negative number: −4²', steps: [['(', 'Use (−), the negative key, not the minus key. Press ( …', '(▮)'], ['(−)', '… then (−).', '(−▮)'], ['4', '', '(−4▮)'], [')', '', '(−4)'], ['x²', '', '(−4)²'], ['enter', 'Press enter. Without the parentheses, −4² = −16.', '(−4)²      16']] } };
IX.nspire = { subjects: ['act', 'algebra1', 'algebra2', 'geometry', 'precalc'],
  title: 'TI-Nspire CX II key presses', hint: 'Pick a skill and press Next (or tap the glowing key) to walk through the key presses one at a time.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(400, 900), ctx = cv._ctx; main.append(cv); cv.style.maxWidth = '420px';
    const S = { k: IX_NS_STEPS[o.skill] ? o.skill : 'trig', i: 0, t: 0 };
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    const txt = (t, x, y, px, col, al = 'center', font = 'system-ui, sans-serif', wt = '') => { ctx.save(); ctx.fillStyle = col; ctx.font = `${wt} ${px}px ${font}`; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); ctx.restore(); };
    function draw() {
      const Q = IX_NS_STEPS[S.k], st = Q.steps[Math.min(S.i, Q.steps.length - 1)], key = S.i < Q.steps.length ? (IX_NS_ALIAS[st[0]] || st[0]) : '';
      ctx.clearRect(0, 0, 400, 900);
      // the case: white face between yellow-orange rails
      ctx.save(); rr(14, 8, 372, 884, 26); ctx.fillStyle = '#f4a81f'; ctx.fill(); ctx.restore();
      ctx.save(); rr(34, 8, 332, 884, 14); ctx.fillStyle = '#fbfbf8'; ctx.fill(); ctx.strokeStyle = '#d9d6cc'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.strokeStyle = '#e2dfd6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(34, 482); ctx.lineTo(366, 482); ctx.stroke(); ctx.restore();
      txt('TI-nspire CX II', 200, 34, 22, '#444', 'center', 'Georgia, serif', 'italic'); txt('Texas Instruments', 200, 58, 12, '#333', 'center', 'Georgia, serif', 'bold');
      // the screen, with its tab bar and the angle mode
      ctx.save(); rr(56, 76, 288, 214, 4); ctx.fillStyle = '#222'; ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(62, 82, 276, 202); ctx.fillStyle = '#e6eef7'; ctx.fillRect(62, 82, 276, 20); ctx.restore();
      txt('1.1', 82, 92, 12, '#1d1d1b'); txt('*Doc', 196, 92, 12, '#1d1d1b'); ctx.save(); ctx.strokeStyle = '#2e7d4f'; ctx.lineWidth = 1.4; ctx.strokeRect(318, 86, 9, 13); ctx.fillStyle = '#2e7d4f'; ctx.fillRect(320, 90, 5, 8); ctx.restore(); const mode = S.k === 'trig' || S.k === 'invtrig' ? 'DEG' : 'RAD'; txt(mode, 298, 92, 11, '#1d1d1b');
      if (S.i === 0 && S.k === 'trig') { ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2; ctx.strokeRect(282, 84, 32, 16); ctx.restore(); }
      const upto = Math.min(S.i, Q.steps.length), cur = upto ? Q.steps[upto - 1][2] : '', isAns = (x) => /\S\s{4,}\S/.test(x) && !x.includes('\n');
      const hist = Q.steps.slice(0, upto).map((x) => x[2]).filter(isAns), entry = cur && !isAns(cur) && !cur.startsWith('TRIG:') && !cur.includes('\n') ? cur : '';
      const lastEntry = Q.steps.slice(0, upto).map((x) => x[2]).filter((x) => x && !isAns(x) && !x.startsWith('TRIG:') && !x.includes('\n')).pop() || '';
      const serif = '"Times New Roman", serif';
      hist.slice(-4).forEach((ln, j) => { const [a, b] = ln.split(/\s{4,}/); txt(a, 72, 122 + j * 34, 18, '#1d1d1b', 'left', serif); txt(b, 328, 139 + j * 34, 18, '#1d1d1b', 'right', serif); if (j < hist.slice(-4).length - 1 || entry || cur.startsWith('TRIG:')) { ctx.save(); ctx.strokeStyle = '#e4e4e4'; ctx.beginPath(); ctx.moveTo(66, 155 + j * 34); ctx.lineTo(334, 155 + j * 34); ctx.stroke(); ctx.restore(); } });
      const ey = cur.startsWith('TRIG:') ? 226 : 266; // the entry line (with the palette open, it sits just above it)
      ctx.save(); ctx.strokeStyle = '#9db7d6'; ctx.lineWidth = 1.2; ctx.strokeRect(66, ey - 14, 268, 28); ctx.restore();
      txt(cur.startsWith('TRIG:') ? lastEntry.replace('▮', '') + '▮' : entry, 72, ey, 18, '#1d1d1b', 'left', serif);
      if (cur.startsWith('TRIG:')) { const sel = cur.slice(5), names = [['sin', 'cos', 'tan', 'csc', 'sec', 'cot'], ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'csc⁻¹', 'sec⁻¹', 'cot⁻¹']];
        names.forEach((row, r) => row.forEach((n, c) => { const x = 64 + c * 45.3, y = 244 + r * 19; ctx.save(); ctx.fillStyle = n === sel ? '#2a6fc9' : '#ffffff'; ctx.fillRect(x, y, 45.3, 19); ctx.strokeStyle = '#cfcfcf'; ctx.strokeRect(x, y, 45.3, 19); ctx.restore();
          txt(n, x + 22.6, y + 10, 13, n === sel ? '#ffffff' : '#1d1d1b'); })); }
      else if (cur.includes('\n')) { const lines = cur.split('\n'), w = 150, h = lines.length * 22 + 10; ctx.save(); ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 6; ctx.fillRect(176, 110, w, h); ctx.restore();
        ctx.save(); ctx.strokeStyle = '#9a9a9a'; ctx.strokeRect(176, 110, w, h); ctx.fillStyle = '#2a6fc9'; ctx.fillRect(177, 116, w - 2, 22); ctx.restore(); lines.forEach((ln, k) => txt(ln, 184, 127 + k * 22, 13, k ? '#1d1d1b' : '#ffffff', 'left')); }
      // the touchpad
      ctx.save(); rr(128, 316, 144, 150, 22); ctx.fillStyle = '#f4a81f'; ctx.fill(); rr(134, 322, 132, 138, 18); ctx.fillStyle = '#eceae4'; ctx.fill(); rr(144, 332, 112, 118, 14); ctx.fillStyle = '#f7f6f2'; ctx.fill(); ctx.strokeStyle = '#c9c5bb'; ctx.stroke();
      rr(180, 370, 40, 40, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); ctx.restore();
      if (key === 'touchpad') { ctx.save(); rr(128, 316, 144, 150, 22); ctx.strokeStyle = '#b5482b'; ctx.lineWidth = 4; ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 14 + 8 * Math.sin(S.t / 3); ctx.stroke(); ctx.restore(); } txt('▴', 200, 342, 12, '#555'); txt('▾', 200, 440, 12, '#555'); txt('◂', 154, 391, 12, '#555'); txt('▸', 246, 391, 12, '#555'); txt('click', 200, 391, 11, '#777');
      IX_NS_KEYS.forEach(([lab, x, y, w, h, kind, above]) => { const on = lab === key, dark = kind === 'd', gray = kind === 'g';
        if (above) txt(above, x + w / 2, y - 8, 10, '#6b675e');
        ctx.save(); rr(x, y, w, h, 6); ctx.fillStyle = on ? '#ffb000' : dark ? '#2f3437' : gray ? '#8d8f91' : '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1.5; ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.strokeStyle = on ? '#b5482b' : dark ? '#1c1f21' : '#b9b6ae'; ctx.lineWidth = on ? 3 : 1; ctx.stroke();
        if (on) { ctx.shadowColor = '#ff6a00'; ctx.shadowBlur = 14 + 8 * Math.sin(S.t / 3); ctx.stroke(); } ctx.restore();
        const sz = h < 26 ? (lab.length > 1 ? 11 : 13) : lab.length > 4 ? 14 : lab.length > 2 ? 15 : 19;
        txt(lab, x + w / 2, y + h / 2 + 1, sz, on ? '#1d1d1b' : dark || gray ? '#ffffff' : '#1d1d1b', 'center', 'system-ui, sans-serif', dark && h > 26 ? 'bold' : ''); });
      txt('SCHOOL PROPERTY', 200, 880, 15, '#555', 'center', 'Georgia, serif', 'bold');
      const L = [{ h: Q.title }];
      Q.steps.forEach(([k, txt], j) => { if (j < S.i) L.push(`✓ ${k ? k : '·'} ${txt ? '— ' + txt : ''}`); });
      if (S.i < Q.steps.length) L.push({ note: `Step ${S.i + 1} of ${Q.steps.length}: ${st[1] || 'Press ' + st[0] + '.'}${st[0] ? '  (key: ' + st[0] + ')' : ''}`, good: true });
      else L.push({ note: 'Done! Press Start over to see it again.', good: true });
      ixRead(read, L);
    }
    const next = () => { const Q = IX_NS_STEPS[S.k]; if (S.i < Q.steps.length) S.i++; draw(); };
    ctl.append(ixSeg(Object.entries(IX_NS_STEPS).map(([k, Q]) => [k, Q.title]), S.k, (k) => { S.k = k; S.i = 0; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('◀ Back', () => { S.i = Math.max(0, S.i - 1); draw(); }), ixBtn('Next ▶', next), ixBtn('Start over', () => { S.i = 0; draw(); })));
    ixDrag(cv, (x, y) => { const Q = IX_NS_STEPS[S.k], st = Q.steps[S.i]; if (!st) return null; if (!st[0]) return 'go'; if (st[0] === 'touchpad') return x >= 128 && x <= 272 && y >= 316 && y <= 466 ? 'go' : null; const K = IX_NS_KEYS.find((k) => k[0] === (IX_NS_ALIAS[st[0]] || st[0])); return K && x >= K[1] - 6 && x <= K[1] + K[3] + 6 && y >= K[2] - 6 && y <= K[2] + K[4] + 6 ? 'go' : null; }, () => {}, () => next());
    const pulse = setInterval(() => { if (!cv.isConnected) { clearInterval(pulse); return; } S.t++; draw(); }, 120);
    draw();
  } };

// ---- The Pythagorean theorem with squares of unit tiles
IX.pythag = { subjects: ['geometry', 'algebra1'],
  title: 'The Pythagorean theorem (squares on the sides)', hint: 'Slide the legs a and b. The squares on the legs have a² and b² tiles; together they fill the square on the hypotenuse exactly.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 560), ctx = cv._ctx; main.append(cv);
    const S = { a: 3, b: 4 };
    function draw() {
      ctx.clearRect(0, 0, 640, 560); const { a, b } = S, c = Math.hypot(a, b);
      // in leg units: right angle at C = (0,0), B = (0,a) up, A = (b,0) right; squares go outward
      const c0 = [0, 0], A0 = [b, 0], B0 = [0, a], cen = [b / 3, a / 3];
      const sqPts = (p, q) => { const d = ixV.sub(q, p); let nrm = [-d[1], d[0]]; const m = ixV.mid(p, q); if ((m[0] + nrm[0] * 0.01 - cen[0]) ** 2 + (m[1] + nrm[1] * 0.01 - cen[1]) ** 2 < (m[0] - cen[0]) ** 2 + (m[1] - cen[1]) ** 2) nrm = ixV.mul(nrm, -1); return [p, q, ixV.add(q, nrm), ixV.add(p, nrm)]; };
      const sqs = [[B0, c0, IXC.blue, a], [c0, A0, IXC.green, b], [A0, B0, IXC.orange, Number.isInteger(+c.toFixed(9)) ? Math.round(c) : 0]].map(([p, q, col, n]) => ({ P: sqPts(p, q), col, n }));
      const all = sqs.flatMap((x) => x.P), xs = all.map((p) => p[0]), ys = all.map((p) => p[1]), U = Math.min(44, 560 / (Math.max(...xs) - Math.min(...xs)), 500 / (Math.max(...ys) - Math.min(...ys)));
      const ox = 320 - U * (Math.max(...xs) + Math.min(...xs)) / 2, oy = 280 + U * (Math.max(...ys) + Math.min(...ys)) / 2, T = (p) => [ox + p[0] * U, oy - p[1] * U];
      const mids = sqs.map(({ P, col, n }) => { const Q = P.map(T); ctx.save(); ctx.beginPath(); Q.forEach((x, i) => (i ? ctx.lineTo(...x) : ctx.moveTo(...x))); ctx.closePath(); ctx.fillStyle = col; ctx.globalAlpha = 0.2; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
        if (n && n <= 20) { ctx.clip(); ctx.globalAlpha = 0.45; ctx.lineWidth = 1; for (let i = 1; i < n; i++) { const f = i / n; [[Q[0], Q[1], Q[3], Q[2]], [Q[0], Q[3], Q[1], Q[2]]].forEach(([p0, p1, q0, q1]) => { ctx.beginPath(); ctx.moveTo(p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f); ctx.lineTo(q0[0] + (q1[0] - q0[0]) * f, q0[1] + (q1[1] - q0[1]) * f); ctx.stroke(); }); } }
        ctx.restore(); return [(Q[0][0] + Q[2][0]) / 2, (Q[0][1] + Q[2][1]) / 2]; });
      const A = T(A0), B = T(B0), C = T(c0); ixTri(ctx, [A, B, C], IXC.ink, 'rgba(255,255,255,.95)', 3); ixRightMark(ctx, C, A, B, IXC.ink, 12);
      const tag = (t, p, col) => { ctx.save(); ctx.font = `bold 20px ${IXF}`; const w = ctx.measureText(t).width + 12; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(p[0] - w / 2, p[1] - 14, w, 28); ctx.restore(); ixLabel(ctx, t, p[0], p[1], 20, 'center', col, 'middle'); };
      tag(`a² = ${a * a}`, mids[0], IXC.blue); tag(`b² = ${b * b}`, mids[1], IXC.green); tag(`c² = ${ixN(c * c, 2)}`, mids[2], IXC.orange);
      const whole = Number.isInteger(+c.toFixed(9));
      ixRead(read, [{ h: 'The squares' }, `a² + b² = ${a * a} + ${b * b} = ${a * a + b * b}`, `c² = ${a * a + b * b}, so c = ${whole ? Math.round(c) : `√${a * a + b * b} ≈ ${ixN(c, 2)}`}`,
        whole ? { note: `${a}, ${b}, ${Math.round(c)} is a Pythagorean triple: all three sides are whole numbers.`, good: true } : { note: 'Try 3 and 4, 5 and 12, 6 and 8, or 8 and 15 for whole-number hypotenuses.' },
        { note: 'The blue tiles plus the green tiles exactly fill the orange square: a² + b² = c².' }]);
    }
    ctl.append(ixSlider('leg a', 1, 12, 1, S.a, String, (v) => { S.a = v; draw(); }), ixSlider('leg b', 1, 12, 1, S.b, String, (v) => { S.b = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('3-4-5', () => { S.a = 3; S.b = 4; sync(); }), ixBtn('5-12-13', () => { S.a = 5; S.b = 12; sync(); }), ixBtn('8-15-17', () => { S.a = 8; S.b = 15; sync(); })));
    const sync = () => { const r = ctl.querySelectorAll('.ix-sl'); r[0].set(S.a); r[1].set(S.b); draw(); };
    draw();
  } };

// ---- Triangle inequality: do three sticks make a triangle?
IX.triIneq = { subjects: ['geometry'],
  title: 'The triangle inequality', hint: 'Slide the three side lengths. The two shorter sticks swing up from the ends of the longest one: they meet only if together they’re longer than it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 460), ctx = cv._ctx; main.append(cv);
    const S = { a: 5, b: 7, c: 9 };
    function draw() {
      ctx.clearRect(0, 0, 640, 460); const L = [['a', S.a, IXC.blue], ['b', S.b, IXC.green], ['c', S.c, IXC.red]].sort((x, y) => y[1] - x[1]), [lng, s1, s2] = L;
      const U = 520 / Math.max(lng[1], s1[1] + s2[1], 1), P = [60, 380], Q = [60 + lng[1] * U, 380];
      ixLine(ctx, P, Q, lng[2], 6); ixLabel(ctx, `${lng[0]} = ${lng[1]}`, (P[0] + Q[0]) / 2, 392, 19, 'center', lng[2]);
      const ok = s1[1] + s2[1] > lng[1], flat = s1[1] + s2[1] === lng[1];
      ctx.save(); ctx.setLineDash([5, 6]); ctx.lineWidth = 1.4; ctx.strokeStyle = s1[2]; ctx.beginPath(); ctx.arc(...P, s1[1] * U, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.strokeStyle = s2[2]; ctx.beginPath(); ctx.arc(...Q, s2[1] * U, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.restore();
      if (ok || flat) { const d = lng[1], x = (s1[1] ** 2 - s2[1] ** 2 + d * d) / (2 * d), y = Math.sqrt(Math.max(0, s1[1] ** 2 - x * x)), T = [P[0] + x * U, 380 - y * U];
        ixLine(ctx, P, T, s1[2], 6); ixLine(ctx, Q, T, s2[2], 6); ixDot(ctx, ...T, IXC.ink, 6); }
      else { ixLine(ctx, P, [P[0] + s1[1] * U * Math.cos(-2.2), 380 + s1[1] * U * Math.sin(-2.2)], s1[2], 6); ixLine(ctx, Q, [Q[0] + s2[1] * U * Math.cos(-0.94), 380 + s2[1] * U * Math.sin(-0.94)], s2[2], 6); }
      ixRead(read, [{ h: 'Check the two shorter sides' }, `${s1[0]} + ${s2[0]} = ${s1[1]} + ${s2[1]} = ${s1[1] + s2[1]}`, `${s1[1] + s2[1]} ${ok ? '>' : flat ? '=' : '<'} ${lng[1]} (the longest side, ${lng[0]})`,
        ok ? { note: 'Yes: they make a triangle.', good: true } : flat ? { note: 'Equal: the sticks lie flat on the long one. No triangle (it’s just a segment).', bad: true } : { note: 'No: the two shorter sides can’t reach each other.', bad: true },
        { h: 'Range for the third side' }, `If two sides are ${S.a} and ${S.b}: ${Math.abs(S.a - S.b)} < third side < ${S.a + S.b}`]);
    }
    ctl.append(...['a', 'b', 'c'].map((k) => ixSlider(`side ${k}`, 1, 15, 1, S[k], String, (v) => { S[k] = v; draw(); })));
    draw();
  } };

// ---- Polygon angle sums: split into triangles from one vertex; exterior angles add to 360°
IX.polygon = { subjects: ['geometry'],
  title: 'Interior and exterior angles of polygons', hint: 'Pick the number of sides. The diagonals from one corner split it into n − 2 triangles. Switch to exterior angles to see why they always add to 360°.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 560), ctx = cv._ctx; main.append(cv);
    const S = { n: 6, mode: 'int' }, names = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
    function draw() {
      ctx.clearRect(0, 0, 600, 560); const n = S.n, R = 200, cx = 300, cy = 290, P = Array.from({ length: n }, (_, i) => [cx + R * Math.cos(Math.PI / 2 + 2 * Math.PI * i / n + Math.PI / n), cy - R * Math.sin(Math.PI / 2 + 2 * Math.PI * i / n + Math.PI / n)]);
      const cols = [IXC.blue, IXC.green, IXC.orange, IXC.purple, IXC.red, '#2a9d8f', '#8d6e63', '#c2185b', '#5c6bc0', '#7cb342'];
      if (S.mode === 'int') { for (let i = 1; i < n - 1; i++) { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = cols[(i - 1) % cols.length]; ctx.beginPath(); ctx.moveTo(...P[0]); ctx.lineTo(...P[i]); ctx.lineTo(...P[i + 1]); ctx.closePath(); ctx.fill(); ctx.restore(); }
        for (let i = 2; i < n - 1; i++) ixLine(ctx, P[0], P[i], IXC.gray, 2, true); }
      ixTri(ctx, P, IXC.ink, null, 3);
      if (S.mode === 'ext') P.forEach((p, i) => { const q = P[(i + 1) % n], d = ixV.sub(q, P[i]), e = ixV.add(q, ixV.mul(d, 0.45)); ixLine(ctx, q, e, IXC.gray, 2, true); ixAngMark(ctx, q, e, P[(i + 2) % n], 26, cols[i % cols.length]); });
      P.forEach((p) => ixDot(ctx, ...p, IXC.ink, 5));
      const sum = (n - 2) * 180;
      ixRead(read, [{ h: `${n} sides: a ${names[n] || n + '-gon'}` }, S.mode === 'int' ? `${n - 2} triangles × 180° = (${n} − 2) · 180° = ${sum}°` : null,
        S.mode === 'int' ? `Each angle of a regular ${names[n] || n + '-gon'}: ${sum}° ÷ ${n} = ${ixN(sum / n, 2)}°` : `Each exterior angle (regular): 360° ÷ ${n} = ${ixN(360 / n, 2)}°`,
        S.mode === 'int' ? { note: 'From one corner you can draw n − 3 diagonals, which make n − 2 triangles, and each triangle has 180°.' } : { note: 'Walk around the polygon: at each corner you turn by the exterior angle. One full trip around is one full turn, 360°, no matter how many sides.' },
        `Interior + exterior at each corner = 180°`]);
    }
    ctl.append(ixSlider('sides n', 3, 12, 1, S.n, String, (v) => { S.n = v; draw(); }), ixSeg([['int', 'Interior angles'], ['ext', 'Exterior angles']], S.mode, (k) => { S.mode = k; draw(); }));
    draw();
  } };

// ---- Arc length and sector area
IX.sector = { subjects: ['geometry', 'precalc'],
  title: 'Arc length and sector area', hint: 'Drag the orange point to change the central angle, and slide the radius. The arc and the sector are the same fraction of the whole circle: θ/360.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { th: 120, r: 6, rad: false }, cx = 280, cy = 280;
    function draw() {
      ctx.clearRect(0, 0, 560, 560); const R = 220, t = S.th * Math.PI / 180;
      ctx.save(); ctx.strokeStyle = IXC.gray; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
      ctx.fillStyle = 'rgba(31,95,168,.18)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, 0, -t, true); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = IXC.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, R, 0, -t, true); ctx.stroke(); ctx.restore();
      const E = [cx + R * Math.cos(t), cy - R * Math.sin(t)]; ixLine(ctx, [cx, cy], [cx + R, cy], IXC.ink, 3); ixLine(ctx, [cx, cy], E, IXC.ink, 3);
      ixAngMark(ctx, [cx, cy], [cx + 60, cy], E, 40, IXC.purple, S.rad ? ixPi(+(S.th / 180).toFixed(4)) : `${S.th}°`); ixDot(ctx, ...E, IXC.orange, 9, true); ixLabel(ctx, `r = ${S.r}`, cx + R / 2, cy + 8, 19, 'center', IXC.ink);
      const f = S.th / 360, arc = 2 * Math.PI * S.r * f, area = Math.PI * S.r * S.r * f, fr = ixFrac(S.th / 360);
      ixRead(read, [{ h: 'Fraction of the circle' }, `θ/360 = ${S.th}/360 = ${fr}`,
        { h: 'Arc length (red)' }, `L = (θ/360) · 2πr = ${fr} · 2π(${S.r}) = ${ixFrac(f * 2 * S.r)}π ≈ ${ixN(arc, 2)}`, S.rad ? `In radians: L = rθ = ${S.r} · ${ixN(t, 3)} ≈ ${ixN(arc, 2)}` : null,
        { h: 'Sector area (blue)' }, `A = (θ/360) · πr² = ${fr} · π(${S.r * S.r}) = ${ixFrac(f * S.r * S.r)}π ≈ ${ixN(area, 2)}`, S.rad ? `In radians: A = ½r²θ ≈ ${ixN(area, 2)}` : null]);
    }
    ctl.append(ixSlider('radius r', 1, 12, 1, S.r, String, (v) => { S.r = v; draw(); }), ixCheck('Show radians too', S.rad, (v) => { S.rad = v; draw(); }),
      el('div', { class: 'ix-btns' }, ...[30, 45, 60, 90, 120, 180, 270].map((d) => ixBtn(d + '°', () => { S.th = d; draw(); }))));
    ixDrag(cv, (x, y) => { const t = S.th * Math.PI / 180; return Math.hypot(x - (cx + 220 * Math.cos(t)), y - (cy - 220 * Math.sin(t))) < 40 ? 'E' : null; }, (h, x, y) => { let d = Math.atan2(cy - y, x - cx) * 180 / Math.PI; if (d <= 0) d += 360; S.th = Math.max(5, Math.min(360, Math.round(d / 5) * 5)); draw(); });
    draw();
  } };

// ---- Compass-and-straightedge constructions, one step at a time
const IX_CONS = {
  perp: { title: 'Perpendicular bisector of AB', steps: ['Start with segment AB.', 'Put the compass point on A. Open it more than halfway to B and draw an arc above and below AB.', 'Keep the same opening. Put the point on B and draw arcs that cross the first ones.', 'The arcs cross at two points. Draw the line through them.', 'That line is the perpendicular bisector: it meets AB at its midpoint M, at a right angle.'] },
  angle: { title: 'Bisect an angle', steps: ['Start with angle A.', 'Put the compass point on A and draw an arc that crosses both sides (at P and Q).', 'From P, draw an arc inside the angle. Keep the same opening and draw one from Q. They cross at R.', 'Draw ray AR.', 'Ray AR bisects the angle: the two halves are congruent.'] },
  copy: { title: 'Copy an angle', steps: ['Start with angle A, and a ray from point D where the copy goes.', 'With the point on A, draw an arc crossing both sides (P and Q). Same opening: draw an arc from D crossing the ray at E.', 'Set the compass to the distance from P to Q.', 'With the point on E, draw an arc that crosses the first arc at F.', 'Draw ray DF. Angle D is congruent to angle A.'] } };
IX.construct = { subjects: ['geometry'],
  title: 'Constructions with a compass and straightedge', hint: 'Pick a construction and press Next to see each step.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 480), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_CONS[o.c] ? o.c : 'perp', i: 0 };
    const arc = (c, r, a0, a1, col = IXC.orange) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(c[0], c[1], r, -a1, -a0); ctx.stroke(); ctx.restore(); };
    const compass = (c, p) => { ctx.save(); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 3; const top = [(c[0] + p[0]) / 2, Math.min(c[1], p[1]) - 70]; ctx.beginPath(); ctx.moveTo(...c); ctx.lineTo(...top); ctx.lineTo(...p); ctx.stroke(); ctx.restore(); ixDot(ctx, ...top, '#555', 5); };
    const lab = (p, t, dx = 10, dy = -26) => ixLabel(ctx, t, p[0] + dx, p[1] + dy, 20, 'left', IXC.ink);
    function draw() {
      ctx.clearRect(0, 0, 640, 480); const i = S.i;
      if (S.k === 'perp') { const A = [180, 260], B = [460, 260], r = 190, h = Math.sqrt(r * r - 140 * 140), T = [320, 260 - h], U = [320, 260 + h];
        ixLine(ctx, A, B, IXC.ink, 3); ixDot(ctx, ...A, IXC.ink, 6); ixDot(ctx, ...B, IXC.ink, 6); lab(A, 'A', -24, 6); lab(B, 'B', 10, 6);
        if (i >= 1) { arc(A, r, 0.45, 0.9); arc(A, r, -0.9, -0.45); if (i === 1) compass(A, [A[0] + r * Math.cos(0.7), A[1] - r * Math.sin(0.7)]); }
        if (i >= 2) { arc(B, r, Math.PI - 0.9, Math.PI - 0.45); arc(B, r, Math.PI + 0.45, Math.PI + 0.9); if (i === 2) compass(B, [B[0] + r * Math.cos(Math.PI - 0.7), B[1] - r * Math.sin(Math.PI - 0.7)]); ixDot(ctx, ...T, IXC.red, 5); ixDot(ctx, ...U, IXC.red, 5); }
        if (i >= 3) ixLine(ctx, [320, 30], [320, 470], IXC.blue, 3);
        if (i >= 4) { ixDot(ctx, 320, 260, IXC.blue, 6); lab([320, 260], 'M', 8, 4); ixRightMark(ctx, [320, 260], B, T, IXC.blue, 14); ixTicks(ctx, A, [320, 260], 1, IXC.blue); ixTicks(ctx, [320, 260], B, 1, IXC.blue); } }
      if (S.k === 'angle' || S.k === 'copy') { const A = [90, 380], a1 = 0, a2 = 0.85, r1 = 170, P = [A[0] + r1 * Math.cos(a1), A[1] - r1 * Math.sin(a1)], Q = [A[0] + r1 * Math.cos(a2), A[1] - r1 * Math.sin(a2)];
        ixLine(ctx, A, [A[0] + 290, A[1]], IXC.ink, 3); ixLine(ctx, A, [A[0] + 290 * Math.cos(a2), A[1] - 290 * Math.sin(a2)], IXC.ink, 3); ixDot(ctx, ...A, IXC.ink, 6); lab(A, 'A', -24, 6);
        if (S.k === 'angle') {
          if (i >= 1) { arc(A, r1, -0.15, 1.0); ixDot(ctx, ...P, IXC.red, 5); ixDot(ctx, ...Q, IXC.red, 5); lab(P, 'P', 6, 4); lab(Q, 'Q', -6, -30); if (i === 1) compass(A, Q); }
          const r2 = 120, mid = a2 / 2, d = ixV.dist(P, Q) / 2, Rr = [A[0] + (r1 * Math.cos(a2 / 2) + Math.sqrt(r2 * r2 - d * d)) * Math.cos(mid), A[1] - (r1 * Math.cos(a2 / 2) + Math.sqrt(r2 * r2 - d * d)) * Math.sin(mid)];
          if (i >= 2) { const ang = (c) => Math.atan2(-(Rr[1] - c[1]), Rr[0] - c[0]); arc(P, r2, ang(P) - 0.25, ang(P) + 0.25); arc(Q, r2, ang(Q) - 0.25, ang(Q) + 0.25); ixDot(ctx, ...Rr, IXC.red, 5); lab(Rr, 'R'); if (i === 2) compass(Q, Rr); }
          if (i >= 3) ixLine(ctx, A, [A[0] + 300 * Math.cos(mid), A[1] - 300 * Math.sin(mid)], IXC.blue, 3);
          if (i >= 4) { ixAngMark(ctx, A, P, Rr, 60, IXC.blue); ixAngMark(ctx, A, Rr, Q, 60, IXC.blue); }
        } else {
          const D = [360, 380], E = [D[0] + r1, D[1]], F = [D[0] + r1 * Math.cos(a2), D[1] - r1 * Math.sin(a2)];
          ixLine(ctx, D, [D[0] + 260, D[1]], IXC.ink, 3); ixDot(ctx, ...D, IXC.ink, 6); lab(D, 'D', -24, 6);
          if (i >= 1) { arc(A, r1, -0.15, 1.0); arc(D, r1, -0.15, 1.0); ixDot(ctx, ...P, IXC.red, 5); ixDot(ctx, ...Q, IXC.red, 5); ixDot(ctx, ...E, IXC.red, 5); lab(P, 'P', 6, 4); lab(Q, 'Q', -6, -30); lab(E, 'E', 6, 4); }
          if (i === 2) { compass(P, Q); ixLine(ctx, P, Q, IXC.purple, 2, true); }
          if (i >= 3) { const d = ixV.dist(P, Q); arc(E, d, Math.PI / 2 + 0.1, Math.PI / 2 + 0.9); ixDot(ctx, ...F, IXC.red, 5); lab(F, 'F'); if (i === 3) compass(E, F); }
          if (i >= 4) { ixLine(ctx, D, [D[0] + 260 * Math.cos(a2), D[1] - 260 * Math.sin(a2)], IXC.blue, 3); ixAngMark(ctx, A, P, Q, 50, IXC.blue); ixAngMark(ctx, D, E, F, 50, IXC.blue); }
        } }
      const Q = IX_CONS[S.k]; ixRead(read, [{ h: Q.title }, ...Q.steps.slice(0, i).map((t, k) => `✓ ${k + 1}. ${t}`), { note: `Step ${i + 1} of ${Q.steps.length}: ${Q.steps[i]}`, good: i === Q.steps.length - 1 }]);
    }
    ctl.append(ixSeg(Object.entries(IX_CONS).map(([k, Q]) => [k, Q.title]), S.k, (k) => { S.k = k; S.i = 0; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('◀ Back', () => { S.i = Math.max(0, S.i - 1); draw(); }), ixBtn('Next ▶', () => { S.i = Math.min(IX_CONS[S.k].steps.length - 1, S.i + 1); draw(); }), ixBtn('Start over', () => { S.i = 0; draw(); })));
    draw();
  } };

// ---- Geometric probability: random darts and areas
IX.dartProb = { subjects: ['geometry', 'act'],
  title: 'Geometric probability (darts and areas)', hint: 'Pick a target and throw darts. The share that land in the blue region gets close to its area divided by the whole board’s area.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: 'circle', darts: [], r: mulberry32((Date.now() % 1e9) | 0) }, X0 = 40, W = 480, side = 10;
    const T = { circle: { name: 'Circle in a square', inside: (x, y) => (x - 5) ** 2 + (y - 5) ** 2 <= 25, area: 25 * Math.PI, exact: '25π/100 = π/4', draw: () => { ctx.beginPath(); ctx.arc(X0 + W / 2, X0 + W / 2, W / 2, 0, 2 * Math.PI); } },
      ring: { name: 'Bullseye ring', inside: (x, y) => { const d = Math.hypot(x - 5, y - 5); return d >= 2 && d <= 4; }, area: 12 * Math.PI, exact: '(16π − 4π)/100 = 12π/100', draw: () => { ctx.beginPath(); ctx.arc(X0 + W / 2, X0 + W / 2, W * 0.4, 0, 2 * Math.PI); ctx.arc(X0 + W / 2, X0 + W / 2, W * 0.2, 0, 2 * Math.PI, true); } },
      tri: { name: 'Triangle', inside: (x, y) => y <= 10 - x, area: 50, exact: '50/100 = 1/2', draw: () => { ctx.beginPath(); ctx.moveTo(X0, X0); ctx.lineTo(X0 + W, X0 + W); ctx.lineTo(X0, X0 + W); ctx.closePath(); } },
      strip: { name: 'Middle strip', inside: (x) => x >= 3 && x <= 5, area: 20, exact: '20/100 = 1/5', draw: () => { ctx.beginPath(); ctx.rect(X0 + 0.3 * W, X0, 0.2 * W, W); } } };
    // y measured up from the bottom for the triangle; canvas y grows down
    const P = (x, y) => [X0 + x / side * W, X0 + W - y / side * W];
    function draw() {
      const t = T[S.k]; ctx.clearRect(0, 0, 560, 560); ctx.save(); ctx.fillStyle = '#fbfaf6'; ctx.fillRect(X0, X0, W, W); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.5; ctx.strokeRect(X0, X0, W, W);
      ctx.fillStyle = 'rgba(31,95,168,.22)'; t.draw(); ctx.fill('evenodd'); ctx.strokeStyle = IXC.blue; ctx.stroke(); ctx.restore();
      S.darts.slice(-3000).forEach(([x, y, hit]) => { const p = P(x, y); ctx.fillStyle = hit ? IXC.green : IXC.red; ctx.fillRect(p[0] - 2, p[1] - 2, 4, 4); });
      const n = S.darts.length, h = S.darts.filter((d) => d[2]).length, th = t.area / (side * side);
      ixRead(read, [{ h: t.name }, `Board: 10 × 10 = 100 square units; blue area = ${ixN(t.area, 2)}`, `Theory: ${t.exact} ≈ ${ixN(th * 100, 1)}%`, { h: 'Darts' }, `${n} thrown, ${h} in the blue region`, n ? `Experimental: ${h}/${n} ≈ ${ixN(100 * h / n, 1)}%` : null,
        n >= 500 ? { note: 'With lots of darts, the experimental probability gets close to the area ratio.', good: true } : { note: 'Throw more darts to see the share settle down.' },
        S.k === 'circle' && n >= 200 ? `Estimate of π: 4 × ${h}/${n} ≈ ${ixN(4 * h / n, 3)}` : null]);
    }
    const throwN = (m) => { const t = T[S.k]; for (let i = 0; i < m; i++) { const x = S.r() * side, y = S.r() * side; S.darts.push([x, y, t.inside(x, y)]); } draw(); };
    ctl.append(ixSeg(Object.entries(T).map(([k, t]) => [k, t.name]), S.k, (k) => { S.k = k; S.darts = []; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Throw 1', () => throwN(1)), ixBtn('Throw 10', () => throwN(10)), ixBtn('Throw 100', () => throwN(100)), ixBtn('Throw 1,000', () => throwN(1000)), ixBtn('Clear', () => { S.darts = []; draw(); })));
    draw();
  } };

// ---- Sum and difference formulas on the unit circle
IX.sumDiff = { subjects: ['precalc'],
  title: 'Sum and difference formulas', hint: 'Drag A (blue) and B (green) around the circle. The red point is at A + B (or A − B). Its coordinates match the formulas.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { A: 45, B: 30, op: '+' }, V = ixView(cv, [-1.3, 1.3], [-1.3, 1.3], 20), R = (deg) => [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)];
    const EX = { 0: ['1', '0'], 30: ['√3/2', '1/2'], 45: ['√2/2', '√2/2'], 60: ['1/2', '√3/2'], 90: ['0', '1'], 120: ['−1/2', '√3/2'], 135: ['−√2/2', '√2/2'], 150: ['−√3/2', '1/2'], 180: ['−1', '0'] };
    const ex = (d) => { d = ((d % 360) + 360) % 360; if (EX[d]) return EX[d]; if (EX[360 - d]) return [EX[360 - d][0], EX[360 - d][1] === '0' ? '0' : '−' + EX[360 - d][1].replace('−', '')].map((x) => x.replace('−−', '')); return null; };
    function draw() {
      ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: 0.5, lab: 1 });
      ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), V.sx, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
      const C = S.op === '+' ? S.A + S.B : S.A - S.B, pts = [[S.A, IXC.blue, 'A'], [S.B, IXC.green, 'B'], [C, IXC.red, S.op === '+' ? 'A + B' : 'A − B']];
      pts.forEach(([d, col, n]) => { const p = R(d); ixLine(ctx, [V.X(0), V.Y(0)], [V.X(p[0]), V.Y(p[1])], col, 3); ixDot(ctx, V.X(p[0]), V.Y(p[1]), col, n.length > 1 ? 7 : 9, n.length === 1); ixLabel(ctx, n, V.X(p[0] * 1.13), V.Y(p[1] * 1.13), 19, 'center', col, 'middle'); });
      const a = S.A * Math.PI / 180, b = S.B * Math.PI / 180, sg = S.op === '+' ? 1 : -1, d4 = (v) => ixN(v, 4);
      const eA = ex(S.A), eB = ex(S.B), eC = ex(C);
      ixRead(read, [{ h: `A = ${S.A}°, B = ${S.B}°, A ${S.op === '+' ? '+' : '−'} B = ${C}°` },
        { h: `sin(A ${S.op === '+' ? '+' : '−'} B) = sin A cos B ${S.op === '+' ? '+' : '−'} cos A sin B` }, eA && eB ? `= (${eA[1]})(${eB[0]}) ${S.op === '+' ? '+' : '−'} (${eA[0]})(${eB[1]})` : `= (${d4(Math.sin(a))})(${d4(Math.cos(b))}) ${S.op === '+' ? '+' : '−'} (${d4(Math.cos(a))})(${d4(Math.sin(b))})`, `≈ ${d4(Math.sin(a) * Math.cos(b) + sg * Math.cos(a) * Math.sin(b))}${eC ? ' = ' + eC[1] : ''}`,
        { h: `cos(A ${S.op === '+' ? '+' : '−'} B) = cos A cos B ${S.op === '+' ? '−' : '+'} sin A sin B` }, `≈ ${d4(Math.cos(a) * Math.cos(b) - sg * Math.sin(a) * Math.sin(b))}${eC ? ' = ' + eC[0] : ''}`,
        { note: `Check: the red point is (${d4(Math.cos(a + sg * b))}, ${d4(Math.sin(a + sg * b))}). Notice sin(A + B) is not sin A + sin B.` }]);
    }
    ctl.append(ixSeg([['+', 'A + B'], ['-', 'A − B']], S.op, (k) => { S.op = k; draw(); }), el('div', { class: 'small' }, 'Angles snap to 15°.'),
      el('div', { class: 'ix-btns' }, ixBtn('75° = 45° + 30°', () => { Object.assign(S, { A: 45, B: 30, op: '+' }); ctl.querySelector('.ix-seg').set('+'); draw(); }), ixBtn('15° = 45° − 30°', () => { Object.assign(S, { A: 45, B: 30, op: '-' }); ctl.querySelector('.ix-seg').set('-'); draw(); }), ixBtn('105° = 60° + 45°', () => { Object.assign(S, { A: 60, B: 45, op: '+' }); ctl.querySelector('.ix-seg').set('+'); draw(); })));
    ixDrag(cv, (x, y) => ixPick({ A: [V.X(R(S.A)[0]), V.Y(R(S.A)[1])], B: [V.X(R(S.B)[0]), V.Y(R(S.B)[1])] }, x, y, 36), (k, x, y) => { let d = Math.atan2(V.iy(y), V.ix(x)) * 180 / Math.PI; if (d < 0) d += 360; S[k] = Math.round(d / 15) * 15 % 360; draw(); });
    draw();
  } };

// ---- Inverse trig: why the answers come from a restricted part of the graph
IX.invTrig = { subjects: ['precalc'],
  title: 'Inverse trig functions and their ranges', hint: 'Pick sin⁻¹, cos⁻¹, or tan⁻¹. Only the bold piece of the graph is used, so each input gets one answer. Slide x to find the angle.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 560), ctx = cv._ctx; main.append(cv);
    const S = { f: 'sin', x: 0.5, refl: true };
    const F = { sin: { f: Math.sin, inv: Math.asin, lo: -Math.PI / 2, hi: Math.PI / 2, dom: [-1, 1], rng: '−π/2 ≤ y ≤ π/2', rngD: '−90° to 90°' }, cos: { f: Math.cos, inv: Math.acos, lo: 0, hi: Math.PI, dom: [-1, 1], rng: '0 ≤ y ≤ π', rngD: '0° to 180°' }, tan: { f: Math.tan, inv: Math.atan, lo: -Math.PI / 2 + 1e-6, hi: Math.PI / 2 - 1e-6, dom: [-4, 4], rng: '−π/2 < y < π/2', rngD: '−90° to 90° (not including the ends)' } };
    function draw() {
      ctx.clearRect(0, 0, 620, 560); const D = F[S.f], V = ixView(cv, [-4, 4], [-4, 4], 24); ixGrid(ctx, V, { step: Math.PI / 4, lab: 1, piX: 0.5 });
      ixCurve(ctx, V, D.f, '#c9c4b8', { w: 2 }); ixCurve(ctx, V, D.f, IXC.blue, { w: 4.5, a: D.lo, b: D.hi });
      if (S.refl) { ixLine(ctx, [V.X(-4), V.Y(-4)], [V.X(4), V.Y(4)], IXC.gray, 1.4, true); ixCurve(ctx, V, (x) => (x >= D.dom[0] && x <= D.dom[1] ? D.inv(x) : NaN), IXC.red, { w: 4, a: D.dom[0], b: D.dom[1] }); }
      const y = D.inv(S.x); ixDot(ctx, V.X(y), V.Y(S.x), IXC.blue, 7); if (S.refl) ixDot(ctx, V.X(S.x), V.Y(y), IXC.red, 7);
      ixLine(ctx, [V.X(-4), V.Y(S.x)], [V.X(y), V.Y(S.x)], IXC.green, 1.8, true);
      const deg = y * 180 / Math.PI, exact = { '30': 'π/6', '-30': '−π/6', '45': 'π/4', '-45': '−π/4', '60': 'π/3', '-60': '−π/3', '90': 'π/2', '-90': '−π/2', '0': '0', '120': '2π/3', '135': '3π/4', '150': '5π/6', '180': 'π' }[String(Math.round(deg))];
      ixRead(read, [{ h: `${S.f}⁻¹(${ixN(S.x, 3)})` }, `= ${ixN(y, 4)} radians ≈ ${ixN(deg, 2)}°${exact && Math.abs(deg - Math.round(deg)) < 0.05 ? ' = ' + exact : ''}`,
        { h: 'Why only one answer?' }, `${S.f} repeats, so many angles have ${S.f} = ${ixN(S.x, 3)}. ${S.f}⁻¹ only uses the bold piece: ${D.rngD}.`, `Range of ${S.f}⁻¹: ${D.rng}`, `Domain of ${S.f}⁻¹: ${S.f === 'tan' ? 'all real numbers' : '−1 ≤ x ≤ 1'}`,
        S.refl ? { note: 'Red: the graph of the inverse, the bold blue piece reflected over the line y = x.' } : null]);
    }
    const xs = ixSlider('x', -1, 1, 0.05, S.x, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    ctl.append(ixSeg([['sin', 'sin⁻¹'], ['cos', 'cos⁻¹'], ['tan', 'tan⁻¹']], S.f, (k) => { S.f = k; const d = F[k].dom; xs.querySelector('input').min = d[0]; xs.querySelector('input').max = d[1]; xs.querySelector('input').step = k === 'tan' ? 0.1 : 0.05; draw(); }), xs,
      ixCheck('Show the inverse graph (reflected over y = x)', S.refl, (v) => { S.refl = v; draw(); }),
      el('div', { class: 'ix-btns' }, ...[['½', 0.5], ['√2/2', Math.SQRT1_2], ['√3/2', Math.sqrt(3) / 2], ['−½', -0.5], ['1', 1]].map(([t, v]) => ixBtn(t, () => { S.x = v; xs.set(v); draw(); }))));
    draw();
  } };

// ---- Complex numbers: rectangular and trig form, multiplying, and nth roots
IX.complex = { subjects: ['precalc'],
  title: 'Complex numbers, De Moivre, and roots', hint: 'Drag z (blue) and w (green). Multiplying multiplies the lengths and adds the angles. Switch to roots to see the n roots spaced evenly around a circle.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 580), ctx = cv._ctx; main.append(cv);
    const S = { z: [2, 1], w: [1, 1], mode: ['power', 'roots'].includes(o.mode) ? o.mode : 'mult', n: 3 }, V = ixView(cv, [-6, 6], [-6, 6], 22);
    const mod = (p) => Math.hypot(p[0], p[1]), arg = (p) => { let a = Math.atan2(p[1], p[0]) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
    const rect = (p) => `${ixN(p[0], 3)} ${p[1] < 0 ? '−' : '+'} ${ixN(Math.abs(p[1]), 3)}i`;
    const trig = (p) => `${ixN(mod(p), 3)}(cos ${ixN(arg(p), 1)}° + i sin ${ixN(arg(p), 1)}°)`;
    const dot = (p, col, lab, big) => { ixLine(ctx, [V.X(0), V.Y(0)], [V.X(p[0]), V.Y(p[1])], col, 2.6); ixDot(ctx, V.X(p[0]), V.Y(p[1]), col, big ? 8 : 6, big); ixLabel(ctx, lab, V.X(p[0]) + 10, V.Y(p[1]) - 26, 19, 'left', col); };
    function draw() {
      ctx.clearRect(0, 0, 580, 580); ixGrid(ctx, V, { step: 1, lab: 2 }); ixLabel(ctx, 'imaginary', V.X(0) + 6, 6, 13, 'left', IXC.axis); ixLabel(ctx, 'real', 566, V.Y(0) - 18, 13, 'right', IXC.axis);
      const L = [{ h: 'z' }, `z = ${rect(S.z)}`, `= ${trig(S.z)}`];
      if (S.mode === 'mult') { const p = [S.z[0] * S.w[0] - S.z[1] * S.w[1], S.z[0] * S.w[1] + S.z[1] * S.w[0]];
        dot(S.z, IXC.blue, 'z', true); dot(S.w, IXC.green, 'w', true); dot(p, IXC.red, 'zw');
        L.push(`w = ${rect(S.w)} = ${trig(S.w)}`, { h: 'zw' }, `zw = ${rect(p)}`, `length: ${ixN(mod(S.z), 3)} · ${ixN(mod(S.w), 3)} = ${ixN(mod(p), 3)}`, `angle: ${ixN(arg(S.z), 1)}° + ${ixN(arg(S.w), 1)}° = ${ixN((arg(S.z) + arg(S.w)) % 360, 1)}°`, { note: 'Multiply the lengths, add the angles.' });
      } else if (S.mode === 'power') { dot(S.z, IXC.blue, 'z', true); let p = [1, 0]; const cols = [IXC.green, IXC.orange, IXC.red, IXC.purple];
        for (let k = 1; k <= S.n; k++) { p = [p[0] * S.z[0] - p[1] * S.z[1], p[0] * S.z[1] + p[1] * S.z[0]]; if (k > 1 && mod(p) < 9) dot(p, cols[(k - 2) % 4], `z${'⁰¹²³⁴⁵⁶⁷⁸'[k]}`); }
        L.push({ h: `De Moivre: z${'⁰¹²³⁴⁵⁶⁷⁸'[S.n]}` }, `= ${ixN(mod(S.z), 3)}${'⁰¹²³⁴⁵⁶⁷⁸'[S.n]}(cos ${S.n}·${ixN(arg(S.z), 1)}° + i sin ${S.n}·${ixN(arg(S.z), 1)}°)`, `= ${ixN(mod(p), 3)}(cos ${ixN((S.n * arg(S.z)) % 360, 1)}° + i sin ${ixN((S.n * arg(S.z)) % 360, 1)}°)`, `= ${rect(p)}`);
      } else { const r = mod(S.z) ** (1 / S.n), roots = Array.from({ length: S.n }, (_, k) => { const t = (arg(S.z) + 360 * k) / S.n * Math.PI / 180; return [r * Math.cos(t), r * Math.sin(t)]; });
        ctx.save(); ctx.strokeStyle = IXC.gray; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), r * V.sx, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = IXC.purple; ctx.lineWidth = 2; ctx.beginPath(); roots.forEach((p, k) => (k ? ctx.lineTo(V.X(p[0]), V.Y(p[1])) : ctx.moveTo(V.X(p[0]), V.Y(p[1])))); ctx.closePath(); if (S.n > 2) ctx.stroke(); ctx.restore();
        dot(S.z, IXC.blue, 'z', true); roots.forEach((p, k) => dot(p, IXC.red, `w${'₀₁₂₃₄₅₆₇'[k]}`));
        L.push({ h: `The ${S.n} ${S.n === 2 ? 'square' : S.n === 3 ? 'cube' : S.n + 'th'} roots of z` }, `length: ${ixN(mod(S.z), 3)}^(1/${S.n}) = ${ixN(r, 3)}`, `angles: (${ixN(arg(S.z), 1)}° + 360°k)/${S.n}, k = 0 … ${S.n - 1}`, ...roots.map((p, k) => `w${'₀₁₂₃₄₅₆₇'[k]} = ${rect(p)}`), { note: `They’re evenly spaced, 360°/${S.n} = ${ixN(360 / S.n, 1)}° apart, on a circle.` }); }
      ixRead(read, L);
    }
    const nS = ixSlider('n', 2, 8, 1, S.n, String, (v) => { S.n = v; draw(); });
    ctl.append(ixSeg([['mult', 'Multiply z · w'], ['power', 'Powers (De Moivre)'], ['roots', 'nth roots']], S.mode, (k) => { S.mode = k; nS.style.display = k === 'mult' ? 'none' : ''; draw(); }), nS);
    nS.style.display = S.mode === 'mult' ? 'none' : '';
    ixDrag(cv, (x, y) => ixPick(S.mode === 'mult' ? { z: [V.X(S.z[0]), V.Y(S.z[1])], w: [V.X(S.w[0]), V.Y(S.w[1])] } : { z: [V.X(S.z[0]), V.Y(S.z[1])] }, x, y, 34), (k, x, y) => { S[k] = [Math.max(-6, Math.min(6, Math.round(V.ix(x) * 2) / 2)), Math.max(-6, Math.min(6, Math.round(V.iy(y) * 2) / 2))]; draw(); });
    draw();
  } };

// ---- Parametric equations (with projectile motion)
const IX_PARAM = {
  line: { name: 'Line', x: (t, a, b) => 1 + a * t, y: (t, a, b) => 2 + b * t, xs: 'x = 1 + a·t', ys: 'y = 2 + b·t', t: [-3, 3], ab: [2, 1], rng: [-8, 8], elim: (a, b) => `t = (x − 1)/${ixN(a)}, so y = 2 + ${ixFrac(b / a)}(x − 1)` },
  ellipse: { name: 'Ellipse', x: (t, a, b) => a * Math.cos(t), y: (t, a, b) => b * Math.sin(t), xs: 'x = a cos t', ys: 'y = b sin t', t: [0, 2 * Math.PI], ab: [5, 3], rng: [-8, 8], elim: (a, b) => `(x/${ixN(a)})² + (y/${ixN(b)})² = cos²t + sin²t = 1` },
  parabola: { name: 'Parabola', x: (t, a, b) => t, y: (t, a, b) => a * t * t + b, xs: 'x = t', ys: 'y = a·t² + b', t: [-3, 3], ab: [1, -2], rng: [-8, 8], elim: (a, b) => `t = x, so y = ${ixN(a)}x² ${b < 0 ? '−' : '+'} ${ixN(Math.abs(b))}` },
  proj: { name: 'Projectile', x: (t, a, b) => a * Math.cos(b * Math.PI / 180) * t, y: (t, a, b) => 6 + a * Math.sin(b * Math.PI / 180) * t - 16 * t * t, xs: 'x = (v cos θ)t', ys: 'y = 6 + (v sin θ)t − 16t²', t: [0, 6], ab: [60, 40], rng: [0, 130], elim: null },
  cycloid: { name: 'Cycloid', x: (t, a) => a * (t - Math.sin(t)), y: (t, a) => a * (1 - Math.cos(t)), xs: 'x = a(t − sin t)', ys: 'y = a(1 − cos t)', t: [0, 4 * Math.PI], ab: [1.2, 0], rng: [-1, 16], elim: null } };
IX.parametric = { subjects: ['precalc'],
  title: 'Parametric equations', hint: 'Pick a curve and slide a and b. Press ▶ to watch the point move as t increases. The arrows show the direction.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_PARAM[o.c] ? o.c : 'proj', t: null, play: null }, sl = {};
    function draw() {
      const P = IX_PARAM[S.k], [a, b] = [S.a, S.b], T = P.t, end = S.t == null ? T[1] : S.t, proj = S.k === 'proj';
      let tEnd = end; if (proj) { const vy = a * Math.sin(b * Math.PI / 180), land = (vy + Math.sqrt(vy * vy + 4 * 16 * 6)) / 32; tEnd = Math.min(end, land); S.land = land; }
      const V = proj ? ixView(cv, [0, Math.max(130, a * a / 32 + 10)], [0, Math.max(60, a * a / 64 + 12)], 36) : ixView(cv, P.rng, P.rng, 24);
      ctx.clearRect(0, 0, 600, 560); proj ? ixGrid2(ctx, V, 10, 10, 20, 10) : ixGrid(ctx, V, { step: 1, lab: 2 });
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3.2; ctx.beginPath(); const N = 600; for (let j = 0; j <= N; j++) { const t = T[0] + (tEnd - T[0]) * j / N, x = V.X(P.x(t, a, b)), y = V.Y(P.y(t, a, b)); if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
      for (let j = 1; j <= 6; j++) { const t = T[0] + (tEnd - T[0]) * j / 7, p = [V.X(P.x(t, a, b)), V.Y(P.y(t, a, b))], q = [V.X(P.x(t + 0.01, a, b)), V.Y(P.y(t + 0.01, a, b))], ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
        ctx.save(); ctx.fillStyle = IXC.blue; ctx.translate(...p); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.fill(); ctx.restore(); }
      const pt = [P.x(tEnd, a, b), P.y(tEnd, a, b)]; ixDot(ctx, V.X(pt[0]), V.Y(pt[1]), IXC.red, 9, true);
      const L = [{ h: P.name }, P.xs.replace('a', ixN(a)).replace('b', ixN(b)), P.ys.replace('a', ixN(a)).replace('b', ixN(b)), `t = ${ixN(tEnd, 2)}: (${ixN(pt[0], 2)}, ${ixN(pt[1], 2)})`];
      if (proj) { const vy = a * Math.sin(b * Math.PI / 180), tt = vy / 32; L.length = 1; L.push(`x = (${a} cos ${b}°)t`, `y = 6 + (${a} sin ${b}°)t − 16t²`, `t = ${ixN(tEnd, 2)} s: (${ixN(pt[0], 1)} ft, ${ixN(pt[1], 1)} ft)`, { h: 'The flight' }, `highest point at t = ${ixN(tt, 2)} s: ${ixN(6 + vy * tt - 16 * tt * tt, 1)} ft`, `lands at t ≈ ${ixN(S.land, 2)} s, ${ixN(P.x(S.land, a, b), 1)} ft away`, { note: 'Launched from 6 ft up; gravity pulls down 16t² feet. Try 45° for the longest throw (from the ground).' }); }
      else if (P.elim) L.push({ h: 'Eliminate t' }, P.elim(a, b));
      ixRead(read, L);
    }
    const mk = () => { ctl.querySelectorAll('.ix-sl').forEach((n) => n.remove()); const P = IX_PARAM[S.k]; [S.a, S.b] = P.ab; S.t = null;
      const proj = S.k === 'proj'; sl.a = ixSlider(proj ? 'speed v (ft/s)' : 'a', proj ? 20 : S.k === 'cycloid' ? 0.5 : -5, proj ? 90 : 5, proj ? 5 : 0.5, S.a, (v) => ixN(v), (v) => { S.a = v; draw(); });
      sl.b = ixSlider(proj ? 'angle θ' : 'b', proj ? 5 : -5, proj ? 85 : 5, proj ? 5 : 0.5, S.b, (v) => (proj ? v + '°' : ixN(v)), (v) => { S.b = v; draw(); });
      ctl.insertBefore(sl.a, btns); if (S.k !== 'cycloid') ctl.insertBefore(sl.b, btns); };
    const stop = () => { if (S.play) { clearInterval(S.play); S.play = null; } };
    const btns = el('div', { class: 'ix-btns' }, ixBtn('▶ Play', () => { stop(); const P = IX_PARAM[S.k]; S.t = P.t[0]; S.play = setInterval(() => { S.t += (P.t[1] - P.t[0]) / 150; if (S.t >= (S.k === 'proj' ? S.land : P.t[1])) { S.t = null; stop(); } draw(); if (!cv.isConnected) stop(); }, 30); }), ixBtn('Show it all', () => { stop(); S.t = null; draw(); }));
    ctl.append(ixSeg(Object.entries(IX_PARAM).map(([k, P]) => [k, P.name]), S.k, (k) => { stop(); S.k = k; mk(); draw(); }), btns);
    mk(); draw();
  } };

// ---- Conic sections: slice a double cone, and the 2-D graph with its foci
IX.conics = { subjects: ['precalc', 'algebra2'],
  title: 'Conic sections', hint: 'Tilt the plane that slices the double cone. Flat makes a circle, a little tilt an ellipse, parallel to the side a parabola, and steeper a hyperbola. The right side shows its graph.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(820, 460), ctx = cv._ctx; main.append(cv);
    const S = { tilt: Math.max(0, Math.min(85, +o.tilt || 0)), a: 4, b: 3 }, side = 55; // the cone's sides are 55° from horizontal
    function draw() {
      ctx.clearRect(0, 0, 820, 460); const cx = 190, cy = 230, H = 190, k = 1 / Math.tan(side * Math.PI / 180);
      // the double cone, seen from the side
      ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.2; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(cx - H * k, cy + s * H); ctx.lineTo(cx, cy); ctx.lineTo(cx + H * k, cy + s * H); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy + s * H, H * k, 18, 0, 0, 2 * Math.PI); ctx.stroke(); }); ctx.restore();
      // the slicing plane (an edge-on line) through a point below the vertex
      const t = S.tilt * Math.PI / 180, p0 = [cx, cy + 95], d = [Math.cos(t), Math.sin(t)];
      ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p0[0] - 170 * d[0], p0[1] - 170 * d[1]); ctx.lineTo(p0[0] + 170 * d[0], p0[1] + 170 * d[1]); ctx.stroke(); ctx.restore();
      const kind = S.tilt === 0 ? 'circle' : S.tilt < side - 0.5 ? 'ellipse' : Math.abs(S.tilt - side) <= 0.5 ? 'parabola' : 'hyperbola';
      // the graph
      ixLine(ctx, [400, 20], [400, 440], '#e4e1d9', 2);
      const V = ixView({ _w: 400, _h: 460 }, [-8, 8], [-8, 8], 20), X = (x) => 420 + V.X(x), Y = V.Y;
      ctx.save(); ctx.strokeStyle = IXC.grid; for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(X(i), Y(-8)); ctx.lineTo(X(i), Y(8)); ctx.moveTo(X(-8), Y(i)); ctx.lineTo(X(8), Y(i)); ctx.stroke(); } ctx.strokeStyle = IXC.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(-8), Y(0)); ctx.lineTo(X(8), Y(0)); ctx.moveTo(X(0), Y(-8)); ctx.lineTo(X(0), Y(8)); ctx.stroke(); ctx.restore();
      const path = (f, t0, t1, col = IXC.blue) => { ctx.save(); ctx.beginPath(); ctx.rect(X(-8), Y(8), X(8) - X(-8), Y(-8) - Y(8)); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = 3.2; ctx.beginPath(); for (let j = 0; j <= 400; j++) { const p = f(t0 + (t1 - t0) * j / 400); if (j) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); } ctx.stroke(); ctx.restore(); };
      let L; const a = S.a, b = Math.min(S.b, kind === 'ellipse' ? S.a : 99);
      if (kind === 'circle') { path((u) => [a * Math.cos(u), a * Math.sin(u)], 0, 2 * Math.PI); ixDot(ctx, X(0), Y(0), IXC.red, 6); L = ['x² + y² = r²', `x² + y² = ${a * a}`, `radius ${a}; center (0, 0)`]; }
      else if (kind === 'ellipse') { const c = Math.sqrt(a * a - b * b); path((u) => [a * Math.cos(u), b * Math.sin(u)], 0, 2 * Math.PI); [c, -c].forEach((f) => ixDot(ctx, X(f), Y(0), IXC.red, 6));
        L = ['x²/a² + y²/b² = 1', `x²/${a * a} + y²/${b * b} = 1`, `foci (±c, 0): c² = a² − b² = ${a * a - b * b}, c ≈ ${ixN(c, 2)}`, { note: 'The red points are the foci: the distances from any point on the ellipse to the two foci add to 2a.' }]; }
      else if (kind === 'parabola') { const p = a / 4; path((u) => [u, u * u / (4 * p)], -8, 8); ixDot(ctx, X(0), Y(p), IXC.red, 6); ixLine(ctx, [X(-8), Y(-p)], [X(8), Y(-p)], IXC.red, 1.8, true);
        L = ['x² = 4py', `x² = ${ixN(4 * p)}y`, `focus (0, ${ixN(p, 2)}); directrix y = −${ixN(p, 2)}`, { note: 'Every point is the same distance from the focus (red dot) and the directrix (dashed line).' }]; }
      else { const c = Math.hypot(a, b); path((u) => [a * Math.cosh(u), b * Math.sinh(u)], -2.5, 2.5); path((u) => [-a * Math.cosh(u), b * Math.sinh(u)], -2.5, 2.5); [c, -c].forEach((f) => ixDot(ctx, X(f), Y(0), IXC.red, 6));
        ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = IXC.gray; ctx.beginPath(); ctx.moveTo(X(-8), Y(-8 * b / a)); ctx.lineTo(X(8), Y(8 * b / a)); ctx.moveTo(X(-8), Y(8 * b / a)); ctx.lineTo(X(8), Y(-8 * b / a)); ctx.stroke(); ctx.restore();
        L = ['x²/a² − y²/b² = 1', `x²/${a * a} − y²/${b * b} = 1`, `foci (±c, 0): c² = a² + b² = ${a * a + b * b}, c ≈ ${ixN(c, 2)}`, `asymptotes y = ±${ixFrac(b / a)}x`]; }
      ixRead(read, [{ h: `The slice: ${kind === 'ellipse' ? 'an' : 'a'} ${kind}` }, `plane tilted ${S.tilt}° (the cone’s side is ${side}°)`, { h: 'Its graph' }, ...L]);
    }
    ctl.append(ixSlider('tilt of the plane', 0, 85, 1, S.tilt, (v) => v + '°', (v) => { S.tilt = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Circle', () => set(0)), ixBtn('Ellipse', () => set(30)), ixBtn('Parabola', () => set(side)), ixBtn('Hyperbola', () => set(75))),
      ixSlider('a', 1, 7, 1, S.a, String, (v) => { S.a = v; draw(); }), ixSlider('b', 1, 7, 1, S.b, String, (v) => { S.b = v; draw(); }));
    const set = (v) => { S.tilt = v; ctl.querySelector('.ix-sl').set(v); draw(); };
    draw();
  } };

// ---- Algebra tiles: multiply (x + p)(x + q), or factor x² + bx + c into a rectangle
IX.algTiles = { subjects: ['algebra1', 'algebra2'],
  title: 'Algebra tiles: multiplying and factoring', hint: 'Multiply: slide p and q to build (x + p)(x + q). Factor: slide b and c, and the tiles arrange into a rectangle if x² + bx + c factors. Red tiles are negative.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 560), ctx = cv._ctx; main.append(cv);
    const S = { mode: o.mode === 'fact' ? 'fact' : 'mult', p: 2, q: 3, b: 5, c: 6 };
    const sg = (n) => (n < 0 ? ' − ' + Math.abs(n) : ' + ' + n);
    function tiles(p, q, ok) {
      const X = 150, u = 26, x0 = 70, y0 = 70, pos = IXC.blue, neg = IXC.red;
      const box = (x, y, w, h, col, t) => { ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.25; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.restore(); if (t) ixLabel(ctx, t, x + w / 2, y + h / 2, w < 40 || h < 40 ? 14 : 22, 'center', col, 'middle'); };
      // the labels on the edges
      ixLabel(ctx, 'x', x0 + X / 2, y0 - 30, 20, 'center', IXC.ink); ixLabel(ctx, 'x', x0 - 20, y0 + X / 2, 20, 'center', IXC.ink, 'middle');
      box(x0, y0, X, X, IXC.green, 'x²');
      for (let i = 0; i < Math.abs(p); i++) { box(x0 + X + i * u, y0, u, X, p < 0 ? neg : pos, 'x'); ixLabel(ctx, p < 0 ? '−1' : '1', x0 + X + i * u + u / 2, y0 - 26, 13, 'center', p < 0 ? neg : IXC.ink); }
      for (let j = 0; j < Math.abs(q); j++) { box(x0, y0 + X + j * u, X, u, q < 0 ? neg : pos, 'x'); ixLabel(ctx, q < 0 ? '−1' : '1', x0 - 20, y0 + X + j * u + u / 2, 13, 'center', q < 0 ? neg : IXC.ink, 'middle'); }
      for (let i = 0; i < Math.abs(p); i++) for (let j = 0; j < Math.abs(q); j++) box(x0 + X + i * u, y0 + X + j * u, u, u, p * q < 0 ? neg : IXC.orange, '');
      if (ok === false) ixLabel(ctx, 'These tiles can’t make a rectangle.', 310, 520, 18, 'center', IXC.red);
    }
    function draw() {
      ctx.clearRect(0, 0, 620, 560); let L;
      if (S.mode === 'mult') { const { p, q } = S; tiles(p, q);
        L = [{ h: 'Multiply' }, `(x${sg(p)})(x${sg(q)})`, `= x² ${p + q === 0 ? '' : (p + q < 0 ? '− ' : '+ ') + (Math.abs(p + q) === 1 ? '' : Math.abs(p + q)) + 'x '}${p * q === 0 ? '' : (p * q < 0 ? '− ' : '+ ') + Math.abs(p * q)}`.replace(/\s+$/, ''),
          `x tiles: ${p} + ${q} = ${p + q} (positive minus negative)`, `unit tiles: ${p} × ${q} = ${p * q}`, { note: 'The green square is x · x. Each strip is 1 · x. Each small square is 1 · 1, red when its row and column have opposite signs.' }];
      } else { const { b, c } = S; let pq = null; for (let p = -12; p <= 12 && !pq; p++) { const q = b - p; if (p * q === c) pq = [p, q]; }
        if (pq) tiles(pq[0], pq[1]); else { tiles(0, 0, false); }
        const poly = `x²${b ? (b < 0 ? ' − ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x' : ''}${c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : ''}`;
        L = [{ h: 'Factor' }, poly, pq ? `= (x${sg(pq[0])})(x${sg(pq[1])})` : 'doesn’t factor with integers', { h: 'Find two numbers' }, `that multiply to ${c} and add to ${b}`, pq ? { note: `${pq[0]} · ${pq[1]} = ${c} and ${pq[0]} + ${pq[1]} = ${b}.`, good: true } : { note: 'No pair of integers works, so the tiles can’t be arranged into a rectangle.', bad: true }]; }
      ixRead(read, L);
    }
    const sp = el('div', {}, ixSlider('p', -6, 6, 1, S.p, String, (v) => { S.p = v; draw(); }), ixSlider('q', -6, 6, 1, S.q, String, (v) => { S.q = v; draw(); }));
    const sb = el('div', {}, ixSlider('b (x-term)', -12, 12, 1, S.b, String, (v) => { S.b = v; draw(); }), ixSlider('c (constant)', -36, 36, 1, S.c, String, (v) => { S.c = v; draw(); }));
    ctl.append(ixSeg([['mult', 'Multiply (x + p)(x + q)'], ['fact', 'Factor x² + bx + c']], S.mode, (k) => { S.mode = k; sp.style.display = k === 'mult' ? '' : 'none'; sb.style.display = k === 'mult' ? 'none' : ''; draw(); }), sp, sb);
    sp.style.display = S.mode === 'mult' ? '' : 'none'; sb.style.display = S.mode === 'mult' ? 'none' : ''; draw();
  } };

// ---- Solving equations with a balance scale
IX.balance = { subjects: ['algebra1'],
  title: 'Solving equations with a balance', hint: 'Keep the scale balanced: whatever you do to one side, do to the other. Get x by itself.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 460), ctx = cv._ctx; main.append(cv);
    const S = { r: mulberry32((Date.now() % 1e9) | 0), log: [] };
    const fresh = () => { const x = 1 + Math.floor(S.r() * 5), c = Math.floor(S.r() * 2), a = c + 1 + Math.floor(S.r() * 3), b = Math.floor(S.r() * 5), d = (a - c) * x + b; Object.assign(S, { x, L: [a, b], R: [c, d], log: [] }); };
    const eq = () => { const side = ([n, k]) => [n ? (n === 1 ? 'x' : `${n}x`) : '', k ? String(k) : ''].filter(Boolean).join(' + ') || '0'; return `${side(S.L)} = ${side(S.R)}`; };
    function draw() {
      ctx.clearRect(0, 0, 640, 460); const tilt = 0; // always balanced
      ixLine(ctx, [320, 120], [320, 410], IXC.ink, 6); ctx.save(); ctx.fillStyle = IXC.ink; ctx.beginPath(); ctx.moveTo(270, 420); ctx.lineTo(370, 420); ctx.lineTo(320, 395); ctx.fill(); ctx.restore();
      ixLine(ctx, [60, 120 + tilt], [580, 120 - tilt], IXC.ink, 6); ixDot(ctx, 320, 120, IXC.ink, 9);
      [[S.L, 70], [S.R, 350]].forEach(([[n, k], x0]) => { ixLine(ctx, [x0 + 110, 120], [x0 + 110, 290], IXC.gray, 2); ctx.save(); ctx.fillStyle = '#d9d4c7'; ctx.fillRect(x0, 290, 220, 12); ctx.restore();
        let px = x0 + 4, py = 288; const put = (w, h, col, t) => { if (px + w > x0 + 218) { px = x0 + 4; py -= 50; } ctx.save(); ctx.fillStyle = col; ctx.fillRect(px, py - h, w, h); ctx.strokeStyle = '#0003'; ctx.strokeRect(px, py - h, w, h); ctx.restore(); ixLabel(ctx, t, px + w / 2, py - h / 2, 18, 'center', '#fff', 'middle'); px += w + 4; };
        for (let i = 0; i < n; i++) put(44, 44, IXC.blue, 'x'); for (let i = 0; i < k; i++) put(22, 22, IXC.orange, '1'); });
      const solved = (S.L[0] === 1 && S.L[1] === 0) || (S.R[0] === 1 && S.R[1] === 0 && S.L[0] === 0);
      ixLabel(ctx, eq(), 320, 30, 30, 'center', solved ? IXC.green : IXC.ink);
      ixRead(read, [{ h: 'Equation' }, eq(), ...S.log.map((t) => '→ ' + t), solved ? { note: `Solved: x = ${S.x}. Check: put ${S.x} back into the first equation.`, good: true } : { note: 'Tip: take away the same number of x boxes from both sides first, then the 1s, then split into equal groups.' }]);
    }
    const act = (fn, t) => () => { if (fn() !== false) S.log.push(t()); draw(); };
    ctl.append(el('div', { class: 'ix-btns' },
      ixBtn('Take 1 x from both sides', act(() => { if (!S.L[0] || !S.R[0]) return false; S.L[0]--; S.R[0]--; }, () => eq() + '  (−x on both sides)')),
      ixBtn('Take 1 from both sides', act(() => { if (!S.L[1] || !S.R[1]) return false; S.L[1]--; S.R[1]--; }, () => eq() + '  (−1 on both sides)')),
      ixBtn('Take all the 1s you can', act(() => { const m = Math.min(S.L[1], S.R[1]); if (!m) return false; S.L[1] -= m; S.R[1] -= m; S.m = m; }, () => eq() + `  (−${S.m} on both sides)`)),
      ixBtn('Divide both sides into equal groups', act(() => { const n = S.L[0] || S.R[0], xs = S.L[0] ? S.L : S.R, other = S.L[0] ? S.R : S.L; if (n < 2 || xs[1] || other[0] || other[1] % n) return false; S.dv = n; xs[0] = 1; other[1] /= n; }, () => eq() + `  (÷${S.dv} on both sides)`))),
      el('div', { class: 'ix-btns' }, ixBtn('New equation', () => { fresh(); draw(); })));
    fresh(); draw();
  } };

// ---- Relations and functions: mapping diagram and the vertical line test
const IX_REL = {
  f1: { name: 'Pairs: a function', pairs: [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]] },
  f2: { name: 'Pairs: not a function', pairs: [[1, 2], [1, -2], [3, 4], [4, 0], [-2, 1]] },
  sq: { name: 'y = x²', f: (x) => [x * x] },
  side: { name: 'x = y²', f: (x) => (x >= 0 ? [Math.sqrt(x), -Math.sqrt(x)] : []) },
  circ: { name: 'x² + y² = 16', f: (x) => (Math.abs(x) <= 4 ? [Math.sqrt(16 - x * x), -Math.sqrt(16 - x * x)] : []) },
  abs: { name: 'y = |x| − 2', f: (x) => [Math.abs(x) - 2] } };
IX.funcTest = { subjects: ['algebra1', 'algebra2', 'precalc'],
  title: 'Functions: mapping diagrams and the vertical line test', hint: 'Pick a relation. Drag the red vertical line across the graph: if it ever hits the graph twice, it’s not a function.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(820, 480), ctx = cv._ctx; main.append(cv);
    const S = { k: 'f1', vx: 1 }, V0 = ixView({ _w: 440, _h: 480 }, [-6, 6], [-6, 6], 22), V = { ...V0, X: (x) => 380 + V0.X(x), ix: (px) => V0.ix(px - 380) };
    function draw() {
      const R = IX_REL[S.k]; ctx.clearRect(0, 0, 820, 480); ixGrid(ctx, V, { step: 1, lab: 2 });
      let hits = [], twoX = null;
      if (R.pairs) { R.pairs.forEach(([x, y]) => ixDot(ctx, V.X(x), V.Y(y), IXC.blue, 7));
        // mapping diagram on the left
        const xs = [...new Set(R.pairs.map((p) => p[0]))].sort((a, b) => a - b), ys = [...new Set(R.pairs.map((p) => p[1]))].sort((a, b) => a - b);
        const oval = (cx, items) => { ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, 240, 46, 30 + items.length * 26, 0, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); return items.map((v, i) => [cx, 240 + (i - (items.length - 1) / 2) * 44]); };
        const px = oval(80, xs), py = oval(260, ys); ixLabel(ctx, 'inputs (x)', 80, 30, 16, 'center', IXC.axis); ixLabel(ctx, 'outputs (y)', 260, 30, 16, 'center', IXC.axis);
        xs.forEach((v, i) => ixLabel(ctx, String(v), ...px[i], 19, 'center', IXC.ink, 'middle')); ys.forEach((v, i) => ixLabel(ctx, String(v), ...py[i], 19, 'center', IXC.ink, 'middle'));
        R.pairs.forEach(([x, y]) => { const a = px[xs.indexOf(x)], b = py[ys.indexOf(y)], two = R.pairs.filter((p) => p[0] === x).length > 1; ixLine(ctx, [a[0] + 18, a[1]], [b[0] - 18, b[1]], two ? IXC.red : IXC.blue, 2.4); });
        hits = R.pairs.filter((p) => p[0] === S.vx).map((p) => p[1]); twoX = xs.find((x) => R.pairs.filter((p) => p[0] === x).length > 1);
      } else { [0, 1].forEach((br) => ixCurve(ctx, V, (x) => R.f(x)[br] ?? NaN, IXC.blue, { w: 3.4 })); hits = R.f(S.vx); ixLabel(ctx, R.name, 200, 230, 28, 'center', IXC.blue, 'middle'); twoX = R.f(1).length > 1 ? 1 : null; }
      ixLine(ctx, [V.X(S.vx), V.Y(6)], [V.X(S.vx), V.Y(-6)], IXC.red, 2.6); hits.forEach((y) => ixDot(ctx, V.X(S.vx), V.Y(y), IXC.red, 8, true));
      const isF = twoX == null;
      ixRead(read, [{ h: R.name }, R.pairs ? `{ ${R.pairs.map((p) => `(${p[0]}, ${p[1]})`).join(', ')} }` : null, { h: `The line x = ${ixN(S.vx, 1)}` }, `hits the graph ${hits.length} time${hits.length === 1 ? '' : 's'}`,
        isF ? { note: 'Every input has exactly one output: it’s a function. No vertical line hits it twice.', good: true } : { note: `Not a function: ${R.pairs ? `the input ${twoX} goes to two outputs (red arrows)` : 'a vertical line hits it twice'}.`, bad: true }]);
    }
    ctl.append(ixSeg(Object.entries(IX_REL).map(([k, R]) => [k, R.name]), S.k, (k) => { S.k = k; draw(); }));
    ixDrag(cv, (x) => (x > 380 ? 'v' : null), (h, x) => { S.vx = Math.max(-6, Math.min(6, Math.round(V.ix(x) * (IX_REL[S.k].pairs ? 1 : 4)) / (IX_REL[S.k].pairs ? 1 : 4))); draw(); });
    draw();
  } };

// ---- Polynomials: zeros, multiplicity, and end behavior
IX.polynomial = { subjects: ['algebra2', 'precalc'],
  title: 'Polynomial graphs: zeros, multiplicity, end behavior', hint: 'Slide the zeros and their multiplicities, and the leading coefficient. Odd multiplicity crosses the x-axis; even multiplicity bounces.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 560), ctx = cv._ctx; main.append(cv);
    const S = { a: 1, z: [[-3, 1], [1, 2], [4, 1]], n: 3 };
    const f = (x) => S.a * S.z.slice(0, S.n).reduce((p, [r, m]) => p * (x - r) ** m, 1);
    function draw() {
      ctx.clearRect(0, 0, 600, 560); const Z = S.z.slice(0, S.n), deg = Z.reduce((s, [, m]) => s + m, 0);
      const zr = Z.map((z) => z[0]), lo = Math.min(...zr) - (zr.length > 1 ? 0 : 1.5), hi = Math.max(...zr) + (zr.length > 1 ? 0 : 1.5); let top = 1; for (let x = lo; x <= hi; x += 0.02) top = Math.max(top, Math.abs(f(x))); const yr = Math.max(4, Math.ceil(top * 1.6));
      const V = ixView(cv, [-7, 7], [-yr, yr], 24); const ys = [1, 2, 5, 10, 20, 50, 100, 200, 500].find((v) => yr / v <= 8) || 1000; ixGrid2(ctx, V, 1, ys, 1, ys); ixCurve(ctx, V, f, IXC.blue, { w: 3.4 });
      Z.forEach(([r, m]) => { ixDot(ctx, V.X(r), V.Y(0), m % 2 ? IXC.red : IXC.green, 8, true); });
      const lead = S.a > 0 ? 1 : -1, left = (deg % 2 ? -lead : lead) > 0 ? 'up ↑' : 'down ↓', right = lead > 0 ? 'up ↑' : 'down ↓';
      const fx = `${S.a === 1 ? '' : S.a === -1 ? '−' : S.a}${Z.map(([r, m]) => `(x ${r < 0 ? '+ ' + -r : r ? '− ' + r : ''})`.replace('(x )', 'x') + (m > 1 ? '⁰¹²³⁴⁵'[m] : '')).join('')}`;
      ixRead(read, [{ h: 'The polynomial' }, `f(x) = ${fx}`, `degree ${deg} (${deg % 2 ? 'odd' : 'even'}); leading coefficient ${S.a} (${S.a > 0 ? 'positive' : 'negative'})`,
        { h: 'End behavior' }, `as x → −∞, f(x) goes ${left}`, `as x → +∞, f(x) goes ${right}`,
        { h: 'Zeros' }, ...Z.map(([r, m]) => `x = ${r}: multiplicity ${m}, ${m % 2 ? 'crosses the x-axis' : 'touches and bounces off'}${m > 1 ? ' (flattens out there)' : ''}`),
        { note: 'Even degree: both ends point the same way. Odd degree: the ends point opposite ways. A negative leading coefficient flips both.' }]);
    }
    ctl.append(ixSlider('leading coefficient a', -3, 3, 1, S.a, String, (v) => { S.a = v || 1; draw(); }), ixSlider('number of zeros', 1, 3, 1, S.n, String, (v) => { S.n = v; draw(); }),
      ...[0, 1, 2].flatMap((i) => [ixSlider(`zero ${i + 1}`, -6, 6, 1, S.z[i][0], String, (v) => { S.z[i][0] = v; draw(); }), ixSlider(`multiplicity ${i + 1}`, 1, 5, 1, S.z[i][1], String, (v) => { S.z[i][1] = v; draw(); })]));
    draw();
  } };

// ---- Logarithms: the inverse of an exponential
IX.logs = { subjects: ['algebra2', 'precalc'],
  title: 'Logarithms and exponentials', hint: 'Slide the base b and the point. log_b(x) asks: b to what power gives x? The log graph is the exponential reflected over y = x.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 580), ctx = cv._ctx; main.append(cv);
    const S = { b: 2, u: 3 }, V = ixView(cv, [-4, 10], [-4, 10], 22);
    const sup = (t) => String(t).replace(/[0-9−-]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁻'['0123456789−-'.indexOf(c)]), sub = (t) => String(t).replace(/[0-9.]/g, (c) => '₀₁₂₃₄₅₆₇₈₉.'['0123456789.'.indexOf(c)]);
    function draw() {
      ctx.clearRect(0, 0, 580, 580); ixGrid(ctx, V, { step: 1, lab: 2 }); const b = S.b, bn = Math.abs(b - Math.E) < 1e-9 ? 'e' : b === 0.5 ? '½' : ixN(b);
      const pw = (u) => (Number.isInteger(u) || /^−?\d+$/.test(ixN(u, 2)) ? bn + sup(ixN(u, 2)) : `${bn}^(${ixN(u, 2)})`), lg = bn === 'e' ? 'ln' : bn === '10' ? 'log' : 'log' + sub(bn === '½' ? '½' : bn);
      ixLine(ctx, [V.X(-4), V.Y(-4)], [V.X(10), V.Y(10)], IXC.gray, 1.4, true);
      ixCurve(ctx, V, (x) => b ** x, IXC.blue, { w: 3.2 }); ixCurve(ctx, V, (x) => (x > 0 ? Math.log(x) / Math.log(b) : NaN), IXC.red, { w: 3.2, a: 0.001 });
      const y = b ** S.u; ixDot(ctx, V.X(S.u), V.Y(y), IXC.blue, 8, true); ixDot(ctx, V.X(y), V.Y(S.u), IXC.red, 8, true); ixLine(ctx, [V.X(S.u), V.Y(y)], [V.X(y), V.Y(S.u)], IXC.purple, 1.6, true);
      ixLabel(ctx, `y = ${bn}ˣ`, V.X(1.2), V.Y(Math.min(9.5, b ** 1.2 + 1)), 19, 'left', IXC.blue); ixLabel(ctx, `y = ${lg} x`, V.X(8), V.Y(Math.log(8) / Math.log(b) + 0.9), 19, 'center', IXC.red);
      ixRead(read, [{ h: 'Exponential form ⇔ log form' }, `${pw(S.u)} = ${ixN(y, 3)}`, `${lg}(${ixN(y, 3)}) = ${ixN(S.u, 2)}`, { note: `The log is the exponent: ${bn} to the ${ixN(S.u, 2)} power gives ${ixN(y, 3)}.` },
        { h: 'The two graphs' }, `blue point (${ixN(S.u, 2)}, ${ixN(y, 2)}), red point (${ixN(y, 2)}, ${ixN(S.u, 2)})`, `Domain of the log: x > 0. It crosses the x-axis at (1, 0) because ${bn}⁰ = 1.`, b === 10 ? { note: 'Base 10 is the common log: log x on the calculator (ctrl 10ˣ on the TI-Nspire).' } : bn === 'e' ? { note: 'Base e is the natural log, ln x (ctrl eˣ on the TI-Nspire).' } : null]);
    }
    const bs = ixSeg([[2, 'b = 2'], [3, '3'], [Math.E, 'e'], [10, '10'], [0.5, '½']], S.b, (k) => { S.b = k; draw(); });
    ctl.append(bs, ixSlider('exponent', -2, 3, 0.25, S.u, (v) => ixN(v, 2), (v) => { S.u = v; draw(); }));
    draw();
  } };

// ---- Rational functions: zeros, holes, and asymptotes
IX.rational = { subjects: ['algebra2', 'precalc'],
  title: 'Rational functions: asymptotes and holes', hint: 'Slide the zero, the vertical asymptote, and a hole (a factor that cancels). Change the degrees to see the horizontal or slant asymptote change.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 560), ctx = cv._ctx; main.append(cv);
    const S = { a: 1, z: 2, z2: -3, v: -1, v2: 4, h: 3, hole: true, top: 1, bot: 1 };
    const num = (x) => S.a * (x - S.z) * (S.top === 2 ? x - S.z2 : 1), den = (x) => (x - S.v) * (S.bot === 2 ? x - S.v2 : 1), f = (x) => num(x) / den(x);
    const fac = (r) => `(x ${r < 0 ? '+ ' + -r : r ? '− ' + r : ''})`.replace('(x )', 'x');
    function draw() {
      ctx.clearRect(0, 0, 600, 560); const V = ixView(cv, [-8, 8], [-8, 8], 22); ixGrid(ctx, V, { step: 1, lab: 2 });
      const vs = [S.v, ...(S.bot === 2 ? [S.v2] : [])].filter((v) => v !== S.z && !(S.top === 2 && v === S.z2));
      vs.forEach((v) => ixLine(ctx, [V.X(v), V.Y(8)], [V.X(v), V.Y(-8)], IXC.red, 2, true));
      let ha = null, slant = null; if (S.top < S.bot) ha = 0; else if (S.top === S.bot) ha = S.a; else { // slant: long division of a(x − z)(x − z2) by (x − v)
        const p2 = S.a, p1 = -S.a * (S.z + S.z2), m = p2, c = p1 + p2 * S.v; slant = [m, c]; }
      if (ha != null) ixLine(ctx, [V.X(-8), V.Y(ha)], [V.X(8), V.Y(ha)], IXC.green, 2, true); if (slant) ixCurve(ctx, V, (x) => slant[0] * x + slant[1], IXC.green, { w: 2, dash: true });
      ixCurve(ctx, V, f, IXC.blue, { w: 3.4, n: 2000 });
      if (S.hole) { const hy = f(S.h); if (isFinite(hy)) { ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(V.X(S.h), V.Y(hy), 7, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); } }
      const zs = [S.z, ...(S.top === 2 ? [S.z2] : [])].filter((z) => !vs.includes(z) && !(S.hole && z === S.h)); zs.forEach((z) => ixDot(ctx, V.X(z), V.Y(0), IXC.purple, 7));
      const top = `${S.a === 1 ? '' : S.a}${fac(S.z)}${S.top === 2 ? fac(S.z2) : ''}`, bot = `${fac(S.v)}${S.bot === 2 ? fac(S.v2) : ''}`, hf = S.hole ? fac(S.h) : '';
      ixRead(read, [{ h: 'The function' }, `f(x) = ${top}${hf}/(${bot}${hf})`.replace('/(x', '/(x'),
        { h: 'Vertical asymptotes (red)' }, vs.length ? vs.map((v) => `x = ${v}`).join(', ') : 'none (that factor canceled)', { note: 'Where the bottom is 0 but the top isn’t.' },
        S.hole ? { h: 'Hole (open circle)' } : null, S.hole ? `at x = ${S.h}: the factor ${hf} cancels, so the graph has a gap there instead of an asymptote` : null,
        { h: 'Zeros (purple)' }, zs.length ? zs.map((z) => `x = ${z}`).join(', ') : 'none', { h: ha != null ? 'Horizontal asymptote (green)' : 'Slant asymptote (green)' },
        ha != null ? `y = ${ha} (${S.top < S.bot ? 'bottom degree is bigger' : 'same degree: ratio of leading coefficients'})` : `y = ${ixN(slant[0])}x ${slant[1] < 0 ? '−' : '+'} ${ixN(Math.abs(slant[1]))} (top degree is one more: divide)`]);
    }
    ctl.append(ixSeg([[1, 'top: degree 1'], [2, 'top: degree 2']], S.top, (k) => { S.top = k; draw(); }), ixSeg([[1, 'bottom: degree 1'], [2, 'bottom: degree 2']], S.bot, (k) => { S.bot = k; draw(); }),
      ixSlider('a', -3, 3, 1, S.a, String, (v) => { S.a = v || 1; draw(); }), ixSlider('zero', -6, 6, 1, S.z, String, (v) => { S.z = v; draw(); }), ixSlider('2nd zero', -6, 6, 1, S.z2, String, (v) => { S.z2 = v; draw(); }),
      ixSlider('vertical asymptote', -6, 6, 1, S.v, String, (v) => { S.v = v; draw(); }), ixSlider('2nd vertical asymptote', -6, 6, 1, S.v2, String, (v) => { S.v2 = v; draw(); }),
      ixCheck('Include a hole', S.hole, (v) => { S.hole = v; draw(); }), ixSlider('hole at x =', -6, 6, 1, S.h, String, (v) => { S.h = v; draw(); }));
    draw();
  } };

// ---- shared for the statistics interactives
const ixStats = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length, med = (t) => (t.length % 2 ? t[(t.length - 1) / 2] : (t[t.length / 2 - 1] + t[t.length / 2]) / 2);
  const lo = s.slice(0, Math.floor(n / 2)), hi = s.slice(Math.ceil(n / 2)), mean = s.reduce((p, v) => p + v, 0) / n;
  const cnt = {}; s.forEach((v) => (cnt[v] = (cnt[v] || 0) + 1)); const mx = Math.max(...Object.values(cnt)), mode = mx > 1 ? Object.keys(cnt).filter((k) => cnt[k] === mx).map(Number) : [];
  return { s, n, mean, med: med(s), q1: med(lo), q3: med(hi), min: s[0], max: s[n - 1], mode, sd: Math.sqrt(s.reduce((p, v) => p + (v - mean) ** 2, 0) / n) }; };

// ---- Mean, median, mode, and outliers on a dot plot
IX.meanMedian = { subjects: ['act', 'algebra1'],
  title: 'Mean, median, and outliers', hint: 'Click on the number line to add a data point; drag a dot to move it; click a dot to remove it. Watch how an outlier pulls the mean but barely moves the median.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 360), ctx = cv._ctx; main.append(cv);
    const S = { d: [3, 4, 4, 5, 6, 6, 6, 7, 8, 9] }, X = (v) => 40 + v * 28, iv = (px) => Math.max(0, Math.min(20, Math.round((px - 40) / 28)));
    function draw() {
      ctx.clearRect(0, 0, 640, 360); const st = S.d.length ? ixStats(S.d) : null;
      ixLine(ctx, [30, 300], [620, 300], IXC.ink, 2); for (let v = 0; v <= 20; v++) { ixLine(ctx, [X(v), 294], [X(v), 306], IXC.ink, 1.5); ixLabel(ctx, String(v), X(v), 312, 15, 'center', IXC.ink); }
      const cnt = {}; S.d.forEach((v) => { cnt[v] = (cnt[v] || 0) + 1; ixDot(ctx, X(v), 300 - 20 * cnt[v], IXC.blue, 8); });
      if (st) { ixLine(ctx, [X(st.mean), 40], [X(st.mean), 290], IXC.red, 2.6); ixLabel(ctx, `mean ${ixN(st.mean, 2)}`, X(st.mean), 18, 16, 'center', IXC.red);
        ixLine(ctx, [X(st.med), 56], [X(st.med), 290], IXC.green, 2.6, true); ixLabel(ctx, `median ${ixN(st.med, 2)}`, X(st.med), 56 - 18 + 32 * (Math.abs(st.med - st.mean) < 2), 16, 'center', IXC.green); }
      if (!st) return ixRead(read, [{ note: 'Click the number line to add data.' }]);
      const sum = S.d.reduce((p, v) => p + v, 0);
      ixRead(read, [{ h: `n = ${st.n}` }, `data: ${st.s.join(', ')}`, { h: 'Mean (red)' }, `${sum}/${st.n} = ${ixN(st.mean, 3)}`, { h: 'Median (green)' }, st.n % 2 ? `the middle value, #${(st.n + 1) / 2}: ${st.med}` : `average of #${st.n / 2} and #${st.n / 2 + 1}: ${ixN(st.med, 2)}`,
        { h: 'Mode and range' }, `mode: ${st.mode.length ? st.mode.join(', ') : 'none'}; range: ${st.max} − ${st.min} = ${st.max - st.min}`,
        { note: Math.abs(st.mean - st.med) > 1 ? `The mean is pulled ${st.mean > st.med ? 'right (up)' : 'left (down)'} by the far-out value${st.mean > st.med ? 's on the right' : 's on the left'}. The median resists outliers.` : 'Mean and median are close: the data is fairly balanced.' }]);
    }
    const dotAt = (x, y) => { const v = iv(x), k = Math.round((300 - y) / 20); return Math.abs(X(v) - x) < 12 && k >= 1 && k <= S.d.filter((d) => d === v).length ? v : null; };
    let moved = false;
    ixDrag(cv, (x, y) => (dotAt(x, y) != null ? 'p' : null), (h, x, y) => { if (S.cur == null) { S.cur = S.d.lastIndexOf(dotAt(x, y)); moved = false; return; } const v = iv(x); if (v !== S.d[S.cur]) moved = true; S.d[S.cur] = v; draw(); },
      () => { if (!moved && S.cur != null) { S.d.splice(S.cur, 1); draw(); } S.cur = null; });
    cv.addEventListener('pointerdown', (e) => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv._w / r.width, y = (e.clientY - r.top) * cv._h / r.height; if (S.cur == null && dotAt(x, y) == null && y > 60 && y < 330) { S.d.push(iv(x)); draw(); } });
    ctl.append(el('div', { class: 'ix-btns' }, ixBtn('Add an outlier at 20', () => { S.d.push(20); draw(); }), ixBtn('Reset', () => { S.d = [3, 4, 4, 5, 6, 6, 6, 7, 8, 9]; draw(); }), ixBtn('Clear', () => { S.d = []; draw(); })),
      el('div', { class: 'small' }, 'ACT tip: if every value goes up by 5, the mean and median go up by 5 but the range stays the same.'));
    draw();
  } };

// ---- Box plots: five-number summary and the 1.5 × IQR rule
IX.boxPlot = { subjects: ['act', 'algebra1'],
  title: 'Box plots and the five-number summary', hint: 'Drag the data dots. The box plot underneath updates: the box holds the middle half of the data. Points past 1.5 × IQR are outliers.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 380), ctx = cv._ctx; main.append(cv);
    const S = { d: [12, 15, 17, 18, 20, 21, 22, 24, 25, 27, 30, 44] }, X = (v) => 30 + v * 12, iv = (px) => Math.max(0, Math.min(50, Math.round((px - 30) / 12)));
    function draw() {
      ctx.clearRect(0, 0, 640, 380); const st = ixStats(S.d), iqr = st.q3 - st.q1, lf = st.q1 - 1.5 * iqr, uf = st.q3 + 1.5 * iqr, out = st.s.filter((v) => v < lf || v > uf), inn = st.s.filter((v) => v >= lf && v <= uf);
      ixLine(ctx, [20, 150], [630, 150], IXC.ink, 2); for (let v = 0; v <= 50; v += 5) { ixLine(ctx, [X(v), 144], [X(v), 156], IXC.ink, 1.5); ixLabel(ctx, String(v), X(v), 162, 14, 'center', IXC.ink); }
      const cnt = {}; S.d.forEach((v) => { cnt[v] = (cnt[v] || 0) + 1; ixDot(ctx, X(v), 150 - 18 * cnt[v], out.includes(v) ? IXC.red : IXC.blue, 7); });
      // the box plot
      const y = 270, h = 30, wl = Math.min(...inn), wr = Math.max(...inn);
      ctx.save(); ctx.fillStyle = '#dce7f3'; ctx.fillRect(X(st.q1), y - h, X(st.q3) - X(st.q1), 2 * h); ctx.restore(); ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 2.6; ctx.strokeRect(X(st.q1), y - h, X(st.q3) - X(st.q1), 2 * h); ctx.restore();
      ixLine(ctx, [X(st.med), y - h], [X(st.med), y + h], IXC.green, 3.4); ixLine(ctx, [X(wl), y], [X(st.q1), y], IXC.blue, 2.4); ixLine(ctx, [X(st.q3), y], [X(wr), y], IXC.blue, 2.4);
      ixLine(ctx, [X(wl), y - 14], [X(wl), y + 14], IXC.blue, 2.4); ixLine(ctx, [X(wr), y - 14], [X(wr), y + 14], IXC.blue, 2.4); out.forEach((v) => ixLabel(ctx, '✱', X(v), y, 22, 'center', IXC.red, 'middle'));
      [['min', wl], ['Q1', st.q1], ['median', st.med], ['Q3', st.q3], ['max', wr]].forEach(([t, v], i) => ixLabel(ctx, `${t} ${ixN(v, 1)}`, X(v), y + h + 8 + (i % 2) * 18, 14, 'center', t === 'median' ? IXC.green : IXC.blue));
      ixRead(read, [{ h: 'Five-number summary' }, `min ${st.min}, Q1 ${ixN(st.q1, 1)}, median ${ixN(st.med, 1)}, Q3 ${ixN(st.q3, 1)}, max ${st.max}`, `data: ${st.s.join(', ')}`,
        { h: 'Spread' }, `range = ${st.max} − ${st.min} = ${st.max - st.min}`, `IQR = Q3 − Q1 = ${ixN(st.q3, 1)} − ${ixN(st.q1, 1)} = ${ixN(iqr, 1)}`,
        { h: 'Outlier check (1.5 × IQR)' }, `1.5 × ${ixN(iqr, 1)} = ${ixN(1.5 * iqr, 2)}`, `fences: below ${ixN(lf, 2)} or above ${ixN(uf, 2)}`, out.length ? { note: `Outlier${out.length > 1 ? 's' : ''}: ${out.join(', ')} (red ✱). The whiskers stop at the last value inside the fences.`, bad: true } : { note: 'No outliers: the whiskers reach the min and max.', good: true },
        { note: 'Q1 is the median of the lower half; Q3 is the median of the upper half (the middle value is left out when n is odd).' }]);
    }
    const dotAt = (x, y) => { const v = iv(x), k = Math.round((150 - y) / 18); return Math.abs(X(v) - x) < 9 && k >= 1 && k <= S.d.filter((d) => d === v).length ? v : null; };
    ixDrag(cv, (x, y) => { const v = dotAt(x, y); if (v == null) return null; S.cur = S.d.indexOf(v); return 'p'; }, (h, x) => { S.d[S.cur] = iv(x); draw(); });
    ctl.append(el('div', { class: 'ix-btns' }, ixBtn('Add a point', () => { S.d.push(25); draw(); }), ixBtn('Remove the largest', () => { if (S.d.length > 4) { S.d.splice(S.d.indexOf(Math.max(...S.d)), 1); draw(); } }), ixBtn('Reset', () => { S.d = [12, 15, 17, 18, 20, 21, 22, 24, 25, 27, 30, 44]; draw(); })));
    draw();
  } };

// ---- Normal distribution and the empirical rule
const ixNormCdf = (z) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };
IX.normal = { subjects: ['act', 'precalc'],
  title: 'Normal distribution', hint: 'Set the mean and standard deviation, then slide the lower and upper bounds. The shaded area is the probability. Turn on 68–95–99.7 to see the empirical rule.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(660, 380), ctx = cv._ctx; main.append(cv);
    const S = { mu: 100, sd: 15, a: 85, b: 115, emp: false }, sl = {};
    function draw() {
      ctx.clearRect(0, 0, 660, 380); const { mu, sd } = S, lo = mu - 4 * sd, hi = mu + 4 * sd, X = (v) => 30 + (v - lo) / (hi - lo) * 600, pdf = (x) => Math.exp(-(((x - mu) / sd) ** 2) / 2), Y = (p) => 310 - p * 260;
      if (S.emp) [[3, '#efe6f5'], [2, '#e2ecf6'], [1, '#cfe0f0']].forEach(([k, col]) => { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X(mu - k * sd), 310); for (let x = mu - k * sd; x <= mu + k * sd; x += sd / 40) ctx.lineTo(X(x), Y(pdf(x))); ctx.lineTo(X(mu + k * sd), 310); ctx.fill(); ctx.restore(); });
      else { const a = Math.max(lo, S.a), b = Math.min(hi, S.b); ctx.save(); ctx.fillStyle = '#f3d5c8'; ctx.beginPath(); ctx.moveTo(X(a), 310); for (let x = a; x <= b; x += sd / 40) ctx.lineTo(X(x), Y(pdf(x))); ctx.lineTo(X(b), Y(pdf(b))); ctx.lineTo(X(b), 310); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3.2; ctx.beginPath(); for (let x = lo; x <= hi; x += sd / 40) { x === lo ? ctx.moveTo(X(x), Y(pdf(x))) : ctx.lineTo(X(x), Y(pdf(x))); } ctx.stroke(); ctx.restore();
      ixLine(ctx, [20, 310], [640, 310], IXC.ink, 2);
      for (let k = -3; k <= 3; k++) { ixLine(ctx, [X(mu + k * sd), 304], [X(mu + k * sd), 316], IXC.ink, 1.5); ixLabel(ctx, ixN(mu + k * sd, 1), X(mu + k * sd), 320, 14, 'center', IXC.ink); ixLabel(ctx, k ? `${k > 0 ? '+' : '−'}${Math.abs(k)}σ` : 'μ', X(mu + k * sd), 340, 13, 'center', IXC.gray); }
      let L;
      if (S.emp) { ixLabel(ctx, '68%', X(mu), Y(0.45), 20, 'center', IXC.ink); ixLabel(ctx, '95%', X(mu + 1.5 * sd), Y(0.16), 16, 'center', IXC.ink); ixLabel(ctx, '99.7%', X(mu + 2.55 * sd), Y(0.06), 14, 'center', IXC.ink);
        L = [{ h: 'The empirical rule' }, `about 68% of the data is within 1σ: ${ixN(mu - sd, 1)} to ${ixN(mu + sd, 1)}`, `about 95% within 2σ: ${ixN(mu - 2 * sd, 1)} to ${ixN(mu + 2 * sd, 1)}`, `about 99.7% within 3σ: ${ixN(mu - 3 * sd, 1)} to ${ixN(mu + 3 * sd, 1)}`, { note: 'So about 16% is above μ + σ, and about 2.5% is above μ + 2σ.' }]; }
      else { [S.a, S.b].forEach((v) => { if (v >= lo && v <= hi) ixLine(ctx, [X(v), 310], [X(v), Y(pdf(v))], IXC.red, 2.6); });
        const za = (S.a - mu) / sd, zb = (S.b - mu) / sd, pa = S.a <= lo ? 0 : ixNormCdf(za), pb = S.b >= hi ? 1 : ixNormCdf(zb), P = pb - pa;
        ixLabel(ctx, `${ixN(P * 100, 1)}%`, X((Math.max(lo, S.a) + Math.min(hi, S.b)) / 2), Y(0.25), 22, 'center', IXC.red);
        const lb = S.a <= lo ? '-1E99' : ixN(S.a, 2), ub = S.b >= hi ? '1E99' : ixN(S.b, 2);
        L = [{ h: S.a <= lo && S.b >= hi ? 'P(all values)' : S.a <= lo ? `P(X < ${ixN(S.b, 2)})` : S.b >= hi ? `P(X > ${ixN(S.a, 2)})` : `P(${ixN(S.a, 2)} < X < ${ixN(S.b, 2)})` }, `≈ ${ixN(P, 4)} (${ixN(P * 100, 2)}%)`, { h: 'z-scores' }, S.a > lo ? `z = (${ixN(S.a, 2)} − ${mu})/${sd} = ${ixN(za, 2)}` : 'lower bound: −∞', S.b < hi ? `z = (${ixN(S.b, 2)} − ${mu})/${sd} = ${ixN(zb, 2)}` : 'upper bound: +∞',
          { h: 'On the TI-Nspire' }, `menu → 5 Probability → 5 Distributions → 2 Normal Cdf`, `normCdf(${lb}, ${ub}, ${mu}, ${sd})`, { note: 'Use −1E99 or 1E99 (the EE key) for “no lower bound” or “no upper bound”.' }]; }
      ixRead(read, L);
    }
    const lim = () => { ['a', 'b'].forEach((k) => { const i = sl[k].querySelector('input'); i.min = S.mu - 4 * S.sd; i.max = S.mu + 4 * S.sd; i.step = S.sd / 10; }); };
    sl.a = ixSlider('lower bound', 40, 160, 1.5, S.a, (v) => ixN(v, 2), (v) => { S.a = Math.min(v, S.b); draw(); }); sl.b = ixSlider('upper bound', 40, 160, 1.5, S.b, (v) => ixN(v, 2), (v) => { S.b = Math.max(v, S.a); draw(); });
    const all = (mu, sd, a, b) => { Object.assign(S, { mu, sd, a, b }); sl.mu.set(mu); sl.sd.set(sd); lim(); sl.a.set(a); sl.b.set(b); draw(); };
    sl.mu = ixSlider('mean μ', 0, 200, 1, S.mu, String, (v) => { const d = v - S.mu; S.mu = v; S.a += d; S.b += d; lim(); sl.a.set(S.a); sl.b.set(S.b); draw(); });
    sl.sd = ixSlider('standard deviation σ', 1, 40, 1, S.sd, String, (v) => { S.sd = v; lim(); draw(); });
    ctl.append(sl.mu, sl.sd, sl.a, sl.b, ixCheck('Show 68–95–99.7', S.emp, (v) => { S.emp = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('IQ: within 1σ', () => all(100, 15, 85, 115)), ixBtn('IQ above 130', () => all(100, 15, 130, 160)), ixBtn('ACT: 21 ± 5, above 26', () => all(21, 5, 26, 41))));
    lim(); draw();
  } };

// ---- shared: simple 3-D views (drag to turn), radicals, and grid points
// a view: az turns around the vertical z-axis, el tilts toward looking down; returns [x, y, depth] on the canvas
function ix3(cx, cy, sc, S) {
  return (p) => { const ca = Math.cos(S.az), sa = Math.sin(S.az), ce = Math.cos(S.el), se = Math.sin(S.el), X = p[0] * ca - p[1] * sa, Y = p[0] * sa + p[1] * ca;
    return [cx + X * sc, cy - (p[2] * ce + Y * se) * sc, -Y * ce + p[2] * se]; };
}
// drag on the canvas to turn a 3-D view (unless pick(x, y) grabs a handle)
function ix3Turn(cv, S, draw, pick, move) {
  let last = null;
  ixDrag(cv, (x, y) => { last = [x, y]; return (pick && pick(x, y)) || 'turn'; }, (h, x, y) => {
    if (h !== 'turn') return move(h, x, y);
    S.az += (x - last[0]) * 0.012; S.el = Math.max(-0.1, Math.min(1.5, S.el + (y - last[1]) * 0.01)); last = [x, y]; draw(); });
}
const ix3Poly = (ctx, P, fill, stroke = IXC.ink, w = 2, dash = false) => { ctx.save(); ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.setLineDash(dash ? [6, 5] : []); ctx.stroke(); } ctx.restore(); };
// √N in simplest form: [outside, inside]
const ixSimp = (N) => { N = Math.round(N); let o = 1; for (let k = Math.floor(Math.sqrt(N)); k > 1; k--) if (N % (k * k) === 0) { o = k; break; } return [o, N / (o * o)]; };
// "c√n" with c possibly 1
const ixRad = (c, n) => (n === 1 ? ixN(c) : `${Math.abs(c - 1) < 1e-9 ? '' : ixN(c)}√${n}`);
const ixRootText = (N) => { if (N < 0) return 'not real'; const [o, i] = ixSimp(N); return i === 1 ? String(o) : ixRad(o, i); };
// a reduced fraction from two integers (for slopes)
const ixRatio = (p, q) => { if (q === 0) return 'undefined'; if (p === 0) return '0'; const g = gcd(Math.abs(Math.round(p)), Math.abs(Math.round(q))), s = p * q < 0 ? '−' : ''; const a = Math.abs(Math.round(p)) / g, b = Math.abs(Math.round(q)) / g; return b === 1 ? s + a : `${s}${a}/${b}`; };
const ixPt = (p) => `(${ixN(p[0], 2)}, ${ixN(p[1], 2)})`;

// ---- Triangle midsegment
IX.midsegment = { subjects: ['geometry'],
  title: 'The triangle midsegment', hint: 'Drag A, B, and C (they snap to the grid). D and E are the midpoints of two sides. The midsegment DE is always parallel to BC and half as long.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const S = { A: [3, 8], B: [1, 1], C: [9, 2], all: false }, V = ixView(cv, [-1, 11], [-1, 9], 22);
    function draw() {
      ctx.clearRect(0, 0, 600, 520); ixGrid(ctx, V, { step: 1, lab: 1 }); const { A, B, C } = S, P = (p) => [V.X(p[0]), V.Y(p[1])];
      const D = ixV.mid(A, B), E = ixV.mid(A, C), F = ixV.mid(B, C);
      ixTri(ctx, [P(A), P(B), P(C)]);
      if (S.all) { ixLine(ctx, P(D), P(F), IXC.purple, 3); ixLine(ctx, P(E), P(F), IXC.purple, 3); ixDot(ctx, ...P(F), IXC.purple, 6); ixLabel(ctx, 'F', P(F)[0], P(F)[1] + 12, 20, 'center', IXC.purple); }
      ixLine(ctx, P(D), P(E), IXC.red, 4); ixLine(ctx, P(B), P(C), IXC.blue, 4);
      ixTicks(ctx, P(A), P(D), 1); ixTicks(ctx, P(D), P(B), 1); ixTicks(ctx, P(A), P(E), 2); ixTicks(ctx, P(E), P(C), 2);
      [[D, 'D'], [E, 'E']].forEach(([p, n]) => { ixDot(ctx, ...P(p), IXC.red, 6); ixName(ctx, P(p), n, P(ixV.mid(B, C)), IXC.red); });
      const cen = P([(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]); [[A, 'A'], [B, 'B'], [C, 'C']].forEach(([p, n]) => { ixDot(ctx, ...P(p), IXC.blue, 8, true); ixName(ctx, P(p), n, cen, IXC.blue); });
      const sDE = ixRatio((E[1] - D[1]) * 2, (E[0] - D[0]) * 2), sBC = ixRatio(C[1] - B[1], C[0] - B[0]), lDE = ixV.dist(D, E), lBC = ixV.dist(B, C), n2 = (C[0] - B[0]) ** 2 + (C[1] - B[1]) ** 2;
      ixRead(read, [{ h: 'Midpoints' }, `D = midpoint of AB = ${ixPt(D)}`, `E = midpoint of AC = ${ixPt(E)}`,
        { h: 'Parallel: the slopes match' }, `slope of DE = ${sDE}`, `slope of BC = ${sBC}`,
        { h: 'Half as long' }, `BC = √${n2} ≈ ${ixN(lBC, 2)}`, `DE ≈ ${ixN(lDE, 2)} = ½ · ${ixN(lBC, 2)}`,
        { note: 'Triangle Midsegment Theorem: the segment joining the midpoints of two sides is parallel to the third side and half as long.' },
        S.all ? { note: 'All three midsegments make 4 congruent triangles, each similar to ABC with scale factor ½.' } : null]);
    }
    ctl.append(ixCheck('Show all three midsegments', S.all, (v) => { S.all = v; draw(); }), el('div', { class: 'ix-btns' }, ixBtn('Reset', () => { Object.assign(S, { A: [3, 8], B: [1, 1], C: [9, 2] }); draw(); })));
    ixDrag(cv, (x, y) => ixPick({ A: [V.X(S.A[0]), V.Y(S.A[1])], B: [V.X(S.B[0]), V.Y(S.B[1])], C: [V.X(S.C[0]), V.Y(S.C[1])] }, x, y), (k, x, y) => { S[k] = [Math.max(-1, Math.min(11, Math.round(V.ix(x)))), Math.max(-1, Math.min(9, Math.round(V.iy(y))))]; draw(); });
    draw();
  } };

// ---- Quadrilateral sorter
const IX_QUADS = { par: [[1, 1], [7, 1], [9, 5], [3, 5]], rect: [[1, 1], [8, 1], [8, 5], [1, 5]], rhom: [[1, 3], [4, 0], [7, 3], [4, 6]], sq: [[2, 1], [6, 1], [6, 5], [2, 5]], trap: [[1, 1], [9, 1], [6, 5], [3, 5]].map((p, i) => (i === 3 ? [2, 5] : p)), iso: [[1, 1], [9, 1], [7, 5], [3, 5]], kite: [[5, 0], [8, 4], [5, 6], [2, 4]], any: [[1, 1], [8, 2], [7, 6], [2, 4]] };
IX.quads = { subjects: ['geometry'],
  title: 'Classifying quadrilaterals', hint: 'Drag the corners (they snap to the grid). The name and the checklist of properties update. Try to turn a parallelogram into a rectangle, a rhombus, and a square.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const S = { P: JSON.parse(JSON.stringify(IX_QUADS[o.q] || IX_QUADS.par)), diag: true }, V = ixView(cv, [-1, 11], [-1, 8], 22);
    function props() {
      const P = S.P, side = (i) => ixV.sub(P[(i + 1) % 4], P[i]), L2 = (v) => v[0] * v[0] + v[1] * v[1], cr = (a, b) => a[0] * b[1] - a[1] * b[0];
      const s = [0, 1, 2, 3].map(side), len = s.map(L2), par = (i, j) => cr(s[i], s[j]) === 0, perp = (a, b) => ixV.dot(a, b) === 0;
      const d1 = ixV.sub(P[2], P[0]), d2 = ixV.sub(P[3], P[1]);
      // simple (sides don't cross) and convex
      const turns = [0, 1, 2, 3].map((i) => cr(s[i], s[(i + 1) % 4])), convex = turns.every((t) => t > 0) || turns.every((t) => t < 0), degenerate = turns.some((t) => t === 0);
      const p02 = par(0, 2), p13 = par(1, 3), pairs = (p02 ? 1 : 0) + (p13 ? 1 : 0), rightAll = [0, 1, 2, 3].every((i) => perp(s[i], s[(i + 1) % 4]));
      const eqAll = len.every((l) => l === len[0]), oppEq = len[0] === len[2] && len[1] === len[3], bis = P[0][0] + P[2][0] === P[1][0] + P[3][0] && P[0][1] + P[2][1] === P[1][1] + P[3][1];
      const dEq = L2(d1) === L2(d2), dPerp = perp(d1, d2), kite = !eqAll && ((len[0] === len[1] && len[2] === len[3]) || (len[1] === len[2] && len[3] === len[0]));
      const isoT = pairs === 1 && (p02 ? len[1] === len[3] : len[0] === len[2]);
      let name = 'quadrilateral'; if (!convex || degenerate) name = degenerate ? 'not a quadrilateral (three corners in a line)' : 'not convex (or its sides cross)';
      else if (pairs === 2) name = rightAll && eqAll ? 'square' : rightAll ? 'rectangle' : eqAll ? 'rhombus' : 'parallelogram';
      else if (pairs === 1) name = isoT ? 'isosceles trapezoid' : 'trapezoid'; else if (kite) name = 'kite';
      return { s, len, p02, p13, pairs, rightAll, eqAll, oppEq, bis, dEq, dPerp, kite, name, convex: convex && !degenerate };
    }
    function draw() {
      ctx.clearRect(0, 0, 600, 520); ixGrid(ctx, V, { step: 1, lab: 1 }); const P = S.P.map((p) => [V.X(p[0]), V.Y(p[1])]), R = props();
      if (S.diag && R.convex) { ixLine(ctx, P[0], P[2], IXC.gray, 2, true); ixLine(ctx, P[1], P[3], IXC.gray, 2, true); }
      ixTri(ctx, P, IXC.ink, 'rgba(31,95,168,.10)', 3.4);
      if (R.convex) { // ticks: congruent sides share a tick count; arrows on parallel sides
        const groups = [...new Set(R.len)]; if (groups.length < 4) R.len.forEach((l, i) => { const n = groups.indexOf(l) + 1; if (R.len.filter((x) => x === l).length > 1) ixTicks(ctx, P[i], P[(i + 1) % 4], n, IXC.blue); });
        [0, 1, 2, 3].forEach((i) => { if (ixV.dot(R.s[i], R.s[(i + 1) % 4]) === 0) ixRightMark(ctx, P[(i + 1) % 4], P[i], P[(i + 2) % 4], IXC.red, 14); });
        const arrow = (i, n) => { const a = P[i], b = P[(i + 1) % 4], m = ixV.mid(a, b), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (let k = 0; k < n; k++) { ctx.save(); ctx.translate(m[0] + Math.cos(ang) * (k * 10 + 14), m[1] + Math.sin(ang) * (k * 10 + 14)); ctx.rotate(ang); ctx.strokeStyle = IXC.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(1, 0); ctx.lineTo(-6, 6); ctx.stroke(); ctx.restore(); } };
        if (R.p02) { arrow(0, 1); arrow(3, 0); ctx.save(); const a = P[2], b = P[3], m = ixV.mid(a, b), ang = Math.atan2(a[1] - b[1], a[0] - b[0]); ctx.translate(m[0] + Math.cos(ang) * 14, m[1] + Math.sin(ang) * 14); ctx.rotate(ang); ctx.strokeStyle = IXC.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(1, 0); ctx.lineTo(-6, 6); ctx.stroke(); ctx.restore(); }
        if (R.p13) { arrow(1, 2); const a = P[0], b = P[3], m = ixV.mid(a, b), ang = Math.atan2(a[1] - b[1], a[0] - b[0]); for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate(m[0] + Math.cos(ang) * (k * 10 + 14), m[1] + Math.sin(ang) * (k * 10 + 14)); ctx.rotate(ang); ctx.strokeStyle = IXC.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(1, 0); ctx.lineTo(-6, 6); ctx.stroke(); ctx.restore(); } }
      }
      const cen = ixV.mul(P.reduce((a, b) => ixV.add(a, b), [0, 0]), 0.25); P.forEach((p, i) => { ixDot(ctx, ...p, IXC.blue, 8, true); ixName(ctx, p, 'ABCD'[i], cen, IXC.blue); });
      ixLabel(ctx, R.name[0].toUpperCase() + R.name.slice(1), 300, 8, 26, 'center', R.convex ? IXC.green : IXC.red);
      const ck = (b, t) => (b ? '✓ ' : '✗ ') + t;
      ixRead(read, [{ h: `It’s a ${R.name}` }, ...(R.convex ? [
        { h: 'Sides' }, ck(R.p02 && R.p13, 'both pairs of opposite sides parallel'), ck(R.pairs === 1, 'exactly one pair of parallel sides'), ck(R.oppEq, 'opposite sides congruent'), ck(R.eqAll, 'all four sides congruent'), ck(R.kite, 'two pairs of adjacent sides congruent (kite)'),
        { h: 'Angles' }, ck(R.rightAll, 'four right angles'),
        { h: 'Diagonals' }, ck(R.bis, 'bisect each other'), ck(R.dEq, 'congruent'), ck(R.dPerp, 'perpendicular'),
        { note: 'Every square is a rectangle and a rhombus; every rectangle and rhombus is a parallelogram.' }] : [{ note: 'Drag a corner so the four sides don’t cross.', bad: true }])]);
    }
    ctl.append(el('div', { class: 'ix-btns' }, ...[['par', 'Parallelogram'], ['rect', 'Rectangle'], ['rhom', 'Rhombus'], ['sq', 'Square'], ['trap', 'Trapezoid'], ['iso', 'Isosceles trapezoid'], ['kite', 'Kite'], ['any', 'Any']].map(([k, t]) => ixBtn(t, () => { S.P = JSON.parse(JSON.stringify(IX_QUADS[k])); draw(); }))),
      ixCheck('Show the diagonals', S.diag, (v) => { S.diag = v; draw(); }));
    ixDrag(cv, (x, y) => ixPick(Object.fromEntries(S.P.map((p, i) => [i, [V.X(p[0]), V.Y(p[1])]])), x, y), (k, x, y) => { S.P[k] = [Math.max(-1, Math.min(11, Math.round(V.ix(x)))), Math.max(-1, Math.min(8, Math.round(V.iy(y))))]; draw(); });
    draw();
  } };

// ---- Special right triangles
IX.specialTri = { subjects: ['geometry', 'precalc'],
  title: 'Special right triangles', hint: 'Pick 45°-45°-90° or 30°-60°-90° and slide x. The sides always keep the same pattern. The dashed half shows where each one comes from.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: o.k === '30' ? '30' : '45', x: 3, half: true };
    function draw() {
      ctx.clearRect(0, 0, 600, 500); const x = S.x, is45 = S.k === '45', u = is45 ? 330 / x : Math.min(215 / x, 420 / (x * Math.sqrt(3)));
      const legB = is45 ? x : x * Math.sqrt(3), legA = x, ox = 90, oy = is45 ? 450 : 250 + 0 * u, C = [ox, oy], B = [ox + legB * u, oy], A = [ox, oy - legA * u];
      if (S.half) { if (is45) { ixTri(ctx, [A, B, [B[0], A[1]]], IXC.gray, 'rgba(0,0,0,.03)', 2, true); ixLabel(ctx, 'half of a square', (A[0] + B[0]) / 2 + 30, A[1] - 26, 15, 'center', IXC.gray); }
        else { const A2 = [ox, oy + legA * u]; if (A2[1] < 495) { ixTri(ctx, [A2, C, B], IXC.gray, 'rgba(0,0,0,.03)', 2, true); } ixLabel(ctx, 'half of an equilateral triangle', B[0] - 10, A[1] - 6, 15, 'right', IXC.gray); } }
      ixTri(ctx, [A, B, C], IXC.ink, 'rgba(31,95,168,.10)', 3.4); ixRightMark(ctx, C, A, B, IXC.ink, 16);
      ixAngMark(ctx, B, A, C, 40, IXC.green, is45 ? '45°' : '30°'); ixAngMark(ctx, A, B, C, 34, IXC.orange, is45 ? '45°' : '60°');
      const sides = is45 ? [ixN(x), ixN(x), ixRad(x, 2)] : [ixN(x), ixRad(x, 3), ixN(2 * x)];
      ixLabel(ctx, sides[0], C[0] - 14, (A[1] + C[1]) / 2, 22, 'right', IXC.blue, 'middle'); ixLabel(ctx, sides[1], (B[0] + C[0]) / 2, C[1] + 10, 22, 'center', IXC.blue);
      const m = ixV.mid(A, B); ixLabel(ctx, sides[2], m[0] + 14, m[1] - 14, 22, 'left', IXC.red, 'bottom');
      ixRead(read, is45 ? [{ h: '45°-45°-90°' }, 'leg : leg : hypotenuse = x : x : x√2', `= ${sides.join(' : ')}`, `hypotenuse ≈ ${ixN(x * Math.SQRT2, 3)}`,
        { h: 'Working backward' }, 'leg = hypotenuse/√2 = (hypotenuse · √2)/2', { note: 'It’s half of a square: the hypotenuse is the square’s diagonal. By the Pythagorean theorem, x² + x² = 2x², so the hypotenuse is x√2.' }]
        : [{ h: '30°-60°-90°' }, 'short leg : long leg : hypotenuse = x : x√3 : 2x', `= ${sides.join(' : ')}`, `long leg ≈ ${ixN(x * Math.sqrt(3), 3)}`,
          { h: 'Working backward' }, 'short leg = hypotenuse/2', 'short leg = long leg/√3', { note: 'It’s half of an equilateral triangle with side 2x, so the hypotenuse is twice the short leg (across from 30°). The long leg (across from 60°) is x√3.' }]);
    }
    ctl.append(ixSeg([['45', '45°-45°-90°'], ['30', '30°-60°-90°']], S.k, (k) => { S.k = k; draw(); }), ixSlider('x', 1, 6, 0.5, S.x, (v) => ixN(v), (v) => { S.x = v; draw(); }),
      ixCheck('Show where it comes from (dashed)', S.half, (v) => { S.half = v; draw(); }));
    draw();
  } };

// ---- Triangle Proportionality Theorem
IX.proportion = { subjects: ['geometry'],
  title: 'Triangle proportionality', hint: 'Slide the line DE. While DE stays parallel to BC, it splits the two sides in the same ratio. Check “Move E by itself” to see the converse.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { A: [250, 50], B: [60, 450], C: [540, 450], t: 0.4, s: 0.4, free: false }, u = 40;
    function draw() {
      ctx.clearRect(0, 0, 600, 500); const { A, B, C } = S, D = ixV.add(A, ixV.mul(ixV.sub(B, A), S.t)), E = ixV.add(A, ixV.mul(ixV.sub(C, A), S.free ? S.s : S.t));
      ixTri(ctx, [A, B, C]); const par = Math.abs((S.free ? S.s : S.t) - S.t) < 0.005;
      ixLine(ctx, D, E, par ? IXC.red : IXC.orange, 4);
      const d = (p, q) => ixV.dist(p, q) / u, AD = d(A, D), DB = d(D, B), AE = d(A, E), EC = d(E, C);
      const lab = (p, q, t, col, side) => { const m = ixV.mid(p, q), n = ixV.sub(q, p), L = ixV.len(n); ixLabel(ctx, t, m[0] + side * n[1] / L * 26, m[1] - side * n[0] / L * 26, 19, 'center', col, 'middle'); };
      lab(A, D, ixN(AD, 1), IXC.blue, 1); lab(D, B, ixN(DB, 1), IXC.green, 1); lab(A, E, ixN(AE, 1), IXC.blue, -1); lab(E, C, ixN(EC, 1), IXC.green, -1);
      const cen = ixV.mul(ixV.add(ixV.add(A, B), C), 1 / 3); [[A, 'A'], [B, 'B'], [C, 'C']].forEach(([p, n]) => { ixDot(ctx, ...p, IXC.ink, 6); ixName(ctx, p, n, cen); });
      [[D, 'D', B], [E, 'E', C]].forEach(([p, n]) => { ixDot(ctx, ...p, par ? IXC.red : IXC.orange, 8, true); ixLabel(ctx, n, p[0] + (n === 'D' ? -26 : 18), p[1] - 10, 21, 'center', par ? IXC.red : IXC.orange, 'middle'); });
      ixRead(read, [{ h: 'The ratios' }, `AD/DB = ${ixN(AD, 1)}/${ixN(DB, 1)} = ${ixN(AD / DB, 3)}`, `AE/EC = ${ixN(AE, 1)}/${ixN(EC, 1)} = ${ixN(AE / EC, 3)}`,
        par ? { note: 'DE ∥ BC, and the ratios are equal: the Triangle Proportionality Theorem.', good: true } : { note: 'The ratios are different, so DE is not parallel to BC (the converse).', bad: true },
        { h: 'Also' }, `DE/BC = AD/AB = ${ixN(AD / (AD + DB), 3)}`, { note: 'Triangle ADE is similar to triangle ABC (AA), so DE is that same fraction of BC.' }]);
    }
    const sE = ixSlider('E along AC', 0.1, 0.9, 0.01, S.s, (v) => ixN(v, 2), (v) => { S.s = v; draw(); }); sE.style.display = 'none';
    ctl.append(ixSlider('D along AB', 0.1, 0.9, 0.01, S.t, (v) => ixN(v, 2), (v) => { S.t = v; if (!S.free) { S.s = v; sE.set(v); } draw(); }),
      ixCheck('Move E by itself (the converse)', S.free, (v) => { S.free = v; sE.style.display = v ? '' : 'none'; S.s = S.t; sE.set(S.t); draw(); }), sE,
      el('div', { class: 'small' }, 'Drag A, B, or C to change the triangle.'));
    ixDrag(cv, (x, y) => ixPick({ A: S.A, B: S.B, C: S.C }, x, y), (k, x, y) => { S[k] = [Math.max(20, Math.min(580, x)), Math.max(20, Math.min(480, y))]; draw(); });
    draw();
  } };

// ---- Segments of chords, secants, and tangents
IX.circleSegs = { subjects: ['geometry'],
  title: 'Segments of chords, secants, and tangents', hint: 'Drag the points. The products of the segment lengths stay equal: part · part for two chords, outside · whole for secants, and tangent² for a tangent.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const r = 4, V = ixView(cv, [-6, 10], [-6.9, 6.9], 20), S = { mode: ['chords', 'secants', 'tangent'].includes(o.mode) ? o.mode : 'chords', a: [150, 330, 70, 230], P: [8, 1.5], b: [20, -25] };
    const on = (deg) => [r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180)], X = (p) => [V.X(p[0]), V.Y(p[1])], d = ixV.dist;
    const hit = (P, Q) => { const L = d(P, Q), u = ixV.mul(ixV.sub(Q, P), 1 / L), b = ixV.dot(P, u), c = ixV.dot(P, P) - r * r, D = Math.sqrt(Math.max(0, b * b - c)); return [ixV.add(P, ixV.mul(u, -b - D)), ixV.add(P, ixV.mul(u, -b + D))]; };
    function draw() {
      ctx.clearRect(0, 0, 600, 520); ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), r * V.sx, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); ixDot(ctx, ...X([0, 0]), IXC.gray, 3);
      let L = [];
      const seg = (p, q, col, w = 4) => ixLine(ctx, X(p), X(q), col, w), lab = (p, q, col, side = 1) => { const m = X(ixV.mid(p, q)), n = ixV.sub(X(q), X(p)), Ln = ixV.len(n) || 1; ixLabel(ctx, ixN(d(p, q), 2), m[0] + side * n[1] / Ln * 18, m[1] - side * n[0] / Ln * 18, 16, 'center', col, 'middle'); };
      if (S.mode === 'chords') { const [A, B, C, D] = S.a.map(on), E = ixMeet(A, B, C, D);
        seg(A, B, IXC.blue, 3); seg(C, D, IXC.green, 3);
        const inside = E && ixV.len(E) < r - 1e-6 && ixV.dot(ixV.sub(A, E), ixV.sub(B, E)) < 0 && ixV.dot(ixV.sub(C, E), ixV.sub(D, E)) < 0;
        if (inside) { lab(A, E, IXC.blue); lab(E, B, IXC.blue); lab(C, E, IXC.green, -1); lab(E, D, IXC.green, -1); ixDot(ctx, ...X(E), IXC.red, 7); ixLabel(ctx, 'E', X(E)[0] + 10, X(E)[1] + 6, 19, 'left', IXC.red);
          L = [{ h: 'Two chords: part · part = part · part' }, `EA · EB = ${ixN(d(E, A), 2)} · ${ixN(d(E, B), 2)} = ${ixN(d(E, A) * d(E, B), 2)}`, `EC · ED = ${ixN(d(E, C), 2)} · ${ixN(d(E, D), 2)} = ${ixN(d(E, C) * d(E, D), 2)}`, { note: 'Segments of Chords Theorem.', good: true }]; }
        else L = [{ note: 'Drag the points so the chords cross inside the circle.', bad: true }];
        [A, B, C, D].forEach((p, i) => { ixDot(ctx, ...X(p), i < 2 ? IXC.blue : IXC.green, 8, true); ixName(ctx, X(p), 'ABCD'[i], X([0, 0]), i < 2 ? IXC.blue : IXC.green); });
      } else { const P = S.P, far1 = on(S.b[0]), [A1, B1] = hit(P, far1);
        if (S.mode === 'secants') { const far2 = on(S.b[1]), [C1, D1] = hit(P, far2);
          seg(P, B1, IXC.blue, 3); seg(P, D1, IXC.green, 3); lab(P, A1, IXC.blue); lab(A1, B1, IXC.blue); lab(P, C1, IXC.green, -1); lab(C1, D1, IXC.green, -1);
          [[A1, 'A', IXC.blue], [B1, 'B', IXC.blue], [C1, 'C', IXC.green], [D1, 'D', IXC.green]].forEach(([p, n, c]) => { ixDot(ctx, ...X(p), c, 6); ixName(ctx, X(p), n, X([0, 0]), c); });
          L = [{ h: 'Two secants: outside · whole' }, `PA · PB = ${ixN(d(P, A1), 2)} · ${ixN(d(P, B1), 2)} = ${ixN(d(P, A1) * d(P, B1), 2)}`, `PC · PD = ${ixN(d(P, C1), 2)} · ${ixN(d(P, D1), 2)} = ${ixN(d(P, C1) * d(P, D1), 2)}`, { note: 'Segments of Secants Theorem: the outside part times the whole secant.', good: true }];
        } else { const Lp = ixV.len(P), al = Math.acos(r / Lp), ph = Math.atan2(P[1], P[0]), T = [r * Math.cos(ph + al), r * Math.sin(ph + al)];
          seg(P, T, IXC.red, 3); seg(P, B1, IXC.blue, 3); ixRightMark(ctx, X(T), X(P), X([0, 0]), IXC.gray, 12); ixLine(ctx, X([0, 0]), X(T), IXC.gray, 1.6, true);
          lab(P, T, IXC.red, -1); lab(P, A1, IXC.blue); lab(A1, B1, IXC.blue); ixDot(ctx, ...X(T), IXC.red, 6); ixName(ctx, X(T), 'T', X([0, 0]), IXC.red);
          [[A1, 'A'], [B1, 'B']].forEach(([p, n]) => { ixDot(ctx, ...X(p), IXC.blue, 6); ixName(ctx, X(p), n, X([0, 0]), IXC.blue); });
          L = [{ h: 'Tangent and secant: tangent² = outside · whole' }, `PT² = ${ixN(d(P, T), 2)}² = ${ixN(d(P, T) ** 2, 2)}`, `PA · PB = ${ixN(d(P, A1), 2)} · ${ixN(d(P, B1), 2)} = ${ixN(d(P, A1) * d(P, B1), 2)}`, { note: 'A tangent is perpendicular to the radius at T.', good: true }]; }
        ixDot(ctx, ...X(P), IXC.red, 8, true); ixLabel(ctx, 'P', X(P)[0] + 12, X(P)[1] - 8, 21, 'left', IXC.red, 'bottom');
        if (S.mode === 'secants' || S.mode === 'tangent') ixDot(ctx, ...X(on(S.b[0])), IXC.blue, 9, true); if (S.mode === 'secants') ixDot(ctx, ...X(on(S.b[1])), IXC.green, 9, true);
      }
      ixRead(read, L);
    }
    ctl.append(ixSeg([['chords', 'Two chords'], ['secants', 'Two secants'], ['tangent', 'Tangent and secant']], S.mode, (k) => { S.mode = k; draw(); }), el('div', { class: 'small' }, 'Drag the colored points on the circle, and P outside it.'));
    ixDrag(cv, (x, y) => { const h = {}; if (S.mode === 'chords') S.a.forEach((a, i) => (h['a' + i] = X(on(a)))); else { h.P = X(S.P); h.b0 = X(on(S.b[0])); if (S.mode === 'secants') h.b1 = X(on(S.b[1])); } return ixPick(h, x, y, 34); },
      (k, x, y) => { const p = [V.ix(x), V.iy(y)]; if (k === 'P') { const L = ixV.len(p); S.P = L < r + 0.6 ? ixV.mul(p, (r + 0.6) / (L || 1)) : [Math.min(9.5, p[0]), Math.max(-6.5, Math.min(6.5, p[1]))]; }
        else { const deg = Math.atan2(p[1], p[0]) * 180 / Math.PI; if (k[0] === 'a') S.a[+k[1]] = deg; else S.b[+k[1]] = deg; } draw(); });
    draw();
  } };

// ---- Equations of circles
IX.circleEq = { subjects: ['geometry', 'precalc', 'algebra2'],
  title: 'Equations of circles', hint: 'Drag the center and slide the radius. Drag the red point around the circle: its distance to the center is always r. Switch to general form to see completing the square.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { h: 2, k: -1, r: 3, t: 50, gen: false }, V = ixView(cv, [-9, 9], [-9, 9], 22);
    const sgn = (v, n) => (v === 0 ? n : `(${n} ${v > 0 ? '−' : '+'} ${Math.abs(v)})`);
    function draw() {
      ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: 1, lab: 2 }); const { h, k, r } = S, P = [h + r * Math.cos(S.t * Math.PI / 180), k + r * Math.sin(S.t * Math.PI / 180)];
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(V.X(h), V.Y(k), r * V.sx, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
      ixLine(ctx, [V.X(h), V.Y(k)], [V.X(P[0]), V.Y(P[1])], IXC.red, 2.4); ixLine(ctx, [V.X(h), V.Y(k)], [V.X(P[0]), V.Y(k)], IXC.gray, 1.6, true); ixLine(ctx, [V.X(P[0]), V.Y(k)], [V.X(P[0]), V.Y(P[1])], IXC.gray, 1.6, true);
      ixDot(ctx, V.X(h), V.Y(k), IXC.blue, 8, true); ixDot(ctx, V.X(P[0]), V.Y(P[1]), IXC.red, 7, true);
      const std = `${sgn(h, 'x')}² + ${sgn(k, 'y')}² = ${r * r}`, D = -2 * h, E = -2 * k, F = h * h + k * k - r * r, term = (c, t) => (c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 && t ? '' : Math.abs(c)}${t}` : '');
      const gen = `x² + y²${term(D, 'x')}${term(E, 'y')}${term(F, '')} = 0`;
      const L = [{ h: 'Standard form' }, '(x − h)² + (y − k)² = r²', std, `center (${h}, ${k}), radius ${r}`,
        { h: 'The red point' }, `(${ixN(P[0], 2)}, ${ixN(P[1], 2)}) is ${r} from the center:`, `${sgn(h, ixN(P[0], 2))}² + ${sgn(k, ixN(P[1], 2))}² ≈ ${ixN((P[0] - h) ** 2 + (P[1] - k) ** 2, 2)}`, { note: 'The equation is the Distance Formula (the Pythagorean theorem) squared.' }];
      if (S.gen) L.push({ h: 'General form → standard form' }, gen, `x²${term(D, 'x')} + y²${term(E, 'y')} = ${-F}`, `add (${ixN(D / 2)})² = ${D * D / 4} and (${ixN(E / 2)})² = ${E * E / 4} to both sides:`,
        `(x²${term(D, 'x')} + ${D * D / 4}) + (y²${term(E, 'y')} + ${E * E / 4}) = ${-F + D * D / 4 + E * E / 4}`, std, { note: 'Complete the square for x and for y: take half the coefficient and square it.' });
      ixRead(read, L);
    }
    ctl.append(ixSlider('radius r', 1, 7, 1, S.r, String, (v) => { S.r = v; draw(); }), ixCheck('Show general form and completing the square', S.gen, (v) => { S.gen = v; draw(); }), el('div', { class: 'small' }, 'Drag the blue center or the red point.'));
    ixDrag(cv, (x, y) => ixPick({ c: [V.X(S.h), V.Y(S.k)], p: [V.X(S.h + S.r * Math.cos(S.t * Math.PI / 180)), V.Y(S.k + S.r * Math.sin(S.t * Math.PI / 180))] }, x, y, 30),
      (q, x, y) => { if (q === 'c') { S.h = Math.max(-8, Math.min(8, Math.round(V.ix(x)))); S.k = Math.max(-8, Math.min(8, Math.round(V.iy(y)))); } else S.t = Math.atan2(V.iy(y) - S.k, V.ix(x) - S.h) * 180 / Math.PI; draw(); });
    draw();
  } };

// ---- Cross sections of solids
const IX_SOLID3 = {
  cube: { name: 'Cube', inside: (x, y, z) => Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) <= 1 },
  cyl: { name: 'Cylinder', inside: (x, y, z) => x * x + y * y <= 1 && Math.abs(z) <= 1 },
  cone: { name: 'Cone', inside: (x, y, z) => Math.abs(z) <= 1 && Math.hypot(x, y) <= (1 - z) / 2 },
  pyr: { name: 'Square pyramid', inside: (x, y, z) => Math.abs(z) <= 1 && Math.max(Math.abs(x), Math.abs(y)) <= (1 - z) / 2 },
  sphere: { name: 'Sphere', inside: (x, y, z) => x * x + y * y + z * z <= 1 } };
IX.crossSection = { subjects: ['geometry'],
  title: 'Cross sections of solids', hint: 'Pick a solid and how the plane cuts it, then slide the plane. The red shape is the cross section; it’s also drawn flat on the right. Drag the solid to turn it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(820, 460), ctx = cv._ctx; main.append(cv);
    const S = { s: IX_SOLID3[o.solid] ? o.solid : 'cube', cut: 'horiz', d: 0.2, az: -0.6, el: 0.35 };
    const plane = () => { const t = 35 * Math.PI / 180, r3 = 1 / Math.sqrt(3);
      if (S.cut === 'horiz') return { n: [0, 0, 1], e1: [1, 0, 0], e2: [0, 1, 0] }; if (S.cut === 'vert') return { n: [1, 0, 0], e1: [0, 1, 0], e2: [0, 0, 1] };
      if (S.cut === 'tilt') return { n: [0, -Math.sin(t), Math.cos(t)], e1: [1, 0, 0], e2: [0, Math.cos(t), Math.sin(t)] };
      return { n: [r3, r3, r3], e1: [Math.SQRT1_2, -Math.SQRT1_2, 0], e2: [-1 / Math.sqrt(6), -1 / Math.sqrt(6), 2 / Math.sqrt(6)] }; };
    const at = (p, u, v, P) => [P.n[0] * p + P.e1[0] * u + P.e2[0] * v, P.n[1] * p + P.e1[1] * u + P.e2[1] * v, P.n[2] * p + P.e1[2] * u + P.e2[2] * v];
    function section() { const P = plane(), f = IX_SOLID3[S.s].inside, ins = (u, v) => f(...at(S.d, u, v, P)); let cu = 0, cv2 = 0, n = 0;
      for (let u = -1.8; u <= 1.8; u += 0.04) for (let v = -1.8; v <= 1.8; v += 0.04) if (ins(u, v)) { cu += u; cv2 += v; n++; }
      if (n < 3) return null; cu /= n; cv2 /= n; const pts = [];
      for (let i = 0; i < 180; i++) { const a = i * Math.PI / 90, du = Math.cos(a), dv = Math.sin(a); let lo = 0, hi = 3; for (let j = 0; j < 22; j++) { const m = (lo + hi) / 2; if (ins(cu + du * m, cv2 + dv * m)) lo = m; else hi = m; } pts.push([cu + du * lo, cv2 + dv * lo]); }
      return { pts, P, area: n * 0.0016 }; }
    function shapeName(sec) {
      const s = S.s, c = S.cut, d = S.d; if (!sec) return 'nothing (the plane misses the solid)';
      const hitsEnd = (z0) => sec.pts.some(([u, v]) => Math.abs(at(d, u, v, sec.P)[2] - z0) < 0.03);
      if (s === 'sphere') return 'a circle'; if (s === 'cube') { if (c === 'corner') return Math.abs(d) * Math.sqrt(3) > 1 ? 'a triangle (equilateral)' : Math.abs(d) < 0.02 ? 'a regular hexagon' : 'a hexagon'; return c === 'tilt' ? 'a rectangle' : 'a square'; }
      if (s === 'cyl') return c === 'horiz' ? 'a circle' : c === 'vert' ? 'a rectangle' : hitsEnd(1) || hitsEnd(-1) ? 'part of an ellipse, cut off by a flat end' : 'an ellipse';
      if (s === 'cone') return c === 'horiz' ? 'a circle' : c === 'vert' ? (Math.abs(d) < 0.02 ? 'a triangle' : 'a region bounded by a hyperbola') : hitsEnd(-1) ? 'part of an ellipse, cut off by the base' : 'an ellipse';
      return c === 'horiz' ? 'a square' : c === 'vert' ? (Math.abs(d) < 0.02 ? 'a triangle' : 'a trapezoid') : 'a trapezoid'; }
    function draw() {
      ctx.clearRect(0, 0, 820, 460); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 465, 460); ctx.clip(); const T = ix3(230, 240, 125, S), P = plane(), sec = section(), seg = (a, b, col = IXC.ink, w = 2.2) => ixLine(ctx, T(a), T(b), col, w);
      // the solid (wireframe)
      const s = S.s, circ = (z, r, col = IXC.ink) => { const pts = []; for (let i = 0; i <= 72; i++) pts.push(T([r * Math.cos(i * Math.PI / 36), r * Math.sin(i * Math.PI / 36), z])); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore(); };
      const sil = [-S.az, Math.PI - S.az].map((a) => [Math.cos(a), Math.sin(a)]);
      if (s === 'cube') { const v = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) v.push([x, y, z]); v.forEach((a, i) => v.forEach((b, j) => { if (j > i && ixV.dist([a[0], a[1]], [b[0], b[1]]) + Math.abs(a[2] - b[2]) === 2 && (a[0] === b[0]) + (a[1] === b[1]) + (a[2] === b[2]) === 2) seg(a, b); })); }
      else if (s === 'cyl') { circ(1, 1); circ(-1, 1); sil.forEach(([x, y]) => seg([x, y, -1], [x, y, 1])); }
      else if (s === 'cone') { circ(-1, 1); sil.forEach(([x, y]) => seg([x, y, -1], [0, 0, 1])); }
      else if (s === 'pyr') { const b = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]]; b.forEach((p, i) => { seg(p, b[(i + 1) % 4]); seg(p, [0, 0, 1]); }); }
      else { ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(230, 240, 125, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); circ(0, 1, IXC.gray); }
      // the plane
      const q = [[-1.7, -1.7], [1.7, -1.7], [1.7, 1.7], [-1.7, 1.7]].map(([u, v]) => T(at(S.d, u, v, P))); ix3Poly(ctx, q, 'rgba(31,95,168,.10)', 'rgba(31,95,168,.45)', 1.6);
      if (sec) ix3Poly(ctx, sec.pts.map(([u, v]) => T(at(S.d, u, v, P))), 'rgba(181,72,43,.45)', IXC.red, 2.6);
      ctx.restore();
      // flat view
      ixLine(ctx, [470, 20], [470, 440], '#e4e1d9', 2); ixLabel(ctx, 'the cross section, flat', 645, 16, 15, 'center', IXC.gray);
      if (sec) ix3Poly(ctx, sec.pts.map(([u, v]) => [645 + u * 95, 240 - v * 95]), 'rgba(181,72,43,.30)', IXC.red, 3);
      const nm = shapeName(sec); ixLabel(ctx, nm[0].toUpperCase() + nm.slice(1), 645, 420, 18, 'center', IXC.red);
      ixRead(read, [{ h: IX_SOLID3[s].name }, `cut ${{ horiz: 'parallel to the base', vert: 'perpendicular to the base', tilt: 'at a slant', corner: 'across a corner' }[S.cut]}`, { h: 'Cross section' }, nm,
        { note: s === 'cube' && S.cut === 'corner' ? 'Near a corner the plane cuts three faces (a triangle); through the middle it cuts all six (a hexagon).' : 'A cut parallel to the base makes a copy of the base. Other cuts can make surprising shapes.' }]);
    }
    const cutSeg = () => ixSeg([['horiz', 'Parallel to base'], ['vert', 'Perpendicular'], ['tilt', 'Slanted'], ...(S.s === 'cube' ? [['corner', 'Across a corner']] : [])], S.cut, (k) => { S.cut = k; draw(); });
    let cs = cutSeg(); const dS = ixSlider('move the plane', -1.2, 1.2, 0.02, S.d, (v) => ixN(v, 2), (v) => { S.d = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_SOLID3).map(([k, D]) => [k, D.name]), S.s, (k) => { S.s = k; if (k !== 'cube' && S.cut === 'corner') S.cut = 'horiz'; const n = cutSeg(); cs.replaceWith(n); cs = n; draw(); }), cs, dS, el('div', { class: 'small' }, 'Drag the picture to turn it.'));
    ix3Turn(cv, S, draw); draw();
  } };

// ---- Similar solids: k, k², k³
IX.similarSolids = { subjects: ['geometry'],
  title: 'Similar solids', hint: 'Slide the scale factor k. Lengths multiply by k, surface areas by k², and volumes by k³.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(700, 460), ctx = cv._ctx; main.append(cv);
    const S = { k: 2, shape: o.shape === 'cyl' ? 'cyl' : 'box' }, l = 2, w = 1, h = 1.5, r = 1;
    function box(ox, oy, s, k, col) { const P = (x, y, z) => [ox + x * s + y * s * 0.5, oy - z * s - y * s * 0.35], L = l * k, W = w * k, H = h * k;
      const b = [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], t = [P(0, 0, H), P(L, 0, H), P(L, W, H), P(0, W, H)];
      ixLine(ctx, b[3], b[0], IXC.gray, 1.6, true); ixLine(ctx, b[3], b[2], IXC.gray, 1.6, true); ixLine(ctx, b[3], t[3], IXC.gray, 1.6, true);
      ix3Poly(ctx, [b[0], b[1], t[1], t[0]], col + '22', col, 2.4); ix3Poly(ctx, [b[1], b[2], t[2], t[1]], col + '18', col, 2.4); ix3Poly(ctx, t, col + '30', col, 2.4);
      ixLabel(ctx, ixN(L), (b[0][0] + b[1][0]) / 2, b[0][1] + 8, 17, 'center', col); ixLabel(ctx, ixN(H), b[0][0] - 8, (b[0][1] + t[0][1]) / 2, 17, 'right', col, 'middle'); ixLabel(ctx, ixN(W), (b[1][0] + b[2][0]) / 2 + 8, (b[1][1] + b[2][1]) / 2, 17, 'left', col, 'middle'); }
    function cyl(cx, by, s, k, col) { const R = r * k * s, H = h * 1.4 * k * s, ry = R * 0.3;
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.fillStyle = col + '1c'; ctx.fillRect(cx - R, by - H, 2 * R, H); ctx.beginPath(); ctx.ellipse(cx, by, R, ry, 0, 0, Math.PI); ctx.stroke(); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.ellipse(cx, by, R, ry, 0, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(cx - R, by); ctx.lineTo(cx - R, by - H); ctx.moveTo(cx + R, by); ctx.lineTo(cx + R, by - H); ctx.stroke(); ctx.fillStyle = col + '30'; ctx.beginPath(); ctx.ellipse(cx, by - H, R, ry, 0, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore();
      ixLine(ctx, [cx, by - H], [cx + R, by - H], col, 2); ixLabel(ctx, 'r = ' + ixN(r * k), cx + R / 2, by - H - ry - 6, 17, 'center', col, 'bottom'); ixLabel(ctx, 'h = ' + ixN(h * 1.4 * k), cx + R + 8, by - H / 2, 17, 'left', col, 'middle'); }
    function draw() {
      ctx.clearRect(0, 0, 700, 460); const k = S.k, s = Math.min(90, 560 / ((l + w / 2) * (1 + k)), 330 / (h * Math.max(1, k) * (S.shape === 'cyl' ? 1.4 : 1) + 1));
      if (S.shape === 'box') { box(30, 420, s, 1, IXC.blue); box(70 + (l + w / 2) * s, 420, s, k, IXC.red); }
      else { cyl(30 + r * s, 410, s, 1, IXC.blue); cyl(90 + 2 * r * s + r * k * s, 410, s, k, IXC.red); }
      let SA1, V1; if (S.shape === 'box') { SA1 = 2 * (l * w + l * h + w * h); V1 = l * w * h; } else { const H = h * 1.4; SA1 = 2 * Math.PI * r * r + 2 * Math.PI * r * H; V1 = Math.PI * r * r * H; }
      ixRead(read, [{ h: `Scale factor k = ${ixN(k)}` }, `lengths: × ${ixN(k)}`, `surface area: × ${ixN(k)}² = × ${ixN(k * k)}`, `volume: × ${ixN(k)}³ = × ${ixN(k ** 3, 3)}`,
        { h: 'Blue (small) → red (large)' }, `S: ${ixN(SA1, 2)} → ${ixN(SA1 * k * k, 2)} square units`, `V: ${ixN(V1, 2)} → ${ixN(V1 * k ** 3, 2)} cubic units`,
        { note: 'Working backward: if the volumes are in the ratio 8 : 27, the scale factor is ∛8 : ∛27 = 2 : 3, and the surface areas are 4 : 9.' }]);
    }
    ctl.append(ixSeg([['box', 'Prisms'], ['cyl', 'Cylinders']], S.shape, (k) => { S.shape = k; draw(); }), ixSlider('scale factor k', 0.5, 3, 0.5, S.k, (v) => ixN(v), (v) => { S.k = v; draw(); }));
    draw();
  } };

// ---- Solids of revolution
const IX_REVS = {
  rect: { name: 'Rectangle → cylinder', prof: (r, h) => [[0, 0], [r, 0], [r, h], [0, h]], V: (r, h) => [`V = πr²h = π(${r})²(${h})`, Math.PI * r * r * h] },
  tri: { name: 'Right triangle → cone', prof: (r, h) => [[0, 0], [r, 0], [0, h]], V: (r, h) => [`V = (1/3)πr²h = (1/3)π(${r})²(${h})`, Math.PI * r * r * h / 3] },
  semi: { name: 'Semicircle → sphere', prof: (r) => Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 24; return [r * Math.cos(a), r + r * Math.sin(a)]; }), V: (r) => [`V = (4/3)πr³ = (4/3)π(${r})³`, 4 * Math.PI * r ** 3 / 3] },
  tube: { name: 'Rectangle off the axis → tube', prof: (r, h) => [[1, 0], [1 + r, 0], [1 + r, h], [1, h]], V: (r, h) => [`V = π(${1 + r})²(${h}) − π(1)²(${h})`, Math.PI * ((1 + r) ** 2 - 1) * h] } };
IX.revolve = { subjects: ['geometry'],
  title: 'Solids of revolution', hint: 'Pick a flat shape and spin it around the axis (press ▶ or slide). It sweeps out a solid. Drag the picture to turn it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_REVS[o.shape] ? o.shape : 'tri', r: 2, h: 3, spin: 360, az: -0.5, el: 0.3, play: null };
    function draw() {
      ctx.clearRect(0, 0, 640, 500); const R = IX_REVS[S.k], prof = R.prof(S.r, S.h), top = Math.max(...prof.map((p) => p[1])), sc = Math.min(70, 300 / top, 200 / (Math.max(...prof.map((p) => p[0])) + 0.2));
      const T = ix3(320, 260 + top * sc * 0.45, sc, S), at = (p, a) => [p[0] * Math.cos(a), p[0] * Math.sin(a), p[1]], sp = S.spin * Math.PI / 180;
      ixLine(ctx, T([0, 0, -0.6]), T([0, 0, top + 0.8]), IXC.gray, 2, true); ixLabel(ctx, 'axis', T([0, 0, top + 0.8])[0] + 8, T([0, 0, top + 0.8])[1], 15, 'left', IXC.gray);
      for (let a = 0; a < sp - 1e-6; a += Math.PI / 8) ix3Poly(ctx, prof.map((p) => T(at(p, a))), null, 'rgba(31,95,168,.35)', 1.2);
      prof.forEach((p, j) => { if (p[0] < 1e-9 || (S.k === 'semi' && j % 3)) return; ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 72; i++) { const q = T(at(p, sp * i / 72)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); ctx.restore(); });
      ix3Poly(ctx, prof.map((p) => T(at(p, 0))), 'rgba(181,72,43,.25)', IXC.red, 3); if (sp > 0) ix3Poly(ctx, prof.map((p) => T(at(p, sp))), 'rgba(181,72,43,.12)', IXC.red, 2);
      const [f, v] = R.V(S.r, S.h);
      ixRead(read, [{ h: R.name }, `spun ${S.spin}°`, { h: 'Volume of the full solid' }, f, `≈ ${ixN(v, 2)} cubic units`, { note: S.k === 'tube' ? 'Spinning a shape that doesn’t touch the axis leaves a hole: a cylinder minus a cylinder.' : 'The side of the shape on the axis stays put; every other point traces a circle.' }]);
    }
    const stop = () => { if (S.play) { clearInterval(S.play); S.play = null; } }, sSpin = ixSlider('spin', 0, 360, 5, S.spin, (v) => v + '°', (v) => { stop(); S.spin = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_REVS).map(([k, R]) => [k, R.name]), S.k, (k) => { S.k = k; draw(); }), sSpin,
      el('div', { class: 'ix-btns' }, ixBtn('▶ Spin it', () => { stop(); S.spin = 0; S.play = setInterval(() => { S.spin = Math.min(360, S.spin + 6); sSpin.set(S.spin); draw(); if (S.spin >= 360 || !cv.isConnected) stop(); }, 30); })),
      ixSlider('r (width)', 1, 4, 0.5, S.r, (v) => ixN(v), (v) => { S.r = v; draw(); }), ixSlider('h (height)', 1, 5, 0.5, S.h, (v) => ixN(v), (v) => { S.h = v; draw(); }));
    ix3Turn(cv, S, draw); draw();
  } };

// ---- Distance, midpoint, and partitioning a segment
IX.distMid = { subjects: ['geometry', 'algebra1'],
  title: 'Distance, midpoint, and partitioning a segment', hint: 'Drag A and B (they snap to the grid). The right triangle shows the Distance Formula. Slide the ratio to find the point that splits AB from A to B.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 560), ctx = cv._ctx; main.append(cv);
    const S = { A: [-4, -3], B: [5, 3], m: 1, n: 2 }, V = ixView(cv, [-8, 8], [-8, 8], 22);
    function draw() {
      ctx.clearRect(0, 0, 580, 560); ixGrid(ctx, V, { step: 1, lab: 2 }); const { A, B, m, n } = S, X = (p) => [V.X(p[0]), V.Y(p[1])], C = [B[0], A[1]];
      ixLine(ctx, X(A), X(C), IXC.green, 2, true); ixLine(ctx, X(C), X(B), IXC.orange, 2, true); if (A[0] !== B[0] && A[1] !== B[1]) ixRightMark(ctx, X(C), X(A), X(B), IXC.gray, 12);
      const dx = B[0] - A[0], dy = B[1] - A[1]; ixLabel(ctx, `${Math.abs(dx)}`, (X(A)[0] + X(C)[0]) / 2, X(C)[1] + (dy > 0 ? 6 : -24), 18, 'center', IXC.green); ixLabel(ctx, `${Math.abs(dy)}`, X(C)[0] + (dx > 0 ? 10 : -10), (X(C)[1] + X(B)[1]) / 2, 18, dx > 0 ? 'left' : 'right', IXC.orange, 'middle');
      ixLine(ctx, X(A), X(B), IXC.blue, 3.6);
      const M = ixV.mid(A, B), t = m / (m + n), P = [A[0] + t * dx, A[1] + t * dy];
      ixDot(ctx, ...X(M), IXC.purple, 7); ixLabel(ctx, 'M', X(M)[0] - 12, X(M)[1] - 10, 19, 'right', IXC.purple, 'bottom'); ixDot(ctx, ...X(P), IXC.red, 7); ixLabel(ctx, 'P', X(P)[0] + 12, X(P)[1] + 6, 19, 'left', IXC.red);
      [[A, 'A'], [B, 'B']].forEach(([p, nm]) => { ixDot(ctx, ...X(p), IXC.blue, 8, true); ixLabel(ctx, `${nm}(${ixN(p[0])}, ${ixN(p[1])})`, X(p)[0] + 14, X(p)[1] - 14, 18, 'left', IXC.blue, 'bottom'); });
      const N = dx * dx + dy * dy, fr = (v) => ixFrac(v, [2, 3, 4, 5, 6, 7, 8, 9, 10]);
      ixRead(read, [{ h: 'Distance' }, 'd = √((x₂ − x₁)² + (y₂ − y₁)²)', `= √((${ixN(dx)})² + (${ixN(dy)})²) = √${N}`, `= ${ixRootText(N)} ≈ ${ixN(Math.sqrt(N), 2)}`,
        { h: 'Midpoint M' }, `M = ((${ixN(A[0])} + ${ixN(B[0])})/2, (${ixN(A[1])} + ${ixN(B[1])})/2) = (${fr(M[0])}, ${fr(M[1])})`.replace(/\+ −/g, '− '),
        { h: `P splits AB in the ratio ${m} : ${n}` }, `P is ${m}/${m + n} of the way from A to B:`, `x = ${ixN(A[0])} + (${m}/${m + n})(${ixN(dx)}) = ${fr(P[0])}`, `y = ${ixN(A[1])} + (${m}/${m + n})(${ixN(dy)}) = ${fr(P[1])}`]);
    }
    ctl.append(ixSlider('ratio m (from A)', 1, 5, 1, S.m, String, (v) => { S.m = v; draw(); }), ixSlider('ratio n (to B)', 1, 5, 1, S.n, String, (v) => { S.n = v; draw(); }));
    ixDrag(cv, (x, y) => ixPick({ A: [V.X(S.A[0]), V.Y(S.A[1])], B: [V.X(S.B[0]), V.Y(S.B[1])] }, x, y), (k, x, y) => { S[k] = [Math.max(-8, Math.min(8, Math.round(V.ix(x)))), Math.max(-8, Math.min(8, Math.round(V.iy(y))))]; draw(); });
    draw();
  } };

// ---- Law of Cosines
IX.lawCos = { subjects: ['precalc', 'geometry'],
  title: 'The Law of Cosines', hint: 'SAS: slide sides a, b and the angle C between them to find c. At C = 90° it becomes the Pythagorean theorem. SSS: slide all three sides to find an angle.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 480), ctx = cv._ctx; main.append(cv);
    const S = { mode: o.mode === 'sss' ? 'sss' : 'sas', a: 6, b: 8, C: 60, c: 7 }, sl = {};
    function draw() {
      ctx.clearRect(0, 0, 600, 480); let { a, b, C } = S, c, L, ok = true;
      if (S.mode === 'sss') { c = S.c; const cosC = (a * a + b * b - c * c) / (2 * a * b); ok = Math.abs(cosC) < 1; C = ok ? Math.acos(cosC) * 180 / Math.PI : NaN; }
      else c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C * Math.PI / 180));
      if (!ok) { ixLabel(ctx, 'These three sides can’t make a triangle.', 300, 220, 22, 'center', IXC.red); ixRead(read, [{ note: `The two shorter sides must add to more than the longest (Triangle Inequality).`, bad: true }]); return; }
      const t = C * Math.PI / 180, Bp = [b, 0], Ap = [a * Math.cos(t), a * Math.sin(t)], xs = [0, b, Ap[0]], ys = [0, 0, Ap[1]];
      const u = Math.min(480 / (Math.max(...xs) - Math.min(...xs)), 360 / Math.max(...ys, 1)), ox = 60 - Math.min(...xs) * u, oy = 420, P = (p) => [ox + p[0] * u, oy - p[1] * u];
      // vertex C at origin; side b along the bottom to A; side a up to B
      const Cv = P([0, 0]), Av = P(Bp), Bv = P(Ap);
      ixTri(ctx, [Cv, Av, Bv]); ixAngMark(ctx, Cv, Av, Bv, 36, IXC.red, ixN(C, 1) + '°');
      const lab = (p, q, txt, col) => { const m = ixV.mid(p, q), n = ixV.sub(q, p), Ln = ixV.len(n), cen = ixV.mul(ixV.add(ixV.add(Cv, Av), Bv), 1 / 3), side = ixV.dot([n[1] / Ln, -n[0] / Ln], ixV.sub(m, cen)) > 0 ? 1 : -1; ixLabel(ctx, txt, m[0] + side * n[1] / Ln * 22, m[1] - side * n[0] / Ln * 22, 20, 'center', col, 'middle'); };
      lab(Cv, Av, 'b = ' + ixN(b), IXC.blue); lab(Cv, Bv, 'a = ' + ixN(a), IXC.blue); lab(Av, Bv, 'c = ' + ixN(c, 2), IXC.green);
      const cen = ixV.mul(ixV.add(ixV.add(Cv, Av), Bv), 1 / 3); [[Cv, 'C'], [Av, 'A'], [Bv, 'B']].forEach(([p, n]) => ixName(ctx, p, n, cen));
      const corr = 2 * a * b * Math.cos(t);
      if (S.mode === 'sas') L = [{ h: 'SAS: find c' }, 'c² = a² + b² − 2ab cos C', `c² = ${a}² + ${b}² − 2(${a})(${b}) cos ${C}°`, `c² = ${a * a + b * b} − ${ixN(corr, 2)} = ${ixN(c * c, 2)}`, `c ≈ ${ixN(c, 3)}`,
        Math.abs(C - 90) < 1e-9 ? { note: 'cos 90° = 0, so this is the Pythagorean theorem: c² = a² + b².', good: true } : { note: C < 90 ? 'C is acute: cos C > 0, so c is shorter than the hypotenuse it would be at 90°.' : 'C is obtuse: cos C < 0, so subtracting it makes c longer.' }];
      else L = [{ h: 'SSS: find angle C' }, 'cos C = (a² + b² − c²)/(2ab)', `cos C = (${a * a} + ${b * b} − ${c * c})/(2 · ${a} · ${b})`, `cos C = ${ixN(a * a + b * b - c * c)}/${2 * a * b} ≈ ${ixN((a * a + b * b - c * c) / (2 * a * b), 4)}`, `C = cos⁻¹(${ixN((a * a + b * b - c * c) / (2 * a * b), 4)}) ≈ ${ixN(C, 2)}°`, { note: 'Find the largest angle (across from the longest side) first; then the Law of Sines is safe for the rest.' }];
      ixRead(read, L);
    }
    sl.C = ixSlider('angle C', 10, 170, 1, S.C, (v) => v + '°', (v) => { S.C = v; draw(); }); sl.c = ixSlider('side c', 1, 16, 0.5, S.c, (v) => ixN(v), (v) => { S.c = v; draw(); });
    const vis = () => { sl.C.style.display = S.mode === 'sas' ? '' : 'none'; sl.c.style.display = S.mode === 'sss' ? '' : 'none'; };
    ctl.append(ixSeg([['sas', 'SAS: find the side'], ['sss', 'SSS: find an angle']], S.mode, (k) => { S.mode = k; vis(); draw(); }),
      ixSlider('side a', 1, 10, 0.5, S.a, (v) => ixN(v), (v) => { S.a = v; draw(); }), ixSlider('side b', 1, 10, 0.5, S.b, (v) => ixN(v), (v) => { S.b = v; draw(); }), sl.C, sl.c,
      el('div', { class: 'ix-btns' }, ixBtn('C = 90°', () => { S.mode = 'sas'; S.C = 90; sl.C.set(90); ctl.querySelector('.ix-seg').set('sas'); vis(); draw(); })));
    vis(); draw();
  } };

// ---- Double-angle and half-angle formulas
IX.doubleAngle = { subjects: ['precalc'],
  title: 'Double-angle and half-angle formulas', hint: 'Drag θ around the unit circle. The red point is at 2θ (or θ/2). The graph shows sin 2x is not 2 sin x.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(820, 420), ctx = cv._ctx; main.append(cv);
    const S = { th: 40, mode: o.mode === 'half' ? 'half' : 'double' }, V = ixView({ _w: 400, _h: 420 }, [-1.3, 1.3], [-1.3, 1.3], 26);
    function draw() {
      ctx.clearRect(0, 0, 820, 420); ixGrid(ctx, V, { step: 0.5, lab: 1 }); ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), V.sx, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
      const th = S.th * Math.PI / 180, t2 = S.mode === 'double' ? 2 * th : th / 2, pt = (a) => [V.X(Math.cos(a)), V.Y(Math.sin(a))];
      ixLine(ctx, pt(0).map((v, i) => (i ? V.Y(0) : V.X(0))), pt(th), IXC.blue, 3); ixLine(ctx, [V.X(0), V.Y(0)], pt(t2), IXC.red, 3);
      ixDot(ctx, ...pt(th), IXC.blue, 8, true); ixDot(ctx, ...pt(t2), IXC.red, 7); ixLabel(ctx, 'θ', pt(th)[0] + 10, pt(th)[1] - 22, 20, 'left', IXC.blue); ixLabel(ctx, S.mode === 'double' ? '2θ' : 'θ/2', pt(t2)[0] + 10, pt(t2)[1] - 22, 20, 'left', IXC.red);
      // the graph on the right
      const G0 = ixView({ _w: 400, _h: 420 }, [0, 2 * Math.PI], [-2.2, 2.2], 30), G = { ...G0, X: (x) => 420 + G0.X(x) };
      ixGrid(ctx, G, { step: 0.5, lab: 1, piX: 0.5 });
      if (S.mode === 'double') { ixCurve(ctx, G, (x) => 2 * Math.sin(x), IXC.blue, { w: 2.4, dash: true }); ixCurve(ctx, G, (x) => Math.sin(2 * x), IXC.red, { w: 3 }); ixLabel(ctx, 'y = sin 2x', 640, 8, 17, 'center', IXC.red); ixLabel(ctx, 'y = 2 sin x (dashed)', 640, 396, 15, 'center', IXC.blue); }
      else { ixCurve(ctx, G, (x) => Math.sin(x / 2), IXC.red, { w: 3 }); ixCurve(ctx, G, (x) => Math.sin(x) / 2, IXC.blue, { w: 2.4, dash: true }); ixLabel(ctx, 'y = sin(x/2)', 640, 8, 17, 'center', IXC.red); ixLabel(ctx, 'y = ½ sin x (dashed)', 640, 396, 15, 'center', IXC.blue); }
      ixLine(ctx, [G.X(th), G.Y(-2.2)], [G.X(th), G.Y(2.2)], IXC.gray, 1.4, true);
      const s = Math.sin(th), c = Math.cos(th), d = (v) => ixN(v, 4);
      ixRead(read, S.mode === 'double' ? [{ h: `θ = ${S.th}°, 2θ = ${2 * S.th}°` }, { h: 'sin 2θ = 2 sin θ cos θ' }, `= 2(${d(s)})(${d(c)}) = ${d(2 * s * c)}`, `check: sin ${2 * S.th}° = ${d(Math.sin(2 * th))}`,
        { h: 'cos 2θ = cos²θ − sin²θ' }, `= ${d(c * c)} − ${d(s * s)} = ${d(c * c - s * s)}`, '= 2cos²θ − 1 = 1 − 2sin²θ', { note: `2 sin θ = ${d(2 * s)}, not the same as sin 2θ = ${d(2 * s * c)}.` }]
        : [{ h: `θ = ${S.th}°, θ/2 = ${S.th / 2}°` }, { h: 'sin(θ/2) = ±√((1 − cos θ)/2)' }, `= √((1 − ${d(c)})/2) = ${d(Math.sqrt((1 - c) / 2))}`, { h: 'cos(θ/2) = ±√((1 + cos θ)/2)' }, `= ${Math.cos(th / 2) < 0 ? '−' : ''}√((1 + ${d(c)})/2) = ${d(Math.cos(th / 2))}`,
          { note: `Choose the sign from the quadrant of θ/2 (${S.th / 2}°), not θ.` }]);
    }
    ctl.append(ixSeg([['double', 'Double angle'], ['half', 'Half angle']], S.mode, (k) => { S.mode = k; draw(); }), el('div', { class: 'ix-btns' }, ...[30, 45, 60, 120, 150].map((d) => ixBtn(d + '°', () => { S.th = d; draw(); }))), el('div', { class: 'small' }, 'Drag the blue point. Angles snap to 5°.'));
    ixDrag(cv, (x, y) => (x < 400 ? 'p' : null), (h, x, y) => { let a = Math.atan2(V.iy(y), V.ix(x)) * 180 / Math.PI; if (a < 0) a += 360; S.th = Math.round(a / 5) * 5 % 360; draw(); });
    draw();
  } };

// ---- Graphing identities
const IX_IDS = [
  ['sin²x + cos²x', '1', (x) => Math.sin(x) ** 2 + Math.cos(x) ** 2, () => 1],
  ['tan x · cos x', 'sin x', (x) => Math.tan(x) * Math.cos(x), Math.sin],
  ['1 + tan²x', 'sec²x', (x) => 1 + Math.tan(x) ** 2, (x) => 1 / Math.cos(x) ** 2],
  ['sec x − cos x', 'sin x tan x', (x) => 1 / Math.cos(x) - Math.cos(x), (x) => Math.sin(x) * Math.tan(x)],
  ['(sin x + cos x)²', '1 + sin 2x', (x) => (Math.sin(x) + Math.cos(x)) ** 2, (x) => 1 + Math.sin(2 * x)],
  ['cos 2x', '1 − 2sin²x', (x) => Math.cos(2 * x), (x) => 1 - 2 * Math.sin(x) ** 2],
  ['sin(x + π/2)', 'cos x', (x) => Math.sin(x + Math.PI / 2), Math.cos],
  ['sin 2x', '2 sin x', (x) => Math.sin(2 * x), (x) => 2 * Math.sin(x)],
  ['cos(−x)', '−cos x', (x) => Math.cos(-x), (x) => -Math.cos(x)],
  ['(1 − cos²x)/sin x', 'sin x', (x) => (1 - Math.cos(x) ** 2) / Math.sin(x), Math.sin],
  ['sin x + cos x', '1', (x) => Math.sin(x) + Math.cos(x), () => 1]];
IX.identities = { subjects: ['precalc'],
  title: 'Is it an identity? Graph both sides', hint: 'Pick an equation. The left side is blue and the right side is red (dashed). If the graphs match everywhere, it’s probably an identity, and then you prove it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 460), ctx = cv._ctx; main.append(cv);
    const S = { i: 0 }, V = ixView(cv, [-2 * Math.PI, 2 * Math.PI], [-3, 3], 26);
    function draw() {
      ctx.clearRect(0, 0, 640, 460); ixGrid(ctx, V, { step: 1, lab: 1, piX: 0.5 }); const [l, r, f, g] = IX_IDS[S.i];
      ixCurve(ctx, V, f, IXC.blue, { w: 5 }); ixCurve(ctx, V, g, IXC.red, { w: 2.6, dash: true });
      let bad = null, big = 1e-6; for (let x = -6.2; x <= 6.2; x += 0.013) { const a = f(x), b = g(x); if (isFinite(a) && isFinite(b) && Math.abs(a) < 20 && Math.abs(b) < 20 && Math.abs(a - b) > big) { big = Math.abs(a - b); bad = x; } }
      if (bad != null) { ixDot(ctx, V.X(bad), V.Y(f(bad)), IXC.blue, 6); ixDot(ctx, V.X(bad), V.Y(g(bad)), IXC.red, 6); }
      ixRead(read, [{ h: 'The equation' }, `${l} = ${r}`, bad == null ? { note: 'The graphs match everywhere both sides are defined: it’s an identity. (The graph is evidence; you still prove it with algebra.)', good: true }
        : { note: `Not an identity: at x ≈ ${ixN(bad, 2)}, the left side is ${ixN(f(bad), 3)} and the right side is ${ixN(g(bad), 3)}.`, bad: true }, { note: 'Watch for holes: both sides must also be undefined at the same places (like where sin x = 0 or cos x = 0).' }]);
    }
    const sel = el('select', { 'aria-label': 'Equation', style: 'font-size:16px;padding:6px' }, ...IX_IDS.map(([l, r], i) => el('option', { value: i }, `${l} = ${r}`)));
    sel.addEventListener('change', () => { S.i = +sel.value; draw(); });
    ctl.append(el('label', { class: 'ix-sl', style: 'display:block' }, el('span', {}, 'Equation'), sel), el('div', { class: 'ix-btns' }, ixBtn('Next ▶', () => { S.i = (S.i + 1) % IX_IDS.length; sel.value = S.i; draw(); })));
    draw();
  } };

// ---- Composition of functions
const IX_FNS = { add2: ['x + 2', (x) => x + 2], dbl: ['2x', (x) => 2 * x], sq: ['x²', (x) => x * x], sqrt: ['√x', (x) => (x >= 0 ? Math.sqrt(x) : NaN)], recip: ['1/x', (x) => (x ? 1 / x : NaN)], sub3: ['x − 3', (x) => x - 3], abs: ['|x|', Math.abs] };
IX.compose = { subjects: ['precalc', 'algebra2'],
  title: 'Composition of functions', hint: 'Pick f and g, then slide x. The input goes into g first, and that output goes into f. Switch the order to see that f(g(x)) and g(f(x)) are usually different.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 560), ctx = cv._ctx; main.append(cv);
    const S = { f: 'sqrt', g: 'sub3', x: 7, swap: false }, V0 = ixView({ _w: 640, _h: 380 }, [-6, 10], [-4, 8], 24), V = { ...V0, Y: (y) => 180 + V0.Y(y) };
    const box = (x, t, col) => { ctx.save(); ctx.fillStyle = col + '18'; ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 50, 130, 64, 10) : ctx.rect(x, 50, 130, 64); ctx.fill(); ctx.stroke(); ctx.restore(); ixLabel(ctx, t, x + 65, 82, 22, 'center', col, 'middle'); };
    const arrow = (x0, x1, t) => { ixLine(ctx, [x0, 82], [x1 - 6, 82], IXC.ink, 2.4); ctx.save(); ctx.fillStyle = IXC.ink; ctx.beginPath(); ctx.moveTo(x1, 82); ctx.lineTo(x1 - 12, 75); ctx.lineTo(x1 - 12, 89); ctx.fill(); ctx.restore(); ixLabel(ctx, t, (x0 + x1) / 2, 60, 18, 'center', IXC.ink, 'bottom'); };
    function draw() {
      ctx.clearRect(0, 0, 640, 560); const [inn, out] = S.swap ? [S.f, S.g] : [S.g, S.f], [ni, fi] = IX_FNS[inn], [no, fo] = IX_FNS[out], innN = S.swap ? 'f' : 'g', outN = S.swap ? 'g' : 'f';
      const y1 = fi(S.x), y2 = fo(y1), comp = (x) => fo(fi(x));
      arrow(14, 140, `x = ${ixN(S.x)}`); box(146, `${innN}(x) = ${ni}`, IXC.blue); arrow(282, 380, isFinite(y1) ? ixN(y1, 2) : 'undefined'); box(386, `${outN}(x) = ${no}`, IXC.green); arrow(522, 630, isFinite(y2) ? ixN(y2, 2) : '—');
      ixGrid(ctx, V, { step: 1, lab: 2 }); ixCurve(ctx, V, comp, IXC.red, { w: 3.4 });
      if (isFinite(y2)) ixDot(ctx, V.X(S.x), V.Y(y2), IXC.red, 8, true);
      // the domain, found by checking many x's
      const xs = []; for (let i = -600; i <= 1000; i++) xs.push([i / 100, isFinite(comp(i / 100))]); const bad = xs.filter(([, ok]) => !ok).map(([x]) => x);
      const dom = !bad.length ? 'all real numbers' : bad.length === 1 ? `all real numbers except x = ${ixN(bad[0])}` : bad[bad.length - 1] >= 9.99 ? `x ≤ ${ixN(bad[0] - 0.01, 2)}` : `x ≥ ${ixN(bad[bad.length - 1] + 0.01, 2)}`;
      const sym = `${outN}(${innN}(x))`, rule = no.replace(/x/g, `(${ni})`).replace(/\((x)\)/g, '$1').replace('√((', '√(').replace(/\)\)$/, ')');
      ixRead(read, [{ h: sym }, `= ${outN}(${ni})`, `= ${rule}`, `${sym.replace('(x))', `(${ixN(S.x)}))`)} = ${outN}(${isFinite(y1) ? ixN(y1, 2) : 'undefined'}) = ${isFinite(y2) ? ixN(y2, 3) : 'undefined'}`,
        { h: 'Domain of ' + sym }, dom, { note: 'An x is in the domain only if it works in the inside function AND its output works in the outside function.' }]);
    }
    const pick = (k, lab) => { const s = el('select', { 'aria-label': lab, style: 'font-size:16px;padding:4px' }, ...Object.entries(IX_FNS).map(([key, [t]]) => el('option', { value: key }, t))); s.value = S[k]; s.addEventListener('change', () => { S[k] = s.value; draw(); }); return el('label', { class: 'ix-sl' }, el('span', {}, lab), s); };
    ctl.append(pick('f', 'f(x) ='), pick('g', 'g(x) ='), ixSeg([[false, 'f(g(x))'], [true, 'g(f(x))']], S.swap, (k) => { S.swap = k; draw(); }), ixSlider('x', -6, 10, 0.5, S.x, (v) => ixN(v), (v) => { S.x = v; draw(); }));
    draw();
  } };

// ---- Rotation of axes
const IX_ROT = {
  xy: { eq: 'xy = 4', A: 0, B: 1, C: 0, F: 4 },
  e45: { eq: '5x² − 6xy + 5y² = 8', A: 5, B: -6, C: 5, F: 8 },
  e30: { eq: '7x² − 6√3xy + 13y² = 16', A: 7, B: -6 * Math.sqrt(3), C: 13, F: 16 },
  h45: { eq: 'x² + 4xy + y² = 3', A: 1, B: 4, C: 1, F: 3 } };
IX.rotateAxes = { subjects: ['precalc'],
  title: 'Rotation of axes', hint: 'Turn the x′y′-axes with the slider. When the axes line up with the conic, the xy-term disappears (B′ = 0) and the equation is in standard form.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_ROT[o.k] ? o.k : 'e45', th: 0 }, V = ixView(cv, [-6, 6], [-6, 6], 22);
    function draw() {
      ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: 1, lab: 2 }); const R = IX_ROT[S.k], { A, B, C, F } = R;
      const t0 = (A === C ? Math.PI / 4 : Math.atan2(B, A - C) / 2), c0 = Math.cos(t0), s0 = Math.sin(t0);
      const A0 = A * c0 * c0 + B * s0 * c0 + C * s0 * s0, C0 = A * s0 * s0 - B * s0 * c0 + C * c0 * c0, rot = ([u, v]) => [u * c0 - v * s0, u * s0 + v * c0];
      const path = (f, a, b) => { ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3.4; ctx.beginPath(); for (let j = 0; j <= 300; j++) { const p = rot(f(a + (b - a) * j / 300)); j ? ctx.lineTo(V.X(p[0]), V.Y(p[1])) : ctx.moveTo(V.X(p[0]), V.Y(p[1])); } ctx.stroke(); ctx.restore(); };
      if (A0 > 0 && C0 > 0) path((u) => [Math.sqrt(F / A0) * Math.cos(u), Math.sqrt(F / C0) * Math.sin(u)], 0, 2 * Math.PI);
      else if (A0 > 0) { const a = Math.sqrt(F / A0), b = Math.sqrt(F / -C0); [1, -1].forEach((sg) => path((u) => [sg * a * Math.cosh(u), b * Math.sinh(u)], -2.6, 2.6)); }
      else { const a = Math.sqrt(F / C0), b = Math.sqrt(F / -A0); [1, -1].forEach((sg) => path((u) => [b * Math.sinh(u), sg * a * Math.cosh(u)], -2.6, 2.6)); }
      const t = S.th * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), ax = (d, col, n) => { ixLine(ctx, [V.X(-6 * d[0]), V.Y(-6 * d[1])], [V.X(6 * d[0]), V.Y(6 * d[1])], col, 2.4); ixLabel(ctx, n, V.X(5.4 * d[0]) + 8, V.Y(5.4 * d[1]) - 8, 20, 'left', col, 'bottom'); };
      const A1 = A * c * c + B * s * c + C * s * s, B1 = (C - A) * 2 * s * c + B * (c * c - s * s), C1 = A * s * s - B * s * c + C * c * c, done = Math.abs(B1) < 0.05;
      ax([c, s], done ? IXC.green : IXC.red, 'x′'); ax([-s, c], done ? IXC.green : IXC.red, 'y′');
      const want = t0 * 180 / Math.PI, n = (v) => ixN(v, 2);
      ixRead(read, [{ h: 'The conic' }, R.eq, `A = ${n(A)}, B = ${n(B)}, C = ${n(C)}`, { h: `Rotate by θ = ${S.th}°` }, `A′ = ${n(A1)}, B′ = ${n(B1)}, C′ = ${n(C1)}`, `${n(A1)}x′² ${B1 < 0 ? '−' : '+'} ${n(Math.abs(B1))}x′y′ ${C1 < 0 ? '−' : '+'} ${n(Math.abs(C1))}y′² = ${F}`,
        done ? { note: `B′ = 0: in the x′y′-system, ${n(A1)}x′² ${C1 < 0 ? '−' : '+'} ${n(Math.abs(C1))}y′² = ${F}, a ${A1 * C1 > 0 ? 'rotated ellipse' : 'rotated hyperbola'}.`, good: true } : { note: 'Keep turning until B′ = 0.' },
        { h: 'The angle to use' }, `cot 2θ = (A − C)/B = ${A === C ? '0' : n((A - C) / B)}`, `2θ = ${n(((2 * want % 180) + 180) % 180)}°, so θ = ${n(((want % 90) + 90) % 90)}°`, { h: 'Classify without rotating' }, `B² − 4AC = ${n(B * B - 4 * A * C)}: ${B * B - 4 * A * C < 0 ? 'ellipse (or circle)' : B * B - 4 * A * C > 0 ? 'hyperbola' : 'parabola'}`]);
    }
    const sl = ixSlider('rotate θ', 0, 90, 1, S.th, (v) => v + '°', (v) => { S.th = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_ROT).map(([k, R]) => [k, R.eq]), S.k, (k) => { S.k = k; S.th = 0; sl.set(0); draw(); }), sl);
    draw();
  } };

// ---- Polar equations of conics
IX.polarConic = { subjects: ['precalc'],
  title: 'Polar equations of conics', hint: 'Slide the eccentricity e. The focus is at the pole. e < 1 is an ellipse, e = 1 a parabola, e > 1 a hyperbola. For the point P, PF = e · PD.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 560), ctx = cv._ctx; main.append(cv);
    const S = { e: 0.6, p: 3, form: 'cos-', th: 60 }, V = ixView(cv, [-12, 12], [-11.5, 11.5], 20);
    const F = { 'cos-': ['1 − e cos θ', (t) => -Math.cos(t), (p) => ['x = −' + p, [[-p, -12], [-p, 12]]]], 'cos+': ['1 + e cos θ', Math.cos, (p) => ['x = ' + p, [[p, -12], [p, 12]]]], 'sin-': ['1 − e sin θ', (t) => -Math.sin(t), (p) => ['y = −' + p, [[-12, -p], [12, -p]]]], 'sin+': ['1 + e sin θ', Math.sin, (p) => ['y = ' + p, [[-12, p], [12, p]]]] };
    function draw() {
      ctx.clearRect(0, 0, 580, 560); ixGrid(ctx, V, { step: 1, lab: 2 }); const [txt, g, dir] = F[S.form], { e, p } = S, r = (t) => e * p / (1 + e * g(t));
      const [dn, dl] = dir(p); ixLine(ctx, [V.X(dl[0][0]), V.Y(dl[0][1])], [V.X(dl[1][0]), V.Y(dl[1][1])], IXC.purple, 2.4, true);
      ctx.save(); ctx.beginPath(); ctx.rect(V.X(-12), V.Y(11.5), V.X(12) - V.X(-12), V.Y(-11.5) - V.Y(11.5)); ctx.clip(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3.4; ctx.beginPath(); let pen = false, last = null;
      for (let j = 0; j <= 2000; j++) { const t = j * 2 * Math.PI / 2000, R = r(t), x = R * Math.cos(t), y = R * Math.sin(t); if (!isFinite(R) || Math.abs(R) > 60 || (last && Math.hypot(x - last[0], y - last[1]) > 6)) { pen = false; last = null; continue; } pen ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)); pen = true; last = [x, y]; } ctx.stroke(); ctx.restore();
      ixDot(ctx, V.X(0), V.Y(0), IXC.red, 7); ixLabel(ctx, 'F (pole)', V.X(0) + 8, V.Y(0) + 6, 16, 'left', IXC.red);
      const t = S.th * Math.PI / 180, R = r(t), P = [R * Math.cos(t), R * Math.sin(t)], ok = isFinite(R) && R > 0 && Math.abs(R) < 30;
      let L2 = [];
      if (ok) { const D = S.form[0] === 'c' ? [dl[0][0], P[1]] : [P[0], dl[0][1]], PF = R, PD = ixV.dist(P, D);
        ixLine(ctx, [V.X(0), V.Y(0)], [V.X(P[0]), V.Y(P[1])], IXC.red, 2.4); ixLine(ctx, [V.X(P[0]), V.Y(P[1])], [V.X(D[0]), V.Y(D[1])], IXC.purple, 2.4); ixDot(ctx, V.X(P[0]), V.Y(P[1]), IXC.green, 8, true); ixLabel(ctx, 'P', V.X(P[0]) + 12, V.Y(P[1]) - 10, 20, 'left', IXC.green, 'bottom');
        L2 = [{ h: `P at θ = ${S.th}°` }, `r = ${ixN(R, 3)}`, `PF = ${ixN(PF, 2)}, PD = ${ixN(PD, 2)}`, `PF/PD = ${ixN(PF / PD, 3)} = e`]; }
      const kind = Math.abs(e - 1) < 1e-9 ? 'parabola' : e < 1 ? 'ellipse' : 'hyperbola';
      ixRead(read, [{ h: `r = ep/(${txt})` }, `r = ${ixN(e * p, 2)}/(1 ${S.form[3] === '-' ? '−' : '+'} ${ixN(e, 2)} ${S.form.slice(0, 3)} θ)`, `e = ${ixN(e, 2)}: ${kind}`, `directrix ${dn} (purple)`, ...L2,
        { note: 'Every point on a conic: (distance to the focus) = e · (distance to the directrix).' }]);
    }
    ctl.append(ixSlider('eccentricity e', 0.1, 2, 0.05, S.e, (v) => ixN(v, 2), (v) => { S.e = v; draw(); }), ixSlider('p (focus to directrix)', 1, 5, 0.5, S.p, (v) => ixN(v), (v) => { S.p = v; draw(); }),
      ixSeg(Object.entries(F).map(([k, [t]]) => [k, t]), S.form, (k) => { S.form = k; draw(); }), ixSlider('θ for P', 0, 355, 5, S.th, (v) => v + '°', (v) => { S.th = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('e = 0.5', () => set(0.5)), ixBtn('e = 1', () => set(1)), ixBtn('e = 1.5', () => set(1.5))));
    const set = (v) => { S.e = v; ctl.querySelector('.ix-sl').set(v); draw(); };
    draw();
  } };

// ---- Lines of fit and residuals
IX.lineFit = { subjects: ['algebra1', 'algebra2', 'act'],
  title: 'Lines of fit and residuals', hint: 'Drag the two red handles to fit a line by eye. Each residual is actual − predicted. Then show the line of best fit and compare. Drag the data points too.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 600), ctx = cv._ctx; main.append(cv);
    // a lesson can pass its own data (pts=1:4,2:7,…) and a starting line (m, b)
    const given = String(o.pts || '').split(',').map((t) => t.split(':').map(Number)).filter((p) => p.length === 2 && p.every(isFinite));
    const D0 = given.length > 1 ? given : [[1, 2.2], [2, 3.1], [3, 3.5], [4, 5.2], [5, 5.1], [6, 6.8], [7, 7.1], [8, 8.6]];
    const xs0 = D0.map((p) => p[0]), ys0 = D0.map((p) => p[1]), xhi = Math.max(10, Math.ceil(Math.max(...xs0) + 1)), yspan = Math.max(...ys0) - Math.min(...ys0) || 1;
    const ylo = given.length > 1 ? Math.max(0, Math.floor((Math.min(...ys0) - yspan * 0.3) / 5) * 5) : 0, yhi = given.length > 1 ? Math.ceil((Math.max(...ys0) + yspan * 0.3) / 5) * 5 : 10, yst = (yhi - ylo) > 30 ? 5 : (yhi - ylo) > 12 ? 2 : 1;
    const lineAt = (x) => (o.m != null ? +o.m * x + +(o.b || 0) : ylo + (yhi - ylo) * (0.15 + 0.7 * x / xhi));
    const S = { d: D0.map((p) => p.slice()), h: [[0.5, lineAt(0.5)], [xhi - 1.5, lineAt(xhi - 1.5)]], best: false };
    const V0 = ixView({ _w: 620, _h: 440 }, [0, xhi], [ylo, yhi], 30), V = V0, rr0 = Math.max(2.5, yspan / 4), R0 = ixView({ _w: 620, _h: 160 }, [0, xhi], [-rr0, rr0], 30), RV = { ...R0, Y: (y) => 440 + R0.Y(y) };
    function draw() {
      ctx.clearRect(0, 0, 620, 600); ixGrid2(ctx, V, 1, yst, xhi > 10 ? 2 : 2, yst * 2);
      const [P, Q] = S.h, m = (Q[1] - P[1]) / (Q[0] - P[0] || 1e-9), b = P[1] - m * P[0], f = (x) => m * x + b;
      const n = S.d.length, mx = S.d.reduce((s, p) => s + p[0], 0) / n, my = S.d.reduce((s, p) => s + p[1], 0) / n, sxy = S.d.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0), sxx = S.d.reduce((s, p) => s + (p[0] - mx) ** 2, 0), syy = S.d.reduce((s, p) => s + (p[1] - my) ** 2, 0);
      const bm = sxy / sxx, bb = my - bm * mx, rr = sxy / Math.sqrt(sxx * syy);
      if (S.best) ixCurve(ctx, V, (x) => bm * x + bb, IXC.green, { w: 2.6, dash: true });
      ixCurve(ctx, V, f, IXC.red, { w: 3 });
      S.d.forEach(([x, y]) => { ixLine(ctx, [V.X(x), V.Y(y)], [V.X(x), V.Y(f(x))], IXC.orange, 2); ixDot(ctx, V.X(x), V.Y(y), IXC.blue, 7); });
      S.h.forEach((p) => ixDot(ctx, V.X(p[0]), V.Y(p[1]), IXC.red, 8, true));
      // residual plot
      ixGrid2(ctx, RV, 1, rr0 > 3 ? Math.ceil(rr0 / 2) : 1, 2, rr0 > 3 ? Math.ceil(rr0 / 2) : 1); ixLabel(ctx, 'residual plot', 600, 446, 14, 'right', IXC.gray);
      S.d.forEach(([x, y]) => { const r = y - f(x); ixLine(ctx, [RV.X(x), RV.Y(0)], [RV.X(x), RV.Y(Math.max(-rr0, Math.min(rr0, r)))], IXC.orange, 2); ixDot(ctx, RV.X(x), RV.Y(Math.max(-rr0, Math.min(rr0, r))), IXC.orange, 5); });
      const sse = S.d.reduce((s, [x, y]) => s + (y - f(x)) ** 2, 0), sseB = S.d.reduce((s, [x, y]) => s + (y - bm * x - bb) ** 2, 0), sum = S.d.reduce((s, [x, y]) => s + (y - f(x)), 0);
      ixRead(read, [{ h: 'Your line (red)' }, `y = ${ixN(m, 2)}x ${b < 0 ? '−' : '+'} ${ixN(Math.abs(b), 2)}`, `sum of residuals: ${ixN(sum, 2)}`, `sum of squared residuals: ${ixN(sse, 2)}`,
        S.best ? { h: 'Line of best fit (green, dashed)' } : null, S.best ? `y = ${ixN(bm, 3)}x ${bb < 0 ? '−' : '+'} ${ixN(Math.abs(bb), 3)}` : null, S.best ? `sum of squared residuals: ${ixN(sseB, 2)} (the smallest possible)` : null, S.best ? `correlation r = ${ixN(rr, 3)}` : null,
        { note: 'A good fit: residuals bounce above and below 0 with no pattern. A curve in the residual plot means a line isn’t the right model.' },
        { note: 'TI-Nspire: in Lists & Spreadsheet, menu → 4 Statistics → 1 Stat Calculations → 3 Linear Regression (mx+b).' }]);
    }
    ctl.append(ixCheck('Show the line of best fit', S.best, (v) => { S.best = v; draw(); }), el('div', { class: 'ix-btns' }, ...(given.length > 1 ? [] : [ixBtn('Make it curved', () => { S.d = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => [x, 0.13 * x * x + 0.6 + (x % 2) * 0.2]); draw(); })]), ixBtn('Reset', () => { S.d = D0.map((p) => p.slice()); draw(); })));
    ixDrag(cv, (x, y) => { const h = { h0: [V.X(S.h[0][0]), V.Y(S.h[0][1])], h1: [V.X(S.h[1][0]), V.Y(S.h[1][1])] }; S.d.forEach((p, i) => (h['d' + i] = [V.X(p[0]), V.Y(p[1])])); return y < 440 ? ixPick(h, x, y, 26) : null; },
      (k, x, y) => { const p = [Math.max(0, Math.min(xhi, V.ix(x))), Math.max(ylo, Math.min(yhi, V.iy(y)))]; if (k[0] === 'h') S.h[+k[1]] = p; else S.d[+k.slice(1)] = [S.d[+k.slice(1)][0], Math.round(p[1] * 10) / 10]; draw(); });
    draw();
  } };

// ---- Piecewise functions and absolute value equations
IX.piecewise = { subjects: ['algebra1', 'algebra2'],
  title: 'Piecewise functions and absolute value', hint: 'Piecewise: slide the two pieces and where they switch; an open dot isn’t included. Absolute value: see why |x − h| = k has two solutions, one, or none.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 560), ctx = cv._ctx; main.append(cv);
    const S = { mode: o.mode === 'abs' ? 'abs' : 'pw', m1: -1, b1: 2, m2: 2, b2: -1, c: 1, h: 1, a: 1, k: 3, step: false }, V = ixView(cv, [-8, 8], [-8, 8], 22);
    const ln = (m, b) => `${m === 0 ? '' : ixCoef(m) + 'x'}${m === 0 ? ixN(b) : b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}` : ''}`;
    function draw() {
      ctx.clearRect(0, 0, 580, 560); ixGrid(ctx, V, { step: 1, lab: 2 }); let L;
      if (S.mode === 'pw' && S.step) { for (let n = -8; n < 8; n++) { ixLine(ctx, [V.X(n), V.Y(n)], [V.X(n + 1), V.Y(n)], IXC.blue, 3.4); ixDot(ctx, V.X(n), V.Y(n), IXC.blue, 5); ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = IXC.blue; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(V.X(n + 1), V.Y(n), 5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); }
        L = [{ h: 'Step function: f(x) = ⌊x⌋' }, 'the greatest integer less than or equal to x', 'f(2.7) = 2, f(−1.2) = −2', { note: 'Each step includes its left end (closed dot) but not its right end (open dot). Think of postage or parking prices.' }]; }
      else if (S.mode === 'pw') { const { m1, b1, m2, b2, c } = S, f1 = (x) => m1 * x + b1, f2 = (x) => m2 * x + b2;
        ixCurve(ctx, V, f1, IXC.blue, { w: 3.4, b: c }); ixCurve(ctx, V, f2, IXC.red, { w: 3.4, a: c });
        ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = IXC.blue; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(V.X(c), V.Y(f1(c)), 7, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); ixDot(ctx, V.X(c), V.Y(f2(c)), IXC.red, 7);
        const cont = Math.abs(f1(c) - f2(c)) < 1e-9;
        L = [{ h: 'f(x) =' }, `${ln(m1, b1)},  if x < ${c}`, `${ln(m2, b2)},  if x ≥ ${c}`, { h: `At x = ${c}` }, `f(${c}) = ${ixN(f2(c))} (the red piece includes x = ${c})`, cont ? { note: 'The pieces meet: no jump (the graph is continuous).', good: true } : { note: `There’s a jump: the blue piece heads to ${ixN(f1(c))} but stops with an open dot.` }]; }
      else { const { a, h, k } = S, f = (x) => a * Math.abs(x - h); ixCurve(ctx, V, f, IXC.blue, { w: 3.4 }); ixCurve(ctx, V, () => k, IXC.red, { w: 2.6 });
        const sols = k > 0 ? [h - k / a, h + k / a] : k === 0 ? [h] : []; sols.forEach((x) => { ixDot(ctx, V.X(x), V.Y(k), IXC.green, 8, true); ixLine(ctx, [V.X(x), V.Y(k)], [V.X(x), V.Y(0)], IXC.green, 1.6, true); ixLabel(ctx, ixN(x, 2), V.X(x), V.Y(0) + 6, 16, 'center', IXC.green); });
        const eq = `${a === 1 ? '' : a}|${ixShift(h)}| = ${k}`;
        L = [{ h: eq }, ...(k > 0 ? [`${ixShift(h)} = ${ixFrac(k / a)}  or  ${ixShift(h)} = −${ixFrac(k / a)}`, `x = ${sols.map((v) => ixFrac(v)).join('  or  x = ')}`, { note: 'Two solutions: the V crosses the line twice, the same distance from the vertex.', good: true }]
          : k === 0 ? [`x = ${ixN(h)}`, { note: 'One solution: the line touches the vertex.' }] : [{ note: 'No solution: an absolute value can’t be negative, so the line misses the V.', bad: true }])]; }
      ixRead(read, L);
    }
    const pw = el('div', {}, ixSlider('slope of piece 1', -3, 3, 0.5, S.m1, (v) => ixN(v), (v) => { S.m1 = v; draw(); }), ixSlider('intercept of piece 1', -6, 6, 1, S.b1, String, (v) => { S.b1 = v; draw(); }), ixSlider('slope of piece 2', -3, 3, 0.5, S.m2, (v) => ixN(v), (v) => { S.m2 = v; draw(); }), ixSlider('intercept of piece 2', -6, 6, 1, S.b2, String, (v) => { S.b2 = v; draw(); }), ixSlider('switch at x =', -5, 5, 1, S.c, String, (v) => { S.c = v; draw(); }), ixCheck('Step function instead', S.step, (v) => { S.step = v; draw(); }));
    const ab = el('div', {}, ixSlider('a', 1, 3, 1, S.a, String, (v) => { S.a = v; draw(); }), ixSlider('h', -5, 5, 1, S.h, String, (v) => { S.h = v; draw(); }), ixSlider('k (right side)', -3, 7, 1, S.k, String, (v) => { S.k = v; draw(); }));
    const vis = () => { pw.style.display = S.mode === 'pw' ? '' : 'none'; ab.style.display = S.mode === 'abs' ? '' : 'none'; };
    ctl.append(ixSeg([['pw', 'Piecewise'], ['abs', 'Absolute value equation']], S.mode, (k) => { S.mode = k; vis(); draw(); }), pw, ab); vis(); draw();
  } };

// ---- Properties of exponents
IX.expRules = { subjects: ['algebra1', 'algebra2'],
  title: 'Properties of exponents', hint: 'Pick a rule and slide the exponents. Each x is a tile, so you can count them. For zero and negative exponents, follow the pattern: divide by the base each step.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 420), ctx = cv._ctx; main.append(cv);
    const S = { r: o.rule || 'prod', a: 3, b: 2, base: 2 };
    const tile = (x, y, t = 'x', col = IXC.blue, cross = false) => { ctx.save(); ctx.fillStyle = col + '22'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.fillRect(x, y, 38, 38); ctx.strokeRect(x, y, 38, 38); ctx.restore(); ixLabel(ctx, t, x + 19, y + 19, 20, 'center', col, 'middle'); if (cross) { ixLine(ctx, [x + 2, y + 36], [x + 36, y + 2], IXC.red, 3); } };
    const row = (n, y, col, x0 = 40, crossN = 0) => { for (let i = 0; i < n; i++) tile(x0 + i * 44, y, 'x', col, i < crossN); return x0 + n * 44; };
    function draw() {
      ctx.clearRect(0, 0, 640, 420); const { a, b } = S; let L;
      if (S.r === 'prod') { const e = row(a, 60, IXC.blue); ixLabel(ctx, '·', e + 4, 79, 30, 'left', IXC.ink, 'middle'); row(b, 60, IXC.green, e + 24); ixLabel(ctx, `x${ixSup(String(a))} · x${ixSup(String(b))}`, 40, 20, 24);
        ixLabel(ctx, '=', 40, 150, 26); row(a, 190, IXC.blue); row(b, 190, IXC.green, 40 + a * 44); ixLabel(ctx, `x${ixSup(String(a + b))}`, 40, 250, 26);
        L = [{ h: 'Product of powers' }, 'xᵃ · xᵇ = xᵃ⁺ᵇ', `x${ixSup(String(a))} · x${ixSup(String(b))} = x${ixSup(String(a + b))}`, { note: `Count the tiles: ${a} + ${b} = ${a + b}. Add exponents when you multiply (same base).` }]; }
      else if (S.r === 'quot') { const n = Math.max(a, b); ixLabel(ctx, `x${ixSup(String(a))} / x${ixSup(String(b))}`, 40, 20, 24); row(a, 60, IXC.blue, 40, Math.min(a, b)); ixLine(ctx, [36, 110], [44 + n * 44, 110], IXC.ink, 3); row(b, 120, IXC.green, 40, Math.min(a, b));
        const d = a - b; ixLabel(ctx, `= ${d === 0 ? '1' : d > 0 ? 'x' + ixSup(String(d)) : '1/x' + ixSup(String(-d))}`, 40, 200, 28);
        L = [{ h: 'Quotient of powers' }, 'xᵃ/xᵇ = xᵃ⁻ᵇ', `x${ixSup(String(a))}/x${ixSup(String(b))} = x${ixSup(String(d).replace('-', '−'))}`, { note: `Each x on top cancels one on the bottom (red). ${Math.min(a, b)} pairs cancel. Subtract exponents when you divide.` }, d < 0 ? { note: `x${ixSup(String(d).replace('-', '−'))} = 1/x${ixSup(String(-d))}: a negative exponent means “one over.”` } : null]; }
      else if (S.r === 'pow') { ixLabel(ctx, `(x${ixSup(String(a))})${ixSup(String(b))}`, 40, 20, 24); for (let j = 0; j < b; j++) { ctx.save(); ctx.strokeStyle = IXC.gray; ctx.setLineDash([4, 4]); ctx.strokeRect(34 + j * (a * 44 + 18), 58, a * 44 + 4, 46); ctx.restore(); row(a, 62, [IXC.blue, IXC.green, IXC.orange, IXC.purple][j % 4], 38 + j * (a * 44 + 18)); }
        ixLabel(ctx, `= x${ixSup(String(a * b))}`, 40, 140, 28); L = [{ h: 'Power of a power' }, '(xᵃ)ᵇ = xᵃᵇ', `(x${ixSup(String(a))})${ixSup(String(b))} = x${ixSup(String(a * b))}`, { note: `${b} groups of ${a} tiles: ${a} · ${b} = ${a * b}. Multiply exponents.` }]; }
      else { const B = S.base, rows = [3, 2, 1, 0, -1, -2, -3]; ixLabel(ctx, 'Follow the pattern', 40, 14, 22);
        rows.forEach((e, i) => { const y = 54 + i * 50, v = B ** e, col = e > 0 ? IXC.blue : e === 0 ? IXC.green : IXC.red; ixLabel(ctx, `${B}${ixSup(String(e).replace('-', '−'))}`, 60, y, 26, 'left', col); ixLabel(ctx, `= ${e >= 0 ? ixN(v) : `1/${B ** -e}`}`, 140, y, 26, 'left', col); if (i) ixLabel(ctx, `÷ ${B}`, 330, y - 22, 18, 'left', IXC.gray); });
        L = [{ h: 'Zero and negative exponents' }, `Each step down divides by ${B}.`, `${B}⁰ = ${B}¹ ÷ ${B} = 1`, `${B}⁻¹ = 1 ÷ ${B} = 1/${B}`, 'x⁰ = 1 (x ≠ 0)', 'x⁻ⁿ = 1/xⁿ', { note: 'A negative exponent does not make the number negative; it means the reciprocal.' }]; }
      ixRead(read, L);
    }
    const sA = ixSlider('a', 1, 6, 1, S.a, String, (v) => { S.a = v; draw(); }), sB = ixSlider('b', 1, 6, 1, S.b, String, (v) => { S.b = v; draw(); }), sBase = ixSlider('base', 2, 5, 1, S.base, String, (v) => { S.base = v; draw(); });
    const vis = () => { const z = S.r === 'zero'; sA.style.display = sB.style.display = z ? 'none' : ''; sBase.style.display = z ? '' : 'none'; if (S.r === 'pow') { sB.querySelector('input').max = 3; if (S.b > 3) { S.b = 3; sB.set(3); } } else sB.querySelector('input').max = 6; };
    ctl.append(ixSeg([['prod', 'xᵃ · xᵇ'], ['quot', 'xᵃ / xᵇ'], ['pow', '(xᵃ)ᵇ'], ['zero', 'Zero and negative']], S.r, (k) => { S.r = k; vis(); draw(); }), sA, sB, sBase); vis(); draw();
  } };

// ---- Two-way tables, Venn diagrams, and conditional probability
IX.twoWay = { subjects: ['algebra1', 'act'],
  title: 'Two-way tables and Venn diagrams', hint: 'Slide the four counts. Pick a question: the cells it uses are highlighted in the table and the Venn diagram. Conditional probability only looks at one row or column.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(760, 420), ctx = cv._ctx; main.append(cv);
    const S = { ab: 18, aN: 22, nB: 12, nN: 28, q: 'AgB' }, A = 'Plays a sport', B = 'Has a job';
    const Q = { and: ['P(sport and job)', ['ab'], ['ab', 'aN', 'nB', 'nN']], A: ['P(sport)', ['ab', 'aN'], ['ab', 'aN', 'nB', 'nN']], or: ['P(sport or job)', ['ab', 'aN', 'nB'], ['ab', 'aN', 'nB', 'nN']], AgB: ['P(sport | job)', ['ab'], ['ab', 'nB']], BgA: ['P(job | sport)', ['ab'], ['ab', 'aN']] };
    function draw() {
      ctx.clearRect(0, 0, 760, 420); const c = S, tot = c.ab + c.aN + c.nB + c.nN, [qn, num, den] = Q[S.q];
      const X0 = 20, Y0 = 40, cw = [150, 90, 90, 80], rh = 54, xs = [X0, X0 + 150, X0 + 240, X0 + 330, X0 + 410];
      const cell = (r, k, txt, key, bold) => { const x = xs[k], y = Y0 + r * rh, hiN = key && num.includes(key), hiD = key && den.includes(key); ctx.save(); ctx.fillStyle = hiN ? 'rgba(181,72,43,.25)' : hiD ? 'rgba(31,95,168,.14)' : r === 0 || k === 0 ? '#f3f1ea' : '#fff'; ctx.fillRect(x, y, cw[k], rh); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 1.4; ctx.strokeRect(x, y, cw[k], rh); ctx.restore(); ixLabel(ctx, txt, x + cw[k] / 2, y + rh / 2, bold ? 19 : 17, 'center', IXC.ink, 'middle'); };
      cell(0, 0, ''); cell(0, 1, 'Job'); cell(0, 2, 'No job'); cell(0, 3, 'Total', null, true);
      cell(1, 0, 'Sport'); cell(1, 1, String(c.ab), 'ab'); cell(1, 2, String(c.aN), 'aN'); cell(1, 3, String(c.ab + c.aN), null, true);
      cell(2, 0, 'No sport'); cell(2, 1, String(c.nB), 'nB'); cell(2, 2, String(c.nN), 'nN'); cell(2, 3, String(c.nB + c.nN), null, true);
      cell(3, 0, 'Total', null, true); cell(3, 1, String(c.ab + c.nB), null, true); cell(3, 2, String(c.aN + c.nN), null, true); cell(3, 3, String(tot), null, true);
      // Venn
      const vx = 610, vy = 200; ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2; ctx.strokeRect(470, 50, 280, 300); ctx.restore();
      const reg = (key) => (num.includes(key) ? 'rgba(181,72,43,.30)' : den.includes(key) ? 'rgba(31,95,168,.16)' : null);
      ctx.save(); if (reg('nN')) { ctx.fillStyle = reg('nN'); ctx.fillRect(470, 50, 280, 300); } ctx.restore();
      const circ = (cx, col) => { ctx.beginPath(); ctx.arc(cx, vy, 82, 0, 2 * Math.PI); };
      ctx.save(); ctx.fillStyle = '#fff'; circ(vx - 45); ctx.fill(); circ(vx + 45); ctx.fill(); ctx.restore();
      ctx.save(); circ(vx - 45); ctx.clip(); if (reg('aN')) { ctx.fillStyle = reg('aN'); ctx.fillRect(0, 0, 760, 420); } ctx.restore();
      ctx.save(); circ(vx + 45); ctx.clip(); if (reg('nB')) { ctx.fillStyle = reg('nB'); ctx.fillRect(0, 0, 760, 420); } ctx.restore();
      ctx.save(); circ(vx - 45); ctx.clip(); ctx.fillStyle = '#fff'; circ(vx + 45); ctx.fill(); if (reg('ab')) { ctx.fillStyle = reg('ab'); ctx.fill(); } ctx.restore();
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 2.6; circ(vx - 45); ctx.stroke(); ctx.strokeStyle = IXC.green; circ(vx + 45); ctx.stroke(); ctx.restore();
      ixLabel(ctx, 'Sport', vx - 90, 96, 17, 'center', IXC.blue); ixLabel(ctx, 'Job', vx + 90, 96, 17, 'center', IXC.green);
      ixLabel(ctx, String(c.aN), vx - 80, vy, 22, 'center', IXC.ink, 'middle'); ixLabel(ctx, String(c.ab), vx, vy, 22, 'center', IXC.ink, 'middle'); ixLabel(ctx, String(c.nB), vx + 80, vy, 22, 'center', IXC.ink, 'middle'); ixLabel(ctx, String(c.nN), 735, 330, 20, 'right', IXC.ink, 'middle');
      const n = num.reduce((s, k) => s + c[k], 0), d = den.reduce((s, k) => s + c[k], 0), pA = (c.ab + c.aN) / tot, pAgB = c.ab / (c.ab + c.nB);
      ixLabel(ctx, `${qn} = ${n}/${d}`, 230, 280, 26, 'center', IXC.red);
      ixRead(read, [{ h: qn }, `= ${n}/${d} ≈ ${ixN(n / d, 3)}`, { note: S.q === 'AgB' || S.q === 'BgA' ? `Given means: only look at the ${S.q === 'AgB' ? 'job column' : 'sport row'} (${d} people).` : `Out of everyone: ${tot} people.` },
        S.q === 'or' ? `P(sport) + P(job) − P(both) = ${c.ab + c.aN}/${tot} + ${c.ab + c.nB}/${tot} − ${c.ab}/${tot}` : null,
        { h: 'Independent?' }, `P(sport) ≈ ${ixN(pA, 3)}; P(sport | job) ≈ ${ixN(pAgB, 3)}`, Math.abs(pA - pAgB) < 0.005 ? { note: 'Equal, so the events are independent: having a job doesn’t change the chance of playing a sport.', good: true } : { note: 'Not equal, so the events are dependent.' }]);
    }
    ctl.append(ixSeg(Object.entries(Q).map(([k, q]) => [k, q[0]]), S.q, (k) => { S.q = k; draw(); }),
      ...[['ab', 'sport and job'], ['aN', 'sport, no job'], ['nB', 'job, no sport'], ['nN', 'neither']].map(([k, t]) => ixSlider(t, 0, 50, 1, S[k], String, (v) => { S[k] = v; draw(); })),
      el('div', { class: 'ix-btns' }, ixBtn('Make them independent', () => { Object.assign(S, { ab: 12, aN: 18, nB: 8, nN: 12 }); ctl.querySelectorAll('.ix-sl').forEach((w, i) => w.set([12, 18, 8, 12][i])); draw(); })));
    draw();
  } };

// ---- Solving equations by graphing each side
IX.solveGraph = { subjects: ['algebra1', 'algebra2'],
  title: 'Solving equations by graphing', hint: 'Graph each side of the equation as its own function. Where the graphs meet, the two sides are equal: those x-values are the solutions.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 560), ctx = cv._ctx; main.append(cv);
    const S = { m: 1, b: 1, rt: 'abs', a: 2, h: 1, k: -3, m2: -0.5, b2: 4 }, V = ixView(cv, [-8, 8], [-8, 8], 22);
    function draw() {
      ctx.clearRect(0, 0, 580, 560); ixGrid(ctx, V, { step: 1, lab: 2 }); const f = (x) => S.m * x + S.b, g = S.rt === 'abs' ? (x) => S.a * Math.abs(x - S.h) + S.k : (x) => S.m2 * x + S.b2;
      ixCurve(ctx, V, f, IXC.blue, { w: 3.2 }); ixCurve(ctx, V, g, IXC.red, { w: 3.2 });
      const sols = []; let prev = f(-12) - g(-12); for (let i = -1199; i <= 1200; i++) { const x = i / 100, d = f(x) - g(x); if (Math.abs(d) < 1e-9) sols.push(x); else if (d * prev < 0) { let lo = x - 0.01, hi = x; for (let j = 0; j < 40; j++) { const mid = (lo + hi) / 2; ((f(mid) - g(mid)) * (f(lo) - g(lo)) <= 0) ? (hi = mid) : (lo = mid); } sols.push((lo + hi) / 2); } prev = d; }
      const snap = (x) => { for (const q of [1, 2, 3, 4, 5, 6, 8]) { const p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-6) return p / q; } return x; };
      const same = sols.length > 1000; const S2 = same ? [] : [...new Set(sols.map((x) => +snap(x).toFixed(6)))];
      S2.forEach((x) => { ixDot(ctx, V.X(x), V.Y(f(x)), IXC.green, 8, true); ixLine(ctx, [V.X(x), V.Y(f(x))], [V.X(x), V.Y(0)], IXC.green, 1.6, true); ixLabel(ctx, 'x = ' + ixFrac(x, [2, 3, 4, 5, 6, 8]), V.X(x), V.Y(0) + 8, 16, 'center', IXC.green); });
      const left = `${ixCoef(S.m)}x${ixTerm(S.b)}`, right = S.rt === 'abs' ? `${ixCoef(S.a)}|${ixShift(S.h)}|${ixTerm(S.k)}` : `${S.m2 ? ixCoef(S.m2) + 'x' : ''}${S.m2 ? ixTerm(S.b2) : ixN(S.b2)}`;
      ixRead(read, [{ h: 'Solve' }, `${left} = ${right}`, { h: 'Graph each side' }, `y = ${left} (blue)`, `y = ${right} (red)`, { h: 'Solutions' }, same ? 'every x (the graphs are the same line)' : S2.length ? S2.map((x) => 'x = ' + ixFrac(x, [2, 3, 4, 5, 6, 8])).join(', ') : 'none (the graphs never meet)',
        { note: 'Check a solution by putting it into both sides. TI-Nspire: graph f1 and f2, then menu → 6 Analyze Graph → 4 Intersection.' }]);
    }
    const abs = el('div', {}, ixSlider('a', -3, 3, 0.5, S.a, (v) => ixN(v), (v) => { S.a = v; draw(); }), ixSlider('h', -5, 5, 1, S.h, String, (v) => { S.h = v; draw(); }), ixSlider('k', -6, 6, 1, S.k, String, (v) => { S.k = v; draw(); }));
    const lin = el('div', {}, ixSlider('right slope', -3, 3, 0.5, S.m2, (v) => ixN(v), (v) => { S.m2 = v; draw(); }), ixSlider('right intercept', -6, 6, 1, S.b2, String, (v) => { S.b2 = v; draw(); }));
    const vis = () => { abs.style.display = S.rt === 'abs' ? '' : 'none'; lin.style.display = S.rt === 'abs' ? 'none' : ''; };
    ctl.append(ixSlider('left slope', -3, 3, 0.5, S.m, (v) => ixN(v), (v) => { S.m = v; draw(); }), ixSlider('left intercept', -6, 6, 1, S.b, String, (v) => { S.b = v; draw(); }),
      ixSeg([['abs', 'Right side: absolute value'], ['lin', 'Right side: line']], S.rt, (k) => { S.rt = k; vis(); draw(); }), abs, lin); vis(); draw();
  } };

// ---- Completing the square with tiles
IX.completeSq = { subjects: ['algebra2', 'algebra1', 'precalc'],
  title: 'Completing the square', hint: 'Slide b. The x-strips split in half and go on two sides of the x² square. The missing corner is (b/2)²; add it to complete the square.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { b: 6, c: -7, fill: true };
    function draw() {
      ctx.clearRect(0, 0, 600, 500); const { b, c } = S, h = b / 2, X = 200, u = Math.min(28, 240 / Math.max(h, 1)), x0 = 80, y0 = 70;
      const box = (x, y, w, hh, col, t, dash) => { ctx.save(); ctx.fillStyle = dash ? 'rgba(210,123,18,.08)' : col + '30'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash ? [6, 5] : []); ctx.fillRect(x, y, w, hh); ctx.strokeRect(x + 1, y + 1, w - 2, hh - 2); ctx.restore(); if (t) ixLabel(ctx, t, x + w / 2, y + hh / 2, Math.min(22, Math.max(12, Math.min(w, hh) / 2.2)), 'center', col, 'middle'); };
      box(x0, y0, X, X, IXC.green, 'x²'); for (let i = 0; i < h; i++) { box(x0 + X + i * u, y0, Math.min(u, (h - i) * u), X, IXC.blue, Math.min(u, (h - i) * u) > 16 ? 'x' : ''); box(x0, y0 + X + i * u, X, Math.min(u, (h - i) * u), IXC.blue, Math.min(u, (h - i) * u) > 16 ? 'x' : ''); }
      if (S.fill) box(x0 + X, y0 + X, h * u, h * u, IXC.orange, `${ixFrac(h * h)}`, false); else box(x0 + X, y0 + X, h * u, h * u, IXC.orange, '?', true);
      ixLabel(ctx, 'x', x0 + X / 2, y0 - 28, 20, 'center'); ixLabel(ctx, ixFrac(h), x0 + X + h * u / 2, y0 - 28, 20, 'center', IXC.blue); ixLabel(ctx, 'x', x0 - 18, y0 + X / 2, 20, 'center', IXC.ink, 'middle'); ixLabel(ctx, ixFrac(h), x0 - 18, y0 + X + h * u / 2, 20, 'center', IXC.blue, 'middle');
      const sq = h * h, rhs = -c + sq, poly = `x² + ${ixN(b)}x${ixTerm(c)}`;
      ixRead(read, [{ h: 'Make a perfect square' }, `x² + ${ixN(b)}x + (${ixFrac(h)})² = (x + ${ixFrac(h)})²`, `x² + ${ixN(b)}x + ${ixFrac(sq)} = (x + ${ixFrac(h)})²`, { note: `Half of ${b} is ${ixFrac(h)}; ${ixFrac(h)}² = ${ixFrac(sq)} fills the corner.` },
        { h: `Solve ${poly} = 0` }, `x² + ${ixN(b)}x = ${ixN(-c)}`, `x² + ${ixN(b)}x + ${ixFrac(sq)} = ${ixN(-c)} + ${ixFrac(sq)}`, `(x + ${ixFrac(h)})² = ${ixFrac(rhs)}`,
        rhs < 0 ? { note: 'The right side is negative: no real solutions.', bad: true } : `x + ${ixFrac(h)} = ±${Number.isInteger(Math.sqrt(rhs)) ? Math.sqrt(rhs) : '√(' + ixFrac(rhs) + ')'}`, rhs >= 0 ? `x = −${ixFrac(h)} ± ${Number.isInteger(Math.sqrt(rhs)) ? Math.sqrt(rhs) : '√(' + ixFrac(rhs) + ')'}${Number.isInteger(Math.sqrt(rhs)) ? `, so x = ${ixN(-h + Math.sqrt(rhs))} or x = ${ixN(-h - Math.sqrt(rhs))}` : ''}` : null,
        { h: 'Vertex form' }, `y = (x + ${ixFrac(h)})² ${rhs >= 0 ? '−' : '+'} ${ixFrac(Math.abs(rhs))}, vertex (−${ixFrac(h)}, ${ixFrac(-rhs)})`]);
    }
    ctl.append(ixSlider('b (x-term)', 1, 12, 1, S.b, String, (v) => { S.b = v; draw(); }), ixSlider('c (constant)', -20, 20, 1, S.c, String, (v) => { S.c = v; draw(); }), ixCheck('Fill in the corner', S.fill, (v) => { S.fill = v; draw(); }));
    draw();
  } };

// ---- The discriminant and the Quadratic Formula
IX.discriminant = { subjects: ['algebra2', 'algebra1', 'precalc'],
  title: 'The discriminant and the Quadratic Formula', hint: 'Slide a, b, and c. The discriminant b² − 4ac tells how many real solutions there are: positive two, zero one, negative none (two imaginary).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 540), ctx = cv._ctx; main.append(cv);
    const S = { a: 1, b: -2, c: -3 }, V = ixView(cv, [-8, 8], [-8, 8], 22);
    function draw() {
      ctx.clearRect(0, 0, 580, 540); ixGrid(ctx, V, { step: 1, lab: 2 }); const { a, b, c } = S, D = b * b - 4 * a * c, f = (x) => a * x * x + b * x + c;
      ixCurve(ctx, V, f, IXC.blue, { w: 3.4 }); const vx = -b / (2 * a); ixDot(ctx, V.X(vx), V.Y(f(vx)), IXC.purple, 6);
      const L = [{ h: 'The equation' }, `${ixCoef(a)}x²${b ? ixTerm(b).replace(/(\d)$/, '$1') + 'x' : ''}${ixTerm(c)} = 0`, { h: 'Discriminant' }, `b² − 4ac = (${ixN(b)})² − 4(${ixN(a)})(${ixN(c)}) = ${ixN(D)}`];
      if (D > 0) { const r = [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q); r.forEach((x) => ixDot(ctx, V.X(x), V.Y(0), IXC.green, 8, true));
        L.push({ note: 'Positive: two real solutions (the parabola crosses the x-axis twice).', good: true }, { h: 'Quadratic Formula' }, `x = (−b ± √(b² − 4ac))/(2a)`, `x = (${ixN(-b)} ± √${ixN(D)})/${ixN(2 * a)}`, Number.isInteger(Math.sqrt(D)) ? `x = (${ixN(-b)} ± ${Math.sqrt(D)})/${ixN(2 * a)}` : null, `x = ${ixRootText(D) === String(Math.sqrt(D)) ? r.map((x) => ixFrac(x, [2, 3, 4, 5, 6, 8, 10])).join(' or ') : `${ixN(r[0], 3)} or ${ixN(r[1], 3)}`}`); }
      else if (D === 0) { ixDot(ctx, V.X(vx), V.Y(0), IXC.green, 8, true); L.push({ note: 'Zero: one real solution (the vertex touches the x-axis).' }, `x = −b/(2a) = ${ixFrac(vx)}`); }
      else { const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * Math.abs(a)); L.push({ note: 'Negative: no real solutions (the parabola misses the x-axis). The solutions are imaginary.', bad: true }, `x = (${ixN(-b)} ± √(${ixN(D)}))/${ixN(2 * a)}`, `x = (${ixN(-b)} ± ${ixRootText(-D)}i)/${ixN(2 * a)}`, `x ≈ ${ixN(re, 3)} ± ${ixN(im, 3)}i`); }
      ixRead(read, L);
    }
    ctl.append(ixSlider('a', -3, 3, 1, S.a, String, (v) => { S.a = v || 1; draw(); }), ixSlider('b', -8, 8, 1, S.b, String, (v) => { S.b = v; draw(); }), ixSlider('c', -8, 8, 1, S.c, String, (v) => { S.c = v; draw(); }));
    draw();
  } };

// ---- Synthetic division and the Remainder Theorem
IX.synthDiv = { subjects: ['algebra2', 'precalc'],
  title: 'Synthetic division and the Remainder Theorem', hint: 'Set the polynomial’s coefficients and the k in x − k. Press Next step to bring down, multiply, and add. The remainder equals P(k), the height of the graph at x = k.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 560), ctx = cv._ctx; main.append(cv);
    const S = { co: [1, -2, -5, 6], k: 3, step: 99 };
    const V0 = ixView({ _w: 640, _h: 340 }, [-6, 6], [-20, 20], 24), V = { ...V0, Y: (y) => 220 + V0.Y(y) };
    function draw() {
      ctx.clearRect(0, 0, 640, 560); const co = S.co, k = S.k, n = co.length, out = [co[0]], mid = [null];
      for (let i = 1; i < n; i++) { mid.push(out[i - 1] * k); out.push(co[i] + mid[i]); }
      const cw = 80, x0 = 110, y0 = 30, maxStep = 2 * (n - 1) + 1, st = Math.min(S.step, maxStep);
      ixLabel(ctx, String(k), 60, y0 + 6, 26, 'center', IXC.red); ixLine(ctx, [88, y0 - 6], [88, y0 + 96], IXC.ink, 2.4); ixLine(ctx, [88, y0 + 96], [x0 + n * cw, y0 + 96], IXC.ink, 2.4);
      co.forEach((v, i) => ixLabel(ctx, ixN(v), x0 + i * cw + cw / 2, y0 + 6, 24, 'center'));
      for (let i = 0; i < n; i++) { const sb = i === 0 ? 1 : 2 * i + 1, sm = 2 * i; if (i > 0 && st >= sm) ixLabel(ctx, ixN(mid[i]), x0 + i * cw + cw / 2, y0 + 54, 22, 'center', IXC.blue);
        if (st >= sb) ixLabel(ctx, ixN(out[i]), x0 + i * cw + cw / 2, y0 + 106, 24, 'center', i === n - 1 ? IXC.red : IXC.green); }
      if (st >= maxStep) { ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2; ctx.strokeRect(x0 + (n - 1) * cw + 14, y0 + 98, cw - 28, 40); ctx.restore(); }
      // graph
      const P = (x) => co.reduce((s, c) => s * x + c, 0); let top = 1; for (let x = -3.5; x <= 3.5; x += 0.05) top = Math.max(top, Math.abs(P(x))); const yr = Math.max(10, Math.ceil(Math.min(Math.max(top * 1.1, Math.abs(P(k)) * 1.2), 300) / 5) * 5);
      const W0 = ixView({ _w: 640, _h: 370 }, [-6, 6], [-yr, yr], 24), W = { ...W0, Y: (y) => 190 + W0.Y(y) }; ixGrid2(ctx, W, 1, yr / 5, 1, yr / 5);
      ixCurve(ctx, W, P, IXC.blue, { w: 3 }); if (Math.abs(P(k)) <= yr) { ixLine(ctx, [W.X(k), W.Y(0)], [W.X(k), W.Y(P(k))], IXC.red, 2, true); ixDot(ctx, W.X(k), W.Y(P(k)), IXC.red, 8, true); }
      const term = (c, e) => (c === 0 ? '' : `${c < 0 ? ' − ' : ' + '}${Math.abs(c) === 1 && e ? '' : Math.abs(c)}${e ? 'x' + (e > 1 ? ixSup(String(e)) : '') : ''}`), poly = (cs) => cs.map((c, i) => term(c, cs.length - 1 - i)).join('').replace(/^ \+ /, '').replace(/^ − /, '−') || '0';
      const steps = ['Bring down the first coefficient.', 'Multiply by k; write it under the next coefficient.', 'Add the column.'];
      ixRead(read, [{ h: 'Divide' }, `(${poly(co)}) ÷ (x ${k < 0 ? '+' : '−'} ${Math.abs(k)})`, st < maxStep ? { note: st === 0 ? 'Press Next step.' : steps[st === 1 ? 0 : st % 2 ? 2 : 1] } : null,
        st >= maxStep ? { h: 'Result' } : null, st >= maxStep ? `quotient: ${poly(out.slice(0, -1))}` : null, st >= maxStep ? `remainder: ${ixN(out[n - 1])}` : null,
        st >= maxStep ? { h: 'Remainder Theorem' } : null, st >= maxStep ? `P(${k}) = ${ixN(P(k))} = the remainder` : null,
        st >= maxStep ? (out[n - 1] === 0 ? { note: `Remainder 0: x ${k < 0 ? '+' : '−'} ${Math.abs(k)} is a factor, and x = ${k} is a zero (the red dot is on the x-axis).`, good: true } : { note: 'The remainder isn’t 0, so x − k is not a factor.' }) : null]);
    }
    const coS = ['x³', 'x²', 'x', 'constant'].map((t, i) => ixSlider(`coefficient of ${t}`, -9, 9, 1, S.co[i], String, (v) => { S.co[i] = v; if (i === 0 && v === 0) { S.co[0] = 1; coS[0].set(1); } draw(); }));
    ctl.append(ixSlider('k (divide by x − k)', -5, 5, 1, S.k, String, (v) => { S.k = v; draw(); }), ...coS,
      el('div', { class: 'ix-btns' }, ixBtn('Start over', () => { S.step = 0; draw(); }), ixBtn('Next step ▶', () => { S.step = Math.min(S.step + 1, 99); draw(); }), ixBtn('Show it all', () => { S.step = 99; draw(); })));
    draw();
  } };

// ---- Direct and inverse variation
IX.variation = { subjects: ['algebra2', 'algebra1'],
  title: 'Direct and inverse variation', hint: 'Pick direct (y = kx) or inverse (y = k/x) and slide k. Drag the point: in direct variation y/x stays the same; in inverse variation xy stays the same.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 540), ctx = cv._ctx; main.append(cv);
    const S = { t: o.t === 'inv' ? 'inv' : 'dir', k: 6, x: 2 }, V = ixView(cv, [-1, 12], [-1, 12], 26);
    function draw() {
      ctx.clearRect(0, 0, 580, 540); ixGrid(ctx, V, { step: 1, lab: 2 }); const { k } = S, dir = S.t === 'dir', f = dir ? (x) => k / 3 * x : (x) => (x > 0 ? k / x : NaN), x = S.x, y = f(x);
      ixCurve(ctx, V, f, IXC.blue, { w: 3.4, a: dir ? -1 : 0.05 });
      const x2 = 2 * x, y2 = f(x2); [[x, y, IXC.red], [x2, y2, IXC.green]].forEach(([a, b, c]) => { if (b <= 12) { ixLine(ctx, [V.X(a), V.Y(0)], [V.X(a), V.Y(b)], c, 1.6, true); ixLine(ctx, [V.X(0), V.Y(b)], [V.X(a), V.Y(b)], c, 1.6, true); ixDot(ctx, V.X(a), V.Y(b), c, 8, true); } });
      if (!dir) { ctx.save(); ctx.fillStyle = 'rgba(181,72,43,.12)'; ctx.fillRect(V.X(0), V.Y(y), V.X(x) - V.X(0), V.Y(0) - V.Y(y)); ctx.restore(); }
      const kk = dir ? k / 3 : k;
      ixRead(read, [{ h: dir ? `Direct: y = ${ixFrac(kk)}x` : `Inverse: y = ${k}/x` }, `red point: (${ixN(x, 2)}, ${ixN(y, 2)})`, `green point, x doubled: (${ixN(x2, 2)}, ${ixN(y2, 2)})`,
        dir ? `y/x = ${ixN(y, 2)}/${ixN(x, 2)} = ${ixFrac(kk)} (always the same)` : `xy = ${ixN(x, 2)} · ${ixN(y, 2)} = ${k} (always the same)`,
        { note: dir ? 'Direct variation: double x and y doubles. The graph is a line through the origin.' : 'Inverse variation: double x and y is cut in half. The shaded rectangle always has area k.' }]);
    }
    ctl.append(ixSeg([['dir', 'Direct: y = kx'], ['inv', 'Inverse: y = k/x']], S.t, (k) => { S.t = k; draw(); }), ixSlider('k', 1, 12, 1, S.k, (v) => (S.t === 'dir' ? ixFrac(v / 3) : String(v)), (v) => { S.k = v; draw(); }), el('div', { class: 'small' }, 'Drag the red point.'));
    ixDrag(cv, () => 'p', (h, x) => { S.x = Math.max(0.5, Math.min(5.5, Math.round(V.ix(x) * 4) / 4)); draw(); });
    draw();
  } };

// ---- Sequences and series
IX.sequences = { subjects: ['algebra2', 'precalc'],
  title: 'Sequences and series', hint: 'Bars are the terms; the line of dots is the running sum (the series). Arithmetic adds d each time; geometric multiplies by r. With |r| < 1, the sums level off at a₁/(1 − r).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 500), ctx = cv._ctx; main.append(cv);
    const S = { t: o.t || 'arith', a: 2, d: 3, r: 0.5, n: 8 }, sl = {};
    function draw() {
      ctx.clearRect(0, 0, 640, 500); const { a, d, r, n } = S, geo = S.t !== 'arith', term = (i) => (geo ? a * r ** (i - 1) : a + (i - 1) * d), T = Array.from({ length: n }, (_, i) => term(i + 1)), sums = T.reduce((acc, v) => [...acc, (acc.at(-1) || 0) + v], []);
      const vals = [...T, ...sums, 0]; let lo = Math.min(...vals), hi = Math.max(...vals); if (S.t === 'inf' && Math.abs(r) < 1) hi = Math.max(hi, a / (1 - r)); const pad = (hi - lo) * 0.1 || 1;
      const V = ixView(cv, [0, n + 1], [lo - pad, hi + pad], 34), st = Math.pow(10, Math.floor(Math.log10((hi - lo) / 5 || 1))); ixGrid2(ctx, V, 1, st * ((hi - lo) / st > 20 ? 5 : (hi - lo) / st > 10 ? 2 : 1), 1, st * ((hi - lo) / st > 20 ? 10 : (hi - lo) / st > 10 ? 4 : 2));
      T.forEach((v, i) => { ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.30)'; ctx.strokeStyle = IXC.blue; ctx.lineWidth = 1.6; const x = V.X(i + 1) - 12, y0 = V.Y(0), y1 = V.Y(v); ctx.fillRect(x, Math.min(y0, y1), 24, Math.abs(y1 - y0)); ctx.strokeRect(x, Math.min(y0, y1), 24, Math.abs(y1 - y0)); ctx.restore(); });
      ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2.4; ctx.beginPath(); sums.forEach((s, i) => (i ? ctx.lineTo(V.X(i + 1), V.Y(s)) : ctx.moveTo(V.X(i + 1), V.Y(s)))); ctx.stroke(); ctx.restore(); sums.forEach((s, i) => ixDot(ctx, V.X(i + 1), V.Y(s), IXC.red, 5));
      if (S.t === 'inf' && Math.abs(r) < 1) { ixLine(ctx, [V.X(0), V.Y(a / (1 - r))], [V.X(n + 1), V.Y(a / (1 - r))], IXC.green, 2.4, true); ixLabel(ctx, `S = ${ixN(a / (1 - r), 3)}`, V.X(n + 1) - 4, V.Y(a / (1 - r)) - 6, 17, 'right', IXC.green, 'bottom'); }
      const show = T.slice(0, 6).map((v) => ixN(v, 3)).join(', ') + (n > 6 ? ', …' : '');
      const L = [{ h: geo ? 'Geometric' : 'Arithmetic' }, show, geo ? `aₙ = ${ixN(a)}(${ixN(r)})ⁿ⁻¹` : `aₙ = ${ixN(a)} + (n − 1)(${ixN(d)})`, `a${String(n).split('').map((c) => '₀₁₂₃₄₅₆₇₈₉'[c]).join('')} = ${ixN(T[n - 1], 4)}`,
        { h: `Sum of the first ${n} terms (red dots)` }, geo ? `Sₙ = a₁(1 − rⁿ)/(1 − r)` : 'Sₙ = n(a₁ + aₙ)/2', `S = ${ixN(sums[n - 1], 4)}`];
      if (S.t === 'inf') L.push({ h: 'Infinite series' }, Math.abs(r) < 1 ? `S = a₁/(1 − r) = ${ixN(a)}/(1 − ${ixN(r)}) = ${ixN(a / (1 - r), 4)}` : 'no sum: |r| ≥ 1, so the sums keep growing', Math.abs(r) < 1 ? { note: 'The partial sums get closer and closer to S (green line) but never pass it.', good: true } : { note: 'An infinite geometric series has a sum only when |r| < 1.', bad: true });
      ixRead(read, L);
    }
    sl.d = ixSlider('common difference d', -5, 5, 1, S.d, String, (v) => { S.d = v; draw(); }); sl.r = ixSlider('common ratio r', -1.5, 2, 0.1, S.r, (v) => ixN(v, 2), (v) => { S.r = v; draw(); });
    const vis = () => { sl.d.style.display = S.t === 'arith' ? '' : 'none'; sl.r.style.display = S.t === 'arith' ? 'none' : ''; };
    ctl.append(ixSeg([['arith', 'Arithmetic'], ['geo', 'Geometric'], ['inf', 'Infinite geometric']], S.t, (k) => { S.t = k; if (k === 'inf') { S.n = 15; ctl.querySelectorAll('.ix-sl')[1].set(15); } vis(); draw(); }),
      ixSlider('first term a₁', -5, 10, 1, S.a, String, (v) => { S.a = v; draw(); }), ixSlider('number of terms n', 2, 20, 1, S.n, String, (v) => { S.n = v; draw(); }), sl.d, sl.r); vis(); draw();
  } };

// ---- Sampling and margin of error
IX.sampling = { subjects: ['algebra2', 'act'],
  title: 'Samples and margin of error', hint: 'In the whole school, a true percent p would answer yes. Take random samples and watch the sample percents pile up around p. Bigger samples cluster tighter: the margin of error is about ±1/√n.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 440), ctx = cv._ctx; main.append(cv);
    const S = { p: 0.6, n: 100, res: [], rnd: mulberry32((Date.now() % 1e9) | 0) };
    const take = (k) => { for (let j = 0; j < k; j++) { let y = 0; for (let i = 0; i < S.n; i++) if (S.rnd() < S.p) y++; S.res.push(y / S.n); } draw(); };
    function draw() {
      ctx.clearRect(0, 0, 640, 440); const X = (v) => 40 + v * 560, bins = new Array(50).fill(0); S.res.forEach((v) => bins[Math.min(49, Math.floor(v * 50))]++); const top = Math.max(5, ...bins);
      const me = 1 / Math.sqrt(S.n); ctx.save(); ctx.fillStyle = 'rgba(46,125,79,.10)'; ctx.fillRect(X(S.p - me), 30, X(S.p + me) - X(S.p - me), 350); ctx.restore();
      bins.forEach((c, i) => { if (!c) return; const h = c / top * 330; ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.55)'; ctx.fillRect(X(i / 50) + 1, 380 - h, 560 / 50 - 2, h); ctx.restore(); });
      ixLine(ctx, [30, 380], [610, 380], IXC.ink, 2); for (let v = 0; v <= 10; v++) { ixLine(ctx, [X(v / 10), 376], [X(v / 10), 386], IXC.ink, 1.4); ixLabel(ctx, v * 10 + '%', X(v / 10), 389, 13, 'center', IXC.ink); }
      ixLine(ctx, [X(S.p), 30], [X(S.p), 380], IXC.red, 2.6); ixLabel(ctx, `true p = ${Math.round(S.p * 100)}%`, X(S.p), 12, 16, 'center', IXC.red);
      if (S.res.length) { const last = S.res.at(-1); ixDot(ctx, X(last), 414, IXC.orange, 6); ixLabel(ctx, `last sample: ${ixN(last * 100, 1)}%`, X(last), 422, 14, 'center', IXC.orange); }
      const inside = S.res.filter((v) => Math.abs(v - S.p) <= me).length;
      ixRead(read, [{ h: `Sample size n = ${S.n}` }, `margin of error ≈ ±1/√${S.n} = ±${ixN(me * 100, 1)}%`, `samples taken: ${S.res.length}`, S.res.length ? `within the margin (green band): ${inside} (${ixN(inside / S.res.length * 100, 0)}%)` : null,
        { note: 'About 95% of samples land within the margin of error of the true percent. Quadruple the sample size to cut the margin in half.' }]);
    }
    ctl.append(ixSlider('true percent p', 0.1, 0.9, 0.05, S.p, (v) => Math.round(v * 100) + '%', (v) => { S.p = v; S.res = []; draw(); }), ixSeg([[25, 'n = 25'], [100, 'n = 100'], [400, 'n = 400']], S.n, (k) => { S.n = k; S.res = []; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('Take 1 sample', () => take(1)), ixBtn('Take 100 samples', () => take(100)), ixBtn('Clear', () => { S.res = []; draw(); })));
    draw();
  } };

// ---- Three equations in three variables: three planes
const IX_PLANES = {
  one: { name: 'One solution', eqs: [[1, 1, 1, 6], [1, -1, 1, 2], [1, 1, -1, 0]], sol: 'one point: (1, 2, 3)', note: 'The three planes meet at a single point.' },
  line: { name: 'Infinitely many', eqs: [[1, 1, 1, 3], [1, -1, 1, 1], [2, 0, 2, 4]], sol: 'infinitely many: every point on the line y = 1, x + z = 2', note: 'All three planes share a line. (The third equation is the first two added.)' },
  par: { name: 'No solution (parallel)', eqs: [[1, 1, 1, 1], [1, 1, 1, 3], [1, -1, 1, 0]], sol: 'no solution', note: 'Two planes are parallel (same left side, different right side), so they never meet. Elimination gives 0 = 2.' },
  prism: { name: 'No solution (a tent)', eqs: [[1, 0, 1, 1], [1, 0, -1, 1], [1, 0, 0, 3]], sol: 'no solution', note: 'Each pair of planes meets in a line, but the three lines are parallel, so no point is on all three.' } };
IX.threePlanes = { subjects: ['algebra2'],
  title: 'Systems of three equations: three planes', hint: 'Each equation in x, y, and z is a plane. Pick a case to see how three planes can meet in one point, a line, or not at all. Drag to turn the picture.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_PLANES[o.k] ? o.k : 'one', az: -0.7, el: 0.35 };
    function draw() {
      ctx.clearRect(0, 0, 620, 520); const T = ix3(310, 280, 42, S), C = IX_PLANES[S.k], cols = [IXC.blue, IXC.red, IXC.green];
      [[[-4, 0, 0], [4, 0, 0], 'x'], [[0, -4, 0], [0, 4, 0], 'y'], [[0, 0, -4], [0, 0, 4], 'z']].forEach(([a, b, n]) => { ixLine(ctx, T(a), T(b), IXC.gray, 1.6); ixLabel(ctx, n, T(b)[0] + 6, T(b)[1] - 4, 18, 'left', IXC.gray, 'bottom'); });
      const polys = C.eqs.map(([a, b, c, d], i) => { const nn = [a, b, c], L = Math.hypot(...nn), u = nn.map((v) => v / L), p0 = u.map((v) => v * d / L);
        const t = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0], e1 = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], l1 = Math.hypot(...e1), E1 = e1.map((v) => v / l1), E2 = [u[1] * E1[2] - u[2] * E1[1], u[2] * E1[0] - u[0] * E1[2], u[0] * E1[1] - u[1] * E1[0]];
        const pts = [[-3.5, -3.5], [3.5, -3.5], [3.5, 3.5], [-3.5, 3.5]].map(([s, q]) => T(p0.map((v, j) => v + s * E1[j] + q * E2[j]))); return { pts, col: cols[i], z: pts.reduce((s, p) => s + p[2], 0) }; });
      polys.sort((p, q) => p.z - q.z).forEach(({ pts, col }) => ix3Poly(ctx, pts, col + '30', col, 1.8));
      if (S.k === 'one') { const p = T([1, 2, 3]); ixDot(ctx, p[0], p[1], IXC.ink, 8, true); ixLabel(ctx, '(1, 2, 3)', p[0] + 12, p[1] - 10, 19, 'left', IXC.ink, 'bottom'); }
      if (S.k === 'line') ixLine(ctx, T([-1.5, 1, 3.5]), T([3.5, 1, -1.5]), IXC.ink, 4);
      const eq = ([a, b, c, d]) => [[a, 'x'], [b, 'y'], [c, 'z']].filter(([v]) => v).map(([v, n], i) => `${i ? (v < 0 ? ' − ' : ' + ') : v < 0 ? '−' : ''}${Math.abs(v) === 1 ? '' : Math.abs(v)}${n}`).join('') + ` = ${d}`;
      ixRead(read, [{ h: 'The system' }, ...C.eqs.map((e, i) => ({ blue: 'blue', red: 'red', green: 'green' }[['blue', 'red', 'green'][i]] && `${eq(e)}  (${['blue', 'red', 'green'][i]})`)), { h: 'Solution' }, C.sol, { note: C.note }]);
    }
    ctl.append(ixSeg(Object.entries(IX_PLANES).map(([k, C]) => [k, C.name]), S.k, (k) => { S.k = k; draw(); }), el('div', { class: 'small' }, 'Drag the picture to turn it.'));
    ix3Turn(cv, S, draw); draw();
  } };

// ---- shared for Calculus III: surfaces z = f(x, y), with partial derivatives
const IX_SURF = {
  bowl: { name: 'z = x² + y²', f: (x, y) => x * x + y * y, fx: (x, y) => 2 * x, fy: (x, y) => 2 * y, zr: [0, 8] },
  saddle: { name: 'z = x² − y²', f: (x, y) => x * x - y * y, fx: (x) => 2 * x, fy: (x, y) => -2 * y, zr: [-4, 4] },
  hill: { name: 'z = 4e^(−(x² + y²)/2)', f: (x, y) => 4 * Math.exp(-(x * x + y * y) / 2), fx: (x, y) => -x * 4 * Math.exp(-(x * x + y * y) / 2), fy: (x, y) => -y * 4 * Math.exp(-(x * x + y * y) / 2), zr: [0, 4] },
  wave: { name: 'z = sin x cos y', f: (x, y) => Math.sin(x) * Math.cos(y), fx: (x, y) => Math.cos(x) * Math.cos(y), fy: (x, y) => -Math.sin(x) * Math.sin(y), zr: [-1, 1], R: 3.2 },
  plane: { name: 'z = 2 − x/2 − y/4', f: (x, y) => 2 - x / 2 - y / 4, fx: () => -0.5, fy: () => -0.25, zr: [-1, 5] } };
const ixHeat = (t) => { t = Math.max(0, Math.min(1, t)); const a = [[31, 95, 168], [46, 125, 79], [210, 123, 18], [181, 72, 43]], i = Math.min(2, Math.floor(t * 3)), u = t * 3 - i; return `rgb(${a[i].map((v, j) => Math.round(v + (a[i + 1][j] - v) * u)).join(',')})`; };
// contour segments of f = c on a grid (marching squares)
function ixContour(f, R, c, N = 60) {
  const segs = [], h = 2 * R / N, at = (i, j) => [-R + i * h, -R + j * h];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const p = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)], v = p.map(([x, y]) => f(x, y) - c), pts = [];
    for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a < 0) !== (b < 0)) { const t = a / (a - b), P = p[k], Q = p[(k + 1) % 4]; pts.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); } }
    if (pts.length >= 2) segs.push([pts[0], pts[1]]); if (pts.length === 4) segs.push([pts[2], pts[3]]);
  }
  return segs;
}

// ---- Surfaces and level curves
IX.surface = { subjects: ['calc3'],
  title: 'Surfaces and level curves', hint: 'Pick a surface z = f(x, y). Slide c: the plane z = c slices the surface, and that slice is the level curve f(x, y) = c on the contour map. Drag the surface to turn it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(880, 460), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_SURF[o.f] ? o.f : 'bowl', c: 2, az: -0.6, el: 0.45 }, sl = {};
    function draw() {
      ctx.clearRect(0, 0, 880, 460); const F = IX_SURF[S.k], R = F.R || 2, [z0, z1] = F.zr, zs = 2.4 / (z1 - z0), Z = (z) => (z - z0) * zs - 1.2, T = ix3(235, 255, 64 * 2 / R, S), P = (x, y, z) => T([x / R * 1.3 * R / 1.3, y, Z(z) * R / 1.3]);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 470, 460); ctx.clip();
      // wire mesh, back to front
      const N = 24, h = 2 * R / N, quads = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = -R + i * h, y = -R + j * h, c4 = [[x, y], [x + h, y], [x + h, y + h], [x, y + h]].map(([a, b]) => P(a, b, Math.max(z0 - 1, Math.min(z1 + 1, F.f(a, b))))); quads.push({ c4, d: c4.reduce((s, p) => s + p[2], 0), t: (F.f(x + h / 2, y + h / 2) - z0) / (z1 - z0) }); }
      quads.sort((a, b) => a.d - b.d).forEach((q) => ix3Poly(ctx, q.c4, ixHeat(q.t) + '', 'rgba(255,255,255,.55)', 0.8));
      // the plane z = c and the slice
      const pc = [[-R, -R], [R, -R], [R, R], [-R, R]].map(([a, b]) => P(a, b, S.c)); ix3Poly(ctx, pc, 'rgba(255,255,255,.35)', 'rgba(0,0,0,.35)', 1.2);
      ixContour(F.f, R, S.c, 50).forEach(([a, b]) => ixLine(ctx, P(a[0], a[1], S.c), P(b[0], b[1], S.c), IXC.ink, 3));
      [[[-R - 0.3, 0, z0], [R + 0.6, 0, z0], 'x'], [[0, -R - 0.3, z0], [0, R + 0.6, z0], 'y']].forEach(([a, b, n]) => { ixLine(ctx, P(...a), P(...b), IXC.gray, 1.4); ixLabel(ctx, n, P(...b)[0] + 4, P(...b)[1], 16, 'left', IXC.gray, 'middle'); });
      ctx.restore();
      // contour map
      const M = 490, sz = 360, mx = (x) => M + (x + R) / (2 * R) * sz, my = (y) => 50 + (R - y) / (2 * R) * sz;
      ctx.save(); ctx.strokeStyle = IXC.grid; ctx.strokeRect(M, 50, sz, sz); ctx.restore(); ixLine(ctx, [mx(-R), my(0)], [mx(R), my(0)], IXC.gray, 1.2); ixLine(ctx, [mx(0), my(-R)], [mx(0), my(R)], IXC.gray, 1.2);
      for (let k = 1; k < 10; k++) { const c = z0 + (z1 - z0) * k / 10; ixContour(F.f, R, c, 60).forEach(([a, b]) => ixLine(ctx, [mx(a[0]), my(a[1])], [mx(b[0]), my(b[1])], ixHeat(k / 10), 1.6)); }
      ixContour(F.f, R, S.c, 60).forEach(([a, b]) => ixLine(ctx, [mx(a[0]), my(a[1])], [mx(b[0]), my(b[1])], IXC.ink, 3.4));
      ixLabel(ctx, 'contour map (level curves)', M + sz / 2, 20, 16, 'center', IXC.gray); ixLabel(ctx, `bold: f(x, y) = ${ixN(S.c, 2)}`, M + sz / 2, 420, 16, 'center', IXC.ink);
      ixRead(read, [{ h: F.name }, `level curve: ${F.name.slice(4)} = ${ixN(S.c, 2)}`, { note: { bowl: 'Level curves are circles, closer together as the bowl gets steeper.', saddle: 'Level curves are hyperbolas; c = 0 gives the lines y = ±x.', hill: 'Circles, crowded where the hill is steepest.', wave: 'An egg-crate pattern of hills and valleys.', plane: 'A plane’s level curves are evenly spaced parallel lines.' }[S.k] },
        { note: 'Level curves close together mean the surface is steep there; far apart means it’s nearly flat.' }]);
    }
    sl.c = ixSlider('slice height c', 0, 8, 0.1, S.c, (v) => ixN(v, 2), (v) => { S.c = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_SURF).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; const [a, b] = IX_SURF[k].zr, i = sl.c.querySelector('input'); i.min = a; i.max = b; i.step = (b - a) / 80; S.c = +(a + (b - a) * 0.45).toFixed(2); sl.c.set(S.c); draw(); }), sl.c, el('div', { class: 'small' }, 'Drag the surface to turn it.'));
    ix3Turn(cv, S, draw, (x) => (x > 470 ? 'none' : null), () => {}); draw();
  } };

// ---- The cross product
IX.crossProduct = { subjects: ['calc3', 'precalc'],
  title: 'The cross product', hint: 'Set the components of u and v. u × v (green) is perpendicular to both, and its length is the area of the parallelogram they make. Swap the order and it points the other way. Drag to turn the picture.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const S = { u: [2, 0, 0], v: [1, 2, 0], swap: false, az: -0.7, el: 0.4 };
    function draw() {
      ctx.clearRect(0, 0, 600, 520); const T = ix3(300, 300, 38, S), [a, b] = S.swap ? [S.v, S.u] : [S.u, S.v], w = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], len = Math.hypot(...w), k = len > 5.5 ? 5.5 / len : 1, ws = w.map((t) => t * k);
      [[[-5, 0, 0], [5, 0, 0], 'x'], [[0, -5, 0], [0, 5, 0], 'y'], [[0, 0, -4], [0, 0, 5], 'z']].forEach(([p, q, n]) => { ixLine(ctx, T(p), T(q), IXC.gray, 1.4); ixLabel(ctx, n, T(q)[0] + 4, T(q)[1] - 4, 17, 'left', IXC.gray, 'bottom'); });
      ix3Poly(ctx, [T([0, 0, 0]), T(S.u), T(S.u.map((t, i) => t + S.v[i])), T(S.v)], 'rgba(210,123,18,.22)', IXC.orange, 1.6);
      const arrow = (p, col, n) => { const A = T([0, 0, 0]), B = T(p); ixLine(ctx, A, B, col, 3.4); const ang = Math.atan2(B[1] - A[1], B[0] - A[0]); ctx.save(); ctx.fillStyle = col; ctx.translate(B[0], B[1]); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-10, -6); ctx.lineTo(-10, 6); ctx.fill(); ctx.restore(); ixLabel(ctx, n, B[0] + 8, B[1] - 6, 20, 'left', col, 'bottom'); };
      arrow(S.u, IXC.blue, 'u'); arrow(S.v, IXC.red, 'v'); if (len > 1e-9) arrow(ws, IXC.green, S.swap ? 'v × u' : 'u × v');
      const [u1, u2, u3] = a, [v1, v2, v3] = b, nm = S.swap ? ['v', 'u'] : ['u', 'v'], f = (t) => `(${t.map((x) => ixN(x)).join(', ')})`;
      ixRead(read, [{ h: `${nm[0]} × ${nm[1]}` }, `${nm[0]} = ${f(a)}, ${nm[1]} = ${f(b)}`, `= (${ixN(u2)}·${ixN(v3)} − ${ixN(u3)}·${ixN(v2)}, ${ixN(u3)}·${ixN(v1)} − ${ixN(u1)}·${ixN(v3)}, ${ixN(u1)}·${ixN(v2)} − ${ixN(u2)}·${ixN(v1)})`, `= ${f(w)}`,
        { h: 'Perpendicular to both' }, `(${nm[0]} × ${nm[1]}) · ${nm[0]} = ${ixN(w[0] * a[0] + w[1] * a[1] + w[2] * a[2])}`, `(${nm[0]} × ${nm[1]}) · ${nm[1]} = ${ixN(w[0] * b[0] + w[1] * b[1] + w[2] * b[2])}`,
        { h: 'Area of the parallelogram' }, `‖${nm[0]} × ${nm[1]}‖ = √${ixN(w[0] ** 2 + w[1] ** 2 + w[2] ** 2)} ≈ ${ixN(len, 3)}`, k < 1 ? { note: 'The green arrow is drawn shorter to fit.' } : null, { note: 'Right-hand rule: curl your fingers from the first vector to the second; your thumb points along the cross product. u × v = −(v × u).' }]);
    }
    const sls = ['u', 'v'].flatMap((n) => [0, 1, 2].map((i) => ixSlider(`${n}${'₁₂₃'[i]}`, -4, 4, 1, S[n][i], String, (val) => { S[n][i] = val; draw(); })));
    ctl.append(...sls, ixSeg([[false, 'u × v'], [true, 'v × u']], S.swap, (k) => { S.swap = k; draw(); }), el('div', { class: 'small' }, 'Drag the picture to turn it.'));
    ix3Turn(cv, S, draw); draw();
  } };

// ---- The gradient and directional derivatives
IX.gradient = { subjects: ['calc3'],
  title: 'The gradient and directional derivatives', hint: 'Drag the point on the contour map. The gradient (red) points straight uphill, perpendicular to the level curve. Turn the blue direction u to see the directional derivative ∇f · u.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_SURF[o.f] && o.f !== 'plane' ? o.f : 'hill', P: [1, 0.6], ang: 200 };
    function draw() {
      ctx.clearRect(0, 0, 560, 560); const F = IX_SURF[S.k], R = F.R || 2, V = ixView(cv, [-R, R], [-R, R], 24), [z0, z1] = F.zr; ixGrid(ctx, V, { step: R > 3 ? 1 : 0.5, lab: 1 });
      for (let k = 1; k < 12; k++) { const c = z0 + (z1 - z0) * k / 12; ixContour(F.f, R, c, 70).forEach(([a, b]) => ixLine(ctx, [V.X(a[0]), V.Y(a[1])], [V.X(b[0]), V.Y(b[1])], ixHeat(k / 12), 1.8)); }
      const [x, y] = S.P, gx = F.fx(x, y), gy = F.fy(x, y), gl = Math.hypot(gx, gy), c0 = F.f(x, y);
      ixContour(F.f, R, c0, 90).forEach(([a, b]) => ixLine(ctx, [V.X(a[0]), V.Y(a[1])], [V.X(b[0]), V.Y(b[1])], IXC.ink, 2.6));
      const arrow = (d, col, n) => { const A = [V.X(x), V.Y(y)], B = [V.X(x + d[0]), V.Y(y + d[1])]; ixLine(ctx, A, B, col, 3.6); const an = Math.atan2(B[1] - A[1], B[0] - A[0]); ctx.save(); ctx.fillStyle = col; ctx.translate(B[0], B[1]); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-11, -7); ctx.lineTo(-11, 7); ctx.fill(); ctx.restore(); ixLabel(ctx, n, B[0] + 8, B[1] - 6, 19, 'left', col, 'bottom'); };
      const sc = R * 0.45 / Math.max(gl, 0.6); if (gl > 1e-6) arrow([gx * sc, gy * sc], IXC.red, '∇f');
      const t = S.ang * Math.PI / 180, u = [Math.cos(t), Math.sin(t)]; arrow([u[0] * R * 0.3, u[1] * R * 0.3], IXC.blue, 'u'); ixDot(ctx, V.X(x), V.Y(y), IXC.ink, 7, true);
      const Du = gx * u[0] + gy * u[1];
      ixRead(read, [{ h: F.name }, `at (${ixN(x, 2)}, ${ixN(y, 2)}): f = ${ixN(c0, 3)}`, { h: 'Gradient' }, `∇f = ⟨f_x, f_y⟩ = ⟨${ixN(gx, 3)}, ${ixN(gy, 3)}⟩`, `‖∇f‖ = ${ixN(gl, 3)} (the steepest slope)`,
        { h: `Directional derivative, u at ${S.ang}°` }, `u = ⟨${ixN(u[0], 3)}, ${ixN(u[1], 3)}⟩`, `D_u f = ∇f · u = ${ixN(Du, 3)}`, { note: Math.abs(Du) < 0.02 * Math.max(gl, 1) ? 'u is along the level curve: no change in f.' : Du > 0 ? 'Going this way, f increases.' : 'Going this way, f decreases.' },
        { note: 'D_u f is largest when u points along ∇f, and 0 when u is along the level curve.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_SURF).filter(([k]) => k !== 'plane').map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; S.P = [IX_SURF[k].R ? 1.2 : 0.8, 0.6]; draw(); }), ixSlider('direction of u', 0, 355, 5, S.ang, (v) => v + '°', (v) => { S.ang = v; draw(); }), el('div', { class: 'small' }, 'Drag the black point.'));
    ixDrag(cv, () => 'p', (h, px, py) => { const R = IX_SURF[S.k].R || 2, V = ixView(cv, [-R, R], [-R, R], 24); S.P = [Math.max(-R, Math.min(R, V.ix(px))), Math.max(-R, Math.min(R, V.iy(py)))]; draw(); });
    draw();
  } };

// ---- Matrices (ACT): add, multiply, determinant
IX.matrices = { subjects: ['act', 'algebra2'],
  title: 'Matrices: add, multiply, and determinants', hint: 'Type entries in A and B. Pick an operation. For multiplying, click an entry of the answer to see the row-times-column that makes it.',
  build({ main, ctl, read }, o) {
    const S = { op: o.op || 'mult', A: [[2, 1], [3, -1]], B: [[1, 4], [2, 0]], pick: [0, 0], big: false };
    const box = el('div', { style: 'display:flex;flex-wrap:wrap;gap:22px;align-items:center;font-size:22px;font-family:' + IXF + ';padding:16px' }); main.append(box);
    const mat = (M, name, edit, hl) => { const t = el('table', { style: 'border-collapse:separate;border-spacing:4px;border-left:3px solid #1d1d1b;border-right:3px solid #1d1d1b;border-radius:6px;padding:2px 4px' });
      M.forEach((row, i) => t.append(el('tr', {}, ...row.map((v, j) => { const hi = hl && hl(i, j); if (!edit) { const td = el('td', { style: `min-width:52px;text-align:center;padding:6px;border-radius:6px;${hi ? 'background:' + hi : ''};cursor:${name === 'answer' && S.op === 'mult' ? 'pointer' : 'default'}` }, ixN(v, 3)); if (name === 'answer' && S.op === 'mult') td.addEventListener('click', () => { S.pick = [i, j]; draw(); }); return td; }
        const inp = el('input', { type: 'number', value: v, style: `width:56px;font-size:20px;text-align:center;padding:4px;border-radius:6px;border:1px solid #ccc;${hi ? 'background:' + hi : ''}` }); inp.addEventListener('input', () => { M[i][j] = +inp.value || 0; draw(false); }); return el('td', {}, inp); }))));
      return el('div', { style: 'text-align:center' }, el('div', { style: 'font-size:16px;color:#6b6b6b;margin-bottom:4px' }, name), t); };
    const resize = () => { const n = S.big ? 3 : 2, fix = (M, seed) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (M[i] && M[i][j] != null ? M[i][j] : (seed * (i + 2) + j) % 5 - 1))); S.A = fix(S.A, 2); S.B = fix(S.B, 3); };
    function draw(rebuild = true) {
      const { A, B } = S, n = A.length, L = []; let R = null;
      if (S.op === 'add') { R = A.map((r, i) => r.map((v, j) => v + B[i][j])); L.push({ h: 'A + B' }, 'Add matching entries.', `top left: ${ixN(A[0][0])} + ${ixN(B[0][0])} = ${ixN(R[0][0])}`); }
      if (S.op === 'mult') { R = A.map((r, i) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))); const [i, j] = S.pick.map((t) => Math.min(t, n - 1));
        L.push({ h: 'AB' }, `entry (row ${i + 1}, column ${j + 1}) = row ${i + 1} of A · column ${j + 1} of B`, A[i].map((v, k) => `(${ixN(v)})(${ixN(B[k][j])})`).join(' + ') + ` = ${ixN(R[i][j])}`, { note: 'Click any entry of AB to see how it’s made. AB and BA are usually different.' }); }
      const det2 = (M) => M[0][0] * M[1][1] - M[0][1] * M[1][0], det = (M) => (M.length === 2 ? det2(M) : M[0][0] * det2([[M[1][1], M[1][2]], [M[2][1], M[2][2]]]) - M[0][1] * det2([[M[1][0], M[1][2]], [M[2][0], M[2][2]]]) + M[0][2] * det2([[M[1][0], M[1][1]], [M[2][0], M[2][1]]]));
      if (S.op === 'det') { const d = det(A); L.push({ h: 'det A' }, n === 2 ? `ad − bc = (${ixN(A[0][0])})(${ixN(A[1][1])}) − (${ixN(A[0][1])})(${ixN(A[1][0])})` : 'expand along the first row:', n === 3 ? `${ixN(A[0][0])}(${ixN(det2([[A[1][1], A[1][2]], [A[2][1], A[2][2]]]))}) − ${ixN(A[0][1])}(${ixN(det2([[A[1][0], A[1][2]], [A[2][0], A[2][2]]]))}) + ${ixN(A[0][2])}(${ixN(det2([[A[1][0], A[1][1]], [A[2][0], A[2][1]]]))})` : null, `det A = ${ixN(d)}`,
        n === 2 && d !== 0 ? { h: 'Inverse' } : null, n === 2 && d !== 0 ? `A⁻¹ = (${d < 0 ? '−' : ''}1/${Math.abs(d)}) [${ixN(A[1][1])}, ${ixN(-A[0][1])}; ${ixN(-A[1][0])}, ${ixN(A[0][0])}]` : null, d === 0 ? { note: 'det A = 0: A has no inverse.', bad: true } : null); }
      L.push({ note: 'TI-Nspire: use the matrix template (the template key, then the matrix with rows and columns). det is menu → 7 Matrix & Vector → 3 Determinant.' });
      if (rebuild) { const [pi, pj] = S.pick; box.innerHTML = ''; box.append(mat(A, 'A', true, S.op === 'mult' ? (i) => (i === pi ? '#f6dcd3' : null) : null));
        if (S.op !== 'det') box.append(el('span', {}, S.op === 'add' ? '+' : '·'), mat(B, 'B', true, S.op === 'mult' ? (i, j) => (j === pj ? '#dce7f3' : null) : null), el('span', {}, '='), mat(R, 'answer', false, S.op === 'mult' ? (i, j) => (i === pi && j === pj ? '#cfe8d8' : null) : null)); }
      else { const ans = box.querySelectorAll('table')[S.op === 'det' ? 99 : 2]; if (ans && R) ans.querySelectorAll('td').forEach((td, q) => { td.textContent = ixN(R[Math.floor(q / n)][q % n], 3); }); }
      ixRead(read, L);
    }
    ctl.append(ixSeg([['add', 'A + B'], ['mult', 'A · B'], ['det', 'det A and inverse']], S.op, (k) => { S.op = k; draw(); }), ixCheck('3 × 3', S.big, (v) => { S.big = v; S.pick = [0, 0]; resize(); draw(); }));
    draw();
  } };

// ---- Percent change (ACT)
IX.percent = { subjects: ['act', 'algebra1'],
  title: 'Percent increase and decrease', hint: 'Apply two percent changes in a row. Each change multiplies by (1 + p). That’s why +20% then −20% doesn’t get you back where you started.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 440), ctx = cv._ctx; main.append(cv);
    const S = { mode: 'two', v: 100, p1: 20, p2: -20, sale: 60, off: 25 };
    function draw() {
      ctx.clearRect(0, 0, 600, 440); let bars, L;
      if (S.mode === 'two') { const a = S.v, b = a * (1 + S.p1 / 100), c = b * (1 + S.p2 / 100), m = (1 + S.p1 / 100) * (1 + S.p2 / 100);
        bars = [['start', a, IXC.gray], [`${S.p1 >= 0 ? '+' : ''}${S.p1}%`, b, S.p1 >= 0 ? IXC.green : IXC.red], [`${S.p2 >= 0 ? '+' : ''}${S.p2}%`, c, S.p2 >= 0 ? IXC.green : IXC.red]];
        L = [{ h: 'Two changes in a row' }, `${ixN(a)} × ${ixN(1 + S.p1 / 100, 3)} = ${ixN(b, 2)}`, `${ixN(b, 2)} × ${ixN(1 + S.p2 / 100, 3)} = ${ixN(c, 2)}`, { h: 'Overall' }, `multiplier: ${ixN(1 + S.p1 / 100, 3)} × ${ixN(1 + S.p2 / 100, 3)} = ${ixN(m, 4)}`, `net change: ${m >= 1 ? '+' : ''}${ixN((m - 1) * 100, 2)}%`,
          S.p1 === -S.p2 && S.p1 !== 0 ? { note: `The second ${Math.abs(S.p2)}% is taken of a ${S.p1 > 0 ? 'bigger' : 'smaller'} number, so you don’t get back to ${ixN(a)}.` } : { note: 'Percents don’t add: multiply the factors instead.' }]; }
      else { const d = S.off / 100, orig = S.sale / (1 - d); bars = [['original', orig, IXC.gray], [`${S.off}% off`, S.sale, IXC.red]];
        L = [{ h: 'Find the original price' }, `sale price = original × (1 − ${ixN(d, 2)})`, `${ixN(S.sale)} = original × ${ixN(1 - d, 2)}`, `original = ${ixN(S.sale)}/${ixN(1 - d, 2)} = $${ixN(orig, 2)}`, { note: `A common wrong answer: ${ixN(S.sale)} + ${S.off}% of ${ixN(S.sale)} = ${ixN(S.sale * (1 + d), 2)}. The ${S.off}% was taken of the original, not the sale price.`, bad: true }]; }
      const top = Math.max(...bars.map((b) => b[1])) * 1.15, W = 120, gap = (600 - bars.length * W) / (bars.length + 1);
      bars.forEach(([t, v, col], i) => { const x = gap + i * (W + gap), h = v / top * 340; ctx.save(); ctx.fillStyle = col + '55'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.fillRect(x, 390 - h, W, h); ctx.strokeRect(x, 390 - h, W, h); ctx.restore(); ixLabel(ctx, (S.mode === 'sale' ? '$' : '') + ixN(v, 2), x + W / 2, 384 - h, 20, 'center', IXC.ink, 'bottom'); ixLabel(ctx, t, x + W / 2, 398, 18, 'center', col); });
      ixLine(ctx, [20, 390], [580, 390], IXC.ink, 2); if (S.mode === 'two') ixLine(ctx, [20, 390 - S.v / top * 340], [580, 390 - S.v / top * 340], IXC.gray, 1.4, true);
      ixRead(read, L);
    }
    const two = el('div', {}, ixSlider('start', 10, 200, 10, S.v, String, (v) => { S.v = v; draw(); }), ixSlider('first change', -50, 50, 5, S.p1, (v) => (v > 0 ? '+' : '') + v + '%', (v) => { S.p1 = v; draw(); }), ixSlider('second change', -50, 50, 5, S.p2, (v) => (v > 0 ? '+' : '') + v + '%', (v) => { S.p2 = v; draw(); }));
    const sale = el('div', {}, ixSlider('sale price ($)', 10, 200, 5, S.sale, (v) => '$' + v, (v) => { S.sale = v; draw(); }), ixSlider('percent off', 5, 75, 5, S.off, (v) => v + '%', (v) => { S.off = v; draw(); }));
    const vis = () => { two.style.display = S.mode === 'two' ? '' : 'none'; sale.style.display = S.mode === 'two' ? 'none' : ''; };
    ctl.append(ixSeg([['two', 'Two changes in a row'], ['sale', 'Find the original price']], S.mode, (k) => { S.mode = k; vis(); draw(); }), two, sale); vis(); draw();
  } };

// ======== AP Calculus ========
// numeric helpers: derivative, second derivative, Simpson’s rule, and roots on an interval
const ixD = (f, x, h = 1e-4) => (f(x + h) - f(x - h)) / (2 * h);
const ixD2 = (f, x, h = 1e-3) => (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
const ixInt = (f, a, b, n = 600) => { if (a === b) return 0; const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
const ixRoots = (f, a, b, n = 2000) => { const out = []; let x0 = a, y0 = f(a); for (let i = 1; i <= n; i++) { const x1 = a + (b - a) * i / n, y1 = f(x1); if (isFinite(y0) && isFinite(y1)) { if (y0 === 0) out.push(x0); else if (y0 * y1 < 0) { let lo = x0, hi = x1; for (let j = 0; j < 50; j++) { const m = (lo + hi) / 2; (f(lo) * f(m) <= 0) ? (hi = m) : (lo = m); } out.push((lo + hi) / 2); } } x0 = x1; y0 = y1; } return out.filter((x, i, A) => !i || x - A[i - 1] > 1e-6); };
const ixArrow = (ctx, A, B, col, w = 3, lab) => { ixLine(ctx, A, B, col, w); const an = Math.atan2(B[1] - A[1], B[0] - A[0]); if (Math.hypot(B[0] - A[0], B[1] - A[1]) > 6) { ctx.save(); ctx.fillStyle = col; ctx.translate(B[0], B[1]); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-10, -6); ctx.lineTo(-10, 6); ctx.fill(); ctx.restore(); } if (lab) ixLabel(ctx, lab, B[0] + 8, B[1] - 6, 18, 'left', col, 'bottom'); };
const ixOpen = (ctx, x, y, col, r = 6) => { ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); };
const ixSel = (opts, cur, on, lab) => { const s = el('select', { 'aria-label': lab || 'Pick', style: 'font-size:16px;padding:5px;max-width:100%' }, ...opts.map(([k, t]) => el('option', { value: k }, t))); s.value = cur; s.addEventListener('change', () => on(s.value)); return el('label', { class: 'ix-sl', style: 'display:block' }, lab ? el('span', {}, lab) : '', s); };
const ixLim = (v) => (v === Infinity ? '∞' : v === -Infinity ? '−∞' : Number.isNaN(v) ? 'does not exist' : ixN(v, 4));

// ---- Limits from a graph and a table
const IX_LIMS = {
  hole: { name: '(x² − 4)/(x − 2) at x = 2', f: (x) => (x * x - 4) / (x - 2), a: 2, val: NaN, L: 4, R: 4, yr: [-2, 7] },
  moved: { name: 'x², but f(1) = 3', f: (x) => x * x, a: 1, val: 3, L: 1, R: 1, yr: [-1, 5] },
  jump: { name: 'x + 1 (x < 1), x − 1 (x ≥ 1)', f: (x) => (x < 1 ? x + 1 : x - 1), a: 1, val: 0, L: 2, R: 0, yr: [-3, 4] },
  vert: { name: '1/(x − 1)² at x = 1', f: (x) => 1 / (x - 1) ** 2, a: 1, val: NaN, L: Infinity, R: Infinity, yr: [-1, 10] },
  sign: { name: '1/(x − 1) at x = 1', f: (x) => 1 / (x - 1), a: 1, val: NaN, L: -Infinity, R: Infinity, yr: [-8, 8] },
  osc: { name: 'sin(1/x) at x = 0', f: (x) => Math.sin(1 / x), a: 0, val: NaN, L: NaN, R: NaN, yr: [-2, 2], xr: [-1, 1] },
  cont: { name: 'x² − 1 at x = 2', f: (x) => x * x - 1, a: 2, val: 3, L: 3, R: 3, yr: [-2, 8] } };
IX.limit = { subjects: ['apcalc', 'precalc'],
  title: 'Limits and continuity', hint: 'Pick a function. Slide x closer to a from both sides and watch the table. The limit is where the y-values head, not necessarily f(a).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_LIMS[o.k] ? o.k : 'hole', e: 0 };
    function draw() {
      const F = IX_LIMS[S.k], a = F.a, xr = F.xr || [a - 4, a + 4], V = ixView(cv, xr, F.yr, 26); ctx.clearRect(0, 0, 600, 540); ixGrid(ctx, V, { step: 1, lab: 1 });
      if (S.k === 'jump') { ixCurve(ctx, V, F.f, IXC.blue, { w: 3.2, b: a - 1e-9 }); ixCurve(ctx, V, F.f, IXC.blue, { w: 3.2, a }); } else ixCurve(ctx, V, (x) => (Math.abs(x - a) < 1e-9 ? NaN : F.f(x)), IXC.blue, { w: 3.2, n: S.k === 'osc' ? 6000 : 1200 });
      ixLine(ctx, [V.X(a), V.Y(F.yr[0])], [V.X(a), V.Y(F.yr[1])], IXC.gray, 1.4, true);
      if (isFinite(F.L) && S.k !== 'osc') ixOpen(ctx, V.X(a), V.Y(F.L), IXC.blue); if (isFinite(F.R) && F.R !== F.L) ixOpen(ctx, V.X(a), V.Y(F.R), IXC.blue); if (isFinite(F.val)) ixDot(ctx, V.X(a), V.Y(F.val), IXC.blue, 7);
      const h = Math.pow(10, -S.e) * (S.k === 'osc' ? 0.5 : 1.5), xl = a - h, xR = a + h;
      [[xl, IXC.red], [xR, IXC.green]].forEach(([x, c]) => { const y = F.f(x); if (isFinite(y) && y > F.yr[0] && y < F.yr[1]) { ixDot(ctx, V.X(x), V.Y(y), c, 7, true); ixLine(ctx, [V.X(x), V.Y(y)], [V.X(x), V.Y(0)], c, 1.4, true); } });
      const hs = [1, 0.1, 0.01, 0.001], row = (d) => `${hs.map((t) => ixN(F.f(a + d * t), 4)).join(', ')}`;
      const lim = F.L === F.R ? F.L : NaN, cont = isFinite(F.val) && isFinite(lim) && Math.abs(F.val - lim) < 1e-9;
      ixRead(read, [{ h: F.name }, { h: `From the left (x = ${a} − 1, − 0.1, − 0.01, − 0.001)` }, row(-1), { h: 'From the right' }, row(1),
        { h: 'Limits' }, `lim x→${a}⁻ f(x) = ${ixLim(F.L)}`, `lim x→${a}⁺ f(x) = ${ixLim(F.R)}`, `lim x→${a} f(x) = ${F.L === F.R ? ixLim(F.L) : 'does not exist (left ≠ right)'}`, `f(${a}) = ${isFinite(F.val) ? ixN(F.val) : 'undefined'}`,
        cont ? { note: 'Continuous at a: f(a) exists, the limit exists, and they’re equal.', good: true } : { note: `Not continuous at x = ${a}: ${!isFinite(F.val) ? 'f(a) is undefined' : !isFinite(lim) ? 'the limit doesn’t exist (as a number)' : 'the limit isn’t f(a)'}. ${S.k === 'hole' || S.k === 'moved' ? 'It’s a removable discontinuity (a hole).' : S.k === 'jump' ? 'It’s a jump discontinuity.' : S.k === 'osc' ? 'It oscillates forever.' : 'It’s an infinite discontinuity (vertical asymptote).'}`, bad: true }]);
    }
    ctl.append(ixSel(Object.entries(IX_LIMS).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; draw(); }, 'Function'), ixSlider('move closer to a', 0, 3, 0.1, S.e, (v) => 'h = ' + ixN(Math.pow(10, -v) * 1.5, 4), (v) => { S.e = v; draw(); }));
    draw();
  } };

// ---- ε-δ definition of a limit
IX.epsDelta = { subjects: ['apcalc'],
  title: 'The ε-δ definition of a limit', hint: 'Pick ε (the red band around L). Then find a δ (the blue band around a) small enough that the graph over the blue band stays inside the red band.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: 'lin', eps: 1, del: 0.8 }, F = { lin: { name: 'f(x) = 2x + 1, a = 2, L = 5', f: (x) => 2 * x + 1, a: 2, L: 5, rule: (e) => e / 2, ruleT: 'δ = ε/2' }, sq: { name: 'f(x) = x², a = 2, L = 4', f: (x) => x * x, a: 2, L: 4, rule: (e) => Math.min(1, e / 5), ruleT: 'δ = min(1, ε/5)' } };
    function draw() {
      const D = F[S.k], V = ixView(cv, [-0.5, 4.5], [0, 10], 26); ctx.clearRect(0, 0, 580, 540); ixGrid(ctx, V, { step: 1, lab: 1 });
      ctx.save(); ctx.fillStyle = 'rgba(181,72,43,.12)'; ctx.fillRect(V.X(-0.5), V.Y(D.L + S.eps), V.X(4.5) - V.X(-0.5), V.Y(D.L - S.eps) - V.Y(D.L + S.eps)); ctx.fillStyle = 'rgba(31,95,168,.12)'; ctx.fillRect(V.X(D.a - S.del), V.Y(10), V.X(D.a + S.del) - V.X(D.a - S.del), V.Y(0) - V.Y(10)); ctx.restore();
      ixCurve(ctx, V, D.f, IXC.ink, { w: 2.4 }); let ok = true; for (let x = D.a - S.del; x <= D.a + S.del; x += S.del / 200) if (Math.abs(D.f(x) - D.L) >= S.eps) { ok = false; break; }
      ixCurve(ctx, V, D.f, ok ? IXC.green : IXC.red, { w: 4, a: D.a - S.del, b: D.a + S.del }); ixOpen(ctx, V.X(D.a), V.Y(D.L), IXC.ink);
      ixLabel(ctx, 'L + ε', V.X(-0.45), V.Y(D.L + S.eps) - 2, 15, 'left', IXC.red, 'bottom'); ixLabel(ctx, 'L − ε', V.X(-0.45), V.Y(D.L - S.eps) + 2, 15, 'left', IXC.red);
      ixRead(read, [{ h: D.name }, `ε = ${ixN(S.eps, 3)}, δ = ${ixN(S.del, 3)}`, ok ? { note: 'This δ works: whenever 0 < |x − a| < δ, |f(x) − L| < ε (the green piece stays in the red band).', good: true } : { note: 'This δ is too big: part of the graph over the blue band leaves the red band.', bad: true },
        { h: 'A δ that always works' }, `${D.ruleT} = ${ixN(D.rule(S.eps), 4)}`, { note: 'The definition: for every ε > 0 there is a δ > 0 such that 0 < |x − a| < δ implies |f(x) − L| < ε. Shrink ε and find a new δ.' }]);
    }
    const dS = ixSlider('δ', 0.02, 2, 0.01, S.del, (v) => ixN(v, 2), (v) => { S.del = v; draw(); });
    ctl.append(ixSeg([['lin', '2x + 1'], ['sq', 'x²']], S.k, (k) => { S.k = k; draw(); }), ixSlider('ε', 0.1, 3, 0.05, S.eps, (v) => ixN(v, 2), (v) => { S.eps = v; draw(); }), dS,
      el('div', { class: 'ix-btns' }, ixBtn('Use the rule for δ', () => { S.del = Math.max(0.02, F[S.k].rule(S.eps)); dS.set(S.del); draw(); })));
    draw();
  } };

// ---- The Squeeze Theorem
IX.squeeze = { subjects: ['apcalc'],
  title: 'The Squeeze Theorem', hint: 'The function (blue) is trapped between two others (red and green) that have the same limit. Zoom in: it has nowhere to go but that limit.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: 'x2', z: 0 }, F = { x2: { name: 'x² sin(1/x) at x = 0', f: (x) => x * x * Math.sin(1 / x), lo: (x) => -x * x, hi: (x) => x * x, L: 0, lt: '−x² ≤ x² sin(1/x) ≤ x²' }, sinx: { name: 'sin x / x at x = 0', f: (x) => Math.sin(x) / x, lo: Math.cos, hi: () => 1, L: 1, lt: 'cos x ≤ sin x / x ≤ 1' } };
    function draw() {
      const D = F[S.k], w = 2 * Math.pow(10, -S.z) * (S.k === 'sinx' ? 1.6 : 1), V = ixView(cv, [-w, w], S.k === 'sinx' ? [1 - w * w * 0.6 - 0.05 * w, 1 + w * w * 0.2 + 0.05 * w] : [-w * w * 1.2, w * w * 1.2], 30);
      ctx.clearRect(0, 0, 580, 520); ixGrid2(ctx, V, w / 4, (V.yr[1] - V.yr[0]) / 8, w / 2, (V.yr[1] - V.yr[0]) / 4);
      ixCurve(ctx, V, D.lo, IXC.red, { w: 2.6 }); ixCurve(ctx, V, D.hi, IXC.green, { w: 2.6 }); ixCurve(ctx, V, D.f, IXC.blue, { w: 2.4, n: 5000 }); ixOpen(ctx, V.X(0), V.Y(D.L), IXC.ink);
      ixRead(read, [{ h: D.name }, D.lt, `both outside functions → ${D.L} as x → 0`, `so lim x→0 = ${D.L}`, { note: 'Squeeze Theorem: if g(x) ≤ f(x) ≤ h(x) near a, and g and h have the same limit L at a, then f has limit L too.' }, `window: −${ixN(w, 5)} < x < ${ixN(w, 5)}`]);
    }
    ctl.append(ixSeg([['x2', 'x² sin(1/x)'], ['sinx', 'sin x / x']], S.k, (k) => { S.k = k; draw(); }), ixSlider('zoom in', 0, 2, 0.1, S.z, (v) => '×' + ixN(Math.pow(10, v), 1), (v) => { S.z = v; draw(); }));
    draw();
  } };

// ---- functions with known derivatives, for the derivative interactives
const IX_CFN = {
  sq: { name: 'x²', f: (x) => x * x, d: (x) => 2 * x, ds: '2x', xr: [-3, 3], yr: [-2, 9] },
  cub: { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, ds: '3x² − 3', xr: [-3, 3], yr: [-6, 6] },
  sin: { name: 'sin x', f: Math.sin, d: Math.cos, ds: 'cos x', xr: [-2 * Math.PI, 2 * Math.PI], yr: [-2, 2] },
  exp: { name: 'eˣ', f: Math.exp, d: Math.exp, ds: 'eˣ', xr: [-3, 2.5], yr: [-1, 8] },
  ln: { name: 'ln x', f: (x) => (x > 0 ? Math.log(x) : NaN), d: (x) => (x > 0 ? 1 / x : NaN), ds: '1/x', xr: [-0.5, 6], yr: [-3, 3] },
  sqrt: { name: '√x', f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), d: (x) => (x > 0 ? 0.5 / Math.sqrt(x) : NaN), ds: '1/(2√x)', xr: [-0.5, 9], yr: [-1, 4] },
  abs: { name: '|x|', f: Math.abs, d: (x) => (x > 0 ? 1 : x < 0 ? -1 : NaN), ds: '−1 (x < 0), 1 (x > 0)', xr: [-3, 3], yr: [-1, 4] } };

// ---- Secant lines become the tangent line
IX.secant = { subjects: ['apcalc'],
  title: 'From secant line to tangent line', hint: 'Slide h toward 0. The secant line through (a, f(a)) and (a + h, f(a + h)) turns into the tangent line, and its slope becomes the derivative f′(a).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: 'sq', a: 1, h: 1.5 };
    function draw() {
      const F = IX_CFN[S.k], V = ixView(cv, F.xr, F.yr, 26), a = S.a, h = S.h; ctx.clearRect(0, 0, 580, 540); ixGrid(ctx, V, { step: 1, lab: 1, ...(S.k === 'sin' ? { piX: 0.5 } : {}) });
      ixCurve(ctx, V, F.f, IXC.blue, { w: 3.2 }); const fa = F.f(a), fb = F.f(a + h), m = (fb - fa) / h, mt = F.d(a);
      if (isFinite(mt)) ixCurve(ctx, V, (x) => fa + mt * (x - a), IXC.green, { w: 2, dash: true }); if (isFinite(m) && h) ixCurve(ctx, V, (x) => fa + m * (x - a), IXC.red, { w: 2.6 });
      ixDot(ctx, V.X(a), V.Y(fa), IXC.ink, 7); if (isFinite(fb)) ixDot(ctx, V.X(a + h), V.Y(fb), IXC.red, 7, true);
      const tbl = [1, 0.1, 0.01, 0.001].map((t) => `h = ${t}: ${ixN((F.f(a + t) - fa) / t, 5)}`);
      ixRead(read, [{ h: `f(x) = ${F.name}, a = ${ixN(a, 2)}` }, { h: 'Slope of the secant (red)' }, '(f(a + h) − f(a))/h', `= (${ixN(fb, 4)} − ${ixN(fa, 4)})/${ixN(h, 3)} = ${ixN(m, 4)}`, { h: 'As h → 0' }, ...tbl, { h: 'Slope of the tangent (green)' }, `f′(a) = ${isFinite(mt) ? ixN(mt, 4) : 'undefined'}`, `f′(x) = ${F.ds}`]);
    }
    const aS = ixSlider('a', -2, 2, 0.1, S.a, (v) => ixN(v, 2), (v) => { S.a = v; draw(); }), hS = ixSlider('h', -2, 2, 0.01, S.h, (v) => ixN(v, 2), (v) => { S.h = v || 0.01; draw(); });
    ctl.append(ixSeg(Object.entries(IX_CFN).filter(([k]) => k !== 'abs').map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; const F = IX_CFN[k], lo = Math.max(F.xr[0], k === 'ln' || k === 'sqrt' ? 0.5 : -2), i = aS.querySelector('input'); i.min = lo; i.max = Math.min(F.xr[1] - 0.5, 4); S.a = Math.max(lo, Math.min(+i.max, S.a)); aS.set(S.a); draw(); }), aS, hS,
      el('div', { class: 'ix-btns' }, ...[1, 0.5, 0.1, 0.01].map((v) => ixBtn('h = ' + v, () => { S.h = v; hS.set(v); draw(); }))));
    draw();
  } };

// ---- The graph of f and the graph of f′
IX.derivGraph = { subjects: ['apcalc'],
  title: 'Graphing f′ from f', hint: 'Drag along the top graph. The slope of the tangent line at each x is plotted as the height of f′ below. Where f rises, f′ is above the axis; at a peak or valley, f′ = 0.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_CFN[o.k] ? o.k : 'cub', x: -1.5, trace: true };
    function draw() {
      const F = IX_CFN[S.k], T0 = ixView({ _w: 600, _h: 300 }, F.xr, F.yr, 24), T = T0, dmax = Math.max(2, ...Array.from({ length: 101 }, (_, i) => Math.abs(F.d(F.xr[0] + (F.xr[1] - F.xr[0]) * i / 100)) || 0).filter(isFinite).map((v) => Math.min(v, 9)));
      const B0 = ixView({ _w: 600, _h: 300 }, F.xr, [-dmax * 1.15, dmax * 1.15], 24), B = { ...B0, Y: (y) => 300 + B0.Y(y) }; ctx.clearRect(0, 0, 600, 600);
      const piX = S.k === 'sin' ? { piX: 0.5 } : {}; ixGrid(ctx, T, { step: 1, lab: F.yr[1] - F.yr[0] > 8 ? 2 : 1, ...piX }); ixGrid(ctx, B, { step: 1, lab: dmax > 4 ? 2 : 1, ...piX }); ixLine(ctx, [0, 300], [600, 300], '#cfcabd', 2);
      ixLabel(ctx, `f(x) = ${F.name}`, 590, 6, 17, 'right', IXC.blue); ixLabel(ctx, `f′(x)`, 590, 306, 17, 'right', IXC.red);
      ixCurve(ctx, T, F.f, IXC.blue, { w: 3 }); if (S.trace) ixCurve(ctx, B, F.d, IXC.red, { w: 2.6, b: S.x }); else ixCurve(ctx, B, F.d, IXC.red, { w: 2.6 });
      const x = S.x, y = F.f(x), m = F.d(x); if (isFinite(y)) { if (isFinite(m)) ixCurve(ctx, T, (t) => y + m * (t - x), IXC.green, { w: 2, a: x - 1.2, b: x + 1.2 }); ixDot(ctx, T.X(x), T.Y(y), IXC.blue, 7, true); }
      if (isFinite(m)) { ixDot(ctx, B.X(x), B.Y(m), IXC.red, 7, true); ixLine(ctx, [B.X(x), B.Y(0)], [B.X(x), B.Y(m)], IXC.red, 1.4, true); }
      ixLine(ctx, [T.X(x), 0], [T.X(x), 600], IXC.gray, 1, true);
      ixRead(read, [{ h: `At x = ${ixN(x, 2)}` }, `f(x) = ${ixN(y, 3)}`, `slope of the tangent = f′(x) = ${isFinite(m) ? ixN(m, 3) : 'undefined'}`, isFinite(m) ? { note: Math.abs(m) < 0.05 ? 'Flat tangent: f′ = 0 (a possible peak or valley).' : m > 0 ? 'f is increasing here, so f′ > 0.' : 'f is decreasing here, so f′ < 0.' } : { note: 'No tangent line here (a corner or the edge of the domain): f′ doesn’t exist.', bad: true },
        { h: 'The derivative' }, `f′(x) = ${F.ds}`]);
    }
    ctl.append(ixSeg(Object.entries(IX_CFN).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; S.x = IX_CFN[k].xr[0] + 0.3; draw(); }), ixCheck('Trace f′ as you drag (unchecked: show all of f′)', S.trace, (v) => { S.trace = v; draw(); }), el('div', { class: 'small' }, 'Drag left and right on either graph.'));
    ixDrag(cv, () => 'x', (h, px) => { const F = IX_CFN[S.k], V = ixView({ _w: 600, _h: 300 }, F.xr, F.yr, 24); S.x = Math.max(F.xr[0], Math.min(F.xr[1], V.ix(px))); draw(); });
    draw();
  } };

// ---- Motion along a line
const IX_MOT = { a: { name: 's(t) = t³ − 6t² + 9t', s: (t) => t ** 3 - 6 * t * t + 9 * t, v: (t) => 3 * t * t - 12 * t + 9, a: (t) => 6 * t - 12, T: 5 }, b: { name: 's(t) = 2t² − 8t + 3', s: (t) => 2 * t * t - 8 * t + 3, v: (t) => 4 * t - 8, a: () => 4, T: 4 }, c: { name: 's(t) = 4 sin t', s: (t) => 4 * Math.sin(t), v: (t) => 4 * Math.cos(t), a: (t) => -4 * Math.sin(t), T: 2 * Math.PI }, e: { name: 's(t) = t³ − 9t² + 24t', s: (t) => t ** 3 - 9 * t * t + 24 * t, v: (t) => 3 * t * t - 18 * t + 24, a: (t) => 6 * t - 18, T: 5.5 } };
IX.motion = { subjects: ['apcalc'],
  title: 'Position, velocity, and acceleration', hint: 'Press ▶ or slide t. The particle moves along the line; the arrow is its velocity. It speeds up when v and a have the same sign, and slows down when they’re opposite.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_MOT[o.k] ? o.k : 'a', t: 0.5, play: null };
    function draw() {
      const M = IX_MOT[S.k], t = S.t, s = M.s(t), v = M.v(t), a = M.a(t); ctx.clearRect(0, 0, 620, 540);
      let lo = 0, hi = 0; for (let u = 0; u <= M.T; u += M.T / 200) { lo = Math.min(lo, M.s(u)); hi = Math.max(hi, M.s(u)); } const X = (x) => 40 + (x - lo + 1) / (hi - lo + 2) * 540;
      ixLine(ctx, [20, 70], [600, 70], IXC.ink, 2); for (let k = Math.ceil(lo - 1); k <= hi + 1; k++) { ixLine(ctx, [X(k), 64], [X(k), 76], IXC.ink, 1.2); if (k % 2 === 0) ixLabel(ctx, String(k), X(k), 80, 13, 'center', IXC.axis); }
      ixDot(ctx, X(s), 70, IXC.blue, 11); if (Math.abs(v) > 0.05) ixArrow(ctx, [X(s), 40], [X(s) + Math.sign(v) * Math.min(120, 12 + Math.abs(v) * 10), 40], IXC.green, 3, 'v'); ixLabel(ctx, 's', 30, 60, 16, 'center', IXC.gray, 'bottom');
      let vmax = 1; for (let u = 0; u <= M.T; u += M.T / 200) vmax = Math.max(vmax, Math.abs(M.s(u)), Math.abs(M.v(u)), Math.abs(M.a(u))); const G0 = ixView({ _w: 620, _h: 420 }, [0, M.T], [-vmax * 1.1, vmax * 1.1], 30), G = { ...G0, Y: (y) => 120 + G0.Y(y) };
      ixGrid2(ctx, G, M.T > 6 ? 1 : 0.5, Math.ceil(vmax / 4), 1, Math.ceil(vmax / 2)); ixCurve(ctx, G, M.s, IXC.blue, { w: 2.8 }); ixCurve(ctx, G, M.v, IXC.green, { w: 2.4 }); ixCurve(ctx, G, M.a, IXC.orange, { w: 2, dash: true });
      ixLine(ctx, [G.X(t), G.Y(-vmax * 1.1)], [G.X(t), G.Y(vmax * 1.1)], IXC.gray, 1.4, true); [[s, IXC.blue], [v, IXC.green], [a, IXC.orange]].forEach(([y, c]) => ixDot(ctx, G.X(t), G.Y(y), c, 6));
      ixLabel(ctx, 's(t)', 600, 128, 16, 'right', IXC.blue); ixLabel(ctx, 'v(t) = s′(t)', 600, 148, 16, 'right', IXC.green); ixLabel(ctx, 'a(t) = v′(t)', 600, 168, 16, 'right', IXC.orange);
      const rest = Math.abs(v) < 0.05, sp = v * a > 0;
      ixRead(read, [{ h: M.name }, `t = ${ixN(t, 2)}`, `position s = ${ixN(s, 3)}`, `velocity v = ${ixN(v, 3)} (${rest ? 'at rest' : v > 0 ? 'moving right' : 'moving left'})`, `acceleration a = ${ixN(a, 3)}`, `speed |v| = ${ixN(Math.abs(v), 3)}`,
        rest ? { note: 'v = 0: the particle is at rest (it may be turning around).' } : { note: sp ? 'v and a have the same sign: speeding up.' : Math.abs(a) < 1e-9 ? 'a = 0: constant speed for an instant.' : 'v and a have opposite signs: slowing down.', good: sp }]);
    }
    const stop = () => { if (S.play) { clearInterval(S.play); S.play = null; } }, tS = ixSlider('t', 0, IX_MOT[S.k].T, 0.01, S.t, (v) => ixN(v, 2), (v) => { stop(); S.t = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_MOT).map(([k, M]) => [k, M.name]), S.k, (k) => { stop(); S.k = k; S.t = 0; const i = tS.querySelector('input'); i.max = IX_MOT[k].T; tS.set(0); draw(); }), tS,
      el('div', { class: 'ix-btns' }, ixBtn('▶ Play', () => { stop(); S.t = 0; S.play = setInterval(() => { S.t += IX_MOT[S.k].T / 300; if (S.t >= IX_MOT[S.k].T || !cv.isConnected) { S.t = Math.min(S.t, IX_MOT[S.k].T); stop(); } tS.set(S.t); draw(); }, 30); })));
    draw();
  } };

// ---- Linear approximation
const IX_LIN = { sqrt: { name: '√x near 4', f: Math.sqrt, a: 4, x: 4.3 }, cbrt: { name: '∛x near 8', f: Math.cbrt, a: 8, x: 8.5 }, sin: { name: 'sin x near 0', f: Math.sin, a: 0, x: 0.3 }, exp: { name: 'eˣ near 0', f: Math.exp, a: 0, x: 0.2 }, ln: { name: 'ln x near 1', f: Math.log, a: 1, x: 1.2 } };
IX.linApprox = { subjects: ['apcalc'],
  title: 'Linear approximation', hint: 'Near x = a, the tangent line L(x) is very close to the curve. Zoom in to see the curve look straight. Use L(x) to estimate f(x).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: 'sqrt', dx: 0.3, z: 0 };
    function draw() {
      const F = IX_LIN[S.k], a = F.a, fa = F.f(a), m = ixD(F.f, a), L = (x) => fa + m * (x - a), x = a + S.dx, w = 3 / Math.pow(10, S.z), V = ixView(cv, [a - w, a + w], [fa - w * Math.max(1, Math.abs(m)) * 0.9, fa + w * Math.max(1, Math.abs(m)) * 0.9], 30);
      ctx.clearRect(0, 0, 580, 540); ixGrid2(ctx, V, w / 6, (V.yr[1] - V.yr[0]) / 8, w / 3, (V.yr[1] - V.yr[0]) / 4);
      ixCurve(ctx, V, F.f, IXC.blue, { w: 3.2 }); ixCurve(ctx, V, L, IXC.red, { w: 2.2, dash: true }); ixDot(ctx, V.X(a), V.Y(fa), IXC.ink, 6);
      if (Math.abs(S.dx) <= w) { ixDot(ctx, V.X(x), V.Y(F.f(x)), IXC.blue, 6); ixDot(ctx, V.X(x), V.Y(L(x)), IXC.red, 6); ixLine(ctx, [V.X(x), V.Y(F.f(x))], [V.X(x), V.Y(L(x))], IXC.purple, 2.4); }
      const c2 = ixD2(F.f, a);
      ixRead(read, [{ h: `f(x) = ${F.name}` }, `L(x) = f(a) + f′(a)(x − a)`, `L(x) = ${ixN(fa, 4)} + ${ixN(m, 4)}(x − ${a})`, { h: `Estimate at x = ${ixN(x, 3)}` }, `L(${ixN(x, 3)}) = ${ixN(L(x), 5)}`, `actual f(${ixN(x, 3)}) = ${ixN(F.f(x), 5)}`, `error = ${ixN(Math.abs(L(x) - F.f(x)), 5)}`,
        { note: Math.abs(c2) < 1e-6 ? 'f″(a) = 0 here, so the estimate is especially good.' : c2 < 0 ? 'f is concave down near a, so the tangent line is above the curve: the estimate is too big (an overestimate).' : 'f is concave up near a, so the tangent line is below the curve: the estimate is too small (an underestimate).' }, { note: 'Differential form: dy = f′(a) dx.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_LIN).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; draw(); }), ixSlider('Δx = x − a', -1, 1, 0.05, S.dx, (v) => ixN(v, 2), (v) => { S.dx = v; draw(); }), ixSlider('zoom in', 0, 2, 0.1, S.z, (v) => '×' + ixN(Math.pow(10, v), 1), (v) => { S.z = v; draw(); }));
    draw();
  } };

// ---- Related rates: a sliding ladder, a growing ripple
IX.relatedRates = { subjects: ['apcalc'],
  title: 'Related rates', hint: 'Ladder: the bottom slides out at a steady rate; watch how fast the top slides down. It speeds up near the ground. Ripple: the radius grows steadily, but the area grows faster and faster.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: 'ladder', x: 6, rate: 2, L: 10, play: null };
    function draw() {
      ctx.clearRect(0, 0, 600, 500); let L;
      if (S.k === 'ladder') { const u = 40, ox = 80, oy = 460, x = S.x, y = Math.sqrt(S.L * S.L - x * x), dy = -x / y * S.rate;
        ixLine(ctx, [ox, oy], [580, oy], IXC.ink, 3); ixLine(ctx, [ox, oy], [ox, 40], IXC.ink, 6); ctx.save(); ctx.fillStyle = '#e9e5da'; ctx.fillRect(ox - 30, 40, 30, oy - 40); ctx.restore();
        ixLine(ctx, [ox + x * u, oy], [ox, oy - y * u], IXC.orange, 7); ixRightMark(ctx, [ox, oy], [ox + 20, oy], [ox, oy - 20]);
        ixArrow(ctx, [ox + x * u, oy + 18], [ox + x * u + 50, oy + 18], IXC.green, 3, `${S.rate} ft/s`); ixArrow(ctx, [ox + 14, oy - y * u], [ox + 14, oy - y * u + Math.min(150, 25 * Math.abs(dy))], IXC.red, 3, `${ixN(Math.abs(dy), 2)} ft/s`);
        ixLabel(ctx, `x = ${ixN(x, 2)}`, ox + x * u / 2, oy + 4, 17, 'center', IXC.green); ixLabel(ctx, `y = ${ixN(y, 2)}`, ox + 34, oy - y * u / 2, 17, 'left', IXC.blue, 'middle'); ixLabel(ctx, `${S.L} ft`, ox + x * u / 2 + 14, oy - y * u / 2 - 10, 18, 'left', IXC.orange, 'bottom');
        L = [{ h: 'A 10-foot ladder slides down a wall' }, 'x² + y² = 100', 'differentiate with respect to t:', '2x (dx/dt) + 2y (dy/dt) = 0', 'dy/dt = −(x/y)(dx/dt)', `= −(${ixN(x, 2)}/${ixN(y, 2)})(${S.rate}) = ${ixN(dy, 3)} ft/s`, { note: 'The top slides down faster and faster as the bottom gets near the wall’s full length away.' }]; }
      else { const r = S.x, dA = 2 * Math.PI * r * S.rate, u = 26; [r * 0.33, r * 0.66, r].forEach((rr, i) => { ctx.save(); ctx.strokeStyle = IXC.blue; ctx.globalAlpha = 0.4 + i * 0.3; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(300, 250, rr * u, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); });
        ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.10)'; ctx.beginPath(); ctx.arc(300, 250, r * u, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); ixLine(ctx, [300, 250], [300 + r * u, 250], IXC.green, 3); ixLabel(ctx, `r = ${ixN(r, 2)}`, 300 + r * u / 2, 254, 17, 'center', IXC.green);
        L = [{ h: 'A ripple spreads in a pond' }, `dr/dt = ${S.rate} ft/s (steady)`, 'A = πr²', 'dA/dt = 2πr (dr/dt)', `= 2π(${ixN(r, 2)})(${S.rate}) ≈ ${ixN(dA, 2)} ft²/s`, { note: 'The radius grows steadily, but the area grows faster as the circle gets bigger: each new ring has more circumference.' }]; }
      ixRead(read, L);
    }
    const stop = () => { if (S.play) { clearInterval(S.play); S.play = null; } }, xS = ixSlider('x (bottom’s distance) / r', 0.5, 9.6, 0.05, S.x, (v) => ixN(v, 2), (v) => { stop(); S.x = v; draw(); });
    ctl.append(ixSeg([['ladder', 'Sliding ladder'], ['ripple', 'Ripple']], S.k, (k) => { stop(); S.k = k; S.x = k === 'ladder' ? 6 : 3; xS.set(S.x); draw(); }), xS, ixSlider('rate (ft/s)', 1, 4, 0.5, S.rate, (v) => ixN(v), (v) => { S.rate = v; draw(); }),
      el('div', { class: 'ix-btns' }, ixBtn('▶ Play', () => { stop(); S.x = 0.5; S.play = setInterval(() => { S.x += S.rate * 0.03 * (S.k === 'ladder' ? 0.5 : 0.5); if (S.x >= 9.6 || !cv.isConnected) { S.x = Math.min(S.x, 9.6); stop(); } xS.set(S.x); draw(); }, 30); })));
    draw();
  } };

// ---- L’Hôpital’s Rule
const IX_LH = { sin: { name: 'sin x / x, x → 0', f: Math.sin, g: (x) => x, a: 0, L: 1 }, exp: { name: '(eˣ − 1)/x, x → 0', f: (x) => Math.exp(x) - 1, g: (x) => x, a: 0, L: 1 }, ln: { name: 'ln x / (x − 1), x → 1', f: Math.log, g: (x) => x - 1, a: 1, L: 1 }, cos: { name: '(1 − cos x)/x², x → 0', f: (x) => 1 - Math.cos(x), g: (x) => x * x, a: 0, L: 0.5 }, poly: { name: '(x² − 9)/(x − 3), x → 3', f: (x) => x * x - 9, g: (x) => x - 3, a: 3, L: 6 } };
IX.lhopital = { subjects: ['apcalc'],
  title: 'L’Hôpital’s Rule', hint: 'Both the top f (blue) and bottom g (red) go to 0. Zoom in: near a, each looks like its tangent line, so f/g is about the ratio of their slopes, f′(a)/g′(a).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: 'sin', z: 0 };
    function draw() {
      const F = IX_LH[S.k], a = F.a, w = 2 / Math.pow(10, S.z), V = ixView(cv, [a - w, a + w], [-w * 1.6, w * 1.6], 30); ctx.clearRect(0, 0, 580, 520); ixGrid2(ctx, V, w / 4, w / 4, w / 2, w / 2);
      ixCurve(ctx, V, F.f, IXC.blue, { w: 3 }); ixCurve(ctx, V, F.g, IXC.red, { w: 3 });
      ixDot(ctx, V.X(a), V.Y(0), IXC.ink, 5); const fp = ixD(F.f, a), gp = ixD(F.g, a), x = a + w / 2;
      ixLabel(ctx, 'f', V.X(a + w * 0.85), V.Y(F.f(a + w * 0.85)) - 8, 20, 'center', IXC.blue, 'bottom'); ixLabel(ctx, 'g', V.X(a + w * 0.85), V.Y(F.g(a + w * 0.85)) + 6, 20, 'center', IXC.red);
      const fpp = ixD2(F.f, a), gpp = ixD2(F.g, a), twice = Math.abs(gp) < 1e-6;
      ixRead(read, [{ h: F.name }, `at x = ${a}: f = ${ixN(F.f(a), 3)}, g = ${ixN(F.g(a), 3)} → 0/0`, `f/g at x = ${ixN(x, 5)}: ${ixN(F.f(x) / F.g(x), 5)}`, { h: 'L’Hôpital’s Rule' }, 'lim f/g = lim f′/g′', twice ? `f′(${a}) = ${ixN(fp, 3)}, g′(${a}) = ${ixN(gp, 3)}: still 0/0, so use it again` : `= f′(${a})/g′(${a}) = ${ixN(fp, 4)}/${ixN(gp, 4)} = ${ixN(fp / gp, 4)}`, twice ? `= f″(${a})/g″(${a}) = ${ixN(fpp, 3)}/${ixN(gpp, 3)} = ${ixN(fpp / gpp, 3)}` : null,
        { note: 'It only applies to 0/0 or ∞/∞. Take derivatives of the top and bottom separately (not the quotient rule).' }]);
    }
    ctl.append(ixSel(Object.entries(IX_LH).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; draw(); }, 'Limit'), ixSlider('zoom in', 0, 2, 0.1, S.z, (v) => '×' + ixN(Math.pow(10, v), 1), (v) => { S.z = v; draw(); }));
    draw();
  } };

// ---- Mean Value Theorem and Rolle’s Theorem
const IX_MVTF = { cub: { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x, xr: [-3, 3], yr: [-6, 6] }, sin: { name: 'sin x + x/3', f: (x) => Math.sin(x) + x / 3, xr: [-4, 4], yr: [-3, 3] }, sqrt: { name: '√x', f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), xr: [-0.5, 8], yr: [-1, 3.5] }, quart: { name: 'x⁴ − 4x²', f: (x) => x ** 4 - 4 * x * x, xr: [-2.5, 2.5], yr: [-5, 5] } };
IX.mvt = { subjects: ['apcalc'],
  title: 'The Mean Value Theorem', hint: 'Slide a and b. The red secant line has the average rate of change. Somewhere between a and b there’s a c where the tangent line (green) is parallel to it.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: 'cub', a: -2, b: 2.5 };
    function draw() {
      const F = IX_MVTF[S.k], V = ixView(cv, F.xr, F.yr, 26); ctx.clearRect(0, 0, 580, 520); ixGrid(ctx, V, { step: 1, lab: 1 }); ixCurve(ctx, V, F.f, IXC.blue, { w: 3.2 });
      const { a, b } = S, fa = F.f(a), fb = F.f(b), m = (fb - fa) / (b - a); ixCurve(ctx, V, (x) => fa + m * (x - a), IXC.red, { w: 2.2 }); [[a, fa], [b, fb]].forEach(([x, y]) => ixDot(ctx, V.X(x), V.Y(y), IXC.red, 7));
      const cs = b > a ? ixRoots((x) => ixD(F.f, x) - m, a + 1e-6, b - 1e-6) : []; cs.forEach((c) => { const y = F.f(c); ixCurve(ctx, V, (x) => y + m * (x - c), IXC.green, { w: 2, dash: true, a: c - 1.5, b: c + 1.5 }); ixDot(ctx, V.X(c), V.Y(y), IXC.green, 7, true); ixLabel(ctx, 'c', V.X(c), V.Y(y) + 12, 18, 'center', IXC.green); });
      const rolle = Math.abs(fa - fb) < 1e-6;
      ixRead(read, [{ h: `f(x) = ${F.name} on [${ixN(a, 2)}, ${ixN(b, 2)}]` }, 'average rate of change:', `(f(b) − f(a))/(b − a) = (${ixN(fb, 3)} − ${ixN(fa, 3)})/(${ixN(b - a, 2)}) = ${ixN(m, 4)}`, { h: 'f′(c) = that slope at' }, cs.length ? cs.map((c) => 'c = ' + ixN(c, 4)).join(', ') : '—',
        rolle ? { note: 'f(a) = f(b): this is Rolle’s Theorem, so somewhere f′(c) = 0 (a flat tangent).', good: true } : { note: 'MVT: if f is continuous on [a, b] and differentiable on (a, b), then f′(c) = (f(b) − f(a))/(b − a) for some c in (a, b).' }]);
    }
    const aS = ixSlider('a', -3, 3, 0.1, S.a, (v) => ixN(v, 2), (v) => { S.a = v; draw(); }), bS = ixSlider('b', -3, 3, 0.1, S.b, (v) => ixN(v, 2), (v) => { S.b = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_MVTF).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; const F = IX_MVTF[k]; [aS, bS].forEach((s) => { const i = s.querySelector('input'); i.min = Math.max(F.xr[0], k === 'sqrt' ? 0 : -9); i.max = F.xr[1]; }); S.a = k === 'sqrt' ? 0 : F.xr[0] + 1; S.b = F.xr[1] - 0.5; aS.set(S.a); bS.set(S.b); draw(); }), aS, bS,
      el('div', { class: 'ix-btns' }, ixBtn('Rolle (f(a) = f(b))', () => { S.k = 'quart'; ctl.querySelector('.ix-seg').set('quart'); S.a = -2; S.b = 2; aS.set(-2); bS.set(2); draw(); })));
    draw();
  } };

// ---- Curve sketching with f′ and f″
const IX_SK = { cub: { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x, xr: [-3, 3], yr: [-5, 5] }, quart: { name: 'x⁴ − 4x³', f: (x) => x ** 4 - 4 * x ** 3, xr: [-1.5, 4.5], yr: [-30, 15] }, xex: { name: 'x e⁻ˣ', f: (x) => x * Math.exp(-x), xr: [-1, 6], yr: [-1.5, 0.7] }, rat: { name: 'x/(x² + 1)', f: (x) => x / (x * x + 1), xr: [-5, 5], yr: [-0.8, 0.8] }, sin: { name: 'x + 2 sin x', f: (x) => x + 2 * Math.sin(x), xr: [-6, 6], yr: [-8, 8] } };
IX.curveSketch = { subjects: ['apcalc'],
  title: 'Curve sketching with f′ and f″', hint: 'The graph is green where f increases and red where it decreases; solid where it’s concave up, dashed where concave down. The sign charts below show why.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(620, 580), ctx = cv._ctx; main.append(cv);
    const S = { k: 'cub' };
    function draw() {
      const F = IX_SK[S.k], V = ixView({ _w: 620, _h: 440 }, F.xr, F.yr, 28), f = F.f, d1 = (x) => ixD(f, x), d2 = (x) => ixD2(f, x); ctx.clearRect(0, 0, 620, 580);
      const st = (F.yr[1] - F.yr[0]) > 20 ? 5 : (F.yr[1] - F.yr[0]) > 4 ? 1 : 0.25; ixGrid2(ctx, V, 1, st, 1, st * 2);
      ctx.save(); ctx.beginPath(); ctx.rect(V.X(F.xr[0]), V.Y(F.yr[1]), V.X(F.xr[1]) - V.X(F.xr[0]), V.Y(F.yr[0]) - V.Y(F.yr[1])); ctx.clip();
      const N = 600; for (let i = 0; i < N; i++) { const x0 = F.xr[0] + (F.xr[1] - F.xr[0]) * i / N, x1 = x0 + (F.xr[1] - F.xr[0]) / N, xm = (x0 + x1) / 2; ctx.strokeStyle = d1(xm) >= 0 ? IXC.green : IXC.red; ctx.lineWidth = 3.6; ctx.setLineDash([]); if (d2(xm) < 0 && i % 4 > 1) continue; ctx.beginPath(); ctx.moveTo(V.X(x0), V.Y(f(x0))); ctx.lineTo(V.X(x1), V.Y(f(x1))); ctx.stroke(); } ctx.restore();
      const crit = ixRoots(d1, F.xr[0], F.xr[1], 3000), infl = ixRoots(d2, F.xr[0], F.xr[1], 3000).filter((x) => Math.sign(d2(x - 0.01)) !== Math.sign(d2(x + 0.01)));
      crit.forEach((x) => ixDot(ctx, V.X(x), V.Y(f(x)), IXC.blue, 7, true)); infl.forEach((x) => ixDot(ctx, V.X(x), V.Y(f(x)), IXC.purple, 6));
      // sign charts
      const chart = (y, g, pts, lab, pos, neg) => { ixLabel(ctx, lab, 10, y, 17, 'left', IXC.ink, 'middle'); ixLine(ctx, [V.X(F.xr[0]), y], [V.X(F.xr[1]), y], IXC.ink, 1.6); const cuts = [F.xr[0], ...pts, F.xr[1]];
        for (let i = 0; i < cuts.length - 1; i++) { const m = (cuts[i] + cuts[i + 1]) / 2, s = g(m) > 0; ixLabel(ctx, s ? '+' : '−', V.X(m), y - 4, 22, 'center', s ? IXC.green : IXC.red, 'bottom'); ixLabel(ctx, s ? pos : neg, V.X(m), y + 6, 12, 'center', IXC.gray); }
        pts.forEach((x) => { ixLine(ctx, [V.X(x), y - 12], [V.X(x), y + 4], IXC.ink, 1.4); ixLabel(ctx, ixN(x, 2), V.X(x), y - 28, 12, 'center', IXC.axis, 'bottom'); }); };
      chart(480, d1, crit, 'f′', 'increasing', 'decreasing'); chart(548, d2, infl, 'f″', 'concave up', 'concave down');
      const kind = (x) => (d2(x) < -1e-6 ? 'local max' : d2(x) > 1e-6 ? 'local min' : Math.sign(d1(x - 0.01)) === Math.sign(d1(x + 0.01)) ? 'neither' : d1(x - 0.01) > 0 ? 'local max' : 'local min');
      ixRead(read, [{ h: `f(x) = ${F.name}` }, { h: 'Critical numbers (f′ = 0), blue' }, crit.length ? crit.map((x) => `x = ${ixN(x, 3)}: ${kind(x)}, f = ${ixN(f(x), 3)}`).join('; ') : 'none', { h: 'Inflection points (f″ changes sign), purple' }, infl.length ? infl.map((x) => `(${ixN(x, 3)}, ${ixN(f(x), 3)})`).join(', ') : 'none',
        { note: 'Green: increasing (f′ > 0). Red: decreasing (f′ < 0). Solid: concave up (f″ > 0). Dashed: concave down (f″ < 0).' }, { note: 'Second Derivative Test: f′(c) = 0 and f″(c) < 0 → local max; f″(c) > 0 → local min.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_SK).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; draw(); }));
    draw();
  } };

// ---- Optimization
IX.optimize = { subjects: ['apcalc'],
  title: 'Optimization', hint: 'Box: cut squares of side x from the corners of a 12 × 12 sheet and fold up the sides. Fence: 200 ft of fence along a river (no fence on the river side). Slide x and find the maximum on the graph.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: 'box', x: 1 };
    function draw() {
      ctx.clearRect(0, 0, 640, 520); const box = S.k === 'box', x = S.x, f = box ? (t) => t * (12 - 2 * t) ** 2 : (t) => t * (200 - 2 * t), best = box ? 2 : 50, xmax = box ? 6 : 100, ymax = box ? 150 : 5500;
      if (box) { const u = 18, ox = 30, oy = 30; ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.10)'; ctx.fillRect(ox, oy, 12 * u, 12 * u); ctx.strokeStyle = IXC.ink; ctx.strokeRect(ox, oy, 12 * u, 12 * u); ctx.restore();
        [[0, 0], [12 - x, 0], [0, 12 - x], [12 - x, 12 - x]].forEach(([a, b]) => { ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = IXC.red; ctx.setLineDash([4, 4]); ctx.fillRect(ox + a * u, oy + b * u, x * u, x * u); ctx.strokeRect(ox + a * u, oy + b * u, x * u, x * u); ctx.restore(); });
        ctx.save(); ctx.strokeStyle = IXC.gray; ctx.setLineDash([5, 5]); ctx.strokeRect(ox + x * u, oy + x * u, (12 - 2 * x) * u, (12 - 2 * x) * u); ctx.restore(); ixLabel(ctx, 'x', ox + x * u / 2, oy + x * u + 2, 16, 'center', IXC.red); ixLabel(ctx, `${ixN(12 - 2 * x, 2)}`, ox + 6 * u, oy + 6 * u, 18, 'center', IXC.blue, 'middle');
        // the folded box
        const s = 15, P = (X, Y, Z) => [300 + X * s + Y * s * 0.5, 230 - Z * s - Y * s * 0.35], L = 12 - 2 * x, b = [P(0, 0, 0), P(L, 0, 0), P(L, L, 0), P(0, L, 0)], t = [P(0, 0, x), P(L, 0, x), P(L, L, x), P(0, L, x)];
        ix3Poly(ctx, [b[0], b[1], t[1], t[0]], 'rgba(31,95,168,.18)', IXC.blue, 2); ix3Poly(ctx, [b[1], b[2], t[2], t[1]], 'rgba(31,95,168,.12)', IXC.blue, 2); ix3Poly(ctx, t, null, IXC.blue, 2);
      } else { const u = 2.2, ox = 340, oy = 40, W = 200 - 2 * x; ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.25)'; ctx.fillRect(20, oy - 26, 600, 24); ctx.restore(); ixLabel(ctx, 'river', 30, oy - 24, 15, 'left', IXC.blue);
        const x0 = 320 - W * u / 2; ctx.save(); ctx.fillStyle = 'rgba(46,125,79,.12)'; ctx.fillRect(x0, oy, W * u, x * u); ctx.strokeStyle = IXC.orange; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, oy); ctx.lineTo(x0, oy + x * u); ctx.lineTo(x0 + W * u, oy + x * u); ctx.lineTo(x0 + W * u, oy); ctx.stroke(); ctx.restore();
        ixLabel(ctx, `x = ${x}`, x0 - 6, oy + x * u / 2, 16, 'right', IXC.orange, 'middle'); ixLabel(ctx, `200 − 2x = ${W}`, 320, oy + x * u + 6, 16, 'center', IXC.orange); }
      const G0 = ixView({ _w: 640, _h: 250 }, [0, xmax], [0, ymax], 34), G = { ...G0, Y: (y) => 265 + G0.Y(y) }; ixGrid2(ctx, G, xmax / 12, ymax / 5, xmax / 6, ymax / 5);
      ixCurve(ctx, G, f, IXC.blue, { w: 3 }); ixDot(ctx, G.X(x), G.Y(f(x)), IXC.red, 7, true); ixDot(ctx, G.X(best), G.Y(f(best)), IXC.green, 5);
      ixRead(read, box ? [{ h: 'Open box from a 12 × 12 sheet' }, 'V(x) = x(12 − 2x)²', `V(${ixN(x, 2)}) = ${ixN(f(x), 3)}`, { h: 'Find the maximum' }, "V′(x) = (12 − 2x)² − 4x(12 − 2x) = (12 − 2x)(12 − 6x)", 'V′ = 0 at x = 2 (x = 6 makes no box)', `V(2) = 128 cubic units`, { note: 'Domain: 0 < x < 6. Check the endpoints and critical numbers.' }]
        : [{ h: 'Fence along a river' }, 'A(x) = x(200 − 2x)', `A(${x}) = ${ixN(f(x))} ft²`, { h: 'Find the maximum' }, "A′(x) = 200 − 4x = 0 → x = 50", 'A(50) = 50 · 100 = 5000 ft²', { note: 'The side parallel to the river is twice each other side.' }]);
    }
    const xS = ixSlider('x', 0.1, 5.9, 0.1, S.x, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    ctl.append(ixSeg([['box', 'Open box'], ['fence', 'Fence along a river']], S.k, (k) => { S.k = k; const i = xS.querySelector('input'); if (k === 'box') { i.min = 0.1; i.max = 5.9; i.step = 0.1; S.x = 1; } else { i.min = 5; i.max = 95; i.step = 5; S.x = 30; } xS.set(S.x); draw(); }), xS);
    draw();
  } };

// ---- functions for the integral interactives
const IX_IF = {
  quad: { name: 'x²/4 + 1', f: (x) => x * x / 4 + 1, ab: [0, 4], xr: [-0.5, 5], yr: [-0.5, 6] },
  sin: { name: 'sin x + 1.5', f: (x) => Math.sin(x) + 1.5, ab: [0, Math.PI * 1.5], xr: [-0.5, 6.5], yr: [-0.5, 3] },
  exp: { name: 'e^(x/2)', f: (x) => Math.exp(x / 2), ab: [0, 3], xr: [-0.5, 4], yr: [-0.5, 5] },
  sqrt: { name: '√x', f: (x) => Math.sqrt(Math.max(0, x)), ab: [0, 4], xr: [-0.5, 5], yr: [-0.5, 3] },
  cub: { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x, ab: [-2, 2.5], xr: [-2.5, 3], yr: [-4, 6] } };

// ---- Riemann sums, trapezoids, and Simpson’s Rule
IX.riemann = { subjects: ['apcalc'],
  title: 'Riemann sums and approximating integrals', hint: 'Pick a method and slide n. Left, right, and midpoint sums use rectangles; the Trapezoidal Rule uses trapezoids; Simpson’s Rule uses parabolas. As n grows, the sum approaches the integral.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: 'quad', m: o.m || 'left', n: 4 };
    const sum = (F, m, n) => { const [a, b] = F.ab, h = (b - a) / n, f = F.f; let s = 0;
      if (m === 'left') for (let i = 0; i < n; i++) s += f(a + i * h); else if (m === 'right') for (let i = 1; i <= n; i++) s += f(a + i * h); else if (m === 'mid') for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
      else if (m === 'trap') { s = (f(a) + f(b)) / 2; for (let i = 1; i < n; i++) s += f(a + i * h); } else { const N = n % 2 ? n + 1 : n, H = (b - a) / N; let t = f(a) + f(b); for (let i = 1; i < N; i++) t += f(a + i * H) * (i % 2 ? 4 : 2); return t * H / 3; } return s * h; };
    function draw() {
      const F = IX_IF[S.k], V = ixView(cv, F.xr, F.yr, 28), [a, b] = F.ab, n = S.m === 'simp' && S.n % 2 ? S.n + 1 : S.n, h = (b - a) / n, f = F.f; ctx.clearRect(0, 0, 600, 500); ixGrid(ctx, V, { step: 1, lab: 1 });
      for (let i = 0; i < n; i++) { const x0 = a + i * h, x1 = x0 + h, col = 'rgba(31,95,168,.22)';
        if (S.m === 'trap') ix3Poly(ctx, [[V.X(x0), V.Y(0)], [V.X(x0), V.Y(f(x0))], [V.X(x1), V.Y(f(x1))], [V.X(x1), V.Y(0)]], col, IXC.blue, 1.4);
        else if (S.m === 'simp') { if (i % 2) continue; const xm = x1, x2 = x0 + 2 * h, y0 = f(x0), y1 = f(xm), y2 = f(x2), P = (x) => y0 * (x - xm) * (x - x2) / ((x0 - xm) * (x0 - x2)) + y1 * (x - x0) * (x - x2) / ((xm - x0) * (xm - x2)) + y2 * (x - x0) * (x - xm) / ((x2 - x0) * (x2 - xm));
          const pts = [[V.X(x0), V.Y(0)]]; for (let j = 0; j <= 30; j++) { const x = x0 + 2 * h * j / 30; pts.push([V.X(x), V.Y(P(x))]); } pts.push([V.X(x2), V.Y(0)]); ix3Poly(ctx, pts, col, IXC.blue, 1.4); }
        else { const xs = S.m === 'left' ? x0 : S.m === 'right' ? x1 : (x0 + x1) / 2, y = f(xs); ix3Poly(ctx, [[V.X(x0), V.Y(0)], [V.X(x0), V.Y(y)], [V.X(x1), V.Y(y)], [V.X(x1), V.Y(0)]], y < 0 ? 'rgba(181,72,43,.22)' : col, y < 0 ? IXC.red : IXC.blue, 1.4); ixDot(ctx, V.X(xs), V.Y(y), IXC.orange, 4); } }
      ixCurve(ctx, V, f, IXC.ink, { w: 3 });
      const exact = ixInt(f, a, b, 2000), approx = sum(F, S.m, n), nm = { left: 'Left Riemann sum', right: 'Right Riemann sum', mid: 'Midpoint sum', trap: 'Trapezoidal Rule', simp: 'Simpson’s Rule' }[S.m];
      const formula = { left: 'Δx[f(x₀) + f(x₁) + … + f(xₙ₋₁)]', right: 'Δx[f(x₁) + f(x₂) + … + f(xₙ)]', mid: 'Δx[f(m₁) + f(m₂) + … + f(mₙ)]', trap: '(Δx/2)[f(x₀) + 2f(x₁) + … + 2f(xₙ₋₁) + f(xₙ)]', simp: '(Δx/3)[f(x₀) + 4f(x₁) + 2f(x₂) + … + 4f(xₙ₋₁) + f(xₙ)]' }[S.m];
      ixRead(read, [{ h: `∫ from ${ixN(a, 2)} to ${ixN(b, 2)} of ${F.name} dx` }, { h: `${nm}, n = ${n}` }, formula, `Δx = (b − a)/n = ${ixN(h, 4)}`, `≈ ${ixN(approx, 5)}`, `exact ≈ ${ixN(exact, 5)}`, `error = ${ixN(Math.abs(approx - exact), 5)}`,
        S.m === 'simp' && S.n % 2 ? { note: 'Simpson’s Rule needs an even n, so n was rounded up.' } : null, { note: 'For an increasing function, left sums underestimate and right sums overestimate. Concave up: trapezoids overestimate, midpoints underestimate.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_IF).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; draw(); }), ixSeg([['left', 'Left'], ['right', 'Right'], ['mid', 'Midpoint'], ['trap', 'Trapezoid'], ['simp', 'Simpson']], S.m, (k) => { S.m = k; draw(); }), ixSlider('n (subintervals)', 1, 50, 1, S.n, String, (v) => { S.n = v; draw(); }));
    draw();
  } };

// ---- The Fundamental Theorem of Calculus: the area function
const IX_FTC = { t: { name: 't', f: (t) => t, xr: [0, 4], yr: [-0.5, 4.5] }, cos: { name: 'cos t', f: Math.cos, xr: [0, 2 * Math.PI], yr: [-1.5, 1.5] }, lin: { name: 't − 2', f: (t) => t - 2, xr: [0, 5], yr: [-3, 3.5] }, wave: { name: '2 sin t + 0.5', f: (t) => 2 * Math.sin(t) + 0.5, xr: [0, 2 * Math.PI], yr: [-2, 4] }, exp: { name: 'e^(−t)', f: (t) => Math.exp(-t), xr: [0, 5], yr: [-0.3, 1.3] } };
IX.ftc = { subjects: ['apcalc'],
  title: 'The Fundamental Theorem: the area function', hint: 'Slide x. The top shows the signed area under f from 0 to x (blue above the axis, red below). The bottom graphs that area, A(x). Its slope at each x is f(x).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 600), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_FTC[o.f] ? o.f : 'cos', x: 2 };
    function draw() {
      const F = IX_FTC[S.k], x = S.x, A = (u) => ixInt(F.f, 0, u, 200), T = ixView({ _w: 600, _h: 290 }, F.xr, F.yr, 26); let lo = 0, hi = 0; for (let u = F.xr[0]; u <= F.xr[1]; u += (F.xr[1] - F.xr[0]) / 100) { const v = A(u); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const B0 = ixView({ _w: 600, _h: 300 }, F.xr, [lo - 0.4, hi + 0.4], 26), B = { ...B0, Y: (y) => 300 + B0.Y(y) }, piX = F.xr[1] > 6 ? { piX: 0.5 } : {}; ctx.clearRect(0, 0, 600, 600);
      ixGrid(ctx, T, { step: 1, lab: 1, ...piX }); ixGrid(ctx, B, { step: 1, lab: 1, ...piX }); ixLine(ctx, [0, 296], [600, 296], '#cfcabd', 2);
      const N = 200; for (let i = 0; i < N; i++) { const u0 = x * i / N, u1 = x * (i + 1) / N, y = F.f((u0 + u1) / 2); ctx.save(); ctx.fillStyle = y >= 0 ? 'rgba(31,95,168,.30)' : 'rgba(181,72,43,.30)'; ctx.fillRect(T.X(u0), Math.min(T.Y(0), T.Y(y)), T.X(u1) - T.X(u0) + 0.5, Math.abs(T.Y(y) - T.Y(0))); ctx.restore(); }
      ixCurve(ctx, T, F.f, IXC.ink, { w: 3 }); ixLine(ctx, [T.X(x), T.Y(0)], [T.X(x), T.Y(F.f(x))], IXC.orange, 2.4); ixLabel(ctx, `f(t) = ${F.name}`, 590, 6, 16, 'right', IXC.ink);
      ixCurve(ctx, B, A, IXC.purple, { w: 3, n: 300 }); const ax = A(x); ixDot(ctx, B.X(x), B.Y(ax), IXC.purple, 7, true); ixCurve(ctx, B, (u) => ax + F.f(x) * (u - x), IXC.orange, { w: 2, dash: true, a: x - 0.8, b: x + 0.8 }); ixLabel(ctx, 'A(x) = ∫₀ˣ f(t) dt', 590, 304, 16, 'right', IXC.purple);
      ixRead(read, [{ h: `x = ${ixN(x, 2)}` }, `A(x) = ∫ from 0 to x of f(t) dt ≈ ${ixN(ax, 4)}`, `f(x) = ${ixN(F.f(x), 4)}`, `slope of A at x ≈ ${ixN(ixD(A, x, 1e-3), 4)}`, { note: 'FTC Part 1: A′(x) = f(x). The orange tangent on A has slope equal to the height of f.', good: true },
        { note: F.f(x) > 0 ? 'f > 0 here, so A is increasing.' : F.f(x) < 0 ? 'f < 0 here (red area counts as negative), so A is decreasing.' : 'f = 0 here: A has a flat tangent.' }, { note: 'FTC Part 2: ∫ from a to b of f = F(b) − F(a) for any antiderivative F.' }]);
    }
    const xS = ixSlider('x', 0, IX_FTC[S.k].xr[1], 0.02, S.x, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_FTC).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; const i = xS.querySelector('input'); i.max = IX_FTC[k].xr[1]; S.x = Math.min(S.x, +i.max); xS.set(S.x); draw(); }), xS);
    draw();
  } };

// ---- Average value and the Mean Value Theorem for Integrals
IX.avgValue = { subjects: ['apcalc'],
  title: 'Average value of a function', hint: 'The orange rectangle has the same area as the region under f from a to b. Its height is the average value; f equals it at some c (the MVT for integrals).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: 'quad', a: 0, b: 4 };
    function draw() {
      const F = IX_IF[S.k], V = ixView(cv, F.xr, F.yr, 28), { a, b } = S, f = F.f; ctx.clearRect(0, 0, 580, 500); ixGrid(ctx, V, { step: 1, lab: 1 });
      if (b <= a) { ixRead(read, [{ note: 'Make b bigger than a.', bad: true }]); ixCurve(ctx, V, f, IXC.ink, { w: 3 }); return; }
      const I = ixInt(f, a, b), avg = I / (b - a), pts = [[V.X(a), V.Y(0)]]; for (let j = 0; j <= 100; j++) { const x = a + (b - a) * j / 100; pts.push([V.X(x), V.Y(f(x))]); } pts.push([V.X(b), V.Y(0)]);
      ix3Poly(ctx, pts, 'rgba(31,95,168,.22)', null); ix3Poly(ctx, [[V.X(a), V.Y(0)], [V.X(a), V.Y(avg)], [V.X(b), V.Y(avg)], [V.X(b), V.Y(0)]], 'rgba(210,123,18,.18)', IXC.orange, 2.4);
      ixCurve(ctx, V, f, IXC.ink, { w: 3 }); const cs = ixRoots((x) => f(x) - avg, a, b); cs.forEach((c) => { ixDot(ctx, V.X(c), V.Y(avg), IXC.green, 7, true); ixLabel(ctx, 'c', V.X(c), V.Y(avg) - 14, 18, 'center', IXC.green, 'bottom'); });
      ixRead(read, [{ h: `f(x) = ${F.name} on [${ixN(a, 2)}, ${ixN(b, 2)}]` }, 'average value = (1/(b − a)) ∫ from a to b of f(x) dx', `= (1/${ixN(b - a, 2)})(${ixN(I, 4)}) = ${ixN(avg, 4)}`, { h: 'f(c) = average at' }, cs.length ? cs.map((c) => 'c = ' + ixN(c, 4)).join(', ') : '—', { note: 'The blue region and the orange rectangle have the same area.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_IF).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; [S.a, S.b] = IX_IF[k].ab; ctl.querySelectorAll('.ix-sl')[0].set(S.a); ctl.querySelectorAll('.ix-sl')[1].set(S.b); draw(); }),
      ixSlider('a', -2, 5, 0.1, S.a, (v) => ixN(v, 2), (v) => { S.a = v; draw(); }), ixSlider('b', -2, 6, 0.1, S.b, (v) => ixN(v, 2), (v) => { S.b = v; draw(); }));
    draw();
  } };

// ---- Slope fields and Euler’s Method
const IX_DE = { x: { name: 'dy/dx = x', f: (x, y) => x, sol: 'y = x²/2 + C' }, y: { name: 'dy/dx = y', f: (x, y) => y, sol: 'y = Ceˣ' }, xpy: { name: 'dy/dx = x + y', f: (x, y) => x + y, sol: 'y = Ceˣ − x − 1' }, xmy: { name: 'dy/dx = x − y', f: (x, y) => x - y, sol: 'y = x − 1 + Ce⁻ˣ' }, circ: { name: 'dy/dx = −x/y', f: (x, y) => -x / y, sol: 'x² + y² = C' }, xy: { name: 'dy/dx = xy', f: (x, y) => x * y, sol: 'y = Ce^(x²/2)' } };
IX.slopeField = { subjects: ['apcalc'],
  title: 'Slope fields and Euler’s Method', hint: 'Each little segment has the slope dy/dx at that point. Drag the red point to start a solution curve. Turn on Euler’s Method to step along with straight segments.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: 'xmy', P: [0, 2], euler: o.euler === '1', h: 0.5, steps: 4 }, V = ixView(cv, [-4, 4], [-4, 4], 24);
    const step = (f, x, y, h) => { const k1 = f(x, y), k2 = f(x + h / 2, y + h * k1 / 2), k3 = f(x + h / 2, y + h * k2 / 2), k4 = f(x + h, y + h * k3); return y + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; };
    function draw() {
      const D = IX_DE[S.k], f = D.f; ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: 1, lab: 1 });
      for (let x = -4; x <= 4.001; x += 0.5) for (let y = -4; y <= 4.001; y += 0.5) { const m = f(x, y); if (!isFinite(m)) continue; const L = 0.18 / Math.sqrt(1 + m * m); ixLine(ctx, [V.X(x - L), V.Y(y - m * L)], [V.X(x + L), V.Y(y + m * L)], IXC.gray, 1.6); }
      [-1, 1].forEach((dir) => { ctx.save(); ctx.beginPath(); ctx.rect(V.X(-4), V.Y(4), V.X(4) - V.X(-4), V.Y(-4) - V.Y(4)); ctx.clip(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3; ctx.beginPath(); let [x, y] = S.P; ctx.moveTo(V.X(x), V.Y(y));
        for (let i = 0; i < 800; i++) { const ny = step(f, x, y, dir * 0.01); x += dir * 0.01; if (!isFinite(ny) || Math.abs(ny) > 50 || (S.k === 'circ' && Math.abs(y) < 0.05)) break; y = ny; ctx.lineTo(V.X(x), V.Y(y)); } ctx.stroke(); ctx.restore(); });
      const L = [{ h: D.name }, `general solution: ${D.sol}`, `starting point (${ixN(S.P[0], 2)}, ${ixN(S.P[1], 2)})`];
      if (S.euler) { let [x, y] = S.P; const rows = []; ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(V.X(x), V.Y(y));
        for (let i = 0; i < S.steps; i++) { const m = f(x, y); rows.push(`x = ${ixN(x, 2)}, y = ${ixN(y, 4)}, slope = ${ixN(m, 4)}`); y += S.h * m; x += S.h; ctx.lineTo(V.X(x), V.Y(y)); } ctx.stroke(); ctx.restore();
        let [ex, ey] = S.P; for (let i = 0; i <= S.steps; i++) { ixDot(ctx, V.X(ex), V.Y(ey), IXC.red, 5); if (i < S.steps) { ey += S.h * f(ex, ey); ex += S.h; } }
        let ty = S.P[1]; for (let u = S.P[0]; u < x - 1e-9; u += 0.001) ty = step(f, u, ty, 0.001);
        L.push({ h: `Euler’s Method, h = ${S.h}` }, 'yₙ₊₁ = yₙ + h · (slope at (xₙ, yₙ))', ...rows, `estimate: y(${ixN(x, 2)}) ≈ ${ixN(y, 4)}`, `actual: y(${ixN(x, 2)}) ≈ ${ixN(ty, 4)}`, { note: 'Smaller steps (smaller h) follow the curve more closely.' }); }
      ixDot(ctx, V.X(S.P[0]), V.Y(S.P[1]), IXC.red, 8, true); ixRead(read, L);
    }
    const eu = el('div', {}, ixSlider('step size h', 0.1, 1, 0.1, S.h, (v) => ixN(v, 1), (v) => { S.h = v; draw(); }), ixSlider('number of steps', 1, 10, 1, S.steps, String, (v) => { S.steps = v; draw(); }));
    ctl.append(ixSel(Object.entries(IX_DE).map(([k, D]) => [k, D.name]), S.k, (k) => { S.k = k; draw(); }, 'Differential equation'), ixCheck('Euler’s Method', S.euler, (v) => { S.euler = v; eu.style.display = v ? '' : 'none'; draw(); }), eu, el('div', { class: 'small' }, 'Drag the red point (or click anywhere).'));
    eu.style.display = S.euler ? '' : 'none';
    ixDrag(cv, () => 'p', (h, x, y) => { S.P = [Math.round(V.ix(x) * 4) / 4, Math.round(V.iy(y) * 4) / 4]; draw(); });
    draw();
  } };

// ---- Logistic growth
IX.logistic = { subjects: ['apcalc'],
  title: 'Logistic growth', hint: 'Slide the carrying capacity K, the starting population P₀, and the rate k. The population levels off at K, and grows fastest when P = K/2.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const S = { K: 1000, P0: 50, k: 0.5, t: 6 };
    function draw() {
      const { K, P0, k } = S, A = (K - P0) / P0, P = (t) => K / (1 + A * Math.exp(-k * t)), V = ixView(cv, [0, 25], [0, Math.max(K, P0) * 1.15], 34); ctx.clearRect(0, 0, 600, 520); ixGrid2(ctx, V, 1, 100, 5, 200);
      ixLine(ctx, [V.X(0), V.Y(K)], [V.X(25), V.Y(K)], IXC.green, 2, true); ixLabel(ctx, `K = ${K}`, V.X(25) - 4, V.Y(K) - 4, 16, 'right', IXC.green, 'bottom'); ixLine(ctx, [V.X(0), V.Y(K / 2)], [V.X(25), V.Y(K / 2)], IXC.gray, 1.2, true);
      ixCurve(ctx, V, P, IXC.blue, { w: 3.2 }); const ti = Math.log(A) / k; if (A > 0 && ti > 0 && ti < 25) { ixDot(ctx, V.X(ti), V.Y(K / 2), IXC.purple, 7); ixLabel(ctx, 'fastest growth', V.X(ti) + 10, V.Y(K / 2) + 6, 15, 'left', IXC.purple); }
      const p = P(S.t), r = k * p * (1 - p / K); ixDot(ctx, V.X(S.t), V.Y(p), IXC.red, 7, true); ixCurve(ctx, V, (t) => p + r * (t - S.t), IXC.red, { w: 2, dash: true, a: S.t - 2, b: S.t + 2 });
      ixRead(read, [{ h: 'dP/dt = kP(1 − P/K)' }, `P(t) = K/(1 + Ae^(−kt)), A = (K − P₀)/P₀ = ${ixN(A, 3)}`, `P(t) = ${K}/(1 + ${ixN(A, 3)}e^(−${k}t))`, { h: `At t = ${ixN(S.t, 1)}` }, `P ≈ ${ixN(p, 1)}`, `dP/dt ≈ ${ixN(r, 2)} per unit time`,
        { note: `As t → ∞, P → K = ${K}. The growth rate is largest when P = K/2 = ${K / 2}${A > 0 ? `, at t ≈ ${ixN(ti, 2)}` : ''}.` }]);
    }
    ctl.append(ixSlider('carrying capacity K', 200, 1500, 50, S.K, String, (v) => { S.K = v; draw(); }), ixSlider('starting P₀', 10, 1500, 10, S.P0, String, (v) => { S.P0 = v; draw(); }), ixSlider('rate k', 0.1, 1.5, 0.05, S.k, (v) => ixN(v, 2), (v) => { S.k = v; draw(); }), ixSlider('t', 0, 25, 0.5, S.t, (v) => ixN(v, 1), (v) => { S.t = v; draw(); }));
    draw();
  } };

// ---- Area between curves
const IX_AB = { a: { name: 'y = x and y = x²', f: (x) => x, g: (x) => x * x, xr: [-1, 2.5], yr: [-1, 4] }, b: { name: 'y = 4 − x² and y = x + 2', f: (x) => 4 - x * x, g: (x) => x + 2, xr: [-3, 2], yr: [-2, 5] }, c: { name: 'y = √x and y = x/2', f: (x) => Math.sqrt(Math.max(0, x)), g: (x) => x / 2, xr: [-0.5, 5], yr: [-0.5, 3] }, d: { name: 'y = sin x and y = cos x', f: Math.sin, g: Math.cos, xr: [0, 2 * Math.PI], yr: [-1.5, 1.5] }, e: { name: 'y = x³ and y = x', f: (x) => x ** 3, g: (x) => x, xr: [-1.6, 1.6], yr: [-2, 2] } };
IX.areaBetween = { subjects: ['apcalc'],
  title: 'Area between two curves', hint: 'The region between the curves is shaded. A typical rectangle has height top − bottom. Where the curves cross, top and bottom switch, so split the integral there.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: 'a', x: 0.5 };
    function draw() {
      const D = IX_AB[S.k], V = ixView(cv, D.xr, D.yr, 26); ctx.clearRect(0, 0, 580, 520); ixGrid(ctx, V, { step: 1, lab: 1, ...(S.k === 'd' ? { piX: 0.5 } : {}) });
      let xs = ixRoots((x) => D.f(x) - D.g(x), D.xr[0] + 1e-6, D.xr[1] - 1e-6); if (S.k === 'c') xs = [0, 4]; if (S.k === 'd') xs = [Math.PI / 4, 5 * Math.PI / 4];
      const a = xs[0], b = xs[xs.length - 1];
      for (let i = 0; i < 300; i++) { const x0 = a + (b - a) * i / 300, x1 = x0 + (b - a) / 300, m = (x0 + x1) / 2, t = Math.max(D.f(m), D.g(m)), bo = Math.min(D.f(m), D.g(m)); ctx.save(); ctx.fillStyle = D.f(m) >= D.g(m) ? 'rgba(31,95,168,.22)' : 'rgba(46,125,79,.22)'; ctx.fillRect(V.X(x0), V.Y(t), V.X(x1) - V.X(x0) + 0.5, V.Y(bo) - V.Y(t)); ctx.restore(); }
      ixCurve(ctx, V, D.f, IXC.blue, { w: 3 }); ixCurve(ctx, V, D.g, IXC.green, { w: 3 }); xs.forEach((x) => ixDot(ctx, V.X(x), V.Y(D.f(x)), IXC.ink, 6));
      const x = Math.max(a, Math.min(b, S.x)), t = Math.max(D.f(x), D.g(x)), bo = Math.min(D.f(x), D.g(x)); ctx.save(); ctx.fillStyle = 'rgba(181,72,43,.35)'; ctx.strokeStyle = IXC.red; ctx.lineWidth = 2; ctx.fillRect(V.X(x) - 6, V.Y(t), 12, V.Y(bo) - V.Y(t)); ctx.strokeRect(V.X(x) - 6, V.Y(t), 12, V.Y(bo) - V.Y(t)); ctx.restore();
      const area = xs.slice(1).reduce((s, x1, i) => s + Math.abs(ixInt((u) => D.f(u) - D.g(u), xs[i], x1)), 0);
      ixRead(read, [{ h: D.name }, `they cross at x = ${xs.map((v) => ixN(v, 3)).join(', ')}`, { h: 'Typical rectangle (red)' }, `height = top − bottom = ${ixN(t, 3)} − ${ixN(bo, 3)} = ${ixN(t - bo, 3)}`, 'width = dx',
        { h: 'Area' }, xs.length > 2 ? 'split at each crossing: A = Σ ∫ |f − g| dx' : `A = ∫ from ${ixN(a, 3)} to ${ixN(b, 3)} of (top − bottom) dx`, `A ≈ ${ixN(area, 4)}`, { note: 'Always top minus bottom, so every piece of area counts as positive.' }]);
    }
    const xS = ixSlider('rectangle at x', -3, 6.3, 0.02, S.x, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    ctl.append(ixSel(Object.entries(IX_AB).map(([k, D]) => [k, D.name]), S.k, (k) => { S.k = k; draw(); }, 'Curves'), xS);
    draw();
  } };

// ---- Volumes of revolution: disks, washers, and shells
const IX_VR = { disk: { name: 'Disks: y = √x, 0 ≤ x ≤ 4, about the x-axis', f: (x) => Math.sqrt(x), g: () => 0, a: 0, b: 4, ax: 'x', V: 8 * Math.PI, vf: 'V = π ∫₀⁴ (√x)² dx = 8π' },
  washer: { name: 'Washers: between y = x and y = x², about the x-axis', f: (x) => x, g: (x) => x * x, a: 0, b: 1, ax: 'x', V: 2 * Math.PI / 15, vf: 'V = π ∫₀¹ (x² − x⁴) dx = 2π/15' },
  shell: { name: 'Shells: y = 2x − x², about the y-axis', f: (x) => 2 * x - x * x, g: () => 0, a: 0, b: 2, ax: 'y', V: 8 * Math.PI / 3, vf: 'V = 2π ∫₀² x(2x − x²) dx = 8π/3' } };
IX.volumeRev = { subjects: ['apcalc'],
  title: 'Volumes of revolution: disks, washers, and shells', hint: 'Pick a method. The flat region (red) spins around the axis to make the solid. Slide x to move one slice: a disk, a washer, or a cylindrical shell. Drag to turn.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_VR[o.m] ? o.m : 'disk', x: 1, az: o.m === 'shell' ? -0.5 : -0.2, el: 0.35, spin: 300 };
    function draw() {
      const D = IX_VR[S.k], X = D.ax === 'x', sc = X ? Math.min(230, 300 / (D.b - D.a)) : 150, T = ix3(320, X ? 300 : 270, sc * (X ? 1 : 1.1), S); ctx.clearRect(0, 0, 640, 520);
      // world: about the x-axis → (x, y cos φ, y sin φ) centered; about the y-axis → (x cos φ, x sin φ, y)
      const mid = X ? (D.a + D.b) / 2 : 0, W = (x, y, p) => (X ? [x - mid, -y * Math.sin(p), y * Math.cos(p)] : [x * Math.cos(p), x * Math.sin(p), y - 0.5]), sp = S.spin * Math.PI / 180;
      ixLine(ctx, T(X ? [D.a - mid - 0.6, 0, 0] : [0, 0, -0.9]), T(X ? [D.b - mid + 0.6, 0, 0] : [0, 0, 1.6]), IXC.gray, 2, true);
      const prof = (h) => { const P = []; for (let j = 0; j <= 40; j++) { const x = D.a + (D.b - D.a) * j / 40; P.push([x, h(x)]); } return P; }, top = prof(D.f), bot = prof(D.g);
      for (let p = 0; p <= sp + 1e-9; p += Math.PI / 10) { [top, bot].forEach((P, q) => { if (q && S.k === 'disk') return; ctx.save(); ctx.strokeStyle = 'rgba(31,95,168,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); P.forEach(([x, y], i) => { const s = T(W(x, y, p)); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke(); ctx.restore(); }); }
      ix3Poly(ctx, [...top, ...bot.slice().reverse()].map(([x, y]) => T(W(x, y, 0))), 'rgba(181,72,43,.30)', IXC.red, 2.4);
      const x = Math.max(D.a, Math.min(D.b, S.x)), ring = (r, f2) => { const P = []; for (let j = 0; j <= 48; j++) P.push(T(f2(r, j * 2 * Math.PI / 48))); return P; };
      let L;
      if (X) { const R = D.f(x), r = D.g(x); ix3Poly(ctx, ring(R, (rr, p) => W(x, rr, p)), 'rgba(46,125,79,.35)', IXC.green, 2.4); if (r > 0) ix3Poly(ctx, ring(r, (rr, p) => W(x, rr, p)), '#fff', IXC.green, 2);
        L = [{ h: D.name }, S.k === 'disk' ? `disk at x = ${ixN(x, 2)}: radius R = ${ixN(R, 3)}` : `washer at x = ${ixN(x, 2)}: R = ${ixN(R, 3)}, r = ${ixN(r, 3)}`, S.k === 'disk' ? `area = πR² = ${ixN(Math.PI * R * R, 3)}` : `area = π(R² − r²) = ${ixN(Math.PI * (R * R - r * r), 3)}`, 'thickness dx']; }
      else { const h = D.f(x), cyl = (p) => [x * Math.cos(p), x * Math.sin(p)]; for (let j = 0; j < 48; j++) { const p0 = j * 2 * Math.PI / 48, p1 = p0 + 2 * Math.PI / 48, [a0, b0] = cyl(p0), [a1, b1] = cyl(p1); ix3Poly(ctx, [T([a0, b0, -0.5]), T([a1, b1, -0.5]), T([a1, b1, h - 0.5]), T([a0, b0, h - 0.5])], 'rgba(46,125,79,.18)', null); }
        ix3Poly(ctx, ring(x, (rr, p) => [rr * Math.cos(p), rr * Math.sin(p), h - 0.5]), null, IXC.green, 2.4); ix3Poly(ctx, ring(x, (rr, p) => [rr * Math.cos(p), rr * Math.sin(p), -0.5]), null, IXC.green, 2);
        L = [{ h: D.name }, `shell at x = ${ixN(x, 2)}: radius x = ${ixN(x, 2)}, height ${ixN(h, 3)}`, `unrolled: 2πx · h = ${ixN(2 * Math.PI * x * h, 3)} (times thickness dx)`]; }
      ixRead(read, [...L, { h: 'Volume' }, D.vf, `≈ ${ixN(D.V, 4)}`, { note: S.k === 'shell' ? 'Shells: V = 2π ∫ (radius)(height) dx. Good when spinning around the y-axis with x-slices.' : 'Disks and washers: V = π ∫ (R² − r²) dx, slices perpendicular to the axis.' }]);
    }
    const xS = ixSlider('slice at x', 0, 4, 0.02, S.x, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    ctl.append(ixSeg([['disk', 'Disks'], ['washer', 'Washers'], ['shell', 'Shells']], S.k, (k) => { S.k = k; S.az = k === 'shell' ? -0.5 : -0.2; const i = xS.querySelector('input'); i.min = IX_VR[k].a; i.max = IX_VR[k].b; S.x = (IX_VR[k].a + IX_VR[k].b) / 2; xS.set(S.x); draw(); }), xS,
      ixSlider('spin', 0, 360, 10, S.spin, (v) => v + '°', (v) => { S.spin = v; draw(); }), el('div', { class: 'small' }, 'Drag the picture to turn it.'));
    if (S.k !== 'disk') { const i = xS.querySelector('input'); i.min = IX_VR[S.k].a; i.max = IX_VR[S.k].b; }
    ix3Turn(cv, S, draw); draw();
  } };

// ---- Volumes with known cross sections
const IX_XBASE = {
  sqrt: { name: 'under y = √x, 0 ≤ x ≤ 4', lo: () => 0, hi: (x) => Math.sqrt(Math.max(0, x)), a: 0, b: 4, s: '√x' },
  para: { name: 'between y = 1 − x² and the x-axis', lo: () => 0, hi: (x) => 1 - x * x, a: -1, b: 1, s: '1 − x²' },
  disk: { name: 'the disk x² + y² ≤ 4', lo: (x) => -Math.sqrt(Math.max(0, 4 - x * x)), hi: (x) => Math.sqrt(Math.max(0, 4 - x * x)), a: -2, b: 2, s: '2√(4 − x²)' },
  lens: { name: 'between y = 2x and y = x²', lo: (x) => x * x, hi: (x) => 2 * x, a: 0, b: 2, s: '2x − x²' },
  tri: { name: 'the triangle under y = 2 − x, x ≥ 0', lo: () => 0, hi: (x) => 2 - x, a: 0, b: 2, s: '2 − x' } };
const IX_XSHAPE = {
  sq: { name: 'Squares', k: 1, kt: '', A: 's²', pts: (s) => [[0, 0], [s, 0], [s, s], [0, s]] },
  semi: { name: 'Semicircles (diameter on the base)', k: Math.PI / 8, kt: 'π/8', A: '(π/8)s²', pts: (s) => Array.from({ length: 25 }, (_, i) => [s / 2 - s / 2 * Math.cos(i * Math.PI / 24), s / 2 * Math.sin(i * Math.PI / 24)]) },
  eq: { name: 'Equilateral triangles', k: Math.sqrt(3) / 4, kt: '√3/4', A: '(√3/4)s²', pts: (s) => [[0, 0], [s, 0], [s / 2, s * Math.sqrt(3) / 2]] },
  leg: { name: 'Isosceles right triangles, leg on the base', k: 0.5, kt: '1/2', A: '(1/2)s²', pts: (s) => [[0, 0], [s, 0], [0, s]] },
  hyp: { name: 'Isosceles right triangles, hypotenuse on the base', k: 0.25, kt: '1/4', A: '(1/4)s²', pts: (s) => [[0, 0], [s, 0], [s / 2, s / 2]] },
  rect: { name: 'Rectangles of height 2', k: 2, kt: '2', A: '2s', lin: true, pts: (s) => [[0, 0], [s, 0], [s, 2], [0, 2]] },
  halfh: { name: 'Rectangles with height = half the base', k: 0.5, kt: '1/2', A: '(1/2)s²', pts: (s) => [[0, 0], [s, 0], [s, s / 2], [0, s / 2]] } };
IX.knownCross = { subjects: ['apcalc'],
  title: 'Volumes with known cross sections', hint: 'Pick a base region (blue, lying flat) and a cross-section shape. Each slice perpendicular to the x-axis stands on the base with side s = top − bottom. Volume = ∫ A(x) dx. Drag to turn.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 520), ctx = cv._ctx; main.append(cv);
    const S = { base: IX_XBASE[o.base] ? o.base : 'sqrt', sh: IX_XSHAPE[o.sh] ? o.sh : 'sq', x: null, n: 14, az: -0.9, el: 0.45 };
    // an exact value from a decimal, when it is a simple fraction (times π or √3)
    const exact = (v, fac, ft) => { const r = v / fac; for (let q = 1; q <= 105; q++) { const p = Math.round(r * q); if (p && Math.abs(p / q - r) < 1e-7) { const f = q === 1 ? String(p) : `${p}/${q}`; return ft ? (f === '1' ? ft : `${f.includes('/') ? '(' + f + ')' : f}${ft}`) : f; } } return null; };
    function draw() {
      const B = IX_XBASE[S.base], H = IX_XSHAPE[S.sh], w = (x) => Math.max(0, B.hi(x) - B.lo(x)), cx = (B.a + B.b) / 2;
      let ymin = Infinity, ymax = -Infinity; for (let t = B.a; t <= B.b; t += (B.b - B.a) / 50) { ymin = Math.min(ymin, B.lo(t)); ymax = Math.max(ymax, B.hi(t)); }
      const smax = Math.max(...Array.from({ length: 51 }, (_, i) => w(B.a + (B.b - B.a) * i / 50))), sc = Math.min(380 / (B.b - B.a), 300 / (ymax - ymin), 250 / Math.max(smax, H.lin ? 2 : 0.1)), cy = (ymin + ymax) / 2;
      const T = ix3(320, 300, sc, S), W = (x, u, h) => [x - cx, u - cy, h]; ctx.clearRect(0, 0, 640, 520);
      const base = []; for (let j = 0; j <= 60; j++) { const x = B.a + (B.b - B.a) * j / 60; base.push(T(W(x, B.hi(x), 0))); } for (let j = 60; j >= 0; j--) { const x = B.a + (B.b - B.a) * j / 60; base.push(T(W(x, B.lo(x), 0))); } ix3Poly(ctx, base, 'rgba(31,95,168,.18)', IXC.blue, 2.4);
      ixLine(ctx, T(W(B.a - 0.3 * (B.b - B.a) / 4, 0, 0)), T(W(B.b + 0.4 * (B.b - B.a) / 4, 0, 0)), IXC.gray, 1.4); ixLabel(ctx, 'x', T(W(B.b + 0.4 * (B.b - B.a) / 4, 0, 0))[0] + 6, T(W(B.b + 0.4 * (B.b - B.a) / 4, 0, 0))[1], 16, 'left', IXC.gray, 'middle');
      for (let i = 0; i < S.n; i++) { const x = B.a + (B.b - B.a) * (i + 0.5) / S.n, s = w(x); if (s > 1e-6) ix3Poly(ctx, H.pts(s).map(([u, h]) => T(W(x, B.lo(x) + u, h))), 'rgba(46,125,79,.16)', 'rgba(46,125,79,.6)', 1.2); }
      const x = S.x ?? B.a + (B.b - B.a) * 0.55, s = w(x), A = H.lin ? H.k * s : H.k * s * s; if (s > 1e-6) ix3Poly(ctx, H.pts(s).map(([u, h]) => T(W(x, B.lo(x) + u, h))), 'rgba(181,72,43,.45)', IXC.red, 2.6);
      const I = ixInt((t) => (H.lin ? w(t) : w(t) ** 2), B.a, B.b, 2000), V = H.k * I, fac = S.sh === 'semi' ? Math.PI : S.sh === 'eq' ? Math.sqrt(3) : 1, ex = exact(V, fac, S.sh === 'semi' ? 'π' : S.sh === 'eq' ? '√3' : '');
      ixRead(read, [{ h: 'Base' }, B.name, `side s = top − bottom = ${B.s}`, { h: H.name }, `area of a slice: A = ${H.A}`, `at x = ${ixN(x, 2)}: s = ${ixN(s, 3)}, A = ${ixN(A, 3)}`, { h: 'Volume' }, `V = ∫ from ${ixN(B.a)} to ${ixN(B.b)} of ${H.A.replace(/s/g, `(${B.s})`)} dx`, ex && /^-?\d+$/.test(ex) ? `V = ${ex}` : `V = ${ex ? ex + ' ≈ ' : '≈ '}${ixN(V, 5)}`,
        { note: 'Slices perpendicular to the x-axis: write s in terms of x, put it into the area formula, and integrate from a to b.' }]);
    }
    const xS = ixSlider('slice at x', -2, 4, 0.02, 2, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    const fit = () => { const B = IX_XBASE[S.base], i = xS.querySelector('input'); i.min = B.a; i.max = B.b; S.x = B.a + (B.b - B.a) * 0.55; xS.set(S.x); };
    ctl.append(ixSel(Object.entries(IX_XBASE).map(([k, B]) => [k, 'Base: ' + B.name]), S.base, (k) => { S.base = k; fit(); draw(); }, 'Base'), ixSel(Object.entries(IX_XSHAPE).map(([k, H]) => [k, H.name]), S.sh, (k) => { S.sh = k; draw(); }, 'Cross sections'),
      xS, ixSlider('number of slices shown', 4, 30, 1, S.n, String, (v) => { S.n = v; draw(); }), el('div', { class: 'small' }, 'Drag the picture to turn it.'));
    fit(); ix3Turn(cv, S, draw); draw();
  } };

// ---- Arc length
const IX_ARC = { a: { name: 'x²/2, 0 ≤ x ≤ 2', f: (x) => x * x / 2, a: 0, b: 2, xr: [-0.3, 2.5], yr: [-0.3, 2.5] }, b: { name: 'x^(3/2), 0 ≤ x ≤ 4', f: (x) => Math.pow(Math.max(0, x), 1.5), a: 0, b: 4, xr: [-0.3, 4.5], yr: [-0.3, 8.5], ex: '(8/27)(10√10 − 1)' }, c: { name: 'sin x, 0 ≤ x ≤ π', f: Math.sin, a: 0, b: Math.PI, xr: [-0.2, 3.4], yr: [-0.5, 1.5] } };
IX.arcLength = { subjects: ['apcalc'],
  title: 'Arc length', hint: 'Slide n: the curve is approximated by n straight segments, each with length √(Δx² + Δy²). As n grows, the total approaches the arc length ∫ √(1 + (f′)²) dx.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: 'b', n: 4 };
    function draw() {
      const D = IX_ARC[S.k], V = ixView(cv, D.xr, D.yr, 26); ctx.clearRect(0, 0, 580, 520); ixGrid(ctx, V, { step: 1, lab: 1 }); ixCurve(ctx, V, D.f, IXC.blue, { w: 3.2, a: D.a, b: D.b });
      let tot = 0; for (let i = 0; i < S.n; i++) { const x0 = D.a + (D.b - D.a) * i / S.n, x1 = D.a + (D.b - D.a) * (i + 1) / S.n, p = [V.X(x0), V.Y(D.f(x0))], q = [V.X(x1), V.Y(D.f(x1))]; tot += Math.hypot(x1 - x0, D.f(x1) - D.f(x0)); ixLine(ctx, p, q, IXC.red, 2.4); ixDot(ctx, ...p, IXC.red, 4); }
      const exact = ixInt((x) => Math.sqrt(1 + ixD(D.f, x, 1e-6) ** 2), D.a + 1e-7, D.b, 2000);
      ixRead(read, [{ h: `y = ${D.name}` }, `${S.n} segments: total ≈ ${ixN(tot, 5)}`, { h: 'Arc length' }, 'L = ∫ from a to b of √(1 + (dy/dx)²) dx', `≈ ${ixN(exact, 5)}${D.ex ? ' = ' + D.ex : ''}`, { note: 'Each segment is the hypotenuse of a tiny right triangle with legs Δx and Δy ≈ f′(x)Δx.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_ARC).map(([k, D]) => [k, D.name]), S.k, (k) => { S.k = k; draw(); }), ixSlider('n (segments)', 1, 40, 1, S.n, String, (v) => { S.n = v; draw(); }));
    draw();
  } };

// ---- Area of a polar region
const IX_PA = { card: { name: 'r = 1 + cos θ', r: (t) => 1 + Math.cos(t), full: [0, 2 * Math.PI], R: 2.2, ex: '3π/2' }, rose: { name: 'r = 2 sin 3θ', r: (t) => 2 * Math.sin(3 * t), full: [0, Math.PI / 3], R: 2.2, ex: 'π/3 (one petal)' }, circ: { name: 'r = 2 sin θ', r: (t) => 2 * Math.sin(t), full: [0, Math.PI], R: 2.2, ex: 'π' }, lim: { name: 'r = 1 + 2 cos θ', r: (t) => 1 + 2 * Math.cos(t), full: [2 * Math.PI / 3, 4 * Math.PI / 3], R: 3.2, ex: 'π − 3√3/2 (inner loop)' } };
IX.polarArea = { subjects: ['apcalc'],
  title: 'Area in polar coordinates', hint: 'The region is cut into thin sectors (pie slices) with area about ½r²Δθ. Slide the angles α and β, and n, the number of sectors.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: 'card', al: 0, be: 2 * Math.PI, n: 12 }, sl = {};
    function draw() {
      const D = IX_PA[S.k], V = ixView(cv, [-D.R, D.R], [-D.R, D.R], 24); ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: 0.5, lab: 1 });
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3; ctx.beginPath(); for (let j = 0; j <= 600; j++) { const t = j * 2 * Math.PI / 600, r = D.r(t); j ? ctx.lineTo(V.X(r * Math.cos(t)), V.Y(r * Math.sin(t))) : ctx.moveTo(V.X(r * Math.cos(t)), V.Y(r * Math.sin(t))); } ctx.stroke(); ctx.restore();
      const { al, be, n } = S, dt = (be - al) / n; let approx = 0;
      for (let i = 0; i < n; i++) { const t0 = al + i * dt, tm = t0 + dt / 2, r = Math.abs(D.r(tm)); approx += 0.5 * r * r * dt; const sg = D.r(tm) < 0 ? -1 : 1; ctx.save(); ctx.fillStyle = 'rgba(181,72,43,.25)'; ctx.strokeStyle = IXC.red; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(V.X(0), V.Y(0)); const a0 = sg > 0 ? t0 : t0 + Math.PI; ctx.arc(V.X(0), V.Y(0), r * V.sx, -a0, -(a0 + dt), true); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      const exact = ixInt((t) => 0.5 * D.r(t) ** 2, al, be, 1000);
      ixRead(read, [{ h: D.name }, `from θ = ${ixPi(al / Math.PI)} to θ = ${ixPi(be / Math.PI)}`, `${n} sectors: ≈ ${ixN(approx, 5)}`, { h: 'Area' }, 'A = ½ ∫ from α to β of r² dθ', `≈ ${ixN(exact, 5)}`, Math.abs(al - D.full[0]) < 1e-6 && Math.abs(be - D.full[1]) < 1e-6 ? `= ${D.ex}` : null, { note: 'Find the θ-values where the curve starts and ends (often where r = 0) so you trace the region exactly once.' }]);
    }
    sl.al = ixSlider('α', 0, 2 * Math.PI, Math.PI / 12, S.al, (v) => ixPi(v / Math.PI), (v) => { S.al = Math.min(v, S.be); draw(); }); sl.be = ixSlider('β', 0, 2 * Math.PI, Math.PI / 12, S.be, (v) => ixPi(v / Math.PI), (v) => { S.be = Math.max(v, S.al); draw(); });
    ctl.append(ixSeg(Object.entries(IX_PA).map(([k, D]) => [k, D.name]), S.k, (k) => { S.k = k; [S.al, S.be] = IX_PA[k].full; sl.al.set(S.al); sl.be.set(S.be); draw(); }), sl.al, sl.be, ixSlider('n (sectors)', 1, 60, 1, S.n, String, (v) => { S.n = v; draw(); }));
    draw();
  } };

// ---- Infinite series: do the partial sums settle down?
const IX_SER = {
  geo: { name: 'Σ (1/2)ⁿ, n ≥ 1', a: (n) => 0.5 ** n, sum: 1, test: 'Geometric with r = 1/2: converges to a/(1 − r) = 1.' },
  tele: { name: 'Σ 1/(n(n + 1))', a: (n) => 1 / (n * (n + 1)), sum: 1, test: 'Telescoping: 1/n − 1/(n + 1), so Sₙ = 1 − 1/(n + 1) → 1.' },
  p2: { name: 'Σ 1/n²', a: (n) => 1 / (n * n), sum: Math.PI ** 2 / 6, test: 'p-series with p = 2 > 1: converges (to π²/6).' },
  harm: { name: 'Σ 1/n (harmonic)', a: (n) => 1 / n, sum: Infinity, test: 'p-series with p = 1: diverges, even though the terms → 0 (very slowly, like ln n).' },
  sqrt: { name: 'Σ 1/√n', a: (n) => 1 / Math.sqrt(n), sum: Infinity, test: 'p-series with p = ½ ≤ 1: diverges.' },
  alt: { name: 'Σ (−1)ⁿ⁺¹/n', a: (n) => (n % 2 ? 1 : -1) / n, sum: Math.log(2), test: 'Alternating Series Test: terms shrink to 0, so it converges (to ln 2), but only conditionally. Error ≤ the next term.' },
  nth: { name: 'Σ n/(n + 1)', a: (n) => n / (n + 1), sum: Infinity, test: 'nth Term Test: the terms → 1, not 0, so it diverges.' },
  ratio: { name: 'Σ n/2ⁿ', a: (n) => n / 2 ** n, sum: 2, test: 'Ratio Test: aₙ₊₁/aₙ → 1/2 < 1, so it converges (to 2).' } };
IX.series = { subjects: ['apcalc'],
  title: 'Infinite series: convergence', hint: 'Bars are the terms aₙ; the red dots are the partial sums Sₙ. Slide N to add more terms. A series converges if the partial sums level off at a number.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_SER[o.s] ? o.s : 'harm', N: 30 };
    function draw() {
      const D = IX_SER[S.k], N = S.N, A = Array.from({ length: N }, (_, i) => D.a(i + 1)), Sm = A.reduce((acc, v) => [...acc, (acc.at(-1) || 0) + v], []);
      const hi = Math.max(1.2, ...Sm, isFinite(D.sum) ? D.sum * 1.1 : 0), lo = Math.min(0, ...A, ...Sm), V = ixView(cv, [0, N + 1], [lo - 0.1, hi * 1.08], 34); ctx.clearRect(0, 0, 640, 500); ixGrid2(ctx, V, N > 60 ? 10 : N > 20 ? 5 : 1, hi > 6 ? 1 : 0.25, N > 60 ? 20 : N > 20 ? 5 : 2, hi > 6 ? 2 : 0.5);
      const bw = Math.max(1.5, (V.X(2) - V.X(1)) * 0.6); A.forEach((v, i) => { ctx.save(); ctx.fillStyle = v >= 0 ? 'rgba(31,95,168,.45)' : 'rgba(210,123,18,.55)'; ctx.fillRect(V.X(i + 1) - bw / 2, Math.min(V.Y(0), V.Y(v)), bw, Math.abs(V.Y(v) - V.Y(0))); ctx.restore(); });
      ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 2; ctx.beginPath(); Sm.forEach((s, i) => (i ? ctx.lineTo(V.X(i + 1), V.Y(s)) : ctx.moveTo(V.X(i + 1), V.Y(s)))); ctx.stroke(); ctx.restore(); if (N <= 60) Sm.forEach((s, i) => ixDot(ctx, V.X(i + 1), V.Y(s), IXC.red, 3.5));
      if (isFinite(D.sum)) { ixLine(ctx, [V.X(0), V.Y(D.sum)], [V.X(N + 1), V.Y(D.sum)], IXC.green, 2, true); ixLabel(ctx, `sum = ${ixN(D.sum, 4)}`, V.X(N + 1) - 4, V.Y(D.sum) - 4, 15, 'right', IXC.green, 'bottom'); }
      ixRead(read, [{ h: D.name }, `a${'₀₁₂₃₄₅₆₇₈₉'[N % 10]} … the ${N}th term: ${ixN(A[N - 1], 5)}`, `S${N} = ${ixN(Sm[N - 1], 5)}`, isFinite(D.sum) ? { note: 'Converges: ' + D.test, good: true } : { note: 'Diverges: ' + D.test, bad: true }]);
    }
    ctl.append(ixSel(Object.entries(IX_SER).map(([k, D]) => [k, D.name]), S.k, (k) => { S.k = k; draw(); }, 'Series'), ixSlider('N (number of terms)', 1, 200, 1, S.N, String, (v) => { S.N = v; draw(); }));
    draw();
  } };

// ---- Taylor polynomials
const IX_TAY = {
  exp: { name: 'eˣ', f: Math.exp, c: (k) => 1 / ixFact(k), yr: [-2, 8], xr: [-4, 3], R: Infinity, series: '1 + x + x²/2! + x³/3! + …' },
  sin: { name: 'sin x', f: Math.sin, c: (k) => (k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / ixFact(k) : 0), yr: [-3, 3], xr: [-8, 8], R: Infinity, series: 'x − x³/3! + x⁵/5! − …' },
  cos: { name: 'cos x', f: Math.cos, c: (k) => (k % 2 ? 0 : ((k / 2) % 2 ? -1 : 1) / ixFact(k)), yr: [-3, 3], xr: [-8, 8], R: Infinity, series: '1 − x²/2! + x⁴/4! − …' },
  ln: { name: 'ln(1 + x)', f: (x) => (x > -1 ? Math.log(1 + x) : NaN), c: (k) => (k ? (k % 2 ? 1 : -1) / k : 0), yr: [-3, 2], xr: [-1.5, 2.5], R: 1, iv: '−1 < x ≤ 1', series: 'x − x²/2 + x³/3 − …' },
  geo: { name: '1/(1 − x)', f: (x) => 1 / (1 - x), c: () => 1, yr: [-2, 6], xr: [-2, 1.8], R: 1, iv: '−1 < x < 1', series: '1 + x + x² + x³ + …' },
  atan: { name: 'tan⁻¹ x', f: Math.atan, c: (k) => (k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / k : 0), yr: [-2, 2], xr: [-2.5, 2.5], R: 1, iv: '−1 ≤ x ≤ 1', series: 'x − x³/3 + x⁵/5 − …' } };
const ixFact = (k) => { let p = 1; for (let i = 2; i <= k; i++) p *= i; return p; };
IX.taylor = { subjects: ['apcalc'],
  title: 'Taylor and Maclaurin polynomials', hint: 'Slide the degree n: the polynomial (red) hugs the function (blue) over a wider and wider interval. Outside the interval of convergence (shaded edges), it can’t keep up.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 520), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_TAY[o.f] ? o.f : 'sin', n: 3, x: 1 };
    function draw() {
      const F = IX_TAY[S.k], V = ixView(cv, F.xr, F.yr, 26), P = (x) => { let s = 0; for (let k = 0; k <= S.n; k++) s += F.c(k) * x ** k; return s; }; ctx.clearRect(0, 0, 600, 520);
      if (isFinite(F.R)) { ctx.save(); ctx.fillStyle = 'rgba(46,125,79,.10)'; ctx.fillRect(V.X(-F.R), V.Y(F.yr[1]), V.X(F.R) - V.X(-F.R), V.Y(F.yr[0]) - V.Y(F.yr[1])); ctx.restore(); }
      ixGrid(ctx, V, { step: 1, lab: F.xr[1] > 5 ? 2 : 1 }); ixCurve(ctx, V, F.f, IXC.blue, { w: 4 }); ixCurve(ctx, V, P, IXC.red, { w: 2.6 });
      const x = S.x, fx = F.f(x), px = P(x); ixDot(ctx, V.X(x), V.Y(fx), IXC.blue, 6); if (Math.abs(px) < 50) ixDot(ctx, V.X(x), V.Y(px), IXC.red, 6);
      const terms = []; for (let k = 0; k <= S.n; k++) { const c = F.c(k); if (Math.abs(c) < 1e-12) continue; const fr = ixFrac(Math.abs(c), [2, 3, 4, 5, 6, 7, 8, 24, 120, 720, 5040, 40320]); terms.push(`${terms.length ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : ''}${k === 0 ? fr : (fr === '1' ? '' : fr.startsWith('1/') ? fr.replace('1/', 'x' + (k > 1 ? ixSup(String(k)) : '') + '/') : fr.includes('/') ? fr.replace('/', 'x' + (k > 1 ? ixSup(String(k)) : '') + '/') : fr) + (fr.includes('/') ? '' : 'x' + (k > 1 ? ixSup(String(k)) : ''))}`); }
      const err = Math.abs(fx - px), lag = isFinite(F.R) ? null : Math.max(1, S.k === 'exp' ? Math.exp(Math.max(0, x)) : 1) * Math.abs(x) ** (S.n + 1) / ixFact(S.n + 1);
      ixRead(read, [{ h: `${F.name} ≈ P${'₀₁₂₃₄₅₆₇₈₉'[S.n % 10]}${S.n > 9 ? '' : ''}(x)` }, terms.join('') || '0', `series: ${F.series}`, { h: `At x = ${ixN(x, 2)}` }, `f(x) = ${ixN(fx, 6)}`, `P(x) = ${ixN(px, 6)}`, `error = ${ixN(err, 6)}`,
        lag != null ? `Lagrange bound: |R| ≤ M|x|ⁿ⁺¹/(n + 1)! ≈ ${ixN(lag, 6)}` : null, isFinite(F.R) ? { note: `Interval of convergence: ${F.iv} (green). Outside it, more terms make it worse, not better.` } : { note: 'This series converges for every x: more terms → better everywhere.' }]);
    }
    ctl.append(ixSeg(Object.entries(IX_TAY).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; draw(); }), ixSlider('degree n', 0, 15, 1, S.n, String, (v) => { S.n = v; draw(); }), ixSlider('x', -3, 3, 0.05, S.x, (v) => ixN(v, 2), (v) => { S.x = v; draw(); }));
    draw();
  } };

// ---- Motion along a curve: velocity and acceleration vectors
const IX_CM = { ell: { name: 'x = 3cos t, y = 2sin t', r: (t) => [3 * Math.cos(t), 2 * Math.sin(t)], T: 2 * Math.PI, R: 4 }, proj: { name: 'x = 4t, y = 8t − 4t²', r: (t) => [4 * t, 8 * t - 4 * t * t], T: 2, R: 9, shift: [-4, -1] }, cyc: { name: 'x = t − sin t, y = 1 − cos t', r: (t) => [t - Math.sin(t), 1 - Math.cos(t)], T: 4 * Math.PI, R: 7, shift: [-6.3, -1] }, lis: { name: 'x = 3sin 2t, y = 3sin 3t', r: (t) => [3 * Math.sin(2 * t), 3 * Math.sin(3 * t)], T: 2 * Math.PI, R: 4 } };
IX.curveMotion = { subjects: ['apcalc', 'calc3'],
  title: 'Motion along a curve: velocity and acceleration', hint: 'A particle moves along a parametric curve. The green arrow is velocity (tangent to the path); the orange arrow is acceleration. Slide t or press ▶.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: 'ell', t: 1, play: null };
    function draw() {
      const C = IX_CM[S.k], sh = C.shift || [0, 0], V = ixView(cv, [-C.R + sh[0] * -1 + (sh[0] ? 0 : 0), C.R - sh[0] * 0], [-C.R, C.R], 24), Q = ixView(cv, [-C.R - sh[0], C.R - sh[0]], [-C.R - sh[1], C.R - sh[1]], 24); ctx.clearRect(0, 0, 580, 560); ixGrid(ctx, Q, { step: 1, lab: 2 });
      ctx.save(); ctx.strokeStyle = IXC.blue; ctx.lineWidth = 3; ctx.beginPath(); for (let j = 0; j <= 600; j++) { const p = C.r(C.T * j / 600); j ? ctx.lineTo(Q.X(p[0]), Q.Y(p[1])) : ctx.moveTo(Q.X(p[0]), Q.Y(p[1])); } ctx.stroke(); ctx.restore();
      const t = S.t, p = C.r(t), v = [ixD((u) => C.r(u)[0], t), ixD((u) => C.r(u)[1], t)], a = [ixD2((u) => C.r(u)[0], t), ixD2((u) => C.r(u)[1], t)], sp = Math.hypot(...v), P = [Q.X(p[0]), Q.Y(p[1])];
      ixArrow(ctx, P, [Q.X(p[0] + v[0] * 0.5), Q.Y(p[1] + v[1] * 0.5)], IXC.green, 3.4, 'v'); ixArrow(ctx, P, [Q.X(p[0] + a[0] * 0.35), Q.Y(p[1] + a[1] * 0.35)], IXC.orange, 3, 'a'); ixDot(ctx, ...P, IXC.red, 8, true);
      const slope = v[0] ? v[1] / v[0] : NaN;
      ixRead(read, [{ h: C.name }, `t = ${ixN(t, 2)}: position (${ixN(p[0], 3)}, ${ixN(p[1], 3)})`, `velocity ⟨x′, y′⟩ = ⟨${ixN(v[0], 3)}, ${ixN(v[1], 3)}⟩`, `speed = √((x′)² + (y′)²) = ${ixN(sp, 3)}`, `acceleration ⟨x″, y″⟩ = ⟨${ixN(a[0], 3)}, ${ixN(a[1], 3)}⟩`,
        { h: 'Slope of the path' }, `dy/dx = (dy/dt)/(dx/dt) = ${isFinite(slope) ? ixN(slope, 3) : 'undefined (vertical tangent)'}`, Math.abs(v[1]) < 0.02 ? { note: 'dy/dt = 0: horizontal tangent.' } : Math.abs(v[0]) < 0.02 ? { note: 'dx/dt = 0: vertical tangent.' } : null, { note: 'Distance traveled = ∫ speed dt.' }]);
    }
    const stop = () => { if (S.play) { clearInterval(S.play); S.play = null; } }, tS = ixSlider('t', 0, 2 * Math.PI, 0.01, S.t, (v) => ixN(v, 2), (v) => { stop(); S.t = v; draw(); });
    ctl.append(ixSeg(Object.entries(IX_CM).map(([k, C]) => [k, C.name]), S.k, (k) => { stop(); S.k = k; S.t = IX_CM[k].T / 4; const i = tS.querySelector('input'); i.max = IX_CM[k].T; tS.set(S.t); draw(); }), tS,
      el('div', { class: 'ix-btns' }, ixBtn('▶ Play', () => { stop(); S.t = 0; S.play = setInterval(() => { S.t += IX_CM[S.k].T / 400; if (S.t >= IX_CM[S.k].T || !cv.isConnected) { S.t = Math.min(S.t, IX_CM[S.k].T); stop(); } tS.set(S.t); draw(); }, 30); })));
    draw();
  } };

// ---- Work: area under a force graph
IX.work = { subjects: ['apcalc'],
  title: 'Work done by a variable force', hint: 'Work is force times distance; when the force changes, work is the area under the force graph. Stretch the spring from a to b.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: 20, a: 0, b: 0.5 };
    function draw() {
      ctx.clearRect(0, 0, 600, 500); const { k, a, b } = S, u = 600; const x0 = 60, y0 = 90, stretch = b * u * 0.6;
      ctx.save(); ctx.fillStyle = '#cfcabd'; ctx.fillRect(20, 40, 30, 100); ctx.restore(); ctx.save(); ctx.strokeStyle = IXC.ink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(50, y0); const L = 160 + stretch, coils = 14; for (let i = 0; i <= coils * 4; i++) ctx.lineTo(50 + L * i / (coils * 4), y0 + (i % 4 === 1 ? -14 : i % 4 === 3 ? 14 : 0)); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.fillStyle = IXC.blue; ctx.fillRect(50 + L, y0 - 22, 34, 44); ctx.restore(); ixLabel(ctx, `stretched ${ixN(b, 2)} m`, 50 + L + 40, y0, 16, 'left', IXC.blue, 'middle');
      const V0 = ixView({ _w: 600, _h: 330 }, [0, 1], [0, 30], 40), V = { ...V0, Y: (y) => 170 + V0.Y(y) }; ixGrid2(ctx, V, 0.1, 5, 0.2, 10);
      ix3Poly(ctx, [[V.X(a), V.Y(0)], [V.X(a), V.Y(k * a)], [V.X(b), V.Y(k * b)], [V.X(b), V.Y(0)]], 'rgba(31,95,168,.25)', IXC.blue, 1.6); ixCurve(ctx, V, (x) => k * x, IXC.red, { w: 3, a: 0, b: 1 });
      ixLabel(ctx, 'F(x) = kx (newtons)', V.X(0.98), V.Y(k * 0.98) - 6, 15, 'right', IXC.red, 'bottom'); ixLabel(ctx, 'x (meters)', V.X(1), V.Y(0) + 18, 14, 'right', IXC.gray);
      const W = k / 2 * (b * b - a * a);
      ixRead(read, [{ h: 'Hooke’s Law: F(x) = kx' }, `k = ${k} N/m`, { h: `Stretch from ${ixN(a, 2)} m to ${ixN(b, 2)} m` }, 'W = ∫ from a to b of kx dx = (k/2)(b² − a²)', `= (${k}/2)(${ixN(b, 2)}² − ${ixN(a, 2)}²) = ${ixN(W, 3)} J`, { note: 'The shaded area under the force graph is the work. Stretching further takes more work for each extra meter.' }]);
    }
    ctl.append(ixSlider('spring constant k', 5, 30, 1, S.k, String, (v) => { S.k = v; draw(); }), ixSlider('from a', 0, 0.9, 0.05, S.a, (v) => ixN(v, 2), (v) => { S.a = Math.min(v, S.b); draw(); }), ixSlider('to b', 0.05, 1, 0.05, S.b, (v) => ixN(v, 2), (v) => { S.b = Math.max(v, S.a); draw(); }));
    draw();
  } };
// earlier interactives that also fit AP Calculus
['funcTest', 'polynomial', 'piecewise', 'compose', 'transform', 'inverse', 'logs', 'exponential', 'wave', 'invTrig', 'sequences', 'parametric', 'polar', 'vectors'].forEach((k) => { if (IX[k] && !IX[k].subjects.includes('apcalc')) IX[k].subjects.push('apcalc'); });

// ---- The Chain Rule: rates multiply
const IX_CHAIN = {
  a: { name: 'y = u⁵, u = x² + 1', g: (x) => x * x + 1, gd: (x) => 2 * x, f: (u) => u ** 5, fd: (u) => 5 * u ** 4, gs: 'x² + 1', fs: 'u⁵', gds: '2x', fds: '5u⁴', x: 0.5, xr: [-1.1, 1.1] },
  b: { name: 'f(x) = (3x² − 5)⁴', g: (x) => 3 * x * x - 5, gd: (x) => 6 * x, f: (u) => u ** 4, fd: (u) => 4 * u ** 3, gs: '3x² − 5', fs: 'u⁴', gds: '6x', fds: '4u³', x: 1, xr: [-1.8, 1.8] },
  c: { name: 'y = e^(x² − 3x)', g: (x) => x * x - 3 * x, gd: (x) => 2 * x - 3, f: Math.exp, fd: Math.exp, gs: 'x² − 3x', fs: 'eᵘ', gds: '2x − 3', fds: 'eᵘ', x: 1, xr: [-0.5, 3.5] },
  d: { name: 'y = sin(4x)', g: (x) => 4 * x, gd: () => 4, f: Math.sin, fd: Math.cos, gs: '4x', fs: 'sin u', gds: '4', fds: 'cos u', x: 0.3, xr: [-1.6, 1.6] },
  e: { name: 'y = (x² − 3)³', g: (x) => x * x - 3, gd: (x) => 2 * x, f: (u) => u ** 3, fd: (u) => 3 * u * u, gs: 'x² − 3', fs: 'u³', gds: '2x', fds: '3u²', x: 2, xr: [-2.5, 2.5] } };
IX.chainRule = { subjects: ['apcalc'],
  title: 'The Chain Rule: rates multiply', hint: 'Nudge x by a small Δx. Watch u change by about (du/dx)·Δx and y change by about (dy/du)·Δu. So dy/dx = (dy/du)(du/dx).',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_CHAIN[o.k] ? o.k : 'a', x: null, dx: 0.1 };
    function draw() {
      const C = IX_CHAIN[S.k], x = S.x ?? C.x, dx = S.dx, u = C.g(x), y = C.f(u), u2 = C.g(x + dx), y2 = C.f(u2), du = C.gd(x), dy = C.fd(u); ctx.clearRect(0, 0, 640, 560);
      // three gauges: each shows a window around its value, with the change highlighted, all at the same scale per unit of Δx
      const gauge = (yy, name, v, v2, col, sub) => { const sc = 260 / Math.max(Math.abs(v2 - v), Math.abs(dx), 1e-9) * Math.min(1, 0.5), cx = 320; ixLine(ctx, [40, yy], [600, yy], IXC.ink, 2);
        const a = cx, b = cx + (v2 - v) * sc * 0 + (v2 - v) / Math.max(Math.abs(v2 - v), 1e-12) * Math.min(260, Math.abs(v2 - v) / Math.abs(dx) * 22); ctx.save(); ctx.fillStyle = col + '40'; ctx.fillRect(Math.min(a, b), yy - 10, Math.abs(b - a), 20); ctx.restore(); ixArrow(ctx, [a, yy], [b, yy], col, 3);
        ixDot(ctx, a, yy, IXC.ink, 6); ixLabel(ctx, `${name} = ${ixN(v, 4)}`, 40, yy - 34, 18, 'left', col); ixLabel(ctx, sub, 600, yy - 34, 16, 'right', col); };
      gauge(70, 'x', x, x + dx, IXC.blue, `Δx = ${ixN(dx, 3)}`); gauge(170, 'u', u, u2, IXC.green, `Δu = ${ixN(u2 - u, 4)} ≈ ${ixN(du, 3)} · Δx`); gauge(270, 'y', y, y2, IXC.red, `Δy = ${ixN(y2 - y, 4)} ≈ ${ixN(dy, 3)} · Δu`);
      ixLabel(ctx, '(arrow lengths: change compared with Δx)', 320, 300, 13, 'center', IXC.gray);
      // the composite graph with its tangent
      const yf = (t) => C.f(C.g(t)); let lo = Infinity, hi = -Infinity; for (let t = C.xr[0]; t <= C.xr[1]; t += (C.xr[1] - C.xr[0]) / 200) { const v = yf(t); if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      const pad = (hi - lo) * 0.1 || 1, G0 = ixView({ _w: 640, _h: 240 }, C.xr, [lo - pad, hi + pad], 26), G = { ...G0, Y: (v) => 320 + G0.Y(v) }; ixGrid2(ctx, G, 0.5, (hi - lo) / 4 || 1, 1, (hi - lo) / 2 || 1);
      ixCurve(ctx, G, yf, IXC.blue, { w: 2.8 }); ixCurve(ctx, G, (t) => y + dy * du * (t - x), IXC.red, { w: 2, dash: true, a: x - 0.6, b: x + 0.6 }); ixDot(ctx, G.X(x), G.Y(y), IXC.red, 6, true);
      ixRead(read, [{ h: C.name }, `u = ${C.gs}, y = ${C.fs}`, { h: `At x = ${ixN(x, 2)}` }, `du/dx = ${C.gds} = ${ixN(du, 4)}`, `dy/du = ${C.fds} = ${ixN(dy, 4)} (at u = ${ixN(u, 3)})`, `dy/dx = (dy/du)(du/dx) = ${ixN(dy * du, 4)}`,
        `check, Δy/Δx = ${ixN((y2 - y) / dx, 4)} with Δx = ${ixN(dx, 3)}`, { note: 'Outside derivative (evaluated at the inside) times inside derivative. Make Δx smaller and Δy/Δx gets closer to dy/dx.' }]);
    }
    const xS = ixSlider('x', -2, 3.5, 0.05, 0.5, (v) => ixN(v, 2), (v) => { S.x = v; draw(); });
    ctl.append(ixSel(Object.entries(IX_CHAIN).map(([k, C]) => [k, C.name]), S.k, (k) => { S.k = k; S.x = null; xS.set(IX_CHAIN[k].x); draw(); }, 'Function'), xS, ixSlider('Δx', 0.001, 0.3, 0.001, S.dx, (v) => ixN(v, 3), (v) => { S.dx = v; draw(); }));
    xS.set(IX_CHAIN[S.k].x); draw();
  } };

// ---- Implicit differentiation: tangent lines on curves that aren’t functions
const IX_IMP = {
  circ: { name: 'x² + y² = 25', F: (x, y) => x * x + y * y - 25, Fx: (x) => 2 * x, Fy: (x, y) => 2 * y, dyx: 'dy/dx = −x/y', steps: ['2x + 2y (dy/dx) = 0', 'dy/dx = −x/y'], P: [3, -4], R: 7 },
  ell: { name: 'x² + xy + y² = 7', F: (x, y) => x * x + x * y + y * y - 7, Fx: (x, y) => 2 * x + y, Fy: (x, y) => x + 2 * y, dyx: 'dy/dx = −(2x + y)/(x + 2y)', steps: ['2x + y + x (dy/dx) + 2y (dy/dx) = 0', 'dy/dx = −(2x + y)/(x + 2y)'], P: [1, 2], R: 4.5 },
  hyp: { name: 'x² + 3xy + y² = −1', F: (x, y) => x * x + 3 * x * y + y * y + 1, Fx: (x, y) => 2 * x + 3 * y, Fy: (x, y) => 3 * x + 2 * y, dyx: 'dy/dx = −(2x + 3y)/(3x + 2y)', steps: ['2x + 3y + 3x (dy/dx) + 2y (dy/dx) = 0', 'dy/dx = −(2x + 3y)/(3x + 2y)'], P: [1, -2], R: 5 },
  fol: { name: 'x³ + y³ = 6xy (folium)', F: (x, y) => x ** 3 + y ** 3 - 6 * x * y, Fx: (x, y) => 3 * x * x - 6 * y, Fy: (x, y) => 3 * y * y - 6 * x, dyx: 'dy/dx = (2y − x²)/(y² − 2x)', steps: ['3x² + 3y² (dy/dx) = 6y + 6x (dy/dx)', 'dy/dx = (2y − x²)/(y² − 2x)'], P: [3, 3], R: 5 } };
IX.implicit = { subjects: ['apcalc'],
  title: 'Implicit differentiation', hint: 'These curves aren’t functions, but they still have tangent lines. Drag the red point along the curve: the tangent’s slope is dy/dx, found by differentiating both sides with respect to x.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_IMP[o.k] ? o.k : 'circ', P: null };
    const snap = (C, p) => { let [x, y] = p; for (let i = 0; i < 30; i++) { const f = C.F(x, y), gx = C.Fx(x, y), gy = C.Fy(x, y), g2 = gx * gx + gy * gy || 1; x -= f * gx / g2; y -= f * gy / g2; } return [x, y]; };
    function draw() {
      const C = IX_IMP[S.k], V = ixView(cv, [-C.R, C.R], [-C.R, C.R], 24), P = S.P || C.P; ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: 1, lab: C.R > 5 ? 2 : 1 });
      ixContour(C.F, C.R, 0, 220).forEach(([a, b]) => ixLine(ctx, [V.X(a[0]), V.Y(a[1])], [V.X(b[0]), V.Y(b[1])], IXC.blue, 3));
      const [x, y] = P, fx = C.Fx(x, y), fy = C.Fy(x, y), vert = Math.abs(fy) < 1e-6 * Math.max(1, Math.abs(fx)), m = -fx / fy;
      if (vert) ixLine(ctx, [V.X(x), V.Y(-C.R)], [V.X(x), V.Y(C.R)], IXC.red, 2.4); else ixCurve(ctx, V, (t) => y + m * (t - x), IXC.red, { w: 2.4 });
      ixDot(ctx, V.X(x), V.Y(y), IXC.red, 8, true);
      ixRead(read, [{ h: C.name }, 'differentiate both sides with respect to x (remember dy/dx on every y):', ...C.steps, { h: `At (${ixN(x, 2)}, ${ixN(y, 2)})` }, vert ? 'dy/dx is undefined: a vertical tangent' : `dy/dx = ${ixN(m, 4)}`, !vert && Math.abs(m) < 1e-3 ? { note: 'Horizontal tangent: the top of the numerator is 0.' } : null,
        vert ? null : `tangent line: y ${y < 0 ? '+' : '−'} ${ixN(Math.abs(y), 2)} = ${ixN(m, 3)}(x ${x < 0 ? '+' : '−'} ${ixN(Math.abs(x), 2)})`, { note: 'Where the bottom of dy/dx is 0, the tangent is vertical; where the top is 0, it’s horizontal.' }]);
    }
    ctl.append(ixSel(Object.entries(IX_IMP).map(([k, C]) => [k, C.name]), S.k, (k) => { S.k = k; S.P = null; draw(); }, 'Curve'), el('div', { class: 'small' }, 'Drag the red point; it stays on the curve.'));
    ixDrag(cv, () => 'p', (h, px, py) => { const C = IX_IMP[S.k], V = ixView(cv, [-C.R, C.R], [-C.R, C.R], 24), q = snap(C, [V.ix(px), V.iy(py)]); if (q.every(isFinite) && Math.hypot(q[0] - V.ix(px), q[1] - V.iy(py)) < C.R / 2.5) { S.P = q; draw(); } });
    draw();
  } };

// ---- Derivatives of inverse functions
const IX_INVD = {
  cub: { name: 'f(x) = x³ + x + 1', f: (x) => x ** 3 + x + 1, d: (x) => 3 * x * x + 1, dom: [-1.6, 1.6], a: 1, R: 5, ds: 'f′(x) = 3x² + 1' },
  sin: { name: 'f(x) = sin x (−π/2 ≤ x ≤ π/2)', f: Math.sin, d: Math.cos, dom: [-Math.PI / 2, Math.PI / 2], a: Math.PI / 6, R: 2, ds: 'f′(x) = cos x; so (sin⁻¹)′(x) = 1/√(1 − x²)' },
  tan: { name: 'f(x) = tan x (−π/2 < x < π/2)', f: Math.tan, d: (x) => 1 / Math.cos(x) ** 2, dom: [-1.35, 1.35], a: Math.PI / 3, R: 4, ds: 'f′(x) = sec²x; so (tan⁻¹)′(x) = 1/(1 + x²)' },
  exp: { name: 'f(x) = eˣ', f: Math.exp, d: Math.exp, dom: [-3, 1.6], a: 0.5, R: 5, ds: 'f′(x) = eˣ; so (ln)′(x) = 1/x' } };
IX.invDeriv = { subjects: ['apcalc'],
  title: 'Derivatives of inverse functions', hint: 'f (blue) and its inverse (red) are reflections over y = x. The point (a, b) on f matches (b, a) on f⁻¹, and their tangent slopes are reciprocals.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(560, 560), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_INVD[o.k] ? o.k : 'cub', a: null };
    function draw() {
      const F = IX_INVD[S.k], R = F.R, V = ixView(cv, [-R, R], [-R, R], 24), a = S.a ?? F.a, b = F.f(a), m = F.d(a); ctx.clearRect(0, 0, 560, 560); ixGrid(ctx, V, { step: R > 3 ? 1 : 0.5, lab: R > 3 ? 1 : 1 });
      ixLine(ctx, [V.X(-R), V.Y(-R)], [V.X(R), V.Y(R)], IXC.gray, 1.4, true); ixCurve(ctx, V, F.f, IXC.blue, { w: 3.2, a: F.dom[0], b: F.dom[1] });
      ctx.save(); ctx.strokeStyle = IXC.red; ctx.lineWidth = 3.2; ctx.beginPath(); for (let j = 0; j <= 300; j++) { const t = F.dom[0] + (F.dom[1] - F.dom[0]) * j / 300, X = V.X(F.f(t)), Y = V.Y(t); j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); ctx.restore();
      ixCurve(ctx, V, (t) => b + m * (t - a), IXC.blue, { w: 1.8, dash: true, a: a - 1.2, b: a + 1.2 }); ixCurve(ctx, V, (t) => a + (t - b) / m, IXC.red, { w: 1.8, dash: true, a: b - 1.2 * m, b: b + 1.2 * m });
      ixDot(ctx, V.X(a), V.Y(b), IXC.blue, 7, true); ixDot(ctx, V.X(b), V.Y(a), IXC.red, 7, true); ixLine(ctx, [V.X(a), V.Y(b)], [V.X(b), V.Y(a)], IXC.purple, 1.4, true);
      ixRead(read, [{ h: F.name }, F.ds, { h: `a = ${ixN(a, 3)}, b = f(a) = ${ixN(b, 3)}` }, `slope of f at (a, b): f′(a) = ${ixN(m, 4)}`, `slope of f⁻¹ at (b, a): 1/f′(a) = ${ixN(1 / m, 4)}`, { note: '(f⁻¹)′(b) = 1/f′(a), where f(a) = b. Find a first: the x that f sends to b.' },
        S.k === 'cub' ? { note: 'Example: g′(3)? f(1) = 3, so g′(3) = 1/f′(1) = 1/4.' } : null]);
    }
    const aS = ixSlider('a', -1.5, 1.5, 0.05, 1, (v) => ixN(v, 2), (v) => { S.a = v; draw(); });
    ctl.append(ixSel(Object.entries(IX_INVD).map(([k, F]) => [k, F.name]), S.k, (k) => { S.k = k; S.a = null; const i = aS.querySelector('input'); i.min = IX_INVD[k].dom[0] + 0.05; i.max = IX_INVD[k].dom[1] - 0.05; aS.set(IX_INVD[k].a); draw(); }, 'Function'), aS);
    aS.set(IX_INVD[S.k].a); draw();
  } };

// ---- Antiderivatives: a family of curves, and one initial value
const IX_ANTI = {
  cos: { name: 'f(x) = cos x', F: Math.sin, Fs: 'sin x + C', xr: [-2 * Math.PI, 2 * Math.PI], yr: [-5, 5] },
  poly: { name: 'f(x) = 6x² − 4x + 5', F: (x) => 2 * x ** 3 - 2 * x * x + 5 * x, Fs: '2x³ − 2x² + 5x + C', xr: [-2, 2.5], yr: [-15, 20] },
  explog: { name: 'f(x) = eˣ + 1/x, x > 0', F: (x) => (x > 0 ? Math.exp(x) + Math.log(x) : NaN), Fs: 'eˣ + ln x + C', xr: [0, 2.5], yr: [-6, 14] },
  lin: { name: 'dy/dx = 2x + 3', F: (x) => x * x + 3 * x, Fs: 'x² + 3x + C', xr: [-5, 3], yr: [-6, 12], P: [0, 4] } };
IX.antideriv = { subjects: ['apcalc'],
  title: 'Antiderivatives and initial values', hint: 'Every curve F(x) + C has the same slope at each x, so they’re vertical shifts of each other. Drag the red point to choose the one curve through it: that’s an initial value problem.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(580, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_ANTI[o.k] ? o.k : 'cos', P: null, x: null };
    function draw() {
      const A = IX_ANTI[S.k], V = ixView(cv, A.xr, A.yr, 26), sp = (A.yr[1] - A.yr[0]) / 10; ctx.clearRect(0, 0, 580, 540); ixGrid2(ctx, V, A.xr[1] > 5 ? Math.PI / 2 : 0.5, sp / 2, A.xr[1] > 5 ? Math.PI : 1, sp);
      for (let c = -5; c <= 5; c++) ixCurve(ctx, V, (x) => A.F(x) + c * sp, '#b7c8de', { w: 1.6 });
      const P = S.P || A.P || [A.xr[0] + (A.xr[1] - A.xr[0]) * 0.6, A.F(A.xr[0] + (A.xr[1] - A.xr[0]) * 0.6)], C = P[1] - A.F(P[0]);
      ixCurve(ctx, V, (x) => A.F(x) + C, IXC.red, { w: 3.4 });
      const x = S.x ?? (A.xr[0] + (A.xr[1] - A.xr[0]) * 0.35), m = ixD(A.F, x); for (let c = -5; c <= 5; c++) { const y = A.F(x) + c * sp; if (y > A.yr[0] && y < A.yr[1]) ixCurve(ctx, V, (t) => y + m * (t - x), IXC.green, { w: 2, a: x - 0.15 * (A.xr[1] - A.xr[0]) / 4, b: x + 0.15 * (A.xr[1] - A.xr[0]) / 4 }); }
      ixLine(ctx, [V.X(x), V.Y(A.yr[0])], [V.X(x), V.Y(A.yr[1])], IXC.gray, 1, true); ixDot(ctx, V.X(P[0]), V.Y(P[1]), IXC.red, 8, true);
      ixRead(read, [{ h: A.name }, `all antiderivatives: F(x) = ${A.Fs}`, { note: `At x = ${ixN(x, 2)} every curve has the same slope, ${ixN(m, 3)} (the green segments are parallel).` },
        { h: `Through (${ixN(P[0], 2)}, ${ixN(P[1], 2)})` }, `${ixN(P[1], 2)} = F(${ixN(P[0], 2)}) + C`, `C = ${ixN(C, 3)}`, `y = ${Math.abs(C) < 1e-9 ? A.Fs.replace(' + C', '') : A.Fs.replace('C', ixN(C, 3))}`.replace('+ −', '− '), { note: 'An initial condition picks out exactly one curve from the family.' }]);
    }
    ctl.append(ixSel(Object.entries(IX_ANTI).map(([k, A]) => [k, A.name]), S.k, (k) => { S.k = k; S.P = null; S.x = null; draw(); }, 'Function'), el('div', { class: 'small' }, 'Drag the red point to choose the initial value; drag elsewhere to move the green slopes.'));
    ixDrag(cv, (px, py) => { const A = IX_ANTI[S.k], V = ixView(cv, A.xr, A.yr, 26), P = S.P || A.P || [A.xr[0] + (A.xr[1] - A.xr[0]) * 0.6, A.F(A.xr[0] + (A.xr[1] - A.xr[0]) * 0.6)]; return Math.hypot(px - V.X(P[0]), py - V.Y(P[1])) < 30 ? 'p' : 'x'; },
      (h, px, py) => { const A = IX_ANTI[S.k], V = ixView(cv, A.xr, A.yr, 26); if (h === 'p') S.P = [Math.round(V.ix(px) * 4) / 4, Math.round(V.iy(py) * 2) / 2]; else S.x = Math.max(A.xr[0], Math.min(A.xr[1], V.ix(px))); draw(); });
    draw();
  } };

// ---- Separable differential equations: growth, decay, and cooling
IX.separable = { subjects: ['apcalc'],
  title: 'Growth, decay, and Newton’s Law of Cooling', hint: 'Each model comes from a separable differential equation. Slide the doubling time, half-life, or room temperature, and slide t to read the value and the rate.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { m: ['grow', 'decay', 'cool'].includes(o.m) ? o.m : 'cool', y0: 200, dbl: 5, half: 10, T0: 90, Ta: 20, hc: 10, t: 15, field: false }, box = {};
    function draw() {
      ctx.clearRect(0, 0, 600, 500); let f, df, L, tmax, ymax, eq;
      if (S.m === 'grow') { const k = Math.log(2) / S.dbl; f = (t) => S.y0 * Math.exp(k * t); df = (t, y) => k * y; tmax = 4 * S.dbl; ymax = S.y0 * 18; eq = 'dy/dt = ky';
        L = [{ h: 'Exponential growth' }, 'dy/dt = ky → dy/y = k dt → ln y = kt + C → y = y₀eᵏᵗ', `doubles every ${S.dbl} hours: k = ln 2/${S.dbl} ≈ ${ixN(k, 4)}`, `y = ${S.y0}e^(${ixN(k, 4)}t)`, `t = ${ixN(S.t, 1)}: y ≈ ${ixN(f(S.t), 1)}`, `rate dy/dt ≈ ${ixN(k * f(S.t), 2)} per hour`]; }
      else if (S.m === 'decay') { const k = -Math.log(2) / S.half; f = (t) => 100 * Math.exp(k * t); df = (t, y) => k * y; tmax = 4 * S.half; ymax = 110; eq = 'dA/dt = kA';
        L = [{ h: 'Exponential decay' }, 'A = A₀eᵏᵗ with k < 0', `half-life ${S.half} years: k = −ln 2/${S.half} ≈ ${ixN(k, 4)}`, `t = ${ixN(S.t, 1)}: ${ixN(f(S.t), 2)}% remains`, `rate ≈ ${ixN(k * f(S.t), 3)}% per year`]; }
      else { const k = Math.log(2) / S.hc; f = (t) => S.Ta + (S.T0 - S.Ta) * Math.exp(-k * t); df = (t, T) => -k * (T - S.Ta); tmax = 60; ymax = Math.max(S.T0, S.Ta) + 10; eq = 'dT/dt = −k(T − Tₐ)';
        L = [{ h: 'Newton’s Law of Cooling' }, 'dT/dt = −k(T − Tₐ): the rate is proportional to the difference from the room', `T = ${S.Ta} + ${S.T0 - S.Ta}e^(−${ixN(k, 4)}t)`, `the difference halves every ${S.hc} min: k = ln 2/${S.hc}`, `t = ${ixN(S.t, 1)} min: T ≈ ${ixN(f(S.t), 1)}°`, `rate ≈ ${ixN(df(S.t, f(S.t)), 2)}° per minute`, { note: 'It cools fastest at first, when it’s hottest compared with the room, and levels off at the room temperature.' }]; }
      const V = ixView(cv, [0, tmax], [S.m === 'cool' ? Math.min(0, S.Ta - 10) : 0, ymax], 36), ys = Math.pow(10, Math.floor(Math.log10(ymax / 5))); ixGrid2(ctx, V, tmax / 12, ys, tmax / 6, ys * 2);
      if (S.field) for (let t = 0; t <= tmax; t += tmax / 16) for (let y = V.yr[0]; y <= ymax; y += (ymax - V.yr[0]) / 12) { const m = df(t, y) * (tmax / 600) / ((ymax - V.yr[0]) / 460), L2 = 9 / Math.sqrt(1 + m * m); ixLine(ctx, [V.X(t) - L2, V.Y(y) + m * L2], [V.X(t) + L2, V.Y(y) - m * L2], IXC.gray, 1.4); }
      if (S.m === 'cool') ixLine(ctx, [V.X(0), V.Y(S.Ta)], [V.X(tmax), V.Y(S.Ta)], IXC.green, 2, true);
      ixCurve(ctx, V, f, IXC.blue, { w: 3.2 }); const y = f(S.t); ixDot(ctx, V.X(S.t), V.Y(y), IXC.red, 7, true); ixCurve(ctx, V, (t) => y + df(S.t, y) * (t - S.t), IXC.red, { w: 1.8, dash: true, a: S.t - tmax / 10, b: S.t + tmax / 10 });
      ixLabel(ctx, eq, 590, 8, 16, 'right', IXC.ink); ixRead(read, L);
    }
    const sl = (k, lab, a, b, st, fmt) => ixSlider(lab, a, b, st, S[k], fmt || ((v) => ixN(v)), (v) => { S[k] = v; draw(); });
    box.grow = el('div', {}, sl('y0', 'start y₀', 50, 500, 10), sl('dbl', 'doubling time (hours)', 1, 10, 0.5)); box.decay = el('div', {}, sl('half', 'half-life (years)', 2, 30, 1)); box.cool = el('div', {}, sl('T0', 'starting temperature', 40, 100, 1, (v) => v + '°'), sl('Ta', 'room temperature', 0, 30, 1, (v) => v + '°'), sl('hc', 'difference halves every (min)', 3, 20, 1));
    const tS = ixSlider('t', 0, 60, 0.5, S.t, (v) => ixN(v, 1), (v) => { S.t = v; draw(); });
    const vis = () => { Object.entries(box).forEach(([k, b]) => (b.style.display = k === S.m ? '' : 'none')); const mx = { grow: 4 * S.dbl, decay: 4 * S.half, cool: 60 }[S.m]; tS.querySelector('input').max = mx; S.t = Math.min(S.t, mx); tS.set(S.t); };
    ctl.append(ixSeg([['grow', 'Growth (doubling)'], ['decay', 'Decay (half-life)'], ['cool', 'Cooling']], S.m, (k) => { S.m = k; vis(); draw(); }), box.grow, box.decay, box.cool, tS, ixCheck('Show the slope field', S.field, (v) => { S.field = v; draw(); }));
    vis(); draw();
  } };

// ---- Improper integrals
const IX_IMPR = {
  sq: { name: '∫ from 1 to ∞ of 1/x² dx', f: (x) => 1 / (x * x), a: 1, inf: 'b', val: (b) => 1 - 1 / b, lim: 1, xr: [0, 12], yr: [-0.1, 1.3], note: 'The area levels off at 1: it converges.' },
  rec: { name: '∫ from 1 to ∞ of 1/x dx', f: (x) => 1 / x, a: 1, inf: 'b', val: (b) => Math.log(b), lim: Infinity, xr: [0, 12], yr: [-0.1, 1.3], note: 'ln b keeps growing (slowly): it diverges, even though 1/x → 0.' },
  root: { name: '∫ from 0 to 1 of 1/√x dx', f: (x) => 1 / Math.sqrt(x), b: 1, inf: 'a', val: (a) => 2 - 2 * Math.sqrt(a), lim: 2, xr: [-0.1, 1.5], yr: [-0.3, 8], note: 'An infinite height, but the area levels off at 2: it converges.' },
  exp: { name: '∫ from 0 to ∞ of e^(−2x) dx', f: (x) => Math.exp(-2 * x), a: 0, inf: 'b', val: (b) => (1 - Math.exp(-2 * b)) / 2, lim: 0.5, xr: [-0.2, 5], yr: [-0.1, 1.2], note: 'The area approaches 1/2: it converges.' },
  atan: { name: '∫ from −∞ to ∞ of 1/(1 + x²) dx', f: (x) => 1 / (1 + x * x), inf: 'both', val: (b) => 2 * Math.atan(b), lim: Math.PI, xr: [-12, 12], yr: [-0.1, 1.3], note: 'Split at 0: each half approaches π/2, so the total is π.' } };
IX.improper = { subjects: ['apcalc'],
  title: 'Improper integrals', hint: 'Slide the limit toward ∞ (or toward the asymptote). If the shaded area levels off at a number, the integral converges; if it keeps growing, it diverges.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(600, 500), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_IMPR[o.k] ? o.k : 'sq', t: 0.5 };
    function draw() {
      const D = IX_IMPR[S.k], V = ixView(cv, D.xr, D.yr, 30); ctx.clearRect(0, 0, 600, 500); ixGrid2(ctx, V, D.xr[1] > 6 ? 1 : 0.25, D.yr[1] > 3 ? 1 : 0.25, D.xr[1] > 6 ? 2 : 0.5, D.yr[1] > 3 ? 2 : 0.5);
      let lo, hi, lab; if (D.inf === 'b') { lo = D.a; hi = D.a + Math.pow(1000, S.t) - 1 + 0.01; lab = `b = ${ixN(hi, 2)}`; } else if (D.inf === 'a') { lo = Math.pow(10, -6 * S.t) * 0.999; hi = D.b; lab = `a = ${ixN(lo, 6)}`; } else { hi = Math.pow(1000, S.t) - 1 + 0.01; lo = -hi; lab = `from −${ixN(hi, 2)} to ${ixN(hi, 2)}`; }
      const N = 400; for (let i = 0; i < N; i++) { const x0 = lo + (Math.min(hi, D.xr[1]) - lo) * i / N, x1 = lo + (Math.min(hi, D.xr[1]) - lo) * (i + 1) / N, y = Math.min(D.f((x0 + x1) / 2), D.yr[1]); ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.28)'; ctx.fillRect(V.X(x0), V.Y(y), V.X(x1) - V.X(x0) + 0.5, V.Y(0) - V.Y(y)); ctx.restore(); }
      ixCurve(ctx, V, D.f, IXC.ink, { w: 3, a: D.inf === 'a' ? 0.002 : D.xr[0], n: 1500 });
      const v = D.inf === 'a' ? D.val(lo) : D.val(hi);
      ixRead(read, [{ h: D.name }, lab, `area so far = ${ixN(v, 5)}`, isFinite(D.lim) ? `limit: ${ixN(D.lim, 5)}` : 'limit: ∞', isFinite(D.lim) ? { note: 'Converges. ' + D.note, good: true } : { note: 'Diverges. ' + D.note, bad: true }, { note: 'Write it as a limit: ∫ from a to ∞ = lim b→∞ ∫ from a to b.' }]);
    }
    ctl.append(ixSel(Object.entries(IX_IMPR).map(([k, D]) => [k, D.name]), S.k, (k) => { S.k = k; draw(); }, 'Integral'), ixSlider('push the limit', 0, 1, 0.01, S.t, (v) => Math.round(v * 100) + '%', (v) => { S.t = v; draw(); }));
    draw();
  } };

// ---- Comparison tests for series
const IX_CMP = {
  e1: { name: 'Σ 1/(k² + 1) vs Σ 1/k²', a: (k) => 1 / (k * k + 1), b: (k) => 1 / (k * k), k0: 1, an: '1/(k² + 1)', bn: '1/k²', conv: true, test: 'Direct comparison: 1/(k² + 1) < 1/k², and Σ 1/k² converges (p = 2), so the smaller series converges.' },
  e2: { name: 'Σ 1/(√k − 1) vs Σ 1/√k', a: (k) => 1 / (Math.sqrt(k) - 1), b: (k) => 1 / Math.sqrt(k), k0: 2, an: '1/(√k − 1)', bn: '1/√k', conv: false, test: 'Direct comparison: 1/(√k − 1) > 1/√k, and Σ 1/√k diverges (p = ½), so the bigger series diverges.' },
  e3: { name: 'Σ (k + 3)/(k² + 1) vs Σ 1/k', a: (k) => (k + 3) / (k * k + 1), b: (k) => 1 / k, k0: 1, an: '(k + 3)/(k² + 1)', bn: '1/k', conv: false, test: 'Limit comparison: aₖ/bₖ → 1 (a positive number), so both do the same thing. Σ 1/k diverges, so this one diverges.' },
  e4: { name: 'Σ √k/(k² + 1) vs Σ 1/k^(3/2)', a: (k) => Math.sqrt(k) / (k * k + 1), b: (k) => 1 / k ** 1.5, k0: 1, an: '√k/(k² + 1)', bn: '1/k^(3/2)', conv: true, test: 'Limit comparison: aₖ/bₖ → 1, and Σ 1/k^(3/2) converges (p = 3/2), so this one converges.' },
  e5: { name: 'Σ 1/(k² + 5) vs Σ 1/k²', a: (k) => 1 / (k * k + 5), b: (k) => 1 / (k * k), k0: 1, an: '1/(k² + 5)', bn: '1/k²', conv: true, test: 'Direct comparison with the p-series Σ 1/k² (p = 2): converges.' } };
IX.compareSeries = { subjects: ['apcalc'],
  title: 'Comparison tests for series', hint: 'Blue is the series you’re testing; green is a known series to compare with. If the bigger one converges, so does the smaller. If the smaller one diverges, so does the bigger. The ratio aₖ/bₖ is the limit comparison.',
  build({ main, ctl, read }, o) {
    const cv = ixCanvas(640, 540), ctx = cv._ctx; main.append(cv);
    const S = { k: IX_CMP[o.k] ? o.k : 'e1', N: 30 };
    function draw() {
      const C = IX_CMP[S.k], ks = Array.from({ length: S.N }, (_, i) => C.k0 + i), A = ks.map(C.a), B = ks.map(C.b), SA = A.reduce((s, v, i) => [...s, (s[i - 1] || 0) + v], []), SB = B.reduce((s, v, i) => [...s, (s[i - 1] || 0) + v], []);
      ctx.clearRect(0, 0, 640, 540); const top = Math.max(...A, ...B), T0 = ixView({ _w: 640, _h: 240 }, [C.k0 - 1, C.k0 + S.N], [0, top * 1.1], 30), T = T0, w = Math.max(1.5, (T.X(1) - T.X(0)) * 0.36);
      ixGrid2(ctx, T, S.N > 40 ? 10 : 5, top / 4, S.N > 40 ? 20 : 5, top / 2); ixLabel(ctx, 'terms', 630, 6, 14, 'right', IXC.gray);
      ks.forEach((k, i) => { ctx.save(); ctx.fillStyle = 'rgba(31,95,168,.6)'; ctx.fillRect(T.X(k) - w, T.Y(A[i]), w, T.Y(0) - T.Y(A[i])); ctx.fillStyle = 'rgba(46,125,79,.6)'; ctx.fillRect(T.X(k), T.Y(B[i]), w, T.Y(0) - T.Y(B[i])); ctx.restore(); });
      const sTop = Math.max(...SA, ...SB), P0 = ixView({ _w: 640, _h: 290 }, [C.k0 - 1, C.k0 + S.N], [0, sTop * 1.1], 30), P = { ...P0, Y: (y) => 250 + P0.Y(y) }; ixGrid2(ctx, P, S.N > 40 ? 10 : 5, sTop / 4, S.N > 40 ? 20 : 5, sTop / 2); ixLabel(ctx, 'partial sums', 630, 256, 14, 'right', IXC.gray);
      [[SA, IXC.blue], [SB, IXC.green]].forEach(([Sm, col]) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.6; ctx.beginPath(); Sm.forEach((s, i) => (i ? ctx.lineTo(P.X(ks[i]), P.Y(s)) : ctx.moveTo(P.X(ks[i]), P.Y(s)))); ctx.stroke(); ctx.restore(); });
      const n = ks[S.N - 1];
      ixRead(read, [{ h: C.name }, `blue: aₖ = ${C.an}; green: bₖ = ${C.bn}`, `k = ${n}: aₖ = ${ixN(A[S.N - 1], 5)}, bₖ = ${ixN(B[S.N - 1], 5)}`, `aₖ/bₖ = ${ixN(A[S.N - 1] / B[S.N - 1], 4)}`, `partial sums: ${ixN(SA[S.N - 1], 4)} (blue), ${ixN(SB[S.N - 1], 4)} (green)`,
        C.conv ? { note: C.test, good: true } : { note: C.test, bad: true }]);
    }
    ctl.append(ixSel(Object.entries(IX_CMP).map(([k, C]) => [k, C.name]), S.k, (k) => { S.k = k; draw(); }, 'Series'), ixSlider('number of terms', 5, 200, 1, S.N, String, (v) => { S.N = v; draw(); }));
    draw();
  } };
// ======== end of the new interactives ========
ixDone();
