/* 🖼 v699 · Imágenes completas en toda la plataforma (todas las edades y módulos).
   - Fotos: se ven ENTERAS (sin recorte); el espacio sobrante se llena con la misma foto difuminada.
   - Banderas e ilustraciones: completas, en su forma real, con sombra suave.
   - No se tocan: avatares redondos, Mr. Arrieta, juegos (escenarios a pantalla completa), videos ni fondos de página. */
(function () {
  const ILL = /flagcdn|\.svg(\?|$)|data:image\/svg/i;
  const SKIP = '.rto, .vb, .ld-tv, video, iframe, [data-nofull], .mra-float, .tour, .lp-hero, header, nav';
  const full = u => /images\.unsplash\.com/.test(u) ? u.replace(/&h=\d+/, '').replace(/&fit=crop/, '&fit=max').replace(/&crop=[^&]*/, '') : u;
  const css = document.createElement('style');
  css.textContent = `.fx9-w{isolation:isolate}
.fx9-bl{position:absolute!important;inset:-24px!important;width:calc(100% + 48px)!important;height:calc(100% + 48px)!important;max-width:none!important;max-height:none!important;object-fit:cover!important;filter:blur(20px) brightness(.85) saturate(1.1)!important;z-index:-1!important;pointer-events:none!important;border-radius:0!important;margin:0!important;opacity:1!important;transform:none!important}
.fx9-sh{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;z-index:-1!important;pointer-events:none!important;border-radius:0!important;margin:0!important;transform:none!important}
i.fx9-gr{position:absolute!important;inset:0!important;display:block!important;z-index:-1!important;pointer-events:none!important;background-size:100% 100%!important;background-repeat:no-repeat!important}
img.fx9-c{object-fit:contain!important;background:transparent!important}
img.fx9-f{object-fit:contain!important;filter:drop-shadow(0 6px 12px rgba(0,0,0,.22))}`;
  (document.head || document.documentElement).appendChild(css);
  const round = (el, cs) => { const br = parseFloat(cs.borderTopLeftRadius) || 0; return br >= Math.min(el.offsetWidth, el.offsetHeight) / 3; };
  const skip = el => el.closest(SKIP) || /(^|\s|-)av(\s|$|-)|avatar|-av\b|logo/i.test(el.className && el.className.baseVal === undefined ? el.className : '') || el.closest('[class*="-av"],[class*="avatar"],[class*="logo"]');
  function doImg(im) {
    if (im.dataset.fx9 || im.classList.contains('fx9-bl') || im.classList.contains('fx9-sh')) return;
    const src = im.currentSrc || im.src || ''; if (!src || /mra-|\/retos\/|koi|keeper|ball|car\.webp/.test(src)) return;
    if (!im.complete || !im.naturalWidth) { im.addEventListener('load', () => doImg(im), { once: true }); return; }
    const w = im.offsetWidth, h = im.offsetHeight; if (!w || !h) return; // oculta todavía: se revisa cuando aparezca
    const cs = getComputedStyle(im); if (cs.objectFit !== 'cover' || skip(im) || round(im, cs)) { im.dataset.fx9 = '0'; return; }
    const ill = ILL.test(src);
    if (!ill && (w < 100 || h < 60)) { im.dataset.fx9 = '0'; return; }
    im.dataset.fx9 = '1';
    if (ill) { im.classList.add('fx9-f'); return; }
    const fs = full(src); if (fs !== src) { im.removeAttribute('srcset'); im.src = fs; }
    im.classList.add('fx9-c');
    const par = im.parentElement; if (!par) return;
    if (getComputedStyle(par).position === 'static') par.style.position = 'relative';
    par.style.overflow = 'hidden'; par.classList.add('fx9-w');
    const bl = document.createElement('img'); bl.className = 'fx9-bl'; bl.alt = ''; bl.setAttribute('aria-hidden', 'true'); bl.dataset.fx9 = '1'; bl.src = fs; par.insertBefore(bl, im);
    // si la misma imagen cambia de foto (p. ej. la siguiente palabra), el fondo difuminado la sigue
    new MutationObserver(() => { const ns = im.getAttribute('src') || ''; const nf = full(ns); if (nf !== ns) { im.src = nf; return; } if (bl.src !== nf) bl.src = nf; }).observe(im, { attributes: true, attributeFilter: ['src'] });
  }
  function doBg(el) {
    if (el.dataset.fx9) return; if (!el.offsetWidth) return; const cs = getComputedStyle(el);
    if (!/cover/.test(cs.backgroundSize) || !/url\(/.test(cs.backgroundImage)) { if (!/url\(/.test(el.getAttribute('style') || '')) el.dataset.fx9 = '0'; return; }
    const w = el.offsetWidth, h = el.offsetHeight; if (w < 120 || h < 80 || w > 1100 || skip(el) || round(el, cs) || el === document.body || el === document.documentElement) return;
    const grad = (cs.backgroundImage.match(/(?:linear|radial)-gradient\((?:[^()]|\([^()]*\))*\)/g) || []).filter(g => /transparent|rgba\([^)]*,\s*0?\.\d+\)|rgba\([^)]*,\s*0\)|#[0-9a-f]{8}\b/i.test(g)).join(', '); // solo degradados que dejan ver la foto (los de color sólido eran el «cargando»
    const u = (cs.backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1]; if (!u || /mra-|\/retos\//.test(u) || !/unsplash|^https?:/.test(u)) return;
    el.dataset.fx9 = '1'; const fu = full(u);
    const mk = c => { const x = document.createElement('img'); x.className = c; x.alt = ''; x.setAttribute('aria-hidden', 'true'); x.dataset.fx9 = '1'; x.src = fu; return x; };
    if (cs.position === 'static') el.style.position = 'relative';
    el.classList.add('fx9-w'); el.style.setProperty('background-image', 'none', 'important'); el.style.overflow = 'hidden';
    if (grad) { const g = document.createElement('i'); g.className = 'fx9-gr'; g.setAttribute('aria-hidden', 'true'); g.style.setProperty('background-image', grad, 'important'); el.prepend(g); } // el degradado (para leer el texto) queda encima de la foto
    el.prepend(mk('fx9-sh')); el.prepend(mk('fx9-bl'));
    // si la foto de fondo cambia después (p. ej. otra pregunta de la misión), se vuelve a aplicar
    new MutationObserver(() => { const nb = el.style.backgroundImage; if (nb && nb !== 'none' && /url\(/.test(nb)) { const nu = (nb.match(/url\("?([^")]+)"?\)/) || [])[1]; if (nu) { const f2 = full(nu); el.querySelectorAll(':scope > .fx9-bl, :scope > .fx9-sh').forEach(x => x.src = f2); el.style.setProperty('background-image', 'none', 'important'); } } }).observe(el, { attributes: true, attributeFilter: ['style'] });
  }
  function scan() {
    document.querySelectorAll('img').forEach(doImg);
    document.querySelectorAll('[style*="background"], .ms9-fl, .mvx-film, .ms9-sc, .m2l-sc, .m3i-v, .m3t-v').forEach(doBg);
  }
  let t = 0; const run = () => { clearTimeout(t); t = setTimeout(scan, 150); };
  function boot() { scan(); new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); addEventListener('resize', run); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MRFULL = { scan };
})();
