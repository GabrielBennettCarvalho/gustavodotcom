/* ===== 2nd test: how the test is, the past cases and checking requirements against diagrams ===== */
(() => {
const U = d => `<div class="diagram">${UML.render(d)}</div>`;
const req = CASES.tkReq.map(([n, t]) => `<li data-n="${n}">${t}</li>`).join('');
STUDY.lessons('ams', [
{ id: 'exam2-format', t: 'exam2', title: 'Como é o 2.º teste (MAP 2)',
  html: `<p>Os testes anteriores da 2.ª parte pedem sempre as mesmas coisas, em dois grupos:</p>
  <div class="tbl-wrap"><table><tr><th>Teste</th><th>Grupo I: termos</th><th>Grupo II: diagramas</th></tr>
  <tr><td><b>MAP 2 2022/23</b></td><td>8 frases a completar com o número do termo UML certo (8 valores, 1 por certa, 0 se errada ou em branco)</td><td>Requisitos R1–R8 de um sistema de bilhetes (TK) com um diagrama de casos de uso e um modelo de domínio. 2.1: dizer para cada requisito se está realizado, onde, e o que falta ou está errado (9 valores). 2.2: produzir a máquina de estados do Bilhete (3 valores).</td></tr>
  <tr><td><b>Exame 1 2022/23</b> (1,5 h, uma folha A4 de notas)</td><td>15 termos: ArchiMate, Requisitos (Pohl) e SysML, 0,5 cada</td><td>Sobre o UoD da GoKnow: completar o diagrama de casos de uso com pelo menos um include e um extend (3,5); diagrama de sequência de um caso (3); modelo de domínio com atributos, sem operações, com os enumerados (4); completar a máquina de estados de uma classe (2,5).</td></tr></table></div>
  <p><b>Como preparar com a app</b>:</p>
  <ul><li><b>Grupo I</b>: as perguntas “Completa…” de cada tema e o exame simulado do 2.º teste, que tem as mesmas regras (sem desconto).</li>
  <li><b>Grupo II</b>: a <b>Oficina de diagramas</b>. Cada diagrama faz-se em três voltas: construir peça a peça, no dia seguinte desenhar sozinho no papel e corrigir com a grelha, e uma revisão uma semana depois. É o que entra no plano Hoje.</li>
  <li><b>Verificar requisitos</b> (2.1): a lição seguinte e as perguntas do caso TK.</li></ul>
  <p>O teste modelo do 2.º teste de 2026 ainda não está cá: entra quando chegar, com as suas perguntas e diagramas.</p>`,
  key: 'Grupo I: completar frases com termos UML (sem desconto). Grupo II: verificar requisitos contra diagramas e produzir casos de uso, sequência, classes e máquina de estados.' },
{ id: 'exam2-trace', t: 'exam2', title: 'Verificar requisitos contra os diagramas',
  html: `<p>No MAP 2 (2.1) dá-se uma lista de requisitos e dois diagramas, e pergunta-se para cada requisito se está <b>totalmente</b> ou <b>parcialmente</b> realizado, por que <b>elementos</b>, e como corrigir o que falta. Método para cada requisito:</p>
  <ol><li>Parte o requisito em <b>quem faz o quê</b> (→ caso de uso e ator), <b>que dados</b> (→ classes, atributos, tipos, multiplicidades) e <b>o que muda com o tempo</b> (→ estados, enumerados, eventos).</li>
  <li>Procura cada parte nos diagramas e escreve os <b>IDs</b> (UC7, A9, C5, C6).</li>
  <li>Para cada parte que encontras, confirma o <b>tipo</b> (boolean ou Data?), o <b>número</b> (50 ou 100?), o <b>sentido</b> das multiplicidades e o <b>ator</b> certo.</li>
  <li>Responde: <b>Sim</b> (OK: os elementos) ou <b>Falta algo</b> (OK: o que modela; Falta/Errado: o que falta e como corrigir).</li></ol>
  <div class="tbl-wrap"><table><tr><th>Req.</th><th>Solução oficial</th></tr>
  <tr><td>R1</td><td>Sim. OK: UC7 e A9; C5 e C6.</td></tr>
  <tr><td>R2</td><td>Falta algo. OK: atributos de C6. Mas “inícioReservas” devia ser Data em vez de boolean.</td></tr>
  <tr><td>R3</td><td>Falta algo. OK: C1, C8 e C9. Errado: a multiplicidade C1–C6 devia ser 100 e não 50.</td></tr>
  <tr><td>R4</td><td>Falta algo. OK: A7 e UC6, e C4 (atributo id e associação entre C9 e C3). Errado: multiplicidades de C9–C3 ao contrário.</td></tr>
  <tr><td>R5</td><td>Falta algo. Se a intenção é que UC6 o faça, está errado.</td></tr>
  <tr><td>R6</td><td>Falta algo. Nada o modela: devia existir um caso de uso.</td></tr>
  <tr><td>R7</td><td>Sim. OK: o atributo de duração em C6 e o enumerado Estado.</td></tr>
  <tr><td>R8</td><td>Falta algo. UC5 devia estar associado a A2 e não a A9. OK: C4 mantém o registo histórico.</td></tr></table></div>`,
  key: 'Para cada requisito: quem faz o quê, que dados, o que muda. Procura pelos IDs, confirma tipo, número, sentido e ator. Sim, ou Falta algo com o que corrigir.' },
{ id: 'exam2-tk', t: 'exam2', title: 'Caso do MAP 2: o sistema de bilhetes TK',
  html: `<p>Requisitos do sistema de reserva de bilhetes <b>TK</b> (MAP 2 2022/23):</p><ol class="bd-text">${req}</ol>
  <p>Diagrama de casos de utilização proposto:</p>${U(CASES.tkUC)}
  <p>Modelo de domínio proposto:</p>${U(CASES.tkDM)}
  <p class="muted">Os diagramas estão como no teste, com as falhas que a solução aponta. As perguntas deste caso pedem-te para as encontrar.</p>`,
  key: 'O TK tem 4 casos de uso e 3 atores; no modelo de domínio, Bilhete (Especial, Normal) tem um estado enumerado e a Reserva é a classe-associação Bilhete–Comprador.' },
{ id: 'exam2-goknow', t: 'exam2', title: 'Caso do Exame 1 2022/23: a GoKnow',
  html: `<p>O UoD do Grupo II do Exame 1 2022/23, a partir do qual se fazem os quatro diagramas (casos de uso, sequência, classes e máquina de estados):</p>${CASES.uodHtml(CASES.goknow)}`,
  key: 'Atores: comercial, gestor, diretor, cliente (e docente, que recebe emails). Classes: cliente, pacote, plano, aluno, funcionário… Estados do pacote: pendente, ativo, cancelado, concluído.' },
]);
})();
