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
  // Parts of the course: each test covers its own topics. Topics for the 2nd test are added here as they arrive.
  parts: [
    { id: 't1', label: '1.º teste', topics: ['sys', 'req', 'arch', 'bpm', 'bpmn', 'exam'] },
    { id: 't2', label: '2.º teste', topics: [], note: 'A matéria do 2.º teste ainda não está cá.' },
  ],
  // Abbreviations: the app explains each one on tap wherever it appears.
  glossary: {
    UoD: 'Universe of Discourse: toda a informação, conceitos e relações pertinentes ao sistema. É a fonte dos requisitos, não um produto da análise.',
    SoS: 'System of Systems: sistemas independentes que, juntos, dão capacidades que nenhum tem sozinho.',
    EoI: 'Entity of Interest: o termo da ISO 42010 em vez de “system” (pode ser software, um processo, uma empresa…).',
    GST: 'General Systems Theory (Bertalanffy): a base do systems thinking. Holism, feedback, emergence, homeostasis.',
    INCOSE: 'International Council on Systems Engineering: a organização que define a Systems Engineering.',
    ISO: 'International Organization for Standardization: publica normas como a 42010 (descrição de arquiteturas), a 29148 (requisitos) e a 9001 (qualidade).',
    IEC: 'International Electrotechnical Commission: publica normas em conjunto com a ISO (ISO/IEC/IEEE 42010).',
    IEEE: 'Institute of Electrical and Electronics Engineers: publica normas técnicas, algumas com a ISO e a IEC.',
    CMMI: 'Capability Maturity Model Integration: modelo de maturidade de processos, por níveis.',
    MBSE: 'Model-Based Systems Engineering: os modelos são o artefacto central em todo o ciclo de vida, em vez de documentos.',
    MDE: 'Model-Driven Engineering: um passo além do MBSE, com modelos que geram código ou se executam.',
    PDCA: 'Plan, Do, Check, Act: o ciclo de melhoria contínua.',
    'V&V': 'Verification and Validation. Verification: o sistema está bem feito (face aos requisitos)? Validation: é o sistema certo (face ao propósito)?',
    CAD: 'Computer-Aided Design: software de desenho técnico.',
    EA: 'Enterprise Architecture: a descrição coerente de toda a organização, do negócio à tecnologia.',
    TOGAF: 'The Open Group Architecture Framework: um framework de EA, com método e processos. O ArchiMate é a linguagem; o TOGAF é o método.',
    IS: 'Information Systems (sistemas de informação): a camada entre o negócio e a infraestrutura.',
    IT: 'Information Technology: a infraestrutura tecnológica (o mesmo que TI).',
    TI: 'Tecnologias de Informação: a infraestrutura tecnológica (IT, em inglês).',
    BPM: 'Business Process Management: gerir a organização pelos seus processos de negócio.',
    BPMN: 'Business Process Model and Notation: a linguagem da OMG para desenhar processos (BPMN 2.0 em 2011).',
    BPMI: 'Business Process Management Initiative: publicou o BPMN 1.0 em 2004 e integrou a OMG em 2005.',
    OMG: 'Object Management Group: o consórcio que mantém o BPMN e o UML.',
    UML: 'Unified Modeling Language: a linguagem de modelação de software da OMG (classes, sequência, atividades…).',
    EPC: 'Event-driven Process Chain: notação de processos com eventos e funções alternados, muito usada com ERP.',
    ERP: 'Enterprise Resource Planning: software de gestão integrada da empresa (ex.: SAP).',
    IDEF0: 'Integration Definition for Function Modeling: notação para modelar funções (entradas, saídas, controlo, mecanismos).',
    BPEL: 'Business Process Execution Language: linguagem para orquestrar web services num processo executável.',
    XOR: 'Exclusive gateway: segue exatamente um caminho (o primeiro cuja condição é verdadeira).',
    AND: 'Parallel gateway: no split segue todos os caminhos; no join espera por todos.',
    OR: 'Inclusive gateway: segue todos os caminhos com condição verdadeira (um ou mais); o join espera pelos que foram ativados.',
    SGBD: 'Sistema de Gestão de Bases de Dados (ex.: PostgreSQL). Em ArchiMate é System Software.',
    SO: 'Sistema Operativo. Em ArchiMate é System Software.',
    API: 'Application Programming Interface: a forma de um programa usar os serviços de outro. Em ArchiMate, uma Application Interface.',
    RH: 'Recursos Humanos.',
    ADC: 'Associação Desportiva do Campus: a entidade do caso de treino da Piscina do Campus.',
  },

  // Mock exam graded like Q1 of the test: a wrong answer costs 0.25, a blank costs nothing.
  exam: { n: 20, min: 30, penalty: 1 / 4, desc: 'Como o Q1 do teste: escolha múltipla com 4 opções, resposta errada desconta 0,25 e em branco não desconta. 20 perguntas em 30 minutos. Usa primeiro o caso Piscina, que não aparece nos outros modos.' },

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
