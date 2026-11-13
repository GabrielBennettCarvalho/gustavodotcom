/* ===== Calculator maths: parser, exact arithmetic and natural-display rendering =====
   Pure functions with no state: app-calc.js draws the panel around them (window.CALC).
   Numbers stay exact fractions (BigInt) while they can: 3/4 + 1/4 = 1, 0.1 + 0.2 = 3/10.
   Roots, logs and trig fall back to floating point unless the answer is exact (√(9/4) = 3/2, log₂ 8 = 3);
   a float within a few ulps of a fraction with a small denominator snaps back to it (sin(π/6) = 1/2).
   The parser never fails: a missing operand becomes a hole and an unclosed bracket a ghost one, so what is
   being typed always renders. Every rendered leaf carries its source range (data-s, data-e) for the caret. */
(() => {
const ROOT = typeof window !== 'undefined' ? window : globalThis;
const big = BigInt;
const E = m => Object.assign(new Error(m), { calc: true });
const INCOMPLETE = 'Falta completar a expressão';

/* ---------- numbers: { n, d } exact fraction (BigInt, d > 0, reduced) or { f } float ---------- */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
function Q(n, d = 1n) { if (d === 0n) throw E('Divisão por zero'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; }
const isQ = v => v.n !== undefined;
const bits = q => Math.max(q.n.toString(16).length, q.d.toString(16).length) * 4;
function qToNum(q) {
  const a = Number(q.n), b = Number(q.d); if (isFinite(a) && isFinite(b)) return a / b;
  const k = 10n ** big(Math.max(0, Math.max(q.n.toString().length, q.d.toString().length) - 300));   // too big for doubles: drop digits from both
  return Number(q.n / k) / Number(q.d / k);
}
const num = v => isQ(v) ? qToNum(v) : v.f;
function F(x) {
  if (!isFinite(x)) throw E(isNaN(x) ? 'Fora do domínio' : 'Resultado demasiado grande');
  if (Number.isInteger(x) && Math.abs(x) < 1e15) return Q(big(x));
  for (let q = 1; q <= 1000; q++) { const p = Math.round(x * q); if (Math.abs(x - p / q) <= 4e-15 * Math.abs(x) && Math.abs(p) < 1e15) return Q(big(p), big(q)); }
  return { f: x };
}
const fit = q => bits(q) > 3000 ? F(qToNum(q)) : q;   // keeps fractions from growing without end
const both = (a, b) => isQ(a) && isQ(b);
const isZero = v => isQ(v) ? v.n === 0n : v.f === 0;
const neg = a => isQ(a) ? { n: -a.n, d: a.d } : { f: -a.f };
const add = (a, b) => both(a, b) ? fit(Q(a.n * b.d + b.n * a.d, a.d * b.d)) : F(num(a) + num(b));
const sub = (a, b) => add(a, neg(b));
const mul = (a, b) => both(a, b) ? fit(Q(a.n * b.n, a.d * b.d)) : F(num(a) * num(b));
function div(a, b) { if (isZero(b)) throw E('Divisão por zero'); return both(a, b) ? fit(Q(a.n * b.d, a.d * b.n)) : F(num(a) / num(b)); }
const cmp = (a, b) => both(a, b) ? Math.sign(Number(a.n * b.d - b.n * a.d)) : Math.sign(num(a) - num(b));
const ZERO = Q(0n), ONE = Q(1n);
const intOf = (v, what) => { if (!isQ(v) || v.d !== 1n) throw E(`${what} só aceita números inteiros`); return v.n; };

function iroot(n, k) {   // exact integer k-th root of n ≥ 0, or null
  if (n < 2n) return n; const x = Number(n); if (!isFinite(x)) return null;
  const r = big(Math.round(Math.pow(x, 1 / k)));
  for (const c of [r - 1n, r, r + 1n]) if (c >= 0n && c ** big(k) === n) return c;
  return null;
}
function pow(a, b) {
  if (both(a, b)) {
    if (b.d === 1n) {
      const e = b.n, ea = e < 0n ? -e : e;
      if (a.n === 0n) { if (e < 0n) throw E('Divisão por zero'); return e === 0n ? ONE : ZERO; }
      if (ea * big(bits(a)) <= 20000n) { const r = Q(a.n ** ea, a.d ** ea); return fit(e < 0n ? Q(r.d, r.n) : r); }
    } else if (b.d <= 64n) {   // exponent p/q: exact when the q-th root is
      const q = Number(b.d), sg = a.n < 0n;
      if (!sg || q % 2) { const rn = iroot(sg ? -a.n : a.n, q), rd = iroot(a.d, q); if (rn !== null && rd !== null) return pow(Q(sg ? -rn : rn, rd), Q(b.n)); }
    }
  }
  const x = num(a), y = num(b);
  if (x < 0 && !Number.isInteger(y)) {   // real odd root of a negative number: (−8)^(1/3) = −2
    if (isQ(b) && b.d % 2n === 1n) return F((b.n % 2n === 0n ? 1 : -1) * Math.pow(-x, y));
    throw E('Fora do domínio');
  }
  return F(Math.pow(x, y));
}
function log(x, b) {   // b: base, or undefined for ln
  if (cmp(x, ZERO) <= 0) throw E('Logaritmo de um número ≤ 0');
  if (!b) return F(Math.log(num(x)));
  if (cmp(b, ZERO) <= 0 || cmp(b, ONE) === 0) throw E('Base do logaritmo inválida');
  const bn = num(b), r = bn === 2 ? Math.log2(num(x)) : bn === 10 ? Math.log10(num(x)) : Math.log(num(x)) / Math.log(bn);
  if (both(x, b) && isFinite(r)) for (let q = 1; q <= 12; q++) {   // exact when bᵖ = xᵠ (log₂ 8 = 3, log₄ 2 = 1/2)
    const p = Math.round(r * q); if (Math.abs(r * q - p) > 1e-9 || Math.abs(p) > 2000) continue;
    try { const l = pow(b, Q(big(p))), rr = pow(x, Q(big(q))); if (isQ(l) && isQ(rr) && l.n === rr.n && l.d === rr.d) return Q(big(p), big(q)); } catch { /* too big: not exact */ }
  }
  return F(r);
}
const trig = f => v => { const r = f(num(v)); return F(Math.abs(r) < 1e-15 ? 0 : r); };
function floorQ(v) { if (!isQ(v)) return F(Math.floor(v.f)); let f = v.n / v.d; if (v.n % v.d !== 0n && v.n < 0n) f -= 1n; return Q(f); }
function fact(v) { const n = intOf(v, 'O fatorial'); if (n < 0n) throw E('Fatorial de um número negativo'); if (n > 1000n) throw E('Resultado demasiado grande'); let r = 1n; for (let k = 2n; k <= n; k++) r *= k; return fit(Q(r)); }
function choose(nv, kv, perm) {
  const n = intOf(nv, perm ? 'nPr' : 'nCr'), k = intOf(kv, perm ? 'nPr' : 'nCr');
  if (n < 0n || k < 0n || k > n) throw E('Precisa de 0 ≤ k ≤ n'); if (n > 10000n) throw E('Resultado demasiado grande');
  let r = 1n; for (let i = 0n; i < k; i++) r = r * (n - i) / (perm ? 1n : i + 1n); return fit(Q(r));
}
// [arity (0 = one or more), implementation]
const FNS = {
  sqrt: [1, a => { if (cmp(a, ZERO) < 0) throw E('Raiz quadrada de um número negativo'); return pow(a, Q(1n, 2n)); }],
  cbrt: [1, a => pow(a, Q(1n, 3n))],
  ln: [1, a => log(a)], log: [1, (a, base) => log(a, base || Q(10n))], exp: [1, a => pow(F(Math.E), a)],
  sin: [1, trig(Math.sin)], cos: [1, trig(Math.cos)], tan: [1, trig(Math.tan)],
  asin: [1, trig(Math.asin)], acos: [1, trig(Math.acos)], atan: [1, trig(Math.atan)],
  sinh: [1, trig(Math.sinh)], cosh: [1, trig(Math.cosh)], tanh: [1, trig(Math.tanh)],
  abs: [1, a => cmp(a, ZERO) < 0 ? neg(a) : a], floor: [1, floorQ], ceil: [1, a => neg(floorQ(neg(a)))], round: [1, a => floorQ(add(a, Q(1n, 2n)))],
  sigmoid: [1, a => F(1 / (1 + Math.exp(-num(a))))],
  min: [0, (...A) => A.reduce((x, y) => cmp(y, x) < 0 ? y : x)], max: [0, (...A) => A.reduce((x, y) => cmp(y, x) > 0 ? y : x)],
  mean: [0, (...A) => div(A.reduce(add), Q(big(A.length)))],
  ncr: [2, (n, k) => choose(n, k, false)], npr: [2, (n, k) => choose(n, k, true)],
};
const ALIAS = { arcsin: 'asin', arccos: 'acos', arctan: 'atan', raiz: 'sqrt' };
const DISP = { asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹', sigmoid: 'σ', ncr: 'nCr', npr: 'nPr' };
const GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', eta: 'η', theta: 'θ', lambda: 'λ', mu: 'μ', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', omega: 'ω' };
const WORDS = [...Object.keys(FNS), ...Object.keys(ALIAS), ...Object.keys(GREEK), 'pi', 'ans'].sort((a, b) => b.length - a.length);

/* ---------- tokens: N number, V variable, K constant (pi, e, ans), Fn function, Op, ( ) , and X (unknown) ---------- */
const isD = c => c >= '0' && c <= '9';
const OPCH = { '+': '+', '-': '-', '−': '-', '–': '-', '*': '*', '×': '*', '·': '*', '⋅': '*', '∗': '*', '/': '/', '÷': '/', '∕': '/', '^': '^', '!': '!', '=': '=' };
function decQ(m, x) { const [ip, fp = ''] = m.split('.'); let n = big((ip || '0') + fp), d = 10n ** big(fp.length); if (x > 0) n *= 10n ** big(x); else if (x < 0) d *= 10n ** big(-x); return Q(n, d); }
function readSub(src, j) {   // after "_": a run of digits or of letters
  const m = /^(\d+|[A-Za-zͰ-Ͽ]+)/.exec(src.slice(j + 1));
  return { u: j, s: j + 1, e: j + 1 + (m ? m[0].length : 0), text: m ? m[0] : '' };
}
function tokenize(src) {
  const T = [], ctx = []; let i = 0;   // ctx: for each open bracket, 'f' after a function name (commas separate) or 'g'
  const push = (k, v, s, e, x) => { const t = Object.assign({ k, v, s, e, raw: src.slice(s, e) }, x); T.push(t); return t; };
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (isD(c) || (c === '.' && isD(src[i + 1] || ''))) {
      let j = i, m = '';
      while (j < src.length) {
        const d = src[j];
        if (isD(d)) { m += d; j++; }
        else if ((d === '.' || (d === ',' && ctx[ctx.length - 1] !== 'f')) && !m.includes('.') && isD(src[j + 1] || '')) { m += '.'; j++; }   // 0,5 works outside f(…, …)
        else break;
      }
      let x = null; const sci = /^[eE]([+\-−]?)(\d{1,4})/.exec(src.slice(j));
      if (sci) { x = (sci[1] && sci[1] !== '+' ? -1 : 1) * +sci[2]; j += sci[0].length; }
      if (Math.abs(x || 0) > 1000) { push('X', src.slice(i, j), i, j); i = j; continue; }
      push('N', decQ(m, x || 0), i, j, { m, x }); i = j; continue;
    }
    if (c === '²' || c === '³') { push('Op', '^', i, i + 1); push('N', Q(c === '²' ? 2n : 3n), i + 1, i + 1, { m: c === '²' ? '2' : '3', x: null }); i++; continue; }
    if (/[A-Za-z]/.test(c)) {
      const run = /^[A-Za-z]+/.exec(src.slice(i))[0], low = run.toLowerCase();
      const w = WORDS.find(x => low.startsWith(x)); let j = i + (w ? w.length : 1), t;
      if (!w) t = c === 'e' ? push('K', 'e', i, j) : push('V', c, i, j);
      else if (w === 'pi' || w === 'ans') t = push('K', w, i, j);
      else if (GREEK[w]) t = push('V', GREEK[w], i, j);
      else t = push('Fn', ALIAS[w] || w, i, j);
      t.ne = j;
      if (src[j] === '_') { t.sub = readSub(src, j); j = t.e = t.sub.e; }
      else if (t.v === 'log' && /^\d+\(/.test(src.slice(j))) { const d = /^\d+/.exec(src.slice(j))[0]; t.sub = { u: null, s: j, e: j + d.length, text: d }; j = t.e = t.sub.e; }   // log2(8)
      t.raw = src.slice(i, j); i = j; continue;
    }
    if (c === 'π') { push('K', 'pi', i, i + 1, { ne: i + 1 }); i++; continue; }
    if (c === '√' || c === '∛') { push('Fn', c === '√' ? 'sqrt' : 'cbrt', i, i + 1, { ne: i + 1 }); i++; continue; }
    if (/\p{L}/u.test(c)) { const t = push('V', c, i, i + 1, { ne: i + 1 }); if (src[i + 1] === '_') { t.sub = readSub(src, i + 1); t.e = t.sub.e; t.raw = src.slice(i, t.e); } i = t.e; continue; }
    if (c === '*' && src[i + 1] === '*') { push('Op', '^', i, i + 2); i += 2; continue; }   // 2**3, as in Python
    if (OPCH[c]) { push('Op', OPCH[c], i, i + 1); i++; continue; }
    if (c === '(') { const p = T[T.length - 1]; ctx.push(p && p.k === 'Fn' ? 'f' : 'g'); push('(', c, i, i + 1); i++; continue; }
    if (c === ')') { ctx.pop(); push(')', c, i, i + 1); i++; continue; }
    if (c === ',' || c === ';') { push(',', c, i, i + 1); i++; continue; }
    push('X', c, i, i + 1); i++;
  }
  return T;
}

/* ---------- parser: + − < × ÷ and implicit products, left to right (3/4 log₂ x = ¾·log₂ x) < unary minus < ^ (right to left) < ! ---------- */
function parse(src) {
  const text = String(src || ''), T = tokenize(text); let i = 0;
  const is = (k, v) => !!T[i] && T[i].k === k && (v === undefined || T[i].v === v);
  const hole = () => ({ t: 'hole', p: i ? T[i - 1].e : 0, q: T[i] ? T[i].s : text.length });   // the gap where an operand is missing
  const startsAtom = () => is('N') || is('V') || is('K') || is('Fn') || is('(');
  function expr() { let l = term(); while (is('Op', '+') || is('Op', '-')) { const op = T[i++]; l = { t: 'bin', op, a: l, b: term() }; } return l; }
  function term() {
    let l = unary();
    for (;;) {
      if (is('Op', '*') || is('Op', '/')) { const op = T[i++], r = unary(); l = { t: op.v === '/' ? 'frac' : 'bin', op, a: l, b: r }; }
      else if (startsAtom()) l = { t: 'imp', a: l, b: power() };
      else return l;
    }
  }
  function unary() { if (is('Op', '-') || is('Op', '+')) { const op = T[i++]; return { t: 'neg', op, a: unary() }; } return power(); }
  function power() { const a = post(); if (is('Op', '^')) { const op = T[i++]; return { t: 'pow', op, a, b: unary() }; } return a; }
  function post() { let a = atom(); while (is('Op', '!')) a = { t: 'fact', op: T[i++], a }; return a; }
  function atom() {
    const t = T[i]; if (!t) return hole();
    if (t.k === 'N') { i++; return { t: 'num', tok: t }; }
    if (t.k === 'V' || t.k === 'K') { i++; return { t: 'var', tok: t }; }
    if (t.k === 'Fn') {
      i++; const n = { t: 'call', f: t, args: [], commas: [], lp: null, rp: null };
      if (is('(')) { n.lp = T[i++]; n.args.push(expr()); while (is(',')) { n.commas.push(T[i++]); n.args.push(expr()); } if (is(')')) n.rp = T[i++]; }
      else n.args.push(power());   // ln 2, √2
      return n;
    }
    if (t.k === '(') { i++; const n = { t: 'par', l: t, a: expr(), r: null }; if (is(')')) n.r = T[i++]; return n; }
    return hole();
  }
  let root;
  if (is('V') && T[i + 1] && T[i + 1].k === 'Op' && T[i + 1].v === '=') { const v = T[i++], op = T[i++]; root = { t: 'set', v, op, a: expr() }; }
  else root = expr();
  if (i < T.length) {   // leftovers (a stray bracket, an unknown sign): shown in red, never computed
    const items = [root];
    while (i < T.length) { items.push({ t: 'junk', tok: T[i++] }); if (startsAtom() || is('Op', '-') || is('Op', '+')) items.push(expr()); }
    root = { t: 'seq', items };
  }
  root.src = src; root.empty = !T.length;
  return root;
}

/* ---------- evaluation: env = { vars: { name: value }, ans } ---------- */
const varName = tok => tok.v + (tok.sub ? '_' + tok.sub.text : '');
function run(tree, env = {}) {
  const vars = env.vars || {};
  function lookup(tok) {
    if (tok.sub && !tok.sub.text) throw E(INCOMPLETE);
    if (tok.k === 'K') {
      if (tok.sub) throw E(`${tok.raw} não leva índice`);
      if (tok.v === 'pi') return F(Math.PI); if (tok.v === 'e') return F(Math.E);
      if (!env.ans) throw E('Ainda não há resultado anterior (ans)'); return env.ans;
    }
    const k = varName(tok); if (!vars[k]) throw Object.assign(E(`${k} ainda não tem valor. Guarda-o antes, por exemplo ${k} = 2`), { unset: k }); return vars[k];
  }
  function ev(n) {
    switch (n.t) {
      case 'num': return n.tok.v;
      case 'var': return lookup(n.tok);
      case 'hole': throw E(INCOMPLETE);
      case 'bin': { const a = ev(n.a), b = ev(n.b); return n.op.v === '+' ? add(a, b) : n.op.v === '-' ? sub(a, b) : mul(a, b); }
      case 'imp': return mul(ev(n.a), ev(n.b));
      case 'frac': return div(ev(n.a), ev(n.b));
      case 'neg': return n.op.v === '-' ? neg(ev(n.a)) : ev(n.a);
      case 'pow': return pow(ev(n.a), ev(n.b));
      case 'fact': return fact(ev(n.a));
      case 'par': return ev(n.a);   // an unclosed bracket closes at the end, as on a calculator
      case 'call': {
        const name = n.f.v, [arity, fn] = FNS[name], sb = n.f.sub;
        if (sb && name !== 'log') throw E(`${n.f.raw.split('_')[0]} não leva índice`);
        if (sb && !sb.text) throw E(INCOMPLETE);
        if (arity && n.args.length !== arity) throw E(`${DISP[name] || name} leva ${arity === 1 ? 'um valor' : arity + ' valores'}`);
        const A = n.args.map(ev);
        if (name === 'log' && sb) return fn(A[0], /^\d+$/.test(sb.text) ? Q(big(sb.text)) : lookup({ k: /^(e|pi)$/.test(sb.text) ? 'K' : 'V', v: GREEK[sb.text] || sb.text, raw: sb.text }));
        return fn(...A);
      }
      default: throw E('Expressão mal formada');
    }
  }
  try {
    if (tree.empty) return { ok: false, err: '' };
    if (tree.t === 'set') { if (tree.v.sub && !tree.v.sub.text) throw E(INCOMPLETE); const v = ev(tree.a); return { ok: true, v, name: varName(tree.v) }; }
    return { ok: true, v: ev(tree) };
  } catch (e) { return { ok: false, err: e.calc ? e.message : 'Não consegui calcular isto', incomplete: e.message === INCOMPLETE, unset: e.unset }; }   // unset: the variable with no value
}

/* ---------- rendering (HTML, natural display) ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const leaf = (cls, html, s, e) => `<span class="cl-${cls}" data-s="${s}" data-e="${e}">${html}</span>`;
// a sign the layout replaces (^ _ / brackets of a fraction, a function's name): zero width, but the caret can sit by it.
// "open" ones lead into a box (exponent, denominator…), so a caret right after them goes inside that box.
// k: true for one that opens a box; 'close' for the bracket that ends one (the caret right after it leaves the box)
const hid = (s, e, k) => `<span class="cl-h" data-s="${s}" data-e="${e}"${k === 'close' ? ' data-close=""' : k ? ' data-open=""' : ''}></span>`;
const holeH = (p, q = p) => `<span class="cl-hole" data-s="${p}" data-e="${q}" data-hole=""></span>`;
const ghostH = (c, t = '') => `<span class="cl-p ghost${t}" data-ghost="">${c}</span>`;   // a bracket not typed yet
const fracH = (a, b) => `<span class="cl-frac"><span class="cl-fn">${a}</span><span class="cl-fd">${b}</span></span>`;
const RAD = '<svg class="cl-rad" viewBox="0 0 12 24" preserveAspectRatio="none" aria-hidden="true"><path d="M1 14 L3.5 12.5 L7 23 L11.4 .8 H12" fill="none" stroke="currentColor" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg>';
const OPS = { '+': '+', '-': '−', '*': '×', '=': '=' };
const sciH = x => `<span class="cl-x">×10<sup>${x < 0 ? '−' : ''}${Math.abs(x)}</sup></span>`;
const tall = n => !!n && (n.t === 'frac' || [n.a, n.b, ...(n.args || []), ...(n.items || [])].some(tall));
const digitFirst = n => n.t === 'num' || (['pow', 'fact', 'imp'].includes(n.t) && digitFirst(n.a));
function subH(sb) {
  return `<span class="cl-sub">${sb.u !== null ? hid(sb.u, sb.u + 1, true) : ''}${sb.text ? leaf(/^\d+$/.test(sb.text) ? 'n' : 'v', esc(GREEK[sb.text] || sb.text), sb.s, sb.e) : holeH(sb.s)}</span>`;
}
function varH(tok) {
  const name = tok.k === 'K' ? (tok.v === 'pi' ? leaf('k', 'π', tok.s, tok.ne) : tok.v === 'e' ? leaf('v', 'e', tok.s, tok.ne) : leaf('k ans', 'ans', tok.s, tok.ne)) : leaf('v', esc(tok.v), tok.s, tok.ne);
  return name + (tok.sub ? subH(tok.sub) : '');
}
const G = n => n.t === 'par' ? hid(n.l.s, n.l.e, true) + R(n.a) + (n.r ? hid(n.r.s, n.r.e, 'close') : '') : R(n);   // brackets the layout already shows
function callH(n) {
  const f = n.f, nm = f.v, t = n.args.some(tall) ? ' tall' : '';
  const args = n.args.map((a, k) => (k ? leaf('o c', ',', n.commas[k - 1].s, n.commas[k - 1].e) : '') + (n.lp ? R(a) : G(a))).join('');
  if (nm === 'sqrt' || nm === 'cbrt') return `<span class="cl-sqrt">${nm === 'cbrt' ? '<span class="cl-idx">3</span>' : ''}${RAD}<span class="cl-rc">${hid(f.s, f.ne, true)}${n.lp ? hid(n.lp.s, n.lp.e, true) : ''}${n.lp ? n.args.map((a, k) => (k ? leaf('o c', ',', n.commas[k - 1].s, n.commas[k - 1].e) : '') + G(a)).join('') : args}${n.rp ? hid(n.rp.s, n.rp.e, 'close') : n.lp ? '<span data-ghost=""></span>' : ''}</span></span>`;
  if (nm === 'abs') return leaf('p' + t, '|', f.s, f.ne) + (n.lp ? hid(n.lp.s, n.lp.e, true) : '') + args + (n.rp ? leaf('p' + t, '|', n.rp.s, n.rp.e) : ghostH('|', t));
  const head = leaf('f', esc(DISP[nm] || nm), f.s, f.ne) + (f.sub ? subH(f.sub) : '');
  if (n.lp) return head + leaf('p' + t, '(', n.lp.s, n.lp.e) + args + (n.rp ? leaf('p' + t, ')', n.rp.s, n.rp.e) : ghostH(')', t));
  if (n.args[0].t !== 'hole') return head + '<span class="cl-sp"></span>' + args;   // ln 2
  if (f.sub && !f.sub.text) return head;   // log_ : only the base's box, not the argument's yet
  return head + '<span class="cl-p ghost">(</span>' + args + ghostH(')');   // log₂(□): the brackets → will type
}
function R(n) {
  switch (n.t) {
    case 'num': return leaf('n', esc(n.tok.m) + (n.tok.x !== null ? sciH(n.tok.x) : ''), n.tok.s, n.tok.e);
    case 'var': return varH(n.tok);
    case 'hole': return holeH(n.p, n.q);
    case 'bin': return R(n.a) + leaf('o', OPS[n.op.v], n.op.s, n.op.e) + R(n.b);
    case 'neg': return leaf('o u', n.op.v === '-' ? '−' : '+', n.op.s, n.op.e) + R(n.a);
    case 'imp': return R(n.a) + (digitFirst(n.b) ? '<span class="cl-dot">·</span>' : '') + R(n.b);
    case 'frac': return fracH(G(n.a), hid(n.op.s, n.op.e, true) + G(n.b));
    case 'pow': return R(n.a) + `<span class="cl-sup">${hid(n.op.s, n.op.e, true)}${G(n.b)}</span>`;
    case 'fact': return R(n.a) + leaf('o f', '!', n.op.s, n.op.e);
    case 'par': { const t = tall(n.a) ? ' tall' : ''; return leaf('p' + t, '(', n.l.s, n.l.e) + R(n.a) + (n.r ? leaf('p' + t, ')', n.r.s, n.r.e) : ghostH(')', t)); }
    case 'call': return callH(n);
    case 'set': return varH(n.v) + leaf('o', '=', n.op.s, n.op.e) + R(n.a);
    case 'seq': return n.items.map(R).join('');
    case 'junk': return leaf('err', esc(n.tok.raw), n.tok.s, n.tok.e);
  }
  return '';
}
const render = tree => R(tree);

/* ---------- showing a result: fraction when it is short, decimal beside it ---------- */
const trimZ = s => s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
function fmtNum(x) {
  const a = Math.abs(x); let m, e = null;
  if (a !== 0 && (a >= 1e10 || a < 1e-6)) { const [mm, ee] = x.toExponential(9).split('e'); m = trimZ(mm); e = +ee; } else m = trimZ(x.toPrecision(10));
  return { h: m.replace('-', '−') + (e === null ? '' : sciH(e)), approx: Number(e === null ? m : m + 'e' + e) !== x, t: x < 0 ? `(${x})` : String(x) };
}
function exactDec(q) {   // the decimal, when it ends and is short (3/8 = 0.375)
  let d = q.d, k2 = 0, k5 = 0; while (d % 2n === 0n) { d /= 2n; k2++; } while (d % 5n === 0n) { d /= 5n; k5++; }
  const k = Math.max(k2, k5); if (d !== 1n || k > 12) return null;
  const n = q.n * 10n ** big(k) / q.d, ng = n < 0n, s = (ng ? -n : n).toString().padStart(k + 1, '0');
  if (s.length > 16) return null;
  return (ng ? '−' : '') + trimZ(s.slice(0, s.length - k) + '.' + s.slice(s.length - k));
}
// { h: html, approx: shown value is rounded, t: text to insert in an expression, alt: { h, approx } a second form }
function show(v) {
  if (!isQ(v)) return fmtNum(v.f);
  const ng = v.n < 0n, an = (ng ? -v.n : v.n).toString(), ds = v.d.toString();
  if (v.d === 1n) return an.length <= 20 ? { h: (ng ? '−' : '') + an, approx: false, t: ng ? `(${v.n})` : an } : Object.assign(fmtNum(qToNum(v)), { t: ng ? `(${v.n})` : an });
  const dec = exactDec(v), x = fmtNum(qToNum(v)), alt = dec !== null ? { h: dec, approx: false } : { h: x.h, approx: true };
  if (an.length + ds.length <= 18 && (dec === null || ds.length <= 4)) return { h: (ng ? '<span class="cl-o u">−</span>' : '') + fracH(an, ds), approx: false, t: `(${v.n}/${ds})`, alt };
  return { h: alt.h, approx: alt.approx, t: x.t };
}
const ser = v => isQ(v) ? { n: v.n.toString(), d: v.d.toString() } : { f: v.f };
function de(o) { try { return o && (o.n !== undefined ? Q(big(o.n), big(o.d)) : typeof o.f === 'number' ? { f: o.f } : null); } catch { return null; } }
// a word to delete in one go with backspace: "sqrt(", "log_2(", "pi", "ans", and the "/(" or "^(" that opens a box
const CHUNK = new RegExp(`(?:(?:${[...Object.keys(FNS), ...Object.keys(ALIAS)].join('|')})(?:_[A-Za-z0-9]*|\\d+)?\\(|pi|ans|[/^]\\()$`, 'i');

/* What → types at the end of the text to leave the box being typed in (the text has no boxes, so leaving one needs a
   sign): "(" after a function's name or base (log₂ → log₂(□)), a space after an index or a one-piece exponent or
   denominator (2^3 then 4 is 2³·4, not 2³⁴), ")" to close an open bracket. '' when there is nothing to leave. */
function exitText(src) {
  const T = tokenize(src); if (!T.length) return '';
  let open = 0; T.forEach(t => { if (t.k === '(') open++; else if (t.k === ')' && open) open--; });
  if (/\s$/.test(src)) return open ? ')' : '';
  const last = T[T.length - 1]; let j = T.length - 1;
  if (last.k === 'Fn') return last.sub && !last.sub.text ? '' : '(';
  if (last.sub) return last.sub.text ? ' ' : '';
  if (last.k === ')') { for (let d = 0; j >= 0; j--) { if (T[j].k === ')') d++; else if (T[j].k === '(' && !--d) break; } if (j > 0 && T[j - 1].k === 'Fn') j--; }
  if (['N', 'V', 'K', ')'].includes(last.k)) {
    let pv = T[j - 1]; if (pv && pv.k === 'Op' && (pv.v === '-' || pv.v === '+') && T[j - 2] && T[j - 2].v === '^') pv = T[j - 2];   // 2^-3
    if (pv && pv.k === 'Op' && (pv.v === '^' || pv.v === '/')) return ' ';
  }
  return open ? ')' : '';
}

ROOT.CALC = { parse, run, render, show, ser, de, CHUNK, exitText };
})();
