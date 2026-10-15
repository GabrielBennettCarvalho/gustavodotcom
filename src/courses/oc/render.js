/* ===== OC diagrams: address fields and small tables, drawn as SVG =====
   d = { addr: [{ n: 'tag', b: 19, t: '19 bits', hl: true }, ...], bits: true }
       fields left to right (most significant first); b = width in bits (sets the drawn width);
       t = text under the name (default "<b> bits"); hl = highlight; bits: true shows bit numbers.
   d = { tbl: { h: ['Classe', 'CPI'], r: [['A', '1'], ...] } }  a small table. */
const OCD = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tw = s => String(s).length * 7.2 + 18;   // rough text width in px (13px mono)
  function addr(d) {
    const F = d.addr, W = 640, H = d.bits ? 86 : 66, top = d.bits ? 22 : 4, h = 56;
    const tot = F.reduce((a, f) => a + (f.b || 4), 0);
    let raw = F.map(f => Math.max(64, (f.b || 4) / tot * W)); const k = W / raw.reduce((a, x) => a + x, 0); raw = raw.map(x => x * k);
    let x = 0, hi = F.reduce((a, f) => a + (typeof f.b === 'number' ? f.b : NaN), 0) - 1, out = '';
    F.forEach((f, i) => {
      const w = raw[i];
      out += `<rect x="${x.toFixed(1)}" y="${top}" width="${w.toFixed(1)}" height="${h}" class="s ${f.hl ? 'hl' : 'f'}" stroke-width="1.6"/>`;
      out += `<text x="${(x + w / 2).toFixed(1)}" y="${top + 22}" text-anchor="middle" font-size="14" font-weight="700" class="tx mono">${esc(f.n)}</text>`;
      out += `<text x="${(x + w / 2).toFixed(1)}" y="${top + 41}" text-anchor="middle" font-size="12" class="tx sub">${esc(f.t ?? `${f.b} bits`)}</text>`;
      if (d.bits && !isNaN(hi)) { const lo = hi - f.b + 1;
        out += `<text x="${(x + 4).toFixed(1)}" y="14" font-size="11" class="tx sub">${hi}</text>`;
        if (f.b > 1) out += `<text x="${(x + w - 4).toFixed(1)}" y="14" text-anchor="end" font-size="11" class="tx sub">${lo}</text>`;
        hi = lo - 1; }
      x += w;
    });
    return `<svg class="dg oc" viewBox="-2 0 ${W + 4} ${H}" role="img" aria-label="Campos do endereço: ${esc(F.map(f => f.n).join(', '))}">${out}</svg>`;
  }
  function tbl(d) {
    const T = d.tbl, rows = [T.h, ...T.r], n = T.h.length;
    const cw = [...Array(n).keys()].map(c => Math.max(...rows.map(r => tw(r[c] ?? ''))));
    const W = cw.reduce((a, x) => a + x, 0), rh = 28, H = rows.length * rh;
    let out = '';
    rows.forEach((r, ri) => { let x = 0;
      r.forEach((cell, c) => { out += `<rect x="${x}" y="${ri * rh}" width="${cw[c]}" height="${rh}" class="s ${ri === 0 ? 'th' : 'f'}" stroke-width="1"/>`;
        out += `<text x="${x + cw[c] / 2}" y="${ri * rh + rh / 2}" text-anchor="middle" dominant-baseline="central" font-size="13" ${ri === 0 ? 'font-weight="700"' : ''} class="tx mono">${esc(cell)}</text>`; x += cw[c]; }); });
    return `<svg class="dg oc tbl" viewBox="-1 -1 ${W + 2} ${H + 2}" style="max-width:${W + 2}px" role="img" aria-label="Tabela">${out}</svg>`;
  }
  return { render: d => d.addr ? addr(d) : d.tbl ? tbl(d) : '' };
})();
