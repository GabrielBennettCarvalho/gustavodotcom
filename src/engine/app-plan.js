/* ---------- TODAY'S PLAN ("Hoje") ----------
   One answer to "what do I do now?", for every course. The app lists the work left, in the order that is worth most
   in the exam, and fills today with it:
   1. mistakes waiting in review (fixed while fresh);
   2. per exam problem type not ready yet, most frequent first: its theory if unseen, then its key problem or its questions;
      a course without types (AMS) goes topic by topic, then level by level;
   3. when everything is ready, the mock exam.
   With the test date and the minutes per day, the work left is spread over the days left; what doesn't fit is cut from
   the bottom (the types that came up least) and the student is told what was cut.
   Times are ranges that start wide and narrow to the student's own pace, measured from their sessions:
   S.pace = { s: seconds per unit (a question = 1, a lesson = 2), n: samples, pb: key-problem time / nominal, pbn }.
   S.today = { d: 'YYYY-MM-DD', ms: time studied today, did: [plan keys done today] }. */
const PLAN_UNIT = 45, PLAN_MIN = [15, 30, 45, 60], LEARN_MAX = 3;   // at most 3 lessons in one sitting
const todayStr = () => new Date().toLocaleDateString('sv');
const planToday = () => { if (!S.today || S.today.d !== todayStr()) S.today = { d: todayStr(), ms: 0, did: [] }; return S.today; };
const paceS = () => (S.pace && S.pace.n ? S.pace.s : PLAN_UNIT);
const paceSpread = () => (S.pace && S.pace.n >= 3 ? [0.8, 1.25] : [0.6, 1.6]);
const pbNominal = p => { const m = String(p.time || '').match(/(\d+)\D+(\d+)/); return m ? (+m[1] + +m[2]) / 2 : 6; };
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
  if (SKILLS.length) {
    const nExams = pastList().length || pastGroups().length;
    readySummary().rows.filter(x => x.r.state !== 'ready').sort((a, b) => b.w - a.w || b.r.pct - a.r.pct).forEach(({ s, r, w }) => {
      const why = (s.seen || []).length ? `Saiu em ${s.seen.length} de ${nExams} exames e ainda não está pronto.` : 'Matéria base que os exames usam.';
      const L = unseen(s.les || []);
      if (L.length) T.push({ key: 'learn:' + s.id, kind: 'learn', skill: s.id, w, t: s.t, les: L.slice(0, LEARN_MAX), label: `Aprender: ${s.label}`, why: `Primeiro a teoria: ${L.length === 1 ? 'há 1 lição' : `há ${L.length} lições`} que ainda não viste.`, units: Math.min(L.length, LEARN_MAX) * 4, full: L.length * 4 });
      const p = (C.problems || []).find(x => x.skill === s.id), ps = p && pbStatus(p);
      const left = r.total - r.ok;
      if (p && ps.due) T.push({ key: 'pb:' + p.id, kind: 'pb', skill: s.id, w, id: p.id, label: `Problema-chave: ${p.short || p.title}`, why: `${why} Resolves um problema de exame com pistas.`, min: pbNominal(p) * ((S.pace && S.pace.pbn) ? S.pace.pb : 1), full: left });
      else T.push({ key: 'skill:' + s.id, kind: 'skill', skill: s.id, w, label: `Treinar: ${s.label}`, why, units: Math.min(left, 8) + 2, full: left });
    });
    if (!T.length) T.push({ key: 'exam', kind: 'exam', label: 'Exame simulado', why: 'Todos os tipos de problema estão prontos: testa-te em condições de exame.', units: examCfg().n, full: 0 });
  } else {
    Object.keys(TOPICS).filter(k => pt.includes(k)).forEach(k => { const L = unseen(LESSONS.filter(l => l.t === k).map(l => l.id));
      if (L.length) T.push({ key: 'learn:' + k, kind: 'learn', t: k, les: L.slice(0, LEARN_MAX), label: `Aprender: ${TOPICS[k].label || TOPICS[k].short}`, why: L.length > LEARN_MAX ? `Teoria que ainda não viste: as próximas ${LEARN_MAX} de ${L.length} lições, com perguntas a seguir.` : `Teoria que ainda não viste (${L.length} ${L.length === 1 ? 'lição' : 'lições'}), com perguntas a seguir.`, units: Math.min(L.length, LEARN_MAX) * 4, full: L.length * 4, w: 1 }); });
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
  const bySkill = {}; T.forEach(t => { if (t.skill) (bySkill[t.skill] = bySkill[t.skill] || { w: t.w, m: 0, label: SKBYID[t.skill].label, n: (SKBYID[t.skill].seen || []).length }).m += work(t); });
  Object.entries(bySkill).sort((a, b) => a[1].w - b[1].w).forEach(([k, v]) => { if (need > budget) { need -= v.m; cut.push(Object.assign({ k }, v)); } });
  return { d, total, per, cut, need: total / d };
}
function planFor(more) {
  const all = planAll(), P = planPace(all), cut = new Set(P.cut.map(c => c.k)), td = planToday();
  const left = more ? (S.settings.minDay || 30) : (S.settings.minDay || 30) - td.ms / 60000;
  const pool = all.filter(t => !td.did.includes(t.key) && !cut.has(t.skill)), list = []; let m = 0;
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
function PlanCard() {
  const p = planFor(!!view.planMore), P = p.P, per = S.settings.minDay || 30;
  const seg = `<span class="seg" role="group" aria-label="Minutos por dia">${PLAN_MIN.map(m => `<button data-act="minDay" data-k="${m}" aria-pressed="${per === m}">${m}</button>`).join('')}</span>`;
  const set = `<div class="plan-set"><label for="testDate">Teste</label><input type="date" id="testDate" data-act="testDate" value="${esc(S.settings.testDate)}">${seg}<span>min por dia</span></div>`;
  let pace;
  if (P.d === null) pace = 'Diz quando é o teste e a app reparte o que falta pelos dias que tens.';
  else if (P.d < 1) pace = P.d === 0 ? 'O teste é hoje: revê os erros e as cábulas. Força!' : 'O teste já passou. Muda a data se houver outro.';
  else if (P.cut.length) pace = `Faltam ${P.d} dia${P.d === 1 ? '' : 's'} e cerca de ${hoursText(P.total)} de trabalho: precisavas de ~${Math.round(P.need)} min por dia. Com ${per} min, fica de fora: ${P.cut.slice(0, 3).map(c => `${esc(c.label)}${c.n ? ` (saiu em ${c.n})` : ''}`).join('; ')}${P.cut.length > 3 ? ` e mais ${P.cut.length - 3}` : ''}. É o que sai menos.`;
  else pace = `Faltam ${P.d} dia${P.d === 1 ? '' : 's'} e cerca de ${hoursText(P.total)} de trabalho: chegam ~${Math.max(5, Math.round(P.need / 5) * 5)} min por dia.${P.need < per * 0.6 ? ' Estás adiantado: sobra tempo para rever.' : ' Estás em dia.'}`;
  const note = `<p class="plan-note">${S.pace && S.pace.n >= 3 ? 'Os tempos já usam o teu ritmo.' : 'Os tempos são intervalos e ajustam-se ao teu ritmo à medida que usas a app.'}</p>`;
  if (p.done && !view.planMore) return `<section class="plan-card done"><div class="row"><h2>Hoje ✓</h2><span class="spacer"></span><span class="mono muted">${Math.round(p.spent)} min feitos</span></div>
      <p>Plano de hoje feito.${p.next ? ` Amanhã começas por <b>${esc(p.next.label)}</b>.` : ''}</p>
      <div class="row"><button class="btn" data-act="planMore">Fazer mais um pouco</button></div><p class="plan-pace">${pace}</p>${set}</section>`;
  const items = p.list.map((t, i) => `<li><button class="plan-item" data-act="planGo" data-i="${i}"><span class="pi-n mono">${i + 1}</span><span class="pi-main"><b>${esc(t.label)}</b><span class="muted">${esc(t.why)}</span></span><span class="pi-t mono">${minRange(taskMin(t))}</span></button></li>`).join('');
  return `<section class="plan-card"><div class="row"><h2>Hoje</h2><span class="spacer"></span><span class="mono muted">${minRange(p.min)}</span></div>
    <ol class="plan-list">${items}</ol>
    <div class="row"><button class="btn primary" data-act="planGo" data-i="0">Começar →</button>${p.spent >= 1 ? `<span class="muted" style="font-size:13px">${Math.round(p.spent)} min feitos hoje</span>` : ''}</div>
    <p class="plan-pace">${pace}</p>${set}${note}</section>`;
}
// At the end of a session started from the plan: the next step, or "done for today".
function planNextBtn(fromPlan) {
  if (!fromPlan) return '';
  const p = planFor(false);
  if (p.done || !p.list.length) return `<button class="btn primary" data-act="home">Plano de hoje feito ✓</button>`;
  return `<button class="btn primary" data-act="planGo" data-i="0">Seguinte no plano: ${esc(p.list[0].label)} →</button>`;
}
