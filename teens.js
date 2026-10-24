/* 🚀 PERFIL TEENS (12 a 17 años): misma plataforma de adultos con estilo azul oscuro
   Puntos, misiones de la semana, reto de pronunciación semanal y ranking de la escuela (solo apodos) */
(function () {
  const I = (n) => window.MRI ? MRI(n) : '';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const fmt = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => iso(new Date());
  const weekKey = () => { const d = new Date(); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return iso(d); };
  const on = () => { try { return window.M1 && M1.ageGroup && M1.ageGroup() === 'teens'; } catch (e) { return false; } };
  const P = () => window.MRAP;
  const PH = ["I'm on my way!", "Let's hang out this weekend.", 'That was an awesome game!', "I can't wait for the summer!", 'Could you say that again, please?', 'What are you up to tonight?', 'This song is stuck in my head.', 'Practice makes perfect.'];
  const phraseIdx = () => { const w = new Date(weekKey() + 'T12:00:00'); return Math.floor(w.getTime() / (7 * 864e5)) % PH.length; };
  // conteos de progreso
  const partsDone = () => { try { return P().MODS.reduce((t, m) => t + (P().progress(m.id).done || 0), 0); } catch (e) { return 0; } };
  const topicsDone = () => { try { return P().MODS.reduce((t, m) => t + (window.MRKIDS ? MRKIDS.topics(m).filter(x => x.done).length : 0), 0); } catch (e) { return 0; } };
  const MISS = [
    { k: 'm1', ic: 'check', t: 'Completa 1 tema de tu ruta', goal: 1, pts: 100, v: (s) => topicsDone() - s.base.topics },
    { k: 'm2', ic: 'video', t: 'Haz 3 clases esta semana', goal: 3, pts: 150, v: (s) => partsDone() - s.base.parts },
    { k: 'm3', ic: 'flame', t: 'Entra 4 días esta semana', goal: 4, pts: 100, v: (s) => s.days.length },
    { k: 'm4', ic: 'star', t: 'Logra 80% en el reto de la semana', goal: 1, pts: 150, v: (s) => (s.ch || 0) >= 80 ? 1 : 0 }];
  function state() {
    let s = {}; try { s = JSON.parse(LS.get('mra_teen_v1') || '{}'); } catch (e) { }
    if (s.wk !== weekKey()) s = { wk: weekKey(), base: { parts: partsDone(), topics: topicsDone() }, days: [], claimed: {}, ch: 0, bonus: s.bonus || 0, nick: s.nick || '' };
    if (s.days.indexOf(today()) < 0) s.days.push(today());
    LS.set('mra_teen_v1', JSON.stringify(s)); return s;
  }
  const save = (s) => LS.set('mra_teen_v1', JSON.stringify(s));
  const points = (s) => partsDone() * 20 + topicsDone() * 30 + (s.bonus || 0);
  // reclama solas las misiones cumplidas
  function claim(s) { let got = 0; MISS.forEach(m => { if (!s.claimed[m.k] && m.v(s) >= m.goal) { s.claimed[m.k] = 1; s.bonus = (s.bonus || 0) + m.pts; got += m.pts; } }); if (got) save(s); return got; }

  function hero(p, a, nick) {
    const s = state(); claim(s); const pr = P().progress(a.id); const rk = LS.get('mra_teen_pos') || '';
    return `<div class="card tn-hero"><span class="tn-glow"></span><span class="tn-grid"></span>
      <div class="tn-htx"><span class="tn-eye">${I('star')} Teens</span><h2>What's up, ${esc(nick)}?</h2>
        <p>${pr.done ? `Vas en el <b>${esc(a.name)}</b>. Sigue así: cada clase te acerca a hablar con confianza.` : `Tu ruta empieza en el <b>${esc(a.name)}</b>. Una clase a la vez, a tu ritmo.`}</p>
        <div class="tn-k"><div><b>${I('video')}${pr.done}<span>/${a.classes}</span></b><small>Clases</small></div><div><b>${I('flame')}${s.days.length}</b><small>Días esta semana</small></div><div><b>${I('mic')}${s.ch ? s.ch + '%' : '—'}</b><small>Reto de la semana</small></div></div>
        <div class="tn-hb"><a class="btn tn-go lg" href="${a.url}">${I('video')} ${pr.done ? 'Continuar mi ruta' : 'Empezar mi ruta'}</a><button class="btn tn-gh sm" id="pt3">¿No estás a gusto con tu nivel?</button></div></div>
      <span class="tn-art"><span class="tn-disc"></span><img class="tn-mra" src="mra-x-rocket.webp" alt="Mr. Arrieta"></span></div>`;
  }
  function missions() { // 🎯 una sola meta semanal: 3 clases (directo a lo que vino)
    const s = state(), v = Math.max(0, Math.min(3, partsDone() - s.base.parts)), ok = v >= 3;
    return `<div class="card tn-goal${ok ? ' ok' : ''}"><i class="tn-gi">${I(ok ? 'check' : 'target')}</i><div><small>Meta de la semana</small><b>${ok ? '¡Meta cumplida!' : 'Haz 3 clases'}</b><div class="tn-bar"><span style="width:${Math.round(v / 3 * 100)}%"></span></div><span>${v} de 3 · se renueva cada lunes</span></div></div>`;
  }
  function challenge() {
    const s = state(), best = s.ch || 0;
    return `<div class="card tn-chal"><i class="tn-ci">${I('mic')}</i><div><small>Reto de pronunciación</small><b>“${esc(PH[phraseIdx()])}”</b><span>${best ? `Tu mejor resultado: <strong>${best}%</strong>${best >= 80 ? ' · ¡Excelente pronunciación!' : ' · la meta es 80%'}` : 'Escúchala y dila en voz alta. La meta es 80%.'}</span></div><button class="btn tn-cb" id="tn-chal">${best >= 80 ? 'Repetir' : 'Intentar'}</button></div>`;
  }
  function ranking() {
    return `<div class="card tn-card tn-rank"><div class="tn-ch"><h3>${I('award')} Ranking de la escuela</h3><small>Solo apodos</small></div><div id="tn-rl"><p class="tn-ld">Cargando ranking…</p></div></div>`;
  }
  function rankList(r, s) {
    const box = document.getElementById('tn-rl'); if (!box) return;
    if (!r || !r.ok) { box.innerHTML = `<p class="tn-ld">El ranking se actualiza cuando hay conexión.</p>`; return; }
    if (!r.nick) { box.innerHTML = `<div class="tn-nick"><p>Elige un apodo para aparecer en el ranking. <b>Nunca mostramos tu nombre ni tu foto.</b></p><div><input class="inp" id="tn-nk" maxlength="14" placeholder="Ej: SkyRider"><button class="btn tn-go sm" id="tn-nkb">Guardar</button></div><small id="tn-nke"></small></div>`;
      const b = document.getElementById('tn-nkb'); b.onclick = async () => { const v = document.getElementById('tn-nk').value.trim().replace(/[^A-Za-z0-9_]/g, ''); const e = document.getElementById('tn-nke'); if (v.length < 3) return (e.textContent = 'Usa de 3 a 14 letras o números, sin espacios.'); b.disabled = true;
        const x = await sync(v); b.disabled = false; if (x && x.err === 'taken') return (e.textContent = 'Ese apodo ya existe. Prueba otro.'); if (x && x.err === 'nick') return (e.textContent = 'Elige otro apodo.'); rankList(x, s); }; return; }
    if (r.pos) LS.set('mra_teen_pos', String(r.pos));
    const rows = r.top.slice(0, 5); const meIn = rows.some(x => x.me);
    box.innerHTML = rows.map(x => `<div class="tn-r${x.me ? ' me' : ''}"><span class="n">${x.n}</span><span class="a">${esc(x.nick.slice(0, 2).toUpperCase())}</span><b>${esc(x.nick)}${x.me ? ' (tú)' : ''}</b><em>${fmt(x.pts)}</em></div>`).join('')
      + (!meIn && r.pos ? `<div class="tn-r me"><span class="n">${r.pos}</span><span class="a">TÚ</span><b>${esc(r.nick)} (tú)</b><em>${fmt(points(s))}</em></div>` : '')
      + `<small class="tn-rt">${r.total} ${r.total === 1 ? 'estudiante' : 'estudiantes'} en el ranking</small>`;
    const k = document.querySelector('.tn-k div:nth-child(2) b'); if (k && r.pos) k.innerHTML = I('award') + '#' + r.pos;
  }
  async function sync(nick) {
    try { if (!(window.MRAC && MRAC.code && MRAC.code())) return null; const s = state(); return await MRAC.call('teenRank', { code: MRAC.code(), pts: points(s), nick: nick || '' }); } catch (e) { return null; }
  }
  function openChallenge(root) {
    const ph = PH[phraseIdx()], key = 'tch' + phraseIdx();
    const m = document.createElement('div'); m.className = 'modal tn-modal';
    m.innerHTML = `<div class="card"><button class="tn-x" aria-label="Cerrar">×</button><small class="tn-mk">Reto de pronunciación</small><h3>“${esc(ph)}”</h3><p class="muted">Escúchala, luego toca el micrófono y dila en voz alta.</p>
      <div class="tn-mb"><button class="btn w" id="tn-pl">${I('play')} Escuchar</button><button class="btn tn-go" id="tn-mic">${I('mic')} Decirla</button></div><div class="tn-res" id="tn-res"></div></div>`;
    document.body.appendChild(m);
    const close = () => m.remove(); m.querySelector('.tn-x').onclick = close; m.onclick = (e) => { if (e.target === m) close(); };
    const load = () => M1.loadAudio(['tch']);
    m.querySelector('#tn-pl').onclick = async () => { await load(); M1.play(key); };
    m.querySelector('#tn-mic').onclick = async () => {
      const res = m.querySelector('#tn-res'), b = m.querySelector('#tn-mic');
      if (!M1.canSR) { res.innerHTML = '<p class="tn-bad">Tu navegador no permite usar el micrófono para el reto. Ábrelo en Google Chrome.</p>'; return; }
      b.disabled = true; b.innerHTML = I('mic') + ' Te escucho…'; res.innerHTML = '<div class="tn-wave"><i></i><i></i><i></i><i></i><i></i></div>';
      const r = await M1.listen(9000, { quick: true }); b.disabled = false; b.innerHTML = I('mic') + ' Decirla otra vez';
      if (!r.alts || !r.alts.length) { res.innerHTML = `<p class="tn-bad">${/not-allowed|service-not-allowed|audio-capture/.test(r.error || '') ? 'Permite el uso del micrófono en tu navegador (ícono del candado junto a la dirección) e inténtalo de nuevo.' : 'No te escuché. Habla un poco más fuerte e inténtalo de nuevo.'}</p>`; return; }
      const sc = M1.speechScore(ph, r.alts).score; const s = state(); const first80 = sc >= 80 && (s.ch || 0) < 80; if (sc > (s.ch || 0)) { s.ch = sc; save(s); }
      const got = 0;
      res.innerHTML = `<div class="tn-sc ${sc >= 80 ? 'ok' : ''}"><b>${sc}%</b><span>${sc >= 80 ? '¡Excelente pronunciación!' : 'Casi. Escúchala otra vez e inténtalo: necesitas 80%.'}</span><small>Te escuché: “${esc(r.alts[0])}”</small></div>`;
      try { if (sc >= 80) { M1.sfx('win'); M1.confetti(1500); M1.praise(); } else { M1.sfx('bad'); M1.encourage(); } } catch (e) { }
      refresh(root);
    };
  }
  function refresh(root) { const h = root.querySelector('.tn-hero'), mi = root.querySelector('.tn-miss'), c = root.querySelector('.tn-chal'); const p = P().get(), a = P().assigned();
    if (h) { const k = h.querySelector('.tn-k div:nth-child(3) b'); const st = state(); if (k) k.innerHTML = I('mic') + (st.ch ? st.ch + '%' : '—'); }
    if (mi) { const t = document.createElement('div'); t.innerHTML = missions(); mi.replaceWith(t.firstElementChild); }
    if (c) { const t = document.createElement('div'); t.innerHTML = challenge(); c.replaceWith(t.firstElementChild); }
    wire(root, true); }
  function wire(root, noSync) {
    const b = root.querySelector('#tn-chal'); if (b) b.onclick = () => openChallenge(root);

  }
  window.MRTEENS = { on, hero, missions, challenge, ranking, wire };
})();
