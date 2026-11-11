/* 🎬 Testimonios en video de la página de entrada.
   Se suben desde Administración → Testimonios. Esta lista solo se usa mientras carga o sin conexión. */
window.MRTESTIMONIOS = [
  { name: 'Mara Peña', info: '6 meses en la plataforma', video: 'tes3-mara.mp4', poster: 'tes3-mara.jpg' },
  { name: 'Natalia Pareja', info: 'Estudiante de mrarrieta.com', video: 'tes3-natalia.mp4', poster: 'tes3-natalia.jpg' },
  { name: 'Jhon Reales', info: 'Estudiante de mrarrieta.com', video: 'tes3-jhon.mp4', poster: 'tes3-jhon.jpg' },
  { name: 'Luisa Ortega', info: 'Estudiante de mrarrieta.com', video: 'tes3-luisa.mp4', poster: 'tes3-luisa.jpg' },
];
/* video en Drive ("drive:ID") → portada automática y reproductor de Drive */
window.MRTES = {
  v: (u) => (u && !/^(https?:|data:|drive:)/.test(u) ? String(u).replace(/^tes[23]?-(\w+)\.(jpg|mp4).*$/, 'tes3-$1.$2') : u), // evita que el navegador muestre la versión vieja
  drive: (v) => { const m = /^drive:(.+)$/.exec(String(v || '')); return m ? m[1] : ''; },
  poster: (t) => MRTES.v(t.poster) || (MRTES.drive(t.video) ? 'https://drive.google.com/thumbnail?id=' + MRTES.drive(t.video) + '&sz=w600' : ''),
  player: (t) => { const d = MRTES.drive(t.video), ps = String(MRTES.poster(t) || '').replace(/"/g, '');
    if (!d) return `<video src="${MRTES.v(String(t.video)).replace(/"/g, '')}" poster="${ps}" controls autoplay playsinline preload="auto"></video>`;
    const u = MRTES._u[d]; if (u) return `<video src="${u}" poster="${ps}" controls autoplay playsinline preload="auto"></video>`; // ⚡ ya estaba descargado: arranca al instante
    setTimeout(() => MRTES.load(d), 0);
    return `<video data-d="${d}" poster="${ps}" controls playsinline preload="auto"></video><span class="ld-ld">Cargando video…</span>`; },
  /* v645 · los videos de Drive se descargan en segundo plano apenas se ve la sección (y quedan guardados en el teléfono):
     al tocar ▶ el video ya está listo. Se reproduce en el mismo lugar: no se mueve nada. */
  _u: {}, _p: {},
  get: (d) => { if (MRTES._u[d]) return Promise.resolve(MRTES._u[d]); if (MRTES._p[d]) return MRTES._p[d];
    MRTES._p[d] = (async () => { const key = 'https://mrarrieta.local/tes/' + d; let blob = null;
      try { if (window.caches) { const c = await caches.open('mra-tes-v1'); const hit = await c.match(key); if (hit) blob = await hit.blob(); } } catch (e) { }
      if (!blob) { const r = await MRAC.call('tesVideo', { id: d }, { timeout: 180000 }); if (!r || !r.ok) throw 0;
        const bin = atob(r.b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); blob = new Blob([u8], { type: r.mime || 'video/mp4' });
        try { if (window.caches) { const c = await caches.open('mra-tes-v1'); await c.put(key, new Response(blob, { headers: { 'Content-Type': blob.type } })); } } catch (e) { } }
      return (MRTES._u[d] = URL.createObjectURL(blob)); })();
    MRTES._p[d].catch(() => { delete MRTES._p[d]; }); return MRTES._p[d]; },
  load: async (d) => { const el = document.querySelector(`video[data-d="${d}"]`); if (!el) return; try { const u = await MRTES.get(d); const v = document.querySelector(`video[data-d="${d}"]`); if (!v) return; v.src = u; v.play().catch(() => { }); const ld = v.parentNode && v.parentNode.querySelector('.ld-ld'); if (ld) ld.remove(); }
    catch (e) { const v = document.querySelector(`video[data-d="${d}"]`); const box = v && v.parentNode; if (box) { const ld = box.querySelector('.ld-ld'); if (ld) { ld.textContent = 'No se pudo cargar el video. Toca para intentar de nuevo.'; ld.classList.add('err'); ld.onclick = () => { ld.textContent = 'Cargando video…'; ld.classList.remove('err'); MRTES.load(d); }; } } } },
  pre: () => { MRTES._on = 1; if (MRTES._run) return; MRTES._run = 1; (async () => { for (let k = 0; k < 40; k++) { const d = (window.MRTESTIMONIOS || []).map(t => MRTES.drive(t.video)).find(x => x && !MRTES._u[x] && !(MRTES._bad || {})[x]); if (!d) break; try { await MRTES.get(d); } catch (e) { (MRTES._bad = MRTES._bad || {})[d] = 1; } } MRTES._run = 0; })(); },
  fb: (el) => { if (el && el.dataset.d) MRTES.load(el.dataset.d); },
  // el video se ve igual que su portada (sin el reproductor de Drive)
};
(function () {
  const apply = (list) => { if (Array.isArray(list)) window.MRTESTIMONIOS = list; };
  try { apply(JSON.parse(localStorage.getItem('mra_tes') || 'null')); } catch (e) { }
  window.MRTESREADY = (window.MRAC && MRAC.on ? MRAC.call('testimonios', {}) : Promise.resolve(null)).then(r => { if (r && r.ok && Array.isArray(r.tes)) { apply(r.tes); try { localStorage.setItem('mra_tes', JSON.stringify(r.tes)); } catch (e) { } } if (MRTES._on) MRTES.pre(); }).catch(() => { });
})();
