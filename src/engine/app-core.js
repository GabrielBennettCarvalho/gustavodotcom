/* ===== Estudo IST — engine =====
   Shared by every course: course menu, levels, standard modes
   (Learn, Review, Mock exam, Library) and progress storage.
   Content and extra sections come from each course (src/courses/<id>).
   UI text is in Portuguese on purpose: the students are. */
(() => {
const REG = window.STUDY;
const DEFAULT_LEVELS = [
  { n: 1, t: 'Fundamentos', d: 'Definições e símbolos' },
  { n: 2, t: 'Aplicação', d: 'Distinguir e escolher' },
  { n: 3, t: 'Análise', d: 'Cenários e diagramas' },
  { n: 4, t: 'Boss', d: 'Armadilhas de exame' },
];
const XP = { 1: 10, 2: 15, 3: 20, 4: 30 };
const UNLOCK = 0.6;
const EXAM_N = 20, EXAM_MIN = 30;   // mock exam: questions and minutes
const EXAM_CLEAR = 2;               // correct answers in a row to clear an exam mistake from review
const LS_KEY = 'estudo-ist-v2', LS_PACKS = 'estudo-ist-packs-v2';
const LEGACY = { state: 'ams-treino-v1', packs: 'ams-treino-packs-v1', course: 'ams' };

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// light markup for text fields: **bold**, `code`, line breaks
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code class="mono">$1</code>').replace(/\n/g, '<br>');
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

/* ---------- state ----------
   G holds everything; S points at the open course's slice (G.c[id]). */
const blank = (topics = {}) => ({ stats: {}, notes: {}, xp: 0, settings: { topics: Object.keys(topics), known: Object.keys(topics), unlockAll: false, testDate: '' }, rounds: 0, sessions: [] });
let G = ls.get(LS_KEY);
if (!G || G.v !== 2) G = { v: 2, cur: null, c: {}, updatedAt: 0 };
// Progress from the AMS-only version (same browser, same origin): merged once, even if this
// version was opened before. Merging never overwrites what is already here.
if (!G.legacyMerged) {
  const old = ls.get(LEGACY.state);
  if (old && old.stats && Object.keys(old.stats).length) {
    const s = old.settings || {};
    window.PROGRESS_KEY.merge(G, { courses: { [LEGACY.course]: { stats: old.stats, notes: old.notes || {}, xp: old.xp || 0, rounds: old.rounds || 0, testDate: s.testDate || '', unlockAll: !!s.unlockAll } } },
      () => ({ stats: {}, notes: {}, xp: 0, settings: {}, rounds: 0, sessions: [] }));
    if (!G.cur) G.cur = LEGACY.course;
  }
  G.legacyMerged = true; ls.set(LS_KEY, G);
}
let packs = ls.get(LS_PACKS);
if (!packs) { packs = (ls.get(LEGACY.packs) || []).map(p => Object.assign({ course: LEGACY.course }, p)); ls.set(LS_PACKS, packs); }
packs.forEach(p => { if (!p.course && p.cadeira) p.course = p.cadeira; });   // packs saved by the first multi-course build

let C = null, S = null, TOPICS = {}, LEVELS = DEFAULT_LEVELS;
let BANK = [], BYID = {}, LESSONS = [], LBYID = {};
const renderD = d => !d ? '' : typeof d === 'string' ? d : (C && C.render ? C.render(d) : '');

function openCourse(id) {
  C = REG.courses[id]; if (!C) return false;
  TOPICS = C.topics; LEVELS = C.levels || DEFAULT_LEVELS;
  if (!G.c[id]) G.c[id] = blank(TOPICS);
  S = G.c[id];
  const b = blank(TOPICS); for (const k in b) if (S[k] === undefined) S[k] = b[k];
  S.settings = Object.assign(b.settings, S.settings || {});
  // new topics start enabled for people who already had progress
  const known = S.settings.known; Object.keys(TOPICS).forEach(k => { if (!known.includes(k)) { known.push(k); if (!S.settings.topics.includes(k)) S.settings.topics.push(k); } });
  S.settings.topics = S.settings.topics.filter(k => TOPICS[k]); if (!S.settings.topics.length) S.settings.topics = Object.keys(TOPICS);
  G.cur = id; rebuildBank(); return true;
}

function rebuildBank() {
  const seen = new Set(); BANK = []; BYID = {}; LESSONS = []; LBYID = {};
  const addL = (l, trusted) => { if (!l || !l.id || LBYID[l.id]) return; const x = Object.assign({}, l, { trusted }); LESSONS.push(x); LBYID[l.id] = x; };
  C.lessons.forEach(l => addL(l, true));
  const addQ = (q, origin) => { const v = validateQ(q); if (!v.ok) return; let id = q.id; while (seen.has(id)) id = id + '+'; seen.add(id); const x = Object.assign({}, q, { id, origin }); BANK.push(x); BYID[id] = x; };
  C.questions.forEach(q => addQ(q, 'base'));
  packs.filter(p => p.course === C.id).forEach(p => { (p.lessons || []).forEach(l => addL(l, false)); (p.questions || []).forEach(q => addQ(q, p.name || 'pacote')); });
}
function validateQ(q) {
  if (!q || typeof q !== 'object') return { ok: false, why: 'não é um objeto' };
  if (!q.id || typeof q.id !== 'string') return { ok: false, why: 'falta "id" (texto)' };
  if (!TOPICS[q.t]) return { ok: false, why: `"t" tem de ser um de: ${Object.keys(TOPICS).join(', ')}` };
  if (![1, 2, 3, 4].includes(q.l)) return { ok: false, why: '"l" (nível) tem de ser 1, 2, 3 ou 4' };
  if (!q.q || typeof q.q !== 'string') return { ok: false, why: 'falta "q" (enunciado)' };
  if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6 || q.o.some(o => typeof o !== 'string')) return { ok: false, why: '"o" tem de ser uma lista de 2 a 6 opções (texto)' };
  const ans = Array.isArray(q.a) ? q.a : [q.a];
  if (!ans.length || ans.some(i => !Number.isInteger(i) || i < 0 || i >= q.o.length)) return { ok: false, why: '"a" tem de ser o índice (0, 1, …) da opção certa, ou uma lista de índices' };
  if (!q.e || typeof q.e !== 'string') return { ok: false, why: 'falta "e" (explicação)' };
  return { ok: true };
}

function save() { G.updatedAt = Date.now(); ls.set(LS_KEY, G); }

/* ---------- stats helpers ----------
   Per question: c correct, w training mistakes, box training-review box,
   ew exam mistakes, eb correct in a row since the last exam mistake, last (timestamp). */
const ZERO = { c: 0, w: 0, box: 0, ew: 0, eb: 0, last: 0 };
const st = id => { const s = S.stats[id] || (S.stats[id] = { ...ZERO }); for (const k in ZERO) if (s[k] === undefined) s[k] = 0; return s; };
const peek = id => Object.assign({}, ZERO, S.stats[id]);
const inTopics = q => S.settings.topics.includes(q.t);
const isReserved = q => q.reserved === 'exam';
const fresh = q => { const s = peek(q.id); return !s.c && !s.w && !s.ew; };
const trainPool = () => BANK.filter(q => inTopics(q) && !isReserved(q));
function mastery(level, topics = S.settings.topics) {
  const qs = BANK.filter(q => q.l === level && topics.includes(q.t) && !isReserved(q)); if (!qs.length) return { pct: 0, done: 0, total: 0 };
  const done = qs.filter(q => peek(q.id).c > 0).length; return { pct: done / qs.length, done, total: qs.length };
}
function unlocked(level) { if (level === 1 || S.settings.unlockAll) return true; return mastery(level - 1).pct >= UNLOCK; }
function topLevel() { let t = 1; for (const L of LEVELS) if (unlocked(L.n)) t = L.n; return t; }
const reviewPool = () => trainPool().filter(q => peek(q.id).w > 0 && peek(q.id).box < 3).sort((a, b) => peek(a.id).box - peek(b.id).box || peek(a.id).last - peek(b.id).last);
const examReviewPool = () => BANK.filter(q => inTopics(q) && peek(q.id).ew > 0 && peek(q.id).eb < EXAM_CLEAR).sort((a, b) => peek(a.id).eb - peek(b.id).eb || peek(a.id).last - peek(b.id).last);
const freshReserved = () => BANK.filter(q => inTopics(q) && isReserved(q) && fresh(q));
function pick(pool, n) { // unseen first, then weakest, randomized within bands
  const bands = [[], [], []]; pool.forEach(q => { const s = peek(q.id); if (!s.c && !s.w && !s.ew) bands[0].push(q); else if (s.box < 2) bands[1].push(q); else bands[2].push(q); });
  return bands.flatMap(b => shuffle(b)).slice(0, n);
}
function courseProgress(c) {
  const st_ = (G.c[c.id] && G.c[c.id].stats) || {}; const qs = c.questions.filter(q => !isReserved(q));
  const done = qs.filter(q => st_[q.id] && st_[q.id].c > 0).length; return { done, total: qs.length, xp: (G.c[c.id] && G.c[c.id].xp) || 0 };
}

/* ---------- view router ---------- */
let view = { name: 'home' };
let ses = null; // active session
function go(name, extra = {}) { view = Object.assign({ name }, extra); renderView(); window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); }
function renderView() {
  const v = C || view.name === 'sync' ? view.name : 'courses';
  const html = v === 'courses' ? Courses() : v === 'home' ? Home() : v === 'quiz' ? Quiz() : v === 'lesson' ? LessonScreen() : v === 'results' ? Results() : v === 'library' ? Library() : v === 'reader' ? Reader() : v === 'bank' ? Bank() : v === 'notes' ? Notes() : v === 'learnpick' ? LearnPick() : v === 'reviewpick' ? ReviewPick() : v === 'sync' ? Sync() : Home();
  $app.innerHTML = Top() + html;
  document.title = C && v !== 'courses' ? `${C.code} · Estudo IST` : 'Estudo IST';
  if (v === 'quiz') afterQuizRender();
  if (v === 'sync') afterSyncRender();
}
const toast = (msg) => { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };

