/* ===== RC graph lab: routing algorithms, animated, with a problem generator =====
   Engine: src/engine/graph.js (graphs, generator), graph-algos.js (dijkstra, dv), app-graph.js (player, lab screen).
   Each kind's make(GRAPH, rnd, opts) builds a fresh problem from the random generator rnd (seeded).
   The examples are the networks from the T04 slides and from past exams. LS_TOPO and DV_TOPO come from route.js. */

// slides T04, "Dijkstra: exemplo" and "Bellman Ford: exemplo" (best path from / to R8)
const LAB_R8 = { n: { R1: [10, 10], R2: [140, 10], R4: [262, 10], R6: [390, 10], R3: [50, 190], R5: [190, 150], R7: [300, 120], R8: [390, 190] },
  e: [['R1', 'R2', 1], ['R1', 'R3', 4], ['R2', 'R3', 5], ['R2', 'R4', 4], ['R2', 'R5', 1], ['R4', 'R5', 2], ['R4', 'R7', 1], ['R4', 'R6', 4], ['R5', 'R8', 6], ['R3', 'R8', 4], ['R7', 'R8', 1], ['R6', 'R8', 2]] };
// slides T04, "Mudanças no custo da ligação": good news travel fast, bad news (4 → 60) count to infinity
const LAB_XYZ = { n: { x: [40, 170], y: [200, 30], z: [360, 170] }, e: [['x', 'y', 4], ['y', 'z', 1], ['x', 'z', 50]] };
const LAB_POISON = [{ id: 'poison', label: 'Poisoned reverse', title: 'Um nó anuncia ∞ ao vizinho por onde passa a sua rota' }];

// every node has a single shortest path to (or from) s: no ties to explain in a generated problem
const labUnique = (GR, spec, s) => { const w = GR.sssp(GR.make(spec), s).ways; return Object.keys(spec.n).every(v => w[v] === 1); };
const labRounds = steps => steps.filter(s => s.sfx === 'send').length;
const labLoops = steps => steps.some(s => Object.values(s.es || {}).includes('loop'));

