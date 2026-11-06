/* 🎓 v596 · Prueba del profe: franja «Modo prueba del profe» en las páginas del estudiante
   (días restantes, volver a su portal y ver la experiencia como Adultos, Teens o Kids). */
(function () {
  function prof() { try { return JSON.parse(localStorage.getItem('mra_profile_v1') || 'null'); } catch (e) { return null; } }
  function today() { const d = new Date(Date.now() - 5 * 3600e3); return d.toISOString().slice(0, 10); }
  function daysLeft(end) { if (!end) return 0; return Math.max(0, Math.round((new Date(String(end).slice(0, 10) + 'T12:00:00') - new Date(today() + 'T12:00:00')) / 864e5)); }
  function ageOf(b) { if (!/^\d{4}-\d{2}-\d{2}/.test(String(b || ''))) return null; const t = today().split('-').map(Number), x = String(b).slice(0, 10).split('-').map(Number); let a = t[0] - x[0]; if (t[1] < x[1] || (t[1] === x[1] && t[2] < x[2])) a--; return a; }
  function group(p) { const a = ageOf(p.birth); return a === null || a >= 18 ? 'adult' : a < 12 ? 'kids' : 'teens'; }
  function birthFor(g) { const y = +today().slice(0, 4); return g === 'kids' ? (y - 10) + '-01-01' : g === 'teens' ? (y - 14) + '-01-01' : '1990-01-01'; }
  const CAP = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
  let busy = false;
  function strip() {
    const p = prof(); if (!p || !p.tpr) { document.body.classList.remove('mr-tpr'); const o = document.getElementById('tpr-strip'); if (o) o.remove(); return; }
    document.body.classList.add('mr-tpr');
    if (document.getElementById('tpr-strip')) return;
    const d = daysLeft(p.planEnd), g = group(p);
    const el = document.createElement('div'); el.id = 'tpr-strip';
    el.innerHTML = `<div class="tpr-s1">${CAP}<span class="tpr-st"><b>Modo prueba del profe</b> · ${d} ${d === 1 ? 'día' : 'días'}</span><button type="button" id="tpr-back">← Mi portal</button></div>
      <div class="tpr-ages">${[['adult', 'Adultos'], ['teens', 'Teens'], ['kids', 'Kids']].map(([k, l]) => `<button type="button" data-tag="${k}" class="${k === g ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const top = document.querySelector('header.topbar, .topbar, .fx-top');
    if (top && top.parentNode) top.parentNode.insertBefore(el, top.nextSibling); else document.body.prepend(el);
    el.querySelector('#tpr-back').onclick = async () => { const b = el.querySelector('#tpr-back'); b.disabled = true; b.textContent = 'Volviendo…';
      try { if (window.MRAC && MRAC.sync) await Promise.race([MRAC.sync(true), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { }
      try { localStorage.setItem('mra_last_role', JSON.stringify({ role: 'teacher' })); sessionStorage.removeItem('mra_tpr'); } catch (e) { }
      location.href = 'profesores.html'; };
    el.querySelectorAll('[data-tag]').forEach((b) => b.onclick = async () => {
      if (busy || b.classList.contains('on')) return; busy = true; el.querySelectorAll('[data-tag]').forEach((x) => x.classList.toggle('on', x === b)); b.textContent = 'Cambiando…';
      try { const q = prof(); if (window.MRAC && MRAC.saveProfile) { await MRAC.saveProfile({ birth: birthFor(b.dataset.tag) }); await MRAC.login(q.code); } } catch (e) { }
      location.reload(); });
  }
  function boot() { strip(); let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(strip, 120); }).observe(document.body, { childList: true, subtree: false }); setInterval(strip, 1500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