function Top() {
  const inC = C && !['courses', 'sync'].includes(view.name);
  return `<header class="top">
    <button class="brand" data-act="${inC ? 'home' : 'courses'}" aria-label="Início">
      <svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 10 L20 20 M20 10 L10 20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="6" r="4" fill="var(--token)"/></svg>
      <b>${inC ? `${esc(C.code)} Treino` : 'Estudo IST'}</b></button>
    ${inC ? `<button class="chip" data-act="courses" title="Trocar de cadeira">Cadeiras ▾</button>` : ''}
    <span class="spacer"></span>
    ${inC ? `<span class="stat-pill" title="Experiência nesta cadeira"><i></i>${S.xp} XP</span>` : ''}
    ${view.name === 'sync' || (ses && !ses.ended) ? '' : `<button class="btn small" data-act="sync" title="Levar o progresso para outro dispositivo, ou trazê-lo">${glyph('swap')}<span class="hide-narrow">Outro dispositivo</span></button>`}
  </header>`;
}

/* ---------- COURSES (start menu) ---------- */
function Courses() {
  const list = REG.order.map(id => REG.courses[id]).filter(c => c.topics);
  const cards = list.map(c => { const p = courseProgress(c); const pct = p.total ? Math.round(p.done / p.total * 100) : 0;
    return `<button class="mode course-card" data-act="openC" data-id="${esc(c.id)}">
      <span class="eyebrow">${c.year ? `${c.year}.º ano` : ''}${c.semester ? ` · ${c.semester}.º sem.` : ''}</span>
      <h3><span class="code">${esc(c.code)}</span></h3><p>${esc(c.name)}</p>
      <span class="lvl-bar"><span style="width:${pct}%"></span></span>
      <span class="meta">${p.done}/${p.total} dominadas · ${p.xp} XP</span></button>`; }).join('');
  return `<section class="hero"><span class="eyebrow">Técnico · LEIC</span><h1>Escolhe a cadeira.</h1>
    <p>Cada cadeira tem os mesmos modos: aprender, rever erros, exame simulado e biblioteca de teoria. Algumas têm secções próprias.</p></section>
    <div class="modes">${cards}</div>`;
}

