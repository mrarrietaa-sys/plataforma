/* v710 · Ajuste a cualquier pantalla (celular o PC), en las 3 edades.
   1) Lo que va junto nunca se separa: «Módulo 3 · B1», «46 %», «12 lecciones», «7:00 am», «$ 64.900».
   2) Los títulos cortos van siempre en una sola línea: si no caben, la letra se achica un poco (nunca menos del 72 %).
   No toca la lección ni los juegos (allí el texto se compara con el audio y la voz). */
(function () {
  const SKIP = '.player,.stage,.rto,[contenteditable],input,textarea,select,script,style,svg,[data-no-fit]';
  const NB = ' ';
  const RX = [
    [/\b(Módulo|Modulo|Module|Nivel|Level)\s+(\d+)\s+·\s+([ABC][12]\+?)/g, (m, a, n, l) => a + NB + n + NB + '·' + NB + l],
    [/(\d)\s+(%|min\b|minutos\b|segundos\b|s\b|h\b|horas\b|clases?\b|lecciones\b|temas?\b|días\b|semanas\b|meses\b|años\b|puntos\b|pts\b|estrellas\b|de\s+\d)/g, (m, d, u) => d + NB + u.replace(/\s+/g, NB)],
    [/(\d{1,2}:\d{2})\s+(am|pm|a\.\s?m\.|p\.\s?m\.)/gi, (m, t, u) => t + NB + u],
    [/\$\s+(\d)/g, (m, d) => '$' + NB + d],
    [/(Mr\.|Mrs\.)\s+(\S)/g, (m, a, b) => a + NB + b]
  ];
  function glue(root) {
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => (!n.nodeValue || n.nodeValue.length < 3 || !/\s/.test(n.nodeValue) || (n.parentElement && n.parentElement.closest(SKIP))) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const L = []; let n; while ((n = w.nextNode())) L.push(n);
    L.forEach(t => { let v = t.nodeValue; RX.forEach(([r, f]) => { v = v.replace(r, f); }); if (v !== t.nodeValue) t.nodeValue = v; });
  }
  const lines = e => { const tops = new Set(), w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (!n.nodeValue.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); [...r.getClientRects()].forEach(x => { if (x.width > 1) tops.add((x.top + x.bottom) / 2); }); } const fs = parseFloat(getComputedStyle(e).fontSize) || 16, c = [...tops].sort((a, b) => a - b); let k = c.length ? 1 : 0; for (let i = 1; i < c.length; i++) if (c[i] - c[i - 1] > fs * 0.7) k++; return k; };
  function fitOne(e) {
    if (!e.isConnected || !e.offsetWidth || e.closest(SKIP)) return;
    const txt = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (!txt || txt.length > 30 || e.querySelector('div,p,ul,ol,table,img,button,input')) return;
    e.style.removeProperty('font-size'); e.style.removeProperty('letter-spacing'); e.classList.remove('mr-fit1');
    if (lines(e) <= 1 && e.scrollWidth <= e.clientWidth + 1) return;
    const f0 = parseFloat(getComputedStyle(e).fontSize), min = Math.max(9, f0 * 0.72); let f = f0;
    e.classList.add('mr-fit1');
    if (/uppercase/.test(getComputedStyle(e).textTransform) && e.scrollWidth > e.clientWidth + 1) e.style.setProperty('letter-spacing', '.04em', 'important');
    while ((e.scrollWidth > e.clientWidth + 1) && f > min) { f -= 0.5; e.style.setProperty('font-size', f + 'px', 'important'); }
    if (e.scrollWidth > e.clientWidth + 1) { e.style.removeProperty('font-size'); e.style.removeProperty('letter-spacing'); e.classList.remove('mr-fit1'); } // no cabe ni achicando: que baje de línea normal
  }
  const SEL = '[data-fit],.ad-hero h2,.ad-hero .ad-k'; /* v711: solo donde se revisó; los demás títulos quedan como estaban diseñados */
  let busy = false, tm = 0;
  function run() { if (busy) return; busy = true; try { glue(document.body); document.querySelectorAll(SEL).forEach(fitOne); } catch (e) { } busy = false; }
  const later = () => { clearTimeout(tm); tm = setTimeout(run, 120); };
  const st = document.createElement('style');
  st.textContent = '.mr-fit1{white-space:nowrap!important;overflow:hidden;text-overflow:clip;max-width:100%;min-width:0}';
  (document.head || document.documentElement).appendChild(st);
  function boot() {
    run(); try { document.fonts && document.fonts.ready.then(run); } catch (e) { }
    addEventListener('resize', later); addEventListener('orientationchange', later);
    try { new MutationObserver(m => { if (!busy && m.some(x => { const t = x.target.nodeType === 1 ? x.target : x.target.parentElement; return !(t && t.closest && t.closest(SKIP)); })) later(); }).observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (e) { }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MRFIT = { run };
})();
