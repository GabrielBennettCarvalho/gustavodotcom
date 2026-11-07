/* ===== SO questions reserved for the mock exam: the two exams of 2025/26 =====
   They never appear in levels, Learn, the route or the extras: only in "Exame simulado" (and in its review). */
const EX_PC = `pthread_mutex_t semExMut = [0];
sem_t MsgparaLer, bufferCheio;
void EscreveMsg(t_msg Msg) {
  [1]; [2];
  buffer[indiceEscrita] = Msg;
  indiceEscrita = (indiceEscrita + 1) % N;
  [3]; [4];
}
void LeMsg(t_msg *Msg) {
  [5]; [6];
  *Msg = buffer[indiceLeitura];
  indiceLeitura = (indiceLeitura + 1) % N;
  [7]; [8];
}
int main() {
  sem_init(&MsgparaLer, [9]);
  sem_init(&bufferCheio, [10]);
}`;
const EX_AB = `int buffer[N]; int indiceEscrita = 0, indiceLeituraA = 0, indiceLeituraB = 0;
int restantes[N] = {0};        // leituras que ainda faltam em cada posição
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
sem_t slotsLivres, msgsParaA, msgsParaB;
void EscreveMsg(int msg) {
  sem_wait(&slotsLivres); pthread_mutex_lock(&m);
  buffer[indiceEscrita] = msg; restantes[indiceEscrita] = 2;
  indiceEscrita = (indiceEscrita + 1) % N;
  pthread_mutex_unlock(&m); sem_post(&msgsParaA); sem_post(&msgsParaB);
}
static int LeMsgGenerico(sem_t *meuSem, int *pIndiceLeitura) {
  int msg;
  [6]
  pthread_mutex_lock(&m);
  int ind = *pIndiceLeitura;
  msg = buffer[ind];
  *pIndiceLeitura = (*pIndiceLeitura + 1) % N;
  restantes[ind]--;
  [9]
  pthread_mutex_unlock(&m);
  return msg;
}
int LeMsgA(void) { return LeMsgGenerico(&msgsParaA, &indiceLeituraA); }
int LeMsgB(void) { return LeMsgGenerico(&msgsParaB, &indiceLeituraB); }`;
const EX_AB_Q = 'Buffer circular de N posições com produtores e dois tipos de consumidores, A e B: cada mensagem tem de ser lida exatamente uma vez por um A e uma vez por um B, e só depois a posição pode ser reutilizada. ';

