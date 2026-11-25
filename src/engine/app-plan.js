/* ---------- TODAY'S PLAN ("Hoje") ----------
   One answer to "what do I do now?", for every course. The app lists the work left, in the order the course teaches it,
   and fills today with it:
   1. mistakes waiting in review (fixed while fresh), then a round from the plan left half way ("Continuar: …", which
      resumes it and stands for its type's task), a key problem left half way, and the types one to NEAR_MAX questions
      from ready, together in one task;
   2. per exam problem type not ready yet, in course order (topic order, then C.skills order): its theory and its
      questions as one task when the theory fits in one sitting ("Aprender e treinar"); otherwise the lessons first and
      the training once they are all seen; a key problem stays its own task; a topic's lessons outside every type come
      after that topic's types; a course without types (AMS) goes topic by topic, then level by level;
   3. when everything is ready, the mock exam.
   New types come NEW_DAY at a time (more when the days left need it), so the list never jumps across many topics; with
   those done and minutes left, the next ones come. The day ends when its minutes do ("Fazer mais um pouco" then opens more).
   With the test date and the minutes per day, the work left is spread over the days left. Nothing is ever dropped: what
   doesn't fit moves to the end of the plan (lessons outside every type, then the types that came up least), and the
   card says what and which minutes a day would fit it all. Base types (in no past exam) never move: the rest builds on them.
   Work is counted in seconds, from the student's own pace, measured on every answer and every lesson card:
   S.pace = { q: seconds per theory question, qn, h: seconds per calculation / code / step question, hn,
     lr: reading time / nominal (LES_WPS words a second), ln, pb: key-problem time / nominal, pbn } (s, n: the old single
   pace, kept only so old keys still load). Until measured, a theory question is PLAN_Q seconds and a calculation one
   the real exam's pace (exam.min / exam.n). The total adds what the list alone misses: each mistake answered right
   TRAIN_CLEAR times more (at the student's own error rate) and one mock exam with its review. Times are ranges that
   start wide and narrow as samples come in.
   S.today = { d: 'YYYY-MM-DD', ms: time studied today, did: [plan keys done today] }. */
const PLAN_UNIT = 45, PLAN_MIN = [15, 30, 45, 60], LEARN_MAX = 3;   // at most 3 lessons in one sitting
const PLAN_Q = 40, LES_WPS = 2, ERR0 = 0.3;   // a theory question 40 s; reading 2 words a second; 30% wrong until measured
const NEAR_MAX = 3, NEAR_Q = 12;   // types this close to ready go together in one task, up to NEAR_Q questions
const NEW_DAY = 3;                 // new types shown at once, more only when the days left ask for it
const todayStr = () => new Date().toLocaleDateString('sv');
const planToday = () => { if (!S.today || S.today.d !== todayStr()) S.today = { d: todayStr(), ms: 0, did: [] }; return S.today; };
const paceObj = () => { if (!S.pace) S.pace = { s: PLAN_UNIT, n: 0, pb: 1, pbn: 0 }; const P = S.pace;
  for (const [k, v] of [['q', PLAN_Q], ['qn', 0], ['h', 0], ['hn', 0], ['lr', 1], ['ln', 0]]) if (P[k] === undefined) P[k] = v; return P; };
const heavy = q => !!(q && (q.calc || q.code || q.ch));
const examPace = () => { const X = examCfg(); return X && X.min && X.n ? X.min * 60 / X.n : 150; };
const paceQ = () => (S.pace && S.pace.qn ? S.pace.q : PLAN_Q);
const paceH = () => (S.pace && S.pace.hn ? S.pace.h : examPace());
const paceL = () => (S.pace && S.pace.ln ? S.pace.lr : 1);
const paceSpread = () => (S.pace && (S.pace.qn || 0) + (S.pace.hn || 0) >= 10 ? [0.8, 1.25] : [0.6, 1.6]);
// the student's error rate in training, from their answers in this course (ERR0 until there are 20)
function errRate() { let c = 0, w = 0; for (const id in S.stats) { const x = S.stats[id]; c += x.c || 0; w += x.w || 0; }
  return c + w >= 20 ? Math.min(0.6, Math.max(0.1, w / (c + w))) : ERR0; }
