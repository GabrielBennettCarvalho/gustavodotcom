/* ===== SO questions: signals (Grupo 5) ===== */
const SG_COUNT = `static void sigHandler(int sig) {
  static int count = 0;
  if (sig == SIGINT) {
    count++;
    return;            // continua a execução
  }
  _exit(EXIT_SUCCESS);
}
int main(int argc, char *argv[]) {
  signal(SIGINT, sigHandler);
  signal(SIGQUIT, sigHandler);
  for (;;)             // espera por signals, para sempre
    [ caixa ];
}`;

STUDY.questions('so', [
/* --- nível 1 --- */
{ id: 'sg-01', t: 'sig', l: 1, les: 'g-api',
  q: 'Que chamada de sistema envia um signal a outro processo?',
  o: ['kill', 'signal', 'pause', 'alarm'], a: 0,
  e: '`kill(pid, sig)` envia **qualquer** signal ao processo pid (o nome engana). `signal` só associa um handler.' },
{ id: 'sg-02', t: 'sig', l: 1, les: 'g-what',
  q: 'Que signal não pode ser ignorado nem tratado por um handler?',
  o: ['SIGKILL', 'SIGINT', 'SIGTERM', 'SIGUSR1'], a: 0,
  e: '**SIGKILL** (e SIGSTOP) têm sempre a ação por omissão: o núcleo garante assim uma forma de terminar qualquer processo.' },
{ id: 'sg-03', t: 'sig', l: 1, les: 'g-api',
  q: 'O que faz a chamada pause()?',
  o: ['Bloqueia até chegar um signal', 'Suspende o processo durante 1 segundo', 'Para todas as tarefas exceto a atual', 'Ignora signals até ser chamada de novo'], a: 0,
  e: 'Bloqueia o processo (sem espera ativa) até um signal ser tratado. É o que se põe num `for (;;)` à espera de signals.' },
{ id: 'sg-04', t: 'sig', l: 1, les: 'g-what',
  q: 'Que informação leva um signal ao processo que o recebe?',
  o: ['Só o número do signal', 'Uma mensagem de texto curta', 'O conteúdo de um buffer', 'Um descritor de ficheiro'], a: 0,
  e: 'Um signal é só um **número** (qual campainha tocou). Para mandar dados usam-se pipes, FIFOs, ficheiros…' },
{ id: 'sg-05', t: 'sig', l: 1, les: 'g-what',
  q: 'Que ações pode um processo associar a um signal?',
  o: ['Omissão, ignorar ou um handler', 'Bloquear, desbloquear ou matar', 'Ler, escrever ou executar', 'Enviar, receber ou reencaminhar'], a: 0,
  e: 'SIG_DFL (ação por omissão), SIG_IGN (ignorar) ou uma **rotina de tratamento** própria.' },
{ id: 'sg-06', t: 'sig', l: 1, les: 'g-what',
  q: 'Que signal recebe um processo quando o utilizador carrega CTRL+C no terminal?',
  o: ['SIGINT', 'SIGQUIT', 'SIGKILL', 'SIGSTOP'], a: 0,
  e: 'CTRL+C → **SIGINT**. CTRL+\\ → SIGQUIT.' },

/* --- nível 2 --- */
{ id: 'sg-10', t: 'sig', l: 2, les: 'g-how',
  q: 'Um processo tem um signal pendente. Quando é que o handler desse signal corre?',
  o: ['Quando o processo regressa ao modo utilizador', 'Logo que o emissor faz kill, interrompendo tudo', 'No início da próxima chamada de sistema dele', 'Numa tarefa nova criada pelo núcleo'], a: 0,
  e: 'O núcleo verifica os signals pendentes quando o processo vai **voltar do núcleo para modo utilizador** (fim de chamada de sistema, interrupção, despacho) e põe-no a correr o handler, em modo utilizador.' },
{ id: 'sg-11', t: 'sig', l: 2, les: 'g-how',
  q: 'Um processo tem SIGINT bloqueado e recebe três SIGINT seguidos. Quando o desbloqueia, quantas vezes corre o handler?',
  o: ['1', '3', '0', '2'], a: 0,
  e: 'Os signals **não ficam em fila**: há só um bit "pendente" por signal. Três envios contam como um.' },
{ id: 'sg-12', t: 'sig', l: 2, les: 'g-how',
  q: 'Porque não se deve usar printf dentro de um handler de signal?',
  o: ['Pode ter interrompido um printf a meio', 'O printf não funciona dentro do núcleo', 'O handler não tem acesso ao stdout', 'O printf envia outro signal ao processo'], a: 0,
  e: 'O signal pode chegar a meio de um printf do programa; outro printf no handler mexe no mesmo buffer interno. Não é **async-signal-safe** (o write é).' },
{ id: 'sg-13', t: 'sig', l: 2, les: 'g-how',
  q: 'Em semântica System V, o que acontece à ação associada a um signal quando o seu handler é chamado?',
  o: ['Volta à ação por omissão', 'Mantém-se o handler', 'Passa a ser ignorado', 'O signal fica bloqueado para sempre'], a: 0,
  e: 'Em System V a associação é de **uma só vez**: por isso o handler costuma chamar `signal()` outra vez. Em BSD mantém-se.' },
{ id: 'sg-14', t: 'sig', l: 2, les: 'g-how',
  q: 'Num processo com várias tarefas, como se garante que um signal é tratado por uma tarefa concreta?',
  o: ['As outras bloqueiam-no (pthread_sigmask)', 'Chama-se signal() só dentro dessa tarefa', 'Envia-se com kill para o TID da tarefa', 'Não é possível escolher'], a: 0,
  e: 'O handler é do processo; quem o corre é **qualquer tarefa que não tenha o signal bloqueado**. Bloqueando-o nas outras com pthread_sigmask, sobra só a escolhida.' },
{ id: 'sg-15', t: 'sig', l: 2, les: 'g-api',
  q: 'Um processo ignora SIGINT e tem um handler para SIGQUIT. Depois faz uma exec bem sucedida. Como ficam os dois signals no novo programa?',
  o: ['SIGINT ignorado; SIGQUIT volta à omissão', 'Os dois voltam à ação por omissão', 'Os dois mantêm-se como estavam', 'SIGINT volta à omissão; SIGQUIT fica com o handler'], a: 0,
  e: 'O código do handler desaparece com a exec, por isso SIGQUIT volta à **omissão**. Mas "ignorar" não depende de código: SIGINT **continua ignorado**.' },
{ id: 'sg-16', t: 'sig', l: 2, les: 'g-api',
  q: 'O que faz `alarm(5)`?',
  o: ['Daqui a 5 s o processo recebe SIGALRM', 'Bloqueia o processo durante 5 s', 'Envia SIGALRM ao processo 5', 'Mata o processo se demorar mais de 5 s'], a: 0,
  e: 'Programa um temporizador: passados 5 s o **próprio** processo recebe SIGALRM. Não bloqueia.' },
{ id: 'sg-17', t: 'sig', l: 2, les: 'g-api',
  q: '`kill(pid, SIGUSR1)` muda a ação associada a SIGUSR1 no processo pid?',
  o: ['Não: só envia o signal', 'Sim, repõe a ação por omissão', 'Sim, passa a ignorá-lo', 'Só se pid for um filho'], a: 0,
  e: 'kill só **envia**. Associar ações é com signal() ou sigaction(), feito pelo próprio processo.' },

/* --- nível 3 --- */
{ id: 'sg-20', t: 'sig', l: 3, les: 'g-api', code: SG_COUNT, src: 'Exame 2022/23, 2.ª época',
  q: 'Com semântica BSD e com a caixa preenchida com pause(), o que faz o programa abaixo?',
  o: ['Conta SIGINT; termina com SIGQUIT', 'Conta os SIGINT e termina ao primeiro', 'Conta SIGINT e SIGQUIT e nunca termina', 'Não funciona: sig não está definido'], a: 0,
  e: 'Em BSD o handler mantém-se: cada SIGINT soma 1 e o programa continua. Um SIGQUIT faz `_exit`.' },
{ id: 'sg-24', t: 'sig', l: 3, les: 'g-api', src: 'Exame 2023/24, 2.ª época',
  code: `void sigHandler(int s) {
  char ch;
  read(0, &ch, 1);
  if (ch == 'Y') exit(0);
  else signal(SIGINT, sigHandler);
}
int main() {
  signal(SIGINT, sigHandler);
  for (;;)
    pause();
}`,
  q: 'Qual destas afirmações sobre o programa abaixo é **falsa**?',
  o: ['Faz espera ativa enquanto não chegam signals', 'Evita que o CTRL+C termine o programa', 'Foi escrito a pensar em semântica System V', 'Em System V, dois CTRL+C seguidos podem matá-lo'], a: 0,
  e: 'pause() **bloqueia**: não há espera ativa. Reinstalar o handler dentro dele é típico de System V, e entre o handler começar e o signal() há uma janela em que um 2.º CTRL+C usa a ação por omissão.' },

/* --- nível 4: perguntas de exame --- */
{ id: 'sg-18', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2022/23, 2.ª época',
  code: `// antes do fork, o pai ignorou todos os signals
switch (childPid = fork()) {
  case 0:
    printf("Child (PID=%ld)\\n", (long) [B]);
    pause();
    exit(EXIT_SUCCESS);
  default:
    sleep(3);
    if (kill([A]) == -1) errMsg("kill");
    sleep(3);
    exit(EXIT_SUCCESS);
}`,
  q: 'No código abaixo, o pai quer garantir que o filho termina. O que vai na caixa [A]?',
  o: ['childPid, SIGKILL', 'childPid, SIGINT', 'getpid(), SIGKILL', 'childPid, qualquer signal que termine por omissão'], a: 0,
  e: 'O filho herdou a ação "ignorar" para todos os signals (o fork mantém-na). O único que não se pode ignorar é **SIGKILL**, enviado ao **filho** (childPid).' },
{ id: 'sg-19', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2022/23, 2.ª época',
  code: `switch (childPid = fork()) {
  case 0:
    printf("Child (PID=%ld)\\n", (long) [B]);
    pause();
    exit(EXIT_SUCCESS);
  default:
    sleep(3);
    if (kill(childPid, SIGKILL) == -1) errMsg("kill");
    exit(EXIT_SUCCESS);
}`,
  q: 'No código abaixo, o filho quer imprimir o seu próprio PID. O que vai na caixa [B]?',
  o: ['getpid()', 'childPid', 'getppid()', 'childPid()'], a: 0,
  e: 'No filho, childPid vale **0** (o fork devolve 0 ao filho). O próprio PID obtém-se com **getpid()**.' },
{ id: 'sg-21', t: 'sig', l: 4, les: 'g-api', code: SG_COUNT, src: 'Exame 2022/23, 2.ª época',
  q: 'Que instrução se coloca na caixa do ciclo `for (;;)` do programa abaixo?',
  o: ['pause();', 'wait();', 'pthread_join();', 'pthread_cond_wait();'], a: 0,
  e: 'O programa quer esperar por signals sem gastar CPU: **pause()**. wait espera por filhos, as outras por tarefas e condições.' },
{ id: 'sg-22', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2023/24, 1.ª época',
  code: `ApanhaSig() {
  printf("PID %d Signal tratado\\n", getpid());
  signal(SIGINT, ApanhaSig);
}
main() {
  int res = fork();
  if (res == 0) {
    signal(SIGINT, ApanhaSig);
  } else {
    sleep(5);
    for (;;) {
      if (kill(res, SIGINT) == -1) exit();
    }
  }
  nice(10);
  for (;;);
}`,
  q: 'Se algum processo executar a função nice no programa abaixo, que processo será?',
  o: ['Só o filho', 'Só o pai', 'Os dois', 'Nenhum: há um ciclo infinito antes'], a: 0,
  e: 'O filho associa o handler e segue para o nice. O pai fica para sempre no ciclo de kill (o filho trata o SIGINT e não morre, por isso o kill nunca falha): nunca chega ao nice.' },
{ id: 'sg-30', t: 'sig', l: 4, les: 'g-how', src: 'Exame 2023/24, 1.ª época',
  q: 'Um signal é enviado a uma aplicação com várias tarefas. Que tarefa executa a rotina de tratamento?',
  o: ['Uma tarefa que não o tenha na máscara de bloqueados', 'Todas as tarefas que nunca chamaram sigprocmask', 'Qualquer tarefa que não esteja bloqueada num recurso', 'Qualquer tarefa que esteja executável'], a: 0,
  e: 'O núcleo escolhe **uma** tarefa que não tenha esse signal bloqueado na sua máscara de signals.' },
{ id: 'sg-31', t: 'sig', l: 4, les: 'g-what', src: 'Exame 2023/24, 2.ª época',
  q: 'Qual das seguintes afirmações sobre os signals é **falsa**?',
  o: ['Os signals levam mensagens arbitrárias entre processos', 'Não é seguro usar printf e scanf num handler', 'Em alguns sistemas é preciso reassociar o handler dentro dele', 'Pode redefinir-se o tratamento de só alguns signals'], a: 0,
  e: 'Um signal só leva o seu **número**. As outras três são verdadeiras (a do reassociar é a semântica System V).' },
{ id: 'sg-32', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2024/25, 1.ª época',
  q: 'Qual das seguintes chamadas de sistema permite a um processo suspender a sua execução até receber um signal?',
  o: ['pause()', 'kill()', 'wait()', 'sigprocmask()'], a: 0,
  e: '**pause()** bloqueia até chegar um signal. wait espera por filhos; sigprocmask muda a máscara.' },
{ id: 'sg-33', t: 'sig', l: 4, les: 'g-how', src: 'Exame 2024/25, 1.ª época',
  q: 'Qual das seguintes afirmações sobre signals é verdadeira?',
  o: ['Nos handlers não é seguro usar printf', 'kill() só envia signals que terminam o processo', 'Escrever num pipe sem leitores pode gerar SIGCHLD', 'Nenhuma das anteriores é verdadeira'], a: 0,
  e: 'printf não é async-signal-safe. kill envia qualquer signal, e o pipe sem leitores gera SIGPIPE (SIGCHLD é quando um filho termina).' },
{ id: 'sg-34', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2024/25, 2.ª época',
  q: 'Qual das seguintes chamadas permite que o processo com PID 10 envie SIGINT ao processo com PID 20?',
  o: ['kill(20, SIGINT)', 'kill(10, SIGINT)', 'signal(10, SIGINT)', 'signal(20, SIGINT)'], a: 0,
  e: 'kill recebe o PID do **destino**, que é o 20. O emissor não aparece nos argumentos.' },
{ id: 'sg-35', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2024/25, 2.ª época',
  q: 'Qual das seguintes afirmações sobre signals é **falsa**?',
  o: ['kill() repõe a ação por omissão do signal', 'Nos handlers não é seguro usar malloc', 'Escrever num pipe sem leitores gera SIGPIPE', 'alarm() envia um signal ao próprio processo'], a: 0,
  e: 'kill **só envia**: não mexe em ações. As outras três são verdadeiras.' },
{ id: 'sg-36', t: 'sig', l: 4, les: 'g-api', src: 'Exame 2024/25, 2.ª época',
  q: 'Qual das seguintes afirmações sobre signals é verdadeira?',
  o: ['pause() bloqueia o processo até chegar um signal', 'A ação por omissão de qualquer signal é SIG_IGN', 'O handler corre tantas vezes quantos os signals recebidos', 'Nenhuma das anteriores'], a: 0,
  e: 'A ação por omissão é quase sempre terminar (não ignorar), e os signals não fazem fila. pause() bloqueia até um signal.' },
{ id: 'sg-37', t: 'sig', l: 4, les: 'g-how', src: 'Exame 2022/23, 1.ª época',
  q: 'Como é que o Unix trata um signal com uma rotina de tratamento (sighandler) definida pelo processo?',
  o: ['Rotina normal, posta a correr em modo utilizador ao sair do núcleo', 'Rotina de interrupção instalada no núcleo', 'Uma tarefa nova do processo, que corre o handler', 'Rotina normal, posta a correr em modo núcleo quando o processo entra no núcleo'], a: 0,
  e: 'O handler é código do processo, referenciado na sua tabela de signals. Quando o processo vai passar de modo núcleo a modo utilizador, o núcleo vê o signal pendente e mexe nas pilhas para o handler correr **em modo utilizador**.' },
{ id: 'sg-38', t: 'sig', l: 4, les: 'g-what', src: 'Exame 2022/23, 1.ª época',
  q: 'Qual das seguintes afirmações sobre signals é verdadeira?',
  o: ['Todos os signals têm uma ação por omissão', 'Pode ignorar todos os signals que existem', 'Pode definir um handler para todos os signals', 'SIGKILL só pode ser tratado por um superutilizador'], a: 0,
  e: 'Todos os signals têm ação por omissão. SIGKILL e SIGSTOP não se ignoram nem tratam, nem com root.' },
]);
