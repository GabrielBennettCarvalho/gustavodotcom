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
  for (const p of c.parts || []) { if (!p.id || !p.label || !Array.isArray(p.topics)) err(`${id}: part needs id, label, topics`); (p.topics || []).forEach(t => { if (!c.topics[t]) err(`${id}: part ${p.id} has unknown topic "${t}"`); }); }
  const SK = new Map(), lesSk = {};
  for (const s of c.skills || []) {
    if (!s.id || !s.label) err(`${id}: skill needs id and label`); if (SK.has(s.id)) err(`${id}: duplicate skill ${s.id}`); SK.set(s.id, s);
    if (!c.topics[s.t]) err(`${id}: skill ${s.id} has unknown topic "${s.t}"`);
    (s.les || []).forEach(l => { if (!L.has(l)) err(`${id}: skill ${s.id} lists missing lesson "${l}"`); if (lesSk[l]) err(`${id}: lesson ${l} is in skills ${lesSk[l]} and ${s.id}`); lesSk[l] = s.id; });
    if (c.past) (s.seen || []).forEach(k => { if (!c.past.includes(k)) err(`${id}: skill ${s.id} seen in "${k}", which is not in past`); });
  }
  for (const q of c.questions) {
    const tag = `${id}/${q.id}`;
    if (seen.has(q.id)) err(`${tag}: duplicate id`); seen.add(q.id);
    if (!c.topics[q.t]) err(`${tag}: unknown topic "${q.t}"`);
    if (![1, 2, 3, 4].includes(q.l)) err(`${tag}: invalid level`);
    if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6) err(`${tag}: options`);
    const a = Array.isArray(q.a) ? q.a : [q.a]; if (!a.length || a.some(i => !(i >= 0 && i < (q.o || []).length))) err(`${tag}: answer out of range`);
    if (!q.e) err(`${tag}: missing explanation`);
    if (q.les && !L.has(q.les)) err(`${tag}: lesson "${q.les}" does not exist`);
    if (q.ctx && !L.has(q.ctx)) err(`${tag}: case "${q.ctx}" does not exist`);
    if (q.reserved && q.reserved !== 'exam') err(`${tag}: "reserved" can only be 'exam'`);
    if (q.calc !== undefined && typeof q.calc !== 'boolean') err(`${tag}: "calc" must be true/false`);
    if (q.code !== undefined && typeof q.code !== 'string') err(`${tag}: "code" must be text`);
    if (q.step !== undefined && typeof q.step !== 'string') err(`${tag}: "step" must be text like '2/3'`);
    if (q.k !== undefined && q.k !== '' && !SK.has(q.k)) err(`${tag}: skill "${q.k}" does not exist`);
    if (q.kind !== undefined && !['method', 'check', 'bug'].includes(q.kind)) err(`${tag}: "kind" must be method, check or bug`);
    if (q.d && c.render) { try { const s = c.render(q.d); if (!s || !String(s).includes('<svg')) err(`${tag}: empty diagram`); } catch (e) { err(`${tag}: diagram fails (${e.message})`); } }
  }
  // Warn when the right answer gives itself away by being clearly the longest option.
  const tell = c.questions.filter(q => { if (Array.isArray(q.a) || !Array.isArray(q.o)) return false;
    const L = q.o.map(o => String(o).length), r = L[q.a], others = L.filter((_, i) => i !== q.a);
    return r > Math.max(...others) && r > 1.3 * others.reduce((x, y) => x + y, 0) / others.length; });
  // every question is shown on its own (shuffled, mock exam): it must not lean on the previous one
  const leans = c.questions.filter(q => /^(E |Mesm[oa] (problema|cenário|cache|sistema|caso|código|rede|tabela|sessão|captura|resposta|ligação)|No mesmo |Na mesma |No caso anterior|Nesse caso|Depois do padding|Com o mesmo )/i.test(q.q));
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
  console.log(`${id}: ${c.lessons.length} lessons, ${c.questions.length} questions (${res} reserved for the exam), ${c.extras.length} extra(s)${pr}${added.length ? `, +${added.length} new ids` : ''}`);
}
process.exit(errs ? 1 : 0);
