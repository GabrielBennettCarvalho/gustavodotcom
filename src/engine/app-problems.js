/* ---------- KEY PROBLEMS ("Problemas-chave") ----------
   The big exam problems, solved by typing the key values. Generic: a course only supplies data with STUDY.problems.
   A type has stages (guided → half done → alone), each one a whole problem split into steps.
   Rules:
   - a step that is stuck never blocks: hint after hint, and in the end the answer;
   - a concept (step.c) done cleanly last time is filled in next time, so nobody repeats arithmetic they have shown they can do;
   - a clean first problem finishes the type; otherwise the next stage comes the next day;
   - a finished type comes back once, alone, as a review;
   - the end screen shows the whole worked solution, and the stage's final result (stage.sol: { t, d }) when it has one.
   Progress lives in S.prob = { t: { typeId: { stage, done, due, last: { stageId: ms } } }, con: { concept: 1 | 0 } }.
   A problem left half done (back button, closed tab, refresh) is kept in S.pbCur and picks up where it stopped. */
const PB_DAY = 864e5, PB_REVIEW = 7 * PB_DAY, PB_TOL = 0.011;
const PB_KIND = { guided: 'Guiado', half: 'Com mais ajuda', alone: 'Sozinho' };
let pb = null;   // the problem being solved

// in the order of the course's topics, whichever file each problem came from
const pbTypes = () => { const pt = partTopics(), ord = Object.keys(TOPICS); return (C.problems || []).filter(p => pt.includes(p.t)).map((p, i) => [ord.indexOf(p.t), i, p]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]); };
const pbType = id => (C.problems || []).find(p => p.id === id);
const pbLater = ms => { const d = Math.ceil((ms - Date.now()) / PB_DAY); return d <= 1 ? 'amanhã' : `daqui a ${d} dias`; };
// a finished type is reviewed with the problem seen longest ago
const pbOldest = (p, T) => p.stages.map((s, i) => [T.last[s.id] || 0, i]).sort((a, b) => a[0] - b[0])[0][1];
// a type can have several "alone" stages: the next one is the alone stage seen longest ago, so a retry gets new data
const pbAfter = (p, T, si) => { const n = si + 1; if (!p.stages[n] || !p.stages[n].alone) return Math.min(n, p.stages.length - 1);
  return p.stages.map((s, i) => [s.alone ? T.last[s.id] || 0 : Infinity, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1])[0][1]; };
// after a failed alone stage, back to the last stage that still has help
const pbHelp = (p, si) => { for (let i = si - 1; i >= 0; i--) if (!p.stages[i].alone) return i; return 0; };
function pbStatus(p) {
  const T = S.prob.t[p.id], now = Date.now();
  if (!T) return { k: 'new', label: 'Por começar', due: true, stage: 0 };
  if (T.done) return { k: T.due <= now ? 'review' : 'done', label: T.due <= now ? 'Revisão: sem ajudas' : `Pronto · revisão ${pbLater(T.due)}`, due: T.due <= now, stage: pbOldest(p, T) };
  return { k: T.due <= now ? 'next' : 'wait', label: T.due <= now ? `A seguir: ${PB_KIND[p.stages[T.stage].kind]}` : `Volta ${pbLater(T.due)}`, due: T.due <= now, stage: T.stage };
}

/* answers: a list is a vector, a list of lists is a matrix; "show" has the same shape and marks the cells already given */
const pbIsMat = a => Array.isArray(a[0]);
const pbRows = a => pbIsMat(a) ? a : [a];
const pbFlat = a => pbRows(a).flat();
const pbCells = s => { const v = pbFlat(s.ans), m = s.show ? pbFlat(s.show) : []; return v.map((x, i) => ({ v: x, shown: !!m[i] })); };
const pbNum = n => { const s = String(Math.round(n * 1e4) / 1e4); return s.replace('.', ',').replace('-', '−'); };
const pbText = a => pbIsMat(a) ? `[${a.map(r => r.map(pbNum).join('; ')).join(' / ')}]` : `(${a.map(pbNum).join('; ')})`;
// accepts 0,5 · 0.5 · −3 · 2/3
function pbParse(t) {
  const s = String(t).trim().replace(/[−–]/g, '-').replace(/\s/g, '').replace(',', '.'); if (!s) return null;
  if (/^-?\d*\.?\d+\/-?\d*\.?\d+$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : null; }
  return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? Number(s) : null;
}

