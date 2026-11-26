/* ===== 2nd test: which UML symbol is this? (generated, like the ArchiMate and BPMN notation questions) ===== */
(() => {
const Q = [];
const uc2 = (k, A, B) => ({ kind: 'uc', w: 420, h: 110, alt: 'Símbolo UML a identificar', nodes: [A, B], edges: [{ id: 'e', a: A.id, b: B.id, k }] });
const cls2 = (k, extra = {}) => ({ kind: 'cls', w: 420, h: 100, alt: 'Relação UML a identificar', nodes: [{ id: 'A', lb: 'A', x: 30, y: 30, w: 90 }, { id: 'B', lb: 'B', x: 300, y: 30, w: 90 }], edges: [Object.assign({ id: 'e', a: 'A', b: 'B', k }, extra)] });
const st1 = n => ({ kind: 'stm', w: 220, h: 90, alt: 'Símbolo UML a identificar', nodes: [Object.assign({ id: 'x', x: 110, y: 45 }, n)], edges: [] });
const SYM = [
  [uc2('include', { id: 'A', k: 'uc', x: 90, y: 55, lb: 'Fazer pagamento' }, { id: 'B', k: 'uc', x: 330, y: 55, lb: 'Validar utilizador' }), 'Include (de Fazer pagamento para Validar utilizador)', 'seta tracejada «include» da base para o caso incluído, sempre executado.', ['Extend (de Fazer pagamento para Validar utilizador)', 'Generalização entre os dois casos de uso', 'Associação simples entre dois casos de uso'], 'uc-rel'],
  [uc2('extend', { id: 'A', k: 'uc', x: 90, y: 55, lb: 'Imprimir recibo' }, { id: 'B', k: 'uc', x: 330, y: 55, lb: 'Fazer pagamento' }), 'Extend (de Imprimir recibo para Fazer pagamento)', 'seta tracejada «extend» da extensão para a base: comportamento opcional.', ['Include (de Imprimir recibo para Fazer pagamento)', 'Generalização entre casos de uso', 'Associação entre casos de uso'], 'uc-rel'],
  [uc2('gen', { id: 'A', k: 'actor', x: 90, y: 50, lb: 'Cliente VIP' }, { id: 'B', k: 'actor', x: 330, y: 50, lb: 'Cliente' }), 'Generalização entre atores', 'linha contínua com triângulo vazio no ator mais geral.', ['Associação entre atores', 'Include entre atores', 'Extend entre atores'], 'uc-rel'],
  [uc2('assoc', { id: 'A', k: 'actor', x: 90, y: 50, lb: 'Comercial' }, { id: 'B', k: 'uc', x: 320, y: 50, lb: 'Registar cliente' }), 'Associação entre ator e caso de uso', 'linha simples: a única relação entre um ator e um caso.', ['Include do ator para o caso', 'Generalização do caso no ator', 'Extend do caso para o ator'], 'uc-basics'],
  [cls2('gen'), 'Generalização (B é o mais geral)', 'linha contínua com triângulo vazio do lado da classe mais geral.', ['Agregação (B é o todo, A a parte)', 'Associação navegável de A para B', 'Dependência de A em relação a B'], 'cls-gen'],
  [cls2('aggr', { mb: '1..*' }), 'Agregação (A é o todo)', 'losango vazio do lado do todo: a parte pode existir sozinha.', ['Composição (A é o todo)', 'Generalização (A é o mais geral)', 'Classe-associação entre A e B'], 'cls-aggr'],
  [cls2('comp', { ma: '1', mb: '1..*' }), 'Composição (A é o todo)', 'losango cheio do lado do todo: a parte só existe num todo de cada vez.', ['Agregação (A é o todo)', 'Generalização (A é o mais geral)', 'Dependência de B em A'], 'cls-aggr'],
  [cls2('assoc', { ma: '1', mb: '0..*', lb: 'tem ▶' }), 'Associação com multiplicidades', 'linha simples com nome e multiplicidades: cada A tem 0 ou mais B.', ['Composição sem losango', 'Generalização com multiplicidades', 'Classe-associação simples'], 'cls-assoc'],
  [{ kind: 'cls', w: 420, h: 170, alt: 'Relação UML a identificar', nodes: [{ id: 'A', lb: 'A', x: 30, y: 25, w: 90 }, { id: 'B', lb: 'B', x: 300, y: 25, w: 90 }, { id: 'C', lb: 'C', x: 165, y: 105, w: 90 }], edges: [{ id: 'e', a: 'A', b: 'B', ma: '*', mb: '*' }, { id: 'c', k: 'aclass', of: 'e', b: 'C' }] },
    'Classe-associação (C é da ligação A–B)', 'classe ligada por linha tracejada à linha da associação.', ['Dependência de C em relação à associação', 'Generalização de A e B na classe C', 'Composição de A e B dentro de C'], 'cls-aclass'],
  [{ kind: 'cls', w: 220, h: 110, alt: 'Classificador UML a identificar', nodes: [{ id: 'E', lb: 'Estado', st: 'enumeration', x: 50, y: 10, lits: ['ativo', 'cancelado'] }], edges: [] }, 'Enumeração', '«enumeration» com uma lista fechada de literais.', ['Data type', 'Classe abstrata', 'Interface'], 'cls-class'],
  [st1({ k: 'init' }), 'Estado inicial', 'círculo cheio: o primeiro estado de cada região.', ['Estado final', 'Junction (pseudoestado)', 'Terminate'], 'stm-pseudo'],
  [st1({ k: 'final' }), 'Estado final', 'círculo cheio dentro de outro: fim da região.', ['Estado inicial', 'Terminate', 'Choice'], 'stm-pseudo'],
  [st1({ k: 'choice' }), 'Choice', 'losango: as guardas das saídas avaliam-se depois do efeito da entrada.', ['Junction', 'Fork', 'Decisão de atividades'], 'stm-pseudo'],
  [st1({ k: 'hist' }), 'History', 'círculo com H: volta ao subestado que estava ativo.', ['Estado inicial', 'Choice', 'Estado final'], 'stm-pseudo'],
  [st1({ k: 'term' }), 'Terminate', 'cruz: destrói o objeto.', ['Estado final', 'Junction', 'Choice'], 'stm-pseudo'],
  [{ kind: 'seq', w: 420, alt: 'Mensagem UML a identificar', lines: [{ id: 'A', lb: ':A' }, { id: 'B', lb: ':B' }], msgs: [{ id: 'm', a: 'B', b: 'A', k: 'reply', lb: 'resultado' }] }, 'Mensagem de resposta', 'seta tracejada com ponta aberta, de volta a quem chamou.', ['Mensagem síncrona', 'Mensagem assíncrona', 'Self-message'], 'seq-basics'],
  [{ kind: 'seq', w: 420, alt: 'Fragmento UML a identificar', lines: [{ id: 'A', lb: ':A' }, { id: 'B', lb: ':B' }], msgs: [{ id: 'm', a: 'A', b: 'B', lb: 'enviar(x)' }], frags: [{ id: 'f', op: 'loop', from: 'm', to: 'm', g: '[para cada x]' }] }, 'Fragmento loop', 'caixa com loop e uma condição: repete as mensagens lá dentro.', ['Fragmento opt', 'Fragmento alt', 'Fragmento break'], 'seq-frag'],
];
SYM.forEach(([d, name, desc, wrong, les], i) => Q.push({ id: 'nu-' + String(i + 1).padStart(2, '0'), t: les.split('-')[0] === 'uc' ? 'uc' : les.split('-')[0], l: i % 3 === 2 ? 2 : 1, les,
  d, q: 'Que elemento UML é este?', o: [name, ...wrong], a: 0, e: `**${name}**: ${desc}` }));
STUDY.questions('ams', Q);
})();
