/* ===== AMS — Análise e Modelação de Sistemas ===== */
STUDY.course({
  id: 'ams',
  code: 'AMS',
  name: 'Análise e Modelação de Sistemas',
  year: 3, semester: 1,
  tagline: 'Do token ao teste.',
  topics: {
    sys:  { label: 'Sistemas & Modelação', short: 'Sistemas', c: 'var(--t-sys)' },
    req:  { label: 'Requisitos', short: 'Requisitos', c: 'var(--t-req)' },
    arch: { label: 'ArchiMate & EA', short: 'ArchiMate', c: 'var(--t-arch)' },
    bpm:  { label: 'Processos de Negócio (BPM)', short: 'BPM', c: 'var(--t-bpm)' },
    bpmn: { label: 'BPMN', short: 'BPMN', c: 'var(--t-bpmn)' },
    exam: { label: 'Estilo do teste (casos e falhas A–F)', short: 'Teste', c: 'var(--t-exam)' },
  },
  // Draws the "d" field of questions and lessons (BPMN/ArchiMate diagrams).
  render: d => DG.render(d),

  // Course-specific sections, shown next to the standard modes.
  extras: [{
    id: 'detective',
    title: 'Detetive de diagramas',
    desc: 'Só perguntas com diagramas BPMN e ArchiMate: encontra o erro, segue o token.',
    icon: 'lens',
    meta: ({ pool }) => `${pool.filter(q => q.d).length} diagramas`,
    questions: ({ pool, pick, topLevel }) =>
      pick(pool.filter(q => q.d && q.l <= Math.max(topLevel(), 2)), 10).sort((a, b) => a.l - b.l),
  }],

  // Shown on the question bank page, to help students generate their own packs.
  importHelp: {
    notes: 'Usa termos técnicos em inglês (como nas aulas) e explicações em português de Portugal.',
    example: { name: 'Pacote extra BPMN', questions: [{ id: 'x-bpmn-001', t: 'bpmn', l: 2, q: 'Que gateway espera por TODOS os fluxos de entrada antes de continuar?', o: ['Exclusive (XOR) merge', 'Parallel (AND) join', 'Event-based gateway', 'Inclusive (OR) split'], a: 1, e: 'O AND-join sincroniza: só deixa passar o token quando chegaram tokens de todos os ramos de entrada.', w: { '0': 'O XOR-merge continua assim que chega UM token.' }, les: 'bpmn-gw' }] },
  },
});
