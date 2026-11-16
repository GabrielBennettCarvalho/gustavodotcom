/* ===== Graph lab: the animated player and the lab screen =====
   GPLAYER.mount(el, cfg) draws an algorithm's steps (graph.js / graph-algos.js) and plays them:
     cfg = { algo, g: graph spec, p: params, mode: 'watch' | 'play', onNew }
   'watch' plays the solution with explanations; 'play' stops before each step that has an `ask` and lets the
   student answer it (tap a node, or type numbers), then shows the step. The graph, the code and the tables update
   in place, so CSS transitions animate every change.
   GPLAYER.overlay(cfg) opens the same player over the page (used by a question's "ver a resolução animada").
   Labs: a course registers STUDY.labs(id, [{ id, title, desc, icon, kinds, examples }]); each kind has
   make(GRAPH, rnd, opts) => { algo, g, p, stmt }; an example is { id, label, kind, algo, g, p, stmt }.
   The lab screen is the view 'glab'. Its buttons use data-gl, handled here. */
const GPLAYER = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const R = 17;
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (parent) parent.appendChild(e); return e; };
  const lines = x => (x === undefined || x === null ? [] : Array.isArray(x) ? x : [x]);
  const bump = (node, cls = 'bump') => { node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); };
  const parseNum = s => { s = String(s).trim().toLowerCase(); if (!s) return NaN; if (['∞', 'inf', 'infinito', 'i', 'oo'].includes(s)) return Infinity; return Number(s.replace(',', '.')); };
  const ICON = {
    first: '<path d="M7 6v16 M22 6L11 14l11 8z"/>', prev: '<path d="M19 6L9 14l10 8z"/>', next: '<path d="M9 6l10 8-10 8z"/>',
    last: '<path d="M21 6v16 M6 6l11 8-11 8z"/>', play: '<path d="M8 5l15 9-15 9z"/>', pause: '<path d="M8 6h4v16H8z M16 6h4v16h-4z"/>',
    snd: '<path d="M5 11h4l6-5v16l-6-5H5z M19 10a5 5 0 0 1 0 8 M21.5 7a9 9 0 0 1 0 14"/>', mute: '<path d="M5 11h4l6-5v16l-6-5H5z M19 11l5 6 M24 11l-5 6"/>',
  };
  const ico = k => `<svg viewBox="0 0 28 28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${ICON[k]}</g></svg>`;

  function mount(root, cfg) {
    const A = GRAPH.algos[cfg.algo], g = GRAPH.make(cfg.g), steps = A.run(g, cfg.p || {});
    // on a phone, squeeze the drawing sideways: it gets taller, so nodes and numbers stay readable
    const sx = root.clientWidth && root.clientWidth < 520 ? 0.74 : 1;
    if (sx < 1) { g.nodes.forEach(id => { g.pos[id] = [g.pos[id][0] * sx, g.pos[id][1]]; }); g.W *= sx; }
    const code = typeof A.code === 'function' ? A.code(cfg.p || {}) : A.code;
    const st = { i: 0, playing: false, timer: null, speed: 1, mode: cfg.mode || 'watch', answered: {}, score: 0, asked: 0, pending: null, tries: 0 };
    const pad = { l: 36, t: 30, r: 36, b: 50 };
    root.innerHTML = `<div class="gp" data-mode="${st.mode}">
      <div class="gp-top">
        <div class="seg" role="group" aria-label="Modo">
          <button data-gp="mode" data-k="watch" aria-pressed="${st.mode === 'watch'}">Ver a resolução</button>
          <button data-gp="mode" data-k="play" aria-pressed="${st.mode === 'play'}">Tu fazes</button>
        </div>
        <span class="spacer"></span>
        <span class="gp-score mono" ${st.mode === 'play' ? '' : 'hidden'}></span>
      </div>
      <div class="gp-stage"><svg class="gp-svg" viewBox="${-pad.l} ${-pad.t} ${g.W + pad.l + pad.r} ${g.H + pad.t + pad.b}" role="img" aria-label="Grafo da rede"></svg></div>
      <div class="gp-ctl">
        <button class="gp-b" data-gp="first" title="Início" aria-label="Voltar ao início">${ico('first')}</button>
        <button class="gp-b" data-gp="prev" title="Passo anterior (←)" aria-label="Passo anterior">${ico('prev')}</button>
        <button class="gp-b gp-play" data-gp="play" title="Reproduzir (espaço)" aria-label="Reproduzir">${ico('play')}</button>
        <button class="gp-b" data-gp="next" title="Passo seguinte (→)" aria-label="Passo seguinte">${ico('next')}</button>
        <button class="gp-b" data-gp="last" title="Fim" aria-label="Ir para o fim">${ico('last')}</button>
        <input class="gp-scrub" type="range" min="0" max="${steps.length - 1}" value="0" aria-label="Passo">
        <button class="gp-b gp-speed mono" data-gp="speed" title="Velocidade">1×</button>
        <button class="gp-b" data-gp="sound" title="Som" aria-label="Som">${ico(SFX.on ? 'snd' : 'mute')}</button>
      </div>
      <div class="gp-cols">
        <div class="gp-side">
          <div class="gp-say" aria-live="polite"><span class="gp-n mono"></span><p></p></div>
          <div class="gp-ask" hidden></div>
        </div>
        <div class="gp-code"><div class="eyebrow">${esc(A.name)} · código</div><pre>${code.map((l, i) => `<span class="ln" data-i="${i}"><i>${i + 1}</i>${esc(l)}</span>`).join('')}</pre></div>
      </div>
      <div class="gp-tabs"></div>
    </div>`;
    const $ = s => root.querySelector(s);
    const svg = $('.gp-svg'), say = $('.gp-say p'), stepN = $('.gp-n'), ask = $('.gp-ask'), scrub = $('.gp-scrub'), tabs = $('.gp-tabs'), score = $('.gp-score');

    /* --- draw the graph once --- */
    const gE = el('g', { class: 'gp-edges' }, svg), gA = el('g', { class: 'gp-arrows' }, svg), gP = el('g', { class: 'gp-pk' }, svg), gN = el('g', { class: 'gp-nodes' }, svg);
    const E = {}, N = {};
    // the cost label goes where it covers no node and no distance badge (under each node), nearest the middle
    const busy = g.nodes.flatMap(id => [[g.pos[id][0], g.pos[id][1], R + 12], [g.pos[id][0], g.pos[id][1] + R + 15, 22]]);
    const placed = [];
    const spot = (x1, y1, x2, y2) => {
      const fs = [0.5, 0.6, 0.4, 0.68, 0.32, 0.75, 0.25];
      const room = f => { const x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f; return Math.min(...busy.concat(placed).map(([bx, by, r]) => Math.hypot(bx - x, by - y) - r)); };
      // the first spot with enough room, or else the one with the most room
      const f = fs.find(v => room(v) > 10) ?? fs.reduce((a, b) => (room(b) > room(a) ? b : a));
      placed.push([x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 12]); return f;
    };
    g.edges.forEach(e => {
      const [x1, y1] = g.pos[e.a], [x2, y2] = g.pos[e.b], grp = el('g', { class: 'ge', 'data-k': e.k }, gE);
      const ln = el('line', { x1, y1, x2, y2, class: 'ge-l' }, grp);
      // the translate sits on an outer group: a CSS animation on the inner one would replace it
      const f = e.f ?? spot(x1, y1, x2, y2), mx = x1 + (x2 - x1) * f, my = y1 + (y2 - y1) * f, lab = el('g', { class: 'ge-ci' }, el('g', { class: 'ge-c', transform: `translate(${mx} ${my})` }, grp));
      const bg = el('rect', { x: -11, y: -10, width: 22, height: 20, rx: 6 }, lab), tx = el('text', { 'text-anchor': 'middle', y: 4.5 }, lab);
      tx.textContent = GRAPH.fmt(e.c); E[e.k] = { grp, ln, lab, bg, tx, c: e.c };
    });
    g.nodes.forEach((id, i) => {
      const [x, y] = g.pos[id], grp = el('g', { class: 'gn', 'data-id': id, transform: `translate(${x} ${y})`, style: `--i:${i}` }, gN);
      el('circle', { r: R + 7, class: 'gn-halo' }, grp);
      const body = el('g', { class: 'gn-body' }, grp);
      el('circle', { r: R, class: 'gn-c' }, body);
      const t = el('text', { class: 'gn-t', 'text-anchor': 'middle', y: 5 }, body); t.textContent = id;
      const badge = el('g', { class: 'gn-bi' }, el('g', { class: 'gn-b', transform: `translate(0 ${R + 15})` }, grp));
      const brect = el('rect', { y: -9, height: 18, rx: 9 }, badge), btx = el('text', { 'text-anchor': 'middle', y: 4 }, badge);
      N[id] = { grp, badge, brect, btx, txt: null };
    });
    const setBadge = (id, text, animate) => {
      const n = N[id]; if (n.txt === text) return; n.txt = text; n.btx.textContent = text;
      const w = Math.max(22, text.length * 7.4 + 12); n.brect.setAttribute('x', -w / 2); n.brect.setAttribute('width', w);
      n.badge.style.display = text ? '' : 'none'; if (animate) bump(n.badge);
    };

    /* --- packets travel along an edge --- */
    let raf = 0; const flying = [];
    function launch(pk) {
      const dur = 750 / st.speed, t0 = performance.now();
      pk.forEach(([a, b, l]) => {
        const [x1, y1] = g.pos[a], [x2, y2] = g.pos[b], len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
        const p = el('g', { class: 'pk' }, gP); el('circle', { r: 5.5 }, p);
        if (l !== '') { const t = el('text', { 'text-anchor': 'middle', y: -9 }, p); t.textContent = l; }
        flying.push({ p, x1: x1 + ux * R, y1: y1 + uy * R, x2: x2 - ux * R, y2: y2 - uy * R, t0, dur });
      });
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick(now) {
      for (let k = flying.length - 1; k >= 0; k--) {
        const f = flying[k], u = Math.min(1, (now - f.t0) / f.dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        f.p.setAttribute('transform', `translate(${f.x1 + (f.x2 - f.x1) * e} ${f.y1 + (f.y2 - f.y1) * e})`);
        f.p.style.opacity = u > 0.85 ? (1 - u) / 0.15 : 1;
        if (u >= 1) { f.p.remove(); flying.splice(k, 1); }
      }
      raf = flying.length && root.isConnected ? requestAnimationFrame(tick) : 0;
    }
    const clearPk = () => { flying.splice(0).forEach(f => f.p.remove()); };

    /* --- show step i --- */
    function render(i, animate = true) {
      const s = steps[i]; st.i = i;
      g.nodes.forEach(id => {
        const cls = `gn ${s.ns && s.ns[id] || ''}`.trim(), n = N[id];
        if (n.grp.getAttribute('class') !== cls) { n.grp.setAttribute('class', cls); }
        setBadge(id, (s.nl && s.nl[id]) || '', animate);
      });
      g.edges.forEach(e => {
        const o = E[e.k], cls = `ge ${s.es && s.es[e.k] || ''}`.trim(); if (o.grp.getAttribute('class') !== cls) o.grp.setAttribute('class', cls);
        const c = s.ec && e.k in s.ec ? s.ec[e.k] : e.c, gone = s.es && s.es[e.k] === 'gone', txt = gone ? '✕' : GRAPH.fmt(c);
        if (o.tx.textContent !== txt) { o.tx.textContent = txt; const w = Math.max(22, txt.length * 8 + 10); o.bg.setAttribute('x', -w / 2); o.bg.setAttribute('width', w); if (animate) bump(o.lab, 'flash'); }
      });
      gA.innerHTML = '';
      (s.ar || []).forEach(([a, b, cls]) => {
        const [x1, y1] = g.pos[a], [x2, y2] = g.pos[b], len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
        // the arrowhead touches the node it points to (the next hop), like a directed edge
        const sz = 8, tx = x2 - ux * (R + 3), ty = y2 - uy * (R + 3), bx = tx - ux * 2 * sz, by = ty - uy * 2 * sz;
        el('path', { class: `ar ${cls || ''}`, d: `M${tx} ${ty} L${bx - uy * sz * 0.8} ${by + ux * sz * 0.8} L${bx + uy * sz * 0.8} ${by - ux * sz * 0.8}Z` }, gA);
      });
      if (animate) { clearPk(); if (s.pk && s.pk.length) launch(s.pk); }
      const on = new Set(lines(s.line));
      root.querySelectorAll('.gp-code .ln').forEach(l => l.classList.toggle('on', on.has(+l.dataset.i)));
      say.innerHTML = md(s.say || ''); stepN.textContent = `Passo ${i + 1} de ${steps.length}`;
      if (animate) bump(say.parentNode, 'in');
      tabs.innerHTML = (s.tb || []).map(table).join('');
      scrub.value = i;
      if (animate && s.sfx) SFX.play(s.sfx);
      if (i === steps.length - 1) { stop(); if (st.mode === 'play' && animate) endCard(); }
    }
    function table(t) {
      const hl = new Set((t.hl || []).map(([r, c]) => `${r < 0 ? t.r.length + r : r}:${c}`)), mk = new Set((t.mk || []).map(([r, c]) => `${r}:${c}`));
      const last = t.r.length - 1;
      const cell = (v, r, c) => { const cl = [hl.has(`${r}:${c}`) || hl.has(`${r}:-1`) ? 'flash' : '', mk.has(`${r}:${c}`) ? 'mk' : ''].filter(Boolean).join(' ');
        return `<td${cl ? ` class="${cl}"` : ''}>${esc(v)}</td>`; };
      return `<div class="gp-tb"><div class="eyebrow">${esc(t.t || '')}</div><div class="gp-tbw"><table><thead><tr>${t.h.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${t.r.map((row, r) => `<tr${r === last ? ' class="last"' : ''}>${row.map((v, c) => cell(v, r, c)).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    }

    /* --- moving between steps --- */
    function goTo(i, animate = true) {
      i = Math.max(0, Math.min(steps.length - 1, i));
      closeAsk();
      if (st.mode === 'play' && i > st.i && steps[i].ask && !st.answered[i]) {
        // a jump forward over unanswered questions stops at the first one
        for (let k = st.i + 1; k <= i; k++) if (steps[k].ask && !st.answered[k]) { if (k > st.i + 1) render(k - 1, false); return openAsk(k); }
      }
      render(i, animate);
    }
    function stop() { st.playing = false; clearTimeout(st.timer); $('.gp-play').innerHTML = ico('play'); $('.gp-play').setAttribute('aria-label', 'Reproduzir'); }
    function play() {
      if (st.i >= steps.length - 1) render(0);
      st.playing = true; $('.gp-play').innerHTML = ico('pause'); $('.gp-play').setAttribute('aria-label', 'Pausa'); schedule();
    }
    function schedule() {
      clearTimeout(st.timer);
      const s = steps[st.i], wait = (s.pk && s.pk.length ? 1900 : 1500) + Math.min(1600, (s.say || '').length * 9);
      st.timer = setTimeout(() => { if (!root.isConnected || !st.playing) return; goTo(st.i + 1); if (st.playing && !st.pending && st.i < steps.length - 1) schedule(); }, wait / st.speed);
    }

    /* --- practice: questions before a step --- */
    function openAsk(k) {
      stop(); const a = steps[k].ask; st.pending = k; st.tries = 0;
      if (!(k in st.answered)) st.asked++;
      updScore();
      const body = a.k === 'node'
        ? `<p class="gp-hintline">Toca no nó, no desenho ou aqui:</p><div class="gp-pick">${g.nodes.map(id => `<button class="chip" data-gp="pick" data-id="${esc(id)}">${esc(id)}</button>`).join('')}</div>`
        : `<div class="gp-nums">${a.items.map((it, j) => `<label><span class="mono">${esc(it.l)}</span><input data-j="${j}" inputmode="text" autocomplete="off" spellcheck="false"></label>`).join('')}</div>
           <div class="row"><button class="btn primary small" data-gp="check">Verificar</button><span class="muted" style="font-size:12.5px">∞: escreve inf</span></div>`;
      ask.innerHTML = `<div class="gp-q"><span class="eyebrow">Tu fazes</span><p>${md(a.q)}</p></div>${body}<div class="gp-fb" aria-live="polite"></div>
        <div class="row gp-askfoot"><button class="btn ghost small" data-gp="reveal">Não sei: mostrar</button></div>`;
      ask.hidden = false; root.querySelector('.gp').classList.toggle('picking', a.k === 'node');
      const f = ask.querySelector('input'); if (f) f.focus({ preventScroll: true });
      ask.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    function closeAsk() { if (st.pending === null) return; st.pending = null; ask.hidden = true; ask.innerHTML = ''; root.querySelector('.gp').classList.remove('picking'); g.nodes.forEach(id => N[id].grp.classList.remove('wrong', 'right')); }
    function answer(ok, k, firstTry) {
      st.answered[k] = ok && firstTry; if (ok && firstTry) st.score++;
      updScore();
      const keepPlaying = true;
      closeAsk(); render(k);
      if (ok) SFX.play('good');
      if (keepPlaying && k < steps.length - 1) { st.playing = true; $('.gp-play').innerHTML = ico('pause'); schedule(); }
    }
    function check(val) {
      const k = st.pending, a = steps[k].ask, fb = ask.querySelector('.gp-fb');
      let ok;
      if (a.k === 'node') {
        ok = a.ans.includes(val);
        const n = N[val]; if (n) { n.grp.classList.remove('wrong', 'right'); bump(n.grp, ok ? 'right' : 'wrong'); }
      } else {
        const ins = [...ask.querySelectorAll('input')], vals = ins.map(x => parseNum(x.value));
        if (vals.some(v => Number.isNaN(v))) { fb.innerHTML = '<p class="bad">Preenche todos os valores (∞ escreve-se inf).</p>'; return; }
        const good = a.items.map((it, j) => vals[j] === it.ans);
        ins.forEach((x, j) => { x.classList.toggle('ok', good[j]); x.classList.toggle('ko', !good[j]); });
        ok = good.every(Boolean);
      }
      if (ok) { answer(true, k, st.tries === 0); return; }
      st.tries++; SFX.play('bad'); bump(ask, 'shake');
      if (st.tries === 1) fb.innerHTML = `<p class="bad"><b>Ainda não.</b> ${md(a.hint || 'Tenta outra vez.')}</p>`;
      else reveal();
    }
    function reveal() {
      const k = st.pending, a = steps[k].ask, fb = ask.querySelector('.gp-fb');
      const sol = a.k === 'node' ? `**${a.ans.join('** ou **')}**` : a.items.map(it => `${it.l} = **${GRAPH.fmt(it.ans)}**`).join(', ');
      fb.innerHTML = `<p class="bad">Era ${md(sol)}.</p><button class="btn small" data-gp="cont">Continuar</button>`;
      ask.querySelectorAll('.gp-pick button, .gp-nums input, [data-gp="check"], [data-gp="reveal"]').forEach(b => { b.disabled = true; });
      if (a.k === 'node') a.ans.forEach(id => N[id] && N[id].grp.classList.add('right'));
      else ask.querySelectorAll('.gp-nums input').forEach((x, j) => { x.value = GRAPH.fmt(a.items[j].ans); });
    }
    function updScore() { score.hidden = st.mode !== 'play'; score.textContent = `${st.score}/${st.asked} à primeira`; }
    function endCard() {
      const pct = st.asked ? st.score / st.asked : 1;
      ask.innerHTML = `<div class="gp-end"><span class="eyebrow">Fim</span><h3>${st.asked ? `Acertaste ${st.score} de ${st.asked} à primeira.` : 'Chegaste ao fim.'}</h3>
        <p class="muted">${pct === 1 ? 'Limpo. Experimenta outro problema, ou passa a ver só o fim.' : 'Revê os passos onde falhaste (◀) e tenta outro problema.'}</p>
        <div class="row">${cfg.onNew ? '<button class="btn primary small" data-gp="new">Outro problema</button>' : ''}<button class="btn small" data-gp="again">Repetir este</button></div></div>`;
      ask.hidden = false; st.pending = null;
    }
    function setMode(m) {
      st.mode = m; st.answered = {}; st.score = 0; st.asked = 0; closeAsk(); stop();
      root.querySelector('.gp').dataset.mode = m; root.querySelectorAll('[data-gp="mode"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === m));
      updScore(); render(0); if (m === 'play') play();
    }

    /* --- events --- */
    root.addEventListener('click', ev => {
      const n = ev.target.closest('.gn'); if (n && st.pending !== null && steps[st.pending].ask.k === 'node' && !ask.querySelector('[data-gp="cont"]')) { check(n.dataset.id); return; }
      const b = ev.target.closest('[data-gp]'); if (!b || b.disabled) return;
      SFX.play('click');
      switch (b.dataset.gp) {
        case 'mode': setMode(b.dataset.k); break;
        case 'play': st.playing ? stop() : (st.pending !== null ? null : play()); break;
        case 'next': stop(); if (st.pending === null) goTo(st.i + 1); break;
        case 'prev': stop(); closeAsk(); render(Math.max(0, st.i - 1)); break;
        case 'first': stop(); closeAsk(); render(0); break;
        case 'last': stop(); goTo(steps.length - 1, true); break;
        case 'speed': { const sp = [1, 2, 4, 0.5]; st.speed = sp[(sp.indexOf(st.speed) + 1) % sp.length]; b.textContent = `${st.speed}×`.replace('0.5', '½'); break; }
        case 'sound': SFX.on = !SFX.on; b.innerHTML = ico(SFX.on ? 'snd' : 'mute'); break;
        case 'pick': check(b.dataset.id); break;
        case 'check': check(); break;
        case 'reveal': st.tries = 2; reveal(); SFX.play('bad'); break;
        case 'cont': answer(false, st.pending, false); break;
        case 'again': setMode(st.mode); break;
        case 'new': cfg.onNew && cfg.onNew(st.mode); break;
      }
    });
    root.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('.gp-nums input')) { ev.preventDefault(); check(); } });
    scrub.addEventListener('input', () => { stop(); closeAsk(); render(+scrub.value, false); });
    const onKey = ev => {
      if (!root.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (ev.target.closest('input, textarea, select') || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (ev.key === 'ArrowRight') { ev.preventDefault(); stop(); if (st.pending === null) goTo(st.i + 1); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); stop(); closeAsk(); render(Math.max(0, st.i - 1)); }
      else if (ev.key === ' ' && !ev.target.closest('button')) { ev.preventDefault(); st.playing ? stop() : st.pending === null && play(); }
    };
    document.addEventListener('keydown', onKey);

    updScore(); render(0, false);
    if (st.mode === 'play') setTimeout(() => root.isConnected && play(), 500);
    return { steps, get mode() { return st.mode; }, stop, destroy() { stop(); clearPk(); document.removeEventListener('keydown', onKey); } };
  }

  /* --- over the page (from a question's feedback) --- */
  function overlay(cfg) {
    const wrap = document.createElement('div'); wrap.className = 'gmodal'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML = `<div class="gmodal-card"><div class="row gmodal-head"><h3>${esc(cfg.title || 'Resolução animada')}</h3><span class="spacer"></span><button class="btn small" data-close aria-label="Fechar">Fechar ✕</button></div>${cfg.stmt ? `<p class="gp-stmt">${md(cfg.stmt)}</p>` : ''}<div class="gmodal-body"></div></div>`;
    document.body.appendChild(wrap); document.body.classList.add('gmodal-open');
    const ctl = mount(wrap.querySelector('.gmodal-body'), cfg);
    const close = () => { ctl.destroy(); wrap.remove(); document.body.classList.remove('gmodal-open'); document.removeEventListener('keydown', esc_); };
    const esc_ = ev => { if (ev.key === 'Escape') close(); };
    wrap.addEventListener('click', ev => { if (ev.target === wrap || ev.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', esc_);
    wrap.querySelector('[data-close]').focus();
  }
  return { mount, overlay };
})();

/* ---------- the lab screen (view 'glab') ---------- */
let glabCtl = null;
const courseLabs = () => (C && C.labs) || [];
function glabProblem(lab, v) {
  if (v.ex) { const x = (lab.examples || []).find(e => e.id === v.ex); if (x) return Object.assign({ title: x.label }, x, { p: Object.assign({}, x.p, v.opt) }); }
  const kind = lab.kinds.find(k => k.id === v.kind) || lab.kinds[0];
  const made = kind.make(GRAPH, GRAPH.rng(v.seed), v.opt || {});
  return Object.assign({ title: kind.label }, made, { p: Object.assign({}, made.p, v.opt) });
}
function GraphLab() {
  const lab = courseLabs().find(l => l.id === view.lab); if (!lab) return Home();
  if (!view.kind && !view.ex) view.kind = lab.kinds[0].id;
  if (!view.seed) view.seed = GRAPH.newSeed();
  view.opt = view.opt || {};
  const kind = lab.kinds.find(k => k.id === view.kind);
  const opts = (view.ex ? ((lab.examples || []).find(e => e.id === view.ex) || {}).opts : kind && kind.opts) || [];
  const P = glabProblem(lab, view);
  return `<section class="hero glab-hero"><span class="eyebrow">Só de ${esc(C.code)} · laboratório</span><h1>${esc(lab.title)}</h1><p>${esc(lab.desc || '')}</p></section>
    <div class="glab-pick">
      <div class="row glab-kinds" role="group" aria-label="Tipo de problema">${lab.kinds.map(k => `<button class="chip" data-gl="kind" data-k="${esc(k.id)}" aria-pressed="${!view.ex && view.kind === k.id}">${esc(k.label)}</button>`).join('')}</div>
      ${(lab.examples || []).length ? `<details class="glab-ex" ${view.ex ? 'open' : ''}><summary>Exemplos das aulas e dos exames</summary><div class="row">${lab.examples.map(x => `<button class="chip" data-gl="ex" data-k="${esc(x.id)}" aria-pressed="${view.ex === x.id}">${esc(x.label)}</button>`).join('')}</div></details>` : ''}
    </div>
    <article class="card glab-card">
      <div class="row"><h2>${esc(P.title)}</h2><span class="spacer"></span>
        ${opts.map(o => `<button class="chip" data-gl="opt" data-k="${esc(o.id)}" aria-pressed="${!!view.opt[o.id]}" title="${esc(o.title || '')}">${esc(o.label)}</button>`).join('')}
        ${view.ex ? '' : '<button class="btn small" data-gl="new">Novo problema ↻</button>'}</div>
      <p class="gp-stmt">${md(P.stmt || '')}</p>
      <div id="glabMount"></div>
    </article>`;
}
function afterGraphLabRender() {
  const m = document.getElementById('glabMount'); if (!m) return;
  const lab = courseLabs().find(l => l.id === view.lab), P = glabProblem(lab, view);
  if (glabCtl) glabCtl.destroy();
  glabCtl = GPLAYER.mount(m, Object.assign({}, P, { mode: view.mode || 'watch',
    onNew: view.ex ? null : mode => { view.seed = GRAPH.newSeed(); view.mode = mode; renderView(); } }));
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-gl]'); if (!b) return;
  const mode = glabCtl ? glabCtl.mode : view.mode;
  switch (b.dataset.gl) {
    case 'open': go('glab', { lab: b.dataset.k }); break;
    case 'kind': view.kind = b.dataset.k; view.ex = null; view.seed = GRAPH.newSeed(); view.mode = mode; view.opt = {}; renderView(); break;
    case 'ex': view.ex = b.dataset.k; view.mode = mode; view.opt = {}; renderView(); break;
    case 'new': view.seed = GRAPH.newSeed(); view.mode = mode; renderView(); break;
    case 'opt': view.opt = Object.assign({}, view.opt, { [b.dataset.k]: !view.opt[b.dataset.k] }); view.mode = mode; renderView(); break;
    case 'anim': { const q = BYID[b.dataset.id]; if (q && q.anim) GPLAYER.overlay(Object.assign({ title: 'Resolução animada' }, q.anim)); break; }
  }
});
