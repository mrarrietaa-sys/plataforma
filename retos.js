/* v632 · Reto de 40 segundos: un juego propio por módulo y edad.
   Usa SOLO frases de la lección con su audio aprobado (texto = audio). Duración: 40 s.
   M1: Adultos Maletas · Teens Ritmo · Kids Burbujas
   M2: Adultos Reloj · Teens Corte ninja · Kids Pesca
   M3: Adultos Clasificador · Teens Carrera · Kids Canasta
   M4: Adultos Rascacielos · Teens Penalti · Kids Ranita */
(function () {
  try { if (!document.querySelector('link[href^="retos.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'retos.css?v=632'; document.head.appendChild(l); } } catch (e) { }
  const T = window.__rtT || 40, IMG = 'retos/';
  const M = () => window.M1, A = () => window.M1A;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const VOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>';
  const ag = () => { try { return M().ageGroup(); } catch (e) { return 'adult'; } };
  const WORK = /\b(job|jobs|boss|office|promot\w*|salary|work\w*|company|meeting|hired|fired|career|client\w*|colleague\w*|manager|interview\w*|employ\w*|business|lottery|mortgage|rent|husband|wife|married|marry|divorc\w*|wine|beer|retire\w*|gap year|kids|baby|pregnan\w*|loan|debt|tax\w*|landlord|conference|million|dollars|bank|cabin|coworker\w*|overtime|resume|résumé|paycheck|raise)\b/i;
  const mod = () => +((M() && M().MOD && M().MOD.n) || 1);
  const play = k => { try { return k ? M().play(k) : Promise.resolve(); } catch (e) { return Promise.resolve(); } };
  const stopA = () => { try { M().stop(); } catch (e) { } };
  const vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } };
  const clean = s => String(s || '').replace(/\s*\([^)]*\)/g, '').replace(/\s+([.,!?])/g, '$1').trim();
  const first = a => String(a || '').split(' / ')[0].trim();
  const blank = s => esc(s).replace(/_{2,}/g, '<u class="rto-bl">&nbsp;?&nbsp;</u>');

  /* ---------- bancos de la lección ---------- */
  function topicParts(p) { try { return M().allParts().filter(x => x.topic === p.topic); } catch (e) { return [p]; } }
  function vocabItems(p) {
    const V = (p.vocab || []).filter(v => v && v.en && v.au && String(v.en).length <= 22 && !(ag() !== 'adult' && WORK.test(v.en)));
    const uniq = V.filter((v, i) => V.findIndex(x => x.en === v.en) === i); if (uniq.length < 3) return [];
    return uniq.map(v => ({ mode: 'v', say: v.au, after: v.au, ans: v.en, txt: v.en + (v.es ? ' = ' + v.es : ''), opts: [v.en, ...shuf(uniq.filter(x => x.en !== v.en)).slice(0, 2).map(x => x.en)] }));
  }
  function fillItems(p, n) {
    let F = (p.fill || []).filter(f => f && f.s && f.a && f.au && Array.isArray(f.o) && f.o.length && /_{2,}/.test(f.s) && f.o.indexOf(f.a) < 0);
    if (F.length < 3) F = F.concat(topicParts(p).filter(x => x !== p).flatMap(x => (x.fill || []).filter(f => f && f.s && f.a && f.au && Array.isArray(f.o) && f.o.length && /_{2,}/.test(f.s) && f.o.indexOf(f.a) < 0)));
    F = F.filter((f, i) => F.findIndex(x => x.s === f.s) === i); if (F.length < 3) return [];
    return F.map(f => ({ mode: 'f', q: f.s, ans: f.a, after: f.au, txt: clean(f.full || f.s.replace(/_{2,}/, f.a)), opts: [f.a, ...f.o.filter(o => o !== f.a)].slice(0, n || 3) }));
  }
  // Kids/Teens: completar la frase con la expresión de su lección (frases de su edad, con su audio)
  function ageFill(p, n) {
    const V = (p.vocab || []).filter(v => v && v.en && v.en.length <= 24 && !WORK.test(v.en)), S = (p.sentences || []).filter(s => s && s.en && s.au && !WORK.test(s.en));
    const rx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exact = v => new RegExp('\\b' + rx(v.en) + '\\b', 'i');
    const loose = v => new RegExp('\\b' + v.en.split(/\s+/).map(w => { const c = w.replace(/[^A-Za-z']/g, ''); const st = c.length > 4 ? c.replace(/(ies|es|ed|ing|e|s|y)$/i, '') : c; return rx(st) + "[A-Za-z']*"; }).join('\\s+') + '\\b', 'i');
    const L = []; S.forEach(s => { const cand = V.slice().sort((a, b) => (a.img === s.img ? -1 : 0) - (b.img === s.img ? -1 : 0) || b.en.length - a.en.length);
      let v = cand.find(v => exact(v).test(s.en)), m = v && s.en.match(exact(v)); if (!v) { v = cand.find(v => v.en.split(/\s+/).length <= 4 && loose(v).test(s.en)); m = v && s.en.match(loose(v)); } if (!v || !m) return;
      const ans = m[0], others = shuf(V.filter(x => x !== v && !exact(x).test(s.en) && x.en.toLowerCase() !== ans.toLowerCase())).slice(0, (n || 3) - 1).map(x => x.en); if (others.length < (n || 3) - 1) return;
      L.push({ mode: 'f', q: s.en.replace(m[0], '___'), ans, after: s.au, txt: s.en, opts: [ans, ...others] }); });
    return L.length >= 3 ? L : [];
  }
  function qaItems(p) {
    const ok = k => k && k.q && k.a && k.qau && k.aau && !/_{2,}/.test(first(k.a)) && first(k.a).length <= 46;
    const K = (p.keyq || []).filter(ok), pool = topicParts(p).flatMap(x => (x.keyq || []).filter(ok)).concat(K);
    const ans = [...new Set(pool.map(k => first(k.a)))]; if (K.length < 2 || ans.length < 3) return [];
    return K.map(k => { const a = first(k.a); return { mode: 'q', q: k.q, say: k.qau, after: k.aau, ans: a, txt: a, opts: [a, ...shuf(ans.filter(x => x !== a)).slice(0, 2)] }; });
  }
  // ⏰ La hora (Módulo 2 · Adultos): frases del tema «Telling the Time» con su audio
  const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, 'twenty-five': 25 };
  function parseTime(s) {
    s = String(s || '').toLowerCase().replace(/[.!?]/g, '').replace(/^it's\s+|^it is\s+/, '').trim(); let m;
    if (s === 'noon' || s === 'midnight') return [12, 0];
    if ((m = s.match(/^(\w+) o'clock$/)) && NUM[m[1]] <= 12) return [NUM[m[1]], 0];
    if ((m = s.match(/^half past (\w+)$/)) && NUM[m[1]] <= 12) return [NUM[m[1]], 30];
    if ((m = s.match(/^quarter past (\w+)$/)) && NUM[m[1]] <= 12) return [NUM[m[1]], 15];
    if ((m = s.match(/^quarter to (\w+)$/)) && NUM[m[1]] <= 12) return [NUM[m[1]] === 1 ? 12 : NUM[m[1]] - 1, 45];
    if ((m = s.match(/^([\w-]+) past (\w+)$/)) && NUM[m[1]] && NUM[m[1]] < 30 && NUM[m[2]] <= 12) return [NUM[m[2]], NUM[m[1]]];
    if ((m = s.match(/^([\w-]+) to (\w+)$/)) && NUM[m[1]] && NUM[m[1]] < 30 && NUM[m[2]] <= 12) return [NUM[m[2]] === 1 ? 12 : NUM[m[2]] - 1, 60 - NUM[m[1]]];
    if ((m = s.match(/^(\w+) ([\w-]+)$/)) && NUM[m[1]] <= 12 && /^(fifteen|thirty|forty-five|ten|twenty|fifty|five|forty)$/.test(m[2])) { const mm = { fifteen: 15, thirty: 30, 'forty-five': 45, ten: 10, twenty: 20, fifty: 50, five: 5, forty: 40 }[m[2]]; return [NUM[m[1]], mm]; }
    return null;
  }
  function timeItems() {
    let P = []; try { P = M().allParts(); } catch (e) { }
    const L = []; P.forEach(x => [].concat(x.vocab || [], x.sentences || []).forEach(v => { if (v && v.en && v.au) { const t = parseTime(v.en); if (t && /^it'?s\b|^it is\b/i.test(v.en)) L.push({ en: v.en, au: v.au, t }); } }));
    const U = L.filter((v, i) => L.findIndex(x => x.en === v.en) === i && L.findIndex(x => x.t[0] === v.t[0] && x.t[1] === v.t[1]) === i);
    if (U.length < 3) return [];
    return U.map(v => ({ mode: 't', say: v.au, after: v.au, ans: v.en, txt: v.en, t: v.t, opts: [v, shuf(U.filter(x => x !== v))[0]] }));
  }
  /* ---------- catálogo ---------- */
  const G = {
    'adult-1': { k: 'maletas', t: 'Maletas al vuelo', ins: 'Escucha la pregunta y agarra la maleta con la respuesta correcta antes de que se vaya por la banda.', src: p => qaItems(p) },
    'teens-1': { k: 'ritmo', t: 'Ritmo en inglés', ins: 'Tus amigos te escriben. Toca la respuesta correcta antes de que caiga.', src: p => qaItems(p) },
    'kids-1': { k: 'burbujas', t: 'Burbujas', ins: 'Escucha la palabra y revienta la burbuja correcta antes de que se vaya volando.', src: p => vocabItems(p) },
    'adult-2': { k: 'reloj', t: 'Reloj veloz', ins: 'Escucha la hora y toca el reloj que la marca. ¡Solo 2 opciones, pero rápido!', src: p => timeItems() },
    'teens-2': { k: 'ninja', t: 'Corte ninja', ins: 'Lee la frase y corta la palabra que la completa mientras vuela. ¡No cortes las falsas!', src: p => fillItems(p) },
    'kids-2': { k: 'pesca', t: 'Pesca mágica', ins: 'Escucha la palabra y pesca el pez que la tiene antes de que se vaya nadando.', src: p => vocabItems(p) },
    'adult-3': { k: 'clasif', t: 'Clasificador exprés', ins: 'La frase baja por el tubo. Toca la palabra que la completa antes de que llegue abajo.', src: p => fillItems(p) },
    'teens-3': { k: 'carrera', t: 'Carrera', ins: 'Lee la frase y cambia de carril para pasar por la respuesta correcta.', src: p => fillItems(p) },
    'kids-3': { k: 'canasta', t: 'La canasta', ins: 'Mueve la canasta y atrapa la palabra que completa la frase.', src: p => fillItems(p) },
    'adult-4': { k: 'rasca', t: 'Rascacielos', ins: 'La grúa cambia la palabra del bloque. Toca SOLTAR cuando muestre la correcta.', src: p => fillItems(p) },
    'teens-4': { k: 'penalti', t: 'Penalti', ins: 'Elige la respuesta correcta para patear. Si aciertas, el arquero se lanza al otro lado: ¡gol!', src: p => fillItems(p) },
    'kids-4': { k: 'ranita', t: 'Ranita saltarina', ins: 'Haz saltar a la ranita a la hoja con la respuesta correcta antes de que se hunda.', src: p => fillItems(p, 2) }
  };
  function pick(p) {
    const g = G[ag() + '-' + Math.min(4, Math.max(1, mod()))]; if (!g) return null;
    let items = g.src(p) || [];
    if (ag() !== 'adult' && items.length && items[0].mode === 'f') { const af = ageFill(p, g.k === 'ranita' ? 2 : 3); const clean2 = items.filter(it => !WORK.test(it.q + ' ' + it.txt)); items = af.length >= 3 ? af : (clean2.length >= 3 ? clean2 : []); }
    if (items.length < 3) { items = vocabItems(p); if (g.k === 'reloj' || g.k === 'ranita') items = items.map(it => Object.assign({}, it, { opts: g.k === 'ranita' ? it.opts.slice(0, 2) : it.opts })); }
    if (g.k === 'reloj' && items.length && items[0].mode !== 't') return null; // sin frases de la hora → juego normal de la lección
    if (items.length < 3) return null;
    return { g, items };
  }
  window.MRRETO = { has: p => !!pick(p), pick, parseTime };

  /* ---------- motor común ---------- */
  function run(stage, p) {
    const P = pick(p); if (!P) return Promise.resolve(null);
    const { g, items } = P, AGE = ag();
    const body = A().head(stage, { lbl: 'Practice', title: g.t, ins: g.ins });
    const box = document.createElement('div'); box.className = `rto rto-${AGE} rto-${g.k}`; body.appendChild(box);
    box.innerHTML = `<div class="rto-top"><span class="rto-pts">0 pts</span><div class="rto-bar"><i></i></div><span class="rto-s">${T} s</span></div><div class="rto-body"></div>`;
    const fit = () => { if (!box.isConnected) return removeEventListener('resize', fit); const r = box.getBoundingClientRect(); const h = Math.max(320, Math.min(620, innerHeight - r.top - 34)); box.style.height = h + 'px'; };
    fit(); addEventListener('resize', fit); setTimeout(fit, 300);
    const B = box.querySelector('.rto-body');
    return new Promise(done => {
      const intro = () => { B.innerHTML = `<div class="rto-start"><img src="mra-point.webp" alt="Mr. Arrieta"><h3>${esc(g.t)}</h3><p>${esc(g.ins)}</p><button type="button" class="rto-go">Empezar · ${T} s</button></div>`; B.querySelector('.rto-go').onclick = start; };
      const S = { ok: 0, tot: 0, pts: 0, streak: 0, live: false, tm: [], raf: 0, missed: [] };
      S.later = (f, ms) => S.tm.push(setTimeout(() => { if (S.live && box.isConnected) f(); }, ms));
      S.score = (good, it) => { S.tot++; if (good) { S.ok++; S.streak++; S.pts += 10 + (S.streak >= 3 ? 5 : 0); vib(30); } else { S.streak = 0; vib([60, 40, 60]); if (it && S.missed.indexOf(it.ans) < 0) S.missed.push(it.ans); } box.querySelector('.rto-pts').textContent = S.pts + ' pts'; return good ? (S.streak >= 3 ? '¡Racha! +15' : '+10') : ''; };
      let order = shuf(items), oi = 0; S.next = () => { if (oi >= order.length) { order = shuf(items); oi = 0; } return order[oi++]; };
      function start() {
        S.live = true; let t = T; const bar = box.querySelector('.rto-bar i'), sEl = box.querySelector('.rto-s');
        const id = setInterval(() => { if (!box.isConnected) { clearInterval(id); S.live = false; S.tm.forEach(clearTimeout); stopA(); return; } t--; bar.style.transform = `scaleX(${t / T})`; sEl.textContent = t + ' s'; if (t <= 0) { clearInterval(id); end(); } }, 1000);
        GAMES[g.k](B, S, items);
      }
      async function end() {
        S.live = false; S.tm.forEach(clearTimeout); cancelAnimationFrame(S.raf); stopA(); if (!box.isConnected) return done(null);
        const md = window.MRMOOD ? MRMOOD(S.ok, S.tot || 1) : { k: 'hi', img: 'mra-celebrate.webp', t: '¡Excelente!' };
        let k = S.tot === 0 ? 'lo' : md.k, img = S.tot === 0 ? 'mra-sad1.webp' : md.img; if (k === 'hi' && S.tot < 3) { k = 'mid'; img = 'mra-smile.webp'; }
        const msg = k === 'hi' ? `Acertaste ${S.ok} de ${S.tot}. ¡Muy rápido!` : k === 'lo' ? `Solo ${S.ok} de ${S.tot} correctas. Repasa y vuelve a intentarlo.` : (S.ok === S.tot ? `Acertaste ${S.ok} de ${S.tot}. ¡Ahora intenta responder más rápido!` : `Acertaste ${S.ok} de ${S.tot}. Al final repasa lo que fallaste.`);
        B.innerHTML = `<div class="rto-end ${k}"><img src="${img}" alt="Mr. Arrieta"><h3>${k === 'hi' ? '¡Excelente!' : k === 'lo' ? 'Try again!' : '¡Vas bien!'}</h3><div class="rto-big">${S.pts}</div><small>puntos</small><p>${msg}</p></div>`;
        await A().waitNext(stage, 'Continuar'); removeEventListener('resize', fit);
        done(A().result(S.ok, Math.max(1, S.tot), items[0].mode === 'f' ? 'reading' : 'listening', S.missed));
      }
      intro();
    });
  }
  const ASK = (small, html, au) => `<div class="rto-ask"><div class="q"><small>${small}</small><b>${html}</b></div>${au ? `<button type="button" class="rto-au" aria-label="Escuchar">${VOL}</button>` : ''}</div>`;
  const wireAu = (B, key) => { const b = B.querySelector('.rto-au'); if (b) b.onclick = () => { stopA(); play(key); }; };
  const promptOf = it => it.mode === 'f' ? ['COMPLETA LA FRASE', blank(it.q), null] : it.mode === 'q' ? ['ESCUCHA Y RESPONDE', esc(it.q), it.say] : it.mode === 't' ? ['ESCUCHA LA HORA', esc(it.ans), it.say] : ['ESCUCHA', '¿Qué palabra escuchas?', it.say];
  const FB = '<div class="rto-fb"></div>';
  const sz = t => t.length > 34 ? ' xs' : t.length > 20 ? ' sm' : '';
  function after(B, S, it, good, chosen, delayOk, delayBad, extra) {
    const fb = B.querySelector('.rto-fb'), m = S.score(good, it);
    if (fb) { fb.innerHTML = (good ? `<span class="ok">✓ ${esc(it.txt)} · ${m}</span>` : `<span class="no">${extra || 'Era'}: <b>${esc(it.txt)}</b></span>`) + `<button type="button" class="rto-au sm2" aria-label="Escuchar">${VOL}</button>`; const rb = fb.querySelector('.rto-au'); rb.onclick = () => { stopA(); play(it.after); }; }
    stopA(); play(it.after); S.later(() => S.round(), good ? delayOk : delayBad);
  }
  function timeout(B, S, it, ms, msg) { S.later(() => { if (S.cur !== it || S.done) return; S.done = true; const fb = B.querySelector('.rto-fb'); S.score(false, it); if (fb) fb.innerHTML = `<span class="no">${msg || '¡Se acabó el tiempo!'} <b>${esc(it.txt)}</b></span>`; stopA(); play(it.after); S.later(() => S.round(), 1900); }, ms); }
  const head = (B, it) => { const [s, h, au] = promptOf(it); return ASK(s, h, au); };
  function setup(B, S, it, html) { S.cur = it; S.done = false; B.innerHTML = head(B, it) + html + FB; const [, , au] = promptOf(it); wireAu(B, au); if (au) setTimeout(() => { if (S.cur === it) play(au); }, 150); }

  /* ---------- los 12 juegos ---------- */
  const GAMES = {
    maletas(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, '<div class="rto-area rto-hall"><div class="rto-belt b1"></div><div class="rto-belt b2"></div></div>');
      const ar = B.querySelector('.rto-area'), W = ar.clientWidth + 10;
      op.forEach((o, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'rto-bag'; b.innerHTML = `<span class="${sz(o)}">${esc(o)}</span>`; const rv = k === 1; b.style.top = (rv ? Math.round(ar.clientHeight * .52) : 6) + 'px'; b.style.setProperty('--a', rv ? 'rtL' : 'rtR'); b.style.setProperty('--w', W + 'px'); b.style.setProperty('--t', (6 + k * .4) + 's'); b.style.animationDelay = (k === 2 ? 2.2 : k * .5) + 's';
        b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = o === it.ans; ar.querySelectorAll('.rto-bag').forEach(x => x.style.animationPlayState = 'paused'); b.classList.add(good ? 'r' : 'w'); if (!good) [...ar.querySelectorAll('.rto-bag')].find(x => x.textContent === it.ans).classList.add('r'); after(B, S, it, good, o, 900, 2000); }; ar.appendChild(b); });
      timeout(B, S, it, 8800, '¡Se fue la maleta! Era:'); }; S.round(); },
    ritmo(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, '<div class="rto-area rto-lanes">' + op.map(() => '<div class="rto-lane"><div class="rto-hit"></div></div>').join('') + '</div>');
      const L = B.querySelectorAll('.rto-lane'); op.forEach((o, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'rto-note n' + k + sz(o); b.textContent = o; b.style.setProperty('--t', (5.2 + Math.random()).toFixed(1) + 's'); b.style.animationDelay = (Math.random() * .8).toFixed(1) + 's';
        b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = o === it.ans; B.querySelectorAll('.rto-note').forEach(x => x.style.animationPlayState = 'paused'); b.classList.add(good ? 'r' : 'w'); if (!good) [...B.querySelectorAll('.rto-note')].find(x => x.textContent === it.ans).classList.add('r'); after(B, S, it, good, o, 900, 2000); }; L[k].appendChild(b); });
      timeout(B, S, it, 7400, '¡Muy lento! Era:'); }; S.round(); },
    burbujas(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, '<div class="rto-area rto-sky"></div>');
      const ar = B.querySelector('.rto-area'), W = ar.clientWidth, H = ar.clientHeight, D = Math.min(92, Math.floor(W / 3.4)); ar.style.setProperty('--rise', -(H + D + 20) + 'px');
      op.forEach((o, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'rto-bub' + sz(o); b.textContent = o; b.style.width = b.style.height = D + 'px'; b.style.left = Math.round(k * (W - D) / 2) + 'px'; b.style.setProperty('--t', (6.8 + Math.random() * 1.2).toFixed(1) + 's'); b.style.animationDelay = (k * .3) + 's';
        b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = o === it.ans; ar.querySelectorAll('.rto-bub').forEach(x => x.style.animationPlayState = 'paused'); b.classList.add(good ? 'pop' : 'wr'); if (!good) [...ar.querySelectorAll('.rto-bub')].find(x => x.textContent === it.ans).classList.add('ok'); after(B, S, it, good, o, 900, 1900); }; ar.appendChild(b); });
      timeout(B, S, it, 8600, '¡Se escaparon! Era:'); }; S.round(); },
    reloj(B, S) { S.round = () => { const it = S.next(); if (it.mode !== 't') return GAMES.generic(B, S, it); const op = shuf(it.opts); setup(B, S, it, `<div class="rto-area rto-board"><div class="rto-clk2">${op.map(o => `<button type="button" class="rto-ck"><span class="face">${clockSVG(o.t[0], o.t[1])}</span><b>${o.t[0]}:${String(o.t[1]).padStart(2, '0')}</b></button>`).join('')}</div><div class="rto-tb"><i></i></div></div>`);
      const ar = B.querySelector('.rto-area'); ar.querySelectorAll('.rto-ck').forEach((b, k) => b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = op[k].en === it.ans; ar.querySelector('.rto-tb i').style.animationPlayState = 'paused'; b.classList.add(good ? 'r' : 'w'); if (!good) ar.querySelectorAll('.rto-ck')[op.findIndex(o => o.en === it.ans)].classList.add('r'); after(B, S, it, good, op[k], 900, 1900); });
      timeout(B, S, it, 6500); }; S.round(); },
    ninja(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, '<div class="rto-area rto-city"></div>');
      const ar = B.querySelector('.rto-area'), W = ar.clientWidth, H = ar.clientHeight;
      op.forEach((o, k) => { const d = document.createElement('div'); d.className = 'rto-fly c' + k; const tt = (3.6 + Math.random() * .6).toFixed(1) + 's', hh = Math.round(H * (.55 + Math.random() * .2)) + 'px'; d.style.left = Math.round(W * (.06 + k * .3)) + 'px'; d.style.setProperty('--dx', Math.round((Math.random() - .5) * W * .25) + 'px'); d.style.setProperty('--t', tt); d.style.animationDelay = (k * .7) + 's'; d.innerHTML = `<button type="button" class="${sz(o).trim()}">${esc(o)}</button>`; const b = d.firstChild; b.style.setProperty('--t', tt); b.style.setProperty('--h', hh); b.style.animationDelay = (k * .7) + 's';
        b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = o === it.ans; ar.querySelectorAll('.rto-fly,.rto-fly button').forEach(x => x.style.animationPlayState = 'paused'); const r = b.getBoundingClientRect(), R = ar.getBoundingClientRect(); const s = document.createElement('i'); s.className = 'rto-slash'; s.style.left = (r.left - R.left - 6) + 'px'; s.style.top = (r.top - R.top + r.height / 2) + 'px'; ar.appendChild(s); b.classList.add(good ? 'r' : 'w'); after(B, S, it, good, o, 1000, 2000); }; ar.appendChild(d); });
      timeout(B, S, it, 6400, '¡Muy lento! Era:'); }; S.round(); },
    pesca(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, '<div class="rto-area rto-pond"></div>');
      const ar = B.querySelector('.rto-area'), W = ar.clientWidth + 10, H = ar.clientHeight;
      op.forEach((o, k) => { const f = document.createElement('button'); f.type = 'button'; const right = k !== 1; f.className = 'rto-fish' + (right ? ' rv' : ''); f.innerHTML = `<img src="${IMG}koi.webp" alt=""><span class="lb${sz(o)}">${esc(o)}</span>`; f.style.top = Math.round(14 + k * Math.max(60, (H - 80) / 3)) + 'px'; f.style.setProperty('--a', right ? 'rtR' : 'rtL'); f.style.setProperty('--w', W + 'px'); f.style.setProperty('--t', (6 + k * .5) + 's'); f.style.animationDelay = (k * .35) + 's';
        f.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = o === it.ans; ar.querySelectorAll('.rto-fish').forEach(x => x.style.animationPlayState = 'paused'); f.classList.add(good ? 'r' : 'w'); if (!good) [...ar.querySelectorAll('.rto-fish')].find(x => x.textContent === it.ans).classList.add('r'); after(B, S, it, good, o, 900, 1900); }; ar.appendChild(f); });
      timeout(B, S, it, 8200, '¡Se escaparon! Era:'); }; S.round(); },
    clasif(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts), sp = Math.max(3.2, 5.2 - S.streak * .25); setup(B, S, it, `<div class="rto-area rto-board2"><div class="rto-chute"></div><div class="rto-item" style="--t:${sp}s">${it.mode === 'f' ? '?' : '🔊'}</div><div class="rto-bins">${op.map(o => `<button type="button" class="${sz(o).trim()}">${esc(o)}</button>`).join('')}</div></div>`);
      const itEl = B.querySelector('.rto-item'); if (it.mode === 'f') itEl.innerHTML = blank(it.q); itEl.classList.add(sz(it.q || '').trim() || 'n');
      B.querySelectorAll('.rto-bins button').forEach((b, k) => b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = op[k] === it.ans; itEl.classList.add(good ? 'r' : 'w'); itEl.textContent = it.txt; b.classList.add(good ? 'r' : 'w'); after(B, S, it, good, op[k], 900, 2100); });
      timeout(B, S, it, sp * 1000 + 200); }; S.round(); },
    carrera(B, S) { let lane = 1; S.round = () => { const it = S.next(), op = shuf(it.opts); while (op.length < 3) op.push(''); setup(B, S, it, `<div class="rto-area rto-road"><div class="rto-asph"></div><div class="rto-lns"><i></i><i></i></div><div class="rto-gates">${op.map(o => `<span class="rto-gt${o ? '' : ' em'}${sz(o)}">${esc(o)}</span>`).join('')}</div><img class="rto-car" src="${IMG}car.webp" alt=""><div class="rto-steer"><button type="button" aria-label="Izquierda">‹</button><button type="button" aria-label="Derecha">›</button></div></div>`);
      const ar = B.querySelector('.rto-area'), car = ar.querySelector('.rto-car'), gates = ar.querySelector('.rto-gates'); const place = () => { car.style.left = (16.66 + lane * 33.33) + '%'; }; place();
      const [bl, br] = ar.querySelectorAll('.rto-steer button'); bl.onclick = () => { if (!S.done) { lane = Math.max(0, lane - 1); place(); } }; br.onclick = () => { if (!S.done) { lane = Math.min(2, lane + 1); place(); } };
      ar.onpointerdown = e => { if (e.target.closest('.rto-steer') || S.done) return; const R = ar.getBoundingClientRect(); lane = Math.max(0, Math.min(2, Math.floor((e.clientX - R.left) / R.width * 3))); place(); };
      const TT = 6000; gates.style.setProperty('--t', TT + 'ms');
      S.later(() => { if (S.done || S.cur !== it) return; S.done = true; const good = op[lane] === it.ans; const gs = gates.querySelectorAll('.rto-gt'); gates.style.animationPlayState = 'paused'; gs[lane].classList.add(good ? 'r' : 'w'); if (!good) { gs[op.indexOf(it.ans)].classList.add('r'); car.classList.add('crash'); } else car.classList.add('boost'); after(B, S, it, good, op[lane], 1000, 2100); }, TT * .8); }; S.round(); },
    canasta(B, S) { let bx = 0; S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, '<div class="rto-area rto-orch"><div class="rto-tip">Arrastra la canasta</div><div class="rto-basket"></div></div>');
      const ar = B.querySelector('.rto-area'), bk = ar.querySelector('.rto-basket'), W = ar.clientWidth, H = ar.clientHeight; bx = bx || W / 2; bk.style.left = bx + 'px';
      const mv = e => { const R = ar.getBoundingClientRect(); bx = Math.max(56, Math.min(W - 56, e.clientX - R.left)); bk.style.left = bx + 'px'; }; ar.onpointerdown = e => { mv(e); try { ar.setPointerCapture(e.pointerId); } catch (er) { } }; ar.onpointermove = e => { if (e.buttons || e.pointerType !== 'mouse') mv(e); };
      const its = op.map((o, k) => { const d = document.createElement('div'); d.className = 'rto-drop' + sz(o); d.textContent = o; const x = W * (.18 + k * .32); d.style.left = x + 'px'; ar.appendChild(d); return { d, o, x, y: -60 - k * 100, v: H / 4.8 }; });
      let last = performance.now();
      const step = now => { if (!S.live || S.done || S.cur !== it || !ar.isConnected) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
        for (const q of its) { if (q.gone) continue; q.y += q.v * dt; q.d.style.top = q.y + 'px'; const by = H - 70; if (q.y + 44 >= by && q.y < by + 14 && Math.abs(q.x - bx) < 72) { S.done = true; const good = q.o === it.ans; q.d.classList.add(good ? 'r' : 'w'); after(B, S, it, good, q.o, 1100, 2000); return; } if (q.y > H) { q.gone = true; q.d.remove(); } }
        if (its.every(q => q.gone)) { S.done = true; S.score(false, it); const fb = B.querySelector('.rto-fb'); fb.innerHTML = `<span class="no">¡Se cayeron todas! Era: <b>${esc(it.txt)}</b></span>`; stopA(); play(it.after); S.later(() => S.round(), 1900); return; }
        S.raf = requestAnimationFrame(step); }; S.raf = requestAnimationFrame(step); }; S.round(); },
    rasca(B, S) { let floors = 0; S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, `<div class="rto-area rto-sky2"><div class="rto-crane"></div><div class="rto-hook"><div class="rto-blk"></div></div><div class="rto-tower">${'<div></div>'.repeat(Math.min(floors, 7))}</div><button type="button" class="rto-drop2">SOLTAR</button></div>`);
      const ar = B.querySelector('.rto-area'), blk = ar.querySelector('.rto-blk'), tw = ar.querySelector('.rto-tower'); let j = 0; const show = () => { blk.textContent = op[j % op.length]; blk.className = 'rto-blk' + sz(op[j % op.length]); }; show(); const cyc = setInterval(() => { if (S.done || !ar.isConnected) return clearInterval(cyc); j++; show(); }, 1300); S.tm.push(cyc);
      ar.querySelector('.rto-drop2').onclick = () => { if (S.done || !S.live) return; S.done = true; clearInterval(cyc); const good = blk.textContent === it.ans; const hk = ar.querySelector('.rto-hook'); const tr = new DOMMatrix(getComputedStyle(hk).transform).m41; hk.style.animation = 'none'; hk.style.transform = `translateX(${tr}px)`;
        if (good) { const dy = ar.clientHeight - 8 - 26 - blk.offsetHeight - 70 - Math.min(floors, 7) * 24; blk.style.setProperty('--dy', dy + 'px'); blk.classList.add('fall'); floors++; setTimeout(() => tw.insertAdjacentHTML('beforeend', '<div></div>'), 480); } else { blk.classList.add('off'); tw.classList.add('sh'); }
        after(B, S, it, good, blk.textContent, 1100, 2000); };
      S.later(() => { if (S.done || S.cur !== it) return; clearInterval(cyc); }, 9300); timeout(B, S, it, 9400); }; S.round(); },
    penalti(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts); setup(B, S, it, `<div class="rto-area rto-pitch"><img class="rto-kp" src="${IMG}keeper.webp" alt=""><img class="rto-ball" src="${IMG}ball.png" alt=""><div class="rto-shots">${op.map((o, k) => `<button type="button" class="rto-sh${sz(o)}"><small>${['↖ Izquierda', '↑ Centro', '↗ Derecha'][k] || ''}</small>${esc(o)}</button>`).join('')}</div></div>`);
      const ar = B.querySelector('.rto-area'), kp = ar.querySelector('.rto-kp'), bl = ar.querySelector('.rto-ball'), W = ar.clientWidth;
      kp.style.height = (.27 * W) + 'px'; kp.style.top = (.125 * W) + 'px'; kp.style.setProperty('--sw', (.09 * W) + 'px'); bl.style.width = bl.style.height = (.1 * W) + 'px'; bl.style.top = (.6 * W) + 'px';
      const TG = [[.17, .13], [.5, .1], [.83, .13]];
      ar.querySelectorAll('.rto-sh').forEach((b, k) => b.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = op[k] === it.ans; bl.style.left = (TG[k][0] * 100) + '%'; bl.style.top = (TG[k][1] * W) + 'px'; bl.style.width = bl.style.height = (.055 * W) + 'px'; bl.classList.add('kick'); const side = good ? (k === 0 ? 2 : 0) : k; kp.style.animation = 'none'; kp.classList.add(['dl', 'up', 'dr'][side]);
        setTimeout(() => { b.classList.add(good ? 'r' : 'w'); if (good) ar.insertAdjacentHTML('beforeend', '<div class="rto-gol">¡GOOOL!</div>'); else { ar.querySelectorAll('.rto-sh')[op.indexOf(it.ans)].classList.add('r'); bl.classList.add('saved'); } }, 430); after(B, S, it, good, op[k], 1300, 2100, '¡Atajada! Era'); });
      timeout(B, S, it, 8000); }; S.round(); },
    ranita(B, S) { S.round = () => { const it = S.next(), op = shuf(it.opts.slice(0, 2)); setup(B, S, it, `<div class="rto-area rto-lake"><div class="rto-frog"><img src="${FROG}" alt=""></div></div>`);
      const ar = B.querySelector('.rto-area'), fr = ar.querySelector('.rto-frog');
      op.forEach((o, k) => { const p = document.createElement('button'); p.type = 'button'; p.className = 'rto-pad ' + (k ? 'rr' : 'l') + sz(o); p.textContent = o; p.style.setProperty('--t', '7.5s');
        p.onclick = () => { if (S.done || !S.live) return; S.done = true; const good = o === it.ans; ar.querySelectorAll('.rto-pad').forEach(x => x.style.animationPlayState = 'paused'); fr.classList.add(k ? 'jr' : 'jl'); setTimeout(() => { if (good) p.classList.add('ok'); else { p.classList.add('bad'); fr.classList.add('sp'); } }, 450); after(B, S, it, good, o, 1200, 2000, '¡Splash! Era'); }; ar.appendChild(p); });
      timeout(B, S, it, 7500, '¡Las hojas se hundieron! Era:'); }; S.round(); },
    generic(B, S, it) { GAMES.burbujas(B, S); }
  };
  const FROG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><defs><radialGradient id="fg" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#86efac"/><stop offset=".6" stop-color="#22c55e"/><stop offset="1" stop-color="#15803d"/></radialGradient><radialGradient id="bl" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ecfccb"/><stop offset="1" stop-color="#bef264"/></radialGradient></defs><ellipse cx="60" cy="94" rx="40" ry="5" fill="#000" opacity=".18"/><ellipse cx="28" cy="84" rx="17" ry="9" fill="#16a34a"/><ellipse cx="92" cy="84" rx="17" ry="9" fill="#16a34a"/><ellipse cx="60" cy="64" rx="40" ry="30" fill="url(#fg)"/><ellipse cx="60" cy="72" rx="24" ry="17" fill="url(#bl)"/><circle cx="38" cy="32" r="17" fill="url(#fg)"/><circle cx="82" cy="32" r="17" fill="url(#fg)"/><circle cx="38" cy="31" r="12" fill="#fff"/><circle cx="82" cy="31" r="12" fill="#fff"/><circle cx="40" cy="33" r="7" fill="#0f172a"/><circle cx="80" cy="33" r="7" fill="#0f172a"/><circle cx="42.5" cy="30" r="2.6" fill="#fff"/><circle cx="82.5" cy="30" r="2.6" fill="#fff"/><ellipse cx="34" cy="56" rx="6" ry="3.5" fill="#f9a8d4" opacity=".8"/><ellipse cx="86" cy="56" rx="6" ry="3.5" fill="#f9a8d4" opacity=".8"/><path d="M44 54 Q60 68 76 54" fill="none" stroke="#14532d" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="34" cy="90" rx="9" ry="4" fill="#15803d"/><ellipse cx="86" cy="90" rx="9" ry="4" fill="#15803d"/></svg>');
  function clockSVG(h, m) {
    const ma = m * 6, ha = (h % 12) * 30 + m * .5, R = Math.PI / 180; let t = '';
    for (let i = 0; i < 60; i++) { const a = i * 6 * R, L = i % 5 ? 3 : 7; t += `<line x1="${50 + 40 * Math.sin(a)}" y1="${50 - 40 * Math.cos(a)}" x2="${50 + (40 - L) * Math.sin(a)}" y2="${50 - (40 - L) * Math.cos(a)}" stroke="#1f2937" stroke-width="${i % 5 ? .6 : 1.8}"/>`; }
    const n = [12, 3, 6, 9].map((v, k) => `<text x="${50 + 29 * Math.sin(k * 90 * R)}" y="${50 - 29 * Math.cos(k * 90 * R) + 4}" text-anchor="middle" font-family="Helvetica,Arial" font-weight="700" font-size="11" fill="#111">${v}</text>`).join('');
    const hand = (ang, len, w, c) => `<line x1="${50 - 6 * Math.sin(ang * R)}" y1="${50 + 6 * Math.cos(ang * R)}" x2="${50 + len * Math.sin(ang * R)}" y2="${50 - len * Math.cos(ang * R)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 100 100"><defs><radialGradient id="rimg" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fafafa"/><stop offset=".55" stop-color="#b8bec6"/><stop offset="1" stop-color="#4b5563"/></radialGradient><radialGradient id="faceg" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e5e7eb"/></radialGradient></defs><circle cx="50" cy="50" r="49" fill="url(#rimg)"/><circle cx="50" cy="50" r="44" fill="#6b7280"/><circle cx="50" cy="50" r="43" fill="url(#faceg)"/>${t}${n}<g opacity=".25" transform="translate(1.2,1.6)">${hand(ha, 22, 4.5, '#000')}${hand(ma, 34, 3, '#000')}</g>${hand(ha, 22, 4.5, '#111')}${hand(ma, 34, 3, '#111')}<circle cx="50" cy="50" r="3.2" fill="#e63946"/><path d="M14 38 A38 38 0 0 1 70 13 A44 30 0 0 0 14 38Z" fill="#fff" opacity=".35"/></svg>`;
  }
  // registrar el paso en el motor de lecciones
  const reg = () => { if (window.M1A) { window.M1A.reto = (stage, p) => run(stage, p); return true; } return false; };
  if (!reg()) document.addEventListener('DOMContentLoaded', reg);
})();
