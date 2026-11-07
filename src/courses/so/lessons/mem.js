/* ===== SO lessons: memory management (Grupo 7) ===== */
STUDY.lessons('so', [
{ id: 'v-why', t: 'mem', title: 'Endereços virtuais: cada processo com o seu mundo',
  html: `<p>Os programas usam <b>endereços virtuais</b>. A <b>MMU</b> (hardware, no processador) traduz cada um para um <b>endereço físico</b> na RAM, em todos os acessos, usando as tabelas que o núcleo preparou para esse processo.</p>
  <div class="ana"><b>Analogia</b>Moradas internas de condomínios. "Bloco 3, porta 24" existe em muitos condomínios diferentes e leva a casas diferentes. O mesmo endereço virtual em dois processos leva a sítios físicos diferentes, porque cada processo tem a sua tabela (o seu mapa do condomínio).</div>
  <ul><li>Dois processos com o <b>mesmo endereço virtual</b> não é erro nenhum: cada um tem a sua tabela de páginas.</li>
  <li>Ao comutar de processo, o núcleo muda o registo da MMU que aponta para a tabela de páginas e a <b>TLB</b> é invalidada (ou as entradas são etiquetadas por processo).</li>
  <li>O <b>núcleo não traduz endereços</b>: só é chamado quando a tradução falha (falta de página, acesso inválido, proteção).</li></ul>
  <p>Vantagens: <b>isolamento</b> (um processo não vê a memória do outro), programas maiores do que a RAM (as páginas que não cabem ficam em disco) e partilha controlada (código, copy-on-write).</p>`,
  key: 'A MMU traduz em hardware, em cada acesso. Cada processo tem a sua tabela: o mesmo endereço virtual é normal. O núcleo só entra quando a tradução falha.' },

{ id: 'v-page', t: 'mem', title: 'Paginação: página, trama e deslocamento',
  html: `<p>A memória virtual é dividida em <b>páginas</b> de tamanho fixo e a física em <b>tramas</b> (molduras) do mesmo tamanho. Um endereço virtual parte-se em dois:</p>
  <pre>| número de página (bits de cima) | deslocamento (bits de baixo) |</pre>
  <ul><li><b>Tamanho da página = 2<sup>bits do deslocamento</sup></b>. 12 bits → 4 KB; 11 → 2 KB; 10 → 1 KB; 14 → 16 KB; 8 → 256 B.</li>
  <li><b>Entradas da tabela de páginas = 2<sup>bits da página</sup></b>. 32 bits com 12 de deslocamento → 2<sup>20</sup> entradas.</li>
  <li>O deslocamento <b>não é traduzido</b>: passa igual para o endereço físico.</li></ul>
  <div class="ana"><b>Analogia</b>Um livro e uma estante. O número da página diz em que prateleira (trama) está essa folha; a linha dentro da folha (deslocamento) é a mesma onde quer que a folha esteja guardada.</div>
  <p><b>Em hexadecimal</b>, cada dígito são 4 bits: com 12 bits de deslocamento, os <b>3 últimos dígitos</b> são o deslocamento; com 8 bits, os 2 últimos. <code>0x00002C65</code> com páginas de 4 KB → página <code>0x00002</code>, deslocamento <code>0xC65</code>.</p>
  <p><b>Fragmentação</b>: como tudo é dado em páginas inteiras, há <b>fragmentação interna</b> (a última página de cada região fica meio vazia) e <b>não há externa</b> (qualquer trama livre serve). Páginas maiores → mais fragmentação interna e faltas de página mais lentas (há mais para trazer do disco), mas tabelas mais pequenas. Podem coexistir páginas de tamanhos diferentes (páginas enormes em Linux).</p>`,
  key: 'Página = 2^deslocamento bytes. Entradas = 2^bits de página. Deslocamento passa igual. Paginação: interna sim, externa não.' },

{ id: 'v-pte', t: 'mem', title: 'A entrada da tabela de páginas e as três exceções',
  html: `<p>Cada entrada (PTE) tem: o bit <b>presente</b>, a <b>base</b> (número da trama), as <b>proteções</b> (r, w, x) e bits como modificado e referenciado.</p>
  <div class="tbl-wrap"><table><tr><th>Situação</th><th>Resultado</th><th>Quem trata</th></tr>
  <tr><td>A página <b>não existe</b> na tabela (fora das regiões do processo)</td><td><b>Acesso inválido</b> → SIGSEGV</td><td>núcleo, que envia o signal</td></tr>
  <tr><td>Existe mas <b>presente = N</b></td><td><b>Falta de página</b>: o núcleo arranja uma trama, traz a página do disco, põe presente = S e repete o acesso</td><td>núcleo</td></tr>
  <tr><td>Existe, presente, mas o acesso não é permitido (escrever em r-x, executar em rw-)</td><td><b>Violação de proteção</b> → acesso inválido</td><td>núcleo</td></tr>
  <tr><td>Tudo bem</td><td>endereço físico = base ‖ deslocamento</td><td>MMU, sem núcleo</td></tr></table></div>
  <div class="ana"><b>Analogia</b>Um cacifo numerado. Cacifo que nem existe: inválido. Cacifo que existe mas está vazio porque o conteúdo foi para o armazém: falta de página (vão buscá-lo). Cacifo com cadeado de "só ver": tentar meter lá coisas é violação de proteção.</div>
  <p><b>Quantos bits sobram numa PTE?</b> Se a PTE tem 64 bits e a base (número de trama) ocupa k bits, sobram 64 − k para presente, proteções, etc. Com endereços físicos de 36 bits e páginas de 16 KB (14 bits), a trama tem 22 bits e sobram 42.</p>`,
  key: 'Não existe → inválido. Não presente → falta de página. Acesso proibido → proteção. Senão físico = base seguida do deslocamento.' },

{ id: 'v-tlb', t: 'mem', title: 'A TLB e a tabela do exame',
  html: `<p>Ler a tabela de páginas a cada acesso duplicaria os acessos à RAM. A <b>TLB</b> é uma pequena cache, dentro da MMU, com as traduções usadas há pouco (página → trama + proteções + validade).</p>
  <ul><li><b>TLB hit</b>: tradução imediata, <b>0</b> acessos extra. Se há hit, a página está garantidamente em RAM.</li>
  <li><b>TLB miss</b>: lê-se a tabela (1 acesso extra por nível) e a entrada é carregada na TLB.</li>
  <li>Entradas com validade N na TLB não contam: é como se não estivessem lá.</li></ul>
  <div class="ana"><b>Analogia</b>A TLB é o post-it com os números que usas mais, colado ao telefone. A tabela de páginas é a lista telefónica na gaveta. Só vais à gaveta quando o número não está no post-it, e depois escreve-lo no post-it.</div>
  <p><b>A tabela do exame, linha a linha</b>:</p>
  <pre>Tabela: 0→0x20000 r-x S | 1→— r-x N | 2→0xAA100 r-x S | 3→0xFE74B rw- S
Páginas de 4 KB (3 dígitos hex de deslocamento). TLB tem 0 e 2.

0x000008A2 exec  → pág 0, TLB hit, 0x200008A2, sem exceção
0x0000209C read  → pág 2, TLB hit, 0xAA10009C
0x00004FFA write → pág 4 não existe: acesso inválido
0x00002CBF write → pág 2 é r-x: violação de proteção
0x00001980 read  → pág 1 não presente: falta de página
                   → nova trama (ex. 0x00300) → 0x00300980</pre>
  <p><b>Overhead</b>: com uma sequência de acessos, conta os misses (as páginas diferentes, se a TLB não enche). Overhead = acessos extra ÷ acessos. 10 acessos a 3 páginas distintas, 1 nível: 3/10 = 30%; com 2 níveis: 6/10 = 60%.</p>
  <div class="trap">Depois de uma falta de página ou de um miss, a página entra na TLB: o acesso seguinte a essa página é <b>hit</b>. E ao <b>mudar de processo</b> a TLB é limpa: o primeiro acesso do outro processo é miss, mesmo à mesma página virtual.</div>`,
  key: 'Hit = 0 acessos extra; miss = 1 por nível. Depois do miss a página fica na TLB. Mudar de processo limpa a TLB.' },

{ id: 'v-multi', t: 'mem', title: 'Paginação em vários níveis',
  html: `<p>Com 32 bits e páginas de 4 KB, uma tabela de um nível tem 2<sup>20</sup> entradas para cada processo, mesmo que use pouca memória. A solução é partir o número de página em vários índices:</p>
  <pre>| índice nível 1 (10) | índice nível 2 (10) | deslocamento (12) |</pre>
  <ul><li>A tabela de 1.º nível diz onde está cada tabela de 2.º nível; as de 2.º nível dizem onde estão as tramas.</li>
  <li>As tabelas de 2.º nível de regiões não usadas <b>nem existem</b>: poupa-se memória.</li>
  <li>Preço: num <b>TLB miss</b> são precisos <b>tantos acessos extra quantos os níveis</b>.</li></ul>
  <div class="ana"><b>Analogia</b>Uma morada com distrito e rua, em vez de uma lista com todas as ruas do país. Não precisas de uma página para cada rua de um distrito onde nunca vais, mas para encontrar uma rua consultas dois índices.</div>
  <p><b>Quantos bits por nível?</b> Cada tabela costuma ocupar exatamente uma página. Entradas por página = tamanho da página ÷ tamanho da PTE.</p>
  <pre>30 bits, páginas de 4 KB (12 bits), PTE de 8 bytes
entradas por página = 4096 / 8 = 512 = 2^9 → 9 bits por nível
página tem 30 − 12 = 18 bits → 2 níveis de 9 bits
1.º nível: 9 bits</pre>`,
  key: 'Bits por nível = log2(tamanho da página / tamanho da PTE). Cada nível custa um acesso extra num TLB miss.' },

{ id: 'v-seg', t: 'mem', title: 'Segmentação',
  html: `<p>Em vez de páginas iguais, a memória do processo é dividida em <b>segmentos</b> lógicos de tamanho variável (código, dados, pilha). O endereço é <b>(segmento, deslocamento)</b> e a tabela de segmentos tem, para cada um, a <b>base</b> e o <b>limite</b>.</p>
  <pre>endereço físico = base[seg] + deslocamento   (se deslocamento &lt; limite; senão, acesso inválido)</pre>
  <ul><li>Cada segmento ocupa uma <b>zona contígua</b> de memória física.</li>
  <li>Como os segmentos têm o tamanho certo, não há fragmentação interna, mas há <b>fragmentação externa</b> (buracos entre segmentos). Em relação à paginação, troca-se um risco pelo outro.</li>
  <li><b>Tamanho máximo de um segmento</b> = 2<sup>bits do deslocamento</sup>. <b>Número de segmentos</b> = 2<sup>bits do segmento</sup>.</li>
  <li>Os CPUs têm registos com a base e o limite do segmento em uso; o núcleo não é chamado em cada acesso a um segmento diferente.</li></ul>
  <div class="ana"><b>Analogia</b>Arrumar móveis num armazém: cada móvel ocupa um espaço contínuo do tamanho dele. Não se desperdiça espaço dentro de cada lugar, mas ficam buracos entre móveis onde nada de grande cabe.</div>
  <pre>Endereços de 8 bits: 2 de segmento, 6 de deslocamento; entrada de 2 bytes
tamanho máx. de um segmento = 2^6 = 64 bytes
segmentos por tabela = 2^2 = 4
2 processos: 2 × 4 × 2 B = 16 bytes de tabelas</pre>`,
  key: 'Segmento = base + limite, contíguo. Externa sim, interna não. Tamanho máx = 2^deslocamento; nº de segmentos = 2^bits de segmento.' },

{ id: 'v-cow', t: 'mem', title: 'fork e copy-on-write',
  html: `<p>Copiar toda a memória no fork seria lento (e inútil se o filho fizer logo exec). Com <b>copy-on-write</b>:</p>
  <ul><li>O filho recebe uma <b>cópia da tabela de páginas</b>: as mesmas tramas que o pai.</li>
  <li>Páginas só de leitura (código, <code>r-x</code>) ficam simplesmente partilhadas.</li>
  <li>Páginas que podiam ser escritas ficam, <b>nos dois processos</b>, marcadas como só de leitura e <b>COW</b>.</li>
  <li>Quando um deles <b>escreve</b> numa página COW: exceção de proteção → o núcleo copia a página para uma <b>trama nova</b>, dá-a a quem escreveu com escrita permitida, e o acesso repete-se.</li></ul>
  <div class="ana"><b>Analogia</b>Dois colegas a estudar pelos mesmos apontamentos. Enquanto só leem, partilham a mesma folha. Quando um quer sublinhar, tira primeiro uma fotocópia e sublinha a sua.</div>
  <pre>Antes do fork (pai):      pág 0x10 → trama 0x01  R-X
                          pág 0x20 → trama 0x02  RW- (pilha)
Filho logo depois do fork: 0x10 → 0x01 R-X  |  0x20 → 0x02 R-- C
Filho depois de x += 1:    0x10 → 0x01 R-X  |  0x20 → nova trama RW-</pre>
  <p>O número da página virtual <b>não muda</b>; o que muda é a trama (base) e as proteções.</p>`,
  key: 'Depois do fork as páginas graváveis ficam só-leitura + COW nos dois. Na primeira escrita, quem escreve recebe uma trama nova com RW.' },
]);