STUDY.questions('so', [
/* --- 1.ª época, 23 de janeiro de 2026 --- */
{ id: 'ex-01', t: 'exam', l: 4, reserved: 'exam', les: 'f-redir', src: 'Exame 2025/26, 1.ª época',
  code: `int x; char str[10];
int fd = [i];
// redirecionar o stdin para o descritor fd
[ii];
[iii];
scanf("%d %s", &x, str);   // /home/SO/input.txt contém: 123 ABC`,
  q: 'O programa abaixo quer ler dados de /home/SO/input.txt redirecionando o stdin. O que vai nas caixas i, ii e iii, por esta ordem?',
  o: ['open(…, O_RDONLY); close(STDIN_FILENO); dup(fd);', 'open(…, O_WRONLY); close(STDIN_FILENO); dup(fd);', 'open(…, O_RDONLY); dup(fd); close(STDIN_FILENO);', 'open(…, O_RDONLY); close(fd); dup(STDIN_FILENO);'], a: 0,
  e: 'Abre para **leitura**, liberta o 0 e o dup ocupa o menor livre, que é o 0. Fazer o dup antes do close daria outro número.' },
{ id: 'ex-02', t: 'exam', l: 4, reserved: 'exam', les: 'f-inode', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual destas afirmações sobre o sistema de ficheiros EXT3 é verdadeira?',
  o: ['O número máximo de ficheiros é limitado pelo número de inodes', 'O EXT3 evita a fragmentação interna', 'O tamanho máximo de um ficheiro é o que as referências diretas alcançam', 'As outras três são falsas'], a: 0,
  e: 'Cada ficheiro gasta um inode. Com blocos fixos há interna, e as indiretas vão muito além das 12 diretas.' },
{ id: 'ex-03', t: 'exam', l: 4, reserved: 'exam', les: 'f-blocks', calc: true, src: 'Exame 2025/26, 1.ª época',
  q: 'No ext3, com blocos de dados de 8 KB e referências de 32 bits, quantos blocos de disco guardam referências para os blocos de um ficheiro de 16 MB (sem contar o inode)?',
  o: ['1', '2', '3', '0'], a: 0,
  e: '16 MB / 8 KB = 2048 blocos; R = 8192/4 = 2048. 2048 − 12 = 2036 ≤ 2048 → **1** bloco (indireta simples).' },
{ id: 'ex-04', t: 'exam', l: 4, reserved: 'exam', les: 'p-wait', ex: 'out', src: 'Exame 2025/26, 1.ª época',
  code: `int main() {
  pid_t pid; int status = 0;
  pid = fork();
  if (pid == 0) { printf("X"); fflush(stdout); exit(1); }
  wait(NULL);
  fork();
  printf("D"); fflush(stdout);
  if (wait(&status) != -1 && WIFEXITED(status)) {
    printf("(%d)", WEXITSTATUS(status)); fflush(stdout);
  } else exit(2);
  printf("E"); fflush(stdout);
}`,
  q: 'Todos os processos terminam com exit (explícito ou implícito). Qual é o output do programa abaixo?',
  o: ['XDD(2)E', 'XD(2)ED', 'XDDE(2)', 'XD(1)D(2)E'], a: 0,
  e: 'X, e o pai espera. Depois do 2.º fork os dois imprimem D. O 2.º filho não tem filhos: o wait dá −1 e ele faz exit(2). O pai recebe esse estado: (2), e depois E. **XDD(2)E**.' },
{ id: 'ex-05', t: 'exam', l: 4, reserved: 'exam', les: 'p-thr', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações sobre processos e tarefas é verdadeira?',
  o: ['Uma tarefa pode aceder às variáveis locais (pilha) de outra', 'Depois do fork o filho só herda as globais, não as locais', 'Depois do fork, pai e filho têm cursores independentes nos ficheiros herdados', 'fork devolve o PID do pai ao filho e 0 ao pai'], a: 0,
  e: 'As tarefas partilham todo o espaço de endereçamento, pilhas incluídas. O fork copia tudo, partilha o cursor e devolve 0 ao filho.' },
{ id: 'ex-06', t: 'exam', l: 4, reserved: 'exam', les: 'p-exec', ex: 'out', src: 'Exame 2025/26, 1.ª época',
  code: `int main(int argc, char **argv) {
  int i = 1, status;
  if (argc < 3) return 1;
  if (fork() > 0) {
    char *path = argv[1];
    i = i + 2;
    status = execl(path, path, 0);
    wait(NULL);
    printf("XX:i=%d\\n", i);
    i = i * 2;
    printf("ZZ:i=%d\\n", i);
  } else {
    char *path = argv[2];
    i = i * 5;
    status = execl(path, path, 0);
    printf("YY:i=%d\\n", i);
  }
}`,
  q: 'O fork funciona, a exec funciona no pai e falha no filho, e o programa lançado pelo pai não escreve nada. Qual é o output?',
  o: ['YY:i=5', 'XX:i=3 ZZ:i=6 YY:i=5', 'YY:i=5 XX:i=3 ZZ:i=6', 'Nada'], a: 0,
  e: 'O pai é substituído pela exec: nada do que está a seguir corre. O filho falha a exec e imprime **YY:i=5**.' },
{ id: 'ex-07', t: 'exam', l: 4, reserved: 'exam', les: 'p-thrbugs', src: 'Exame 2025/26, 1.ª época',
  code: `void *threadFn(void *arg) {
  MyStruct r; r.x = 7; r.y = 7;
  return &r;
}
int main(void) {
  pthread_t tid; MyStruct *s;
  pthread_create(&tid, NULL, threadFn, NULL);
  pthread_join(tid, (void **) &s);
  printf("Tarefa devolveu: %d, %d\\n", s->x, s->y);
}`,
  q: 'Sobre o programa abaixo, qual das afirmações é verdadeira?',
  o: ['Indefinido: aponta para a pilha da tarefa', 'Correto: r continua válida depois da tarefa terminar', 'O pthread_join garante que r continua válida', 'O erro é só de sincronização: resolve-se com um mutex'], a: 0,
  e: 'r é local da tarefa. Quando ela termina, a sua pilha deixa de ser válida: o comportamento é **indefinido**.' },
{ id: 'ex-08', t: 'exam', l: 4, reserved: 'exam', les: 'm-impl', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações sobre a implementação de trincos é verdadeira?',
  o: ['O trinco do SO nas teóricas usa, por dentro, um trinco com espera ativa', 'As implementações com chamadas de sistema minimizam a latência com o trinco livre', 'O algoritmo da padaria de Lamport usa instruções atómicas', 'Instruções atómicas evitam a espera ativa'], a: 0,
  e: 'O trinco do núcleo protege a sua fila com um trinco interno de espera ativa (curta). Chamar o núcleo com o trinco livre é **lento**, Lamport não usa hardware especial e test-and-set faz espera ativa.' },
{ id: 'ex-09', t: 'exam', l: 4, reserved: 'exam', les: 'm-gran', src: 'Exame 2025/26, 1.ª época',
  q: 'Numa aplicação multi-tarefa que usa trincos para proteger dados partilhados, qual das afirmações é **falsa**?',
  o: ['Um mutex elimina por completo o risco de míngua', 'Trincos finos podem ser mais lentos do que um trinco grosso', 'Com muitas leituras, um rwlock dá mais concorrência que um mutex', 'Sem ordem consistente na aquisição de trincos pode haver interblocagem'], a: 0,
  e: 'Um mutex não garante a ordem de entrada: uma tarefa pode perder sempre. As outras três são verdadeiras.' },
{ id: 'ex-10', t: 'exam', l: 4, reserved: 'exam', les: 'm-dead', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações sobre o jantar dos filósofos é verdadeira?',
  o: ['Com recuo determinístico, os filósofos podem nunca chegar a comer', 'A interblocagem surge garantidamente se todos quiserem comer ao mesmo tempo', 'A interblocagem só surge com mais de dois filósofos', 'Com recuo determinístico demoram mais, mas acabam todos por comer'], a: 0,
  e: 'Com recuo sempre igual podem largar e voltar a pegar em sincronia para sempre (livelock). A interblocagem depende do timing e também acontece com dois.' },
{ id: 'ex-11', t: 'exam', l: 4, reserved: 'exam', les: 's-pc', code: EX_PC, src: 'Exame 2025/26, 1.ª época',
  q: 'Buffer produtor-consumidor com dois semáforos e um mutex. O que vai nas caixas 1 e 2 (início de EscreveMsg)?',
  o: ['sem_wait(&bufferCheio); pthread_mutex_lock(&semExMut);', 'pthread_mutex_lock(&semExMut); sem_wait(&bufferCheio);', 'sem_wait(&MsgparaLer); pthread_mutex_lock(&semExMut);', 'sem_post(&bufferCheio); pthread_mutex_lock(&semExMut);'], a: 0,
  e: 'Primeiro espera por **espaço** (bufferCheio conta posições livres), só depois fecha o trinco. Ao contrário dava interblocagem.' },
{ id: 'ex-12', t: 'exam', l: 4, reserved: 'exam', les: 's-pc', code: EX_PC, src: 'Exame 2025/26, 1.ª época',
  q: 'Buffer produtor-consumidor com dois semáforos e um mutex. Que argumentos vão nas caixas 9 e 10, os sem_init?',
  o: ['MsgparaLer com 0, 0 e bufferCheio com 0, N', 'MsgparaLer com 0, N e bufferCheio com 0, 0', 'Os dois com 0, 1', 'MsgparaLer com 0, 1 e bufferCheio com 0, N'], a: 0,
  e: 'Ao início não há mensagens por ler (0) e há N posições livres (N). O primeiro 0 de cada sem_init diz que é partilhado entre tarefas, não entre processos.' },
{ id: 'ex-13', t: 'exam', l: 4, reserved: 'exam', les: 's-pc', code: EX_PC, src: 'Exame 2025/26, 1.ª época',
  q: 'Buffer produtor-consumidor com dois semáforos e um mutex. O que vai nas caixas 7 e 8 (fim de LeMsg)?',
  o: ['pthread_mutex_unlock(&semExMut); sem_post(&bufferCheio);', 'pthread_mutex_unlock(&semExMut); sem_post(&MsgparaLer);', 'sem_wait(&bufferCheio); pthread_mutex_unlock(&semExMut);', 'pthread_exit(NULL); sem_post(&bufferCheio);'], a: 0,
  e: 'Abre o trinco e avisa que há mais uma posição **livre**.' },
{ id: 'ex-14', t: 'exam', l: 4, reserved: 'exam', les: 's-pc', src: 'Exame 2025/26, 1.ª época',
  q: 'Num buffer produtor-consumidor com dois semáforos (mensagens por ler e posições livres) e um mutex, qual das afirmações é **falsa**?',
  o: ['O mutex impede que um consumidor leia uma mensagem a meio da escrita', 'Com só um leitor e um escritor, o mutex pode sair', 'Um mutex para produtores e outro para consumidores dá mais paralelismo', 'O % N mantém os índices dentro do buffer circular'], a: 0,
  e: 'Quem impede ler uma posição que ainda não foi escrita é o **semáforo** (só há sem_post depois de escrever). O mutex protege os índices entre tarefas do mesmo lado.' },
{ id: 'ex-15', t: 'exam', l: 4, reserved: 'exam', les: 's-sem', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações sobre semáforos é verdadeira?',
  o: ['Para N recursos iguais, o semáforo começa a N', 'Para N recursos iguais, o semáforo começa a 0', 'Para esperar por um evento, o semáforo começa a 1', 'Nenhuma das anteriores'], a: 0,
  e: 'Recursos: começa com os N livres. Eventos: começa a 0.' },
{ id: 'ex-16', t: 'exam', l: 4, reserved: 'exam', les: 's-sem', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações é verdadeira?',
  o: ['A 1, dá a semântica de um mutex, mas menos eficiente', 'A 0, dá a semântica de um mutex, mas menos eficiente', 'Um semáforo só conta eventos, não sincroniza', 'A 0, dá a semântica de um mutex e é mais eficiente'], a: 0,
  e: 'Um semáforo iniciado a **1** imita um mutex (esperar = lock, assinalar = unlock), com mais custo.' },
{ id: 'ex-17', t: 'exam', l: 4, reserved: 'exam', les: 'g-api', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes chamadas permite que o processo com PID 20 envie SIGINT ao processo com PID 10?',
  o: ['kill(10, SIGINT)', 'kill(20, SIGINT)', 'signal(10, SIGINT)', 'alarm(20, SIGINT)'], a: 0,
  e: 'kill recebe o PID do **destino** (10).' },
{ id: 'ex-18', t: 'exam', l: 4, reserved: 'exam', les: 'g-how', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações sobre signals é verdadeira?',
  o: ['O handler corre quando o recetor volta a correr, após o despacho', 'O handler corre no instante em que o signal é enviado', 'O handler corre no início da próxima chamada de sistema do recetor', 'Quem envia perde o CPU ao entrar no núcleo para o kill'], a: 0,
  e: 'O signal fica pendente; o handler corre quando o recetor volta ao modo utilizador, depois de ser despachado.' },
{ id: 'ex-19', t: 'exam', l: 4, reserved: 'exam', les: 'i-pipe', ex: 'out', src: 'Exame 2025/26, 1.ª época',
  code: `#define DIM 10
void main() {
  char msg[DIM], tmp[DIM]; int fds[2], res;
  if (pipe(fds) < 0) exit(-1);
  write(fds[1], msg, sizeof(msg));
  res = fork();
  write(fds[1], msg, sizeof(msg));
  while (1) {
    if (res == 0) { read(fds[0], tmp, sizeof(tmp)); printf("li!\\n"); }
    else { read(fds[0], tmp, sizeof(tmp)); printf("li!\\n"); wait(NULL); }
  }
}`,
  q: 'Qual é a descrição correta e mais precisa do que acontece com o programa abaixo?',
  o: ['li! três vezes e os processos ficam bloqueados', 'Um dos processos bloqueia-se', 'li! duas vezes', 'li! duas vezes e os dois processos bloqueiam-se'], a: 0,
  e: '30 bytes no pipe (1 write antes e 2 depois do fork). O pai lê 10 e fica no wait. O filho lê os outros 20 (duas vezes li!) e bloqueia no 4.º read, porque as pontas de escrita continuam abertas. **3 li!** e os dois bloqueados.' },
{ id: 'ex-20', t: 'exam', l: 4, reserved: 'exam', les: 'i-kernel', src: 'Exame 2025/26, 1.ª época',
  q: 'Qual das seguintes afirmações é verdadeira?',
  o: ['Nenhuma das outras é verdadeira', 'Os núcleos monolíticos têm menos código no núcleo', 'O Linux usa um núcleo multi-camada', 'Os micro-núcleos correm os serviços todos em modo núcleo'], a: 0,
  e: 'Os monolíticos têm **mais** código no núcleo, o Linux é monolítico, e os micro-núcleos põem os serviços em modo utilizador.' },
{ id: 'ex-21', t: 'exam', l: 4, reserved: 'exam', les: 'f-tables', src: 'Exame 2025/26, 1.ª época',
  q: 'É possível que uma dada entrada da tabela global de ficheiros abertos seja referenciada por processos diferentes?',
  o: ['Sim, através de fork()', 'Nunca é possível', 'Sim, através de exec()', 'Sim, enviando o descritor por um pipe'], a: 0,
  e: 'O filho herda os descritores do pai, que apontam para as mesmas entradas. A exec não cria processos, e mandar o número de um fd por um pipe não dá nada ao outro processo.' },
{ id: 'ex-22', t: 'exam', l: 4, reserved: 'exam', les: 'v-page', calc: true, src: 'Exame 2025/26, 1.ª época',
  q: 'Memória virtual paginada de 36 bits: 14 bits (menos significativos) de deslocamento e 22 de página; PTEs de 8 bytes. Qual é a dimensão das páginas?',
  o: ['16 KB', '2^36 bits', '2^22 bytes', '4 KB'], a: 0,
  e: '2¹⁴ = 16 384 bytes = **16 KB**. (No exame era "Nenhuma das anteriores".)' },
{ id: 'ex-23', t: 'exam', l: 4, reserved: 'exam', les: 'v-pte', calc: true, src: 'Exame 2025/26, 1.ª época',
  q: 'Memória virtual paginada de 36 bits: 14 bits de deslocamento e 22 de página; PTEs de 8 bytes. Supondo endereços físicos também de 36 bits, quantos bits ficam livres em cada PTE além da base (para presente, proteções, etc.)?',
  o: ['42 bits', '64 bits', '28 bits', '50 bits'], a: 0,
  e: 'Base (nº de trama) = 36 − 14 = 22 bits. PTE de 64 bits → 64 − 22 = **42**.' },
{ id: 'ex-24', t: 'exam', l: 4, reserved: 'exam', les: 'v-tlb', src: 'Exame 2025/26, 1.ª época',
  q: 'Uma aplicação em modo utilizador acede à memória. Quem procura a tradução da página na TLB?',
  o: ['A MMU, com o CPU em modo utilizador', 'A MMU, com o CPU em modo núcleo', 'Software, com o CPU em modo núcleo', 'Software, com o CPU em modo utilizador'], a: 0,
  e: 'É hardware (MMU) e acontece sem mudar de modo: o CPU continua em **modo utilizador**.' },
{ id: 'ex-25', t: 'exam', l: 4, reserved: 'exam', les: 'v-pte', src: 'Exame 2025/26, 1.ª época',
  q: 'Uma aplicação em modo utilizador teve uma falta de página. Quem carrega a página para a RAM e atualiza a sua entrada na tabela de páginas?',
  o: ['Software, com o CPU em modo núcleo', 'A MMU, com o CPU em modo utilizador', 'A MMU, com o CPU em modo núcleo', 'Software, com o CPU em modo utilizador'], a: 0,
  e: 'A falta de página é uma exceção: o **núcleo** (software, em modo núcleo) escolhe a trama, lê do disco e atualiza a PTE.' },
{ id: 'ex-26', t: 'exam', l: 4, reserved: 'exam', les: 'g-how', src: 'Exame 2025/26, 1.ª época',
  q: 'Uma aplicação acede a um endereço inválido e tem um handler para SIGSEGV. Quem executa esse handler?',
  o: ['Software, com o CPU em modo utilizador', 'Software do núcleo, com o CPU em modo núcleo', 'A MMU, com o CPU em modo utilizador', 'A MMU, com o CPU em modo núcleo'], a: 0,
  e: 'O handler é código da aplicação: corre em **modo utilizador**, quando o núcleo devolve o controlo ao processo.' },
{ id: 'ex-27', t: 'exam', l: 4, reserved: 'exam', les: 'v-pte', ex: 'mmu', src: 'Exame 2025/26, 1.ª época',
  d: { tbls: [
    { cap: 'Tabela de P1', h: ['Página', 'Base', 'Prot.', 'Pres.'], r: [['0x00000', '0x10100', 'rwx', 'S'], ['0x00001', '0x11010', 'r-x', 'N'], ['0x00002', '0x01001', 'rwx', 'S']] },
    { cap: 'Tabela de P2', h: ['Página', 'Base', 'Prot.', 'Pres.'], r: [['0x00000', '0x10000', 'rwx', 'S'], ['0x00001', '0x11000', 'r-x', 'N'], ['0x00002', '0x01000', 'r-x', 'S']] } ] },
  code: `Endereços de 32 bits, páginas de 4 KB. TLB vazia no início.
1. 0x00000C99  P1  escrever
2. 0x00001456  P1  escrever
3. 0x00000ABA  P2  ler
4. 0x00002002  P2  escrever
5. 0x00002007  P1  executar
6. 0x00002C07  P1  ler
7. 0x00003002  P2  ler`,
  q: 'Dois processos com as tabelas abaixo fazem os acessos indicados, por esta ordem. Qual é o resultado do acesso 4 (0x00002002, P2, escrever)?',
  o: ['Violação de proteção', 'Físico 0x01000002, sem exceção', 'Falta de página', 'Físico 0x01001002, sem exceção'], a: 0,
  e: 'Na tabela de **P2**, a página 2 é **r-x**: não pode ser escrita. (0x01001 é a trama de P1, não de P2.)' },
{ id: 'ex-28', t: 'exam', l: 4, reserved: 'exam', les: 'v-tlb', ex: 'mmu', src: 'Exame 2025/26, 1.ª época',
  d: { tbls: [
    { cap: 'Tabela de P1', h: ['Página', 'Base', 'Prot.', 'Pres.'], r: [['0x00000', '0x10100', 'rwx', 'S'], ['0x00001', '0x11010', 'r-x', 'N'], ['0x00002', '0x01001', 'rwx', 'S']] },
    { cap: 'Tabela de P2', h: ['Página', 'Base', 'Prot.', 'Pres.'], r: [['0x00000', '0x10000', 'rwx', 'S'], ['0x00001', '0x11000', 'r-x', 'N'], ['0x00002', '0x01000', 'r-x', 'S']] } ] },
  code: `Endereços de 32 bits, páginas de 4 KB. TLB vazia no início.
1. 0x00000C99  P1  escrever
2. 0x00001456  P1  escrever
3. 0x00000ABA  P2  ler
4. 0x00002002  P2  escrever
5. 0x00002007  P1  executar
6. 0x00002C07  P1  ler
7. 0x00003002  P2  ler`,
  q: 'Dois processos com as tabelas abaixo fazem os acessos indicados, por esta ordem. Qual é o resultado do acesso 6 (0x00002C07, P1, ler)?',
  o: ['TLB hit · 0x01001C07', 'TLB miss · 0x01001C07', 'TLB hit · 0x01000C07', 'TLB miss · 0x01000C07'], a: 0,
  e: 'O acesso anterior (5) foi do mesmo processo à mesma página: a tradução está na TLB. Na tabela de P1 a página 2 vai para 0x01001: **0x01001C07**.' },

/* --- 2.ª época, 6 de fevereiro de 2026 --- */
{ id: 'ex-30', t: 'exam', l: 4, reserved: 'exam', les: 'f-dup', ex: 'out', src: 'Exame 2025/26, 2.ª época',
  code: `// /tmp/data.txt contém exatamente: ABCDEFG
int fd1 = open("/tmp/data.txt", O_RDONLY);
int fd2 = dup(fd1);
char a, b;
read(fd1, &a, 1);
lseek(fd2, 2, SEEK_CUR);
read(fd2, &b, 1);
printf("%c %c\\n", a, b);`,
  q: 'Qual é o output do programa abaixo?',
  o: ['A D', 'A C', 'B D', 'A B'], a: 0,
  e: 'a = A e o cursor partilhado fica em 1. O lseek soma 2 → 3. b = **D**.' },
{ id: 'ex-31', t: 'exam', l: 4, reserved: 'exam', les: 'f-alloc', src: 'Exame 2025/26, 2.ª época',
  q: 'Qual das seguintes afirmações sobre um sistema de ficheiros do tipo FAT é verdadeira?',
  o: ['Os blocos de cada ficheiro formam uma lista ligada na FAT', 'Cada ficheiro tem um mapa de blocos na sua entrada de diretório', 'A FAT tem uma entrada por ficheiro', 'A FAT garante que os blocos de cada ficheiro são contíguos'], a: 0,
  e: 'A entrada de cada bloco aponta para o bloco seguinte do ficheiro: **lista ligada**.' },
{ id: 'ex-32', t: 'exam', l: 4, reserved: 'exam', les: 'f-blocks', calc: true, src: 'Exame 2025/26, 2.ª época',
  q: 'Ext3 com inodes no formato habitual, blocos de dados de 4 KB e referências de 4 bytes. Quantos blocos de disco são usados só para referências num ficheiro de 20 MB (sem contar o inode)?',
  o: ['6', '5', '4', '7'], a: 0,
  e: '5120 blocos; R = 1024. 5120 − 12 = 5108 → simples: 1 (sobram 4084) → dupla: 1 + ⌈4084/1024⌉ = 1 + 4 = 5. Total **6**.' },
{ id: 'ex-33', t: 'exam', l: 4, reserved: 'exam', les: 'p-modes', src: 'Exame 2025/26, 2.ª época',
  q: 'Relativamente ao mecanismo setuid, qual das seguintes afirmações é verdadeira?',
  o: ['O processo fica com o UID efetivo do dono do ficheiro', 'Qualquer utilizador pode usar a chamada setuid', 'A chamada setuid dá os privilégios de root a quem a chama', 'Nenhuma das anteriores'], a: 0,
  e: 'Executar um ficheiro com o bit setuid dá ao processo o UID efetivo do **dono do ficheiro**.' },
{ id: 'ex-34', t: 'exam', l: 4, reserved: 'exam', les: 'p-thrbugs', ex: 'out', src: 'Exame 2025/26, 2.ª época',
  code: `int a = 2;
static void *t1(void *arg) { a = 1; printf("B"); fflush(stdout); return (void *) &a; }
static void *t2(void *arg) { printf("A"); fflush(stdout); return NULL; }
int main(void) {
  pthread_t th_a, th_b; void *ret = NULL;
  pthread_create(&th_a, NULL, t1, NULL);
  pthread_join(th_a, &ret);
  pthread_create(&th_b, NULL, t2, NULL);
  printf("A"); fflush(stdout);
  pthread_join(th_b, NULL);
  a = 3;
  printf("%d", *(int *) ret); fflush(stdout);
  printf("E"); fflush(stdout);
  return 0;
}`,
  q: 'Qual é o output do programa abaixo?',
  o: ['BAA3E', 'BAA1E', 'ABA3E', 'BAA2E'], a: 0,
  e: 'B (t1, com join). Depois os dois A (main e t2, por qualquer ordem, mas iguais). ret aponta para a **global** a, que já vale 3 quando se imprime. **BAA3E**.' },
{ id: 'ex-35', t: 'exam', l: 4, reserved: 'exam', les: 'p-exec', src: 'Exame 2025/26, 2.ª época',
  q: 'Qual das seguintes afirmações sobre processos e tarefas é verdadeira?',
  o: ['A exec não reinicia a tabela de ficheiros abertos', 'A exec cria um filho que corre outro programa', 'wait() sem filhos pode bloquear', 'Uma tarefa que chama uma função altera todas as pilhas'], a: 0,
  e: 'Os ficheiros abertos sobrevivem à exec. A exec não cria processos, wait sem filhos devolve −1, e cada tarefa só mexe na sua pilha.' },
{ id: 'ex-36', t: 'exam', l: 4, reserved: 'exam', les: 'p-exec', ex: 'out', src: 'Exame 2025/26, 2.ª época',
  code: `int main(int argc, char **argv) {
  int i = 2, status; pid_t pid;
  if (argc < 3) return 1;
  pid = fork();
  if (pid == 0) {
    i = i + 3;
    printf("P1:i=%d", i); fflush(stdout);
    status = execl(argv[1], argv[1], (char *) 0);
    printf("P2:i=%d status=%d", i, status); fflush(stdout);
    exit(0);
  } else if (pid > 0) {
    wait(NULL);
    i = i * 4;
    status = execl(argv[2], argv[2], (char *) 0);
    printf("F1:i=%d status=%d", i, status); fflush(stdout);
  }
  return 0;
}`,
  q: 'O fork funciona, a exec funciona no filho e falha no pai, e os programas lançados não escrevem nada. Qual é o output?',
  o: ['P1:i=5 F1:i=8 status=-1', 'P1:i=5 P2:i=5 status=-1 F1:i=8 status=-1', 'F1:i=8 status=-1 P1:i=5', 'P1:i=5'], a: 0,
  e: 'O filho imprime P1:i=5 e é substituído. O pai espera, faz 2 × 4 = 8, a exec falha (−1) e imprime **F1:i=8 status=-1**.' },
{ id: 'ex-37', t: 'exam', l: 4, reserved: 'exam', les: 'm-impl', src: 'Exame 2025/26, 2.ª época',
  q: 'Qual das seguintes afirmações sobre a implementação de trincos é verdadeira?',
  o: ['Sem apoio do núcleo, os trincos fazem sempre espera ativa', 'Trincos por chamadas de sistema não delimitam secções críticas', 'Trincos por hardware (test-and-set) não fazem espera ativa', 'Nenhuma das anteriores'], a: 0,
  e: 'Só o núcleo pode pôr uma tarefa a dormir. Sem ele, quem encontra o trinco fechado tem de voltar a testar.' },
{ id: 'ex-38', t: 'exam', l: 4, reserved: 'exam', les: 'm-dead', src: 'Exame 2025/26, 2.ª época',
  q: 'Qual das seguintes afirmações sobre interblocagem é verdadeira?',
  o: ['Uma ordem fixa de aquisição evita a interblocagem', 'Pode haver interblocagem com um só trinco sempre largado', 'Trocar trincos por semáforos elimina a interblocagem', 'Interblocagem quer dizer que se adquirem trincos a mais'], a: 0,
  e: 'A ordem fixa impede a espera circular. Semáforos também podem bloquear em ciclo.' },
{ id: 'ex-39', t: 'exam', l: 4, reserved: 'exam', les: 's-boxes', code: EX_AB, src: 'Exame 2025/26, 2.ª época',
  q: EX_AB_Q + 'O que vai na caixa 6, no início de LeMsgGenerico?',
  o: ['sem_wait(meuSem);', 'sem_wait(&slotsLivres);', 'sem_post(meuSem);', 'pthread_mutex_lock(&m);'], a: 0,
  e: 'Cada consumidor espera pelo **seu** semáforo (msgsParaA ou msgsParaB, recebido em meuSem), antes de fechar o trinco.' },
{ id: 'ex-40', t: 'exam', l: 4, reserved: 'exam', les: 's-boxes', code: EX_AB, src: 'Exame 2025/26, 2.ª época',
  q: EX_AB_Q + 'O que vai na caixa 9, depois de `restantes[ind]--`?',
  o: ['if (restantes[ind] == 0) sem_post(&slotsLivres);', 'if (restantes[ind] == 2) sem_post(&slotsLivres);', 'sem_post(&slotsLivres);', 'sem_post(meuSem);'], a: 0,
  e: 'A posição só fica livre depois das **duas** leituras: quando restantes chega a 0.' },
{ id: 'ex-41', t: 'exam', l: 4, reserved: 'exam', les: 's-boxes', code: EX_AB, src: 'Exame 2025/26, 2.ª época',
  q: EX_AB_Q + 'Com que valores se inicializam os semáforos (2.º e 3.º argumentos de sem_init)?',
  o: ['msgsParaA e msgsParaB a 0; slotsLivres a N', 'Os três a 0', 'msgsParaA e msgsParaB a N; slotsLivres a 0', 'Os três a N'], a: 0,
  e: 'No início não há mensagens (0, 0) e há N posições livres (N). Todos com o 2.º argumento 0 (partilhados entre tarefas).' },
{ id: 'ex-42', t: 'exam', l: 4, reserved: 'exam', les: 's-pc', src: 'Exame 2025/26, 2.ª época',
  q: EX_AB_Q + 'Qual das afirmações sobre esta versão do buffer é verdadeira?',
  o: ['Separar o mutex de produtores e consumidores dá mais paralelismo', 'Cada item tem sempre de ser lido primeiro por um consumidor do tipo A', 'Um índice de leitura por tipo é só uma otimização', 'Um mutex para os A e outro para os B tornava-o mais correto'], a: 0,
  e: 'Produtores e consumidores nunca mexem na mesma posição ao mesmo tempo. Já A e B mexem no mesmo restantes[ind], por isso precisam do **mesmo** trinco; e cada tipo precisa do seu índice para estar correto.' },
{ id: 'ex-43', t: 'exam', l: 4, reserved: 'exam', les: 's-sem', src: 'Exame 2025/26, 2.ª época',
  q: 'Qual das seguintes afirmações sobre as operações de um semáforo é verdadeira?',
  o: ['esperar() decrementa e pode bloquear', 'assinalar() pode bloquear se o valor for zero', 'esperar() incrementa o valor e acorda uma tarefa', 'Um semáforo só serve para exclusão mútua'], a: 0,
  e: 'esperar decrementa (ou bloqueia se está a 0); assinalar nunca bloqueia.' },
{ id: 'ex-44', t: 'exam', l: 4, reserved: 'exam', les: 'g-api', src: 'Exame 2025/26, 2.ª época',
  code: `void sigHandler(int s) {
  char ch;
  const char msg[] = "Queres mesmo terminar? (Y/N)\\n";
  (1)
  (2)
  if (ch == 'Y') exit(0);
  else (4)
}
int main() {
  signal(SIGINT, sigHandler);
  for (;;) pause();
}`,
  q: 'O handler abaixo deve perguntar se se quer terminar e ler a resposta, sem usar funções inseguras num handler. O que vai nas caixas (1) e (2)?',
  o: ['write(1, msg, …) e read(0, &ch, 1)', 'printf(msg) e ch = getchar()', 'read(1, &ch, 1) e write(0, &ch, 1)', 'write(0, msg, …) e read(1, &ch, 1)'], a: 0,
  e: 'Escreve a pergunta no **stdout** (1) com write e lê do **stdin** (0) com read: as duas são seguras num handler. printf e getchar não são.' },
{ id: 'ex-45', t: 'exam', l: 4, reserved: 'exam', les: 'g-how', src: 'Exame 2025/26, 2.ª época',
  code: `void sigHandler(int s) {
  ... pergunta e lê a resposta para ch ...
  if (ch == 'Y') exit(0);
  else (4)
}
int main() {
  (5)
  for (;;) (6)
}`,
  q: 'O programa abaixo quer perguntar, a cada CTRL+C, se se deve terminar, e continuar se a resposta for não, mesmo em semântica System V. O que vai na caixa (4)?',
  o: ['signal(SIGINT, sigHandler);', 'kill(0);', 'pause();', 'signal(SIGQUIT, sigHandler);'], a: 0,
  e: 'Em System V o handler volta à omissão depois de chamado: reinstala-se para o **próximo** CTRL+C (SIGINT).' },
{ id: 'ex-46', t: 'exam', l: 4, reserved: 'exam', les: 'i-pipe', src: 'Exame 2025/26, 2.ª época',
  code: `int fd[2]; char buf[20];
const char msg[] = "Hello from parent\\n";
(1)(fd);
if ((2)() == 0) {
  (3)(fd[1]);
  (4)(fd[0], buf, sizeof(buf));
  (5)(STDOUT_FILENO, buf, sizeof(buf));
  (6)(fd[0]);
} else {
  (7)(fd[0]);
  (8)(fd[1], msg, sizeof(msg));
  (9)(fd[1]);
}`,
  q: 'O pai envia uma mensagem ao filho por um pipe e o filho mostra-a no stdout. Que chamadas vão nas caixas 3, 4, 5 e 6, por esta ordem?',
  o: ['close, read, write, close', 'close, write, read, close', 'read, close, write, close', 'close, read, close, write'], a: 0,
  e: 'O filho fecha a ponta que não usa (escrita), lê do pipe, escreve no ecrã e fecha a ponta de leitura.' },
{ id: 'ex-47', t: 'exam', l: 4, reserved: 'exam', les: 'i-kernel', src: 'Exame 2025/26, 2.ª época',
  q: 'Qual das seguintes afirmações é verdadeira?',
  o: ['A pilha do núcleo protege-o de aplicações com bugs', 'Os monolíticos são menos eficientes do que os multi-camada', 'O núcleo entra em execução em cada printf', 'Os FIFOs só servem entre processos aparentados'], a: 0,
  e: 'Uma pilha exclusiva do núcleo salvaguarda o seu estado de aplicações maliciosas ou com bugs. O printf só entra no núcleo quando o buffer é escrito (write).' },
{ id: 'ex-48', t: 'exam', l: 4, reserved: 'exam', les: 'c-cfs', calc: true, src: 'Exame 2025/26, 2.ª época',
  q: 'CFS num só CPU com 30 processos arrancados ao mesmo tempo: 10 nunca bloqueiam, 10 correm 6 ms e bloqueiam, 10 estão bloqueados. Granularidade mínima 2 ms, latência alvo 20 ms. Qual é a latência efetiva na primeira ronda?',
  o: ['40 ms', '20 ms', '60 ms', '2 ms'], a: 0,
  e: 'Executáveis: 20 (os 10 bloqueados não contam). 20/20 = 1 ms < 2 ms → 20 × 2 = **40 ms**.' },
{ id: 'ex-49', t: 'exam', l: 4, reserved: 'exam', les: 'c-cfs', calc: true, src: 'Exame 2025/26, 2.ª época',
  q: 'CFS num só CPU com 30 processos que começam todos com vruntime 1000 (ms): 10 nunca bloqueiam (classe 1), 10 correm 6 ms e bloqueiam (classe 2), 10 estão bloqueados (classe 3). Granularidade mínima 2 ms, latência alvo 20 ms. Que vruntime tem cada classe no fim da ronda em que os da classe 2 bloqueiam?',
  o: ['1006, 1006 e 1000', '1006, 1006 e 1006', '1004, 1006 e 1000', '1040, 1006 e 1000'], a: 0,
  e: 'Cada executável recebe 2 ms por ronda. Os da classe 2 bloqueiam ao fim de 6 ms, na 3.ª ronda: classes 1 e 2 em **1006**. A classe 3 nunca correu: **1000**.' },
{ id: 'ex-50', t: 'exam', l: 4, reserved: 'exam', les: 'v-seg', calc: true, src: 'Exame 2025/26, 2.ª época',
  q: 'Memória virtual segmentada de 8 bits: 6 bits (menos significativos) de deslocamento e 2 de segmento. Qual é a dimensão máxima de um segmento?',
  o: ['64 bytes', '256 bytes', '6 bytes', '4 bytes'], a: 0,
  e: '2⁶ = **64 bytes**.' },
{ id: 'ex-51', t: 'exam', l: 4, reserved: 'exam', les: 'v-seg', calc: true, src: 'Exame 2025/26, 2.ª época',
  q: 'Memória segmentada de 8 bits: 6 bits de deslocamento e 2 de segmento; cada entrada da tabela de segmentos ocupa 2 bytes. Qual é a ocupação máxima das tabelas de segmentos com 2 processos?',
  o: ['16 bytes', '8 bytes', '4 bytes', '512 bytes'], a: 0,
  e: '2² = 4 segmentos por tabela × 2 bytes = 8 bytes por processo; com 2 processos, **16 bytes**.' },
{ id: 'ex-52', t: 'exam', l: 4, reserved: 'exam', les: 'v-pte', ex: 'mmu', src: 'Exame 2025/26, 2.ª época',
  d: { tbl: { h: ['Página', 'Base', 'Prot.', 'Presente'], r: [['0x00', '—', 'rwx', 'N'], ['0x01', '0xAA', 'r-x', 'S'], ['0x02', '0xBB', 'rwx', 'S']] }, cap: 'Tabela de páginas' },
  code: `Endereços de 16 bits: página (8 bits) | deslocamento (8 bits). TLB vazia no início.
Novas tramas: a partir do endereço 0x8800.
1. 0x00FF  escrever
2. 0x00AA  escrever
3. 0x0111  ler
4. 0x0300  escrever
5. 0x02AB  executar`,
  q: 'Com a tabela e a sequência de acessos abaixo, qual é o resultado do acesso 1 (0x00FF, escrever)?',
  o: ['TLB miss · falta de página · 0x88FF', 'TLB miss · acesso inválido', 'TLB miss · 0x00FF · sem exceção', 'TLB miss · falta de página · 0x00FF'], a: 0,
  e: 'A página 0x00 existe (rwx) mas não está presente: **falta de página**. A trama nova é a de 0x8800 → 0x88FF.' },
{ id: 'ex-53', t: 'exam', l: 4, reserved: 'exam', les: 'v-pte', ex: 'mmu', src: 'Exame 2025/26, 2.ª época',
  d: { tbl: { h: ['Página', 'Base', 'Prot.', 'Presente'], r: [['0x00', '—', 'rwx', 'N'], ['0x01', '0xAA', 'r-x', 'S'], ['0x02', '0xBB', 'rwx', 'S']] }, cap: 'Tabela de páginas' },
  code: `Endereços de 16 bits: página (8 bits) | deslocamento (8 bits). TLB vazia no início.
Novas tramas: a partir do endereço 0x8800.
1. 0x00FF  escrever
2. 0x00AA  escrever
3. 0x0111  ler
4. 0x0300  escrever
5. 0x02AB  executar`,
  q: 'Com a tabela e a sequência de acessos abaixo, qual é o resultado do acesso 4 (0x0300, escrever)?',
  o: ['TLB miss · acesso inválido', 'TLB miss · falta de página · 0x8800', 'TLB miss · 0xBB00 · sem exceção', 'TLB hit · violação de proteção'], a: 0,
  e: 'A página 0x03 não existe na tabela (só 0x00 a 0x02): **acesso inválido**.' },
]);
