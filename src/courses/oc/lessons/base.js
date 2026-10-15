/* ===== OC lessons (theory). Each card: analogy → theory → worked example → key line. ===== */
STUDY.lessons('oc', [
/* ---------------- PERFORMANCE ---------------- */
{ id: 'p-time', t: 'perf', title: 'Desempenho = 1 / tempo',
  html: `<p>Qual é o melhor avião: o que leva mais passageiros, o que voa mais longe ou o mais rápido? Depende da pergunta. Em OC também há duas perguntas diferentes:</p>
  <ul><li><b>Tempo de resposta</b> (latência): quanto tempo demora <i>uma</i> tarefa. É o que interessa a quem está à espera.</li>
  <li><b>Throughput</b> (débito): quanto trabalho se faz por unidade de tempo. Mais processadores aumentam o throughput, mas não tornam uma tarefa sequencial mais rápida.</li></ul>
  <p>Na cadeira olhamos sobretudo para o tempo de resposta e definimos <b>Desempenho = 1 / Tempo de execução</b>.</p>
  <p><b>“X é n vezes mais rápido que Y”</b> quer dizer: <b>Speedup = Desempenho<sub>X</sub> / Desempenho<sub>Y</sub> = Tempo<sub>Y</sub> / Tempo<sub>X</sub> = n</b>. Repara que os tempos aparecem trocados.</p>
  <p>Exemplo: A demora 10 s e B demora 15 s. Speedup de A sobre B = 15/10 = <b>1,5</b>: A é 1,5 vezes mais rápido.</p>
  <p>O <b>tempo decorrido</b> (elapsed) inclui tudo: I/O, sistema operativo, esperas. O <b>tempo de CPU</b> conta só o tempo em que o processador trabalhou nesta tarefa (user + system).</p>`,
  key: 'Speedup = tempo antigo / tempo novo. Maior que 1 = ficou mais rápido.' },
{ id: 'p-clock', t: 'perf', title: 'O relógio: período e frequência',
  html: `<p>O processador avança ao ritmo de um relógio, como um remador que só puxa o remo a cada batida do tambor. Em cada <b>ciclo</b> o hardware calcula e, na batida seguinte, guarda o resultado.</p>
  <ul><li><b>Período</b> T<sub>clk</sub>: duração de um ciclo (ns, ps).</li>
  <li><b>Frequência</b> f<sub>clk</sub> = 1 / T<sub>clk</sub>: ciclos por segundo (Hz).</li></ul>
  <div class="tbl-wrap"><table><tr><th>Frequência</th><th>Período</th></tr>
  <tr><td>1 GHz</td><td>1 ns</td></tr><tr><td>2 GHz</td><td>0,5 ns = 500 ps</td></tr><tr><td>4 GHz</td><td>0,25 ns = 250 ps</td></tr><tr><td>200 MHz</td><td>5 ns</td></tr><tr><td>500 MHz</td><td>2 ns</td></tr></table></div>
  <p><b>Tempo de CPU = Ciclos × T<sub>clk</sub> = Ciclos / f<sub>clk</sub></b>. Para melhorar: menos ciclos ou relógio mais rápido. Muitas vezes há um compromisso: acelerar o relógio obriga a mais ciclos por instrução.</p>
  <p>Truque para converter tempos em ciclos: ciclos = tempo / T<sub>clk</sub>. Com 4 GHz, 100 ns = 100 / 0,25 = <b>400 ciclos</b>.</p>`,
  key: 'f = 1/T. 1 GHz ↔ 1 ns. Ciclos = tempo ÷ período.' },
{ id: 'p-cpi', t: 'perf', title: 'A equação de desempenho: IC × CPI × T',
  html: `<p>Pensa numa viagem: o tempo total é <i>número de troços</i> × <i>passos por troço</i> × <i>duração de cada passo</i>. No processador é igual:</p>
  <p style="text-align:center"><b>Tempo de CPU = IC × CPI × T<sub>clk</sub> = IC × CPI / f<sub>clk</sub></b></p>
  <ul><li><b>IC</b> (instruction count): quantas instruções são executadas. Depende do programa, do compilador e da ISA.</li>
  <li><b>CPI</b> (ciclos por instrução, em média): depende sobretudo do hardware, e também da mistura de instruções.</li>
  <li><b>T<sub>clk</sub></b>: depende da tecnologia e da organização do processador.</li></ul>
  <div class="tbl-wrap"><table><tr><th>Quem</th><th>Afeta</th></tr>
  <tr><td>Algoritmo</td><td>IC, possivelmente CPI</td></tr><tr><td>Linguagem</td><td>IC, CPI</td></tr><tr><td>Compilador</td><td>IC, CPI</td></tr><tr><td>ISA</td><td>IC, CPI, T<sub>clk</sub></td></tr></table></div>
  <p>Exemplo das aulas: A tem T = 250 ps e CPI = 2,0; B tem T = 500 ps e CPI = 1,2 (mesma ISA, logo o mesmo IC). Tempo A = I × 500 ps; tempo B = I × 600 ps. <b>A é 600/500 = 1,2 vezes mais rápido</b>, apesar de ter pior CPI.</p>`,
  key: 'Nenhum dos três fatores chega sozinho: compara sempre o produto IC × CPI × T.' },
{ id: 'p-cpimix', t: 'perf', title: 'Receita: CPI médio de uma mistura de instruções',
  html: `<p>Se cada tipo de instrução gasta um número diferente de ciclos, o CPI do programa é uma <b>média ponderada</b>, como a média de um curso em que cada cadeira pesa os seus créditos.</p>
  <p><b>Ciclos = Σ (CPI<sub>i</sub> × IC<sub>i</sub>)</b> e <b>CPI = Ciclos / IC = Σ (CPI<sub>i</sub> × frequência<sub>i</sub>)</b></p>
  <p>Exemplo (MAP 2025/26): 600 aritméticas (1 ciclo), 200 loads (4), 100 stores (4), 100 branches (2).</p>
  <ol><li>Ciclos = 600×1 + 200×4 + 100×4 + 100×2 = 600 + 800 + 400 + 200 = <b>2000</b></li>
  <li>CPI = 2000 / 1000 = <b>2,0</b></li></ol>
  <p>Se uma otimização trocar 100 loads, 50 stores e 50 branches por aritméticas (mantendo as 1000 instruções): ciclos = 800×1 + 100×4 + 50×4 + 50×2 = 1500, CPI = 1,5 e speedup = 2,0 / 1,5 ≈ <b>1,33</b> (o IC e o relógio não mudaram).</p>
  <p>Com percentagens é igual: 50% ALU (1), 20% load (5), 10% store (3), 20% branch (2) → CPI = 0,5 + 1,0 + 0,3 + 0,4 = <b>2,2</b>.</p>`,
  key: 'CPI médio = Σ CPIᵢ × fraçãoᵢ. Com o mesmo IC e relógio, speedup = CPI antigo / CPI novo.' },
{ id: 'p-mips', t: 'perf', title: 'MIPS, benchmarks e energia',
  html: `<p><b>MIPS</b> (aqui: <i>milhões de instruções por segundo</i>, não o processador) = IC / (Tempo × 10⁶) = f<sub>clk</sub> / (CPI × 10⁶).</p>
  <p>Exemplo: 1 GHz com CPI = 3 → 10⁹ / 3 ≈ 333 × 10⁶ instruções/s = <b>333 MIPS</b>.</p>
  <p>É uma métrica traiçoeira, como comparar carros pelas rotações do motor:</p>
  <ul><li>Não tem em conta <b>ISAs diferentes</b> (uma instrução CISC pode fazer o trabalho de várias RISC).</li>
  <li>Não tem em conta a <b>complexidade</b> das instruções.</li>
  <li>O CPI varia de programa para programa no mesmo CPU.</li></ul>
  <p>Por isso usam-se <b>benchmarks</b>, como o <b>SPEC CPU</b>: programas típicos, tempo normalizado em relação a uma máquina de referência e resumido pela <b>média geométrica</b> das razões. Em sistemas com bateria, a métrica que mais conta pode ser a <b>eficiência energética</b>.</p>`,
  key: 'A única métrica honesta é o tempo de execução de programas reais. MIPS engana entre ISAs.' },
{ id: 'p-amdahl', t: 'perf', title: 'Lei de Amdahl: acelerar só uma parte',
  html: `<p>Vais de casa à faculdade: 40 min de comboio e 20 min a pé. Se o comboio ficar 2× mais rápido, a viagem passa a 20 + 20 = 40 min. Ficaste só 1,5× mais rápido, não 2×. A parte que não melhorou passa a mandar.</p>
  <p>Com <b>f</b> = fração do tempo <b>original</b> que é melhorada e <b>k</b> = fator de melhoria:</p>
  <p style="text-align:center"><b>S = 1 / [ (1 − f) + f / k ]</b></p>
  <ul><li>Limite: mesmo com k → ∞, <b>S<sub>max</sub> = 1 / (1 − f)</b>. Com f = 50% nunca passas de 2.</li>
  <li>Corolário: <b>torna rápido o caso comum</b>.</li></ul>
  <p><b>Receita</b>, por exemplo f = 40% e k = 3:</p>
  <ol><li>Tempo novo (com tempo original = 1) = 0,6 + 0,4/3 ≈ 0,733</li><li>S = 1 / 0,733 = 3 / 2,2 ≈ <b>1,36</b></li></ol>
  <p><b>Armadilha clássica:</b> se te disserem que a parte melhorada ocupa X% do tempo <b>depois</b> da otimização, primeiro converte para o tempo original. Ex.: modo acelerado 10× ocupa 50% do tempo novo. Tempo novo = 1 (0,5 + 0,5); a parte melhorada valia 0,5 × 10 = 5 → tempo original = 5,5 → <b>S = 5,5</b>, e f = 5/5,5 ≈ 91%.</p>`,
  key: 'S = 1 / ((1−f) + f/k), com f medido ANTES. O máximo é 1/(1−f).' },

/* ---------------- BITS ---------------- */
{ id: 'b-hex', t: 'bits', title: 'Binário ↔ hexadecimal e potências de 2',
  html: `<p>Um dígito hexadecimal = <b>4 bits</b> (um “quarteto”). Para converter, agrupa os bits de 4 em 4 <b>a partir da direita</b>.</p>
  <p><code class="mono">0b 1010 1110 = 0xAE</code> · <code class="mono">0b 0101 0000 0111 = 0x507</code> · <code class="mono">0x7FEA = 0111 1111 1110 1010</code></p>
  <div class="tbl-wrap"><table><tr><th>hex</th><td>8</td><td>9</td><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><td>F</td></tr><tr><th>bin</th><td>1000</td><td>1001</td><td>1010</td><td>1011</td><td>1100</td><td>1101</td><td>1110</td><td>1111</td></tr></table></div>
  <p><b>Potências de 2 para saber de cor</b>: 2¹⁰ = 1024 = 1 K · 2²⁰ = 1 M · 2³⁰ = 1 G · 2³² = 4 G. Assim 8 KB = 2³ × 2¹⁰ = <b>2¹³</b> B e 64 KB = <b>2¹⁶</b> B.</p>
  <p>Um campo com <b>n bits</b> distingue <b>2ⁿ</b> valores. Para escolher entre N coisas (N potência de 2) precisas de <b>log₂ N</b> bits: 256 linhas → 8 bits; 32 bytes → 5 bits.</p>`,
  key: '4 bits = 1 dígito hex. n bits → 2ⁿ valores; N valores → log₂N bits.' },
{ id: 'b-ops', t: 'bits', title: 'Shifts e máscaras: and, or, xor',
  html: `<ul><li><b>x &lt;&lt; n</b>: desloca para a esquerda = multiplica por 2ⁿ (entram zeros à direita).</li>
  <li><b>x &gt;&gt; n</b> lógico (<code class="mono">srl</code>): divide por 2ⁿ, entram zeros. <b>Aritmético</b> (<code class="mono">sra</code>): entra o bit de sinal, para manter números negativos negativos.</li>
  <li><b>AND</b> é uma peneira: com uma <b>máscara</b>, guarda só os bits onde a máscara tem 1 e põe o resto a 0.</li>
  <li><b>OR</b> é um interruptor “ligar”: força a 1 os bits da máscara e deixa o resto igual.</li>
  <li><b>XOR</b> é um detetor de diferenças: dá 1 onde os bits diferem. XOR com 1 inverte o bit, por isso <b>x XOR 0xFFFFFFFF = NOT x</b>.</li></ul>
  <p>Exemplos: <code class="mono">0x75 &amp; 0x0F = 0x05</code> · <code class="mono">0x75 ^ 0x55 = 0x20</code> · <code class="mono">0x75 &gt;&gt; 2 = 0x1D</code> · <code class="mono">0b0111 &lt;&lt; 1 = 0xE</code></p>
  <p><b>Extrair um campo</b> de uma palavra: desloca-o para a direita até ao bit 0 e aplica uma máscara com tantos 1s quanto a largura. Campo nos bits 18..8 (11 bits): <code class="mono">(x &gt;&gt; 8) &amp; 0x7FF</code>.</p>`,
  key: 'AND limpa, OR liga, XOR inverte/compara. Extrair campo = shift para a direita + máscara.' },
{ id: 'b-c2', t: 'bits', title: 'Complemento para 2',
  html: `<p>Imagina o conta-quilómetros de um carro com 3 dígitos: se andares 1 km para trás a partir de 000 aparece 999. Isso é “−1”. Em binário de 32 bits, <b>−1 = 0xFFFFFFFF</b>.</p>
  <ul><li>O bit mais significativo é o <b>bit de sinal</b> (1 = negativo).</li>
  <li>Gama com n bits: <b>−2ⁿ⁻¹ … +2ⁿ⁻¹ − 1</b>. Com 8 bits: −128 … 127. Com 12 bits (imediato do RISC-V): <b>−2048 … 2047</b>.</li>
  <li><b>Negar</b>: inverter todos os bits e somar 1. 24 = 0001 1000 → 1110 0111 + 1 = <b>1110 1000</b> = −24.</li>
  <li><b>Extensão de sinal</b>: para passar para mais bits, copia-se o bit de sinal. −2: 1111 1110 → 1111 1111 1111 1110.</li>
  <li>Positivos têm a mesma representação com e sem sinal. O mais negativo, 1000…0, não tem simétrico representável.</li></ul>
  <p>O mesmo padrão de bits pode valer coisas diferentes: <code class="mono">0x94924924</code> é 2 492 614 948 sem sinal e −1 802 352 348 em complemento para 2. Os bits não sabem: é a instrução que decide como os interpreta (<code class="mono">blt</code> vs <code class="mono">bltu</code>, <code class="mono">lb</code> vs <code class="mono">lbu</code>).</p>`,
  key: 'Negar = inverter + 1. −1 = tudo a 1s. Estender o sinal = repetir o bit mais à esquerda.' },
{ id: 'b-ovf', t: 'bits', title: 'Overflow',
  html: `<p>Overflow é quando o resultado <b>não cabe</b> nos bits disponíveis, como um copo que transborda.</p>
  <p>Em complemento para 2, numa soma:</p>
  <ul><li>Somar um positivo com um negativo <b>nunca</b> dá overflow: o resultado fica entre os dois.</li>
  <li>Há overflow quando dois números do <b>mesmo sinal</b> dão um resultado de <b>sinal contrário</b>: positivo + positivo = “negativo”, ou negativo + negativo = “positivo”.</li></ul>
  <p>Exemplo: <code class="mono">0x7FFFFFFF</code> é o maior positivo. Somar −1 não dá overflow; somar 1024 já dá.</p>
  <p>Outro: <code class="mono">0x70000000 + 0x24924924 = 0x94924924</code>. Dois positivos deram um número com o bit 31 a 1, logo <b>há overflow</b>.</p>
  <p>O RISC-V <b>não tem flags</b> e o <code class="mono">add</code> não gera exceção: se interessa detetar overflow, o software tem de o verificar com instruções extra.</p>`,
  key: 'Overflow só quando os dois operandos têm o mesmo sinal e o resultado tem o sinal oposto.' },
{ id: 'b-mental', t: 'bits', title: 'Contas sem calculadora (o teste é sem calculadora)',
  html: `<p>As contas do teste são pensadas para se fazerem à mão. Alguns truques:</p>
  <ul><li><b>Divisões por potências de 2</b> = tirar expoentes: 8192 / 32 = 2¹³ / 2⁵ = 2⁸ = 256.</li>
  <li><b>Frações fáceis</b>: 1/0,8 = 1,25 · 1/0,75 ≈ 1,33 · 1/0,6 ≈ 1,67 · 1/0,4 = 2,5 · 1/0,25 = 4.</li>
  <li><b>Multiplicar para tirar vírgulas</b>: 1 / 0,733 = 3 / 2,2 (multiplica em cima e em baixo por 3).</li>
  <li><b>Percentagens de ciclos</b>: 0,05 × 100 = 5; 0,02 × 35 = 0,7.</li>
  <li><b>ns ↔ ciclos</b>: a 2 GHz, 1 ciclo = 0,5 ns, por isso 100 ns = 200 ciclos.</li>
  <li>Antes de calcular, <b>estima</b>. Um AMAT nunca é menor que o tempo de hit; um speedup de Amdahl nunca passa de 1/(1−f). Isto elimina logo opções.</li></ul>
  <p>Se uma conta te encravar, <b>salta-a</b> e volta no fim: noutras perguntas os pontos ganham-se mais depressa.</p>`,
  key: 'Trabalha com potências de 2 e frações simples; estima primeiro para eliminar opções.' },

/* ---------------- ISA ---------------- */
{ id: 'i-isa', t: 'isa', title: 'O que é uma ISA',
  html: `<p>A <b>ISA</b> (<i>Instruction Set Architecture</i>) é o contrato entre o hardware e o software de mais baixo nível. É como o menu de um restaurante: diz o que podes pedir (instruções, registos, acesso à memória, I/O), mas não como a cozinha o prepara.</p>
  <ul><li>É a arquitetura <b>vista pelos geradores de código</b> (compiladores, assemblers).</li>
  <li>É <b>independente da implementação</b>: o mesmo programa corre em processadores diferentes com a mesma ISA. A implementação concreta chama-se <b>microarquitetura</b>.</li>
  <li>Conceito introduzido pela IBM nos anos 60 (IBM 360/370).</li></ul>
  <p>Como se avalia uma ISA? Métricas de projeto (custo, potência, facilidade de compilar), <b>estáticas</b> (quantos bytes ocupa o programa) e <b>dinâmicas</b> (quantas instruções se executam, CPI, frequência). A métrica que manda é sempre o <b>tempo de execução</b>.</p>`,
  key: 'ISA = interface hardware/software para quem gera código. Microarquitetura = como se implementa.' },
{ id: 'i-risc', t: 'isa', title: 'RISC vs CISC e o RISC-V',
  html: `<div class="tbl-wrap"><table><tr><th></th><th>RISC</th><th>CISC</th></tr>
  <tr><td>Nº de instruções</td><td>poucas</td><td>muitas</td></tr>
  <tr><td>Cada instrução</td><td>simples, muitas vezes 1 ciclo</td><td>complexa, vários passos</td></tr>
  <tr><td>Operandos</td><td>número fixo</td><td>variável</td></tr>
  <tr><td>Modos de endereçamento</td><td>poucos (3 a 5)</td><td>muitos (10 a 15)</td></tr>
  <tr><td>Acesso à memória</td><td>só load/store</td><td>muitas instruções acedem</td></tr></table></div>
  <p>Analogia: RISC é uma caixa de Lego com peças simples e iguais que se encaixam depressa; CISC é um kit com peças especiais para cada coisa. Hoje quase tudo é RISC (ARM, RISC-V); o <b>x86</b> é o grande resistente CISC, e por dentro traduz as instruções em micro-operações tipo RISC.</p>
  <p><b>RISC-V</b>: ISA <b>aberta</b> (Berkeley, 2010). Bases RV32I/RV64I mais extensões opcionais (M multiplicação, F/D vírgula flutuante, C instruções comprimidas de 16 bits…). Na cadeira usamos <b>RV32I</b>: endereços de 32 bits, <b>32 registos de 32 bits</b>, complemento para 2, arquitetura <b>load-store</b>.</p>`,
  key: 'RISC: instruções simples, formato regular, só load/store tocam na memória.' },
{ id: 'i-regs', t: 'isa', title: 'Registos do RISC-V',
  html: `<p>Os registos são a bancada de trabalho do processador: pouco espaço, mas tudo à mão. A memória é o armazém.</p>
  <ul><li><b>32 registos</b> de 32 bits, x0 a x31. O banco de registos tem <b>2 portas de leitura e 1 de escrita</b>.</li>
  <li><b>x0 (zero) vale sempre 0</b>: escrever lá não tem efeito. Dá imenso jeito (mv, not, comparações com zero).</li>
  <li>Nomes da ABI: <b>ra</b> (x1, endereço de retorno), <b>sp</b> (x2, stack pointer), <b>t0–t6</b> temporários (não preservados), <b>s0–s11</b> saved (preservados pela função chamada), <b>a0–a7</b> argumentos/resultados.</li></ul>
  <p>Porque só 32? Bancos maiores são <b>mais lentos</b> (64 registos podem ser 50% mais lentos) e precisariam de mais bits por campo na instrução. Com 32 registos, cada campo rd/rs1/rs2 tem <b>5 bits</b>.</p>
  <p>Operar sobre memória obriga a <b>lw</b> (trazer para registo), operar, e <b>sw</b> (devolver).</p>`,
  key: '32 registos → campos de 5 bits. x0 = 0 sempre. Nada é calculado diretamente na memória.' },
{ id: 'i-fmt', t: 'isa', title: 'Formatos de instrução: R, I, S, SB, UJ, U',
  html: `<p>Todas as instruções têm <b>32 bits</b>, e o <b>opcode</b> está sempre nos 7 bits menos significativos. rd, rs1 e rs2 ficam sempre nos mesmos sítios: o hardware pode lê-los antes de saber que instrução é.</p>
  <div class="tbl-wrap"><table><tr><th>Formato</th><th>Para quê</th><th>Exemplos</th></tr>
  <tr><td><b>R</b></td><td>3 registos</td><td>add, sub, and, or, xor, sll, srl, sra, slt</td></tr>
  <tr><td><b>I</b></td><td>registo + imediato de 12 bits</td><td>addi, andi, ori, xori, slli, lw, lb, jalr</td></tr>
  <tr><td><b>S</b></td><td>stores</td><td>sw, sh, sb</td></tr>
  <tr><td><b>SB</b> (B)</td><td>saltos condicionais</td><td>beq, bne, blt, bge, bltu, bgeu</td></tr>
  <tr><td><b>UJ</b> (J)</td><td>salto incondicional longo</td><td>jal</td></tr>
  <tr><td><b>U</b></td><td>imediato de 20 bits “em cima”</td><td>lui, auipc</td></tr></table></div>
  <p>Formato R: <code class="mono">funct7 | rs2 | rs1 | funct3 | rd | opcode</code> = 7+5+5+3+5+7 bits. O formato I troca funct7+rs2 por um imediato de <b>12 bits com sinal</b> (−2048 a 2047). No S o imediato é partido em dois para rs1 e rs2 ficarem no sítio de sempre.</p>
  <p>Não há <code class="mono">subi</code>: usa-se <code class="mono">addi</code> com constante negativa.</p>`,
  key: 'R = 3 registos; I = imediato/loads/jalr; S = stores; SB = branches; UJ = jal; U = lui/auipc.' },
{ id: 'i-mem', t: 'isa', title: 'Acesso à memória: lw, sw, bytes e alinhamento',
  html: `<p><code class="mono">lw rd, imm(rs1)</code>: rd = MEM[rs1 + imm]. <code class="mono">sw rs2, imm(rs1)</code>: MEM[rs1 + imm] = rs2. O imediato é um deslocamento de 12 bits com sinal.</p>
  <ul><li>A memória é <b>endereçada ao byte</b>: cada endereço é 1 byte, por isso uma palavra de 32 bits ocupa 4 endereços.</li>
  <li>Elemento i de um vetor de int → deslocamento <b>4 × i</b>. <code class="mono">A[8]</code> está em <code class="mono">32(base)</code>.</li>
  <li>Palavras <b>alinhadas</b>: o endereço é múltiplo de 4.</li>
  <li>RISC-V é <b>little endian</b>: o byte menos significativo fica no endereço mais baixo. 0x0000000D guardado em 0x8000 dá 0D 00 00 00.</li>
  <li><code class="mono">lb/lh</code> estendem o sinal; <code class="mono">lbu/lhu</code> preenchem com zeros. <code class="mono">sb/sh</code> guardam o byte/meia-palavra mais à direita.</li></ul>
  <p>Exemplo <code class="mono">A[12] = h + A[8]</code> (h em s2, A em s3):</p>
  <pre class="codeblk">lw  t0, 32(s3)
add t0, s2, t0
sw  t0, 48(s3)</pre>
  <p>Para copiar uma posição de memória para outra bastam <b>2 instruções</b> (lw + sw). Para trocar duas (swap), <b>4</b>: dois lw e dois sw.</p>`,
  key: 'Endereço ao byte: índice × 4. Little endian: byte de menor peso no endereço menor.' },
{ id: 'i-const', t: 'isa', title: 'Constantes grandes: lui + addi',
  html: `<p>Um imediato só tem 12 bits. E se a constante tiver 32? Escreve-se em duas metades, como um número de telefone dito em duas partes:</p>
  <ul><li><code class="mono">lui rd, imm20</code>: põe os 20 bits nos bits 31..12 de rd (rd = imm &lt;&lt; 12) e os 12 de baixo a zero.</li>
  <li><code class="mono">addi rd, rd, imm12</code> (ou <code class="mono">ori</code>): completa os 12 bits de baixo.</li></ul>
  <p>Exemplo: carregar 0x12345678 → <code class="mono">lui t0, 0x12345</code> + <code class="mono">addi t0, t0, 0x678</code>.</p>
  <p><b>Cuidado com o addi</b>: o imediato é <b>estendido com sinal</b>. Se o bit 11 da parte baixa for 1 (ex.: 0x800 a 0xFFF), o addi soma um número negativo, e é preciso somar 1 à parte do lui para compensar. O pseudo-<code class="mono">li</code> do assembler trata disto sozinho. Com <code class="mono">ori</code> o RISC-V também estende o sinal do imediato, por isso o problema mantém-se.</p>
  <p><code class="mono">auipc rd, imm</code> = PC + (imm &lt;&lt; 12): serve para endereços relativos ao PC (auipc + jalr = salto longo; auipc + lw = ler dados perto do código).</p>`,
  key: 'Constante de 32 bits = lui (20 de cima) + addi (12 de baixo, atenção ao sinal).' },
{ id: 'i-ctrl', t: 'isa', title: 'Saltos, ciclos e funções',
  html: `<ul><li><b>Branches</b> (SB): <code class="mono">beq, bne, blt, bge, bltu, bgeu</code> comparam dois registos e saltam relativamente ao PC (imediato de 12 bits, em múltiplos de 2 bytes). Não há flags: compara-se diretamente.</li>
  <li><b>jal rd, label</b> (UJ): rd = PC + 4 e salta (±1 MB). <code class="mono">j label</code> = <code class="mono">jal x0, label</code>.</li>
  <li><b>jalr rd, imm(rs1)</b> (formato I): rd = PC + 4 e PC = rs1 + imm. Retorno de função: <code class="mono">jalr x0, 0(ra)</code> (pseudo <code class="mono">ret</code>).</li>
  <li>Branch para longe demais? O assembler inverte a condição e usa jal: <code class="mono">bne … L2; jal x0, L1; L2:</code>.</li></ul>
  <p>Um <b>if/else</b> compila para um branch com a condição <b>invertida</b> (salta para o else) e um <code class="mono">j Exit</code> no fim do then.</p>
  <p><b>Contar instruções num ciclo</b>: (instruções antes do ciclo) + (corpo × nº de iterações), com cuidado com a última iteração. Exemplo do MAP:</p>
  <pre class="codeblk">      addi t0, x0, 0
      addi t1, x0, 5
LOOP: addi t0, t0, 3
      addi t1, t1, -1
      bne  t1, x0, LOOP</pre>
  <p>2 + 3 × 5 = <b>17 instruções</b> e t0 = 5 × 3 = <b>15</b>.</p>
  <p><b>Bloco básico</b>: sequência sem saltos lá dentro (só no fim) e sem destinos de salto (só no início). O compilador otimiza bloco a bloco.</p>`,
  key: 'Branches: SB, relativos ao PC. jal: UJ. jalr: I. Total = antes + corpo × iterações.' },

/* ---------------- COMPILER ---------------- */
{ id: 'k-chain', t: 'comp', title: 'Do código C ao programa a correr',
  html: `<p>Como uma receita que vai do caderno ao prato: <b>compilador</b> (C → assembly) → <b>assembler</b> (assembly → código máquina, ficheiro objeto) → <b>linker</b> (junta objetos e bibliotecas → executável) → <b>loader</b> (põe o executável em memória e arranca).</p>
  <p><b>Ficheiro objeto</b>: cabeçalho, <b>segmento de texto</b> (instruções), <b>segmento de dados estáticos</b>, <b>informação de relocação</b> (o que depende do endereço final), <b>tabela de símbolos</b> (definições globais e referências externas) e informação de debug.</p>
  <p><b>Linker</b>: 1) junta os segmentos; 2) resolve as labels (dá-lhes endereços); 3) corrige as referências que dependem da posição e as externas.</p>
  <p><b>Loader</b>: lê o cabeçalho (tamanhos), cria o espaço de endereçamento virtual, copia texto e dados para memória (ou marca as páginas para virem a pedido), põe argumentos na pilha, inicializa registos (sp, gp…) e salta para a rotina de arranque, que chama o <code class="mono">main</code>; no fim faz <code class="mono">exit</code>.</p>
  <p>Mapa de memória típico: código (text) em baixo, depois dados estáticos, o <b>heap</b> a crescer para cima (malloc) e a <b>pilha</b> a crescer para baixo a partir do topo.</p>`,
  key: 'Compilador → assembler → linker → loader. O objeto leva texto, dados, relocação e símbolos.' },
{ id: 'k-pseudo', t: 'comp', title: 'Pseudo-instruções',
  html: `<p>São “atalhos” que o assembler aceita mas que não existem no hardware: ele traduz cada uma para uma ou mais instruções reais. São <i>figments of the assembler’s imagination</i>.</p>
  <div class="tbl-wrap"><table><tr><th>Pseudo</th><th>Instrução real</th><th>Formato</th></tr>
  <tr><td><code class="mono">mv rd, rs</code></td><td><code class="mono">addi rd, rs, 0</code></td><td>I</td></tr>
  <tr><td><code class="mono">not rd, rs</code></td><td><code class="mono">xori rd, rs, -1</code></td><td>I</td></tr>
  <tr><td><code class="mono">li rd, imm</code></td><td><code class="mono">addi rd, x0, imm</code> (ou lui + addi)</td><td>I (+U)</td></tr>
  <tr><td><code class="mono">j label</code></td><td><code class="mono">jal x0, label</code></td><td>UJ</td></tr>
  <tr><td><code class="mono">ret</code></td><td><code class="mono">jalr x0, 0(ra)</code></td><td>I</td></tr>
  <tr><td><code class="mono">nop</code></td><td><code class="mono">addi x0, x0, 0</code></td><td>I</td></tr></table></div>
  <p>Truques que vêm daqui: <b>not</b> usa xori com −1 (tudo a 1s); também se faz com <code class="mono">addi rd, x0, -1</code> + <code class="mono">sub rd, rd, rs</code>. O registo <b>x0</b> é o que torna quase todas possíveis.</p>
  <p>As pseudo-instruções facilitam a vida a quem escreve assembly mas <b>não reduzem</b> o número de instruções executadas.</p>`,
  key: 'Pseudo-instrução = atalho do assembler. not → xori −1; mv → addi 0; j → jal x0; ret → jalr x0.' },
{ id: 'k-dyn', t: 'comp', title: 'Ligação estática vs dinâmica, e Java',
  html: `<p><b>Ligação estática</b>: as rotinas da biblioteca são copiadas para dentro do executável. Problemas: se sair uma versão nova da biblioteca continuas com a antiga, e carrega tudo, mesmo o que não se usa.</p>
  <p><b>Ligação dinâmica</b>: só se liga/carrega a rotina quando é chamada (código relocável). Evita executáveis inchados e apanha automaticamente versões novas. Na variante <b>lazy linkage</b> a ligação só acontece na <b>primeira chamada</b> de cada função.</p>
  <p><b>Java</b>: compila-se para <b>bytecodes</b>, um conjunto de instruções simples e portável para a JVM. A JVM pode <b>interpretar</b> os bytecodes (lento) ou usar um <b>JIT</b> (Just-In-Time), que compila para código nativo os métodos “quentes”. O JIT pode chegar perto de C otimizado.</p>
  <p>Lições das aulas: IC e CPI <b>isolados</b> não dizem qual é mais rápido; as otimizações do compilador dependem do algoritmo; e <b>nada salva um algoritmo mau</b> (quicksort sem otimizações bate bubblesort otimizado).</p>`,
  key: 'Dinâmica = liga só quando é preciso (lazy na 1.ª chamada). JIT compila os métodos quentes.' },
{ id: 'k-count', t: 'comp', title: 'Contar instruções e acessos à memória',
  html: `<p>No teste aparecem ciclos curtos e pergunta-se “quantas instruções são executadas?”. A receita:</p>
  <ol><li>Conta as instruções <b>antes</b> do ciclo (executam 1 vez).</li><li>Conta o <b>corpo</b> do ciclo e multiplica pelo nº de iterações.</li><li>Vê se o teste de saída está no início (corre mais uma vez) ou no fim.</li></ol>
  <p>Exemplo (exame 2025/26), soma de 100 elementos:</p>
  <pre class="codeblk">      li   t0, 0
      li   t1, 0
LOOP: lw   t2, 0(a0)
      add  t0, t0, t2
      addi a0, a0, 4
      addi t1, t1, 1
      bne  t1, t3, LOOP</pre>
  <p>2 + 5 × 100 = <b>502</b>. Se uma instrução nova juntasse os dois addi, o corpo passava a 4: 400 em vez de 500 → <b>20%</b> menos.</p>
  <p>Distribuição <b>estática</b> = contar no código escrito; <b>dinâmica</b> = contar no que é executado (o ciclo pesa muito mais). Cada instrução gera um acesso <b>F</b> (fetch); loads geram um <b>R</b> e stores um <b>W</b> a dados.</p>
  <p>Um <code class="mono">while</code> com o teste no início e um <code class="mono">j</code> no fim executa, para N iterações, cerca de 4N + 1 instruções num corpo de 4 (o teste final conta mais uma vez).</p>
  <p>Otimizações típicas: trocar multiplicação por <b>shift</b> (strength reduction), usar <b>ponteiros</b> em vez de índices, tirar contas de dentro do ciclo.</p>`,
  key: 'Total = antes + corpo × iterações (+ teste final). Fetch por instrução; R por load; W por store.' },
{ id: 'k-fallacy', t: 'comp', title: 'Falácias e armadilhas',
  html: `<ul><li><b>Falácia: instruções mais poderosas dão mais desempenho.</b> Precisas de menos instruções, mas são difíceis de implementar e podem atrasar todas as outras. Os compiladores fazem código rápido com instruções simples.</li>
  <li><b>Falácia: escrever em assembly para ter desempenho.</b> Os compiladores modernos lidam melhor com processadores modernos, e mais linhas de código trazem mais erros.</li>
  <li><b>Falácia: compatibilidade para trás = a ISA não muda.</b> O x86 não parou de crescer em instruções.</li>
  <li><b>Armadilha: palavras sequenciais não estão em endereços sequenciais.</b> Avança-se de 4 em 4, não de 1 em 1.</li>
  <li><b>Armadilha: guardar um ponteiro para uma variável local</b> depois de a função retornar. A pilha é libertada e o ponteiro fica inválido.</li></ul>
  <p>Instruções novas “combinadas” (como incrementar e saltar numa só) reduzem o IC, mas <b>não garantem</b> ser mais rápidas em qualquer microarquitetura: podem aumentar o CPI ou o período do relógio.</p>`,
  key: 'Menos instruções ≠ menos tempo. Conta sempre IC × CPI × T.' },

/* ---------------- CACHE ---------------- */
{ id: 'c-hier', t: 'cache', title: 'A hierarquia de memória e o “memory wall”',
  html: `<p>O processador ficou muito mais rápido do que a DRAM: é o <b>memory wall</b>. A solução é uma hierarquia, como a tua mesa, a estante do quarto e a biblioteca: o que usas agora está perto, o resto está longe mas há muito.</p>
  <div class="tbl-wrap"><table><tr><th>Tecnologia</th><th>Acesso</th><th>€ por GB</th></tr>
  <tr><td>SRAM (caches)</td><td>0,5 – 2,5 ns</td><td>500 – 1000</td></tr>
  <tr><td>DRAM (memória principal)</td><td>50 – 70 ns</td><td>5 – 10</td></tr>
  <tr><td>Flash</td><td>5 – 50 µs</td><td>0,5 – 1</td></tr>
  <tr><td>Disco magnético</td><td>5 – 20 ms</td><td>0,05 – 0,5</td></tr></table></div>
  <p><b>SRAM</b>: 6 transístores por bit, rápida, cara, mantém o valor enquanto houver energia. <b>DRAM</b>: 1 transístor por bit, densa e barata, mas tem de ser <b>refrescada</b> (~a cada 8 ms) e o endereço vai em duas metades (linha RAS, coluna CAS).</p>
  <p>Quem gere cada passo: registos ↔ memória: o <b>compilador</b>; cache ↔ memória principal: o <b>hardware</b> (controlador da cache); memória ↔ disco: o <b>sistema operativo</b> (memória virtual), ajudado pela TLB.</p>`,
  key: 'Objetivo: parecer tão rápida como a SRAM e tão grande e barata como o disco.' },
{ id: 'c-loc', t: 'cache', title: 'Localidade, hit e miss',
  html: `<p>As caches funcionam porque os programas são previsíveis:</p>
  <ul><li><b>Localidade temporal</b>: o que usaste agora vais voltar a usar em breve (variáveis do ciclo, instruções do ciclo). Por isso guarda-se o que foi acedido recentemente.</li>
  <li><b>Localidade espacial</b>: a seguir vais usar o que está ao lado (instruções sequenciais, vetores percorridos por ordem). Por isso traz-se um <b>bloco</b> inteiro de palavras vizinhas.</li></ul>
  <p>Vocabulário:</p>
  <ul><li><b>Bloco</b> (ou linha): a unidade que se copia entre níveis.</li>
  <li><b>Hit</b>: está lá. <b>Hit rate</b> = hits / acessos. <b>Hit time</b>: tempo de aceder e saber se é hit.</li>
  <li><b>Miss</b>: não está; copia-se o bloco do nível de baixo. <b>Miss rate = 1 − hit rate</b>.</li>
  <li><b>Miss penalty</b>: o tempo <b>extra</b> para trazer o bloco. Hit time ≪ miss penalty.</li></ul>
  <p>Exemplo das fichas: 10 000 acessos, 8 000 satisfeitos pela cache → hit rate 80%, miss rate 20%. Se t_hit = 10 ns e t_miss = 100 ns (total), a penalização é 100 − 10 = <b>90 ns</b>.</p>`,
  key: 'Temporal → guardar o recente. Espacial → trazer blocos. Penalty = tempo extra num miss.' },
{ id: 'c-dm', t: 'cache', title: 'Mapeamento direto, tag e bit de validade',
  html: `<p>Numa cache de <b>mapeamento direto</b> cada bloco de memória só pode ir para <b>um</b> sítio, como um parque em que o lugar é dado pelos últimos algarismos da matrícula:</p>
  <p style="text-align:center"><b>linha = (endereço do bloco) mod (nº de linhas)</b></p>
  <p>Como o nº de linhas é potência de 2, isto é simplesmente usar os <b>bits de baixo</b> do endereço do bloco.</p>
  <ul><li>Vários blocos partilham a mesma linha. Para saber qual lá está guarda-se a <b>tag</b>: os bits de cima do endereço.</li>
  <li>O <b>bit de validade</b> diz se a linha tem algo útil (no arranque, tudo a 0).</li>
  <li>Hit = linha válida <b>e</b> tag igual.</li></ul>
  <p>Exemplo das aulas: 8 linhas de 1 palavra; os endereços de palavra 10110 e 11010 vão para as linhas 110 e 010. Mais tarde 10010 vai para a linha 010 e expulsa 11010: tag 10 ≠ 11, logo é <b>miss</b> e substitui.</p>
  <p>Dois blocos muito usados que caem na mesma linha expulsam-se um ao outro sem parar: é o <b>efeito ping-pong</b> (misses de conflito).</p>`,
  key: 'Mapeamento direto: 1 sítio possível = bits de baixo do nº do bloco. A tag diz quem lá está.' },
{ id: 'c-addr', t: 'cache', title: 'Receita: partir o endereço em tag | índice | offset',
  html: `<p>Lê-se o endereço da direita para a esquerda, como uma morada ao contrário: a posição dentro do bloco, depois qual o conjunto, e o resto identifica o bloco.</p>
  <ol><li><b>Offset</b> = log₂(bytes por bloco). Bloco de 32 B → 5 bits.</li>
  <li><b>Nº de conjuntos</b> = capacidade / (tamanho do bloco × vias). <b>Índice</b> = log₂(nº de conjuntos).</li>
  <li><b>Tag</b> = bits do endereço − índice − offset.</li></ol>
  <p>Exemplo (exame 2025/26): 32 bits, 8 KB, blocos de 32 B, mapeamento direto. Offset = 5; linhas = 8192/32 = 256 → índice = 8; tag = 32 − 8 − 5 = <b>19</b>. Com 4 vias e a mesma capacidade: 256/4 = 64 conjuntos → índice = <b>6</b> (a tag sobe para 21).</p>
  <p>A que linha vai um endereço? <b>nº do bloco = endereço / tamanho do bloco</b>; <b>linha = nº do bloco mod nº de linhas</b>. Ex.: 256 linhas de 64 B, endereço 19200 → bloco 300 → linha 300 mod 256 = <b>44</b>.</p>
  <p><b>Totalmente associativa</b>: não há índice (um único conjunto). Só tag e offset.</p>`,
  key: 'Offset = log₂(bloco); índice = log₂(capacidade / (bloco × vias)); tag = o resto.' },
{ id: 'c-assoc', t: 'cache', title: 'Associatividade e substituição',
  html: `<p>Em vez de um lugar fixo, cada bloco pode ir para qualquer uma das <b>n vias</b> do seu <b>conjunto</b>: é como teres direito a qualquer lugar de uma fila do parque, em vez de um lugar marcado.</p>
  <ul><li><b>Mapeamento direto</b> = 1 via (1 escolha).</li>
  <li><b>n-way set associative</b>: conjunto = (nº do bloco) mod (nº de conjuntos); procura-se em paralelo nas n vias, com <b>n comparadores</b>.</li>
  <li><b>Totalmente associativa</b>: um só conjunto com todas as linhas; um comparador por entrada (caro).</li></ul>
  <p>Exemplo das aulas: acessos aos blocos 0, 4, 0, 4… numa cache de 4 blocos. Em mapeamento direto os dois caem no mesmo sítio: 8 acessos, 8 misses (ping-pong). Com 2 vias cabem os dois: só 2 misses.</p>
  <p>O maior ganho está em passar de direto para <b>2 vias</b> (cerca de 20% menos misses); depois os ganhos são menores e a cache fica mais lenta e cara.</p>
  <p><b>Substituição</b>: no direto não há escolha. Nas outras prefere-se uma entrada inválida; senão <b>LRU</b> (a menos recentemente usada; simples com 2 vias, difícil com muitas) ou <b>aleatória</b> (quase tão boa com associatividade alta).</p>`,
  key: 'Mais vias → menos conflitos, mas mais comparadores e hit time maior. Conjuntos = linhas / vias.' },
{ id: 'c-3c', t: 'cache', title: 'Os 3 tipos de miss e o tamanho do bloco',
  html: `<div class="tbl-wrap"><table><tr><th>Miss</th><th>Porquê</th><th>Remédio</th></tr>
  <tr><td><b>Compulsória</b> (cold start)</td><td>1.º acesso ao bloco</td><td>blocos maiores (mas mais penalty)</td></tr>
  <tr><td><b>Capacidade</b></td><td>a cache não leva tudo o que o programa usa</td><td>cache maior (pode ficar mais lenta)</td></tr>
  <tr><td><b>Conflito</b></td><td>vários blocos disputam o mesmo conjunto</td><td>mais associatividade ou cache maior</td></tr></table></div>
  <p>Teste mental: “numa cache <b>totalmente associativa</b> do mesmo tamanho este miss aconteceria?” Se não, é de conflito.</p>
  <p><b>Blocos maiores</b> aproveitam a localidade espacial e reduzem misses compulsórias, mas:</p>
  <ul><li>com a capacidade fixa há <b>menos blocos</b> → mais competição; se o bloco for uma fração grande da cache, o miss rate <b>volta a subir</b> (poluição);</li>
  <li>a <b>miss penalty aumenta</b> (há mais bytes a transferir). Early restart e critical word first ajudam.</li></ul>
  <p><b>Custo em bits</b>: cada linha guarda dados + tag + bit de validade (+ dirty bit no write-back). Ex.: 64 linhas de 16 B com 22 bits de tag: (128 + 22 + 1) / 128 ≈ <b>1,18</b> bits por bit de dados.</p>`,
  key: 'Compulsória, capacidade, conflito. Bloco grande demais: menos linhas e mais penalty.' },

/* ---------------- CACHE PERFORMANCE ---------------- */
{ id: 'cp-write', t: 'cperf', title: 'Políticas de escrita',
  html: `<p>Num write hit, a cache e a memória ficam diferentes. Duas atitudes:</p>
  <ul><li><b>Write-through</b>: escreve-se na cache <b>e</b> na memória. Simples, mas cada escrita custa um acesso à memória (com CPI base 1, 10% de stores e 100 ciclos por escrita, o CPI efetivo seria 1 + 0,1 × 100 = 11). Solução: um <b>write buffer</b> guarda as escritas pendentes e o CPU só para se ele encher.</li>
  <li><b>Write-back</b>: escreve-se só na cache e marca-se o bloco como <b>dirty</b>. Só quando o bloco é substituído é que se escreve na memória. Como o caderno de notas que só passas a limpo quando tens de o arrumar.</li></ul>
  <p>Num <b>write miss</b>:</p>
  <ul><li><b>Write allocate</b>: traz-se o bloco para a cache e escreve-se lá (habitual com write-back).</li>
  <li><b>No-write-allocate</b> (write around): escreve-se direto na memória sem trazer o bloco (combina com write-through; faz sentido quando se escreve um bloco inteiro antes de o ler, como numa inicialização).</li></ul>
  <p>Na memória virtual só o <b>write-back</b> é viável: escrever no disco demora milhões de ciclos.</p>`,
  key: 'Write-through: escreve sempre em baixo (com buffer). Write-back: só ao expulsar, com dirty bit.' },
{ id: 'cp-load', t: 'cperf', title: 'Políticas de carregamento do bloco',
  html: `<p>Num miss, o bloco tem várias palavras. Quando é que o processador recebe a que pediu?</p>
  <ul><li><b>Bloqueante</b>: só depois de todo o bloco estar na cache. Simples, e pela localidade espacial o próximo acesso será provavelmente ao mesmo bloco.</li>
  <li><b>Early restart</b>: trazem-se as palavras por ordem e, assim que chega a pedida, entrega-se e o CPU continua.</li>
  <li><b>Critical word first</b>: pede-se <b>primeiro a palavra em falta</b>, entrega-se logo, e o resto do bloco vem depois. Como num restaurante que te traz primeiro o prato que pediste e põe a mesa enquanto comes.</li></ul>
  <p>Estas políticas ajudam sobretudo quando trazer um bloco implica <b>vários acessos à memória</b>.</p>
  <p>Também se reduz a penalty aumentando a <b>largura de banda</b> da memória: barramentos mais largos (4 palavras de uma vez: 1 + 15 + 1 = 17 ciclos de barramento), <b>interleaving</b> em bancos (1 + 15 + 4 × 1 = 20 ciclos) e DRAM DDR.</p>`,
  key: 'Critical word first: a palavra pedida vem primeiro; o resto do bloco chega depois.' },
{ id: 'cp-amat', t: 'cperf', title: 'Receita: AMAT',
  html: `<p><b>AMAT</b> (average memory access time) é o tempo médio que cada acesso custa:</p>
  <p style="text-align:center"><b>AMAT = t<sub>hit</sub> + miss rate × miss penalty</b></p>
  <p>Todos os acessos pagam o hit time (tem de se ver se está lá); os misses pagam também a penalty.</p>
  <p>Exemplo: t<sub>hit</sub> = 2 ciclos, penalty = 100, miss rate 5% → AMAT = 2 + 0,05 × 100 = <b>7 ciclos</b>.</p>
  <p>As fichas às vezes usam a forma equivalente <b>AMAT = h × t<sub>hit</sub> + m × t<sub>miss</sub></b>, em que t<sub>miss</sub> é o tempo <b>total</b> de um miss (= t<sub>hit</sub> + penalty). Com t<sub>hit</sub> = 10 ns, t<sub>miss</sub> = 100 ns e h = 80%: 0,8 × 10 + 0,2 × 100 = <b>28 ns</b> (e com a fórmula de cima: 10 + 0,2 × 90 = 28 ns, igual).</p>
  <p><b>Cuidado</b>: uma mudança que baixa o miss rate pode não compensar se subir o hit time ou a penalty. Ex.: 2,5 + 0,04 × 110 = 6,9 ciclos, contra 7 antes: ganho mínimo.</p>
  <p>Speedup de ter cache (se a memória dominar o desempenho) = tempo sem cache / AMAT. Com 20 ns sem cache e AMAT de 2,5 ns → <b>8</b>.</p>`,
  key: 'AMAT = hit + miss rate × penalty. Penalty é o extra; t_miss total = hit + penalty.' },
{ id: 'cp-cpi', t: 'cperf', title: 'CPI com stalls de memória',
  html: `<p>Num miss o pipeline <b>pára</b> (stall) à espera do bloco. Esses ciclos somam-se ao CPI ideal:</p>
  <p style="text-align:center"><b>CPI real = CPI base + ciclos de stall por instrução</b></p>
  <p>Stalls por instrução = <b>acessos por instrução × miss rate × miss penalty</b>.</p>
  <ul><li>Cada instrução faz <b>1 acesso à I-cache</b> (o fetch).</li>
  <li>Só loads e stores acedem à D-cache: multiplica pela <b>fração de loads/stores</b>.</li></ul>
  <p>Exemplo das aulas: I-cache 2%, D-cache 4%, penalty 100, CPI base 2, 36% loads/stores.</p>
  <ol><li>I: 0,02 × 100 = 2</li><li>D: 0,36 × 0,04 × 100 = 1,44</li><li>CPI = 2 + 2 + 1,44 = <b>5,44</b>, e um CPU com cache perfeita seria 5,44/2 = <b>2,72×</b> mais rápido.</li></ol>
  <p>A penalty em ns converte-se em ciclos: a 4 GHz (0,25 ns), 100 ns = <b>400 ciclos</b>. Quanto mais rápido o CPU, mais ciclos custa cada miss: <b>não podes ignorar a cache</b> ao avaliar desempenho.</p>`,
  key: 'CPI = base + Σ (acessos/instr × miss rate × penalty). Fetch: 1 por instrução.' },
{ id: 'cp-multi', t: 'cperf', title: 'Caches multinível (L1, L2, L3)',
  html: `<p>A L1 é o bolso, a L2 a mochila, a RAM o cacifo. Cada nível tem uma missão diferente:</p>
  <ul><li><b>L1</b>: colada ao CPU, foca-se no <b>hit time</b> mínimo: pequena, blocos menores, muitas vezes separada em I e D.</li>
  <li><b>L2</b> (muitas vezes unificada, por vezes também L3): foca-se em baixar o <b>miss rate</b> para evitar ir à RAM: maior, blocos maiores, mais vias. O hit time dela pesa menos.</li></ul>
  <p style="text-align:center"><b>t = t<sub>hitL1</sub> + p<sub>missL1</sub> × (t<sub>hitL2</sub> + p<sub>missL2</sub> × t<sub>penaltyL2</sub>)</b></p>
  <p>O parêntese é a <b>penalty da L1</b>. Exemplo (exame 2025/26): hit L1 = 2, hit L2 = 15, penalty L2 = 100, miss L1 = 2%, miss L2 (local) = 20%. Penalty L1 = 15 + 0,2 × 100 = <b>35</b>; AMAT = 2 + 0,02 × 35 = <b>2,7 ciclos</b>.</p>
  <p><b>Local vs global</b>: o miss rate <b>local</b> da L2 é sobre os acessos que <i>chegam</i> à L2; o <b>global</b> é sobre todos os acessos do CPU. Global L2 = miss L1 × local L2 (aqui 2% × 20% = 0,4%).</p>
  <p>Exemplo das aulas (4 GHz, CPI base 1, 2% misses, RAM 100 ns = 400 ciclos): só L1 → CPI = 1 + 0,02 × 400 = 9. Com L2 de 5 ns (20 ciclos) e miss global 0,5% → CPI = 1 + 0,02 × 20 + 0,005 × 400 = <b>3,4</b>.</p>`,
  key: 'L1: hit time. L2: miss rate. Penalty L1 = hit L2 + miss local L2 × penalty L2.' },
{ id: 'cp-improve', t: 'cperf', title: 'Como melhorar uma cache (e o que custa)',
  html: `<div class="tbl-wrap"><table><tr><th>Mudança</th><th>Efeito no miss rate</th><th>Efeito negativo</th></tr>
  <tr><td>Cache maior</td><td>menos misses de capacidade</td><td>pode aumentar o hit time</td></tr>
  <tr><td>Mais associatividade</td><td>menos misses de conflito</td><td>pode aumentar o hit time</td></tr>
  <tr><td>Bloco maior</td><td>menos misses compulsórias</td><td>mais penalty; demasiado grande → mais misses (poluição)</td></tr></table></div>
  <ul><li><b>Reduzir o hit time</b>: cache pequena, mapeamento direto, blocos pequenos.</li>
  <li><b>Reduzir o miss rate</b>: cache maior, mais vias, blocos de 16 a 64 B, <b>cache vítima</b>.</li>
  <li><b>Reduzir a penalty</b>: blocos menores, write buffer para os blocos dirty, critical word first, L2, memória mais larga/interleaved.</li></ul>
  <p><b>Cache vítima</b>: um pequeno buffer <b>totalmente associativo</b> (4 a 16 blocos) que guarda os últimos blocos expulsos. Num miss vê-se primeiro lá. É como um caixote de “coisas que deitei fora há pouco”. Muito eficaz em caches pequenas de mapeamento direto (mais de 25% menos misses numa cache de 4 KB), porque apanha o ping-pong.</p>`,
  key: 'Cada melhoria tem um preço: mede tudo com o AMAT.' },

/* ---------------- OPTIMIZATION ---------------- */
{ id: 'o-rowmajor', t: 'opt', title: 'Matrizes por linhas e a ordem dos ciclos',
  html: `<p>Em C as matrizes estão guardadas <b>por linhas</b> (row-major): a[0][0], a[0][1], … a[0][N−1], a[1][0], …</p>
  <ul><li>Percorrer <b>por linhas</b> (j no ciclo de dentro em a[i][j]) lê endereços seguidos: cada bloco trazido serve várias vezes → <b>boa localidade espacial</b>. Com blocos de 16 B e int de 4 B: 1 miss e 3 hits por bloco (hit rate 75%).</li>
  <li>Percorrer <b>por colunas</b> (a[j][i] com j no ciclo de dentro) salta N × 4 bytes de cada vez: cada acesso cai num bloco diferente → quase <b>sempre miss</b> se a matriz não couber na cache.</li></ul>
  <p>É como ler um livro: linha a linha é natural; ler a 1.ª palavra de cada página e voltar ao início para a 2.ª obriga a folhear o livro todo vezes sem conta.</p>
  <p><b>Loop interchange</b>: trocar a ordem dos ciclos para o de dentro percorrer a memória sequencialmente.</p>
  <p>Na transposição <code class="mono">A[i][j] = B[j][i]</code> não há ordem que sirva aos dois: um deles vai sempre por colunas. Aí ajuda o <b>blocking</b>.</p>`,
  key: 'Row-major: o índice da direita deve variar no ciclo de dentro.' },
{ id: 'o-struct', t: 'opt', title: 'Organizar os dados: campos quentes e frios',
  html: `<p>Os blocos trazem bytes vizinhos. Se esses bytes não forem precisos, ocupas a cache com lixo.</p>
  <ul><li><b>Reordenar campos</b>: põe juntos os campos usados juntos (ex.: <code class="mono">key</code> e <code class="mono">next</code> de uma lista percorrida).</li>
  <li><b>Hot/cold splitting</b>: separa os campos <b>quentes</b> (muito acedidos) dos <b>frios</b> para outra estrutura, ligada por ponteiro ou índice. A estrutura quente fica pequena e cabem muitas por bloco.</li>
  <li><b>Merging arrays</b>: <code class="mono">val[]</code> e <code class="mono">key[]</code> usados juntos → um vetor de structs {val, key}: menos conflitos, melhor localidade espacial.</li>
  <li>Array of structures vs structure of arrays: escolhe conforme o padrão de acesso.</li></ul>
  <p>Exemplo do teste 2024/25: numa lista de alunos percorrida pelo <code class="mono">numero</code>, os campos quentes são o <code class="mono">numero</code> (4 B) e o <code class="mono">next</code> (4 B) = <b>8 B</b>; o nome (28 B) e as 7 notas (28 B) são frios = <b>56 B</b>. Melhor: struct pequena {numero, next, índice} e uma tabela à parte com as fichas.</p>`,
  key: 'Junta o que se usa junto; afasta o que quase nunca se usa.' },
{ id: 'o-loops', t: 'opt', title: 'Fusão de ciclos, blocking e prefetching',
  html: `<ul><li><b>Loop fusion</b>: dois ciclos que percorrem os mesmos dados viram um só, e cada dado é usado enquanto ainda está na cache (localidade temporal).</li>
  <li><b>Blocking (tiling)</b>: em vez de percorrer linhas ou colunas inteiras (que não cabem), trabalha-se em <b>sub-matrizes B×B</b> que cabem na cache, como arrumar uma casa divisão a divisão em vez de atravessar a casa toda por cada objeto. Na multiplicação de matrizes as misses de capacidade passam de 2N³ + N² para cerca de N³/B + 2N². Ajuda quando há acessos por colunas inevitáveis (ex.: transposição).</li>
  <li><b>Prefetching</b> (software): pedir dados antes de serem precisos. Nem cedo demais (são expulsos antes de usar) nem tarde demais (não chegam a tempo).</li>
  <li><b>Preloading</b>: carregar mais cedo o elemento seguinte e deixar o hardware continuar (hit-under-miss) enquanto se processam os que já estão.</li>
  <li><b>Loop unrolling</b> reduz instruções de controlo, mas <b>não muda</b> a ordem dos acessos à memória: não resolve misses.</li></ul>`,
  key: 'Fusion: reutilizar já. Blocking: trabalhar em pedaços que cabem. Unrolling não muda a localidade.' },
{ id: 'o-conflict', t: 'opt', title: 'Conflitos entre vetores e padding',
  html: `<p>Dois vetores cujas bases distam um <b>múltiplo do tamanho da cache</b> (ou do tamanho de uma via) mapeiam o elemento i para o <b>mesmo conjunto</b>. Num ciclo como <code class="mono">a[i][j] = b[i][j]</code> numa cache de mapeamento direto, a leitura de b expulsa o bloco de a e a escrita de a expulsa o de b: <b>hit rate 0%</b>, mesmo com acessos sequenciais.</p>
  <p>Exemplo: matrizes 1024×1024 de int = 4 MB cada, a partir de 0 e de 0x00400000; com uma cache de 4 KB os índices coincidem sempre.</p>
  <p>Soluções:</p>
  <ul><li><b>Padding</b>: declarar um pequeno vetor entre os dois (<code class="mono">int a[N][N], xpto[4], b[N][N];</code>) para desalinhar as bases por um bloco.</li>
  <li><b>Mais associatividade</b>: com 2 vias, a e b cabem no mesmo conjunto.</li>
  <li><b>Merge</b> dos vetores num vetor de structs.</li>
  <li>Uma <b>cache vítima</b> pequena também apanha estes conflitos.</li></ul>
  <p>Aumentar a capacidade <b>não</b> resolve se as bases continuarem a distar um múltiplo do novo tamanho.</p>`,
  key: 'Bases a uma distância múltipla do tamanho da cache = conflito. Padding desalinha.' },

/* ---------------- VIRTUAL MEMORY ---------------- */
{ id: 'v-why', t: 'vm', title: 'Memória virtual: a RAM como cache do disco',
  html: `<p>Cada programa vê o seu próprio espaço de endereços “virtual”, como se tivesse a memória toda para si. O hardware e o SO traduzem esses endereços para endereços <b>físicos</b>. É como os números das salas de um hotel: o hóspede diz “quarto 12” e a receção sabe em que andar e edifício ele está mesmo.</p>
  <ul><li><b>Partilha eficiente e segura</b>: vários programas na mesma RAM, cada um protegido dos outros pela tradução.</li>
  <li>Motivação antiga: libertar o programador de uma RAM pequena.</li>
  <li>O “bloco” chama-se <b>página</b>; o “miss” chama-se <b>page fault</b>.</li></ul>
  <p>Porque é diferente de uma cache: um page fault custa <b>milhões de ciclos</b> (disco). Por isso:</p>
  <ul><li>páginas <b>grandes</b> (4 a 16 KB típico, para amortizar o acesso ao disco);</li>
  <li>colocação <b>totalmente associativa</b> (qualquer página em qualquer moldura) para reduzir misses;</li>
  <li>substituição <b>LRU aproximada</b> (bit de referência, limpo periodicamente pelo SO);</li>
  <li>escrita <b>write-back</b> com <b>dirty bit</b>; os page faults são tratados por <b>software</b> (SO).</li></ul>`,
  key: 'Página = bloco; page fault = miss caríssimo → totalmente associativa, write-back, LRU aproximado.' },
{ id: 'v-trans', t: 'vm', title: 'Tradução de endereços e tabela de páginas',
  html: `<p>O endereço virtual parte-se em <b>número de página virtual (VPN)</b> e <b>offset</b>. Só a VPN é traduzida; o <b>offset passa igual</b>.</p>
  <p>Com páginas de 4 KB = 2¹² B: offset = <b>12 bits</b>; num endereço virtual de 32 bits a VPN tem 20 bits.</p>
  <p>A <b>tabela de páginas</b> (uma por processo, em memória) é indexada pela VPN. O <b>page table register</b> no CPU aponta para ela. Cada entrada (<b>PTE</b>) tem:</p>
  <ul><li><b>bit de validade</b>: 1 = a página está na RAM e a PTE tem o nº de página física; 0 = <b>page fault</b> (a PTE pode indicar onde está no disco, na swap);</li>
  <li><b>dirty</b> (foi escrita), <b>referência</b> (usada recentemente), bits de proteção/acesso.</li></ul>
  <p>Endereço físico = nº da página física ‖ offset.</p>
  <p>Problema: sem mais nada, <b>cada acesso à memória precisa de 2 acessos</b> (um à tabela e outro ao dado). É para isso que existe a TLB.</p>`,
  key: 'VPN → tabela → PPN; o offset não muda. Valid = 0 → page fault, tratado pelo SO.' },
{ id: 'v-size', t: 'vm', title: 'O tamanho da tabela de páginas',
  html: `<p>Receita: <b>nº de entradas = 2^(bits do endereço virtual − bits de offset)</b>; <b>tamanho = entradas × tamanho da PTE</b>.</p>
  <p>Exemplo das aulas: espaço virtual de 2³² B, páginas de 4 KB (2¹²), PTE de 4 B → 2²⁰ entradas × 4 B = <b>4 MB por processo</b>, contíguos na memória física. É muito.</p>
  <p>Soluções:</p>
  <ul><li><b>Registo de limite</b>: a tabela só cresce conforme é precisa.</li>
  <li><b>Tabelas hierárquicas</b> (multinível): o endereço é dividido em índice de nível 1 | índice de nível 2 | … | offset. Com 2 níveis de 10 bits: diretório com 1024 entradas, cada tabela de 2.º nível com 1024. No total continuam a ser 1 M entradas (4 MB) se tudo existir, mas <b>só o diretório tem de estar sempre em memória</b> e só se criam as tabelas das zonas usadas.</li>
  <li><b>Tabela invertida</b>: uma entrada por página <b>física</b>, encontrada por uma função de hash sobre a VPN. Tamanho proporcional à memória física; mas a procura é mais complexa (colisões).</li></ul>`,
  key: 'Entradas = 2^(VA − offset). 32 bits, 4 KB, PTE 4 B → 4 MB. Hierárquica: só o que se usa.' },
{ id: 'v-tlb', t: 'vm', title: 'A TLB: uma cache de traduções',
  html: `<p>A <b>TLB</b> (Translation Lookaside Buffer) guarda as traduções VPN → PPN usadas recentemente. É a agenda de contactos favoritos: em vez de procurar na lista telefónica (a tabela, em memória) de cada vez, vês primeiro os favoritos.</p>
  <ul><li>Pequena: <b>16 a 512 entradas</b>; hit em 0,5 a 1 ciclo; miss de 10 a 100 ciclos; miss rate 0,01% a 1%.</li>
  <li>Pode ser direta, associativa por conjuntos ou totalmente associativa. Cada entrada leva tag (VPN), PPN, valid, dirty, ref e proteção.</li></ul>
  <p><b>TLB miss ≠ page fault</b>:</p>
  <ul><li>Se a página <b>está</b> na RAM: só falta a tradução na TLB. Copia-se a PTE da tabela para a TLB (dezenas de ciclos, em hardware ou software) e repete-se a instrução.</li>
  <li>Se a página <b>não está</b> na RAM: é um <b>page fault</b> verdadeiro (milhões de ciclos). O SO encontra a página no disco, escolhe uma vítima (se estiver dirty escreve-a primeiro), lê a página, atualiza a tabela e retoma a instrução.</li></ul>
  <p>TLB misses são <b>muito mais frequentes</b> do que page faults.</p>`,
  key: 'TLB miss com página na RAM = dezenas de ciclos. Page fault = milhões (vai ao disco).' },
{ id: 'v-int', t: 'vm', title: 'TLB + cache: o caminho completo de um acesso',
  html: `<div class="tbl-wrap"><table><tr><th>TLB</th><th>Tabela</th><th>Cache</th><th>Possível?</th></tr>
  <tr><td>hit</td><td>hit</td><td>hit</td><td>sim, o caso ideal</td></tr>
  <tr><td>hit</td><td>hit</td><td>miss</td><td>sim (a tabela nem é consultada)</td></tr>
  <tr><td>miss</td><td>hit</td><td>hit</td><td>sim: tradução vem da tabela</td></tr>
  <tr><td>miss</td><td>hit</td><td>miss</td><td>sim</td></tr>
  <tr><td>miss</td><td>miss</td><td>miss</td><td>sim: page fault</td></tr>
  <tr><td>hit</td><td>miss</td><td>—</td><td><b>impossível</b>: não há tradução na TLB de página que não está na RAM</td></tr>
  <tr><td>miss</td><td>miss</td><td>hit</td><td><b>impossível</b>: dados de uma página fora da RAM não podem estar na cache</td></tr></table></div>
  <p>Se a cache usa endereços <b>físicos</b>, é preciso traduzir antes. Uma cache <b>virtual</b> evita isso mas sofre de <b>aliasing</b> (dois endereços virtuais para o mesmo físico → duas cópias inconsistentes).</p>
  <p>Truque: <b>virtually indexed, physically tagged</b>. O offset da página não muda com a tradução; se <b>índice + offset da cache ≤ bits de offset da página</b>, pode ler-se a cache ao mesmo tempo que a TLB e comparar a tag física no fim.</p>
  <p><b>Proteção</b>: modo supervisor (kernel), instruções privilegiadas, tabelas só acessíveis em modo supervisor, e <code class="mono">ecall</code> para pedir serviços ao SO.</p>`,
  key: 'Impossíveis: TLB hit + page fault, e cache hit + page fault. VIPT: índice+offset ≤ offset da página.' },

/* ---------------- EXAM ---------------- */
{ id: 'x-format', t: 'exam', title: 'Como é o teste e quando vale a pena arriscar',
  html: `<p>As provas recentes (MAP e Exame parte 1) têm <b>45 minutos</b>, são <b>sem consulta e sem calculadora</b> (no MAP de 2025/26 podia consultar-se o reference card do RISC-V) e misturam escolha múltipla com respostas curtas (valores, frações, hexadecimal, código).</p>
  <p><b>Cotação</b> da escolha múltipla em 2025/26: certa = 100%, errada = <b>−1/(nº de alternativas)</b>. Em 2024/25 era −100%/(alternativas − 1).</p>
  <p>Vale a pena chutar? Com 4 alternativas e −1/4 por erro, chutar ao acaso vale em média ¼ × 1 − ¾ × ¼ = <b>+1/16</b>: ligeiramente positivo. Se conseguires <b>eliminar uma opção</b>, passa a ⅓ − ⅔ × ¼ = <b>+1/6</b>, já claramente a teu favor. Com a regra antiga, −1/(n−1), o chute cego vale exatamente 0.</p>
  <p>Estratégia: faz primeiro as perguntas teóricas e as contas curtas; <b>salta</b> as contas longas e volta a elas no fim. No exame simulado desta app o botão <b>Deixar em branco</b> faz o mesmo e a nota usa a mesma cotação.</p>
  <p>Temas que aparecem sempre: Amdahl, CPI/clock, código RISC-V (pseudo-instruções, formatos, contar instruções, valores de registos), decompor endereços, AMAT (1 e 2 níveis), políticas de escrita e localidade em ciclos sobre matrizes.</p>`,
  key: 'Eliminaste uma opção? Arrisca. Conta longa? Salta e volta no fim.' },
{ id: 'x-formulas', t: 'exam', title: 'Formulário de bolso',
  html: `<div class="tbl-wrap"><table><tr><th>O quê</th><th>Fórmula</th></tr>
  <tr><td>Desempenho / speedup</td><td>P = 1/T · S = T<sub>antigo</sub> / T<sub>novo</sub></td></tr>
  <tr><td>Tempo de CPU</td><td>T = IC × CPI × T<sub>clk</sub> = IC × CPI / f</td></tr>
  <tr><td>CPI médio</td><td>Σ CPIᵢ × fraçãoᵢ = ciclos / IC</td></tr>
  <tr><td>MIPS</td><td>f / (CPI × 10⁶)</td></tr>
  <tr><td>Amdahl</td><td>S = 1 / ((1−f) + f/k) · S<sub>max</sub> = 1/(1−f)</td></tr>
  <tr><td>Complemento para 2</td><td>−x = NOT x + 1 · gama −2ⁿ⁻¹ … 2ⁿ⁻¹−1</td></tr>
  <tr><td>Cache</td><td>offset = log₂(bloco) · conjuntos = C / (bloco × vias) · índice = log₂(conjuntos) · tag = resto</td></tr>
  <tr><td>Linha de um endereço</td><td>(endereço / bloco) mod nº de conjuntos</td></tr>
  <tr><td>AMAT</td><td>t<sub>hit</sub> + miss rate × penalty = h·t<sub>hit</sub> + m·t<sub>miss</sub></td></tr>
  <tr><td>2 níveis</td><td>t<sub>hitL1</sub> + m<sub>L1</sub> × (t<sub>hitL2</sub> + m<sub>L2,local</sub> × penalty<sub>L2</sub>)</td></tr>
  <tr><td>CPI com stalls</td><td>CPI<sub>base</sub> + acessos/instr × miss rate × penalty</td></tr>
  <tr><td>Tabela de páginas</td><td>entradas = 2^(bits VA − bits offset) · tamanho = entradas × PTE</td></tr></table></div>`,
  key: 'Se só decorares uma página, que seja esta.' },
]);
