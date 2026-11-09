/* ===== SO — Sistemas Operativos ===== */
STUDY.course({
  id: 'so',
  code: 'SO',
  name: 'Sistemas Operativos',
  semester: 1,
  tagline: 'Do fork() ao page fault.',
  // Topics follow the parts of the exam (Grupo 1 to Grupo 7). Escalonamento shares Grupo 6 with pipes.
  topics: {
    fs:    { label: 'Sistemas de ficheiros: caminhos, descritores, inodes', short: 'Ficheiros', c: 'var(--t-fs)' },
    proc:  { label: 'Processos e tarefas: fork, exec, wait, pthreads', short: 'Processos e tarefas', c: 'var(--t-proc)' },
    mutex: { label: 'Exclusão mútua: trincos, interblocagem, filósofos', short: 'Trincos', c: 'var(--t-mutex)' },
    sync:  { label: 'Semáforos e variáveis de condição', short: 'Semáforos e condições', c: 'var(--t-sync)' },
    sig:   { label: 'Signals', short: 'Signals', c: 'var(--t-sig)' },
    pipe:  { label: 'Pipes, FIFOs e o núcleo', short: 'Pipes e núcleo', c: 'var(--t-pipe)' },
    sched: { label: 'Escalonamento: Unix clássico e CFS', short: 'Escalonamento', c: 'var(--t-sched)' },
    mem:   { label: 'Gestão de memória: paginação, TLB, segmentação', short: 'Memória', c: 'var(--t-mem)' },
    exam:  { label: 'Exames de 2025/26 (só no exame simulado)', short: 'Exame', c: 'var(--t-sox)' },
  },

  // The level map is the life of a process, piped from one state to the next. Priority goes up as you get closer.
  levels: [
    { n: 1, t: 'Conceitos', d: 'O que é e para que serve', tag: 'NOVO', sub: 'nice 19' },
    { n: 2, t: 'Mecanismos', d: 'Como funciona por dentro', tag: 'EXECUTÁVEL', sub: 'nice 10' },
    { n: 3, t: 'Código e tabelas', d: 'Prever outputs, preencher caixas, traduzir endereços', tag: 'EM EXECUÇÃO', sub: 'nice 0' },
    { n: 4, t: 'Exame', d: 'Perguntas de exames anteriores', tag: 'EXIT(0)', sub: 'nice −20' },
  ],
  map: {
    title: '$ ./estudar | grep exame',
    link: 'pipe',
    start: { label: 'fork()', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><circle cx="19" cy="8" r="4"/><circle cx="9" cy="30" r="4"/><circle cx="29" cy="30" r="4" fill="var(--token)" stroke="none"/><path d="M17 11.5 11 26.5M21 11.5l6 15"/></svg>' },
    end: { label: 'exit(0) = exame', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="7" width="30" height="24" rx="2"/><path d="M4 13h30"/><path d="M9 19l4 3-4 3"/><rect x="16" y="23" width="9" height="3" fill="var(--token)" stroke="none"/></svg>' },
    legend: ['▮ o cursor marca onde estás', 'cada | passa o teu output ao nível seguinte', 'quanto mais perto do exame, maior a prioridade'],
  },
  // Each mock exam: 20 questions, 60 minutes. A wrong answer costs 1/3 of a right one, as in the real exam.
  exam: { n: 20, min: 60, penalty: 1 / 3, desc: 'Como as perguntas de escolha múltipla do exame: 20 perguntas dos 7 grupos, 60 minutos, errada desconta 1/3, em branco não desconta. Usa primeiro as perguntas dos exames de 2025/26, que não aparecem nos outros modos.' },
  verdict: { ok: 'exit(0)', ko: 'SIGSEGV' },
  logo: '<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><rect x="2.5" y="5" width="25" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 11l4 3.5L7 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="13.5" y="17" width="8" height="3.4" fill="var(--token)"/></svg>',

  render: d => SOD.render(d),

  extras: [
    {
      id: 'out',
      title: 'Prever o output',
      desc: 'Programas com fork, exec, wait, threads, dup e pipes: o que aparece no ecrã (ou no ficheiro)? Desenha a árvore de processos antes de responder.',
      icon: 'list',
      meta: ({ pool }) => `${pool.filter(q => q.ex === 'out').length} programas`,
      questions: ({ pool, pick, topLevel }) => pick(pool.filter(q => q.ex === 'out' && q.l <= Math.max(topLevel(), 3)), 10).sort((a, b) => a.l - b.l),
    },
    {
      id: 'boxes',
      title: 'Preencher as caixas',
      desc: 'Os exercícios de sincronização do exame (produtor-consumidor, barbeiro, leitores-escritores, mina de ouro) caixa a caixa, pela ordem do código.',
      icon: 'flag',
      meta: ({ pool }) => `${new Set(pool.filter(q => q.ch).map(q => q.ch)).size} programas`,
      questions: ({ pool, peek }) => {
        const by = {}; pool.filter(q => q.ch).forEach(q => (by[q.ch] = by[q.ch] || []).push(q));
        const chains = Object.values(by).map(a => a.sort((x, y) => parseInt(x.step) - parseInt(y.step)));
        const done = a => a.filter(q => peek(q.id).c > 0).length / a.length;
        return chains.map(a => [done(a) + Math.random() * 0.35, a]).sort((x, y) => x[0] - y[0]).slice(0, 1).flatMap(x => x[1]);
      },
    },
    {
      id: 'mmu',
      title: 'Ser a MMU',
      desc: 'A tabela do exame: para cada endereço virtual, TLB hit ou miss, endereço físico, falta de página, acesso inválido ou violação de proteção.',
      icon: 'lens',
      meta: ({ pool }) => `${pool.filter(q => q.ex === 'mmu').length} traduções`,
      questions: ({ pool, pick }) => pick(pool.filter(q => q.ex === 'mmu'), 10).sort((a, b) => a.l - b.l),
    },
    {
      id: 'calc',
      title: 'Contas rápidas',
      desc: 'As contas que valem pontos certos: blocos de referências no ext3, latência do CFS, tamanho de páginas e de tabelas, overhead da TLB.',
      icon: 'bolt',
      meta: ({ pool }) => `${pool.filter(q => q.calc).length} contas`,
      questions: ({ pool, pick, topLevel }) => pick(pool.filter(q => q.calc && q.l <= Math.max(topLevel(), 3)), 10).sort((a, b) => a.l - b.l),
    },
  ],

  importHelp: {
    notes: 'Termos como nas aulas (tarefa, trinco, interblocagem, míngua, tabela de ficheiros abertos, falta de página, trama…) e explicações em português de Portugal. 4 opções por pergunta, como no exame. Cada pergunta traz o código ou os dados de que precisa. Marca com "calc": true as perguntas que precisam de contas.',
    example: { name: 'Pacote extra ficheiros', questions: [{ id: 'x-fs-001', t: 'fs', l: 2, calc: true, q: 'No ext3, com blocos de 1 KB e referências de 4 bytes, quantos blocos de referências usa um ficheiro de 20 KB?', o: ['1', '0', '2', '20'], a: 0, e: '20 blocos de dados: 12 diretos + 8 no indireto simples, que ocupa **1 bloco**.', les: 'f-blocks' }] },
  },
});
