/* ---------- CALCULATOR: a floating panel (the maths is in calc.js) ----------
   A round button in the corner opens it on every screen of a course. Definições turns the button on or off per
   course (S.settings.calc; by default on where the course has questions with calculations).
   What is typed lives in a transparent input; above it the expression is drawn as on paper (fractions stacked,
   exponents raised, √ over its radicand) with our own caret, so ^ and _ format as you type.
   History, variables and ans stay on this device (LS_CALC). */
const LS_CALC = 'estudo-ist-calc', CX = window.CALC;
const calcMem = Object.assign({ hist: [], vars: {}, ans: null }, ls.get(LS_CALC) || {});
let calcIsOpen = false, calcHi = -1, calcDraft = '', calcErr = '';   // calcErr: why Enter could not calculate (HTML), until the next edit   // calcHi: history entry recalled with ↑ (−1: what was being typed)
const calcWanted = () => !!(C && S && !['courses', 'sync'].includes(view.name) && (S.settings.calc ?? hasCalc()));
const calcEnv = () => { const vars = {}; for (const k in calcMem.vars) { const v = CX.de(calcMem.vars[k]); if (v) vars[k] = v; } return { vars, ans: CX.de(calcMem.ans) }; };
const calcEl = id => document.getElementById(id);
const coarse = () => window.matchMedia('(pointer: coarse)').matches;

// called by renderView: the button follows the course setting and the screen
function calcSync() {
  let fab = calcEl('calc-fab');
  if (!fab) {
    fab = document.createElement('button'); fab.id = 'calc-fab'; fab.type = 'button'; fab.className = 'calc-fab';
    fab.title = 'Calculadora'; fab.setAttribute('aria-label', 'Abrir a calculadora'); fab.innerHTML = glyph('calc');
    fab.addEventListener('click', () => calcOpen(true)); document.body.appendChild(fab);
  }
  const on = calcWanted(); fab.hidden = !on || calcIsOpen;
  if (!on && calcIsOpen) calcOpen(false);
}

// [text to insert, label, title]; special keys start with '#'
const CALC_FN = [['/', '<span class="cl-frac sm"><span class="cl-fn">▫</span><span class="cl-fd">▫</span></span>', 'Fração ( / )'], ['^2', 'x²', 'Ao quadrado ( ^2 )'], ['^', 'xⁿ', 'Potência ( ^ )'],
  ['sqrt(', '√', 'Raiz quadrada ( sqrt )'], ['(', '('], [')', ')'],
  ['ln(', 'ln', 'Logaritmo natural ( ln )'], ['log_2(', 'log₂', 'Logaritmo de base 2 ( log_2 ). Outra base: log_b'], ['log(', 'log', 'Logaritmo de base 10 ( log )'],
  ['pi', 'π', 'Pi ( pi )'], ['e', 'e', 'Número de Euler ( e )'], ['#idx', 'x₁', 'Índice ( _ ): depois de uma letra põe-lhe um índice (w₁, log₂); sozinho escreve x₁']];
const CALC_PAD = [['7'], ['8'], ['9'], ['/', '÷'], ['#bs', '⌫', 'Apagar'], ['#ac', 'AC', 'Limpar a expressão'],
  ['4'], ['5'], ['6'], ['*', '×'], ['#l', '←', 'Mover para a esquerda'], ['#r', '→', 'Para a direita, ou sair do índice, expoente ou fração'],
  ['1'], ['2'], ['3'], ['-', '−'], ['x', '<i>x</i>', 'Variável x'], ['=', '<i>x</i>=', 'Guardar numa variável: x = 2, e depois usar x'],
  ['0'], ['.'], ['ans', 'ans', 'Resultado anterior'], ['+'], ['#eq', '=', 'Calcular']];
const calcKey = ([k, label, title]) => `<button type="button" class="calc-k${k === '#eq' ? ' eq' : ''}" data-ck="${esc(k)}"${title ? ` title="${esc(title)}" aria-label="${esc(title)}"` : ''}>${label || esc(k)}</button>`;

