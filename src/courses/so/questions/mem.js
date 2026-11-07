/* ===== SO questions: memory management (Grupo 7) ===== */
// Tables for the "be the MMU" questions. Each question shows the tables and the full list of accesses.
const ME_T1 = { tbls: [
  { cap: 'Tabela de páginas', h: ['Página', 'Base', 'Prot.', 'Presente'], r: [['0x00000', '0x10000', 'r-x', 'S'], ['0x00001', '0x11000', 'rw-', 'S'], ['0x00002', '—', 'rw-', 'N'], ['0x00003', '0x05000', 'r--', 'S']] } ] };
const ME_T1_SEQ = `Páginas de 4 KB, endereços de 32 bits. TLB vazia no início (16 entradas).
Novas tramas: o núcleo usa a trama 0x20000.
1. 0x00000123  executar
2. 0x00001ABC  escrever
3. 0x00000FFF  ler
4. 0x00002010  escrever
5. 0x00003004  escrever
6. 0x00005000  ler
7. 0x00002FF0  ler`;
const ME_T22 = { tbls: [
  { cap: 'Tabela de páginas', h: ['Pres.', 'Página', 'Base', 'Prot.'], r: [['S', '00000', '20000', 'r-x'], ['S', '00001', '01C00', 'r-x'], ['N', '00002', '—', 'rw-'], ['S', '00003', '00100', 'rw-']] },
  { cap: 'TLB', h: ['Válida', 'Página', 'Base', 'Prot.'], r: [['S', '00001', '01C00', 'r-x'], ['N', '00120', '20000', 'r-x'], ['S', '00000', '20000', 'r-x'], ['S', '00003', '00100', 'rw-']] } ] };
const ME_T22_SEQ = `Endereços virtuais de 32 bits, páginas de 4 KB. Novas tramas: 0x00300.
1. 00000100  execução
2. 00002150  escrita
3. 00002120  escrita
4. 00004150  execução
5. 00002010  leitura
6. 00001000  escrita`;
const ME_T23 = { tbls: [
  { cap: 'Tabela de páginas', h: ['Pres.', 'Página', 'Base', 'Prot.'], r: [['S', '00000', '20000', 'r-x'], ['N', '00001', '—', 'r-x'], ['S', '00002', 'AA100', 'r-x'], ['N', '00003', 'FE74B', 'rw-']] },
  { cap: 'TLB', h: ['Válida', 'Página', 'Base', 'Prot.'], r: [['S', '00002', 'AA100', 'r-x'], ['N', '00040', '5B000', 'r-x'], ['S', '00000', '20000', 'r-x'], ['S', '00003', 'FE74B', 'rw-']] } ] };
const ME_T23_SEQ = `Endereços virtuais de 32 bits, páginas de 4 KB. Novas tramas: 0x00300.
1. 000008A2  execução
2. 0000209C  leitura
3. 00002C65  leitura
4. 00004FFA  escrita
5. 00002CBF  escrita
6. 00001980  leitura`;
const ME_T24 = { tbls: [
  { cap: 'Tabela de páginas', h: ['Página', 'Base', 'Prot.', 'Presente'], r: [['0', '0x10', 'r-x', 'S'], ['1', '0x11', 'rwx', 'S'], ['2', '—', 'r-x', 'N'], ['3', '0x00', 'rwx', 'S']] } ] };
const ME_T24_SEQ = `Endereços de 16 bits: página (8 bits) | deslocamento (8 bits).
TLB vazia no início (32 entradas). Novas tramas: a partir do endereço 0x3000.
1. 0x00FF  executar
2. 0xFF00  ler
3. 0x0303  escrever
4. 0x0000  escrever
5. 0x02FF  ler
6. 0x0222  escrever`;
const ME_T25 = { tbls: [
  { cap: 'Tabela de páginas', h: ['Página', 'Base', 'Prot.', 'Presente'], r: [['0x00000', '0x10000', 'rwx', 'S'], ['0x00001', '0x11000', 'r-x', 'S'], ['0x00002', '0x01000', 'rwx', 'S'], ['0x00003', '—', 'r-x', 'N']] } ] };
const ME_T25_SEQ = `Endereços de 32 bits, páginas de 4 KB. TLB vazia no início (16 entradas).
Novas tramas: a partir do endereço 0x12000000.
1. 0x000004FF  executar
2. 0x00001456  escrever
3. 0x00003AAA  ler
4. 0x00002010  escrever
5. 0x000100FF  ler
6. 0x00001CC0  ler`;
const ME_MMU_Q = 'Com as tabelas e a sequência de acessos abaixo (por esta ordem), ';

