/* ===== IEco diagrams: supply and demand plots, drawn as SVG =====
   d = { sd: {
     r:  [qmax, pmax]                      axis ranges (both start at 0)
     ax: ['Q', 'P']                        axis names (default Q and P)
     ln: [{ n: 'D', p: [[q, p], [q, p]], c: 'd' | 's' | 'x', dash: true }]
                                           straight lines (polyline if more points); c picks the colour:
                                           d demand (blue), s supply (orange), m purple, g green, x other (ink)
     a:  [{ p: [[q, p], ...], c: 'cs' | 'ps' | 'gov' | 'dwl' | 'ext', l: 'EC' }]
                                           shaded areas: consumer surplus, producer surplus, tax revenue, deadweight loss,
                                           external cost (grey)
     g:  [[q, p], ...]                     guide points: dashed lines to both axes, values written on the axes
     pt: [{ q, p, l }]                     marked points with a label
   } } */
const ECD = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = v => typeof v === 'number' ? String(Math.round(v * 100) / 100).replace('.', ',') : String(v);

  function sd(d) {
    const P = d.sd, [qm, pm] = P.r, [aq, ap] = P.ax || ['Q', 'P'];
    const W = 320, H = 240, L = 42, R = 26, T = 18, B = 30;
    const sx = q => L + q / qm * (W - L - R), sy = p => H - B - p / pm * (H - T - B);
    const pts = a => a.map(([q, p]) => `${sx(q).toFixed(1)},${sy(p).toFixed(1)}`).join(' ');
    let out = '';
    (P.a || []).forEach(a => {
      out += `<polygon points="${pts(a.p)}" class="ar ${a.c}"/>`;
      if (a.l) { const cq = a.p.reduce((s, x) => s + x[0], 0) / a.p.length, cp = a.p.reduce((s, x) => s + x[1], 0) / a.p.length;
        out += `<text x="${sx(cq)}" y="${sy(cp)}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" class="tx lbl mono">${esc(a.l)}</text>`; }
    });
    // axes
    out += `<path d="M${sx(0)} ${sy(pm) - 8}V${sy(0)}H${sx(qm) + 10}" class="s" stroke-width="1.5"/>`;
    out += `<path d="M${sx(0) - 4} ${sy(pm) - 3}l4 -6 4 6M${sx(qm) + 5} ${sy(0) - 4}l6 4 -6 4" class="s" stroke-width="1.5"/>`;
    out += `<text x="${sx(qm) + 4}" y="${sy(0) + 20}" font-size="12" class="tx sub">${esc(aq)}</text><text x="${sx(0) - 8}" y="${sy(pm) - 8}" text-anchor="end" font-size="12" class="tx sub">${esc(ap)}</text>`;
    out += `<text x="${sx(0) - 5}" y="${sy(0) + 14}" text-anchor="end" font-size="11" class="tx sub">0</text>`;
    // guides
    const qs = new Set(), ps = new Set();
    (P.g || []).forEach(([q, p]) => {
      out += `<path d="M${sx(0)} ${sy(p)}H${sx(q)}V${sy(0)}" class="s dash guide" stroke-width="1"/>`;
      if (!ps.has(p)) { ps.add(p); out += `<text x="${sx(0) - 5}" y="${sy(p)}" text-anchor="end" dominant-baseline="central" font-size="11" class="tx mono">${esc(num(p))}</text>`; }
      if (!qs.has(q)) { qs.add(q); out += `<text x="${sx(q)}" y="${sy(0) + 14}" text-anchor="middle" font-size="11" class="tx mono">${esc(num(q))}</text>`; }
    });
    // lines
    (P.ln || []).forEach(l => {
      out += `<polyline points="${pts(l.p)}" class="s cv k-${l.c || 'x'}${l.dash ? ' dash' : ''}" stroke-width="2.4"/>`;
      // label a little before the line's end, so it never sits on the Q axis
      if (l.n) { const [q0, p0] = l.p[l.p.length - 2], [q1, p1] = l.p[l.p.length - 1], q = q0 + (q1 - q0) * .9, p = p0 + (p1 - p0) * .9;
        out += `<text x="${sx(q) + 6}" y="${sy(p) - 6}" font-size="12" font-weight="700" class="tx lbl lab k-${l.c || 'x'}">${esc(l.n)}</text>`; }
    });
    (P.pt || []).forEach(p => {
      out += `<circle cx="${sx(p.q)}" cy="${sy(p.p)}" r="4" class="fi"/>`;
      if (p.l) out += `<text x="${sx(p.q) + 7}" y="${sy(p.p) - 7}" font-size="12" font-weight="700" class="tx lbl mono">${esc(p.l)}</text>`;
    });
    return `<svg class="dg ec sd" viewBox="0 0 ${W} ${H}" style="max-width:${W * 1.35}px" role="img" aria-label="Gráfico de oferta e procura">${out}</svg>`;
  }

  return { render: d => d.sd ? sd(d) : '' };
})();
