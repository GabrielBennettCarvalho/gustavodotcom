// Validates every course's content and keeps each course's ids.json (append-only).
// ids.json fixes each question's position forever: the progress key depends on it.
const fs = require('fs'), path = require('path'), vm = require('vm');
const [, , contentFile, coursesDir] = process.argv;
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(contentFile, 'utf8'), ctx);
const REG = ctx.STUDY; let errs = 0; const err = m => { console.error('ERROR ' + m); errs++; };
for (const id of REG.order) {
  const c = REG.courses[id];
  if (!c.topics) { err(`${id}: missing STUDY.course({...})`); continue; }
  const L = new Set(c.lessons.map(l => l.id)), seen = new Set();
  for (const l of c.lessons) if (!c.topics[l.t]) err(`${id}/${l.id}: unknown topic "${l.t}"`);
  // parts (1.º teste, 2.º teste…), exam problem types (skills) and past exams
  for (const p of c.parts || []) { if (!p.id || !p.label || !Array.isArray(p.topics)) err(`${id}: part needs id, label, topics`); (p.topics || []).forEach(t => { if (!c.topics[t]) err(`${id}: part ${p.id} has unknown topic "${t}"`); }); if (c.past) (p.past || []).forEach(k => { if (!c.past.includes(k)) err(`${id}: part ${p.id} lists "${k}", which is not in past`); }); }
  const SK = new Map(), lesSk = {};
  for (const s of c.skills || []) {
    if (!s.id || !s.label) err(`${id}: skill needs id and label`); if (SK.has(s.id)) err(`${id}: duplicate skill ${s.id}`); SK.set(s.id, s);
    if (!c.topics[s.t]) err(`${id}: skill ${s.id} has unknown topic "${s.t}"`);
    (s.les || []).forEach(l => { if (!L.has(l)) err(`${id}: skill ${s.id} lists missing lesson "${l}"`); if (lesSk[l]) err(`${id}: lesson ${l} is in skills ${lesSk[l]} and ${s.id}`); lesSk[l] = s.id; });
    if (c.past) (s.seen || []).forEach(k => { if (!c.past.includes(k)) err(`${id}: skill ${s.id} seen in "${k}", which is not in past`); });
  }
  // lessons split into cards (<!--card-->): every card should have at least one question for Aprender
  const cardsOf = lid => { const l = c.lessons.find(x => x.id === lid); return l ? (l.html || '').split(/<!--\s*card\s*-->/).length : 0; };
  for (const q of c.questions) {
    const tag = `${id}/${q.id}`;
    if (seen.has(q.id)) err(`${tag}: duplicate id`); seen.add(q.id);
    if (!c.topics[q.t]) err(`${tag}: unknown topic "${q.t}"`);
    if (![1, 2, 3, 4].includes(q.l)) err(`${tag}: invalid level`);
    if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6) err(`${tag}: options`);
    const a = Array.isArray(q.a) ? q.a : [q.a]; if (!a.length || a.some(i => !(i >= 0 && i < (q.o || []).length))) err(`${tag}: answer out of range`);
    if (!q.e) err(`${tag}: missing explanation`);
    if (q.les && !L.has(q.les)) err(`${tag}: lesson "${q.les}" does not exist`);
    if (q.card !== undefined) { const n = cardsOf(q.les); if (!Number.isInteger(q.card) || n < 2 || q.card < 1 || q.card > n) err(`${tag}: card ${q.card} does not exist in lesson "${q.les}" (${n < 2 ? 'it has no <!--card--> markers' : `it has ${n} cards`})`); }
    if (q.ctx && !L.has(q.ctx)) err(`${tag}: case "${q.ctx}" does not exist`);
    if (q.reserved && q.reserved !== 'exam') err(`${tag}: "reserved" can only be 'exam'`);
    if (q.calc !== undefined && typeof q.calc !== 'boolean') err(`${tag}: "calc" must be true/false`);
    if (q.code !== undefined && typeof q.code !== 'string') err(`${tag}: "code" must be text`);
    if (q.step !== undefined && typeof q.step !== 'string') err(`${tag}: "step" must be text like '2/3'`);
    if (q.k !== undefined && q.k !== '' && !SK.has(q.k)) err(`${tag}: skill "${q.k}" does not exist`);
    if (q.kind !== undefined && !['method', 'check', 'bug'].includes(q.kind)) err(`${tag}: "kind" must be method, check or bug`);
    if (q.d && c.render) { try { const s = c.render(q.d); if (!s || !String(s).includes('<svg')) err(`${tag}: empty diagram`); } catch (e) { err(`${tag}: diagram fails (${e.message})`); } }
  }
  // key problems (typed answers): every answer, mask and known mistake must have the same shape
  const flat = a => Array.isArray(a[0]) ? a.flat() : a, pbIds = new Set();
  for (const p of c.problems || []) {
    const ptag = `${id}/problem ${p.id}`;
    if (pbIds.has(p.id)) err(`${ptag}: duplicate id`); pbIds.add(p.id);
    if (!c.topics[p.t]) err(`${ptag}: unknown topic "${p.t}"`); if (p.skill && !SK.has(p.skill)) err(`${ptag}: skill "${p.skill}" does not exist`);
    if (!Array.isArray(p.stages) || !p.stages.length) { err(`${ptag}: needs stages`); continue; }
    for (const st of p.stages) {
      const stag = `${ptag}/${st.id}`;
      if (pbIds.has(st.id)) err(`${stag}: duplicate id`); pbIds.add(st.id);
      if (!['guided', 'half', 'alone'].includes(st.kind)) err(`${stag}: kind must be guided, half or alone`);
      if (st.kind === 'alone' && !st.alone) err(`${stag}: an "alone" stage needs alone: true`);
      if (!st.stmt) err(`${stag}: missing statement`);
      if (st.d && c.render) { try { if (!String(c.render(st.d)).includes('<svg')) err(`${stag}: empty diagram`); } catch (e) { err(`${stag}: diagram fails (${e.message})`); } }
      if (!(st.steps || []).length) err(`${stag}: needs steps`);
      for (const s of st.steps || []) {
        const t = `${stag}/${s.name}`, n = flat(s.ans || []).length;
        if (!s.ask || !s.name || !s.e) err(`${t}: needs ask, name and e`);
        if (!n || flat(s.ans).some(v => typeof v !== 'number' || isNaN(v))) err(`${t}: "ans" must be numbers`);
        if (s.show && flat(s.show).length !== n) err(`${t}: "show" has a different shape from "ans"`);
        if (s.show && flat(s.show).every(Boolean)) err(`${t}: nothing left to type`);
        if (!st.alone && !(s.hints || []).length) err(`${t}: needs hints`);
        if (s.les && !L.has(s.les)) err(`${t}: lesson "${s.les}" does not exist`);
        for (const m of s.miss || []) { if (flat(m.v).length !== n) err(`${t}: a known mistake has a different shape`); if (!m.m) err(`${t}: a known mistake needs a message`); if (flat(m.v).every((v, i) => Math.abs(v - flat(s.ans)[i]) < 0.011)) err(`${t}: a known mistake equals the answer`); }
      }
    }
  }
  // formulas with a legend: {f:id} or {f:id|text} must name a formula of the course. Not in options, step names or
  // "also": those are shown as plain text or are buttons themselves.
  const FX = c.formulas || {};
  for (const [k, F] of Object.entries(FX)) {
    if (!/^[a-z0-9-]+$/.test(k)) err(`${id}: formula id "${k}" must be lowercase letters, digits or -`);
    if (!F.f || !F.name || !Array.isArray(F.legend) || !F.legend.length) err(`${id}: formula ${k} needs f, name and a legend`);
    if (F.t && !c.topics[F.t]) err(`${id}: formula ${k} has unknown topic "${F.t}"`);
    (F.legend || []).forEach(r => { if (!Array.isArray(r) || r.length !== 2 || !r[0] || !r[1]) err(`${id}: formula ${k}: each legend row is [symbol, meaning]`); });
  }
  const fxRefs = (where, txt) => { const s = String(txt ?? ''), all = (s.match(/\{f:/g) || []).length, ok = [...s.matchAll(/\{f:([a-z0-9-]+)(?:\|[^}]*)?\}/g)];
    if (all !== ok.length) err(`${where}: a formula tag is malformed (write {f:id} or {f:id|text})`);
    ok.forEach(m => { if (!FX[m[1]]) err(`${where}: formula "${m[1]}" does not exist`); }); };
  const noFx = (where, txt) => { if (/\{f:/.test(String(txt ?? ''))) err(`${where}: no formula tags here ({f:…}): this text is shown as plain text`); };
  for (const l of c.lessons) { fxRefs(`${id}/${l.id}`, l.html); fxRefs(`${id}/${l.id} key`, l.key); }
  for (const s of c.skills || []) fxRefs(`${id}: skill ${s.id} sheet`, s.sheet);
  for (const q of c.questions) { const tag = `${id}/${q.id}`; fxRefs(tag, q.q); fxRefs(tag, q.e); Object.values(q.w || {}).forEach(w => fxRefs(tag, w)); (q.o || []).forEach(o => noFx(`${tag} option`, o)); }
  for (const p of c.problems || []) for (const st of p.stages || []) {
    const stag = `${id}/${st.id}`; fxRefs(stag, st.stmt); if (st.sol) fxRefs(`${stag} sol`, st.sol.t);
    for (const s of st.steps || []) { const t = `${stag}/${s.name}`; [s.ask, s.e, ...(s.hints || []), ...(s.miss || []).map(m => m.m)].forEach(x => fxRefs(t, x)); noFx(`${t} name`, s.name); noFx(`${t} also`, s.also); }
  }
  // Warn when the right answer gives itself away by being clearly the longest option.
  const tell = c.questions.filter(q => { if (Array.isArray(q.a) || !Array.isArray(q.o)) return false;
    const L = q.o.map(o => String(o).length), r = L[q.a], others = L.filter((_, i) => i !== q.a);
    return r > Math.max(...others) && r > 1.3 * others.reduce((x, y) => x + y, 0) / others.length; });
  // every question is shown on its own (shuffled, mock exam): it must not lean on the previous one
  const leans = c.questions.filter(q => /^(E |Mesm[oa] (problema|cenário|cache|sistema|caso|código|rede|tabela|sessão|captura|resposta|ligação)|No mesmo |Na mesma |No caso anterior|Nesse caso|Depois do padding|Com o mesmo )/i.test(q.q));
  const bare = c.lessons.filter(l => cardsOf(l.id) > 1).flatMap(l => Array.from({ length: cardsOf(l.id) }, (_, k) => k + 1).filter(k => !c.questions.some(q => q.les === l.id && q.card === k && !q.ch && q.reserved !== 'exam')).map(k => `${l.id}#${k}`));
  if (bare.length) console.log(`WARN ${id}: ${bare.length} lesson card(s) have no question of their own: ${bare.join(', ')}`);
  if (leans.length) console.log(`WARN ${id}: ${leans.length} question(s) refer to a previous question; give each one its own data: ${leans.map(q => q.id).join(', ')}`);
  if (tell.length) console.log(`WARN ${id}: in ${tell.length} question(s) the right answer is clearly the longest option: ${tell.map(q => q.id).join(', ')}`);
  const idsFile = path.join(coursesDir, id, 'ids.json');
  const ids = fs.existsSync(idsFile) ? JSON.parse(fs.readFileSync(idsFile, 'utf8')) : [];
  const known = new Set(ids); const added = c.questions.map(q => q.id).filter(x => !known.has(x));
  if (!errs && added.length) fs.writeFileSync(idsFile, JSON.stringify(ids.concat(added), null, 0).replace(/","/g, '",\n"') + '\n');
  const res = c.questions.filter(q => q.reserved === 'exam').length;
  // same rule as the engine's isCore: the type came up in a past exam, or the question comes from one
  const skOf = q => q.k !== undefined ? q.k : lesSk[q.les];
  const core = q => !SK.size || /^(exame|teste|map|mini|repescagem)/i.test(q.src || '') || !!(SK.get(skOf(q)) && (SK.get(skOf(q)).core || (SK.get(skOf(q)).seen || []).length));
  const pr = SK.size ? `, ${SK.size} problem types, ${c.questions.filter(core).length} priority / ${c.questions.filter(q => !core(q)).length} supplementary` : '';
  console.log(`${id}: ${c.lessons.length} lessons, ${c.questions.length} questions (${res} reserved for the exam), ${c.extras.length} extra(s)${(c.problems || []).length ? `, ${c.problems.length} key problem(s)` : ''}${pr}${added.length ? `, +${added.length} new ids` : ''}`);
}
process.exit(errs ? 1 : 0);
