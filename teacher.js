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
  const typeBadge = (c) => c.type === 'vip' ? '<span class="tp-badge vip">Individual</span>' : (c.type === 'club' ? '<span class="tp-badge grp">Club</span>' : '<span class="tp-badge grp">Grupal</span>');
  const statusBadge = (c) => ({ done: '<span class="tp-st done">Dictada ✓</span>', noshow: '<span class="tp-st noshow">No asistió</span>', cancelled: '<span class="tp-st canc">Cancelada</span>', latecancel: '<span class="tp-st canc">Cancelada tarde</span>', tnoshow: '<span class="tp-st noshow">⚠️ No te conectaste</span>', tlate: '<span class="tp-st noshow">⚠️ Cancelaste tarde</span>' }[c.status] || (c.date <= today() ? '<span class="tp-st pend">Por marcar</span>' : '<span class="tp-st sch">Programada</span>'));
  const whoOf = (c) => c.type === 'vip' ? esc(studentName(c.students[0] || '')) : esc(c.type === 'club' ? (c.topic || 'Club') : ((groupOf(c.groupId) || {}).name || 'Grupo')) + ` · ${c.students.length} estudiante${c.students.length === 1 ? '' : 's'}`;

  /* ---------- entrada ---------- */
  function loginView(msg) {
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
    const must = c.needs; const m = document.createElement('div'); m.className = 'tp-modal'; m.setAttribute('role', 'dialog');
    m.innerHTML = `<div class="tp-modal-card card tp-ct">${must ? '' : '<button class="tp-x" data-x aria-label="Cerrar">✕</button>'}<h3>📄 ${must ? 'Antes de empezar: tu contrato' : 'Mi contrato'}</h3>
      ${must ? '<p class="muted" style="margin:0 0 8px">Léelo con calma. Al aceptarlo se descarga una copia en PDF y te llega a tu correo.</p>' : `<p class="tp-ct-ok">✔ Leído y aceptado el ${fmtAcc(c.accepted.date)} · versión ${esc(c.version)}</p>`}
      <div class="tp-ct-doc">${mdHtml(c.text)}</div>
      ${must && c.missingDoc ? `<div class="tp-ct-id"><label>Cédula de ciudadanía<input class="inp" id="ct-doc" inputmode="numeric" placeholder="Ej: 1.127.573.975"></label><label>Lugar de expedición<input class="inp" id="ct-city" placeholder="Ej: Cartagena, Bolívar"></label></div>` : ''}
      <div class="row" style="justify-content:center;gap:8px;margin-top:12px">${must ? '<button class="btn k" id="ct-ok">✅ Leí y acepto</button>' : '<button class="btn w" id="ct-dl">⬇️ Descargar copia (PDF)</button>'}</div></div>`;
    document.body.appendChild(m);
    if (!must) { m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); }); $('#ct-dl', m).onclick = () => contractPdf(c); return; }
    $('#ct-ok', m).onclick = async () => { const doc = $('#ct-doc', m) ? $('#ct-doc', m).value.trim() : '', city = $('#ct-city', m) ? $('#ct-city', m).value.trim() : '';
      if ($('#ct-doc', m) && (doc.replace(/\D/g, '').length < 5 || city.length < 3)) { toast('Escribe tu cédula y el lugar de expedición', true); return; }
      const b = $('#ct-ok', m); b.disabled = true; b.textContent = 'Guardando…';
      const x = await api('tContractAccept', { version: c.version, doc, docCity: city });
      if (x && x.ok) { CT = x; m.remove(); toast('✅ Contrato aceptado · se descargó tu copia'); contractPdf(x); }
      else { b.disabled = false; b.textContent = '✅ Leí y acepto'; toast(x && x.err === 'version' ? 'El contrato se actualizó: recarga la página.' : errText((x && x.err) || 'network'), true); } };
  }
  async function contractCheck() { const r = await api('tContract').catch(() => null); if (!r || !r.ok) return false; CT = r; if (r.needs) { contractModal(r); return true; } return false; }
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
      ['idea', 'Mi disponibilidad', 'Publica <b>solo</b> los horarios en los que realmente puedes dictar. Los estudiantes reservan desde <b>mañana</b> y hasta <b>5 días adelante</b> (nunca el mismo día). Cada <b>viernes</b> confírmala con un clic (plazo: <b>sábado 5:00 p. m.</b>); si no, tus horas de la semana siguiente se ocultan hasta que la confirmes.', 'avail'],
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
  const TABS = [['home', '🏠', 'Resumen'], ['avail', '🗓️', 'Mi disponibilidad'], ['classes', '🎓', 'Mis clases'], ['pay', '💰', 'Mis pagos']];
  function shell() {
    bell();
    outBtn.classList.remove('hidden'); outBtn.onclick = () => { if (confirm('¿Cerrar sesión?')) logout(); };
    const t = D.teacher;
    app.innerHTML = `<div class="tp-head">
        <div class="tp-head-txt"><h1>¡Hola, ${esc(t.hello || String(t.name || '').split(' ')[0])}!</h1><p class="muted">${dLabel(today(), true)} · <b>${h12(nowHM())}</b> hora Colombia · Código <b>${esc(t.code)}</b></p></div>
        <div class="tp-dds">
          <div class="tp-dd"><button class="tp-ddb" data-dd="tools">🛠 Herramientas <span class="car">▾</span></button><div class="tp-ddm">
            <button class="tp-mi" id="tp-live"><i class="ib2">🎥</i><span><b>Clases en vivo</b><small>Practica las clases de los 4 módulos</small></span></button>
</div></div>
          <div class="tp-dd"><button class="tp-ddb" data-dd="cls">${({ home: '🏠 Resumen', avail: '🗓️ Mi disponibilidad', classes: '🎓 Mis clases', pay: '💰 Mis pagos' })[tab] || '🎓 Mis clases'} <span class="car">▾</span></button><div class="tp-ddm">
            <button class="tp-mi tp-tab" data-tab="home"><i class="ib6">🏠</i><span><b>Resumen</b><small>Próximas clases y estadísticas</small></span></button>
            <button class="tp-mi tp-tab" data-tab="classes"><i class="ib">🎓</i><span><b>Mis clases</b><small>Próximas y pasadas · tablero</small></span></button>
            <button class="tp-mi tp-tab" data-tab="avail"><i class="ib2">🗓️</i><span><b>Mi disponibilidad</b><small>Tus horarios para reservar</small></span></button>
            <button class="tp-mi tp-tab" data-tab="pay"><i class="ib4">💰</i><span><b>Mis pagos</b><small>Detalle del mes</small></span></button></div></div>
          <div class="tp-dd"><button class="tp-ddb" data-dd="me">👤 Mi cuenta <span class="car">▾</span><i class="tp-dot" id="tp-chatdot" hidden></i></button><div class="tp-ddm">
            <button class="tp-mi" id="tp-chat"><i class="ib4">💬</i><span><b>Chat con estudiantes</b><small>Responde dudas y tareas</small></span></button>
            <button class="tp-mi" id="tp-ct"><i class="ib">📄</i><span><b>Mi contrato</b><small>Leído y aceptado · descargar copia</small></span></button><button class="tp-mi" id="tp-pol"><i class="ib">📌</i><span><b>Política de clases</b><small>Puntualidad, pagos y compromisos</small></span></button>
            <button class="tp-mi" id="tp-pinch"><i class="ib3">🔑</i><span><b>Cambiar PIN</b><small>Tu clave de acceso</small></span></button>
            <button class="tp-mi" id="tp-tour"><i class="ib5">🧭</i><span><b>Ver el tour</b><small>Cómo funciona tu portal</small></span></button></div></div>
        </div>
      </div>
      <section id="tp-body"></section>`;
    if ($('#tp-tour')) $('#tp-tour').onclick = () => tour();
    if ($('#tp-mat')) $('#tp-mat').onclick = material;
    if ($('#tp-pz')) $('#tp-pz').onclick = () => pzPick();
    if ($('#tp-live')) $('#tp-live').onclick = () => { // 🎥 práctica de las clases en vivo de los 4 módulos
      const show = (mod) => { const T = (window.CLASE_TOPICS || {})[mod] || []; const LV = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2+' };
        const m = modal(`<button class="tp-x" data-x aria-label="Cerrar">✕</button><h3>🎥 Clases en vivo</h3><p class="muted">Cada tema es una clase completa de 50 minutos: te dice qué hacer en cada paso, con audio, respuestas, pizarra y reloj. Ábrela en <b>modo práctica</b> para prepararte; en la clase real entras desde <b>Mis clases → Entrar a la clase</b>.</p>
          <div class="tp-livetabs">${[1, 2, 3, 4].map((x) => `<button class="${x === mod ? 'on' : ''}" data-lm="${x}">Módulo ${x} · ${LV[x]}</button>`).join('')}</div>
          <div class="tp-livel">${T.map((t, i) => `<a class="tp-livei" href="clase-en-vivo.html?rol=profe&demo=1&m=${mod}&t=${i + 1}"><b>${i + 1}</b><span>${esc(t[0])}</span><em>Practicar →</em></a>`).join('') || '<p class="muted">Cargando…</p>'}</div>`);
        m.querySelectorAll('[data-lm]').forEach((b) => b.onclick = () => { m.remove(); show(+b.dataset.lm); }); };
      if (window.CLASE_TOPICS) return show(1);
      const sc = document.createElement('script'); sc.src = 'js/clase-topics.js?v=' + Date.now().toString().slice(0, 7); sc.onload = () => show(1); sc.onerror = () => { const s2 = document.createElement('script'); s2.src = 'clase-topics.js'; s2.onload = () => show(1); document.head.appendChild(s2); }; document.head.appendChild(sc); };
    if ($('#tp-ct')) $('#tp-ct').onclick = async () => { const r = CT && !CT.needs ? CT : await api('tContract').catch(() => null); if (r && r.ok) contractModal(r); else toast(errText('network'), true); };
    if ($('#tp-pol')) $('#tp-pol').onclick = async () => { const r = await api('tPay').catch(() => null); window.MRPOLICY && MRPOLICY.showTeacher({ rate: r && r.rate, noshow: r && r.noshowRate, penalty: r && r.penalty, onAccept: () => toast('✅ Gracias por tu compromiso') }); }; // 📌 política (puntualidad, 15 minutos)
    if ($('#tp-pinch')) $('#tp-pinch').onclick = () => { // 🔑 cambiar PIN
      const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="card"><button class="mx" aria-label="Cerrar">✕</button><h3>🔑 Cambiar mi PIN</h3><p class="muted">Usa de 4 a 8 números.</p>
        <input class="inp" id="pc-old" type="password" autocapitalize="characters" placeholder="PIN actual" style="margin-bottom:8px"><input class="inp" id="pc-new" type="password" autocapitalize="characters" placeholder="Nuevo PIN" style="margin-bottom:8px"><input class="inp" id="pc-new2" type="password" autocapitalize="characters" placeholder="Repite el nuevo PIN">
        <p id="pc-msg" style="color:#b91c1c;font-weight:700;min-height:20px;margin:8px 0;text-align:center"></p><button class="btn k block lg" id="pc-go">Guardar nuevo PIN</button></div>`; document.body.appendChild(m);
      m.querySelector('.mx').onclick = () => m.remove(); m.onclick = (e) => { if (e.target === m) m.remove(); };
      m.querySelector('#pc-go').onclick = async () => { const o = m.querySelector('#pc-old').value.trim(), n = m.querySelector('#pc-new').value.trim(), n2 = m.querySelector('#pc-new2').value.trim(), msg = m.querySelector('#pc-msg');
        if (o !== String(S.pin)) return msg.textContent = 'El PIN actual no es correcto.';
        if (!/^[A-Za-z0-9]{4,12}$/.test(n)) return msg.textContent = 'Usa de 4 a 12 letras o números (sin espacios ni símbolos).';
        if (n !== n2) return msg.textContent = 'Los dos PIN nuevos no coinciden.';
        const b = m.querySelector('#pc-go'); b.disabled = true; b.textContent = 'Guardando…';
        const r = await api('tPinChange', { newPin: n }).catch(() => null);
        if (r && r.ok) { S.pin = n; ss.set(SKEY, S); m.querySelector('.card').innerHTML = '<div style="text-align:center"><h3>✅ ¡Listo! Tu PIN cambió</h3><p>Desde ahora entra con tu nuevo PIN. Te enviamos una confirmación a tu correo.</p><button class="btn k block lg" id="pc-ok">Entendido</button></div>'; m.querySelector('#pc-ok').onclick = () => m.remove(); return; }
        b.disabled = false; b.textContent = 'Guardar nuevo PIN'; msg.textContent = !r ? 'No hay conexión. Inténtalo de nuevo.' : r.err === 'same' ? 'El nuevo PIN es igual al actual.' : 'No se pudo cambiar. Inténtalo de nuevo.'; }; };
    if ($('#tp-chat')) $('#tp-chat').onclick = () => openChat();
    if (/#chat\b/.test(location.hash)) { history.replaceState(null, '', location.pathname); setTimeout(() => openChat(), 300); }
    $$('.tp-tab').forEach((b) => { b.classList.toggle('on', b.dataset.tab === tab); b.onclick = () => { tab = b.dataset.tab; ss.set(TABKEY, tab); shell(); }; });
    { const dot = $('#tp-chatdot'); if (dot) dot.hidden = !(D.notifications || []).some((n) => !n.read && n.type === 'chat'); } // 🔴 mensajes nuevos
    // menús desplegables (Herramientas · Mis clases · Mi cuenta)
    const dds = $$('.tp-dd'); const closeDD = () => dds.forEach((d) => d.classList.remove('open'));
    dds.forEach((d) => { d.querySelector('.tp-ddb').onclick = (e) => { e.stopPropagation(); const o = d.classList.contains('open'); closeDD(); if (!o) d.classList.add('open'); }; d.querySelectorAll('.tp-mi').forEach((x) => x.addEventListener('click', closeDD)); });
    if (!window.__tpdd) { window.__tpdd = 1; document.addEventListener('click', (e) => { if (!e.target.closest('.tp-dd')) $$('.tp-dd').forEach((d) => d.classList.remove('open')); }); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.tp-dd').forEach((d) => d.classList.remove('open')); }); }
    ({ home, avail, classes, groups, pay }[tab] || home)($('#tp-body'));
    weekBanner($('#tp-body'));
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
    if (!done && (hidden || (t.weekCut && !weekend))) html = `<div class="tp-wk bad"><div class="tp-wk-h"><span class="tp-wk-i">⚠️</span><div><h2>Tus horas de la semana del ${rng} están ocultas</h2><p>No confirmaste tu disponibilidad a tiempo, así que los estudiantes no pueden reservar contigo esa semana. Las clases ya reservadas siguen igual. Confírmala ahora y tus horas vuelven a aparecer al instante.</p></div></div>${has ? `<ul class="tp-wk-l">${rows}</ul>` : ''}${btns('Confirmar y volver a publicar')}</div>`;
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
      <div class="tp-cls-what">${typeBadge(c)} ${statusBadge(c)}<div class="tp-cls-who">${whoOf(c)}</div>${c.topic && c.type !== 'club' ? `<small class="muted">Tema: ${esc(c.topic)}</small>` : ''}
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
    const m = modal(`<button class="tp-x" data-x aria-label="Cerrar">✕</button><h3>👤 Ficha de ${esc(studentName(code))}</h3><p class="muted">Clase del ${dLabel(c.date, true)} · ${h12(c.time)}</p>${(() => { const st = D.students[code] || {}; const MID = { 1: 'A1', 2: 'A2', 3: 'B2', 4: 'B2+' }[st.module]; const pr = MID && (st.progress || {})[MID]; return `<div class="tb-info">🎓 <b>Nivel:</b> ${MID ? 'Módulo ' + st.module + ' · ' + MID + (pr ? ' · ' + pr.pct + '% (' + pr.done + '/' + pr.total + ' clases)' : '') : 'Sin prueba de clasificación'}${c.topic ? `<br>🎯 <b>Quiere reforzar:</b> ${esc(c.topic)}` : ''}</div>`; })()}
      <h4 class="fi-h">📚 Sus clases anteriores <small>(con cualquier profe)</small></h4><div id="fi-l"><p class="muted">Cargando…</p></div>
      ${live ? `<a class="btn k block fi-go" href="clase-en-vivo.html?c=${encodeURIComponent(c.id)}&rol=profe">🎥 Entrar a la clase</a>` : c.status === 'scheduled' ? '<p class="muted fi-n">El botón para entrar a la clase aparece el día de la clase.</p>' : ''}
      <p class="muted fi-n">No tienes que escribir nada: al terminar la clase en vivo, el resumen y la pizarra se guardan solos aquí.</p>`);
    const r = await api('tBoards', { code }); const L = ((r && r.ok && r.boards) || []).filter((b) => (b.text || (b.imgs || []).length) && b.classId !== id).reverse();
    const SKC = { Speaking: 's', Listening: 'l', Reading: 'r', Writing: 'w' };
    const body = (t) => String(t || '').split(/\n+/).map((ln) => { ln = ln.trim(); if (!ln) return '';
      if (/^🎥/.test(ln)) return `<div class="fi-t">${esc(ln.replace(/^🎥\s*Clase en vivo\s*·\s*/, ''))}</div>`;
      if (/^Resultado:/.test(ln)) { const [a, ...sk] = ln.split(' · '); return `<small class="muted">${esc(a)}</small><div>${sk.map((x) => { const k = x.split(' ')[0]; return `<span class="fi-sk ${SKC[k] || ''}">${esc(x)}</span>`; }).join('')}</div>`; }
      if (/^Para reforzar:/.test(ln)) return `<div class="fi-rf">⚠️ ${esc(ln)}</div>`;
      return `<div>${esc(ln)}</div>`; }).join('');
    $('#fi-l', m).innerHTML = L.length ? L.map((b) => `<div class="fi-c"><b>${dLabel(b.date)} · ${esc(b.teacher || '')}</b>${body(b.text)}${(b.imgs || []).length ? `<div class="fi-pz">${b.imgs.map((u, k) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Pizarra ${k + 1}" loading="lazy"></a>`).join('')}<small>Pizarra de esa clase</small></div>` : ''}</div>`).join('') : `<p class="muted">Es su primera clase individual: aún no hay clases anteriores.</p>`;
  }
  function home(el) {
    const t0 = today();
    const up = D.classes.filter((c) => c.status === 'scheduled' && c.date >= t0);
    const pend = D.classes.filter((c) => c.status === 'scheduled' && c.date <= t0 && !(c.date === t0 && endHM(c.time, c.duration) > nowHM()));
    const free = D.slots.filter((s) => s.status === 'free' && s.date >= t0).length;
    el.innerHTML = `<div class="tp-stats">
        <div class="tp-stat red"><b>${+D.stats.taughtMonth || 0}</b><span>clases dictadas este mes</span></div>
        <div class="tp-stat"><b>${+D.stats.taughtTotal || 0}</b><span>clases dictadas en total</span></div>
        <div class="tp-stat"><b>${up.length}</b><span>próximas clases</span></div>
        <div class="tp-stat"><b>${free}</b><span>espacios disponibles</span></div>
      </div>
      ${pend.length ? `<div class="tp-alert warn"><b>📌 Tienes ${pend.length} clase${pend.length > 1 ? 's' : ''} por marcar.</b> Registra la asistencia para que el estudiante vea su progreso. <button class="btn k sm" data-go="classes">Ir a Mis clases</button></div>` : ''}
      <div class="card tp-card"><div class="tp-card-h"><h2>Próximas clases</h2><small class="muted">hora Colombia</small></div>
        ${up.length ? `<ul class="tp-list">${up.slice(0, 8).map((c) => classRow(c)).join('')}</ul>` : `<div class="tp-empty"><img src="mra-think.webp" alt="" width="110" height="110"><p>No tienes clases programadas.${free ? '' : ' Agrega espacios en <b>Mi disponibilidad</b> para que tus estudiantes Premium reserven clases individuales.'}</p></div>`}
      </div>
      ${!free ? `<div class="tp-alert"><b>🗓️ No tienes espacios disponibles.</b> Los estudiantes Premium solo pueden reservar en los horarios que publiques. <button class="btn w sm" data-go="avail">Agregar disponibilidad</button></div>` : ''}`;
    $$('[data-go]', el).forEach((b) => b.onclick = () => { tab = b.dataset.go; ss.set(TABKEY, tab); shell(); });
    bindMarks(el);
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
    el.innerHTML = `<div class="card tp-card tp-week"><div class="tp-card-h"><h2>📅 Mi disponibilidad semanal</h2></div>
        <p class="muted tp-small">Con estas horas la plataforma publica tus espacios de las próximas <b>4 semanas</b> y los renueva cada día. Los estudiantes Premium reservan ahí. <b>Cada viernes te pediremos confirmarla.</b></p>
        <div id="tp-wg"></div><button class="btn k lg block" id="tp-wsave" style="margin-top:12px">Guardar mi disponibilidad semanal</button></div>
      <div class="tp-cols1">
      <div class="card tp-card">
        <div class="tp-card-h"><h2>Mis espacios</h2><small class="muted">${slots.filter((s) => s.status === 'free').length} disponibles · ${slots.filter((s) => s.status === 'booked').length} reservados</small></div>
        ${Object.keys(byDate).length ? Object.keys(byDate).sort().map((d) => `<div class="tp-day"><h3>${rel(d) ? `<span class="tp-rel">${rel(d)}</span> ` : ''}${dLabel(d, true)}</h3><ul>${byDate[d].map((s) => {
          const c = s.status === 'booked' ? D.classes.find((x) => x.id === s.classId) : null;
          return `<li class="tp-slot ${s.status}"><span class="tp-slot-t">${h12(s.time)} – ${h12(endHM(s.time, s.duration))}<small>50 min</small></span>
            ${s.status === 'hidden' ? `<span class="tp-st hid">Oculto</span><button class="tp-del" data-del="${esc(s.id)}" title="Borrar espacio" aria-label="Borrar espacio de las ${esc(s.time)}">🗑</button>` : s.status === 'free' ? `<span class="tp-st free">Disponible</span><button class="tp-del" data-del="${esc(s.id)}" title="Borrar espacio" aria-label="Borrar espacio de las ${esc(s.time)}">🗑</button>`
              : `<span class="tp-st booked">Reservado</span><span class="tp-slot-who">👤 ${c ? esc(studentName(c.students[0] || '')) : 'Estudiante'}</span>`}</li>`; }).join('')}</ul></div>`).join('')
          : `<div class="tp-empty"><img src="mra-point.webp" alt="" width="110" height="110"><p>Aún no tienes espacios publicados. Agrega tus horarios con el formulario.</p></div>`}
      </div></div>`;
    const WG = window.MRWG ? MRWG.render($('#tp-wg', el), (D.teacher && D.teacher.weekly) || {}) : null;
    $('#tp-wsave', el).onclick = async () => { const b = $('#tp-wsave', el); b.disabled = true; b.textContent = 'Guardando…';
      const r = await api('tWeekly', { weekly: WG ? WG.get() : {} }); b.disabled = false; b.textContent = 'Guardar mi disponibilidad semanal';
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
        <div class="tp-pay-k"><span><b>${P.done}</b> clase${P.done === 1 ? '' : 's'} dictada${P.done === 1 ? '' : 's'} × ${COP(P.rate)}</span><span><b>${P.noshow}</b> inasistencia${P.noshow === 1 ? '' : 's'} del estudiante × ${COP(P.noshowRate)}</span>${P.tnoshow ? `<span class="tp-pen"><b>${P.tnoshow}</b> penalización${P.tnoshow === 1 ? '' : 'es'} × −${COP(P.penalty)}</span>` : ''}</div>
        <span class="tp-paid ${paid ? 'ok' : 'pend'}">${paid ? '✅ Pagado' + (paidAt ? ' el ' + esc(dLabel(String(paidAt).slice(0, 10))) : '') : '⏳ Pendiente por pagar'}</span></div>
      <div class="tp-alert"><b>¿Cómo se calcula?</b> Se paga cada clase <b>dictada</b> (${COP(P.rate)} por clase de 50 min). Si <b>te conectas y el estudiante no asiste</b>, se pagan ${COP(P.noshowRate)}. Las clases canceladas (a tiempo o fuera de tiempo) y las no dictadas no se pagan. <b>Si no te conectas</b> y el estudiante lo reporta, se descuentan ${COP(P.penalty || 10000)} de penalización (administración puede revisarlo en casos de fuerza mayor). El pago es mensual. Recuerda <b>marcar cada clase</b> en Mis clases.</div>
      <div class="card tp-card"><div class="tp-card-h"><h2>Detalle</h2><small class="muted">hora Colombia</small></div>
      ${P.items.length ? `<ul class="tp-list tp-pay-list">${P.items.map((x) => { const st = PST[x.status] || ['off', x.status]; return `<li class="tp-pay-row"><div><b>${dLabel(x.date)} · ${h12(x.time)}</b><small>${x.type === 'vip' ? 'Individual' : esc(x.club || 'Clase grupal')}${x.who ? ' · ' + esc(x.who) : ''}</small></div><span class="tp-pst ${st[0]}">${esc(st[1])}</span><b class="tp-amt">${COP(x.amount)}</b></li>`; }).join('')}</ul>` : '<p class="muted">No hay clases registradas en este mes.</p>'}</div>`;
    $('#tp-pm', el).onchange = (e) => { payMonth = e.target.value; pay(el); };
    $('#tp-pdf', el).onclick = () => payPdf(P, paid, paidAt);
  }
  // volante de pago imprimible → "Guardar como PDF"
  function payPdf(P, paid, paidAt) {
    const t = D.teacher || {}; const w = window.open('', '_blank'); if (!w) { toast('Permite las ventanas emergentes para descargar el PDF', true); return; }
    const rows = P.items.map((x) => `<tr><td>${esc(dLabel(x.date))}</td><td>${esc(h12(x.time))}</td><td>${x.type === 'vip' ? 'Individual' : esc(x.club || 'Clase grupal')}</td><td>${esc(x.who || '')}</td><td>${esc((PST[x.status] || ['', x.status])[1])}</td><td class="r">${COP(x.amount)}</td></tr>`).join('');
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Volante de pago ${esc(t.name)} ${esc(P.month)}</title><style>
      body{font-family:Arial,Helvetica,sans-serif;color:#1a202c;margin:32px}h1{color:#0B2A5B;font-size:22px;margin:16px 0 4px}.top{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #E3242B;padding-bottom:12px}
      .top img{height:60px}.meta{font-size:14px;line-height:1.6}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border:1px solid #dfe3ea;padding:7px 8px;text-align:left}th{background:#0B2A5B;color:#fff}
      .r{text-align:right}.sum{margin-top:16px;width:340px;margin-left:auto}.sum td{font-size:14px}.tot td{font-weight:800;font-size:16px;background:#f4f6fa}.st{display:inline-block;margin-top:10px;padding:6px 12px;border-radius:999px;font-weight:700;background:${paid ? '#dcfce7;color:#166534' : '#fff3cd;color:#8a5a00'}}
      .foot{margin-top:28px;font-size:12px;color:#4a5568}@media print{body{margin:14mm}}</style></head><body>
      <div class="top"><img src="${location.href.replace(/[^/]*$/, '')}mra-brand.png" alt="mrarrieta.com"><div class="meta" style="text-align:right"><b>VOLANTE DE PAGO</b><br>${esc(MES(P.month))}</div></div>
      <h1>${esc(t.name || '')}</h1><div class="meta">Código: ${esc(t.code || '')}${t.email ? ' · ' + esc(t.email) : ''}<br>Periodo: ${esc(MES(P.month))} · Valor por clase dictada: ${COP(P.rate)} · Inasistencia del estudiante: ${COP(P.noshowRate)}</div>
      <span class="st">${paid ? 'PAGADO' + (paidAt ? ' · ' + esc(dLabel(String(paidAt).slice(0, 10))) : '') : 'PENDIENTE POR PAGAR'}</span>
      <table><thead><tr><th>Fecha</th><th>Hora</th><th>Clase</th><th>Estudiante(s)</th><th>Estado</th><th class="r">Valor</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Sin clases registradas</td></tr>'}</tbody></table>
      <table class="sum"><tr><td>Clases dictadas (${P.done} × ${COP(P.rate)})</td><td class="r">${COP(P.done * P.rate)}</td></tr><tr><td>Inasistencias (${P.noshow} × ${COP(P.noshowRate)})</td><td class="r">${COP(P.noshow * P.noshowRate)}</td></tr>${P.tnoshow ? `<tr><td>Penalizaciones (${P.tnoshow} × ${COP(P.penalty)})</td><td class="r">−${COP(P.tnoshow * P.penalty)}</td></tr>` : ''}<tr class="tot"><td>TOTAL</td><td class="r">${COP(P.total)}</td></tr></table>
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

  // 🔔 pop-up: reservas, cancelaciones y confirmaciones nuevas (al entrar y cada 2 minutos)
  const POPPED = new Set();
  function popNew() {
    if (!D || document.querySelector('.tp-modal')) return;
    const nw = (D.notifications || []).filter(n => !n.read && (n.type === 'vip' || n.type === 'club') && !POPPED.has(n.id)); if (!nw.length) return;
    nw.forEach(n => POPPED.add(n.id));
    const m = modal(`<h3>🔔 ${nw.length === 1 ? 'Tienes una novedad' : 'Tienes ' + nw.length + ' novedades'}</h3><div class="tp-pop-list">${nw.map(n => `<div><b>${esc(n.title)}</b><small>${esc(n.body || '')}</small></div>`).join('')}</div><button class="btn k block" id="tp-pok">Entendido</button>`);
    $('#tp-pok', m).onclick = () => { m.remove(); api('notifRead', { ids: nw.map(n => n.id) }).catch(() => { }); nw.forEach(n => n.read = true); if (tab === 'home') shell(); };
  }
  // "Atrás": dentro del portal vuelve al Resumen; nunca saca al profe a otra página por error
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('.tb-back'); if (!b || !S || !D) return; e.preventDefault(); e.stopImmediatePropagation(); const wa = document.querySelector('.wa-wrap'); if (wa && window.MRLIVE) return MRLIVE.close(); if (tab !== 'home') { tab = 'home'; ss.set(TABKEY, tab); shell(); } window.scrollTo(0, 0); }, true);
  let bellOn = false;
  function bell() { if (bellOn || !window.MRBELL) { if (window.MRBELL && D) MRBELL.set(D.notifications || []); return; } bellOn = true;
    MRBELL.set(D.notifications || []);
    MRBELL.mount({ every: 15000, active: () => !!S, fetch: async () => { if (!S || !D) return null; const r = await api('notifs').catch(() => null); if (!r || !r.ok) return null; const had = new Set((D.notifications || []).map(n => n.id)); D.notifications = r.notifications; if ((r.notifications || []).some(n => !had.has(n.id))) popNew(); return r.notifications; },
      markRead: (ids, all) => api('notifRead', all ? { all: true } : { ids }).catch(() => { }) }); }
  /* ---------- inicio ---------- */
  async function start() {
    S = ss.get(SKEY);
    if (!S || !S.tcode || !MR.on) { S = null; loginView(); return; }
    app.innerHTML = '<div class="tp-loading">Cargando tu portal…</div>';
    const r = await MR.call('tLogin', { tcode: S.tcode, pin: S.pin });
    if (r.ok) { D = r; shell(); contractCheck().then((blk) => { if (!blk) setTimeout(popNew, 600); }); } else { if (r.err === 'auth') ss.del(SKEY); loginView(r.err === 'auth' ? '' : errText(r.err)); }
  }
  start();
})();
