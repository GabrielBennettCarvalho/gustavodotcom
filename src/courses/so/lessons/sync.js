/* ===== SO lessons: mutual exclusion (Grupo 3) and semaphores / condition variables (Grupo 4) ===== */
STUDY.lessons('so', [
{ id: 'm-race', t: 'mutex', title: 'Condição de corrida e secção crítica',
  html: `<p><code>conta++</code> parece uma instrução, mas o processador faz três: <b>ler</b> para um registo, <b>somar</b>, <b>escrever</b>. Se duas tarefas fizerem isto ao mesmo tempo:</p>
  <pre>T1: lê conta (0)
T2: lê conta (0)
T1: soma, escreve 1
T2: soma, escreve 1     // dois incrementos, conta = 1</pre>
  <div class="ana"><b>Analogia</b>Duas pessoas a gerir o mesmo frasco de bolachas por um papel na porta. Ambas leem "5", ambas tiram uma e escrevem "4". Tiraram duas, o papel diz que só saiu uma.</div>
  <p>Uma <b>condição de corrida</b> é quando o resultado depende da ordem em que as tarefas se intercalam. O código que mexe em dados partilhados é a <b>secção crítica</b>, e só pode estar lá <b>uma tarefa de cada vez</b> (exclusão mútua).</p>
  <pre>pthread_mutex_lock(&amp;m);    // fechar o trinco
conta++;                   // secção crítica
pthread_mutex_unlock(&amp;m);  // abrir o trinco</pre>
  <p>Um bom trinco garante <b>exclusão mútua</b>, <b>progresso</b> (se está livre, alguém entra) e, idealmente, <b>ausência de míngua</b> (ninguém espera para sempre).</p>`,
  key: 'Dados partilhados + intercalação = condição de corrida. A secção crítica fica entre lock e unlock.' },

{ id: 'm-impl', t: 'mutex', title: 'Como se implementa um trinco',
  html: `<p>O exame pergunta muito "quem faz espera ativa?". Espera ativa (<b>busy-wait</b>) é ficar num ciclo a testar, a gastar CPU.</p>
  <div class="tbl-wrap"><table><tr><th>Implementação</th><th>Como funciona</th><th>Espera ativa?</th></tr>
  <tr><td><b>Algoritmos em software</b> (padaria de Lamport)</td><td>só leituras e escritas normais; cada tarefa tira uma senha e espera pela sua vez. A variável "escolha" (a "tampa da caneta") impede que alguém compare senhas enquanto outro ainda está a escolher a sua; sem ela <b>falha a exclusão mútua</b>.</td><td>sim</td></tr>
  <tr><td><b>Inibir interrupções</b></td><td>sem interrupções não há comutação. Só em <b>modo núcleo</b> e só resulta com <b>um CPU</b>.</td><td>—</td></tr>
  <tr><td><b>Instruções atómicas</b> (test-and-set, BTS, compare-and-swap)</td><td>o hardware lê e escreve numa só operação indivisível, em multi-core também. Evitam algoritmos complicados como o de Lamport e funcionam em modo utilizador.</td><td><b>sim</b> (testa em ciclo)</td></tr>
  <tr><td><b>Trinco gerido pelo núcleo</b></td><td>se está ocupado, o núcleo põe a tarefa numa fila e <b>bloqueia-a</b>; o unlock acorda uma. Usa internamente um trinco curto (com espera ativa) só para mexer na fila.</td><td>só por instantes, nunca durante a secção crítica dos outros</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Espera ativa é ficar a bater à porta da casa de banho de 2 em 2 segundos. Bloquear é deixar o nome na lista e ir sentar-te: alguém te chama quando ficar livre.</div>
  <p>Na prática (pthread_mutex, futex) tenta-se primeiro com uma instrução atómica <b>em modo utilizador</b> (rápido se o trinco está livre) e só se chama o núcleo para bloquear quando está ocupado. Uma chamada de sistema em cada lock seria lenta quando o trinco está livre.</p>
  <div class="trap">"Instruções atómicas evitam espera ativa" é <b>falso</b>. "Só funcionam em single-core" também é falso.</div>`,
  key: 'Lamport e test-and-set: espera ativa. Inibir interrupções: só núcleo, só 1 CPU. Trinco do núcleo: bloqueia (fila), espera ativa só para gerir a fila.' },

{ id: 'm-gran', t: 'mutex', title: 'Granularidade e read-write locks',
  html: `<p><b>Granularidade grossa</b>: um trinco para tudo. Simples, mas só uma tarefa trabalha de cada vez. <b>Granularidade fina</b>: um trinco por parte (por lugar, por conta, por entrada). Mais paralelismo, mas mais custos (mais locks/unlocks) e mais risco de <b>interblocagem</b>.</p>
  <div class="ana"><b>Analogia</b>Um cinema com uma única bilheteira (grossa) contra um segurança por fila de cadeiras (fina). Com seguranças por fila, várias pessoas compram ao mesmo tempo, desde que não queiram as mesmas cadeiras.</div>
  <p><b>Exemplo do exame (reservar N lugares de um cinema)</b>: um trinco por lugar; para reservar, <b>ordena</b> os índices, fecha os trincos <b>por essa ordem</b>, verifica se estão todos livres, marca-os e abre os trincos. A ordenação evita a interblocagem entre duas reservas que pedem os mesmos lugares por ordens diferentes.</p>
  <p><b>Read-write lock</b>: vários <b>leitores</b> ao mesmo tempo, ou um único <b>escritor</b>.</p>
  <ul><li>Dá <b>mais paralelismo</b> do que um mutex quando há sobretudo leituras.</li>
  <li>É mais <b>pesado</b> do que um mutex (mais estado para gerir); com secções curtas ou muitas escritas pode ser pior.</li>
  <li>Logo: <b>nem sempre</b> é melhor, e mutex e rwlock <b>não</b> são intercambiáveis em qualquer caso.</li></ul>
  <div class="trap">Um mutex <b>não</b> garante ausência de míngua: nada obriga a que a tarefa que espera há mais tempo seja a próxima.</div>`,
  key: 'Fina = mais paralelismo, mais custo e risco de interblocagem. rwlock: muitos leitores ou um escritor; nem sempre compensa.' },

{ id: 'm-dead', t: 'mutex', title: 'Interblocagem, míngua e o jantar dos filósofos',
  html: `<p><b>Interblocagem</b> (deadlock): um grupo de tarefas em que cada uma espera por um recurso que outra do grupo tem. Ninguém avança, para sempre. Exige <b>espera circular</b>.</p>
  <p><b>Jantar dos filósofos</b>: 5 filósofos à volta de uma mesa, um garfo entre cada dois, cada um precisa dos dois garfos ao lado. Se todos pegarem no da direita ao mesmo tempo, ficam todos à espera do da esquerda: interblocagem. Pode acontecer, mas <b>não</b> acontece garantidamente (depende do timing), e também acontece com 2 filósofos.</p>
  <div class="ana"><b>Analogia</b>Dois carros num cruzamento estreito, cada um à espera que o outro recue.</div>
  <div class="tbl-wrap"><table><tr><th>Solução</th><th>Interblocagem?</th><th>Míngua (livelock)?</th></tr>
  <tr><td><b>Ordem global</b>: todos pegam primeiro no garfo de número menor (lock por ordem)</td><td>não</td><td>não</td></tr>
  <tr><td><b>try_lock</b>: se o 2.º garfo está ocupado, larga o 1.º e tenta outra vez</td><td>não</td><td><b>sim</b>: podem largar e voltar a pegar todos ao mesmo ritmo, para sempre</td></tr>
  <tr><td>try_lock com <b>recuo aleatório</b> (esperar um tempo ao acaso antes de tentar)</td><td>não</td><td>evitada <b>com alta probabilidade</b></td></tr>
  <tr><td>try_lock com recuo <b>determinístico</b> (sempre o mesmo tempo)</td><td>não</td><td>pode nunca comer</td></tr></table></div>
  <p>A <b>míngua</b> (starvation) é uma tarefa nunca conseguir avançar enquanto outras avançam; o <b>livelock</b> é o caso em que todas se mexem mas nenhuma progride.</p>
  <div class="trap">"Todos pegam primeiro no garfo da direita" <b>não</b> resolve: é exatamente o caso que bloqueia. O que resolve é uma ordem <b>global</b> (por número), que obriga um deles a pegar pela ordem contrária.</div>`,
  key: 'Ordem global de aquisição → sem interblocagem. try_lock → sem interblocagem mas com livelock; recuo aleatório evita-o (probabilisticamente).' },

{ id: 's-sem', t: 'sync', title: 'Semáforos: um contador com fila',
  html: `<p>Um <b>semáforo</b> tem um contador inteiro (nunca negativo) e uma fila de tarefas bloqueadas.</p>
  <ul><li><code>esperar</code> (sem_wait, P, down): se o contador &gt; 0, decrementa e segue; se é 0, <b>bloqueia</b>.</li>
  <li><code>assinalar</code> (sem_post, V, up): se há alguém bloqueado, acorda um; senão incrementa. <b>Nunca bloqueia.</b></li></ul>
  <div class="ana"><b>Analogia</b>Um parque de estacionamento com um painel "lugares livres: N". Cada carro que entra baixa o número (esperar); se está a 0, fica na fila à cancela. Cada carro que sai sobe o número ou deixa entrar o primeiro da fila (assinalar).</div>
  <div class="tbl-wrap"><table><tr><th>Valor inicial</th><th>Uso</th><th>Quem espera / quem assinala</th></tr>
  <tr><td><b>N</b></td><td>N recursos iguais (lugares livres no buffer)</td><td>quem consome um recurso espera; quem o liberta assinala</td></tr>
  <tr><td><b>0</b></td><td>esperar por um <b>evento</b> (há uma mensagem, o filho acabou)</td><td>T1 (quem precisa do evento) espera; T2 (quem o deteta) assinala</td></tr>
  <tr><td><b>1</b></td><td><b>exclusão mútua</b> (semáforo binário)</td><td>esperar = lock, assinalar = unlock. Funciona, mas é menos eficiente do que um mutex</td></tr></table></div>
  <p>Ao contrário de uma variável de condição, o semáforo <b>tem memória</b>: se assinalares 3 vezes sem ninguém à espera, os 3 próximos esperar passam. E o contador <b>pode subir acima do valor inicial</b>.</p>`,
  key: 'esperar decrementa ou bloqueia; assinalar acorda ou incrementa e nunca bloqueia. N = recursos, 0 = evento, 1 = exclusão.' },

{ id: 's-pc', t: 'sync', title: 'Produtor-consumidor com semáforos',
  html: `<p>Um buffer circular de N posições. Produtores escrevem, consumidores leem. Precisa de três coisas:</p>
  <pre>sem livres = N;   // posições livres
sem cheias = 0;   // mensagens por ler
mutex m;

produtor:                        consumidor:
  sem_wait(&amp;livres);               sem_wait(&amp;cheias);
  lock(&amp;m);                        lock(&amp;m);
  buf[iw] = x; iw = (iw+1)%N;      x = buf[ir]; ir = (ir+1)%N;
  unlock(&amp;m);                      unlock(&amp;m);
  sem_post(&amp;cheias);               sem_post(&amp;livres);</pre>
  <div class="ana"><b>Analogia</b>Uma padaria com uma prateleira de N lugares. O padeiro só entra se houver lugar vazio (livres); o cliente só entra se houver pão (cheias). O trinco é a porta estreita da prateleira: um de cada vez a mexer nela.</div>
  <h4 style="font-family:var(--f-display);font-size:15px;margin:12px 0 6px">O que corre mal se mexeres</h4>
  <ul><li><b>lock antes de sem_wait</b>: o produtor fica bloqueado com o buffer cheio <b>e com o trinco</b>; o consumidor não consegue entrar para libertar espaço: <b>interblocagem</b>.</li>
  <li><b>sem_post antes de unlock</b>: continua correto, só um pouco menos eficiente (quem acorda pode ter de esperar pelo trinco).</li>
  <li><b>Tirar o trinco com vários produtores</b>: dois podem escrever na mesma posição (o segundo apaga o primeiro).</li>
  <li><b>cheias começar em N</b>: os consumidores leem posições vazias.</li>
  <li>Com <b>um só produtor e um só consumidor</b>, o trinco pode sair: os semáforos já impedem que mexam na mesma posição.</li>
  <li>Dá para ter <b>um trinco para produtores e outro para consumidores</b>: usam índices diferentes e nunca a mesma posição ao mesmo tempo, logo há mais paralelismo.</li></ul>`,
  key: 'livres = N, cheias = 0. Sempre sem_wait antes do lock. Trocar unlock/post é só menos eficiente; trocar wait/lock dá interblocagem.' },

{ id: 's-cv', t: 'sync', title: 'Variáveis de condição',
  html: `<p>Uma <b>variável de condição</b> serve para esperar até que uma condição sobre dados partilhados seja verdadeira, <b>sem espera ativa</b>. Usa-se sempre com um trinco:</p>
  <pre>lock(&amp;m);
while (!condicao)              // WHILE, nunca if
  pthread_cond_wait(&amp;c, &amp;m);   // larga m e dorme; ao acordar volta a ter m
… usar os dados …
unlock(&amp;m);

// do outro lado:
lock(&amp;m);  mudar os dados;  pthread_cond_signal(&amp;c);  unlock(&amp;m);</pre>
  <ul><li><code>cond_wait(c, m)</code> <b>larga o trinco e bloqueia, atomicamente</b>. Quando regressa, a tarefa <b>tem outra vez o trinco</b>.</li>
  <li><b>while</b> porque, quando acordas, outra tarefa pode ter apanhado o que querias primeiro (ou ser um "spurious wake-up").</li>
  <li><code>signal</code> acorda <b>uma</b>; <code>broadcast</code> acorda <b>todas</b>. Nenhuma das duas bloqueia.</li>
  <li><b>Não tem memória</b>: um signal sem ninguém à espera perde-se. Por isso a condição é sempre uma variável normal (contador) testada no while.</li></ul>
  <div class="ana"><b>Analogia</b>Uma sala de espera de um consultório. Sentas-te (wait) e entregas a chave da sala (o trinco). A enfermeira chama "o próximo" (signal) ou "todos" (broadcast). Quando te chamam, voltas a ter a chave, mas olhas outra vez para o quadro: se alguém passou à frente, voltas a sentar-te (while).</div>
  <p><b>signal ou broadcast?</b> broadcast quando podem avançar várias (chegaram 3 unidades de ouro para vários mineiros) ou quando tarefas <b>de tipos diferentes</b> esperam na mesma condição. signal quando basta acordar uma e qualquer uma serve.</p>
  <p>Fazer o signal depois de largar o trinco também funciona.</p>`,
  key: 'lock; while(!cond) cond_wait(c, m); …; unlock. wait larga o trinco e retoma-o ao acordar. Sem memória: o contador é que guarda o estado.' },

{ id: 's-pccv', t: 'sync', title: 'Produtor-consumidor com variáveis de condição',
  html: `<p>A mesma prateleira, agora com um contador <code>count</code> e duas condições:</p>
  <pre>produtor:                              consumidor:
  lock(&amp;m);                              lock(&amp;m);
  while (count == N)                     while (count == 0)
    cond_wait(&amp;podeProd, &amp;m);              cond_wait(&amp;podeCons, &amp;m);
  buf[pp] = item; pp = (pp+1)%N;         item = buf[pc]; pc = (pc+1)%N;
  count++;                               count--;
  cond_signal(&amp;podeCons);                cond_signal(&amp;podeProd);
  unlock(&amp;m);                            unlock(&amp;m);</pre>
  <div class="ana"><b>Analogia</b>As duas condições são duas campainhas: o produtor toca a dos consumidores ("há pão"), o consumidor toca a dos produtores ("há espaço"). Cada um dorme ao pé da sua.</div>
  <p>Repara no padrão de cada lado: <b>lock → while (não posso) wait → trabalhar → avisar o outro lado → unlock</b>. É este padrão que preenche as caixas.</p>
  <p>Comparado com os semáforos: aqui o "quantos há" é o <code>count</code>, guardado por ti; com semáforos é o próprio semáforo que conta.</p>`,
  key: 'lock → while (count == N ou 0) wait → mexer → count±± → signal ao outro lado → unlock.' },

{ id: 's-rw', t: 'sync', title: 'Leitores-escritores (e outros "trincos especiais")',
  html: `<p>Vários leitores podem estar dentro ao mesmo tempo; um escritor tem de estar sozinho. A versão das aulas usa um mutex, contadores e <b>dois semáforos a 0</b> para bloquear quem não pode entrar:</p>
  <pre>iniciar_leitura:
  lock(&amp;m);
  if (em_escrita || escritores_espera > 0) {
    leitores_espera++;
    unlock(&amp;m);
    sem_wait(&amp;leitores);          // dorme sem o trinco
    lock(&amp;m);
    if (leitores_espera > 0) {    // acorda o leitor seguinte ("passar o testemunho")
      nleitores++; leitores_espera--; sem_post(&amp;leitores); }
  } else nleitores++;
  unlock(&amp;m);

acabar_leitura:
  lock(&amp;m);
  nleitores--;
  if (nleitores == 0 &amp;&amp; escritores_espera > 0) {
    sem_post(&amp;escritores); em_escrita = TRUE; escritores_espera--; }
  unlock(&amp;m);</pre>
  <div class="ana"><b>Analogia</b>Uma sala de leitura com um quadro. Quem quer entrar olha para o quadro com a chave na mão (trinco). Se não pode, apõe o nome na lista, <b>devolve a chave</b> e senta-se lá fora (sem_wait). Quem sai e vê que é o último leitor e há um escritor na lista, chama-o (sem_post).</div>
  <p>As regras gerais que se repetem nestes trincos especiais (leitores-escritores, categorias A e B, barbeiro):</p>
  <ul><li>Antes de bloquear num semáforo, <b>largar o trinco</b>.</li>
  <li>Quem sai é que <b>atualiza os contadores</b> de quem vai entrar e faz o sem_post.</li>
  <li>Dar prioridade aos escritores que esperam evita a míngua dos escritores.</li></ul>`,
  key: 'Testar com o trinco; se não pode, contar-se como à espera, largar o trinco e sem_wait. Quem sai acorda quem pode entrar.' },

{ id: 's-boxes', t: 'sync', title: 'Como atacar um exercício de preencher caixas',
  html: `<p>Os exercícios grandes do Grupo 4 (mina de ouro, fábrica, ovos, barbeiro, buffer com dois tipos de leitores) parecem diferentes mas resolvem-se sempre com as mesmas perguntas, caixa a caixa:</p>
  <ul><li><b>1. Vou ler ou mudar variáveis partilhadas?</b> Então a caixa antes é <code>lock</code> e há um <code>unlock</code> antes de sair (e antes de qualquer sleep).</li>
  <li><b>2. Posso ter de esperar?</b> Com condições: <code>while (não posso) cond_wait(&amp;c, &amp;m)</code>. Com semáforos: <code>sem_wait</code> <b>antes</b> do lock.</li>
  <li><b>3. Mudei alguma coisa de que alguém está à espera?</b> Então assinalo a condição <b>dessa pessoa</b> (signal ou broadcast), ou faço sem_post no semáforo dela.</li>
  <li><b>4. Valores iniciais</b>: semáforo de "espaço" = N, de "itens" = 0; mutex com <code>PTHREAD_MUTEX_INITIALIZER</code>; condição com <code>PTHREAD_COND_INITIALIZER</code>.</li></ul>
  <div class="ana"><b>Analogia</b>É como um controlador de tráfego: antes de cada cruzamento perguntas "tenho a vez?" (espera), ao atravessar "ocupo o cruzamento" (trinco), depois de passar "aviso quem estava parado à espera de mim" (assinalar).</div>
  <p><b>Exemplo: o barbeiro</b> (5 cadeiras, semáforos clientes = 0 e barbeiro = 0):</p>
  <pre>barbeiro: while(1) { sem_wait(clientes); lock(m); waiting--; sem_post(barbeiro); unlock(m); corta(); }
cliente:  lock(m);
          if (waiting &lt; 5) { waiting++; sem_post(clientes); unlock(m); sem_wait(barbeiro); recebe_corte(); }
          else unlock(m);    // cheio, volta mais tarde</pre>
  <div class="trap">Erro mais comum: um caminho do código que sai sem fazer unlock (o else do "está cheio", ou um <code>return</code> a meio).</div>`,
  key: 'Caixa a caixa: partilhado? → lock/unlock. Posso ter de esperar? → while+cond_wait ou sem_wait antes do lock. Mudei algo? → signal/broadcast/sem_post.' },
]);
