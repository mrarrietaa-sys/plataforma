/* =====================================================================
   PORTAL — Perfil del estudiante (inicio de toda la plataforma)
   Ingreso con código → (nombre) → prueba de clasificación → módulos
   ===================================================================== */
(function () {
  const M = window.M1, P = window.MRAP, C = window.M1CONFIG;
  const { $, $$, h, esc, sfx } = M;
  const app = $('#app');
  const WA = (t) => `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent((window.MRNE || String)(t))}`;
  const PAGE = (document.body && document.body.dataset.page) || 'home';
  window.__goIn = /[?&]ingresar=1/.test(location.search) && !(() => { try { return performance.getEntriesByType('navigation')[0].type !== 'navigate'; } catch (e) { return false; } })(); // abrir «Ingresar» solo si llegó por el botón (no al recargar ni al volver) // 🏠 entrada · 'adultos' · 'ninos'
  const U = (id, w = 800, hh = 450) => `https://images.unsplash.com/${id}?w=${w}&h=${hh}&fit=crop&crop=entropy&q=80&auto=format`;

  function topbar() {
    const p = PAGE !== 'home' ? null : P.get();
    $('#topbar').innerHTML = `<div class="brand" id="go-home"><span class="logo-pill"><img class="logo" src="mra-brand.png" alt="mrarrieta.com"></span></div><div class="sp"></div><button class="tb-back" type="button" id="tb-back" title="Regresar">← Atrás</button><span class="tb-tag">MI PERFIL</span>
      ${p ? `<span class="pill hide-s">${window.MRPLANS ? MRPLANS.badge() : p.type === 'staff' ? '👨‍🏫 Profe' : p.type === 'trial' ? '🟢 Acceso gratis' : '🎓 Estudiante'}</span>${p.first ? `<button class="tb-avbtn" id="me-b" title="Personaliza tu perfil">${P.avHTML('tb-av')}</button>` : ''}<a class="iconbtn" href="juegos.html" title="Zona de juegos">🎮</a><button class="iconbtn" id="snd-b" title="Activar / quitar la voz de bienvenida">${voiceOn() ? '🔊' : '🔇'}</button><button class="iconbtn" id="out" title="Salir" aria-label="Salir"><svg class="pw-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/></svg></button>` : ''}`;
    $('#go-home').onclick = () => route('home');
    if (!P.get() && $('#tb-back')) $('#tb-back').remove(); // en la pantalla de ingreso no hay a dónde regresar
    if ($('#tb-back')) $('#tb-back').onclick = () => { if (curRoute && curRoute !== 'home') return route('home'); if ((() => { try { return sessionStorage.getItem('mra_from_fam') === '1'; } catch (e) { return false; } })()) { location.href = 'familia.html'; return; } /* 👨‍👩‍👧 el papá entró desde su portal: regresa a su portal */ const r = document.referrer; if (r && r.indexOf(location.origin) === 0 && !/\/(index\.html)?(\?|#|$)/.test(r.replace(location.origin, '').replace(/^\/[^/]*\//, '/')) && history.length > 1) history.back(); else { route('home'); window.scrollTo(0, 0); } };
    if ($('#me-b')) $('#me-b').onclick = () => route('me');
    if ($('#ann-b')) $('#ann-b').onclick = () => { MRANN.show(); topbar(); };
    if (window.MRANN) MRANN.sync();
    if ($('#out')) $('#out').onclick = logout;
    if ($('#snd-b')) $('#snd-b').onclick = () => { const on = !voiceOn(); try { localStorage.setItem(VKEY, on ? '0' : '1'); } catch (e) { } if (!on) M.stop(); $('#snd-b').textContent = on ? '🔊' : '🔇'; M.toast(on ? '🔊 Voz de bienvenida activada' : '🔇 Voz de bienvenida desactivada'); };
  }
  let curRoute = 'home';
  function route(r) { curRoute = r || 'home'; M.stop && M.stop(); window.scrollTo(0, 0); topbar(); const p = PAGE !== 'home' ? null : P.get();
    if (p) { const hd = document.querySelector('.lp-dock.home'); if (hd) { hd.remove(); document.body.classList.remove('home-app'); document.documentElement.classList.remove('home-lock'); } }
    if (!p) return login();
    if (!p.first || (p.cloud && p.type === 'student' && !p.birth)) return nameStep(); // nombre + fecha de nacimiento obligatorios
    if (r === 'placement') return placement();
    if (r === 'me' || r === 'me-photo' || r === 'me-av' || r === 'me-plat') return personalize(r === 'me' ? 'av' : r.slice(3));
    return home();
  }

  /* ---------- bienvenida en voz: "Welcome / Welcome back, Nombre!" ---------- */
  function sayHi(text) {
    try {
      if (!window.speechSynthesis) return; sessionStorage.setItem('mra_said', '1');
      const go = () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.95; u.pitch = 1.05;
        const vs = speechSynthesis.getVoices().filter(v => /^en(-|_)US/i.test(v.lang)); const pref = vs.find(v => /Google US English|Samantha|Aria|Jenny|Natural/i.test(v.name)) || vs[0]; if (pref) u.voice = pref;
        window.__mraGreet = true; u.onend = u.onerror = () => { window.__mraGreet = false; }; setTimeout(() => { window.__mraGreet = false; }, 6000);
        speechSynthesis.speak(u); } catch (e) { } };
      // si aún no hubo ningún toque en la página, habla con el primer toque
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) { const once = () => { removeEventListener('pointerdown', once, true); go(); }; addEventListener('pointerdown', once, true); return; }
      go(); // de inmediato, dentro del mismo toque de "Entrar" (necesario en iPhone)
    } catch (e) { }
  }
  // 👋 nombre de quien visita: estudiante que ya entró en este equipo, formulario que llenó aquí, o enlace de nuestros correos (?hi=)
  const vName = () => { try { return localStorage.getItem('mra_vname') || ''; } catch (e) { return ''; } };
  const setVName = (full) => { const f = String(full || '').trim().split(/\s+/)[0].replace(/[^A-Za-zÀ-ÿ'-]/g, '').slice(0, 20); if (f) try { localStorage.setItem('mra_vname', f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()); } catch (e) { } };
  (function () { try { const q = new URLSearchParams(location.search), hi = q.get('hi'); if (!hi) return;
    const b = atob(hi.replace(/-/g, '+').replace(/_/g, '/')); setVName(new TextDecoder().decode(Uint8Array.from(b, c => c.charCodeAt(0))));
    q.delete('hi'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); } catch (e) { } })();
  const hiGreet = (nm) => { const hr = new Date().getHours(), w = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening', e = hr < 12 ? '<svg class="hg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>' : hr < 18 ? '<svg class="hg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M7 16a5 5 0 0 1 10 0"/><path d="M12 5v3M4.9 8.9l1.4 1.4M19.1 8.9l-1.4 1.4M2.5 16h2M19.5 16h2M3 20h18"/></svg>' : '<svg class="hg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'; /* íconos de línea de la marca (sol · atardecer · luna) */ return nm ? `<span class="hg">${w},</span> <span class="hg">${esc(nm)}! ${e}</span>` : `<span class="hg">${w}! ${e}</span>`; };
  const hiName = () => { const p = P.get() || {}; const lu = P.lastUser() || {}; return (p.look && p.look.nick) || p.first || lu.first || ''; };
  // saludo en voz natural (voz masculina americana pregrabada): "Good morning / afternoon / evening, Nombre!"
  const VKEY = 'mra_voice_off';
  const voiceOn = () => { try { return localStorage.getItem(VKEY) !== '1'; } catch (e) { return true; } };
  const slugN = (n) => String(n || '').split(/\s+/)[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  // voz al ingresar el código (voz masculina americana pregrabada): "Welcome back, Nombre!" o "Welcome! Nice to meet you!"
  const greetVoice = () => {
    if (!voiceOn()) return; try { sessionStorage.setItem('mra_said', '1'); } catch (e) { }
    const p = P.get() || {}, lu = P.lastUser() || {}; const nm = (p.look && p.look.nick) || p.first || lu.first || '';
    const sl = slugN(nm); const known = !!p.first; // si aún no tiene nombre verá "Nice to meet you!" → la voz dice lo mismo
    const W = M.ageGroup && M.ageGroup() !== 'adult' ? 'wf_' : 'wb_'; // 👧 Kids y Teens: voz de mujer
    const go = () => M.loadAudio([W + (sl[0] || 'x')]).then(() => { if (!voiceOn()) return; const k = known && window.AUD && window.AUD[W + sl] ? W + sl : W; M.play(k); }); // siempre: "Welcome, Nombre!" (o "Welcome!")
    go();
  };
  /* ---------- ingreso con código ---------- */
  function codeType(code) {
    const hh = M.codeHash(code);
    if ((C.REVIEW_CODES || []).includes(hh)) return { type: 'staff' };
    const st = (C.STUDENT_CODES || []).find(x => x.hash === hh); if (st) return { type: 'student', module: st.module || null, demo: !!st.all };
    const tr = (C.TRIAL_CODES || []).find(x => x.hash === hh); if (tr) return { type: 'trial', module: tr.module || null };
    const old = (C.ACCESS_CODES || []).find(x => x.hash === hh); if (old) return { type: 'student', module: null };
    return null;
  }
  // 📣 visitante nuevo: "¿Vienes por primera vez?" → guarda nombre y correo en Interesados (una sola vez)
  function leadPop() {
    let seen = null; try { seen = localStorage.getItem('mra_lead'); } catch (e) { }
    if (seen || P.lastUser() || (() => { try { return localStorage.getItem('mra_last_role'); } catch (e) { return null; } })() || !(window.MRAC && MRAC.on)) return;
    setTimeout(() => {
      if (document.querySelector('.modal') || P.get()) return;
      const m = M.modal(`<div class="center"><img class="mascot bounce mra" src="mra-x-wave.webp" alt="Mr. Arrieta" draggable="false" style="height:170px;width:auto"></div><h3 class="center">¿Vienes por primera vez? 👋</h3>
        <p class="center" style="font-size:16px">Déjanos tu nombre y tu correo y conoce cómo aprender inglés <b>HABLANDO</b> con mrarrieta.com.</p>
        <input class="inp" id="ld-n" placeholder="Tu nombre" autocomplete="name" style="margin:6px 0 8px"><input class="inp" id="ld-e" type="email" placeholder="Tu correo" autocomplete="email">
        <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;margin:10px 0;color:#4A5B78"><input type="checkbox" id="ld-c" checked style="margin-top:3px">Acepto recibir correos de mrarrieta.com con información de la escuela. Puedo darme de baja cuando quiera.</label>
        <button class="btn k block lg" id="ld-ok">Quiero conocerlos →</button><button class="btn w block" id="ld-no" style="margin-top:8px">Ahora no</button>`, { x: true });
      const mark = (v) => { try { localStorage.setItem('mra_lead', v); } catch (e) { } };
      const no = () => { mark('no'); m.remove(); };
      $('#ld-no', m).onclick = no; const mx = $('.mx', m); if (mx) mx.addEventListener('click', () => mark('no'));
      $('#ld-ok', m).onclick = async () => {
        const name = $('#ld-n', m).value.trim(), email = $('#ld-e', m).value.trim();
        if (!name) return M.toast('Escribe tu nombre 🙂'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return M.toast('Revisa tu correo 🙂');
        if (!$('#ld-c', m).checked) return M.toast('Marca la casilla para poder enviarte la información');
        const b = $('#ld-ok', m); b.disabled = true; b.textContent = 'Guardando…';
        setVName(name); const r = await MRAC.call('leadAdd', { name, email, consent: true }).catch(() => ({ ok: false }));
        if (!r || !r.ok) { b.disabled = false; b.textContent = 'Quiero conocerlos →'; return M.toast('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.'); }
        mark('ok'); m.querySelector('.card').innerHTML = `<div class="center">${M.mascot('mascot', 'celebrate')}</div><h3 class="center">¡Gracias, ${esc(name.split(' ')[0])}! 🎉</h3><p class="center" style="font-size:16px">Revisa tu correo: te enviamos la bienvenida. Si quieres empezar ya, pide tu acceso gratuito.</p><a class="btn block lg pt-wa" href="#" data-trial>Pedir mi acceso gratuito</a><button class="btn w block" style="margin-top:8px" id="ld-x">Cerrar</button>`;
        $('#ld-x', m).onclick = () => m.remove();
      };
    }, 1500);
  }
  /* =====================================================================
     🏠 ENTRADA + 🧑 ADULTOS + 👧 NIÑOS Y JÓVENES (v329)
     · La entrada solo tiene el inicio (cohete + ingreso) y dos caminos
     · Cada página tiene su Mr. Arrieta en globo, su cielo y el reto de pronunciación con premio
     ===================================================================== */
  const LPI = { // íconos premium (figuras sólidas)
    adult: '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="11" r="5.2" fill="#fff"/><path d="M6.5 27c0-5.4 4.3-9 9.5-9s9.5 3.6 9.5 9" fill="#fff" fill-opacity=".9"/><path d="M14.4 18.3 16 22l1.6-3.7" stroke="#0B2A5B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 22v4" stroke="#0B2A5B" stroke-width="1.6" stroke-linecap="round"/></svg>',
    kids: '<svg viewBox="0 0 32 32" fill="none"><circle cx="11.5" cy="10" r="4.4" fill="#fff"/><path d="M4 26c0-4.6 3.4-7.8 7.5-7.8S19 21.4 19 26" fill="#fff" fill-opacity=".95"/><circle cx="22.5" cy="14" r="3.4" fill="#fff" fill-opacity=".8"/><path d="M17 27c.2-3.6 2.6-6 5.5-6S27.8 23.4 28 27" fill="#fff" fill-opacity=".7"/><path d="M25.6 4.6l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="#fff"/></svg>' };
  const LI = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mri">${d}</svg>`;
  const LP = { mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>', vol: '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>', brief: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    grad: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>', ok: '<path d="m5 12 5 5L20 7"/>', star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', medal: '<circle cx="12" cy="15" r="5"/><path d="M8 3h8l-2 7h-4z"/>', pad: '<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><rect width="20" height="12" x="2" y="6" rx="3"/>', user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    nocard: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20M3 3l18 18"/>', users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>', repeat: '<path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3"/>', chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-6"/>', check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/>', cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>' };
  function pathCards() {
    return `<div class="ld-path"><a class="ld-pc2" href="adultos.html"><span class="ic a">${LPI.adult}</span><span class="tx"><b>Adultos</b><small>Desde 18 años</small></span><span class="ar">›</span></a>
      <a class="ld-pc2" href="ninos.html"><span class="ic k">${LPI.kids}</span><span class="tx"><b>Niños y jóvenes</b><small>De 9 a 17 años</small></span><span class="ar">›</span></a></div>`;
  }
  const LP_GOALS = { v: ['plane', 'Viajar', 'Tus clases y misiones: aeropuerto, hotel y restaurantes.'], t: ['brief', 'Trabajo', 'Tus clases y misiones: entrevistas, reuniones y correos.'], e: ['grad', 'Estudios', 'Tus clases y misiones: universidad, becas y exámenes.'] };
  const LP_PH = { adultos: { t: 'Nice to meet you', es: 'Mucho gusto en conocerte', au: 'prnicetomeet' }, ninos: { t: 'I love English', es: '¡Me encanta el inglés!', au: 'priloveeng' } };
  const lpSky = (n) => { let h = ''; for (let k = 0; k < n; k++) h += `<span class="lp-star" style="left:${(k * 37) % 100}%;top:${(k * 53) % 62}%;opacity:${(.3 + (k % 5) / 8).toFixed(2)}"></span>`; return h; };
  const lpClouds = () => [[-8, 78, 260, 90], [52, 84, 320, 110], [18, 92, 380, 120], [72, 30, 160, 50]].map(([l, t, w, h], i) => `<span class="lp-cloud${i === 3 ? ' big' : ''}" style="left:${l}%;top:${t}%;width:${w}px;height:${h}px"></span>`).join('');
  function lpChallenge(page) {
    const ph = LP_PH[page];
    return `<div class="lp-demo" id="lp-demo"><div class="lp-demo-in"><button class="lp-mic" id="lp-mic" aria-label="Toca y habla">${LI(LP.mic)}</button>
      <div class="lp-demo-tx"><small id="lp-dl">RETO · TOCA EL MICRÓFONO Y DI</small><b>“${ph.t}${page === 'ninos' ? '!' : ''}”</b><span class="lp-es">${ph.es}</span><div class="lp-wave" id="lp-wave">${[8, 14, 20, 12, 18, 10, 16, 22, 12, 8, 15, 19, 11, 7].map(x => `<i style="height:${x}px"></i>`).join('')}</div></div>
      <button class="lp-ex" id="lp-ex" aria-label="Escuchar el ejemplo" title="Escuchar el ejemplo">${LI(LP.vol)}</button></div>
      <div class="lp-gift">${MRI('gift')} Pronúncialo bien y gana <b>10% en tu primer mes</b></div><div class="lp-res" id="lp-res" hidden></div></div>`;
  }
  function lpGoalBar() {
    return `<div class="lp-gbar" id="lp-gbar"><div class="lp-ghd"><b>${LI(LP.star)} Personaliza tus clases</b><small>¿Para qué quieres el inglés?</small></div><div class="lp-gtabs">${Object.keys(LP_GOALS).map((k, i) => `<button type="button" data-goal="${k}" class="${i ? '' : 'on'}"><span class="lp-gfill"></span><span class="lp-gl">${LI(LP[LP_GOALS[k][0]])} ${LP_GOALS[k][1]}</span></button>`).join('')}</div>
      <p class="lp-gtx" id="lp-ans">${LI(LP.ok)} <span>${LP_GOALS.v[2]}</span></p></div>`;
  }
  function heroAdult() {
    return `<section class="lp-hero lp-a">${lpSky(40)}${lpClouds()}<span class="lp-badge b1"><i class="r">${LI(LP.user)}</i>Clases solo contigo</span><span class="lp-badge b2"><i class="g">${LI(LP.mic)}</i>Te corrige al hablar</span>
      <div class="lp-in"><div class="lp-copy"><span class="lp-ey"><i class="lp-eyi a">${LPI.adult}</i>ADULTOS · DESDE 18 AÑOS</span>
      <div class="lp-hrow"><h1>Tu inglés, cada día <em>más alto</em></h1><img class="lp-bal" src="mra-x-balloon1.webp" alt="Mr. Arrieta" draggable="false"></div>
      ${lpChallenge('adultos')}
      <div class="lp-cta"><button class="btn r lg" data-trial>${MRI('gift')} Prueba gratis 3 días</button></div><div class="lp-trust"><span><i>${LI(LP.nocard)}</i>Sin tarjeta</span><span><i>${LI(LP.users)}</i>+300 estudiantes</span><span><i>${LI(LP.repeat)}</i>Mes a mes</span></div></div></div></section>`;
  }
  const LP_AGE = (a) => a < 12 ? ['k', 'Experiencia Kids', 'Camino de aventuras, medallas y juegos. Reserva sus clases y tú ves todo su progreso.'] : ['t', 'Experiencia Teens', 'Misiones, puntos y ranking con temas de su mundo. Reserva sus clases y tú ves todo.'];
  function heroKids() {
    return `<section class="lp-hero lp-k"><span class="lp-sun"></span>${lpClouds()}<span class="lp-badge b1"><i class="r">${LI(LP.medal)}</i>Medallas y misiones</span><span class="lp-badge b2"><i class="n">${LI(LP.pad)}</i>Juegos con voces reales</span>
      <div class="lp-in"><div class="lp-copy"><span class="lp-ey"><i class="lp-eyi k">${LPI.kids}</i>NIÑOS Y JÓVENES · 9 A 17 AÑOS</span>
      <div class="lp-hrow"><h1>El inglés que tus hijos <em>sí quieren</em> practicar</h1><img class="lp-bal" src="mra-x-balloon2.webp" alt="Mr. Arrieta" draggable="false"></div>
      <p class="lp-lead">Hablan, juegan y ganan medallas con clases solo con su profe. Tú ves todo su progreso.</p>
      ${lpChallenge('ninos')}
      <div class="lp-cta"><button class="btn k lg" data-trial data-kid>${MRI('gift')} <span class="lp-ctxt">Prueba gratis para mi hijo(a)</span></button></div><div class="lp-trust"><span><i>${LI(LP.shield)}</i>Sin grabación</span><span><i>${LI(LP.mail)}</i>Reporte cada lunes</span><span><i>${LI(LP.nocard)}</i>Sin tarjeta</span></div></div></div></section>`;
  }
  function kidsSections() {
    const it = (ic, t) => `<li><i>${LI(LP[ic])}</i>${t}</li>`;
    const ct = (ic, t, d) => `<div class="lp-ct"><span class="ic">${LI(LP[ic])}</span><b>${t}</b><small>${d}</small></div>`;
    return `<section class="lp-papas"><div class="lp-ph">${lpSeg()}<h2>Hecho para cada edad</h2><p>Mismos niveles A1 a B2+, con temas de su mundo</p></div>
      <div class="lp-agrid"><article class="lp-ag k"><div class="lp-agi" style="background-image:url('https://images.unsplash.com/photo-1623076189461-f7706b741c04?w=640&h=420&fit=crop&crop=faces&q=80&auto=format')"><span>9 a 11 años</span></div><div class="lp-agb"><b>Kids</b><ul>${it('medal', 'Aventuras y medallas')}${it('pad', 'Juegos con voces reales')}${it('star', 'Familia, mascotas, colegio')}</ul></div></article>
        <article class="lp-ag t"><div class="lp-agi" style="background-image:url('https://images.unsplash.com/photo-1758612214848-04e700d192ce?w=640&h=420&fit=crop&crop=faces&q=80&auto=format')"><span>12 a 17 años</span></div><div class="lp-agb"><b>Teens</b><ul>${it('star', 'Chats, notas de voz y retos')}${it('pad', 'Series, juegos, deportes')}${it('cal', 'Reservan sus clases solos')}</ul></div></article></div>
      <div class="lp-ph2" id="lp-control"><b>Tú tienes el control</b><small>Panel de papás incluido en todos los planes</small></div>
      <div class="lp-cts">${ct('chart', 'Progreso en vivo', 'Temas, práctica y notas')}${ct('mail', 'Alerta de 7 días', 'Si no reserva o no practica')}${ct('check', 'Reservan solos', 'Kids y Teens')}${ct('shield', 'Seguro', 'Sin grabación')}</div></section>`;
  }




  // 📱 entrada como app: barra inferior (sin pie de página largo)
  function homeDock() {
    if (document.querySelector('.lp-dock')) return; document.body.classList.add('home-app');
    const LW = () => document.querySelector('.ld-login'); // 📱 celular: el ingreso se abre como ventana (el cliente no baja) · se busca cada vez (la página se vuelve a dibujar al salir de un perfil)
    const prep = (lw) => { if (lw && !lw.querySelector('.lp-shx')) { (lw.querySelector('.pt-login') || lw).insertAdjacentHTML('afterbegin', '<button type="button" class="lp-shx" aria-label="Cerrar">✕</button>'); lw.querySelector('.lp-shx').onclick = () => sheet(false); lw.addEventListener('click', e => { if (e.target === lw) sheet(false); }); } };
    const sheet = (on) => { const lw = LW(); if (innerWidth >= 900 || !lw) return; prep(lw); lw.classList.toggle('sheet-on', on); document.body.classList.toggle('sheet-open', on); if (on) { const inp = lw.querySelector('input'); setTimeout(() => inp && inp.focus(), 250); } };
    prep(LW());
    if (/[?&]ingresar=1/.test(location.search)) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } } // solo se abre por el clic en «Ingresar»; al volver o recargar se ve la página de entrada
    if (window.__goIn) setTimeout(() => { if (innerWidth < 900) sheet(true); else { const inp = document.querySelector('.ld-login input'); if (inp) inp.focus(); } }, 600);
    document.addEventListener('click', e => { if (e.target.closest('[data-goin]') && innerWidth < 900) { e.preventDefault(); e.stopImmediatePropagation(); sheet(true); } }, true);
    const ic = (d) => LI(d), wa = (C.WHATSAPP || '573017810841');
    const d = document.createElement('nav'); d.className = 'lp-dock home'; d.setAttribute('aria-label', 'Menú');
    d.innerHTML = `<a href="adultos.html">${ic('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>')}<span>Adultos</span></a><a href="ninos.html">${ic('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>')}<span>Niños y jóvenes</span></a>
      <button type="button" class="on" data-goin>${ic('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>')}<span>Ingresar</span></button>
      <a class="lp-dwa" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent('¡Hola! Quiero información sobre las clases de inglés de mrarrieta.com')}"><svg viewBox="0 0 32 32" class="mri"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.4z"/></svg><span>WhatsApp</span></a>`;
    document.body.appendChild(d);
    // 📱 celular: la entrada no se desplaza, todo queda a la vista
    const lock = () => { const on = document.body.classList.contains('home-app'); const mob = innerWidth < 900; document.documentElement.classList.toggle('home-lock', on);
      const h = document.querySelector('.ld-hero'), tb = document.getElementById('topbar'); if (!h) return;
      if (!on || !mob) { h.style.height = ''; if (on) scrollTo(0, 0); return; } const top = h.getBoundingClientRect().top + scrollY; h.style.height = Math.max(360, innerHeight - top - d.offsetHeight - 22) + 'px'; scrollTo(0, 0); };
    lock(); setTimeout(lock, 300); setTimeout(lock, 1200); addEventListener('resize', lock);
  }
  // 💳 planes compactos y de venta (caben en una pantalla)
  function lpPlans() {
    const P = (window.MRPLANS && MRPLANS.PL) || {}, n = (k, d) => (P[k] && P[k].n) || d, f = (v) => '$' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const kid = PAGE === 'ninos';
    const C = [
      { k: 'free', ic: 'gift', c: 'g', name: 'Acceso gratuito', price: '$0', per: '· 3 días', hook: kid ? 'Descubre su nivel y prueba la plataforma sin pagar nada.' : 'Descubre tu nivel y prueba la plataforma sin pagar nada.', b: ['Prueba de nivel en 10 minutos', 'Habla y la plataforma lo corrige', kid ? 'Su ruta personalizada' : 'Tu ruta personalizada'], note: 'No incluye clases con profe.', btn: 'Empezar gratis' },
      { k: 'membership', ic: 'monitor', c: 'b', name: 'Plataforma', price: f(n('membership', 59900)), per: 'COP/mes', hook: kid ? 'Aprende a su ritmo, cuando quiera, desde el celular.' : 'Aprende a tu ritmo, cuando quieras, desde el celular.', b: ['Habla desde el día 1: te escucha y te corrige', 'Ruta completa del A1 al B2+', 'Certificado por cada módulo'], note: 'No incluye clases con profe.', btn: 'Empezar con Plataforma' },
      { k: 'premium', ic: 'crown', c: 'y', name: 'Premium · 4 clases', price: f(n('premium', 169900)), per: 'COP/mes', hook: kid ? 'Pierde el miedo a hablar con un profe que lo corrige en vivo.' : 'Pierde el miedo a hablar con un profe que te corrige en vivo.', b: ['4 clases 1 a 1 de 50 min al mes', 'Eliges profe, día y hora', 'Todo lo de Plataforma'], note: 'Clases no acumulables.', tag: 'Más elegido', pc: f(n('premium', 169900) / 4), btn: 'Empezar con Premium 4' },
      { k: 'premium8', ic: 'gem', c: 'v', name: 'Premium · 8 clases', price: f(n('premium8', 289900)), per: 'COP/mes', hook: 'Gana fluidez real: habla inglés 2 veces por semana.', b: ['8 clases 1 a 1: 2 por semana', 'El mejor precio por clase', 'Todo lo de Plataforma'], note: 'Clases no acumulables.', tag: 'Mejor precio por clase', pc: f(n('premium8', 289900) / 8), btn: 'Empezar con Premium 8' }];
    return `<section class="lp-plans" id="ld-planes"><div class="lp-ph">${lpSeg()}<h2>${kid ? 'Elige el plan para tu hijo(a)' : 'Elige tu plan'}</h2><p>Mes a mes · sin permanencia · tarjeta o transferencia</p></div>
      <div class="lp-pg">${C.map(p => `<a class="lp-pl c-${p.c}${p.tag ? ' hot' : ''}" ${p.k === 'free' ? `href="#" data-trial${kid ? ' data-kid' : ''}` : `href="inscripcion.html?plan=${p.k}"`}>${p.tag ? `<span class="lp-tag">${p.tag}</span>` : ''}
        <div class="lp-plh"><span class="ic">${MRI(p.ic)}</span><b>${p.name}</b></div><div class="lp-pr"><strong>${p.price}</strong><small>${p.per}</small></div>${p.pc ? `<span class="lp-ppc">Solo ${p.pc} por clase</span>` : '<span class="lp-ppc gh">COP</span>'}
        <p class="lp-hook">${p.hook}</p><ul>${p.b.map(x => `<li>${MRI('check')}<span>${x}</span></li>`).join('')}</ul><small class="lp-pn">${p.note}</small><span class="lp-pb"><span class="lg">${p.btn}</span><span class="sh">${p.k === 'free' ? 'Empezar gratis' : 'Lo quiero'}</span></span></a>`).join('')}</div>
      <p class="lp-swipe">Desliza para ver todos los planes →</p><p class="lp-pnote"><a href="politica.html">Ver condiciones</a></p></section>`;
  }

  // 🏷️ etiqueta de sección: el cliente siempre sabe si está en Adultos o en Niños y jóvenes
  const lpSeg = () => PAGE === 'ninos' ? `<span class="lp-seg k">${MRI('users')} Niños y jóvenes · 9 a 17 años</span>` : PAGE === 'adultos' ? `<span class="lp-seg a">${MRI('user')} Adultos · desde 18 años</span>` : '';
  // 👩‍🏫 profes en carrusel horizontal (desliza con el dedo o con las flechas)
  function lpProfes(panel) {
    const c = panel && panel.querySelector('.ld-cyl'); if (!c || c.dataset.lp) return; c.dataset.lp = '1'; clearInterval(cylWire.t);
    c.classList.add('lp-car'); [...c.children].forEach(d => { d.style.transform = ''; d.style.height = ''; d.classList.add('f'); }); c.style.transform = ''; c.style.height = '';
    const w = panel.querySelector('.ld-cylw'); if (w) w.style.height = '';
    const nav = panel.querySelector('.ld-cyln'); if (nav) nav.innerHTML = `<button class="ld-cyb" data-lc="-1" aria-label="Anterior">‹</button><div class="ld-cyd">${[...c.children].map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><button class="ld-cyb" data-lc="1" aria-label="Siguiente">›</button>`;
    const step = () => { const f = c.children[0]; return f ? f.getBoundingClientRect().width + 16 : 280; };
    const dots = () => { const i = Math.round(c.scrollLeft / step()); panel.querySelectorAll('.ld-cyd i').forEach((x, k) => x.classList.toggle('on', k === i)); };
    c.addEventListener('scroll', () => requestAnimationFrame(dots), { passive: true });
    let hold = 0; const go = (d) => { const max = c.scrollWidth - c.clientWidth - 4; c.scrollTo({ left: d > 0 && c.scrollLeft >= max ? 0 : c.scrollLeft + d * step(), behavior: 'smooth' }); };
    panel.querySelectorAll('[data-lc]').forEach(b => b.onclick = () => { hold = 1; go(+b.dataset.lc); setTimeout(() => hold = 0, 6000); });
    c.addEventListener('touchstart', () => { hold = 1; setTimeout(() => hold = 0, 7000); }, { passive: true });
    c.addEventListener('click', (e) => { const card = e.target.closest('[data-pfc]'); if (!card || e.target.closest('[data-pfr]')) return; e.stopImmediatePropagation(); const b = card.querySelector('[data-pfr]'); if (b && b.onclick) b.onclick(); }, true);
    clearInterval(lpProfes.t); lpProfes.t = setInterval(() => { if (!hold && !document.hidden && panel.classList.contains('on')) go(1); }, 3800);
  }
  // 📱 todo en una sola pantalla: cada sección es una pestaña (sin bajar)
  const LPT = { home: ['Inicio', '<path d="M3 10.5 12 3l9 7.5V21H3z"/>'], planes: ['Planes', '<path d="m2 7 4 10h12l4-10-5 3-5-6-5 6z"/>'], opin: ['Opiniones', '<path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"/>'], profes: ['Profes', '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>'], papas: ['Papás', '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'] };
  function lpPanels() {
    const wrap = $('.lp-page'); if (!wrap || wrap.dataset.pn) return; wrap.dataset.pn = '1';
    const map = PAGE === 'ninos' ? { home: ['.lp-hero'], papas: ['.lp-papas'], planes: ['.lp-plans'], profes: ['#ld-profes'] } : { home: ['.lp-hero'], planes: ['.lp-plans'], opin: ['#ld-testimonios'], profes: ['#ld-profes'] };
    { const op = wrap.querySelector('section#ld-planes'); if (op) op.remove(); } wrap.insertAdjacentHTML('beforeend', lpPlans());
    const box = document.createElement('div'); box.className = 'lp-panels';
    Object.keys(map).forEach(k => { const p = document.createElement('section'); p.className = 'lp-panel' + (k === 'home' ? ' on' : ''); p.dataset.p = k; map[k].forEach(sel => { const el = wrap.querySelector(sel); if (el) p.appendChild(el); });
      if (false) p.querySelector('.lp-plans').insertAdjacentHTML('beforeend', `<p class="lp-legal"><a href="politica.html">Política de reservas</a> · <a href="privacidad.html">Privacidad</a> · <a href="recomienda.html">Recomienda y gana</a> · <a href="reclutamiento.html">Trabaja con nosotros</a></p>`);
      if (p.children.length) box.appendChild(p); });
    [...wrap.children].forEach(c => { if (!c.classList.contains('lp-hid')) c.remove(); });
    wrap.appendChild(box);
    const dock = document.createElement('nav'); dock.className = 'lp-dock'; dock.setAttribute('aria-label', 'Secciones');
    dock.innerHTML = [...box.children].map(p => `<button type="button" data-tab="${p.dataset.p}" class="${p.dataset.p === 'home' ? 'on' : ''}">${LI(LPT[p.dataset.p][1])}<span>${LPT[p.dataset.p][0]}</span></button>`).join('');
    const other = PAGE === 'ninos' ? ['adultos.html', 'Adultos', '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>'] : ['ninos.html', 'Niños', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'];
    dock.insertAdjacentHTML('beforeend', `<a class="lp-dx" href="${other[0]}">${LI(other[2])}<span>${other[1]}</span></a><a class="lp-din" hidden href="index.html?ingresar=1">${LI('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>')}<span>Ingresar</span></a>`);
    dock.insertAdjacentHTML('beforeend', `<a class="lp-dwa" target="_blank" rel="noopener" href="https://wa.me/${(C.WHATSAPP || '573017810841')}?text=${encodeURIComponent(PAGE === 'ninos' ? '¡Hola! Quiero información sobre las clases de inglés para mi hijo(a) en mrarrieta.com' : '¡Hola! Quiero información sobre las clases de inglés de mrarrieta.com')}"><svg viewBox="0 0 32 32" class="mri"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.4z"/></svg><span>WhatsApp</span></a>`);
    dock.insertAdjacentHTML('beforeend', `<button type="button" class="lp-more" aria-label="Más opciones">${LI('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>')}<span>Más</span></button>`);
    document.body.appendChild(dock); document.body.classList.add('lp-app'); document.documentElement.classList.add('lp-html');
    const ms = document.createElement('div'); ms.className = 'lp-msheet'; ms.hidden = true;
    ms.innerHTML = `<div class="lp-msc">${box.querySelector('[data-p="profes"]') ? `<button type="button" data-tab="profes"><i>${LI(LPT.profes[1])}</i><b>Conoce a los profes</b><span>›</span></button>` : ''}${box.querySelector('[data-p="opin"]') ? '' : ''}<a href="${other[0]}"><i>${LI(other[2])}</i><b>${PAGE === 'ninos' ? 'Inglés para adultos' : 'Niños y jóvenes'}</b><span>›</span></a><a href="https://wa.me/${(C.WHATSAPP || '573017810841')}" target="_blank" rel="noopener" class="wa"><i>${LI('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>')}</i><b>Escríbenos por WhatsApp</b><span>›</span></a></div>`;
    document.body.appendChild(ms);
    const msOpen = (on) => { ms.hidden = !on; dock.querySelector('.lp-more').classList.toggle('on', on); };
    dock.querySelector('.lp-more').onclick = (e) => { e.stopPropagation(); msOpen(ms.hidden); };
    ms.addEventListener('click', (e) => { if (e.target === ms || e.target.closest('a,button')) msOpen(false); });
    const go = (k) => { if (!box.querySelector(`[data-p="${k}"]`)) return; $$('.lp-panel', box).forEach(p => p.classList.toggle('on', p.dataset.p === k)); $$('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === k)); const cur = box.querySelector(`[data-p="${k}"]`); cur.scrollTop = 0;
      if (k === 'profes') { const fx = () => { try { cylWire.fit && cylWire.fit(); } catch (e) { } }; fx(); setTimeout(fx, 60); setTimeout(fx, 400); } if (k === 'opin') { const t = $('#ld-testimonios'); if (t) t.hidden = false; } };
    window.__lpTab = go;
    dock.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab); });
    document.addEventListener('click', e => { const a = e.target.closest('[data-tab],a[href^="#ld-"],a[href="#lp-control"]'); if (!a || dock.contains(a)) return; const h = a.dataset.tab || ({ '#ld-planes': 'planes', '#ld-testimonios': 'opin', '#ld-profes': 'profes', '#lp-control': 'papas' })[a.getAttribute('href')]; if (!h) return; e.preventDefault(); e.stopImmediatePropagation(); go(h); }, true);
    const fit = () => { const tb = document.getElementById('topbar'); const top = box.getBoundingClientRect().top + scrollY; const dh = dock.offsetHeight + 18; box.style.height = Math.max(360, innerHeight - top - dh) + 'px'; };
    const gh = document.getElementById('go-home'); if (gh) gh.onclick = () => { location.href = 'index.html'; };
    const padTop = () => { const tb = document.getElementById('topbar'), ap = document.getElementById('app'); if (tb && ap) ap.style.paddingTop = innerWidth < 900 ? (tb.offsetHeight + 10) + 'px' : ''; };
    padTop(); fit(); addEventListener('resize', () => { padTop(); fit(); }); setTimeout(() => { padTop(); fit(); }, 300);
  }
  // ---------- comportamiento de las páginas de Adultos y de Niños y jóvenes ----------
  const PZK = 'mra_prize_v1';
  const prizeGet = () => { try { const x = JSON.parse(localStorage.getItem(PZK) || 'null'); return x && x.code ? x : null; } catch (e) { return null; } };
  function lpWire() {
    { const gb = $('#lp-gbar'); if (gb) { const K = Object.keys(LP_GOALS); let gi = 0, auto = true, tm = null;
      const pick = (k) => { gi = K.indexOf(k); $$('[data-goal]', gb).forEach(x => { x.classList.toggle('on', x.dataset.goal === k); x.classList.remove('run'); }); const a = $('#lp-ans'); a.querySelector('span').textContent = LP_GOALS[k][2]; a.classList.remove('pop'); void a.offsetWidth; a.classList.add('pop');
        if (auto) { const b = gb.querySelector(`[data-goal="${k}"]`); void b.offsetWidth; b.classList.add('run'); clearTimeout(tm); tm = setTimeout(() => { if (auto) pick(K[(gi + 1) % K.length]); }, 3600); } };
      $$('[data-goal]', gb).forEach(b => b.onclick = () => { auto = false; clearTimeout(tm); gb.classList.add('man'); pick(b.dataset.goal); });
      pick(K[0]); } }
    const ar = $('#lp-ar'); if (ar) { const paint = () => { const v = +ar.value, A = LP_AGE(v); $('#lp-av').textContent = v + ' años'; $('#lp-pt').textContent = A[1]; $('#lp-pd').textContent = A[2]; $('#lp-pi').className = 'pi ' + A[0]; const cb = $('.lp-k [data-kid] .lp-ctxt'); if (cb) cb.textContent = 'Prueba gratis para mi hijo(a) · ' + v + ' años'; try { sessionStorage.setItem('mra_kid_age', v); } catch (e) { } ar.style.setProperty('--p', ((v - 9) / 8 * 100) + '%'); }; ar.oninput = paint; paint(); }
    // 📱 en celular el globo va al lado del título
    lpChallengeWire();
    lpPanels();
  }
  function lpChallengeWire() {
    const box = $('#lp-demo'); if (!box) return; const ph = LP_PH[PAGE]; const res = $('#lp-res'), mic = $('#lp-mic');
    M.loadAudio(['promo']);
    $('#lp-ex').onclick = () => M.play(ph.au);
    const have = prizeGet(); if (have && Date.parse(have.expires + '-05:00') > Date.now()) { showOwned(have); }
    let busy = false, tries = 0;
    mic.onclick = async () => {
      if (busy) return; const h0 = prizeGet(); if (h0) return showOwned(h0, true);
      if (!M.canSR) { res.hidden = false; res.innerHTML = `<p class="lp-rmsg">Para el reto, abre esta página en <b>Google Chrome</b> y permite el micrófono.</p>`; return; }
      busy = true; tries++; box.classList.add('rec'); $('#lp-dl').textContent = 'TE ESTAMOS ESCUCHANDO…'; res.hidden = true;
      const r = await M.listen(9000, { quick: true }); busy = false; box.classList.remove('rec'); $('#lp-dl').textContent = 'RETO · TOCA EL MICRÓFONO Y DI';
      if (!r.alts || !r.alts.length) { res.hidden = false; res.innerHTML = `<p class="lp-rmsg">${r.error === 'not-allowed' || r.error === 'service-not-allowed' ? 'Permite el micrófono para jugar el reto.' : 'No te escuchamos. Toca el micrófono y habla un poco más fuerte.'}</p>`; return; }
      const sc = M.speechScore(ph.t, r.alts); const W = ph.t.split(' ');
      if (sc.score >= 100) return prizeWin(sc.score);
      res.hidden = false; res.innerHTML = `<div class="lp-almost"><b>¡Casi! ${sc.score}%</b><div class="lp-wd">${W.map((w, k) => `<span class="${sc.hit[k] ? 'ok' : 'bad'}">${esc(w)}</span>`).join('')}</div><p>Escucha el ejemplo ${LI(LP.vol)} y vuelve a intentarlo. ${tries >= 3 ? '¡Tú puedes!' : ''}</p></div>`;
    };
    function showOwned(x, toast) { const st = Date.parse(x.expires + '-05:00') > Date.now();
      res.hidden = false; res.innerHTML = st ? `<div class="lp-own">${MRI('gift')} <span>Ya ganaste tu premio: <b>${esc(x.code)}</b> · 10% en tu primer mes · válido hasta el ${esc(x.until || '')}</span></div>` : `<div class="lp-own off">Tu premio ${esc(x.code)} ya venció.</div>`; if (toast) M.toast('Ya ganaste tu premio: es uno por persona.'); }
  }
  function prizeWin(score) {
    try { M.confetti && M.confetti(2600); } catch (e) { } sfx('win'); setTimeout(() => { try { M.play('prcongrats'); } catch (e) { } }, 450); // 🔊 una voz real dice «Congratulations!»
    const m = M.modal(`<div class="lp-win"><div class="lp-win-top"><img src="mra-celebrate.webp" alt="Mr. Arrieta"></div><span class="lp-sc">${LI(LP.ok)} PRONUNCIACIÓN ${score}% · ¡EXCELENTE!</span>
      <h3>¡Ganaste <b>10%</b> en tu primer mes!</h3><p>Déjanos tus datos para guardar tu premio. Te lo enviamos por WhatsApp.</p>
      <input class="inp" id="pz-n" placeholder="${PAGE === 'ninos' ? 'Nombre del papá o la mamá' : 'Tu nombre y apellido'}" autocomplete="name"><input class="inp" id="pz-w" type="tel" placeholder="WhatsApp" autocomplete="tel">
      <label class="tf-ok"><input type="checkbox" id="pz-c"> <span>Autorizo a mrarrieta.com a contactarme por WhatsApp y a tratar mis datos según su <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span></label>
      <button class="btn r block lg" id="pz-go">Guardar mi premio →</button><p class="muted center" id="pz-m" style="font-size:13px;margin:6px 0 0"></p>
      <p class="lp-terms">Un premio por persona · válido 3 días · solo para clientes nuevos · no se suma con otros descuentos.</p></div>`, { x: true }); m.classList.add('lp-winm');
    const msg = (t) => { $('#pz-m', m).textContent = t; };
    $('#pz-go', m).onclick = async () => {
      const name = $('#pz-n', m).value.trim(), wa = $('#pz-w', m).value.trim();
      if (name.split(/\s+/).length < 2) return msg('Escribe nombre y apellido.'); if (wa.replace(/\D/g, '').length < 10) return msg('Revisa el número de WhatsApp (10 dígitos).'); if (!$('#pz-c', m).checked) return msg('Marca la casilla para continuar.');
      const b = $('#pz-go', m); b.disabled = true; b.textContent = 'Guardando…';
      const r = await MRAC.call('prizeClaim', { name, whatsapp: wa, score, phrase: LP_PH[PAGE].t, page: PAGE }).catch(() => null);
      if (!r || !r.ok) { b.disabled = false; b.textContent = 'Guardar mi premio →'; return msg(r && r.err === 'not_new' ? 'Este premio es solo para clientes nuevos. ¡Gracias por ser parte de mrarrieta.com!' : 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.'); }
      try { localStorage.setItem(PZK, JSON.stringify({ code: r.code, expires: r.expires, until: r.until })); if (r.state === 'activo') localStorage.setItem('mra_ref', r.code); } catch (e) { }
      const left = () => { const ms = new Date(r.expires + '-05:00').getTime() - Date.now(); if (ms <= 0) return [0, 0, 0]; return [Math.floor(ms / 864e5), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60]; };
      m.querySelector('.card').innerHTML = r.state !== 'activo' ? `<div class="lp-win"><h3>Tu premio ya venció</h3><p>El código ${esc(r.code)} venció el ${esc(r.until)}. El premio es uno por persona.</p><button class="btn k block" id="pz-x">Entendido</button></div>`
        : `<div class="lp-win"><span class="lp-sc">${LI(LP.ok)} ${r.existing ? 'YA TENÍAS UN PREMIO' : '¡PREMIO GUARDADO!'}</span><h3>Tu 10% en el primer mes</h3>
        <div class="lp-cp"><small>TU CÓDIGO</small><b>${esc(r.code)}</b><button class="lp-cpb" id="pz-cp" aria-label="Copiar">${LI(LP.copy)}</button><span class="lp-pc">−10%</span></div>
        <p class="lp-val">${LI(LP.cal)} Válido hasta el <b>${esc(r.until)}</b></p><div class="lp-cd" id="pz-cd"></div>
        <p class="muted" style="font-size:13px">Úsalo al pagar tu primer mes con el mismo WhatsApp. Ya quedó guardado en este equipo.</p>
        <a class="btn r block lg" href="#ld-planes" id="pz-pl">Usarlo ahora: ver planes</a><button class="btn w block" id="pz-x" style="margin-top:8px">Cerrar</button></div>`;
      const cd = $('#pz-cd', m); const tick = () => { if (!document.body.contains(cd)) return clearInterval(tm); const [d, hh, mm] = left(); cd.innerHTML = `<span>${d}<small>DÍAS</small></span><span>${hh}<small>HORAS</small></span><span>${mm}<small>MIN</small></span>`; }; let tm; if (cd) { tick(); tm = setInterval(tick, 30000); }
      const cp = $('#pz-cp', m); if (cp) cp.onclick = () => { try { navigator.clipboard.writeText(r.code); M.toast('Código copiado'); } catch (e) { } };
      const pl = $('#pz-pl', m); if (pl) pl.onclick = (e) => { e.preventDefault(); m.remove(); if (window.__lpTab) window.__lpTab('planes'); };
      $('#pz-x', m).onclick = () => m.remove();
      const res = $('#lp-res'); if (res && r.state === 'activo') { res.hidden = false; res.innerHTML = `<div class="lp-own">${MRI('gift')} <span>Ganaste tu premio: <b>${esc(r.code)}</b> · 10% en tu primer mes · válido hasta el ${esc(r.until)}</span></div>`; }
    };
  }
  // 🌟 página de entrada: hero con el ingreso, planes, testimonios, beneficios y cómo funciona
  function landing() {
    const card = $('.pt-login'); if (!card || !window.MRI) return;
    const LOGIN_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mri"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></svg>';
    const tb = $('#topbar .tb-tag'); if (tb) tb.outerHTML = PAGE === 'home' ? `<nav class="ld-nav ld-nav-h"><button class="btn k sm ld-in" data-goin>${LOGIN_IC} Ingresar</button></nav>`
      : /[?&]fam=1/.test(location.search) ? `<nav class="ld-nav lp-tnav"><a href="familia.html" class="btn k sm ld-in">← Mi portal de papás</a></nav>` : `<nav class="ld-nav lp-tnav"><a href="index.html?ingresar=1" class="btn k sm ld-in">${LOGIN_IC} Ingresar</a></nav>`;
    if (!window.__ldNav) { window.__ldNav = 1; document.addEventListener('click', (e) => {
      const gi = e.target.closest('[data-goin]'); if (gi) { const lg = document.querySelector('.ld-login .pt-login') || document.querySelector('.ld-login'); if (lg) { const bar = (document.getElementById('topbar') || { offsetHeight: 0 }).offsetHeight; scrollTo({ top: Math.max(0, scrollY + lg.getBoundingClientRect().top - bar - 12), behavior: 'smooth' }); const inp = lg.querySelector('input'); if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 450); } return; } // 🔑 estudiante reconocido: directo a escribir su código // 🧭 el menú muestra la sección completa (sin quedar tapada por la barra de arriba)
      const a = e.target.closest('a[href^="#ld-"]'); if (!a) return; const sec = document.querySelector(a.getAttribute('href')); if (!sec) return; e.preventDefault();
      const bar = (document.getElementById('topbar') || { offsetHeight: 0 }).offsetHeight, vh = innerHeight - bar, r = sec.getBoundingClientRect();
      const y = scrollY + r.top - bar - (r.height < vh ? Math.max(12, (vh - r.height) / 2) : 12);
      scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      setTimeout(() => { const r2 = sec.getBoundingClientRect(), b2 = (document.getElementById('topbar') || { offsetHeight: 0 }).offsetHeight; if (r2.top < b2 + 4 || (r2.height < innerHeight - b2 && r2.bottom > innerHeight)) scrollTo({ top: Math.max(0, scrollY + r2.top - b2 - 12), behavior: 'smooth' }); }, 900); }); } // ✅ corrige si algo cambió de tamaño mientras bajaba
    const XP = () => { const n = (window.MRPLANS && MRPLANS.extra) ? MRPLANS.extra() : 39900; return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
    const PL = window.MRPLANS || {}; const T = window.MRTESTIMONIOS || []; const pp = (k) => (PL.PL || {})[k] || {};
    const CARDS = [
      { id: 'free', icon: '🎁', name: 'ACCESO GRATUITO', price: '$0', per: 'COP · sin costo', tag: 'Pruébalo gratis · 3 días', perks: ['Descubre tu nivel en 10 minutos', 'Tu ruta personalizada', 'Habla y la plataforma te corrige'], note: 'No incluye clases individuales.', btn: 'Empezar gratis' },
      { id: 'membership', icon: '🖥️', name: 'PLATAFORMA', price: pp('membership').price || '$59.900', per: 'COP/mes', tag: 'Aprende a tu ritmo', perks: (PL.BEN || {}).membership ? PL.BEN.membership.filter(b => !/^No incluye/.test(b)) : [], note: 'No incluye clases individuales.' },
      { id: 'premium', icon: '👑', name: 'PREMIUM · 4 CLASES', price: pp('premium').price || '$169.900', per: 'COP/mes', tag: '+ 4 clases con profe', perks: (PL.BEN || {}).premium || [] },
      { id: 'premium8', icon: '💎', name: 'PREMIUM · 8 CLASES', price: pp('premium8').price || '$289.900', per: 'COP/mes', tag: '+ 8 clases con profe', perks: (PL.BEN || {}).premium8 || [], best: true }];
    const GAN = [['check', 'r', 'Hablas desde el día 1', 'La plataforma te escucha y te corrige'], ['user', 'b', 'Clases 1 a 1 con profes reales', 'Tú eliges profe, día y hora'], ['award', 'g', 'Del A1 al B2+ con certificado', 'Una ruta clara para cada nivel'], ['clock', 'y', '100% online, a tu ritmo', 'Desde tu celular, cuando quieras']];
    const wrap = document.createElement('div'); wrap.className = 'ld';
    const PROF_ON = (window.MRPROFES || []).length;
    const SEC_PLANES = `<section class="ld-sec" id="ld-planes"><h2>Elige tu plan</h2><p class="ld-sub">Pagos mes a mes · tarjeta o transferencia</p><div class="pv-grid n4">${['free', 'membership', 'premium', 'premium8'].map(k => `<a class="pv${PL.hot ? PL.hot(k) : ''}" ${k === 'free' ? 'href="#" data-trial' : `href="inscripcion.html?plan=${k}"`}>${PL.v2 ? PL.v2(k) : ''}</a>`).join('')}</div>${PL.trust ? PL.trust() : ''}</section>`, SEC_PROFES = PROF_ON ? `<section class="ld-sec" id="ld-profes">${lpSeg()}<h2>${PAGE === 'ninos' ? 'Los profes de tu hijo(a)' : 'Conoce a tus profes'}</h2><p class="ld-sub">${PAGE === 'ninos' ? 'Profesionales bilingües que también enseñan a niños y jóvenes · formación en la enseñan' : 'Profesionales bilingües con formación en la enseñan'}za del inglés</p><div class="ld-cylw"><div class="ld-pf ld-cyl">${pfGrid()}</div></div><div class="ld-cyln"><button class="ld-cyb" data-cy="-1" aria-label="Anterior">‹</button><div class="ld-cyd"></div><button class="ld-cyb" data-cy="1" aria-label="Siguiente">›</button></div></section>` : '';
    wrap.innerHTML = PAGE === 'home' ? `<section class="ld-hero"><div class="ld-copy"><h1>Aprende inglés <em>HABLANDO</em></h1>${pathCards()}<p class="ld-lead">La escuela donde <b>no eres un número</b>: <b>eliges tu profe</b>, clases <b>solo contigo</b> y practicas <b>a tu ritmo</b> con una plataforma que <b>te corrige</b>.</p>
        <div class="ld-cta"><button class="btn k lg" data-trial>${MRI('gift')} Prueba gratis 3 días</button></div><p class="ld-count-st"><b data-stc>+300</b> estudiantes ya hablan inglés con nosotros</p>
        <img class="ld-hero-mra" src="mra-x-rocket4.webp?v=2" alt="Mr. Arrieta"></div><div class="ld-login"></div></section>`
      : PAGE === 'ninos' ? heroKids() + kidsSections() + SEC_PROFES + `<section class="ld-final card lp-final-k"><div><h2>Que tu hijo(a) pruebe gratis</h2><p>3 días · sin tarjeta · sin compromiso.</p></div><button class="btn r lg" data-trial data-kid>${MRI('gift')} Crear su acceso gratis</button></section>`
      : heroAdult() + `
      <section class="ld-sec" id="ld-planes"><h2>Elige tu plan</h2><p class="ld-sub">Pagos mes a mes · tarjeta o transferencia</p><div class="pv-grid n4">${['free', 'membership', 'premium', 'premium8'].map(k => `<a class="pv${PL.hot ? PL.hot(k) : ''}" ${k === 'free' ? 'href="#" data-trial' : `href="inscripcion.html?plan=${k}"`}>${PL.v2 ? PL.v2(k) : ''}</a>`).join('')}</div>${PL.trust ? PL.trust() : ''}</section>
      <section class="ld-sec ld-tesbox card" id="ld-testimonios"${T.length ? '' : ' hidden'}>${lpSeg()}<h2>Lo que dicen nuestros estudiantes</h2><p class="ld-sub">Testimonios reales en video</p><div class="ld-tes">${tesGrid()}</div></section>
      ${(window.MRPROFES || []).length ? `<section class="ld-ref" id="ld-ref"><div class="grow"><span><b class="ld-ref-k">Recomiéndanos:</b> tu amigo recibe <b>10% de descuento</b> y tú ganas <b>15%</b> en tu primer mes si luego te inscribes.</span></div><a class="btn r" href="recomienda.html">Quiero recomendar →</a></section>
      <section class="ld-sec" id="ld-profes">${lpSeg()}<h2>Conoce a tus profes</h2><p class="ld-sub">Profesionales bilingües con formación en la enseñanza del inglés</p><div class="ld-cylw"><div class="ld-pf ld-cyl">${pfGrid()}</div></div><div class="ld-cyln"><button class="ld-cyb" data-cy="-1" aria-label="Anterior">‹</button><div class="ld-cyd"></div><button class="ld-cyb" data-cy="1" aria-label="Siguiente">›</button></div></section>` : ''}
      <section class="ld-sec" id="ld-ganas"><h2>¿Qué ganas con nosotros?</h2><p class="ld-sub">Todo lo que necesitas para hablar inglés con confianza</p><div class="card ld-glist">${GAN.map(([i, c, t, d]) => `<div class="ld-gi"><span class="ld-ic ${c}">${MRI(i)}</span><div><b>${t}</b><small>${d}</small></div></div>`).join('')}</div><div class="ld-note3">${MRI('calendar')}<p><b>Tú eliges cuándo tomar tus clases.</b> Reservas profe, día y hora desde tu perfil. Sin horarios fijos.</p></div></section>
      
      <section class="card ld-news" id="ld-news"><div><h2>Recibe tips y novedades</h2><p>Déjanos tu nombre y correo y te enviamos consejos para aprender inglés, novedades y promociones.</p></div>
        <form class="ld-newsf" id="ld-newsf"><input class="inp" id="nw-n" placeholder="Tu nombre" autocomplete="name"><input class="inp" id="nw-e" type="email" placeholder="Tu correo" autocomplete="email"><button class="btn k" type="submit">Quiero recibirlos</button>
        <label class="tf-ok"><input type="checkbox" id="nw-c"> Acepto recibir correos de mrarrieta.com. Puedo darme de baja cuando quiera.</label><p class="muted" id="nw-m" style="margin:0;font-size:13.5px"></p></form></section>
      <section class="ld-final card"><div><h2>¿Listo para hablar inglés?</h2><p>Empieza hoy tu prueba gratis de 3 días. Sin tarjeta, sin compromiso.</p></div><button class="btn r lg" data-trial>${MRI('gift')} Empezar gratis</button></section>`;
    if (PAGE !== 'home') wrap.classList.add('lp-page', 'lp-' + PAGE);
    const pw = card.closest('.pt-wrap'); if (pw) pw.classList.add('ld-on');
    card.parentNode.insertBefore(wrap, card); { const ll = wrap.querySelector('.ld-login'); if (ll) ll.appendChild(card); else { const hid = document.createElement('div'); hid.hidden = true; hid.className = 'lp-hid'; wrap.appendChild(hid); hid.appendChild(card); } }
    if (PAGE !== 'home') lpWire();
    { const tb = (location.search.match(/[?&]tab=(\w+)/) || [])[1]; if (tb && PAGE !== 'home') setTimeout(() => window.__lpTab && __lpTab(tb), 400); } // 👨‍👩‍👧 «Agregar otro hijo(a)» desde el panel de papás → planes
    if (/[?&]prueba=hijo/.test(location.search)) setTimeout(() => { // 👨‍👩‍👧 "Agregar otro hijo(a)" desde el panel de papás: formulario con los datos de los padres ya escritos
      trialForm(true); let pf = {}; try { pf = JSON.parse(localStorage.getItem('mra_fam_prefill') || '{}'); } catch (e) { }
      const set = (id, v) => { const i = document.getElementById(id); if (i && v) i.value = v; }; set('tf-g', pf.guardian); set('tf-w', pf.whatsapp); set('tf-e', pf.email); set('tf-e2', pf.email2);
    }, 500);
    else homeDock();
    const free = $('.pt-free'); if (free) free.remove();
    const or = $('.pt-or'); if (or) or.innerHTML = `<a href="#" data-trial class="pt-trialk">🎁 Prueba gratis 3 días</a>`;
    const links = $('.pt-links'); if (links) links.remove();
    const WAN = (C.WHATSAPP || '573017810841');
    wrap.insertAdjacentHTML('afterend', `<footer class="ld-foot"><div class="ld-foot-in"><div><h4>mrarrieta.com</h4><p>Aprende inglés HABLANDO con la metodología RealTalk®. Clases 100% online.</p></div>
      <div><h4>Escuela</h4><a href="${PAGE === 'home' ? 'adultos.html#ld-planes' : '#ld-planes'}">Planes</a><a href="adultos.html">Inglés para adultos</a><a href="ninos.html">Niños y jóvenes</a><a href="recomienda.html">Recomienda y gana</a><a href="politica.html">Política de reservas</a><a href="privacidad.html">Política de privacidad</a></div>
      <div><h4>Equipo</h4><a href="reclutamiento.html">Trabaja con nosotros</a></div>
      <div><h4>Contacto</h4><a target="_blank" rel="noopener" href="https://wa.me/${WAN}">WhatsApp ${esc(WAN.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'))}</a><span>Lun–vie 7 a. m.–9 p. m. · Sáb 7 a. m.–5 p. m.</span><span>Pagos: tarjeta (Mercado Pago), Nequi y Llave (Breve-B)</span></div></div>
      <p class="ld-copy-r">© ${new Date().getFullYear()} mrarrieta.com · Todos los derechos reservados</p></footer>
      <div class="ld-wawrap" id="ld-wa"><button class="ld-wax" aria-label="Ocultar">✕</button><a class="ld-wa" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp" href="${WA('¡Hola! Quiero información sobre las clases de inglés de mrarrieta.com')}"><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.8 4.9 2.1 6.9L3.6 28l5.7-1.5c2 1.1 4.3 1.7 6.7 1.7 7.2 0 13-5.6 13-12.6S23.2 3 16 3zm6.3 17.6c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.3-1.4-5.5-4.7-5.6-4.9-.2-.2-1.3-1.8-1.3-3.4s.8-2.4 1.1-2.7c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.6.3.7.9 2.3 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.3.6l-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 .9 2.3 1.1.3.2.6.3.7.4.1.3.1 1-.2 1.8z"/></svg></a></div>`);
    waDrag();
    const nf = $('#ld-newsf'); if (nf) nf.onsubmit = async (e) => { e.preventDefault(); const n = $('#nw-n').value.trim(), em = $('#nw-e').value.trim(), msg = (t) => { $('#nw-m').textContent = t; };
      if (n.length < 2) return msg('Escribe tu nombre.'); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return msg('Revisa tu correo.'); if (!$('#nw-c').checked) return msg('Marca la casilla para continuar.');
      const b = nf.querySelector('button'); b.disabled = true; b.textContent = 'Guardando…';
      setVName(n); const r = await MRAC.call('leadAdd', { name: n, email: em, consent: true }).catch(() => null);
      if (r && r.ok) { nf.innerHTML = `<p class="ld-newsok">${MRI('check')} ¡Listo, ${esc(n.split(' ')[0])}! Revisa tu correo: te enviamos la bienvenida.</p>`; try { localStorage.setItem('mra_lead', 'ok'); } catch (er) { } }
      else { b.disabled = false; b.textContent = 'Quiero recibirlos'; msg('No se pudo guardar. Inténtalo de nuevo.'); } };
    profReviews();
    { // 🧮 calculadora de clases extra + 👥 contador de estudiantes
      const xc = $('#ld-xcalc'); if (xc) { let n = 1; const pr = () => (window.MRPLANS && MRPLANS.extra) ? MRPLANS.extra() : 39900; const f = (v) => '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' COP';
        const draw = () => { $('[data-xn]', xc).textContent = n; $('[data-xl]', xc).textContent = n + (n === 1 ? ' clase extra' : ' clases extra'); $('[data-xt]', xc).textContent = f(pr() * n); };
        $$('[data-x]', xc).forEach(b => b.onclick = () => { n = Math.max(1, Math.min(10, n + +b.dataset.x)); draw(); }); draw(); }
      countUp();
    }
    if (!window.__trialWired) { window.__trialWired = true; document.addEventListener('click', trialClick); }
  }
  // 💬 botón flotante de WhatsApp: se puede arrastrar a cualquier lado y ocultar con la X
  function waDrag() {
    const w = $('#ld-wa'); if (!w) return; const K = 'mra_wa_pos';
    try { if (sessionStorage.getItem('mra_wa_off')) { w.remove(); return; } const p = JSON.parse(localStorage.getItem(K) || 'null'); if (p) { w.style.left = Math.min(p.x, innerWidth - 70) + 'px'; w.style.top = Math.min(p.y, innerHeight - 70) + 'px'; w.style.right = 'auto'; w.style.bottom = 'auto'; } } catch (e) { }
    w.querySelector('.ld-wax').onclick = (e) => { e.preventDefault(); e.stopPropagation(); w.remove(); try { sessionStorage.setItem('mra_wa_off', '1'); } catch (er) { } };
    let sx, sy, ox, oy, moved = false;
    const down = (e) => { if (e.target.closest('.ld-wax')) return; const t = e.touches ? e.touches[0] : e; const r = w.getBoundingClientRect(); sx = t.clientX; sy = t.clientY; ox = r.left; oy = r.top; moved = false;
      const mv = (ev) => { const q = ev.touches ? ev.touches[0] : ev; const dx = q.clientX - sx, dy = q.clientY - sy; if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return; moved = true; ev.preventDefault();
        w.style.left = Math.max(4, Math.min(innerWidth - 68, ox + dx)) + 'px'; w.style.top = Math.max(60, Math.min(innerHeight - 68, oy + dy)) + 'px'; w.style.right = 'auto'; w.style.bottom = 'auto'; };
      const up = () => { removeEventListener('mousemove', mv); removeEventListener('touchmove', mv); removeEventListener('mouseup', up); removeEventListener('touchend', up); if (moved) { try { localStorage.setItem(K, JSON.stringify({ x: parseInt(w.style.left), y: parseInt(w.style.top) })); } catch (er) { } } };
      addEventListener('mousemove', mv); addEventListener('touchmove', mv, { passive: false }); addEventListener('mouseup', up); addEventListener('touchend', up); };
    w.addEventListener('mousedown', down); w.addEventListener('touchstart', down, { passive: true });
    w.querySelector('.ld-wa').addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } });
  }
  // 🔑 cambiar el código de acceso desde el perfil
  if (!window.__passWired) { window.__passWired = 1; document.addEventListener('click', (e) => { if (!e.target.closest || !e.target.closest('#pt-pass')) return;
    const m = M.modal(`<h3>🔑 Cambiar mi código de acceso</h3><p class="muted">Tu código es tu contraseña para entrar. Usa de 4 a 20 letras o números (puedes usar guion).</p>
      <input class="inp" id="cp-old" type="password" placeholder="Tu código actual" autocomplete="off" style="margin-bottom:8px"><input class="inp" id="cp-new" type="password" placeholder="Nuevo código" autocomplete="off" style="margin-bottom:8px"><input class="inp" id="cp-new2" type="password" placeholder="Repite el nuevo código" autocomplete="off">
      <p id="cp-msg" class="center" style="color:#b91c1c;font-weight:700;min-height:20px;margin:8px 0"></p><button class="btn k block lg" id="cp-go">Guardar nuevo código</button>`, { x: true });
    $('#cp-go', m).onclick = async () => { const o = $('#cp-old', m).value.trim().toUpperCase(), n = $('#cp-new', m).value.trim().toUpperCase(), n2 = $('#cp-new2', m).value.trim().toUpperCase(), msg = $('#cp-msg', m);
      if (o !== String(MRAC.code() || '').toUpperCase()) return msg.textContent = 'El código actual no es correcto.';
      if (!/^[A-Z0-9-]{4,20}$/.test(n)) return msg.textContent = 'Usa de 4 a 20 letras o números (sin espacios).';
      if (n !== n2) return msg.textContent = 'Los dos códigos nuevos no coinciden.';
      const b = $('#cp-go', m); b.disabled = true; b.textContent = 'Guardando…';
      const r = await MRAC.call('myCodeChange', { code: o, newCode: n }).catch(() => null);
      if (r && r.ok) { MRAC.setCode(r.code); m.querySelector('.card').innerHTML = `<div class="center"><div class="to-ic">${MRI('check')}</div><h3>¡Listo! Tu código cambió</h3><p>Desde ahora entra con tu nuevo código. Te enviamos una confirmación a tu correo.</p><button class="btn k block lg" onclick="location.reload()">Entendido</button></div>`; return; }
      b.disabled = false; b.textContent = 'Guardar nuevo código'; msg.textContent = !r ? 'No hay conexión. Inténtalo de nuevo.' : r.err === 'taken' ? 'Ese código ya está en uso. Elige otro.' : r.err === 'same' ? 'El nuevo código es igual al actual.' : r.err === 'format' ? 'Usa de 4 a 20 letras o números.' : 'No se pudo cambiar. Inténtalo de nuevo.'; }; }); }
  function countUp() { const els = $$('[data-stc]'); if (!els.length) return; const run = (N) => els.forEach(el => { const t0 = performance.now(); const fr = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = '+' + Math.round(N * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(fr); }; requestAnimationFrame(fr); });
    if (window.MRAC && MRAC.on) MRAC.call('pubStats', {}).then(r => run(r && r.students ? r.students : 300)).catch(() => run(300)); else run(300); }
  window.MRCOUNTUP = countUp;
  function plansClick(e) { const b = e.target.closest && e.target.closest('[data-plans]'); if (!b) return; e.preventDefault(); const mo = b.closest('.modal'); if (mo) mo.remove(); if (window.MRPLANS) MRPLANS.modal(M); }
  if (!window.__plansWired) { window.__plansWired = true; document.addEventListener('click', plansClick); }
  // enlaces de los correos: ?pagar=CÓDIGO abre los planes y pagos · ?gratis=1 abre la prueba gratis
  // ✉️ botón "Confirmar mi correo" de los correos de bienvenida
  setTimeout(async () => { try { const q = new URLSearchParams(location.search); const vm = q.get('vm'), t = q.get('t'); if (!vm || !t) return; history.replaceState(null, '', location.pathname);
    const r = await MRAC.call('verifyMail', { code: vm, t }).catch(() => null);
    M.modal(`<div class="center"><div class="to-ic">${MRI(r && r.ok ? 'check' : 'alert')}</div><h3>${r && r.ok ? '¡Correo confirmado' + (r.first ? ', ' + esc(r.first) : '') + '!' : 'No pudimos confirmar tu correo'}</h3><p>${r && r.ok ? 'Gracias. Aquí te llegarán los avisos de tus clases y de tu plan.' : 'El enlace no es válido o tu correo cambió. Revisa el correo más reciente que te enviamos.'}</p></div>`, { x: true }); } catch (e) { } }, 500);
  setTimeout(() => { try { const q = new URLSearchParams(location.search); const pc = (q.get('pagar') || '').trim().toUpperCase(); const gr = q.get('gratis');
    if (pc || gr) history.replaceState(null, '', location.pathname);
    const pk = q.get('plan');
    if (pc) { if (window.MRAC && MRAC.code && MRAC.code() && MRAC.code().toUpperCase() === pc) { if (window.MRPLANS) MRPLANS.modal(M); } else { trialOver(pc, true); if (pk && window.MRBUY && /^(membership|premium|premium8)$/.test(pk)) setTimeout(() => { document.querySelectorAll('.modal').forEach(m => m.remove()); MRBUY.plan(pk, { extra: +q.get('extra') || 0 }); }, 300); } }
    else if (gr && $('.ld')) trialForm(); } catch (er) { } }, 1600);
  // ⭐ opiniones públicas de los profes en la página de entrada
  const nrm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^(mr|mrs|ms|teacher)\.?\s+/, '').trim();
  const starsHTML = (n) => '<span class="st5">' + [1, 2, 3, 4, 5].map(k => `<i class="${k <= Math.round(n) ? 'on' : ''}">★</i>`).join('') + '</span>';
  function tesGrid() { const PL = '<button class="ld-play" aria-label="Ver testimonio"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></button>';
    return (window.MRTESTIMONIOS || []).map((t, i) => `<figure class="ld-t" data-tes="${i}"><div class="ld-tv">${MRTES.poster(t) ? `<img src="${esc(MRTES.poster(t))}" alt="${esc(t.name)}" loading="lazy">` : ''}${PL}</div><figcaption><span class="ld-st">★★★★★</span><b>${esc(t.name)}</b>${t.info ? `<small>${esc(t.info)}</small>` : ''}</figcaption></figure>`).join(''); }
  function tesWire() {
    const box = $('#ld-testimonios'); if (!box) return; const T = window.MRTESTIMONIOS || [];
    box.hidden = !T.length && !box.querySelector('.ld-srv-c'); const g = $('.ld-tes', box); if (g) g.innerHTML = tesGrid();
    box.onclick = (e) => { const f = e.target.closest('.ld-t'); if (!f || f.classList.contains('on')) return; const t = T[+f.dataset.tes]; if (!t) return; // ▶️ se reproduce en su propio lugar
      box.querySelectorAll('.ld-t.on').forEach(o => { o.classList.remove('on'); const v = o.querySelector('video'); if (v) v.pause(); const x = T[+o.dataset.tes]; o.querySelector('.ld-tv').innerHTML = (MRTES.poster(x) ? `<img src="${esc(MRTES.poster(x))}" alt="">` : '') + '<button class="ld-play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></button>'; });
      f.classList.add('on'); f.querySelector('.ld-tv').innerHTML = MRTES.player(t); };
  }
  function cylWire() { // 🎡 profes en cilindro 3D: gira solo, con flechas o deslizando
    const c = $('#ld-profes .ld-cyl'); if (!c) return; const cards = [...c.children]; const n = cards.length; if (!n) return;
    const w = innerWidth < 600 ? 180 : 210, R = n < 3 ? 0 : Math.round(w / 2 / Math.tan(Math.PI / n)) + 24, st = n ? 360 / n : 0;
    cards.forEach((d, i) => { d.style.transform = `rotateY(${i * st}deg) translateZ(${R}px)`; });
    const dots = $('#ld-profes .ld-cyd'); if (dots) dots.innerHTML = cards.map((_, i) => `<i data-i="${i}"></i>`).join('');
    let k = 0; const go = (to) => { k = to; const a = ((k % n) + n) % n; c.style.transform = `translateZ(-${R}px) rotateY(${-k * st}deg)`; cards.forEach((d, i) => d.classList.toggle('f', i === a)); if (dots) [...dots.children].forEach((x, i) => x.classList.toggle('on', i === a)); };
    const fit = () => { c.style.height = 'auto'; cards.forEach(d => d.style.height = 'auto'); const H = Math.max(200, ...cards.map(d => d.scrollHeight)) + 4; c.style.height = H + 'px'; cards.forEach(d => d.style.height = H + 'px'); const w8 = $('#ld-profes .ld-cylw'); if (w8) w8.style.height = (H + 60) + 'px'; };
    cylWire.fit = fit; fit(); setTimeout(fit, 400); cards.forEach(d => { const im = d.querySelector('img'); if (im && !im.complete) im.addEventListener('load', fit, { once: true }); });
    go(0); clearInterval(cylWire.t); let hold = 0; cylWire.t = setInterval(() => { if (!hold && !document.hidden) go(k + 1); }, 3000);
    const w8 = $('#ld-profes .ld-cylw'); w8.onmouseenter = () => hold = 1; w8.onmouseleave = () => hold = 0;
    $$('#ld-profes [data-cy]').forEach(b => b.onclick = () => { go(k + (+b.dataset.cy)); hold = 1; setTimeout(() => hold = 0, 6000); });
    if (dots) dots.onclick = e => { const i = e.target.dataset && e.target.dataset.i; if (i == null) return; const a = ((k % n) + n) % n; go(k + (+i - a)); };
    cards.forEach((d, i) => d.addEventListener('click', () => { if (!d.classList.contains('f')) { const a = ((k % n) + n) % n; let df = i - a; if (df > n / 2) df -= n; if (df < -n / 2) df += n; go(k + df); } }));
    let x0 = null; w8.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; hold = 1; }, { passive: true });
    w8.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 35) go(k + (dx < 0 ? 1 : -1)); x0 = null; setTimeout(() => hold = 0, 5000); });
  }
  function pfGrid() { return MRPROFES.map((p, i) => `<div class="card ld-pc" data-pfc="${i}"><img src="${esc(p.img)}" alt="${esc(p.name)}"><b>${p.title === 'Director' ? 'Director' : esc(p.title)} ${esc(p.name)}</b><div class="ld-stars" data-pf="${i}"></div><ul>${p.info.map(x => `<li>${MRI('check')}<span>${esc(x)}</span></li>`).join('')}</ul><button class="btn w sm" data-pfr="${i}" hidden>Ver opiniones</button></div>`).join(''); }
  async function profReviews() {
    tesWire(); (window.MRTESREADY || Promise.resolve()).then(tesWire).catch(() => { }); // 🎬 testimonios subidos en administración
    if (!window.MRPROFES || !$('#ld-profes')) return;
    try { await (window.MRPROFREADY || Promise.resolve()); const g = $('#ld-profes .ld-pf'); if (g) g.innerHTML = pfGrid(); } catch (e) { } cylWire(); // 👩‍🏫 profes creados en administración
    const r = await MRAC.call('reviews', {}).catch(() => null); const all = (r && r.reviews) || [];
    try { const SV = ((r && r.school) || []).filter(x => x.text).slice(0, 6), box = $('#ld-testimonios'); // ⭐ opiniones de la escuela publicadas desde administración
      if (SV.length && box) { box.hidden = false; const sub = $('.ld-sub', box); if (sub) sub.textContent = (window.MRTESTIMONIOS || []).length ? 'Testimonios en video y opiniones verificadas' : 'Opiniones verificadas de nuestros estudiantes';
        let g = $('.ld-srv', box); if (!g) { g = document.createElement('div'); g.className = 'ld-srv'; box.appendChild(g); }
        g.innerHTML = SV.map(x => `<div class="ld-srv-c">${starsHTML(x.stars)}<p>“${esc(x.text)}”</p><small><b>${esc(x.name)}</b> · ${esc(x.module)}</small><span class="ld-srv-v">${MRI('check')} Estudiante verificado</span></div>`).join(''); } } catch (e) { }
    const by = MRPROFES.map(p => { const k = nrm(p.name), f = k.split(' ')[0], l = k.split(' ').slice(-1)[0]; return all.filter(x => { const t = nrm(x.teacher); return t === k || (t.indexOf(f) >= 0 && t.indexOf(l) >= 0); }); });
    $$('[data-pf]').forEach(el => { const L = by[+el.dataset.pf]; if (!L.length) { el.innerHTML = ''; el.style.display = 'none'; return; } /* sin opiniones: solo su formación y experiencia */ const avg = L.reduce((a, x) => a + x.stars, 0) / L.length; el.innerHTML = starsHTML(avg) + ` <small><b>${avg.toFixed(1)}</b> · ${L.length} ${L.length === 1 ? 'opinión' : 'opiniones'}</small>`; const bt = $(`[data-pfr="${el.dataset.pf}"]`); if (bt) { bt.hidden = false; bt.textContent = `Ver opiniones (${L.length})`; } }); // el botón solo aparece si el profe tiene opiniones
    try { cylWire.fit && cylWire.fit(); } catch (e) { }
    $$('[data-pfc]').forEach(c => c.addEventListener('click', e => { if (e.target.closest('[data-pfr]')) return; if (!c.classList.contains('f')) return; const b = c.querySelector('[data-pfr]'); if (b && b.onclick) b.onclick(); }));
    $$('[data-pfr]').forEach(b => b.onclick = () => { const p = MRPROFES[+b.dataset.pfr], L = by[+b.dataset.pfr];
      M.modal(`<div class="center"><img src="${esc(p.img)}" alt="" style="width:84px;height:84px;border-radius:50%;object-fit:cover"><h3 style="margin:8px 0 2px">${p.title === 'Director' ? 'Director' : esc(p.title)} ${esc(p.name)}</h3>${L.length ? starsHTML(L.reduce((a, x) => a + x.stars, 0) / L.length) + ` <small>${L.length} ${L.length === 1 ? 'opinión' : 'opiniones'}</small>` : ''}</div>
        <ul class="ld-pfinfo">${p.info.map(x => `<li>${MRI('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
        ${L.length ? `<h4 class="ld-pfrh">Opiniones de estudiantes</h4><div class="ld-revs">${L.slice(0, 40).map(x => `<div class="ld-rev">${starsHTML(x.stars)}${x.text ? `<p>“${esc(x.text)}”</p>` : ''}<small>${esc(x.student)} · ${esc(x.date)}</small></div>`).join('')}</div>` : ''}`, { x: true }); });
  }
  function trialClick(e) { const b = e.target.closest && e.target.closest('[data-trial]'); if (!b) return; e.preventDefault(); trialForm(b.hasAttribute('data-kid') || PAGE === 'ninos'); }
  // 🎁 acceso gratuito automático: nombre, WhatsApp y correo → se crea el código y entra de una
  function trialForm(kidFirst) {
    const m = M.modal(`<div class="center"><div class="to-ic">${MRI('gift')}</div><h3>Prueba gratis 3 días</h3><p class="to-lead">Acceso completo a <b>la plataforma</b> por 3 días. Esto lograrás:</p><ul class="to-list"><li>${MRI('check')} <span>Saber tu <b>nivel exacto</b> en 10 minutos</span></li><li>${MRI('check')} <span><b>Hablar tus primeras frases</b> en inglés</span></li><li>${MRI('check')} <span>Practicar con una plataforma que <b>te escucha y te corrige</b></span></li></ul><p class="to-sm">Sin tarjeta · sin compromiso · no incluye clases con profe</p></div>
      <div class="tf"><div class="tf-who" role="tablist"><button type="button" class="on" data-who="me">Para mí</button><button type="button" data-who="kid">Para mi hijo(a)</button></div>
      <b class="tf-h tf-k hidden">Datos del niño(a)</b><input class="inp" id="tf-n" placeholder="Nombre y apellido" autocomplete="name"><label class="tf-bd tf-k hidden"><span>Fecha de nacimiento</span><input class="inp" id="tf-b" type="date" max="${new Date().toISOString().slice(0, 10)}"><small>Con su edad lo llevamos a su experiencia: <b>Kids</b> (9 a 11) o <b>Teens</b> (12 a 17).</small></label><b class="tf-h tf-k hidden">Datos del papá o la mamá</b><input class="inp tf-k hidden" id="tf-g" placeholder="Nombre y apellido" autocomplete="name"><input class="inp" id="tf-w" type="tel" placeholder="WhatsApp" autocomplete="tel"><input class="inp" id="tf-e" type="email" placeholder="Correo" autocomplete="email"><input class="inp tf-k hidden" id="tf-e2" type="email" placeholder="Correo del otro padre (opcional)">
      <label class="tf-ok"><input type="checkbox" id="tf-c"> <span id="tf-ct">Autorizo a mrarrieta.com a contactarme por correo y WhatsApp y a tratar mis datos según su <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span></label>
      <button class="btn r block lg" id="tf-go">Crear mi acceso gratis →</button><p class="muted center" id="tf-msg" style="font-size:13.5px;margin:0"></p></div>`, { x: true });
    const msg = (t) => { $('#tf-msg', m).textContent = t; }; let kid = false;
    m.querySelectorAll('[data-who]').forEach(b => b.onclick = () => { kid = b.dataset.who === 'kid'; m.querySelectorAll('[data-who]').forEach(x => x.classList.toggle('on', x === b)); m.querySelectorAll('.tf-k').forEach(x => x.classList.toggle('hidden', !kid)); msg(''); m.querySelector('.card').classList.toggle('tf-kidm', kid); const ld = m.querySelector('.to-lead'); if (ld) { ld._o = ld._o || ld.innerHTML; ld.innerHTML = kid ? 'Acceso completo a <b>la plataforma</b> por 3 días para tu hijo(a).' : ld._o; }
      $('#tf-n', m).placeholder = 'Nombre y apellido'; $('#tf-w', m).placeholder = 'WhatsApp'; $('#tf-e', m).placeholder = 'Correo';
      const POL = '<a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>'; $('#tf-ct', m).innerHTML = (kid ? 'Soy su papá, mamá o acudiente y autorizo a mrarrieta.com a contactarme y a tratar nuestros datos según su ' : 'Autorizo a mrarrieta.com a contactarme por correo y WhatsApp y a tratar mis datos según su ') + POL + '.'; });
    if (kidFirst) { const kb = m.querySelector('[data-who="kid"]'); if (kb) kb.click(); }
    $('#tf-go', m).onclick = async () => {
      const name = $('#tf-n', m).value.trim(), whatsapp = $('#tf-w', m).value.trim(), email = $('#tf-e', m).value.trim(), guardian = $('#tf-g', m).value.trim(), email2 = $('#tf-e2', m).value.trim();
      if (name.split(/\s+/).length < 2) return msg(kid ? 'Escribe el nombre y apellido del niño(a).' : 'Escribe tu nombre y apellido.');
      if (kid && guardian.split(/\s+/).length < 2) return msg('Escribe el nombre y apellido del papá o la mamá.');
      const birth = kid ? ($('#tf-b', m).value || '') : ''; if (kid) { if (!birth) return msg('Escribe la fecha de nacimiento del niño(a).'); const t = new Date(), bd = new Date(birth + 'T12:00:00'); let age = t.getFullYear() - bd.getFullYear(); if (t.getMonth() < bd.getMonth() || (t.getMonth() === bd.getMonth() && t.getDate() < bd.getDate())) age--; if (age < 9 || age > 17) return msg(age < 9 ? 'La escuela recibe niños desde los 9 años.' : 'Para mayores de 18 años elige «Para mí».'); }
      if (whatsapp.replace(/\D/g, '').length < 7) return msg('Revisa el número de WhatsApp.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return msg('Revisa el correo.');
      if (kid && email2 && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email2) || email2.toLowerCase() === email.toLowerCase())) return msg('Revisa el segundo correo (debe ser diferente al primero).');
      if (!$('#tf-c', m).checked) return msg('Marca la casilla para continuar.');
      const b = $('#tf-go', m); b.disabled = true; b.textContent = '⏳ Creando tu acceso…';
      setVName(name); const r = await MRAC.call('trialSignup', kid ? { name, whatsapp, email, kid: true, guardian, email2, birth } : { name, whatsapp, email }).catch(() => null);
      if (!r || !r.ok) { b.disabled = false; b.textContent = 'Crear mi acceso gratis →'; return msg(r && r.err === 'family' ? 'Esta familia ya tiene 3 pruebas gratis. Para otro hijo(a), escríbenos por WhatsApp o elige un plan.' : r && r.err === 'busy' ? 'Hay muchas solicitudes en este momento. Inténtalo en unos minutos.' : 'No se pudo crear tu acceso. Revisa tus datos e inténtalo de nuevo.'); }
      if (r.exists) { m.querySelector('.card').innerHTML = `<div class="center"><div class="to-ic">${MRI('clock')}</div><h3>Estos datos ya están registrados</h3><p>El acceso gratuito de 3 días es <b>solo una vez por persona</b>. Si ya eres estudiante, entra con tu código en "Ingresa a tu perfil". Si quieres continuar, elige tu plan.</p><a class="btn k block lg" href="#ld-planes" id="tf-pl">Ver planes →</a></div>`; $('#tf-pl', m).onclick = () => m.remove(); return; }
      m.querySelector('.card').innerHTML = `<div class="center">${M.mascot('mascot bounce', 'celebrate')}<h3>¡Listo, ${esc(r.first)}! 🎉</h3><p>Tu código de acceso es</p><div class="rc-code" style="font:800 28px Poppins,sans-serif;color:#0B2A5B;letter-spacing:.06em;background:#EEF3FB;border:2px dashed #9fb3d6;border-radius:14px;padding:8px 18px;display:inline-block;margin:6px 0">${esc(r.code)}</div><p class="muted">${kid ? 'También lo enviamos ' + (email2 ? 'a los dos correos' : 'al correo') + ' de los padres.' : 'También te lo enviamos al correo.'} Guárdalo para entrar después.</p>${kid && r.fcode ? `<div class="tf-fam">${MRI('users')}<span>Código de familia: <b>${esc(r.fcode)}</b><small>Con él, papá y mamá ven cómo va su hijo(a). Llegó a su correo.</small></span></div>` : ''}<button class="btn r block lg" id="tf-in">Entrar a mi prueba gratis →</button></div>`;
      $('#tf-in', m).onclick = () => { m.remove(); if (PAGE !== 'home') { try { sessionStorage.setItem('mra_autocode', r.code); } catch (e) { } location.href = 'index.html'; return; } const i = $('#cd'); if (i) { i.value = r.code; $('#ok').click(); } };
    };
  }
  // ✨ bienvenida en la página de entrada: lluvia de estrellas doradas y destellos (1 vez por visita) → luego vuela Mr. Arrieta
  function welcomeFx() {
    // se muestra siempre (también con el ahorro de batería del celular, que activa 'reducir animaciones')
    const cv = document.createElement('canvas'); cv.className = 'wfx'; document.body.appendChild(cv); const x = cv.getContext('2d');
    const fit = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; x.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }; fit();
    const W = innerWidth, H = innerHeight, N = innerWidth < 600 ? 46 : 80, COL = ['#FFD23F', '#FFC21A', '#ffffff', '#E3242B', '#7fb2ff'];
    const P = Array.from({ length: N }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, s: 5 + Math.random() * 9, v: 1.6 + Math.random() * 2.4, r: Math.random() * 6.28, vr: (Math.random() - .5) * 0.12, sw: Math.random() * 6.28, c: COL[Math.floor(Math.random() * COL.length)], k: Math.random() < .7 ? 'star' : 'spark' }));
    const star = (s) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? s * 0.45 : s; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); };
    const t0 = performance.now(), DUR = 2300;
    const loop = (t) => { const e = t - t0; x.clearRect(0, 0, W, H); const fade = e > DUR - 500 ? Math.max(0, (DUR - e) / 500) : 1;
      P.forEach((p) => { p.y += p.v; p.sw += 0.05; p.r += p.vr; const px = p.x + Math.sin(p.sw) * 14; x.save(); x.globalAlpha = fade * (p.k === 'spark' ? 0.6 + 0.4 * Math.sin(e / 90 + p.sw) : 1); x.translate(px, p.y); x.rotate(p.r); x.fillStyle = p.c; x.shadowColor = p.c; x.shadowBlur = p.k === 'spark' ? 10 : 4;
        if (p.k === 'star') star(p.s); else { x.fillRect(-p.s * 0.12, -p.s, p.s * 0.24, p.s * 2); x.fillRect(-p.s, -p.s * 0.12, p.s * 2, p.s * 0.24); } x.restore(); });
      if (e < DUR) requestAnimationFrame(loop); else { cv.remove(); rocketTour(); } };
    requestAnimationFrame(loop);
  }
  // 🚀 recorrido volando de Mr. Arrieta en la página de entrada (1 vez por visita; al tocarlo se repite)
  function rocketTour(force) {
    const mob = innerWidth <= 600; const el = mob ? $('.ld-hero-mra') : $('.ld-login .pt-rkt'); if (!el || el.offsetParent === null) return;
    if (!el._tw) { el._tw = 1; el.style.cursor = 'pointer'; el.addEventListener('click', () => rocketTour(true)); }
    if (el._fly) return; el._fly = 1;
    const r = el.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    let K;
    if (true) { // 🎢 opción 2: rizo (loop) completo en el aire + regreso con onda de aterrizaje
      const Rx = mob ? Math.min(W * 0.3, 120) : Math.min(230, (r.left - 60) / 2), Ry = Math.max(40, Math.min(mob ? 120 : 140, r.top - 90)), cx0 = -Rx; K = [{ t: 'translate(0px,0px) rotate(0deg) scale(1)', o: 1, f: 0 }];
      for (let k = 1; k <= 16; k++) { const th = k / 16 * 2 * Math.PI, x = mob ? W * 0.12 * Math.sin(th) : cx0 + Rx * Math.cos(th), y = mob ? -Ry * (1 - Math.cos(th)) : -Ry * Math.sin(th) - 20 * Math.sin(th / 2); K.push({ t: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(-k * 22.5).toFixed(1)}deg) scale(${(1 - (mob ? 0.45 : 0.25) * Math.sin(th / 2)).toFixed(2)})`, o: 1, f: +(.05 + k / 16 * .72).toFixed(3) }); }
      K.push({ t: 'translate(0px,-14px) rotate(-366deg) scale(1.08)', o: 1, f: .84 }, { t: 'translate(0px,10px) rotate(-360deg) scale(.96)', o: 1, f: .91 }, { t: 'translate(0px,-5px) rotate(-360deg) scale(1.02)', o: 1, f: .96 }, { t: 'translate(0px,0px) rotate(-360deg) scale(1)', o: 1, f: 1 });
    } else {
    // 🌌 se aleja hacia el fondo (se hace pequeño), da la vuelta allá lejos y regresa hacia el frente hasta su lugar
    const cx = W / 2 - (r.left + r.width / 2), cy = Math.max(-r.top + 40, -H * 0.3);
    const fx = mob ? cx * 0.6 : cx * 0.55, fy = mob ? cy * 0.9 : cy;
    K = [
      { t: 'translate(0px,0px) rotate(0deg) scale(1)', o: 1, f: 0 },
      { t: `translate(${fx * 0.25}px,${fy * 0.3 + 10}px) rotate(-8deg) scale(1.08)`, o: 1, f: .1 },
      { t: `translate(${fx * 0.7}px,${fy * 0.85}px) rotate(-16deg) scale(.55)`, o: 1, f: .28 },
      { t: `translate(${fx}px,${fy}px) rotate(-22deg) scale(.14)`, o: .85, f: .42 },
      { t: `translate(${fx * 1.25}px,${fy * 0.9}px) rotate(160deg) scale(.1)`, o: .7, f: .52 },
      { t: `translate(${fx * 0.8}px,${fy * 0.6}px) rotate(350deg) scale(.4)`, o: 1, f: .64 },
      { t: `translate(${fx * 0.25}px,${fy * 0.2}px) rotate(360deg) scale(1.18)`, o: 1, f: .8 },
      { t: 'translate(0px,10px) rotate(360deg) scale(.97)', o: 1, f: .9 },
      { t: 'translate(0px,-5px) rotate(360deg) scale(1.02)', o: 1, f: .96 },
      { t: 'translate(0px,0px) rotate(360deg) scale(1)', o: 1, f: 1 }];
    }
    el.style.position = el.style.position || 'relative'; el.style.zIndex = 50;
    const a = el.animate(K.map(k => ({ transform: k.t, opacity: k.o, offset: k.f })), { duration: mob ? 3600 : 4000, easing: 'cubic-bezier(.4,0,.3,1)' });
    const tr = setInterval(() => { const b = el.getBoundingClientRect(); const st = document.createElement('span'); st.className = 'rk-star'; st.textContent = Math.random() < .5 ? '✦' : '★'; st.style.left = (b.left + b.width * (mob ? .18 : .2) + window.scrollX) + 'px'; st.style.top = (b.top + b.height * .72 + window.scrollY) + 'px'; document.body.appendChild(st); setTimeout(() => st.remove(), 900); }, 70);
    a.onfinish = () => { clearTimeout(rocketTour.rep); rocketTour.rep = setTimeout(() => { if (!document.hidden && document.body.classList.contains('home-app') && !document.querySelector('.modal,.sheet-on,.wfx') && $('.ld-hero')) welcomeFx(); }, 5000); /* 🔁 cada 5 s: estrellas + vuelo */ clearInterval(tr); el._fly = 0; el.style.zIndex = ''; const b = el.getBoundingClientRect(), rg = document.createElement('span'); rg.className = 'rk-ring'; rg.style.left = (b.left + b.width / 2 + scrollX) + 'px'; rg.style.top = (b.top + b.height * .8 + scrollY) + 'px'; document.body.appendChild(rg); setTimeout(() => rg.remove(), 800); };
  }
  function login() {
    app.innerHTML = `<div class="wrap pt-wrap"><div class="card pt-login">
      
      ${(() => { const lu = P.lastUser(); const vn = (lu && lu.first) || vName(); return lu && lu.first ? `<div class="pt-hello"><img class="pt-mra pt-rkt" src="mra-x-rocket2.webp?v=2" alt="Mr. Arrieta" draggable="false" data-noguide><div class="bubble">${hiGreet(vn)}</div></div>`
        : `<div class="pt-hello"><img class="pt-mra pt-rkt" src="mra-x-rocket2.webp?v=2" alt="Mr. Arrieta" draggable="false"><div class="bubble">${hiGreet(vn)}</div></div>`; })()}
      <h1>Ingresa a tu perfil</h1><p class="muted">Escribe el código que te llegó a tu correo o WhatsApp.</p>
      <input class="inp" id="cd" type="password" placeholder="Ej: ABC-123" autocapitalize="characters" autocomplete="off">
      <button class="btn k block lg" id="ok">Entrar →</button>
      <div class="pt-or"><span>¿Aún no eres estudiante?</span></div>
      <div class="pt-free"><h2>🟢 EMPIEZA GRATIS</h2>
        <p><b>Crea tu acceso gratuito y descubre tu ruta de aprendizaje.</b></p>
        <p class="muted">Realiza nuestra prueba de clasificación y explora los primeros temas de tu módulo.</p>
        <a class="btn block lg pt-wa" target="_blank" rel="noopener" href="${WA('¡Hola! 👋 Quiero EMPEZAR GRATIS en la plataforma de mrarrieta.com y descubrir mi ruta de aprendizaje. ¿Me envían mi código de acceso gratuito? 🟢')}">EMPEZAR GRATIS →</a>
        <a class="btn w block pt-insc" href="inscripcion.html">📝 Formulario de inscripción</a></div></div>
      <p class="center pt-links"><a href="recomienda.html"><b>🤝 Recomienda y gana</b></a> · <a href="reclutamiento.html">👩‍🏫 Trabaja con nosotros</a> · <a href="profesores.html">🧑‍🏫 Soy profesor</a> · <a href="administracion.html">🔐 Administración</a></p></div>`;
    landing();
    if (PAGE === 'home') { welcomeFx(); if (!window.__wfxPS) { window.__wfxPS = 1; addEventListener('pageshow', (e) => { if (e.persisted && !P.get() && $('.ld-hero')) { const el = $('.ld-hero-mra') || $('.ld-login .pt-rkt'); if (el) el._fly = 0; welcomeFx(); } }); } } // ✨ cada vez que vuelve a la entrada: estrellas + vuelo // ✨ lluvia de estrellas de bienvenida y después el vuelo de Mr. Arrieta
    const i = $('#cd'); setTimeout(() => { if (window.innerWidth > 900) i.focus(); }, 200);
    if (PAGE === 'home') { let ac = ''; try { ac = sessionStorage.getItem('mra_autocode') || ''; sessionStorage.removeItem('mra_autocode'); } catch (e) { } if (ac) { window.__famIn = (() => { try { return sessionStorage.getItem('mra_from_fam') === '1'; } catch (e) { return false; } })(); setTimeout(() => { i.value = ac; $('#ok').click(); }, 400); } }
    const bad = (msg) => { i.classList.add('wrong'); sfx('bad'); setTimeout(() => i.classList.remove('wrong'), 500); M.toast(msg || 'Código no válido 😕'); };
    const go = async () => { try { if (window.speechSynthesis) { const w = new SpeechSynthesisUtterance(' '); w.volume = 0; speechSynthesis.speak(w); } } catch (e) { } // desbloquea la voz en iPhone
      const v = i.value.trim(); if (!v) return bad('Escribe tu código 🙂');
      if (/^FAM-/i.test(v) && window.MRAC && MRAC.on) { // 👨‍👩‍👧 código de familia → panel de papás
        const b = $('#ok'); b.disabled = true; b.textContent = 'Entrando…'; const fr = await MRAC.call('famData', { fcode: v.toUpperCase() }).catch(() => null); b.disabled = false; b.textContent = 'Entrar →';
        if (fr && fr.ok) { try { sessionStorage.setItem('mra_fam_hi', '1'); localStorage.setItem('mra_fam', v.toUpperCase()); localStorage.setItem('mra_last_role', JSON.stringify({ role: 'family' })); } catch (e) { } location.href = 'familia.html'; return; }
        return bad(fr && fr.err === 'notfound' ? 'No encontramos ese código de familia. Revísalo 🙏' : 'No hay conexión con la nube. Inténtalo de nuevo.'); }
      // 1) códigos de la nube (planes Acceso gratuito / Membership / Premium)
      if (window.MRAC && MRAC.on && !codeType(v)) {
        const b = $('#ok'); b.disabled = true; b.textContent = 'Entrando…';
        const r = await MRAC.login(v); b.disabled = false; b.textContent = 'Entrar →';
        if (r.ok) { try { if (!window.__famIn) sessionStorage.removeItem('mra_from_fam'); localStorage.setItem('mra_last_role', JSON.stringify({ role: 'student' })); } catch (e) { } sfx('win'); M.confetti(1500); try { sessionStorage.removeItem('mra_back'); } catch (e) { } greetVoice(); return route('home'); }
        if (r.err === 'inactive') return bad('Tu acceso está inactivo. Escríbenos por WhatsApp 🙏');
        if (r.err === 'moved') return bad('Este código gratuito ya no funciona: al activar tu plan te enviamos un código nuevo a tu correo. Entra con ese.');
        if (r.err === 'trial_over') { b.disabled = false; return trialOver(v); }
        if (r.err === 'network' || r.err === 'offline') return bad('No hay conexión con la nube. Revisa tu internet e inténtalo de nuevo.');
        // 🔑 una sola entrada: clave de administración o código de profe
        b.disabled = true; b.textContent = 'Entrando…'; const w = await MRAC.call('who', { k: v }).catch(() => null); b.disabled = false; b.textContent = 'Entrar →';
        if (w && w.role === 'admin') { try { sessionStorage.setItem('mra_admin_key', v); localStorage.setItem('mra_last_role', JSON.stringify({ role: 'admin' })); } catch (e) { } location.href = 'administracion.html'; return; }
        if (w && w.role === 'family' && w.fcode) { try { sessionStorage.setItem('mra_fam_hi', '1'); localStorage.setItem('mra_fam', w.fcode); localStorage.setItem('mra_last_role', JSON.stringify({ role: 'family' })); } catch (e) { } location.href = 'familia.html'; return; } // 👨‍👩‍👧 código de familia → panel de papás
        if (w && w.role === 'teacher' && w.tcode) { try { sessionStorage.setItem('mra_tp_session', JSON.stringify({ tcode: w.tcode, pin: w.pin })); localStorage.setItem('mra_last_role', JSON.stringify({ role: 'teacher' })); } catch (e) { } location.href = 'profesores.html'; return; }
        return bad();
      }
      // 2) códigos guardados en config.js (modo sin nube / profes)
      const r = codeType(v); if (!r) return bad();
      const old = P.get() || {};
      P.save(Object.assign({ created: Date.now() }, old, { type: r.type, demo: !!r.demo, codeHash: M.codeHash(i.value), module: r.module || old.module || null, assignedBy: r.module ? 'admin' : (old.assignedBy || null) }));
      sfx('win'); M.confetti(1500); greetVoice(); route('home'); };
    $('#ok').onclick = go; i.onkeydown = e => { if (e.key === 'Enter') go(); };
  }
  function nameStep() {
    const s1 = (M.S && M.S.name) || ''; const p = P.get();
    app.innerHTML = `<div class="wrap pt-wrap"><div class="card pt-login"><div class="pt-hello">${M.mascot('pt-mra', 'smile')}<div class="bubble">Nice to meet you! 😊<small>¡Mucho gusto!</small></div></div>
      <h1>${p.first ? 'Completa tu perfil' : '¿Cómo te llamas?'}</h1><p class="muted">Así aparecerá tu nombre en tu perfil, tus reportes y tus certificados.</p>
      <label class="pt-lab">Nombre</label><input class="inp" id="f" value="${esc(s1.split(' ')[0] || '')}" autocomplete="given-name">
      <label class="pt-lab">Apellido</label><input class="inp" id="l" value="${esc(s1.split(' ').slice(1).join(' ') || p.last || '')}" autocomplete="family-name">
      ${p.type === 'staff' ? '' : `${p.type === 'student' && !p.demo ? `<label class="pt-lab">🎂 Fecha de nacimiento</label><input class="inp" id="bd" type="date" max="${P.todayISO()}" min="1930-01-01" value="${esc(p.birth || '')}">
      <small class="pt-hint">¡Queremos celebrar tu cumpleaños contigo! 🎉</small>` : ''}
      <label class="pt-lab">Correo electrónico</label><input class="inp" id="em" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@gmail.com" value="${esc(p.email || '')}">
      <small class="pt-hint">Aquí te llegan tus resultados, avisos de tus clases y tu saludo de cumpleaños.</small>`}
      <button class="btn k block lg" id="ok" style="margin-top:14px">Continuar →</button></div></div>`;
    if ($('#f').value === '' && p.first) $('#f').value = p.first;
    $('#ok').onclick = () => { const f = $('#f').value.trim(), l = $('#l').value.trim(); if (!f) return $('#f').classList.add('wrong'); if (!l) return $('#l').classList.add('wrong');
      const extra = {};
      if (p.type !== 'staff') { const bd = $('#bd') ? $('#bd').value : '', em = $('#em').value.trim();
        if ($('#bd') && (!bd || bd > P.todayISO() || bd < '1930-01-01')) { $('#bd').classList.add('wrong'); return M.toast('Escribe tu fecha de nacimiento 🎂'); }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $('#em').classList.add('wrong'); return M.toast('Escribe un correo válido 📧'); }
        if (bd) extra.birth = bd; extra.email = em; }
      P.save(Object.assign(p, { first: f, last: l, name: f + ' ' + l }, extra));
      if (window.MRAC && MRAC.code()) { MRAC.saveProfile(Object.assign({ first: f, last: l }, extra)); MRAC.sync(true); }
      // el nombre también se usa dentro de los módulos
      P.MODS.forEach(m => { try { const s = JSON.parse(localStorage.getItem(m.key) || 'null'); if (s) { s.name = f + ' ' + l; localStorage.setItem(m.key, JSON.stringify(s)); } } catch (e) { } });
      route('home'); };
  }
  // el acceso gratuito (3 días) terminó → invitación a inscribirse
  function trialOver(code, generic) {
    window.__buyCode = code || ''; // permite pagar desde aquí aunque el acceso gratuito haya terminado
    const PL = window.MRPLANS;
    M.modal(`<div class="center"><div class="to-ic">${MRI('gift')}</div><h3>${generic ? 'Elige tu plan' : 'Tu acceso gratuito terminó'}</h3><p>${generic ? 'Paga con tarjeta o transferencia y tu plan se habilita en tu perfil.' : 'Gracias por conocer <b>mrarrieta.com</b>. Tu progreso está guardado: <b>elige tu plan</b> y continúa justo donde lo dejaste.'}</p></div>
      ${PL ? PL.cards('free') : ''}
      ${PL && PL.payInfo ? PL.payInfo() : ''}`, { x: true });
    if (code && window.MRAC) MRAC.call('myCoupon', { code }).then(r => { if (!r || !r.pct) return; const m = [...document.querySelectorAll('.modal')].pop(); const h3 = m && m.querySelector('h3'); if (h3) h3.insertAdjacentHTML('afterend', `<p class="to-offer">🎁 <b>Solo hoy: ${r.pct}% de descuento</b> en tu primer mes. Se aplica solo al pagar (hasta las 11:59 p. m.).</p>`); }).catch(() => { }); // ⏱️ oferta de 24 h
  }
  function logout() {
    const m = M.modal(`<h3>¿Salir de tu perfil?</h3><p class="muted">Tu progreso queda guardado${window.MRAC && MRAC.code() ? ' en la nube: puedes continuar desde cualquier dispositivo' : ' en este dispositivo'}. Para volver a entrar necesitarás tu código.</p><div class="row"><button class="btn k" id="y">Sí, salir</button><button class="btn w" id="n">Cancelar</button></div>`, { x: true });
    $('#n', m).onclick = () => m.remove(); $('#y', m).onclick = async () => { const cur = P.get(); if (window.MRAC && MRAC.code()) { $('#y', m).disabled = true; $('#y', m).textContent = 'Guardando…'; const ok = await (MRAC.signOut ? MRAC.signOut() : MRAC.sync(true)); if (!ok) { $('#y', m).disabled = false; $('#y', m).textContent = 'Sí, salir'; M.toast('No se pudo guardar en la nube. Revisa tu internet e inténtalo de nuevo.'); return; } } m.remove(); if (cur && cur.first) P.save(cur); P.clear(); try { sessionStorage.removeItem('mra_me_cache'); } catch (e) { } route('home'); };
  }

  /* ---------- perfil ---------- */
  function home() {
    const p = P.get(); const a = P.assigned(); const staff = p.type === 'staff', trial = P.isTrial();
    const ini = ((p.first || '?')[0] + (p.last || '')[0]).toUpperCase();
    const pst = window.MRAPLACE ? MRAPLACE.status() : { attempts: 0, max: 2 };
    const pl = p.placement;
    const hr = new Date().getHours(); const back = P.isBack(); const greet = back ? 'Welcome back' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    const newbie = !p.module && !staff; // estudiante nuevo: solo la prueba de clasificación
    let main = '';
    if (!p.module && !staff) {
      main = `<div class="card pt-step"><div class="pt-stepn">1</div><div><span class="lbl">Primer paso</span><h2>Toma tu prueba de clasificación</h2>
        <p>Solo <b>10 minutos</b>. Se adapta a tu nivel y al terminar empiezas de una vez tu ruta de aprendizaje.</p>
        <p class="muted">⏱ Unos 10 minutos · ${pst.rounds || 1} oportunidades de 2 intentos${pst.attempts ? ` · Ya usaste ${pst.attempts}` : ''}${pst.inProgress ? ' · <b>Tienes una prueba en progreso</b>' : ''}</p>
        <button class="btn k lg" id="pt">📝 ${pst.inProgress ? 'Continuar' : 'Tomar'} mi prueba de clasificación</button></div><img class="pt-step-plane" src="mra-x-plane-red.webp" alt="Mr. Arrieta"></div>`;
    } else if (a && P.isExpired()) {
      main = `<div class="card pt-mymod"><div class="pt-mymod-img" style="background-image:url('${U(a.img)}')"><span>🔒</span></div><div><span class="lbl">⏰ Plan vencido</span>
        <h2>Tu contenido está bloqueado</h2><p>Tu plan venció el <b>${esc(new Date(P.plan().end + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }))}</b>. Tus módulos, juegos y clases quedan bloqueados hasta que renueves.</p>
        <p class="muted">Tranquilo: tu progreso está guardado. Paga con <b>tarjeta</b> y se desbloquea al instante, o por <b>transferencia</b> y se activa cuando confirmemos tu pago. Sigues justo donde ibas.</p>
        <a class="btn block pt-wa" href="#" data-plans>Renovar mi plan</a></div></div>`;
    } else if (a && a.ready && !staff) {
      const pr = P.progress(a.id), tot = trial ? 4 : a.classes;
      main = `<div class="card pt-mymod db-hero"><div class="db-hero-tx"><span class="lbl db-red">${pr.done ? 'Tu siguiente paso' : 'Empieza tu ruta'}</span>
        <h2><small class="pt-here">📍 Estás aquí</small>${esc(a.name)} · ${esc(a.es)}</h2>
        <p class="db-sub">${pr.done} de ${trial ? '4 clases de tu acceso gratuito' : tot + ' clases'} completadas${a.n > (p.module || 1) ? ' · ¡Avanzaste en tu ruta! 🎉' : ''}</p>
        <div class="db-bar"><i style="width:${pr.pct}%"></i></div>
        <div class="db-hero-b"><a class="btn db-wbtn lg" href="${a.url}">${MRI('video')} ${pr.done ? 'Continuar mi ruta' : 'Empezar mi ruta'}</a><button class="btn db-gbtn sm" id="pt3">¿No estás a gusto con tu nivel?</button></div></div>
        <img class="db-hero-mra db-plane" src="mra-x-plane-red.webp" alt="Mr. Arrieta"></div>`;
    } else if (a) {
      const ready = a && a.ready;
      main = `<div class="card pt-mymod">${a ? `<div class="pt-mymod-img" style="background-image:url('${U(a.img)}')"><span>${a.n}</span></div>` : ''}<div><span class="lbl">${staff ? 'Modo profe' : '🧭 Tu ruta de aprendizaje'}</span>
        <h2>${staff ? 'Todos los módulos abiertos para revisión' : `<small class="pt-here">📍 Estás aquí</small>${esc(a.name)} · ${esc(a.es)}`}</h2>
        ${a ? `<p class="muted">${pl && p.assignedBy !== 'admin' ? `Tu ruta se creó con tu prueba de clasificación (${new Date(pl.date).toLocaleDateString('es-CO')}).` : 'Tu ruta fue asignada por administración.'}${a.n > (p.module || 1) ? ' ¡Avanzaste en tu ruta al aprobar el módulo anterior! 🎉' : ''}</p>` : ''}
        ${a && ready ? `<div class="pt-bar"><i style="width:${P.progress(a.id).pct}%"></i></div><p class="muted" style="margin:4px 0 10px">${P.progress(a.id).done} de ${trial ? '4 clases de tu acceso gratuito' : a.classes + ' clases'} completadas</p><a class="btn k lg" href="${a.url}">▶ ${P.progress(a.id).done ? 'Continuar' : 'Empezar'} mi ruta</a>` : ''}
        ${a && !ready && trial && P.trialMod() ? `<p class="pt-soon">🚧 Tu ${esc(a.name)} se está terminando de construir. Mientras tanto, usa tu acceso gratuito con los 2 primeros temas del <b>${esc(P.trialMod().name)}</b>.</p><a class="btn k lg" href="${P.trialMod().url}">▶ Entrar con mi acceso gratuito</a>` : ''}
        ${a && !staff ? `<p style="margin:12px 0 0"><button class="btn w sm" id="pt3">🔁 ¿No estás a gusto con tu nivel?</button></p>` : ''}
        ${a && !ready && !trial ? `<p class="pt-soon">🚧 Tu ${esc(a.name)} se está terminando de construir. ¡Muy pronto estará listo! Mientras tanto puedes repasar los módulos anteriores.</p>` : ''}</div></div>`;
    }
    const kids = !staff && window.MRKIDS && MRKIDS.on(); document.body.classList.toggle('ag-kids', !!kids); // 🎈 perfil Kids (9 a 11 años)
    let kidsX = '';
    if (kids && a && a.ready && !P.isExpired()) { main = MRKIDS.hero(p, a, P.look().nick || p.first || '') + MRKIDS.words(); kidsX = MRKIDS.map(a) + MRKIDS.medals(a); }
    else if (kids && newbie) main = main.replace('mra-x-plane-red.webp', 'mra-x-balloon1.webp');
    const teens = !staff && !kids && window.MRTEENS && MRTEENS.on(); document.body.classList.toggle('ag-teens', !!teens); // 🚀 perfil Teens (12 a 17 años)
    if (teens && a && a.ready && !P.isExpired()) { main = MRTEENS.hero(p, a, P.look().nick || p.first || '') + `<div class="tn-row one">${MRTEENS.missions()}</div>` + (MRTEENS.realLife ? MRTEENS.realLife() : ''); }
    else if (teens && newbie) main = main.replace('mra-x-plane-red.webp', 'mra-x-rocket.webp');
    const curMod = a && a.ready && !staff ? P.progress(a.id) : null;
    const plNow = P.plan(); const plName = staff ? 'Profesor' : P.isExpired() ? 'Plan vencido' : (plNow.plan === 'premium8' && plNow.eff === 'premium' ? 'Premium · 8 clases' : { free: 'Acceso gratuito', membership: 'Plataforma', premium: 'Premium · 4 clases' }[plNow.eff] || 'Acceso gratuito');
    const plIc = staff ? 'user' : P.isExpired() ? 'clock' : plNow.plan === 'premium8' && plNow.eff === 'premium' ? 'gem' : ({ free: 'gift', membership: 'monitor', premium: 'crown' }[plNow.eff] || 'gift');
    const pct = curMod ? curMod.pct : 0;
    const side = `<aside class="db-side card">
        <div class="db-me"><button class="pt-avwrap" id="me-av" title="Personaliza tu foto">${P.avHTML('pt-av')}<i class="pt-pen">✏️</i></button>
          <div class="db-me-tx"><span class="db-greet">${greet}!</span><h2>${esc(P.look().nick || p.first)} ${esc(p.last || '')}</h2><span class="db-chip ${plNow.eff}">${MRI(plIc)} ${plName}</span>${!staff && window.MRGOAL ? MRGOAL.lineHTML() : ''}${plNow.end && plNow.paid && !P.isExpired() ? `<small class="muted">Activo hasta el ${fmtD(plNow.end, { day: 'numeric', month: 'long' })}</small>` : ''}</div></div>
        ${curMod ? `<div class="db-ring" style="--p:${pct}"><div><b>${pct}%</b><small>de tu módulo</small></div></div><small class="muted db-modtx">${esc(a.name)} · ${esc(a.lv || a.id)} · ${curMod.done} de ${trial ? 4 : a.classes} clases</small>${!staff && window.MRGOAL ? MRGOAL.cardHTML(pct) : ''}` : staff ? '' : `<div class="db-ring" style="--p:0"><div><b>0%</b><small>tu progreso</small></div></div><small class="muted db-modtx">Empieza con tu prueba de clasificación</small>`}
        <nav class="db-qa">${staff ? '' : `<button class="btn w" id="pt-plans">${MRI('crown')} Mi plan</button>`}${!staff && P.plan().premium ? `<button class="btn w" data-go="#pt-live">${MRI('calendar')} Mis clases</button>` : ''}${!staff && P.plan().premium ? `<button class="btn w pt-polb">${MRI('file')} Política de reservas</button>` : ''}<button class="btn w" id="me-go2">${MRI('user')} Personalizar perfil</button>${staff ? '' : `<button class="btn w" id="pt-pass">${MRI('unlock')} Cambiar mi código</button>`}<button class="btn w" id="pt-tour">${MRI('compass')} Ver el tour</button></nav></aside>`;
    const prem = !staff && P.plan().premium;
    const MENU = { // 📂 todo el perfil organizado en 3 grupos
      learn: ['💻', 'Mis módulos', [['route', 'ib', '🧭', 'Mi ruta de aprendizaje', 'Módulos, clases y progreso'], ['games', 'ib5', '🎮', 'Zona de juegos', 'Practica jugando'], ['notes', 'ib3', '✏️', 'Mis apuntes', 'Tu cuaderno personal'], ['place', 'ib2', '📝', 'Prueba de clasificación', 'Ubica tu nivel']]],
      cls: ['🧑‍🏫', 'Mis clases', [['book', 'ib', '📅', 'Reservar clase', 'Elige profe, día y hora'], ['next', 'ib2', '🗓️', 'Mis próximas clases', 'Enlace y cancelación'], ['extra', 'ib5', '➕', 'Comprar más clases', 'Se suman a tu saldo'], ['hist', 'ib6', '📚', 'Historial y tableros', 'Lo que vio cada profe'], ['claim', 'ib3', '🚩', '¿Mi profe no se conectó?', 'Repórtalo aquí'], ['chat', 'ib4', '💬', 'Chat con mi profe', 'Escríbele en vivo']]],
      me: ['👤', 'Mi cuenta', [].concat(staff ? [] : [['plan', 'ib', '👑', 'Mi plan', 'Planes y renovación']], [['perso', 'ib5', '🎨', 'Personalizar perfil', 'Tu foto o tu Mr. Arrieta']], staff ? [] : [['mail', 'ib4', '✉️', 'Mi correo', 'Donde te llegan los avisos']], staff ? [] : [['pass', 'ib3', '🔑', 'Cambiar mi código', 'Tu clave de acceso'], ['ref', 'ib4', '🎁', 'Invitar a un amigo', 'Gana clases o días']], (!staff && P.plan().paid ? [['agree', 'ib', '📄', 'Mi acuerdo', 'Leído y aceptado · copia PDF']] : []).concat([['pol', 'ib6', '📌', 'Política', 'Reservas y cancelaciones'], ['tour', 'ib2', '🧭', 'Ver el tour', 'Cómo funciona tu perfil']]))],
    };
    if (!prem) delete MENU.cls;
    if (newbie) MENU.learn[2] = MENU.learn[2].filter(x => x[0] === 'place' || x[0] === 'games').reverse(); // recién llegado: primero la prueba de clasificación
    const ddHTML = (k) => { const [ic, t, items] = MENU[k]; return `<div class="sd-dd" data-k="${k}"><button class="sd-ddb">${ic} ${t} <span class="car">▾</span></button><div class="sd-ddm">${items.map(([id, cl, i2, b, sm]) => `<button class="sd-mi" data-act="${id}"><i class="${cl}">${i2}</i><span><b>${b}</b><small>${sm}</small></span></button>`).join('')}</div></div>`; };
    app.innerHTML = `<div class="wrap db">${side}<div class="db-main">
      <div class="sd-dds">${Object.keys(MENU).map(ddHTML).join('')}</div>

      ${birthdayBanner()}
      <div id="pt-ann"></div>
      ${P.isExpired() || (trial && !(window.MRAC && MRAC.code())) ? `<div class="pt-trialbar">${P.isExpired() ? `⏰ <div><b>Tu plan venció.</b> Todo tu contenido está bloqueado, pero tu progreso sigue guardado. Apenas renueves, se desbloquea todo. <a href="#" class="tb-up">Ver planes →</a></div>` : `🟢 <div><b>Acceso gratuito:</b> la prueba de clasificación y los <b>2 primeros temas</b> de tu módulo. <a href="#" class="tb-up">Ver planes →</a></div>`}</div>` : ''}
      ${main}
      ${kidsX}
      ${newbie ? '' : `
      <div id="pt-live"></div><div id="pt-notes"></div><div id="pt-ref"></div>
      <div class="sect-title"><h2>🧭 Mi ruta de aprendizaje</h2></div>
      ${routeBar()}
      <div class="pt-mods-grid pt-route">${P.MODS.map(m => modCard(m)).join('')}</div>
      ${courseCard()}
      ${birthAsk()}
      ${P.look().pic || !(a && a.ready && P.progress(a.id).done) ? '' : `<div class="card pt-perso"><div class="pt-perso-img">${M.mascot('', 'wink')}</div><div><h2>Personaliza tu perfil</h2><p class="muted">Tómate una foto o crea <b>tu propio Mr. Arrieta</b>: vístelo, ponle sombrero y elige su fondo. ¡Haz tu plataforma más tuya!</p><button class="btn k" id="me-go">🎨 Personalizar ahora</button></div></div>`}
      ${pl ? `<div class="sect-title"><h2>📝 Mi prueba de clasificación</h2></div><div class="card pt-plres"><div><b>Resultado:</b> ${esc(P.mod(pl.module).name)} · ${esc(P.mod(pl.module).es)}<br><span class="muted">${new Date(pl.date).toLocaleDateString('es-CO')}${pl.mods ? ' · ' + [1, 2, 3, 4].map(k => `${P.mod(k).id}: ${pl.mods[k]}%`).join(' · ') : ''}</span></div>${!P.isExpired() && (pst.attempts < pst.max || (pst.round || 1) < (pst.rounds || 1)) ? '<button class="btn w sm" id="pt2">🔁 Repetir prueba</button>' : ''}</div>` : ''}
      ${staff ? `<div class="sect-title"><h2>📝 Prueba de clasificación</h2></div><div class="card pt-plres"><div>Puedes presentar o revisar la prueba de clasificación como lo verá el estudiante.</div><button class="btn w sm" id="pt2">📝 Abrir prueba</button></div>` : ''}
      ${certs()}`}
      </div>
      <p class="center fx-foot db-foot" style="margin-top:22px;font-size:13.5px;font-weight:600">¡Aprende inglés HABLANDO!<br><a class="foot-wa" href="https://wa.me/${esc(C.WHATSAPP)}?text=${encodeURIComponent((window.MRNE || String)('¡Hola, mrarrieta.com! Soy ' + ((p.first || '') + ' ' + (p.last || '')).trim() + '. Tengo una pregunta.'))}" target="_blank" rel="noopener">WhatsApp ${esc(C.WHATSAPP.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'))}</a></p></div>
      <nav class="db-tabbar sd-tab"><button class="on" data-st="top">${MRI('compass')}<span>Inicio</span></button>${Object.keys(MENU).map((k) => `<button data-st="${k}"><b class="sd-ti">${MENU[k][0]}</b><span>${k === 'cls' ? 'Clases' : k === 'me' ? 'Cuenta' : 'Módulos'}</span></button>`).join('')}</nav>`;
    if (kids) MRKIDS.wire(app);
    if (teens) MRTEENS.wire(app);
    agChange();
    if ($('#pt')) $('#pt').onclick = () => route('placement');
    if (!staff && window.MRGOAL) { // 🎯 objetivo personal: elegir o cambiar
      const gw = () => $$('[data-goal]').forEach(b => b.onclick = () => MRGOAL.ask({ noSkip: true }).then(g => { if (g) home(); }));
      gw(); if (MRGOAL.shouldAsk()) setTimeout(() => { if (!document.querySelector('.modal')) MRGOAL.ask().then(g => { if (g) home(); }); }, 900);
    }
    const plans = (e) => { if (e) e.preventDefault(); M.modal(`<div class="pt-plmodal">${planSection()}</div>`, { x: true }); };
    $$('.tb-up').forEach(x => x.onclick = plans); if ($('#pt-tour')) $('#pt-tour').onclick = () => { window.scrollTo(0, 0); portalTour(true); }; if ($('#pt-plans')) $('#pt-plans').onclick = plans;
    wireBirth(); live(); birthdayParty();
    const goTo = (sel) => { const el = $(sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    $$('[data-go]').forEach(b => b.onclick = () => goTo(b.dataset.go));
    if ($('#me-go2')) $('#me-go2').onclick = () => route('me');
    // 📂 acciones de los menús (PC: desplegables · celular: panel que sube desde abajo)
    const act = (id) => { closeAll();
      const open = (sel, click) => { const el = $(sel); if (!el) return M.toast('Esta sección aún no está disponible.'); sdShow(el); if (el.tagName === 'DETAILS') el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (click) setTimeout(() => { const c = $(click); c && c.click(); }, 450); };
      ({ route: () => open('.pt-routebar') || open('.pt-route'), games: () => { location.href = 'juegos.html'; }, notes: () => open('#pt-notes'), place: () => route('placement'),
        book: () => { const c = $('#lv-book'); if (c && !c.disabled) c.click(); else open('.lv-vip'); }, next: () => open('.lv-next'), extra: () => { const x = $('#lv-extra'); if (x) x.click(); else open('.lv-vip'); }, hist: () => open('.lv-hist'), claim: () => open('.lv-claim'), chat: () => { const c = $('#lv-msg'); if (c) c.click(); else open('#pt-live'); },
        plan: () => plans(), perso: () => route('me'), pass: () => { const b = $('#pt-pass'); b ? b.click() : null; }, ref: () => open('#pt-ref'), pol: () => window.MRPOLICY && MRPOLICY.show(), agree: () => window.MRAGREE && MRAGREE.open(), mail: () => mailEdit(), tour: () => { window.scrollTo(0, 0); portalTour(true); } }[id] || (() => { }))(); };
    const closeAll = () => { $$('.sd-dd').forEach(d => d.classList.remove('open')); const sh = $('.sd-sheet'); if (sh) sh.remove(); };
    $$('.sd-dd').forEach(d => { d.querySelector('.sd-ddb').onclick = (e) => { e.stopPropagation(); const o = d.classList.contains('open'); closeAll(); if (!o) d.classList.add('open'); }; });
    $$('.sd-mi').forEach(b => b.onclick = () => act(b.dataset.act));
    if (!window.__sddd) { window.__sddd = 1; document.addEventListener('click', (e) => { if (!e.target.closest('.sd-dd')) $$('.sd-dd').forEach(d => d.classList.remove('open')); }); }
    $$('.sd-tab button').forEach(b => b.onclick = () => { $$('.sd-tab button').forEach(x => x.classList.toggle('on', x === b)); const k = b.dataset.st; closeAll();
      if (k === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
      const [ic, t, items] = MENU[k]; const sh = document.createElement('div'); sh.className = 'sd-sheet';
      sh.innerHTML = `<div class="sd-dim"></div><div class="sd-pan"><div class="sd-grab"></div><b class="sd-pt">${ic} ${t}</b>${items.map(([id, cl, i2, bb, sm]) => `<button class="sd-mi" data-act="${id}"><i class="${cl}">${i2}</i><span><b>${bb}</b><small>${sm}</small></span></button>`).join('')}</div>`;
      document.body.appendChild(sh); sh.querySelector('.sd-dim').onclick = closeAll; sh.querySelectorAll('.sd-mi').forEach(x => x.onclick = () => act(x.dataset.act)); });
    $$('.pt-polb').forEach(x => x.onclick = () => window.MRPOLICY && MRPOLICY.show());
    setTimeout(policyFirst, 400);
    // bienvenida de regreso (una vez por sesión)
    try { if (P.isBirthday()) sessionStorage.setItem('mra_wb', '1'); // en su cumpleaños el saludo es la fiesta 🎂
      if (back && !sessionStorage.getItem('mra_wb')) { sessionStorage.setItem('mra_wb', '1'); const pr = a && a.ready ? P.progress(a.id) : null;
      const wm = M.modal(`<div class="center wb">${P.pic() ? P.avHTML('pt-av big') : M.mascot('mascot bounce', 'wink')}<h2>Welcome, ${esc(P.look().nick || p.first)}! 👋</h2><p style="font-size:17px">¡Qué bueno verte de nuevo! ${P.isExpired() ? '' : pr && pr.done ? `Llevas <b>${pr.done} clase(s)</b> en tu ruta. ¡Sigamos!` : 'Hoy es un gran día para avanzar en tu ruta de aprendizaje.'}</p>
        ${P.isExpired() ? `<p style="font-size:16px">⏰ Tu plan venció y tu contenido está bloqueado. Renuévalo para seguir justo donde ibas.</p><a class="btn block lg pt-wa" href="#" data-plans>Renovar mi plan</a>` : a && a.ready && !staff ? `<a class="btn k block lg" style="text-decoration:none" href="${a.url}">▶ Continuar mi ruta</a>` : ''}<button class="btn w block" id="wbx" style="margin-top:8px">Ir a mi perfil</button></div>`, { x: true });
      $('#wbx', wm).onclick = () => wm.remove(); M.confetti && M.confetti(900); } } catch (e) { }
    if (!tourSeenK(tourKind())) setTimeout(portalTour, 900);
    $('#me-av').onclick = () => route('me'); if ($('#me-go')) $('#me-go').onclick = () => route('me');
    const retake = () => { if (staff) return route('placement'); const m = M.modal(`<h3>¿No estás a gusto con tu nivel?</h3><p>Si gustas, puedes <b>volver a tomar la prueba de clasificación</b>. Tu ruta de aprendizaje se actualizará con el nuevo resultado.</p><p class="muted">Tienes ${pst.rounds || 1} oportunidades de 2 intentos cada una. Llevas ${pst.attempts} intento(s)${pst.attempts >= pst.max && (pst.round || 1) < (pst.rounds || 1) ? ' — se activará tu <b>segunda oportunidad</b>' : ''}.</p><div class="row"><button class="btn k" id="y">Sí, repetir</button><button class="btn w" id="n">Cancelar</button></div>`, { x: true }); $('#n', m).onclick = () => m.remove(); $('#y', m).onclick = () => { m.remove(); route('placement'); }; };
    ['#pt2', '#pt3'].forEach(id => { if ($(id)) $(id).onclick = retake; });
    $$('.pt-mod').forEach(el => el.onclick = () => openMod(el.dataset.id));
  }
  function routeBar() {
    const fin = courseOpen(), fdone = !!(courseState().final && courseState().final.passed);
    return `<div class="pt-routebar">${P.MODS.map((m, i) => { const r = P.role(m.id); return `${i ? `<i class="ln ${r === 'locked' || r === 'soon' ? '' : 'on'}"></i>` : ''}<div class="st ${r}${P.passed(m.id) ? ' ok' : ''}"><b>${P.passed(m.id) ? '✓' : r === 'current' ? '📍' : m.n}</b><small>${esc(m.lv || m.id)}</small></div>`; }).join('')}<i class="ln ${fin ? 'on' : ''}"></i><div class="st fin ${fdone ? 'ok' : fin ? 'current' : 'locked'}"><b>${fdone ? '🎓' : '🏆'}</b><small>Final</small></div></div>`;
  }
  function modCard(m) {
    const r = P.role(m.id); const pr = P.progress(m.id); const trial = P.isTrial();
    const chip = { current: '📍 ESTÁS AQUÍ', review: P.passed(m.id) ? '✅ SUPERADO' : '🔁 REPASO', locked: P.isExpired() ? '🔒 BLOQUEADO' : '🔒 PRÓXIMA ETAPA', soon: '🚧 PRÓXIMAMENTE' }[r];
    const showBar = (r === 'current' || r === 'review') && m.ready;
    return `<button class="pt-mod ${r}" data-id="${m.id}"><div class="pt-mod-img" style="background-image:url('${U(m.img, 640, 360)}')"><span class="pt-mod-n">${m.n}</span><span class="pt-chip ${r}">${chip}</span></div>
      <div class="pt-mod-bd"><h3>${esc(m.name)} · ${esc(m.lv || m.id)}</h3><div class="es">${esc(m.es)}</div><p>${esc(m.desc)}</p>
      ${showBar ? `<div class="pt-bar"><i style="width:${pr.pct}%"></i></div><small class="muted">${pr.done} de ${r === 'current' && trial ? 4 : m.classes} clases${P.passed(m.id) ? ' · 🎓 Aprobado' : ''}</small>` : ''}
      ${r === 'locked' ? `<small class="muted">${P.isExpired() ? '🔒 Se abre al renovar tu plan' : trial ? 'Disponible con Plataforma o Premium' : 'Se abre cuando avances en tu ruta'}</small>` : ''}</div></button>`;
  }
  function openMod(id) {
    const m = P.mod(id), r = P.role(id), a = P.assigned();
    if (r === 'current' || r === 'review') { location.href = m.url; return; }
    if (P.isExpired()) { const mm = M.modal(`<div class="center">${M.mascot('mascot', 'pointside')}</div><h3 class="center">⏰ Tu plan venció</h3><p class="center" style="font-size:17px">Todo tu contenido está bloqueado hasta que renueves. Tu progreso está guardado y se desbloquea apenas administración confirme tu renovación.</p><a class="btn block pt-wa" href="#" data-plans>Renovar mi plan</a>`, { x: true }); return; }
    if (r === 'soon') return M.modal(`<div class="center">${M.mascot('mascot', 'think')}</div><h3 class="center">🚧 ${esc(m.name)} · ${esc(m.es)}</h3><p class="center">Este módulo está en construcción. ¡Muy pronto estará disponible en tu perfil!</p>`, { x: true });
    if (P.isTrial() && window.MRPLANS && a) return MRPLANS.modal(M);
    const msg = P.isTrial() ? `Tu acceso gratuito incluye solo el inicio de tu ruta. ¡Inscríbete para estudiar todos los módulos!`
      : !a ? 'Primero toma tu prueba de clasificación para saber en qué módulo empiezas.'
      : `Para abrir el ${m.name} primero debes <b>terminar y aprobar el examen final del ${esc(a.name)}</b>. ¡Paso a paso! 💪`;
    const mm = M.modal(`<div class="center">${M.mascot('mascot', 'pointside')}</div><h3 class="center">🔒 ${esc(m.name)} bloqueado</h3><p class="center" style="font-size:17px">${msg}</p>
      ${P.isTrial() ? `<a class="btn block pt-wa" href="#" data-plans>Quiero inscribirme</a>` : '<button class="btn k block" id="cl">Entendido</button>'}`, { x: true });
    if ($('#cl', mm)) $('#cl', mm).onclick = () => mm.remove();
  }
  const courseState = () => { try { return JSON.parse(localStorage.getItem('mra_final_progress_v1') || '{}'); } catch (e) { return {}; } };
  const courseOpen = () => { const p = P.get(); return !!p && !P.isExpired() && (p.type === 'staff' || p.demo || ['A1', 'A2', 'B2', 'B2+'].every(id => P.passed(id))); };
  function courseCard() {
    const p = P.get(); if (!p || P.isTrial()) return '';
    const open = courseOpen(), st = courseState(), passed = !!(st.final && st.final.passed);
    const n = ['A1', 'A2', 'B2', 'B2+'].filter(id => P.passed(id)).length;
    return `<a class="card pt-course ${open ? 'open' : ''} ${passed ? 'done' : ''}" href="examen-final.html${passed ? '#cert' : ''}"><div class="pt-course-ic">🏆</div><div><span class="lbl">Meta final de tu ruta</span><h3>Examen final del curso</h3>
      <p class="muted">${passed ? '🎓 ¡Aprobado! Ver mi certificado de ruta completa' : open ? '32 preguntas · 4 habilidades · 40 minutos · 2 intentos · certificado de toda tu ruta' : `🔒 Se habilita al aprobar los 4 módulos (${n} de 4 aprobados)`}</p></div><b class="pt-course-go">${passed ? '🎓' : open ? '▶' : '🔒'}</b></a>`;
  }
  function certs() {
    const cs = courseState(); const course = cs.final && cs.final.passed ? `<a class="card pt-cert gold" href="examen-final.html#cert">🏆 <div><b>Ruta completa A1 → B2+</b><small>Examen final del curso · ${Number(cs.final.score || 0).toFixed(1)}/10 · Ver y descargar</small></div></a>` : '';
    const done = P.MODS.filter(m => m.ready && P.passed(m.id)); if (!done.length && !course) return '';
    return `<div class="sect-title"><h2>🎓 Mis certificados</h2></div><div class="pt-certs">${course}${done.map(m => `<a class="card pt-cert" href="${m.url}#cert">🎓 <div><b>${esc(m.name)} · ${esc(m.level)}</b><small>Nota: ${(P.modState(m.id).final.score || 0).toFixed ? Number(P.modState(m.id).final.score).toFixed(1) : ''}/10 · Ver y descargar</small></div></a>`).join('')}</div>`;
  }
  /* ---------- tour guiado del perfil (primera vez de cualquier estudiante) ---------- */
  // el tour sale solo UNA vez por código (queda marcado en este dispositivo y en la nube)
  const TOURK = () => { const p = P.get() || {}; return 'mra_tourseen_' + ((window.MRAC && MRAC.code && MRAC.code()) || p.codeHash || p.first || 'x'); };
  function tourSeen() { try { return !!localStorage.getItem(TOURK()); } catch (e) { return false; } }
  // 2 tours, cada uno UNA sola vez: 'start' (recién llega: prueba, acceso gratuito, planes) y 'profile' (ya tiene su ruta)
  const tourKind = () => { const p = P.get() || {}; return !p.module && p.type !== 'staff' ? 'start' : 'profile'; };
  function tourSeenK(kind) { const p = P.get() || {}; if (p.tourDone) return true; /* tour antiguo: ya lo vio */ if (kind === 'start' ? p.tour1 : p.tour2) return true; try { return !!localStorage.getItem(TOURK() + '_' + kind); } catch (e) { return false; } }
  // 📌 política: emergente la PRIMERA vez que un estudiante pago entra (una sola vez, guardada en la nube)
  function polPending() { const p = P.get() || {}; return !!window.MRPOLICY && p.type !== 'staff' && P.plan().eff === 'premium' && !p.pol1; }
  function policyFirst() {
    if (!polPending() || $('.pol-modal')) return; if ($('.modal')) return setTimeout(policyFirst, 800);
    MRPOLICY.show({ first: true, onClose: () => { const p = P.get(); if (p && !p.pol1) { p.pol1 = Date.now(); P.save(p); try { window.MRAC && MRAC.code() && MRAC.sync(true); } catch (e) { } } } });
  }
  // ✉️ el estudiante corrige su correo (si rebotó o si se equivocó al escribirlo)
  async function mailEdit(cur) {
    if (cur === undefined) { const me = await MRAC.me().catch(() => null); cur = (me && me.mail && me.mail.email) || (P.get() || {}).email || ''; }
    const m = M.modal(`<h3>✉️ Mi correo</h3><p class="muted">Aquí te enviamos los avisos de tus clases, pagos y tu acuerdo.</p><input class="inp" id="me-mail" type="email" value="${esc(cur || '')}" placeholder="tucorreo@ejemplo.com" style="width:100%;box-sizing:border-box"><button class="btn k block" id="me-ms" style="margin-top:12px">Guardar mi correo</button>`, { x: true });
    $('#me-ms', m).onclick = async () => { const v = $('#me-mail', m).value.trim(); const sg = window.MRMAILFIX && MRMAILFIX.suggest(v); if (sg) { $('#me-mail', m).dispatchEvent(new Event('blur')); M.toast('Revisa tu correo: ¿quisiste decir ' + sg + '?'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return M.toast('Escribe un correo válido');
      const b = $('#me-ms', m); b.disabled = true; const x = await MRAC.call('myEmail', { code: MRAC.code(), email: v }).catch(() => null);
      if (x && x.ok) { m.remove(); const p = P.get(); if (p) { p.email = x.email; P.save(p); } const bn = $('.pt-mailbad'); if (bn) bn.remove(); M.toast('✅ Correo actualizado. Te enviamos un mensaje de confirmación.'); } else { b.disabled = false; M.toast('No se pudo guardar. Revisa el correo.'); } };
  }
  function portalTour(force) {
    if (document.querySelector(".ag-modal.need")) { setTimeout(() => portalTour(force), 1000); return; } // primero el acuerdo, después el tour
    const kind = tourKind();
    if ($('#tour')) return; const p = P.get(); if (!p || (tourSeenK(kind) && !force)) return;
    if ($('.modal') || (!force && polPending())) return setTimeout(() => portalTour(force), 800); // espera a que cierre el saludo y la política
    try { localStorage.setItem(TOURK() + '_' + kind, '1'); } catch (e) { } const fk = kind === 'start' ? 'tour1' : 'tour2';
    if (!p[fk]) { p[fk] = true; P.save(p); try { window.MRAC && MRAC.code() && MRAC.sync(true); } catch (e) { } } // marcado desde que empieza
    const fn = esc(P.look().nick || p.first || ''); const a = P.assigned(); const pl = P.plan();
    const all = kind === 'start' ? [
      { mood: 'welcome', t: `¡Welcome, ${fn}! 👋`, d: 'Soy Mr. Arrieta, tu profe. Te muestro en 30 segundos cómo empezar en <b>mrarrieta.com</b>.' },
      { sel: '.pt-step', mood: 'idea', t: '1️⃣ Tu primer paso', d: 'Haz tu <b>prueba de clasificación</b>: solo 10 minutos. Se adapta a tu nivel y evalúa tu Listening, Reading, Writing y Speaking. Al terminar, la plataforma te ubica en tu módulo y <b>empiezas tu ruta de inmediato</b>.' },
      { sel: '.pt-trial, .pt-trialbar', mood: 'present', t: '🎁 Tu acceso gratuito', d: 'Tienes la prueba de clasificación y los <b>2 primeros temas</b> de tu módulo para que conozcas la plataforma.' },
      { sel: '#pt-plans', mood: 'pointside', t: '💳 Los planes', d: '<b>Plataforma</b>: toda la plataforma y tu ruta completa A1 → B2+.<br><b>Premium</b>: además, <b>4 u 8 clases individuales</b> al mes con profes. Toca aquí cuando quieras verlos.' },
      { sel: '.pt-avwrap', mood: 'point', t: '😎 Tu perfil', d: 'Toca tu foto para personalizarlo: tómate una foto o crea <b>tu propio Mr. Arrieta</b>.' },
      { sel: '#pt-tour', mood: 'wink', t: '🧭 ¿Lo quieres ver otra vez?', d: 'Con este botón puedes repetir este recorrido cuando quieras.' },
      { mood: 'thumbs', t: '¡Vamos! 🚀', d: 'Empieza ahora con tu prueba de clasificación.', last: true },
    ] : [
      { mood: 'welcome', t: `¡Muy bien, ${fn}! 🎉`, d: 'Ya tienes tu ruta de aprendizaje. Te muestro tu perfil en 1 minuto.' },
      { sel: '.pt-mymod', mood: 'pointside', t: '📍 Tu ruta', d: 'Aquí ves <b>en qué módulo estás</b>, tu avance y el botón para <b>continuar tu clase</b>.' },
      { sel: '.lv-wrap', mood: 'present', t: '👩‍🏫 Clases con profes', d: 'Reserva tus <b>clases individuales</b> desde mañana y hasta 5 días adelante, nunca para el mismo día. Cancela sin penalización hasta 12 horas antes.' },
      { sel: '.pt-routebar', mood: 'present', t: '🧭 Tu camino', d: 'Tu ruta va de A1 a B2+. Cada módulo se abre cuando <b>apruebas el examen final</b> del anterior.' },
      { sel: '#pt-plans', mood: 'idea', t: '💳 Tu plan', d: pl.premium ? 'Tienes <b>Premium</b>: toda la plataforma + clases individuales con profes.' : pl.paid ? 'Tienes <b>Plataforma</b>: toda la plataforma. Si quieres clases con profes, pásate a Premium.' : 'Aquí ves los planes para <b>desbloquear toda tu ruta</b>.' },
      { sel: '#out', mood: 'watch', t: '⏻ Salir', d: 'Con este botón cierras tu sesión. Tu progreso queda guardado en la nube.' },
      { mood: 'thumbs', t: '¡Listo! 🚀', d: '¡Vamos a tu ruta de aprendizaje!', last: true },
    ];
    const steps = all.filter(x => !x.sel || $(x.sel));
    const ov = h(`<div id="tour"><div class="tour-hole"></div><div class="tour-card"></div></div>`); document.body.appendChild(ov);
    const hole = $('.tour-hole', ov), card = $('.tour-card', ov); let i = 0;
    const end = (go) => { ov.remove(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place); const q = P.get();
      if (go) { M.confetti && M.confetti(1500); if (!q.module && q.type !== 'staff') route('placement'); else if (a && a.ready) location.href = a.url; } };
    function place() {
      const st = steps[i]; const el = st.sel && $(st.sel);
      if (!el) { hole.style.cssText = 'left:50%;top:40%;width:0;height:0'; card.classList.add('center'); card.style.cssText = ''; return; }
      card.classList.remove('center'); const r = el.getBoundingClientRect(), pad = 8;
      hole.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
      const cw = Math.min(380, innerWidth - 24); const ch = card.offsetHeight || 220;
      let top = r.bottom + 16; if (top + ch > innerHeight - 10) top = Math.max(10, r.top - ch - 16);
      const left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), innerWidth - cw - 12);
      card.style.cssText = `left:${left}px;top:${top}px;width:${cw}px`;
    }
    function show() {
      const st = steps[i]; const el = st.sel && $(st.sel);
      card.innerHTML = `<div class="tour-in">${M.mascot('tour-mra', st.mood)}<div><div class="tour-n">${i + 1} / ${steps.length}</div><h3>${st.t}</h3><p>${st.d}</p></div></div>
        <div class="tour-bar"><button class="btn w sm" id="tskip">${st.last ? 'Cerrar' : 'Saltar tour'}</button><div class="grow"></div>${i ? '<button class="btn w sm" id="tprev">←</button>' : ''}<button class="btn k" id="tnext">${st.last ? (p.module || p.type === 'staff' ? '¡Vamos! →' : '📝 Tomar mi examen →') : 'Siguiente →'}</button></div>`;
      $('#tskip', card).onclick = () => end(false);
      if (i) $('#tprev', card).onclick = () => { i--; show(); };
      $('#tnext', card).onclick = () => { if (st.last) end(true); else { i++; show(); } };
      if (el) { el.scrollIntoView({ block: 'center' }); setTimeout(place, 80); } else place();
      sfx('tap');
    }
    window.addEventListener('resize', place); window.addEventListener('scroll', place, { passive: true });
    show();
  }
  /* ---------- personalización del perfil ---------- */
  const EN = { '': 'Original', '#E3242B': 'Red', '#0B2A5B': 'Navy blue', '#f2f2f2': 'White', '#FFC21A': 'Yellow', '#2E9E5B': 'Green', '#3AA0E8': 'Light blue', '#7B4BC4': 'Purple', '#F07AB0': 'Pink', '#8A8F98': 'Gray', '#8a8f98': 'Gray', '#F27A1A': 'Orange',
    '#2a2a2a': 'Black', '#222222': 'Black', '#c8a97a': 'Khaki', '#ececec': 'White', '#6b4a2e': 'Brown' };
  const POSE_EN = { welcome: 'Welcome!', smile: 'Smile', thumbs: 'Thumbs up', celebrate: 'Celebrate', wink: 'Wink', wow: 'Wow!', idea: 'Idea', point: 'Number one', pointside: 'Look!', present: 'Present', shrug: 'I don\'t know', think: 'Think', watch: 'Time!' };
  const HAT_EN = { none: ['🚫', 'No hat'], cap: ['🧢', 'Cap'], grad: ['🎓', 'Graduation cap'], beanie: ['🧶', 'Beanie'], cowboy: ['🤠', 'Cowboy hat'], crown: ['👑', 'Crown'], party: ['🥳', 'Party hat'], tophat: ['🎩', 'Top hat'], chef: ['👨‍🍳', 'Chef\'s hat'], helmet: ['⛑️', 'Hard hat'] };
  const BG_EN = { red: 'Red', navy: 'Navy', yellow: 'Yellow', sky: 'Sky blue', green: 'Green', purple: 'Purple', pink: 'Pink', white: 'White', usa: 'USA' };
  const BANNERS = [['w', 'White', '#fff'], ['red', 'Red', '#E3242B'], ['navy', 'Navy', '#0B2A5B'], ['yellow', 'Yellow', '#FFC21A'], ['green', 'Green', '#2E9E5B'], ['sky', 'Sky blue', '#3AA0E8'], ['purple', 'Purple', '#7B4BC4']];
  function squareJPEG(src, size = 320) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size; const ctx = cv.getContext('2d');
    const w = src.videoWidth || src.naturalWidth || src.width, hh = src.videoHeight || src.naturalHeight || src.height, m = Math.min(w, hh);
    ctx.drawImage(src, (w - m) / 2, (hh - m) / 2, m, m, 0, 0, size, size); return cv.toDataURL('image/jpeg', .85);
  }
  function personalize(tab) {
    const p = P.get(); const L = P.look(); let av = Object.assign(MRAV.def(), L.av || {});
    app.innerHTML = `<div class="wrap me-wrap">
      <div class="me-top"><button class="btn w sm" id="back">← Mi perfil</button><div><h1>🎨 Personaliza tu perfil</h1><p class="muted">Customize your profile · Haz tu plataforma más tuya</p></div></div>
      <div class="me-tabs"><button data-t="av">🧑‍🏫 Mi Mr. Arrieta</button><button data-t="photo">📸 Mi foto</button><button data-t="plat">✨ Mi plataforma</button></div>
      <div id="me-body"></div></div>`;
    $('#back').onclick = () => route('home');
    $$('.me-tabs button').forEach(b => b.onclick = () => show(b.dataset.t));
    const done = (msg) => { sfx('win'); M.toast(msg); topbar(); };
    function show(t) {
      $$('.me-tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
      const body = $('#me-body'); const L = P.look();
      if (t === 'photo') {
        body.innerHTML = `<div class="card me-photo"><div class="me-ph">${L.photo ? `<img src="${L.photo}" alt="">` : `<span>${esc(P.initials())}</span>`}</div>
          <h2>My photo · Mi foto</h2><p class="muted">Tómate una selfie o sube una foto. Se recorta en círculo y se guarda solo en tu perfil.</p>
          <div class="me-btns"><button class="btn k" id="cam">📸 Tomar foto</button><button class="btn w" id="up">🖼️ Subir foto</button>${L.photo ? '<button class="btn w" id="rm">🗑️ Quitar</button>' : ''}</div>
          ${L.photo ? `<label class="me-chk"><input type="checkbox" id="usep" ${L.pic === 'photo' ? 'checked' : ''}><span>Usar mi foto como foto de perfil</span></label>` : ''}
          <input type="file" id="fi" accept="image/*" hidden><input type="file" id="fc" accept="image/*" capture="user" hidden></div>`;
        const setPhoto = (u) => { P.setLook({ photo: u, pic: 'photo' }); done('¡Foto guardada! 📸'); show('photo'); };
        const fromFile = (f) => { if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => setPhoto(squareJPEG(im)); im.src = r.result; }; r.readAsDataURL(f); };
        $('#fi').onchange = e => fromFile(e.target.files[0]); $('#fc').onchange = e => fromFile(e.target.files[0]);
        $('#up').onclick = () => $('#fi').click();
        $('#cam').onclick = async () => {
          if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return $('#fc').click();
          let st; try { st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 640 }, audio: false }); } catch (e) { return $('#fc').click(); }
          const m = M.modal(`<h3 class="center">📸 Say cheese! · ¡Sonríe!</h3><div class="me-cam"><video autoplay playsinline muted></video><i class="me-ring"></i></div><div class="row"><button class="btn k" id="snap">📸 Tomar foto</button><button class="btn w" id="cx">Cancelar</button></div>`, { x: true });
          const v = $('video', m); v.srcObject = st; const stop = () => st.getTracks().forEach(t => t.stop());
          const close = () => { stop(); m.remove(); }; $('#cx', m).onclick = close; const mx = $('.mx', m); if (mx) mx.addEventListener('click', stop);
          $('#snap', m).onclick = () => { const cv = document.createElement('canvas'); cv.width = v.videoWidth; cv.height = v.videoHeight; const c = cv.getContext('2d'); c.translate(cv.width, 0); c.scale(-1, 1); c.drawImage(v, 0, 0); close(); setPhoto(squareJPEG(cv)); };
        };
        if ($('#rm')) $('#rm').onclick = () => { P.setLook({ photo: '', pic: L.pic === 'photo' ? (L.head ? 'avatar' : '') : L.pic }); done('Foto eliminada'); show('photo'); };
        if ($('#usep')) $('#usep').onchange = e => { P.setLook({ pic: e.target.checked ? 'photo' : (L.head ? 'avatar' : '') }); done(e.target.checked ? 'Tu foto es tu foto de perfil ✅' : 'Listo'); };
      } else if (t === 'av') {
        const cur = (k) => { const v = av[k]; if (k === 'pose') return POSE_EN[v]; if (k === 'hat') return HAT_EN[v].join(' '); if (k === 'bg') return BG_EN[v]; if (k === 'sticker') return v || '—'; const L2 = { shirt: MRAV.SHIRTS, pants: MRAV.PANTS, shoes: MRAV.SHOES }[k]; const it = L2.find(x => x[0] === v) || L2[0]; return `<i class="me-dot" style="background:${it[2]}"></i>${EN[v] || it[1]}`; };
        const acc = (k, t, inner, open) => `<details class="card me-acc" data-sec="${k}" ${open ? 'open' : ''}><summary><span>${t}</span><em class="me-cur" data-cur="${k}">${cur(k)}</em><b class="me-chev">▾</b></summary><div class="me-accb">${inner}</div></details>`;
        const sw = (k, list) => list.map(([hx, es, col]) => `<button class="me-sw${av[k] === hx ? ' on' : ''}" data-k="${k}" data-v="${hx}" title="${es}"><i style="background:${col}"></i><small>${EN[hx] || es}</small></button>`).join('');
        body.innerHTML = `<div class="me-av">
          <div class="me-prev card"><div class="me-stage" id="stage"><img id="pv" alt="Mi Mr. Arrieta"><b class="me-stk" id="stk"></b></div>
            <button class="btn w block" id="rnd">🎲 Surprise me!<span class="me-lg"> · Sorpréndeme</span></button>
            <button class="btn k block lg" id="sv">✅ Guardar<span class="me-lg"> mi Mr. Arrieta</span></button>
            <label class="me-chk"><input type="checkbox" id="guide" ${L.guide ? 'checked' : ''}><span>Que <b>mi Mr. Arrieta</b> me acompañe en todas mis clases</span></label></div>
          <div class="me-opts">
            ${acc('pose', '👤 Pose · Postura', `<div class="me-poses" data-noguide>${MRAV.POSES.map(x => `<button class="me-pose${av.pose === x ? ' on' : ''}" data-k="pose" data-v="${x}"><img src="mra-${x}.webp" alt="" loading="lazy"><small>${POSE_EN[x]}</small></button>`).join('')}</div>`, true)}
            ${acc('shirt', '👕 Shirt · Camiseta', `<div class="me-sws">${sw('shirt', MRAV.SHIRTS)}</div>`)}
            ${acc('pants', '👖 Pants · Pantalón', `<div class="me-sws">${sw('pants', MRAV.PANTS)}</div>`)}
            ${acc('shoes', '👟 Shoes · Zapatos', `<div class="me-sws">${sw('shoes', MRAV.SHOES)}</div>`)}
            ${acc('hat', '🎩 Hat · Sombrero', `<div class="me-hats">${Object.keys(MRAV.HATS).map(x => `<button class="me-hat${av.hat === x ? ' on' : ''}" data-k="hat" data-v="${x}"><b>${HAT_EN[x][0]}</b><small>${HAT_EN[x][1]}</small></button>`).join('')}</div>`)}
            ${acc('bg', '🖼️ Background · Fondo', `<div class="me-sws">${Object.keys(MRAV.BGS).map(x => `<button class="me-sw${av.bg === x ? ' on' : ''}" data-k="bg" data-v="${x}"><i style="background:linear-gradient(135deg,${MRAV.BGS[x][0]},${MRAV.BGS[x][1]})"></i><small>${BG_EN[x]}</small></button>`).join('')}</div>`)}
            ${acc('sticker', '⭐ Sticker', `<div class="me-hats">${MRAV.STICKERS.map(x => `<button class="me-hat stk${av.sticker === x ? ' on' : ''}" data-k="sticker" data-v="${x}"><b>${x || '🚫'}</b></button>`).join('')}</div>`)}
          </div></div>`;
        let tok = 0;
        const paint = () => { const bg = MRAV.BGS[av.bg] || MRAV.BGS.red; $('#stage').style.background = `linear-gradient(135deg,${bg[0]},${bg[1]})`; $('#stk').textContent = av.sticker || '';
          const my = ++tok; $('#stage').classList.add('busy'); MRAV.full(av).then(u => { if (my !== tok) return; $('#pv').src = u; $('#stage').classList.remove('busy'); }); };
        const mark = () => { $$('[data-k]', body).forEach(b => b.classList.toggle('on', av[b.dataset.k] === b.dataset.v)); $$('[data-cur]', body).forEach(e => e.innerHTML = cur(e.dataset.cur)); };
        $$('.me-acc', body).forEach(d => d.addEventListener('toggle', () => { if (d.open) { $$('.me-acc', body).forEach(o => { if (o !== d) o.open = false; }); if (window.innerWidth < 720) setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60); } }));
        $$('[data-k]', body).forEach(b => b.onclick = () => { av[b.dataset.k] = b.dataset.v; sfx('tap'); mark(); paint(); });
        $('#rnd').onclick = () => { const pick = (a) => a[Math.floor(Math.random() * a.length)]; av = { pose: pick(MRAV.POSES), shirt: pick(MRAV.SHIRTS)[0], pants: pick(MRAV.PANTS)[0], shoes: pick(MRAV.SHOES)[0], hat: pick(Object.keys(MRAV.HATS)), bg: pick(Object.keys(MRAV.BGS)), sticker: pick(MRAV.STICKERS) }; mark(); paint(); };
        $('#sv').onclick = async () => { const b = $('#sv'); b.disabled = true; b.textContent = 'Guardando…'; let head = ''; try { head = await MRAV.head(av); } catch (e) { }
          const guide = $('#guide').checked; P.setLook({ av: Object.assign({}, av), head, pic: head ? 'avatar' : (L.pic || ''), guide });
          MRAV.applyGuide(guide ? av : null); M.confetti(1200); done('¡Tu Mr. Arrieta quedó genial! 🎉'); b.disabled = false; b.textContent = '✅ Guardar mi Mr. Arrieta';
          const m = M.modal(`<div class="center">${P.avHTML('pt-av big')}<h3>Looking good! 😎</h3><p>Tu Mr. Arrieta ahora es tu <b>foto de perfil</b>${guide ? ' y te acompañará en tus clases' : ''}.</p><button class="btn k block" id="ok">Ver mi perfil</button><button class="btn w block" id="st" style="margin-top:8px">Seguir personalizando</button></div>`, { x: true });
          $('#ok', m).onclick = () => { m.remove(); route('home'); }; $('#st', m).onclick = () => m.remove(); };
        $('#guide').onchange = e => { if (L.av || P.look().av) { P.setLook({ guide: e.target.checked }); MRAV.applyGuide(e.target.checked ? (P.look().av || av) : null); M.toast(e.target.checked ? 'Tu Mr. Arrieta te acompañará en las clases 🙌' : 'Volverá el Mr. Arrieta original'); } };
        paint();
      } else {
        const opt = (v, lbl, dis) => `<label class="me-radio${dis ? ' dis' : ''}"><input type="radio" name="pic" value="${v}" ${(L.pic || '') === v ? 'checked' : ''} ${dis ? 'disabled' : ''}> ${lbl}</label>`;
        body.innerHTML = `<div class="card me-plat">
          <h3>🖼️ Profile picture · Foto de perfil</h3>
          <div class="me-radios">${opt('', `<span class="pt-av sm">${esc(P.initials())}</span> Mis iniciales`)}${opt('photo', `${L.photo ? `<span class="pt-av sm has"><img src="${L.photo}"></span>` : '📸'} Mi foto`, !L.photo)}${opt('avatar', `${L.head ? `<span class="pt-av sm has"><img src="${L.head}"></span>` : '🧑‍🏫'} Mi Mr. Arrieta`, !L.head)}</div>
          <h3>👋 Nickname · ¿Cómo quieres que te salude?</h3><input class="inp" id="nick" maxlength="20" placeholder="${esc(p.first)}" value="${esc(L.nick || '')}">
          <p class="muted pt-small">Tu nombre completo se sigue usando en certificados y reportes.</p>
          <h3>🎨 My color · Color de mi perfil</h3><div class="me-sws">${BANNERS.map(([k, en, c]) => `<button class="me-sw${(L.banner || 'w') === k ? ' on' : ''}" data-b="${k}"><i style="background:${c}"></i><small>${en}</small></button>`).join('')}</div>
          <label class="me-chk"><input type="checkbox" id="guide2" ${L.guide ? 'checked' : ''} ${L.av ? '' : 'disabled'}><span>Que <b>mi Mr. Arrieta personalizado</b> me acompañe en todas mis clases${L.av ? '' : ' <small class="muted">(primero crea tu Mr. Arrieta)</small>'}</span></label>
          <button class="btn k block lg" id="svp">✅ Guardar</button></div>`;
        let ban = L.banner || 'w';
        $$('[data-b]', body).forEach(b => b.onclick = () => { ban = b.dataset.b; $$('[data-b]', body).forEach(x => x.classList.toggle('on', x === b)); sfx('tap'); });
        $('#svp').onclick = () => { const r = $('input[name=pic]:checked', body); const guide = $('#guide2').checked;
          P.setLook({ pic: r ? r.value : '', nick: $('#nick').value.trim(), banner: ban, guide: !!(guide && L.av) }); MRAV.applyGuide(guide && L.av ? L.av : null); done('¡Cambios guardados! ✅'); route('home'); };
      }
    }
    show(tab || 'av');
  }

  /* ---------- planes y clases con profes (nube) ---------- */
  const fmtD = (iso, o) => { try { return new Date(String(iso).slice(0, 10) + 'T12:00:00').toLocaleDateString('es-CO', o || { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return iso; } };
  const fmtT = (t) => { const [hh, mm] = String(t || '00:00').split(':').map(Number); const ap = hh >= 12 ? 'p. m.' : 'a. m.'; return `${((hh + 11) % 12) + 1}:${String(mm || 0).padStart(2, '0')} ${ap}`; };
  function planSection() {
    const p = P.get(); if (!p || p.type === 'staff' || !window.MRPLANS) return '';
    const pl = P.plan(); if (pl.legacy && !P.isTrial()) return '';
    const name = (pl.plan === 'premium8' && pl.eff === 'premium' ? 'Premium · 8 clases' : { free: 'Acceso gratuito', membership: 'Plataforma', premium: 'Premium · 4 clases' }[pl.eff]) || 'Acceso gratuito';
    const ic = MRI(pl.plan === 'premium8' && pl.eff === 'premium' ? 'gem' : ({ free: 'gift', membership: 'monitor', premium: 'crown' }[pl.eff] || 'gift'));
    const end = pl.end ? fmtD(pl.end, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const sub = pl.expired ? `Tu plan ${esc(MRPLANS.PL[pl.plan] ? MRPLANS.PL[pl.plan].name : '')} venció el ${end}. Tu progreso sigue guardado.`
      : pl.eff === 'free' ? 'Prueba de clasificación, tu ruta de aprendizaje y los 2 primeros temas.'
      : `Activo hasta el <b>${end}</b>${pl.daysLeft !== null && pl.daysLeft <= 5 ? ` · <b class="pl-warn">vence en ${pl.daysLeft} día${pl.daysLeft === 1 ? '' : 's'}</b>` : ''}`;
    const renew = pl.expired || (pl.paid && pl.daysLeft !== null && pl.daysLeft <= 5);
    return `<div class="sect-title" id="pt-plan"><h2>${MRI('crown')} Mi plan</h2></div>
      <div class="card pl-mine ${pl.eff}${pl.expired ? ' exp' : ''}"><div class="pl-mine-ic">${pl.expired ? MRI('clock') : ic}</div><div class="grow"><span class="lbl">Tu plan actual</span><h2>${pl.expired ? 'Plan vencido' : name}</h2><p class="muted">${sub}</p></div></div>
      ${pl.plan === 'premium8' && pl.eff !== 'free' && !renew ? '' : MRPLANS.cards(pl.expired ? pl.plan : (pl.plan === 'premium8' && pl.eff !== 'free' ? 'premium8' : pl.eff), renew)}`;
  }
  // sección Premium: grupo, créditos VIP, próximas clases, club — se llena con datos de la nube
  async function live() {
    if (!window.MRAC || !MRAC.code()) return;
    const box = $('#pt-live'); const sig = () => { const q = P.get() || {}; return [q.plan, q.planEnd, q.type, q.module, q.expired].map(x => String(x == null ? '' : x)).join('|'); }; const before = sig();
    if (box && P.plan().premium) box.innerHTML = '<div class="sect-title"><h2>' + MRI('video') + ' Mis clases con profes</h2></div><div class="card lv-load">⏳ Cargando tus clases…</div>';
    const r = await MRAC.me(); if (!r || (box && !document.body.contains(box)) || !$('#pt-ann')) return;
    if (r.ok === false && r.err === 'trial_over') { const c = MRAC.code(); P.clear(); try { sessionStorage.removeItem('mra_me_cache'); } catch (e) { } route('home'); return trialOver(c); }
    if (r.ok === false && r.err === 'moved') { P.clear(); try { sessionStorage.removeItem('mra_me_cache'); } catch (e) { } M.modal(`<div class="center"><div class="to-ic">${MRI('check')}</div><h3>¡Tu plan ya está activo!</h3><p>Te enviamos un <b>código de acceso nuevo</b> a tu correo. El código gratuito ya no funciona: entra con el nuevo.</p><button class="btn k block lg" onclick="location.reload()">Entendido</button></div>`, { x: false }); return; }
    if (r.ok === false && (r.err === 'notfound' || r.err === 'inactive')) { M.toast('Tu acceso ya no está activo. Escríbenos por WhatsApp.'); return; }
    if (before !== sig()) { topbar(); return home(); } // el plan cambió en la nube → actualizar perfil
    const ann = r.conf && r.conf.announcement; if (ann && $('#pt-ann')) $('#pt-ann').innerHTML = `<div class="pt-ann">📣 ${esc(ann)}</div>`;
    if (r.trialLeft != null && r.trialLeft > 0 && $('#pt-ann')) $('#pt-ann').insertAdjacentHTML('afterbegin', `<div class="pt-ann pt-trial"><span>🎁 ${r.trialLeft === 1 ? '<b>Hoy es tu último día</b> de acceso gratuito.' : 'Te quedan <b>' + r.trialLeft + ' días</b> de acceso gratuito.'}</span><a class="btn k sm" href="#" data-plans>Quiero inscribirme</a></div>`);
    refCard(); notesCard();
    if (r.mail && r.mail.bad && $('#pt-ann')) { $('#pt-ann').insertAdjacentHTML('afterbegin', `<div class="pt-ann pt-mailbad"><span>✉️ No hemos podido enviarte correos a <b>${esc(r.mail.email)}</b>. Corrígelo para recibir los avisos de tus clases.</span><button class="btn w sm" id="pt-mailfix">✏️ Corregir mi correo</button></div>`); $('#pt-mailfix').onclick = () => mailEdit(r.mail.email); }
    if (window.MRAGREE && (P.get() || {}).type !== 'staff' && P.plan().paid) await MRAGREE.check(); // 📄 acuerdo de servicio (una sola vez)
    if (!r.premium) { if (box) box.innerHTML = ''; return; }
    nextClassCard(r);
    if (box) { renderLive(box, r); boardsHook(); sdTidy(); }
    askReview(r.premium && r.premium.reviewDue);
  }
  const ICO = { cam: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6h11a2 2 0 0 1 2 2v1.6l3.4-2.3A1 1 0 0 1 22 8.1v7.8a1 1 0 0 1-1.6.8L17 14.4V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>', mic: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z"/></svg>' };
  const TOPICS = {"1":[["The Greetings","Los saludos"],["The Alphabet","El abecedario"],["The Nationalities","Países y nacionalidades"],["Numbers and Colors","Números y colores"],["Verb To Be and A / An","Verbo To Be y A / An"],["Jobs and Occupations","Profesiones y ocupaciones"],["Family and Animals","La familia y los animales"],["The Food vs. The Fruit and Vegetables","Comida, frutas y verduras"],["Weekdays and Months of the Year","Días de la semana y meses"],["The Weather Forecast and the Clothes","El clima y la ropa"],["School Supplies and Parts of the House","Útiles escolares y partes de la casa"],["The Singular and the Plural Nouns","Singular y plural"],["Demonstrative Pronouns","This, that, these, those"],["There is and There are","Hay (singular vs. plural)"]],"2":[["Telling the Time","Decir la hora"],["The Simple Present","El presente simple"],["The Human Body","El cuerpo humano"],["Physical Appearance Vocabulary","La apariencia física"],["Personalities Adjectives","Adjetivos de personalidad"],["The Simple Past Tense (She was... I went...)","El pasado simple"],["Present/Past Continuous","Presente y pasado continuo"],["Adverbs of Frequency","Adverbios de frecuencia"],["Modal Verbs","Verbos modales"],["Reflexive Pronouns","Pronombres reflexivos"],["Phrasal Verbs","Verbos frasales"]],"3":[["Will and Going To","Will y going to"],["Possessive Adjectives","Adjetivos posesivos"],["Possessive Pronouns","Pronombres posesivos"],["The Present Perfect","El presente perfecto"],["The Past Perfect","El pasado perfecto"],["Prepositions of Time","Preposiciones de tiempo"],["Prepositions of Place","Preposiciones de lugar"],["Comparatives and Superlatives","Comparativos y superlativos"],["Used To and Be/Get Used To","Used to y be/get used to"],["Enough and Wish","Enough y wish"],["Un/Countable Nouns","Sustantivos contables e incontables"],["A Few / Few / Little / A Little","A few, few, little, a little"],["Linking Words","Conectores"]],"4":[["First Conditionals","Primer condicional"],["Second Conditionals","Segundo condicional"],["Third Conditionals","Tercer condicional"],["Verbs + Infinitive or Gerund","Verbos + infinitivo o gerundio"],["So, Neither, Either","So, neither, either"],["Present/Past Perfect Continuous","Presente y pasado perfecto continuo"],["Relative Clauses","Cláusulas relativas"],["Tag Questions","Preguntas coletilla"],["Reported Speech","Estilo indirecto"],["Direct and Indirect Questions","Preguntas directas e indirectas"],["Passive and Active Voice","Voz pasiva y activa"],["Have Something Done","Have/get something done"],["Future Perfect and Continuous","Futuro perfecto y futuro continuo"],["The Future Perfect Continuous","El futuro perfecto continuo"],["Artificial Intelligence and Employment","La inteligencia artificial y el empleo"],["Globalization: Benefits vs. Drawbacks","Globalización: beneficios y desventajas"],["The Impact of Social Media on Mental Health","El impacto de las redes sociales en la salud mental"],["Justice and Fairness (Are we in a fair society?)","Justicia y equidad: ¿vivimos en una sociedad justa?"],["Traditional Education vs. Online Learning","Educación tradicional vs. aprendizaje en línea"],["The Future of Democracy","El futuro de la democracia"],["Space Exploration: Progress or Vanity?","Exploración espacial: ¿progreso o vanidad?"]]};
  // 🎁 Invita a un amigo (referidos) — solo planes pagos activos
  // 📂 secciones que viven en los menús: ocultas hasta que el estudiante las abre (el aviso "no acumulables" queda visible)
  function sdShow(el) { $$('.sd-open').forEach(x => x.classList.remove('sd-open')); const d = el.closest('.lv-duo'); (d || el).classList.add('sd-open'); el.classList.add('sd-open'); }
  function sdTidy() { const n = $('.lv-noacum'), st = $('.lv-stats2'); if (n && st && !n.classList.contains('sd-moved')) { n.classList.add('sd-moved'); st.after(n); } }
  // 📝 tablero de cada clase (lo escribe el profe que dio esa clase) → botón "Ver tablero" en el historial
  async function boardsHook() {
    const r = await MRAC.call('myBoards', { code: MRAC.code() }).catch(() => null); if (!r || !r.ok) return;
    (r.boards || []).filter(b => b.text || (b.imgs || []).length).forEach(b => { const row = document.querySelector(`.lv-hist [data-cid="${b.classId}"]`); if (!row || row.querySelector('.tb-see')) return;
      const bt = document.createElement('button'); bt.className = 'btn w sm tb-see'; bt.innerHTML = '📝 Ver tablero'; row.appendChild(bt);
      bt.onclick = (e) => { e.preventDefault(); const m = M.modal(`<h3>📝 Tablero de tu profe</h3><p class="muted">${esc(fmtD(b.date, { weekday: 'short', day: 'numeric', month: 'short' }))} · ${esc(b.teacher || '')}</p>${b.text ? `<div class="tb-board ro">${esc(b.text)}</div>` : ''}${(b.imgs || []).map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img class="tb-pzimg" src="${esc(u)}" alt="Pizarra ${i + 1}" loading="lazy"></a>`).join('')}<button class="btn k block" id="tb-cl" style="margin-top:12px">Cerrar</button>`, { x: true }); $('#tb-cl', m).onclick = () => m.remove(); }; });
  }
  // ✏️ Mis apuntes — editor moderno: varias notas, negrita/lista/resaltar, dictado por voz, guardado automático (privados)
  async function notesCard() {
    const el = $('#pt-notes'); if (!el || el.dataset.on) return; el.dataset.on = '1';
    const OK = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, MARK: 1, UL: 1, OL: 1, LI: 1, BR: 1, DIV: 1, P: 1, SPAN: 1 };
    const clean = (html) => { const d = new DOMParser().parseFromString('<div>' + String(html || '') + '</div>', 'text/html').body.firstChild; const walk = (n) => { [...n.childNodes].forEach(c => { if (c.nodeType === 1) { if (!OK[c.tagName]) { if (/^(SCRIPT|STYLE|IFRAME|OBJECT)$/.test(c.tagName)) c.remove(); else { walk(c); c.replaceWith(...c.childNodes); } return; } const hl = c.tagName === 'SPAN' && /background/.test(c.getAttribute('style') || ''); [...c.attributes].forEach(a => c.removeAttribute(a.name)); if (hl) { const m = document.createElement('mark'); m.append(...c.childNodes); c.replaceWith(m); walk(m); return; } walk(c); } else if (c.nodeType !== 3) c.remove(); }); }; walk(d); return d.innerHTML; };
    let N = { v: 2, notes: [] }, cur = 0, tmr = null;
    el.innerHTML = `<div class="card nt"><div class="nt-h"><div class="nt-hi">${MRI('file')}</div><div class="grow"><h3>Mis apuntes</h3><p>Tu cuaderno personal · solo tú lo ves</p></div><span class="nt-st" id="nt-st">Cargando…</span></div>
      <div class="nt-tabs" id="nt-tabs"></div>
      <input class="nt-ti" id="nt-ti" maxlength="60" placeholder="Título de la nota (ej: Topic 1 · Greetings)">
      <div class="nt-bar"><button type="button" data-cmd="bold" title="Negrita"><b>B</b></button><button type="button" data-cmd="insertUnorderedList" title="Lista">• Lista</button><button type="button" data-cmd="hl" title="Resaltar">🖍 Resaltar</button>${(window.SpeechRecognition || window.webkitSpeechRecognition) ? '<button type="button" id="nt-mic" title="Dictar">🎙️ Dictar</button>' : ''}<span class="grow"></span><button type="button" id="nt-dl" title="Descargar">⬇</button><button type="button" id="nt-del" title="Borrar nota">🗑</button></div>
      <div class="nt-ed" id="nt-ed" contenteditable="true" data-ph="Escribe aquí lo que quieras recordar…"></div>
      <div class="nt-f"><button class="btn k sm" id="nt-sv">💾 Guardar</button><small class="muted" id="nt-ct"></small></div></div>`;
    const ed = $('#nt-ed'), ti = $('#nt-ti'), stt = $('#nt-st');
    const status = (t, ok) => { stt.textContent = t; stt.classList.toggle('ok', !!ok); };
    const r = await MRAC.call('myNotes', { code: MRAC.code() }).catch(() => null); const raw = (r && r.ok && r.text) || '';
    try { const j = JSON.parse(raw); if (j && j.notes) N = j; } catch (e) { if (raw) N.notes = [{ id: 'n1', title: 'Mis apuntes', html: esc(raw).replace(/\n/g, '<br>') }]; }
    if (!N.notes.length) N.notes = [{ id: 'n1', title: '', html: '' }];
    const sync = () => { const n = N.notes[cur]; n.html = clean(ed.innerHTML); n.title = ti.value.trim(); n.upd = new Date().toISOString().slice(0, 10); };
    const words = () => { const w = (ed.innerText || '').trim().split(/\s+/).filter(Boolean).length; $('#nt-ct').textContent = w ? w + ' palabra' + (w === 1 ? '' : 's') : ''; };
    const tabs = () => { $('#nt-tabs').innerHTML = N.notes.map((n, i) => `<button class="nt-tab${i === cur ? ' on' : ''}" data-i="${i}">${esc(n.title || 'Nota ' + (i + 1))}</button>`).join('') + '<button class="nt-tab nt-add" id="nt-add">+ Nueva</button>';
      $$('#nt-tabs [data-i]').forEach(b => b.onclick = () => { sync(); cur = +b.dataset.i; load(); }); $('#nt-add').onclick = () => { sync(); N.notes.push({ id: 'n' + Date.now(), title: '', html: '' }); cur = N.notes.length - 1; load(); ti.focus(); }; };
    const load = () => { const n = N.notes[cur]; ed.innerHTML = clean(n.html); ti.value = n.title || ''; tabs(); words(); };
    const save = async () => { clearTimeout(tmr); sync(); status('Guardando…'); const x = await MRAC.call('myNotesSave', { code: MRAC.code(), text: JSON.stringify(N) }).catch(() => null); if (x && x.ok) status('✓ Guardado', true); else status('⚠️ Sin guardar'); };
    const later = () => { status('Cambios sin guardar'); clearTimeout(tmr); tmr = setTimeout(save, 1500); words(); };
    ed.addEventListener('input', later); ti.addEventListener('input', () => { later(); const b = $(`#nt-tabs [data-i="${cur}"]`); if (b) b.textContent = ti.value || 'Nota ' + (cur + 1); });
    $$('.nt-bar [data-cmd]').forEach(b => b.onmousedown = (e) => { e.preventDefault(); const c = b.dataset.cmd; if (c === 'hl') { try { document.execCommand('styleWithCSS', false, true); } catch (er) { } document.execCommand('hiliteColor', false, '#fff27a'); } else document.execCommand(c); later(); });
    $('#nt-sv').onclick = save;
    $('#nt-dl').onclick = () => { sync(); const txt = N.notes.map(n => (n.title || 'Nota') + '\n' + new DOMParser().parseFromString(n.html.replace(/<br>|<\/(div|p|li)>/g, '\n'), 'text/html').body.textContent).join('\n\n———\n\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = 'mis-apuntes-mrarrieta.txt'; a.click(); };
    $('#nt-del').onclick = () => { if (!confirm('¿Borrar esta nota?')) return; N.notes.splice(cur, 1); if (!N.notes.length) N.notes = [{ id: 'n1', title: '', html: '' }]; cur = Math.max(0, cur - 1); load(); save(); };
    const mic = $('#nt-mic'); if (mic) { let rec = null; mic.onclick = () => { if (rec) { rec.stop(); return; } const SR = window.SpeechRecognition || window.webkitSpeechRecognition; rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.continuous = true;
      rec.onresult = (e) => { const t = [...e.results].slice(e.resultIndex).map(x => x[0].transcript).join(' '); ed.focus(); document.execCommand('insertText', false, (ed.innerText.trim() ? ' ' : '') + t); later(); };
      rec.onend = () => { rec = null; mic.classList.remove('on'); mic.textContent = '🎙️ Dictar'; }; rec.start(); mic.classList.add('on'); mic.textContent = '⏹ Detener'; }; }
    load(); status(raw ? '✓ Guardado' : 'Nuevo', !!raw);
  }
  async function refCard() {
    const el = $('#pt-ref'); if (!el) return;
    const r = await MRAC.call('refInfo', { code: MRAC.code() }).catch(() => null); if (!r || !r.ok || !r.eligible || !document.body.contains(el)) return;
    const link = location.href.replace(/[^/]*$/, '') + 'inscripcion.html?ref=' + encodeURIComponent(r.code);
    const prem = P.plan().premium; const n = r.count || 0;
    const msg = `¡Hola! Estoy aprendiendo inglés HABLANDO en mrarrieta.com y me encanta. Inscríbete con mi código *${r.code}* y obtienes ${r.pct}% de descuento en tu primer mes: ${link}`;
    el.innerHTML = `<div class="pt-refline"><span class="grow">${MRI('gift')} <b>Invita a un amigo:</b> recibe ${r.pct}% en su primer mes y tú ganas ${prem ? '1 clase individual' : '3 días más de Plataforma'}.${n ? ` <small>· ${n} confirmado${n === 1 ? '' : 's'}</small>` : ''}</span><button class="btn w sm" id="rf-cp">${MRI('copy')} Copiar enlace</button>${n >= 5 ? `<button class="btn k sm" id="rf-cert">${MRI('award')} Certificado</button>` : ''}</div>`;
    $('#rf-cp').onclick = () => { try { navigator.clipboard.writeText(link); M.toast('✅ Enlace copiado'); } catch (e) { prompt('Copia tu enlace:', link); } };
    if ($('#rf-cert')) $('#rf-cert').onclick = () => ambassador();
  }
  function ambassador() {
    const p = P.get() || {}; const name = ((p.first || '') + ' ' + (p.last || '')).trim(); const w = window.open('', '_blank'); if (!w) return M.toast('Permite las ventanas emergentes para ver tu certificado');
    const base = location.href.replace(/[^/]*$/, ''); const d = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Certificado de Embajador · ${esc(name)}</title><style>@page{size:landscape;margin:0}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff}.c{box-sizing:border-box;width:100vw;height:100vh;padding:40px;display:flex;align-items:center;justify-content:center}.in{border:10px solid #0B2A5B;outline:4px solid #E3242B;outline-offset:-22px;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;box-sizing:border-box}img{height:80px}h1{color:#0B2A5B;font-size:40px;margin:18px 0 6px;letter-spacing:.04em}h2{color:#E3242B;font-size:20px;margin:0 0 20px;letter-spacing:.2em}.n{font-size:38px;font-weight:800;color:#0B2A5B;border-bottom:3px solid #E3242B;padding:0 30px 6px;margin:6px 0 16px}p{font-size:17px;color:#333;max-width:640px;line-height:1.5}.f{margin-top:26px;font-size:14px;color:#333}.f b{display:block;font-size:16px;color:#0B2A5B}</style></head><body><div class="c"><div class="in"><img src="${base}mra-brand.png" alt="mrarrieta.com"><h1>CERTIFICADO</h1><h2>EMBAJADOR MRARRIETA.COM</h2><p>Se otorga a</p><div class="n">${esc(name)}</div><p>por recomendar mrarrieta.com y ayudar a otras personas a aprender inglés HABLANDO. ¡Gracias por ser parte de nuestra comunidad! 🏅</p><div class="f"><b>John Jairo Arrieta Jaramillo</b>Director de mrarrieta.com · ${esc(d)}</div></div></div><script>setTimeout(()=>print(),600)<\/script></body></html>`); w.document.close();
  }
  // 🧾 estado de mis compras (pendiente / aprobado / rechazado / cancelado)
  async function myBuys() {
    const el = $('#lv-buys'); if (!el) return;
    const r = await MRAC.call('myBuys', { code: MRAC.code() }).catch(() => null); if (!r || !r.ok || !(r.buys || []).length || !document.body.contains(el)) return;
    const ST = { pendiente: '⏳ Pendiente', aprobado: '✅ Aprobado', rechazado: '❌ Rechazado', cancelado: '🚫 Cancelado' };
    el.innerHTML = `<details class="lv-buys" style="margin-top:12px"><summary><b>${MRI('receipt')} Mis compras</b></summary><div class="lv-list">${r.buys.slice(0, 8).map(b => `<div class="lv-cl"><div class="grow"><b>${b.kind === 'extra' ? '➕ ' + b.n + ' clase' + (b.n == 1 ? '' : 's') + ' adicional' + (b.n == 1 ? '' : 'es') : esc((window.MRPLANS && MRPLANS.PL[b.plan] || {}).name || b.plan)}</b><small>${fmtD(String(b.date).slice(0, 10))} · ${window.MRPLANS ? MRPLANS.fmt(b.amount) : b.amount} COP · ${b.method === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'}</small></div><span class="lv-${b.status === 'aprobado' ? 'ok' : 'pend'}">${ST[b.status] || esc(b.status)}</span></div>`).join('')}</div></details>`;
  }
  // ⭐ al terminar una clase individual: pedirle su opinión del profe (pública)
  function askReview(list) {
    if (!list || !list.length || document.querySelector('.modal')) return; const c = list[list.length - 1];
    try { if (sessionStorage.getItem('mra_rv_' + c.id)) return; sessionStorage.setItem('mra_rv_' + c.id, '1'); } catch (e) { }
    let st = 0;
    const m = M.modal(`<div class="center">${(window.MRPROFPIC && MRPROFPIC(c.teacher)) ? `<img class="rv-pic" src="${MRPROFPIC(c.teacher)}" alt="${esc(c.teacher || '')}">` : `<div class="to-ic">${MRI('award')}</div>`}<h3>${c.tc ? '¿Cómo calificas esta experiencia?' : '¿Cómo te fue en tu clase?'}</h3><p>${c.tc ? `<b>${esc(c.teacher || 'Tu profe')}</b> canceló tu clase del ${fmtD(c.date, { day: 'numeric', month: 'long' })} (ya volvió a tu saldo). Si quieres, califica esta experiencia.` : `Califica tu clase con <b>${esc(c.teacher || 'tu profe')}</b> del ${fmtD(c.date, { day: 'numeric', month: 'long' })}.`} Tu opinión es pública y ayuda a otros estudiantes.</p>
      <div class="rv-st">${[1, 2, 3, 4, 5].map(k => `<button type="button" data-s="${k}" aria-label="${k} estrellas">★</button>`).join('')}</div>
      <textarea class="inp" id="rv-t" rows="3" maxlength="600" placeholder="${c.tc ? 'Cuéntanos cómo te sentiste (opcional)' : 'Cuéntanos qué te gustó de la clase (opcional)'}"></textarea>
      <button class="btn k block lg" id="rv-go" style="margin-top:10px">Enviar mi opinión</button><button class="btn w block" id="rv-no" style="margin-top:8px">Más tarde</button></div>`, { x: true });
    $$('.rv-st button', m).forEach(b => b.onclick = () => { st = +b.dataset.s; $$('.rv-st button', m).forEach(x => x.classList.toggle('on', +x.dataset.s <= st)); });
    $('#rv-no', m).onclick = () => m.remove();
    $('#rv-go', m).onclick = async (e) => { if (!st) return M.toast('Elige de 1 a 5 estrellas'); e.currentTarget.disabled = true;
      const r = await MRAC.call('reviewAdd', { code: MRAC.code(), classId: c.id, stars: st, text: $('#rv-t', m).value }).catch(() => null); m.remove();
      M.toast(r && r.ok ? '⭐ ¡Gracias por tu opinión!' : 'No se pudo enviar. Inténtalo más tarde.'); };
  }
  // 📌 «Tu próxima clase»: siempre visible arriba del perfil mientras tenga una clase reservada
  let ncTimer = null;
  function nextClassCard(r) {
    const old = $('#pt-nc'); if (old) old.remove(); clearInterval(ncTimer);
    const host = $('#pt-ann'); if (!host || !r || !r.premium) return;
    const startMs = (c) => new Date(c.date + 'T' + String(c.time).slice(0, 5) + ':00-05:00').getTime();
    const up = (r.premium.upcoming || []).filter((c) => c.type === 'vip' && Date.now() < startMs(c) + 50 * 60000).sort((a, b) => startMs(a) - startMs(b));
    const left0 = ((r.premium.credits || {}).vipLeft) || 0, book = () => { const b = $('#lv-book'); if (b && !b.disabled) b.click(); else { const t = $('#pt-live'); if (t) t.scrollIntoView({ behavior: 'smooth' }); } };
    if (!up.length) { if (!left0) return; const e0 = document.createElement('div'); e0.id = 'pt-nc'; e0.className = 'card pt-nc empty';
      e0.innerHTML = `<div class="pt-nc-d"><b>${left0}</b><small>clase${left0 === 1 ? '' : 's'}</small></div><div class="pt-nc-t"><span class="pt-nc-l">📅 Reserva tu clase</span><h3>Aún no tienes clases reservadas</h3><p>Te ${left0 === 1 ? 'queda <b>1 clase</b>' : 'quedan <b>' + left0 + ' clases</b>'} individuales en tu plan. ¡Úsalas!</p></div><div class="pt-nc-b"><button class="btn k" data-bk>${MRI('calendar')} Reservar clase</button></div>`;
      e0.querySelector('[data-bk]').onclick = book; host.after(e0); return; }
    const c = up[0], today = P.todayISO(), isToday = c.date === today;
    const tom = new Date(today + 'T12:00:00'); tom.setDate(tom.getDate() + 1); const isTom = c.date === tom.toISOString().slice(0, 10);
    const pic = window.MRPROFPIC && MRPROFPIC(c.teacher);
    const topic = String(c.topic || '').replace(/^Módulo \d+ · /, '').replace(/\s*\([^)]*\)$/, '');
    const el = document.createElement('div'); el.id = 'pt-nc'; el.className = 'card pt-nc' + (isToday ? ' hoy' : '');
    const paint = () => { const ms = startMs(c) - Date.now(), min = Math.round(ms / 60000);
      const left = ms <= 0 ? '🔴 Tu clase está en curso' : min <= 5 ? '🟢 ¡Ya puedes entrar!' : min < 60 ? `Empieza en ${min} min` : min < 24 * 60 ? `Faltan ${Math.floor(min / 60)} h ${min % 60} min` : (Math.round(min / 1440) === 1 ? 'Falta 1 día' : `Faltan ${Math.round(min / 1440)} días`);
      el.innerHTML = `<div class="pt-nc-d"><b>${fmtD(c.date, { day: 'numeric' })}</b><small>${fmtD(c.date, { month: 'short' })}</small></div>
        <div class="pt-nc-t"><span class="pt-nc-l">${isToday ? '📌 Hoy tienes clase' : '📌 Tu próxima clase'}</span>
          <h3>${isToday ? 'Hoy' : isTom ? 'Mañana' : fmtD(c.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${fmtT(c.time)}</h3>
          <p>${pic ? `<img src="${pic}" alt="">` : ''}Con <b>${esc(c.th || c.teacher || 'tu profe')}</b>${topic ? ' · ' + esc(topic) : ''}</p>
          <p class="pt-nc-c">${left}${up.length > 1 ? ` · y ${up.length - 1} clase${up.length > 2 ? 's' : ''} más reservada${up.length > 2 ? 's' : ''}` : ''}</p>
          <small class="muted">Entra 5 minutos antes · la clase dura 50 minutos</small></div>
        <div class="pt-nc-b">${isToday ? `<a class="btn k" href="clase-en-vivo.html?c=${encodeURIComponent(c.id)}">${MRI('video')} Entrar a la clase</a>` : `<button class="btn w" data-go="#pt-live">${MRI('calendar')} Ver mis clases</button>`}${left0 ? `<button class="btn ${isToday ? 'w' : 'k'}" data-bk>${MRI('plus')} Reservar otra clase</button>` : ''}${c.canCancel ? `<button class="pt-nc-x" data-cx>Cancelar esta clase</button>` : ''}</div>`;
      const g = el.querySelector('[data-go]'); if (g) g.onclick = () => { const t = $('#pt-live'); if (t) t.scrollIntoView({ behavior: 'smooth' }); };
      const bk = el.querySelector('[data-bk]'); if (bk) bk.onclick = book;
      const cx = el.querySelector('[data-cx]'); if (cx) cx.onclick = () => cancelVip(c.id, 'vip', !!c.lateCancel); };
    paint(); host.after(el); ncTimer = setInterval(() => { if (!document.body.contains(el)) return clearInterval(ncTimer); paint(); }, 30000);
  }
  function renderLive(box, r) {
    const pr = r.premium, cr = pr.credits, g = pr.group;
    const up = pr.upcoming || [];
    const today = P.todayISO();
    const pend = (pr.requests || []).find(q => q.status === 'pendiente');
    const dl = cr.cycleEnd ? Math.round((new Date(cr.cycleEnd + 'T12:00:00') - new Date(today + 'T12:00:00')) / 864e5) : 99;
    const nag = cr.vipLeft > 0 && (!up.some(c => c.type === 'vip') || dl <= 7) ? `<div class="lv-nag">${MRI('alert')}<div class="grow">Te ${cr.vipLeft === 1 ? 'queda <b>1 clase</b>' : 'quedan <b>' + cr.vipLeft + ' clases</b>'}. Se vencen el <b>${fmtD(cr.cycleEnd, { day: 'numeric', month: 'long' })}</b>${dl <= 7 ? ' (en ' + dl + ' día' + (dl === 1 ? '' : 's') + ')' : ''}.</div><button class="btn k sm" data-nagbook>Reservar</button></div>` : ''; // ⚠️ recordatorio visible (sin enviar mensajes)
    box.innerHTML = `<div class="sect-title"><h2>${MRI('video')} Mis clases con profes</h2></div>${nag}<div class="lv-wrap">
      <div class="lv-stats2">
        <div class="lv-s2 s-red"><span class="lv-s2i">${MRI('calendar')}</span><div class="lv-s2t"><small>Clases disponibles</small><b>${cr.vipLeft}<em>/ ${cr.vipTotal}</em></b><div class="lv-s2bar"><i style="width:${cr.vipTotal ? Math.round(cr.vipLeft / cr.vipTotal * 100) : 0}%"></i></div><span>Periodo: ${fmtD(cr.cycleStart, { day: 'numeric', month: 'short' })} – ${fmtD(cr.cycleEnd, { day: 'numeric', month: 'short' })}</span></div></div>
        <div class="lv-s2 s-blue"><span class="lv-s2i">${MRI('check')}</span><div class="lv-s2t"><small>Clases usadas</small><b>${cr.vipUsed}</b><span>Incluidas en tu plan: ${cr.vipIncluded || 0}${cr.vipBonus ? ' · + ' + cr.vipBonus + ' adicional' + (cr.vipBonus === 1 ? '' : 'es') : ''}</span></div></div>
        <div class="lv-s2 s-green"><span class="lv-s2i">${MRI('award')}</span><div class="lv-s2t"><small>Clases asistidas</small><b>${r.attendedTotal || 0}</b><span>Desde que empezaste</span></div></div></div>
      <div class="card lv-card lv-vip"><div class="lv-h"><span class="lv-ic ic-vip">${MRI('user')}</span><div><h3>Reserva tu clase individual</h3></div></div>
        <p class="lv-noacum">⚠️ Tus clases <b>no son acumulables</b>: resérvalas antes del <b>${fmtD(cr.cycleEnd, { day: 'numeric', month: 'long' })}</b>: después se vencen y no se recuperan.</p>
        <button class="btn k lv-bookb" id="lv-book" ${cr.vipLeft ? '' : 'disabled'}>${cr.vipLeft ? MRI('calendar') + ' Reservar' : MRI('check') + ' Ya reservaste todas tus clases'}</button>
        <button class="btn w" id="lv-extra">${MRI('plus')} Comprar clases adicionales</button>
        <div id="lv-buys"></div></div>
      <div class="card lv-card lv-next"><div class="lv-h"><span class="lv-ic ic-cal">${MRI('calendar')}</span><div><h3>Mis próximas clases</h3></div></div>
        ${up.length ? `<div class="lv-list">${up.map(c => `<div class="lv-cl ${c.type}${c.date === today ? ' hoy' : ''}"><div class="lv-dt"><b>${fmtD(c.date, { day: 'numeric' })}</b><small>${fmtD(c.date, { month: 'short' })}</small></div>
          <div class="grow"><b>${c.type === 'vip' ? '🎯 Clase individual' : c.type === 'club' ? esc(c.club || '🎙️ Club') : '👥 Clase grupal'}${c.date === today ? ' <i class="lv-today">HOY</i>' : ''}</b><small>${fmtD(c.date, { weekday: 'long' })} · ${fmtT(c.time)} · ${(window.MRPROFPIC && MRPROFPIC(c.teacher)) ? `<img class="lv-tpic" src="${MRPROFPIC(c.teacher)}" alt="">` : ''}${esc(c.teacher || '')}${c.topic ? ' · ' + esc(c.topic) : ''}</small></div>
          <div class="lv-act">${c.type === 'club' ? (c.confirmed ? '<span class="lv-ok">✅ Reservada</span>' : c.full ? '<span class="lv-pend">🚫 Cupos llenos (10/10)</span>' : c.canConfirm ? `<button class="btn k sm" data-conf="${esc(c.id)}">✅ Reservar cupo</button><small class="lv-spots">${c.spots} cupo${c.spots === 1 ? '' : 's'} libre${c.spots === 1 ? '' : 's'}</small>` : '<span class="lv-pend">⏰ Reservas cerradas (3 h antes)</span>') : ''}${c.type === 'vip' ? (c.date === today ? `<a class="btn k sm" href="clase-en-vivo.html?c=${encodeURIComponent(c.id)}">${ICO.cam} Entrar a la clase</a><small class="lv-live-n">Se activa 5 min antes</small>` : '') : ''}${c.canCancel ? `<button class="btn w sm" data-cancel="${esc(c.id)}" data-kind="${c.type}" data-late="${c.lateCancel ? 1 : ''}">Cancelar</button>` : ''}</div></div>`).join('')}</div>` : '<p class="muted">No tienes clases programadas todavía. Aquí aparecerán las clases individuales que reserves.</p>'}${up.some(c => c.type === 'club') ? '<p class="muted lv-note">🎙️ Reserva tu cupo en las clases grupales mínimo <b>3 horas antes</b>. El enlace aparece al reservar.</p>' : ''}</div>
      ${`<div class="card lv-card lv-claim"><div class="lv-h"><span class="lv-ic ic-flag">${MRI('flag')}</span><div><h3>¿Tu profe no se conectó?</h3></div></div>
        ${(pr.claimable || []).length ? `<p class="muted">Si tu profe no se conecta, repórtalo aquí (hasta 24 horas después de la clase). Si se confirma, <b>la clase vuelve a tu saldo</b>.</p><div class="lv-list">${pr.claimable.map(c => `<div class="lv-cl"><div class="grow"><b>${fmtD(c.date, { weekday: 'long', day: 'numeric', month: 'short' })} · ${fmtT(c.time)}</b><small>${(window.MRPROFPIC && MRPROFPIC(c.teacher)) ? `<img class="lv-tpic" src="${MRPROFPIC(c.teacher)}" alt="">` : ''}${esc(c.teacher || '')}</small></div><button class="btn w sm" data-claim="${esc(c.id)}">${MRI('flag')} Mi profe no se conectó</button></div>`).join('')}</div>` : ''}
        ${(pr.claims || []).length ? `<div class="lv-list" style="margin-top:8px">${pr.claims.map(c => `<div class="lv-cl"><div class="grow"><b>${fmtD(c.date, { day: 'numeric', month: 'short' })} · ${fmtT(c.time)} · ${esc(c.teacher || '')}</b><small>${c.status === 'aprobado' ? '✅ Aprobado · la clase volvió a tu saldo' : c.status === 'rechazado' ? '❌ No se confirmó' : '⏳ En revisión (máx. 24 h)'}</small></div></div>`).join('')}</div>` : ''}${!(pr.claimable || []).length ? '<p class="muted" style="margin:0">Cuando reserves una clase individual, aquí aparecerá el botón <b>"Mi profe no se conectó"</b>. Si tu profe no se conecta, repórtalo y, si se confirma, la clase vuelve a tu saldo.</p>' : ''}</div>`}
      <div class="lv-duo"><div class="card lv-card lv-msg"><div class="lv-h"><span class="lv-ic ic-wa"><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.8 4.9 2.1 6.9L3.6 28l5.7-1.5c2 1.1 4.3 1.7 6.7 1.7 7.2 0 13-5.6 13-12.6S23.2 3 16 3zm6.3 17.6c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.3-1.4-5.5-4.7-5.6-4.9-.2-.2-1.3-1.8-1.3-3.4s.8-2.4 1.1-2.7c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.6.3.7.9 2.3 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.3.6l-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 .9 2.3 1.1.3.2.6.3.7.4.1.3.1 1-.2 1.8z"/></svg></span><div><h3>Escríbele a tu profe</h3></div></div>
        <p class="muted">Chatea en vivo con tu profe, como en WhatsApp. Le avisamos cuando le escribas.</p><button class="btn wa-btn" id="lv-msg"><span class="wa-dot"><svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.8 4.9 2.1 6.9L3.6 28l5.7-1.5c2 1.1 4.3 1.7 6.7 1.7 7.2 0 13-5.6 13-12.6S23.2 3 16 3zm6.3 17.6c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.3-1.4-5.5-4.7-5.6-4.9-.2-.2-1.3-1.8-1.3-3.4s.8-2.4 1.1-2.7c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.6.3.7.9 2.3 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.3.6l-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 .9 2.3 1.1.3.2.6.3.7.4.1.3.1 1-.2 1.8z"/></svg></span> Abrir chat con mi profe</button></div>
      ${(pr.history || []).length ? `<details class="card lv-card lv-hist"><summary>${MRI('file')} Historial de clases (${pr.history.length})</summary><div class="lv-list">${pr.history.map(c => `<div class="lv-cl ${c.type}" data-cid="${esc(c.id || '')}"><div class="grow"><b>${c.type === 'vip' ? '🎯 Clase individual' : '👥 Clase grupal'} · ${fmtD(c.date)} ${fmtT(c.time)}</b><small>${esc(c.teacher || '')} · ${c.type === 'vip' ? (c.status === 'done' ? (c.attended ? '✅ Dictada · 1 clase descontada de tu plan' : '❌ No asististe · 1 clase descontada de tu plan') : c.status === 'noshow' ? '❌ No asististe · 1 clase descontada de tu plan' : c.status === 'latecancel' ? 'Cancelación tardía · 1 clase descontada de tu plan' : c.status === 'tnoshow' ? '🚩 Tu profe no se conectó · la clase volvió a tu saldo' : c.status === 'tlate' || (c.status === 'cancelled' && /por el profe/.test(c.notes || '')) ? '🔁 Tu profe canceló · la clase volvió a tu saldo' : c.status === 'cancelled' ? 'Cancelada a tiempo · sin descuento' : esc(c.status)) : (c.status === 'done' && c.attended ? '✅ Asististe' : c.status === 'cancelled' ? 'Cancelada' : 'No asististe · sin penalización')}</small></div></div>`).join('')}</div></details>` : ''}</div>
    </div>`;
    if ($('[data-nagbook]')) $('[data-nagbook]').onclick = () => { const b = $('#lv-book'); if (b) b.click(); };
    if ($('#lv-book')) $('#lv-book').onclick = () => { const mm = M.modal(`<h3>🎯 Antes de reservar tu clase individual</h3><ul class="lv-rules">
        <li><span>📅</span><div><b>¿Cuándo puedes reservar?</b> Desde <b>mañana</b> y hasta <b>5 días adelante</b>. Para hoy no se puede reservar.</div></li>
        <li><span>✅</span><div><b>¿Puedo cancelar?</b> Sí, gratis hasta <b>12 horas antes</b> de la clase. La clase vuelve a tu saldo.</div></li>
        <li><span>⚠️</span><div><b>Si cancelas con menos de 12 horas o no te conectas,</b> la clase se descuenta de tu plan.</div></li>
        <li><span>⏱️</span><div>Cada clase dura <b>50 minutos</b>.</div></li></ul><button class="btn k block lg" id="vb-go">Entendido, reservar →</button>`, { x: true }); $('#vb-go', mm).onclick = () => { mm.remove(); vipBooking(); }; };
    $$('[data-claim]', box).forEach(b => b.onclick = () => { const mm = M.modal(`<h3>🚩 ¿Tu profe no se conectó?</h3><p>Cuéntanos qué pasó (opcional). Administración lo revisa y, si se confirma, la clase vuelve a tu saldo.</p><textarea class="inp" id="cl-n" rows="3" placeholder="Ej.: esperé 15 minutos en el enlace y nadie se conectó"></textarea><button class="btn k block lg" id="cl-go" style="margin-top:10px">Enviar reporte</button>`, { x: true });
      $('#cl-go', mm).onclick = async (e) => { e.currentTarget.disabled = true; const res = await MRAC.call('claim', { code: MRAC.code(), classId: b.dataset.claim, note: $('#cl-n', mm).value }).catch(() => ({ ok: false })); mm.remove();
        if (res.ok) { M.toast(res.status === 'aprobado' ? '✅ Listo: la clase volvió a tu saldo' : '📩 Recibimos tu reporte. Te avisamos en máximo 24 horas'); live(); }
        else M.toast({ window: 'Ese reporte ya no se puede enviar (solo hasta 24 horas después de la clase).', exists: 'Ya enviaste un reporte de esta clase.' }[res.err] || 'No se pudo enviar. Inténtalo de nuevo.'); }; });
    if ($('#lv-extra')) $('#lv-extra').onclick = () => window.MRBUY ? MRBUY.extra(cr.cycleEnd) : M.toast('Recarga la página e inténtalo de nuevo.');
    myBuys();
    $$('[data-cancel]', box).forEach(b => b.onclick = () => cancelVip(b.dataset.cancel, b.dataset.kind, !!b.dataset.late));
    $$('[data-conf]', box).forEach(b => b.onclick = async () => { b.disabled = true; b.textContent = '⏳…';
      const res = await MRAC.call('groupConfirm', { code: MRAC.code(), classId: b.dataset.conf });
      if (res.ok) { M.toast('✅ ¡Cupo reservado! Tu profe ya sabe que vas.'); live(); }
      else { b.disabled = false; b.textContent = '✅ Reservar cupo'; M.toast(res.err === 'too_late' ? '⏰ Ya pasó el límite: se reserva mínimo 3 horas antes.' : res.err === 'full' ? '🚫 Esta sesión ya tiene 10 estudiantes. Reserva en el siguiente horario de tu nivel.' : 'No se pudo reservar. Intenta de nuevo.'); if (res.err === 'full') live(); } });
    $$('.lv-polk', box).forEach(a => a.onclick = (e) => { e.preventDefault(); window.MRPOLICY && MRPOLICY.show(); });
    if ($('#lv-msg')) $('#lv-msg').onclick = () => window.MRLIVE ? MRLIVE.openStudent() : teacherMsg();
  }
  function teacherMsg() {
    const m = M.modal(`<div class="vb"><h3>✉️ Escribir a mi profe</h3><textarea class="inp" id="tm-t" rows="5" maxlength="1500" placeholder="Hola profe, …" style="width:100%"></textarea><button class="btn k block lg" id="tm-ok" style="margin-top:10px">📨 Enviar</button></div>`, { x: true });
    $('#tm-ok', m).onclick = async () => { const text = $('#tm-t', m).value.trim(); if (!text) return M.toast('Escribe tu mensaje'); $('#tm-ok', m).disabled = true;
      const res = await MRAC.call('stuMsg', { code: MRAC.code(), text }); if (res.ok) { m.remove(); M.toast('✅ Mensaje enviado a tu profe'); } else { $('#tm-ok', m).disabled = false; M.toast(res.err === 'noteacher' ? 'Aún no tienes un profe asignado.' : 'No se pudo enviar. Intenta de nuevo.'); } };
  }
  function addDay(iso, n) { const d = new Date(String(iso) + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  // 🔔 lista de espera: le avisamos cuando se abra un espacio (él mismo reserva desde la plataforma)
  function waitAsk(parent) {
    const mm = M.modal(`<h3>🔔 Te avisamos cuando haya espacio</h3><p>¿En qué momento del día te sirve? Te llegará un correo y un aviso en tu perfil apenas se abra un espacio.</p>
      <div class="vb-bands">${[['', '🕑 Cualquier horario'], ['manana', '🌅 Mañana (7 a. m. – 12 m.)'], ['tarde', '☀️ Tarde (12 m. – 6 p. m.)'], ['noche', '🌙 Noche (6 p. m. – 9 p. m.)']].map(([k, l], i) => `<button class="vb-band${i ? '' : ' on'}" data-band="${k}">${l}</button>`).join('')}</div>
      <button class="btn k block lg" id="wt-go" style="margin-top:12px">Avísame</button>`, { x: true });
    let band = ''; $$('[data-band]', mm).forEach(x => x.onclick = () => { band = x.dataset.band; $$('[data-band]', mm).forEach(y => y.classList.toggle('on', y === x)); });
    $('#wt-go', mm).onclick = async () => { const bt = $('#wt-go', mm); bt.disabled = true; bt.textContent = 'Guardando…';
      const r = await MRAC.call('waitJoin', { code: MRAC.code(), band }).catch(() => null);
      if (r && r.ok) { mm.querySelector('.card').innerHTML = `<div class="center"><div class="to-ic">${MRI('bell')}</div><h3>¡Listo!</h3><p>Apenas se abra un espacio te avisamos por correo y en tu perfil. Entra y resérvalo antes de que lo tome otra persona.</p><button class="btn k block lg" id="wt-ok">Entendido</button></div>`; $('#wt-ok', mm).onclick = () => { mm.remove(); if (parent) parent.remove(); }; }
      else { bt.disabled = false; bt.textContent = 'Avísame'; M.toast('No se pudo guardar. Inténtalo de nuevo.'); } };
  }
  async function vipBooking() {
    const m = M.modal(`<div class="vb"><h3>📅 Reserva tu clase individual</h3><div id="vb-b" class="center">⏳ Buscando espacios disponibles…</div></div>`, { x: true });
    const r = await MRAC.call('vipOptions', { code: MRAC.code() }); const b = $('#vb-b', m); if (!b) return;
    if (!r.ok) { b.innerHTML = `<p>${r.err === 'not_premium' ? 'Las clases individuales son parte de los planes Premium.' : 'No pudimos cargar los espacios. Revisa tu conexión.'}</p>`; return; }
    if (!r.teachers.length) { b.innerHTML = `<p class="muted">Por ahora no hay espacios libres en los próximos días. Los profes publican nuevos horarios cada semana.</p><button class="btn k block" id="vb-wait0">🔔 Avísame cuando haya espacio</button>`; $('#vb-wait0', b).onclick = () => waitAsk(m); return; }
    let T = null, D = null, S = null, TP = null, OT = '', ALL = false;
    const MN = (P.assigned() || {}).n || +(P.get() || {}).module || 1; const tops = TOPICS[MN] || TOPICS[1];
    const step = () => {
      if (!T && ALL) { // 📅 todos los horarios de todos los profes, por día
        const sl = []; r.teachers.forEach(t => t.slots.forEach(x => sl.push(Object.assign({ t }, x)))); sl.sort((a, c) => (a.date + a.time).localeCompare(c.date + c.time));
        const days = [...new Set(sl.map(x => x.date))];
        b.innerHTML = `<button class="btn w sm" id="vb-allb">← Ver por profe</button><p class="vb-st">📅 Todos los horarios disponibles <small>(hora Colombia)</small></p><div class="vb-all">${days.map(d => `<div class="vb-day"><b>${fmtD(d, { weekday: 'long', day: 'numeric', month: 'short' })}</b><div class="vb-times">${sl.filter(x => x.date === d).map(x => `<button class="vb-h vb-ht" data-sid="${esc(x.id)}">${fmtT(x.time)}<small>${esc(String(x.t.name).split(' ')[0])}</small></button>`).join('')}</div></div>`).join('')}</div><button class="btn w sm vb-none" id="vb-wait">😕 Ningún horario me sirve</button>`;
        $('#vb-allb', b).onclick = () => { ALL = false; step(); }; $('#vb-wait', b).onclick = () => waitAsk(m);
        $$('[data-sid]', b).forEach(x => x.onclick = () => { const it = sl.find(y => y.id === x.dataset.sid); T = it.t; D = it.date; S = T.slots.find(y => y.id === it.id); ALL = false; sfx('tap'); step(); }); return; }
      if (!T) { b.innerHTML = `<button class="btn k sm vb-allbtn" id="vb-all">📅 Ver todos los horarios juntos</button><p class="vb-st">1️⃣ Elige tu profesor</p><div class="vb-teachers">${r.teachers.map(t => `<button class="vb-t" data-t="${esc(t.id)}">${(t.photo || (window.MRPROFPIC && MRPROFPIC(t.name))) ? `<span class="vb-av has"><img src="${esc(t.photo || MRPROFPIC(t.name))}" alt=""></span>` : `<span class="vb-av">${esc((t.name || '?').split(' ').map(x => x[0]).slice(0, 2).join(''))}</span>`}<div><b>${esc(t.name)}</b><small>${esc(t.bio || '')}</small><em>${t.slots.length} espacio${t.slots.length === 1 ? '' : 's'} disponible${t.slots.length === 1 ? '' : 's'}</em></div></button>`).join('')}</div><p class="muted vb-cr">Te quedan <b>${r.credits.vipLeft}</b> ${+r.credits.vipLeft === 1 ? 'clase individual' : 'clases individuales'} en tu plan. Puedes cancelar gratis hasta <b>12 horas antes</b> de la clase.</p><button class="btn w sm vb-none" id="vb-wait">😕 Ningún horario me sirve</button>`; $('#vb-all', b).onclick = () => { ALL = true; step(); }; $('#vb-wait', b).onclick = () => waitAsk(m);
        $$('.vb-t', b).forEach(x => x.onclick = () => { T = r.teachers.find(t => t.id === x.dataset.t); sfx('tap'); step(); }); return; }
      const dates = [...new Set(T.slots.map(s => s.date))];
      if (!D) D = dates[0];
      const times = T.slots.filter(s => s.date === D);
      b.innerHTML = `<button class="btn w sm" id="vb-back">← Profes</button><p class="vb-st">2️⃣ ${esc(T.name)}: elige fecha y hora <small>(hora Colombia)</small></p>
        <div class="vb-dates">${dates.map(d => `<button class="vb-d${d === D ? ' on' : ''}" data-d="${d}"><small>${fmtD(d, { weekday: 'short' })}</small><b>${fmtD(d, { day: 'numeric' })}</b><small>${fmtD(d, { month: 'short' })}</small></button>`).join('')}</div>
        <div class="vb-times">${times.map(s => `<button class="vb-h${S && S.id === s.id ? ' on' : ''}" data-s="${esc(s.id)}">${fmtT(s.time)}<small>50 min</small></button>`).join('')}</div>
        <p class="vb-st">3️⃣ ¿Qué quieres practicar? <small>(tu profe lo recibe antes de la clase)</small></p>
        <div class="vb-topics">${tops.map((t, i) => `<button type="button" class="vb-tp${TP === i ? ' on' : ''}" data-tp="${i}"><b>${i + 1}. ${esc(t[0])}</b><small>${esc(t[1])}</small></button>`).join('')}<button type="button" class="vb-tp vb-other${TP === 'o' ? ' on' : ''}" data-tp="o"><b>✏️ Otro tema</b><small>Algo diferente</small></button></div>
        <input class="inp${TP === 'o' ? '' : ' hidden'}" id="vb-topic" maxlength="180" placeholder="Ej: entrevista de trabajo en inglés" value="${esc(OT)}">
        <button class="btn k block lg vb-ok" id="vb-ok" ${S && TP != null ? '' : 'disabled'}>${S && TP == null ? '👆 Elige el tema de tu clase' : S ? `✅ Reservar · ${fmtD(S.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${fmtT(S.time)}` : 'Elige una hora'}</button>`;
      $('#vb-back', b).onclick = () => { T = null; D = null; S = null; step(); };
      $$('.vb-d', b).forEach(x => x.onclick = () => { D = x.dataset.d; S = null; step(); });
      $$('.vb-h', b).forEach(x => x.onclick = () => { S = T.slots.find(s => s.id === x.dataset.s); sfx('tap'); OT = $('#vb-topic', b).value; step(); });
      $$('.vb-tp', b).forEach(x => x.onclick = () => { OT = $('#vb-topic', b).value; TP = x.dataset.tp === 'o' ? 'o' : +x.dataset.tp; sfx('tap'); step(); if (TP === 'o') $('#vb-topic', b).focus(); });
      $('#vb-ok', b).onclick = async () => { const ok = $('#vb-ok', b);
        if (TP == null) return M.toast('Elige el tema que quieres practicar 🙂');
        if (TP === 'o' && !$('#vb-topic', b).value.trim()) { $('#vb-topic', b).focus(); return M.toast('Escribe qué tema quieres practicar 🙂'); }
        ok.disabled = true; ok.textContent = 'Reservando…';
        const other = $('#vb-topic', b).value.trim(); const topic = TP === 'o' ? (other ? 'Otro tema: ' + other : 'Otro tema') : TP != null ? `Módulo ${MN} · Tema ${TP + 1}: ${tops[TP][0]} (${tops[TP][1]})` : '';
        const res = await MRAC.call('vipBook', { code: MRAC.code(), slotId: S.id, topic });
        if (res.ok) { m.remove(); sfx('win'); M.confetti(1800); M.modal(`<div class="center">${M.mascot('mascot bounce', 'celebrate')}<h3>¡Clase reservada! 🎉</h3><p style="font-size:17px">${esc(T.name)} · <b>${fmtD(S.date, { weekday: 'long', day: 'numeric', month: 'long' })}</b> · ${fmtT(S.time)} (hora Colombia)</p><p class="muted">Te enviamos la confirmación a tu correo. El enlace de la clase aparece en “Mis próximas clases”.</p></div>`, { x: true }); await MRAC.me(true); live(); }
        else { M.toast({ taken: 'Ese espacio acaba de ser reservado. Elige otro 🙏', window: 'Las clases se reservan desde el día siguiente y hasta 5 días adelante.', no_credits: 'Ya reservaste todas tus clases de este periodo.', holiday: 'Ese día es domingo o festivo en Colombia: no hay clases. Elige otro día 🙏', too_late: 'Ese espacio ya no se puede reservar (muy pronto).' }[res.err] || 'No se pudo reservar. Inténtalo de nuevo.');
          if (res.err === 'taken') { const rr = await MRAC.call('vipOptions', { code: MRAC.code() }); if (rr.ok) { r.teachers = rr.teachers; T = r.teachers.find(t => t.id === T.id) || null; S = null; D = null; } step(); } else { ok.disabled = false; ok.textContent = 'Reintentar'; } } };
    };
    step();
  }
  function changeModal(g) {
    const m = M.modal(`<h3>🔁 ${g ? 'Solicitar cambio de horario' : 'Mi horario preferido'}</h3>${g ? `<p class="muted">Grupo actual: <b>${esc(g.name)}</b> · ${esc(g.days || '')} ${g.time ? fmtT(g.time) : ''}</p>` : ''}
      <label class="pt-lab">¿Qué horario te funciona mejor?</label><input class="inp" id="cq-p" maxlength="200" placeholder="Ej: lunes y miércoles después de las 7 p. m.">
      <label class="pt-lab">Motivo <small class="muted">(opcional)</small></label><textarea class="inp" id="cq-r" rows="3" maxlength="500" placeholder="Cuéntanos brevemente"></textarea>
      <p class="muted" style="font-size:14px">Administración revisa tu solicitud y te avisa por correo.</p><button class="btn k block" id="cq-ok">Enviar solicitud</button>`, { x: true });
    $('#cq-ok', m).onclick = async () => { const pf = $('#cq-p', m).value.trim(); if (!pf) { $('#cq-p', m).classList.add('wrong'); return; }
      const b = $('#cq-ok', m); b.disabled = true; b.textContent = 'Enviando…';
      const r = await MRAC.call('changeReq', { code: MRAC.code(), preferred: pf, reason: $('#cq-r', m).value.trim() });
      if (r.ok) { m.remove(); sfx('win'); M.toast('✅ Solicitud enviada. Te avisaremos por correo.'); await MRAC.me(true); live(); }
      else { b.disabled = false; b.textContent = 'Enviar solicitud'; M.toast(r.err === 'pending' ? 'Ya tienes una solicitud en revisión.' : 'No se pudo enviar. Inténtalo de nuevo.'); } };
  }
  function cancelVip(id, kind, late) {
    const club = kind === 'club', what = club ? 'tu cupo en la clase grupal' : 'tu clase individual'; if (club) late = false;
    const m = M.modal(`<h3>¿Cancelar ${what}?</h3>${late ? `<p class="lv-noacum">⚠️ Faltan <b>menos de 12 horas</b>. Si cancelas ahora, ${club ? 'esta sesión <b>se vence</b>' : 'esta clase <b>se descuenta de tu plan y no será repuesta</b>'}.</p>` : `<p>${club ? 'En las clases grupales <b>no hay penalidad</b>: puedes seguir asistiendo a las demás de tu nivel.' : 'Estás a tiempo: cancelas <b>sin penalización</b> y la clase vuelve a tu paquete.'}</p>`}<p class="muted">Tu profe recibe el aviso.</p><div class="row"><button class="btn k" id="y">Sí, cancelar</button><button class="btn w" id="n">No</button></div>`, { x: true });
    $('#n', m).onclick = () => m.remove();
    $('#y', m).onclick = async () => { $('#y', m).disabled = true; const r = await MRAC.call(club ? 'groupCancel' : 'vipCancel', { code: MRAC.code(), classId: id }); m.remove();
      if (r.ok) { M.toast(r.late ? (club ? 'Cancelaste tu cupo ✅' : 'Clase cancelada. Se descontó de tu plan (menos de 12 horas).') : (club ? 'Cancelaste tu cupo ✅' : 'Clase cancelada sin penalidad. La clase volvió a tu plan ✅')); await MRAC.me(true); live(); }
      else M.toast(r.err === 'started' ? 'La clase ya empezó: no se puede cancelar.' : 'No se pudo cancelar.'); };
  }
  /* ---------- cumpleaños ---------- */
  const bdKey = () => 'mra_bday_' + P.todayISO();
  const bdaySeen = () => { try { return !!localStorage.getItem(bdKey()); } catch (e) { return true; } };
  let BD_FIRST = null; const bdFirst = () => { if (BD_FIRST === null) BD_FIRST = !bdaySeen(); return BD_FIRST; }; // el saludo sale solo la primera vez que entra ese día
  // 🎂 cambio de grupo de edad (cumple 12 → Teens · cumple 18 → Adultos): felicitación una sola vez
  function agChange() {
    const p = P.get(); if (!p || p.type === 'staff' || !M.ageGroup) return; const ag = M.ageGroup(), prev = p.agSeen, ORD = { kids: 1, teens: 2, adult: 3 };
    if (prev === ag) return; p.agSeen = ag; P.save(p); if (!prev || !p.birth || (ORD[ag] || 0) <= (ORD[prev] || 0)) return;
    const nm = esc(P.look().nick || p.first || ''); const teen = ag === 'teens';
    setTimeout(() => { const m = M.modal(`<div class="ag-up ${teen ? 't' : 'a'}"><img src="${teen ? 'mra-x-rocket.webp' : 'mra-bday.webp'}" alt="Mr. Arrieta"><span class="ag-eye">${MRI('gift')} Feliz cumpleaños</span><h3>${teen ? `¡Ya eres Teen, ${nm}!` : `¡Feliz cumpleaños, ${nm}!`}</h3>
      <p>${teen ? 'Desde hoy tienes tu experiencia <b>Teens</b>: puntos, misiones de la semana, reto de pronunciación y ranking de la escuela.' : 'Desde hoy tu plataforma pasa a la experiencia de <b>adultos</b>. Tu progreso, tus clases y tu nivel siguen igual.'}</p>
      <button class="btn k block lg" id="ag-ok">${teen ? 'Ver mi nueva experiencia' : 'Continuar'}</button></div>`, { x: true });
      try { M.confetti(2200); M.sfx('win'); } catch (e) { } const b = m.querySelector('#ag-ok'); if (b) b.onclick = () => m.remove(); }, 900);
  }
  function birthdayBanner() { const p = P.get(); if (!P.isBirthday() || !bdFirst()) return ''; return `<div class="pt-bday" id="pt-bday"><span class="bd-cake">🎂</span><div><b>Happy Birthday, ${esc(P.look().nick || p.first)}! 🎉</b><small>¡Feliz cumpleaños! Todo el equipo de mrarrieta.com te desea un año increíble.</small></div><button class="btn w sm" id="bd-again">🎉</button></div>`; }
  // 🎂 cumpleaños: se marca por año (también en la nube) para no repetir el saludo atrasado
  const bdYear = () => P.todayISO().slice(0, 4);
  const bdMark = () => { try { localStorage.setItem('mra_bday_y_' + bdYear(), '1'); } catch (e) { } const p = P.get(); if (p && p.bdY !== bdYear()) { p.bdY = bdYear(); P.save(p); try { window.MRAC && MRAC.code() && MRAC.sync(true); } catch (e) { } } };
  const bdYearSeen = () => { const p = P.get() || {}; if (p.bdY === bdYear()) return true; try { return !!localStorage.getItem('mra_bday_y_' + bdYear()); } catch (e) { return true; } };
  // si no entró el día de su cumpleaños, lo felicitamos cuando entre en los 7 días siguientes (una sola vez)
  function belatedBirthday() {
    const p = P.get(); if (!p || !p.birth || p.type === 'staff' || bdYearSeen()) return;
    const y = bdYear(), bd = y + '-' + p.birth.slice(5, 10), t = P.todayISO(); if (bd >= t) return;
    const days = Math.round((new Date(t + 'T12:00:00') - new Date(bd + 'T12:00:00')) / 864e5); if (days < 1 || days > 7) return;
    bdMark(); const when = new Date(bd + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    setTimeout(() => { M.confetti(3500); sfx('win');
      const m = M.modal(`<div class="center bd-modal"><img src="mra-bday.webp" alt="Mr. Arrieta" class="bd-mra"><h2>Happy belated birthday, ${esc(P.look().nick || p.first)}! 🎂</h2>
        <p style="font-size:18px">Sabemos que ${days === 1 ? '<b>ayer</b>' : 'el'} <b>${esc(when)}</b> cumpliste años. ¡Muchas felicidades! Todo el equipo de mrarrieta.com te desea un año lleno de alegría, salud y muchos logros… ¡también en inglés! 🥳</p>
        <button class="btn k block lg" id="bd-ok">Thank you! 💛</button></div>`, { x: true });
      $('#bd-ok', m).onclick = () => m.remove(); }, 600);
  }
  function birthdayParty(force) {
    if (!P.isBirthday()) { /* solo el día del cumpleaños (el correo ya felicita) */ const b = $('#bd-again'); if (b) b.onclick = () => birthdayParty(true); return; }
    bdMark();
    if (bdaySeen() && !force) { const b = $('#bd-again'); if (b) b.onclick = () => birthdayParty(true); return; }
    try { localStorage.setItem(bdKey(), '1'); } catch (e) { }
    const p = P.get(); const age = p.birth ? (+P.todayISO().slice(0, 4) - +p.birth.slice(0, 4)) : 0;
    setTimeout(() => { M.confetti(5000); sfx('win');
      const m = M.modal(`<div class="center bd-modal"><img src="mra-bday.webp" alt="Mr. Arrieta" class="bd-mra"><h2>Happy Birthday, ${esc(P.look().nick || p.first)}! 🥳</h2>
        <p style="font-size:18px"><b>Today is your special day!</b><br>¡Hoy es tu día especial! Te deseamos un año lleno de alegría, salud y muchos logros… ¡también en inglés!</p>
        ${age > 0 && age < 110 ? `<p class="bd-age">🎉 ${age} years young! 🎉</p>` : ''}<button class="btn k block lg" id="bd-ok">Thank you! 💛</button></div>`, { x: true });
      $('#bd-ok', m).onclick = () => m.remove();
      try { const u = new SpeechSynthesisUtterance(`Happy birthday, ${p.first}!`); u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) { } }, 500);
    const b = $('#bd-again'); if (b) b.onclick = () => birthdayParty(true);
  }
  // perfiles antiguos sin fecha de nacimiento: la pedimos una vez
  function birthAsk() { const p = P.get(); if (!p || p.type !== 'student' || p.demo || p.birth || !p.first) return ''; return `<div class="card pt-bask"><span class="bd-cake">🎂</span><div class="grow"><b>¿Cuándo es tu cumpleaños?</b><small>Queremos felicitarte ese día 🎉</small><div class="row"><input class="inp" id="bq-d" type="date" max="${P.todayISO()}" min="1930-01-01">${p.email ? '' : '<input class="inp" id="bq-e" type="email" placeholder="tu correo">'}<button class="btn k" id="bq-ok">Guardar</button></div></div></div>`; }
  function wireBirth() {
    const ok = $('#bq-ok'); if (!ok) return;
    ok.onclick = () => { const d = $('#bq-d').value; const e = $('#bq-e') ? $('#bq-e').value.trim() : ''; if (!d) return $('#bq-d').classList.add('wrong');
      if ($('#bq-e') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return $('#bq-e').classList.add('wrong');
      const p = P.get(); p.birth = d; if (e) p.email = e; P.save(p); if (window.MRAC && MRAC.code()) MRAC.saveProfile(Object.assign({ birth: d }, e ? { email: e } : {}));
      sfx('win'); M.toast('¡Gracias! 🎂 Lo tendremos presente.'); home(); };
  }
  function placement() {
    window.MRAPLACE.run(app, { route: (r) => route(r || 'home'), after: () => topbar() });
  }
  route('home');
})();
