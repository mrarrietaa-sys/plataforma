/* =====================================================================
   PLANES — 🎁 Acceso gratuito · 🖥️ Plataforma · 👑 Premium · 4 · 💎 Premium · 8 · ⭐ Premium · 12 (franja debajo de las tarjetas)
   Precios: los define administración (nube); aquí solo hay valores por defecto.
   Elegir un plan abre la compra (Mercado Pago o transferencia con comprobante).
   ===================================================================== */
(function () {
  const C = window.M1CONFIG || {};
  const fmt = (n) => '$' + String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const PL = {
    membership: { name: '🖥️ PLATAFORMA', price: '$64.900', per: 'COP/mes', n: 64900, classes: 0 },
    premium: { name: '👑 PREMIUM · 4 CLASES', price: '$149.900', per: 'COP/mes', n: 149900, classes: 4 },
    premium8: { name: '💎 PREMIUM · 8 CLASES', price: '$249.900', per: 'COP/mes', n: 249900, classes: 8 },
    premium12: { name: '⭐ PREMIUM · 12 CLASES', price: '$349.900', per: 'COP/mes', n: 349900, classes: 12 },
  };
  // 👑 v626 · «Crea tu plan»: Premium de 4 a 20 clases al mes · precio = base + valor por clase (lo define administración)
  const PREM = { min: 4, max: 20, base: 49900, per: 25000 };
  const pkey = (n) => n === 4 ? 'premium' : 'premium' + n, pnum = (k) => { const m = /^premium(\d*)$/.exec(String(k || '')); return m ? (m[1] ? +m[1] : 4) : 0; };
  function premSync() { for (let n = PREM.min; n <= PREM.max; n++) { const k = pkey(n), v = PREM.base + PREM.per * n; PL[k] = { name: '👑 PREMIUM · ' + n + ' CLASES', price: fmt(v), per: 'COP/mes', n: v, classes: n }; } }
  premSync();
  const FREE = { name: '🎁 ACCESO GRATUITO', price: '$0', per: 'COP · prueba de 3 días' };
  let EXTRA = 32900;
  // precios vigentes desde la nube (los cambia administración)
  function applyCat(cat) { try { if (!cat || !cat.plans) return; if (cat.prem) { Object.assign(PREM, cat.prem); premSync(); } Object.keys(PL).forEach(k => { const p = cat.plans[k]; if (p && p.price) { PL[k].n = +p.price; PL[k].price = fmt(p.price); } }); if (cat.extra) EXTRA = +cat.extra; } catch (e) { } }
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
    premium12: ['Todo lo de Plataforma', '12 clases 1 a 1: 3 por semana', 'El mejor precio por clase', 'Clases no acumulables: úsalas en tu periodo mensual'],
  };
  const waMsg = (k, renew) => `¡Hola! Soy ${who() || 'un estudiante'}. Quiero ${renew ? 'renovar' : 'activar'} el plan ${PL[k].name} (${PL[k].price} ${PL[k].per}) en mrarrieta.com`;
  const IC = { free: 'gift', membership: 'monitor', premium: 'crown', premium8: 'gem', premium12: 'star' };
  const ico = (k) => window.MRI ? MRI(IC[k] || 'gift') : '';
  const noEmo = (t) => String(t).replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+/, '');
  const canBuy = () => !!(window.MRBUY && ((window.MRAC && MRAC.code && MRAC.code()) || window.__buyCode));
  function card(k, opt) {
    opt = opt || {}; const cur = opt.current === k;
    const act = cur && !opt.renew ? `<div class="pl-on">${window.MRI ? MRI('check') : ''} Tu plan actual</div>` : canBuy() ? `<button class="btn ${hot(k) ? 'k' : 'w'} block pl-go" data-buy="${k}">${opt.renew && cur ? 'Renovar' : V2()[k].bt} →</button>`
      : `<a class="btn ${hot(k) ? 'k' : 'w'} block pl-go" target="_blank" rel="noopener" href="${WA(waMsg(k, opt.renew && cur))}">${opt.renew && cur ? 'Renovar' : V2()[k].bt} →</a>`;
    return `<div class="pv${hot(k)}${cur ? ' cur' : ''}">${v2(k, { btn: false })}${act}</div>`;
  }
  // misma tarjeta de la página de entrada (diseño y tamaño iguales en toda la plataforma)
  const CC = { free: 'g', membership: 'b', premium: 'y', premium8: 'v', premium12: 'v' };
  function lpCard(k, opt) {
    opt = opt || {}; if (opt.pick) return lpBody(k, `<span class="lp-pb in-plan-pick">${opt.pick}</span>`);
    const cur = opt.current === k, d = V2()[k], ren = opt.renew && cur;
    const lbl = ren ? 'Renovar' : d.bt, sh = ren ? 'Renovar' : 'Lo quiero';
    const btn = cur && !opt.renew ? `<span class="lp-pb pl-cur">${CK()} Tu plan actual</span>`
      : canBuy() ? `<button type="button" class="lp-pb" data-buy="${k}"><span class="lg">${lbl}</span><span class="sh">${sh}</span></button>`
      : `<a class="lp-pb" target="_blank" rel="noopener" href="${WA(waMsg(k, ren))}"><span class="lg">${lbl}</span><span class="sh">${sh}</span></a>`;
    return `<div class="${lpCls(k)}${cur ? ' cur' : ''}">${lpBody(k, btn)}</div>`;
  }
  const lpCls = (k) => `lp-pl c-${CC[k]}${V2()[k].hot ? ' hot' : ''}`;
  function lpBody(k, btn) {
    const d = V2()[k], pr = k === 'free' ? { price: '$0', per: '· 3 días' } : PL[k], note = /^premium/.test(k) ? 'Clases no acumulables: úsalas en tu periodo mensual.' : d.note;
    return `${d.rib ? `<span class="lp-tag">${d.rib}</span>` : ''}
      <div class="lp-plh"><span class="ic">${ico(k)}</span><b>${NM[k]}</b></div><div class="lp-pr"><strong>${esc(pr.price)}</strong><small>${esc(pr.per)}</small></div>${per(k) ? `<span class="lp-ppc">Solo ${fmt(per(k))} por clase</span>` : '<span class="lp-ppc gh">COP</span>'}
      <p class="lp-hook">${d.out}</p><ul>${d.li.map(l => `<li>${CK()}<span>${esc(l)}</span></li>`).join('')}</ul><small class="lp-pn">${note}</small>${btn}`;
  }
  /* 🛍️ tarjetas de planes v2 (página de entrada, inscripción y perfil): resultado, precio por clase, condiciones aparte */
  const NM = { free: 'Acceso gratuito', membership: 'Plataforma', premium: 'Premium · 4 clases', premium8: 'Premium · 8 clases', premium12: 'Premium · 12 clases' };
  const per = (k) => PL[k] && PL[k].classes ? Math.round(PL[k].n / PL[k].classes / 100) * 100 : 0;
  const best8 = () => per('premium8') && per('premium8') < per('premium');
  const V2 = () => ({
    free: { out: 'Descubre tu nivel y prueba la plataforma sin pagar nada.', li: ['Prueba de nivel en 10 minutos', 'Tu ruta personalizada', 'Hablas y la plataforma te corrige'], note: 'No incluye clases con profe.', bt: 'Empezar gratis' },
    membership: { out: 'Aprende a tu ritmo, cuando quieras, desde el celular.', li: ['Habla desde el día 1: te escucha y te corrige', 'Ruta completa del A1 al B2+', 'Certificado por cada módulo'], note: 'No incluye clases con profe.', bt: 'Empezar con Plataforma' },
    premium: { out: 'Pierde el miedo a hablar con un profe que te corrige en vivo.', li: ['Todo lo de Plataforma', '4 clases 1 a 1 de 50 min al mes', 'Tú eliges profe, día y hora'], rib: 'Más elegido', hot: 1, bt: 'Empezar con Premium 4' },
    premium8: { out: 'Gana fluidez real: habla inglés 2 veces por semana.', li: ['Todo lo de Plataforma', '8 clases 1 a 1: 2 por semana', best8() ? 'El mejor precio por clase' : 'Gana fluidez real, más rápido'], rib: best8() ? 'Mejor precio por clase' : 'Más avance', bt: 'Empezar con Premium 8' },
    premium12: { out: 'Para avanzar rápido: habla inglés 3 veces por semana.', li: ['Todo lo de Plataforma', '12 clases 1 a 1: 3 por semana', 'El mejor precio por clase'], rib: 'Mejor precio por clase', bt: 'Empezar con Premium 12' },
  });
  const CK = () => window.MRI ? MRI('check') : '✓';
  function v2(k, o) { o = o || {}; const d = V2()[k]; const pr = k === 'free' ? { price: '$0', per: '· 3 días' } : PL[k];
    return `${d.rib ? `<span class="pv-rib${d.hot ? '' : ' b'}">${d.rib}</span>` : ''}<span class="pv-ic">${ico(k)}</span><span class="pv-n">${NM[k]}</span>
      <span class="pv-pr"><b>${esc(pr.price)}</b> <small>${esc(pr.per)}</small></span>${per(k) ? `<span class="pv-pc">Solo ${fmt(per(k))} por clase</span>` : '<span class="pv-pc0"></span>'}
      <span class="pv-out">${d.out}</span><span class="pv-ul">${d.li.map(l => `<span class="pv-li">${CK()}<span>${esc(l)}</span></span>`).join('')}</span><span class="pv-sp"></span>
      ${/^premium/.test(k) ? `<span class="pv-cond">Clases no acumulables: úsalas en tu periodo mensual. ${window.MRPOLICY ? '<span class="pl-cond" data-cond role="link" tabindex="0">Ver condiciones</span>' : '<a href="politica.html" target="_blank" rel="noopener">Ver condiciones</a>'}</span>` : `<span class="pv-note">${d.note}</span>`}
      ${o.btn === false ? '' : `<span class="pv-bt${o.btnCls ? ' ' + o.btnCls : ''}">${o.btn || d.bt}</span>`}`; }
  const hot = (k) => V2()[k].hot ? ' hot' : '';
  function trust() { return `<div class="pv-tr"><span>${CK()} Sin permanencia: pagas mes a mes</span><span>${CK()} Tu progreso siempre se guarda</span><span>${CK()} Profes licenciados en inglés</span></div>`; }
  // tarjetas de planes (muestra los superiores al plan actual; al renovar, también el actual)
  function cards(current, renew) {
    const pn = pnum(current), showM = !pn && (current === 'free' || current === 'legacy' || !current || (renew && current === 'membership'));
    const memb = showM ? lpCard('membership', { current, renew }) : '', n = 1 + (showM ? 1 : 0);
    return `<div class="lp-pg pl-in n${n}">${memb}${pbCard({ n0: pn || 4, cur: pn, renew })}</div>${n > 1 ? '<p class="lp-swipe">Desliza para ver todos los planes →</p>' : ''}${trust()}<p class="pl-note">${window.MRI ? MRI('card') : ''} Paga con tarjeta débito o crédito, PSE, Nequi o Daviplata (Mercado Pago). Tu plan se activa solo. Todas las membresías se cobran mes a mes. <a href="politica.html" target="_blank" rel="noopener">Política de reservas y cancelaciones</a></p>`;
  }
  /* 👑 v626 · tarjeta «Crea tu plan»: el estudiante elige de 4 a 20 clases al mes y ve al instante el valor, el precio por clase y lo que incluye.
     o.mode: 'buy' (con cuenta: abre la compra) · 'link' (página de entrada: lleva a la inscripción) · 'pick' (inscripción: elige el plan) */
  function pbCard(o) { o = o || {}; const n = Math.max(PREM.min, Math.min(PREM.max, +o.n0 || 4)), mode = o.mode || (canBuy() ? 'buy' : 'link');
    const kid = !!o.kid;
    return `<div class="lp-pl c-y hot pb${o.cls ? ' ' + o.cls : ''}" data-pb="${n}" data-pbm="${mode}"${o.cur ? ` data-pbc="${o.cur}"` : ''}${o.renew ? ' data-pbr="1"' : ''}><span class="lp-tag">Crea tu plan</span>
      <div class="lp-plh"><span class="ic">${ico('premium')}</span><b>Premium</b></div>
      <p class="pbk">${kid ? 'Tú decides cuántas clases con profe quiere tu hijo(a) al mes.' : 'Tú decides cuántas clases con profe quieres al mes.'}</p><p class="pbq">De ${PREM.min} a ${PREM.max} clases</p>
      <div class="pbn"><button type="button" class="pbx" data-pbs="-1" aria-label="Una clase menos">−</button><b class="pbN"></b><button type="button" class="pbx" data-pbs="1" aria-label="Una clase más">+</button></div>
      <div class="pbs"><div class="pr"><strong class="pbP"></strong><small>COP/mes</small></div><span class="pc pbC"></span><span class="pw pbW"></span></div>
      <ul><li>${CK()}<span class="pbL"></span></li><li>${CK()}<span>Eliges profe, día y hora</span></li><li>${CK()}<span>Incluye toda la Plataforma</span></li></ul>
      <small class="lp-pn">Clases no acumulables: úsalas dentro de tu mes. ${window.MRPOLICY ? '<span class="pl-cond" data-cond role="link" tabindex="0">Ver condiciones</span>' : ''}</small>
      ${mode === 'pick' ? '<span class="lp-pb in-plan-pick pbB">Elegir este plan</span>' : mode === 'buy' ? '<button type="button" class="lp-pb pbB" data-buy="premium"></button>' : mode === 'wa' ? '<a class="lp-pb pbB" target="_blank" rel="noopener" href="#"></a>' : '<a class="lp-pb pbB" href="inscripcion.html?plan=premium"></a>'}</div>`; }
  function pbSet(card, n) { if (!card) return; n = Math.max(PREM.min, Math.min(PREM.max, n)); card.dataset.pb = n; const k = pkey(n), v = PREM.base + PREM.per * n, $ = (c) => card.querySelector(c);
    $('.pbN').innerHTML = n + '<small>clases al mes</small>'; $('.pbP').textContent = fmt(v); $('.pbC').textContent = 'Solo ' + fmt(Math.round(v / n / 100) * 100) + ' por clase';
    $('.pbW').textContent = 'Unas ' + String(Math.round(n / 4 * 10) / 10).replace('.', ',') + ' por semana · tú eliges los días'; $('.pbL').textContent = n + ' clases 1 a 1 de 50 min';
    const [mi, ma] = card.querySelectorAll('[data-pbs]'); mi.disabled = n <= PREM.min; ma.disabled = n >= PREM.max;
    const b = $('.pbB'), cur = +card.dataset.pbc || 0, lbl = cur && cur === n ? (card.dataset.pbr ? 'Renovar mis ' + n + ' clases' : 'Tu plan actual') : 'Quiero mis ' + n + ' clases', m = card.dataset.pbm;
    if (m === 'buy') { b.dataset.buy = k; b.textContent = lbl; b.disabled = !!(cur && cur === n && !card.dataset.pbr); }
    else if (m === 'link') { b.textContent = lbl; b.setAttribute('href', 'inscripcion.html?plan=' + k); }
    else if (m === 'wa') { b.textContent = lbl; b.setAttribute('href', WA(waMsg(k))); }
    document.dispatchEvent(new CustomEvent('mra-pb', { detail: { plan: k, n, card } })); }
  function pbInit(root) { (root || document).querySelectorAll('.pb[data-pb]').forEach(c => { if (!c.dataset.pbi) { c.dataset.pbi = 1; pbSet(c, +c.dataset.pb); } }); }
  if (!window.__pbWired) { window.__pbWired = 1;
    document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-pbs]'); if (!b) return; e.preventDefault(); e.stopPropagation(); const c = b.closest('.pb'); pbSet(c, (+c.dataset.pb || 4) + +b.dataset.pbs); try { navigator.vibrate && navigator.vibrate(8); } catch (er) { } }, true);
    new MutationObserver(() => pbInit()).observe(document.documentElement, { childList: true, subtree: true }); }
  // ⭐ v623 · franja de Premium 12 (debajo de las tarjetas): para quien quiere clases 3 veces por semana
  function p12(o) { o = o || {}; const P = PL.premium12, pc = per('premium12'), href = o.href || '';
    const bt = href ? `<a class="p12-b" href="${esc(href)}">Ver plan <span aria-hidden="true">→</span></a>` : canBuy() ? `<button type="button" class="p12-b" data-buy="premium12">Ver plan <span aria-hidden="true">→</span></button>` : `<a class="p12-b" target="_blank" rel="noopener" href="${WA(waMsg('premium12'))}">Ver plan <span aria-hidden="true">→</span></a>`;
    return `<div class="p12"><span class="p12-ic">${ico('premium12')}</span><span class="p12-t"><b>¿Clases 3 veces por semana?</b><span>Premium 12 · <b>${esc(P.price)}</b>/mes · solo ${fmt(pc)} por clase</span></span>${bt}</div>`; }
  // los botones "Elegir este plan" abren la compra
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-buy]'); if (!b || !window.MRBUY) return; e.preventDefault(); const mo = b.closest('.modal'); if (mo) mo.remove(); MRBUY.plan(b.dataset.buy); });
  // aviso cuando el contenido está bloqueado (fin del acceso gratuito o plan vencido)
  function modal(M, why) {
    const pl = window.MRAP && MRAP.plan ? MRAP.plan() : {};
    const exp = pl.expired;
    const m = M.modal(`<div class="center">${M.mascot('mascot', 'present')}</div>
      <h3 class="center pl-mh">${window.MRI ? MRI(exp ? 'clock' : 'unlock') : ''} ${exp ? 'Tu plan venció' : 'Desbloquea toda tu ruta'}</h3>
      <p class="center" style="font-size:16.5px">${exp ? `Tu plan <b>${esc(PL[pl.plan] ? PL[pl.plan].name : '')}</b> venció${pl.end ? ' el ' + new Date(pl.end + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : ''}. <b>Tu progreso sigue guardado</b>: renueva y continúa justo donde ibas.` : (why || 'Tu acceso gratuito incluye los <b>3 primeros temas</b> de tu ruta. Elige tu plan y sigue aprendiendo con todos los temas, exámenes y certificados 🎓')}</p>
      ${cards(exp ? pl.plan : (pnum(pl.plan) || pl.eff === 'free' ? 'free' : pl.eff), exp)}${payInfo()}<button class="btn w block" style="margin-top:8px" id="pl-cl">Seguir explorando</button>`, { x: true });
    const b = m.querySelector('#pl-cl'); if (b) b.onclick = () => m.remove();
    return m;
  }
  function payInfo() { return `<div class="to-pay"><b>Formas de pago</b><div><span>${window.MRI ? MRI('card') : ''} Tarjeta débito o crédito, PSE, Nequi o Daviplata (Mercado Pago)</span><span>${window.MRI ? MRI('check') : ''} Tu plan se activa solo, apenas se apruebe el pago</span></div></div><p class="center" style="margin:10px 0 0;font-size:14px"><a target="_blank" rel="noopener" style="color:#16A34A;font-weight:800" href="${WA('¡Hola! ' + (who() ? 'Soy ' + who() + '. ' : '') + 'Tengo una pregunta sobre los planes de mrarrieta.com')}">¿Dudas? Escríbenos por WhatsApp</a></p>`; }
  function badge() { const pl = window.MRAP && MRAP.plan ? MRAP.plan() : {}; if (pl.eff === 'staff') return '👨‍🏫 Profe'; if (pl.expired) return '⏰ Plan vencido'; if (pl.eff === 'premium' && pnum(pl.plan)) return '👑 Premium · ' + pnum(pl.plan); return { membership: '🖥️ Plataforma', free: '🎁 Acceso gratuito', legacy: '🎓 Estudiante' }[pl.eff] || '🎁 Acceso gratuito'; }
  // ➕ clases extra dentro de las tarjetas Premium: el estudiante suma clases y ve al instante el precio de su paquete
  function xbox(k) { if (!/^premium/.test(k)) return ''; return `<span class="ipx" data-xk="${k}" data-n="0"><span class="ipx-row"><span class="ipx-t"><b>Suma clases extra</b><small>${fmt(EXTRA)} c/u</small></span><span class="ipx-b" role="button" aria-label="Menos" data-xb="-1">−</span><b class="ipx-n">0</b><span class="ipx-b" role="button" aria-label="Más" data-xb="1">+</span></span><span class="ipx-tot">Total primer mes: <b class="ipx-c">${PL[k].classes} clases</b> por <b class="ipx-p">${fmt(PL[k].n)} COP</b></span></span>`; }
  if (!window.__ipxWired) { window.__ipxWired = 1; document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-xb]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const box = b.closest('.ipx'); xset(box, (+box.dataset.n || 0) + +b.dataset.xb); }, true); }
  function xset(box, n) { if (!box) return; const k = box.dataset.xk; n = Math.max(0, Math.min(10, n)); box.dataset.n = n;
    box.querySelector('.ipx-n').textContent = n; box.querySelector('.ipx-c').textContent = (PL[k].classes + n) + ' clases'; box.querySelector('.ipx-p').textContent = fmt(PL[k].n + n * EXTRA) + ' COP'; box.classList.toggle('on', n > 0);
    const a = box.closest('a[href*="plan="]'); if (a) { const u = new URL(a.getAttribute('href'), location.href); if (n) u.searchParams.set('extra', n); else u.searchParams.delete('extra'); a.setAttribute('href', u.pathname.split('/').pop() + u.search); }
    document.dispatchEvent(new CustomEvent('mra-extra', { detail: { plan: k, n } })); }
  window.MRPLANS = { pbCard, pbSet, pbInit, PREM, pkey, pnum, p12, per, NM, lpCard, lpCls, v2, trust, hot, xbox, xset, PL, FREE, BEN, IC, noEmo, card, cards, modal, payInfo, badge, WA, waMsg, applyCat, extra: () => EXTRA, fmt };
})();