// answered right at least once, and not waiting in the mistakes lists
const pbQDone = id => { const s = peek(id); return BYID[id] && s.c > 0 && !(s.w && s.box < TRAIN_CLEAR) && !(s.ew && s.eb < EXAM_CLEAR); };
function pbStart(id, planKey) {
  const p = pbType(id); if (!p) return; const st = pbStatus(p), si = st.stage, stage = p.stages[si];
  const review = st.k === 'review' || st.k === 'done', alone = !!stage.alone || review;
  const given = s => !alone && s.c && S.prob.con[s.c] === 1;
  const anyTodo = stage.steps.some(s => !given(s));
  // a step whose value the student already found in the multiple-choice questions of the same exam (step.qs) comes filled in
  const byQ = s => !alone && (s.qs || []).length > 0 && s.qs.every(pbQDone);
  const steps = stage.steps.map(s => ({ s, state: byQ(s) || (anyTodo && given(s)) ? 'given' : 'todo', byQ: byQ(s), wrong: 0, hints: 0, msg: '', marks: null,
    vals: pbCells(s).map(c => c.shown ? pbNum(c.v) : '') }));
  if (steps.every(x => x.state === 'given')) Object.assign(steps[steps.length - 1], { state: 'todo', byQ: false });   // always something to do
  pb = { p, si, stage, alone, review, steps, i: steps.findIndex(x => x.state === 'todo'), showing: false, stmtOpen: true, result: null, focus: null, lastCell: null, planKey: planKey || null, startedAt: Date.now() };
  // the same problem, left half done in the last 3 days: carry on from there, with the time already spent
  const K = pbSaved(p);
  if (K && K.si === si && K.st.length === steps.length) {
    K.st.forEach(([state, wrong, hints, vals], j) => Object.assign(steps[j], { state, wrong, hints, vals }));
    pb.i = Math.min(K.i, steps.length - 1); pb.planKey = planKey || K.key || null; pb.startedAt = Date.now() - Math.max(0, K.at - K.t0);
    if (pb.steps[pb.i].state !== 'todo') { const n = steps.findIndex(x => x.state === 'todo'); if (n < 0) { pbFinish(); return; } pb.i = n; }
  }
  go('problem');
}
const pbSaved = p => { const K = S.pbCur; return K && K.id === p.id && Date.now() - K.at < 3 * PB_DAY ? K : null; };
function pbKeep() {
  if (!pb || pb.result) return;
  S.pbCur = { id: pb.p.id, si: pb.si, i: pb.i, key: pb.planKey, t0: pb.startedAt, at: Date.now(), st: pb.steps.map(x => [x.state, x.wrong, x.hints, x.vals]) };
  save();
}
function pbAdvance() {
  const n = pb.steps.findIndex(x => x.state === 'todo');
  if (n < 0) { pbFinish(); return; }
  pb.i = n; pb.showing = false; pb.focus = 'next';
  if (window.matchMedia('(max-width:700px)').matches) pb.stmtOpen = false;   // on a phone the statement folds, to keep the step in sight
  renderView();
}
function pbDoneStep(x, state) { x.state = state; x.marks = null; x.msg = ''; if (state === 'clean') pbAdvance(); else { pb.showing = true; pb.focus = 'cont'; renderView(); } }
function pbCheck() {
  if (!pb || pb.showing) return; const x = pb.steps[pb.i], s = x.s, cells = pbCells(s), vals = x.vals.map(pbParse), tol = s.tol || PB_TOL;
  if (cells.some((c, i) => !c.shown && vals[i] === null)) { x.msg = 'Preenche todas as caixas com números. Aceita vírgula, ponto e frações (2/3).'; x.marks = null; pb.focus = 'empty'; renderView(); return; }
  const got = cells.map((c, i) => c.shown ? c.v : vals[i]);
  x.marks = cells.map((c, i) => Math.abs(got[i] - c.v) <= tol);
  if (x.marks.every(Boolean)) { pbDoneStep(x, x.wrong || x.hints ? 'helped' : 'clean'); return; }
  x.wrong++;
  const miss = (s.miss || []).find(m => pbFlat(m.v).every((v, i) => Math.abs(v - got[i]) <= tol));
  const typed = cells.filter(c => !c.shown).length, right = x.marks.filter((ok, i) => ok && !cells[i].shown).length;
  x.msg = miss ? miss.m : typed > 1 ? `Ainda não: ${right} de ${typed} valores certos.` : 'Ainda não.';
  pb.focus = 'bad'; renderView();
}
function pbReveal() { const x = pb.steps[pb.i]; x.vals = pbCells(x.s).map(c => pbNum(c.v)); pbDoneStep(x, 'revealed'); }
function pbHint() {
  if (!pb || pb.showing) return; const x = pb.steps[pb.i], n = (x.s.hints || []).length;
  if (pb.alone || x.hints >= n) { pbReveal(); return; }
  x.hints++; renderView();
}
function pbSign() {
  if (!pb) return; const a = document.activeElement, i = a && a.dataset && a.dataset.act === 'pval' ? +a.dataset.c : pb.lastCell; if (i === null) return;
  const el = document.querySelector(`input.pb-cell[data-c="${i}"]`); if (!el) return;
  el.value = /^[−-]/.test(el.value) ? el.value.slice(1) : '−' + el.value; pb.steps[pb.i].vals[i] = el.value; el.focus();
}
const pbWorth = x => x.state === 'revealed' ? 0 : x.state === 'helped' ? (x.wrong + x.hints <= 1 ? 0.5 : 0.25) : 1;
function pbFinish() {
  const typed = pb.steps.filter(x => x.state !== 'given'), now = Date.now();
  const heavy = typed.some(x => x.state === 'revealed' || x.wrong + x.hints > 2), clean = typed.every(x => x.state === 'clean');
  const frac = pb.steps.reduce((a, x) => a + pbWorth(x), 0) / pb.steps.length;
  const marks = pb.stage.pts ? Math.round(frac * pb.stage.pts * 2) / 2 : null;
  const xp = typed.reduce((a, x) => a + (x.state === 'clean' ? 10 : x.state === 'helped' ? 4 : 0), 0) + (clean ? 20 : 0);
  S.xp += xp;
  const cons = {}; typed.forEach(x => { if (x.s.c) cons[x.s.c] = cons[x.s.c] !== 0 && x.state === 'clean' ? 1 : 0; }); Object.assign(S.prob.con, cons);
  const T = S.prob.t[pb.p.id] || (S.prob.t[pb.p.id] = { stage: 0, done: false, due: 0, last: {} }), N = pb.p.stages.length;
  T.last[pb.stage.id] = now;
  let next;
  if (pb.review) {
    if (clean) { T.done = true; T.due = now + 3 * PB_REVIEW; next = 'Continua a saber. Só volta daqui a 3 semanas.'; }
    else { T.done = false; T.stage = Math.min(1, N - 1); T.due = now + PB_DAY; next = 'Vale a pena mais uma volta: amanhã há um problema com mais ajuda.'; }
  } else if (clean && (pb.si === 0 || pb.stage.alone || pb.si === N - 1)) { T.done = true; T.due = now + PB_REVIEW; next = 'Este tipo está pronto. Volta uma vez daqui a uma semana, sem ajudas.'; }
  else if (clean) { T.stage = pbAfter(pb.p, T, pb.si); T.due = now + PB_DAY; next = 'Amanhã, o último: sem pistas, como no exame.'; }
  else if (pb.stage.alone || pb.si === N - 1) { T.stage = pbHelp(pb.p, pb.si); T.due = now + PB_DAY; next = 'Amanhã há outro com mais ajuda, e depois tentas sozinho outra vez.'; }
  else { T.stage = pbAfter(pb.p, T, pb.si); T.due = now + PB_DAY; next = heavy ? 'Amanhã há outro parecido, com mais ajuda onde precisaste.' : 'Amanhã há outro parecido, e já não repetes o que fizeste bem.'; }
  planLog(pb.planKey || 'pb:' + pb.p.id, now - pb.startedAt, pb.steps.length, pbNominal(pb.p));
  S.pbCur = null; S.rounds++; save();
  pb.result = { frac, marks, xp, clean, heavy, next, more: !T.done };
  go('problem');
}

