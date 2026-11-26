/* ---------- DIAGRAM WORKSHOP ("Oficina de diagramas") ----------
   "Do texto ao diagrama": the exam asks to draw a diagram from a statement, so the student learns it in three turns,
   a day or more apart:
   1. Construir (stage 0): the statement is read decision by decision. Each part asks one decision (tap the concepts in the
      text, pick the relations, choose the multiplicities, the trigger of a transition…), and the diagram grows with every
      right answer. Each piece is tied to the sentence it comes from: tap a piece of the diagram and its sentence lights up.
   2. No papel (stage 1, the next day): the statement alone, drawn on paper with the test's time, then marked against the
      solution with a rubric (one line per decision: tenho / em parte / falta). BD_PASS or more finishes it; less goes
      back to Construir the next day.
   3. A finished exercise comes back once on paper, a week later.
   "Ver resolvido" (watch) plays the decisions one by one, answer and reason, as a worked example (no progress).
   Generic: a course supplies STUDY.builds(id, [{ id, t, skill, title, short, src, pts, min, ask, uod, d, given, parts, les,
   extra }]) and its render draws d with d.only (the ids shown so far) and d.hi (the ids just added), marking each piece
   with data-el. A part is { id, kind: 'spans' | 'pick' | 'one' | 'rows', ask, e, el, from, rub, pts, trap, why, … }:
     spans: tap in the statement the spans [[text|id]] that answer (ans: [ids], opt: ids that count either way)
     pick:  several options (o, a: [indexes], opt: indexes that count either way)
     one:   one option (o, a: index or [indexes accepted])
     rows:  one choice per row (rows: [{ lb, o, a }]), e.g. both multiplicities of an association
   el: the diagram ids the part adds; from: the sentence ids it reads; rub: its line in the paper rubric; why: the reason
   a wrong choice is wrong (by option index or span id).
   Progress: S.bld = { buildId: { stage, done, due, last, best } } (in the progress key extras as bd); a turn left half
   way is kept in S.bdCur for 3 days. A type (skill) is ready only when its builds (all but extra: true) are done. */
const BD_DAY = 864e5, BD_PASS = 0.75, BD_REVIEW = 7 * BD_DAY, BD_KEEP = 3 * BD_DAY;
const BD_STAGE = ['Construir', 'No papel'];
const bdAll = () => (C && C.builds) || [];
const bdById = id => bdAll().find(b => b.id === id);
const bdPartList = () => { const pt = partTopics(); return bdAll().filter(b => pt.includes(b.t)); };
const bdOfSkill = k => bdAll().filter(b => b.skill === k);
const bdNeed = k => bdOfSkill(k).filter(b => !b.extra);
const bdRecs = () => S.bld || (S.bld = {});
const bdDone = b => { const r = (S.bld || {})[b.id]; return !!(r && r.done); };
const bdTouched = b => !!(S.bld || {})[b.id];
const bdLater = ms => { const d = Math.ceil((ms - Date.now()) / BD_DAY); return d <= 1 ? 'amanhã' : `daqui a ${d} dias`; };
function bdStatus(b) {
  const r = (S.bld || {})[b.id], now = Date.now();
  if (!r) return { k: 'new', stage: 0, due: true, label: 'Por começar' };
  if (r.done) return r.due && r.due <= now ? { k: 'review', stage: 1, due: true, label: 'Revisão no papel' } : { k: 'done', stage: 1, due: false, label: r.due ? `Pronto · revisão ${bdLater(r.due)}` : 'Pronto' };
  const s = r.stage | 0;
  return r.due && r.due > now ? { k: 'wait', stage: s, due: false, label: `${BD_STAGE[s]} ${bdLater(r.due)}` } : { k: 'next', stage: s, due: true, label: `A seguir: ${BD_STAGE[s]}` };
}
// minutes: building goes about a minute a decision; paper is the test's own time plus marking it
const bdMin = (b, stage) => stage ? (b.min || 10) + 4 : Math.max(5, Math.round(b.parts.length * 1.1 + 2));
const bdLabel = (b, st) => st.k === 'review' ? `Rever no papel: ${b.short || b.title}` : st.stage ? `No papel: ${b.short || b.title}` : `Construir: ${b.short || b.title}`;
const bdSaved = b => { const K = S.bdCur; return K && K.id === b.id && Date.now() - K.at < BD_KEEP ? K : null; };
// The plan's task for a type: its first build still to do whose turn is due (paper waits without paper).
function bdTaskFor(k, w, np) {
  for (const b of bdNeed(k)) {
    if (bdDone(b) && bdStatus(b).k !== 'review') continue;
    const st = bdStatus(b); if (!st.due) return null;   // the next turn of this one comes another day: the next build waits for it
    if (np && st.stage) return null;
    return { key: `bd:${b.id}:${st.k === 'review' ? 'r' : st.stage}`, kind: 'build', skill: k, w, id: b.id, label: bdLabel(b, st),
      why: st.stage ? 'Sozinho, com o tempo do teste. Depois corriges com a grelha.' : 'Decides peça a peça e o diagrama cresce. No dia seguinte fazes no papel.', min: bdMin(b, st.stage), fq: 0, fl: 0 };
  }
  return null;
}
// work still ahead in a type's builds, in minutes (for the pace): every turn not done yet
const bdWorkLeft = k => bdNeed(k).reduce((a, b) => { if (bdDone(b)) return a; const s = bdStatus(b).stage; return a + (s ? 0 : bdMin(b, 0)) + bdMin(b, 1); }, 0);

