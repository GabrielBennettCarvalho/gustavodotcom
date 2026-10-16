/* ===== RC lessons: network layer (data plane: IP, addressing, NAT, DHCP, ICMP, IPv6; control plane: routing, SDN) ===== */
STUDY.lessons('rc', [
/* ---------------- DATA PLANE ---------------- */
{ id: 'i-fwd', t: 'ip', title: 'Expedição vs encaminhamento',
  html: `<p>Uma viagem de carro: em cada rotunda escolhes a saída olhando para as placas (<b>expedição</b>, uma decisão local e rápida). Antes de sair de casa, planeaste o percurso no mapa (<b>encaminhamento</b>, uma decisão sobre a rede toda).</p>
  <ul><li><b>Expedição (forwarding)</b> — <b>plano de dados</b>: num encaminhador, mover o datagrama da porta de entrada para a porta de saída certa, consultando a <b>tabela de expedição</b>. Decisão <b>local</b>, em nanossegundos, feita em hardware.</li>
  <li><b>Encaminhamento (routing)</b> — <b>plano de controlo</b>: calcular os caminhos fim-a-fim e preencher/atualizar as tabelas de expedição. Algoritmos como estado-da-ligação e vetor-distância, em segundos.</li></ul>
  <p>Duas formas de fazer o plano de controlo: <b>tradicional</b> (cada encaminhador corre o algoritmo e conversa com os outros) ou <b>SDN</b> (um controlador logicamente centralizado calcula e instala as tabelas; os encaminhadores só fazem o plano de dados).</p>`,
  key: 'Expedição = decisão local, por datagrama (plano de dados). Encaminhamento = calcular as tabelas (plano de controlo).' },
{ id: 'i-router', t: 'ip', title: 'Dentro de um encaminhador',
  html: `<ul><li><b>Portas de entrada</b>: recebem a trama, retiram o datagrama e consultam a tabela de expedição (<b>maior prefixo</b>) para escolher a saída.</li>
  <li><b>Matriz de comutação</b> (switching fabric): liga entradas a saídas (memória, barramento ou rede de interligação).</li>
  <li><b>Portas de saída</b>: filas onde os datagramas esperam pela ligação; se enchem, há <b>perdas</b>. A política de escalonamento (FIFO, prioridades, round robin) decide quem sai primeiro.</li>
  <li><b>Processador de encaminhamento</b>: corre o plano de controlo (ou fala com o controlador SDN).</li></ul>
  <p>Também pode haver filas nas <b>entradas</b>, se a matriz for mais lenta do que as entradas juntas: aí aparece o <b>bloqueio head-of-line</b> (um datagrama à frente, à espera de uma saída ocupada, bloqueia os de trás que iam para saídas livres).</p>`,
  key: 'Entrada (consulta a tabela) → matriz de comutação → saída (fila). As filas, e as perdas, estão nas portas.' },
{ id: 'i-addr', t: 'ip', title: 'Endereços IPv4, máscaras e sub-redes',
  html: `<p>Uma morada: <b>rua</b> + <b>número da porta</b>. Todas as casas da mesma rua partilham o nome da rua. No IP, a “rua” é a <b>sub-rede</b> e a “porta” é o <b>host</b>.</p>
  <p>Um endereço IPv4 tem <b>32 bits</b> e pertence a uma <b>interface</b> (um encaminhador tem vários). A <b>máscara</b> (ou o prefixo /n) diz quantos bits da esquerda são da <b>rede</b>:</p>
  <ul><li>/24 = 255.255.255.0 · /25 = 255.255.255.128 · /26 = .192 · /27 = .224 · /23 = 255.255.254.0 · /22 = 255.255.252.0 · /21 = 255.255.248.0</li></ul>
  <p><b>Endereço de rede</b> = IP AND máscara (bits de host a 0). <b>Broadcast</b> = bits de host a 1. Hosts utilizáveis = 2<sup>32−n</sup> − 2.</p>
  <p>Truque para o octeto “partido”: o bloco tem tamanho <b>256 − valor da máscara</b> nesse octeto. Ex.: 193.136.143.89/25 → máscara .128 → blocos de 128 (0–127, 128–255) → 89 está no primeiro → rede <b>193.136.143.0/25</b>.</p>
  <p>Uma <b>sub-rede</b> = interfaces que se alcançam <b>sem passar por um encaminhador</b>. <b>CIDR</b>: a parte de rede tem tamanho arbitrário (a.b.c.d/x), em vez das antigas classes A/B/C.</p>
  <p>Gamas privadas (não circulam na Internet): <b>10.0.0.0/8</b>, <b>172.16.0.0/12</b>, <b>192.168.0.0/16</b>.</p>`,
  key: 'Rede = IP AND máscara. Bloco no octeto partido = 256 − máscara. Hosts = 2^(32−n) − 2.' },
{ id: 'i-same', t: 'ip', title: 'Entregar direto ou ao default gateway?',
  html: `<p>Antes de enviar um datagrama, o host faz uma pergunta: <b>o destino está na minha sub-rede?</b> Compara (IP destino AND a <b>sua</b> máscara) com (o seu IP AND a sua máscara).</p>
  <ul><li><b>Mesma sub-rede</b> → envia diretamente ao destino: a trama leva o <b>MAC do destino</b> (obtido por ARP).</li>
  <li><b>Sub-rede diferente</b> → envia ao <b>default gateway</b> (o encaminhador): a trama leva o <b>MAC do encaminhador</b>, mas o datagrama mantém o <b>IP do destino final</b>.</li></ul>
  <p>Se a tabela ARP estiver vazia, a <b>primeira mensagem</b> enviada é um <b>pedido ARP em broadcast</b> a perguntar o MAC do IP de destino (mesma rede) ou do <b>gateway</b> (rede diferente).</p>
  <p>Exemplo: 10.0.0.100 quer enviar para 10.0.0.130. Com /24 estão na mesma rede → direto. Com /25 (.0–.127 e .128–.255) estão em redes diferentes → gateway.</p>
  <p>Ao longo do caminho os <b>IPs</b> (origem e destino) mantêm-se; os <b>MACs</b> mudam em cada salto entre encaminhadores. Os comutadores (switches) são transparentes: não mudam nem o IP nem o MAC.</p>`,
  key: 'Mesma sub-rede: MAC do destino. Outra sub-rede: MAC do gateway. O IP de destino é sempre o final.' },
{ id: 'i-alloc', t: 'ip', title: 'Dividir o bloco de um ISP',
  html: `<p>O problema que sai na Parte III: um ISP tem um bloco (ex.: 194.24.160.0/19) e atribui blocos a organizações, pela ordem dos pedidos, “sempre o endereço base mais baixo disponível”.</p>
  <ol><li><b>Tamanho</b>: arredonda o pedido à potência de 2 seguinte. 500 → 512 = 2⁹ → /23. 1000 → 1024 → /22. 2000 → 2048 → /21.</li>
  <li><b>Alinhamento</b>: um bloco de 2<sup>k</sup> endereços tem de começar num múltiplo de 2<sup>k</sup>. No 3.º octeto: /23 → múltiplo de 2; /22 → múltiplo de 4; /21 → múltiplo de 8.</li>
  <li><b>Base mais baixa</b> livre e alinhada. Podem ficar buracos, que os pedidos seguintes preenchem.</li></ol>
  <p>Exemplo (exame 2022/23): 194.24.160.0/19; A = 500, B = 2000, C = 1000.</p>
  <ul><li>A: /23 em <b>194.24.160.0/23</b> (160.0–161.255).</li>
  <li>B: /21 tem de começar num múltiplo de 8 → 162 não serve → <b>194.24.168.0/21</b> (168.0–175.255).</li>
  <li>C: /22, múltiplo de 4, o mais baixo livre → <b>194.24.164.0/22</b> (164.0–167.255). (162–163 fica livre.)</li></ul>
  <p>Máscaras: /23 = 255.255.254.0; /22 = 255.255.252.0; /21 = 255.255.248.0.</p>`,
  key: 'Arredonda a 2^k, alinha a múltiplo de 2^k, escolhe a base livre mais baixa. B pode “saltar” por cima de C.' },
{ id: 'i-lpm', t: 'ip', title: 'Expedição pelo maior prefixo',
  html: `<p>Um carteiro com instruções: “tudo para Lisboa vai pela carrinha A; mas o que for para a Rua Augusta vai pela bicicleta B”. A instrução mais <b>específica</b> ganha.</p>
  <p>A tabela de expedição tem entradas (rede, máscara, interface). Para cada destino, procuram-se as entradas que o contêm e escolhe-se a de <b>prefixo mais longo</b>. A entrada 0.0.0.0/0 (default) apanha tudo o que não bater com nenhuma outra.</p>
  <p>Exemplo (exame 2020/21): destino 193.136.143.26, rotas 193.136.0.0/16, 193.136.143.0/24 e 193.136.143.0/25 → todas contêm o destino (26 &lt; 128), ganha a <b>/25</b>.</p>
  <p>Método rápido: para cada entrada, vê o <b>bloco</b> que ela cobre no octeto relevante. Ex.: 128.96.164.0/22 cobre 164–167 no 3.º octeto; 128.96.166.0/23 cobre 166–167. Destino 128.96.165.x → só a /22. Destino 128.96.166.x → as duas, ganha a /23.</p>`,
  key: 'Das entradas que contêm o destino, ganha a de prefixo mais longo. 0.0.0.0/0 é a última opção.' },
{ id: 'i-dhcp', t: 'ip', title: 'DHCP: obter um endereço',
  html: `<p>Chegas a um hotel sem reserva: gritas no átrio “alguém me dá um quarto?” (Discover), a receção responde “tens o 214” (Offer), tu dizes “fico com o 214” (Request) e eles confirmam (ACK). E o quarto é teu só até ao check-out (lease).</p>
  <ol><li><b>DHCP Discover</b>: o host ainda não tem IP: envia de 0.0.0.0 para <b>255.255.255.255</b> (broadcast), UDP 68 → 67.</li>
  <li><b>DHCP Offer</b>: o servidor propõe um IP (campo <b>yiaddr</b>) e um <b>lease time</b>.</li>
  <li><b>DHCP Request</b>: o host pede formalmente esse IP (em broadcast, porque podia haver vários servidores).</li>
  <li><b>DHCP ACK</b>: confirmado. <b>Só agora</b> o host tem o endereço.</li></ol>
  <p>Além do IP, o DHCP dá a <b>máscara</b>, o <b>default gateway</b> e o <b>servidor DNS</b>.</p>
  <p><b>Renovação</b>: o endereço é emprestado por um tempo (lease). A <b>50%</b> do lease o host pede a renovação ao mesmo servidor com um <b>DHCP Request</b>; se não tiver resposta, volta a tentar perto do fim (~85–87,5%); se o lease acabar, larga o endereço.</p>`,
  key: 'Discover → Offer → Request → ACK (só aqui tem IP). Renova com DHCP Request a 50% do lease.' },
{ id: 'i-nat', t: 'ip', title: 'NAT: uma casa, muitos moradores',
  html: `<p>Um prédio com uma só morada na rua: o porteiro recebe todas as cartas e sabe, pelo número que escreveu no envelope de resposta, a que apartamento cada uma pertence.</p>
  <p>A rede privada (ex.: 192.168.1.0/24) usa endereços privados; para fora, todos aparecem com o <b>IP público</b> do NAT. O NAT guarda uma <b>tabela de tradução</b>:</p>
  <div class="tbl-wrap"><table><tr><th>Lado privado</th><th>Lado público</th></tr><tr><td>192.168.0.10 : 3345</td><td>85.240.1.7 : 40001</td></tr></table></div>
  <ul><li><b>A sair</b>: troca (IP privado, porto) da <b>origem</b> por (IP público, porto novo).</li>
  <li><b>A entrar</b>: o servidor responde para (<b>IP público</b>, porto novo); o NAT consulta a tabela e troca o <b>destino</b> de volta para (IP privado, porto).</li></ul>
  <p>Uma mensagem do servidor web (porto 80) para o host atrás do NAT tem portanto: origem (IP do servidor, 80), destino (<b>IP público do NAT</b>, porto atribuído pelo NAT). O servidor <b>nunca vê</b> o IP privado.</p>
  <p><b>Capacidade</b>: o porto tem 16 bits → ~65 536 associações por IP público. Ex.: 3 IPs públicos, cada estação com até 96 processos a comunicar → 3 × 2¹⁶ / 96 = <b>2048</b> estações.</p>
  <p>Críticas: viola o fim-a-fim (o NAT mexe nos portos, que são da camada de transporte); servidores atrás de NAT precisam de <b>port forwarding</b> (lab 5).</p>`,
  key: 'Saída: o NAT troca a origem (IP privado:porto → IP público:porto novo). Entrada: troca o destino de volta.' },
{ id: 'i-fw', t: 'ip', title: 'Firewall e NAT com iptables (lab 5)',
  html: `<p>O iptables organiza regras em <b>tabelas</b> e <b>cadeias</b>. As regras de uma cadeia são testadas <b>por ordem</b>; a primeira que bate decide (ACCEPT, DROP…); se nenhuma bater, aplica-se a <b>política por omissão</b> da cadeia.</p>
  <ul><li>Tabela <b>filter</b>: <b>INPUT</b> (pacotes para a própria máquina), <b>OUTPUT</b> (gerados pela máquina), <b>FORWARD</b> (que só passam por ela, como num encaminhador).</li>
  <li>Tabela <b>nat</b>: <b>POSTROUTING</b> com SNAT/MASQUERADE (trocar a origem à saída: é o NAT da lição anterior) e <b>PREROUTING</b> com DNAT (trocar o destino à entrada: <b>port forwarding</b> para um servidor interno).</li></ul>
  <p><code>-I</code> insere no início da cadeia, <code>-A</code> acrescenta no fim; <code>-p tcp --dport 22</code> filtra protocolo e porto; <code>-j DROP</code> é a ação.</p>`,
  key: 'INPUT = para mim, OUTPUT = de mim, FORWARD = a passar. Primeira regra que bate decide. DNAT = port forwarding.' },
{ id: 'i-frag', t: 'ip', title: 'Cabeçalho IPv4 e fragmentação',
  html: `<p>Campos a conhecer: versão, comprimento do cabeçalho (normalmente 20 B), <b>comprimento total</b>, <b>identificador</b>, <b>flags</b> (MF = more fragments), <b>offset</b>, <b>TTL</b>, <b>protocolo</b> (6 = TCP, 17 = UDP), checksum do cabeçalho, IP origem e destino.</p>
  <p>Cada ligação tem um <b>MTU</b> (maior trama). Se o datagrama não cabe, um encaminhador IPv4 <b>fragmenta</b>:</p>
  <ul><li>Dados por fragmento ≤ MTU − 20, e <b>múltiplo de 8</b> (exceto o último).</li>
  <li><b>Offset</b> em unidades de <b>8 bytes</b>, a contar do início dos dados originais.</li>
  <li><b>MF = 1</b> em todos menos no último. Todos têm o mesmo identificador.</li>
  <li>A reconstrução só se faz no <b>destino final</b>; fragmentos podem voltar a ser fragmentados mais à frente.</li></ul>
  <p>Exemplo (exame 2020/21): 1200 B de dados, MTU1 = 1000, depois MTU2 = 500. Rede 1: 1000 − 20 = 980 → 976 (múltiplo de 8): fragmentos de 976 B (offset 0) e 224 B (offset 122). Rede 2: máximo 480 B: 976 → 480 + 480 + 16 (offsets 0, 60, 120); 224 passa inteiro (offset 122). Total length: <b>500, 500, 36, 244</b>; offsets <b>0, 60, 120, 122</b>; MF <b>1, 1, 1, 0</b>.</p>`,
  key: 'Dados por fragmento: ≤ MTU − 20 e múltiplo de 8. Offset = bytes/8. MF = 1 menos no último.' },
{ id: 'i-icmp', t: 'ip', title: 'TTL, ICMP, ping e traceroute',
  html: `<p>O <b>TTL</b> (time to live) é decrementado em cada encaminhador; quando chega a 0 o datagrama é <b>descartado</b>. Diz <b>quantos saltos</b> o datagrama ainda pode dar (não segundos), e evita que circule para sempre num ciclo.</p>
  <p>O <b>ICMP</b> é o protocolo de mensagens de controlo e erro do IP (viaja dentro de datagramas IP): <b>echo request/reply</b> (ping), <b>TTL exceeded</b>, <b>destination unreachable</b>…</p>
  <p><b>traceroute</b> (lab 2): envia pacotes com TTL = 1, 2, 3… O encaminhador onde o TTL chega a 0 descarta-o e devolve um ICMP <b>TTL exceeded</b>: a origem fica a saber o seu endereço. Continua até o destino responder (ICMP port unreachable). Assim descobre-se o caminho, salto a salto.</p>`,
  key: 'TTL = saltos que restam. traceroute usa TTL crescentes e as mensagens ICMP “TTL exceeded”.' },
{ id: 'i-v6', t: 'ip', title: 'IPv6 e a transição',
  html: `<p>Motivo: os 32 bits do IPv4 esgotaram-se. O IPv6 tem endereços de <b>128 bits</b> e um cabeçalho <b>fixo de 40 bytes</b>, mais simples de processar:</p>
  <ul><li>sem fragmentação nos encaminhadores (se não couber, devolve ICMPv6 “packet too big”);</li>
  <li>sem checksum do cabeçalho;</li><li>com <b>flow label</b> para identificar fluxos.</li></ul>
  <p>Não se pode mudar a Internet toda no mesmo dia. Duas formas de os pôr a conviver:</p>
  <ul><li><b>Dual stack</b> com tradução: encaminhadores que falam as duas versões convertem cabeçalhos IPv6 em IPv4. <b>Perde-se informação</b> (campos que não existem no IPv4, como o flow label).</li>
  <li><b>Túnel</b>: o datagrama IPv6 inteiro vai no <b>campo de dados</b> de um datagrama IPv4 a atravessar a zona IPv4. À saída é desembrulhado <b>sem perder nada</b>.</li></ul>
  <p>A mesma ideia de túnel serve para multicast em redes onde só alguns encaminhadores o suportam, e para VPNs (GRE, lab 8).</p>`,
  key: 'IPv6: 128 bits, cabeçalho fixo de 40 B, sem fragmentação nos encaminhadores. Túnel = IPv6 dentro de IPv4, sem perdas.' },

/* ---------------- CONTROL PLANE ---------------- */
{ id: 'r-ls', t: 'route', title: 'Estado da ligação: Dijkstra',
  html: `<p>Cada encaminhador faz uma fotografia da sua vizinhança (custos das suas ligações) e envia-a a <b>todos</b> (inundação). No fim, todos têm o <b>mapa completo</b> e cada um calcula sozinho os melhores caminhos com o algoritmo de <b>Dijkstra</b>. É o que faz o <b>OSPF</b>.</p>
  <p>Dijkstra a partir de u: em cada passo junta-se ao conjunto N' o nó com <b>menor distância</b> ainda não visitado e atualizam-se os vizinhos: D(v) = min(D(v), D(w) + c(w,v)). Ao fim de n passos, tem-se a árvore de caminhos mais curtos e daí a tabela (próximo salto para cada destino).</p>
  <p>Exemplo dos slides (u, v, w, x, y, z): a partir de u entram, por ordem, x (1), v (2) e y (2), w (3, via x-y), z (4, via x-y). Próximo salto de u para z: <b>x</b>.</p>
  <p>Propriedade útil: se o caminho mais curto de A para F passa por B, então o troço de B a F é um caminho mais curto <b>de B para F</b> — embora B possa usar <b>outro caminho com o mesmo custo</b>.</p>`,
  key: 'Estado da ligação: todos conhecem o mapa todo e correm Dijkstra. Complexidade O(n²) e muitas mensagens de inundação.' },
{ id: 'r-dv', t: 'route', title: 'Vetor-distância: Bellman-Ford',
  html: `<p>Ninguém tem o mapa. Cada encaminhador só sabe o custo para os <b>vizinhos</b> e o que os vizinhos lhe dizem: “eu chego a Z com custo 5”. Como perguntar o caminho a quem está ao lado.</p>
  <p style="text-align:center"><b>D<sub>x</sub>(y) = min<sub>v</sub> { c(x,v) + D<sub>v</sub>(y) }</b></p>
  <p>Cada nó guarda o seu vetor de distâncias (a todos os destinos) e os vetores dos vizinhos. Quando o seu vetor <b>muda</b>, envia-o aos vizinhos. É <b>iterativo, assíncrono e distribuído</b>, e converge. É o que faz o <b>RIP</b>.</p>
  <p>Exemplo (exame 2022/23): D<sub>Y</sub>(W) = min{ c(Y,X) + D<sub>X</sub>(W), c(Y,Z) + D<sub>Z</sub>(W), c(Y,W) + 0 } = min{5 + 1, 1 + 2, 4} = <b>3</b>, via Z.</p>
  <p>Tabela de encaminhamento: para cada destino, o vizinho que deu o mínimo.</p>`,
  key: 'Dx(y) = min sobre vizinhos v de c(x,v) + Dv(y). Envia o vetor quando muda.' },
{ id: 'r-cti', t: 'route', title: 'Contagem até ao infinito e envenenamento',
  html: `<p>No vetor-distância, <b>boas notícias</b> (um custo baixa) espalham-se depressa. <b>Más notícias</b> (uma ligação falha ou fica cara) espalham-se devagar: dois nós podem ficar a “enganar-se” um ao outro, cada um a julgar que o outro ainda chega ao destino, e a distância sobe aos poucos — a <b>contagem até ao infinito</b>.</p>
  <ul><li><b>Separação de horizontes</b> (split horizon): não anunciar uma rota ao vizinho por onde ela passa.</li>
  <li><b>Envenenamento de caminhos inversos</b> (poisoned reverse): anunciar-lhe essa rota com custo <b>∞</b>. Assim ele não volta a usar-nos para lá chegar.</li></ul>
  <p>Exemplo (exame 2021/22): X tem estimativas para Z de 15, 8, 16, 11 pelos vizinhos Y1, Y2, Y3, Y4. A ligação X–Y2 falha → novo melhor: <b>11 via Y4</b>.</p>
  <ul><li>Sem envenenamento: X anuncia 11 a Y1, Y3 e Y4.</li><li>Com envenenamento: anuncia 11 a Y1 e Y3, e <b>∞ a Y4</b> (porque vai por ele).</li></ul>
  <p>Limite: o envenenamento resolve ciclos entre <b>dois</b> nós, não ciclos maiores.</p>`,
  key: 'Más notícias viajam devagar (contagem até ao infinito). Envenenamento: anuncia ∞ ao vizinho por onde passas.' },
{ id: 'r-hier', t: 'route', title: 'Encaminhamento hierárquico: RIP, OSPF, BGP',
  html: `<p>A Internet tem milhões de redes: ninguém consegue correr Dijkstra sobre todas. Por isso organiza-se em <b>sistemas autónomos (AS)</b>, cada um com a sua administração.</p>
  <ul><li><b>Intra-AS</b>: cada AS escolhe o seu protocolo. <b>RIP</b>: vetor-distância, métrica = nº de saltos, máximo 15, para redes pequenas. <b>OSPF</b>: estado da ligação, várias métricas de custo, hierárquico (áreas), autenticação, para redes grandes.</li>
  <li><b>Inter-AS</b>: <b>BGP</b>, o mesmo para todos: anuncia a alcançabilidade de prefixos entre AS e escolhe rotas por <b>políticas</b> (comerciais), não só por desempenho.</li></ul>
  <p>Por isso A pode usar RIP e B e C OSPF: lá dentro cada um decide; entre eles falam BGP.</p>`,
  key: 'Dentro de cada AS, cada um escolhe (RIP pequeno/DV, OSPF grande/LS). Entre AS, todos usam BGP.' },
{ id: 'r-sdn', t: 'route', title: 'SDN: separar o controlo dos dados',
  html: `<p>Em vez de cada encaminhador decidir sozinho, um <b>controlador logicamente centralizado</b> vê a rede toda, corre as aplicações de rede (encaminhamento, balanceamento de carga, firewall) e instala regras nos equipamentos. Os encaminhadores/comutadores ficam só com o <b>plano de dados</b>.</p>
  <ul><li><b>Tabelas de fluxo</b> com regras <b>match + action</b>: o match pode olhar para campos de várias camadas (MAC, IP, portos); a ação pode ser encaminhar, descartar, modificar ou enviar ao controlador.</li>
  <li><b>OpenFlow</b>: o protocolo entre controlador e comutadores (interface “southbound”).</li>
  <li>Regras <b>reativas</b> (instaladas quando chega o primeiro pacote de um fluxo, que vai ao controlador) vs <b>proativas</b> (instaladas antes). Lab 7.</li></ul>
  <p>Melhor? Mais flexível e programável, mas o controlador é um ponto crítico (desempenho, fiabilidade, segurança). Depende.</p>`,
  key: 'SDN: controlador centralizado com o plano de controlo; os encaminhadores só fazem o plano de dados (match + action).' },
{ id: 'r-mcast', t: 'route', title: 'Broadcast e multicast',
  html: `<ul><li><b>Broadcast</b> na rede: inundação ingénua cria cópias infinitas em ciclos; soluções: inundação controlada (números de sequência) ou uma <b>árvore abrangente</b>.</li>
  <li><b>Multicast</b>: enviar para um <b>grupo</b>. Usa um <b>endereço IP especial de grupo</b> (classe D, 224.0.0.0/4), um protocolo local para os hosts aderirem ao grupo (<b>IGMP</b>) e protocolos de encaminhamento que constroem uma <b>árvore de distribuição</b> (por fonte ou partilhada, centrada num nó). A fonte não precisa de conhecer os destinatários.</li></ul>
  <p>Os encaminhadores só mantêm estado das árvores que passam por eles. Onde há encaminhadores que não falam multicast, usa-se um <b>túnel</b> (multicast dentro de unicast).</p>
  <p>IPTV (ex.: MEO): <b>PIM</b>, com modo denso (muitos membros, inundação e poda) e esparso (poucos membros, árvore centrada num ponto de encontro).</p>`,
  key: 'Multicast = endereço de grupo + IGMP + árvore de distribuição. Sem suporte no caminho: túnel.' },
]);