STUDY.questions('so', [
/* --- nível 1 --- */
{ id: 'me-01', t: 'mem', l: 1, les: 'v-page', calc: true,
  q: 'Os endereços virtuais têm 12 bits de deslocamento. Qual é o tamanho de cada página?',
  o: ['4 KB', '12 KB', '1 KB', '2 KB'], a: 0,
  e: 'Tamanho = 2^deslocamento = 2¹² = 4096 bytes = **4 KB**.' },
{ id: 'me-02', t: 'mem', l: 1, les: 'v-why',
  q: 'Quem traduz os endereços virtuais em físicos, em cada acesso à memória?',
  o: ['A MMU, em hardware', 'O núcleo, em software', 'O compilador, ao gerar código', 'O próprio programa'], a: 0,
  e: 'A **MMU** traduz em cada acesso, usando as tabelas que o núcleo preparou. O núcleo só entra quando a tradução falha.' },
{ id: 'me-03', t: 'mem', l: 1, les: 'v-why',
  q: 'Dois processos usam o mesmo endereço virtual, 0x00030024. Isso é um problema?',
  o: ['Não: cada um tem a sua tabela', 'Sim: dão acesso à mesma posição física', 'Sim: a MMU deteta o conflito', 'Só se os dois estiverem a correr'], a: 0,
  e: 'Cada processo tem o seu espaço de endereçamento e a sua **tabela de páginas**: o mesmo endereço virtual leva a tramas diferentes.' },
{ id: 'me-04', t: 'mem', l: 1, les: 'v-tlb',
  q: 'O que é a TLB?',
  o: ['Uma cache de traduções de páginas', 'A tabela de páginas do núcleo', 'Uma cache de dados da RAM', 'O registo base da tabela de páginas'], a: 0,
  e: 'Guarda as traduções página → trama usadas há pouco, para não ir à tabela de páginas (na RAM) em cada acesso.' },
{ id: 'me-05', t: 'mem', l: 1, les: 'v-page',
  q: 'Que tipo de fragmentação existe num sistema com paginação?',
  o: ['Só interna', 'Só externa', 'As duas', 'Nenhuma'], a: 0,
  e: 'Qualquer trama livre serve (sem externa), mas a última página de cada região fica meio vazia (**interna**).' },
{ id: 'me-06', t: 'mem', l: 1, les: 'v-pte',
  q: 'O que é uma falta de página?',
  o: ['A página é válida mas não está na RAM', 'O endereço não pertence ao processo', 'O processo escreveu numa página só de leitura', 'A TLB não tem a tradução'], a: 0,
  e: 'A página existe (está na tabela) mas o bit **presente** está a N: o núcleo vai buscá-la ao disco para uma trama. Endereço fora do processo é acesso inválido; TLB sem a tradução é só um miss.' },

/* --- nível 2 --- */
{ id: 'me-10', t: 'mem', l: 2, les: 'v-page', calc: true,
  q: 'Endereços virtuais de 32 bits, com 12 bits de deslocamento. Quantas entradas tem a tabela de páginas (um só nível)?',
  o: ['2^20', '2^12', '2^32', '2^10'], a: 0,
  e: 'Bits de página = 32 − 12 = 20 → **2²⁰** entradas (cerca de um milhão).' },
{ id: 'me-11', t: 'mem', l: 2, les: 'v-page',
  q: 'Páginas de 4 KB e endereços de 32 bits. Qual é o número de página e o deslocamento de 0x0000A3F8?',
  o: ['Página 0x0000A, deslocamento 0x3F8', 'Página 0x000A3, deslocamento 0xF8', 'Página 0x0A3F8, deslocamento 0x0', 'Página 0x0000, deslocamento 0xA3F8'], a: 0,
  e: '4 KB = 12 bits = **3 dígitos hex** de deslocamento (3F8). O resto é a página: 0x0000A.' },
{ id: 'me-12', t: 'mem', l: 2, les: 'v-page',
  q: 'Páginas de 4 KB. A página virtual 0x00002 está na trama de base 0xAA100. Que endereço físico corresponde a 0x00002C65?',
  o: ['0xAA100C65', '0xAA102C65', '0x00002C65', '0xC65AA100'], a: 0,
  e: 'Troca-se a página pela trama e **mantém-se o deslocamento**: AA100 seguido de C65.' },
{ id: 'me-13', t: 'mem', l: 2, les: 'v-tlb',
  q: 'Um acesso teve TLB hit. A página pode não estar na RAM?',
  o: ['Não: a TLB só tem páginas presentes', 'Sim: a TLB não sabe se a página está lá', 'Sim, se a página for de código', 'Só se a TLB estiver cheia'], a: 0,
  e: 'Quando uma página sai da RAM, o núcleo invalida a sua entrada na TLB. Hit válido ⇒ página na RAM.' },
{ id: 'me-14', t: 'mem', l: 2, les: 'v-pte',
  q: 'Um processo escreve numa página presente na RAM cuja proteção é r-x. O que acontece?',
  o: ['Violação de proteção', 'Falta de página', 'A escrita é feita normalmente', 'A página passa a rw-'], a: 0,
  e: 'A página está lá, mas não permite escrever: exceção de **proteção**, tratada como acesso inválido (SIGSEGV), a não ser que seja copy-on-write.' },
{ id: 'me-15', t: 'mem', l: 2, les: 'v-pte',
  q: 'Um processo acede a uma página que nem existe na sua tabela de páginas. O que acontece?',
  o: ['Acesso inválido: recebe SIGSEGV', 'Falta de página: o núcleo cria-a', 'TLB miss e tudo continua', 'Violação de proteção, e repete'], a: 0,
  e: 'O endereço não pertence a nenhuma região do processo: **acesso inválido**. Falta de página é só para páginas que existem mas estão fora da RAM.' },
{ id: 'me-16', t: 'mem', l: 2, les: 'v-tlb', calc: true,
  q: 'Paginação com um nível, TLB vazia no início e com espaço de sobra, sem outras caches. Um programa faz 10 acessos que tocam em 3 páginas diferentes. Qual é o overhead em acessos extra à memória física?',
  o: ['30%', '10%', '3%', '60%'], a: 0,
  e: '3 misses (o primeiro acesso a cada página) × 1 acesso à tabela = 3 acessos extra em 10: **30%**.' },
{ id: 'me-17', t: 'mem', l: 2, les: 'v-multi',
  q: 'Numa paginação com 3 níveis, quantos acessos extra à memória custa um TLB miss?',
  o: ['3', '1', '0', '6'], a: 0,
  e: 'Uma leitura por cada nível de tabela: **3**.' },
{ id: 'me-18', t: 'mem', l: 2, les: 'v-multi', calc: true,
  q: 'Páginas de 8 KB e entradas de tabela (PTE) de 8 bytes; cada tabela ocupa uma página. Quantos bits de índice tem cada nível?',
  o: ['10', '13', '8', '3'], a: 0,
  e: '8192 / 8 = 1024 = 2¹⁰ entradas por página → **10** bits.' },
{ id: 'me-19', t: 'mem', l: 2, les: 'v-seg', calc: true,
  q: 'Segmentação com endereços de 16 bits: 4 bits de segmento e 12 de deslocamento. Qual é o tamanho máximo de um segmento?',
  o: ['4 KB', '64 KB', '16 bytes', '4 bytes'], a: 0,
  e: '2¹² = **4 KB**. (2⁴ = 16 é o número de segmentos.)' },
{ id: 'me-20', t: 'mem', l: 2, les: 'v-seg',
  q: 'Que fragmentação aparece num sistema com segmentação?',
  o: ['Externa', 'Interna', 'As duas, em partes iguais', 'Nenhuma'], a: 0,
  e: 'Segmentos de tamanhos diferentes, cada um contíguo, deixam **buracos** entre si: fragmentação externa.' },
{ id: 'me-21', t: 'mem', l: 2, les: 'v-cow',
  q: 'Com copy-on-write, como fica no filho, logo depois do fork, uma página de dados que o pai podia escrever?',
  o: ['Mesma trama, só leitura e marcada COW', 'Uma trama nova, com leitura e escrita', 'Mesma trama, com leitura e escrita', 'Uma trama nova, só leitura'], a: 0,
  e: 'Partilham a trama, mas ficam os dois **sem escrita** e com a marca COW. A cópia só se faz na primeira escrita.' },
{ id: 'me-22', t: 'mem', l: 2, les: 'v-cow',
  q: 'Com copy-on-write, o filho escreve numa página que ainda partilha com o pai. O que acontece?',
  o: ['Copia-se para uma trama nova', 'O pai também passa a ver a escrita feita', 'O filho recebe SIGSEGV', 'A página do pai é apagada'], a: 0,
  e: 'A escrita dá exceção de proteção; o núcleo vê que é COW, **copia** a página para uma trama nova do filho com escrita permitida, e repete o acesso.' },
{ id: 'me-23', t: 'mem', l: 2, les: 'v-page',
  q: 'O que acontece quando se aumenta o tamanho das páginas?',
  o: ['Mais fragmentação interna', 'Mais fragmentação externa', 'Faltas de página mais rápidas', 'Tabelas de páginas maiores'], a: 0,
  e: 'Desperdiça-se mais no fim de cada região (**interna**). As tabelas ficam menores e cada falta de página traz mais dados, logo demora mais.' },
{ id: 'me-24', t: 'mem', l: 2, les: 'v-tlb',
  q: 'Ao comutar de processo, numa TLB sem identificador de processo, o que acontece às entradas da TLB?',
  o: ['São invalidadas', 'Mantêm-se e servem os dois', 'São copiadas para a RAM', 'Passam para o novo processo'], a: 0,
  e: 'As traduções eram do processo anterior: são **invalidadas**. Os primeiros acessos do novo processo são todos miss.' },
{ id: 'me-25', t: 'mem', l: 2, les: 'v-pte',
  q: 'Em qual destes casos é obrigatório chamar o núcleo durante a tradução de um endereço?',
  o: ['Numa falta de página', 'Num TLB miss com a página presente', 'Em todos os acessos', 'Num TLB hit'], a: 0,
  e: 'Trazer a página do disco e escolher uma trama é trabalho do núcleo. Um miss com a página presente resolve-o o hardware (a MMU percorre a tabela).' },
{ id: 'me-26', t: 'mem', l: 2, les: 'v-pte', calc: true,
  q: 'Endereços físicos de 32 bits, páginas de 4 KB, entradas da tabela de páginas (PTE) de 64 bits. Quantos bits sobram em cada PTE além do número da trama?',
  o: ['44', '52', '32', '20'], a: 0,
  e: 'Trama = 32 − 12 = 20 bits. 64 − 20 = **44** bits para presente, proteções, modificado, etc.' },

/* --- nível 3: ser a MMU (tabela própria) --- */
{ id: 'me-m3', t: 'mem', l: 3, les: 'v-tlb', ex: 'mmu', d: ME_T1, code: ME_T1_SEQ,
  q: ME_MMU_Q + 'qual é o resultado do acesso 3 (0x00000FFF, ler)?',
  o: ['TLB hit · 0x10000FFF · sem exceção', 'TLB miss · 0x10000FFF · sem exceção', 'TLB hit · violação de proteção', 'TLB miss · 0x00000FFF · sem exceção'], a: 0,
  e: 'A página 0 entrou na TLB no acesso 1: **hit**. r-x deixa ler. Físico = 0x10000 seguido de FFF.' },
{ id: 'me-m4', t: 'mem', l: 3, les: 'v-pte', ex: 'mmu', d: ME_T1, code: ME_T1_SEQ,
  q: ME_MMU_Q + 'qual é o resultado do acesso 4 (0x00002010, escrever)?',
  o: ['TLB miss · falta de página · 0x20000010', 'TLB miss · acesso inválido', 'TLB miss · falta de página · 0x00002010', 'TLB miss · violação de proteção'], a: 0,
  e: 'Página 2 nunca foi usada: miss. Na tabela está com presente = N: **falta de página**. O núcleo põe-na na trama 0x20000 → 0x20000010 (rw- deixa escrever).' },
{ id: 'me-m5', t: 'mem', l: 3, les: 'v-pte', ex: 'mmu', d: ME_T1, code: ME_T1_SEQ,
  q: ME_MMU_Q + 'qual é o resultado do acesso 5 (0x00003004, escrever)?',
  o: ['TLB miss · violação de proteção', 'TLB miss · falta de página · 0x20000004', 'TLB miss · 0x05000004 · sem exceção', 'TLB hit · acesso inválido'], a: 0,
  e: 'A página 3 está presente (0x05000), mas é **r--**: escrever não é permitido. Violação de proteção.' },
{ id: 'me-m6', t: 'mem', l: 3, les: 'v-pte', ex: 'mmu', d: ME_T1, code: ME_T1_SEQ,
  q: ME_MMU_Q + 'qual é o resultado do acesso 6 (0x00005000, ler)?',
  o: ['TLB miss · acesso inválido', 'TLB miss · falta de página · 0x20000000', 'TLB miss · 0x05000000 · sem exceção', 'TLB hit · violação de proteção'], a: 0,
  e: 'A página 5 nem existe na tabela do processo: **acesso inválido** (SIGSEGV). Não é falta de página: não há nada para ir buscar.' },
{ id: 'me-m7', t: 'mem', l: 3, les: 'v-tlb', ex: 'mmu', d: ME_T1, code: ME_T1_SEQ,
  q: ME_MMU_Q + 'qual é o resultado do acesso 7 (0x00002FF0, ler)?',
  o: ['TLB hit · 0x20000FF0 · sem exceção', 'TLB miss · falta de página · 0x20000FF0', 'TLB miss · 0x00002FF0 · sem exceção', 'TLB hit · violação de proteção'], a: 0,
  e: 'A página 2 foi trazida no acesso 4 e ficou na TLB: **hit**, trama 0x20000.' },

/* --- nível 4: a tabela da MMU dos exames --- */
{ id: 'me-a2', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T22, code: ME_T22_SEQ, src: 'Exame 2022/23, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 2 (00002150, escrita)?',
  o: ['TLB miss · falta de página · 00300150', 'TLB miss · acesso inválido', 'TLB miss · falta de página · 00002150', 'TLB miss · violação de proteção'], a: 0,
  e: 'Página 2 não está na TLB; na tabela tem presente = N: **falta de página**. Vai para a trama nova 00300 → 00300150 (rw- deixa escrever).' },
{ id: 'me-a3', t: 'mem', l: 4, les: 'v-tlb', ex: 'mmu', d: ME_T22, code: ME_T22_SEQ, src: 'Exame 2022/23, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 3 (00002120, escrita)?',
  o: ['TLB hit · 00300120 · sem exceção', 'TLB miss · falta de página · 00300120', 'TLB miss · acesso inválido', 'TLB hit · violação de proteção'], a: 0,
  e: 'Depois da falta de página do acesso 2, a página 2 ficou na TLB com a trama 00300: **hit**.' },
{ id: 'me-a4', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T22, code: ME_T22_SEQ, src: 'Exame 2022/23, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 4 (00004150, execução)?',
  o: ['TLB miss · acesso inválido', 'TLB miss · falta de página · 00300150', 'TLB hit · 00100150 · sem exceção', 'TLB miss · violação de proteção'], a: 0,
  e: 'A página 4 não existe na tabela de páginas: **acesso inválido**.' },
{ id: 'me-a5', t: 'mem', l: 4, les: 'v-tlb', ex: 'mmu', d: ME_T22, code: ME_T22_SEQ, src: 'Exame 2022/23, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 5 (00002010, leitura)?',
  o: ['TLB hit · 00300010 · sem exceção', 'TLB miss · falta de página · 00300010', 'TLB hit · violação de proteção', 'TLB miss · 00002010 · sem exceção'], a: 0,
  e: 'Página 2 continua na TLB (trama 00300) e rw- deixa ler: **hit**, 00300010.' },
{ id: 'me-a6', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T22, code: ME_T22_SEQ, src: 'Exame 2022/23, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 6 (00001000, escrita)?',
  o: ['TLB hit · violação de proteção', 'TLB hit · 01C00000 · sem exceção', 'TLB miss · falta de página · 00300000', 'TLB miss · acesso inválido'], a: 0,
  e: 'A página 1 está na TLB (válida), mas é **r-x**: escrever é uma violação de proteção.' },
{ id: 'me-b2', t: 'mem', l: 4, les: 'v-tlb', ex: 'mmu', d: ME_T23, code: ME_T23_SEQ, src: 'Exame 2023/24, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 2 (0000209C, leitura)?',
  o: ['TLB hit · AA10009C · sem exceção', 'TLB miss · AA10009C · sem exceção', 'TLB hit · violação de proteção', 'TLB miss · falta de página · 0030009C'], a: 0,
  e: 'A página 2 está na TLB e válida; r-x deixa ler: **hit**, AA100 seguido de 09C.' },
{ id: 'me-b4', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T23, code: ME_T23_SEQ, src: 'Exame 2023/24, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 4 (00004FFA, escrita)?',
  o: ['TLB miss · acesso inválido', 'TLB miss · falta de página · 00300FFA', 'TLB miss · violação de proteção', 'TLB hit · FE74BFFA · sem exceção'], a: 0,
  e: 'A página 4 não está na tabela: **acesso inválido**.' },
{ id: 'me-b5', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T23, code: ME_T23_SEQ, src: 'Exame 2023/24, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 5 (00002CBF, escrita)?',
  o: ['TLB hit · violação de proteção', 'TLB hit · AA100CBF · sem exceção', 'TLB miss · falta de página · 00300CBF', 'TLB miss · acesso inválido'], a: 0,
  e: 'A página 2 está na TLB, mas a proteção é **r-x**: não deixa escrever.' },
{ id: 'me-b6', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T23, code: ME_T23_SEQ, src: 'Exame 2023/24, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 6 (00001980, leitura)?',
  o: ['TLB miss · falta de página · 00300980', 'TLB miss · acesso inválido', 'TLB miss · falta de página · 00001980', 'TLB miss · violação de proteção'], a: 0,
  e: 'A página 1 não está na TLB; na tabela existe mas com presente = N: **falta de página**. Vai para a trama nova 00300 → 00300980.' },
{ id: 'me-c2', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T24, code: ME_T24_SEQ, src: 'Exame 2024/25, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 2 (0xFF00, ler)?',
  o: ['TLB miss · acesso inválido', 'TLB miss · falta de página · 0x3000', 'TLB miss · 0xFF00 · sem exceção', 'TLB hit · violação de proteção'], a: 0,
  e: 'Página 0xFF: não existe na tabela (só há 0 a 3). **Acesso inválido**.' },
{ id: 'me-c3', t: 'mem', l: 4, les: 'v-page', ex: 'mmu', d: ME_T24, code: ME_T24_SEQ, src: 'Exame 2024/25, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 3 (0x0303, escrever)?',
  o: ['TLB miss · 0x0003 · sem exceção', 'TLB miss · 0x0303 · sem exceção', 'TLB hit · 0x0003 · sem exceção', 'TLB miss · violação de proteção'], a: 0,
  e: 'Página 3 → trama 0x00, rwx. Deslocamento 0x03 (8 bits): físico **0x0003**. Primeiro acesso a esta página: miss.' },
{ id: 'me-c4', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T24, code: ME_T24_SEQ, src: 'Exame 2024/25, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 4 (0x0000, escrever)?',
  o: ['TLB hit · violação de proteção', 'TLB hit · 0x1000 · sem exceção', 'TLB miss · violação de proteção', 'TLB miss · 0x1000 · sem exceção'], a: 0,
  e: 'A página 0 entrou na TLB no acesso 1: **hit**. Mas é **r-x**: escrever é violação de proteção.' },
{ id: 'me-c5', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T24, code: ME_T24_SEQ, src: 'Exame 2024/25, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 5 (0x02FF, ler)?',
  o: ['TLB miss · falta de página · 0x30FF', 'TLB miss · acesso inválido', 'TLB miss · 0x02FF · sem exceção', 'TLB miss · falta de página · 0x02FF'], a: 0,
  e: 'Página 2 existe mas não está presente: **falta de página**. A trama nova começa em 0x3000 (trama 0x30) → 0x30FF.' },
{ id: 'me-c6', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T24, code: ME_T24_SEQ, src: 'Exame 2024/25, 1.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 6 (0x0222, escrever)?',
  o: ['TLB hit · violação de proteção', 'TLB hit · 0x3022 · sem exceção', 'TLB miss · falta de página · 0x3022', 'TLB miss · acesso inválido'], a: 0,
  e: 'A página 2 ficou na TLB depois do acesso 5: hit. Mas é **r-x**: escrever não é permitido.' },
{ id: 'me-d2', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T25, code: ME_T25_SEQ, src: 'Exame 2024/25, 2.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 2 (0x00001456, escrever)?',
  o: ['TLB miss · violação de proteção', 'TLB miss · 0x11000456 · sem exceção', 'TLB miss · falta de página · 0x12000456', 'TLB hit · acesso inválido'], a: 0,
  e: 'Página 1 presente na trama 0x11000, mas **r-x**: escrever é violação de proteção (a tradução fica na TLB).' },
{ id: 'me-d3', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T25, code: ME_T25_SEQ, src: 'Exame 2024/25, 2.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 3 (0x00003AAA, ler)?',
  o: ['TLB miss · falta de página · 0x12000AAA', 'TLB miss · acesso inválido', 'TLB miss · violação de proteção', 'TLB miss · falta de página · 0x00003AAA'], a: 0,
  e: 'Página 3 existe com presente = N: **falta de página**. Trama nova em 0x12000000 → 0x12000AAA. r-x deixa ler.' },
{ id: 'me-d5', t: 'mem', l: 4, les: 'v-pte', ex: 'mmu', d: ME_T25, code: ME_T25_SEQ, src: 'Exame 2024/25, 2.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 5 (0x000100FF, ler)?',
  o: ['TLB miss · acesso inválido', 'TLB miss · falta de página · 0x120000FF', 'TLB miss · 0x100000FF · sem exceção', 'TLB hit · 0x100100FF · sem exceção'], a: 0,
  e: 'Página 0x00010 (os 5 dígitos de cima), não 0x00000! Não existe na tabela: **acesso inválido**.' },
{ id: 'me-d6', t: 'mem', l: 4, les: 'v-tlb', ex: 'mmu', d: ME_T25, code: ME_T25_SEQ, src: 'Exame 2024/25, 2.ª época',
  q: ME_MMU_Q + 'qual é o resultado do acesso 6 (0x00001CC0, ler)?',
  o: ['TLB hit · 0x11000CC0 · sem exceção', 'TLB miss · 0x11000CC0 · sem exceção', 'TLB hit · violação de proteção', 'TLB miss · falta de página · 0x12000CC0'], a: 0,
  e: 'A página 1 entrou na TLB no acesso 2. r-x deixa ler: **hit**, 0x11000CC0.' },

/* --- nível 4: dimensões, overhead, fragmentação, COW --- */
{ id: 'me-30', t: 'mem', l: 4, les: 'v-why', src: 'Exame 2022/23, 1.ª época',
  q: 'Num sistema com endereços virtuais de 32 bits e 12 bits de deslocamento, o processo A gerou o endereço virtual 00030024 e o processo B, no time-slice seguinte, acedeu ao mesmo endereço. Qual das afirmações é verdadeira?',
  o: ['Não é erro: cada processo tem a sua tabela de páginas', 'É erro: há conflito no acesso à memória', 'É erro: a TLB não distingue os processos', 'Não é erro, mas a página de A tem de sair da RAM para B continuar'], a: 0,
  e: 'Cada processo traduz pela sua tabela: o mesmo endereço virtual leva a tramas diferentes. A TLB é limpa (ou etiquetada) na comutação.' },
{ id: 'me-31', t: 'mem', l: 4, les: 'v-tlb', calc: true, src: 'Exame 2022/23, 1.ª época',
  code: `Paginação com um nível, páginas de 4 KB. TLB limpa no início, 32 entradas, sem outras caches.
Todas as páginas estão na RAM.
 1. 0xA0001FB0    6. 0xA000D238
 2. 0xA100F100    7. 0xA100F700
 3. 0xA0001FB4    8. 0xA000D23A
 4. 0xA0001FB8    9. 0xA100F800
 5. 0xA000D234   10. 0xA0001FBA`,
  q: 'Qual é o overhead do sistema de memória virtual na sequência abaixo, em acessos extra à memória física face a um sistema com endereçamento real?',
  o: ['30%', '10%', '20%', '40%'], a: 0,
  e: 'Páginas distintas: A0001, A100F, A000D → **3 misses**, cada um com 1 acesso à tabela. 3 em 10 = **30%**.' },
{ id: 'me-32', t: 'mem', l: 4, les: 'v-multi', calc: true, src: 'Exame 2022/23, 1.ª época',
  code: `Paginação com DOIS níveis: página (10 bits) | página (10 bits) | deslocamento (12 bits).
TLB limpa no início, 32 entradas, sem outras caches. Todas as páginas estão na RAM.
 1. 0xA0001FB0    6. 0xA000D238
 2. 0xA100F100    7. 0xA100F700
 3. 0xA0001FB4    8. 0xA000D23A
 4. 0xA0001FB8    9. 0xA100F800
 5. 0xA000D234   10. 0xA0001FBA`,
  q: 'Qual é o overhead do sistema de memória virtual na sequência abaixo, em acessos extra à memória física face a um sistema com endereçamento real?',
  o: ['60%', '40%', '50%', '70%'], a: 0,
  e: 'Os mesmos 3 misses, mas cada um custa agora **2** acessos (um por nível): 6 em 10 = **60%**.' },
{ id: 'me-49', t: 'mem', l: 4, les: 'v-tlb', calc: true, src: 'Exame 2023/24, 2.ª época',
  code: `Paginação com um nível, páginas de 4 KB. TLB limpa no início, completamente associativa,
32 entradas. Todas as páginas estão na RAM.
 1. 0x32002A5C    6. 0x3100B372
 2. 0x3100B65D    7. 0x3000C70E
 3. 0x320022AA    8. 0x3100B66B
 4. 0x32002BF3    9. 0x32002800
 5. 0x3100B432   10. 0x30000FBA`,
  q: 'Na sequência abaixo, quantos acessos têm TLB hit e quantos acessos à RAM são precisos, ao todo, só para traduzir endereços?',
  o: ['6 hits e 4 acessos extra', '4 hits e 6 acessos extra', '7 hits e 3 acessos extra', '5 hits e 5 acessos extra'], a: 0,
  e: 'Páginas: 32002 (miss), 3100B (miss), 32002, 32002, 3100B, 3100B (hits), 3000C (miss), 3100B, 32002 (hits), 30000 (miss). **6 hits, 4 misses**, cada miss com 1 acesso à tabela.' },
{ id: 'me-33', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2023/24, 1.ª época',
  q: 'Memória virtual paginada de 32 bits; cada endereço tem 11 bits (menos significativos) de deslocamento e 21 de página. Qual é a dimensão das páginas?',
  o: ['2048 bytes', '1100 bytes', '4 KB', '11² bytes'], a: 0,
  e: '2¹¹ = **2048 bytes**.' },
{ id: 'me-34', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2023/24, 1.ª época',
  q: 'Memória virtual paginada de 32 bits; cada endereço tem 11 bits de deslocamento e 21 de página. Quantas linhas pode ter, no máximo, a tabela de páginas de um processo?',
  o: ['2^21 linhas', '2^11 linhas', '21 K linhas', '4 G linhas'], a: 0,
  e: 'Uma linha por página possível: 2^(bits de página) = **2²¹**.' },
{ id: 'me-35', t: 'mem', l: 4, les: 'v-page', src: 'Exame 2023/24, 1.ª época',
  q: 'Em sistemas baseados em paginação, qual das afirmações é correta?',
  o: ['Aumentar a página aumenta a fragmentação interna', 'Reduzir a página aumenta a fragmentação externa', 'Aumentar a página reduz a latência de uma falta de página', 'O núcleo traduz cada endereço virtual em físico'], a: 0,
  e: 'Páginas maiores desperdiçam mais no fim de cada região. Não há externa; faltas com páginas maiores demoram mais; e quem traduz é a MMU.' },
{ id: 'me-36', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2023/24, 2.ª época',
  q: 'Memória virtual paginada de 32 bits; cada endereço tem 20 bits (menos significativos) de deslocamento e 12 de página. Qual é a dimensão das páginas?',
  o: ['2^20 bytes', '2^12 bytes', '4 KB', '2^32 bytes'], a: 0,
  e: 'O deslocamento é que define o tamanho: 2²⁰ bytes (1 MB). Aqui os papéis estão trocados em relação ao habitual, cuidado!' },
{ id: 'me-37', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2023/24, 2.ª época',
  q: 'Memória virtual paginada de 32 bits; cada endereço tem 20 bits de deslocamento e 12 de página. Quantas linhas pode ter, no máximo, a tabela de páginas de um processo?',
  o: ['2^12 linhas', '2^20 linhas', '2^8 linhas', '2^32 linhas'], a: 0,
  e: '12 bits de página → **2¹²** linhas.' },
{ id: 'me-38', t: 'mem', l: 4, les: 'v-seg', src: 'Exame 2023/24, 2.ª época',
  q: 'Escolhe a afirmação correta sobre fragmentação.',
  o: ['Na paginação não pode haver fragmentação externa', 'Na paginação não pode haver fragmentação interna', 'Na segmentação não pode haver fragmentação externa', 'Nenhuma das anteriores'], a: 0,
  e: 'Na paginação qualquer trama livre serve: **sem externa**. A interna existe (última página), e a segmentação tem externa.' },
{ id: 'me-39', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2024/25, 1.ª época',
  q: 'Memória virtual paginada de 32 bits; cada endereço tem 10 bits (menos significativos) de deslocamento e 22 de página. Qual é a dimensão das páginas?',
  o: ['1 KB', '2^12 bytes', '2^20 bytes', '4 KB'], a: 0,
  e: '2¹⁰ = **1 KB**. (No exame era "Nenhuma das anteriores".)' },
{ id: 'me-40', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2024/25, 1.ª época',
  q: 'Memória virtual paginada de 32 bits; cada endereço tem 10 bits de deslocamento e 22 de página. Quantas linhas pode ter, no máximo, a tabela de páginas de um processo?',
  o: ['2^22 linhas', '2^12 linhas', '2^20 linhas', '2^10 linhas'], a: 0,
  e: '22 bits de página → **2²²** linhas.' },
{ id: 'me-41', t: 'mem', l: 4, les: 'v-pte', src: 'Exame 2024/25, 1.ª época',
  q: 'Em sistemas baseados em paginação, qual das afirmações é correta?',
  o: ['Uma falta de página chama o núcleo', 'O núcleo traduz todos os endereços virtuais', 'Com paginação, a MMU não é necessária', 'Na segmentação não há fragmentação externa'], a: 0,
  e: 'A MMU traduz sozinha; quando a página não está presente, gera uma exceção e o **núcleo** trata a falta.' },
{ id: 'me-42', t: 'mem', l: 4, les: 'v-page', calc: true, src: 'Exame 2024/25, 2.ª época',
  q: 'Memória virtual paginada de 30 bits: 12 bits (menos significativos) de deslocamento e 18 de página; PTEs de 8 bytes. Qual é a dimensão das páginas, em KB?',
  o: ['4 KB', '12 KB', '2 KB', '256 KB'], a: 0,
  e: '2¹² = 4096 bytes = **4 KB**.' },
{ id: 'me-43', t: 'mem', l: 4, les: 'v-multi', calc: true, src: 'Exame 2024/25, 2.ª época',
  q: 'Memória virtual paginada de 30 bits: 12 bits de deslocamento e 18 de página; PTEs de 8 bytes. Numa paginação de dois níveis, quantos bits se devem reservar para o índice de 1.º nível?',
  o: ['9', '6', '12', '18'], a: 0,
  e: 'Uma tabela numa página de 4 KB tem 4096/8 = 512 = 2⁹ entradas → 9 bits no 2.º nível; os 18 bits de página ficam 9 + **9**.' },
{ id: 'me-44', t: 'mem', l: 4, les: 'v-seg', src: 'Exame 2024/25, 2.ª época',
  q: 'Em sistemas baseados em segmentação, qual das afirmações é correta?',
  o: ['Cada segmento ocupa memória física contígua', 'O núcleo é chamado sempre que se muda de segmento', 'Os CPUs não precisam de registos de limite de segmento', 'Troca-se fragmentação externa por interna'], a: 0,
  e: 'Base + limite descrevem uma zona **contígua**. A tradução é feita pelo hardware (com registos de base e limite), e o que se troca é a interna pela externa.' },
{ id: 'me-46', t: 'mem', l: 4, les: 'v-tlb', src: 'Exame 2022/23, 2.ª época',
  q: 'Qual das seguintes afirmações é **falsa**?',
  o: ['Cada TLB miss acorda o núcleo', 'Cada processo tem a sua tabela de páginas', 'Ao comutar processos, o núcleo muda os registos da MMU', 'Cada falta de página acorda o núcleo'], a: 0,
  e: 'Na maioria das arquiteturas (x86) um TLB miss é resolvido pela própria MMU, que percorre a tabela. Só a falta de página chama o núcleo.' },
{ id: 'me-47', t: 'mem', l: 4, les: 'v-cow', src: 'Exame 2022/23, 2.ª época',
  code: `1 int main() {
2   int x = 0;
3   if (fork() == 0) {
4     x += 1;
5   }
6   printf("x=%d\\n", x);
7   return 0;
8 }
// Tabela do pai antes do fork (V = válida, P = presente; C = copy-on-write):
// V P  página  base  proteção
// S S  0x10    0x01  R-X-   (programa)
// S S  0x20    0x02  RW--   (pilha)`,
  q: 'Linux com copy-on-write. Como fica a tabela de páginas do filho imediatamente depois de o fork regressar (linha 3)?',
  o: ['0x10 → 0x01 R-X; 0x20 → 0x02 R-- C', '0x10 → 0x01 R-X; 0x20 → 0xD0 RW-', '0x10 → 0xD0 R-X; 0x20 → 0xD1 RW-', '0x10 → 0x01 R-X C; 0x20 → 0x02 RW- C'], a: 0,
  e: 'Nada se copia ainda: as mesmas tramas. A pilha, que era gravável, fica **só leitura com COW** (no pai também). O código já era só leitura e fica partilhado.' },
{ id: 'me-48', t: 'mem', l: 4, les: 'v-cow', src: 'Exame 2022/23, 2.ª época',
  code: `1 int main() {
2   int x = 0;
3   if (fork() == 0) {
4     x += 1;
5   }
6   printf("x=%d\\n", x);
7   return 0;
8 }
// Tabela do pai antes do fork (V = válida, P = presente; C = copy-on-write):
// V P  página  base  proteção
// S S  0x10    0x01  R-X-   (programa)
// S S  0x20    0x02  RW--   (pilha)
// Novas tramas: 0xF0, 0xF1, 0xF2`,
  q: 'Linux com copy-on-write. Como fica a tabela de páginas do filho quando ele chega à linha 7?',
  o: ['0x10 → 0x01 R-X; 0x20 → 0xF0 RW-', '0x10 → 0x01 R-X; 0x20 → 0x02 R-- C', '0xE0 → 0xF0 R-X; 0xE1 → 0xF1 RW-', '0x10 → 0xF0 R-X; 0x20 → 0xF1 RW-'], a: 0,
  e: 'O `x += 1` escreveu na pilha: a página 0x20 foi **copiada** para a trama nova 0xF0, já com escrita. O número da página virtual não muda, e o código continua partilhado.' },
]);
