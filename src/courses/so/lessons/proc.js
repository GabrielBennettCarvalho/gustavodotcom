/* ===== SO lessons: processes and threads (Grupo 2) ===== */
STUDY.lessons('so', [
{ id: 'p-fork', t: 'proc', title: 'fork(): um processo passa a dois',
  html: `<p>Um <b>programa</b> é um ficheiro executável; um <b>processo</b> é um programa a correr, com memória, registos, descritores e um PID.</p>
  <p><code>fork()</code> cria um <b>filho</b> que é uma cópia do pai: mesmo código, cópia das variáveis (globais, locais, heap), cópia da tabela de descritores. Os dois continuam a correr <b>a partir da linha seguinte ao fork</b>.</p>
  <div class="ana"><b>Analogia</b>Fotocopiar um caderno a meio de um exercício. As duas cópias começam na mesma linha e com os mesmos números, mas a partir daí cada um escreve no seu caderno. Só o marcador dos ficheiros abertos é partilhado (as fichas do balcão da biblioteca).</div>
  <div class="tbl-wrap"><table><tr><th>O fork devolve</th><th>No pai</th><th>No filho</th></tr>
  <tr><td>sucesso</td><td>o <b>PID do filho</b> (&gt; 0)</td><td><b>0</b></td></tr>
  <tr><td>falha</td><td>−1 (não há filho)</td><td>—</td></tr></table></div>
  <pre>int i = 1;
if (fork() == 0) { i = i - 1; printf("F:%d\\n", i); }   // F:0
else             { i = i + 1; printf("P:%d\\n", i); }   // P:2</pre>
  <p>O filho pode saber o PID do pai com <code>getppid()</code>; cada um sabe o seu com <code>getpid()</code>. Na prática a memória é partilhada com <b>copy-on-write</b>: só se copia uma página quando alguém escreve nela, mas o efeito é o mesmo que uma cópia.</p>
  <div class="trap">Depois do fork, pai e filho <b>não</b> comunicam por variáveis globais: cada um mexe na sua cópia.</div>`,
  key: 'fork devolve o PID do filho ao pai, 0 ao filho, −1 se falhar. Variáveis copiadas; ficheiros abertos partilham o cursor.' },

{ id: 'p-trace', t: 'proc', title: 'Prever o output: a árvore de processos',
  html: `<p>Para perguntas "qual é o output?", segue sempre este método:</p>
  <ul><li><b>1. Desenha a árvore.</b> Cada fork executado parte o processo em dois. n forks em sequência, sem ifs, dão 2<sup>n</sup> processos.</li>
  <li><b>2. Segue cada ramo</b> com as suas variáveis.</li>
  <li><b>3. Aplica os wait</b>: o pai que faz <code>wait</code> só continua depois de um filho terminar. É isso que fixa a ordem.</li>
  <li><b>4. Sem wait, qualquer ordem</b> entre processos é possível.</li></ul>
  <pre>if (pid = fork()) {          // pai
  wait(NULL); printf("A");   // espera pelo filho, que imprime D
  if (pid = fork()) { wait(NULL); printf("B"); }
  else printf("C");
} else printf("D");
// D (1.º filho), A, C (2.º filho), B  →  DACB</pre>
  <div class="ana"><b>Analogia</b>Uma família a sair de casa: o pai que diz "espero que o miúdo saia primeiro" (wait) fixa a ordem. Quem não espera por ninguém pode sair antes ou depois, ao acaso.</div>
  <p><b>O buffer do printf vai no fork.</b> Se fizeres <code>printf("x")</code> sem <code>\\n</code> nem <code>fflush</code> e depois <code>fork()</code>, o "x" ainda está no buffer e é copiado: aparece duas vezes. Por isso os exames recentes põem <code>fflush(stdout)</code> depois de cada printf, para não haver dúvida.</p>
  <div class="trap">Conta os forks executados por <b>cada</b> processo: um fork dentro de um <code>if</code> só é feito pelo ramo que lá entra.</div>`,
  key: 'Árvore de processos + cópia das variáveis + wait fixa a ordem. Sem wait, qualquer ordem. printf sem fflush é copiado pelo fork.' },

{ id: 'p-exec', t: 'proc', title: 'exec: trocar de programa sem trocar de processo',
  html: `<p><code>execl(path, arg0, arg1, …, NULL)</code> <b>substitui o programa</b> do processo que a chama: código, dados, heap e pilha novos. O processo é o mesmo: <b>mesmo PID</b>, mesmo pai, e os <b>ficheiros abertos continuam abertos</b> (é assim que a shell faz redireções).</p>
  <div class="ana"><b>Analogia</b>Trocar o cérebro mantendo o corpo e a carteira. A pessoa (PID) é a mesma, as chaves no bolso (descritores abertos) continuam lá, mas tudo o que pensava (o programa e as variáveis) foi substituído.</div>
  <ul><li>Se a exec <b>funciona, nunca regressa</b>: o código a seguir nunca é executado.</li>
  <li>Se <b>falha</b> (ficheiro não existe, sem permissão), devolve <b>−1</b> e o programa continua na linha seguinte com as variáveis intactas.</li>
  <li>A exec <b>não cria processos</b>. Para correr outro programa e continuar o atual, faz-se <code>fork</code> e o <b>filho</b> faz exec.</li>
  <li>O primeiro argumento depois do caminho é o <code>argv[0]</code> do novo programa (por convenção o próprio nome): <code>execl(path, path, NULL)</code>.</li></ul>
  <pre>if (fork() > 0) {
  wait(NULL); i = i * 10; printf("AA:%d\\n", i);
  execl(argv[1], argv[1], 0);      // funciona: nada a seguir corre
  printf("…");                     // nunca
} else { i = i * 5; printf("BB:%d\\n", i); }
// BB:5 AA:10</pre>
  <div class="trap">Se o <b>pai</b> fizer exec dentro de um ciclo, o ciclo acaba ali: o processo passou a ser outro programa.</div>`,
  key: 'exec troca o programa, mantém PID e ficheiros abertos. Se funciona, não regressa; se falha, devolve −1 e segue.' },

{ id: 'p-wait', t: 'proc', title: 'exit, wait e zombies',
  html: `<p><code>exit(n)</code> termina o processo: liberta a memória, <b>fecha os ficheiros</b>, mas deixa um registo mínimo (PID e estado de saída) para o pai ler. Até o pai o ler, o processo é um <b>zombie</b> (defunct).</p>
  <p><code>pid = wait(&amp;status)</code>:</p>
  <ul><li>Se um filho já terminou (zombie), <b>regressa logo</b> com o PID dele.</li>
  <li>Se há filhos mas nenhum terminou, <b>bloqueia</b> até um terminar.</li>
  <li>Se o processo <b>não tem filhos</b>, devolve <b>−1</b> logo, sem bloquear.</li>
  <li><code>wait(NULL)</code> espera mas não quer saber do estado.</li></ul>
  <div class="ana"><b>Analogia</b>O zombie é o recibo que fica no balcão até o pai o vir buscar. Se o recibo já lá está, o pai leva-o logo; se não, fica à espera; se nunca teve filhos, não há recibo nenhum para esperar.</div>
  <p>Para ler o estado: <code>WIFEXITED(status)</code> (terminou com exit), <code>WEXITSTATUS(status)</code> (o n do exit), <code>WIFSIGNALED(status)</code> (morreu por um signal não tratado).</p>
  <pre>for (i = 1; i &lt; argc; i++) {
  p = fork();
  if (p == 0) execl(argv[i], argv[i], 0);
  p = wait(&amp;status);
  if (WIFSIGNALED(status)) break;   // parar se um programa morreu por signal
}</pre>
  <p>Se o pai terminar primeiro, os filhos ficam <b>órfãos</b> e são adotados pelo init (PID 1), que faz wait por eles.</p>`,
  key: 'wait: devolve logo se há zombie, bloqueia se há filhos vivos, −1 se não há filhos. exit fecha ficheiros e deixa zombie.' },

{ id: 'p-thr', t: 'proc', title: 'Tarefas (pthreads): o que partilham',
  html: `<p>Uma <b>tarefa</b> (thread) é um fio de execução dentro de um processo. Várias tarefas do mesmo processo <b>partilham</b> quase tudo:</p>
  <div class="tbl-wrap"><table><tr><th>Partilhado por todas</th><th>De cada tarefa</th></tr>
  <tr><td>código, variáveis globais, heap (malloc), ficheiros abertos, handlers de signals</td><td><b>pilha</b> (variáveis locais), registos, PC, máscara de signals</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Processos são casas diferentes; tarefas são pessoas na mesma casa. Partilham a cozinha e o frigorífico (globais, heap), cada uma tem a sua secretária (pilha). Nada impede alguém de ir mexer na secretária do outro: o espaço de endereçamento é um só.</div>
  <pre>pthread_create(&amp;tid, NULL, funcao, arg);   // cria; funcao(void *arg)
pthread_join(tid, &amp;ret);                    // espera por ESSA tarefa e recebe o que devolveu</pre>
  <ul><li><code>pthread_join</code> espera por uma <b>tarefa específica</b> (não há "esperar por uma qualquer").</li>
  <li>Comutar entre tarefas do mesmo processo é <b>mais barato</b> do que entre processos (não muda o espaço de endereçamento).</li>
  <li>Quando o <code>main</code> termina (return), o processo termina e todas as tarefas morrem.</li>
  <li>A ordem entre tarefas não é garantida, a não ser que haja join, trincos ou semáforos.</li></ul>`,
  key: 'Tarefas partilham globais, heap e ficheiros; cada uma tem pilha e registos. join espera por uma tarefa concreta. Comutar tarefas é mais barato.' },

{ id: 'p-thrbugs', t: 'proc', title: 'Os três erros clássicos com threads',
  html: `<p><b>1. Passar o endereço da variável do ciclo.</b></p>
  <pre>for (int i = 0; i &lt; 3; i++) pthread_create(&amp;t[i], 0, f, &amp;i);
// f lê *i quando calha: pode ler 0,1,2 ou 2,2,2 ou 0,2,2…</pre>
  <p>Todas recebem o <b>mesmo endereço</b>; cada uma lê o valor que lá estiver no momento em que lê. O mesmo acontece com uma struct reutilizada no ciclo. Correção: um argumento próprio para cada tarefa (array ou malloc).</p>
  <div class="ana"><b>Analogia</b>Dizes a três amigos "o meu número está escrito no quadro" e vais apagando e escrevendo. Cada um copia o que lá estiver quando olhar.</div>
  <p><b>2. Devolver um ponteiro para uma variável local.</b></p>
  <pre>void *f(void *a) { struct S r = {5, 5}; return &amp;r; }   // r vive na pilha da tarefa</pre>
  <p>Quando a tarefa termina, a sua pilha deixa de ser válida: o ponteiro aponta para lixo. O comportamento é <b>indefinido</b> (o output não pode ser previsto). Correção: malloc, ou devolver o endereço de uma global.</p>
  <p><b>3. Variável partilhada sem trinco.</b> <code>a++</code> são três passos (ler, somar, escrever). Duas tarefas podem ler o mesmo valor e uma das somas perde-se: três <code>a++</code> podem deixar a com 1, 2 ou 3. Isto é uma <b>condição de corrida</b> (ver Grupo 3).</p>
  <div class="trap">Devolver <code>&amp;a</code> de uma <b>global</b> é seguro: a global continua viva. Quem ler <code>*ret</code> depois vê o valor <b>atual</b> da global, não o do momento do return.</div>`,
  key: '&i partilhado → valores imprevisíveis. Devolver &local → indefinido. a++ sem trinco → perdem-se incrementos.' },

{ id: 'p-modes', t: 'proc', title: 'Modo núcleo, chamadas de sistema e setuid',
  html: `<p>O processador tem dois modos. Em <b>modo utilizador</b> as aplicações não podem fazer I/O direto, mexer na MMU ou inibir interrupções. Em <b>modo núcleo</b> pode tudo.</p>
  <p>Uma <b>chamada de sistema</b> (open, read, fork…) é uma instrução especial (trap) que faz o processador passar a modo núcleo e saltar para código do núcleo, que usa os parâmetros que a aplicação deu. Ao acabar, volta a modo utilizador. A tradução de endereços virtuais é feita pela MMU em hardware, em qualquer modo.</p>
  <div class="ana"><b>Analogia</b>A aplicação é um cliente do banco: não entra no cofre, preenche um impresso (parâmetros) e entrega-o ao balcão (trap). O funcionário (núcleo) é que vai ao cofre.</div>
  <p><b>setuid</b>: cada processo tem um UID <b>real</b> (quem o lançou) e um UID <b>efetivo</b> (que conta para as permissões). Se um executável tem o <b>bit setuid</b> ativo, quem o corre fica com o UID efetivo do <b>dono do ficheiro</b> (não necessariamente root). É assim que o <code>passwd</code> consegue mudar <code>/etc/shadow</code>.</p>
  <ul><li>O bit muda-se com <code>chmod u+s ficheiro</code> (o dono pode fazê-lo, não é preciso root). <code>g+s</code> é o setgid.</li>
  <li>A <b>chamada de sistema</b> <code>setuid(uid)</code> é outra coisa: muda o UID do processo, e só root a pode usar livremente.</li></ul>`,
  key: 'Chamada de sistema = trap para modo núcleo. Bit setuid: o processo corre com o UID efetivo do dono do executável.' },
]);