/* ---------- views ---------- */
function ProblemPick() {
  const list = pbTypes().map(p => { const st = pbStatus(p), T = S.prob.t[p.id];
    const dots = p.stages.map((s, i) => `<i class="${T && T.last[s.id] ? 'ok' : !T ? (i ? '' : 'cur') : !T.done && i === T.stage ? 'cur' : ''}" title="${esc(PB_KIND[s.kind])}"></i>`).join('');
    const half = pbSaved(p) && pbSaved(p).si === st.stage;
    const go_ = half ? 'Continuar' : st.k === 'new' ? 'Começar' : st.k === 'wait' ? 'Fazer já' : st.k === 'done' ? 'Refazer' : 'Continuar';
    return `<div class="pb-type" style="--c:${TOPICS[p.t].c}"><div class="pb-type-main"><h3>${esc(p.title)}</h3><p class="muted">${esc(p.sub || '')}</p><span class="meta"><span class="pb-dots" aria-hidden="true">${dots}</span>${half ? `A meio, no passo ${pbSaved(p).i + 1} de ${pbSaved(p).st.length}` : esc(st.label)} · ${esc(p.time || '5 a 8 min')}</span></div>
      <button class="btn ${st.due ? 'primary' : ''}" data-act="pbGo" data-k="${esc(p.id)}">${go_} →</button></div>`; }).join('');
  return `<div class="qhead">${BACK}<span class="eyebrow">Problemas-chave</span></div>
    <p class="muted" style="font-size:13.5px;margin-bottom:12px">Os grandes problemas do exame, feitos por ti. Escreves só os valores que importam, pedes pistas quando encravares, e o que já mostraste que sabes passa a vir feito. Se resolveres à primeira, fica pronto.</p>
    <div class="stack">${list}</div>`;
}
function Problem() {
  if (!pb) return ProblemPick();
  if (pb.result) return pbResults();
  const T = TOPICS[pb.p.t], x = pb.steps[pb.i], S_ = pb.stage, typed = pb.steps.filter(y => y.state !== 'given'), k = typed.indexOf(x) + 1;
  const prog = `<div class="progress" aria-hidden="true">${typed.map(y => `<i class="${y.state === 'clean' ? 'ok' : y.state === 'helped' || y.state === 'revealed' ? 'sk' : y === x ? 'cur' : ''}"></i>`).join('')}</div>`;
  const head = `<div class="qhead"><button class="btn small" data-act="pbQuit" aria-label="Sair do problema">←</button><span class="badge" style="--c:${T.c}"><span class="sw"></span>${T.short}</span><span class="badge kind">${pb.review ? 'Revisão' : PB_KIND[S_.kind]}</span>${prog}<span class="mono muted">${k}/${typed.length}</span></div>`;
  const stmt = `<details class="card pb-stmt" id="pb-stmt" ${pb.stmtOpen ? 'open' : ''}><summary><span class="eyebrow">${esc(S_.src || 'Como no exame')}${S_.pts ? ` · ${pbNum(S_.pts)} valores` : ''}</span><span class="pb-stmt-t">${pb.stmtOpen ? 'Enunciado' : 'Ver enunciado'}</span></summary>
      <p class="qtext" style="margin-top:6px">${md(S_.stmt)}</p>${S_.d ? `<div class="diagram">${renderD(S_.d)}</div>` : ''}</details>`;
  const rows = pb.steps.slice(0, pb.i).map(pbRow).join('');   // only what comes before: a later step that is filled in would give away the answer
  return `${head}${stmt}${rows ? `<div class="pb-work" aria-label="Contas feitas">${rows}</div>` : ''}${pbStep(x, k, typed.length)}`;
}
function pbRow(y) {
  const tag = { clean: ['ok', 'à primeira'], helped: ['help', y.hints ? `com ${y.hints} pista${y.hints > 1 ? 's' : ''}` : 'corrigido'], revealed: ['rev', 'vista'], given: ['giv', y.byQ ? 'já fizeste' : 'já sabes'] }[y.state];
  return `<details class="pb-row ${tag[0]}"><summary><span class="pb-name mono">${esc(y.s.name)}</span><span class="pb-val mono">${esc(pbText(y.s.ans))}</span>${y.s.also ? `<span class="mono pb-also">${esc(y.s.also)}</span>` : ''}<span class="pb-tag">${tag[1]}</span></summary><p class="explain">${md(y.s.e)}</p></details>`;
}
function pbGrid(x) {
  const s = x.s, cells = pbCells(s), rows = pbRows(s.ans); let c = 0;
  const html = rows.map((r, ri) => `<div class="pb-gr">${r.map((_, j) => { const i = c++, cl = x.marks ? (x.marks[i] ? 'good' : 'bad') : '';
    if (cells[i].shown) return `<span class="pb-cell fixed">${pbNum(cells[i].v)}</span>`;
    return `<input class="pb-cell ${pb.showing ? 'good' : cl}" data-act="pval" data-c="${i}" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" value="${esc(x.vals[i])}" aria-label="${esc(s.name)}, ${pbIsMat(s.ans) ? `linha ${ri + 1}, coluna ${j + 1}` : `componente ${j + 1}`}" ${pb.showing ? 'disabled' : ''}>`; }).join('')}</div>`).join('');
  return `<div class="pb-answer"><span class="pb-name mono">${esc(s.name)} =</span><div class="pb-mat ${pbIsMat(s.ans) ? 'm' : 'v'}">${html}</div></div>`;
}
function pbStep(x, k, n) {
  const s = x.s, L = (s.les || pb.stage.les) && LBYID[s.les || pb.stage.les], total = (s.hints || []).length;
  const hints = (s.hints || []).slice(0, x.hints).map((h, i) => `<li>${md(h)}</li>`).join('');
  const hintBtn = pb.alone ? 'Não sei: ver a resolução' : x.hints >= total ? 'Mostrar a resposta' : `Dá-me uma pista (${x.hints + 1}/${total})`;
  const fb = pb.showing ? `<div class="feedback ${x.state === 'revealed' ? 'ko' : 'ok'}" aria-live="polite"><p class="explain">${md(s.e)}</p>${s.also ? `<p class="mono pb-also">${esc(s.also)}</p>` : ''}</div>` : '';
  const actions = pb.showing
    ? `<button class="btn primary" data-act="pbNext" id="pbCont">Continuar →</button>`
    : `<button class="btn primary" data-act="pbCheck">Verificar</button><button class="btn pb-sign" data-act="pbSign" aria-label="Trocar o sinal da caixa ativa">±</button><span class="spacer"></span><button class="btn ghost small" data-act="pbHint">${hintBtn}</button>`;
  return `<article class="card pb-step" id="pbStep"><span class="eyebrow">Passo ${k} de ${n}</span><p class="qtext" style="margin-top:6px">${md(s.ask)}</p>
    ${pbGrid(x)}
    ${x.msg ? `<p class="pb-msg" role="status">${md(x.msg)}</p>` : ''}
    ${hints && !pb.showing ? `<ol class="pb-hints">${hints}</ol>` : ''}
    ${fb}
    ${L && !pb.alone ? `<details class="lesson-peek" style="margin-top:12px"><summary>Teoria: ${esc(L.title)}</summary><div class="lbody lesson">${lessonBody(L)}</div></details>` : ''}
    ${pb.showing ? '' : cabPeek(LES2SK[s.les || pb.stage.les] || pb.p.skill, 'pb:' + pb.p.id)}
    <div class="pb-actions">${actions}</div></article>`;
}
function pbResults() {
  const r = pb.result, S_ = pb.stage, hard = pb.steps.filter(x => x.state === 'helped' || x.state === 'revealed');
  const title = r.clean ? pickOne(['Resolvido à primeira.', 'Limpinho.', 'Sem pedir ajuda.']) : r.heavy ? 'Chegaste ao fim. É assim que se aprende isto.' : 'Quase sem ajuda.';
  return `<div class="card pb-end"><span class="eyebrow">${esc(pb.p.title)} · ${esc(pb.review ? 'Revisão' : PB_KIND[S_.kind])}</span><h2 style="margin-top:6px">${title}</h2>
    ${r.marks !== null ? `<p class="pb-score"><b>${pbNum(r.marks)}</b> de ${pbNum(S_.pts)} valores</p><p class="muted">${esc(S_.src ? `${S_.src}, como se fosse o exame` : 'num problema como os do exame')}</p>` : ''}
    <p class="mono muted" style="margin-top:8px">+${r.xp} XP</p>
    ${S_.sol ? `<div class="section-h" style="margin-top:14px"><h3>O resultado</h3></div>${S_.sol.t ? `<p class="explain">${md(S_.sol.t)}</p>` : ''}${S_.sol.d ? `<div class="diagram">${renderD(S_.sol.d)}</div>` : ''}` : ''}
    ${hard.length ? `<div class="section-h" style="margin-top:14px"><h3>Onde precisaste de ajuda</h3></div><div class="pb-work">${hard.map(pbRow).join('')}</div>` : ''}
    ${hard.length === pb.steps.length ? '' : `<details class="lesson-peek pb-full" style="margin-top:14px"><summary>Ver a resolução completa (${pb.steps.length} passos)</summary><div class="pb-work">${pb.steps.map(pbRow).join('')}</div></details>`}
    <p style="margin-top:14px">${esc(r.next)}</p>
    <div class="row" style="margin-top:14px">${planNextBtn(!!pb.planKey)}<button class="btn${pb.planKey ? '' : ' primary'}" data-act="pbDone" id="pbEnd">Voltar ao início</button>${r.more ? `<button class="btn" data-act="pbGo" data-k="${esc(pb.p.id)}">Fazer já o próximo</button>` : ''}</div></div>`;
}
function afterProblemRender() {
  if (!pb) return; pbKeep(); const f = pb.focus; pb.focus = null;
  if (pb.result) { const e = document.getElementById('pbEnd'); if (e) e.focus({ preventScroll: true }); return; }
  if (!f) return;
  const card = document.getElementById('pbStep'), cont = document.getElementById('pbCont'), cells = [...document.querySelectorAll('input.pb-cell')];
  if (f === 'cont' && cont) cont.focus({ preventScroll: true });
  const t = f === 'bad' ? cells.find(c => c.classList.contains('bad')) : cells.find(c => !c.value);
  if (t && f !== 'cont') { t.focus({ preventScroll: true }); if (f === 'bad') t.select(); }
  if (card) (f === 'cont' ? (cont || card) : card).scrollIntoView({ block: f === 'cont' ? 'nearest' : 'start' });
}
let pbKeepT = null;
document.addEventListener('input', ev => { const t = ev.target; if (pb && t.dataset && t.dataset.act === 'pval') { const x = pb.steps[pb.i]; x.vals[+t.dataset.c] = t.value; t.classList.remove('bad', 'good'); clearTimeout(pbKeepT); pbKeepT = setTimeout(pbKeep, 800); } });
document.addEventListener('focusin', ev => { const t = ev.target; if (pb && t.dataset && t.dataset.act === 'pval') pb.lastCell = +t.dataset.c; });
document.addEventListener('toggle', ev => { if (pb && ev.target.id === 'pb-stmt') pb.stmtOpen = ev.target.open; }, true);
// the ± button must not take the focus away from the box it changes
document.addEventListener('pointerdown', ev => { if (ev.target.closest && ev.target.closest('.pb-sign')) ev.preventDefault(); });
// Enter walks through the empty boxes, then checks
document.addEventListener('keydown', ev => {
  const t = ev.target; if (!pb || ev.key !== 'Enter' || !t.dataset || t.dataset.act !== 'pval') return; ev.preventDefault();
  const cells = [...document.querySelectorAll('input.pb-cell')], i = cells.indexOf(t), next = cells.slice(i + 1).find(c => !c.value) || cells.find(c => !c.value);
  if (next) next.focus(); else pbCheck();
});
