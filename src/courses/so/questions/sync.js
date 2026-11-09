/* ===== SO questions: semaphores and condition variables (Grupo 4) ===== */
const SY_PC_SEM = `pthread_mutex_t semExMut = PTHREAD_MUTEX_INITIALIZER;
sem_init(&MsgparaLer, 0, 0);
sem_init(&bufferCheio, 0, N);

void EscreveMsg(t_msg Msg) {
  sem_wait(&bufferCheio);
  pthread_mutex_lock(&semExMut);
  buffer[indiceEscrita] = Msg;
  indiceEscrita = (indiceEscrita + 1) % N;
  pthread_mutex_unlock(&semExMut);
  sem_post(&MsgparaLer);
}
void LeMsg(t_msg *Msg) {
  sem_wait(&MsgparaLer);
  pthread_mutex_lock(&semExMut);
  *Msg = buffer[indiceLeitura];
  indiceLeitura = (indiceLeitura + 1) % N;
  pthread_mutex_unlock(&semExMut);
  sem_post(&bufferCheio);
}`;
const SY_PC_ITEM = `int buf[N];                       // posições vazias têm -1
int prodptr = 0, consptr = 0;
trinco_t trinco;
semaforo_t pode_prod = criar_semaforo(N), pode_cons = criar_semaforo(0);

void colocarItem(int item) {        int obterItem() {
  esperar(pode_prod);                 int item;
  fechar(trinco);                     esperar(pode_cons);
  buf[prodptr] = item;                fechar(trinco);
  prodptr = (prodptr + 1) % N;        item = buf[consptr]; buf[consptr] = -1;
  abrir(trinco);                      consptr = (consptr + 1) % N;
  assinalar(pode_cons);               abrir(trinco);
}                                     assinalar(pode_prod);
                                      return item;
                                    }`;

