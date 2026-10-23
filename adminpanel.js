/* =====================================================================
   PANEL DE ADMINISTRACIÓN — mrarrieta.com (datos en la nube)
   Estudiantes y progreso · planes · inscripciones · placement (audios)
   · reclutamiento (CV + audios) · profesores (disponibilidad y clases
   dictadas) · clases individuales · grupos (historial) · solicitudes · ajustes
   ===================================================================== */
(function () {
  const C = window.M1CONFIG || {}; const app = document.getElementById('app');
  const KK = 'mra_admin_key';
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const J = (s, d) => { if (s && typeof s === 'object') return s; try { return s ? JSON.parse(s) : d; } catch (e) { return d; } };
  const key = () => { try { return sessionStorage.getItem(KK) || ''; } catch (e) { return ''; } };
  const PLAN = { free: ['🎁', 'ACCESO GRATUITO'], membership: ['🖥️', 'PLATAFORMA'], premium: ['👑', 'PREMIUM · 4 CLASES'], premium8: ['💎', 'PREMIUM · 8 CLASES'], expired: ['⏰', 'Vencido'] };
  const MODN = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2+' };
  const PRICE = { membership: 59900, premium: 349000 };
  const money = (n) => '$' + Math.round(+n || 0).toLocaleString('es-CO');
  const fD = (iso, o) => { if (!iso) return '—'; try { return new Date(String(iso).slice(0, 10) + 'T12:00:00').toLocaleDateString('es-CO', o || { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
  const fDT = (iso) => iso ? fD(iso) + (String(iso).length > 10 ? ' · ' + String(iso).slice(11, 16) : '') : '—';
  const fT = (t) => { if (!t) return ''; const [hh, mm] = String(t).split(':').map(Number); return `${((hh + 11) % 12) + 1}:${String(mm || 0).padStart(2, '0')} ${hh >= 12 ? 'p. m.' : 'a. m.'}`; };
  const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const waLink = (raw, txt) => { let d = String(raw || '').replace(/\D/g, ''); if (!d) return ''; if (d.length === 10) d = '57' + d; return 'https://api.whatsapp.com/send?phone=' + d + (txt ? '&text=' + encodeURIComponent(txt) : ''); };
  const BASE = (C.PLATFORM_URL || location.href.replace(/[^/]*$/, ''));
  function toast(m) { let t = $('#ad-toast'); if (!t) { t = document.createElement('div'); t.id = 'ad-toast'; document.body.appendChild(t); } t.textContent = m; t.className = 'on'; clearTimeout(t._t); t._t = setTimeout(() => t.className = '', 2600); }
  function modal(html) { const m = document.createElement('div'); m.className = 'ad-modal'; m.innerHTML = `<div class="ad-mcard"><button class="ad-mx" aria-label="Cerrar">✕</button>${html}</div>`; document.body.appendChild(m); m.querySelector('.ad-mx').onclick = () => m.remove(); m.addEventListener('click', e => { if (e.target === m) m.remove(); }); return m; }
  async function copy(t) { try { await navigator.clipboard.writeText(t); } catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } toast('📋 Copiado'); }

  async function api(action, data) {
    const r = await MRAC.call(action, Object.assign({ key: key() }, data || {}), action === 'aTesSave' ? { timeout: 300000 } : undefined);
    if (!r.ok && r.err === 'auth') { try { sessionStorage.removeItem(KK); } catch (e) { } toast('Tu sesión expiró. Vuelve a entrar.'); login(); }
    if (!r.ok && r.err === 'network') toast('Sin conexión con la nube 😕');
    return r;
  }
  let REF = { teachers: [], groups: [] };
  async function loadRef() { const r = await api('aTeachers'); if (r.ok) REF = { teachers: r.teachers || [], groups: r.groups || [] }; }
  const tName = (id) => (REF.teachers.find(t => t.id === id) || {}).name || '—';
  const gName = (id) => { const g = REF.groups.find(x => x.id === id); return g ? `${g.name} · ${g.days || ''} ${fT(g.time)}` : '—'; };
  const teacherOpts = (sel) => `<option value="">— Elegir profe —</option>` + REF.teachers.filter(t => t.active !== 'no').map(t => `<option value="${esc(t.id)}" ${t.id === sel ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  const groupOpts = (sel) => `<option value="">— Sin grupo —</option>` + REF.groups.filter(g => g.active !== 'no').map(g => `<option value="${esc(g.id)}" ${g.id === sel ? 'selected' : ''}>${esc(g.name)} · ${esc(g.level || '')} · ${esc(g.days || '')} ${fT(g.time)}</option>`).join('');

  /* ======================= LOGIN ======================= */
  function login() {
    $('#ad-out') && $('#ad-out').classList.add('hidden');
    if (!MRAC.on) {
      app.innerHTML = `<div class="card ad-login"><div style="font-size:44px">☁️</div><h2>Conecta la nube primero</h2><p>El panel de administración lee los datos desde tu Google Sheets. Sigue los pasos del archivo <b>LEEME-NUBE.md</b> y pega la URL de tu Apps Script en <b>config.js → CLOUD_URL</b>.</p><a class="btn w" href="admin.html">🔑 Generador de códigos (sin nube)</a></div>`;
      return;
    }
    try { location.replace('index.html'); return; } catch (e) { } // 🔑 se entra desde «Ingresa a tu perfil» en la página de entrada
    app.innerHTML = `<div class="card ad-login"><img src="mra-present.webp" alt="" class="ad-login-img"><span class="lbl">Solo para administración</span><h2>Panel de administración</h2>
      <p class="muted">Escribe la clave de administración.</p>
      <input class="inp" id="pw" type="password" autocomplete="current-password" placeholder="Clave"><button class="btn k block lg" id="go">Entrar</button><p id="err" class="ad-err"></p></div>`;
    const go = async () => { const v = $('#pw').value.trim(); if (!v) return; $('#go').disabled = true; $('#go').textContent = 'Verificando…';
      const r = await MRAC.call('aLogin', { key: v }); $('#go').disabled = false; $('#go').textContent = 'Entrar';
      if (r.ok) { try { sessionStorage.setItem(KK, v); localStorage.setItem('mra_last_role', JSON.stringify({ role: 'admin' })); } catch (e) { } boot(); }
      else $('#err').textContent = r.err === 'change_password' ? '⚠️ Primero cambia ADMIN_PASSWORD en Code.gs y vuelve a implementar (Implementar → Gestionar implementaciones → Editar → Nueva versión).' : r.err === 'auth' ? 'Clave incorrecta.' : 'No hay conexión con la nube. Revisa CLOUD_URL.'; };
    $('#go').onclick = go; $('#pw').onkeydown = e => { if (e.key === 'Enter') go(); }; setTimeout(() => $('#pw').focus(), 100);
  }

  /* ======================= ESTRUCTURA ======================= */
  const TABS = [['today', '✅', 'Tareas de hoy'], ['home', '📊', 'Resumen'], ['students', '🎓', 'Estudiantes'], ['families', '👨‍👩‍👧', 'Familias'], ['enroll', '📝', 'Inscripciones'], ['buys', '💳', 'Pagos'], ['claims', '🚩', 'Reclamos'], ['reviews', '⭐', 'Opiniones'], ['prizes', '🎁', 'Premios'], ['leads', '📣', 'Interesados'], ['placement', '🧭', 'Placement'], ['recruit', '👩‍🏫', 'Reclutamiento'], ['teachers', '🧑‍🏫', 'Profesores'], ['contracts', '📄', 'Contratos'], ['tes', '🎬', 'Testimonios'], ['boards', '📝', 'Tableros'], ['classes', '📅', 'Clases'], ['requests', '🔁', 'Solicitudes'], ['chats', '💬', 'Chats'], ['settings', '⚙️', 'Ajustes']];
  let TAB = 'home', STATS = null;
  // "Atrás": dentro del panel vuelve al Resumen (nunca saca a otra página por error)
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('.tb-back'); if (!b || !key()) return; if (document.querySelector('.modal, .wa-wrap')) return; e.preventDefault(); e.stopImmediatePropagation(); if (TAB !== 'home') go('home'); else window.scrollTo(0, 0); }, true);
  async function boot() {
    if (window.MRBELL) MRBELL.mount({ every: 15000, active: () => !!key(), fetch: async () => { const r = await api('aNotifs'); return r.ok ? r.rows : null; }, markRead: (ids, all) => api('notifRead', all ? { all: true } : { ids }) });
    const out = $('#ad-out'); if (out) { out.classList.remove('hidden'); out.onclick = () => { try { sessionStorage.removeItem(KK); } catch (e) { } login(); }; }
    app.innerHTML = `<nav class="ad-tabs" id="tabs">${TABS.map(([k, i, n]) => `<button data-t="${k}"><span>${i}</span>${n}<i class="ad-badge" data-b="${k}"></i></button>`).join('')}</nav><div id="view" class="ad-view"><div class="ad-loading">⏳ Cargando…</div></div>`;
    $$('#tabs button').forEach(b => b.onclick = () => go(b.dataset.t));
    await loadRef();
    const h = (location.hash || '').slice(1); go(TABS.some(t => t[0] === h) ? h : 'today');
  }
  function go(t) { TAB = t; history.replaceState(null, '', '#' + t); $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); const on = $(`#tabs button[data-t="${t}"]`); on && on.scrollIntoView({ inline: 'center', block: 'nearest' }); window.scrollTo(0, 0); (VIEWS[t] || VIEWS.home)(); }
  const view = () => $('#view');
  function badges(s) { const set = (k, n) => { const e = $(`[data-b="${k}"]`); if (e) { e.textContent = n || ''; e.style.display = n ? '' : 'none'; } };
    set('enroll', s.enrollNew); set('recruit', s.recruitNew); set('requests', s.requestsPending); set('buys', s.buysPending); set('claims', s.claimsPending); }

  /* ======================= ✅ TAREAS DE HOY ======================= */
  async function today() {
    view().innerHTML = '<div class="ad-loading">⏳ Revisando lo de hoy…</div>';
    const r = await api('aToday'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar las tareas de hoy.</p>';
    const MP = 'https://link.mercadopago.com.co/mrarrieta', F = (n) => String(n || '').split(' ')[0];
    const DK = 'mra_today_' + r.today; let DONE = {}; try { DONE = JSON.parse(localStorage.getItem(DK) || '{}'); } catch (e) { }
    const mark = (id) => { DONE[id] = 1; try { localStorage.setItem(DK, JSON.stringify(DONE)); } catch (e) { } };
    const MSG = {
      exp0: (x) => `Hola ${F(x.name)}, hoy vence tu plan ${x.plan} en mrarrieta.com. Renuévalo hoy para no perder tu acceso ni tu progreso: ${MP}\n\nLas clases se reservan y se cancelan únicamente en la plataforma.`,
      exp3: (x) => `Hola ${F(x.name)}, tu plan ${x.plan} en mrarrieta.com vence en 3 días. Recuerda que las clases no son acumulables: resérvalas antes de esa fecha. Renueva aquí: ${MP}\n\nLas clases se reservan y se cancelan únicamente en la plataforma.`,
      trial1: (x) => `Hola ${F(x.name)}, hoy es tu último día de prueba gratis en mrarrieta.com. ¿Te gustó? Elige tu plan y sigue aprendiendo inglés HABLANDO: ${MP}`,
      trial0: (x) => `Hola ${F(x.name)}, tu prueba gratis en mrarrieta.com terminó. Si te inscribes en las próximas 24 horas tienes 10% de descuento en tu primer mes: ${MP}`,
      bday: (x) => `¡Feliz cumpleaños, ${F(x.name)}! Todo el equipo de mrarrieta.com te desea un día increíble. ¡Sigue aprendiendo inglés HABLANDO!`,
      prize: (x) => `Hola ${F(x.name)}, te recordamos que tu premio del 10% en el primer mes en mrarrieta.com (código ${x.pcode}) vence hoy. Inscríbete aquí y úsalo al pagar: ${location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '')}adultos.html#ld-planes`,
      review: (x) => `Hola ${F(x.name)}, te escribimos de mrarrieta.com. Gracias por tu opinión sobre la plataforma: la leímos con atención y queremos ayudarte. ¿Nos cuentas un poco más para mejorar tu experiencia?`,
      week: (x) => `Hola ${F(x.name)}, te recordamos confirmar tu disponibilidad de la próxima semana en tu portal de mrarrieta.com. ¡Gracias!`
    };
    const G = [['prize', '🎁 Premios del 10% que vencen hoy'], ['buy', '💳 Pagos por confirmar'], ['claim', '🚩 Reclamos por revisar'], ['review', '⭐ Opiniones bajas (1–3 ★) · contactar hoy'], ['req', '📨 Solicitudes'], ['enroll', '📝 Inscripciones nuevas'], ['exp0', '⏰ Planes que vencen hoy'], ['trial0', '💸 Pruebas gratis terminadas (ofrecer 10%)'], ['trial1', '🎁 Último día de prueba gratis'], ['exp3', '📅 Planes que vencen en 3 días'], ['week', '🗓️ Profes sin confirmar disponibilidad'], ['bday', '🎂 Cumpleaños de hoy'], ['recruit', '👩‍🏫 Candidatos nuevos']];
    const T = r.tasks.map((x, i) => Object.assign(x, { uid: x.k + ':' + (x.id || x.code || i) })); const pend = T.filter(x => !DONE[x.uid]);
    const act = (x) => {
      if (x.k === 'buy') return `${x.proof ? `<a class="btn w sm" target="_blank" rel="noopener" href="${esc(x.proof)}">🧾 Comprobante</a>` : ''}<button class="btn k sm" data-a="buy-ok">✅ Aprobar</button><button class="btn w sm" data-a="buy-no">Rechazar</button>`;
      if (x.k === 'claim') return `<button class="btn k sm" data-a="claim-ok">✅ Aprobar</button><button class="btn w sm" data-a="claim-no">Rechazar</button>`;
      if (x.k === 'req') return `<button class="btn k sm" data-a="req-ok">✅ Aprobar</button><button class="btn w sm" data-a="req-no">Rechazar</button>`;
      if (x.k === 'enroll') return `<button class="btn k sm" data-a="open-enroll">Abrir</button>`;
      if (x.k === 'recruit') return `<button class="btn k sm" data-a="open-recruit">Ver candidato</button>`;
      if (x.k === 'review') return `${x.wa ? `<a class="btn sm ad-wa" target="_blank" rel="noopener" data-a="wa-only" href="${waLink(x.wa, MSG.review(x))}">📲 WhatsApp</a>` : '<span class="muted" style="font-size:12.5px">Sin WhatsApp</span>'}<button class="btn k sm" data-a="rv-done">✓ Atendida</button>`;
      if (MSG[x.k]) return `${x.wa ? `<a class="btn sm ad-wa" target="_blank" rel="noopener" data-a="wa" href="${waLink(x.wa, MSG[x.k](x))}">📲 WhatsApp</a>` : '<span class="muted" style="font-size:12.5px">Sin WhatsApp</span>'}${x.code ? `<button class="btn w sm" data-a="open-st">Ver ficha</button>` : ''}`;
      return '';
    };
    const card = (x) => `<div class="td-row${DONE[x.uid] ? ' done' : ''}" data-u="${esc(x.uid)}"><div class="td-tx"><b>${esc(x.name || '')}</b><span>${esc(x.txt || '')}</span>${x.note ? `<em>“${esc(x.note)}”</em>` : ''}</div><div class="td-ac">${DONE[x.uid] ? '<span class="td-ok">✓ Hecho</span>' : act(x)}</div></div>`;
    view().innerHTML = `<div class="ad-head"><h1>✅ Tareas de hoy</h1><p class="muted">${fD(r.today, { weekday: 'long', day: 'numeric', month: 'long' })} · ${pend.length ? `<b>${pend.length}</b> pendiente${pend.length > 1 ? 's' : ''}` : '¡Todo al día! 🎉'}</p></div>
      ${pend.length ? '' : '<div class="card td-empty">🎉 No tienes tareas pendientes hoy. ¡Buen trabajo!</div>'}
      ${G.map(([k, t]) => { const L = T.filter(x => x.k === k); return L.length ? `<div class="card td-g"><h3>${t} <span class="td-n">${L.filter(x => !DONE[x.uid]).length}</span></h3>${L.map(card).join('')}</div>` : ''; }).join('')}
      <div class="card td-g"><h3>🎥 Clases de hoy <span class="td-n">${r.classes.length}</span></h3>${r.classes.length ? r.classes.map(c => `<div class="td-row"><div class="td-tx"><b>${esc(fT(c.time))} · ${esc(c.teacher)}</b><span>${esc(c.students.join(', '))}${c.topic ? ' · ' + esc(c.topic) : ''}</span></div></div>`).join('') : '<p class="muted">No hay clases individuales hoy.</p>'}</div>`;
    const find = (el) => T.find(x => x.uid === el.closest('.td-row').dataset.u);
    const doneUI = (el) => { const row = el.closest('.td-row'); row.classList.add('done'); row.querySelector('.td-ac').innerHTML = '<span class="td-ok">✓ Hecho</span>'; };
    $$('[data-a]', view()).forEach(b => b.addEventListener('click', async (e) => { const x = find(b), a = b.dataset.a; if (!x) return;
      if (a === 'wa') { mark(x.uid); setTimeout(() => doneUI(b), 300); return; }
      if (a === 'wa-only') return;
      if (a === 'open-st') return studentDetail(x.code); if (a === 'open-enroll') return go('enroll'); if (a === 'open-recruit') return go('recruit');
      e.preventDefault(); b.disabled = true; let res = null;
      if (a === 'buy-ok' || a === 'buy-no') res = await api('aBuyDecide', { id: x.id, ok: a === 'buy-ok' });
      if (a === 'claim-ok' || a === 'claim-no') res = await api('aClaimDecide', { id: x.id, act: a === 'claim-ok' ? 'approve' : 'reject' });
      if (a === 'rv-done') res = await api('aSchoolSet', { id: x.id, status: 'atendida' });
      if (a === 'req-ok' || a === 'req-no') res = await api('aReq', { id: x.id, status: a === 'req-ok' ? 'aprobada' : 'rechazada' });
      if (res && res.ok) { mark(x.uid); doneUI(b); toast('✅ Listo'); } else { b.disabled = false; toast((res && res.err) || 'No se pudo completar'); } }));
  }

  /* ======================= RESUMEN ======================= */
  async function home() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando resumen…</div>';
    const s = await api('aStats'); if (!s.ok) return view().innerHTML = '<p class="ad-err">No se pudo cargar el resumen.</p>';
    STATS = s; badges(s); const b = s.byPlan;
    setTimeout(() => api('aDemand').then(d => { if (!d || !d.ok || !view().querySelector('.ad-kpis')) return; const D = d.demand, BN = { '': '🕑 Cualquier horario', manana: '🌅 Mañana', tarde: '☀️ Tarde', noche: '🌙 Noche' };
      view().querySelector('.ad-kpis').insertAdjacentHTML('afterend', `<div class="card"><h3 style="margin-top:0">🔔 Demanda de horarios <small class="muted">(estudiantes que no encontraron horario)</small></h3>${D.total ? `<div class="ad-kpis sm">${Object.keys(BN).map(k => `<div class="ad-kpi${D.by[k] ? ' alert' : ''}"><b>${D.by[k] || 0}</b><span>${BN[k]}</span></div>`).join('')}</div><p class="muted" style="margin:8px 0">Pídeles a los profes que publiquen espacios en las franjas con más demanda. A los estudiantes les avisamos solos cuando se abre un espacio.</p><div class="ad-mini">${D.list.map(x => `<div class="ad-mrow"><b>${esc(x.name)}</b> <span class="muted">(${esc(x.code)})</span> · ${BN[x.band] || BN['']} · desde ${esc(x.date)}${x.notifies ? ' · avisado ' + x.notifies + ' vez/veces' : ''}</div>`).join('')}</div>` : '<p class="muted">Nadie está esperando horario. 👌</p>'}</div>`); }).catch(() => { }), 50);
    const kpi = (n, l, sub, cls, t) => `<button class="ad-kpi ${cls || ''}" ${t ? `data-go="${t}"` : ''}><b>${n}</b><span>${l}</span>${sub ? `<em>${sub}</em>` : ''}</button>`;
    view().innerHTML = `<div class="ad-head"><h1>Hola, administración</h1><p class="muted">${fD(s.today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
      <div class="ad-kpis">${kpi(s.students, 'Estudiantes', `${s.active7} activos esta semana`, '', 'students')}${kpi(b.premium + (b.premium8 || 0), '👑 Premium', `${b.premium} de 4 clases · ${b.premium8 || 0} de 8 clases`, 'prem', 'students:premium')}${kpi(b.membership, '🖥️ Plataforma', '', 'memb', 'students:membership')}${kpi(b.free, '🟢 Acceso gratuito', '', 'free', 'students:free')}${kpi(b.expired + s.expiring.length, '⏰ Vencidos y por vencer', `${b.expired} vencidos · ${s.expiring.length} vencen en 7 días`, 'exp', 'students:renew')}${kpi(money(s.revenue), 'Ingreso mensual', 'planes activos (estimado)', 'rev')}</div>
      <div class="ad-kpis sm">${kpi(s.enrollNew, 'Inscripciones nuevas', `${s.enrollTotal} en total`, s.enrollNew ? 'alert' : '', 'enroll')}${kpi(s.placementMonth, 'Placement este mes', `${s.placementTotal} en total`, '', 'placement')}${kpi(s.recruitNew, 'Candidatos nuevos', `${s.recruitTotal} en total`, s.recruitNew ? 'alert' : '', 'recruit')}${kpi(s.requestsPending, 'Solicitudes pendientes', 'intentos extra', s.requestsPending ? 'alert' : '', 'requests')}${kpi(s.classesMonth, 'Clases dictadas', 'este mes', '', 'classes')}${kpi(s.classesUpcoming, 'Clases programadas', 'próximas', '', 'classes')}</div>
      <div class="ad-grid2">
        <div class="card"><h3>⏰ Planes por vencer (7 días)</h3>${s.expiring.length ? `<div class="ad-mini">${s.expiring.map(x => `<button class="ad-mrow" data-st="${esc(x.code)}"><b>${esc(x.name)}</b><span>${PLAN[x.plan] ? PLAN[x.plan].join(' ') : ''} · ${x.daysLeft === 0 ? 'vence hoy' : 'vence en ' + x.daysLeft + ' d'} (${fD(x.planEnd)})</span></button>`).join('')}</div>` : '<p class="muted">Ninguno 🎉</p>'}</div>
        <div class="card"><h3>🎂 Cumpleaños del mes</h3>${s.birthdays.length ? `<div class="ad-mini">${s.birthdays.map(x => `<button class="ad-mrow ${x.today ? 'hoy' : ''}" data-st="${esc(x.code)}"><b>${x.today ? '🎉 ' : ''}${esc(x.name)}</b><span>${fD(x.birth, { day: 'numeric', month: 'long' })}${x.today ? ' · ¡HOY! (correo automático enviado 8:00 a. m.)' : ''}</span></button>`).join('')}</div>` : '<p class="muted">Sin cumpleaños este mes.</p>'}</div>
      </div>
      <div class="card"><h3>🧑‍🏫 Profesores</h3>${s.teachers.length ? `<div class="ad-table"><div class="ad-tr th"><span>Profe</span><span>Dictadas (mes)</span><span>Dictadas (total)</span><span>Espacios disponibles</span></div>${s.teachers.map(t => `<button class="ad-tr" data-tc="${esc(t.id)}"><span><b>${esc(t.name)}</b>${t.active === 'no' ? ' <small>(inactivo)</small>' : ''}<small style="display:block;font-weight:700;color:${t.weekState === 'ok' ? '#15803d' : t.weekState === 'hidden' ? '#b91c1c' : '#b45309'}">${t.weekState === 'ok' ? '✅ Confirmó su disponibilidad' : t.weekState === 'hidden' ? '⚠️ Horas ocultas (no confirmó)' : '⏳ Pendiente de confirmar'}</small></span><span>${t.taughtMonth}</span><span>${t.taughtTotal}</span><span>${t.freeSlots}</span></button>`).join('')}</div>` : '<p class="muted">Aún no hay profesores. Créalos en la pestaña Profesores.</p>'}</div>`;
    $$('[data-go]').forEach(x => x.onclick = () => { const [t, f] = x.dataset.go.split(':'); if (f) LST.students.filter._plan = f; go(t); });
    $$('[data-st]').forEach(x => x.onclick = () => studentDetail(x.dataset.st));
    $$('[data-tc]').forEach(x => x.onclick = () => teacherDetail(x.dataset.tc));
  }

  /* ======================= LISTAS GENÉRICAS ======================= */
  const LST = {
    students: { table: 'Estudiantes', page: 0, q: '', filter: { _plan: '' } },
    enroll: { table: 'Inscripciones', page: 0, q: '', filter: { status: '' } },
    placement: { table: 'Placement', page: 0, q: '', filter: {} },
    recruit: { table: 'Reclutamiento', page: 0, q: '', filter: { status: '' } },
    teachers: { table: 'Profesores', page: 0, q: '', filter: {} },
    classes: { table: 'Clases', page: 0, q: '', filter: { type: '', status: 'scheduled' } },
    groups: { table: 'Grupos', page: 0, q: '', filter: {} },
    requests: { table: 'Solicitudes', page: 0, q: '', filter: { status: 'pendiente' } },
  };
  async function list(k, o) {
    const L = LST[k];
    view().innerHTML = `<div class="ad-lhead"><div><h1>${o.title}</h1>${o.sub ? `<p class="muted">${o.sub}</p>` : ''}</div><div style="display:flex;gap:8px;flex-wrap:wrap">${o.add2 ? `<button class="btn w" id="ad-add2">${o.add2}</button>` : ''}${o.add ? `<button class="btn k" id="ad-add">${o.add}</button>` : ''}</div></div>
      <div class="ad-filters"><input class="inp" id="ad-q" placeholder="🔎 Buscar por nombre, correo, código…" value="${esc(L.q)}">${(o.filters || []).map(f => `<select class="inp" data-f="${f.k}">${f.opts.map(([v, n]) => `<option value="${v}" ${String(L.filter[f.k] || '') === v ? 'selected' : ''}>${n}</option>`).join('')}</select>`).join('')}</div>
      <div id="ad-rows" class="ad-rows"><div class="ad-loading">⏳ Cargando…</div></div><div class="ad-pager" id="ad-pg"></div>`;
    let t = null; $('#ad-q').oninput = e => { clearTimeout(t); t = setTimeout(() => { L.q = e.target.value.trim(); L.page = 0; load(); }, 350); };
    $$('[data-f]').forEach(s => s.onchange = () => { L.filter[s.dataset.f] = s.value; L.page = 0; load(); });
    if (o.add) $('#ad-add').onclick = o.onAdd;
    if (o.add2) $('#ad-add2').onclick = o.onAdd2;
    async function load() {
      const box = $('#ad-rows'); if (!box) return; box.innerHTML = '<div class="ad-loading">⏳ Cargando…</div>';
      const filter = {}; Object.keys(L.filter).forEach(f => { if (L.filter[f]) filter[f] = L.filter[f]; });
      const r = await api('aList', { table: L.table, q: L.q, page: L.page, size: 25, filter, desc: o.desc }); if (!$('#ad-rows')) return;
      if (!r.ok) { box.innerHTML = '<p class="ad-err">No se pudo cargar.</p>'; return; }
      box.innerHTML = r.rows.length ? r.rows.map(o.row).join('') : `<div class="card ad-empty">${o.empty || 'No hay registros.'}</div>`;
      $$('[data-open]', box).forEach(x => x.onclick = (e) => { if (e.target.closest('a,[data-stop]')) return; o.open(x.dataset.open, r.rows.find(y => y.id === x.dataset.open || (!y.id && y.code === x.dataset.open))); });
      if (o.after) o.after(box, r.rows);
      const pages = Math.ceil(r.total / r.size); $('#ad-pg').innerHTML = pages > 1 ? `<button class="btn w sm" id="pp" ${L.page ? '' : 'disabled'}>←</button><span>${L.page + 1} / ${pages} · ${r.total} registros</span><button class="btn w sm" id="pn" ${L.page + 1 < pages ? '' : 'disabled'}>→</button>` : `<span>${r.total} registro${r.total === 1 ? '' : 's'}</span>`;
      if ($('#pp')) { $('#pp').onclick = () => { L.page--; load(); }; $('#pn').onclick = () => { L.page++; load(); }; }
    }
    load(); return load;
  }
  const chip = (txt, cls) => `<i class="ad-chip ${cls || ''}">${txt}</i>`;
  const planChip = (s) => { const st = s._state || {}; const k = st.expired ? 'expired' : (st.pkg || st.eff || s.plan || 'free'); return chip(PLAN[k].join(' '), 'p-' + k); };
  const bar = (pct) => `<span class="ad-bar"><i style="width:${Math.max(0, Math.min(100, +pct || 0))}%"></i></span>`;
  function back(fn, label) { return `<button class="btn w sm ad-back" id="ad-back">← ${label || 'Volver'}</button>`; }
  function wireBack(fn) { const b = $('#ad-back'); if (b) b.onclick = fn; }

  /* ======================= ESTUDIANTES ======================= */
  function students() {
    list('students', { title: '🎓 Estudiantes', sub: 'Progreso, plan, grupo y clases asistidas', add: '＋ Nuevo estudiante', onAdd: newStudent,
      filters: [{ k: '_plan', opts: [['', 'Todos los planes'], ['premium', '👑 Premium (4 y 8 clases)'], ['membership', '🖥️ Plataforma'], ['free', '🎁 Acceso gratuito'], ['renew', '⏰ Vencidos y por vencer'], ['expiring', '⏳ Por vencer (7 días)'], ['expired', '⏰ Vencidos']] }],
      row: s => { const pr = J(s.progress, {}); const mod = s.module ? ({ 1: 'A1', 2: 'A2', 3: 'B2', 4: 'B2+' })[s.module] : ''; const cur = mod && pr[mod] ? pr[mod].pct : 0;
        return `<div class="card ad-row" data-open="${esc(s.code)}"><div class="ad-av">${esc(((s.first || '?')[0] + (s.last || '')[0]).toUpperCase())}</div><div class="grow"><b>${esc(s.first)} ${esc(s.last)}</b> ${planChip(s)}${s.mailBad ? chip('⚠️ correo', 'p-expired') : ''}${s._trial != null ? chip(s._trial > 0 ? '🎁 prueba: ' + s._trial + ' día' + (s._trial > 1 ? 's' : '') : '🔒 prueba terminada', s._trial > 0 ? '' : 'gray') : ''}${s.status && s.status !== 'activo' ? chip(esc(s.status), 'gray') : ''}
          <small>${esc(s.code)} · ${mod ? 'Módulo ' + mod : 'Sin placement'}</small>
          <div class="ad-rowstats">${mod ? `${bar(cur)}<span>${cur}% de su módulo</span>` : ''}<span>✅ ${+s.classesDone || 0} clases de la plataforma</span><span>👩‍🏫 ${s._attended} clases con profe</span><span>🕒 ${s.lastSeen ? fDT(s.lastSeen) : 'nunca'}</span></div></div></div>`; },
      open: (code) => studentDetail(code), empty: 'Aún no hay estudiantes. Crea el primero con “＋ Nuevo estudiante”.' });
  }
  function studentForm(s, isNew) {
    s = s || {};
    return `<div class="ad-form">
      <label>Nombre<input class="inp" name="first" value="${esc(s.first)}" required></label><label>Apellido<input class="inp" name="last" value="${esc(s.last)}"></label>
      <label>Correo<input class="inp" name="email" type="email" value="${esc(s.email)}"></label><label>WhatsApp<input class="inp" name="whatsapp" inputmode="tel" value="${esc(s.whatsapp)}"></label>
      <label>Papá / mamá <small>(solo si es menor de edad)</small><input class="inp" name="guardian" value="${esc(s.guardian)}" placeholder="Nombre del acudiente"></label><label>Segundo correo <small>(el otro padre o madre · recibe los mismos correos)</small><input class="inp" name="email2" type="email" value="${esc(s.email2)}"></label><label>Segundo WhatsApp <small>(el otro padre o madre · opcional)</small><input class="inp" name="whatsapp2" inputmode="tel" value="${esc(s.whatsapp2)}"></label>
      <label class="np-birth" ${isNew || !s.plan || s.plan === 'free' ? 'style="display:none"' : ''}>Fecha de nacimiento<input class="inp" name="birth" type="date" value="${esc(s.birth)}"></label>
      <label>Módulo de su ruta<select class="inp" name="module"><option value="">Que haga la prueba de clasificación</option>${[1, 2, 3, 4].map(n => `<option value="${n}" ${String(s.module) === String(n) ? 'selected' : ''}>Módulo ${n} · ${MODN[n]}</option>`).join('')}</select></label>
      ${isNew ? `<label>Código <small>(vacío = automático)</small><input class="inp" name="code" placeholder="Ej: LAURA-2026" style="text-transform:uppercase"></label>` : `<label>Estado<select class="inp" name="status">${['activo', 'inactivo', 'archivado'].map(x => `<option ${s.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>`}
      <label class="full">Notas internas<textarea class="inp" name="notes" rows="2">${esc(s.notes)}</textarea></label></div>`;
  }
  const formData = (root) => { const o = {}; $$('[name]', root).forEach(i => { o[i.name] = i.type === 'checkbox' ? (i.checked ? 'sí' : 'no') : i.value.trim(); }); return o; };
  function newStudent(prefill) {
    const m = modal(`<h2>＋ Nuevo estudiante</h2>${studentForm(prefill || {}, true)}
      <label class="ad-lab">Plan inicial</label><div class="ad-plans">${['free', 'membership', 'premium', 'premium8'].map((k, i) => `<label class="ad-pl"><input type="radio" name="_plan" value="${k}" ${i ? '' : 'checked'}><span>${PLAN[k].join(' ')}</span></label>`).join('')}</div>
      <div class="ad-form" id="np-m" style="display:none"><label>Meses<select class="inp" id="np-mo">${[1, 2, 3, 6, 12].map(n => `<option>${n}</option>`).join('')}</select></label><label>Valor pagado<input class="inp" id="np-amt" inputmode="numeric" placeholder="Automático"></label></div>
      <label class="ad-pl" style="margin:12px 0"><input type="checkbox" id="np-send" checked><span>📩 Enviarle sus datos de acceso (código y enlace) por <b>correo</b> y <b>WhatsApp</b></span></label>
      <button class="btn k block lg" id="np-ok">Crear estudiante</button>`);
    $$('[name=_plan]', m).forEach(r => r.onchange = () => { const pl = $('[name=_plan]:checked', m).value; $('#np-m', m).style.display = pl === 'free' ? 'none' : ''; $('.np-birth', m).style.display = pl === 'free' ? 'none' : ''; if (pl === 'free') $('[name=birth]', m).value = ''; });
    $('#np-ok', m).onclick = async () => {
      const d = formData($('.ad-form', m)); delete d._plan; if (!d.first) return toast('Escribe el nombre');
      const plan = $('[name=_plan]:checked', m).value; const send = $('#np-send', m).checked;
      if (send && !d.email && !d.whatsapp) return toast('Escribe el correo o el WhatsApp para enviarle sus datos');
      const w = send && d.whatsapp ? window.open('', '_blank') : null; // se abre ya (si no, el navegador lo bloquea) y luego carga WhatsApp
      if (w) w.document.write('<p style="font:18px sans-serif;text-align:center;margin-top:40px">⏳ Preparando el mensaje de WhatsApp…</p>');
      $('#np-ok', m).disabled = true; $('#np-ok', m).textContent = 'Creando…';
      const r = await api('aSave', { table: 'Estudiantes', row: Object.assign(d, { code: d.code ? d.code.toUpperCase() : '', source: 'admin' }) });
      if (!r.ok) { if (w) w.close(); $('#np-ok', m).disabled = false; $('#np-ok', m).textContent = 'Crear estudiante'; return toast(r.err === 'dup_student' ? `⚠️ Esa persona ya existe: ${r.name} (${r.code}). El acceso gratuito es una sola vez por persona.` : r.err === 'code_exists' ? '⚠️ Ese código ya está en uso por otro estudiante o profe. Escribe otro.' : 'No se pudo crear'); }
      if (plan !== 'free') await api('aPlan', { code: r.row.code, plan, months: +$('#np-mo', m).value, amount: $('#np-amt', m).value.replace(/\D/g, '') || undefined });
      m.remove(); if (TAB === 'students') students();
      if (!send) return shareCode(r.row);
      const s2 = r.row; let mailed = false;
      if (s2.email) { const rw = await api('aWelcome', { code: s2.code }); mailed = !!(rw && rw.ok && rw.mailed); }
      s2.plan = plan; if (w) w.location.href = waLink(s2.whatsapp, accessMsg(s2));
      modal(`<div class="center"><div style="font-size:44px">✅</div><h2>${esc(s2.first)} ya tiene su acceso</h2><div class="ad-code">${esc(s2.code)}</div>
        <p>${s2.email ? (mailed ? '📧 Se le envió el correo con su código y el enlace a <b>' + esc(s2.email) + '</b>.' : '⚠️ No se pudo enviar el correo. Revisa la dirección.') : '📧 Sin correo registrado.'}</p>
        <p>${s2.whatsapp ? '💬 Se abrió WhatsApp con el mensaje listo: solo dale <b>Enviar</b>.' + ` <a href="${waLink(s2.whatsapp, accessMsg(s2))}" target="_blank" rel="noopener">Abrir otra vez</a>` : '💬 Sin WhatsApp registrado.'}</p></div>`);
    };
  }
  // sin emojis: WhatsApp Web los muestra como signos negros (�) cuando llegan por enlace
  const gFirst = (s) => String(s.guardian || '').trim().split(/\s+/)[0]; // 👨‍👩‍👧 estudiante menor: el WhatsApp es del papá o la mamá
  const POLICY = '\n\n*Importante:* las clases individuales no son acumulables. Resérvalas durante el periodo mensual; las que no se usen antes del vencimiento se vencen y no se recuperan.\n\n*POLÍTICA DE RESERVAS Y CANCELACIONES*\nLas clases se reservan solo en la plataforma, desde el día siguiente y hasta con 5 días de anticipación. Cancelación sin penalización mínimo 12 horas antes. Cancelación tardía o inasistencia: la clase se descuenta del plan y no será repuesta.';
  const isFree = (s) => !s.plan || s.plan === 'free';
  const accessMsg = (s) => (s.guardian
    ? `¡Hola ${gFirst(s)}! ${s.first} ya tiene su acceso a la plataforma de mrarrieta.com.\n\n*Código de acceso de ${s.first}:* ${s.code}\n*Entra aquí:* ${BASE}\n\n${s.first} escribe su código en la plataforma y empieza a aprender. Ustedes pueden revisar su avance desde ahí mismo.${isFree(s) ? `\n\nDurante sus *${s.trial2 ? '2 días más' : '3 días'} de prueba gratis*, ${s.first} va a aprender inglés HABLANDO desde el primer día: la plataforma escucha su pronunciación y le ayuda a corregirla al instante.\n\n🎁 Al terminar la prueba tienen *10% de descuento* en el primer mes si se inscriben en las 24 horas siguientes. ¡Es el mejor momento para que ${s.first} siga avanzando!` : ''}`
    : `¡Hola ${s.first}! Bienvenido(a) a la plataforma de mrarrieta.com.\n\n*Tu código de acceso:* ${s.code}\n*Entra aquí:* ${BASE}\n\nEscribe tu código en la plataforma y empieza a aprender.${isFree(s) ? `\n\nDurante tus *${s.trial2 ? '2 días más' : '3 días'} de prueba gratis* vas a aprender inglés HABLANDO: la plataforma te escucha, te corrige y te pone a hablar desde el primer día.\n\n🎁 Al terminar la prueba tienes *10% de descuento* en tu primer mes si te inscribes en las 24 horas siguientes. ¡Es el mejor momento para seguir avanzando!` : ''}`) + (/^premium/.test(s.plan) ? POLICY : '');
  const accessMsg2 = (s) => accessMsg(s).replace('¡Hola ' + gFirst(s) + '!', '¡Hola!'); // para el otro padre o madre
  const hiMsg2 = (s) => `Hola, te escribimos de mrarrieta.com sobre ${s.first}.`;
  const hiMsg = (s) => s.guardian ? `Hola ${gFirst(s)}, te escribimos de mrarrieta.com sobre ${s.first}.` : 'Hola ' + s.first + '.';
  function shareCode(s) {
    const msg = accessMsg(s);
    const m = modal(`<div class="center"><div style="font-size:44px">🔑</div><h2>Código de ${esc(s.first)}</h2><div class="ad-code">${esc(s.code)}</div><p class="muted">${s.guardian ? 'Se envía al WhatsApp de ' + esc(s.guardian) + ' (papá/mamá).' : 'Envíaselo por WhatsApp o cópialo.'}</p>
      <textarea class="inp" rows="6" readonly>${esc(msg)}</textarea><div class="row" style="justify-content:center;margin-top:10px"><button class="btn w" id="sc-c">📋 Copiar mensaje</button>${s.whatsapp ? `<a class="btn ad-wa" target="_blank" rel="noopener" href="${waLink(s.whatsapp, msg)}">💬 Enviar por WhatsApp${s.whatsapp2 ? ' · ' + esc(gFirst(s) || 'papá/mamá') : ''}</a>` : ''}${s.whatsapp2 ? `<a class="btn ad-wa" target="_blank" rel="noopener" href="${waLink(s.whatsapp2, accessMsg2(s))}">💬 Enviar al otro padre/madre</a>` : ''}</div></div>`);
    $('#sc-c', m).onclick = () => copy(msg);
  }
  async function studentDetail(code) {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando estudiante…</div>'; window.scrollTo(0, 0);
    const r = await api('aGet', { table: 'Estudiantes', id: code }); if (!r.ok) return view().innerHTML = `${back()}<p class="ad-err">No se encontró.</p>`, wireBack(() => go('students'));
    const s = r.row, st = r.state, pr = J(s.progress, {}); const k = st.expired ? 'expired' : (st.pkg || st.eff);
    view().innerHTML = `${back()}
      <div class="card ad-dhead"><div class="ad-av lg">${esc(((s.first || '?')[0] + (s.last || '')[0]).toUpperCase())}</div><div class="grow"><h1>${esc(s.first)} ${esc(s.last)}</h1>
        <p>${chip(PLAN[k].join(' '), 'p-' + k)} <button class="ad-codebtn" id="d-code" title="Copiar">${esc(s.code)} 📋</button></p>
        <p class="muted">${s.email ? '📧 ' + esc(s.email) + ' ' + (s.mailBad ? chip('⚠️ Correo con problemas', 'p-expired') : s.mailOk ? chip('✅ Correo confirmado', '') : chip('⏳ Sin confirmar', 'gray')) : ''} ${s.whatsapp ? ' · 📱 ' + esc(s.whatsapp) : ''} ${s.birth ? ' · 🎂 ' + fD(s.birth, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p></div>
        ${s.email && !s.mailOk ? `<p class="ad-mailbox">${s.mailBad ? 'Este correo <b>rebotó</b>: no recibe mensajes. Corrígelo en <b>Datos del estudiante</b> (abajo) y guarda.' : 'El estudiante aún no ha tocado «Confirmar mi correo».'} <button class="btn w sm" id="d-mc">✉️ Enviar confirmación</button><button class="btn w sm" id="d-mok">✅ Marcar como verificado</button></p>` : ''}
        <div class="ad-dact">${s.whatsapp ? `<a class="btn ad-wa sm" target="_blank" rel="noopener" href="${waLink(s.whatsapp, hiMsg(s))}">💬 WhatsApp${s.guardian ? ' (papá/mamá)' : ''}</a>` : ''}${s.whatsapp2 ? `<a class="btn ad-wa sm" target="_blank" rel="noopener" href="${waLink(s.whatsapp2, hiMsg2(s))}">💬 WhatsApp (otro padre/madre)</a>` : ''}<button class="btn w sm" id="d-share">🔑 Enviar código</button><button class="btn w sm" id="d-rst">♻️ Reiniciar progreso</button><button class="btn w sm ad-del" id="d-del">🗑️ Borrar</button></div></div>
      <div class="card ad-plan"><h3>💎 Plan</h3>
        <p>${st.eff === 'free' && !st.expired ? 'Acceso gratuito: prueba de clasificación + los 2 primeros temas.' : `${PLAN[s.plan] ? PLAN[s.plan].join(' ') : ''} · desde ${fD(s.planStart)} hasta <b>${fD(s.planEnd)}</b> ${st.expired ? chip('VENCIDO', 'p-expired') : st.daysLeft !== null ? chip(st.daysLeft + ' días restantes', st.daysLeft <= 5 ? 'p-expired' : 'gray') : ''}`}</p>
        ${r.trial != null ? `<p class="ad-t2">${r.trial > 0 ? '🎁 Acceso gratuito activo: ' + r.trial + ' día' + (r.trial > 1 ? 's' : '') + ' restante' + (r.trial > 1 ? 's' : '') + (s.trial2 ? ' (segundo acceso)' : '') : s.trial2 ? '🔒 Ya usó su segundo acceso gratuito (' + fD(s.trial2) + ').' : `🔒 Su acceso gratuito terminó. <button class="btn k sm" id="d-t2">🎁 Reactivar acceso gratuito · 2 días</button>`}</p>` : ''}
        <div class="ad-planbtns"><button class="btn w" data-plan="membership">🖥️ Plataforma</button><button class="btn k" data-plan="premium">👑 Premium · 4</button><button class="btn k" data-plan="premium8">💎 Premium · 8</button>${s.plan !== 'free' ? `<button class="btn w" data-plan="${esc(s.plan)}" data-renew="1">🔁 Renovar ${esc(PLAN[s.plan][1])}</button><button class="btn w" data-plan="free">🟢 Pasar a gratuito</button>` : ''}</div>
        ${st.eff === 'premium' && r.credits ? `<div class="ad-cred"><span>🎯 Clases individuales: <b>${r.credits.vipUsed}/${r.credits.vipTotal}</b> usadas${r.credits.vipBonus ? ' (incluye ' + r.credits.vipBonus + ' adicionales)' : ''}</span><span>Ciclo: ${fD(r.credits.cycleStart)} → ${fD(r.credits.cycleEnd)}</span></div>` : ''}
        ${(r.plans || []).length ? `<details><summary>Historial de pagos/planes (${r.plans.length})</summary><div class="ad-mini">${r.plans.map(p => `<div class="ad-mrow"><b>${PLAN[p.plan] ? PLAN[p.plan].join(' ') : esc(p.plan)} · ${esc(p.months || 0)} mes(es) · ${money(p.amount)}</b><span>${fDT(p.date)} · ${fD(p.start)} → ${fD(p.end)}${p.note ? ' · ' + esc(p.note) : ''}</span></div>`).join('')}</div></details>` : ''}</div>
      <div class="card"><h3>🧭 Progreso en su ruta</h3><p class="muted">Módulo actual: <b>${s.module ? 'Módulo ' + s.module + ' · ' + MODN[s.module] : 'aún sin placement'}</b>${window.MRGOAL ? ' · 🧭 Objetivo: ' + MRGOAL.chip(J(s.goal, null)) : ''}${s.moduleBy ? ' (' + (s.moduleBy === 'admin' ? 'asignado por administración' : 'por prueba de clasificación') + ')' : ''} · ✅ ${+s.classesDone || 0} clases · ⚡ ${+s.xp || 0} XP · 🕒 última conexión ${s.lastSeen ? fDT(s.lastSeen) : 'nunca'}</p>
        <div class="ad-mods">${['A1', 'A2', 'B2', 'B2+'].map(id => { const x = pr[id] || { done: 0, total: 0, pct: 0 }; return `<div class="ad-mod${x.passed ? ' ok' : ''}"><b>${id === 'B2' ? 'B1' : id}</b>${bar(x.pct)}<span>${x.done}/${x.total || '—'} clases · ${x.pct || 0}%${x.passed ? ' · 🎓 aprobado' : ''}</span></div>`; }).join('')}</div>
        ${(r.placements || []).length ? `<h4>📝 Exámenes de clasificación</h4><div class="ad-mini">${r.placements.map(p => `<button class="ad-mrow" data-pl="${esc(p.id)}"><b>${esc(p.level || ('Módulo ' + p.module))} · nota ${esc(p.final)}</b><span>${fDT(p.date)} · ▶ ver y escuchar audios</span></button>`).join('')}</div>` : ''}</div>
      <div class="card"><h3>👩‍🏫 Clases con profesores · ${r.classes.filter(c => c.attended).length} asistidas</h3>${r.classes.length ? `<div class="ad-mini">${r.classes.map(c => `<div class="ad-mrow"><b>${c.type === 'vip' ? '🎯 Individual' : c.type === 'club' ? '🎙️ Club' : '👥 Grupal'} · ${fD(c.date)} ${fT(c.time)} · ${esc(c.teacher)}</b><span>${c.status === 'done' ? (c.attended ? '✅ asistió' : '❌ no asistió') : c.status === 'scheduled' ? '📅 programada' : c.status === 'cancelled' ? 'cancelada' : '❌ no asistió'}</span></div>`).join('')}</div>` : '<p class="muted">Sin clases todavía.</p>'}
        ${(r.requests || []).length ? `<h4>🔁 Solicitudes</h4><div class="ad-mini">${r.requests.map(q => `<div class="ad-mrow"><b>${esc(q.preferred)}</b><span>${fDT(q.date)} · ${esc(q.status)}</span></div>`).join('')}</div>` : ''}</div>
      <div class="card"><h3>✏️ Datos del estudiante</h3>${studentForm(s, false)}<button class="btn k" id="d-save">💾 Guardar cambios</button></div>`;
    wireBack(() => go('students'));
    $('#d-code').onclick = () => copy(s.code);
    if ($('#d-mc')) $('#d-mc').onclick = async () => { const x = await api('aMail', { code: s.code, op: 'send' }); toast(x.ok ? '✉️ Enviado a ' + s.email + '. Cuando toque el botón, aparecerá ✅ Correo confirmado.' : 'No se pudo enviar'); };
    if ($('#d-mok')) $('#d-mok').onclick = async () => { const x = await api('aMail', { code: s.code, op: 'ok' }); if (x.ok) { toast('✅ Correo marcado como verificado'); studentDetail(s.code); } }; $('#d-share').onclick = () => shareCode(s); $('#d-rst').onclick = () => { const m = modal(`<div class="center"><div style="font-size:44px">♻️</div><h2>¿Reiniciar el progreso de ${esc(s.first)}?</h2><p class="muted">Se borran sus clases completadas, puntos y resultado de la prueba de clasificación. Su código y su plan se conservan. Al volver a entrar empezará desde cero.</p><div class="row" style="justify-content:center"><button class="btn w" id="rs-n">Cancelar</button><button class="btn k" id="rs-y">♻️ Sí, reiniciar</button></div></div>`);
      $('#rs-n', m).onclick = () => m.remove(); $('#rs-y', m).onclick = async () => { $('#rs-y', m).disabled = true; const r = await api('aReset', { code: s.code }); m.remove(); if (r.ok) { toast('♻️ Progreso reiniciado'); studentDetail(s.code); } else toast('No se pudo reiniciar'); }; };
    $('#d-del').onclick = () => delAsk('Estudiantes', s.code, (s.first + ' ' + s.last).trim(), 'Se borra su código y sus datos. Ya no podrá entrar a la plataforma.', () => go('students'));
    $$('[data-pl]').forEach(x => x.onclick = () => placementDetail(x.dataset.pl, () => studentDetail(code)));
    $$('[data-plan]').forEach(b => b.onclick = () => planModal(s, b.dataset.plan, !!b.dataset.renew));
    if ($('#d-t2')) $('#d-t2').onclick = () => { const m = modal(`<div class="center"><div style="font-size:44px">🎁</div><h2>¿Dar 2 días más gratis a ${esc(s.first)}?</h2><p class="muted">Entra con el mismo código (${esc(s.code)}). Le llega un correo con sus datos y la duración (2 días). Solo se puede dar una vez.</p><div class="row" style="justify-content:center"><button class="btn w" id="t2-n">Cancelar</button><button class="btn k" id="t2-y">✅ Sí, activar</button></div></div>`);
      $('#t2-n', m).onclick = () => m.remove(); $('#t2-y', m).onclick = async () => { $('#t2-y', m).disabled = true; const x = await api('aTrial2', { code: s.code }); m.remove(); if (x.ok) { const s2 = Object.assign({}, s, { trial2: new Date().toISOString().slice(0, 10) }); studentDetail(s.code);
        const m2 = modal(`<div class="center"><div style="font-size:44px">✅</div><h2>Acceso gratuito reactivado</h2><p class="muted">${x.mailed ? '📧 Ya le llegó el correo con su código y la duración (2 días).' : '⚠️ No tiene correo registrado o no se pudo enviar.'}</p>${s.whatsapp ? `<a class="btn k" id="t2-wa" target="_blank" rel="noopener" href="${waLink(s.whatsapp, accessMsg(s2))}">📲 Enviar credenciales por WhatsApp</a>` : '<p class="muted">No tiene WhatsApp registrado.</p>'}<p><button class="btn w sm" id="t2-ok">Listo</button></p></div>`);
        $('#t2-ok', m2).onclick = () => m2.remove(); if ($('#t2-wa', m2)) $('#t2-wa', m2).addEventListener('click', () => setTimeout(() => m2.remove(), 400)); } else toast(x.err || 'No se pudo activar'); }; };
    $('#d-save').onclick = async () => { const d = formData($('.ad-form', view())); const b = $('#d-save'); b.disabled = true;
      const res = await api('aSave', { table: 'Estudiantes', row: Object.assign(d, { code: s.code }) }); b.disabled = false; if (res.ok) { toast('✅ Guardado'); studentDetail(code); } else toast('No se pudo guardar'); };
  }
  function planModal(s, plan, renew) {
    const free = plan === 'free';
    const m = modal(`<h2>${free ? '🟢 Pasar a acceso gratuito' : (renew ? '🔁 Renovar ' : 'Activar ') + PLAN[plan].join(' ')}</h2>
      <p class="muted">${esc(s.first)} ${esc(s.last)} · ${esc(s.code)}</p>
      ${free ? '<p>El estudiante conservará su progreso, pero solo tendrá abiertos los 2 primeros temas.</p>' : `<div class="ad-form"><label>Meses<select class="inp" id="pm-m">${[1, 2, 3, 6, 12].map(n => `<option>${n}</option>`).join('')}</select></label>
        <label>Valor pagado (COP)<input class="inp" id="pm-a" inputmode="numeric" value="${PRICE[plan]}"></label>
        <label>Fecha de vencimiento <small>(opcional, manual)</small><input class="inp" id="pm-e" type="date"></label><label>Nota<input class="inp" id="pm-n" placeholder="Ej: transferencia Bancolombia 11 oct"></label></div>
        <label class="ad-chk"><input type="checkbox" id="pm-mail" checked> Enviarle correo de confirmación</label>
        <p class="muted" id="pm-info"></p>`}
      <button class="btn k block lg" id="pm-ok">${free ? 'Confirmar' : '✅ Activar plan'}</button>`);
    if (!free) { const upd = () => { const mo = +$('#pm-m', m).value; $('#pm-a', m).value = PRICE[plan] * mo; $('#pm-info', m).textContent = renew || s.plan === plan ? 'Si el plan sigue activo, los meses se suman a la fecha actual de vencimiento.' : 'El plan empieza hoy.'; }; $('#pm-m', m).onchange = upd; upd(); }
    $('#pm-ok', m).onclick = async () => { $('#pm-ok', m).disabled = true;
      const r = await api('aPlan', free ? { code: s.code, plan: 'free' } : { code: s.code, plan, months: +$('#pm-m', m).value, amount: $('#pm-a', m).value.replace(/\D/g, ''), end: $('#pm-e', m).value || undefined, note: $('#pm-n', m).value, notify: $('#pm-mail', m).checked });
      m.remove(); if (r.ok) { toast(free ? 'Listo' : `✅ ${PLAN[plan][1]} activo hasta ${fD(r.row.planEnd)}`); studentDetail(s.code); } else toast('No se pudo actualizar el plan'); };
  }

  /* ======================= INSCRIPCIONES ======================= */
  const ENR_ST = [['nuevo', '🆕 Nuevo'], ['pagada', '💳 Pagada'], ['contactado', '📞 Contactado'], ['inscrito', '✅ Inscrito'], ['descartado', '🗑 Descartado']];
  const planName = (k) => ({ free: '🎁 Acceso gratuito', membership: '🖥️ Plataforma', premium: '👑 Premium · 4 clases', premium8: '💎 Premium · 8 clases' }[k] || k || '—');
  function enroll() {
    list('enroll', { title: '📝 Inscripciones', sub: `Solo aparecen las inscripciones con el pago aprobado · Formulario: ${BASE}inscripcion.html`,
      filters: [{ k: 'status', opts: [['', 'Todos los estados']].concat(ENR_ST) }],
      row: x => `<div class="card ad-row" data-open="${esc(x.id)}"><div class="ad-av">${esc((x.first || '?')[0].toUpperCase())}</div><div class="grow"><b>${esc(x.first)} ${esc(x.last)}</b> ${chip((ENR_ST.find(s => s[0] === x.status) || ['', x.status])[1], 'st-' + x.status)}
        <small>${planName(x.plan)} · ${fDT(x.date)}</small><div class="ad-rowstats"><span>📧 ${esc(x.email)}</span><span>📱 ${esc(x.whatsapp)}</span>${x.code ? `<span>🔑 ${esc(x.code)}</span>` : ''}</div></div></div>`,
      open: (id, x) => enrollDetail(x), empty: 'Aún no hay inscripciones. Comparte el formulario de inscripción.' });
  }
  function enrollDetail(x) {
    view().innerHTML = `${back()}<div class="card ad-dhead"><div class="ad-av lg">${esc((x.first || '?')[0].toUpperCase())}</div><div class="grow"><h1>${esc(x.first)} ${esc(x.last)}</h1><p>${planName(x.plan)} · ${fDT(x.date)}</p></div>
      <div class="ad-dact">${x.whatsapp ? `<a class="btn ad-wa sm" target="_blank" rel="noopener" href="${waLink(x.whatsapp, '¡Hola ' + x.first + '! Te escribimos de mrarrieta.com por tu inscripción.')}">💬 WhatsApp</a>` : ''}</div></div>
      <div class="card"><div class="ad-kv">${[['Correo', x.email], ['WhatsApp', x.whatsapp], ['Fecha de nacimiento', x.birth ? fD(x.birth, { day: 'numeric', month: 'long', year: 'numeric' }) : ''], ['Ciudad / país', x.city], ['Plan de interés', planName(x.plan)], ['Nivel aproximado', x.level], ['Horario preferido', [x.schedule, x.days].filter(Boolean).join(' · ')], ['Medio de pago', x.payment], ['¿Cómo nos conoció?', x.source], ['Comentarios', x.comments]].map(([k, v]) => `<span>${k}</span><b>${esc(v || '—')}</b>`).join('')}</div></div>
      <div class="card"><h3>Acceso a la plataforma</h3>${x.code ? `<p>✅ Ya tiene código: <button class="ad-codebtn" id="e-open">${esc(x.code)} → ver estudiante</button></p>` : `<p class="muted">Crea su estudiante con un clic: se genera su código, queda con <b>Acceso gratuito</b> y le llega un correo con el código. Si ya pagó, actívale el plan desde su ficha.</p><button class="btn k lg" id="e-conv">🔑 Crear acceso (código)</button>`}</div>
      <div class="card"><h3>Seguimiento</h3><div class="ad-form"><label>Estado<select class="inp" id="e-st">${ENR_ST.map(([v, n]) => `<option value="${v}" ${x.status === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="full">Notas<textarea class="inp" id="e-n" rows="2">${esc(x.notes)}</textarea></label></div><button class="btn w" id="e-sv">💾 Guardar</button></div>`;
    wireBack(() => go('enroll'));
    if ($('#e-open')) $('#e-open').onclick = () => studentDetail(x.code);
    if ($('#e-conv')) $('#e-conv').onclick = async () => { $('#e-conv').disabled = true; $('#e-conv').textContent = 'Creando…'; const r = await api('aConvert', { id: x.id }); if (r.ok) { x.code = r.code; x.status = 'inscrito'; toast('✅ Acceso creado: ' + r.code); shareCode({ code: r.code, first: x.first, whatsapp: x.whatsapp }); enrollDetail(x); } else { toast('No se pudo crear'); $('#e-conv').disabled = false; } };
    $('#e-sv').onclick = async () => { const r = await api('aStatus', { table: 'Inscripciones', id: x.id, status: $('#e-st').value, notes: $('#e-n').value }); if (r.ok) { x.status = $('#e-st').value; x.notes = $('#e-n').value; toast('✅ Guardado'); } };
  }

  /* ======================= ARCHIVOS / AUDIOS ======================= */
  async function fileBlobUrl(id) { const r = await api('aFile', { id }); if (!r.ok) return null; if (r.big || !r.b64) return { drive: r.url }; const bin = atob(r.b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return { url: URL.createObjectURL(new Blob([u8], { type: r.mime })), drive: r.url, name: r.name, mime: r.mime }; }
  function audioList(files, answers) {
    const ans = J(answers, []);
    const fl = J(files, []).filter(f => /audio|webm/.test(f.mime || ''));
    if (!fl.length && !ans.length) return '<p class="muted">Sin grabaciones.</p>';
    const rows = fl.length ? fl : ans;
    return `<div class="ad-audios">${rows.sort((a, b) => (+a.i || 0) - (+b.i || 0)).map(f => { const a = ans.find(x => +x.i === +f.i) || {}; return `<div class="ad-au"><div class="ad-au-h"><b>🎤 Pregunta ${esc(f.i || '')}</b><small>${esc(f.label || a.task || '')}</small></div>
      ${(f.transcript || a.transcript) ? `<p class="ad-tr">“${esc(f.transcript || a.transcript)}”</p>` : ''}${f.fileId ? `<div class="ad-au-p" data-f="${esc(f.fileId)}"><button class="btn w sm">▶ Escuchar</button><a class="ad-drive" target="_blank" rel="noopener" href="https://drive.google.com/file/d/${esc(f.fileId)}/view">Abrir en Drive</a></div>` : '<small class="muted">(audio no subido)</small>'}</div>`; }).join('')}</div>`;
  }
  function wireAudios(root) {
    $$('.ad-au-p', root).forEach(p => { const b = $('button', p); b.onclick = async () => { b.disabled = true; b.textContent = '⏳ Cargando…'; const f = await fileBlobUrl(p.dataset.f);
      if (!f) { b.disabled = false; b.textContent = '▶ Reintentar'; return toast('No se pudo cargar el audio'); }
      if (!f.url) { window.open(f.drive, '_blank'); b.disabled = false; b.textContent = '▶ Escuchar'; return; }
      const au = document.createElement('audio'); au.controls = true; au.src = f.url; au.className = 'ad-player'; b.replaceWith(au); au.play().catch(() => { }); }; });
  }

  /* ======================= PLACEMENT ======================= */
  function placement() {
    list('placement', { title: '🧭 Prueba de clasificación', sub: 'Resultados y audios de Speaking',
      row: x => `<div class="card ad-row" data-open="${esc(x.id)}"><div class="ad-av">${esc((x.name || '?')[0].toUpperCase())}</div><div class="grow"><b>${esc(x.name)}</b> ${chip(esc(x.level || ('Módulo ' + x.module)), 'p-membership')}
        <small>${fDT(x.date)} · ${esc(x.attempt)} ${x.code ? '· 🔑 ' + esc(x.code) : ''}</small><div class="ad-rowstats"><span>🎧 ${esc(x.listening)}</span><span>📖 ${esc(x.reading)}</span><span>✍️ ${esc(x.writing)}</span><span>🎤 ${esc(x.speaking)}</span><span><b>Nota ${esc(x.final)}</b></span><span>🔊 ${J(x.files, []).length} audios</span></div></div></div>`,
      open: (id) => placementDetail(id, () => go('placement')), empty: 'Aún nadie ha tomado la prueba de clasificación con la nube activa.' });
  }
  async function placementDetail(id, onBack) {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando…</div>'; window.scrollTo(0, 0);
    const r = await api('aGet', { table: 'Placement', id }); if (!r.ok) return; const x = r.row; const mods = J(x.mods, {});
    view().innerHTML = `${back()}<div class="card ad-dhead"><div class="ad-av lg">${esc((x.name || '?')[0].toUpperCase())}</div><div class="grow"><h1>${esc(x.name)}</h1><p>${chip(esc(x.level || ''), 'p-membership')} ${x.timedOut ? chip('⏱ se acabó el tiempo', 'gray') : ''}</p><p class="muted">${fDT(x.date)} · ${esc(x.attempt)} · ${esc(x.email)} ${x.whatsapp ? '· ' + esc(x.whatsapp) : ''}</p></div>
      <div class="ad-dact">${x.code ? `<button class="btn w sm" id="p-st">🎓 Ver estudiante</button>` : ''}${x.whatsapp ? `<a class="btn ad-wa sm" target="_blank" rel="noopener" href="${waLink(x.whatsapp, 'Hola ' + x.name + ' 👋')}">💬</a>` : ''}</div></div>
      <div class="card"><h3>Resultados</h3><div class="ad-scores">${[['🎧 Listening', x.listening], ['📖 Reading', x.reading], ['✍️ Writing', x.writing], ['🎤 Speaking', x.speaking], ['⭐ Nota final', x.final]].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b>${bar(+v * 10)}</div>`).join('')}</div>
        <h4>Dominio por módulo</h4><div class="ad-mods">${[1, 2, 3, 4].map(n => `<div class="ad-mod${+x.module === n ? ' ok' : ''}"><b>${MODN[n]}</b>${bar(mods[n])}<span>${mods[n] != null ? mods[n] + '%' : '—'}${+x.module === n ? ' · 📍 empieza aquí' : ''}</span></div>`).join('')}</div></div>
      <div class="card"><h3>🎤 Grabaciones de Speaking</h3>${audioList(x.files, x.speakingAnswers)}</div>`;
    wireBack(onBack); wireAudios(view()); if ($('#p-st')) $('#p-st').onclick = () => studentDetail(x.code);
  }

  /* ======================= RECLUTAMIENTO ======================= */
  const REC_ST = [['nuevo', '🆕 Nuevo'], ['entrevista', '📞 Entrevista'], ['contratado', '✅ Contratado'], ['descartado', '🗑 Descartado']];
  function recruit() {
    list('recruit', { title: '👩‍🏫 Proceso de selección', sub: `Formulario para candidatos: ${BASE}reclutamiento.html`,
      filters: [{ k: 'status', opts: [['', 'Todos los estados']].concat(REC_ST) }, { k: 'passed', opts: [['', 'Aprobados y no aprobados'], ['sí', '✅ Aprobados'], ['no', '❌ No aprobados']] }],
      row: x => `<div class="card ad-row" data-open="${esc(x.id)}"><div class="ad-av">${esc((x.name || '?')[0].toUpperCase())}</div><div class="grow"><b>${esc(x.name)}</b> ${chip(x.passed === 'sí' ? '✅ Aprobó' : '❌ No aprobó', x.passed === 'sí' ? 'p-premium' : 'p-expired')} ${chip((REC_ST.find(s => s[0] === x.status) || ['', x.status])[1], 'st-' + x.status)}
        <small>${fDT(x.date)} · ${esc(x.city)} · ${esc(x.experience)}</small><div class="ad-rowstats"><span>🎧 ${esc(x.listening)}</span><span>📖 ${esc(x.reading)}</span><span>✍️ ${esc(x.writing)}</span><span>🎤 ${esc(x.speaking)}</span><span><b>Final ${esc(x.final)}</b></span><span>${J(x.cv, null) ? '📄 CV' : 'sin CV'}</span></div></div></div>`,
      open: (id) => recruitDetail(id), empty: 'Aún no hay candidatos. Comparte el enlace del proceso de selección.' });
  }
  async function recruitDetail(id) {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando…</div>'; window.scrollTo(0, 0);
    const r = await api('aGet', { table: 'Reclutamiento', id }); if (!r.ok) return; const x = r.row; const cv = J(x.cv, null);
    view().innerHTML = `${back()}<div class="card ad-dhead"><div class="ad-av lg">${esc((x.name || '?')[0].toUpperCase())}</div><div class="grow"><h1>${esc(x.name)}</h1><p>${chip(x.passed === 'sí' ? '✅ APROBÓ' : '❌ NO APROBÓ', x.passed === 'sí' ? 'p-premium' : 'p-expired')} · nota final <b>${esc(x.final)}</b></p><p class="muted">${fDT(x.date)} · 📧 ${esc(x.email)} · 📱 ${esc(x.whatsapp)}</p></div>
      <div class="ad-dact">${x.whatsapp ? `<a class="btn ad-wa sm" target="_blank" rel="noopener" href="${waLink(x.whatsapp, 'Hola ' + x.name + '. Te escribimos de mrarrieta.com por tu proceso de selección.')}">💬 WhatsApp</a>` : ''}</div></div>
      <div class="card"><div class="ad-kv">${[['Ciudad / país', x.city], ['Experiencia', x.experience], ['Disponibilidad', x.availability], ['Sobre el candidato', x.about]].map(([k, v]) => `<span>${k}</span><b>${esc(v || '—')}</b>`).join('')}</div>
        <h4>📄 Hoja de vida</h4>${cv ? `<div class="row"><button class="btn w" id="r-cv">⬇️ Descargar ${esc(cv.name)}</button><a class="btn w" target="_blank" rel="noopener" href="https://drive.google.com/file/d/${esc(cv.fileId)}/view">Abrir en Drive</a></div>` : '<p class="muted">No adjuntó hoja de vida.</p>'}</div>
      <div class="card"><h3>Resultados de la prueba</h3><div class="ad-scores">${[['🎧 Listening', x.listening], ['📖 Reading', x.reading], ['✍️ Writing', x.writing], ['🎤 Speaking', x.speaking], ['⭐ Final', x.final]].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b>${bar(+v * 10)}</div>`).join('')}</div></div>
      <div class="card"><h3>🎤 Grabaciones de Speaking</h3>${audioList(x.files, x.speakingAnswers)}</div>
      <div class="card"><h3>Seguimiento</h3><div class="ad-form"><label>Estado<select class="inp" id="r-st">${REC_ST.map(([v, n]) => `<option value="${v}" ${x.status === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="full">Notas<textarea class="inp" id="r-n" rows="2">${esc(x.notes)}</textarea></label></div>
        <div class="row"><button class="btn w" id="r-sv">💾 Guardar</button><button class="btn k" id="r-hire">🧑‍🏫 Crear como profesor</button></div></div>`;
    wireBack(() => go('recruit')); wireAudios(view());
    if ($('#r-cv')) $('#r-cv').onclick = async () => { const f = await fileBlobUrl(cv.fileId); if (!f) return toast('No se pudo descargar'); if (!f.url) return window.open(f.drive, '_blank'); const a = document.createElement('a'); a.href = f.url; a.download = cv.name || 'hoja_de_vida'; a.click(); };
    $('#r-sv').onclick = async () => { const res = await api('aStatus', { table: 'Reclutamiento', id: x.id, status: $('#r-st').value, notes: $('#r-n').value }); if (res.ok) toast('✅ Guardado'); };
    $('#r-hire').onclick = () => teacherEdit({ name: x.name, email: x.email, whatsapp: x.whatsapp }, async () => { await api('aStatus', { table: 'Reclutamiento', id: x.id, status: 'contratado' }); });
  }

  /* ======================= PROFESORES ======================= */
  function teachers() {
    list('teachers', { title: '🧑‍🏫 Profesores', sub: `Portal de profes (disponibilidad y asistencia): ${BASE}profesores.html`, add: '＋ Nuevo profesor', onAdd: () => teacherEdit({}),
      row: t => { const s = REF.teachers.find(x => x.id === t.id) || {}; return `<div class="card ad-row" data-open="${esc(t.id)}"><div class="ad-av${t.photo ? ' has' : ''}">${t.photo ? `<img src="${esc(t.photo)}" alt="">` : esc((t.name || '?')[0].toUpperCase())}</div><div class="grow"><b>${esc(t.name)}</b> ${t.active === 'no' ? chip('inactivo', 'gray') : chip('activo', 'p-premium')}
        <small>${esc(t.code)}</small><div class="ad-rowstats"><span>✅ ${s.taughtMonth || 0} dictadas este mes</span><span>📚 ${s.taughtTotal || 0} en total (🎯 ${s.vipTotal || 0} individuales · 👥 ${s.groupTotal || 0} grupales)</span><span>📅 ${s.upcoming || 0} programadas</span><span>🟢 ${s.freeSlots || 0} espacios libres</span></div></div></div>`; },
      open: (id) => teacherDetail(id), empty: 'Aún no hay profesores. Crea el primero.' });
    payCard();
  }
  // 💰 pagos a profesores (dentro de la pestaña Profesores)
  async function payCard() {
    const v = view(); v.insertAdjacentHTML('beforeend', `<div class="card" id="py-card" style="margin-top:16px"><h3>💰 Pagos a profesores</h3><p class="muted">Los profes cobran solo las clases <b>dictadas</b>. Si el profe se conecta y el estudiante no asiste, se paga el valor de inasistencia. Las canceladas no se pagan. Marca cada mes como <b>pagado</b> cuando hagas la transferencia: el profe recibe un aviso y un correo.</p>
      <div class="ad-form"><label>Mes<input class="inp" type="month" id="py-m" value="${todayISO().slice(0, 7)}"></label></div><div id="py-out" class="ad-mini"><p class="muted">⏳ Calculando…</p></div>
      <details style="margin-top:12px"><summary><b>⚙️ Valores de pago</b> <small class="muted">(cámbialos cuando se actualicen cada año)</small></summary><div class="ad-form" style="margin-top:8px"><label>Valor por clase dictada (COP)<input class="inp" inputmode="numeric" id="py-rate"></label><label>Valor si el estudiante no asiste (COP)<input class="inp" inputmode="numeric" id="py-ns"></label></div><button class="btn k" id="py-sv">💾 Guardar valores</button></details></div>`);
    const COP = n => '$' + Math.round(+n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const loadPay = async () => { const o = $('#py-out'); if (!o) return; o.innerHTML = '<p class="muted">⏳ Calculando…</p>'; const p = await api('aPayroll', { month: $('#py-m').value });
      if (!p.ok) { o.innerHTML = '<p class="muted">No se pudo calcular.</p>'; return; }
      const tot = p.teachers.reduce((a, t) => a + t.total, 0), pend = p.teachers.filter(t => !t.paid).reduce((a, t) => a + t.total, 0);
      o.innerHTML = p.teachers.length ? p.teachers.map(t => `<div class="ad-pay-row"><div><b>${esc(t.name)}</b><small class="muted" style="display:block">${t.done} dictada(s) · ${t.noshow} inasist.${t.tnoshow ? ' · <span style="color:#b91c1c">' + t.tnoshow + ' penalización(es)</span>' : ''}</small></div><b>${COP(t.total)}</b><span class="tp-paid ${t.paid ? 'ok' : 'pend'}">${t.paid ? '✅ Pagado' : '⏳ Pendiente'}</span><button class="btn ${t.paid ? 'w' : 'k'} sm" data-pay="${esc(t.id)}" data-st="${t.paid ? '0' : '1'}">${t.paid ? 'Marcar pendiente' : '💰 Marcar pagado'}</button></div>`).join('') + `<div class="ad-pay-row"><b>Total del mes</b><b>${COP(tot)}</b><span class="muted">Pendiente: <b>${COP(pend)}</b></span><span></span></div>` : '<p class="muted">No hay clases registradas en este mes.</p>';
      $$('[data-pay]', o).forEach(b => b.onclick = async () => { const paid = b.dataset.st === '1'; if (paid && !confirm('¿Confirmas que ya se realizó este pago? El profe recibirá un aviso.')) return; b.disabled = true; const r = await api('aPaySet', { teacherId: b.dataset.pay, month: $('#py-m').value, paid }); if (r.ok) { toast(paid ? '✅ Pago registrado. El profe ya fue notificado.' : 'Marcado como pendiente'); loadPay(); } else { b.disabled = false; toast('No se pudo guardar'); } }); };
    $('#py-m').onchange = loadPay; loadPay();
    const cf = await api('aList', { table: 'Config', size: 200 }); const conf = {}; (cf.rows || []).forEach(x => conf[x.key] = x.value);
    if (!$('#py-rate')) return; $('#py-rate').value = conf.pay_rate || '21800'; $('#py-ns').value = conf.pay_noshow || '10000';
    $('#py-sv').onclick = async () => { const b = $('#py-sv'); b.disabled = true; const rate = $('#py-rate').value.replace(/\D/g, ''), ns = $('#py-ns').value.replace(/\D/g, ''); if (!rate || !ns) { b.disabled = false; return toast('Escribe los dos valores'); }
      await api('aSave', { table: 'Config', row: { key: 'pay_rate', value: rate } }); await api('aSave', { table: 'Config', row: { key: 'pay_noshow', value: ns } }); b.disabled = false; toast('✅ Valores guardados'); loadPay(); };
  }
  /* ======================= TABLEROS DE CLASE ======================= */
  async function boards() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando tableros…</div>';
    const r = await api('aBoards'); if (TAB !== 'boards') return; if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar los tableros.</p>';
    const L = (r.boards || []).filter(b => b.text);
    view().innerHTML = `<div class="ad-head"><h2>📝 Tableros de clase <small class="muted">(${L.length})</small></h2><input class="inp" id="bd-q" placeholder="Buscar estudiante o profe" style="max-width:260px"></div>
      <p class="muted" style="margin:-4px 0 14px">Lo que cada profe escribió en sus clases individuales.</p><div id="bd-l"></div>`;
    const draw = (q) => { q = (q || '').toLowerCase(); const F = L.filter(b => !q || (b.student + ' ' + b.teacher + ' ' + b.code).toLowerCase().indexOf(q) >= 0);
      $('#bd-l').innerHTML = F.map(b => `<div class="card" style="margin-bottom:10px;padding:12px 14px"><b>${esc(b.student || b.code)}</b> <small class="muted">· ${esc(b.date)} ${esc(b.time)} · ${esc(b.teacher)}</small><div class="tb-board ro" style="margin-top:8px">${esc(b.text)}</div></div>`).join('') || '<p class="muted">Aún no hay tableros.</p>'; };
    draw(''); $('#bd-q').oninput = (e) => draw(e.target.value);
  }
  /* ======================= TESTIMONIOS ======================= */
  async function tes() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando testimonios…</div>';
    const r = await api('aTesList'); if (TAB !== 'tes') return; if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar los testimonios.</p>';
    const L = r.tes || []; const pv = (t) => MRTES.v(t.poster) || (MRTES.drive(t.video) ? 'https://drive.google.com/thumbnail?id=' + MRTES.drive(t.video) + '&sz=w400' : '');
    view().innerHTML = `<div class="ad-head"><h2>🎬 Testimonios <small class="muted">(${L.length})</small></h2><button class="btn k" id="ts-new">＋ Nuevo testimonio</button></div>
      <p class="muted" style="margin:-4px 0 14px">Aparecen en la página de inicio, en el orden que indiques. Video vertical (de celular), máximo 25 MB.</p>
      <div class="ad-tes">${L.map((t, i) => `<div class="ad-tc${String(t.active).charAt(0) === 'n' ? ' off' : ''}"><div class="ad-tp">${pv(t) ? `<img src="${esc(pv(t))}" alt="">` : ''}<span>${esc(t.ord)}</span></div><b>${esc(t.name)}</b><small>${esc(t.info || '')}</small>${String(t.active).charAt(0) === 'n' ? '<em>Oculto</em>' : ''}<div class="row"><button class="btn w sm" data-te="${i}">✏️ Editar</button><button class="btn w sm ad-del" data-td="${i}">🗑️</button></div></div>`).join('') || '<p class="muted">Aún no hay testimonios.</p>'}</div>`;
    $('#ts-new').onclick = () => tesEdit(null, L.length + 1);
    $$('[data-te]').forEach(b => b.onclick = () => tesEdit(L[+b.dataset.te]));
    $$('[data-td]').forEach(b => b.onclick = () => { const t = L[+b.dataset.td]; const m = modal(`<div class="center"><h2>¿Borrar el testimonio de ${esc(t.name)}?</h2><p class="muted">Dejará de aparecer en la página de inicio.</p><div class="row" style="justify-content:center;margin-top:10px"><button class="btn w" id="dl-no">Cancelar</button><button class="btn k ad-del" id="dl-ok">🗑️ Sí, borrar</button></div></div>`);
      $('#dl-no', m).onclick = () => m.remove(); $('#dl-ok', m).onclick = async () => { $('#dl-ok', m).disabled = true; const x = await api('aTesDel', { id: t.id }); m.remove(); if (x.ok) { try { localStorage.removeItem('mra_tes'); } catch (e) { } toast('🗑️ Borrado'); tes(); } else toast('No se pudo borrar'); }; });
  }
  function tesEdit(t, ord) {
    t = t || {}; const fileTo64 = (f) => new Promise((ok, ko) => { const rd = new FileReader(); rd.onload = () => ok(String(rd.result).split(',')[1]); rd.onerror = ko; rd.readAsDataURL(f); });
    const m = modal(`<h2>${t.id ? '✏️ Editar testimonio' : '＋ Nuevo testimonio'}</h2><div class="ad-form">
      <label>Nombre del estudiante<input class="inp" name="name" maxlength="60" value="${esc(t.name)}" placeholder="Ej: Laura Gómez"></label>
      <label>Detalle <small>(opcional)</small><input class="inp" name="info" maxlength="80" value="${esc(t.info)}" placeholder="Ej: 4 meses en la plataforma"></label>
      <label>Orden<input class="inp" name="ord" inputmode="numeric" value="${esc(t.ord || ord || 1)}"></label>
      <label>Visible<select class="inp" name="active"><option value="sí" ${String(t.active || 'sí').charAt(0) !== 'n' ? 'selected' : ''}>Sí, mostrar</option><option value="no" ${String(t.active).charAt(0) === 'n' ? 'selected' : ''}>No, ocultar</option></select></label>
      <div class="full ad-photo"><span class="ad-tp sm" id="ts-pv">${t.poster ? `<img src="${esc(MRTES.v(t.poster))}" alt="">` : ''}</span><div><b>Video ${t.id ? '' : '<small class="muted">(obligatorio)</small>'}</b><br><small class="muted">Vertical, de celular · máximo 25 MB · la portada se crea sola</small><br><label class="btn w sm" style="margin-top:6px;cursor:pointer">🎥 ${t.id ? 'Cambiar video' : 'Elegir video'}<input type="file" id="ts-v" accept="video/*" hidden></label> <span class="muted" id="ts-vn" style="font-size:13px"></span></div></div></div>
      <button class="btn k block lg" id="ts-ok">💾 Guardar</button><p class="muted center hidden" id="ts-st" style="margin-top:8px"></p>`);
    let VF = null, POS = null;
    $('#ts-v', m).onchange = (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 25 * 1024 * 1024) { e.target.value = ''; return toast('⚠️ El video pesa más de 25 MB. Envíatelo por WhatsApp para comprimirlo y vuelve a intentarlo.'); }
      VF = f; $('#ts-vn', m).textContent = f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB';
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = URL.createObjectURL(f);
      v.onloadeddata = () => { try { v.currentTime = Math.min(1.2, (v.duration || 2) / 3); } catch (er) { } };
      v.onseeked = () => { try { const w = 540, h = Math.round(w * v.videoHeight / v.videoWidth) || 960, c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(v, 0, 0, w, h); POS = c.toDataURL('image/jpeg', .82); $('#ts-pv', m).innerHTML = `<img src="${POS}" alt="">`; } catch (er) { } URL.revokeObjectURL(v.src); }; };
    $('#ts-ok', m).onclick = async () => { const d = formData(m); if (!d.name) return toast('Escribe el nombre'); if (!t.id && !VF) return toast('Elige el video');
      const b = $('#ts-ok', m), st = $('#ts-st', m); b.disabled = true; st.classList.remove('hidden'); st.textContent = VF ? '⏳ Subiendo video… no cierres esta ventana' : '⏳ Guardando…';
      const req = { name: d.name, info: d.info, ord: d.ord, active: d.active }; if (t.id) req.id = t.id;
      if (VF) { req.video = await fileTo64(VF); req.vmime = VF.type || 'video/mp4'; if (POS) req.poster = POS.split(',')[1]; }
      const r = await api('aTesSave', req).catch(() => null);
      if (!r || !r.ok) { b.disabled = false; st.textContent = ''; return toast('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.'); }
      try { localStorage.removeItem('mra_tes'); } catch (e) { } m.remove(); toast('✅ Testimonio guardado'); tes(); };
  }
  function delAsk(table, id, name, note, after) {
    const m = modal(`<div class="center"><div style="font-size:44px">🗑️</div><h2>¿Borrar a ${esc(name)}?</h2><p class="muted">${note}</p><p><b>Esto no se puede deshacer.</b></p><div class="row" style="justify-content:center;margin-top:10px"><button class="btn w" id="dl-no">Cancelar</button><button class="btn k ad-del" id="dl-ok">🗑️ Sí, borrar</button></div></div>`);
    $('#dl-no', m).onclick = () => m.remove();
    $('#dl-ok', m).onclick = async () => { $('#dl-ok', m).disabled = true; const r = await api('aDelete', { table, id }); m.remove(); if (r.ok) { toast('🗑️ Borrado'); after && after(); } else toast('No se pudo borrar'); };
  }
  function teacherEdit(t, after) {
    t = t || {};
    const m = modal(`<h2>${t.id ? '✏️ Editar profesor' : '＋ Nuevo profesor'}</h2><div class="ad-form">
      <label>Nombre<input class="inp" name="name" value="${esc(t.name)}"></label><label>Correo<input class="inp" name="email" type="email" value="${esc(t.email)}"></label>
      <label>WhatsApp<input class="inp" name="whatsapp" value="${esc(t.whatsapp)}"></label><label>Código de profe <small>(vacío = automático)</small><input class="inp" name="code" value="${esc(t.code)}" style="text-transform:uppercase"></label>
      <label>Clave de acceso <small>(vacío = automática · mínimo 6 letras o números · con ella entra directo a su portal)</small><span style="display:flex;gap:6px"><input class="inp" name="pin" autocapitalize="characters" value="${esc(t.pin)}" style="flex:1"><button type="button" class="btn w sm" id="te-gen">🔄 Generar</button></span></label>
      <div class="full ad-photo"><span class="ad-av lg" id="te-pv">${t.photo ? `<img src="${esc(t.photo)}" alt="">` : esc((t.name || '?')[0].toUpperCase())}</span><div><b>Foto del profe</b> <small class="muted">(opcional · aparece en toda la plataforma)</small><br><label class="btn w sm" style="margin-top:6px;cursor:pointer">📷 ${t.photo ? 'Cambiar foto' : 'Subir foto'}<input type="file" id="te-ph" accept="image/*" hidden></label>${t.photo ? ' <label class="muted" style="font-size:13px"><input type="checkbox" id="te-rm"> Quitar foto</label>' : ''}</div></div><label class="full">Presentación (aparece en “Conoce a tus profes” y al reservar) <small>— una idea por línea</small><textarea class="inp" name="bio" rows="3" maxlength="300">${esc(t.bio)}</textarea></label>
      <label>Cédula <small>(para el contrato)</small><input class="inp" name="doc" inputmode="numeric" value="${esc(t.doc)}" placeholder="Ej: 1.127.573.975"></label><label>Lugar de expedición<input class="inp" name="docCity" value="${esc(t.docCity)}" placeholder="Ej: Cartagena, Bolívar"></label><label>Saludo<select class="inp" name="gender"><option value="" ${!t.gender ? 'selected' : ''}>Automático (por el nombre)</option><option value="f" ${t.gender === 'f' ? 'selected' : ''}>Mrs. (mujer)</option><option value="m" ${t.gender === 'm' ? 'selected' : ''}>Mr. (hombre)</option></select></label><label>Activo<select class="inp" name="active"><option value="sí" ${t.active !== 'no' ? 'selected' : ''}>sí</option><option value="no" ${t.active === 'no' ? 'selected' : ''}>no</option></select></label></div>
      <button class="btn k block lg" id="te-ok">💾 Guardar</button>`);
    let PH = null; // 📸 foto recortada en cuadrado (400 px) antes de subirla
    $('#te-ph', m).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const z = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = 400; c.getContext('2d').drawImage(im, (im.width - z) / 2, Math.max(0, (im.height - z) * 0.3), z, z, 0, 0, 400, 400); PH = c.toDataURL('image/jpeg', 0.88); $('#te-pv', m).innerHTML = `<img src="${PH}" alt="">`; }; im.src = rd.result; }; rd.readAsDataURL(f); };
      if ($('#te-gen', m)) $('#te-gen', m).onclick = () => { const nm = (m.querySelector('[name=name]') || {}).value || 'PROFE'; const b = String(nm).split(' ')[0].normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'PROFE'; m.querySelector('[name=pin]').value = b + Math.floor(1000 + Math.random() * 9000); };
    $('#te-ok', m).onclick = async () => { const d = formData(m); if (!d.name) return toast('Escribe el nombre'); if (t.id) d.id = t.id; d.code = (d.code || '').toUpperCase();
      $('#te-ok', m).disabled = true; const r = await api('aSave', { table: 'Profesores', row: d });
      if (!r.ok) { $('#te-ok', m).disabled = false; return toast(r.err === 'pin_taken' ? '⚠️ Esa clave ya la usa otra persona. Toca 🔄 Generar para crear una nueva.' : r.err === 'pin_format' ? '⚠️ La clave debe tener mínimo 6 letras o números, sin espacios.' : r.err === 'code_exists' ? '⚠️ Ese código ya está en uso por otro profe o estudiante. Escribe otro (o déjalo vacío para crearlo automático).' : 'No se pudo guardar'); }
      if (PH || ($('#te-rm', m) && $('#te-rm', m).checked)) { const ph = await api('aTeacherPhoto', { id: r.row.id || t.id, data: PH ? PH.split(',')[1] : '', mime: 'image/jpeg' }).catch(() => null); if (!ph || !ph.ok) toast('⚠️ Se guardó el profe pero no la foto. Inténtalo de nuevo.'); }
      try { localStorage.removeItem('mra_profes'); } catch (e) { }
      m.remove(); await loadRef(); after && after(r.row);
      if (t.id && r.row.mailed) toast('📧 Se le envió su nueva clave a ' + (r.row.email || 'su correo'));
      if (!t.id) modal(`<div class="center"><h2>✅ Profesor creado</h2><div class="ad-code">Clave de acceso: ${esc(r.row.pin)}</div><p>${r.row.mailed ? '📧 Se le envió un correo automático de bienvenida a <b>' + esc(r.row.email) + '</b> con su código, clave de acceso y cómo entrar.' : (r.row.email ? '⚠️ No se pudo enviar el correo de bienvenida. Revisa el correo del profe.' : '⚠️ Agrega el correo del profe para enviarle la bienvenida automática.')}</p></div>`);
      else toast('✅ Guardado');
      if (TAB === 'teachers') { if (t.id) teacherDetail(t.id); else teachers(); } };
  }
  async function teacherDetail(id) {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando…</div>'; window.scrollTo(0, 0);
    const r = await api('aGet', { table: 'Profesores', id }); if (!r.ok) return; const t = r.row, s = r.stats || {};
    const slots = (r.slots || []).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const byDate = {}; slots.forEach(x => (byDate[x.date] = byDate[x.date] || []).push(x));
    view().innerHTML = `${back()}<div class="card ad-dhead"><div class="ad-av lg${t.photo ? ' has' : ''}">${t.photo ? `<img src="${esc(t.photo)}" alt="">` : esc((t.name || '?')[0].toUpperCase())}</div><div class="grow"><h1>${esc(t.name)}</h1><p>🔑 Clave de acceso: <b>${esc(t.pin)}</b>${String(t.pin || '').length < 6 ? ' <span style="color:#b91c1c">· muy corta: toca Editar → 🔄 Generar</span>' : ''}</p><p class="muted">${esc(t.email)} ${t.whatsapp ? '· ' + esc(t.whatsapp) : ''}</p></div><div class="ad-dact"><button class="btn w sm" id="t-ed">✏️ Editar</button><button class="btn w sm ad-del" id="t-del">🗑️ Borrar</button></div></div>
      <div class="ad-kpis sm"><div class="ad-kpi"><b>${s.taughtMonth || 0}</b><span>Dictadas este mes</span></div><div class="ad-kpi"><b>${s.taughtTotal || 0}</b><span>Dictadas en total</span><em>🎯 ${s.vipTotal || 0} individuales</em></div><div class="ad-kpi"><b>${s.upcoming || 0}</b><span>Programadas</span></div><div class="ad-kpi"><b>${s.freeSlots || 0}</b><span>Espacios libres</span></div></div>
      <div class="card"><h3>🗓️ Disponibilidad (espacios para clases individuales)</h3><p class="muted">El profe la publica desde su portal; también puedes agregarla aquí.</p>
        <div class="ad-form"><label>Fecha<input class="inp" type="date" id="sl-d" min="${todayISO()}" value="${addDays(todayISO(), 1)}"></label><label>Horas <small>(separadas por coma)</small><input class="inp" id="sl-h" placeholder="07:00, 18:00, 19:00"></label><label>Repetir semanas<select class="inp" id="sl-w">${[1, 2, 3, 4, 6, 8].map(n => `<option>${n}</option>`).join('')}</select></label><label>Duración<select class="inp" id="sl-u"><option>50</option></select></label></div><button class="btn k" id="sl-add">＋ Agregar espacios</button>
        <div class="ad-slots">${Object.keys(byDate).length ? Object.keys(byDate).map(d => `<div class="ad-sday"><b>${fD(d, { weekday: 'short', day: 'numeric', month: 'short' })}</b><div>${byDate[d].map(x => `<span class="ad-slot ${x.status}">${fT(x.time)}${x.status === 'free' ? ` <button data-del="${esc(x.id)}" title="Borrar">✕</button>` : ' · reservado'}</span>`).join('')}</div></div>`).join('') : '<p class="muted">Sin espacios publicados.</p>'}</div></div>
      <div class="card"><h3>📚 Clases</h3>${(r.classes || []).length ? `<div class="ad-mini">${r.classes.map(c => `<div class="ad-mrow"><b>${c.type === 'vip' ? '🎯 Individual' : c.type === 'club' ? '🎙️ Club' : '👥 Grupal'} · ${fD(c.date)} ${fT(c.time)}</b><span>${J(c.students, []).join(', ')} · ${c.status === 'done' ? '✅ dictada' : c.status === 'scheduled' ? '📅 programada' : c.status === 'cancelled' ? 'cancelada' : 'no asistió'}</span></div>`).join('')}</div>` : '<p class="muted">Sin clases.</p>'}</div>`;
    wireBack(() => go('teachers')); $('#t-ed').onclick = () => teacherEdit(t); $('#t-del').onclick = () => delAsk('Profesores', t.id, t.name, 'Se borra su código y sus espacios libres. El historial de clases dictadas se conserva. Si tiene grupos o clubs asignados, asígnale otro profe.', async () => { await loadRef(); go('teachers'); });
    $('#sl-add').onclick = async () => { const d = $('#sl-d').value; const hs = $('#sl-h').value.split(/[,\s]+/).map(x => x.trim()).filter(Boolean).map(x => x.length === 4 ? '0' + x : x).filter(x => /^\d{2}:\d{2}$/.test(x)); if (!d || !hs.length) return toast('Escribe la fecha y las horas (ej: 18:00)');
      const w = +$('#sl-w').value, slots = []; for (let i = 0; i < w; i++) hs.forEach(h => slots.push({ date: addDays(d, i * 7), time: h, duration: $('#sl-u').value }));
      const res = await api('aSlot', { teacherId: t.id, slots }); if (res.ok) { toast(`✅ ${res.added} espacio(s) agregados`); teacherDetail(id); } };
    $$('[data-del]').forEach(b => b.onclick = async () => { const res = await api('aSlot', { del: true, slotId: b.dataset.del }); if (res.ok) teacherDetail(id); else toast('Ese espacio ya está reservado'); });
  }

  /* ======================= CLASES ======================= */
  function classes() {
    list('classes', { title: '📅 Clases', sub: 'Clases individuales (las reservan los estudiantes Premium). Los clubs y grupos antiguos quedan en el historial.', desc: false, add: '🎁 Clase adicional de regalo', onAdd: bonusModal, add2: '＋ Programar clase', onAdd2: classNew,
      filters: [{ k: 'status', opts: [['scheduled', '📅 Programadas'], ['done', '✅ Dictadas'], ['noshow', '❌ No asistió'], ['cancelled', 'Canceladas'], ['', 'Todas']] }, { k: 'type', opts: [['', 'Todas'], ['vip', '🎯 Individuales'], ['club', '🎙️ Clubs (historial)']] }],
      row: c => { const st = J(c.students, []); const att = J(c.attendance, {}); return `<div class="card ad-row ad-cl ${c.type}" data-open="${esc(c.id)}"><div class="ad-cdate"><b>${fD(c.date, { day: 'numeric' })}</b><small>${fD(c.date, { month: 'short' })}</small></div><div class="grow"><b>${c.type === 'vip' ? '🎯 Individual' : c.type === 'club' ? '🎙️ Club' : '👥 Grupal'} · ${fT(c.time)} · ${esc(tName(c.teacherId))}</b> ${chip({ scheduled: '📅 programada', done: '✅ dictada', noshow: '❌ no asistió', cancelled: 'cancelada' }[c.status] || esc(c.status), 'st-' + c.status)}
        <small>${st.length} estudiante(s)${c.status === 'done' ? ' · asistieron ' + Object.values(att).filter(Boolean).length : ''}${c.topic ? ' · ' + esc(c.topic) : ''}</small></div></div>`; },
      open: (id, c) => classMark(c), empty: 'No hay clases con este filtro.' });
  }
  // 🎁 regalar clases individuales adicionales (por un inconveniente o como regalo); valen solo para el ciclo actual del plan
  async function bonusModal() {
    const m = modal(`<h2>🎁 Agregar clase individual de regalo</h2><p class="muted">El estudiante podrá reservarla desde su perfil. Vale solo para su ciclo actual (no es acumulable) y le llega un aviso y un correo.</p>
      <div class="ad-form"><label class="full">Estudiante Premium<input class="inp" id="bo-s" list="bo-list" placeholder="⏳ Cargando estudiantes…" autocomplete="off"><datalist id="bo-list"></datalist></label>
      <label>Cantidad<select class="inp" id="bo-n">${[1, 2, 3, 4, 5].map(n => `<option value="${n}">${n} clase${n > 1 ? 's' : ''}</option>`).join('')}</select></label>
      <label>Motivo<select class="inp" id="bo-r"><option>Regalo de la escuela 🎁</option><option>Compensación por un inconveniente</option><option>Otro</option></select></label>
      <label class="full">Detalle <small>(opcional, lo ve el estudiante)</small><input class="inp" id="bo-d" maxlength="120" placeholder="Ej: por tu cumpleaños"></label></div>
      <button class="btn k block lg" id="bo-ok">🎁 Agregar</button>`);
    const r = await api('aList', { table: 'Estudiantes', size: 500 }); const list = (r.rows || []).filter(x => (x.plan === 'premium' || x.plan === 'premium8') && (!x.planEnd || x.planEnd >= todayISO()));
    $('#bo-list', m).innerHTML = list.map(x => `<option value="${esc(x.code)} · ${esc((x.first + ' ' + x.last).trim())}">`).join(''); $('#bo-s', m).placeholder = list.length ? 'Escribe el nombre o el código' : 'No hay estudiantes Premium activos';
    $('#bo-ok', m).onclick = async () => { const code = $('#bo-s', m).value.split('·')[0].trim().toUpperCase(); if (!code) return toast('Elige un estudiante');
      const why = $('#bo-r', m).value + ($('#bo-d', m).value.trim() ? ': ' + $('#bo-d', m).value.trim() : '');
      const b = $('#bo-ok', m); b.disabled = true; const res = await api('aBonus', { code, n: +$('#bo-n', m).value, reason: why });
      if (res.ok) { m.remove(); toast(`✅ Listo: ahora tiene ${res.credits.vipLeft} clase(s) individuales disponibles este ciclo. Ya le avisamos.`); }
      else { b.disabled = false; toast(res.err === 'not_premium' ? 'Ese estudiante no tiene plan Premium activo' : res.err === 'notfound' ? 'No encontramos ese código' : 'No se pudo agregar'); } };
  }
  function classMark(c) {
    const st = J(c.students, []); const att = J(c.attendance, {});
    const m = modal(`<h2>${c.type === 'vip' ? '🎯 Clase individual' : '👥 Clase grupal'}</h2><p class="muted">${fD(c.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${fT(c.time)} · ${esc(tName(c.teacherId))}</p>
      <h4>Asistencia</h4>${st.length ? st.map(s => `<label class="ad-chk"><input type="checkbox" data-a="${esc(s)}" ${att[s] !== false && (c.status === 'done' ? att[s] : true) ? 'checked' : ''}> ${esc(s)}</label>`).join('') : '<p class="muted">Sin estudiantes.</p>'}
      <label class="ad-lab">Notas</label><textarea class="inp" id="cm-n" rows="2">${esc(c.notes)}</textarea>
      <div class="ad-planbtns"><button class="btn k" data-s="done">✅ Dictada</button><button class="btn w" data-s="noshow">❌ No asistió</button><button class="btn w" data-s="cancelled">Cancelar clase</button>${c.status !== 'scheduled' ? '<button class="btn w" data-s="scheduled">↩ Volver a programada</button>' : ''}</div>`);
    $$('[data-s]', m).forEach(b => b.onclick = async () => { const a = {}; $$('[data-a]', m).forEach(i => a[i.dataset.a] = i.checked); const r = await api('aMark', { classId: c.id, status: b.dataset.s, attendance: a, notes: $('#cm-n', m).value }); m.remove(); if (r.ok) { toast('✅ Actualizada'); classes(); } });
  }
  function classNew() {
    if (!window.CLASE_TOPICS && !classNew._l) { classNew._l = 1; const sc = document.createElement('script'); sc.src = 'js/clase-topics.js'; sc.onload = classNew; sc.onerror = () => { const s2 = document.createElement('script'); s2.src = 'clase-topics.js'; s2.onload = classNew; s2.onerror = classNew; document.head.appendChild(s2); }; document.head.appendChild(sc); return; }
    const m = modal(`<h2>＋ Programar clase individual</h2><p class="muted" style="margin:0 0 8px">Útil para clases de prueba o para programar una clase a mano. El profe y el estudiante entran desde «Mis clases → Entrar a la clase» (5 min antes).</p><div class="ad-form"><input type="hidden" name="type" value="vip">
      <label>Profe<select class="inp" name="teacherId">${teacherOpts()}</select></label><label>Fecha<input class="inp" type="date" name="date" value="${todayISO()}"></label><label>Hora (Colombia)<input class="inp" type="time" name="time" step="300" value="18:00"></label>
      <label>Código del estudiante<input class="inp" name="students" placeholder="LAURA-4062" style="text-transform:uppercase"></label>
      <label class="full">Tema<select class="inp" name="topic"><option value="">— Sin tema —</option>${[1, 2, 3, 4].map((md) => `<optgroup label="Módulo ${md} · ${({ 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2+' })[md]}">${((window.CLASE_TOPICS || {})[md] || []).map((t, k) => `<option value="Módulo ${md} · Tema ${k + 1}: ${esc(t[0])}">Tema ${k + 1}: ${esc(t[0])}</option>`).join('')}</optgroup>`).join('')}</select></label></div><button class="btn k block lg" id="cn-ok">Programar</button>`);
    $('#cn-ok', m).onclick = async () => { const d = formData(m); if (!d.teacherId || !d.date || !d.time) return toast('Completa profe, fecha y hora');
      d.students = d.students.toUpperCase().split(/[,\s]+/).filter(Boolean); if (!d.students.length) return toast('Escribe el código del estudiante'); d.duration = '50'; d.status = 'scheduled'; d.type = 'vip'; d.created = todayISO();
      const r = await api('aSave', { table: 'Clases', row: d }); m.remove(); if (r.ok) { toast('✅ Clase programada'); classes(); } };
  }

  /* ======================= SOLICITUDES ======================= */
  function requests() {
    list('requests', { title: '🔁 Solicitudes', sub: 'Intentos extra de exámenes que piden los estudiantes',
      filters: [{ k: 'status', opts: [['pendiente', '⏳ Pendientes'], ['aprobada', '✅ Aprobadas'], ['rechazada', '❌ Rechazadas'], ['', 'Todas']] }],
      row: q => `<div class="card ad-row" data-open="${esc(q.id)}"><div class="ad-av">🔁</div><div class="grow"><b>${esc(q.name)}</b> ${chip(esc(q.status), 'st-' + q.status)}<small>${fDT(q.date)} · actual: ${esc(q.currentGroup || 'sin grupo')}</small><div class="ad-rowstats"><span>Prefiere: <b>${esc(q.preferred)}</b></span>${q.reason ? `<span>Motivo: ${esc(q.reason)}</span>` : ''}</div></div></div>`,
      open: (id, q) => reqModal(q), empty: 'No hay solicitudes. 🎉' });
  }
  function reqModal(q) {
    const m = modal(`<h2>🔁 ${esc(q.name)}</h2><p class="muted">${esc(q.code)} · ${fDT(q.date)}</p><div class="ad-kv"><span>Grupo actual</span><b>${esc(q.currentGroup || '—')}</b><span>Horario preferido</span><b>${esc(q.preferred)}</b><span>Motivo</span><b>${esc(q.reason || '—')}</b></div>
      ${q.status === 'pendiente' ? `<label class="ad-lab">Mensaje para el estudiante</label><textarea class="inp" id="rq-n" rows="2"></textarea>
      <div class="ad-planbtns"><button class="btn k" id="rq-y">✅ Aprobar</button><button class="btn w" id="rq-n2">❌ Rechazar</button></div>` : `<p>Estado: <b>${esc(q.status)}</b> ${q.note ? '· ' + esc(q.note) : ''}</p>`}`);
    const res = async (status) => { const r = await api('aReq', { id: q.id, status, note: $('#rq-n', m).value }); m.remove(); if (r.ok) { toast(status === 'aprobada' ? '✅ Aprobada · se le avisó por correo' : 'Solicitud rechazada'); requests(); } };
    if ($('#rq-y', m)) { $('#rq-y', m).onclick = () => res('aprobada'); $('#rq-n2', m).onclick = () => res('rechazada'); }
  }

  /* ======================= AJUSTES ======================= */
  async function settings() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando…</div>';
    const r = await api('aList', { table: 'Config', size: 200 }); const conf = {}; (r.rows || []).forEach(x => conf[x.key] = x.value);
    const links = [['🌐 Plataforma (estudiantes)', BASE], ['📝 Formulario de inscripción', BASE + 'inscripcion.html'], ['👩‍🏫 Proceso de selección de profes', BASE + 'reclutamiento.html'], ['🧑‍🏫 Portal de profesores', BASE + 'profesores.html']];
    view().innerHTML = `<div class="ad-head"><h1>⚙️ Ajustes</h1></div>
      <div class="card"><h3>🔗 Enlaces para compartir</h3><div class="ad-mini">${links.map(([n, u]) => `<div class="ad-mrow ad-link"><b>${n}</b><span>${esc(u)}</span><button class="btn w sm" data-cp="${esc(u)}">📋</button></div>`).join('')}</div></div>
      <div class="card"><h3>📣 Anuncio para todos los estudiantes</h3><p class="muted">Aparece en el perfil de cada estudiante. Déjalo vacío para ocultarlo.</p><textarea class="inp" data-k="announcement" rows="2">${esc(conf.announcement)}</textarea></div>
      <div class="card"><h3>💲 Precios de las membresías</h3><p class="muted">Valores en pesos (COP), sin puntos. Se actualizan en toda la plataforma y en la compra.</p><div class="ad-form">
        ${[['price_membership', '🖥️ Plataforma (mes)', 59900], ['price_premium', '👑 Premium · 4 clases (mes)', 169900], ['price_premium8', '💎 Premium · 8 clases (mes)', 289900], ['price_extra', '➕ Clase adicional', 39900]].map(([k, n, d]) => `<label>${n}<input class="inp" type="number" min="0" step="100" data-k="${k}" value="${esc(conf[k] || d)}"></label>`).join('')}</div></div>
      <button class="btn k lg" id="cf-sv">💾 Guardar ajustes</button>
      <div class="card" style="margin-top:16px"><h3>💳 Mercado Pago (pagos con tarjeta)</h3><p class="muted">Pega aquí tu <b>Access Token de producción</b> (empieza por <code>APP_USR-</code>). Con él, los pagos con tarjeta se confirman solos y el plan se habilita de inmediato. No se muestra después de guardarlo.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><input class="inp" id="mp-tk" type="password" placeholder="APP_USR-…" style="flex:1 1 260px" autocomplete="off"><button class="btn k" id="mp-sv">💾 Guardar token</button></div></div>
      <div class="card" style="margin-top:16px"><h3>🔐 Cambiar clave de administración</h3><p class="muted">Mínimo 8 caracteres. No la compartas con nadie.</p><div class="ad-form"><label>Clave actual<input class="inp" type="password" id="pw-old" autocomplete="current-password"></label><label>Nueva clave<input class="inp" type="password" id="pw-new" autocomplete="new-password"></label><label>Repite la nueva clave<input class="inp" type="password" id="pw-new2" autocomplete="new-password"></label></div><button class="btn k" id="pw-sv">🔐 Cambiar clave</button></div>`;
    $$('[data-cp]').forEach(b => b.onclick = () => copy(b.dataset.cp));
    $('#mp-sv').onclick = async () => { const t = $('#mp-tk').value.trim(); if (!/^(APP_USR|TEST)-/.test(t)) return toast('El token debe empezar por APP_USR-'); const r = await api('aMpToken', { token: t }); if (r.ok) { $('#mp-tk').value = ''; toast('✅ Token guardado. Mercado Pago quedó activo.'); } else toast('No se pudo guardar'); };
    $('#pw-sv').onclick = async () => { const o = $('#pw-old').value, n = $('#pw-new').value, n2 = $('#pw-new2').value;
      if (o !== key()) return toast('La clave actual no es correcta'); if (n.length < 8) return toast('La nueva clave debe tener mínimo 8 caracteres'); if (n !== n2) return toast('Las dos claves nuevas no coinciden');
      $('#pw-sv').disabled = true; const r = await api('aPass', { newKey: n }); $('#pw-sv').disabled = false;
      if (r.ok) { try { sessionStorage.setItem(KK, n); } catch (e) { } $('#pw-old').value = $('#pw-new').value = $('#pw-new2').value = ''; toast('✅ Clave cambiada. Úsala la próxima vez que entres.'); } else toast('No se pudo cambiar la clave'); };
    $('#cf-sv').onclick = async () => {
      // 🕒 los clubs deben quedar dentro del horario laboral (L–V 7 a. m.–9 p. m., sábado 7 a. m.–5 p. m.; clase de 50 min)
      for (const k of ['conv_a', 'conv_b', 'fon_a', 'fon_b']) { const dEl = $(`[data-k="club_${k}_day"]`), tEl = $(`[data-k="club_${k}_time"]`); if (!dEl || !tEl || !tEl.value) continue; const [hh, mm] = tEl.value.split(':').map(Number); const st = hh * 60 + (mm || 0), sat = /s[áa]bado/i.test(dEl.value); if (st < 420 || st + 50 > (sat ? 1020 : 1260)) return toast(`⚠️ El horario del club (${dEl.value} ${tEl.value}) está fuera del horario laboral: lunes a viernes 7:00 a. m.–9:00 p. m. y sábados 7:00 a. m.–5:00 p. m. La clase dura 50 min.`); }
      const b = $('#cf-sv'); b.disabled = true; let clubCh = false; for (const i of $$('[data-k]')) { if ((conf[i.dataset.k] || '') !== i.value.trim()) { await api('aSave', { table: 'Config', row: { key: i.dataset.k, value: i.value.trim() } }); if (/^club_/.test(i.dataset.k)) clubCh = true; } } if (clubCh) await api('aClubSync'); b.disabled = false; toast(clubCh ? '✅ Guardado · se actualizaron las sesiones de los clubs y se avisó a los estudiantes que ya habían confirmado' : '✅ Ajustes guardados'); settings(); };
  }

  /* ======================= 💳 PAGOS (comprobantes y Mercado Pago) ======================= */
  let BUYF = 'pendiente';
  async function buys() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando pagos…</div>';
    const r = await api('aBuys'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar los pagos.</p>';
    const ST = { pendiente: '⏳ Pendiente', aprobado: '✅ Aprobado', rechazado: '❌ Rechazado', cancelado: '🚫 Cancelado' };
    const pend = r.buys.filter(b => b.status === 'pendiente' && b.method !== 'mercadopago').length; const set = $('[data-b="buys"]'); if (set) { set.textContent = pend || ''; set.style.display = pend ? '' : 'none'; }
    const L = r.buys.filter(b => !BUYF || b.status === BUYF);
    view().innerHTML = `<div class="ad-head"><h1>💳 Pagos</h1><p class="muted">Transferencias con comprobante y pagos con Mercado Pago. Al <b>aprobar</b>, el plan o las clases se habilitan de inmediato y el estudiante recibe aviso y correo.</p></div>
      <div class="ad-filters"><select class="inp" id="bf">${[['pendiente', '⏳ Pendientes'], ['aprobado', '✅ Aprobados'], ['rechazado', '❌ Rechazados'], ['cancelado', '🚫 Cancelados'], ['', 'Todos']].map(([v, n]) => `<option value="${v}" ${BUYF === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="card">${L.length ? `<div class="ad-mini">${L.map(b => `<div class="ad-mrow" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b>${esc(b.name)}</b> <span class="muted">(${esc(b.code)})</span><br><small class="muted">${b.kind === 'extra' ? '➕ ' + b.n + ' clase(s) adicional(es)' : esc(b.planName || b.plan)} · <b>${money(b.amount)}</b>${b.ref ? ' (' + (b.ref === 'OFERTA' ? '⏱️ oferta 24 h' : b.ref === 'CUPON' ? '🤝 premio por recomendar' : '🎁 referido ' + esc(b.ref)) + ' · −' + money(b.discount) + ')' : ''} · ${b.method === 'mercadopago' ? '💳 Mercado Pago' : '🏦 Transferencia'} · ${esc(String(b.date).slice(0, 16).replace('T', ' '))} · ${ST[b.status] || esc(b.status)}${b.note ? ' · ' + esc(b.note) : ''}</small></div>
        ${b.proof ? `<a class="btn w sm" target="_blank" rel="noopener" href="https://drive.google.com/file/d/${encodeURIComponent(b.proof)}/view">🧾 Ver comprobante</a>` : ''}${b.status === 'pendiente' && b.method === 'mercadopago' ? `<span class="muted" style="font-size:13px">⏳ Esperando que termine de pagar en Mercado Pago · se aprueba solo</span><button class="btn w sm" data-mp="${esc(b.id)}">🔄 Verificar ahora</button>` : b.status === 'pendiente' ? `<button class="btn k sm" data-ok="${esc(b.id)}">✅ Aprobar</button><button class="btn w sm" data-no="${esc(b.id)}">❌ Rechazar</button>` : ''}</div>`).join('')}</div>` : '<p class="muted">No hay pagos en esta lista.</p>'}</div>`;
    $('#bf').onchange = (e) => { BUYF = e.target.value; buys(); };
    api('aRefs').then(x => { if (!x.ok || !x.refs.length || !view().querySelector('#bf')) return; view().insertAdjacentHTML('beforeend', `<div class="card"><h3 style="margin-top:0">🎁 Referidos confirmados (${x.refs.length})</h3><div class="ad-mini">${x.refs.map(f => `<div class="ad-mrow"><b>${esc(f.referrerName)}</b> refirió a <b>${esc(f.friendName)}</b><br><small class="muted">${esc(String(f.date).slice(0, 10))} · Código ${esc(f.refCode)} · Recompensa: ${esc(f.reward)}${f.milestone === 'mes-gratis' ? ' · 🏆 llegó a 3 (mes gratis)' : f.milestone === 'embajador' ? ' · 🏅 llegó a 5 (Embajador)' : ''}</small></div>`).join('')}</div></div>`); });
    $$('[data-mp]').forEach(b => b.onclick = async () => { b.disabled = true; b.textContent = '⏳ Consultando…'; const x = await api('aBuyMp', { id: b.dataset.mp }); toast(!x.ok ? 'No se pudo consultar' : x.status === 'aprobado' ? '✅ Mercado Pago lo confirmó: plan habilitado' : x.status === 'pendiente' ? '⏳ Mercado Pago aún no registra el pago' : 'Mercado Pago: ' + x.status); buys(); });
    $$('[data-ok]').forEach(b => b.onclick = async () => { if (!confirm('¿Confirmas que el pago llegó? Se habilitará de inmediato.')) return; b.disabled = true; const x = await api('aBuyDecide', { id: b.dataset.ok, ok: true }); toast(x.ok ? '✅ Aprobado y habilitado' : 'No se pudo aprobar'); buys(); });
    $$('[data-no]').forEach(b => b.onclick = async () => { const note = prompt('Motivo del rechazo (lo verá el estudiante):', 'No encontramos el pago con ese comprobante.'); if (note === null) return; b.disabled = true; const x = await api('aBuyDecide', { id: b.dataset.no, ok: false, note }); toast(x.ok ? 'Pago rechazado · le avisamos al estudiante' : 'No se pudo rechazar'); buys(); });
  }

  /* ======================= ⭐ OPINIONES: de la escuela y de los profes ======================= */
  let RVT = 's'; // pestaña de opiniones: 's' escuela · 't' profes
  const rvSeg = (k) => `<div class="sr-seg"><button data-rvt="s" class="${k === 's' ? 'on' : ''}">La escuela</button><button data-rvt="t" class="${k === 't' ? 'on' : ''}">Los profes</button></div>`;
  const rvSegWire = () => $$('[data-rvt]', view()).forEach(b => b.onclick = () => { RVT = b.dataset.rvt; reviews(); });
  async function reviews() { if (RVT === 't') { await teacherReviews(); return rvSegWire(); } return schoolReviews(); }
  let SRF = 'all';
  async function schoolReviews() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando opiniones…</div>';
    const r = await api('aSchoolReviews'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar las opiniones.</p>';
    const S5 = (n) => `<span class="sr-st">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= n ? 'on' : ''}">★</i>`).join('')}</span>`;
    const F = (n) => String(n || '').split(' ')[0];
    const FL = { all: ['Todas', () => true], pend: ['Por atender', (x) => x.stars <= 3 && x.status === 'nueva'], pub: ['Para publicar', (x) => x.stars >= 4 && x.consent && x.status === 'nueva'], live: ['Publicadas', (x) => x.status === 'publicada'] };
    const L = r.rows.filter(FL[SRF][1]);
    const ST = { nueva: '', atendida: '<span class="sr-pill ok">✓ Atendida</span>', publicada: '<span class="sr-pill pub">● Publicada</span>', oculta: '<span class="sr-pill hid">Oculta</span>' };
    const tagTop = Object.entries(r.tags || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const row = (x) => { const low = x.stars <= 3;
      const acts = low ? `${x.wa ? `<a class="btn sm ad-wa" target="_blank" rel="noopener" href="${waLink(x.wa, `Hola ${F(x.name)}, te escribimos de mrarrieta.com. Gracias por tu opinión sobre la plataforma: la leímos con atención y queremos ayudarte. ¿Nos cuentas un poco más para mejorar tu experiencia?`)}">📲 WhatsApp</a>` : ''}${x.status === 'nueva' ? `<button class="btn k sm" data-sr="${esc(x.id)}" data-s="atendida">✓ Marcar atendida</button>` : ''}`
        : `${x.consent ? (x.status === 'publicada' ? `<button class="btn w sm" data-sr="${esc(x.id)}" data-s="oculta">Quitar de la página</button>` : `<button class="btn k sm" data-sr="${esc(x.id)}" data-s="publicada">Publicar en la página</button>`) : '<span class="muted" style="font-size:12px">No autorizó publicarla</span>'}${x.status !== 'oculta' && x.status !== 'publicada' ? `<button class="btn w sm" data-sr="${esc(x.id)}" data-s="oculta">Ocultar</button>` : ''}`;
      return `<div class="sr-row${low && x.status === 'nueva' ? ' low' : ''}"><div class="sr-rh"><b>${esc(x.name)}</b><small>${esc(x.mname)} · ${x.stage === 'end' ? 'final' : 'mitad'} · ${fD(x.date, { day: 'numeric', month: 'short' })}</small>${S5(x.stars)}</div>
        ${x.text ? `<p>“${esc(x.text)}”</p>` : ''}${x.tags ? `<div class="sr-tags">${x.tags.split(', ').map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="sr-ac">${low && x.status === 'nueva' ? '<span class="sr-pill alert">Por atender</span>' : ''}${!low && x.consent && x.status === 'nueva' ? '<span class="sr-pill pub">Permite publicar</span>' : ''}${ST[x.status] || ''}${acts}</div></div>`; };
    view().innerHTML = `<div class="ad-head"><h1>⭐ Opiniones</h1>${rvSeg('s')}<p class="muted">Las dan los estudiantes de planes pagos a la mitad y al final de cada módulo.</p></div>
      <div class="sr-kpis"><div><b class="g">${r.n ? r.avg.toFixed(1) : '—'}</b><span>Promedio · ${r.n} ${r.n === 1 ? 'opinión' : 'opiniones'}</span></div><div><b>${r.good}%</b><span>Dan 4 o 5 estrellas</span></div><div class="${r.pending ? 'al' : ''}"><b>${r.pending}</b><span>Por atender (1–3 ★)</span></div></div>
      <div class="ad-grid2"><div class="card sr-mods"><h3>Promedio por módulo</h3>${r.byMod.map(m => `<div class="sr-br"><span>${esc(m.name)}</span><i><em style="width:${m.avg / 5 * 100}%"></em></i><b>${m.n ? m.avg.toFixed(1) : '—'}</b><small>${m.n}</small></div>`).join('')}</div>
        <div class="card sr-mods"><h3>Lo que más mencionan</h3>${tagTop.length ? tagTop.map(([t, n]) => `<div class="sr-br"><span>${esc(t)}</span><i><em class="b" style="width:${n / tagTop[0][1] * 100}%"></em></i><b>${n}</b></div>`).join('') : '<p class="muted">Aún no hay datos.</p>'}</div></div>
      <div class="card"><div class="sr-fil">${Object.keys(FL).map(k => `<button data-f="${k}" class="${SRF === k ? 'on' : ''}">${FL[k][0]} <small>${r.rows.filter(FL[k][1]).length}</small></button>`).join('')}</div>
        ${L.length ? L.map(row).join('') : '<p class="muted" style="margin:14px 0 4px">No hay opiniones en esta lista.</p>'}</div>`;
    rvSegWire();
    $$('[data-f]', view()).forEach(b => b.onclick = () => { SRF = b.dataset.f; schoolReviews(); });
    $$('[data-sr]', view()).forEach(b => b.onclick = async () => { b.disabled = true; const res = await api('aSchoolSet', { id: b.dataset.sr, status: b.dataset.s }); toast(res && res.ok ? '✅ Listo' : 'No se pudo completar'); schoolReviews(); });
  }
  async function teacherReviews() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando opiniones…</div>';
    const r = await api('aReviews'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar las opiniones.</p>';
    const st = (n) => '★'.repeat(+n || 0) + '☆'.repeat(5 - (+n || 0));
    view().innerHTML = `<div class="ad-head"><h1>⭐ Opiniones</h1>${rvSeg('t')}<h2 class="sr-h2">Opiniones de los profes</h2><p class="muted">Las escriben los estudiantes al terminar una clase individual. Son públicas en la página de entrada. Puedes ocultar una si es inapropiada.</p></div>
      <div class="card">${r.reviews.length ? `<div class="ad-mini">${r.reviews.map(x => `<div class="ad-mrow" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b style="color:#f5a623">${st(x.stars)}</b> · profe <b>${esc(x.teacherName)}</b><br>${x.text ? '“' + esc(x.text) + '”<br>' : ''}<small class="muted">${esc(x.studentName)} (${esc(x.code)}) · ${esc(String(x.date).slice(0, 10))}${x.status === 'oculta' ? ' · 🙈 Oculta' : ''}</small></div><button class="btn w sm" data-rv="${esc(x.id)}" data-h="${x.status === 'oculta' ? '' : '1'}">${x.status === 'oculta' ? 'Mostrar' : 'Ocultar'}</button></div>`).join('')}</div>` : '<p class="muted">Aún no hay opiniones.</p>'}</div>`;
    $$('[data-rv]').forEach(b => b.onclick = async () => { b.disabled = true; await api('aReviewSet', { id: b.dataset.rv, hide: !!b.dataset.h }); teacherReviews(); });
  }



  /* ======================= 🎁 PREMIOS DEL RETO DE PRONUNCIACIÓN ======================= */
  /* ======================= 👨‍👩‍👧 FAMILIAS (papás con hijos Kids/Teens) ======================= */
  async function families() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando familias…</div>';
    const r = await api('aFamilies'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar las familias.</p>';
    const AGN = { kids: ['fm-tag k', 'KIDS'], teens: ['fm-tag t', 'TEENS'], adult: ['fm-tag a', '18+'] };
    let q = '', onlyAl = false;
    const draw = () => {
      const rows = r.families.filter(f => (!onlyAl || f.kids.some(k => k.alert && k.idle >= 7)) && (!q || (f.fcode + ' ' + f.guardian + ' ' + f.email + ' ' + f.kids.map(k => k.name + ' ' + k.code).join(' ')).toLowerCase().indexOf(q) >= 0));
      $('#fmL', view()).innerHTML = rows.length ? rows.map(f => `<div class="sr-row"><div class="sr-rh"><b>${esc(f.guardian || '—')}</b><small>${esc(f.fcode)} · ${esc(f.email)}${f.email2 ? ' · ' + esc(f.email2) : ''}${f.whatsapp ? ' · ' + esc(f.whatsapp) : ''}</small><span class="sr-pill ${f.alerts ? 'pub' : 'hid'}" style="margin-left:auto">${f.alerts ? 'Alerta 7 días: activa' : 'Alerta apagada'}</span></div>
        <div class="fm-adk">${f.kids.map(k => { const g = AGN[k.ag] || AGN.adult; return `<div><b>${esc(k.name)}</b> <i class="${g[0]}">${g[1]}${k.age != null ? ' ' + k.age : ''}</i> <small>${esc(k.planName)} · ${esc(k.code)} · ${k.idle <= 0 ? 'activo hoy' : k.idle === 1 ? 'activo ayer' : 'hace ' + k.idle + ' días'}</small>${k.alert ? ` <span class="sr-pill alert">Alerta enviada ${fD(k.alert, { day: 'numeric', month: 'short' })}</span>` : ''}</div>`; }).join('') || '<small class="muted">Sin hijos vinculados</small>'}</div>
        <div class="sr-ac">${f.whatsapp ? `<a class="btn sm ad-wa" target="_blank" rel="noopener" href="${waLink(f.whatsapp, 'Hola ' + String(f.guardian || '').split(' ')[0] + ', te escribimos de mrarrieta.com.')}">📲 WhatsApp</a>` : ''}${f.kids.length ? `<button class="btn w sm" data-ft="${esc(f.fcode)}">✉️ Enviar alerta de prueba</button>` : ''}<button class="btn w sm" data-fa="${esc(f.fcode)}" data-on="${f.alerts ? 0 : 1}">${f.alerts ? 'Apagar alerta' : 'Activar alerta'}</button></div></div>`).join('') : '<p class="muted">No hay familias con ese filtro.</p>';
      $$('[data-ft]', view()).forEach(b => b.onclick = async () => { b.disabled = true; const x = await api('aFamTest', { fcode: b.dataset.ft }); b.disabled = false; toast(x && x.ok ? '✅ Alerta de prueba enviada a ' + x.to : 'No se pudo enviar'); });
      $$('[data-fa]', view()).forEach(b => b.onclick = async () => { b.disabled = true; const x = await api('aFamSet', { fcode: b.dataset.fa, alerts: b.dataset.on === '1' }); toast(x && x.ok ? '✅ Listo' : 'No se pudo'); families(); });
    };
    view().innerHTML = `<div class="ad-head"><h1>👨‍👩‍👧 Familias</h1><p class="muted">Papás y mamás con hijos en Kids (9–11) o Teens (12–17). El grupo de edad cambia solo con el cumpleaños. La alerta de 7 días se envía si un hijo no reserva clase (Premium) o no practica (Plataforma) en una semana.</p></div>
      <div class="sr-kpis fm-k4"><div><b>${r.kpi.families}</b><span>Familias</span></div><div><b>${r.kpi.kids}</b><span>Kids (9–11)</span></div><div><b>${r.kpi.teens}</b><span>Teens (12–17)</span></div><div><b class="r">${r.kpi.alerts}</b><span>Alertas esta semana</span></div></div>
      <div class="card"><div class="fm-adf"><input class="inp" id="fmQ" placeholder="Buscar papá, hijo o código…"><button class="btn w sm" id="fmA">Solo con alerta</button></div><div id="fmL"></div></div>`;
    $('#fmQ', view()).oninput = (e) => { q = e.target.value.trim().toLowerCase(); draw(); };
    $('#fmA', view()).onclick = (e) => { onlyAl = !onlyAl; e.target.classList.toggle('k', onlyAl); e.target.classList.toggle('w', !onlyAl); draw(); };
    draw();
  }
  async function prizes() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando premios…</div>';
    const r = await api('aPrizes'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar los premios.</p>';
    const SN = { activo: ['sr-pill pub', 'Activo'], usado: ['sr-pill ok', '✓ Usado'], vencido: ['sr-pill hid', 'Vencido'], anulado: ['sr-pill hid', 'Anulado'] };
    const pct = r.n ? Math.round(r.used / r.n * 100) : 0;
    view().innerHTML = `<div class="ad-head"><h1>🎁 Premios del reto</h1><p class="muted">Quienes pronunciaron bien la frase en la página de Adultos o de Niños y jóvenes. 10% en el primer mes · válido 3 días · uno por WhatsApp.</p></div>
      <div class="sr-kpis"><div><b>${r.n}</b><span>Ganaron el reto</span></div><div><b class="g">${r.active}</b><span>Premios activos</span></div><div><b>${r.used}</b><span>Compraron · ${pct}%</span></div></div>
      <div class="card">${r.rows.length ? r.rows.map(x => { const s = SN[x.state] || ['sr-pill', x.state]; return `<div class="sr-row${x.state === 'activo' ? '' : ''}"><div class="sr-rh"><b>${esc(x.name)}</b><small>${esc(x.code)} · ${x.page === 'ninos' ? 'Niños y jóvenes' : 'Adultos'} · ${fD(x.date, { day: 'numeric', month: 'short' })}</small><span class="${s[0]}" style="margin-left:auto">${s[1]}</span></div>
        <p style="font-size:13px;color:#475569">Vence: <b>${esc(x.until)}</b>${x.usedBy ? ` · lo usó <b>${esc(x.usedBy)}</b>` : ''}</p>
        <div class="sr-ac">${x.whatsapp ? `<a class="btn sm ad-wa" target="_blank" rel="noopener" href="${waLink(x.whatsapp, `Hola ${String(x.name).split(' ')[0]}, ¡felicitaciones por tu pronunciación! Tu código ${x.code} te da 10% en tu primer mes en mrarrieta.com, válido hasta el ${x.until}. Elige tu plan aquí: ${location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '')}adultos.html#ld-planes`)}">📲 WhatsApp</a>` : ''}${x.state === 'activo' || x.state === 'vencido' ? `<button class="btn w sm" data-pz="${esc(x.id)}" data-a="extender">+1 día</button>` : ''}${x.state === 'activo' ? `<button class="btn w sm" data-pz="${esc(x.id)}" data-a="anular">Anular</button>` : ''}</div></div>`; }).join('') : '<p class="muted">Aún nadie ha ganado el reto.</p>'}</div>`;
    $$('[data-pz]', view()).forEach(b => b.onclick = async () => { b.disabled = true; const res = await api('aPrizeSet', { id: b.dataset.pz, act: b.dataset.a }); toast(res && res.ok ? '✅ Listo' : 'No se pudo'); prizes(); });
  }
  /* ======================= 🚩 RECLAMOS (profe no se conectó) ======================= */
  async function claims() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando reclamos…</div>';
    const r = await api('aClaims'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar los reclamos.</p>';
    const ST = { pendiente: '⏳ Pendiente', aprobado: '✅ Aplicado (penalización al profe)', rechazado: '❌ Rechazado', revertido: '↩️ Revertido (fuerza mayor, sin penalización)' };
    const pend = r.claims.filter(x => x.status === 'pendiente').length; const bd = $('[data-b="claims"]'); if (bd) { bd.textContent = pend || ''; bd.style.display = pend ? '' : 'none'; }
    view().innerHTML = `<div class="ad-head"><h1>🚩 Reclamos</h1><p class="muted">El estudiante reporta que su profe no se conectó (de 15 min a 24 h después de la clase). Si el profe <b>no había marcado</b> la clase, se aplica de una: la clase vuelve al estudiante y se descuenta la penalización al profe. Si el profe <b>ya la había marcado</b>, queda pendiente: resuélvelo en máximo 24 horas.</p></div>
      <div class="card">${r.claims.length ? `<div class="ad-mini">${r.claims.map(x => `<div class="ad-mrow" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px"><b>${esc(x.studentName)}</b> <span class="muted">(${esc(x.code)})</span> → profe <b>${esc(x.teacherName)}</b><br><small class="muted">Clase: ${esc(fD(x.classDate))} · ${esc(fT(x.classTime))} · ${ST[x.status] || esc(x.status)}${x.auto ? ' · automático' : ''}${x.note ? '<br>💬 ' + esc(x.note) : ''}${x.adminNote ? '<br>📝 ' + esc(x.adminNote) : ''}</small></div>
        ${x.status === 'pendiente' ? `<button class="btn k sm" data-ca="approve" data-id="${esc(x.id)}">✅ Aprobar</button><button class="btn w sm" data-ca="reject" data-id="${esc(x.id)}">❌ Rechazar</button>` : x.status === 'aprobado' ? `<button class="btn w sm" data-ca="revert" data-id="${esc(x.id)}">↩️ Revertir (fuerza mayor)</button>` : ''}</div>`).join('')}</div>` : '<p class="muted">No hay reclamos. 🙌</p>'}</div>`;
    $$('[data-ca]').forEach(b => b.onclick = async () => { const act = b.dataset.ca; const Q = { approve: ['¿Aprobar? La clase vuelve al estudiante y se descuenta la penalización al profe.', ''], reject: ['Motivo del rechazo (lo verá el estudiante):', 'Según el registro, la clase sí se dictó.'], revert: ['Motivo (fuerza mayor). Se quita la penalización al profe; la clase sigue devuelta al estudiante:', 'Fuerza mayor'] }[act];
      let note = ''; if (act === 'approve') { if (!confirm(Q[0])) return; } else { note = prompt(Q[0], Q[1]); if (note === null) return; }
      b.disabled = true; const x = await api('aClaimDecide', { id: b.dataset.id, act, note }); toast(x.ok ? '✅ Listo' : 'No se pudo'); claims(); });
  }

  /* ======================= 📣 INTERESADOS ======================= */
  async function leads() {
    view().innerHTML = '<div class="ad-loading">⏳ Cargando interesados…</div>';
    const r = await api('aLeads'); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudieron cargar los interesados.</p>';
    const S = r.stats, ST = { activo: ['🟢', 'Recibiendo correos'], pausado: ['⏸️', 'Pausado'], baja: ['🚫', 'Se dio de baja'], estudiante: ['🎓', 'Ya es estudiante'] };
    const kpi = (n, l, sub, cls) => `<div class="ad-kpi ${cls || ''}"><b>${n}</b><span>${l}</span>${sub ? `<em>${sub}</em>` : ''}</div>`;
    view().innerHTML = `<div class="ad-head"><h1>📣 Interesados</h1></div>
      <div class="card"><p class="muted" style="margin-top:0">Cada interesado recibe un correo con los beneficios de la escuela a las 8 a. m.: <b>el primer mes los lunes y jueves</b> (8 correos) y <b>después uno cada lunes</b>, sin copia a administración, con el botón <b>"Pedir mi acceso gratuito"</b>. Los estudiantes gratuitos que terminan su acceso sin inscribirse se agregan aquí automáticamente. Los correos se detienen solos cuando la persona se inscribe (plan pago) o se da de baja. Los lunes recibes el resumen semanal con estadísticas.</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px"><input class="inp" id="ld-n" placeholder="Nombre" style="flex:1 1 180px"><input class="inp" id="ld-e" type="email" placeholder="Correo" style="flex:1 1 220px"><button class="btn k" id="ld-add">➕ Agregar</button></div></div>
      <div class="ad-kpis">${kpi(S.active, '🟢 Recibiendo correos')}${kpi(S.newWeek, '🆕 Nuevos', 'últimos 7 días')}${kpi(S.clickersWeek, '🔥 Dieron clic', S.clicksWeek + ' clics esta semana', 'prem')}${kpi(S.students, '🎓 Ya son estudiantes', '', 'free')}${kpi(S.unsub, '🚫 Se dieron de baja', '', 'exp')}${kpi(S.total, 'Total registrados')}</div>
      <div class="card"><h3 style="margin-top:0">Lista (${r.leads.length})</h3>${r.leads.length ? `<div class="ad-mini">${r.leads.map(l => `<div class="ad-mrow" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:200px"><b>${esc(l.name)}</b> <span class="muted">${esc(l.email)}</span><br><small class="muted">${(ST[l.status] || ['', l.status]).join(' ')} · ${l.source === 'popup' ? 'Se registró en la plataforma' : l.source === 'trial' ? 'Terminó su acceso gratuito' : 'Agregado por administración'} · ${esc(String(l.date).slice(0, 10))} · ✉️ ${l.sent} enviados · 👆 ${l.clicks} clic(s)</small></div>
        ${l.status === 'activo' ? `<button class="btn w sm" data-ls="${l.id}" data-st="pausado">⏸️ Pausar</button>` : l.status === 'pausado' || l.status === 'baja' ? `<button class="btn w sm" data-ls="${l.id}" data-st="activo">▶️ Activar</button>` : ''}<button class="btn w sm" data-le="${l.id}" title="Corregir nombre o correo">✏️</button><button class="btn w sm" data-ld="${l.id}" title="Borrar">🗑️</button></div>`).join('')}</div>` : '<p class="muted">Todavía no hay interesados. Agrega el primero arriba 👆</p>'}</div>`;
    $('#ld-add').onclick = async () => { const name = $('#ld-n').value.trim(), email = $('#ld-e').value.trim(); if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return toast('Escribe un nombre y un correo válido');
      $('#ld-add').disabled = true; const x = await api('aLeadAdd', { name, email }); $('#ld-add').disabled = false;
      if (!x.ok) return toast('No se pudo agregar'); toast(x.student ? '🎓 Ese correo ya es de un estudiante' : x.exists ? 'Ese correo ya estaba en la lista' : '✅ Agregado · le enviamos el correo de bienvenida'); leads(); };
    $$('[data-ls]').forEach(b => b.onclick = async () => { await api('aLeadSet', { id: b.dataset.ls, status: b.dataset.st }); leads(); });
    $$('[data-le]').forEach(b => b.onclick = () => { const l = r.leads.find(x => x.id === b.dataset.le); if (!l) return;
      const m = modal(`<h3>✏️ Corregir interesado</h3><label class="ad-lab">Nombre</label><input class="inp" id="le-n" value="${esc(l.name)}"><label class="ad-lab">Correo</label><input class="inp" id="le-e" type="email" value="${esc(l.email)}"><button class="btn k block" id="le-sv" style="margin-top:12px">💾 Guardar</button>`) || document.querySelector('.ad-modal:last-child');
      m.querySelector('#le-sv').onclick = async () => { const name = m.querySelector('#le-n').value.trim(), email = m.querySelector('#le-e').value.trim();
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return toast('Escribe un nombre y un correo válido');
        const x = await api('aLeadSet', { id: l.id, name, email }); if (!x.ok) return toast(x.err === 'dup' ? 'Ese correo ya está en la lista' : 'No se pudo guardar');
        m.remove(); toast('✅ Datos corregidos'); leads(); }; });
    $$('[data-ld]').forEach(b => b.onclick = async () => { if (!confirm('¿Borrar este interesado?')) return; await api('aLeadSet', { id: b.dataset.ld, del: true }); leads(); });
  }

  function chats() {
    view().innerHTML = `<div class="ad-head"><h1>💬 Chats profe ↔ estudiante</h1></div><div class="card"><p class="muted">Aquí puedes leer todas las conversaciones entre profes y estudiantes (solo lectura). En el chat se les informa que administración puede revisar las conversaciones.</p><button class="btn k lg" id="ch-open">💬 Abrir conversaciones</button></div>`;
    const go = () => window.MRLIVE && MRLIVE.open({ title: 'Chats (solo lectura)', roomsAction: 'aChats', getAction: 'aChatGet', readOnly: true, empty: 'Todavía no hay conversaciones.', call: (a, d) => api(a, d) });
    $('#ch-open').onclick = go; go();
  }
  // 📄 contratos de los profes: editar el texto, publicar nueva versión y ver quién aceptó
  let CTK = 'teacher';
  async function contracts(kind) {
    if (typeof kind === 'string') CTK = kind; const K = CTK; const TT = { teacher: ['🧑‍🏫', 'Contrato de profesores', 'contrato'], premium: ['👑', 'Acuerdo Premium', 'acuerdo'], membership: ['🖥️', 'Acuerdo Plataforma', 'acuerdo'] };
    view().innerHTML = '<div class="ad-loading">⏳ Cargando…</div>';
    const r = await api('aContract', { kind: K }); if (!r.ok) return view().innerHTML = '<p class="ad-err">No se pudo cargar.</p>';
    const fD2 = (d) => d ? fDT(d) : '—';
    view().innerHTML = `<div class="ad-head"><h1>📄 Contratos y acuerdos</h1><div class="ad-cttabs">${Object.keys(TT).map(k => `<button class="btn ${k === K ? 'k' : 'w'} sm" data-ctk="${k}">${TT[k][0]} ${TT[k][1]}</button>`).join('')}</div><p class="muted">Versión vigente: <b>${esc(r.version)}</b>${r.date ? ' · publicada ' + fD2(r.date) : ' · texto inicial'}. ${K === 'teacher' ? 'Cada profe lo acepta una vez por versión y cada enero se vuelve a pedir.' : 'Cada estudiante con este plan lo acepta una vez por versión (y otra vez si cambia de plan).'}</p></div>
      ${K !== 'teacher' ? '' : r.pending.length ? `<div class="card ad-ctpend">⏳ <b>Pendientes por aceptar (${r.pending.length}):</b> ${r.pending.map(esc).join(', ')}</div>` : '<div class="card ad-ctpend ok">✅ Todos los profes activos aceptaron la versión vigente.</div>'}
      <div class="card"><h3>✏️ Texto del ${TT[K][2]}</h3><p class="muted" style="font-size:13px">Datos automáticos: ${K === 'teacher' ? '<code>{NOMBRE}</code> <code>{CEDULA}</code> <code>{EXPEDICION}</code> <code>{SENORA}</code> (la señora / el señor) <code>{INICIO}</code> <code>{FIN}</code> <code>{TARIFA}</code> <code>{INASISTENCIA}</code> <code>{MULTA}</code> <code>{CODIGO}</code>' : '<code>{NOMBRE}</code> <code>{CODIGO}</code> <code>{CORREO}</code> <code>{PLAN}</code> <code>{CLASES}</code>'}. Formato: <code># Título</code>, <code>## Cláusula</code>, <code>- viñeta</code>, <code>**negrita**</code>. Las tarifas salen de Ajustes.</p>
        <textarea class="inp" id="ct-tx" rows="22" style="width:100%;text-align:left;font:13px/1.5 ui-monospace,Consolas,monospace">${esc(r.text)}</textarea>
        <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn k" id="ct-pub">📢 Publicar nueva versión</button><small class="muted">Al publicar, ${K === 'teacher' ? 'todos los profes' : 'todos los estudiantes con este plan'} deberán aceptarla de nuevo la próxima vez que entren.</small></div></div>
      <div class="card"><h3>✅ Aceptaciones</h3>${r.accepts.length ? `<div class="ad-mini">${r.accepts.map(a => `<div class="ad-mrow"><b>${esc(a.name)} · ${K === 'teacher' ? 'C.C. ' : ''}${esc(a.doc)}</b><span>${fD2(a.date)} · versión ${esc(a.version)}${a.year ? ' · año ' + esc(a.year) : ''}</span></div>`).join('')}</div>` : '<p class="muted">Aún nadie ha aceptado.</p>'}</div>`;
    $$('[data-ctk]').forEach(b => b.onclick = () => contracts(b.dataset.ctk));
    $('#ct-pub').onclick = () => { const tx = $('#ct-tx').value; if (tx.trim() === String(r.text).trim()) return toast('No hay cambios para publicar');
      const m = modal(`<div class="center"><div style="font-size:44px">📢</div><h2>¿Publicar nueva versión?</h2><p class="muted">${K === 'teacher' ? 'Todos los profes' : 'Todos los estudiantes con este plan'} deberán leerla y aceptarla otra vez al entrar.</p><div class="row" style="justify-content:center"><button class="btn w" id="cp-n">Cancelar</button><button class="btn k" id="cp-y">Sí, publicar</button></div></div>`);
      $('#cp-n', m).onclick = () => m.remove(); $('#cp-y', m).onclick = async () => { $('#cp-y', m).disabled = true; const x = await api('aContractSave', { text: tx, kind: K }); m.remove(); if (x.ok) { toast('📢 Publicada la versión ' + x.version); contracts(); } else toast(x.err === 'corto' ? 'El texto es muy corto' : 'No se pudo publicar'); }; };
  }
  const VIEWS = { families, prizes, today, contracts, boards, tes, buys, claims, reviews, home, students, enroll, leads, placement, recruit, teachers, classes, requests, chats, settings };
  key() && MRAC.on ? boot() : login();
})();
