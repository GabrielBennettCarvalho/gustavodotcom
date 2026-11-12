/* ===== Lessons: chapter 2, Falhas de Mercado & Ambiente ===== */
(() => {
// Worked externality (same numbers as the robot factory of Caderno 2.3): P = 340, CMP = 100 + 2Q, CME = Q, CMS = 100 + 3Q.
// The market produces where P = CMP (Q = 120); the social optimum is where P = CMS (Q = 80).
const P = { n: 'P', p: [[0, 340], [160, 340]], c: 'd' }, CMP = { n: 'CMP', p: [[0, 100], [160, 420]], c: 's' }, CMS = { n: 'CMS', p: [[0, 100], [133, 499]], c: 'm' };
const ext = { sd: { r: [160, 520], ax: ['Q', '€'], ln: [P, CMP, CMS], g: [[80, 340], [120, 340]], pt: [{ q: 120, p: 340, l: 'mercado' }, { q: 80, p: 340, l: 'ótimo' }] } };
const deal = { sd: { r: [160, 520], ax: ['Q', '€'], a: [{ p: [[80, 340], [120, 340], [120, 460]], c: 'ext', l: '' }, { p: [[80, 340], [120, 340], [80, 260]], c: 'ps', l: '' }, { p: [[100, 300], [100, 300]], c: 'ps', l: '1600' }, { p: [[107, 380], [107, 380]], c: 'ext', l: '2400' }], ln: [P, CMP, CMS], g: [[80, 340], [120, 340]] } };
const tax = { sd: { r: [160, 520], ax: ['Q', '€'], ln: [P, { n: 'P − t', p: [[0, 260], [160, 260]], c: 'd', dash: true }, CMP, CMS], g: [[80, 260], [80, 340]], pt: [{ q: 80, p: 260 }] } };
// Cap and trade: 30 t to cut in total. A cuts a (from the left), B cuts 30 − a (from the right). CMgR_A = 2a, CMgR_B = 4(30 − a).
const cap = { sd: { r: [30, 70], ax: ['a', '€/t'], ln: [{ n: 'CMgR A', p: [[0, 0], [30, 60]], c: 'g' }, { n: 'CMgR B', p: [[30, 0], [12.5, 70]], c: 'm' }], g: [[20, 40], [15, 30], [15, 60]], pt: [{ q: 20, p: 40, l: 'E' }] } };
STUDY.lessons('ieco', [
/* ---------------- BENS PÚBLICOS ---------------- */
{ id: 'f-fail', t: 'pub', title: 'Falhas de mercado: as quatro fontes',
  html: `<p>No capítulo 1 o mercado concorrencial maximizava o excedente total. Na realidade os mercados podem alocar recursos de forma <b>Pareto-ineficiente</b>: é uma <b>falha de mercado</b>.</p>
  <p><b>Pareto-eficiente</b>: não é possível melhorar a situação de alguém sem piorar a de outro. Se é possível, há ganhos por aproveitar.</p>
  <p>As quatro causas estudadas na cadeira:</p>
  <ol><li><b>Bens públicos</b></li><li><b>Informação assimétrica</b></li><li><b>Poder de mercado</b></li><li><b>Externalidades</b>, com o caso das alterações climáticas</li></ol>
  <p>Para cada uma, duas perguntas: de onde vem a ineficiência e <b>como pode o Governo resolvê-la</b>.</p>`,
  key: 'Falha de mercado = alocação Pareto-ineficiente. Fontes: bens públicos, informação assimétrica, poder de mercado, externalidades.' },
{ id: 'f-goods', t: 'pub', title: 'Rival e exclusivo: os quatro tipos de bens',
  html: `<ul><li><b>Rival</b>: o uso por uma pessoa <b>reduz</b> a disponibilidade para os outros (uma sandes, um lugar sentado).</li>
  <li><b>Não-rival</b>: usar não gasta o bem para os outros; servir mais uma pessoa custa <b>zero</b> (um teorema, uma emissão de rádio).</li>
  <li><b>Exclusivo</b> (<i>excludable</i>): é possível impedir alguém de o usar (cobrar entrada, pôr palavra-passe).</li>
  <li><b>Não exclusivo</b> (<i>non-excludable</i>): é impossível excluir alguém do acesso.</li></ul>
  <div class="tbl-wrap"><table><tr><th></th><th>Não-rival</th><th>Rival</th></tr>
  <tr><th>Não exclusivo</th><td><b>Bem público</b> (ou mal público: a poluição do ar). Ex.: defesa nacional, fogo de artifício.</td><td><b>Bem comum</b>. Ex.: peixe no mar, pastagens, uma floresta para madeira.</td></tr>
  <tr><th>Exclusivo</th><td><b>Bem de clube</b> ou artificialmente escasso: cobra-se uma taxa sem estar congestionado. Ex.: conhecimento com direitos de propriedade intelectual, streaming.</td><td><b>Bem privado</b>. Ex.: uma caixa de sushi, lugares num teatro.</td></tr></table></div>
  <p><b>Bem público</b> = não-rival <b>e</b> não exclusivo: se está disponível para uma pessoa, está para todos sem custo adicional.</p>
  <p><b>Depende do contexto:</b> um parque é público vazio, mas comum se estiver congestionado; uma aula aberta é não-rival até a sala encher.</p>`,
  key: 'Público: não-rival + não exclusivo. Comum: rival + não exclusivo. Clube: não-rival + exclusivo. Privado: rival + exclusivo.' },
{ id: 'f-free', t: 'pub', title: 'Porque falham: free riding e tragédia dos comuns',
  html: `<p><b>Bens públicos e free riding</b> (“ir à boleia”): como ninguém pode ser excluído, cada um espera que outros paguem. Uma empresa privada não consegue cobrar, por isso o mercado <b>fornece pouco ou nada</b>. Solução típica: o Governo fornece-o e financia-o com <b>impostos</b> (defesa, iluminação pública, investigação básica).</p>
  <p><b>Bens comuns e tragédia dos comuns</b>: como são rivais mas ninguém é excluído, cada um usa o máximo antes que os outros gastem. Os recursos comuns são <b>sobre-explorados</b> (pesca excessiva). Soluções: quotas, licenças, direitos de propriedade, regras da comunidade.</p>
  <p>Ambos são <b>dilemas sociais</b>: cada um, ao seguir o seu interesse, chega a um resultado pior para todos, porque não tem em conta os efeitos das suas ações sobre os outros.</p>`,
  key: 'Bem público → free riding → o mercado fornece de menos. Bem comum → tragédia dos comuns → usa-se de mais.' },

/* ---------------- INFORMAÇÃO ASSIMÉTRICA ---------------- */
{ id: 'i-lemons', t: 'info', title: 'O mercado dos limões e a seleção adversa',
  html: `<p><b>Informação assimétrica</b>: um dos lados da troca sabe mais do que o outro. Exemplo clássico (Akerlof): <i>“The market for lemons”</i>, em que um <i>lemon</i> é um carro em segunda mão estragado.</p>
  <ol><li>Os <b>vendedores sabem mais</b> sobre a qualidade do carro do que os compradores.</li>
  <li>Os compradores, com medo de comprar um limão, só pagam um preço que reflete a <b>qualidade média</b>.</li>
  <li>Quem tem carros <b>bons sai do mercado</b> (o preço médio não lhes chega): fica sobretudo baixa qualidade. É a <b>seleção adversa</b>.</li>
  <li>A qualidade média desce, o preço desce mais, e o <b>mercado pode entrar em colapso</b>.</li></ol>
  <p><b>Soluções:</b> garantias, inspeções, reputação (avaliações), contratos de seguro, regulação.</p>`,
  key: 'Vendedor sabe mais → preço da qualidade média → os bons saem → seleção adversa → o mercado pode colapsar.' },
{ id: 'i-banks', t: 'info', title: 'Informação assimétrica no crédito e nos bancos',
  html: `<p>Num <b>empréstimo</b>, as decisões de quem pede emprestado têm efeitos sobre quem empresta: o banco não sabe bem se o projeto é arriscado nem quanto esforço vai ser feito para pagar.</p>
  <ul><li>Por isso, os indivíduos de <b>menor rendimento</b> têm muitas vezes acesso limitado ao crédito, ou são excluídos: é uma falha do mercado de crédito (volta no capítulo 5).</li>
  <li>Os <b>próprios bancos</b> também são fonte de falha: se assumirem riscos demais e falirem, os bancos que lhes emprestaram sofrem custos (efeito externo).</li>
  <li><b>“Too big to fail”</b>: os Governos resgatam os bancos grandes demais para falir, o que <b>incentiva</b> comportamentos ainda mais arriscados (sabem que serão salvos).</li></ul>`,
  key: 'Crédito: quem tem pouco rendimento fica sem crédito. Too big to fail: o resgate esperado incentiva o risco.' },

/* ---------------- PODER DE MERCADO ---------------- */
{ id: 'w-power', t: 'pow', title: 'Poder de mercado: o que é e de onde vem',
  html: `<p><b>Poder de mercado</b> = capacidade de praticar um <b>preço acima do custo marginal</b> sem perder todos os clientes. Resultado: <b>quantidade transacionada inferior à eficiente</b> e uma perda de bem-estar (<b>deadweight loss</b>), como com um imposto.</p>
  <p><b>Fontes:</b></p>
  <ul><li><b>Barreiras à entrada</b>: legais (licenças, patentes), tecnológicas…</li>
  <li><b>Economias de escala</b> e <b>monopólios naturais</b>: o custo médio desce tanto com a escala que uma só empresa produz mais barato do que várias (água canalizada, rede elétrica).</li>
  <li><b>Efeitos de rede</b>: o produto vale mais quanto mais gente o usa.</li>
  <li><b>Custos de mudança</b>: fidelização, contratos, perder dados ao mudar de fornecedor.</li></ul>
  <p><b>Políticas públicas:</b> <b>antitrust</b> (proibir cartéis, controlar fusões), <b>regulação de preços e qualidade</b> nos monopólios naturais, <b>promover a entrada</b>, a interoperabilidade e a portabilidade (levar o número de telemóvel ou os dados para outro operador).</p>`,
  key: 'Poder de mercado: P > custo marginal → Q menor do que a eficiente → deadweight loss.' },
{ id: 'w-struct', t: 'pow', title: 'Estruturas de mercado',
  html: `<p>Duas perguntas classificam um mercado: <b>quantas empresas</b> há e se os <b>produtos são idênticos ou diferenciados</b>.</p>
  <div class="tbl-wrap"><table><tr><th>Estrutura</th><th>Empresas</th><th>Produto</th><th>Exemplos (aulas)</th></tr>
  <tr><td><b>Monopólio</b></td><td>Uma</td><td>Único</td><td>Água canalizada</td></tr>
  <tr><td><b>Oligopólio</b></td><td>Poucas</td><td>Idêntico ou diferenciado</td><td>Computação na cloud, petróleo</td></tr>
  <tr><td><b>Concorrência monopolística</b></td><td>Muitas</td><td>Diferenciado</td><td>Restaurantes, cabeleireiros</td></tr>
  <tr><td><b>Concorrência perfeita</b></td><td>Muitas</td><td>Idêntico</td><td>Leite, cereais, praças</td></tr></table></div>
  <p>Sinais de poder de mercado nas notícias: pouca diversidade de preços, dificuldade de entrada de novos concorrentes, fidelização, <b>discriminação de preços</b> e custos de mudança.</p>`,
  key: 'Muitas + idêntico = perfeita. Muitas + diferenciado = monopolística. Poucas = oligopólio. Uma = monopólio.' },
{ id: 'w-network', t: 'pow', title: 'Efeitos de rede e “vencedor leva tudo”',
  html: `<p><b>Efeitos externos de rede</b>: os benefícios para cada utilizador <b>crescem com o número de utilizadores</b> (idiomas, videojogos, redes sociais).</p>
  <p>Daí a concorrência <b>“vencedor leva tudo”</b> (<i>winner-takes-all</i>): a primeira tecnologia a ser adotada ganha vantagem (<i>first-adopter advantage</i>) e o mercado fica preso a ela (<b>lock-in</b>), mesmo que não seja a melhor.</p>
  <p>Exemplo: o <b>Betamax</b> tinha qualidade superior ao <b>VHS</b>, mas o VHS dominou por ter utilizadores suficientes. Outro: DVD e Blu-ray.</p>`,
  key: 'Efeito de rede → quem chega primeiro ganha tudo (lock-in), nem sempre o melhor (Betamax vs VHS).' },
{ id: 'w-matching', t: 'pow', title: 'Mercados de matching (two-sided)',
  html: `<p>Um <b>mercado de matching</b> (<i>two-sided</i>) junta membros de <b>dois grupos distintos</b>, cada um beneficiando de encontrar, através de uma <b>plataforma</b>, o membro certo do outro grupo. Ex.: Airbnb (anfitriões e hóspedes), colocação de alunos em universidades, aeroportos (passageiros e companhias aéreas).</p>
  <p><b>Problema do ovo e da galinha</b>: basta um número mínimo de quem oferece (<i>posters</i>) ou de quem procura (<i>seekers</i>), mas qual aparece primeiro? Tende a acontecer que o mercado <b>colapsa</b> ou sobrevive com <b>poucas e grandes empresas</b>.</p>
  <p>Como se forma o mercado:</p>
  <ul><li>A <b>política pública</b> cria a plataforma (na internet ou física);</li>
  <li><b>Iniciativa privada</b> que assume o risco de lançar o projeto;</li>
  <li>Cobrar <b>preço baixo ou zero a um dos grupos</b> para atrair o outro (ex.: software gratuito para utilizadores).</li></ul>
  <p>Depois de formadas, estas empresas têm <b>rendas de inovação</b> e o problema do ovo e da galinha <b>afasta novos concorrentes</b>: tendem a ser grandes e quase monopólios, um desafio para a política de concorrência.</p>`,
  key: 'Two-sided: ovo e galinha. Resolve-se com plataforma pública, risco privado ou preço zero para um lado. Acaba quase em monopólio.' },

/* ---------------- EXTERNALIDADES ---------------- */
{ id: 'e-def', t: 'ext', title: 'Externalidades: definição',
  html: `<p>Três formas de dizer o mesmo (todas valem no exame):</p>
  <ul><li>Efeito de uma decisão económica que <b>não está especificado num contrato</b> como benefício ou responsabilidade;</li>
  <li>Efeitos positivos (benefícios) ou negativos (custos) <b>à margem das transações</b> de mercado;</li>
  <li>Efeitos <b>sobre terceiros</b> que resultam de ações de agentes económicos.</li></ul>
  <p>São falha de mercado porque criam uma diferença entre o <b>ótimo privado</b> e o <b>ótimo social</b>.</p>
  <div class="tbl-wrap"><table><tr><th>Negativas (custo para terceiros)</th><th>Positivas (benefício para terceiros)</th></tr>
  <tr><td>Poluição, ruído de uma fábrica, pesticidas que contaminam rios, fumo passivo, trânsito</td><td>Abelhas que polinizam o pomar do vizinho, vacinação, educação, investigação, jardim bonito</td></tr></table></div>
  <p>Caso das aulas: <b>pesticidas nas Caraíbas</b>. Os donos das plantações de banana usaram pesticidas prejudiciais para baixar custos; os químicos contaminaram rios e pescas e os habitantes e pescadores adoeceram.</p>`,
  key: 'Externalidade = efeito sobre terceiros fora do contrato e do preço. Ótimo privado ≠ ótimo social.' },
{ id: 'e-cms', t: 'ext', title: 'Custo marginal privado, externo e social',
  html: `<ul><li><b>CMP</b> (custo marginal privado): o custo marginal para quem decide.</li>
  <li><b>CME</b> (custo marginal externo): o custo que o decisor impõe a terceiros com mais uma unidade.</li>
  <li>{f:cms}: custo total para a sociedade. Com efeito externo <b>negativo</b>, <b>CMS &gt; CMP</b>.</li></ul>
  <p>O produtor produz onde <b>P = CMP</b>. O nível <b>Pareto-eficiente</b> é onde <b>P = CMS</b>. Por isso, com externalidade negativa, a produção (e a poluição) é <b>excessiva</b> do ponto de vista social.</p>
  <p>Exemplo (os números do caderno, 2.3): P = 340, CMP = 100 + 2Q, CME = Q, logo CMS = 100 + 3Q.</p>
  <ul><li>Mercado: 340 = 100 + 2Q → <b>Q = 120</b>.</li><li>Ótimo social: 340 = 100 + 3Q → <b>Q = 80</b>.</li></ul>
  <p>Com externalidade <b>positiva</b> é ao contrário: o benefício marginal social é maior do que o privado e produz-se <b>de menos</b> (o apicultor faz menos mel do que seria eficiente, porque não é pago pela polinização).</p>
  <p>Atenção às palavras: o <b>custo total externo</b> é o custo total por dia imposto a terceiros; o <b>marginal</b> é o de uma unidade adicional.</p>`,
  d: ext,
  key: 'Mercado: P = CMP. Ótimo: P = CMS. Externalidade negativa → produz-se demais; positiva → produz-se de menos.' },
{ id: 'e-coase', t: 'ext', title: 'Solução 1: negociação privada',
  html: `<p>Para negociar é preciso que os <b>direitos de propriedade</b> sobre a externalidade estejam atribuídos por lei (o direito de poluir, ou o direito a ar limpo).</p>
  <p>Na ausência de <b>custos de transação</b>, a negociação privada leva a uma alocação <b>Pareto-eficiente</b>, <b>independentemente de qual parte tem os direitos</b> (teorema de Coase). Pode ser mais eficaz do que o Governo, porque as partes têm mais informação.</p>
  <p>No exemplo (P = 340, CMP = 100 + 2Q, CMS = 100 + 3Q), reduzir de 120 para 80:</p>
  <ul><li><b>Lucro perdido</b> pela empresa = área entre P e CMP de 80 a 120 = 40 × 80 / 2 = <b>1600 €</b>. É a <b>oferta mínima</b> que a empresa aceita.</li>
  <li><b>Ganho para os afetados</b> = custo externo evitado = área entre CMS e CMP de 80 a 120 = <b>4000 €</b>. É o <b>máximo</b> que pagariam.</li>
  <li><b>Ganho social líquido</b> = 4000 − 1600 = <b>2400 €</b>. Não depende do valor pago: o pagamento só reparte o ganho.</li></ul>
  <p>No gráfico: o triângulo roxo (abaixo de P) é o lucro perdido, 1600; o cinzento (acima de P) é o ganho líquido, 2400; os dois juntos são o custo externo evitado, 4000.</p>
  <p>A compensação que acaba por acontecer (entre 1600 e 4000) depende do <b>poder de negociação</b> das partes.</p>
  <p><b>Limitações:</b> custos de transação (obter informação, fazer cumprir o contrato, organizar uma ação coletiva entre muitos afetados) e falta de informação.</p>`,
  d: deal,
  key: 'Mínimo aceite = lucro perdido (1600). Máximo pago = custo externo evitado (4000). Ganho líquido = 2400, seja qual for o pagamento.' },
{ id: 'e-gov', t: 'ext', title: 'Solução 2: políticas do Governo',
  html: `<ol><li><b>Regulação da produção</b>: um limite (teto) à quantidade, no nível socialmente ótimo.</li>
  <li><b>Imposto pigouviano</b> (ou subsídio, se a externalidade é positiva): {f:pigou}. O produtor que maximiza o lucro escolhe onde CMP = preço depois do imposto, que é a quantidade ótima. O imposto obriga-o a <b>suportar o custo total</b> das suas decisões. No exemplo: CME em Q = 80 é 80 €, logo t = 80 e 340 − 80 = 260 = 100 + 2Q → Q = 80.</li>
  <li><b>Compensação</b>: o Governo obriga a empresa a pagar, por unidade, uma indemnização aos afetados igual a CMS − CMP. Os afetados ficam totalmente compensados e a empresa produz a quantidade ótima. Os pescadores ficam <b>melhor do que com o imposto</b>, porque recebem eles o pagamento, em vez do Estado.</li></ol>
  <p><b>Limitações:</b> <b>informação</b> em falta (o Governo pode não saber o valor certo do dano), <b>medição</b> (difícil saber a quota de cada poluidor) e <b>lobbying</b>.</p>`,
  d: tax,
  key: 'Imposto pigouviano = CME no ótimo. Compensação = CMS − CMP pago aos afetados. Limites: informação, medição, lobbying.' },

/* ---------------- AMBIENTE ---------------- */
{ id: 'a-abate', t: 'env', title: 'Ambiente: quanto reduzir a poluição',
  html: `<p>O progresso tecnológico e a globalização subiram muito os padrões de vida, mas o crescimento rápido prejudicou o <b>ambiente</b> e os <b>recursos naturais</b> (pesca excessiva, poluição). As alterações climáticas são a maior externalidade negativa.</p>
  <p>As <b>políticas de redução da poluição</b> (<i>abatement policies</i>) combatem as alterações climáticas, mas o grau de redução escolhido depende de custos e benefícios:</p>
  <ol><li>do <b>valor que os cidadãos dão ao ambiente</b>;</li>
  <li>dos <b>custos económicos da redução</b>: custos <b>contabilísticos</b> (investir em tecnologias limpas) + custos de <b>oportunidade</b> (deixar uma atividade mais lucrativa para outra menos poluente).</li></ol>
  <p><b>Custo de oportunidade</b> = o valor da melhor alternativa de que se abdica ao fazer uma escolha.</p>
  <p><b>Curva de custo de redução</b> (como a da McKinsey): cada barra é uma tecnologia; a <b>largura</b> é o <b>potencial</b> de redução (Gt de CO₂) e a <b>altura</b> o <b>custo</b> por tonelada reduzida. Começa-se pelas mais baratas por tonelada, mas um potencial pequeno não é razão para nunca adotar uma tecnologia barata.</p>`,
  key: 'Quanto reduzir depende do valor dado ao ambiente e dos custos (contabilísticos + de oportunidade).' },
{ id: 'a-polluter', t: 'env', title: 'Poluidor-pagador e conflitos de interesse',
  html: `<p><b>Princípio do poluidor-pagador</b>: os responsáveis pelos efeitos externos devem pagar pelos danos. Mas os custos da redução <b>não são partilhados por igual</b>, e o princípio <b>nem sempre é a melhor política</b>:</p>
  <ul><li><b>Justiça</b>: os poluidores podem ser famílias ou países de <b>baixo rendimento</b> (queimar madeira ou cozinhar a carvão por estarem fora da rede elétrica).</li>
  <li><b>Eficácia</b>: subsídios ou impostos podem sair <b>mais baratos do que rastrear</b> cada poluidor.</li></ul>
  <p>Os <b>benefícios</b> também não se repartem por igual: ao contrário dos cidadãos, os poluidores podem nunca sofrer a poluição que causam (países ricos exportam lixo, incluindo têxteis e resíduos tóxicos, para países pobres).</p>
  <p>A repartição dos ganhos da redução depende do <b>poder de negociação</b> de cada grupo, que depende de:</p>
  <ul><li>informação verificável (conseguir detetar a poluição);</li><li>consenso entre os cidadãos sobre a qualidade ambiental;</li><li>lobby das empresas;</li><li>direito legal de poluir (licenças);</li><li>capacidade de forçar o cumprimento.</li></ul>`,
  key: 'Poluidor-pagador falha por justiça (poluidores pobres) e eficácia (rastrear sai caro).' },
{ id: 'a-policies', t: 'env', title: 'Políticas de preço e de quantidade',
  html: `<p>Objetivo: alcançar a redução desejada (ex.: toneladas de CO₂) ao <b>custo mínimo</b>. Dois tipos:</p>
  <ol><li><b>Políticas baseadas no preço</b>: <b>impostos e subsídios</b> que mudam os preços. Procuram <b>internalizar</b> os efeitos externos das escolhas individuais.</li>
  <li><b>Políticas baseadas na quantidade</b>: <b>proibições</b> (bans), <b>limites</b> (caps) e regulação.</li></ol>
  <p><b>Tributar empresas</b>: sem imposto, a tecnologia intensiva em carvão pode ser a mais barata; com um imposto sobre o carvão, a solar passa a ser a mais barata. Os impostos tornam as renováveis relativamente mais lucrativas, tornam a sua adoção <b>necessária para se manter competitivo</b> e criam <b>rendas de inovação</b> que puxam pela inovação privada.</p>
  <p><b>Tributar consumidores</b>: pode mudar estilos de vida e a valorização dos bens (imposto sobre viagens de avião, carros elétricos vs a gasolina). Os impostos não são só incentivos: são também <b>informação</b> sobre a necessidade de mudar de comportamento.</p>
  <p>Quando um imposto sobre os voos reduz as viagens de avião, isso é o <b>objetivo</b> da política, não um efeito ineficiente.</p>`,
  key: 'Preço: impostos e subsídios (internalizar). Quantidade: bans, caps, regulação. Cap and trade junta os dois.' },
{ id: 'a-cap', t: 'env', title: 'Cap and trade (comércio de licenças)',
  html: `<p>Os efeitos ambientais externos surgem porque <b>falta um mercado</b> para a poluição. O <b>cap and trade</b> cria um mercado de licenças de emissão:</p>
  <ul><li>O Governo fixa um <b>limite</b> (cap) à poluição e cria licenças suficientes para esse limite (a ideia é <b>baixar o cap</b> ao longo do tempo).</li>
  <li>Aloca as licenças (ex.: <b>leilão</b>) e as empresas <b>compram e vendem</b> entre si (trade). À medida que o cap desce, o preço das licenças sobe.</li>
  <li>É uma política <b>combinada</b>: quantidade (o cap) e preço (o mercado de licenças).</li></ul>
  <p><b>Quem reduz?</b> As empresas têm tecnologias diferentes. O objetivo é que a redução seja feita por quem a faz <b>mais barato</b>. A empresa com custo marginal de redução <b>menor reduz mais</b> e vende licenças à que reduz caro, até {f:cap}. Esse é o preço de equilíbrio das licenças, e o resultado é Pareto-eficiente.</p>
  <p>Exemplo (no gráfico, a = toneladas que A reduz; B reduz o resto): reduzir 30 t no total; CMgR_A = 2·(redução de A), CMgR_B = 4·(redução de B). Igualando, 2a = 4(30 − a) → <b>A reduz 20 t, B reduz 10 t</b>, licença a <b>40 €/t</b>. Partindo de 15/15 (A a 30 €, B a 60 €), B paga a A para reduzir mais.</p>
  <p><b>Limitações:</b> é difícil escolher o cap certo; pôr preço na poluição pode mandar o sinal errado (tornar a poluição “lucrativa”). O <b>EU-ETS</b> teve um cap demasiado alto: depois da crise de 2008 (muitas licenças, pouca procura de energia) o preço caiu e quase não havia incentivo a reduzir. Um <b>preço mínimo</b> (price floor) atenua o problema.</p>`,
  d: cap,
  key: 'Menor custo marginal de redução → reduz mais. Troca-se até os custos marginais serem iguais ao preço da licença.' },
{ id: 'a-challenges', t: 'env', title: 'Porque é difícil combater as alterações climáticas',
  html: `<ol><li>As pessoas podem <b>valorizar mais os aspetos económicos</b> do que o ambiente (falta de informação adequada, conflitos de interesse).</li>
  <li>As <b>gerações futuras</b> estão sub-representadas, ou nem estão: quanto devemos valorizar os custos e benefícios que as nossas ações têm para elas? É o <b>desconto intertemporal</b>.</li>
  <li>Exige <b>cooperação internacional</b>, que tem a estrutura de um <b>dilema do prisioneiro</b>.</li></ol>
  <p><b>Dilema do desconto</b>: um custo B daqui a t anos vale hoje {f:pv}. Com r = 5%, um dano de 1 000 000 € daqui a 100 anos vale hoje cerca de 7 600 € (1,05¹⁰⁰ ≈ 131,5); com r = 1%, cerca de 370 000 € (1,01¹⁰⁰ ≈ 2,70). A escolha de r decide se vale a pena agir já. Quem usa uma taxa alta argumenta, muitas vezes, que o <b>progresso tecnológico</b> tornará as gerações futuras mais ricas e a redução mais barata; quem usa uma taxa baixa diz que não é justo dar menos peso às gerações futuras.</p>`,
  key: 'Três desafios: economia vs ambiente, gerações futuras (desconto) e cooperação internacional (dilema do prisioneiro).' },
{ id: 'a-dilemma', t: 'env', title: 'Dilema do prisioneiro e dilemas sociais',
  html: `<p>O <b>dilema do prisioneiro</b> mostra um conflito entre o interesse privado e o do grupo: cada jogador segue o seu interesse e o equilíbrio é <b>“mau”</b>, pior para todos do que se cooperassem.</p>
  <p>Exemplo climático (ganhos de cada país; cada um escolhe reduzir ou não):</p>
  <div class="tbl-wrap"><table><tr><th></th><th>B reduz</th><th>B não reduz</th></tr>
  <tr><th>A reduz</th><td>A: 3, B: 3</td><td>A: 0, B: 4</td></tr>
  <tr><th>A não reduz</th><td>A: 4, B: 0</td><td><b>A: 1, B: 1</b></td></tr></table></div>
  <p>Faça B o que fizer, A ganha mais em <b>não reduzir</b> (4 &gt; 3 e 1 &gt; 0), e o mesmo para B: é a <b>estratégia dominante</b>. O equilíbrio é (não reduz, não reduz) com 1 cada, pior do que (3, 3) se ambos reduzissem.</p>
  <p><b>Dilema social</b>: ações tomadas de forma independente, cada um no seu interesse, dão um resultado <b>socialmente subótimo</b>, porque ninguém tem totalmente em conta os efeitos sobre os outros. Exemplos:</p>
  <ul><li><b>Tragédia dos comuns</b>: recursos comuns sobre-explorados;</li>
  <li><b>Free riding</b>: um suporta os custos enquanto todos desfrutam dos benefícios.</li></ul>`,
  key: 'Dilema do prisioneiro: a estratégia dominante de cada um leva a um equilíbrio pior para todos.' },
]);
})();