STUDY.questions('so', [
/* --- nível 1 --- */
{ id: 'sy-01', t: 'sync', l: 1, les: 's-sem',
  q: 'Uma tarefa faz sem_wait (esperar) num semáforo cujo valor é 0. O que acontece?',
  o: ['Bloqueia a tarefa', 'Decrementa para −1 e segue', 'Devolve um erro e segue', 'Não faz nada'], a: 0,
  e: 'Com o contador a 0 não há "unidades" para tirar: a tarefa **bloqueia** na fila do semáforo até alguém fazer sem_post.' },
{ id: 'sy-02', t: 'sync', l: 1, les: 's-sem',
  q: 'A operação assinalar (sem_post) de um semáforo pode bloquear a tarefa que a chama?',
  o: ['Nunca', 'Sim, se o valor for 0', 'Sim, se ninguém estiver à espera', 'Só se o semáforo começou a 1'], a: 0,
  e: 'Assinalar acorda uma tarefa bloqueada ou incrementa o contador. Em nenhum caso bloqueia.' },
{ id: 'sy-03', t: 'sync', l: 1, les: 's-sem',
  q: 'Um semáforo controla o acesso a N impressoras iguais. Com que valor deve começar?',
  o: ['N', '0', '1', 'N − 1'], a: 0,
  e: 'Para recursos iguais, o valor inicial é o número de recursos **livres**: N. Cada uso faz esperar (−1) e cada devolução faz assinalar (+1).' },
{ id: 'sy-04', t: 'sync', l: 1, les: 's-sem',
  q: 'Para que serve, tipicamente, um semáforo que começa com o valor 0?',
  o: ['Esperar por um evento de outra tarefa', 'Garantir exclusão mútua numa secção crítica', 'Contar N recursos livres', 'Impedir qualquer tarefa de avançar para sempre'], a: 0,
  e: 'Começa "fechado": quem espera bloqueia até a outra tarefa **assinalar** que o evento aconteceu. Para exclusão mútua começa a 1; para N recursos, a N.' },
{ id: 'sy-05', t: 'sync', l: 1, les: 's-cv',
  q: 'Uma tarefa faz pthread_cond_signal numa variável de condição onde nenhuma tarefa está à espera. O que acontece a esse signal?',
  o: ['Perde-se', 'Fica guardado para o próximo wait', 'Bloqueia quem o fez', 'Acorda a tarefa do último lock'], a: 0,
  e: 'As variáveis de condição **não têm memória**. Por isso o estado verdadeiro tem de estar numa variável normal (um contador), testada no while.' },
{ id: 'sy-06', t: 'sync', l: 1, les: 's-cv',
  q: 'O que faz `pthread_cond_wait(&c, &m)` ao trinco m?',
  o: ['Larga-o ao dormir e retoma-o ao acordar', 'Mantém-no fechado enquanto a tarefa dorme', 'Larga-o e não o volta a fechar', 'Não mexe nele: são independentes'], a: 0,
  e: 'Larga o trinco e bloqueia **atomicamente**; ao acordar, só regressa depois de voltar a ter o trinco. Se o mantivesse fechado, ninguém conseguiria mudar a condição.' },
{ id: 'sy-07', t: 'sync', l: 1, les: 's-cv',
  q: 'Porque se escreve `while (cond) pthread_cond_wait(…)` e não `if (cond) pthread_cond_wait(…)`?',
  o: ['Ao acordar, a condição pode já ser falsa', 'O if não compila com variáveis de condição', 'O while evita que a tarefa bloqueie', 'O while acorda as outras tarefas que esperam'], a: 0,
  e: 'Entre o signal e a tarefa voltar a ter o trinco, outra pode ter "roubado" o que ela queria (ou pode ser um spurious wake-up). Por isso volta a testar.' },
{ id: 'sy-08', t: 'sync', l: 1, les: 's-cv',
  q: 'Quando se deve usar pthread_cond_broadcast em vez de pthread_cond_signal?',
  o: ['Quando várias podem avançar com a mudança', 'Quando só uma tarefa está à espera na condição', 'Sempre que se muda um contador', 'Quando o signal é feito fora do trinco'], a: 0,
  e: 'broadcast acorda **todas** as que esperam. É preciso quando a mudança serve a várias (chegaram 3 unidades para vários mineiros) ou quando há tarefas de tipos diferentes na mesma condição.' },

/* --- nível 2 --- */
{ id: 'sy-10', t: 'sync', l: 2, les: 's-pc',
  q: 'Num produtor-consumidor com semáforos, um produtor faz `lock(m)` e só depois `sem_wait(&livres)`. O buffer está cheio. O que acontece?',
  o: ['Dorme com o trinco: ninguém consome', 'Escreve por cima de uma mensagem por ler', 'Funciona, só que mais devagar', 'Os consumidores leem posições vazias'], a: 0,
  e: 'O produtor bloqueia no semáforo **com o trinco fechado**. Os consumidores ficam presos no lock e nunca libertam espaço: **interblocagem**.' },
{ id: 'sy-11', t: 'sync', l: 2, les: 's-pc',
  q: 'Num produtor-consumidor com semáforos, um consumidor faz `sem_post(&livres)` antes de `unlock(m)`, em vez de depois. O que muda?',
  o: ['Nada de grave: só menos eficiente', 'Pode haver interblocagem', 'Escrevem-se mensagens sem espaço livre', 'Os produtores ficam em míngua'], a: 0,
  e: 'O sem_post não bloqueia, por isso não há risco. Só que o produtor acordado ainda vai esperar pelo trinco: um pouco **menos eficiente**.' },
{ id: 'sy-12', t: 'sync', l: 2, les: 's-pc',
  q: 'Um buffer circular com semáforos tem exatamente um produtor e um consumidor. Pode-se tirar o trinco?',
  o: ['Sim: os semáforos já os separam', 'Não: leriam mensagens a meio', 'Não: haveria interblocagem', 'Só se o buffer tiver uma única posição'], a: 0,
  e: 'O produtor só mexe em indiceEscrita e o consumidor só em indiceLeitura, e os semáforos impedem que mexam na mesma posição. Com **vários** produtores ou consumidores, o trinco já é preciso.' },
{ id: 'sy-13', t: 'sync', l: 2, les: 's-pc',
  q: 'Num buffer circular com semáforos e vários produtores e consumidores, usa-se um trinco só para os produtores e outro só para os consumidores. Qual é o efeito?',
  o: ['Mais paralelismo, e continua correto', 'Interblocagem entre os dois lados', 'Lê-se uma mensagem a meio da escrita', 'Obriga a trocar semáforos por condições'], a: 0,
  e: 'Produtores e consumidores usam índices diferentes e os semáforos garantem que nunca mexem na mesma posição ao mesmo tempo: podem trabalhar **em paralelo**.' },
{ id: 'sy-14', t: 'sync', l: 2, les: 's-pc',
  q: 'Num buffer com semáforos, o semáforo das mensagens por ler começa, por engano, com N em vez de 0. O que pode acontecer?',
  o: ['Consumidores leem posições vazias', 'Os produtores ficam todos bloqueados', 'Há interblocagem logo no início', 'Nada: os semáforos corrigem sozinhos'], a: 0,
  e: 'Os consumidores pensam que já há N mensagens e leem posições que ninguém escreveu.' },
{ id: 'sy-15', t: 'sync', l: 2, les: 's-sem',
  q: 'Um semáforo iniciado a 1 pode ser usado em vez de um mutex?',
  o: ['Sim, mas costuma ser menos eficiente', 'Não: um semáforo só serve para contar eventos', 'Sim, e é sempre mais eficiente', 'Só se for iniciado a 0'], a: 0,
  e: 'esperar = lock e assinalar = unlock dão a mesma semântica. O mutex é uma primitiva mais leve e pensada para isto.' },
{ id: 'sy-16', t: 'sync', l: 2, les: 's-sem',
  q: 'Um semáforo começa a 0. Fazem-se três sem_post sem ninguém à espera. Depois, quatro tarefas fazem sem_wait. Quantas passam sem bloquear?',
  o: ['3', '4', '1', '0'], a: 0,
  e: 'O semáforo **tem memória**: o contador ficou em 3. Passam 3 e a 4.ª bloqueia. (Com uma variável de condição os três signals ter-se-iam perdido.)' },
{ id: 'sy-17', t: 'sync', l: 2, les: 's-pccv',
  q: 'No produtor-consumidor com variáveis de condição, depois de inserir um item e fazer count++, o produtor deve assinalar…',
  o: ['A condição dos consumidores', 'A condição dos produtores', 'As duas condições, com broadcast', 'Nenhuma: o unlock acorda quem espera'], a: 0,
  e: 'Quem pode ter ficado à espera de um item são os **consumidores** (while count == 0). O produtor avisa-os.' },
{ id: 'sy-18', t: 'sync', l: 2, les: 's-rw',
  q: 'Na solução de leitores-escritores das aulas, um leitor novo espera se houver escritores à espera, mesmo que estejam outros leitores a ler. Porquê?',
  o: ['Para os escritores não ficarem em míngua', 'Porque dois leitores não podem ler juntos', 'Porque o trinco só aceita uma tarefa', 'Para evitar interblocagem entre leitores'], a: 0,
  e: 'Se os leitores continuassem a entrar enquanto há leitura, um escritor podia esperar para sempre.' },
{ id: 'sy-19', t: 'sync', l: 2, les: 's-rw',
  q: 'Na solução de leitores-escritores com semáforos, porque se larga o trinco antes de `sem_wait(&leitores)`?',
  o: ['Senão quem o acordaria nunca entra', 'Para o sem_wait ser mais rápido', 'Porque sem_wait já fecha o trinco', 'Para dar prioridade aos escritores'], a: 0,
  e: 'Quem acorda leitores (o escritor a sair) precisa do trinco para atualizar os contadores. Se o leitor dormisse com ele: **interblocagem**.' },
]);

