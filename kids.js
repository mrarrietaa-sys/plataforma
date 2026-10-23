/* 🎈 PERFIL KIDS (9 a 11 años): misma plataforma de adultos con estilo aventura
   Camino de aventura (la ruta como estaciones), medallas por tema terminado y cofre del día */
(function () {
  const TN = {"A1":["Los saludos","El abecedario","Países y nacionalidades","Números y colores","Verbo To Be y A / An","Profesiones y ocupaciones","La familia y los animales","Comida, frutas y verduras","Días de la semana y meses","El clima y la ropa","Útiles escolares y partes de la casa","Singular y plural","This, that, these, those","Hay (singular vs. plural)"],"A2":["Decir la hora","El presente simple","El cuerpo humano","La apariencia física","Adjetivos de personalidad","El pasado simple","Presente y pasado continuo","Adverbios de frecuencia","Verbos modales","Pronombres reflexivos","Verbos frasales"],"B2":["Will y going to","Adjetivos posesivos","Pronombres posesivos","El presente perfecto","El pasado perfecto","Preposiciones de tiempo","Preposiciones de lugar","Comparativos y superlativos","Used to y be/get used to","Enough y wish","Sustantivos contables e incontables","A few, few, little, a little","Conectores"],"B2+":["Primer condicional","Segundo condicional","Tercer condicional","Verbos + infinitivo o gerundio","So, neither, either","Presente y pasado perfecto continuo","Cláusulas relativas","Preguntas coletilla","Estilo indirecto","Preguntas directas e indirectas","Voz pasiva y activa","Have/get something done","Futuro perfecto y futuro continuo","El futuro perfecto continuo","La inteligencia artificial y el empleo","Globalización: beneficios y desventajas","El impacto de las redes sociales en la salud mental","Justicia y equidad: ¿vivimos en una sociedad justa?","Educación tradicional vs. aprendizaje en línea","El futuro de la democracia","Exploración espacial: ¿progreso o vanidad?"]};
  const I = (n) => window.MRI ? MRI(n) : '';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const on = () => { try { return window.M1 && M1.ageGroup && M1.ageGroup() === 'kids'; } catch (e) { return false; } };
  // temas terminados del módulo (las 2 clases del tema hechas)
  function topics(a) {
    const P = window.MRAP, s = P.modState(a.id), parts = (s && s.parts) || {}, names = TN[a.id] || [];
    const n = names.length || a.topics || 0; const out = [];
    for (let i = 1; i <= n; i++) { const ks = Object.keys(parts).filter(k => k.indexOf('t' + i + 'p') === 0); const d = ks.filter(k => parts[k] && parts[k].done).length; out.push({ n: i, name: names[i - 1] || ('Tema ' + i), done: d >= 2, started: d > 0 }); }
    return out;
  }
  const totalDone = () => { try { const P = window.MRAP; return P.MODS.reduce((t, m) => t + (P.progress(m.id).done || 0), 0); } catch (e) { return 0; } };
  // 🎁 cofre del día: se abre cuando el niño completa al menos una clase hoy
  function chestState() {
    const d = today(); let st = {}; try { st = JSON.parse(LS.get('mra_chest_v1') || '{}'); } catch (e) { }
    if (st.date !== d) { st = { date: d, base: totalDone(), opened: false, n: st.n || 0 }; LS.set('mra_chest_v1', JSON.stringify(st)); }
    return st;
  }
  const WORDS = [['rainbow', 'arcoíris'], ['butterfly', 'mariposa'], ['treasure', 'tesoro'], ['adventure', 'aventura'], ['balloon', 'globo'], ['island', 'isla'], ['dragon', 'dragón'], ['rocket', 'cohete'], ['jungle', 'selva'], ['star', 'estrella'], ['ocean', 'océano'], ['castle', 'castillo'], ['planet', 'planeta'], ['dinosaur', 'dinosaurio'], ['volcano', 'volcán'], ['pirate', 'pirata']];
  function hero(p, a, nick) {
    const T = topics(a), cur = T.find(t => !t.done) || T[T.length - 1] || { name: '' }, medals = T.filter(t => t.done).length, st = chestState();
    const pr = window.MRAP.progress(a.id);
    return `<div class="card kd-hero"><span class="kd-sun"></span><span class="kd-cl c1"></span><span class="kd-cl c2"></span>
      <div class="kd-htx"><span class="kd-eye">${I('star')} Kids · Aventura</span><h2>¡Hola, ${esc(nick)}!</h2>
        <p>${pr.done ? `Hoy sigues en la estación <b>${esc(cur.name)}</b>. ¡Vamos!` : `Tu aventura empieza en <b>${esc(cur.name)}</b>. ¡Vamos!`}</p>
        <div class="kd-chips"><span class="o">${I('medal')} ${medals} ${medals === 1 ? 'medalla' : 'medallas'}</span><span class="b">${I('flame')} ${pr.done} de ${a.classes} clases</span><span class="y">${I('gift')} ${st.n || 0} ${st.n === 1 ? 'cofre' : 'cofres'}</span></div>
        <div class="kd-hb"><a class="btn kd-go lg" href="${a.url}">${I('video')} ${pr.done ? 'Continuar mi aventura' : 'Empezar mi aventura'}</a><button class="btn db-gbtn sm" id="pt3">¿No estás a gusto con tu nivel?</button></div></div>
      <img class="kd-mra" src="mra-x-balloon1.webp" alt="Mr. Arrieta"></div>`;
  }
  function chest() {
    const st = chestState(), can = totalDone() > st.base;
    if (st.opened) return `<div class="card kd-chest done"><span class="kd-ci">${I('gift')}</span><div><b>¡Cofre abierto!</b><small>Palabra de hoy: <i>${esc(st.w || '')}</i> = ${esc(st.es || '')}. Vuelve mañana por otro.</small></div></div>`;
    return `<div class="card kd-chest${can ? ' ready' : ''}"><span class="kd-ci">${I('gift')}</span><div><b>Cofre del día</b><small>${can ? '¡Lo ganaste! Ábrelo y descubre tu sorpresa.' : 'Termina una clase hoy y ábrelo.'}</small></div><button class="btn kd-cb" id="kd-open"${can ? '' : ' disabled'}>${can ? 'Abrir' : I('unlock')}</button></div>`;
  }
  function map(a) {
    const T = topics(a); if (!T.length) return '';
    let k = T.findIndex(t => !t.done); if (k < 0) k = T.length - 1;
    const start = Math.max(0, Math.min(k - 2, T.length - 4)), win = T.slice(start, start + 4);
    const P = [[11, 78], [31, 62], [51, 48], [71, 34], [89, 21]];
    const st = win.map((t, i) => ({ t, x: P[i][0], y: P[i][1], s: t.done ? 'd' : (start + i === k ? 'c' : 'l') }));
    const fin = { x: P[4][0], y: P[4][1] }; const passed = window.MRAP.passed(a.id);
    const pts = st.map(s => s.x * 6 + ',' + s.y * 3).concat([fin.x * 6 + ',' + fin.y * 3]);
    const dn = st.filter(s => s.s === 'd').length;
    return `<div class="sect-title kd-st"><h2>${I('target')} Camino de aventura</h2><small>${esc(a.name)} · ${esc(a.lv || a.id)} · ${T.filter(t => t.done).length} de ${T.length} estaciones</small></div>
      <div class="card kd-map"><svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.join(' ')}" fill="none" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 18"/>${dn ? `<polyline points="${pts.slice(0, dn + (st[dn] && st[dn].s === 'c' ? 1 : 0)).join(' ')}" fill="none" stroke="#16a34a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>` : ''}</svg>
        ${st.map(s => `<a class="kd-stn ${s.s}" href="${s.s === 'l' ? '#' : a.url}" style="left:${s.x}%;top:${s.y}%"${s.s === 'l' ? ' data-locked' : ''}><i>${I(s.s === 'd' ? 'check' : s.s === 'c' ? 'star' : 'unlock')}</i><small>${esc(s.t.name)}</small></a>`).join('')}
        <span class="kd-stn ${passed ? 'd' : 'l'} fin" style="left:${fin.x}%;top:${fin.y}%"><i>${I('award')}</i><small>Examen final</small></span></div>`;
  }
  function medals(a) {
    const T = topics(a), got = T.filter(t => t.done), st = chestState(), chestM = (st.n || 0) >= 5;
    const all = got.slice(-5).map((t, i) => `<span class="kd-md m${i % 3}"><i>${I('medal')}</i>${esc(t.name)}</span>`);
    if (chestM) all.push(`<span class="kd-md m3"><i>${I('gift')}</i>5 cofres</span>`);
    const next = T.find(t => !t.done); if (next && all.length < 6) all.push(`<span class="kd-md lk"><i>${I('unlock')}</i>${esc(next.name)}</span>`);
    return `<div class="sect-title kd-st"><h2>${I('medal')} Mis medallas</h2><small>${got.length + (chestM ? 1 : 0)} de ${T.length + 1}</small></div><div class="kd-meds">${all.join('')}</div>`;
  }
  function wire(root) {
    const b = root.querySelector('#kd-open'); if (b) b.onclick = () => {
      const st = chestState(); if (st.opened || totalDone() <= st.base) return; const w = WORDS[Math.floor(Math.random() * WORDS.length)];
      st.opened = true; st.w = w[0]; st.es = w[1]; st.n = (st.n || 0) + 1; LS.set('mra_chest_v1', JSON.stringify(st));
      try { M1.sfx && M1.sfx('win'); M1.confetti && M1.confetti(1500); M1.praise && M1.praise(); } catch (e) { }
      const c = root.querySelector('.kd-chest'); if (c) c.outerHTML = chest();
    };
    root.querySelectorAll('[data-locked]').forEach(x => x.onclick = (e) => { e.preventDefault(); try { M1.toast('Termina la estación anterior para abrir esta.'); } catch (er) { } });
  }
  window.MRKIDS = { on, hero, chest, map, medals, wire, topics };
})();
