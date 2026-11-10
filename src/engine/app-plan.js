/* ---------- TODAY'S PLAN ("Hoje") ----------
   One answer to "what do I do now?", for every course. The app lists the work left, in the order the course teaches it,
   and fills today with it:
   1. mistakes waiting in review (fixed while fresh);
   2. per exam problem type not ready yet, in course order (topic order, then C.skills order): its theory if unseen,
      then its key problem or its questions; a topic's lessons outside every type come after that topic's types;
      a course without types (AMS) goes topic by topic, then level by level;
   3. when everything is ready, the mock exam.
   With the test date and the minutes per day, the work left is spread over the days left; what doesn't fit is cut from
   the bottom (lessons outside every type, then the types that came up least) and the student is told what was cut.
   Times are ranges that start wide and narrow to the student's own pace, measured from their sessions:
   S.pace = { s: seconds per unit (a question = 1, a lesson = 2), n: samples, pb: key-problem time / nominal, pbn }.
   S.today = { d: 'YYYY-MM-DD', ms: time studied today, did: [plan keys done today] }. */
const PLAN_UNIT = 45, PLAN_MIN = [15, 30, 45, 60], LEARN_MAX = 3;   // at most 3 lessons in one sitting
const todayStr = () => new Date().toLocaleDateString('sv');
const planToday = () => { if (!S.today || S.today.d !== todayStr()) S.today = { d: todayStr(), ms: 0, did: [] }; return S.today; };
const paceS = () => (S.pace && S.pace.n ? S.pace.s : PLAN_UNIT);
const paceSpread = () => (S.pace && S.pace.n >= 3 ? [0.8, 1.25] : [0.6, 1.6]);
const pbNominal = p => { const m = String(p.time || '').match(/(\d+)\D+(\d+)/); return m ? (+m[1] + +m[2]) / 2 : 6; };
const lesUnits = ids => ids.reduce((a, id) => a + learnUnits(LBYID[id]), 0);
// one sitting of theory: up to LEARN_MAX lessons, fewer when they are long (about 12 minutes of work)
const learnBatch = ids => { const out = []; let u = 0; for (const id of ids) { const x = learnUnits(LBYID[id]); if (out.length && (out.length >= LEARN_MAX || u + x > 16)) break; out.push(id); u += x; } return out; };
// what the pace cuts together: a problem type, or a topic's lessons outside every type (cut first, weight 0)
const planGroup = t => t.skill || (t.base ? 'base:' + t.base : '');
const taskMin = t => t.min !== undefined ? t.min : t.units * paceS() / 60;
function minRange(m) {
  const [a, b] = paceSpread(), r = v => m > 20 ? Math.round(v / 5) * 5 : Math.round(v);
  const lo = Math.max(1, r(m * a)), hi = Math.max(lo + 1, r(m * b));
  return `${lo}–${hi} min`;
}
const hoursText = m => m < 90 ? `${Math.round(m / 5) * 5 || 5} min` : `${String(Math.round(m / 30) / 2).replace('.', ',')} h`;

