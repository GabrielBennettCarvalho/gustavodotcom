/* ===== SO questions: processes and threads (Grupo 2) ===== */
const PR_SEQ_CODE = `int main(int argc, char **argv) {
  int p, status;
  if (argc < 2) return 1;
  for (int i = 1; i < argc; i++) {
    char *path = [1];
    p = [2];
    if (p == 0) {
      status = [3];
    }
    p = [4];
    if ([5])
      break;
  }
}`;
const PR_SEQ_Q = 'O programa abaixo deve correr, em processos diferentes e um de cada vez, todos os programas passados na linha de comando, parando se algum terminar por causa de um signal. ';

STUDY.questions('so', [
/* --- nível 1 --- */
{ id: 'pr-01', t: 'proc', l: 1, les: 'p-fork',
  q: 'Depois de um fork bem sucedido, que valor devolve o fork no processo filho?',
  o: ['0', 'O PID do pai', 'O PID do filho', '−1'], a: 0,
  e: 'No filho o fork devolve **0**; no pai devolve o PID do filho; se falhar, devolve −1 ao pai e não há filho.' },
{ id: 'pr-02', t: 'proc', l: 1, les: 'p-fork',
  q: 'Depois de um fork bem sucedido, que valor devolve o fork no processo pai?',
  o: ['O PID do filho criado', 'O valor 0', 'O PID do próprio pai', 'O número de filhos que tem'], a: 0,
  e: 'O pai recebe o **PID do filho** (> 0), que é o que lhe permite depois fazer wait ou kill a esse filho.' },
{ id: 'pr-03', t: 'proc', l: 1, les: 'p-exec',
  q: 'Um processo chama execl e a chamada é bem sucedida. O que acontece ao código que está a seguir ao execl?',
  o: ['Nunca é executado', 'Corre depois de o novo programa acabar', 'Corre num processo filho', 'Corre só se o novo programa devolver 0'], a: 0,
  e: 'A exec **substitui o programa** do processo. Não há para onde regressar: o código a seguir só corre se a exec **falhar**.' },
{ id: 'pr-04', t: 'proc', l: 1, les: 'p-thr',
  q: 'O que tem cada tarefa (thread) só para si, dentro de um processo?',
  o: ['A pilha e os registos', 'As variáveis globais', 'O heap (memória do malloc)', 'A tabela de ficheiros abertos'], a: 0,
  e: 'Globais, heap e ficheiros abertos são do **processo**, partilhados por todas as tarefas. Cada tarefa tem a sua **pilha** (variáveis locais) e os seus registos.' },
{ id: 'pr-05', t: 'proc', l: 1, les: 'p-wait',
  q: 'Um processo que nunca criou filhos chama `wait(NULL)`. O que acontece?',
  o: ['Devolve −1 logo', 'Bloqueia para sempre', 'Bloqueia até receber um signal', 'Espera que o pai termine'], a: 0,
  e: 'Sem filhos não há nada por que esperar: o wait devolve **−1** imediatamente (erro ECHILD), sem bloquear.' },
{ id: 'pr-06', t: 'proc', l: 1, les: 'p-wait',
  q: 'O que é um processo zombie?',
  o: ['Terminou e o pai ainda não fez wait', 'Está bloqueado à espera do disco', 'Perdeu o pai e foi adotado pelo init', 'Ignora todos os signals que recebe'], a: 0,
  e: 'Depois do exit fica só o registo com o PID e o estado de saída, à espera que o pai o leia com wait. Até lá é um **zombie**.' },
{ id: 'pr-07', t: 'proc', l: 1, les: 'p-modes',
  q: 'Para que serve o bit setuid de um ficheiro executável?',
  o: ['Correr com os privilégios do dono do ficheiro', 'Dar acesso ao ficheiro a todos os utilizadores', 'Impedir que outros utilizadores o executem', 'Correr sempre com os privilégios de root'], a: 0,
  e: 'Quem o executa fica com o UID **efetivo do dono** do ficheiro. Se o dono for root, é root; se for outro utilizador, é esse.' },
{ id: 'pr-08', t: 'proc', l: 1, les: 'p-modes',
  q: 'O que faz o processador numa chamada de sistema (por exemplo, read)?',
  o: ['Passa a modo núcleo e corre código do núcleo', 'Chama uma função de biblioteca em modo utilizador', 'Cria um processo novo para o núcleo', 'Desliga as interrupções da aplicação'], a: 0,
  e: 'Uma instrução especial (trap) passa o processador a **modo núcleo** e salta para o código do núcleo, que usa os parâmetros dados pela aplicação. No fim volta a modo utilizador.' },

/* --- nível 2 --- */
{ id: 'pr-10', t: 'proc', l: 2, les: 'p-fork', ex: 'out',
  code: `int x = 5;
if (fork() == 0) {
  x = x * 2;
} else {
  wait(NULL);
  x = x + 1;
}
printf("%d ", x);
fflush(stdout);`,
  q: 'Que output produz o programa abaixo?',
  o: ['10 6', '6 10', '10 11', '11 11'], a: 0,
  e: 'Cada processo tem a sua cópia de x. O filho faz 5×2 = 10 e imprime; o pai espera pelo filho e só depois faz 5+1 = **6**. Ordem garantida pelo wait: **10 6**.' },
{ id: 'pr-11', t: 'proc', l: 2, les: 'p-trace',
  code: `int main() {
  fork();
  fork();
  fork();
  return 0;
}`,
  q: 'Quantos processos existem ao todo durante a execução do programa abaixo (contando o original)?',
  o: ['8', '4', '6', '3'], a: 0,
  e: 'Cada fork é executado por todos os processos que já existem: 1 → 2 → 4 → **8** (2³).' },
{ id: 'pr-12', t: 'proc', l: 2, les: 'p-trace', ex: 'out',
  code: `int main() {
  fork();
  fork();
  printf("x\\n");
  return 0;
}`,
  q: 'Quantas vezes aparece "x" no ecrã com o programa abaixo?',
  o: ['4', '2', '3', '8'], a: 0,
  e: 'Dois forks em sequência → 4 processos, e todos chegam ao printf: **4** vezes.' },
{ id: 'pr-13', t: 'proc', l: 2, les: 'p-exec',
  q: 'Depois de uma chamada exec bem sucedida, o que se mantém do processo?',
  o: ['O PID e os ficheiros abertos', 'As variáveis globais e o heap', 'O código e os handlers de signals', 'Nada: passa a ser outro processo'], a: 0,
  e: 'Muda o programa (código, dados, pilha, handlers), mas é o **mesmo processo**: mesmo PID e os mesmos descritores abertos. É assim que a shell faz redireções antes da exec.' },
{ id: 'pr-14', t: 'proc', l: 2, les: 'p-exec',
  q: 'Um programa quer correr outro programa e continuar a correr depois. Qual é a forma habitual de o fazer?',
  o: ['fork, e o filho faz exec', 'exec, e depois um fork', 'Só exec: cria um processo novo', 'pthread_create com o programa'], a: 0,
  e: 'A exec não cria processos: substitui o programa de quem a chama. Por isso faz-se **fork** e é o **filho** que faz exec; o pai continua (e pode fazer wait).' },
{ id: 'pr-15', t: 'proc', l: 2, les: 'p-wait',
  q: 'Um pai chama `wait(&s)` e um dos seus filhos já terminou (está zombie). O que acontece?',
  o: ['Regressa logo com o PID desse filho', 'Bloqueia até outro filho terminar', 'Devolve −1 porque o filho já acabou', 'Bloqueia até todos os filhos acabarem'], a: 0,
  e: 'O wait recolhe um zombie que já exista **sem bloquear**. Só bloqueia se nenhum filho tiver terminado ainda.' },
{ id: 'pr-16', t: 'proc', l: 2, les: 'p-wait',
  q: 'Depois de `wait(&status)`, que macro diz se o filho morreu por causa de um signal que não tratou?',
  o: ['WIFSIGNALED(status)', 'WIFEXITED(status)', 'WEXITSTATUS(status)', 'WIFSTOPPED(status)'], a: 0,
  e: '**WIFSIGNALED** ≠ 0 se o filho terminou por um signal não tratado. WIFEXITED é para quem fez exit; WEXITSTATUS dá o valor do exit.' },
{ id: 'pr-17', t: 'proc', l: 2, les: 'p-thr',
  q: 'O que faz `pthread_join(tid, &r)`?',
  o: ['Espera pela tarefa tid e lê o que devolveu', 'Espera pela primeira tarefa a terminar, seja qual for', 'Cria a tarefa tid e espera que arranque', 'Junta duas tarefas numa só'], a: 0,
  e: 'Espera pela terminação de uma tarefa **específica** e guarda em r o ponteiro que ela devolveu. Não há join "de uma qualquer".' },
{ id: 'pr-18', t: 'proc', l: 2, les: 'p-thr',
  q: 'Porque é que comutar entre tarefas do mesmo processo é mais barato do que entre processos diferentes?',
  o: ['Não muda o espaço de endereçamento', 'As tarefas não têm registos para guardar', 'O núcleo não participa na comutação', 'As tarefas partilham a mesma pilha'], a: 0,
  e: 'As tarefas partilham a memória: não é preciso mudar a tabela de páginas nem invalidar a TLB. Os registos e a pilha de cada uma continuam a ter de ser trocados.' },
{ id: 'pr-19', t: 'proc', l: 2, les: 'p-fork',
  q: 'Depois de um fork, o filho muda o valor de uma variável global. O pai vê essa mudança?',
  o: ['Não: cada um tem a sua cópia', 'Sim, as globais são partilhadas', 'Só se o pai fizer wait antes', 'Só se a variável for static'], a: 0,
  e: 'Depois do fork os dois espaços de endereçamento são **independentes** (com copy-on-write). Para comunicar precisam de pipes, ficheiros, signals ou memória partilhada.' },
{ id: 'pr-43', t: 'proc', l: 2, les: 'p-thrbugs',
  q: 'Três tarefas fazem `a++` sobre uma global a (que começa em 0), sem trinco, e todas terminam. Que valores pode ter a no fim?',
  o: ['1, 2 ou 3', 'Sempre 3', '3 ou mais', 'Só 1 ou 3'], a: 0,
  e: '`a++` é ler, somar, escrever. Se duas tarefas lerem o mesmo valor, um incremento perde-se. No pior caso as três leem 0 e a fica em **1**.' },

/* --- nível 3: prever o output --- */
{ id: 'pr-20', t: 'proc', l: 3, les: 'p-trace', ex: 'out',
  code: `// o stdout é o terminal
int main() {
  printf("A");
  fork();
  printf("B\\n");
  return 0;
}`,
  q: 'Que linhas aparecem no terminal com o programa abaixo (por qualquer ordem)?',
  o: ['AB e AB', 'AB e B', 'A, B e B', 'B e AB'], a: 0,
  e: 'O "A" ainda está no **buffer** do printf (sem \\n nem fflush) quando se faz o fork: o filho recebe uma cópia do buffer. Cada processo imprime então AB: **AB e AB**.' },
{ id: 'pr-30', t: 'proc', l: 3, les: 'p-trace', ex: 'out',
  code: `int main() {
  if (fork() == 0) { printf("1"); fflush(stdout); exit(0); }
  wait(NULL);
  printf("2"); fflush(stdout);
  if (fork() == 0) { printf("3"); fflush(stdout); }
  else { wait(NULL); printf("4"); fflush(stdout); }
  printf("5"); fflush(stdout);
  return 0;
}`,
  q: 'Que output produz o programa abaixo?',
  o: ['123545', '12345', '123455', '124535'], a: 0,
  e: 'O 1.º filho imprime 1 e sai; o pai espera e imprime 2. O 2.º filho imprime 3 e **continua** até ao fim: imprime 5. O pai só depois do wait imprime 4 e 5. **123545**.',
  w: { 1: 'O 2.º filho não faz exit: depois do 3 também chega ao printf("5").' } },
{ id: 'pr-37', t: 'proc', l: 3, les: 'p-exec', ex: 'out',
  code: `int main() {
  int i = 3, s;
  if (fork() == 0) {
    i++;
    execl("/nao/existe", "x", NULL);
    printf("F:%d\\n", i);
    exit(1);
  }
  wait(&s);
  printf("P:%d %d\\n", i, WEXITSTATUS(s));
}`,
  q: 'O ficheiro /nao/existe não existe. Que output produz o programa abaixo?',
  o: ['F:4 e depois P:3 1', 'P:3 1 e depois F:4', 'F:4 e depois P:4 1', 'Só P:3 0'], a: 0,
  e: 'A exec **falha** e o filho continua: imprime F:4 e sai com 1. O pai tem a sua cópia de i (3) e, depois do wait, imprime **P:3 1**.' },
{ id: 'pr-38', t: 'proc', l: 3, les: 'p-thrbugs',
  code: `void *f(void *arg) {
  int *i = (int *) arg;
  printf("T:%d\\n", *i);
  return NULL;
}
int main(void) {
  pthread_t tid[3];
  for (int i = 0; i < 3; i++)
    pthread_create(&tid[i], 0, f, &i);
  for (int k = 0; k < 3; k++) pthread_join(tid[k], NULL);
}`,
  q: 'O programa abaixo pode imprimir T:2 três vezes. Porquê?',
  o: ['Todas recebem o endereço do mesmo i', 'O printf das tarefas não é seguro', 'pthread_create copia i quando a tarefa acaba', 'As tarefas correm sempre depois do ciclo'], a: 0,
  e: 'As três recebem **&i**, o mesmo endereço. Cada uma lê o valor que lá estiver quando chega ao printf. Se todas lerem quando i já é 2, imprimem 2, 2, 2. Correção: um argumento próprio por tarefa.' },
{ id: 'pr-42', t: 'proc', l: 3, les: 'p-thrbugs', ex: 'out',
  code: `int g = 10;
void *f(void *a) { g = g + 5; return &g; }
int main(void) {
  pthread_t t; void *ret;
  pthread_create(&t, NULL, f, NULL);
  pthread_join(t, &ret);
  g = 0;
  printf("%d\\n", *(int *) ret);
}`,
  q: 'Que output produz o programa abaixo?',
  o: ['0', '15', '10', 'Indefinido: g já não existe'], a: 0,
  e: 'A tarefa devolve o endereço de uma **global**, que continua válida. ret aponta para g; quando se imprime, g já foi posto a **0**. (Indefinido seria devolver o endereço de uma local da tarefa.)' },
{ id: 'pr-51', t: 'proc', l: 3, les: 'p-wait', ch: 'seqexec', step: '1/5', code: PR_SEQ_CODE, src: 'Exame 2022/23, 2.ª época',
  q: PR_SEQ_Q + 'O que vai na caixa [1]?',
  o: ['argv[i];', 'argc[i];', 'argv[i+1];', 'argv[0];'], a: 0,
  e: 'O ciclo começa em i = 1 (argv[0] é o próprio programa) e cada iteração trata o programa **argv[i]**.' },
{ id: 'pr-52', t: 'proc', l: 3, les: 'p-wait', ch: 'seqexec', step: '2/5', code: PR_SEQ_CODE, src: 'Exame 2022/23, 2.ª época',
  q: PR_SEQ_Q + 'O que vai na caixa [2]?',
  o: ['fork();', 'fork(path);', 'wait(NULL);', 'execl(path, path, 0);'], a: 0,
  e: 'Cada programa corre num processo diferente: **fork()** (sem argumentos). A seguir testa-se p == 0 para saber se é o filho.' },
{ id: 'pr-53', t: 'proc', l: 3, les: 'p-wait', ch: 'seqexec', step: '3/5', code: PR_SEQ_CODE, src: 'Exame 2022/23, 2.ª época',
  q: PR_SEQ_Q + 'O que vai na caixa [3], dentro do filho?',
  o: ['execl(path, path, 0);', 'execl(path);', 'execv(path);', 'execl(argv[0], path, 0);'], a: 0,
  e: 'O filho troca de programa com **execl(path, path, 0)**: caminho, argv[0] do novo programa e o 0 (NULL) que fecha a lista.' },
{ id: 'pr-54', t: 'proc', l: 3, les: 'p-wait', ch: 'seqexec', step: '4/5', code: PR_SEQ_CODE, src: 'Exame 2022/23, 2.ª época',
  q: PR_SEQ_Q + 'O que vai na caixa [4], no pai?',
  o: ['wait(&status);', 'wait(NULL);', 'fork();', 'WIFEXITED(status);'], a: 0,
  e: 'O pai espera que este programa acabe antes de lançar o seguinte (um de cada vez), e precisa do estado para o teste a seguir: **wait(&status)**. Com wait(NULL) perdia-se o estado.' },
{ id: 'pr-55', t: 'proc', l: 3, les: 'p-wait', ch: 'seqexec', step: '5/5', code: PR_SEQ_CODE, src: 'Exame 2022/23, 2.ª época',
  q: PR_SEQ_Q + 'O que vai na caixa [5], a condição para parar?',
  o: ['WIFSIGNALED(status)', 'WIFEXITED(status)', 'WIFSIGNALED(p)', 'WEXITSTATUS(status) != 0'], a: 0,
  e: '**WIFSIGNALED(status)** é verdade se o filho terminou por um signal não tratado. WIFEXITED seria o contrário (terminou normalmente), e p é o PID, não o estado.' },

/* --- nível 4: perguntas de exame --- */
{ id: 'pr-31', t: 'proc', l: 4, les: 'p-trace', ex: 'out', src: 'Exame 2024/25, 2.ª época',
  code: `int main() {
  pid_t pid;
  if (pid = fork()) {
    wait(NULL);
    printf("A\\n");
    if (pid = fork()) {
      wait(NULL);
      printf("B\\n");
    } else printf("C\\n");
  } else printf("D\\n");
}`,
  q: 'Qual é o output do programa abaixo (lido de cima para baixo, sem as mudanças de linha)?',
  o: ['DACB', 'ADCB', 'DABC', 'DCAB'], a: 0,
  e: 'O 1.º filho imprime D; o pai espera por ele e imprime A; o 2.º filho imprime C; o pai espera por ele e imprime B. Os wait fixam a ordem: **DACB**.' },
{ id: 'pr-32', t: 'proc', l: 4, les: 'p-exec', ex: 'out', src: 'Exame 2024/25, 2.ª época',
  code: `int main(int argc, char **argv) {
  int pid, i, status;
  i = 1;
  if (argc < 2) return 1;
  pid = fork();
  if (pid > 0) {
    wait(NULL);
    i = i * 10;
    printf("AA:%d\\n", i);
    char *path = argv[1];
    status = execl(path, path, 0);
    i = i / 2;
    printf("%d:%d\\n", i, status);
  } else if (pid == 0) {
    i = i * 5;
    printf("BB:%d\\n", i);
  }
}`,
  q: 'A exec é bem sucedida e o programa que ela lança não escreve nada. Qual é o output (sem as mudanças de linha)?',
  o: ['BB:5 AA:10', 'AA:10 BB:5', 'BB:5 AA:10 5:-1', 'AA:10 5:0'], a: 0,
  e: 'O filho imprime BB:5 e termina. O pai espera, imprime AA:10 e faz exec com sucesso: o resto do código **nunca corre**. **BB:5 AA:10**.' },
{ id: 'pr-33', t: 'proc', l: 4, les: 'p-exec', ex: 'out', src: 'Exame 2023/24, 1.ª época',
  code: `int main(int argc, char **argv) {
  int pid, i;
  i = 1;
  if (argc < 2) return 1;
  pid = fork();
  if (pid == 0) {
    i = i * 10;
    printf("F1:%d\\n", i);
    char *path = argv[1];
    status = execl(path, path, 0);
    printf("F2:%d\\n", status);
  } else if (pid > 0) {
    i = i * 5;
    printf("P:%d\\n", i);
  }
}`,
  q: 'A exec é bem sucedida e o programa lançado não escreve nada. Qual destes outputs pode ser produzido?',
  o: ['P:5 seguido de F1:10', 'F1:10, P:5 e F2:0', 'F1:10 seguido de P:50', 'Nenhum dos outputs é possível'], a: 0,
  e: 'O filho imprime F1:10 e faz exec (o F2 nunca aparece). O pai imprime P:5 (a sua cópia de i é 1). Sem wait, a ordem pode ser qualquer: **P:5, F1:10** é possível.' },
{ id: 'pr-34', t: 'proc', l: 4, les: 'p-fork', ex: 'out', src: 'Exame 2022/23, 1.ª época',
  code: `int main(int argc, char **argv) {
  int pid, i;
  i = 0;
  i++;
  pid = fork();
  if (pid == 0) {
    i = i - 1;
    printf("F:%d\\n", i);
  } else if (pid > 0) {
    i = i + 1;
    printf("P:%d\\n", i);
  }
}`,
  q: 'Qual destes outputs pode ser produzido pelo programa abaixo?',
  o: ['F:0 seguido de P:2', 'F:0 seguido de P:1', 'F:1 seguido de P:0', 'Nenhum é possível'], a: 0,
  e: 'Antes do fork i = 1. O filho faz 1 − 1 = 0; o pai, na sua cópia, 1 + 1 = 2. **F:0 e P:2** (por qualquer ordem).' },
{ id: 'pr-35', t: 'proc', l: 4, les: 'p-wait', ex: 'out', src: 'Exame 2024/25, 1.ª época',
  code: `// corre num processo com PID 11; o filho criado tem PID 12
int main() {
  pid_t pid = 11;
  if (pid = fork()) {
    wait();
    printf("%d, %d\\n", pid, getpid());
  } else {
    printf("%d, %d\\n", pid, getppid());
    exit(0);
  }
}`,
  q: 'Qual é o output do programa abaixo?',
  o: ['0, 11 e depois 12, 11', '11, 11 e depois 11, 11', '12, 11 e depois 0, 11', '0, 12 e depois 12, 11'], a: 0,
  e: 'O filho (pid = 0) imprime 0 e o PID do pai (11). O pai espera por ele e imprime o PID do filho (12) e o seu (11): **0, 11 / 12, 11**.' },
{ id: 'pr-36', t: 'proc', l: 4, les: 'p-exec', src: 'Exame 2023/24, 2.ª época',
  code: `// chamado como: ./prog ./xpto a b c
int main(int argc, char **argv) {
  int p = 1;
  for (int i = 2; i < argc; i++) {
    if (p != 0) {
      exec(argv[1], argv[1], argv[i], NULL);
    }
    p = fork();
  }
  exit(EXIT_SUCCESS);
}`,
  q: 'O programa abaixo pretende correr ./xpto a, ./xpto b e ./xpto c, um de cada vez. Supondo que todas as exec funcionam, consegue-o?',
  o: ['Não: só corre "xpto a" e nada mais', 'Sim, corre xpto com a, b e c por ordem', 'Não: corre várias cópias de xpto por argumento', 'Não: a exec só pode vir depois de um fork'], a: 0,
  e: 'Na 1.ª volta p = 1, por isso é o **próprio processo** que faz exec de "xpto a". O programa foi substituído: o ciclo e os forks nunca acontecem.' },
{ id: 'pr-39', t: 'proc', l: 4, les: 'p-thrbugs', src: 'Exame 2023/24, 1.ª época',
  code: `void *threadFn(void *arg) {
  int *i = (int *) arg;
  printf("T:%d\\n", *i);
}
int main(void) {
  pthread_t tid[3];
  for (int i = 0; i < 3; i++)
    pthread_create(&tid[i], 0, threadFn, &i);
  ...
}`,
  q: 'Considera os outputs (a) T:2 T:2 T:2, (b) T:0 T:1 T:2 e (c) T:0 T:2 T:2. Quais podem ser produzidos pelo programa abaixo?',
  o: ['Os três', 'Só o (b)', 'O (b) e o (c)', 'Só o (a) e o (b)'], a: 0,
  e: 'Todas recebem **&i** e cada uma lê o valor que lá estiver quando chega ao printf (0, 1, 2…). Por isso **os três** outputs são possíveis.' },
{ id: 'pr-40', t: 'proc', l: 4, les: 'p-thrbugs', src: 'Exame 2023/24, 1.ª época',
  code: `struct MyStruct { int x; int y; };
void *threadFn(void *arg) {
  struct MyStruct r;
  r.x = 5; r.y = 5;
  return &r;
}
int main(void) {
  struct MyStruct *s; pthread_t tid;
  pthread_create(&tid, 0, threadFn, NULL);
  pthread_join(tid, &s);
  printf("Tarefa devolveu: %d, %d\\n", s->x, s->y);
}`,
  q: 'As chamadas a pthread_create e pthread_join funcionam. Que output produz o programa abaixo?',
  o: ['Não dá para prever o output', 'Tarefa devolveu: 5, 5', 'O programa não imprime nada de certeza', 'Nenhuma das anteriores'], a: 0,
  e: 'r é uma variável **local** da tarefa, na sua pilha. Depois de a tarefa terminar o endereço já não é válido: o comportamento é **indefinido**. Pode até sair 5, 5 por acaso, mas não é garantido.' },
{ id: 'pr-41', t: 'proc', l: 4, les: 'p-thrbugs', src: 'Exame 2024/25, 2.ª época',
  code: `typedef struct { int x; int y; } MyStruct;
void *threadFn(void *arg) {
  MyStruct *s = (MyStruct *) arg;
  printf("%d:%d\\n", s->x, s->y);
}
int main(void) {
  MyStruct s; pthread_t tid[3]; int a = 0;
  for (int i = 0; i < 3; i++) {
    s.x = ++a; s.y = a;
    pthread_create(&tid[i], 0, threadFn, &s);
  }
  for (int i = 0; i < 3; i++) pthread_join(tid[i], NULL);
}`,
  q: 'Considera os resultados (A) 1:1 2:2 3:3, (B) 2:2 3:3 3:3 e (C) 1:1 3:3 3:3. Quais podem ser produzidos pelos printf das tarefas?',
  o: ['Os três', 'Só o A', 'Só o A e o B', 'Só o A e o C'], a: 0,
  e: 'As três tarefas recebem o endereço da **mesma** struct, que o ciclo vai alterando. Cada tarefa lê o que lá estiver quando corre, por isso **os três** são possíveis.' },
{ id: 'pr-44', t: 'proc', l: 4, les: 'p-modes', src: 'Exame 2023/24, 2.ª época',
  q: 'Qual destas afirmações sobre o bit setuid de um executável em Unix é **falsa**?',
  o: ['Muda-se com a chamada setuid g+s ficheiro', 'Corre com os privilégios do dono do ficheiro', 'Mudar o bit não exige ser superutilizador', 'Altera o UID efetivo de quem o executa'], a: 0,
  e: 'O bit muda-se com o comando **chmod u+s** (g+s é o setgid). A chamada de sistema setuid() é outra coisa: muda o UID do processo.' },
{ id: 'pr-45', t: 'proc', l: 4, les: 'p-modes', src: 'Exame 2023/24, 1.ª época',
  q: 'Qual das seguintes afirmações é verdadeira sobre o bit setuid aplicado a um ficheiro executável em Unix?',
  o: ['Corre com os privilégios do dono do ficheiro', 'Dá leitura e escrita a todos os utilizadores', 'Restringe o ficheiro ao utilizador root', 'Corre sempre com os privilégios de root'], a: 0,
  e: 'O processo fica com o UID efetivo do **dono do ficheiro**. Só é root se o dono for root.' },
{ id: 'pr-46', t: 'proc', l: 4, les: 'p-modes', src: 'Exame 2024/25, 1.ª época',
  q: 'No Unix, qual das seguintes afirmações sobre o modo utilizador e o modo núcleo é verdadeira?',
  o: ['Uma chamada de sistema corre código do núcleo com parâmetros da aplicação', 'As instruções de I/O (como IN e OUT) podem ser usadas em modo utilizador', 'Uma aplicação não tem forma de fazer o processador passar a modo núcleo', 'Para traduzir um endereço virtual em físico é preciso estar em modo núcleo'], a: 0,
  e: 'A chamada de sistema é a porta: a aplicação passa parâmetros e o núcleo corre o seu código. I/O é privilegiado, as traps passam a modo núcleo e a tradução é feita pela MMU em qualquer modo.' },
{ id: 'pr-47', t: 'proc', l: 4, les: 'p-thr', src: 'Exame 2024/25, 2.ª época',
  q: 'Qual das seguintes afirmações sobre processos e tarefas é verdadeira?',
  o: ['pthread_join espera pela terminação de uma tarefa específica', 'Comutar entre tarefas do mesmo processo é mais caro do que entre processos', 'Depois do fork, pai e filho comunicam por qualquer variável global', 'Depois do fork, o filho recebe como retorno o PID do pai'], a: 0,
  e: 'pthread_join recebe o identificador da tarefa por que se espera. Comutar tarefas é mais barato, as globais deixam de ser partilhadas depois do fork e o filho recebe 0.' },
{ id: 'pr-48', t: 'proc', l: 4, les: 'p-exec', src: 'Exame 2022/23, 1.ª época',
  q: 'Qual das seguintes afirmações sobre a exec é **falsa**?',
  o: ['A tabela de ficheiros abertos é limpa se a exec funcionar', 'O código a seguir à exec só corre se ela falhar', 'A área de dados e a pilha são libertadas se a exec funcionar', 'Todas as anteriores são verdadeiras'], a: 0,
  e: 'Os ficheiros abertos **continuam abertos** depois da exec (a não ser que tenham FD_CLOEXEC). É isso que permite redirecionar o stdout antes de lançar outro programa.' },
{ id: 'pr-49', t: 'proc', l: 4, les: 'p-wait', src: 'Exame 2022/23, 1.ª época',
  code: `pid = fork();
if (pid == 0) {
  ...
  exit(0);
} else {
  ...
  pid = wait(&estado);
}`,
  q: 'Sobre o wait do código abaixo, qual das seguintes afirmações é verdadeira?',
  o: ['Bloqueia até um filho terminar; se já houver um zombie, regressa logo com o PID e o estado', 'Bloqueia até um filho terminar e só então desbloqueia; é preciso cuidado se o filho já terminou', 'Bloqueia; se todos os filhos já tiverem terminado, o wait devolve −1', 'Bloqueia até um filho terminar com o estado indicado no parâmetro'], a: 0,
  e: 'Se o filho já terminou, é um zombie à espera: o wait recolhe-o logo. Só devolve −1 se não houver filhos nenhuns (nem zombies). O parâmetro é onde se **recebe** o estado.' },
{ id: 'pr-50', t: 'proc', l: 4, les: 'p-wait', src: 'Exame 2022/23, 1.ª época',
  q: 'Quando um processo chama exit(), qual das seguintes afirmações é verdadeira?',
  o: ['Liberta memória e fecha ficheiros, mas mantém a task_struct (zombie)', 'Elimina as regiões de memória e a task_struct do processo', 'Elimina memória e task_struct e fecha os ficheiros, apagando os sem links', 'Elimina memória e task_struct, fecha ficheiros e faz unlink dos a apagar'], a: 0,
  e: 'A task_struct fica até o pai fazer wait (**zombie**). Ao fechar os ficheiros, um ficheiro sem hard links e sem mais ninguém a usá-lo é apagado nesse momento.' },
]);