/* ---------- HOME (of a course) ---------- */
function daysLeft() { if (!S.settings.testDate) return null; const d = new Date(S.settings.testDate + 'T09:00:00'); const n = Math.ceil((d - new Date()) / 864e5); return isNaN(n) ? null : n; }
const extraApi = () => ({ pool: trainPool(), pick, topLevel, peek, inTopics, LEVELS, BANK });
function Home() {
  const tl = topLevel(); const dl = daysLeft(); const rp = reviewPool().length + examReviewPool().length;
  const nFresh = freshReserved().length; const nTrain = BANK.filter(q => !isReserved(q)).length;
  const topicsChips = Object.entries(TOPICS).map(([k, t]) => { const n = BANK.filter(q => q.t === k && !isReserved(q)).length; return `<button class="chip" style="--c:${t.c}" data-act="topic" data-k="${k}" aria-pressed="${S.settings.topics.includes(k)}"><span class="sw"></span>${t.short} <span class="muted mono">${n}</span></button>`; }).join('');
  const flow = LEVELS.map((L, i) => { const m = mastery(L.n), un = unlocked(L.n);
    return `${i ? '<span class="seq" aria-hidden="true"></span>' : ''}<button class="lvl ${un ? '' : 'locked'}" data-act="level" data-n="${L.n}" aria-label="Nível ${L.n} ${L.t}${un ? '' : ' (bloqueado)'}">
      ${un && L.n === tl ? '<span class="tok" title="Estás aqui"></span>' : ''}${un ? '' : '<span class="lock" aria-hidden="true">🔒</span>'}
      <span class="n">NÍVEL ${L.n}</span><span class="t">${L.t}</span><span class="pct">${m.done}/${m.total} dominadas</span>
      <span class="bar"><span style="width:${Math.round(m.pct * 100)}%"></span></span></button>`; }).join('');
  const std = [
    ['learn', 'Aprender', 'Teoria em pequenos cartões, cada um seguido de perguntas sobre ele. Começa por aqui.', `${LESSONS.length} lições`, glyph('book')],
    ['review', 'Revisão de erros', 'Volta às perguntas que falhaste, em separado as do treino e as do exame simulado.', rp ? `${rp} por rever` : 'nada por rever ainda', glyph('loop')],
    ['exam', 'Exame simulado', `${EXAM_N} perguntas, ${EXAM_MIN} minutos, sem feedback até ao fim. Usa primeiro perguntas que não aparecem nos outros modos.`, nFresh ? `${nFresh} perguntas inéditas reservadas` : 'condições de teste', glyph('clock')],
    ['library', 'Biblioteca de teoria', 'Todas as lições, por tema, para leres de seguida.', `${Object.keys(TOPICS).length} temas`, glyph('list')],
  ];
  const card = ([k, t, d, m, g], act = 'mode') => `<button class="mode" data-act="${act}" data-k="${k}"><h3>${g}${t}</h3><p>${d}</p><span class="meta">${m}</span></button>`;
  const api = extraApi();
  const extras = (C.extras || []).map(x => card([x.id, esc(x.title), esc(x.desc), esc(x.meta ? x.meta(api) : ''), glyph(x.icon || 'star')], 'extra')).join('');
  const mt = `<div class="mastery" role="table" aria-label="Domínio por tema e nível"><span></span>${LEVELS.map(L => `<span class="h">N${L.n}</span>`).join('')}
    ${Object.entries(TOPICS).map(([k, t]) => `<span class="tn"><span class="chip static" style="--c:${t.c};padding:0;border:0;background:none"><span class="sw"></span></span>${t.short}</span>` + LEVELS.map(L => { const m = mastery(L.n, [k]); return m.total ? `<span class="cell" title="${m.done} de ${m.total}"><span style="width:${Math.round(m.pct * 100)}%"></span><em>${m.done}/${m.total}</em></span>` : '<span class="cell"><em>—</em></span>'; }).join('')).join('')}</div>`;
  return `<section class="hero">
      <span class="eyebrow">${esc(C.name)} · IST</span>
      <h1>${esc(C.tagline || C.name)}</h1>
      <p>${nTrain} perguntas de escolha múltipla em ${LEVELS.length} níveis, com a teoria explicada sempre que falhas. ${dl !== null ? `<b>${dl > 0 ? `Faltam ${dl} dia${dl === 1 ? '' : 's'} para o teste.` : dl === 0 ? 'O teste é hoje. Força!' : 'O teste já passou.'}</b>` : ''}</p>
    </section>
    <div class="flow-card">
      <div class="row"><h2>Mapa de níveis</h2><span class="spacer"></span><span class="muted" style="font-size:13px">Desbloqueias o seguinte com ${Math.round(UNLOCK * 100)}% do anterior.</span></div>
      <div class="flow" role="group" aria-label="Níveis"><span class="ev" aria-hidden="true"></span><span class="seq" aria-hidden="true"></span>${flow}<span class="seq" aria-hidden="true"></span><span class="ev end" title="Teste" aria-hidden="true"></span></div>
      <div class="flow-legend"><span>○ início</span><span>◉ o token marca onde estás</span><span>● fim = pronto para o teste</span></div>
    </div>
    <div class="stack">
      <div class="row"><span class="eyebrow">Temas em jogo</span></div>
      <div class="chips">${topicsChips}</div>
    </div>
    <div class="section"><div class="section-h"><h2>Modos</h2></div><div class="modes">${std.map(c => card(c)).join('')}</div></div>
    ${extras ? `<div class="section"><div class="section-h"><h2>Só de ${esc(C.code)}</h2></div><div class="modes">${extras}</div></div>` : ''}
    <div class="section"><div class="section-h"><h2>Domínio</h2><span class="muted" style="font-size:13px">perguntas acertadas pelo menos uma vez</span></div>${mt}</div>
    <div class="section">
      <div class="section-h"><h2>Definições</h2></div>
      <div class="row">
        <label class="toggle"><input type="checkbox" id="unlockAll" data-act="unlockAll" ${S.settings.unlockAll ? 'checked' : ''}> Desbloquear todos os níveis</label>
        <label class="toggle" for="testDate">Dia do teste <input type="date" id="testDate" data-act="testDate" value="${esc(S.settings.testDate)}" style="width:auto;height:auto;font:inherit;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)"></label>
      </div>
      <div class="row">
        <button class="btn" data-act="bank">${glyph('plus')} Banco de perguntas e importar</button>
        <button class="btn" data-act="notes">${glyph('pen')} As minhas notas (${Object.keys(S.notes).filter(k => S.notes[k]).length})</button>
        <span class="spacer"></span>
        ${view.confirmReset ? `<span class="muted" style="font-size:13px">Apagar o progresso de ${esc(C.code)}?</span><button class="btn small" data-act="resetYes" style="color:var(--bad)">Sim, apagar</button><button class="btn small" data-act="resetNo">Cancelar</button>` : `<button class="btn ghost small" data-act="reset">Recomeçar do zero</button>`}
      </div>
    </div>`;
}
function glyph(k) {
  const p = { book: '<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z M24 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>', loop: '<path d="M6 13a8 8 0 0 1 14-5l2 2 M22 15a8 8 0 0 1-14 5l-2-2 M22 4v6h-6 M6 24v-6h6"/>', lens: '<circle cx="12" cy="12" r="7"/><path d="M17 17l6 6 M9 12h6 M12 9v6"/>', bolt: '<path d="M15 3L6 16h7l-1 9 9-13h-7z"/>', clock: '<circle cx="14" cy="14" r="10"/><path d="M14 8v6l4 3"/>', list: '<path d="M9 7h14 M9 14h14 M9 21h14"/><circle cx="5" cy="7" r="1.3"/><circle cx="5" cy="14" r="1.3"/><circle cx="5" cy="21" r="1.3"/>', plus: '<path d="M14 6v16 M6 14h16"/>', pen: '<path d="M6 22l2-6 11-11 4 4-11 11z M16 7l4 4"/>', star: '<path d="M14 3l3.2 7 7.3.6-5.6 4.8 1.8 7.3L14 18.8 7.3 22.7l1.8-7.3L3.5 10.6l7.3-.6z"/>', flag: '<path d="M6 25V4 M6 5h14l-3 5 3 5H6"/>', swap: '<path d="M4 9h18l-4-4 M24 19H6l4 4"/>', qr: '<path d="M4 4h7v7H4z M17 4h7v7h-7z M4 17h7v7H4z M17 17h3v3h-3z M21 21h3v3h-3z"/>', share: '<path d="M14 3v14 M9 8l5-5 5 5 M6 13v10h16V13"/>', copy: '<path d="M9 9h13v14H9z M6 19V5h13"/>' }[k] || '';
  return `<svg class="glyph" viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* ---------- REVIEW: two tabs ---------- */
function ReviewPick() {
  const a = reviewPool().length, b = examReviewPool().length;
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">Revisão de erros</span></div>
  <div class="modes">
    <button class="mode" data-act="startReview" data-k="review" ${a ? '' : 'disabled'}><h3>${glyph('loop')}Erros de treino</h3><p>Perguntas que falhaste nos níveis, em Aprender e nas secções da cadeira. Saem quando as acertares três vezes seguidas.</p><span class="meta">${a ? `${a} por rever` : 'nada por rever'}</span></button>
    <button class="mode" data-act="startReview" data-k="reviewExam" ${b ? '' : 'disabled'}><h3>${glyph('flag')}Erros de exame</h3><p>O que falhaste em condições de teste. Saem quando as acertares ${EXAM_CLEAR} vezes seguidas aqui.</p><span class="meta">${b ? `${b} por rever` : 'nada por rever'}</span></button>
  </div>`;
}