// Every task left, in order. full: the whole remaining work of each type (for the pace), not just today's piece.
function planAll() {
  const T = [], rv = reviewPool().length, re = examReviewPool().length, pt = partTopics();
  if (rv) T.push({ key: 'review', kind: 'review', label: `Rever ${rv} erro${rv === 1 ? '' : 's'}`, why: 'Os erros vêm primeiro: corrigidos enquanto estão frescos, não voltam.', units: Math.min(rv, 12), full: rv });
  if (re) T.push({ key: 'reviewExam', kind: 'reviewExam', label: `Rever ${re} erro${re === 1 ? '' : 's'} do exame simulado`, why: 'Erros em condições de exame: vale a pena acertá-los duas vezes seguidas.', units: Math.min(re, 12), full: re });
  const unseen = ids => ids.filter(id => LBYID[id] && !(S.seenL || {})[id]);
  // a key problem left half done comes right after the mistakes: finishing it costs less than starting anything else
  const half = (C.problems || []).find(p => pbSaved(p) && partTopics().includes(p.t));
  if (half) { const K = pbSaved(half), left = K.st.filter(x => x[0] === 'todo').length / K.st.length;
    T.push({ key: 'pb:' + half.id, kind: 'pb', skill: half.skill, w: 1e9, id: half.id, label: `Acabar o problema: ${half.short || half.title}`, why: 'Ficou a meio: continuas no passo onde paraste.', min: Math.max(2, pbNominal(half) * left * ((S.pace && S.pace.pbn) ? S.pace.pb : 1)), full: 0 }); }
  // the last days before an open-book exam: the sheet they take is worth a look and a print
  const dl = daysLeft();
  if (openBook() && SKILLS.length && dl !== null && dl >= 0 && dl <= 3) T.push({ key: 'sheet', kind: 'sheet', label: 'Rever e imprimir a tua cábula', why: `O exame é ${dl === 0 ? 'hoje e é ' : ''}com consulta: vê se cada tipo tem o que precisas e junta as tuas notas.`, min: 10, full: 0 });
  if (SKILLS.length) {
    const nExams = pastList().length || pastGroups().length;
    const steps = readySummary().rows.filter(x => x.r.state !== 'ready').map(x => ({ at: skillAt(x.s), x })), TK = Object.keys(TOPICS);
    // lessons outside every type (APRE's Dados, for example) go in their topic's place, after that topic's types
    TK.filter(k => pt.includes(k)).forEach(k => { const L = unseen(LESSONS.filter(l => l.t === k && !LES2SK[l.id]).map(l => l.id)); if (L.length) steps.push({ at: TK.indexOf(k) * 1000 + 999, k, L }); });
    steps.sort((a, b) => a.at - b.at).forEach(st => {
      if (st.k) { const B = learnBatch(st.L), n = st.L.length;
        T.push({ key: 'learnT:' + st.k, kind: 'learn', base: st.k, w: 0, t: st.k, les: B, label: `Aprender: ${TOPICS[st.k].label || TOPICS[st.k].short}`, why: `Teoria das aulas que ainda não viste (${n === 1 ? '1 lição' : `${n} lições`}${n > B.length ? `, ${B.length} de cada vez` : ''}). Não é um tipo de problema de exame.`, units: lesUnits(B), full: lesUnits(st.L) });
        return; }
      const { s, r, w } = st.x;
      const why = (s.seen || []).length ? `Saiu em ${s.seen.length} de ${nExams} exames e ainda não está pronto.` : 'Matéria base que os exames usam.';
      const L = unseen(s.les || []);
      const B = learnBatch(L);
      if (L.length) T.push({ key: 'learn:' + s.id, kind: 'learn', skill: s.id, w, t: s.t, les: B, label: `Aprender: ${s.label}`, why: `Primeiro a teoria: ${L.length === 1 ? 'há 1 lição' : `há ${L.length} lições`} que ainda não viste.`, units: lesUnits(B), full: lesUnits(L) });
      const p = (C.problems || []).find(x => x.skill === s.id), ps = p && pbStatus(p);
      const left = r.total - r.ok;
      if (half && p && p.id === half.id) return;   // already first in the plan
      if (p && ps.due) T.push({ key: 'pb:' + p.id, kind: 'pb', skill: s.id, w, id: p.id, label: `Problema-chave: ${p.short || p.title}`, why: `${why} Resolves um problema de exame com pistas.`, min: pbNominal(p) * ((S.pace && S.pace.pbn) ? S.pace.pb : 1), full: left });
      else T.push({ key: 'skill:' + s.id, kind: 'skill', skill: s.id, w, label: `Treinar: ${s.label}`, why, units: Math.min(left, 8) + 2, full: left });
    });
    if (!T.length) T.push({ key: 'exam', kind: 'exam', label: 'Exame simulado', why: 'Todos os tipos de problema estão prontos: testa-te em condições de exame.', units: examCfg().n, full: 0 });
  } else {
    Object.keys(TOPICS).filter(k => pt.includes(k)).forEach(k => { const L = unseen(LESSONS.filter(l => l.t === k).map(l => l.id)), B = learnBatch(L);
      if (L.length) T.push({ key: 'learn:' + k, kind: 'learn', t: k, les: B, label: `Aprender: ${TOPICS[k].label || TOPICS[k].short}`, why: L.length > B.length ? `Teoria que ainda não viste: ${B.length === 1 ? 'a próxima' : `as próximas ${B.length}`} de ${L.length} lições, com perguntas a seguir.` : `Teoria que ainda não viste (${L.length} ${L.length === 1 ? 'lição' : 'lições'}), com perguntas a seguir.`, units: lesUnits(B), full: lesUnits(L), w: 1 }); });
    const tl = topLevel(), m = mastery(tl), left = m.total - m.done;
    if (left) T.splice(Math.min(T.length, rv || re ? 2 : 1), 0, { key: 'level:' + tl, kind: 'level', level: tl, label: `Nível ${tl} · ${LEVELS[tl - 1].t}`, why: tl < LEVELS.length ? `O nível ${tl + 1} abre com ${Math.round(UNLOCK * 100)}% deste.` : 'O último nível: as armadilhas do exame.', units: 10, full: BANK.filter(q => !isReserved(q) && inTopics(q) && !peek(q.id).c).length, w: 1 });
    if (!T.length) T.push({ key: 'exam', kind: 'exam', label: 'Exame simulado', why: 'Está tudo feito: testa-te em condições de exame.', units: examCfg().n, full: 0 });
  }
  return T;
}
// The pace: work left against days left. Returns what to cut (lowest-weight types first) when it doesn't fit.
function planPace(T) {
  const d = daysLeft(), per = S.settings.minDay || 30;
  const work = t => t.kind === 'pb' ? taskMin(t) + t.full * paceS() / 60 : t.full * paceS() / 60;
  const total = T.reduce((a, t) => a + work(t), 0);
  if (d === null || d < 1) return { d, total, per, cut: [] };
  const budget = d * per; let need = total; const cut = [];
  const bySkill = {}; T.forEach(t => { const g = planGroup(t); if (g) (bySkill[g] = bySkill[g] || { w: t.w, m: 0, label: t.skill ? SKBYID[t.skill].label : `${TOPICS[t.base].short} (teoria extra)`, n: t.skill ? (SKBYID[t.skill].seen || []).length : 0 }).m += work(t); });
  Object.entries(bySkill).sort((a, b) => a[1].w - b[1].w).forEach(([k, v]) => { if (need > budget) { need -= v.m; cut.push(Object.assign({ k }, v)); } });
  return { d, total, per, cut, need: total / d };
}
function planFor(more) {
  const all = planAll(), P = planPace(all), cut = new Set(P.cut.map(c => c.k)), td = planToday();
  const left = more ? (S.settings.minDay || 30) : (S.settings.minDay || 30) - td.ms / 60000;
  const pool = all.filter(t => !td.did.includes(t.key) && !cut.has(planGroup(t))), list = []; let m = 0;
  for (const t of pool) { const x = taskMin(t); if (list.length && m + x > left) break; list.push(t); m += x; if (m >= left) break; }
  return { all, P, list: left > 0 ? list : [], min: m, done: left <= 0, next: pool[0], spent: td.ms / 60000 };
}
function planRun(i, more) {
  const t = planFor(more).list[i] || planFor(true).list[i]; if (!t) { toast('Nada no plano agora.'); return; }
  const o = { planKey: t.key };
  if (t.kind === 'review' || t.kind === 'reviewExam' || t.kind === 'exam') start(t.kind, o);
  else if (t.kind === 'learn') start('learn', Object.assign(o, { topic: t.t, les: t.les, title: t.label }));
  else if (t.kind === 'skill') start('skill', Object.assign(o, { k: t.skill }));
  else if (t.kind === 'level') start('level', Object.assign(o, { level: t.level }));
  else if (t.kind === 'pb') pbStart(t.id, t.key);
  else if (t.kind === 'sheet') { planLog(t.key, 0, 0, 0, true); save(); go('sheet'); }
}
// After a session: time studied today, what was done, and the student's pace.
// noPace: the mock exam is timed, so it counts as time studied but says nothing about the student's own pace
function planLog(key, ms, units, nominal, noPace) {
  const td = planToday(); if (!S.pace) S.pace = { s: PLAN_UNIT, n: 0, pb: 1, pbn: 0 };
  const P = S.pace, t = Math.min(ms, Math.max(5, units || 5) * 240e3);   // an idle tab doesn't count beyond 4 min a unit
  td.ms += t; if (key && !td.did.includes(key)) td.did.push(key);
  if (noPace) return;
  if (nominal) { const r = t / 60000 / nominal; if (r > 0.2 && r < 5) { P.pb = P.pbn ? P.pb * 0.7 + r * 0.3 : r; P.pbn++; } }
  else if (units >= 3) { const x = t / 1000 / units; if (x > 5 && x < 300) { P.s = P.n ? P.s * 0.7 + x * 0.3 : x; P.n++; } }
}
// What the pace cut, for the card: the lessons outside every type as one entry, then each type
function cutNames(cut) {
  const b = cut.filter(c => c.k.startsWith('base:')).length;
  return [...(b ? [`a teoria que não é tipo de exame (${b} tópico${b === 1 ? '' : 's'})`] : []), ...cut.filter(c => !c.k.startsWith('base:')).map(c => `${esc(c.label)}${c.n ? ` (saiu em ${c.n})` : ''}`)];
}
function PlanCard() {
  const p = planFor(!!view.planMore), P = p.P, per = S.settings.minDay || 30;
  const seg = `<span class="seg" role="group" aria-label="Minutos por dia">${PLAN_MIN.map(m => `<button data-act="minDay" data-k="${m}" aria-pressed="${per === m}">${m}</button>`).join('')}</span>`;
  const set = `<div class="plan-set"><label for="testDate">Teste</label><input type="date" id="testDate" data-act="testDate" value="${esc(S.settings.testDate)}">${seg}<span>min por dia</span></div>`;
  let pace;
  if (P.d === null) pace = 'Diz quando é o teste e a app reparte o que falta pelos dias que tens.';
  else if (P.d < 1) pace = P.d === 0 ? 'O teste é hoje: revê os erros e as cábulas. Força!' : 'O teste já passou. Muda a data se houver outro.';
  else if (P.cut.length) pace = `Faltam ${P.d} dia${P.d === 1 ? '' : 's'} e cerca de ${hoursText(P.total)} de trabalho: precisavas de ~${Math.round(P.need)} min por dia. Com ${per} min, fica de fora: ${cutNames(P.cut).slice(0, 3).join('; ')}${cutNames(P.cut).length > 3 ? ` e mais ${cutNames(P.cut).length - 3}` : ''}. É o que sai menos.`;
  else pace = `Faltam ${P.d} dia${P.d === 1 ? '' : 's'} e cerca de ${hoursText(P.total)} de trabalho: chegam ~${Math.max(5, Math.round(P.need / 5) * 5)} min por dia.${P.need < per * 0.6 ? ' Estás adiantado: sobra tempo para rever.' : ' Estás em dia.'}`;
  const note = `<p class="plan-note">${S.pace && S.pace.n >= 3 ? 'Os tempos já usam o teu ritmo.' : 'Os tempos são intervalos e ajustam-se ao teu ritmo à medida que usas a app.'}</p>`;
  if (p.done && !view.planMore) return `<section class="plan-card done"><div class="row"><h2>Hoje ✓</h2><span class="spacer"></span><span class="mono muted">${Math.round(p.spent)} min feitos</span></div>
      <p>Plano de hoje feito.${p.next ? ` Amanhã começas por <b>${esc(p.next.label)}</b>.` : ''}</p>
      <div class="row"><button class="btn" data-act="planMore">Fazer mais um pouco</button></div>${rcStrip('recap')}<p class="plan-pace">${pace}</p>${set}</section>`;
  const items = p.list.map((t, i) => `<li><button class="plan-item" data-act="planGo" data-i="${i}"><span class="pi-n mono">${i + 1}</span><span class="pi-main"><b>${esc(t.label)}</b><span class="muted">${esc(t.why)}</span></span><span class="pi-t mono">${minRange(taskMin(t))}</span></button></li>`).join('');
  return `<section class="plan-card"><div class="row"><h2>Hoje</h2><span class="spacer"></span><span class="mono muted">${minRange(p.min)}</span></div>
    ${rcStrip('warm')}
    <ol class="plan-list">${items}</ol>
    <div class="row"><button class="btn primary" data-act="planGo" data-i="0">Começar →</button>${p.spent >= 1 ? `<span class="muted" style="font-size:13px">${Math.round(p.spent)} min feitos hoje</span>` : ''}</div>${rcStrip('recap')}
    <p class="plan-pace">${pace}</p>${set}${note}</section>`;
}
// At the end of a session started from the plan: the next step, or "done for today".
function planNextBtn(fromPlan) {
  if (!fromPlan) return '';
  const p = planFor(false);
  if (p.done || !p.list.length) return `<button class="btn primary" data-act="home">Plano de hoje feito ✓</button>`;
  return `<button class="btn primary" data-act="planGo" data-i="0">Seguinte no plano: ${esc(p.list[0].label)} →</button>`;
}

