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
    exam: { label: 'Estilo do 1.º teste (casos e falhas A–F)', short: 'Teste 1', c: 'var(--t-exam)' },
    uml:  { label: 'UML e orientação a objetos', short: 'UML', c: 'var(--t-uml)' },
    uc:   { label: 'Casos de utilização', short: 'Casos de uso', c: 'var(--t-uc)' },
    cls:  { label: 'Modelo de domínio (classes)', short: 'Classes', c: 'var(--t-cls)' },
    stm:  { label: 'Máquinas de estados', short: 'Estados', c: 'var(--t-stm)' },
    seq:  { label: 'Diagramas de sequência', short: 'Sequência', c: 'var(--t-seq)' },
    exam2: { label: 'Estilo do 2.º teste (MAP 2)', short: 'Teste 2', c: 'var(--t-exam2)' },
  },
  // Parts of the course: each test has its own topics, past tests, date (set in the app) and grading (exam).
  // The 2nd test's model test (teste modelo) goes in its past list when it arrives, newest first.
  parts: [
    { id: 't1', label: '1.º teste', topics: ['sys', 'req', 'arch', 'bpm', 'bpmn', 'exam'], past: ['Teste modelo AMS 2026', 'Exame 1 2022/23'],
      exam: { n: 20, min: 30, penalty: 1 / 4, desc: 'Como o Q1 do 1.º teste: escolha múltipla com 4 opções, resposta errada desconta 0,25 e em branco não desconta. 20 perguntas em 30 minutos. Usa primeiro o caso Piscina, que não aparece nos outros modos.' } },
    { id: 't2', label: '2.º teste', topics: ['uml', 'uc', 'cls', 'stm', 'seq', 'exam2'], past: ['MAP 2 2022/23', 'Exame 1 2022/23'],
      exam: { n: 16, min: 25, penalty: null, desc: 'Como o Grupo I do MAP 2: completar frases com o termo UML certo. Certa vale 1, errada ou em branco vale 0 (não desconta). 16 perguntas em 25 minutos. Os diagramas do Grupo II treinam-se na Oficina de diagramas.' } },
  ],
  // Past tests the questions come from (newest first), as written at the start of "src".
  past: ['Teste modelo AMS 2026', 'MAP 2 2022/23', 'Exame 1 2022/23'],
  // Exam problem types. 1.º teste: the theory is base matter (core) and the A–F faults came up in the model test.
  // 2.º teste: one type per diagram the MAP 2 and the exam ask to produce, plus the UML terms of Grupo I. A type with
  // diagram exercises (builds.js) is ready only after they are done on paper.
  skills: [
    { id: 's-sys', t: 'sys', label: 'Sistemas, modelos e viewpoints', core: true, les: ['sys-system', 'sys-thinking', 'sys-uod', 'sys-boundary', 'sys-cynefin', 'sys-models', 'sys-42010', 'sys-views', 'sys-lifecycle', 'sys-cases'],
      sheet: '<p><b>Sistema</b> = algo que persegue um objetivo para stakeholders, segundo as suas concerns. <b>UoD</b>: domínio (dentro) e contexto (fora). <b>42010</b>: stakeholder → concern → viewpoint → view.</p>' },
    { id: 's-req', t: 'req', label: 'Requisitos', core: true, seen: ['Exame 1 2022/23'], les: ['req-basics', 'req-kinds', 'req-vv'],
      sheet: '<p>Funcional, qualidade, constraint. <b>Verification</b>: construímos bem? <b>Validation</b>: construímos o sistema certo? Elicitation → specification → validation (completo e consistente).</p>' },
    { id: 's-arch', t: 'arch', label: 'ArchiMate: elementos e relações', core: true, seen: ['Teste modelo AMS 2026', 'Exame 1 2022/23'], les: ['arch-ea', 'arch-framework', 'arch-common', 'arch-business', 'arch-app', 'arch-tech', 'arch-rel', 'arch-derive', 'arch-motiv', 'arch-v4', 'arch-errors', 'arch-notation'],
      sheet: '<p>Ativa (quem) → comportamento (o quê) → passiva (sobre o quê). Assignment: quem faz. Serving: quem serve quem. Realization: o concreto realiza o abstrato. Triggering: fluxo de controlo; flow: transferência.</p>' },
    { id: 's-bpm', t: 'bpm', label: 'Processos de negócio (BPM)', core: true, les: ['bpm-process', 'bpm-types', 'bpm-arch'] },
    { id: 's-bpmn', t: 'bpmn', label: 'BPMN: tokens, eventos e gateways', core: true, seen: ['Teste modelo AMS 2026'], les: ['bpmn-core', 'bpmn-events', 'bpmn-boundary', 'bpmn-gw', 'bpmn-act', 'bpmn-collab', 'bpmn-errors', 'bpmn-notation'],
      sheet: '<p>XOR: um caminho. AND: todos (o join espera por todos). Event-based: o primeiro evento ganha. Message flow só entre pools.</p>' },
    { id: 's-fail', t: 'exam', label: 'Falhas A–F nos diagramas do teste', seen: ['Teste modelo AMS 2026'], les: ['exam-format', 'exam-uod', 'exam-oficial', 'case-adc', 'exam-viewpoints'],
      sheet: '<p>Âmbito → tipo → falta. A/B excesso (relação/conceito), C/D tipo errado, E/F omissão.</p>' },
    { id: 's-uml', t: 'uml', label: 'Termos UML (Grupo I)', seen: ['MAP 2 2022/23', 'Exame 1 2022/23'], les: ['uml-domain', 'uml-lang', 'uml-obj', 'uml-ocl', 'uml-comp', 'uml-beh', 'uml-notation'],
      sheet: '<p><b>Estrutura</b>: class, object, component, composite structure, deployment, package. <b>Comportamento</b>: use case, activity, state machine, interação (sequence, communication, overview, timing). Objeto = instância de classe; link = de associação; cenário = de caso de uso. SysML: block (bdd), ibd com parts e ports.</p>' },
    { id: 's-uc', t: 'uc', label: 'Diagrama de casos de utilização', seen: ['MAP 2 2022/23', 'Exame 1 2022/23'], les: ['uc-basics', 'uc-rel', 'uc-scen', 'uc-guide', 'uc-anti', 'uc-method'],
      sheet: '<p>Atores fora (papéis, sistemas externos), casos dentro, associação ator–caso. <b>include</b> (base → incluído): sempre. <b>extend</b> (extensão → base): opcional ou condicional. Generalização entre atores ou entre casos. Nome: verbo + nome, do ponto de vista do ator.</p>' },
    { id: 's-cls', t: 'cls', label: 'Modelo de domínio (diagrama de classes)', seen: ['MAP 2 2022/23', 'Exame 1 2022/23'], les: ['cls-class', 'cls-assoc', 'cls-aclass', 'cls-gen', 'cls-aggr', 'cls-method', 'cls-errors'],
      sheet: '<p>Nomes → classes; valores → atributos; estados → «enumeration». Multiplicidade escreve-se do lado da classe que se conta. Muitos-para-muitos com dados → classe-associação. Composição: a parte só existe no todo.</p>' },
    { id: 's-stm', t: 'stm', label: 'Máquina de estados de uma classe', seen: ['MAP 2 2022/23', 'Exame 1 2022/23'], les: ['stm-basics', 'stm-label', 'stm-pseudo', 'stm-comp', 'stm-method'],
      sheet: '<p>Estado: onde uma condição se mantém. Transição: <i>evento [guarda] / ação</i>. Sem evento: triggerless. Tempo: <i>after(48h)</i>, <i>when(data = fim)</i>. Inicial ●, final ◉, choice ◇, junction ●.</p>' },
    { id: 's-seq', t: 'seq', label: 'Diagrama de sequência de um caso de uso', seen: ['Exame 1 2022/23'], les: ['seq-basics', 'seq-frag', 'seq-method'],
      sheet: '<p>Lifelines: atores e o sistema. Mensagens pela ordem dos passos do UoD; síncrona ▶ cheia, resposta tracejada. <b>alt</b> [condição]/[else], <b>opt</b>, <b>loop</b> [para cada …].</p>' },
    { id: 's-trace', t: 'exam2', label: 'Verificar requisitos contra os diagramas', seen: ['MAP 2 2022/23'], les: ['exam2-trace', 'exam2-tk'],
      sheet: '<p>Para cada requisito: que diagrama e que elementos o modelam? OK, falta algo, ou errado (tipo, multiplicidade, ator, sentido)? Responde com os IDs (UC7, A9, C5…).</p>' },
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

  // Mock exam of the whole course (Tudo), like Grupo I of the exam; each part (test) has its own rules above.
  exam: { n: 20, min: 40, desc: 'Como o Grupo I do exame: completar frases com o termo certo, de toda a matéria, sem desconto por errada. 20 perguntas em 40 minutos.' },

  // Draws the "d" field of questions and lessons (BPMN/ArchiMate diagrams).
  render: d => UML.kinds.includes(d.kind) ? UML.render(d) : DG.render(d),

  // Course-specific sections, shown next to the standard modes.
  extras: [{
    id: 'detective',
    title: 'Detetive de diagramas',
    desc: 'Só perguntas com diagramas: encontra o erro, segue o token, lê as multiplicidades e as transições.',
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
