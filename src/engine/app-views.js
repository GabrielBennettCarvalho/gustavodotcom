let tick = null;
function startTimer() { clearInterval(tick); tick = setInterval(() => { if (!ses || ses.ended) { clearInterval(tick); return; } const left = ses.timeLimit - Math.floor((Date.now() - ses.startedAt) / 1000); const el = document.getElementById('timer'); if (el) { el.textContent = fmt(Math.max(0, left)); el.classList.toggle('hot', left <= 120); } if (left <= 0) finish(); }, 250); }
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const curItem = () => ses.items[ses.i];
const qCount = () => ses.items.filter(x => x.kind === 'q').length;
const qIndex = () => ses.items.slice(0, ses.i + 1).filter(x => x.kind === 'q').length;

/* ---------- QUIZ ---------- */
function Quiz() {
  const it = curItem(), q = BYID[it.id]; const T = TOPICS[q.t]; const multi = Array.isArray(q.a);
  const isExam = ses.mode === 'exam';
  const prog = `<div class="progress" aria-hidden="true">${ses.items.filter(x => x.kind === 'q').map((x, i) => { const r = ses.results.find(rr => rr.item === x); const cur = x === it; return `<i class="${r ? (isExam ? 'cur' : r.ok ? 'ok' : 'ko') : cur ? 'cur' : ''}"></i>`; }).join('')}</div>`;
  const opts = it.order.map((oi, pos) => { let cls = ''; const isRight = multi ? q.a.includes(oi) : q.a === oi; const chosen = ses.picked.has(oi);
    if (ses.answered && !isExam) { if (isRight) cls = 'right'; else if (chosen) cls = 'wrong'; } else if (chosen) cls = 'sel';
    return `<button class="opt ${cls}" data-act="opt" data-oi="${oi}" ${ses.answered ? 'disabled' : ''}><span class="k">${multi ? (chosen ? '✓' : pos + 1) : pos + 1}</span><span class="txt">${md(q.o[oi])}</span></button>`; }).join('');
  let fb = '';
  if (ses.answered && !isExam) fb = Feedback(q, it);
  const foot = ses.answered ? (isExam ? '' : `<div class="qfoot"><button class="btn primary" data-act="next" id="nextBtn">${ses.i >= ses.items.length - 1 ? 'Ver resultado' : 'Seguinte'} →</button><span class="kbd">Enter</span><span class="spacer"></span><button class="btn ghost small" data-act="quit">Terminar ronda</button></div>`)
    : `<div class="qfoot">${multi ? `<button class="btn primary" data-act="confirm" ${ses.picked.size ? '' : 'disabled'}>Confirmar</button>` : ''}<span class="muted" style="font-size:12.5px">Teclas <span class="kbd">1</span>–<span class="kbd">${q.o.length}</span>${multi ? ' marcam, <span class="kbd">Enter</span> confirma' : ''}</span><span class="spacer"></span>${isExam ? `<button class="btn ghost small" data-act="finish">Entregar exame</button>` : `<button class="btn ghost small" data-act="quit">Terminar ronda</button>`}</div>`;
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="badge" style="--c:${T.c}"><span class="sw"></span>${T.short}</span><span class="badge">N${q.l}</span>${prog}${(isExam) ? `<span class="timer" id="timer">${fmt(ses.timeLimit - Math.floor((Date.now() - ses.startedAt) / 1000))}</span>` : ''}<span class="mono muted">${qIndex()}/${qCount()}</span></div>
    <article class="card" id="qcard">
      <span class="eyebrow">${esc(ses.title)}</span>
      <p class="qtext" style="margin-top:6px">${md(q.q)}</p>
      ${multi ? '<div class="multi-note">Seleciona todas as corretas</div>' : ''}
      ${q.ctx && LBYID[q.ctx] ? `<details class="lesson-peek" style="margin-top:12px"><summary>Ler o caso: ${esc(LBYID[q.ctx].title)}</summary><div class="lbody lesson">${lessonBody(LBYID[q.ctx])}</div></details>` : ''}
      ${q.d ? `<div class="diagram">${renderD(q.d)}</div>` : ''}
      <div class="opts" role="group" aria-label="Opções">${opts}</div>
      ${fb}
      ${foot}
    </article>`;
}
function Feedback(q, it) {
  const r = ses.results.find(rr => rr.item === it); const ok = r && r.ok;
  const wrongNotes = [...ses.picked].filter(oi => (Array.isArray(q.a) ? !q.a.includes(oi) : q.a !== oi) && q.w && q.w[oi]).map(oi => `<p class="why-wrong"><b>Porque não “${md(q.o[oi])}”:</b> ${md(q.w[oi])}</p>`).join('');
  const L = q.les && LBYID[q.les];
  return `<div class="feedback ${ok ? 'ok' : 'ko'}" aria-live="polite">
    <div class="verdict">${ok ? pickOne(['Certo.', 'Exatamente.', 'Na mouche.', 'Isso mesmo.']) : pickOne(['Ainda não.', 'Quase, mas não.', 'Falhou. Bora perceber porquê.'])}</div>
    <p class="explain">${md(q.e)}</p>
    ${wrongNotes}
    ${L ? `<details class="lesson-peek" ${ok ? '' : 'open'}><summary>Teoria: ${esc(L.title)}</summary><div class="lbody lesson">${lessonBody(L)}</div></details>` : ''}
    <div class="note-box"><label class="eyebrow" for="note-${esc(q.id)}">A minha nota sobre esta pergunta</label><textarea id="note-${esc(q.id)}" data-act="note" data-id="${esc(q.id)}" placeholder="Escreve aqui o truque para não voltares a errar…">${esc(S.notes[q.id] || '')}</textarea></div>
    ${q.src ? `<span class="src">Fonte: ${esc(q.src)}</span>` : ''}
  </div>`;
}
const pickOne = a => a[Math.floor(Math.random() * a.length)];
function lessonBody(L) { const body = L.trusted ? L.html : md(L.html || ''); return `${body}${L.d ? `<div class="diagram">${renderD(L.d)}</div>` : ''}${L.key ? `<p class="key">${L.trusted ? L.key : md(L.key)}</p>` : ''}`; }
function afterQuizRender() { const n = document.getElementById('nextBtn'); if (n) n.focus({ preventScroll: true }); }

function choose(oi) {
  if (!ses || ses.answered) return; const q = BYID[curItem().id];
  if (Array.isArray(q.a)) { ses.picked.has(oi) ? ses.picked.delete(oi) : ses.picked.add(oi); renderView(); return; }
  ses.picked = new Set([oi]); grade();
}
function grade() {
  const it = curItem(), q = BYID[it.id]; const picked = [...ses.picked];
  const ok = Array.isArray(q.a) ? (picked.length === q.a.length && q.a.every(x => ses.picked.has(x))) : picked[0] === q.a;
  ses.answered = true; ses.results.push({ item: it, id: q.id, ok, picked });
  const s = st(q.id); s.last = Date.now();
  if (ses.mode === 'exam') { if (ok) s.c++; else { s.ew++; s.eb = 0; } }           // exam mistake: goes to the exam review
  else if (ses.examGrading) { if (ok) { s.c++; s.eb++; } else { s.ew++; s.eb = 0; } }
  else if (ok) { s.c++; s.box = Math.min(5, s.box + 1); } else { s.w++; s.box = 0; }
  if (ses.mode !== 'exam') { const gain = ok ? XP[q.l] + (s.c === 1 && !s.w && !s.ew ? 5 : 0) : 0; S.xp += gain; ses.xp += gain; }
  save();
  if (ses.mode === 'exam') { next(); return; }
  renderView();
}
function next() {
  if (!ses) return;
  if (ses.i >= ses.items.length - 1) { finish(); return; }
  ses.i++; ses.picked = new Set(); ses.answered = false;
  go(curItem().kind === 'lesson' ? 'lesson' : 'quiz');
}
function finish() {
  if (!ses || ses.ended) return; ses.ended = true; clearInterval(tick);
  if (ses.mode === 'exam') { const tot = ses.items.length, ok = ses.results.filter(r => r.ok).length; ses.grade = Math.round(ok / tot * 200) / 10; const g = ses.results.filter(r => r.ok).reduce((a, r) => a + XP[BYID[r.id].l], 0); S.xp += g; ses.xp = g; }
  S.rounds++; S.sessions.push({ m: ses.mode, d: Date.now(), n: ses.results.length, ok: ses.results.filter(r => r.ok).length }); if (S.sessions.length > 400) S.sessions = S.sessions.slice(-400);
  save(); go('results');
}

/* ---------- LESSON (inside learn session) ---------- */
function LessonScreen() {
  const L = LBYID[curItem().id]; const T = TOPICS[L.t];
  const lessonsTotal = ses.items.filter(x => x.kind === 'lesson').length; const li = ses.items.slice(0, ses.i + 1).filter(x => x.kind === 'lesson').length;
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="badge" style="--c:${T.c}"><span class="sw"></span>${T.short}</span><span class="mono muted">lição ${li}/${lessonsTotal}</span></div>
    <article class="card"><span class="eyebrow">Teoria</span><h2 style="margin:6px 0 12px">${esc(L.title)}</h2><div class="lesson">${lessonBody(L)}</div>
    <div class="qfoot"><button class="btn primary" data-act="next" id="nextBtn">${ses.items[ses.i + 1] && ses.items[ses.i + 1].kind === 'q' ? 'Testar-me →' : 'Continuar →'}</button><span class="kbd">Enter</span><span class="spacer"></span><button class="btn ghost small" data-act="quit">Terminar</button></div></article>`;
}

