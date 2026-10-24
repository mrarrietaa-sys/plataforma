/* Al escribir la fecha de nacimiento, la plataforma dice de una vez a qué curso pertenece: Kids (9–11), Teens (12–17) o Adulto (18+).
   Se aplica sola a cualquier campo de fecha de nacimiento (inscripción, registro, perfil y administración). */
(function () {
  const SEL = 'input[type=date][name=birth], input[type=date]#in-birth, input[type=date]#bd, .tf-bd input[type=date], input[type=date][data-birth]';
  const admin = /administracion|admin\.html|profes/.test(location.pathname);
  const I = { kids: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>', teens: '<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/>', adult: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>', no: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>' };
  function age(b) { if (!/^\d{4}-\d{2}-\d{2}$/.test(b || '')) return null; const t = new Date(), y = +b.slice(0, 4), m = +b.slice(5, 7), d = +b.slice(8, 10); if (y < 1900) return null; let a = t.getFullYear() - y; if (t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) a--; return a; }
  function render(inp) {
    let c = inp._agc; if (!c) { c = document.createElement('div'); c.className = 'agc'; c.setAttribute('aria-live', 'polite'); inp._agc = c; inp.insertAdjacentElement('afterend', c); }
    const a = age(inp.value); if (a === null || a < 0 || a > 110) { c.hidden = true; return; }
    let k, t, s; const admin3 = admin || !!inp.closest('.tf-bd, [data-third]');
    if (a < 9) { k = 'no'; t = admin3 ? 'Menor de 9 años' : 'Todavía no tienes la edad mínima'; s = 'La escuela recibe estudiantes desde los 9 años'; }
    else if (a < 12) { k = 'kids'; t = (admin3 ? 'Es ' : 'Eres ') + 'Kids'; s = a + ' años · curso para niños de 9 a 11 años'; }
    else if (a < 18) { k = 'teens'; t = (admin3 ? 'Es ' : 'Eres ') + 'Teens'; s = a + ' años · curso para jóvenes de 12 a 17 años'; }
    else { k = 'adult'; t = (admin3 ? 'Es ' : 'Eres ') + 'Adulto'; s = a + ' años · curso para adultos (18 años o más)'; }
    c.hidden = false; c.className = 'agc agc-' + k;
    c.innerHTML = `<span class="agc-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg></span><span><b>${t}</b><small>${s}</small></span>`;
  }
  const scan = (root) => { (root.querySelectorAll ? root : document).querySelectorAll(SEL).forEach(i => { if (!i._agw) { i._agw = 1; i.addEventListener('input', () => render(i)); i.addEventListener('change', () => render(i)); } render(i); }); };
  document.addEventListener('input', e => { if (e.target.matches && e.target.matches(SEL)) render(e.target); }, true);
  const go = () => { scan(document); try { new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.matches && n.matches(SEL)) scan(n.parentNode || document); else if (n.querySelector && n.querySelector(SEL)) scan(n); } }).observe(document.body, { childList: true, subtree: true }); } catch (e) { } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  window.MRAGE = { age };
})();
