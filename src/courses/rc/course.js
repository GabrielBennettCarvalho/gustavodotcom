/* ===== RC — Redes de Computadores ===== */
STUDY.course({
  id: 'rc',
  code: 'RC',
  name: 'Redes de Computadores',
  semester: 1,
  tagline: 'Do socket ao encaminhador.',
  // Topics follow the classes, top-down (Kurose & Ross). Link layer and Wi-Fi come next.
  topics: {
    net:   { label: 'Internet, comutação e atrasos', short: 'Internet e atrasos', c: 'var(--t-net)' },
    sock:  { label: 'Aplicações, sockets e P2P', short: 'Sockets e P2P', c: 'var(--t-sock)' },
    http:  { label: 'Web e HTTP (e FTP)', short: 'HTTP', c: 'var(--t-http)' },
    dns:   { label: 'Correio eletrónico e DNS', short: 'Correio e DNS', c: 'var(--t-dns)' },
    tcp:   { label: 'Transporte: UDP, TCP e transferência fiável', short: 'TCP e UDP', c: 'var(--t-tcp)' },
    cong:  { label: 'Controlo de fluxo e de congestão', short: 'Congestão', c: 'var(--t-cong)' },
    ip:    { label: 'IP: endereços, sub-redes, NAT, DHCP, IPv6', short: 'IP e sub-redes', c: 'var(--t-ip)' },
    route: { label: 'Encaminhamento: LS, DV, OSPF/RIP/BGP, SDN', short: 'Encaminhamento', c: 'var(--t-route)' },
    exam:  { label: 'Exames recentes (2023/24 a 2025/26)', short: 'Exame', c: 'var(--t-rcx)' },
  },

  // The level map is a traceroute: each level is one more hop towards the exam server.
  levels: [
    { n: 1, t: 'Conceitos', d: 'O que é e para que serve', sub: 'TTL 4 · 1 ms' },
    { n: 2, t: 'Mecanismos', d: 'Como funciona, passo a passo', sub: 'TTL 3 · 8 ms' },
    { n: 3, t: 'Contas guiadas', d: 'Os problemas do exame, por partes', sub: 'TTL 2 · 25 ms' },
    { n: 4, t: 'Exame', d: 'Perguntas de exames anteriores', sub: 'TTL 1 · 40 ms' },
  ],
  map: {
    title: 'traceroute exame.rc.pt',
    link: 'hop',
    start: { label: 'o teu PC', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="8" width="24" height="16" rx="1.5"/><path d="M3 30h32l-3-6H6z"/><rect x="15" y="13" width="8" height="6" fill="var(--token)" stroke="none"/></svg>' },
    end: { label: 'servidor = exame', icon: '<svg viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="4" width="22" height="9" rx="1.5"/><rect x="8" y="15" width="22" height="9" rx="1.5"/><rect x="8" y="26" width="22" height="9" rx="1.5"/><path d="M13 8.5h2M13 19.5h2M13 30.5h2"/><circle cx="25" cy="30.5" r="2" fill="var(--token)" stroke="none"/></svg>' },
    legend: ['▬ o pacote marca onde estás', 'cada salto gasta um TTL: no último já estás no servidor do exame'],
  },
  // Parte I do exame: 10 perguntas de 4 opções, certa +0,6 e errada −0,2 (um terço do valor de uma certa).
  exam: { n: 10, min: 25, penalty: 1 / 3, desc: 'Como a Parte I do exame: 10 perguntas de escolha múltipla, 25 minutos, errada desconta 1/3 (−0,2 em 0,6). Usa primeiro as perguntas dos exames de 2023/24 a 2025/26, que não aparecem nos outros modos.' },
  verdict: { ok: 'ACK', ko: 'NAK' },
  logo: '<svg class="brand-mark" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="6" width="24" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 6v18M14 6v18" stroke="currentColor" stroke-width="2"/><rect x="16.5" y="10" width="7" height="10" fill="var(--token)"/></svg>',

  render: d => RCD.render(d),

  extras: [
    {
      id: 'chains',
      title: 'Problemas de exame, por partes',
      desc: 'Os problemas grandes das Partes II e III (atrasos, sub-redes, vetor-distância, TCP) partidos em passos, pela ordem em que os resolves no papel.',
      icon: 'flag',
      meta: ({ pool }) => `${new Set(pool.filter(q => q.ch).map(q => q.ch)).size} problemas`,
      questions: ({ pool, peek }) => {
        const by = {}; pool.filter(q => q.ch).forEach(q => (by[q.ch] = by[q.ch] || []).push(q));
        const chains = Object.values(by).map(a => a.sort((x, y) => parseInt(x.step) - parseInt(y.step)));
        const done = a => a.filter(q => peek(q.id).c > 0).length / a.length;
        return chains.map(a => [done(a) + Math.random() * 0.35, a]).sort((x, y) => x[0] - y[0]).slice(0, 2).flatMap(x => x[1]);
      },
    },
    {
      id: 'stlab',
      title: 'Diagramas espaço-tempo',
      desc: 'Só perguntas com o diagrama desenhado: pacotes a atravessar encaminhadores, handshakes, ACKs perdidos. Aprende a ler (e a desenhar) o que o exame pede sempre.',
      icon: 'clock',
      meta: ({ pool }) => `${pool.filter(q => q.d && q.d.st).length} diagramas`,
      questions: ({ pool, pick, topLevel }) =>
        pick(pool.filter(q => q.d && q.d.st && q.l <= Math.max(topLevel(), 2)), 10).sort((a, b) => a.l - b.l),
    },
    {
      id: 'sublab',
      title: 'Laboratório de sub-redes',
      desc: 'Máscaras, endereço de rede, mesma sub-rede ou default gateway, maior prefixo e blocos de um ISP, com o endereço desenhado em binário.',
      icon: 'lens',
      meta: ({ pool }) => `${pool.filter(q => q.ex === 'sub').length} perguntas`,
      questions: ({ pool, pick, topLevel }) =>
        pick(pool.filter(q => q.ex === 'sub' && q.l <= Math.max(topLevel(), 2)), 10).sort((a, b) => a.l - b.l),
    },
    {
      id: 'traces',
      title: 'Ler traces e comandos',
      desc: 'Como nos labs: saídas do dig, cabeçalhos HTTP, sessões SMTP, segmentos TCP no Wireshark, traceroute. Lê e interpreta.',
      icon: 'list',
      meta: ({ pool }) => `${pool.filter(q => q.code).length} traces`,
      questions: ({ pool, pick }) => pick(pool.filter(q => q.code), 10).sort((a, b) => a.l - b.l),
    },
  ],

  importHelp: {
    notes: 'Termos como nas aulas (encaminhador, comutador, comutação de pacotes, janela de congestão, sub-rede…) e explicações em português de Portugal. 4 opções por pergunta, como no exame. Marca com "calc": true as perguntas que precisam de contas.',
    example: { name: 'Pacote extra atrasos', questions: [{ id: 'x-net-001', t: 'net', l: 2, calc: true, q: 'Um pacote de 1500 B atravessa uma ligação de 100 Mbit/s. Quanto tempo demora a transmissão?', o: ['120 µs', '15 µs', '1,2 ms', '12 µs'], a: 0, e: 't = L/R = 12 000 bit / 10⁸ bit/s = **120 µs**.', w: { '1': '15 µs seria com L em bytes: converte primeiro para bits (×8).' }, les: 'n-delay' }] },
  },
});
