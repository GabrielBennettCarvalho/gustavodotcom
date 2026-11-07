/* ===== SO lessons: signals (Grupo 5), pipes and the kernel, scheduling (Grupo 6) ===== */
STUDY.lessons('so', [
{ id: 'g-what', t: 'sig', title: 'Signals: interrupções por software',
  html: `<p>Um <b>signal</b> é um aviso assíncrono enviado a um processo. Leva só um <b>número</b> (SIGINT, SIGKILL…), não uma mensagem: não serve para mandar dados arbitrários.</p>
  <div class="tbl-wrap"><table><tr><th>Signal</th><th>Quem o gera</th><th>Por omissão</th></tr>
  <tr><td>SIGINT</td><td>CTRL+C</td><td>termina</td></tr>
  <tr><td>SIGQUIT</td><td>CTRL+\\</td><td>termina (com core)</td></tr>
  <tr><td>SIGKILL</td><td><code>kill -9</code></td><td>termina; <b>não se pode ignorar nem tratar</b></td></tr>
  <tr><td>SIGSEGV</td><td>núcleo: acesso inválido à memória</td><td>termina</td></tr>
  <tr><td>SIGPIPE</td><td>núcleo: escrever num pipe sem leitores</td><td>termina</td></tr>
  <tr><td>SIGCHLD</td><td>núcleo: um filho terminou</td><td>ignorado</td></tr>
  <tr><td>SIGALRM</td><td><code>alarm(s)</code> ao próprio processo</td><td>termina</td></tr>
  <tr><td>SIGUSR1/2</td><td>livres para as aplicações</td><td>termina</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Um toque de campainha. Diz-te que alguém tocou e qual campainha foi (o número), não traz carta. Podes ignorar algumas, ter uma reação tua (handler) ou a reação por omissão. A do SIGKILL é a campainha do bombeiro: não há escolha.</div>
  <p>Para cada signal o processo escolhe uma de três ações: <b>por omissão</b> (SIG_DFL), <b>ignorar</b> (SIG_IGN) ou uma <b>rotina de tratamento</b> (handler). Todos os signals têm uma ação por omissão; SIGKILL e SIGSTOP não podem ser mudados.</p>`,
  key: 'Signal = número, não mensagem. Ações: omissão, ignorar, handler. SIGKILL e SIGSTOP não se ignoram nem tratam.' },

{ id: 'g-how', t: 'sig', title: 'Quando e onde corre o handler',
  html: `<p>Enviar um signal só marca-o como <b>pendente</b> no processo destino. O handler corre quando o núcleo, ao <b>voltar para modo utilizador</b> nesse processo (fim de uma chamada de sistema, de uma interrupção, ou ao ser despachado), vê que há um signal pendente: manipula a pilha do utilizador para que o processo "salte" para o handler, <b>em modo utilizador</b>. Quando o handler acaba, o processo continua onde estava.</p>
  <div class="ana"><b>Analogia</b>Uma mensagem deixada na receção do hotel. Não te tiram do quarto a meio do banho: dão-ta quando passares pela receção (o regresso ao modo utilizador). Lês e vais à tua vida.</div>
  <ul><li><b>Não há fila</b>: dois SIGINT pendentes ao mesmo tempo contam como um. O handler não corre tantas vezes quantas os envios.</li>
  <li>Num processo com várias tarefas, o signal é tratado por <b>uma qualquer tarefa que não o tenha bloqueado</b> na sua máscara (<code>pthread_sigmask</code>). Para garantir que é uma tarefa concreta, as outras bloqueiam-no.</li>
  <li>Uma chamada bloqueante (read, pause) interrompida pode regressar com erro (EINTR).</li></ul>
  <p><b>System V vs BSD</b>: em System V, quando o handler é chamado, a ação volta a ser a <b>por omissão</b>; por isso o handler tem de chamar <code>signal()</code> outra vez, e há uma janela em que um segundo CTRL+C rápido mata o processo. Em BSD a associação mantém-se.</p>
  <div class="trap">No handler só se podem usar funções <b>async-signal-safe</b>: <code>write</code>, <code>_exit</code>, <code>read</code> sim; <b>printf, scanf, malloc, exit</b> não (podem ter interrompido o processo a meio do mesmo printf ou malloc).</div>`,
  key: 'Handler corre em modo utilizador quando o processo volta do núcleo. Sem fila. System V repõe a omissão (reinstalar). Nada de printf/malloc no handler.' },

{ id: 'g-api', t: 'sig', title: 'kill, signal, pause, alarm',
  html: `<pre>signal(SIGINT, handler);   // associa o handler (ou SIG_IGN / SIG_DFL)
kill(pid, SIGINT);         // ENVIA o signal ao processo pid (o destino vem primeiro)
pause();                   // bloqueia até chegar um signal (sem espera ativa)
alarm(5);                  // daqui a 5 s o próprio processo recebe SIGALRM</pre>
  <div class="ana"><b>Analogia</b><code>signal</code> é programar o que fazes quando a campainha tocar. <code>kill</code> é ir tocar à campainha de alguém. <code>pause</code> é sentar-te ao pé da porta à espera.</div>
  <ul><li>O nome engana: <code>kill</code> envia <b>qualquer</b> signal, não só os que matam. E <b>não</b> mexe na ação associada.</li>
  <li><code>kill(-1, …)</code> ou <code>kill(0, …)</code> enviam a grupos; nos exames é sempre o PID do destino.</li>
  <li><b>fork</b>: o filho herda as ações (handlers e ignorados) do pai. <b>exec</b>: os handlers voltam à omissão (o código do handler deixou de existir), mas os <b>ignorados continuam ignorados</b>.</li>
  <li>Se o pai ignorou todos os signals antes do fork, a única forma garantida de matar o filho é <b>SIGKILL</b>.</li></ul>
  <pre>void h(int s) {
  char ch; const char msg[] = "Terminar? (Y/N)\\n";
  write(STDOUT_FILENO, msg, sizeof(msg) - 1);   // write, não printf
  read(STDIN_FILENO, &amp;ch, 1);
  if (ch == 'Y') exit(0);            // como nos exames; o mais rigoroso seria _exit
  else signal(SIGINT, h);            // reinstalar (System V)
}
int main() { signal(SIGINT, h); for (;;) pause(); }</pre>`,
  key: 'kill(pid, sig) envia. signal(sig, h) associa. pause() espera sem gastar CPU. fork herda tudo; exec repõe handlers mas mantém ignorados.' },

{ id: 'i-pipe', t: 'pipe', title: 'Pipes: um tubo com duas pontas',
  html: `<p><code>pipe(fds)</code> cria um canal <b>unidirecional</b> dentro do núcleo e devolve dois descritores: <code>fds[0]</code> para <b>ler</b>, <code>fds[1]</code> para <b>escrever</b> (0 como stdin, 1 como stdout). Não tem nome: só o partilham processos que o <b>herdam</b> por fork.</p>
  <div class="ana"><b>Analogia</b>Um tubo pneumático entre duas salas. O que entra numa ponta sai na outra pela mesma ordem. Cada sala só deve usar a sua ponta, e o tubo só funciona entre quem estava em casa quando foi instalado (o pai e os filhos que fez depois).</div>
  <ul><li>Depois do fork, <b>as duas pontas ficam abertas nos dois processos</b>. Cada um fecha a que não usa.</li>
  <li><code>read</code> num pipe vazio: <b>bloqueia</b> se ainda há alguém com a ponta de escrita aberta; devolve <b>0 (EOF)</b> se já ninguém a tem.</li>
  <li><code>read(fd, buf, 30)</code> com X &lt; 30 bytes no pipe devolve logo X (não espera pelos 30).</li>
  <li><code>write</code> num pipe cheio bloqueia; num pipe <b>sem leitores</b> dá <b>SIGPIPE</b>.</li>
  <li>Os bytes lidos saem do pipe: se dois processos leem 10 bytes e só lá estão 10, um lê-os e <b>o outro fica bloqueado</b>.</li></ul>
  <pre>int fd[2]; char buf[20]; const char msg[] = "ola\\n";
pipe(fd);
if (fork() == 0) { close(fd[1]); read(fd[0], buf, sizeof(buf)); write(STDOUT_FILENO, buf, …); close(fd[0]); }
else             { close(fd[0]); write(fd[1], msg, sizeof(msg)); close(fd[1]); }</pre>
  <div class="trap">Esquecer de fechar a ponta de escrita no leitor faz com que o read nunca veja EOF: o próprio leitor ainda a tem aberta.</div>`,
  key: 'fds[0] lê, fds[1] escreve. Herdado por fork. Vazio + escritor vivo → bloqueia; sem escritores → EOF. Sem leitores → SIGPIPE.' },

{ id: 'i-fifo', t: 'pipe', title: 'FIFOs (pipes com nome)',
  html: `<p>Um <b>FIFO</b> funciona como um pipe (unidirecional, bytes por ordem, read bloqueante) mas tem um <b>nome no sistema de ficheiros</b>. Por isso qualquer processo o pode abrir, mesmo sem parentesco.</p>
  <pre>mkfifo("/tmp/servidor", 0666);           // cria (caminho + permissões)
int fd = open("/tmp/servidor", O_RDONLY); // bloqueia até alguém abrir para escrever</pre>
  <div class="tbl-wrap"><table><tr><th></th><th>Pipe</th><th>FIFO</th></tr>
  <tr><td>Criação</td><td><code>pipe(fds)</code>, já abre as duas pontas</td><td><code>mkfifo(path, mode)</code>, depois <code>open</code></td></tr>
  <tr><td>Nome</td><td>não tem</td><td>caminho no sistema de ficheiros</td></tr>
  <tr><td>Quem usa</td><td>pai e descendentes</td><td>quaisquer processos</td></tr>
  <tr><td>open</td><td>não há</td><td><b>bloqueia</b> até haver alguém na outra ponta</td></tr>
  <tr><td>Leitura</td><td colspan="2">bloqueia se vazio e com escritores; EOF sem escritores (igual nos dois)</td></tr></table></div>
  <div class="ana"><b>Analogia</b>O pipe é um tubo instalado dentro de casa; o FIFO é uma caixa de correio na rua com morada: qualquer pessoa que saiba a morada lá deixa cartas.</div>
  <p><b>Cliente-servidor</b>: o servidor cria um FIFO bem conhecido onde todos os clientes escrevem pedidos. Para não se misturarem, cada pedido deve ter <b>tamanho fixo e não maior do que PIPE_BUF</b> (escritas até esse tamanho são atómicas). Normalmente cada cliente cria o seu FIFO de resposta.</p>
  <p>Comunicação nos dois sentidos? Dois pipes (ou dois FIFOs), um em cada sentido.</p>`,
  key: 'FIFO = pipe com nome: mkfifo + open (que bloqueia até haver o outro lado). Serve processos sem parentesco.' },

{ id: 'i-redir', t: 'pipe', title: 'Ligar dois programas: pipe + dup',
  html: `<p>É o que a shell faz para <code>ls | wc</code>: o stdout do primeiro passa a ser a ponta de escrita do pipe e o stdin do segundo a ponta de leitura.</p>
  <pre>pipe(fds);
if (fork() > 0) {        // pai: escreve
  close(1); dup(fds[1]); // 1 → escrita do pipe
  close(fds[1]); close(fds[0]);
  execlp("ls", "ls", NULL);
} else {                 // filho: lê
  close(0); dup(fds[0]); // 0 → leitura do pipe
  close(fds[1]); close(fds[0]);
  execlp("wc", "wc", NULL);
}</pre>
  <div class="ana"><b>Analogia</b>Ligar a mangueira de saída de uma máquina à entrada de outra. Depois de ligadas, desligas as pontas soltas para não pingar (fechar os descritores originais), mas a mangueira continua ligada pelas tomadas 0 e 1.</div>
  <ul><li><code>close(1)</code> tem de vir <b>antes</b> do dup, senão o dup devolve outro número qualquer.</li>
  <li>Fechar o <code>fds[1]</code> original depois do dup não fecha o pipe: o 1 ainda lá está.</li>
  <li>Os <b>ficheiros abertos sobrevivem à exec</b>: por isso o ls escreve para o pipe sem saber.</li>
  <li>No leitor é essencial fechar <b>todas</b> as pontas de escrita, senão o wc nunca recebe EOF.</li></ul>`,
  key: 'close(1); dup(fds[1]) no escritor e close(0); dup(fds[0]) no leitor, fechar o resto, exec. Os fds sobrevivem à exec.' },

{ id: 'i-kernel', t: 'pipe', title: 'O núcleo: arquitetura, pilhas e despacho',
  html: `<p>O núcleo entra em execução em três casos: <b>interrupções</b> de hardware (relógio, disco), <b>exceções</b> (falta de página, divisão por zero) e <b>chamadas de sistema</b> (traps). Não é só "quando há hardware a pedir".</p>
  <div class="tbl-wrap"><table><tr><th>Arquitetura</th><th>Ideia</th><th>Troca</th></tr>
  <tr><td><b>Monolítico</b> (Linux, Unix)</td><td>tudo (drivers, FS, rede) num só programa em modo núcleo</td><td>mais <b>eficiente</b> (chamadas diretas); um bug num driver pode derrubar tudo</td></tr>
  <tr><td><b>Camadas</b></td><td>níveis com proteção diferente, cada um só usa o de baixo</td><td>mais organizado e protegido, mais lento</td></tr>
  <tr><td><b>Micro-núcleo</b></td><td>núcleo mínimo (IPC, escalonamento, memória); o resto corre como servidores em <b>modo utilizador</b></td><td>mais <b>resiliente</b>; mais trocas de mensagens</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Monolítico é uma cozinha onde o chef faz tudo: rápido, mas se ele se queima pára tudo. Micro-núcleo é uma cozinha com estações separadas que passam pratos por uma janela: mais lenta, mas um acidente numa estação não fecha o restaurante.</div>
  <p><b>Duas pilhas</b>: cada processo tem uma pilha de utilizador e uma <b>pilha de núcleo</b>. O núcleo usa a sua para que uma aplicação maliciosa ou com bugs não consiga ver nem estragar o estado interno do núcleo (proteção, não eficiência).</p>
  <p><b>Despacho</b>: guarda o contexto do processo que sai, escolhe o próximo, carrega o seu contexto e termina com <b>RTI</b> (Return From Interrupt), que repõe o modo utilizador e o PC do processo escolhido. Comutar entre <b>tarefas do mesmo processo</b> é mais barato do que entre processos (não muda a tabela de páginas nem invalida a TLB).</p>
  <div class="trap">Se uma aplicação pudesse inibir interrupções em modo utilizador, podia ficar com o CPU para sempre e comprometer o núcleo: por isso é uma instrução privilegiada.</div>`,
  key: 'Núcleo entra por interrupção, exceção ou chamada de sistema. Monolítico = eficiente; micro-núcleo = resiliente. Pilha de núcleo = proteção. Despacho acaba em RTI.' },

{ id: 'c-states', t: 'sched', title: 'Os estados de um processo',
  html: `<p>Num CPU, em cada instante, só um processo está <b>em execução</b>. Os outros estão <b>executáveis</b> (prontos, à espera de CPU) ou <b>bloqueados</b> (à espera de um evento: disco, trinco, pipe, wait).</p>
  <div class="tbl-wrap"><table><tr><th>Transição</th><th>Existe?</th><th>Porquê</th></tr>
  <tr><td>Executável → Em execução</td><td>sim</td><td>o despacho escolhe-o</td></tr>
  <tr><td>Em execução → Executável</td><td>sim</td><td>preempção (acabou a fatia, ou chegou alguém mais prioritário)</td></tr>
  <tr><td>Em execução → Bloqueado</td><td>sim</td><td>pediu algo que tem de esperar</td></tr>
  <tr><td>Bloqueado → Executável</td><td>sim</td><td>o evento aconteceu</td></tr>
  <tr><td><b>Bloqueado → Em execução</b></td><td><b>não</b></td><td>tem de passar por executável e ser escolhido</td></tr>
  <tr><td><b>Executável → Bloqueado</b></td><td><b>não</b></td><td>só quem está a correr pode pedir algo e bloquear</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Uma consulta: só um doente está no gabinete (em execução). Os da sala de espera estão prontos (executáveis). Quem foi fazer análises está bloqueado; quando volta, vai para a sala de espera, não entra direto no gabinete. E ninguém vai fazer análises sem antes ter passado pelo gabinete.</div>
  <p>Depois do <code>exit</code> e antes do wait do pai, o processo é <b>zombie</b>. Um processo bloqueado indefinidamente num semáforo continua <b>bloqueado</b> (não fica zombie). Depois de uma exec bem sucedida, continua em execução.</p>`,
  key: 'Executável ↔ Em execução, Em execução → Bloqueado → Executável. Não existe Bloqueado → Em execução nem Executável → Bloqueado.' },

{ id: 'c-unix', t: 'sched', title: 'O escalonador clássico do Unix',
  html: `<p>No Unix clássico a prioridade é um número: <b>quanto menor, mais prioritário</b>.</p>
  <ul><li>Os processos <b>em modo núcleo</b> (bloqueados dentro do núcleo) têm prioridades <b>negativas</b> (as mais altas), que <b>dependem do recurso</b> por que esperam (disco, terminal…): quem acorda de um disco deve sair depressa do núcleo.</li>
  <li>Os processos em <b>modo utilizador</b> têm prioridades <b>positivas</b>, recalculadas periodicamente: <b>Prioridade = Base + TempoCPU/2 + nice</b>.</li>
  <li>O TempoCPU <b>decai</b> (é dividido por 2 a cada segundo). Quem usa muito CPU fica com número alto (menos prioritário); quem bloqueia muito fica com número baixo.</li>
  <li>Logo os processos <b>interativos</b> (usam pouco CPU, bloqueiam à espera do utilizador) ficam <b>mais prioritários</b> do que os CPU-bound.</li>
  <li>Um processo que <b>bloqueia indefinidamente</b>: o TempoCPU decai para 0 e a prioridade <b>converge para a base</b> (+ nice).</li></ul>
  <div class="ana"><b>Analogia</b>Uma fila de supermercado com "pontos de gula": cada minuto que passas na caixa somas pontos, e a fila serve primeiro quem tem menos pontos. Os pontos vão-se apagando com o tempo, por isso quem parou de comprar volta ao zero.</div>
  <p><code>nice(n)</code> soma n à prioridade. Qualquer utilizador pode <b>baixar</b> a sua (n positivo); só o <b>superutilizador</b> pode usar valores negativos para a subir.</p>
  <p>As estruturas <b>proc</b> (sempre em memória: o que é preciso para escalonar) e <b>u</b> (só quando o processo corre, pode ir para disco) existem para <b>poupar memória</b>.</p>`,
  key: 'Número menor = mais prioritário. Núcleo negativo, utilizador positivo. P = base + CPU/2 + nice, CPU decai. Interativos sobem. Bloqueado para sempre → converge para a base.' },

{ id: 'c-cfs', t: 'sched', title: 'CFS: o Completely Fair Scheduler',
  html: `<p>O CFS do Linux tenta dar a cada processo executável a <b>mesma fatia de CPU</b> (pesada pelo nice). Cada processo tem um <b>vruntime</b>: o tempo de CPU que já usou (ajustado pelo peso). Corre sempre o de <b>menor vruntime</b>, guardado numa <b>árvore red-black</b> ordenada por vruntime.</p>
  <div class="ana"><b>Analogia</b>Irmãos a partilhar uma consola, com um caderno onde cada um soma os minutos que já jogou. Joga sempre quem tem menos minutos. Quem esteve fora (bloqueado) volta com poucos minutos e joga logo, mas não pode exigir as horas todas que "perdeu".</div>
  <p><b>A conta do exame</b>: com <b>n processos executáveis</b>, latência alvo L e granularidade mínima g:</p>
  <pre>fatia = L / n
se L / n ≥ g:  latência efetiva = L
se L / n &lt; g:  cada um recebe g → latência efetiva = n × g

L = 20 ms, g = 1 ms, n = 10 → 2 ms ≥ 1 → 20 ms
L = 20 ms, g = 1 ms, n = 50 → 0,4 &lt; 1  → 50 × 1 = 50 ms
L = 10 ms, g = 5 ms, n = 3  → 3,3 &lt; 5  → 3 × 5 = 15 ms</pre>
  <p>Só contam os <b>executáveis</b> (o que corre e os que estão prontos). Bloqueados e zombies não entram em n. A fatia <b>não é fixa</b>: muda com n e com o peso. Uma granularidade mínima maior reduz as comutações mas aumenta a latência.</p>
  <ul><li>Um processo <b>novo</b> começa com o vruntime mínimo atual (não com 0), para não monopolizar o CPU.</li>
  <li>Um processo que <b>acorda</b> mantém o seu vruntime (ajustado para não ficar muito abaixo do mínimo) e, se for o menor, <b>tira o CPU</b> ao que está a correr (preempção).</li>
  <li>Quem é interrompido volta a executável com o vruntime atualizado (o que já correu conta).</li></ul>`,
  key: 'Corre o menor vruntime. Latência efetiva = L se L/n ≥ g; senão n × g. n = só executáveis. Novo processo começa no vruntime mínimo.' },
]);
