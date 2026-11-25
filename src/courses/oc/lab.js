/* ===== OC lab: reorder code for the pipeline, by dragging =====
   The student drags the lines of a piece of RISC-V code into a new order and presses "Verificar". A small model of
   the 5-stage pipeline (OCPIPE, below) answers everything, for any order, with nothing written per problem:
   - valid? Every pair of instructions that depend on each other keeps its order: one reads a register the other
     writes (either way), both write it, both touch memory and one is a store (unless they provably hit different
     words: same base 4 or more bytes apart, or different bases when the problem says they never overlap,
     `alias: false`), or the branch that closes a loop. With `consts`, an `addi r, r, k` may cross a lw / sw that uses r as
     its base: the offset is adjusted, as the exams allow ("podendo alterar constantes").
   - how many cycles, and why each bubble is there (which instruction waits for which register, from whom);
   - the best order (every valid order is tried: the code is short), hints, and the solution after the tries run out.
   Pipeline rules (the course's): F D X M W, one instruction per stage, the register file is written and read in the
   same cycle. Forwarding paths: AA = ALU-ALU (EX/MEM → X), MA = MEM-ALU (MEM/WB → X), AM = ALU-MEM and MM = MEM-MEM
   (MEM/WB → M, the data a store writes), D = into D for a branch resolved there ('full' has them all).
   A branch resolved in stage S fetches the target the cycle after S. A loop's iteration runs from its first fetch to
   the next iteration's first fetch; a piece without a branch, from the first F to the last W.
   Problem: { title, stmt, lines: ['lw t1, 0(t0)', ...], cfg: { fwd: 'full' | 'none' | ['AA', ...], br: 'D' | 'X',
   consts: bool, alias: bool } }. The lab plugs into the engine's lab screen through `mount` (app-graph.js). */
