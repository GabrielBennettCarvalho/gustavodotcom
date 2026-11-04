/* ===== ML — Aprendizagem (Machine Learning) ===== */
STUDY.course({
  id: 'ml',
  code: 'APRE',
  name: 'Aprendizagem (Machine Learning)',
  year: 3,
  semester: 1,
  tagline: 'Dos dados ao gradiente.',
  // Topics follow the lectures (1 to 15). Lectures 14 and 15 (deep learning and CNNs) share one topic.
  topics: {
    data:   { label: 'Dados, estatística e pré-processamento', short: 'Dados', c: 'var(--t-data)' },
    dt:     { label: 'Árvores de decisão: entropia e ganho de informação', short: 'Árvores', c: 'var(--t-dt)' },
    eval:   { label: 'Avaliação de modelos: matriz de confusão, ROC, validação', short: 'Avaliação', c: 'var(--t-eval)' },
    bayes:  { label: 'Probabilidade, Bayes, MAP/ML e Naive Bayes', short: 'Bayes', c: 'var(--t-bayes)' },
    knn:    { label: 'k vizinhos mais próximos e distâncias', short: 'kNN', c: 'var(--t-knn)' },
    linreg: { label: 'Regressão linear, funções base e regularização', short: 'Regressão linear', c: 'var(--t-linreg)' },
    percep: { label: 'Perceptrão, descida do gradiente e regra delta', short: 'Perceptrão', c: 'var(--t-percep)' },
    logreg: { label: 'Regressão logística, entropia cruzada e softmax', short: 'Reg. logística', c: 'var(--t-logreg)' },
    mlp:    { label: 'Redes neuronais (MLP) e backpropagation', short: 'MLP e backprop', c: 'var(--t-mlp)' },
    clust:  { label: 'Clustering: k-means, EM e validação', short: 'Clustering', c: 'var(--t-clust)' },
    pca:    { label: 'PCA, autoencoders e tf-idf', short: 'PCA', c: 'var(--t-pca)' },
    dft:    { label: 'DFT e processamento de sinal', short: 'DFT', c: 'var(--t-dft)' },
    svm:    { label: 'Máquinas de vetores de suporte (SVM) e kernels', short: 'SVM', c: 'var(--t-svm)' },
    deep:   { label: 'Deep learning, CNN e RNN', short: 'Deep e CNN', c: 'var(--t-deep)' },
    exam:   { label: 'Exames de 2021/22 a 2025/26', short: 'Exame', c: 'var(--t-mlx)' },
  },

  // The level map is a training run: every level is more epochs, and the loss keeps going down.
  levels: [
    { n: 1, t: 'Conceitos', d: 'O que é e para que serve', tag: 'época 1', sub: 'loss 2,30' },
    { n: 2, t: 'Mecanismos', d: 'Como funciona, passo a passo', tag: 'época 10', sub: 'loss 0,92' },
    { n: 3, t: 'Contas guiadas', d: 'Os problemas do exame, por partes', tag: 'época 50', sub: 'loss 0,31' },
    { n: 4, t: 'Exame', d: 'Problemas inteiros e armadilhas', tag: 'época 100', sub: 'loss 0,05' },
  ],
  map: {
    title: 'Curva de treino',
    start: { label: 'dados', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="27" r="3"/><circle cx="16" cy="20" r="3"/><circle cx="12" cy="12" r="3"/><rect x="23" y="9" width="6" height="6"/><rect x="27" y="22" width="6" height="6"/><path d="M4 34L34 4" stroke-dasharray="3 3"/></svg>' },
    end: { label: 'modelo = exame', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5v28h28"/><path d="M8 9c4 14 9 18 24 19"/><circle cx="31" cy="28" r="3" fill="var(--token)" stroke="none"/></svg>' },
    legend: ['● o ponto marca onde estás na curva', 'cada nível são mais épocas: a loss desce até ao exame'],
  },
  // The real exam is written (2 h, 20 points). The mock exam has no penalty, like the real grading.
  exam: { n: 16, min: 60, desc: 'O exame real é escrito: 2 horas, 20 valores, problemas com todas as contas. Aqui: 16 perguntas em 60 minutos, sem desconto por errada. Usa primeiro as perguntas dos exames de 2021/22 a 2025/26, que não aparecem nos outros modos.' },
  verdict: { ok: 'LOSS ↓', ko: 'LOSS ↑' },
  logo: '<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><circle cx="6" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="22" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="15" r="4" fill="var(--token)"/><path d="M9 8.5L20.5 14M9 21.5L20.5 16" stroke="currentColor" stroke-width="2"/></svg>',

  render: d => MLD.render(d),

  extras: [
    {
      id: 'chains',
      title: 'Problemas de exame, por partes',
      desc: 'Os problemas grandes do exame (árvore por ganho de informação, backprop, k-means, EM, PCA, regressão logística) partidos em passos, pela ordem em que os resolves no papel.',
      icon: 'flag',
      meta: ({ pool }) => `${new Set(pool.filter(q => q.ch).map(q => q.ch)).size} problemas`,
      questions: ({ pool, peek }) => {
        const by = {}; pool.filter(q => q.ch).forEach(q => (by[q.ch] = by[q.ch] || []).push(q));
        const chains = Object.values(by).map(a => a.sort((x, y) => parseInt(x.step) - parseInt(y.step)));
        const done = a => a.filter(q => peek(q.id).c > 0).length / a.length;
        return chains.map(a => [done(a) + Math.random() * 0.35, a]).sort((x, y) => x[0] - y[0]).slice(0, 2).flatMap(x => x[1]);
      },
    },
    {
      id: 'formulas',
      title: 'Fórmulas da folha de notas',
      desc: 'Reconhecer e aplicar as fórmulas que o exame pede sempre: entropia, Bayes, atualizações do gradiente, deltas, silhueta, covariância. Bom para preparar a folha de consulta.',
      icon: 'list',
      meta: ({ pool }) => `${pool.filter(q => q.ex === 'f').length} fórmulas`,
      questions: ({ pool, pick }) => pick(pool.filter(q => q.ex === 'f'), 10).sort((a, b) => a.l - b.l),
    },
  ],

  importHelp: {
    notes: 'Notação como nas aulas (net = wᵀx, o = σ(net), W[1], b[1], z[l] = W[l]x[l−1] + b[l], δ[l], η) e termos em português de Portugal (ganho de informação, matriz de confusão, descida do gradiente, valores próprios). Escreve a matemática com Unicode (Σ, σ, ∂, ŷ, ², ₁). Marca com "calc": true as perguntas que precisam de contas.',
    example: { name: 'Pacote extra entropia', questions: [{ id: 'x-dt-001', t: 'dt', l: 2, calc: true, q: 'Um nó tem 6 exemplos positivos e 2 negativos. Qual é a entropia (em bits)?', o: ['0,811', '0,750', '1,000', '0,544'], a: 0, e: 'H = −0,75·log₂0,75 − 0,25·log₂0,25 = 0,311 + 0,5 = **0,811 bits**.', w: { '2': '1 bit só acontece com as classes em partes iguais (4 e 4).' }, les: 'dt-entropy' }] },
  },
});
