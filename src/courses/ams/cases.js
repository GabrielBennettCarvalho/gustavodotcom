/* ===== 2nd test: the cases of past tests, shared by lessons, questions and the diagram workshop =====
   TK: MAP 2 2022/23 (ticket booking), its use case diagram and domain model as given in the test (with its faults).
   GoKnow: Exame 1 2022/23, época normal (training packages). Top level on purpose: the later AMS files use CASES. */
const CASES = {
  // MAP 2 2022/23, requirements R1–R8 (as in the test)
  tkReq: [
    ['R1', 'Cada organizador de eventos previamente registado pode criar eventos para o qual pretende disponibilizar bilhetes.'],
    ['R2', 'Cada evento registado deve ter especificado o dia e hora do seu início, a sua duração, o dia e hora em que os seus bilhetes passam a estar disponíveis para reserva, e o dia e hora em que essa disponibilidade cessa.'],
    ['R3', 'Para cada evento são disponibilizados 50 bilhetes do tipo especial e 100 bilhetes do tipo normal, tendo cada tipo de bilhete um custo definido para cada evento.'],
    ['R4', 'Cada bilhete pode ser reservado por um comprador previamente registado no sistema, que recebe um identificador único para pagamento no sistema PG, informando o sistema TK de cada vez que um pagamento ocorrer.'],
    ['R5', 'Quando cessa a disponibilidade para reservar bilhetes para um evento o organizador é informado de todos os bilhetes desse evento que foram pagos.'],
    ['R6', 'Cada comprador recebe um aviso por email sempre que for registado um novo evento.'],
    ['R7', 'Para cada bilhete reservado e que não seja pago num intervalo de tempo definido pelo organizador, a reserva é anulada e o bilhete volta a estar disponível.'],
    ['R8', 'Quando uma reserva de bilhete é anulada, o comprador é informado disso, sendo mantido um registo histórico de todos esses casos.'],
  ],
  // the use case diagram of the MAP (UC5 is associated with A9, the organiser: the fault of R8)
  tkUC: { kind: 'uc', w: 560, h: 300, alt: 'Diagrama de casos de utilização do sistema TK (MAP 2)', sys: { x: 120, y: 10, w: 300, h: 280, lb: 'TK' }, nodes: [
    { id: 'A2', k: 'actor', x: 50, y: 70, lb: 'A2: Comprador' }, { id: 'A7', k: 'actor', x: 50, y: 225, lb: 'A7: PG' }, { id: 'A9', k: 'actor', x: 500, y: 150, lb: 'A9: Organizador' },
    { id: 'UC7', k: 'uc', x: 300, y: 60, lb: 'UC7: Criar evento' }, { id: 'UC1', k: 'uc', x: 215, y: 130, lb: 'UC1: Comprar bilhete' },
    { id: 'UC5', k: 'uc', x: 330, y: 190, lb: 'UC5: Ser informado de reserva anulada', w: 150, h: 40 }, { id: 'UC6', k: 'uc', x: 220, y: 250, lb: 'UC6: Informar de bilhete pago', w: 150, h: 40 } ],
    edges: [{ id: 'a1', a: 'A2', b: 'UC1' }, { id: 'a2', a: 'A9', b: 'UC7' }, { id: 'a3', a: 'A9', b: 'UC5' }, { id: 'a4', a: 'A7', b: 'UC6' }, { id: 'a5', a: 'A9', b: 'UC6' }] },
  // the domain model of the MAP, with its faults: inícioReservas as boolean, 50 normal tickets, C9–C3 multiplicities reversed
  tkDM: { kind: 'cls', w: 660, h: 400, alt: 'Modelo de domínio do sistema TK (MAP 2)', nodes: [
    { id: 'Est', lb: 'Estado', st: 'enumeration', x: 10, y: 10, lits: ['disponível', 'reservado', 'pago', 'indisponível'] },
    { id: 'C6', lb: 'C6: Evento', x: 150, y: 10, w: 200, attrs: ['inícioEvento: Data', 'duraçãoEvento: Duração', 'inícioReservas: boolean', 'duraçãoReserva: Duração', 'fimReservas: Data'] },
    { id: 'C5', lb: 'C5: Organizador', x: 470, y: 30 },
    { id: 'C8', lb: 'C8: Especial', x: 130, y: 170 }, { id: 'C1', lb: 'C1: Normal', x: 255, y: 170 },
    { id: 'C4', lb: 'C4: Reserva', x: 470, y: 140, attrs: ['data: Data', 'id: Identificador', 'pagamento: Data'] },
    { id: 'C9', lb: 'C9: Bilhete', x: 180, y: 255, attrs: ['custo: Custo', 'estado: Estado'] },
    { id: 'C3', lb: 'C3: Comprador', x: 470, y: 265, attrs: ['email: Email'] },
    { id: 'Dt', lb: 'Data', st: 'dataType', x: 10, y: 140, attrs: ['dia: Dia', 'hora: Hora'] },
    { id: 'Du', lb: 'Duração', st: 'dataType', x: 10, y: 225, w: 100 }, { id: 'Cu', lb: 'Custo', st: 'dataType', x: 10, y: 285, w: 100 },
    { id: 'Id', lb: 'Identificador', st: 'dataType', x: 10, y: 345, w: 100 }, { id: 'Em', lb: 'Email', st: 'dataType', x: 470, y: 345, w: 100 } ],
    edges: [{ id: 'o', k: 'aggr', a: 'C5', b: 'C6', ma: '1', mb: '*', as: 'l', bs: 'r', bo: -0.3 },
      { id: 'e8', k: 'aggr', a: 'C6', b: 'C8', mb: '50', as: 'b', ao: -0.2, bs: 't' }, { id: 'e1', k: 'aggr', a: 'C6', b: 'C1', mb: '50', as: 'b', ao: 0.2, bs: 't' },
      { id: 'g8', k: 'gen', a: 'C8', b: 'C9', as: 'b', bs: 't', bo: -0.25 }, { id: 'g1', k: 'gen', a: 'C1', b: 'C9', as: 'b', bs: 't', bo: 0.25 },
      { id: 'r', a: 'C9', b: 'C3', ma: '0..1', mb: '0..*', as: 'r', bs: 'l' }, { id: 'rc', k: 'aclass', of: 'r', b: 'C4' }] },
  // Exame 1 2022/23: the GoKnow case (UoD)
  goknow: [
    { h: 'Caso de estudo: GoKnow' },
    { id: 'g0', t: 'A empresa [[GoKnow|gk]] gere e comercializa [[pacotes de formação|pac]] para grupos restritos de [[alunos|alu]]. Para suportar o negócio é utilizado o sistema de informação [[GetKnowSoft|gks]].' },
    { id: 'g0b', t: 'A GoKnow encontra-se organizada num conjunto de [[centros de formação|cen]] e tem vários [[funcionários|fun]] com diferentes papéis: [[diretor|dir]], [[gestor|ges]], [[comercial|com]] e [[docente|doc]].' },
    { h: 'A. Processos de negócio e o sistema GetKnowSoft' },
    { id: 'a1', n: 'A1', t: 'Um [[cliente|cli]] apresenta-se num centro da GoKnow e pede para ser atendido por um comercial, e o comercial cria o registo de cliente no sistema GetKnowSoft.' },
    { id: 'a2', n: 'A2', t: 'Se o cliente decidir comprar um dos pacotes de formação, o comercial deve registar no GetKnowSoft a criação de um [[plano de formação|pla]], e pede depois ao cliente para realizar o respetivo [[pagamento|pag]].' },
    { id: 'a3', n: 'A3', t: 'O cliente deve realizar o pagamento no prazo de 48 horas. Caso o pagamento ocorra nesse período de tempo, o comercial regista esse pagamento no sistema GetKnowSoft, imprime o [[formulário do plano de formação|form]], assina e envia ao cliente, e o processo termina com sucesso.' },
    { id: 'a4', n: 'A4', t: 'Caso o pagamento não se tenha verificado no prazo de 48 horas, o comercial regista o plano de formação no estado suspenso e o processo termina.' },
    { h: 'B. Mais informações sobre o sistema GetKnowSoft' },
    { id: 'b1', n: 'B1', t: 'Permitir que qualquer gestor possa criar e alterar pacotes de formação. Cada pacote de formação deve ter nome e identificador único, data de início e de fim de validade, descrição dos temas de formação, preço por aluno, capacidade mínima e máxima (i.e., número mínimo e máximo de vagas por plano de formação).' },
    { id: 'b2', n: 'B2', t: 'Permitir que qualquer comercial possa criar registos de clientes.' },
    { id: 'b3', n: 'B3', t: 'Permitir que qualquer comercial possa criar planos de formação. O plano de formação inclui a seguinte informação: identificação do pacote de formação, identificação de cada um dos alunos indicados pelo cliente (que deverá consistir no nome, data de nascimento e número de passaporte), identificação do docente responsável, e [[custo total|custo]].' },
    { id: 'b3b', t: 'A criação de um plano de formação no GetKnowSoft consiste nos seguintes passos: o comercial seleciona o pacote de formação pretendido, indica a informação de cada aluno (nome, data de nascimento e número de passaporte), seleciona o docente responsável pela formação, e confirma as informações. O sistema realiza a validação, envia mensagem de confirmação via email para o cliente e para o docente associado, e confirma o sucesso da operação.' },
    { id: 'b4', n: 'B4', t: 'Um cliente quando é registado no GetKnowSoft fica automaticamente com uma [[conta de utilizador|conta]] identificada por email e senha.' },
    { id: 'b5', n: 'B5', t: 'Um cliente pode consultar os seus planos de formação e cancelar um plano de formação, caso o cancelamento seja realizado até 30 dias antes do seu início.' },
    { id: 'b6', n: 'B6', t: 'Cada registo de cliente inclui o nome do cliente, NIF (número de identificação fiscal), telefones e emails.' },
    { id: 'b7', n: 'B7', t: 'Um pacote de formação quando é criado no sistema por um gestor fica no estado pendente.' },
    { id: 'b8', n: 'B8', t: 'Compete exclusivamente ao diretor colocar um pacote de formação no estado ativo ou no estado cancelado.' },
    { id: 'b9', n: 'B9', t: 'Quando um pacote de formação se encontra no estado ativo, pode ser consultado e criado um plano de formação por qualquer comercial. Todavia, quando a data do fim de validade do pacote de formação é atingida, o pacote de formação passa automaticamente para o estado concluído.' },
    { id: 'b10', n: 'B10', t: 'No final de cada mês o sistema produz e envia para o gestor da GoKnow um [[relatório comercial|rel]], via email.' },
  ],
};
// the statement as lesson HTML (spans become plain text)
CASES.uodHtml = list => `<ol class="bd-text">${list.map(s => s.h ? `<li class="bd-h">${s.h}</li>` : `<li${s.n ? ` data-n="${s.n}"` : ''}>${s.t.replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1')}</li>`).join('')}</ol>`;