STUDY.labs('rc', [{
  id: 'routing', title: 'Laboratório de encaminhamento', icon: 'route',
  desc: 'Dijkstra e vetor-distância animados, passo a passo, com o código ao lado. Vê a resolução ou faz tu; o gerador cria sempre redes novas.',
  meta: 'Dijkstra · vetor-distância · contagem até ao infinito',
  kinds: [
    { id: 'ls', label: 'Dijkstra',
      make(GR, r) {
        let src;
        const g = GR.until(r, rr => GR.generate(rr, { n: [5, 7], cost: [1, 8] }), spec => { src = r.pick(Object.keys(spec.n)); return labUnique(GR, spec, src); });
        return { title: `Dijkstra a partir de ${src}`, algo: 'dijkstra', g, p: { src },
          stmt: `Rede com encaminhamento por **estado da ligação**: todos os nós conhecem o mapa e os custos. Corre o algoritmo de Dijkstra a partir de **${src}**: em cada passo, que nó entra em N' e como ficam D(v) e p(v)? No fim, escreve a tabela de expedição de ${src}.` };
      } },
    { id: 'dv', label: 'Vetor-distância',
      make(GR, r) {
        let dest;
        const g = GR.until(r, rr => GR.generate(rr, { n: [4, 6], cost: [1, 7] }), spec => {
          dest = r.pick(Object.keys(spec.n));
          return labUnique(GR, spec, dest) && labRounds(GR.run('dv', spec, { dest })) >= 3;
        });
        return { title: `Vetor-distância até ${dest}`, algo: 'dv', g, p: { dest },
          stmt: `Rede com **vetor-distância**. Em t = 0 cada nó só conhece as suas ligações; depois, em cada ronda, todos enviam o seu D aos vizinhos e recalculam ao mesmo tempo, com a equação de Bellman-Ford. Calcula, ronda a ronda, a distância de cada nó até **${dest}** e o próximo salto, até convergir.` };
      } },
    { id: 'chg', label: 'Mudança de custo', opts: LAB_POISON,
      make(GR, r) {
        // a stable network, then one link changes: mostly bad news that makes a loop, sometimes good news
        const good = r() < 0.25;
        let best = null;
        for (let t = 0; t < 40 && !best; t++) {
          const spec = GR.generate(r, { n: [4, 6], cost: [1, 6] }), ids = Object.keys(spec.n), dest = r.pick(ids);
          if (!labUnique(GR, spec, dest)) continue;
          const g = GR.make(spec), D = GR.sssp(g, dest).D;
          const used = e => [[e.a, e.b], [e.b, e.a]].some(([x, v]) => x !== dest && e.c + D[v] === D[x]);
          const cands = r.shuffle(g.edges.filter(e => (good ? !used(e) : used(e))));
          for (const e of cands) {
            let c;
            if (good) { c = 1; if (c >= e.c) continue; }
            else if (r() < 0.35) { c = null; const rest = GR.make(GR.withCosts(spec, { [e.k]: null })); if (!GR.connected(rest)) continue; }
            else c = e.c + r.int(8, 18);
            const change = { a: e.a, b: e.b, c }, steps = GR.run('dv', spec, { dest, start: 'stable', change });
            const n = labRounds(steps);
            // good news must change some route (one round of updates at least); bad news must make a loop
            if (good ? n >= 2 : labLoops(steps) && n >= 3 && n <= 30) { best = { spec, dest, change, was: e.c }; break; }
          }
        }
        if (!best) return this.fallback;
        const { spec, dest, change, was } = best, what = change.c === null ? '**falha**' : `passa de ${was} para **${change.c}**`;
        return { title: `Mudança de custo, destino ${dest}`, algo: 'dv', g: spec, p: { dest, start: 'stable', change, asks: 2 },
          stmt: `Rede com **vetor-distância**, já estável (custos no desenho). A ligação **${change.a}–${change.b}** ${what}. Mostra, ronda a ronda, como mudam as distâncias até **${dest}** até a rede voltar a estabilizar. Forma-se algum ciclo? Liga o **poisoned reverse** e compara.` };
      },
      fallback: { title: 'Mudança de custo, destino x', algo: 'dv', g: LAB_XYZ, p: { dest: 'x', start: 'stable', change: { a: 'x', b: 'y', c: 60 }, asks: 2 },
        stmt: 'Rede com **vetor-distância**, estável. A ligação **x–y** passa de 4 para **60**. Mostra, ronda a ronda, como mudam as distâncias até **x**.' } },
  ],
  examples: [
    { id: 'r8-ls', label: 'Slides: Dijkstra a partir de R8', algo: 'dijkstra', g: LAB_R8, p: { src: 'R8' },
      stmt: 'O exemplo dos slides: qual o melhor caminho do router **R8** até cada um dos outros routers da rede? Há empates (R4 e R6 com 2, R3 e R5 com 4): a ordem entre eles não muda os custos.' },
    { id: 'r8-dv', label: 'Slides: Bellman-Ford até R8', algo: 'dv', g: LAB_R8, p: { dest: 'R8' },
      stmt: 'O mesmo exemplo, agora com vetor-distância: qual o melhor caminho de cada router até **R8**? Compara com o Dijkstra: os custos são os mesmos, mas aqui cada nó só fica a saber o próximo salto.' },
    { id: 'uz-ls', label: 'Slides: rede u…z', algo: 'dijkstra', g: LS_TOPO.topo, p: { src: 'u' },
      stmt: 'A rede de seis nós dos slides: Dijkstra a partir de **u**. Qual é o custo até z, e qual o próximo salto de u para lá?' },
    { id: 'xyz-bad', label: 'Slides: más notícias (4 → 60)', algo: 'dv', g: LAB_XYZ, opts: LAB_POISON,
      p: { dest: 'x', start: 'stable', change: { a: 'x', b: 'y', c: 60 }, asks: 2 },
      stmt: 'O exemplo dos slides: a ligação **x–y** passa de 4 para **60**. y passa a ir por z, e z ia por y: forma-se um ciclo e os D sobem 1 ou 2 por ronda. "As más notícias propagam-se devagar." Liga o **poisoned reverse** e compara.' },
    { id: 'xyz-good', label: 'Slides: boas notícias (4 → 1)', algo: 'dv', g: LAB_XYZ,
      p: { dest: 'x', start: 'stable', change: { a: 'x', b: 'y', c: 1 }, asks: 2 },
      stmt: 'A ligação **x–y** passa de 4 para **1**. y nota logo, avisa z, e em poucas rondas está tudo estável: "as boas notícias propagam-se depressa".' },
    { id: 'x2223', label: 'Exame 2022/23: falha de X–W', algo: 'dv', g: DV_TOPO.topo, opts: LAB_POISON,
      p: { dest: 'W', start: 'stable', change: { a: 'X', b: 'W', c: null }, asks: 2 },
      stmt: 'Exame 2022/23, Parte III.2.3: rede estável com vetor-distância, destino **W**. A ligação **X–W** falha. Que estimativa calcula X logo a seguir, e porque é um problema? Qual é o caminho final de X até W?' },
  ],
}]);
