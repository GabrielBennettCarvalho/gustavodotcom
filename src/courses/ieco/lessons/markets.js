/* ===== Lessons: chapter 1, Mercados e o Papel do Governo ===== */
(() => {
// Worked example used across the lessons: D: P = 10 − 0,5Q and S: P = 2 + 0,5Q → Q* = 8, P* = 6.
const D = [[0, 10], [20, 0]], S = [[0, 2], [18, 11]];
STUDY.lessons('ieco', [
/* ---------------- ECONOMIAS DE MERCADO ---------------- */
{ id: 'm-econ', t: 'mkt', title: 'O que é a Economia e o fluxo circular',
  html: `<p>Definição usada na cadeira (CORE, <i>The Economy</i>): <b>a Economia é o estudo de como as pessoas interagem umas com as outras e com o seu ambiente, na produção dos seus meios de subsistência</b>.</p>
  <p>Um <b>sistema económico</b> é a forma de organizar a economia: quem produz, como e para quem. Não confundir com o <b>sistema político</b> (democracia, ditadura…): são coisas diferentes.</p>
  <p>O <b>fluxo circular</b> liga os quatro agentes:</p>
  <div class="tbl-wrap"><table><tr><th>De</th><th>Para</th><th>O quê</th></tr>
  <tr><td>Famílias</td><td>Empresas</td><td>Gastos com consumo</td></tr>
  <tr><td>Empresas</td><td>Famílias</td><td>Salários, lucros, rendas (rendimento)</td></tr>
  <tr><td>Famílias e empresas</td><td>Governo</td><td>Impostos</td></tr>
  <tr><td>Governo</td><td>Famílias e empresas</td><td>Gastos públicos (bens, serviços, transferências)</td></tr>
  <tr><td>Resto do mundo</td><td>Empresas</td><td>Pagamentos por <b>exportações</b></td></tr>
  <tr><td>Empresas</td><td>Resto do mundo</td><td>Pagamentos por <b>importações</b></td></tr></table></div>`,
  key: 'O dinheiro das exportações entra na economia vindo do resto do mundo; o das importações sai para o resto do mundo.' },
{ id: 'm-market', t: 'mkt', title: 'Economia de mercado e conceitos-chave',
  html: `<p>Uma <b>economia de mercado</b> (capitalista) é um sistema económico em que:</p>
  <ul><li>a principal forma de organização económica é a <b>empresa</b>;</li>
  <li>os proprietários privados de <b>bens de capital</b> contratam <b>mão-de-obra</b> para produzir bens e serviços que <b>vendem nos mercados</b> com o objetivo de obter <b>lucro</b>.</li></ul>
  <p>As três instituições principais: <b>propriedade privada</b>, <b>mercados</b> e <b>empresas</b>.</p>
  <div class="tbl-wrap"><table><tr><th>Conceito</th><th>Definição</th></tr>
  <tr><td>Propriedade privada</td><td>O detentor tem o direito de <b>excluir</b> outros da utilização do bem <b>e de o trocar</b>.</td></tr>
  <tr><td>Mercado</td><td>Troca de bens e serviços por <b>transferências diretamente recíprocas</b>, para <b>benefício mútuo</b>. Ao contrário do roubo (não é recíproco nem voluntário) ou da tributação (não é diretamente recíproca).</td></tr>
  <tr><td>Bens de capital</td><td>Recursos para produzir outros bens que <b>não são mão-de-obra</b>, são <b>duráveis</b> e têm <b>custo</b>: equipamentos, edifícios, máquinas.</td></tr></table></div>`,
  key: 'Mercado = troca voluntária e recíproca. Imposto não é troca de mercado: pagas, mas não recebes em troca um bem específico.' },
{ id: 'm-firms', t: 'mkt', title: 'Empresas e o que não é empresa',
  html: `<p>Numa economia de mercado coexistem com as empresas outras formas de organização que <b>não são empresas</b>. O truque é ver qual dos traços da empresa lhes falta (contratar mão-de-obra, capital privado, vender no mercado, lucro):</p>
  <div class="tbl-wrap"><table><tr><th>Organização</th><th>Porque não é empresa</th></tr>
  <tr><td>Produção familiar ou individual</td><td><b>Não contrata</b> terceiros.</td></tr>
  <tr><td>Organização sem fins lucrativos</td><td>O objetivo <b>não é o lucro</b> nem vender o que produz no mercado.</td></tr>
  <tr><td>Cooperativa</td><td>A mão-de-obra <b>não é contratada</b>: o trabalho é feito pelos próprios membros.</td></tr>
  <tr><td>Órgãos governamentais</td><td>Não visam lucro e os bens de capital são <b>propriedade pública</b>.</td></tr></table></div>`,
  key: 'Cooperativa: os membros trabalham, não são contratados. Governo: capital público, sem lucro.' },
{ id: 'm-limits', t: 'mkt', title: 'Limitações da economia de mercado',
  html: `<p>A economia de mercado é eficaz a coordenar a produção, mas tem limitações conhecidas:</p>
  <ul><li><b>Desigualdade</b> na distribuição do rendimento;</li>
  <li><b>(In)sustentabilidade ambiental</b>;</li>
  <li><b>Falhas de mercado</b>: ineficiências económicas, por exemplo <b>externalidades</b> (efeitos sobre terceiros que não passam pelo preço, como a poluição).</li></ul>
  <p>São estas limitações que justificam o <b>papel do Governo</b>: impostos, regulação, bens públicos (o capítulo 2 aprofunda as falhas de mercado).</p>`,
  key: 'Três limitações: desigualdade, ambiente, falhas de mercado (ex.: externalidades).' },

/* ---------------- PROCURA E OFERTA ---------------- */
{ id: 's-demand', t: 'sd', title: 'Curva da procura',
  html: `<p><b>Curva da procura</b> (<i>demand curve</i>): a <b>quantidade total que os consumidores desejam comprar a cada preço</b>. Representa a <b>disposição a pagar</b> (DAP) dos consumidores.</p>
  <ul><li>É <b>decrescente</b>: quanto mais barato, mais se quer comprar.</li>
  <li>Lida ao contrário: para a quantidade Q, a altura da curva é o preço máximo que o consumidor “marginal” (o Q-ésimo) estaria disposto a pagar.</li>
  <li>Ler um gráfico: dado P, vai à horizontal até à curva e desce para ler Q; dado Q, sobe até à curva e lê P.</li></ul>`,
  d: { sd: { r: [20, 12], ln: [{ n: 'D', p: D, c: 'd' }], g: [[8, 6], [4, 8]], pt: [] } },
  key: 'A curva da procura = disposição a pagar. Ao preço 8 compram-se 4 unidades; ao preço 6, 8 unidades.' },
{ id: 's-supply', t: 'sd', title: 'Curva da oferta',
  html: `<p><b>Curva da oferta</b> (<i>supply curve</i>): a <b>quantidade total que as empresas estão dispostas a produzir a cada preço</b>. Representa a <b>disposição a aceitar</b> dos vendedores (o preço mínimo que aceitam, ligado ao seu <b>custo marginal</b>).</p>
  <ul><li>É <b>crescente</b>: a preços mais altos compensa produzir mais (e entram produtores com custos mais altos).</li>
  <li>A altura da curva para a quantidade Q é o preço mínimo que o vendedor da Q-ésima unidade aceita.</li></ul>`,
  d: { sd: { r: [20, 12], ln: [{ n: 'S', p: S, c: 's' }], g: [[8, 6], [12, 8]] } },
  key: 'A curva da oferta = disposição a aceitar (custo marginal). Sobe com a quantidade.' },
{ id: 's-eq', t: 'sd', title: 'Preço de equilíbrio, excesso e escassez',
  html: `<p>Ao <b>preço de equilíbrio</b> P* (<i>market-clearing price</i>) a <b>quantidade oferecida é igual à procurada</b>: o mercado “limpa”, ninguém fica com vontade de trocar sem conseguir.</p>
  <ul><li><b>Preço acima de P*</b>: quantidade oferecida &gt; procurada → <b>excesso de oferta</b>. Os vendedores têm incentivo a <b>baixar</b> o preço.</li>
  <li><b>Preço abaixo de P*</b>: procurada &gt; oferecida → <b>escassez de oferta</b> (excesso de procura). O preço tende a <b>subir</b>.</li>
  <li>Em equilíbrio, nenhum vendedor ganha em mudar o preço: se subir, perde os clientes para quem vende a P*.</li>
  <li>Quantidade transacionada fora do equilíbrio = a <b>menor</b> das duas (ninguém compra o que não quer, ninguém vende o que não quer).</li></ul>
  <p>Exemplo do gráfico: D: P = 10 − 0,5Q e S: P = 2 + 0,5Q. Igualando: 10 − 0,5Q = 2 + 0,5Q → <b>Q* = 8, P* = 6</b>. A P = 8: procura 4, oferta 12 → excesso de oferta de 8.</p>`,
  d: { sd: { r: [20, 12], ln: [{ n: 'D', p: D, c: 'd' }, { n: 'S', p: S, c: 's' }], g: [[8, 6]], pt: [{ q: 8, p: 6, l: 'E' }] } },
  key: '{f:eq|Procura = Oferta} dá o equilíbrio. Acima de P*: excesso de oferta; abaixo: escassez.' },
{ id: 's-shift', t: 'sd', title: 'Deslocações das curvas e movimentos ao longo delas',
  html: `<p>Uma mudança do <b>próprio preço</b> do bem faz um <b>movimento ao longo</b> da curva. Qualquer outro fator faz <b>deslocar a curva</b> inteira (choques exógenos: progresso tecnológico, pandemia, preços de outros bens, rendimento, gostos, políticas).</p>
  <div class="tbl-wrap"><table><tr><th>Choque</th><th>Curva que se desloca</th><th>Efeito em P* e Q*</th></tr>
  <tr><td>Melhor tecnologia, matérias-primas mais baratas, entrada de empresas</td><td>Oferta para a <b>direita</b> (expansão)</td><td>P ↓, Q ↑</td></tr>
  <tr><td>Escassez de matéria-prima, custos mais altos, saída de empresas</td><td>Oferta para a <b>esquerda</b> (contração)</td><td>P ↑, Q ↓</td></tr>
  <tr><td>Substituto fica mais caro, complemento mais barato, mais rendimento (bem normal)</td><td>Procura para a <b>direita</b></td><td>P ↑, Q ↑</td></tr>
  <tr><td>Substituto fica mais barato, complemento mais caro</td><td>Procura para a <b>esquerda</b></td><td>P ↓, Q ↓</td></tr></table></div>
  <p>Exemplo das aulas (pão): melhor tecnologia → 1) a oferta aumenta a cada preço (o preço mínimo exigido por cada quantidade é menor), 2) ao preço antigo há excesso de oferta, 3) o preço desce até ao novo equilíbrio, num <b>movimento ao longo da curva da procura</b>.</p>
  <p><b>Entrada de empresas</b>: se as empresas existentes têm <b>rendas económicas</b> (lucro acima do normal) e os custos de entrada não são altos, outras entram e a oferta desloca-se para a direita.</p>
  <p><b>Cuidado:</b> um custo de produção (escassez de semicondutores, regulação que encarece produzir) mexe na <b>oferta</b>, não na procura. Um preço baixo só diz “a oferta subiu <i>ou</i> a procura desceu”: sem mais dados não se sabe qual.</p>`,
  d: { sd: { r: [20, 12], ln: [{ n: 'D', p: D, c: 'd' }, { n: 'S', p: S, c: 's' }, { n: 'S′', p: [[0, 0], [20, 10]], c: 's', dash: true }], g: [[8, 6], [10, 5]], pt: [{ q: 8, p: 6, l: 'E' }, { q: 10, p: 5, l: 'E′' }] } },
  key: 'Muda o preço do próprio bem → movimento ao longo. Muda outra coisa → a curva desloca-se.' },

/* ---------------- EXCEDENTES ---------------- */
{ id: 'p-surplus', t: 'surp', title: 'Excedente do consumidor, do produtor e total',
  html: `<ul><li><b>Excedente do consumidor (EC)</b>, em €: diferença total entre a <b>disposição a pagar</b> e o <b>preço</b>. Área entre a procura e o preço, até Q* (rosa).</li>
  <li><b>Excedente do produtor (EP)</b>, em €: diferença total entre o <b>preço</b> e o <b>custo marginal</b> (preço mínimo que aceitam). Área entre o preço e a oferta (roxo).</li>
  <li><b>Excedente total = EC + EP</b> = ganhos totais do comércio para a sociedade.</li></ul>
  <p>Com curvas retas, são triângulos: <b>área = base × altura / 2</b>. No exemplo (D: P = 10 − 0,5Q, S: P = 2 + 0,5Q, Q* = 8, P* = 6):</p>
  <ul><li>EC = 8 × (10 − 6) / 2 = <b>16 €</b></li><li>EP = 8 × (6 − 2) / 2 = <b>16 €</b></li><li>Excedente total = <b>32 €</b></li></ul>
  <p>No equilíbrio de mercado concorrencial o excedente total é <b>máximo</b>: qualquer outra quantidade deixa trocas mutuamente vantajosas por fazer (ou faz trocas que custam mais do que valem).</p>`,
  d: { sd: { r: [20, 12], a: [{ p: [[0, 10], [8, 6], [0, 6]], c: 'cs', l: 'EC' }, { p: [[0, 6], [8, 6], [0, 2]], c: 'ps', l: 'EP' }], ln: [{ n: 'D', p: D, c: 'd' }, { n: 'S', p: S, c: 's' }], g: [[8, 6]], pt: [{ q: 8, p: 6, l: 'E' }] } },
  key: '{f:cs|EC = Q* × (Pmáx − P*) / 2}: entre a procura e o preço. {f:ps|EP = Q* × (P* − Pmín) / 2}: entre o preço e a oferta.' },
{ id: 'p-profit', t: 'surp', title: 'Custo marginal, lucro e a quantidade que maximiza o lucro',
  html: `<p><b>Custo marginal</b> = custo de produzir <b>uma unidade adicional</b> (diferente do custo total). <b>Lucro = EP − custos fixos</b>.</p>
  <p>Quando uma empresa escolhe o preço ao longo da sua curva da procura com um <b>custo unitário constante c</b>, o lucro é <b>(P − c) × Q</b>. Calcula-o para cada linha da tabela e escolhe o maior (Caderno 1.1, c = 60 €):</p>
  <div class="tbl-wrap"><table><tr><th class="num">Q</th><th class="num">P</th><th class="num">P − 60</th><th class="num">Lucro</th></tr>
  <tr><td class="num">200</td><td class="num">240</td><td class="num">180</td><td class="num">36 000</td></tr>
  <tr><td class="num">300</td><td class="num">210</td><td class="num">150</td><td class="num">45 000</td></tr>
  <tr><td class="num"><b>400</b></td><td class="num"><b>180</b></td><td class="num"><b>120</b></td><td class="num"><b>48 000</b></td></tr>
  <tr><td class="num">500</td><td class="num">150</td><td class="num">90</td><td class="num">45 000</td></tr>
  <tr><td class="num">800</td><td class="num">60</td><td class="num">0</td><td class="num">0</td></tr>
  <tr><td class="num">900</td><td class="num">30</td><td class="num">−30</td><td class="num">−27 000</td></tr></table></div>
  <p><b>Armadilha:</b> com P = c o lucro é <b>zero</b>, não negativo. Só há prejuízo quando P &lt; c.</p>`,
  key: '{f:profit|Lucro = (P − c) × Q}. P = custo → lucro zero, não prejuízo.' },

/* ---------------- IMPOSTOS ---------------- */
{ id: 'x-tax', t: 'tax', title: 'Impostos deslocam curvas',
  html: `<p>Ao longo da história os Governos usaram impostos para obter <b>receita</b>. Um imposto por unidade sobre os <b>produtores</b> (incidência <b>legal</b> ou fiscal) desloca a <b>oferta para cima</b> no valor do imposto: para cada quantidade, o preço exigido fica mais alto. Sobre os <b>consumidores</b> desloca a <b>procura</b> (para baixo, do ponto de vista do preço que os vendedores recebem).</p>
  <p>Exemplo: imposto de 2 € por unidade sobre os produtores. S: P = 2 + 0,5Q passa a S′: P = 4 + 0,5Q. Novo equilíbrio com D: P = 10 − 0,5Q:</p>
  <ul><li>10 − 0,5Q = 4 + 0,5Q → <b>Q = 6</b></li>
  <li>Preço pago pelos consumidores: <b>7 €</b>. Preço recebido pelos produtores: 7 − 2 = <b>5 €</b>.</li>
  <li>A quantidade transacionada desce de 8 para 6.</li></ul>`,
  d: { sd: { r: [20, 12], ln: [{ n: 'D', p: D, c: 'd' }, { n: 'S', p: S, c: 's' }, { n: 'S+t', p: [[0, 4], [14, 11]], c: 's', dash: true }], g: [[6, 7], [6, 5], [8, 6]], pt: [{ q: 6, p: 7 }, { q: 8, p: 6, l: 'E' }] } },
  key: 'Imposto por unidade = distância vertical entre as curvas. Consumidores pagam mais, produtores recebem menos.' },
{ id: 'x-welfare', t: 'tax', title: 'Efeitos no bem-estar: receita e carga excedente',
  html: `<p>Um imposto <b>reduz os excedentes</b>. A área que antes era EC + EP divide-se em:</p>
  <ul><li><b>EC</b> (rosa) e <b>EP</b> (roxo), mais pequenos;</li>
  <li><b>Receita do Governo</b> (verde) = imposto × quantidade transacionada;</li>
  <li><b>Carga excedente</b> (<i>deadweight loss</i>, DWL, o triângulo amarelo aqui, branco nos slides): a <b>perda de eficiência</b>, o desperdício social das trocas que deixam de se fazer.</li></ul>
  <p>No exemplo (imposto 2 €, Q cai de 8 para 6, P consumidor 7, P produtor 5):</p>
  <ul><li>EC = 6 × (10 − 7) / 2 = 9 € · EP = 6 × (5 − 2) / 2 = 9 €</li>
  <li>Receita = 2 × 6 = 12 € · DWL = (8 − 6) × 2 / 2 = <b>2 €</b></li>
  <li>Verificação: 9 + 9 + 12 + 2 = 32 € = excedente total sem imposto.</li></ul>`,
  d: { sd: { r: [20, 12], a: [{ p: [[0, 10], [6, 7], [0, 7]], c: 'cs', l: 'EC' }, { p: [[0, 7], [6, 7], [6, 5], [0, 5]], c: 'gov', l: 'T' }, { p: [[0, 5], [6, 5], [0, 2]], c: 'ps', l: 'EP' }, { p: [[6, 7], [8, 6], [6, 5]], c: 'dwl' }], ln: [{ n: 'D', p: D, c: 'd' }, { n: 'S', p: S, c: 's' }], g: [[6, 7], [6, 5], [8, 6]] } },
  key: 'Antes = EC + EP. Com imposto = EC′ + EP′ + {f:rev|receita} + {f:dwl|DWL}. A DWL é a perda de eficiência.' },
{ id: 'x-elastic', t: 'tax', title: 'Elasticidade e quem paga o imposto',
  html: `<p><b>Elasticidade</b> = quanto a quantidade reage a uma variação do preço. Procura elástica: os consumidores fogem facilmente (há substitutos). Inelástica: compram quase o mesmo (tabaco, combustível a curto prazo).</p>
  <ul><li>A <b>redução do excedente total</b> (a DWL) está <b>positivamente</b> relacionada com a elasticidade da procura: quanto mais elástica, mais trocas desaparecem e maior a perda.</li>
  <li>A <b>incidência económica</b> (quem suporta de facto o imposto) depende da elasticidade <b>relativa</b> de consumidores e produtores, não de quem o entrega ao Estado: <b>o grupo com menor elasticidade suporta mais carga</b>.</li></ul>
  <p>Por isso a incidência <b>legal</b> (sobre quem a lei põe o imposto) e a <b>económica</b> (quem perde excedente) podem ser diferentes.</p>`,
  key: 'Menos elástico = paga mais. Mais elástica a procura = maior carga excedente.' },
{ id: 'x-use', t: 'tax', title: 'Impostos que aumentam o bem-estar',
  html: `<p>Os impostos podem <b>aumentar o bem-estar social</b> se as receitas financiarem bens e serviços benéficos para a sociedade: <b>educação, saúde, segurança, limpeza dos espaços públicos</b>…</p>
  <p>Também se usam para <b>mudar comportamentos</b>:</p>
  <ul><li><b>Dinamarca, 2011</b>: imposto por kg sobre a gordura saturada, equivalente a cerca de <b>22% do preço médio da manteiga</b>. O consumo de manteiga e produtos relacionados caiu <b>15–20%</b>.</li>
  <li>Em Portugal: imposto sobre as <b>bebidas açucaradas</b>, sobre o <b>tabaco</b>, etc.</li></ul>
  <p>Aqui a descida da quantidade é o <b>objetivo</b> da política, não um efeito indesejado.</p>`,
  key: 'Imposto sobre a manteiga (DK 2011): ~22% do preço, consumo −15 a −20%.' },

/* ---------------- EXAM ---------------- */
{ id: 'e-format', t: 'exam', title: 'Como é a avaliação e o exame',
  html: `<p><b>Nota final = 0,5 × Projeto + 0,5 × Exame</b>.</p>
  <ul><li><b>Projeto de grupo</b> (50% = 40% relatório + 10% apresentação), grupos de 4 do mesmo turno prático. Grupos no Fénix até 13/11/2026; entrega do projeto e dos slides a 13/12/2026 (23h59); apresentações a 15/12 nas práticas.</li>
  <li><b>Exame</b> (50%), época normal a 12 de janeiro, recurso a 28 de janeiro. <b>Nota mínima: 8</b>.</li>
  <li>No recurso, o exame vale 50% se faltaste à época normal (mantém-se o projeto), ou 100% se foste à normal, se não fizeste o projeto, ou se o projeto baixar a nota.</li></ul>
  <p><b>Formato (exames tipo do Fénix):</b> 1h15, sem consulta.</p>
  <ul><li><b>20 perguntas de escolha múltipla</b>: as 1–10 valem 1 valor, as 11–20 valem 0,5. <b>Podem ter mais do que uma certa.</b></li>
  <li>Cotação: todas as certas e só essas → cotação inteira; alguma errada a mais ou alguma certa em falta → <b>metade</b>; só erradas → zero. Opções contraditórias, ou marcar todas sem estarem todas certas → <b>zero</b>.</li>
  <li><b>2 perguntas abertas</b> (2–3 valores cada): uma conta (ex.: PIB nominal com o deflator) e um comentário curto a uma notícia ou tabela, com gráfico quando ajuda (ex.: a descida do IVA das bicicletas e as elasticidades).</li></ul>
  <p>As perguntas do caderno (e do exame) são de três tipos:</p>
  <ul><li><b>Escolha múltipla com “selecione todas as corretas”</b>: pode haver uma, várias ou nenhuma óbvia. Avalia cada opção sozinha.</li>
  <li><b>Verdadeiro / Falso com justificação</b>: aqui treinas o V/F; no exame escreve a razão em 1–2 linhas.</li>
  <li><b>Leitura de gráficos e tabelas</b>: curvas de procura e oferta, excedentes, dados macroeconómicos.</li></ul>`,
  key: 'Mínimo 8 no exame. Em “selecione todas”, decide cada opção como um V/F à parte: uma a mais ou a menos vale metade.' },
]);
})();