// the engine's helpers live in its own scope: the lab escapes its own text
const ocEsc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const OCPIPE = (() => {
  const ABI = { zero: 0, ra: 1, sp: 2, gp: 3, tp: 4, t0: 5, t1: 6, t2: 7, s0: 8, fp: 8, s1: 9, a0: 10, a1: 11, a2: 12, a3: 13,
    a4: 14, a5: 15, a6: 16, a7: 17, s2: 18, s3: 19, s4: 20, s5: 21, s6: 22, s7: 23, s8: 24, s9: 25, s10: 26, s11: 27, t3: 28, t4: 29, t5: 30, t6: 31 };
  const regNo = s => { s = String(s).trim(); if (/^x\d+$/.test(s)) return +s.slice(1); if (s in ABI) return ABI[s]; throw new Error('registo? ' + s); };
  const LOAD = ['lw', 'lh', 'lb', 'lhu', 'lbu'], STORE = ['sw', 'sh', 'sb'], BR = ['beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'];
  const R3 = ['add', 'sub', 'and', 'or', 'xor', 'sll', 'srl', 'sra', 'slt', 'sltu', 'mul', 'div', 'rem'];
  const I2 = ['addi', 'andi', 'ori', 'xori', 'slli', 'srli', 'srai', 'slti', 'sltiu'];
  // one line → { text, op, rd, src: [{ r, role: 'src' | 'base' | 'data' }], base, off, mem: 'L' | 'S', br, imm }
  function parse(line, i) {
    let t = String(line).replace(/#.*/, '').trim(), label = '';
    const m0 = t.match(/^(\w+):\s*(.*)$/); if (m0) { label = m0[1]; t = m0[2]; }
    const op = t.split(/\s+/)[0], args = t.slice(op.length).split(',').map(s => s.trim()).filter(Boolean);
    const I = { i, op, label, text: t, rd: null, src: [], mem: null, br: false };
    const memArg = s => { const m = s.match(/^(-?\d+)\((\w+)\)$/); if (!m) throw new Error('endereço? ' + s); return { off: +m[1], base: regNo(m[2]) }; };
    if (LOAD.includes(op)) { I.rd = regNo(args[0]); Object.assign(I, memArg(args[1])); I.mem = 'L'; I.src.push({ r: I.base, role: 'base' }); }
    else if (STORE.includes(op)) { Object.assign(I, memArg(args[1])); I.mem = 'S'; I.src.push({ r: regNo(args[0]), role: 'data' }, { r: I.base, role: 'base' }); }
    else if (BR.includes(op)) { I.br = true; I.src.push({ r: regNo(args[0]), role: 'src' }, { r: regNo(args[1]), role: 'src' }); I.target = args[2]; }
    // the exams write shifts by a constant as sll / srl too
    else if (R3.includes(op) && /^-?\d+$/.test(args[2] || '')) { I.rd = regNo(args[0]); I.src.push({ r: regNo(args[1]), role: 'src' }); I.imm = +args[2]; }
    else if (R3.includes(op)) { I.rd = regNo(args[0]); I.src.push({ r: regNo(args[1]), role: 'src' }, { r: regNo(args[2]), role: 'src' }); }
    else if (I2.includes(op)) { I.rd = regNo(args[0]); I.src.push({ r: regNo(args[1]), role: 'src' }); I.imm = +args[2]; }
    else if (op === 'lui' || op === 'li') { I.rd = regNo(args[0]); }
    else if (op === 'mv') { I.rd = regNo(args[0]); I.src.push({ r: regNo(args[1]), role: 'src' }); }
    else if (op === 'nop') { /* nothing */ }
    else throw new Error('instrução? ' + op);
    if (I.rd === 0) I.rd = null; I.src = I.src.filter(s => s.r !== 0);
    I.regs = String(line).replace(/#.*/, '').replace(/^\s*\w+:/, '').trim().split(/[\s,()]+/).slice(1);
    return I;
  }
  const NAMES = Object.fromEntries(Object.entries(ABI).map(([k, v]) => [v, k]));
  const FWD_ALL = ['AA', 'MA', 'AM', 'MM', 'D'];
  const paths = cfg => cfg.fwd === 'full' ? FWD_ALL : cfg.fwd === 'none' || !cfg.fwd ? [] : cfg.fwd;
  const isBaseAddi = (a, r) => a.op === 'addi' && a.rd === r && a.src.length === 1 && a.src[0].r === r;

  // Everything about one problem: its instructions, the dependences that fix an order, the original order's cycles.
  const cache = new Map();
  function analyze(P) {
    const key = JSON.stringify([P.lines, P.cfg]); if (cache.has(key)) return cache.get(key);
    if (cache.size > 40) cache.clear();
    const X = analyze1(P); cache.set(key, X); return X;
  }
  function analyze1(P) {
    const cfg = Object.assign({ fwd: 'full', br: 'X', consts: false }, P.cfg || {});
    const ins = P.lines.map(parse), n = ins.length, label = ins[0].label;
    // the name a register was written with, for the messages
    ins.forEach(I => { I.name = {}; const toks = I.regs.filter(s => /^(x\d+|[a-z]+\d*)$/.test(s) && (s in ABI || /^x\d+$/.test(s)));
      toks.forEach(s => { I.name[regNo(s)] = s; }); });
    const nameOf = r => { for (const I of ins) if (I.name[r]) return I.name[r]; return NAMES[r] || 'x' + r; };
    // effective offset of each memory access from its base's value at the start (addi r, r, k before it shifts it)
    const known = {}, shift = {};
    ins.forEach(I => { if (I.mem) { I.eff = known[I.base] === false ? null : I.off + (shift[I.base] || 0); }
      if (I.rd !== null) { if (isBaseAddi(I, I.rd) && known[I.rd] !== false) shift[I.rd] = (shift[I.rd] || 0) + I.imm; else known[I.rd] = false; } });
    const reads = (I, exempt) => I.src.filter(s => !(exempt && s.role === 'base' && exempt(s.r))).map(s => s.r);
    const edges = [];   // { a, b (original indexes, a before b), why, r }
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const A = ins[a], B = ins[b];
      // an addi r, r, k and a memory access with base r may swap if constants can change (the offset is adjusted)
      const ex = cfg.consts ? r => (isBaseAddi(A, r) && B.mem && B.base === r) || (isBaseAddi(B, r) && A.mem && A.base === r) : null;
      const rA = reads(A, ex), rB = reads(B, ex);
      if (B.br && b === n - 1) { edges.push({ a, b, why: 'br' }); continue; }
      if (A.rd !== null && rB.includes(A.rd)) { edges.push({ a, b, why: 'raw', r: A.rd }); continue; }
      if (B.rd !== null && rA.includes(B.rd)) { edges.push({ a, b, why: 'war', r: B.rd }); continue; }
      if (A.rd !== null && A.rd === B.rd) { edges.push({ a, b, why: 'waw', r: A.rd }); continue; }
      if (A.mem && B.mem && (A.mem === 'S' || B.mem === 'S')) {
        const apart = A.base === B.base ? A.eff !== null && B.eff !== null && Math.abs(A.eff - B.eff) >= 4 : cfg.alias === false;
        if (!apart) edges.push({ a, b, why: 'mem' });
      }
    }
    const X = { P, cfg, ins, n, label, edges, nameOf, has: new Set(paths(cfg)) };
    X.orig = [...Array(n).keys()];
    X.simOrig = sim(X, X.orig);
    X.best = best(X);
    return X;
  }
  // the first dependence an order breaks, or null
  function broken(X, order) {
    const pos = []; order.forEach((k, i) => { pos[k] = i; });
    return X.edges.find(e => pos[e.a] > pos[e.b]) || null;
  }
  // the text of an instruction in a new order: a memory access whose base addi moved gets its offset adjusted
  function textIn(X, order, k) {
    const I = X.ins[k]; if (!I.mem || !X.cfg.consts || I.eff === null) return I.text;
    let s = 0; for (const j of order) { if (j === k) break; const J = X.ins[j]; if (isBaseAddi(J, I.base)) s += J.imm; }
    const off = I.eff - s; return off === I.off ? I.text : I.text.replace(/-?\d+\((\w+)\)/, `${off}($1)`);
  }
  // One instruction's timing, given the ones before it in this order (T): its F, D, X, M, W and, if it waits, why.
  function step(X, order, T, i) {
    const cfg = X.cfg, has = X.has, k = order[i], I = X.ins[k], prev = T[i - 1];
    const F = i ? prev.D : 1, D = i ? Math.max(F + 1, prev.X) : 2, lb = Math.max(D + 1, i ? prev.X + 1 : 3);
    // the latest earlier instruction (in this order) that writes each register read
    const need = I.src.map(s => { let p = null; for (let j = i - 1; j >= 0; j--) if (X.ins[order[j]].rd === s.r) { p = j; break; } return p === null ? null : { s, p }; }).filter(Boolean);
    const ok = (x, { s, p }) => {
      const Pq = T[p], load = X.ins[order[p]].mem === 'L';
      if (x >= Pq.W + 1) return true;                                     // from the register file, read in D
      if (I.br && cfg.br === 'D') return has.has('D') && x - 1 >= (load ? Pq.M : Pq.X) + 1;   // forwarded into D
      if ((has.has('AA') && !load && x === Pq.M) || (has.has('MA') && x === Pq.W)) return true;   // into X
      if (s.role === 'data') return (has.has('AM') && !load && x + 1 === Pq.W) || (has.has('MM') && load && x + 1 === Pq.W);   // into M
      return false;
    };
    let x = lb; while (!need.every(d => ok(x, d))) x++;
    const row = { k, F, D, X: x, M: x + 1, W: x + 2 };
    if (x > lb) row.stall = { k, n: x - lb, why: need.filter(d => !ok(lb, d)).map(d => ({ r: d.s.r, from: order[d.p], load: X.ins[order[d.p]].mem === 'L' })) };
    return row;
  }
  // how the cycles are counted from the last instruction's timing (see the top of the file); `extra` more instructions
  // after it would each add at least one cycle, which bounds the search below
  function count(X, last, loop, extra = 0) {
    const x = last.X + extra, br = X.cfg.br;
    if (!loop) return x + 2;
    return (br === 'D' ? x - 1 : br === 'M' ? x + 1 : br === 'W' ? x + 2 : x);
  }
  // cycle by cycle: F, D, X of each instruction, the cycles, and the bubbles with their reason
  function sim(X, order) {
    const T = []; order.forEach((k, i) => T.push(step(X, order, T, i)));
    const stalls = T.filter(t => t.stall).map(t => t.stall), last = T[T.length - 1], loop = X.ins[order[order.length - 1]].br;
    const cycles = count(X, last, loop), next = loop ? cycles + 1 : null;
    const bubbles = stalls.reduce((a, s) => a + s.n, 0);
    return { T, stalls, bubbles, cycles, loop, next, penalty: loop ? cycles - X.n - bubbles : 0 };
  }
  // The best order: a search over the valid orders (the linear extensions of the dependences), timing as it goes and
  // dropping a partial order as soon as even its best finish can't beat the best found. The original order is tried
  // first, so the search starts from its cycles.
  function best(X) {
    const n = X.n, pre = [...Array(n)].map(() => []); X.edges.forEach(e => pre[e.b].push(e.a));
    const loop = X.ins[n - 1].br; let bestO = null, bestC = Infinity, nodes = 0;
    const cur = [], T = [], used = Array(n).fill(false);
    (function rec() {
      if (++nodes > 200000) return;
      if (cur.length === n) { const c = count(X, T[n - 1], loop); if (c < bestC) { bestC = c; bestO = cur.slice(); } return; }
      for (let k = 0; k < n; k++) if (!used[k] && pre[k].every(a => used[a])) {
        cur.push(k); const t = step(X, cur, T, cur.length - 1);
        if (count(X, t, loop, n - cur.length) < bestC) { used[k] = true; T.push(t); rec(); T.pop(); used[k] = false; }
        cur.pop();
      }
    })();
    return { order: bestO, cycles: bestC };
  }
  // one move that helps most from this order: [instruction, the one it goes before], or null
  function oneMove(X, order) {
    const c0 = sim(X, order).cycles; let bestM = null, bc = c0;
    for (let from = 0; from < order.length; from++) for (let to = 0; to < order.length; to++) {
      if (to === from || to === from + 1) continue;
      const o = order.slice(); const [k] = o.splice(from, 1); o.splice(to > from ? to - 1 : to, 0, k);
      if (broken(X, o)) continue; const c = sim(X, o).cycles;
      if (c < bc) { bc = c; bestM = { k, before: order[to] === undefined ? null : order[to], c }; }
    }
    return bestM;
  }
  // the pipeline diagram of an order (OC's own renderer), with the next iteration's fetch for a loop
  function diagram(X, order) {
    const S = sim(X, order), rows = S.T.map(t => [textIn(X, order, t.k), '.'.repeat(t.F - 1) + 'F' + '-'.repeat(t.D - t.F - 1) + 'D' + '-'.repeat(t.X - t.D - 1) + 'XMW']);
    if (S.loop) rows.push([`${X.ins[order[0]].text}  (seguinte)`, '.'.repeat(S.next - 1) + 'F']);
    return OCD.render({ pipe: rows });
  }
  return { parse, analyze, broken, textIn, sim, best, oneMove, diagram, paths };
})();

/* ---------- words: what a broken dependence or a bubble means, for any code ---------- */
const OCL = {
  c: s => `<code class="mono">${ocEsc(s)}</code>`,
  broke(X, e, order) {
    const A = OCL.c(OCPIPE.textIn(X, order, e.a)), B = OCL.c(OCPIPE.textIn(X, order, e.b)), r = e.r !== undefined ? OCL.c(X.nameOf(e.r)) : '';
    if (e.why === 'br') return `O ${B} fecha a iteração: tem de ficar em último, e nada passa para depois dele.`;
    if (e.why === 'raw') return `O ${B} usa o ${r} que o ${A} escreve: tem de ficar depois dele.`;
    if (e.why === 'war') return `O ${A} lê o ${r} antes de o ${B} o mudar. Com o ${B} acima, lia o valor novo.`;
    if (e.why === 'waw') return `O ${A} e o ${B} escrevem os dois o ${r}: trocados, fica no fim o valor errado.`;
    return `O ${A} e o ${B} podem tocar na mesma palavra de memória: a ordem entre eles tem de ficar.`;
  },
  stalls(X, order) {
    const S = OCPIPE.sim(X, order);
    return S.stalls.map(s => { const w = s.why[0], from = OCL.c(OCPIPE.textIn(X, order, w.from)), me = OCL.c(OCPIPE.textIn(X, order, s.k));
      return `<li><b>${s.n} bolha${s.n === 1 ? '' : 's'}</b>: o ${me} espera pelo ${OCL.c(X.nameOf(w.r))} do ${from}${w.load && OCPIPE.paths(X.cfg).length ? ' (load-use)' : ''}.</li>`; }).join('');
  },
  cfg(X) {
    const f = X.cfg.fwd === 'full' ? 'Forwarding completo' : X.cfg.fwd === 'none' || !X.cfg.fwd ? 'Sem forwarding' : `Só forwarding ${X.cfg.fwd.map(p => ({ AA: 'ALU-ALU', MA: 'MEM-ALU', AM: 'ALU-MEM', MM: 'MEM-MEM', D: 'para D' }[p])).join(', ')}`;
    const loop = X.ins[X.n - 1].br;
    return [f, loop ? `saltos resolvidos em ${X.cfg.br}, sem predição` : '', X.cfg.consts ? 'podes mudar offsets' : 'sem mudar constantes'].filter(Boolean).join(' · ');
  },
};

/* ---------- the player: drag the lines, Verificar, hints, tries ---------- */
const OC_TRIES = 3;
function ocReorderMount(root, cfg) {
  const X = OCPIPE.analyze(cfg), st = { order: X.orig.slice(), tries: 0, hints: 0, done: false, shown: false };
  const fixed = k => X.ins[k].br && k === X.n - 1;
  root.innerHTML = `<div class="rq">
    <p class="rq-cfg">${ocEsc(OCL.cfg(X))}. Original: <b>${X.simOrig.cycles} ciclos</b>${X.simOrig.loop ? ' por iteração' : ''}.</p>
    <ol class="rq-list" aria-label="Código: arrasta as linhas para as reordenar"></ol>
    <div class="row rq-act"><button class="btn primary" data-rq="check">Verificar</button><button class="btn" data-rq="hint">Pista</button><button class="btn ghost" data-rq="reset">Repor</button>
      <span class="spacer"></span><span class="mono muted rq-tries"></span></div>
    <div class="rq-fb" aria-live="polite"></div></div>`;
  const list = root.querySelector('.rq-list'), fb = root.querySelector('.rq-fb');
  const draw = () => {
    list.innerHTML = st.order.map((k, i) => `<li class="rq-row${fixed(k) ? ' fixed' : ''}" data-k="${k}">
      <span class="rq-grip" aria-hidden="true">${fixed(k) ? '' : '⋮⋮'}</span>${X.label ? `<span class="rq-lbl mono">${i === 0 ? ocEsc(X.label) + ':' : ''}</span>` : ''}
      <code class="mono rq-code">${ocEsc(OCPIPE.textIn(X, st.order, k))}</code>
      <span class="rq-mv">${fixed(k) ? '<span class="muted rq-last">fica em último</span>' : `<button class="btn ghost small" data-rq="up" data-k="${k}" aria-label="Subir">↑</button><button class="btn ghost small" data-rq="down" data-k="${k}" aria-label="Descer">↓</button>`}</span></li>`).join('');
    root.querySelector('.rq-tries').textContent = `Tentativas: ${Math.min(st.tries, OC_TRIES)} de ${OC_TRIES}`;
  };
  const say = (html, cls) => { fb.className = 'rq-fb' + (cls ? ' ' + cls : ''); fb.innerHTML = html; };
  const mark = (ks, cls) => list.querySelectorAll('.rq-row').forEach(li => li.classList.toggle(cls, ks.includes(+li.dataset.k)));
  const nextBtn = () => cfg.onNew ? '<button class="btn" data-rq="new">Outro problema ↻</button>' : '';
  const solution = () => { st.shown = true; const B = X.best;
    say(`<p><b>Uma solução com ${B.cycles} ciclos</b> (o mínimo):</p><ol class="rq-sol mono">${B.order.map(k => `<li>${ocEsc(OCPIPE.textIn(X, B.order, k))}</li>`).join('')}</ol>
      <div class="diagram">${OCPIPE.diagram(X, B.order)}</div>${B.order.length && OCPIPE.sim(X, B.order).stalls.length ? `<ul class="rq-why">${OCL.stalls(X, B.order)}</ul>` : '<p>Sem bolhas de dados.</p>'}<div class="row">${nextBtn()}</div>`, 'sol'); };
  function check() {
    mark([], 'bad'); const e = OCPIPE.broken(X, st.order);
    if (e) { st.tries++; draw(); mark([e.a, e.b], 'bad');
      say(`<p class="bad"><b>Esta ordem muda o que o código faz.</b></p><p>${OCL.broke(X, e, st.order)}</p>${st.tries >= OC_TRIES && !st.shown ? '<div class="row"><button class="btn" data-rq="sol">Ver uma solução</button></div>' : ''}`, 'ko'); return; }
    const S = OCPIPE.sim(X, st.order), opt = X.best.cycles, same = st.order.every((k, i) => k === i);
    if (same && S.cycles > opt) { say(`<p>É a ordem original: <b>${S.cycles} ciclos</b>. Arrasta as linhas (ou usa ↑ ↓) e verifica outra vez: dá para ${opt}.</p>`, 'hint'); return; }
    const body = `<div class="diagram">${OCPIPE.diagram(X, st.order)}</div>${S.stalls.length ? `<ul class="rq-why">${OCL.stalls(X, st.order)}</ul>` : '<p>Sem bolhas de dados.</p>'}${S.loop && S.penalty ? `<p class="muted">O salto custa sempre ${S.penalty} ciclo${S.penalty === 1 ? '' : 's'}: reordenar não o apaga.</p>` : ''}`;
    if (S.cycles <= opt) { st.done = true; say(`<p class="good"><b>✓ ${same ? 'Já estava no mínimo' : 'Ótimo'}: ${S.cycles} ciclos</b>${same ? '.' : `, o mínimo possível (o original tinha ${X.simOrig.cycles}).`}</p>${body}<div class="row">${nextBtn()}</div>`, 'ok'); return; }
    st.tries++; draw();
    say(`<p><b>Válida: ${S.cycles} ciclos.</b> ${S.cycles < X.simOrig.cycles ? `Melhor do que o original (${X.simOrig.cycles}), mas` : 'Ainda'} dá para ${opt}.</p>${body}${st.tries >= OC_TRIES && !st.shown ? '<div class="row"><button class="btn" data-rq="sol">Ver uma solução</button></div>' : ''}`, 'mid');
  }
  function hint() {
    st.hints++;
    const e = OCPIPE.broken(X, st.order);
    if (e) { mark([e.a, e.b], 'bad'); say(`<p><b>Pista:</b> antes de contar ciclos, a ordem tem de dar o mesmo resultado. ${OCL.broke(X, e, st.order)}</p>`, 'hint'); return; }
    const S = OCPIPE.sim(X, st.order);
    if (S.cycles <= X.best.cycles) { say(`<p><b>Pista:</b> esta ordem já tem o mínimo, ${S.cycles} ciclos. Carrega em Verificar.</p>`, 'hint'); return; }
    if (st.hints === 1 || !S.stalls.length) {
      say(`<p><b>Pista:</b> com esta ordem, ${S.cycles} ciclos. ${S.stalls.length ? 'As bolhas estão aqui:' : 'Não há bolhas de dados: o que sobra é o salto.'}</p>${S.stalls.length ? `<ul class="rq-why">${OCL.stalls(X, st.order)}</ul><p class="muted">Procura uma instrução que não dependa de nenhuma das duas para pôr entre elas.</p>` : ''}`, 'hint');
      return; }
    const M = OCPIPE.oneMove(X, st.order);
    if (M) { mark([M.k], 'tip');
      say(`<p><b>Pista:</b> experimenta pôr o ${OCL.c(OCPIPE.textIn(X, st.order, M.k))} ${M.before !== null ? `logo antes do ${OCL.c(OCPIPE.textIn(X, st.order, M.before))}` : 'no fim'}: fica com ${M.c} ciclos.</p>`, 'hint'); }
    else say(`<p><b>Pista:</b> nenhuma troca de uma só instrução ajuda daqui. Tenta mexer duas: afasta cada <code class="mono">lw</code> de quem usa o valor dele.</p>`, 'hint');
  }
  // drag: the row follows the pointer and swaps with its neighbours as it passes their middle (mouse and touch).
  // The moves are listened on the window, so a fast drag or a lost pointer capture still lands where it should.
  let drag = null;
  const rowsNow = () => [...list.querySelectorAll('.rq-row')];
  const mid = el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
  const follow = y => {
    const li = drag.li; li.style.transform = '';
    for (let guard = 0; guard < 20; guard++) {
      const prev = li.previousElementSibling, next = li.nextElementSibling;
      if (prev && y < mid(prev)) list.insertBefore(li, prev);
      else if (next && !next.classList.contains('fixed') && y > mid(next)) list.insertBefore(next, li);
      else break;
    }
    li.style.transform = `translateY(${Math.round(y - mid(li))}px)`;
  };
  const move = ev => { if (drag && ev.pointerId === drag.id) { ev.preventDefault(); follow(ev.clientY); } };
  const drop = ev => {
    if (!drag || ev.pointerId !== drag.id) return;
    drag.li.classList.remove('drag'); drag.li.style.transform = ''; drag = null;
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', drop); window.removeEventListener('pointercancel', drop);
    const o = rowsNow().map(li => +li.dataset.k); if (o.some((k, i) => k !== st.order[i])) { st.order = o; draw(); say(''); }
  };
  // a mouse drags from anywhere on the row; a finger only from the grip, so the page still scrolls over the code
  const down = ev => {
    const li = ev.target.closest('.rq-row'); if (!li || li.classList.contains('fixed') || ev.target.closest('button') || ev.button > 0) return;
    if (ev.pointerType !== 'mouse' && !ev.target.closest('.rq-grip')) return;
    ev.preventDefault(); try { li.setPointerCapture(ev.pointerId); } catch (e) { /* a synthetic or lost pointer: the window still hears it */ }
    drag = { li, id: ev.pointerId }; li.classList.add('drag');
    window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', drop); window.addEventListener('pointercancel', drop);
  };
  list.addEventListener('pointerdown', down);
  const click = ev => {
    const b = ev.target.closest('[data-rq]'); if (!b) return; const a = b.dataset.rq;
    if (a === 'up' || a === 'down') { const k = +b.dataset.k, i = st.order.indexOf(k), j = a === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= st.order.length || fixed(st.order[j])) return; [st.order[i], st.order[j]] = [st.order[j], st.order[i]]; draw(); say('');
      const nb = list.querySelector(`[data-rq="${a}"][data-k="${k}"]`); if (nb) nb.focus(); }
    else if (a === 'check') check();
    else if (a === 'hint') hint();
    else if (a === 'reset') { st.order = X.orig.slice(); draw(); say(''); }
    else if (a === 'sol') solution();
    else if (a === 'new' && cfg.onNew) cfg.onNew('play');
  };
  root.addEventListener('click', click);
  draw();
  return { get mode() { return 'play'; },
    destroy() { root.removeEventListener('click', click); list.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', drop); window.removeEventListener('pointercancel', drop); } };
}

/* ---------- problems: generated, and the ones from the lessons and the exams ---------- */
// A piece of code computing a few values from memory, written the naive way (each lw right before its use), so that
// reordering helps. loop: the body of a loop over arrays, closed by bne.
function ocReorderGen(r, loop) {
  const T = r.shuffle(['t0', 't1', 't2', 't3', 't4', 't5', 't6', 's1', 's2', 's3', 's4', 's5']);
  const base = loop ? 'a0' : r.pick(['a0', 's0']), dst = loop ? 'a1' : base, ops = ['add', 'sub', 'and', 'or', 'xor'];
  const nv = loop ? r.int(1, 2) : r.int(2, 3), loads = [], lines = []; let ti = 0, off = 0;
  const load = () => { const v = T[ti++]; loads.push(v); lines.push(`lw   ${v}, ${off}(${base})`); off += 4; return v; };
  let soff = loop ? 0 : 4 * (nv * 2 + 2);
  for (let c = 0; c < nv; c++) {
    const a = c && loads.length && r() < 0.5 ? r.pick(loads) : load(), b = load(), d = T[ti++];
    lines.push(`${r.pick(ops).padEnd(4)} ${d}, ${a}, ${b}`);
    if (r() < 0.5) { const e = T[ti++]; lines.push(`${r.pick(['add', 'sub']).padEnd(4)} ${e}, ${d}, ${r.pick(['s6', 's7'])}`); lines.push(`sw   ${e}, ${soff}(${dst})`); }
    else lines.push(`sw   ${d}, ${soff}(${dst})`);
    soff += 4;
  }
  if (loop) { lines.push(`addi a0, a0, ${off}`, `addi a1, a1, ${nv * 4}`, 'bne  a0, a2, Loop'); lines[0] = 'Loop: ' + lines[0]; }
  return lines;
}
// a generated loop reads a0 and writes a1, which the statement says never overlap (alias: false)
const OC_CFGS = [{ fwd: 'full', br: 'X', consts: true, alias: false }, { fwd: 'none', br: 'D', consts: true, alias: false }, { fwd: 'full', br: 'D', consts: true, alias: false }];
function ocReorderMake(GR, r, loop) {
  for (let t = 0; t < 80; t++) {
    const lines = ocReorderGen(r, loop), cfg = loop ? r.pick(OC_CFGS) : { fwd: r() < 0.7 ? 'full' : 'none', br: 'X', consts: true };
    const X = OCPIPE.analyze({ lines, cfg });
    if (X.n <= 9 && X.best.cycles < X.simOrig.cycles) return { title: loop ? 'Corpo de um ciclo' : 'Troço sem saltos', lines, cfg,
      stmt: loop ? 'Reordena o corpo do ciclo para cada iteração demorar o mínimo de ciclos, sem mudar o que o código faz. Os vetores em a0 e a1 não se sobrepõem.' : 'Reordena o troço para demorar o mínimo de ciclos, do F da 1.ª instrução ao W da última, sem mudar o que o código faz.' };
  }
  return ocReorderExamples[0];
}
const ocReorderExamples = [
  { id: 'aula', label: 'Aula: A = B + E; C = B + F', title: 'A = B + E; C = B + F', cfg: { fwd: 'full', br: 'X', consts: false },
    lines: ['lw  t1, 0(t0)', 'lw  t2, 4(t0)', 'add t3, t1, t2', 'sw  t3, 12(t0)', 'lw  t4, 8(t0)', 'add t5, t1, t4', 'sw  t5, 16(t0)'],
    stmt: 'O exemplo da lição: reordena para tirar as bolhas de load-use. Conta-se do F da 1.ª instrução ao W da última.' },
  { id: 'p2-2425', label: 'Exame P2 2024/25, 2.d', title: 'Exame P2 2024/25, 2.d', cfg: { fwd: 'none', br: 'D', consts: false },
    lines: ['Loop: lw   x1, 0(x5)', 'lw   x2, 0(x6)', 'add  x3, x1, x2', 'sw   x3, 0(x7)', 'addi x5, x5, 4', 'addi x6, x6, 4', 'addi x7, x7, 4', 'bne  x8, x7, Loop'],
    stmt: 'Melhora o ciclo só por reordenação, sem alterar instruções nem constantes.' },
  { id: 'map2-2425', label: 'MAP 2 2024/25, 3.d', title: 'MAP 2 2024/25, 3.d', cfg: { fwd: 'none', br: 'D', consts: false },
    lines: ['Loop: lw   s2, 0(s5)', 'add  s1, s1, s2', 'addi s5, s5, 4', 'bne  s5, s6, Loop'],
    stmt: 'Reorganiza o corpo do ciclo para o melhor desempenho.' },
  { id: 'e2-2223', label: 'Exame 2 2022/23, 3.d', title: 'Exame 2 2022/23, 3.d', cfg: { fwd: 'none', br: 'X', consts: true },
    lines: ['Loop: lw   x4, 8(x2)', 'sw   x4, 4(x2)', 'add  x6, x4, x6', 'addi x2, x2, -4', 'bne  x2, x1, Loop'],
    stmt: 'Reordena o corpo do ciclo para o melhor desempenho. Podes alterar constantes (os offsets acertam-se sozinhos).' },
];

STUDY.labs('oc', [{
  id: 'reorder', title: 'Reordenar no pipeline', icon: 'route',
  desc: 'Arrasta as linhas do código para tirar bolhas e carrega em Verificar: vês se a ordem é válida, os ciclos e o diagrama do pipeline. Com pistas e 3 tentativas.',
  meta: 'load-use · dependências · offsets',
  mount: ocReorderMount, exBtn: '▶ Reordenar este exemplo', practiceBtn: 'Praticar com um troço novo',
  les: { 'h-sched': { ex: 'aula', kind: 'line' } },
  kinds: [
    { id: 'line', label: 'Troço sem saltos', make: (GR, r) => ocReorderMake(GR, r, false) },
    { id: 'loop', label: 'Corpo de um ciclo', make: (GR, r) => ocReorderMake(GR, r, true) },
  ],
  examples: ocReorderExamples,
}]);
