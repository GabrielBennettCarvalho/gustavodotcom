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
const EXAM_N = 20, EXAM_MIN = 30;   // mock exam defaults: questions and minutes (a course can set exam: { n, min, penalty })
const CALC_MODES = ['all', 'theory', 'math'];
const TRAIN_CLEAR = 2, EXAM_CLEAR = 2;   // correct answers in a row to clear a training / exam mistake from review
const LS_KEY = 'estudo-ist-v2', LS_PACKS = 'estudo-ist-packs-v2', LS_THEME = 'estudo-ist-theme';
const LEGACY = { state: 'ams-treino-v1', packs: 'ams-treino-packs-v1', course: 'ams' };

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* Formulas with a legend. A course lists them in C.formulas: { id: { t, name, f, legend: [[symbol, meaning], …] } }.
   Text (and lesson or cheat-sheet HTML) writes {f:id}: it shows the formula, and a tap opens a card that says what each
   symbol means (fxOpen, in app-views.js). */
// {f:id|text} shows the text as written there (a variant, or the formula with that problem's indices) with the same card
const fxTag = (id, txt) => { const F = C && C.formulas && C.formulas[id];
  return F ? `<button type="button" class="fx" data-fx="${esc(id)}" aria-haspopup="dialog" title="O que quer dizer cada símbolo">${txt !== undefined ? txt : esc(F.f)}</button>` : txt !== undefined ? txt : `{f:${esc(id)}}`; };
