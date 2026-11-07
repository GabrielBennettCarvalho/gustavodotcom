/* ===== SO exam route: the 7 groups of the exam, in the exam's order =====
   Built from the exams of 2022/23 to 2025/26. Each stop: briefing → lessons, each followed by exercises → a round as in the exam. */
STUDY.course({
  id: 'so',
  route: {
    title: 'Percurso do exame',
    desc: 'O exame grupo a grupo, do 1 (ficheiros) ao 7 (memória): o que sai sempre, a teoria com analogias e exemplos, e exercícios no estilo do exame.',
    heading: 'O exame de SO, grupo a grupo',
    intro: 'Os exames de 2022/23 a 2025/26 têm sempre os mesmos 7 grupos, pela mesma ordem. Cada paragem diz-te o que esse grupo costuma pedir, ensina a matéria com exemplos e analogias e acaba com uma ronda como no exame.',
    stops: [
{ id: 'g1', part: 'Grupo 1', title: 'Sistemas de ficheiros', pts: '≈ 3 valores', topics: ['fs'], drill: 6,
  sum: 'Caminhos com . e .., descritores partilhados por dup, redireção, inodes e a conta dos blocos do ext3.',
  lessons: ['f-path', 'f-tables', 'f-dup', 'f-redir', 'f-calls', 'f-alloc', 'f-inode', 'f-blocks', 'f-links'],
  brief: `<p>O Grupo 1 abre o exame e vale entre 2,6 e 3,4 valores. Nos 8 exames que vimos, saem sempre três tipos de pergunta:</p>
  <div class="tbl-wrap"><table><tr><th>O que sai</th><th>Quantas vezes</th><th>Como aparece</th></tr>
  <tr><td><b>Programa com open / dup / lseek / write</b>: o que fica no ficheiro, ou que read lê o quê</td><td>6 em 8</td><td>código curto; às vezes com <code>close(1); dup(fd)</code> e <code>printf</code></td></tr>
  <tr><td><b>Contar blocos de referências no ext3</b> (tamanho de bloco, referência de 4 ou 8 bytes, tamanho do ficheiro)</td><td>7 em 8</td><td>valor alto (1 a 1,5 v.), muitas vezes "sem desconto"</td></tr>
  <tr><td><b>Afirmações sobre inodes, FAT, CP/M, VFS, links, open/mkfifo</b></td><td>8 em 8</td><td>escolha múltipla de 0,6 v.</td></tr>
  <tr><td>Caminho relativo com <code>..</code></td><td>2 em 8</td><td>pergunta rápida, ponto fácil</td></tr></table></div>
  <h4>As três armadilhas que mais tiram pontos</h4>
  <ul><li><b>dup partilha o cursor; um segundo open não.</b> É o centro de quase todas as perguntas de código.</li>
  <li><b>close(1) antes de dup(fd)</b>: o dup dá sempre o <i>menor</i> descritor livre, por isso passa a ser o 1 (o stdout).</li>
  <li><b>Na conta dos blocos</b>, os 12 primeiros blocos são diretos e não gastam blocos de referências.</li></ul>
  <p>Vamos por ordem: primeiro como o núcleo guarda um ficheiro aberto (as três tabelas), depois o que muda com dup e redireção, e por fim o que está dentro de um inode e a conta dos blocos.</p>`,
  drillIntro: '<p>Agora como no exame: código para seguir à mão, contas de blocos e afirmações para julgar. Desenha as três tabelas (descritores, ficheiros abertos, inodes) num papel antes de responder às perguntas de código.</p>' },
{ id: 'g2', part: 'Grupo 2', title: 'Processos e tarefas', pts: '≈ 3,2 valores', topics: ['proc'], drill: 6,
  sum: 'Prever o output de programas com fork, exec e wait, e os erros clássicos com pthreads.',
  lessons: ['p-fork', 'p-trace', 'p-exec', 'p-wait', 'p-thr', 'p-thrbugs', 'p-modes'],
  brief: `<p>O Grupo 2 é quase todo "o que imprime este programa?". Vale cerca de 3,2 valores e, desde 2024/25, as perguntas de output pedem para <b>escrever o output</b>, sem desconto mas sem opções para te guiar.</p>
  <div class="tbl-wrap"><table><tr><th>O que sai</th><th>Quantas vezes</th></tr>
  <tr><td><b>Output de fork + wait + printf</b> (ordem das linhas, valores de variáveis depois do fork)</td><td>7 em 8</td></tr>
  <tr><td><b>fork + exec</b>: o que se imprime quando o exec funciona e quando falha</td><td>6 em 8</td></tr>
  <tr><td><b>Threads</b>: passar <code>&amp;i</code> a várias tarefas, devolver um ponteiro para a pilha, variável global sem trinco</td><td>6 em 8</td></tr>
  <tr><td>Afirmações: setuid, modo núcleo, o que a exec mantém, o que fork devolve</td><td>6 em 8</td></tr></table></div>
  <h4>O método que resolve quase tudo</h4>
  <ul><li>Desenha a <b>árvore de processos</b>: cada fork parte um ramo em dois.</li>
  <li>Em cada ramo, segue as variáveis: depois do fork, <b>cada processo tem a sua cópia</b>.</li>
  <li>Marca os <b>wait</b>: são eles que fixam a ordem. Sem wait, a ordem entre processos não é garantida.</li>
  <li>Um <b>exec bem sucedido nunca regressa</b>: risca tudo o que está a seguir no código desse processo.</li></ul>`,
  drillIntro: '<p>Ronda de exame: programas para seguir à mão. Antes de escolher, escreve o output completo num papel, linha a linha, e só depois compara com as opções.</p>' },
{ id: 'g3', part: 'Grupo 3', title: 'Exclusão mútua', pts: '1,8 valores', topics: ['mutex'], drill: 5,
  sum: 'Três perguntas de 0,6: como se implementa um trinco, granularidade e read-write locks, e o jantar dos filósofos.',
  lessons: ['m-race', 'm-impl', 'm-gran', 'm-dead'],
  brief: `<p>O Grupo 3 tem, desde o 2.º exame de 2022/23, <b>sempre três perguntas de 0,6 valores</b>, e os temas repetem-se de exame para exame:</p>
  <div class="tbl-wrap"><table><tr><th>Pergunta</th><th>Tema</th></tr>
  <tr><td>3.1</td><td><b>Implementação de trincos</b>: algoritmo da padaria de Lamport, test-and-set, inibir interrupções, trinco gerido pelo núcleo. Quem faz espera ativa e quem bloqueia?</td></tr>
  <tr><td>3.2</td><td><b>Mutex vs read-write lock</b>, granularidade fina vs grossa, ordem de aquisição</td></tr>
  <tr><td>3.3</td><td><b>Jantar dos filósofos</b>: interblocagem, try_lock, míngua (livelock), recuo aleatório, ordem dos garfos</td></tr></table></div>
  <h4>Palavras que decidem a resposta</h4>
  <ul><li><b>"sempre"</b> e <b>"nunca"</b> quase sempre tornam a afirmação falsa (read-write locks são <i>sempre</i> melhores? Não).</li>
  <li>Com try_lock não há <b>interblocagem</b>, mas pode haver <b>míngua</b> (livelock). O recuo <b>aleatório</b> resolve isso com alta probabilidade.</li>
  <li>Instruções atómicas (test-and-set) dão exclusão mútua mas <b>não evitam espera ativa</b>.</li></ul>`,
  drillIntro: '<p>Agora como no exame: afirmações para julgar. Procura a palavra que torna a afirmação falsa ("sempre", "nunca", "só", "garante").</p>' },
{ id: 'g4', part: 'Grupo 4', title: 'Semáforos e variáveis de condição', pts: '≈ 3,5 valores', topics: ['sync'], drill: 6,
  sum: 'O grupo que mais vale: preencher caixas em produtor-consumidor, barbeiro, leitores-escritores, e o que acontece se trocares linhas.',
  lessons: ['s-sem', 's-pc', 's-cv', 's-pccv', 's-rw', 's-boxes'],
  brief: `<p>O Grupo 4 é o mais pesado do exame (3,3 a 3,9 valores). Tem sempre <b>um exercício de preencher caixas</b> (1,5 a 2 valores, quase sempre sem desconto) e várias perguntas curtas.</p>
  <div class="tbl-wrap"><table><tr><th>O que sai</th><th>Quantas vezes</th></tr>
  <tr><td><b>Preencher caixas</b> com lock/unlock, sem_wait/sem_post, cond_wait/signal/broadcast, while/if, valores iniciais</td><td>8 em 8</td></tr>
  <tr><td><b>Produtor-consumidor</b>: com semáforos ou com variáveis de condição</td><td>6 em 8</td></tr>
  <tr><td><b>E se trocares estas duas linhas?</b> (sem_wait e lock, unlock e sem_post)</td><td>2 em 8</td></tr>
  <tr><td><b>Com que valor começa o semáforo?</b> (0 para eventos, N para recursos, 1 para exclusão)</td><td>5 em 8</td></tr>
  <tr><td>Problemas clássicos: leitores-escritores, barbeiro, mina de ouro / fábrica / ovos (simulações com várias condições)</td><td>6 em 8</td></tr></table></div>
  <h4>As quatro regras que preenchem quase todas as caixas</h4>
  <ul><li><b>Esperar no semáforo antes de fechar o trinco</b>, nunca ao contrário (senão dormes com a chave no bolso: interblocagem).</li>
  <li><b>cond_wait sempre dentro de um while</b>, com o trinco fechado.</li>
  <li>Quem muda o estado de que outros esperam <b>assinala</b> (signal se basta acordar um, broadcast se podem avançar vários ou há tipos diferentes à espera na mesma condição).</li>
  <li>Cada <b>lock</b> tem o seu <b>unlock</b> em todos os caminhos do código.</li></ul>`,
  drillIntro: '<p>Ronda de exame: código com caixas e afirmações sobre trocas de linhas. Para cada caixa pergunta-te: estou com o trinco? posso ter de esperar? alguém está à espera do que acabei de mudar?</p>' },
{ id: 'g5', part: 'Grupo 5', title: 'Signals', pts: '1,8 valores', topics: ['sig'], drill: 5,
  sum: 'kill, signal, pause, quem trata o signal, o que não se pode ignorar e o que é seguro fazer num handler.',
  lessons: ['g-what', 'g-how', 'g-api'],
  brief: `<p>O Grupo 5 vale 1,2 a 2,4 valores e é dos mais previsíveis. Repetem-se quase sempre as mesmas ideias:</p>
  <ul><li><b>Que chamada envia um signal?</b> <code>kill(pid, sig)</code>, com o PID do <i>destino</i> primeiro. (sai em 3 dos últimos 4 exames)</li>
  <li><b>Que chamada espera por um signal?</b> <code>pause()</code>.</li>
  <li><b>printf, malloc e scanf não são seguros num handler</b>; <code>write</code> é.</li>
  <li><b>SIGKILL</b> (e SIGSTOP) não se podem ignorar nem tratar.</li>
  <li><b>System V vs BSD</b>: em System V o handler volta ao comportamento por omissão depois de correr, por isso tem de se reinstalar.</li>
  <li><b>Quando corre o handler?</b> Quando o processo vai voltar do núcleo para o modo utilizador; corre em modo utilizador.</li>
  <li><b>Programas com handlers</b>: completar com signal / pause / read / exit, ou dizer o que acontece com CTRL+C.</li></ul>`,
  drillIntro: '<p>Ronda de exame. Lembra-te: os signals não ficam em fila (dois iguais pendentes contam como um) e o handler só corre quando o processo volta ao modo utilizador.</p>' },
{ id: 'g6', part: 'Grupo 6', title: 'Pipes, núcleo e escalonamento', pts: '≈ 3,5 valores', topics: ['pipe', 'sched'], drill: 7,
  sum: 'Pipes e FIFOs com fork, a arquitetura do núcleo, estados dos processos, prioridades do Unix e a latência do CFS.',
  lessons: ['i-pipe', 'i-fifo', 'i-redir', 'i-kernel', 'c-states', 'c-unix', 'c-cfs'],
  brief: `<p>O Grupo 6 junta duas matérias e vale 3 a 3,9 valores. Divide-se sempre assim:</p>
  <div class="tbl-wrap"><table><tr><th>Parte</th><th>O que sai</th></tr>
  <tr><td><b>Pipes e FIFOs</b></td><td>Programa com pipe + fork: quem lê o quê, quem fica bloqueado. Pipe vs FIFO (nome, open bloqueante, SIGPIPE). Completar um programa pai → filho. Redireção com dup.</td></tr>
  <tr><td><b>Núcleo</b></td><td>Monolítico vs micro-núcleo vs camadas, duas pilhas, quando entra o núcleo, a última instrução do despacho (RTI).</td></tr>
  <tr><td><b>Estados</b></td><td>Diagrama Executável / Em execução / Bloqueado: qual a transição que <b>não existe</b>.</td></tr>
  <tr><td><b>Unix clássico</b></td><td>Número menor = mais prioritário; o núcleo usa prioridades negativas; um processo que bloqueia converge para a prioridade base; interativos sobem.</td></tr>
  <tr><td><b>CFS</b></td><td><b>Latência efetiva</b> com target latency e minimum granularity (sai em 5 dos últimos 6 exames!), vruntime de um processo novo ou depois de bloquear.</td></tr></table></div>
  <h4>A conta do CFS que vale pontos certos</h4>
  <p>Fatia = latência alvo ÷ número de executáveis. Se a fatia ficar abaixo da granularidade mínima, cada um recebe a mínima e a latência passa a ser <b>n × granularidade mínima</b>. Só contam os processos <b>executáveis</b> (os bloqueados e os zombies não).</p>`,
  drillIntro: '<p>Ronda de exame, metade pipes, metade escalonamento. Nas perguntas de pipes conta os bytes no pipe e quem ainda tem a extremidade de escrita aberta.</p>' },
{ id: 'g7', part: 'Grupo 7', title: 'Gestão de memória', pts: '≈ 3,4 valores', topics: ['mem'], drill: 7,
  sum: 'Tamanhos de páginas e tabelas, a tabela "TLB hit / endereço físico / exceção", multinível, segmentação e copy-on-write.',
  lessons: ['v-why', 'v-page', 'v-pte', 'v-tlb', 'v-multi', 'v-seg', 'v-cow'],
  brief: `<p>O Grupo 7 fecha o exame e vale 3,2 a 3,6 valores. Há sempre <b>uma tabela grande para preencher</b> (1,5 valores) e algumas contas rápidas.</p>
  <div class="tbl-wrap"><table><tr><th>O que sai</th><th>Quantas vezes</th></tr>
  <tr><td><b>A tabela da MMU</b>: para cada endereço virtual, TLB hit?, endereço físico, falta de página / acesso inválido / proteção</td><td>7 em 8</td></tr>
  <tr><td><b>Dimensões</b>: tamanho da página (2<sup>deslocamento</sup>), número de entradas da tabela (2<sup>bits de página</sup>), bits de cada nível</td><td>6 em 8</td></tr>
  <tr><td><b>Overhead da TLB</b>: acessos extra à memória por cada miss (1 por nível de tabela)</td><td>3 em 8</td></tr>
  <tr><td>Fragmentação: paginação (interna) vs segmentação (externa)</td><td>5 em 8</td></tr>
  <tr><td>Copy-on-write depois do fork; segmentação com base e limite</td><td>3 em 8</td></tr></table></div>
  <h4>O algoritmo da tabela, sempre pela mesma ordem</h4>
  <ul><li>1. Parte o endereço: <b>página</b> (os bits de cima) e <b>deslocamento</b> (os de baixo; com páginas de 4 KB são os 3 últimos dígitos hex).</li>
  <li>2. A página está na <b>TLB</b> (e válida)? Hit. Senão vai à <b>tabela de páginas</b>.</li>
  <li>3. A página nem existe na tabela? <b>Acesso inválido</b>. Existe mas não está presente? <b>Falta de página</b> (o núcleo traz-a para uma trama nova).</li>
  <li>4. O tipo de acesso (r, w, x) não é permitido? <b>Violação de proteção</b>.</li>
  <li>5. Endereço físico = <b>base da trama</b> seguida do <b>mesmo deslocamento</b>.</li></ul>`,
  drillIntro: '<p>Ronda final, como no exame: tabelas para traduzir e contas de dimensões. Parte sempre o endereço antes de olhar para as tabelas.</p>' },
    ],
  },
});
