/* ===== 2nd test: UML lessons (slides AMS 2026, 05–07 "Object Oriented Modeling") ===== */
(() => {
const U = (d, cap) => `<div class="diagram">${UML.render(d)}</div>${cap ? `<p class="muted" style="font-size:13px;margin-top:4px">${cap}</p>` : ''}`;

/* --- small diagrams reused by the lessons --- */
const drink = { kind: 'uc', w: 560, h: 330, alt: 'Casos de utilização da Drink Machine', sys: { x: 120, y: 10, w: 300, h: 310, lb: 'Drink Machine' }, nodes: [
  { id: 'Cust', k: 'actor', x: 50, y: 60, lb: 'Customer' }, { id: 'Sup', k: 'actor', x: 50, y: 170, lb: 'Supplier Agent' }, { id: 'Col', k: 'actor', x: 50, y: 280, lb: 'Collector' },
  { id: 'Buy', k: 'uc', x: 230, y: 60, lb: 'Buy Drink' }, { id: 'Refill', k: 'uc', x: 230, y: 170, lb: 'Refill Drinks' }, { id: 'Take', k: 'uc', x: 230, y: 280, lb: 'Take Money from the Machine', w: 150 } ],
  edges: [{ id: 'a1', a: 'Cust', b: 'Buy' }, { id: 'a2', a: 'Sup', b: 'Refill' }, { id: 'a3', a: 'Col', b: 'Take' }] };
const incExt = { kind: 'uc', w: 600, h: 250, alt: 'Include, extend e generalização', sys: { x: 100, y: 8, w: 480, h: 236, lb: 'ATM' }, nodes: [
  { id: 'C', k: 'actor', x: 44, y: 70, lb: 'Cliente' }, { id: 'V', k: 'actor', x: 44, y: 195, lb: 'Cliente VIP' },
  { id: 'Bal', k: 'uc', x: 220, y: 70, lb: 'Consultar saldo' }, { id: 'Pay', k: 'uc', x: 220, y: 175, lb: 'Fazer pagamento' },
  { id: 'Val', k: 'uc', x: 460, y: 120, lb: 'Validar utilizador' }, { id: 'Rec', k: 'uc', x: 440, y: 215, lb: 'Imprimir recibo', w: 120 } ],
  edges: [{ id: 'a1', a: 'C', b: 'Bal' }, { id: 'a2', a: 'C', b: 'Pay' }, { id: 'g', k: 'gen', a: 'V', b: 'C' },
    { id: 'i1', k: 'include', a: 'Bal', b: 'Val' }, { id: 'i2', k: 'include', a: 'Pay', b: 'Val' }, { id: 'x1', k: 'extend', a: 'Rec', b: 'Pay' }] };
const mult = { kind: 'cls', w: 560, h: 120, alt: 'Associação com multiplicidades e papéis', nodes: [
  { id: 'M', lb: 'Máquina', x: 30, y: 40, w: 110 }, { id: 'F', lb: 'Fornecedor', x: 400, y: 40, w: 120 } ],
  edges: [{ id: 'e', a: 'M', b: 'F', ma: '1..*', mb: '1', lb: 'fornecida por ▶', rb: '+fornecedor' }] };
const aclass = { kind: 'cls', w: 560, h: 200, alt: 'Classe-associação Emprego', nodes: [
  { id: 'P', lb: 'Pessoa', x: 30, y: 30, attrs: ['nome: String'] }, { id: 'E', lb: 'Empresa', x: 400, y: 30, attrs: ['nif: String'] },
  { id: 'J', lb: 'Emprego', x: 210, y: 120, attrs: ['salário: Custo', 'dataInício: Data'] } ],
  edges: [{ id: 'e', a: 'P', b: 'E', ma: '*', mb: '*' }, { id: 'ac', k: 'aclass', of: 'e', b: 'J' }] };
const parts = { kind: 'cls', w: 600, h: 230, alt: 'Generalização, agregação e composição', nodes: [
  { id: 'An', lb: 'Animal', x: 40, y: 20 }, { id: 'Bi', lb: 'Ave', x: 10, y: 150 }, { id: 'Fi', lb: 'Peixe', x: 110, y: 150 },
  { id: 'Eq', lb: 'Equipa', x: 260, y: 20 }, { id: 'Em', lb: 'Empregado', x: 250, y: 150 },
  { id: 'Ca', lb: 'Carro', x: 450, y: 20 }, { id: 'Mo', lb: 'Motor', x: 450, y: 150 } ],
  edges: [{ id: 'g1', k: 'gen', a: 'Bi', b: 'An' }, { id: 'g2', k: 'gen', a: 'Fi', b: 'An' },
    { id: 'ag', k: 'aggr', a: 'Eq', b: 'Em', ma: '0..*', mb: '1..*' }, { id: 'co', k: 'comp', a: 'Ca', b: 'Mo', ma: '0..1', mb: '1' }] };
const types = { kind: 'cls', w: 600, h: 170, alt: 'Classe com atributos, enumeração e data type', nodes: [
  { id: 'B', lb: 'Bilhete', x: 20, y: 30, attrs: ['custo: Custo', 'estado: Estado'] },
  { id: 'Es', lb: 'Estado', st: 'enumeration', x: 230, y: 20, lits: ['disponível', 'reservado', 'pago', 'indisponível'] },
  { id: 'Da', lb: 'Data', st: 'dataType', x: 410, y: 20, attrs: ['dia: Dia', 'hora: Hora'] } ], edges: [] };
const objs = { kind: 'cls', w: 620, h: 250, alt: 'Classes e um diagrama de objetos', nodes: [
  { id: 'P', lb: 'Person', x: 20, y: 20, attrs: ['name'] }, { id: 'C', lb: 'Car', x: 240, y: 20, attrs: ['model', 'licence', 'color'] }, { id: 'E', lb: 'Engine', x: 460, y: 20, attrs: ['number', 'power', 'fuel'] },
  { id: 'm', lb: 'Maria : Person', obj: true, x: 10, y: 150, attrs: ['name = “Maria”'] }, { id: 'c', lb: 'MyCar : Car', obj: true, x: 220, y: 150, attrs: ['model = A9 Tdi', 'licence = 99-99-MM', 'color = red'] },
  { id: 'e', lb: ': Engine', obj: true, x: 450, y: 150, attrs: ['number = 9999', 'power = 190hp', 'fuel = diesel'] } ],
  edges: [{ id: 'pc', a: 'P', b: 'C', ma: '0..1', mb: '*', lb: 'owns ▶' }, { id: 'ce', k: 'comp', a: 'C', b: 'E', ma: '0..1', mb: '1' },
    { id: 'l1', a: 'm', b: 'c', lb: 'owns ▶' }, { id: 'l2', a: 'c', b: 'e' }] };
const lamp = { kind: 'stm', w: 520, h: 150, title: 'Lâmpada', alt: 'Máquina de estados de uma lâmpada', nodes: [
  { id: 'i', k: 'init', x: 40, y: 85 }, { id: 'Off', k: 'state', x: 150, y: 85, lb: 'Apagada' }, { id: 'On', k: 'state', x: 400, y: 85, lb: 'Acesa' } ],
  edges: [{ id: 't0', a: 'i', b: 'Off' }, { id: 't1', a: 'Off', b: 'On', lb: 'ligar', as: 'r', ao: -0.25, bs: 'l', bo: -0.25 }, { id: 't2', a: 'On', b: 'Off', lb: 'desligar', as: 'l', ao: 0.25, bs: 'r', bo: 0.25, ly: 112 },
    { id: 't3', a: 'On', b: 'On', self: 'r', lb: 'ligar' }] };
const car = { kind: 'stm', w: 580, h: 300, title: 'Carro de aluguer', alt: 'Máquina de estados do carro de aluguer', nodes: [
  { id: 'i', k: 'init', x: 500, y: 40 }, { id: 'Av', k: 'state', x: 80, y: 150, lb: 'Disponível' }, { id: 'Tr', k: 'state', x: 270, y: 60, lb: 'EmTransferência' },
  { id: 'Ch', k: 'state', x: 490, y: 150, lb: 'EmPreparação', w: 120 }, { id: 'Use', k: 'state', x: 270, y: 245, lb: 'EmUso' }, { id: 'f', k: 'final', x: 80, y: 260 } ],
  edges: [{ id: 't0', a: 'i', b: 'Ch', lb: 'compra' }, { id: 't1', a: 'Av', b: 'Tr', lb: 'transferência', as: 't', bs: 'l', via: [[80, 60]] },
    { id: 't2', a: 'Tr', b: 'Ch', lb: 'receção', as: 'r', bs: 't', bo: -0.25, via: [[460, 60]] }, { id: 't3', a: 'Av', b: 'Ch', lb: 'levadoParaRevisão', as: 'r', ao: -0.2, bs: 'l', bo: -0.2 },
    { id: 't4', a: 'Ch', b: 'Av', lb: 'carroPronto', as: 'l', ao: 0.2, bs: 'r', bo: 0.2, ly: 172 }, { id: 't5', a: 'Av', b: 'Use', lb: 'levantamento', as: 'b', ao: 0.3, bs: 'l', via: [[110, 245]] },
    { id: 't6', a: 'Use', b: 'Ch', lb: 'devolução', as: 'r', bs: 'b', via: [[490, 245]] }, { id: 't7', a: 'Av', b: 'f', lb: 'venda' }] };
const pseudo = { kind: 'stm', w: 600, h: 140, alt: 'Pseudoestados', nodes: [
  { id: 'i', k: 'init', x: 40, y: 50, lb: 'inicial' }, { id: 'f', k: 'final', x: 130, y: 50, lb: 'final' }, { id: 'c', k: 'choice', x: 220, y: 50, lb: 'choice' },
  { id: 'j', k: 'junction', x: 310, y: 50, lb: 'junction' }, { id: 'h', k: 'hist', x: 400, y: 50, lb: 'history' }, { id: 't', k: 'term', x: 490, y: 50, lb: 'terminate' },
  { id: 's', k: 'state', x: 300, y: 112, lb: 'Estado', acts: ['entry / acender luz', 'do / monitorizar', 'exit / apagar luz'], w: 170, h: 64 } ], edges: [] };
const atm = { kind: 'seq', w: 560, title: 'Validar utilizador', alt: 'Diagrama de sequência do caso Validar utilizador', lines: [{ id: 'C', lb: 'Cliente', actor: true }, { id: 'A', lb: ':ATM' }, { id: 'B', lb: ':Banco' }],
  msgs: [{ id: 'm1', a: 'C', b: 'A', lb: 'inserirCartão()' }, { id: 'm2', a: 'C', b: 'A', lb: 'introduzirPIN(pin)' }, { id: 'm3', a: 'A', b: 'B', lb: 'verificar(cartão, pin)' }, { id: 'm4', a: 'B', b: 'A', k: 'reply', lb: 'resultado' },
    { id: 'm5', a: 'A', b: 'C', k: 'reply', lb: 'cliente reconhecido' }, { id: 'm6', a: 'A', b: 'C', k: 'reply', lb: 'ejetar cartão' }],
  frags: [{ id: 'f', op: 'alt', from: 'm5', to: 'm6', g: '[PIN válido]', else: [{ at: 'm6', g: '[else]' }] }] };
const frags = { kind: 'seq', w: 560, alt: 'Fragmentos combinados opt e loop', lines: [{ id: 'R', lb: ':Secretaria' }, { id: 'A', lb: ':Contas' }, { id: 'T', lb: ':Turma' }],
  msgs: [{ id: 'm1', a: 'R', b: 'A', lb: 'dívida(aluno)' }, { id: 'm2', a: 'A', b: 'R', k: 'reply', lb: 'valor' }, { id: 'm3', a: 'R', b: 'T', lb: 'inscrever(aluno)' },
    { id: 'm4', a: 'R', b: 'T', lb: 'enviarHorário(aluno)' }],
  frags: [{ id: 'f1', op: 'opt', from: 'm3', to: 'm3', g: '[valor = 0]' }, { id: 'f2', op: 'loop', from: 'm4', to: 'm4', g: '[para cada disciplina]' }] };

STUDY.lessons('ams', [
/* ---------------- UML & OO ---------------- */
{ id: 'uml-domain', t: 'uml', title: 'Sistemas, estado e domínio',
  html: `<p>Um sistema de informação faz três coisas com o seu domínio: <b>memorizar</b> (guardar uma representação do seu estado), <b>informar</b> (dar informação sobre esse estado) e <b>agir</b> (mudar esse estado).</p>
  <p>O <b>domínio</b> de um sistema é o conjunto de <b>objetos</b> e das <b>relações</b> entre eles, classificados em <b>conceitos</b>. Numa loja há os conceitos cliente, produto e venda; num dado momento há objetos que são clientes, objetos que são produtos e ligações que dizem quem comprou o quê. O <b>estado do domínio</b> num instante é o conjunto das instâncias que existem nesse instante.</p>
  <ul><li>O <b>modelo de domínio</b> é a conceptualização (a classificação) do domínio. Em UML desenha-se como <b>diagrama de classes</b>.</li>
  <li>Um <b>domínio</b> concreto, os objetos de um instante, desenha-se como <b>diagrama de objetos</b>.</li>
  <li>O estado não muda de qualquer maneira: só as mudanças permitidas, os <b>eventos de domínio</b>. Os tipos de factos são o <b>esquema estrutural</b>; os eventos são a parte mais importante do <b>esquema comportamental</b>.</li></ul>
  <p><b>Orientação a objetos</b>: pensar o mundo como objetos que interagem e <b>classificá-los</b>. Classificar é abstrair: muitos objetos passam a ser instâncias de uma classe. E as classes definem-se sempre segundo o interesse de quem observa, tal como um sistema só existe para quem tem uma concern.</p>
  <p>Analogia: a planta de um condomínio (classes: Apartamento, Garagem, Condómino) é o modelo de domínio; a fotografia de hoje, com quem mora em que apartamento, é o domínio.</p>`,
  key: 'Modelo de domínio = classes (diagrama de classes). Domínio num instante = objetos (diagrama de objetos). O que o faz mudar são eventos (comportamento).' },
{ id: 'uml-lang', t: 'uml', title: 'UML: a linguagem e os seus diagramas',
  html: `<p>A <b>UML</b> (Unified Modeling Language) é uma linguagem de modelação de propósito geral, focada na engenharia de software, com uma notação gráfica para modelos visuais de sistemas com muito software. É fortemente orientada a objetos. É mantida pela <b>OMG</b> (UML 2.5.1, 2017); a UML 2.4.1 é também a norma <b>ISO/IEC 19505</b>. A SysML deriva dela.</p>
  <p>A especificação UML 2.x tem <b>quatro partes</b>: <b>Superstructure</b> (notação e semântica dos diagramas), <b>Infrastructure</b> (o metamodelo de base), <b>OCL</b> (regras sobre os elementos) e <b>Diagram Interchange</b> (troca de layouts entre ferramentas).</p>
  <div class="tbl-wrap"><table><tr><th>Structure Diagrams</th><th>Behavior Diagrams</th></tr>
  <tr><td>Class, <b>Object</b>, Component, Composite Structure, Deployment, Package</td><td><b>Use Case</b>, Activity, <b>State Machine</b>, e os <b>Interaction Diagrams</b>: <b>Sequence</b>, Communication, Interaction Overview, Timing</td></tr></table></div>
  <p>Armadilhas de Grupo I: o <b>diagrama de objetos</b> é de <b>estrutura</b> (mostra instâncias, não comportamento); o <b>diagrama de casos de utilização</b> é de <b>comportamento</b> (o que o sistema faz), apesar de não ter tempo nem ordem; o diagrama de sequência é um <b>Interaction Diagram</b>, que por sua vez é um Behavior Diagram.</p>
  <p>Na AMS os que contam para produzir são quatro: <b>casos de utilização</b>, <b>classes</b> (com objetos para validar), <b>máquina de estados</b> e <b>sequência</b>.</p>`,
  key: 'Estrutura: classes, objetos, componentes, composite structure, deployment, packages. Comportamento: casos de uso, atividades, máquinas de estados e interações.' },
{ id: 'uml-obj', t: 'uml', title: 'Instâncias e diagramas de objetos',
  html: `<p>Uma <b>instância</b> é uma manifestação concreta de um conceito, e tem estado. Em UML:</p>
  <ul><li>a instância de uma <b>classe</b> é um <b>objeto</b>;</li><li>a instância de uma <b>associação</b> é um <b>link</b>;</li><li>a instância de um <b>caso de utilização</b> é um <b>cenário</b>.</li></ul>
  <p>Um objeto escreve-se <b><u>nome : Classe</u></b>, sublinhado (<u>Maria : Person</u>; <u>: Engine</u> é um objeto anónimo). Os valores dos seus atributos num momento são o <b>estado</b> do objeto, e esse estado muda quando o objeto interage com outros.</p>
  ${U(objs, 'Em cima as classes (o modelo de domínio); em baixo um diagrama de objetos: a Maria tem o carro MyCar, com um motor diesel de 190 hp.')}
  <p>Um <b>diagrama de objetos</b> mostra instâncias e os seus links num instante. Serve para <b>validar um diagrama de classes</b> com casos concretos: se um cenário real não cabe nas classes e multiplicidades, o modelo está errado. Foi assim que os slides apanharam o erro do carro com dois carros ligados ao mesmo motor.</p>
  <p>Que estados pode ter um objeto? Os que os valores dos seus atributos permitem: uma lâmpada com <i>Status: {On, Off}</i> tem dois; uma pessoa com <i>Status: {married, single, divorced}</i> e <i>Work: {employed, unemployed}</i> tem seis combinações.</p>`,
  key: 'Objeto = instância de classe (nome : Classe, sublinhado); link = de associação; cenário = de caso de uso. O diagrama de objetos valida o de classes.' },
{ id: 'uml-ocl', t: 'uml', title: 'OCL: restrições sobre os modelos',
  html: `<p>A <b>OCL</b> (Object Constraint Language) é uma linguagem formal de <b>especificação</b> para escrever expressões sobre modelos UML. Diz <b>o quê</b>, nunca <b>como</b>: não tem fluxo de controlo e avaliar uma expressão OCL não muda nada no modelo (devolve só um valor).</p>
  <div class="tbl-wrap"><table><tr><th>Restrição</th><th>Quando tem de ser verdade</th><th>Exemplo</th></tr>
  <tr><td><b>Invariant</b> (inv)</td><td>Sempre</td><td><code>context Transaction inv: points >= 0</code></td></tr>
  <tr><td><b>Precondition</b> (pre)</td><td>Antes de uma operação</td><td><code>context Account::withdraw(value: Real) pre: value <= actualValue</code></td></tr>
  <tr><td><b>Postcondition</b> (post)</td><td>No fim da operação</td><td><code>post: actualValue = actualValue@pre - value</code></td></tr>
  <tr><td><b>Guard</b></td><td>Para uma transição de estado acontecer</td><td><code>[saldo >= valor]</code></td></tr></table></div>
  <p><code>@pre</code> é o valor antes da operação e <code>result</code> é o valor devolvido. Tipos usuais: Integer, Real, String, Boolean; operadores <code>and or xor not implies</code>, <code>if then else endif</code>.</p>
  <p>Exemplo de uso num modelo de domínio: “cada evento tem 50 bilhetes especiais” pode ficar como multiplicidade, mas “a capacidade mínima é menor que a máxima” só cabe numa invariante: <code>context PacoteFormação inv: capMin <= capMax</code>.</p>`,
  key: 'OCL especifica sem executar. inv: sempre; pre: antes; post: depois (@pre, result); guard: para disparar uma transição.' },
{ id: 'uml-comp', t: 'uml', title: 'Componentes e SysML (blocos e portos)',
  html: `<p>Um <b>diagrama de componentes</b> mostra como o software se organiza em <b>componentes</b> e como dependem uns dos outros. Um componente é uma parte modular com uma responsabilidade definida (autenticação, pagamentos, armazenamento). Expõe <b>interfaces fornecidas</b> (os serviços que oferece, o “chupa-chupa”) e <b>interfaces requeridas</b> (os serviços de que precisa, o “encaixe”). Foca a organização do software, não a ordem das atividades nem as máquinas físicas (isso é o deployment).</p>
  <p><b>SysML</b> é a variante da UML para engenharia de sistemas (hardware, software, pessoas):</p>
  <ul><li>as classes passam a <b>blocks</b>, definidos num <b>bdd</b> (Block Definition Diagram): é aí que se representam os elementos estruturais;</li>
  <li>o <b>ibd</b> (Internal Block Diagram) mostra o interior de um bloco: as suas <b>parts</b> (concretizações dos blocos) e as <b>ligações concretas</b> entre elas;</li>
  <li>os pontos de entrada e saída de um bloco são <b>ports</b>;</li>
  <li>um algoritmo ou função desenha-se com um <b>activity diagram</b>, e o comportamento de um bloco ao longo do tempo com uma <b>state machine</b>.</li></ul>
  <p>Analogia: o bdd é o catálogo de peças de uma bicicleta (quadro, roda, travão); o ibd é a bicicleta montada, com a roda da frente ligada ao garfo, e os portos são os encaixes.</p>`,
  key: 'Componente: interfaces fornecidas e requeridas. SysML: block no bdd; parts e ligações no ibd; port = entrada/saída; algoritmo = activity; tempo = state machine.' },
{ id: 'uml-beh', t: 'uml', title: 'Outros diagramas de comportamento',
  html: `<p><b>Diagrama de atividades</b>: a sequência válida de atividades de uma ou mais entidades, com <b>fluxo de controlo</b> e <b>fluxo de dados</b>. Serve para algoritmos, cenários de casos de uso e processos de negócio (era o que se usava antes do BPMN).</p>
  <ul><li>nó inicial ● e final ◉ (activity final acaba tudo; flow final ⊗ acaba só aquele fluxo);</li>
  <li>decisão e merge: losango com condições <i>[com alguém]</i> / <i>[sozinho]</i>;</li>
  <li>fork e join: barra grossa (paralelismo e sincronização);</li>
  <li><b>partitions</b> (swimlanes) dizem quem executa: Passageiro, Equipa de terra, Avião.</li></ul>
  <p><b>Diagrama de comunicação</b>: o mesmo que um diagrama de sequência simples, sem fragmentos combinados; as mensagens são numeradas (1: sendOrder(), 2: confirm()) em vez de ordenadas no tempo. Um converte-se no outro.</p>
  <p><b>Interaction overview</b>: um fluxo de controlo em que cada nó é uma interação (uma referência a um sd, cd ou td). Parece um diagrama de atividades, mas não é o mesmo.</p>
  <p><b>Timing diagram</b>: como um ou mais objetos mudam de estado ao longo do tempo, com restrições temporais (atraso, duração, frequência).</p>`,
  key: 'Atividades: controlo e dados, decisões, fork/join, swimlanes. Comunicação = sequência sem fragmentos. Overview: nós são interações. Timing: estados no tempo.' },

/* ---------------- USE CASES ---------------- */
{ id: 'uc-basics', t: 'uc', title: 'Casos de utilização: atores, casos e fronteira',
  html: `<p>O <b>diagrama de casos de utilização</b> é um diagrama de comportamento que mostra <b>o que</b> o sistema faz para quem o usa, nunca <b>como</b>: é um modelo <b>black-box</b>.</p>
  ${U(drink, 'A máquina de bebidas dos slides: três atores, três casos.')}
  <ul><li><b>Fronteira</b> (subject): o retângulo com o nome do sistema. Casos dentro, atores fora.</li>
  <li><b>Ator</b>: um <b>papel</b> que um utilizador desempenha no sistema (a mesma pessoa pode ter vários papéis), ou um <b>sistema externo</b> que interage com o sistema (o sistema de pagamentos PG). Um ator tem objetivos que o sistema ajuda a cumprir.</li>
  <li><b>Caso de utilização</b>: uma funcionalidade com valor para um ator, uma elipse com verbo + nome (“Comprar bebida”).</li>
  <li><b>Associação</b> ator–caso: uma linha simples. É a única relação entre um ator e um caso.</li></ul>
  <p><b>Ator primário</b>: tem o objetivo do caso ou despoleta a ação que leva a ele. <b>Ator de suporte</b>: fornece ou recebe informação ou serviços (o cliente que recebe a fatura que o operador envia). Todo o caso tem pelo menos o seu ator primário.</p>
  <p>Analogia: o menu de um restaurante. Diz o que podes pedir e a quem se destina, mas não mostra a cozinha.</p>`,
  key: 'Atores fora (papéis ou sistemas externos), casos dentro da fronteira, ligados por associação. O quê, nunca o como.' },
{ id: 'uc-rel', t: 'uc', title: 'Include, extend e generalização',
  html: `${U(incExt, 'Consultar saldo e Fazer pagamento incluem sempre Validar utilizador; Imprimir recibo estende, opcionalmente, Fazer pagamento; o Cliente VIP é um Cliente.')}
  <ul><li><b>«include»</b>: o caso de origem <b>incorpora sempre</b> o comportamento do caso de destino. É uma delegação: o comportamento incluído é <b>obrigatório</b> no âmbito do caso de origem, e escrito uma vez só (reutilização). Seta tracejada da <b>base</b> para o <b>incluído</b>.</li>
  <li><b>«extend»</b>: o caso de origem <b>acrescenta</b> comportamento ao caso de destino num ponto de extensão. Serve para o que é <b>opcional</b>, alternativo ou só acontece em certas <b>condições</b>. Seta tracejada da <b>extensão</b> para a <b>base</b>.</li>
  <li><b>Generalização</b>: entre atores (o Cliente VIP herda tudo o que o Cliente faz e pode ter mais) ou entre casos (Validar por password e Validar por smartcard são tipos de Validar utilizador). Triângulo vazio no pai.</li></ul>
  <p><b>Truque para as setas</b>: lê a seta como uma frase. <i>Fazer pagamento → «include» → Validar utilizador</i>: “para fazer um pagamento, valido sempre”. <i>Imprimir recibo → «extend» → Fazer pagamento</i>: “imprimir recibo acrescenta-se, às vezes, a fazer pagamento”. A base nunca depende do extend; depende sempre do include.</p>
  <p>Nos slides da máquina de bebidas: <i>Refill Drinks</i> inclui <i>Open Machine</i> e <i>Close Machine</i>; <i>Add drinks according most sold drinks</i> estende <i>Refill Drinks</i> no ponto de extensão “Fill drinks”.</p>`,
  key: 'include: base → incluído, sempre (obrigatório, reutilizado). extend: extensão → base, opcional ou condicional. Generalização entre atores ou entre casos.' },
{ id: 'uc-scen', t: 'uc', title: 'Cenários e descrição textual',
  html: `<p>O diagrama diz que casos existem; o detalhe de cada caso está na sua <b>descrição textual</b>, feita de <b>cenários</b>. Um cenário é uma sequência de ações que detalha parte da funcionalidade do caso: é uma <b>instância</b> do caso de utilização. Há sempre um <b>cenário principal</b> e normalmente vários <b>alternativos</b>.</p>
  <p>Exemplo dos slides, <i>Validar utilizador</i> num ATM:</p>
  <ol><li>O sistema pede o cartão.</li><li>O cliente introduz o cartão e o PIN.</li><li>Carrega em Enter.</li><li>O sistema lê o PIN e o cartão e verifica-os.</li><li>Se o PIN é válido, o cliente é reconhecido e o caso termina.</li></ol>
  <ul><li><b>Alternativo 1</b> (3a): o cliente cancela a qualquer momento; o caso recomeça e nada muda na conta.</li>
  <li><b>Alternativo 2</b>: PIN inválido, o cartão é ejetado e o caso recomeça; à 3.ª vez seguida o ATM captura o cartão e bloqueia 60 segundos.</li></ul>
  <p>Um modelo (template) típico: <b>id e nome</b> (UC-8: Search and Replace), <b>sumário</b>, <b>rationale</b>, <b>atores</b>, <b>pré-condições</b> (um documento está aberto), <b>curso básico</b>, <b>caminhos alternativos</b> e <b>pós-condições</b>.</p>
  <p>É desta descrição que sai o <b>diagrama de sequência</b> de um caso: cada passo do cenário vira uma mensagem.</p>`,
  key: 'Cenário = instância de um caso de uso: um principal e vários alternativos. A descrição textual (template) dá o detalhe que o diagrama não tem.' },
{ id: 'uc-guide', t: 'uc', title: 'Boas regras: nomes, atores e tamanho',
  html: `<p><b>Nomes dos casos</b>:</p>
  <ul><li><b>verbo no infinitivo + nome</b>, na voz ativa, a dizer o objetivo do ator: “Aprovar faturas”, “Registar pagamento”;</li>
  <li><b>verbos fortes</b> (criar, atualizar, calcular, enviar, migrar) em vez de fracos (fazer, usar, processar, gerir, organizar, listar), que escondem o que se faz;</li>
  <li><b>nomes específicos</b> (fatura, pagamento, conta) em vez de genéricos (dados, informação, relatório);</li>
  <li>o verbo do ponto de vista do <b>ator primário</b>: “O sistema alerta o gestor das faturas por pagar” dá o caso <b>Receber faturas por pagar</b>, ligado ao Gestor. O sistema não é ator dele próprio.</li></ul>
  <p><b>Identificadores</b> únicos e num formato coerente (UC1, UC7 ou uc_1_3_EnviarFaturas): o teste usa-os nas respostas.</p>
  <p><b>Atores</b>: id único; nome do papel ou do sistema externo, com os nomes de papéis que já existem na organização; <b>não</b> usar cargos (“CEO”, “Diretor de projeto”) que não interagem diretamente com o sistema; generalização entre atores só se for preciso.</p>
  <p><b>Tamanho</b>: cerca de <b>5 a 7 casos</b> por diagrama. Menos pode querer dizer abstração alta demais ou fronteira estreita demais; muitos mais pede que se parta o sistema em componentes, ou indica casos detalhados demais.</p>`,
  key: 'Verbo forte + nome específico, do ponto de vista do ator primário. Ids únicos. Atores são papéis, não cargos nem pessoas. 5–7 casos por diagrama.' },
{ id: 'uc-anti', t: 'uc', title: 'Anti-padrões dos casos de utilização',
  html: `<div class="tbl-wrap"><table><tr><th>Anti-padrão</th><th>Porque está mal</th></tr>
  <tr><td>Atores sem casos, ou casos sem atores</td><td>Um ator que não usa nada não é ator; um caso que ninguém usa não tem valor.</td></tr>
  <tr><td>Super-ator (“Utilizador”) que faz tudo</td><td>Sinal de análise fraca dos papéis: quem aprova não é quem regista.</td></tr>
  <tr><td>Dois atores com exatamente os mesmos casos</td><td>São o mesmo papel, ou falta uma generalização.</td></tr>
  <tr><td>Um caso alto demais que todos executam (“Usar o sistema”)</td><td>Não diz nada; análise preguiçosa.</td></tr>
  <tr><td>Casos “não funcionais” (“Pesquisa de alto desempenho”)</td><td>Desempenho é um requisito de qualidade, não uma funcionalidade.</td></tr>
  <tr><td>Atores que são pessoas (“Maria”)</td><td>Atores são papéis ou sistemas, nunca indivíduos.</td></tr>
  <tr><td>Casos encadeados como um workflow (Login → Autorizar → Selecionar…)</td><td>O diagrama não tem ordem. include não quer dizer “a seguir”.</td></tr>
  <tr><td>Login partido em casos (“Introduzir UserID”, “Introduzir password”, “Mostrar ecrã”) com extends</td><td>Passos de um cenário não são casos. É o diagrama “mais inútil” dos slides.</td></tr></table></div>
  <p>Regra de bolso: se a elipse não tem um objetivo que um ator reconheça como seu, não é um caso de uso.</p>`,
  key: 'Sem atores órfãos nem super-atores; nada de casos não funcionais, de pessoas como atores ou de workflows e passos de ecrã como casos.' },
{ id: 'uc-method', t: 'uc', title: 'Do enunciado ao diagrama de casos de uso',
  html: `<p>No teste pede-se para <b>completar</b> o diagrama a partir do UoD (no Exame 1 2022/23, com pelo menos um include e um extend). Método em seis passos:</p>
  <ol><li><b>Fronteira</b>: o nome do sistema (GetKnowSoft), não o da empresa (GoKnow).</li>
  <li><b>Atores</b>: quem usa o sistema diretamente (comercial, gestor, diretor, cliente) e os sistemas externos (o serviço de pagamentos). Não são atores: a empresa, o próprio sistema, nem quem só aparece como dado (os alunos indicados num plano).</li>
  <li><b>Casos</b>: cada “Permitir que <i>X</i> possa <i>Y</i>” dá um caso <i>Y</i> ligado a <i>X</i>. O que o sistema faz sozinho (relatório mensal, mudança automática de estado) liga ao ator que <b>recebe</b> o resultado.</li>
  <li><b>include</b>: passos sempre feitos e partilhados (“o comercial seleciona o pacote” → Consultar pacotes de formação).</li>
  <li><b>extend</b>: o que é opcional ou depende de uma condição (“pode cancelar, se faltarem 30 dias ou mais”).</li>
  <li><b>Verificar</b>: cada requisito funcional tem um caso; cada caso tem ator; nomes verbo + nome.</li></ol>
  <p>Na Oficina de diagramas está este método aplicado ao GoKnow, decisão a decisão.</p>`,
  key: 'Fronteira → atores (papéis e sistemas externos) → um caso por funcionalidade → include (sempre) → extend (opcional) → verificar contra os requisitos.' },

/* ---------------- CLASSES / DOMAIN MODEL ---------------- */
{ id: 'cls-class', t: 'cls', title: 'Classes, atributos e tipos',
  html: `<p>Uma <b>classe</b> é uma abstração de um conjunto de objetos que partilham os mesmos atributos, operações, relações e semântica. Desenha-se num retângulo: <b>nome</b> (no singular), <b>atributos</b> (<i>nome: Tipo</i>) e operações. No modelo de domínio do teste pedem-se classes com atributos e <b>sem operações</b>.</p>
  ${U(types, 'Do MAP 2: o estado do bilhete é um atributo de um tipo enumerado; Data é um data type.')}
  <ul><li><b>Tipos primitivos</b>: String, Integer, Real, Boolean.</li>
  <li><b>«dataType»</b>: um valor sem identidade própria (Data, Hora, Duração, Email, Custo). Dois “3 de março” são o mesmo valor.</li>
  <li><b>«enumeration»</b>: uma lista fechada de <b>literais</b> (Estado: disponível, reservado, pago, indisponível). Os estados de uma classe vivem aqui e casam com a sua máquina de estados.</li></ul>
  <p>O tipo tem de dizer o que o requisito diz: no MAP 2, “o dia e hora em que os bilhetes passam a estar disponíveis” estava como <i>inícioReservas: boolean</i>, e a solução corrige para <b>Data</b>.</p>
  <p><b>Atributo ou classe?</b> Se é só um valor (nome, NIF, preço), é atributo. Se tem atributos próprios, relações ou identidade (um Aluno com nome e passaporte, um Eixo que liga rodas a um motor), é classe.</p>`,
  key: 'Classe: nome, atributos (nome: Tipo), sem operações no modelo de domínio. «enumeration» para estados e listas fechadas; «dataType» para valores. Tipo certo para o requisito.' },
{ id: 'cls-assoc', t: 'cls', title: 'Associações e multiplicidades',
  html: `<p>Uma <b>associação</b> é a relação genérica entre classes, de semântica fraca: diz que os objetos se conhecem. Pode ter <b>nome</b> (com ▶ para o sentido de leitura) e <b>papéis</b> nas pontas (<i>+fornecedor</i>, <i>+maintains</i>).</p>
  ${U(mult, '“Cada máquina é fornecida por um fornecedor específico, que pode fornecer mais do que uma máquina.”')}
  <div class="tbl-wrap"><table><tr><th>Multiplicidade</th><th>Quer dizer</th></tr><tr><td>0..1</td><td>zero ou um</td></tr><tr><td>1</td><td>exatamente um</td></tr><tr><td>0..* ou *</td><td>zero ou mais</td></tr><tr><td>1..*</td><td>pelo menos um</td></tr><tr><td>n (ex.: 2, 50)</td><td>exatamente n</td></tr><tr><td>0..n, 1..n</td><td>até n, de um a n</td></tr></table></div>
  <p><b>Como ler</b>: a multiplicidade escreve-se junto da classe que se <b>conta</b>. “Cada máquina tem 1 fornecedor” põe o <b>1 do lado do Fornecedor</b>; “cada fornecedor fornece 1 ou mais máquinas” põe o <b>1..* do lado da Máquina</b>. Lê-se: <i>uma Máquina — fornecida por — 1 Fornecedor</i>.</p>
  <p>Os dois erros do MAP 2 eram de multiplicidade: 50 onde o requisito dizia 100 bilhetes normais, e as pontas da associação Bilhete–Comprador <b>trocadas</b> (“deveria ser ao contrário”). Verifica sempre as duas pontas com uma frase de cada lado.</p>
  <p>Uma associação pode ligar uma classe a si própria (uma Equipa tem sub-equipas 0..*, cada uma dentro de 0..1 equipa).</p>`,
  key: 'A multiplicidade fica do lado da classe que se conta. Lê as duas pontas com uma frase cada: “cada A tem … B” e “cada B tem … A”.' },
{ id: 'cls-aclass', t: 'cls', title: 'Classe-associação',
  html: `<p>Quando uma associação, normalmente <b>muitos-para-muitos</b>, tem <b>propriedades próprias</b>, essas propriedades não são de nenhuma das classes: são da ligação. Modelam-se com uma <b>classe-associação</b>, ligada à linha da associação por uma <b>linha tracejada</b>.</p>
  ${U(aclass, 'O salário e a data de início não são da Pessoa nem da Empresa: são de cada emprego.')}
  <p>Foi a resposta B do Grupo I do MAP 2: “a relação entre duas classes A e B com multiplicidade muitos-para-muitos, e que deva incluir as suas próprias propriedades, é representada por uma <b>Class-Association</b>”.</p>
  <p>Nos slides, o aluguer da Renting Machines: “Rents are made according to a contract, defined for each case”. O contrato é de cada par cliente–máquina: <b>ContratoAluguer</b> é a classe-associação de <i>rents</i>.</p>
  <p>Teste rápido: pergunta “de quem é este atributo?”. Se a resposta é “do par”, é uma classe-associação. Uma alternativa equivalente é transformar a ligação numa classe normal com duas associações de multiplicidade 1 e *.</p>`,
  key: 'Muitos-para-muitos com dados próprios da ligação → classe-associação, ligada à associação por linha tracejada.' },
{ id: 'cls-gen', t: 'cls', title: 'Generalização',
  html: `<p><b>A generaliza B</b> se e só se: (1) toda a instância de B é também instância de A, e (2) há instâncias de A que não são de B. Animal generaliza Ave porque toda a ave é um animal e há animais que não são aves. Lê-se “<b>B é um tipo de A</b>”.</p>
  <p>Desenha-se com um <b>triângulo vazio</b> do lado do pai (a classe geral). O filho herda os atributos e as associações do pai e pode acrescentar os seus.</p>
  <ul><li>“Algumas das máquinas são elétricas, com um ou mais motores elétricos” → <b>MáquinaElétrica</b> especializa <b>Máquina</b>, e só ela tem motores.</li>
  <li>No MAP 2, os bilhetes Especial e Normal especializam Bilhete.</li>
  <li>Os papéis de funcionário (diretor, gestor, comercial, docente) podem ser subclasses de Funcionário, quando cada papel tem associações próprias (o comercial cria planos, o docente é responsável por eles).</li></ul>
  <p>Cuidado: generalização não é composição. “Um carro tem um motor” não faz do Motor um tipo de Carro. E se os tipos só diferem num valor, sem atributos nem relações próprias, chega um atributo enumerado (tipo: {especial, normal}).</p>`,
  key: 'Generalização = “é um tipo de”: toda a instância do filho é do pai. Triângulo vazio no pai. Se só muda um valor, basta um enumerado.' },
{ id: 'cls-aggr', t: 'cls', title: 'Agregação e composição',
  html: `${U(parts, 'Generalização (Ave, Peixe → Animal), agregação (Equipa ◇ Empregado) e composição (Carro ◆ Motor).')}
  <ul><li><b>Agregação</b> (losango <b>vazio</b> do lado do todo): uma relação todo–parte fraca. A parte pode existir sozinha e pertencer a vários todos: um empregado está em várias equipas, um motor elétrico pode ser mudado de máquina para máquina.</li>
  <li><b>Composição</b> (losango <b>cheio</b>): todo–parte forte. Uma instância só pode estar numa composição de cada vez, e a parte não faz sentido sem o todo: a licença de um engenheiro, a conta de utilizador de um cliente, as linhas de uma fatura.</li></ul>
  <p>O losango fica sempre do lado do <b>todo</b>. Na composição, a multiplicidade do lado do todo é 1 ou 0..1 (nunca mais do que um todo).</p>
  <p>Analogia: uma playlist <i>agrega</i> músicas (apagas a playlist e as músicas continuam); um livro é <i>composto</i> por capítulos (sem o livro, um capítulo não existe).</p>
  <p>Na dúvida, uma associação simples nunca está errada; composição e agregação acrescentam significado que o enunciado tem de justificar.</p>`,
  key: 'Losango do lado do todo. Vazio (agregação): a parte vive sozinha e partilha-se. Cheio (composição): a parte só existe num todo de cada vez.' },
{ id: 'cls-method', t: 'cls', title: 'Do texto ao modelo de domínio',
  html: `<p>O método dos slides com a <b>Renting Machines</b>, frase a frase:</p>
  <ol><li><b>Substantivos → classes candidatas</b>: máquinas, clientes, contrato, fornecedor, inspetores, engenheiros, licença, motores elétricos, eletricistas. A própria empresa (RM) é o sistema, não uma classe.</li>
  <li><b>Valores → atributos</b> (nomes, datas, preços); <b>estados → enumerados</b>.</li>
  <li><b>Verbos → associações</b>: aluga, fornece, inspeciona, mantém, repara.</li>
  <li><b>Números → multiplicidades</b>: “mais do que uma máquina” = 1..*; “dois inspetores” = 2; “um fornecedor específico” = 1.</li>
  <li><b>“Alguns são …”</b> → generalização (máquinas elétricas).</li>
  <li><b>“Tem / é parte de”</b> → composição ou agregação (o engenheiro tem uma licença; a máquina elétrica tem motores que podem mudar de máquina).</li>
  <li><b>Dados da ligação</b> → classe-associação (o contrato de cada aluguer).</li>
  <li><b>Validar</b> com um diagrama de objetos: “o Marco repara o motor da berbequim-895, que foi fornecida pela SuperMachines e é inspecionada pelo Pedro e pela Ana”.</li></ol>
  <p>No teste: classes com atributos, sem operações, sem tipos se não forem pedidos, e com os enumerados relevantes. Na Oficina de diagramas fazes isto peça a peça.</p>`,
  key: 'Substantivos → classes; valores → atributos; verbos → associações; números → multiplicidades; “alguns são” → generalização; “tem/parte de” → composição; dados da ligação → classe-associação.' },
{ id: 'cls-errors', t: 'cls', title: 'Erros comuns: o carro, as rodas e o eixo',
  html: `<p>Exercício dos slides: <i>“Um carro tem de ter um motor e pode ter até duas rodas à frente e até duas atrás. O motor liga-se a até duas rodas por um eixo.”</i></p>
  <ul><li><b>1.ª tentativa</b>: Carro ◆ Motor, Carro ◇ Roda (front 0..2, rear 0..2) e uma associação <i>axle</i> entre Motor e Roda. Parece bem, mas um diagrama de objetos mostra o problema: nada impede que a roda de um ferrari esteja ligada ao motor de um lotus.</li>
  <li><b>2.ª tentativa</b>: o eixo é demasiado importante para ser só uma associação, por isso passa a <b>classe</b> (Eixo, com EixoFrente e EixoTrás). Melhor, mas ainda há ambiguidade.</li>
  <li><b>Conclusão</b> dos slides: há muitos modelos possíveis e <b>o correto não se decide sem requisitos mais precisos</b>.</li></ul>
  <p>Erros que o teste castiga:</p>
  <ul><li>multiplicidade trocada de ponta, ou o número errado (50 em vez de 100);</li>
  <li>tipo de atributo errado (boolean onde o requisito fala de uma data);</li>
  <li>uma classe para o próprio sistema ou para a empresa;</li>
  <li>um atributo que devia ser classe (tem dados próprios) ou uma classe que é só um valor;</li>
  <li>falta do enumerado de estados quando há ciclo de vida;</li>
  <li>composição onde a parte vive sozinha (o motor que muda de máquina).</li></ul>`,
  key: 'Valida o modelo com objetos concretos. Multiplicidades e tipos têm de dizer exatamente o requisito. Sem requisitos precisos, vários modelos são defensáveis.' },

/* ---------------- STATE MACHINES ---------------- */
{ id: 'stm-basics', t: 'stm', title: 'Máquinas de estados: estados e transições',
  html: `<p>Um <b>diagrama de máquina de estados</b> modela o <b>ciclo de vida</b> de uma entidade (os objetos de uma classe): como o seu estado muda em resposta a eventos.</p>
  ${U(lamp, 'Na lâmpada acesa, ligar outra vez não muda nada: o evento tem uma transição para o próprio estado.')}
  <ul><li>Um <b>estado</b> é uma situação em que uma condição invariante se mantém: estática (à espera de um evento) ou dinâmica (a fazer atividades).</li>
  <li>Uma <b>transição</b> tem um estado de <b>origem</b>, um <b>evento</b> e um estado de <b>destino</b>. Se a máquina está no estado <i>s</i> e chega o evento <i>d</i> com uma transição para <i>t</i>, a transição está <b>habilitada</b>; <i>d</i> é o <b>trigger</b> e diz-se que <i>d</i> <b>dispara</b> a transição.</li>
  <li>Um evento que não é trigger de nenhuma transição do estado atual <b>não afeta</b> a máquina.</li></ul>
  <p>O diagrama define duas restrições: o conjunto de <b>estados permitidos</b> (estática) e as <b>sequências legais</b> de estados (de transição). O ciclo de vida de um objeto até <i>t</i> é a sequência de estados por que passou desde a criação; é completo se acaba num estado final.</p>
  <p>Nem todas as classes precisam de máquina de estados: só as que têm um ciclo de vida interessante (bilhete, reserva, pacote de formação).</p>`,
  key: 'Estado = condição que se mantém. Transição = origem + evento (trigger) + destino. Evento sem transição no estado atual não faz nada.' },
{ id: 'stm-label', t: 'stm', title: 'Rótulos: evento [guarda] / ação',
  html: `<p>Uma transição escreve-se <b><i>evento [guarda] / ação</i></b>, e todas as partes são opcionais:</p>
  <ul><li><b>evento</b> (trigger): o que acontece, “pedido de aluguer”, “pago”, “(Diretor) ativar”;</li>
  <li><b>[guarda]</b>: condição que tem de ser verdade para a transição disparar, “[carro não marcado para manutenção]”;</li>
  <li><b>/ ação</b>: o que se faz durante a transição, “/ informar comprador”.</li></ul>
  <p>Exemplo dos slides: <i>Disponível —pedido de aluguer [não marcado para manutenção]→ Alugado</i>: quando o carro está disponível e chega um pedido, se não estiver marcado para manutenção, passa a alugado.</p>
  <p><b>Eventos de tempo e de mudança</b>: <i>after(48 h)</i> dispara passado um prazo (o pagamento que não chega); <i>when(data = fimValidade)</i> dispara quando uma condição passa a verdadeira (o pacote que passa automaticamente a concluído).</p>
  <p>Uma transição <b>sem evento</b> chama-se <b>triggerless</b> (MAP 2, G): dispara assim que o estado de origem acaba o que tinha a fazer.</p>
  <p>As operações sobre o objeto especificam-se <b>num estado</b> (entry/do/exit) ou <b>numa transição</b> (a ação) (MAP 2, H).</p>`,
  key: 'evento [guarda] / ação. after(prazo) e when(condição) para tempo. Sem evento = triggerless. Operações nos estados (entry/do/exit) ou nas transições.' },
{ id: 'stm-pseudo', t: 'stm', title: 'Pseudoestados',
  html: `<p>Um <b>pseudoestado</b> é um estado abstrato usado para começar, acabar ou ligar outros estados. Não é uma situação em que o objeto fica.</p>
  ${U(pseudo)}
  <ul><li><b>Inicial</b> ●: o primeiro estado de cada região (tem de existir um por região). A transição que sai dele é a criação do objeto.</li>
  <li><b>Final</b> ◉: o fim da região e de todos os estados dentro dela.</li>
  <li><b>History</b> Ⓗ: ao voltar a uma região, entra no subestado que estava ativo quando saiu (shallow ou deep).</li>
  <li><b>Fork / join</b>: divide uma transição em várias paralelas, ou junta-as (sem guardas).</li>
  <li><b>Junction</b> (círculo cheio pequeno): junta ou divide transições, fatorizando partes comuns; as guardas são avaliadas <b>antes</b> de qualquer ação (estrutural, previsível, as condições cobrem todos os casos).</li>
  <li><b>Choice</b> ◇: parecido, mas as guardas de saída são avaliadas <b>depois</b> de as transições de entrada fazerem o seu efeito (dinâmico; pode ter um ramo [else]).</li>
  <li><b>Terminate</b> ✕: destrói o objeto.</li></ul>
  <p>Na solução do MAP 2, a máquina do Bilhete usa uma <b>junction</b> para juntar “deixou de estar disponível” vinda de Disponível e de Reservado num só caminho para Indisponível.</p>`,
  key: 'Inicial ●, final ◉, history Ⓗ, fork/join, terminate ✕. Junction: guardas antes, junta caminhos. Choice ◇: guardas depois do efeito, dinâmico.' },
{ id: 'stm-comp', t: 'stm', title: 'Estados compostos, paralelismo e comportamentos',
  html: `${U(car, 'O carro de aluguer dos slides (Conceptual Modeling of Information Systems, cap. 13).')}
  <ul><li>Um <b>estado composto</b> contém subestados (sequenciais ou concorrentes): uma máquina hierárquica. Detalhar <i>EmUso</i> em Normal, Avariado e Atrasado sem o perder permite manter a semântica de alto nível; partir o estado no mesmo nível perdia a noção de “em uso”.</li>
  <li><b>Paralelismo</b>: um estado composto com regiões separadas por uma linha tracejada, cada uma com o seu inicial. O carro está ao mesmo tempo em Disponível/EmUso/… e em NãoÀVenda/ParaVender (quilometragem > 40 000 km).</li>
  <li><b>Comportamentos</b> num estado: <b>entry/</b> ação ao entrar, <b>do/</b> atividade enquanto está, <b>exit/</b> ação ao sair (o estado “a funcionar” de um sistema de vigilância: entry/mostrar “Operating”, do/monitorizar, exit/mostrar “Shutdown”).</li></ul>
  <p>Exemplos dos slides para reconhecer: a água (sólido, líquido, vapor, plasma, com fusão, vaporização…) e o secador com os estados <i>on</i> paralelos (potência baixa/alta e temperatura com history).</p>`,
  key: 'Estado composto: subestados (e regiões paralelas a tracejado). entry/ ao entrar, do/ enquanto está, exit/ ao sair.' },
{ id: 'stm-method', t: 'stm', title: 'Do enunciado à máquina de estados de uma classe',
  html: `<p>O teste pede o <b>ciclo de vida dos objetos de uma classe</b> (MAP 2: o Bilhete; Exame 1 2022/23: o Pacote de Formação). Método:</p>
  <ol><li><b>Estados</b>: procura no modelo de domínio o <b>enumerado</b> de estados da classe e, no texto, os adjetivos e particípios (pendente, ativo, cancelado, disponível, reservado, pago).</li>
  <li><b>Inicial</b>: o que cria o objeto (“quando é criado por um gestor fica pendente”).</li>
  <li><b>Transições</b>: cada frase com “passa a”, “quando”, “caso”, “é anulada” dá uma transição. Põe o <b>evento</b> e, se o texto diz quem, o ator entre parênteses: <i>(Diretor) ativar</i>.</li>
  <li><b>Tempo</b>: prazos e datas dão eventos de tempo: <i>after(intervalo definido)</i>, <i>when(data fim atingida)</i>.</li>
  <li><b>Guardas</b>: condições que decidem se a transição acontece.</li>
  <li><b>Finais</b>: os estados de onde não se sai (cancelado, concluído, pago).</li>
  <li><b>Verificar</b> cada requisito relevante contra o diagrama: falta alguma transição de volta (o bilhete não pago volta a disponível)?</li></ol>
  <p>Repara: no MAP 2 a solução oficial diz que não há um objetivo único para este diagrama; o essencial é ter os estados intermédios (Disponível, Reservado) e os finais (Pago, Indisponível) separados.</p>`,
  key: 'Estados do enumerado → inicial (criação) → uma transição por “passa a / quando / caso” → eventos de tempo → guardas → finais → verificar os requisitos.' },

/* ---------------- SEQUENCE ---------------- */
{ id: 'seq-basics', t: 'seq', title: 'Diagramas de sequência: lifelines e mensagens',
  html: `<p>Um <b>diagrama de sequência</b> representa interações entre objetos <b>ao longo do tempo</b> (de cima para baixo), num contexto de execução específico. É um diagrama de interação.</p>
  ${U(atm, 'O caso Validar utilizador do ATM como diagrama de sequência.')}
  <ul><li><b>Lifeline</b>: um participante (um objeto <i>:Classe</i>, o sistema, ou um ator) com uma linha tracejada para baixo: o seu tempo de vida.</li>
  <li><b>Mensagem síncrona</b>: seta cheia (quem envia espera); <b>resposta</b>: seta tracejada aberta; <b>assíncrona</b>: seta aberta (não espera).</li>
  <li><b>Self-message</b>: o objeto envia a si próprio (o sistema valida os dados).</li>
  <li><b>Barra de ativação</b>: quando o objeto está a executar.</li>
  <li><b>Criação</b> «create» (o objeto aparece a meio) e <b>destruição</b> ✕ no fim da lifeline.</li></ul>
  <p>No exemplo dos slides, <i>:ShoppingCart</i> e <i>:Order</i> já existem quando a interação começa; <i>o1:OrderLine</i> é criada a meio e destruída no fim.</p>`,
  key: 'Tempo de cima para baixo. Lifelines (atores, sistema, objetos); síncrona ▶ cheia, resposta tracejada, assíncrona aberta; self-message para o que o sistema faz sozinho.' },
{ id: 'seq-frag', t: 'seq', title: 'Fragmentos combinados: alt, opt, loop',
  html: `<p>Um <b>fragmento combinado</b> é uma caixa com um <b>operador</b> que estrutura parte da interação:</p>
  ${U(frags, 'opt: inscreve só se não deve nada. loop: envia o horário de cada disciplina.')}
  <div class="tbl-wrap"><table><tr><th>Operador</th><th>Para quê</th></tr>
  <tr><td><b>alt</b></td><td>Alternativas: várias secções com condições <i>[condição1]</i>, <i>[condição2]</i>, <i>[else]</i>, separadas a tracejado. Só uma acontece.</td></tr>
  <tr><td><b>opt</b></td><td>Opção: um alt com uma condição só. Acontece ou não.</td></tr>
  <tr><td><b>loop</b></td><td>Repetição: <i>[para cada aluno]</i>, <i>[até 3 vezes]</i>.</td></tr>
  <tr><td><b>break</b></td><td>Se a condição se verifica, faz isto e sai da interação.</td></tr>
  <tr><td><b>par</b>, seq, strict</td><td>Concorrência e ordem.</td></tr>
  <tr><td>critical, neg, assert, consider, ignore</td><td>Filtros e restrições.</td></tr></table></div>
  <p>No caso GoKnow: o comercial indica <b>cada</b> aluno (loop) e, depois da validação, o sistema envia emails ou dá erro (alt [válido] / [else]).</p>`,
  key: 'alt = escolha entre secções [cond]/[else]; opt = acontece ou não; loop = repete; break = sai. Guardas entre parênteses retos.' },
{ id: 'seq-method', t: 'seq', title: 'De um caso de uso a um diagrama de sequência',
  html: `<p>O Exame 1 2022/23 pedia o diagrama de sequência do caso “Criar plano de formação”, com <b>todos os passos do UoD</b>, recomendando como objetos <b>o sistema e os atores</b>. Método:</p>
  <ol><li><b>Lifelines</b>: o ator primário à esquerda (Comercial), o sistema (<i>:GetKnowSoft</i>) e os atores que recebem algo (Cliente, Docente).</li>
  <li><b>Uma mensagem por passo</b>, pela ordem do texto: “o comercial seleciona o pacote” → <i>selecionarPacote(pacote)</i> do Comercial para o sistema.</li>
  <li><b>Repetições</b> (“indica a informação de cada aluno”) → <b>loop</b>.</li>
  <li><b>O que o sistema faz sozinho</b> (“realiza a validação”) → <b>self-message</b>.</li>
  <li><b>Decisões</b> (“se válido…”) → <b>alt</b> com [válido] e [else]; o que é só às vezes → <b>opt</b>.</li>
  <li><b>Saídas</b>: envio de emails ao cliente e ao docente; confirmação do sucesso de volta ao comercial (resposta tracejada).</li>
  <li><b>Verificar</b>: todos os passos do texto estão lá, pela ordem certa, e cada seta vai de quem faz para quem recebe.</li></ol>`,
  key: 'Lifelines: atores e sistema. Um passo do UoD = uma mensagem, pela ordem. Repetição = loop; validação = self-message; decisão = alt.' },

/* ---------------- NOTATION ---------------- */
{ id: 'uml-notation', t: 'uml', title: 'Folha de notação UML',
  html: `<p><b>Casos de utilização</b></p>${U(incExt)}
  <p><b>Classes</b>: associação com multiplicidades, classe-associação, generalização, agregação, composição, enumeração e data type.</p>${U(mult)}${U(aclass)}${U(parts)}${U(types)}
  <p><b>Máquinas de estados</b></p>${U(pseudo)}${U(lamp)}
  <p><b>Sequência</b></p>${U(atm)}`,
  key: 'Setas tracejadas «include» (base → incluído) e «extend» (extensão → base); triângulo vazio no pai; losango no todo (vazio agrega, cheio compõe); evento [guarda] / ação.' },
]);
})();
