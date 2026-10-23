/* 👨‍👩‍👧 PANEL DE PAPÁS (código de familia FAM-…): ven a sus hijos, su clase o práctica, su nivel y manejan la alerta de 7 días */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app'), I = (n) => window.MRI ? MRI(n) : '';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } } };
  const LV = ['', 'A1 · Elemental', 'A2 · Básico', 'B1 · Intermedio', 'B2+ · Avanzado'];
  const AG = { kids: ['k', 'KIDS'], teens: ['t', 'TEENS'], adult: ['a', 'ADULTOS'] };
  const ago = (d) => d <= 0 ? 'Hoy' : d === 1 ? 'Ayer' : 'Hace ' + d + ' días';
  let F = null;

  function topRight(on) { $('#tb-r').innerHTML = on ? `<button class="btn w sm fm-out" id="out">${I('logout')} Salir</button>` : ''; if (on) $('#out').onclick = () => { LS.set('mra_fam', null); location.href = 'index.html'; }; }

  function login(msg) {
    topRight(false);
    app.innerHTML = `<section class="card fm-login"><img src="mra-smile.webp" alt="Mr. Arrieta"><div><span class="fm-eye">${I('users')} Mi familia</span><h1>Panel de papás</h1>
      <p class="muted">Escribe tu código de familia. Lo encuentras en el correo de bienvenida de tu hijo(a).</p>
      <input class="inp" id="fc" placeholder="FAM-…" autocomplete="off" autocapitalize="characters"><button class="btn k block lg" id="go">Entrar →</button><p class="fm-err" id="er">${esc(msg || '')}</p></div></section>`;
    const go = async () => { const v = $('#fc').value.trim().toUpperCase(); if (!/^FAM-/.test(v)) return ($('#er').textContent = 'El código de familia empieza por FAM-.'); $('#go').disabled = true;
      const r = await MRAC.call('famData', { fcode: v }).catch(() => null); $('#go').disabled = false;
      if (!r || !r.ok) return ($('#er').textContent = r && r.err === 'notfound' ? 'No encontramos ese código. Revísalo e inténtalo de nuevo.' : 'No hay conexión. Inténtalo de nuevo.');
      LS.set('mra_fam', v); LS.set('mra_last_role', JSON.stringify({ role: 'family' })); render(r); };
    $('#go').onclick = go; $('#fc').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  }

  function kidCard(k, i) {
    const g = AG[k.ag] || AG.adult, prem = /^premium/.test(k.plan);
    const mini = prem
      ? `<div class="fm-mini"><small>Próxima clase</small><b>${I('calendar')}${k.next ? esc(k.next.nice) : 'Sin reservar'}</b></div><div class="fm-mini"><small>Clases del mes</small><b>${k.credits ? k.credits.used + ' de ' + k.credits.total : '—'}</b></div>`
      : `<div class="fm-mini${k.idle >= 5 ? ' w' : ''}"><small>Última práctica</small><b>${I('clock')}${ago(k.idle)}</b></div><div class="fm-mini"><small>Su nivel</small><b>${k.module ? LV[k.module] : 'Por definir'}</b></div>`;
    return `<article class="card fm-kid" data-i="${i}"><button class="fm-kh" data-tg="${i}"><span class="fm-av ${g[0]}">${esc((k.first || '?').charAt(0))}</span><span class="fm-kn"><b>${esc(k.first)} ${esc(k.lastName || '')}</b><span><i class="fm-tag ${g[0]}">${g[1]}${k.age != null ? ' · ' + k.age + ' AÑOS' : ''}</i>${esc(k.planName)}</span></span><span class="fm-go">${I('chev')}</span></button>
      <div class="fm-row">${mini}</div>
      <div class="fm-more" hidden><p>Código de ${esc(k.first)}: <b>${esc(k.code)}</b></p><button class="btn w sm" data-in="${esc(k.code)}">Entrar como ${esc(k.first)}</button></div></article>`;
  }

  function render(r) {
    F = r; topRight(true); const f = r.family, kids = r.kids || [];
    const first = String(f.guardian || '').split(' ')[0] || 'familia';
    app.innerHTML = `<section class="fm-hero"><div><span class="fm-eye">${I('users')} Mi familia</span><h1>¡Hola, ${esc(first)}!</h1><p>Aquí ves a tus hijos y cómo van con su inglés.</p></div><img src="mra-smile.webp" alt="Mr. Arrieta"></section>
      <div class="fm-code"><div><small>Tu código de familia</small><b>${esc(f.fcode)}</b></div><button class="fm-cp" id="cp">${I('copy')} Copiar</button></div>
      <div class="fm-st"><h2>Mis hijos</h2><small>${kids.length} de 3</small></div>
      <div class="fm-kids">${kids.length ? kids.map(kidCard).join('') : '<p class="muted center">Aún no hay hijos vinculados a esta familia.</p>'}</div>
      ${kids.length < 3 ? `<button class="fm-add" id="add">${I('plus')} Agregar otro hijo(a)</button>` : ''}
      <div class="fm-al"><span class="fm-ali">${I('mail')}</span><span><b>Alerta de 7 días</b><br>Te escribimos si pasa una semana sin reservar clase (Premium) o sin practicar (Plataforma).</span><button class="fm-sw${f.alerts ? ' on' : ''}" id="sw" role="switch" aria-checked="${!!f.alerts}" aria-label="Alerta de 7 días"></button></div>
      <p class="fm-help">¿Dudas? Escríbenos por WhatsApp <a href="https://wa.me/573017810841" target="_blank" rel="noopener">301 781 0841</a></p>`;
    $('#cp').onclick = () => { try { navigator.clipboard.writeText(f.fcode); $('#cp').innerHTML = I('check') + ' Copiado'; } catch (e) { } };
    app.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => { const m = b.closest('.fm-kid').querySelector('.fm-more'); m.hidden = !m.hidden; b.classList.toggle('open', !m.hidden); });
    app.querySelectorAll('[data-in]').forEach(b => b.onclick = () => { try { sessionStorage.setItem('mra_autocode', b.dataset.in); } catch (e) { } location.href = 'index.html'; });
    const add = $('#add'); if (add) add.onclick = () => { LS.set('mra_fam_prefill', JSON.stringify({ guardian: f.guardian, email: f.email, email2: f.email2, whatsapp: f.whatsapp })); location.href = 'ninos.html?prueba=hijo'; };
    $('#sw').onclick = async () => { const on = !$('#sw').classList.contains('on'); $('#sw').classList.toggle('on', on); $('#sw').setAttribute('aria-checked', on);
      const x = await MRAC.call('famAlerts', { fcode: f.fcode, on }).catch(() => null); if (!x || !x.ok) { $('#sw').classList.toggle('on', !on); } };
  }

  async function start() {
    const fc = LS.get('mra_fam'); if (!fc) return login();
    const r = await MRAC.call('famData', { fcode: fc }).catch(() => null);
    if (!r || !r.ok) { if (r && r.err === 'notfound') LS.set('mra_fam', null); return login(r && r.err === 'notfound' ? '' : 'No hay conexión con la nube. Inténtalo de nuevo.'); }
    render(r);
  }
  start();
})();