/* ---------- RESULTS ---------- */
function Results() {
  const r = ses.results; const ok = r.filter(x => x.ok).length; const tot = r.length; const wrong = r.filter(x => !x.ok);
  const lvl = ses.level; const nowUnlocked = lvl && lvl < 4 && unlocked(lvl + 1);
  let big = `${ok}/${tot}`, sub = tot ? `${Math.round(ok / tot * 100)}% de acerto` : 'sem respostas';
  if (ses.mode === 'exam') { big = `${ses.grade.toFixed(1)}`; sub = `valores em 20 · ${ok} de ${ses.items.length} certas${tot < ses.items.length ? ` (${ses.items.length - tot} por responder)` : ''}`; }
  const list = wrong.map(x => { const q = BYID[x.id]; const ans = (Array.isArray(q.a) ? q.a : [q.a]).map(i => md(q.o[i])).join(' · ');
    return `<div class="review-item"><span class="badge" style="--c:${TOPICS[q.t].c};align-self:flex-start"><span class="sw"></span>${TOPICS[q.t].short} · N${q.l}</span><p class="q">${md(q.q)}</p>${q.d ? `<div class="diagram">${renderD(q.d)}</div>` : ''}<p class="a">Resposta: <b>${ans}</b></p><p class="x">${md(q.e)}</p></div>`; }).join('');
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">${esc(ses.title)} · resultado</span></div>
    <article class="card stack">
      <div><div class="score-big">${big}</div><p class="muted">${sub}</p></div>
      <div class="result-grid"><div class="kpi"><b>+${ses.xp}</b><span>XP ganho</span></div><div class="kpi"><b>${wrong.length}</b><span>para rever</span></div><div class="kpi"><b>${topLevel()}</b><span>nível mais alto aberto</span></div></div>
      ${nowUnlocked ? `<p class="key" style="margin:0">Nível ${lvl + 1} desbloqueado. O token avançou.</p>` : ''}
      <div class="row">${wrong.length ? `<button class="btn primary" data-act="retryWrong">Repetir as ${wrong.length} erradas</button>` : ''}${lvl ? `<button class="btn" data-act="level" data-n="${nowUnlocked ? lvl + 1 : lvl}">${nowUnlocked ? `Ir para o nível ${lvl + 1}` : `Outra ronda do nível ${lvl}`}</button>` : ''}<button class="btn" data-act="home">Início</button></div>
    </article>
    ${wrong.length ? `<div class="section"><h2>O que falhaste, explicado</h2>${list}</div>` : `<div class="section"><p class="muted">Sem erros nesta ronda.</p></div>`}`;
}

/* ---------- LIBRARY / READER ---------- */
function LearnPick() {
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">Aprender</span></div>
  <h2 style="margin-bottom:6px">Escolhe um tema</h2><p class="muted" style="margin-bottom:14px">Cada lição curta é seguida de duas perguntas sobre ela.</p>
  <div class="lesson-list">${Object.entries(TOPICS).map(([k, t]) => { const n = LESSONS.filter(l => l.t === k).length; return n ? `<button class="lesson-item" style="--c:${t.c}" data-act="learn" data-k="${k}"><span class="sw"></span><span class="lt">${t.label}</span><span class="lc">${n} lições</span></button>` : ''; }).join('')}</div>`;
}
function Library() {
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">Biblioteca de teoria</span></div>
  ${Object.entries(TOPICS).map(([k, t]) => { const ls_ = LESSONS.filter(l => l.t === k); if (!ls_.length) return ''; return `<div class="section"><div class="section-h"><h2>${t.label}</h2></div><div class="lesson-list">${ls_.map(l => `<button class="lesson-item" style="--c:${t.c}" data-act="read" data-id="${esc(l.id)}"><span class="sw"></span><span class="lt">${esc(l.title)}</span><span class="lc">${BANK.filter(q => q.les === l.id && !isReserved(q)).length} perguntas</span></button>`).join('')}</div></div>`; }).join('')}`;
}
function Reader() {
  const L = LBYID[view.id]; if (!L) return Library(); const T = TOPICS[L.t]; const sib = LESSONS.filter(l => l.t === L.t); const idx = sib.indexOf(L);
  const qs = BANK.filter(q => q.les === L.id && !isReserved(q));
  return `<div class="qhead"><button class="btn small" data-act="library" aria-label="Voltar à biblioteca">←</button><span class="badge" style="--c:${T.c}"><span class="sw"></span>${T.short}</span><span class="mono muted">${idx + 1}/${sib.length}</span></div>
  <article class="card"><h2 style="margin-bottom:12px">${esc(L.title)}</h2><div class="lesson">${lessonBody(L)}</div>
  <div class="qfoot">${qs.length ? `<button class="btn primary" data-act="practice" data-id="${esc(L.id)}">Praticar ${qs.length} pergunta${qs.length === 1 ? '' : 's'} desta lição</button>` : ''}<span class="spacer"></span>${idx > 0 ? `<button class="btn small" data-act="read" data-id="${esc(sib[idx - 1].id)}">← Anterior</button>` : ''}${idx < sib.length - 1 ? `<button class="btn small" data-act="read" data-id="${esc(sib[idx + 1].id)}">Seguinte →</button>` : ''}</div></article>`;
}

/* ---------- NOTES ---------- */
function Notes() {
  const ids = Object.keys(S.notes).filter(k => S.notes[k] && BYID[k]);
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">As minhas notas</span></div>
  ${ids.length ? ids.map(id => { const q = BYID[id]; return `<div class="review-item" style="margin-bottom:10px"><span class="badge" style="--c:${TOPICS[q.t].c};align-self:flex-start"><span class="sw"></span>${TOPICS[q.t].short} · N${q.l}</span><p class="q">${md(q.q)}</p><p class="a">Resposta: <b>${(Array.isArray(q.a) ? q.a : [q.a]).map(i => md(q.o[i])).join(' · ')}</b></p><p class="x" style="color:var(--ink)">📝 ${md(S.notes[id])}</p></div>`; }).join('') : '<p class="muted">Ainda não escreveste notas. Depois de responderes a uma pergunta, aparece uma caixa para guardares o teu truque.</p>'}`;
}

