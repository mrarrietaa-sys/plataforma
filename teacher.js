/* =====================================================================
   PORTAL DE PROFESORES · mrarrieta.com
   · Entrada con código de profe + PIN (MRAC.call('tLogin')).
   · Resumen, disponibilidad para clases individuales, mis clases (asistencia),
     mis grupos. Todo en hora Colombia (UTC−5, sin horario de verano).
   · Sesión: sessionStorage 'mra_tp_session' = {tcode, pin} (idle.js la cierra).
   ===================================================================== */
(function () {
  const C = window.M1CONFIG || {}, MR = window.MRAC || { on: false, call: async () => ({ ok: false, err: 'offline' }) };
  const WA = C.WHATSAPP || '573017810841', SKEY = 'mra_tp_session', TABKEY = 'mra_tp_tab';
  const app = document.getElementById('tp-app'), outBtn = document.getElementById('tp-out');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ss = { get: (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del: (k) => { try { sessionStorage.removeItem(k); } catch (e) { } } };

  /* ---------- hora Colombia ---------- */
  const coNow = () => new Date(Date.now() - 5 * 36e5);                 // getUTC* = hora Colombia
  const today = () => coNow().toISOString().slice(0, 10);
  const nowHM = () => coNow().toISOString().slice(11, 16);
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DOWL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dLabel = (iso, long) => { const d = new Date(iso + 'T12:00:00Z'); return long ? `${DOWL[d.getUTCDay()]} ${d.getUTCDate()} de ${MON[d.getUTCMonth()]}` : `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`; };
  const rel = (iso) => { const t = today(); return iso === t ? 'Hoy' : iso === addDays(t, 1) ? 'Mañana' : iso === addDays(t, -1) ? 'Ayer' : ''; };
  const h12 = (hm) => { if (!/^\d{1,2}:\d{2}/.test(hm || '')) return hm || ''; let [h, m] = hm.split(':').map(Number); const ap = h < 12 ? 'a. m.' : 'p. m.'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };
  const endHM = (hm, dur) => { const [h, m] = String(hm).split(':').map(Number); const t = h * 60 + m + 50; return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };

  let S = null, D = null, tab = ss.get(TABKEY) || 'home', clsView = 'up';
  const form = { date: '', hours: [], dur: '50', repeat: false, weeks: 4 };

  /* ---------- utilidades de UI ---------- */
  function toast(msg, bad) { const t = document.createElement('div'); t.className = 'tp-toast' + (bad ? ' bad' : ''); t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('on')); setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 300); }, 3200); }
  function modal(html) { const m = document.createElement('div'); m.className = 'tp-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.innerHTML = `<div class="tp-modal-card card">${html}</div>`; document.body.appendChild(m); m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); }); return m; }
  const errText = (e) => ({ offline: 'El portal no está conectado a la nube.', network: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.', auth: 'Tu sesión no es válida. Vuelve a entrar.', booked: 'Ese espacio ya fue reservado por un estudiante.', started: 'La clase ya empezó: no se puede cancelar.', reason: 'Escribe el motivo de la cancelación.', doc: 'Escribe tu cédula y el lugar de expedición.', state: 'Esta clase ya no está programada.', notfound: 'No encontramos ese registro.' }[e] || 'Algo salió mal (' + e + '). Inténtalo de nuevo.');
  async function api(action, extra) {
    const r = await MR.call(action, Object.assign({ tcode: S.tcode, pin: S.pin }, extra || {}));
    if (!r.ok && r.err === 'auth') { logout(); toast(errText('auth'), true); }
    return r;
  }
  const studentName = (code) => { const s = D && D.students[String(code).toUpperCase()]; return s ? s.name || s.code : code; };
  const groupOf = (id) => (D.groups || []).find((g) => g.id === id);
  const meetOf = () => ''; // 🎥 las clases son en la clase en vivo de la plataforma (sin enlaces externos)
  // 🎁 v603: clase gratis — el profe sabe que es un estudiante de clase gratis y si ya confirmó
  const fcIs = (c) => c && c.type === 'vip' && String(c.flags || '').split(',').indexOf('gratis') >= 0;
  const fcNote = (c) => { if (!fcIs(c)) return ''; const f = String(c.flags || '').split(','); if (c.status !== 'scheduled') return f.indexOf('noconf') >= 0 ? '<div class="tp-fcn"><b>Estudiante de clase gratis</b><span>No confirmó a tiempo: la clase se canceló sola. No tienes que conectarte.</span></div>' : '';
    return f.indexOf('fok') >= 0 ? '<div class="tp-fcn ok"><b>Estudiante de clase gratis · ✓ La clase va</b><span>Confirmó. Es su primera clase con la escuela: ¡que viva la mejor experiencia!</span></div>' : '<div class="tp-fcn"><b>Estudiante de clase gratis · No te prepares todavía</b><span>Te confirmamos ' + (+String(c.time).slice(0, 2) < 11 ? 'la noche anterior (9:00 p. m.)' : '2 horas antes') + ' si la clase va o no. Solo te conectas si te llega «la clase va».</span></div>'; };
  const typeBadge = (c) => c.type === 'vip' ? '' /* v597: todas las clases son individuales, no hace falta decirlo */ : (c.type === 'club' ? '<span class="tp-badge grp">Club</span>' : '<span class="tp-badge grp">Grupal</span>');
  const statusBadge = (c) => ({ done: '<span class="tp-st done">Dictada ✓</span>', noshow: '<span class="tp-st noshow">No asistió</span>', cancelled: '<span class="tp-st canc">Cancelada</span>', latecancel: '<span class="tp-st canc">Cancelada tarde</span>', tnoshow: '<span class="tp-st noshow">⚠️ No te conectaste</span>', tlate: '<span class="tp-st noshow">⚠️ Cancelaste tarde</span>' }[c.status] || (c.date <= today() ? '<span class="tp-st pend">Por marcar</span>' : '<span class="tp-st sch">Programada</span>'));
  const NVI = (k) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',check: '<path d="M20 6 9 17l-5-5"/>',user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',calcheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>'})[k] || ''}</svg>`; // v671: íconos sobrios
  const pkOpen = (c) => c && c.status === 'scheduled' && new Date(c.date + 'T' + (c.time || '00:00') + ':00-05:00').getTime() > Date.now(); // v671: se puede elegir/cambiar hasta que empiece la clase
  const REPICK = new Set();
  const pkBlock = (t, c) => { /* v666: el estudiante pidió que el profe elija el tema · v671: el profe lo elige aquí */ const m = String(t).match(/Módulo (\d+)/), mod = m ? m[1] : '', rest = String(t).split('Por reforzar:')[1], can = pkOpen(c);
    const rows = rest ? rest.split(';').map(x => x.trim()).filter(Boolean).map(x => { const q = x.match(/^Tema (\d+) (.*?) (\d+)%$/); if (q) { const hh = window.MRTH && MRTH.get ? MRTH.get(+mod, +q[1]) : null; return `<div class="tp-pk-r"><span>${esc(hh && hh.s ? hh.s : q[2])}<small>Módulo ${mod} · Tema ${q[1]}: ${esc(q[2])}</small>${hh && hh.ex ? `<i>Ej.: “${esc(hh.ex)}”</i>` : ''}</span><b>Puntaje ${q[3]}%</b>${can && c ? `<button type="button" class="tp-pkb" data-pick="${esc(c.id)}" data-n="${q[1]}">Elegir este tema</button>` : ''}</div>`; } return q ? '' : `<div class="tp-pk-r"><span>${esc(x)}</span></div>`; }).join('') : `<div class="tp-pk-r"><span>Estudiante nuevo: elige uno de los primeros temas del Módulo ${mod}.</span></div>`;
    return `<div class="tp-pk"><p>El estudiante quiere que tú elijas el tema</p>${rows}<small>${rest ? (can ? 'Son sus temas con el puntaje más bajo. Elige uno: el estudiante lo verá en su clase.' : 'Son sus temas con el puntaje más bajo en la plataforma.') : 'Escoge el tema y prepáralo para la clase.'}</small></div>`; };
  const pkDone = (c) => { const q = window.MRTH && MRTH.parse ? MRTH.parse(c.topic) : null, hh = q && MRTH.get ? MRTH.get(+q.m, +q.t) : null, nm = String(c.topic).replace(/^Módulo \d+ · /, '');
    return `<div class="tp-pkd"><p>${NVI('check')}Tema elegido por ti</p>${hh && hh.s ? `<b>${esc(hh.s)}</b>` : ''}<span>${esc(String(c.topic))}</span>${hh && hh.ex ? `<i>Ej.: “${esc(hh.ex)}”</i>` : ''}${pkOpen(c) ? `<button type="button" class="tp-pkc" data-repick="${esc(c.id)}">Cambiar tema</button>` : ''}</div>`; };
  const whoOf = (c) => c.type === 'vip' ? esc(studentName(c.students[0] || '')) : esc(c.type === 'club' ? (c.topic || 'Club') : ((groupOf(c.groupId) || {}).name || 'Grupo')) + ` · ${c.students.length} estudiante${c.students.length === 1 ? '' : 's'}`;

  /* ---------- entrada ---------- */
  function loginView(msg) {
    if (!msg && MR.on) { try { location.replace('index.html'); return; } catch (e) { } } // 🔑 los profes entran con su clave en la página de entrada
    outBtn.classList.add('hidden');
    const off = !MR.on;
    app.innerHTML = `<section class="card tp-login center">
      <img src="mra-present.webp" alt="" class="tp-login-img" width="200" height="200">
      <span class="lbl">Portal de profesores</span>
      <h1>¡Hola, profe!</h1>
      <p class="muted">Entra con tu código de profesor y tu PIN para ver tus clases, tu disponibilidad y tus grupos.</p>
      ${off ? `<div class="tp-alert">⚠️ El portal todavía no está conectado a la nube de la escuela. Escribe a administración para recibir ayuda.<br><a class="btn w sm" style="margin-top:10px" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent((window.MRNE || String)('Hola, soy profe de mrarrieta.com y no puedo entrar al portal de profesores.'))}">💬 Escribir por WhatsApp</a></div>` : ''}
      <form id="tp-lf" class="tp-lform" novalidate>
        <label for="tp-code">Código de profesor</label>
        <input class="inp" id="tp-code" autocomplete="username" autocapitalize="characters" placeholder="Ej: PROFE-ANA" required>
        <label for="tp-pin">PIN</label>
        <input class="inp" id="tp-pin" type="password" autocapitalize="characters" autocomplete="current-password" placeholder="••••" required>
        <p class="tp-err" id="tp-lerr" ${msg ? '' : 'hidden'}>${esc(msg || '')}</p>
        <button class="btn k lg block" id="tp-go" ${off ? 'disabled' : ''}>Entrar</button>
      </form>
      <p class="muted tp-small">¿Olvidaste tu PIN? Pídelo a administración.</p>
    </section>`;
    $('#tp-lf').onsubmit = async (e) => {
      e.preventDefault();
      const tcode = $('#tp-code').value.trim().toUpperCase(), pin = $('#tp-pin').value.trim(), er = $('#tp-lerr'), b = $('#tp-go');
      if (!tcode || !pin) { er.textContent = 'Escribe tu código y tu PIN.'; er.hidden = false; return; }
      b.disabled = true; b.textContent = 'Entrando…';
      const r = await MR.call('tLogin', { tcode, pin });
      b.disabled = false; b.textContent = 'Entrar';
      if (!r.ok) { er.textContent = r.err === 'auth' ? 'Código o PIN incorrecto.' : errText(r.err); er.hidden = false; return; }
      try { localStorage.setItem('mra_last_role', JSON.stringify({ role: 'teacher', first: (r.teacher && (r.teacher.hello || String(r.teacher.name || '').split(' ')[0])) || '' })); } catch (e) { } // 🔑 la entrada le muestra "Entrar"
      S = { tcode, pin }; ss.set(SKEY, S); D = r; tab = 'home'; ss.set(TABKEY, tab); shell(); try { window.MRANN && MRANN.sync(); } catch (e) { } contractCheck().then((blk) => { if (blk) { const iv = setInterval(() => { if (!document.querySelector('.tp-ct')) { clearInterval(iv); firstTour() ? tour() : welcome(); } }, 600); } else { firstTour() ? tour() : (welcome(), setTimeout(popNew, 1500)); } });
    };
  }
  // 🧭 tour de Mr. Arrieta: la primera vez que el profe entra (por código, en este dispositivo y en la nube)
  const TKEY = () => 'mra_ttour_' + String((D && D.teacher && D.teacher.code) || '').toUpperCase();
  /* 📄 contrato: se acepta UNA vez por versión y por año; al aceptar se descarga el PDF (y llega al correo con copia a administración) */
  let CT = null;
  const mdHtml = (t) => { const inl = (x) => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); let o = '', ul = false; String(t || '').split(/\n/).forEach((l) => { const v = l.trim(); if (/^- /.test(v)) { if (!ul) { o += '<ul>'; ul = true; } o += '<li>' + inl(v.slice(2)) + '</li>'; return; } if (ul) { o += '</ul>'; ul = false; } if (!v) return; o += /^# /.test(v) ? '<h2>' + inl(v.slice(2)) + '</h2>' : /^## /.test(v) ? '<h4>' + inl(v.slice(3)) + '</h4>' : '<p>' + inl(v) + '</p>'; }); return o + (ul ? '</ul>' : ''); };
  const fmtAcc = (d) => { const x = String(d || ''); const dd = new Date(x.slice(0, 10) + 'T12:00:00'); return dd.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) + (x.length > 15 ? ' · ' + h12(x.slice(11, 16)) : ''); };
  function loadPdfLib() { return new Promise((ok) => { if (window.jspdf) return ok(window.jspdf); const a = document.createElement('script'); a.src = 'js/jspdf.min.js'; a.onload = () => ok(window.jspdf); a.onerror = () => { const b = document.createElement('script'); b.src = 'jspdf.min.js'; b.onload = () => ok(window.jspdf); b.onerror = () => ok(null); document.head.appendChild(b); }; document.head.appendChild(a); }); }
  async function contractPdf(c) {
    const L = await loadPdfLib(); if (!L) { toast('No se pudo generar el PDF. Inténtalo de nuevo.', true); return; }
    const d = new L.jsPDF({ unit: 'pt', format: 'letter' }); const W = 612, M = 54, CW = W - 2 * M; let y = 60; const t = D.teacher || {};
    const need = (hh) => { if (y + hh > 740) { d.addPage(); y = 60; } };
    try { const im = await new Promise((ok, ko) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = ko; i.src = 'mra-brand.png'; }); const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; cv.getContext('2d').drawImage(im, 0, 0); d.addImage(cv.toDataURL('image/png'), 'PNG', M, 30, 90, 90 * im.height / im.width); y = 30 + 90 * im.height / im.width + 14; } catch (e) { }
    d.setDrawColor(227, 36, 43); d.setLineWidth(2); d.line(M, y, W - M, y); y += 22;
    const plain = (x) => String(x).replace(/\*\*(.+?)\*\*/g, '$1');
    String(c.text).split(/\n/).forEach((l) => { const v = l.trim(); if (!v) { y += 4; return; }
      if (/^# /.test(v)) { d.setFont('helvetica', 'bold'); d.setFontSize(14); d.setTextColor(11, 42, 91); need(24); d.text(plain(v.slice(2)), W / 2, y, { align: 'center' }); y += 16; d.setFontSize(8.5); d.setFont('helvetica', 'normal'); d.setTextColor(110); d.text('Versión ' + c.version + ' · Docente de inglés', W / 2, y, { align: 'center' }); y += 18; return; }
      if (/^## /.test(v)) { d.setFont('helvetica', 'bold'); d.setFontSize(10.5); d.setTextColor(11, 42, 91); need(22); y += 4; d.text(plain(v.slice(3)), M, y); y += 14; return; }
      const bul = /^- /.test(v); const txt = plain(bul ? v.slice(2) : v); d.setFont('helvetica', 'normal'); d.setFontSize(10); d.setTextColor(25);
      const lines = d.splitTextToSize(txt, CW - (bul ? 14 : 0)); lines.forEach((ln, i) => { need(14); if (bul && !i) d.text('•', M + 2, y); d.text(ln, M + (bul ? 14 : 0), y, bul ? {} : { align: 'justify', maxWidth: CW }); y += 13.5; }); y += 3; });
    need(110); y += 10; d.setDrawColor(11, 42, 91); d.setLineWidth(1.5); d.roundedRect(M, y, CW, 92, 8, 8); d.setFont('helvetica', 'bold'); d.setFontSize(10.5); d.setTextColor(11, 42, 91); d.text('CONSTANCIA DE ACEPTACIÓN ELECTRÓNICA', M + 12, y + 18);
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.setTextColor(25); d.text('Leído y aceptado por ' + String(t.name || '').toUpperCase() + ' · C.C. ' + ((c.accepted && c.accepted.doc) || '') + ' · Código ' + (t.code || ''), M + 12, y + 36);
    d.text('Fecha y hora: ' + fmtAcc(c.accepted && c.accepted.date) + ' (hora Colombia) · Versión ' + c.version, M + 12, y + 50);
    d.text('EL CONTRATANTE: John Jairo Arrieta Jaramillo · Representante legal · C.C. 1.047.374.279', M + 12, y + 68); d.text('EL CONTRATISTA: ' + (t.name || '') + ' · aceptado electrónicamente en la plataforma', M + 12, y + 82);
    d.save('contrato-mrarrieta-' + String(t.name || 'profe').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-') + '.pdf');
  }
  function contractModal(c) {
    if (!c.needs && !c.accepted) { const m0 = document.createElement('div'); m0.className = 'tp-modal'; m0.innerHTML = `<div class="tp-modal-card card" style="max-width:460px;text-align:center"><button class="tp-x" data-x aria-label="Cerrar">✕</button><h3>Mi contrato</h3><p class="muted">Aún no tienes un contrato por aceptar. Cuando la administración te lo envíe, te llegará un aviso aquí y a tu correo.</p><p class="muted" style="margin:0">Mientras tanto puedes conocer tu portal y practicar las clases en vivo. Los estudiantes podrán reservar contigo cuando aceptes tu contrato.</p></div>`; document.body.appendChild(m0); m0.addEventListener('click', (e) => { if (e.target === m0 || e.target.closest('[data-x]')) m0.remove(); }); return; } // v571
    const must = c.needs; const m = document.createElement('div'); m.className = 'tp-modal'; m.setAttribute('role', 'dialog');
    m.innerHTML = `<div class="tp-modal-card card tp-ct">${must ? '' : '<button class="tp-x" data-x aria-label="Cerrar">✕</button>'}<h3>${must ? 'Tu contrato: léelo y acéptalo' : 'Mi contrato'}</h3>
      ${must ? '<p class="muted" style="margin:0 0 8px">La administración te envió tu contrato. Léelo con calma: al aceptarlo se descarga una copia en PDF y te llega otra a tu correo. Mientras no lo aceptes, los estudiantes no podrán reservar clases contigo.</p>' : `<p class="tp-ct-ok">✔ Leído y aceptado el ${fmtAcc(c.accepted.date)} · versión ${esc(c.version)}</p>`}
      <div class="tp-ct-doc">${mdHtml(c.text)}</div>
      ${must && c.missingDoc ? `<div class="tp-ct-id"><label>Cédula de ciudadanía<input class="inp" id="ct-doc" inputmode="numeric" placeholder="Ej: 1.127.573.975"></label><label>Lugar de expedición<input class="inp" id="ct-city" placeholder="Ej: Cartagena, Bolívar"></label></div>` : ''}
      <div class="row" style="justify-content:center;gap:8px;margin-top:12px">${must ? '<button class="btn k" id="ct-ok">Leí y acepto</button>' : '<button class="btn w" id="ct-dl">Descargar copia (PDF)</button>'}</div></div>`;
    document.body.appendChild(m);
    if (!must) { m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); }); $('#ct-dl', m).onclick = () => contractPdf(c); return; }
    $('#ct-ok', m).onclick = async () => { const doc = $('#ct-doc', m) ? $('#ct-doc', m).value.trim() : '', city = $('#ct-city', m) ? $('#ct-city', m).value.trim() : '';
      if ($('#ct-doc', m) && (doc.replace(/\D/g, '').length < 5 || city.length < 3)) { toast('Escribe tu cédula y el lugar de expedición', true); return; }
      const b = $('#ct-ok', m); b.disabled = true; b.textContent = 'Guardando…';
      const x = await api('tContractAccept', { version: c.version, doc, docCity: city });
      if (x && x.ok) { CT = x; m.remove(); toast('✅ Contrato aceptado · se descargó tu copia y te llegó otra a tu correo'); contractPdf(x); ctBar(); }
      else { b.disabled = false; b.textContent = 'Leí y acepto'; toast(x && x.err === 'version' ? 'El contrato se actualizó: recarga la página.' : errText((x && x.err) || 'network'), true); } };
  }
  function ctBar() { const el = $('#tp-ctbar'); const it = $('#tp-ct small'); if (it && CT) it.textContent = CT.accepted ? 'Leído y aceptado · descargar copia' : CT.needs ? 'Pendiente por aceptar' : 'Aún no te lo han enviado';
    if (!el) return; el.innerHTML = CT && !CT.accepted ? `<div class="tp-ctbar"><span class="tp-ctbar-ic">${TI('file')}</span><div><b>${CT.needs ? 'Tienes un contrato pendiente por aceptar' : 'Aún no recibes clases'}</b><small>${CT.needs ? 'Acéptalo para que los estudiantes puedan reservar contigo.' : 'Los estudiantes podrán reservar contigo cuando la administración te envíe tu contrato y lo aceptes.'}</small></div>${CT.needs ? '<button class="btn k sm" id="tp-ctgo">Leer y aceptar</button>' : ''}</div>` : '';
    const g = $('#tp-ctgo'); if (g) g.onclick = () => contractModal(CT); }
  async function contractCheck() { const r = await api('tContract').catch(() => null); if (!r || !r.ok) return false; CT = r; ctBar(); if (r.needs) { contractModal(r); return true; } return false; }
  function firstTour() { if (D && D.teacher && D.teacher.tour) return false; try { return !localStorage.getItem(TKEY()); } catch (e) { return true; } }
  let TOUR_R = null; // tarifas reales para el tour
  async function tour() {
    if (!TOUR_R) { const r = await api('tPay').catch(() => null); TOUR_R = { rate: r && r.rate, noshow: r && r.noshowRate, penalty: r && r.penalty }; }
    const first = esc(String((D.teacher || {}).name || '').split(/\s+/)[0]);
    const R = TOUR_R || {}; const cop = (n) => '$' + Number(n).toLocaleString('es-CO');
    const steps = [ // 🧭 inducción para profes nuevos: cómo funciona la escuela y sus responsabilidades
      ['welcome', `¡Welcome, ${first}! 👋`, 'Soy Mr. Arrieta. En 3 minutos te explico cómo funciona la escuela, tu portal y tus responsabilidades como profe de <b>mrarrieta.com</b>.', null],
      ['idea', 'Cómo funciona la escuela', 'Damos <b>clases 1 a 1 de 50 minutos</b> en nuestra <b>clase en vivo</b> (video integrado en la plataforma), con la metodología <b>RealTalk®</b>: el estudiante habla desde el primer minuto. Los estudiantes <b>no tienen profe fijo</b>: cualquier estudiante Premium puede reservar contigo.', 'home'],
      ['point', 'Horario de la escuela', '<b>Lunes a viernes:</b> 7:00 a. m. a 9:00 p. m.<br><b>Sábados:</b> 7:00 a. m. a 5:00 p. m.<br>Domingos y festivos de Colombia no hay clases. (Hora Colombia)', null],
      ['point', 'Resumen', 'Aquí ves tus <b>notificaciones</b> (clases reservadas y mensajes), tus próximas clases y tus estadísticas. Cada mañana también te llega un correo con tu resumen del día.', 'home'],
      ['idea', 'Mi disponibilidad', 'Publica <b>solo</b> los horarios en los que realmente puedes dictar. Los estudiantes reservan desde <b>mañana</b> durante los <b>próximos 5 días de clase</b>, sin domingos ni festivos (nunca el mismo día). Cada <b>viernes</b> confírmala con un clic (plazo: <b>sábado 5:00 p. m.</b>); si no, tus horas de la semana siguiente se ocultan hasta que la confirmes.', 'avail'],
      ['present', 'Antes de cada clase', 'En <b>Mis clases</b> toca <b>👤 Ficha</b>: ves el nivel del estudiante, el tema que quiere reforzar y el resumen de sus clases anteriores con otros profes (resultado, qué reforzar y la pizarra). Prepara tu clase con eso.', 'classes'],
      ['watch', 'Puntualidad', 'Conéctate <b>a la hora exacta</b>. La clase dura 50 minutos desde la hora reservada: si el estudiante llega tarde, no se extiende (9:00 → termina 9:50). Si a los <b>15 minutos</b> no se ha conectado, puedes retirarte y marcas <b>No asistió</b>.', null],
      ['pointside', 'Durante la clase', 'Entra desde <b>Mis clases → Entrar a la clase</b> (se activa 5 minutos antes). La clase en vivo te guía paso a paso: qué hacer, audio, respuesta esperada, <b>pizarra</b> y reloj de 50 minutos. Practica antes en <b>Herramientas → Clases en vivo</b>. Haz que el estudiante hable la mayor parte del tiempo.', null],
      ['present', 'Después de cada clase', 'Al terminar la clase en vivo, el resumen y la pizarra se guardan solos en la <b>ficha del estudiante</b> y puedes marcarla como <b>Dictada</b> ahí mismo. Si no asistió, márcala como <b>No asistió</b> en Mis clases. El estudiante lo ve y el próximo profe sabe qué se vio.', 'classes'],
      ['pointside', 'Chat con estudiantes', 'En el <b>Chat con estudiantes</b> (menú Mi cuenta) respondes dudas y tareas. Responde con amabilidad y dentro del horario de la escuela.', null],
      ['watch', 'Si no te conectas', `El estudiante puede reportarlo con "Mi profe no se conectó". Si se confirma, la clase vuelve a su saldo y se descuentan <b>${cop(R.penalty || 10000)}</b> de tu pago. Si tienes un imprevisto, avisa a administración lo antes posible.`, null],
      ['thumbs', 'Tus pagos', `No hay sueldo fijo: se paga cada mes por clase. Clase dictada: <b>${cop(R.rate || 21800)}</b>. Si te conectas, esperas 15 minutos y el estudiante no llega: <b>${cop(R.noshow || 10000)}</b>. Las canceladas y no dictadas no se pagan. Revisa tu detalle en <b>Mis pagos</b>.`, 'pay'],
      ['thumbs', '¡Bienvenido(a) al equipo! 🚀', 'Último paso: lee y acepta la <b>política de clases</b>. Luego escribe tu <b>disponibilidad semanal</b> para empezar a recibir reservas.', 'home'],
    ];
    try { localStorage.setItem(TKEY(), '1'); } catch (e) { } if (D && D.teacher && !D.teacher.tour) { D.teacher.tour = 1; api('tTour').catch(() => { }); } // marcado desde que empieza
    let i = 0;
    const m = document.createElement('div'); m.className = 'tp-modal'; document.body.appendChild(m);
    const end = (go) => { m.remove(); try { localStorage.setItem(TKEY(), '1'); } catch (e) { } if (D && D.teacher && !D.teacher.tour) { D.teacher.tour = '1'; api('tTour').catch(() => { }); } if (go) { tab = 'avail'; ss.set(TABKEY, tab); shell(); } };
    const draw = () => {
      const [mood, t, d, tb] = steps[i]; const last = i === steps.length - 1;
      if (tb && tab !== tb && !last) { tab = tb; ss.set(TABKEY, tab); shell(); document.body.appendChild(m); }
      m.innerHTML = `<div class="tp-modal-card card" style="text-align:center"><img src="mra-${mood}.webp" alt="Mr. Arrieta" style="height:150px;margin:0 auto 6px;display:block"><h2>${t}</h2><p>${d}</p>
        <p class="muted" style="font-size:13px">${i + 1} / ${steps.length}</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${i ? '<button class="btn w" data-b>← Atrás</button>' : '<button class="btn w" data-s>Saltar</button>'}<button class="btn k" data-n>${last ? '📌 Leer y aceptar la política' : 'Siguiente →'}</button></div></div>`;
      m.querySelector('[data-n]').onclick = () => { if (last) { m.remove(); if (window.MRPOLICY) return MRPOLICY.showTeacher({ rate: R.rate, noshow: R.noshow, penalty: R.penalty, onAccept: () => { toast('✅ Gracias por tu compromiso'); end(true); } }); return end(true); } i++; draw(); };
      const b = m.querySelector('[data-b]'); if (b) b.onclick = () => { i--; draw(); };
      const sk = m.querySelector('[data-s]'); if (sk) sk.onclick = () => { end(false); tab = 'home'; ss.set(TABKEY, tab); shell(); }; // el saludo fue al entrar: no se repite
    };
    draw();
    // voz de bienvenida también en el tour
    const sl = String((D.teacher || {}).name || '').split(/\s+/)[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    const say = () => { const A = window.AUD || {}; const k = A['wb_' + sl] ? 'wb_' + sl : (A['wb_'] ? 'wb_' : ''); if (k) try { new Audio('data:audio/mpeg;base64,' + A[k]).play().catch(() => { }); } catch (e) { } };
    const sc = document.createElement('script'); sc.src = 'js/audio/wb_' + (sl[0] || 'x') + '.js'; sc.onload = say; sc.onerror = () => { const s2 = document.createElement('script'); s2.src = 'wb_' + (sl[0] || 'x') + '.js'; s2.onload = say; document.head.appendChild(s2); }; document.head.appendChild(sc);
  }
  // saludo al entrar: voz "Welcome back, Nombre!" + recordatorio de la disponibilidad
  function welcome() {
    const t = D.teacher || {}; const first = String(t.name || '').split(/\s+/)[0];
    const sl = first.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    const hasWeek = Object.keys(t.weekly || {}).length > 0;
    const wd = (() => { const nm = t.weekNext, dow = new Date(today() + 'T12:00:00').getDay(); return hasWeek && nm && t.weekOk !== nm && (t.weekCut || dow === 5 || dow === 6 || dow === 0) ? dLabel(nm) + ' al ' + dLabel(addDays(nm, 5)) : ''; })();
    if (wd) { const m = modal(`<div style="text-align:center"><div style="font-size:52px">📅</div><h2>¡Welcome, ${esc(first)}!</h2><p><b>Confirma tu disponibilidad de la próxima semana</b> (${wd}). Los estudiantes reservan con base en tus horas.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px"><button class="btn k" id="wl-av">📅 Revisar y confirmar</button><button class="btn w" data-x>Más tarde</button></div></div>`);
      $('#wl-av', m).onclick = () => { m.remove(); tab = 'avail'; ss.set(TABKEY, tab); shell(); }; return; }
    const m = modal(`<div style="text-align:center"><div style="font-size:52px">👋</div><h2>¡Welcome, ${esc(first)}!</h2>
      <p>${hasWeek ? 'Antes de empezar, revisa que tu <b>disponibilidad semanal</b> esté al día. Los estudiantes Premium solo pueden reservar clases individuales en los horarios que publiques.' : '<b>Aún no has escrito tu disponibilidad semanal.</b> Márcala ahora para que los estudiantes Premium puedan reservar tus clases individuales.'}</p>
      <p class="muted">Lunes a sábado · domingos y festivos no hay clases.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px"><button class="btn k" id="wl-av">📅 ${hasWeek ? 'Revisar' : 'Escribir'} mi disponibilidad</button><button class="btn w" data-x>Más tarde</button></div></div>`);
    $('#wl-av', m).onclick = () => { m.remove(); tab = 'avail'; ss.set(TABKEY, tab); shell(); };
    // voz pregrabada (misma de la plataforma)
    const say = () => { const A = window.AUD || {}; const k = A['wb_' + sl] ? 'wb_' + sl : (A['wb_'] ? 'wb_' : ''); if (!k) return; try { new Audio('data:audio/mpeg;base64,' + A[k]).play().catch(() => { }); } catch (e) { } };
    const tryLoad = (paths) => { if (!paths.length) return say(); const sc = document.createElement('script'); sc.src = paths[0]; sc.onload = say; sc.onerror = () => { sc.remove(); tryLoad(paths.slice(1)); }; document.head.appendChild(sc); };
    tryLoad(['js/audio/wb_' + (sl[0] || 'x') + '.js', 'wb_' + (sl[0] || 'x') + '.js']);
  }
  function logout() { ss.del(SKEY); ss.del(TABKEY); S = null; D = null; loginView(); try { window.MRANN && MRANN.sync(); } catch (e) { } }
  async function reload() { const r = await api('tLogin'); if (r.ok) { D = r; shell(); } else if (r.err !== 'auth') toast(errText(r.err), true); return r.ok; }

  /* ---------- estructura principal ---------- */
  const TI = (n) => `<svg class="tpi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TIP[n] || ''}</svg>`; const TIP = {"tools": "<path d=\"M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L13 2\"/><path d=\"m3 21 6-6\"/>", "video": "<path d=\"m22 8-6 4 6 4V8z\"/><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"/>", "home": "<path d=\"m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><path d=\"M9 22V12h6v10\"/>", "grad": "<path d=\"M22 10 12 5 2 10l10 5 10-5z\"/><path d=\"M6 12v5c3 3 9 3 12 0v-5\"/>", "cal": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/>", "pay": "<rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2.5\"/><path d=\"M6 12h.01M18 12h.01\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>", "chat": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>", "file": "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><path d=\"M14 2v6h6M16 13H8M16 17H8M10 9H8\"/>", "shield": "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"m9 12 2 2 4-4\"/>", "key": "<circle cx=\"7.5\" cy=\"15.5\" r=\"5.5\"/><path d=\"m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3\"/>", "compass": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z\"/>"}; // v568: íconos de línea (sin emojis)
  const TABS = [['home', '🏠', 'Resumen'], ['avail', '🗓️', 'Mi disponibilidad'], ['classes', '🎓', 'Mis clases'], ['pay', '💰', 'Mis pagos']];
  function shell() {
    bell();
    outBtn.classList.remove('hidden'); outBtn.onclick = () => { if (confirm('¿Cerrar sesión?')) logout(); };
    const t = D.teacher;
    app.innerHTML = `<div class="tp-head">
        <div class="tp-head-txt"><h1>¡Hola, <span class="mk-pill">${esc(t.hello || String(t.name || '').split(' ')[0])}!</span></h1><p class="muted">${dLabel(today(), true)} · <b>${h12(nowHM())}</b> hora Colombia · Código <b>${esc(t.code)}</b></p></div>
        <div class="tp-dds">
          <div class="tp-dd"><button class="tp-ddb" data-dd="tools">${TI('tools')} Herramientas <span class="car">▾</span></button><div class="tp-ddm">
            <button class="tp-mi" id="tp-live"><i class="ib2">${TI('video')}</i><span><b>Clases en vivo</b><small>Practica las clases de los 4 módulos</small></span></button>
</div></div>
          <div class="tp-dd"><button class="tp-ddb" data-dd="cls">${({ home: TI('home') + ' Resumen', avail: TI('cal') + ' <span class="tp-lg">Mi disponibilidad</span><span class="tp-sh">Disponibilidad</span>', classes: TI('grad') + ' Mis clases', pay: TI('pay') + ' Mis pagos' })[tab] || TI('grad') + ' Mis clases'} <span class="car">▾</span></button><div class="tp-ddm">
            <button class="tp-mi tp-tab" data-tab="home"><i class="ib6">${TI('home')}</i><span><b>Resumen</b><small>Próximas clases y estadísticas</small></span></button>
            <button class="tp-mi tp-tab" data-tab="classes"><i class="ib">${TI('grad')}</i><span><b>Mis clases</b><small>Próximas y pasadas · tablero</small></span></button>
            <button class="tp-mi tp-tab" data-tab="avail"><i class="ib2">${TI('cal')}</i><span><b>Mi disponibilidad</b><small>Tus horarios para reservar</small></span></button>
            <button class="tp-mi tp-tab" data-tab="pay"><i class="ib4">${TI('pay')}</i><span><b>Mis pagos</b><small>Detalle del mes</small></span></button></div></div>
          <div class="tp-dd"><button class="tp-ddb" data-dd="me">${TI('user')} Mi cuenta <span class="car">▾</span><i class="tp-dot" id="tp-chatdot" hidden></i></button><div class="tp-ddm">
            <button class="tp-mi" id="tp-chat"><i class="ib4">${TI('chat')}</i><span><b>Chat con estudiantes</b><small>Responde dudas y tareas</small></span></button>
            <button class="tp-mi" id="tp-ct"><i class="ib">${TI('file')}</i><span><b>Mi contrato</b><small>Leído y aceptado · descargar copia</small></span></button><button class="tp-mi" id="tp-pol"><i class="ib">${TI('shield')}</i><span><b>Política de clases</b><small>Puntualidad, pagos y compromisos</small></span></button>
            <button class="tp-mi" id="tp-pinch"><i class="ib3">${TI('key')}</i><span><b>Cambiar mi clave</b><small>Tu clave de acceso</small></span></button>
            <button class="tp-mi" id="tp-tour"><i class="ib5">${TI('compass')}</i><span><b>Ver el tour</b><small>Cómo funciona tu portal</small></span></button></div></div>
        </div>
      </div>
      <div id="tp-ctbar"></div><div id="tp-ofr"></div><section id="tp-body"></section>`;
    if (CT) setTimeout(ctBar, 0);
    try { if (window.MROFR) setTimeout(() => MROFR.init({ kind: 'profe', mount: '#tp-ofr', name: (D.teacher.hello || D.teacher.name || ''), call: (a, d) => api(a, d) }), 1200); } catch (e) { } // v573: ofertas de video
    if ($('#tp-tour')) $('#tp-tour').onclick = () => tour();
    if ($('#tp-mat')) $('#tp-mat').onclick = material;
    if ($('#tp-pz')) $('#tp-pz').onclick = () => pzPick();
    if ($('#tp-live')) $('#tp-live').onclick = () => { // 🎥 práctica de las clases en vivo de los 4 módulos
      const AGF = { 1: ['age_a1.js', 'M1AGE'], 2: ['age_a2.js', 'M2AGE'], 3: ['age_b2.js', 'MYAGE3'], 4: ['age_b2p.js', 'MYAGE4'] };
      const ld = (f, ok) => { const a = document.createElement('script'); a.src = 'js/' + f + '?v=' + Date.now().toString().slice(0, 7); a.onload = ok; a.onerror = () => { const b = document.createElement('script'); b.src = f; b.onload = ok; b.onerror = ok; document.head.appendChild(b); }; document.head.appendChild(a); };
      const show = (mod, ag) => { ag = ag || 'adult'; const T = (window.CLASE_TOPICS || {})[mod] || []; const LV = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2' }; const AQ = ag === 'adult' ? '' : '&ag=' + ag;
        { const need = []; if (ag === 'adult') { if (!window.MRADLIVE) need.push('adultlive.js'); } else { if (!window.MRAGEIMG) need.push('ageimg.js'); if (!window[AGF[mod][1]]) need.push(AGF[mod][0]); } if (need.length) { let n = need.length; need.forEach((f) => ld(f, () => { if (--n === 0) show(mod, ag); })); return; } } // v539: fotos y lecturas de su edad
        const G = ag === 'adult' ? null : ((window[AGF[mod][1]] || {})[ag] || {}), IM = ag === 'adult' ? null : ((window.MRAGEIMG || {})[ag] || {}).topics || {}, AD = window.MRADLIVE || {};
        const rd = (n) => { if (!G) return (AD[mod + '-' + n] || {}).r || ''; const x = (G['t' + n + 'p1'] || {}).reading || (G['t' + n + 'p2'] || {}).reading; return x && x.title ? x.title : ''; };
        const ph = (n) => { const v = IM ? IM[mod + '-' + n] : (AD[mod + '-' + n] || {}).c; return v ? `https://images.unsplash.com/photo-${v}?w=160&h=120&fit=crop&crop=faces,center&q=75&auto=format` : ''; };
        const AGH = { adult: ['Adultos', 'Conversación real para el trabajo, los viajes y la vida diaria. Clase guiada paso a paso, de 50 minutos.', 'mra-x-laptop.webp'], kids: ['Kids', 'Para niños de 9 a 11 años. Frases cortas, mucha energía y una misión con sellos en cada clase.', 'mra-x-balloon1.webp'], teens: ['Teens', 'Para jóvenes de 12 a 17 años. Temas de su vida, chat de la clase y racha de respuestas. Nada de trabajo.', 'mra-x-rocket.webp'] }[ag];
        const m = modal(`<div class="tpl tpl-${ag}"><button class="tp-x" data-x aria-label="Cerrar">✕</button><h3>🎥 Clases en vivo</h3><p class="muted">Cada tema es una clase de 50 minutos guiada paso a paso. Practícala aquí; la clase real se abre en <b>Mis clases → Entrar a la clase</b>.</p>
          <div class="tp-livetabs tp-agtabs">${[['adult', 'Adultos'], ['kids', 'Kids'], ['teens', 'Teens']].map(([k, t]) => `<button class="${k === ag ? 'on' : ''}" data-la="${k}">${t}</button>`).join('')}</div>
          ${AGH ? `<div class="tpl-hd"><img src="${AGH[2]}" alt="" onerror="this.remove()"><div><b>${AGH[0]}</b><span>${AGH[1]}</span></div></div>` : ''}
          <div class="tp-livetabs">${[1, 2, 3, 4].map((x) => `<button class="${x === mod ? 'on' : ''}" data-lm="${x}">Módulo ${x} · ${LV[x]}</button>`).join('')}</div>
          <div class="tp-livel">${T.map((t, i) => { const p = ph(i + 1), r = rd(i + 1); return `<a class="tp-livei${AGH ? ' ag' : ''}" href="clase-en-vivo.html?rol=profe&demo=1&m=${mod}&t=${i + 1}${AQ}">${AGH && p ? `<i class="tpl-ph" style="background-image:url('${p}')"><b>${i + 1}</b></i>` : `<b>${i + 1}</b>`}<span>${esc(t[0])}${AGH && r ? `<small>Lectura: ${esc(r)}</small>` : ''}${window.MRTH ? MRTH.html(mod, i + 1, ag, 't', { ex: 1, g: 1 }) : ''}</span><em>Practicar →</em></a>`; }).join('') || '<p class="muted">Cargando…</p>'}</div></div>`);
        const box = m.querySelector('.tp-modal-card') || m; box.classList.add('tpl-box', 'tpl-box-' + ag);
        m.querySelectorAll('[data-lm]').forEach((b) => b.onclick = () => { m.remove(); show(+b.dataset.lm, ag); }); m.querySelectorAll('[data-la]').forEach((b) => b.onclick = () => { m.remove(); show(mod, b.dataset.la); }); };
      if (window.CLASE_TOPICS) return show(1);
      const sc = document.createElement('script'); sc.src = 'js/clase-topics.js?v=' + Date.now().toString().slice(0, 7); sc.onload = () => show(1); sc.onerror = () => { const s2 = document.createElement('script'); s2.src = 'clase-topics.js'; s2.onload = () => show(1); document.head.appendChild(s2); }; document.head.appendChild(sc); };
    if ($('#tp-ct')) $('#tp-ct').onclick = async () => { const r = CT && !CT.needs ? CT : await api('tContract').catch(() => null); if (r && r.ok) contractModal(r); else toast(errText('network'), true); };
    if ($('#tp-pol')) $('#tp-pol').onclick = async () => { const r = await api('tPay').catch(() => null); window.MRPOLICY && MRPOLICY.showTeacher({ rate: r && r.rate, noshow: r && r.noshowRate, penalty: r && r.penalty, conv: r && r.convAmt, onAccept: () => toast('✅ Gracias por tu compromiso') }); }; // 📌 política (puntualidad, 15 minutos)
    if ($('#tp-pinch')) $('#tp-pinch').onclick = () => { // 🔑 cambiar PIN
      const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="card"><button class="mx" aria-label="Cerrar">✕</button><h3>🔑 Cambiar mi clave</h3><p class="muted">Usa de 6 a 16 letras o números. Con ella entras directo a tu portal desde la página de entrada.</p>
        <input class="inp" id="pc-old" type="password" autocapitalize="characters" placeholder="Clave actual" style="margin-bottom:8px"><input class="inp" id="pc-new" type="password" autocapitalize="characters" placeholder="Nueva clave" style="margin-bottom:8px"><input class="inp" id="pc-new2" type="password" autocapitalize="characters" placeholder="Repite la nueva clave">
        <p id="pc-msg" style="color:#b91c1c;font-weight:700;min-height:20px;margin:8px 0;text-align:center"></p><button class="btn k block lg" id="pc-go">Guardar nueva clave</button></div>`; document.body.appendChild(m);
      m.querySelector('.mx').onclick = () => m.remove(); m.onclick = (e) => { if (e.target === m) m.remove(); };
      m.querySelector('#pc-go').onclick = async () => { const o = m.querySelector('#pc-old').value.trim(), n = m.querySelector('#pc-new').value.trim(), n2 = m.querySelector('#pc-new2').value.trim(), msg = m.querySelector('#pc-msg');
        if (o !== String(S.pin)) return msg.textContent = 'La clave actual no es correcta.';
        if (!/^[A-Za-z0-9]{6,16}$/.test(n)) return msg.textContent = 'Usa de 6 a 16 letras o números (sin espacios ni símbolos).';
        if (n !== n2) return msg.textContent = 'Las dos claves nuevas no coinciden.';
        const b = m.querySelector('#pc-go'); b.disabled = true; b.textContent = 'Guardando…';
        const r = await api('tPinChange', { newPin: n }).catch(() => null);
        if (r && r.ok) { S.pin = n; ss.set(SKEY, S); m.querySelector('.card').innerHTML = '<div style="text-align:center"><h3>✅ ¡Listo! Tu clave cambió</h3><p>Desde ahora entra con tu nueva clave. Te enviamos una confirmación a tu correo.</p><button class="btn k block lg" id="pc-ok">Entendido</button></div>'; m.querySelector('#pc-ok').onclick = () => m.remove(); return; }
        b.disabled = false; b.textContent = 'Guardar nueva clave'; msg.textContent = !r ? 'No hay conexión. Inténtalo de nuevo.' : r.err === 'same' ? 'La nueva clave es igual a la actual.' : r.err === 'taken' ? 'Esa clave no está disponible. Elige otra.' : 'No se pudo cambiar. Inténtalo de nuevo.'; }; };
    if ($('#tp-chat')) $('#tp-chat').onclick = () => openChat();
    if (/#chat\b/.test(location.hash)) { history.replaceState(null, '', location.pathname); setTimeout(() => openChat(), 300); }
    $$('.tp-tab').forEach((b) => { b.classList.toggle('on', b.dataset.tab === tab); b.onclick = () => { tab = b.dataset.tab; ss.set(TABKEY, tab); shell(); }; });
    { const dot = $('#tp-chatdot'); if (dot) dot.hidden = !(D.notifications || []).some((n) => !n.read && n.type === 'chat'); } // 🔴 mensajes nuevos
    // menús desplegables (Herramientas · Mis clases · Mi cuenta)
    const dds = $$('.tp-dd'); const closeDD = () => dds.forEach((d) => d.classList.remove('open'));
    dds.forEach((d) => { d.querySelector('.tp-ddb').onclick = (e) => { e.stopPropagation(); const o = d.classList.contains('open'); closeDD(); if (!o) d.classList.add('open'); }; d.querySelectorAll('.tp-mi').forEach((x) => x.addEventListener('click', closeDD)); });
    if (!window.__tpdd) { window.__tpdd = 1; document.addEventListener('click', (e) => { if (!e.target.closest('.tp-dd')) $$('.tp-dd').forEach((d) => d.classList.remove('open')); }); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.tp-dd').forEach((d) => d.classList.remove('open')); }); }
    ({ home, avail, classes, groups, pay }[tab] || home)($('#tp-body'));
    if (tab === 'home' || tab === 'avail') weekBanner($('#tp-body')); // v672: cada pestaña muestra solo lo suyo
    if (tab === 'home') tprCard($('#tp-body'));
  }
  /* 🎓 v596 · Prueba del profe: 30 días para vivir las lecciones como un estudiante real (desaparece sola al terminar) */
  function tprCard(el) {
    const x = D && D.tpr; if (!el || !x || !x.on) return;
    const ids = ['A1', 'A2', 'B2', 'B2+'], mid = ids[(+x.module || 1) - 1] || 'A1', m = (x.mods || {})[mid] || {}, tot = +m.total || 0, dn = +m.done || 0;
    const T = +x.total || 7, pct = Math.max(4, Math.min(100, Math.round((T - x.days) / T * 100)));
    const cap = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
    const box = document.createElement('div'); box.className = 'tpr-card';
    box.className = 'tpr-card tpr-slim'; // v672: franja compacta
    box.innerHTML = `<div class="tpr-t"><span class="tpr-badge">${cap}PRUEBA DEL PROFE</span><b>Vive la experiencia del estudiante</b><small>${x.days} ${x.days === 1 ? 'día restante' : 'días restantes'} · ${tot ? `Módulo ${+x.module || 1} · ${dn} de ${tot} lecciones` : 'Empiezas en el Módulo 1'}</small></div><button type="button" class="tpr-go" id="tpr-go">Entrar como estudiante →</button>`;
    el.prepend(box);
    $('#tpr-go').onclick = () => { const b = $('#tpr-go'); b.disabled = true; b.textContent = 'Entrando…';
      try { const p = JSON.parse(localStorage.getItem('mra_profile_v1') || 'null'); if (p && String(p.code || '').toUpperCase() !== String(x.code).toUpperCase()) localStorage.removeItem('mra_profile_v1');
        sessionStorage.setItem('mra_autocode', x.code); sessionStorage.setItem('mra_tpr', '1'); } catch (e) { }
      location.href = 'index.html'; };
  }


  /* 📅 confirmación semanal de disponibilidad (viernes a domingo, o si no tiene horas publicadas) */
  function weekBanner(el) {
    const t = D && D.teacher; if (!t || !el) return; const tg = t.weekNext; if (!tg) return;
    const dow = new Date(today() + 'T12:00:00').getDay(), w = t.weekly || {}, has = Object.keys(w).some((d) => (w[d] || []).length);
    const done = t.weekOk === tg, end = addDays(tg, 5), weekend = dow === 5 || dow === 6 || dow === 0;
    const hidden = (D.slots || []).filter((x) => x.status === 'hidden' && x.date >= today() && x.date <= end).length;
    const N = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };
    const rng = dLabel(tg) + ' al ' + dLabel(end);
    const rows = Object.keys(N).filter((d) => (w[d] || []).length).map((d) => `<li><b>${N[d]}</b><span>${w[d].map(h12).join(' · ')}</span></li>`).join('');
    const btns = (main) => `<div class="tp-wk-b">${has ? `<button class="btn ok" id="tp-wkok">✅ ${main}</button>` : ''}<button class="btn ${has ? 'w' : 'k'}" id="tp-wkch">✏️ ${has ? 'Cambiar mis horas' : 'Agregar mis horas'}</button></div>`;
    let html = '';
    if (!done && !hidden && t.weekCut && !weekend) html = `<div class="tp-wk due"><div class="tp-wk-h"><span class="tp-wk-i">📅</span><div><h2>${has ? 'Confirma tu disponibilidad de esta semana' : 'Revisa tu disponibilidad de esta semana'}</h2><p>Semana del <b>${rng}</b>. ${has ? 'Confirma tus horas para que sigan visibles para los estudiantes.' : 'Agrega tus horas fijas de cada semana para que los estudiantes puedan reservar contigo.'}</p></div></div>${btns('Confirmar mis horas')}</div>`; // v536: «ocultas» solo cuando de verdad hay horas ocultas
    else if (!done && hidden) html = `<div class="tp-wk bad"><div class="tp-wk-h"><span class="tp-wk-i">⚠️</span><div><h2>Tus horas de la semana del ${rng} están ocultas</h2><p>No confirmaste tu disponibilidad a tiempo, así que los estudiantes no pueden reservar contigo esa semana. Las clases ya reservadas siguen igual. Confírmala ahora y tus horas vuelven a aparecer al instante.</p></div></div>${has ? `<ul class="tp-wk-l">${rows}</ul>` : ''}${btns('Confirmar y volver a publicar')}</div>`;
    else if (!has) html = `<div class="tp-wk due"><div class="tp-wk-h"><span class="tp-wk-i">📅</span><div><h2>Publica tu disponibilidad</h2><p>Aún no tienes horas publicadas: los estudiantes no pueden reservar contigo.</p></div></div>${btns('')}</div>`;
    else if (weekend && !done) html = `<div class="tp-wk due"><div class="tp-wk-h"><span class="tp-wk-i">📅</span><div><h2>${dow === 6 ? 'Último aviso: confirma tu disponibilidad antes de las 5:00 p. m.' : 'Confirma tu disponibilidad de la próxima semana'}</h2><p>Semana del <b>${rng}</b>. Revisa tus horas: los estudiantes reservan con base en ellas.</p></div></div><ul class="tp-wk-l">${rows}</ul>${btns('Sí, está al día')}<small>Plazo: <b>sábado 5:00 p. m.</b> Si no la confirmas, tus horas de esa semana se ocultan hasta que lo hagas. Si cambias tus horas y guardas, también queda confirmada.</small></div>`;
    else if (tab === 'avail') html = `<div class="tp-wk okk">✅ Disponibilidad confirmada para la semana del <b>${rng}</b>. Cada viernes te pediremos confirmar la siguiente (plazo: sábado 5:00 p. m.).</div>`;
    if (!html) return; const box = document.createElement('div'); box.innerHTML = html; el.prepend(box.firstElementChild);
    const ok = $('#tp-wkok'); if (ok) ok.onclick = async () => { const lb = ok.textContent; ok.disabled = true; ok.textContent = 'Guardando…'; const r = await api('tWeekOk'); if (!r || !r.ok) { ok.disabled = false; ok.textContent = lb; if (!r || r.err !== 'auth') toast('No se pudo guardar. Inténtalo de nuevo.', true); return; } D = r; toast('✅ ¡Gracias! Disponibilidad confirmada para la semana del ' + rng + '.'); shell(); };
    const ch = $('#tp-wkch'); if (ch) ch.onclick = () => { tab = 'avail'; ss.set(TABKEY, tab); shell(); setTimeout(() => { const g = $('#tp-wg'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); };
  }
  /* ---------- 1. Resumen ---------- */
  function classRow(c, opt) {
    const r = rel(c.date), link = meetOf(c), canMark = c.status === 'scheduled' && c.date <= today();
    return `<li class="tp-cls${r === 'Hoy' ? ' today' : r === 'Mañana' ? ' tomorrow' : ''}">
      <div class="tp-cls-when"><b>${r || dLabel(c.date)}</b><span>${r ? dLabel(c.date) + ' · ' : ''}${h12(c.time)} – ${h12(endHM(c.time, c.duration))}</span></div>
      <div class="tp-cls-what">${fcNote(c)}${typeBadge(c)} ${statusBadge(c)}<div class="tp-cls-who">${whoOf(c)}</div>${c.topic && c.type !== 'club' ? (/^El profe elige el tema/.test(c.topic) ? pkBlock(c.topic, c) : c.topt && REPICK.has(c.id) ? pkBlock(c.topt, c) : c.topt ? pkDone(c) : `<small class="muted">Tema: ${esc(c.topic)}</small>`) : ''}${(() => { const q = window.MRTH && c.type !== 'club' && !c.topt && c.topic && MRTH.parse(c.topic); if (!q) return ''; const st = (D && D.students[String(c.students[0] || '').toUpperCase()]) || {}; return MRTH.html(q.m, q.t, st.ag || 'adult', 't', { ex: 1, g: 1 }); })()}
        ${c.status === 'done' ? `<small class="muted">Asistencia: ${c.students.filter((x) => (c.attendance || {})[String(x).toUpperCase()] === true || (c.attendance || {})[x] === true).length}/${c.students.length}</small>` : ''}
        ${(c.type === 'group' || c.type === 'club') && c.status === 'scheduled' ? `<small class="muted">✅ ${+c.confirmed || 0} confirmado(s)${c.flags === 'cutoff' ? '' : ' · se cierra 3 h antes'}</small>` : ''}${c.status === 'sin-asistentes' ? '<small class="tp-note">🙌 Nadie confirmó: no necesitas conectarte.</small>' : ''}
        ${c.notes && opt && opt.notes ? `<small class="tp-note">📝 ${esc(c.notes)}</small>` : ''}</div>
      <div class="tp-cls-act">
        ${c.status === 'scheduled' && c.date >= today() ? (c.type === 'vip' ? (c.date === today() ? `<a class="btn k sm" href="clase-en-vivo.html?c=${encodeURIComponent(c.id)}&rol=profe"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6h11a2 2 0 0 1 2 2v1.6l3.4-2.3A1 1 0 0 1 22 8.1v7.8a1 1 0 0 1-1.6.8L17 14.4V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg> Entrar a la clase</a><small class="muted tp-live-n">Se activa 5 min antes</small>` : '<small class="muted">El botón para entrar aparece el día de la clase</small>') : '') : ''}
        ${c.type === 'vip' && c.students.length && ['cancelled', 'latecancel', 'tlate'].indexOf(c.status) < 0 ? `<button class="btn w sm" data-board="${esc(c.id)}">👤 Ficha</button>` : ''}
        ${c.type === 'vip' && c.status === 'scheduled' && (c.date > today() || (c.date === today() && c.time > nowHM())) ? `<button class="btn w sm tp-cbtn" data-tcancel="${esc(c.id)}">Cancelar clase</button>` : ''}
        ${canMark ? `<button class="btn ok sm" data-mark="${esc(c.id)}">✓ Marcar como dictada</button><button class="btn w sm" data-noshow="${esc(c.id)}">No asistió</button>` : ''}
      </div></li>`;
  }
  function bindMarks(root) {
    $$('[data-mark]', root).forEach((b) => b.onclick = () => markDialog(b.dataset.mark, 'done'));
    $$('[data-noshow]', root).forEach((b) => b.onclick = () => markDialog(b.dataset.noshow, 'noshow'));
    $$('[data-board]', root).forEach((b) => b.onclick = () => boardDialog(b.dataset.board));
    $$('[data-tcancel]', root).forEach((b) => b.onclick = () => cancelDialog(b.dataset.tcancel));
    // 📱 celular: «Entrar a la clase» visible; Tablero y Cancelar se despliegan con «Más opciones»
    $$('.tp-cls-act', root).forEach((a) => { if (a.querySelector('.tp-more')) return; const xs = [...a.querySelectorAll('[data-board],[data-tcancel]')]; if (!xs.length || !a.querySelector('a.btn.k')) return;
      const box = document.createElement('div'); box.className = 'tp-more'; xs.forEach((x) => box.appendChild(x));
      const t = document.createElement('button'); t.type = 'button'; t.className = 'btn w sm tp-moreb'; t.textContent = 'Más opciones ▾';
      t.onclick = () => { const on = a.classList.toggle('open'); t.textContent = on ? 'Menos opciones ▴' : 'Más opciones ▾'; };
      a.appendChild(t); a.appendChild(box); });
  }
  // 🧑‍🏫 pizarra digital: elegir la clase (para guardarla en su tablero) o usarla libre
  function pzPick() {
    const t0 = today(), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const L = D.classes.filter((c) => c.type === 'vip' && c.students.length && c.date >= y && c.date <= t0 && ['cancelled', 'latecancel'].indexOf(c.status) < 0).slice().reverse()
      .concat(D.classes.filter((c) => c.type === 'vip' && c.students.length && c.date > t0 && c.status === 'scheduled').slice(0, 3));
    const m = modal(`<button class="tp-x" data-x aria-label="Cerrar">✕</button><h3>🧑‍🏫 Pizarra de clase</h3><p class="muted">Elige la clase para guardar la pizarra en su tablero (el estudiante la verá en su historial).</p>
      <div class="pz-pick">${L.map((c) => `<button class="btn w block" data-pc="${esc(c.id)}"><b>${esc(studentName(c.students[0]))}</b> · ${rel(c.date) || dLabel(c.date)} · ${h12(c.time)}</button>`).join('') || '<p class="muted">No tienes clases de hoy o ayer.</p>'}</div>
      <button class="btn k block" id="pz-free" style="margin-top:10px">✏️ Abrir pizarra libre (sin guardar)</button>`);
    $$('[data-pc]', m).forEach((b) => b.onclick = () => { m.remove(); pzOpen(b.dataset.pc); });
    $('#pz-free', m).onclick = () => { m.remove(); window.MRPZ && MRPZ.open({ title: 'Pizarra', sub: 'Pizarra libre · no se guarda' }); };
  }
  async function pzOpen(id) {
    const c = D.classes.find((x) => x.id === id); if (!c || !window.MRPZ) return; toast('⏳ Abriendo pizarra…');
    const r = await api('tPzGet', { classId: id }); let data = null; try { data = r && r.ok && r.json ? JSON.parse(r.json) : null; } catch (e) { }
    MRPZ.open({ title: 'Pizarra de clase', sub: studentName(c.students[0]) + ' · ' + dLabel(c.date) + ' · ' + h12(c.time), file: String(c.date), data,
      onSave: async (d, pngs) => { const x = await MR.call('tPzSave', { tcode: S.tcode, pin: S.pin, classId: id, json: JSON.stringify(d), pngs }, { timeout: 120000 }); return !!(x && x.ok); } });
  }
  // 🔁 el profe cancela una clase individual: aviso antes de confirmar (opinión del estudiante + multa si es con menos de 12 h)
  async function cancelDialog(id) {
    const c = D.classes.find((x) => x.id === id); if (!c) return;
    const hu = (new Date(c.date + 'T' + c.time + ':00-05:00').getTime() - Date.now()) / 36e5; const late = hu < 12;
    let pen = 10000; try { const r = await api('tPay'); if (r && r.penalty) pen = r.penalty; } catch (e) { }
    const m = modal(`<button class="tp-x" data-x aria-label="Cerrar">✕</button><h3>Cancelar clase</h3><p class="muted">${esc(studentName(c.students[0] || ''))} · ${dLabel(c.date, true)} · ${h12(c.time)}</p>
      <div class="tp-cwarn"><b>Antes de cancelar, ten en cuenta:</b><ul><li>Tu estudiante organizó su tiempo para esta clase. Al cancelar, <b>puede dejarte una calificación u opinión negativa</b>, y eso se ve en tu perfil.</li>
      <li>${late ? `Faltan <b>menos de 12 horas</b>: se descuentan <b>$${Number(pen).toLocaleString('es-CO')}</b> de tu pago del mes.` : 'Faltan más de 12 horas: no hay multa, pero esta clase no se paga.'}</li><li>La clase vuelve al saldo del estudiante y le enviamos horarios con otros profes. Administración recibe un aviso.</li></ul></div>
      <label class="tp-lbl">Motivo de la cancelación <span style="color:#b91c1c">*</span> <small class="muted" style="font-weight:600">(obligatorio · lo revisa administración)</small><textarea class="inp" id="tc-why" rows="2" maxlength="200" placeholder="Ej: calamidad familiar, cita médica…"></textarea></label><small id="tc-err" style="color:#b91c1c;font-weight:700;display:none">Escribe el motivo (mínimo 10 caracteres).</small>
      <div class="row" style="justify-content:flex-end;gap:8px;margin-top:10px"><button class="btn w" data-x>Mejor no cancelo</button><button class="btn r" id="tc-ok">Sí, cancelar clase</button></div>`);
    $('#tc-ok', m).onclick = async () => { const why = $('#tc-why', m).value.trim(); if (why.length < 10) { $('#tc-err', m).style.display = 'block'; $('#tc-why', m).classList.add('wrong'); $('#tc-why', m).focus(); return; } const b = $('#tc-ok', m); b.disabled = true; b.textContent = 'Cancelando…';
      const x = await api('tCancel', { classId: id, reason: why });
      if (x && x.ok) { m.remove(); toast(x.late ? '⚠️ Clase cancelada · con multa por ser tarde' : '✅ Clase cancelada · el estudiante ya fue avisado'); c.status = x.late ? 'tlate' : 'cancelled'; try { shell(); } catch (e) { } }
      else { b.disabled = false; b.textContent = 'Sí, cancelar clase'; toast(errText((x && x.err) || 'network'), true); } };
  }
  // 📝 tablero de clase: el profe escribe lo que hizo en la clase; ve también los tableros anteriores del estudiante (de cualquier profe)
  // 👤 Ficha del estudiante (solo lectura): nivel, tema a reforzar y sus clases anteriores con cualquier profe (resumen + pizarra de la clase en vivo)
  async function boardDialog(id) {
    const c = D.classes.find((x) => x.id === id); if (!c) return; const code = String(c.students[0] || '').toUpperCase();
    const live = c.type === 'vip' && c.status === 'scheduled' && c.date === today();
    const m = modal(`<button class="tp-x" data-x aria-label="Cerrar">✕</button><div class="fi2"><div class="fi2-ic">${NVI('user')}</div><h3>Ficha de ${esc(studentName(code))}</h3><p class="muted fi2-sub">Clase del ${dLabel(c.date, true)} · ${h12(c.time)}</p>${(() => { const st = D.students[code] || {}; const MID = { 1: 'A1', 2: 'A2', 3: 'B2', 4: 'B2+' }[st.module]; const pr = MID && (st.progress || {})[MID]; return `<div class="tb-info">🎓 <b>Nivel:</b> ${MID ? 'Módulo ' + st.module + ' · ' + (MID === 'B2' ? 'B1' : MID) + (pr ? ' · ' + pr.pct + '% (' + pr.done + '/' + pr.total + ' clases)' : '') : 'Sin prueba de clasificación'}${c.topic ? `<br>🎯 <b>Quiere reforzar:</b> ${esc(c.topic)}` : ''}${window.MRGOAL ? `<br>🧭 <b>Su objetivo:</b> ${MRGOAL.chip(st.goal)}` : ''}</div>${window.MRGOAL && st.goal ? `<h4 class="fi-h">💬 Preguntas sugeridas para su objetivo</h4><div class="gl-qs">${MRGOAL.questions(st.goal, String(c.id).length + (+String(c.date).slice(-2) || 0)).map((q, i) => `<div>${i + 1}. ${esc(q)}</div>`).join('')}</div>` : ''}`; })()}
      <div id="fi-l"><p class="muted">Cargando…</p></div>
      ${live ? `<a class="btn k block fi-go" href="clase-en-vivo.html?c=${encodeURIComponent(c.id)}&rol=profe">🎥 Entrar a la clase</a>` : c.status === 'scheduled' ? `<div class="fi2-day">${NVI('calcheck')}Podrás entrar el día de la clase</div>` : ''}</div>`);
    const r = await api('tBoards', { code }); const L = ((r && r.ok && r.boards) || []).filter((b) => (b.text || (b.imgs || []).length) && b.classId !== id).reverse();
    const SKC = { Speaking: 's', Listening: 'l', Reading: 'r', Writing: 'w' };
    const body = (t) => String(t || '').split(/\n+/).map((ln) => { ln = ln.trim(); if (!ln) return '';
      if (/^🎥/.test(ln)) return `<div class="fi-t">${esc(ln.replace(/^🎥\s*Clase en vivo\s*·\s*/, ''))}</div>`;
      if (/^Resultado:/.test(ln)) { const [a, ...sk] = ln.split(' · '); return `<small class="muted">${esc(a)}</small><div>${sk.map((x) => { const k = x.split(' ')[0]; return `<span class="fi-sk ${SKC[k] || ''}">${esc(x)}</span>`; }).join('')}</div>`; }
      if (/^Para reforzar:/.test(ln)) return `<div class="fi-rf">⚠️ ${esc(ln)}</div>`;
      return `<div>${esc(ln)}</div>`; }).join('');
    // v673: solo su última clase completa + enlace a sus clases anteriores (máximo 4 más)
    const pz = (b) => (b.imgs || []).length ? `<div class="fi-pz">${b.imgs.map((u, k) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Pizarra ${k + 1}" loading="lazy"></a>`).join('')}<small>Pizarra de esa clase</small></div>` : '';
    const first = (t) => { const ln = String(t || '').split(/\n+/).map((x) => x.trim()).filter(Boolean); const a = ln.find((x) => /^🎥/.test(x)) || ln[0] || ''; return a.replace(/^🎥\s*Clase en vivo\s*·\s*/, ''); };
    const last = L[0], old = L.slice(1, 5);
    $('#fi-l', m).innerHTML = last ? `<h4 class="fi2-h">${NVI('layers')}Su última clase</h4><p class="muted fi2-hs">${dLabel(last.date)} · con ${esc(last.teacher || 'su profe')}</p><div class="fi-c fi2-last">${body(last.text)}${pz(last)}</div>${old.length ? `<button type="button" class="fi2-more" id="fi-more">Ver ${old.length === 1 ? 'su clase anterior' : 'sus ' + old.length + ' clases anteriores'} ▾</button><div class="fi2-old hidden" id="fi-old">${old.map((b) => `<div class="fi-c"><b>${dLabel(b.date)} · ${esc(b.teacher || '')}</b><span>${esc(first(b.text))}</span>${pz(b)}</div>`).join('')}</div>` : ''}`
      : `<h4 class="fi2-h">${NVI('layers')}Sus clases anteriores</h4><div class="fi2-emp"><span class="fi2-ck">${NVI('check')}</span><b>Es su primera clase individual</b><span>Aún no hay clases anteriores.</span></div>`;
    const mo = $('#fi-more', m); if (mo) mo.onclick = () => { const o = $('#fi-old', m), open = o.classList.toggle('hidden') === false; mo.textContent = open ? 'Ocultar clases anteriores ▴' : `Ver ${old.length === 1 ? 'su clase anterior' : 'sus ' + old.length + ' clases anteriores'} ▾`; };
  }
  function home(el) {
    const t0 = today();
    const up = D.classes.filter((c) => c.status === 'scheduled' && c.date >= t0);
    const pend = D.classes.filter((c) => c.status === 'scheduled' && c.date <= t0 && !(c.date === t0 && endHM(c.time, c.duration) > nowHM()));
    const free = D.slots.filter((s) => s.status === 'free' && s.date >= t0).length;
    { const hd = $('.tp-head'), dd = hd && hd.querySelector('.tp-dds'); if (dd && !hd.querySelector('.tp-hs')) dd.insertAdjacentHTML('beforebegin', `<div class="tp-hs"><div><b>${+D.stats.taughtMonth || 0}</b><span>clases dictadas este mes</span></div><div><b>${up.length}</b><span>${up.length === 1 ? 'próxima clase' : 'próximas clases'}</span></div></div>`); } // v672: las cifras van en el saludo
    el.innerHTML = `
      ${D.rank ? `<div class="tp-rank tp-rank2">${D.rank.stars ? `<span class="tp-rk-st">${(() => { const v = +D.rank.stars || 0, f = Math.round(v); return '★'.repeat(f) + '☆'.repeat(Math.max(0, 5 - f)); })()}</span>` : ''}<b>${D.rank.stars ? 'Tu calificación: <em>' + String(D.rank.stars).replace('.', ',') + ' estrella' + (+D.rank.stars === 1 ? '' : 's') + '</em> · apareces ' + D.rank.pos + '.º al reservar' : 'Aún no tienes calificaciones'}</b><small>${D.rank.stars ? D.rank.n + (D.rank.n === 1 ? ' calificación' : ' calificaciones') + ' de tus estudiantes. ' : ''}Los profes mejor calificados aparecen primero cuando el estudiante reserva.</small></div>` : ''}
      ${pend.length ? `<div class="tp-alert warn tp-pend"><b>Tienes ${pend.length} clase${pend.length > 1 ? 's' : ''} por marcar.</b><span>Registra la asistencia para que el estudiante vea su progreso.</span><button class="btn k sm" data-go="classes">Ir a Mis clases</button></div>` : ''}
      <div class="card tp-card"><div class="tp-card-h"><h2>Próximas clases</h2><small class="muted">hora Colombia</small></div>
        ${up.length ? `<ul class="tp-acc-l">${up.slice(0, 40).map((c) => accRow(c)).join('')}</ul>` : `<div class="tp-empty"><img src="mra-think.webp" alt="" width="110" height="110"><p>No tienes clases programadas.${free ? '' : ' Agrega espacios en <b>Mi disponibilidad</b> para que tus estudiantes Premium reserven clases individuales.'}</p></div>`}
      </div>
      ${!free ? `<div class="tp-alert"><b>🗓️ No tienes espacios disponibles.</b> Los estudiantes Premium solo pueden reservar en los horarios que publiques. <button class="btn w sm" data-go="avail">Agregar disponibilidad</button></div>` : ''}`;
    $$('[data-go]', el).forEach((b) => b.onclick = () => { tab = b.dataset.go; ss.set(TABKEY, tab); shell(); });
    $$('.tp-acc-h', el).forEach((h) => h.onclick = () => { const li = h.closest('.tp-acc'), op = !li.classList.contains('open'); li.classList.toggle('open', op); h.setAttribute('aria-expanded', op ? 'true' : 'false'); li.querySelector('.tp-acc-b').hidden = !op; });
    bindMarks(el);
  }
  /* v600: próximas clases plegables: una línea por clase; al tocarla se ve toda su información (las de hoy salen abiertas) */
  function accRow(c) {
    const r = rel(c.date), on = r === 'Hoy', tp = /^El profe elige el tema/.test(String(c.topic || '')) ? 'Tú eliges el tema' : String(c.topic || '').replace(/\s*\([^)]*\)\s*$/, '').replace(/^Módulo (\d+) · /, 'M$1 · ');
    const chev = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    return `<li class="tp-acc${on ? ' open today' : ''}"><button type="button" class="tp-acc-h" aria-expanded="${on ? 'true' : 'false'}"><span class="tp-acc-d"><b>${r || dLabel(c.date)}</b><small>${h12(c.time)}</small></span><span class="tp-acc-w"><b>${whoOf(c)}</b>${fcIs(c) ? '<span class="tp-fc">CLASE GRATIS</span>' : ''}<small>${esc(tp || 'Tema por definir')}</small></span><span class="tp-acc-ch">${chev}</span></button><div class="tp-acc-b"${on ? '' : ' hidden'}><ul class="tp-list">${classRow(c)}</ul></div></li>`;
  }

  /* ---------- 2. Mi disponibilidad ---------- */
  // 🕒 horario laboral: L–V 7:00 a. m.–9:00 p. m. · sábado 7:00 a. m.–5:00 p. m. · domingos y festivos de Colombia NO (clases de 50 min)
  const HOURS = Array.from({ length: 14 }, (_, i) => String(7 + i).padStart(2, '0') + ':00');
  const workOK = (d, h) => { if (window.MRFEST && MRFEST.isOff(d)) return false; const dow = new Date(d + 'T12:00:00').getDay(); if (dow === 0) return false; const [a, b] = String(h).split(':').map(Number); const st = a * 60 + (b || 0); return st >= 420 && st + 50 <= (dow === 6 ? 1020 : 1260); };
  function planned() {
    if (!form.date || !form.hours.length) return [];
    const n = form.repeat ? Math.min(8, Math.max(1, +form.weeks || 1)) : 1, out = [], t0 = today(), hm = nowHM();
    for (let w = 0; w < n; w++) { const d = addDays(form.date, 7 * w); form.hours.slice().sort().forEach((h) => { if ((d > t0 || (d === t0 && h > hm)) && workOK(d, h)) out.push({ date: d, time: h, duration: form.dur }); }); }
    return out;
  }
  function avail(el) {
    const t0 = today(); if (!form.date || form.date < t0) form.date = t0;
    const extra = form.hours.filter((h) => HOURS.indexOf(h) < 0);
    const slots = D.slots.filter((s) => s.status !== 'deleted' && s.date >= t0 && !(s.date === t0 && s.status === 'free' && s.time <= nowHM()));
    const byDate = {}; slots.forEach((s) => (byDate[s.date] = byDate[s.date] || []).push(s));
    el.innerHTML = `<div class="card tp-card tp-week"><div class="tp-card-h"><h2>📅 Mi disponibilidad</h2></div>
        <div id="tp-wg"></div><div style="text-align:center"><button class="tp-wsave2" id="tp-wsave">Guardar mi disponibilidad</button><p class="muted tp-small" style="margin:8px 0 0">La plataforma publica tus espacios de las próximas 4 semanas. Cada viernes te pediremos confirmarla.</p></div></div>
      `; // v587: «Mis espacios» quitado (estaba de más)
    const WG = window.MRWG ? MRWG.render($('#tp-wg', el), (D.teacher && D.teacher.weekly) || {}) : null;
    $('#tp-wsave', el).onclick = async () => { const b = $('#tp-wsave', el); b.disabled = true; b.textContent = 'Guardando…';
      const r = await api('tWeekly', { weekly: WG ? WG.get() : {} }); b.disabled = false; b.textContent = 'Guardar mi disponibilidad';
      if (!r.ok) { if (r.err !== 'auth') toast(errText(r.err), true); return; } D = r; toast('✅ Disponibilidad semanal guardada. Tus espacios de las próximas 4 semanas ya están publicados.'); avail(el); };
    $$('[data-del]', el).forEach((b) => b.onclick = async () => {
      const s = D.slots.find((x) => x.id === b.dataset.del); if (!s || !confirm(`¿Borrar el espacio del ${dLabel(s.date)} a las ${h12(s.time)}?`)) return;
      b.disabled = true; const r = await api('tSlotDel', { slotId: s.id });
      if (!r.ok) { b.disabled = false; if (r.err !== 'auth') toast(errText(r.err), true); if (r.err === 'booked') reload(); return; }
      toast('🗑 Espacio borrado'); await reload();
    });
  }

  /* ---------- 3. Mis clases ---------- */
  function classes(el) {
    const t0 = today();
    const up = D.classes.filter((c) => c.status === 'scheduled' && c.date >= t0);
    const past = D.classes.filter((c) => !(c.status === 'scheduled' && c.date >= t0)).slice().reverse();
    const pend = D.classes.filter((c) => c.status === 'scheduled' && c.date <= t0).length;
    const list = clsView === 'up' ? up : past;
    el.innerHTML = `<div class="tp-seg tp-subtabs" role="tablist">
        <button class="tp-segb${clsView === 'up' ? ' on' : ''}" data-v="up" role="tab" aria-selected="${clsView === 'up'}">Próximas (${up.length})</button>
        <button class="tp-segb${clsView === 'past' ? ' on' : ''}" data-v="past" role="tab" aria-selected="${clsView === 'past'}">Pasadas · 60 días (${past.length})</button>
      </div>
      ${pend ? `<div class="tp-alert warn">📌 <b>${pend}</b> clase${pend > 1 ? 's' : ''} de hoy o anteriores sin marcar. Usa <b>“Marcar como dictada”</b> o <b>“No asistió”</b>.</div>` : ''}
      <div class="card tp-card">${list.length ? `<ul class="tp-list">${list.map((c) => classRow(c, { notes: true })).join('')}</ul>` : `<div class="tp-empty"><img src="mra-shrug.webp" alt="" width="110" height="110"><p>${clsView === 'up' ? 'No tienes clases próximas.' : 'No hay clases en los últimos 60 días.'}</p></div>`}</div>`;
    $$('.tp-subtabs .tp-segb', el).forEach((b) => b.onclick = () => { clsView = b.dataset.v; classes(el); });
    bindMarks(el);
  }
  function markDialog(id, status) {
    const c = D.classes.find((x) => x.id === id); if (!c) return;
    const done = status === 'done';
    const m = modal(`<button class="tp-x" data-x aria-label="Cerrar">✕</button>
      <h3>${done ? '✓ Marcar como dictada' : 'Registrar inasistencia'}</h3>
      <p class="muted">${typeBadge(c)} ${dLabel(c.date, true)} · ${h12(c.time)} (hora Colombia)</p>
      ${done ? `<div class="tp-l">Asistencia</div><div class="tp-att">${c.students.length ? c.students.map((code) => `<label class="tp-attrow"><input type="checkbox" data-code="${esc(String(code).toUpperCase())}" checked><span>${esc(studentName(code))}</span><small>${esc(code)}</small></label>`).join('') : '<p class="muted">Esta clase no tiene estudiantes asignados.</p>'}</div>`
        : `<p>${c.type === 'vip' ? `Se registrará que <b>${esc(studentName(c.students[0] || ''))}</b> no se presentó a la clase.` : 'Se registrará que <b>ningún estudiante</b> se presentó a la clase.'}</p>`}
      <label class="tp-l" for="tp-notes">Notas de la clase <small class="muted">(opcional)</small></label>
      <textarea class="inp tp-inp" id="tp-notes" rows="3" maxlength="800" placeholder="${done ? 'Tema visto, avances, tareas…' : 'Ej: esperé 15 minutos, le escribí por WhatsApp…'}">${esc(c.notes || '')}</textarea>
      <p class="tp-payinfo">💰 ${done ? 'Clase dictada: se paga ' + COP((D.pay && D.pay.cur && D.pay.cur.rate) || 21800) : 'Si te conectaste y el estudiante no llegó, se pagan ' + COP((D.pay && D.pay.cur && D.pay.cur.noshowRate) || 10000)}. Al guardar, les llega un aviso al estudiante, a ti y a administración.</p>
      <div class="row tp-mbtns"><button class="btn w" data-x>Cancelar</button><button class="btn ${done ? 'ok' : 'k'}" id="tp-msave">${done ? 'Guardar clase dictada ✓' : 'Guardar: no asistió'}</button></div>`);
    $('#tp-msave', m).onclick = async () => {
      const attendance = {}; c.students.forEach((code) => { attendance[String(code).toUpperCase()] = false; });
      if (done) $$('[data-code]', m).forEach((x) => { attendance[x.dataset.code] = x.checked; });
      const b = $('#tp-msave', m); b.disabled = true; b.textContent = 'Guardando…';
      const r = await api('tMark', { classId: c.id, status, attendance, notes: $('#tp-notes', m).value.trim() });
      if (!r.ok) { b.disabled = false; b.textContent = 'Reintentar'; if (r.err !== 'auth') toast(errText(r.err), true); else m.remove(); return; }
      m.remove(); toast(done ? '✅ Clase marcada como dictada' : 'Inasistencia registrada'); await reload();
    };
  }


  // 📚 acceso de profe a TODO el material de los módulos (modo profe en la plataforma de estudiantes)
  window.MRCHATOPEN = (room) => openChat(room);
  function openChat(room) { if (!window.MRLIVE) return; MRLIVE.open({ room, title: 'Chat con estudiantes', roomsAction: 'tChats', empty: 'Aquí aparecerán tus estudiantes cuando tengan clases contigo.', call: (a, d) => api(a, d) }); }
  function material() {
    const t = D.teacher || {}; const info = { id: t.id || '', name: t.name || 'Profe', first: t.hello || String(t.name || 'Profe').split(' ')[0], at: Date.now() };
    try { sessionStorage.setItem('mra_teacher', JSON.stringify(info)); localStorage.setItem('mra_teacher_tmp', JSON.stringify(info)); } catch (e) { }
    window.open('index.html?profe=1', '_blank');
  }
  /* ---------- 💰 Mis pagos ---------- */
  const COP = (n) => (+n < 0 ? '−' : '') + '$' + Math.abs(Math.round(+n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const MES = (ym) => { const [y, m] = String(ym).split('-').map(Number); return new Date(y, m - 1, 15).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }); };
  const PST = { done: ['ok', 'Dictada'], noshow: ['warn', 'Te conectaste · el estudiante no asistió'], cancelled: ['off', 'Cancelada a tiempo'], latecancel: ['off', 'Cancelada fuera de tiempo'], 'sin-asistentes': ['off', 'Sin reservas'], tnoshow: ['bad', '⚠️ No te conectaste · penalización (el estudiante lo reportó)'], tlate: ['bad', '⚠️ Cancelaste con menos de 12 horas · penalización'] };
  let payMonth = '', payCache = {};
  async function pay(el) {
    const months = (D.pay && D.pay.months) || []; if (!payMonth) payMonth = (D.pay && D.pay.cur && D.pay.cur.month) || (months[0] && months[0].month) || '';
    if (D.pay && D.pay.cur) payCache[D.pay.cur.month] = D.pay.cur;
    let P = payCache[payMonth];
    if (!P) { el.innerHTML = '<div class="card tp-card"><p class="muted">⏳ Cargando…</p></div>'; const r = await api('tPay', { month: payMonth }); if (!r.ok) { el.innerHTML = '<div class="card tp-card"><p class="muted">No se pudo cargar. Intenta de nuevo.</p></div>'; return; } P = payCache[payMonth] = r; }
    const mm = months.find((x) => x.month === payMonth) || {}; const paid = P.paid || mm.paid; const paidAt = P.paidAt || mm.paidAt;
    el.innerHTML = `<div class="tp-pay-top"><label class="tp-l" for="tp-pm">Mes</label><select class="inp tp-inp" id="tp-pm">${months.map((x) => `<option value="${x.month}"${x.month === payMonth ? ' selected' : ''}>${esc(MES(x.month))} · ${COP(x.total)} · ${x.paid ? '✅ Pagado' : '⏳ Pendiente'}</option>`).join('')}</select>
        <button class="btn w sm" id="tp-pdf">⬇️ Descargar volante (PDF)</button></div>
      <div class="tp-pay-hero card"><span class="lbl">Total · ${esc(MES(P.month))}</span><b>${COP(P.total)}</b>
        <div class="tp-pay-k"><span><b>${P.done}</b> clase${P.done === 1 ? '' : 's'} dictada${P.done === 1 ? '' : 's'} × ${COP(P.rate)}</span><span><b>${P.noshow}</b> inasistencia${P.noshow === 1 ? '' : 's'} del estudiante × ${COP(P.noshowRate)}</span>${P.tnoshow ? `<span class="tp-pen"><b>${P.tnoshow}</b> penalización${P.tnoshow === 1 ? '' : 'es'} × −${COP(P.penalty)}</span>` : ''}${(P.content || []).length ? `<span><b>${P.content.length}</b> video${P.content.length === 1 ? '' : 's'} aprobado${P.content.length === 1 ? '' : 's'} · ${COP(P.contentTotal)}</span>` : ''}${(P.bonus || []).length ? `<span class="tp-bon"><b>${P.bonus.length}</b> bono${P.bonus.length === 1 ? '' : 's'} por inscripción · ${COP(P.bonusTotal)}</span>` : ''}</div>
        <span class="tp-paid ${paid ? 'ok' : 'pend'}">${paid ? '✅ Pagado' + (paidAt ? ' el ' + esc(dLabel(String(paidAt).slice(0, 10))) : '') : '⏳ Pendiente por pagar'}</span></div>
      <div class="tp-alert"><b>¿Cómo se calcula?</b> Se paga cada clase <b>dictada</b> (${COP(P.rate)} por clase de 50 min). <b>Bono por inscripción:</b> ${COP(P.convAmt || 10000)} por cada estudiante de tu clase de prueba gratis que se inscriba en Premium en los 30 días siguientes. Si <b>te conectas y el estudiante no asiste</b>, se pagan ${COP(P.noshowRate)}. Las clases canceladas (a tiempo o fuera de tiempo) y las no dictadas no se pagan. <b>Si no te conectas</b> y el estudiante lo reporta, se descuentan ${COP(P.penalty || 10000)} de penalización (administración puede revisarlo en casos de fuerza mayor). El pago es mensual. Recuerda <b>marcar cada clase</b> en Mis clases.</div>
      <div class="card tp-card"><div class="tp-card-h"><h2>Detalle</h2><small class="muted">hora Colombia</small></div>
      ${P.items.length || (P.content || []).length || (P.bonus || []).length ? payGroups(P).map((g, gi) => `<details class="tp-wk${g.zero ? ' zero' : ''}"${gi === 0 && !g.zero ? ' open' : ''}><summary><b>${esc(g.t)}</b><span>${esc(g.n)}<em>${COP(g.sum)}</em></span></summary><ul class="tp-list tp-pay-list">${g.rows.map((x) => `<li class="tp-pay-row"><div><b>${esc(x.a)}</b><small>${esc(x.b)}</small></div><span class="tp-pst ${x.k}">${esc(x.st)}</span><b class="tp-amt">${x.neg ? '−' : ''}${COP(x.amount)}</b></li>`).join('')}</ul></details>`).join('') : '<p class="muted">No hay clases registradas en este mes.</p>'}</div>`;
    $('#tp-pm', el).onchange = (e) => { payMonth = e.target.value; pay(el); };
    $('#tp-pdf', el).onclick = () => payPdf(P, paid, paidAt);
  }
  /* v693 · volante: el detalle se agrupa por semana (lunes a sábado) + videos + bonos + «Clases sin pago» al final */
  function payGroups(P) {
    const MONs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const wkOf = (iso) => { const d = new Date(iso + 'T12:00:00Z'); const dw = (d.getUTCDay() + 6) % 7; const m = new Date(d); m.setUTCDate(d.getUTCDate() - dw); return m.toISOString().slice(0, 10); };
    const wkName = (mon) => { const a = new Date(mon + 'T12:00:00Z'), b = new Date(a); b.setUTCDate(a.getUTCDate() + 5); return a.getUTCMonth() === b.getUTCMonth() ? `Semana del ${a.getUTCDate()} al ${b.getUTCDate()} de ${MONs[b.getUTCMonth()]}` : `Semana del ${a.getUTCDate()} de ${MONs[a.getUTCMonth()]} al ${b.getUTCDate()} de ${MONs[b.getUTCMonth()]}`; };
    const W = {}, zero = [];
    [...P.items].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)).forEach((x) => { const st = PST[x.status] || ['off', x.status]; const r = { date: x.date, a: `${dLabel(x.date)} · ${h12(x.time)}`, b: (x.type === 'vip' ? 'Individual' : (x.club || 'Clase grupal')) + (x.who ? ' · ' + x.who : ''), st: st[1], k: st[0], amount: Math.abs(+x.amount || 0), neg: (+x.amount || 0) < 0 || x.status === 'tnoshow' };
      if (!(+x.amount) && x.status !== 'tnoshow') { zero.push(r); return; } const k = wkOf(x.date); (W[k] = W[k] || []).push(r); });
    const G = Object.keys(W).sort().map((k) => { const rows = W[k]; const cnt = rows.filter((r) => !r.neg).length; return { t: wkName(k), n: `${cnt} clase${cnt === 1 ? '' : 's'}`, sum: rows.reduce((a, r) => a + (r.neg ? -r.amount : r.amount), 0), rows }; });
    if ((P.content || []).length) G.push({ t: 'Videos para redes', n: `${P.content.length} video${P.content.length === 1 ? '' : 's'}`, sum: P.contentTotal || 0, rows: P.content.map((x) => ({ a: dLabel(x.date), b: 'Video aprobado · ' + (x.topic || ''), st: 'Grabado y aprobado', k: 'ok', amount: +x.amount || 0 })) });
    if ((P.bonus || []).length) G.push({ t: 'Bonos por inscripción', n: `${P.bonus.length} bono${P.bonus.length === 1 ? '' : 's'}`, sum: P.bonusTotal || 0, rows: P.bonus.map((x) => ({ a: dLabel(x.date), b: String(x.who || '') + ' · ' + (x.plan || 'Premium'), st: 'Bono', k: 'ok', amount: +x.amount || 0 })) });
    if (zero.length) G.push({ t: 'Clases sin pago', n: `${zero.length} clase${zero.length === 1 ? '' : 's'}`, sum: 0, zero: true, rows: zero });
    return G;
  }
  // volante de pago imprimible → "Guardar como PDF"
  function payPdf(P, paid, paidAt) {
    const t = D.teacher || {}; const w = window.open('', '_blank'); if (!w) { toast('Permite las ventanas emergentes para descargar el PDF', true); return; }
    const G = payGroups(P), cv = P.done * P.rate, nv = P.noshow * P.noshowRate;
    const det = G.map((g) => `<div class="wk${g.zero ? ' z' : ''}"><div class="wh"><b>${esc(g.t)}</b><span>${esc(g.n)} <em>${COP(g.sum)}</em></span></div><table>${g.rows.map((x) => `<tr><td>${esc(x.a)}</td><td>${esc(x.b)}</td><td class="s ${x.k}">${esc(x.st)}</td><td class="r">${x.neg ? '−' : ''}${COP(x.amount)}</td></tr>`).join('')}</table></div>`).join('');
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Volante de pago ${esc(t.name)} ${esc(P.month)}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#1d2b45;margin:28px}.bar{height:4px;background:#E3242B;margin-bottom:16px}
      .top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}.top img{height:52px}h1{color:#0B2A5B;font-size:22px;margin:0 0 4px}.meta{font-size:13px;line-height:1.55;color:#475569}
      .st{display:inline-block;margin-top:8px;padding:5px 12px;border-radius:999px;font-weight:700;font-size:12px;background:${paid ? '#dcfce7;color:#166534' : '#fff3cd;color:#8a5a00'}}
      .sum{margin-top:14px;border:1px solid #e3e8f0;border-radius:12px;overflow:hidden}.sum .r2{display:flex;justify-content:space-between;padding:7px 14px;border-bottom:1px solid #eef2f7;font-size:13px}.sum .r2 b{font-weight:700}
      .sum .t{background:#0B2A5B;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:10px 14px;font-weight:800;font-size:18px;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sum .t small{display:block;font-weight:600;font-size:11px;opacity:.85}
      h2{color:#0B2A5B;font-size:15px;margin:16px 0 6px}.wk{border:1px solid #e3e8f0;border-radius:10px;margin-bottom:8px;overflow:hidden}.wh{display:flex;justify-content:space-between;background:#F3F6FB;padding:7px 12px;font-size:13px;color:#0B2A5B;-webkit-print-color-adjust:exact;print-color-adjust:exact}.wh span{color:#475569}.wh em{font-style:normal;font-weight:800;color:#0B2A5B;margin-left:8px}
      table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px}td{padding:4px 12px;border-top:1px solid #eef2f7}td:nth-child(1){width:22%}td:nth-child(2){width:38%}td:nth-child(3){width:26%}td:nth-child(4){width:14%}tr{break-inside:avoid}
      .r{text-align:right;font-weight:700}.s{color:#475569}.s.warn{color:#9a6700}.s.bad{color:#b91c1c}.wk.z td{color:#94a3b8}.foot{margin-top:18px;font-size:11px;color:#64748b;text-align:center}@media print{body{margin:12mm}}</style></head><body>
      <div class="bar"></div><div class="top"><div><h1>${esc(t.name || '')}</h1><div class="meta">Código: ${esc(t.code || '')}${t.email ? ' · ' + esc(t.email) : ''} · Periodo: ${esc(MES(P.month))}<br>Valor por clase dictada: ${COP(P.rate)} · Inasistencia del estudiante: ${COP(P.noshowRate)}</div>
      <span class="st">${paid ? 'PAGADO' + (paidAt ? ' · ' + esc(dLabel(String(paidAt).slice(0, 10))) : '') : 'PENDIENTE POR PAGAR'}</span></div><img src="${location.href.replace(/[^/]*$/, '')}mra-brand.png" alt="mrarrieta.com"></div>
      <div class="sum"><div class="r2"><span>Clases dictadas (${P.done} × ${COP(P.rate)})</span><b>${COP(cv)}</b></div><div class="r2"><span>Inasistencias del estudiante (${P.noshow} × ${COP(P.noshowRate)})</span><b>${COP(nv)}</b></div>${(P.content || []).length ? `<div class="r2"><span>Videos aprobados (${P.content.length})</span><b>${COP(P.contentTotal || 0)}</b></div>` : ''}${(P.bonus || []).length ? `<div class="r2"><span>Bonos por inscripción (${P.bonus.length})</span><b>${COP(P.bonusTotal || 0)}</b></div>` : ''}<div class="r2"><span>Penalizaciones${P.tnoshow ? ` (${P.tnoshow} × ${COP(P.penalty)})` : ''}</span><b>${P.tnoshow ? '−' + COP(P.tnoshow * P.penalty) : '$0'}</b></div>
      <div class="t"><div>TOTAL<small>${P.done + P.noshow} clase${P.done + P.noshow === 1 ? '' : 's'}${(P.content || []).length ? ' · ' + P.content.length + ' video' + (P.content.length === 1 ? '' : 's') : ''}</small></div>${COP(P.total)}</div></div>
      <h2>Detalle por semana</h2>${det || '<p class="meta">Sin movimientos registrados</p>'}
      <p class="foot">mrarrieta.com · ¡Aprende inglés HABLANDO! · Generado el ${esc(dLabel(today(), true))}. Las clases canceladas y las no dictadas no generan pago.</p>
      <script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>`);
    w.document.close();
  }
  /* ---------- 4. Mis grupos ---------- */
  function groups(el) {
    const gs = D.groups || [];
    const studs = Object.values(D.students || {});
    el.innerHTML = gs.length ? `<div class="tp-groups">${gs.map((g) => { const list = studs.filter((s) => s.groupId === g.id);
      const next = D.classes.find((c) => c.groupId === g.id && c.status === 'scheduled' && c.date >= today());
      return `<article class="card tp-group"><div class="tp-group-h"><h2>${esc(g.name || 'Grupo')}</h2>${g.level ? `<span class="tp-badge grp">${esc(g.level)}</span>` : ''}</div>
        <p class="tp-group-when">🗓️ ${esc(g.days || 'Días por definir')} · ⏰ ${h12(g.time) || '—'} <small class="muted">hora Colombia</small></p>
        ${next ? `<p class="tp-small">Próxima sesión: <b>${rel(next.date) || dLabel(next.date)}</b> · ${h12(next.time)}</p>` : ''}
        <div class="tp-l">Estudiantes (${list.length})</div>
        ${list.length ? `<ul class="tp-studs">${list.map((s) => `<li><span class="tp-av">${esc((s.name || '?')[0].toUpperCase())}</span><span>${esc(s.name || s.code)}<small>${esc(s.code)}${s.module ? ' · Módulo ' + esc(s.module) : ''}</small></span></li>`).join('')}</ul>` : '<p class="muted tp-small">Aún no hay estudiantes en este grupo.</p>'}
</article>`; }).join('')}</div>`
      : `<div class="card tp-card"><div class="tp-empty"><img src="mra-wink.webp" alt="" width="110" height="110"><p>Aún no tienes grupos asignados. La administración te asignará grupos según los niveles que dictas.</p></div></div>`;
  }

  // v671: elegir / cambiar el tema que pidió el estudiante
  document.addEventListener('click', async (e) => {
    const rp = e.target.closest && e.target.closest('[data-repick]'); if (rp) { REPICK.add(rp.dataset.repick); shell(); return; }
    const b = e.target.closest && e.target.closest('[data-pick]'); if (!b || b.disabled) return;
    const c = D && D.classes.find(x => x.id === b.dataset.pick); if (!c) return;
    b.disabled = true; b.textContent = 'Guardando…';
    const r = await api('tPick', { classId: c.id, n: +b.dataset.n }).catch(() => null);
    if (!r || !r.ok) { b.disabled = false; b.textContent = 'Elegir este tema'; toast(r && r.err === 'closed' ? 'La clase ya empezó: no se puede cambiar el tema.' : 'No se pudo guardar. Inténtalo de nuevo.', true); return; }
    if (!c.topt) c.topt = c.topic; c.topic = r.topic; REPICK.delete(c.id); toast('Listo: el estudiante verá este tema en su clase.'); shell();
  });
  // 🔔 pop-up de novedades · v671: solo lo que sigue siendo cierto (clases que existen y aún no pasan) · los recordatorios viejos ya no aparecen
  const POPPED = new Set();
  const clsMs = (c) => new Date(c.date + 'T' + (c.time || '00:00') + ':00-05:00').getTime();
  const fmtCls = (c) => { const d = new Date(c.date + 'T12:00:00'); const ds = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] + ' ' + d.getDate() + ' ' + ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][d.getMonth()]; const [hh, mm] = String(c.time || '00:00').split(':').map(Number); return ds + ' · ' + ((hh % 12) || 12) + ':' + String(mm).padStart(2, '0') + ' ' + (hh < 12 ? 'a. m.' : 'p. m.'); };
  function popItem(n) {
    const c = n.data && n.data.classId ? D.classes.find(x => x.id === n.data.classId) : null; const t = String(n.title || '');
    if (!c) return null; // sin clase no hay novedad que mostrar (queda en la campanita)
    const live = c.status === 'scheduled' && clsMs(c) > Date.now(), who = (c.students || []).map(studentName).join(', ') || (c.type === 'club' ? 'Club' : 'Estudiante');
    const I = NVI;
    if (/Nueva clase/.test(t)) { if (!live) return null; const pk = /^El profe elige el tema/.test(String(c.topic || '')) ? 'Tú eliges el tema' + ((String(c.topic).match(/Módulo \d+/) || [''])[0] ? ' · ' + String(c.topic).match(/Módulo \d+/)[0] : '') : (c.topic ? String(c.topic).replace(/\s*\(.*$/, '') : '');
      return `<div class="tp-nv-i"><span class="ic">${I('calendar')}</span><b>Nueva clase individual</b><span>${esc(who)} · ${esc(fmtCls(c))}</span>${pk ? `<em>${esc(pk)}</em>` : ''}</div>`; }
    if (/empieza en|Mañana a las|Hoy a las/.test(t)) { if (!live) return null; const td = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }), tm = new Date(Date.now() + 864e5).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const when = c.date === td ? 'Tu clase es hoy' : c.date === tm ? 'Tu clase es mañana' : 'Próxima clase';
      return `<div class="tp-nv-i"><span class="ic">${I('clock')}</span><b>${when}</b><span>${esc(who)} · ${esc(fmtCls(c))}</span></div>`; }
    if (/cancel/i.test(t)) { if (clsMs(c) < Date.now() - 864e5) return null; return `<div class="tp-nv-i"><span class="ic">${I('alert')}</span><b>Clase cancelada</b><span>${esc(who)} · ${esc(fmtCls(c))}</span></div>`; }
    if (!live) return null;
    return `<div class="tp-nv-i"><span class="ic">${I('bell')}</span><b>${esc(t.replace(/^[^A-Za-zÁÉÍÓÚÑ¡¿]+/, ''))}</b><span>${esc(who)} · ${esc(fmtCls(c))}</span></div>`;
  }
  function popNew() {
    if (!D || document.querySelector('.tp-modal')) return;
    const nw = (D.notifications || []).filter(n => !n.read && (n.type === 'vip' || n.type === 'club') && !POPPED.has(n.id)); if (!nw.length) return;
    nw.forEach(n => POPPED.add(n.id));
    const rk = (n) => /Nueva clase/.test(n.title || '') ? 0 : /cancel/i.test(n.title || '') ? 1 : 2, seen = new Set(); // una sola novedad por clase: primero la reserva nueva
    const items = nw.slice().sort((a, b) => rk(a) - rk(b)).filter(n => { const k = n.data && n.data.classId; if (!k) return true; if (seen.has(k)) return false; seen.add(k); return true; }).map(n => { try { return popItem(n); } catch (e) { return null; } }).filter(Boolean); if (!items.length) return; // nada vigente: no se muestra la ventana (todo sigue en la campanita)
    const m = modal(`<div class="tp-nv"><div class="tp-nv-h">${NVI('bell')}</div><h3>${items.length === 1 ? 'Tienes una novedad' : 'Tienes ' + items.length + ' novedades'}</h3><div class="tp-nv-l">${items.join('')}</div><button class="btn k block" id="tp-pok">Entendido</button></div>`);
    $('#tp-pok', m).onclick = () => { m.remove(); api('notifRead', { ids: nw.map(n => n.id) }).catch(() => { }); nw.forEach(n => n.read = true); if (tab === 'home') shell(); };
  }
  // "Atrás": dentro del portal vuelve al Resumen; nunca saca al profe a otra página por error
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('.tb-back'); if (!b || !S || !D) return; e.preventDefault(); e.stopImmediatePropagation(); const wa = document.querySelector('.wa-wrap'); if (wa && window.MRLIVE) return MRLIVE.close(); if (tab !== 'home') { tab = 'home'; ss.set(TABKEY, tab); shell(); } window.scrollTo(0, 0); }, true);
  let bellOn = false;
  function bell() { if (bellOn || !window.MRBELL) { if (window.MRBELL && D) MRBELL.set(D.notifications || []); return; } bellOn = true;
    MRBELL.set(D.notifications || []);
    MRBELL.mount({ every: 15000, active: () => !!S, fetch: async () => { if (!S || !D) return null; const r = await api('notifs').catch(() => null); if (!r || !r.ok) return null; const had = new Set((D.notifications || []).map(n => n.id)); D.notifications = r.notifications; if ((r.notifications || []).some(n => !had.has(n.id))) popNew(); return r.notifications; },
      markRead: (ids, all) => api('notifRead', all ? { all: true } : { ids }).catch(() => { }), go: (x) => { // v580: a dónde lleva cada aviso del profe
        const t = x.type, ti = String(x.title || ''); const toTab = (k) => { tab = k; ss.set(TABKEY, tab); shell(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        if (t === 'contrato') { api('tContract').then((r) => { if (r && r.ok) { CT = r; contractModal(r); } }).catch(() => { }); return; }
        if (t === 'pago') return toTab('pay');
        if (t === 'oferta') { if (/Ganaste/i.test(ti)) return toTab('pay'); toTab('home'); setTimeout(() => window.MROFR && MROFR.show && MROFR.show(), 400); return; }
        if (t === 'week' || /buscando horario/i.test(ti)) return toTab('avail');
        if (t === 'vip' || t === 'club') return toTab('classes');
        if (t === 'msg') return openChat();
        toTab('home'); } }); }
  /* ---------- inicio ---------- */
  async function start() {
    S = ss.get(SKEY);
    if (!S || !S.tcode || !MR.on) { S = null; loginView(); return; }
    app.innerHTML = '<div class="tp-loading">Cargando tu portal…</div>';
    let r = await MR.call('tLogin', { tcode: S.tcode, pin: S.pin }, { timeout: 45000 });
    if (!r.ok && r.err === 'network') { app.innerHTML = '<div class="tp-loading">Conectando con la escuela…</div>'; r = await MR.call('tLogin', { tcode: S.tcode, pin: S.pin }, { timeout: 60000 }); } // v600: la nube a veces tarda: se reintenta solo
    if (r.ok) { D = r; shell(); contractCheck().then((blk) => { if (!blk) setTimeout(popNew, 600); }); return; }
    if (r.err === 'auth') { ss.del(SKEY); loginView(''); return; }
    retryView(errText(r.err)); // v600: nunca la pantalla vieja de código y PIN: un aviso con «Reintentar»
  }
  function retryView(msg) {
    app.innerHTML = `<section class="card tp-retry"><img src="mra-think.webp" alt="" width="120" height="120"><h2>No pudimos cargar tu portal</h2><p class="muted">${esc(msg || 'Revisa tu internet e inténtalo de nuevo.')}</p><button class="btn k lg" id="tp-rt">Reintentar</button></section>`;
    $('#tp-rt').onclick = () => start();
  }
  start();
})();