/* --- nível 3: preencher as caixas (cada passo traz o código completo) --- */
const SY_BARB = `#define NCADEIRAS 5
sem_t *SemaforoClientes, *SemaforoBarbeiro;
pthread_mutex_t mutex;
int waiting = 0;               // clientes sentados à espera

void threadBarbeiro() {
  while (1) {
    [1]
    [2]
    waiting--;
    [3]
    pthread_mutex_unlock(&mutex);
    // CortaCabelo();
  }
}
void threadCliente() {
  [4]
  if (waiting < NCADEIRAS) {
    waiting++;
    [5]
    [6]
    sem_wait(SemaforoBarbeiro);
    // RecebeCorte();
  } else {
    pthread_mutex_unlock(&mutex);  // cheio: volta mais tarde
  }
}
int main() {
  sem_init(SemaforoClientes, 0, 0);
  [7]
  pthread_mutex_init(&mutex, NULL);
}`;
const SY_BARB_Q = 'Problema do barbeiro: um barbeiro corta o cabelo a um cliente de cada vez e há 5 cadeiras de espera. ';
const SY_PCCV = `int buf[N], prodptr = 0, consptr = 0, count = 0;
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t podeProd = PTHREAD_COND_INITIALIZER;
pthread_cond_t podeCons = PTHREAD_COND_INITIALIZER;

produtor() {
  while (TRUE) {
    int item = produz();
    [1]
    while ([2]) [3]
    buf[prodptr] = item;
    prodptr = (prodptr + 1) % N;
    count++;
    [4]
    pthread_mutex_unlock(&mutex);
  }
}
consumidor() {
  while (TRUE) {
    int item;
    pthread_mutex_lock(&mutex);
    while ([5]) [6]
    item = buf[consptr];
    consptr = (consptr + 1) % N;
    count--;
    [7]
    pthread_mutex_unlock(&mutex);
  }
}`;
const SY_PCCV_Q = 'Produtor-consumidor com variáveis de condição, buffer de N posições. ';
const SY_PUB = `int posts = 0;
pthread_mutex_t m; pthread_cond_t c;

void subscriber() {
  int read_posts = 0;
  while (1) {
    [1]
    [2] (read_posts == posts)
      [3]
    [4]
    obtain_post(read_posts);
    read_posts++;
  }
}
void publisher(char message[]) {
  [5]
  posts++;
  append_post(posts, message);
  [6]
  [7]
}`;
const SY_PUB_Q = 'Publishers publicam notícias; vários subscribers esperam, sem espera ativa, até haver notícias que ainda não leram. O armazenamento de notícias nunca enche. ';

