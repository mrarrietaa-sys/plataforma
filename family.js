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
      LS.set('mra_fam', v); LS.set('mra_last_role', JSON.stringify({ role: 'family' })); try { sessionStorage.setItem('mra_fam_hi', '1'); } catch (e) { } render(r); };
    $('#go').onclick = go; $('#fc').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  }

  function kidCard(k, i) {
    const g = AG[k.ag] || AG.adult, prem = /^premium/.test(k.plan);
    const mini = prem
      ? `<div class="fm-mini"><small>Próxima clase</small><b>${I('calendar')}${k.next ? esc(k.next.nice) : 'Sin reservar'}</b></div><div class="fm-mini"><small>Clases del mes</small><b>${k.credits ? k.credits.used + ' de ' + k.credits.total : '—'}</b></div>`
      : `<div class="fm-mini${k.idle >= 5 ? ' w' : ''}"><small>Última práctica</small><b>${I('clock')}${ago(k.idle)}</b></div><div class="fm-mini"><small>Su nivel</small><b>${k.module ? LV[k.module] : 'Por definir'}</b></div>`;
    return `<article class="card fm-kid" data-i="${i}"><button class="fm-kh" data-tg="${i}"><span class="fm-kn"><b>${esc(k.first)} ${esc(k.lastName || '')}</b><span><i class="fm-tag ${g[0]}">${g[1]}${k.age != null ? ' · ' + k.age + ' AÑOS' : ''}</i>${esc(k.planName)}</span></span><span class="fm-go">${I('chev')}</span></button>
      <div class="fm-row">${mini}</div>
      <div class="fm-more" hidden><p>Código de ${esc(k.first)}: <b>${esc(k.code)}</b></p><button class="btn w sm" data-in="${esc(k.code)}">Entrar como ${esc(k.first)}</button></div></article>`;
  }

  function render(r) {
    F = r; topRight(true); const f = r.family, kids = r.kids || [];
    const first = String(f.guardian || '').split(' ')[0] || 'familia';
    const ini = String(f.guardian || 'F').split(' ').filter(Boolean).slice(0, 2).map(x => x.charAt(0)).join('').toUpperCase();
    app.innerHTML = `<div class="fm-grid"><aside class="fm-side">
        <div class="card fm-pc"><span class="fm-pav">${esc(ini)}</span><h2>${esc(f.guardian || 'Mi familia')}</h2><p>Acudiente · ${kids.length} ${kids.length === 1 ? 'hijo(a)' : 'hijos'}</p>
          <div class="fm-code"><div><small>Tu código de familia</small><b>${esc(f.fcode)}</b></div><button class="fm-cp" id="cp">${I('copy')} Copiar</button></div></div>
        <div class="fm-al"><span class="fm-ali">${I('mail')}</span><span><b>Alerta de 7 días</b><br>Te escribimos si tu hijo pasa una semana sin clases o sin practicar.</span><button class="fm-sw${f.alerts ? ' on' : ''}" id="sw" role="switch" aria-checked="${!!f.alerts}" aria-label="Alerta de 7 días"></button></div>
        <p class="fm-help"><button class="fm-tourb" id="tourb">Ver recorrido</button> · ¿Dudas? WhatsApp <a href="https://wa.me/573017810841" target="_blank" rel="noopener">301 781 0841</a></p></aside>
      <div class="fm-main"><section class="fm-hero"><span class="fm-hb1"></span><span class="fm-hb2"></span><span class="fm-hdots"></span>
          <div class="fm-htx"><span class="fm-eye">${I('users')} Mi familia</span><h1>¡Hola, ${esc(first)}!</h1><p>Aquí ves a tus hijos y cómo van con su inglés: sus clases, su práctica y su nivel.</p>
            <div class="fm-hst"><span><i>${I('users')}</i><b>${kids.length}</b><small>${kids.length === 1 ? 'Hijo(a)' : 'Hijos'}</small></span><span><i>${I('calendar')}</i><b>${kids.filter(k => k.next).length}</b><small>Con clase reservada</small></span><span><i>${I('mail')}</i><b>${f.alerts ? 'Activa' : 'Apagada'}</b><small>Alerta de 7 días</small></span></div></div>
          <div class="fm-hart"><span class="fm-road"></span><img src="mra-x-bike-blue.webp" alt="Mr. Arrieta"></div></section>
        <div class="fm-st"><h2>Mis hijos</h2><small>${kids.length} de 3${kids.length > 1 ? '<span class="fm-sw2"> · desliza →</span>' : ''}</small></div>
        <div class="fm-kids">${kids.length ? kids.map(kidCard).join('') : '<p class="muted center">Aún no hay hijos vinculados a esta familia.</p>'}${kids.length < 3 ? `<button class="fm-add" id="add">${I('plus')} Agregar otro hijo(a)</button>` : ''}</div></div></div>`;
    $('#tourb').onclick = () => tour();
    let hi = ''; try { hi = sessionStorage.getItem('mra_fam_hi'); sessionStorage.removeItem('mra_fam_hi'); } catch (e) { }
    if (hi) welcome(first, String(f.guardian || '').trim().split(/\s+/)[0]);
    else if (!LS.get('mra_fam_tour')) setTimeout(tour, 700);
    $('#cp').onclick = () => { try { navigator.clipboard.writeText(f.fcode); $('#cp').innerHTML = I('check') + ' Copiado'; } catch (e) { } };
    app.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => { const m = b.closest('.fm-kid').querySelector('.fm-more'); m.hidden = !m.hidden; b.classList.toggle('open', !m.hidden); });
    app.querySelectorAll('[data-in]').forEach(b => b.onclick = () => { try { sessionStorage.setItem('mra_autocode', b.dataset.in); } catch (e) { } location.href = 'index.html'; });
    const add = $('#add'); if (add) add.onclick = () => { LS.set('mra_fam_prefill', JSON.stringify({ guardian: f.guardian, email: f.email, email2: f.email2, whatsapp: f.whatsapp })); location.href = 'ninos.html?prueba=hijo'; };
    $('#sw').onclick = async () => { const on = !$('#sw').classList.contains('on'); $('#sw').classList.toggle('on', on); $('#sw').setAttribute('aria-checked', on);
      const x = await MRAC.call('famAlerts', { fcode: f.fcode, on }).catch(() => null); if (!x || !x.ok) { $('#sw').classList.toggle('on', !on); } };
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
      ['.fm-hero', 'Bienvenido a tu panel de familia', 'Aquí ves de un vistazo cuántos hijos tienes en la escuela, cuántos tienen clase reservada y si tu alerta está activa.'],
      ['.fm-code', 'Tu código de familia', 'Con este código entras siempre a este panel. Escríbelo en «Ingresar», en el mismo lugar donde entran los estudiantes.'],
      ['.fm-kid', 'Cada uno de tus hijos', 'Ves su grupo (Kids o Teens), su plan, su próxima clase o su última práctica y su nivel. Toca la flecha para ver su código y entrar como él.'],
      ['.fm-al', 'Alerta de 7 días', 'Si tu hijo pasa una semana sin reservar clase o sin practicar, te escribimos al correo. Puedes apagarla aquí cuando quieras.']].filter(x => document.querySelector(x[0]));
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
  start();
})();
