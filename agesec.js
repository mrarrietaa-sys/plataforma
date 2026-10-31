/* v406 · Kids y Teens: secciones con experiencia propia (mismo contenido que adultos, otra forma de vivirlo)
   - Repaso de la lección anterior → Kids: Cofre de recuerdos · Teens: Swipe
   - Explicación → Kids: Cómic de Mr. Arrieta + Pega el sticker · Teens: Historias (stories) + Encuesta rápida
   Después de la explicación sigue la práctica de vocabulario con voz (la misma de adultos, obligatoria). */
(function () {
  const M = () => window.M1, A = () => window.M1A;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SV = (d, c) => `<svg class="as-i${c ? ' ' + c : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I = {
    vol: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>', mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    ck: '<path d="M5 12.5 10 17l9-10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', chest: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 9a9 5 0 0 1 18 0M10 13h4v3h-4z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', l: '<path d="m15 6-6 6 6 6"/>', r: '<path d="m9 6 6 6-6 6"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'
  };
  const ag = () => { try { return M().ageGroup(); } catch (e) { return 'adult'; } };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = (L, k = 'en') => L.filter((v, i, a) => v && v[k] && a.findIndex(x => x[k] === v[k]) === i);
  const noEmoji = s => String(s || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').trim();
  const clean = s => noEmoji(String(s || '').replace(/<(?!\/?(b|i|br|u)\b)[^>]*>/gi, ''));
  const paras = (p) => { const t = String(p.tip || ''); let L = t.split(/<\/p>/i).map(x => clean(x.replace(/<p[^>]*>/gi, ''))).filter(x => x.replace(/<[^>]+>/g, '').trim().length > 2); if (!L.length && t) L = [clean(t)]; for (let j = 0; j < L.length - 1; j++) if (/:\s*$/.test(L[j].replace(/<[^>]+>/g, '').trim())) { L[j] += '<br>' + L[j + 1]; L.splice(j + 1, 1); } return L; };
  const H = (s) => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const play = (au) => { try { return M().play(au); } catch (e) { return Promise.resolve(); } };
  const sfx = (k) => { try { M().sfx(k); } catch (e) { } };
  const weak = (it, ok) => { try { ok ? M().okWeak(it.en) : M().addWeak(it.en, it.au); } catch (e) { } };
  function frame(stage, lbl, title, ins) { stage.classList.toggle('dk', ag() === 'teens'); stage.classList.add('as-stage', 'as-' + ag()); return A().head(stage, { lbl, title, ins }); }

  /* =================== REPASO =================== */
  async function review(stage, p) {
    const pv = M().prevPart(p); if (!pv) return null;
    const pool = uniq(pv.vocab || []).filter(x => x.au); if (pool.length < 3) return null;
    return ag() === 'kids' ? chests(stage, pv, pool) : swipe(stage, pv, pool); // v415: adultos también tienen el swipe (versión sobria)
  }
  // 👧 Cofre de recuerdos
  async function chests(stage, pv, pool) {
    const items = shuffle(pool).slice(0, Math.min(window.__V9 ? 3 : 6, pool.length)); let cur = 0, c = 0; const missed = [], res = [];
    const body = frame(stage, 'Review', 'Cofre de recuerdos', `Abre cada cofre: hay una palabra de <b>${esc(pv._t ? pv._t.title : 'la lección pasada')}</b>.`);
    body.innerHTML = `<div class="as-chests">${items.map((_, i) => `<button type="button" class="as-ch" data-i="${i}" disabled>${SV(I.chest)}<span>?</span></button>`).join('')}</div>
      <div class="as-kbar"><img class="as-mr" src="mra-wink.webp" alt="Mr. Arrieta"><div class="as-say" id="as-say">¡Toca el cofre que brilla!</div></div><div class="as-stars" id="as-st"></div><div id="as-open"></div>`;
    const say = t => { body.querySelector('#as-say').innerHTML = t; };
    const stars = () => { body.querySelector('#as-st').innerHTML = 'Tesoros ' + items.map((_, i) => `<i class="${res[i] === true ? 'on' : ''}">${SV(I.star)}</i>`).join(''); };
    const glow = () => { body.querySelectorAll('.as-ch').forEach((b, i) => { const on = i === cur; b.classList.toggle('now', on); b.disabled = !on; if (!b.classList.contains('ok') && !b.classList.contains('miss')) b.querySelector('span').textContent = on ? '¡Ábreme!' : '?'; }); };
    stars(); glow();
    await new Promise(done => {
      const open = async (i) => {
        const it = items[i], b = body.querySelector(`.as-ch[data-i="${i}"]`); b.classList.remove('now'); b.classList.add('opening'); sfx('flip');
        const box = body.querySelector('#as-open'); let tries = 0;
        box.innerHTML = `<div class="as-tre"><span class="as-tl">TESORO ${i + 1} DE ${items.length}</span><div class="as-tph">${M().photo(it.img)}</div><div class="as-tw">${esc(it.en)}</div><div class="as-te">${esc(it.es || '')}</div>
          <div class="as-tb"><button type="button" class="as-bw" id="as-ls">${SV(I.vol)}Escuchar</button><button type="button" class="as-bk" id="as-say2">${SV(I.mic)}${M().canSR ? '¡Dilo!' : 'Ya lo dije'}</button></div><div class="as-tr" id="as-tr"></div></div>`;
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); await sleep(250); play(it.au);
        box.querySelector('#as-ls').onclick = () => play(it.au);
        const finish = (ok) => { res[i] = ok; if (ok) { c++; b.classList.add('ok'); b.innerHTML = `<span class="as-chp">${M().photo(it.img)}</span><span>${esc(it.en)}</span>`; } else { missed.push(it); b.classList.add('miss'); b.innerHTML = `<span class="as-chp">${M().photo(it.img)}</span><span>${esc(it.en)}</span>`; }
          weak(it, ok); stars(); cur++; box.innerHTML = ''; if (cur >= items.length) { say(c === items.length ? '¡Abriste todos los cofres! ¡Excelente!' : `¡Muy bien! ${c} de ${items.length} tesoros.`); body.querySelector('.as-mr').src = 'mra-celebrate.webp'; sfx('win'); done(); } else { say(ok ? '¡Perfecto! Toca el siguiente cofre.' : 'Sigue con el siguiente cofre. ¡Tú puedes!'); glow(); } };
        box.querySelector('#as-say2').onclick = async (e) => {
          const bt = e.currentTarget; if (!M().canSR) { sfx('ok'); finish(true); return; }
          bt.disabled = true; const tr = box.querySelector('#as-tr'); tr.textContent = 'Te escucho…';
          let r = null; try { r = await M().recordScore(it.en, Math.max(3000, it.en.split(' ').length * 900 + 1800)); } catch (er) { r = null; }
          bt.disabled = false; tries++;
          const ok = r && (r.self || (r.score != null && r.score >= 60));
          if (ok) { tr.innerHTML = `<b class="as-ok">${SV(I.ck)}¡Lo dijiste muy bien!</b>`; sfx('ok'); try { M().praise(); } catch (er) { } setTimeout(() => finish(true), 900); return; }
          sfx('bad'); tr.innerHTML = `<span>Casi. Escucha otra vez y repite despacio.</span>${tries >= 2 ? '<button type="button" class="as-lnk" id="as-skip">Siguiente cofre</button>' : ''}`;
          const sk = tr.querySelector('#as-skip'); if (sk) sk.onclick = () => finish(false);
        };
      };
      body.querySelectorAll('.as-ch').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i === cur && !b.classList.contains('opening')) open(i); });
    });
    await A().waitNext(stage, 'Continuar');
    return A().result(c, items.length, 'listening', missed);
  }
  // 🧑‍🎤 Swipe
  async function swipe(stage, pv, pool) {
    const items = shuffle(pool).slice(0, Math.min(window.__V9 ? 3 : 6, pool.length)).map(it => { const tr = Math.random() < .5; const o = tr ? it : shuffle(pool.filter(x => x.en !== it.en && x.es && x.es !== it.es))[0] || it; return { it, shown: o.es, truth: tr || o === it }; });
    let i = 0, c = 0, streak = 0, best = 0; const missed = [];
    const body = frame(stage, 'Review', ag() === 'adult' ? 'Repaso rápido' : 'Recap', `Repaso de <b>${esc(pv._t ? pv._t.title : 'la lección pasada')}</b>. ¿La traducción es correcta? Desliza a la derecha si sí, a la izquierda si no.`);
    body.innerHTML = `<div class="as-sbar">${items.map(() => '<i></i>').join('')}</div><div class="as-deck" id="as-deck"></div>
      <div class="as-sw"><button type="button" class="as-no" id="as-n">${SV(I.x)}<span>No</span></button><button type="button" class="as-yes" id="as-y">${SV(I.ck)}<span>Sí</span></button></div><p class="as-hint">En PC también puedes usar las flechas ← →</p>`;
    const deck = body.querySelector('#as-deck');
    await new Promise(done => {
      let busy = false, card = null;
      const show = () => {
        body.querySelectorAll('.as-sbar i').forEach((x, k) => { x.className = k < i ? 'on' : k === i ? 'cur' : ''; });
        const q = items[i]; deck.innerHTML = `<div class="as-card as-b2"></div><div class="as-card as-b1"></div>${ag() !== 'kids' && q.it.img ? `<div class="as-card as-top fc9"><div class="fc9-ph">${q.it.img ? M().photo(q.it.img) : ''}<em>TARJETA ${i + 1} DE ${items.length}</em><button type="button" class="as-pl fc9-pl" aria-label="Escuchar">${SV(I.vol)}</button></div><div class="fc9-bd"><div class="as-en">${esc(q.it.en)}</div><small>¿Significa…?</small><div class="as-es">${esc(q.shown)}</div></div><span class="as-stamp"></span></div>` : `<div class="as-card as-top"><span class="as-cl">${ag() === 'adult' ? 'TARJETA' : 'CARD'} ${i + 1} DE ${items.length}</span><div class="as-en">${esc(q.it.en)}</div><div class="as-eq">=</div><div class="as-es">${esc(q.shown)}</div><button type="button" class="as-pl">${SV(I.vol)}Escuchar</button><span class="as-stamp"></span></div>`}`;
        card = deck.querySelector('.as-top'); card.querySelector('.as-pl').onclick = (e) => { e.stopPropagation(); play(q.it.au); }; setTimeout(() => play(q.it.au), 250); drag(card);
      };
      const answer = async (yes) => {
        if (busy || !card) return; busy = true; const q = items[i]; const ok = yes === q.truth;
        if (ok) { c++; streak++; best = Math.max(best, streak); sfx('ok'); } else { streak = 0; missed.push(q.it); sfx('bad'); }
        weak(q.it, ok);
        const st = card.querySelector('.as-stamp'); st.className = 'as-stamp ' + (ok ? 'ok' : 'no'); st.textContent = ok ? '¡BIEN!' : (q.truth ? 'SÍ ERA' : 'NO ERA');
        card.style.transition = 'transform .45s ease, opacity .45s'; await sleep(550); card.style.transform = `translateX(${yes ? 130 : -130}%) rotate(${yes ? 18 : -18}deg)`; card.style.opacity = '0'; await sleep(420);
        i++; busy = false; if (i >= items.length) { done(); return; } show();
      };
      const drag = (el) => { let x0 = null, dx = 0; el.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; x0 = e.clientX; dx = 0; el.setPointerCapture(e.pointerId); el.style.transition = 'none'; });
        el.addEventListener('pointermove', e => { if (x0 == null) return; dx = e.clientX - x0; el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; el.classList.toggle('lean-y', dx > 40); el.classList.toggle('lean-n', dx < -40); });
        const up = () => { if (x0 == null) return; x0 = null; el.classList.remove('lean-y', 'lean-n'); if (Math.abs(dx) > 90) answer(dx > 0); else { el.style.transition = 'transform .2s'; el.style.transform = ''; } };
        el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); };
      body.querySelector('#as-y').onclick = () => answer(true); body.querySelector('#as-n').onclick = () => answer(false);
      const key = (e) => { if (!stage.isConnected) return removeEventListener('keydown', key); if (e.key === 'ArrowRight') answer(true); if (e.key === 'ArrowLeft') answer(false); }; addEventListener('keydown', key);
      show();
    });
    body.innerHTML = `<div class="as-sbar">${items.map(() => '<i class="on"></i>').join('')}</div><div class="as-kpi"><div><b>${c}/${items.length}</b><small>correctas</small></div><div><b>x${best}</b><small>mejor racha</small></div><div><b>${c === items.length ? '100%' : Math.round(c / items.length * 100) + '%'}</b><small>acierto</small></div></div>
      ${missed.length ? `<div class="as-rdes"><span class="as-cl">REPASA ESTAS</span>${missed.map(m => `<div class="as-rr"><i class="no">${SV(I.x)}</i><span><b>${esc(m.en)}</b> = ${esc(m.es)}</span><button type="button" class="as-pl sm" data-au="${esc(m.au)}">${SV(I.vol)}</button></div>`).join('')}</div>` : `<div class="as-res"><div class="as-rr"><i class="ok">${SV(I.ck)}</i><span>¡Perfecto! Recordaste todo lo de la lección pasada.</span></div></div>`}`;
    body.querySelectorAll('[data-au]').forEach(b => b.onclick = () => play(b.dataset.au)); sfx(c >= items.length / 2 ? 'win' : 'ok');
    await A().waitNext(stage, 'Continuar');
    return A().result(c, items.length, 'listening', missed);
  }

  /* =================== EXPLICACIÓN =================== */
  async function learn(stage, p) {
    const P = paras(p), F = (p.fill || []).filter(f => f && f.s && f.a && f.o && /_{2,}/.test(f.s));
    const mlEl = A().ml10 ? A().ml10(p, null, { noFinal: true }) : null; /* v463: misma mini lección nueva (regla corta + error tachado + frases con audio) */
    if (mlEl) { const body = frame(stage, 'Explanation', 'La regla de hoy', ''); body.appendChild(mlEl); sfx('flip'); await A().waitNext(stage, '¡Ya entendí!'); }
    else if (P.length) { if (ag() === 'teens') await stories(stage, p, P); else await comic(stage, p, P); }
    let sc = null; if (F.length) sc = ag() === 'teens' ? await poll(stage, F.slice(0, 3)) : await stickers(stage, F.slice(0, 4));
    stage.classList.remove('as-stage', 'dk'); // v415: sin "Listen and repeat" repetido (las palabras ya se practicaron en el calentamiento y se dicen en la tarea oral)
    return sc && sc.n ? A().result(sc.c, sc.n, 'reading') : A().result(1, 1, 'reading');
  }
  // 👧 Cómic de Mr. Arrieta
  async function comic(stage, p, P) {
    const L = P.length > 3 ? [P[0], P[1], P.slice(2).join('<br>')] : P; const POSE = ['point', 'present', 'idea'];
    const body = frame(stage, 'Explanation', 'El cómic del día', 'Lee las viñetas de Mr. Arrieta. ¡Es la regla de hoy!');
    body.innerHTML = `<div class="as-comic n${L.length}">${L.map((t, i) => `<div class="as-pan as-p${i + 1}"><span class="as-n">${i + 1}</span><div class="as-bub">${t}</div><img src="mra-${POSE[i]}.webp" alt="Mr. Arrieta" draggable="false"></div>`).join('')}</div>`;
    sfx('flip'); await A().waitNext(stage, '¡Ya entendí!');
  }
  // 👧 Pega el sticker
  async function stickers(stage, F) {
    let i = 0, c = 0; const res = [];
    const body = frame(stage, 'Explanation', 'Pega el sticker', 'Toca la palabra que falta en la frase.');
    const draw = () => {
      const f = F[i]; const parts = f.s.split(/_{2,}/); const opts = shuffle([f.a].concat(f.o)).slice(0, 4);
      body.innerHTML = `<div class="as-cnt">${i + 1} de ${F.length}</div><div class="as-sent">${esc(parts[0])}<span class="as-slot" id="as-slot">?</span>${esc(parts[1] || '')}</div>
        <div class="as-stk">${opts.map(o => `<button type="button" class="as-st" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="as-kbar"><img class="as-mr" src="mra-point.webp" alt="Mr. Arrieta"><div class="as-say" id="as-say">¿Cuál sticker va aquí?</div></div>
        <div class="as-stars">Estrellas ${F.map((_, k) => `<i class="${res[k] ? 'on' : ''}">${SV(I.star)}</i>`).join('')}</div>`;
      let miss = false;
      body.querySelectorAll('.as-st').forEach(b => b.onclick = async () => {
        if (b.disabled) return;
        if (b.dataset.o === f.a) { body.querySelectorAll('.as-st').forEach(x => x.disabled = true); b.classList.add('use'); const sl = body.querySelector('#as-slot'); sl.textContent = f.a; sl.classList.add('ok'); sfx('ok');
          if (!miss) { c++; res[i] = true; } body.querySelector('.as-mr').src = 'mra-thumbs.webp'; body.querySelector('#as-say').innerHTML = '¡Muy bien!' + (f.h ? ` <b>${esc(f.h)}</b>` : '');
          if (f.au) await play(f.au); else await sleep(900); await sleep(400); i++; if (i < F.length) draw(); else fin(); }
        else { miss = true; b.classList.add('shake'); sfx('bad'); setTimeout(() => b.classList.remove('shake'), 500); body.querySelector('#as-say').innerHTML = f.h ? `Pista: <b>${esc(f.h)}</b>` : 'Casi. ¡Intenta con otro!'; }
      });
    };
    let fin; await new Promise(r => { fin = r; draw(); });
    body.querySelector('.as-say').innerHTML = c === F.length ? '¡Todos los stickers perfectos!' : `¡Bien hecho! ${c} de ${F.length} a la primera.`; body.querySelector('.as-mr').src = 'mra-celebrate.webp'; sfx('win');
    await A().waitNext(stage, 'Continuar'); return { c, n: F.length };
  }
  // 🧑‍🎤 Historias (stories)
  async function stories(stage, p, P) {
    const S = P.concat((p.tips || []).map(clean)).slice(0, 5); let i = 0;
    const body = frame(stage, 'Explanation', 'Grammar drop', 'Toca a la derecha para seguir y a la izquierda para volver.');
    await new Promise(done => {
      const draw = () => {
        body.innerHTML = `<div class="as-sbar">${S.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="as-sh"><span class="as-av">MR</span><b>mr.arrieta</b><span>Grammar drop · ${i + 1} de ${S.length}</span></div>
          <div class="as-story"><span class="as-cl">${i < P.length ? 'LA REGLA' : 'TIP DEL PROFE'}</span><div class="as-stx">${S[i]}</div><img class="as-rk" src="mra-x-rocket5.webp" alt="" draggable="false"><button type="button" class="as-tapl" aria-label="Anterior"></button><button type="button" class="as-tapr" aria-label="Siguiente"></button></div>
          <div class="as-nav"><button type="button" class="as-bw" id="as-pv" ${i ? '' : 'disabled'}>${SV(I.l)}Atrás</button><button type="button" class="as-gt" id="as-nx">${i < S.length - 1 ? 'Siguiente' : 'Listo'}${SV(I.r)}</button></div>`;
        const nx = () => { sfx('tap'); if (i < S.length - 1) { i++; draw(); } else done(); }, pv = () => { if (i) { i--; draw(); } };
        body.querySelector('#as-nx').onclick = nx; body.querySelector(".as-tapr").onclick = nx; body.querySelector('#as-pv').onclick = pv; body.querySelector(".as-tapl").onclick = pv;
      };
      draw();
    });
  }
  // 🧑‍🎤 Encuesta rápida
  async function poll(stage, F) {
    let i = 0, c = 0, streak = 0;
    const body = frame(stage, 'Explanation', 'Quick poll', 'Elige la palabra que falta.');
    await new Promise(done => {
      const draw = () => {
        const f = F[i]; const opts = shuffle([f.a].concat(f.o)).slice(0, 4);
        body.innerHTML = `<div class="as-sbar">${F.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="as-poll"><span class="as-cl">POLL ${i + 1} DE ${F.length}</span><h3>"${esc(f.s.replace(/_{2,}/, '___'))}"</h3>
          ${opts.map(o => `<button type="button" class="as-opt" data-o="${esc(o)}"><span>${esc(o)}</span></button>`).join('')}<div id="as-fb"></div></div>`;
        body.querySelectorAll('.as-opt').forEach(b => b.onclick = async () => {
          body.querySelectorAll('.as-opt').forEach(x => { x.disabled = true; if (x.dataset.o === f.a) x.classList.add('ok'); });
          const ok = b.dataset.o === f.a; if (ok) { c++; streak++; sfx('ok'); } else { streak = 0; b.classList.add('bad'); sfx('bad'); }
          body.querySelector('#as-fb').innerHTML = `<div class="as-fbk ${ok ? 'ok' : 'no'}">${SV(ok ? I.ck : I.bulb)}<span>${ok ? 'Correcto.' : 'Era <b>' + esc(f.a) + '</b>.'} ${f.full ? '<b>' + esc(f.full) + '</b>' : ''}${f.h ? ' · ' + esc(f.h) : ''}</span></div><button type="button" class="as-gt" id="as-nx">${i < F.length - 1 ? 'Siguiente' : 'Ver resultado'}${SV(I.r)}</button>`;
          if (f.au) play(f.au);
          body.querySelector('#as-nx').onclick = () => { i++; if (i < F.length) draw(); else done(); };
        });
      };
      draw();
    });
    body.innerHTML = `<div class="as-kpi"><div><b>${c}/${F.length}</b><small>correctas</small></div><div><b>${streak}</b><small>racha final</small></div><div><b>${c === F.length ? '100%' : Math.round(c / F.length * 100) + '%'}</b><small>acierto</small></div></div>`;
    sfx(c === F.length ? 'win' : 'ok'); await A().waitNext(stage, 'Continuar'); return { c, n: F.length };
  }

  /* =================== ESCUCHA Y PRACTICA (preguntas clave) =================== */
  const RS = async (tgt, ms) => { try { return await M().recordScore(tgt, ms); } catch (e) { return null; } };
  const judge = (r, tgt, blank) => { if (!r) return false; if (r.self) return true; if (r.score == null) return false; const w = (r.heard || (r.alts || [])[0] || '').trim().split(/\s+/).filter(Boolean).length; if (blank) return w >= 1; if (r.heard && M().readJudge) return M().readJudge('', tgt, [r.heard]).ok; return r.score >= 75; }; // v494: más exigente al repetir // respuestas personales (nombre, letra, edad…): basta con que responda
  // v420: respuesta libre: se acepta lo que diga; solo se corrige gramática/pronunciación
  const FJ = (r, k, tgt) => { if (!r) return { ok: false, heard: '' }; if (r.self) return { ok: true, heard: '' }; return M().readJudge ? M().readJudge(k.q, tgt, r.alts || []) : M().freeJudge(k.q, tgt.replace(/___/g, ''), r.alts || []); };
  const fixHTML = (f) => f && f.fix ? `<div class="as-fbk fx">${SV(I.bulb)}<span>Mejor dilo así: <b>${esc(f.fix)}</b></span></div>` : '';
  async function keyq(stage, p) {
    const Q = (p.keyq || []).filter(k => k && k.q && k.a); if (!Q.length) return null;
    return ag() === 'teens' ? voiceNotes(stage, Q) : interview(stage, Q);
  }
  // 👧 Entrevista con Mr. Arrieta
  /* v466 · tarjeta «Lee esta respuesta en voz alta» con su traducción (Kids y Teens, igual que adultos) */
  function readCard(k, tgt, blank, chat) { const tes = window.MRKQAES && (MRKQAES[k.a] || MRKQAES[tgt]);
    return `<div class="as-read${chat ? ' ch' : ''}"><small>Lee esta respuesta en voz alta</small><b>${esc(tgt).replace(/___/g, '<u>___</u>')}</b>${tes ? `<span class="as-rdes">${esc(String(tes).split(' / ')[0])}</span>` : ''}${blank ? '<em>Completa el ___ con tu información</em>' : ''}${chat && k.aau ? `<button type="button" class="as-rdp">${SV(I.vol)}</button>` : ''}</div>`; }
  async function interview(stage, Q) {
    let c = 0; const POSE = ['wink', 'point', 'present', 'idea', 'smile'];
    for (let i = 0; i < Q.length; i++) {
      if (!stage.isConnected) break; const k = Q[i], tgt = k.a.split(' / ')[0], blank = tgt.includes('___');
      const body = frame(stage, 'Listen & practice', 'Entrevista con Mr. Arrieta', 'Escucha su pregunta y lee la respuesta en voz alta.');
      body.innerHTML = `<div class="as-cnt">PREGUNTA ${i + 1} DE ${Q.length}</div><div class="as-iv"><img class="as-ivm" src="mra-${POSE[i % POSE.length]}.webp" alt="Mr. Arrieta"><div class="as-ivb"><b>${esc(k.q)}</b><small>${esc(k.es || '')}</small><button type="button" class="as-bw sm" id="as-ql">${SV(I.vol)}Escuchar</button></div></div>
        ${readCard(k, tgt, blank)}<div class="as-tb"><button type="button" class="as-bw" id="as-hint">${SV(I.vol)}Respuesta</button><button type="button" class="as-bk" id="as-mic">${SV(I.mic)}¡Léela!</button></div><div class="as-tr" id="as-tr"></div>
        <div class="as-stars">Estrellas ${Q.map((_, j) => `<i class="${j < c ? 'on' : ''}">${SV(I.star)}</i>`).join('')}</div>`;
      await sleep(200); if (k.qau) { await play(k.qau); if (k.aau && stage.isConnected) { await sleep(250); await play(k.aau); } }
      const ok = await new Promise(done => { let tries = 0;
        body.querySelector('#as-ql').onclick = () => k.qau && play(k.qau);
        body.querySelector('#as-hint').onclick = () => { M().stop && M().stop(); if (k.aau) play(k.aau); };
        body.querySelector('#as-mic').onclick = async (e) => { const bt = e.currentTarget; bt.disabled = true; const tr = body.querySelector('#as-tr'); tr.textContent = 'Te escucho…';
          const r = await RS(tgt.replace(/___/g, ''), Math.max(4000, tgt.split(' ').length * 900 + 2200)); bt.disabled = false; tries++;
          const fj = FJ(r, k, tgt);
          if (fj.ok) { sfx('ok'); try { M().praise(); } catch (er) { } tr.innerHTML = `<b class="as-ok">${SV(I.ck)}¡Muy bien!</b>${fixHTML(fj)}`; setTimeout(() => done(true), fj.fix ? 3200 : 1300); return; }
          sfx('bad'); tr.innerHTML = `${fj.gram ? 'Casi. Se dice: “' + fj.fix + '”. Inténtalo otra vez.' : fj.spell ? 'Las letras no coinciden. Se deletrea: ' + fj.fix + '.' : fj.rep ? 'Repetiste la pregunta. Ahora <b>respóndela</b> con tus palabras.' : fj.off ? 'Tu respuesta no corresponde a la pregunta. Escúchala otra vez y responde sobre eso.' : fj.heard ? 'Casi. Escúchala y léela otra vez, despacio.' : 'No te escuché bien. Intenta otra vez, despacio.'}${tries >= 2 ? '<button type="button" class="as-lnk" id="as-nx">Siguiente</button>' : ''}`;
          if (tries >= 2) { body.querySelector('#as-nx').onclick = () => done(false); } };
      });
      if (ok) c++;
    }
    const body = frame(stage, 'Listen & practice', '¡Entrevista terminada!', '');
    body.innerHTML = `<div class="as-tre"><img src="mra-celebrate.webp" alt="Mr. Arrieta" style="height:150px"><div class="as-tw">${c} de ${Q.length}</div><div class="as-te">respuestas correctas</div><div class="as-stars" style="justify-content:center">${Q.map((_, j) => `<i class="${j < c ? 'on' : ''}">${SV(I.star)}</i>`).join('')}</div></div>`; sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
  }
  // 🧑‍🎤 Notas de voz
  async function voiceNotes(stage, Q) {
    let c = 0, streak = 0, best = 0; const NM = ['Sofi', 'Leo', 'Vale', 'Mateo'][Math.floor(Math.random() * 4)];
    const body = frame(stage, 'Listen & practice', 'Voice notes', `${NM} te manda notas de voz. Escúchalas y lee la respuesta en voz alta.`);
    body.innerHTML = `<div class="as-chat"><div class="as-chh"><span class="as-av">${NM[0]}</span><div><b>${NM}</b><small>en línea</small></div><span class="as-chs" id="as-sk">Racha 0</span></div><div class="as-chb" id="as-cb"></div><div class="as-chi"><span id="as-ci">Escucha la nota de voz…</span><button type="button" class="as-mic" id="as-mic" disabled>${SV(I.mic)}</button></div></div><div class="as-tr" id="as-tr"></div>`;
    const cb = body.querySelector('#as-cb'), mic = body.querySelector('#as-mic'), ci = body.querySelector('#as-ci'), tr = body.querySelector('#as-tr');
    const bars = () => Array.from({ length: 18 }, (_, k) => `<i style="height:${[6, 10, 16, 9, 14, 7, 12, 18, 9, 6, 12, 15, 8, 5, 10, 14, 7, 11][k]}px"></i>`).join('');
    for (let i = 0; i < Q.length; i++) {
      if (!stage.isConnected) break; const k = Q[i], tgt = k.a.split(' / ')[0], blank = tgt.includes('___');
      const vn = H(`<div class="as-vn in"><button type="button" class="as-vp">${SV('<path d="M8 5v14l11-7z"/>')}</button><span class="as-vw">${bars()}</span><small>0:0${Math.min(9, 2 + k.q.split(' ').length)}</small><div class="as-vt">${esc(k.q)}<em>${esc(k.es || '')}</em></div></div>`);
      cb.appendChild(vn); cb.scrollTop = cb.scrollHeight; vn.querySelector('.as-vp').onclick = () => k.qau && play(k.qau); sfx('tap'); await sleep(250); if (k.qau) await play(k.qau);
      { const rb = H(`<div class="as-rd">${readCard(k, tgt, blank, true)}</div>`); cb.appendChild(rb); cb.scrollTop = cb.scrollHeight; const pl = rb.querySelector('.as-rdp'); if (pl) pl.onclick = () => k.aau && play(k.aau); if (k.aau) { await sleep(300); await play(k.aau); } } /* v466: el estudiante lee la respuesta */
      ci.textContent = blank ? 'Léela con tu información' : 'Toca el micrófono y léela'; mic.disabled = false;
      const ok = await new Promise(done => { let tries = 0;
        mic.onclick = async () => { mic.disabled = true; mic.classList.add('rec'); ci.textContent = 'Grabando nota de voz…';
          const r = await RS(tgt.replace(/___/g, ''), Math.max(4000, tgt.split(' ').length * 900 + 2200)); mic.classList.remove('rec'); tries++;
          const fj = FJ(r, k, tgt), good = fj.ok; const said = fj.heard || '';
          const out = H(`<div class="as-vn out ${good ? '' : 'bad'}"><span class="as-vw">${bars()}</span><small>0:0${Math.min(9, 2 + tgt.split(' ').length)}</small>${good && !/___/.test(tgt) ? `<div class="as-vt">${esc(tgt)}</div>` : ''}<span class="as-tick">${good ? '✓✓' : '!'}</span></div>`); cb.appendChild(out); cb.scrollTop = cb.scrollHeight;
          if (good) { sfx('ok'); tr.innerHTML = fixHTML(fj); setTimeout(() => { tr.innerHTML = ''; done(true); }, fj.fix ? 3200 : 900); return; }
          sfx('bad'); mic.disabled = false; ci.textContent = 'Intenta otra vez';
          tr.innerHTML = tries >= 2 ? `<span class="as-hint">${fj.gram ? 'Se dice: <b>' + esc(fj.fix) + '</b>' : fj.spell ? 'Se deletrea: <b>' + fj.fix + '</b>' : 'Escúchala y léela otra vez, despacio.'}</span><button type="button" class="as-gt" id="as-nx">Siguiente nota${SV(I.r)}</button>` : `<span class="as-hint">${fj.gram ? 'Casi. Se dice: “' + fj.fix + '”. Inténtalo otra vez.' : fj.spell ? 'Las letras no coinciden. Se deletrea: ' + fj.fix + '.' : fj.rep ? 'Repetiste la pregunta. Ahora respóndela con tus palabras.' : fj.off ? 'Tu respuesta no corresponde a la pregunta. Escúchala otra vez y responde sobre eso, con tus palabras.' : said ? 'Casi. Escúchala y léela otra vez, despacio.' : 'No te escuché bien. Habla con tu voz normal, cerca del celular.'}</span>`;
          if (tries >= 2) { body.querySelector('#as-nx').onclick = () => { tr.innerHTML = ''; done(false); }; } };
      });
      mic.disabled = true; if (ok) { c++; streak++; best = Math.max(best, streak); } else streak = 0; body.querySelector('#as-sk').textContent = 'Racha ' + streak;
    }
    tr.innerHTML = `<div class="as-kpi"><div><b>${c}/${Q.length}</b><small>respondidas</small></div><div><b>x${best}</b><small>mejor racha</small></div><div><b>${Math.round(c / Q.length * 100)}%</b><small>acierto</small></div></div>`; sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
  }

  /* =================== JUEGOS =================== */
  // v415: palabras "obvias" (letras: G = Letra G) → no se juega a traducir, se juega a escuchar
  const trivial = (V) => V.filter(v => v.en.trim().length <= 2 || String(v.es).toLowerCase().includes(v.en.trim().toLowerCase())).length >= V.length / 2;
  const vocab = (p) => uniq(p.vocab || []).filter(v => v.au && v.es);
  function gamesFor(p) { const V = vocab(p); if (V.length < 4) return []; const S = (p.sentences || []).filter(x => x.en && x.en.split(' ').length >= 3);
    if (ag() === 'teens') return trivial(V) ? ['tgEar'].concat(S.length >= 3 ? ['tgChat'] : []) : ['tgQuiz'].concat(S.length >= 3 ? ['tgChat'] : []).concat(['tgMatch']);
    return ['kgPop', 'kgBasket'].concat(V.filter(v => v.img).length >= 4 ? ['kgAlbum'] : []); }
  // globo de látex (brillo, nudo y cuerda curva) · v415
  const BAL = '<svg class="as-bsv" viewBox="0 0 100 140" aria-hidden="true"><defs><radialGradient id="asgl" cx=".33" cy=".28" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient></defs><path d="M50 4C24 4 8 24 8 48c0 27 22 50 38 56h8c16-6 38-29 38-56C92 24 76 4 50 4z" fill="currentColor"/><path d="M50 4C24 4 8 24 8 48c0 27 22 50 38 56h8c16-6 38-29 38-56C92 24 76 4 50 4z" fill="url(#asgl)"/><path d="M45 104l5 7 5-7z" fill="currentColor"/><path d="M50 111c-6 8 6 14 0 22" stroke="#7b8aa3" stroke-width="1.6" fill="none"/></svg>';
  const burst = (b) => { try { const r = b.getBoundingClientRect(), c = getComputedStyle(b).getPropertyValue('--c'); for (let k = 0; k < 14; k++) { const e = document.createElement('i'); e.className = 'as-bp'; const a = k / 14 * Math.PI * 2, d = 40 + Math.random() * 40; e.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height * .35}px;background:${c};--tx:${Math.cos(a) * d}px;--ty:${Math.sin(a) * d}px;--rt:${Math.random() * 360}deg`; document.body.appendChild(e); setTimeout(() => e.remove(), 650); } } catch (e) { } };
  // 👧 Revienta el globo
  async function kgPop(stage, p) {
    const V = vocab(p), R = shuffle(V).slice(0, Math.min(6, V.length)); let c = 0; const missed = []; const COL = ['#E3242B', '#1d4ed8', '#f59e0b', '#16a34a', '#7c3aed'];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(V.filter(x => x.en !== it.en)).slice(0, 3)));
      const body = frame(stage, 'Practice', 'Revienta el globo', 'Escucha la palabra y revienta el globo correcto.');
      body.innerHTML = `<div class="as-cnt">${i + 1} DE ${R.length}</div><button type="button" class="as-bw" id="as-ag" style="align-self:center">${SV(I.vol)}Escuchar otra vez</button><div class="as-sky">${opts.map((o, k) => `<button type="button" class="as-bal" data-k="${k}" style="--c:${COL[k % 5]};--d:${(k * .4).toFixed(1)}s">${BAL}<span class="${o.en.length > 12 ? 'lg' : ''}">${esc(o.en)}</span></button>`).join('')}</div><div class="as-stars">Globos ${R.map((_, j) => `<i class="${j < c ? 'on' : ''}">${SV(I.star)}</i>`).join('')}</div>`;
      body.querySelector('#as-ag').onclick = () => play(it.au); await sleep(250); play(it.au);
      const ok = await new Promise(done => { let miss = false; body.querySelectorAll('.as-bal').forEach(b => b.onclick = async () => { const o = opts[+b.dataset.k]; if (o === it) { burst(b); b.classList.add('pop'); sfx('ok'); await sleep(600); done(!miss); } else { miss = true; b.classList.add('shake'); sfx('bad'); setTimeout(() => b.classList.remove('shake'), 500); } }); });
      weak(it, ok); if (ok) c++; else missed.push(it);
    }
    await A().waitNext(stage, `¡${c} de ${R.length}! Continuar`); return A().result(c, R.length, 'listening', missed);
  }
  // 👧 La canasta de Mr. Arrieta
  async function kgBasket(stage, p) {
    const V = vocab(p).filter(v => v.img), R = shuffle(V.length >= 4 ? V : vocab(p)).slice(0, Math.min(5, V.length || 5)); let c = 0; const missed = [];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(vocab(p).filter(x => x.en !== it.en)).slice(0, 3)));
      const body = frame(stage, 'Practice', 'La canasta de Mr. Arrieta', 'Mr. Arrieta te pide algo. Toca la foto correcta para ponerla en su canasta.');
      body.innerHTML = `<div class="as-kbar"><img class="as-mr" src="mra-present.webp" alt="Mr. Arrieta"><div class="as-say">Please, give me <b>“${esc(it.en)}”</b>!<button type="button" class="as-lnk" id="as-ag">${SV(I.vol)}</button></div></div>
        <div class="as-pics">${opts.map((o, k) => `<button type="button" class="as-pic" data-k="${k}">${M().photo(o.img)}<span>${esc(o.es)}</span></button>`).join('')}</div><div class="as-cnt">CANASTA ${c} DE ${R.length}</div>`;
      body.querySelector('#as-ag').onclick = () => play(it.au); await sleep(250); play(it.au);
      const ok = await new Promise(done => { let miss = false; body.querySelectorAll('.as-pic').forEach(b => b.onclick = async () => { const o = opts[+b.dataset.k]; if (o === it) { b.classList.add('ok'); sfx('ok'); body.querySelector('.as-mr').src = 'mra-thumbs.webp'; await sleep(800); done(!miss); } else { miss = true; b.classList.add('shake'); sfx('bad'); setTimeout(() => b.classList.remove('shake'), 500); } }); });
      weak(it, ok); if (ok) c++; else missed.push(it);
    }
    await A().waitNext(stage, `¡Canasta llena! Continuar`); return A().result(c, R.length, 'listening', missed);
  }
  // 👧 Álbum de stickers (parejas)
  async function kgAlbum(stage, p) {
    const V = shuffle(vocab(p).filter(v => v.img)).slice(0, 4); const cards = shuffle(V.flatMap((v, k) => [{ k, t: 'p', v }, { k, t: 'w', v }]));
    const body = frame(stage, 'Practice', 'Álbum de stickers', 'Encuentra las parejas: la foto (con su pista en español) y su palabra en inglés.'); let open = [], found = 0, moves = 0;
    body.innerHTML = `<div class="as-alb">${cards.map((x, i) => `<button type="button" class="as-ac" data-i="${i}"><span class="as-acb">${SV(I.star)}</span><span class="as-acf">${x.t === 'p' ? M().photo(x.v.img) + `<em class="as-cap">${esc(x.v.es)}</em>` : `<b>${esc(x.v.en)}</b>`}</span></button>`).join('')}</div><div class="as-cnt" id="as-mv">PAREJAS 0 DE ${V.length}</div>`;
    await new Promise(done => body.querySelectorAll('.as-ac').forEach(b => b.onclick = async () => {
      if (b.classList.contains('on') || open.length >= 2) return; b.classList.add('on'); open.push(b); const x = cards[+b.dataset.i]; if (x.t === 'w') play(x.v.au);
      if (open.length === 2) { moves++; const [a, b2] = open.map(e => cards[+e.dataset.i]); await sleep(700);
        if (a.k === b2.k) { open.forEach(e => e.classList.add('ok')); found++; sfx('ok'); body.querySelector('#as-mv').textContent = `PAREJAS ${found} DE ${V.length}`; if (found === V.length) done(); }
        else { open.forEach(e => e.classList.remove('on')); sfx('bad'); } open = []; } }));
    const c = Math.max(0, V.length - Math.max(0, moves - V.length - 2)); sfx('win');
    await A().waitNext(stage, `¡Álbum completo en ${moves} intentos! Continuar`); return A().result(Math.min(V.length, c), V.length, 'reading');
  }
  // 🧑‍🎤 Speed quiz
  async function tgQuiz(stage, p) {
    const V = vocab(p), R = shuffle(V).slice(0, Math.min(8, V.length)), SEC = 8; let c = 0, combo = 0, best = 0; const missed = [];
    const KB = 'mra_tg_best_v1'; let rec = 0; try { rec = +localStorage.getItem(KB) || 0; } catch (e) { }
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(V.filter(x => x.es !== it.es)).slice(0, 3)));
      const body = frame(stage, 'Practice', 'Speed quiz', '¿Qué significa? Responde antes de que se acabe el tiempo.');
      body.innerHTML = `<div class="as-sbar">${R.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="as-qh"><span>COMBO <b>x${combo}</b></span><span>TU RÉCORD <b>x${Math.max(rec, best)}</b></span></div>
        <div class="as-qw"><div class="as-en">${esc(it.en)}</div><div class="as-tm"><i id="as-tm"></i></div></div><div class="as-qo">${opts.map((o, k) => `<button type="button" class="as-opt" data-k="${k}">${esc(o.es)}</button>`).join('')}</div>`;
      play(it.au); const t0 = Date.now(); const tm = body.querySelector('#as-tm');
      const ok = await new Promise(done => { let over = false; const iv = setInterval(() => { const f = 1 - (Date.now() - t0) / (SEC * 1000); tm.style.width = Math.max(0, f * 100) + '%'; if (f <= 0 && !over) { over = true; clearInterval(iv); body.querySelectorAll('.as-opt').forEach((b, k) => { b.disabled = true; if (opts[k] === it) b.classList.add('ok'); }); sfx('bad'); setTimeout(() => done(false), 900); } }, 80);
        body.querySelectorAll('.as-opt').forEach(b => b.onclick = () => { if (over) return; over = true; clearInterval(iv); const o = opts[+b.dataset.k]; body.querySelectorAll('.as-opt').forEach((x, k) => { x.disabled = true; if (opts[k] === it) x.classList.add('ok'); }); if (o === it) { sfx('ok'); setTimeout(() => done(true), 500); } else { b.classList.add('bad'); sfx('bad'); setTimeout(() => done(false), 900); } }); });
      weak(it, ok); if (ok) { c++; combo++; best = Math.max(best, combo); } else { combo = 0; missed.push(it); }
    }
    if (best > rec) try { localStorage.setItem(KB, String(best)); } catch (e) { }
    const body = frame(stage, 'Practice', 'Speed quiz', ''); body.innerHTML = `<div class="as-kpi"><div><b>${c}/${R.length}</b><small>correctas</small></div><div><b>x${best}</b><small>mejor combo</small></div><div><b>x${Math.max(rec, best)}</b><small>tu récord</small></div></div>${best > rec && rec ? '<p class="as-hint">¡Nuevo récord personal!</p>' : ''}`; sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'reading', missed);
  }
  // 🧑‍🎤 Ordena el mensaje
  async function tgChat(stage, p) {
    const S = shuffle((p.sentences || []).filter(x => x.en && x.en.split(' ').length >= 3)).slice(0, 3); let c = 0; const missed = [];
    for (let i = 0; i < S.length; i++) {
      if (!stage.isConnected) break; const it = S[i]; const words = it.en.replace(/\s+/g, ' ').trim().split(' '); let pick = [];
      const body = frame(stage, 'Practice', 'Fix the message', 'El mensaje llegó desordenado. Toca las palabras en orden y envíalo.');
      body.innerHTML = `<div class="as-sbar">${S.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="as-chat"><div class="as-chb"><div class="as-vn in"><div class="as-vt">${esc(it.es)}<em>¿Cómo lo dirías en inglés?</em></div></div><div class="as-vn out" id="as-msg"><div class="as-vt" id="as-mt">&nbsp;</div></div></div></div>
        <div class="as-wch">${shuffle(words.map((w, k) => ({ w, k }))).map(x => `<button type="button" class="as-wc" data-k="${x.k}">${esc(x.w)}</button>`).join('')}</div><div class="as-nav"><button type="button" class="as-bw" id="as-undo">${SV(I.l)}Borrar</button><button type="button" class="as-gt" id="as-send">Enviar${SV(I.r)}</button></div>`;
      const mt = body.querySelector('#as-mt'); const draw = () => { mt.textContent = pick.map(k => words[k]).join(' ') || ' '; body.querySelectorAll('.as-wc').forEach(b => b.classList.toggle('used', pick.includes(+b.dataset.k))); };
      const ok = await new Promise(done => { let tries = 0;
        body.querySelectorAll('.as-wc').forEach(b => b.onclick = () => { const k = +b.dataset.k; if (pick.includes(k)) return; pick.push(k); sfx('tap'); draw(); });
        body.querySelector('#as-undo').onclick = () => { pick.pop(); draw(); };
        body.querySelector('#as-send').onclick = async () => { const got = pick.map(k => words[k]).join(' '); if (pick.length < words.length) return; tries++;
          if (got === words.join(' ')) { body.querySelector('#as-msg').classList.add('sent'); sfx('ok'); if (it.au) await play(it.au); done(tries === 1); }
          else { sfx('bad'); body.querySelector('#as-msg').classList.add('bad'); setTimeout(() => body.querySelector('#as-msg').classList.remove('bad'), 600); if (tries >= 2) { pick = words.map((_, k) => k); draw(); if (it.au) await play(it.au); setTimeout(() => done(false), 600); } else { pick = []; draw(); } } }; });
      if (ok) c++; else missed.push({ en: it.en, au: it.au });
    }
    await A().waitNext(stage, `${c} de ${S.length} mensajes perfectos · Continuar`); return A().result(c, S.length, 'writing', missed);
  }
  // 🧑‍🎤 Ear training: escucha y elige (para letras y palabras muy parecidas)
  async function tgEar(stage, p) {
    const V = vocab(p), R = shuffle(V).slice(0, Math.min(8, V.length)), SEC = 8; let c = 0, combo = 0, best = 0; const missed = [];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(V.filter(x => x.en !== it.en)).slice(0, 3)));
      const body = frame(stage, 'Practice', 'Ear training', '¿Cuál escuchaste? Responde antes de que se acabe el tiempo.');
      body.innerHTML = `<div class="as-sbar">${R.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="as-qh"><span>COMBO <b>x${combo}</b></span><span>${i + 1} DE ${R.length}</span></div>
        <div class="as-qw"><button type="button" class="as-bw" id="as-ag" style="margin:0 auto">${SV(I.vol)}Escuchar otra vez</button><div class="as-tm"><i id="as-tm"></i></div></div><div class="as-qo as-qo4">${opts.map((o, k) => `<button type="button" class="as-opt as-big" data-k="${k}">${esc(o.en)}</button>`).join('')}</div>`;
      body.querySelector('#as-ag').onclick = () => play(it.au); await play(it.au); const t0 = Date.now(); const tm = body.querySelector('#as-tm');
      const ok = await new Promise(done => { let over = false; const end = (b, good) => { over = true; clearInterval(iv); body.querySelectorAll('.as-opt').forEach((x, k) => { x.disabled = true; if (opts[k] === it) x.classList.add('ok'); }); if (b && !good) b.classList.add('bad'); sfx(good ? 'ok' : 'bad'); setTimeout(() => done(good), good ? 500 : 1000); };
        const iv = setInterval(() => { const f = 1 - (Date.now() - t0) / (SEC * 1000); tm.style.width = Math.max(0, f * 100) + '%'; if (f <= 0 && !over) end(null, false); }, 80);
        body.querySelectorAll('.as-opt').forEach(b => b.onclick = () => { if (!over) end(b, opts[+b.dataset.k] === it); }); });
      weak(it, ok); if (ok) { c++; combo++; best = Math.max(best, combo); } else { combo = 0; missed.push(it); }
    }
    const body = frame(stage, 'Practice', 'Ear training', ''); body.innerHTML = `<div class="as-kpi"><div><b>${c}/${R.length}</b><small>correctas</small></div><div><b>x${best}</b><small>mejor combo</small></div><div><b>${Math.round(c / R.length * 100)}%</b><small>acierto</small></div></div>`; sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'listening', missed);
  }
  // 🧑‍🎤 Match contra reloj
  async function tgMatch(stage, p) {
    const V = shuffle(vocab(p)).slice(0, 5), SEC = 45; let sel = null, found = 0, errs = 0;
    const body = frame(stage, 'Practice', 'Match rush', `Une cada palabra con su significado antes de ${SEC} segundos.`);
    const L = V.map((v, k) => ({ k, t: v.en })), R = shuffle(V.map((v, k) => ({ k, t: v.es })));
    body.innerHTML = `<div class="as-qh"><span>PAREJAS <b id="as-f">0/${V.length}</b></span><span>TIEMPO <b id="as-s">${SEC}</b>s</span></div><div class="as-tm"><i id="as-tm"></i></div><div class="as-mt"><div>${L.map(x => `<button type="button" class="as-opt" data-s="l" data-k="${x.k}">${esc(x.t)}</button>`).join('')}</div><div>${R.map(x => `<button type="button" class="as-opt" data-s="r" data-k="${x.k}">${esc(x.t)}</button>`).join('')}</div></div>`;
    const t0 = Date.now();
    await new Promise(done => { const iv = setInterval(() => { const left = SEC - (Date.now() - t0) / 1000; body.querySelector('#as-s').textContent = Math.max(0, Math.ceil(left)); body.querySelector('#as-tm').style.width = Math.max(0, left / SEC * 100) + '%'; if (left <= 0) { clearInterval(iv); done(); } }, 200);
      body.querySelectorAll('.as-opt').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return;
        if (!sel || sel.dataset.s === b.dataset.s) { if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel'); if (b.dataset.s === 'l') play(V[+b.dataset.k].au); return; }
        if (sel.dataset.k === b.dataset.k) { sel.classList.remove('sel'); sel.classList.add('ok'); b.classList.add('ok'); found++; sfx('ok'); body.querySelector('#as-f').textContent = `${found}/${V.length}`; if (found === V.length) { clearInterval(iv); setTimeout(done, 400); } }
        else { errs++; sfx('bad'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 500); sel.classList.remove('sel'); } sel = null; }); });
    const secs = Math.round((Date.now() - t0) / 1000);
    await A().waitNext(stage, found === V.length ? `¡Todas en ${secs} s! Continuar` : `${found} de ${V.length} · Continuar`); return A().result(found, V.length, 'reading');
  }

  /* =================== TAREA ORAL =================== */
  async function speak(stage, p) {
    const teens = ag() === 'teens';
    // v415 kids: la foto SIEMPRE corresponde a lo que se dice → se usan las palabras de la lección con su propia foto
    const KV = teens ? [] : shuffle(vocab(p).filter(v => v.img && v.au && v.es && !/^#/.test(v.img) && v.en.trim().length > 2)).slice(0, 3);
    const S = KV.length >= 3 ? KV : shuffle((p.sentences || []).filter(x => x.en && x.au)).slice(0, 3); if (S.length < 2) return null; let c = 0;
    for (let i = 0; i < S.length; i++) {
      if (!stage.isConnected) break; const it = S[i];
      const body = frame(stage, 'Oral task', teens ? 'Voice-over del reel' : 'Misión del explorador', teens ? 'Ponle tu voz a este reel: di la frase con buena pronunciación.' : 'Mira la foto y di la frase en inglés.');
      body.innerHTML = teens
        ? `<div class="as-sbar">${S.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div><div class="as-reel">${it.img ? M().photo(it.img) : ''}<div class="as-rc"><b>${esc(it.en)}</b><small>${esc(it.es || '')}</small></div></div><div class="as-tb"><button type="button" class="as-bw" id="as-ls">${SV(I.vol)}Modelo</button><button type="button" class="as-gt" id="as-mic">${SV(I.mic)}Grabar</button></div><div class="as-tr" id="as-tr"></div>`
        : `<div class="as-cnt">MISIÓN ${i + 1} DE ${S.length}</div><div class="as-tph" style="width:min(300px,90%)">${it.img ? M().photo(it.img) : ''}</div><div class="as-cue"><small>¿Cómo se dice en inglés?</small><b>${esc(it.es || '')}</b></div><div class="as-kbar"><img class="as-mr" src="mra-think.webp" alt="Mr. Arrieta"><div class="as-say">Dilo en inglés y yo te escucho.<small style="display:block;font-weight:600">Si no lo recuerdas, toca Ayuda.</small></div></div><div class="as-ivh" id="as-h"></div><div class="as-tb"><button type="button" class="as-bw" id="as-help">${SV(I.bulb)}Ayuda</button><button type="button" class="as-bk" id="as-mic">${SV(I.mic)}¡Dilo!</button></div><div class="as-tr" id="as-tr"></div>`;
      const hp = body.querySelector('#as-help'); if (hp) hp.onclick = () => { body.querySelector('#as-h').innerHTML = `En inglés se dice: <b>${esc(it.en)}</b>`; play(it.au); };
      const ls = body.querySelector('#as-ls'); if (ls) ls.onclick = () => play(it.au); if (teens) { await sleep(200); play(it.au); }
      const ok = await new Promise(done => { let tries = 0; body.querySelector('#as-mic').onclick = async (e) => { const bt = e.currentTarget; bt.disabled = true; const tr = body.querySelector('#as-tr'); tr.textContent = teens ? 'Grabando…' : 'Te escucho…';
        const r = await RS(it.en, Math.max(4000, it.en.split(' ').length * 900 + 2200)); bt.disabled = false; tries++;
        if (judge(r, it.en, false)) { sfx('ok'); try { M().praise(); } catch (er) { } tr.innerHTML = `<b class="as-ok">${SV(I.ck)}${teens ? 'Voice-over listo' : '¡Misión cumplida!'}</b>${r && r.score != null ? ` <small>${r.score}%</small>` : ''}`; setTimeout(() => done(true), 1200); return; }
        sfx('bad'); tr.innerHTML = `${tries >= 2 ? `Así se dice: <b>${esc(it.en)}</b><button type="button" class="as-lnk" id="as-nx">Siguiente</button>` : 'Escucha el modelo e inténtalo otra vez.'}`;
        if (tries >= 2) { play(it.au); body.querySelector('#as-nx').onclick = () => done(false); } }; });
      if (ok) c++;
    }
    await A().waitNext(stage, `${c} de ${S.length} · Continuar`); return A().result(c, S.length, 'speaking');
  }

  /* =================== MÚSICA =================== */
  // v456: solo un pedazo de ~75 s de la canción (el coro), para no tener que ver el video completo
  const KIDCH = /super simple|dream english|kids|learning station|have fun|jack hartmann|singsing|engames|hooray|kidstv|rockin|wormhole|sesame|cocomelon/i;
  function clip9(sg) { const st = sg && sg.s != null ? +sg.s : (KIDCH.test((sg && (sg.ch || sg.artist)) || '') ? 0 : 30); return [st, st + 75]; }
  window.MRCLIP = clip9;
  function musicFor(p) { const n = +((M().MOD || {}).n) || 1, S = n === 1 ? window.MRMUSIC : n === 2 ? window.MRMUSIC2 : n === 3 ? window.MRMUSIC3 : n === 4 ? window.MRMUSIC4 : null, D = S && S[ag()]; return D && D[p.id] ? D[p.id] : null; } // v446: Módulo 2 también
  async function music(stage, p) {
    const sg = musicFor(p); if (!sg) return null; const teens = ag() === 'teens';
    if (window.__V9 && sg.g && sg.g.length >= 2) { frame(stage, 'Music', '', ''); const r9 = await A().song9(stage, sg); if (r9) { try { const K = 'mra_mstamp_v1', o = JSON.parse(localStorage.getItem(K) || '{}'); o[p.id] = 1; localStorage.setItem(K, JSON.stringify(o)); } catch (e) { } return A().result(r9.c, r9.t, 'listening', r9.missed); } } // v475: Completa lo que falta
    const body = frame(stage, 'Music', teens ? 'Catch the phrase' : 'Atrapa la palabra', teens ? 'Dale play: es solo un minuto de la canción. Cuando escuches una frase, tócala. Cada acierto sube tu combo.' : 'Dale play: es solo un minuto de la canción. Cuando escuches una palabra, ¡tócala!');
    const tiles = shuffle((sg.w || []).map(t => ({ t, ok: true })).concat((sg.d || []).map(t => ({ t, ok: false }))));
    const COL = ['#f59e0b', '#38bdf8', '#fb7185', '#4ade80', '#a78bfa', '#f97316'];
    body.innerHTML = `<div class="as-vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(sg.yt)}?rel=0&playsinline=1&modestbranding=1&start=${clip9(sg)[0]}&end=${clip9(sg)[1]}" title="${esc(sg.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><div class="as-vcap">${esc(sg.title)} · ${esc(sg.ch)}</div>
      ${teens ? '<div class="as-qh"><span>COMBO <b id="as-cb">x0</b></span><span>MEJOR COMBO <b id="as-bc">x0</b></span></div>' : ''}<div class="as-mcnt">${teens ? 'Atrapadas' : 'Palabras atrapadas'} <b id="as-mg">0 de ${(sg.w || []).length}</b></div><div class="as-tiles as-tu ${teens ? 'tn' : 'kd'}">${tiles.map((x, k) => `<button type="button" class="as-tile" data-k="${k}"><span>${esc(x.t)}</span></button>`).join('')}</div><div class="as-mfb" id="as-mf">${teens ? 'Toca una frase cuando la escuches.' : 'Toca una palabra cuando la escuches.'}</div>`;
    let got = 0, combo = 0, best = 0; const need = tiles.filter(x => x.ok).length;
    await new Promise(done => { body.querySelectorAll('.as-tile').forEach(b => b.onclick = () => { const x = tiles[+b.dataset.k]; if (b.classList.contains('ok')) return;
      const fb = body.querySelector('#as-mf');
      if (x.ok) { b.classList.add('ok'); b.insertAdjacentHTML('afterbegin', SV(I.ck)); got++; combo++; best = Math.max(best, combo); sfx('ok'); fb.className = 'as-mfb ok'; fb.innerHTML = `${SV(I.ck)}<span>¡Bien! <b>${esc(x.t)}</b> sí suena en la canción.</span>`; body.querySelector('#as-mg').textContent = `${got} de ${need}`; if (got === need) { setTimeout(() => { try { M().confetti(2600); sfx('win'); } catch (e) { } }, 250); } }
      else { if (b.classList.contains('no')) return; combo = 0; b.classList.add('shake', 'no'); b.insertAdjacentHTML('afterbegin', SV(I.x)); sfx('bad'); fb.className = 'as-mfb no'; fb.innerHTML = `${SV(I.x)}<span><b>${esc(x.t)}</b> no suena en esta canción. ¡Sigue escuchando!</span>`; setTimeout(() => b.classList.remove('shake'), 500); }
      if (teens) { body.querySelector('#as-cb').textContent = 'x' + combo; body.querySelector('#as-bc').textContent = 'x' + best; } });
      A().waitNext(stage, teens ? 'Terminé la canción' : '¡Terminé la canción!').then(done); });
    { const miss = tiles.filter(x => x.ok && ![...body.querySelectorAll('.as-tile.ok')].some(b => tiles[+b.dataset.k] === x)).map(x => x.t); const all = got === need; // v417: resultado claro de la canción
      const rb = frame(stage, 'Music', all ? 'Well done!' : got >= need / 2 ? '¡Muy bien!' : 'Try again', '');
      rb.innerHTML = `<div class="as-mres ${all ? 'ok' : 'mid'}"><span class="as-mri">${SV(all ? I.ck : I.star)}</span><b>${got} de ${need}</b><small>${teens ? 'frases atrapadas' : 'palabras atrapadas'}</small>${miss.length ? `<div class="as-mmiss">Te faltaron: ${miss.map(t => `<i>${esc(t)}</i>`).join('')}</div>` : '<div class="as-mmiss">¡Las atrapaste todas!</div>'}</div>`;
      sfx(all ? 'win' : 'ok'); if (all) { try { M().praise(); } catch (e) { } } else { try { M().encourage(); } catch (e) { } }
      await A().waitNext(stage, 'Continuar'); }
    if (window.__V9) { try { const K = 'mra_mstamp_v1', o = JSON.parse(localStorage.getItem(K) || '{}'); o[p.id] = 1; localStorage.setItem(K, JSON.stringify(o)); } catch (e) { } return A().result(got, Math.max(1, need), 'listening'); } // lección corta: después de la canción sigue Writing
    const Q = (sg.q || []).slice(0, 3); let c = 0;
    for (let i = 0; i < Q.length; i++) {
      if (!stage.isConnected) break; const [q, opts, a] = Q[i]; const b2 = frame(stage, 'Music', teens ? 'What did you see?' : '¿Qué viste?', `Pregunta ${i + 1} de ${Q.length}`);
      b2.innerHTML = `<div class="${teens ? 'as-poll' : 'as-tre'}"><h3 style="margin:0 0 10px">${esc(q)}</h3><div class="as-qo">${opts.map((o, k) => `<button type="button" class="as-opt ${teens ? '' : 'kd'}" data-k="${k}">${esc(o)}</button>`).join('')}</div></div>`;
      const ok = await new Promise(done => b2.querySelectorAll('.as-opt').forEach(b => b.onclick = () => { b2.querySelectorAll('.as-opt').forEach((x, k) => { x.disabled = true; if (k === a) x.classList.add('ok'); }); const r = +b.dataset.k === a; if (!r) b.classList.add('bad'); sfx(r ? 'ok' : 'bad'); setTimeout(() => done(r), 900); }));
      if (ok) c++;
    }
    const b3 = frame(stage, 'Music', teens ? 'Track completed' : '¡Canción completada!', '');
    const tn = (p.id || '').match(/t(\d+)/); const T = tn ? tn[1] : '';
    b3.innerHTML = teens ? `<div class="as-badge">${SV('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')}<b>MUSIC</b><small>TOPIC ${T}</small></div><div class="as-kpi"><div><b>${got}/${need}</b><small>frases</small></div><div><b>x${best}</b><small>mejor combo</small></div><div><b>${c}/${Q.length}</b><small>preguntas</small></div></div>`
      : `<div class="as-tre"><div class="as-stamp2">${SV('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')}<b>MÚSICA</b><small>TEMA ${T}</small></div><div class="as-tw">¡Sello ganado!</div><div class="as-te">Atrapaste ${got} de ${need} palabras · ${c} de ${Q.length} respuestas</div></div>`;
    try { const K = 'mra_mstamp_v1', o = JSON.parse(localStorage.getItem(K) || '{}'); o[p.id] = 1; localStorage.setItem(K, JSON.stringify(o)); } catch (e) { }
    sfx('win'); try { M().confetti(1200); } catch (e) { }
    await A().waitNext(stage, 'Continuar'); return A().result(c, Math.max(1, Q.length), 'listening');
  }

  /* =================== v435 · JUEGOS CORTOS (30–60 s): contra reloj, combo, sonido y animación =================== */
  const G9 = {};
  // barra de tiempo: llama onEnd cuando se acaba; stop() la detiene
  function g9Timer(el, secs, onEnd) { const t0 = performance.now(); let on = true; const i = el.querySelector('i'); const lab = el.parentNode.querySelector('.g9-sec');
    const tick = () => { if (!on || !el.isConnected) return; const left = Math.max(0, secs - (performance.now() - t0) / 1000); i.style.width = (left / secs * 100) + '%'; if (lab) lab.textContent = '0:' + String(Math.ceil(left)).padStart(2, '0'); el.classList.toggle('low', left < secs * .25);
      if (left <= 0) { on = false; onEnd && onEnd(); return; } requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    return { stop() { on = false; }, left() { return Math.max(0, secs - (performance.now() - t0) / 1000); } }; }
  const g9Top = (name, right) => `<div class="g9-top"><b>${esc(name)}</b><span class="g9-pill">${right}</span></div><div class="g9-tm"><i></i></div>`;
  const comboHTML = n => n >= 2 ? `<span class="g9-cmb pop">${SV('<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 2 3 4"/>')}Combo x${n}</span>` : '';
  const g9End = async (stage, c, t, skill, missed, msg) => { if (c === t) { sfx('win'); try { M().confetti(1500); } catch (e) { } } await A().waitNext(stage, msg || `¡${c} de ${t}! Continuar`); return A().result(c, t, skill, missed); };
  const MR_OK = ['mra-thumbs.webp', 'mra-celebrate.webp', 'mra-wow.webp'], mrOk = () => MR_OK[Math.floor(Math.random() * 3)];

  // 💬 Adultos · Chat con un amigo: te escribe y eliges la respuesta correcta
  G9.g9Chat = async function (stage, p) {
    const Q = uniq((p.keyq || []).filter(x => x.q && x.a), 'q'); if (Q.length < 3) return G9.g9Pairs(stage, p);
    const R = shuffle(Q).slice(0, 4), SEC = 12; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Responde el chat', 'Un amigo te escribe en inglés. Elige la respuesta correcta antes de que se acabe el tiempo.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Chat con un amigo', `<span id="g9n">1 / ${R.length}</span>`)}<div class="g9-chat" id="g9c"><div class="g9-who">${SV('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')}Mark · New York</div></div><div class="g9-opts" id="g9o"></div><div class="g9-fb" id="g9f"></div></div>`;
    const chat = body.querySelector('#g9c'), oEl = body.querySelector('#g9o'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    const bub = (t, cls) => { const b = H(`<div class="g9-bub ${cls}">${esc(t)}</div>`); chat.appendChild(b); chat.scrollTop = chat.scrollHeight; return b; };
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; body.querySelector('#g9n').textContent = `${i + 1} / ${R.length}`; fb.innerHTML = '';
      const typing = bub('…', 'in typing'); await sleep(650); typing.remove(); bub(it.q, 'in'); let qp = Promise.resolve(); try { qp = M().play(it.qau) || qp; } catch (e) { }
      const SW = { is: 'does', are: 'do', am: 'do', was: 'did', were: 'did', do: 'am', does: 'is', did: 'was', can: 'do', will: 'do', have: 'do', has: 'is', should: 'do', would: 'do' };
      const fake = a => { if (/^No, I'm not\b/.test(a)) return [a.replace("I'm not", "I don't"), a.replace("I'm not", "I isn't")]; { const m2 = String(a).match(/^(Yes|No),\s+(\w+)\s+(can't|won't|can|will)\b(.*)$/); if (m2) { const [, yn, su, au, rest] = m2; const neg = /n't/.test(au); return [`${yn}, ${su} ${neg ? "don't" : 'do'}${rest}`, `${yn}, ${su === 'I' ? 'he' : 'I'} ${neg ? "isn't" : 'is'}${rest}`]; } } const m = String(a).match(/^(Yes|No),\s+(\w+)\s+(\w+?)(n't)?\b(.*)$/); if (!m) return []; const [, yn, su, au, nt, rest] = m; const L = []; if (SW[au]) L.push(`${yn}, ${su} ${SW[au]}${nt || ''}${rest}`); const su2 = su === 'I' ? 'he' : 'I'; const au2 = au === 'am' ? 'are' : au; /* error de concordancia con palabras reales */ L.push(`${yn}, ${su2} ${au2}${nt || ''}${rest}`); return L; };
      const fk = [...new Set(fake(it.a).filter(f => f !== it.a))]; const pool = [...new Set(Q.map(x => x.a).filter(a => a !== it.a && !/^(Yes|No),/.test(a)))]; let dis = fk.length >= 2 ? fk.slice(0, 2) : fk.concat(shuffle(pool)).slice(0, 2);
      const opts = shuffle([it.a].concat(dis)); // v444: nunca dos opciones iguales; si faltan, distractores con error de gramática
      oEl.innerHTML = opts.map((o, k) => `<button type="button" class="g9-opt" data-k="${k}">${esc(o)}</button>`).join('');
      const ok = await new Promise(done => { let miss = false, fin = false; const T = g9Timer(tm, SEC, () => { if (fin) return; fin = true; miss = true; reveal(); });
        const reveal = () => { oEl.querySelectorAll('.g9-opt').forEach(b => { if (opts[+b.dataset.k] === it.a) b.classList.add('ok'); b.disabled = true; }); fb.innerHTML = `<span class="g9-no">Se acabó el tiempo. La respuesta era: <b>${esc(it.a)}</b></span>`; setTimeout(() => done(false), 1700); };
        oEl.querySelectorAll('.g9-opt').forEach(b => b.onclick = async () => { if (fin) return; const o = opts[+b.dataset.k];
          if (o === it.a) { fin = true; T.stop(); b.classList.add('ok'); sfx('ok'); oEl.querySelectorAll('.g9-opt').forEach(x => x.disabled = true); combo = miss ? 0 : combo + 1; fb.innerHTML = miss ? `<span class="g9-mid">Bien, a la segunda.</span>` : `<span class="g9-yes">${SV(I.ck)}¡Respuesta natural!</span>${comboHTML(combo)}`; await Promise.race([qp, sleep(8000)]); await sleep(250); bub(it.a, 'out'); let ap = Promise.resolve(); try { ap = M().play(it.aau) || ap; } catch (e) { } await Promise.race([ap, sleep(9000)]); await sleep(500); done(!miss); } // v444: primero termina de hablar Mark, luego suena tu respuesta y después la siguiente pregunta
          else { miss = true; combo = 0; b.classList.add('bad', 'shake'); sfx('bad'); setTimeout(() => b.classList.remove('shake'), 450); fb.innerHTML = `<span class="g9-no">Esa no responde la pregunta. Lee otra vez.</span>`; } }); });
      oEl.innerHTML = ''; if (ok) c++; else missed.push({ en: it.a, au: it.aau });
    }
    return g9End(stage, c, R.length, 'reading', missed, `¡${c} de ${R.length} respuestas! Continuar`);
  };

  // ⚡ Adultos · Parejas relámpago: inglés ↔ español contra reloj
  G9.g9Pairs = async function (stage, p) {
    const nrm = x => String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
    const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
    const cognate = v => { const a = nrm(v.en), b = nrm(v.es); return !a || !b || lev(a, b) <= Math.max(2, Math.floor(Math.min(a.length, b.length) / 3)); }; // Brazil/Brasil, Canada/Canadá: muy obvias
    let P = vocab(p).filter(v => !cognate(v) && v.en.length < 26);
    if (P.length < 4) P = uniq((p.sentences || []).filter(s => s.en && s.es && s.au && s.en.length < 28 && !cognate(s)));
    if (P.length < 4) return null; P = shuffle(P).slice(0, 4); const SEC = 35; let found = 0, errs = 0, combo = 0, best = 0; const missed = new Set();
    const L = shuffle(P), Rr = shuffle(P);
    const body = frame(stage, 'Practice', 'Parejas relámpago', 'Une cada palabra con su significado. Al tocar la palabra en inglés, la escuchas.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('¡Contra reloj!', `<span class="g9-sec">0:${SEC}</span>`)}<div class="g9-pairs"><div>${L.map((x, k) => `<button type="button" class="g9-pc" data-s="L" data-k="${P.indexOf(x)}">${esc(x.en)}</button>`).join('')}</div><div>${Rr.map(x => `<button type="button" class="g9-pc es" data-s="R" data-k="${P.indexOf(x)}">${esc(x.es)}</button>`).join('')}</div></div><div class="g9-fb" id="g9f"></div></div>`;
    const fb = body.querySelector('#g9f');
    await new Promise(done => { let sel = null, fin = false; const T = g9Timer(body.querySelector('.g9-tm'), SEC, () => { if (fin) return; fin = true; body.querySelectorAll('.g9-pc:not(.g9ok)').forEach(b => { b.disabled = true; missed.add(+b.dataset.k); }); fb.innerHTML = `<span class="g9-no">¡Se acabó el tiempo!</span>`; setTimeout(done, 1200); });
      body.querySelectorAll('.g9-pc').forEach(b => b.onclick = () => { if (fin || b.classList.contains('g9ok')) return; const k = +b.dataset.k;
        if (b.dataset.s === 'L') try { M().play(P[k].au); } catch (e) { }
        if (!sel || sel.dataset.s === b.dataset.s) { if (sel) sel.classList.remove('on'); sel = b; b.classList.add('on'); sfx('tap'); return; }
        if (+sel.dataset.k === k) { [sel, b].forEach(x => { x.classList.remove('on'); x.classList.add('g9ok'); }); found++; combo++; best = Math.max(best, combo); sfx('ok'); fb.innerHTML = comboHTML(combo) || `<span class="g9-yes">${SV(I.ck)}¡Bien!</span>`;
          if (found === P.length) { fin = true; T.stop(); const s = Math.round(T.left()); fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}¡Todas! Te sobraron ${s} segundos.</span>`; setTimeout(done, 1300); } }
        else { errs++; combo = 0; missed.add(k); missed.add(+sel.dataset.k); [sel, b].forEach(x => { x.classList.add('bad', 'shake'); setTimeout(() => x.classList.remove('bad', 'shake', 'on'), 450); }); sfx('bad'); fb.innerHTML = `<span class="g9-no">No es pareja. ¡Rápido, otra vez!</span>`; }
        sel = null; }); });
    const c = Math.max(0, P.length - missed.size); missed.forEach(k => weak(P[k], false));
    return g9End(stage, c, P.length, 'reading', [...missed].map(k => P[k]), `¡${found} de ${P.length} parejas! Continuar`);
  };

  const STAR9 = '<svg class="g9-ss" viewBox="0 0 100 96" aria-hidden="true"><defs><linearGradient id="g9sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".55" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><path d="M50 3l13.6 28.6 31.4 4-23 21.8 5.9 31.1L50 73.3 22.1 88.5 28 57.4 5 35.6l31.4-4z" fill="url(#g9sg)" stroke="#e08a00" stroke-width="3" stroke-linejoin="round"/><path d="M36 30l6-12" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>';
  // ⭐ Kids · Estrellas que caen: escucha y atrapa la estrella correcta
  G9.g9Stars = async function (stage, p) {
    const V = vocab(p); if (V.length < 3) return null; const R = shuffle(V).slice(0, 4); let c = 0, combo = 0; const missed = [];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(V.filter(x => x.en !== it.en)).slice(0, 2)));
      const body = frame(stage, 'Practice', 'Estrellas que caen', 'Escucha a Mr. Arrieta y atrapa la estrella correcta antes de que caiga.');
      body.innerHTML = `<div class="g9 g9-k">${g9Top('Atrapa la estrella', `${SV(I.star)} ${c}`)}<button type="button" class="g9-au" id="g9a">${SV(I.vol)}Escuchar otra vez</button><div class="g9-sky">${opts.map((o, k) => `<button type="button" class="g9-star" data-k="${k}" style="left:${[3, 36, 69][k]}%;--d:${(k * .5).toFixed(1)}s;--t:${(7 + k * .4).toFixed(1)}s">${STAR9}<span class="${o.en.length > 16 ? 'xs' : o.en.length > 8 ? 'sm' : ''}">${esc(o.en)}</span></button>`).join('')}</div><div class="g9-fb" id="g9f"></div></div>`;
      body.querySelector('.g9-tm').style.visibility = 'hidden';
      body.querySelector('#g9a').onclick = () => play(it.au); await sleep(300); play(it.au);
      const ok = await new Promise(done => { let miss = false, fin = false; const fb = body.querySelector('#g9f');
        body.querySelectorAll('.g9-star').forEach(b => { const o = opts[+b.dataset.k];
          b.addEventListener('animationend', () => { if (fin || o !== it) return; fin = true; miss = true; b.classList.add('lost'); fb.innerHTML = `<span class="g9-no">¡Se escapó! Era <b>${esc(it.en)}</b>.</span>`; play(it.au); setTimeout(() => done(false), 1800); });
          b.onclick = async () => { if (fin) return; if (o === it) { fin = true; b.classList.add('hit'); burst(b); sfx('ok'); combo = miss ? 0 : combo + 1; fb.innerHTML = miss ? `<span class="g9-mid">¡La atrapaste!</span>` : `<span class="g9-yes">${SV(I.ck)}¡Súper!</span>${comboHTML(combo)}`; body.querySelectorAll('.g9-star').forEach(x => x.style.animationPlayState = 'paused'); await sleep(1100); done(!miss); }
            else { miss = true; combo = 0; b.classList.add('shake'); sfx('bad'); setTimeout(() => b.classList.remove('shake'), 450); } }; }); });
      weak(it, ok); if (ok) c++; else missed.push(it);
    }
    return g9End(stage, c, R.length, 'listening', missed, `¡Atrapaste ${c} de ${R.length} estrellas! Continuar`);
  };

  // 👾 Kids · Alimenta al monstruo: arrastra (o toca) la foto correcta
  G9.g9Monster = async function (stage, p) {
    const V = vocab(p).filter(v => v.img && !/^#/.test(v.img) && !/[.!?,]$/.test(v.en.trim()) && v.en.trim().split(/\s+/).length <= 2); if (V.length < 3 || trivial(vocab(p))) return G9.g9Stars(stage, p); // letras: la foto no es la letra → estrellas
    const R = shuffle(V).slice(0, 4); let c = 0; const missed = [];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(V.filter(x => x.en !== it.en)).slice(0, 2)));
      const body = frame(stage, 'Practice', 'Alimenta al monstruo', 'El monstruo te pide algo en inglés. Arrastra la foto correcta a su boca (o tócala).');
      body.innerHTML = `<div class="g9 g9-k">${g9Top('Monstruo hambriento', `${i + 1} / ${R.length}`)}<div class="g9-req"><small>Dale al monstruo:</small> <b>${esc(it.en)}</b><button type="button" class="g9-mini" id="g9a" aria-label="Escuchar">${SV(I.vol)}</button></div>
        <div class="g9-mon" id="g9m"><i class="e l"></i><i class="e r"></i><i class="m"></i></div><div class="g9-food">${opts.map((o, k) => `<button type="button" class="g9-fd" data-k="${k}">${M().photo(o.img)}<span>${esc(o.es)}</span></button>`).join('')}</div><div class="g9-fb" id="g9f"></div></div>`;
      body.querySelector('.g9-tm').style.visibility = 'hidden';
      const mon = body.querySelector('#g9m'), fb = body.querySelector('#g9f');
      body.querySelector('#g9a').onclick = () => play(it.au); await sleep(300); play(it.au);
      const ok = await new Promise(done => { let miss = false, fin = false;
        const swallow = async (b, dx = 0, dy = 0) => { // la foto vuela a la boca, se encoge y el monstruo se la traga
          const m = mon.querySelector('.m').getBoundingClientRect(), r = b.getBoundingClientRect(); const ox = r.left + r.width / 2 - dx, oy = r.top + r.height / 2 - dy;
          const tx = m.left + m.width / 2 - ox, ty = m.top + m.height / 2 - oy; mon.classList.add('open');
          b.style.zIndex = 6; b.style.transition = 'transform .55s cubic-bezier(.5,-0.2,.7,1), opacity .2s .45s'; requestAnimationFrame(() => { b.style.transform = `translate(${tx}px,${ty}px) scale(.12) rotate(-25deg)`; b.style.opacity = '0'; });
          await sleep(560); b.style.visibility = 'hidden'; mon.classList.remove('open'); mon.classList.add('eat'); try { sfx('flip'); } catch (e) { } };
        const choose = async (b, dx, dy) => { if (fin) return; const o = opts[+b.dataset.k];
          if (o === it) { fin = true; await swallow(b, dx, dy); sfx('ok'); fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}¡Ñam ñam! Yummy!</span>`; await sleep(1100); done(!miss); }
          else { miss = true; mon.classList.add('no'); b.classList.add('shake'); sfx('bad'); fb.innerHTML = `<span class="g9-no">No, thanks! Escucha otra vez.</span>`; setTimeout(() => { mon.classList.remove('no'); b.classList.remove('shake'); }, 600); play(it.au); } };
        body.querySelectorAll('.g9-fd').forEach(b => { let sx, sy, drag = false;
          b.onpointerdown = e => { if (fin) return; sx = e.clientX; sy = e.clientY; drag = false; try { b.setPointerCapture(e.pointerId); } catch (er) { } };
          b.onpointermove = e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 8) { drag = true; b.classList.add('drag'); b.style.transform = `translate(${dx}px,${dy}px) rotate(-5deg)`; const r = mon.getBoundingClientRect(); mon.classList.toggle('open', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom + 30); } };
          b.onpointerup = e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; b.classList.remove('drag'); const over = mon.classList.contains('open'); mon.classList.remove('open');
            if (drag && over && opts[+b.dataset.k] === it) { choose(b, dx, dy); return; } b.style.transform = ''; if (!drag || over) choose(b, 0, 0); else sfx('tap'); };
          b.onpointercancel = () => { sx = null; b.classList.remove('drag'); b.style.transform = ''; mon.classList.remove('open'); }; }); });
      weak(it, ok); if (ok) c++; else missed.push(it);
    }
    return g9End(stage, c, R.length, 'listening', missed, `¡El monstruo comió ${c} de ${R.length}! Continuar`);
  };

  // 🃏 Teens · Desliza bien o mal (¿está bien escrita?)
  const BREAK = [[/\bI'm\b/, "I is"], [/\bI am\b/, 'I is'], [/\b(He|She|It|he|she|it)'s\b/, '$1 are'], [/\b(He|She|It|he|she|it) is\b/, '$1 are'], [/\b(You|We|They|you|we|they)'re\b/, '$1 is'], [/\b(You|We|They|you|we|they) are\b/, '$1 is'],
    [/\b(Is|is) (he|she|it)\b/, (m, a, b) => (a === 'Is' ? 'Are ' : 'are ') + b], [/\b(Are|are) (you|we|they)\b/, (m, a, b) => (a === 'Are' ? 'Is ' : 'is ') + b], [/\ban ([aeiouAEIOU])/, 'a $1'], [/\b(He|She|he|she) (lives|works|likes|has|goes|wants|speaks)\b/, (m, a, v) => a + ' ' + ({ has: 'have', goes: 'go' }[v] || v.replace(/s$/, ''))], [/\bdoesn't\b/, "don't"], [/\bwas\b/, 'were']];
  const breakIt = s => { for (const [re, to] of shuffle(BREAK)) { if (re.test(s)) { const w = s.replace(re, to); if (w !== s) return w; } } return null; };
  G9.g9Swipe = async function (stage, p) {
    const S = uniq((p.sentences || []).concat((p.keyq || []).map(k => ({ en: k.a, es: '', au: k.aau })), (p.keyq || []).map(k => ({ en: k.q, es: k.es, au: k.qau }))).filter(x => x.en && x.en.split(' ').length >= 3 && x.en.length < 60));
    const brk = shuffle(S.map(x => ({ x, w: breakIt(x.en) })).filter(o => o.w));
    let mode = 'gram', R;
    if (brk.length >= 2 && S.length >= 5) { const nb = Math.min(3, brk.length), bad = brk.slice(0, nb); const good = shuffle(S.filter(x => !bad.some(b => b.x === x))).slice(0, 5 - nb); R = shuffle(bad.map(b => ({ show: b.w, truth: false, it: b.x })).concat(good.map(x => ({ show: x.en, truth: true, it: x })))); }
    else { const V = vocab(p); if (V.length < 4) return null; mode = 'mean'; R = shuffle(V).slice(0, 5).map(it => { const tr = Math.random() < .5; const o = tr ? it : shuffle(V.filter(x => x.es !== it.es))[0]; return { show: it.en, es: o.es, truth: tr, it }; }); }
    const SEC = 7; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Swipe challenge', mode === 'gram' ? 'Desliza a la derecha si la frase está bien escrita y a la izquierda si tiene un error. ¡Rápido!' : 'Desliza a la derecha si significa eso y a la izquierda si no. ¡Rápido!');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('Swipe challenge', `<span id="g9cb">${R.length} cartas</span>`)}<div class="g9-deck" id="g9d"></div><div class="g9-fb" id="g9f"></div><div class="g9-sw"><button type="button" class="g9-l" id="g9L">${SV(I.l)}Mal</button><button type="button" class="g9-r" id="g9R">Bien${SV(I.r)}</button></div></div>`;
    const deck = body.querySelector('#g9d'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const q = R[i];
      deck.innerHTML = `<div class="g9-card" id="g9k"><small>${mode === 'gram' ? '¿Está bien escrita?' : '¿Significa esto?'} · ${i + 1}/${R.length}</small><b>${esc(q.show)}</b>${mode === 'mean' ? `<em>= ${esc(q.es)}</em>` : ''}<span class="g9-st ok">BIEN</span><span class="g9-st no">MAL</span></div>`;
      const card = deck.querySelector('#g9k'); fb.innerHTML = '';
      const ans = await new Promise(done => { let fin = false; const T = g9Timer(tm, SEC, () => { if (fin) return; fin = true; done(null); });
        const go = v => { if (fin) return; fin = true; T.stop(); card.classList.add(v ? 'outR' : 'outL'); setTimeout(() => done(v), 260); };
        body.querySelector('#g9L').onclick = () => go(false); body.querySelector('#g9R').onclick = () => go(true);
        let sx = null; card.onpointerdown = e => { sx = e.clientX; try { card.setPointerCapture(e.pointerId); } catch (er) { } card.style.transition = 'none'; };
        card.onpointermove = e => { if (sx == null) return; const dx = e.clientX - sx; card.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`; card.classList.toggle('lOk', dx > 40); card.classList.toggle('lNo', dx < -40); };
        card.onpointerup = e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; card.style.transition = ''; if (Math.abs(dx) > 70) go(dx > 0); else { card.style.transform = ''; card.classList.remove('lOk', 'lNo'); } }; });
      const ok = ans === q.truth;
      if (ok) { c++; combo++; sfx('ok'); fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}¡Correcto!</span>${comboHTML(combo)}`; weak(q.it, true); }
      else { combo = 0; sfx('bad'); missed.push(q.it); weak(q.it, false); fb.innerHTML = `<span class="g9-no">${ans === null ? '¡Tiempo! ' : ''}${mode === 'gram' ? (q.truth ? 'Esa estaba bien escrita.' : `Lo correcto es: <b>${esc(q.it.en)}</b>`) : (q.truth ? 'Sí significaba eso.' : `<b>${esc(q.it.en)}</b> = ${esc(q.it.es)}`)}</span>`; }
      body.querySelector('#g9cb').innerHTML = comboHTML(combo) || `${R.length - i - 1} cartas`;
      if (q.it.au && (!ok || mode === 'gram')) { try { M().play(q.it.au); } catch (e) { } }
      await sleep(ok ? 1000 : 2200);
    }
    return g9End(stage, c, R.length, mode === 'gram' ? 'writing' : 'reading', missed, `${c} de ${R.length} · Continuar`);
  };

  // 🎤 Teens · Rap de la frase: escucha, sigue el beat y dila a tiempo
  G9.g9Beat = async function (stage, p) {
    const S = shuffle(uniq((p.sentences || []).filter(x => x.en && x.au && x.en.split(' ').length >= 2 && x.en.split(' ').length <= 7))).slice(0, 3);
    if (S.length < 2) return G9.g9Swipe(stage, p); let c = 0;
    for (let i = 0; i < S.length; i++) {
      if (!stage.isConnected) break; const it = S[i];
      const body = frame(stage, 'Practice', 'Beat challenge', 'Escucha la frase, sigue el beat y dila a tiempo. Te califico la pronunciación.');
      body.innerHTML = `<div class="g9 g9-t">${g9Top('Beat challenge', `${i + 1} / ${S.length}`)}<div class="g9-beat">${[0, 1, 2, 3].map(k => `<i data-b="${k}"></i>`).join('')}</div><div class="g9-lyr"><b>${esc(it.en)}</b><small>${esc(it.es || '')}</small></div>
        <div class="g9-wave" id="g9w">${Array.from({ length: 9 }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div><div class="g9-ctl"><button type="button" class="g9-au" id="g9a">${SV(I.vol)}Modelo</button><button type="button" class="g9-mic" id="g9m">${SV(I.mic)}<span>¡Dila!</span></button></div><div class="g9-fb" id="g9f"></div></div>`;
      body.querySelector('.g9-tm').style.visibility = 'hidden';
      const fb = body.querySelector('#g9f'), mic = body.querySelector('#g9m'), wave = body.querySelector('#g9w'), beats = [...body.querySelectorAll('.g9-beat i')];
      body.querySelector('#g9a').onclick = () => play(it.au);
      const countIn = async () => { for (let k = 0; k < 4; k++) { if (!stage.isConnected) return; beats.forEach((b, j) => b.classList.toggle('on', j === k)); sfx('tap'); await sleep(420); } beats.forEach(b => b.classList.remove('on')); };
      await sleep(250); await play(it.au);
      const ok = await new Promise(done => { let tries = 0; const go = async () => { mic.disabled = true; fb.innerHTML = '<span class="g9-mid">Prepárate… 1, 2, 3, 4</span>'; await countIn(); if (!stage.isConnected) return;
          fb.innerHTML = '<span class="g9-mid">¡Ahora! Te escucho…</span>'; wave.classList.add('on'); mic.classList.add('rec');
          const r = await RS(it.en, Math.max(3500, it.en.split(' ').length * 800 + 2000)); wave.classList.remove('on'); mic.classList.remove('rec'); mic.disabled = false; tries++;
          if (judge(r, it.en, false)) { sfx('ok'); try { M().praise(); } catch (e) { } fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}¡En el ritmo!${r && r.score != null ? ` ${r.score}%` : ''}</span>`; setTimeout(() => done(true), 1300); return; }
          sfx('bad'); fb.innerHTML = `<span class="g9-no">${tries >= 2 ? 'Escucha el modelo. ¡La próxima sale!' : 'Escucha el modelo y otra vez.'}</span>`;
          if (tries >= 2) { await play(it.au); setTimeout(() => done(false), 600); } };
        mic.onclick = go; });
      if (ok) c++;
    }
    return g9End(stage, c, S.length, 'speaking', [], `${c} de ${S.length} en el ritmo · Continuar`);
  };
  /* =================== v448 · JUEGOS PROPIOS DEL MÓDULO 2 (Kids y Teens): distintos a los del Módulo 1 =================== */
  const words9 = s => String(s || '').trim().split(/\s+/).filter(Boolean);
  const ADULT9 = /\b(work|works|worked|working|job|office|boss|meeting|coffee|beer|wine|salary|company|client|clients|colleague|husband|wife|bank|hotel|drive|drives|car|deadline|mortgage|raise|lottery|quit|resign|interview|contract|invoice|tax|taxes|loan|budget|employee|employees|manager|business|report|presentation|presentations|meetings|promotion|hired|fired|landlord|rent)\b/i; // los niños no trabajan
  const young9 = () => /kids|teens/.test(ag());
  const okS9 = s => !(young9() && ADULT9.test(s.en || ''));
  const sents9 = (p, lo, hi) => uniq((p.sentences || []).concat(p.vocab || []).filter(s => s.en && s.au && s.es && okS9(s) && words9(s.en).length >= lo && words9(s.en).length <= hi));
  // 🚂 Kids · Tren de palabras: escucha la frase y sube las palabras al tren en orden
  G9.g9Train = async function (stage, p) {
    const S = shuffle(sents9(p, 3, 7)).sort((a, b) => /[.!?]$/.test(b.en) - /[.!?]$/.test(a.en)).slice(0, 3); if (S.length < 2) return null; let c = 0; const missed = [];
    for (let i = 0; i < S.length; i++) {
      if (!stage.isConnected) break; const it = S[i], W = words9(it.en), tiles = shuffle(W.map((w, k) => ({ w, k })));
      const body = frame(stage, 'Practice', 'Tren de palabras', 'Escucha a Mr. Arrieta y sube las palabras al tren en el orden correcto.');
      body.innerHTML = `<div class="g9 g9-k">${g9Top('Tren de palabras', `${i + 1} / ${S.length}`)}<button type="button" class="g9-au" id="g9a">${SV(I.vol)}Escuchar otra vez</button><div class="g9-es">${esc(it.es)}</div>
        <div class="g9-rail"><div class="g9-train" id="g9t"><span class="g9-loco"><i class="w1"></i><i class="w2"></i></span>${W.map((w, k) => `<span class="g9-wg" data-k="${k}"><b></b><i class="w1"></i><i class="w2"></i></span>`).join('')}</div></div>
        <div class="g9-tiles">${tiles.map((t, k) => `<button type="button" class="g9-tl" data-k="${k}">${esc(t.w)}</button>`).join('')}</div><div class="g9-fb" id="g9f"></div></div>`;
      body.querySelector('.g9-tm').style.visibility = 'hidden';
      body.querySelector('#g9a').onclick = () => play(it.au); await sleep(300); play(it.au);
      const errs = await new Promise(done => { let pos = 0, e = 0; const fb = body.querySelector('#g9f'), wg = body.querySelectorAll('.g9-wg');
        body.querySelectorAll('.g9-tl').forEach(b => b.onclick = async () => { if (b.disabled) return; const t = tiles[+b.dataset.k];
          if (t.w.toLowerCase() === W[pos].toLowerCase()) { b.disabled = true; b.classList.add('used'); const g = wg[pos]; g.querySelector('b').textContent = W[pos]; g.classList.add('on'); pos++; sfx('tap');
            if (pos === W.length) { sfx('ok'); fb.innerHTML = e <= 1 ? `<span class="g9-yes">${SV(I.ck)}¡Choo choo! ¡Perfecto!</span>` : `<span class="g9-mid">¡Lo lograste!</span>`; await sleep(500); body.querySelector('#g9t').classList.add('go'); await play(it.au); await sleep(700); done(e); } }
          else { e++; b.classList.add('shake', 'bad'); sfx('bad'); fb.innerHTML = `<span class="g9-no">Esa no va ahí. ¡Escucha otra vez!</span>`; setTimeout(() => b.classList.remove('shake', 'bad'), 450); } }); });
      const ok = errs <= 1; weak(it, ok); if (ok) c++; else missed.push(it);
    }
    return g9End(stage, c, S.length, 'listening', missed, `¡${c} de ${S.length} trenes perfectos! Continuar`);
  };
  // 🃏 Kids · Memoria: voltea 2 cartas y encuentra la pareja (inglés ↔ español)
  G9.g9Memory = async function (stage, p) {
    let P = vocab(p).filter(v => okS9(v) && v.en.length < 24 && v.es.length < 26); if (P.length < 4) P = sents9(p, 1, 4).filter(s => s.en.length < 24); if (P.length < 4) return null;
    P = shuffle(P).slice(0, 4); const C = shuffle(P.flatMap((v, k) => [{ k, t: v.en, en: true }, { k, t: v.es, en: false }])); let found = 0, moves = 0; const missed = new Set();
    const body = frame(stage, 'Practice', 'Memoria', 'Voltea dos cartas y encuentra cada palabra en inglés con su significado.');
    body.innerHTML = `<div class="g9 g9-k">${g9Top('Memoria', `<span id="g9n">0 / 4 parejas</span>`)}<div class="g9-mem">${C.map((x, i) => `<button type="button" class="g9-mc ${x.en ? 'en' : 'es'}" data-i="${i}"><span class="bk">${SV(I.star)}</span><span class="fr">${esc(x.t)}</span></button>`).join('')}</div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden';
    await new Promise(done => { let a = null, lock = false; const fb = body.querySelector('#g9f');
      body.querySelectorAll('.g9-mc').forEach(b => b.onclick = async () => { if (lock || b.classList.contains('up')) return; const x = C[+b.dataset.i]; b.classList.add('up'); if (x.en) play(P[x.k].au); else sfx('flip');
        if (!a) { a = b; return; } const y = C[+a.dataset.i]; moves++; lock = true;
        if (y.k === x.k) { [a, b].forEach(z => z.classList.add('ok')); found++; burst(b); sfx('ok'); body.querySelector('#g9n').textContent = `${found} / 4 parejas`; fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}¡Pareja! <b>${esc(P[x.k].en)}</b> = ${esc(P[x.k].es)}</span>`; a = null; lock = false; if (found === 4) { await sleep(1200); done(); } }
        else { missed.add(x.k); missed.add(y.k); fb.innerHTML = `<span class="g9-no">No son pareja. ¡Recuerda dónde están!</span>`; await sleep(1000); [a, b].forEach(z => z.classList.remove('up')); a = null; lock = false; } }); });
    const c = Math.max(0, 4 - Math.max(0, moves - 6) / 2 | 0); P.forEach((v, k) => weak(v, !missed.has(k)));
    return g9End(stage, Math.min(4, c), 4, 'reading', [...missed].map(k => P[k]), `¡4 parejas en ${moves} intentos! Continuar`);
  };
  // ⚡ Teens · Gap rush: completa la frase antes de que se acabe el tiempo
  const FAM9 = [['is', 'are', 'am'], ['was', 'were', 'is'], ['do', 'does', 'did'], ["don't", "doesn't", "didn't"], ['has', 'have', 'had'], ['in', 'on', 'at'], ['always', 'never', 'sometimes'], ['usually', 'rarely', 'often'], ['can', 'must', 'should'], ["can't", "mustn't", "shouldn't"], ['myself', 'yourself', 'himself', 'herself', 'themselves'], ['up', 'down', 'off', 'on', 'out'], ['past', 'at', 'on'], ['went', 'go', 'goes'], ['ate', 'eat', 'eats'], ['saw', 'see', 'sees'], ['bought', 'buy', 'buys'], ['had', 'have', 'has']];
  const gap9 = (s, V) => { const W = words9(s.en), VT = ' ' + V.map(v => v.en.toLowerCase()).join(' ') + ' '; const F = shuffle(FAM9).sort((a, b) => b.some(w => VT.includes(' ' + w)) - a.some(w => VT.includes(' ' + w))); for (const fam of F) for (let k = 1; k < W.length; k++) { const w = W[k].replace(/[.,!?]$/, ''); if (fam.includes(w.toLowerCase())) return { k, a: w, opts: shuffle([w].concat(shuffle(fam.filter(x => x !== w.toLowerCase())).slice(0, 2))) }; }
    for (let k = 0; k < W.length; k++) { const m = W[k].replace(/[.,!?]$/, '').match(/^(I|You|We|They|He|She|It|you|we|they|he|she|it)'(m|re|s)$/); if (m && W.length > 2) { const a = m[0]; return { k, a, opts: shuffle(['m', 're', 's'].map(x => m[1] + "'" + x)) }; } }
    const vp = V.filter(v => /\s/.test(v.en.trim()) && words9(v.en).length <= 4 && !/[.!?]$/.test(v.en.trim())); for (const v of shuffle(vp)) { const P = words9(v.en.toLowerCase()), k = W.findIndex((w, i) => P.every((x, j) => (W[i + j] || '').replace(/[.,!?]$/, '').toLowerCase() === x)); if (k >= 0 && P.length < W.length) { const o = shuffle(vp.filter(x => x.en.toLowerCase() !== v.en.toLowerCase())).slice(0, 2).map(x => x.en); if (o.length === 2) { const a = W.slice(k, k + P.length).join(' ').replace(/[.,!?]$/, ''); return { k, n: P.length, a, opts: shuffle([a].concat(o)) }; } } }
    const vw = V.filter(v => !/\s/.test(v.en.trim())); for (const v of shuffle(vw)) { const k = W.findIndex((w, i) => i > 0 && w.replace(/[.,!?]$/, '').toLowerCase() === v.en.toLowerCase()); if (k > 0) { const o = shuffle(vw.filter(x => x.en !== v.en)).slice(0, 2).map(x => x.en); if (o.length === 2) return { k, a: W[k].replace(/[.,!?]$/, ''), opts: shuffle([W[k].replace(/[.,!?]$/, '')].concat(o)) }; } } return null; };
  G9.g9Gap = async function (stage, p) {
    const V = vocab(p), R = shuffle(uniq((p.sentences || []).concat(V.filter(v => words9(v.en).length >= 4))).filter(s => s.en && s.au && s.es && okS9(s) && words9(s.en).length >= 4 && !/^(yes|no)\b/i.test(s.en) && s.en.length < 70)).map(s => ({ s, g: gap9(s, V) })).filter(x => x.g).slice(0, 5);
    if (R.length < 3) return null; const SEC = 9; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Gap rush', 'Elige la palabra que completa la frase. ¡Tienes pocos segundos!');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('Gap rush', `<span id="g9cb">0 / ${R.length}</span>`)}<div class="g9-gap" id="g9g"></div><div class="g9-fb" id="g9f"></div></div>`;
    const box = body.querySelector('#g9g'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const { s, g } = R[i], W = words9(s.en), tail = (W[g.k + (g.n || 1) - 1].match(/[.,!?]$/) || [''])[0];
      box.innerHTML = `<small>${i + 1} / ${R.length}</small><b>${W.slice(0, g.k).map(esc).join(' ')} <span class="g9-blank">____</span>${esc(tail)} ${W.slice(g.k + (g.n || 1)).map(esc).join(' ')}</b><em class="g9-ges">${esc(s.es)}</em><div class="g9-go">${g.opts.map((o, k) => `<button type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div>`; fb.innerHTML = '';
      const ok = await new Promise(done => { let fin = false; const T = g9Timer(tm, SEC, () => { if (fin) return; fin = true; fb.innerHTML = `<span class="g9-no">¡Tiempo! Era <b>${esc(g.a)}</b>.</span>`; done(false); });
        box.querySelectorAll('.g9-go button').forEach(b => b.onclick = () => { if (fin) return; fin = true; T.stop(); const r = g.opts[+b.dataset.k] === g.a; box.querySelectorAll('.g9-go button').forEach(x => { x.disabled = true; if (g.opts[+x.dataset.k] === g.a) x.classList.add('ok'); }); if (!r) b.classList.add('bad');
          box.querySelector('.g9-blank').textContent = g.a; box.querySelector('.g9-blank').classList.add('in'); sfx(r ? 'ok' : 'bad'); combo = r ? combo + 1 : 0; fb.innerHTML = r ? (comboHTML(combo) || `<span class="g9-yes">${SV(I.ck)}Nice!</span>`) : `<span class="g9-no">Era <b>${esc(g.a)}</b>.</span>`; done(r); }); });
      await play(s.au); await sleep(500); if (ok) c++; else missed.push(s); weak(s, ok); body.querySelector('#g9cb').textContent = `${c} / ${R.length}`;
    }
    return g9End(stage, c, R.length, 'reading', missed, `${c} de ${R.length} completadas · Continuar`);
  };
  // 🔤 Teens · Spelling rush: escucha la palabra y ármala con las letras
  G9.g9Spell = async function (stage, p) {
    const V = shuffle(vocab(p).filter(v => okS9(v) && /^[a-z]{3,10}$/i.test(v.en.trim()))).slice(0, 4); if (V.length < 3) return null; const SEC = 15; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Spelling rush', 'Escucha la palabra y ármala tocando las letras en orden. ¡Contra reloj!');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('Spelling rush', `<span id="g9cb">0 / ${V.length}</span>`)}<button type="button" class="g9-au" id="g9a">${SV(I.vol)}Escuchar otra vez</button><div class="g9-sp" id="g9s"></div><div class="g9-fb" id="g9f"></div></div>`;
    const box = body.querySelector('#g9s'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm'); let cur = null; body.querySelector('#g9a').onclick = () => cur && play(cur.au);
    for (let i = 0; i < V.length; i++) {
      if (!stage.isConnected) break; const it = V[i]; cur = it; const L = it.en.trim().toLowerCase().split(''); let T9 = shuffle(L.map((ch, k) => ({ ch, k }))); if (T9.map(x => x.ch).join('') === L.join('')) T9 = T9.reverse();
      box.innerHTML = `<small>${esc(it.es)}</small><div class="g9-slots">${L.map(() => '<i></i>').join('')}</div><div class="g9-lt">${T9.map((x, k) => `<button type="button" data-k="${k}">${esc(x.ch)}</button>`).join('')}</div>`; fb.innerHTML = '';
      await sleep(250); play(it.au);
      const ok = await new Promise(done => { let fin = false, pos = 0, e = 0; const sl = box.querySelectorAll('.g9-slots i'); const T = g9Timer(tm, SEC, () => { if (fin) return; fin = true; fb.innerHTML = `<span class="g9-no">¡Tiempo! Era <b>${esc(it.en)}</b>.</span>`; play(it.au); setTimeout(() => done(false), 1300); });
        box.querySelectorAll('.g9-lt button').forEach(b => b.onclick = () => { if (fin || b.disabled) return; const x = T9[+b.dataset.k];
          if (x.ch === L[pos]) { b.disabled = true; sl[pos].textContent = x.ch; sl[pos].classList.add('on'); pos++; sfx('tap');
            if (pos === L.length) { fin = true; T.stop(); const r = e <= 1; combo = r ? combo + 1 : 0; sfx('ok'); box.querySelector('.g9-slots').classList.add('done'); fb.innerHTML = r ? (comboHTML(combo) || `<span class="g9-yes">${SV(I.ck)}Perfect!</span>`) : `<span class="g9-mid">¡Lo armaste!</span>`; setTimeout(() => done(r), 900); } }
          else { e++; b.classList.add('shake', 'bad'); sfx('bad'); setTimeout(() => b.classList.remove('shake', 'bad'), 400); } }); });
      weak(it, ok); if (ok) c++; else missed.push(it); body.querySelector('#g9cb').textContent = `${c} / ${V.length}`;
    }
    return g9End(stage, c, V.length, 'listening', missed, `${c} de ${V.length} palabras perfectas · Continuar`);
  };
  // 🔎 Adultos · Detective de errores: toca la palabra que está mal
  const V3 = { works: 'work', lives: 'live', likes: 'like', has: 'have', goes: 'go', wants: 'want', speaks: 'speak', plays: 'play', watches: 'watch', eats: 'eat', drinks: 'drink', gets: 'get', takes: 'take', studies: 'study', reads: 'read', cooks: 'cook', wakes: 'wake', runs: 'run', does: 'do', needs: 'need', loves: 'love', looks: 'look' };
  const PST = { go: 'went', eat: 'ate', see: 'saw', buy: 'bought', have: 'had', take: 'took', come: 'came', make: 'made', get: 'got', play: 'played', watch: 'watched', drink: 'drank', do: 'did', sleep: 'slept', visit: 'visited', cook: 'cooked' };
  const REFL = ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'];
  const HUNT9 = [[/\b(He|She|It|he|she|it) (works|lives|likes|has|goes|wants|speaks|plays|watches|eats|drinks|gets|takes|studies|reads|cooks|wakes|runs|does|needs|loves|looks)\b/, (m, a, v) => a + ' ' + V3[v]],
    [/\b(didn't|Did you|did you|Did he|did he|Did she|did she) (go|eat|see|buy|have|take|come|make|get|play|watch|drink|do|sleep|visit|cook)\b/, (m, a, v) => a + ' ' + PST[v]],
    [/\b(can|must|should|can't|mustn't|shouldn't) (go|eat|see|buy|take|come|make|get|play|watch|drink|sleep|swim|speak|cook|wear|use|stay|drive|run|read|leave|rest|call)\b/, (m, a, v) => a + ' ' + v + (/(ch|sh|o)$/.test(v) ? 'es' : 's')],
    [new RegExp('\\b(' + REFL.join('|') + ')\\b'), (m, r) => shuffle(REFL.filter(x => x !== r))[0]], [/\ba ([bcdfgjklmnpqrstvwxyz]\w+)/, 'an $1']];
  HUNT9.push([/\b(I|You|We|They|you|we|they) (have|get|go|work|live|like|want|eat|drink|take|play|watch|wake|study|need|love|start|finish|leave)\b/, (m, a, v) => a + ' ' + ({ have: 'has', go: 'goes', watch: 'watches', study: 'studies', finish: 'finishes' }[v] || v + 's')]);
  const breakH = s => { for (const [re, to] of shuffle(HUNT9.concat(BREAK))) { if (re.test(s)) { const w = s.replace(re, to); if (w !== s) return w; } } return null; };
  G9.g9Hunt = async function (stage, p) {
    const S = uniq((p.sentences || []).concat(p.vocab || [], (p.keyq || []).map(k => ({ en: k.a, es: '', au: k.aau })))).filter(x => x.en && x.au && words9(x.en).length >= 3 && x.en.length < 70);
    const R = shuffle(S.map(x => { const w = breakH(x.en); if (!w) return null; const A = words9(x.en), B = words9(w); if (A.length !== B.length) return null; const d = B.findIndex((t, k) => t !== A[k]); return d < 0 ? null : { x, B, d, fix: A[d] }; }).filter(Boolean)).slice(0, 4);
    if (R.length < 3) return null; const SEC = 12; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Detective de errores', 'Cada frase tiene un error. Tócalo antes de que se acabe el tiempo.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Detective de errores', `<span id="g9cb">0 / ${R.length}</span>`)}<div class="g9-hunt" id="g9h"></div><div class="g9-fb" id="g9f"></div></div>`;
    const box = body.querySelector('#g9h'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const q = R[i];
      box.innerHTML = `<small>Frase ${i + 1} de ${R.length} · ¿Dónde está el error?</small><div class="g9-hw">${q.B.map((t, k) => `<button type="button" data-k="${k}">${esc(t)}</button>`).join('')}</div>`; fb.innerHTML = '';
      const ok = await new Promise(done => { let fin = false, miss = false; const end = r => { fin = true; T.stop(); const b = box.querySelector(`[data-k="${q.d}"]`); b.classList.add('fix'); b.innerHTML = `<s>${esc(q.B[q.d])}</s> ${esc(q.fix)}`; box.querySelectorAll('button').forEach(x => x.disabled = true); done(r); };
        const T = g9Timer(tm, SEC, () => { if (fin) return; fb.innerHTML = `<span class="g9-no">¡Tiempo! Mira la corrección.</span>`; end(false); });
        box.querySelectorAll('button').forEach(b => b.onclick = () => { if (fin) return; if (+b.dataset.k === q.d) { sfx('ok'); combo = miss ? 0 : combo + 1; fb.innerHTML = miss ? `<span class="g9-mid">¡Encontrado!</span>` : (comboHTML(combo) || `<span class="g9-yes">${SV(I.ck)}¡Bien visto!</span>`); end(!miss); }
          else { miss = true; combo = 0; b.classList.add('shake', 'bad'); sfx('bad'); fb.innerHTML = `<span class="g9-no">Esa palabra está bien. Sigue buscando.</span>`; setTimeout(() => b.classList.remove('shake'), 450); } }); });
      await play(q.x.au); await sleep(500); if (ok) c++; else missed.push(q.x); weak(q.x, ok); body.querySelector('#g9cb').textContent = `${c} / ${R.length}`;
    }
    return g9End(stage, c, R.length, 'reading', missed, `${c} de ${R.length} errores cazados · Continuar`);
  };
  // ✍️ Adultos · Dictado relámpago: escucha y escribe la palabra que falta
  const nk9 = s => String(s || '').toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9' ]/g, '').trim();
  G9.g9Dict = async function (stage, p) {
    const V = vocab(p); const R = shuffle(uniq((p.sentences || []).concat(V.filter(v => words9(v.en).length >= 4))).filter(s => s.en && s.au && words9(s.en).length >= 4 && !/^(yes|no)\b/i.test(s.en) && s.en.length < 70)).map(s => ({ s, g: gap9(s, V) })).filter(x => x.g).slice(0, 4);
    if (R.length < 3) return null; let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Dictado relámpago', 'Escucha la frase y escribe la palabra que falta.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Dictado relámpago', `<span id="g9cb">0 / ${R.length}</span>`)}<button type="button" class="g9-au" id="g9a">${SV(I.vol)}Escuchar otra vez</button><div class="g9-dic" id="g9d"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const box = body.querySelector('#g9d'), fb = body.querySelector('#g9f'); let cur = null; body.querySelector('#g9a').onclick = () => cur && play(cur.au);
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const { s, g } = R[i], W = words9(s.en), tail = (W[g.k + (g.n || 1) - 1].match(/[.,!?]$/) || [''])[0]; cur = s;
      box.innerHTML = `<small>${i + 1} / ${R.length}</small><b>${W.slice(0, g.k).map(esc).join(' ')} <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Palabra que falta" style="width:${Math.max(4, g.a.length + 1)}ch">${esc(tail)} ${W.slice(g.k + (g.n || 1)).map(esc).join(' ')}</b><button type="button" class="g9-chk">Comprobar</button>`; fb.innerHTML = '';
      const inp = box.querySelector('input'); await sleep(250); play(s.au); try { inp.focus(); } catch (e) { }
      const ok = await new Promise(done => { let tries = 0; const go = () => { const v = nk9(inp.value); if (!v) return; if (v === nk9(g.a)) { inp.classList.add('ok'); inp.disabled = true; sfx('ok'); fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}${tries ? '¡Ahora sí!' : '¡Perfecto!'}</span>`; setTimeout(() => done(!tries), 900); return; }
          tries++; sfx('bad'); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 450);
          if (tries >= 2) { inp.value = g.a; inp.disabled = true; inp.classList.add('fix'); fb.innerHTML = `<span class="g9-no">Era <b>${esc(g.a)}</b>.</span>`; play(s.au); setTimeout(() => done(false), 1600); } else fb.innerHTML = `<span class="g9-no">Casi. Escucha otra vez e inténtalo.</span>`; };
        box.querySelector('.g9-chk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; });
      if (ok) c++; else missed.push(s); weak(s, ok); body.querySelector('#g9cb').textContent = `${c} / ${R.length}`;
    }
    return g9End(stage, c, R.length, 'writing', missed, `${c} de ${R.length} al primer intento · Continuar`);
  };
  // si a una lección le faltan datos para su juego, prueba el otro juego del módulo y luego el del Módulo 1
  { const B9 = Object.assign({}, G9); [['g9Train', 'g9Memory', 'g9Stars'], ['g9Memory', 'g9Train', 'g9Stars'], ['g9Gap', 'g9Spell', 'g9Swipe'], ['g9Spell', 'g9Gap', 'g9Swipe'], ['g9Hunt', 'g9Dict', 'g9Chat'], ['g9Dict', 'g9Hunt', 'g9Pairs']].forEach(([k, ...alt]) => { G9[k] = async (st, p) => { let r = await B9[k](st, p); for (const a of alt) { if (r !== null) break; r = await B9[a](st, p); } return r; }; }); }
  /* =================== v449 · JUEGOS PROPIOS DE LOS MÓDULOS 3 Y 4 (todas las edades) =================== */
  const others9 = (p, n) => { let A = []; try { A = M().allParts().filter(x => x.id !== p.id && x.topic !== p.topic); } catch (e) { } return shuffle(uniq(A.flatMap(x => vocab(x)).filter(v => okS9(v) && v.en.length < 30))).slice(0, n); };
  // pregunta de opción múltiple reutilizable: devuelve true/false
  const mcq9 = (box, fb, opts, ai, o = {}) => new Promise(done => { let fin = false, used = false; const T = o.tm ? g9Timer(o.tm, o.sec, () => { if (fin) return; fin = true; mark(-1); fb.innerHTML = `<span class="g9-no">¡Tiempo! Era <b>${esc(opts[ai])}</b>.</span>`; setTimeout(() => done(false), 1200); }) : null;
    const bs = [...box.querySelectorAll('[data-o]')]; const mark = k => bs.forEach(x => { x.disabled = true; if (+x.dataset.o === ai) x.classList.add('ok'); else if (+x.dataset.o === k) x.classList.add('bad'); });
    if (o.fifty) o.fifty.onclick = () => { if (fin || used) return; used = true; o.fifty.disabled = true; shuffle(bs.filter(x => +x.dataset.o !== ai)).slice(0, Math.max(0, bs.length - 2)).forEach(x => { x.disabled = true; x.classList.add('gone'); }); o.onFifty && o.onFifty(); };
    bs.forEach(b => b.onclick = () => { if (fin) return; fin = true; T && T.stop(); const k = +b.dataset.o, r = k === ai; mark(k); sfx(r ? 'ok' : 'bad'); if (r) burst(b); fb.innerHTML = r ? `<span class="g9-yes">${SV(I.ck)}${o.yes || '¡Bien!'}</span>` : `<span class="g9-no">Era <b>${esc(opts[ai])}</b>.</span>`; setTimeout(() => done(r), r ? 800 : 1400); }); });
  const optsHTML = (opts, cls) => `<div class="g9-mq ${cls || ''}">${opts.map((t, k) => `<button type="button" data-o="${k}">${esc(t)}</button>`).join('')}</div>`;
  const pickOpts = (it, pool, key, n) => { const sn = x => /[.!?]$/.test(String(x.en || '').trim()), L = String(it[key]).length; const cand = shuffle(pool.filter(x => x[key] && x[key] !== it[key])).sort((a, b) => ((sn(a) !== sn(it)) * 100 + Math.abs(a[key].length - L)) - ((sn(b) !== sn(it)) * 100 + Math.abs(b[key].length - L))).map(x => x[key]).filter((v, i, a) => a.indexOf(v) === i); const o = shuffle([it[key]].concat(shuffle(cand.slice(0, n + 1)).slice(0, n - 1))); return { o, a: o.indexOf(it[key]) }; };

  // ⛰️ Kids M3 · Sube la montaña: escucha y elige el significado; cada acierto es un paso hacia la cima
  G9.g9Climb = async function (stage, p) {
    const V = vocab(p).filter(v => okS9(v) && v.es.length < 40); if (V.length < 4) return null; const R = shuffle(V).slice(0, 5); let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Sube la montaña', 'Escucha a Mr. Arrieta y elige lo que significa. Cada acierto te sube un paso.');
    body.innerHTML = `<div class="g9 g9-k">${g9Top('Sube la montaña', `<span id="g9n">0 / ${R.length}</span>`)}<div class="g9-mt"><svg viewBox="0 0 300 120" aria-hidden="true"><path d="M0 120 L120 20 L170 60 L210 30 L300 120Z" fill="#c7e6c1"/><path d="M120 20 L105 33 L135 33Z M210 30 L200 40 L220 40Z" fill="#fff"/></svg><i class="g9-fl"></i><b class="g9-me" id="g9me"></b></div><button type="button" class="g9-au" id="g9a">${SV(I.vol)}Escuchar otra vez</button><div id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), me = body.querySelector('#g9me'); let cur = null; body.querySelector('#g9a').onclick = () => cur && play(cur.au);
    const pos = n => { const t = n / R.length; me.style.left = (8 + t * 34) + '%'; me.style.bottom = (6 + t * 66) + '%'; }; pos(0);
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const it = R[i]; cur = it; const { o, a } = pickOpts(it, V, 'es', 3);
      q.innerHTML = optsHTML(o, 'kd'); fb.innerHTML = ''; await sleep(250); play(it.au);
      const ok = await mcq9(q, fb, o, a, { yes: '¡Un paso más!' }); if (ok) { c++; pos(c); } else missed.push(it); weak(it, ok); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    if (c === R.length) body.querySelector('.g9-mt').classList.add('top');
    return g9End(stage, c, R.length, 'listening', missed, c === R.length ? '¡Llegaste a la cima! Continuar' : `¡Subiste ${c} de ${R.length} pasos! Continuar`);
  };
  // 🧩 Kids M3 · Rompecabezas: une el comienzo y el final de cada frase
  const halves9 = s => { const W = words9(s.en); if (W.length < 4) return null; let k = W.findIndex((w, i) => i >= 2 && i <= W.length - 2 && /,$/.test(W[i - 1])); if (k < 0) k = Math.ceil(W.length / 2); return [W.slice(0, k).join(' '), W.slice(k).join(' ')]; };
  G9.g9Puzzle = async function (stage, p) {
    let S = shuffle(sents9(p, 4, 11).filter(s => /[.!?]$/.test(s.en) && !/…|\.\.\./.test(s.en))).slice(0, 3).map(s => ({ s, h: halves9(s) })).filter(x => x.h); if (S.length < 3) return null;
    const L = shuffle(S.map((x, k) => k)), R2 = shuffle(S.map((x, k) => k)); let found = 0, errs = 0; const missed = new Set();
    const body = frame(stage, 'Practice', 'Rompecabezas', 'Toca un comienzo y luego su final para armar cada frase.');
    body.innerHTML = `<div class="g9 g9-k">${g9Top('Rompecabezas', `<span id="g9n">0 / 3</span>`)}<div class="g9-pz"><div>${L.map(k => `<button type="button" class="g9-pp a" data-k="${k}">${esc(S[k].h[0])}</button>`).join('')}</div><div>${R2.map(k => `<button type="button" class="g9-pp b" data-k="${k}">${esc(S[k].h[1])}</button>`).join('')}</div></div><div class="g9-done" id="g9d"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const fb = body.querySelector('#g9f');
    await new Promise(done => { let sel = null; body.querySelectorAll('.g9-pp').forEach(b => b.onclick = () => { if (b.disabled) return;
      if (!sel || sel.classList.contains('a') === b.classList.contains('a')) { if (sel) sel.classList.remove('on'); sel = b; b.classList.add('on'); sfx('tap'); return; }
      const k = +b.dataset.k; if (+sel.dataset.k === k) { [sel, b].forEach(x => { x.disabled = true; x.classList.remove('on'); x.classList.add('g9ok'); }); found++; burst(b); sfx('ok'); play(S[k].s.au); body.querySelector('#g9d').insertAdjacentHTML('beforeend', `<p>${SV(I.ck)}${esc(S[k].s.en)}</p>`); body.querySelector('#g9n').textContent = `${found} / 3`; fb.innerHTML = `<span class="g9-yes">¡Encaja!</span>`; if (found === 3) setTimeout(done, 1800); }
      else { errs++; missed.add(k); missed.add(+sel.dataset.k); [sel, b].forEach(x => { x.classList.add('shake', 'bad'); setTimeout(() => x.classList.remove('shake', 'bad', 'on'), 450); }); sfx('bad'); fb.innerHTML = `<span class="g9-no">Esas piezas no encajan.</span>`; } sel = null; }); });
    S.forEach((x, k) => weak(x.s, !missed.has(k))); const c = 3 - missed.size / 2 | 0;
    return g9End(stage, Math.max(0, Math.min(3, 3 - Math.ceil(errs / 2))), 3, 'reading', [...missed].map(k => S[k].s), `¡3 frases armadas con ${errs} error${errs === 1 ? '' : 'es'}! Continuar`);
  };
  // 🕵️ Teens M3 · El intruso: 3 palabras son de esta lección y 1 no. ¡Encuéntrala!
  G9.g9Odd = async function (stage, p) {
    const V = vocab(p).filter(v => okS9(v) && v.en.length < 30), O = others9(p, 6); const TT = String((p._t && p._t.title) || p.title || '').replace(/\s*\(.*$/, ''); if (V.length < 3 || O.length < 4) return null; const N = 4, SEC = 10; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', 'El intruso', 'Tres expresiones son de esta lección y una no. Toca al intruso antes de que se acabe el tiempo.');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('El intruso', `<span id="g9n">0 / ${N}</span>`)}<div class="g9-gap" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < N; i++) { if (!stage.isConnected) break; const intr = O[i], o = shuffle(shuffle(V).slice(0, 3).map(v => v.en).concat(intr.en)), a = o.indexOf(intr.en);
      q.innerHTML = `<small>Ronda ${i + 1} de ${N}</small><b class="sm">¿Cuál NO es de esta lección?</b>${TT ? `<em class="g9-ges">Tema: ${esc(TT)}</em>` : ''}${optsHTML(o, 'col')}`; fb.innerHTML = '';
      const ok = await mcq9(q, fb, o, a, { tm, sec: SEC, yes: '¡Lo atrapaste!' }); combo = ok ? combo + 1 : 0; if (ok) { c++; const cb = comboHTML(combo); if (cb) fb.innerHTML += cb; } else missed.push(intr); body.querySelector('#g9n').textContent = `${c} / ${N}`; }
    return g9End(stage, c, N, 'reading', [], `${c} de ${N} intrusos atrapados · Continuar`);
  };
  // 🌐 Teens M3 · Traductor express: elige la traducción correcta al inglés
  G9.g9Trans = async function (stage, p) {
    const S = shuffle(uniq((p.sentences || []).concat(vocab(p))).filter(s => s.en && s.es && s.au && okS9(s) && words9(s.en).length >= 3 && s.en.length < 80)).map(s => { const b = [breakH(s.en), breakIt(s.en)].filter(x => x && x !== s.en); return b.length ? { s, w: b } : null; }).filter(Boolean).slice(0, 4);
    if (S.length < 3) return null; const SEC = 12; let c = 0, combo = 0; const missed = [], V = vocab(p);
    const body = frame(stage, 'Practice', 'Traductor express', 'Lee la frase en español y elige la traducción correcta al inglés. ¡Rápido!');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('Traductor express', `<span id="g9n">0 / ${S.length}</span>`)}<div class="g9-gap" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < S.length; i++) { if (!stage.isConnected) break; const { s, w } = S[i]; let d = [...new Set(w)]; if (d.length < 2) { const x = shuffle(V.filter(v => v.en !== s.en && words9(v.en).length >= 3))[0]; if (x) d.push(x.en); } const o = shuffle([s.en].concat(d.slice(0, 2))), a = o.indexOf(s.en);
      q.innerHTML = `<small>${i + 1} / ${S.length}</small><b class="sm">${esc(s.es)}</b>${optsHTML(o, 'col')}`; fb.innerHTML = '';
      const ok = await mcq9(q, fb, o, a, { tm, sec: SEC, yes: 'Nice!' }); combo = ok ? combo + 1 : 0; if (ok) { c++; const cb = comboHTML(combo); if (cb) fb.innerHTML += cb; } else missed.push(s); weak(s, ok); await play(s.au); body.querySelector('#g9n').textContent = `${c} / ${S.length}`; }
    return g9End(stage, c, S.length, 'reading', missed, `${c} de ${S.length} traducciones · Continuar`);
  };
  // ✅ Adultos M3 · Termina la frase: elige el final correcto
  G9.g9Ending = async function (stage, p) {
    const S = shuffle(uniq((p.sentences || []).concat(vocab(p))).filter(s => s.en && s.au && /[.!?]$/.test(s.en) && !/…|\.\.\./.test(s.en) && words9(s.en).length >= 5 && s.en.length < 90)).map(s => ({ s, h: halves9(s) })).filter(x => x.h);
    if (S.length < 4) return null; const R = S.slice(0, 4); let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Termina la frase', 'Lee el comienzo y elige el final que tiene sentido y está bien escrito.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Termina la frase', `<span id="g9n">0 / ${R.length}</span>`)}<div class="g9-hunt" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f');
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const { s, h } = R[i]; const o = shuffle([h[1]].concat(shuffle(S.filter(x => x.s !== s).map(x => x.h[1])).slice(0, 2))), a = o.indexOf(h[1]);
      q.innerHTML = `<small>Frase ${i + 1} de ${R.length}</small><b class="g9-st1">${esc(h[0])} …</b>${optsHTML(o, 'col lt')}`; fb.innerHTML = '';
      const ok = await mcq9(q, fb, o, a, { yes: '¡Exacto!' }); if (ok) c++; else missed.push(s); weak(s, ok); await play(s.au); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    return g9End(stage, c, R.length, 'reading', missed, `${c} de ${R.length} frases completas · Continuar`);
  };
  // 🧱 Adultos M3 · Bloques: ordena los bloques de la frase contra reloj
  const chunks9 = s => { const W = words9(s.en); if (W.length < 6) return null; const n = W.length >= 10 ? 4 : 3, sz = Math.ceil(W.length / n), C = []; for (let i = 0; i < W.length; i += sz) C.push(W.slice(i, i + sz).join(' ')); return C.length >= 3 ? C : null; };
  G9.g9Chunks = async function (stage, p) {
    const R = shuffle(uniq((p.sentences || []).concat(vocab(p))).filter(s => s.en && s.au && s.es && !/…|\.\.\.|\//.test(s.en) && s.en.length < 100)).map(s => ({ s, C: chunks9(s) })).filter(x => x.C).slice(0, 3);
    if (R.length < 2) return null; const SEC = 20; let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Bloques', 'Toca los bloques en orden para armar la frase. ¡Contra reloj!');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Bloques', `<span id="g9n">0 / ${R.length}</span>`)}<div class="g9-hunt" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const { s, C } = R[i]; let T9 = shuffle(C.map((t, k) => ({ t, k }))); if (T9.every((x, k) => x.k === k)) T9 = T9.reverse();
      q.innerHTML = `<small>${i + 1} / ${R.length} · ${esc(s.es)}</small><div class="g9-built" id="g9b"></div><div class="g9-hw ch">${T9.map((x, k) => `<button type="button" data-k="${k}">${esc(x.t)}</button>`).join('')}</div>`; fb.innerHTML = '';
      const ok = await new Promise(done => { let fin = false, pos = 0, e = 0; const T = g9Timer(tm, SEC, () => { if (fin) return; fin = true; q.querySelector('#g9b').textContent = s.en; fb.innerHTML = `<span class="g9-no">¡Tiempo! Así era.</span>`; setTimeout(() => done(false), 1500); });
        q.querySelectorAll('.g9-hw button').forEach(b => b.onclick = () => { if (fin || b.disabled) return; const x = T9[+b.dataset.k]; if (x.k === pos) { b.disabled = true; b.classList.add('fix'); q.querySelector('#g9b').insertAdjacentHTML('beforeend', `<span>${esc(x.t)}</span>`); pos++; sfx('tap'); if (pos === C.length) { fin = true; T.stop(); sfx('ok'); fb.innerHTML = e <= 1 ? `<span class="g9-yes">${SV(I.ck)}¡Perfecto! Te sobraron ${Math.round(T.left())} s.</span>` : `<span class="g9-mid">¡Armada!</span>`; setTimeout(() => done(e <= 1), 1000); } }
          else { e++; b.classList.add('shake', 'bad'); sfx('bad'); setTimeout(() => b.classList.remove('shake', 'bad'), 400); } }); });
      if (ok) c++; else missed.push(s); weak(s, ok); await play(s.au); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    return g9End(stage, c, R.length, 'reading', missed, `${c} de ${R.length} frases armadas · Continuar`);
  };
  // 🎡 Kids M4 · Ruleta: gira la ruleta, escucha la palabra y elige su significado
  G9.g9Wheel = async function (stage, p) {
    const V = shuffle(vocab(p).filter(v => okS9(v) && v.es.length < 40)).slice(0, 6); if (V.length < 4) return null; const N = 4; let c = 0, rot = 0; const missed = [], col = ['#E3242B', '#f59e0b', '#22c55e', '#38a5f0', '#a855f7', '#0B2A5B'];
    const seg = 360 / V.length, grad = V.map((v, k) => `${col[k % 6]} ${k * seg}deg ${(k + 1) * seg}deg`).join(',');
    const body = frame(stage, 'Practice', 'La ruleta', 'Gira la ruleta, escucha la palabra y elige lo que significa.');
    body.innerHTML = `<div class="g9 g9-k">${g9Top('La ruleta', `<span id="g9n">0 / ${N}</span>`)}<div class="g9-wh"><i class="g9-ptr"></i><div class="g9-wd" id="g9w" style="background:conic-gradient(${grad})">${V.map((v, k) => `<span style="transform:rotate(${k * seg + seg / 2}deg)"><b>${k + 1}</b></span>`).join('')}</div><button type="button" class="g9-spin" id="g9s">¡Girar!</button></div><div id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), wd = body.querySelector('#g9w'), sp = body.querySelector('#g9s'); const order = shuffle(V.map((v, k) => k)).slice(0, N);
    for (let i = 0; i < N; i++) { if (!stage.isConnected) break; const k = order[i], it = V[k]; q.innerHTML = ''; fb.innerHTML = `<span class="g9-mid">Toca «¡Girar!»</span>`; sp.disabled = false;
      await new Promise(r => sp.onclick = () => { sp.disabled = true; sfx('flip'); rot += 1440 + (360 - (k * seg + seg / 2)) - (rot % 360); wd.style.transform = `rotate(${rot}deg)`; setTimeout(r, 2300); });
      const { o, a } = pickOpts(it, V, 'es', 3); q.innerHTML = `<div class="g9-wq">${SV(I.vol)}<b>${esc(it.en)}</b></div>${optsHTML(o, 'kd')}`; q.querySelector('.g9-wq').onclick = () => play(it.au); fb.innerHTML = ''; await play(it.au);
      const ok = await mcq9(q, fb, o, a, { yes: '¡Súper!' }); if (ok) c++; else missed.push(it); weak(it, ok); body.querySelector('#g9n').textContent = `${c} / ${N}`; }
    return g9End(stage, c, N, 'listening', missed, `¡${c} de ${N} en la ruleta! Continuar`);
  };
  // 🔡 Kids M4 · La letra perdida: falta una letra, ¿cuál es?
  G9.g9Letter = async function (stage, p) {
    const R = shuffle(vocab(p).filter(v => okS9(v)).map(v => { const W = words9(v.en), k = W.findIndex(w => /^[a-z]{4,}$/i.test(w.replace(/[.,!?]$/, ''))); return k < 0 ? null : { v, W, k }; }).filter(Boolean)).slice(0, 4);
    if (R.length < 3) return null; let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'La letra perdida', 'A una palabra se le perdió una letra. Escucha y elige la letra que falta.');
    body.innerHTML = `<div class="g9 g9-k">${g9Top('La letra perdida', `<span id="g9n">0 / ${R.length}</span>`)}<button type="button" class="g9-au" id="g9a">${SV(I.vol)}Escuchar otra vez</button><div class="g9-lw" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'); let cur = null; body.querySelector('#g9a').onclick = () => cur && play(cur.au);
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const { v, W, k } = R[i]; cur = v; const w = W[k], j = 1 + Math.floor(Math.random() * (w.replace(/[.,!?]$/, '').length - 1)), L = w[j].toLowerCase();
      const o = shuffle([L].concat(shuffle('aeioubcdlmnprst'.split('').filter(x => x !== L)).slice(0, 2))), a = o.indexOf(L);
      q.innerHTML = `<b>${W.map((x, n) => n === k ? esc(x.slice(0, j)) + '<span class="g9-lq">?</span>' + esc(x.slice(j + 1)) : esc(x)).join(' ')}</b><small>${esc(v.es)}</small>${optsHTML(o, 'kd lq3')}`; fb.innerHTML = ''; await sleep(250); play(v.au);
      const ok = await mcq9(q, fb, o, a, { yes: '¡La encontraste!' }); q.querySelector('.g9-lq').textContent = L; q.querySelector('.g9-lq').classList.add('in'); if (ok) c++; else missed.push(v); weak(v, ok); await sleep(400); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    return g9End(stage, c, R.length, 'listening', missed, `¡${c} de ${R.length} letras encontradas! Continuar`);
  };
  // 🏆 Teens M4 · Quiz show: 5 niveles, un comodín 50:50
  G9.g9Show = async function (stage, p) {
    const P = uniq((p.sentences || []).concat(vocab(p))).filter(s => s.en && s.es && okS9(s) && s.en.length < 90); if (P.length < 5) return null; const R = shuffle(P).slice(0, 5); let c = 0; const missed = [], LV = [100, 250, 500, 1000, 2000];
    const body = frame(stage, 'Practice', 'Quiz show', '5 niveles. Elige el significado correcto. Tienes un comodín 50:50.');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('Quiz show', `<span id="g9n">0 pts</span>`)}<div class="g9-lad">${LV.map((x, k) => `<i data-l="${k}">${x}</i>`).join('')}</div><div class="g9-gap" id="g9q"></div><button type="button" class="g9-50" id="g950">50:50</button><div class="g9-fb" id="g9f"></div></div>`;
    const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm'), f50 = body.querySelector('#g950'); let pts = 0;
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const it = R[i]; body.querySelectorAll('.g9-lad i').forEach((x, k) => x.classList.toggle('on', k === i)); const { o, a } = pickOpts(it, P, 'es', 4);
      q.innerHTML = `<small>Nivel ${i + 1} · ${LV[i]} pts</small><b class="sm">${esc(it.en)}</b>${optsHTML(o, 'col')}`; fb.innerHTML = ''; if (it.au) play(it.au);
      const ok = await mcq9(q, fb, o, a, { tm, sec: 15, fifty: f50.disabled ? null : f50, yes: `+${LV[i]} pts` }); if (ok) { c++; pts += LV[i]; body.querySelector(`.g9-lad i[data-l="${i}"]`).classList.add('won'); } else missed.push(it); weak(it, ok); body.querySelector('#g9n').textContent = `${pts} pts`; }
    return g9End(stage, c, R.length, 'reading', missed, `${pts} puntos · ${c} de ${R.length} · Continuar`);
  };
  // ⚖️ Teens M4 · ¿Cuál está bien?: dos versiones, solo una es correcta
  G9.g9AB = async function (stage, p) {
    const R = shuffle(uniq((p.sentences || []).concat(vocab(p))).filter(s => s.en && s.au && okS9(s) && words9(s.en).length >= 3 && s.en.length < 80)).map(s => { const w = breakH(s.en); return w && w !== s.en ? { s, w } : null; }).filter(Boolean).slice(0, 5);
    if (R.length < 3) return null; const SEC = 8; let c = 0, combo = 0; const missed = [];
    const body = frame(stage, 'Practice', '¿Cuál está bien?', 'Dos versiones de la misma frase. Toca la que está bien escrita. ¡Rápido!');
    body.innerHTML = `<div class="g9 g9-t">${g9Top('¿Cuál está bien?', `<span id="g9n">0 / ${R.length}</span>`)}<div class="g9-ab" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f'), tm = body.querySelector('.g9-tm');
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const { s, w } = R[i], o = shuffle([s.en, w]), a = o.indexOf(s.en);
      q.innerHTML = `<small>${i + 1} / ${R.length}</small>${optsHTML(o, 'col ab')}`; fb.innerHTML = '';
      const ok = await mcq9(q, fb, o, a, { tm, sec: SEC, yes: 'Correct!' }); combo = ok ? combo + 1 : 0; if (ok) { c++; const cb = comboHTML(combo); if (cb) fb.innerHTML += cb; } else missed.push(s); weak(s, ok); await play(s.au); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    return g9End(stage, c, R.length, 'reading', missed, `${c} de ${R.length} correctas · Continuar`);
  };
  // 🔐 Adultos M4 · Palabra secreta: lee el significado y escribe la expresión en inglés (con pista)
  G9.g9Secret = async function (stage, p) {
    const R = shuffle(vocab(p).filter(v => words9(v.en).length <= 3 && v.en.length <= 22 && !/[\/()]/.test(v.en))).slice(0, 4); if (R.length < 3) return null; let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Palabra secreta', 'Lee el significado y escribe la expresión en inglés. Te damos la primera letra de cada palabra.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Palabra secreta', `<span id="g9n">0 / ${R.length}</span>`)}<div class="g9-dic" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f');
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const it = R[i], ans = it.en.trim().replace(/[.!?]$/, ''), hint = words9(ans).map(w => w[0] + w.slice(1).replace(/[a-z]/gi, '_')).join('  ');
      q.innerHTML = `<small>${i + 1} / ${R.length}</small><b>${esc(it.es)}</b><div class="g9-hint">${esc(hint)}</div><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Respuesta en inglés" style="width:100%;max-width:320px"><button type="button" class="g9-chk">Comprobar</button>`; fb.innerHTML = '';
      const inp = q.querySelector('input'); try { inp.focus(); } catch (e) { }
      const ok = await new Promise(done => { let tries = 0; const go = () => { const v = nk9(inp.value); if (!v) return; if (v === nk9(ans) || (function () { try { return M().speechScore(ans, inp.value); } catch (e) { return 0; } })() >= 90) { inp.classList.add('ok'); inp.disabled = true; sfx('ok'); fb.innerHTML = `<span class="g9-yes">${SV(I.ck)}${tries ? '¡Ahora sí!' : '¡Perfecto!'}</span>`; play(it.au); setTimeout(() => done(!tries), 1100); return; }
          tries++; sfx('bad'); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 450); if (tries >= 2) { inp.value = ans; inp.disabled = true; inp.classList.add('fix'); fb.innerHTML = `<span class="g9-no">Era <b>${esc(ans)}</b>.</span>`; play(it.au); setTimeout(() => done(false), 1800); } else fb.innerHTML = `<span class="g9-no">Casi. Revisa la pista e inténtalo otra vez.</span>`; };
        q.querySelector('.g9-chk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; });
      if (ok) c++; else missed.push(it); weak(it, ok); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    return g9End(stage, c, R.length, 'writing', missed, `${c} de ${R.length} al primer intento · Continuar`);
  };
  // 🎧 Adultos M4 · Intérprete: escucha (sin texto) y elige lo que significa
  G9.g9Interp = async function (stage, p) {
    const P = uniq((p.sentences || []).concat(vocab(p))).filter(s => s.en && s.es && s.au && words9(s.en).length >= 3); if (P.length < 4) return null; const R = shuffle(P).slice(0, 4); let c = 0; const missed = [];
    const body = frame(stage, 'Practice', 'Intérprete', 'Escucha la frase (sin leerla) y elige lo que significa.');
    body.innerHTML = `<div class="g9 g9-a">${g9Top('Intérprete', `<span id="g9n">0 / ${R.length}</span>`)}<div class="g9-hunt" id="g9q"></div><div class="g9-fb" id="g9f"></div></div>`;
    body.querySelector('.g9-tm').style.visibility = 'hidden'; const q = body.querySelector('#g9q'), fb = body.querySelector('#g9f');
    for (let i = 0; i < R.length; i++) { if (!stage.isConnected) break; const it = R[i]; const { o, a } = pickOpts(it, P, 'es', 3);
      q.innerHTML = `<small>${i + 1} / ${R.length}</small><button type="button" class="g9-big" id="g9a">${SV(I.vol)}<span>Escuchar</span></button>${optsHTML(o, 'col lt')}<div class="g9-rev" id="g9r"></div>`; fb.innerHTML = ''; q.querySelector('#g9a').onclick = () => play(it.au); await sleep(250); await play(it.au);
      const ok = await mcq9(q, fb, o, a, { yes: '¡Bien entendido!' }); q.querySelector('#g9r').textContent = it.en; if (ok) c++; else missed.push(it); weak(it, ok); await sleep(900); body.querySelector('#g9n').textContent = `${c} / ${R.length}`; }
    return g9End(stage, c, R.length, 'listening', missed, `${c} de ${R.length} bien interpretadas · Continuar`);
  };
  { const B9 = Object.assign({}, G9); [['g9Climb', 'g9Puzzle', 'g9Stars'], ['g9Puzzle', 'g9Climb', 'g9Stars'], ['g9Odd', 'g9Trans', 'g9Swipe'], ['g9Trans', 'g9Odd', 'g9Swipe'], ['g9Ending', 'g9Chunks', 'g9Chat'], ['g9Chunks', 'g9Ending', 'g9Pairs'],
    ['g9Wheel', 'g9Letter', 'g9Stars'], ['g9Letter', 'g9Wheel', 'g9Stars'], ['g9Show', 'g9AB', 'g9Swipe'], ['g9AB', 'g9Show', 'g9Swipe'], ['g9Secret', 'g9Interp', 'g9Chat'], ['g9Interp', 'g9Secret', 'g9Pairs']].forEach(([k, ...alt]) => { G9[k] = async (st, p) => { let r = await B9[k](st, p); for (const a of alt) { if (r !== null) break; r = await B9[a](st, p); } return r; }; }); }
  // rotación: cada lección trae 1 juego corto de su edad (alterna por lección)
  function game9For(p) { const n = (+p.topic || 0) + (+p.part || 0), a = ag(); const pick = (x, y) => n % 2 ? x : y; let md = 1; try { md = +M().MOD.n || 1; } catch (e) { }
    if (md === 2) { if (a === 'kids') return pick('g9Train', 'g9Memory'); if (a === 'teens') return pick('g9Gap', 'g9Spell'); return pick('g9Hunt', 'g9Dict'); } /* v448: el Módulo 2 tiene sus propios juegos */
    if (md === 3) { if (a === 'kids') return pick('g9Climb', 'g9Puzzle'); if (a === 'teens') return pick('g9Odd', 'g9Trans'); return pick('g9Ending', 'g9Chunks'); } /* v449: Módulo 3 */
    if (md >= 4) { if (a === 'kids') return pick('g9Wheel', 'g9Letter'); if (a === 'teens') return pick('g9Show', 'g9AB'); return pick('g9Secret', 'g9Interp'); } /* v449: Módulo 4 */
    if (a === 'kids') return pick('g9Stars', 'g9Monster'); if (a === 'teens') return pick('g9Swipe', 'g9Beat'); return pick('g9Chat', 'g9Pairs'); }
  window.MRAGE2 = { review, learn, keyq, speak, speakWords: speak, music, gamesFor, musicFor, kgPop, kgBasket, kgAlbum, tgQuiz, tgChat, tgMatch, tgEar, game9For, ...G9 };
})();
