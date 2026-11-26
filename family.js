/* 👨‍👩‍👧 PANEL DE PAPÁS (código de familia FAM-…): ven a sus hijos, su clase o práctica, su nivel y manejan la alerta de 7 días */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app'), I = (n) => window.MRI ? MRI(n) : '';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } } };
  const LV = ['', 'A1 · Elemental', 'A2 · Básico', 'B1 · Intermedio', 'B2 · Avanzado'];
  const AG = { kids: ['k', 'KIDS'], teens: ['t', 'TEENS'], adult: ['a', 'ADULTOS'] };
  const REL = { hijo: 'Hijo(a)', sobrino: 'Sobrino(a)', nieto: 'Nieto(a)', otro: '' }; // v809: qué es del acudiente
  const ago = (d) => d <= 0 ? 'Hoy' : d === 1 ? 'Ayer' : 'Hace ' + d + ' días';
  let F = null;

  function topRight(on) { $('#tb-r').innerHTML = on ? `<button class="btn w sm fm-out" id="out">${I('logout')} Salir</button>` : ''; if (on) $('#out').onclick = () => { LS.set('mra_fam', null); location.href = 'index.html'; }; }

  function login(msg) {
    topRight(false);
    /* v809 · ya no hay pantalla de ingreso propia: el código FAM-… se escribe en «Ingresar» (el mismo de los estudiantes) y entra directo a su portal */
    let pcq = false; try { const q = new URLSearchParams(location.search); pcq = !!(q.get('pc') && q.get('t')); } catch (e) { }
    if (!pcq && !msg) { location.replace('index.html?ingresar=1'); return; }
    if (!pcq) { app.innerHTML = `<section class="card fm-login fm-lmin"><div><p class="fm-err">${esc(msg)}</p><button class="btn k lg" id="fm-rt">Intentar de nuevo</button></div></section>`; $('#fm-rt').onclick = () => location.reload(); return; }
    app.innerHTML = `<section class="card fm-login fm-lmin"><div><a class="btn k lg" href="index.html?ingresar=1">Ingresar →</a></div></section><input id="fc" hidden><button id="go" hidden></button><p id="er" hidden></p>`;
     // v668: el enlace del correo trae el código de familia
    const go = async () => { const v = $('#fc').value.trim().toUpperCase(); if (!/^FAM-/.test(v)) return ($('#er').textContent = 'El código de familia empieza por FAM-.'); $('#go').disabled = true;
      const r = await MRAC.call('famData', { fcode: v }).catch(() => null); $('#go').disabled = false;
      if (!r || !r.ok) return ($('#er').textContent = r && r.err === 'notfound' ? 'No encontramos ese código. Revísalo e inténtalo de nuevo.' : 'No hay conexión. Inténtalo de nuevo.');
      LS.set('mra_fam', v); LS.set('mra_last_role', JSON.stringify({ role: 'family' })); try { sessionStorage.setItem('mra_fam_hi', '1'); } catch (e) { } render(r); try { const m = sessionStorage.getItem('mra_pc_msg'); if (m) { sessionStorage.removeItem('mra_pc_msg'); app.insertAdjacentHTML('afterbegin', m); } } catch (e) { } };
    $('#go').onclick = go; $('#fc').onkeydown = (e) => { if (e.key === 'Enter') go(); };
    try { const q = new URLSearchParams(location.search), pc = q.get('pc'), t = q.get('t'); if (pc && t && !window.__pcDone) { window.__pcDone = 1; history.replaceState(null, '', location.pathname); // v674: el papá confirma la cuenta de su hijo(a) y entra a su portal
      MRAC.call('parentConfirm', { code: pc, t }).then((r) => { const ok = r && r.ok; const fam = (r && r.fam) || q.get('f') || '';
        const box = document.createElement('div'); box.className = 'fm-pcok' + (ok ? '' : ' bad'); box.innerHTML = ok ? `${I('check')}<div><b>¡Gracias${r.guardian ? ', ' + esc(r.guardian) : ''}!</b><span>Confirmaste la cuenta de ${esc(r.first || 'tu estudiante')}. Toca «Ingresar» y escribe tu código de familia (FAM-…) para entrar a tu portal.</span></div>` : `${I('alert')}<div><b>No pudimos confirmar</b><span>El enlace no es válido o ya venció. Escríbenos por WhatsApp al 301 781 0841.</span></div>`;
        try { sessionStorage.setItem('mra_pc_msg', box.outerHTML); } catch (e) { }
        try { sessionStorage.removeItem('mra_pc_msg'); } catch (e) { } if ($('#fc')) $('#fc').value = ''; const lg = app.querySelector('.fm-login'); (lg || app).insertAdjacentElement(lg ? 'beforebegin' : 'afterbegin', box); if (ok && $('#fc')) $('#fc').focus(); }).catch(() => { }); } } catch (e) { } // v674: confirma y pide su código de familia (no entra solo)
  }

  function kidCard(k, i) {
    const g = AG[k.ag] || AG.adult, prem = /^premium/.test(k.plan);
    const mini = prem
      ? `<div class="fm-mini"><small>Próxima clase</small><b>${I('calendar')}${k.next ? esc(k.next.nice) : 'Sin reservar'}</b></div><div class="fm-mini"><small>Clases del mes</small><b>${k.credits ? k.credits.used + ' de ' + k.credits.total : '—'}</b></div>`
      : `<div class="fm-mini${k.idle >= 5 ? ' w' : ''}"><small>Última práctica</small><b>${I('clock')}${ago(k.idle)}</b></div><div class="fm-mini"><small>Su nivel</small><b>${k.module ? LV[k.module] : 'Por definir'}</b></div>`;
    return `<article class="card fm-kid ag-${g[0]}" data-i="${i}"><button class="fm-kh" data-tg="${i}"><span class="fm-kn"><b>${esc(k.first)} ${esc(k.lastName || '')}</b><span><i class="fm-tag ${g[0]}">${g[1]}${k.age != null ? ' · ' + k.age + ' AÑOS' : ''}</i>${esc(k.planName)}${REL[k.rel] ? ` · <em class="fm-rel">${REL[k.rel]}</em>` : ''}</span></span><span class="fm-go">${I('chev')}</span></button>
      <div class="fm-row">${mini}</div>${prem && !k.expired ? `<button type="button" class="fb-btn" data-book="${i}">${I('calendar')}Reservarle una clase</button>` : ''}
      <div class="fm-more" hidden><p>Código de ${esc(k.first)}: <b>${esc(k.code)}</b></p><button class="btn w sm" data-in="${esc(k.code)}"><span class="fm-inb"><b>Ver el perfil de ${esc(k.first)}</b><small>(modo lectura)</small></span></button></div></article>`;
  }

  /* v808 · la bicicleta de Mr. Arrieta hace su recorrido, llega suave a su puesto, destello dorado y se queda flotando */
  function famFlash(x, y) { try { const g = document.createElement('span'); g.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;pointer-events:none;z-index:60;background:radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(255,214,102,.65) 40%,rgba(255,214,102,0) 70%)`; document.body.appendChild(g); g.animate([{ transform: 'scale(.4)', opacity: 1 }, { transform: 'scale(10)', opacity: 0 }], { duration: 750, easing: 'ease-out' }).onfinish = () => g.remove();
    for (let i = 0; i < 12; i++) { const q = document.createElement('i'), an = i / 12 * 6.283, d = 50 + Math.random() * 28; q.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#FFC83D;box-shadow:0 0 8px #FFC83D;pointer-events:none;z-index:61`; document.body.appendChild(q); q.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${(Math.cos(an) * d).toFixed(1)}px,${(Math.sin(an) * d).toFixed(1)}px) scale(.3)`, opacity: 0 }], { duration: 800, easing: 'ease-out' }).onfinish = () => q.remove(); } } catch (e) { } }
  function bikeIn() { try { const h = document.querySelector('.fm-hart'), im = h && h.querySelector('img'); if (!h || !im || !h.animate) return; h.style.opacity = '0'; setTimeout(() => { h.style.opacity = ''; }, 4000);
    const go = () => { h.style.opacity = ''; const hero = h.closest('.fm-hero'), hr = hero.getBoundingClientRect(), r = h.getBoundingClientRect(); const dx = -Math.max(160, Math.min(r.left - hr.left - 20, innerWidth < 900 ? 260 : 620)); /* v808: avanza hacia adelante, desde las letras hasta su puesto (como la avioneta) */
      h.style.transformOrigin = '50% 100%'; /* v808: viene desde el fondo (pequeña, a lo lejos) y se acerca hasta su puesto, como si viniera manejando */
      const a = h.animate([{ transform: `translate(${dx}px,-${innerWidth < 900 ? 18 : 34}px) scale(.28)`, opacity: 0, filter: 'blur(1.5px)' }, { opacity: 1, offset: .15 }, { transform: `translate(${Math.round(dx * .45)}px,-${innerWidth < 900 ? 8 : 14}px) scale(.55)`, filter: 'blur(0px)', offset: .45 }, { transform: 'translate(0,0) scale(1)', opacity: 1, filter: 'blur(0px)' }], { duration: 2800, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
      a.onfinish = () => { const q = im.getBoundingClientRect(); if (q.width) famFlash(q.left + q.width * .5, q.top + q.height * .62); }; };
    if (im.complete && im.naturalWidth) setTimeout(go, 80); else im.addEventListener('load', () => setTimeout(go, 80), { once: true });
  } catch (e) { } }
  function render(r) {
    F = r; topRight(true); const f = r.family, kids = r.kids || [];
    { const gs = kids.map(k => (AG[k.ag] || AG.adult)[0]), hk = gs.includes('k'), ht = gs.includes('t'); // 🎨 v616: el panel toma el color de los hijos (Kids · Teens · mixto)
      document.body.classList.remove('fm-k', 'fm-t', 'fm-mx'); if (hk || ht) document.body.classList.add(hk && ht ? 'fm-mx' : hk ? 'fm-k' : 'fm-t'); }
    const first = String(f.guardian || '').split(' ')[0] || 'familia';
    const ini = String(f.guardian || 'F').split(' ').filter(Boolean).slice(0, 2).map(x => x.charAt(0)).join('').toUpperCase();
    app.innerHTML = `<div class="fm-grid"><aside class="fm-side">
        <div class="card fm-pc"><span class="fm-pav">${esc(ini)}</span><h2>${esc(f.guardian || 'Mi familia')}</h2><p>Acudiente · ${kids.length} ${kids.length === 1 ? 'estudiante' : 'estudiantes'}</p>
          <div class="fm-code"><div><small>Tu código de familia</small><b>${esc(f.fcode)}</b></div><button class="fm-cp" id="cp">${I('copy')} Copiar</button></div></div>
        <div class="fm-al"><div class="fm-alr"><span class="fm-ali">${I('mail')}</span><span><b>Alerta de 7 días</b><br>Si un estudiante pasa una semana sin clases o sin practicar.</span><button class="fm-sw${f.alerts ? ' on' : ''}" id="sw" role="switch" aria-checked="${!!f.alerts}" aria-label="Alerta de 7 días"></button></div>
          <div class="fm-alr"><span class="fm-ali b">${I('calendar')}</span><span><b>Reporte de los lunes</b><br>El resumen de la semana de tus estudiantes.</span><button class="fm-sw${f.reports ? ' on' : ''}" id="sw2" role="switch" aria-checked="${!!f.reports}" aria-label="Reporte de los lunes"></button></div>
          <button class="btn k block fm-payb" id="payb">${I('card')} Planes y pagos</button></div>
        <p class="fm-help"><button class="fm-tourb" id="tourb">Ver recorrido</button> · ¿Dudas? WhatsApp <a href="https://wa.me/573017810841" target="_blank" rel="noopener">301 781 0841</a></p></aside>
      <div class="fm-main"><section class="fm-hero"><span class="fm-hb1"></span><span class="fm-hb2"></span><span class="fm-hdots"></span>
          <div class="fm-htx"><h1>¡Hola, ${esc(first)}!</h1><p>Aquí ves a tus estudiantes y cómo van con su inglés: sus clases, su práctica y su nivel.</p>
            <div class="fm-hst"><span><i>${I('users')}</i><b>${kids.length}</b><small>${kids.length === 1 ? 'Estudiante' : 'Estudiantes'}</small></span><span><i>${I('calendar')}</i><b>${kids.filter(k => k.next).length}</b><small>Con clase reservada</small></span><span><i>${I('mail')}</i><b>${f.alerts ? 'Activa' : 'Apagada'}</b><small>Alerta de 7 días</small></span></div></div>
          <div class="fm-hart"><span class="fm-road"></span><img src="mra-x-bike-blue.webp" alt="Mr. Arrieta"></div></section>
        <div class="fm-st"><h2>Mis estudiantes</h2><small>${kids.length} ${kids.length === 1 ? 'estudiante' : 'estudiantes'}${kids.length > 1 ? '<span class="fm-sw2"> · desliza →</span>' : ''}</small></div>
        <div class="fm-kids">${kids.length ? kids.map(kidCard).join('') : '<p class="muted center">Aún no hay estudiantes en tu familia.</p>'}<button class="fm-add" id="add">${I('plus')} Agregar estudiante<small>Elige su plan</small></button></div></div></div>`;
    bikeIn(); $('#tourb').onclick = () => tour();
    let hi = ''; try { hi = sessionStorage.getItem('mra_fam_hi'); sessionStorage.removeItem('mra_fam_hi'); } catch (e) { }
    if (hi) welcome(first, String(f.guardian || '').trim().split(/\s+/)[0]);
    else if (!LS.get('mra_fam_tour')) setTimeout(tour, 700);
    $('#cp').onclick = () => { try { navigator.clipboard.writeText(f.fcode); $('#cp').innerHTML = I('check') + ' Copiado'; } catch (e) { } };
    app.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => detail(r, +b.dataset.tg));
    app.querySelectorAll('[data-book]').forEach(b => b.onclick = () => { if (window.MRFAMBOOK) MRFAMBOOK.open(Object.assign({ fcode: LS.get('mra_fam') }, r), +b.dataset.book); }); // 👨‍👩‍👧 v792: el papá le reserva la clase a su hijo
    app.querySelectorAll('[data-in]').forEach(b => b.onclick = () => { try { sessionStorage.setItem('mra_autocode', b.dataset.in); sessionStorage.setItem('mra_from_fam', '1'); sessionStorage.setItem('mra_obs', '1'); } catch (e) { } location.href = 'index.html'; });
    const add = $('#add'); if (add) add.onclick = () => addKid(r); // v808: sin salir del portal
    $('#sw2').onclick = async () => { const b = $('#sw2'), on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-checked', on); const x = await MRAC.call('famReports', { fcode: f.fcode, on }).catch(() => null); if (!x || !x.ok) b.classList.toggle('on', !on); };
    $('#payb').onclick = () => pay(r);
    if (/[?&]compra=/.test(location.search)) { try { history.replaceState(null, '', location.pathname); } catch (e) { } toastF('Recibimos tu pago. Los planes se activan en unos minutos.'); }
    $('#sw').onclick = async () => { const on = !$('#sw').classList.contains('on'); $('#sw').classList.toggle('on', on); $('#sw').setAttribute('aria-checked', on);
      const x = await MRAC.call('famAlerts', { fcode: f.fcode, on }).catch(() => null); if (!x || !x.ok) { $('#sw').classList.toggle('on', !on); } };
  }

  const LVN = ['', 'A1 Elemental', 'A2 Básico', 'B1 Intermedio', 'B2 Avanzado'];
  const GOALN = { kc: 'Ir bien en el colegio', kj: 'Jugar y ver videos', kv: 'Viajar en familia', km: 'Música y canciones', tc: 'Colegio y exámenes', ts: 'Series, música y redes', tg: 'Videojuegos y amigos', tx: 'Viajar o estudiar afuera', v: 'Viajar', t: 'Trabajo', e: 'Estudios' };
  const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const fD = (iso) => { if (!iso) return '—'; const d = new Date(iso + 'T12:00:00'); return d.getDate() + ' de ' + ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][d.getMonth()]; };
  const money = (n) => '$' + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' COP';
  function toastF(t) { const d = document.createElement('div'); d.className = 'fm-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 4200); }
  // 👧 detalle de un hijo: avance, semana, camino, próximas clases y comentario del profe
  function detail(r, i) {
    const k = r.kids[i], d = k.detail || {}, w = d.week || {}, g = AG[k.ag] || AG.adult, prem = /^premium/.test(k.plan);
    document.body.classList.remove('fm-k', 'fm-t', 'fm-mx'); if (g[0] === 'k' || g[0] === 't') document.body.classList.add('fm-' + g[0]); // 🎨 v616: al abrir un hijo, el panel toma el color de su edad
    app.innerHTML = `<div class="fm-det"><aside class="fm-dside"><button class="fm-dback" id="back">${I('chev')} Mis hijos</button>
        <div class="card fm-who"><span class="fm-dav ${g[0]}">${esc((k.first || '?').charAt(0))}</span><h2>${esc(k.first)} ${esc(k.lastName || '')}</h2><p>${esc(k.planName)}${k.module ? ' · ' + LVN[k.module] : ''}</p><i class="fm-tag ${g[0]}">${g[1]}${k.age != null ? ' · ' + k.age + ' AÑOS' : ''}</i>
          <div class="fm-ring" style="--p:${d.pct || 0}"><div><b>${d.pct || 0}%</b><small>${k.module ? 'Módulo ' + k.module : 'Su módulo'}</small></div></div>
          <div class="fm-kv"><div><span>Objetivo</span><b>${esc(GOALN[d.goal] || 'Aún no lo elige')}</b></div><div><span>Código</span><b>${esc(k.code)}</b></div><div><span>${k.expired ? 'Plan venció el' : k.planEnd ? 'Plan activo hasta' : 'Plan'}</span><b>${k.planEnd ? fD(k.planEnd) : esc(k.planName)}</b></div></div>
          <button class="btn w block" data-in="${esc(k.code)}"><span class="fm-inb"><b>Ver el perfil de ${esc(k.first)}</b><small>(modo lectura)</small></span></button></div></aside>
      <div class="fm-dmain"><div class="fm-wk"><div><small>Lecciones esta semana</small><b>${w.classes || 0}</b></div><div><small>Días que practicó</small><b>${w.days || 0}</b></div><div><small>Medallas</small><b>${d.tp || 0}</b></div>${`<div><small>${prem ? 'Clases con profe del mes' : 'Su nivel'}</small><b>${prem ? (k.credits ? k.credits.used + ' de ' + k.credits.total : '—') : (k.module ? LVN[k.module].split(' ')[0] : '—')}</b></div>`}</div>
        <div class="fm-d2"><div class="card fm-path"><div class="fm-dh"><h3>Su camino</h3><small>${d.done || 0} de ${d.total || '—'} lecciones</small></div>
            <div class="fm-pbar"><i style="width:${Math.max(3, d.pct || 0)}%"></i></div>
            <div class="fm-pnow">${I('star')}<span><small>Va en</small><b>${esc(d.cur || 'Su primer tema')}</b></span></div>
            <p class="fm-pnote">${w.classes ? `Esta semana hizo <b>${w.classes} ${w.classes === 1 ? 'lección' : 'lecciones'}</b>${w.topics ? ` y terminó <b>${w.topics} ${w.topics === 1 ? 'tema' : 'temas'}</b>` : ''}.` : ('Esta semana aún no ha hecho lecciones.' + (k.ag === 'teens' ? '' : ' Su meta es hacer 3 por semana.'))}</p></div>
          <div class="fm-dcol"><div class="card"><div class="fm-dh"><h3>Próximas clases con profe</h3></div>${(d.upcoming || []).length ? d.upcoming.map(c => { const dt = new Date(c.date + 'T12:00:00'); return `<div class="fm-cl"><span class="fm-dt">${MES[dt.getMonth()]}<b>${dt.getDate()}</b></span><span><b>${esc(c.teacher || 'Profe')}</b><small>${esc(c.dow)} · ${esc(c.time)}</small></span><i>Reservada</i></div>`; }).join('') : `<p class="fm-empty">${prem ? 'No tiene clases reservadas.' : 'Su plan no incluye clases con profe.'}</p>`}</div>
            <div class="card"><div class="fm-dh"><h3>Último comentario del profe</h3></div>${d.comment ? `<div class="fm-note"><b>${esc(d.comment.teacher || 'Su profe')} · ${esc(d.comment.nice)}:</b> ${esc(d.comment.text)}</div>` : '<p class="fm-empty">Aparecerá aquí después de su próxima clase con profe.</p>'}</div></div></div></div></div>`;
    window.scrollTo(0, 0); $('#back').onclick = () => render(r);
    app.querySelectorAll('[data-in]').forEach(b => b.onclick = () => { try { sessionStorage.setItem('mra_autocode', b.dataset.in); sessionStorage.setItem('mra_from_fam', '1'); sessionStorage.setItem('mra_obs', '1'); } catch (e) { } location.href = 'index.html'; });
  }
  /* v808 · «Agregar otro hijo(a)» sin salir del portal: planes → datos del hijo(a) → resumen y pago → vuelve aquí con su tarjeta */
  function addKid(r) {
    const f = r.family, P = (r.cat && r.cat.prices) || {}, S = { step: 1, plan: '', n: 8, first: '', last: '', birth: '', ok: false, rel: '', auth: false }, RELS = [['hijo', 'Hijo(a)'], ['sobrino', 'Sobrino(a)'], ['nieto', 'Nieto(a)'], ['otro', 'Otro']];
    const pk = (n) => n === 4 ? 'premium' : 'premium' + n, PLN = (k) => { try { const v = window.MRPLANS && MRPLANS.PL && MRPLANS.PL[k]; return v && v.n; } catch (e) { return 0; } }, price = () => S.plan === 'membership' ? (PLN('membership') || P.membership || 64900) : (PLN(pk(S.n)) || P[pk(S.n)] || 0);
    const pName = () => S.plan === 'free' ? 'Acceso gratuito · 3 días' : S.plan === 'membership' ? 'Plataforma' : 'Premium · ' + S.n + ' clases';
    const age = () => { if (!S.birth) return null; const b = new Date(S.birth + 'T12:00:00'), t = new Date(); let a = t.getFullYear() - b.getFullYear(); if (t < new Date(t.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
    const m = document.createElement('div'); m.className = 'modal fm-add2'; document.body.appendChild(m);
    const onPb = (e) => { if (!m.isConnected) return document.removeEventListener('mra-pb', onPb); const c = e.detail && e.detail.card; if (!c || !m.contains(c)) return; S.n = e.detail.n; if (/^premium/.test(S.plan)) { const b = m.querySelector('.fa-sum'); } };
    document.addEventListener('mra-pb', onPb);
    if (window.MRPLANS && !window.__famCat) { window.__famCat = 1; MRAC.call('plans', {}).then(x => { if (x && x.ok && MRPLANS.applyCat) { MRPLANS.applyCat(x.cat); if (m.isConnected && S.step === 1) draw(); } }).catch(() => { }); }
    const dots = () => `<div class="fa-steps">${['Plan', 'Sus datos', 'Pago'].map((t, i) => `<span class="${S.step === i + 1 ? 'on' : S.step > i + 1 ? 'ok' : ''}"><i>${S.step > i + 1 ? I('check') : i + 1}</i>${t}</span>`).join('<em></em>')}</div>`;
    const card = (k, ic, t, pr, per, b, tag) => `<button type="button" class="fa-pl${S.plan === k ? ' s' : ''}" data-p="${k}">${tag ? `<span class="fa-tg">${tag}</span>` : ''}<span class="fa-ic">${I(ic)}</span><b>${t}</b><strong>${pr}</strong><small>${per}</small><ul>${b.map(x => `<li>${I('check')}${x}</li>`).join('')}</ul></button>`;
    const draw = () => { let body = '';
      if (S.step === 1) { const PLS = window.MRPLANS; body = `<h3>Agrega un estudiante</h3><p class="muted fa-sub">Elige su plan. Mes a mes, sin permanencia.</p>
        ${PLS ? `<div class="in-plans lp-pg pl-in n2 fa-pls" role="radiogroup" aria-label="Plan"><button type="button" class="in-plan ${PLS.lpCls('membership')}${S.plan === 'membership' ? ' on' : ''}" data-fp="membership">${PLS.lpCard('membership', { pick: S.plan === 'membership' ? '✓ Seleccionado' : 'Elegir este plan' })}</button>${PLS.pbCard({ mode: 'pick', kid: true, cls: 'in-plan in-pb' + (/^premium/.test(S.plan) ? ' on' : ''), n0: S.n })}</div>` : ''}
        <button class="btn k block lg fa-go" id="fa-n" ${S.plan ? '' : 'disabled'}>Continuar →</button>`; }
      else if (S.step === 2) body = `<h3>Datos del estudiante</h3><p class="muted fa-sub">Tus datos ya los tenemos: no tienes que escribirlos.</p>
        <div class="fa-par">${I('users')}<span><b>${esc(f.guardian || 'Acudiente')}</b><small>Acudiente · ${esc(f.email || '')}</small></span></div>
        <div class="fa-f"><label>Nombre<input class="inp" id="fa-1" value="${esc(S.first)}" placeholder="Ej.: Sofía" autocomplete="off"></label><label>Apellidos<input class="inp" id="fa-2" value="${esc(S.last)}" placeholder="Ej.: Arrieta" autocomplete="off"></label><label class="w">Fecha de nacimiento<input class="inp" id="fa-3" type="date" value="${esc(S.birth)}"></label></div>
        <p class="fa-rl">¿Qué es de ti?</p><div class="fa-rels">${RELS.map(r => `<button type="button" class="fa-rel${S.rel === r[0] ? ' s' : ''}" data-rel="${r[0]}">${r[1]}</button>`).join('')}</div>
        <label class="fa-ok fa-au"><input type="checkbox" id="fa-au" ${S.auth ? 'checked' : ''}> Soy su representante legal o tengo la autorización de sus padres</label>
        <p class="fa-agi" id="fa-ag">${age() != null ? `Grupo: <b>${age() <= 12 ? 'KIDS' : age() <= 17 ? 'TEENS' : 'ADULTOS'} · ${age()} años</b>` : 'Desde los 9 años.'}</p>
        <div class="fa-nav"><button class="btn w" id="fa-b">← Atrás</button><button class="btn k" id="fa-n">Continuar →</button></div>`;
      else body = `<h3>Revisa y paga</h3><p class="muted fa-sub">Así queda ${esc(S.first)} en tu familia.</p>
        <div class="fa-sum"><div class="fa-sk"><span class="fm-pav">${esc((S.first || '?').charAt(0).toUpperCase())}</span><span><b>${esc(S.first)} ${esc(S.last)}</b><small>${age() <= 12 ? 'KIDS' : 'TEENS'} · ${age()} años${S.rel ? ' · ' + (RELS.find(r => r[0] === S.rel) || [, ''])[1] : ''}</small></span></div>
          <div class="fm-el"><span>${pName()} · 1 mes</span><b>${money(price())}</b></div><div class="fm-el"><span>Empieza</span><b>Hoy, al confirmar el pago</b></div><div class="fm-el t"><span>Total a pagar</span><b>${money(price())}</b></div></div>
        <label class="fa-ok"><input type="checkbox" id="fa-c" ${S.ok ? 'checked' : ''}> Acepto las <a href="politica.html" target="_blank">condiciones del plan</a></label>
        <div class="fa-nav"><button class="btn w" id="fa-b">← Atrás</button><button class="btn r" id="fa-n" ${S.ok ? '' : 'disabled'}>${S.plan === 'free' ? 'Activar acceso gratuito' : 'Pagar con Mercado Pago →'}</button></div><p class="fm-err" id="fa-er"></p>
        <p class="fa-back">${I('check')} Al terminar vuelves aquí y ves a ${esc(S.first)} en tu familia.</p>`;
      if (m.firstChild) m.classList.add('drawn');
      m.innerHTML = `<div class="card fa-card"><button class="fm-px" aria-label="Cerrar">×</button>${dots()}${body}</div>`;
      m.querySelector('.fm-px').onclick = () => m.remove(); m.onclick = (e) => { if (e.target === m) m.remove(); };
      m.querySelectorAll('[data-fp]').forEach(b => b.onclick = () => { S.plan = 'membership'; draw(); });
      m.querySelectorAll('.in-pb').forEach(c => c.onclick = (e) => { if (e.target.closest('[data-pbs],[data-cond]')) return; S.n = +c.dataset.pb || S.n; S.plan = 'premium'; draw(); });
      if (window.MRPLANS) { MRPLANS.pbInit(m); const pb = m.querySelector('.in-pb .pbB'); if (pb) pb.textContent = /^premium/.test(S.plan) ? '✓ Seleccionado' : 'Elegir este plan'; }
      const sv = () => { const v = (id) => (m.querySelector('#' + id) || {}).value; if (S.step === 2) { S.first = (v('fa-1') || '').trim(); S.last = (v('fa-2') || '').trim(); S.birth = v('fa-3') || ''; } };
      m.querySelectorAll('#fa-1,#fa-2,#fa-3').forEach(x => x.oninput = () => { sv(); const a = age(), el = m.querySelector('#fa-ag'); if (el) el.innerHTML = a != null ? `Grupo: <b>${a <= 12 ? 'KIDS' : a <= 17 ? 'TEENS' : 'ADULTOS'} · ${a} años</b>` : 'Desde los 9 años.'; });
      const c = m.querySelector('#fa-c'); if (c) c.onchange = () => { S.ok = c.checked; draw(); };
      m.querySelectorAll('[data-rel]').forEach(b => b.onclick = () => { sv(); S.rel = b.dataset.rel; draw(); }); const au = m.querySelector('#fa-au'); if (au) au.onchange = () => { sv(); S.auth = au.checked; };
      const bk = m.querySelector('#fa-b'); if (bk) bk.onclick = () => { sv(); S.step--; draw(); };
      m.querySelector('#fa-n').onclick = async () => { sv();
        if (S.step === 2) { const a = age(); if (!S.first || !S.last || a == null) return m.querySelector('#fa-ag').innerHTML = '<b class="fa-bad">Escribe su nombre, apellidos y fecha de nacimiento.</b>'; if (a < 9 || a > 17) return m.querySelector('#fa-ag').innerHTML = '<b class="fa-bad">Este portal es para estudiantes de 9 a 17 años.</b>'; if (!S.rel) return m.querySelector('#fa-ag').innerHTML = '<b class="fa-bad">Elige qué es de ti.</b>'; if (!S.auth) return m.querySelector('#fa-ag').innerHTML = '<b class="fa-bad">Marca la casilla de autorización para continuar.</b>'; }
        if (S.step < 3) { S.step++; return draw(); }
        const b = m.querySelector('#fa-n'), er = m.querySelector('#fa-er'); b.disabled = true; b.textContent = 'Procesando…';
        const x = await MRAC.call('famAddKid', { fcode: f.fcode, first: S.first, last: S.last, birth: S.birth, rel: S.rel, auth: S.auth ? 1 : 0, plan: S.plan === 'premium' ? pk(S.n) : S.plan }).catch(() => null);
        if (!x || !x.ok) { b.disabled = false; b.textContent = S.plan === 'free' ? 'Activar acceso gratuito' : 'Pagar con Mercado Pago →'; return (er.textContent = x && x.err === 'max' ? 'No se pudo agregar.' : x && x.err === 'age' ? 'Este portal es para estudiantes de 9 a 17 años.' : x && (x.err === 'mp_off' || x.err === 'mp_error') ? 'El pago en línea no está disponible en este momento. Escríbenos por WhatsApp al 301 781 0841.' : 'No se pudo procesar. Inténtalo de nuevo o escríbenos por WhatsApp al 301 781 0841.'); }
        if (x.url) { location.href = x.url; return; } m.remove(); start(); toastF('¡Listo! ' + S.first + ' ya está en tu familia.'); };
    };
    draw();
  }
  // 💳 pago familiar: varios planes en un solo pago
  function pay(r) { // 💳 v808: cada hijo con su plan actual, qué quieres hacer y el dinero explicado (saldo a favor, cuándo empieza, total)
    const f = r.family, P = (r.cat && r.cat.prices) || {}, EX = +(r.cat && r.cat.extra) || 32900;
    const actP = (k) => /^premium/.test(k.planKey || '') && !k.expired && !!k.planEnd;
    const act = (k) => /membership|premium/.test(k.planKey || '') && !k.expired && !!k.planEnd;
    const due = (k) => !!k.planEnd && /membership|premium/.test(k.planKey) && (k.expired || (k.daysLeft != null && k.daysLeft <= 7));
    const pk = (n) => n === 4 ? 'premium' : 'premium' + n, pn = (k) => k === 'premium' ? 4 : +String(k).replace('premium', '') || 8;
    const nm = (p) => p === 'membership' ? 'Plataforma' : /^premium/.test(p) ? 'Premium · ' + pn(p) + ' clases' : p === 'extra' ? 'Clases extra' : '';
    const next = (iso) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
    const mEnd = (iso) => { const d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + 1); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
    const st = r.kids.map(k => ({ k, on: false, plan: actP(k) && !due(k) ? 'extra' : (/membership|premium/.test(k.planKey) ? k.planKey : 'membership'), extra: actP(k) && !due(k) ? 1 : 0 }));
    // 💰 qué pasa con su plan actual: mismo plan = se renueva (empieza cuando termina el actual); otro plan = empieza hoy y lo no usado queda como saldo a favor
    const calc = (x) => { const k = x.k, L = []; let tot = 0, note = '';
      if (x.plan === 'extra') { tot = x.extra * EX; L.push([x.extra + (x.extra === 1 ? ' clase extra' : ' clases extra') + ' × ' + money(EX), money(tot)]); note = `Se suman a las clases de su plan. Úsalas antes del <b>${fD(k.planEnd)}</b>: no son acumulables.`; return { L, tot, note }; }
      const price = P[x.plan] || 0; L.push([nm(x.plan) + ' · 1 mes', money(price)]); tot = price;
      if (act(k) && x.plan === k.planKey) note = `Su plan actual sigue hasta el <b>${fD(k.planEnd)}</b>. El nuevo mes va del <b>${fD(next(k.planEnd))}</b> al <b>${fD(mEnd(next(k.planEnd)))}</b>. No pierde ningún día.`;
      else if (act(k) && (+k.saldo || 0) >= price) { return { L: [], tot: 0, block: 1, note: `Aún tiene <b>${money(+k.saldo)}</b> sin usar en su ${esc(k.planName)}: más que el valor de ${nm(x.plan)}. Para que no pierda nada, haz este cambio cuando termine su plan actual (<b>${fD(k.planEnd)}</b>).` }; }
      else if (act(k)) { const s = Math.min(+k.saldo || 0, price); if (s > 0) { L.push(['Saldo a favor de su plan actual', '−' + money(s), 'g']); tot -= s; }
        note = s > 0 ? `Lo que no ha usado de su ${esc(k.planName)}${/^premium/.test(k.planKey) ? ' (días y clases que le quedan)' : ' (' + k.daysLeft + (k.daysLeft === 1 ? ' día' : ' días') + ')'} se descuenta. El plan nuevo empieza <b>hoy</b>.` : `El plan nuevo empieza <b>hoy</b>, apenas se confirme el pago.`; }
      else note = `Empieza <b>hoy</b>, apenas se confirme el pago.`;
      if (/^premium/.test(x.plan) && x.extra) { L.push([x.extra + ' clase(s) extra × ' + money(EX), money(x.extra * EX)]); tot += x.extra * EX; }
      return { L, tot, note }; };
    const m = document.createElement('div'); m.className = 'modal fm-pay'; document.body.appendChild(m);
    const draw = () => { const sel = st.filter(x => x.on && (x.plan !== 'extra' || x.extra > 0) && !calc(x).block), tot = sel.reduce((t, x) => t + calc(x).tot, 0);
      const sc = (m.querySelector('.fm-pay2') || {}).scrollTop || 0; if (m.firstChild) m.classList.add('drawn');
      m.innerHTML = `<div class="card fm-pay2"><button class="fm-px" aria-label="Cerrar">×</button><h3>Planes y pagos</h3><p class="muted fm-psub">Elige a cuál de tus estudiantes le quieres pagar.</p>
        <div class="fm-pl">${st.map((x, i) => { const k = x.k, g = AG[k.ag] || AG.adult, isP = /^premium/.test(x.plan), n = isP ? pn(x.plan) : 8;
          const now = k.planEnd ? (k.expired ? `<em class="w">Venció el ${fD(k.planEnd)}</em>` : `${esc(k.planName)} · hasta el ${fD(k.planEnd)}${k.credits ? ' · ' + (k.credits.total - k.credits.used) + ' clases por reservar' : ''}`) : esc(k.planName || 'Acceso gratuito');
          const op = (v, t, sm, pr, s) => `<button type="button" class="fm-op${s ? ' s' : ''}" data-o="${i}" data-v="${v}"><span class="fm-r"></span><span class="fm-ot"><b>${t}</b><small>${sm}</small></span><span class="fm-opr">${pr}</span></button>`;
          const same = (p) => act(k) && k.planKey === p;
          let body = '';
          if (x.on) { const c = calc(x);
            body = `<p class="fm-q">¿Qué quieres hacer?</p><div class="fm-ops">${actP(k) ? op('extra', 'Agregar clases extra', 'Para este mes, dentro de su plan actual', money(EX) + ' c/u', x.plan === 'extra') : ''}${op('membership', same('membership') ? 'Renovar Plataforma' : 'Plataforma', same('membership') ? 'Un mes más, cuando termine el actual' : 'Practica a su ritmo, sin clases con profe', money(P.membership || 0), x.plan === 'membership')}${op(isP ? x.plan : 'premium8', actP(k) ? 'Renovar o cambiar Premium' : 'Premium · arma tus clases', 'Plataforma + las clases con profe que quiera', isP ? money(P[x.plan] || 0) : 'desde ' + money(P.premium || 0), isP)}</div>`
              + (isP ? `<div class="fm-cnt"><button type="button" data-n="${i}" data-d="-1" aria-label="Una clase menos" ${n <= 4 ? 'disabled' : ''}><span>−</span></button><span><b>${n}</b><small>clases al mes</small></span><button type="button" data-n="${i}" data-d="1" aria-label="Una clase más" ${n >= 20 ? 'disabled' : ''}><span>+</span></button></div>` : '')
              + (x.plan === 'extra' ? `<div class="fm-cnt"><button type="button" data-x="${i}" data-d="-1" aria-label="Quitar una clase" ${x.extra <= 1 ? 'disabled' : ''}><span>−</span></button><span><b>${x.extra}</b><small>${x.extra === 1 ? 'clase extra' : 'clases extra'}</small></span><button type="button" data-x="${i}" data-d="1" aria-label="Agregar una clase" ${x.extra >= 10 ? 'disabled' : ''}><span>+</span></button></div>` : '')
              + `<div class="fm-exp"><p>${c.note}</p>${c.block ? '' : `${c.L.map(l => `<div class="fm-el${l[2] ? ' ' + l[2] : ''}"><span>${l[0]}</span><b>${l[1]}</b></div>`).join('')}<div class="fm-el t"><span>Pagas por ${esc(k.first)} ${esc(k.lastName || '')}</span><b>${money(c.tot)}</b></div>`}</div>`; }
          return `<div class="fm-pr2${x.on ? ' on' : ''}"><label class="fm-ph"><input type="checkbox" data-i="${i}" ${x.on ? 'checked' : ''}><span class="fm-ck">${I('check')}</span><span class="fm-pn"><b>${esc(k.first)} ${esc(k.lastName || '')} <i class="fm-tag ${g[0]}">${g[1]}${k.age != null ? ' · ' + k.age + ' AÑOS' : ''}</i></b><small><span class="fm-pa">Plan actual</span> ${now}</small>${x.on ? '' : '<em class="fm-tap">Toca aquí para elegir qué pagarle</em>'}</span></label>${body}</div>`; }).join('')}</div>
        <div class="fm-tot"><span><small>${sel.length ? sel.map(x => esc(x.k.first) + ' ' + esc(x.k.lastName || '')).join(' + ') : 'Marca a uno de tus estudiantes'}</small><b>Total: ${money(tot)}</b></span><button class="btn" id="go" ${sel.length ? '' : 'disabled'}>Pagar ahora →</button></div><p class="fm-err" id="er"></p></div>`;
      m.querySelector('.fm-pay2').scrollTop = sc; m.querySelector('.fm-px').onclick = () => m.remove(); m.onclick = (e) => { if (e.target === m) m.remove(); };
      m.querySelectorAll('[data-i]').forEach(c => c.onchange = () => { const x = st[+c.dataset.i]; x.on = c.checked; if (x.on && x.plan === 'extra' && !x.extra) x.extra = 1; draw(); });
      m.querySelectorAll('[data-o]').forEach(b => b.onclick = (e) => { e.preventDefault(); const x = st[+b.dataset.o]; x.plan = b.dataset.v; x.extra = x.plan === 'extra' ? Math.max(1, x.extra || 1) : 0; draw(); });
      m.querySelectorAll('[data-n]').forEach(b => b.onclick = (e) => { e.preventDefault(); const x = st[+b.dataset.n]; x.plan = pk(Math.max(4, Math.min(20, pn(x.plan) + +b.dataset.d))); draw(); });
      m.querySelectorAll('[data-x]').forEach(b => b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const x = st[+b.dataset.x]; x.extra = Math.max(1, Math.min(10, x.extra + +b.dataset.d)); draw(); });
      m.querySelector('#go').onclick = async () => { const er = m.querySelector('#er'), b = m.querySelector('#go'); const items = st.filter(x => x.on && (x.plan !== 'extra' || x.extra > 0) && !calc(x).block).map(x => ({ code: x.k.code, plan: x.plan, extra: /^premium|^extra$/.test(x.plan) ? x.extra : 0 })); if (!items.length) return;
        b.disabled = true; b.textContent = 'Procesando…'; const x = await MRAC.call('famBuy', { fcode: f.fcode, items, method: 'mp' }).catch(() => null);
        if (!x || !x.ok) { b.disabled = false; b.textContent = 'Pagar ahora →'; return (er.textContent = x && (x.err === 'mp_off' || x.err === 'mp_error') ? 'El pago en línea no está disponible en este momento. Escríbenos por WhatsApp al 301 781 0841.' : x && x.err === 'saldo' ? 'Su saldo a favor cubre ese plan: haz el cambio cuando termine su plan actual.' : 'No se pudo procesar. Inténtalo de nuevo.'); }
        if (x.url) { location.href = x.url; return; } };
    };
    draw();
  }

  /* 🎉 bienvenida: papelitos + voz de mujer "Welcome, Nombre!" + recorrido (la primera vez) */
  const slug = (n) => String(n || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  function confetti(ms) {
    const cv = document.createElement('canvas'); cv.className = 'fm-conf'; document.body.appendChild(cv); const x = cv.getContext('2d'), dpr = devicePixelRatio || 1;
    const W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; x.scale(dpr, dpr);
    const C = ['#E3242B', '#0B2A5B', '#FFC21A', '#1B4A9B', '#ffffff', '#ff8a8f'];
    const P = Array.from({ length: innerWidth < 600 ? 90 : 160 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * .5, w: 6 + Math.random() * 7, h: 9 + Math.random() * 9, vy: 2 + Math.random() * 3, vx: (Math.random() - .5) * 2, r: Math.random() * 6.3, vr: (Math.random() - .5) * .25, c: C[Math.floor(Math.random() * C.length)] }));
    const t0 = performance.now();
    const loop = (t) => { const e = t - t0; x.clearRect(0, 0, W, H); const fade = e > ms - 600 ? Math.max(0, (ms - e) / 600) : 1;
      P.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin((p.y + p.r * 40) / 40) * .6; p.r += p.vr; x.save(); x.globalAlpha = fade; x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r))); x.restore(); });
      if (e < ms) requestAnimationFrame(loop); else cv.remove(); };
    requestAnimationFrame(loop);
  }
  function voice(name) {
    if (LS.get('mra_voice_off') === '1') return; const sl = slug(name), g = 'wf_' + (sl[0] || 'x');
    const say = () => { const A = window.AUD || {}, k = A['wf_' + sl] ? 'wf_' + sl : 'wf_'; if (!A[k]) return; const a = new Audio('data:audio/mpeg;base64,' + A[k]);
      a.play().catch(() => { const once = () => { removeEventListener('pointerdown', once); a.play().catch(() => { }); }; addEventListener('pointerdown', once); }); };
    const sc = document.createElement('script'); sc.src = 'js/audio/' + g + '.js?v=' + ((document.querySelector('script[src*="family.js"]').getAttribute('src').match(/v=(\d+)/) || [])[1] || '1');
    sc.onload = say; sc.onerror = () => { sc.remove(); const s2 = document.createElement('script'); s2.src = g + '.js'; s2.onload = say; document.head.appendChild(s2); }; document.head.appendChild(sc);
  }
  function welcome(first, voiceName) { confetti(2600); voice(voiceName || first); if (!LS.get('mra_fam_tour')) setTimeout(tour, 2800); }
  function tour() {
    const S = [
      ['.fm-hero', 'Bienvenido a tu portal familiar', 'Aquí ves de un vistazo cuántos estudiantes tienes en la escuela, cuántos tienen clase reservada y si tu alerta está activa.'],
      ['.fm-code', 'Tu código de familia', 'Con este código entras siempre a este portal. Escríbelo en «Ingresar», en el mismo lugar donde entran los estudiantes.'],
      ['.fm-kid', 'Cada uno de tus estudiantes', 'Ves su grupo (Kids o Teens), su plan, su próxima clase o su última práctica y su nivel. Toca la flecha para ver su código y entrar como él.'],
      ['.fm-al', 'Alerta de 7 días', 'Si un estudiante pasa una semana sin reservar clase o sin practicar, te escribimos al correo. Puedes apagarla aquí cuando quieras.']].filter(x => document.querySelector(x[0]));
    let i = 0; document.body.classList.add('fm-touring'); const ov = document.createElement('div'); ov.className = 'fm-tour'; document.body.appendChild(ov);
    const end = () => { ov.remove(); document.body.classList.remove('fm-touring'); document.querySelectorAll('.fm-spot').forEach(e => e.classList.remove('fm-spot')); LS.set('mra_fam_tour', '1'); };
    const show = () => { document.querySelectorAll('.fm-spot').forEach(e => e.classList.remove('fm-spot')); const [sel, t, d] = S[i]; const el = document.querySelector(sel); el.classList.add('fm-spot'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      ov.innerHTML = `<div class="fm-tc"><img src="mra-pointside.webp" alt=""><div><small>Paso ${i + 1} de ${S.length}</small><h3>${t}</h3><p>${d}</p><div class="fm-tb"><button class="btn w sm" data-x>Saltar</button><button class="btn k sm" data-n>${i === S.length - 1 ? 'Listo' : 'Siguiente →'}</button></div></div></div>`;
      ov.querySelector('[data-x]').onclick = end; ov.querySelector('[data-n]').onclick = () => { i++; if (i >= S.length) end(); else show(); }; };
    if (S.length) show(); else end();
  }

  async function start() {
    const fc = LS.get('mra_fam'); if (!fc) return login();
    const r = await MRAC.call('famData', { fcode: fc }).catch(() => null);
    if (!r || !r.ok) { if (r && r.err === 'notfound') LS.set('mra_fam', null); return login(r && r.err === 'notfound' ? '' : 'No hay conexión con la nube. Inténtalo de nuevo.'); }
    render(r);
  }
  window.__famReload = start; // v792: tras reservar, se actualiza la tarjeta del hijo
  start();
})();
