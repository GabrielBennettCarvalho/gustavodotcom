/* ===== ML lessons, part 1: data, decision trees, evaluation, Bayes, kNN (lectures 1–5) =====
   Each card: analogy → theory → worked example → key line. */
STUDY.lessons('ml', [
/* ---------------- DATA ---------------- */
{ id: 'd-stats', t: 'data', title: 'Média, mediana, moda e variância',
  html: `<p>Antes de treinar seja o que for, olha para os dados. Para uma variável com N valores:</p>
  <ul><li><b>Média</b> x̄ = (1/N) Σ x<sub>i</sub>. Sensível a outliers.</li>
  <li><b>Mediana</b>: o valor do meio dos dados ordenados (com N par, a média dos dois do meio). Robusta a outliers.</li>
  <li><b>Moda</b>: o valor mais frequente. Com valores reais quase não diz nada, a não ser que os agrupes em <i>bins</i> (histograma).</li>
  <li><b>Amplitude</b> (range) = máximo − mínimo: uma medida grosseira da dispersão.</li></ul>
  <p><b>Variância da população</b>: σ² = (1/N) Σ (x<sub>i</sub> − x̄)². <b>Variância amostral</b>: s² = (1/(N−1)) Σ (x<sub>i</sub> − x̄)². O N−1 é a <b>correção de Bessel</b>: como só vemos uma amostra, dividir por N subestimaria a variância real. Em ML nunca temos a população inteira, por isso usamos sempre a amostral. O desvio padrão é a raiz quadrada da variância.</p>
  <p>Exemplo: 2, 4, 4, 4, 5, 5, 7, 9. Média = 40/8 = <b>5</b>. Σ (x − 5)² = 9+1+1+1+0+0+4+16 = 32. Variância populacional = 32/8 = 4; amostral = 32/7 ≈ <b>4,57</b> (s ≈ 2,14). Mediana = (4+5)/2 = 4,5; moda = 4.</p>`,
  key: 'Amostra → divide por N−1 (Bessel). Mediana e média aparada resistem a outliers; a média não.' },
{ id: 'd-spread', t: 'data', title: 'Quartis, outliers e a curva normal',
  html: `<p>Ordena os dados e corta-os em quatro partes iguais: Q1, Q2 (= mediana) e Q3. O <b>intervalo interquartil</b> IQR = Q3 − Q1 mede a dispersão da metade central, sem ser afetado pelos extremos.</p>
  <p><b>Outliers</b> (regra de Tukey): valores fora de [Q1 − 1,5·IQR, Q3 + 1,5·IQR]. Também se usa a <b>média aparada</b>: tira uma fração dos valores mais altos e mais baixos e faz a média do resto.</p>
  <p><b>Assimetria</b> (skew): se a cauda está à direita (o grosso dos dados à esquerda), a distribuição é <i>right-skewed</i> ou positivamente assimétrica, e a média fica à direita da mediana. Cauda à esquerda = negativamente assimétrica.</p>
  <p><b>Distribuição normal</b> N(μ, σ²): μ diz onde está o centro, σ a largura (σ maior = curva mais achatada). Regra 68–95–99,7: entre μ ± σ ficam ~68% dos valores, entre μ ± 2σ ~95%, entre μ ± 3σ ~99,7%. A densidade (PDF) pode ser maior do que 1 (σ pequeno): a probabilidade é a <i>área</i> debaixo da curva, não a altura.</p>
  <p>Exemplo: 48, 52, 57, 64, 72, 76, 77, 81, 85, 88 (N = 10). Q2 = (72+76)/2 = 74; Q1 = 57, Q3 = 81 (medianas de cada metade); IQR = 24; outliers seriam valores &lt; 21 ou &gt; 117.</p>`,
  key: 'IQR = Q3 − Q1; outlier fora de [Q1 − 1,5·IQR, Q3 + 1,5·IQR]. Normal: 68 / 95 / 99,7% a 1, 2, 3 σ.' },
{ id: 'd-corr', t: 'data', title: 'Covariância e correlação (Pearson e Spearman)',
  html: `<p>Com duas variáveis, a primeira pergunta é: andam juntas? Se duas variáveis estão muito correlacionadas, uma delas é redundante (fica-se com a de maior variabilidade).</p>
  <p><b>Covariância amostral</b>: cov(X, Y) = (1/(N−1)) Σ (x<sub>i</sub> − x̄)(y<sub>i</sub> − ȳ). Positiva: quando X sobe, Y tende a subir. Mas o valor depende das unidades.</p>
  <p><b>Correlação de Pearson</b>: r = cov(X, Y) / (s<sub>X</sub> s<sub>Y</sub>), sempre em [−1, 1]. O sinal diz o sentido da relação; o valor absoluto a força (≈ |r| &gt; 0,75 forte, &lt; 0,25 fraca). r = 0 quer dizer <b>sem relação linear</b> (pode haver uma relação não linear). Correlação não implica causalidade.</p>
  <p><b>Spearman</b>: substitui cada valor pela sua <i>ordem</i> (rank) e calcula Pearson sobre as ordens. Mede relações <b>monótonas</b>, não só lineares, e é robusta a outliers. Serve também para variáveis ordinais.</p>
  <p>Exemplo: X = (1, 2, 3), Y = (2, 4, 6). x̄ = 2, ȳ = 4; cov = [(−1)(−2) + 0 + (1)(2)]/2 = 2; s<sub>X</sub> = 1, s<sub>Y</sub> = 2; r = 2/(1·2) = <b>1</b> (relação linear perfeita).</p>`,
  key: 'Pearson = covariância normalizada, em [−1, 1], só vê relações lineares. Spearman = Pearson sobre as ordens (monótonas).' },
{ id: 'd-prep', t: 'data', title: 'Tipos de variáveis e preparação dos dados',
  html: `<p>Os dados reais vêm “sujos”: incompletos (valores em falta), com ruído (erros, outliers) e inconsistentes (códigos diferentes para a mesma coisa).</p>
  <ul><li><b>Categóricas</b> (qualitativas): <b>nominais</b> (cor dos olhos, nomes; sem ordem) ou <b>ordinais</b> (baixo &lt; médio &lt; alto). Binárias = 2 categorias. Cardinalidade = número de categorias.</li>
  <li><b>Numéricas</b> (quantitativas): <b>discretas</b> (inteiros) ou <b>contínuas</b> (reais).</li></ul>
  <p>Transformações típicas:</p>
  <ul><li><b>Normalização min-max</b> para [a, b]: v' = (v − min)/(max − min)·(b − a) + a.</li>
  <li><b>Z-score</b>: v' = (v − μ)/σ (média 0, desvio padrão 1).</li>
  <li><b>Discretização</b>: idade em 0–10, 11–20… (necessária para árvores ID3).</li>
  <li><b>Agregação</b> de categorias com cardinalidade alta; <b>imputação</b> de valores em falta (por exemplo com a média).</li></ul>
  <p>Nos métodos baseados em distâncias (kNN, k-means) a normalização é essencial: sem ela, um atributo com gama grande (rendimento em euros) abafa os outros (idade em anos).</p>
  <p>Exemplo: rendimentos entre 12 000 € e 98 000 €; 73 600 € em [0, 1] = (73 600 − 12 000)/86 000 = <b>0,716</b>. Com μ = 54 000 e σ = 16 000, o z-score é 19 600/16 000 = <b>1,225</b>.</p>`,
  key: 'min-max: (v − min)/(max − min). z-score: (v − μ)/σ. Distâncias exigem atributos na mesma escala.' },

/* ---------------- DECISION TREES ---------------- */
{ id: 'dt-id3', t: 'dt', title: 'Árvores de decisão e o algoritmo ID3',
  html: `<p>Uma árvore de decisão é um jogo das 20 perguntas: cada nó interno testa um atributo, cada ramo é um valor desse atributo e cada folha dá a classe. Para classificar, desces da raiz até uma folha.</p>
  <p>Há muitas árvores que classificam bem o mesmo conjunto de treino. Com N atributos há N! ordens possíveis de testes: procurar a menor árvore por força bruta é exponencial. O <b>ID3</b> usa uma <b>heurística</b>, de cima para baixo (top-down, greedy):</p>
  <ol><li>Escolhe o “melhor” atributo para o nó (o de <b>maior ganho de informação</b>).</li>
  <li>Cria um ramo para cada valor e distribui os exemplos pelos ramos.</li>
  <li>Se todos os exemplos de um ramo têm a mesma classe, é uma folha. Senão, repete no ramo com os atributos que sobram.</li></ol>
  <p>É <b>hill-climbing</b> no espaço das árvores: rápido, mas não garante a menor árvore (pode ficar num ótimo local). A preferência por árvores pequenas é a <b>navalha de Occam</b>: a explicação mais simples que cobre os dados tem menos hipóteses desnecessárias.</p>
  <p>Uma árvore não usa necessariamente todos os atributos: os que nunca são escolhidos ficam de fora. É uma <b>seleção de atributos implícita</b>.</p>`,
  key: 'ID3 = greedy, top-down, escolhe sempre o atributo com maior ganho de informação. Heurística: não garante a árvore mínima.' },
{ id: 'dt-entropy', t: 'dt', title: 'Entropia de Shannon',
  html: `<p>Entropia = surpresa média. Uma moeda viciada que sai sempre cara não surpreende ninguém (0 bits); uma moeda justa surpreende ao máximo (1 bit).</p>
  <p style="text-align:center"><b>H(Y) = − Σ p<sub>i</sub> log₂ p<sub>i</sub></b> &nbsp; (com 0·log 0 = 0)</p>
  <ul><li>Todos os exemplos da mesma classe → H = 0 (nó puro).</li>
  <li>Duas classes meio a meio → H = 1 bit. Com n classes equiprováveis, H máxima = log₂ n.</li></ul>
  <div class="tbl-wrap"><table><tr><th>Distribuição</th><th>H (bits)</th></tr>
  <tr><td>[4, 4]</td><td>1</td></tr><tr><td>[6, 2] (75/25)</td><td>0,811</td></tr><tr><td>[3, 2] (60/40)</td><td>0,971</td></tr><tr><td>[9, 5]</td><td>0,940</td></tr><tr><td>[2, 1, 1]</td><td>1,5</td></tr><tr><td>[2, 1] (2/3, 1/3)</td><td>0,918</td></tr></table></div>
  <p>Exemplo: 3 aprovados e 2 reprovados → H = −0,6·log₂0,6 − 0,4·log₂0,4 = 0,442 + 0,529 = <b>0,971 bits</b>.</p>
  <p>Valores úteis: log₂0,5 = −1; log₂0,25 = −2; log₂0,75 = −0,415; log₂(1/3) = −1,585; log₂(2/3) = −0,585.</p>`,
  key: 'H = −Σ p log₂ p. Puro = 0; meio a meio = 1 bit; máximo = log₂(nº de classes).' },
{ id: 'dt-gain', t: 'dt', title: 'Receita: ganho de informação',
  html: `<p>O ganho de informação de um atributo A é quanto a entropia desce depois de partir os dados por A:</p>
  <p style="text-align:center"><b>IG(Y, A) = H(Y) − H(Y | A)</b>, &nbsp; com &nbsp; <b>H(Y | A) = Σ<sub>v</sub> (|S<sub>v</sub>| / |S|) · H(S<sub>v</sub>)</b></p>
  <p>H(Y | A) é a <b>média ponderada</b> das entropias dos ramos, cada uma pesada pela fração de exemplos que lá cai.</p>
  <ol><li>Calcula H(Y) no nó.</li><li>Para cada atributo, parte os exemplos pelos valores e calcula a entropia de cada ramo.</li>
  <li>Faz a média ponderada → H(Y | A).</li><li>IG = H(Y) − H(Y | A). Escolhe o <b>maior</b> (equivale a escolher o menor H(Y | A)).</li></ol>
  <p>Exemplo: 8 exemplos [4 sim, 4 não], H = 1. O atributo A parte em a₁ = [3 sim, 0 não] e a₂ = [1 sim, 4 não]. H(a₁) = 0; H(a₂) = H(1/5, 4/5) = 0,722. H(Y | A) = 3/8·0 + 5/8·0,722 = 0,451. <b>IG = 1 − 0,451 = 0,549</b>.</p>
  <p>Atenção: o ganho favorece atributos com muitos valores (um ID único dá ramos todos puros). O C4.5 corrige com o <i>gain ratio</i>.</p>`,
  key: 'IG = H(antes) − Σ (|Sᵥ|/|S|)·H(Sᵥ). Maior ganho na raiz. Ramos puros contam 0.' },
{ id: 'dt-more', t: 'dt', title: 'Atributos contínuos, CART, overfitting e bagging',
  html: `<p><b>Atributos contínuos</b>: ou se discretizam antes, ou a árvore escolhe um <b>limiar</b> binário (x ≤ θ vs x &gt; θ). Testam-se os pontos de corte candidatos (entre valores consecutivos ordenados) e fica o de maior ganho.</p>
  <p><b>CART</b> (Classification And Regression Trees, Breiman et al.): só faz divisões <b>binárias</b> e também serve para <b>regressão</b> (a folha prevê um valor numérico, por exemplo a média). Por isso as árvores <i>não</i> são só para classificação. (O scikit-learn usa CART.)</p>
  <p><b>Overfitting</b>: uma árvore que cresce até cada folha ser pura decora o ruído do treino. Remédios: limitar a profundidade, exigir um mínimo de exemplos por folha, ou <b>poda</b> (pruning: remover os ramos menos fiáveis, avaliando num conjunto de validação).</p>
  <p><b>Bagging</b> (bootstrap aggregating): treina várias árvores, cada uma numa amostra <i>bootstrap</i> (com reposição) do treino, e combina por votação. Reduz a variância. Random forests juntam a isto a escolha aleatória de atributos em cada nó.</p>
  <p><b>Custo</b>: com n exemplos e m atributos, cada nível avalia todos os atributos sobre os exemplos (O(n·m)) e a profundidade é no máximo m, por isso o ID3 com atributos discretos custa no pior caso <b>O(n·m²)</b>.</p>`,
  key: 'Contínuos → limiar binário. CART: binário, também regressão. Poda e bagging combatem o overfitting.' },

/* ---------------- EVALUATION ---------------- */
{ id: 'ev-cm', t: 'eval', title: 'Matriz de confusão e métricas',
  html: `<p>Num teste de doença, há dois erros muito diferentes: dizer a um doente que está saudável (falso negativo) e assustar um saudável (falso positivo). A <b>matriz de confusão</b> separa-os.</p>
  <div class="tbl-wrap"><table><tr><th></th><th>Real P</th><th>Real N</th></tr><tr><th>Previsto P</th><td>TP</td><td>FP</td></tr><tr><th>Previsto N</th><td>FN</td><td>TN</td></tr></table></div>
  <ul><li><b>Accuracy</b> = (TP + TN) / total.</li>
  <li><b>Precision</b> = TP / (TP + FP): dos que disse positivos, quantos o eram.</li>
  <li><b>Recall</b> = <b>sensibilidade</b> = TPR = TP / (TP + FN): dos positivos reais, quantos apanhou.</li>
  <li><b>Especificidade</b> = TN / (TN + FP). FPR = 1 − especificidade.</li>
  <li><b>F1</b> = 2·P·R / (P + R) (média harmónica). F<sub>β</sub> dá peso β ao recall.</li></ul>
  <p>Atenção à orientação: nos exames de Aprendizagem as <b>linhas são o previsto</b> e as <b>colunas o real</b> (“True”). Confirma sempre.</p>
  <p>Com classes desequilibradas a accuracy engana: com 1% de doentes, dizer sempre “saudável” dá 99% de accuracy e recall 0.</p>
  <p>Multiclasse: a sensibilidade da classe B = (exemplos de B previstos B) / (total real de B), ou seja, a diagonal sobre a soma da <b>coluna</b> real B.</p>
  <p>Exemplo: TP = 1, FP = 3, FN = 7, TN = 3. Precision = 1/4 = 0,25; recall = 1/8 = 0,125; accuracy = 4/14 ≈ 0,29.</p>`,
  key: 'Precision = TP/(TP+FP). Recall = sensibilidade = TP/(TP+FN). Especificidade = TN/(TN+FP).' },
{ id: 'ev-roc', t: 'eval', title: 'Curvas ROC, AUC e lift',
  html: `<p>Um classificador probabilístico dá um score; o <b>limiar</b> decide a classe. Baixar o limiar apanha mais positivos (recall sobe) mas também mais falsos positivos.</p>
  <ul><li><b>Curva ROC</b>: TPR (recall) no eixo y contra FPR (1 − especificidade) no eixo x, para todos os limiares. Vai de (0, 0) a (1, 1).</li>
  <li>A diagonal é um classificador aleatório; o canto (0, 1) é o perfeito. Quanto mais a curva se afasta da diagonal, melhor.</li>
  <li><b>AUC</b> = área debaixo da ROC: 0,5 = aleatório, 1 = perfeito. Interpretação: probabilidade de um positivo ao acaso ter score maior do que um negativo ao acaso.</li>
  <li><b>Curva precision-recall</b>: mais informativa quando os positivos são raros.</li>
  <li><b>Lift</b>: quanto melhor do que o acaso é o modelo nos exemplos com score mais alto (por exemplo, fração de positivos nos 10% de topo ÷ fração de positivos global).</li></ul>`,
  key: 'ROC = TPR vs FPR ao variar o limiar. AUC 0,5 = acaso, 1 = perfeito.' },
{ id: 'ev-cv', t: 'eval', title: 'Overfitting, holdout e validação cruzada',
  html: `<p>Um aluno que decora as respostas dos testes antigos tem 20 no treino e chumba no exame. É <b>overfitting</b>: o erro de treino é baixo, mas o erro em dados novos (generalização) é alto. O contrário, <b>underfitting</b>, é um modelo simples demais (erro alto em ambos).</p>
  <p>O erro de treino é sempre otimista. Para estimar o erro real:</p>
  <ul><li><b>Holdout</b>: separa por exemplo 2/3 para treino e 1/3 para teste. Simples, mas desperdiça dados e depende da partição.</li>
  <li><b>k-fold cross-validation</b>: parte os dados em k blocos; treina k vezes, cada vez testando num bloco diferente; o erro é a média dos k. Todos os exemplos são usados para testar exatamente uma vez.</li>
  <li><b>Leave-one-out</b>: k = N. Quase sem viés, mas obriga a treinar N modelos.</li>
  <li>Para escolher hiperparâmetros usa um conjunto de <b>validação</b> separado do de teste.</li></ul>
  <p>Exemplo: 10-fold com 1000 exemplos → 10 modelos, cada um treinado com 900 e testado com 100.</p>
  <p>O MSE no treino, E = (1/N) Σ (t<sub>k</sub> − y<sub>k</sub>)², mede o ajuste; entre duas hipóteses com o mesmo erro de treino, prefere-se a mais simples.</p>`,
  key: 'Erro de treino é otimista. k-fold: k treinos, cada bloco testa uma vez, erro = média.' },
{ id: 'ev-test', t: 'eval', title: 'Testes de hipóteses: t-test emparelhado e intervalos de confiança',
  html: `<p>O modelo A teve 85% e o B 83% em 10 folds. A diferença é real ou sorte? A estatística responde com um <b>teste de hipóteses</b>.</p>
  <ul><li><b>Hipótese nula</b> H₀: não há diferença (média das diferenças = 0).</li>
  <li><b>p-value</b>: probabilidade de observar uma diferença pelo menos tão grande <i>se H₀ for verdade</i>. Se p &lt; α (por exemplo 0,05), rejeita-se H₀.</li>
  <li>Um p-value pequeno não é a probabilidade de H₀ ser verdade.</li></ul>
  <p><b>t-test emparelhado</b>: quando os dois modelos são avaliados nos mesmos folds, usa as diferenças d<sub>i</sub> = a<sub>i</sub> − b<sub>i</sub>. Calcula a média d̄ e o desvio padrão s<sub>d</sub>; t = d̄ / (s<sub>d</sub> / √n), com n − 1 graus de liberdade, e compara com a tabela t.</p>
  <p><b>Intervalo de confiança</b> a 95% para uma média: x̄ ± t<sub>0,025; n−1</sub>·s/√n (com σ conhecido usa-se z = 1,96 em vez de t). Quanto mais dados, mais estreito.</p>`,
  key: 't emparelhado: t = d̄ / (s_d/√n), n−1 graus de liberdade. p < α → rejeita H₀ (não há diferença).' },

/* ---------------- BAYES ---------------- */
{ id: 'b-rule', t: 'bayes', title: 'Regra de Bayes',
  html: `<p>Um teste de cancro acerta 98% dos doentes, mas a doença é rara. Um positivo quer dizer o quê? A regra de Bayes inverte a pergunta, de p(teste | doença) para p(doença | teste):</p>
  <p style="text-align:center"><b>p(h | D) = p(D | h) · p(h) / p(D)</b></p>
  <ul><li>p(h): <b>prior</b>, o que se acreditava antes de ver os dados.</li><li>p(D | h): <b>verosimilhança</b> (likelihood).</li>
  <li>p(h | D): <b>posterior</b>. p(D) = Σ<sub>h</sub> p(D | h)p(h) (probabilidade total) só normaliza.</li></ul>
  <p>Exemplo clássico (Mitchell): p(cancro) = 0,008; p(+ | cancro) = 0,98; p(+ | ¬cancro) = 0,03.</p>
  <ol><li>p(+ | cancro)·p(cancro) = 0,98 × 0,008 = <b>0,0078</b></li><li>p(+ | ¬cancro)·p(¬cancro) = 0,03 × 0,992 = <b>0,0298</b></li>
  <li>h<sub>MAP</sub> = ¬cancro! Normalizando: p(cancro | +) = 0,0078 / (0,0078 + 0,0298) ≈ <b>0,21</b>.</li></ol>
  <p>O prior baixo pesa muito: mesmo com um bom teste, a maioria dos positivos são falsos positivos.</p>`,
  key: 'Posterior ∝ verosimilhança × prior. Para comparar classes, p(D) não interessa.' },
{ id: 'b-map', t: 'bayes', title: 'MAP, ML e o classificador ótimo de Bayes',
  html: `<p>Duas formas de escolher a melhor hipótese (ou classe):</p>
  <ul><li><b>MAP</b> (maximum a posteriori): h<sub>MAP</sub> = argmax<sub>h</sub> p(D | h)·p(h). Usa o prior.</li>
  <li><b>ML</b> (maximum likelihood): h<sub>ML</sub> = argmax<sub>h</sub> p(D | h). Ignora o prior (é o MAP com prior uniforme).</li></ul>
  <p>Num exame típico: “classifica com ML e com MAP”. Calcula p(x | c) para cada classe (ML) e depois multiplica por p(c) (MAP). As respostas podem ser diferentes!</p>
  <p>Exemplo (Exame 2 2022/23): p(x | A) = 1, p(x | B) = 2/3, p(x | C) = 0; priors 1/5, 3/5, 1/5. ML → <b>A</b> (1 &gt; 2/3). MAP → 1·1/5 = 0,2 vs 2/3·3/5 = 0,4 → <b>B</b>.</p>
  <p>Se não há hipótese de independência, p(x | c) estima-se contando quantos exemplos da classe c têm exatamente aquele vetor x. Funciona com poucos atributos, mas com muitos quase nenhuma combinação aparece no treino: daí o Naive Bayes.</p>
  <p>O <b>classificador ótimo de Bayes</b> combina as previsões de todas as hipóteses pesadas pelos seus posteriores: nenhum classificador com a mesma informação faz melhor em média.</p>`,
  key: 'ML = argmax p(x|c). MAP = argmax p(x|c)·p(c). Com priors diferentes podem discordar.' },
{ id: 'b-naive', t: 'bayes', title: 'Naive Bayes',
  html: `<p>O Naive Bayes faz uma simplificação “ingénua”: dentro de cada classe, os atributos são <b>independentes</b>. Assim a verosimilhança conjunta é o produto das individuais:</p>
  <p style="text-align:center"><b>c<sub>NB</sub> = argmax<sub>c</sub> p(c) · Π<sub>i</sub> p(x<sub>i</sub> | c)</b></p>
  <ol><li>p(c) = fração de exemplos da classe c.</li><li>p(x<sub>i</sub> = v | c) = (nº de exemplos de c com x<sub>i</sub> = v) / (nº de exemplos de c).</li>
  <li>Multiplica tudo por classe e escolhe o maior.</li></ol>
  <p>Atributos numéricos: assume-se p(x<sub>i</sub> | c) gaussiana, com a média e a variância da classe.</p>
  <p>Exemplo (Exame 1 2021/22): 5 exemplos, 2 de A e 3 de B. Para x = (B, C): p(y₁ = B | A)·p(y₂ = C | A) = 1/2 · 1/2 = 1/4; p(y₁ = B | B)·p(y₂ = C | B) = 2/3 · 1/3 = 2/9. MAP: A → 1/4 · 2/5 = 0,1; B → 2/9 · 3/5 ≈ 0,133 → <b>B</b>.</p>
  <p><b>Amostras pequenas</b>: se um valor nunca aparece numa classe, p = 0 e anula o produto todo. Solução: <b>m-estimate</b> / suavização de Laplace: (n<sub>c</sub> + m·p)/(n + m).</p>`,
  key: 'Naive Bayes: p(c)·Π p(xᵢ|c). Uma contagem 0 anula tudo → suavização de Laplace.' },
{ id: 'b-gauss', t: 'bayes', title: 'A gaussiana em D dimensões e a matriz de covariância',
  html: `<p>A gaussiana numa dimensão: p(x) = 1/(σ√(2π)) · exp(−(x − μ)² / (2σ²)). Em D dimensões, a média é um vetor μ e a largura é a <b>matriz de covariância</b> Σ (D × D):</p>
  <p style="text-align:center">p(x) = 1/((2π)<sup>D/2</sup> |Σ|<sup>1/2</sup>) · exp(−½ (x − μ)ᵀ Σ⁻¹ (x − μ))</p>
  <ul><li>Na diagonal de Σ estão as variâncias de cada atributo; fora dela as covariâncias.</li>
  <li>Σ é simétrica e semidefinida positiva. Σ = σ²I → círculos; diagonal → elipses alinhadas com os eixos; geral → elipses rodadas.</li>
  <li>Se há menos exemplos do que dimensões, ou atributos linearmente dependentes, Σ é <b>singular</b> (não tem inversa).</li></ul>
  <p>Um classificador de Bayes com gaussianas estima μ<sub>c</sub> e Σ<sub>c</sub> por classe e escolhe argmax p(x | c)p(c). É isto que reaparece no clustering EM, com classes escondidas.</p>`,
  key: 'Gaussiana D-dim: média μ (vetor) e covariância Σ (matriz). Diagonal = variâncias.' },

/* ---------------- kNN ---------------- */
{ id: 'k-dist', t: 'knn', title: 'Normas e distâncias',
  html: `<p>“Parecido” quer dizer “perto”, mas perto segundo que régua? Para x = (2, 8) e y = (6, 3):</p>
  <ul><li><b>Euclidiana</b> (l₂): √((2−6)² + (8−3)²) = √41 ≈ 6,40.</li>
  <li><b>Manhattan</b> (l₁, taxicab): |2−6| + |8−3| = <b>9</b>.</li>
  <li><b>Máximo</b> (l<sub>∞</sub>, Chebyshev): max(|x<sub>i</sub> − y<sub>i</sub>|) = 5.</li>
  <li>Minkowski l<sub>p</sub>: (Σ |x<sub>i</sub> − y<sub>i</sub>|<sup>p</sup>)<sup>1/p</sup>; p = 1 e p = 2 são os casos acima.</li>
  <li><b>Hamming</b> (binários/categóricos): número de posições diferentes. 1011101 vs 1001001 → 2.</li>
  <li><b>Semelhança do cosseno</b>: cos θ = x·y / (‖x‖‖y‖) = (12 + 24)/(√68·√45) ≈ 0,65. Não é uma distância (é maior quando são parecidos); ignora o comprimento dos vetores.</li></ul>
  <p>Só l₂ vem de um produto interno: há ângulos e ortogonalidade (espaço de Hilbert). Com vetores normalizados ao comprimento 1, a distância euclidiana e o cosseno ordenam os vizinhos da mesma maneira.</p>`,
  key: 'l₁ = Σ|dif|, l₂ = √Σdif², l∞ = max|dif|. Cosseno = semelhança de direção, não distância.' },
{ id: 'k-knn', t: 'knn', title: 'k vizinhos mais próximos',
  html: `<p>Diz-me com quem andas… O kNN não aprende nenhum modelo: guarda os exemplos todos (<b>instance-based</b>, <b>lazy learning</b>) e, para um ponto novo, olha para os k exemplos mais próximos.</p>
  <ul><li><b>Classificação</b>: voto maioritário (moda) das classes dos k vizinhos.</li>
  <li><b>Regressão</b>: média (ou mediana) dos valores dos vizinhos.</li>
  <li><b>Pesos</b>: cada vizinho vota com peso 1/d (ou 1/d²), para os mais próximos contarem mais. Pesos uniformes = todos iguais.</li></ul>
  <p>É <b>não paramétrico</b>: não há um número fixo de parâmetros, o “modelo” são os dados. Treinar custa 0; classificar custa caro (calcular distâncias a todos os exemplos).</p>
  <p>k pequeno (k = 1) → fronteira irregular, sensível a ruído (overfitting); k grande → fronteira demasiado suave. Com k = 1 a fronteira é um <b>diagrama de Voronoi</b>.</p>
  <p><b>Maldição da dimensionalidade</b>: em muitas dimensões todos os pontos ficam quase à mesma distância, e atributos irrelevantes estragam a distância. Normaliza e escolhe bem os atributos.</p>
  <p>Exemplo: os 3 vizinhos de x estão a distâncias 1 (classe B), 2 (B) e 3 (C) — com voto ponderado 1/d, B = 1 + 1/2 = 1,5 e C = 1/3 → <b>B</b>.</p>`,
  key: 'kNN: guarda tudo, decide no momento pelos k mais próximos (moda ou média, com pesos 1/d opcionais).' },
]);