function calcOpen(open, refocus) {
  calcIsOpen = open; let p = calcEl('calc');
  if (!open) { if (p) p.remove(); calcSync(); if (refocus) { const f = calcEl('calc-fab'); if (f && !f.hidden) f.focus({ preventScroll: true }); } return; }
  if (!p) {
    p = document.createElement('section'); p.id = 'calc'; p.className = 'calc-panel'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Calculadora');
    p.innerHTML = `<div class="calc-h"><span class="eyebrow">Calculadora</span><span class="spacer"></span>
        <button type="button" class="btn ghost small calc-abc" data-ck="#abc" title="Teclado com letras, para outras variáveis (w, η…)">abc</button>
        <button type="button" class="btn ghost small" data-ck="#clear" title="Apagar o histórico e as variáveis">Limpar</button>
        <button type="button" class="btn ghost small" data-ck="#close" aria-label="Fechar a calculadora">✕</button></div>
      <ol class="calc-hist" id="calc-hist" aria-label="Contas feitas"></ol>
      <div class="calc-disp" id="calc-disp">
        <div class="cl calc-expr" id="calc-expr" aria-hidden="true"></div>
        <div class="calc-prev" id="calc-prev" aria-live="polite"></div>
        <input class="calc-in" id="calc-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" aria-label="Expressão a calcular" aria-describedby="calc-prev">
      </div>
      <div class="calc-keys" id="calc-keys">${CALC_FN.map(calcKey).join('')}</div>
      <div class="calc-keys pad">${CALC_PAD.map(calcKey).join('')}</div>
      <p class="calc-tip muted">Enter calcula · → sai do índice, expoente ou fração · ↑ ↓ contas anteriores · <code class="mono">x = 2</code> guarda uma variável · ângulos em radianos</p>`;
    document.body.appendChild(p); calcBind(p);
  }
  calcSync(); calcHist(); calcDraw();
  calcEl('calc-in').focus({ preventScroll: true });
}

function calcResultH(v, cls = '') {
  const s = CX.show(v);
  return `<span class="cl ${cls}">${s.approx ? '≈' : '='} ${s.h}</span>${s.alt ? `<span class="calc-alt">${s.alt.approx ? '≈' : '='} ${s.alt.h}</span>` : ''}`;
}
function calcHist() {
  const ol = calcEl('calc-hist'); if (!ol) return;
  ol.innerHTML = calcMem.hist.map((h, i) => { const v = CX.de(h.v); return v ? `<li>
    <button type="button" class="calc-hx cl" data-ci="${i}" title="Editar outra vez">${CX.render(CX.parse(h.x))}</button>
    <button type="button" class="calc-hr" data-cv="${i}" title="Usar este resultado na conta">${calcResultH(v)}</button></li>` : ''; }).join('');
  ol.hidden = !calcMem.hist.length; ol.scrollTop = ol.scrollHeight;
}

// draws the expression with the caret (and the selection) where the input has them, then the live result
function calcDraw() {
  const inp = calcEl('calc-in'), ex = calcEl('calc-expr'), pv = calcEl('calc-prev'); if (!inp) return;
  const src = inp.value, tree = CX.parse(src);
  ex.innerHTML = tree.empty ? '<span class="calc-ph">por exemplo 3/4 + log_2(8)</span>' : CX.render(tree) + '<span class="calc-tail"></span>';   // tail: room to scroll past the end
  const a = inp.selectionStart ?? src.length, b = inp.selectionEnd ?? a;
  if (a !== b) ex.querySelectorAll('[data-s]').forEach(l => { if (+l.dataset.s >= a && +l.dataset.e <= b && +l.dataset.e > +l.dataset.s) l.classList.add('sel'); });
  else calcCaret(ex, inp.selectionDirection === 'backward' ? a : b);
  calcReveal(ex, ex.querySelector('.cl-caret') || [...ex.querySelectorAll('.sel')][inp.selectionDirection === 'backward' ? 0 : ex.querySelectorAll('.sel').length - 1]);
  pv.classList.toggle('err', !!calcErr);
  if (calcErr) { pv.innerHTML = calcErr; return; }
  if (tree.empty) { pv.innerHTML = ''; return; }
  const r = CX.run(tree, calcEnv());
  pv.innerHTML = r.ok ? (r.name ? `<span class="cl">${CX.render(CX.parse(r.name))}</span> ` : '') + calcResultH(r.v, 'calc-live') : '';
}
// a long expression scrolls sideways with the caret, keeping a little of what is around it in sight
function calcReveal(ex, el) {
  if (!el || ex.scrollWidth <= ex.clientWidth) return;
  const box = ex.getBoundingClientRect(), r = el.getBoundingClientRect(), room = Math.min(40, box.width / 4);
  if (r.right > box.right - room) ex.scrollLeft += r.right - box.right + room;
  else if (r.left < box.left + room) ex.scrollLeft -= box.left + room - r.left;
}
function calcCaret(ex, p) {
  const caret = document.createElement('span'); caret.className = 'cl-caret';
  const leaves = [...ex.querySelectorAll('[data-s]')], isHole = l => 'hole' in l.dataset;
  if (!leaves.length) { ex.prepend(caret); return; }
  const after = leaves.filter(l => !isHole(l) && +l.dataset.e === p).pop(), before = leaves.find(l => !isHole(l) && +l.dataset.s === p);
  // right after a number or a name, typing continues it (w_1|2 → w₁₂): the caret stays there; otherwise an empty box takes it
  const word = after && /(^| )cl-[nvkf]( |$)/.test(after.className);
  const hole = !word && leaves.find(l => isHole(l) && +l.dataset.s <= p && p <= +l.dataset.e);
  if (hole) hole.appendChild(caret);
  // right after ^ _ / or an opening bracket the caret belongs inside the box they open
  else if (after && !('open' in after.dataset)) after.after(caret);
  else if (before) before.before(caret);
  else if (after) after.after(caret);
  // after a space at the end (→ left a box): back on the line, inside the innermost bracket still open
  else if (leaves.every(l => +l.dataset.e < p)) { const g = ex.querySelector('[data-ghost]'); if (g) g.before(caret); else ex.append(caret); }
  else { const prev = leaves.filter(l => +l.dataset.e < p).pop(); if (prev) prev.after(caret); else ex.prepend(caret); }
}
// where a tap on the drawn expression puts the caret: before or after the piece tapped
function calcPosAt(ev, len) {
  const l = ev.target.closest && ev.target.closest('#calc-expr [data-s]');
  if (!l) { const r = calcEl('calc-expr').getBoundingClientRect(); return ev.clientX < r.left + 8 ? 0 : len; }
  if ('hole' in l.dataset) return +l.dataset.s;
  const r = l.getBoundingClientRect(); return ev.clientX < r.left + r.width / 2 ? +l.dataset.s : +l.dataset.e;
}