/* ---------- BANK / IMPORT ---------- */
function importPrompt() {
  const imp = C.importHelp || {};
  return `Gera perguntas de escolha múltipla para estudar ${C.code} (${C.name}, IST) sobre [TEMA].
Responde APENAS com JSON válido neste formato:
{"name":"Nome do pacote","questions":[{"id":"único-por-pergunta","t":"${Object.keys(TOPICS).join('|')}","l":1,"q":"enunciado","o":["opção A","opção B","opção C","opção D"],"a":0,"e":"explicação teórica de porque a resposta certa é a certa","w":{"1":"porque é que a opção B está errada"}}]}
Regras: "l" é o nível (1 = definições, 2 = distinguir conceitos, 3 = cenários/diagramas, 4 = armadilhas). "a" é o índice (começa em 0) da opção certa, ou uma lista de índices se houver várias certas. ${imp.notes || 'Explicações em português de Portugal.'} Opcional: "les" com o id da lição relacionada.`;
}
function Bank() {
  const counts = Object.keys(TOPICS).map(k => `<span class="chip static" style="--c:${TOPICS[k].c}"><span class="sw"></span>${TOPICS[k].short} ${BANK.filter(q => q.t === k).length}</span>`).join('');
  const all = packs.map((p, i) => ({ ...p, _i: i })).filter(p => p.course === C.id);
  return `<div class="qhead"><button class="btn small" data-act="home" aria-label="Voltar ao início">←</button><span class="eyebrow">Banco de perguntas</span></div>
  <div class="stack">
    <h2>${BANK.length} perguntas, ${LESSONS.length} lições</h2><div class="chips">${counts}</div>
    <div class="card stack">
      <h3>Acrescentar perguntas</h3>
      <p class="muted" style="font-size:14px">Cola um pacote JSON (ou escolhe um ficheiro .json).</p>
      <textarea class="code" id="importBox" spellcheck="false" placeholder='{"name":"…","questions":[…]}'>${esc(view.draft || '')}</textarea>
      <div class="row"><button class="btn primary" data-act="import">Importar</button><label class="btn" for="importFile">Escolher ficheiro</label><input type="file" id="importFile" accept=".json,application/json" hidden><span class="spacer"></span><button class="btn small" data-act="copyPrompt">Copiar prompt para gerar perguntas</button><button class="btn small" data-act="example">Ver exemplo</button></div>
      ${view.msg ? `<p class="msg ${view.msgOk ? 'ok' : 'ko'}">${esc(view.msg)}</p>` : ''}
      <details class="lesson-peek"><summary>Formato de cada pergunta</summary><div class="lbody" style="font-size:14px">
        <p><code class="mono">id</code> texto único · <code class="mono">t</code> tema (${Object.keys(TOPICS).join(', ')}) · <code class="mono">l</code> nível 1–4 · <code class="mono">q</code> enunciado · <code class="mono">o</code> 2 a 6 opções · <code class="mono">a</code> índice da certa (0 = primeira) ou lista de índices · <code class="mono">e</code> explicação · opcional <code class="mono">w</code> nota por opção errada, <code class="mono">les</code> lição, <code class="mono">src</code> fonte, <code class="mono">fixed</code> não baralhar opções.</p>
        <textarea class="code" readonly style="min-height:150px" id="promptBox">${esc(importPrompt())}</textarea></div></details>
    </div>
    <div class="stack"><h3>Pacotes importados</h3>
      ${all.length ? all.map(p => `<div class="pack"><b>${esc(p.name || 'Sem nome')}</b><span class="muted mono">${(p.questions || []).length} perguntas · neste browser</span><span class="spacer"></span>${view.confirmDel === p._i ? `<button class="btn small" style="color:var(--bad)" data-act="delPackYes" data-i="${p._i}">Confirmar remoção</button><button class="btn small" data-act="delPackNo">Cancelar</button>` : `<button class="btn small" data-act="delPack" data-i="${p._i}">Remover</button>`}</div>`).join('') : '<p class="muted">Ainda nenhum. As perguntas base estão sempre incluídas.</p>'}
    </div>
  </div>`;
}
function doImport(text) {
  let data; try { data = JSON.parse(text); } catch (e) { return go('bank', { msg: 'O texto não é JSON válido. Confirma as aspas e as vírgulas.', msgOk: false, draft: text }); }
  if (Array.isArray(data)) data = { name: 'Importado', questions: data };
  if (!data || !Array.isArray(data.questions)) return go('bank', { msg: 'Falta a lista "questions".', msgOk: false, draft: text });
  const bad = []; data.questions.forEach((q, i) => { const v = validateQ(q); if (!v.ok) bad.push(`pergunta ${i + 1}: ${v.why}`); });
  if (bad.length) return go('bank', { msg: `Corrige antes de importar — ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ` (+${bad.length - 3})` : ''}`, msgOk: false, draft: text });
  const pack = { course: C.id, name: String(data.name || 'Pacote importado').slice(0, 80), createdAt: Date.now(), questions: data.questions, lessons: Array.isArray(data.lessons) ? data.lessons : [] };
  packs.push(pack); ls.set(LS_PACKS, packs);
  rebuildBank(); go('bank', { msg: `${pack.questions.length} pergunta(s) importada(s) neste browser.`, msgOk: true, draft: '' });
}
async function copyText(text, fallbackId) {
  try { await navigator.clipboard.writeText(text); toast('Copiado.'); }
  catch { const el = document.getElementById(fallbackId); if (el) { el.closest('details') && (el.closest('details').open = true); el.focus(); el.select(); toast('Seleccionei o texto: copia com Ctrl/Cmd+C.'); } }
}

