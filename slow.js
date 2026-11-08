/* 🐢 v602 · «Más lento»: junto a cada botón de escuchar de las lecciones y los exámenes aparece una tortuga.
   Al tocarla suena el MISMO audio al 75 % (misma voz americana, misma pronunciación); no se cambia ningún audio. */
(function () {
  const RATE = 0.75;
  const TUR = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z"/><path d="M4.82 7.9 8 10"/><path d="M15.18 7.9 12 10"/><path d="M16.93 10H20a2 2 0 0 1 0 4H2"/></svg>';
  const SPK = /^M11 5 6 9|^M11 4\.702/; // íconos de parlante de la plataforma
  const TXT = /^(▶|🔊)?\s*(escuchar|escucha|listen|reproduc|modelo|continuar lectura|oír|oir|play\b)/i;
  const NOT = /tu voz|mi voz|escúchate|escuchate|grab|record|micr/i;
  const ROOT = '#app .player, #app .fx, .fx, #app .stage, #app .lx, .ag-les, .les-wrap';
  window.__mraSlow = false;
  // cualquier otro toque vuelve a la velocidad normal
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest || !e.target.closest('.slw-b')) window.__mraSlow = false; }, true);
  function label(el) { const c = el.cloneNode(true); c.querySelectorAll('svg,.slw-b').forEach((x) => x.remove()); return (c.textContent || '').replace(/\s+/g, ' ').trim(); }
  function isAudioBtn(el) {
    if (!el || el.dataset.slw || el.classList.contains('slw-b') || el.disabled) return false;
    if (el.closest('.slw-b')) return false;
    if (el.closest('.stage') && el.closest('.stage').querySelector('iframe, video')) return false; // la canción (video) no se puede poner más lenta
    try { const ps = document.querySelector('.pstep b'); if (ps && /^music$/i.test(ps.textContent.trim())) return false; } catch (e) { }
    const t = label(el); if (NOT.test(t) || /^(me|rv-me)$/.test(el.id)) return false;
    const hasSpk = [...el.querySelectorAll('svg path')].some((p) => SPK.test(p.getAttribute('d') || '')) || /🔊/.test(el.textContent || '') || [...el.querySelectorAll('svg desc')].some((d) => /🔊/.test(d.textContent || ''));
    if (hasSpk) return t.length <= 40 || TXT.test(t); // nunca en tarjetas de respuesta con frases largas
    return TXT.test(t) && t.length <= 40;
  }
  function make(el) {
    el.dataset.slw = '1';
    const cs = getComputedStyle(el); if (cs.position === 'absolute' || cs.position === 'fixed') return;
    const r0 = el.getBoundingClientRect(), p0 = el.parentElement ? el.parentElement.getBoundingClientRect() : r0;
    const pd = el.parentElement ? getComputedStyle(el.parentElement).display : '', t = label(el), icon = /grid/.test(pd) || el.id === 'rp' || el.classList.contains('rd-pp') || t.length < 3 || t.length > 16 || (p0.width - r0.width < 130 && r0.width < p0.width - 24), b = document.createElement('button');
    b.type = 'button'; b.className = 'slw-b' + (icon ? ' ic' : ''); b.title = 'Escuchar más lento'; b.setAttribute('aria-label', 'Escuchar más lento');
    b.innerHTML = TUR + (icon ? '' : '<span>Más lento</span>');
    const r = el.getBoundingClientRect(), par = el.parentElement, pr = par ? par.getBoundingClientRect() : r;
    if (icon) { const sz = Math.max(30, Math.min(44, Math.round(Math.min(r.height || 34, 44)))); b.style.width = b.style.height = sz + 'px'; }
    // la tortuga va pegada al botón, en la misma línea; el diseño alrededor no cambia
    const w = document.createElement('span'); w.className = 'slw-w';
    const full = r.width > 0 && pr.width > 0 && r.width >= pr.width - 24 && (cs.display === 'block' || cs.display === 'flex' || cs.display === 'grid' || /100%/.test(el.style.width || ''));
    if (full) { w.classList.add('full'); el.style.flex = '1 1 auto'; el.style.minWidth = '0'; }
    ['margin', 'alignSelf', 'justifySelf', 'gridColumn', 'gridRow', 'order'].forEach((k) => { if (cs[k] && cs[k] !== 'auto' && cs[k] !== '0px' && cs[k] !== 'normal') w.style[k] = cs[k]; });
    el.style.margin = '0';
    if (/%$/.test(cs.maxWidth)) { w.style.maxWidth = cs.maxWidth; el.style.maxWidth = 'none'; } // los anchos en % siguen midiéndose contra el contenedor original
    par.insertBefore(w, el); w.appendChild(el); w.appendChild(b);
    b.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      try { if (window.M1 && M1.stop) M1.stop(); } catch (er) { }
      window.__mraSlow = true;
      setTimeout(() => { try { el.click(); } catch (er) { } }, 30);
    });
  }
  function scan() {
    document.querySelectorAll(ROOT).forEach((root) => {
      root.querySelectorAll('button, [role="button"]').forEach((el) => { if (isAudioBtn(el)) make(el); });
    });
  }
  let t = 0; const run = () => { clearTimeout(t); t = setTimeout(scan, 120); };
  function boot() { scan(); new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MRSLOW = { scan, RATE };
})();