function calcInsert(t) {
  const inp = calcEl('calc-in'), a = inp.selectionStart, b = inp.selectionEnd;
  // an operator on an empty line continues from the last result, as on a calculator
  if (!inp.value.trim() && /^[+*/^!]/.test(t) && calcMem.ans) t = 'ans' + t;
  inp.setRangeText(t, a, b, 'end'); calcHi = -1; calcErr = ''; calcDraw();
}
function calcBack() {
  const inp = calcEl('calc-in'), a = inp.selectionStart, b = inp.selectionEnd;
  if (a !== b) inp.setRangeText('', a, b, 'end');
  else if (a > 0) { const m = CX.CHUNK.exec(inp.value.slice(0, a)); inp.setRangeText('', a - (m ? m[0].length : 1), a, 'end'); }   // "log_2(" goes in one press
  calcHi = -1; calcErr = ''; calcDraw();
}
function calcEnter() {
  const inp = calcEl('calc-in'), src = inp.value; if (!src.trim()) return;
  const r = CX.run(CX.parse(src), calcEnv()), pv = calcEl('calc-prev');
  if (!r.ok) {   // a variable with no value: its name drawn as in the expression, and how to give it one
    const nm = r.unset && `<span class="cl">${CX.render(CX.parse(r.unset))}</span>`;
    calcErr = nm ? `${nm} ainda não tem valor. Guarda-o antes, por exemplo <span class="cl">${CX.render(CX.parse(r.unset + ' = 2'))}</span>` : esc(r.err);
    calcDraw(); return;
  }
  if (r.name) calcMem.vars[r.name] = CX.ser(r.v);
  calcMem.ans = CX.ser(r.v); calcMem.hist.push({ x: src, v: CX.ser(r.v) }); if (calcMem.hist.length > 40) calcMem.hist.shift();
  ls.set(LS_CALC, calcMem); inp.value = ''; calcHi = -1; calcHist(); calcDraw();
}
// → at the end of the text leaves the box being typed in (CX.exitText says which sign does it); false if nothing to leave
function calcExit() {
  const inp = calcEl('calc-in'), n = inp.value.length;
  if (inp.selectionStart !== n || inp.selectionEnd !== n) return false;
  const t = CX.exitText(inp.value); if (!t) return false;
  inp.setRangeText(t, n, n, 'end'); calcDraw(); return true;
}
function calcRecall(dir) {   // ↑ / ↓ walk through the expressions already calculated
  const inp = calcEl('calc-in'), H = calcMem.hist; if (!H.length) return;
  if (dir < 0) { if (calcHi === -1) { calcDraft = inp.value; calcHi = H.length - 1; } else calcHi = Math.max(0, calcHi - 1); }
  else { if (calcHi === -1) return; calcHi++; if (calcHi >= H.length) calcHi = -1; }
  inp.value = calcHi === -1 ? calcDraft : H[calcHi].x; calcErr = ''; inp.setSelectionRange(inp.value.length, inp.value.length); calcDraw();
}

