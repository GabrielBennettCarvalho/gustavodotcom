/* ===== AMS — Análise e Modelação de Sistemas ===== */
ESTUDO.cadeira({
  id: 'ams',
  sigla: 'AMS',
  nome: 'Análise e Modelação de Sistemas',
  ano: 3, semestre: 1,
  titulo: 'Do token ao teste.',
  temas: {
    sys:  { label: 'Sistemas & Modelação', short: 'Sistemas', c: 'var(--t-sys)' },
    req:  { label: 'Requisitos', short: 'Requisitos', c: 'var(--t-req)' },
    arch: { label: 'ArchiMate & EA', short: 'ArchiMate', c: 'var(--t-arch)' },
    bpm:  { label: 'Processos de Negócio (BPM)', short: 'BPM', c: 'var(--t-bpm)' },
    bpmn: { label: 'BPMN', short: 'BPMN', c: 'var(--t-bpmn)' },
    exam: { label: 'Estilo do teste (casos e falhas A–F)', short: 'Teste', c: 'var(--t-exam)' },
  },
  // Desenha o campo "d" das perguntas e lições (diagramas BPMN/ArchiMate).
  render: d => DG.render(d),

  // Secções próprias desta cadeira, além dos modos padrão.
  extras: [{
    id: 'detetive',
    titulo: 'Detetive de diagramas',
    desc: 'Só perguntas com diagramas BPMN e ArchiMate: encontra o erro, segue o token.',
    icone: 'lens',
    meta: ({ pool }) => `${pool.filter(q => q.d).length} diagramas`,
    perguntas: ({ pool, pick, topLevel }) =>
      pick(pool.filter(q => q.d && q.l <= Math.max(topLevel(), 2)), 10).sort((a, b) => a.l - b.l),
  }],

  importar: {
    notas: 'Usa termos técnicos em inglês (como nas aulas) e explicações em português de Portugal.',
    exemplo: { name: 'Pacote extra BPMN', questions: [{ id: 'x-bpmn-001', t: 'bpmn', l: 2, q: 'Que gateway espera por TODOS os fluxos de entrada antes de continuar?', o: ['Exclusive (XOR) merge', 'Parallel (AND) join', 'Event-based gateway', 'Inclusive (OR) split'], a: 1, e: 'O AND-join sincroniza: só deixa passar o token quando chegaram tokens de todos os ramos de entrada.', w: { '0': 'O XOR-merge continua assim que chega UM token.' }, les: 'bpmn-gw' }] },
  },
});
