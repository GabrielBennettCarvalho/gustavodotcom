/* ===== SO questions: file systems (Grupo 1) ===== */
const FS_DUP_CODE = `fd1 = open("./test", O_RDWR | O_CREAT | O_TRUNC, S_IRUSR | S_IWUSR);
fd2 = dup(fd1);
fd3 = open("./test", O_RDWR);
write(fd1, "++++", 4);
write(fd2, "----", 4);
lseek(fd1, 4, SEEK_SET);
write(fd3, "----", 4);
write(fd2, "++++", 4);`;

STUDY.questions('so', [
/* --- nível 1 --- */
{ id: 'fs-01', t: 'fs', l: 1, les: 'f-path',
  q: 'Um processo abre um ficheiro com um caminho relativo (sem / no início). A partir de onde é resolvido esse caminho?',
  o: ['Do diretório corrente do processo', 'Da raiz do sistema de ficheiros', 'Do diretório onde está o executável', 'Da pasta pessoal do utilizador (~)'], a: 0,
  e: 'Caminhos relativos partem do **diretório corrente** do processo. Só os absolutos começam na raiz `/`.' },
{ id: 'fs-02', t: 'fs', l: 1, les: 'f-tables',
  q: 'No Unix, o que guarda cada entrada da tabela (global) de ficheiros abertos?',
  o: ['O cursor e o modo de abertura de um open', 'O nome e o caminho do ficheiro aberto', 'A lista dos blocos de dados do ficheiro', 'Um descritor para cada processo que existe'], a: 0,
  e: 'Cada `open` cria uma entrada com o **cursor** (posição atual), o modo de abertura e um ponteiro para o inode. Os blocos estão no inode; o nome está no diretório.' },
{ id: 'fs-03', t: 'fs', l: 1, les: 'f-tables',
  q: 'Que valor devolve a chamada open quando é bem sucedida?',
  o: ['O menor descritor livre do processo', 'O número do inode do ficheiro aberto', 'A posição inicial do cursor (0)', 'O tamanho atual do ficheiro'], a: 0,
  e: 'Devolve um **descritor**: um índice na tabela de descritores do processo, sempre o **menor livre**. É isto que permite redirecionar com `close(1); dup(fd)`.' },
{ id: 'fs-04', t: 'fs', l: 1, les: 'f-tables',
  q: 'Depois de `fd2 = dup(fd1)`, o que passam a partilhar fd1 e fd2?',
  o: ['A entrada de ficheiros abertos (e o cursor)', 'Só o inode, com cursores separados', 'Nada, porque o dup copia o ficheiro', 'O caminho do ficheiro, mas cada um com o seu inode'], a: 0,
  e: 'O dup cria outro descritor que aponta para a **mesma entrada** da tabela de ficheiros abertos. Logo, mesmo cursor: o que um escreve avança o outro.' },
{ id: 'fs-05', t: 'fs', l: 1, les: 'f-inode',
  q: 'Num sistema de ficheiros ext3, onde fica guardado o nome de um ficheiro?',
  o: ['Na entrada do diretório que o contém', 'No inode, junto com as permissões', 'No primeiro bloco de dados do ficheiro', 'No superbloco do sistema de ficheiros'], a: 0,
  e: 'O diretório é uma lista de pares (nome → número de inode). O inode tem tudo **menos** o nome, e é por isso que o mesmo inode pode ter vários nomes (hard links).' },
{ id: 'fs-06', t: 'fs', l: 1, les: 'f-inode',
  q: 'Quantas referências diretas para blocos de dados tem um inode do ext3?',
  o: ['12', '15', '10', '1'], a: 0,
  e: 'O array `i_block` tem 15 entradas: **12 diretas**, 1 indireta simples, 1 dupla e 1 tripla.' },
{ id: 'fs-07', t: 'fs', l: 1, les: 'f-links',
  q: 'O que é um link simbólico?',
  o: ['Um ficheiro cujo conteúdo é um caminho', 'Mais uma entrada de diretório para o inode', 'Uma cópia do ficheiro noutro diretório', 'Um descritor aberto guardado em disco'], a: 0,
  e: 'É um ficheiro pequeno que guarda o **caminho** do alvo. Mais uma entrada para o mesmo inode é um **hard link**.' },
{ id: 'fs-08', t: 'fs', l: 1, les: 'f-alloc',
  q: 'Num sistema de ficheiros FAT, como se descobre qual é o bloco seguinte de um ficheiro?',
  o: ['Na entrada da FAT do bloco atual', 'No inode, na referência seguinte', 'No fim do próprio bloco de dados', 'No diretório, que os lista todos'], a: 0,
  e: 'A FAT tem uma entrada por bloco do disco; a entrada de um bloco diz qual é o **seguinte** do ficheiro. Os blocos formam uma lista ligada; o diretório só guarda o primeiro.' },

/* --- nível 2 --- */
{ id: 'fs-10', t: 'fs', l: 2, les: 'f-path',
  q: 'O diretório corrente de um processo é `/home/ana/proj/src` e o processo abre `../../docs/a.txt`. Que ficheiro tenta abrir?',
  o: ['/home/ana/docs/a.txt', '/home/ana/proj/docs/a.txt', '/home/docs/a.txt', '/docs/a.txt'], a: 0,
  e: '`..` → /home/ana/proj; `..` → /home/ana; depois `docs/a.txt` → **/home/ana/docs/a.txt**.' },
{ id: 'fs-13', t: 'fs', l: 2, les: 'f-tables',
  q: 'Dois processos sem parentesco fazem, cada um, um open do mesmo ficheiro. Quantas entradas ficam na tabela de ficheiros abertos para esse ficheiro?',
  o: ['Duas, cada uma com o seu cursor', 'Uma, partilhada pelos dois processos', 'Nenhuma: só muda a tabela de inodes', 'Uma por cada bloco que forem lendo'], a: 0,
  e: 'Cada **open** cria uma entrada nova, com cursor próprio. As duas apontam para o mesmo inode. Só fork e dup fazem partilhar uma entrada.' },
{ id: 'fs-15', t: 'fs', l: 2, les: 'f-calls',
  q: 'Um ficheiro foi aberto com `O_WRONLY | O_APPEND`. O programa faz `lseek(fd, 0, SEEK_SET)` e depois um write. Onde ficam os bytes escritos?',
  o: ['No fim do ficheiro', 'No início, a sobrescrever', 'Na posição 0, a inserir', 'Em lado nenhum: o write falha'], a: 0,
  e: 'Com O_APPEND **cada write** vai para o fim, seja qual for o cursor. O lseek não tem efeito nas escritas.' },
{ id: 'fs-16', t: 'fs', l: 2, les: 'f-calls',
  q: 'Em que caso é obrigatório passar o 3.º argumento de open (as permissões, ex.: `S_IRUSR | S_IWUSR`)?',
  o: ['Quando se usa O_CREAT', 'Sempre que se abre para escrita', 'Quando se usa O_TRUNC', 'Só se o ficheiro já existe'], a: 0,
  e: 'As permissões só fazem sentido quando o ficheiro pode ser **criado**: com `O_CREAT`. Para abrir um ficheiro que já existe bastam o caminho e o modo.' },
{ id: 'fs-19', t: 'fs', l: 2, les: 'f-redir',
  q: 'Um processo tem abertos os descritores 0, 1, 2 e 3. Faz `close(1)` e depois `dup(3)`. Que número devolve o dup?',
  o: ['1', '4', '3', '0'], a: 0,
  e: 'O dup devolve sempre o **menor descritor livre**. Depois do close(1), é o **1**: o stdout passa a apontar para o ficheiro do 3.' },
{ id: 'fs-28', t: 'fs', l: 2, les: 'f-inode',
  q: 'Qual destas afirmações sobre os inodes do ext3 é verdadeira?',
  o: ['O nº de ficheiros possíveis é limitado pelo nº de inodes', 'O nº de hard links não pode passar o número de inodes', 'O inode guarda o nome do ficheiro e o caminho', 'Um ficheiro só tem tantos blocos como entradas no i_block'], a: 0,
  e: 'Cada ficheiro ou diretório gasta **um inode**. Os hard links não gastam inodes (podem ser mais), o nome está no diretório e as indiretas permitem muitos mais blocos do que as 15 entradas.' },
{ id: 'fs-31', t: 'fs', l: 2, les: 'f-links',
  q: 'O processo A tem um ficheiro aberto. O processo B faz unlink do único nome desse ficheiro. O que acontece aos blocos do ficheiro?',
  o: ['Só são libertados quando A o fechar', 'São libertados logo; o próximo read de A falha', 'Nada, porque o unlink falha com o ficheiro aberto', 'Ficam ocupados para sempre, sem nome'], a: 0,
  e: 'O contador de links chega a 0, mas A ainda tem o ficheiro aberto: os blocos só são libertados quando o **último** descritor for fechado (por close ou pelo exit de A).' },
{ id: 'fs-35', t: 'fs', l: 2, les: 'f-alloc',
  q: 'Qual destas afirmações sobre um sistema de ficheiros do tipo FAT é verdadeira?',
  o: ['Tem uma entrada por bloco do disco', 'Tem uma entrada por ficheiro do disco', 'Garante que cada ficheiro é contíguo', 'Guarda a lista de blocos num inode'], a: 0,
  e: 'A FAT tem **uma entrada por bloco**: a de cada bloco aponta para o seguinte do mesmo ficheiro (lista ligada). Os blocos podem estar espalhados.' },
{ id: 'fs-37', t: 'fs', l: 2, les: 'f-alloc',
  q: 'Num sistema de ficheiros com blocos de tamanho fixo (ext3, FAT, CP/M), que fragmentação existe?',
  o: ['Interna, no último bloco de cada ficheiro', 'Externa, entre os blocos de cada ficheiro', 'Interna e externa, em partes iguais', 'Nenhuma, porque os blocos são todos iguais'], a: 0,
  e: 'Qualquer bloco livre serve, logo **não há externa**. Mas o último bloco de um ficheiro fica quase sempre meio vazio: **interna**.' },
{ id: 'fs-40', t: 'fs', l: 2, les: 'f-blocks', calc: true,
  q: 'Ext3 com blocos de 1 KB e referências de 4 bytes. Quantos blocos de disco guardam referências para os blocos de um ficheiro de 10 KB (sem contar o inode)?',
  o: ['0', '1', '2', '10'], a: 0,
  e: '10 KB / 1 KB = 10 blocos de dados. Cabem nas **12 referências diretas** do inode: **0** blocos de referências.' },
{ id: 'fs-41', t: 'fs', l: 2, les: 'f-blocks', calc: true,
  q: 'Num ext3 com blocos de 4 KB e referências de 64 bits, quantas referências cabem num bloco de referências?',
  o: ['512', '1024', '64', '4096'], a: 0,
  e: '64 bits = 8 bytes. 4096 / 8 = **512** referências por bloco.' },
{ id: 'fs-50', t: 'fs', l: 2, les: 'f-blocks', calc: true,
  q: 'Ext3 com blocos de 1 KB e referências de 4 bytes. Usando só as referências diretas e a indireta simples, qual é o maior ficheiro possível?',
  o: ['268 KB', '256 KB', '12 KB', '524 KB'], a: 0,
  e: 'Diretas: 12 blocos. Indireta simples: 1024/4 = 256 blocos. (12 + 256) × 1 KB = **268 KB**.' },

/* --- nível 3: seguir código --- */
{ id: 'fs-20', t: 'fs', l: 3, les: 'f-dup', ex: 'out', code: FS_DUP_CODE,
  q: 'Considera o programa abaixo. Que conteúdo tem o ficheiro ./test imediatamente antes da execução do lseek?',
  o: ['++++----', '----', '++++', '----++++'], a: 0, src: 'Exame 2022/23, 1.ª época',
  e: 'fd1 e fd2 partilham a entrada (dup): o 1.º write escreve 0–3 e o 2.º continua em 4–7. Resultado **++++----**. O fd3 tem cursor próprio, mas ainda não escreveu.' },
{ id: 'fs-21', t: 'fs', l: 3, les: 'f-dup', ex: 'out', code: FS_DUP_CODE,
  q: 'Considera o programa abaixo. Que conteúdo tem o ficheiro ./test depois do último write?',
  o: ['----++++', '++++----', '--------', '++++++++'], a: 0, src: 'Exame 2022/23, 1.ª época',
  e: 'Antes do lseek: ++++----. lseek põe o cursor partilhado (fd1/fd2) em 4. fd3 tem cursor próprio em 0: escreve ---- em 0–3 → `--------`. fd2 escreve ++++ em 4–7 → **----++++**.' },
{ id: 'fs-22', t: 'fs', l: 3, les: 'f-dup', ex: 'out',
  code: `fd1 = open("f", O_RDWR | O_CREAT | O_TRUNC, 0644);
fd2 = open("f", O_RDWR);
write(fd1, "AAAA", 4);
write(fd2, "BB", 2);
write(fd1, "C", 1);`,
  q: 'O ficheiro f é criado vazio pelo programa abaixo. Que conteúdo tem no fim?',
  o: ['BBAAC', 'AAAABBC', 'BBC', 'AABBC'], a: 0,
  e: 'Dois opens = dois cursores. fd1 escreve AAAA (0–3, cursor 4). fd2 escreve BB em 0–1 (sobrescreve) → BBAA. fd1 escreve C na posição 4 → **BBAAC**.',
  w: { 1: 'Isso seria se fd2 partilhasse o cursor de fd1 (como com dup). Dois opens têm cursores separados.' } },
{ id: 'fs-26', t: 'fs', l: 3, les: 'f-redir', ex: 'out',
  code: `int fd = open("/tmp/x.txt", O_WRONLY | O_TRUNC);
close(STDOUT_FILENO);
dup(fd);
printf("ABCDEF");
fflush(stdout);
lseek(fd, 0, SEEK_SET);
printf("xy");
fflush(stdout);
close(fd);`,
  q: 'O ficheiro /tmp/x.txt existe e tem permissão de escrita. Que conteúdo tem depois de correr o programa abaixo?',
  o: ['xyCDEF', 'ABCDEFxy', 'xy', 'ABCDxy'], a: 0,
  e: 'O stdout (1) passa a ser o ficheiro e **partilha o cursor** com fd. Depois de ABCDEF o cursor está em 6; o lseek(fd) põe-no em 0 também para o 1; xy sobrescreve as posições 0–1 → **xyCDEF**.' },
{ id: 'fs-27', t: 'fs', l: 3, les: 'f-dup', ex: 'out',
  code: `// /tmp/n.txt contém exatamente: 0123456789
int fd1 = open("/tmp/n.txt", O_RDONLY);
int fd2 = dup(fd1);
int fd3 = open("/tmp/n.txt", O_RDONLY);
char a, b, c, d;
read(fd1, &a, 1);
read(fd2, &b, 1);
lseek(fd3, 5, SEEK_SET);
read(fd1, &c, 1);
read(fd3, &d, 1);
printf("%c %c %c %c\\n", a, b, c, d);`,
  q: 'Que output produz o programa abaixo?',
  o: ['0 1 2 5', '0 0 5 6', '0 1 5 6', '0 0 0 5'], a: 0,
  e: 'fd1 e fd2 partilham o cursor: a = 0, b = 1, cursor em 2. O lseek mexe só no cursor do fd3 (outro open). c = **2**, d = **5**.' },
{ id: 'fs-47', t: 'fs', l: 3, les: 'f-blocks', calc: true,
  q: 'Ext3 com blocos de 1 KB e referências de 4 bytes. Quantos blocos de disco guardam referências para os blocos de um ficheiro de 300 KB (sem contar o inode)?',
  o: ['3', '2', '1', '4'], a: 0,
  e: '300 blocos. R = 256. 300 − 12 = 288 → simples (1 bloco) leva 256, sobram 32 → dupla: 1 + ⌈32/256⌉ = 2. Total **3**.' },
{ id: 'fs-48', t: 'fs', l: 3, les: 'f-blocks', calc: true,
  q: 'Ext3 com blocos de 2 KB e referências de 8 bytes. Quantos blocos de disco guardam referências para os blocos de um ficheiro de 1 MB (sem contar o inode)?',
  o: ['3', '2', '4', '1'], a: 0,
  e: '1 MB / 2 KB = 512 blocos. R = 2048/8 = 256. 512 − 12 = 500 → simples: 1 bloco (256), sobram 244 → dupla: 1 + 1 = 2. Total **3**.' },
{ id: 'fs-49', t: 'fs', l: 3, les: 'f-blocks', calc: true,
  q: 'Ext3 com blocos de 4 KB e referências de 4 bytes. Quantos blocos de disco guardam referências para os blocos de um ficheiro de 4 MB (sem contar o inode)?',
  o: ['1', '2', '0', '1024'], a: 0,
  e: '4 MB / 4 KB = 1024 blocos. R = 1024. 1024 − 12 = 1012 ≤ 1024 → só a indireta simples: **1** bloco.' },

/* --- nível 4: perguntas de exame --- */
{ id: 'fs-11', t: 'fs', l: 4, les: 'f-path', src: 'Exame 2022/23, 1.ª época',
  q: 'O diretório corrente de um processo é `/home/joao/SO` e o processo executa `open(fd, "./../../luis/ASA/README.txt")`. Qual é o nome absoluto do ficheiro que tenta abrir?',
  o: ['/home/luis/ASA/README.txt', '/home/joao/SO/luis/ASA/README.txt', '/home/joao/luis/ASA/README.txt', '/luis/ASA/README.txt'], a: 0,
  e: '`.` fica em /home/joao/SO; `..` → /home/joao; `..` → /home; e depois luis/ASA/README.txt → **/home/luis/ASA/README.txt**.' },
{ id: 'fs-12', t: 'fs', l: 4, les: 'f-path', src: 'Exame 2023/24, 1.ª época',
  q: 'O diretório corrente de um processo é `/home/maria/SO` e o processo executa `open(fd, "../../../usr/tmp/fifo.txt")`. Em que diretório tem de existir fifo.txt para o open funcionar?',
  o: ['/usr/tmp', '/home/maria/tmp', '/tmp', '/home/usr/tmp'], a: 0,
  e: 'Três `..` a partir de /home/maria/SO: /home/maria → /home → **/**. Depois usr/tmp → **/usr/tmp**.' },
{ id: 'fs-14', t: 'fs', l: 4, les: 'f-tables', src: 'Exame 2022/23, 2.ª época',
  q: 'É possível que uma mesma entrada da tabela global de ficheiros abertos seja referenciada por processos diferentes?',
  o: ['Sim, por herança através de fork()', 'Sim, através de dup() no mesmo processo', 'Sim, se dois processos fizerem open do mesmo ficheiro', 'Nunca: cada entrada pertence a um só processo'], a: 0,
  e: 'O filho herda a tabela de descritores do pai, que aponta para as **mesmas entradas**. O dup partilha dentro do mesmo processo; dois opens criam duas entradas.' },
{ id: 'fs-17', t: 'fs', l: 4, les: 'f-calls', src: 'Exame 2023/24, 2.ª época',
  q: 'Qual das seguintes afirmações sobre a chamada de sistema open é verdadeira?',
  o: ['Precisa do caminho e do modo de abertura', 'Precisa sempre do caminho e das permissões', 'Abre um pipe para leitura síncrona', 'Devolve um inteiro que é a posição do cursor'], a: 0,
  e: 'Caminho e modo (`O_RDONLY`…) são sempre precisos. As permissões só com O_CREAT. O valor devolvido é um descritor, não o cursor.' },
{ id: 'fs-18', t: 'fs', l: 4, les: 'f-calls', src: 'Exame 2024/25, 1.ª época',
  q: 'Qual das seguintes afirmações sobre a chamada de sistema mkfifo é verdadeira?',
  o: ['Precisa sempre do caminho e das permissões', 'Abre um pipe para leitura síncrona', 'Precisa do caminho e do modo de abertura (O_RDONLY…)', 'Devolve o descritor do FIFO já aberto'], a: 0,
  e: '`mkfifo(path, mode)`: caminho e **permissões**. Só cria o FIFO no sistema de ficheiros; para o usar, cada processo faz open.' },
{ id: 'fs-23', t: 'fs', l: 4, les: 'f-redir', src: 'Exame 2023/24, 2.ª época',
  code: `// /tmp/a.exe tem 2 KB; ext3 com blocos de 512 bytes
#define BUFFSZ 1024
char buff[BUFFSZ];
memset(buff, 'a', BUFFSZ);
int fd = open("/tmp/a.exe", O_RDWR | O_APPEND);
close(STDOUT_FILENO);
dup(fd);
close(fd);
write(STDOUT_FILENO, buff, BUFFSZ);`,
  q: 'Depois de correr o código abaixo, que alteração se verifica no ficheiro /tmp/a.exe?',
  o: ['O tamanho do ficheiro passa a 3 KB', 'A hora de criação passa a ser a atual', 'O ficheiro passa a ocupar 2 blocos', 'Não se pode escrever num executável'], a: 0,
  e: 'O 1 passa a apontar para o ficheiro (aberto em append). Fechar fd não o fecha: o 1 continua lá. O write acrescenta 1 KB no fim → **3 KB** (6 blocos de 512 B). Ser ".exe" não muda nada.' },
{ id: 'fs-24', t: 'fs', l: 4, les: 'f-redir', src: 'Exame 2024/25, 1.ª época',
  code: `// /tmp/a.exe (permissões -rw-rw-rw-) tem 2 KB; ext3 com blocos de 1024 bytes
#define BUFFSZ 1024
char buff[BUFFSZ];
memset(buff, '\\0', BUFFSZ);
int fd = open("/tmp/a.exe", O_WRONLY | O_TRUNC);
close(STDOUT_FILENO);
dup(fd);
write(STDOUT_FILENO, buff, BUFFSZ);
close(fd);`,
  q: 'Depois de correr o código abaixo, qual destas afirmações sobre /tmp/a.exe e o descritor fd é verdadeira?',
  o: ['O tamanho do ficheiro continua a ser 2 KB', 'O open falha: O_WRONLY e O_TRUNC são incompatíveis', 'O ficheiro fica a ocupar 3 blocos de 1 KB', 'O cursor de fd está em 1024 antes do close'], a: 3,
  e: 'O_TRUNC põe o ficheiro a 0. O write pelo 1 (que partilha a entrada com fd) escreve 1024 bytes: tamanho 1 KB, 1 bloco. O cursor partilhado fica em **1024**.' },
{ id: 'fs-25', t: 'fs', l: 4, les: 'f-redir', ex: 'out', src: 'Exame 2024/25, 2.ª época',
  code: `// /tmp/a.txt existe e tem permissão de escrita
int fd = open("/tmp/a.txt", O_WRONLY | O_TRUNC);
close(STDOUT_FILENO);
dup(fd);
printf("SO2024/25");
fflush(stdout);
lseek(fd, 2, SEEK_SET);
printf("**24/25!");
close(fd);`,
  q: 'Qual é o conteúdo de /tmp/a.txt depois de correr o programa abaixo?',
  o: ['SO**24/25!', '**24/25!', 'SO2024/25**24/25!', 'SO**24/25'], a: 0,
  e: 'SO2024/25 vai para o ficheiro (fflush). lseek(fd, 2) mexe no cursor partilhado com o 1. O 2.º printf fica no buffer e sai no fim do processo (o close(fd) não fecha o 1), na posição 2, a sobrescrever: `SO**24/25!`.' },
{ id: 'fs-29', t: 'fs', l: 4, les: 'f-inode', src: 'Exame 2023/24, 2.ª época',
  q: 'Qual destas afirmações acerca dos inodes no ext3 é **falsa**?',
  o: ['Um ficheiro tem tantos blocos como entradas diretas no inode', 'Podem existir mais hard links do que inodes', 'Os inodes guardam as permissões do ficheiro', 'O número de ficheiros e diretórios não pode passar o número de inodes'], a: 0,
  e: 'As indiretas permitem muitos mais blocos do que as 12 diretas. As outras três são verdadeiras: hard links não gastam inodes, e cada ficheiro ou diretório gasta um.' },
{ id: 'fs-30', t: 'fs', l: 4, les: 'f-links', src: 'Exame 2022/23, 2.ª época',
  q: 'Qual das seguintes afirmações sobre links é verdadeira?',
  o: ['Apagar um symlink nunca apaga o ficheiro', 'Apagar um hard link apaga sempre o ficheiro', 'Apagar um hard link nunca apaga o ficheiro', 'Nenhuma das anteriores'], a: 0,
  e: 'O link simbólico é só um caminho: apagá-lo não toca no alvo. Apagar um hard link apaga o ficheiro **só se** for o último e ninguém o tiver aberto (nem sempre, nem nunca).' },
{ id: 'fs-32', t: 'fs', l: 4, les: 'f-alloc', src: 'Exame 2022/23, 1.ª época',
  q: 'Qual é a principal vantagem de organizar um sistema de ficheiros em diretórios (árvore), em vez de uma lista única de ficheiros?',
  o: ['Acelera a procura de ficheiros pelo nome', 'Reduz o tamanho dos metadados guardados em disco', 'Permite evitar a fragmentação externa', 'Nenhuma das anteriores'], a: 0,
  e: 'Com diretórios procura-se só no ramo certo, em vez de percorrer todos os ficheiros. Também permite nomes iguais em diretórios diferentes.' },
{ id: 'fs-33', t: 'fs', l: 4, les: 'f-alloc', src: 'Exame 2022/23, 2.ª época',
  q: 'Qual das seguintes afirmações acerca do Virtual File System (VFS) do Linux é verdadeira?',
  o: ['O superbloco aponta para as funções de cada tipo de FS', 'O objetivo principal do VFS é reduzir a latência com cache', 'O superbloco diz onde estão os inodes de todos os FS montados', 'O VFS só aceita sistemas Unix e Linux, nunca FAT'], a: 0,
  e: 'O VFS é uma interface comum. Cada sistema de ficheiros montado tem um superbloco que aponta para as **funções desse tipo** (ext3, FAT, NFS…), que o núcleo chama sem saber os detalhes.' },
{ id: 'fs-34', t: 'fs', l: 4, les: 'f-alloc', src: 'Exame 2024/25, 2.ª época',
  q: 'Qual destas afirmações acerca do sistema de ficheiros do CP/M é verdadeira?',
  o: ['Evita a fragmentação externa', 'Evita a fragmentação interna', 'Guarda a lista de blocos num inode apontado pelo diretório', 'Organiza os dados em segmentos de tamanho variável'], a: 0,
  e: 'O CP/M usa blocos de tamanho fixo, com a lista de blocos na própria entrada do diretório. Qualquer bloco livre serve: **sem fragmentação externa** (mas com interna no último bloco).' },
{ id: 'fs-36', t: 'fs', l: 4, les: 'f-dup', src: 'Exame 2023/24, 1.ª época',
  q: 'Qual das seguintes afirmações sobre a chamada de sistema dup é verdadeira?',
  o: ['Dá outro descritor que partilha o cursor', 'Dá outro descritor com um cursor separado', 'Cria uma cópia do ficheiro no mesmo diretório', 'Lê dados do standard input'], a: 0,
  e: 'O dup devolve um novo descritor para a **mesma entrada** de ficheiros abertos: o cursor é partilhado.' },
{ id: 'fs-42', t: 'fs', l: 4, les: 'f-blocks', calc: true, src: 'Exame 2022/23, 2.ª época',
  q: 'No ext3, com blocos de 1 KB e referências de 32 bits, quantos blocos de disco são usados para guardar as referências para os blocos de um ficheiro de 358 KB (sem contar o inode)?',
  o: ['3', '2', '1', '0'], a: 0,
  e: '358 blocos; R = 1024/4 = 256. 358 − 12 = 346 → simples: 1 bloco, sobram 90 → dupla: 1 + ⌈90/256⌉ = 2. Total **3**.' },
{ id: 'fs-43', t: 'fs', l: 4, les: 'f-blocks', calc: true, src: 'Exame 2023/24, 1.ª época',
  q: 'No ext3, com blocos de 4 KB e referências de 64 bits, quantos blocos de disco são usados para guardar as referências para os blocos de um ficheiro de 704 KB (sem contar o inode)?',
  o: ['1', '2', '3', '4'], a: 0,
  e: '704/4 = 176 blocos; R = 4096/8 = 512. 176 − 12 = 164 ≤ 512 → só a indireta simples: **1**. (No exame a resposta certa era "Nenhuma das anteriores".)' },
{ id: 'fs-44', t: 'fs', l: 4, les: 'f-blocks', calc: true, src: 'Exame 2023/24, 2.ª época',
  q: 'No ext3, com blocos de 8 KB e referências de 32 bits, quantos blocos de disco são usados para guardar as referências para os blocos de um ficheiro de 64 KB (sem contar o inode)?',
  o: ['0', '1', '2', '8'], a: 0,
  e: '64/8 = 8 blocos de dados: cabem nas 12 diretas. **0** blocos de referências.' },
{ id: 'fs-45', t: 'fs', l: 4, les: 'f-blocks', calc: true, src: 'Exame 2024/25, 1.ª época',
  q: 'No ext3, com blocos de dados de 1 KB e referências de 64 bits, quantos blocos de disco são usados para guardar as referências para os blocos de um ficheiro de 113 KB (sem contar o inode)?',
  o: ['1', '0', '2', '3'], a: 0,
  e: '113 blocos; R = 1024/8 = 128. 113 − 12 = 101 ≤ 128 → **1** bloco (indireta simples).' },
{ id: 'fs-46', t: 'fs', l: 4, les: 'f-blocks', calc: true, src: 'Exame 2024/25, 2.ª época',
  q: 'No ext3, com blocos de dados de 1 KB e referências de 64 bits, quantos blocos de disco são usados para guardar as referências para os blocos de um ficheiro de 12 KB (sem contar o inode)?',
  o: ['0', '1', '12', '2'], a: 0,
  e: '12 blocos de dados = exatamente as 12 referências diretas do inode. **0**.' },
]);