STUDY.questions('so', [
{ id: 'sy-b1', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '1/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [1], no início do ciclo do barbeiro?',
  o: ['sem_wait(SemaforoClientes);', 'sem_post(SemaforoClientes);', 'sem_wait(SemaforoBarbeiro);', 'pthread_mutex_lock(&mutex);'], a: 0,
  e: 'O barbeiro **dorme até haver um cliente**: espera no semáforo dos clientes (cada cliente que se senta faz sem_post nele). Esperar no semáforo vem antes de fechar o trinco.' },
{ id: 'sy-b2', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '2/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [2], antes de `waiting--`?',
  o: ['pthread_mutex_lock(&mutex);', 'pthread_mutex_unlock(&mutex);', 'sem_post(SemaforoBarbeiro);', 'sem_wait(SemaforoClientes);'], a: 0,
  e: '`waiting` é partilhado com os clientes: fecha-se o trinco antes de lhe mexer (e o unlock já está mais abaixo).' },
{ id: 'sy-b3', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '3/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [3], depois de `waiting--`?',
  o: ['sem_post(SemaforoBarbeiro);', 'sem_wait(SemaforoBarbeiro);', 'sem_post(SemaforoClientes);', 'pthread_mutex_lock(&mutex);'], a: 0,
  e: 'O barbeiro chama o cliente: o cliente está bloqueado em `sem_wait(SemaforoBarbeiro)`, por isso o barbeiro faz **sem_post** nesse semáforo.' },
{ id: 'sy-b4', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '4/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [4], no início de threadCliente?',
  o: ['pthread_mutex_lock(&mutex);', 'sem_wait(SemaforoBarbeiro);', 'sem_post(SemaforoClientes);', 'pthread_mutex_unlock(&mutex);'], a: 0,
  e: 'O cliente vai ler `waiting` para ver se há cadeira: trinco fechado. Repara que os dois ramos do if fazem unlock.' },
{ id: 'sy-b5', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '5/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [5], depois de `waiting++`?',
  o: ['sem_post(SemaforoClientes);', 'sem_wait(SemaforoClientes);', 'sem_post(SemaforoBarbeiro);', 'pthread_mutex_unlock(&mutex);'], a: 0,
  e: 'O cliente sentou-se: avisa o barbeiro, que pode estar a dormir em `sem_wait(SemaforoClientes)`.' },
{ id: 'sy-b6', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '6/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [6], logo antes de `sem_wait(SemaforoBarbeiro)`?',
  o: ['pthread_mutex_unlock(&mutex);', 'pthread_mutex_trylock(&mutex);', 'sem_post(SemaforoBarbeiro);', 'sem_wait(SemaforoClientes);'], a: 0,
  e: 'O cliente vai bloquear à espera do barbeiro: tem de **largar o trinco antes**, senão o barbeiro nunca consegue fazer waiting-- (interblocagem).' },
{ id: 'sy-b7', t: 'sync', l: 3, les: 's-boxes', ch: 'barbeiro', step: '7/7', code: SY_BARB, src: 'Exame 2024/25, 2.ª época',
  q: SY_BARB_Q + 'O que vai na caixa [7], a inicialização do semáforo do barbeiro?',
  o: ['sem_init(SemaforoBarbeiro, 0, 0);', 'sem_init(SemaforoBarbeiro, 0, 1);', 'sem_init(SemaforoBarbeiro, 0, 5);', 'sem_post(SemaforoBarbeiro);'], a: 0,
  e: 'É um semáforo de **evento** ("o barbeiro está pronto para ti"): começa a 0, para o cliente bloquear até o barbeiro assinalar.' },

{ id: 'sy-p1', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '1/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'O que vai na caixa [1] do produtor?',
  o: ['pthread_mutex_lock(&mutex);', 'pthread_mutex_unlock(&mutex);', 'pthread_cond_signal(&podeCons);', 'pthread_cond_wait(&podeProd, &mutex);'], a: 0,
  e: 'Vai testar `count` e mexer no buffer: primeiro fecha o trinco. O unlock correspondente está no fim.' },
{ id: 'sy-p2', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '2/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'Que condição vai na caixa [2], no while do produtor?',
  o: ['count == N', 'count == 0', 'count != 0', 'count > N'], a: 0,
  e: 'O produtor não pode avançar enquanto o buffer estiver **cheio**: `count == N`.' },
{ id: 'sy-p3', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '3/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'O que vai na caixa [3], o corpo do while do produtor?',
  o: ['pthread_cond_wait(&podeProd, &mutex);', 'pthread_cond_wait(&podeCons, &mutex);', 'pthread_cond_signal(&podeCons);', 'pthread_mutex_unlock(&mutex);'], a: 0,
  e: 'O produtor dorme na **sua** condição (podeProd), largando o trinco. Será acordado por um consumidor que libertou espaço.' },
{ id: 'sy-p4', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '4/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'O que vai na caixa [4], depois de `count++`?',
  o: ['pthread_cond_signal(&podeCons);', 'pthread_cond_signal(&podeProd);', 'pthread_cond_wait(&podeCons, &mutex);', 'pthread_mutex_lock(&mutex);'], a: 0,
  e: 'Há mais um item: acorda um **consumidor** que possa estar à espera em podeCons.' },
{ id: 'sy-p5', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '5/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'Que condição vai na caixa [5], no while do consumidor?',
  o: ['count == 0', 'count == N', 'count != 0', 'count > N'], a: 0,
  e: 'O consumidor espera enquanto o buffer estiver **vazio**: `count == 0`.' },
{ id: 'sy-p6', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '6/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'O que vai na caixa [6], o corpo do while do consumidor?',
  o: ['pthread_cond_wait(&podeCons, &mutex);', 'pthread_cond_wait(&podeProd, &mutex);', 'pthread_cond_signal(&podeProd);', 'pthread_mutex_lock(&mutex);'], a: 0,
  e: 'O consumidor dorme em **podeCons**, onde o produtor faz signal depois de inserir.' },
{ id: 'sy-p7', t: 'sync', l: 3, les: 's-pccv', ch: 'pccv', step: '7/7', code: SY_PCCV, src: 'Exame 2024/25, 2.ª época',
  q: SY_PCCV_Q + 'O que vai na caixa [7], depois de `count--`?',
  o: ['pthread_cond_signal(&podeProd);', 'pthread_cond_signal(&podeCons);', 'pthread_cond_wait(&podeProd, &mutex);', 'pthread_mutex_unlock(&mutex);'], a: 0,
  e: 'Há mais um lugar livre: acorda um **produtor** que possa estar à espera em podeProd. (O unlock já está na linha seguinte.)' },

{ id: 'sy-s1', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '1/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [1] do subscriber?',
  o: ['pthread_mutex_lock(&m);', 'pthread_mutex_unlock(&m);', 'pthread_cond_wait(&c, &m);', 'pthread_cond_broadcast(&c);'], a: 0,
  e: 'O subscriber vai ler `posts`, partilhado com os publishers: fecha o trinco antes de testar.' },
{ id: 'sy-s2', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '2/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [2], antes de `(read_posts == posts)`?',
  o: ['while', 'if', 'pthread_cond_wait(&c, &m);', 'nada'], a: 0,
  e: 'Esperar numa condição faz-se sempre com **while**: ao acordar, volta a testar se há mesmo notícias novas.' },
{ id: 'sy-s3', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '3/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [3], o corpo do while?',
  o: ['pthread_cond_wait(&c, &m);', 'pthread_cond_wait(&c);', 'pthread_cond_wait(&m);', 'pthread_cond_broadcast(&c);'], a: 0,
  e: 'pthread_cond_wait recebe **a condição e o trinco**, para largar o trinco enquanto dorme. Fazer unlock em ciclo seria espera ativa (e unlocks a mais).' },
{ id: 'sy-s4', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '4/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [4], depois do while?',
  o: ['pthread_mutex_unlock(&m);', 'pthread_mutex_lock(&m);', 'pthread_cond_signal(&c);', 'pthread_cond_wait(&c, &m);'], a: 0,
  e: 'Já sabe que há notícia nova: larga o trinco. Ler a notícia do armazenamento não mexe em `posts`.' },
{ id: 'sy-s5', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '5/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [5] do publisher?',
  o: ['pthread_mutex_lock(&m);', 'pthread_cond_wait(&c, &m);', 'pthread_cond_broadcast(&c);', 'nada'], a: 0,
  e: 'O publisher vai alterar `posts`: fecha o trinco. Não precisa de esperar por nada (o armazenamento nunca enche).' },
{ id: 'sy-s6', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '6/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [6], depois de guardar a notícia?',
  o: ['pthread_cond_broadcast(&c);', 'pthread_cond_signal(&c);', 'pthread_cond_wait(&c, &m);', 'pthread_cond_init(&c, NULL);'], a: 0,
  e: 'Uma notícia nova interessa a **todos** os subscribers (cada um lê todas): **broadcast**. Com signal só um acordava e os outros ficavam à espera.' },
{ id: 'sy-s7', t: 'sync', l: 3, les: 's-cv', ch: 'pubsub', step: '7/7', code: SY_PUB, src: 'Exame 2022/23, 1.ª época',
  q: SY_PUB_Q + 'O que vai na caixa [7], no fim do publisher?',
  o: ['pthread_mutex_unlock(&m);', 'pthread_cond_broadcast(&c);', 'pthread_mutex_lock(&m);', 'nada'], a: 0,
  e: 'Fecha o par lock/unlock aberto na caixa [5].' },
]);

