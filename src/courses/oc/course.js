/* ===== OC — Organização de Computadores ===== */
STUDY.course({
  id: 'oc',
  code: 'OC',
  name: 'Organização de Computadores',
  semester: 1,
  tagline: 'Do bit à cache.',
  topics: {
    perf:  { label: 'Desempenho e métricas', short: 'Desempenho', c: 'var(--t-perf)' },
    bits:  { label: 'Bits, hexadecimal e aritmética', short: 'Bits', c: 'var(--t-bits)' },
    isa:   { label: 'ISA RISC-V', short: 'RISC-V', c: 'var(--t-isa)' },
    comp:  { label: 'Compilador e execução de programas', short: 'Compilador', c: 'var(--t-comp)' },
    cache: { label: 'Caches: fundamentos', short: 'Caches', c: 'var(--t-cache)' },
    cperf: { label: 'Caches: políticas e AMAT', short: 'AMAT & políticas', c: 'var(--t-cperf)' },
    opt:   { label: 'Otimizar o acesso à memória', short: 'Otimizar memória', c: 'var(--t-opt)' },
    vm:    { label: 'Memória virtual e TLB', short: 'Mem. virtual', c: 'var(--t-vm)' },
    exam:  { label: 'Estilo do teste', short: 'Teste', c: 'var(--t-ocx)' },
  },

  // Levels climb the memory hierarchy: from slow RAM to the registers next to the CPU.
  levels: [
    { n: 1, t: 'Conceitos', d: 'Definições e analogias', tag: 'RAM', sub: '~60 ns' },
    { n: 2, t: 'Mecanismos', d: 'Como funciona, passo a passo', tag: 'L2', sub: '~5 ns' },
    { n: 3, t: 'Raciocínio e contas', d: 'Causa e efeito, contas guiadas', tag: 'L1', sub: '~1 ns' },
    { n: 4, t: 'Exame', d: 'Contas inteiras e armadilhas', tag: 'REG', sub: '< 1 ciclo' },
  ],
  map: {
    title: 'Hierarquia de níveis',
    link: 'bus',
    start: { label: 'disco', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="19" cy="9" rx="13" ry="5"/><path d="M6 9v20c0 3 6 5 13 5s13-2 13-5V9"/><path d="M6 19c0 3 6 5 13 5s13-2 13-5"/></svg>' },
    end: { label: 'CPU = teste', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="20" height="20" rx="2"/><rect x="14" y="14" width="10" height="10" fill="var(--token)" stroke="none"/><path d="M14 4v5M19 4v5M24 4v5M14 29v5M19 29v5M24 29v5M4 14h5M4 19h5M4 24h5M29 14h5M29 19h5M29 24h5"/></svg>' },
    legend: ['▣ o bloco verde marca onde estás', 'quanto mais perto do CPU, mais rápido (e mais difícil)'],
  },
  // Same rules as the real test: 45 minutes, a wrong answer costs 1/(number of options).
  exam: { n: 16, min: 45, penalty: 'options' },
  verdict: { ok: 'HIT', ko: 'MISS' },
  logo: '<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><rect x="7" y="7" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 3v4M15 3v4M19 3v4M11 23v4M15 23v4M19 23v4M3 11h4M3 15h4M3 19h4M23 11h4M23 15h4M23 19h4" stroke="currentColor" stroke-width="2"/><rect x="11" y="11" width="8" height="8" fill="var(--token)"/></svg>',

  render: d => OCD.render(d),

  extras: [{
    id: 'addrlab',
    title: 'Laboratório de endereços',
    desc: 'Só perguntas com o desenho do endereço: parte-o em tag | índice | offset e vê o que muda quando mexes no bloco ou nas vias.',
    icon: 'lens',
    meta: ({ pool }) => `${pool.filter(q => q.d && q.d.addr).length} endereços`,
    questions: ({ pool, pick, topLevel }) =>
      pick(pool.filter(q => q.d && q.d.addr && q.l <= Math.max(topLevel(), 2)), 10).sort((a, b) => a.l - b.l),
  }],

  importHelp: {
    notes: 'Usa RISC-V (não MIPS), termos técnicos como nas aulas (cache, miss, CPI…) e explicações em português de Portugal. Marca com "calc": true as perguntas que precisam de contas.',
    example: { name: 'Pacote extra caches', questions: [{ id: 'x-cache-001', t: 'cache', l: 2, calc: true, q: 'Cache de mapeamento direto com 64 linhas e blocos de 16 B. Quantos bits tem o índice?', o: ['4', '6', '10', '16'], a: 1, e: '64 linhas = 2⁶, logo o índice tem **6 bits**. O 4 seria o offset (16 B = 2⁴).', w: { '0': '4 bits é o offset: escolhe o byte dentro do bloco de 16 B.' }, les: 'c-addr' }] },
  },
});
