/* ===== Graph lab, core (window.GRAPH) =====
   Generic weighted, undirected graphs for algorithm animations. Any course can use it; the algorithms register
   themselves with GRAPH.algo (see graph-algos.js) and the player (app-graph.js) draws their steps.

   Graph spec (the same shape as RC's `d.topo`, so a question's diagram can be animated as is):
     { n: { u: [x, y], ... }, e: [['u', 'v', 2], ...], W: 400, H: 200 }   costs may be numbers or numeric strings
   Algorithm: GRAPH.algo({ id, name, code: [lines], run(g, p) => steps })
     A step is a full snapshot, so the player can jump anywhere:
       { line: i | [i, j],          code lines to highlight
         say: 'text',               the explanation (**bold** and `code` allowed)
         ns: { id: cls },           node classes: src, done, cur, front, look, dest, bad
         nl: { id: 'text' },        badge under each node (distances)
         es: { 'a|b': cls },        edge classes: tree, cand, look, win, lose, loop, chg
         ec: { 'a|b': cost },       edge costs that differ from the graph (a cost change)
         ar: [[from, to, cls]],     small arrows along edges (next hops)
         pk: [[from, to, label]],   packets that travel along an edge when the step opens
         tb: [{ t, h, r, hl }],     tables (hl: [[row, col]] cells to flash; row -1 = whole last row)
         sfx: 'pop' | ...,          sound when the step opens (graph-sound.js)
         ask: { k: 'node', q, ans: [ids], hint, why }        practice: tap a node
              { k: 'nums', q, items: [{ l, ans }], hint, why } practice: type numbers (∞ allowed) }  */
