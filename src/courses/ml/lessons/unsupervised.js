/* ===== ML lessons, part 3: clustering, PCA, DFT, SVM, deep learning and CNNs (lectures 10–15) ===== */
STUDY.lessons('ml', [
/* ---------------- CLUSTERING ---------------- */
{ id: 'c-kmeans', t: 'clust', title: 'k-means',
  html: `<p>Sem professor (não supervisionado), queremos agrupar pontos parecidos. O k-means representa cada grupo por um <b>centróide</b> e alterna dois passos até nada mudar:</p>
  <ol><li><b>Atribuição</b>: cada ponto vai para o centróide mais próximo.</li>
  <li><b>Atualização</b>: cada centróide passa a ser a média dos pontos do seu grupo.</li></ol>
  <p>Minimiza a soma das distâncias quadráticas aos centróides, J = Σ<sub>k</sub> Σ<sub>x∈C<sub>k</sub></sub> ‖x − μ<sub>k</sub>‖². Cada passo nunca aumenta J, por isso <b>converge</b>, mas para um ótimo <b>local</b>: depende da inicialização (por isso corre-se várias vezes ou usa-se k-means++).</p>
  <ul><li>k é escolhido por nós (método do cotovelo, índices de validação).</li>
  <li>Com distância Manhattan, o centro que minimiza a soma das distâncias é a <b>mediana</b> (k-medians), mas nos exames costuma pedir-se a média.</li>
  <li><b>Sequencial</b> (online): para cada ponto novo, μ<sub>k</sub> ← μ<sub>k</sub> + η(x − μ<sub>k</sub>) só no centróide vencedor.</li></ul>
  <p>Exemplo (Exame 1 2024/25): x₁ = (0, 1), x₂ = (1, 0), x₃ = (−1, −1), x₄ = (−2, −2); c₁ = (1, 1), c₂ = (−2, −2). x₁, x₂ ficam a 1 de c₁ (e √13 de c₂) → C₁. x₃ está a √2 de c₂ (2√2 de c₁), x₄ a 0 de c₂ → C₂. Novos centros: c₁ = (0,5; 0,5), c₂ = (−1,5; −1,5).</p>`,
  key: 'k-means: atribui ao centróide mais próximo, centróide = média do grupo, repete. Converge para um ótimo local.' },
{ id: 'c-em', t: 'clust', title: 'Misturas de gaussianas e o algoritmo EM',
  html: `<p>O k-means dá atribuições “duras”. Numa <b>mistura de gaussianas</b>, cada cluster k é uma gaussiana N(μ<sub>k</sub>, Σ<sub>k</sub>) com um peso π<sub>k</sub> (prior, Σπ<sub>k</sub> = 1), e cada ponto pertence a todos com alguma probabilidade.</p>
  <p><b>Passo E</b> (expectation): a responsabilidade de k pelo ponto n, pela regra de Bayes:</p>
  <p style="text-align:center"><b>γ<sub>nk</sub> = p(k | x<sub>n</sub>) = π<sub>k</sub> N(x<sub>n</sub> | μ<sub>k</sub>, Σ<sub>k</sub>) / Σ<sub>j</sub> π<sub>j</sub> N(x<sub>n</sub> | μ<sub>j</sub>, Σ<sub>j</sub>)</b></p>
  <p><b>Passo M</b> (maximization), com N<sub>k</sub> = Σ<sub>n</sub> γ<sub>nk</sub>:</p>
  <ul><li>μ<sub>k</sub> = (1/N<sub>k</sub>) Σ<sub>n</sub> γ<sub>nk</sub> x<sub>n</sub> (média pesada)</li>
  <li>Σ<sub>k</sub> = (1/N<sub>k</sub>) Σ<sub>n</sub> γ<sub>nk</sub> (x<sub>n</sub> − μ<sub>k</sub>)(x<sub>n</sub> − μ<sub>k</sub>)ᵀ, já com a <b>nova</b> média</li>
  <li><b>π<sub>k</sub> = N<sub>k</sub> / N</b></li></ul>
  <p>Repete-se até a verosimilhança estabilizar. É o k-means “suave”: com covariâncias iguais e a tender para 0, o EM vira k-means. Problema: se uma gaussiana colapsa num único ponto, a variância vai a 0 e a verosimilhança explode (singularidade).</p>
  <p>Exemplo: se p(x₁|1) = 0,03 e p(x₁|2) = 0,01 com π = (0,5; 0,5), γ₁₁ = 0,015/(0,015 + 0,005) = 0,75. Somando as responsabilidades de cada cluster obtêm-se os N<sub>k</sub> e os novos π<sub>k</sub> = N<sub>k</sub>/N.</p>`,
  key: 'E: γₙₖ ∝ πₖ N(xₙ|μₖ,Σₖ). M: μₖ média pesada, Σₖ covariância pesada, πₖ = Nₖ/N.' },
{ id: 'c-valid', t: 'clust', title: 'Validar clusters: pureza, silhueta, Dunn, Davies-Bouldin',
  html: `<p><b>Critérios externos</b> (há etiquetas verdadeiras): <b>pureza</b> = (1/N) Σ<sub>k</sub> max<sub>c</sub> |C<sub>k</sub> ∩ classe c|. Cada cluster conta os pontos da sua classe maioritária. Exemplo: clusters {A, C} e {B, B} → (1 + 2)/4 = 0,75.</p>
  <p><b>Critérios internos</b> (só os dados):</p>
  <ul><li><b>Silhueta</b> de um ponto x: a(x) = distância média aos pontos do <b>seu</b> cluster; b(x) = distância média aos pontos do cluster <b>vizinho mais próximo</b>. <b>s(x) = 1 − a/b</b> se a &lt; b (em geral s = (b − a)/max(a, b)). s ∈ [−1, 1]: perto de 1 = bem agrupado; negativo = provavelmente no cluster errado. A silhueta de um cluster é a média dos seus pontos.</li>
  <li><b>Dunn</b>: menor distância entre clusters ÷ maior diâmetro de um cluster. Maior é melhor.</li>
  <li><b>Davies-Bouldin</b>: média, por cluster, do pior rácio (dispersão<sub>i</sub> + dispersão<sub>j</sub>)/distância(centros). Menor é melhor.</li></ul>
  <p>Exemplo: a = 4, b = 7 → s = 1 − 4/7 = 3/7 ≈ 0,43.</p>
  <p>Exemplo (Exame 1 2024/25): C₂ = {x₃ = (−1, −1), x₄ = (−2, −2)}, C₁ = {(0, 1), (1, 0)}. a(x₃) = √2; b(x₃) = (√5 + √5)/2 = √5 → s = 1 − √2/√5 = 0,368. a(x₄) = √2; b(x₄) = √13 → s = 0,608. Silhueta de C₂ = <b>0,488</b>.</p>`,
  key: 'Silhueta s = 1 − a/b (a: próprio cluster, b: cluster vizinho). Pureza conta a classe maioritária. Dunn ↑, DB ↓.' },

/* ---------------- PCA ---------------- */
{ id: 'pc-cov', t: 'pca', title: 'Matriz de covariância e valores próprios (2 × 2)',
  html: `<p><b>Matriz de covariância</b> da amostra: c<sub>ij</sub> = (1/(n−1)) Σ<sub>k</sub> (x<sub>i</sub><sup>(k)</sup> − m<sub>i</sub>)(x<sub>j</sub><sup>(k)</sup> − m<sub>j</sub>). É simétrica; na diagonal estão as variâncias.</p>
  <p><b>Receita</b> para uma matriz 2 × 2 C = [[a, b],[b, d]]:</p>
  <ol><li>Equação característica: det(C − λI) = 0 → λ² − (a + d)λ + (ad − b²) = 0.</li>
  <li>λ = [(a + d) ± √((a + d)² − 4(ad − b²))]/2. Soma dos λ = traço; produto = determinante.</li>
  <li>Vetor próprio de cada λ: resolve (C − λI)u = 0; um vetor que serve é u = (b, λ − a).</li>
  <li><b>Normaliza</b>: divide pelo comprimento, para ‖u‖ = 1.</li></ol>
  <p>Exemplo (Exame 1 2025/26): X = {(0, 0), (4, 0), (1, 1)}. m = (5/3, 1/3). c₁₁ = [(−5/3)² + (7/3)² + (−2/3)²]/2 = 4,333; c₂₂ = [(1/9)·(1 + 1 + 4)]/2 = 0,333; c₁₂ = [(−5/3)(−1/3) + (7/3)(−1/3) + (−2/3)(2/3)]/2 = −0,333.</p>
  <p>Traço = 4,667, det = 1,444 − 0,111 = 1,333 → λ₁ = <b>4,361</b>, λ₂ = <b>0,306</b>. u₁ ≈ (0,997; −0,083).</p>`,
  key: 'λ² − traço·λ + det = 0. Vetor próprio (b, λ − a), normalizado. Covariância amostral divide por n−1.' },
{ id: 'pc-pca', t: 'pca', title: 'PCA: projeção, reconstrução e quantas componentes',
  html: `<p>A PCA (transformada de Karhunen-Loève) roda os eixos para que fiquem alinhados com as direções de maior variância. Os novos eixos são os <b>vetores próprios</b> da matriz de covariância, ordenados pelos <b>valores próprios</b> (= variância ao longo de cada eixo). Na nova base a covariância é diagonal: as novas variáveis não estão correlacionadas.</p>
  <ul><li><b>Projeção</b> na componente k: y<sub>k</sub> = u<sub>k</sub>ᵀ(x − m) (com os dados centrados; as aulas por vezes projetam x diretamente, y = Uᵀx).</li>
  <li><b>Reconstrução</b> com as primeiras L componentes: x̂ = m + Σ<sub>k≤L</sub> y<sub>k</sub> u<sub>k</sub>. O erro é a variância das componentes deitadas fora.</li>
  <li><b>Variância explicada</b> pelas primeiras L: Σ<sub>k≤L</sub> λ<sub>k</sub> / Σ λ.</li>
  <li><b>Critério de Kaiser</b>: fica com as componentes de λ &gt; 1 (pensado para dados normalizados) — ou com as de λ acima da média.</li></ul>
  <p>Exemplo (Exame 1 2022/23): λ₁ = 2,6 e λ₂ = 0,32. Kaiser → só a 1.ª componente. 95% da variância? 2,6/2,92 = 89% &lt; 95% → são precisas as <b>duas</b>.</p>
  <p>Exemplo: x = (1, 1), m = (5/3, 1/3), u₁ = (0,997; −0,083). y = 0,997·(−0,667) − 0,083·0,667 = <b>−0,720</b>. Reconstrução: m + y·u₁ = (0,95; 0,39).</p>`,
  key: 'Componentes = vetores próprios por λ decrescente. Variância explicada = Σλ escolhidos / Σλ. Kaiser: λ > 1.' },
{ id: 'pc-ae', t: 'pca', title: 'SVD, autoencoders e tf-idf',
  html: `<p><b>SVD</b>: X = UΣVᵀ. As colunas de V (com dados centrados) são as componentes principais e os valores singulares ao quadrado/(n−1) são os valores próprios da covariância. É como se calcula a PCA na prática.</p>
  <p><b>Autoencoder</b>: rede treinada para reproduzir a entrada na saída, passando por uma camada estreita (o código). <b>Undercomplete</b>: código menor do que a entrada, obriga a comprimir. Com codificador e descodificador <b>lineares</b> e erro quadrático, aprende o mesmo subespaço que a PCA. Com ativações não lineares faz uma redução de dimensionalidade não linear.</p>
  <p><b>Overcomplete</b> (código maior do que a entrada): pode aprender a identidade trivial; evita-se com regularização, por exemplo <b>sparse autoencoders</b> (castigam ativações do código).</p>
  <p><b>Texto</b>: cada documento vira um vetor de pesos por termo.</p>
  <ul><li><b>tf</b>: frequência do termo no documento (muitas vezes 1 + log tf).</li>
  <li><b>idf</b> = log(N / df): termos raros (em poucos documentos) pesam mais; um termo em todos os documentos tem idf = 0.</li>
  <li><b>tf-idf</b> = tf × idf. Compara-se documentos com a semelhança do cosseno.</li></ul>
  <p>Exemplo: N = 1000 documentos, o termo aparece em 10 → idf = log₁₀(100) = 2. Com tf = 3: tf-idf = 6.</p>`,
  key: 'Autoencoder linear + MSE = PCA. idf = log(N/df): termos raros pesam mais. Documentos comparam-se pelo cosseno.' },

/* ---------------- DFT ---------------- */
{ id: 'f-dft', t: 'dft', title: 'Transformada de Fourier discreta',
  html: `<p>Um acorde é a soma de várias notas. A transformada de Fourier separa um sinal nas suas <b>frequências</b>, como um prisma separa a luz.</p>
  <ul><li><b>Período</b> T: duração de um ciclo; <b>frequência</b> f = 1/T (Hz).</li>
  <li><b>DFT</b> de N amostras: X<sub>k</sub> = Σ<sub>n=0</sub><sup>N−1</sup> x<sub>n</sub> · e<sup>−2πi kn/N</sup>, k = 0…N−1. É uma <b>transformação linear</b>: X = F x, com F a matriz das potências da raiz N-ésima da unidade ω = e<sup>−2πi/N</sup>.</li>
  <li>X₀ = Σ x<sub>n</sub> (componente contínua, a média vezes N). Para sinais reais, o espectro é simétrico: |X<sub>k</sub>| = |X<sub>N−k</sub>|.</li>
  <li>A FFT calcula a DFT em O(N log N) em vez de O(N²).</li></ul>
  <p>Exemplo N = 4: ω = −i, por isso F tem linhas (1, 1, 1, 1), (1, −i, −1, i), (1, −1, 1, −1), (1, i, −1, −i). Para x = (1, 0, 1, 0): X = (2, 0, 2, 0).</p>
  <p><b>Ruído</b>: ruído gaussiano espalha-se por todas as frequências com pouca energia; o sinal concentra-se em poucas. Pôr a zero os coeficientes pequenos e inverter remove o ruído (filtro).</p>
  <p><b>STFT</b>: sinais não estacionários (fala, música) mudam de frequência no tempo. Aplica-se a DFT a janelas curtas (por exemplo Hamming) que deslizam → espectrograma. Janela curta = boa resolução no tempo, má em frequência, e vice-versa.</p>`,
  key: 'DFT: Xₖ = Σ xₙ e^(−2πikn/N), transformação linear. STFT = DFT em janelas deslizantes (espectrograma).' },

/* ---------------- SVM ---------------- */
{ id: 's-margin', t: 'svm', title: 'SVM: a margem máxima',
  html: `<p>Entre todas as retas que separam duas classes, qual escolher? A SVM escolhe a que deixa a <b>maior margem</b>: a maior “estrada” vazia entre as classes. Intuitivamente, é a que generaliza melhor.</p>
  <ul><li>Hiperplano: wᵀx + b = 0. A distância (com sinal) de x ao hiperplano é y(x)/‖w‖.</li>
  <li>Escalando w para que os pontos mais próximos tenham t<sub>k</sub>(wᵀx<sub>k</sub> + b) = 1, a margem vale <b>2/‖w‖</b>.</li>
  <li>Problema: minimizar ½‖w‖² sujeito a t<sub>k</sub>(wᵀx<sub>k</sub> + b) ≥ 1 para todos os k (otimização quadrática convexa: mínimo global).</li>
  <li><b>Vetores de suporte</b>: os pontos que ficam em cima da margem. Só eles definem o hiperplano; os outros podiam ser removidos sem mudar nada.</li></ul>
  <p><b>Problema dual</b> (multiplicadores de Lagrange α<sub>k</sub> ≥ 0): w = Σ α<sub>k</sub> t<sub>k</sub> x<sub>k</sub>, e α<sub>k</sub> &gt; 0 só nos vetores de suporte. Os dados só aparecem em produtos internos x<sub>i</sub>ᵀx<sub>j</sub>, e isso abre a porta ao truque do kernel.</p>
  <p><b>Soft margin</b> (dados não separáveis): variáveis de folga ξ<sub>k</sub> ≥ 0 e minimiza-se ½‖w‖² + C Σ ξ<sub>k</sub>. C grande = poucos erros no treino (margem estreita); C pequeno = margem larga, tolera erros.</p>`,
  key: 'Margem = 2/‖w‖ → minimizar ½‖w‖². Só os vetores de suporte contam. C troca margem por erros.' },
{ id: 's-kernel', t: 'svm', title: 'O truque do kernel',
  html: `<p>Dados que não se separam com uma reta podem separar-se num espaço de dimensão maior φ(x). Como o dual só usa produtos internos, basta saber calcular <b>K(x, y) = φ(x)ᵀφ(y)</b> sem nunca construir φ explicitamente.</p>
  <ul><li><b>Polinomial</b>: K(x, y) = (xᵀy + 1)<sup>p</sup>. Com p = 2 em 2D corresponde a φ(x) = (1, √2x₁, √2x₂, x₁², x₂², √2x₁x₂): 6 dimensões.</li>
  <li><b>Gaussiano / RBF</b>: K(x, y) = exp(−‖x − y‖²/(2σ²)). Corresponde a um espaço de dimensão infinita.</li>
  <li><b>Teorema de Mercer</b>: K é um kernel válido se a matriz de Gram K(x<sub>i</sub>, x<sub>j</sub>) for sempre simétrica e semidefinida positiva.</li></ul>
  <p>Classificar um ponto novo: sinal de Σ α<sub>k</sub> t<sub>k</sub> K(x<sub>k</sub>, x) + b, somando só sobre os vetores de suporte.</p>
  <p>Exemplo: x = (1, 2), y = (3, 1) com kernel polinomial de grau 2: xᵀy = 3 + 2 = 5 → K = (5 + 1)² = <b>36</b>.</p>
  <p>Uma SVM com kernel gaussiano parece uma rede RBF, e com kernel sigmoide uma rede de duas camadas, mas o número de “neurónios” (vetores de suporte) é decidido pelo treino.</p>`,
  key: 'K(x, y) = φ(x)ᵀφ(y) sem calcular φ. Polinomial (xᵀy + 1)ᵖ, gaussiano exp(−‖x−y‖²/2σ²).' },

/* ---------------- DEEP LEARNING ---------------- */
{ id: 'dl-why', t: 'deep', title: 'Redes profundas e o gradiente que desaparece',
  html: `<p>Uma rede com uma camada escondida já é universal, mas pode precisar de neurónios em número exponencial. Redes <b>profundas</b> (muitas camadas, “thin + tall”) reutilizam características intermédias (organização hierárquica: arestas → formas → objetos) e representam o mesmo com muito menos parâmetros.</p>
  <p><b>Vanishing gradient</b>: no backprop, o delta de cada camada é multiplicado por f'(z). Com a sigmoide, σ' ≤ 0,25 (e ≈ 0 quando |z| é grande, na saturação): ao fim de muitas camadas o gradiente nas primeiras é quase zero e elas deixam de aprender. Com a tanh, tanh' ≤ 1, mas também satura.</p>
  <ul><li><b>ReLU</b> = max(0, z): derivada 1 para z &gt; 0, não satura. Problema: neurónios “mortos” (z &lt; 0 sempre → gradiente 0). <b>Leaky ReLU</b>: pequena inclinação (por exemplo 0,01z) para z &lt; 0.</li>
  <li><b>Redes residuais</b> (ResNet): ligações que saltam camadas (x + F(x)); o gradiente passa direto pelo atalho.</li>
  <li><b>Inicialização Xavier/Glorot</b>: pesos com variância ≈ 1/n<sub>in</sub> (ou 2/(n<sub>in</sub> + n<sub>out</sub>)), para os sinais não explodirem nem morrerem.</li>
  <li><b>Batch normalization</b>: normaliza as ativações de cada mini-batch (média 0, variância 1) antes da ativação.</li>
  <li>Normaliza também as entradas (média 0, variância 1).</li></ul>`,
  key: 'σ′ ≤ 0,25 → o gradiente encolhe em cada camada. ReLU, ResNet, Xavier e batch norm resolvem.' },
{ id: 'dl-reg', t: 'deep', title: 'Treinar bem: regularização e otimizadores',
  html: `<p><b>Contra o overfitting</b>:</p>
  <ul><li><b>Paragem antecipada</b> (early stopping): pára quando o erro no conjunto de <b>validação</b> começa a subir.</li>
  <li><b>l₂</b> (weight decay): E + (λ/2)‖w‖² → em cada passo os pesos encolhem: w ← (1 − ηλ)w − η∇E.</li>
  <li><b>l₁</b>: E + λΣ|w| → empurra pesos para exatamente 0 (esparsidade).</li>
  <li><b>Dropout</b>: em cada passo de treino, desliga cada neurónio com probabilidade p. A rede não pode depender de um neurónio só; é como treinar um ensemble. No teste usam-se todos (com os pesos escalados).</li>
  <li><b>Data augmentation</b>: rodar, cortar, espelhar imagens para ter mais exemplos.</li></ul>
  <p><b>Otimizadores</b> (o gradiente estocástico puro ziguezagueia):</p>
  <ul><li><b>Mini-batch</b>: gradiente médio de um pequeno lote (compromisso entre batch e SGD).</li>
  <li><b>Momentum</b>: v ← βv − η∇E; w ← w + v. Acumula velocidade nas direções consistentes. <b>Nesterov</b> calcula o gradiente no ponto “à frente”.</li>
  <li><b>AdaGrad</b>: divide η pela raiz da soma dos gradientes ao quadrado (taxa por parâmetro, que só desce). <b>RMSProp</b>: usa uma média móvel em vez da soma. <b>Adam</b> = momentum + RMSProp (com correção de viés).</li></ul>
  <p><b>Transfer learning</b>: reutiliza uma rede pré-treinada num problema grande (ImageNet), congela as primeiras camadas e treina só as últimas com os teus dados.</p>`,
  key: 'Overfitting: validação/early stopping, l₂, l₁, dropout. Otimizadores: momentum, AdaGrad, RMSProp, Adam.' },
{ id: 'dl-cnn', t: 'deep', title: 'Redes convolucionais (CNN)',
  html: `<p>Inspiradas no córtex visual (Hubel e Wiesel: células simples detetam arestas, células complexas toleram deslocamentos; Neocognitron de Fukushima com camadas S e C), as CNN processam imagens com três ideias:</p>
  <ul><li><b>Conetividade esparsa</b>: cada neurónio só vê uma pequena janela (o seu campo recetivo), não a imagem toda. Camada a camada, o campo recetivo cresce.</li>
  <li><b>Partilha de parâmetros</b>: o mesmo filtro (kernel) desliza por toda a imagem. Um detetor de arestas serve em qualquer posição → muito menos parâmetros e equivariância à translação.</li>
  <li><b>Pooling</b> (por exemplo max pooling 2 × 2): resume uma vizinhança pelo máximo, reduzindo a resolução e dando alguma invariância a pequenas translações.</li></ul>
  <p><b>Tamanho da saída</b> de uma convolução: (N − F + 2P)/S + 1, com entrada N × N, filtro F × F, padding P e stride S. Parâmetros de uma camada com K filtros F × F sobre C canais: K·(F·F·C + 1).</p>
  <p>Exemplo: entrada 32 × 32 × 3, 10 filtros 5 × 5, stride 1, sem padding → saída 28 × 28 × 10; parâmetros = 10·(5·5·3 + 1) = <b>760</b>.</p>
  <p>Arquitetura típica: [CONV → ReLU → POOL] repetido, e no fim camadas totalmente ligadas com softmax.</p>`,
  key: 'Saída = (N − F + 2P)/S + 1. Parâmetros = K·(F·F·C + 1). Partilha de pesos + pooling.' },
{ id: 'dl-rnn', t: 'deep', title: 'Redes recorrentes e LSTM',
  html: `<p>Para sequências (texto, fala) a rede precisa de memória. Uma <b>RNN</b> tem um estado escondido que passa de um instante para o seguinte:</p>
  <p style="text-align:center"><b>h<sub>t</sub> = f(W h<sub>t−1</sub> + U x<sub>t</sub> + b)</b>, &nbsp; y<sub>t</sub> = g(V h<sub>t</sub>)</p>
  <ul><li>Os mesmos pesos W, U, V são usados em todos os instantes (partilha de parâmetros no tempo).</li>
  <li>Desenrolando o grafo no tempo obtém-se uma rede profunda; treina-se com <b>backpropagation through time</b> (BPTT).</li>
  <li>Formatos: sequência → um (classificar uma frase), um → sequência, sequência → sequência (tradução automática, com codificador e descodificador).</li></ul>
  <p>Problema: o gradiente é multiplicado por W em cada passo atrás, por isso em sequências longas desaparece (ou explode). As <b>LSTM</b> resolvem com uma <b>célula de memória</b> e <b>portas</b> (esquecimento, entrada, saída) que decidem o que guardar, apagar e mostrar; a célula é atualizada por soma, o que deixa o gradiente fluir por muitos passos.</p>
  <p>Teoricamente, as RNN com pesos reais são Turing-completas (Siegelmann e Sontag).</p>`,
  key: 'RNN: hₜ = f(Whₜ₋₁ + Uxₜ). Treino por BPTT; o gradiente desaparece → LSTM com portas.' },
]);