function bdStart(id, planKey, mode) {
  const b = bdById(id); if (!b) return;
  const st = bdStatus(b), m = mode || (st.stage ? 'paper' : 'guided');
  go('build', { bd: id, mode: m, review: st.k === 'review', planKey: planKey || null });
}
const bdLessonBtn = lesId => bdAll().filter(b => (b.les || []).includes(lesId)).map(b => `<button class="btn small anim-btn" data-bd="watch" data-k="${esc(b.id)}">▶ Ver como se constrói: ${esc(b.short || b.title)}</button>`).join('');
function bdWatch(id) { const b = bdById(id); if (!b) return; GPLAYER.overlay({ title: `Ver resolvido: ${b.short || b.title}`, mount: el => BUILD.mount(el, b, 'watch', {}) }); }

const BUILD = (() => {
  // statement sentences: [[text|id]] marks a span; **bold** works too
  const spanRe = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  const spansOf = b => { const m = new Map(); (b.uod || []).forEach(s => { if (s.t) for (const x of s.t.matchAll(spanRe)) m.set(x[2], { t: x[1], s: s.id }); }); return m; };
  const acc = a => Array.isArray(a) ? a : [a];
  const answers = p => p.kind === 'spans' ? p.ans : p.kind === 'pick' ? p.a : p.kind === 'one' ? acc(p.a) : p.rows.map(r => acc(r.a)[0]);

  function mount(root, b, mode, opts) {
    const SP = spansOf(b), now = Date.now();
    const st = { mode, i: 0, phase: mode === 'paper' ? 'draw' : 'work', res: b.parts.map(() => ({ state: 'todo', tries: 0, sel: [], msg: '', bad: [] })),
      marks: b.parts.map(() => null), t0: now, trace: null, hi: [], timer: null, uodOpen: true };
    // the same turn left half way: carry on where it stopped
    const K = mode !== 'watch' && bdSaved(b);
    if (K && K.mode === mode && K.res && K.res.length === b.parts.length) {
      K.res.forEach(([state, tries, sel], j) => Object.assign(st.res[j], { state, tries, sel }));
      st.i = Math.min(K.i, b.parts.length - 1); st.phase = K.phase || st.phase; if (K.marks) st.marks = K.marks; st.t0 = now - Math.max(0, (K.at || now) - (K.t0 || now));
      if (st.phase === 'fb' && st.res[st.i].state === 'todo') st.phase = 'work';
    }
    const keep = () => { if (mode === 'watch' || st.phase === 'end') return; S.bdCur = { id: b.id, mode, i: st.i, phase: st.phase, marks: st.marks, t0: st.t0, at: Date.now(), key: opts.planKey || null, res: st.res.map(x => [x.state, x.tries, x.sel]) }; save(); };
    const shown = () => { const s = new Set(b.given || []);
      b.parts.forEach((p, j) => { const done = mode === 'watch' ? j <= st.i && st.phase !== 'work' || j < st.i : st.res[j].state !== 'todo'; if (done) (p.el || []).forEach(x => s.add(x)); }); return [...s]; };
    // which sentences light up: the current decision's, or the ones a tapped piece comes from
    const elFrom = id => { const out = new Set(); b.parts.forEach(p => { if ((p.el || []).some(x => x === id || x.split(':')[0] === id)) (p.from || []).forEach(s => out.add(s)); }); return out; };
    const resolvedSpans = () => { const s = new Set(); b.parts.forEach((p, j) => { if (p.kind === 'spans' && (st.res[j].state !== 'todo' || (mode === 'watch' && (j < st.i || st.phase !== 'work')))) p.ans.forEach(x => s.add(x)); }); return s; };

    function uod() {
      const p = b.parts[st.i], live = mode !== 'paper' && st.phase === 'work' && p && p.kind === 'spans', sel = new Set(live ? st.res[st.i].sel : []);
      const lit = st.trace ? elFrom(st.trace) : new Set(mode === 'paper' || !p ? [] : p.from || []), done = resolvedSpans(), bad = new Set(live ? st.res[st.i].bad : []);
      const line = s => {
        if (s.h) return `<li class="bd-h">${esc(s.h)}</li>`;
        let h = esc(s.t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        h = h.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, t, id) => live ? `<button type="button" class="bd-sp${sel.has(id) ? ' on' : ''}${bad.has(id) ? ' bad' : ''}" data-b="span" data-k="${id}" aria-pressed="${sel.has(id)}">${t}</button>`
          : done.has(id) && mode !== 'paper' ? `<mark class="bd-sp ok">${t}</mark>` : t);
        return `<li class="${lit.has(s.id) ? 'lit' : ''}"${s.n ? ` data-n="${esc(s.n)}"` : ''}>${h}</li>`;
      };
      return `<details class="card bd-uod" ${st.uodOpen ? 'open' : ''} data-b="uod"><summary><span class="eyebrow">${esc(b.src || 'Enunciado')}${b.pts ? ` · ${String(b.pts).replace('.', ',')} valores` : ''}</span></summary>
        ${b.ask ? `<p class="bd-ask">${md(b.ask)}</p>` : ''}<ol class="bd-text">${(b.uod || []).map(line).join('')}</ol>
        ${st.trace ? `<p class="muted bd-tr">A peça que tocaste vem das frases em destaque. <button class="btn ghost small" data-b="untrace">Limpar</button></p>` : ''}</details>`;
    }
    function diagram(all) {
      const d = all ? Object.assign({}, b.d, { hi: [] }) : Object.assign({}, b.d, { only: shown(), hi: st.hi });
      return `<div class="diagram bd-dg">${renderD(d)}</div><p class="muted bd-cap">${all ? 'A solução. Toca numa peça para ver de que frase vem.' : 'O teu diagrama até agora. Toca numa peça para ver de que frase vem.'}</p>`;
    }
    const dots = () => `<span class="pb-dots" aria-hidden="true">${b.parts.map((p, j) => { const s = st.res[j].state; return `<i class="${mode === 'watch' ? (j < st.i ? 'clean' : j === st.i ? 'cur' : '') : s === 'todo' ? (j === st.i ? 'cur' : '') : s}"></i>`; }).join('')}</span>`;

    function control(p, x, fixed) {
      const ans = new Set(answers(p).map(String)), sel = new Set((fixed ? answers(p) : x.sel).map(String)), bad = new Set(x.bad.map(String));
      if (p.kind === 'spans') return `<p class="muted bd-how">${fixed ? 'No texto ficam marcados os que contam.' : `Toca no enunciado, aqui em baixo, em cada um. ${sel.size ? `Marcaste ${sel.size}.` : ''}`}</p>`;
      if (p.kind === 'rows') return `<div class="bd-rows">${p.rows.map((r, j) => `<div class="bd-row"><span class="bd-rl">${md(r.lb)}</span><span class="seg">${r.o.map((o, k) => { const on = fixed ? acc(r.a)[0] === k : x.sel[j] === k;
          return `<button data-b="row" data-r="${j}" data-k="${k}" aria-pressed="${on}" class="${fixed && on ? 'ok' : !fixed && on && bad.has(String(j)) ? 'bad' : ''}" ${fixed ? 'disabled' : ''}>${esc(o)}</button>`; }).join('')}</span></div>`).join('')}</div>`;
      return `<div class="bd-opts ${p.kind}">${p.o.map((o, k) => { const on = sel.has(String(k)), cls = fixed ? (ans.has(String(k)) ? 'ok' : '') : on && bad.has(String(k)) ? 'bad' : on ? 'on' : '';
        return `<button class="bd-opt ${cls}" data-b="opt" data-k="${k}" aria-pressed="${on}" ${fixed ? 'disabled' : ''}>${p.kind === 'pick' ? `<span class="bx">${on ? '✓' : ''}</span>` : ''}<span>${md(o, true)}</span></button>`; }).join('')}</div>`;
    }
    function step() {
      const p = b.parts[st.i], x = st.res[st.i], n = b.parts.length;
      const head = `<div class="row bd-sh"><span class="eyebrow">Decisão ${st.i + 1} de ${n}${p.phase ? ` · ${esc(p.phase)}` : ''}</span><span class="spacer"></span>${dots()}</div>`;
      if (mode === 'watch') {
        return `<article class="card bd-step">${head}<h3 class="bd-q">${md(p.ask)}</h3>${control(p, x, true)}<div class="bd-fb ok"><p>${md(p.e || '')}</p></div>
          <div class="row"><button class="btn" data-b="prev" ${st.i ? '' : 'disabled'}>← Anterior</button>${st.i < n - 1 ? `<button class="btn primary" data-b="wnext">Seguinte →</button>` : '<span class="muted">Fim: é este o diagrama completo.</span>'}</div></article>`;
      }
      if (st.phase === 'fb') {
        const tag = x.state === 'clean' ? '✓ À primeira' : x.state === 'helped' ? '✓ Certo' : 'Resposta';
        return `<article class="card bd-step">${head}<h3 class="bd-q">${md(p.ask)}</h3>${control(p, x, true)}<div class="bd-fb ${x.state === 'revealed' ? 'rev' : 'ok'}"><b>${tag}.</b> ${md(p.e || '')}</div>
          <div class="row"><button class="btn primary" data-b="next" id="bdNext">${st.i < n - 1 ? 'Seguinte →' : 'Ver o diagrama completo →'}</button></div></article>`;
      }
      const need = p.kind === 'rows' ? x.sel.filter(v => v !== undefined && v !== null).length < p.rows.length : p.kind === 'one' ? false : !x.sel.length;
      return `<article class="card bd-step">${head}<h3 class="bd-q">${md(p.ask)}</h3>${control(p, x, false)}
        ${x.msg ? `<div class="bd-fb bad">${md(x.msg)}</div>` : ''}
        <div class="row">${p.kind === 'one' ? '' : `<button class="btn primary" data-b="check" ${need ? 'disabled' : ''}>Verificar</button>`}${x.tries ? `<button class="btn ghost small" data-b="reveal">Ver a resposta</button>` : ''}<span class="spacer"></span><span class="muted" style="font-size:12.5px">${x.tries ? `${x.tries} tentativa${x.tries === 1 ? '' : 's'}` : ''}</span></div></article>`;
    }
    function endGuided() {
      const clean = st.res.filter(x => x.state === 'clean').length, n = b.parts.length, np = noPaper();
      return `<article class="card bd-step bd-end"><span class="eyebrow">Volta 1 feita</span><h2>${clean} de ${n} decisões à primeira</h2>
        <p>O diagrama está completo ao lado. A seguir vem a <b>volta 2</b>: o mesmo enunciado, sem ajudas, desenhado <b>no papel</b> com o tempo do teste${b.min ? ` (${b.min} min)` : ''}, e corriges com a grelha. Fica para amanhã, para a memória ter de trabalhar.</p>
        <div class="row">${opts.planKey ? planNextBtn(true) : ''}<button class="btn" data-b="paperNow"${np ? ' disabled title="Estás em Sem papel"' : ''}>Fazer já no papel</button><button class="btn" data-b="exit">${opts.planKey ? 'Início' : 'Voltar à oficina'}</button></div></article>`;
    }
    function paper() {
      const pts = b.parts.reduce((a, p) => a + (p.pts || 1), 0);
      if (st.phase === 'draw') {
        const sec = Math.floor((Date.now() - st.t0) / 1000), lim = (b.min || 10) * 60;
        return `<article class="card bd-step"><span class="eyebrow">${opts.review ? 'Revisão · sem ajudas' : 'Volta 2 · no papel'}</span><h2 style="margin:6px 0">Desenha sozinho</h2>
          <p>Lê o enunciado acima e desenha o diagrama numa folha, como no teste. Sem olhar para a volta 1. Quando acabares, corriges peça a peça com a grelha.</p>
          <p class="bd-timer mono" id="bdTimer">${fmtT(sec)} <span class="muted">/ ${b.min || 10} min sugeridos</span></p>
          <div class="row"><button class="btn primary" data-b="toMark">Já desenhei: corrigir →</button><button class="btn ghost small" data-b="watch">Não sei por onde começar: ver resolvido</button></div></article>`;
      }
      const marked = st.marks.filter(v => v !== null).length;
      if (st.phase === 'mark') {
        const rows = b.parts.map((p, j) => { const v = st.marks[j];
          const btn = (val, t) => `<button data-b="mark" data-r="${j}" data-k="${val}" aria-pressed="${v === val}" class="${v === val ? (val === 1 ? 'ok' : val === 0 ? 'bad' : 'half') : ''}">${t}</button>`;
          return `<li class="bd-rub"><div><b>${md(p.rub || p.ask)}</b>${p.trap ? `<span class="muted bd-trap">${md(p.trap)}</span>` : ''}</div><span class="seg">${btn(1, 'Tenho')}${btn(0.5, 'Em parte')}${btn(0, 'Falta')}</span></li>`; }).join('');
        return `<article class="card bd-step"><span class="eyebrow">Corrigir com a grelha · ${String(pts).replace('.', ',')} pontos</span><h2 style="margin:6px 0">Compara o teu desenho com a solução</h2>
          <p class="muted">Para cada linha: tens isto no teu diagrama, com o tipo certo? Sê exigente: no teste conta o que está desenhado.</p>
          <ol class="bd-rubric">${rows}</ol>
          <div class="row"><button class="btn primary" data-b="grade" ${marked < b.parts.length ? 'disabled' : ''}>Ver a nota (${marked}/${b.parts.length})</button></div></article>`;
      }
      return st.endHtml;
    }
    const fmtT = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    function render() {
      let main;
      if (mode === 'paper') main = paper();
      else if (st.phase === 'end') main = endGuided();
      else main = step();
      const showAll = mode === 'paper' ? st.phase !== 'draw' : st.phase === 'end';
      const right = mode === 'paper' && st.phase === 'draw' ? '' : diagram(showAll);
      // the decision comes first (the statement is long); on paper, the statement first, as in the test
      const left = mode === 'paper' && st.phase === 'draw' ? uod() + main : main + uod();
      root.innerHTML = `<div class="bd ${right ? '' : 'solo'}${mode === 'paper' && st.phase === 'draw' ? ' paper' : ''}"><section class="bd-left">${left}</section>${right ? `<section class="bd-right">${right}</section>` : ''}</div>`;
      const f = root.querySelector('#bdNext'); if (f && st.focusNext) { f.focus({ preventScroll: true }); st.focusNext = false; }
    }
    function resolve(state) {
      const p = b.parts[st.i], x = st.res[st.i]; x.state = state; x.msg = ''; x.bad = [];
      if (state === 'revealed') x.sel = answers(p).slice();
      st.hi = (p.el || []).slice(); st.phase = 'fb'; st.trace = null; st.focusNext = true; keep(); render();
    }
    function check() {
      const p = b.parts[st.i], x = st.res[st.i]; let ok, msg = '';
      if (p.kind === 'one') { ok = acc(p.a).includes(x.sel[0]); if (!ok) { msg = (p.why && p.why[x.sel[0]]) || 'Não é essa.'; x.bad = [x.sel[0]]; } }
      else if (p.kind === 'rows') { x.bad = p.rows.map((r, j) => acc(r.a).includes(x.sel[j]) ? null : j).filter(j => j !== null); ok = !x.bad.length;
        if (!ok) msg = x.bad.map(j => { const r = p.rows[j], w = r.why && r.why[x.sel[j]]; return w ? `**${r.lb}**: ${w}` : null; }).filter(Boolean).join('\n') || (x.bad.length === 1 ? 'Há uma linha errada (a vermelho).' : `Há ${x.bad.length} linhas erradas (a vermelho).`); }
      else {
        const A = new Set(answers(p).map(String)), O = new Set((p.opt || []).map(String)), S_ = new Set(x.sel.map(String));
        const extra = [...S_].filter(v => !A.has(v) && !O.has(v)), miss = [...A].filter(v => !S_.has(v)); ok = !extra.length && !miss.length; x.bad = extra;
        if (!ok) { const name = v => p.kind === 'spans' ? `“${(SP.get(v) || { t: v }).t}”` : `“${p.o[+v]}”`;
          const lines = extra.map(v => `${name(v)}: ${(p.why && p.why[v]) || 'não conta aqui.'}`);
          if (miss.length) lines.push(`${extra.length ? 'E falta' : 'Falta'}${miss.length > 1 ? 'm' : ''} ${miss.length}${p.kind === 'spans' ? ' no texto' : ''}.`);
          msg = lines.join('\n'); }
      }
      if (ok) { resolve(x.tries ? 'helped' : 'clean'); return; }
      x.tries++; x.msg = msg; keep(); render();
    }
    function nextPart() {
      if (st.i < b.parts.length - 1) { st.i++; st.phase = 'work'; st.hi = []; keep(); render(); root.querySelector('.bd-step').scrollIntoView({ block: 'nearest' }); return; }
      // the end of Construir: the next turn is on paper, tomorrow
      const R = bdRecs(), r = R[b.id] || (R[b.id] = { stage: 0, done: false, due: 0, last: 0, best: 0 });
      if (!r.done) { r.stage = 1; r.due = Date.now() + BD_DAY; } r.last = Date.now();
      S.bdCur = null; st.phase = 'end'; st.hi = [];
      planLog(opts.planKey, Date.now() - st.t0, b.parts.length, 0, true); save(); render(); window.scrollTo(0, 0);
    }
    function grade() {
      const tot = b.parts.reduce((a, p) => a + (p.pts || 1), 0), got = b.parts.reduce((a, p, j) => a + (p.pts || 1) * (st.marks[j] || 0), 0), pct = tot ? got / tot : 0;
      const R = bdRecs(), r = R[b.id] || (R[b.id] = { stage: 1, done: false, due: 0, last: 0, best: 0 }), pass = pct >= BD_PASS, now = Date.now();
      r.last = now; r.best = Math.max(r.best || 0, Math.round(pct * 100));
      let next;
      if (pass) { const wasReview = opts.review; r.done = true; r.stage = 1; r.due = wasReview ? 0 : now + BD_REVIEW; next = wasReview ? 'Ficou. Não volta mais.' : 'Volta uma vez daqui a uma semana, no papel, para ficar.'; }
      else { r.done = false; r.stage = 0; r.due = now + BD_DAY; next = 'Amanhã voltas a construí-lo peça a peça, e depois outra vez no papel.'; }
      const weak = b.parts.filter((p, j) => (st.marks[j] || 0) < 1);
      const val = b.pts ? ` · ${String(Math.round(pct * b.pts * 10) / 10).replace('.', ',')} de ${String(b.pts).replace('.', ',')} valores` : '';
      st.endHtml = `<article class="card bd-step bd-end"><span class="eyebrow">${pass ? 'Passou' : 'Ainda não'}</span><h2>${Math.round(pct * 100)}%${val}</h2>
        <p>${pass ? 'Desenhaste-o sozinho.' : `Abaixo de ${Math.round(BD_PASS * 100)}%.`} ${next}</p>
        ${weak.length ? `<p class="muted" style="margin-top:8px">O que te faltou:</p><ul class="bd-weak">${weak.map(p => `<li>${md(p.rub || p.ask)}${p.e ? `<span class="muted"> ${md(p.e)}</span>` : ''}</li>`).join('')}</ul>` : ''}
        <div class="row">${opts.planKey ? planNextBtn(true) : ''}<button class="btn" data-b="watch">Ver resolvido</button><button class="btn" data-b="exit">${opts.planKey ? 'Início' : 'Voltar à oficina'}</button></div></article>`;
      S.bdCur = null; st.phase = 'end';
      planLog(opts.planKey, Date.now() - st.t0, b.parts.length, 0, true); save(); render(); window.scrollTo(0, 0);
    }
    function onClick(ev) {
      const el = ev.target.closest('[data-el]');
      if (el && root.contains(el) && el.closest('.bd-dg')) { st.trace = el.dataset.el; st.uodOpen = true; render(); const u = root.querySelector('.bd-uod .lit'); if (u) u.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
      const t = ev.target.closest('[data-b]'); if (!t || !root.contains(t)) return;
      const a = t.dataset.b, p = b.parts[st.i], x = st.res[st.i];
      switch (a) {
        case 'uod': return;   // the <details> toggles itself; remembered on toggle below
        case 'span': if (st.phase !== 'work') return; { const k = t.dataset.k, i = x.sel.indexOf(k); if (i < 0) x.sel.push(k); else x.sel.splice(i, 1); x.bad = x.bad.filter(v => v !== k); keep(); render(); } return;
        case 'opt': if (st.phase !== 'work') return; { const k = +t.dataset.k;
          if (p.kind === 'one') { x.sel = [k]; check(); return; }
          const i = x.sel.indexOf(k); if (i < 0) x.sel.push(k); else x.sel.splice(i, 1); x.bad = x.bad.filter(v => +v !== k); keep(); render(); } return;
        case 'row': if (st.phase !== 'work') return; { const r = +t.dataset.r; x.sel[r] = +t.dataset.k; x.bad = x.bad.filter(v => v !== r); keep(); render(); } return;
        case 'check': check(); return;
        case 'reveal': resolve('revealed'); return;
        case 'next': nextPart(); return;
        case 'wnext': st.i++; st.phase = 'fb'; st.hi = (b.parts[st.i].el || []).slice(); render(); return;
        case 'prev': st.i = Math.max(0, st.i - 1); st.phase = 'fb'; st.hi = (b.parts[st.i].el || []).slice(); render(); return;
        case 'untrace': st.trace = null; render(); return;
        case 'toMark': st.phase = 'mark'; st.uodOpen = false; keep(); render(); window.scrollTo(0, 0); return;
        case 'mark': st.marks[+t.dataset.r] = +t.dataset.k; keep(); render(); return;
        case 'grade': grade(); return;
        case 'watch': bdWatch(b.id); return;
        case 'paperNow': if (opts.onPaper) opts.onPaper(); return;
        case 'exit': if (opts.onExit) opts.onExit(); return;
      }
    }
    const onToggle = ev => { if (ev.target.classList && ev.target.classList.contains('bd-uod')) st.uodOpen = ev.target.open; };
    root.addEventListener('click', onClick); root.addEventListener('toggle', onToggle, true);
    if (mode === 'watch') { st.phase = 'fb'; st.hi = (b.parts[0].el || []).slice(); }
    if (mode === 'paper') st.timer = setInterval(() => { const e = root.querySelector('#bdTimer'); if (e && st.phase === 'draw') e.firstChild.nodeValue = fmtT(Math.floor((Date.now() - st.t0) / 1000)) + ' '; }, 1000);
    render();
    return { mode, destroy() { root.removeEventListener('click', onClick); root.removeEventListener('toggle', onToggle, true); if (st.timer) clearInterval(st.timer); keep(); } };
  }
  return { mount, spansOf };
})();

