const SMTP_TRACE = `S: 220 mail.ist.pt ESMTP
C: HELO portatil.casa.pt
S: 250 Hello portatil.casa.pt
C: MAIL FROM: <ana@casa.pt>
S: 250 OK
C: RCPT TO: <rui@ist.pt>
S: 250 OK
C: RCPT TO: <prof@ist.pt>
S: 250 OK
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: Ana <ana@casa.pt>
C: To: Rui <rui@ist.pt>
C: Subject: relatorio
C: MIME-Version: 1.0
C: Content-Type: multipart/mixed; boundary="XYZ"
C: --XYZ
C: Content-Type: application/pdf; name="rel.pdf"
C: Content-Transfer-Encoding: base64
C: JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3Ro...
C: --XYZ--
C: .
S: 250 Message accepted for delivery
C: QUIT
S: 221 mail.ist.pt closing connection`;

const DIG_TRACE = `;; QUESTION SECTION:
;www.tecnico.ulisboa.pt.        IN  A

;; ANSWER SECTION:
www.tecnico.ulisboa.pt. 3600 IN  A   193.136.128.169

;; AUTHORITY SECTION:
tecnico.ulisboa.pt.     3600 IN  NS  a.ul.pt.
tecnico.ulisboa.pt.     3600 IN  NS  ns1.tecnico.ulisboa.pt.

;; ADDITIONAL SECTION:
a.ul.pt.                 115 IN  A   194.117.0.150
ns1.tecnico.ulisboa.pt. 3600 IN  A   193.136.128.1`;

