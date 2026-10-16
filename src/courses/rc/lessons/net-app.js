/* ===== RC lessons: Internet and application layer. Each card: analogy → theory → example → key line. ===== */
STUDY.lessons('rc', [
/* ---------------- INTERNET, SWITCHING, DELAYS ---------------- */
{ id: 'n-inet', t: 'net', title: 'O que é a Internet',
  html: `<p>Pensa na rede de estradas de um país: há ruas de bairro (onde estão as casas), estradas nacionais e autoestradas, cada uma gerida por uma entidade diferente, mas todas ligadas. A Internet é isso para pacotes de dados.</p>
  <ul><li><b>Borda (edge)</b>: os computadores terminais (hosts): portáteis, telemóveis, servidores. É aqui que correm as aplicações.</li>
  <li><b>Redes de acesso</b>: ligam a borda ao resto (ADSL, cabo, fibra, Wi-Fi, 4G/5G, Ethernet da empresa).</li>
  <li><b>Núcleo (core)</b>: a malha de <b>encaminhadores</b> (routers) e ligações que leva os pacotes de rede em rede.</li></ul>
  <p>Os princípios que o professor sublinha:</p>
  <ul><li><b>Rede de redes</b>: milhares de ISPs (locais, regionais, globais) interligados.</li>
  <li><b>Serviço “best effort”</b>: a rede faz o melhor possível para entregar, mas não promete nada (nem entrega, nem atraso, nem ordem).</li>
  <li><b>Inteligência na borda</b> (princípio fim-a-fim): a rede é simples; as funções complicadas (fiabilidade, controlo de congestão) ficam nos hosts. Foi isto que permitiu inovar sem mudar a rede.</li>
  <li><b>Camadas</b> e <b>encapsulamento</b> (próximas lições).</li></ul>`,
  key: 'Borda = hosts e aplicações. Núcleo = encaminhadores. A rede é “best effort”; a inteligência está nas pontas.' },
{ id: 'n-proto', t: 'net', title: 'Protocolo e interface de serviço',
  html: `<p>Quando cumprimentas alguém: dizes “olá”, esperas o “olá” de volta e só depois perguntas as horas. Se a outra pessoa não responder, fazes outra coisa. Isso é um protocolo humano.</p>
  <p>Um <b>protocolo</b> define o <b>formato e a ordem das mensagens trocadas entre entidades da mesma camada</b> (normalmente em máquinas diferentes) e as <b>ações</b> tomadas ao enviar ou receber cada mensagem.</p>
  <p>Já a <b>interface de serviço</b> é outra coisa: é o <b>conjunto de primitivas que uma camada oferece à camada de cima</b> na mesma máquina (por exemplo, a API de sockets que o transporte oferece à aplicação).</p>
  <div class="tbl-wrap"><table><tr><th></th><th>Protocolo</th><th>Interface de serviço</th></tr>
  <tr><td>Entre quem?</td><td>Pares da mesma camada (horizontal)</td><td>Camada N e camada N+1 (vertical)</td></tr>
  <tr><td>Exemplo</td><td>HTTP entre browser e servidor</td><td>socket(), connect(), send()</td></tr></table></div>
  <p>Armadilha de exame: um protocolo <b>não</b> especifica as mensagens que a aplicação passa à API, nem as instruções para o programar, nem o que se mostra ao utilizador.</p>`,
  key: 'Protocolo = conversa entre pares da mesma camada. Interface de serviço = o que uma camada oferece à de cima.' },
{ id: 'n-layers', t: 'net', title: 'Camadas e encapsulamento',
  html: `<p>Uma carta: escreves o texto (aplicação), metes num envelope com o nome do primo (transporte), os correios põem-na num saco com o código postal da cidade (rede), e o saco vai num camião até à estação seguinte (ligação). Cada nível só olha para a sua “embalagem”.</p>
  <div class="tbl-wrap"><table><tr><th>Camada</th><th>Pergunta que resolve</th><th>Exemplos</th><th>Unidade</th></tr>
  <tr><td>Aplicação</td><td>Lógica da aplicação</td><td>HTTP, SMTP, DNS, FTP</td><td>mensagem</td></tr>
  <tr><td>Transporte</td><td>Como comunicam processos distantes?</td><td>TCP, UDP</td><td>segmento</td></tr>
  <tr><td>Rede</td><td>Como comunicam computadores distantes?</td><td>IP</td><td>datagrama</td></tr>
  <tr><td>Ligação</td><td>Como comunicam dois nós vizinhos?</td><td>Ethernet, Wi-Fi</td><td>trama</td></tr>
  <tr><td>Física</td><td>Como se transmitem os bits?</td><td>cobre, fibra, rádio</td><td>bit</td></tr></table></div>
  <p><b>Encapsulamento</b>: cada camada junta o seu cabeçalho ao que recebe de cima. Os <b>hosts</b> implementam as 5 camadas; um <b>encaminhador</b> só até à rede; um <b>comutador</b> (switch) só até à ligação.</p>
  <p><b>Regra de ouro dos exames</b> (“A usa X e B usa Y, é possível?”): aplicação e transporte são <b>fim-a-fim</b>, por isso têm de ser iguais nas duas pontas (não pode ser TCP de um lado e UDP do outro, nem HTTP de um lado e SMTP do outro). IP é igual em todo o caminho. Mas a <b>ligação é salto a salto</b>: A pode estar em Wi-Fi (CSMA/CA) e B em Ethernet (CSMA/CD).</p>`,
  key: 'Aplicação e transporte: iguais nas duas pontas. Rede: IP em todo o lado. Ligação: pode mudar em cada salto.' },
{ id: 'n-switch', t: 'net', title: 'Comutação de circuitos vs de pacotes',
  html: `<p><b>Circuitos</b> = uma chamada telefónica clássica: antes de falar reserva-se um “tubo” fim-a-fim; enquanto dura, ninguém mais o usa, mesmo em silêncio. <b>Pacotes</b> = os correios: cada carta segue sozinha e partilha o camião com as outras.</p>
  <ul><li><b>Comutação de circuitos</b>: estabelecimento prévio, recursos reservados (por <b>FDM</b> — bandas de frequência, ou <b>TDM</b> — fatias de tempo). Depois do circuito estabelecido <b>não há filas nem atrasos de congestão</b> nos nós: o ritmo está garantido. Desperdiça capacidade quando o utilizador está calado.</li>
  <li><b>Comutação de pacotes</b>: sem reserva; a capacidade é partilhada por <b>multiplexagem estatística</b>. Aproveita melhor a ligação, mas quando muitos falam ao mesmo tempo formam-se <b>filas</b> (atrasos de congestão) e há <b>perdas</b>.</li></ul>
  <p>Exemplo dos slides: ligação de 1 Mbit/s, cada utilizador precisa de 100 kbit/s quando ativo e está ativo 10% do tempo. Com circuitos cabem <b>10</b> utilizadores. Com pacotes, 35 utilizadores dão uma probabilidade de mais de 10 ativos ao mesmo tempo menor que 0,0004.</p>
  <p><b>TDM</b>: se 4 canais de 100 B/s partilham o meio em fatias, o ritmo total é 4 × 100 B/s = 400 B/s = <b>3200 bit/s</b>.</p>
  <p>Dentro da comutação de pacotes há <b>datagramas</b> (cada pacote é encaminhado sozinho, podem seguir caminhos diferentes — é o IP) e <b>circuitos virtuais</b> (caminho fixado no início, o identificador de circuito no cabeçalho muda em cada salto).</p>`,
  key: 'Circuitos: reserva, sem filas depois de estabelecido. Pacotes: partilha, com filas e perdas.' },
{ id: 'n-sf', t: 'net', title: 'Store-and-forward',
  html: `<p>Imagina uma caravana de 10 carros numa autoestrada com portagens: a portagem só deixa a caravana seguir quando o <b>último</b> carro passou. Um encaminhador faz o mesmo com os bits de um pacote.</p>
  <p><b>Store-and-forward</b>: na comutação de pacotes, um encaminhador tem de <b>receber o pacote completo</b> antes de começar a transmiti-lo na ligação seguinte. Por isso o tempo de transmissão <b>L/R</b> repete-se em cada ligação.</p>
  <p>Fórmula do problema que sai em <b>todos</b> os exames (N pacotes de L bits, caminho com M ligações iguais de ritmo R, sem outro tráfego):</p>
  <p style="text-align:center"><b>t = N·L/R + (M−1)·L/R + propagação</b></p>
  <ul><li><b>N·L/R</b>: o emissor despeja os N pacotes, uns atrás dos outros.</li>
  <li><b>(M−1)·L/R</b>: o último pacote ainda tem de ser retransmitido em cada um dos M−1 encaminhadores.</li>
  <li><b>propagação</b> fim-a-fim: se te dão o <b>RTT</b>, a propagação de ida é <b>RTT/2</b>.</li></ul>
  <p>Exemplo (exame 2025/26): 8 Mbit em pacotes de 8 kbit (N = 1000), caminho A-X-Y-Z-B (M = 4), 100 Mbit/s, RTT 100 ms. L/R = 80 µs. t = 1000 × 0,08 + 3 × 0,08 + 50 = <b>130,24 ms</b>.</p>
  <p>Se as ligações têm ritmos diferentes, o <b>gargalo</b> manda: o tempo é ~ o primeiro pacote a chegar ao gargalo + N × (L/R do gargalo) + o último a sair dele + propagação.</p>`,
  key: 't = N·L/R + (nº de encaminhadores)·L/R + RTT/2. Conta ligações, não nós.' },
{ id: 'n-delay', t: 'net', title: 'Os quatro atrasos',
  html: `<p>Uma ida aos correios: a pessoa ao balcão vê o envelope (<b>processamento</b>), esperas na fila (<b>fila</b>), o funcionário carimba carta a carta, mais devagar se forem muitas (<b>transmissão</b>), e depois a carrinha leva tempo a chegar a outra cidade (<b>propagação</b>).</p>
  <div class="tbl-wrap"><table><tr><th>Atraso</th><th>Depende de</th><th>Fórmula</th></tr>
  <tr><td>Processamento</td><td>ver cabeçalho, erros, decidir a saída</td><td>µs</td></tr>
  <tr><td>Fila</td><td>tráfego que chega (congestão)</td><td>varia: intensidade La/R</td></tr>
  <tr><td>Transmissão</td><td>tamanho do pacote e ritmo da ligação</td><td><b>L / R</b></td></tr>
  <tr><td>Propagação</td><td>distância e velocidade do sinal</td><td><b>d / v</b></td></tr></table></div>
  <p>Transmissão ≠ propagação: transmitir é “empurrar” os bits para o cabo; propagar é o bit viajar no cabo. Um pacote maior ou uma ligação mais lenta aumentam a transmissão, nunca a propagação.</p>
  <p><b>RTT</b> nos exames = tempo de ida-e-volta <b>devido à propagação</b> (2·d/v). Por isso, mudar R ou L <b>não muda o RTT</b> — pergunta que já saiu três vezes.</p>
  <p><b>Intensidade de tráfego</b> La/R (a = pacotes/s que chegam): se tende para 1, a fila cresce sem limite; se a fila enche, há <b>perdas</b>.</p>`,
  key: 'Transmissão = L/R. Propagação = d/v. O RTT dos exames é só propagação: não depende de R nem de L.' },
{ id: 'n-tput', t: 'net', title: 'Débito, gargalo e bits em trânsito',
  html: `<p>Água a passar por canos de grossuras diferentes: o caudal no fim é o do cano mais fino.</p>
  <p><b>Débito</b> (throughput) fim-a-fim = taxa a que os bits chegam ao destino. Num caminho servidor (Rs) → cliente (Rc), o débito é <b>min(Rs, Rc)</b>: a ligação mais lenta é o <b>gargalo</b>. Se N fluxos partilham uma ligação de núcleo R, cada um tem no máximo R/N.</p>
  <p><b>Bits em trânsito</b> (produto largura de banda × atraso): quantos bits “cabem” no cabo ao mesmo tempo = <b>R × d/v</b>.</p>
  <p>Exemplo (exame 2024/25): 20 km, v = 2×10⁸ m/s → propagação 100 µs; a 100 Mbit/s cabem <b>10⁸ × 10⁻⁴ = 10 kbit</b> no cabo.</p>
  <p>Unidades: em redes, k = 10³ e M = 10⁶ (não 1024). Bytes → bits: ×8. Nos exames, “1 kByte” = 8 kbit.</p>
  <p><b>Taxa de erros (BER)</b> = bits com erro / bits transmitidos. Ex.: 128 erros em 100 min a 2048 kbit/s → 128 / (6000 × 2,048×10⁶) ≈ 1,04×10⁻⁸.</p>`,
  key: 'Débito = ritmo do gargalo. Bits em trânsito = R × tempo de propagação.' },

/* ---------------- APPLICATIONS, SOCKETS, P2P ---------------- */
{ id: 's-arch', t: 'sock', title: 'Arquiteturas e o que as aplicações pedem',
  html: `<p>Um restaurante (cliente-servidor): a cozinha está sempre no mesmo sítio e todos lhe pedem. Um jantar de partilha (P2P): cada convidado traz comida e também come a dos outros.</p>
  <ul><li><b>Cliente-servidor</b>: o servidor está sempre ligado, com endereço IP fixo e conhecido; os clientes iniciam o contacto e não falam diretamente entre si. Ex.: Web, correio.</li>
  <li><b>P2P</b>: pares que comunicam diretamente, ligam-se e desligam-se, mudam de IP; cada par que chega traz <b>capacidade de serviço</b> (escalabilidade própria). Ex.: BitTorrent.</li></ul>
  <p>Um <b>processo</b> é um programa a correr; processos em máquinas diferentes trocam mensagens através de <b>sockets</b> (a “porta” entre a aplicação e o transporte). Para identificar um processo remoto é preciso o <b>endereço IP</b> do host <b>e</b> o <b>número de porto</b>.</p>
  <p>O que uma aplicação pode precisar do transporte: <b>fiabilidade</b>, <b>débito</b>, <b>tempo</b> (atraso) e <b>segurança</b>. O TCP dá fiabilidade, controlo de fluxo e de congestão; o UDP não dá nada disso. <b>Nenhum</b> dá garantias de atraso ou de débito.</p>
  <div class="tbl-wrap"><table><tr><th>Protocolo</th><th>Transporte</th><th>Porto</th></tr>
  <tr><td>HTTP / HTTPS</td><td>TCP (HTTP/3: QUIC sobre UDP)</td><td>80 / 443</td></tr><tr><td>SMTP</td><td>TCP</td><td>25</td></tr>
  <tr><td>DNS</td><td>UDP (normalmente)</td><td>53</td></tr><tr><td>FTP</td><td>TCP</td><td>21 controlo, 20 dados</td></tr>
  <tr><td>POP3 / IMAP</td><td>TCP</td><td>110 / 143</td></tr></table></div>`,
  key: 'Processo remoto = IP + porto. TCP dá fiabilidade e controlo de congestão; nenhum transporte garante atraso ou débito.' },
{ id: 's-api', t: 'sock', title: 'A API de sockets',
  html: `<p>Uma central telefónica de empresa: o número da empresa é publicado (bind), a rececionista fica à espera (listen) e, quando alguém liga, passa a chamada para um ramal novo (accept) para continuar a atender outras.</p>
  <div class="tbl-wrap"><table><tr><th>Chamada</th><th>Para quê</th><th>Quem usa</th></tr>
  <tr><td>getaddrinfo()</td><td>consulta o <b>DNS</b>: nome → endereço IP</td><td>sobretudo clientes</td></tr>
  <tr><td>socket()</td><td>cria o socket (TCP: SOCK_STREAM; UDP: SOCK_DGRAM)</td><td>todos</td></tr>
  <tr><td>bind()</td><td>associa um <b>porto (bem-conhecido)</b> ao socket</td><td>servidores</td></tr>
  <tr><td>listen()</td><td>marca o socket TCP como passivo, à espera de ligações</td><td>servidor TCP</td></tr>
  <tr><td>accept()</td><td>aceita uma ligação e devolve um <b>socket novo</b> para esse cliente</td><td><b>só servidor TCP</b></td></tr>
  <tr><td>connect()</td><td>estabelece a ligação TCP (three-way handshake)</td><td>cliente TCP</td></tr>
  <tr><td>write()/read()</td><td>enviar/receber bytes numa ligação TCP</td><td>TCP</td></tr>
  <tr><td>sendto()/recvfrom()</td><td>enviar/receber um datagrama, com o endereço do outro lado</td><td>UDP</td></tr></table></div>
  <p><b>TCP é um fluxo de bytes</b>: os bytes de um write() podem ir em vários segmentos, e dois write() podem ir num só. <b>UDP preserva as mensagens</b>: cada sendto() dá exatamente <b>um</b> datagrama UDP, que chega inteiro ou não chega.</p>
  <p>Num servidor <b>UDP</b> há um só socket e o mesmo recvfrom() pode ler de clientes diferentes. Num servidor <b>TCP</b> cada cliente tem o seu socket (devolvido por accept), distinguido pelo tuplo (IP origem, porto origem, IP destino, porto destino).</p>`,
  key: 'bind = porto bem-conhecido; accept só no servidor TCP; getaddrinfo = DNS. UDP: 1 sendto = 1 datagrama. TCP: fluxo de bytes.' },
{ id: 's-select', t: 'sock', title: 'Vários clientes ao mesmo tempo: fork e select',
  html: `<p>Um empregado de mesa sozinho não fica parado à frente de uma mesa à espera que decidam: dá uma volta e atende quem levantar a mão. Isso é o <b>select()</b>.</p>
  <p>As leituras (read, recvfrom, accept, ler do stdin) <b>bloqueiam</b>: se o programa ficar à espera numa fonte, não atende as outras. Há duas soluções:</p>
  <ul><li><b>Processos concorrentes</b>: depois de cada accept(), um <b>fork()</b> cria um processo filho que trata desse cliente com o <b>socket novo</b>; o pai volta ao accept() no socket de escuta.</li>
  <li><b>select()</b>: num <b>só processo</b>, indica-se um conjunto de descritores (fd_set) — socket de escuta, sockets de clientes aceites, stdin, socket UDP… — e o select() bloqueia até <b>algum estar pronto para ler</b>, dizendo qual.</li></ul>
  <p>Num servidor TCP com select(), cada descritor devolvido por accept() é guardado (por exemplo num vetor) e acrescentado ao fd_set.</p>`,
  key: 'select() devolve, de um conjunto de descritores bloqueantes, os que já têm dados prontos para ler.' },
{ id: 's-p2p', t: 'sock', title: 'Tempo de distribuição: cliente-servidor vs P2P',
  html: `<p>Distribuir um ficheiro de F bits a N estações. u<sub>s</sub> = ritmo de upload do servidor, d<sub>min</sub> = menor ritmo de download, u<sub>i</sub> = upload de cada par.</p>
  <ul><li><b>Cliente-servidor</b>: o servidor tem de enviar N cópias. <b>D<sub>cs</sub> ≥ max( N·F/u<sub>s</sub> , F/d<sub>min</sub> )</b> → cresce linearmente com N.</li>
  <li><b>P2P</b>: o servidor só precisa de enviar <b>uma</b> cópia; os pares redistribuem. <b>D<sub>P2P</sub> ≥ max( F/u<sub>s</sub> , F/d<sub>min</sub> , N·F/(u<sub>s</sub> + Σu<sub>i</sub>) )</b> → cresce muito mais devagar.</li></ul>
  <p>Exemplo (exame 2021/22): F = 1 Gbit, N = 4, todos com 200 Mbit/s. F/u<sub>s</sub> = 5 s; F/d = 5 s; N·F/(u<sub>s</sub>+Σu<sub>i</sub>) = 4/1 = 4 s. D<sub>P2P</sub> = <b>5 s</b> (em cliente-servidor seria 20 s).</p>
  <p>Truque: o termo F/u<sub>s</sub> é muitas vezes o maior (o servidor tem de despejar pelo menos uma cópia inteira).</p>
  <p><b>BitTorrent</b>: o ficheiro é dividido em pedaços (chunks); pede-se primeiro o <b>mais raro</b>; envia-se aos pares que nos enviam mais (<b>tit-for-tat</b>), com um par “optimistamente desbloqueado” de vez em quando.</p>`,
  key: 'P2P: max(F/us, F/dmin, NF/(us+Σui)). O servidor só tem de enviar uma cópia.' },

/* ---------------- WEB AND HTTP ---------------- */
{ id: 'h-basics', t: 'http', title: 'HTTP: pedidos, respostas e estado',
  html: `<p>Uma página web é um ficheiro base (HTML) que referencia <b>objetos</b> (imagens, scripts…), cada um com o seu URL. O browser pede cada objeto com uma mensagem HTTP; o servidor responde. HTTP corre sobre <b>TCP, porto 80</b>.</p>
  <p>HTTP é <b>stateless</b>: o servidor não guarda nada sobre pedidos anteriores do cliente (para memória usa-se cookies). FTP e IMAP, pelo contrário, mantêm estado.</p>
  <p>Pedido: <code>GET /index.html HTTP/1.1\\r\\n</code> + cabeçalhos (<code>Host:</code>, <code>Connection:</code>, <code>If-Modified-Since:</code>…) + linha vazia. Métodos: GET, POST (dados no corpo), HEAD (só cabeçalhos), PUT, DELETE.</p>
  <p>Resposta: <b>status line</b> + cabeçalhos (<code>Date</code>, <code>Last-Modified</code>, <code>Content-Length</code>, <code>Content-Type</code>…) + objeto.</p>
  <div class="tbl-wrap"><table><tr><th>Código</th><th>Significado</th></tr><tr><td>200 OK</td><td>sucesso, objeto vai na resposta</td></tr>
  <tr><td>301 Moved Permanently</td><td>objeto mudou (novo URL em Location:)</td></tr><tr><td>304 Not Modified</td><td>resposta a GET condicional: usa a tua cópia</td></tr>
  <tr><td>400 Bad Request</td><td>pedido mal formado</td></tr><tr><td>404 Not Found</td><td>não existe</td></tr><tr><td>407 Proxy Authentication Required</td><td>o proxy exige autenticação</td></tr></table></div>
  <p><b>Virtual hosting</b> (lab 3): vários sites no mesmo IP; o servidor sabe qual servir pelo cabeçalho <b>Host:</b>.</p>`,
  key: 'HTTP: pedido/resposta sobre TCP 80, stateless. O cabeçalho Host permite vários sites no mesmo IP.' },
{ id: 'h-persist', t: 'http', title: 'Contar RTTs: persistente, paralelo, pipelining',
  html: `<p>Como pedir vários pratos: podes chamar o empregado, pedir um, esperar, despedi-lo e voltar a chamá-lo (não persistente); chamá-lo uma vez e pedir um de cada vez (persistente); ou pedir tudo de seguida (pipelining).</p>
  <ul><li><b>Não persistente</b> (padrão no HTTP/1.0): uma ligação TCP por objeto. Cada objeto custa <b>2 RTT</b> (1 para estabelecer TCP + 1 pedido/resposta) + tempo de transmissão.</li>
  <li><b>Persistente</b> (padrão no HTTP/1.1; no 1.0 com <code>Connection: keep-alive</code>): a ligação fica aberta. 1 RTT de TCP e depois <b>1 RTT por objeto</b>.</li>
  <li><b>Pipelining</b> (HTTP/1.1): numa ligação persistente, pede todos os objetos referenciados de uma vez → <b>1 RTT</b> para todos.</li>
  <li><b>Ligações paralelas</b>: k ligações ao mesmo tempo dividem os objetos em rondas.</li></ul>
  <div class="tbl-wrap"><table><tr><th>Base + N imagens</th><th>RTTs (sem contar transmissão)</th></tr>
  <tr><td>Não persistente, série</td><td>2 + 2N</td></tr><tr><td>Não persistente, k paralelas</td><td>2 + 2·⌈N/k⌉</td></tr>
  <tr><td>Persistente sem pipelining</td><td>2 + N</td></tr><tr><td>Persistente com pipelining</td><td>2 + 1 = 3</td></tr></table></div>
  <p>Exemplo (exame 2020/21): base + 4 imagens em HTTP/1.0: série = 10 RTT; com 2 paralelas = 2 + 2×2 = 6 RTT → poupa <b>4 RTT</b>. A transmissão dos objetos soma-se igual nos dois casos.</p>`,
  key: 'Não persistente: 2 RTT por objeto. Persistente: 1 RTT por objeto. Pipelining: 1 RTT para todos os referenciados.' },
{ id: 'h-ver', t: 'http', title: 'HTTP/1.0, 1.1, 2 e 3',
  html: `<ul><li><b>HTTP/1.0</b>: não persistente por omissão, mas o cabeçalho <code>Connection: keep-alive</code> torna a ligação persistente.</li>
  <li><b>HTTP/1.1</b>: persistente por omissão, pipelining, cabeçalho Host obrigatório. Problema: <b>head-of-line blocking</b> — um objeto grande à frente atrasa os pequenos atrás (as respostas vêm por ordem).</li>
  <li><b>HTTP/2</b>: <b>mantém a semântica</b> (métodos, códigos, cabeçalhos) mas muda o transporte das mensagens: enquadramento binário, objetos divididos em <b>tramas intercaladas</b> numa só ligação TCP (multiplexagem), prioridades, compressão de cabeçalhos e <b>server push</b> (o servidor envia objetos que não foram pedidos explicitamente).</li>
  <li><b>HTTP/3</b>: corre sobre <b>QUIC</b>, que corre sobre <b>UDP</b> (não TCP). QUIC junta estabelecimento de ligação e segurança num só RTT e evita o head-of-line blocking entre streams.</li></ul>
  <p>No exame 2022/23: base + 2 imagens com HTTP/1.1 e pipelining = 3 RTT + transmissões; com HTTP/2 e push, 2 RTT + transmissões.</p>`,
  key: 'HTTP/2 = mesma semântica, transporte mais eficiente (multiplexagem, push). HTTP/3 = QUIC sobre UDP.' },
{ id: 'h-cookie', t: 'http', title: 'Cookies',
  html: `<p>O cartão de cliente de uma loja: na primeira compra dão-te um número; das próximas vezes mostras o cartão e eles sabem quem és e o que compraste.</p>
  <p>Como o HTTP é stateless, os sites usam <b>cookies</b> para guardar estado. Quatro componentes:</p>
  <ol><li>cabeçalho <code>Set-Cookie:</code> na <b>resposta</b> HTTP (o servidor atribui um ID);</li>
  <li>cabeçalho <code>Cookie:</code> nos <b>pedidos</b> seguintes;</li>
  <li>ficheiro de cookies guardado no browser;</li>
  <li>base de dados no site, indexada pelo ID.</li></ol>
  <p>Servem para autenticação, carrinhos de compras, recomendações, estado de sessão. O preço: <b>privacidade</b> (cookies de terceiros seguem-te entre sites).</p>`,
  key: 'Set-Cookie na resposta, Cookie nos pedidos seguintes: estado por cima de um protocolo sem estado.' },
{ id: 'h-cache', t: 'http', title: 'Caches e GET condicional',
  html: `<p>Tens o jornal de ontem em casa. Antes de sair para comprar o de hoje, telefonas ao quiosque: “mudou alguma coisa desde ontem?”. Se não, ficas com o teu.</p>
  <p>Uma <b>cache web</b> (proxy, ou a cache do próprio browser) guarda objetos recentes: menos atraso para o cliente e menos tráfego na ligação de acesso da instituição.</p>
  <p>Problema: a cópia pode estar <b>desatualizada</b>. Solução: o <b>GET condicional</b>. Quando o objeto volta a ser pedido, o cliente envia o GET com <code>If-Modified-Since: &lt;data da cópia&gt;</code> (a data veio do <code>Last-Modified</code> da primeira resposta).</p>
  <ul><li>Se não mudou → <b>304 Not Modified</b>, sem o objeto. Usa-se a cópia.</li>
  <li>Se mudou → <b>200 OK</b> com o objeto novo.</li></ul>
  <p>Se o browser fizer um pedido <b>normal</b> (não condicional), o servidor simplesmente responde <b>200 OK</b> com o objeto inteiro, mesmo que não tenha mudado.</p>`,
  key: 'Objeto em cache pedido de novo → GET condicional (If-Modified-Since). Não mudou: 304. Pedido normal: sempre 200.' },
{ id: 'h-ftp', t: 'http', title: 'FTP: controlo fora de banda',
  html: `<p>Uma encomenda por telefone: falas com a loja numa linha (controlo) e a encomenda chega por outro caminho, numa carrinha (dados).</p>
  <ul><li>O cliente abre uma ligação TCP de <b>controlo</b> para o porto <b>21</b> do servidor: autenticação, mudar de diretoria, listar, pedir ficheiros.</li>
  <li>Cada ficheiro vai numa ligação TCP de <b>dados</b> separada (porto <b>20</b> do lado do servidor, no modo ativo), que fecha no fim do ficheiro.</li>
  <li>O controlo vai <b>fora de banda</b> (out-of-band), num canal diferente dos dados — ao contrário do HTTP, que vai dentro de banda.</li>
  <li>FTP é <b>stateful</b>: o servidor lembra-se do utilizador e da diretoria atual durante a sessão.</li></ul>`,
  key: 'FTP: controlo no porto 21 (fora de banda), uma ligação de dados por ficheiro, e guarda estado.' },

/* ---------------- E-MAIL AND DNS ---------------- */
{ id: 'd-mail', t: 'dns', title: 'Correio eletrónico: SMTP, POP3, IMAP',
  html: `<p>O correio em papel: levas a carta à tua estação de correios (SMTP), ela envia-a à estação do destinatário (SMTP), e o destinatário vai buscá-la à sua caixa (POP3, IMAP ou webmail).</p>
  <p><b>SMTP</b>: <b>TCP, porto 25</b>, protocolo de <b>envio (push)</b>, mensagens em <b>ASCII de 7 bits</b>. O HTTP, pelo contrário, é <b>pull</b>. Uma sessão típica:</p>
  <p><code>220</code> (servidor pronto) → <code>EHLO</code>/<code>HELO</code> → <code>MAIL FROM:</code> → <code>RCPT TO:</code> (um por destinatário) → <code>DATA</code> → <code>354</code> → cabeçalhos + corpo, terminado por uma linha com “.” → <code>250</code> → <code>QUIT</code> → <code>221</code>.</p>
  <p><b>Envelope vs cabeçalho</b>: os <code>RCPT TO:</code> dizem a quem entregar; o <code>To:</code>/<code>Cc:</code> dentro de DATA é só texto mostrado ao leitor. Por isso podem ser diferentes: um destinatário em <b>Bcc</b> tem um RCPT TO mas não aparece no cabeçalho.</p>
  <p><b>MIME</b>: cabeçalhos (<code>Content-Type</code>, <code>Content-Transfer-Encoding</code>) para anexos e multipart. Dados binários (imagens) são codificados em <b>base64</b> porque o SMTP só transporta ASCII de 7 bits.</p>
  <p>Acesso à caixa: <b>POP3</b> (descarrega, simples, não guarda estado entre sessões), <b>IMAP</b> (mensagens e pastas ficam no servidor, guarda estado), <b>HTTPS</b> (webmail no browser).</p>`,
  key: 'SMTP = envio (push, TCP 25, ASCII 7 bits → base64). Ler: POP3/IMAP, ou HTTPS no browser. RCPT TO ≠ To: (Bcc).' },
{ id: 'd-dns', t: 'dns', title: 'DNS: uma base de dados distribuída',
  html: `<p>Uma lista telefónica gigante não cabe num só livro nem numa só biblioteca: há um índice geral (raiz) que te manda para a lista de cada país (TLD), que te manda para a lista da empresa (autoritativo).</p>
  <p>O DNS traduz <b>nomes em endereços IP</b> (e mais: aliases, servidores de correio, distribuição de carga). Corre sobre <b>UDP, porto 53</b>. Não é centralizado porque um só servidor seria um ponto único de falha, teria tráfego enorme, ficaria longe de muitos e seria impossível de manter.</p>
  <ul><li><b>Servidores raiz</b>: sabem onde estão os servidores TLD.</li>
  <li><b>TLD</b> (.pt, .com, .org…): sabem os servidores autoritativos de cada domínio.</li>
  <li><b>Autoritativos</b>: têm os registos de um domínio (ex.: tecnico.ulisboa.pt).</li>
  <li><b>Servidor local</b> (do ISP ou da instituição): não pertence à hierarquia; recebe as perguntas dos hosts e resolve por eles, guardando em <b>cache</b>.</li></ul>`,
  key: 'Raiz → TLD → autoritativo. O servidor local faz o trabalho pelo host e guarda tudo em cache.' },
{ id: 'd-query', t: 'dns', title: 'Consultas iterativas, recursivas e cache',
  html: `<ul><li><b>Iterativa</b>: o servidor contactado responde “não sei, pergunta a este”. O servidor local vai perguntando: raiz → TLD → autoritativo. É o habitual.</li>
  <li><b>Recursiva</b>: o servidor contactado assume a tarefa e devolve a resposta final. O host faz uma pergunta recursiva ao servidor local; se a raiz e os TLD também resolvessem recursivamente, ficariam sobrecarregados.</li></ul>
  <p>Quando o servidor local não tem a tradução (nem nada útil em cache), começa por consultar <b>um servidor raiz</b>. Na prática os endereços dos TLD costumam estar em cache, poupando a raiz.</p>
  <p><b>Cache</b>: cada servidor que aprende uma tradução guarda-a durante o <b>TTL</b> do registo. Desvantagem: uma entrada pode ficar desatualizada até o TTL expirar.</p>
  <p>Lab 4: <code>dig +trace</code> mostra o caminho iterativo desde a raiz.</p>`,
  key: 'Host → local: recursiva. Local → raiz → TLD → autoritativo: iterativas. Cache durante o TTL.' },
{ id: 'd-rr', t: 'dns', title: 'Registos DNS (RR) e o dig',
  html: `<p>Formato: <b>(nome, TTL, classe, tipo, valor)</b>.</p>
  <div class="tbl-wrap"><table><tr><th>Tipo</th><th>Nome</th><th>Valor</th></tr>
  <tr><td><b>A</b></td><td>nome de host</td><td>endereço IPv4</td></tr><tr><td><b>AAAA</b></td><td>nome de host</td><td>endereço IPv6</td></tr>
  <tr><td><b>NS</b></td><td>domínio</td><td>nome do servidor autoritativo do domínio</td></tr>
  <tr><td><b>CNAME</b></td><td>alias</td><td>nome canónico (o “verdadeiro”)</td></tr>
  <tr><td><b>MX</b></td><td>domínio</td><td>servidor de correio do domínio (com prioridade)</td></tr>
  <tr><td><b>SOA</b></td><td>zona</td><td>servidor principal, email do administrador, número de série</td></tr></table></div>
  <p>Ler uma cadeia: <code>www.rc.pt CNAME lab.rc.pt</code> e <code>lab.rc.pt A 193.136.138.76</code> → www e lab são <b>a mesma máquina</b>, com IP 193.136.138.76. Um <code>NS</code> diz o <b>nome</b> do servidor; o IP desse servidor vem num <code>A</code> (no dig, na secção ADDITIONAL).</p>
  <p>Saída do dig: QUESTION (o que se perguntou), ANSWER (a resposta), AUTHORITY (servidores NS do domínio), ADDITIONAL (os A desses servidores). Vários registos A para o mesmo nome = distribuição de carga.</p>`,
  key: 'A = IP. NS = nome do servidor do domínio (o IP dele vem noutro A). CNAME = alias. MX = correio.' },
]);