/* ---------- DAILY REVIEW: "Aquecimento" and "Resumo de hoje" ----------
   Two small, optional extras around the plan. They never enter the plan list, never count in the pace and never show
   as a debt: skipping one leaves nothing behind.
   - Aquecimento (start of the day): at most WARM_N questions answered right on earlier days, due again by their box
     (WARM_GAP days), the least known first. No calculations: it should take no effort to start. Whatever is not
     picked just waits; the number shown never grows past WARM_N.
   - Resumo de hoje (end of the day): at most RECAP_N things from today: the key line of lessons seen today, then the
     questions answered today, the ones answered wrong first.
   Each one can be read (question, then "Ver solução") or done (a normal session). Reading never raises a box:
   "Não sabia" brings the question back tomorrow, "Sabia" only postpones it. Done today: S.today.did has 'warm'/'recap'; S.today.rd lists the questions only read today (local, not in the key). */
const WARM_N = 3, RECAP_N = 5, RECAP_LES = 2, WARM_GAP = [1, 1, 3, 7, 14, 30];
const daysSince = ms => Math.round((new Date(todayStr()) - new Date(new Date(ms).toLocaleDateString('sv'))) / 864e5);
const rcDone = k => planToday().did.includes(k);
function warmPool() {
  return basePool().filter(q => { const s = peek(q.id);
    if (!s.c || !s.last || q.calc || q.ch || q.code) return false;
    if (s.w && s.box < TRAIN_CLEAR) return false;   // still a mistake: the mistakes task has it
    const d = daysSince(s.last); return d >= 1 && d >= WARM_GAP[Math.min(5, s.box)]; })
    .sort((a, b) => peek(a.id).box - peek(b.id).box || peek(a.id).last - peek(b.id).last).slice(0, WARM_N);
}
function recapItems() {
  const les = LESSONS.filter(l => S.seenL && S.seenL[l.id] && daysSince(S.seenL[l.id]) === 0 && l.key && activeTopics().includes(l.t)).slice(0, RECAP_LES).map(l => ({ kind: 'les', id: l.id }));
  const wrongNow = q => { const s = peek(q.id); return s.w > 0 && s.box === 0; };
  const rd = planToday().rd || [];   // only read today (in the warm-up), not done: not part of today's work
  const qs = BANK.filter(q => inTopics(q) && !isReserved(q) && !rd.includes(q.id) && peek(q.id).last && daysSince(peek(q.id).last) === 0)
    .sort((a, b) => wrongNow(b) - wrongNow(a) || peek(b.id).last - peek(a.id).last).map(q => ({ kind: 'q', id: q.id }));
  return les.concat(qs).slice(0, RECAP_N);
}
const rcMode = k => (S.settings.rc && S.settings.rc[k]) || (k === 'warm' ? 'do' : 'read');
// the two strips of the plan card (empty when there is nothing, or it was done or skipped today)
function rcStrip(k) {
  const n = k === 'warm' ? warmPool().length : recapItems().length; if (!n || rcDone(k)) return '';
  const m = rcMode(k), btn = (mm, t) => `<button class="btn small${m === mm ? ' primary' : ''}" data-act="rcGo" data-k="${k}" data-m="${mm}">${t}</button>`;
  const what = k === 'warm' ? `${n === 1 ? '1 pergunta' : `${n} perguntas`} que já acertaste noutros dias, para não esquecer` : `${n === 1 ? '1 coisa' : `${n} coisas`} do que fizeste hoje`;
  return `<div class="plan-extra"><div class="pe-t"><b>${k === 'warm' ? 'Aquecimento' : 'Fechar o dia'}</b> <span class="muted">· opcional</span><span class="muted pe-w">${what}.</span></div>
    <div class="row">${btn('read', 'Ler')}${btn('do', 'Fazer')}<button class="btn ghost small" data-act="rcSkip" data-k="${k}">Hoje não</button></div></div>`;
}
// read mode: its own small screen; do mode: a normal session with these questions
let rc = null;
function rcStart(k, m) {
  if (!S.settings.rc) S.settings.rc = {}; S.settings.rc[k] = m;
  const items = k === 'warm' ? warmPool().map(q => ({ kind: 'q', id: q.id })) : recapItems();
  if (!items.length) { toast('Nada para rever agora.'); return; }
  if (m === 'do') { const ids = items.filter(x => x.kind === 'q').map(x => x.id); if (!ids.length) { rc = { k, items, i: 0, shown: false, t0: Date.now() }; go('recap'); return; }
    start(k, { ids, planKey: k }); return; }
  rc = { k, items, i: 0, shown: false, t0: Date.now() }; save(); go('recap');
}
function rcSkip(k) { const td = planToday(); if (!td.did.includes(k)) td.did.push(k); save(); renderView(); }
function rcNext(rate) {
  const it = rc.items[rc.i];
  if (it.kind === 'q' && rate) { const s = st(it.id), td = planToday(); if (!td.rd) td.rd = []; if (!td.rd.includes(it.id)) td.rd.push(it.id);
    if (rate === 'no') { s.box = Math.min(s.box, 1); s.last = Date.now(); }   // back tomorrow, to be done
    else s.last = Date.now(); }                                               // known: later, by its box
  rc.i++; rc.shown = false;
  if (rc.i >= rc.items.length) { planLog(rc.k, Date.now() - rc.t0, rc.items.length, 0, true); rc.done = true; }
  save(); renderView(); window.scrollTo(0, 0);
}
