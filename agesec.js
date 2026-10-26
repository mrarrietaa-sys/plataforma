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
  const paras = (p) => { const t = String(p.tip || ''); let L = t.split(/<\/p>/i).map(x => clean(x.replace(/<p[^>]*>/gi, ''))).filter(x => x.replace(/<[^>]+>/g, '').trim().length > 2); if (!L.length && t) L = [clean(t)]; return L; };
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
    return ag() === 'teens' ? swipe(stage, pv, pool) : chests(stage, pv, pool);
  }
  // 👧 Cofre de recuerdos
  async function chests(stage, pv, pool) {
    const items = shuffle(pool).slice(0, Math.min(6, pool.length)); let cur = 0, c = 0; const missed = [], res = [];
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
    const items = shuffle(pool).slice(0, Math.min(6, pool.length)).map(it => { const tr = Math.random() < .5; const o = tr ? it : shuffle(pool.filter(x => x.en !== it.en && x.es && x.es !== it.es))[0] || it; return { it, shown: o.es, truth: tr || o === it }; });
    let i = 0, c = 0, streak = 0, best = 0; const missed = [];
    const body = frame(stage, 'Review', 'Recap', `Repaso de <b>${esc(pv._t ? pv._t.title : 'la lección pasada')}</b>. ¿La traducción es correcta? Desliza a la derecha si sí, a la izquierda si no.`);
    body.innerHTML = `<div class="as-sbar">${items.map(() => '<i></i>').join('')}</div><div class="as-deck" id="as-deck"></div>
      <div class="as-sw"><button type="button" class="as-no" id="as-n">${SV(I.x)}<span>No</span></button><button type="button" class="as-yes" id="as-y">${SV(I.ck)}<span>Sí</span></button></div><p class="as-hint">En PC también puedes usar las flechas ← →</p>`;
    const deck = body.querySelector('#as-deck');
    await new Promise(done => {
      let busy = false, card = null;
      const show = () => {
        body.querySelectorAll('.as-sbar i').forEach((x, k) => { x.className = k < i ? 'on' : k === i ? 'cur' : ''; });
        const q = items[i]; deck.innerHTML = `<div class="as-card as-b2"></div><div class="as-card as-b1"></div><div class="as-card as-top"><span class="as-cl">CARD ${i + 1} DE ${items.length}</span><div class="as-en">${esc(q.it.en)}</div><div class="as-eq">=</div><div class="as-es">${esc(q.shown)}</div><button type="button" class="as-pl">${SV(I.vol)}Escuchar</button><span class="as-stamp"></span></div>`;
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
      ${missed.length ? `<div class="as-res"><span class="as-cl">REPASA ESTAS</span>${missed.map(m => `<div class="as-rr"><i class="no">${SV(I.x)}</i><span><b>${esc(m.en)}</b> = ${esc(m.es)}</span><button type="button" class="as-pl sm" data-au="${esc(m.au)}">${SV(I.vol)}</button></div>`).join('')}</div>` : `<div class="as-res"><div class="as-rr"><i class="ok">${SV(I.ck)}</i><span>¡Perfecto! Recordaste todo lo de la lección pasada.</span></div></div>`}`;
    body.querySelectorAll('[data-au]').forEach(b => b.onclick = () => play(b.dataset.au)); sfx(c >= items.length / 2 ? 'win' : 'ok');
    await A().waitNext(stage, 'Continuar');
    return A().result(c, items.length, 'listening', missed);
  }

  /* =================== EXPLICACIÓN =================== */
  async function learn(stage, p) {
    const P = paras(p), F = (p.fill || []).filter(f => f && f.s && f.a && f.o && /_{2,}/.test(f.s));
    if (P.length) { if (ag() === 'teens') await stories(stage, p, P); else await comic(stage, p, P); }
    if (F.length) { if (ag() === 'teens') await poll(stage, F.slice(0, 3)); else await stickers(stage, F.slice(0, 4)); }
    stage.classList.remove('as-stage', 'dk');
    return A().learn(stage, p, { noTip: true, title: ag() === 'teens' ? 'Say it like a native' : 'Repite con Mr. Arrieta', ins: ag() === 'teens' ? 'Escucha cada palabra y dila con tu voz. Necesitas al menos 3 bien dichas para seguir.' : 'Toca cada foto para escucharla y luego toca <b>Repetir</b> y dila en voz alta. ¡Necesitas 3!' });
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
    await A().waitNext(stage, 'Continuar');
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
    body.innerHTML = `<div class="as-kpi"><div><b>${c}/${F.length}</b><small>correctas</small></div><div><b>${streak}</b><small>racha final</small></div><div><b>${c === F.length ? '100%' : Math.round(c / F.length * 100) + '%'}</b><small>acierto</small></div></div><p class="as-hint">Ahora practica las palabras con tu voz.</p>`;
    sfx(c === F.length ? 'win' : 'ok'); await A().waitNext(stage, 'Continuar');
  }

  window.MRAGE2 = { review, learn };
})();
