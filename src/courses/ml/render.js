/* ===== ML diagrams, drawn as SVG =====
   d = { tbl: { h: ['x₁', 'x₂', 'y'], r: [['0', '1', 'A'], ...] } }        a small data table (first row = header)
   d = { mat: [{ n: 'W[1]', v: [[1, 2], [3, 4]] }, { n: 'b[1]', v: [[0], [0]] }] }
       matrices/vectors side by side, each with its name; v is a list of rows (a column vector is [[a], [b]])
   d = { pts: { p: [{ x, y, l, c }], c: [{ x, y, l }], line: [w0, w1, w2], r: [xmin, xmax, ymin, ymax] } }
       scatter plot: p points (c = 1 or 2 picks the class style, l = label), c centroids (drawn as ×),
       line = decision boundary w0 + w1·x + w2·y = 0, r = axis ranges (default from the points)
   d = { tree: { a: 'Cheated', k: [['Yes', { leaf: 'Failed' }], ['No', { a: 'Studied', k: [...] }]] } }
       decision tree: a = attribute tested, k = [branch value, subtree] pairs, leaf = class */
const MLD = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tw = s => String(s).length * 7.4 + 18;   // rough text width in px (13px mono)
  const num = v => typeof v === 'number' ? String(Math.round(v * 1000) / 1000).replace('-', '−') : String(v);

  function tbl(d) {
    const T = d.tbl, rows = [T.h, ...T.r], n = T.h.length;
    const cw = [...Array(n).keys()].map(c => Math.max(...rows.map(r => tw(r[c] ?? ''))));
    const W = cw.reduce((a, x) => a + x, 0), rh = 28, H = rows.length * rh;
    let out = '';
    rows.forEach((r, ri) => { let x = 0;
      r.forEach((cell, c) => { out += `<rect x="${x}" y="${ri * rh}" width="${cw[c]}" height="${rh}" class="s ${ri === 0 ? 'th' : 'f'}" stroke-width="1"/>`;
        out += `<text x="${x + cw[c] / 2}" y="${ri * rh + rh / 2}" text-anchor="middle" dominant-baseline="central" font-size="13" ${ri === 0 ? 'font-weight="700"' : ''} class="tx mono">${esc(cell)}</text>`; x += cw[c]; }); });
    return `<svg class="dg ml tbl" viewBox="-1 -1 ${W + 2} ${H + 2}" style="max-width:${W + 2}px" role="img" aria-label="Tabela de dados">${out}</svg>`;
  }

  function mat(d) {
    const rh = 24; let x = 0, out = '', H = 0;
    const blocks = d.mat.map(m => { const rows = m.v.map(r => r.map(num)); const nc = Math.max(...rows.map(r => r.length));
      const cw = [...Array(nc).keys()].map(c => Math.max(28, ...rows.map(r => tw(r[c] ?? '') - 6)));
      return { m, rows, cw, w: cw.reduce((a, b) => a + b, 0) + 16, h: rows.length * rh + 8, lw: m.n ? tw(m.n + ' =') : 0 }; });
    H = Math.max(...blocks.map(b => b.h)) + 4;
    blocks.forEach((b, i) => {
      const top = (H - b.h) / 2;
      if (b.m.n) { out += `<text x="${x}" y="${H / 2}" dominant-baseline="central" font-size="14" font-weight="700" class="tx mono">${esc(b.m.n)} =</text>`; x += b.lw; }
      out += `<path d="M${x + 6} ${top} h-5 v${b.h} h5 M${x + b.w - 6} ${top} h5 v${b.h} h-5" class="s" stroke-width="1.6"/>`;
      b.rows.forEach((r, ri) => { let cx = x + 8; r.forEach((v, ci) => { out += `<text x="${cx + b.cw[ci] / 2}" y="${top + 4 + ri * rh + rh / 2}" text-anchor="middle" dominant-baseline="central" font-size="13" class="tx mono">${esc(v)}</text>`; cx += b.cw[ci]; }); });
      x += b.w + (i < blocks.length - 1 ? 26 : 0);
    });
    return `<svg class="dg ml mat" viewBox="-2 -2 ${x + 4} ${H + 4}" style="max-width:${x + 4}px" role="img" aria-label="Matrizes: ${esc(d.mat.map(m => m.n).filter(Boolean).join(', '))}">${out}</svg>`;
  }

  function pts(d) {
    const P = d.pts, all = [...(P.p || []), ...(P.c || [])];
    let [x0, x1, y0, y1] = P.r || [Math.min(...all.map(p => p.x)) - 1, Math.max(...all.map(p => p.x)) + 1, Math.min(...all.map(p => p.y)) - 1, Math.max(...all.map(p => p.y)) + 1];
    const W = 300, H = 240, pad = 26, sx = v => pad + (v - x0) / (x1 - x0) * (W - 2 * pad), sy = v => H - pad - (v - y0) / (y1 - y0) * (H - 2 * pad);
    let out = '';
    for (let g = Math.ceil(x0); g <= x1; g++) out += `<line x1="${sx(g)}" y1="${sy(y0)}" x2="${sx(g)}" y2="${sy(y1)}" class="s grid"/>`;
    for (let g = Math.ceil(y0); g <= y1; g++) out += `<line x1="${sx(x0)}" y1="${sy(g)}" x2="${sx(x1)}" y2="${sy(g)}" class="s grid"/>`;
    if (x0 <= 0 && x1 >= 0) out += `<line x1="${sx(0)}" y1="${sy(y0)}" x2="${sx(0)}" y2="${sy(y1)}" class="s" stroke-width="1.3"/>`;
    if (y0 <= 0 && y1 >= 0) out += `<line x1="${sx(x0)}" y1="${sy(0)}" x2="${sx(x1)}" y2="${sy(0)}" class="s" stroke-width="1.3"/>`;
    out += `<text x="${W - pad + 4}" y="${sy(Math.max(y0, Math.min(0, y1))) - 6}" font-size="12" class="tx sub">${esc(P.ax ? P.ax[0] : 'x₁')}</text><text x="${sx(Math.max(x0, Math.min(0, x1))) + 6}" y="${pad - 8}" font-size="12" class="tx sub">${esc(P.ax ? P.ax[1] : 'x₂')}</text>`;
    if (P.line) { const [a, b, c] = P.line; let seg;
      if (Math.abs(c) > 1e-9) seg = [[x0, -(a + b * x0) / c], [x1, -(a + b * x1) / c]]; else seg = [[-a / b, y0], [-a / b, y1]];
      out += `<line x1="${sx(seg[0][0])}" y1="${sy(seg[0][1])}" x2="${sx(seg[1][0])}" y2="${sy(seg[1][1])}" class="s dash" stroke-width="1.8" clip-path="url(#mlclip)"/>`; }
    (P.p || []).forEach(p => {
      out += p.c === 2 ? `<rect x="${sx(p.x) - 5}" y="${sy(p.y) - 5}" width="10" height="10" class="fo"/>` : `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5.5" class="${p.c === 1 ? 'fi' : 'fo'}"/>`;
      if (p.l) out += `<text x="${sx(p.x) + 8}" y="${sy(p.y) - 7}" font-size="12" class="tx lbl mono">${esc(p.l)}</text>`; });
    (P.c || []).forEach(p => { out += `<path d="M${sx(p.x) - 6} ${sy(p.y) - 6}l12 12M${sx(p.x) + 6} ${sy(p.y) - 6}l-12 12" class="s cen" stroke-width="2.6"/>`;
      if (p.l) out += `<text x="${sx(p.x) + 9}" y="${sy(p.y) + 15}" font-size="12" font-weight="700" class="tx lbl mono">${esc(p.l)}</text>`; });
    return `<svg class="dg ml pts" viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.3}px" role="img" aria-label="Gráfico de pontos"><defs><clipPath id="mlclip"><rect x="${pad}" y="${pad}" width="${W - 2 * pad}" height="${H - 2 * pad}"/></clipPath></defs>${out}</svg>`;
  }

  function tree(d) {
    // lay out leaves left to right; each internal node sits above the middle of its children
    const LH = 74; let leafX = 0, out = '', maxD = 0;
    const place = (n, depth) => { maxD = Math.max(maxD, depth); n._d = depth;
      if (!n.k) { n._w = Math.max(70, tw(n.leaf)); n._x = leafX + n._w / 2; leafX += n._w + 14; return; }
      n.k.forEach(([, c]) => place(c, depth + 1)); n._x = (n.k[0][1]._x + n.k[n.k.length - 1][1]._x) / 2; n._w = Math.max(80, tw(n.a)); };
    place(d.tree, 0);
    const W = Math.max(leafX - 14, d.tree._w), H = maxD * LH + 34;
    const draw = n => { const y = n._d * LH + 2;
      if (n.k) n.k.forEach(([v, c]) => { const cy = c._d * LH + 2;
        out += `<line x1="${n._x}" y1="${y + 30}" x2="${c._x}" y2="${cy}" class="s" stroke-width="1.4"/>`;
        out += `<text x="${(n._x + c._x) / 2 + (c._x < n._x ? -6 : c._x > n._x ? 6 : 8)}" y="${(y + 30 + cy) / 2}" text-anchor="${c._x < n._x ? 'end' : 'start'}" dominant-baseline="central" font-size="12" class="tx lbl sub">${esc(v)}</text>`; draw(c); });
      if (n.k) out += `<rect x="${n._x - n._w / 2}" y="${y}" width="${n._w}" height="30" rx="5" class="s f" stroke-width="1.6"/><text x="${n._x}" y="${y + 15}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" class="tx mono">${esc(n.a)}</text>`;
      else out += `<rect x="${n._x - n._w / 2}" y="${y}" width="${n._w}" height="30" rx="15" class="s leaf" stroke-width="1.4"/><text x="${n._x}" y="${y + 15}" text-anchor="middle" dominant-baseline="central" font-size="13" class="tx mono">${esc(n.leaf)}</text>`; };
    draw(d.tree);
    return `<svg class="dg ml tree" viewBox="-4 -2 ${W + 8} ${H + 2}" style="max-width:${W + 8}px" role="img" aria-label="Árvore de decisão">${out}</svg>`;
  }

  return { render: d => d.tbl ? tbl(d) : d.mat ? mat(d) : d.pts ? pts(d) : d.tree ? tree(JSON.parse(JSON.stringify(d))) : '' };
})();
