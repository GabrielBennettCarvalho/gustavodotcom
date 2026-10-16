/* ===== RC lessons: transport layer (UDP, reliable transfer, TCP, flow and congestion control) ===== */
STUDY.lessons('rc', [
{ id: 't-mux', t: 'tcp', title: 'Multiplexagem e desmultiplexagem',
  html: `<p>A história dos slides: os 3 porquinhos vivem em casa da tia Alice e escrevem a 3 primos em casa do tio Bob. A tia junta as cartas e manda-as pelos CTT; o tio recebe e distribui pelos primos. <b>Casas</b> = computadores, <b>porquinhos</b> = processos, <b>cartas</b> = mensagens, <b>envelopes</b> = segmentos, <b>tios</b> = transporte, <b>CTT</b> = rede (IP).</p>
  <p>A rede (IP) leva datagramas de <b>computador</b> a <b>computador</b>. O transporte usa os <b>portos</b> para entregar ao <b>processo</b> certo:</p>
  <ul><li><b>Multiplexagem</b> (no emissor): juntar dados de vários sockets, cada um com o seu cabeçalho de transporte (porto origem, porto destino).</li>
  <li><b>Desmultiplexagem</b> (no recetor): usar os cabeçalhos para entregar cada segmento ao socket certo.</li></ul>
  <div class="tbl-wrap"><table><tr><th></th><th>Socket identificado por</th><th>Consequência</th></tr>
  <tr><td><b>UDP</b></td><td>(IP destino, porto destino)</td><td>datagramas de clientes diferentes para o mesmo porto vão para o <b>mesmo</b> socket</td></tr>
  <tr><td><b>TCP</b></td><td>(IP origem, porto origem, IP destino, porto destino)</td><td>cada ligação tem o seu socket; um servidor web tem um socket por cliente no porto 80</td></tr></table></div>
  <p>Os protocolos de transporte só correm nos <b>hosts</b>, não nos encaminhadores nem nos comutadores.</p>`,
  key: 'UDP desmultiplexa por (IP destino, porto destino). TCP precisa dos 4 valores.' },
{ id: 't-udp', t: 'tcp', title: 'UDP: o mínimo possível',
  html: `<p>Um postal: escreves, metes no correio e não sabes se chegou. Sem envelope de ida e volta, sem confirmação.</p>
  <p>O UDP acrescenta ao IP só duas coisas: <b>multiplexagem</b> (portos) e <b>deteção de erros</b> (checksum). Cabeçalho de <b>8 bytes</b>: porto origem, porto destino, comprimento, checksum.</p>
  <ul><li><b>Sem ligação</b>: não há handshake (não se perde um RTT a começar).</li>
  <li><b>Sem estado</b> nas pontas: um servidor aguenta mais clientes.</li>
  <li><b>Sem controlo de congestão</b>: envia ao ritmo que a aplicação quiser.</li>
  <li><b>Não fiável</b>: segmentos podem perder-se ou chegar fora de ordem.</li></ul>
  <p>Usado em DNS, streaming, jogos, VoIP, SNMP, e no <b>QUIC</b> (HTTP/3), que põe fiabilidade e controlo de congestão por cima.</p>`,
  key: 'UDP = IP + portos + checksum. Sem ligação, sem estado, sem controlo de congestão.' },
{ id: 't-rdt', t: 'tcp', title: 'Transferência fiável: stop-and-wait',
  html: `<p>Ditar um número de telefone: dizes um algarismo e esperas o “sim” antes de dizer o seguinte. Se não ouves nada, repetes.</p>
  <p>Ingredientes de qualquer protocolo fiável:</p>
  <ul><li><b>Checksum</b>: detetar bits trocados.</li><li><b>ACK</b>: o recetor confirma.</li>
  <li><b>Números de sequência</b>: distinguir um pacote novo de uma retransmissão (se um ACK se perder).</li>
  <li><b>Temporizador</b>: se o ACK não chega, retransmite.</li></ul>
  <p><b>Stop-and-wait</b>: envia um pacote e espera o ACK. Eficiência (utilização do emissor):</p>
  <p style="text-align:center"><b>U = (L/R) / (RTT + L/R)</b></p>
  <p>Exemplo (exame 2021/22): 8 Mbit/s, 200 km a 200 000 km/s, tramas de 1000 bytes. L/R = 8000/8×10⁶ = 1 ms. Propagação = 1 ms → RTT = 2 ms. U = 1 / (2 + 1) = <b>0,33</b>.</p>
  <p>Em ligações longas e rápidas (RTT grande, L/R pequeno) o stop-and-wait desperdiça quase tudo: a solução é ter vários pacotes em voo (janela deslizante).</p>`,
  key: 'Stop-and-wait: U = (L/R) / (RTT + L/R). Péssimo quando o RTT é grande face a L/R.' },
{ id: 't-pipe', t: 'tcp', title: 'Janela deslizante: Go-Back-N e Selective Repeat',
  html: `<p>Em vez de esperar por cada ACK, o emissor pode ter até <b>W</b> pacotes enviados e ainda não confirmados (“em voo”).</p>
  <div class="tbl-wrap"><table><tr><th></th><th>Go-Back-N</th><th>Selective Repeat</th></tr>
  <tr><td>Janela do emissor</td><td>W &gt; 1</td><td>W &gt; 1</td></tr>
  <tr><td>Janela do recetor</td><td><b>1</b>: só aceita o pacote esperado, descarta os fora de ordem</td><td>W: guarda os fora de ordem</td></tr>
  <tr><td>ACKs</td><td><b>cumulativos</b></td><td>individuais</td></tr>
  <tr><td>Perda</td><td>retransmite esse e <b>todos os seguintes</b></td><td>retransmite só o perdido</td></tr>
  <tr><td>Temporizadores</td><td>um (o do mais antigo)</td><td>um por pacote</td></tr></table></div>
  <p>Stop-and-wait é o caso W = 1 nos dois lados.</p>
  <p><b>Janela para 100% de eficiência</b>: o emissor tem de estar sempre a transmitir até chegar o primeiro ACK, ou seja, W·L/R ≥ L/R + RTT:</p>
  <p style="text-align:center"><b>W ≥ (L/R + RTT) / (L/R) = 1 + RTT·R/L</b> pacotes</p>
  <p>Exemplo (exame 2022/23): 10 Mbit/s, propagação 2 ms em cada sentido (RTT 4 ms), pacotes de 10 kbit → L/R = 1 ms → W ≥ (1 + 4)/1 = <b>5</b>. Se não te derem o tamanho dos pacotes, usa o produto <b>R × RTT</b> (bits em voo).</p>`,
  key: 'GBN: recetor com janela 1 e ACKs cumulativos. SR: recetor guarda fora de ordem. Janela mínima = 1 + RTT/(L/R).' },
{ id: 't-tcp', t: 'tcp', title: 'TCP: números de sequência, ACKs e handshake',
  html: `<p>O TCP vê os dados como um <b>fluxo de bytes numerados</b>. Como as páginas de um livro enviado por partes: cada parte diz “começo na página 1001” e o leitor responde “já tenho tudo até à 1500, manda a partir da 1501”.</p>
  <ul><li><b>Número de sequência</b> de um segmento = número do <b>primeiro byte</b> de dados que leva.</li>
  <li><b>Número de ACK</b> = número do <b>próximo byte que o recetor espera</b>. Os ACKs são <b>cumulativos</b>: ACK n confirma tudo até n−1.</li></ul>
  <p><b>Three-way handshake</b>: <code>SYN, seq=x</code> → <code>SYN+ACK, seq=y, ack=x+1</code> → <code>ACK, seq=x+1, ack=y+1</code>. x e y são números iniciais aleatórios (32 bits). O SYN “gasta” um número: o primeiro byte de dados é <b>x+1</b>. O cliente já pode levar dados (ex.: o pedido HTTP) no <b>3.º segmento</b>.</p>
  <p>Exemplo: ISN = 300, três segmentos de 200 bytes → seq <b>301, 501, 701</b>; ACKs <b>501, 701, 901</b>.</p>
  <p><b>Portos</b>: o servidor usa o bem-conhecido (80 para HTTP); o cliente usa um porto efémero (&gt; 1023), escolhido pelo sistema. Na resposta trocam de lugar.</p>
  <p><b>Fecho</b>: cada lado envia FIN e recebe o ACK (FIN, ACK, FIN, ACK). O primeiro a fechar espera um tempo (TIME_WAIT).</p>`,
  key: 'seq = 1.º byte do segmento. ACK = próximo byte esperado (cumulativo). Depois de SYN x, os dados começam em x+1.' },
{ id: 't-ack', t: 'tcp', title: 'Quando o TCP envia ACKs (e retransmite)',
  html: `<p>Regras do recetor TCP (RFC 5681):</p>
  <div class="tbl-wrap"><table><tr><th>Chega…</th><th>O recetor…</th></tr>
  <tr><td>segmento na ordem, tudo antes já confirmado</td><td><b>delayed ACK</b>: espera até 500 ms por outro segmento; se chegar, um só ACK confirma os dois</td></tr>
  <tr><td>segmento na ordem, há outro à espera de ACK</td><td>envia logo um ACK cumulativo (confirma os dois)</td></tr>
  <tr><td>segmento <b>fora de ordem</b> (falta um)</td><td>envia logo um <b>ACK duplicado</b> com o byte que falta</td></tr>
  <tr><td>segmento que preenche o buraco</td><td>envia logo um ACK cumulativo</td></tr></table></div>
  <p>Por isso, menos ACKs do que segmentos é normal: <b>delayed ACK</b>. Exemplo (exame 2021/22, 2.ª época): 6 segmentos (seq 1 a 5001) e 4 ACKs: N, N+2000, N+4000, N+5000 → o último confirma tudo: N+5000 = 6001 → <b>N = 1001</b> (o 1.º segmento foi confirmado sozinho, os outros aos pares).</p>
  <p><b>Fast retransmit</b>: 3 ACKs duplicados → retransmite logo o segmento em falta, sem esperar o timeout.</p>
  <p><b>Timeout</b>: tem de ser maior que o RTT, que varia. TimeoutInterval = EstimatedRTT + 4·DevRTT, com médias móveis exponenciais.</p>
  <p>Um ACK perdido não obriga a retransmitir se chegar um ACK maior antes do timeout: é cumulativo.</p>`,
  key: 'Delayed ACK: 1 ACK por cada 2 segmentos. Fora de ordem: ACK duplicado imediato. 3 duplicados: fast retransmit.' },
{ id: 't-flow', t: 'tcp', title: 'Controlo de fluxo: a janela anunciada',
  html: `<p>Encher um copo a partir de uma garrafa: quem bebe diz quanto espaço ainda há no copo, e quem serve não deita mais do que isso.</p>
  <p>O recetor tem um buffer; a aplicação lê dele ao seu ritmo. Em cada segmento o recetor anuncia o <b>espaço livre</b> no campo <b>receive window (rwnd)</b>. O emissor nunca tem mais do que rwnd bytes por confirmar. Assim o emissor não afoga o <b>recetor</b> (a congestão protege a <b>rede</b>).</p>
  <p style="text-align:center"><b>rwnd novo = rwnd anterior − bytes que chegaram + bytes que a aplicação leu</b></p>
  <p>Exemplo (exame 2020/21): o cliente enviou ACK 3250 e janela 2000. Chega um segmento com 1250 bytes; entretanto a aplicação leu 750. Novo ACK = 3250 + 1250 = <b>4500</b>; nova janela = 2000 − 1250 + 750 = <b>1500</b>.</p>`,
  key: 'rwnd = espaço livre no buffer do recetor. Protege o recetor; a congestão protege a rede.' },
{ id: 'c-princ', t: 'cong', title: 'Congestão: porquê e quem a controla',
  html: `<p>Uma autoestrada à hora de ponta: carros a mais e todos andam devagar; se ainda por cima as saídas estão entupidas, o trânsito pára mesmo com muita gente a tentar entrar.</p>
  <p><b>Congestão</b> = demasiadas fontes a enviar depressa demais para a rede aguentar. Sintomas: <b>atrasos de fila longos</b> e <b>perdas</b> (buffers cheios). Custos: retransmissões desnecessárias e capacidade desperdiçada em pacotes que acabam descartados mais à frente.</p>
  <ul><li><b>Fim-a-fim</b> (o TCP clássico): a rede não diz nada; os hosts <b>inferem</b> a congestão a partir de perdas e atrasos.</li>
  <li><b>Assistido pela rede</b>: os encaminhadores avisam explicitamente (bits ECN, ritmo indicado). Mais informação, mas exige que a rede colabore.</li></ul>
  <p>Nenhum é “sempre melhor”: o fim-a-fim encaixa no princípio de rede simples; o assistido reage mais cedo.</p>
  <p>Controlo de <b>fluxo</b> ≠ controlo de <b>congestão</b>: o primeiro protege o recetor (rwnd), o segundo a rede (cwnd). O emissor respeita os dois: janela efetiva = <b>min(cwnd, rwnd)</b>.</p>`,
  key: 'TCP: controlo de congestão fim-a-fim, inferido por perdas. Janela efetiva = min(cwnd, rwnd).' },
{ id: 'c-ss', t: 'cong', title: 'Slow start e congestion avoidance',
  html: `<p>Encher um balão sem saber quanto aguenta: primeiro sopras com força (duplicas), e quando te aproximas do tamanho em que rebentou da última vez, passas a soprar devagar.</p>
  <p>O emissor envia ~<b>cwnd</b> bytes por RTT (débito ≈ cwnd/RTT).</p>
  <ul><li><b>Slow start</b> (início da ligação): cwnd = <b>1 MSS</b>; por cada ACK recebido, <b>cwnd += 1 MSS</b> → a janela <b>duplica a cada RTT</b> (1, 2, 4, 8…). Começa devagar mas cresce exponencialmente.</li>
  <li>Quando cwnd chega ao <b>limiar (ssthresh)</b> → passa a <b>congestion avoidance</b>: por cada ACK, <b>cwnd += MSS·MSS/cwnd</b> → cresce <b>1 MSS por RTT</b> (linear).</li></ul>
  <p>Exemplo: ssthresh = 8 MSS. Rondas (em MSS): 1, 2, 4, 8 (chega ao limiar), 9, 10, 11…</p>`,
  key: 'Slow start: +1 MSS por ACK (duplica por RTT). Congestion avoidance: +MSS²/cwnd por ACK (+1 MSS por RTT).' },
{ id: 'c-events', t: 'cong', title: 'Perdas: timeout vs 3 ACKs duplicados',
  html: `<p>O TCP trata as duas formas de perda de maneira diferente, porque dizem coisas diferentes sobre a rede:</p>
  <div class="tbl-wrap"><table><tr><th>Evento</th><th>O que sugere</th><th>ssthresh</th><th>cwnd</th><th>Estado seguinte</th></tr>
  <tr><td><b>Timeout</b></td><td>congestão grave: nada está a passar</td><td>cwnd/2</td><td><b>1 MSS</b></td><td>slow start</td></tr>
  <tr><td><b>3 ACKs duplicados</b> (TCP Reno)</td><td>congestão ligeira: os segmentos seguintes chegam</td><td>cwnd/2</td><td>ssthresh + 3 MSS</td><td>fast recovery</td></tr>
  <tr><td>ACK novo em fast recovery</td><td>a perda foi recuperada</td><td>igual</td><td>= ssthresh</td><td>congestion avoidance</td></tr>
  <tr><td>cwnd ≥ ssthresh em slow start</td><td>—</td><td>igual</td><td>igual</td><td>congestion avoidance</td></tr></table></div>
  <p>Resumo usado em perguntas de escolha múltipla: com 3 ACKs duplicados, ssthresh e cwnd passam (aproximadamente) a <b>cwnd/2</b> e continua em crescimento <b>linear</b>; com timeout, cwnd volta a <b>1 MSS</b> e recomeça o slow start.</p>
  <p>O TCP <b>Tahoe</b> (antigo) volta a 1 MSS nos dois casos.</p>`,
  key: 'Timeout: cwnd = 1 MSS, slow start. 3 dup ACKs: cwnd ≈ cwnd/2, fast recovery → linear. Em ambos ssthresh = cwnd/2.' },
{ id: 'c-aimd', t: 'cong', title: 'AIMD, justiça e CUBIC',
  html: `<p>No regime normal o TCP faz <b>AIMD</b>: aumento aditivo (+1 MSS por RTT) e diminuição multiplicativa (÷2 a cada perda). O gráfico de cwnd é um <b>dente de serra</b>.</p>
  <p>Se a janela anda entre W/2 e W, o débito médio é ≈ <b>0,75 · W / RTT</b>.</p>
  <p><b>Justiça</b>: K ligações TCP no mesmo gargalo de ritmo R tendem a ficar com R/K cada (o AIMD converge para a partilha igual). Mas: uma aplicação que abre várias ligações paralelas leva mais; e o UDP não abranda nada.</p>
  <p><b>TCP CUBIC</b> (o padrão no Linux): lembra-se de W<sub>max</sub>, o tamanho onde houve perda. Depois de uma perda cresce <b>depressa enquanto está longe</b> de W<sub>max</sub> e <b>devagar perto dele</b>. Vantagem: recupera o débito mais rapidamente sem provocar logo outra perda.</p>`,
  key: 'AIMD = dente de serra; K ligações → R/K cada. CUBIC: rápido longe de Wmax, lento perto.' },
{ id: 'c-table', t: 'cong', title: 'Como preencher a tabela de slow start do exame',
  html: `<p>O problema grande de TCP pede uma tabela com, para cada segmento: <b>t</b> (instante), <b>SN</b>, <b>D</b> (dados, em MSS), <b>AN</b> e <b>cwnd</b>. Método:</p>
  <ol><li><b>Handshake</b> (t = 0 até 1 RTT): SYN com SN = ISN do cliente; SYN+ACK com SN = ISN do servidor e AN = ISN cliente + 1; ACK com AN = ISN servidor + 1. D = 0.</li>
  <li><b>Rondas</b>: em cada RTT o emissor envia min(cwnd, rwnd, dados que faltam) segmentos, todos “ao mesmo tempo” (RTT ≫ L/R).</li>
  <li><b>SN</b> de cada segmento = SN do anterior + bytes do anterior. O primeiro byte de dados é ISN + 1.</li>
  <li><b>AN</b> de cada ACK = SN do segmento confirmado + bytes dele (sem delayed ACK: um ACK por segmento).</li>
  <li><b>cwnd</b> sobe 1 MSS por ACK recebido: 1 → 2 → 4 → 8…</li></ol>
  <p>Exemplo: 7000 bytes, MSS 1000, ISN do emissor 49. Dados de 50 a 7049 = 7 segmentos. Ronda 1 (cwnd 1): SN 50. Ronda 2 (cwnd 2): 1050, 2050. Ronda 3 (cwnd 4): 3050, 4050, 5050, 6050. Último ACK: <b>7050</b>.</p>
  <p>Se o recetor anunciar rwnd = 2000 (2 MSS), a janela efetiva nunca passa de 2 segmentos por RTT, por maior que seja cwnd.</p>`,
  key: 'Por ronda: min(cwnd, rwnd) segmentos. SN = anterior + bytes. AN = SN confirmado + bytes. cwnd +1 MSS por ACK.' },
]);