function calcBind(p) {
  const inp = p.querySelector('#calc-in'), disp = p.querySelector('#calc-disp');
  inp.inputMode = coarse() ? 'none' : 'text';   // on a phone the keypad below replaces the system keyboard
  inp.addEventListener('input', () => { calcHi = -1; calcErr = ''; calcDraw(); });
  inp.addEventListener('keydown', ev => {
    const k = ev.key;
    if (k === 'Enter') { ev.preventDefault(); calcEnter(); }
    else if (k === 'Escape') { ev.preventDefault(); calcOpen(false, true); }
    else if (k === 'ArrowUp' || k === 'ArrowDown') { ev.preventDefault(); calcRecall(k === 'ArrowUp' ? -1 : 1); }
    else if (k === 'ArrowRight' && !ev.shiftKey && calcExit()) ev.preventDefault();
    else requestAnimationFrame(calcDraw);   // arrows, Home, End: the caret moved
  });
  // beforeinput, not keydown: phone keyboards often send keydown without the key
  inp.addEventListener('beforeinput', ev => {
    if (ev.inputType === 'deleteContentBackward') { ev.preventDefault(); calcBack(); }
    else if (ev.inputType === 'insertText' && /^[+*/^!]/.test(ev.data || '') && !inp.value.trim() && calcMem.ans) { ev.preventDefault(); calcInsert(ev.data); }
  });
  inp.addEventListener('focus', () => { disp.classList.add('focus'); calcDraw(); });
  inp.addEventListener('blur', () => disp.classList.remove('focus'));
  disp.addEventListener('pointerdown', ev => {
    if (ev.target === inp) return; ev.preventDefault();
    const pos = calcPosAt(ev, inp.value.length); inp.focus({ preventScroll: true }); inp.setSelectionRange(pos, pos); calcDraw();
  });
  // keys keep the focus in the input (and the phone keyboard as it was)
  p.addEventListener('pointerdown', ev => { if (ev.target.closest('.calc-k')) ev.preventDefault(); });
  p.addEventListener('click', ev => {
    const k = ev.target.closest('[data-ck]'), hx = ev.target.closest('[data-ci]'), hr = ev.target.closest('[data-cv]');
    if (hx) { inp.value = calcMem.hist[+hx.dataset.ci].x; calcErr = ''; inp.focus({ preventScroll: true }); inp.setSelectionRange(inp.value.length, inp.value.length); calcDraw(); return; }
    if (hr) { const v = CX.de(calcMem.hist[+hr.dataset.cv].v); if (v) { inp.focus({ preventScroll: true }); calcInsert(CX.show(v).t); } return; }
    if (!k) return;
    const c = k.dataset.ck;
    if (c === '#close') return calcOpen(false, true);
    if (c === '#clear') { calcMem.hist = []; calcMem.vars = {}; calcMem.ans = null; ls.set(LS_CALC, calcMem); calcHist(); calcDraw(); toast('Histórico e variáveis apagados.'); return; }
    inp.focus({ preventScroll: true });
    if (c === '#eq') calcEnter();
    else if (c === '#bs') calcBack();
    else if (c === '#ac') { inp.value = ''; calcErr = ''; calcDraw(); }
    else if (c === '#idx') { const run = /[A-Za-zͰ-Ͽ]+$/.exec(inp.value.slice(0, inp.selectionStart)); calcInsert(run && !/^(pi|ans|e)$/i.test(run[0]) ? '_' : 'x_'); }   // w → w_, alone → x_
    else if (c === '#r' && calcExit()) { /* left a box */ }
    else if (c === '#l' || c === '#r') { const q = Math.max(0, Math.min(inp.value.length, inp.selectionStart + (c === '#l' ? -1 : 1))); inp.setSelectionRange(q, q); calcDraw(); }
    else if (c === '#abc') { inp.inputMode = inp.inputMode === 'none' ? 'text' : 'none'; k.classList.toggle('on', inp.inputMode === 'text'); inp.blur(); inp.focus({ preventScroll: true }); }
    else calcInsert(c);
  });
}
document.addEventListener('selectionchange', () => { if (document.activeElement && document.activeElement.id === 'calc-in') calcDraw(); });