const GRAPH = (() => {
  const INF = Infinity;
  const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const num = c => (c === null || c === undefined || c === '' || c === '∞' ? INF : +c);
  const fmt = v => (v === INF ? '∞' : String(v));
  // natural order: R2 before R10, a before b
  const cmp = (a, b) => a.localeCompare(b, 'pt', { numeric: true });

  function make(spec) {
    const pos = {}, edges = [], adj = {};
    Object.entries(spec.n).forEach(([id, p]) => { pos[id] = [+p[0], +p[1]]; adj[id] = []; });
    (spec.e || []).forEach(([a, b, c, f]) => {
      const e = { a, b, c: num(c), f: f ?? null, k: key(a, b) };   // f: where the cost label sits (null: the player picks)
      edges.push(e); adj[a].push({ v: b, e }); adj[b].push({ v: a, e });
    });
    const nodes = Object.keys(pos).sort(cmp);
    Object.values(adj).forEach(l => l.sort((x, y) => cmp(x.v, y.v)));
    const xs = nodes.map(id => pos[id][0]), ys = nodes.map(id => pos[id][1]);
    return {
      nodes, pos, edges, adj,
      W: spec.W || Math.max(400, ...xs), H: spec.H || Math.max(200, ...ys),
      edge: (a, b) => edges.find(e => e.k === key(a, b)),
      cost: (a, b) => { const e = edges.find(x => x.k === key(a, b)); return e ? e.c : INF; },
      nb: id => adj[id],
    };
  }
  // the spec of a graph with some costs changed (null = the link is gone)
  function withCosts(spec, ch) {
    return Object.assign({}, spec, { e: spec.e.map(([a, b, c, f]) => { const k = key(a, b); return [a, b, k in ch ? ch[k] : c, f]; }).filter(e => e[2] !== null && num(e[2]) !== INF) });
  }

  /* --- seeded randomness, so a problem can be shown again from its seed --- */
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    const r = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.int = (a, b) => a + Math.floor(r() * (b - a + 1));
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    return r;
  }
  const newSeed = () => Math.floor(Math.random() * 2 ** 31);

  /* --- shortest paths (to check a generated problem; the animated version is in graph-algos.js) --- */
  function sssp(g, s) {
    const D = {}, ways = {}, done = new Set();
    g.nodes.forEach(v => { D[v] = INF; ways[v] = 0; }); D[s] = 0; ways[s] = 1;
    while (done.size < g.nodes.length) {
      const w = g.nodes.filter(v => !done.has(v)).sort((a, b) => D[a] - D[b] || cmp(a, b))[0];
      if (D[w] === INF) break; done.add(w);
      g.nb(w).forEach(({ v, e }) => { if (done.has(v)) return; const d = D[w] + e.c;
        if (d < D[v]) { D[v] = d; ways[v] = ways[w]; } else if (d === D[v]) ways[v] += ways[w]; });
    }
    return { D, ways };
  }
  const connected = g => { const seen = new Set([g.nodes[0]]), st = [g.nodes[0]];
    while (st.length) g.nb(st.pop()).forEach(({ v }) => { if (!seen.has(v)) { seen.add(v); st.push(v); } });
    return seen.size === g.nodes.length; };

  /* --- random graphs that look drawn by hand: nodes on a jittered grid, no crossing links --- */
  const NAMES = {
    letters: n => 'uvwxyz'.length >= n ? 'uvwxyz'.slice(0, n).split('') : 'abcdefghij'.slice(0, n).split(''),
    upper: n => 'ABCDEFGHIJ'.slice(0, n).split(''),
    R: n => Array.from({ length: n }, (_, i) => `R${i + 1}`),
  };
  function cross(p1, p2, p3, p4) {
    const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0)) && d1 && d2 && d3 && d4;
  }
  function segDist(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
  }
  // opts: { n: [min, max], names: 'letters' | 'upper' | 'R' | 'any', cost: [min, max], extra: [min, max], maxDeg }
  function generate(r, opts = {}) {
    // two rows, like the slides: every column gets one node, the rest go to random free cells; the jitter keeps
    // it from looking like a ladder, and a node may drift towards the middle band
    const n = r.int(...(opts.n || [5, 7])), W = 400, H = 200, cols = Math.min(5, Math.ceil(n / 2) + (n % 2 ? 0 : r.int(0, 1)));
    const cells = Array.from({ length: cols }, (_, c) => c + cols * r.int(0, 1));
    r.shuffle(Array.from({ length: cols * 2 }, (_, i) => i).filter(i => !cells.includes(i))).slice(0, n - cols).forEach(i => cells.push(i));
    const cw = W / (cols - 1 || 1);
    // only a node alone in its column may drift to the middle: two nodes stacked closely make a short, steep link
    const alone = c => cells.filter(i => i % cols === c).length === 1;
    const pts = cells.map(i => { const cx = i % cols, cy = Math.floor(i / cols), mid = alone(cx) && r() < 0.3;
      return [Math.round(Math.max(0, Math.min(W, cx * cw + (r() - 0.5) * 0.3 * cw))), Math.round(mid ? H / 2 + (r() - 0.5) * 30 : cy ? H - r() * 22 : r() * 22)]; });
    pts.forEach((p, i) => { if (pts.slice(0, i).some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 66)) p[1] = p[1] < H / 2 ? H - r() * 12 : r() * 12; });
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const style = opts.names === 'any' || !opts.names ? r.pick(['letters', 'upper', 'R']) : opts.names;
    const ids = NAMES[style](n), P = {}; ids.forEach((id, i) => { P[id] = pts[i]; });
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([ids[i], ids[j], Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1])]);
    pairs.sort((a, b) => a[2] - b[2]);
    const E = [], deg = {}, maxDeg = opts.maxDeg || 4; ids.forEach(id => { deg[id] = 0; });
    const ok = ([a, b]) => deg[a] < maxDeg && deg[b] < maxDeg
      && !E.some(([c, d]) => c !== a && c !== b && d !== a && d !== b && cross(P[a], P[b], P[c], P[d]))
      && !ids.some(o => o !== a && o !== b && segDist(P[o], P[a], P[b]) < 26);
    // spanning tree first (Kruskal on distance), so it is always connected
    const root = {}; ids.forEach(id => { root[id] = id; }); const find = x => (root[x] === x ? x : (root[x] = find(root[x])));
    pairs.forEach(p => { if (find(p[0]) !== find(p[1]) && ok(p)) { root[find(p[0])] = find(p[1]); E.push(p); deg[p[0]]++; deg[p[1]]++; } });
    const want = r.int(...(opts.extra || [2, 3]));
    // extra links make cycles (without them there is nothing to relax): short ones first, a random skip for variety,
    // then a second pass without skipping in case the first fell short
    for (const pass of [0.65, 1]) for (const p of pairs) {
      if (E.length >= n - 1 + want) break;
      if (!E.includes(p) && ok(p) && r() < pass) { E.push(p); deg[p[0]]++; deg[p[1]]++; }
    }
    const [c0, c1] = opts.cost || [1, 9];
    return { n: P, e: E.map(([a, b]) => [a, b, r.int(c0, c1)]), W, H };
  }
  // tries make(r) until test(spec) passes (a generator that wants e.g. unique shortest paths)
  function until(r, makeOne, test, tries = 60) {
    let s; for (let i = 0; i < tries; i++) { s = makeOne(r); if (!test || test(s)) return s; }
    return s;
  }

  const algos = {};
  const algo = def => { algos[def.id] = def; return def; };
  function run(id, spec, p) { const a = algos[id]; if (!a) throw new Error(`unknown graph algorithm ${id}`); return a.run(make(spec), p || {}); }

  return { INF, key, num, fmt, cmp, make, withCosts, rng, newSeed, sssp, connected, generate, until, algos, algo, run };
})();
