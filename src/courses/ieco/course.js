/* ===== IEco — Introdução à Economia (HACS) ===== */
STUDY.course({
  id: 'ieco',
  code: 'IEco',
  name: 'Introdução à Economia',
  when: '1.º sem. · P2',
  // Not part of the main LEIC plan: shown in its own section of the course menu.
  group: { id: 'hacs', title: 'HACS', eyebrow: 'Fora do plano principal',
    desc: 'Humanidades, Artes e Ciências Sociais: fora da engenharia, mas também para estudar a sério.' },
  tagline: 'Da procura ao planeta.',
  // Topics by chapter of the programme (1. Mercados e o Papel do Governo, 2. Falhas de Mercado & Ambiente).
  // Later chapters are added here, before exam, as they arrive.
  topics: {
    mkt:  { label: 'Economias de mercado', short: 'Mercado', c: 'var(--t-mkt)' },
    sd:   { label: 'Procura, oferta e equilíbrio', short: 'Procura e oferta', c: 'var(--t-sd)' },
    surp: { label: 'Excedentes, custo marginal e lucro', short: 'Excedentes', c: 'var(--t-surp)' },
    tax:  { label: 'Impostos e bem-estar', short: 'Impostos', c: 'var(--t-tax)' },
    // 2. Falhas de Mercado & Ambiente
    pub:  { label: 'Bens públicos, comuns e de clube', short: 'Tipos de bens', c: 'var(--t-pub)' },
    info: { label: 'Informação assimétrica', short: 'Informação', c: 'var(--t-info)' },
    pow:  { label: 'Poder de mercado', short: 'Poder de mercado', c: 'var(--t-pow)' },
    ext:  { label: 'Externalidades e como corrigi-las', short: 'Externalidades', c: 'var(--t-ext)' },
    env:  { label: 'Ambiente e alterações climáticas', short: 'Ambiente', c: 'var(--t-env)' },
    exam: { label: 'Estilo do exame (caderno de exercícios)', short: 'Exame', c: 'var(--t-iex)' },
  },
  // Nota final = 0,5 projeto + 0,5 exame (mínimo 8 no exame). The study app covers the exam.
  // Real exam: 1h15 for 20 multiple choice + 2 open questions; the mock has only the multiple choice.
  exam: { n: 20, min: 50 },
  // Sample exams from Fénix, as written at the start of "src".
  past: ['Exame Tipo 1', 'Exame Tipo 2'],
  render: d => ECD.render(d),
  // The formulas, with what each symbol means. Text writes {f:id}; a tap on the formula opens its card (README).
  formulas: {
    eq: { t: 'sd', name: 'Equilíbrio de mercado', f: 'Procura(Q*) = Oferta(Q*) → P*',
      legend: [['Q*', 'a quantidade de equilíbrio: a oferecida é igual à procurada'], ['P*', 'o preço de equilíbrio (market-clearing price)']],
      note: 'Com retas P = a − bQ e P = c + dQ: a − bQ = c + dQ, logo Q* = (a − c)/(b + d). Põe Q* numa das curvas para ter P*.' },
    cs: { t: 'surp', name: 'Excedente do consumidor', f: 'EC = Q* × (Pmáx − P*) / 2',
      legend: [['EC', 'excedente do consumidor, em €'], ['Pmáx', 'onde a procura corta o eixo do preço (Q = 0)'], ['P*', 'o preço pago'], ['Q*', 'a quantidade comprada']],
      note: 'É a área do triângulo entre a procura e o preço (rosa nos slides). Só vale assim com uma procura em linha reta.' },
    ps: { t: 'surp', name: 'Excedente do produtor', f: 'EP = Q* × (P* − Pmín) / 2',
      legend: [['EP', 'excedente do produtor, em €'], ['Pmín', 'onde a oferta corta o eixo do preço (Q = 0)'], ['P*', 'o preço recebido'], ['Q*', 'a quantidade vendida']],
      note: 'É a área entre o preço e a oferta (roxo nos slides). Lucro = EP − custos fixos.' },
    profit: { t: 'surp', name: 'Lucro com custo unitário constante', f: 'Lucro = (P − c) × Q',
      legend: [['P', 'o preço a que se vende essa quantidade (lido da procura)'], ['c', 'o custo de produzir cada unidade'], ['Q', 'a quantidade vendida']],
      note: 'Calcula para cada linha da tabela e escolhe a maior. Com P = c o lucro é zero, não negativo.' },
    rev: { t: 'tax', name: 'Receita do imposto', f: 'Receita = t × Q_t',
      legend: [['t', 'o imposto por unidade'], ['Q_t', 'a quantidade transacionada COM o imposto (não a de antes)']],
      note: 'É o retângulo entre o preço pago pelos consumidores e o recebido pelos produtores (verde nos slides).' },
    dwl: { t: 'tax', name: 'Carga excedente (DWL)', f: 'DWL = (Q* − Q_t) × t / 2',
      legend: [['Q*', 'a quantidade de equilíbrio sem imposto'], ['Q_t', 'a quantidade com o imposto'], ['t', 'o imposto por unidade: a altura do triângulo']],
      note: 'Verificação: EC + EP antes = EC + EP depois + receita + DWL.' },
    cms: { t: 'ext', name: 'Custo marginal social', f: 'CMS = CMP + CME',
      legend: [['CMP', 'custo marginal privado: o que custa ao decisor produzir mais uma unidade'], ['CME', 'custo marginal externo: o que essa unidade custa a terceiros (os pescadores, os vizinhos)'], ['CMS', 'custo marginal social: o custo total para a sociedade']],
      note: 'O mercado produz onde P = CMP; o ótimo social (Pareto-eficiente) é onde P = CMS. Com efeito externo negativo, CMS > CMP e produz-se demais.' },
    pigou: { t: 'ext', name: 'Imposto pigouviano', f: 't = CME no ótimo social',
      legend: [['t', 'o imposto por unidade produzida'], ['CME', 'o custo marginal externo, medido na quantidade socialmente ótima']],
      note: 'Com o imposto, a empresa produz onde CMP = P − t, que é a quantidade ótima. Com efeito externo positivo usa-se um subsídio.' },
    cap: { t: 'env', name: 'Equilíbrio cap and trade', f: 'CMgR_A = CMgR_B = preço da licença',
      legend: [['CMgR', 'custo marginal de redução (abatimento) de cada empresa (MPCA nos slides)'], ['A, B', 'as empresas que trocam licenças entre si']],
      note: 'A redução total é fixada pelo cap. Quem reduz mais barato reduz mais e vende licenças a quem reduz caro, até os custos marginais se igualarem.' },
    pv: { t: 'env', name: 'Valor presente (desconto)', f: 'VP = B / (1 + r)ᵗ',
      legend: [['B', 'o custo ou benefício que acontece daqui a t anos'], ['r', 'a taxa de desconto por ano'], ['t', 'quantos anos faltam']],
      note: 'Com r alto, danos climáticos daqui a 100 anos quase não contam hoje: é o dilema do desconto intertemporal.' },
  },
  importHelp: {
    notes: 'Usa os termos das aulas (procura, oferta, excedente do consumidor, carga excedente…) em português de Portugal.',
    example: { name: 'Pacote extra IEco', questions: [{ id: 'x-ieco-001', t: 'sd', l: 1, q: 'A um preço acima do preço de equilíbrio, o que acontece?', o: ['Excesso de oferta', 'Excesso de procura', 'O mercado está em equilíbrio', 'A curva da procura desloca-se'], a: 0, e: 'Acima de P* as empresas querem vender mais do que os consumidores querem comprar: há **excesso de oferta**, e o preço tende a descer.' }] },
  },
});