/* ---------- OTHER DEVICE (progress key) ----------
   Export: a key for all courses, as a link + QR (site) or text (local file), plus Share on phones.
   Import: paste a key/link, or open a #k= link; always merges, never overwrites. */
const KEY = window.PROGRESS_KEY;
const onWeb = /^https?:$/.test(location.protocol);
const touch = matchMedia('(pointer: coarse)').matches;
const keyLink = key => location.origin + location.pathname + '#k=' + key;
const hasProgress = () => Object.values(G.c).some(c => Object.values(c.stats || {}).some(s => s.c || s.w || s.ew));
function Sync() {
  const back = C ? 'home' : 'courses';
  const inc = view.incoming;
  const confirm = inc ? `<article class="card stack sync-confirm">
      <span class="eyebrow">${view.fromLink ? 'Abriste um link de progresso' : 'Chave lida'}</span>
      <h2>Juntar este progresso?</h2>
      <ul class="sync-list">${KEY.summary(inc).map(x => { const c = REG.courses[x.id]; return `<li><b>${esc(c.code)}</b> · ${x.answered} pergunta${x.answered === 1 ? '' : 's'} respondida${x.answered === 1 ? '' : 's'} (${x.mastered} já certas) · ${x.xp} XP${x.notes ? ` · ${x.notes} nota${x.notes === 1 ? '' : 's'}` : ''}</li>`; }).join('')}</ul>
      <p class="muted">Não apaga nada deste dispositivo: para cada pergunta fica o melhor dos dois lados.${inc.unknown ? ` ${inc.unknown} resposta(s) eram de perguntas que este site já não tem e ficam de fora.` : ''}</p>
      <div class="row"><button class="btn primary" data-act="mergeKey">Juntar ao meu progresso</button><button class="btn" data-act="cancelKey">Cancelar</button></div>
    </article>` : '';
  const exportHint = !onWeb ? 'Estás a usar o ficheiro HTML: o código dá o texto da chave. Copia-o e cola-o em “Trazer para aqui” no outro dispositivo.'
    : touch ? 'Carrega em Partilhar e envia para ti próprio (WhatsApp, email, notas). No outro dispositivo, abre o link.'
    : 'No telemóvel, aponta a câmara a este código e abre o link.';
  const exportCard = hasProgress() ? `<article class="card stack">
      <h3>${glyph('qr')} Levar daqui</h3>
      <p class="muted">${exportHint}</p>
      <div class="qr" id="qrBox" aria-label="Código QR com o teu progresso"><span class="muted">A gerar…</span></div>
      <label class="toggle"><input type="checkbox" id="includeNotes" ${view.notes ? 'checked' : ''}> Incluir as minhas notas <span class="muted" style="font-size:12.5px">(a chave fica maior)</span></label>
      <textarea class="code key" id="keyBox" readonly aria-label="${onWeb ? 'Link' : 'Chave'} de progresso"></textarea>
      <div class="row">
        <button class="btn primary" data-act="copyKey">${glyph('copy')} Copiar ${onWeb ? 'link' : 'chave'}</button>
        ${navigator.share ? `<button class="btn" data-act="shareKey">${glyph('share')} Partilhar</button>` : ''}
      </div>
    </article>` : `<article class="card stack"><h3>${glyph('qr')} Levar daqui</h3><p class="muted">Ainda não há progresso neste dispositivo. Responde a algumas perguntas e volta aqui.</p></article>`;
  return `<div class="qhead"><button class="btn small" data-act="${back}" aria-label="Voltar">←</button><span class="eyebrow">Outro dispositivo</span></div>
    <section class="hero"><h1>Continua noutro dispositivo.</h1>
      <p>O progresso fica guardado só neste browser. Para o passares, gera aqui uma chave e abre-a no outro dispositivo. Não há contas e nada é enviado para servidores.</p></section>
    ${confirm}
    <div class="sync-grid">
      ${exportCard}
      <article class="card stack">
        <h3>${glyph('swap')} Trazer para aqui</h3>
        <p class="muted">Cola a chave ou o link que geraste no outro dispositivo.</p>
        <textarea class="code key" id="pasteBox" spellcheck="false" placeholder="https://…#k=E1…  ou  E1…">${esc(view.pasted || '')}</textarea>
        ${view.err ? `<p class="msg ko">${esc(view.err)}</p>` : ''}
        <div class="row"><button class="btn primary" data-act="readKey">Ler chave</button></div>
      </article>
    </div>`;
}
let keyGen = 0;
async function afterSyncRender() {
  const box = document.getElementById('keyBox'), qrBox = document.getElementById('qrBox'); if (!box) return;
  const my = ++keyGen;
  let key; try { key = await KEY.encode(G, REG.courses, { notes: !!view.notes }); } catch { qrBox.innerHTML = '<span class="muted">Não consegui gerar a chave neste browser.</span>'; return; }
  if (my !== keyGen) return;
  const text = onWeb ? keyLink(key) : key;
  view.keyText = text; box.value = text;
  try { const q = qrcode(0, 'L'); q.addData(text, 'Byte'); q.make(); qrBox.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
  catch { qrBox.innerHTML = '<span class="muted">A chave é grande demais para um código QR. Usa Copiar ou Partilhar' + (view.notes ? ', ou tira as notas' : '') + '.</span>'; }
}
async function readKey(text) {
  try { const inc = await KEY.decode(text, REG.courses); go('sync', { incoming: inc, notes: view.notes }); }
  catch (e) { go('sync', { err: e.message, pasted: text, notes: view.notes }); }
}
function mergeKey() {
  const rep = KEY.merge(G, view.incoming, id => blank(REG.courses[id].topics));
  if (C) openCourse(C.id); else { const first = Object.keys(view.incoming.courses)[0]; if (first) openCourse(first); }
  save();
  toast(`Feito: ${rep.added} pergunta(s) novas, ${rep.updated} atualizadas${rep.notes ? `, ${rep.notes} nota(s)` : ''}.`);
  go(C ? 'home' : 'courses');
}

/* ---------- events ---------- */
document.addEventListener('click', async ev => {
  const b = ev.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (['unlockAll', 'testDate', 'note'].includes(a)) return;
  switch (a) {
    case 'home': if (ses && !ses.ended && ses.mode === 'exam' && view.name === 'quiz') { finish(); return; } clearInterval(tick); ses = null; go('home'); break;
    case 'courses': if (ses && !ses.ended && ses.mode === 'exam' && view.name === 'quiz') { finish(); return; } clearInterval(tick); ses = null; go('courses'); break;
    case 'sync': go('sync'); break;
    case 'copyKey': if (view.keyText) copyText(view.keyText, 'keyBox'); break;
    case 'shareKey': if (view.keyText) navigator.share(onWeb ? { title: 'Estudo IST', text: 'O meu progresso no Estudo IST', url: view.keyText } : { title: 'Estudo IST', text: view.keyText }).catch(() => {}); break;
    case 'readKey': readKey(document.getElementById('pasteBox').value); break;
    case 'mergeKey': mergeKey(); break;
    case 'cancelKey': go('sync', { notes: view.notes }); break;
    case 'openC': if (openCourse(b.dataset.id)) { save(); go('home'); } break;
    case 'extra': start('extra', { extra: b.dataset.k }); break;
    case 'startReview': start(b.dataset.k); break;
    case 'topic': { const k = b.dataset.k; const set = new Set(S.settings.topics); set.has(k) ? set.delete(k) : set.add(k); if (!set.size) { toast('Tem de ficar pelo menos um tema.'); return; } S.settings.topics = Object.keys(TOPICS).filter(t => set.has(t)); save(); renderView(); break; }
    case 'level': { const n = +b.dataset.n; if (!unlocked(n)) { toast(`Bloqueado: precisas de ${Math.round(UNLOCK * 100)}% do nível ${n - 1} (ou ativa “Desbloquear todos”).`); return; } start('level', { level: n }); break; }
    case 'mode': { const k = b.dataset.k; if (k === 'learn') go('learnpick'); else if (k === 'library') go('library'); else if (k === 'review') go('reviewpick'); else start(k); break; }
    case 'learn': start('learn', { topic: b.dataset.k }); break;
    case 'library': go('library'); break;
    case 'read': go('reader', { id: b.dataset.id }); break;
    case 'practice': { const ids = BANK.filter(q => q.les === b.dataset.id).sort((x, y) => x.l - y.l).map(q => q.id); start('retry', { ids }); if (ses) ses.title = 'Praticar lição'; break; }
    case 'opt': choose(+b.dataset.oi); break;
    case 'confirm': if (ses && ses.picked.size) grade(); break;
    case 'next': next(); break;
    case 'quit': if (ses && ses.results.length) finish(); else { ses = null; go('home'); } break;
    case 'finish': finish(); break;
    case 'retryWrong': { const ids = ses.results.filter(r => !r.ok).map(r => r.id); start('retry', { ids, examGrading: ses.mode === 'exam' || ses.examGrading }); break; }
    case 'bank': go('bank'); break;
    case 'notes': go('notes'); break;
    case 'import': doImport(document.getElementById('importBox').value); break;
    case 'example': go('bank', { draft: JSON.stringify((C.importHelp && C.importHelp.example) || { name: 'Exemplo', questions: [] }, null, 2) }); break;
    case 'copyPrompt': copyText(importPrompt(), 'promptBox'); break;
    case 'delPack': view.confirmDel = +b.dataset.i; renderView(); break;
    case 'delPackNo': view.confirmDel = null; renderView(); break;
    case 'delPackYes': { packs.splice(+b.dataset.i, 1); ls.set(LS_PACKS, packs); rebuildBank(); view.confirmDel = null; renderView(); break; }
    case 'reset': view.confirmReset = true; renderView(); break;
    case 'resetNo': view.confirmReset = false; renderView(); break;
    case 'resetYes': { const keep = S.settings; G.c[C.id] = blank(TOPICS); G.c[C.id].settings = keep; openCourse(C.id); save(); view.confirmReset = false; toast('Progresso apagado.'); renderView(); break; }
  }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'includeNotes') { view.notes = t.checked; renderView(); return; }
  if (t.id === 'unlockAll') { S.settings.unlockAll = t.checked; save(); renderView(); }
  if (t.id === 'testDate') { S.settings.testDate = t.value; save(); renderView(); }
  if (t.id === 'importFile' && t.files && t.files[0]) { const r = new FileReader(); r.onload = () => doImport(String(r.result || '')); r.readAsText(t.files[0]); }
});
let noteTimer = null;
document.addEventListener('input', ev => { const t = ev.target; if (t.dataset && t.dataset.act === 'note') { S.notes[t.dataset.id] = t.value; clearTimeout(noteTimer); noteTimer = setTimeout(save, 700); } });
document.addEventListener('keydown', ev => {
  if (ev.target.matches('textarea, input')) return;
  if (view.name === 'quiz' && ses) {
    const it = curItem(); const k = ev.key;
    if (/^[1-6]$/.test(k) && !ses.answered) { const pos = +k - 1; if (it.order[pos] !== undefined) { ev.preventDefault(); choose(it.order[pos]); } }
    else if (k === 'Enter') { ev.preventDefault(); if (!ses.answered && Array.isArray(BYID[it.id].a) && ses.picked.size) grade(); else if (ses.answered) next(); }
  } else if (view.name === 'lesson' && ev.key === 'Enter') { ev.preventDefault(); next(); }
});

if (G.cur && REG.courses[G.cur]) openCourse(G.cur); else view = { name: 'courses' };
renderView();
// opened from a progress link: show what it brings, then clean the address bar
function openKeyFromHash() {
  const linkKey = KEY.extract(location.hash); if (!linkKey) return;
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  if (ses && !ses.ended) { clearInterval(tick); ses = null; }
  KEY.decode(linkKey, REG.courses).then(inc => go('sync', { incoming: inc, fromLink: true }), e => go('sync', { err: e.message, pasted: linkKey }));
}
openKeyFromHash();
window.addEventListener('hashchange', openKeyFromHash);   // link opened in a tab where the site was already open
})();
