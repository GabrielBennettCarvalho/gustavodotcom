/* ===== RC diagrams, drawn as SVG =====
   Space-time diagram (the drawing every RC exam asks for):
     d = { st: { c: ['A', 'R', 'B'], T: 6, u: 'ms',
                 m: [ { f: 0, t: 1, a: 0, b: 1, w: 0.5, l: 'P1' },   // from column f at time a to column t at time b;
                      { f: 1, t: 0, a: 2, b: 3, l: 'ACK 101' },      // w = transmission time (draws a band instead of an arrow)
                      { f: 0, t: 1, a: 3, b: 4, l: 'P3', x: true } ],// x = lost (stops halfway with ✕)
                 k: [ { c: 0, a: 0, b: 2, l: 'RTT' } ] } }           // bracket next to column c from time a to b
   Topology (STP, DV, LS): d = { topo: { n: { A: [x, y], ... }, e: [['A', 'B', '3', 0.5], ...], hl: ['A-B'], x: ['B-C'] } }
       (4th edge value = where the cost label sits along the edge, default 0.5)
       coordinates in a 0..400 × 0..200 box; hl = thick edges; x = failed links.
   IPv4 address split into network | host: d = { ip: [ { a: '193.136.143.89', p: 25, l: 'origem' }, ... ] }
   Small table: d = { tbl: { h: ['Destino', 'Interface'], r: [['A', '1'], ...] } } */