// seconds: questions by their kind; a lesson card by its words, at the student's reading pace
const qSec = qs => qs.reduce((a, q) => a + (q ? (heavy(q) ? paceH() : paceQ()) : 0), 0);
const cardWords = (L, k) => { const cs = lessonCards(L), h = k ? (cs[k - 1] || '') : (L.html || '');
  return h.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length + ((!k || k === cs.length) && L.key ? 15 : 0); };
const cardNominal = (L, k) => Math.max(15, cardWords(L, k) / LES_WPS);
// a lesson session: reading (fl) and its questions (fq), in seconds
const lesSec = ids => ids.reduce((a, id) => { const L = LBYID[id]; if (!L) return a;
  learnItems(L).forEach(x => { if (x.kind === 'lesson') a.fl += cardNominal(L, x.card) * paceL(); else if (x.kind === 'q') a.fq += qSec([BYID[x.id]]); }); return a; }, { fl: 0, fq: 0 });
const secOf = w => w.fl + w.fq;
// After each card or answer: the time spent on it, for the student's pace. An idle tab (over 12 min) says nothing,
// and one slow answer counts as at most 3 times the current pace.
function planSample(it, ms) {
  const x = ms / 1000; if (!it || x < 3 || x > 720) return;
  const P = paceObj(), wt = n => Math.max(0.15, 1 / (n + 2)), mix = (v, n, d, y) => (n ? v : d) * (1 - wt(n)) + y * wt(n);
  if (it.kind === 'lesson') { const L = LBYID[it.id]; if (!L) return; const r = x / cardNominal(L, it.card); if (r < 0.1 || r > 8) return; P.lr = mix(P.lr, P.ln, 1, r); P.ln++; return; }
  if (it.kind !== 'q') return; const q = BYID[it.id]; if (!q) return;
  if (heavy(q)) { P.h = mix(P.h, P.hn, examPace(), Math.min(x, 3 * paceH())); P.hn++; }
  else { P.q = mix(P.q, P.qn, PLAN_Q, Math.min(x, 3 * paceQ())); P.qn++; }
}
const pbNominal = p => { const m = String(p.time || '').match(/(\d+)\D+(\d+)/); return m ? (+m[1] + +m[2]) / 2 : 6; };
// one sitting of theory: up to LEARN_MAX lessons, fewer when they are long (about 12 minutes of work)
const learnBatch = ids => { const out = []; let u = 0; for (const id of ids) { const x = learnUnits(LBYID[id]); if (out.length && (out.length >= LEARN_MAX || u + x > 16)) break; out.push(id); u += x; } return out; };
// what the pace moves to the end together: a problem type, or a topic's lessons outside every type (first, weight 0)
const planGroup = t => t.skill || (t.base ? 'base:' + t.base : '');
const taskMin = t => t.min !== undefined ? t.min : t.sec / 60;
function minRange(m) {
  const [a, b] = paceSpread(), r = v => m > 20 ? Math.round(v / 5) * 5 : Math.round(v);
  const lo = Math.max(1, r(m * a)), hi = Math.max(lo + 1, r(m * b));
  return `${lo}–${hi} min`;
}
const nL = n => n === 1 ? '1 lição' : `${n} lições`, nQ = n => n === 1 ? '1 pergunta' : `${n} perguntas`;
// a total as a range: "6–9 h", or "40–60 min" when short
function hoursRange(m) {
  const [a, b] = paceSpread(), lo = m * a, hi = m * b, h = v => String(Math.max(0.5, Math.round(v / 30) / 2)).replace('.', ',');
  if (hi < 90) { const l = Math.max(5, Math.round(lo / 5) * 5); return `${l}–${Math.max(l + 5, Math.round(hi / 5) * 5)} min`; }
  return h(lo) === h(hi) ? `${h(lo)} h` : `${h(lo)}–${h(hi)} h`;
}
// minutes a day as a range, rounded to 5
function perDayRange(m) { const [a, b] = paceSpread(), l = Math.max(5, Math.round(m * a / 5) * 5); return `${l}–${Math.max(l + 5, Math.round(m * b / 5) * 5)} min`; }

