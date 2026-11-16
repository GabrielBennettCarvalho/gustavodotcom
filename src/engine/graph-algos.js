/* ===== Graph lab, algorithms =====
   Each algorithm turns a graph into a list of steps (format in graph.js). Steps are full snapshots, written for
   students: every step says what happened and why, in Portuguese. New algorithm: GRAPH.algo({ id, name, code, run }).
   `code` is a list of lines, or a function of the parameters (a variant changes a line). */
(() => {
  const { INF, key, fmt, cmp } = GRAPH;
  const join = ids => ids.every(id => id.length === 1) ? ids.join('') : ids.join(', ');
  const list = a => a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}`;

  /* ---------- Dijkstra (link state) ---------- */
  GRAPH.algo({
    id: 'dijkstra', name: 'Dijkstra',
    code: [
      'def dijkstra(G, s):',
      '    D = {v: inf for v in G}; p = {}',
      '    D[s] = 0',
      "    N = set()               # N': nós resolvidos",
      '    while N != G.nodes:',
      '        # o mais perto, dos que faltam resolver',
      '        w = min(G.nodes - N, key=D)',
      '        N.add(w)',
      '        for v in G.neighbours(w) - N:',
      '            if D[w] + c(w, v) < D[v]:',
      '                D[v] = D[w] + c(w, v)',
      '                p[v] = w',
      '    return D, p    # p: o caminho de volta a s',
    ],
    run(g, { src }) {
      const s = src || g.nodes[0], D = {}, p = {}, N = [], steps = [], others = g.nodes.filter(v => v !== s);
      g.nodes.forEach(v => { D[v] = INF; }); D[s] = 0;
      const rows = [], marks = [];
      const table = () => ({ t: 'Tabela do Dijkstra', h: ['Passo', "N'", ...others.map(v => `D(${v}),p(${v})`)], r: rows.map(r => r.slice()), mk: marks.slice() });
      const pickNext = () => g.nodes.filter(v => !N.includes(v)).sort((a, b) => D[a] - D[b] || cmp(a, b));
      const snap = (o = {}) => {
        const ns = {}, nl = {}, es = {};
        g.nodes.forEach(v => { ns[v] = [v === s ? 'src' : '', N.includes(v) ? 'done' : D[v] < INF ? 'front' : ''].filter(Boolean).join(' ');
          nl[v] = D[v] === INF ? '∞' : p[v] ? `${D[v]}, ${p[v]}` : String(D[v]); });
        Object.entries(p).forEach(([v, w]) => { es[key(v, w)] = N.includes(v) ? 'tree' : 'cand'; });
        Object.entries(o.ns || {}).forEach(([v, c]) => { ns[v] = `${ns[v]} ${c}`.trim(); });
        return Object.assign({}, o, { ns, nl, es: Object.assign(es, o.es || {}), tb: o.tb || [table()] });
      };
      const addRow = () => {
        const next = pickNext()[0];
        rows.push([String(rows.length), join(N), ...others.map(v => N.includes(v) ? '' : D[v] === INF ? '∞' : `${D[v]},${p[v]}`)]);
        if (next) marks.push([rows.length - 1, 2 + others.indexOf(next)]);
      };
      steps.push(snap({ line: [1, 2, 3], sfx: 'tick',
        say: `Começa em **${s}**: D(${s}) = 0 e todos os outros a ∞, porque ainda não se conhece caminho nenhum. N' (os nós resolvidos) está vazio.` }));

      while (N.length < g.nodes.length) {
        const cand = pickNext(), w = cand[0];
        if (D[w] === INF) break;
        const tied = cand.filter(v => D[v] === D[w]);
        N.push(w);
        const first = w === s;
        const why = first ? `Ninguém tem D menor que ${s} (0): ${s} entra em N'.`
          : `Fora de N', o menor D é o de **${w}** (${D[w]}). Entra em N': nenhum caminho por nós mais longe pode descer abaixo disso.`
            + (tied.length > 1 ? ` Há empate com ${list(tied.filter(v => v !== w))}: escolho ${w} pela ordem alfabética, mas qualquer um dava o mesmo custo.` : '');
        const nbrs = g.nb(w).filter(({ v }) => !N.includes(v));
        const ask = first ? null : { k: 'node', q: "Que nó entra agora em N'?", ans: tied,
          hint: "É o que tem o menor D entre os que ainda não estão resolvidos (os números debaixo dos nós).", why };
        if (!nbrs.length) {
          addRow();
          steps.push(snap({ line: [5, 6, 7], sfx: 'pop', ask, ns: { [w]: 'cur' }, say: `${why} Não tem vizinhos por resolver; fecha-se a linha ${rows.length - 1} da tabela.`, tb: [Object.assign(table(), { hl: [[rows.length - 1, -1]] })] }));
          continue;
        }
        steps.push(snap({ line: [5, 6, 7], sfx: 'pop', ask, ns: { [w]: 'cur' }, say: why }));
        const nask = { k: 'nums', q: `**${w}** entrou em N'. Que D fica em cada vizinho por resolver?`,
          items: nbrs.map(({ v, e }) => ({ l: `D(${v})`, ans: Math.min(D[v], D[w] + e.c) })),
          hint: `D(v) = min(D(v), D(${w}) + c(${w}, v)). O D(${w}) é ${D[w]}; os custos estão nas ligações.` };
        nbrs.forEach(({ v, e }, i) => {
          const via = D[w] + e.c, old = D[v], better = via < old, last = i === nbrs.length - 1;
          if (better) { D[v] = via; p[v] = w; }
          if (last) addRow();
          const say = `Vizinho **${v}**: D(${w}) + c(${w}, ${v}) = ${D[w]} + ${e.c} = ${via}` + (better
            ? ` < ${fmt(old)} → **D(${v}) = ${via}**, p(${v}) = ${w}.`
            : ` ≥ ${fmt(old)} → fica D(${v}) = ${old}${p[v] ? ` (p = ${p[v]})` : ''}.`)
            + (last ? ` Fecha-se a linha ${rows.length - 1} da tabela.` : '');
          steps.push(snap({ line: better ? [8, 9, 10, 11] : [8, 9], sfx: better ? 'up' : 'tick', ask: i === 0 ? nask : null,
            ns: { [w]: 'cur', [v]: 'look' }, es: { [e.k]: better ? 'win' : 'lose' }, pk: [[w, v, String(via)]], say,
            tb: [Object.assign(table(), last ? { hl: [[rows.length - 1, -1]] } : { hl: [] })] }));
        });
      }

      // results: the forwarding table of s (first hop) and the professor's summary row
      const order = N.slice();
      const hop = v => { let x = v; while (p[x] && p[x] !== s) x = p[x]; return x; };
      const path = v => { const a = [v]; while (p[a[0]]) a.unshift(p[a[0]]); return a.join('-'); };
      const fwd = { t: `Tabela de expedição de ${s}`, h: ['Destino', 'Custo', 'Caminho', 'Próximo salto'], r: others.map(v => [v, fmt(D[v]), D[v] < INF ? path(v) : '–', D[v] < INF ? hop(v) : '–']) };
      const sum = { t: 'Ordem de entrada em N\'', h: ['Nó tratado', ...order], r: [['Custo mínimo', ...order.map(v => (v === s ? '–' : fmt(D[v])))]] };
      // the farthest node: the practice question about the first hop (any equal-cost first hop is right)
      const far = others.filter(v => D[v] < INF).sort((a, b) => D[b] - D[a] || cmp(a, b))[0];
      // every first hop that starts a shortest path is right
      const back = far ? GRAPH.sssp(g, far).D : {}, hops = far ? g.nb(s).filter(({ v, e }) => e.c + back[v] === D[far]).map(({ v }) => v) : [];
      steps.push(snap({ line: 12, sfx: 'done', ns: far ? { [far]: 'look' } : {},
        ask: far ? { k: 'node', q: `Na tabela de expedição de ${s}, qual é o próximo salto para **${far}**?`, ans: hops,
          hint: `Segue p() de ${far} para trás até chegares a um vizinho de ${s}. Não é o penúltimo nó: é o primeiro depois de ${s}.` } : null,
        say: `Todos em N'. As ligações a cheio formam a **árvore de caminhos mais curtos** a partir de ${s}. Para a tabela de expedição, segue p() para trás até ao vizinho de ${s}: é esse o **próximo salto**${far ? ` (para ${far}: ${hop(far)})` : ''}.`,
        tb: [table(), fwd, sum] }));
      return steps;
    },
  });

  /* ---------- Distance vector (Bellman-Ford), towards one destination ----------
     p: { dest, start: 'zero' | 'stable', change: { a, b, c } (c null = the link fails), poison, asks }
     Synchronous rounds: in each round every node sends its D to its neighbours, then all recompute at once from
     what they received. That is how the tables are filled on paper. */
  const DV_CODE = poison => [
    '# corre em cada nó x; d é o destino',
    'D[x] = 0 if x == d else c(x, d)   # ou inf',
    'repeat:                           # uma ronda',
    '    for v in nb(x):                # nb: vizinhos',
    poison ? '        send(v, inf if via[x] == v else D[x])' : '        send(v, D[x])',
    '    # recebe o D[v] de cada vizinho',
    '    new = min(c(x, v) + D[v] for v in nb(x))',
    '    if new != D[x]:',
    '        D[x], via[x] = new, argmin',
    'until nenhum D muda               # convergiu',
    'on change of c(x, v): recompute new',
  ];
  GRAPH.algo({
    id: 'dv', name: 'Vetor-distância (Bellman-Ford)',
    code: p => DV_CODE(p && p.poison),
    run(g0, { dest, start = 'zero', change = null, poison = false, asks = 3, maxRounds = 120 }) {
      let g = g0; const d = dest || g.nodes[g.nodes.length - 1], xs = g.nodes.filter(x => x !== d), steps = [];
      const D = {}, via = {}; let rows = [], ecost = {}, gone = {};
      const c = (x, v) => (key(x, v) in ecost ? ecost[key(x, v)] : g.cost(x, v));
      const nbs = x => g.nb(x).filter(({ v }) => !gone[key(x, v)]).map(({ v }) => v);
      const adv = (v, x) => (v === d ? 0 : poison && via[v] === x ? INF : D[v]);   // what v tells x
      const best = (x, from) => {   // from: the advertisements x uses
        let b = INF, bv = null; const terms = [];
        nbs(x).forEach(v => { const t = c(x, v) + from(v, x); terms.push([v, c(x, v), from(v, x), t]);
          if (t < b || (t === b && t < INF && (v === via[x] || (bv !== via[x] && cmp(v, bv) < 0)))) { b = t; bv = v; } });
        return { b, bv: b === INF ? null : bv, terms };
      };
      const formula = (x, r) => `D(${x}) = min{ ${r.terms.map(([v, cv, a]) => `${cv} + ${fmt(a)}`).join(', ')} } = **${fmt(r.b)}**${r.bv ? `, via ${r.bv}` : ''}`;
      const loops = () => { const bad = new Set();
        xs.forEach(x => { const seen = []; let y = x; while (y && y !== d && !seen.includes(y)) { seen.push(y); y = via[y]; }
          if (y && y !== d) { let z = y; do { bad.add(key(z, via[z])); z = via[z]; } while (z !== y); } });
        return bad; };
      const cell = x => D[x] === INF ? '∞' : `${D[x]},${via[x]}`;
      const table = (hl = []) => ({ t: `Distância de cada nó até ${d} (D, via)`, h: ['', ...xs], r: rows.map(r => r.slice()), hl });
      const snap = (o = {}) => {
        const ns = {}, nl = {}, es = {}, lp = loops(), ar = [];
        g.nodes.forEach(x => { ns[x] = x === d ? 'dest' : D[x] === INF ? '' : 'front'; nl[x] = x === d ? 'destino' : fmt(D[x]); });
        xs.forEach(x => { if (via[x]) { const k = key(x, via[x]); es[k] = lp.has(k) ? 'loop' : 'tree'; ar.push([x, via[x], lp.has(k) ? 'loop' : '']); } });
        Object.keys(gone).forEach(k => { es[k] = 'gone'; });
        Object.entries(o.ns || {}).forEach(([v, cl]) => { ns[v] = `${ns[v]} ${cl}`.trim(); });
        return Object.assign({}, o, { ns, nl, ar, es: Object.assign(es, o.es || {}), ec: Object.assign({}, ecost), tb: o.tb || [table()] });
      };
      const vecAsk = (q, list_) => ({ k: 'nums', q, items: list_.map(([x, v]) => ({ l: x, ans: v })),
        hint: 'Para cada nó x: o mínimo, entre os vizinhos v, de c(x, v) + o valor que v anunciou (os números nos pacotes). Escreve ∞ (ou inf) se não há caminho.' });
      const round = () => {   // all nodes recompute at once from the previous values
        const old = Object.assign({}, D), oldVia = Object.assign({}, via), res = {};
        xs.forEach(x => { res[x] = best(x, (v, y) => (v === d ? 0 : poison && oldVia[v] === y ? INF : old[v])); });
        return res;
      };

      // t = 0: each node knows only its links
      D[d] = 0; xs.forEach(x => { const cx = nbs(x).includes(d) ? c(x, d) : INF; D[x] = cx; via[x] = cx < INF ? d : null; });
      if (start === 'stable') {   // run silently to convergence: the change scenario starts from a stable network
        for (let i = 0; i < maxRounds; i++) { const res = round(); let ch = false; xs.forEach(x => { if (res[x].b !== D[x] || res[x].bv !== via[x]) { ch = true; D[x] = res[x].b; via[x] = res[x].bv; } }); if (!ch) break; }
        rows.push(['estável', ...xs.map(cell)]);
        steps.push(snap({ line: 9, sfx: 'tick', say: `A rede está **estável**: cada nó já sabe a sua distância até **${d}** e por onde (as setas apontam para o próximo salto).${poison ? ' Está ligado o **poisoned reverse**.' : ''}` }));
      } else {
        rows.push(['t = 0', ...xs.map(cell)]);
        steps.push(snap({ line: 1, sfx: 'tick', say: `t = 0: cada nó só conhece as suas ligações. Quem é vizinho de **${d}** começa com o custo dessa ligação; os outros com ∞.` }));
      }

      let asked = 0, sawLoop = loops().size > 0;
      if (change) {
        const k = key(change.a, change.b), was = c(change.a, change.b), now = change.c === null || change.c === undefined ? INF : +change.c;
        if (now === INF) gone[k] = true; else ecost[k] = now;
        const ends = [change.a, change.b].filter(x => x !== d), res = {};
        ends.forEach(x => { res[x] = best(x, adv); });
        ends.forEach(x => { D[x] = res[x].b; via[x] = res[x].bv; });
        rows.push(['muda', ...xs.map(cell)]);
        const goodNews = now < was;
        const lp = loops(); sawLoop = lp.size > 0;
        steps.push(snap({ line: 10, sfx: goodNews ? 'up' : 'bad', es: { [k]: now === INF ? 'gone' : 'chg' },
          ask: ends.length ? vecAsk(`A ligação ${change.a}–${change.b} ${now === INF ? 'falhou' : `passou de ${was} para ${now}`}. ${list(ends)} nota${ends.length > 1 ? 'm' : ''} logo e recalcula${ends.length > 1 ? 'm' : ''} com os últimos vetores que recebeu. Que D fica?`, ends.map(x => [x, res[x].b])) : null,
          say: `A ligação **${change.a}–${change.b}** ${now === INF ? '**falhou**' : `passou de ${was} para **${now}**`}${goodNews ? ' (boa notícia)' : ' (má notícia)'}. ${list(ends)} nota${ends.length > 1 ? 'm' : ''} logo e recalcula${ends.length > 1 ? 'm' : ''} com os vetores que já tinha${ends.length > 1 ? 'm' : ''}: ${ends.map(x => formula(x, res[x])).join('; ')}.`
            + (sawLoop ? ` ⚠ Agora há um **ciclo**: ${[...lp].map(e => e.replace('|', '–')).join(', ')}. Usou-se um caminho que passava pela própria ligação que mudou.` : ''),
          tb: [table([[rows.length - 1, -1]])] }));
      }

      let r = 0, converged = false;
      while (r < maxRounds) {
        r++;
        const pk = []; g.nodes.forEach(x => nbs(x).forEach(v => { pk.push([x, v, fmt(adv(x, v))]); }));
        steps.push(snap({ line: [2, 3, 4], sfx: 'send', pk,
          say: `Ronda ${r}: cada nó envia o seu D aos vizinhos${poison ? ' (com poisoned reverse, a quem é o seu próximo salto anuncia ∞)' : ''}.` }));
        const res = round(), changed = xs.filter(x => res[x].b !== D[x] || res[x].bv !== via[x]);
        const ask = asked < asks ? vecAsk(`Ronda ${r}: com os valores que recebeu, que D calcula cada nó?`, xs.map(x => [x, res[x].b])) : null;
        if (ask) asked++;
        if (!changed.length) {
          rows.push([`ronda ${r}`, ...xs.map(cell)]);
          steps.push(snap({ line: 9, sfx: 'done', ask,
            say: change && r === 1 ? 'Ronda 1: mais ninguém mudou de valor. A rede **estabilizou** logo a seguir à mudança.'
              : `Ronda ${r}: ninguém mudou de valor. **Convergiu**${change ? ` ${r - 1} ronda${r - 1 === 1 ? '' : 's'} depois da mudança` : ` em ${r - 1} ronda${r - 1 === 1 ? '' : 's'}`}.`,
            tb: [table([[rows.length - 1, -1]])] }));
          converged = true; break;
        }
        changed.forEach((x, i) => {
          const before = D[x], down = res[x].b < before; D[x] = res[x].b; via[x] = res[x].bv;
          const last = i === changed.length - 1; if (last) rows.push([`ronda ${r}`, ...xs.map(cell)]);
          const lp = loops(), fresh = lp.size > 0 && !sawLoop; if (lp.size) sawLoop = true;
          const es = {}; nbs(x).forEach(v => { const k = key(x, v); es[k] = lp.has(k) ? 'loop' : v === res[x].bv ? 'win' : 'look'; });
          steps.push(snap({ line: [5, 6, 7, 8], sfx: fresh ? 'bad' : down ? 'up' : 'down', ask: i === 0 ? ask : null, ns: { [x]: 'cur' }, es,
            say: `**${x}**: ${formula(x, res[x])} (antes: ${fmt(before)}).`
              + (fresh ? ` ⚠ **Ciclo**: ${[...lp].map(e => e.replace('|', '–')).join(', ')}. Os pacotes para ${d} ficam presos a saltar entre eles, e os D sobem aos poucos: é a **contagem até ao infinito**.` : '')
              + (last && changed.length < xs.length ? ` Os outros nós calcularam o mesmo que já tinham.` : ''),
            tb: [table(last ? [[rows.length - 1, -1]] : [])] }));
        });
      }
      const fwd = { t: `Próximo salto de cada nó para ${d}`, h: ['Nó', 'Custo', 'Próximo salto'], r: xs.map(x => [x, fmt(D[x]), via[x] || '–']) };
      steps.push(snap({ line: 9, sfx: converged ? 'done' : 'bad', tb: [table(), fwd],
        say: converged
          ? `Cada nó guarda só o **próximo salto** (a seta) e o custo. Ninguém conhece o caminho inteiro: é isso que distingue o vetor-distância do estado da ligação.${sawLoop && !poison ? ' Experimenta o mesmo cenário com **poisoned reverse** para comparar.' : ''}`
          : `Não convergiu em ${maxRounds} rondas: sem caminho alternativo, os D sobem para sempre. O RIP corta isto com ∞ = 16.` }));
      return steps;
    },
  });
})();