const SY_RW = `int nleitores = 0, leitores_espera = 0, escritores_espera = 0;
bool em_escrita = FALSE;
pthread_mutex_t secCritica;
sem_t leitores, escritores;          // os dois começam a 0

iniciar_leitura() {
  [1]
  if (em_escrita || escritores_espera > 0) {
    leitores_espera++;
    [2]
    sem_wait([3]);
    [4]
    if (leitores_espera > 0) {       // acorda o leitor seguinte
      nleitores++;
      leitores_espera--;
      [5]
    }
  } else
    nleitores++;
  pthread_mutex_unlock(&secCritica);
}
acabar_leitura() {
  pthread_mutex_lock(&secCritica);
  nleitores--;
  if ([6] && escritores_espera > 0) {
    [7]
    em_escrita = TRUE;
    escritores_espera--;
  }
  pthread_mutex_unlock(&secCritica);
}`;
const SY_RW_Q = 'Leitores-escritores com um trinco e dois semáforos: vários leitores podem ler ao mesmo tempo, um escritor escreve sozinho, e os escritores à espera têm prioridade sobre leitores novos. ';
const SY_MINA = `#define MINERS_CAPACITY 10
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t minerCond, bankCond, responseCond;   // = PTHREAD_COND_INITIALIZER
int goldMineCount = 100, minedGold = 0, bankGold = 0;

void *goldMineThread(void *arg) {
  while (1) {
    sleep(10);
    pthread_mutex_lock(&mutex);
    goldMineCount += 3;
    [1]
    pthread_mutex_unlock(&mutex);
  }
}
void *minerThread(void *arg) {
  while (1) {
    pthread_mutex_lock(&mutex);
    [2] (goldMineCount == 0 || minedGold >= MINERS_CAPACITY) {
      [3]
    }
    [4]
    goldMineCount -= 1;
    minedGold += 1;
    if (minedGold >= MINERS_CAPACITY) {
      [5]
      [6]
    }
    pthread_mutex_unlock(&mutex);
    sleep(15);
  }
}
void *bankThread(void *arg) {
  while (1) {
    pthread_mutex_lock(&mutex);
    while ([7]) {
      [8]
    }
    pthread_mutex_unlock(&mutex);
    sleep(2);
    pthread_mutex_lock(&mutex);
    bankGold += minedGold;
    minedGold = 0;
    [9]
    pthread_mutex_unlock(&mutex);
  }
}`;
const SY_MINA_Q = 'Jogo da mina: a mina produz 3 unidades de ouro a cada 10 s e avisa todos os mineiros (minerCond); cada mineiro espera até haver ouro e extrai 1 unidade para minedGold; quando minedGold atinge MINERS_CAPACITY, o mineiro avisa o banco (bankCond) e espera pela resposta (responseCond); o banco transfere o ouro e responde ao mineiro. ';
const SY_JOIN = `static pthread_cond_t threadDied = [1];
static pthread_mutex_t threadMutex = [2];
static int numLive = 0;      // tarefas vivas ou terminadas e ainda sem join
static int numUnjoined = 0;  // tarefas terminadas e ainda sem join

static void *threadFunc(void *arg) {
  int idx = (int) arg;
  sleep(thread[idx].sleepTime);         // simula trabalho
  [3]
  numUnjoined++;
  thread[idx].state = TS_TERMINATED;
  pthread_mutex_unlock(&threadMutex);
  pthread_cond_signal([4]);
  return NULL;
}
int main(int argc, char *argv[]) {
  /* ... cria argc - 1 tarefas; numLive = totThreads = argc - 1 ... */
  while (numLive > 0) {
    pthread_mutex_lock(&threadMutex);
    [5] (numUnjoined == 0)
      pthread_cond_wait(&threadDied, &threadMutex);
    for (int idx = 0; idx < totThreads; idx++)
      if (thread[idx].state == TS_TERMINATED) {
        pthread_join(thread[idx].tid, NULL);
        thread[idx].state = TS_JOINED;
        numLive--; numUnjoined--;
      }
    [6]
  }
}`;
const SY_JOIN_Q = 'A tarefa principal quer fazer join a cada tarefa assim que ela termina, por qualquer ordem. ';

