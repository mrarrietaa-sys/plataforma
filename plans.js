/* =====================================================================
   PLANES — 🎁 Acceso gratuito · 🖥️ Plataforma · 🎓 Premium · 4 clases · 🏅 Premium · 8 clases
   Precios: los define administración (nube); aquí solo hay valores por defecto.
   Elegir un plan abre la compra (Mercado Pago o transferencia con comprobante).
   ===================================================================== */
(function () {
  const C = window.M1CONFIG || {};
  const fmt = (n) => '$' + String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const PL = {
    membership: { name: '🖥️ PLATAFORMA', price: '$59.900', per: 'COP/mes', n: 59900, classes: 0 },
    premium: { name: '🎓 PREMIUM · 4 CLASES', price: '$169.900', per: 'COP/mes', n: 169900, classes: 4 },
    premium8: { name: '🏅 PREMIUM · 8 CLASES', price: '$289.900', per: 'COP/mes', n: 289900, classes: 8 },
  };
  const FREE = { name: '🎁 ACCESO GRATUITO', price: '$0', per: 'COP · prueba de 3 días' };
  let EXTRA = 39900;
  // precios vigentes desde la nube (los cambia administración)
  function applyCat(cat) { try { if (!cat || !cat.plans) return; Object.keys(PL).forEach(k => { const p = cat.plans[k]; if (p && p.price) { PL[k].n = +p.price; PL[k].price = fmt(p.price); } }); if (cat.extra) EXTRA = +cat.extra; } catch (e) { } }
  try { const c = JSON.parse(sessionStorage.getItem('mra_me_cache') || 'null'); if (c && c.conf && c.conf.plans) applyCat(c.conf.plans); } catch (e) { }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const prof = () => (window.MRAP && MRAP.get()) || {};
  const WA = (t) => `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent((window.MRNE || String)(t))}`;
  const who = () => { const p = prof(); return (p.name || p.first || '') + (p.code ? ` (código ${p.code})` : ''); };
  const BEN = {
    free: ['Descubre tu nivel en 10 minutos', 'Tu ruta personalizada', 'Habla y la plataforma te corrige', 'No incluye clases individuales'],
    membership: ['Habla desde el día 1: te escucha y te corrige', 'Del A1 al B2+, a tu ritmo, 24/7', 'Certificado por cada módulo', 'No incluye clases individuales'],
    premium: ['Todo lo de Plataforma', '4 clases 1 a 1 con profe al mes', 'Tú eliges profe, día y hora', 'Clases no acumulables: úsalas en tu periodo mensual'],
    premium8: ['Todo lo de Plataforma', '8 clases 1 a 1: 2 por semana', 'Gana fluidez real, más rápido', 'Clases no acumulables: úsalas en tu periodo mensual'],
  };
  const waMsg = (k, renew) => `¡Hola! Soy ${who() || 'un estudiante'}. Quiero ${renew ? 'renovar' : 'activar'} el plan ${PL[k].name} (${PL[k].price} ${PL[k].per}) en mrarrieta.com`;
  const IC = { free: 'gift', membership: 'monitor', premium: 'crown', premium8: 'gem' };
  const ico = (k) => window.MRI ? MRI(IC[k] || 'gift') : '';
  const noEmo = (t) => String(t).replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+/, '');
  const canBuy = () => !!(window.MRBUY && ((window.MRAC && MRAC.code && MRAC.code()) || window.__buyCode));
  function card(k, opt) {
    opt = opt || {}; const p = PL[k]; const cur = opt.current === k; const top = k === 'premium8';
    return `<div class="pl-card ${k === 'membership' ? 'membership' : 'premium'}${cur ? ' cur' : ''}">${top ? `<span class="pl-rib">${window.MRI ? MRI('award') : ''} Más práctica</span>` : ''}
      <h3 class="pl-h"><span class="pl-hi">${ico(k)}</span>${esc(noEmo(p.name))}</h3><div class="pl-price"><b>${esc(p.price)}</b><small>${esc(p.per)}</small></div>
      <ul>${BEN[k].map(b => `<li${/^Clases no acumulables/.test(b) ? ' class="pl-warnli"' : /^No incluye/.test(b) ? ' class="pl-noli"' : ''}>${esc(noEmo(b))}${/^Clases no acumulables/.test(b) && window.MRPOLICY ? ' <span class="pl-cond" data-cond role="link" tabindex="0">Ver condiciones</span>' : ''}</li>`).join('')}</ul>
      ${cur && !opt.renew ? `<div class="pl-on">${window.MRI ? MRI('check') : ''} Tu plan actual</div>` : canBuy() ? `<button class="btn ${k === 'membership' ? 'w' : 'k'} block pl-go" data-buy="${k}">${opt.renew && cur ? 'Renovar' : 'Elegir este plan'} →</button>`
        : `<a class="btn ${k === 'membership' ? 'w' : 'k'} block pl-go" target="_blank" rel="noopener" href="${WA(waMsg(k, opt.renew && cur))}">${opt.renew && cur ? '🔁 Renovar' : 'Quiero este plan'} →</a>`}</div>`;
  }
  // tarjetas de planes (muestra los superiores al plan actual; al renovar, también el actual)
  function cards(current, renew) {
    const order = ['membership', 'premium', 'premium8'], i = order.indexOf(current);
    const ks = order.filter((k, j) => j > i || (renew && j === i));
    if (!ks.length) return '';
    return `<div class="pl-grid n${ks.length}">${ks.map(k => card(k, { current, renew })).join('')}</div><p class="pl-note">${window.MRI ? MRI('card') : ''} Paga con tarjeta (Mercado Pago) o por transferencia (Nequi / Llave Breve-B). Todas las membresías se cobran mes a mes. <a href="politica.html" target="_blank" rel="noopener">Política de reservas y cancelaciones</a></p>`;
  }
  // los botones "Elegir este plan" abren la compra
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-buy]'); if (!b || !window.MRBUY) return; e.preventDefault(); const mo = b.closest('.modal'); if (mo) mo.remove(); MRBUY.plan(b.dataset.buy); });
  // aviso cuando el contenido está bloqueado (fin del acceso gratuito o plan vencido)
  function modal(M, why) {
    const pl = window.MRAP && MRAP.plan ? MRAP.plan() : {};
    const exp = pl.expired;
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'present')}</div>
      <h3 class="center pl-mh">${window.MRI ? MRI(exp ? 'clock' : 'unlock') : ''} ${exp ? 'Tu plan venció' : 'Desbloquea toda tu ruta'}</h3>
      <p class="center" style="font-size:16.5px">${exp ? `Tu plan <b>${esc(PL[pl.plan] ? PL[pl.plan].name : '')}</b> venció${pl.end ? ' el ' + new Date(pl.end + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : ''}. <b>Tu progreso sigue guardado</b>: renueva y continúa justo donde ibas.` : (why || 'Tu acceso gratuito incluye los <b>2 primeros temas</b> de tu ruta. Elige tu plan y sigue aprendiendo con todos los temas, exámenes y certificados 🎓')}</p>
      ${cards(exp ? pl.plan : (pl.plan === 'premium8' || pl.eff === 'free' ? 'free' : pl.eff), exp)}${payInfo()}<button class="btn w block" style="margin-top:8px" id="pl-cl">Seguir explorando</button>`, { x: true });
    const b = m.querySelector('#pl-cl'); if (b) b.onclick = () => m.remove();
    return m;
  }
  function payInfo() { return `<div class="to-pay"><b>Formas de pago</b><div><span>${window.MRI ? MRI('card') : ''} Tarjeta débito o crédito (Mercado Pago) · se habilita de inmediato</span><span>${window.MRI ? MRI('bank') : ''} Transferencia: Nequi 3017810841 · Llave (Breve-B) 1047374279</span></div></div><p class="center" style="margin:10px 0 0;font-size:14px"><a target="_blank" rel="noopener" style="color:#16A34A;font-weight:800" href="${WA('¡Hola! ' + (who() ? 'Soy ' + who() + '. ' : '') + 'Tengo una pregunta sobre los planes de mrarrieta.com')}">¿Dudas? Escríbenos por WhatsApp</a></p>`; }
  function badge() { const pl = window.MRAP && MRAP.plan ? MRAP.plan() : {}; if (pl.eff === 'staff') return '👨‍🏫 Profe'; if (pl.expired) return '⏰ Plan vencido'; return { premium: '🎓 Premium · 4', premium8: '🏅 Premium · 8', membership: '🖥️ Plataforma', free: '🎁 Acceso gratuito', legacy: '🎓 Estudiante' }[pl.plan === 'premium8' && pl.eff !== 'free' ? 'premium8' : pl.eff] || '🎁 Acceso gratuito'; }
  // ➕ clases extra dentro de las tarjetas Premium: el estudiante suma clases y ve al instante el precio de su paquete
  function xbox(k) { if (!/^premium/.test(k)) return ''; return `<span class="ipx" data-xk="${k}" data-n="0"><span class="ipx-row"><span class="ipx-t"><b>Suma clases extra</b><small>${fmt(EXTRA)} c/u</small></span><span class="ipx-b" role="button" aria-label="Menos" data-xb="-1">−</span><b class="ipx-n">0</b><span class="ipx-b" role="button" aria-label="Más" data-xb="1">+</span></span><span class="ipx-tot">Total: <b class="ipx-c">${PL[k].classes} clases</b> por <b class="ipx-p">${fmt(PL[k].n)} COP/mes</b></span></span>`; }
  if (!window.__ipxWired) { window.__ipxWired = 1; document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-xb]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const box = b.closest('.ipx'); xset(box, (+box.dataset.n || 0) + +b.dataset.xb); }, true); }
  function xset(box, n) { if (!box) return; const k = box.dataset.xk; n = Math.max(0, Math.min(10, n)); box.dataset.n = n;
    box.querySelector('.ipx-n').textContent = n; box.querySelector('.ipx-c').textContent = (PL[k].classes + n) + ' clases'; box.querySelector('.ipx-p').textContent = fmt(PL[k].n + n * EXTRA) + ' COP/mes'; box.classList.toggle('on', n > 0);
    const a = box.closest('a[href*="plan="]'); if (a) { const u = new URL(a.getAttribute('href'), location.href); if (n) u.searchParams.set('extra', n); else u.searchParams.delete('extra'); a.setAttribute('href', u.pathname.split('/').pop() + u.search); }
    document.dispatchEvent(new CustomEvent('mra-extra', { detail: { plan: k, n } })); }
  window.MRPLANS = { xbox, xset, PL, FREE, BEN, IC, noEmo, card, cards, modal, payInfo, badge, WA, waMsg, applyCat, extra: () => EXTRA, fmt };
})();
