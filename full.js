/* 🖼 v711 · Fotos premium en toda la plataforma (todas las edades y módulos).
   - Cada foto va en un marco horizontal 3:2 (el formato normal de una foto) y lo llena por completo: sin bordes difuminados.
   - El recorte lo hace Unsplash centrado en las caras / lo importante de la foto.
   - Dentro de la lección la foto no pasa de 440 px de ancho en PC (no se estira de lado a lado).
   - Tarjetas cuadradas pequeñas (p. ej. memoria) conservan su forma, también sin difuminado.
   - Banderas e ilustraciones: completas, en su forma real, con sombra suave.
   - No se tocan: avatares redondos, Mr. Arrieta, juegos (escenarios a pantalla completa), videos ni fondos de página. */
(function () {
  const ILL = /flagcdn|\.svg(\?|$)|data:image\/svg/i;
  const SKIP = '.rto, .vb, .ld-tv, video, iframe, [data-nofull], .mra-float, .tour, .lp-hero, header, nav';
  const css = document.createElement('style');
  css.textContent = `img.fx3-i{object-fit:cover!important;width:100%!important;height:100%!important;max-width:none!important;background:transparent!important}
img.fx9-f{object-fit:contain!important;filter:drop-shadow(0 6px 12px rgba(0,0,0,.22))}`;
  (document.head || document.documentElement).appendChild(css);
  // fotos verticales donde lo importante no está en el centro: punto de enfoque a mano
  const FP = { 'photo-1642618332135-a74051fb94f6': 0.36, 'photo-1707649631080-6739828becfc': 0.78, 'photo-1545693315-85b6be26a3d6': 0.4, 'photo-1539327381140-bc020facf1e2': 0.42, 'photo-1786014894707-6fe6cab16a09': 0.45 };
  const isU = u => /images\.unsplash\.com/.test(u || '');
  const crop = (u, W, H) => { if (!isU(u)) return u; let b = u.replace(/([?&])(w|h|fit|crop|ar|dpr)=[^&]*/g, '$1').replace(/&{2,}/g, '&').replace(/\?&/, '?').replace(/[?&]$/, ''); const id = (b.match(/photo-[\w-]+/) || [''])[0], fy = FP[id]; return b + (b.indexOf('?') >= 0 ? '&' : '?') + `w=${W}&h=${H}&fit=crop&crop=` + (fy ? `focalpoint&fp-x=0.5&fp-y=${fy}` : 'faces,entropy'); };
  const done = u => /fit=crop&crop=/.test(u || '');
  const round = (el, cs) => (parseFloat(cs.borderTopLeftRadius) || 0) >= Math.min(el.offsetWidth, el.offsetHeight) / 3;
  const skip = el => el.closest(SKIP) || /(^|\s|-)av(\s|$|-)|avatar|-av\b|logo/i.test(typeof el.className === 'string' ? el.className : '') || el.closest('[class*="-av"],[class*="avatar"],[class*="logo"]');
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);
  const imp = (el, k, v) => el.style.setProperty(k, v, 'important');
  // decide la forma del marco: cuadrado pequeño se queda; todo lo demás pasa a 3:2
  // v711: solo estos marcos pasan a 3:2 (revisados uno por uno). Los demás conservan EXACTAMENTE su tamaño de antes
  // (la foto lo llena sin difuminado), para no mover nada de lo que ya funcionaba.
  const WL = '.t2-pic, .t2-ci, .md3-pic, .md3-hi, .reading > .ph, .fc9-ph > .ph';
  function shape(fr) {
    const w = fr.offsetWidth, h = fr.offsetHeight;
    if (!fr.matches(WL)) return { sq: true, W: w, H: h };
    imp(fr, 'aspect-ratio', '3 / 2'); imp(fr, 'height', 'auto'); imp(fr, 'min-height', '0'); imp(fr, 'max-height', 'none');
    if (getComputedStyle(fr).flexGrow !== '0' && getComputedStyle(fr.parentElement || fr).flexDirection.indexOf('column') === 0) imp(fr, 'flex', 'none');
    const cap = fr.closest('.rd-chat') ? 280 : fr.closest('.player') ? 440 : 0; // en el chat de la lectura la foto va pequeña, como una foto enviada
    if (cap && fr.offsetWidth > cap + 40) { imp(fr, 'max-width', cap + 'px'); imp(fr, 'width', '100%'); imp(fr, 'margin-left', 'auto'); imp(fr, 'margin-right', 'auto'); }
    const W = Math.max(120, fr.offsetWidth || w); return { sq: false, W, H: Math.round(W * 2 / 3) };
  }
  const px = (s, n) => Math.min(1600, Math.round(n * dpr()));
  function doImg(im) {
    if (im.dataset.fx9) return; if (im.classList.contains('fx9-bl') || im.classList.contains('fx9-sh')) return;
    const src = im.currentSrc || im.src || ''; if (!src || /mra-|\/retos\/|koi|keeper|ball|car\.webp/.test(src)) return;
    if (!im.complete || !im.naturalWidth) { im.addEventListener('load', () => doImg(im), { once: true }); return; }
    const w = im.offsetWidth, h = im.offsetHeight; if (!w || !h) return; // oculta todavía: se revisa cuando aparezca
    const cs = getComputedStyle(im); if (cs.objectFit !== 'cover' || skip(im) || round(im, cs)) { im.dataset.fx9 = '0'; return; }
    const ill = ILL.test(src);
    if (!ill && (w < 100 || h < 60)) { im.dataset.fx9 = '0'; return; }
    im.dataset.fx9 = '1';
    if (ill) { im.classList.add('fx9-f'); return; }
    if (!isU(src)) return; // solo fotos de Unsplash (permiten el recorte inteligente)
    const fr = im.parentElement; if (!fr) return;
    const s = shape(fr); const W = px(0, s.W), H = px(0, s.H);
    im.removeAttribute('srcset'); im.classList.add('fx3-i'); im.src = crop(src, W, H);
    // si la misma imagen cambia de foto (p. ej. la siguiente palabra), se recorta igual
    new MutationObserver(() => { const ns = im.getAttribute('src') || ''; if (isU(ns) && !done(ns)) im.src = crop(ns, W, H); }).observe(im, { attributes: true, attributeFilter: ['src'] });
  }
  function doBg(el) {
    if (el.dataset.fx9) return; if (!el.offsetWidth) return; const cs = getComputedStyle(el);
    if (!/cover/.test(cs.backgroundSize) || !/url\(/.test(cs.backgroundImage)) { if (!/url\(/.test(el.getAttribute('style') || '')) el.dataset.fx9 = '0'; return; }
    const w = el.offsetWidth, h = el.offsetHeight; if (w < 120 || h < 80 || w > 1300 || skip(el) || round(el, cs) || el === document.body || el === document.documentElement) return;
    if (!/images\.unsplash\.com/.test(cs.backgroundImage)) return;
    el.dataset.fx9 = '1'; const s = shape(el); const W = px(0, s.W), H = px(0, s.H);
    const fix = () => { const bi = el.style.backgroundImage && /url\(/.test(el.style.backgroundImage) ? el.style.backgroundImage : getComputedStyle(el).backgroundImage; if (!/unsplash/.test(bi) || done(bi)) return; imp(el, 'background-image', bi.replace(/url\("?([^")]+)"?\)/g, (m, u) => isU(u) ? `url("${crop(u, W, H)}")` : m)); imp(el, 'background-position', 'center'); imp(el, 'background-size', 'cover'); };
    fix(); new MutationObserver(fix).observe(el, { attributes: true, attributeFilter: ['style'] });
  }
  function scan() {
    document.querySelectorAll('img').forEach(doImg);
    document.querySelectorAll('[style*="background"], .ms9-fl, .mvx-film, .ms9-sc, .m2l-sc, .m3i-v, .m3t-v, .t2-pic, .t2-ci').forEach(doBg);
  }
  let t = 0; const run = () => { clearTimeout(t); t = setTimeout(scan, 150); };
  function boot() { scan(); new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); addEventListener('resize', run); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MRFULL = { scan };
})();