STUDY.questions('rc', [
/* ===== CORREIO ELETRÓNICO ===== */
/* --- nível 1 --- */
{ id: 'dn-01', t: 'dns', l: 1, les: 'd-mail',
  q: 'Para que serve o protocolo SMTP?',
  o: ['Enviar correio: do cliente para o seu servidor e entre servidores de correio', 'Ler o correio guardado no servidor', 'Traduzir nomes em endereços', 'Transferir páginas web'], a: 0,
  e: 'SMTP = **envio** (push). Para **ler** a caixa usa-se POP3, IMAP ou HTTPS (webmail).' },
{ id: 'dn-02', t: 'dns', l: 1, les: 'd-mail',
  q: 'SMTP é um protocolo “push” e HTTP é “pull”. O que quer isso dizer?',
  o: ['No SMTP quem tem os dados abre a ligação e envia-os; no HTTP quem quer os dados abre a ligação e pede-os', 'O SMTP usa UDP e o HTTP usa TCP', 'O SMTP só funciona com o servidor ligado; o HTTP não', 'O SMTP guarda estado; o HTTP não'], a: 0,
  e: '**Push**: o servidor de envio “empurra” a mensagem para o servidor de destino. **Pull**: o browser “puxa” a página do servidor.' },
{ id: 'dn-03', t: 'dns', l: 1, les: 'd-mail',
  q: 'Que diferença principal há entre POP3 e IMAP?',
  o: ['Com IMAP as mensagens e pastas ficam no servidor (guarda estado); o POP3 tipicamente descarrega e apaga', 'POP3 envia correio; IMAP recebe', 'IMAP usa UDP; POP3 usa TCP', 'POP3 só funciona no browser'], a: 0,
  e: '**IMAP**: tudo fica no servidor, organizado em pastas, sincronizado entre dispositivos (stateful). **POP3**: descarrega para o dispositivo (download-and-delete ou keep).' },
{ id: 'dn-04', t: 'dns', l: 1, les: 'd-mail',
  q: 'Porque é que uma imagem anexada num email vai codificada em base64?',
  o: ['Porque o SMTP só transporta texto ASCII de 7 bits, e uma imagem tem bytes arbitrários', 'Para a encriptar', 'Para a comprimir', 'Porque o IMAP o exige'], a: 0,
  e: 'O SMTP foi feito para texto **ASCII de 7 bits**. Base64 converte bytes arbitrários em caracteres seguros (ocupa ~33% mais). Não é encriptação.' },

/* --- nível 2 --- */
{ id: 'dn-10', t: 'dns', l: 4, les: 'd-mail',
  q: 'Relativamente ao correio eletrónico, qual afirmação é verdadeira?',
  o: ['Os endereços nos comandos RCPT TO podem não coincidir com os do campo To: do cabeçalho', 'O servidor de correio usa por omissão o porto 25 em UDP', 'A aplicação de leitura de email usa SMTP para ir buscar as mensagens', 'O cabeçalho To: é o que decide a quem se entrega'], a: 0, src: 'Exame 2021/22, P5',
  e: 'O **envelope** (MAIL FROM, RCPT TO) decide a entrega; o **cabeçalho** (From:, To:, Cc:) é texto dentro de DATA. Um destinatário em Bcc tem RCPT TO mas não aparece no To:.',
  w: { 1: 'SMTP corre sobre TCP (porto 25).', 2: 'Para ler usa-se POP3, IMAP ou HTTPS; o SMTP é só para enviar.' } },
{ id: 'dn-11', t: 'dns', l: 4, les: 'd-mail',
  q: 'Queres enviar um email para prof@rc.pt e uma cópia oculta para colega@rc.pt. Que comandos SMTP têm de ser usados?',
  o: ['MAIL FROM: eu@rc.pt; RCPT TO: prof@rc.pt; RCPT TO: colega@rc.pt', 'From: eu@rc.pt; To: prof@rc.pt; Cc: colega@rc.pt', 'From: eu@rc.pt; To: prof@rc.pt; Bcc: colega@rc.pt', 'MAIL FROM: eu@rc.pt; RCPT TO: prof@rc.pt, colega@rc.pt (Bcc)'], a: 0, src: 'Exame 2020/21, P7',
  e: 'From/To/Cc/Bcc são **cabeçalhos**, não comandos SMTP. A entrega faz-se com um **RCPT TO por destinatário**; o oculto simplesmente não aparece no cabeçalho To:.',
  w: { 2: 'Bcc: é um campo do cabeçalho do cliente de email, não um comando SMTP; o comando que faz a entrega é RCPT TO.' } },
{ id: 'dn-12', t: 'dns', l: 2, les: 'd-mail',
  q: 'A Ana envia um email ao Rui, que o lê no telemóvel com a app de correio (IMAP). Por que protocolos passa a mensagem?',
  o: ['SMTP (Ana → servidor dela), SMTP (servidor dela → servidor do Rui), IMAP (servidor do Rui → app)', 'SMTP de ponta a ponta', 'IMAP (Ana → servidor), SMTP (servidor → Rui)', 'HTTP de ponta a ponta'], a: 0,
  e: 'O agente da Ana entrega ao **seu** servidor por SMTP; os servidores falam SMTP entre si; o Rui **lê** a caixa por IMAP (ou POP3, ou HTTPS no browser).' },
{ id: 'dn-13', t: 'dns', l: 2, les: 'd-mail',
  q: 'Slides: qual destas comparações entre protocolos de aplicação é FALSA?',
  o: ['HTTP e SMTP são ambos pull-based', 'FTP e IMAP são ambos stateful', 'O FTP separa o canal de controlo do de dados; o HTTP não', 'O IMAP guarda estado; o POP3 não'], a: 0,
  e: 'O **SMTP é push**: quem envia é que abre a ligação e empurra. Só o HTTP é pull. As outras três estão certas.' },

/* --- nível 3: ler uma sessão SMTP --- */
{ id: 'dn-20', t: 'dns', l: 3, les: 'd-mail', code: SMTP_TRACE,
  q: 'Sessão SMTP capturada (acima). Qual é o servidor de correio, e em que porto TCP está?',
  o: ['mail.ist.pt, porto 25', 'portatil.casa.pt, porto 25', 'mail.ist.pt, porto 110', 'ist.pt, porto 53'], a: 0,
  e: 'O servidor apresenta-se na primeira linha: **220 mail.ist.pt**. SMTP usa o porto **25**. portatil.casa.pt é o cliente (HELO).' },
{ id: 'dn-21', t: 'dns', l: 3, les: 'd-mail', code: SMTP_TRACE,
  q: 'Na mesma sessão: quais são os comandos SMTP usados?',
  o: ['HELO, MAIL FROM, RCPT TO, DATA, QUIT', 'HELO, MAIL FROM, RCPT TO, From, To, Subject, QUIT', '220, 250, 354, 221', 'HELO, DATA, QUIT'], a: 0,
  e: 'Comandos: **HELO, MAIL FROM, RCPT TO, DATA, QUIT**. From:, To:, Subject: são **cabeçalhos** dentro de DATA; 220, 250, 354, 221 são **respostas** do servidor.' },
{ id: 'dn-22', t: 'dns', l: 3, les: 'd-mail', code: SMTP_TRACE,
  q: 'Na mesma sessão: há dois RCPT TO mas o cabeçalho To: só tem o Rui. Porquê?',
  o: ['prof@ist.pt foi posto em Bcc (cópia oculta): é entregue, mas não aparece no cabeçalho', 'O servidor rejeitou o segundo destinatário', 'É um erro: o email só chega ao Rui', 'O To: só mostra o primeiro destinatário'], a: 0,
  e: 'Os dois receberam 250 OK, por isso ambos recebem o email. O segundo não está no cabeçalho: foi enviado em **Bcc**.' },
{ id: 'dn-23', t: 'dns', l: 3, les: 'd-mail', code: SMTP_TRACE,
  q: 'Na mesma sessão: como sabe o servidor onde acaba a mensagem?',
  o: ['Por uma linha só com “.”', 'Pelo comando QUIT', 'Pelo cabeçalho Content-Length', 'Pelo fecho da ligação TCP'], a: 0,
  e: 'Depois de **DATA** (resposta 354), a mensagem termina com **CRLF . CRLF**: uma linha só com um ponto. Só depois vem o 250 e o QUIT.' },

/* ===== DNS ===== */
/* --- nível 1 --- */
{ id: 'dn-30', t: 'dns', l: 1, les: 'd-dns',
  q: 'Qual é a função principal do DNS?',
  o: ['Traduzir nomes (www.ist.pt) em endereços IP', 'Atribuir endereços IP aos hosts', 'Traduzir endereços IP em endereços MAC', 'Encaminhar pacotes entre redes'], a: 0,
  e: 'DNS: **nome → IP** (e também aliases, servidores de correio, distribuição de carga). Atribuir IPs é o DHCP; IP → MAC é o ARP.',
  w: { 1: 'Isso é o DHCP.', 2: 'Isso é o ARP.' } },
{ id: 'dn-31', t: 'dns', l: 1, les: 'd-dns',
  q: 'Que transporte e porto usa normalmente o DNS?',
  o: ['UDP, porto 53', 'TCP, porto 80', 'UDP, porto 25', 'TCP, porto 21'], a: 0,
  e: 'Perguntas e respostas pequenas: **UDP 53**, sem o custo de abrir uma ligação. (Usa TCP em casos especiais, como respostas grandes.)' },
{ id: 'dn-32', t: 'dns', l: 1, les: 'd-dns',
  q: 'Porque é que o DNS não está num único servidor central?',
  o: ['Seria um ponto único de falha, com tráfego enorme, longe de muitos utilizadores e impossível de manter', 'Porque o UDP não permite', 'Porque cada país tem uma Internet diferente', 'Porque os nomes mudam todos os dias'], a: 0,
  e: 'Um só servidor **não escala**. A solução é uma base de dados **distribuída e hierárquica**.' },
{ id: 'dn-33', t: 'dns', l: 1, les: 'd-dns',
  q: 'Que servidor DNS guarda os registos oficiais do domínio tecnico.ulisboa.pt?',
  o: ['O servidor autoritativo desse domínio', 'Um servidor raiz', 'O servidor TLD .pt', 'O servidor DNS local do teu ISP'], a: 0,
  e: '**Autoritativo**: tem os registos oficiais do domínio. A raiz aponta para os TLD; o TLD .pt aponta para os autoritativos; o local só guarda cópias em cache.' },
{ id: 'dn-34', t: 'dns', l: 1, les: 'd-rr',
  q: 'Que tipo de registo DNS associa um nome de host a um endereço IPv4?',
  o: ['A', 'AAAA', 'NS', 'CNAME'], a: 0,
  e: '**A** → IPv4. **AAAA** → IPv6. **NS** → servidor de nomes do domínio. **CNAME** → alias para o nome canónico. **MX** → servidor de correio.' },
{ id: 'dn-35', t: 'dns', l: 1, les: 'd-rr',
  q: 'Que tipo de registo indica o servidor de correio de um domínio?',
  o: ['MX', 'NS', 'A', 'SOA'], a: 0,
  e: '**MX** (mail exchanger): para onde enviar o correio de @dominio. É assim que um servidor SMTP descobre o servidor de destino.' },
{ id: 'dn-36', t: 'dns', l: 1, les: 'd-query',
  q: 'Numa consulta iterativa, o que responde um servidor que não sabe a resposta final?',
  o: ['O endereço do próximo servidor a quem perguntar', 'Um erro', 'Ele próprio pergunta aos outros e devolve a resposta final', 'O IP do servidor raiz, sempre'], a: 0,
  e: '**Iterativa**: “não sei, pergunta a este”. **Recursiva**: o servidor contactado faz o trabalho todo e devolve a resposta.',
  w: { 2: 'Isso é uma consulta recursiva.' } },

/* --- nível 2 --- */
{ id: 'dn-40', t: 'dns', l: 2, les: 'd-query',
  q: 'Um portátil pergunta ao servidor DNS local pelo IP de www.exemplo.com; nada está em cache. Qual é a sequência típica?',
  o: ['Portátil → local (recursiva); local → raiz → TLD .com → autoritativo (iterativas)', 'Portátil → raiz → TLD → autoritativo', 'Local → autoritativo → TLD → raiz', 'Portátil → autoritativo diretamente'], a: 0,
  e: 'O host faz **uma** pergunta recursiva ao local. O local percorre a hierarquia de cima para baixo, de forma iterativa: **raiz → TLD → autoritativo**.' },
{ id: 'dn-41', t: 'dns', l: 2, les: 'd-query',
  q: 'Slides: “o método recursivo é a melhor técnica de resolução de nomes.” Concordas?',
  o: ['Não: se todos os servidores resolvessem recursivamente, a raiz e os TLD ficavam sobrecarregados', 'Sim: é sempre mais rápido', 'Sim: é o único que permite cache', 'Não: o recursivo não funciona sobre UDP'], a: 0,
  e: 'Na recursiva cada servidor fica com estado e trabalho por cada pedido. No topo da hierarquia isso seria insustentável: por isso a raiz e os TLD respondem **iterativamente**.' },
{ id: 'dn-42', t: 'dns', l: 2, les: 'd-query',
  q: 'Porque é que, na prática, os servidores raiz recebem muito menos pedidos do que se esperaria?',
  o: ['Porque os servidores locais guardam em cache os endereços dos servidores TLD', 'Porque só respondem a pedidos recursivos', 'Porque só há um servidor raiz', 'Porque os browsers falam diretamente com os TLD'], a: 0,
  e: 'A **cache** (com TTL) evita repetir perguntas. Os TLD como .com e .pt mudam pouco e ficam em cache nos servidores locais.' },
{ id: 'dn-43', t: 'dns', l: 2, les: 'd-query',
  q: 'Um site mudou de IP. Alguns utilizadores continuam a ir ao IP antigo durante algum tempo. Porquê?',
  o: ['Os servidores DNS (e os hosts) têm a tradução antiga em cache até o TTL expirar', 'O DNS só atualiza uma vez por dia', 'O browser guarda o IP para sempre', 'O servidor autoritativo ainda não sabe'], a: 0,
  e: 'É o lado negativo da **cache**: entradas desatualizadas ficam válidas até o **TTL** do registo acabar.' },
{ id: 'dn-44', t: 'dns', l: 4, les: 'd-rr',
  q: 'Tabela de RR: www.rc.ulisboa.pt CNAME lab.rc.ulisboa.pt | lab.rc.ulisboa.pt A 193.136.138.76 | rc.ulisboa.pt NS ns.rc.ulisboa.pt | ns.rc.ulisboa.pt A 193.136.138.65. Qual é verdadeira?',
  d: { tbl: { h: ['Nome', 'Tipo', 'Valor'], r: [['www.rc.ulisboa.pt', 'CNAME', 'lab.rc.ulisboa.pt'], ['lab.rc.ulisboa.pt', 'A', '193.136.138.76'], ['rc.ulisboa.pt', 'NS', 'ns.rc.ulisboa.pt'], ['ns.rc.ulisboa.pt', 'A', '193.136.138.65']] } },
  o: ['www.rc.ulisboa.pt e lab.rc.ulisboa.pt referem-se à mesma máquina', 'O IP de www.rc.ulisboa.pt é 193.136.138.65', 'O IP de um servidor de nomes de rc.ulisboa.pt é 193.136.138.76', 'www.rc.ulisboa.pt é o nome canónico de lab'], a: 0, src: 'Exame 2020/21, 2.ª época, P8',
  e: 'www é um **alias** (CNAME) de lab: a mesma máquina, IP **193.136.138.76**. O servidor de nomes é ns.rc.ulisboa.pt, com IP .65.',
  w: { 1: '.65 é o IP do servidor de nomes (ns), não do www.', 3: 'É ao contrário: lab é o nome canónico e www o alias.' } },
{ id: 'dn-45', t: 'dns', l: 2, les: 'd-rr',
  q: 'Uma consulta “dig -t a rtp.pt” devolve três registos A com IPs diferentes. Para que serve isso?',
  o: ['Distribuição de carga: cada cliente escolhe um dos servidores', 'É um erro de configuração', 'Os três IPs são do servidor DNS', 'Um é IPv4, outro IPv6 e outro MAC'], a: 0,
  e: 'Vários A para o mesmo nome = **vários servidores replicados**. O cliente escolhe (ou a ordem roda): a carga espalha-se. (Lab 4.)' },

/* --- nível 3: ler o dig --- */
{ id: 'dn-50', t: 'dns', l: 4, les: 'd-rr', code: DIG_TRACE, src: 'Exame 2021/22, P6',
  q: 'Excerto de uma resposta do dig (acima). Qual é verdadeira?',
  o: ['O IP de um servidor de nomes do domínio tecnico.ulisboa.pt é 194.117.0.150', 'a.ul.pt e ns1.tecnico.ulisboa.pt são a mesma máquina', 'O IP da máquina que respondeu ao pedido é 193.136.128.169', 'O domínio tecnico.ulisboa.pt tem um só servidor de nomes'], a: 0,
  e: 'AUTHORITY: os NS de tecnico.ulisboa.pt são **a.ul.pt** e ns1. ADDITIONAL: a.ul.pt tem IP **194.117.0.150**. 193.136.128.169 é o IP do **www** (a resposta), não de quem respondeu.',
  w: { 1: 'São dois servidores de nomes diferentes, com IPs diferentes.', 2: '193.136.128.169 é a resposta (o IP do www), não o servidor que respondeu.' } },
{ id: 'dn-51', t: 'dns', l: 3, les: 'd-rr', code: DIG_TRACE,
  q: 'Na mesma resposta: durante quanto tempo pode um servidor local guardar a tradução de www.tecnico.ulisboa.pt em cache?',
  o: ['3600 s (1 hora)', '115 s', 'Para sempre', '53 s'], a: 0,
  e: 'O segundo campo de cada registo é o **TTL**: 3600 s. O registo de a.ul.pt tem só 115 s restantes (veio de uma cache).' },
{ id: 'dn-52', t: 'dns', l: 3, les: 'd-rr',
  q: 'Registos: mail.ist.pt A 10.0.0.5 | ist.pt MX 10 mail.ist.pt | ist.pt NS ns.ist.pt | www.ist.pt CNAME web.ist.pt. Um servidor SMTP quer entregar para rui@ist.pt. O que consulta e para onde liga?',
  d: { tbl: { h: ['Nome', 'Tipo', 'Valor'], r: [['mail.ist.pt', 'A', '10.0.0.5'], ['ist.pt', 'MX', '10 mail.ist.pt'], ['ist.pt', 'NS', 'ns.ist.pt'], ['www.ist.pt', 'CNAME', 'web.ist.pt']] } },
  o: ['Pede o MX de ist.pt (mail.ist.pt), depois o A dele, e liga a 10.0.0.5 porto 25', 'Pede o A de ist.pt e liga para lá no porto 25', 'Liga ao servidor de nomes ns.ist.pt no porto 25', 'Pede o CNAME de ist.pt'], a: 0,
  e: '**MX** dá o **nome** do servidor de correio; um **A** dá o seu **IP**. Depois abre TCP para o porto 25.' },
]);
