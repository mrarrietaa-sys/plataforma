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
    { k: 'm2', ic: 'video', t: 'Haz 3 lecciones esta semana', goal: 3, pts: 150, v: (s) => partsDone() - s.base.parts },
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
        <p>${pr.done ? `Vas en el <b>${esc(a.name)}</b>. Sigue así: cada lección te acerca a hablar con confianza.` : `Tu ruta empieza en el <b>${esc(a.name)}</b>. Una lección a la vez, a tu ritmo.`}</p>
        <div class="tn-k"><div><b>${I('video')}${pr.done}<span>/${a.classes}</span></b><small>Lecciones</small></div><div><b>${I('flame')}${s.days.length}</b><small>Días esta semana</small></div><div><b>${I('globe')}${rlDone()}<span>/3</span></b><small>Frases esta semana</small></div></div>
        <div class="tn-hb"><a class="btn tn-go lg" href="${a.url}">${I('video')} ${pr.done ? 'Continuar mi ruta' : 'Empezar mi ruta'}</a><button class="btn tn-gh sm" id="pt3">¿No estás a gusto con tu nivel?</button></div></div>
      <span class="tn-art"><span class="tn-disc"></span><img class="tn-mra" src="mra-x-rocket.webp" alt="Mr. Arrieta"></span></div>`;
  }
  function missions() { // 🎯 una sola meta semanal: 3 clases (directo a lo que vino)
    const s = state(), v = Math.max(0, Math.min(3, partsDone() - s.base.parts)), ok = v >= 3;
    return `<div class="card tn-goal${ok ? ' ok' : ''}"><i class="tn-gi">${I(ok ? 'check' : 'target')}</i><div><small>Meta de la semana</small><b>${ok ? '¡Meta cumplida!' : 'Haz 3 lecciones'}</b><div class="tn-bar"><span style="width:${Math.round(v / 3 * 100)}%"></span></div><span>${v} de 3 · se renueva cada lunes</span></div></div>`;
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
    if (!noSync) rlWire(root);

  }

  /* 🌍 INGLÉS DE LA VIDA REAL: 3 frases por semana según su objetivo (audio con voz real + micrófono, sin grabar) */
  const RL = {"tc":[["Can I ask a question?","¿Puedo hacer una pregunta?","Para participar en clase"],["Could you repeat that, please?","¿Podría repetir eso, por favor?","Cuando no entendiste al profesor"],["What does this word mean?","¿Qué significa esta palabra?","Para aprender vocabulario nuevo"],["I forgot my homework at home.","Olvidé mi tarea en casa.","Para explicar una situación"],["Can we work in pairs?","¿Podemos trabajar en parejas?","Para organizar una actividad"],["Today I'm going to talk about…","Hoy voy a hablar sobre…","Para empezar una exposición"],["In my opinion, this is important.","En mi opinión, esto es importante.","Para dar tu opinión"],["I don't agree with that.","No estoy de acuerdo con eso.","Para debatir con respeto"],["When is the test?","¿Cuándo es el examen?","Para preguntar por fechas"],["How do you spell that?","¿Cómo se escribe eso?","Para escribir sin errores"],["I need more time, please.","Necesito más tiempo, por favor.","Durante un examen o tarea"],["Can you check my answer?","¿Puede revisar mi respuesta?","Para pedir retroalimentación"],["Let me think about it.","Déjame pensarlo.","Para ganar tiempo al responder"],["That's a good point.","Ese es un buen punto.","Para reconocer una idea"],["To sum up, …","Para resumir, …","Para cerrar una exposición"],["I'm not sure, but I think…","No estoy seguro, pero creo que…","Para responder con cuidado"],["Can I go to the restroom?","¿Puedo ir al baño?","Una pregunta de todos los días"],["What page are we on?","¿En qué página vamos?","Para seguir la clase"],["I studied a lot for this exam.","Estudié mucho para este examen.","Para hablar de tu esfuerzo"],["Thank you for your help.","Gracias por su ayuda.","Para agradecer al profesor"],["Could you explain it again?","¿Podría explicarlo otra vez?","Cuando un tema es difícil"],["I'd like to share my idea.","Me gustaría compartir mi idea.","Para participar en grupo"],["First, second, finally…","Primero, segundo, por último…","Para ordenar tus ideas"],["For example, …","Por ejemplo, …","Para explicar mejor"],["Is this going to be on the test?","¿Esto va a salir en el examen?","Para prepararte mejor"],["I got a good grade!","¡Saqué una buena nota!","Para contar una buena noticia"],["Let's meet at the library.","Encontrémonos en la biblioteca.","Para estudiar con amigos"],["What's the deadline?","¿Cuál es la fecha límite?","Para organizar tus tareas"],["I have a presentation tomorrow.","Tengo una exposición mañana.","Para contar tus planes"],["Practice makes perfect.","La práctica hace al maestro.","Para animarte a seguir"]],"ts":[["This song is a total vibe.","Esta canción tiene muy buena vibra.","Para recomendar música"],["Don't spoil the ending!","¡No me cuentes el final!","Cuando hablan de una serie"],["I binge-watched the whole season.","Me vi toda la temporada de una.","Para contar tu maratón"],["Who's your favorite character?","¿Quién es tu personaje favorito?","Para hablar de series"],["That plot twist was crazy!","¡Ese giro de la historia fue una locura!","Para comentar un episodio"],["Link in my bio.","Enlace en mi biografía.","Muy común en redes"],["Like and subscribe!","¡Dale like y suscríbete!","Como un creador de contenido"],["I can't stop listening to it.","No puedo dejar de escucharla.","Para hablar de una canción"],["Have you seen the new episode?","¿Ya viste el nuevo episodio?","Para empezar una conversación"],["It's trending right now.","Es tendencia ahora mismo.","Para hablar de lo viral"],["That's so relatable.","Eso es tan identificable.","Para comentar un meme"],["I'm obsessed with this show.","Estoy obsesionado con esta serie.","Para expresar emoción"],["What are you watching these days?","¿Qué estás viendo estos días?","Para pedir recomendaciones"],["The lyrics are so deep.","La letra es muy profunda.","Para hablar de una canción"],["Let's go live tonight.","Hagamos un en vivo esta noche.","Para redes sociales"],["Swipe up to see more.","Desliza hacia arriba para ver más.","Muy común en historias"],["This video went viral.","Este video se volvió viral.","Para hablar de redes"],["I'm a huge fan of her music.","Soy súper fan de su música.","Para hablar de un artista"],["Turn on notifications.","Activa las notificaciones.","Como un creador de contenido"],["No spoilers, please.","Sin spoilers, por favor.","Para proteger una sorpresa"],["The soundtrack is amazing.","La banda sonora es increíble.","Para comentar una película"],["I've been waiting for this all week.","He esperado esto toda la semana.","Para mostrar emoción"],["Drop a comment below.","Deja un comentario abajo.","Para invitar a comentar"],["What's your go-to song?","¿Cuál es tu canción de siempre?","Para conocer gustos"],["That scene gave me chills.","Esa escena me dio escalofríos.","Para comentar una escena"],["Thanks for watching!","¡Gracias por ver!","Para cerrar un video"],["It's on my watchlist.","Está en mi lista para ver.","Para hablar de pendientes"],["I learned it from a TikTok.","Lo aprendí de un TikTok.","Para contar de dónde viene algo"],["Let's make a playlist together.","Hagamos una lista de música juntos.","Para compartir con amigos"],["See you in the next video!","¡Nos vemos en el próximo video!","Para despedirte en redes"]],"tg":[["Cover me!","¡Cúbreme!","Para pedir ayuda a tu equipo"],["Nice shot!","¡Buen tiro!","Para felicitar a un compañero"],["I'm going in, follow me.","Voy a entrar, sígueme.","Para liderar una jugada"],["My bad, that was my fault.","Perdón, fue mi culpa.","Para disculparte en una partida"],["Good game, everyone!","¡Buen juego a todos!","Para terminar una partida"],["I need backup!","¡Necesito refuerzos!","Cuando estás en problemas"],["Watch out, behind you!","¡Cuidado, detrás de ti!","Para avisar a un compañero"],["Let's play one more round.","Juguemos una ronda más.","Para seguir jugando"],["I'm low on health.","Tengo poca vida.","Para avisar tu estado"],["Wait for me!","¡Espérame!","Para que el equipo no se vaya"],["Push forward!","¡Avancen!","Para atacar en equipo"],["Fall back!","¡Retrocedan!","Para retirarse a tiempo"],["I've got this.","Yo me encargo.","Para tomar la iniciativa"],["Can you revive me?","¿Me puedes revivir?","Para pedir ayuda"],["Nice try, we'll get them next time.","Buen intento, la próxima les ganamos.","Para animar al equipo"],["Who wants to team up?","¿Quién quiere hacer equipo?","Para unirte a otros jugadores"],["My connection is lagging.","Mi conexión está lenta.","Para explicar un problema"],["I'm ready, let's start.","Estoy listo, empecemos.","Antes de una partida"],["Enemy spotted on the left!","¡Enemigo a la izquierda!","Para dar información"],["That was so close!","¡Estuvo muy cerca!","Después de una jugada difícil"],["Thanks for the help!","¡Gracias por la ayuda!","Para agradecer a un compañero"],["Let's stick together.","Mantengámonos juntos.","Para jugar en equipo"],["I'll be right back.","Ya vuelvo.","Cuando te alejas un momento"],["What's the plan?","¿Cuál es el plan?","Para organizar al equipo"],["We did it! We won!","¡Lo logramos! ¡Ganamos!","Para celebrar una victoria"],["Don't give up!","¡No se rindan!","Para motivar al equipo"],["Can you send me an invite?","¿Me puedes enviar una invitación?","Para jugar con amigos"],["I'm on my way!","¡Ya voy en camino!","Para avisar que llegas"],["Let's practice this level.","Practiquemos este nivel.","Para mejorar juntos"],["See you online!","¡Nos vemos en línea!","Para despedirte de tus amigos"]],"tx":[["Where is the boarding gate?","¿Dónde está la puerta de embarque?","En el aeropuerto"],["I'm here on an exchange program.","Estoy aquí en un programa de intercambio.","Para presentarte afuera"],["Nice to meet you, I'm from Colombia.","Mucho gusto, soy de Colombia.","Para conocer gente nueva"],["Can I have a window seat?","¿Me puede dar una silla junto a la ventana?","En el avión"],["How much is this?","¿Cuánto cuesta esto?","Para comprar algo"],["Could you take a picture of us?","¿Nos podría tomar una foto?","Cuando viajas con amigos"],["I'd like a hamburger, please.","Quisiera una hamburguesa, por favor.","Para pedir comida"],["Where's the nearest bus stop?","¿Dónde está la parada de bus más cercana?","Para moverte en la ciudad"],["I'm a little lost.","Estoy un poco perdido.","Para pedir ayuda"],["What time does it open?","¿A qué hora abre?","Para planear tu día"],["Do you want to hang out this weekend?","¿Quieres salir este fin de semana?","Para hacer amigos"],["Can I pay with card?","¿Puedo pagar con tarjeta?","Para pagar en una tienda"],["I have a reservation.","Tengo una reserva.","En un hotel o restaurante"],["What do you recommend?","¿Qué me recomienda?","Para pedir recomendaciones"],["My flight was delayed.","Mi vuelo se retrasó.","Para explicar un problema"],["Is it far from here?","¿Queda lejos de aquí?","Para preguntar distancias"],["Could you speak more slowly?","¿Podría hablar más despacio?","Cuando te hablan rápido"],["I'd love to visit your country.","Me encantaría visitar tu país.","Para conversar con extranjeros"],["Where are you from?","¿De dónde eres?","Para empezar una conversación"],["Let's exchange numbers.","Intercambiemos números.","Para seguir en contacto"],["I'm staying with a host family.","Me estoy quedando con una familia anfitriona.","Durante un intercambio"],["Excuse me, is this seat taken?","Disculpe, ¿este puesto está ocupado?","En el bus o en clase"],["Can I get the check, please?","¿Me trae la cuenta, por favor?","En un restaurante"],["I lost my passport.","Perdí mi pasaporte.","En una emergencia"],["This place is amazing!","¡Este lugar es increíble!","Para expresar emoción"],["How do I get to the airport?","¿Cómo llego al aeropuerto?","Para moverte"],["I miss Colombian food.","Extraño la comida colombiana.","Para hablar de tu país"],["What's the Wi-Fi password?","¿Cuál es la clave del Wi-Fi?","Una pregunta de todos los días"],["Thank you for everything!","¡Gracias por todo!","Para despedirte agradecido"],["I can't wait to come back.","No veo la hora de volver.","Al terminar un viaje"]]};
  const RLG = { tc: ['grad', 'Colegio y exámenes'], ts: ['tv', 'Series, música y redes'], tg: ['pad', 'Videojuegos y amigos'], tx: ['plane', 'Viajar o estudiar afuera'] };
  const goalK = () => { try { const g = window.MRGOAL && MRGOAL.get(); return g && RL[g.k] ? g.k : ''; } catch (e) { return ''; } };
  const weekN = () => Math.floor(new Date(weekKey() + 'T12:00:00').getTime() / (7 * 864e5));
  const rlState = () => { let x = {}; try { x = JSON.parse(LS.get('mra_trl_v1') || '{}'); } catch (e) { } x.m = x.m || {}; return x; };
  const rlSave = (x) => LS.set('mra_trl_v1', JSON.stringify(x));
  function rlWeek(g) { const L = RL[g], n = L.length, start = (weekN() * 3) % n; return [0, 1, 2].map(i => (start + i) % n); }
  function realLife() {
    const g = goalK();
    if (!g) return `<div class="card rl rl-empty"><div class="rl-h"><div><h3>${I('globe')} Inglés de la vida real</h3><p>Elige tu objetivo y cada semana te damos 3 frases que usarías de verdad.</p></div><button class="btn tn-go sm" data-goal>Elegir mi objetivo</button></div></div>`;
    const x = rlState(), idx = rlWeek(g), done = idx.filter(i => x.m[g + i] >= 80).length, tot = Object.keys(x.m).filter(k => x.m[k] >= 80).length;
    return `<div class="card rl"><div class="rl-h"><div><h3>${I('globe')} Inglés de la vida real</h3><p>3 frases nuevas cada semana según tu objetivo. Escúchalas y dilas en voz alta.</p></div><span class="rl-g">${I(RLG[g][0])} ${RLG[g][1]}</span></div>
      <div class="rl-list">${idx.map((i, j) => { const [en, es, u] = RL[g][i], sc = x.m[g + i] || 0, ok = sc >= 80; return `<div class="rl-p${ok ? ' ok' : ''}" data-rl="${i}"><span class="rl-n">${ok ? I('check') : j + 1}</span><span class="rl-t"><b>${esc(en)}</b><small>${esc(es)}</small><em>${esc(u)}</em></span><span class="rl-sc">${sc ? sc + '%' : ''}</span><span class="rl-acts"><button class="rl-b" data-rlp="${i}" aria-label="Escuchar">${I('vol')}</button><button class="rl-b mic" data-rlm="${i}" aria-label="Decirla">${I('mic')}</button></span></div>`; }).join('')}</div>
      <div class="rl-f"><span><b>${done} de 3</b> dominadas esta semana</span><div class="rl-bar"><i style="width:${Math.round(done / 3 * 100)}%"></i></div><button class="rl-mine" id="rl-mine">Mis frases (${tot})</button></div></div>`;
  }
  function rlWire(root) {
    const g = goalK(); const load = () => M1.loadAudio(['trl_' + g]);
    if (!g) return;
    root.querySelectorAll('[data-rlp]').forEach(b => b.onclick = async () => { await load(); M1.play('rl' + g + b.dataset.rlp, { btn: b }); });
    root.querySelectorAll('[data-rlm]').forEach(b => b.onclick = async () => {
      const i = +b.dataset.rlm, row = b.closest('.rl-p'), scEl = row.querySelector('.rl-sc');
      if (!M1.canSR) { M1.toast('Tu navegador no permite usar el micrófono. Ábrelo en Google Chrome.'); return; }
      b.classList.add('on'); scEl.innerHTML = '<span class="rl-wv"><i></i><i></i><i></i></span>';
      const r = await M1.listen(8000, { quick: true }); b.classList.remove('on');
      if (!r.alts || !r.alts.length) { scEl.textContent = ''; M1.toast(/not-allowed|service-not-allowed|audio-capture/.test(r.error || '') ? 'Permite el micrófono en tu navegador e inténtalo de nuevo.' : 'No te escuché. Inténtalo de nuevo.'); return; }
      const sc = M1.speechScore(RL[g][i][0].replace('…', ''), r.alts).score, x = rlState(), k = g + i, was = x.m[k] || 0;
      if (sc > was) { x.m[k] = sc; rlSave(x); }
      try { if (sc >= 80) { M1.sfx('win'); M1.praise(); if (was < 80) M1.confetti(1200); } else { M1.sfx('bad'); M1.encourage(); } } catch (e) { }
      const kt = root.querySelector('.tn-k div:nth-child(3) b'); if (kt) kt.innerHTML = I('globe') + rlDone() + '<span>/3</span>';
      const box = root.querySelector('.rl'); if (box) { const t = document.createElement('div'); t.innerHTML = realLife(); box.replaceWith(t.firstElementChild); rlWire(root); }
      if (sc < 80) M1.toast(`${sc}%: escúchala otra vez e inténtalo. La meta es 80%.`);
      try { window.MRAC && MRAC.sync && MRAC.sync(); } catch (e) { }
    });
    const mn = root.querySelector('#rl-mine'); if (mn) mn.onclick = () => {
      const x = rlState(); const L = []; Object.keys(RL).forEach(gg => RL[gg].forEach((p, i) => { if (x.m[gg + i] >= 80) L.push([gg, i, p]); }));
      const m = M1.modal(`<div class="rl-mm"><h3>${I('globe')} Mis frases</h3><p class="muted">${L.length ? 'Las frases que ya dominas. Repásalas cuando quieras.' : 'Aún no dominas frases. Di las de esta semana con 80% o más y aparecerán aquí.'}</p><div class="rl-ml">${L.map(([gg, i, p]) => `<div><button class="rl-b" data-mp="${gg}|${i}">${I('vol')}</button><span><b>${esc(p[0])}</b><small>${esc(p[1])}</small></span><i>${x.m[gg + i]}%</i></div>`).join('')}</div></div>`, { x: true });
      m.querySelectorAll('[data-mp]').forEach(b => b.onclick = async () => { const [gg, i] = b.dataset.mp.split('|'); await M1.loadAudio(['trl_' + gg]); M1.play('rl' + gg + i, { btn: b }); });
    };
  }
  // para el resumen que va a la nube (papás): frases dominadas en total
  function rlDone() { const g = goalK(); if (!g) return 0; const x = rlState(); return rlWeek(g).filter(i => x.m[g + i] >= 80).length; }
  function rlCount() { const x = rlState(); return Object.keys(x.m).filter(k => x.m[k] >= 80).length; }
  window.MRTEENS = { realLife, rlWire, rlCount, on, hero, missions, challenge, ranking, wire };
})();
