/* ===== Lições (teoria) ===== */
(() => {
const R = (k, al, ak, ad, bl, bk, bd, extra = {}) => `<div class="diagram" style="margin-top:6px">${DG.rel(k, Object.assign({ al, ak, ad, bl, bk, bd }, extra))}</div>`;
ESTUDO.licoes('ams', [
/* ---------------- SISTEMAS & MODELAÇÃO ---------------- */
{ id: 'sys-system', t: 'sys', title: 'O que é (afinal) um sistema',
  html: `<p>Do grego <i>sústēma</i>: um todo formado por elementos que “estão juntos”. Mas na AMS a ideia central é outra: <b>um sistema não existe “per si”</b>. Emerge conceptualmente quando alguém, um <b>stakeholder</b>, tem uma <b>concern</b> (preocupação, interesse).</p>
  <p>Definição usada no curso: <i>“A system is a thing that, when situated in a specific environment, pursues a common goal for a set of stakeholders according to their concerns.”</i></p>
  <ul><li>A relva espalhada pelo vento não é sistema; o ninho de um pássaro é: tem propósito, objetivo e “quem se importa”.</li>
  <li>O corpo humano “é um conjunto de sistemas” para um médico, e o sistema solar para um astrónomo: cada um olha com concerns diferentes.</li>
  <li>No curso tratamos sistemas <b>sociotécnicos</b> (People, Processes, Technology) e <b>complicados</b> (muitas entidades diferentes).</li></ul>
  <p><b>Systems Engineering</b> (INCOSE, 2004): “an interdisciplinary approach and means to enable the realization of successful systems”. A FAA acrescenta: foca o <b>todo</b>, distinto das partes, ligando o social ao técnico.</p>
  <p><b>System of Systems (SoS)</b>: sistemas independentes que, juntos, dão capacidades que nenhum tem sozinho. O avião só voa se todos os seus sistemas trabalharem em conjunto (e o 737 Max mostrou como um SoS sociotécnico pode falhar).</p>`,
  key: 'Sem stakeholder e sem concern, não há sistema: “it all depends on who cares”.' },
{ id: 'sys-thinking', t: 'sys', title: 'Systems Thinking e General Systems Theory',
  html: `<p>A <b>General Systems Theory</b> (GST, Ludwig von Bertalanffy) dá a base do systems thinking: olhar para relações, dinâmicas e ambiente, não só para as peças.</p>
  <div class="tbl-wrap"><table><tr><th>Conceito</th><th>Ideia</th></tr>
  <tr><td>Systems &amp; subsystems</td><td>Hierarquia de sistemas feitos de subsistemas; ajuda a decompor requisitos de alto nível.</td></tr>
  <tr><td>Open vs closed</td><td>Fechado = isolado do ambiente (ex.: termodinâmica). <b>Aberto</b> = troca energia, matéria ou informação. Sistemas de engenharia são tipicamente <b>abertos</b>.</td></tr>
  <tr><td>Holism</td><td>O todo é maior do que a soma das partes.</td></tr>
  <tr><td>Feedback loops</td><td>Output volta como input. <b>Positivo</b> amplifica; <b>negativo</b> estabiliza.</td></tr>
  <tr><td>Homeostasis</td><td>Manter estabilidade por mecanismos internos de regulação.</td></tr>
  <tr><td>Emergence</td><td>Comportamentos complexos surgem da interação de partes simples (e trazem consequências não intencionais).</td></tr></table></div>`,
  key: 'Engenharia = sistemas abertos; holism + feedback + emergence + homeostasis são as palavras-chave da GST.' },
{ id: 'sys-uod', t: 'sys', title: 'Universe of Discourse, Context e Domain',
  html: `<p>O <b>Universe of Discourse (UoD)</b> engloba toda a informação, conceitos, entidades e relações pertinentes ao sistema. É a <b>fonte</b> de onde derivam os requisitos e o foco da análise; <b>não é um produto</b> da análise. É <b>dinâmico</b>: evolui à medida que se descobre mais. Também cria uma linguagem comum entre stakeholders.</p>
  <p>Do UoD derivam:</p>
  <ul><li><b>System domain</b>: o ambiente <b>interno</b>, com entidades, objetos, regras de negócio e relações do espaço-problema. Representa-se num <b>domain model</b> (ex.: diagrama de classes).</li>
  <li><b>System context</b>: o ambiente <b>externo</b>, com atores, outros sistemas, leis e fatores que influenciam o sistema sem fazer parte dele. Representa-se num <b>context model</b> (context diagram).</li></ul>
  <p>Exemplo (Online Banking): o <i>domínio</i> tem utilizadores, contas, transações e saldos; o <i>contexto</i> tem reguladores (anti-branqueamento, privacidade), redes interbancárias e agentes de ciberameaça.</p>
  <p><b>Traceability</b>: cada requisito tem de poder ser rastreado até à sua origem no UoD.</p>`,
  key: 'UoD = fonte. Domain = dentro. Context = fora.' },
{ id: 'sys-boundary', t: 'sys', title: 'Fronteira do sistema e responsabilidade',
  html: `<p>A <b>system boundary</b> separa o <b>system of interest</b> (ou <b>EoI, Entity of Interest</b>) do ambiente. É <b>conceptual</b>: não tem de coincidir com uma aplicação, um departamento ou um edifício. Escolhe-se em função das concerns.</p>
  <p>A fronteira decide <b>o que o sistema pode ser obrigado a fazer</b>. Um requisito de sistema atribui uma obrigação ao sistema (ou a um constituinte dele), nunca a algo externo que ele não controla.</p>
  <ul><li>✗ “O doente deve fornecer um telefone válido.” Se o doente é externo, isto é uma <i>assumption</i> ou regra de participação, não um requisito do sistema.</li>
  <li>✓ “O sistema de marcações deve pedir e validar o contacto do doente antes de confirmar a marcação.”</li></ul>
  <p>Num sistema sociotécnico a obrigação pode recair sobre um procedimento ou um papel humano dentro da fronteira (não só software).</p>
  <p>Visto de fora (<b>black-box</b>): responsabilidades, interações, o que atravessa a fronteira. Visto por dentro (<b>white-box</b>): partes, responsabilidades de cada uma, como colaboram. Uma <b>interface</b> especifica a interação; um <b>port</b> (interaction point) é <i>onde</i> ela é disponibilizada; um <b>connector/path</b> liga pontos de interação.</p>`,
  key: 'Mudar a fronteira muda as responsabilidades que se podem atribuir.' },
{ id: 'sys-cynefin', t: 'sys', title: 'Tipos de problemas: Cynefin',
  html: `<p>O <b>Cynefin framework</b> ajuda a decidir como atacar um problema:</p>
  <ul><li><b>Simple / Clear</b>: solução conhecida, receita (fazer um bolo).</li>
  <li><b>Complicated</b>: exige peritos e análise, mas é planeável (construir um edifício; uma grande infraestrutura de TI).</li>
  <li><b>Complex</b>: causa-efeito só se percebe depois; experimentar e adaptar (alterações climáticas, gerir uma grande organização).</li>
  <li><b>Chaotic / Wicked</b>: sem causa-efeito claro, stakeholders em conflito; soluções “melhores ou piores”, nunca certas (pobreza, reforma da saúde).</li>
  <li><b>Confusion / Disorder</b>: ainda não se sabe em que domínio se está.</li></ul>
  <p>Um sistema técnico (interruptor + lâmpada) é simples; um sistema de informação de negócio com muitos stakeholders começa muitas vezes <i>complex</i> ou até <i>wicked</i>. A modelação conceptual serve para o empurrar para o espaço do <i>complicated</i>.</p>`,
  key: 'O objetivo da modelação é transformar o complexo em complicado.' },
{ id: 'sys-models', t: 'sys', title: 'Modelos: para que servem e quando parar',
  html: `<p>Dijkstra: “we struggle with the small sizes of our heads”, e por isso precisamos de técnicas para dominar a complexidade.</p>
  <ul><li>Um <b>modelo</b> é um <b>artefacto que representa algo</b>, usado para <b>conhecer, compreender e comunicar</b>.</li>
  <li>Propósito da modelação: ajudar os stakeholders a <b>comunicar de forma não ambígua</b> para <b>resolver problemas</b>. A dificuldade: “If language is not correct, then what is said is not what is meant” (Confúcio).</li>
  <li>Um modelo adequado é suficiente para o propósito <b>por ter as propriedades certas</b>, e não por acaso (Parker).</li>
  <li><b>RoME, Return on Modelling Effort</b>: benefício de criar ou melhorar um modelo face ao esforço (como o ROI). Serve de <b>critério de paragem</b>.</li>
  <li>A fábula dos <b>seis cegos e o elefante</b>: cada perceção parcial engana. Daí a necessidade de várias views.</li></ul>
  <p>Um modelo não é uma cópia completa da realidade nem um desenho neutro: é uma <b>interpretação seletiva e responsável</b>, apoiada em evidência do UoD.</p>`,
  key: 'Modela o suficiente para o propósito; o RoME diz-te quando parar.' },
{ id: 'sys-42010', t: 'sys', title: 'ISO/IEC/IEEE 42010: views, viewpoints, concerns',
  html: `<p>A norma <b>ISO 42010</b> descreve arquiteturas <b>sem definir “system”</b>: usa <b>Entity of Interest (EoI)</b>, para servir qualquer domínio (software, organizações, direito…).</p>
  <ul><li><b>Architecture</b>: conceitos ou propriedades fundamentais de uma entidade no seu ambiente, incorporados nos elementos, relações e princípios de design e evolução.</li>
  <li><b>Architecture Description (AD)</b>: o artefacto que <i>exprime</i> a arquitetura. Rigorosamente, um sistema <b>exibe</b> uma arquitetura (documentada ou não); a AD é a sua representação.</li>
  <li><b>Stakeholder</b> tem <b>concerns</b> (desempenho, custo, segurança…).</li>
  <li><b>Viewpoint</b>: a <b>especificação</b> (convenções, linguagem, model kinds) para construir views que tratam certas concerns.</li>
  <li><b>View</b>: a <b>representação</b> da arquitetura segundo um viewpoint, para certos stakeholders.</li></ul>
  <p>Analogia: o viewpoint é o “tipo de planta” (ex.: planta elétrica, com as suas regras); a view é a planta elétrica <i>desta</i> casa.</p>
  <p>O <b>Zachman framework</b> é um exemplo clássico de grelha de viewpoints/perspetivas.</p>`,
  key: 'Viewpoint governa, view mostra. EoI em vez de “system”.' },
{ id: 'sys-views', t: 'sys', title: 'Structure vs behaviour, black-box vs white-box, context diagram',
  html: `<p><b>Structure</b> e <b>behaviour</b> são as duas grandes famílias de viewpoints, separáveis na prática (“orthogonal separation of concerns”).</p>
  <ul><li><b>Structure</b>: padrões estáveis de entidades e relações (ex.: diagrama de classes, organigrama).</li>
  <li><b>Behaviour</b>: ações do sistema, a resposta a estímulos externos (atores) ou internos (mudanças de estado). Ex.: use case, sequence, state machine.</li></ul>
  <p><b>Black-box</b>: foca o valor do sistema para os atores (inputs → outputs). <b>White-box</b>: mostra estrutura e comportamento internos. Exemplo do rato: no 100.º ensaio não carrega no botão porque tem um objetivo interno (“comer até estar saciado”). Só o modelo white-box explica a anomalia; o black-box daria sempre a mesma resposta ao mesmo estímulo.</p>
  <p><b>Context diagram</b>: o sistema (EoI) como caixa negra no centro; à volta os <b>stakeholders</b> (identificados por um substantivo); as <b>associações</b> representam as concerns (verbo, substantivo ou verbo+substantivo). Inclui <b>enabling systems</b>: fornecem matéria, energia ou informação sem criarem concerns explícitas. Há utilizadores ativos e passivos (“o sistema sabe que estás lá mesmo que não saibas dele”).</p>`,
  key: 'Context diagram = EoI em black-box + stakeholders + concerns nas associações.' },
{ id: 'sys-lifecycle', t: 'sys', title: 'Ciclo de vida, métodos, PDCA, as-is/to-be, MBSE/MDE',
  html: `<p><b>Ciclo de vida</b>: conceção → requisitos e arquitetura → design e implementação → integração e testes → deployment e operação → manutenção → <b>decommissioning</b>.</p>
  <ul><li><b>Waterfall</b>: linear, bom com requisitos estáveis, pouco flexível.</li>
  <li><b>V-Model</b>: extensão do waterfall com <b>verificação e validação</b> em cada fase; típico de safety-critical (aeroespacial, médico).</li>
  <li><b>Iterativo e incremental</b>: partes desenvolvidas e integradas aos poucos, com feedback contínuo.</li>
  <li><b>Agile SE</b>: ciclos curtos e colaboração; risco de perder foco estratégico e documentação.</li></ul>
  <p><b>Understanding vs Doing</b> no <b>PDCA</b> (Shewhart/Deming): <b>Understanding</b> (análise) liga-se a <b>Plan</b> e <b>Check</b>; <b>Doing</b> (design e implementação) a <b>Do</b> e <b>Act</b>. <b>MAPE-K</b> (Monitor-Analyse-Plan-Execute + Knowledge) é o primo automático, usado em sistemas autoadaptativos.</p>
  <p><b>As-is</b> = estado atual (baseline). <b>To-be</b> = estado futuro desejado. Pode haver estados de transição.</p>
  <p><b>MBSE</b>: modelos como artefacto central durante todo o ciclo de vida. <b>MDE</b>: modelos <b>executáveis</b> que geram código ou artefactos.</p>`,
  key: 'Analisar (Plan/Check) antes de fazer (Do/Act). As-is → to-be.' },
{ id: 'sys-cases', t: 'sys', title: 'Casos históricos (o que correu bem e mal)',
  html: `<ul><li><b>Wasa (1628)</b>: requisitos alterados a meio pelo rei e má comunicação entre stakeholders levaram a um navio instável que afundou minutos depois de zarpar. Lição: gestão de requisitos e testes.</li>
  <li><b>Marinha portuguesa (1316)</b>: ordenanças formalizaram operações, disciplina e logística, algo a que hoje chamaríamos <b>Enterprise Architecture</b>.</li>
  <li><b>Phoebus cartel</b>: duração das lâmpadas limitada. Requisitos não funcionais moldados pela estratégia de negócio (obsolescência planeada).</li>
  <li><b>Linha de montagem da Ford</b>: engenharia de processos.</li>
  <li><b>Fordlândia</b>: wicked problems e propriedades emergentes negativas por ignorar o contexto local.</li>
  <li><b>Apollo</b>: integração de sistemas, V&amp;V.</li>
  <li><b>Concorde</b>: funcionalidades sem documentação; importância da rastreabilidade.</li>
  <li><b>London Ambulance (1992)</b>: requisitos e testes inadequados num sistema crítico.</li>
  <li><b>Airbus A380</b>: equipas com versões incompatíveis de CAD. Consistência de modelos (um caso precoce de MDE).</li>
  <li><b>Boeing 787</b>: integração de uma cadeia global de fornecedores (SoS).</li>
  <li><b>Boeing 737 Max</b>: MCAS com dependência de um único sensor, documentação insuficiente e pilotos sem treino nessa funcionalidade “black-box”.</li></ul>`,
  key: 'Quase todas as falhas vêm de requisitos, comunicação entre stakeholders ou integração.' },

/* ---------------- REQUISITOS ---------------- */
{ id: 'req-basics', t: 'req', title: 'Do UoD ao requisito',
  html: `<p>Requirements Engineering é o processo disciplinado de determinar, exprimir, avaliar e gerir o que tem de ser alcançado ou respeitado numa mudança. Não é só recolher desejos.</p>
  <p>A progressão (raramente linear): <b>evidência → concern / necessidade → objetivo → requisito → design e implementação</b>.</p>
  <ul><li>Uma <b>queixa</b> descreve um problema percebido.</li><li>Uma <b>necessidade</b> exprime algo considerado necessário.</li><li>Um <b>objetivo</b> identifica um resultado desejado.</li><li>Um <b>requisito</b> estabelece uma <b>obrigação sobre um alvo identificado</b>.</li></ul>
  <p>Separa sempre: <b>origem</b> (quem precisa e porquê), <b>alvo da obrigação</b> (quem tem de cumprir), <b>propriedade exigida</b>, <b>nível de abstração</b>, <b>prioridade</b> e <b>estado</b> (proposto, aceite, rejeitado…).</p>
  <p>Distingue também facto, <b>assumption</b>, necessidade, objetivo, requisito e <b>decisão de design</b>. Rótulos como “business requirement” só valem se o seu significado estiver definido.</p>`,
  key: 'Um requisito é uma obrigação justificada sobre uma entidade identificada, dentro da fronteira.' },
{ id: 'req-kinds', t: 'req', title: 'Tipos e qualidade dos requisitos',
  html: `<ul><li><b>Functional</b>: o que o alvo tem de fazer ou fornecer.</li>
  <li><b>Quality</b> (não funcional): quão bem, ou outra qualidade mensurável (desempenho, disponibilidade, usabilidade).</li>
  <li><b>Constraint</b>: restringe a solução, o processo ou o ambiente permitidos (ex.: tecnologia imposta, lei).</li></ul>
  <p><b>Requisito individual bom</b>: necessário, claro, viável, adequadamente preciso, <b>rastreável</b> e <b>verificável</b>. Verificável <i>não</i> obriga a teste de software: pode ser por <b>inspeção, análise, demonstração ou teste</b>.</p>
  <p><b>Conjunto bom</b>: suficientemente completo, <b>consistente</b>, sem redundância, priorizado e compatível com a fronteira. Problemas aparecem muitas vezes só na interação entre requisitos.</p>
  <p>Escreve requisitos <b>atómicos</b> (uma obrigação por frase). Modelos, cenários, protótipos e user stories complementam o texto; não o substituem automaticamente.</p>`,
  key: 'Functional = o quê; quality = quão bem; constraint = limites à solução.' },
{ id: 'req-vv', t: 'req', title: 'Verificação, validação e rastreabilidade',
  html: `<ul><li><b>Validation</b>: estamos a construir <b>o sistema certo</b>? Requisitos validados contra propósitos dos stakeholders, necessidades justificadas e contexto.</li>
  <li><b>Verification</b>: estamos a construir <b>bem o sistema</b>? Requisitos verificados contra regras de qualidade acordadas; mais tarde, o sistema verificado contra os requisitos.</li></ul>
  <p>No fim: o sistema implementado é <b>verificado</b> contra os requisitos e <b>validado</b> face ao uso pretendido.</p>
  <p><b>Traceability</b>: para trás (evidência, stakeholders, concerns, objetivos) e para a frente (modelos, decisões de design, implementação, evidência de verificação). Com versionamento, análise de impacto e aprovação explícita, os requisitos mudam sem perder coerência. Os requisitos são <b>artefactos vivos</b>.</p>`,
  key: 'Validar = sistema certo. Verificar = sistema bem feito.' },

/* ---------------- ARCHIMATE ---------------- */
{ id: 'arch-ea', t: 'arch', title: 'Enterprise Architecture e ArchiMate',
  html: `<p><b>Enterprise Architecture</b>: “a coherent body of principles, methods, concepts and models used in the analysis, design, realization and implementation of the artifacts of an organization”. A organização é o sistema-alvo; os seus artefactos incluem pessoas, estratégia, processos, sistemas de informação e TI de suporte.</p>
  <p>A EA trata da <b>coerência</b>: tornar dependências visíveis, decisões explicáveis e a mudança gerível. Não é um diagrama gigante feito uma vez; é uma <b>prática contínua</b>.</p>
  <ul><li><b>EA</b> = prática. <b>Framework</b> como <b>TOGAF</b> = método, processos, governança. <b>ArchiMate</b> = <b>linguagem</b> de descrição de arquitetura. <b>ArchiMate não prescreve método</b>.</li>
  <li>Velocidades diferentes: Estratégia 1–3 anos; <b>processos de negócio &lt; 6 meses</b>; software 3–6 anos; infraestrutura TI 6–10 anos. Entre negócio e software existe uma camada de desacoplamento: os <b>serviços</b> (Business–IS services).</li>
  <li>Um modelo ArchiMate é feito de <b>elementos</b> e <b>relações</b>. Cada relação é uma afirmação que tem de ser defensável.</li>
  <li>Distingue <b>current state</b> (as-is) de <b>target state</b> (to-be); podem existir <b>transition states</b>.</li></ul>`,
  key: 'ArchiMate é uma linguagem, não um método.' },
{ id: 'arch-framework', t: 'arch', title: 'Framework: aspects × domains (ArchiMate 4)',
  html: `<p>O ArchiMate Framework classifica os elementos do core em <b>domains</b> e <b>aspects</b>.</p>
  <p><b>Aspects</b> (independentes do domínio):</p>
  <ul><li><b>Active structure</b>: os “sujeitos” que agem (actor, application component, node…).</li>
  <li><b>Behaviour</b>: o que fazem (process, function, event, service).</li>
  <li><b>Passive structure</b>: os objetos sobre os quais se age (business object, data object, artifact).</li></ul>
  <p>Frase-chave: <i>“Something performs behaviour, which may realise a service and access something that is acted upon.”</i></p>
  <p><b>Core domains no ArchiMate 4</b>: <b>Common</b>, <b>Business</b>, <b>Application</b>, <b>Technology</b>. Domínios complementares: <b>Motivation</b> (porquê), <b>Strategy</b> (direção), <b>Implementation &amp; Migration</b> (como a mudança é introduzida).</p>
  <p>Notação: cantos <b>retos = structure</b>, <b>arredondados = behaviour</b>, <b>diagonais = motivation</b>. As <b>cores não têm semântica formal</b> (é convenção usar amarelo para negócio, azul para aplicação e verde para tecnologia).</p>`,
  key: 'Active structure faz, behaviour é o que é feito, passive structure é sobre o que se faz.' },
{ id: 'arch-common', t: 'arch', title: 'Common Domain: service, process, function, event, role, collaboration, path',
  html: `<p>No ArchiMate 4, o comportamento deixou de ser “business process” ou “application process”: há um só <b>Process</b>, <b>Function</b>, <b>Service</b>, <b>Event</b> no Common Domain. Quem o executa diz-se com a relação <b>Assignment</b>.</p>
  <div class="tbl-wrap"><table><tr><th>Elemento</th><th>Pergunta que responde</th></tr>
  <tr><td><b>Service</b></td><td>O que é oferecido a outros? Comportamento <b>externamente visível</b>, black-box. Tem de ter um consumidor.</td></tr>
  <tr><td><b>Process</b></td><td>O que acontece a seguir? Progressão no tempo, início e fim, resultado.</td></tr>
  <tr><td><b>Function</b></td><td>Que tipo de trabalho é? Agrupa comportamento por critério (competência, recurso, responsabilidade). Continua a existir mesmo sem pedidos.</td></tr>
  <tr><td><b>Event</b></td><td>O que ocorreu? Algo que acontece (mudança de estado), dentro ou fora.</td></tr></table></div>
  <ul><li><b>Role</b>: responsabilidade por um comportamento. Um actor pode ter vários roles; um role pode ser desempenhado por vários actors.</li>
  <li><b>Collaboration</b>: agregado de elementos ativos (ex.: roles) que fazem comportamento coletivo; sem estatuto permanente (“papel virtual”).</li>
  <li><b>Path</b>: ligação <b>lógica</b> entre elementos ativos para trocar informação, energia ou material; pode ser realizado por redes.</li>
  <li>Compostos: <b>Grouping</b> (coisas que pertencem juntas) e <b>Location</b> (lugar físico ou lógico).</li></ul>`,
  key: 'Service = fora. Process = sequência. Function = agrupamento por critério. Event = ocorrência.' },
{ id: 'arch-business', t: 'arch', title: 'Business Domain',
  html: `<ul><li><b>Business Actor</b>: entidade organizacional capaz de comportamento: uma pessoa, uma equipa, uma empresa, uma entidade externa. Responde a “quem participa?”.</li>
  <li><b>Business Interface</b>: ponto de acesso onde um actor disponibiliza serviços: um <b>canal</b> (telefone, Internet, balcão).</li>
  <li><b>Business Object</b>: elemento passivo <b>conceptual</b> relevante para o negócio (Apólice, Pedido de reembolso). Pode ser realizado por um data object ou material.</li>
  <li><b>Product</b>: coleção coerente de serviços, objetos, artifacts e/ou materiais oferecida <b>como um todo</b> a clientes.</li></ul>
  <p><b>Actor ou Role?</b> Teste: “Outro actor podia assumir esta responsabilidade?” Se sim, é um Role. “Maria Silva” e “Departamento de Apoio” são actors; “Agente de Apoio ao Cliente” é um role.</p>
  <p>Hello World (pizza): o processo de compra e venda de uma pizza tem dois actors <b>assigned</b> (comprador e vendedor); esse processo <b>realiza</b> o serviço “comprar pizza”, que <b>serve</b> o comprador.</p>`,
  key: 'Actor = quem. Role = em que qualidade. Interface = canal. Business object = conceito.' },
{ id: 'arch-app', t: 'arch', title: 'Application Domain',
  html: `<ul><li><b>Application Component</b>: encapsulamento de funcionalidade de aplicação, <b>modular, substituível, independentemente deployable e reutilizável</b>. Expõe serviços através de interfaces. Pode ser assigned a data objects para dizer que é a fonte de verdade desses dados.</li>
  <li><b>Application Interface</b>: ponto de acesso aos serviços de um componente (um “contrato”). O mesmo serviço pode ser exposto por várias interfaces e vice-versa. Só se modela quando o modo de acesso interessa.</li>
  <li><b>Data Object</b>: dados <b>estruturados para processamento automático</b> (registo de cliente, sinistro). Pode <b>realizar</b> um business object e ser <b>realizado</b> por um artifact.</li></ul>
  <p>Leitura típica: o componente <b>executa</b> (assignment) um process/function, que <b>realiza</b> um service, que <b>serve</b> comportamento de negócio ou outra aplicação; o comportamento <b>acede</b> a data objects.</p>
  <p>No ArchiMate 4 o elemento chama-se só <b>Service</b>. O carácter “aplicacional” vem do contexto, não do rótulo.</p>`,
  key: 'Componente = quem; data object = dados para máquina; business object = conceito para pessoas.' },
{ id: 'arch-tech', t: 'arch', title: 'Technology Domain',
  html: `<div class="tbl-wrap"><table><tr><th>Elemento</th><th>O que é</th></tr>
  <tr><td><b>Node</b></td><td>Recurso computacional ou físico genérico que aloja, executa ou processa (servidor, VM, cloud). O mais genérico.</td></tr>
  <tr><td><b>Device</b></td><td>Hardware (físico ou virtual) com capacidade de processamento ou armazenamento: mainframe, PC, smartphone, router.</td></tr>
  <tr><td><b>System Software</b></td><td>Ambiente onde corre software: SO, SGBD, application server, containers.</td></tr>
  <tr><td><b>Technology Interface</b></td><td>Ponto de acesso a serviços tecnológicos.</td></tr>
  <tr><td><b>Communication Network</b></td><td>Infraestrutura física de transmissão de dados (largura de banda, latência). Realiza paths.</td></tr>
  <tr><td><b>Artifact</b></td><td>Peça “física” do mundo TI: executável, script, ficheiro, tabela. Realiza application components e data objects.</td></tr>
  <tr><td><b>Equipment</b></td><td>Máquina física, ferramenta, instrumento (ex.: scanner de ressonância magnética).</td></tr>
  <tr><td><b>Facility</b></td><td>Estrutura física que aloja equipamento: fábrica, edifício, data centre.</td></tr>
  <tr><td><b>Distribution Network</b></td><td>Rede física que transporta materiais ou energia.</td></tr>
  <tr><td><b>Material</b></td><td>Matéria ou energia tangível (matéria-prima, combustível, até o “corpo do doente”).</td></tr></table></div>
  <p>Cadeia entre domínios: <b>artifact realiza data object</b>, que <b>realiza business object</b>; <b>artifact realiza application component</b>.</p>`,
  key: 'System software ≠ application component: um dá o ambiente, o outro implementa o negócio.' },
{ id: 'arch-rel', t: 'arch', title: 'Relações: o que cada seta afirma',
  html: `<p>Lê sempre a relação como uma frase, da origem para o destino.</p>
  <p><b>Estruturais</b> (coerência estática):</p>
  <ul><li><b>Composition</b> (losango cheio na origem): o todo <i>consiste</i> nas partes; relação forte.${R('comp', 'Função Apoio', 'function', 'common', 'Gestão Reembolsos', 'function', 'common')}</li>
  <li><b>Aggregation</b> (losango vazio): agrupa elementos; a parte pode pertencer a vários agregados.</li>
  <li><b>Assignment</b> (ponto na origem, seta cheia): quem executa ou é responsável. Ex.: actor → role, role → process, node → artifact.${R('assign', 'Agente Apoio', 'role', 'bus', 'Rever Pedido', 'process', 'common')}</li>
  <li><b>Realization</b> (tracejado, triângulo vazio): o mais concreto realiza o mais abstrato (process → service, data object → business object, artifact → component).${R('real', 'Receber Pedido', 'process', 'common', 'Serviço Submissão', 'service', 'common')}</li></ul>
  <p><b>Dependência</b>:</p>
  <ul><li><b>Serving</b> (linha, seta aberta): o fornecedor <b>serve</b> o consumidor. A seta aponta para o consumidor.${R('serv', 'Serviço Submissão', 'service', 'common', 'Passageiro', 'actor', 'bus')}</li>
  <li><b>Access</b> (pontilhado, seta pequena): comportamento lê, cria ou altera um objeto passivo. A ponta indica o sentido da informação (para o objeto = escrita; para o comportamento = leitura).${R('access', 'Criar Fatura', 'process', 'common', 'Fatura', 'bobject', 'bus')}</li>
  <li><b>Influence</b> (tracejado, seta aberta, pode ter +/−): contribui para (ou contra) um elemento de motivação.</li>
  <li><b>Association</b> (linha simples): ligação genérica. Sempre permitida; não a uses para fugir à análise.</li></ul>
  <p><b>Dinâmicas</b>:</p>
  <ul><li><b>Triggering</b> (linha, seta cheia): precedência temporal ou causal (o semáforo verde “desencadeia” os carros).${R('trig', 'Pedido Recebido', 'event', 'common', 'Rever Pedido', 'process', 'common')}</li>
  <li><b>Flow</b> (tracejado, seta cheia): transferência de informação, bens ou dinheiro. <b>Não implica causalidade</b>. Rotula o que flui.${R('flow', 'Avaliar Sinistros', 'function', 'common', 'Liquidar Sinistros', 'function', 'common')}</li></ul>
  <p><b>Outras</b>: <b>Specialization</b> (linha, triângulo vazio), só entre elementos do mesmo tipo; <b>Junction</b> (AND cheio, OR vazio) junta relações dinâmicas, assignment, realization e association.</p>`,
  key: 'Lê cada seta em voz alta: “X serve Y”, “X realiza Y”, “X é executado por Y”.' },
{ id: 'arch-derive', t: 'arch', title: 'Regras de derivação',
  html: `<p>Duas relações estruturais ou de dependência encadeadas num elemento intermédio podem ser substituídas pela <b>mais fraca das duas</b>:</p>
  <p><i>Se r(a,b) e s(b,c), então t(a,c) é permitido, sendo t a mais fraca de r e s.</i></p>
  <p>Ordem de força (da mais fraca para a mais forte):</p>
  <p style="font-family:var(--f-mono);font-size:14px">influence &lt; access &lt; serving &lt; realization &lt; assignment &lt; aggregation &lt; composition</p>
  <p>As <b>estruturais são mais fortes</b> do que as de dependência.</p>
  <p>Exemplo: o processo P <b>realiza</b> o serviço S e S <b>serve</b> o actor A. Logo P <b>serve</b> A (serving é mais fraca do que realization).</p>`,
  key: 'Cadeia de relações → fica a mais fraca.' },
{ id: 'arch-motiv', t: 'arch', title: 'Motivation e Strategy',
  html: `<ul><li><b>Stakeholder</b>: tem interesse na arquitetura. Não é necessariamente um actor no modelo (o passageiro pode ser actor numa view e stakeholder noutra).</li>
  <li><b>Driver</b>: fator que cria pressão para mudar (custos a subir, regulação, expectativas). Ainda não diz se é bom ou mau.</li>
  <li><b>Assessment</b>: o que esse driver <b>significa aqui</b> (“o reembolso é lento e propenso a erros”). Tem de assentar em evidência.</li>
  <li><b>Goal</b>: estado ou direção desejada (“reduzir trabalho manual”). <b>Outcome</b>: resultado concreto, mensurável (“reembolsos mais rápidos”).</li>
  <li><b>Requirement</b>: o que a arquitetura <b>tem de satisfazer</b>; mais preciso do que um goal. Não é já a solução.</li>
  <li><b>Principle</b>: regra geral que orienta o design.</li></ul>
  <p>Strategy: <b>Capability</b> (o que a empresa tem de <i>ser capaz</i> de fazer, não uma unidade ou aplicação), <b>Resource</b>, <b>Course of Action</b> (abordagem estratégica escolhida, não um plano detalhado).</p>
  <p>A relação <b>influence</b> liga tudo num caminho rastreável: componente → requisito “24×7” → princípio “servir clientes onde estiverem” → goal “aumentar quota de mercado”.</p>`,
  key: 'Driver → Assessment → Goal/Outcome → Requirement → solução.' },
{ id: 'arch-v4', t: 'arch', title: 'De ArchiMate 3.2 para ArchiMate 4',
  html: `<ul><li><b>Comportamento unificado</b>: deixam de existir Business/Application/Technology Process, Function, Service e Event separados. Há um só Process, Function, Service e Event no <b>Common Domain</b>.</li>
  <li><b>Event genérico</b>: o Implementation Event dá lugar ao Event.</li>
  <li><b>Collaboration unificada</b> e <b>Role genérico</b>: o Role pode ser assigned a qualquer elemento de estrutura ativa interna.</li>
  <li><b>De layers para domains</b>; o capítulo do Generic Metamodel é substituído pelo do Common Domain.</li>
  <li><b>Path relocalizado</b> para o Common Domain; a relação com Path passa de <b>aggregation</b> a <b>realization</b>.</li>
  <li><b>Elementos removidos</b>: Business/Application/Technology Interaction, Constraint, Contract, Gap, Representation.</li>
  <li>As relações passam a poder exprimir <b>multiplicidade</b>.</li></ul>
  <p>O curso usa ArchiMate 4; se a ferramenta só suporta 3.2, as decisões de compatibilidade têm de ficar explícitas.</p>`,
  key: 'No ArchiMate 4 um Process é só “Process”: quem o faz diz-se com assignment.' },
{ id: 'arch-errors', t: 'arch', title: 'Erros comuns e profundidade (black/white-box)',
  html: `<ul><li><b>Confundir estrutura com comportamento</b>: “Finance Case System” como Process ✗ → Application Component; “Registar Caso” é o Process.</li>
  <li><b>Actor vs Role</b> trocados.</li>
  <li><b>Tudo é Process</b>: “Apoio ao Cliente” sem sequência é uma <b>Function</b>.</li>
  <li><b>Chamar Service a trabalho interno</b> sem consumidor.</li>
  <li><b>“Supports” vago</b>: diz se é serving, assignment, access, flow ou realization. Assignment não serve para “a aplicação ajuda o humano”.</li>
  <li><b>Direção invertida</b>: “Passageiro serve Serviço” ✗.</li>
  <li><b>Flow para tudo</b>, sem rótulo. <b>Triggering</b> só por estar ao lado. <b>Composition como layout</b>.</li>
  <li><b>Inventar arquitetura</b> (cloud, API gateway, base de dados partilhada) sem evidência no UoD.</li>
  <li><b>Misturar as-is com to-be</b> sem distinção. <b>Detalhe a mais</b>. <b>Cor como significado</b>.</li></ul>
  <p><b>Black-box</b> (o que oferece, a quem) vs <b>white-box</b> (como é realizado). Esconder detalhe <b>não é falha</b>: é muitas vezes a decisão certa. Mas não escondas o problema relevante (ex.: a re-introdução manual de dados). A regra: <b>tão simples quanto possível, mas com detalhe suficiente para responder à concern</b>. O ArchiMate é especialmente útil em <b>black-box</b>; o white-box detalhado fica para BPMN e UML.</p>`,
  key: 'Cada elemento precisa de uma frase do UoD que o justifique.' },

/* ---------------- BPM ---------------- */
{ id: 'bpm-process', t: 'bpm', title: 'O que é um processo e porque orientar a organização a processos',
  html: `<p>Adam Smith (1776) e a fábrica de alfinetes: “cerca de dezoito operações distintas”. A divisão do trabalho é a origem da ideia de processo.</p>
  <p><b>Processo</b>: <b>inputs</b> (materiais, informação) → transformação usando <b>recursos</b> (pessoas, energia, equipamento, infraestruturas, métodos) → <b>outputs</b> (produtos, serviços, informação).</p>
  <p><b>Organização orientada a funções</b> (vertical): otimiza cada departamento mas sub-otimiza o todo. É o “<b>island effect</b>”; ninguém gere os “<b>blank spaces</b>” entre funções; responsabilidades perdem-se nas interfaces; as funções contam mais do que os clientes.</p>
  <p><b>Organização orientada a processos</b>: gestão <b>horizontal</b>, atravessa funções, foca <b>produtos e clientes</b>.</p>
  <ol style="margin:8px 0 0;padding-left:20px"><li>Todo o trabalho numa organização faz parte de um processo.</li><li>Todos os produtos e serviços resultam de um processo.</li><li>Um processo é realizado pela cooperação de pessoas (actors) e recursos.</li><li>A gestão por processos foca produto e clientes, não funções ou unidades.</li></ol>`,
  key: 'Processos atravessam funções; as falhas vivem nas fronteiras entre departamentos.' },
{ id: 'bpm-types', t: 'bpm', title: 'Tipos de processos, case management e maturidade',
  html: `<ul><li><b>Management</b>: governam o sistema (governança, gestão e planeamento estratégico).</li>
  <li><b>Operational / Core / Primary</b>: o negócio central, a cadeia de valor; <b>dão valor</b> direto (vendas, logística, produção).</li>
  <li><b>Support</b>: suportam os outros e <b>não dão valor direto</b> (contabilidade, RH, TI).</li></ul>
  <p>Nas notas: os core são os “verdadeiros business processes”; os restantes são “processos <i>do</i> negócio”.</p>
  <p><b>Case</b>: processo menos estruturado e mais dinâmico, que não se define à partida como fluxo rígido (doentes num hospital, incidentes, investigações). <b>Case management</b> privilegia flexibilidade e resultados sobre fluxos rígidos.</p>
  <p><b>Object-centric process modelling</b>: foca os <b>estados dos objetos</b> (ex.: a nota de encomenda: criada → aprovada → enviada) em vez da sequência de atividades.</p>
  <p><b>Maturidade de processos</b>: do informal ao integrado e otimizado; associada a certificações como <b>ISO 9001, ISO 27001 e CMMI</b>. Compliance = cumprir leis e regras; auditoria = verificar regularmente.</p>`,
  key: 'Core dá valor; support suporta; management governa.' },
{ id: 'bpm-arch', t: 'bpm', title: 'Process architecture, reference processes e linguagens',
  html: `<p>Quando um conjunto de processos partilha contexto e concerns, pode ser visto como sistema, com uma <b>process architecture</b>: especificação formal da <b>estrutura</b> de cada processo, das suas <b>propriedades</b>, das <b>relações entre atividades</b> (comportamento colaborativo) e dos <b>princípios de design</b> (composição, profundidade).</p>
  <p>“As pessoas sabem o que fazem, mas podem não saber em que processo de negócio estão a trabalhar.”</p>
  <ul><li><b>Reference process</b>: modelo genérico com boas práticas da indústria, usado como template (ex.: order-to-cash do SAP).</li>
  <li><b>Process framework</b>: coleção <b>hierárquica</b> de processos que dá a visão global (ex.: <b>APQC PCF</b>, <b>ITIL</b>). O framework dá o contexto estratégico; os reference processes dão o detalhe operacional.</li></ul>
  <p>Linguagens: <b>BPMN</b> (OMG, a mais usada), <b>UML Activity Diagrams</b>, <b>EPC</b> (ligada a ERP/SAP), <b>IDEF0</b> (funções) e IDEF3, <b>BPEL</b> (orquestração de web services, OASIS), <b>Petri Nets</b> (matemáticas, concorrência).</p>
  <p>BPMN: BPMI publica 1.0 em 2004; BPMI integra a OMG em 2005; <b>BPMN 2.0 em 2011</b>; <b>2.0.2 em 2014</b>.</p>`,
  key: 'Reference process = template; process framework = mapa hierárquico.' },

/* ---------------- BPMN ---------------- */
{ id: 'bpmn-core', t: 'bpmn', title: 'Elementos core e tipos de diagrama',
  html: `<ul><li><b>Flow objects</b>: <b>Event</b> (círculo), <b>Activity</b> (retângulo arredondado), <b>Gateway</b> (losango).</li>
  <li><b>Connecting objects</b>: <b>Sequence flow</b> (seta cheia: ordem), <b>Message flow</b> (tracejado, círculo na origem e seta aberta: mensagens entre participantes), <b>Association</b> (pontilhado: liga artefactos e dados).</li>
  <li><b>Data</b>: data input, data output, data object, data store.</li>
  <li><b>Swimlanes</b>: <b>Pool</b> e <b>Lane</b>.</li>
  <li><b>Artifacts</b>: <b>Group</b> (agrupa visualmente; <b>não muda a semântica</b>) e <b>Annotation</b>.</li></ul>
  <p><b>Tipos de diagrama</b>: Process (private ou public), <b>Collaboration</b>, Choreography e Conversation. Na <b>AMS só se usam Process e Collaboration</b>.</p>
  <p><b>Token game</b>: um <b>start event</b> cria uma <b>instância</b> de processo e o seu <b>token</b>. O token percorre os sequence flows; os gateways duplicam, escolhem ou sincronizam tokens. Processo = o modelo; process instance = uma execução concreta.</p>`,
  d: { kind: 'bpmn', w: 560, h: 150, alt: 'Hello World BPMN: verificar stock e decidir', nodes: [
    { id: 's', k: 'start', tr: 'msg', x: 30, y: 60, lb: 'Pedido' }, { id: 't1', k: 'task', x: 120, y: 60, lb: 'Verificar stock' },
    { id: 'g', k: 'xor', x: 215, y: 60 }, { id: 't2', k: 'task', x: 315, y: 30, lb: 'Atualizar stock' }, { id: 't3', k: 'task', x: 315, y: 115, lb: 'Encomendar matéria-prima' },
    { id: 'm', k: 'xor', x: 410, y: 60 }, { id: 't4', k: 'task', x: 485, y: 60, w: 80, lb: 'Enviar produto' }],
    edges: [{ f: 's', t: 't1' }, { f: 't1', t: 'g' }, { f: 'g', t: 't2', lb: 'há stock' }, { f: 'g', t: 't3', lb: 'sem stock' }, { f: 't2', t: 'm' }, { f: 't3', t: 'm' }, { f: 'm', t: 't4' }] },
  key: 'Sequence flow = ordem dentro do participante; message flow = conversa entre participantes.' },
{ id: 'bpmn-events', t: 'bpmn', title: 'Eventos: start, intermediate, end; catch e throw',
  html: `<ul><li><b>Start</b> (contorno fino): <b>só catch</b>. Cria a instância e o token.</li>
  <li><b>Intermediate</b> (contorno duplo): <b>catch ou throw</b>.</li>
  <li><b>End</b> (contorno grosso): <b>só throw</b>. Termina um caminho (ou todo o processo).</li></ul>
  <p>O ícone é o <b>trigger</b>. <b>Preenchido = throw</b> (produz o trigger); <b>contorno = catch</b> (espera por ele). O catch é <b>bloqueante</b>: espera pelo token <i>e</i> pelo trigger.</p>
  <p>Triggers principais: None, <b>Timer</b> (só catch), <b>Message</b>, <b>Signal</b>, <b>Error</b>, <b>Compensation</b>, <b>Terminate</b> (só end), Conditional, Link, Escalation.</p>
  <ul><li><b>Message</b>: tem um <b>destinatário específico</b> noutro participante (outra pool). Se o destino está na mesma pool, usa <b>Signal</b>.</li>
  <li><b>Signal</b>: <b>broadcast</b>, apanhado por qualquer processo que esteja à espera.</li>
  <li><b>Terminate end</b>: mata <b>todos os tokens</b> da instância. Equivale a um None end <b>se e só se o processo não for concorrente</b>.</li>
  <li><b>Timer start</b>: o processo arranca num momento ou intervalo. <b>Timer intermediate</b>: espera (delay) no meio do fluxo.</li></ul>`,
  d: { kind: 'bpmn', w: 520, h: 86, alt: 'Exemplos de eventos', nodes: [
    { id: 'a', k: 'start', x: 40, y: 34, lb: 'Start none' }, { id: 'b', k: 'start', tr: 'timer', x: 120, y: 34, lb: 'Start timer' }, { id: 'c', k: 'int', tr: 'msg', x: 200, y: 34, lb: 'Catch msg' },
    { id: 'd', k: 'int', tr: 'msg', th: true, x: 280, y: 34, lb: 'Throw msg' }, { id: 'e', k: 'end', tr: 'msg', x: 360, y: 34, lb: 'End msg' }, { id: 'f', k: 'end', tr: 'terminate', x: 440, y: 34, lb: 'Terminate' }] },
  key: 'Start só apanha, end só lança, intermediate faz as duas. Cheio = throw.' },
{ id: 'bpmn-boundary', t: 'bpmn', title: 'Boundary events, erro, compensação e link',
  html: `<p>Eventos intermédios colados ao limite de uma atividade são <b>boundary events</b>:</p>
  <ul><li><b>Interrupting</b> (contorno <b>contínuo</b>): quando dispara, a atividade é <b>interrompida</b> e não completa.</li>
  <li><b>Non-interrupting</b> (contorno <b>tracejado</b>): a atividade <b>continua</b> e abre-se um caminho paralelo (ex.: lembrete ao fim de 2 dias).</li></ul>
  <p><b>Error</b> intermédio é <b>sempre interrupting</b>: depois de um erro a atividade aborta (<i>exception flow</i>). Para reportar e continuar usa-se um Signal (ou Escalation) <b>non-interrupting</b>.</p>
  <p>Armadilhas com tempo: usar um <b>start</b> timer onde devia estar um intermediate; confundir o timer como <b>delay</b> (no fluxo) com o timer como <b>prazo</b> (boundary, a duração máxima de uma tarefa).</p>
  <p><b>Compensation</b>: desfaz (“roll back”) uma atividade <b>já concluída</b>. A atividade a desfazer tem um boundary event de compensação ligado por associação à <b>compensation activity</b> (marcador ⏪). É disparada por um throw de compensação. Ex.: falha a entrega → compensar o pagamento.</p>
  <p><b>Link events</b>: um par throw/catch que funciona como “go to” no mesmo processo, para não cruzar setas.</p>`,
  d: { kind: 'bpmn', w: 470, h: 210, alt: 'Boundary timer non-interrupting e error interrupting', nodes: [
    { id: 's', k: 'start', x: 30, y: 55 }, { id: 't', k: 'task', x: 170, y: 55, w: 150, h: 64, lb: 'Processar encomenda' },
    { id: 'b1', k: 'int', tr: 'timer', ni: true, att: 't', off: -38 }, { id: 'b2', k: 'int', tr: 'error', att: 't', off: 38 },
    { id: 'e', k: 'end', x: 330, y: 55 }, { id: 'r', k: 'task', x: 132, y: 160, w: 100, h: 46, lb: 'Enviar lembrete' }, { id: 'h', k: 'task', x: 330, y: 160, w: 100, h: 46, lb: 'Tratar erro' }],
    edges: [{ f: 's', t: 't' }, { f: 't', t: 'e' }, { f: 'b1', t: 'r' }, { f: 'b2', t: 'h', via: [[208, 160]], so: 'b' }],
    texts: [{ x: 132, y: 200, t: 'tracejado = a tarefa continua', s: 9.5, w: 600 }, { x: 330, y: 200, t: 'contínuo = a tarefa é interrompida', s: 9.5, w: 600 }] },
  key: 'Tracejado = a atividade continua. Error = interrompe sempre.' },
{ id: 'bpmn-gw', t: 'bpmn', title: 'Gateways e o jogo dos tokens',
  html: `<div class="tbl-wrap"><table><tr><th>Gateway</th><th>Split (divergir)</th><th>Merge (convergir)</th></tr>
  <tr><td><b>Exclusive (XOR) ✕</b></td><td>Escolhe <b>um e só um</b> caminho. Condições avaliadas de cima para baixo; segue o primeiro verdadeiro. <b>Default flow</b> (traço) se todas forem falsas.</td><td>Continua <b>assim que chega um</b> token (não sincroniza).</td></tr>
  <tr><td><b>Parallel (AND) +</b></td><td>Cria tokens em <b>todos</b> os caminhos (concorrentes).</td><td><b>Espera por todos</b> e junta num só token.</td></tr>
  <tr><td><b>Inclusive (OR) ○</b></td><td>Segue <b>todos</b> os caminhos cuja condição é verdadeira (0..*), em paralelo; default opcional.</td><td>Sincroniza o <b>subconjunto</b> de ramos que foi ativado.</td></tr>
  <tr><td><b>Event-based ⬠</b></td><td>Escolha baseada em <b>eventos</b> (não em dados): o <b>primeiro evento</b> a ocorrer ganha; os outros caminhos deixam de valer. Pode <b>iniciar</b> um processo se não tiver fluxos de entrada.</td><td>—</td></tr>
  <tr><td><b>Complex ✱</b></td><td colspan="2">Condições ou sincronizações complexas que os outros não exprimem.</td></tr></table></div>
  <p>Armadilhas clássicas:</p>
  <ul><li><b>XOR split → AND merge</b>: <b>deadlock</b>; o AND espera um token que nunca vem.</li>
  <li><b>AND split → XOR merge</b>: <b>sem sincronização</b>; o que vem a seguir corre <b>duas vezes</b>.</li>
  <li>Gateway com uma só saída e uma só entrada não decide nada. Uma decisão precisa de pelo menos 2 saídas.</li>
  <li>Gateways só se ligam por <b>sequence flows</b>: uma mensagem não pode entrar num gateway nem ser uma alternativa dele.</li>
  <li>Divergências sem convergência dão “pontas soltas”.</li></ul>`,
  d: { kind: 'bpmn', w: 520, h: 130, alt: 'AND split e AND join', nodes: [
    { id: 's', k: 'start', x: 30, y: 62 }, { id: 'g1', k: 'and', x: 100, y: 62 }, { id: 'a', k: 'task', x: 205, y: 28, lb: 'Notificar cliente' }, { id: 'b', k: 'task', x: 205, y: 100, lb: 'Pagar sinistro' },
    { id: 'g2', k: 'and', x: 310, y: 62 }, { id: 'c', k: 'task', x: 400, y: 62, lb: 'Fechar sinistro' }, { id: 'e', k: 'end', x: 490, y: 62 }],
    edges: [{ f: 's', t: 'g1' }, { f: 'g1', t: 'a' }, { f: 'g1', t: 'b' }, { f: 'a', t: 'g2' }, { f: 'b', t: 'g2' }, { f: 'g2', t: 'c' }, { f: 'c', t: 'e' }] },
  key: 'Fecha cada gateway com outro do mesmo tipo e conta os tokens.' },
{ id: 'bpmn-act', t: 'bpmn', title: 'Atividades: tasks, sub-processes, marcadores',
  html: `<ul><li><b>Task</b>: unidade atómica de trabalho. Tipos: <b>User</b> (humano com sistema), <b>Service</b> (automático, sem humano), <b>Manual</b> (sem sistema, físico), <b>Script</b>, <b>Business Rule</b> (decisão por regras), <b>Send</b>, <b>Receive</b>.</li>
  <li><b>Sub-process</b> (marcador +): agrupa tarefas; colapsado ou expandido. Os sequence flows <b>não atravessam</b> a fronteira de um sub-process expandido; este deve ter start e end próprios.</li>
  <li><b>Ad-hoc sub-process</b> (marcador ~): agrupa atividades <b>sem definir a ordem</b> (ex.: “Limpar a casa”).</li>
  <li><b>Call activity</b> (contorno grosso): invoca um processo reutilizável.</li>
  <li><b>Loop</b> (↻): repete até a condição se verificar. <b>Multi-instance</b>: ||| paralelo, ≡ sequencial.</li>
  <li><b>Compensation activity</b> (⏪): desfaz uma atividade já feita.</li></ul>
  <p><b>Receive task vs catch message event</b>: a receive task é <b>espera ativa</b> (recurso alocado; reação rápida, mas custa tempo e dinheiro). O catch event é <b>espera passiva</b> (recurso livre; reação mais lenta). Não são a mesma coisa.</p>
  <p>Regra de ouro da execução: <b>só as atividades consomem recursos</b> e são executadas por agentes. Eventos, sequence flows e gateways são tratados pela infraestrutura (motor BPM, regras). “O gestor decide” modela-se como <b>atividade</b> (Analisar pedido) seguida de gateway; o gateway em si não é trabalho de ninguém.</p>
  <p>Em análise inicial pode ser melhor <b>não especificar o tipo de task</b> até ser necessário.</p>`,
  key: 'Só atividades custam tempo e dinheiro; gateways e eventos não.' },
{ id: 'bpmn-collab', t: 'bpmn', title: 'Pools, lanes, message flows e colaboração',
  html: `<ul><li><b>Pool</b> = um <b>participante</b> (organização, departamento, entidade externa) como “ambiente de execução”. <b>Uma pool contém um só processo.</b></li>
  <li><b>Lane</b> = subdivisão de uma pool por <b>roles</b> ou unidades.</li>
  <li><b>Sequence flows não atravessam pools</b>, mas <b>atravessam lanes</b>.</li>
  <li><b>Message flows só ligam pools diferentes</b>; nunca dentro da mesma pool.</li></ul>
  <p><b>Private process</b>: interno a um participante, detalhado. <b>Public (abstract) process</b>: mostra só as atividades que comunicam com o exterior (os “touch-points”). <b>Collaboration</b>: duas ou mais pools e as mensagens entre elas.</p>
  <p>Num <b>process diagram</b> todas as pools externas têm de ser <b>black-box</b> (colapsadas). Heurística: um diagrama deve ter <b>exatamente uma pool expandida</b> (o processo em âmbito, aquilo que se controla e onde estão os requisitos) e, se preciso, pools colapsadas (ex.: o cliente: só sabemos que nos manda pedidos).</p>
  <p>Lanes devem ser <b>roles específicos</b>: “Departamento de Vendas” é vago demais e “Joana Silva” é específico demais (uma pessoa não é um papel: férias, baixa, saída levam o conhecimento).</p>
  <p>Modelar com pools separadas, em vez de lanes, torna a necessidade de <b>coordenação</b> explícita através das mensagens.</p>`,
  d: { kind: 'bpmn', w: 560, h: 220, alt: 'Colaboração Cliente e Pizzaria', pools: [
    { id: 'pc', x: 6, y: 6, w: 548, h: 50, lb: 'Cliente', collapsed: true },
    { id: 'pp', x: 6, y: 72, w: 548, h: 142, lb: 'Pizzaria', lanes: [{ lb: 'Empregado', h: 70 }, { lb: 'Pizzaiolo', h: 72 }] }],
    nodes: [{ id: 's', k: 'start', tr: 'msg', x: 90, y: 107 }, { id: 't1', k: 'task', x: 180, y: 107, w: 90, h: 46, lb: 'Registar pedido' }, { id: 't2', k: 'task', x: 300, y: 178, w: 90, h: 46, lb: 'Fazer pizza' }, { id: 't3', k: 'task', x: 420, y: 107, w: 90, h: 46, tt: 'send', lb: 'Entregar pizza' }, { id: 'e', k: 'end', x: 515, y: 107 }],
    edges: [{ f: 'pc', t: 's', k: 'msg', fx: 90, lb: 'pedido' }, { f: 's', t: 't1' }, { f: 't1', t: 't2' }, { f: 't2', t: 't3' }, { f: 't3', t: 'e' }, { f: 't3', t: 'pc', k: 'msg', tx: 420, lb: 'pizza' }] },
  key: 'Mensagens entre pools, sequência dentro da pool. Lanes = roles.' },
{ id: 'bpmn-errors', t: 'bpmn', title: 'Anti-patterns e boas práticas',
  html: `<ul><li><b>Uncontrolled flow</b>: falta de start ou end. Heurística: <b>um só start</b> e o <b>mínimo de ends</b>; dois ends têm de significar <b>resultados diferentes</b>.</li>
  <li><b>Divergência sem convergência</b>: muitos ends podem indicar gateways que nunca fecham.</li>
  <li><b>Message flow dentro da mesma pool</b>: errado; usa sequence flow. <b>Sequence flow entre pools</b>: errado; usa message flow.</li>
  <li><b>Misuse de task types</b>: service task para introdução manual de dados é enganador.</li>
  <li><b>Tarefas redundantes</b>: “Iniciar tarefa A”, “Tarefa A terminada”, “Receber documento” (isso é um evento ou faz parte da tarefa).</li>
  <li><b>Tempo</b>: start timer usado como atraso; timer de duração confundido com timer de exceção.</li>
  <li><b>Gateways</b>: mensagem a entrar num gateway; decisão com uma só saída; risco de <b>deadlock</b> (OR/XOR a fechar com AND).</li>
  <li><b>Evento intermédio a terminar o fluxo</b> (sem saída): usa um end event.</li>
  <li><b>Terminate</b> num ramo paralelo pode matar o trabalho dos outros ramos (ex.: impedir o envio de uma mensagem).</li>
  <li><b>XOR sem condições</b> nas saídas: incerteza lógica.</li></ul>`,
  key: 'Antes de entregar: um start, ends com significado, cada split fechado, mensagens só entre pools.' },
]);
})();