const RCD = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tw = s => String(s).length * 7.2 + 18;
  const ARROW = '<defs><marker id="rcarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';

  function st(d) {
    const S = d.st, n = S.c.length, W = 640, top = 34, H = S.H || 300, bot = H - 14;
    const rk = (S.k || []).some(k => k.c === n - 1), lk = (S.k || []).some(k => k.c === 0);
    const x0 = lk ? 130 : 50, x1 = rk ? W - 170 : W - 50, gap = n > 1 ? (x1 - x0) / (n - 1) : 0, X = i => x0 + i * gap;
    const T = S.T || Math.max(...S.m.map(m => m.b + (m.w || 0))) * 1.05, Y = t => top + (t / T) * (bot - top);
    let out = ARROW;
    S.c.forEach((c, i) => {
      out += `<text x="${X(i)}" y="18" text-anchor="middle" font-size="14" font-weight="700" class="tx">${esc(c)}</text>`;
      out += `<line x1="${X(i)}" y1="${top - 6}" x2="${X(i)}" y2="${bot}" class="s" stroke-width="1.8"/>`;
    });
    if (S.u) out += `<text x="4" y="${H - 2}" font-size="11" class="tx sub">tempo ↓ (unidade: ${esc(S.u)})</text>`;
    (S.m || []).forEach(m => {
      const x1 = X(m.f), x2 = X(m.t), dir = x2 > x1 ? 1 : -1;
      if (m.w) {
        const p = [[x1, Y(m.a)], [x1, Y(m.a + m.w)], [x2, Y(m.b + m.w)], [x2, Y(m.b)]];
        out += `<polygon points="${p.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" class="s band ${m.h ? 'hl' : ''}" stroke-width="1.2"/>`;
        if (m.l) out += `<text x="${((x1 + x2) / 2).toFixed(1)}" y="${((Y(m.a) + Y(m.b + m.w)) / 2 + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" class="tx lbl mono">${esc(m.l)}</text>`;
      } else {
        const ya = Y(m.a), yb = Y(m.b), xe = m.x ? (x1 + x2) / 2 : x2 - dir * 2, ye = m.x ? (ya + yb) / 2 : yb;
        out += `<line x1="${x1}" y1="${ya.toFixed(1)}" x2="${xe.toFixed(1)}" y2="${ye.toFixed(1)}" class="s ${m.dash ? 'dash' : ''}" stroke-width="1.6" ${m.x ? '' : 'marker-end="url(#rcarr)"'}/>`;
        if (m.x) out += `<text x="${xe.toFixed(1)}" y="${(ye + 5).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700" class="tx" style="fill:var(--bad)">✕</text>`;
        if (m.l) { const f = m.lp ?? (m.x ? 0.5 : 0.3), lx = x1 + (xe - x1) * f, ly = ya + (ye - ya) * f - 5; out += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="11.5" class="tx lbl mono">${esc(m.l)}</text>`; }
      }
    });
    (S.k || []).forEach(k => {
      const side = k.c === n - 1 ? 1 : -1, x = X(k.c) + side * 12, y1 = Y(k.a), y2 = Y(k.b);
      out += `<path d="M${x - side * 4} ${y1.toFixed(1)}H${x}V${y2.toFixed(1)}H${x - side * 4}" class="s" stroke-width="1.3"/>`;
      out += `<text x="${x + side * 6}" y="${((y1 + y2) / 2 + 4).toFixed(1)}" text-anchor="${side > 0 ? 'start' : 'end'}" font-size="11.5" class="tx mono">${esc(k.l)}</text>`;
    });
    return `<svg class="dg rc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama espaço-tempo entre ${esc(S.c.join(', '))}">${out}</svg>`;
  }

  function topo(d) {
    const T = d.topo, W = T.W || 400, H = T.H || 200, hl = new Set(T.hl || []), xx = new Set(T.x || []);
    const has = (set, a, b) => set.has(`${a}-${b}`) || set.has(`${b}-${a}`);
    let out = '';
    (T.e || []).forEach(([a, b, c, f = 0.5]) => {
      const [x1, y1] = T.n[a], [x2, y2] = T.n[b], bad = has(xx, a, b);
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="s ${bad ? 'dash' : ''}" stroke-width="${has(hl, a, b) ? 4 : 1.6}"/>`;
      const mx = x1 + (x2 - x1) * f, my = y1 + (y2 - y1) * f;
      if (bad) out += `<text x="${mx}" y="${my + 6}" text-anchor="middle" font-size="18" font-weight="700" style="fill:var(--bad)">✕</text>`;
      else if (c !== undefined && c !== '') out += `<text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="12.5" font-weight="700" class="tx lbl mono">${esc(c)}</text>`;
    });
    Object.entries(T.n).forEach(([k, [x, y]]) => {
      const r = String(k).length > 2 ? 20 : 16;
      out += `<circle cx="${x}" cy="${y}" r="${r}" class="s fo"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="700" class="tx mono">${esc(k)}</text>`;
    });
    return `<svg class="dg rc" viewBox="-24 -24 ${W + 48} ${H + 48}" style="max-width:${Math.round((W + 48) * 1.35)}px" role="img" aria-label="Topologia com os nós ${esc(Object.keys(T.n).join(', '))}">${out}</svg>`;
  }

  function ip(d) {
    const rows = Array.isArray(d.ip) ? d.ip : [d.ip], cw = 17, og = 10, W = 32 * cw + 3 * og + 120, rh = 74;
    let out = '';
    rows.forEach((r, ri) => {
      const oct = r.a.split('.').map(Number), bits = oct.map(o => o.toString(2).padStart(8, '0')).join(''), y0 = ri * rh + 18;
      out += `<text x="0" y="${y0 + 22}" font-size="12" class="tx sub">${esc(r.l || '')}</text>`;
      for (let i = 0; i < 32; i++) {
        const x = 110 + i * cw + Math.floor(i / 8) * og, net = r.p !== undefined && i < r.p;
        out += `<rect x="${x}" y="${y0 + 8}" width="${cw}" height="22" class="s ${net ? 'hl' : 'f'}" stroke-width="1"/>`;
        out += `<text x="${x + cw / 2}" y="${y0 + 23}" text-anchor="middle" font-size="12" class="tx mono">${bits[i]}</text>`;
        if (i % 8 === 0) out += `<text x="${x + 4 * cw}" y="${y0}" text-anchor="middle" font-size="12.5" font-weight="700" class="tx mono">${oct[i / 8]}</text>`;
      }
      if (r.p !== undefined) {
        const xp = 110 + r.p * cw + Math.floor((r.p - 0.001) / 8) * og + (r.p % 8 === 0 && r.p ? 0 : 0);
        out += `<line x1="${xp}" y1="${y0 + 3}" x2="${xp}" y2="${y0 + 36}" style="stroke:var(--bad)" stroke-width="2.4"/>`;
        out += `<text x="${(110 + xp) / 2}" y="${y0 + 48}" text-anchor="middle" font-size="11.5" class="tx sub">rede: ${r.p} bits</text>`;
        if (r.p < 32) out += `<text x="${(xp + 110 + 32 * cw + 3 * og) / 2}" y="${y0 + 48}" text-anchor="middle" font-size="11.5" class="tx sub">host: ${32 - r.p}</text>`;
      }
    });
    return `<svg class="dg rc" viewBox="0 0 ${W} ${rows.length * rh + 6}" role="img" aria-label="Endereços IPv4 em binário">${out}</svg>`;
  }

  function tbl(d) {
    const T = d.tbl, rows = [T.h, ...T.r], n = T.h.length;
    const cw = [...Array(n).keys()].map(c => Math.max(...rows.map(r => tw(r[c] ?? ''))));
    const W = cw.reduce((a, x) => a + x, 0), rh = 28, H = rows.length * rh;
    let out = '';
    rows.forEach((r, ri) => { let x = 0;
      r.forEach((cell, c) => { out += `<rect x="${x}" y="${ri * rh}" width="${cw[c]}" height="${rh}" class="s ${ri === 0 ? 'th' : 'f'}" stroke-width="1"/>`;
        out += `<text x="${x + cw[c] / 2}" y="${ri * rh + rh / 2}" text-anchor="middle" dominant-baseline="central" font-size="13" ${ri === 0 ? 'font-weight="700"' : ''} class="tx mono">${esc(cell)}</text>`; x += cw[c]; }); });
    return `<svg class="dg rc tbl" viewBox="-1 -1 ${W + 2} ${H + 2}" style="max-width:${W + 2}px" role="img" aria-label="Tabela">${out}</svg>`;
  }

  return { render: d => d.st ? st(d) : d.topo ? topo(d) : d.ip ? ip(d) : d.tbl ? tbl(d) : '' };
})();