STUDY.questions('so', [
{ id: 'sy-r1', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '1/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'O que vai na caixa [1]?',
  o: ['pthread_mutex_lock(&secCritica);', 'pthread_mutex_unlock(&secCritica);', 'sem_wait(&leitores);', 'sem_post(&leitores);'], a: 0,
  e: 'Vai ler em_escrita e escritores_espera: primeiro o trinco.' },
{ id: 'sy-r2', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '2/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'O que vai na caixa [2], logo antes do sem_wait?',
  o: ['pthread_mutex_unlock(&secCritica);', 'pthread_mutex_lock(&secCritica);', 'sem_post(&escritores);', 'pthread_mutex_trylock(&secCritica);'], a: 0,
  e: 'O leitor vai bloquear: **larga o trinco antes**, senão o escritor que o devia acordar nunca conseguia entrar.' },
{ id: 'sy-r3', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '3/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'Que argumento vai na caixa [3], no sem_wait do leitor?',
  o: ['&leitores', '&escritores', '&secCritica', 'leitores_espera'], a: 0,
  e: 'Cada tipo de tarefa dorme no **seu** semáforo: os leitores em `leitores`.' },
{ id: 'sy-r4', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '4/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'O que vai na caixa [4], logo depois do sem_wait?',
  o: ['pthread_mutex_lock(&secCritica);', 'pthread_mutex_unlock(&secCritica);', 'sem_post(&leitores);', 'nada'], a: 0,
  e: 'Acordou e vai mexer em leitores_espera e nleitores: volta a fechar o trinco (que o unlock do fim vai abrir).' },
{ id: 'sy-r5', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '5/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'O que vai na caixa [5], dentro do `if (leitores_espera > 0)`?',
  o: ['sem_post(&leitores);', 'sem_wait(&leitores);', 'sem_post(&escritores);', 'pthread_mutex_unlock(&secCritica);'], a: 0,
  e: '"Passar o testemunho": o leitor acordado contou o seguinte como já dentro (nleitores++) e acorda-o com **sem_post(&leitores)**. Assim entram todos os leitores à espera, um a seguir ao outro.' },
{ id: 'sy-r6', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '6/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'Que condição vai na caixa [6], em acabar_leitura?',
  o: ['nleitores == 0', 'nleitores != 0', 'leitores_espera > 0', 'em_escrita'], a: 0,
  e: 'Um escritor só pode entrar quando sai o **último** leitor: `nleitores == 0` (e há escritores à espera).' },
{ id: 'sy-r7', t: 'sync', l: 3, les: 's-rw', ch: 'leitores', step: '7/7', code: SY_RW, src: 'Exame 2023/24, 1.ª época',
  q: SY_RW_Q + 'O que vai na caixa [7]?',
  o: ['sem_post(&escritores);', 'sem_wait(&escritores);', 'sem_post(&leitores);', 'pthread_mutex_unlock(&secCritica);'], a: 0,
  e: 'O último leitor acorda um escritor (e já o conta como a escrever). Quem sai é que atualiza os contadores de quem entra.' },

{ id: 'sy-m1', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '1/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [1], na mina?',
  o: ['pthread_cond_broadcast(&minerCond);', 'pthread_cond_signal(&minerCond);', 'pthread_cond_wait(&minerCond, &mutex);', 'pthread_cond_signal(&bankCond);'], a: 0,
  e: 'Há 3 unidades novas e vários mineiros podem estar à espera: **broadcast**, para acordar todos (o while de cada um decide quem consegue).' },
{ id: 'sy-m2', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '2/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [2], antes da condição do mineiro?',
  o: ['while', 'if', 'for', 'nada (fica vazia)'], a: 0,
  e: 'Esperar numa condição: sempre **while**. Depois do broadcast, os mineiros que acordam primeiro podem esgotar o ouro.' },
{ id: 'sy-m3', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '3/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [3], dentro do while do mineiro?',
  o: ['pthread_cond_wait(&minerCond, &mutex);', 'pthread_cond_wait(&responseCond, &mutex);', 'pthread_cond_broadcast(&minerCond);', 'pthread_mutex_unlock(&mutex);'], a: 0,
  e: 'O mineiro dorme na sua condição, **minerCond**, que a mina assinala quando produz ouro.' },
{ id: 'sy-m4', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '4/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [4], logo depois do while do mineiro?',
  o: ['nada', 'pthread_mutex_lock(&mutex);', 'pthread_mutex_unlock(&mutex);', 'pthread_cond_signal(&minerCond);'], a: 0,
  e: 'Nada: o mineiro já tem o trinco (fechou-o antes do while e o cond_wait devolve-o) e vai mexer nas variáveis a seguir. As caixas podem ficar vazias.' },
{ id: 'sy-m5', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '5/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [5], quando minedGold chega à capacidade?',
  o: ['pthread_cond_signal(&bankCond);', 'pthread_cond_wait(&bankCond, &mutex);', 'pthread_cond_signal(&responseCond);', 'pthread_cond_broadcast(&minerCond);'], a: 0,
  e: 'Avisa o **banco**, que está à espera em bankCond. Só há um banco: signal chega.' },
{ id: 'sy-m6', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '6/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [6], logo a seguir a avisar o banco?',
  o: ['pthread_cond_wait(&responseCond, &mutex);', 'pthread_cond_wait(&responseCond, &bankCond);', 'pthread_cond_signal(&responseCond);', 'pthread_mutex_unlock(&mutex);'], a: 0,
  e: 'O mineiro espera pela **resposta** do banco em responseCond, largando o trinco para o banco poder trabalhar.' },
{ id: 'sy-m7', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '7/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'Que condição vai na caixa [7], no while do banco?',
  o: ['minedGold < MINERS_CAPACITY', 'minedGold > MINERS_CAPACITY', 'minedGold >= MINERS_CAPACITY', 'goldMineCount == 0'], a: 0,
  e: 'O banco espera **enquanto** ainda não há ouro suficiente para transferir: `minedGold < MINERS_CAPACITY`.' },
{ id: 'sy-m8', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '8/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [8], dentro do while do banco?',
  o: ['pthread_cond_wait(&bankCond, &mutex);', 'pthread_cond_wait(&minerCond, &mutex);', 'pthread_cond_signal(&bankCond);', 'pthread_cond_wait(&responseCond, &mutex);'], a: 0,
  e: 'O banco dorme em **bankCond**, que o mineiro assinala.' },
{ id: 'sy-m9', t: 'sync', l: 3, les: 's-boxes', ch: 'mina', step: '9/9', code: SY_MINA, src: 'Exame 2023/24, 1.ª época',
  q: SY_MINA_Q + 'O que vai na caixa [9], depois de transferir o ouro?',
  o: ['pthread_cond_signal(&responseCond);', 'pthread_cond_broadcast(&minerCond);', 'pthread_cond_signal(&bankCond);', 'pthread_cond_wait(&responseCond, &mutex);'], a: 0,
  e: 'Responde ao mineiro que estava à espera em responseCond. (Fazer o signal depois do unlock também foi aceite no exame.)' },

{ id: 'sy-j1', t: 'sync', l: 3, les: 's-cv', ch: 'joinall', step: '1/6', code: SY_JOIN, src: 'Exame 2022/23, 2.ª época',
  q: SY_JOIN_Q + 'O que vai na caixa [1]?',
  o: ['PTHREAD_COND_INITIALIZER', 'PTHREAD_MUTEX_INITIALIZER', 'pthread_cond_init()', '0'], a: 0,
  e: 'threadDied é uma variável de condição: inicializa-se estaticamente com **PTHREAD_COND_INITIALIZER**.' },
{ id: 'sy-j2', t: 'sync', l: 3, les: 's-cv', ch: 'joinall', step: '2/6', code: SY_JOIN, src: 'Exame 2022/23, 2.ª época',
  q: SY_JOIN_Q + 'O que vai na caixa [2]?',
  o: ['PTHREAD_MUTEX_INITIALIZER', 'PTHREAD_COND_INITIALIZER', 'pthread_mutex_init()', 'PTHREAD_RWLOCK_INITIALIZER'], a: 0,
  e: 'threadMutex é um trinco: **PTHREAD_MUTEX_INITIALIZER**.' },
{ id: 'sy-j3', t: 'sync', l: 3, les: 's-cv', ch: 'joinall', step: '3/6', code: SY_JOIN, src: 'Exame 2022/23, 2.ª época',
  q: SY_JOIN_Q + 'O que vai na caixa [3], em threadFunc?',
  o: ['pthread_mutex_lock(&threadMutex);', 'pthread_mutex_unlock(&threadMutex);', 'pthread_cond_wait(&threadDied, &threadMutex);', 'pthread_join(thread[idx].tid, NULL);'], a: 0,
  e: 'A tarefa vai alterar numUnjoined e o estado, partilhados com o main: fecha o trinco (o unlock está duas linhas abaixo).' },
{ id: 'sy-j4', t: 'sync', l: 3, les: 's-cv', ch: 'joinall', step: '4/6', code: SY_JOIN, src: 'Exame 2022/23, 2.ª época',
  q: SY_JOIN_Q + 'Que argumento vai na caixa [4], no pthread_cond_signal?',
  o: ['&threadDied', '&threadMutex', 'threadDied', 'NULL'], a: 0,
  e: 'Assinala a condição onde o main espera: **&threadDied** (as funções recebem ponteiros).' },
{ id: 'sy-j5', t: 'sync', l: 3, les: 's-cv', ch: 'joinall', step: '5/6', code: SY_JOIN, src: 'Exame 2022/23, 2.ª época',
  q: SY_JOIN_Q + 'O que vai na caixa [5], antes de `(numUnjoined == 0)`?',
  o: ['while', 'if', 'for', 'nada (fica vazia)'], a: 0,
  e: 'Esperar numa condição: **while**, para voltar a testar ao acordar.' },
{ id: 'sy-j6', t: 'sync', l: 3, les: 's-cv', ch: 'joinall', step: '6/6', code: SY_JOIN, src: 'Exame 2022/23, 2.ª época',
  q: SY_JOIN_Q + 'O que vai na caixa [6], no fim do ciclo do main?',
  o: ['pthread_mutex_unlock(&threadMutex);', 'pthread_mutex_lock(&threadMutex);', 'pthread_cond_signal(&threadDied);', 'pthread_mutex_trylock(&threadMutex);'], a: 0,
  e: 'Fecha o par lock/unlock do início do ciclo. Sem isto, na volta seguinte o main tentava fechar um trinco que já tem.' },
]);

