/* ===== ML lessons, part 2: linear regression, perceptron, logistic regression, MLP (lectures 6–9) ===== */
STUDY.lessons('ml', [
/* ---------------- LINEAR REGRESSION ---------------- */
{ id: 'lr-ls', t: 'linreg', title: 'Regressão linear e mínimos quadrados',
  html: `<p>Traçar a reta que passa “o mais perto possível” de uma nuvem de pontos. O modelo é y(x, w) = w₀ + w₁x₁ + … + w<sub>D</sub>x<sub>D</sub> = wᵀx, com x₀ = 1 para o bias w₀.</p>
  <p>“O mais perto possível” = minimizar a <b>soma dos quadrados dos erros</b>: E(w) = ½ Σ<sub>k</sub> (t<sub>k</sub> − wᵀx<sub>k</sub>)² (o MSE é a mesma coisa a dividir por N).</p>
  <p>Junta os exemplos numa <b>matriz de design</b> X (uma linha por exemplo, a primeira coluna toda a 1) e os alvos num vetor t. Igualando o gradiente a zero, obtém-se a solução fechada:</p>
  <p style="text-align:center"><b>w = (XᵀX)⁻¹ Xᵀ t</b> &nbsp; = X⁺ t (pseudo-inversa de Moore-Penrose)</p>
  <p>Se XᵀX não tem inversa (atributos que são combinações lineares de outros, ou menos exemplos do que parâmetros), usa-se a pseudo-inversa ou regularização.</p>
  <p>Exemplo: pontos (1, 1), (2, 3), (3, 4). X = [[1,1],[1,2],[1,3]]; XᵀX = [[3, 6],[6, 14]], Xᵀt = (8, 19). det = 42 − 36 = 6. w = (1/6)·[[14, −6],[−6, 3]]·(8, 19) = (−2/6, 9/6) → <b>y = −0,333 + 1,5x</b>.</p>
  <p>Medidas de erro no treino: MAE = (1/N) Σ |t − y|; MSE = (1/N) Σ (t − y)²; RMSE = √MSE.</p>`,
  key: 'w = (XᵀX)⁻¹Xᵀt. A matriz de design tem uma linha por exemplo e a coluna de 1s do bias.' },
{ id: 'lr-basis', t: 'linreg', title: 'Funções base: regressão “não linear” que continua linear',
  html: `<p>Truque: transforma primeiro cada entrada com funções fixas φ<sub>j</sub>(x) e faz regressão linear sobre elas: y(x, w) = Σ<sub>j</sub> w<sub>j</sub> φ<sub>j</sub>(x). O modelo é <b>linear nos pesos</b>, por isso a solução continua a ser w = (ΦᵀΦ)⁻¹Φᵀt, só que agora com a matriz de design Φ.</p>
  <ul><li>Polinomial: φ<sub>j</sub>(x) = x<sup>j</sup> → y = w₀ + w₁x + w₂x² + w₃x³.</li>
  <li>Gaussianas (RBF): φ<sub>j</sub>(x) = exp(−‖x − μ<sub>j</sub>‖² / (2s²)).</li>
  <li>Nos exames aparece primeiro uma função que transforma o vetor num número, por exemplo a norma: φ(x) = ‖x‖₂ ou ‖x‖<sub>∞</sub> = max |x<sub>i</sub>|.</li></ul>
  <p><b>Receita da matriz de design</b> (polinómio de grau 3): para cada exemplo calcula u = φ(x) e escreve a linha [1, u, u², u³].</p>
  <p>Exemplo: x = (0, −4) com a norma do máximo: u = max(0, 4) = 4 → linha <b>[1, 4, 16, 64]</b>. Com x = (3, 0) e norma euclidiana: u = 3 → [1, 3, 9, 27].</p>
  <p>Mais graus = mais flexibilidade, mas com poucos dados um polinómio de grau 9 passa por todos os pontos e oscila loucamente entre eles: <b>overfitting</b>. Mais dados reduzem o problema.</p>`,
  key: 'Linha da matriz de design = [1, φ(x), φ(x)², …]. Linear nos pesos → a mesma fórmula fechada.' },
{ id: 'lr-reg', t: 'linreg', title: 'Regularização: ridge, lasso e a visão Bayesiana',
  html: `<p>Pesos enormes são o sintoma do overfitting. A regularização castiga-os, juntando um termo ao erro:</p>
  <ul><li><b>Ridge</b> (l₂, Tikhonov): E(w) = ½ Σ (t − wᵀφ)² + (λ/2) ‖w‖². Solução fechada: <b>w = (λI + ΦᵀΦ)⁻¹ Φᵀ t</b>. Encolhe todos os pesos.</li>
  <li><b>Lasso</b> (l₁): + λ Σ |w<sub>j</sub>|. Põe muitos pesos exatamente a 0 (soluções esparsas, seleção de atributos). Não tem solução fechada.</li></ul>
  <p>λ grande → modelo simples (underfitting); λ = 0 → mínimos quadrados normais. Escolhe-se λ por validação.</p>
  <p><b>Visão Bayesiana</b>: se o ruído é gaussiano, maximizar a verosimilhança (ML) é o mesmo que minimizar a soma dos quadrados. Se, além disso, pusermos um <b>prior gaussiano</b> nos pesos (média 0), a solução <b>MAP</b> é exatamente a regressão ridge, com λ = (variância do ruído)/(variância do prior). O prior é a regularização.</p>`,
  key: 'Ridge: w = (λI + ΦᵀΦ)⁻¹Φᵀt = MAP com prior gaussiano. Lasso (l₁) põe pesos a zero.' },

/* ---------------- PERCEPTRON ---------------- */
{ id: 'p-rosen', t: 'percep', title: 'O perceptrão de Rosenblatt',
  html: `<p>Um neurónio artificial: soma pesada das entradas e um interruptor. net = Σ<sub>j</sub> w<sub>j</sub>x<sub>j</sub> = wᵀx (com x₀ = 1 para o bias), saída o = sgn(net) ∈ {−1, +1}.</p>
  <p>A fronteira wᵀx = 0 é uma reta em 2D, um <b>hiperplano</b> em D dimensões. O perceptrão só resolve problemas <b>linearmente separáveis</b>: o XOR não é (Minsky e Papert, 1969).</p>
  <p><b>Regra de aprendizagem</b> (para cada exemplo, por ordem):</p>
  <p style="text-align:center"><b>w ← w + η (t − o) x</b></p>
  <ul><li>Se acertou (t = o), nada muda.</li><li>Se errou, t − o = ±2: o hiperplano roda na direção certa.</li></ul>
  <p>Se os dados forem separáveis, o algoritmo <b>converge</b> num número finito de passos (teorema de convergência). Uma época = uma passagem por todos os exemplos; quando uma época inteira não muda nada, terminou.</p>
  <p>Exemplo: w = (w₀, w₁, w₂) = (−1, 1, 1), η = 0,1, x = (1, 7, 5) (com o 1 do bias), t = −1. net = −1 + 7 + 5 = 11 → o = +1. Errou: w ← w + 0,1·(−2)·(1, 7, 5) = <b>(−1,2; −0,4; 0)</b>.</p>`,
  key: 'Rosenblatt: w ← w + η(t − o)x, só muda quando erra. Só separa o que é linearmente separável.' },
{ id: 'p-gd', t: 'percep', title: 'Descida do gradiente e a regra delta',
  html: `<p>Num nevoeiro na montanha, para descer dás um passo na direção em que o chão desce mais. É a <b>descida do gradiente</b>:</p>
  <p style="text-align:center"><b>w ← w − η ∂E/∂w</b></p>
  <p>Com uma unidade <b>linear</b> (o = net = wᵀx) e E = ½ Σ (t<sub>k</sub> − o<sub>k</sub>)²: ∂E/∂w<sub>j</sub> = −Σ (t<sub>k</sub> − o<sub>k</sub>) x<sub>kj</sub>. Regra delta / LMS / Widrow-Hoff (ADALINE):</p>
  <p style="text-align:center"><b>Δw<sub>j</sub> = η Σ<sub>k</sub> (t<sub>k</sub> − o<sub>k</sub>) x<sub>kj</sub></b></p>
  <ul><li><b>Batch</b>: soma os gradientes de todos os exemplos e só depois atualiza.</li>
  <li><b>Estocástico</b> (SGD): atualiza depois de cada exemplo. Mais barato por passo e com ruído que ajuda a sair de mínimos locais.</li>
  <li>η demasiado grande → oscila ou diverge; demasiado pequeno → muito lento.</li></ul>
  <p><b>Receita para uma ativação qualquer</b> o = f(net): pela regra da cadeia, ∂E/∂w<sub>j</sub> = −Σ (t − o) · f'(net) · x<sub>j</sub>. Logo Δw<sub>j</sub> = η Σ (t − o) f'(net) x<sub>j</sub>.</p>
  <p>Exemplo de exame: o = exp((wᵀx)² + 1). f'(net) = exp(net² + 1)·2·net → Δw<sub>j</sub> = η Σ (t − o) · exp((wᵀx)² + 1) · 2(wᵀx) · x<sub>j</sub>. Com sigmoide: f' = σ(1 − σ).</p>`,
  key: 'Δw = −η ∂E/∂w. Para o = f(net) e erro quadrático: Δwⱼ = η Σ (t − o) f′(net) xⱼ.' },

/* ---------------- LOGISTIC REGRESSION ---------------- */
{ id: 'lg-sig', t: 'logreg', title: 'Regressão logística e entropia cruzada',
  html: `<p>Apesar do nome, é um <b>classificador</b>: um neurónio com ativação sigmoide σ(net) = 1/(1 + e<sup>−net</sup>), cuja saída é interpretada como p(C₁ | x). Decide-se pela classe 1 se σ(net) ≥ 0,5, ou seja se net ≥ 0: a fronteira continua a ser um hiperplano.</p>
  <p>Em vez do erro quadrático usa-se a <b>entropia cruzada</b> (cross-entropy), que vem da verosimilhança de Bernoulli:</p>
  <p style="text-align:center">E(w) = −Σ<sub>k</sub> [t<sub>k</sub> ln o<sub>k</sub> + (1 − t<sub>k</sub>) ln(1 − o<sub>k</sub>)]</p>
  <p>O gradiente fica limpíssimo (o σ' cancela-se): ∂E/∂w = −Σ (t<sub>k</sub> − o<sub>k</sub>) x<sub>k</sub>. A atualização (batch):</p>
  <p style="text-align:center"><b>w ← w + η Σ<sub>k</sub> (t<sub>k</sub> − σ(wᵀx<sub>k</sub>)) x<sub>k</sub></b></p>
  <p>Exemplo (Exame 1 2024/25): w = (1, 1, 1), η = 1, x₁ = (0, 0) t = 1; x₂ = (−1, −1) t = 0; x₃ = (1, 1) t = 0. Com o 1 do bias: net = 1, −1, 3 → σ = 0,731; 0,269; 0,953. w ← (1, 1, 1) + 0,269·(1, 0, 0) − 0,269·(1, −1, −1) − 0,953·(1, 1, 1) = <b>(0,047; 0,316; 0,316)</b>.</p>
  <p>Valores de σ úteis: σ(0) = 0,5; σ(1) = 0,731; σ(−1) = 0,269; σ(2) = 0,881; σ(3) = 0,953; σ(−x) = 1 − σ(x).</p>`,
  key: 'Logística + entropia cruzada: w ← w + η Σ (t − σ(wᵀx)) x. Decide 1 se wᵀx ≥ 0.' },
{ id: 'lg-soft', t: 'logreg', title: 'Softmax e entropia cruzada multiclasse',
  html: `<p>Com K classes há K saídas, uma por classe. A <b>softmax</b> transforma os net<sub>j</sub> em probabilidades que somam 1:</p>
  <p style="text-align:center"><b>o<sub>j</sub> = e<sup>net<sub>j</sub></sup> / Σ<sub>i</sub> e<sup>net<sub>i</sub></sup></b></p>
  <ul><li>Somar a mesma constante a todos os net não muda o resultado: na prática subtrai-se o máximo para evitar overflow (truque de estabilidade numérica).</li>
  <li>Alvo em <b>one-hot</b>: t = (0, 1, 0) para a classe 2.</li>
  <li>Entropia cruzada: E = −Σ<sub>j</sub> t<sub>j</sub> ln o<sub>j</sub> = −ln o<sub>classe certa</sub>.</li></ul>
  <p>O gradiente em relação aos net é simplesmente <b>∂E/∂net<sub>j</sub> = o<sub>j</sub> − t<sub>j</sub></b> (o delta Kronecker da derivada da softmax cancela-se com o log). É o mesmo resultado da sigmoide com entropia cruzada.</p>
  <p>Exemplo: net = (0, 0, 0) → o = (1/3, 1/3, 1/3); com t = (1, 0, 0): δ = o − t = (−2/3, 1/3, 1/3); E = −ln(1/3) = 1,099.</p>
  <p>Com K = 2, softmax é equivalente a uma sigmoide sobre a diferença dos net.</p>`,
  key: 'Softmax + entropia cruzada: δ = o − t. Loss = −ln(prob. da classe certa).' },

/* ---------------- MLP ---------------- */
{ id: 'm-fwd', t: 'mlp', title: 'Redes multicamada: forward propagation',
  html: `<p>Um perceptrão sozinho não faz o XOR. Empilhando camadas com ativações não lineares, a rede aprende fronteiras quaisquer. Notação das aulas (camada l, com x[0] = entrada):</p>
  <p style="text-align:center"><b>z[l] = W[l] x[l−1] + b[l]</b>, &nbsp; <b>x[l] = f(z[l])</b></p>
  <ul><li>W[l] tem uma <b>linha por neurónio</b> da camada l e uma coluna por entrada.</li>
  <li>Ativações: sigmoide, tanh (em [−1, 1], tanh' = 1 − tanh²), ReLU = max(0, x), softmax na saída para classificação.</li>
  <li>Contar parâmetros de uma camada com n<sub>in</sub> entradas e n<sub>out</sub> neurónios: n<sub>out</sub>·n<sub>in</sub> pesos + n<sub>out</sub> biases.</li></ul>
  <p>Exemplo: x[0] = (1, 0); W[1] = [[1, 1],[−1, 1]], b[1] = 0 → z[1] = (1, −1); com sigmoide x[1] = (0,731; 0,269). W[2] = [1, 1], b[2] = 0 → z[2] = 1,0; x[2] = σ(1) = <b>0,731</b>.</p>
  <p>Sem ativações não lineares, várias camadas colapsam numa só: W[2](W[1]x) = (W[2]W[1])x continua linear.</p>`,
  key: 'z[l] = W[l]x[l−1] + b[l], x[l] = f(z[l]). Uma linha de W por neurónio.' },
{ id: 'm-bp', t: 'mlp', title: 'Backpropagation: os deltas',
  html: `<p>Para saber quanto cada peso contribuiu para o erro, propaga-se o erro de trás para a frente com a regra da cadeia. Define-se <b>δ[l] = ∂E/∂z[l]</b>.</p>
  <ol><li><b>Saída</b>: δ[L] = ∂E/∂x[L] ⊙ f'(z[L]). Com erro quadrático E = ½Σ(x − t)²: δ[L] = (x[L] − t) ⊙ f'(z[L]). Com softmax (ou sigmoide) + entropia cruzada: <b>δ[L] = x[L] − t</b>.</li>
  <li><b>Camadas escondidas</b>: <b>δ[l] = (W[l+1]ᵀ δ[l+1]) ⊙ f'(z[l])</b>.</li>
  <li><b>Gradientes</b>: ∂E/∂W[l] = δ[l] · x[l−1]ᵀ (produto externo) e ∂E/∂b[l] = δ[l].</li>
  <li><b>Atualização</b>: W[l] ← W[l] − η δ[l] x[l−1]ᵀ; b[l] ← b[l] − η δ[l].</li></ol>
  <p>Derivadas: σ' = σ(1 − σ); tanh' = 1 − tanh²; ReLU' = 1 se z &gt; 0, senão 0.</p>
  <p>Exemplo (rede da lição anterior, t = 0, erro quadrático, η = 1): δ[2] = (0,731 − 0)·0,731·0,269 = <b>0,144</b>. ∂E/∂W[2] = 0,144·(0,731; 0,269) = (0,105; 0,039) → W[2] = (0,895; 0,961), b[2] = −0,144. δ[1] = W[2]ᵀ·0,144 ⊙ σ'(z[1]) = 0,144·(0,197; 0,197) = (0,028; 0,028).</p>
  <p>Atenção: os deltas das camadas escondidas usam os pesos <b>antigos</b> de W[l+1] (calcula todos os δ antes de atualizar).</p>`,
  key: 'δ[L] = x − t (softmax/sigmoide + CE). δ[l] = W[l+1]ᵀδ[l+1] ⊙ f′(z[l]). ∂E/∂W[l] = δ[l]x[l−1]ᵀ.' },
{ id: 'm-univ', t: 'mlp', title: 'MLPs como máquinas universais',
  html: `<p><b>Booleanas</b>: qualquer função booleana escreve-se em <b>forma normal disjuntiva</b> (DNF): um OU de ANDs. Cada AND (um mintermo) é um perceptrão com limiar adequado; o OU final é outro perceptrão. Logo um MLP com <b>uma única camada escondida</b> representa qualquer função booleana (mas pode precisar de um número exponencial de neurónios, por exemplo a paridade).</p>
  <p>Exemplo XOR: h₁ = AND(x₁, ¬x₂), h₂ = AND(¬x₁, x₂), saída = OR(h₁, h₂).</p>
  <p><b>Classificação</b>: com 2 camadas escondidas (e uma basta, com neurónios suficientes) aproximam-se regiões de decisão arbitrárias. <b>Funções contínuas</b>: teorema da aproximação universal — uma camada escondida com neurónios suficientes aproxima qualquer função contínua com a precisão que se queira.</p>
  <p>Representar não é aprender: o teorema não diz quantos neurónios são precisos nem garante que o gradiente os encontra. Redes <b>profundas</b> representam muitas funções com exponencialmente menos neurónios do que redes largas e rasas.</p>
  <p><b>Complexidade e overfitting</b>: a dimensão VC de uma rede cresce com o número de parâmetros livres. Mais parâmetros = mais capacidade = mais risco de overfitting com poucos dados.</p>`,
  key: 'DNF → uma camada escondida chega para qualquer função booleana. Mais parâmetros = mais risco de overfitting.' },
]);
