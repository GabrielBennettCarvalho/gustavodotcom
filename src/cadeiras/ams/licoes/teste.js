/* ===== Lições do estilo de teste + folhas de notação ===== */
(() => {
const A = (k, dom, lb, x, y) => ({ id: lb, k, dom, lb, x, y, w: 132, h: 50 });
const archSheet = { kind: 'archimate', w: 600, h: 500, alt: 'Folha de notação ArchiMate', nodes: [
  A('actor', 'bus', 'Business Actor', 75, 35), A('role', 'bus', 'Role', 225, 35), A('collab', 'bus', 'Collaboration', 375, 35), A('iface', 'bus', 'Interface', 525, 35),
  A('process', 'common', 'Process', 75, 105), A('function', 'common', 'Function', 225, 105), A('event', 'common', 'Event', 375, 105), A('service', 'common', 'Service', 525, 105),
  A('bobject', 'bus', 'Business Object', 75, 175), A('product', 'bus', 'Product', 225, 175), A('dobject', 'app', 'Data Object', 375, 175), A('appcomp', 'app', 'Application Component', 525, 175),
  A('node', 'tech', 'Node', 75, 245), A('device', 'tech', 'Device', 225, 245), A('syssw', 'tech', 'System Software', 375, 245), A('artifact', 'tech', 'Artifact', 525, 245),
  A('equipment', 'tech', 'Equipment', 75, 315), A('facility', 'tech', 'Facility', 225, 315), A('material', 'tech', 'Material', 375, 315), A('network', 'tech', 'Communication Network', 525, 315),
  A('stake', 'mot', 'Stakeholder', 75, 385), A('driver', 'mot', 'Driver', 225, 385), A('goal', 'mot', 'Goal', 375, 385), A('req', 'mot', 'Requirement', 525, 385),
  A('assess', 'mot', 'Assessment', 75, 455), A('outcome', 'mot', 'Outcome', 225, 455), A('principle', 'mot', 'Principle', 375, 455), A('capability', 'strat', 'Capability', 525, 455)] };
const B = (o) => o;
const bpmnSheet = { kind: 'bpmn', w: 620, h: 628, alt: 'Folha de notação BPMN', nodes: [
  B({ id: 'e1', k: 'start', x: 60, y: 30, lb: 'Start (none)' }), B({ id: 'e2', k: 'start', tr: 'msg', x: 180, y: 30, lb: 'Start message' }), B({ id: 'e3', k: 'start', tr: 'timer', x: 300, y: 30, lb: 'Start timer' }), B({ id: 'e4', k: 'start', tr: 'signal', x: 420, y: 30, lb: 'Start signal' }), B({ id: 'e5', k: 'start', tr: 'cond', x: 540, y: 30, lb: 'Start conditional' }),
  B({ id: 'i1', k: 'int', tr: 'msg', x: 60, y: 105, lb: 'Catch message' }), B({ id: 'i2', k: 'int', tr: 'msg', th: true, x: 180, y: 105, lb: 'Throw message' }), B({ id: 'i3', k: 'int', tr: 'timer', x: 300, y: 105, lb: 'Timer (espera)' }), B({ id: 'i4', k: 'int', tr: 'signal', th: true, x: 420, y: 105, lb: 'Throw signal' }), B({ id: 'i5', k: 'int', tr: 'link', x: 540, y: 105, lb: 'Link catch' }),
  B({ id: 'n1', k: 'end', x: 60, y: 180, lb: 'End (none)' }), B({ id: 'n2', k: 'end', tr: 'msg', x: 180, y: 180, lb: 'End message' }), B({ id: 'n3', k: 'end', tr: 'terminate', x: 300, y: 180, lb: 'Terminate' }), B({ id: 'n4', k: 'end', tr: 'error', x: 420, y: 180, lb: 'End error' }), B({ id: 'n5', k: 'end', tr: 'esc', x: 540, y: 180, lb: 'End escalation' }),
  B({ id: 'b1', k: 'int', tr: 'error', x: 60, y: 255, lb: 'Error (boundary)' }), B({ id: 'b2', k: 'int', tr: 'timer', ni: true, x: 180, y: 255, lb: 'Timer non-interrupting' }), B({ id: 'b3', k: 'int', tr: 'comp', x: 300, y: 255, lb: 'Compensation' }), B({ id: 'b4', k: 'int', tr: 'esc', th: true, x: 420, y: 255, lb: 'Throw escalation' }), B({ id: 'b5', k: 'int', tr: 'cond', x: 540, y: 255, lb: 'Conditional' }),
  B({ id: 'g1', k: 'xor', x: 60, y: 352, lb: 'Exclusive (XOR)' }), B({ id: 'g2', k: 'and', x: 180, y: 352, lb: 'Parallel (AND)' }), B({ id: 'g3', k: 'or', x: 300, y: 352, lb: 'Inclusive (OR)' }), B({ id: 'g4', k: 'evg', x: 420, y: 352, lb: 'Event-based' }), B({ id: 'g5', k: 'cpx', x: 540, y: 352, lb: 'Complex' }),
  B({ id: 't1', k: 'task', tt: 'user', x: 60, y: 437, w: 100, h: 46, lb: 'User task' }), B({ id: 't2', k: 'task', tt: 'service', x: 180, y: 437, w: 100, h: 46, lb: 'Service task' }), B({ id: 't3', k: 'task', tt: 'send', x: 300, y: 437, w: 100, h: 46, lb: 'Send task' }), B({ id: 't4', k: 'task', tt: 'receive', x: 420, y: 437, w: 100, h: 46, lb: 'Receive task' }), B({ id: 't5', k: 'task', tt: 'manual', x: 540, y: 437, w: 100, h: 46, lb: 'Manual task' }),
  B({ id: 's1', k: 'task', sub: true, x: 60, y: 507, w: 100, h: 50, lb: 'Sub-process' }), B({ id: 's2', k: 'task', loop: true, x: 180, y: 507, w: 100, h: 50, lb: 'Loop' }), B({ id: 's3', k: 'task', mi: true, x: 300, y: 507, w: 100, h: 50, lb: 'Multi-instance' }), B({ id: 's4', k: 'task', adhoc: true, x: 420, y: 507, w: 100, h: 50, lb: 'Ad-hoc' }), B({ id: 's5', k: 'task', call: true, x: 540, y: 507, w: 100, h: 50, lb: 'Call activity' }),
  B({ id: 'd1', k: 'data', x: 60, y: 577, lb: 'Data object' }), B({ id: 'd2', k: 'store', x: 180, y: 577, lb: 'Data store' }), B({ id: 'd3', k: 'task', comp: true, x: 300, y: 577, w: 100, h: 46, lb: 'Compensation' }), B({ id: 'd4', k: 'note', x: 470, y: 577, w: 110, lb: 'Annotation (texto)' })] };
const rel = (k, al, ak, ad, bl, bk, bd, read) => `<div class="diagram" style="margin-top:6px">${DG.rel(k, { al, ak, ad, bl, bk, bd, read })}</div>`;

ESTUDO.licoes('ams', [
{ id: 'exam-format', t: 'exam', title: 'Como é o teste: viewpoints e falhas A–F',
  html: `<p>O teste dá um <b>UoD</b> (texto do caso) e diagramas ArchiMate e BPMN. Cada diagrama responde a um <b>viewpoint</b>: <b>parte interessada</b> + <b>preocupação</b> (ex.: “diretora do Serviço; identificar a equipa responsável por cada conjunto de atividades”). Cada diagrama tem <b>4 falhas</b>:</p>
  <div class="tbl-wrap"><table><tr><th>Letra</th><th>Tipo</th><th>Exemplo típico</th></tr>
  <tr><td><b>A</b></td><td>Excesso: <b>relação</b> a mais</td><td>Uma equipa assigned a uma atividade que, no UoD, é de outra equipa.</td></tr>
  <tr><td><b>B</b></td><td>Excesso: <b>conceito</b> a mais (e as relações dele)</td><td>Uma equipa humana num viewpoint de suporte aplicacional.</td></tr>
  <tr><td><b>C</b></td><td>Erro: relação de <b>tipo errado</b></td><td>Triggering onde devia ser assignment; serving onde devia ser realization.</td></tr>
  <tr><td><b>D</b></td><td>Erro: conceito de <b>tipo errado</b></td><td>Uma aplicação desenhada como Device; gateway paralelo onde devia ser exclusivo; timer onde devia ser mensagem.</td></tr>
  <tr><td><b>E</b></td><td>Omissão: <b>relação</b> em falta</td><td>Falta o serving de um serviço para a aplicação que o usa; falta o message flow para o estudante.</td></tr>
  <tr><td><b>F</b></td><td>Omissão: <b>conceito(s)</b> em falta (com as suas relações)</td><td>Falta o data object “Registo de reservas”; falta o ramo de desistência; falta a tarefa paralela “Elaborar termo”.</td></tr></table></div>
  <p><b>Método em 3 passagens</b>, para cada diagrama:</p>
  <ol style="margin:8px 0 0;padding-left:20px"><li><b>Âmbito</b>: cada elemento serve a preocupação do viewpoint e está no âmbito do UoD? Se não, é um excesso (A ou B).</li>
  <li><b>Tipo</b>: cada conceito e relação tem o tipo certo (actor vs role, component vs device, AND vs XOR, timer vs message)? Se não, é um erro (C ou D).</li>
  <li><b>Falta</b>: lê o UoD frase a frase e procura o que esse viewpoint devia mostrar e não mostra. Isso é uma omissão (E ou F).</li></ol>
  <p>Respondes circundando o ID (C01, R03, X12…) ou acrescentando elementos com IDs C90–C99 / R90–R99 (ArchiMate) ou X90–X99 (BPMN), e explicando numa tabela.</p>
  <p>No Q1 (escolha múltipla) uma resposta errada vale <b>−0,25</b>: se não tiveres ideia, mais vale deixar em branco.</p>`,
  key: 'Âmbito → tipo → falta. Excesso = A/B, erro = C/D, omissão = E/F (a primeira letra de cada par é relação, a segunda é conceito).' },
{ id: 'exam-uod', t: 'exam', title: 'Caso do teste modelo: Empréstimo de Equipamentos',
  html: `<p><i>A Universidade do Vale dispõe de um Serviço de Empréstimo de Equipamentos que empresta computadores portáteis e projetores aos seus estudantes. A diretora do Serviço de Equipamento é responsável pelo funcionamento do serviço e pela aprovação de alterações ao procedimento. O serviço inclui uma equipa de atendimento e uma equipa técnica.</i></p>
  <p><i>O estudante submete o pedido na aplicação do Portal de Empréstimos. Esse portal utiliza o Serviço de Dados Académicos, realizado pela aplicação de Gestão Académica, para verificar a inscrição e a elegibilidade do estudante. Utiliza também o Serviço de Gestão de Reservas, realizado pela aplicação Gestão de Equipamento, para verificar a disponibilidade, reservar o equipamento e manter o Registo de reservas e acesso.</i></p>
  <p><i>A equipa de atendimento verifica a elegibilidade e a disponibilidade de cada pedido de reserva e em caso de sucesso, faz a reserva. Para cada reserva, em simultâneo, a equipa técnica prepara o equipamento, e a equipa de atendimento elabora o termo de responsabilidade.</i></p>
  <p><i>Quando a preparação e o termo estão concluídos, o Serviço de Equipamento prepara e envia ao estudante uma notificação de disponibilidade. Após essa notificação, o estudante confirma, no Portal de Empréstimos, o interesse assinando o termo de responsabilidade, ou pode informar que desiste. A desistência ou a falta de confirmação dentro do prazo de 48 horas cancelam a reserva, o que é informado ao estudante; a confirmação mantém a reserva e adiciona o termo de responsabilidade ao registo de reservas; no levantamento, a equipa de atendimento entrega o equipamento e regista o empréstimo.</i></p>
  <p><i>O âmbito do Serviço de Equipamento termina no registo do empréstimo. Devoluções, avarias e manutenção ficam fora do âmbito. Outros objetivos, tais como de que o Portal deve ser fácil de utilizar ou da possibilidade de cancelar um pedido inicial antes da notificação ou após uma confirmação, são requisitos para considerar no futuro. A desistência posterior à notificação não equivale por isso a essa eventual função de cancelamento do pedido inicial.</i></p>
  <p><b>Palavras que valem pontos:</b> “em simultâneo” → AND-split e AND-join; “ou… ou… ou falta dentro de 48 h” → event-based gateway com mensagem, mensagem e timer de 48 h; “utiliza o serviço” → serving; “realizado pela aplicação” → realization; “mantém o Registo” → data object com access; “fora do âmbito” / “para considerar no futuro” → não modelar.</p>`,
  key: 'Sublinha no UoD os verbos (utiliza, realiza, mantém), as conjunções (em simultâneo, ou) e os limites (fora do âmbito, futuro).' },
{ id: 'exam-oficial', t: 'exam', title: 'Solução oficial do teste modelo (e o que ensina)',
  html: `<div class="tbl-wrap"><table><tr><th>Q</th><th>Falhas oficiais</th></tr>
  <tr><td>Q1</td><td>1-C · 2-B · 3-C · 4-B</td></tr>
  <tr><td>Q2</td><td>1→2 · 2→2 · 3→3 · <b>4→12</b> (UoD omisso = “nenhuma”) · 5→5 · 6→6 · 7→7 · 8→8</td></tr>
  <tr><td>Q3</td><td><b>A</b> R02 · <b>A</b> R04 · <b>F</b> C90 “Verificar elegibilidade e disponibilidade; reservar” (assignment do atendimento) · <b>F</b> C91 “Entregar equipamento e registar empréstimo” (assignment do atendimento)</td></tr>
  <tr><td>Q4</td><td><b>B</b> C02 (+R08) · <b>D</b> C09 Device→Application Component · <b>E</b> R95 serving Serviço de gestão de reservas → Portal · <b>F</b> C92/C93 Data Objects “Registo de reservas e acesso” e “Termo de responsabilidade” + R93 (inclusão do termo no registo) + R92/R94 access pelas aplicações</td></tr>
  <tr><td>Q5</td><td><b>D</b> X06 (→XOR) · <b>D</b> X10 (tem de ser AND) · <b>D</b> X12 (→AND-join; o XOR faria X13 correr 2×) · <b>F</b> X90 “Elaborar termo” na lane atendimento</td></tr>
  <tr><td>Q6</td><td><b>D</b> X08 (→event-based) · <b>D</b> X15 escalation end (→none) · <b>E</b> X90 message flow da notificação → Estudante · <b>F</b> X92/X93/X94 desistência: msg catch → “Cancelar reserva por desistência” → fim que informa o estudante</td></tr></table></div>
  <p><b>O que isto ensina:</b></p>
  <ul><li>As falhas são sobretudo de <b>tipo de gateway</b> (D) e de <b>ramos/atividades em falta</b> (F). Verifica sempre as <b>duas pontas</b> de cada paralelo.</li>
  <li>O <b>ícone</b> dentro de um evento conta (escalation onde devia ser none = D).</li>
  <li>Num viewpoint com “informação”, procura <b>todos</b> os objetos de informação do UoD (registo <i>e</i> termo) e as suas relações.</li>
  <li>Pode haver mais imperfeições do que 4 (timer 24 h, recusa sem fim): o professor corrigiu-as no desenho mas não as contou. Prioriza as estruturais na tabela.</li>
  <li>Um processo pode juntar várias atividades do mesmo conjunto (“Verificar…; reservar”).</li></ul>`,
  key: 'Solução oficial: tipos de gateway, ramos em falta, ícones de evento e toda a informação do UoD.' },
{ id: 'case-adc', t: 'exam', title: 'Caso de treino: Inscrições na Piscina do Campus',
  html: `<p><i>A Associação Desportiva do Campus (ADC) gere as inscrições nas aulas de natação da piscina universitária. O coordenador desportivo é responsável pelo funcionamento das inscrições. A ADC tem uma secretaria e uma equipa de treinadores.</i></p>
  <p><i>O atleta submete a inscrição na App ADC. A app usa o Serviço de Horários, realizado pela aplicação Gestão de Instalações, para consultar as vagas e manter o Registo de ocupação, e usa o Serviço de Pagamentos, realizado pela aplicação externa Gateway de Pagamentos.</i></p>
  <p><i>A secretaria valida o atestado médico de cada inscrição; se for inválido, recusa a inscrição e informa o atleta. Se for válido, em simultâneo, um treinador avalia o nível do atleta e a secretaria reserva a vaga no horário. Quando ambos terminam, a secretaria envia ao atleta o pedido de pagamento. O atleta tem 72 horas para pagar: o pagamento confirma a inscrição e é registado no Registo de ocupação; a desistência ou a falta de pagamento no prazo anulam a inscrição, o que é informado ao atleta.</i></p>
  <p><i>Ficam fora do âmbito as renovações, as faltas às aulas e as lesões. Uma app mais rápida e notificações por SMS são ideias para o futuro.</i></p>`,
  key: 'Mesmo esqueleto do teste modelo: duas equipas, “em simultâneo”, um prazo e três desfechos possíveis.' },
{ id: 'exam-viewpoints', t: 'exam', title: 'Que linguagem e que elementos para cada viewpoint',
  html: `<div class="tbl-wrap"><table><tr><th>Preocupação do viewpoint</th><th>Linguagem</th><th>O que deve aparecer</th><th>O que é excesso</th></tr>
  <tr><td>Quem é responsável por que atividades (distribuição de trabalho)</td><td>ArchiMate</td><td>Business actors ou roles (equipas) + processes/functions + <b>assignment</b></td><td>Aplicações, eventos, ordem temporal</td></tr>
  <tr><td>Que serviços, aplicações e informação suportam X</td><td>ArchiMate</td><td>Services + application components (<b>realization</b>) + <b>serving</b> para quem usa + data objects (<b>access</b>)</td><td>Equipas humanas, processos detalhados</td></tr>
  <tr><td>Decisões, responsabilidades e coordenação internas</td><td>BPMN (private, uma pool com lanes)</td><td>Tasks nas lanes certas, gateways do tipo certo, split e join emparelhados</td><td>Mensagens entre lanes, passos fora do âmbito</td></tr>
  <tr><td>Mensagens trocadas com um participante externo</td><td>BPMN (collaboration)</td><td>Pool externa colapsada, <b>message flows</b>, event-based gateway para respostas alternativas, timers com o prazo do UoD</td><td>Detalhe interno do participante externo</td></tr></table></div>
  <p>Num viewpoint ArchiMate de responsabilidades lê-se “a equipa X <b>executa</b> Y”: só assignment. Num viewpoint de suporte lê-se “o serviço S <b>serve</b> o Portal” e “a aplicação A <b>realiza</b> S”.</p>`,
  key: 'Antes de olhar para o diagrama, decide o que esse viewpoint tem de mostrar.' },
{ id: 'arch-notation', t: 'arch', title: 'Folha de notação ArchiMate (elementos e ligações)',
  html: `<p>Ícone no canto superior direito, forma da caixa (reta = estrutura, arredondada = comportamento, cantos cortados = motivação) e domínio (cor, só por convenção).</p>
  <div class="diagram">${DG.render(archSheet)}</div>
  <p style="margin-top:12px"><b>As ligações</b>, lidas da origem para o destino:</p>
  ${rel('comp', 'Todo', 'appcomp', 'app', 'Parte', 'appcomp', 'app')}<p>Composition: o todo consiste nas partes (losango cheio).</p>
  ${rel('aggr', 'Grupo', 'collab', 'bus', 'Membro', 'role', 'bus')}<p>Aggregation: agrupa (losango vazio); a parte pode estar em vários grupos.</p>
  ${rel('assign', 'Equipa', 'actor', 'bus', 'Reservar', 'process', 'common')}<p>Assignment: quem executa (ponto + seta cheia).</p>
  ${rel('real', 'Aplicação', 'appcomp', 'app', 'Serviço', 'service', 'common')}<p>Realization: o concreto realiza o abstrato (tracejado + triângulo vazio).</p>
  ${rel('serv', 'Serviço', 'service', 'common', 'Portal', 'appcomp', 'app')}<p>Serving: o fornecedor serve o consumidor (seta aberta).</p>
  ${rel('access', 'Reservar', 'process', 'common', 'Registo', 'dobject', 'app')}<p>Access: lê ou escreve um objeto passivo (pontilhado).</p>
  ${rel('trig', 'Pedido recebido', 'event', 'common', 'Verificar', 'process', 'common')}<p>Triggering: precede ou causa (linha + seta cheia).</p>
  ${rel('flow', 'Avaliar', 'function', 'common', 'Liquidar', 'function', 'common')}<p>Flow: algo é transferido (tracejado + seta cheia).</p>
  ${rel('spec', 'Projetor', 'bobject', 'bus', 'Equipamento', 'bobject', 'bus')}<p>Specialization: “é um tipo de” (linha + triângulo vazio).</p>
  ${rel('infl', 'Requisito', 'req', 'mot', 'Goal', 'goal', 'mot')}<p>Influence: contribui (+/−) para um elemento de motivação (tracejado + seta aberta).</p>
  ${rel('assoc', 'A', 'stake', 'mot', 'B', 'driver', 'mot')}<p>Association: ligação genérica, sem ponta.</p>`,
  key: 'Ponto na origem = assignment. Triângulo vazio: tracejado = realization, contínuo = specialization. Seta cheia: contínua = triggering, tracejada = flow.' },
{ id: 'bpmn-notation', t: 'bpmn', title: 'Folha de notação BPMN',
  html: `<p>Contorno do evento: fino = start, duplo = intermediate, grosso = end. Ícone cheio = throw, contorno = catch. Tracejado = non-interrupting.</p>
  <div class="diagram">${DG.render(bpmnSheet)}</div>
  <p style="margin-top:12px"><b>Ligações</b>: sequence flow (linha contínua, seta cheia) dentro de uma pool; message flow (tracejado, círculo na origem, seta aberta) entre pools; association (pontilhado) para dados e anotações. A <b>default flow</b> tem um traço junto à origem; a <b>conditional flow</b> que sai de uma tarefa tem um pequeno losango.</p>`,
  key: 'Antes de responder, identifica cada símbolo pelo contorno, pelo ícone e pelo preenchimento.' },
]);
})();
