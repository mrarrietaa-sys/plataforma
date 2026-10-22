/* =====================================================================
   ⭐ OPINIÓN DE LA ESCUELA — aparece a la mitad y al final de cada módulo
   · Solo planes pagos (Plataforma y Premium) · una vez por etapa
   · Estrellas obligatorias para continuar · comentario y etiquetas opcionales
   · 4–5★: invita a calificarnos en Google · 1–3★: administración lo contacta
   ===================================================================== */
(function () {
  'use strict';
  const GOOGLE = 'https://g.page/r/CSz_ib_w-ctREAE/review';
  const MODN = { A1: 'Módulo 1 · A1', A2: 'Módulo 2 · A2', B2: 'Módulo 3 · B1', 'B2+': 'Módulo 4 · B2+' };
  const TAGS = ['Los profes', 'Practicar con voz', 'Las clases', 'Los juegos', 'Los horarios', 'La plataforma', 'Los temas', 'El precio'];
  const LAB = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', '¡Excelente!'];
  const PEND = 'mra_srv_pending';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"/></svg>';
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
  const GLOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';

  const prof = () => { try { return JSON.parse(localStorage.getItem('mra_profile_v1') || 'null'); } catch (e) { return null; } };
  const doneList = () => { const p = prof() || {}; return Array.isArray(p.sr) ? p.sr : []; };
  function markDone(key) { const p = prof(); if (!p) return; p.sr = Array.from(new Set([...(Array.isArray(p.sr) ? p.sr : []), key])); try { localStorage.setItem('mra_profile_v1', JSON.stringify(p)); } catch (e) { } }
  function eligible() {
    const P = window.MRAP; if (!P || !P.get() || !window.MRAC) return false; const p = P.get();
    if (!p.cloud || !p.code || P.isStaff() || P.isTrial() || (P.isExpired && P.isExpired())) return false;
    if (window.MRTEACH && MRTEACH.on && MRTEACH.on()) return false;
    return !!(P.plan && P.plan().paid);
  }
  async function send(o) {
    try { const r = await MRAC.call('srAdd', Object.assign({ code: MRAC.code() }, o)); if (r && r.ok) return true; if (r && (r.err === 'plan' || r.err === 'module')) return true; } catch (e) { }
    try { localStorage.setItem(PEND, JSON.stringify(o)); } catch (e) { } return false; // sin internet: se reintenta la próxima vez
  }
  async function retry() { let o = null; try { o = JSON.parse(localStorage.getItem(PEND) || 'null'); } catch (e) { } if (!o) return; try { const r = await MRAC.call('srAdd', Object.assign({ code: MRAC.code() }, o)); if (r && r.ok) localStorage.removeItem(PEND); } catch (e) { } }

  /* ctx = { mod: 'A1', done: n partes completadas, total: n partes, review: bool } */
  function check(ctx) {
    if (!ctx || !MODN[ctx.mod] || ctx.review || !ctx.total || document.querySelector('.srv')) return false;
    if (!eligible()) return false; retry();
    const d = doneList(); const f = ctx.done / ctx.total;
    let stage = null;
    if (f >= 1 && d.indexOf(ctx.mod + '|end') < 0) stage = 'end';
    else if (f >= .5 && f < 1 && d.indexOf(ctx.mod + '|mid') < 0) stage = 'mid';
    if (!stage) return false; setTimeout(() => open(ctx.mod, stage), 700); return true;
  }

  function open(mod, stage) {
    const P = window.MRAP, p = P.get() || {}, first = (P.look && P.look().nick) || p.first || '';
    let stars = 0; const tags = new Set();
    const ov = document.createElement('div'); ov.className = 'srv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="srv-card">
      <div class="srv-top"><img class="srv-mra" src="mra-wink.webp" alt="Mr. Arrieta" draggable="false"></div>
      <span class="srv-chip">${MODN[mod]} · ${stage === 'end' ? 'Módulo completado' : 'Mitad del camino'}</span>
      <h3>${stage === 'end' ? '¡Terminaste el módulo' + (first ? ', ' + esc(first) : '') + '!' : '¿Cómo vas con nosotros' + (first ? ', ' + esc(first) : '') + '?'}</h3>
      <p class="srv-sub">Califica tu experiencia en mrarrieta.com. Te toma 20 segundos.</p>
      <div class="srv-stars" role="radiogroup" aria-label="Calificación">${[1, 2, 3, 4, 5].map(k => `<button type="button" data-s="${k}" role="radio" aria-label="${k} estrella${k > 1 ? 's' : ''}">${STAR}</button>`).join('')}</div>
      <div class="srv-lab" id="srv-lab">Toca las estrellas</div>
      <div class="srv-more" id="srv-more" hidden>
        <p class="srv-q" id="srv-q"></p>
        <div class="srv-tags">${TAGS.map(t => `<button type="button" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
        <textarea id="srv-t" rows="3" maxlength="600" placeholder="Cuéntanos con tus palabras (opcional)"></textarea>
        <label class="srv-ok" id="srv-ok" hidden><input type="checkbox" id="srv-c"><span>Acepto que mrarrieta.com publique mi opinión con mi nombre.</span></label>
      </div>
      <button class="srv-go" id="srv-go" disabled>Enviar y continuar</button>
      <p class="srv-note">Las estrellas son obligatorias para continuar · lo demás es opcional</p>
    </div>`;
    document.body.appendChild(ov); document.body.classList.add('srv-lock');
    requestAnimationFrame(() => ov.classList.add('on'));
    const $ = (s) => ov.querySelector(s), $$ = (s) => [...ov.querySelectorAll(s)];
    const paint = (n) => $$('.srv-stars button').forEach(b => b.classList.toggle('on', +b.dataset.s <= n));
    $$('.srv-stars button').forEach(b => {
      b.onmouseenter = () => paint(+b.dataset.s); b.onmouseleave = () => paint(stars);
      b.onclick = () => { stars = +b.dataset.s; paint(stars); $$('.srv-stars button').forEach(x => x.setAttribute('aria-checked', String(+x.dataset.s === stars)));
        $('#srv-lab').textContent = LAB[stars]; $('#srv-lab').className = 'srv-lab s' + stars;
        $('#srv-more').hidden = false; $('#srv-go').disabled = false;
        $('#srv-q').textContent = stars >= 4 ? '¿Qué es lo que más te gusta?' : stars === 3 ? '¿Qué podríamos hacer mejor?' : '¿Qué no te está gustando? Queremos arreglarlo.';
        $('#srv-ok').hidden = stars < 4; if (stars < 4) $('#srv-c').checked = false; };
    });
    $$('.srv-tags button').forEach(b => b.onclick = () => { const t = b.dataset.t; tags.has(t) ? tags.delete(t) : tags.add(t); b.classList.toggle('on', tags.has(t)); });
    $('#srv-go').onclick = async () => {
      if (!stars) return; const go = $('#srv-go'); go.disabled = true; go.textContent = 'Enviando…';
      const text = $('#srv-t').value.trim();
      const o = { module: mod, stage, stars, tags: [...tags], text, consent: !!$('#srv-c').checked };
      await send(o); markDone(mod + '|' + stage); if (stage === 'end') markDone(mod + '|mid');
      thanks(ov, stars, text, first);
    };
  }

  function close(ov) { ov.classList.remove('on'); document.body.classList.remove('srv-lock'); setTimeout(() => ov.remove(), 250); }
  function thanks(ov, stars, text, first) {
    const card = ov.querySelector('.srv-card'); const good = stars >= 4;
    card.innerHTML = good ? `<div class="srv-top"><img class="srv-mra" src="mra-celebrate.webp" alt="Mr. Arrieta" draggable="false"></div>
      <div class="srv-st5">${STAR.repeat(stars)}</div>
      <h3>¡Gracias${first ? ', ' + esc(first) : ''}!</h3>
      <p class="srv-sub">¿Nos ayudas a que más personas conozcan mrarrieta.com? Comparte tu opinión en Google. Te toma 1 minuto.</p>
      ${text ? `<blockquote class="srv-quote">“${esc(text)}”</blockquote><p class="srv-copied" id="srv-cp" hidden>✓ Copiamos tu opinión: solo pégala en Google</p>` : ''}
      <a class="srv-g" id="srv-g" href="${GOOGLE}" target="_blank" rel="noopener">${GLOGO}<span>Calificarnos en Google</span></a>
      <button class="srv-skip" id="srv-x">Ahora no, continuar</button>`
      : `<div class="srv-heart">${HEART}</div>
      <div class="srv-st5 low">${STAR.repeat(stars)}${Array(5 - stars).fill('<i>' + STAR + '</i>').join('')}</div>
      <h3>Gracias por decírnoslo${first ? ', ' + esc(first) : ''}</h3>
      <p class="srv-sub">Tu opinión nos importa mucho. Nuestro equipo la revisará y te escribiremos por WhatsApp para ayudarte.</p>
      <button class="srv-go" id="srv-x">Continuar</button>
      <a class="srv-glink" href="${GOOGLE}" target="_blank" rel="noopener">También puedes dejar tu opinión en Google</a>`;
    const g = card.querySelector('#srv-g');
    if (g && text) g.addEventListener('click', () => { try { navigator.clipboard && navigator.clipboard.writeText(text); const c = card.querySelector('#srv-cp'); if (c) c.hidden = false; } catch (e) { } });
    if (g) g.addEventListener('click', () => setTimeout(() => close(ov), 600));
    card.querySelector('#srv-x').onclick = () => close(ov);
  }
  window.MRSRV = { check, open };
})();
