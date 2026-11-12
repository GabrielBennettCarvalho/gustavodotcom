/* Exam style: the chapter 1 exercises of the Caderno de Exercícios (2026/27 P2), with our own figures */
(() => {
// Caderno 1.2: two demand curves. D: P = 6000 − 100Q, D′: P = 8000 − 100Q
const twoD = { sd: { r: [85, 9000], ax: ['Q', 'P (€)'], ln: [{ n: 'D', p: [[0, 6000], [60, 0]], c: 'd' }, { n: 'D′', p: [[0, 8000], [80, 0]], c: 'd', dash: true }], g: [[10, 5000], [30, 3000], [30, 5000], [50, 1000], [70, 1000]] } };
// Caderno 1.3: books, curves cross at (24, 8). D: P = 14 − 0,25Q, S: P = 2 + 0,25Q
const books = { sd: { r: [60, 16], ax: ['Q', 'P ($)'], ln: [{ n: 'D', p: [[0, 14], [56, 0]], c: 'd' }, { n: 'S', p: [[0, 2], [48, 14]], c: 's' }], g: [[24, 8], [16, 10], [32, 10]], pt: [{ q: 24, p: 8, l: 'E' }] } };
// Caderno 1.4: bread, 5 000 units a day at €2
const bread = { sd: { r: [10, 4], ax: ['Q (milhares/dia)', 'P (€)'], ln: [{ n: 'D', p: [[0, 3.5], [10, 0.5]], c: 'd' }, { n: 'S', p: [[0, 0.5], [9, 3.2]], c: 's' }], g: [[5, 2]], pt: [{ q: 5, p: 2, l: 'E' }] } };
STUDY.questions('ieco', [
{ id: 'ex-01', t: 'exam', l: 3, les: 's-demand', calc: true, d: twoD, a: [0, 2], src: 'Caderno 1.2 (adaptado)',
  q: 'O gráfico mostra duas curvas da procura: D (P = 6 000 − 100Q) e D′ (P = 8 000 − 100Q). Quais das afirmações estão corretas?',
  o: ['Na curva D, ao preço 5 000 €, a empresa vende 10 unidades', 'Na curva D′, ao preço 3 000 €, a empresa vende 70 unidades', 'A 1 000 €, vende mais 20 unidades em D′ do que em D', 'Com 30 unidades, cobra mais 1 000 € em D′ do que em D'],
  e: 'D a 5 000: 6 000 − 100Q = 5 000 → **Q = 10** ✓. D′ a 3 000: Q = 50, não 70 ✗. A 1 000: D dá 50 e D′ dá 70, **mais 20** ✓. Com 30 unidades: D cobra 3 000 e D′ cobra 5 000, a diferença é **2 000** ✗.' },
{ id: 'ex-02', t: 'exam', l: 3, les: 's-eq', d: books, a: [2], src: 'Caderno 1.3 (adaptado)',
  q: 'O gráfico mostra a procura e a oferta de um livro, que se cruzam em (Q*, P*) = (24, 8). Quais das afirmações estão corretas?',
  o: ['A 10 $ há excesso de procura do livro', 'A 8 $ alguns vendedores querem subir o preço para 9 $', 'A 8 $ o mercado está em equilíbrio', 'No total, serão vendidos 40 livros'],
  e: 'A 10 $ procuram-se 16 e oferecem-se 32: é **excesso de oferta** ✗. A 8 $ estamos em **equilíbrio** ✓, e ninguém ganha em subir o preço (perderia os clientes para quem vende a 8) ✗. Vendem-se **24** livros, não 40 ✗.' },
{ id: 'ex-03', t: 'exam', l: 3, les: 's-shift', d: bread, src: 'Caderno 1.4 (adaptado)',
  q: 'O mercado do pão estava em equilíbrio com 5 000 unidades por dia a 2 €. Um ano depois, o preço de equilíbrio é 1,50 €. O que se pode concluir?',
  o: ['A descida foi causada por uma contração da procura', 'A descida foi causada por uma contração da oferta', 'Pode ter sido causada pelo movimento de qualquer das curvas', 'Ao novo preço de 1,50 € há excesso de procura'], a: 2,
  e: 'Um preço mais baixo resulta de **procura que contrai** ou de **oferta que expande**: só com o preço não se distingue (a quantidade ajudaria). A contração da oferta subiria o preço. E 1,50 € é o novo equilíbrio, sem excesso de procura.' },
{ id: 'ex-04', t: 'exam', l: 3, les: 's-shift', a: [2], src: 'Caderno 1.5',
  q: 'Que fatores podem causar uma contração da procura de veículos elétricos?',
  o: ['Um aumento do preço do gasóleo', 'Uma escassez de semicondutores', 'Uma descida do preço dos carros a gasóleo', 'Políticas que encarecem a produção'],
  e: 'Carros a gasóleo mais baratos são um **substituto mais barato**: a procura de elétricos contrai ✓. Gasóleo mais caro faz o contrário (a procura expande). Semicondutores e custos de produção mexem na **oferta**, não na procura.' },
{ id: 'ex-05', t: 'exam', l: 4, les: 's-shift', a: [1], src: 'Caderno 1.6',
  q: 'A manteiga e a margarina são bens substitutos. A produção de manteiga torna-se mais eficiente. O que se espera no mercado da margarina?',
  o: ['A curva da procura desloca-se para a direita', 'A curva da procura desloca-se para a esquerda', 'A curva da oferta desloca-se para a direita', 'A curva da oferta desloca-se para a esquerda'],
  e: 'Manteiga mais eficiente → oferta de manteiga ↑ → manteiga **mais barata** → quem comprava margarina passa para a manteiga: a **procura de margarina desloca-se para a esquerda** ✓. Nada mudou nos custos da margarina, por isso a sua oferta fica igual.' },
{ id: 'ex-06', t: 'exam', l: 4, les: 'm-firms', a: [0, 3],
  q: 'Quais destas organizações são empresas no sentido da cadeira?',
  o: ['Uma startup que contrata programadores para vender software', 'Uma cooperativa agrícola em que só trabalham os sócios', 'Um hospital público do Serviço Nacional de Saúde', 'Uma padaria que contrata dois padeiros e vende pão'],
  e: 'Empresa = capital privado + **mão-de-obra contratada** + venda no mercado com **lucro**. A startup e a padaria cumprem tudo ✓. Na cooperativa trabalham os membros; o hospital público tem capital público e não visa lucro.' },
{ id: 'ex-07', t: 'exam', l: 4, les: 'x-welfare', a: [0, 2],
  q: 'Sobre um imposto por unidade num mercado concorrencial, quais são verdadeiras?',
  o: ['Reduz a quantidade transacionada', 'Não altera o excedente do consumidor', 'Cria uma carga excedente (perda de eficiência)', 'É sempre suportado por quem a lei designa'],
  e: 'O imposto **reduz a quantidade** e **cria carga excedente** ✓. O EC diminui (os consumidores pagam mais). Quem o suporta de facto depende das **elasticidades**, não da incidência legal.' },
{ id: 'ex-08', t: 'exam', l: 4, les: 'e-gov', a: [1, 3], src: 'Caderno 2.14 (adaptado)',
  q: 'Plantações usam pesticidas que contaminam rios e prejudicam pescadores. Quais destas afirmações são verdadeiras?',
  o: ['A negociação entre as partes resolve sempre a ineficiência', 'O preço dos pesticidas não reflete provavelmente o custo social', 'Reduzir os voos com um imposto é um efeito ineficiente desse imposto', 'Fazer os poluidores pagar é uma das boas políticas para a externalidade'],
  e: 'Negociar **nem sempre** resulta (custos de transação, falta de informação) ✗. O preço só reflete o CMP, não o CME ✓. Menos voos é o **objetivo** de taxar voos ✗. O poluidor-pagador internaliza o custo ✓ (com os limites de justiça e eficácia).' },
{ id: 'ex-09', t: 'exam', l: 4, les: 'f-goods', a: [2, 3], src: 'Caderno 2.8 (adaptado)',
  q: 'Quais destes bens (ou males) são rivais?',
  o: ['Uma aula teórica aberta e gratuita, com lugares livres', 'O barulho dos aviões perto de um aeroporto', 'Uma floresta usada para cortar madeira', 'Os lugares sentados num teatro'],
  e: 'A aula com lugares livres e o barulho são **não-rivais** (mais uma pessoa não tira nada aos outros; o barulho é um mal público). A madeira cortada e o lugar ocupado já não estão disponíveis para os outros: **rivais** (a floresta é um bem comum, o teatro um bem privado).' },
]);
})();
