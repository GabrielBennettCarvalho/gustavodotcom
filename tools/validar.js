// Valida o conteúdo de todas as cadeiras e mantém o registo de ids (só cresce).
const fs = require('fs'), path = require('path'), vm = require('vm');
const [, , contentFile, cadDir] = process.argv;
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(contentFile, 'utf8'), ctx);
const REG = ctx.ESTUDO; let errs = 0; const err = m => { console.error('ERRO ' + m); errs++; };
for (const id of REG.ordem) {
  const c = REG.cadeiras[id];
  if (!c.temas) { err(`${id}: falta ESTUDO.cadeira({...})`); continue; }
  const L = new Set(c.licoes.map(l => l.id)), seen = new Set();
  for (const l of c.licoes) { if (!c.temas[l.t]) err(`${id}/${l.id}: tema "${l.t}" desconhecido`); }
  for (const q of c.perguntas) {
    const tag = `${id}/${q.id}`;
    if (seen.has(q.id)) err(`${tag}: id repetido`); seen.add(q.id);
    if (!c.temas[q.t]) err(`${tag}: tema "${q.t}" desconhecido`);
    if (![1, 2, 3, 4].includes(q.l)) err(`${tag}: nível inválido`);
    if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6) err(`${tag}: opções`);
    const a = Array.isArray(q.a) ? q.a : [q.a]; if (!a.length || a.some(i => !(i >= 0 && i < (q.o || []).length))) err(`${tag}: resposta fora das opções`);
    if (!q.e) err(`${tag}: falta explicação`);
    if (q.les && !L.has(q.les)) err(`${tag}: lição "${q.les}" não existe`);
    if (q.ctx && !L.has(q.ctx)) err(`${tag}: caso "${q.ctx}" não existe`);
    if (q.d && c.render) { try { const s = c.render(q.d); if (!s || !String(s).includes('<svg')) err(`${tag}: diagrama vazio`); } catch (e) { err(`${tag}: diagrama falha (${e.message})`); } }
  }
  // registo de ids: a posição de cada id nunca muda (a chave de progresso depende disto)
  const regFile = path.join(cadDir, id, 'registo.json');
  const reg = fs.existsSync(regFile) ? JSON.parse(fs.readFileSync(regFile, 'utf8')) : [];
  const known = new Set(reg); const novos = c.perguntas.map(q => q.id).filter(x => !known.has(x));
  if (!errs && novos.length) fs.writeFileSync(regFile, JSON.stringify(reg.concat(novos), null, 0).replace(/","/g, '",\n"'));
  const res = c.perguntas.filter(q => q.reservada === 'exame').length;
  console.log(`${id}: ${c.licoes.length} lições, ${c.perguntas.length} perguntas (${res} reservadas para exame), ${c.extras.length} extra(s)${novos.length ? `, +${novos.length} no registo` : ''}`);
}
process.exit(errs ? 1 : 0);
