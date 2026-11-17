/* ===== ML lessons, part 2: linear regression, perceptron, logistic regression, MLP (lectures 6–9) ===== */
STUDY.lessons('ml', [
/* ---------------- LINEAR REGRESSION ---------------- */
{ id: 'lr-ls', t: 'linreg', title: 'Regressão linear e mínimos quadrados',
  html: `<p>Traçar a reta que passa “o mais perto possível” de uma nuvem de pontos. O modelo é y(x, w) = w₀ + w₁x₁ + … + w<sub>D</sub>x<sub>D</sub> = wᵀx, com x₀ = 1 para o bias w₀.</p>
  <p>“O mais perto possível” = minimizar a <b>soma dos quadrados dos erros</b>: E(w) = ½ Σ<sub>k</sub> (t<sub>k</sub> − wᵀx<sub>k</sub>)² (o MSE é a mesma coisa a dividir por N).</p>
  <!--card--><p>Junta os exemplos numa <b>matriz de design</b> Φ (uma linha por exemplo, a primeira coluna toda a 1) e os alvos num vetor t. Igualando o gradiente a zero, obtém-se a solução fechada:</p>
  <p style="text-align:center"><b>{f:ls|w = (ΦᵀΦ)⁻¹ Φᵀ t}</b> &nbsp; = Φ<sup>†</sup> t (Φ<sup>†</sup>: pseudo-inversa de Moore-Penrose)</p>
  <p>Sem funções base, cada linha de Φ é só [1, x₁, x₂, …], e os slides chamam-lhe X: w = (XᵀX)⁻¹Xᵀt, a mesma fórmula. Com funções base (lição seguinte), cada linha é [1, φ(x), φ(x)², …].</p>
  <p>Se ΦᵀΦ não tem inversa (atributos que são combinações lineares de outros, ou menos exemplos do que parâmetros), usa-se a pseudo-inversa ou regularização.</p>
  <!--card--><p><b>Exemplo</b>: ajustar y = w₀ + w₁x aos pontos (1, 1), (2, 3), (3, 4).</p>
  <ol><li><b>Matriz de design</b> (uma linha [1, x] por ponto) e alvos: Φ = [[1, 1], [1, 2], [1, 3]], t = (1, 3, 4).</li>
  <li><b>ΦᵀΦ</b> = [[3, 6], [6, 14]] (3 pontos, Σx = 6, Σx² = 14). <b>Φᵀt</b> = (Σt, Σxt) = (8, 19).</li>
  <li><b>Inversa 2 × 2</b>: det = 3·14 − 6·6 = 6; (ΦᵀΦ)⁻¹ = (1/6)·[[14, −6], [−6, 3]].</li>
  <li><b>w</b> = (1/6)·(14·8 − 6·19, −6·8 + 3·19) = (1/6)·(−2, 9) = (−0,333; 1,5).</li></ol>
  <p>Reta: <b>y = −0,333 + 1,5x</b>.</p>
  <p>Medidas de erro no treino: MAE = (1/N) Σ |t − y|; {f:mse|MSE = (1/N) Σ (t − y)²}; RMSE = √MSE.</p>`,
  key: 'w = (ΦᵀΦ)⁻¹Φᵀt. A matriz de design Φ tem uma linha por exemplo e a coluna de 1s do bias (sem funções base, os slides chamam-lhe X).' },
{ id: 'lr-basis', t: 'linreg', title: 'Funções base: regressão “não linear” que continua linear',
  html: `<p>Truque: transforma primeiro cada entrada com funções fixas φ<sub>j</sub>(x) e faz regressão linear sobre elas: y(x, w) = Σ<sub>j</sub> w<sub>j</sub> φ<sub>j</sub>(x). O modelo é <b>linear nos pesos</b>, por isso a solução continua a ser w = (ΦᵀΦ)⁻¹Φᵀt, só que agora com a matriz de design Φ.</p>
  <ul><li>Polinomial: φ<sub>j</sub>(x) = x<sup>j</sup> → y = w₀ + w₁x + w₂x² + w₃x³.</li>
  <li>Gaussianas (RBF): φ<sub>j</sub>(x) = exp(−‖x − μ<sub>j</sub>‖² / (2s²)).</li>
  <li>Nos exames aparece primeiro uma função que transforma o vetor x num número, quase sempre uma <b>norma</b>. Para x = (3, −4):
  <ul><li>‖x‖₁ = soma dos valores absolutos: |3| + |−4| = <b>7</b>.</li>
  <li>‖x‖₂ = o comprimento do vetor: √(3² + (−4)²) = √25 = <b>5</b>.</li>
  <li>‖x‖<sub>∞</sub> = o maior valor absoluto: max(|3|, |−4|) = <b>4</b>.</li></ul></li></ul>
  <!--card--><p><b>Receita da matriz de design</b> (polinómio de grau 3): para cada exemplo calcula u = φ(x) e escreve a linha [1, u, u², u³].</p>
  <p><b>Exemplo</b>: pontos x₁ = (0, −4) e x₂ = (3, 0), φ(x) = ‖x‖<sub>∞</sub> (o maior valor absoluto) e polinómio de grau 3.</p>
  <ol><li>u₁ = max(|0|, |−4|) = 4 → linha [1, 4, 4², 4³] = <b>[1, 4, 16, 64]</b>.</li>
  <li>u₂ = max(|3|, |0|) = 3 → linha [1, 3, 9, 27].</li></ol>
  <p>Φ = [[1, 4, 16, 64], [1, 3, 9, 27]], e os pesos saem de w = (ΦᵀΦ)⁻¹Φᵀt como antes.</p>
  <p>Mais graus = mais flexibilidade, mas com poucos dados um polinómio de grau 9 passa por todos os pontos e oscila loucamente entre eles: <b>overfitting</b>. Mais dados reduzem o problema.</p>`,
  key: 'Linha da matriz de design = [1, φ(x), φ(x)², …]. Linear nos pesos → a mesma fórmula fechada.' },
{ id: 'lr-reg', t: 'linreg', title: 'Regularização: ridge, lasso e a visão Bayesiana',
  html: `<p>Pesos enormes são o sintoma do overfitting. A regularização castiga-os, juntando um termo ao erro:</p>
  <ul><li><b>Ridge</b> (l₂, Tikhonov): E(w) = ½ Σ (t − wᵀφ)² + (λ/2) ‖w‖₂². Solução fechada: <b>{f:ridge|w = (ΦᵀΦ + λI)⁻¹ Φᵀ t}</b>. Encolhe todos os pesos.</li>
  <li><b>Lasso</b> (l₁): E(w) = ½ Σ (t − wᵀφ)² + (λ/2) ‖w‖₁, com ‖w‖₁ = Σ |w<sub>j</sub>|. Põe muitos pesos exatamente a 0 (soluções esparsas, seleção de atributos). Não tem solução fechada.</li></ul>
  <!--card--><p>λ grande → modelo simples (underfitting); λ = 0 → mínimos quadrados normais. Escolhe-se λ por validação.</p>
  <p><b>Exemplo</b>: modelo y = wx sem bias, pontos (1, 2) e (2, 4). Com um só peso, o ridge fica w = Σxt/(λ + Σx²), com Σxt = 1·2 + 2·4 = 10 e Σx² = 1 + 4 = 5. Sem regularização (λ = 0): w = 10/5 = 2. Com λ = 1: w = 10/6 ≈ 1,67. O λ encolhe o peso.</p>
  <p><b>Visão Bayesiana</b>: se o ruído é gaussiano, maximizar a verosimilhança (ML) é o mesmo que minimizar a soma dos quadrados. Se, além disso, pusermos um <b>prior gaussiano</b> nos pesos (média 0), a solução <b>MAP</b> é exatamente a regressão ridge, com λ = σ² / σ<sub>w</sub>² (variância do ruído sobre a variância do prior). O prior é a regularização. Com um prior laplaciano nos pesos, o MAP dá o lasso.</p>`,
  key: 'Ridge: w = (ΦᵀΦ + λI)⁻¹Φᵀt = MAP com prior gaussiano. Lasso (l₁) põe pesos a zero.' },

/* ---------------- PERCEPTRON ---------------- */
{ id: 'p-rosen', t: 'percep', title: 'O perceptrão de Rosenblatt',
  html: `<p>Um neurónio artificial: soma pesada das entradas e um interruptor. net = Σ<sub>j</sub> w<sub>j</sub>x<sub>j</sub> = wᵀx (com x₀ = 1 para o bias), saída o = sgn(net) ∈ {−1, +1}.</p>
  <p>A fronteira wᵀx = 0 é uma reta em 2D, um <b>hiperplano</b> em D dimensões. O perceptrão só resolve problemas <b>linearmente separáveis</b>: o XOR não é (Minsky e Papert, 1969).</p>
  <p><b>Regra de aprendizagem</b> (para cada exemplo, por ordem):</p>
  <p style="text-align:center"><b>{f:rosen|w ← w + η (t − o) x}</b></p>
  <ul><li>Se acertou (t = o), nada muda.</li><li>Se errou, t − o = ±2: o hiperplano roda na direção certa.</li></ul>
  <!--card--><p>Se os dados forem separáveis, o algoritmo <b>converge</b> num número finito de passos (teorema de convergência). Uma época = uma passagem por todos os exemplos; quando uma época inteira não muda nada, terminou.</p>
  <p><b>Exemplo</b>: w = (w₀, w₁, w₂) = (−1, 1, 1), η = 0,1; um exemplo x = (7, 5) da classe t = −1.</p>
  <ol><li><b>Juntar o 1 do bias</b>: x = (1, 7, 5).</li>
  <li><b>Saída</b>: net = −1·1 + 1·7 + 1·5 = 11 &gt; 0 → o = +1.</li>
  <li><b>Errou?</b> o = +1 mas t = −1: sim, t − o = −2.</li>
  <li><b>Atualizar</b>: w ← (−1, 1, 1) + 0,1·(−2)·(1, 7, 5) = (−1, 1, 1) − (0,2; 1,4; 1) = <b>(−1,2; −0,4; 0)</b>.</li></ol>`,
  key: 'Rosenblatt: w ← w + η(t − o)x, só muda quando erra. Só separa o que é linearmente separável.' },
{ id: 'p-gd', t: 'percep', title: 'Descida do gradiente e a regra delta',
  html: `<p>Num nevoeiro na montanha, para descer dás um passo na direção em que o chão desce mais. É a <b>descida do gradiente</b>:</p>
  <p style="text-align:center"><b>w<sup>new</sup> = w<sup>old</sup> + Δw</b>, &nbsp; com &nbsp; <b>{f:gd|Δw = −η ∇E(w)}</b></p>
  <p>Com uma unidade <b>linear</b> (o<sub>k</sub> = net<sub>k</sub> = Σ<sub>j</sub> w<sub>j</sub> x<sub>k,j</sub>) e E(w) = ½ Σ<sub>k</sub> (t<sub>k</sub> − o<sub>k</sub>)²: ∂E/∂w<sub>j</sub> = −Σ (t<sub>k</sub> − o<sub>k</sub>) x<sub>k,j</sub>, onde x<sub>k,j</sub> é o atributo j do exemplo k. Regra delta / LMS / Widrow-Hoff (ADALINE):</p>
  <p style="text-align:center"><b>Δw<sub>j</sub> = η Σ<sub>k</sub> (t<sub>k</sub> − o<sub>k</sub>) x<sub>k,j</sub></b></p>
  <ul><li><b>Batch</b>: soma os gradientes de todos os exemplos e só depois atualiza.</li>
  <li><b>Estocástico</b> (SGD): atualiza depois de cada exemplo. Mais barato por passo e com ruído que ajuda a sair de mínimos locais.</li>
  <li>η demasiado grande → oscila ou diverge; demasiado pequeno → muito lento.</li></ul>
  <p><b>Exemplo</b> (unidade linear, um exemplo): w = (0, 1), η = 0,1, x = (1, 2), t = 3. Saída o = 0·1 + 1·2 = 2; erro t − o = 1; Δw = 0,1·1·(1, 2) = (0,1; 0,2); novos pesos w = (0,1; 1,2).</p>
  <!--card--><p><b>Receita para uma ativação qualquer</b> o = f(net) (nos slides, φ(net)): pela regra da cadeia, ∂E/∂w<sub>j</sub> = −Σ (t − o) · f'(net) · x<sub>j</sub>. Logo Δw<sub>j</sub> = η Σ (t − o) f'(net) x<sub>j</sub>.</p>
  <p><b>Exemplo de exame</b>: o = exp((wᵀx)² + 1), com erro quadrático.</p>
  <ol><li><b>Escrever como o = f(net)</b>, com net = wᵀx: f(net) = exp(net² + 1).</li>
  <li><b>Derivar com a regra da cadeia</b>: a derivada de exp(g) é exp(g)·g′, e g = net² + 1 tem g′ = 2·net. Logo f′(net) = exp(net² + 1)·2·net.</li>
  <li><b>Substituir na receita</b>: Δw<sub>j</sub> = η Σ (t − o) · exp((wᵀx)² + 1) · 2(wᵀx) · x<sub>j</sub>.</li></ol>
  <p>Com sigmoide é igual, com f′ = σ(1 − σ) = o(1 − o).</p>`,
  key: 'Δw = −η ∂E/∂w. Para o = f(net) e erro quadrático: Δwⱼ = η Σ (t − o) f′(net) xⱼ.' },

/* ---------------- LOGISTIC REGRESSION ---------------- */
{ id: 'lg-sig', t: 'logreg', title: 'Regressão logística e entropia cruzada',
  html: `<p>Apesar do nome, é um <b>classificador</b>: um neurónio com ativação sigmoide {f:sig|σ(net) = 1/(1 + e<sup>−net</sup>)}, cuja saída é interpretada como p(C₁ | x). Decide-se pela classe 1 se σ(net) ≥ 0,5, ou seja se net ≥ 0: a fronteira continua a ser um hiperplano.</p>
  <p>Em vez do erro quadrático usa-se a <b>entropia cruzada</b> (cross-entropy), que vem da verosimilhança de Bernoulli:</p>
  <p style="text-align:center">E(w) = −log p(t | w) = −Σ<sub>k</sub> [t<sub>k</sub> log o<sub>k</sub> + (1 − t<sub>k</sub>) log(1 − o<sub>k</sub>)]</p>
  <p>Aqui log é o logaritmo natural (ln), com o<sub>k</sub> = p(C₁ | x<sub>k</sub>) = σ(net<sub>k</sub>).</p>
  <!--card--><p>O gradiente fica limpíssimo (o σ' cancela-se): ∂E/∂w = −Σ (t<sub>k</sub> − o<sub>k</sub>) x<sub>k</sub>. A atualização (batch):</p>
  <p style="text-align:center"><b>w ← w + η Σ<sub>k</sub> (t<sub>k</sub> − σ(wᵀx<sub>k</sub>)) x<sub>k</sub></b></p>
  <p><b>Exemplo</b> (Exame 1 2024/25): w = (1, 1, 1) com o bias primeiro, η = 1; x₁ = (0, 0) com t = 1, x₂ = (−1, −1) com t = 0, x₃ = (1, 1) com t = 0.</p>
  <ol><li><b>Juntar o bias</b>: (1, 0, 0), (1, −1, −1), (1, 1, 1).</li>
  <li><b>net = wᵀx</b>: 1, −1 e 3 → <b>σ</b>: 0,731; 0,269; 0,953.</li>
  <li><b>Erros t − σ</b>: 0,269; −0,269; −0,953.</li>
  <li><b>Somar (t − σ)·x</b>: 0,269·(1, 0, 0) − 0,269·(1, −1, −1) − 0,953·(1, 1, 1) = (−0,953; −0,684; −0,684).</li>
  <li><b>Novos pesos</b>: (1, 1, 1) + (−0,953; −0,684; −0,684) = <b>(0,047; 0,316; 0,316)</b>.</li></ol>
  <p>Valores de σ úteis: σ(0) = 0,5; σ(1) = 0,731; σ(−1) = 0,269; σ(2) = 0,881; σ(3) = 0,953; σ(−x) = 1 − σ(x).</p>`,
  key: 'Logística + entropia cruzada: w ← w + η Σ (t − σ(wᵀx)) x. Decide 1 se wᵀx ≥ 0.' },
{ id: 'lg-soft', t: 'logreg', title: 'Softmax e entropia cruzada multiclasse',
  html: `<p>Com K classes há K saídas, uma por classe. A <b>softmax</b> transforma os net<sub>j</sub> em probabilidades que somam 1:</p>
  <p style="text-align:center"><b>o<sub>j</sub> = e<sup>net<sub>j</sub></sup> / Σ<sub>i</sub> e<sup>net<sub>i</sub></sup></b></p>
  <ul><li>Somar a mesma constante a todos os net não muda o resultado: na prática subtrai-se o máximo para evitar overflow (truque de estabilidade numérica).</li>
  <li>Alvo em <b>one-hot</b>: t = (0, 1, 0) para a classe 2.</li>
  <li>Entropia cruzada: E = −Σ<sub>j</sub> t<sub>j</sub> log o<sub>j</sub> = −log o<sub>classe certa</sub> (log natural).</li>
  <li>Nos slides: a softmax escreve-se σ(net)<sub>s</sub> = exp(net<sub>s</sub>) / Σ<sub>t</sub> exp(net<sub>t</sub>), o alvo do exemplo k na classe t é <b>y<sub>kt</sub></b> (t já é índice de classe) e E(w) = −Σ<sub>k</sub> Σ<sub>t</sub> y<sub>kt</sub> log o<sub>kt</sub>.</li></ul>
  <!--card--><p>O gradiente em relação aos net é simplesmente <b>∂E/∂net<sub>j</sub> = o<sub>j</sub> − t<sub>j</sub></b> (a derivada da softmax é ∂o<sub>s</sub>/∂net<sub>t</sub> = o<sub>s</sub>(I<sub>st</sub> − o<sub>t</sub>), com o delta de Kronecker I<sub>st</sub> = 1 se s = t e 0 senão, e cancela-se com o log). É o mesmo resultado da sigmoide com entropia cruzada.</p>
  <p><b>Exemplo</b>: 3 classes, net = (0, 0, 0) e a classe certa é a 1.ª, t = (1, 0, 0).</p>
  <ol><li><b>Softmax</b>: e⁰ = 1 para as três → o = (1/3, 1/3, 1/3).</li>
  <li><b>Erro</b>: E = −log o₁ = −ln(1/3) ≈ 1,099.</li>
  <li><b>Delta</b>: δ = o − t = (1/3 − 1, 1/3, 1/3) = (−2/3, 1/3, 1/3).</li></ol>
  <p>Num passo de descida, a net da classe certa sobe (o seu δ é negativo) e as das outras descem.</p>
  <p>Com K = 2, softmax é equivalente a uma sigmoide sobre a diferença dos net.</p>`,
  key: 'Softmax + entropia cruzada: δ = o − t. Loss = −ln(prob. da classe certa).' },

/* ---------------- MLP ---------------- */
{ id: 'm-fwd', t: 'mlp', title: 'Redes multicamada: forward propagation',
  html: `<p>Um perceptrão sozinho não faz o XOR. Empilhando camadas com ativações não lineares, a rede aprende fronteiras quaisquer. Notação dos exames e das resoluções (camada l, com x[0] = entrada):</p>
  <p style="text-align:center"><b>{f:fwd|z[l] = W[l] x[l−1] + b[l]}</b>, &nbsp; <b>{f:fwd|x[l] = f(z[l])}</b></p>
  <ul><li>W[l] tem uma <b>linha por neurónio</b> da camada l e uma coluna por entrada.</li>
  <li>Ativações: sigmoide, tanh (em [−1, 1], tanh' = 1 − tanh²), ReLU = max(0, x), softmax na saída para classificação.</li>
  <li>Contar parâmetros de uma camada com n<sub>in</sub> entradas e n<sub>out</sub> neurónios: n<sub>out</sub>·n<sub>in</sub> pesos + n<sub>out</sub> biases.</li></ul>
  <!--card--><p><b>Exemplo</b>: entrada x[0] = (1, 0); camada 1 com W[1] = [[1, 1], [−1, 1]], b[1] = 0 e sigmoide; saída com W[2] = [1, 1], b[2] = 0 e sigmoide.</p>
  <ol><li><b>z[1] = W[1]x[0] + b[1]</b>: cada linha de W[1] é um neurónio → (1·1 + 1·0, −1·1 + 1·0) = (1, −1).</li>
  <li><b>x[1] = σ(z[1])</b> = (σ(1), σ(−1)) = (0,731; 0,269).</li>
  <li><b>z[2] = W[2]x[1] + b[2]</b> = 0,731 + 0,269 = 1.</li>
  <li><b>x[2] = σ(1)</b> = <b>0,731</b>.</li></ol>
  <p>Sem ativações não lineares, várias camadas colapsam numa só: W[2](W[1]x) = (W[2]W[1])x continua linear.</p>`,
  key: 'z[l] = W[l]x[l−1] + b[l], x[l] = f(z[l]). Uma linha de W por neurónio.' },
{ id: 'm-bp', t: 'mlp', title: 'Backpropagation: os deltas',
  html: `<p>Para saber quanto cada peso contribuiu para o erro, propaga-se o erro de trás para a frente com a regra da cadeia. Define-se <b>δ[l] = ∂E/∂z[l]</b>.</p>
  <ol><li><b>Saída</b>: δ[L] = ∂E/∂x[L] ⊙ f'(z[L]). Com erro quadrático E = ½Σ(x − t)²: δ[L] = (x[L] − t) ⊙ f'(z[L]). Com softmax (ou sigmoide) + entropia cruzada: <b>{f:dout|δ[L] = x[L] − t}</b>.</li>
  <li><b>Camadas escondidas</b>: <b>{f:dhid|δ[l] = (W[l+1]ᵀ δ[l+1]) ⊙ f'(z[l])}</b>.</li>
  <li><b>Gradientes</b>: ∂E/∂W[l] = δ[l] · x[l−1]ᵀ (produto externo) e ∂E/∂b[l] = δ[l].</li>
  <li><b>Atualização</b>: W[l] ← W[l] − η δ[l] x[l−1]ᵀ; b[l] ← b[l] − η δ[l].</li></ol>
  <!--card--><p>Derivadas: σ' = σ(1 − σ); tanh' = 1 − tanh²; ReLU' = 1 se z &gt; 0, senão 0.</p>
  <p><b>Exemplo</b> (a rede da lição anterior: x[0] = (1, 0), x[1] = (0,731; 0,269), x[2] = 0,731; alvo t = 0, erro quadrático, η = 1):</p>
  <ol><li><b>Delta da saída</b>: δ[2] = (x[2] − t)·σ′(z[2]) = (0,731 − 0)·0,731·0,269 = <b>0,144</b>.</li>
  <li><b>Gradiente de W[2]</b>: δ[2]·x[1]ᵀ = 0,144·(0,731; 0,269) = (0,105; 0,039).</li>
  <li><b>Delta escondido</b>, com o W[2] antigo = [1, 1]: W[2]ᵀδ[2] = (0,144; 0,144); σ′(z[1]) = (0,731·0,269; 0,269·0,731) = (0,197; 0,197); δ[1] = (0,028; 0,028).</li>
  <li><b>Atualizar</b>: W[2] = (1, 1) − (0,105; 0,039) = (0,895; 0,961); b[2] = 0 − 0,144 = −0,144. Em W[1] ← W[1] − δ[1]x[0]ᵀ, como x[0] = (1, 0), só a 1.ª coluna muda: 1 − 0,028 = 0,972 e −1 − 0,028 = −1,028.</li></ol>
  <p>Atenção: os deltas das camadas escondidas usam os pesos <b>antigos</b> de W[l+1] (calcula todos os δ antes de atualizar).</p>
  <!--card--><p><b>Notação dos slides</b> (aula 9), para uma camada escondida: entrada x<sub>k,j</sub>, unidades escondidas V<sub>k,i</sub> = φ(Σ<sub>j</sub> W<sub>ij</sub> x<sub>k,j</sub>), saídas o<sub>kt</sub> = φ(Σ<sub>i</sub> w<sub>ti</sub> V<sub>k,i</sub>), alvos y<sub>kt</sub>. O delta tem o <b>sinal trocado</b> e soma-se na atualização:</p>
  <ul><li>Saída (softmax + entropia cruzada): δ<sub>kt</sub> = y<sub>kt</sub> − o<sub>kt</sub>, e Δw<sub>ti</sub> = η Σ<sub>k</sub> δ<sub>kt</sub> V<sub>k,i</sub>.</li>
  <li>Escondida: δ<sub>ki</sub> = φ'(net<sub>k,i</sub>) Σ<sub>t</sub> δ<sub>kt</sub> w<sub>t,i</sub>, e ΔW<sub>ij</sub> = η Σ<sub>k</sub> δ<sub>ki</sub> x<sub>k,j</sub>.</li></ul>
  <p>É a mesma conta da notação dos exames: δ<sub>slides</sub> = −δ[l] e W ← W + ηδ<sub>slides</sub>xᵀ dá o mesmo que W ← W − ηδ[l]xᵀ. Usa a notação do enunciado e mantém o sinal coerente até ao fim.</p>`,
  key: 'δ[L] = x − t (softmax/sigmoide + CE). δ[l] = W[l+1]ᵀδ[l+1] ⊙ f′(z[l]). ∂E/∂W[l] = δ[l]x[l−1]ᵀ.' },
{ id: 'm-univ', t: 'mlp', title: 'MLPs como máquinas universais',
  html: `<p><b>Booleanas</b>: qualquer função booleana escreve-se em <b>forma normal disjuntiva</b> (DNF): um OU de ANDs. Cada AND (um mintermo) é um perceptrão com limiar adequado; o OU final é outro perceptrão. Logo um MLP com <b>uma única camada escondida</b> representa qualquer função booleana (mas pode precisar de um número exponencial de neurónios, por exemplo a paridade).</p>
  <!--card--><p><b>Exemplo XOR</b>, com perceptrões de degrau (saída 1 se net ≥ 0) e pesos na ordem (bias, w₁, w₂):</p>
  <ul><li>h₁ = x₁ AND NOT x₂: pesos (−0,5; 1; −1). Só (1, 0) dá net = 0,5 ≥ 0.</li>
  <li>h₂ = NOT x₁ AND x₂: pesos (−0,5; −1; 1). Só (0, 1) dá net ≥ 0.</li>
  <li>saída = h₁ OR h₂: pesos (−0,5; 1; 1). Basta um dos h estar a 1.</li></ul>
  <p>Verificação: (1, 1) → h₁ = −0,5 + 1 − 1 &lt; 0 → 0; h₂ → 0; saída 0. (1, 0) → h₁ = 1 → saída 1.</p>
  <p><b>Classificação</b>: com 2 camadas escondidas (e uma basta, com neurónios suficientes) aproximam-se regiões de decisão arbitrárias. <b>Funções contínuas</b>: teorema da aproximação universal — uma camada escondida com neurónios suficientes aproxima qualquer função contínua com a precisão que se queira.</p>
  <!--card--><p>Representar não é aprender: o teorema não diz quantos neurónios são precisos nem garante que o gradiente os encontra. Redes <b>profundas</b> representam muitas funções com exponencialmente menos neurónios do que redes largas e rasas.</p>
  <p><b>Complexidade e overfitting</b>: a dimensão VC de uma rede cresce com o número de parâmetros livres. Mais parâmetros = mais capacidade = mais risco de overfitting com poucos dados.</p>`,
  key: 'DNF → uma camada escondida chega para qualquer função booleana. Mais parâmetros = mais risco de overfitting.' },
]);
