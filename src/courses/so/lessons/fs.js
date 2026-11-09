/* ===== SO lessons: file systems (Grupo 1) ===== */
STUDY.lessons('so', [
{ id: 'f-path', t: 'fs', title: 'Caminhos absolutos e relativos',
  html: `<p>Um caminho <b>absoluto</b> começa em <code>/</code> (a raiz). Um caminho <b>relativo</b> começa no <b>diretório corrente</b> do processo.</p>
  <div class="ana"><b>Analogia</b>Indicações dentro de um prédio. "Rés-do-chão, escada B, 3.º esquerdo" funciona de onde quer que estejas (absoluto). "Desce um andar e vira à direita" depende de onde estás agora (relativo). <code>..</code> é "desce um andar", <code>.</code> é "fica onde estás".</div>
  <p>Para resolver um relativo, parte do diretório corrente e aplica cada componente, um de cada vez:</p>
  <pre>corrente: /home/joao/SO
./../../luis/ASA/README.txt
.        → /home/joao/SO
..       → /home/joao
..       → /home
luis/ASA → /home/luis/ASA/README.txt</pre>
  <p>Na raiz, <code>..</code> continua na raiz: <code>/..</code> é <code>/</code>.</p>
  <div class="trap">Armadilha de exame: contar os <code>..</code> e "comer" o mesmo número de diretórios do <b>fim</b> do diretório corrente. <code>/home/maria/SO</code> com <code>../../../usr/tmp</code> dá <code>/usr/tmp</code>: três subidas levam-te à raiz.</div>`,
  key: 'Absoluto começa em /. Relativo parte do diretório corrente: cada .. sobe um nível, . fica.' },

{ id: 'f-tables', t: 'fs', title: 'As três tabelas de um ficheiro aberto',
  html: `<p>Quando um processo faz <code>open</code>, o núcleo usa <b>três tabelas</b>:</p>
  <div class="tbl-wrap"><table><tr><th>Tabela</th><th>De quem é</th><th>O que guarda</th></tr>
  <tr><td><b>Descritores</b> (fd 0, 1, 2, 3…)</td><td>uma <b>por processo</b></td><td>um ponteiro para uma entrada da tabela de ficheiros abertos</td></tr>
  <tr><td><b>Ficheiros abertos</b></td><td><b>global</b> (todo o sistema)</td><td>o <b>cursor</b> (posição atual), o modo de abertura (leitura, escrita, append) e um ponteiro para o inode</td></tr>
  <tr><td><b>Inodes</b> (em memória)</td><td>global</td><td>o ficheiro em si: dono, permissões, tamanho, blocos</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Uma biblioteca. O <b>fd</b> é a senha numerada que tens no bolso. A senha aponta para uma <b>ficha de empréstimo</b> no balcão (ficheiros abertos), que tem o <b>marcador de página</b> (cursor). A ficha aponta para o <b>livro</b> (inode). Duas pessoas podem ter fichas diferentes para o mesmo livro, cada uma com o seu marcador.</div>
  <ul><li><b>Cada open</b> cria uma ficha nova: cursor próprio, a começar em 0.</li>
  <li><b>dup</b> e <b>fork</b> não criam fichas: criam outra senha para a <b>mesma ficha</b>, logo o cursor é <b>partilhado</b>.</li>
  <li>Os fds 0, 1 e 2 são stdin, stdout e stderr. O open devolve o <b>menor fd livre</b>.</li></ul>`,
  key: 'fd (por processo) → ficheiros abertos (global, tem o cursor) → inode. open cria entrada nova; dup e fork partilham a mesma.' },

{ id: 'f-dup', t: 'fs', title: 'dup, lseek e o cursor partilhado',
  html: `<p>A pergunta clássica do Grupo 1: vários descritores para o mesmo ficheiro e escritas intercaladas. A regra é uma só: <b>quem partilha a entrada partilha o cursor</b>.</p>
  <pre>fd1 = open("test", O_RDWR|O_CREAT|O_TRUNC, …);  // ficha A, cursor 0
fd2 = dup(fd1);                                  // outra senha para A
fd3 = open("test", O_RDWR);                      // ficha B, cursor 0
write(fd1, "++++", 4);   // A: escreve 0-3, cursor A = 4   → ++++
write(fd2, "----", 4);   // A: escreve 4-7, cursor A = 8   → ++++----
lseek(fd1, 4, SEEK_SET); // cursor A = 4
write(fd3, "----", 4);   // B: escreve 0-3, cursor B = 4   → --------
write(fd2, "++++", 4);   // A: escreve 4-7                 → ----++++</pre>
  <div class="ana"><b>Analogia</b>Dois colegas a escrever no mesmo caderno com <b>um único marcador</b> (dup): o que um escreve empurra o marcador do outro. Um terceiro com <b>o seu próprio marcador</b> (outro open) escreve por cima do que lá estiver, a partir de onde o marcador dele está.</div>
  <p>O <code>lseek(fd, n, SEEK_SET)</code> põe o cursor em n; <code>SEEK_CUR</code> soma n à posição atual; <code>SEEK_END</code> conta a partir do fim. Mexe no cursor da <b>entrada</b>, por isso também afeta os dups.</p>
  <div class="trap">Escrever a meio de um ficheiro <b>sobrescreve</b>, não insere. E <code>read</code> também avança o cursor: depois de ler 1 byte, um <code>lseek(fd2, 2, SEEK_CUR)</code> num dup leva o cursor a 3.</div>`,
  key: 'dup e fork: mesmo cursor. Outro open: cursor próprio a partir de 0. Escrever no meio sobrescreve.' },

{ id: 'f-redir', t: 'fs', title: 'Redireção com close + dup (e o printf)',
  html: `<p>O <code>dup(fd)</code> devolve o <b>menor descritor livre</b>. Isso permite redirecionar:</p>
  <pre>int fd = open("out.txt", O_WRONLY|O_TRUNC);
close(1);      // o 1 (stdout) fica livre
dup(fd);       // o menor livre é o 1: agora 1 → out.txt
printf("ola"); // vai para out.txt</pre>
  <div class="ana"><b>Analogia</b>A tomada 1 da parede é onde o printf está sempre ligado. Tiras a ficha do ecrã (close(1)) e metes lá uma extensão para o ficheiro (dup). O printf nem sabe que mudou nada.</div>
  <p>Para ler de um ficheiro com scanf: <code>fd = open(…, O_RDONLY); close(0); dup(fd);</code>. Também existe <code>dup2(fd, 1)</code>, que faz as duas coisas de uma vez.</p>
  <p><b>Cuidado com o printf</b>: escreve primeiro para um <b>buffer</b> na memória do processo. O buffer só vai para o ficheiro com <code>fflush</code>, com uma mudança de linha (quando o stdout é um terminal) ou quando o processo termina. Com o stdout redirecionado para um ficheiro, só o fflush ou o fim do processo o esvaziam.</p>
  <pre>printf("SO2024/25"); fflush(stdout);   // ficheiro: SO2024/25, cursor 9
lseek(fd, 2, SEEK_SET);                // cursor partilhado com o 1 → 2
printf("**24/25!");                    // sai no fim do processo, na posição 2
// resultado: SO**24/25!</pre>
  <div class="trap">Fechar <code>fd</code> depois do dup não fecha o ficheiro: o descritor 1 ainda aponta para a mesma entrada.</div>`,
  key: 'close(1); dup(fd) → o stdout passa a ser o ficheiro. dup dá sempre o menor fd livre. O printf só sai com fflush ou no fim.' },

{ id: 'f-calls', t: 'fs', title: 'open, as flags e mkfifo',
  html: `<p><code>int open(const char *path, int flags, mode_t mode)</code> devolve um descritor (inteiro) ou −1.</p>
  <ul><li><b>Sempre</b>: o caminho e o modo de abertura (<code>O_RDONLY</code>, <code>O_WRONLY</code> ou <code>O_RDWR</code>).</li>
  <li><code>O_CREAT</code>: cria se não existir. Só aqui é preciso o 3.º argumento, as <b>permissões</b> (ex.: <code>S_IRUSR|S_IWUSR</code> ou <code>0644</code>).</li>
  <li><code>O_TRUNC</code>: põe o tamanho a 0 ao abrir.</li>
  <li><code>O_APPEND</code>: <b>cada write</b> vai para o fim, seja qual for o cursor.</li></ul>
  <div class="ana"><b>Analogia</b>Abrir um caderno: tens de dizer qual e se é para ler ou escrever. Se o caderno não existe e pedes para o criar, também dizes quem o pode usar. O_TRUNC é arrancar as folhas todas ao abrir; O_APPEND é escrever sempre na última página.</div>
  <p><code>mkfifo(path, mode)</code> cria um <b>FIFO</b> (pipe com nome) no sistema de ficheiros: precisa do caminho e das permissões, e <b>não abre nada</b> nem devolve um descritor. Depois cada processo faz <code>open</code> do FIFO.</p>
  <p>O descritor é só um índice na tabela do processo: <b>não</b> é a posição do cursor.</p>`,
  key: 'open: caminho + modo sempre; permissões só com O_CREAT. mkfifo: caminho + permissões, não abre.' },

{ id: 'f-alloc', t: 'fs', title: 'Organizar os blocos: contígua, CP/M, FAT, inodes e VFS',
  html: `<p>O disco está dividido em <b>blocos</b> de tamanho fixo. O sistema de ficheiros tem de saber que blocos são de cada ficheiro.</p>
  <div class="tbl-wrap"><table><tr><th>Organização</th><th>Como guarda a lista de blocos</th><th>Fragmentação</th></tr>
  <tr><td>Contígua</td><td>início + comprimento</td><td>externa (buracos entre ficheiros)</td></tr>
  <tr><td><b>CP/M</b></td><td>a entrada do diretório tem a lista de blocos do ficheiro</td><td>sem externa; interna no último bloco</td></tr>
  <tr><td><b>FAT</b></td><td>uma tabela com <b>uma entrada por bloco do disco</b>; cada entrada diz qual o bloco seguinte do ficheiro (lista ligada). O diretório guarda o 1.º bloco.</td><td>sem externa; os blocos podem estar espalhados</td></tr>
  <tr><td><b>ext2/3 (inodes)</b></td><td>cada ficheiro tem um inode com referências diretas e indiretas</td><td>sem externa; interna no último bloco</td></tr></table></div>
  <div class="ana"><b>Analogia FAT</b>Uma caça ao tesouro: o diretório diz-te onde está a primeira pista, e cada pista diz onde está a seguinte. A FAT é o quadro com todas as setas.</div>
  <p>Com blocos de tamanho fixo há sempre <b>fragmentação interna</b> (o último bloco fica meio vazio) e nunca externa.</p>
  <p>Organizar ficheiros em <b>diretórios</b> (árvore), em vez de uma lista única, serve sobretudo para <b>encontrar ficheiros por nome mais depressa</b> e permitir nomes iguais em sítios diferentes.</p>
  <p>O <b>VFS</b> (Virtual File System) do Linux põe uma interface única por cima de sistemas de ficheiros diferentes (ext3, FAT, NFS…): cada <b>superbloco</b> montado aponta para as funções desse tipo de sistema, e o núcleo chama-as sem saber os detalhes. Não é uma cache.</p>`,
  key: 'FAT: uma entrada por bloco, lista ligada. CP/M: lista de blocos no diretório. Blocos fixos: interna sim, externa não. VFS: interface comum.' },

{ id: 'f-inode', t: 'fs', title: 'O inode do ext3',
  html: `<p>O <b>inode</b> é o "BI" de um ficheiro: tipo, dono, permissões, tamanho, datas, número de hard links e as <b>referências para os blocos</b>. <b>Não</b> guarda o nome: o nome está no diretório, que é uma lista (nome → número de inode).</p>
  <p>O array <code>i_block</code> tem 15 entradas:</p>
  <ul><li><b>12 diretas</b>: apontam para blocos de dados.</li>
  <li><b>1 indireta simples</b>: aponta para um bloco cheio de referências.</li>
  <li><b>1 indireta dupla</b>: bloco de referências para blocos de referências.</li>
  <li><b>1 indireta tripla</b>: mais um nível.</li></ul>
  <div class="ana"><b>Analogia</b>Um índice de livro. Os 12 primeiros capítulos estão escritos na capa. Para o resto, a capa diz "ver a folha de índice X". Se o livro for enorme, a folha X lista outras folhas de índice.</div>
  <p>Um ficheiro pode ter <b>muito mais blocos</b> do que as 15 entradas: as indiretas multiplicam a capacidade. Cada ficheiro ou diretório gasta <b>um inode</b>, por isso o número de ficheiros possíveis é limitado pelo número de inodes. Um hard link é só mais uma entrada de diretório para o mesmo inode: <b>não gasta inode</b>, logo pode haver mais hard links do que inodes.</p>`,
  key: 'Inode: metadados + 12 diretas + indireta simples, dupla e tripla. Nome está no diretório. 1 inode por ficheiro; hard links não gastam inodes.' },

{ id: 'f-blocks', t: 'fs', title: 'Contar os blocos de referências (a conta do exame)',
  html: `<p>Sai em quase todos os exames: "quantos blocos de disco guardam referências para os blocos de um ficheiro de tamanho T?" (sem contar o inode).</p>
  <p><b>Método em 4 passos</b>:</p>
  <ul><li>1. <b>Blocos de dados</b>: N = ⌈T / tamanho do bloco⌉.</li>
  <li>2. <b>Referências por bloco</b>: R = tamanho do bloco / tamanho da referência (32 bits = 4 B; 64 bits = 8 B).</li>
  <li>3. Tira os <b>12 diretos</b> (estão no inode, custam 0 blocos). Se sobrar ≤ R, a indireta simples gasta <b>1 bloco</b>.</li>
  <li>4. Se ainda sobrar, a dupla gasta <b>1 bloco de 1.º nível + ⌈resto / R⌉ blocos</b>.</li></ul>
  <pre>Bloco 1 KB, refs de 32 bits, ficheiro 358 KB
N = 358 blocos;  R = 1024/4 = 256
358 − 12 = 346 → simples leva 256 → 1 bloco, sobram 90
dupla: 1 bloco + ⌈90/256⌉ = 1 + 1 = 2 blocos
total = 1 + 2 = 3 blocos</pre>
  <pre>Bloco 4 KB, refs de 4 B, ficheiro 20 MB
N = 20 MB / 4 KB = 5120;  R = 1024
5120 − 12 = 5108 → simples: 1 bloco, sobram 4084
dupla: 1 + ⌈4084/1024⌉ = 1 + 4 = 5
total = 6 blocos</pre>
  <div class="ana"><b>Analogia</b>Envelopes. Os 12 primeiros papéis cabem soltos na pasta. A partir daí, cada envelope leva R papéis; e se precisares de vários envelopes, metes-os todos num envelope maior (que também conta).</div>
  <div class="trap">Se N ≤ 12, a resposta é <b>0</b>, e é muitas vezes a opção "Nenhuma das anteriores". Confirma também se a pergunta diz KB ou MB e se a referência está em bits ou bytes.</div>`,
  key: 'N = T/bloco; R = bloco/ref. 12 diretos grátis; simples = 1 bloco; dupla = 1 + ⌈resto/R⌉.' },

{ id: 'f-links', t: 'fs', title: 'Hard links e links simbólicos',
  html: `<div class="tbl-wrap"><table><tr><th></th><th>Hard link</th><th>Link simbólico</th></tr>
  <tr><td>O que é</td><td>mais uma entrada de diretório para o <b>mesmo inode</b></td><td>um ficheiro pequeno cujo conteúdo é um <b>caminho</b></td></tr>
  <tr><td>Contador de links do inode</td><td>sobe 1</td><td>não muda</td></tr>
  <tr><td>Se apagares o original</td><td>o ficheiro continua acessível</td><td>o link fica "pendurado"</td></tr>
  <tr><td>Apagar o link</td><td>o ficheiro só desaparece se era o <b>último</b> link e ninguém o tem aberto</td><td>o ficheiro <b>nunca</b> é apagado</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Hard link: a mesma pessoa com dois nomes no registo civil; só deixa de existir quando os dois nomes forem riscados. Link simbólico: um papel com a morada de alguém; rasgar o papel não faz nada à pessoa.</div>
  <p>Apagar (<code>unlink</code>) tira um nome e baixa o contador. Os blocos só são libertados quando o contador chega a 0 <b>e</b> nenhum processo tem o ficheiro aberto: por isso o <code>exit</code> de um processo, ao fechar os ficheiros, pode ser o momento em que um ficheiro já sem nomes é finalmente apagado.</p>`,
  key: 'Hard link = outro nome para o mesmo inode (contador +1). Simbólico = caminho guardado num ficheiro. O ficheiro só vai quando contador = 0 e ninguém o tem aberto.' },
]);
