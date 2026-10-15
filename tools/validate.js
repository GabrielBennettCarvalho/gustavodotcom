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
    if (q.d && c.render) { try { const s = c.render(q.d); if (!s || !String(s).includes('<svg')) err(`${tag}: empty diagram`); } catch (e) { err(`${tag}: diagram fails (${e.message})`); } }
  }
  const idsFile = path.join(coursesDir, id, 'ids.json');
  const ids = fs.existsSync(idsFile) ? JSON.parse(fs.readFileSync(idsFile, 'utf8')) : [];
  const known = new Set(ids); const added = c.questions.map(q => q.id).filter(x => !known.has(x));
  if (!errs && added.length) fs.writeFileSync(idsFile, JSON.stringify(ids.concat(added), null, 0).replace(/","/g, '",\n"') + '\n');
  const res = c.questions.filter(q => q.reserved === 'exam').length;
  console.log(`${id}: ${c.lessons.length} lessons, ${c.questions.length} questions (${res} reserved for the exam), ${c.extras.length} extra(s)${added.length ? `, +${added.length} new ids` : ''}`);
}
process.exit(errs ? 1 : 0);
