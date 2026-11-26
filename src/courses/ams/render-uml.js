/* ===== UML renderer: use case, class, state machine and sequence diagrams -> SVG =====
   d.kind: 'uc' | 'cls' | 'stm' | 'seq'. Coordinates are explicit (uc, cls, stm) or automatic (seq), so a diagram looks the
   same whole or in parts. For the diagram workshop (app-build.js):
   - d.only: the ids drawn so far (absent = everything); d.hi: the ids just added, drawn in the accent colour;
   - every piece is a <g data-el="id">, so tapping it shows the sentence it comes from;
   - sub-pieces: 'Class:a' (its attributes or literals), 'edge:m' (multiplicities and roles of an association).
   Use case:  { sys: { x, y, w, h, lb }, nodes: [{ id, k: 'actor' | 'uc' | 'note', x, y, lb, w, h }],
                edges: [{ id, a, b, k: 'assoc' | 'include' | 'extend' | 'gen', lb }] }   (x, y: centre)
   Class:     { nodes: [{ id, x, y, w, lb, st: 'enumeration' | 'dataType' | 'abstract', attrs: [], lits: [] }],   (x, y: top left)
                edges: [{ id, a, b, k: 'assoc' | 'gen' | 'aggr' | 'comp' | 'dep' | 'aclass', ma, mb, ra, rb, lb, via, as, bs, of }] }
                aggr/comp: the diamond is at a (the whole); gen: the triangle at b (the parent); aclass: dashed from edge "of" to b
   State:     { title, nodes: [{ id, k: 'state' | 'init' | 'final' | 'choice' | 'junction' | 'term' | 'hist' | 'comp', x, y, w, h, lb, acts }],
                edges: [{ id, a, b, lb, via, self: 't' | 'r' | 'b' | 'l', lx, ly, as, bs }] }   (x, y: centre)
   Sequence:  { lines: [{ id, lb, actor }], msgs: [{ id, a, b, lb, k: 'sync' | 'reply' | 'async' | 'self' }],
                frags: [{ id, op: 'alt' | 'opt' | 'loop', from, to, g, else: [{ at, g }] }] }   (layout automatic) */