// Every task left, in order. sec: today's piece, in seconds. fl, fq: all the reading and all the questions left in it
// (for the pace), in seconds; rep: its questions are already repeats (mistakes), so no more are added for them.
// Without calculations (noCalcNow: "Sem papel" or "Só teoria"): the review pools already leave them out; the types
// train only their questions without them, and key problems and the mock exam wait for paper. The pace is worked
// out on the plan with everything (planFor), so what waits for paper still counts.
function planAll() {
  const T = [], rv = reviewPool().length, re = examReviewPool().length, pt = partTopics(), np = noCalcNow();
  // a mistake leaves the review after TRAIN_CLEAR right answers in a row: that is its work left
  if (rv) { const P = reviewPool(); T.push({ key: 'review', kind: 'review', label: `Rever ${rv} erro${rv === 1 ? '' : 's'}`, why: '', sec: qSec(P.slice(0, 12)), fq: qSec(P) * TRAIN_CLEAR, fl: 0, rep: true }); }
  if (re) { const P = examReviewPool(); T.push({ key: 'reviewExam', kind: 'reviewExam', label: `Rever ${re} erro${re === 1 ? '' : 's'} do exame simulado`, why: `Saem quando os acertares ${EXAM_CLEAR} vezes seguidas.`, sec: qSec(P.slice(0, 12)), fq: qSec(P) * EXAM_CLEAR, fl: 0, rep: true }); }
  const unseen = ids => ids.filter(id => LBYID[id] && !(S.seenL || {})[id]);
  // a key problem left half done comes right after the mistakes: finishing it costs less than starting anything else
  const half = !np && (C.problems || []).find(p => pbSaved(p) && partTopics().includes(p.t));
  if (half) { const K = pbSaved(half), left = K.st.filter(x => x[0] === 'todo').length / K.st.length;
    T.push({ key: 'pb:' + half.id, kind: 'pb', skill: half.skill, w: 1e9, id: half.id, label: `Acabar o problema: ${half.short || half.title}`, why: 'Continuas no passo onde paraste.', min: Math.max(2, pbNominal(half) * left * ((S.pace && S.pace.pbn) ? S.pace.pb : 1)), fq: 0, fl: 0 }); }
  // a round started from the plan and left half way comes back as itself (its type's task may have changed meanwhile:
  // with the lessons seen, "Aprender e treinar" becomes "Treinar"), so it is resumed and never started over
  const K = sesSaved(), rs = K && K.planKey ? K : null;
  if (rs) { const nq = rs.items.filter(x => x.kind === 'q').length, done = rs.results.length;
    T.push({ key: rs.planKey, kind: 'resume', skill: rs.skill || null, w: 1e9, rnew: rs.planKey.startsWith('learn') ? rs.skill || rs.planKey : null, label: `Continuar: ${rs.title.replace(/^(Aprender e treinar|Aprender|Treinar): /, '')}`,
      why: `Ficou a meio: ${done} de ${nQ(nq)} feita${done === 1 ? '' : 's'}. Continuas onde paraste.`, sec: rs.items.slice(rs.i).reduce((a, x) => a + (x.kind === 'q' ? qSec([BYID[x.id]]) : x.kind === 'lesson' && LBYID[x.id] ? cardNominal(LBYID[x.id], x.card) * paceL() : 0), 0), fq: 0, fl: 0 }); }
  // the last days before an open-book exam: the sheet they take is worth a look and a print
  const dl = daysLeft();
  if (openBook() && SKILLS.length && dl !== null && dl >= 0 && dl <= 3) T.push({ key: 'sheet', kind: 'sheet', label: 'Rever e imprimir a tua cábula', why: `O exame é ${dl === 0 ? 'hoje e é ' : ''}com consulta.`, min: 10, fq: 0, fl: 0 });
  const nFront = T.length;
  if (SKILLS.length) {
    const nExams = pastList().length || pastGroups().length;
    const steps = readySummary().rows.filter(x => x.r.state !== 'ready').map(x => ({ at: skillAt(x.s), x })), TK = Object.keys(TOPICS);
    // lessons outside every type (APRE's Dados, for example) go in their topic's place, after that topic's types
    TK.filter(k => pt.includes(k)).forEach(k => { const L = unseen(LESSONS.filter(l => l.t === k && !LES2SK[l.id]).map(l => l.id)); if (L.length) steps.push({ at: TK.indexOf(k) * 1000 + 999, k, L }); });
    steps.sort((a, b) => a.at - b.at).forEach(st => {
      if (st.k) { const B = learnBatch(st.L), n = st.L.length;
        T.push({ key: 'learnT:' + st.k, kind: 'learn', base: st.k, w: 0, t: st.k, les: B, label: `Aprender: ${TOPICS[st.k].label || TOPICS[st.k].short}`, why: `${n === 1 ? '1 lição' : `${n} lições`} por ver${n > B.length ? `, ${B.length} de cada vez` : ''}. Não é um tipo de problema de exame.`, sec: secOf(lesSec(B)), ...lesSec(st.L) });
        return; }
      const { s, r, w } = st.x;
      const why = (s.seen || []).length ? `Saiu em ${s.seen.length} de ${nExams} exames.` : 'Matéria de base.';
      const L = unseen(s.les || []), B = learnBatch(L);
      const p = (C.problems || []).find(x => x.skill === s.id), ps = p && pbStatus(p), pbDue = !np && !!(p && ps.due);
      // without calculations, only the questions it needs that have none (the others wait for paper)
      const LQ = skillLeftNow(s.id), left = LQ.length, round = left <= SKILL_FOCUS ? left : 10, lq = qSec(LQ), rq = qSec(LQ.slice(0, round));
      const pbT = () => ({ key: 'pb:' + p.id, kind: 'pb', skill: s.id, w, id: p.id, label: `Problema-chave: ${p.short || p.title}`, why, min: pbNominal(p) * ((S.pace && S.pace.pbn) ? S.pace.pb : 1), fq: lq, fl: 0 });
      if (L.length && B.length === L.length && left && !pbDue && !(half && p && p.id === half.id)) {
        // the whole theory fits in one sitting: lessons and training are one task, one session
        T.push({ key: 'learn:' + s.id, kind: 'learn', train: true, skill: s.id, w, t: s.t, les: B, label: `Aprender e treinar: ${s.label}`,
          why: `${nL(L.length)} e ${left <= SKILL_FOCUS ? nQ(left) : 'uma ronda de perguntas'}. ${why}`, sec: secOf(lesSec(B)) + rq, fl: lesSec(L).fl, fq: lesSec(L).fq + lq });
        return; }
      if (L.length) {
        // more theory than one sitting: the lessons first; the training waits until they are all seen (its work still counts)
        const later = B.length < L.length;
        T.push({ key: 'learn:' + s.id, kind: 'learn', skill: s.id, w, t: s.t, les: B, label: `Aprender: ${s.label}`,
          why: `${nL(L.length)} por ver${later ? `, ${B.length} de cada vez. Depois, as perguntas` : ''}.`, sec: secOf(lesSec(B)), fl: lesSec(L).fl, fq: lesSec(L).fq + (later ? lq : 0), xmin: later && pbDue ? taskMin(pbT()) : 0 });
        if (later) return; }
      if (half && p && p.id === half.id) return;   // already first in the plan
      if (np && !left) return;   // what it still needs has calculations: it waits for paper
      const sc = np ? ' sem contas' : '';
      if (pbDue) T.push(pbT());
      else T.push({ key: 'skill:' + s.id, kind: 'skill', skill: s.id, w, label: `Treinar: ${s.label}`, why: left <= SKILL_FOCUS ? `${why} ${left === 1 ? `Falta 1 pergunta${sc}.` : `Faltam ${left} perguntas${sc}.`}` : np ? `${why} Só as perguntas sem contas.` : why, sec: rq, fq: lq, fl: 0, left, need: r.left });
    });
    // types one to NEAR_MAX questions from ready: one task, right after the mistakes, instead of a line each.
    // need: what the type really needs (left is only what can be done now, without calculations).
    const near = T.filter(t => t.kind === 'skill' && t.need <= NEAR_MAX), take = []; let nq = 0;
    near.forEach(t => { if (nq + t.left <= NEAR_Q) { take.push(t); nq += t.left; } });
    if (take.length >= 2) {
      const ids = take.flatMap(t => skillLeftNow(t.skill).map(q => q.id));
      take.forEach(t => T.splice(T.indexOf(t), 1));
      T.splice(nFront, 0, { key: 'near:' + take[0].skill, kind: 'near', ids, label: 'Acabar o que está quase', why: `${nQ(ids.length)} de ${take.length} tipos quase prontos.`, sec: take.reduce((a, t) => a + t.fq, 0), fq: take.reduce((a, t) => a + t.fq, 0), fl: 0 });
    }
    if (!T.length && !np) T.push({ key: 'exam', kind: 'exam', label: 'Exame simulado', why: 'Todos os tipos estão prontos.', min: examCfg().min, fq: 0, fl: 0 });
  } else {
    Object.keys(TOPICS).filter(k => pt.includes(k)).forEach(k => { const L = unseen(LESSONS.filter(l => l.t === k).map(l => l.id)), B = learnBatch(L);
      if (L.length) T.push({ key: 'learn:' + k, kind: 'learn', t: k, les: B, label: `Aprender: ${TOPICS[k].label || TOPICS[k].short}`, why: L.length > B.length ? `${B.length === 1 ? 'A próxima' : `As próximas ${B.length}`} de ${L.length} lições por ver.` : `${L.length} ${L.length === 1 ? 'lição' : 'lições'} por ver.`, sec: secOf(lesSec(B)), ...lesSec(L), w: 1 }); });
    const tl = topLevel(), m = mastery(tl), left = m.total - m.done;
    if (left) T.splice(Math.min(T.length, rv || re ? 2 : 1), 0, { key: 'level:' + tl, kind: 'level', level: tl, label: `Nível ${tl} · ${LEVELS[tl - 1].t}`, why: tl < LEVELS.length ? `O nível ${tl + 1} abre com ${Math.round(UNLOCK * 100)}% deste.` : 'O último nível.', sec: qSec(BANK.filter(q => q.l === tl && !isReserved(q) && inTopics(q) && !peek(q.id).c).slice(0, 10)), fq: qSec(BANK.filter(q => !isReserved(q) && inTopics(q) && !peek(q.id).c)), fl: 0, w: 1 });
    if (!T.length && !np) T.push({ key: 'exam', kind: 'exam', label: 'Exame simulado', why: 'Está tudo feito.', min: examCfg().min, fq: 0, fl: 0 });
  }
  // a task done without calculations leaves them behind: its own key, so they still show up the same day with paper
  // (before the saved round is matched: a round saved without them carries this key)
  if (np) T.forEach(t => { if (['review', 'reviewExam', 'skill', 'level', 'near'].includes(t.kind)) t.key += ':np'; });
  // the saved round stands for its own task and for its type's, whose work it carries for the pace
  if (!rs) return T;
  const mine = t => t.kind !== 'resume' && (t.key === rs.planKey || (rs.skill && t.skill === rs.skill && t.kind !== 'pb')), R = T.find(t => t.kind === 'resume');
  const M = T.filter(mine); R.fq = M.reduce((a, t) => a + t.fq, 0); R.fl = M.reduce((a, t) => a + t.fl, 0); R.skill = M.length ? rs.skill : null;
  return T.filter(t => !mine(t));
}
// The pace: work left against days left. Returns what moves to the end (lowest-weight types first) when it doesn't fit.
function planPace(T) {
  const d = daysLeft(), per = S.settings.minDay || 30;
  // minutes: reading, the questions with the mistakes they will bring back, a key problem's own time
  const err = errRate(), work = t => (t.xmin || 0) + (t.kind === 'pb' || t.kind === 'exam' ? taskMin(t) : 0) + (t.fl + t.fq * (t.rep ? 1 : 1 + err * TRAIN_CLEAR)) / 60;
  // one mock exam and its review, unless the plan already holds it
  const X = examCfg(), mock = !T.some(t => t.kind === 'exam') && X && X.min ? X.min + X.n * err * EXAM_CLEAR * paceH() / 60 : 0;
  const total = T.reduce((a, t) => a + work(t), 0) + mock;
  if (d === null || d < 1) return { d, total, per, later: [] };
  const budget = d * per; let need = total; const later = [];
  // a base type (in no past exam) stays in its place: the types after it build on it
  const base = t => t.skill && !(SKBYID[t.skill].seen || []).length;
  const bySkill = {}; T.forEach(t => { const g = planGroup(t); if (g && !base(t)) (bySkill[g] = bySkill[g] || { w: t.w, m: 0, label: t.skill ? SKBYID[t.skill].label : `${TOPICS[t.base].short} (teoria extra)`, n: t.skill ? (SKBYID[t.skill].seen || []).length : 0 }).m += work(t); });
  Object.entries(bySkill).sort((a, b) => a[1].w - b[1].w).forEach(([k, v]) => { if (need > budget) { need -= v.m; later.push(Object.assign({ k }, v)); } });
  // the fewest minutes a day, among the choices, that fit everything
  const fit = later.length ? PLAN_MIN.find(m => m > per && m * d >= total) : null;
  return { d, total, per, later, fit, need: total / d };
}
// A new type: its theory (any lesson task), or a type with nothing tried yet. Its id, so a type's lessons and its
// key problem count once.
const newOf = t => t.kind === 'resume' ? t.rnew : t.kind === 'learn' ? (t.skill || t.base || t.t) : t.skill && t.kind !== 'near' && readiness(t.skill).state === 'todo' ? t.skill : null;
function planFor(more) {
  const all = planAll(), P = planPace(noCalcNow() ? withPaper(planAll) : all), later = new Set(P.later.map(c => c.k)), td = planToday();
  const left = more ? (S.settings.minDay || 30) : (S.settings.minDay || 30) - td.ms / 60000;
  // what doesn't fit goes after everything else, in course order, so it is still done if there is time
  const open = all.filter(t => !td.did.includes(t.key)), isLater = t => later.has(planGroup(t));
  const pool = [...open.filter(t => !isLater(t)), ...open.filter(isLater)], list = []; let m = 0;
  // New types in batches of NEW_DAY (or what the days left need): the theory done today uses up the batch, and once it
  // is all done the next batch opens, as long as today's minutes last. The minutes chosen end the day, never the batch.
  const newLeft = new Set(pool.map(newOf).filter(Boolean)).size, perDay = P.d > 0 ? Math.max(NEW_DAY, Math.ceil(newLeft / P.d)) : NEW_DAY;
  const newToday = td.did.filter(k => k.startsWith('learn')).length, room = perDay - newToday % perDay, taken = new Set();
  // a skipped new type is skipped all the way down: its key problem never comes before its lessons
  const held = new Set();
  for (const t of pool) {
    const n = newOf(t);
    if (n && (held.has(n) || (!taken.has(n) && taken.size >= room))) { held.add(n); continue; }
    const x = taskMin(t); if (list.length && m + x > left) break;
    if (n) taken.add(n); list.push(t); m += x; if (m >= left) break; }
  return { all, P, list: left > 0 ? list : [], min: m, done: left <= 0 || !list.length, next: pool[0], spent: td.ms / 60000 };
}
function planRun(i, more) {
  const t = planFor(more).list[i] || planFor(true).list[i]; if (!t) { toast('Nada no plano agora.'); return; }
  // the same task left half way: carry on from where it stopped, never start it over
  const K = sesSaved(); if (K && K.planKey === t.key) { sesResume(); return; }
  const o = { planKey: t.key };
  if (t.kind === 'resume') { sesResume(); return; }
  if (t.kind === 'review' || t.kind === 'reviewExam' || t.kind === 'exam') start(t.kind, o);
  else if (t.kind === 'learn') start('learn', Object.assign(o, { topic: t.t, les: t.les, title: t.label, k: t.train ? t.skill : undefined }));
  else if (t.kind === 'near') start('near', Object.assign(o, { ids: t.ids }));
  else if (t.kind === 'skill') start('skill', Object.assign(o, { k: t.skill }));
  else if (t.kind === 'level') start('level', Object.assign(o, { level: t.level }));
  else if (t.kind === 'pb') pbStart(t.id, t.key);
  else if (t.kind === 'sheet') { planLog(t.key, 0, 0, 0, true); save(); go('sheet'); }
}
// After a session: time studied today, what was done, and the student's pace.
// noPace: the mock exam is timed, so it counts as time studied but says nothing about the student's own pace
function planLog(key, ms, units, nominal, noPace) {
  const td = planToday(), P = paceObj(), t = Math.min(ms, Math.max(5, units || 5) * 240e3);   // an idle tab doesn't count beyond 4 min a unit
  td.ms += t; if (key && !td.did.includes(key)) td.did.push(key);
  if (noPace) return;
  // a key problem: its time against its nominal time (questions and lessons are timed one by one, in planSample)
  if (nominal) { const r = t / 60000 / nominal; if (r > 0.2 && r < 5) { P.pb = P.pbn ? P.pb * 0.7 + r * 0.3 : r; P.pbn++; } }
}
// What the pace moved to the end, for the card: the lessons outside every type as one entry, then each type
function laterNames(later) {
  const b = later.filter(c => c.k.startsWith('base:')).length;
  return [...(b ? [`a teoria que não é tipo de exame (${b} tópico${b === 1 ? '' : 's'})`] : []), ...later.filter(c => !c.k.startsWith('base:')).map(c => `${esc(c.label)}${c.n ? ` (saiu em ${c.n})` : ''}`)];
}
function PlanCard() {
  const p = planFor(!!view.planMore), P = p.P, per = S.settings.minDay || 30;
  const seg = `<span class="seg" role="group" aria-label="Minutos por dia">${PLAN_MIN.map(m => `<button data-act="minDay" data-k="${m}" aria-pressed="${per === m}">${m}</button>`).join('')}</span>`;
  const set = `<div class="plan-set"><label for="testDate">Teste</label><input type="date" id="testDate" data-act="testDate" value="${esc(S.settings.testDate)}">${seg}<span>min por dia</span></div>`;
  let pace;
  if (P.d === null) pace = 'Diz quando é o teste e a app reparte o que falta pelos dias que tens.';
  else if (P.d < 1) pace = P.d === 0 ? 'O teste é hoje.' : 'O teste já passou. Muda a data se houver outro.';
  else if (P.later.length) { const L = laterNames(P.later);
    pace = `Faltam ${P.d} dia${P.d === 1 ? '' : 's'} e cerca de ${hoursRange(P.total)} de trabalho: precisavas de ${perDayRange(P.need)} por dia. Com ${per} min, fica para o fim o que sai menos: ${L.slice(0, 3).join('; ')}${L.length > 3 ? ` e mais ${L.length - 3}` : ''}.${P.fit ? ` Com ${P.fit} min por dia dá para tudo.` : ''}`; }
  else pace = `Faltam ${P.d} dia${P.d === 1 ? '' : 's'} e cerca de ${hoursRange(P.total)} de trabalho: chegam ${perDayRange(P.need)} por dia.`;
  const np = noCalcNow(), npBtn = hasCalc() ? `<button class="btn small np-tog" data-act="noPaper" aria-pressed="${np}" title="Para quando não tens papel nem caneta: no autocarro, numa passadeira. Fica ligado neste aparelho.">${glyph('pen')}Sem papel</button>` : '';
  const npWhy = noPaper() ? 'Sem papel' : 'Só teoria';   // which one turned the calculations off
  const npNote = np ? `<p class="plan-np">${p.next ? `${npWhy}: só o que se faz a ler e a clicar.` : `${npWhy}, não sobra nada: o que falta precisa de contas.`} ${(C.problems || []).length ? 'As contas e os problemas-chave esperam' : 'As contas esperam'} por papel, e o ritmo continua a contá-las.</p>` : '';
  // nothing left without calculations: not "done", it waits for paper (and the button is right there)
  if (np && !p.next) return `<section class="plan-card"><div class="row"><h2>Hoje</h2><span class="spacer"></span>${npBtn}</div>${npNote}${rcStrip('warm')}${rcStrip('recap')}<p class="plan-pace">${pace}</p>${set}</section>`;
  if (p.done && !view.planMore) return `<section class="plan-card done"><div class="row"><h2>Hoje ✓</h2><span class="spacer"></span>${npBtn}<span class="mono muted">${Math.round(p.spent)} min feitos</span></div>
      <p>Plano de hoje feito.${p.next ? ` Amanhã começas por <b>${esc(p.next.label)}</b>.` : ''}</p>
      <div class="row"><button class="btn" data-act="planMore">Fazer mais um pouco</button></div>${rcStrip('recap')}<p class="plan-pace">${pace}</p>${set}</section>`;
  const items = p.list.map((t, i) => `<li><button class="plan-item" data-act="planGo" data-i="${i}"><span class="pi-n mono">${i + 1}</span><span class="pi-main"><b>${esc(t.label)}</b>${t.why ? `<span class="muted">${esc(t.why)}</span>` : ''}</span><span class="pi-t mono">${minRange(taskMin(t))}</span></button></li>`).join('');
  return `<section class="plan-card"><div class="row"><h2>Hoje</h2><span class="spacer"></span>${npBtn}<span class="mono muted">${minRange(p.min)}</span></div>
    ${npNote}${rcStrip('warm')}
    <ol class="plan-list">${items}</ol>
    <div class="row"><button class="btn primary" data-act="planGo" data-i="0">Começar →</button>${p.spent >= 1 ? `<span class="muted" style="font-size:13px">${Math.round(p.spent)} min feitos hoje</span>` : ''}</div>${rcStrip('recap')}
    <p class="plan-pace">${pace}</p>${set}</section>`;
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
   "Não sabia" brings the question back tomorrow, "Sabia" only spaces it out in the warm-up (S.warmK[id] counts the
   "Sabia" in a row, local only, and adds to the box when choosing the gap). Among the questions due, the order is
   mixed each day, so the warm-up does not keep showing the same few. Done today: S.today.did has 'warm'/'recap'; S.today.rd lists the questions only read today (local, not in the key). */
const WARM_N = 3, RECAP_N = 5, RECAP_LES = 2, WARM_GAP = [1, 1, 3, 7, 14, 30];
const daysSince = ms => Math.round((new Date(todayStr()) - new Date(new Date(ms).toLocaleDateString('sv'))) / 864e5);
const rcDone = k => planToday().did.includes(k);
const warmK = id => (S.warmK && S.warmK[id]) || 0;
const warmLvl = q => Math.min(5, peek(q.id).box + warmK(q.id));
// a fixed mix for the day: the same order all day long, a different one tomorrow
const dayMix = id => { let h = 2166136261; for (const ch of todayStr() + id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
function warmPool() {
  return basePool().filter(q => { const s = peek(q.id);
    if (!s.c || !s.last || q.calc || q.ch || q.code) return false;
    if (s.w && s.box < TRAIN_CLEAR) return false;   // still a mistake: the mistakes task has it
    const d = daysSince(s.last); return d >= 1 && d >= WARM_GAP[warmLvl(q)]; })
    .sort((a, b) => warmLvl(a) - warmLvl(b) || dayMix(a.id) - dayMix(b.id)).slice(0, WARM_N);
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
  const what = k === 'warm' ? `${n === 1 ? '1 pergunta' : `${n} perguntas`} que já acertaste noutros dias` : `${n === 1 ? '1 coisa' : `${n} coisas`} do que fizeste hoje`;
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
    if (!S.warmK) S.warmK = {};
    if (rate === 'no') { s.box = Math.min(s.box, 1); s.last = Date.now(); delete S.warmK[it.id]; }   // back tomorrow, to be done
    else { s.last = Date.now(); if (rc.k === 'warm') S.warmK[it.id] = warmK(it.id) + 1; } }        // known: a longer gap each time
  rc.i++; rc.shown = false;
  if (rc.i >= rc.items.length) { planLog(rc.k, Date.now() - rc.t0, rc.items.length, 0, true); rc.done = true; }
  save(); renderView(); window.scrollTo(0, 0);
}