/* ---------- screens: the workshop list (view 'builds') and one exercise (view 'build') ---------- */
let bdCtl = null;
function BuildList() {
  const L = bdPartList(), byT = {}; L.forEach(b => (byT[b.t] = byT[b.t] || []).push(b));
  const done = L.filter(bdDone).length;
  const card = b => { const s = bdStatus(b), r = (S.bld || {})[b.id], T = TOPICS[b.t];
    const go_ = s.k === 'done' ? `<button class="btn small" data-bd="open" data-k="${esc(b.id)}" data-m="paper">Outra vez no papel</button>` : `<button class="btn small primary" data-bd="open" data-k="${esc(b.id)}">${s.stage ? 'No papel' : 'Construir'}${s.due ? '' : ' já'}</button>`;
    return `<div class="pb-type" style="--c:${T.c}"><div class="pb-type-main"><b>${esc(b.title)}</b><p class="muted">${esc(b.src || '')}${b.extra ? ' · extra' : ''}</p>
      <span class="meta"><span class="pb-dots">${[0, 1].map(k => `<i class="${r && (r.done || (r.stage | 0) > k) ? 'clean' : s.stage === k && s.k !== 'done' ? 'cur' : ''}"></i>`).join('')}</span>${esc(s.label)}${r && r.best ? ` · melhor no papel ${r.best}%` : ''}</span></div>
      <div class="row" style="gap:6px;justify-content:flex-end">${go_}<button class="btn ghost small" data-bd="watch" data-k="${esc(b.id)}">Ver resolvido</button></div></div>`; };
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">Oficina de diagramas</span><span class="spacer"></span><span class="mono muted">${done}/${L.length} prontos</span></div>
    <section class="card bd-intro"><h2 style="margin-bottom:6px">Do texto ao diagrama, em três voltas</h2>
      <ol><li><b>Construir.</b> Lês o enunciado e decides peça a peça: tocas no texto nos conceitos, escolhes relações, multiplicidades e transições. O diagrama cresce a cada acerto e cada peça fica ligada à frase de onde vem.</li>
      <li><b>No papel</b>, no dia seguinte. Desenhas sozinho, com o tempo do teste, e corriges com a grelha da solução. Com ${Math.round(BD_PASS * 100)}% passa; abaixo disso, voltas a construir.</li>
      <li><b>Revisão</b>, uma semana depois: outra vez no papel, sem ajudas.</li></ol>
      <p class="muted">As voltas entram no plano Hoje. Um tipo de diagrama só fica pronto quando passaste os seus exercícios no papel.</p></section>
    ${Object.entries(TOPICS).filter(([k]) => byT[k]).map(([k, T]) => `<div class="section"><div class="section-h"><h2>${esc(T.label)}</h2></div><div class="pb-list">${byT[k].map(card).join('')}</div></div>`).join('')}`;
}
function BuildScreen() { const b = bdById(view.bd); if (!b) return '<p>Exercício não encontrado.</p>';
  const T = TOPICS[b.t], mode = view.mode;
  return `<div class="qhead"><button class="btn small" data-bd="back" aria-label="Voltar">←</button><span class="badge" style="--c:${T.c}"><span class="sw"></span>${esc(T.short)}</span><span class="badge">${mode === 'paper' ? (view.review ? 'Revisão no papel' : 'Volta 2 · no papel') : 'Volta 1 · construir'}</span><b class="bd-title">${esc(b.title)}</b></div><div id="bdRoot"></div>`; }
function afterBuildRender() {
  const el = document.getElementById('bdRoot'), b = bdById(view.bd); if (!el || !b) return;
  if (bdCtl) bdCtl.destroy();
  bdCtl = BUILD.mount(el, b, view.mode, { planKey: view.planKey, review: view.review,
    onExit: () => { const k = view.planKey; bdCtl.destroy(); bdCtl = null; go(k ? 'home' : 'builds'); },
    onPaper: () => { bdCtl.destroy(); bdCtl = null; go('build', { bd: b.id, mode: 'paper', planKey: view.planKey }); } });
}
// leaving the screen any other way (top bar, back button) keeps the turn where it stopped
const bdLeave = () => { if (bdCtl && view.name !== 'build') { bdCtl.destroy(); bdCtl = null; } };
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-bd]'); if (!b) return;
  switch (b.dataset.bd) {
    case 'open': bdStart(b.dataset.k, null, b.dataset.m); break;
    case 'watch': bdWatch(b.dataset.k); break;
    case 'back': { const k = view.planKey; if (bdCtl) { bdCtl.destroy(); bdCtl = null; } go(k ? 'home' : 'builds'); break; }
  }
});