/* --- nível 4: perguntas de exame --- */
STUDY.questions('so', [
{ id: 'sy-30', t: 'sync', l: 4, les: 's-sem', src: 'Exame 2022/23, 1.ª época',
  q: 'Para bloquear uma tarefa T1 até acontecer um evento detetado pela tarefa T2, qual das seguintes montagens com um semáforo funciona?',
  o: ['Começa a 0; T1 espera e T2 assinala', 'Começa a 1; T1 espera e T2 assinala', 'Começa a 0; T1 assinala e T2 espera', 'Nenhuma das anteriores'], a: 0,
  e: 'A 0, o esperar de T1 bloqueia até T2 assinalar. A 1, T1 passava logo, sem evento nenhum.' },
{ id: 'sy-31', t: 'sync', l: 4, les: 's-pc', code: SY_PC_SEM, src: 'Exame 2022/23, 1.ª época',
  q: 'No produtor-consumidor abaixo, trocam-se as linhas `sem_wait(&bufferCheio);` e `pthread_mutex_lock(&semExMut);` em EscreveMsg. Qual das afirmações é verdadeira?',
  o: ['Pode gerar interblocagem', 'Fica menos eficiente, mas correto', 'Escrevem-se mensagens sem espaço no buffer', 'Pode haver míngua'], a: 0,
  e: 'Com o buffer cheio, o escritor bloqueia no semáforo **com o trinco fechado**; os leitores não conseguem entrar para libertar espaço. Interblocagem.' },
{ id: 'sy-32', t: 'sync', l: 4, les: 's-pc', code: SY_PC_SEM, src: 'Exame 2022/23, 1.ª época',
  q: 'No produtor-consumidor abaixo, trocam-se as linhas `pthread_mutex_unlock(&semExMut);` e `sem_post(&bufferCheio);` em LeMsg. Qual das afirmações é verdadeira?',
  o: ['Fica menos eficiente, mas correto', 'Pode gerar interblocagem', 'Escrevem-se mensagens sem espaço no buffer', 'Pode haver míngua'], a: 0,
  e: 'sem_post nunca bloqueia, por isso fazê-lo com o trinco fechado não causa problemas: só obriga o escritor acordado a esperar um pouco pelo trinco.' },
{ id: 'sy-33', t: 'sync', l: 4, les: 's-pc', code: SY_PC_SEM, src: 'Exame 2022/23, 1.ª época',
  q: 'Sobre o produtor-consumidor abaixo, com vários escritores e vários leitores, qual das afirmações é verdadeira?',
  o: ['Um trinco por lado dá mais paralelismo', 'É obrigatório um trinco comum, porque o buffer é o mesmo', 'Bastava um trinco só no EscreveMsg, porque o LeMsg só lê', 'Nenhuma das anteriores'], a: 0,
  e: 'Leitores e escritores usam índices diferentes e os semáforos impedem-nos de tocar na mesma posição: um trinco para os escritores e outro para os leitores dá **mais paralelismo**. O LeMsg também altera indiceLeitura, por isso precisa de trinco.' },
{ id: 'sy-34', t: 'sync', l: 4, les: 's-sem', src: 'Exame 2022/23, 2.ª época',
  q: 'Qual das seguintes afirmações sobre semáforos é verdadeira?',
  o: ['Um semáforo binário a 1 faz de mutex: esperar = lock, assinalar = unlock', 'Um semáforo tem sempre de ser usado com um mutex', 'O contador de um semáforo pode ficar abaixo de 0', 'Um semáforo binário a 0 faz de mutex: esperar = lock, assinalar = unlock'], a: 0,
  e: 'A 1, a primeira tarefa entra e as seguintes bloqueiam até ao assinalar. A 0, ninguém entrava. No modelo das aulas o contador nunca é negativo.' },
{ id: 'sy-35', t: 'sync', l: 4, les: 's-cv', src: 'Exame 2022/23, 2.ª época',
  code: `// Sequência A                          // Sequência B
pthread_mutex_lock(&m);                  pthread_mutex_lock(&m);
...                                      ...
pthread_cond_wait(&threadDied, &m);      sem_wait(&threads);`,
  q: 'Considera as duas sequências abaixo, em que a tarefa fica à espera com o trinco m fechado antes. Qual das afirmações é verdadeira?',
  o: ['A não pode dar interblocagem e B pode', 'A pode dar interblocagem e B não', 'Tanto A como B podem dar interblocagem', 'Nenhuma pode dar interblocagem'], a: 0,
  e: 'O cond_wait **larga o trinco** enquanto espera. O sem_wait não sabe nada do trinco: a tarefa dorme com ele fechado e quem a devia acordar pode precisar dele.' },
{ id: 'sy-36', t: 'sync', l: 4, les: 's-cv', src: 'Exame 2022/23, 2.ª época',
  q: 'Uma tarefa principal espera pelas tarefas que criou assim: cada tarefa, ao terminar, incrementa numUnjoined (com o trinco) e faz pthread_cond_signal(&threadDied); o main faz `while (numUnjoined == 0) pthread_cond_wait(&threadDied, &m)` e depois faz join a todas as terminadas. Várias tarefas terminam ao mesmo tempo. Qual das afirmações é verdadeira?',
  o: ['Um semáforo guardaria quantas vezes foi assinalado', 'A condição soma quantas vezes houve signal', 'A condição não tem memória, por isso o programa falha', 'Nunca acontece: os sleep aleatórios separam as tarefas'], a: 0,
  e: 'É verdade que a condição não tem memória, mas o programa não falha: o **contador** numUnjoined guarda quantas terminaram. A afirmação certa é a dos semáforos, que guardam o número de assinalar.' },
{ id: 'sy-37', t: 'sync', l: 4, les: 's-cv', src: 'Exame 2022/23, 2.ª época',
  q: 'Um programa usa uma variável de condição para a tarefa principal saber quando cada uma das suas tarefas termina (e lhe fazer join), em vez de fazer pthread_join pela ordem de criação. Porquê?',
  o: ['O pthread_join não deixa esperar por uma tarefa qualquer', 'Para as variáveis partilhadas serem atualizadas em exclusão mútua', 'Para detetar a terminação sem usar signals', 'Porque sem estar em pthread_join a terminação perde-se'], a: 0,
  e: 'pthread_join pede o identificador de uma tarefa **concreta**. Para atender a que terminar primeiro, as tarefas avisam numa condição. A exclusão mútua é dada pelo trinco, não pela condição.' },
{ id: 'sy-38', t: 'sync', l: 4, les: 's-pc', code: SY_PC_ITEM, src: 'Exame 2024/25, 1.ª época',
  q: 'No produtor-consumidor abaixo, com vários produtores, eliminam-se as linhas fechar(trinco) e abrir(trinco) de colocarItem. Que comportamento incorreto pode ocorrer?',
  o: ['Um item pode tapar outro ainda por retirar', 'O buffer pode ficar com mais de N itens', 'O mesmo item pode ser retirado duas vezes', 'Posições já retiradas ficam com valores válidos'], a: 0,
  e: 'Dois produtores podem ler o mesmo prodptr e escrever na **mesma posição**: o segundo apaga o item do primeiro, que nunca será consumido. O semáforo continua a impedir mais de N itens.' },
{ id: 'sy-39', t: 'sync', l: 4, les: 's-pc', code: SY_PC_ITEM, src: 'Exame 2024/25, 1.ª época',
  q: 'No produtor-consumidor abaixo, o semáforo pode_cons é inicializado com N em vez de 0. Que comportamento incorreto pode ocorrer?',
  o: ['Podem ser retirados itens com o valor −1', 'Alguns consumidores ficam em míngua', 'Itens são escritos por cima de outros', 'Produtores e consumidores acabam em interblocagem'], a: 0,
  e: 'Os consumidores passam logo N vezes o esperar, mesmo com o buffer vazio, e leem posições com **−1**.' },
{ id: 'sy-40', t: 'sync', l: 4, les: 's-pc', code: SY_PC_ITEM, src: 'Exame 2024/25, 1.ª época',
  q: 'No produtor-consumidor abaixo, as linhas `esperar(pode_prod); fechar(trinco);` de colocarItem passam a `fechar(trinco); esperar(pode_prod);`. O que pode acontecer?',
  o: ['Um produtor com o buffer cheio bloqueia os consumidores seguintes', 'A chamada esperar(pode_prod) passa a dar erro e termina o processo', 'Um produtor com o buffer cheio causa míngua dos consumidores', 'A chamada esperar(pode_prod) dá erro e termina a tarefa produtora'], a: 0,
  e: 'O produtor dorme no semáforo com o trinco: os consumidores bloqueiam no fechar(trinco) e nunca libertam espaço. É uma interblocagem, não míngua (ninguém avança).' },
]);
