/* ===== SO questions: pipes, FIFOs and the kernel (Grupo 6, 1.ª parte) ===== */
STUDY.questions('so', [
/* --- nível 1 --- */
{ id: 'pi-01', t: 'pipe', l: 1, les: 'i-pipe',
  q: 'Num pipe criado com `pipe(fds)`, qual é a ponta de leitura?',
  o: ['fds[0]', 'fds[1]', 'As duas', 'A que for usada primeiro'], a: 0,
  e: '**fds[0] lê, fds[1] escreve** (como 0 = stdin e 1 = stdout).' },
{ id: 'pi-02', t: 'pipe', l: 1, les: 'i-pipe',
  q: 'Um pipe permite comunicação em que sentido?',
  o: ['Num só sentido', 'Nos dois sentidos', 'Depende de quem o criou', 'Só do filho para o pai'], a: 0,
  e: 'É **unidirecional**: entra por fds[1] e sai por fds[0]. Para os dois sentidos usam-se dois pipes.' },
{ id: 'pi-03', t: 'pipe', l: 1, les: 'i-pipe',
  q: 'O processo P cria um pipe (sem nome). Que processos o podem usar?',
  o: ['P e os descendentes criados depois', 'Quaisquer processos do mesmo utilizador', 'Só o processo P', 'Qualquer processo que saiba o PID de P'], a: 0,
  e: 'O pipe não tem nome: só se chega a ele pelos descritores, que se **herdam** com fork.' },
{ id: 'pi-04', t: 'pipe', l: 1, les: 'i-fifo',
  q: 'O que distingue um FIFO de um pipe?',
  o: ['Tem nome no sistema de ficheiros', 'Permite comunicar nos dois sentidos', 'A leitura nunca fica bloqueada', 'Guarda os dados em disco para sempre'], a: 0,
  e: 'O FIFO tem um **caminho** (criado com mkfifo), por isso processos sem parentesco o podem abrir. De resto comporta-se como um pipe.' },
{ id: 'pi-05', t: 'pipe', l: 1, les: 'i-pipe',
  q: 'O que acontece a um processo que escreve num pipe que já não tem nenhum leitor?',
  o: ['Recebe SIGPIPE', 'Fica bloqueado até alguém ler', 'O write devolve 0', 'Os dados ficam guardados em disco'], a: 0,
  e: 'Ninguém vai ler: o núcleo envia **SIGPIPE** ao escritor (que, por omissão, termina).' },
{ id: 'pi-06', t: 'pipe', l: 1, les: 'i-kernel',
  q: 'Em que situações é que o núcleo do sistema operativo entra em execução?',
  o: ['Interrupções, exceções e chamadas de sistema', 'Só em interrupções de hardware', 'Só quando uma aplicação faz uma chamada de sistema', 'Só quando um processo termina'], a: 0,
  e: 'Três portas de entrada: **interrupções** (relógio, disco), **exceções** (falta de página…) e **chamadas de sistema** (traps).' },

/* --- nível 2 --- */
{ id: 'pi-10', t: 'pipe', l: 2, les: 'i-pipe',
  q: 'Um processo lê de um pipe vazio, mas outro processo ainda tem a ponta de escrita aberta. O que acontece?',
  o: ['Bloqueia até chegarem dados', 'Devolve 0 (EOF)', 'Devolve −1 com um erro (EAGAIN)', 'Recebe SIGPIPE'], a: 0,
  e: 'Ainda pode vir alguma coisa: o read **bloqueia**. Só devolve 0 quando ninguém tiver a ponta de escrita aberta.' },
{ id: 'pi-11', t: 'pipe', l: 2, les: 'i-pipe',
  q: 'Um processo lê de um pipe vazio e já ninguém tem a ponta de escrita aberta. O que acontece?',
  o: ['Devolve 0 (EOF)', 'Bloqueia para sempre', 'Devolve −1 (erro)', 'Recebe SIGPIPE'], a: 0,
  e: 'Sem escritores e sem dados, nunca mais virá nada: o read devolve **0**, o fim de ficheiro.' },
{ id: 'pi-12', t: 'pipe', l: 2, les: 'i-pipe',
  q: 'Um pipe tem 10 bytes e a ponta de escrita está aberta. Um processo faz `read(fd, buf, 30)`. O que acontece?',
  o: ['Devolve logo os 10 bytes', 'Bloqueia até haver 30 bytes', 'Devolve 0', 'Devolve −1'], a: 0,
  e: 'O read devolve o que houver (até 30), sem esperar por mais: **10**.' },
{ id: 'pi-13', t: 'pipe', l: 2, les: 'i-pipe',
  q: 'O filho só lê de um pipe, mas esqueceu-se de fechar o seu fds[1]. O pai escreve tudo e fecha a sua ponta de escrita. O que acontece ao filho quando acabarem os dados?',
  o: ['Bloqueia para sempre no read', 'Recebe EOF e termina normalmente', 'Recebe SIGPIPE', 'O read devolve −1'], a: 0,
  e: 'O próprio filho ainda tem uma ponta de escrita aberta: para o núcleo pode chegar mais, e o read **nunca devolve EOF**.' },
{ id: 'pi-14', t: 'pipe', l: 2, les: 'i-fifo',
  q: 'Um processo faz open de um FIFO só para leitura e ainda ninguém o abriu para escrita. O que acontece?',
  o: ['O open bloqueia até haver escritor', 'O open falha com erro', 'O open devolve logo e o read dá EOF', 'O FIFO é criado automaticamente'], a: 0,
  e: 'Por omissão, o open de um FIFO **bloqueia** até haver alguém na outra ponta.' },
{ id: 'pi-15', t: 'pipe', l: 2, les: 'i-fifo',
  q: 'Um servidor tem um único FIFO onde todos os clientes escrevem os pedidos. Como se evita que os pedidos se misturem?',
  o: ['Pedidos de tamanho fixo, até PIPE_BUF', 'Cada cliente abre o FIFO em exclusivo', 'O servidor lê um byte de cada vez', 'Cada cliente espera pelo PID do servidor'], a: 0,
  e: 'Escritas até PIPE_BUF bytes são **atómicas**: não se intercalam. Com tamanho fixo, o servidor sabe onde acaba cada pedido.' },
{ id: 'pi-16', t: 'pipe', l: 2, les: 'i-fifo',
  q: 'Pai e filho precisam de trocar mensagens nos dois sentidos. O que se usa?',
  o: ['Dois pipes, um para cada sentido', 'Um pipe, que é bidirecional', 'Um só pipe e um signal para avisar', 'Um FIFO, que é bidirecional'], a: 0,
  e: 'Pipes e FIFOs são unidirecionais. Num só pipe, cada um podia ler as suas próprias mensagens.' },
{ id: 'pi-17', t: 'pipe', l: 2, les: 'i-redir',
  q: 'Depois de `pipe(fds)`, que sequência faz com que o stdout de um processo passe a ir para o pipe?',
  o: ['close(1); dup(fds[1]);', 'close(0); dup(fds[0]);', 'dup(fds[1]); close(1);', 'close(1); dup(fds[0]);'], a: 0,
  e: 'Liberta-se o 1 e o dup da **ponta de escrita** ocupa-o (menor descritor livre). Ao contrário, o dup devolvia outro número.' },
{ id: 'pi-18', t: 'pipe', l: 2, les: 'i-kernel',
  q: 'Qual é a principal vantagem de um micro-núcleo em relação a um núcleo monolítico?',
  o: ['Um bug num serviço não derruba o sistema', 'É mais rápido a tratar as chamadas de sistema', 'Tem mais código a correr em modo núcleo', 'Não precisa de modo utilizador'], a: 0,
  e: 'Os serviços (drivers, sistema de ficheiros) correm em **modo utilizador**, isolados. O preço é mais comunicação, logo menos eficiência.' },
{ id: 'pi-19', t: 'pipe', l: 2, les: 'i-kernel',
  q: 'Porque é que o núcleo usa uma pilha diferente da pilha da aplicação?',
  o: ['Para a aplicação não mexer no estado do núcleo', 'Para a comutação de processos ser mais rápida', 'Porque a pilha da aplicação é demasiado pequena', 'Para poder correr com interrupções desligadas'], a: 0,
  e: 'É uma questão de **proteção**: se o núcleo usasse a pilha da aplicação, uma aplicação maliciosa ou com bugs podia ver ou estragar o estado do núcleo.' },
{ id: 'pi-20', t: 'pipe', l: 2, les: 'i-kernel',
  q: 'Qual é a última instrução executada pelo despacho (dispatcher)?',
  o: ['RTI (Return From Interrupt)', 'Uma chamada de sistema', 'Uma instrução que inibe interrupções', 'Um salto para o main do processo'], a: 0,
  e: 'Depois de carregar o contexto do processo escolhido, o **RTI** repõe o PC e o modo utilizador de uma só vez.' },

/* --- nível 3: prever o que acontece --- */
{ id: 'pi-31', t: 'pipe', l: 3, les: 'i-pipe', ex: 'out',
  code: `int fds[2], n1, n2, n3; char buf[100];
pipe(fds);
write(fds[1], "abcde", 5);
if (fork() == 0) {
  close(fds[1]);
  n1 = read(fds[0], buf, 3);
  n2 = read(fds[0], buf, 10);
  n3 = read(fds[0], buf, 10);
  printf("%d %d %d\\n", n1, n2, n3);
  exit(0);
}
close(fds[0]);
close(fds[1]);
wait(NULL);`,
  q: 'O que imprime o filho no programa abaixo?',
  o: ['3 2 0', '3 5 0', '3 2 e fica bloqueado', '5 0 0'], a: 0,
  e: 'Lê 3 bytes, depois os 2 que sobram. No 3.º read o pipe está vazio e, quando o pai fechar a sua ponta (o filho já fechou a dele), não há escritores: devolve **0**.' },
{ id: 'pi-32', t: 'pipe', l: 3, les: 'i-pipe', ex: 'out',
  code: `int fds[2], n1, n2, n3; char buf[100];
pipe(fds);
write(fds[1], "abcde", 5);
if (fork() == 0) {
  n1 = read(fds[0], buf, 3);
  n2 = read(fds[0], buf, 10);
  n3 = read(fds[0], buf, 10);
  printf("%d %d %d\\n", n1, n2, n3);
  exit(0);
}
close(fds[0]);
close(fds[1]);
wait(NULL);`,
  q: 'O que imprime o filho no programa abaixo? (Repara que o filho não fecha nenhuma ponta.)',
  o: ['Nada: o 3.º read nunca regressa', '3 2 0, porque o 3.º read devolve EOF', '3 5 0', '5 0 0'], a: 0,
  e: 'O filho ainda tem fds[1] aberto: o 3.º read, com o pipe vazio, **bloqueia para sempre** e o printf nunca acontece. O pai também fica preso no wait.' },
{ id: 'pi-30', t: 'pipe', l: 3, les: 'i-pipe', ex: 'out', src: 'Exame 2024/25, 2.ª época',
  code: `#define DIM 10
void main() {
  char msg[DIM], tmp[DIM];
  int fds[2], res;
  if (pipe(fds) < 0) exit(-1);
  write(fds[1], msg, sizeof(msg));
  res = fork();
  if (res == 0) {
    read(fds[0], tmp, sizeof(tmp));
    printf("terminado\\n");
  } else {
    read(fds[0], tmp, sizeof(tmp));
    printf("terminado\\n");
    wait(NULL);
  }
}`,
  q: 'Qual é a descrição correta e mais precisa do que acontece com o programa abaixo?',
  o: ['Um imprime "terminado", o outro bloqueia', '"terminado" é impresso duas vezes', 'Só o pai imprime "terminado"', 'Um imprime "terminado" e o outro termina com erro'], a: 0,
  e: 'Há só 10 bytes no pipe e os dois leem 10: quem chegar primeiro leva-os. O outro fica **bloqueado** no read, porque os dois ainda têm a ponta de escrita aberta.' },
{ id: 'pi-33', t: 'pipe', l: 3, les: 'i-redir', src: 'Exame 2024/25, 2.ª época',
  code: `01. pipe(fds);
02. p = fork();
03. if (p > 0) {
04.   //close(0);
05.   close(1);
06.   dup(fds[1]);
07.   close(fds[1]);
08.   close(fds[0]);
09. }
10. else if (p == 0) {
11.   close(0);
12.   dup(fds[0]);
13.   close(fds[1]);
14.   close(fds[0]);
15. }`,
  q: 'O código abaixo pretende redirecionar o stdout do pai para o stdin do filho. Qual das afirmações é **falsa**?',
  o: ['A linha 05 podia ser omitida e a redireção funcionava', 'A linha 12 põe a ponta de leitura no stdin do filho', 'A linha 14 podia ser omitida e a redireção funcionava', 'Descomentar a linha 04 estragava a redireção'], a: 0,
  e: 'Sem o close(1), o dup devolve o menor descritor livre, que **não** é o 1: o stdout não é redirecionado. (Com a linha 04, o dup daria o 0 em vez do 1: também estragava.)' },

/* --- nível 4: perguntas de exame --- */
{ id: 'pi-40', t: 'pipe', l: 4, les: 'i-pipe', src: 'Exame 2022/23, 1.ª época',
  q: 'Pretende-se criar um canal de comunicação entre um processo pai e um processo filho em Unix. Qual das afirmações é verdadeira?',
  o: ['O filho herda as duas pontas do pipe abertas', 'Para este canal só se pode usar um pipe', 'Não dá para usar um pipe: o filho não o consegue abrir', 'Se o filho herda o pipe, só o pai pode enviar dados'], a: 0,
  e: 'Depois do fork, as duas pontas de um pipe criado pelo pai ficam abertas **nos dois** processos. Também se podia usar um FIFO, sockets, etc.' },
{ id: 'pi-41', t: 'pipe', l: 4, les: 'i-fifo', src: 'Exame 2022/23, 1.ª época',
  q: 'Qual das seguintes afirmações sobre pipes e FIFOs (pipes com nome) é verdadeira?',
  o: ['Comunicam da mesma forma; só o nome difere', 'O pipe é unidirecional e o FIFO bidirecional', 'O pipe é bidirecional e o FIFO unidirecional', 'Criar um FIFO é igual a criar um ficheiro'], a: 0,
  e: 'Ambos são canais unidirecionais de bytes com as mesmas regras de leitura e escrita. O FIFO tem nome e cria-se com mkfifo (não com open/creat).' },
{ id: 'pi-42', t: 'pipe', l: 4, les: 'i-fifo', src: 'Exame 2023/24, 1.ª época',
  q: 'Qual das seguintes afirmações sobre pipes e FIFOs é verdadeira?',
  o: ['A leitura de um pipe pode bloquear, e a de um FIFO também', 'O open de um pipe nunca bloqueia e o de um FIFO pode bloquear', 'São iguais na comunicação e na atribuição de nome', 'Criar um pipe é igual a criar um ficheiro'], a: 0,
  e: 'Nos dois, ler sem dados e com escritores bloqueia. Um pipe nem sequer é aberto com open: é criado já aberto por pipe().' },
{ id: 'pi-43', t: 'pipe', l: 4, les: 'i-kernel', src: 'Exame 2023/24, 1.ª época',
  q: 'Qual das seguintes afirmações é verdadeira?',
  o: ['A última instrução do despacho é o RTI', 'O núcleo só entra em execução com interrupções de hardware', 'O núcleo usa a mesma pilha que as aplicações', 'Comutar processos custa menos do que comutar tarefas'], a: 0,
  e: 'O despacho acaba com Return From Interrupt. O núcleo também entra por chamadas de sistema e exceções, tem pilha própria, e comutar processos é mais caro.' },
{ id: 'pi-44', t: 'pipe', l: 4, les: 'i-fifo', src: 'Exame 2023/24, 2.ª época',
  q: 'Qual das seguintes afirmações sobre pipes e FIFOs é verdadeira?',
  o: ['Os FIFOs são identificados por nomes de ficheiros', 'Os FIFOs só servem entre processos pai e filho', 'Os pipes têm dois canais e os FIFOs um bidirecional', 'Abrir um pipe é igual a abrir um ficheiro'], a: 0,
  e: 'O FIFO tem um caminho no sistema de ficheiros, e é por isso que serve processos sem parentesco.' },
{ id: 'pi-45', t: 'pipe', l: 4, les: 'i-kernel', src: 'Exame 2023/24, 2.ª época',
  q: 'Qual das seguintes afirmações é verdadeira?',
  o: ['Um núcleo monolítico é mais eficiente do que um com várias camadas', 'O núcleo só entra em execução com uma system call', 'A preempção serve para os menos prioritários não perderem o CPU', 'Duas pilhas (núcleo e aplicação) servem para comutar mais depressa'], a: 0,
  e: 'Num monolítico as chamadas entre partes do núcleo são diretas, sem mudar de nível de proteção. A preempção serve os **mais** prioritários, e as duas pilhas servem a proteção.' },
{ id: 'pi-46', t: 'pipe', l: 4, les: 'i-pipe', src: 'Exame 2024/25, 1.ª época',
  q: 'Qual das seguintes afirmações sobre pipes e FIFOs é verdadeira?',
  o: ['Escrever num pipe sem leitores dá SIGPIPE ao escritor', 'Por omissão o open de um FIFO bloqueia e o de um pipe não', 'Os pipes são identificados por nomes de ficheiros', 'Com um só FIFO no servidor, os pedidos podem ter qualquer tamanho fixo'], a: 0,
  e: 'SIGPIPE é o aviso de que ninguém vai ler. Um pipe não tem open; os pedidos num FIFO partilhado têm de caber em PIPE_BUF para não se misturarem.' },
{ id: 'pi-47', t: 'pipe', l: 4, les: 'i-kernel', src: 'Exame 2024/25, 1.ª época',
  q: 'Qual das seguintes afirmações é verdadeira?',
  o: ['Se a aplicação pudesse desligar interrupções, podia comprometer o núcleo', 'Ao instalar um SO também se atualiza a BIOS para o novo núcleo poder arrancar', 'Um núcleo monolítico resiste melhor a bugs nos drivers', 'As duas pilhas servem para comutar processos mais depressa'], a: 0,
  e: 'Sem interrupções o núcleo nunca mais recuperava o CPU (nem o relógio, nem o disco): por isso é uma instrução privilegiada.' },
]);
