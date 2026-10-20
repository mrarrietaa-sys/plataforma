/* ✉️ Corrector de correos: si escriben "gmial.com" o "hotmail.con" sugiere el correo bien escrito (un toque para corregir)
   y en los formularios del cliente muestra "Te escribiremos a: …" para que lo revise de un vistazo. */
(function () {
  const DOM = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.es', 'icloud.com', 'live.com', 'hotmail.es', 'outlook.es', 'msn.com', 'aol.com', 'protonmail.com'];
  const TLD = { con: 'com', cpm: 'com', vom: 'com', comm: 'com', cm: 'com', om: 'com', cmo: 'com', ocm: 'com', coom: 'com', 'com.co.': 'com.co' };
  const lev = (a, b) => { const m = a.length, n = b.length; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; };
  function suggest(v) {
    v = String(v || '').trim().toLowerCase(); const at = v.lastIndexOf('@'); if (at < 1) return ''; const user = v.slice(0, at); let dom = v.slice(at + 1); if (!dom) return '';
    const parts = dom.split('.'); const last = parts[parts.length - 1]; if (TLD[last]) { parts[parts.length - 1] = TLD[last]; dom = parts.join('.'); }
    if (DOM.indexOf(dom) >= 0) return dom === v.slice(at + 1) ? '' : user + '@' + dom;
    let best = '', bd = 9; DOM.forEach((d) => { const x = lev(dom, d); if (x < bd) { bd = x; best = d; } });
    if (best && bd > 0 && bd <= 2 && dom.length >= 5) return user + '@' + best;
    return dom !== v.slice(at + 1) ? user + '@' + dom : '';
  }
  const isMail = (el) => el && el.tagName === 'INPUT' && (el.type === 'email' || /mail/i.test(el.name || el.id || ''));
  function box(el) { let b = el.nextElementSibling; if (!b || !b.classList || !b.classList.contains('mf-tip')) { b = document.createElement('div'); b.className = 'mf-tip'; el.insertAdjacentElement('afterend', b); } return b; }
  function check(el, final) {
    const v = el.value.trim(); const b = box(el); const s = suggest(v); const admin = !!el.closest('.ad-form,#ad-app,.ad-wrap');
    if (s) { b.innerHTML = `¿Quisiste decir <b>${s.replace(/</g, '')}</b>? <button type="button" class="mf-fix">Sí, corregir</button>`; b.querySelector('.mf-fix').onclick = () => { el.value = s; el.dispatchEvent(new Event('input', { bubbles: true })); check(el, true); }; b.className = 'mf-tip warn'; return; }
    if (!admin && final && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)) { b.innerHTML = `📩 Te escribiremos a: <b>${v.replace(/</g, '')}</b>`; b.className = 'mf-tip ok'; return; }
    b.innerHTML = ''; b.className = 'mf-tip';
  }
  document.addEventListener('blur', (e) => { if (isMail(e.target)) check(e.target, true); }, true);
  document.addEventListener('input', (e) => { if (isMail(e.target)) { const b = e.target.nextElementSibling; if (b && b.classList && b.classList.contains('mf-tip') && b.innerHTML) check(e.target, false); } }, true);
  window.MRMAILFIX = { suggest };
})();
