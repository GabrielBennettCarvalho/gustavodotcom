/* ===== Diagram renderer: tiny BPMN + ArchiMate DSL -> SVG ===== */
const DG = (() => {
  let uid = 0;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function wrap(text, max) {
    const words = String(text || '').split(/\s+/).filter(Boolean); const lines = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) lines.push(cur); return lines;
  }
  function textBlock(x, y, text, max, size = 11, anchor = 'middle', weight = 500) {
    const lines = wrap(text, max); const lh = size * 1.18; const y0 = y - (lines.length - 1) * lh / 2;
    return lines.map((l, i) => `<text x="${x}" y="${(y0 + i * lh).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="central" font-size="${size}" font-weight="${weight}" class="tx">${esc(l)}</text>`).join('');
  }

  /* ---------- BPMN ---------- */
  const SZ = { task: [100, 54], start: [32, 32], end: [32, 32], int: [32, 32], gw: [42, 42], data: [28, 36], store: [40, 36], note: [110, 40] };
  const isGw = k => ['xor', 'and', 'or', 'evg', 'pevg', 'cpx', 'gw'].includes(k);
  const isEv = k => ['start', 'end', 'int'].includes(k);
  function size(n) { const d = isGw(n.k) ? SZ.gw : (SZ[n.k] || SZ.task); return [n.w || d[0], n.h || d[1]]; }
  function anchor(n, side) { const [w, h] = size(n); const hw = w / 2, hh = h / 2;
    return side === 'r' ? [n.x + hw, n.y] : side === 'l' ? [n.x - hw, n.y] : side === 't' ? [n.x, n.y - hh] : [n.x, n.y + hh]; }

  function evIcon(tr, th, cx, cy) {
    const f = th ? 'class="fi"' : 'class="fo"'; // filled vs outlined
    switch (tr) {
      case 'msg': {
        if (th) return `<rect x="${cx - 8}" y="${cy - 5.5}" width="16" height="11" class="fi"/><path d="M${cx - 8} ${cy - 5.5} L${cx} ${cy + 1} L${cx + 8} ${cy - 5.5}" class="inv"/>`;
        return `<rect x="${cx - 8}" y="${cy - 5.5}" width="16" height="11" class="fo"/><path d="M${cx - 8} ${cy - 5.5} L${cx} ${cy + 1} L${cx + 8} ${cy - 5.5}" class="s"/>`;
      }
      case 'timer': {
        let t = `<circle cx="${cx}" cy="${cy}" r="9" class="fo"/>`;
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; t += `<line x1="${(cx + Math.cos(a) * 7).toFixed(1)}" y1="${(cy + Math.sin(a) * 7).toFixed(1)}" x2="${(cx + Math.cos(a) * 9).toFixed(1)}" y2="${(cy + Math.sin(a) * 9).toFixed(1)}" class="s thin"/>`; }
        return t + `<path d="M${cx} ${cy} L${cx} ${cy - 6} M${cx} ${cy} L${cx + 4} ${cy + 2}" class="s"/>`;
      }
      case 'signal': return `<path d="M${cx} ${cy - 8} L${cx + 8} ${cy + 6} L${cx - 8} ${cy + 6} Z" ${f}/>`;
      case 'error': return `<path d="M${cx - 7} ${cy + 7} L${cx - 3} ${cy - 7} L${cx + 2} ${cy + 1} L${cx + 7} ${cy - 7} L${cx + 3} ${cy + 7} L${cx - 2} ${cy - 1} Z" ${f}/>`;
      case 'terminate': return `<circle cx="${cx}" cy="${cy}" r="9" class="fi"/>`;
      case 'comp': return `<path d="M${cx} ${cy - 6} L${cx - 8} ${cy} L${cx} ${cy + 6} Z M${cx + 8} ${cy - 6} L${cx} ${cy} L${cx + 8} ${cy + 6} Z" ${f}/>`;
      case 'link': return `<path d="M${cx - 7} ${cy - 3} L${cx + 1} ${cy - 3} L${cx + 1} ${cy - 7} L${cx + 8} ${cy} L${cx + 1} ${cy + 7} L${cx + 1} ${cy + 3} L${cx - 7} ${cy + 3} Z" ${f}/>`;
      case 'cond': return `<rect x="${cx - 6}" y="${cy - 8}" width="12" height="16" class="fo"/><path d="M${cx - 4} ${cy - 4} H${cx + 4} M${cx - 4} ${cy} H${cx + 4} M${cx - 4} ${cy + 4} H${cx + 4}" class="s thin"/>`;
      case 'esc': return `<path d="M${cx} ${cy - 8} L${cx + 6} ${cy + 7} L${cx} ${cy + 2} L${cx - 6} ${cy + 7} Z" ${f}/>`;
      case 'multi': return `<path d="M${cx} ${cy - 8} L${cx + 7.6} ${cy - 2.5} L${cx + 4.7} ${cy + 6.5} L${cx - 4.7} ${cy + 6.5} L${cx - 7.6} ${cy - 2.5} Z" ${f}/>`;
      default: return '';
    }
  }
  function drawEvent(n) {
    const r = 15, dash = n.ni ? ' dash' : '';
    let s = '';
    if (n.k === 'start') s += `<circle cx="${n.x}" cy="${n.y}" r="${r}" class="s f${dash}" stroke-width="1.6"/>`;
    if (n.k === 'end') s += `<circle cx="${n.x}" cy="${n.y}" r="${r}" class="s f" stroke-width="3.6"/>`;
    if (n.k === 'int') s += `<circle cx="${n.x}" cy="${n.y}" r="${r}" class="s f${dash}" stroke-width="1.4"/><circle cx="${n.x}" cy="${n.y}" r="${r - 3}" class="s${dash}" stroke-width="1.4"/>`;
    s += evIcon(n.tr, n.k === 'end' ? true : n.th, n.x, n.y);
    if (n.lb) s += n.lp === 'l' ? textBlock(n.x - r - 5, n.y, n.lb, 14, 10, 'end', 500) : textBlock(n.x, n.y + r + 12, n.lb, 16, 10, 'middle', 500);
    return s;
  }
  function drawGw(n) {
    const d = 21, x = n.x, y = n.y; let s = `<path d="M${x} ${y - d} L${x + d} ${y} L${x} ${y + d} L${x - d} ${y} Z" class="s f" stroke-width="1.6"/>`;
    if (n.k === 'xor') s += `<path d="M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x + 6} ${y - 6} L${x - 6} ${y + 6}" class="s" stroke-width="3.4"/>`;
    if (n.k === 'and') s += `<path d="M${x} ${y - 9} V${y + 9} M${x - 9} ${y} H${x + 9}" class="s" stroke-width="3.4"/>`;
    if (n.k === 'or') s += `<circle cx="${x}" cy="${y}" r="8" class="s" stroke-width="2.6"/>`;
    if (n.k === 'cpx') s += `<path d="M${x} ${y - 9} V${y + 9} M${x - 9} ${y} H${x + 9} M${x - 6.4} ${y - 6.4} L${x + 6.4} ${y + 6.4} M${x + 6.4} ${y - 6.4} L${x - 6.4} ${y + 6.4}" class="s" stroke-width="2.6"/>`;
    if (n.k === 'evg') s += `<circle cx="${x}" cy="${y}" r="10" class="s" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="8" class="s" stroke-width="1.2"/>` + `<path d="M${x} ${y - 5} L${x + 4.8} ${y - 1.5} L${x + 3} ${y + 4} L${x - 3} ${y + 4} L${x - 4.8} ${y - 1.5} Z" class="s" stroke-width="1.2"/>`;
    if (n.k === 'pevg') s += `<circle cx="${x}" cy="${y}" r="10" class="s" stroke-width="1.2"/><path d="M${x} ${y - 6} V${y + 6} M${x - 6} ${y} H${x + 6}" class="s" stroke-width="1.6"/>`;
    if (n.lb) s += textBlock(x, y - d - 10, n.lb, 18, 10, 'middle', 500);
    return s;
  }
  function taskTypeIcon(tt, x, y) {
    switch (tt) {
      case 'user': return `<circle cx="${x + 6}" cy="${y + 4}" r="3" class="s thin f"/><path d="M${x} ${y + 13} Q${x + 6} ${y + 5} ${x + 12} ${y + 13}" class="s thin"/>`;
      case 'service': { let t = `<circle cx="${x + 6}" cy="${y + 7}" r="3.5" class="s thin"/>`; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; t += `<line x1="${(x + 6 + Math.cos(a) * 4.5).toFixed(1)}" y1="${(y + 7 + Math.sin(a) * 4.5).toFixed(1)}" x2="${(x + 6 + Math.cos(a) * 6.5).toFixed(1)}" y2="${(y + 7 + Math.sin(a) * 6.5).toFixed(1)}" class="s" stroke-width="1.6"/>`; } return t; }
      case 'send': return `<rect x="${x}" y="${y + 2}" width="14" height="10" class="fi"/><path d="M${x} ${y + 2} L${x + 7} ${y + 8} L${x + 14} ${y + 2}" class="inv"/>`;
      case 'receive': return `<rect x="${x}" y="${y + 2}" width="14" height="10" class="fo"/><path d="M${x} ${y + 2} L${x + 7} ${y + 8} L${x + 14} ${y + 2}" class="s thin"/>`;
      case 'manual': return `<path d="M${x} ${y + 6} h9 a2 2 0 0 1 0 4 h-2 M${x} ${y + 6} v7 h8" class="s thin"/>`;
      case 'script': return `<path d="M${x + 2} ${y + 1} h10 q-3 6 0 12 h-10 q3 -6 0 -12 Z M${x + 4} ${y + 5} h5 M${x + 4} ${y + 9} h5" class="s thin f"/>`;
      case 'rule': return `<rect x="${x}" y="${y + 1}" width="14" height="11" class="fo"/><path d="M${x} ${y + 4.5} h14 M${x + 4} ${y + 1} v11" class="s thin"/>`;
      default: return '';
    }
  }
  function drawTask(n) {
    const [w, h] = size(n), x = n.x - w / 2, y = n.y - h / 2;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" class="s f" stroke-width="${n.call ? 3.4 : 1.6}"${n.ghost ? ' stroke-dasharray="5 4"' : ''}/>`;
    if (n.tt) s += taskTypeIcon(n.tt, x + 6, y + 5);
    const marks = [];
    if (n.sub) marks.push(cx => `<rect x="${cx - 6}" y="${y + h - 15}" width="12" height="12" class="s thin"/><path d="M${cx} ${y + h - 12.5} v7 M${cx - 3.5} ${y + h - 9} h7" class="s thin"/>`);
    if (n.loop) marks.push(cx => `<path d="M${cx + 4} ${y + h - 6} a5 5 0 1 0 -6 1.6" class="s thin"/><path d="M${cx - 5} ${y + h - 7} l3 3 l1 -4" class="s thin"/>`);
    if (n.mi) marks.push(cx => `<path d="M${cx - 4} ${y + h - 14} v10 M${cx} ${y + h - 14} v10 M${cx + 4} ${y + h - 14} v10" class="s" stroke-width="1.6"/>`);
    if (n.miseq) marks.push(cx => `<path d="M${cx - 5} ${y + h - 13} h10 M${cx - 5} ${y + h - 9} h10 M${cx - 5} ${y + h - 5} h10" class="s" stroke-width="1.6"/>`);
    if (n.adhoc) marks.push(cx => `<path d="M${cx - 6} ${y + h - 8} q3 -5 6 0 t6 0" class="s" stroke-width="1.6"/>`);
    if (n.comp) marks.push(cx => `<path d="M${cx} ${y + h - 13} L${cx - 6} ${y + h - 9} L${cx} ${y + h - 5} Z M${cx + 6} ${y + h - 13} L${cx} ${y + h - 9} L${cx + 6} ${y + h - 5} Z" class="fo"/>`);
    const tot = marks.length; marks.forEach((m, i) => { s += m(n.x + (i - (tot - 1) / 2) * 15); });
    s += textBlock(n.x, n.y - (tot ? 5 : 0) - (n._hb ? 7 : 0), n.lb, Math.max(10, Math.floor(w / 7.2)), 11, 'middle', 600);
    return s;
  }
  function drawData(n) {
    const x = n.x - 14, y = n.y - 18;
    let s = `<path d="M${x} ${y} H${x + 19} L${x + 28} ${y + 9} V${y + 36} H${x} Z M${x + 19} ${y} V${y + 9} H${x + 28}" class="s f" stroke-width="1.3"/>`;
    if (n.coll) s += `<path d="M${n.x - 5} ${y + 24} v8 M${n.x} ${y + 24} v8 M${n.x + 5} ${y + 24} v8" class="s" stroke-width="1.4"/>`;
    if (n.lb) s += textBlock(n.x, y + 48, n.lb, 16, 10, 'middle', 500); return s;
  }
  function drawStore(n) {
    const x = n.x - 20, y = n.y - 18;
    let s = `<path d="M${x} ${y + 5} V${y + 31} A20 5 0 0 0 ${x + 40} ${y + 31} V${y + 5}" class="s f" stroke-width="1.3"/><ellipse cx="${n.x}" cy="${y + 5}" rx="20" ry="5" class="s f" stroke-width="1.3"/>`;
    if (n.lb) s += textBlock(n.x, y + 48, n.lb, 16, 10, 'middle', 500); return s;
  }
  function drawNote(n) {
    const [w, h] = size(n), x = n.x - w / 2, y = n.y - h / 2;
    return `<path d="M${x + 10} ${y} H${x} V${y + h} H${x + 10}" class="s" stroke-width="1.3"/>` + textBlock(n.x + 4, n.y, n.lb, Math.floor(w / 6.4), 10, 'middle', 500);
  }

  function route(e, s, t) {
    if (e.pts) return e.pts;
    const via = e.via || [];
    const dx = t.x - s.x, dy = t.y - s.y;
    if (via.length) {
      const first = via[0], last = via[via.length - 1];
      const sideTo = (n, p) => Math.abs(p[0] - n.x) > Math.abs(p[1] - n.y) ? (p[0] > n.x ? 'r' : 'l') : (p[1] > n.y ? 'b' : 't');
      return [anchor(s, e.so || sideTo(s, first)), ...via, anchor(t, e.ti || sideTo(t, last))];
    }
    if (e.k === 'msg' || e.k === 'assoc' || e.k === 'dassoc') {
      if (e.k !== 'msg') { // straight between nearest sides
        const so = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'b' : 't');
        const ti = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'l' : 'r') : (dy > 0 ? 't' : 'b');
        return [anchor(s, e.so || so), anchor(t, e.ti || ti)];
      }
      const a = anchor(s, dy > 0 ? 'b' : 't'), b = anchor(t, dy > 0 ? 't' : 'b');
      if (Math.abs(dx) < 4) return [a, [a[0], b[1]]];
      const my = (a[1] + b[1]) / 2; return [a, [a[0], my], [b[0], my], b];
    }
    if (Math.abs(dy) < 4) return dx >= 0 ? [anchor(s, 'r'), anchor(t, 'l')] : [anchor(s, 'l'), anchor(t, 'r')];
    if (Math.abs(dx) < 4) return dy > 0 ? [anchor(s, 'b'), anchor(t, 't')] : [anchor(s, 't'), anchor(t, 'b')];
    if (isGw(s.k) && !(isGw(t.k) && e.join)) { const a = anchor(s, dy > 0 ? 'b' : 't'); const b = anchor(t, dx > 0 ? 'l' : 'r'); return [a, [a[0], b[1]], b]; }
    if (isGw(t.k) || isEv(s.k)) { const a = anchor(s, dx > 0 ? 'r' : 'l'); const b = anchor(t, dy > 0 ? 't' : 'b'); return [a, [b[0], a[1]], b]; }
    const a = anchor(s, dx > 0 ? 'r' : 'l'), b = anchor(t, dx > 0 ? 'l' : 'r'); const mx = (a[0] + b[0]) / 2;
    return [a, [mx, a[1]], [mx, b[1]], b];
  }
  const pathD = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  function bpmn(spec) {
    const id = 'd' + (++uid);
    const nodes = {}; (spec.nodes || []).forEach(n => { nodes[n.id] = n; });
    // boundary events: placed on bottom edge of host
    (spec.nodes || []).forEach(n => { if (n.att && nodes[n.att]) { const h = nodes[n.att]; h._hb = true; const [w, hh] = size(h); n.x = h.x + (n.off ?? w / 4); n.y = h.y + hh / 2; } });
    let out = `<svg viewBox="0 0 ${spec.w} ${spec.h}" width="${spec.w}" height="${spec.h}" class="dg" style="max-width:${spec.w}px" role="img" aria-label="${esc(spec.alt || 'Diagrama BPMN')}" xmlns="http://www.w3.org/2000/svg">`;
    out += `<defs><marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="fi"/></marker>`;
    out += `<marker id="${id}m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="fo" stroke-width="1"/></marker>`;
    out += `<marker id="${id}c" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7"><circle cx="5" cy="5" r="3.6" class="fo" stroke-width="1.2"/></marker>`;
    out += `<marker id="${id}o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10" class="s" stroke-width="1.2"/></marker></defs>`;
    // pools & lanes
    for (const p of spec.pools || []) {
      out += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" class="s f2" stroke-width="1.5"/>`;
      if (!p.collapsed) {
        out += `<line x1="${p.x + 26}" y1="${p.y}" x2="${p.x + 26}" y2="${p.y + p.h}" class="s" stroke-width="1.3"/>`;
        out += `<text transform="translate(${p.x + 14} ${p.y + p.h / 2}) rotate(-90)" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" class="tx">${esc(p.lb)}</text>`;
        let ly = p.y; (p.lanes || []).forEach((l, i, arr) => {
          out += `<line x1="${p.x + 48}" y1="${ly}" x2="${p.x + 48}" y2="${ly + l.h}" class="s" stroke-width="1"/>`;
          out += `<text transform="translate(${p.x + 37} ${ly + l.h / 2}) rotate(-90)" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" class="tx">${esc(l.lb)}</text>`;
          ly += l.h; if (i < arr.length - 1) out += `<line x1="${p.x + 26}" y1="${ly}" x2="${p.x + p.w}" y2="${ly}" class="s" stroke-width="1"/>`;
        });
      } else out += `<text x="${p.x + p.w / 2}" y="${p.y + p.h / 2}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" class="tx">${esc(p.lb)}</text>`;
    }
    for (const g of spec.groups || []) out += `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="8" class="s" stroke-width="1.2" stroke-dasharray="8 3 2 3"/>` + (g.lb ? `<text x="${g.x + 8}" y="${g.y + 12}" font-size="10" font-weight="600" class="tx">${esc(g.lb)}</text>` : '');
    // edges
    for (const e of spec.edges || []) {
      const s = nodes[e.f] || (spec.pools || []).find(p => p.id === e.f), t = nodes[e.t] || (spec.pools || []).find(p => p.id === e.t);
      if (!s || !t) continue;
      const S = s.k ? s : { k: 'pool', x: e.fx ?? (s.x + s.w / 2), y: s.y + s.h / 2, w: s.w, h: s.h };
      const T = t.k ? t : { k: 'pool', x: e.tx ?? (t.x + t.w / 2), y: t.y + t.h / 2, w: t.w, h: t.h };
      if (!s.k) { S.w = 2; } if (!t.k) { T.w = 2; }
      const pts = route(e, S, T); const k = e.k || 'seq';
      if (k === 'seq') out += `<path d="${pathD(pts)}" class="s" stroke-width="1.6" marker-end="url(#${id}a)"/>`;
      if (k === 'msg') out += `<path d="${pathD(pts)}" class="s" stroke-width="1.3" stroke-dasharray="6 4" marker-start="url(#${id}c)" marker-end="url(#${id}m)"/>`;
      if (k === 'assoc') out += `<path d="${pathD(pts)}" class="s" stroke-width="1.2" stroke-dasharray="2 3"/>`;
      if (k === 'dassoc') out += `<path d="${pathD(pts)}" class="s" stroke-width="1.2" stroke-dasharray="2 3" marker-end="url(#${id}o)"/>`;
      if (e.def || e.cond) { const [a, b] = pts; const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
        if (e.def) { const cx = a[0] + ux * 11, cy = a[1] + uy * 11; out += `<line x1="${cx - uy * 6 - ux * 4}" y1="${cy + ux * 6 - uy * 4}" x2="${cx + uy * 6 + ux * 4}" y2="${cy - ux * 6 + uy * 4}" class="s" stroke-width="1.6"/>`; }
        if (e.cond) { const cx = a[0] + ux * 7, cy = a[1] + uy * 7; out += `<path d="M${a[0]} ${a[1]} L${cx - uy * 4} ${cy + ux * 4} L${a[0] + ux * 14} ${a[1] + uy * 14} L${cx + uy * 4} ${cy - ux * 4} Z" class="s f" stroke-width="1.3"/>`; } }
      if (e.lb) { const mid = pts[Math.floor((pts.length - 1) / 2)], nx = pts[Math.floor((pts.length - 1) / 2) + 1]; const lx = e.lx ?? (mid[0] + nx[0]) / 2 + (e.dx || 0), ly = e.ly ?? (mid[1] + nx[1]) / 2 - 8 + (e.dy || 0);
        out += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="10" font-weight="600" class="tx lbl">${esc(e.lb)}</text>`; }
    }
    // nodes
    for (const n of spec.nodes || []) {
      if (isEv(n.k)) out += drawEvent(n); else if (isGw(n.k)) out += drawGw(n); else if (n.k === 'data') out += drawData(n); else if (n.k === 'store') out += drawStore(n); else if (n.k === 'note') out += drawNote(n); else out += drawTask(n);
      if (n.tag) out += `<g><circle cx="${n.x + (size(n)[0] / 2) + 4}" cy="${n.y - size(n)[1] / 2 - 4}" r="9" class="tagc"/><text x="${n.x + (size(n)[0] / 2) + 4}" y="${n.y - size(n)[1] / 2 - 4}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="800" class="tagt">${esc(n.tag)}</text></g>`;
    }
    for (const t of spec.texts || []) out += `<text x="${t.x}" y="${t.y}" text-anchor="${t.a || 'middle'}" font-size="${t.s || 11}" font-weight="${t.w || 700}" class="tx">${esc(t.t)}</text>`;
    return out + '</svg>';
  }

  /* ---------- ArchiMate ---------- */
  const AFILL = { bus: 'a-bus', app: 'a-app', tech: 'a-tech', mot: 'a-mot', strat: 'a-strat', common: 'a-com', impl: 'a-impl' };
  const BEHAV = ['process', 'function', 'service', 'event', 'interaction'];
  const MOTIV = ['goal', 'driver', 'assess', 'req', 'stake', 'principle', 'outcome', 'value', 'meaning', 'constraint'];
  function aIcon(k, x, y) { // x,y = top-right icon box origin (18x14)
    switch (k) {
      case 'actor': return `<circle cx="${x + 9}" cy="${y + 2.5}" r="2.5" class="s thin"/><path d="M${x + 9} ${y + 5} v5 M${x + 5} ${y + 7} h8 M${x + 9} ${y + 10} l-3.5 4 M${x + 9} ${y + 10} l3.5 4" class="s thin"/>`;
      case 'role': return `<path d="M${x + 5} ${y + 2} h9 M${x + 5} ${y + 12} h9" class="s thin"/><ellipse cx="${x + 5}" cy="${y + 7}" rx="2.5" ry="5" class="s thin"/><ellipse cx="${x + 14}" cy="${y + 7}" rx="2.5" ry="5" class="s thin"/>`;
      case 'collab': return `<circle cx="${x + 6}" cy="${y + 7}" r="5" class="s thin"/><circle cx="${x + 12}" cy="${y + 7}" r="5" class="s thin"/>`;
      case 'iface': return `<circle cx="${x + 13}" cy="${y + 7}" r="4" class="s thin"/><path d="M${x + 2} ${y + 7} h7" class="s thin"/>`;
      case 'process': return `<path d="M${x + 1} ${y + 5} h10 v-3 l6 5 l-6 5 v-3 h-10 Z" class="s thin"/>`;
      case 'function': return `<path d="M${x + 3} ${y + 5} l6 -4 l6 4 v8 l-6 -4 l-6 4 Z" class="s thin"/>`;
      case 'service': return `<rect x="${x + 1}" y="${y + 3}" width="16" height="8" rx="4" class="s thin"/>`;
      case 'event': return `<path d="M${x + 1} ${y + 2} h11 a5 5 0 0 1 0 10 h-11 a5 5 0 0 0 0 -10 Z" class="s thin"/>`;
      case 'interaction': return `<path d="M${x + 7} ${y + 2} a5 5 0 0 0 0 10 Z M${x + 11} ${y + 2} a5 5 0 0 1 0 10 Z" class="s thin"/>`;
      case 'bobject': case 'dobject': return `<rect x="${x + 1}" y="${y + 1}" width="16" height="12" class="s thin"/><path d="M${x + 1} ${y + 4.5} h16" class="s thin"/>`;
      case 'appcomp': return `<rect x="${x + 4}" y="${y + 1}" width="13" height="12" class="s thin"/><rect x="${x + 1}" y="${y + 3}" width="6" height="3" class="s thin f"/><rect x="${x + 1}" y="${y + 8}" width="6" height="3" class="s thin f"/>`;
      case 'node': return `<path d="M${x + 1} ${y + 4} h12 v10 h-12 Z M${x + 1} ${y + 4} l3 -3 h12 l-3 3 M${x + 13} ${y + 14} l3 -3 v-10" class="s thin"/>`;
      case 'device': return `<rect x="${x + 2}" y="${y + 1}" width="14" height="9" rx="1.5" class="s thin"/><path d="M${x + 1} ${y + 13} l2 -3 h12 l2 3 Z" class="s thin"/>`;
      case 'syssw': return `<circle cx="${x + 8}" cy="${y + 8}" r="5.5" class="s thin"/><path d="M${x + 6} ${y + 3} a6 6 0 0 1 9 7" class="s thin"/>`;
      case 'artifact': return `<path d="M${x + 4} ${y + 1} h7 l4 4 v9 h-11 Z M${x + 11} ${y + 1} v4 h4" class="s thin"/>`;
      case 'product': return `<rect x="${x + 1}" y="${y + 1}" width="16" height="12" class="s thin"/><path d="M${x + 1} ${y + 4.5} h8 v-3.5" class="s thin"/>`;
      case 'goal': return `<circle cx="${x + 9}" cy="${y + 7}" r="6" class="s thin"/><circle cx="${x + 9}" cy="${y + 7}" r="3.5" class="s thin"/><circle cx="${x + 9}" cy="${y + 7}" r="1" class="fi"/>`;
      case 'driver': { let t = `<circle cx="${x + 9}" cy="${y + 7}" r="5" class="s thin"/>`; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; t += `<line x1="${(x + 9 + Math.cos(a) * 5).toFixed(1)}" y1="${(y + 7 + Math.sin(a) * 5).toFixed(1)}" x2="${(x + 9 + Math.cos(a) * 7).toFixed(1)}" y2="${(y + 7 + Math.sin(a) * 7).toFixed(1)}" class="s thin"/>`; } return t; }
      case 'assess': return `<circle cx="${x + 7}" cy="${y + 6}" r="4.5" class="s thin"/><path d="M${x + 10} ${y + 9.5} l5 4.5" class="s thin"/>`;
      case 'req': return `<path d="M${x + 4} ${y + 2} h13 l-3 10 h-13 Z" class="s thin"/>`;
      case 'stake': return `<path d="M${x + 4} ${y + 2} h9 M${x + 4} ${y + 12} h9" class="s thin"/><ellipse cx="${x + 4}" cy="${y + 7}" rx="2.5" ry="5" class="s thin"/><ellipse cx="${x + 13}" cy="${y + 7}" rx="2.5" ry="5" class="s thin"/>`;
      case 'outcome': return `<circle cx="${x + 8}" cy="${y + 8}" r="5.5" class="s thin"/><circle cx="${x + 8}" cy="${y + 8}" r="2.5" class="s thin"/><path d="M${x + 8} ${y + 8} l7 -7 M${x + 12} ${y + 1} h3 v3" class="s thin"/>`;
      case 'principle': return `<rect x="${x + 3}" y="${y + 1}" width="12" height="12" class="s thin"/><path d="M${x + 9} ${y + 3} v5 M${x + 9} ${y + 10} v1" class="s" stroke-width="1.6"/>`;
      case 'capability': return `<path d="M${x + 1} ${y + 13} h15 v-12 h-5 v4 h-5 v4 h-5 Z" class="s thin"/>`;
      case 'course': return `<circle cx="${x + 6}" cy="${y + 9}" r="4" class="s thin"/><path d="M${x + 9} ${y + 6} q3 -5 8 -4 l-2 -1.5 M${x + 17} ${y + 2} l-1.5 2" class="s thin"/>`;
      case 'resource': return `<rect x="${x + 1}" y="${y + 3}" width="14" height="8" rx="2" class="s thin"/><path d="M${x + 15} ${y + 5.5} h2 v3 h-2 M${x + 4} ${y + 5} v4 M${x + 7} ${y + 5} v4" class="s thin"/>`;
      case 'equipment': return `<circle cx="${x + 6}" cy="${y + 9}" r="3.5" class="s thin"/><circle cx="${x + 13}" cy="${y + 4}" r="2.5" class="s thin"/>`;
      case 'facility': return `<path d="M${x + 1} ${y + 13} v-10 h3 v5 l4 -3 v3 l4 -3 v3 l5 -3 v8 Z" class="s thin"/>`;
      case 'material': return `<path d="M${x + 4} ${y + 1} h10 l3 6 l-3 6 h-10 l-3 -6 Z" class="s thin"/>`;
      case 'network': return `<path d="M${x + 4} ${y + 4} h12 l-3 7 h-12 Z" class="s thin"/><circle cx="${x + 4}" cy="${y + 4}" r="1.6" class="fi"/><circle cx="${x + 16}" cy="${y + 4}" r="1.6" class="fi"/><circle cx="${x + 13}" cy="${y + 11}" r="1.6" class="fi"/><circle cx="${x + 1}" cy="${y + 11}" r="1.6" class="fi"/>`;
      case 'path': return `<path d="M${x + 1} ${y + 7} h16" class="s thin" stroke-dasharray="2 2"/><path d="M${x + 4} ${y + 4} l-3 3 l3 3 M${x + 14} ${y + 4} l3 3 l-3 3" class="s thin"/>`;
      case 'location': return `<path d="M${x + 9} ${y + 14} l-5 -7 a5.5 5.5 0 1 1 10 0 Z" class="s thin"/>`;
      default: return '';
    }
  }
  function aBox(n) {
    const w = n.w || 124, h = n.h || 54, x = n.x - w / 2, y = n.y - h / 2; const fill = AFILL[n.dom || 'common'];
    let s = '';
    if (n.k === 'junction') return `<circle cx="${n.x}" cy="${n.y}" r="6" class="${n.or ? 's f' : 'fi'}" stroke-width="1.4"/>`;
    if (n.k === 'grouping') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="s" stroke-width="1.2" stroke-dasharray="7 4" fill="none"/><text x="${x + 8}" y="${y + 13}" font-size="10.5" font-weight="700" class="tx">${esc(n.lb)}</text>`;
    if (MOTIV.includes(n.k)) s += `<path d="M${x + 8} ${y} H${x + w - 8} L${x + w} ${y + 8} V${y + h - 8} L${x + w - 8} ${y + h} H${x + 8} L${x} ${y + h - 8} V${y + 8} Z" class="s ${fill}" stroke-width="1.3"/>`;
    else s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${BEHAV.includes(n.k) ? 11 : 1.5}" class="s ${fill}" stroke-width="1.3"/>`;
    s += aIcon(n.k, x + w - 22, y + 5);
    s += textBlock(n.x - 4, n.y + 3, n.lb, Math.floor((w - 26) / 6.1), 10.5, 'middle', 600);
    if (n.tag) s += `<circle cx="${x + 2}" cy="${y + 2}" r="9" class="tagc"/><text x="${x + 2}" y="${y + 2}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="800" class="tagt">${esc(n.tag)}</text>`;
    return s;
  }
  function clip(n, px, py) { // intersection of segment center->(px,py) with box border
    if (n.k === 'junction') { const dx = px - n.x, dy = py - n.y, L = Math.hypot(dx, dy) || 1; return [n.x + dx / L * 6, n.y + dy / L * 6]; }
    const w = (n.w || 124) / 2, h = (n.h || 54) / 2; const dx = px - n.x, dy = py - n.y;
    if (!dx && !dy) return [n.x, n.y]; const sx = dx ? w / Math.abs(dx) : Infinity, sy = dy ? h / Math.abs(dy) : Infinity; const s = Math.min(sx, sy);
    return [n.x + dx * s, n.y + dy * s];
  }
  function archimate(spec) {
    const id = 'd' + (++uid); const nodes = {}; (spec.nodes || []).forEach(n => nodes[n.id] = n);
    let out = `<svg viewBox="0 0 ${spec.w} ${spec.h}" width="${spec.w}" height="${spec.h}" class="dg" style="max-width:${spec.w}px" role="img" aria-label="${esc(spec.alt || 'Diagrama ArchiMate')}" xmlns="http://www.w3.org/2000/svg"><defs>`;
    out += `<marker id="${id}fa" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="fi"/></marker>`;
    out += `<marker id="${id}oa" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0.5 L10 5 L0 9.5" class="s" stroke-width="1.3" fill="none"/></marker>`;
    out += `<marker id="${id}sa" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1 L10 5 L0 9" class="s" stroke-width="1.3" fill="none"/></marker>`;
    out += `<marker id="${id}tri" viewBox="0 0 12 12" refX="11.5" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0 0 L12 6 L0 12 Z" class="fo" stroke-width="1.1"/></marker>`;
    out += `<marker id="${id}fd" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="14" markerHeight="9" orient="auto"><path d="M0 5 L8 0 L16 5 L8 10 Z" class="fi"/></marker>`;
    out += `<marker id="${id}od" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="14" markerHeight="9" orient="auto"><path d="M0.6 5 L8 0.6 L15.4 5 L8 9.4 Z" class="fo" stroke-width="1.1"/></marker>`;
    out += `<marker id="${id}dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7"><circle cx="5" cy="5" r="4" class="fi"/></marker></defs>`;
    const groups = (spec.nodes || []).filter(n => n.k === 'grouping'); groups.forEach(g => out += aBox(g));
    for (const e of spec.edges || []) {
      const s = nodes[e.f], t = nodes[e.t]; if (!s || !t) continue;
      const via = e.via || []; const p1 = via[0] || [t.x, t.y], pN = via[via.length - 1] || [s.x, s.y];
      const pts = [clip(s, p1[0], p1[1]), ...via, clip(t, pN[0], pN[1])];
      const d = pathD(pts); let st = '', ms = '', me = '';
      switch (e.k) {
        case 'comp': ms = `${id}fd`; break; case 'aggr': ms = `${id}od`; break;
        case 'assign': ms = `${id}dot`; me = `${id}fa`; break;
        case 'real': st = 'stroke-dasharray="5 3"'; me = `${id}tri`; break;
        case 'serv': me = `${id}oa`; break;
        case 'access': st = 'stroke-dasharray="1.5 3"'; me = (e.read || e.noarrow) ? '' : `${id}sa`; break;
        case 'infl': st = 'stroke-dasharray="6 4"'; me = `${id}oa`; break;
        case 'trig': me = `${id}fa`; break;
        case 'flow': st = 'stroke-dasharray="7 4"'; me = `${id}fa`; break;
        case 'spec': me = `${id}tri`; break;
        default: break;
      }
      let line = `<path d="${d}" class="s" stroke-width="1.3" fill="none" ${st}`;
      if (ms) line += ` marker-start="url(#${ms})"`;
      if (me) line += ` marker-end="url(#${me})"`;
      out += line + '/>';
      if (e.k === 'access' && e.read && !e.noarrow) { // arrowhead at the behaviour end: information flows object -> behaviour (read)
        const a = pts[0], b = pts[1];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (a[0] - b[0]) / L, uy = (a[1] - b[1]) / L;
        out += `<path d="M${a[0] - ux * 7 - uy * 4} ${a[1] - uy * 7 + ux * 4} L${a[0]} ${a[1]} L${a[0] - ux * 7 + uy * 4} ${a[1] - uy * 7 - ux * 4}" class="s" stroke-width="1.3" fill="none"/>`;
      }
      if (e.lb) { const i = Math.floor((pts.length - 1) / 2); const m = pts[i], n2 = pts[i + 1]; out += `<text x="${(m[0] + n2[0]) / 2 + (e.dx || 0)}" y="${(m[1] + n2[1]) / 2 - 7 + (e.dy || 0)}" text-anchor="middle" font-size="10" font-weight="700" class="tx lbl">${esc(e.lb)}</text>`; }
    }
    (spec.nodes || []).filter(n => n.k !== 'grouping').forEach(n => out += aBox(n));
    for (const t of spec.texts || []) out += `<text x="${t.x}" y="${t.y}" text-anchor="${t.a || 'middle'}" font-size="${t.s || 11}" font-weight="${t.w || 700}" class="tx">${esc(t.t)}</text>`;
    return out + '</svg>';
  }
  // single relationship sample: A --k--> B
  function rel(k, opts = {}) {
    return archimate({ w: 360, h: 90, alt: 'Relação ArchiMate entre dois elementos', nodes: [
      { id: 'a', k: opts.ak || 'process', dom: opts.ad || 'common', lb: opts.al || 'A', x: 70, y: 45, w: 112 },
      { id: 'b', k: opts.bk || 'service', dom: opts.bd || 'common', lb: opts.bl || 'B', x: 290, y: 45, w: 112 }],
      edges: [{ f: 'a', t: 'b', k, read: opts.read }] });
  }
  function render(d) { if (!d) return ''; if (typeof d === 'string') return d; if (d.kind === 'bpmn') return bpmn(d); if (d.kind === 'archimate') return archimate(d); if (d.kind === 'rel') return rel(d.r, d); return ''; }
  return { render, bpmn, archimate, rel, esc, aIcon, AFILL };
})();