const fxify = h => String(h ?? '').replace(/\{f:([a-z0-9-]+)(?:\|([^}]*))?\}/g, (_, id, txt) => fxTag(id, txt));
let fxBtn = null;   // the formula whose card is open
function fxClose() { const c = document.getElementById('fxcard'); if (c) c.remove(); if (fxBtn) fxBtn.setAttribute('aria-expanded', 'false'); fxBtn = null; }
// light markup for text fields: **bold**, `code`, line breaks, {f:id} formulas
const md = s => fxify(esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code class="mono">$1</code>').replace(/\n/g, '<br>'));
// Students paste notes from chatbots with LaTeX (\(y_2 = 0\), \rightarrow, \frac{a}{b}): show them as plain Unicode maths.
const TEX_SYM = { rightarrow: '→', to: '→', Rightarrow: '⇒', implies: '⇒', leftarrow: '←', Leftarrow: '⇐', leftrightarrow: '↔', iff: '⇔', mapsto: '↦',
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈', sim: '∼', equiv: '≡', propto: '∝',
  sum: 'Σ', prod: 'Π', int: '∫', partial: '∂', nabla: '∇', infty: '∞', in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', cup: '∪', cap: '∩', emptyset: '∅',
  forall: '∀', exists: '∃', neg: '¬', lnot: '¬', land: '∧', wedge: '∧', lor: '∨', vee: '∨', odot: '⊙', circ: '∘', ldots: '…', cdots: '⋯', dots: '…', top: 'ᵀ', prime: '′',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ',
  pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Pi: 'Π', Omega: 'Ω',
  log: 'log', ln: 'ln', exp: 'exp', max: 'max', min: 'min', arg: 'arg', argmax: 'argmax', argmin: 'argmin', sin: 'sin', cos: 'cos', tanh: 'tanh', det: 'det',
  quad: ' ', qquad: ' ', left: '', right: '', big: '', Big: '', displaystyle: '', ',': ' ', ';': ' ', ':': ' ', '!': '', '{': '{', '}': '}', '%': '%', '_': '_', '&': '&', '#': '#', '$': '$', '\\': '\n' };
const TEX_SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ', ',': ',', ' ': '' };
const TEX_SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', T: 'ᵀ', k: 'ᵏ', j: 'ʲ', '*': '*', '′': '′', ' ': '' };
const texScript = (s, map, mark) => [...s].every(ch => map[ch] !== undefined) ? [...s].map(ch => map[ch]).join('') : mark + (s.length > 1 ? `(${s})` : s);
function tex(s) {
  if (!/\\[a-zA-Z([{]|\$|[_^]\{/.test(s)) return s;
  let t = s.replace(/\\\[|\\\]/g, ' ').replace(/\\\(|\\\)|\$\$?/g, '');
  for (let k = 0; k < 4; k++) t = t
    .replace(/\\(?:d|t)?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, a, b) => `${/^\w+$|^[\w.,]+$/.test(a) ? a : `(${a})`}/${/^\w+$|^[\w.,]+$/.test(b) ? b : `(${b})`}`)
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, (_, a) => `√${/^[\w.,]+$/.test(a) ? a : `(${a})`}`)
    .replace(/\\(?:text|mathrm|mathbf|mathit|operatorname|boldsymbol|mathcal|textbf|textit|hat|bar|vec|tilde)\s*\{([^{}]*)\}/g, (m, a) => /^\\hat/.test(m) ? a + '̂' : /^\\bar/.test(m) ? a + '̄' : a)
    .replace(/_\{([^{}]*)\}/g, (_, a) => texScript(a, TEX_SUB, '_')).replace(/\^\{([^{}]*)\}/g, (_, a) => texScript(a, TEX_SUP, '^'));
  t = t.replace(/\\([a-zA-Z]+|[,;:!{}%_&#$\\])/g, (m, n) => TEX_SYM[n] !== undefined ? TEX_SYM[n] : n)
    .replace(/_([0-9a-z])/g, (m, a) => TEX_SUB[a] || m).replace(/\^([0-9nTi])/g, (m, a) => TEX_SUP[a] || m)
    .replace(/[{}]/g, '').replace(/ {2,}/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n');
  return t.trim();
}
const noteMd = s => md(tex(s));
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

/* ---------- colour theme: 'auto' follows the system; light/dark stay on this device only ---------- */
let theme = ls_get_raw(LS_THEME) || 'auto';
function ls_get_raw(k) { try { return localStorage.getItem(k); } catch { return null; } }
function applyTheme() { const r = document.documentElement; if (theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', theme); }
function cycleTheme() { theme = theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto'; try { localStorage.setItem(LS_THEME, theme); } catch {} applyTheme(); }
applyTheme();

/* ---------- state ----------
   G holds everything; S points at the open course's slice (G.c[id]). */
const blank = (topics = {}) => ({ stats: {}, notes: {}, xp: 0, skipped: {}, pins: {}, settings: { topics: Object.keys(topics), known: Object.keys(topics), unlockAll: false, testDate: '', calcMode: 'all', part: 'all', minDay: 30 }, rounds: 0, sessions: [], route: {}, prob: { t: {}, con: {} }, today: { d: '', ms: 0, did: [] }, pace: { s: 45, n: 0, pb: 1, pbn: 0 }, seenL: {} });
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
let SKILLS = [], SKBYID = {}, LES2SK = {};   // the course's exam problem types (C.skills), by id and by lesson
const renderD = d => !d ? '' : typeof d === 'string' ? d : (C && C.render ? C.render(d) : '');

function openCourse(id) {
  C = REG.courses[id]; if (!C) return false;
  TOPICS = C.topics; LEVELS = C.levels || DEFAULT_LEVELS;
  if (!G.c[id]) G.c[id] = blank(TOPICS);
  S = G.c[id];
  const b = blank(TOPICS); for (const k in b) if (S[k] === undefined) S[k] = b[k];
  S.settings = Object.assign(b.settings, S.settings || {});
  // the old on/off "Só teoria" switch becomes the three-way calcMode
  if ('noCalc' in S.settings) { if (S.settings.noCalc) S.settings.calcMode = 'theory'; delete S.settings.noCalc; }
  if (!CALC_MODES.includes(S.settings.calcMode)) S.settings.calcMode = 'all';
  // new topics start enabled for people who already had progress
  const known = S.settings.known; Object.keys(TOPICS).forEach(k => { if (!known.includes(k)) { known.push(k); if (!S.settings.topics.includes(k)) S.settings.topics.push(k); } });
  S.settings.topics = S.settings.topics.filter(k => TOPICS[k]); if (!S.settings.topics.length) S.settings.topics = Object.keys(TOPICS);
  if (!(C.parts || []).some(p => p.id === S.settings.part && p.topics.length)) S.settings.part = 'all';
  SKILLS = C.skills || []; SKBYID = {}; LES2SK = {};
  SKILLS.forEach(s => { SKBYID[s.id] = s; (s.les || []).forEach(l => { LES2SK[l] = s.id; }); });
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
// calcMode: 'all' everything · 'theory' hides calc questions ("Só teoria") · 'math' only calc questions ("Só contas")
const calcMode = () => hasCalc() ? S.settings.calcMode : 'all';
const shown = (q, m = calcMode()) => m === 'all' || (m === 'theory' ? !q.calc : !!q.calc);
// Parts (C.parts): 1.º teste, 2.º teste… Picking one limits every mode to its topics; 'all' is the whole course.
const partTopics = () => { const p = (C.parts || []).find(x => x.id === S.settings.part); return p ? p.topics : Object.keys(TOPICS); };
const activeTopics = () => { const pt = partTopics(); return S.settings.topics.filter(k => pt.includes(k)); };
const inTopics = q => activeTopics().includes(q.t) && shown(q);
const hasCalc = () => BANK.some(q => q.calc);
const examCfg = () => Object.assign({ n: EXAM_N, min: EXAM_MIN, penalty: null, desc: '' }, C && C.exam);
const isReserved = q => q.reserved === 'exam';
const fresh = q => { const s = peek(q.id); return !s.c && !s.w && !s.ew; };

/* ---------- exam problem types, readiness, priority ----------
   C.skills lists the kinds of problem the exams ask. A question belongs to one, through its lesson
   (skill.les) or its own "k" (k: '' means none). Priority questions: their type came up in a past exam,
   or they come from one (src), or their type is marked core (base matter the exams rely on). The others are supplementary. A course without skills: all are priority. */
const skillOf = q => q.k !== undefined ? (q.k || null) : (LES2SK[q.les] || null);
const PAST_RE = /^(exame|teste|map|mini|repescagem)/i;
// "Exame 1 2024/25, 6.b" → "Exame 1 2024/25"; "Exame 2020/21, 2.ª época, P3" → "Exame 2020/21, 2.ª época"
function pastKey(src) {
  if (!src) return null; const seg = String(src).split(', ');
  let k = seg[0].replace(/\s*\(.*\)\s*$/, ''); if (seg[1] && /época|teste/i.test(seg[1])) k += ', ' + seg[1];
  return PAST_RE.test(k) && !/\se\s/.test(k) ? k : null;   // "Exames 2025/26 P4 e 2023/24 P1": in more than one, listed in neither
}
const isCore = q => { if (!SKILLS.length || q.origin !== 'base' || PAST_RE.test(q.src || '')) return true; const s = SKBYID[skillOf(q)]; return !!(s && (s.core || (s.seen && s.seen.length))); };
const basePool = () => BANK.filter(q => inTopics(q) && !isReserved(q));
const trainPool = () => basePool().filter(isCore);
const suppPool = () => basePool().filter(q => !isCore(q));
const skillQs = k => BANK.filter(q => skillOf(q) === k && !isReserved(q) && q.origin === 'base');
const partSkills = () => { const pt = partTopics(); return SKILLS.filter(s => pt.includes(s.t)); };
// The past exams that count now: the chosen part's, or the whole course's
const pastList = () => { const p = (C.parts || []).find(x => x.id === S.settings.part); return (p && p.past) || C.past || []; };
// ready: every question of the type answered right and none waiting in review
function readiness(k) {
  const qs = skillQs(k); let ok = 0, pend = 0, tried = 0;
  qs.forEach(q => { const s = peek(q.id); const p = (s.w && s.box < TRAIN_CLEAR) || (s.ew && s.eb < EXAM_CLEAR);
    if (s.c || s.w || s.ew) tried++; if (p) pend++; else if (s.c) ok++; });
  const state = !qs.length ? 'none' : ok === qs.length ? 'ready' : tried ? 'training' : 'todo';
  return { total: qs.length, ok, pend, state, pct: qs.length ? ok / qs.length : 0 };
}
// Readiness of the part, weighted by how often each type came up; and the type to train next
// Open-book exam (C.exam.book): the cheat sheet opens while practising and in the mock exam, as the real sheet would
const openBook = () => !!(C.exam && C.exam.book);
// Course order of a problem type: its topic's place in the course, then its place in C.skills
const skillAt = s => Object.keys(TOPICS).indexOf(s.t) * 1000 + SKILLS.indexOf(s);
function readySummary() {
  const rows = partSkills().map(s => ({ s, r: readiness(s.id), w: Math.max(1, (s.seen || []).length) })).filter(x => x.r.total);
  const W = rows.reduce((a, x) => a + x.w, 0);
  const next = rows.filter(x => x.r.state !== 'ready').sort((a, b) => skillAt(a.s) - skillAt(b.s))[0];
  return { rows, ready: rows.filter(x => x.r.state === 'ready').length, pct: W ? rows.reduce((a, x) => a + x.w * x.r.pct, 0) / W : 0, next: next && next.s };
}
// Past exams: questions grouped by their source, in the exam's order (steps of a problem stay together)
function pastGroups() {
  const pt = partTopics(), by = {};
  BANK.forEach(q => { const k = pastKey(q.src); if (k && pt.includes(q.t)) (by[k] = by[k] || []).push(q); });
  const item = q => String(q.src).slice(pastKey(q.src).length);
  Object.values(by).forEach(a => a.sort((x, y) => item(x).localeCompare(item(y), 'pt', { numeric: true }) || String(x.ch || x.id).localeCompare(String(y.ch || y.id)) || parseInt(x.step || 0) - parseInt(y.step || 0)));
  const yr = k => { const m = k.match(/(\d{4})\/\d{2}/); return m ? +m[1] : 0; }, order = pastList();
  return Object.keys(by).sort((a, b) => (order.includes(a) && order.includes(b) ? order.indexOf(a) - order.indexOf(b) : 0) || yr(b) - yr(a) || a.localeCompare(b, 'pt', { numeric: true })).map(k => ({ key: k, qs: by[k] }));
}
// The personal cheat sheet holds the types you got wrong at least once, plus the ones you pinned
const sheetMine = s => S.pins[s.id] === 1 || (S.pins[s.id] !== 0 && skillQs(s.id).some(q => { const x = peek(q.id); return x.w || x.ew; }));
const shortPast = k => k.replace(/^Exame\s*/i, '').replace(/^(\d)\s+(\d{4}\/\d{2})$/, '$2 E$1');
function mastery(level, topics = activeTopics(), m = calcMode()) {
  const qs = BANK.filter(q => q.l === level && topics.includes(q.t) && shown(q, m) && !isReserved(q) && isCore(q)); if (!qs.length) return { pct: 0, done: 0, total: 0 };
  const done = qs.filter(q => peek(q.id).c > 0).length; return { pct: done / qs.length, done, total: qs.length };
}
// Unlocked in mode m: the previous level shown in m is UNLOCK done; a level with nothing shown in m doesn't block
// (in "Só contas" level 1 usually has no calculations, so level 2 opens straight away).
function unlockedIn(level, m) { if (level === 1) return true; const p = mastery(level - 1, activeTopics(), m); return p.total ? p.pct >= UNLOCK : unlockedIn(level - 1, m); }
// A level stays open when the switch changes: what you passed with theory only (or with everything) still counts.
function unlocked(level) {
  if (level === 1 || S.settings.unlockAll) return true;
  return unlockedIn(level, calcMode()) || (hasCalc() && (unlockedIn(level, 'all') || unlockedIn(level, 'theory')));
}
function topLevel() { let t = 1; for (const L of LEVELS) if (unlocked(L.n)) t = L.n; return t; }
const reviewPool = () => basePool().filter(q => peek(q.id).w > 0 && peek(q.id).box < TRAIN_CLEAR).sort((a, b) => peek(a.id).box - peek(b.id).box || peek(a.id).last - peek(b.id).last);
const examReviewPool = () => BANK.filter(q => inTopics(q) && peek(q.id).ew > 0 && peek(q.id).eb < EXAM_CLEAR).sort((a, b) => peek(a.id).eb - peek(b.id).eb || peek(a.id).last - peek(b.id).last);
const freshReserved = () => BANK.filter(q => inTopics(q) && isReserved(q) && fresh(q));
// skipped questions wait here (ignoring "Só teoria": you skipped them to do later with paper)
const skippedPool = () => BANK.filter(q => S.skipped && S.skipped[q.id] && activeTopics().includes(q.t)).sort((a, b) => S.skipped[a.id] - S.skipped[b.id]);
function pick(pool, n) { // unseen first, then weakest, randomized within bands
  const bands = [[], [], []]; pool.forEach(q => { const s = peek(q.id); if (!s.c && !s.w && !s.ew) bands[0].push(q); else if (s.box < 2) bands[1].push(q); else bands[2].push(q); });
  return bands.flatMap(b => shuffle(b)).slice(0, n);
}
const totalXp = () => Object.values(G.c).reduce((a, c) => a + (c.xp || 0), 0);
function courseProgress(c) {
  const st_ = (G.c[c.id] && G.c[c.id].stats) || {}; const qs = c.questions.filter(q => !isReserved(q));
  const done = qs.filter(q => st_[q.id] && st_[q.id].c > 0).length; return { done, total: qs.length, xp: (G.c[c.id] && G.c[c.id].xp) || 0 };
}

/* ---------- view router ---------- */
let view = { name: 'home' };
let ses = null; // active session
function go(name, extra = {}) { view = Object.assign({ name }, extra); renderView(); window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); }
function renderView() {
  fxClose();
  const v = C || view.name === 'sync' ? view.name : 'courses';
  const html = v === 'courses' ? Courses() : v === 'home' ? Home() : v === 'quiz' ? Quiz() : v === 'lesson' ? LessonScreen() : v === 'results' ? Results() : v === 'library' ? Library() : v === 'reader' ? Reader() : v === 'bank' ? Bank() : v === 'notes' ? Notes() : v === 'learnpick' ? LearnPick() : v === 'reviewpick' ? ReviewPick() : v === 'routepick' ? RoutePick() : v === 'brief' ? BriefScreen() : v === 'sync' ? Sync() : v === 'ready' ? Ready() : v === 'past' ? Past() : v === 'sheet' ? Sheet() : v === 'formulas' ? Formulas() : v === 'recap' ? Recap() : v === 'prob' ? ProblemPick() : v === 'problem' ? Problem() : Home();
  document.documentElement.dataset.course = C && v !== 'courses' && v !== 'sync' ? C.id : '';
  $app.innerHTML = Top() + html;
  document.title = C && v !== 'courses' ? `${C.code} · Estudo IST` : 'Estudo IST';
  if (v === 'quiz') afterQuizRender();
  if (v === 'sync') afterSyncRender();
  if (v === 'problem') afterProblemRender();
  calcSync();
}
const toast = (msg) => { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };

function Top() {
  const inC = C && !['courses', 'sync'].includes(view.name);
  return `<header class="top">
    <button class="brand" data-act="${inC ? 'home' : 'courses'}" aria-label="Início">
      ${inC && C.logo ? C.logo : `<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 10 L20 20 M20 10 L10 20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="6" r="4" fill="var(--token)"/></svg>`}
      <b>${inC ? `${esc(C.code)} Treino` : 'Estudo IST'}</b></button>
    ${inC ? `<button class="chip" data-act="courses" title="Trocar de cadeira">Cadeiras ▾</button>` : ''}
    <span class="spacer"></span>
    ${inC ? `<span class="stat-pill" title="XP nesta cadeira · XP total em todas as cadeiras"><i></i>${S.xp} XP<span class="muted hide-narrow">· ${totalXp()} total</span></span>` : `<span class="stat-pill" title="XP total em todas as cadeiras"><i></i>${totalXp()} XP total</span>`}
    <button class="btn small theme-btn" data-act="theme" title="Tema: ${theme === 'auto' ? 'automático (segue o sistema)' : theme === 'light' ? 'claro' : 'escuro'}" aria-label="Mudar o tema (agora ${theme === 'auto' ? 'automático' : theme === 'light' ? 'claro' : 'escuro'})">${glyph(theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'auto')}<span class="hide-narrow">${theme === 'auto' ? 'Auto' : theme === 'light' ? 'Claro' : 'Escuro'}</span></button>
    ${view.name === 'sync' || (ses && !ses.ended) ? '' : `<button class="btn small" data-act="sync" title="Levar o progresso para outro dispositivo, ou trazê-lo">${glyph('swap')}<span class="hide-narrow">Outro dispositivo</span></button>`}
  </header>`;
}

/* ---------- COURSES (start menu) ---------- */
function Courses() {
  const list = REG.order.map(id => REG.courses[id]).filter(c => c.topics);
  const cards = list.map(c => { const p = courseProgress(c); const pct = p.total ? Math.round(p.done / p.total * 100) : 0;
    return `<button class="mode course-card" data-act="openC" data-id="${esc(c.id)}">
      <span class="eyebrow">${[c.year ? `${c.year}.º ano` : '', c.semester ? `${c.semester}.º sem.` : ''].filter(Boolean).join(' · ')}</span>
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
// Folded home sections remember being open, so a re-render (a toggle inside them) does not close them
const folds = {};
document.addEventListener('toggle', ev => { if (ev.target.id && ev.target.id.startsWith('fold-')) folds[ev.target.id] = ev.target.open; }, true);
function Home() {
  const tl = topLevel(); const dl = daysLeft(); const rp = reviewPool().length + examReviewPool().length; const nSk = skippedPool().length;
  const nFresh = freshReserved().length; const pt = partTopics(); const inPart = q => pt.includes(q.t) && !isReserved(q) && shown(q);
  const nTrain = BANK.filter(q => inPart(q) && isCore(q)).length, nSupp = BANK.filter(q => inPart(q) && !isCore(q)).length; const X = examCfg(); const M = C.map || {};
  const topicsChips = Object.entries(TOPICS).filter(([k]) => pt.includes(k)).map(([k, t]) => { const n = BANK.filter(q => q.t === k && inPart(q) && isCore(q)).length; return `<button class="chip" style="--c:${t.c}" data-act="topic" data-k="${k}" aria-pressed="${S.settings.topics.includes(k)}"><span class="sw"></span>${t.short} <span class="muted mono">${n}</span></button>`; }).join('');
  const link = `<span class="${M.link || 'seq'}" aria-hidden="true"></span>`;
  const ends = (e, cls) => e ? `<span class="hier" aria-hidden="true">${e.icon || ''}<span>${esc(e.label || '')}</span></span>` : `<span class="ev${cls}" aria-hidden="true"></span>`;
  const flow = LEVELS.map((L, i) => { const m = mastery(L.n), un = unlocked(L.n);
    return `${i ? link : ''}<button class="lvl l${L.n} ${un ? '' : 'locked'}" data-act="level" data-n="${L.n}" aria-label="Nível ${L.n} ${L.t}${un ? '' : ' (bloqueado)'}">
      ${un && L.n === tl ? '<span class="tok" title="Estás aqui"></span>' : ''}${un ? '' : '<span class="lock" aria-hidden="true">🔒</span>'}
      <span class="n">NÍVEL ${L.n}${L.tag ? ` · ${esc(L.tag)}` : ''}</span><span class="t">${L.t}</span>${L.sub ? `<span class="lat">${esc(L.sub)}</span>` : ''}<span class="pct">${m.done}/${m.total} dominadas</span>
      <span class="bar"><span style="width:${Math.round(m.pct * 100)}%"></span></span></button>`; }).join('');
  const std = [
    ['learn', 'Aprender', 'Teoria em pequenos cartões, cada um seguido de perguntas sobre ele. Começa por aqui.', `${LESSONS.filter(l => pt.includes(l.t)).length} lições`, glyph('book')],
    ['review', 'Revisão', 'Volta às perguntas que falhaste (treino e exame simulado) e às que saltaste.', rp || nSk ? [rp ? `${rp} por rever` : '', nSk ? `${nSk} saltada${nSk === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ') : 'nada por rever ainda', glyph('loop')],
    ['exam', 'Exame simulado', X.desc || `${X.n} perguntas, ${X.min} minutos, sem feedback até ao fim.${X.penalty ? ' Cotação real: resposta errada desconta, saltar deixa em branco.' : ''} Usa primeiro perguntas que não aparecem nos outros modos.`, nFresh ? `${nFresh} perguntas inéditas reservadas` : 'condições de teste', glyph('clock')],
    ['library', 'Biblioteca de teoria', 'Todas as lições, por tema, para leres de seguida.', `${pt.filter(k => LESSONS.some(l => l.t === k)).length} temas`, glyph('list')],
  ];
  const R = C.route; if (R && R.stops && R.stops.length) { const nd = R.stops.filter(x => routeProgress(x).pct >= UNLOCK).length;
    std.unshift(['route', esc(R.title || 'Percurso do exame'), esc(R.desc || 'O exame, parte a parte: o que sai, a teoria com exemplos e analogias, e exercícios como no exame.'), `${R.stops.length} partes · ${nd} feita${nd === 1 ? '' : 's'}`, glyph('route')]); }
  const card = ([k, t, d, m, g], act = 'mode') => `<button class="mode" data-act="${act}" data-k="${k}"><h3>${g}${t}</h3><p>${d}</p><span class="meta">${m}</span></button>`;
  const api = extraApi();
  const extras = (C.extras || []).filter(x => !x.hide || !x.hide(api)).map(x => card([x.id, esc(x.title), esc(x.desc), esc(x.meta ? x.meta(api) : ''), glyph(x.icon || 'star')], 'extra')).join('');
  // "Para o exame": readiness checklist, past exams, cheat sheet, supplementary questions
  const RS = SKILLS.length ? readySummary() : null; const PG = pastGroups();
  const PBS = pbTypes();
  const prep = [
    PBS.length ? ['prob', 'Problemas-chave', 'Os grandes problemas do exame, feitos por ti: escreves os valores, pedes pistas se encravares, e o que já sabes passa a vir feito.', `${PBS.filter(p => S.prob.t[p.id] && S.prob.t[p.id].done).length}/${PBS.length} pronto${PBS.length === 1 ? '' : 's'}`, glyph('star')] : null,
    RS && RS.rows.length ? ['ready', 'Prontidão', 'A checklist dos tipos de problema que saem nos exames, com o teu estado em cada um.', `${RS.ready}/${RS.rows.length} tipos prontos`, glyph('flag')] : null,
    PG.length ? ['past', 'Exames anteriores', 'Cada exame, pela ordem original, com as perguntas reescritas aqui. Os problemas grandes vêm por partes.', `${PG.length} exame${PG.length === 1 ? '' : 's'}`, glyph('clock')] : null,
    RS && RS.rows.length ? ['sheet', 'Cábula', 'A folha para levar para o exame: fórmulas, passos e armadilhas dos tipos onde falhaste, mais as tuas notas.', `${partSkills().filter(s => sheetMine(s)).length} na tua cábula`, glyph('pen')] : null,
    C.formulas && Object.keys(C.formulas).length ? ['formulas', 'Formulário', 'Todas as fórmulas da cadeira, com o que quer dizer cada símbolo. Nas lições e nos problemas, toca numa fórmula para ver o mesmo.', `${Object.keys(C.formulas).length} fórmulas`, glyph('pen')] : null,
    nSupp ? ['supp', 'Suplementares', 'Perguntas sobre matéria que ainda não saiu nos exames. Para ir mais fundo, depois do resto.', `${nSupp} perguntas`, glyph('plus')] : null,
  ].filter(Boolean);
  const readyCard = RS && RS.rows.length ? `<div class="ready-card">
      <div class="row"><h2>Prontidão para o exame</h2><span class="spacer"></span><span class="mono muted" style="font-size:12px">${RS.ready} de ${RS.rows.length} tipos prontos</span></div>
      <div class="ready-bar" aria-hidden="true">${RS.rows.map(x => `<i class="${x.r.state}" style="flex:${x.w}" title="${esc(x.s.label)}"></i>`).join('')}</div>
      <p class="muted" style="font-size:13.5px">${Math.round(RS.pct * 100)}% pronto, a contar mais o que sai mais vezes.</p>
      <div class="row"><button class="btn small" data-act="mode" data-k="ready">Ver a checklist</button></div>
    </div>` : '';
  const P = (C.parts || []);
  const partSwitch = P.length > 1 ? `<div class="seg" role="group" aria-label="Que parte da matéria">${P.map(p => `<button data-act="part" data-k="${esc(p.id)}" aria-pressed="${S.settings.part === p.id}" ${p.topics.length ? '' : 'disabled'} title="${esc(p.topics.length ? p.label : p.note || 'Ainda sem matéria')}">${esc(p.label)}${p.topics.length ? '' : ' · em breve'}</button>`).join('')}<button data-act="part" data-k="all" aria-pressed="${S.settings.part === 'all'}">Tudo</button></div>` : '';
  const mt = `<div class="mastery" role="table" aria-label="Domínio por tema e nível"><span></span>${LEVELS.map(L => `<span class="h">N${L.n}</span>`).join('')}
    ${Object.entries(TOPICS).filter(([k]) => pt.includes(k)).map(([k, t]) => `<span class="tn"><span class="chip static" style="--c:${t.c};padding:0;border:0;background:none"><span class="sw"></span></span>${t.short}</span>` + LEVELS.map(L => { const m = mastery(L.n, [k]); return m.total ? `<span class="cell" title="${m.done} de ${m.total}"><span style="width:${Math.round(m.pct * 100)}%"></span><em>${m.done}/${m.total}</em></span>` : '<span class="cell"><em>—</em></span>'; }).join('')).join('')}</div>`;
  return `<section class="hero">
      <span class="eyebrow">${esc(C.name)} · IST</span>
      <h1>${esc(C.tagline || C.name)}</h1>
      ${dl !== null ? `<p><b>${dl > 0 ? `Faltam ${dl} dia${dl === 1 ? '' : 's'} para o teste.` : dl === 0 ? 'O teste é hoje. Força!' : 'O teste já passou.'}</b></p>` : ''}
      ${partSwitch ? `<div class="row part-row"><span class="eyebrow">Matéria</span>${partSwitch}</div>` : ''}
    </section>
    ${PlanCard()}
    ${readyCard}
    <details class="section fold explore" id="fold-explore" ${folds['fold-explore'] ? 'open' : ''}><summary class="section-h"><h2>Explorar</h2><span class="muted" style="font-size:13px">níveis, temas, modos, exames anteriores, definições</span></summary>
    <div class="flow-card">
      <div class="row"><h2>${esc(M.title || 'Mapa de níveis')}</h2><span class="spacer"></span><span class="muted" style="font-size:13px">Desbloqueias o seguinte com ${Math.round(UNLOCK * 100)}% do anterior.</span></div>
      <div class="flow ${M.link ? 'flow-' + M.link : ''}" role="group" aria-label="Níveis">${ends(M.start, '')}${link}${flow}${link}${ends(M.end, ' end')}</div>
      <div class="flow-legend">${(M.legend || ['○ início', '◉ o token marca onde estás', '● fim = pronto para o teste']).map(x => `<span>${esc(x)}</span>`).join('')}</div>
    </div>
    <div class="stack">
      <div class="row"><span class="eyebrow">Temas em jogo</span><span class="spacer"></span>${hasCalc() ? calcSwitch() : ''}</div>
      <div class="chips">${topicsChips}</div>
    </div>
    <div class="section"><div class="section-h"><h2>Modos</h2></div><div class="modes">${std.map(c => card(c)).join('')}</div></div>
    ${prep.length ? `<div class="section"><div class="section-h"><h2>Para o exame</h2></div><div class="modes">${prep.map(c => card(c)).join('')}</div></div>` : ''}
    ${extras ? `<div class="section"><div class="section-h"><h2>Só de ${esc(C.code)}</h2></div><div class="modes">${extras}</div></div>` : ''}
    <details class="section fold" id="fold-mastery" ${folds['fold-mastery'] ? 'open' : ''}><summary class="section-h"><h2>Domínio</h2><span class="muted" style="font-size:13px">perguntas acertadas pelo menos uma vez</span></summary>${mt}</details>
    <details class="section fold" id="fold-settings" ${folds['fold-settings'] || view.confirmReset ? 'open' : ''}>
      <summary class="section-h"><h2>Definições</h2><span class="muted" style="font-size:13px">notas, importar, recomeçar</span></summary>
      <div class="row">
        <label class="toggle"><input type="checkbox" id="unlockAll" data-act="unlockAll" ${S.settings.unlockAll ? 'checked' : ''}> Desbloquear todos os níveis</label>
        <label class="toggle" title="Um botão no canto abre uma calculadora com frações, potências e logaritmos"><input type="checkbox" id="calcPad" ${S.settings.calc ?? hasCalc() ? 'checked' : ''}> Calculadora</label>
      </div>
      <div class="row">
        <button class="btn" data-act="bank">${glyph('plus')} Banco de perguntas e importar</button>
        <button class="btn" data-act="notes">${glyph('pen')} As minhas notas (${Object.keys(S.notes).filter(k => S.notes[k]).length})</button>
        <span class="spacer"></span>
        ${view.confirmReset ? `<span class="muted" style="font-size:13px">Apagar o progresso de ${esc(C.code)}?</span><button class="btn small" data-act="resetYes" style="color:var(--bad)">Sim, apagar</button><button class="btn small" data-act="resetNo">Cancelar</button>` : `<button class="btn ghost small" data-act="reset">Recomeçar do zero</button>`}
      </div>
    </details>
    </details>`;
}
// Tudo / Só teoria / Só contas: applies to every mode (levels, Aprender, Revisão, exame simulado, extras)
function calcSwitch() {
  const opts = [['all', 'Tudo', 'Teoria e contas, misturadas'], ['theory', 'Só teoria', 'Esconde as perguntas com contas'], ['math', 'Só contas', 'Só as perguntas com contas, como nos problemas do exame']];
  const cur = calcMode(), pool = BANK.filter(q => !isReserved(q) && activeTopics().includes(q.t) && isCore(q));
  return `<div class="seg" role="group" aria-label="Que perguntas mostrar">${opts.map(([k, t, d]) =>
    `<button data-act="calcMode" data-k="${k}" aria-pressed="${cur === k}" title="${d}">${t} <span class="mono">${pool.filter(q => shown(q, k)).length}</span></button>`).join('')}</div>`;
}
function glyph(k) {
  const p = { book: '<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z M24 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>', loop: '<path d="M6 13a8 8 0 0 1 14-5l2 2 M22 15a8 8 0 0 1-14 5l-2-2 M22 4v6h-6 M6 24v-6h6"/>', lens: '<circle cx="12" cy="12" r="7"/><path d="M17 17l6 6 M9 12h6 M12 9v6"/>', bolt: '<path d="M15 3L6 16h7l-1 9 9-13h-7z"/>', clock: '<circle cx="14" cy="14" r="10"/><path d="M14 8v6l4 3"/>', list: '<path d="M9 7h14 M9 14h14 M9 21h14"/><circle cx="5" cy="7" r="1.3"/><circle cx="5" cy="14" r="1.3"/><circle cx="5" cy="21" r="1.3"/>', plus: '<path d="M14 6v16 M6 14h16"/>', pen: '<path d="M6 22l2-6 11-11 4 4-11 11z M16 7l4 4"/>', star: '<path d="M14 3l3.2 7 7.3.6-5.6 4.8 1.8 7.3L14 18.8 7.3 22.7l1.8-7.3L3.5 10.6l7.3-.6z"/>', flag: '<path d="M6 25V4 M6 5h14l-3 5 3 5H6"/>', sun: '<circle cx="14" cy="14" r="5"/><path d="M14 3v3 M14 22v3 M3 14h3 M22 14h3 M6.2 6.2l2.1 2.1 M19.7 19.7l2.1 2.1 M6.2 21.8l2.1-2.1 M19.7 8.3l2.1-2.1"/>', moon: '<path d="M21 17.5A9 9 0 0 1 10.5 7a9 9 0 1 0 10.5 10.5z"/>', auto: '<circle cx="14" cy="14" r="9"/><path d="M14 5a9 9 0 0 1 0 18z" fill="currentColor"/>', skip: '<path d="M4 18c3-8 13-10 18-3 M22 9v6h-6 M4 22h20"/>', swap: '<path d="M4 9h18l-4-4 M24 19H6l4 4"/>', qr: '<path d="M4 4h7v7H4z M17 4h7v7h-7z M4 17h7v7H4z M17 17h3v3h-3z M21 21h3v3h-3z"/>', share: '<path d="M14 3v14 M9 8l5-5 5 5 M6 13v10h16V13"/>', copy: '<path d="M9 9h13v14H9z M6 19V5h13"/>', calc: '<rect x="6" y="3" width="16" height="22" rx="2.5"/><path d="M10 8h8 M10 13.5h.01 M14 13.5h.01 M18 13.5h.01 M10 18h.01 M14 18h.01 M10 22h.01 M14 22h.01 M18 18v4"/>', route: '<circle cx="6" cy="22" r="2.5"/><circle cx="22" cy="6" r="2.5"/><path d="M8.5 22H18a4 4 0 0 0 0-8h-8a4 4 0 0 1 0-8h9.5"/>' }[k] || '';
  return `<svg class="glyph" viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* ---------- EXAM ROUTE: the exam, part by part ----------
   course.route = { title, desc, stops: [{ id, part, title, pts, brief, drillIntro, lessons: [ids], topics: [t], drill }] }
   A stop: briefing (what this part of the exam asks) → each lesson followed by its exercises → a round "as in the exam". */
const stopQs = x => BANK.filter(q => !isReserved(q) && shown(q) && (x.lessons || []).includes(q.les));
function routeProgress(x) { const qs = stopQs(x); const done = qs.filter(q => peek(q.id).c > 0).length; return { done, total: qs.length, pct: qs.length ? done / qs.length : 0 }; }
function RoutePick() {
  const R = C.route; const last = S.route || {};
  const next = R.stops.find(x => routeProgress(x).pct < UNLOCK) || R.stops[0];
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">${esc(R.title || 'Percurso do exame')}</span></div>
  <h2 style="margin-bottom:6px">${esc(R.heading || 'O exame, parte a parte')}</h2><p class="muted" style="margin-bottom:14px">${esc(R.intro || 'Cada parte começa pelo que o exame costuma pedir, explica a teoria com exemplos e analogias e acaba com exercícios no estilo do exame. Faz pela ordem do exame ou salta para a que te preocupa.')}</p>
  <ol class="route">${R.stops.map((x, i) => { const p = routeProgress(x); const isNext = x === next; const T = TOPICS[(x.topics || [])[0]] || {};
    return `<li class="stop ${p.pct >= UNLOCK ? 'done' : ''} ${isNext ? 'next' : ''}" style="--c:${T.c || 'var(--accent)'}">
      <span class="pin" aria-hidden="true">${p.pct >= UNLOCK ? '✓' : i + 1}</span>
      <button class="stop-card" data-act="routeStop" data-k="${esc(x.id)}">
        <span class="eyebrow">${esc(x.part || `Parte ${i + 1}`)}${x.pts ? ` · ${esc(x.pts)}` : ''}${last[x.id] ? ' · já passaste aqui' : ''}</span>
        <h3>${esc(x.title)}</h3>${x.sum ? `<p>${esc(x.sum)}</p>` : ''}
        <span class="lvl-bar"><span style="width:${Math.round(p.pct * 100)}%"></span></span>
        <span class="meta">${(x.lessons || []).length} lições · ${p.done}/${p.total} exercícios acertados${isNext ? ' · <b>a seguir</b>' : ''}</span>
      </button></li>`; }).join('')}</ol>`;
}
function routeItems(x) {
  const items = [{ kind: 'brief', stop: x.id, part: 'intro' }]; const used = new Set();
  const base = BANK.filter(q => !isReserved(q) && shown(q));
  (x.lessons || []).forEach(lid => { if (!LBYID[lid]) return; items.push({ kind: 'lesson', id: lid });
    const qs = base.filter(q => q.les === lid && !used.has(q.id));
    const ord = qs.sort((a, b) => a.l - b.l || peek(a.id).c - peek(b.id).c || Math.random() - .5);
    // one to check the idea, one a step up (a different level when there is one)
    const first = ord[0]; const second = first && (ord.find(q => q !== first && q.l > first.l) || ord[1]);
    [first, second].filter(Boolean).forEach(q => { used.add(q.id); items.push(makeItem(q)); }); });
  const n = x.drill === undefined ? 5 : x.drill;
  if (n) { const topics = x.topics || []; let dq = pick(base.filter(q => topics.includes(q.t) && q.l >= 3 && !used.has(q.id)), n);
    if (dq.length < n) dq = dq.concat(pick(base.filter(q => topics.includes(q.t) && q.l === 2 && !used.has(q.id) && !dq.includes(q)), n - dq.length));
    if (dq.length) { items.push({ kind: 'brief', stop: x.id, part: 'drill' }); shuffle(dq).forEach(q => items.push(makeItem(q))); } }
  return items;
}
function BriefScreen() {
  const it = curItem(); const x = C.route.stops.find(s => s.id === it.stop); const drill = it.part === 'drill'; const T = TOPICS[(x.topics || [])[0]] || { c: 'var(--accent)', short: '' };
  const body = drill ? (x.drillIntro || '<p>Agora sem rede: perguntas como as do exame, misturadas. Responde como se fosse a sério e usa <b>Saltar</b> se precisares de papel.</p>') : x.brief;
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="badge" style="--c:${T.c}"><span class="sw"></span>${esc(x.part || '')}</span><span class="mono muted">${drill ? 'como no exame' : 'briefing'}</span></div>
    <article class="card brief"><span class="eyebrow">${drill ? 'Ronda final' : `${esc(x.part || '')}${x.pts ? ` · ${esc(x.pts)}` : ''}`}</span><h2 style="margin:6px 0 12px">${drill ? `${esc(x.title)}: como sai no exame` : esc(x.title)}</h2><div class="lesson">${body}</div>
    <div class="qfoot"><button class="btn primary" data-act="next" id="nextBtn">${drill ? 'Começar a ronda →' : 'Vamos à teoria →'}</button><span class="kbd">Enter</span><span class="spacer"></span><button class="btn ghost small" data-act="quit">Terminar</button></div></article>`;
}

/* ---------- REVIEW: two tabs ---------- */
function ReviewPick() {
  const a = reviewPool().length, b = examReviewPool().length, c = skippedPool().length;
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">Revisão</span></div>
  <div class="modes">
    <button class="mode" data-act="startReview" data-k="review" ${a ? '' : 'disabled'}><h3>${glyph('loop')}Erros de treino</h3><p>Perguntas que falhaste nos níveis, em Aprender e nas secções da cadeira. Saem quando as acertares ${TRAIN_CLEAR} vezes seguidas.</p><span class="meta">${a ? `${a} por rever` : 'nada por rever'}</span></button>
    <button class="mode" data-act="startReview" data-k="reviewExam" ${b ? '' : 'disabled'}><h3>${glyph('flag')}Erros de exame</h3><p>O que falhaste em condições de teste. Saem quando as acertares ${EXAM_CLEAR} vezes seguidas aqui.</p><span class="meta">${b ? `${b} por rever` : 'nada por rever'}</span></button>
    <button class="mode" data-act="startReview" data-k="skipped" ${c ? '' : 'disabled'}><h3>${glyph('skip')}Saltadas</h3><p>As perguntas que saltaste. Pega em papel e caneta e tenta agora. Saem da lista quando lhes responderes.</p><span class="meta">${c ? `${c} à espera` : 'nenhuma saltada'}</span></button>
  </div>`;
}

/* ---------- sessions ---------- */
function makeItem(q) { const n = q.o.length; const order = q.fixed ? [...Array(n).keys()] : shuffle([...Array(n).keys()]); return { kind: 'q', id: q.id, order }; }
function buildExam() {
  // 1) unseen reserved questions; 2) fill with the usual level mix from training; 3) reserved ones already seen
  const EXAM_N = examCfg().n;
  let qs = shuffle(freshReserved()).slice(0, EXAM_N);
  const used = new Set(qs.map(q => q.id));
  if (qs.length < EXAM_N) {
    const tp = trainPool().filter(q => !used.has(q.id)); const by = (l, n) => pick(tp.filter(q => q.l === l), n);
    const r = EXAM_N / 20; const mix = shuffle([...by(2, Math.ceil(7 * r)), ...by(3, Math.ceil(8 * r)), ...by(4, Math.ceil(5 * r))]).slice(0, EXAM_N - qs.length);
    mix.forEach(q => used.add(q.id)); qs = qs.concat(mix);
  }
  if (qs.length < EXAM_N) qs = qs.concat(shuffle(BANK.filter(q => inTopics(q) && isReserved(q) && !used.has(q.id))).slice(0, EXAM_N - qs.length));
  return shuffle(qs);
}
const viewOf = it => it.kind === 'lesson' ? 'lesson' : it.kind === 'brief' ? 'brief' : 'quiz';
/* Aprender. A lesson whose html has <!--card--> markers is split into cards, one idea each. A question names its card
   with card: n. The flow: card 1, one question on it, card 2, one question on it, …, then two questions on the
   earlier cards ("Revisão rápida"), asked after other cards, which makes the student recall instead of recognise.
   A lesson with no markers stays as before: the whole text, then its two easiest questions. */
const CARD_CUT = /<!--\s*card\s*-->/;
const lessonCards = L => (L.html || '').split(CARD_CUT);
function learnItems(L) {
  const easy = (a, b) => a.l - b.l || peek(a.id).c - peek(b.id).c;
  const qs = basePool().filter(q => q.les === L.id && !q.ch).sort(easy), n = lessonCards(L).length;
  if (n < 2) return [{ kind: 'lesson', id: L.id }, ...basePool().filter(q => q.les === L.id).sort(easy).slice(0, 2).map(makeItem)];
  const items = [], used = new Set();
  for (let k = 1; k <= n; k++) {
    items.push({ kind: 'lesson', id: L.id, card: k, cards: n });
    const q = qs.find(x => x.card === k && shown(x)); if (q) { used.add(q.id); items.push(makeItem(q)); }
  }
  // recall: earlier cards first, one question per card, never the one just asked
  const left = qs.filter(x => x.card && x.card < n && !used.has(x.id) && shown(x)), rec = [];
  for (let k = 1; k < n && rec.length < 2; k++) { const q = left.find(x => x.card === k); if (q) rec.push(q); }
  left.forEach(x => { if (rec.length < 2 && !rec.includes(x)) rec.push(x); });
  rec.forEach(q => items.push(Object.assign(makeItem(q), { recall: true })));
  return items;
}
// work units of a lesson in Aprender (a question = 1, reading the lesson = 2), for the times in the plan
const learnUnits = L => 2 + learnItems(L).filter(x => x.kind === 'q').length;
function start(mode, opts = {}) {
  let items = [], title = '', timeLimit = 0;
  const pool = trainPool();
  if (mode !== 'route' && !BANK.some(inTopics)) { toast('Escolhe pelo menos um tema.'); return; }
  if (mode === 'level') { const L = opts.level; items = pick(pool.filter(q => q.l === L), 10).map(makeItem); title = `Nível ${L} · ${LEVELS[L - 1].t}`; }
  if (mode === 'review') { items = reviewPool().slice(0, 12).map(makeItem); title = 'Revisão · erros de treino'; if (!items.length) { toast('Ainda não tens erros de treino para rever.'); return; } }
  if (mode === 'skipped') { items = skippedPool().slice(0, 12).map(makeItem); title = 'Revisão · saltadas'; if (!items.length) { toast('Não tens perguntas saltadas.'); return; } }
  if (mode === 'reviewExam') { items = examReviewPool().slice(0, 12).map(makeItem); title = 'Revisão · erros de exame'; if (!items.length) { toast('Ainda não tens erros de exame para rever.'); return; } }
  if (mode === 'warm' || mode === 'recap') { items = (opts.ids || []).filter(id => BYID[id]).map(id => makeItem(BYID[id])); title = mode === 'warm' ? 'Aquecimento' : 'Resumo de hoje'; if (!items.length) { toast('Nada para rever agora.'); return; } }
  if (mode === 'extra') { const x = (C.extras || []).find(e => e.id === opts.extra); if (!x) return; items = (x.questions(extraApi()) || []).map(makeItem); title = x.title; }
  if (mode === 'exam') { items = buildExam().map(makeItem); title = 'Exame simulado'; timeLimit = examCfg().min * 60; }
  if (mode === 'supp') { items = pick(suppPool(), 10).sort((a, b) => a.l - b.l).map(makeItem); title = 'Suplementares'; }
  if (mode === 'skill') {
    // one exam problem type: a few single questions (weakest first), then one whole problem in steps
    const s = SKBYID[opts.k]; if (!s) return; title = s.label;
    // a problem in steps comes whole, even when its other steps belong to other types (forward → backprop)
    const qs = skillQs(s.id), single = qs.filter(q => !q.ch), by = {}, chs = new Set(qs.filter(q => q.ch).map(q => q.ch));
    BANK.filter(q => chs.has(q.ch) && !isReserved(q)).forEach(q => (by[q.ch] = by[q.ch] || []).push(q));
    const chains = Object.values(by).map(a => a.sort((x, y) => parseInt(x.step) - parseInt(y.step)));
    const done = a => a.filter(q => peek(q.id).c > 0 && !(peek(q.id).w && peek(q.id).box < TRAIN_CLEAR)).length / a.length;
    const chain = chains.map(a => [done(a) + Math.random() * 0.3, a]).sort((x, y) => x[0] - y[0]).map(x => x[1])[0] || [];
    items = [...pick(single, chain.length ? 6 : 8).sort((a, b) => a.l - b.l), ...chain].map(makeItem);
  }
  if (mode === 'past') {
    const g = pastGroups().find(x => x.key === opts.key); if (!g) return; title = g.key;
    items = g.qs.map(makeItem);
  }
  if (mode === 'learn') {
    const t = opts.topic; title = opts.title || `Aprender · ${TOPICS[t].short}`;
    // in "Só contas" a lesson with no calculation questions is skipped: that theory was already done
    LESSONS.filter(l => l.t === t && (!opts.les || opts.les.includes(l.id))).forEach(l => {
      const li = learnItems(l);
      if (calcMode() === 'math' && !li.some(x => x.kind === 'q')) return;
      items.push(...li); });
  }
  if (mode === 'route') { const x = (C.route.stops || []).find(s => s.id === opts.stop); if (!x) return; items = routeItems(x); title = `${x.part ? x.part + ' · ' : ''}${x.title}`; }
  if (mode === 'retry') { items = opts.ids.map(id => BYID[id]).filter(Boolean).map(makeItem); title = 'Repetir erros'; }
  if (!items.length) { toast('Não há perguntas para estes filtros.'); return; }
  ses = { mode, title, items, i: 0, planKey: opts.planKey || null, results: [], picked: new Set(), answered: false, xp: 0, timeLimit, startedAt: Date.now(), level: opts.level, stop: opts.stop, nextWasOpen: !!opts.level && opts.level < LEVELS.length && unlocked(opts.level + 1), topic: opts.topic, skill: mode === 'skill' ? opts.k : null, examGrading: mode === 'reviewExam' || !!opts.examGrading, ended: false };
  if (timeLimit) startTimer();
  go(viewOf(items[0]));
}
