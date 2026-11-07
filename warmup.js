/* v609 · CALENTAMIENTO de 1 minuto — solo en la Lesson 1 del primer tema de cada módulo (todas las edades)
   Va después del Goal y antes de la Explanation. Fotos reales HD, relojes de diseño y voz americana revisada. */
(function () {
  const U = (id, w, h) => `https://images.unsplash.com/photo-${id}?w=${w || 900}&h=${h || 520}&fit=crop&crop=entropy&q=82&auto=format`;
  const W = {
    1: { kind: 'greet', t: '¿Qué saludo usas?', s: 'Mira la hora y toca el saludo correcto.', opts: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
      R: [{ img: '1552650272-b8a34e21bc4b', time: '7:00 a. m.', a: 0, au: 'wu1a' }, { img: '1600066975993-e9aa6928ee28', time: '2:00 p. m.', a: 1, au: 'wu1b' },
        { img: '1768508949611-694cf58a303a', time: '7:30 p. m. · llegando', a: 2, au: 'wu1c' }, { img: '1672928499632-1d040212e3f4', time: '10:30 p. m. · a dormir', a: 3, au: 'wu1d' }] },
    2: { kind: 'clock', t: 'Escucha y toca el reloj', s: '¿Qué hora dijo? Puedes escuchar otra vez.',
      R: [{ au: 'wu2a', ok: [4, 30], d: [[5, 30], [10, 20]], txt: "It's half past four." }, { au: 'wu2b', ok: [8, 45], d: [[9, 15], [3, 40]], txt: "It's a quarter to nine." },
        { au: 'wu2c', ok: [7, 10], d: [[2, 35], [10, 35]], txt: "It's ten past seven." }, { au: 'wu2d', ok: [3, 0], d: [[12, 15], [9, 0]], txt: "It's three o'clock." },
        { au: 'wu2e', ok: [5, 40], d: [[8, 30], [6, 20]], txt: "It's twenty to six." }] },
    3: { kind: 'swipe', t: '¿Predicción o plan?', s: 'Lee la frase y elige. Rápido, sin pensarlo mucho.', opts: ['Predicción', 'Plan'],
      R: [{ img: '1595661671412-e20c4a3e65cc', en: "Look at those clouds! It's going to rain.", a: 0, au: 'wu3a', why: 'Predicción: lo ves venir (las nubes).' },
        { img: '1652318694264-94cd2e2e5227', en: 'I think our team will win.', a: 0, au: 'wu3b', why: 'Predicción: «I think … will».' },
        { img: '1622659097509-4d56de14539e', en: "I'm going to join the soccer team.", a: 1, au: 'wu3c', why: 'Plan: ya lo decidió.' },
        { img: '1632164815269-fb4cd5ced785', en: "I'm planning to learn the guitar.", a: 1, au: 'wu3d', why: 'Plan: ya lo decidió.' },
        { img: '1495654794940-1c0cd2aeedc1', en: 'I think more people will work from home in the future.', a: 0, au: 'wu3e', why: 'Predicción: opinas sobre el futuro.' }] },
    4: { kind: 'match', t: 'Une la causa con su resultado', s: 'Toca una frase y luego su pareja.', img: '1519692933481-e162a57d6721',
      P: [['If it rains,', "we'll stay home.", 'wu4a'], ['If you study,', "you'll pass the test.", 'wu4b'], ["If I'm late,", "I'll call you.", 'wu4c'], ['If she calls,', "tell her I'm out.", 'wu4d']] }
  };
  const IDS = ['wu1a', 'wu1b', 'wu1c', 'wu1d', 'wu2a', 'wu2b', 'wu2c', 'wu2d', 'wu2e', 'wu3a', 'wu3b', 'wu3c', 'wu3d', 'wu3e', 'wu4a', 'wu4b', 'wu4c', 'wu4d'];
  try { if (window.MRFIX) IDS.forEach(i => MRFIX.add(i)); } catch (e) { }
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const VOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>';
  let gid = 0;
  function clock(h, m) { const id = 'wuc' + (++gid), a = (m / 60) * 360, b = ((h % 12) + m / 60) * 30;
    const P = (d, l) => [50 + l * Math.sin(d * Math.PI / 180), 50 - l * Math.cos(d * Math.PI / 180)].map(v => v.toFixed(1));
    let t = ''; for (let i = 0; i < 60; i++) { const L = i % 5 ? 2.5 : 6, w = i % 5 ? 1 : 2.2, [x1, y1] = P(i * 6, 38), [x2, y2] = P(i * 6, 38 - L); t += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i % 5 ? '#9aa7b8' : '#0B2A5B'}" stroke-width="${w}" stroke-linecap="round"/>`; }
    const N = [[12, 0], [3, 90], [6, 180], [9, 270]].map(([n, d]) => { const [x, y] = P(d, 26); return `<text x="${x}" y="${(+y + 3.6).toFixed(1)}" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="600" font-size="10" fill="#0B2A5B">${n}</text>`; }).join('');
    const [hx, hy] = P(b, 19), [mx, my] = P(a, 30);
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d4c9c"/><stop offset="1" stop-color="#0B2A5B"/></linearGradient><radialGradient id="${id}f" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#eef2f7"/></radialGradient></defs>
      <circle cx="50" cy="52" r="46" fill="rgba(11,42,91,.12)"/><circle cx="50" cy="50" r="46" fill="url(#${id}r)"/><circle cx="50" cy="50" r="41" fill="url(#${id}f)"/>${t}${N}
      <line x1="50" y1="50" x2="${hx}" y2="${hy}" stroke="#0B2A5B" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="50" x2="${mx}" y2="${my}" stroke="#0B2A5B" stroke-width="3.2" stroke-linecap="round"/><circle cx="50" cy="50" r="3.4" fill="#E3242B"/><circle cx="50" cy="50" r="1.4" fill="#fff"/></svg>`; }
  function has(n, p) { return !!W[n] && p && +p.topic === 1 && +(p.part || 1) === 1; }
  function run(stage, p, X) {
    const n = +((window.M1 && M1.MOD && M1.MOD.n) || 1), cfg = W[n]; if (!cfg) return Promise.resolve(null);
    const play = (au) => { try { X.stop && X.stop(); return X.play ? X.play(au) : null; } catch (e) { return null; } };
    const sfx = (k) => { try { X.sfx && X.sfx(k); } catch (e) { } };
    return new Promise((done) => {
      const total = cfg.kind === 'match' ? cfg.P.length : cfg.R.length; let i = 0, hits = 0;
      const shell = (body) => { stage.innerHTML = `<div class="wu wu-${cfg.kind}"><span class="wu-k">Calentamiento</span><h2>${cfg.t}</h2><p class="wu-s">${cfg.s}</p>
        <div class="wu-pg"><span>${cfg.kind === 'match' ? hits + ' de ' + total + ' parejas' : 'Ronda ' + Math.min(i + 1, total) + ' de ' + total}</span><i><u style="width:${Math.round((cfg.kind === 'match' ? hits : i) / total * 100)}%"></u></i></div>${body}</div>`; };
      const finish = () => { stage.innerHTML = `<div class="wu wu-end"><div class="wu-ok">${'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12 4 4 8-9"/></svg>'}</div><h2>¡Muy bien!</h2><p class="wu-s">${hits} de ${total} correctas. Ahora veamos la regla.</p><button type="button" class="wu-go">Continuar →</button></div>`;
        sfx('win'); stage.querySelector('.wu-go').onclick = () => { X.stop && X.stop(); done(null); }; };
      const next = (ms) => setTimeout(() => { i++; if (i >= total) finish(); else round(); }, ms);
      function round() {
        if (cfg.kind === 'greet') { const r = cfg.R[i];
          shell(`<div class="wu-pic" style="background-image:url('${U(r.img)}')"><b>${r.time}</b></div><div class="wu-opts">${cfg.opts.map((o, k) => `<button type="button" data-k="${k}">${o}</button>`).join('')}</div>`);
          stage.querySelectorAll('.wu-opts button').forEach(b => b.onclick = () => { if (stage.querySelector('.wu-opts.wu-lk')) return; stage.querySelector('.wu-opts').classList.add('wu-lk'); const k = +b.dataset.k, ok = k === r.a; if (ok) hits++;
            b.classList.add(ok ? 'ok' : 'bad'); if (!ok) stage.querySelector(`[data-k="${r.a}"]`).classList.add('ok'); sfx(ok ? 'ok' : 'bad'); play(r.au); next(ok ? 1300 : 1900); }); }
        if (cfg.kind === 'clock') { const r = cfg.R[i]; const L = shuffle([[r.ok, 1], [r.d[0], 0], [r.d[1], 0]]);
          shell(`<button type="button" class="wu-spk">${VOL}<span>Escuchar la hora</span></button><div class="wu-clk">${L.map(([t, ok]) => `<button type="button" data-ok="${ok}">${clock(t[0], t[1])}</button>`).join('')}</div><p class="wu-fb"></p>`);
          const spk = stage.querySelector('.wu-spk'); spk.onclick = () => play(r.au); setTimeout(() => play(r.au), 350);
          stage.querySelectorAll('.wu-clk button').forEach(b => b.onclick = () => { const box = stage.querySelector('.wu-clk'); if (box.classList.contains('wu-lk')) return; box.classList.add('wu-lk'); const ok = b.dataset.ok === '1'; if (ok) hits++;
            b.classList.add(ok ? 'ok' : 'bad'); if (!ok) box.querySelector('[data-ok="1"]').classList.add('ok'); sfx(ok ? 'ok' : 'bad'); const fb = stage.querySelector('.wu-fb'); fb.className = 'wu-fb ' + (ok ? 'g' : 'r'); fb.innerHTML = `<b>${ok ? '¡Correcto!' : 'Era esta'}</b>${r.txt}`; play(r.au); next(ok ? 1500 : 2200); }); }
        if (cfg.kind === 'swipe') { const r = cfg.R[i];
          shell(`<div class="wu-card"><div class="wu-cimg" style="background-image:url('${U(r.img, 800, 440)}')"></div><div class="wu-ctx"><b>${r.en}</b><button type="button" class="wu-mini">${VOL}Escuchar</button></div></div><div class="wu-two">${cfg.opts.map((o, k) => `<button type="button" data-k="${k}">${o}</button>`).join('')}</div><p class="wu-fb"></p>`);
          stage.querySelector('.wu-mini').onclick = () => play(r.au); setTimeout(() => play(r.au), 350);
          stage.querySelectorAll('.wu-two button').forEach(b => b.onclick = () => { const box = stage.querySelector('.wu-two'); if (box.classList.contains('wu-lk')) return; box.classList.add('wu-lk'); const ok = +b.dataset.k === r.a; if (ok) hits++;
            b.classList.add(ok ? 'ok' : 'bad'); if (!ok) box.querySelector(`[data-k="${r.a}"]`).classList.add('ok'); sfx(ok ? 'ok' : 'bad'); const fb = stage.querySelector('.wu-fb'); fb.className = 'wu-fb ' + (ok ? 'g' : 'r'); fb.innerHTML = `<b>${ok ? '¡Correcto!' : 'Casi'}</b>${r.why}`; next(ok ? 1500 : 2300); }); }
      }
      if (cfg.kind === 'match') {
        const L = cfg.P.map((x, k) => ({ k, t: x[0] })), R = shuffle(cfg.P.map((x, k) => ({ k, t: x[1] }))); let sel = null;
        const draw = () => { shell(`<div class="wu-pic sm" style="background-image:url('${U(cfg.img, 900, 360)}')"></div><div class="wu-mt">${L.map((a, j) => `<button type="button" class="l${a.done ? ' done' : ''}${sel === a.k ? ' sel' : ''}" data-l="${a.k}">${a.t}</button><button type="button" class="r${R[j].done ? ' done' : ''}" data-r="${R[j].k}">${R[j].t}</button>`).join('')}</div>`);
          stage.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { const a = L.find(x => x.k === +b.dataset.l); if (a.done) return; sel = a.k; sfx('tap'); draw(); });
          stage.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const r = R.find(x => x.k === +b.dataset.r); if (r.done || sel === null) return;
            if (r.k === sel) { r.done = true; L.find(x => x.k === sel).done = true; hits++; sfx('ok'); play(cfg.P[sel][2]); sel = null; draw(); if (hits >= total) setTimeout(finish, 1700); }
            else { sfx('bad'); b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 500); } }); };
        draw(); return;
      }
      round();
    });
  }
  window.MRWARM = { has, run };
})();
