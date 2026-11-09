/* ===== SO diagrams: address fields, small tables and the three file tables, drawn as SVG =====
   d = { addr: [{ n: 'página', b: 20, t: '0x00002', hl: true }, ...], bits: true }   fields, most significant first
   d = { tbl: { h: ['Página', 'Base', 'Prot.', 'Presente'], r: [['0x0', '0x10', 'r-x', 'S'], ...] }, cap: 'Tabela de páginas' }
   d = { tbls: [{ cap, h, r }, ...] }  several small tables side by side (page table + TLB) */
const SOD = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tw = s => String(s).length * 7.4 + 18;
  function addr(d) {
    const F = d.addr, W = 640, H = d.bits ? 86 : 66, top = d.bits ? 22 : 4, h = 56;
    const tot = F.reduce((a, f) => a + (f.b || 4), 0);
    let raw = F.map(f => Math.max(70, (f.b || 4) / tot * W)); const k = W / raw.reduce((a, x) => a + x, 0); raw = raw.map(x => x * k);
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
    return `<svg class="dg so" viewBox="-2 0 ${W + 4} ${H}" role="img" aria-label="Campos do endereço: ${esc(F.map(f => f.n).join(', '))}">${out}</svg>`;
  }
  // one table as an SVG group; returns { svg, w, h }
  function table(T, ox) {
    const rows = [T.h, ...T.r], n = T.h.length, cap = T.cap ? 22 : 0;
    const cw = [...Array(n).keys()].map(c => Math.max(...rows.map(r => tw(r[c] ?? ''))));
    const W = cw.reduce((a, x) => a + x, 0), rh = 28;
    let out = T.cap ? `<text x="${ox}" y="14" font-size="12.5" font-weight="700" class="tx">${esc(T.cap)}</text>` : '';
    rows.forEach((r, ri) => { let x = ox;
      r.forEach((cell, c) => { const hl = T.hl && T.hl.includes(ri - 1);
        out += `<rect x="${x}" y="${cap + ri * rh}" width="${cw[c]}" height="${rh}" class="s ${ri === 0 ? 'th' : hl ? 'hl' : 'f'}" stroke-width="1"/>`;
        out += `<text x="${x + cw[c] / 2}" y="${cap + ri * rh + rh / 2}" text-anchor="middle" dominant-baseline="central" font-size="13" ${ri === 0 ? 'font-weight="700"' : ''} class="tx mono">${esc(cell)}</text>`; x += cw[c]; }); });
    return { svg: out, w: W, h: cap + rows.length * rh };
  }
  function tbls(list) {
    let x = 0, H = 0, out = '';
    list.forEach((T, i) => { const t = table(T, x); out += t.svg; x += t.w + (i < list.length - 1 ? 26 : 0); H = Math.max(H, t.h); });
    return `<svg class="dg so tbl" viewBox="-1 -1 ${x + 2} ${H + 2}" style="max-width:${x + 2}px" role="img" aria-label="${esc(list.map(t => t.cap || 'Tabela').join(' e '))}">${out}</svg>`;
  }
  return { render: d => d.addr ? addr(d) : d.tbl ? tbls([Object.assign({ cap: d.cap }, d.tbl)]) : d.tbls ? tbls(d.tbls) : '' };
})();