const UML = (() => {
  let uid = 0;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tw = (s, z = 11) => String(s || '').length * z * 0.55;
  function wrap(text, max) {
    const words = String(text || '').split(/\s+/).filter(Boolean), lines = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) lines.push(cur); return lines;
  }
  const T = (x, y, t, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.a || 'middle'}" dominant-baseline="${o.b || 'central'}" font-size="${o.z || 11}" font-weight="${o.w || 500}"${o.it ? ' font-style="italic"' : ''}${o.u ? ' text-decoration="underline"' : ''} class="tx${o.lbl ? ' lbl' : ''}">${esc(t)}</text>`;
  const block = (x, y, t, max, z = 11, w = 600) => { const L = wrap(t, max), lh = z * 1.2, y0 = y - (L.length - 1) * lh / 2; return L.map((l, i) => T(x, y0 + i * lh, l, { z, w })).join(''); };
  // visibility: d.only lists what is drawn so far; an edge also needs both its ends
  const viz = d => { const o = d.only ? new Set(d.only) : null, h = new Set(d.hi || []);
    return { on: id => !o || o.has(id), hiAny: (...ids) => ids.some(i => h.has(i)) }; };
  const G = (id, hi, body) => `<g data-el="${esc(id)}"${hi ? ' class="hl"' : ''}>${body}</g>`;
  const defs = id => `<defs>
    <marker id="${id}o" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M1 1 L11 6 L1 11" class="s" stroke-width="1.3"/></marker>
    <marker id="${id}f" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M1 1.5 L11 6 L1 10.5 Z" class="fi"/></marker>
    <marker id="${id}t" viewBox="0 0 16 16" refX="15" refY="8" markerWidth="14" markerHeight="14" orient="auto-start-reverse"><path d="M1 1.5 L15 8 L1 14.5 Z" class="fo" stroke-width="1.2"/></marker>
    <marker id="${id}d" viewBox="0 0 20 12" refX="1" refY="6" markerWidth="17" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 6 L10 1 L19 6 L10 11 Z" class="fo" stroke-width="1.2"/></marker>
    <marker id="${id}D" viewBox="0 0 20 12" refX="1" refY="6" markerWidth="17" markerHeight="11" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 6 L10 1 L19 6 L10 11 Z" class="fi"/></marker></defs>`;
  const svgOpen = (d, alt) => { const id = 'u' + (++uid); return [id, `<svg viewBox="0 0 ${d.w} ${d.h}" width="${d.w}" height="${d.h}" class="dg" style="max-width:${d.w}px" role="img" aria-label="${esc(d.alt || alt)}" xmlns="http://www.w3.org/2000/svg">${defs(id)}`]; };
  const pathD = pts => 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  // where a line from the centre of a shape towards (px, py) leaves it
  const clipRect = (cx, cy, hw, hh, px, py) => { const dx = px - cx, dy = py - cy; if (!dx && !dy) return [cx, cy]; const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity); return [cx + dx * s, cy + dy * s]; };
  const clipEll = (cx, cy, rx, ry, px, py) => { const dx = px - cx, dy = py - cy; if (!dx && !dy) return [cx, cy]; const t = 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2); return [cx + dx * t, cy + dy * t]; };
  const side = (r, s, o = 0) => s === 't' ? [r.cx + o * r.hw * 2, r.cy - r.hh] : s === 'b' ? [r.cx + o * r.hw * 2, r.cy + r.hh] : s === 'l' ? [r.cx - r.hw, r.cy + o * r.hh * 2] : [r.cx + r.hw, r.cy + o * r.hh * 2];
  const mid = pts => { let best = 0, k = 0; for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); if (L > best) { best = L; k = i; } }
    return [(pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2, pts[k], pts[k + 1]]; };
  // text near an end of a line: along it by "along", to one side by "off"
  const nearEnd = (p, q, along, off) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L, ox = -uy * off, oy = ux * off;
    return [p[0] + ux * along + ox, p[1] + uy * along + oy, Math.abs(ox) >= Math.abs(oy) * 0.8 ? (ox > 0 ? 'start' : 'end') : 'middle']; };

  /* ---------- use case ---------- */
  function uc(d) {
    const V = viz(d), [id, open] = svgOpen(d, 'Diagrama de casos de utilização'); let out = open;
    const N = {}; (d.nodes || []).forEach(n => { N[n.id] = n; });
    const geo = n => n.k === 'actor' ? { cx: n.x, cy: n.y, hw: 16, hh: 26, a: 1 } : n.k === 'note' ? { cx: n.x, cy: n.y, hw: (n.w || 120) / 2, hh: (n.h || 40) / 2 } : { cx: n.x, cy: n.y, rx: (n.w || Math.max(100, Math.min(170, tw(n.lb, 10.5) * 0.62 + 44))) / 2, ry: (n.h || (String(n.lb).length > ((n.w || 150) / 7.5) ? 42 : 30)) / 2 };
    const clip = (n, px, py) => { const g = geo(n); return g.rx ? clipEll(g.cx, g.cy, g.rx, g.ry, px, py) : clipRect(g.cx, g.cy, g.hw, g.hh, px, py); };
    if (d.sys) { const s = d.sys; out += `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" class="s f" stroke-width="1.4"/>` + T(s.x + s.w / 2, s.y + 13, s.lb, { z: 12, w: 700 }); }
    for (const e of d.edges || []) {
      const a = N[e.a], b = N[e.b]; if (!a || !b || !V.on(e.id) || !V.on(a.id) || !V.on(b.id)) continue;
      const p = clip(a, b.x, b.y), q = clip(b, a.x, a.y), k = e.k || 'assoc';
      const mk = k === 'gen' ? `marker-end="url(#${id}t)"` : k === 'assoc' ? '' : `marker-end="url(#${id}o)"`;
      let body = `<path d="${pathD([p, q])}" class="s${k === 'include' || k === 'extend' ? ' dash' : ''}" stroke-width="1.3" ${mk}/>`;
      if (k === 'include' || k === 'extend') { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; body += T(m[0], m[1] - 8, `«${k}»${e.lb ? ' ' + e.lb : ''}`, { z: 10, w: 600, lbl: true }); }
      out += G(e.id, V.hiAny(e.id), body);
    }
    for (const n of d.nodes || []) {
      if (!V.on(n.id)) continue; let body = '';
      if (n.k === 'actor') { const x = n.x, y = n.y - 8;
        body = `<circle cx="${x}" cy="${y - 13}" r="6" class="s f" stroke-width="1.4"/><path d="M${x} ${y - 7} V${y + 8} M${x - 11} ${y - 1} H${x + 11} M${x} ${y + 8} L${x - 9} ${y + 21} M${x} ${y + 8} L${x + 9} ${y + 21}" class="s" stroke-width="1.4"/>` + block(x, y + 33, n.lb, 16, 10.5, 700); }
      else if (n.k === 'note') { const g = geo(n), x = g.cx - g.hw, y = g.cy - g.hh;
        body = `<path d="M${x} ${y} H${x + 2 * g.hw - 10} L${x + 2 * g.hw} ${y + 10} V${y + 2 * g.hh} H${x} Z" class="s f" stroke-width="1"/>` + block(g.cx, g.cy, n.lb, Math.floor(g.hw / 3), 10, 500); }
      else { const g = geo(n); body = `<ellipse cx="${g.cx}" cy="${g.cy}" rx="${g.rx}" ry="${g.ry}" class="s f" stroke-width="1.4"/>` + block(g.cx, g.cy, n.lb, Math.max(10, Math.floor(g.rx / 3.1)), 10, 600); }
      out += G(n.id, V.hiAny(n.id), body);
    }
    return out + '</svg>';
  }

  /* ---------- class ---------- */
  function cls(d) {
    const V = viz(d), [id, open] = svgOpen(d, 'Diagrama de classes'); let out = open;
    const N = {}, R = {};
    for (const n of d.nodes || []) { N[n.id] = n;
      const st = n.st === 'enumeration' || n.st === 'dataType' || n.st === 'interface' ? n.st : null, items = n.st === 'enumeration' ? (n.lits || []) : (n.attrs || []);
      const showA = V.on(n.id + ':a') || !d.only, shown = showA ? items : [];
      const w = n.w || Math.max(90, tw(n.lb, 12) + 26, ...items.map(a => tw(a, 10.5) + 18)), hh = st ? 32 : 22, ah = shown.length ? shown.length * 14 + 8 : (items.length || !n.min ? 10 : 0);
      R[n.id] = { x: n.x, y: n.y, w, h: hh + ah + (n.ops && n.ops.length ? n.ops.length * 14 + 8 : 0), hh, shown, st, cx: n.x + w / 2, cy: n.y + (hh + ah) / 2, hw: w / 2, hhalf: (hh + ah) / 2 };
      R[n.id].hh_ = R[n.id].h / 2; R[n.id].cy = n.y + R[n.id].h / 2; R[n.id].hh = hh; }
    const box = k => { const r = R[k]; return { cx: r.cx, cy: r.cy, hw: r.w / 2, hh: r.h / 2 }; };
    const ends = e => { const A = box(e.a), B = box(e.b), via = e.via || [];
      const p = e.as ? side(A, e.as, e.ao) : clipRect(A.cx, A.cy, A.hw, A.hh, ...(via[0] || (e.bs ? side(B, e.bs, e.bo) : [B.cx, B.cy])));
      const q = e.bs ? side(B, e.bs, e.bo) : clipRect(B.cx, B.cy, B.hw, B.hh, ...(via[via.length - 1] || p));
      return [p, ...via, q]; };
    const paths = {};
    for (const e of d.edges || []) if (e.k !== 'aclass' && N[e.a] && N[e.b]) paths[e.id] = ends(e);
    for (const e of d.edges || []) {
      if (!V.on(e.id)) continue; const k = e.k || 'assoc';
      if (k === 'aclass') { const P = paths[e.of], B = R[e.b]; if (!P || !B || !V.on(e.b) || !V.on(e.of)) continue; const m = mid(P), q = clipRect(B.cx, B.cy, B.w / 2, B.h / 2, m[0], m[1]);
        out += G(e.id, V.hiAny(e.id), `<path d="${pathD([[m[0], m[1]], q])}" class="s dash" stroke-width="1.2"/>`); continue; }
      if (!N[e.a] || !N[e.b] || !V.on(e.a) || !V.on(e.b)) continue;
      const pts = paths[e.id];
      const mk = k === 'gen' ? `marker-end="url(#${id}t)"` : k === 'dep' ? `marker-end="url(#${id}o)"` : k === 'aggr' ? `marker-start="url(#${id}d)"` : k === 'comp' ? `marker-start="url(#${id}D)"` : e.nav ? `marker-end="url(#${id}o)"` : '';
      let body = `<path d="${pathD(pts)}" class="s${k === 'dep' ? ' dash' : ''}" stroke-width="1.3" ${mk}/>`;
      if (e.lb) { const m = mid(pts); body += T(m[0] + (e.lx || 0), m[1] - 8 + (e.ly || 0), e.lb, { z: 10, w: 600, lbl: true, it: true }); }
      const showM = !d.only || V.on(e.id + ':m'), a0 = pts[0], a1 = pts[1], b0 = pts[pts.length - 1], b1 = pts[pts.length - 2];
      if (showM) { const sa = e.msa === 'r' ? -1 : 1, sb = e.msb === 'r' ? -1 : 1, dia = k === 'aggr' || k === 'comp' ? 18 : 0;
        const put = (pt, t, z, w) => T(pt[0], pt[1], t, { z, w, lbl: true, a: pt[2] });
        if (e.ma) body += put(nearEnd(a0, a1, 12 + dia, 8 * sa), e.ma, 10.5, 700);
        if (e.mb) body += put(nearEnd(b0, b1, 12 + (k === 'gen' ? 14 : 0), -8 * sb), e.mb, 10.5, 700);
        if (e.ra) body += put(nearEnd(a0, a1, 14 + dia, -8 * sa), e.ra, 9.5, 500);
        if (e.rb) body += put(nearEnd(b0, b1, 14, 8 * sb), e.rb, 9.5, 500); }
      out += G(e.id, V.hiAny(e.id, e.id + ':m'), body);
    }
    for (const n of d.nodes || []) {
      if (!V.on(n.id)) continue; const r = R[n.id];
      let body = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" class="s ${n.st === 'enumeration' || n.st === 'dataType' ? 'u-enum' : 'u-cls'}" stroke-width="1.4"/>`;
      if (r.st) body += T(r.x + r.w / 2, r.y + 10, `«${r.st}»`, { z: 9.5, w: 500 });
      body += T(r.x + r.w / 2, r.y + (r.st ? 23 : 11.5), n.lb, { z: 12, w: 700, it: n.st === 'abstract', u: n.obj });
      body += `<line x1="${r.x}" y1="${r.y + r.hh}" x2="${r.x + r.w}" y2="${r.y + r.hh}" class="s" stroke-width="1"/>`;
      const ag = r.shown.map((a, i) => T(r.x + 7, r.y + r.hh + 11 + i * 14, n.st === 'enumeration' || n.obj ? a : (a.startsWith('-') || a.startsWith('+') ? a : '- ' + a), { a: 'start', z: 10.5, w: 500 })).join('');
      body += ag ? `<g${V.hiAny(n.id + ':a') ? ' class="hl"' : ''}>${ag}</g>` : '';
      if (n.ops && n.ops.length) { const y0 = r.y + r.h - n.ops.length * 14 - 8; body += `<line x1="${r.x}" y1="${y0}" x2="${r.x + r.w}" y2="${y0}" class="s" stroke-width="1"/>` + n.ops.map((o, i) => T(r.x + 7, y0 + 11 + i * 14, '+ ' + o, { a: 'start', z: 10.5 })).join(''); }
      out += G(n.id, V.hiAny(n.id), body);
    }
    return out + '</svg>';
  }

  /* ---------- state machine ---------- */
  function stm(d) {
    const V = viz(d), [id, open] = svgOpen(d, 'Diagrama de máquina de estados'); let out = open;
    if (d.title) { const w = tw('stm ' + d.title, 11) + 22; out += `<path d="M1 1 H${w} V14 L${w - 8} 22 H1 Z" class="s f" stroke-width="1"/><rect x="1" y="1" width="${d.w - 2}" height="${d.h - 2}" class="s" stroke-width="1"/>` + T(8, 11.5, 'stm ' + d.title, { a: 'start', z: 11, w: 700 }); }
    const N = {}; (d.nodes || []).forEach(n => { N[n.id] = n; });
    const geo = n => n.k === 'state' || n.k === 'comp' ? { cx: n.x, cy: n.y, hw: (n.w || Math.max(84, tw(n.lb, 11.5) + 26)) / 2, hh: (n.h || (n.acts && n.acts.length ? 30 + n.acts.length * 13 : 36)) / 2, r: 1 }
      : n.k === 'choice' ? { cx: n.x, cy: n.y, hw: 11, hh: 11, dia: 1 } : { cx: n.x, cy: n.y, rr: n.k === 'final' || n.k === 'term' ? 10 : n.k === 'hist' ? 11 : n.k === 'junction' ? 6 : 8 };
    const clip = (n, px, py) => { const g = geo(n); if (g.rr) { const dx = px - g.cx, dy = py - g.cy, L = Math.hypot(dx, dy) || 1; return [g.cx + dx / L * g.rr, g.cy + dy / L * g.rr]; }
      if (g.dia) { const dx = px - g.cx, dy = py - g.cy, s = 11 / (Math.abs(dx) + Math.abs(dy) || 1); return [g.cx + dx * s, g.cy + dy * s]; }
      return clipRect(g.cx, g.cy, g.hw, g.hh, px, py); };
    // composite states first: the others sit on top of them
    for (const n of (d.nodes || []).filter(n => n.k === 'comp')) { if (!V.on(n.id)) continue; const g = geo(n);
      out += G(n.id, V.hiAny(n.id), `<rect x="${g.cx - g.hw}" y="${g.cy - g.hh}" width="${2 * g.hw}" height="${2 * g.hh}" rx="14" class="s u-st" stroke-width="1.4"/>` + T(g.cx - g.hw + 12, g.cy - g.hh + 13, n.lb, { a: 'start', z: 11.5, w: 700 }) + `<line x1="${g.cx - g.hw}" y1="${g.cy - g.hh + 24}" x2="${g.cx + g.hw}" y2="${g.cy - g.hh + 24}" class="s" stroke-width="1"/>`); }
    for (const e of d.edges || []) {
      const a = N[e.a], b = N[e.b]; if (!a || !b || !V.on(e.id) || !V.on(a.id) || !V.on(b.id)) continue;
      let pts;
      if (e.self) { const g = geo(a), s = e.self, o = 18;
        pts = s === 't' ? [[g.cx - 18, g.cy - g.hh], [g.cx - 18, g.cy - g.hh - o - 8], [g.cx + 18, g.cy - g.hh - o - 8], [g.cx + 18, g.cy - g.hh]]
          : s === 'b' ? [[g.cx - 18, g.cy + g.hh], [g.cx - 18, g.cy + g.hh + o + 8], [g.cx + 18, g.cy + g.hh + o + 8], [g.cx + 18, g.cy + g.hh]]
          : s === 'l' ? [[g.cx - g.hw, g.cy - 10], [g.cx - g.hw - o - 14, g.cy - 10], [g.cx - g.hw - o - 14, g.cy + 10], [g.cx - g.hw, g.cy + 10]]
          : [[g.cx + g.hw, g.cy - 10], [g.cx + g.hw + o + 14, g.cy - 10], [g.cx + g.hw + o + 14, g.cy + 10], [g.cx + g.hw, g.cy + 10]]; }
      else { const via = e.via || [], A = geo(a), B = geo(b);
        const p = e.as && A.hw ? side(A, e.as, e.ao) : clip(a, ...(via[0] || (e.bs && B.hw ? side(B, e.bs, e.bo) : [b.x, b.y])));
        const q = e.bs && B.hw ? side(B, e.bs, e.bo) : clip(b, ...(via[via.length - 1] || p)); pts = [p, ...via, q]; }
      let body = `<path d="${pathD(pts)}" class="s" stroke-width="1.3" marker-end="url(#${id}o)"/>`;
      if (e.lb) { const m = mid(pts), lx = e.lx !== undefined ? e.lx : m[0], ly = e.ly !== undefined ? e.ly : m[1] - 9;
        const L = String(e.lb).split('\n'); body += L.map((l, i) => T(lx, ly - (L.length - 1 - i) * 12, l, { z: 10, w: 600, lbl: true })).join(''); }
      out += G(e.id, V.hiAny(e.id), body);
    }
    for (const n of d.nodes || []) {
      if (n.k === 'comp' || !V.on(n.id)) continue; const g = geo(n); let body = '';
      if (n.k === 'state') { body = `<rect x="${g.cx - g.hw}" y="${g.cy - g.hh}" width="${2 * g.hw}" height="${2 * g.hh}" rx="11" class="s u-st" stroke-width="1.4"/>`;
        if (n.acts && n.acts.length) { const y0 = g.cy - g.hh + 15; body += T(g.cx, y0, n.lb, { z: 11.5, w: 700 }) + `<line x1="${g.cx - g.hw}" y1="${y0 + 10}" x2="${g.cx + g.hw}" y2="${y0 + 10}" class="s" stroke-width="1"/>` + n.acts.map((a, i) => T(g.cx - g.hw + 8, y0 + 22 + i * 13, a, { a: 'start', z: 10 })).join(''); }
        else body += block(g.cx, g.cy, n.lb, Math.max(10, Math.floor(g.hw / 3.3)), 11.5, 700); }
      else if (n.k === 'init') body = `<circle cx="${g.cx}" cy="${g.cy}" r="8" class="fi"/>`;
      else if (n.k === 'final') body = `<circle cx="${g.cx}" cy="${g.cy}" r="10" class="s f" stroke-width="1.4"/><circle cx="${g.cx}" cy="${g.cy}" r="5.5" class="fi"/>`;
      else if (n.k === 'term') body = `<path d="M${g.cx - 7} ${g.cy - 7} L${g.cx + 7} ${g.cy + 7} M${g.cx + 7} ${g.cy - 7} L${g.cx - 7} ${g.cy + 7}" class="s" stroke-width="1.8"/>`;
      else if (n.k === 'junction') body = `<circle cx="${g.cx}" cy="${g.cy}" r="6" class="fi"/>`;
      else if (n.k === 'choice') body = `<path d="M${g.cx} ${g.cy - 11} L${g.cx + 11} ${g.cy} L${g.cx} ${g.cy + 11} L${g.cx - 11} ${g.cy} Z" class="s f" stroke-width="1.4"/>`;
      else if (n.k === 'hist') body = `<circle cx="${g.cx}" cy="${g.cy}" r="11" class="s f" stroke-width="1.3"/>` + T(g.cx, g.cy + 0.5, 'H', { z: 11, w: 700 });
      if (n.k !== 'state' && n.lb) body += T(g.cx + (n.lx || 0), g.cy + (n.ly !== undefined ? n.ly : 20), n.lb, { z: 10, w: 600, lbl: true });
      out += G(n.id, V.hiAny(n.id), body);
    }
    return out + '</svg>';
  }

  /* ---------- sequence ---------- */
  function seq(d) {
    const V = viz(d), L = d.lines || [], n = L.length, w = d.w || 640, gap = n > 1 ? (w - 140) / (n - 1) : 0;
    const X = {}; L.forEach((l, i) => { X[l.id] = l.x !== undefined ? l.x : 70 + i * gap; });
    // vertical layout: each message one row, a fragment adds its header before and a margin after
    const F = d.frags || [], startAt = {}, endAt = {}, elseAt = {};
    F.forEach(f => { (startAt[f.from] = startAt[f.from] || []).push(f); (endAt[f.to] = endAt[f.to] || []).push(f); (f.else || []).forEach(x => { elseAt[x.at] = (elseAt[x.at] || []).concat([{ f, g: x.g }]); }); });
    const top = d.title ? 26 : 0; let y = 78 + top; const Y = {}, FY = {};
    for (const m of d.msgs || []) {
      (startAt[m.id] || []).forEach(f => { y += 6; FY[f.id] = { y1: y - 10, els: [] }; y += 24; });
      (elseAt[m.id] || []).forEach(x => { FY[x.f.id].els.push({ y: y - 6, g: x.g }); y += 18; });
      Y[m.id] = y; y += m.k === 'self' ? 46 : 32;
      (endAt[m.id] || []).forEach(f => { FY[f.id].y2 = y - 14; y += 8; });
    }
    const H = d.h || y + 18, D = Object.assign({}, d, { w, h: H }), [id, open] = svgOpen(D, 'Diagrama de sequência'); let out = open;
    if (d.title) { const tw_ = tw('sd ' + d.title, 11) + 22; out += `<path d="M1 1 H${tw_} V14 L${tw_ - 8} 22 H1 Z" class="s f" stroke-width="1"/><rect x="1" y="1" width="${w - 2}" height="${H - 2}" class="s" stroke-width="1"/>` + T(8, 11.5, 'sd ' + d.title, { a: 'start', z: 11, w: 700 }); }
    // fragments behind the messages
    for (const f of F) { if (!V.on(f.id) || !FY[f.id]) continue; const ids = (d.msgs || []).map(m => m.id), i0 = ids.indexOf(f.from), i1 = ids.indexOf(f.to);
      const xs = (d.msgs || []).slice(i0, i1 + 1).flatMap(m => [X[m.a], X[m.b] + (m.k === 'self' ? 40 : 0)]).filter(v => v !== undefined);
      const x1 = (f.l ? X[f.l] : Math.min(...xs)) - 40, x2 = (f.r ? X[f.r] : Math.max(...xs)) + 40, { y1, y2 } = FY[f.id], hdr = tw(f.op, 10) + 20;
      let body = `<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" class="s" stroke-width="1.1"/><path d="M${x1} ${y1} H${x1 + hdr} V${y1 + 10} L${x1 + hdr - 7} ${y1 + 17} H${x1} Z" class="s f" stroke-width="1"/>` + T(x1 + 6, y1 + 9, f.op, { a: 'start', z: 10, w: 800 });
      if (f.g) body += T(x1 + hdr + 6, y1 + 9, f.g, { a: 'start', z: 10, w: 600 });
      FY[f.id].els.forEach(x => { body += `<line x1="${x1}" y1="${x.y}" x2="${x2}" y2="${x.y}" class="s dash" stroke-width="1"/>` + T(x1 + 8, x.y + 9, x.g, { a: 'start', z: 10, w: 600 }); });
      out += G(f.id, V.hiAny(f.id), body); }
    for (const l of L) { if (!V.on(l.id)) continue; const x = X[l.id];
      let body = `<line x1="${x}" y1="${(l.actor ? 54 : 42) + top}" x2="${x}" y2="${H - 8}" class="s dash" stroke-width="1"/>`;
      if (l.actor) { const yy = 12 + top; body += `<circle cx="${x}" cy="${yy}" r="5" class="s f" stroke-width="1.3"/><path d="M${x} ${yy + 5} V${yy + 17} M${x - 9} ${yy + 10} H${x + 9} M${x} ${yy + 17} L${x - 7} ${yy + 27} M${x} ${yy + 17} L${x + 7} ${yy + 27}" class="s" stroke-width="1.3"/>` + T(x, yy + 38, l.lb, { z: 10.5, w: 700 }); }
      else { const bw = Math.max(80, tw(l.lb, 11) + 18); body += `<rect x="${x - bw / 2}" y="${16 + top}" width="${bw}" height="26" class="s u-cls" stroke-width="1.3"/>` + T(x, 29 + top, l.lb, { z: 11, w: 700 }); }
      out += G(l.id, V.hiAny(l.id), body); }
    for (const m of d.msgs || []) {
      if (!V.on(m.id) || !V.on(m.a) || !V.on(m.b)) continue; const k = m.k || 'sync', ya = Y[m.id], xa = X[m.a], xb = X[m.b]; let body;
      if (k === 'self' || m.a === m.b) { body = `<path d="M${xa} ${ya} H${xa + 34} V${ya + 18} H${xa + 3}" class="s" stroke-width="1.3" marker-end="url(#${id}f)"/>` + T(xa + 40, ya + 2, m.lb, { a: 'start', z: 10.5, w: 600, lbl: true }); }
      else { const dir = xb > xa ? 1 : -1;
        body = `<path d="M${xa} ${ya} H${xb - dir * 2}" class="s${k === 'reply' ? ' dash' : ''}" stroke-width="1.3" marker-end="url(#${id}${k === 'sync' ? 'f' : 'o'})"/>` + T((xa + xb) / 2, ya - 8, m.lb, { z: 10.5, w: 600, lbl: true }); }
      out += G(m.id, V.hiAny(m.id), body);
    }
    return out + '</svg>';
  }

  const kinds = ['uc', 'cls', 'stm', 'seq'];
  const render = d => d.kind === 'uc' ? uc(d) : d.kind === 'cls' ? cls(d) : d.kind === 'stm' ? stm(d) : d.kind === 'seq' ? seq(d) : '';
  return { kinds, render };
})();
