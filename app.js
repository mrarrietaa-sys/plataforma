/* =====================================================================
   APP — pantallas: bienvenida, inicio, lección (estructura mrarrieta.com),
   resultados, progreso, examen final, desbloqueo
   ===================================================================== */
(function () {
  const PL = (q) => (q && q._t && q._t.parts && q._t.parts.length === 1) ? 'Lesson' : 'Lesson ' + (q ? q.part : ''); // v417: Lesson 1 / Lesson 2
  const M = window.M1, A = window.M1A;
  const { D, C, S, $, $$, h, esc, shuffle, sample, sleep, photo, play, stop, sfx, sheet, good, bad, save } = M;
  const app = $('#app');
  const SKILLS = [['listening', '🎧', 'Listening'], ['reading', '📖', 'Reading'], ['speaking', '🗣️', 'Speaking'], ['writing', '✍️', 'Writing']];
  const SKILL_TIPS = {
    listening: 'Escucha cada audio 2 veces: la primera para entender la idea y la segunda para los detalles. Puedes repetir cada audio las veces que quieras con 🔊.',
    reading: 'Lee en voz alta mientras escuchas la lectura. Subraya mentalmente las palabras que no conoces y búscalas en la Explanation.',
    speaking: 'Graba tu voz y compárala con el nativo. Exagera los sonidos que no existen en español (th, h aspirada, vocales largas).',
    writing: 'Escribe cada palabra nueva 3 veces y luego úsala en una oración. Revisa mayúsculas (I, países, días) y el punto final.'
  };

  /* ---------------- top bar ---------------- */
  const AGE_ON = () => M.ageGroup() !== 'adult' && !!(window.MRAP && MRAP.get && MRAP.get()) && !(MRAP.isStaff && MRAP.isStaff());
  const SVB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  const SVL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const SVM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  function ageTopbar(tb) { // 👧🧑‍🎤 v415: mismo encabezado del perfil (blanco, íconos de línea, sin emojis)
    const pf = MRAP.get() || {}, ini = ((pf.first || 'E')[0] + ((pf.last || '')[0] || '')).toUpperCase();
    tb.classList.add('tb-age');
    tb.innerHTML = `<div class="brand" id="go-home"><span class="logo-pill"><img class="logo" src="mra-brand.png" alt="mrarrieta.com"></span></div><div class="sp"></div>
      <div class="tba-r"><a class="tba-b" href="index.html" aria-label="Volver a mi perfil">${SVB}</a><button class="tba-pts" id="pts-b" title="${esc(M.PTS_TIP)}">${MRI('star')}<b>${S.xp}</b></button><button class="tba-b" id="chat-tb" aria-label="Chat con mi profe">${MRI('chat')}</button><a class="tba-av" href="index.html" aria-label="Mi perfil">${esc(ini)}</a><button class="tba-b" id="menu-b" aria-label="Menú">${SVM}</button></div>`;
    $('#go-home', tb).onclick = () => { stop(); route('home'); }; $('#menu-b', tb).onclick = menu; $('#chat-tb', tb).onclick = openChat; $('#pts-b', tb).onclick = () => M.toast(M.PTS_TIP); chatFab(); hwBadge();
  }
  function topbar() {
    const tb = $('#topbar'); tb.classList.remove('tb-age'); if (AGE_ON() && window.MRI) return ageTopbar(tb);
    tb.innerHTML = `<div class="brand" id="go-home"><span class="logo-pill"><img class="logo" src="mra-brand.png" alt="mrarrieta.com"></span></div><div class="sp"></div><span class="tb-tag">${M.MOD.es.toUpperCase()} · ${M.MOD.id === 'B2' ? 'B1' : M.MOD.id}</span>
      <button class="pill y ce-pts" id="pts-b" title="${esc(M.PTS_TIP)}" aria-label="${S.xp} puntos. ${esc(M.PTS_TIP)}">⚡ ${S.xp} <span class="ce-ptw">puntos</span></button>
      <span class="pill hide-s" title="Días seguidos estudiando">🔥 ${S.streak.n || 0}</span>
      <button class="iconbtn chat-ic" id="chat-tb" title="Chat con mi profe" aria-label="Chat con mi profe"><svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.8 4.9 2.1 6.9L3.6 28l5.7-1.5c2 1.1 4.3 1.7 6.7 1.7 7.2 0 13-5.6 13-12.6S23.2 3 16 3zm6.3 17.6c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.3-1.4-5.5-4.7-5.6-4.9-.2-.2-1.3-1.8-1.3-3.4s.8-2.4 1.1-2.7c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.6.3.7.9 2.3 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.3.6l-.5.6c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 .9 2.3 1.1.3.2.6.3.7.4.1.3.1 1-.2 1.8z"/></svg><i class="fbadge hidden" id="chat-n"></i></button>${S.dictHidden ? '<button class="iconbtn" id="dict-b" title="Diccionario">🔎</button>' : ''}${window.MRAP && MRAP.get() ? (MRAP.pic() ? `<a class="tb-avbtn" id="prof-b" href="index.html" title="Mi perfil">${MRAP.avHTML('tb-av')}</a>` : '<a class="iconbtn" id="prof-b" href="index.html" title="Mi perfil">👤</a>') : ''}<button class="iconbtn" id="menu-b" title="Menú">☰</button>`;
    $('#go-home', tb).onclick = () => { stop(); route('home'); };
    $('#menu-b', tb).onclick = menu; hwBadge();
    const db = $('#dict-b', tb); if (db) db.onclick = () => window.M1DICT && M1DICT.open();
    const ct = $('#chat-tb', tb); if (ct) ct.onclick = openChat;
    const pb = $('#pts-b', tb); if (pb) pb.onclick = () => M.toast('⚡ ' + M.PTS_TIP);
    chatFab();
  }
  function menu() {
    const m = M.modal(`<div class="mhead"><h3>☰ Menú</h3><button class="mclose" data-a="close" title="Cerrar">✕</button></div><div class="menu-stats"><span class="pill y">⚡ ${S.xp} puntos</span><span class="pill">🔥 ${S.streak.n || 0} días</span></div><p class="muted ce-ptsline">${esc(M.PTS_TIP)}</p><div class="mnu-g" style="display:grid;gap:10px;margin-top:10px">
      ${window.MRAP && MRAP.get() ? '<a class="btn w block" style="text-decoration:none" href="index.html">👤 Mi perfil y mis módulos</a>' : ''}
      <button class="btn w block" data-a="home">🏠 Inicio</button>
      <button class="btn w block" data-a="progress">📊 Mi progreso</button>
      <button class="btn w block" data-a="chat">💬 Chat con mi profe</button>
      ${M.hasProfile() ? '' : '<button class="btn w block" data-a="unlock">🔑 Tengo un código de acceso</button>'}
      ${pendingHW().length ? `<button class="btn k block" data-a="hwl">📋 Mis tareas pendientes (${pendingHW().length})</button>` : ''}
      <button class="btn w block" data-a="remind">🔔 Recordatorio diario</button>
      <button class="btn w block" data-a="dict">${S.dictHidden ? '📌 Mostrar botón flotante del diccionario' : '🙈 Quitar botón flotante del diccionario'}</button>
      <button class="btn w block" data-a="tour">🧭 Ver el tour guiado</button>
      ${window.MRANN && MRANN.isStaff() ? `<button class="btn w block" data-a="ann">${MRANN.isHidden() ? '✏️ Mostrar la barra del profesor' : '✏️ Abrir la barra del profesor'}</button>` : ''}
      <button class="btn w block" data-a="name">✏️ Cambiar mi nombre</button>
      ${S.review ? '<button class="btn w block" data-a="unreview">🚪 Salir del modo revisión (profe)</button>' : ''}
      <button class="btn w block" data-a="sound">${S.sound ? '🔔 Sonidos: activados' : '🔕 Sonidos: desactivados'}</button><button class="btn w block" data-a="vib">${S.vib !== false ? '📳 Vibración: activada' : '📴 Vibración: desactivada'}</button>
      <button class="btn k block" data-a="close">Cerrar</button></div>`);
    $$('button', m).forEach(b => b.onclick = () => { const a = b.dataset.a; m.remove();
      if (a === 'hwl') hwList(); else if (a === 'ann') MRANN.show(); else if (a === 'chat') openChat(); else if (a === 'home' || a === 'progress') route(a); else if (a === 'unlock') unlockModal(); else if (a === 'remind') reminderModal(); else if (a === 'name') onboarding(true); else if (a === 'chath') { M.setBubbleHidden('chatHidden', !S.chatHidden); } else if (a === 'dict') { window.M1DICT && M1DICT.setHidden(!S.dictHidden); } else if (a === 'tour') { route('home'); setTimeout(tour, 400); } else if (a === 'unreview') { S.review = false; save(); M.toast('Modo revisión desactivado'); route('home'); } else if (a === 'sound') { S.sound = !S.sound; save(); M.toast(S.sound ? 'Sonidos activados 🔔' : 'Sonidos desactivados 🔕'); } else if (a === 'vib') { S.vib = S.vib === false; save(); M.toast(S.vib ? 'Vibración activada' : 'Vibración desactivada'); if (S.vib && navigator.vibrate) try { navigator.vibrate(40); } catch (e) { } } });
  }

  /* ---------------- router ---------------- */
  window.addEventListener('m1-open-part', e => route('class', e.detail));
  window.addEventListener('m1-dict-toggle', () => { if ($('#topbar')) topbar(); });
  function route(name, arg) {
    stop(); window.scrollTo(0, 0); topbar();
    try { const pf = window.MRAP && MRAP.get(); if (pf && pf.first) { const nm = ((pf.first || '') + ' ' + (pf.last || '')).trim(); if (S.name !== nm) { S.name = nm; save(); } } } catch (e) { } // el nombre siempre es el del perfil
    if (!S.name) return onboarding();
    if (name === 'home') return home();
    if (name === 'progress') return progress();
    if (name === 'class') return runClass(arg);
    if (name === 'final') return finalTest();
    if (name === 'cert') return certificateView();
    if (name === 'hw') return homeworkOnly(arg);
    if (name === 'chat') return chatScreen();
  }

  /* ---------------- onboarding ---------------- */
  function onboarding(edit) {
    topbar();
    app.innerHTML = `<div class="wrap" style="max-width:620px;padding-top:40px"><div class="card center">
      ${M.mascot('mascot bounce', 'thumbs')}
      <div class="bubble" style="margin:6px auto 18px">Hi! I'm Mr. Arrieta. Welcome! 👋</div>
      <h1 style="font-size:30px">${edit ? 'Cambia tu nombre' : `¡Bienvenido(a) al ${M.MOD.es}!`}</h1>
      <p class="muted" style="font-size:17px">${edit ? '' : 'Vas a aprender inglés <b>hablando</b>, escuchando, leyendo y escribiendo. Primero, ¿cómo te llamas?'}</p>
      <input class="inp" id="nm" placeholder="Escribe tu nombre" maxlength="30" value="${esc(S.name)}" style="margin:10px 0 16px">
      <button class="btn k lg block" id="go">${edit ? 'Guardar' : '¡Empezar! 🚀'}</button></div></div>`;
    const i = $('#nm'); i.focus();
    const go = () => { const v = i.value.trim(); if (!v) { i.classList.add('wrong'); return; } S.name = v.replace(/\s+/g, ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '); M.touchStreak(); save(); sfx('win'); route('home'); };
    $('#go').onclick = go; i.onkeydown = e => { if (e.key === 'Enter') go(); };
  }


  /* ---------------- TOUR GUIADO (primera vez) ---------------- */
  function tour() {
    if ($('#tour')) return;
    const first = esc(S.name.split(' ')[0]);
    const steps = [
      { mood: 'welcome', t: `¡Hola, ${first}! 👋`, d: 'Soy Mr. Arrieta, tu profe. Te muestro en 1 minuto cómo funciona tu plataforma.' },
      { sel: '.ringbox', mood: 'point', t: 'Tu progreso', d: `Aquí ves cuánto llevas del ${M.MOD.es}: el porcentaje sube con cada lección que completas.` },
      { sel: '.hello .skills', mood: 'idea', t: 'Tus 4 habilidades', d: 'Escuchar 🎧, leer 📖, hablar 🗣️ y escribir ✍️. Las barras suben con cada lección que haces.' },
      { sel: '#tgrid > :first-child', mood: 'pointside', t: `Los ${M.MOD.topics} temas`, d: 'Cada tema tiene <b>2 lecciones</b>. Los temas se abren <b>en orden</b>: termina un tema para abrir el siguiente.' },
      { mood: 'idea', t: '¿Cómo es una lección?', d: 'Cada lección sigue el mismo orden: <b>Goal → Speaking → Reading → Explanation → Practice → Oral task → Music → Homework</b>.<br><br>🔊 escucha · 🎤 habla (permite el micrófono) · <b>← Atrás</b> para corregir · tu avance se guarda solo.' },
      { sel: '#dict-fab', mood: 'present', t: 'Tu diccionario', d: '¿No entiendes una palabra? Toca aquí, <b>escríbela o dila en voz alta</b> (en español o inglés) y te doy la respuesta con su pronunciación.' },
      { sel: '#chat-tb', mood: 'present', t: 'Chat con tu profe', d: 'Con este botón le escribes a tu docente cuando tengas dudas. El botón del diccionario lo puedes <b>arrastrar</b> a donde quieras o <b>quitarlo</b> soltándolo en la ✕ del centro.' },
      { sel: '#final-b', mood: 'celebrate', t: 'Examen final', d: `Al terminar los ${M.MOD.topics} temas presentas el examen final. Si apruebas, ¡obtienes tu <b>certificado</b> del ${M.MOD.es}! 🎓` },
      { sel: '#menu-b', mood: 'watch', t: 'Menú', d: 'Aquí encuentras tu progreso, el código de acceso, el <b>recordatorio diario</b> y este tour por si quieres verlo otra vez.' },
      { mood: 'thumbs', t: '¡Listo! 🚀', d: 'Ya sabes todo lo necesario. Recuerda: un poquito cada día hace la diferencia. ' + (Object.values(S.parts).some(x => x.done) ? '¡Vamos a tu siguiente lección!' : '¡Vamos a tu primera lección!'), last: true },
    ];
    const ov = h(`<div id="tour"><div class="tour-hole"></div><div class="tour-card"></div></div>`); document.body.appendChild(ov);
    const hole = $('.tour-hole', ov), card = $('.tour-card', ov);
    let i = 0;
    const end = (start) => { ov.remove(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place); S.tourDone = true; save(); if (start) { M.confetti(2200); sfx('win'); const nu = nextUp(); if (nu && M.isUnlocked(nu.topic)) route('class', nu.id); } };
    function place() {
      const s = steps[i]; const el = s.sel && $(s.sel);
      if (!el) { hole.style.cssText = 'left:50%;top:40%;width:0;height:0'; card.classList.add('center'); card.style.cssText = ''; return; }
      card.classList.remove('center');
      const r = el.getBoundingClientRect(), pad = 8;
      hole.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
      const cw = Math.min(380, innerWidth - 24); const ch = card.offsetHeight || 220;
      let top = r.bottom + 16; if (top + ch > innerHeight - 10) top = Math.max(10, r.top - ch - 16);
      let left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), innerWidth - cw - 12);
      card.style.cssText = `left:${left}px;top:${top}px;width:${cw}px`;
    }
    function show() {
      const s = steps[i]; const el = s.sel && $(s.sel);
      card.innerHTML = `<div class="tour-in">${M.mascot('tour-mra', s.mood)}<div><div class="tour-n">${i + 1} / ${steps.length}</div><h3>${s.t}</h3><p>${s.d}</p></div></div>
        <div class="tour-bar"><button class="btn w sm" id="tskip">${s.last ? 'Cerrar' : 'Saltar tour'}</button><div class="grow"></div>${i ? '<button class="btn w sm" id="tprev">←</button>' : ''}<button class="btn k" id="tnext">${s.last ? '¡Empezar mi lección! →' : 'Siguiente →'}</button></div>`;
      $('#tskip', card).onclick = () => end(false);
      if (i) $('#tprev', card).onclick = () => { i--; show(); };
      $('#tnext', card).onclick = () => { if (s.last) end(true); else { i++; show(); } };
      if (el) { el.scrollIntoView({ block: 'center' }); setTimeout(place, 60); } else place();
      sfx('tap');
    }
    window.addEventListener('resize', place); window.addEventListener('scroll', place, { passive: true });
    show();
  }


  /* ---------------- CHAT CON MI PROFE (vista previa) ---------------- */
  function chatRoom() { if (!S.sid) { S.sid = 's' + Math.random().toString(36).slice(2, 10); save(); } return S.teacher ? window.M1CHAT.store.room(S.teacher.code, S.sid) : null; }
  function chatCard() {
    if (!window.M1CHAT) return '';
    const room = chatRoom(); const n = room ? M1CHAT.store.unread(room, S.sid) : 0;
    return `<div class="card chat-card">${M.mascot('mascot', 'present')}<div class="grow"><h3 style="margin:0 0 4px">💬 Chat con mi profe ${n ? `<span class="badge-n">${n}</span>` : ''}</h3>
      <p class="muted" style="margin:0 0 10px">${S.teacher ? `Escríbele a <b>${esc(S.teacher.name)}</b> cuando tengas una duda.` : 'Cuando te asignen un docente, podrás escribirle aquí tus dudas.'}</p>
      <button class="btn k sm" id="chat-b">${S.teacher ? 'Abrir chat →' : 'Conectar con mi docente →'}</button></div></div>`;
  }
  function openChat() {
    if (window.MRLIVE && window.MRAC && MRAC.code && MRAC.code()) return MRLIVE.openStudent();
    if ($('.player', app)) {
      const m = M.modal(`<div class="center">${M.mascot('mascot', 'present')}</div><h3 class="center">¿Ir al chat con tu profe?</h3><p class="muted center">Saldrás de la lección. Tu avance queda guardado y podrás continuar donde ibas.</p><div class="row" style="justify-content:center"><button class="btn k" id="cy">Ir al chat</button><button class="btn w" id="cn">Seguir en la lección</button></div>`);
      $('#cy', m).onclick = () => { m.remove(); route('chat'); }; $('#cn', m).onclick = () => m.remove(); return;
    }
    route('chat');
  }
  function chatFab() {
    if (!window.M1CHAT) return;
    const room = S.teacher ? chatRoom() : null; const n = room ? M1CHAT.store.unread(room, S.sid) : 0;
    const bd = $('#chat-n'); if (bd) { bd.textContent = n; bd.classList.toggle('hidden', !n); }
  }
  function chatScreen() {
    const CH = window.M1CHAT; if (!CH) return route('home');
    const demo = CH.demo ? `<div class="chat-demo">🧪 <b>Vista previa.</b> Por ahora los mensajes se guardan solo en este dispositivo. Muy pronto se conectará para hablar con tu docente desde cualquier lugar.</div>` : '';
    if (!S.teacher) {
      app.innerHTML = `<div class="wrap" style="max-width:640px"><div class="card center">${M.mascot('mascot bounce', 'present')}
        <h2 style="margin:8px 0 6px">💬 Chat con mi profe</h2><p class="muted">Escribe el <b>código de tu docente</b>. Te lo entrega la academia cuando te asignan tu profe.</p>
        <input class="inp" id="tcode" placeholder="Ej: PROFE-ANA" style="margin:8px 0 12px;text-transform:uppercase"><button class="btn k lg block" id="tgo">Conectar</button>
        <p class="muted" style="font-size:13px;margin-top:12px">¿No tienes código? Escríbenos por WhatsApp y te ayudamos.</p></div>${demo}
        <p class="center"><button class="btn w sm" id="back">← Volver al inicio</button></p></div>`;
      $('#back').onclick = () => route('home');
      const go = () => { const t = CH.findTeacher($('#tcode').value); if (!t) { $('#tcode').classList.add('wrong'); M.toast('Ese código no existe. Revísalo 🙏'); return; }
        S.teacher = { code: t.code, name: t.name }; save(); CH.store.ensure(chatRoom(), { student: S.name, sid: S.sid, teacher: t.code }); sfx('win'); chatScreen(); };
      $('#tgo').onclick = go; $('#tcode').onkeydown = e => { if (e.key === 'Enter') go(); };
      return;
    }
    const room = chatRoom(); CH.store.ensure(room, { student: S.name, sid: S.sid, teacher: S.teacher.code });
    const ini = S.teacher.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    app.innerHTML = `<div class="wrap" style="max-width:760px"><div class="card chat-wrap">
      <div class="chat-head"><button class="iconbtn dark" id="back" title="Volver">←</button><div class="av">${esc(ini)}</div><div class="grow"><b>${esc(S.teacher.name)}</b><small>Tu docente</small></div></div>
      ${demo}<div id="thread"></div></div></div>`;
    $('#back').onclick = () => route('home');
    CH.thread($('#thread'), room, S.sid, S.teacher.name);
  }

  /* ---------------- home ---------------- */
  function greeting() { const hr = new Date().getHours(); return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; }
  function nextUp() { return M.allParts().find(p => !(S.parts[p.id] && S.parts[p.id].done) && M.isUnlocked(p.topic)) || null; }
  function ageHome() { // 👧🧑‍🎤 v415: ruta compacta, homogénea con el perfil kids / teens
    const AG = M.ageGroup(), kids = AG === 'kids', pct = M.overallPct(), totP = M.totalParts(), rev = M.reviewMode();
    const doneN = M.allParts().filter(p => S.parts[p.id] && S.parts[p.id].done).length, nu = nextUp();
    const curId = (M.allParts().find(x => M.isUnlocked(x.topic) && S.parts[x.id] && !S.parts[x.id].done && S.parts[x.id].step) || nu || {}).id;
    const SK = [['listening', 'headphones', 'LISTEN'], ['reading', 'book', 'READ'], ['speaking', 'mic', 'SPEAK'], ['writing', 'pen', 'WRITE']];
    const G = kids ? ['#f59e0b,#ef4444', '#3b82f6,#6366f1', '#10b981,#0ea5e9', '#ec4899,#f97316', '#8b5cf6,#3b82f6', '#14b8a6,#22c55e', '#f43f5e,#f59e0b'] : ['#0B2A5B,#E3242B', '#1e3a8a,#0ea5e9', '#312e81,#7c3aed', '#0f766e,#0B2A5B', '#9f1239,#0B2A5B', '#1d4ed8,#0B2A5B', '#334155,#E3242B'];
    const cur = nu ? nu._t : D.topics[0];
    const tp = D.topics.map((t, i) => { const un = rev || M.isUnlocked(t.n); const dn = t.parts.filter(p => rev || (S.parts[p.id] && S.parts[p.id].done)).length;
      const th = `<div class="agr-th"><div class="agr-tn" style="--g:linear-gradient(135deg,${G[i % G.length]})${t.cover ? `;--img:url('${M.imgURL(t.cover, 160, 160)}')` : ''}"><span>${t.n}</span></div><div class="agr-tt"><b>${esc(t.title)}</b><small>${esc(t.es)}</small></div>${!un ? `<span class="agr-ok lk">${SVL}</span>` : dn ? `<span class="agr-ok">${MRI('check')}${dn}/${t.parts.length}</span>` : ''}</div>`;
      if (!un) return `<div class="agr-tp lk" data-lk="${t.n}" role="button" tabindex="0">${th}</div>`;
      return `<div class="agr-tp">${th}<div class="agr-ls">${t.parts.map(p => { const d = rev || (S.parts[p.id] && S.parts[p.id].done), st = M.partStars(p.id), c = p.id === curId && !d;
        return `<button class="agr-l${d ? ' d' : ''}${c ? ' c' : ''}" data-p="${p.id}"><span class="agr-ic">${MRI(d ? 'check' : 'play')}</span><span class="agr-lx"><b>LECCIÓN ${p.part}</b><small>${esc(p.title)}</small></span>${st ? `<span class="agr-st">${[1, 2, 3].map(k => `<i class="${k <= st ? 'on' : ''}">★</i>`).join('')}</span>` : ''}</button>`; }).join('')}</div></div>`; }).join('');
    const pg = (k) => `href="index.html" data-pgo="${k}"`;
    app.innerHTML = `<div class="agr ${AG}"><nav class="agr-side"><a ${pg('top')}>${MRI('compass')}<span>Inicio</span></a><a class="on" ${pg('learn')}>${MRI('book')}<span>Módulos</span></a>${MRAP.plan && MRAP.plan().premium ? `<a ${pg('cls')}>${MRI('video')}<span>Clases</span></a>` : ''}<a ${pg('me')}>${MRI('user')}<span>Cuenta</span></a></nav>
      <div class="agr-main"><section class="agr-hero ${AG}"><div class="agr-hx"><a class="agr-bk" href="index.html">${SVB}Mi perfil</a><h1>${esc(M.MOD.es)} · ${kids ? 'Mi aventura' : esc(M.MOD.levelEs || M.MOD.id)}</h1><small>${rev ? 'Superado · modo repaso' : `${doneN} de ${totP} lecciones`}${!rev && cur ? ` · ${kids ? 'Estación' : 'Tema'}: ${esc(cur.es)}` : ''}</small>
        <div class="agr-sk">${SK.map(([k, ic, nm]) => `<div>${MRI(ic)}<span>${nm}</span><i style="--w:${M.skillPct(k)}%"></i></div>`).join('')}</div>
        ${nu && !rev ? `<button class="agr-go" id="cont">${MRI('play')}${S.parts[nu.id] && S.parts[nu.id].step ? 'Continuar' : 'Empezar'}: ${esc(nu.title)}</button>` : ''}${!nu && MRAP.isTrial() ? '<button class="agr-go" id="buy3">' + MRI('unlock') + 'Desbloquear toda mi ruta</button>' : ''}</div>
        <div class="agr-hr"><img src="${kids ? 'mra-x-balloon1.webp' : 'mra-x-rocket.webp'}" alt="Mr. Arrieta" class="agr-mra"><div class="agr-rg" style="--p:${rev ? 100 : pct}"><b>${rev ? 100 : pct}%</b></div></div></section>
        ${pendingBlock().replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')}<div id="hwfb"></div>
        <div class="agr-sec"><h2>${kids ? 'Estaciones' : 'Temas'} del ${esc(M.MOD.es)}</h2><button class="agr-pr" id="prog">${MRI('target')}Mi progreso</button></div>
        <div class="agr-grid">${tp}</div>
        <div class="agr-ft"><span class="agr-fti">${MRI('award')}</span><div><b>Final Test</b><small>${S.final && S.final.passed ? 'Aprobado · ' + (S.final.best / 10).toFixed(1) + ' / 10' : M.finalUnlocked() ? (M.MOD.course ? '16 preguntas · 20 minutos' : '12 preguntas · 15 minutos') + ' · intentos ilimitados' : `Se abre al terminar las ${totP} lecciones`}</small></div><button class="agr-ftb" id="final-b">${M.finalUnlocked() ? 'Presentar' : SVL + ' ' + M.doneCount() + '/' + totP}</button>${S.final && S.final.passed ? `<button class="agr-ftb" id="cert-b">${MRI('grad')}Certificado</button>` : ''}</div>
      </div><nav class="agr-tab"><a ${pg('top')}>${MRI('compass')}<span>Inicio</span></a><a class="on" ${pg('learn')}>${MRI('book')}<span>Módulos</span></a>${MRAP.plan && MRAP.plan().premium ? `<a ${pg('cls')}>${MRI('video')}<span>Clases</span></a>` : ''}<a ${pg('me')}>${MRI('user')}<span>Cuenta</span></a></nav></div>`;
    $$('[data-pgo]', app).forEach(a => a.onclick = () => { try { sessionStorage.setItem('mra_pg', a.dataset.pgo); } catch (e) { } });
    $$('.agr-l', app).forEach(b => b.onclick = () => route('class', b.dataset.p));
    $$('.agr-tp.lk', app).forEach(b => b.onclick = () => lockGate(+b.dataset.lk));
    if ($('#cont')) $('#cont').onclick = () => route('class', nu.id); if ($('#buy3')) $('#buy3').onclick = trialModal;
    $('#prog').onclick = () => route('progress'); $('#final-b').onclick = () => M.finalUnlocked() ? route('final') : finalLockedModal(); if ($('#cert-b')) $('#cert-b').onclick = () => route('cert');
    $$('[data-hw]', app).forEach(b => b.onclick = () => route('hw', b.dataset.hw));
    const pt = $('#pend-t', app); if (pt) pt.onclick = () => { const l = $('#pend-l', app); const open = l.classList.toggle('hidden') === false; pt.textContent = `${open ? 'Ocultar' : 'Ver'} mis tareas pendientes (${pendingHW().length})`; sfx('tap'); };
    if ($('#rem-b')) $('#rem-b').onclick = reminderModal;
    if (window.MRTEACH && MRTEACH.on()) return;
    if (!(window.MRSRV && MRSRV.check({ mod: M.MOD.id, done: doneN, total: totP, review: rev }))) dailyReminder();
  }
  function home() { /* v458 · Diseño 2 «Continúa y explora»: tarjeta de continuar + temas con foto (todas las edades) */
    const pct = M.overallPct(); const nu = nextUp(); const first = (window.MRAP && MRAP.look().nick) || S.name.split(' ')[0];
    const doneN = M.allParts().filter(p => S.parts[p.id] && S.parts[p.id].done).length;
    const rev = M.reviewMode(), revN = M.revCount(), totP = M.totalParts();
    const revNext = rev ? (M.allParts().find(p => !(S.rev && S.rev[p.id])) || M.allParts()[0]) : null;
    const I = n => window.MRI ? MRI(n) : '';
    const curId = (M.allParts().find(x => M.isUnlocked(x.topic) && S.parts[x.id] && !S.parts[x.id].done && S.parts[x.id].step) || nu || {}).id;
    const curP = curId ? M.partById(curId) : null;
    const G = ['#7fa6d6,#2f5d99', '#f3c9a8,#c9714f', '#c9e3c4,#4f9152', '#f6dc9b,#cf9226', '#d9cdef,#7a5fb8', '#f2c4cf,#bb5571'];
    try { window.MRAGEIMG_apply && MRAGEIMG_apply(); } catch (e) { }
    const bg = (t, w, hh) => `background-image:${t.cover ? `url('${M.imgURL(t.cover, w, hh)}'),` : ''}linear-gradient(135deg,${G[(t.n - 1) % G.length]})`;
    const chip = window.MRAP && MRAP.get() ? (MRAP.isTrial() ? `<span class="t2-chip tr">${MRAP.plan && MRAP.plan().expired ? 'Plan vencido' : 'Acceso gratuito'}</span>` : MRAP.role(C.MODULE_ID || 'A1') === 'review' && !MRAP.isStaff() ? '<span class="t2-chip">Modo repaso</span>' : MRAP.isStaff() ? '<span class="t2-chip">Profe</span>' : '') : '';
    const arr = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    let cont = '';
    const cp = rev ? revNext : (curP || nu);
    if (cp) { const t = cp._t, td = t.parts.filter(x => S.parts[x.id] && S.parts[x.id].done).length;
      cont = `<section class="t2-cont"><div class="t2-ci" style="${bg(t, 720, 420)}"></div><div class="t2-cx"><span class="t2-k">${rev ? 'Modo repaso · ' + revN + ' de ' + totP + ' repasadas' : (S.parts[cp.id] && S.parts[cp.id].step) || doneN ? 'Continúa donde quedaste' : 'Empieza tu ruta'}</span><h2>${esc(t.title)}</h2><p>${PL(cp)} · ${esc(cp.title)}</p><div class="t2-cb"><i style="width:${rev ? Math.round(revN / totP * 100) : Math.round(td / t.parts.length * 100)}%"></i></div><button class="t2-go" id="${rev ? 'rev-go' : 'cont'}">${rev ? (revN ? 'Seguir repasando' : 'Empezar a repasar') : (S.parts[cp.id] && S.parts[cp.id].step) ? 'Continuar' : 'Empezar'}${arr}</button></div></section>`; }
    else if (window.MRAP && MRAP.isTrial()) cont = `<section class="t2-cont t2-end"><div class="t2-cx"><span class="t2-k">Acceso gratuito</span><h2>Desbloquea toda tu ruta</h2><p>Sigue aprendiendo con todas las lecciones del ${esc(M.MOD.es)}.</p><button class="t2-go" id="buy3">${I('unlock')}Desbloquear${arr}</button></div></section>`;
    else cont = `<section class="t2-cont t2-end"><div class="t2-cx"><span class="t2-k">${totP} de ${totP} lecciones</span><h2>¡Terminaste las lecciones!</h2><p>${S.final && S.final.passed ? 'Ya aprobaste el Final Test.' : 'Ya puedes presentar el Final Test.'}</p><button class="t2-go" id="tofinal">${I('award')}Final Test${arr}</button></div></section>`;
    app.innerHTML = `<div class="wrap t2">
      <div class="t2-head">${window.MRAP && MRAP.get() ? `<a class="t2-back" href="index.html">${SVB}Mi perfil</a>` : ''}<div class="t2-hx"><div><span class="t2-k">${esc(M.MOD.es)} · ${esc(M.MOD.levelEs || M.MOD.id)}</span>${chip}<h1>${greeting()}, ${esc(first)}</h1></div>
        <div class="t2-stats ringbox"><div><b>${rev ? 100 : pct}%</b><span>avance</span></div><div><b>${rev ? totP : doneN}/${totP}</b><span>lecciones</span></div><div><b>${S.streak.n || 0}</b><span>días seguidos</span></div></div></div></div>
      ${cont}
      <div id="hwfb"></div>
      <div class="t2-sec"><h2>Temas del ${esc(M.MOD.es)}</h2><div class="t2-tabs" role="tablist"><button class="on" data-f="all">Todos</button><button data-f="cur">En curso</button><button data-f="done">Completados</button></div><div class="t2-acts"><button class="t2-pr" id="prog">${I('target')}Mi progreso</button>${M.hasProfile() ? '' : `<button class="t2-pr" id="code">${I('unlock')}Código de acceso</button>`}</div></div>
      <div class="t2-grid" id="tgrid"></div><p class="t2-empty hidden"></p>
      <div class="t2-ft"><span class="t2-fti">${I('award')}</span><div class="t2-ftx"><b>Final Test</b><small>${S.final && S.final.passed ? 'Aprobado · ' + (S.final.best / 10).toFixed(1) + ' / 10' : M.finalUnlocked() ? `${M.MOD.course ? '16 preguntas · 20 minutos' : '12 preguntas · 15 minutos'} · intentos ilimitados · apruebas con ${(C.PASS_SCORE / 10).toFixed(1)}` : `Se abre al terminar las ${totP} lecciones`}</small></div>${S.final && S.final.passed ? `<button class="t2-ftb w" id="cert-b">${I('grad')}Certificado</button>` : ''}<button class="t2-ftb" id="final-b">${M.finalUnlocked() ? 'Presentar' : SVL + ' ' + M.doneCount() + '/' + totP}</button></div>
      <p class="center fx-foot" style="margin-top:22px;font-size:13.5px;grid-column:1/-1;font-weight:600">¡Aprende inglés HABLANDO!<br><a class="foot-wa" href="https://wa.me/${esc(C.WHATSAPP)}?text=${encodeURIComponent((window.MRNE || String)('¡Hola, mrarrieta.com! Soy ' + (S.name || 'estudiante') + '. Tengo una pregunta.'))}" target="_blank" rel="noopener">WhatsApp ${esc(C.WHATSAPP.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'))}</a></p>
    </div>`;
    const g = $('#tgrid');
    const ok = '<svg class="t2-s ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>', pend = '<svg class="t2-s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>';
    D.topics.forEach(t => {
      const un = rev || M.isUnlocked(t.n); const dn = t.parts.filter(p => rev || (S.parts[p.id] && S.parts[p.id].done)).length, tp = Math.round(dn / t.parts.length * 100);
      const st8 = dn === t.parts.length ? 'done' : (dn || t.parts.some(p => p.id === curId)) && un ? 'cur' : 'new';
      const card = h(`<div class="t2c${un ? '' : ' lk'}" data-st="${st8}"><div class="t2-pic" style="${bg(t, 640, 300)}"><span class="t2-n">${t.n}</span>${un ? `<span class="t2-ring" style="--p:${tp}"><b>${tp}%</b></span>` : `<span class="t2-ring lk">${SVL}</span>`}<div class="t2-pt"><h3>${esc(t.title)}</h3><small>${esc(t.es)}</small></div></div><div class="t2-ls"></div></div>`);
      t.parts.forEach(p => {
        const pd = S.parts[p.id], d = rev || (pd && pd.done), stars = M.partStars(p.id), c = !rev && p.id === curId && !d;
        let right = '';
        if (rev) { const rv = S.rev && S.rev[p.id]; right = rv && rv.d ? `<em class="t2-tag">Repasada</em>${ok}` : rv ? '<span class="t2-now">REPASANDO</span>' : pend; }
        else right = c ? '<span class="t2-now">AHORA</span>' : d ? `${stars ? `<span class="t2-st">${[1, 2, 3].map(i => `<i class="${i <= stars ? 'on' : ''}">★</i>`).join('')}</span>` : ''}${ok}` : pend;
        const b = h(`<button class="t2-l${c ? ' now' : ''}${d ? ' d' : ''}"><i class="t2-li">${p.part}</i><span class="t2-lt">${esc(p.title)}</span><span class="t2-r">${right}</span></button>`);
        b.onclick = () => un ? route('class', p.id) : lockGate(t.n); $('.t2-ls', card).appendChild(b);
      });
      if (!un) { $('.t2-pic', card).onclick = () => lockGate(t.n); card.setAttribute('role', 'button'); }
      g.appendChild(card);
    });
    const emp = $('.t2-empty', app);
    $$('.t2-tabs button', app).forEach(bt => bt.onclick = () => { $$('.t2-tabs button', app).forEach(x => x.classList.toggle('on', x === bt)); const f = bt.dataset.f; let n = 0; $$('.t2c', g).forEach(cd => { const sh = f === 'all' || cd.dataset.st === f; cd.style.display = sh ? '' : 'none'; if (sh) n++; }); emp.textContent = f === 'done' ? 'Todavía no has completado un tema. ¡Vas por buen camino!' : 'No tienes temas en curso ahora.'; emp.classList.toggle('hidden', !!n); sfx('tap'); });
    if ($('#cont')) $('#cont').onclick = () => route('class', nu.id);
    if ($('#rev-go')) $('#rev-go').onclick = () => route('class', revNext.id);
    hwFbBlock();
    if ($('#tofinal')) $('#tofinal').onclick = () => route('final');
    if ($('#buy2')) $('#buy2').onclick = unlockModal; if ($('#buy3')) $('#buy3').onclick = trialModal;
    $('#prog').onclick = () => route('progress'); if ($('#code')) $('#code').onclick = unlockModal;
    $('#final-b').onclick = () => M.finalUnlocked() ? route('final') : finalLockedModal();
    if ($('#cert-b')) $('#cert-b').onclick = () => route('cert');
    $$('[data-hw]', app).forEach(b => b.onclick = () => route('hw', b.dataset.hw));
    const cb = $('#chat-b', app); if (cb) cb.onclick = () => route('chat');
    const pt = $('#pend-t', app); if (pt) pt.onclick = () => { const l = $('#pend-l', app); const open = l.classList.toggle('hidden') === false; pt.innerHTML = `📋 ${open ? 'Ocultar' : 'Ver'} mis tareas pendientes (${pendingHW().length}) ${open ? '▴' : '▾'}`; sfx('tap'); };
    if ($('#rem-b')) $('#rem-b').onclick = reminderModal;
    if (window.MRTEACH && MRTEACH.on()) return;
    if (!S.tourDone) setTimeout(tour, 700); else if (!(window.MRSRV && MRSRV.check({ mod: M.MOD.id, done: doneN, total: totP, review: rev }))) dailyReminder(); // ⭐ opinión de la escuela (mitad y final del módulo)
  }

  /* ---------------- tareas pendientes + recordatorio diario ---------------- */
  function pendingHW() { return []; } // v434: la escritura se hace dentro de la lección; ya no hay tareas pendientes (ni avisos, ni correos)
  // 📋 v417: las tareas pendientes ya no ocupan la página de la ruta: viven en el menú (con un aviso en el botón)
  function hwList() { const pend = pendingHW(); const m = M.modal(`<h3>Mis tareas pendientes (${pend.length})</h3><p class="muted">Hacer tu tarea es lo que más te ayuda a recordar lo que aprendiste. ¡Solo te toma 5 minutos!</p><div class="pend-list">${pend.map(p => `<button class="partbtn" data-hw="${p.id}"><span class="t">${esc(p._t.title)} · ${PL(p)}<small>${esc(p.hw.es)}</small></span><span class="btn sm k" style="pointer-events:none">Hacer tarea →</span></button>`).join('')}</div>`, { x: true });
    $$('[data-hw]', m).forEach(b => b.onclick = () => { m.remove(); route('hw', b.dataset.hw); }); }
  function hwBadge() { try { const b = $('#menu-b'); const n = pendingHW().length; if (b && n && !b.querySelector('.hwb')) { b.style.position = 'relative'; b.insertAdjacentHTML('beforeend', `<i class="hwb">${n}</i>`); } } catch (e) { } }
  function pendingBlock() {
    const pend = pendingHW();
    if (!pend.length) return `<div class="card remind-card"><div class="grow"><b>🔔 ¿Quieres que te recuerde practicar todos los días?</b><div class="muted" style="font-size:14px">Agrega un recordatorio diario a tu celular en 10 segundos.</div></div><button class="btn sm" id="rem-b">Activar recordatorio</button></div>`;
    return `<div class="card pending-card">${M.mascot('mascot', 'point')}<div class="grow"><span class="lbl r">Tarea pendiente</span>
      <h3 style="font-size:22px;margin:8px 0 4px">${esc(S.name.split(' ')[0])}, tienes ${pend.length} ${pend.length === 1 ? 'tarea pendiente' : 'tareas pendientes'} ✍️</h3>
      <p class="muted" style="margin:0 0 10px">Hacer tu tarea es lo que más te ayuda a recordar lo que aprendiste. ¡Solo te toma 5 minutos!</p>
      <button class="btn k" id="pend-t">📋 Ver mis tareas pendientes (${pend.length}) ▾</button>
      <div class="pend-list hidden" id="pend-l" style="margin-top:10px">${pend.map(p => `<button class="partbtn" data-hw="${p.id}"><span class="t">${esc(p._t.title)} · ${PL(p)}<small>${esc(p.hw.es)}</small></span><span class="btn sm k" style="pointer-events:none">Hacer tarea →</span></button>`).join('')}</div>
      <div style="margin-top:10px"><button class="btn sm w" id="rem-b">🔔 Recordarme todos los días</button></div></div></div>`;
  }
  function hwFbBlock() {
    const box = $('#hwfb', app); if (box) box.innerHTML = ''; return; // ✍️ sin feedback de profes: la plataforma revisa cada tarea al instante
    const draw = () => { if (!box.isConnected) return;
      const rows = M.allParts().filter(p => p.hw && S.hw[p.id] && S.hw[p.id].sent).map(p => ({ p, fb: hwFeedback(p.id) }));
      if (!rows.length) { box.innerHTML = ''; return; }
      box.innerHTML = `<div class="card ce-hwsum"><span class="lbl">✍️ Mis tareas</span><h3>Tareas entregadas a tu profe</h3>${rows.map(({ p, fb }) => `<div class="ce-hwrow"><div class="grow"><b>${esc(p._t.title)} · ${PL(p)}</b><small>${fb.length ? '💬 ' + esc(fb[fb.length - 1].teacher || 'Tu profe') + ': ' + esc(fb[fb.length - 1].feedback || '') : '⏳ Tu profe la está revisando'}</small></div><button class="btn sm w" data-hw="${p.id}">Ver</button></div>`).join('')}</div>`;
      $$('[data-hw]', box).forEach(b => b.onclick = () => route('hw', b.dataset.hw)); };
    draw(); MRAC.me().then(draw).catch(() => { });
  }
  function dailyReminder() {
    try { const n = pendingHW().length; if (n > 3 && window.MRAC && MRAC.code && MRAC.code()) MRAC.call('hwRemind', { code: MRAC.code(), n }).catch(() => { }); } catch (e) { } // 🔔 más de 3 tareas pendientes
    const pend = pendingHW(); const t = new Date().toISOString().slice(0, 10);
    if (!pend.length || S.remindDay === t) return;
    S.remindDay = t; save();
    if (window.Notification && Notification.permission === 'granted') { try { new Notification('📚 Mr. Arrieta', { body: `Tienes ${pend.length} tarea(s) pendiente(s) en el ${M.MOD.es}. ¡Vamos!`, icon: 'mra-point.webp' }); } catch (e) { } }
    setTimeout(() => {
      const m = M.modal(`<div class="center">${M.mascot('mascot', 'watch')}</div><h3 class="center">¡Hola, ${esc(S.name.split(' ')[0])}! 👋</h3>
        <p class="center" style="font-size:17px">Te recuerdo que tienes <b>${pend.length} ${pend.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}</b>.<br>Hazla ahora y suma puntos ⚡</p><p class="muted center ce-ptsline">${esc(M.PTS_TIP)}</p>
        <div style="display:grid;gap:10px"><button class="btn k block lg" id="go">✍️ Hacer mi tarea ahora</button><button class="btn w block" id="later">Más tarde</button></div>`);
      $('#go', m).onclick = () => { m.remove(); route('hw', pend[0].id); }; $('#later', m).onclick = () => m.remove();
    }, 600);
  }
  function reminderModal() {
    const url = location.href.split('#')[0].split('?')[0];
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'watch')}</div><h3 class="center">🔔 Recordatorio diario</h3>
      <p class="muted center">Elige la hora y agrega el recordatorio a tu calendario. Te llegará una alerta todos los días para practicar y hacer tu tarea.</p>
      <label style="font-weight:800">Hora</label><input type="time" class="inp" id="rt" value="${esc(S.remindTime || C.REMINDER_TIME || '19:00')}" style="margin:6px 0 12px">
      <div style="display:grid;gap:10px"><a class="btn k block" id="gcal" target="_blank" rel="noopener" style="text-decoration:none">📅 Agregar a Google Calendar (Android)</a>
      <button class="btn block" id="ics">📲 Descargar para iPhone / Outlook</button>
      ${window.Notification && Notification.permission !== 'granted' ? '<button class="btn w block" id="notif">🔔 Activar avisos en este navegador</button>' : ''}
      <button class="btn w block" id="close">Cerrar</button></div>`);
    const build = () => { const [hh, mm] = ($('#rt', m).value || '19:00').split(':'); S.remindTime = `${hh}:${mm}`; save();
      const d = new Date(); d.setDate(d.getDate() + (d.getHours() * 60 + d.getMinutes() >= (+hh) * 60 + (+mm) ? 1 : 0));
      const ymd = d.toISOString().slice(0, 10).replace(/-/g, ''); const st = `${ymd}T${hh}${mm}00`; const en = `${ymd}T${hh}${String(Math.min(59, +mm + 15)).padStart(2, '0')}00`;
      const title = '📚 Mr. Arrieta: practica inglés y haz tu tarea'; const det = `¡Es hora de practicar! Entra al ${M.MOD.es}: ${url}`;
      $('#gcal', m).href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(det)}&dates=${st}/${en}&recur=${encodeURIComponent('RRULE:FREQ=DAILY')}`;
      return { st, en, title, det }; };
    build(); $('#rt', m).onchange = build;
    $('#ics', m).onclick = () => { const e = build(); const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//mrarrieta.com//Modulo1//ES', 'BEGIN:VEVENT', 'UID:m1-' + Date.now() + '@mrarrieta.com', 'DTSTAMP:' + now, 'DTSTART:' + e.st, 'DTEND:' + e.en, 'RRULE:FREQ=DAILY', 'SUMMARY:' + e.title, 'DESCRIPTION:' + e.det, 'URL:' + url, 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + e.title, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      const a2 = document.createElement('a'); a2.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a2.download = 'recordatorio-mrarrieta.ics'; a2.click(); M.toast('Ábrelo para agregarlo a tu calendario 📅'); };
    if ($('#notif', m)) $('#notif', m).onclick = async () => { const r = await Notification.requestPermission(); M.toast(r === 'granted' ? '¡Avisos activados! 🔔' : 'No se activaron los avisos'); };
    $('#close', m).onclick = () => m.remove();
  }
  async function homeworkOnly(id) {
    const p = M.partById(id); if (!p || !p.hw) return route('home');
    app.innerHTML = `<div class="player"><div class="phead"><button class="x" title="Salir">✕</button><div class="prog"><i style="width:50%"></i></div></div><div class="stage"></div></div>`;
    $('.x', app).onclick = () => route('home');
    const r = await homework($('.stage', app), p);
    if (r && r.t) { M.addSkill('writing', r.c, r.t); const gain = r.c * 10 + 20; S.xp += gain; save(); sfx('win'); M.confetti(1500); M.toast(`¡Tarea entregada! +${gain} puntos ⚡`); }
    route('home');
  }
  function tipOfDay() { const t = ['Tip: escucha y repite en voz alta 🗣️', 'Tip: usa el 📖 diccionario cuando no entiendas algo', 'Tip: graba tu voz y compárala 🎙️', 'Tip: estudia 15 min cada día 🔥', 'Tip: escribe tus tareas en inglés ✍️']; return t[new Date().getDay() % t.length]; }

  /* ---------------- unlock ---------------- */
  function unlockModal() {
    const wa = `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent((window.MRNE || String)(C.BUY_MESSAGE + (S.name ? ` (Soy ${S.name})` : '')))}`;
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'present')}</div><h3 class="center">🔓 Desbloquea el ${M.MOD.es}</h3>
      <p class="muted center">Ingresa el código de acceso que te dio tu profe.</p>
      <input class="inp" id="cd" placeholder="Ej: ABC-123" autocapitalize="characters" style="margin:8px 0 12px">
      <button class="btn k block lg" id="ok">Desbloquear</button>
      <p class="center" style="margin:16px 0 6px;font-weight:700">¿Aún no tienes código?</p>
      <a class="btn block" style="text-decoration:none;background:#25D366;color:#fff" target="_blank" rel="noopener" href="${wa}">💬 Comprar acceso por WhatsApp</a>`, { x: true });
    const i = $('#cd', m); i.focus();
    const go = () => { const r = M.redeem(i.value); if (!r) { i.classList.add('wrong'); sfx('bad'); setTimeout(() => i.classList.remove('wrong'), 500); M.toast('Código no válido 😕'); return; }
      m.remove(); sfx('win'); M.confetti(); M.toast(r.review ? '👨‍🏫 Modo revisión activado en este dispositivo' : r.topics === 'all' ? '¡Módulo activado! Los temas se abren a medida que avanzas 🎉' : '¡Temas desbloqueados! 🎉'); route('home'); };
    $('#ok', m).onclick = go; i.onkeydown = e => { if (e.key === 'Enter') go(); };
  }

  // ¿Por qué está bloqueado? progreso (debe terminar el tema anterior) o acceso (código)
  function progressModal(n) {
    const prev = D.topics.find(t => t.n < n && !t.parts.every(x => S.parts[x.id] && S.parts[x.id].done)) || D.topics.find(t => t.n === n - 1);
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'pointside')}</div><h3 class="center">🔒 Este tema aún no está abierto</h3>
      <p class="center" style="font-size:17px">Primero termina <b>Topic ${prev.n} · ${esc(prev.title)}</b><br>(Lesson 1 y Lesson 2). ¡Así aprendes paso a paso! 💪</p>
      <button class="btn k block lg" id="gp">▶ Ir al Topic ${prev.n}</button><button class="btn w block" style="margin-top:8px" id="cl">Cerrar</button>`, { x: true });
    $('#cl', m).onclick = () => m.remove();
    $('#gp', m).onclick = () => { m.remove(); const p = prev.parts.find(x => !(S.parts[x.id] && S.parts[x.id].done)) || prev.parts[0]; if (M.isUnlocked(prev.n)) route('class', p.id); else lockGate(prev.n); };
  }
  function paceModal(n) {
    const d = M.paceDate(n), t = D.topics.find(x => x.n === n); const dt = new Date(d + 'T00:00:00');
    const f = dt.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'watch')}</div><h3 class="center">📅 Tu próximo tema se abre pronto</h3>
      <p class="center" style="font-size:17px"><b>Topic ${n} · ${esc(t ? t.title : '')}</b> se abre el <b>${esc(f)}</b>.</p>
      <p class="center">Tu curso avanza paso a paso para que aprendas de verdad. Mientras tanto, repasa los temas que ya viste y, si eres Premium, aprovecha tus clases individuales. 💪</p>
      <p class="center muted" style="font-size:14px">Te avisaremos por correo y en tu campanita 🔔 el día que se abra.</p>
      <button class="btn k block lg" id="cl">Entendido</button>`, { x: true });
    $('#cl', m).onclick = () => m.remove();
  }
  function masteryModal(n) {
    const weak = M.weakParts(n), prev = D.topics.find(x => x.n === n - 1);
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'think')}</div><h3 class="center">🎯 ¡Casi! Necesitas ${MRAP.PACE_MIN}% para avanzar</h3>
      <p class="center" style="font-size:17px">Para abrir el Topic ${n}, aprueba el <b>Topic ${prev.n} · ${esc(prev.title)}</b> con ${MRAP.PACE_MIN}% o más en sus dos partes.</p>
      <div style="display:grid;gap:8px;margin:12px 0">${weak.map(p => `<button class="btn w block" data-p="${p.id}">🔁 Repetir ${PL(p)}: ${esc(p.title)} · tu mejor: ${S.parts[p.id].best}%</button>`).join('')}</div>
      <button class="btn k block" id="cl">Cerrar</button>`, { x: true });
    $('#cl', m).onclick = () => m.remove();
    m.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { m.remove(); route('class', b.dataset.p); });
  }
  function lockGate(n) { const r = M.lockReason(n); if (r === 'pace') paceModal(n); else if (r === 'mastery') masteryModal(n); else if (r === 'progress') progressModal(n); else if (r === 'trial') trialModal(); else if (r === 'access') unlockModal(); else if (r === 'module') location.href = 'index.html'; }
  function trialModal() {
    if (window.MRPLANS) return MRPLANS.modal(M);
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'present')}</div><h3 class="center">🟢 Fin de tu acceso gratuito</h3>
      <p class="center" style="font-size:17px">Tu acceso gratuito incluye los <b>2 primeros temas</b> de tu ruta. ¿Te gustó la experiencia? <b>Inscríbete</b> y sigue aprendiendo con todos los temas, el examen final y tu certificado 🎓</p>
      <a class="btn block" style="text-decoration:none;background:#25D366;color:#fff" target="_blank" rel="noopener" href="https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent((window.MRNE || String)(`¡Hola! Soy ${S.name}. Empecé gratis en la plataforma y quiero inscribirme 🚀`))}">💬 Quiero inscribirme</a>
      <button class="btn w block" style="margin-top:8px" id="cl">Seguir explorando</button>`, { x: true });
    $('#cl', m).onclick = () => m.remove();
  }
  function finalLockedModal() {
    const d = M.doneCount(), tot = M.totalParts();
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'watch')}</div><h3 class="center">🔒 Examen final bloqueado</h3>
      <p class="center" style="font-size:17px">Para presentar el examen y obtener tu <b>certificado</b> debes terminar <b>todas las lecciones</b> del ${M.MOD.es}.</p>
      <div class="fl-prog"><i style="width:${Math.round(d / tot * 100)}%"></i></div><p class="center" style="font-weight:800;margin:6px 0 14px">${d} de ${tot} lecciones completadas</p>
      <button class="btn k block lg" id="cl">¡Seguir estudiando! 🚀</button>`, { x: true });
    $('#cl', m).onclick = () => { m.remove(); const nu = nextUp(); if (nu) route('class', nu.id); };
  }

  /* =================================================================
     CLASS — estructura: GOAL · SPEAKING · READING · REVIEW · EXPLANATION
     · LISTEN & PRACTICE · PRACTICE · ORAL TASK · MUSIC · HOMEWORK
     ================================================================= */
  // Cada lección tiene su propia combinación de juegos para que ninguna se sienta igual
  const PLAN = {
    t1p1: ['learn', 'bubblePop', 'clockGreet', 'matchLines', 'sayPop', 'fill', 'quizShow', 'speakWords'], t1p2: ['learn', 'dialogue', 'chatReply', 'oddOneOut', 'unscramble', 'spinWheel', 'speak'],
    t2p1: ['learn', 'catchWord', 'simonLetters', 'typeLetter', 'spell', 'raceGame'], t2p2: ['learn', 'spellName', 'plateGame', 'dialogue', 'spell', 'catchWord'],
    t3p1: ['learn', 'catchWord', 'passport', 'wordSearch', 'crossword', 'sayPop', 'speak'], t3p2: ['learn', 'matchLines', 'airport', 'sort', 'spinWheel', 'typeWord', 'speak'],
    t4p1: ['learn', 'bubblePop', 'bingo', 'typeNumber', 'raceGame', 'phone', 'speak'], t4p2: ['learn', 'catchWord', 'colorMix', 'hangman', 'unscramble', 'sayPop', 'speakWords'],
    t5p1: ['learn', 'fill', 'slotBe', 'quizShow', 'unscramble', 'sayPop', 'speak'], t5p2: ['learn', 'sort', 'whackAn', 'fill', 'raceGame', 'speak'],
    t6p1: ['learn', 'catchWord', 'riddleJob', 'wordSearch', 'crossword', 'spinWheel', 'speak'], t6p2: ['learn', 'dialogue', 'elevator', 'sort', 'raceGame', 'unscramble', 'speak'],
    t7p1: ['learn', 'hangman', 'familyTree', 'memory', 'sayPop', 'matchLines', 'speak'], t7p2: ['learn', 'bubblePop', 'animalSounds', 'sort', 'raceGame', 'oddOneOut'],
    t8p1: ['learn', 'catchWord', 'restaurant', 'fill', 'wordSearch', 'spinWheel', 'speak'], t8p2: ['learn', 'sort', 'market', 'memory', 'hangman', 'sayPop', 'oddOneOut'],
    t9p1: ['learn', 'raceGame', 'dayFlip', 'fill', 'wordSearch', 'speak'], t9p2: ['learn', 'quizShow', 'specialDates', 'spell', 'catchWord', 'dialogue'],
    t10p1: ['learn', 'matchLines', 'weatherTV', 'spinWheel', 'typeSentence', 'bubblePop', 'speak'], t10p2: ['learn', 'catchWord', 'suitcase', 'memory', 'sort', 'hangman', 'sayPop'],
    t11p1: ['learn', 'raceGame', 'flashlight', 'spell', 'wordSearch', 'crossword', 'oddOneOut'], t11p2: ['learn', 'quizShow', 'housePlan', 'sort', 'spinWheel', 'unscramble', 'speak'],
    t12p1: ['learn', 'catchWord', 'pluralMachine', 'sort', 'plural', 'matchLines', 'speakWords'], t12p2: ['learn', 'memory', 'magicMirror', 'plural', 'raceGame', 'bubblePop'],
    t13p1: ['learn', 'fill', 'nearFar', 'matchLines', 'unscramble', 'sayPop', 'speak'], t13p2: ['learn', 'sort', 'theseRush', 'fill', 'dialogue', 'catchWord', 'speak'],
    t14p1: ['learn', 'fill', 'countRoom', 'catchWord', 'unscramble', 'typeSentence', 'speak'], t14p2: ['learn', 'fill', 'memoryRoom', 'dialogue', 'raceGame', 'spinWheel', 'speak'],
  };

  // v434: lección corta (10–13 min) para TODAS las edades
  try { localStorage.removeItem('mra_v9'); } catch (e) { }
  const V9 = () => true;
  function buildSteps9(p) { // orden aprobado: Goal → Speaking (repaso) → Explanation → Practice → Reading → Mission → Music → Writing
    window.__V9 = true;
    const st = [{ sec: 'Goal', k: 'goal' }];
    if (M.prevPart(p)) st.push({ sec: 'Speaking', k: 'review' });
    st.push({ sec: 'Explanation', k: 'learn' });
    if (p.keyq) st.push({ sec: 'Practice', k: 'keyq' });
    const acts = (C.PLAN || PLAN)[p.id] || p.acts;
    const AGG = M.ageGroup() !== 'adult' && window.MRAGE2 ? MRAGE2.gamesFor(p) : []; // Kids/Teens: su juego propio de la edad
    const g = (window.MRAGE2 && MRAGE2.game9For && MRAGE2.game9For(p)) || AGG[0] || acts.find(a => !['learn', 'speak', 'speakWords'].includes(a)); if (g) st.push({ sec: 'Practice', k: g }); // v435: juego corto y divertido de su edad
    if (p.reading) st.push({ sec: 'Reading', k: 'reading' });
    if (missionFor(p)) st.push({ sec: 'Mission', k: 'mission' });
    if (songFor(p) || (M.ageGroup() !== 'adult' && window.MRAGE2 && MRAGE2.musicFor(p))) st.push({ sec: 'Music', k: 'music' });
    if (p.hw) st.push({ sec: 'Writing', k: 'hw' });
    return st;
  }
  function buildSteps(p) {
    window.__V9 = false; if (V9()) return buildSteps9(p);
    const st = [];
    st.push({ sec: 'Goal', k: 'goal' });
    if (p.vocab && p.vocab.length) st.push({ sec: 'Speaking', k: 'warmGame' });
    if (p.warm) st.push({ sec: 'Speaking', k: 'warm' });
    if (p.reading) st.push({ sec: 'Reading', k: 'reading' });
    if (M.prevPart(p)) st.push({ sec: 'Review', k: 'review' });
    st.push({ sec: 'Explanation', k: 'learn' });
    if (p.keyq) st.push({ sec: 'Listen & practice', k: 'keyq' });
    const acts = (C.PLAN || PLAN)[p.id] || p.acts;
    const AGG = M.ageGroup() !== 'adult' && window.MRAGE2 ? MRAGE2.gamesFor(p) : []; // 👧🧑‍🎤 v407: juegos propios de su edad (mismas palabras de la lección)
    (AGG.length ? AGG : acts.filter(a => !['learn', 'speak', 'speakWords'].includes(a))).forEach(a => st.push({ sec: 'Practice', k: a }));
    const sp = acts.find(a => a === 'speak' || a === 'speakWords') || (p.sentences ? 'speak' : 'speakWords');
    if (M.ageGroup() === 'kids' && (p.sentences || []).filter(s => s.img && s.au).length >= 3) st.push({ sec: 'Practice', k: 'kidsTap' }); // 👆 escucha y toca la foto
    if (!p.letters) st.push({ sec: 'Oral task', k: sp });
    else st.push({ sec: 'Oral task', k: 'speakLetters' });
    if (missionFor(p)) st.push({ sec: 'Mission', k: 'mission' }); // 🎯 misión según el objetivo del estudiante
    if (songFor(p) || (M.ageGroup() !== 'adult' && window.MRAGE2 && MRAGE2.musicFor(p))) st.push({ sec: 'Music', k: 'music' });
    if (p.hw) st.push({ sec: 'Homework', k: 'hw' });
    return st;
  }

  /* ---------- transición divertida entre secciones de la lección ---------- */
  const SCENES = { rocket: { a: 'up', say: 'Blast off!' }, drums: { a: 'stage', say: 'Rock on!' }, guitar: { a: 'stage', say: "Let's rock!" },
    surf: { a: 'surf', say: 'Catch the wave!' }, hero: { a: 'fly', say: 'Super English!' }, balloon1: { a: 'balloon', say: 'Up, up and away!' }, balloon2: { a: 'balloon', say: "Let's explore!" }, balloon3: { a: 'balloon', say: 'Here we go!' }, laptop: { a: 'pop', say: 'Homework time!' }, wave: { a: 'pop', say: 'Hello!' }, rocket3: { a: 'up', say: 'Full speed!' }, rocket5: { a: 'up', say: 'To the moon!' }, 'plane-red': { a: 'fly', say: 'Ready for takeoff!' }, 'plane-blue': { a: 'fly', say: 'Great job!' }, 'plane-yellow': { a: 'fly', say: 'This way!' }, 'plane-green': { a: 'fly', say: 'Keep flying!' } };
  // 🎯 misión del tema según el objetivo (solo en la última parte del tema y si el estudiante eligió objetivo)
  function missionFor(p) { try { const g = window.MRGOAL && MRGOAL.get(); if (!g || !window.MRMISSIONS) return null; const x = MRMISSIONS[(+M.MOD.n || 1) + '-' + p.topic]; const L = x && x[g.k]; if (!L) return null; const arr = Array.isArray(L) ? L : [L]; const k = Math.max(0, (+p.part || 1) - 1) * 2; const two = arr.slice(k, k + 2); return two.length ? { k: g.k, list: two } : null; } catch (e) { return null; } }
  const SEC_IC = { Goal: '🎯', Mission: '🚀', Speaking: '🗣️', Reading: '📖', Review: '🔁', Explanation: '💡', 'Listen & practice': '🎧', Practice: '🎮', 'Oral task': '🎤', Music: '🎵', Homework: '📝' };
  const SEC_ICO = { Writing: 'pen', Goal: 'target', Mission: 'rocket', Speaking: 'chat', Reading: 'book', Review: 'repeat', Explanation: 'bulb', 'Listen & practice': 'headphones', Practice: 'game', 'Oral task': 'mic', Music: 'music', Homework: 'pen' };
  const SEC_MRI = s => window.MRI ? MRI(SEC_ICO[s] || 'star') + MRI('check', 'ok') : '';
  const SEC_SC = { Reading: 'balloon2', Homework: 'laptop', Music: 'guitar', Review: 'plane-blue' };
  const FREE = ['rocket', 'balloon1', 'plane-red', 'rocket3', 'balloon3', 'plane-blue', 'drums', 'plane-yellow', 'balloon2', 'surf', 'rocket5', 'plane-green', 'hero'];
  const ITL_ON = true;
  let sceneN = Math.floor(Math.random() * FREE.length);
  const preloadScenes = () => Object.keys(SCENES).forEach(k => { const i = new Image(); i.src = 'mra-x-' + k + '.webp?v=7'; });
  // v420: Mr. Arrieta dice algo acorde a cómo le fue en la sección (nunca "Great job!" si se equivocó)
  const ITL_FB = { hi: [['Great job!', 'a88a2d51d2', '¡Lo hiciste muy bien!'], ['Excellent!', '54f1859c38', '¡Excelente trabajo!'], ['Awesome!', '98561b5346', '¡Increíble!'], ['Well done!', 'b93b9f5f0f', '¡Muy bien hecho!']],
    mid: [['Nice work!', 'aa2b15da71', 'Vas bien. Al final repasa lo que fallaste.']], lo: [['Not quite. You can do it!', '8b4c184411', 'No pasa nada: equivocarse es parte de aprender. ¡Sigue!']] };
  let itlLast = '';
  function interlude(next, perf, info) { /* v482 · transición mejorada: resultado real, avance, mitad/última, sin tocar la cabeza ni las letras */
    return new Promise(res => {
      const k = SEC_SC[next] || FREE[sceneN++ % FREE.length], sc0 = SCENES[k];
      const band = perf == null ? null : perf >= .8 ? 'hi' : perf >= .5 ? 'mid' : 'lo';
      let fbx = null; if (band) { const L = ITL_FB[band].filter(x => x[0] !== itlLast); fbx = (L.length ? L : ITL_FB[band])[Math.floor(Math.random() * (L.length || ITL_FB[band].length))]; itlLast = fbx[0]; }
      const sad = band === 'lo' ? 'mra-sad' + (1 + Math.floor(Math.random() * 3)) + '.webp' : null;
      const sc = fbx ? Object.assign({}, sad ? { a: 'pop' } : sc0, { say: fbx[0] }) : sc0;
      const I9 = info || {}, tot = +I9.total || 0, st = +I9.step || 0;
      let nick = ''; try { const pp = window.MRAP && MRAP.get && MRAP.get(); nick = ((MRAP.look && MRAP.look().nick) || (pp && pp.first) || '').trim().split(/\s+/)[0]; } catch (e) { }
      const useName = nick && band === 'hi' && st && st % 3 === 0;
      const sayTxt = useName ? sc.say.replace(/!$/, ', ' + nick + '!') : sc.say;
      const resTxt = I9.t ? (band === 'lo' ? 'Sigue intentando, ¡tú puedes!' : `${I9.c} de ${I9.t} en ${I9.sec}`) : '';
      const special = tot >= 4 && st ? (st === tot ? '¡Última! Ya casi terminas' : st === Math.ceil(tot / 2) ? '¡Vas por la mitad!' : '') : '';
      const dots = tot ? `<span class="itl-dots">${Array.from({ length: tot }, (_, j) => `<i class="${j < st - 1 ? 'd' : j === st - 1 ? 'c' : ''}"></i>`).join('')}</span><span class="itl-pso">Paso ${st} de ${tot}</span>` : '';
      const ov = h(`<div class="itl itl9 itl-${sc.a}" role="status">${sc.a === 'stage' ? '<div class="itl-lights"></div>' : ''}
        <div class="itl-top">${special ? `<span class="itl-tag">${esc(special)}</span>` : ''}<div class="itl-say"><b>${esc(sayTxt)}</b>${resTxt ? `<small>${esc(resTxt)}</small>` : ''}</div></div>
        <div class="itl-mid"><div class="itl-actor ${sad ? 'itl-k-sad' : 'itl-k-' + k}"><img class="itl-img" src="${sad || 'mra-x-' + k + '.webp?v=7'}" alt="Mr. Arrieta"></div></div>
        <div class="itl-next"><small>NEXT</small><b>${window.MRI ? MRI(SEC_ICO[next] || 'star') : ''} ${esc(next.toUpperCase())}</b><i>Toca para continuar</i>${dots}</div></div>`);
      document.body.appendChild(ov); try { sfx('win'); } catch (e) { }
      if (fbx) { try { const id = fbx[1]; if (M.ageGroup() === 'adult') setTimeout(() => !done && play(id), 380); else M.fbf().then(() => setTimeout(() => !done && play(window.AUD && window.AUD['fb_' + id] ? 'fb_' + id : id), 380)); } catch (e) { } } else
      try { if (M.ageGroup() !== 'adult') { const sayIt = () => { if (!done && window.AUD && window.AUD['itl_' + k]) play('itl_' + k); }; setTimeout(() => { if (window.AUD && window.AUD['itl_' + k]) sayIt(); else M.fbf().then(sayIt); }, 380); } } catch (e) { }
      let done = false; const end = () => { if (done) return; done = true; ov.classList.add('out'); setTimeout(() => { ov.remove(); res(); }, 250); };
      ov.onclick = end; setTimeout(end, 2300);
    });
  }
  /* ---------- volver atrás: ver lo que respondió y corregir ---------- */
  let curRun = null, snaps_ = {};
  function snapHTML(stage) {
    try {
      stage.querySelectorAll('input,textarea,select').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') { if (el.checked) el.setAttribute('checked', ''); else el.removeAttribute('checked'); }
        else if (el.tagName === 'TEXTAREA') el.textContent = el.value;
        else if (el.tagName === 'SELECT') [...el.options].forEach(o => o.selected ? o.setAttribute('selected', '') : o.removeAttribute('selected'));
        else el.setAttribute('value', el.value);
      });
      return stage.innerHTML;
    } catch (e) { return ''; }
  }
  function showSnap(stage, i, s) {
    return new Promise(res => {
      const R = curRun && curRun.res && curRun.res[i];
      stage.innerHTML = `<div class="snap-bar">👀 <div><b>Así respondiste esta parte</b><small>${esc(s.sec)}${R && R.t ? ` · ${R.c} de ${R.t} correctas` : ''}</small></div></div>
        <div class="snap">${snaps_[i] || ''}</div>
        ${R && R.missed && R.missed.length ? `<div class="lesson snap-miss"><h3>🔁 Para repasar</h3>${R.missed.slice(0, 8).map(m => `<div class="row" style="gap:8px;align-items:center;margin:4px 0">${m.au ? `<button class="btn w sm" data-au="${esc(m.au)}">🔊</button>` : ''}<span>${esc(m.en || '')}</span></div>`).join('')}</div>` : ''}
        <div class="actionbar"><button class="btn w" id="sn-redo">✏️ Corregir (hacerlo de nuevo)</button><button class="btn k lg" id="sn-next">Continuar →</button></div>`;
      stage.querySelectorAll('[data-au]').forEach(b => b.onclick = () => play(b.dataset.au));
      $('#sn-redo', stage).onclick = () => res('redo'); $('#sn-next', stage).onclick = () => res('next');
    });
  }
  async function runClass(id) {
    const p = M.partById(id);
    if (!M.isUnlocked(p.topic)) { route('home'); return lockGate(p.topic); }
    const revM = M.reviewMode(); if (revM) { S.rev = S.rev || {}; if (!S.rev[id]) { S.rev[id] = { s: Date.now() }; save(); } }
    app.innerHTML = `<div class="wrap center ld-load"><img class="ld-load-mra" src="mra-x-${({ kids: 'rocket4', teens: 'rocket5' })[M.ageGroup()] || 'rocket3'}.webp?v=2" alt="Mr. Arrieta"><h2 class="ld-ready">Are you ready?</h2><div class="ld-count"></div><p class="ld-load-t muted"></p></div>`; try { if (S.vib !== false && navigator.vibrate) navigator.vibrate([40, 60, 40]); } catch (e) { } /* v468: el cohete solo vibra; el logo suena al entrar a la plataforma y al terminar la lección */
    // 🚀 conteo 1, 2, 3 mientras carga; en el 3 Mr. Arrieta sale volando y dice GO!
    const lt = $('.ld-load-t', app), cd = $('.ld-count', app), rk = $('.ld-load-mra', app); let loaded = false;
    const pv = M.prevPart(p); const loadP = M.loadAudio(['common', 'keyq9_' + (+M.MOD.n || 1), 'kq10_' + (+M.MOD.n || 1) + '_' + p.topic, ...(pv && pv.topic !== p.topic ? ['kq10_' + (+M.MOD.n || 1) + '_' + pv.topic] : []), ...(window.M2AGE_ON ? ['a2' + window.M2AGE_ON[0]] : []), ...(window.MYAGE_ON && (+M.MOD.n || 1) >= 3 ? ['y' + M.MOD.n + window.MYAGE_ON[0] + p.topic].concat(pv ? ['y' + M.MOD.n + window.MYAGE_ON[0] + pv.topic] : []) : []), ...[].concat(M.MOD.games || []), M.MOD.audio + p.topic].concat(pv ? [M.MOD.audio + pv.topic] : []).concat(missionFor(p) ? ['gm' + (+M.MOD.n || 1) + 't' + p.topic + (/^[vte]$/.test(missionFor(p).k) ? '' : missionFor(p).k)] : []).concat(window.M1AGE_ON && (+M.MOD.n || 1) === 1 ? [(window.M1AGE_ON === 'kids' ? 'ka' : 'ta') + p.topic].concat(pv ? [(window.M1AGE_ON === 'kids' ? 'ka' : 'ta') + pv.topic] : []) : [])).then(() => { loaded = true; }, () => { loaded = true; });
    const pop = (t) => { cd.textContent = t; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); };
    for (const t of ['1', '2', '3']) { pop(t); try { sfx('tap'); } catch (e) { } await new Promise(r => setTimeout(r, 750)); }
    if (!loaded) { lt.textContent = 'Preparando tu lección…'; await loadP; lt.textContent = ''; }
    pop('GO!'); cd.classList.add('go'); if (rk) rk.classList.add('fly'); try { sfx('win'); } catch (e) { } await new Promise(r => setTimeout(r, 1000));
    const steps = buildSteps(p); const secs = [...new Set(steps.map(s => s.sec))];
    const rec = S.parts[id] = S.parts[id] || { done: false, stars: 0, best: 0 };
    let startAt = 0;
    if (!rec.done && rec.step && rec.step < steps.length && rec.run) {
      const ok = await new Promise(r => { const m = M.modal(`<h3>¿Continuar donde quedaste?</h3><p class="muted">Ibas en la sección <b>${esc(steps[rec.step].sec)}</b>.</p><div class="row"><button class="btn k" id="y">Sí, continuar</button><button class="btn w" id="n">Empezar de nuevo</button></div>`); $('#y', m).onclick = () => { m.remove(); r(true); }; $('#n', m).onclick = () => { m.remove(); r(false); }; });
      if (ok) startAt = Math.max(rec.step, (rec.run && rec.run.max) || 0);
    }
    const run = (startAt && rec.run && !Array.isArray(rec.run.res)) ? rec.run : { res: {}, xp: 0 };
    app.innerHTML = `<div class="player"><div class="phead"><button class="x" title="Salir">✕</button><button class="back" title="Volver al paso anterior">← Atrás</button><div class="prog"><i style="width:0%"></i></div><div class="pstep"><b></b><small></small></div></div>
      <div class="ptopic">📍 Estás en: <b>Topic ${p.topic} · ${esc(p._t.title)}</b> — ${PL(p)}: ${esc(p.title)} <span class="psec"></span>${revM ? `<span class="ce-revchip">🔁 Repasando: ${M.revCount()} de ${M.totalParts()} lecciones</span>` : ''}</div>
      <button class="resume hidden">⏩ Continuar donde quedé</button>
      <div class="secbar rt">${secs.map((s, n) => `${n ? '<em class="rt-ln"></em>' : ''}<span data-s="${esc(s)}"><i>${SEC_MRI(s)}</i><b>${esc(s)}</b></span>`).join('')}</div><div class="stage"></div></div>`;
    $('.x', app).onclick = () => { stop(); route('home'); };
    const player = $('.player', app);
    setTimeout(() => { try { if (document.body.contains(player)) M.confetti && M.confetti(2500); } catch (e) { } }, 700); // 🎉 papelitos ya dentro de la lección
    let navBack = null, navJump = null;
    $('.back', app).onclick = () => { if (navBack) { sfx('tap'); navBack(); } };
    $('.resume', app).onclick = () => { if (navJump) { sfx('tap'); navJump(); } };
    // si el estudiante se fue un rato, Mr. Arrieta le recuerda en qué tema y sección está
    let lastAct = Date.now(), hiddenAt = 0, curSec = '', curI = 0;
    const where = () => { if (!app.contains(player) || $('.modal') || $('#tour')) return;
      const m = M.modal(`<div class="center">${M.mascot('mascot', 'watch')}</div><h3 class="center">¡Hola de nuevo, ${esc(S.name.split(' ')[0])}! 👋</h3>
        <p class="center" style="font-size:17px">Estás en <b>Topic ${p.topic} · ${esc(p._t.title)}</b><br>${PL(p)}: ${esc(p.title)}<br>Sección: <b>${esc(curSec)}</b> (paso ${curI + 1} de ${steps.length})</p>
        <button class="btn k block lg" id="wb">¡Seguir donde iba! →</button>`);
      $('#wb', m).onclick = () => m.remove(); };
    const act = () => { if (Date.now() - lastAct > 4 * 60 * 1000) where(); lastAct = Date.now(); };
    const vis = () => { if (document.hidden) hiddenAt = Date.now(); else if (hiddenAt && Date.now() - hiddenAt > 90 * 1000) { hiddenAt = 0; where(); lastAct = Date.now(); } };
    ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, act, true)); document.addEventListener('visibilitychange', vis);
    const cleanup = () => { ['pointerdown', 'keydown'].forEach(ev => document.removeEventListener(ev, act, true)); document.removeEventListener('visibilitychange', vis); };
    preloadScenes(); let i = startAt; const snaps = {}; let revisit = false; curRun = run; snaps_ = snaps;
    while (i < steps.length) {
      const s = steps[i];
      rec.step = i; rec.run = run; save();
      // fresh stage element for every step (so going back never mixes old and new activities)
      const old = $('.stage', player); const stage = document.createElement('div'); stage.className = 'stage'; old.replaceWith(stage);
      $('.prog i', app).style.width = (i / steps.length * 100) + '%';
      $('.back', app).disabled = i === 0;
      run.max = Math.max(run.max || 0, i); curSec = s.sec; curI = i;
      $('.psec', app).textContent = '· ' + s.sec; { const ps = $('.pstep', app); if (ps) { $('b', ps).textContent = s.sec; $('small', ps).textContent = 'Paso ' + (i + 1) + ' de ' + steps.length; } }
      $('.resume', app).classList.toggle('hidden', i >= run.max);
      $$('.secbar span', app).forEach(e => { const k = secs.indexOf(e.dataset.s), ck = secs.indexOf(s.sec); e.className = k === ck ? 'on' : k < ck ? 'ok' : ''; const ln = e.previousElementSibling; if (ln && ln.classList.contains('rt-ln')) ln.classList.toggle('ok', k <= ck); if (k === ck) e.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const back = new Promise(res => { navBack = () => res('__back'); navJump = () => res('__jump'); });
      let r;
      const AGS = M.ageGroup() !== 'adult' && window.MRAGE2 && MRAGE2[s.k]; // 👧🧑‍🎤 v406: Kids y Teens viven el repaso y la explicación a su manera
      const runIt = () => Promise.race([(AGS ? (st2, pp) => Promise.resolve(MRAGE2[s.k](st2, pp)).then(r => r === null ? (STEP[s.k] || ((a2, b2) => A[s.k](a2, b2)))(st2, pp) : r) : (STEP[s.k] || ((st2, pp) => A[s.k](st2, pp))))(stage, p), back]);
      try {
        if (revisit && snaps[i]) { // volvió atrás: mostrar lo que respondió para que pueda corregir
          const ch = await Promise.race([showSnap(stage, i, s), back]);
          if (ch === 'redo') { stage.innerHTML = ''; r = await runIt(); } else r = ch;
        } else r = await runIt();
      } catch (e) { console.error(s.k, e); r = null; }
      navBack = null; navJump = null;
      if (!app.contains(player)) { cleanup(); return; } // user left
      if (r === '__jump') { stop(); const sh0 = $('#sheet'); if (sh0) sh0.remove(); i = run.max; continue; }
      const sh = $('#sheet'); if (sh) sh.remove();
      if (r === 'next') { save(); i++; revisit = i < run.max; continue; }
      if (r === '__back') {
        stop(); revisit = true;
        // volver a revisar: el resultado anterior se conserva (solo se reemplaza si vuelve a hacer el ejercicio)
        i = Math.max(0, i - 1);
        continue;
      }
      if (r && r.t) {
        const prevR = run.res[i]; if (prevR) { M.addSkill(prevR.skill, -prevR.c, -prevR.t); run.xp -= prevR.c * 10; S.xp -= prevR.c * 10; }
        run.res[i] = { k: s.k, sec: s.sec, ...r, missed: (r.missed || []).map(x => ({ en: x.en || x.w || x.full || x.s, au: x.au })) };
        M.addSkill(r.skill, r.c, r.t); const gain = r.c * 10; run.xp += gain; S.xp += gain; if (gain) M.xpFly(gain); topbar();
      }
      snaps[i] = snapHTML(stage); revisit = false;
      save();
      i++;
      if (ITL_ON && i < steps.length && steps[i].sec !== s.sec && app.contains(player)) { const RS = Object.values(run.res || {}).filter(x => x && x.sec === s.sec && x.t); const rc = RS.reduce((a, x) => a + x.c, 0), rt = RS.reduce((a, x) => a + x.t, 0); await interlude(steps[i].sec, rt ? rc / rt : null, { c: rc, t: rt, sec: s.sec, step: i + 1, total: steps.length }); } // v420: el mensaje depende de cómo le fue
    }
    $('.prog i', app).style.width = '100%'; cleanup();
    results(p, run);
  }

  /* ---------- class steps ---------- */
  /* 🎙️ LECTURA EN VOZ ALTA (opcional): el estudiante lee el texto, la plataforma lo escucha y va marcando cada palabra que dijo bien.
     Alineación palabra por palabra (tolera pausas, repeticiones y errores pequeños). En computador además graba su voz para escucharse. */
  const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const rNorm = (w) => { w = String(w).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, ''); if (/^\d+$/.test(w) && +w <= 20) w = NUMW[+w]; return w; };
  const lev = (a, b) => { if (a === b) return 0; const m = a.length, n = b.length; if (!m || !n) return m || n; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; };
  const rSame = (a, b) => { if (!a || !b) return false; if (a === b) return true; const x = a.replace(/'/g, ''), y = b.replace(/'/g, ''); if (x === y) return true; if (x.length >= 4 && y.length >= 4 && lev(x, y) <= (Math.max(x.length, y.length) >= 7 ? 2 : 1)) return true; return (x + 's' === y || y + 's' === x) && x.length >= 3; };
  function readAloud(box, btn, res) {
    if (!btn) return; const words = $$('.rw', box); const target = words.map(w => rNorm(w.textContent)); const N = target.filter(Boolean).length;
    const touch = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); let sess = null, rec = null, stream = null, chunks = [], url = '', auto = null, maxT = null;
    const align = (txt) => { // marca las palabras dichas en orden; busca hasta 8 palabras adelante si el estudiante se saltó alguna
      const said = String(txt).split(/\s+/).map(rNorm).filter(Boolean); let p = 0; const ok = new Array(target.length).fill(false);
      said.forEach(w => { for (let k = p; k < Math.min(target.length, p + 8); k++) { if (!target[k]) continue; if (rSame(w, target[k])) { ok[k] = true; p = k + 1; return; } } });
      words.forEach((el, i) => el.classList.toggle('ok', ok[i])); const last = ok.lastIndexOf(true); words.forEach((el, i) => el.classList.toggle('cur', i === last + 1)); return { ok, last };
    };
    const finish = (txt) => {
      clearTimeout(auto); clearTimeout(maxT); btn.classList.remove('playing'); btn.innerHTML = '🎙️ Leer otra vez <small>(opcional)</small>'; box.classList.remove('rv-on');
      const { ok } = align(txt || ''); const good = ok.filter(Boolean).length; const pct = N ? Math.round(good / N * 100) : 0;
      words.forEach((el, i) => { el.classList.remove('cur'); el.classList.toggle('miss', !!target[i] && !ok[i]); });
      const miss = [...new Set(target.filter((w, i) => w && !ok[i]))].slice(0, 8);
      res.hidden = false; res.className = 'rv-res ' + (pct >= 85 ? 'g' : pct >= 60 ? 'm' : 'b');
      res.innerHTML = `<b>${pct >= 85 ? '¡Excelente lectura!' : pct >= 60 ? '¡Muy bien! Sigue practicando' : 'Buen intento: léela otra vez con calma'}</b> · leíste bien <b>${pct}%</b> de las palabras (${good} de ${N}).` +
        (miss.length ? `<div class="rv-miss">Practica: ${miss.map(w => { const d = w === 'i' ? 'I' : w.replace(/^i'/, "I'"); return `<button type="button" data-w="${esc(d)}">🔊 ${esc(d)}</button>`; }).join('')}</div>` : '') + (url ? `<div style="margin-top:8px"><button type="button" class="btn w sm" id="rv-me">▶ Escucharme</button></div>` : '');
      $$('[data-w]', res).forEach(b => b.onclick = () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(b.dataset.w); u.lang = 'en-US'; u.rate = .85; speechSynthesis.speak(u); } catch (e) { } });
      const me = $('#rv-me', res); if (me) me.onclick = () => { stop(); const a = M.trackAudio(new Audio(url)); a.play(); };
      if (pct >= 85) sfx('win'); else sfx('ok');
    };
    const stopAll = () => { if (sess) { const s = sess; sess = null; s.onend = () => finish(s.text()); s.stop(); } try { rec && rec.state !== 'inactive' && rec.stop(); } catch (e) { } };
    btn.onclick = async () => {
      if (btn.classList.contains('playing')) { stopAll(); return; }
      stop(); res.hidden = true; words.forEach(el => el.classList.remove('ok', 'miss', 'cur')); if (url) { URL.revokeObjectURL(url); url = ''; }
      if (!M.canSR && !navigator.mediaDevices) { M.toast('Tu navegador no permite usar el micrófono. Usa Google Chrome.'); return; }
      btn.classList.add('playing'); btn.innerHTML = '⏹ Terminar lectura'; box.classList.add('rv-on'); sfx('tap');
      if (!touch || !M.canSR) { try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); window.MRAWAVE && MRAWAVE.stream(stream); rec = new MediaRecorder(stream); chunks = []; rec.ondataavailable = e => chunks.push(e.data); rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); if (chunks.length) url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })); if (!M.canSR) finish(''); }; rec.start(); } catch (e) { rec = null; } }
      if (!M.canSR) { if (!rec) { btn.classList.remove('playing'); btn.innerHTML = '🎙️ Léela en voz alta <small>(opcional)</small>'; box.classList.remove('rv-on'); M.toast('Activa el permiso del micrófono para leer en voz alta.'); } else M.toast('Grabando… tu navegador no evalúa la voz, pero podrás escucharte.'); return; }
      sess = M.srSession((txt) => { const { last } = align(txt); clearTimeout(auto); if (last >= target.length - 2) auto = setTimeout(stopAll, 1500); }, (err) => { sess = null; try { rec && rec.stop(); } catch (e) { } btn.classList.remove('playing'); btn.innerHTML = '🎙️ Léela en voz alta <small>(opcional)</small>'; box.classList.remove('rv-on'); M.toast(/not-allowed|service/.test(err) ? 'Activa el permiso del micrófono para leer en voz alta.' : 'No se pudo usar el micrófono. Inténtalo de nuevo.'); });
      if (!sess) return; maxT = setTimeout(stopAll, 180000);
    };
  }

  /* ---------- oraciones de una lectura: no corta en a.m. / p.m., Mr. / Mrs. / Dr., iniciales ni números ---------- */
  function splitSents(t) {
    t = String(t || ''); const parts = t.match(/[^.!?]+[.!?]+["”]?\s*/g) || [t]; const out = []; let cur = '';
    const ABR = /(^|[\s"“'(])(a\.m\.|p\.m\.|mr\.|mrs\.|ms\.|dr\.|st\.|jr\.|sr\.|e\.g\.|i\.e\.|etc\.|vs\.|u\.s\.|[a-z]\.)$/i;
    parts.forEach((p, i) => { cur += p; const last = i === parts.length - 1, nx = last ? '' : parts[i + 1].trimStart(), q = (cur.match(/["“”]/g) || []).length;
      if (!last && (!/\s$/.test(p) || ABR.test(cur.trimEnd()) || q % 2 === 1 || /^[a-z]/.test(nx))) return; out.push(cur); cur = ''; });
    if (cur) out.push(cur); const used = out.join(''); if (used.length < t.length) out.push(t.slice(used.length));
    return out.filter(s => s.trim());
  }
  /* ---------- Fase 6: lectura por edad (Teens = chat · Kids = cuento en viñetas) ---------- */
  function ageReading(box, r, sents, AG) {
    const txt = $('.txt', box), spans = $$('.s', txt), ph = $('.ph', box);
    box.classList.add('rd-' + AG);
    if (AG === 'teens') {
      const stg = box.closest('.stage'); if (stg) stg.classList.add('dk');
      const nm = (r.text.match(/\bI'm ([A-Z][a-zá-ú]+)/) || [])[1] || '';
      const chat = h(`<div class="rd-chat"><div class="rd-chd"><span class="rd-gav">${window.MRI ? MRI('users') : ''}</span><div><b>${esc(r.title)}</b><small>${nm ? esc(nm) + ' · ' : ''}chat de grupo</small></div></div><div class="rd-msgs"></div></div>`);
      const box2 = $('.rd-msgs', chat);
      if (ph) { const im = h(`<div class="rd-msg rd-img"></div>`); im.appendChild(ph); box2.appendChild(im); }
      let who = nm || '', last = null;
      spans.forEach(sp => {
        const m = sp.textContent.trim().match(/^([A-Z][A-Za-z]+):\s/); if (m) { who = m[1]; const w0 = $('.rw', sp); if (w0 && w0.textContent === m[1] + ':') w0.classList.add('rd-who'); }
        const me = /^(Me|Yo)$/.test(who), wrap = h(`<div class="rd-msg ${me ? 'me' : 'ot'}">${who && who !== last ? `<i>${esc(who)}</i>` : ''}</div>`);
        wrap.appendChild(sp); box2.appendChild(wrap); last = who;
      });
      txt.innerHTML = ''; txt.appendChild(chat);
      return;
    }
    // kids: viñetas con audio propio (se reproduce el tramo de la lectura que corresponde)
    const n = Math.min(4, spans.length), per = Math.ceil(spans.length / n), lens = sents.map(s => s.length), tot = lens.reduce((x, y) => x + y, 0);
    const COL = ['#f59e0b', '#38bdf8', '#fb7185', '#4ade80'];
    const grid = h(`<div class="rd-comic"></div>`); let acc = 0;
    for (let k = 0; k < n; k++) {
      const grp = spans.slice(k * per, (k + 1) * per); if (!grp.length) break;
      const st = acc / tot; grp.forEach((_, j) => acc += lens[k * per + j]); const en = acc / tot;
      const pan = h(`<div class="rd-pan" style="--pc:${COL[k % 4]}"><div class="rd-ph"><b>${k + 1}</b><button class="rd-pp" type="button" aria-label="Escuchar viñeta ${k + 1}">${window.MRI ? MRI('vol') : '▶'}</button></div><p></p></div>`);
      grp.forEach(sp => $('p', pan).appendChild(sp));
      $('.rd-pp', pan).onclick = (e) => { e.stopPropagation(); stop(); sfx('tap'); const a = M.trackAudio(new Audio(M.audioSrc(r.au)));
        $$('.rd-pan', grid).forEach(x => x.classList.remove('on')); pan.classList.add('on');
        const go = () => { try { a.currentTime = st * a.duration; } catch (er) { } a.play(); };
        a.ontimeupdate = () => { if (a.duration && a.currentTime >= en * a.duration - 0.05) { a.pause(); pan.classList.remove('on'); } };
        a.addEventListener('pause', () => pan.classList.remove('on'));
        if (a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once: true }); window.__ra = a; };
      grid.appendChild(pan);
    }
    txt.innerHTML = ''; txt.appendChild(grid);
  }
  // v443: aviso de micrófono (2 consejos): sale en las 3 primeras lecciones y si la plataforma no lo escucha 2 veces seguidas
  const MICK = (k => !k || k === 'A1' ? 'mra_mic9' : 'mra_mic9_' + k)(((window.M1 || {}).MOD || {}).id); // v475: el aviso sale en las 3 primeras lecciones de CADA módulo
  const micSt = () => { try { return JSON.parse(localStorage.getItem(MICK) || '{}'); } catch (e) { return {}; } };
  const micSave = (o) => { try { localStorage.setItem(MICK, JSON.stringify(o)); } catch (e) { } };
  let micOpen = false, micAgain = false;
  function micTips(force) {
    const st = micSt(); if (st.off || micOpen || (!force && (st.n || 0) >= 3) || (force && micAgain) || !M.canSR) return Promise.resolve();
    if (force) micAgain = true; else { st.n = (st.n || 0) + 1; micSave(st); }
    micOpen = true; const AG = M.ageGroup();
    const T = AG === 'kids' ? { img: 'mra-wink', h: '¡Mr. Arrieta te quiere oír!', sub: 'Antes de jugar, haz esto:', t1: 'Busca un lugar tranquilo', d1: 'Sin TV ni música. ¡Shhh!', t2: 'Habla cerquita del teléfono', d2: 'Con tu voz normal, ni gritando ni muy bajito.', go: '¡Listo, a jugar!' }
      : AG === 'teens' ? { img: 'mra-point', h: 'Pro tip antes de hablar', sub: 'Así tu voz se reconoce mejor.', t1: 'Cero ruido', d1: 'Busca un lugar tranquilo, sin música ni gente hablando.', t2: 'Teléfono cerca', d2: 'A un palmo de tu boca. Habla claro, con voz normal.', go: 'Got it, ¡vamos!' }
      : { img: 'mra-idea', h: 'Para que te escuche bien', sub: force ? 'No te escuché bien. Revisa esto:' : 'En esta lección vas a hablar en inglés.', t1: 'Busca un lugar sin ruido', d1: 'Sin TV, música ni personas hablando cerca.', t2: 'Acerca el teléfono a tu boca', d2: 'A un palmo de distancia, y habla con voz normal y clara.', go: force ? 'Entendido' : '¡Entendido, empezar!' };
    const I1 = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>', I2 = '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/><path d="M3 9c1 1 1 5 0 6M20.5 8c1.5 2 1.5 6 0 8"/></svg>';
    return new Promise(res => {
      const ov = h(`<div class="mic9 mic9-${AG}" role="dialog" aria-modal="true"><div class="mic9-md"><img class="mic9-mr" src="${T.img}.webp" alt="Mr. Arrieta"><h2>${esc(T.h)}</h2><div class="mic9-sub">${esc(T.sub)}</div>
        <div class="mic9-tip"><span class="mic9-ic">${I1}</span><div><span class="mic9-n">1</span><b>${esc(T.t1)}</b><small>${esc(T.d1)}</small></div></div>
        <div class="mic9-tip"><span class="mic9-ic">${I2}</span><div><span class="mic9-n">2</span><b>${esc(T.t2)}</b><small>${esc(T.d2)}</small></div></div>
        <button type="button" class="mic9-go">${esc(T.go)}</button><label class="mic9-chk"><input type="checkbox"> No volver a mostrar</label></div></div>`);
      document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('in'));
      $('.mic9-go', ov).onclick = () => { if ($('.mic9-chk input', ov).checked) { const s2 = micSt(); s2.off = 1; micSave(s2); } sfx('tap'); ov.classList.remove('in'); setTimeout(() => { ov.remove(); micOpen = false; res(); }, 200); };
    });
  }
  window.addEventListener('mra-nohear2', () => micTips(true));
  /* v484 · todo cabe en pantalla: si la actividad es más alta que la pantalla, se ajusta (zoom suave, nunca menos de 78%) */
  (function fit9() {
    let st = null, key = '', z = 1, ro = null, raf = 0;
    const MIN = () => innerWidth < 700 ? .8 : .74;
    const run = () => { raf = 0; if (!st || !st.isConnected) return; const k = ((st.querySelector('h2') || {}).textContent || '') + '|' + ((st.querySelector('.hd .lbl') || {}).textContent || '');
      if (k !== key) { key = k; z = 1; st.style.zoom = ''; }
      const r = st.getBoundingClientRect(), topDoc = r.top + scrollY, avail = innerHeight - Math.max(0, topDoc) - 10; if (avail < 240) return;
      const nat = r.height / z; const nz = Math.max(MIN(), Math.min(1, avail / nat));
      if (nz < z - .01 || nz > z + .04) { z = Math.round(nz * 100) / 100; st.style.zoom = z >= .995 ? '' : z; } };
    const sched = () => { if (!raf) raf = requestAnimationFrame(run); };
    const attach = () => { const s2 = document.querySelector('.player .stage'); if (s2 === st) { sched(); return; } st = s2; key = ''; z = 1; if (ro) ro.disconnect(); if (st && window.ResizeObserver) { ro = new ResizeObserver(sched); ro.observe(st); } sched(); };
    const mo = new MutationObserver(() => attach()); const go = () => { const app = document.getElementById('app'); if (app) mo.observe(app, { childList: true, subtree: true }); attach(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
    addEventListener('resize', () => { z = 1; if (st) st.style.zoom = ''; key = ''; sched(); });
  })();
  window.M1ITL = (n, perf, info) => interlude(n, perf, info); // (pruebas)
  const STEP = {
    goal: async (stage, p) => {
      const prev = M.prevPart(p);
      if (V9()) { // v461 · «Raspa y descubre»: goal corto («Hoy vas a poder…») + 2 frases; se revela en menos de 2 s
        const AGg = M.ageGroup(), GL = window.MRGL10 && MRGL10[(+M.MOD.n || 1) + '-' + p.id], G0 = GL && (GL[AGg] || GL.adult);
        const g = p.goal || { en: p.title, es: p.es };
        const can = G0 ? G0.can : g.es, PH = G0 ? G0.p : [];
        const VOL = window.MRI ? MRI('vol') : '';
        stage.innerHTML = `<div class="gs ${AGg}"><div class="gs-k"><b>${esc(p._t.title)}</b>Topic ${p.topic} · ${esc(PL(p))}</div>
          <div class="gs-card"><div class="gs-in"><span class="gs-l">Hoy vas a poder</span><div class="gs-can">${esc(can)}</div>${PH.length ? `<div class="gs-ps">${PH.map((x, i) => `<button type="button" class="gs-p" data-i="${i}"><b>${esc(x[0])}</b><span>${VOL}</span></button>`).join('')}</div>` : ''}</div>
          <canvas class="gs-cv"></canvas><div class="gs-hint"><span class="gs-seal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span><b>Tu meta de hoy</b><small>Raspa con el dedo para descubrirla</small></div></div>
          ${prev && !(S.parts[prev.id] && S.parts[prev.id].done) ? `<p class="gs-prev">Te recomendamos completar primero: ${esc(prev._t.title)} · ${PL(prev)}</p>` : ''}
          <button type="button" class="gs-go" disabled>Empezar</button></div>`;
        const card = $('.gs-card', stage), cv = $('.gs-cv', stage), hint = $('.gs-hint', stage), go = $('.gs-go', stage);
        const playP = (i) => { const x = PH[i]; if (x && x[1]) { stop(); play(x[1]); } };
        $$('.gs-p', stage).forEach(b => b.onclick = () => playP(+b.dataset.i));
        M.loadAudio(['gl' + (+M.MOD.n || 1) + '_' + p.topic]).catch(() => { });
        let doneF = false;
        const reveal = () => { if (doneF) return; doneF = true; cv.style.opacity = 0; hint.style.opacity = 0; setTimeout(() => cv.remove(), 450); card.classList.add('on'); go.disabled = false; try { if (!M.brand || !M.brand('ok')) sfx('ok'); } catch (e) { } try { if (S.vib !== false && navigator.vibrate) navigator.vibrate(30); } catch (e) { } setTimeout(() => playP(0), 650); };
        try {
          const r = card.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr); const x = cv.getContext('2d'); x.scale(dpr, dpr);
          /* v471 · diseño A «papel de seguridad»: fondo claro con trama fina (guilloché) */
          x.fillStyle = '#f7f8fa'; x.fillRect(0, 0, r.width, r.height); x.lineWidth = 1;
          for (let k = 0; k < 2; k++) { const cx = k ? r.width : 0, cy = k ? r.height : 0; x.strokeStyle = k ? '#e9ecf2' : '#e1e5ec'; for (let rr = 10; rr < Math.hypot(r.width, r.height); rr += 10) { x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2); x.stroke(); } }
          x.strokeStyle = '#d9dee6'; x.lineWidth = 2; x.strokeRect(1, 1, r.width - 2, r.height - 2);
          x.globalCompositeOperation = 'destination-out';
          let auto = false;
          const helper = () => { if (auto || doneF) return; auto = true; hint.style.opacity = 0; const W = r.width, H = r.height, t0 = performance.now(), T = 800; let last = null;
            const step = (now) => { if (doneF || !cv.isConnected) return; const k = Math.min(1, (now - t0) / T), rows = 4, pr = k * rows, row = Math.floor(Math.min(pr, rows - .001)), f = pr - row, yy = (row + .5) * H / rows, xx = row % 2 ? W * (1 - f) : W * f;
              if (last) { x.lineWidth = H / rows * 1.3; x.lineCap = 'round'; x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(xx, yy); x.stroke(); } last = [xx, yy]; if (k < 1) requestAnimationFrame(step); else reveal(); };
            requestAnimationFrame(step); };
          cv.addEventListener('pointerdown', (e) => { e.preventDefault(); const b = cv.getBoundingClientRect(); x.beginPath(); x.arc(e.clientX - b.left, e.clientY - b.top, 26, 0, 7); x.fill(); helper(); });
          /* v462: raspar es obligatorio — se espera a que el estudiante toque y la plataforma le ayuda a terminar */
        } catch (e) { reveal(); }
        await new Promise(res => { go.onclick = () => { stop(); res(); }; });
        await micTips(false); return null;
      }
      stage.innerHTML = `<div class="center">
        <span class="lbl">Topic ${p.topic} · ${PL(p)}</span>
        <h2 style="font-size:28px;margin-top:12px">${esc(p._t.title)}</h2>
        <p class="muted" style="font-size:17px;margin:4px 0 14px">${esc(p.title)} — ${esc(p.es)}</p>
        <div class="mainph" style="max-width:460px">${photo(p._t.cover)}</div>
        <div class="lesson" style="text-align:left;margin-top:6px"><h3>🎯 Goal</h3><p style="font-size:18px;margin:4px 0"><b>${esc(p.goal ? p.goal.en : p.title)}</b></p><p class="muted" style="margin:0">${esc(p.goal ? p.goal.es : p.es)}</p></div>
        ${window.MRGOAL ? `<div style="max-width:620px;margin:12px auto 0">${MRGOAL.whyHTML(M.MOD.n, p.topic)}</div>` : ''}
        ${prev && !(S.parts[prev.id] && S.parts[prev.id].done) ? `<p class="hint" style="margin-top:6px">💡 Te recomendamos completar primero: ${esc(prev._t.title)} · ${PL(prev)}</p>` : ''}
      </div>`;
      await A.waitNext(stage, '¡Empezar lección! 🚀'); M.confetti(2200); sfx('win'); return null;
    },

    // WARM-UP GAME: juego dinámico con la lección anterior + un adelanto (2 palabras) de la lección nueva
    warmGame: async (stage, p) => {
      const pv = M.prevPart(p); const uniq = (a) => a.filter((v, i, x) => v && v.en && x.findIndex(y => y.en === v.en) === i);
      const old = pv ? sample(uniq(pv.vocab || []), 6) : []; const neu = sample(uniq(p.vocab || []).filter(v => !old.some(o => o.en === v.en)), old.length ? 2 : 6);
      const vocab = uniq(old.concat(neu)); if (vocab.length < 4) return null;
      const used = (C.PLAN || PLAN)[p.id] || p.acts || [];
      const POOL = ['bubblePop', 'catchWord', 'memory', 'raceGame', 'spinWheel', 'matchLines', 'oddOneOut', 'sayPop', 'quizShow'].filter(g => typeof A[g] === 'function' && !used.includes(g));
      let hsh = 0; for (const ch of String(M.MOD.id) + p.id) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
      const g = POOL[hsh % POOL.length] || 'memory';
      const body = A.head(stage, { lbl: 'Warm-up', title: '🔥 Warm-up game', ins: pv ? `Calienta motores: juega con lo que aprendiste en <b>${esc(pv._t.title)} · ${PL(pv)}</b> y descubre <b>${neu.length} palabras nuevas</b> de la lección de hoy.` : 'Calienta motores: descubre jugando algunas palabras de la lección de hoy.' });
      /* palabras del warm-up ocultas */
      await A.waitNext(stage, '¡A jugar! 🎮');
      const pseudo = Object.assign(Object.create(p), { vocab, sentences: (pv && pv.sentences) || p.sentences, pairs: null });
      try { return await A[g](stage, pseudo); } catch (e) { console.error('warmGame', g, e); return null; }
    },

    warm: async (stage, p) => {
      let c = 0; const AG = M.ageGroup();
      for (let i = 0; i < p.warm.length; i++) {
        const q = p.warm[i];
        const body = A.head(stage, { lbl: 'Speaking', title: 'Listen and answer', ins: 'Calentamiento: escucha la pregunta y <b>respóndela en voz alta</b> con tus propias palabras. ¡No hay respuestas incorrectas!', count: `${i + 1} / ${p.warm.length}` });
        const ok = await new Promise(res => {
          let vnDone = null;
          if (AG === 'teens') { stage.classList.add('dk');
            const bk = 'mra_tbest_v1', key = p.id + ':' + i; let bests = {}; try { bests = JSON.parse(localStorage.getItem(bk) || '{}'); } catch (e) { }
            const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'), friend = ['Valentina', 'Mateo', 'Luciana', 'Sam'][i % 4];
            const bars = Array.from({ length: 22 }, (_, k) => `<i style="height:${6 + Math.round(Math.abs(Math.sin(k * 1.7) * Math.cos(k * .6)) * 18)}px"></i>`).join('');
            const top = h(`<div class="vn-wrap"><div class="vn-clock"><div><small>CONTRA EL RELOJ</small><b class="vn-t">0:00</b></div><div class="r"><small>TU MEJOR MARCA</small><b>${bests[key] ? fmt(bests[key]) : '—'}</b></div></div>
              <div class="rd-chat"><div class="rd-chd"><span class="rd-gav">${window.MRI ? MRI('chat') : ''}</span><div><b>${esc(friend)}</b><small>te envió una nota de voz</small></div></div>
              <div class="rd-msgs"><div class="vn"><button class="vn-pl" type="button" aria-label="Escuchar nota de voz">${window.MRI ? MRI('play') : '▶'}</button><span class="vn-w">${bars}</span></div>
              <div class="rd-msg ot vn-q">“${esc(q.q)}”</div>${q.es ? `<p class="vn-es">${esc(q.es)}</p>` : ''}${q.ex ? `<div class="rd-msg me vn-ex"><i>Puedes responder</i>${esc(q.ex)}</div>` : ''}</div></div></div>`);
            body.appendChild(top); $('.vn-pl', top).onclick = () => { sfx('tap'); play(q.au); };
            const t0 = Date.now(), tEl = $('.vn-t', top), iv = setInterval(() => { if (!document.body.contains(tEl)) return clearInterval(iv); tEl.textContent = fmt(Math.floor((Date.now() - t0) / 1000)); }, 500);
            vnDone = () => { clearInterval(iv); const s = Math.max(1, Math.round((Date.now() - t0) / 1000)), old = bests[key], rec = !old || s < old; if (rec) { bests[key] = s; try { localStorage.setItem(bk, JSON.stringify(bests)); } catch (e) { } } return ` · Tu tiempo: <b>${fmt(s)}</b>${rec && old ? ' · ¡Nuevo récord personal!' : ''}`; };
          } else if (window.MRVC) {
          if (q.ex) body.appendChild(h(`<div class="warm-es"><div class="ex">💡 Puedes responder: <b>${esc(q.ex)}</b></div></div>`));
          } else {
          const top = h(`<div class="row" style="justify-content:center;align-items:center;gap:16px;margin:6px 0 10px">${M.mascot('mascot', 'welcome')}<div class="bubble" style="font-size:19px">${esc(q.q)}</div></div>`); body.appendChild(top);
          if (q.es) body.appendChild(h(`<p class="center tr-es">${esc(q.es)}</p>`));
          if (q.es) body.appendChild(h(`<div class="warm-es">${q.ex ? `<div class="ex">💡 Puedes responder: <b>${esc(q.ex)}</b></div>` : ''}</div>`));
          const pr = h(`<div class="center"></div>`); pr.appendChild(A.playBtn(q.au)); body.appendChild(pr);
          }
          const mic = h(`<button class="mic">🎤</button>`); if (window.MRVC && M.canSR) body.appendChild(MRVC.card({ target: mic, label: AG === 'teens' ? 'NOTA DE VOZ · TOCA Y RESPONDE' : 'TOCA EL MICRÓFONO Y RESPONDE', say: q.q, es: q.es, au: q.au, mascot: AG === 'kids', cheer: 'Escucha la pregunta y respóndela.' })); body.appendChild(mic);
          const st = h(`<p class="center" style="font-weight:700">${window.MRVC && M.canSR ? '' : M.canSR ? (AG === 'teens' ? 'Toca el micrófono y responde con una nota de voz' : 'Toca el micrófono y responde en inglés') : 'Escribe tu respuesta en inglés 👇'}</p>`); body.appendChild(st);
          const alt = h(`<div class="${M.canSR ? 'hidden' : ''}"><input class="inp" placeholder="Escribe tu respuesta en inglés…" style="font-size:18px"></div>`); body.appendChild(alt);
          const bar = h(`<div class="actionbar">${M.canSR ? '<button class="btn w" id="ty">⌨️ Prefiero escribir</button>' : ''}<button class="btn w" id="sk">Saltar</button><button class="btn k lg" id="ok">Enviar ✓</button></div>`); body.appendChild(bar);
          setTimeout(() => play(q.au), 400);
          const minW = (q.ex && M.words(q.ex).length <= 3) || /letter|name|number|old|colou?r|favorite|favourite|from|live/i.test(q.q || '') ? 1 : 2; // respuestas cortas válidas (una letra, un nombre…)
          const accept = async (txt) => { const n = M.words(txt).length; if (n >= minW) { sfx('ok'); M.praise(); const tm = vnDone ? vnDone() : ''; await sheet({ ok: true, title: good(), msg: `Te escuché: “${esc(txt)}”${tm}`, tip: 'Intenta responder con oraciones completas, por ejemplo: <i>I\'m fine, thank you.</i>' }); res(true); } else { st.innerHTML = 'Te escuché muy poco. Responde con una frase corta y toca el micrófono otra vez.'; sfx('bad'); setTimeout(M.encourage, 250); } };
          mic.onclick = async () => { stop(); mic.classList.add('rec'); st.textContent = '🎧 Te escucho…'; const r = await M.listen(8000, { quick: true }); mic.classList.remove('rec');
            if (!r.alts.length) { st.textContent = r.error === 'not-allowed' ? 'Permite el micrófono 🎤 o escribe tu respuesta.' : 'No te escuché 🙉 Intenta otra vez.'; if (r.error === 'not-allowed') alt.classList.remove('hidden'); return; } accept(r.alts[0]); };
          if ($('#ty', bar)) $('#ty', bar).onclick = () => { alt.classList.remove('hidden'); $('input', alt).focus(); };
          $('#sk', bar).onclick = () => res(null);
          $('#ok', bar).onclick = () => { const v = $('input', alt).value; if (v.trim()) accept(v); else if (M.canSR) mic.click(); };
          $('input', alt).onkeydown = e => { if (e.key === 'Enter') $('#ok', bar).click(); };
        });
        if (ok) c++;
      }
      return A.result(c, p.warm.length, 'speaking');
    },

    reading: async (stage, p) => {
      let r = p.reading;
      const AG = M.ageGroup();
      const body = A.head(stage, { lbl: 'Reading', title: AG === 'adult' ? `📖 ${r.title}` : r.title, ins: AG === 'teens' ? 'Lee el chat mientras lo escuchas. Luego responde <b>TRUE</b> o <b>FALSE</b>.' : AG === 'kids' ? 'Escucha el cuento y toca cada viñeta para oírla otra vez. Luego responde <b>YES</b> o <b>NO</b>.' : 'Escucha y lee al mismo tiempo. Luego responde <b>YES</b> o <b>NO</b>.' });
      const sents = splitSents(r.text);
      const box = h(`<div class="reading">${photo(r.img)}<div><div class="row" style="margin-bottom:10px"><button class="btn k sm" id="rp">▶ Escuchar lectura</button><button class="btn w sm" id="rv">🎙️ Léela en voz alta <small>(opcional)</small></button></div><div class="txt">${sents.map(s => `<span class="s">${s.split(/(\s+)/).map(w => /\S/.test(w) ? `<i class="rw">${esc(w)}</i>` : w).join('')}</span>`).join('')}</div><div class="rv-res" id="rvr" hidden></div><button class="rd-tr" id="rdtr" type="button" aria-expanded="false"><span>ES</span> Ver traducción al español</button><div class="rd-es" id="rdes" hidden></div></div></div>`);
      body.appendChild(box); if (AG !== 'adult') ageReading(box, r, sents, AG);
      { const tb = $('#rdtr', box), pane = $('#rdes', box);
        const getES = () => window.MRRDES ? Promise.resolve() : new Promise(res => { const base = (document.querySelector('script[src*="core.js"]').getAttribute('src') || '').replace(/core\.js(\?.*)?$/, ''); const q = ((document.querySelector('script[src*="core.js"]').getAttribute('src') || '').match(/\?.*$/) || [''])[0]; const sc = document.createElement('script'); sc.src = base + 'rdes.js' + q; sc.onload = res; sc.onerror = res; document.head.appendChild(sc); });
        tb.onclick = async () => {
          if (!pane.hidden) { pane.hidden = true; tb.setAttribute('aria-expanded', 'false'); tb.innerHTML = '<span>ES</span> Ver traducción al español'; return; }
          await getES(); const t = (window.MRRDES && MRRDES[r.au]) || (window.M1AGE_ES && M1AGE_ES[r.au]);
          pane.innerHTML = t ? `<b>${esc(t.t)}</b>${t.x.split(/\n+/).map(x => `<p>${esc(x)}</p>`).join('')}` : '<p>La traducción de esta lectura no está disponible.</p>';
          pane.hidden = false; tb.setAttribute('aria-expanded', 'true'); tb.innerHTML = '<span>ES</span> Ocultar traducción'; };
      }
      // approximate karaoke highlight by character proportion
      const rp = $('#rp', box);
      const karaoke = () => { stop(); const a = M.trackAudio(new Audio(M.audioSrc(r.au))); const spans = $$('.s', box); const lens = sents.map(s => s.length); const tot = lens.reduce((x, y) => x + y, 0);
        a.ontimeupdate = () => { if (!a.duration) return; const f = a.currentTime / a.duration * tot; let acc = 0; spans.forEach((sp, i) => { const on = f >= acc && f < acc + lens[i]; sp.classList.toggle('on', on); acc += lens[i]; }); };
        a.addEventListener('ended', () => { rp._t = 0; spans.forEach(sp => sp.classList.remove('on')); rp.innerHTML = '▶ Escuchar lectura'; rp.classList.remove('playing'); });
        a.addEventListener('pause', () => { if (a.ended) return; rp._t = a.currentTime; rp.innerHTML = '▶ Continuar lectura'; rp.classList.remove('playing'); }); /* ▶️ retoma donde quedó */
        if (rp._t) { const go = () => { try { a.currentTime = rp._t; } catch (e) { } }; if (a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once: true }); }
        a.play(); window.__ra = a; rp.innerHTML = '⏹ Detener lectura'; rp.classList.add('playing'); const hideF = M.floatStop(rp); a.addEventListener('ended', hideF); };
      rp.onclick = () => { if (rp.classList.contains('playing')) stop(); else karaoke(); };
      readAloud(box, $('#rv', box), $('#rvr', box));
      body.appendChild(h(`<h3 style="margin-top:18px">${AG === 'teens' ? 'True or false?' : 'Answer YES or NO'}</h3>`));
      if (window.__V9 && r.q.length > 3) r = Object.assign({}, r, { q: r.q.slice(0, 3) });
      const qs = r.q.map((q, i) => { const e = h(`<div class="yn"><p>${i + 1}) ${esc(q.s)}</p><div class="b"><button data-v="yes">${AG === 'teens' ? 'TRUE' : 'YES'}</button><button data-v="no">${AG === 'teens' ? 'FALSE' : 'NO'}</button></div></div>`); $$('button', e).forEach(b => b.onclick = () => { $$('button', e).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); e._v = b.dataset.v; sfx('tap'); if (e._pg && e._pg.next) setTimeout(e._pg.next, 380); }); body.appendChild(e); return e; });
      /* v484 · preguntas de una en una (todo cabe en pantalla): «Pregunta 1 de 3» y pasa sola a la siguiente */
      if (qs.length > 1) { const pg = h(`<div class="yn9-h"><small></small><span class="yn9-d">${qs.map(() => '<i></i>').join('')}</span></div>`); qs[0].before(pg); let qi = 0;
        const show = (k) => { qi = k; qs.forEach((e, j) => e.classList.toggle('yn9-off', j !== k)); $('small', pg).textContent = `Pregunta ${k + 1} de ${qs.length}`; $$('.yn9-d i', pg).forEach((d, j) => d.className = j === k ? 'on' : qs[j]._v ? 'ok' : ''); };
        $$('.yn9-d i', pg).forEach((d, j) => d.onclick = () => show(j));
        qs.forEach((e, j) => e._pg = { next: () => { if (qi !== j) return; const nx = qs.findIndex((x, m) => m > j && !x._v); show(nx >= 0 ? nx : qs.findIndex(x => !x._v) >= 0 ? qs.findIndex(x => !x._v) : j); } }); show(0); body._yn9 = { pg, qs }; }
      const bar = h(`<div class="actionbar"><button class="btn k lg">Comprobar ✓</button></div>`); body.appendChild(bar);
      const c = await new Promise(res => { $('button', bar).onclick = async () => {
        if (qs.some(e => !e._v)) { const k = qs.findIndex(e => !e._v); if (body._yn9) { qs.forEach((e, j) => e.classList.toggle('yn9-off', j !== k)); } M.toast('Responde todas las preguntas 😉'); return; }
        if (body._yn9) { body._yn9.pg.remove(); qs.forEach(e => e.classList.remove('yn9-off')); }
        stop();
        let c = 0; qs.forEach((e, i) => { const ok = e._v === r.q[i].a; if (ok) c++; e.classList.add(ok ? 'right' : 'wrong'); $$('button', e).forEach(b => b.disabled = true); if (!ok) $('p', e).innerHTML += ` <b>(${AG === 'teens' ? (r.q[i].a === 'yes' ? 'TRUE' : 'FALSE') : r.q[i].a.toUpperCase()})</b>`; });
        bar.remove(); c === qs.length ? sfx('win') : sfx(c >= qs.length / 2 ? 'ok' : 'bad');
        await A.waitNext(stage, `${c}/${qs.length} correctas — Continuar`); res(c); }; });
      stop();
      return A.result(c, r.q.length, 'reading');
    },

    review: async (stage, p) => {
      if (window.MRAGE2) { const rr = await MRAGE2.review(stage, p); if (rr) { stage.classList.remove('as-stage', 'as-adult'); return rr; } } // v415: swipe sobrio también para adultos
      const pv = M.prevPart(p); const pool = pv.vocab.filter((v, i, a) => a.findIndex(x => x.en === v.en) === i);
      const usePh = pool.filter(x => x.img && !x.img.startsWith('#')).length >= pool.length * .6;
      const items = sample(pool, Math.min(4, pool.length));
      const r = await A.qloop(stage, { lbl: 'Review', title: 'Let\'s remember last class', ins: `Repaso de <b>${esc(pv._t.title)} · ${PL(pv)}</b>. Escucha y elige.` }, items, async (body, it) => {
        body.appendChild(A.playBtn(it.au));
        const opts = shuffle([it, ...sample(pool.filter(x => x.en !== it.en), 3)]); const wrap = h(`<div class="opts" style="margin-top:12px"></div>`); body.appendChild(wrap);
        const btns = opts.map(o => { const b = h(usePh ? `<button class="opt imgopt">${photo(o.img)}<span class="imglbl">${esc(o.en)}<small class="imges">${esc(o.es || '')}</small></span></button>` : `<button class="opt">${esc(o.en)}<small class="imges">${esc(o.es || '')}</small></button>`); wrap.appendChild(b); return b; });
        setTimeout(() => play(it.au), 350);
        const i = await A.choose(btns); const ok = opts[i] === it; btns[opts.indexOf(it)].classList.add('right'); if (!ok) btns[i].classList.add('wrong');
        await A.feedback(ok, `${it.en} (${it.es})`, 'Repasa la lección anterior si lo necesitas.'); return ok;
      });
      return A.result(r.c, items.length, 'listening', r.missed);
    },

    // 🚀 MISIÓN según el objetivo: situación real + pregunta en audio + respuesta en voz alta con corrección
    mission: async (stage, p) => { // v459: Módulo 1 o Kids → «Elige y dilo» · resto → «Notas de voz» (sin puertas ni candados)
      const X = missionFor(p); if (!X) return null;
      const I = n => window.MRI ? MRI(n) : '';
      const GN = { v: ['plane', 'Viajar'], t: ['briefcase', 'Trabajo'], e: ['grad', 'Estudios'], kc: ['grad', 'Colegio'], kj: ['pad', 'Juegos y videos'], kv: ['plane', 'Viajar'], km: ['music', 'Música'], tc: ['grad', 'Colegio'], ts: ['tv', 'Series y redes'], tg: ['pad', 'Gaming'], tx: ['plane', 'Viajar o estudiar afuera'] }[X.k] || ['target', 'Tu objetivo'];
      const list = X.list.slice(), N = list.length; let c = 0;
      const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
      const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
      const av = (x) => `<span class="mv-av${x.img ? '' : ' ic'}">${x.img ? photo('u:' + x.img) : I(GN[0])}</span>`;
      const pick3 = (M.MOD.n == 1 || M.ageGroup() === 'kids');
      const listen1 = async () => { if (!M.canSR) return { alts: [] }; return await M.listen(10000, { quick: true }); };
      const msgFor = (fj) => fj.gram ? 'Casi. Se dice: “' + esc(fj.fix) + '”.' : fj.rep ? 'Repetiste la pregunta. Ahora respóndela con tus palabras.' : fj.off ? 'Tu respuesta no corresponde a la pregunta. Escúchala otra vez y responde sobre eso.' : 'Casi. Inténtalo otra vez.';
      if (pick3) {
        /* ---- «Elige y dilo»: entiende primero (elige entre 3) y luego habla ---- */
        const pool = []; Object.keys(window.MRMISSIONS || {}).forEach(k => { if (k.split('-')[0] === String(+M.MOD.n || 1) && k !== (+M.MOD.n || 1) + '-' + p.topic) [MRMISSIONS[k][X.k]].filter(Boolean).forEach(L => (Array.isArray(L) ? L : [L]).forEach(y => { if (y && y.a && pool.indexOf(y.a) < 0) pool.push(y.a); })); });
        for (let mi = 0; mi < N; mi++) {
          if (!stage.isConnected) break; const x = list[mi];
          const wrong = sample(pool.filter(a => { if (a === x.a || M.words(a)[0] === M.words(x.a)[0]) return false; try { return !M.freeJudge(x.q, x.a, [a]).ok; } catch (e) { return true; } }), 2); const opts = shuffle([x.a, ...wrong]);
          const body = A.head(stage, { lbl: 'Mission', title: '¿Qué le respondes?', count: `${mi + 1} / ${N}` }); stage.classList.add('mv-stage');
          const el = h(`<div class="mv mv-pick"><div class="mv-k">${I(GN[0])}<span>${esc(x.sit)}</span></div>
            <div class="mv-in">${av(x)}<div class="mv-bq"><b>${esc(x.q)}</b><small>${esc(x.es)}</small><button type="button" class="mv-pl" aria-label="Escuchar">${I('vol')}</button></div></div>
            <div class="mv-opts">${opts.map((o, i) => `<button type="button" class="mv-o" data-i="${i}"><i></i><span>${esc(o)}</span></button>`).join('')}</div>
            <div class="mv-say" hidden><button type="button" class="mv-mic">${MIC}</button><div><b>¡Correcto! Ahora dilo</b><small class="mv-st">Toca el micrófono y dilo en voz alta.</small></div><button type="button" class="mv-hear" aria-label="Escuchar la respuesta">${I('vol')}<span>Escuchar</span></button></div>
            <div class="mv-heard" hidden></div><div class="mv-acts"></div></div>`);
          body.appendChild(el); const $e = q => el.querySelector(q);
          $e('.mv-pl').onclick = () => { stop(); play(x.qau); }; setTimeout(() => play(x.qau), 350); $e('.mv-hear').onclick = () => { stop(); play(x.aau); }; /* v464: el estudiante puede escuchar la respuesta cuando quiera */
          let okk = false;
          await new Promise(done => {
            el.querySelectorAll('.mv-o').forEach(b => b.onclick = () => {
              if (el.classList.contains('chosen')) return; const o = opts[+b.dataset.i];
              if (o !== x.a) { b.classList.add('bad'); sfx('bad'); setTimeout(M.encourage, 200); setTimeout(() => b.classList.remove('bad'), 650); return; }
              el.classList.add('chosen'); b.classList.add('on'); sfx('ok'); { const tr = window.MRKQAES && MRKQAES[x.a]; if (tr) b.querySelector('span').insertAdjacentHTML('beforeend', `<small class="mv-oes">${esc(tr)}</small>`); } el.querySelectorAll('.mv-o').forEach(z => { if (z !== b) z.classList.add('off'); });
              const say = $e('.mv-say'); say.hidden = false; stop(); setTimeout(() => play(x.aau), 300);
              if (!M.canSR) { $e('.mv-st').textContent = 'Dilo en voz alta.'; okk = true; return setTimeout(done, 2600); }
              let fails = 0; const mic = $e('.mv-mic');
              mic.onclick = async () => {
                if (mic.disabled) return; mic.disabled = true; stop(); el.classList.add('rec'); $e('.mv-st').textContent = 'Te escucho…';
                const r = await listen1(); el.classList.remove('rec'); mic.disabled = false;
                if (!r.alts || !r.alts.length) { $e('.mv-st').textContent = 'No te escuché. Acércate al micrófono e intenta otra vez.'; return; }
                okk = M.readJudge(x.q, x.a, r.alts).ok;
                const hd = $e('.mv-heard'); hd.hidden = false; hd.className = 'mv-heard ' + (okk ? 'good' : 'bad'); hd.innerHTML = `<small>Escuché</small>“${esc(r.alts[0])}”`;
                if (okk) { sfx('ok'); M.praise(); say.classList.add('done'); $e('.mv-st').textContent = '¡Muy bien dicho!'; mic.hidden = true; setTimeout(done, 2000); }
                else { fails++; sfx('bad'); setTimeout(M.encourage, 250); $e('.mv-st').textContent = 'Casi. Escúchala y dilo otra vez.'; setTimeout(() => play(x.aau), 900);
                  if (fails >= 2 && !$e('.mv-skip')) { const sk = h('<button type="button" class="btn w sm mv-skip">Seguir</button>'); $e('.mv-acts').appendChild(sk); sk.onclick = () => { okk = false; done(); }; } }
              };
            });
          });
          if (okk) c++; if (mi < N - 1) await sleep(300);
        }
      } else {
        /* ---- «Notas de voz»: el personaje manda notas de voz y el estudiante responde hablando ---- */
        const x0 = list[0];
        const body = A.head(stage, { lbl: 'Mission', title: 'Responde las notas de voz', count: `${N} mensajes` }); stage.classList.add('mv-stage');
        const el = h(`<div class="mv mv-chat"><div class="mv-hd">${av(x0)}<div><b>Mensajes de voz</b><small>${I(GN[0])}${esc(GN[1])}</small></div></div><div class="mv-log"></div>
          <div class="mv-bar"><button type="button" class="mv-hint">Ver un ejemplo</button><span class="mv-st">Escucha el mensaje…</span><button type="button" class="mv-mic" disabled>${MIC}</button></div><div class="mv-acts"></div></div>`);
        body.appendChild(el); const $e = q => el.querySelector(q), log = $e('.mv-log'), mic = $e('.mv-mic'), st = $e('.mv-st'), hint = $e('.mv-hint');
        const add = (html) => { const n = h(html); log.appendChild(n); try { n.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { } return n; };
        for (let mi = 0; mi < N; mi++) {
          if (!stage.isConnected) break; const x = list[mi];
          add(`<div class="mv-sit">${esc(x.sit)}</div>`);
          const typing = add('<div class="mv-vn mv-typ"><i></i><i></i><i></i></div>'); await sleep(900); typing.remove();
          const vn = add(`<div class="mv-vn"><div class="mv-pr"><button type="button" class="mv-pp" aria-label="Escuchar">${PLAY}</button><span class="mv-wv"></span></div><b>${esc(x.q)}</b><small>${esc(x.es)}</small></div>`);
          const pp = vn.querySelector('.mv-pp'); const playQ = () => { stop(); vn.classList.add('playing'); play(x.qau); setTimeout(() => vn.classList.remove('playing'), 2200); }; pp.onclick = playQ; playQ();
          { await sleep(700); const ex = add(`<div class="mv-ex"><small>Léela en voz alta</small><span>${esc(x.a)}</span>${window.MRKQAES && MRKQAES[x.a] ? `<em class="mv-exes">${esc(MRKQAES[x.a])}</em>` : ''}<button type="button" class="mv-pl" aria-label="Escuchar">${I('vol')}</button></div>`); ex.querySelector('.mv-pl').onclick = () => { stop(); play(x.aau); }; await sleep(1600); stop(); play(x.aau); } /* v460: Mr. Arrieta lee la pregunta y la respuesta; el estudiante la lee */
          mic.disabled = false; st.textContent = 'Toca el micrófono y léela'; hint.hidden = true;
          let okk = false;
          await new Promise(done => {
            let fails = 0;
            mic.onclick = async () => {
              if (mic.disabled) return;
              if (!M.canSR) { add(`<div class="mv-me">${esc(x.a)}<i>Dilo en voz alta</i></div>`); okk = true; mic.disabled = true; return setTimeout(done, 2200); }
              mic.disabled = true; stop(); el.classList.add('rec'); st.textContent = 'Te escucho…';
              const r = await listen1(); el.classList.remove('rec'); mic.disabled = false;
              if (!r.alts || !r.alts.length) { st.textContent = 'No te escuché. Acércate al micrófono e intenta otra vez.'; return; }
              const fj = M.readJudge(x.q, x.a, r.alts); okk = fj.ok;
              add(`<div class="mv-me ${okk ? '' : 'bad'}">${esc(r.alts[0])}<i>${okk ? (fj.fix ? 'Mejor dilo así: ' + esc(fj.fix) : 'Bien dicho') : 'Casi. Escúchala y léela otra vez, despacio.'}</i></div>`); if (!okk) setTimeout(() => play(x.aau), 900);
              if (okk) { sfx('ok'); M.praise(); mic.disabled = true; hint.hidden = true; st.textContent = mi < N - 1 ? '¡Bien! Llega otro mensaje…' : '¡Conversación completada!'; setTimeout(done, fj.fix ? 2600 : 1500); }
              else { fails++; sfx('bad'); setTimeout(M.encourage, 250); st.textContent = 'Intenta otra vez'; if (fails >= 2 && !$e('.mv-skip')) { const sk = h('<button type="button" class="btn w sm mv-skip">Seguir</button>'); $e('.mv-acts').appendChild(sk); sk.onclick = () => { sk.remove(); okk = false; mic.disabled = true; done(); }; } }
            };
          });
          if (okk) c++;
        }
        mic.disabled = true;
      }
      if (stage.isConnected) {
        const all = c === N; const b2 = A.head(stage, { lbl: 'Mission', title: all ? '¡Misión cumplida!' : 'Misión terminada' });
        b2.appendChild(h(`<div class="mv-end ${all ? 'win' : ''}"><span class="mv-ei">${I(all ? 'award' : 'chat')}</span><p>Respondiste bien <b>${c} de ${N}</b></p><small>${esc(GN[1])} · ${esc(list.map(x => x.sit).join(' · '))}</small></div>`));
        if (all) { sfx('win'); try { M.confetti(1200); } catch (e) { } } else sfx('ok');
        await A.waitNext(stage, 'Continuar');
      }
      return A.result(c, N, 'speaking');
    },

    // 📹 KEY QUESTIONS en videollamada con Mr. Arrieta (un personaje por módulo). Mismas preguntas, audios y corrección de voz.
    keyq: async (stage, p) => {
      // guía para preguntas de sí/no: le muestra al estudiante las dos formas de responder (él escoge)
      function ynGuide(q) { const m = String(q || '').match(/^\s*(are|is|am|do|does|can|was|were)\s+(you|he|she|it|they|we|i)\b/i); if (!m) return null; const v = m[1].toLowerCase(), s0 = m[2].toLowerCase();
        const sub = { you: 'I', i: 'you', he: 'he', she: 'she', it: 'it', they: 'they', we: 'we' }[s0]; const sg = ['he', 'she', 'it'].includes(sub);
        const be = ['are', 'is', 'am'].includes(v) ? (sub === 'I' ? 'am' : sg ? 'is' : 'are') : ['do', 'does'].includes(v) ? (sg ? 'does' : 'do') : ['was', 'were'].includes(v) ? (sub === 'I' || sg ? 'was' : 'were') : v;
        const neg = { is: "isn't", are: "aren't", do: "don't", does: "doesn't", can: "can't", was: "wasn't", were: "weren't" }[be];
        return ['Yes, ' + sub + ' ' + be + '.', be === 'am' ? "No, I'm not." : 'No, ' + sub + ' ' + neg + '.']; }
      const MN = +M.MOD.n || 1, PIC = { 1: 'mra-wink', 2: 'mra-celebrate', 3: 'mra-wow', 4: 'mra-point' }[MN] || 'mra-wink', SECS = { 1: 15, 2: 12, 3: 10, 4: 10 }[MN] || 12;
      const Q = p.keyq, N = Q.length; let c = 0, pts = 0, streak = 0;
      const body = A.head(stage, { lbl: 'Listen & practice', title: 'Key questions', ins: 'Mr. Arrieta te hace una videollamada. Escucha la pregunta y <b>lee la respuesta en voz alta</b>, con tu voz normal.' });
      const PF = (window.MRAP && MRAP.get && MRAP.get()) || {}; const INI = (((PF.first || S.name || 'T')[0] || 'T') + ((PF.last || '')[0] || '')).toUpperCase();
      const IC = (n, d) => window.MRI ? MRI(n) : d;
      // 📹 v420: videollamada premium (estudio azul, subtítulo, tu recuadro con tus iniciales, anillo de tiempo en el micrófono)
      const vc = h(`<div class="vk vk2"><div class="vk-screen"><img src="${PIC}.webp?v=2" alt="Mr. Arrieta" draggable="false">
          <div class="vk-top"><span class="vk-live"><i></i>EN VIVO · <b class="vk-clk">00:00</b></span><div class="vk-sc"><span class="vk-dots">${Array.from({ length: N }, () => '<i></i>').join('')}</span><span class="vk-n" hidden>Pregunta 1/${N}</span><span class="vk-pt">★ <b class="vk-p">0</b></span><span class="vk-st" hidden>x<b>1</b></span></div></div>
          <span class="vk-name">${IC('mic', '')}Mr. Arrieta</span><div class="vk-self"><span class="vk-av">${esc(INI)}</span><span class="vk-lv"><i></i><i></i><i></i><i></i><i></i></span><small>Tú</small></div>
          <i class="vk-ring"></i></div><div class="vk-card"><div class="vk-q"><button type="button" class="vk-qa" aria-label="Escuchar la pregunta">${IC('vol', '')}</button><div><b class="vk-qt"></b><small class="vk-qes"></small></div></div><div class="vk-fb" hidden></div></div>
        <div class="vk-bot"><div class="vk-btns"><div class="vk-cb"><button type="button" class="vk-b vk-rep" aria-label="Escuchar la pregunta otra vez">${IC('vol', '')}</button><small>Repetir</small></div>
          <div class="vk-cb vk-cbm"><div class="vk-timer"><button type="button" class="vk-b vk-mic" aria-label="Responder">${IC('mic', '')}</button><b hidden>${SECS}</b></div><small>Leer</small></div>
          <div class="vk-cb"><button type="button" class="vk-b vk-hint" aria-label="Escuchar la respuesta">${IC('headphones', '')}</button><small>Respuesta</small></div></div>
          <div class="vc vc-strip vc-${M.ageGroup()}" hidden><div class="vc-wv"></div></div>
          <div class="vk-msg">Toca el micrófono y responde</div><div class="vk-ans" hidden></div><button type="button" class="btn k sm vk-next" hidden>Siguiente pregunta →</button></div></div>`);
      { const t0 = Date.now(); const ck = setInterval(() => { if (!vc.isConnected) return clearInterval(ck); const e = Math.floor((Date.now() - t0) / 1000); const c2 = vc.querySelector('.vk-clk'); if (c2) c2.textContent = String(Math.floor(e / 60)).padStart(2, '0') + ':' + String(e % 60).padStart(2, '0'); }, 1000); }
      body.appendChild(vc);
      const $v = (sel) => vc.querySelector(sel);
      const setT = (t, frac) => { $v('.vk-timer b').textContent = Math.max(0, Math.ceil(t)); $v('.vk-timer').style.setProperty('--f', Math.max(0, frac)); };
      for (let i = 0; i < N; i++) {
        if (!stage.isConnected) break;
        const k = Q[i], tgt = k.a.split(' / ')[0], blank = k.a.includes('___');
        $v('.vk-n').textContent = `Pregunta ${i + 1}/${N}`; vc.querySelectorAll('.vk-dots i').forEach((d, j) => d.className = j < i ? 'on' : j === i ? 'cur' : ''); $v('.vk-qt').textContent = k.q; $v('.vk-qes').textContent = k.es || '';
        { const gd = ynGuide(k.q); let gEl = $v('.vk-guide'); if (!gEl) { gEl = h('<div class="vk-guide"></div>'); $v('.vk-q').appendChild(gEl); } gEl.classList.add('vk-read'); { const tes = window.MRKQAES && (MRKQAES[k.a] || MRKQAES[tgt]); gEl.innerHTML = `<small>Lee esta respuesta en voz alta</small><b>${esc(tgt).replace(/___/g, '<u>___</u>')}</b>${tes ? `<span class="vk-res">${esc(String(tes).split(' / ')[0])}</span>` : ''}${blank ? '<em>Completa el ___ con tu información</em>' : ''}`; } /* v466: traducción de la respuesta, pequeña y en gris */ void gd; } /* v460: el estudiante lee la respuesta modelo; se revisa la pronunciación */
        $v('.vk-ans').hidden = true; $v('.vk-next').hidden = true; $v('.vk-fb').hidden = true; $v('.vk-msg').textContent = 'Escucha la pregunta…';
        vc.classList.remove('ok', 'late', 'bad'); const img = $v('.vk-screen img'); img.src = PIC + '.webp?v=2'; img.classList.remove('talk'); void img.offsetWidth; img.classList.add('talk');
        await play(k.qau); if (!stage.isConnected) break; if (k.aau) { await sleep(250); await play(k.aau); if (!stage.isConnected) break; }
        const r = await new Promise((done) => {
          let left = SECS, timer = null, busy = false, over = false, late = false, hinted = false;
          const showAns = (why) => { $v('.vk-ans').innerHTML = `<small>${why}</small><b>${esc(tgt).replace(/___/g, '<u>___</u>')}</b>${blank ? '<em>Completa el ___ con tu información</em>' : ''}`; $v('.vk-ans').hidden = false; };
          const tick = () => { if (busy || over) return; left -= 0.1; setT(left, left / SECS); if (left <= 0) { clearInterval(timer); late = true; vc.classList.add('late'); $v('.vk-msg').textContent = 'Take your time! Lee la respuesta en voz alta (sin puntos).'; $v('.vk-next').hidden = false; } };
          setT(left, 1); timer = setInterval(tick, 100); $v('.vk-msg').textContent = blank ? 'Toca el micrófono y léela con tu información' : 'Toca el micrófono y léela';
          const finish = (ok) => { if (over) return; over = true; clearInterval(timer); done({ ok, late, hinted }); };
          $v('.vk-rep').onclick = () => { stop(); play(k.qau); }; $v('.vk-qa').onclick = () => { stop(); play(k.qau); };
          $v('.vk-hint').onclick = () => { stop(); if (k.aau) play(k.aau); };
          $v('.vk-next').onclick = () => finish(false);
          $v('.vk-mic').onclick = async () => {
            if (busy || over) return;
            if (!M.canSR) { showAns('Dila en voz alta'); if (k.aau) play(k.aau); $v('.vk-msg').textContent = 'Tu navegador no reconoce voz: repite en voz alta'; setTimeout(() => finish(true), 2600); return; }
            busy = true; stop(); vc.classList.add('rec'); $v('.vk-msg').textContent = 'Te escucho… habla con tu voz normal';
            const rr = await M.listen(9000, { quick: true }); vc.classList.remove('rec'); busy = false; if (over) return;
            if (!rr.alts || !rr.alts.length) { $v('.vk-msg').textContent = rr.error === 'not-allowed' ? 'Permite el micrófono en tu navegador para responder' : 'No te escuché. Acércate un poco al micrófono e intenta otra vez.'; return; }
            const fj = M.readJudge(k.q, tgt, rr.alts); const sc = { heard: fj.heard }; const ok = fj.ok; // v460: lee la respuesta → se revisa la pronunciación
            const fb = $v('.vk-fb'); fb.hidden = false; fb.className = 'vk-fb ' + (ok ? 'good' : 'bad'); fb.innerHTML = `<span class="vk-fi">${ok ? '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10"/></svg>' : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.5"/></svg>'}</span><div><b class="vk-fh">${ok ? (late ? '¡Bien dicho!' : '¡Excelente!') : 'Casi… léela otra vez'}</b><small>Escuché: “${esc(sc.heard || rr.alts[0])}”</small>${fj.fix ? `<em class="vk-fix">${ok ? 'Mejor dilo así' : 'Se dice'}: <b>${esc(fj.fix)}</b></em>` : ''}</div>`;
            { const im = $v('.vk-screen img'); im.src = (ok ? 'mra-thumbs' : 'mra-think') + '.webp?v=2'; } /* v456: Mr. Arrieta reacciona (un solo personaje en pantalla) */
            if (!ok) vc.classList.add('bad');
            if (ok) { sfx('ok'); M.praise(); vc.classList.add('ok'); $v('.vk-msg').textContent = late ? '¡Bien dicho!' : '¡Excelente!'; setTimeout(() => finish(true), fj.fix ? 3200 : 1500); }
            else { sfx('bad'); setTimeout(M.encourage, 250); $v('.vk-msg').textContent = 'Escucha cómo se dice y léela otra vez, despacio.'; if (k.aau) setTimeout(() => play(k.aau), 900); $v('.vk-next').hidden = false; }
          };
        });
        if (r.ok) { c++; if (!r.late) { streak++; pts += (r.hinted ? 50 : 100) * Math.min(3, streak); } else streak = 0; } else streak = 0;
        $v('.vk-p').textContent = pts; const se = $v('.vk-st'); se.hidden = streak < 2; se.querySelector('b').textContent = Math.min(3, streak);
        await sleep(300);
      }
      if (stage.isConnected) {
        const stars = c === N ? 3 : c >= Math.ceil(N * 0.6) ? 2 : c ? 1 : 0;
        vc.innerHTML = `<div class="vk-end"><img src="${PIC}.webp?v=2" alt=""><h3>¡Llamada terminada!</h3><div class="vk-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><p>Respondiste <b>${c} de ${N}</b> · <b>${pts}</b> puntos</p></div>`;
        if (stars >= 2) { M.confetti(1200); sfx('win'); }
        await A.waitNext(stage, 'Continuar');
      }
      return A.result(c, N, 'speaking');
    },

    speakLetters: async (stage, p) => {
      // Oral task for alphabet: spell your name / words aloud with recording
      const items = [{ en: 'How do you spell your name?', es: '¿Cómo deletreas tu nombre?', au: null }];
      const body = A.head(stage, { lbl: 'Oral task', title: 'Spell it out loud!', ins: 'Graba tu voz deletreando las letras en inglés y compárala con el modelo.' });
      const L = M.D.letters; const letters = p.vocab.map(v => v.en);
      const grid = h(`<div class="tiles"></div>`); body.appendChild(grid);
      letters.forEach(l => { const b = h(`<button class="tile">${l}</button>`); b.onclick = () => play(L[l]); grid.appendChild(b); });
      const nm = (S.name.split(' ')[0] || 'NAME').toUpperCase().replace(/[^A-Z]/g, '');
      body.appendChild(h(`<div class="lesson"><h3>🎤 Tu reto</h3><p>Deletrea tu nombre en inglés: <b style="font-size:22px;letter-spacing:4px">${esc(nm.split('').join('-'))}</b></p><p class="muted">Toca cada letra para escucharla y luego grábate.</p></div>`));
      const sp = h(`<div class="row" style="justify-content:center;margin-top:12px"></div>`); body.appendChild(sp);
      nm.split('').forEach(ch => { const b = h(`<button class="chip">${ch}</button>`); b.onclick = () => play(L[ch]); sp.appendChild(b); });
      const rb = h(`<div class="center" style="margin-top:14px"><button class="btn k">🎙️ Grabar y comprobar</button><p class="muted" style="font-size:14px;margin:6px 0 0">Di cada letra despacio: ${esc(nm.split('').join(' – '))}</p><div class="out"></div></div>`); body.appendChild(rb);
      let did = false, best = 0;
      const playModel = async () => { for (const ch of nm.split('')) { await play(L[ch]); await sleep(180); } };
      const go = async () => { const b = $('button', rb); const secs = Math.min(10, 3 + nm.length * 0.8);
        try { b.disabled = true; stop();
          const r = await M.recordScore(nm, secs * 1000, f => b.textContent = `🔴 Te escucho… ${Math.max(0, Math.ceil(secs * (1 - f)))}s`, M.letterScorer(nm));
          b.disabled = false; b.textContent = '🎙️ Grabar otra vez'; did = true; if (r.score != null) best = Math.max(best, r.score);
          const out = $('.out', rb); M.voiceResult(out, { score: r.score, heard: r.heard, url: r.url, model: playModel, onRetry: go, pass: 75 });
          out.addEventListener('selfok', () => { best = Math.max(best, 80); }, { once: true });
        } catch (err) { b.disabled = false; b.textContent = '🎙️ Grabar y comprobar'; M.toast('Permite el micrófono 🎤'); } };
      $('button', rb).onclick = go;
      if (window.MRVC) rb.prepend(MRVC.card({ target: $('button', rb), label: 'TOCA EL MICRÓFONO Y DELETREA', say: nm.split('').join(' - '), es: 'Deletrea tu nombre letra por letra', onEx: playModel, mascot: false }));
      void items;
      await A.waitNext(stage, 'Continuar'); return A.result(did && best >= 75 ? 1 : 0, 1, 'speaking');
    },

    music: async (stage, p) => playLearn(stage, p),

    hw: async (stage, p) => homework(stage, p),
    game9: async (stage, p) => { const pv = M.prevPart(p); const old = pv ? sample((pv.vocab || []).filter(v => v && v.en && !(p.vocab || []).some(x => x.en === v.en)), 2) : []; const fn = STEP[p._g9] || A[p._g9]; return fn(stage, Object.assign({}, p, { vocab: (p.vocab || []).concat(old) })); },
    kidsTap: async (stage, p) => {
      const pool = (p.sentences || []).filter(s => s.img && s.au), rounds = shuffle(pool.slice()).slice(0, Math.min(3, pool.length)); let c = 0; const missed = [];
      for (let n = 0; n < rounds.length; n++) {
        const tg = rounds[n], seen = { [tg.img]: 1, [tg.en]: 1 }, opts = shuffle([tg].concat(shuffle(pool.filter(s => s !== tg)).filter(s => { if (seen[s.img] || seen[s.en]) return false; seen[s.img] = seen[s.en] = 1; return true; }).slice(0, 3)));
        const body = A.head(stage, { lbl: 'Practice', title: 'Listen and tap', ins: 'Escucha y <b>toca la foto correcta</b>. Luego dilo tú en voz alta.', count: `${n + 1} / ${rounds.length}` });
        const top = h(`<div class="kt-top">${M.mascot('mascot', 'point')}<div class="kt-bub"><b>Escucha y toca la foto</b><button class="kt-pl" type="button">${window.MRI ? MRI('vol') : '🔊'}<span>Escuchar</span></button></div></div>`); body.appendChild(top);
        const grid = h(`<div class="kt-grid">${opts.map((o, k) => `<button class="kt-pic" type="button" data-k="${k}">${photo(o.img)}<span class="kt-cap">${esc(o.en)}</span></button>`).join('')}</div>`); body.appendChild(grid);
        const fb = h(`<div class="kt-say hidden"></div>`); body.appendChild(fb);
        const say = () => { stop(); play(tg.au); }; $('.kt-pl', top).onclick = () => { sfx('tap'); say(); }; setTimeout(say, 450);
        let first = true;
        await new Promise(res => {
          $$('.kt-pic', grid).forEach(b => b.onclick = () => {
            const o = opts[+b.dataset.k];
            if (o !== tg) { b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 600); sfx('bad'); setTimeout(M.encourage, 200); if (first) missed.push({ en: tg.en, au: tg.au }); first = false; return; }
            if (first) c++; $$('.kt-pic', grid).forEach(x => { x.disabled = true; if (x !== b) x.classList.add('dim'); }); b.classList.add('ok'); sfx('ok'); M.praise();
            fb.classList.remove('hidden');
            fb.innerHTML = `${window.MRVC && M.canSR ? '' : `<p class="kt-en">“${esc(tg.en)}”</p><p class="kt-es">${esc(tg.es || '')}</p>`}${M.canSR ? `<button class="mic kt-mic" type="button">🎤</button><p class="kt-st">¡Ahora dilo tú!</p>` : ''}<div class="actionbar"><button class="btn k lg" id="kt-n">Continuar →</button></div>`;
            const mic = $('.kt-mic', fb), stt = $('.kt-st', fb);
            if (mic && window.MRVC) { mic.before(MRVC.card({ target: mic, label: '¡AHORA DILO TÚ!', say: tg.en, es: tg.es, au: tg.au, mascot: false })); stt.textContent = ''; }
            if (mic) mic.onclick = async () => { stop(); mic.classList.add('rec'); stt.textContent = '¡Te estoy escuchando!'; const r = await M.listen(6000, { quick: true }); mic.classList.remove('rec');
              const sc = r.alts && r.alts.length ? M.speechScore(tg.en, r.alts).score : 0; if (sc >= 60) { sfx('ok'); M.praise(); stt.innerHTML = '¡Muy bien dicho! ⭐'; } else { stt.textContent = r.alts && r.alts.length ? '¡Casi! Escucha y dilo otra vez.' : 'No te escuché. Toca el micrófono otra vez.'; setTimeout(M.encourage, 200); } };
            $('#kt-n', fb).onclick = () => { stop(); res(); };
          });
        });
        stage.innerHTML = '';
      }
      return A.result(c, rounds.length, 'listening', missed);
    },
  };
  window.M1STEP = STEP; // (pruebas)
  // practice activities map
  ['learn', 'listenChoose', 'pickWord', 'typeWord', 'typeLetter', 'typeNumber', 'phone', 'spellName', 'typeSentence', 'fill', 'unscramble', 'memory', 'sort', 'crossword', 'speed', 'spell', 'plural', 'dialogue', 'speak', 'speakWords', 'wordSearch', 'hangman', 'bubblePop', 'matchLines', 'quizShow', 'oddOneOut', 'catchWord', 'spinWheel', 'raceGame', 'sayPop', 'clockGreet', 'chatReply', 'simonLetters', 'plateGame', 'passport', 'airport', 'bingo', 'colorMix', 'slotBe', 'whackAn', 'riddleJob', 'elevator', 'familyTree', 'animalSounds', 'restaurant', 'market', 'dayFlip', 'specialDates', 'weatherTV', 'suitcase', 'flashlight', 'housePlan', 'pluralMachine', 'magicMirror', 'nearFar', 'theseRush', 'countRoom', 'memoryRoom']
    .forEach(k => { STEP[k] = (stage, p) => A[k](stage, p); });
  ['g9Chat', 'g9Pairs', 'g9Stars', 'g9Monster', 'g9Swipe', 'g9Beat', 'g9Train', 'g9Memory', 'g9Gap', 'g9Spell', 'g9Hunt', 'g9Dict', 'g9Climb', 'g9Puzzle', 'g9Odd', 'g9Trans', 'g9Ending', 'g9Chunks', 'g9Wheel', 'g9Letter', 'g9Show', 'g9AB', 'g9Secret', 'g9Interp'].forEach(k => { STEP[k] = async (stage, p) => { const r = window.MRAGE2 && MRAGE2[k] ? await MRAGE2[k](stage, p) : null; if (r !== null) return r; const alt = ((C.PLAN || PLAN)[p.id] || p.acts || []).find(a => !['learn', 'speak', 'speakWords'].includes(a)); return alt ? (STEP[alt] || A[alt])(stage, p) : null; }; });

  /* ---------- MUSIC · PLAY & LEARN (una canción A1 por lección) ---------- */
  /* ---------- juegos durante la canción: BINGO (A1/A2) y BURBUJAS (B2/B2+) ---------- */
  function songTraps(sg, n) {
    const SG = window.M1SONGS || { songs: {} }; const mine = new Set((sg.kw || []).map(k => k.en.toLowerCase()));
    const pool = []; Object.values(SG.songs).forEach(x => (x.kw || []).forEach(k => { if (!mine.has(k.en.toLowerCase()) && !pool.some(p => p.en.toLowerCase() === k.en.toLowerCase())) pool.push(k); }));
    return sample(pool, n);
  }
  function songBingo(el, sg, yh) {
    const reals = sample(sg.kw || [], Math.min(6, (sg.kw || []).length)); const cells = shuffle(reals.map(k => ({ ...k, ok: true })).concat(songTraps(sg, 9 - reals.length).map(k => ({ ...k, ok: false }))));
    el.innerHTML = `<div class="sb"><div class="sb-h"><b>🎯 BINGO MUSICAL</b><span>Toca las palabras que <b>escuches en la canción</b>. ¡Cuidado con las trampas!</span></div>
      <div class="sb-grid">${cells.map((k, i) => `<button class="sb-c" data-i="${i}">${esc(k.en)}</button>`).join('')}</div><div class="sb-st"><span id="sb-n">0 / ${reals.length} encontradas</span><span id="sb-l">❤️❤️❤️</span></div></div>`;
    let found = 0, lives = 3, bingo = false, wrong = 0; const marked = new Set();
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    el.querySelectorAll('.sb-c').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, k = cells[i]; if (marked.has(i) || lives <= 0) return; marked.add(i);
      if (k.ok) { found++; b.classList.add('ok'); sfx('ok'); el.querySelector('#sb-n').textContent = `${found} / ${reals.length} encontradas`;
        if (!bingo && lines.some(L => L.every(j => marked.has(j) && cells[j].ok))) { bingo = true; const bb = h('<div class="sb-bingo">BINGO! 🎉</div>'); el.querySelector('.sb').appendChild(bb); M.confetti(2200); sfx('win'); setTimeout(() => bb.remove(), 2200); }
        if (found === reals.length) { M.toast('🏆 ¡Encontraste todas las palabras de la canción!'); if (!bingo) { M.confetti(1500); sfx('win'); } } }
      else { wrong++; lives--; b.classList.add('bad'); sfx('bad'); el.querySelector('#sb-l').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives); M.toast(`❌ “${k.en}” no suena en esta canción`); if (lives <= 0) M.toast('Sin vidas 🙈 Escucha bien y sigue con los retos.'); }
    });
    return { stop() { el.querySelectorAll('.sb-c').forEach((b, i) => { b.disabled = true; if (cells[i].ok && !marked.has(i)) b.classList.add('miss'); }); return { c: Math.max(0, Math.round(3 * (found - wrong) / Math.max(1, reals.length))), t: 3 }; } };
  }
  function songBubbles(el, sg, yh) {
    const reals = (sg.kw || []).slice(); const traps = songTraps(sg, Math.max(4, reals.length));
    el.innerHTML = `<div class="sb"><div class="sb-h"><b>🫧 BURBUJAS MUSICALES</b><span>Dale play y revienta las burbujas con palabras que <b>suenan en la canción</b>. Evita las trampas.</span></div>
      <div class="bb-area"><div class="bb-wait">▶ Dale play al video para que salgan las burbujas</div></div><div class="sb-st"><span id="bb-p">⭐ 0</span><span id="bb-c"></span><span id="bb-l">❤️❤️❤️</span></div></div>`;
    const area = el.querySelector('.bb-area'); let playing = false, pts = 0, combo = 0, lives = 3, good = 0, bad = 0, n = 0, iv = null, alive = true;
    const spawn = () => {
      if (!playing || lives <= 0 || !alive || !area.isConnected) return; const isReal = Math.random() < 0.55; const k = isReal ? reals[n++ % reals.length] : traps[Math.floor(Math.random() * traps.length)]; if (!k) return;
      const b = h(`<button class="bb">${esc(k.en)}</button>`); b.style.left = (5 + Math.random() * 62) + '%'; b.style.animationDuration = (5 + Math.random() * 2.5) + 's'; area.appendChild(b);
      b.onclick = () => { if (b.classList.contains('pop')) return; b.classList.add('pop'); setTimeout(() => b.remove(), 300);
        if (isReal) { good++; combo++; pts += 10 * Math.min(combo, 5); sfx('ok'); el.querySelector('#bb-c').textContent = combo > 1 ? `🔥 Combo x${Math.min(combo, 5)}` : ''; }
        else { bad++; combo = 0; lives--; sfx('bad'); el.querySelector('#bb-c').textContent = `❌ “${k.en}” no suena`; el.querySelector('#bb-l').textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(3 - Math.max(0, lives)); if (lives <= 0) { el.querySelector('#bb-c').textContent = '🙈 Sin vidas — ¡buen intento!'; } }
        el.querySelector('#bb-p').textContent = '⭐ ' + pts; };
      b.addEventListener('animationend', () => b.remove());
    };
    const setPlay = (on) => { playing = on; const w = area.querySelector('.bb-wait'); if (w) w.style.display = on ? 'none' : ''; clearInterval(iv); if (on) iv = setInterval(spawn, 1300); };
    yh.addEventListener('ytstate', e => setPlay(e.detail === 1));
    // si el video no se puede reproducir aquí, el estudiante puede iniciar las burbujas tocando el aviso
    area.querySelector('.bb-wait').onclick = () => setPlay(true);
    return { stop() { alive = false; clearInterval(iv); area.querySelectorAll('.bb').forEach(b => b.remove()); return good + bad ? { c: Math.max(0, Math.round(3 * good / (good + bad * 2))), t: 3 } : null; } };
  }
  const YBLOCK = /^(b2hotelcal|b2empirestate|moneymoney|littleless|m4a_ifiwereaboy|m4a_wheniwasyourman|m4d_waiting|m4a_wherehaveyoubeen|m4d_getlucky|bohemian|bornthisway|m4c_nine2five|m4c_anotherbrick|m4c_brick)$/; /* v451: canciones no aptas para menores (Kids/Teens) en los Módulos 3 y 4 */
  function songFor(p) { const SG = window.M1SONGS; if (!SG) return null; const id = SG.map[p.id]; if (id && window.MYAGE_ON && YBLOCK.test(id)) return null; return id ? SG.songs[id] : null; }
  // video con respaldo: si YouTube no permite verlo aquí, prueba automáticamente el siguiente video
  let ytApi = null;
  function loadYT() { if (window.YT && YT.Player) return Promise.resolve(); if (ytApi) return ytApi;
    ytApi = new Promise(r => { const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev && prev(); r(); }; const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; sc.onerror = r; document.head.appendChild(sc); });
    return ytApi; }
  function ytBox(sg, host) {
    const ids = [sg.yt, ...(sg.alt || [])]; let k = 0;
    host.innerHTML = `<div class="ytwrap"><div class="ytp"></div></div><p class="center yt-msg hidden" style="margin:8px 0 0"></p>`;
    const msg = $('.yt-msg', host);
    const showLink = () => { msg.innerHTML = `<a class="btn w sm" href="https://www.youtube.com/watch?v=${esc(ids[0])}" target="_blank" rel="noopener" style="text-decoration:none">▶ Ver la canción en YouTube</a>`; msg.classList.remove('hidden'); };
    loadYT().then(() => {
      if (!(window.YT && YT.Player)) { $('.ytwrap', host).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(ids[0])}?rel=0&playsinline=1&hl=en${window.MRCLIP ? `&start=${MRCLIP(sg)[0]}&end=${MRCLIP(sg)[1]}` : ''}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`; showLink(); return; }
      const player = new YT.Player($('.ytp', host), { videoId: ids[0], width: '100%', height: '100%', playerVars: Object.assign({ rel: 0, modestbranding: 1, playsinline: 1, hl: 'en', enablejsapi: 1 }, window.MRCLIP ? { start: MRCLIP(sg)[0], end: MRCLIP(sg)[1] } : {}),
        events: { onStateChange: (e) => host.dispatchEvent(new CustomEvent('ytstate', { detail: e.data })), onReady: () => { }, onError: () => { k++; if (k < ids.length) player.loadVideoById(window.MRCLIP ? { videoId: ids[k], startSeconds: MRCLIP(sg)[0], endSeconds: MRCLIP(sg)[1] } : ids[k]); else { $('.ytwrap', host).classList.add('hidden'); showLink(); } } } });
    });
  }
  async function playLearn(stage, p) {
    const sg = songFor(p); if (!sg) return null;
    const lbl = 'Play & Learn';
    if (V9() && sg.g && sg.g.length >= 2) { const r9 = await A.song9(stage, sg, { lbl: 'Music' }); if (r9) return A.result(r9.c, r9.t, 'listening', r9.missed); } // v475: Completa lo que falta
    let c = 0, t = 0; const missed = [];
    const mark = (ok, it) => { t++; if (ok) c++; else missed.push({ en: it.full || it.en, au: it.au }); };
    // 2) Escuchar la canción
    {
      const body = A.head(stage, { lbl, title: `🎵 ${esc(sg.title)}`, ins: `<b>${esc(sg.artist)}</b> · Escucha la canción completa y juega mientras suena. ¡Si quieres, canta!` }); // 🎵 directo al video y al juego (sin la pregunta de predicción)
      const yh = h('<div></div>'); body.appendChild(yh); ytBox(sg, yh);
      const gm = h('<div></div>'); body.appendChild(gm);
      const g = (['A1', 'A2'].includes(M.MOD.id) ? songBingo : songBubbles)(gm, sg, yh);
      await A.waitNext(stage, 'Ya la escuché, ¡a jugar! 🎮');
      const sc = g.stop(); if (sc && sc.t) { t += sc.t; c += sc.c; }
    }
    if (V9()) return A.result(c, Math.max(t, 1), 'listening', missed); // lección corta: solo el video con su juego
    // 3) Listen & choose / order (frases inspiradas en la canción)
    const lc = sample(sg.lc.filter(x => x.type === 'blank'), 3);
    for (let n = 0; n < lc.length; n++) {
      if (!stage.isConnected) return A.result(c, t, 'listening', missed);
      const it = lc[n];
      const body = A.head(stage, { lbl, title: it.type === 'order' ? 'Listen and order' : 'Listen and complete', ins: it.type === 'order' ? 'Escucha y ordena las palabras.' : 'Escucha la frase y elige la palabra que falta.', count: `${n + 1} / ${lc.length}` });
      const pb = h('<div class="center"></div>'); pb.appendChild(A.playBtn(it.au)); body.appendChild(pb);
      setTimeout(() => M.play(it.au), 350);
      let ok;
      if (it.type === 'blank') {
        const sent = h(`<div class="sent">${esc(it.s).replace('___', '<span class="blank">&nbsp;</span>')}</div>`); body.appendChild(sent);
        const opts = shuffle(it.o.slice()); const wrap = h(`<div class="opts"></div>`); body.appendChild(wrap);
        const btns = opts.map(o => { const b = h(`<button class="opt">${esc(o)}</button>`); wrap.appendChild(b); return b; });
        const i = await A.choose(btns); ok = opts[i] === it.a;
        btns[opts.indexOf(it.a)].classList.add('right'); if (!ok) btns[i].classList.add('wrong'); $('.blank', sent).textContent = it.a;
      } else ok = await orderQ(body, it.w, it.a, it.full);
      mark(ok, it); M.play(it.au);
      await A.feedback(ok, it.full, it.x);
    }
    // 4) Grammar
    const gr = sample(sg.gr, Math.min(2, sg.gr.length));
    for (let n = 0; n < gr.length; n++) {
      if (!stage.isConnected) return A.result(c, t, 'listening', missed);
      const it = gr[n];
      const body = A.head(stage, { lbl, title: 'Grammar with music', ins: 'Elige la palabra correcta.', count: `${n + 1} / ${gr.length}` });
      const sent = h(`<div class="sent">${esc(it.s).replace('___', '<span class="blank">&nbsp;</span>')}</div>`); body.appendChild(sent);
      const opts = shuffle(it.o.slice()); const wrap = h(`<div class="opts" style="grid-template-columns:repeat(${opts.length},1fr)"></div>`); body.appendChild(wrap);
      const btns = opts.map(o => { const b = h(`<button class="opt">${esc(o)}</button>`); wrap.appendChild(b); return b; });
      const i = await A.choose(btns); const ok = opts[i] === it.a;
      btns[opts.indexOf(it.a)].classList.add('right'); if (!ok) btns[i].classList.add('wrong'); $('.blank', sent).textContent = it.a;
      mark(ok, { full: it.s.replace('___', it.a) }); await A.feedback(ok, it.s.replace('___', it.a), it.x);
    }
    // 5) Word order (writing)
    const wo = sample(sg.wo, Math.min(1, sg.wo.length));
    for (let n = 0; n < wo.length; n++) {
      if (!stage.isConnected) return A.result(c, t, 'listening', missed);
      const it = wo[n];
      const body = A.head(stage, { lbl, title: 'Put the words in order', ins: 'Forma la oración tocando las palabras en orden.', count: `${n + 1} / ${wo.length}` });
      const ok = await orderQ(body, it.w, it.a, it.full); mark(ok, it); M.play(it.au);
      await A.feedback(ok, it.full, 'Recuerda: <b>Sujeto + Verbo + Complemento</b>.');
    }
    // 6) Sing & speak
    const sp = sample(sg.sp, Math.min(1, sg.sp.length));
    for (let n = 0; n < sp.length; n++) {
      if (!stage.isConnected) return A.result(c, t, 'listening', missed);
      const it = sp[n];
      const body = A.head(stage, { lbl, title: 'Sing & speak', ins: `Completa en voz alta: <b>${esc(it.p)}</b><br>Escucha el modelo y repítelo 🎤.`, count: `${n + 1} / ${sp.length}` });
      const r = await A.speakCard(body, { en: it.en, au: it.au });
      if (r.ok !== null) mark(r.ok, it);
    }
    // cierre
    {
      const pct = t ? Math.round(c / t * 100) : 0;
      stage.innerHTML = `<div class="center"><span class="lbl">${lbl}</span>${M.mascot('mascot bounce', pct >= 70 ? 'celebrate' : 'thumbs')}
        <h2 style="margin:10px 0 4px">🎶 ${esc(sg.title)} — ${pct}%</h2><p class="muted">${pct >= 70 ? '¡Excelente! Ya puedes cantar esta canción entendiendo lo que dice.' : '¡Buen intento! Escucha la canción otra vez y repite las palabras clave.'}</p></div>`;
      await A.waitNext(stage, 'Continuar');
    }
    return A.result(c, t, 'listening', missed);
  }
  function orderQ(body, words, correct, full) {
    return new Promise(res => {
      const line = h(`<div class="line"></div>`); const bank = h(`<div class="bank"></div>`); body.appendChild(line); body.appendChild(bank);
      const pu = (String(full || '').trim().match(/[.?!]$/) || [''])[0] || (/^(what|where|when|who|why|how|which|whose|do|does|did|is|are|was|were|can|could|will|would|should|have|has)$/i.test(words.concat().sort((a, b) => correct.indexOf(a) - correct.indexOf(b))[0] || correct[0] || '') ? '?' : ''); if (pu) line.dataset.p = pu; // signo final (¿?) como en las demás actividades
      let order = shuffle(words.map((t, i) => ({ t, i }))); if (order.length > 1 && order.map(o => o.t).join(' ') === correct.join(' ')) order = order.reverse();
      const picked = [];
      order.forEach(o => {
        const chip = h(`<button class="chip">${esc(o.t)}</button>`); bank.appendChild(chip);
        chip.onclick = () => { if (chip.classList.contains('used')) return; sfx('tap'); chip.classList.add('used'); const c2 = h(`<button class="chip">${esc(o.t)}</button>`); line.appendChild(c2); picked.push(o);
          c2.onclick = () => { sfx('tap'); c2.remove(); chip.classList.remove('used'); picked.splice(picked.indexOf(o), 1); }; };
      });
      const hintP = h(`<p class="center hidden" style="margin:10px 0 0"><span class="hint"></span></p>`); body.appendChild(hintP);
      const bar = h(`<div class="actionbar"><button class="btn w" id="oh">💡 Pista</button><button class="btn k lg" id="oc">Comprobar ✓</button></div>`); body.appendChild(bar);
      // pista: dice qué palabra va después y la hace parpadear (sin ponerla)
      $('#oh', bar).onclick = () => {
        const eqw = (x, y) => M.norm(x, false) === M.norm(y, false); let k = 0; while (k < picked.length && eqw(picked[k].t, correct[k])) k++;
        if (k < picked.length) { $('.hint', hintP).innerHTML = '💡 Hay una palabra en el lugar equivocado: tócala arriba para quitarla.'; hintP.classList.remove('hidden'); return; }
        const nxt = correct[k]; $('.hint', hintP).innerHTML = k === 0 ? `💡 La oración empieza con: <b>${esc(nxt)}</b>` : `💡 La siguiente palabra es: <b>${esc(nxt)}</b>`; hintP.classList.remove('hidden');
        const ch = [...bank.children].find(c => !c.classList.contains('used') && eqw(c.textContent, nxt)); if (ch) { ch.classList.remove('blink'); void ch.offsetWidth; ch.classList.add('blink'); }
      };
      $('#oc', bar).onclick = () => {
        if (picked.length < words.length) { M.toast('Usa todas las palabras 😉'); return; }
        const ok = M.norm(picked.map(o => o.t).join(' '), false) === M.norm(correct.join(' '), false);
        line.classList.add(ok ? 'right' : 'wrong'); bar.remove(); res(ok);
      };
    });
  }

  /* ---------- HOMEWORK (writing with automatic feedback) ---------- */
  async function homework(stage, p) {
    { const W10 = window.MRWR10 && MRWR10[(+M.MOD.n || 1) + '-' + p.id]; if (W10) { const ag = M.ageGroup(); const it = W10[ag] || W10.adult; if (it) return await writing10(stage, p, it, ag); } } /* v458: writing corto que rota (chat · corrige · termina la frase) */
    const k9 = (+M.MOD.n || 1) + '-' + p.id, yA9 = (function () { try { return M.ageGroup(); } catch (e) { return ''; } })(); const h9 = (/kids|teens/.test(yA9) && window.MRHW9Y && MRHW9Y[k9]) || (window.MRHW9 && MRHW9[k9]); const hw = V9() ? Object.assign({}, p.hw, { n: 2 }, h9 ? { es: h9[0], model: h9[1], kw: h9[2] } : { es: String(p.hw.es || '').replace(/\b\d+\b/, '2') }) : p.hw; /* lección corta: solo 2 frases, en el momento */ const saved = (S.hw[p.id] || {}).text || '';
    const AG = M.ageGroup(); if (AG === 'teens') stage.classList.add('dk');
    const body = A.head(stage, { lbl: V9() ? 'Writing' : 'Homework', title: V9() ? 'Escribe 2 frases' : AG === 'teens' ? 'Nuevo post' : AG === 'kids' ? 'Tu tarea' : '✍️ Writing task', ins: esc(hw.es) }); { const ik = stage.querySelector('.ins'); if (ik) ik.classList.add('ins-keep'); } /* v457: el enunciado de la escritura sí se muestra */
    if (AG === 'kids') { const kt = h(`<div class="khw">${[['pen', '1', 'Escríbelo aquí', 'Abajo, en inglés'], ['mic', '2', 'Dilo en voz alta', 'Toca y practica']].map(([ic, n, t, s]) => `<div class="khw-t${n === '2' ? ' khw-say' : ''}"><span>${window.MRI ? MRI(ic) : ''}</span><b>${n}. ${t}</b><small>${s}</small></div>`).join('')}</div>`); body.appendChild(kt);
      const ks = $('.khw-say', kt); if (!M.canSR) ks.style.display = 'none'; else ks.onclick = async () => { const txt = ($('textarea.hw', body) || {}).value || ''; if (txt.trim().length < 5) { M.toast('Primero escribe tu tarea y luego dila en voz alta 😉'); return; } stop(); ks.classList.add('rec'); $('small', ks).textContent = '¡Te estoy escuchando!'; const r = await M.listen(12000); ks.classList.remove('rec'); const sc = r.alts && r.alts.length ? M.speechScore(txt, r.alts).score : 0; $('small', ks).textContent = sc >= 60 ? '¡Muy bien dicho! ⭐' : r.alts && r.alts.length ? '¡Casi! Inténtalo otra vez' : 'No te escuché, toca otra vez'; if (sc >= 60) { sfx('ok'); M.praise(); } else M.encourage(); }; }
    body.appendChild(h(`<p><span class="hint">Mínimo ${hw.n} ${/palabras|frutas|objetos|plural/.test(hw.es) && !/oraci/.test(hw.es) ? 'elementos' : 'oraciones'}</span> ${hw.kw.length ? `<span class="hint">Usa: ${hw.kw.map(esc).join(', ')}</span>` : ''}</p>`));
    const ta = h(`<textarea class="hw${AG === 'teens' ? ' tpost' : ''}" placeholder="${AG === 'teens' ? 'Escribe tu post en inglés…' : 'Escribe aquí en inglés…'}">${esc(saved)}</textarea>`); body.appendChild(ta);
    if (AG === 'teens' && hw.kw.length) { const chips = h(`<div class="tp-kw">${hw.kw.map(k => `<em data-k="${esc(k.toLowerCase())}">${esc(k)}</em>`).join('')}</div>`); body.appendChild(chips);
      const upd = () => { const t = ' ' + ta.value.toLowerCase().replace(/[^a-z0-9' ]/g, ' ') + ' '; $$('em', chips).forEach(e => e.classList.toggle('done', t.includes(' ' + e.dataset.k + ' '))); }; ta.addEventListener('input', upd); upd(); }
    // ✍️ v420: la tarea la escribe el estudiante: no se puede pegar texto ni copiar el ejemplo (el ejemplo se ve como imagen de guía, no se selecciona)
    ['paste', 'drop'].forEach(ev => ta.addEventListener(ev, e => { e.preventDefault(); M.toast('Escríbela tú mismo: así aprendes de verdad.'); }));
    const ex = h(`<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:700">Ver un ejemplo</summary><div class="tipbox hw-ex" style="margin-top:8px">${esc(hw.model)}</div><small class="muted">Es solo una guía: escribe sobre ti con tus propias palabras.</small></details>`); body.appendChild(ex);
    const exEl = $('.hw-ex', ex); ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(ev => exEl.addEventListener(ev, e => e.preventDefault()));
    const out = h(`<ul class="checks"></ul>`); body.appendChild(out);
    const sent = h(`<div class="ce-hwsent hidden"></div>`); body.appendChild(sent);
    const fbBox = h(`<div class="ce-hwfb hidden"></div>`); body.appendChild(fbBox);
    const prem = false; // ✍️ las tareas las revisa la plataforma (sin profe)
    const bar = h(`<div class="actionbar"></div>`); body.appendChild(bar);
    return await new Promise(res => {
      const idle = () => {
        bar.innerHTML = `${V9() ? '' : '<button class="btn w" id="skip">Hacerla después</button>'}<button class="btn k lg" id="chk">${V9() ? 'Revisar ✓' : AG === 'teens' ? 'Publicar ✓' : 'Revisar mi tarea ✓'}</button>`;
        if ($('#skip', bar)) $('#skip', bar).onclick = () => { S.hw[p.id] = { text: ta.value, at: Date.now() }; save(); res(null); };
        $('#chk', bar).onclick = check;
      };
      const check = () => {
        const txt = ta.value.trim(); if (txt.length < 5) { ta.focus(); M.toast('Escribe tu tarea primero ✍️'); return; }
        { const wd = (x) => M.words(x).filter(w => w.length > 2); const a = wd(txt), m = wd(hw.model || ''); if (m.length >= 4) { const ms = new Set(m), same = a.filter(w => ms.has(w)).length; if (a.length && same / Math.max(a.length, m.length) >= (m.length < 10 ? 1 : .7)) { out.innerHTML = `<li class="no"><span>❌</span><span><b>Esto es igual al ejemplo.</b> Escribe sobre ti con tus propias palabras: tu país, tus personas y tus ideas.</span></li>`; sfx('bad'); ta.focus(); return; } } } // v420: no vale copiar el ejemplo
        const fb = checkWriting(txt, hw); out.innerHTML = '';
        fb.items.forEach(f => out.appendChild(h(`<li class="${f.cls}"><span>${f.cls === 'ok' ? '✅' : f.cls === 'no' ? '❌' : '💡'}</span><span>${f.msg}</span></li>`)));
        const prevSent = S.hw[p.id] && S.hw[p.id].sent;
        S.hw[p.id] = { text: txt, at: Date.now(), score: fb.score }; if (prevSent && prevSent.text === txt) S.hw[p.id].sent = prevSent; save();
        bar.innerHTML = '';
        const again = h(`<button class="btn w">✏️ Corregir</button>`);
        const pct = fb.total ? Math.round(fb.ok / fb.total * 100) : 0;
        out.insertAdjacentHTML('afterbegin', `<li class="${pct >= 70 ? 'ok' : 'tip'} hw-auto"><span>${pct >= 70 ? '🏆' : '💪'}</span><span><b>Revisión de la plataforma: ${pct}%</b> · ${pct >= 90 ? '¡Excelente trabajo!' : pct >= 70 ? '¡Muy bien! Revisa los detalles para mejorar aún más.' : 'Vas por buen camino: corrige los puntos marcados y vuelve a revisar.'}</span></li>`);
        try { if (window.MRAC && MRAC.code && MRAC.code()) MRAC.homework({ module: M.MOD.id, part: p.id, title: `${M.MOD.es} · ${p._t.title} · ${PL(p)}: ${p.title}`, text: txt, score: fb.score }).catch(() => { }); } catch (e) { } // queda guardada (sin avisar a profes)
        const nx = h(`<button class="btn k lg">Terminar lección →</button>`);
        bar.append(again, nx); fb.ok >= fb.total * .7 ? sfx('ok') : sfx('bad');
        out.scrollIntoView({ behavior: 'smooth', block: 'start' });
        again.onclick = () => { out.innerHTML = ''; idle(); ta.focus(); };
        nx.onclick = async () => {
          // Premium: la tarea le llega al profe, que la revisa y da feedback (sin WhatsApp)
          if (prem && !(S.hw[p.id].sent && S.hw[p.id].sent.text === txt)) {
            nx.disabled = again.disabled = true; nx.textContent = 'Entregando…';
            let r = null; try { r = await MRAC.homework({ module: M.MOD.id, part: p.id, title: `${M.MOD.es} · ${p._t.title} · ${PL(p)}: ${p.title}`, text: txt, score: fb.score }); } catch (e) { }
            if (r && r.ok) { S.hw[p.id].sent = { at: Date.now(), text: txt }; save(); showSent(sent); sfx('win'); await sleep(1600); }
            else { nx.disabled = again.disabled = false; nx.textContent = 'Entregar tarea →'; M.toast(r && r.err === 'not_premium' ? 'Tu plan no incluye revisión del profe' : 'No se pudo entregar. Revisa tu conexión e intenta otra vez 🙏'); if (!(r && r.err === 'not_premium')) return; }
          }
          res(A.result(fb.ok, fb.total, 'writing'));
        };
      };
      idle();
    });
  }
  /* ---------- v458 · WRITING CORTO: 3 formatos que se turnan por lección, contenido por edad ---------- */
  async function writing10(stage, p, it, AG) {
    const I = n => window.MRI ? MRI(n) : '';
    const nz = x => String(x || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim();
    const cap = x => { x = String(x || '').trim().replace(/\s+/g, ' '); x = x.replace(/(^|\s)i(?=\s|'|’|$)/g, '$1I'); return x ? x[0].toUpperCase() + x.slice(1) : x; };
    const end = x => /[.!?]["”]?$/.test(x) ? x : x + '.';
    const esLike = x => (nz(x).match(/\b(el|la|los|las|que|con|para|una|por|pero|muy|tengo|soy|estoy|mi|y)\b/g) || []).length >= 2;
    const title = it.f === 'c' ? 'Responde a ' + esc(it.who) : it.f === 'x' ? 'Esta frase tiene 1 error. Escríbela bien.' : 'Completa con tus palabras';
    const body = A.head(stage, { lbl: it.f === 'x' ? 'Writing · contra reloj' : 'Writing', title });
    stage.classList.add('wr10');
    let top = '';
    if (it.f === 'c') top = `<div class="wr-chat"><div class="wr-who"><span class="wr-av">${esc(String(it.who || 'F')[0])}</span>${esc(it.who)}</div><div class="wr-bub">${esc(it.q)}</div><div class="wr-me hidden"></div></div>`;
    else if (it.f === 'x') { const b = esc(it.bad), e = esc(it.err), i = b.indexOf(e); top = `<div class="wr-bad">${i >= 0 ? b.slice(0, i) + '<u>' + e + '</u>' + b.slice(i + e.length) : b}</div><div class="wr-timer"><div class="wr-tl"><i></i></div><b>0:00</b></div>`; }
    else top = `<div class="wr-start">${esc(it.s)} <em class="wr-blank">&nbsp;</em></div><div class="wr-chips">${(it.ch || []).map(c => `<b>${esc(c)}</b>`).join('')}</div>`;
    body.appendChild(h(`<div class="wr-top">${top}</div>`));
    const ta = h(`<textarea class="wr-in" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="${it.f === 'c' ? 'Escribe tu respuesta en inglés…' : it.f === 'x' ? 'Escribe la frase correcta…' : 'Termina la frase en inglés…'}"></textarea>`);
    body.appendChild(ta);
    ['paste', 'drop'].forEach(ev => ta.addEventListener(ev, e => { e.preventDefault(); M.toast('Escríbela tú mismo: así aprendes de verdad.'); }));
    const fbBox = h(`<div class="wr-fb hidden"></div>`); body.appendChild(fbBox);
    const bar = h(`<div class="actionbar wr-bar"><button class="btn k lg" id="wrgo">Enviar</button></div>`); body.appendChild(bar);
    const go = $('#wrgo', bar);
    setTimeout(() => { try { ta.focus({ preventScroll: true }); } catch (e) { } }, 350);
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go.click(); } });
    return await new Promise(res => {
      let done = false, tries = 0, tmr = null;
      const show = (kind, head, msg, ex) => {
        const img = kind === 'ok' ? 'mra-thumbs' : 'mra-think';
        fbBox.className = 'wr-fb ' + kind; fbBox.innerHTML = `<img src="${img}.webp?v=2" alt=""><div><h4>${I(kind === 'ok' ? 'check' : 'bulb')}<span>${head}</span></h4>${msg ? `<p>${msg}</p>` : ''}${ex ? `<div class="wr-ex">${ex}</div>` : ''}</div>`;
        fbBox.classList.remove('hidden');
        try { fbBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { }
      };
      const finish = (c, txt) => {
        done = true; if (tmr) clearInterval(tmr); ta.readOnly = true; ta.classList.add('ro');
        S.hw[p.id] = { text: txt, at: Date.now(), score: Math.round(c / 2 * 100) }; save();
        try { if (window.MRAC && MRAC.code && MRAC.code() && txt) MRAC.homework({ module: M.MOD.id, part: p.id, title: `${M.MOD.es} · ${p._t.title} · ${PL(p)}: ${p.title}`, text: txt, score: Math.round(c / 2 * 100) }).catch(() => { }); } catch (e) { }
        bar.innerHTML = '<button class="btn k lg" id="wrnx">Continuar</button>';
        $('#wrnx', bar).onclick = () => { stop(); res(A.result(c, 2, 'writing')); };
      };
      const verdict = (c, txt, head, msg, ex) => { if (c === 2) { sfx('ok'); M.praise(); show('ok', head, msg, ex); } else { sfx('bad'); M.encourage(); show(c ? 'fix' : 'no', head, msg, ex); } finish(c, txt); };
      if (it.f === 'x') {
        const T = AG === 'kids' ? 60 : AG === 'teens' ? 45 : 30; let left = T; const tl = $('.wr-tl i', body), tb = $('.wr-timer b', body);
        const paint = () => { tl.style.width = (left / T * 100) + '%'; tb.textContent = '0:' + String(left).padStart(2, '0'); $('.wr-timer', body).classList.toggle('low', left <= 8); };
        paint(); tmr = setInterval(() => { if (done) return; left--; paint(); if (left <= 0) { clearInterval(tmr); const txt = ta.value.trim(); if (txt.length >= 3) check(true); else verdict(0, txt, 'Se acabó el tiempo', 'No pasa nada. Así se escribe:', esc(it.ok[0])); } }, 1000);
      }
      const check = (auto) => {
        if (done) return; const txt = ta.value.trim();
        if (!auto && M.words(txt).length < (it.f === 'f' ? 1 : 2)) { ta.focus(); M.toast(it.f === 'f' ? 'Escribe cómo termina la frase' : 'Escribe una frase completa'); return; }
        if (!auto && esLike(txt) && tries < 1) { tries++; ta.focus(); show('no', 'Escríbelo en inglés', 'Usa las palabras de la lección.', ''); sfx('bad'); return; }
        if (it.f === 'x') {
          const n = nz(txt), oks = it.ok.map(nz), nc = x => String(x || '').replace(/[’‘`´]/g, "'").replace(/[^A-Za-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim(), caseIt = oks.includes(nz(it.bad));
          if (it.ok.map(nc).includes(nc(txt))) return verdict(2, txt, '¡Bien visto! +10', esc(it.why), '');
          if (oks.includes(n)) return caseIt && nc(txt) === nc(it.bad) ? verdict(0, txt, 'El error sigue ahí', esc(it.why), esc(it.ok[0])) : verdict(1, txt, '¡Casi! +5', 'Revisa las mayúsculas:', esc(it.ok[0]));
          const best = oks.reduce((b, o) => Math.min(b, M.lev(n, o)), 99), stillErr = nz(it.bad) === n ? !caseIt || nc(txt) === nc(it.bad) : caseIt ? new RegExp('(^|\\s)' + nc(it.err).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)').test(nc(txt)) : new RegExp('(^|\\s)' + nz(it.err).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|$)').test(n);
          if (!stillErr && best <= Math.max(3, Math.round(oks[0].length * .12))) return verdict(1, txt, '¡Casi! +5', 'Corregiste el error. Revisa cómo se escribe:', esc(it.ok[0]));
          return verdict(0, txt, stillErr ? 'El error sigue ahí' : 'Revisa la frase', esc(it.why), esc(it.ok[0]));
        }
        if (it.f === 'c') {
          const fj = M.freeJudge(it.q, it.m, [txt]); const me = $('.wr-me', body); me.textContent = end(cap(txt)); me.classList.remove('hidden');
          if (fj.ok) return verdict(2, txt, '¡Perfecto! +10', 'Respuesta clara y bien escrita.', '');
          if (fj.fix) return verdict(1, txt, '¡Casi! +5', 'Se entiende. Mejor así:', esc(end(cap(fj.fix))));
          { const gf = M.grammarFix(txt); if (M.words(txt).length >= 3 && !esLike(txt) && !fj.rep) return gf ? verdict(1, txt, '¡Casi! +5', 'Se entiende. Mejor así:', esc(end(cap(gf)))) : verdict(2, txt, '¡Muy bien! +10', 'Respuesta clara. Otra forma de decirlo:', esc(it.m)); } /* v460: nunca se rechaza una respuesta libre en inglés */
          if (tries < 1) { tries++; me.classList.add('hidden'); show('no', 'Escribe una frase completa', 'Responde el mensaje con una frase en inglés.', ''); sfx('bad'); ta.focus(); return; }
          return verdict(0, txt, 'Sigue practicando', 'Una respuesta posible:', esc(it.m));
        }
        const full = end(String(it.s).trim() + ' ' + txt.replace(/^\s*\.\.\.\s*/, '')); const gf = M.grammarFix(full);
        $('.wr-start', body).innerHTML = esc(full); $('.wr-chips', body).style.display = 'none';
        if (!gf) return verdict(2, txt, '¡Muy bien! +10', 'Tu frase está correcta y suena natural.', '');
        return verdict(1, txt, '¡Casi! +5', 'Mejor así:', esc(end(cap(gf))));
      };
      go.onclick = () => check(false);
    });
  }
  // tareas con revisión del profe: solo estudiantes Premium con sesión en la nube
  function hwPremium() { try { return !!(window.MRAC && MRAC.code() && MRAC.isPremium()); } catch (e) { return false; } }
  function showSent(box) { box.innerHTML = '✅ <b>Tarea guardada.</b> La plataforma ya la revisó.'; box.classList.remove('hidden'); }
  function hwFeedback(id) { try { return (window.MRAC && MRAC.code() && MRAC.feedbackFor(id)) || []; } catch (e) { return []; } }
  function renderHwFeedback(box, id) {
    const fb = hwFeedback(id); if (!fb.length) { box.classList.add('hidden'); return; }
    box.innerHTML = `<h3>💬 Feedback de tu profe</h3>` + fb.map(f => `<div class="ce-fbi"><div class="ce-fbh"><b>${esc(f.teacher || 'Tu profe')}</b><small>${esc(String(f.date || '').slice(0, 10))}</small></div><p>${esc(f.feedback || '')}</p></div>`).join('');
    box.classList.remove('hidden');
  }
  function checkWriting(txt, hw) {
    const items = []; let ok = 0, total = 0;
    const add = (pass, msgOk, msgNo) => { total++; if (pass) { ok++; items.push({ cls: 'ok', msg: msgOk }); } else items.push({ cls: 'no', msg: msgNo }); };
    const sentences = txt.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
    const isList = /palabras|frutas|objetos|plural/.test(hw.es) && !/oraci/.test(hw.es);
    const count = isList ? Math.max(sentences.length, txt.split(/[,\n]+/).filter(s => s.trim()).length) : sentences.length;
    add(count >= hw.n, `Cantidad: escribiste ${count} ${isList ? 'elementos' : 'oraciones'}. ¡Bien!`, `Escribiste ${count} ${isList ? 'elementos' : 'oraciones'}; se piden al menos <b>${hw.n}</b>.`);
    const low = txt.toLowerCase();
    const missingKw = hw.kw.filter(k => !new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]") + '\\b', 'i').test(low));
    if (hw.kw.length) add(!missingKw.length, `Usaste las palabras clave (${hw.kw.map(esc).join(', ')}).`, `Te faltó usar: <b>${missingKw.map(esc).join(', ')}</b>.`);
    if (!isList) {
      const capBad = sentences.filter(s => /^[a-z]/.test(s));
      add(!capBad.length, 'Todas tus oraciones empiezan con mayúscula.', `Empieza cada oración con <b>mayúscula</b>: “${esc(capBad[0] || '')}”`);
      const punBad = sentences.filter(s => !/[.!?]["”]?$/.test(s));
      add(!punBad.length, 'Terminas tus oraciones con punto (o signo).', `Termina cada oración con <b>punto (.)</b> o signo (? !).`);
    }
    // common mistakes of Spanish speakers
    const tips = [];
    if (/(^|\s)i(\s|'|’)/.test(txt)) tips.push('Escribe <b>I</b> (yo) siempre en mayúscula.');
    if (/\bi have \d+ (years|year)\b|\bhave (\w+ )?years\b/i.test(txt)) tips.push('Para la edad usa <b>I\'m ___ years old</b>, no <i>I have ___ years</i>.');
    if (/\b(colombian|mexican|american|spanish|english|french|italian|japanese|chinese|german|brazilian|canadian)\b/.test(txt)) tips.push('Las nacionalidades e idiomas van con <b>mayúscula</b> (Colombian, English).');
    if (/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|june|july|august|september|october|november|december)\b/.test(txt)) tips.push('Los días y meses van con <b>mayúscula</b> (Monday, July).');
    if (/\ba (a|e|i|o|u)\w+/i.test(txt) && !/\ba (uni|use|euro|one)/i.test(txt)) tips.push('Antes de sonido de vocal usa <b>an</b>: <i>an apple, an engineer</i>.');
    if (/\ban (b|c|d|f|g|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z)\w+/i.test(txt) && !/\ban (hour|honest)/i.test(txt)) tips.push('Antes de sonido de consonante usa <b>a</b>: <i>a book, a car</i>.');
    if (/\b(peoples|childs|mans|womans|foots|tooths|informations)\b/i.test(txt)) tips.push('Revisa los plurales irregulares: <i>people, children, men, women, feet, teeth</i>.');
    if (/\b(he|she|it) (are|am)\b|\b(they|we|you) is\b|\bi is\b|\bi are\b/i.test(txt)) tips.push('Verbo to be: <b>I am</b>, <b>he/she/it is</b>, <b>you/we/they are</b>.');
    if (/\b(he|she) (work|like|live|have)\b/i.test(txt)) tips.push('Con <b>he/she</b> el verbo lleva <b>-s</b>: <i>she works, he likes, she has</i>.');
    if (/\bis (a )?(red|blue|green|black|white|yellow) (car|house|dog|cat|dress|shirt)\b/i.test(txt) === false && /\b(car|house|dog|cat|dress|shirt) (red|blue|green|black|white|yellow)\b/i.test(txt)) tips.push('El color va <b>antes</b> del sustantivo: <i>a red car</i>.');
    if (/\s{2,}/.test(txt)) tips.push('Evita los espacios dobles entre palabras.');
    tips.forEach(t => items.push({ cls: 'tip', msg: t }));
    if (!tips.length && ok === total) items.push({ cls: 'ok', msg: '¡Excelente trabajo! No encontré errores comunes. 🌟' + (hwPremium() ? ' Entrégala y tu profe te dará feedback.' : '') });
    return { items, ok, total, score: Math.round(ok / total * 100) };
  }

  /* ---------------- RESULTS ---------------- */
  /* ---------- Fase 6: cierre de lección por edad (Teens = racha + siguiente nivel · Kids = sello + álbum) ---------- */
  function ageClose(p, nx, AG, pts) {
    const I = n => window.MRI ? MRI(n) : '';
    if (AG === 'teens') {
      const n = Math.max(1, (S.streak && S.streak.n) || 1), WD = ['D', 'L', 'M', 'M', 'J', 'V', 'S'], d0 = new Date().getDay();
      const days = Array.from({ length: 7 }, (_, k) => { const back = 6 - k; return `<i class="${back < n ? 'on' : ''}">${WD[(d0 - back + 70) % 7]}</i>`; }).join('');
      return `<div class="tc"><div class="tc-st"><span class="tc-ic">${I('flame')}</span><div><b>Racha de ${n} día${n === 1 ? '' : 's'}</b><small>Lección completada · +${pts} puntos</small></div><span class="tc-days">${days}</span></div>
        ${nx ? `<div class="tc-nx"><img src="mra-x-rocket5.webp?v=2" alt="Mr. Arrieta"><div><b>Next level unlocked</b><span>${esc(nx._t.title)} · ${PL(nx)}: ${esc(nx.title)}</span></div></div>` : ''}</div>`;
    }
    if (AG === 'kids') {
      const T = M.D.topics, got = T.filter(t => t.parts.some(pp => S.parts[pp.id] && S.parts[pp.id].done)).length;
      const al = T.map(t => { const on = t.parts.some(pp => S.parts[pp.id] && S.parts[pp.id].done); return `<i class="${t.n === p.topic ? 'new' : on ? 'on' : ''}">${t.n === p.topic || on ? I('star') : t.n}</i>`; }).join('');
      return `<div class="kc"><div class="kc-stamp"><div>${I('award')}<b>TEMA ${p.topic}</b><small>${esc(p._t.title)}</small></div></div>
        <div class="kc-alb"><b>Mi álbum de sellos · ${got} de ${T.length}</b><div class="kc-grid">${al}</div></div></div>`;
    }
    return '';
  }
  function wellDone(AG, stars, pts) {
    const I = n => window.MRI ? MRI(n) : '', nm = esc((S.name || '').split(' ')[0]);
    const o = h(`<div class="wd-ov ${AG}"><div class="wd-card"><b class="wd-l">${AG === 'kids' ? 'LECCIÓN COMPLETADA' : AG === 'adult' ? 'LECCIÓN COMPLETADA' : 'LESSON COMPLETE'}</b><h2>Well done!</h2><div class="wd-s">${AG === 'kids' ? '¡Lo lograste' + (nm ? ', ' + nm : '') + '!' : AG === 'adult' ? 'Excelente trabajo' + (nm ? ', ' + nm : '') + '.' : 'Great job' + (nm ? ', ' + nm : '')}</div>
      <img class="wd-m" src="mra-${AG === 'kids' ? 'celebrate' : AG === 'adult' ? 'present' : 'thumbs'}.webp" alt="Mr. Arrieta"><div class="wd-p"><span>${I('star')}${stars} estrella${stars === 1 ? '' : 's'}</span><span>+${pts} puntos</span></div><button type="button" class="wd-b">Ver mis resultados</button></div></div>`);
    document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('on'));
    M.confetti(3800, { flat: true, z: 10001, cols: AG === 'adult' ? ['#E3242B', '#0B2A5B', '#cbd5e1', '#1B4A9B'] : AG === 'kids' ? ['#E3242B', '#0B2A5B', '#f5b301', '#22c55e', '#3b82f6'] : ['#E3242B', '#ffffff', '#f5b301', '#60a5fa'] });
    try { const id = 'b93b9f5f0f'; if (AG === 'adult') play(id); else M.fbf().then(() => play(window.AUD && window.AUD['fb_' + id] ? 'fb_' + id : id)); } catch (e) { }
    const close = () => { o.classList.remove('on'); setTimeout(() => o.remove(), 250); }; $('.wd-b', o).onclick = close; o.onclick = (e) => { if (e.target === o) close(); };
  }
  function results(p, run) {
    run.res = Object.values(run.res || {});
    const c = run.res.reduce((a, r) => a + r.c, 0), t = run.res.reduce((a, r) => a + r.t, 0);
    const pct = t ? Math.round(c / t * 100) : 100; const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    const rec = S.parts[p.id]; const wasDone = rec.done;
    rec.done = true; rec.stars = Math.max(rec.stars || 0, stars); rec.best = Math.max(rec.best || 0, pct); rec.step = 0; rec.run = null; rec.at = Date.now();
    const revM = M.reviewMode(); if (revM) { S.rev = S.rev || {}; S.rev[p.id] = Object.assign(S.rev[p.id] || { s: Date.now() }, { d: Date.now() }); }
    const bonus = wasDone ? 10 : 50; S.xp += bonus; M.touchStreak(); S.last = p.id; save(); topbar();
    // per-skill breakdown in this class
    const sk = {}; run.res.forEach(r => { sk[r.skill] = sk[r.skill] || [0, 0]; sk[r.skill][0] += r.c; sk[r.skill][1] += r.t; });
    const weakest = Object.entries(sk).filter(([, v]) => v[1]).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
    const missed = []; run.res.forEach(r => (r.missed || []).forEach(m => { if (m.en && !missed.find(x => x.en === m.en)) missed.push(m); }));
    const nx = M.nextPart(p);
    const AG = M.ageGroup();
    /* v460 · resultados en una sola pantalla (todas las edades) */
    const head = AG === 'kids' ? '¡Misión cumplida!' : pct >= 90 ? '¡Lección perfecta!' : pct >= 70 ? '¡Muy buen trabajo!' : '¡Lección completada!';
    const I9 = n => window.MRI ? MRI(n) : '';
    const STAR = (on) => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`;
    const SKI = { listening: 'headphones', reading: 'book', speaking: 'mic', writing: 'pen' };
    const TIP9 = { listening: 'Repasa Listening: escucha otra vez los audios de la lección.', reading: 'Repasa Reading: lee el texto en voz alta una vez más.', speaking: 'Repasa Speaking: escucha el modelo y repite en voz alta.', writing: 'Repasa Writing: escribe 2 frases con lo que aprendiste.' };
    let extra = '';
    if (AG === 'teens') { const n = Math.max(1, (S.streak && S.streak.n) || 1), WD = ['D', 'L', 'M', 'M', 'J', 'V', 'S'], d0 = new Date().getDay(); const days = Array.from({ length: 7 }, (_, k) => { const back = 6 - k; return `<i class="${back < n ? 'on' : ''}">${WD[(d0 - back + 70) % 7]}</i>`; }).join('');
      extra = `<div class="r9-ex te"><span class="r9-ei">${I9('flame')}</span><div><b>Racha de ${n} día${n === 1 ? '' : 's'}</b>${nx ? `<small>Siguiente: ${esc(PL(nx))}${nx.topic !== p.topic ? ' · ' + esc(nx._t.title) : ''}</small>` : ''}</div><span class="r9-days">${days}</span></div>`; }
    else if (AG === 'kids') { const T = M.D.topics, got = T.filter(t => t.parts.some(pp => S.parts[pp.id] && S.parts[pp.id].done)).length;
      extra = `<div class="r9-ex ki"><span class="r9-ei">${I9('award')}</span><div><b>¡Sello del Tema ${p.topic}!</b><small>Mi álbum de sellos</small></div><span class="r9-al">${got}/${T.length}</span></div>`; }
    else { const tip = pct >= 90 || !weakest || weakest[1][0] / weakest[1][1] >= .9 ? '¡Excelente! Ya dominas este tema.' : TIP9[weakest[0]] || ''; if (tip) extra = `<div class="r9-ex ad"><span class="r9-ei">${I9('bulb')}</span><span>${tip}</span></div>`; }
    app.innerHTML = `<div class="player r9p"><div class="r9 ${AG}">
      <div class="r9-st">${[1, 2, 3].map(i => STAR(i <= stars)).join('')}</div>
      <h2>${head}</h2><p class="r9-les">${esc(p._t.title)} · ${PL(p)}${revM ? ` · Repasando ${M.revCount()} de ${M.totalParts()}` : ''}</p>
      <div class="r9-stats"><div><b>${pct}%</b><small>Precisión</small></div><div><b>+${run.xp + bonus}</b><small>Puntos</small></div><div><b>${c}/${t}</b><small>Respuestas</small></div></div>
      <div class="r9-sk">${SKILLS.map(([k, , nm]) => { const v = sk[k]; const pc = v && v[1] ? Math.round(v[0] / v[1] * 100) : null; return `<div>${I9(SKI[k])}<span>${nm}</span><i style="--w:${pc || 0}%"></i><em>${pc === null ? '—' : pc + '%'}</em></div>`; }).join('')}</div>
      ${extra}
      ${nx ? `<button class="r9-go" id="next">Siguiente lección →</button>` : `<button class="r9-go" id="fin">Examen final →</button>`}
      <div class="r9-lk"><button type="button" id="again">Repetir</button>${window.MRAP && MRAP.get() ? '<a id="home" href="index.html">Mi perfil</a>' : '<button type="button" id="home">Inicio</button>'}</div>
    </div></div>`;
    wellDone(AG, stars, run.xp + bonus); // v417: también adultos // 🎉 v415: "Well done!" con confeti al terminar (kids y teens)
    $('#again').onclick = () => route('class', p.id); if ($('#home').tagName === 'BUTTON') $('#home').onclick = () => route('home');
    if ($('#next')) $('#next').onclick = () => M.isUnlocked(nx.topic) ? route('class', nx.id) : (route('home'), lockGate(nx.topic));
    if ($('#fin')) $('#fin').onclick = () => M.finalUnlocked() ? route('final') : (route('home'), finalLockedModal());
    if (!M.brand || !M.brand('fin')) sfx('win'); /* v456: sonido de marca al terminar la lección */
    checkBadges();
  }

  /* ---------------- BADGES ---------------- */
  const BADGES = [
    ['first', '🚀', 'Primer paso', 'Completa tu primera lección', () => M.allParts().some(p => S.parts[p.id] && S.parts[p.id].done)],
    ['five', '📚', 'Estudiante dedicado', 'Completa 5 lecciones', () => M.allParts().filter(p => S.parts[p.id] && S.parts[p.id].done).length >= 5],
    ['perfect', '🏆', 'Lección perfecta', 'Obtén 3 estrellas', () => M.allParts().some(p => M.partStars(p.id) === 3)],
    ['streak3', '🔥', 'En racha', 'Estudia 3 días seguidos', () => (S.streak.n || 0) >= 3],
    ['xp1000', '⚡', '1000 puntos', 'Acumula 1000 puntos', () => S.xp >= 1000],
    ['speaker', '🎤', 'Gran speaker', 'Speaking por encima de 80%', () => S.skills.speaking[1] >= 10 && M.skillPct('speaking') >= 80],
    ['half', '⭐', 'Mitad del camino', 'Completa 14 lecciones', () => M.allParts().filter(p => S.parts[p.id] && S.parts[p.id].done).length >= 14],
    ['grad', '🎓', 'Graduado ' + (M.MOD.id === 'B2' ? 'B1' : M.MOD.id), 'Aprueba el examen final', () => S.final && S.final.best >= C.PASS_SCORE],
  ];
  function checkBadges() { S.badges = S.badges || []; BADGES.forEach(([id, e, n]) => { if (!S.badges.includes(id) && BADGES.find(b => b[0] === id)[4]()) { S.badges.push(id); setTimeout(() => M.toast(`🏅 ¡Nueva insignia: ${n} ${e}!`), 1500); } }); save(); }

  /* ---------------- PROGRESS ---------------- */
  function progress() {
    const parts = M.allParts(); const done = parts.filter(p => S.parts[p.id] && S.parts[p.id].done).length;
    const stars = parts.reduce((a, p) => a + M.partStars(p.id), 0);
    const weak = Object.entries(S.weak).sort((a, b) => b[1].n - a[1].n).slice(0, 20);
    S.badges = S.badges || [];
    const sk = SKILLS.map(([k]) => [k, M.skillPct(k), S.skills[k][1]]).filter(x => x[2]);
    const low = sk.sort((a, b) => a[1] - b[1])[0];
    app.innerHTML = `<div class="wrap">
      <div class="card"><div class="row"><div class="ring" style="--p:${M.overallPct()}"><b>${M.overallPct()}%</b></div><div class="grow"><span class="lbl">Mi progreso</span><h1 style="font-size:30px;margin-top:8px">${esc(S.name)}</h1><p class="muted" style="margin:4px 0">${M.MOD.es} · Nivel ${M.MOD.id}</p></div></div>
        <div class="stats" style="grid-template-columns:repeat(4,1fr)"><div class="stat"><b>${done}/${parts.length}</b><small>Lecciones</small></div><div class="stat"><b>${stars}/${parts.length * 3}</b><small>Estrellas</small></div><div class="stat" title="${esc(M.PTS_TIP)}"><b>${S.xp}</b><small>Puntos ⚡</small></div><div class="stat"><b>🔥 ${S.streak.n || 0}</b><small>Racha (días)</small></div></div>
        <h3 style="margin:14px 0 8px">Tus 4 habilidades</h3>
        <div class="skills" style="margin-top:0">${SKILLS.map(([k, ic, nm]) => `<div class="skill"><div class="ic">${ic}</div><div class="nm">${nm}</div><div class="bar"><i style="width:${M.skillPct(k)}%"></i></div><small class="muted">${S.skills[k][1] ? M.skillPct(k) + '% · ' + S.skills[k][1] + ' ejercicios' : 'Sin datos aún'}</small></div>`).join('')}</div>
        ${low ? `<div class="tipbox" style="margin-top:12px"><span>🎯</span><span><b>Recomendación:</b> tu habilidad para mejorar es <b>${low[0]}</b>. ${SKILL_TIPS[low[0]]}</span></div>` : ''}
      </div>
      <div class="sect-title"><h2>🏅 Insignias</h2></div>
      <div class="badges">${BADGES.map(([id, e, n, d]) => `<div class="bdg ${S.badges.includes(id) ? '' : 'off'}"><div class="e">${e}</div><b>${n}</b><small>${d}</small></div>`).join('')}</div>
      <div class="sect-title"><h2>🔁 Palabras para repasar</h2>${weak.length ? '<button class="btn sm k" id="pw">🎯 Practicar ahora</button>' : ''}</div>
      <div class="card">${weak.length ? `<div class="weak">${weak.map(([w, v], i) => `<span>${esc(w)} ${v.au ? `<button class="aud sm" data-i="${i}">🔊</button>` : ''}</span>`).join('')}</div>` : '<p class="muted" style="margin:0">¡Aún no hay palabras difíciles! Aquí aparecerán las palabras en las que te equivoques, para que las repases.</p>'}</div>
      <div class="sect-title"><h2>📚 Temas</h2></div>
      <div class="tlist">${D.topics.map(t => `<div class="trow"><span class="n">${t.n}</span><b>${esc(t.title)}${M.isUnlocked(t.n) ? '' : ' 🔒'}</b>${t.parts.map(p => `<span class="stars ${p.part === 2 ? 'hs' : ''}" title="${PL(p)}">L${p.part} ${[1, 2, 3].map(i => `<span class="${i <= M.partStars(p.id) ? '' : 'off'}">⭐</span>`).join('')}</span>`).join('')}</div>`).join('')}</div>
      <div class="sect-title"><h2>⚙️ Datos</h2></div>
      <div class="card"><p class="muted" style="margin-top:0">Tu progreso se guarda en este dispositivo y navegador. Puedes descargar una copia de respaldo o restaurarla en otro dispositivo.</p>
        <div class="row"><button class="btn sm w" id="exp">⬇️ Descargar respaldo</button><label class="btn sm w" style="cursor:pointer">⬆️ Restaurar respaldo<input type="file" accept=".json" id="imp" hidden></label><button class="btn sm w" id="rst" style="color:var(--bad)">🗑️ Reiniciar progreso</button></div></div>
    </div>`;
    $$('.weak button', app).forEach(b => b.onclick = async () => { await M.loadAudio(['common', ...D.topics.map(t => M.MOD.audio + t.n)]); play(weak[+b.dataset.i][1].au, { btn: b }); });
    if ($('#pw')) $('#pw').onclick = () => practiceWeak(weak);
    $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = `progreso-modulo1-${S.name.replace(/\s+/g, '_')}.json`; a.click(); };
    $('#imp').onchange = async (e) => { try { const d = JSON.parse(await e.target.files[0].text()); if (!d.v) throw 0; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, d); save(); M.toast('Progreso restaurado ✅'); route('progress'); } catch (er) { M.toast('Archivo no válido'); } };
    $('#rst').onclick = () => { const m = M.modal(`<h3>¿Reiniciar todo tu progreso?</h3><p class="muted">Se borrarán tus estrellas, puntos y lecciones completadas en este dispositivo. Los códigos de acceso se conservan.</p><div class="row"><button class="btn w" id="n">Cancelar</button><button class="btn k" id="y" style="background:var(--bad);color:#fff">Sí, reiniciar</button></div>`);
      $('#n', m).onclick = () => m.remove(); $('#y', m).onclick = () => { const keep = { name: S.name, unlocked: S.unlocked, all: S.all, review: S.review }; localStorage.removeItem('mra_m1_progress_v1'); Object.keys(S).forEach(k => delete S[k]); Object.assign(S, { v: 1, created: Date.now(), xp: 0, streak: { last: '', n: 0 }, parts: {}, skills: { listening: [0, 0], reading: [0, 0], speaking: [0, 0], writing: [0, 0] }, weak: {}, final: null, hw: {}, sound: true, badges: [] }, keep); save(); m.remove(); route('home'); }; };
  }
  async function practiceWeak(weak) {
    const all = M.allParts().flatMap(p => p.vocab.map(v => ({ ...v })));
    const items = weak.map(([w]) => all.find(v => v.en === w)).filter(Boolean).slice(0, 8);
    if (items.length < 2) { M.toast('Necesitas al menos 2 palabras para practicar'); return; }
    await M.loadAudio(['common', ...D.topics.map(t => M.MOD.audio + t.n)]);
    app.innerHTML = `<div class="player"><div class="phead"><button class="x">✕</button><div class="prog"><i style="width:0%"></i></div></div><div class="stage"></div></div>`;
    $('.x', app).onclick = () => route('progress');
    const stage = $('.stage', app); const pool = all.filter((v, i, a) => a.findIndex(x => x.en === v.en) === i);
    const r = await A.qloop(stage, { lbl: 'Review', title: 'Practica tus palabras difíciles', ins: 'Escucha y elige la opción correcta.' }, items, async (body, it) => {
      body.appendChild(A.playBtn(it.au)); const opts = shuffle([it, ...sample(pool.filter(x => x.en !== it.en && x.img !== it.img), 3)]);
      const wrap = h(`<div class="opts" style="margin-top:12px"></div>`); body.appendChild(wrap);
      const btns = opts.map(o => { const b = h(`<button class="opt">${esc(o.en)}</button>`); wrap.appendChild(b); return b; }); setTimeout(() => play(it.au), 300);
      const i = await A.choose(btns); const ok = opts[i] === it; btns[opts.indexOf(it)].classList.add('right'); if (!ok) btns[i].classList.add('wrong');
      await A.feedback(ok, `${it.en} (${it.es})`); return ok;
    });
    M.addSkill('listening', r.c, items.length); S.xp += r.c * 5; save();
    await sheet({ ok: true, title: `¡Repaso terminado! ${r.c}/${items.length}`, msg: 'Las palabras que aciertas salen de tu lista de repaso. 💪' });
    route('progress');
  }

  /* ---------------- FINAL TEST ---------------- */
  function finalTest() {
    if (!M.finalUnlocked()) { route('home'); return finalLockedModal(); }
    window.M1FINAL.run(app, { route, after: () => { checkBadges(); topbar(); } });
  }
  function certificateView() { window.M1FINAL.certificate(app, { route }); }

  /* ---------------- boot ---------------- */
  // el módulo se abre desde el perfil del estudiante (index.html)
  const PF = window.MRAP;
  try { document.body.classList.add('ag-' + M.ageGroup()); } catch (e) { }
  if (PF) { const pr = PF.get(); const rl = pr ? PF.role(C.MODULE_ID || 'A1') : 'none';
    if (!pr || !['current', 'review'].includes(rl)) { location.replace('index.html'); return; }
    if (!S.name && pr.name) { S.name = pr.name; save(); } }
  M.touchStreak();
  route(location.hash === '#cert' && S.final && S.final.passed ? 'cert' : 'home');
})();
