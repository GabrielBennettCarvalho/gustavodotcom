/* ===== Progress key =====
   Packs a student's progress into a short text that can travel as a link, a QR code or a paste,
   so they can continue on another device without accounts or a server.

   Questions are referred to by their position in the course's ids.json (STUDY.ids), never by
   their order in the source files, so adding questions never breaks old keys.

   Text format:  "E1" + base64url(bytes)
   bytes:        [flags] + payload + [checksum hi, lo]
     flags       bit0 compressed · bit1 includes notes · bit2 extras block at the end
     payload     deflate-compressed when the browser supports it
     checksum    Fletcher-16 over flags + payload, catches truncated or mistyped keys
   payload (varint = unsigned LEB128, str = varint length + UTF-8):
     varint courseCount
     per course:
       str id · varint xp · varint rounds · varint testDay (0 = none) · byte settings (bit0 unlockAll)
       varint baseDay · varint n
       n × varint gap        (index − previous index − 1, indexes ascending)
       n × byte  c<<4 | w    (each capped at 15)
       n × byte  box<<5 | eb<<3 | ew   (box ≤ 7, eb ≤ 3, ew ≤ 7)
       n × varint lastDay − baseDay
       if notes: varint m, m × (varint index, str text)
     if extras (bit2), after every course:
       varint m, m × (str id, str json)   the newer state: lessons seen, key problems, pace and today's plan
       json = { sl: { lessonId: day }, pt: { typeId: [stage, done, dueDay, { stageId: day }] }, pc: { concept: 0|1 },
                pa: [s, n, pb, pbn], td: [date, minutes, [plan keys]], md: minutes per day }
       It sits at the end so that an older copy of the app, which stops reading before it, still reads the rest.
   Columns (not rows) because similar bytes side by side compress much better. */
