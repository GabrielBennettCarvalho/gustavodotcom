/* ===== OC lessons for the 2nd test: virtual memory (extra), processor, pipelining, hazards, branches. =====
   The "adv" lessons (VLIW, multicore, I/O, RAID) are written from past exams only, until the slides arrive. */
const PIPE = rows => `<div class="diagram">${OCD.render({ pipe: rows })}</div>`;
const NOSLIDES = '<p class="muted" style="font-size:13px">Resumo feito a partir dos exames anteriores; será completado com os slides.</p>';
STUDY.lessons('oc', [
/* ---------------- VIRTUAL MEMORY: exam recipes ---------------- */
{ id: 'v-multi', t: 'vm', title: 'Tabelas multinível: quantos níveis e quantas páginas',
  html: `<p>Pensa numa lista telefónica dividida em volumes: um índice geral diz em que volume procurar, e só os volumes que usas têm de existir. É isto que fazem as tabelas de páginas hierárquicas.</p>
  <p><b>Quantos níveis?</b></p>
  <ul><li>Bits da VPN = bits do endereço virtual − bits de offset.</li>
  <li>Entradas por tabela = tamanho da página / tamanho da PTE (cada tabela ocupa uma página). Bits por nível = log₂ disso.</li>
  <li><b>Níveis = ⌈bits da VPN / bits por nível⌉</b>.</li></ul>
  <p>Exemplo: espaço de 2⁶³ B, páginas de 8 KB (offset 13), PTE de 8 B. VPN = 50 bits; 8 KB / 8 B = 1024 entradas = 10 bits. <b>50 / 10 = 5 níveis</b>.</p>
  <p><b>Quantas páginas de tabela usa um processo?</b> Com endereço 10 | 10 | 12, cada tabela de 2.º nível mapeia 2¹⁰ páginas de 4 KB = 4 MB.</p>
  <ul><li>Nível 1: <b>1</b> diretório.</li>
  <li>Nível 2: uma tabela <b>por cada zona de 4 MB tocada</b>. Regiões muito afastadas (código, dados, pilha) usam tabelas diferentes.</li></ul>
  <p>Exemplo: 10 MB de dados a partir do endereço 0 ocupam 3 zonas de 4 MB, e 2 MB de código no topo ocupam 1. Tabelas: 1 + 3 + 1 = <b>5 páginas</b>, mais as 3072 páginas de dados e código (12 MB / 4 KB).</p>
  <p><b>Número máximo de page faults num acesso, com 2 níveis:</b> o diretório está sempre na RAM, por isso são <b>2</b>: um pela tabela de 2.º nível e outro pela página do dado.</p>`,
  key: 'Níveis = ⌈VPN / log₂(PTEs por página)⌉. Nível 2: uma tabela por cada zona tocada.' },
{ id: 'v-vipt', t: 'vm', title: 'Cache VIPT: quantas vias para a TLB não pesar',
  html: `<p>Numa cache com tags físicas, é preciso o endereço físico para comparar a tag. Para não esperar pela TLB, a cache é <b>virtually indexed, physically tagged</b> (VIPT): o índice sai dos bits que <b>não mudam</b> com a tradução, os do offset da página.</p>
  <p>Assim TLB e cache trabalham <b>em paralelo</b>: a cache usa o índice virtual e, no fim, compara-se a tag física vinda da TLB.</p>
  <p>Condição: <b>índice + offset do bloco ≤ offset da página</b>. Ou seja, cada via pode ter no máximo o tamanho de uma página:</p>
  <p style="text-align:center"><b>vias mínimas = capacidade da cache / tamanho da página</b></p>
  <div class="tbl-wrap"><table><tr><th>Cache</th><th>Página</th><th>Vias mínimas</th></tr>
  <tr><td>128 KB</td><td>4 KB</td><td>32</td></tr><tr><td>64 KB</td><td>8 KB</td><td>8</td></tr><tr><td>8 KB</td><td>4 KB</td><td>2</td></tr></table></div>
  <p>Repara que o tamanho do bloco não entra nesta conta.</p>
  <p>Se a cache usasse só endereços <b>virtuais</b> (índice e tag), um hit nem precisava da tradução: a associatividade seria <b>irrelevante</b> para este efeito. O preço é o <b>aliasing</b>.</p>`,
  key: 'VIPT: cada via cabe numa página. Vias ≥ capacidade / página.' },
{ id: 'v-trace', t: 'vm', title: 'Seguir uma sequência de endereços',
  html: `<p>Para cada endereço virtual, faz sempre os mesmos passos:</p>
  <ol><li><b>Nº de página</b> = endereço / tamanho da página (parte inteira). <b>Offset</b> = o resto. Em hexadecimal basta cortar os bits do offset.</li>
  <li>Procura a página na <b>TLB</b>. Hit: acabou, e esta entrada passa a ser a usada mais recentemente.</li>
  <li>Miss: vai à <b>tabela de páginas</b>. Valid = 1: copia a tradução para a TLB.</li>
  <li>Valid = 0: <b>page fault</b>. Traz a página, atualiza a tabela e a TLB.</li>
  <li>Se a TLB estiver cheia, sai a entrada usada há mais tempo (LRU).</li></ol>
  <p>Exemplo com páginas de 4 KB: o endereço 34587 está na página 34587 / 4096 = <b>8</b>, com offset 34587 − 8 × 4096 = <b>1819</b>.</p>
  <p>Em hexadecimal: com páginas de 16 KB (offset 14 bits), 0x123456 tem VPN = 0x123456 >> 14 = <b>0x48</b>.</p>
  <p>Regra útil: o endereço físico tem de ter o <b>mesmo offset</b> do virtual. Com páginas de 4 KB, os 3 últimos dígitos hexadecimais são iguais.</p>`,
  key: 'Página = endereço / tamanho. TLB → tabela → page fault, e o offset nunca muda.' },

/* ---------------- THE PROCESSOR ---------------- */
{ id: 'pr-steps', t: 'proc', title: 'O que acontece em cada instrução',
  html: `<p>O tempo de CPU depende de três fatores: <b>IC</b> (nº de instruções), determinado pela ISA e pelo compilador, e <b>CPI</b> e <b>período do relógio</b>, determinados pelo hardware. Aqui olhamos para o hardware.</p>
  <p>Todas as instruções começam da mesma forma, como numa cozinha em que qualquer prato começa por ler a receita:</p>
  <ol><li><b>Fetch</b>: o PC dá o endereço; lê-se a instrução da memória de instruções; PC = PC + 4.</li>
  <li><b>Decode</b>: o opcode e os campos funct vão para o controlo; leem-se os registos indicados na instrução.</li>
  <li><b>Execute</b>: a ALU calcula. Depende da classe:
    <ul><li>aritmética/lógica → o resultado;</li><li>load/store → o endereço de memória (registo + offset);</li><li>branch → a comparação (subtração e sinal Zero).</li></ul></li>
  <li><b>Memória</b>: só loads e stores.</li>
  <li><b>Write-back</b>: escreve o resultado no banco de registos (aritméticas e loads).</li></ol>
  <p>Todas as instruções, exceto o <code>jal</code>, usam a ALU depois de lerem os registos.</p>`,
  key: 'Fetch, decode, execute, memória, write-back. IC vem da ISA; CPI e período vêm do hardware.' },
{ id: 'pr-logic', t: 'proc', title: 'Blocos do hardware: combinacional e sequencial',
  html: `<p>Há duas famílias de blocos:</p>
  <ul><li><b>Combinacionais</b>: a saída é função só das entradas atuais. Portas lógicas, somadores, multiplexers, ALU. Como uma calculadora sem memória.</li>
  <li><b>Sequenciais</b>: guardam estado. Registos, PC, banco de registos, memórias. Como um caderno.</li></ul>
  <p>Um registo atualiza-se na <b>transição do relógio</b> (0 → 1). Com sinal de escrita, só muda se o sinal <b>Write</b> estiver a 1.</p>
  <p><b>Regra do relógio</b>: entre duas transições a lógica combinacional calcula, sempre de um elemento de estado para outro. <b>O atraso mais longo determina o período</b>.</p>
  <p>Um <b>multiplexer</b> escolhe uma de várias entradas: não se podem simplesmente ligar dois fios, por isso é preciso um mux sempre que um valor pode vir de fontes diferentes (por exemplo, a 2.ª entrada da ALU vem de um registo ou do imediato).</p>`,
  key: 'Combinacional calcula, sequencial guarda. O caminho mais lento fixa o período.' },
{ id: 'pr-dp', t: 'proc', title: 'O datapath por classe de instrução',
  html: `<p>O datapath é o caminho dos dados. Cada classe usa partes diferentes:</p>
  <div class="tbl-wrap"><table><tr><th>Classe</th><th>Mem. instr.</th><th>Registos</th><th>ALU</th><th>Mem. dados</th><th>Escreve registo</th></tr>
  <tr><td>Tipo R</td><td>sim</td><td>lê 2</td><td>operação</td><td>não</td><td>sim</td></tr>
  <tr><td>lw</td><td>sim</td><td>lê 1</td><td>endereço</td><td>lê</td><td>sim</td></tr>
  <tr><td>sw</td><td>sim</td><td>lê 2</td><td>endereço</td><td>escreve</td><td>não</td></tr>
  <tr><td>beq</td><td>sim</td><td>lê 2</td><td>subtrai</td><td>não</td><td>não</td></tr></table></div>
  <p><b>Saltos condicionais</b>: compara-se com a ALU (subtração, sinal Zero). O destino é <b>PC + imediato × 2</b>: o imediato é estendido em sinal e deslocado 1 bit para a esquerda, porque os endereços de instrução são sempre pares.</p>
  <p>Na versão de ciclo único cada bloco só faz uma coisa por ciclo. Por isso são precisas <b>memórias de instruções e de dados separadas</b>: a mesma instrução tem de ler a instrução e aceder a um dado no mesmo ciclo.</p>`,
  key: 'Tipo R não usa a memória de dados; sw e beq não escrevem em registos.' },
{ id: 'pr-ctl', t: 'proc', title: 'O controlo e a ALU',
  html: `<p>O controlo é o maestro: lê o opcode e diz a cada bloco o que fazer. Gera sinais como RegWrite (escrever no registo), MemRead, MemWrite, ALUSrc (2.ª entrada da ALU: registo ou imediato), MemtoReg (o que se escreve: ALU ou memória) e Branch.</p>
  <p>A ALU recebe um código de 4 bits, em dois passos: o controlo principal gera um <b>ALUOp de 2 bits</b> a partir do opcode, e o controlo da ALU combina-o com funct3 e funct7.</p>
  <div class="tbl-wrap"><table><tr><th>Instrução</th><th>Operação na ALU</th><th>Controlo</th></tr>
  <tr><td>lw, sw</td><td>somar (endereço)</td><td>0010</td></tr><tr><td>beq</td><td>subtrair (comparar)</td><td>0110</td></tr>
  <tr><td>add</td><td>somar</td><td>0010</td></tr><tr><td>sub</td><td>subtrair</td><td>0110</td></tr><tr><td>and</td><td>E lógico</td><td>0000</td></tr><tr><td>or</td><td>OU lógico</td><td>0001</td></tr></table></div>
  <p>Exemplo: num <code>lw</code>, ALUSrc = 1 (imediato), MemRead = 1, MemtoReg = 1 (o que vem da memória), RegWrite = 1 e MemWrite = 0.</p>`,
  key: 'O opcode gera os sinais; ALUOp + funct dão a operação da ALU.' },
{ id: 'pr-single', t: 'proc', title: 'Porque o ciclo único não chega',
  html: `<p>No processador de <b>ciclo único</b>, cada instrução faz tudo num ciclo longo. O período tem de chegar para a instrução mais lenta, tal como um autocarro que só sai ao ritmo do passageiro mais lento.</p>
  <p>O <b>caminho crítico</b> é o do <code>lw</code>: memória de instruções → banco de registos → ALU → memória de dados → banco de registos.</p>
  <div class="tbl-wrap"><table><tr><th>Instrução</th><th>Fetch</th><th>Reg</th><th>ALU</th><th>Mem</th><th>Reg</th><th>Total</th></tr>
  <tr><td>lw</td><td>200</td><td>100</td><td>200</td><td>200</td><td>100</td><td>800 ps</td></tr>
  <tr><td>sw</td><td>200</td><td>100</td><td>200</td><td>200</td><td></td><td>700 ps</td></tr>
  <tr><td>Tipo R</td><td>200</td><td>100</td><td>200</td><td></td><td>100</td><td>600 ps</td></tr>
  <tr><td>beq</td><td>200</td><td>100</td><td>200</td><td></td><td></td><td>500 ps</td></tr></table></div>
  <p>Aqui o relógio tem de ser de 800 ps, mesmo para o <code>beq</code>, que só precisa de 500 ps. Não é viável variar o período por instrução, e isto viola o princípio de fazer depressa o caso comum. A solução é o <b>pipelining</b>.</p>`,
  key: 'Ciclo único: período = instrução mais lenta (o lw).' },

/* ---------------- PIPELINING ---------------- */
{ id: 'pi-idea', t: 'pipe', title: 'A ideia: uma linha de montagem',
  html: `<p>Numa lavandaria, não esperas que a roupa seque para começar a lavar a seguinte. O <b>pipelining</b> faz o mesmo: começa uma instrução antes de a anterior terminar.</p>
  <p>O RISC-V tem <b>5 andares</b>, um passo por ciclo:</p>
  <div class="tbl-wrap"><table><tr><th>Andar</th><th>O que faz</th></tr>
  <tr><td><b>F</b> (IF)</td><td>vai buscar a instrução à memória</td></tr><tr><td><b>D</b> (ID)</td><td>descodifica e lê os registos</td></tr>
  <tr><td><b>X</b> (EX)</td><td>executa ou calcula o endereço</td></tr><tr><td><b>M</b> (MEM)</td><td>acede à memória de dados</td></tr><tr><td><b>W</b> (WB)</td><td>escreve o resultado no registo</td></tr></table></div>
  ${PIPE([['Inst 1', 'FDXMW'], ['Inst 2', '.FDXMW'], ['Inst 3', '..FDXMW']])}
  <p>Melhora o <b>throughput</b> (instruções por unidade de tempo), mas <b>não reduz a latência</b> de cada instrução. Com o pipeline cheio termina uma instrução por ciclo: <b>CPI ideal = 1</b>.</p>`,
  key: 'Pipelining aumenta o throughput; a latência de cada instrução não baixa.' },
{ id: 'pi-time', t: 'pipe', title: 'As contas: período, latência e speedup',
  html: `<p>Dadas as latências de cada andar:</p>
  <ul><li><b>Sem pipeline</b>: período = <b>soma</b> de todas as latências.</li>
  <li><b>Com pipeline</b>: período = <b>a latência do andar mais lento</b>.</li>
  <li><b>Latência de uma instrução com pipeline</b> = nº de andares × período (todas passam pelos 5).</li>
  <li><b>Throughput</b> ≈ 1 instrução por período.</li></ul>
  <p>Exemplo: IF 250, ID 350, EX 150, MEM 300, WB 200 ps.</p>
  <ul><li>Sem pipeline: 1250 ps. Com pipeline: <b>350 ps</b>.</li>
  <li>Latência do lw: 1250 ps sem pipeline, 5 × 350 = <b>1750 ps</b> com pipeline. Piora!</li>
  <li>Throughput: 1 / 1250 ps = 800 MIPS sem pipeline, 1 / 350 ps ≈ 2857 MIPS com pipeline.</li>
  <li>Partir o andar mais lento (ID) em dois de 175 ps: o novo máximo é o <b>MEM</b>, 300 ps.</li></ul>
  <p><b>Speedup máximo = nº de andares</b>, só com andares equilibrados. Se não forem, é menor. Num programa curto, o tempo de encher o pipeline também pesa: n instruções demoram <b>(5 + n − 1)</b> ciclos.</p>`,
  key: 'Período com pipeline = andar mais lento. Latência = andares × período.' },
{ id: 'pi-isa', t: 'pipe', title: 'Registos de pipeline e porque o RISC-V encaixa',
  html: `<p>Entre andares existem <b>registos de pipeline</b> (IF/ID, ID/EX, EX/MEM, MEM/WB) que guardam o que o andar anterior produziu, como tabuleiros entre postos de uma linha de montagem. O controlo é gerado em D e viaja com a instrução.</p>
  <p>A ISA RISC-V foi pensada para isto:</p>
  <ul><li>todas as instruções têm <b>32 bits</b>: fácil de ir buscar e descodificar num ciclo (no x86 vão de 1 a 17 bytes);</li>
  <li><b>poucos formatos e regulares</b>: descodifica-se e leem-se os registos num só passo;</li>
  <li>a memória só é acedida em <b>loads e stores</b>: o andar X calcula o endereço;</li>
  <li>cada instrução escreve <b>no máximo um resultado</b>, nos últimos andares;</li>
  <li><b>operandos alinhados</b>: um acesso a dados só precisa de um acesso à memória.</li></ul>
  <p>Outras variantes: uma multiplicação lenta pode ocupar dois ciclos, em vez de tornar o relógio duas vezes mais lento; uma memória de dados lenta pode ser partida em DM1 e DM2.</p>`,
  key: 'Instruções de tamanho fixo e acesso à memória só em load/store tornam o pipeline simples.' },
{ id: 'pi-haz', t: 'pipe', title: 'Os três tipos de hazard',
  html: `<p>Um <b>hazard</b> é uma situação que impede a instrução seguinte de começar no ciclo seguinte. Há três:</p>
  <ul><li><b>Estrutural</b>: duas instruções querem o mesmo recurso ao mesmo tempo.</li>
  <li><b>De dados</b>: uma instrução precisa de um resultado que ainda não existe.</li>
  <li><b>De controlo</b>: não se sabe ainda qual é a instrução seguinte (saltos, exceções).</li></ul>
  <p>Podem sempre resolver-se <b>esperando</b> (stall), à custa do CPI.</p>
  <p>O caso clássico de hazard estrutural é ter <b>uma só memória</b> para instruções e dados. Cada load/store usa a memória em M, e nesse ciclo não se pode ir buscar outra instrução: uma <b>bolha</b> por load/store.</p>
  <p>Exemplo: 25% de loads e stores, sem dependências. CPI = 1 + 0,25 = <b>1,25</b>. Comparado com um processador sem pipeline (5 ciclos por instrução): speedup = 5 / 1,25 = <b>4</b>.</p>
  <p>Por isso o pipeline usa <b>caches separadas</b> de instruções e de dados.</p>`,
  key: 'Estrutural (recurso), dados (resultado), controlo (próxima instrução). Memória única = 1 bolha por load/store.' },
{ id: 'pi-diag', t: 'pipe', title: 'Como ler e desenhar o diagrama',
  html: `<p>O diagrama tem uma linha por instrução e uma coluna por ciclo. Regras para o desenhares no exame:</p>
  <ol><li>Cada instrução começa um ciclo depois da anterior.</li>
  <li>Se tiver de esperar, marca a espera (<b>–</b>) em D, a seguir ao ciclo em que descodificou.</li>
  <li>A instrução seguinte <b>fica presa em F</b> até D ficar livre.</li>
  <li>Só pode haver uma instrução em cada andar por ciclo.</li></ol>
  <p>Exemplo com uma bolha de 2 ciclos:</p>
  ${PIPE([['add x1, x2, x3', 'FDXMW'], ['sub x4, x1, x5', '.FD--XMW'], ['and x6, x7, x8', '..F--DXMW']])}
  <p><b>Tempos</b>:</p>
  <ul><li>Ciclos de uma <b>iteração</b> = distância, em ciclos, entre os dois F da mesma instrução em iterações seguidas. Analisa uma iteração do meio.</li>
  <li><b>CPI</b> = ciclos da iteração / instruções da iteração.</li>
  <li>Total com pipeline <b>vazio</b> no início: conta até ao <b>W da última instrução</b>.</li></ul>`,
  key: 'Espera em D; a seguinte fica presa em F. Ciclos da iteração = de F a F.' },

/* ---------------- DATA HAZARDS ---------------- */
{ id: 'h-deps', t: 'haz', title: 'Identificar dependências',
  html: `<p>Uma <b>dependência de dados (RAW)</b> existe quando uma instrução <b>lê</b> um registo que uma instrução anterior <b>escreve</b>. Olha para o registo de destino de cada instrução e procura-o nas fontes das seguintes.</p>
  <p>Fontes de cada instrução:</p>
  <div class="tbl-wrap"><table><tr><th>Instrução</th><th>Lê</th><th>Escreve</th></tr>
  <tr><td><code>add rd, rs1, rs2</code></td><td>rs1, rs2</td><td>rd</td></tr>
  <tr><td><code>lw rd, imm(rs1)</code></td><td>rs1</td><td>rd</td></tr>
  <tr><td><code>sw rs2, imm(rs1)</code></td><td>rs1, rs2</td><td>nada</td></tr>
  <tr><td><code>beq rs1, rs2, L</code></td><td>rs1, rs2</td><td>nada</td></tr></table></div>
  <p>Armadilhas: um <code>sw</code> <b>não escreve em registos</b>, por isso nunca é origem de dependência de registo. E num ciclo há dependências entre iterações: a primeira instrução pode ler o que a última escreveu.</p>
  <p><b>Dependência não é o mesmo que stall</b>: uma dependência só provoca bolhas se o valor não chegar a tempo. Com instruções afastadas, ou com forwarding, pode não custar nada.</p>`,
  key: 'RAW: ler o que outra acabou de escrever. Dependência ≠ stall.' },
{ id: 'h-stall', t: 'haz', title: 'Sem forwarding: esperar pelo registo',
  html: `<p>Sem forwarding, o valor só existe no banco de registos depois do <b>W</b> de quem o produz. Como o banco pode ser escrito e lido no mesmo ciclo, o consumidor pode estar em <b>D</b> no ciclo do <b>W</b> do produtor.</p>
  <p>Distância entre as duas instruções e bolhas necessárias:</p>
  <div class="tbl-wrap"><table><tr><th>Distância</th><th>Bolhas</th></tr><tr><td>1 (seguidas)</td><td>2</td></tr><tr><td>2 (uma no meio)</td><td>1</td></tr><tr><td>3 ou mais</td><td>0</td></tr></table></div>
  ${PIPE([['add x1, x2, x3', 'FDXMW'], ['sub x4, x1, x5', '.FD--XMW']])}
  <p>O D do <code>sub</code> só termina no ciclo 5, o W do <code>add</code>.</p>
  <p>Como se faz uma bolha em hardware? Põem-se a 0 os sinais de controlo em ID/EX (X, M e W não fazem nada, como um <b>nop</b>) e impede-se a atualização do PC e de IF/ID.</p>
  <p>Podem resolver-se também com instruções <b>nop</b> colocadas pelo compilador: funciona, mas degrada o desempenho.</p>`,
  key: 'Sem forwarding: seguidas 2 bolhas, com uma no meio 1, distância 3 nenhuma.' },
{ id: 'h-fwd', t: 'haz', title: 'Forwarding: usar o valor assim que existe',
  html: `<p>O resultado de uma soma existe no fim de <b>X</b>, muito antes de W. O <b>forwarding</b> (bypass) leva-o diretamente de um registo de pipeline à entrada onde é preciso, como passar um prato à mão em vez de o pousar e voltar a buscar.</p>
  <p>Caminhos, com os nomes usados nos exames:</p>
  <div class="tbl-wrap"><table><tr><th>Nome</th><th>De → para</th><th>Serve para</th></tr>
  <tr><td><b>ALU-ALU</b></td><td>EX/MEM → X</td><td>ALU seguida de quem usa o valor em X</td></tr>
  <tr><td><b>MEM-ALU</b></td><td>MEM/WB → X</td><td>load (depois de 1 bolha), ou ALU a 2 de distância</td></tr>
  <tr><td><b>ALU-MEM</b></td><td>→ M</td><td>ALU seguida de <code>sw</code> que guarda esse valor</td></tr>
  <tr><td><b>MEM-MEM</b></td><td>MEM/WB → M</td><td><code>lw</code> seguido de <code>sw</code> que copia o valor</td></tr></table></div>
  ${PIPE([['add x1, x2, x3', 'FDXMW'], ['sub x4, x1, x5', '.FDXMW'], ['and x6, x1, x7', '..FDXMW']])}
  <p>Com full forwarding, instruções ALU encadeadas não têm bolhas e o CPI fica 1.</p>
  <p>Se dois produtores estiverem no pipeline, encaminha-se o <b>mais recente</b>. Atenção: forwarding <b>tem custo em hardware</b> e pode aumentar o período. Pode haver um slowdown mesmo poupando ciclos.</p>
  <p>Ter só ALU-ALU significa que uma ALU a distância 2 ainda precisa de 1 bolha, porque não existe MEM → X.</p>`,
  key: 'ALU-ALU resolve o caso seguido. Atenção a que caminhos o enunciado dá.' },
{ id: 'h-load', t: 'haz', title: 'O load-use: a bolha que o forwarding não apaga',
  html: `<p>Um <code>lw</code> só tem o valor no fim de <b>M</b>. A instrução seguinte precisa dele no início de <b>X</b>: já seria tarde. Não dá para viajar no tempo, por isso há sempre <b>1 bolha</b>, mesmo com forwarding total.</p>
  ${PIPE([['lw x1, 0(x2)', 'FDXMW'], ['add x3, x1, x4', '.FD-XMW']])}
  <p>Exceções e variações, com full forwarding:</p>
  <ul><li><code>lw x1</code> seguido de <code>sw x1, …</code> (guardar o valor lido): <b>0 bolhas</b>, com o caminho MEM-MEM, porque o valor só é preciso em M.</li>
  <li><code>lw x1</code> seguido de <code>sw x5, 4(x1)</code> (o registo é a <b>base</b>): <b>1 bolha</b>, porque o endereço é calculado em X.</li>
  <li><code>lw x1</code>, outra instrução, e depois quem usa x1: <b>0 bolhas</b>.</li></ul>
  <p>Sem o caminho MEM-ALU (só ALU-ALU), o load-use custa <b>2 bolhas</b>, como se não houvesse forwarding.</p>`,
  key: 'Load seguido de uso em X: 1 bolha com full forwarding. Para sw do valor: 0.' },
{ id: 'h-sched', t: 'haz', title: 'Reordenar o código para evitar bolhas',
  html: `<p>O compilador pode trocar instruções desde que o resultado seja o mesmo. Mete entre um <code>lw</code> e quem o usa uma instrução que não dependa dele.</p>
  <p>Exemplo de <code>A = B + E; C = B + F;</code> com full forwarding:</p>
  <div class="tbl-wrap"><table><tr><th>Original (13 ciclos)</th><th>Reordenado (11 ciclos)</th></tr>
  <tr><td><code>lw t1, 0(t0)<br>lw t2, 4(t0)<br>add t3, t1, t2<br>sw t3, 12(t0)<br>lw t4, 8(t0)<br>add t5, t1, t4<br>sw t5, 16(t0)</code></td><td><code>lw t1, 0(t0)<br>lw t2, 4(t0)<br>lw t4, 8(t0)<br>add t3, t1, t2<br>sw t3, 12(t0)<br>add t5, t1, t4<br>sw t5, 16(t0)</code></td></tr></table></div>
  <p>Como avaliar uma reordenação:</p>
  <ol><li>Respeita as dependências? Quem lê um registo tem de ver o mesmo valor que via antes.</li>
  <li>Altera o valor de um <code>sw</code> ou o endereço? Se mudares um <code>addi</code> de sítio, pode ser preciso acertar um offset.</li>
  <li>Conta as bolhas que sobram.</li></ol>
  <p>Mover <code>addi x2, x2, 4</code> para cima de <code>sw x1, 0(x2)</code> só é válido se o offset passar a −4.</p>`,
  key: 'Separa o lw de quem o usa, sem mudar o que cada instrução lê.' },
{ id: 'h-count', t: 'haz', title: 'Receita: ciclos e CPI de uma iteração',
  html: `<p>A pergunta que sai sempre. Lê primeiro as condições: que forwarding, em que andar se resolvem os saltos, se há predição.</p>
  <ol><li>Conta as instruções da iteração, n.</li>
  <li>Soma as <b>bolhas de dados</b> de cada par com dependência.</li>
  <li>Soma as <b>bolhas do salto</b>: resolvido em D = 1, X = 2, M = 3, W = 4, sem predição.</li>
  <li><b>Ciclos = n + bolhas</b>. <b>CPI = ciclos / n</b>.</li></ol>
  <p>Exemplo com full forwarding e saltos resolvidos em X:</p>
  ${PIPE([['lw s4, 0(s6)', 'FDXMW'], ['add s5, s5, s4', '.FD-XMW'], ['sw s5, 0(s6)', '..F-DXMW'], ['sll s6, s5, 4', '....FDXMW'], ['bne s2, s5, L', '.....FDXMW'], ['lw s4, 0(s6)', '........FDXMW']])}
  <p>5 instruções + 1 bolha (load-use) + 2 do salto = <b>8 ciclos</b>, CPI = 8/5 = <b>1,6</b>.</p>
  <p><b>Atenção a um salto resolvido em D</b>: lê os registos em D, por isso uma instrução ALU imediatamente antes custa <b>1 bolha</b> mesmo com full forwarding. Um <code>lw</code> imediatamente antes custa 2.</p>`,
  key: 'Ciclos = instruções + bolhas de dados + bolhas do salto.' },

/* ---------------- CONTROL HAZARDS ---------------- */
{ id: 'bc-cost', t: 'ctl', title: 'O custo de um salto',
  html: `<p>Só se sabe a próxima instrução quando o salto for <b>resolvido</b>. Até lá ou se espera, ou se adivinha. É como chegar a um cruzamento sem saber se vais virar.</p>
  <p>Sem predição, o número de bolhas depende do andar onde o salto se resolve:</p>
  <div class="tbl-wrap"><table><tr><th>Resolvido em</th><th>Bolhas</th><th>CPI do salto</th></tr>
  <tr><td>D</td><td>1</td><td>2</td></tr><tr><td>X</td><td>2</td><td>3</td></tr><tr><td>M</td><td>3</td><td>4</td></tr><tr><td>W</td><td>4</td><td>5</td></tr></table></div>
  ${PIPE([['bne s2, s5, L', 'FDXMW'], ['alvo', '...FDXMW']])}
  <p>Acima, resolvido em X: o alvo só é buscado no ciclo 4, a seguir ao X. Os hazards de controlo são menos frequentes do que os de dados, mas não há nada tão eficaz contra eles como o forwarding é contra os de dados.</p>`,
  key: 'Bolhas do salto: D = 1, X = 2, M = 3, W = 4.' },
{ id: 'bc-flush', t: 'ctl', title: 'Flush não é o mesmo que nop',
  html: `<p>Quando as instruções erradas já entraram no pipeline, é preciso eliminá-las: <b>flush</b> (ou squashing). Zeram-se os bits de controlo dessas instruções, para não mudarem nada.</p>
  <div class="tbl-wrap"><table><tr><th></th><th>NOP</th><th>Flush</th></tr>
  <tr><td>O que é</td><td>uma operação vazia posta no pipeline</td><td>remover instruções que já entraram</td></tr>
  <tr><td>Efeito</td><td>só atrasa</td><td>impede que instruções erradas terminem e volta ao caminho certo</td></tr></table></div>
  <p>Isto só é seguro porque as instruções descartadas ainda <b>não alteraram o estado</b> da máquina: registos e memória só mudam em M e W.</p>`,
  key: 'Flush elimina instruções erradas; nop é só uma operação vazia.' },
{ id: 'bc-early', t: 'ctl', title: 'Resolver mais cedo: o salto em D',
  html: `<p>Mover a decisão para o andar <b>D</b> reduz o custo para <b>1 bolha</b>. É preciso hardware extra: um somador para o destino e um comparador em D, além de forwarding para D.</p>
  <p>Em pipelines mais profundos, a decisão fica ainda mais tarde e o custo aumenta.</p>
  <p>Mas repara na troca:</p>
  <ul><li>O salto lê os registos em D, por isso a dependência de uma instrução imediatamente anterior custa mais uma bolha.</li>
  <li>O hardware extra pode tornar o <b>período maior</b>.</li></ul>
  <p>Exemplo do MAP de 2025/26: passar os saltos de X para D reduz as 10 iterações de 80 para 70 ciclos, mas aumenta o período 1,1×. Speedup = 80 / (70 × 1,1) = <b>80/77</b>, quase nada.</p>`,
  key: 'Salto em D custa 1 bolha, mas pode alongar o período.' },
{ id: 'bc-static', t: 'ctl', title: 'Predição estática',
  html: `<p>Em vez de esperar, adivinha-se e continua-se. Só há custo quando se <b>erra</b>.</p>
  <ul><li><b>Predict not taken</b>: continua-se na sequência. Se o salto se realizar, faz-se flush. Funciona bem em saltos no <b>topo</b> de um ciclo; mal nos do <b>fundo</b>, porque quase sempre saltam.</li>
  <li><b>Predict taken</b>: assume que salta. Com o destino calculado em D, custa sempre <b>1 bolha</b>, porque só em D se conhece o endereço.</li>
  <li><b>Regra típica</b>: saltos <b>para trás</b> preveem-se tomados (ciclos); <b>para a frente</b>, não tomados (ifs).</li></ul>
  <p><b>CPI do salto com predição</b> = CPI ao acertar × taxa de acerto + CPI ao errar × taxa de erro.</p>
  <p>Exemplo: 90% de acerto, salto resolvido em X (errar custa 2 bolhas): CPI = 1 × 0,9 + 3 × 0,1 = <b>1,2</b>.</p>`,
  key: 'Só se paga ao errar. CPI = 1 × acerto + (1 + bolhas) × erro.' },
{ id: 'bc-dyn', t: 'ctl', title: 'Predição dinâmica',
  html: `<p>O hardware mede o comportamento real de cada salto e assume que continua igual. Uma <b>Branch History Table (BHT)</b>, indexada pelos bits baixos do PC, guarda o que aconteceu da última vez.</p>
  <p><b>Preditor de 1 bit</b>: guarda só o último resultado. Num ciclo interno erra <b>2 vezes</b>: na última iteração (prevê tomado e não é) e na primeira da vez seguinte (prevê não tomado e é).</p>
  <p><b>Preditor de 2 bits</b>: só muda de previsão ao fim de <b>duas falhas seguidas</b>, por isso o ciclo interno erra só na saída.</p>
  <p>Um bit da BHT pode pertencer a outro salto com os mesmos bits baixos no PC. Isso só afeta o <b>desempenho</b>, nunca a correção.</p>
  <p>Mesmo a prever bem, é preciso saber o <b>endereço de destino</b>. O <b>Branch Target Buffer (BTB)</b> é uma cache de destinos indexada pelo PC, consultada em F: em caso de hit e de salto previsto tomado, o destino é buscado logo.</p>`,
  key: 'Bit: erra 2× por ciclo. 2 bits: muda só após 2 falhas. BTB guarda destinos.' },
{ id: 'bc-delay', t: 'ctl', title: 'Delay slot: aproveitar a bolha',
  html: `<p>Com <b>delayed branch</b>, a instrução a seguir ao salto executa <b>sempre</b>, salte ou não. O compilador tenta lá colocar algo útil.</p>
  <p>Como escolher (com delay slot de uma instrução):</p>
  <ol><li>Uma instrução <b>anterior ao salto</b> que o salto não leia e que possa ir para depois dele. É a melhor opção, sempre útil.</li>
  <li>Instrução vinda do destino, ajustando o endereço do salto. Só é útil se saltar.</li>
  <li>Se nada servir, um <code>nop</code>.</li></ol>
  <p>Exemplo:</p>
  <div class="tbl-wrap"><table><tr><th>Sem delay slot</th><th>Com delay slot</th></tr>
  <tr><td><code>L: lw t2, 0(t2)<br>or t2, t2, t3<br>addi t6, t6, 1<br>beq t6, t4, L</code></td><td><code>L: lw t2, 0(t2)<br>addi t6, t6, 1<br>beq t6, t4, L<br>or t2, t2, t3</code></td></tr></table></div>
  <p>O <code>or</code> pode ir para o slot porque o <code>beq</code> não lê t2. O <code>addi</code> não podia: o <code>beq</code> depende de t6.</p>`,
  key: 'Instrução do slot executa sempre. Escolhe uma de antes de que o salto não dependa.' },
{ id: 'bc-exc', t: 'ctl', title: 'Exceções e interrupções',
  html: `<p>São mudanças inesperadas no fluxo de controlo. A diferença está na origem:</p>
  <ul><li><b>Exceção</b>: nasce <b>dentro</b> do CPU (opcode indefinido, overflow, ecall).</li>
  <li><b>Interrupção</b>: vem de um <b>controlador de I/O</b> externo.</li></ul>
  <p>No RISC-V o <b>SEPC</b> guarda o PC da instrução causadora, o <b>SCAUSE</b> guarda o motivo, e salta-se para o handler. Com ponto de entrada único, o SO descodifica o SCAUSE. Com <b>interrupções vetorizadas</b>, o endereço depende da causa: PC = base + 4 × causa. É mais rápido e comum em sistemas de tempo real.</p>
  <p>No pipeline, uma exceção é outra forma de hazard de controlo: impede-se a escrita da instrução (por exemplo o registo do <code>add</code>), <b>completam-se as anteriores</b>, faz-se flush dela e das seguintes, guardam-se SEPC e SCAUSE e salta-se para o handler.</p>
  <p><b>Precisa</b>: trata-se a exceção da instrução mais antiga, como se fosse a única. <b>Imprecisa</b>: para-se o pipeline e deixa-se o handler decidir; simplifica o hardware e complica o software, e é inviável em pipelines com multiple issue e execução fora de ordem.</p>`,
  key: 'Exceção é interna; interrupção é externa. Precisa: completa as anteriores, descarta as seguintes.' },

/* ---------------- ADVANCED: from past exams only ---------------- */
{ id: 'a-vliw', t: 'adv', title: 'VLIW e superescalar',
  html: `<p>Para ter <b>CPI abaixo de 1</b> é preciso emitir mais do que uma instrução por ciclo.</p>
  <div class="tbl-wrap"><table><tr><th></th><th>VLIW (static)</th><th>Superescalar (dynamic)</th></tr>
  <tr><td>Quem decide o paralelismo</td><td>o <b>compilador</b></td><td>o <b>hardware</b></td></tr><tr><td>Ordem</td><td>em ordem</td><td>pode executar fora de ordem</td></tr></table></div>
  <p>Exemplo de VLIW dual-issue, com pares &lt;ALU, load/store&gt; e &lt;ALU, salto&gt;. As duas instruções de um pacote <b>leem os valores antigos</b>, porque arrancam ao mesmo tempo:</p>
  <div class="tbl-wrap"><table><tr><td><code>Loop: &lt; addi x6, x6, 4 ; lw x5, 0(x6) &gt;<br>&lt; add x7, x7, x5 ; blt x6, x8, Loop &gt;</code></td></tr></table></div>
  <p>Aqui o <code>lw</code> lê o x6 anterior ao <code>addi</code>, tal como no código original. Dois pacotes em vez de quatro instruções.</p>
  <p>Regras a verificar: cada pacote tem um par permitido; quem usa um resultado vai num pacote <b>posterior</b>; depois de um load, respeita-se a bolha de load-use.</p>
  ${NOSLIDES}`,
  key: 'VLIW: compilador decide. Superescalar: hardware decide. CPI pode ser menor que 1.' },
{ id: 'a-unroll', t: 'adv', title: 'Desenrolar ciclos',
  html: `<p><b>Loop unrolling</b>: repete-se o corpo do ciclo para fazer menos saltos e criar mais oportunidades de escalonamento.</p>
  <p>Ao desenrolar por 2:</p>
  <ul><li>O salto fica <b>só no fim</b>: um por cada duas iterações originais.</li>
  <li>Junta-se o incremento do ponteiro: dois <code>addi x, x, 4</code> viram um <code>addi x, x, 8</code>, e ajustam-se os offsets.</li>
  <li>Usam-se registos novos para os valores temporários, para evitar dependências falsas.</li></ul>
  <p>Exemplo: de <code>lw, add, addi, bne</code> para:</p>
  <div class="tbl-wrap"><table><tr><td><code>Loop: lw s2, 0(s5)<br>lw s3, 4(s5)<br>add s1, s1, s2<br>addi s5, s5, 8<br>add s1, s1, s3<br>bne s5, s6, Loop</code></td></tr></table></div>
  <p>Sem forwarding e com salto em D, isto dá 9 ciclos para as 2 iterações, contra 18 no código original. O ponteiro pode ser acertado cedo porque os <code>lw</code> já leram.</p>
  ${NOSLIDES}`,
  key: 'Desenrolar corta saltos e permite fundir os incrementos do ponteiro.' },
{ id: 'a-mp', t: 'adv', title: 'Multiprocessadores: UMA, NUMA e coerência',
  html: `<ul><li><b>UMA</b>: todos os processadores acedem à memória com o <b>mesmo tempo</b>.</li>
  <li><b>NUMA</b>: memória partilhada, mas <b>fisicamente distribuída</b>: o tempo depende da zona acedida.</li>
  <li><b>Message passing</b>: cada um tem a sua memória e comunica por mensagens.</li></ul>
  <p>Com caches privadas é preciso <b>coerência</b>: todas as caches veem o valor mais recente de cada bloco. A <b>consistência</b> define <b>quando</b> os valores se tornam visíveis aos outros.</p>
  <p><b>Snooping com invalidação</b>: quando um core escreve num bloco partilhado, envia um sinal no barramento e as outras cópias são invalidadas.</p>
  <p><b>Multithreading fine-grain</b>: troca de thread a cada ciclo. Instruções vizinhas no pipeline são de threads diferentes, por isso reduz a necessidade de forwarding.</p>
  ${NOSLIDES}`,
  key: 'UMA: tempo igual. NUMA: depende da região. Escrita partilhada invalida as outras cópias.' },
{ id: 'a-par', t: 'adv', title: 'Paralelizar: dividir o trabalho e medir o speedup',
  html: `<p>Dividir N elementos por P threads: <b>RANGE = N / P</b>, e a thread k faz de k × RANGE até (k+1) × RANGE − 1.</p>
  <p><b>O tempo paralelo é o da thread mais lenta</b>, mais o que for sequencial e a sincronização.</p>
  <p>Exemplo: soma de 1000 elementos em 10 threads, cada soma T, <code>synch</code> 11T. Sequencial = 1000T. Paralelo: 100T (somas) + 11T (synch) + 9T (a thread 0 junta as outras 9 somas) = 120T. Speedup = 1000/120 ≈ <b>8</b>.</p>
  <p>Mau balanceamento: 400 números por 4 processos, um com o dobro dos outros: x + x + x + 2x = 400, x = 80, o mais lento faz 160. Speedup = 400/160 = <b>2,5</b>.</p>
  <p><b>Caches</b>: cada thread deve trabalhar numa zona contínua e sua, para reduzir o tráfego de coerência. Acumula numa variável <b>local</b> e só escreve o resultado na variável partilhada no fim.</p>
  ${NOSLIDES}`,
  key: 'Speedup = sequencial / (thread mais lenta + sincronização + parte sequencial).' },
{ id: 'a-io', t: 'adv', title: 'Entradas/saídas: polling, interrupções e DMA',
  html: `<ul><li><b>Polling</b>: o CPU verifica periodicamente o estado do dispositivo. Razoável em controladores simples, com pouca carga e CPU disponível.</li>
  <li><b>Interrupções</b>: o dispositivo avisa o CPU quando precisa dele.</li>
  <li><b>DMA</b> (Direct Memory Access): um controlador transfere blocos entre o dispositivo e a memória <b>sem intervenção contínua do CPU</b>, que só é avisado no fim.</li></ul>
  <p>O DMA escreve na memória, por isso <b>pode alterar posições guardadas em cache</b>: há um problema de coerência.</p>
  <p>Em geral, um processo em modo utilizador não acede diretamente ao I/O: passa pelo sistema operativo.</p>
  <p>Num disco magnético o tempo de acesso soma seek (colocar a cabeça), latência rotacional, transferência e controlador.</p>
  ${NOSLIDES}`,
  key: 'Polling pergunta, interrupção avisa, DMA transfere sem ocupar o CPU.' },
{ id: 'a-raid', t: 'adv', title: 'RAID e fiabilidade',
  html: `<p>Com muitos discos, algum falha. O <b>MTTF</b> (Mean Time To Failure) mede a fiabilidade.</p>
  <ul><li>Falhas esperadas = nº de discos × horas de funcionamento / MTTF.</li>
  <li>Exemplo: 4000 discos, MTTF 10⁶ h, ano de 9000 h: 4000 × 9000 / 10⁶ = <b>36 falhas/ano</b>.</li></ul>
  <div class="tbl-wrap"><table><tr><th>Nível</th><th>Como funciona</th><th>Capacidade útil de n discos</th><th>Falha de um disco</th></tr>
  <tr><td><b>RAID 0</b></td><td>striping, sem redundância</td><td>n</td><td>perde tudo; MTTF = MTTF do disco / n</td></tr>
  <tr><td><b>RAID 1</b></td><td>espelho</td><td>n / 2</td><td>continua</td></tr>
  <tr><td><b>RAID 5</b></td><td>paridade distribuída</td><td>n − 1</td><td>continua</td></tr></table></div>
  <p>Desempenho puro (streaming): RAID 0. Disponibilidade (backup): RAID 5.</p>
  ${NOSLIDES}`,
  key: 'Falhas = discos × horas / MTTF. RAID 0 divide o MTTF por n.' },
]);