/* ---------- sessions ---------- */
function makeItem(q) { const n = q.o.length; const order = q.fixed ? [...Array(n).keys()] : shuffle([...Array(n).keys()]); return { kind: 'q', id: q.id, order }; }
function buildExam() {
  // 1) unseen reserved questions; 2) fill with the usual level mix from training; 3) reserved ones already seen
  let qs = shuffle(freshReserved()).slice(0, EXAM_N);
  const used = new Set(qs.map(q => q.id));
  if (qs.length < EXAM_N) {
    const tp = trainPool().filter(q => !used.has(q.id)); const by = (l, n) => pick(tp.filter(q => q.l === l), n);
    const mix = shuffle([...by(2, 7), ...by(3, 8), ...by(4, 5)]).slice(0, EXAM_N - qs.length);
    mix.forEach(q => used.add(q.id)); qs = qs.concat(mix);
  }
  if (qs.length < EXAM_N) qs = qs.concat(shuffle(BANK.filter(q => inTopics(q) && isReserved(q) && !used.has(q.id))).slice(0, EXAM_N - qs.length));
  return shuffle(qs);
}
function start(mode, opts = {}) {
  let items = [], title = '', timeLimit = 0;
  const pool = trainPool();
  if (!BANK.some(inTopics)) { toast('Escolhe pelo menos um tema.'); return; }
  if (mode === 'level') { const L = opts.level; items = pick(pool.filter(q => q.l === L), 10).map(makeItem); title = `Nível ${L} · ${LEVELS[L - 1].t}`; }
  if (mode === 'review') { items = reviewPool().slice(0, 12).map(makeItem); title = 'Revisão · erros de treino'; if (!items.length) { toast('Ainda não tens erros de treino para rever.'); return; } }
  if (mode === 'reviewExam') { items = examReviewPool().slice(0, 12).map(makeItem); title = 'Revisão · erros de exame'; if (!items.length) { toast('Ainda não tens erros de exame para rever.'); return; } }
  if (mode === 'extra') { const x = (C.extras || []).find(e => e.id === opts.extra); if (!x) return; items = (x.questions(extraApi()) || []).map(makeItem); title = x.title; }
  if (mode === 'exam') { items = buildExam().map(makeItem); title = 'Exame simulado'; timeLimit = EXAM_MIN * 60; }
  if (mode === 'learn') {
    const t = opts.topic; title = `Aprender · ${TOPICS[t].short}`;
    LESSONS.filter(l => l.t === t).forEach(l => { items.push({ kind: 'lesson', id: l.id });
      const qs = pool.filter(q => q.les === l.id).sort((a, b) => a.l - b.l || (peek(a.id).c - peek(b.id).c)).slice(0, 2); qs.forEach(q => items.push(makeItem(q))); });
  }
  if (mode === 'retry') { items = opts.ids.map(id => BYID[id]).filter(Boolean).map(makeItem); title = 'Repetir erros'; }
  if (!items.length) { toast('Não há perguntas para estes filtros.'); return; }
  ses = { mode, title, items, i: 0, results: [], picked: new Set(), answered: false, xp: 0, timeLimit, startedAt: Date.now(), level: opts.level, topic: opts.topic, examGrading: mode === 'reviewExam' || !!opts.examGrading, ended: false };
  if (timeLimit) startTimer();
  go(items[0].kind === 'lesson' ? 'lesson' : 'quiz');
}