window.PROGRESS_KEY = (() => {
  const PREFIX = 'E1';
  const DAY = 864e5, EPOCH = Math.floor(Date.UTC(2024, 0, 1) / DAY);
  const toDay = ms => ms ? Math.max(0, Math.floor(ms / DAY) - EPOCH) : 0;
  const fromDay = d => (d + EPOCH) * DAY + DAY / 2;
  const cap = (v, m) => Math.max(0, Math.min(m, v | 0));

  /* --- bytes --- */
  function writer() {
    const b = [];
    const w = {
      byte(v) { b.push(v & 255); },
      varint(v) { v = Math.max(0, Math.floor(v)); do { let x = v % 128; v = Math.floor(v / 128); b.push(v ? x | 128 : x); } while (v); },
      str(s) { const u = new TextEncoder().encode(s); w.varint(u.length); u.forEach(x => b.push(x)); },
      out: () => Uint8Array.from(b),
    };
    return w;
  }
  function reader(u) {
    let i = 0;
    const need = () => { if (i >= u.length) throw new Error('truncated'); };
    const r = {
      byte() { need(); return u[i++]; },
      varint() { let v = 0, m = 1, x; do { need(); x = u[i++]; v += (x & 127) * m; m *= 128; } while (x & 128); return v; },
      str() { const n = r.varint(); if (i + n > u.length) throw new Error('truncated'); const s = new TextDecoder().decode(u.subarray(i, i + n)); i += n; return s; },
    };
    return r;
  }
  const b64 = u => { let s = ''; u.forEach(x => s += String.fromCharCode(x)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const t = atob(s); return Uint8Array.from(t, c => c.charCodeAt(0)); };
  async function pipe(u, Stream) { const out = new Response(new Blob([u]).stream().pipeThrough(new Stream('deflate-raw'))); return new Uint8Array(await out.arrayBuffer()); }
  const fletcher = u => { let a = 0, b = 0; u.forEach(x => { a = (a + x) % 255; b = (b + a) % 255; }); return [b, a]; };
  const canZip = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

  /* --- encode: G is the app state ({ c: { courseId: { stats, notes, xp, rounds, settings } } }) --- */
  async function encode(G, courses, opts = {}) {
    const w = writer();
    const list = Object.keys(G.c || {}).filter(id => courses[id] && courses[id].ids);
    w.varint(list.length);
    for (const id of list) {
      const S = G.c[id], ids = courses[id].ids, pos = new Map(ids.map((q, i) => [q, i]));
      const rows = Object.entries(S.stats || {})
        .filter(([q, s]) => pos.has(q) && (s.c || s.w || s.ew))
        .map(([q, s]) => ({ i: pos.get(q), s })).sort((a, b) => a.i - b.i);
      const days = rows.map(r => toDay(r.s.last)); const base = days.length ? Math.min(...days) : 0;
      w.str(id); w.varint(S.xp || 0); w.varint(S.rounds || 0);
      const td = S.settings && S.settings.testDate ? Date.parse(S.settings.testDate + 'T12:00:00Z') : 0;
      w.varint(td ? toDay(td) + 1 : 0); w.byte(S.settings && S.settings.unlockAll ? 1 : 0);
      w.varint(base); w.varint(rows.length);
      let prev = -1; rows.forEach(r => { w.varint(r.i - prev - 1); prev = r.i; });
      rows.forEach(r => w.byte(cap(r.s.c, 15) << 4 | cap(r.s.w, 15)));
      rows.forEach(r => w.byte(cap(r.s.box, 7) << 5 | cap(r.s.eb, 3) << 3 | cap(r.s.ew, 7)));
      days.forEach(d => w.varint(d - base));
      if (opts.notes) {
        const ns = Object.entries(S.notes || {}).filter(([q, t]) => t && pos.has(q));
        w.varint(ns.length); ns.forEach(([q, t]) => { w.varint(pos.get(q)); w.str(t); });
      }
    }
    const ext = list.map(id => [id, extOut(G.c[id])]).filter(x => x[1]);
    w.varint(ext.length); ext.forEach(([id, j]) => { w.str(id); w.str(j); });
    let payload = w.out(), flags = (opts.notes ? 2 : 0) | 4;
    if (canZip) { const z = await pipe(payload, CompressionStream); if (z.length < payload.length) { payload = z; flags |= 1; } }
    const body = new Uint8Array(payload.length + 1); body[0] = flags; body.set(payload, 1);
    const all = new Uint8Array(body.length + 2); all.set(body); all.set(fletcher(body), body.length);
    return PREFIX + b64(all);
  }

  /* --- extras: the newer per-course state, as compact JSON (times in days) --- */
  function extOut(S) {
    const o = {}, days = m => Object.fromEntries(Object.entries(m || {}).map(([k, v]) => [k, toDay(v)]));
    if (S.seenL && Object.keys(S.seenL).length) o.sl = days(S.seenL);
    const T = (S.prob && S.prob.t) || {};
    if (Object.keys(T).length) o.pt = Object.fromEntries(Object.entries(T).map(([k, t]) => [k, [t.stage | 0, t.done ? 1 : 0, t.due ? toDay(t.due) + 1 : 0, days(t.last)]]));
    if (S.prob && S.prob.con && Object.keys(S.prob.con).length) o.pc = S.prob.con;
    if (S.pace && (S.pace.n || S.pace.pbn)) o.pa = [Math.round(S.pace.s), S.pace.n, Math.round(S.pace.pb * 100) / 100, S.pace.pbn];
    if (S.today && S.today.d) o.td = [S.today.d, Math.round(S.today.ms / 60000), S.today.did || []];
    if (S.settings && S.settings.minDay && S.settings.minDay !== 30) o.md = S.settings.minDay;
    return Object.keys(o).length ? JSON.stringify(o) : '';
  }
  function extIn(j) {
    const o = JSON.parse(j), days = m => Object.fromEntries(Object.entries(m || {}).map(([k, d]) => [k, fromDay(d)])), x = {};
    if (o.sl) x.seenL = days(o.sl);
    if (o.pt) x.probT = Object.fromEntries(Object.entries(o.pt).map(([k, [stage, done, due, last]]) => [k, { stage, done: !!done, due: due ? fromDay(due - 1) : 0, last: days(last) }]));
    if (o.pc) x.probCon = o.pc;
    if (o.pa) x.pace = { s: o.pa[0], n: o.pa[1], pb: o.pa[2], pbn: o.pa[3] };
    if (o.td) x.today = { d: o.td[0], ms: o.td[1] * 60000, did: o.td[2] || [] };
    if (o.md) x.minDay = o.md;
    return x;
  }

  /* --- find the key inside whatever was pasted: a link, the key itself, text around it --- */
  function extract(text) {
    const s = String(text || '').trim();
    const m = s.match(/[#?&]k=(E1[A-Za-z0-9_-]+)/) || s.match(/\b(E1[A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }

  /* --- decode: returns { courses: { id: { stats, notes, xp, rounds, testDate, unlockAll } }, unknown } --- */
  async function decode(text, courses) {
    const key = extract(text); if (!key) throw new Error('Não encontrei uma chave neste texto.');
    let all; try { all = unb64(key.slice(PREFIX.length)); } catch { throw new Error('A chave está incompleta ou foi alterada. Copia-a outra vez.'); }
    const bad = () => new Error('A chave está incompleta ou foi alterada. Copia-a outra vez.');
    if (all.length < 4) throw bad();
    const body = all.subarray(0, all.length - 2), [h, l] = fletcher(body);
    if (all[all.length - 2] !== h || all[all.length - 1] !== l) throw bad();
    const flags = body[0]; let payload = body.subarray(1);
    if (flags & 1) { if (!canZip) throw new Error('Este browser é demasiado antigo para ler a chave.'); try { payload = await pipe(payload, DecompressionStream); } catch { throw bad(); } }
    const r = reader(payload), out = { courses: {}, unknown: 0 };
    try {
      const nc = r.varint();
      for (let k = 0; k < nc; k++) {
        const id = r.str(), ids = (courses[id] && courses[id].ids) || [];
        const C = { stats: {}, notes: {}, xp: r.varint(), rounds: r.varint() };
        const td = r.varint(); C.testDate = td ? new Date(fromDay(td - 1)).toISOString().slice(0, 10) : '';
        C.unlockAll = !!(r.byte() & 1);
        const base = r.varint(), n = r.varint();
        const idx = []; let prev = -1; for (let j = 0; j < n; j++) { prev += r.varint() + 1; idx.push(prev); }
        const a = [], b = [], d = [];
        for (let j = 0; j < n; j++) a.push(r.byte());
        for (let j = 0; j < n; j++) b.push(r.byte());
        for (let j = 0; j < n; j++) d.push(r.varint());
        idx.forEach((i, j) => {
          const q = ids[i]; if (!q) { out.unknown++; return; }
          C.stats[q] = { c: a[j] >> 4, w: a[j] & 15, box: b[j] >> 5, eb: (b[j] >> 3) & 3, ew: b[j] & 7, last: fromDay(base + d[j]) };
        });
        if (flags & 2) { const m = r.varint(); for (let j = 0; j < m; j++) { const i = r.varint(), t = r.str(); if (ids[i]) C.notes[ids[i]] = t; } }
        if (courses[id]) out.courses[id] = C; else out.unknown += n;
      }
      if (flags & 4) { const m = r.varint(); for (let j = 0; j < m; j++) { const id = r.str(), t = r.str(); if (out.courses[id]) out.courses[id].ext = extIn(t); } }
    } catch { throw bad(); }
    if (!Object.keys(out.courses).length) throw new Error('Esta chave não tem progresso de nenhuma cadeira deste site.');
    return out;
  }

  /* --- merge into G without losing anything on either side --- */
  function merge(G, incoming, blank) {
    const report = { added: 0, updated: 0, notes: 0 };
    for (const [id, R] of Object.entries(incoming.courses)) {
      const L = G.c[id] || (G.c[id] = blank(id));
      L.stats = L.stats || {}; L.notes = L.notes || {}; L.settings = L.settings || {};
      for (const [q, r] of Object.entries(R.stats)) {
        const l = L.stats[q];
        if (!l) { L.stats[q] = { ...r }; report.added++; continue; }
        const before = JSON.stringify(l);
        l.c = Math.max(l.c || 0, r.c); l.w = Math.max(l.w || 0, r.w); l.ew = Math.max(l.ew || 0, r.ew);
        if ((r.last || 0) > (l.last || 0)) { l.box = r.box; l.eb = r.eb; l.last = r.last; }   // review state follows the most recent device
        if (JSON.stringify(l) !== before) report.updated++;
      }
      for (const [q, t] of Object.entries(R.notes)) {
        const mine = L.notes[q];
        if (!mine) { L.notes[q] = t; report.notes++; }
        else if (!mine.includes(t)) { L.notes[q] = mine + '\n\n' + t; report.notes++; }
      }
      L.xp = Math.max(L.xp || 0, R.xp); L.rounds = Math.max(L.rounds || 0, R.rounds);
      if (!L.settings.testDate && R.testDate) L.settings.testDate = R.testDate;
      if (R.unlockAll) L.settings.unlockAll = true;
      if (R.ext) mergeExt(L, R.ext, report);
    }
    return report;
  }

  // lessons seen: the earliest date wins; a key problem: the side that worked on it last wins; pace: the side with more samples
  function mergeExt(L, X, report) {
    if (X.seenL) { L.seenL = L.seenL || {}; for (const [k, v] of Object.entries(X.seenL)) if (!L.seenL[k] || v < L.seenL[k]) { if (!L.seenL[k]) report.lessons = (report.lessons || 0) + 1; L.seenL[k] = v; } }
    if (X.probT || X.probCon) { L.prob = L.prob || { t: {}, con: {} }; L.prob.t = L.prob.t || {}; L.prob.con = L.prob.con || {}; }
    const latest = t => Math.max(0, ...Object.values((t && t.last) || {}));
    for (const [k, t] of Object.entries(X.probT || {})) if (!L.prob.t[k] || latest(t) > latest(L.prob.t[k]) + 864e5 / 2) { L.prob.t[k] = t; report.problems = (report.problems || 0) + 1; }
    for (const [k, v] of Object.entries(X.probCon || {})) if (!(k in L.prob.con)) L.prob.con[k] = v;
    if (X.pace && (!L.pace || X.pace.n + X.pace.pbn > (L.pace.n || 0) + (L.pace.pbn || 0))) L.pace = X.pace;
    if (X.today) { const t = L.today; if (!t || t.d < X.today.d) L.today = X.today; else if (t.d === X.today.d) { t.ms = Math.max(t.ms, X.today.ms); X.today.did.forEach(k => { if (!t.did.includes(k)) t.did.push(k); }); } }
    if (X.minDay && (!L.settings.minDay || L.settings.minDay === 30)) L.settings.minDay = X.minDay;
  }

  /* --- what a key contains, for the confirmation screen --- */
  const summary = decoded => Object.entries(decoded.courses).map(([id, C]) => ({
    id, answered: Object.keys(C.stats).length, mastered: Object.values(C.stats).filter(s => s.c > 0).length,
    xp: C.xp, notes: Object.keys(C.notes).length,
  }));

  return { encode, decode, extract, merge, summary };
})();
