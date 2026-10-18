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
    return `<video data-d="${d}" src="https://drive.google.com/uc?export=download&id=${d}" poster="${ps}" controls autoplay playsinline preload="auto" onerror="MRTES.fb(this)"></video><span class="ld-ld">Cargando video…</span>`; },
  /* si Google no entrega el video directo, la plataforma lo trae ella misma y lo reproduce aquí mismo */
  fb: async (el) => {
    if (!el || el.dataset.fb) return; el.dataset.fb = '1'; const box = el.parentNode; box && box.classList.add('loading');
    try { const r = await MRAC.call('tesVideo', { id: el.dataset.d }, { timeout: 180000 }); if (!r || !r.ok) throw 0;
      const bin = atob(r.b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      el.removeAttribute('onerror'); el.src = URL.createObjectURL(new Blob([u8], { type: r.mime || 'video/mp4' })); el.play().catch(() => { });
    } catch (e) { if (box) box.insertAdjacentHTML('beforeend', '<span class="ld-ld err">No se pudo cargar el video. Intenta de nuevo.</span>'); }
    box && box.classList.remove('loading');
  },
  // el video se ve igual que su portada (sin el reproductor de Drive)
};
(function () {
  const apply = (list) => { if (Array.isArray(list)) window.MRTESTIMONIOS = list; };
  try { apply(JSON.parse(localStorage.getItem('mra_tes') || 'null')); } catch (e) { }
  window.MRTESREADY = (window.MRAC && MRAC.on ? MRAC.call('testimonios', {}) : Promise.resolve(null)).then(r => { if (r && r.ok && Array.isArray(r.tes)) { apply(r.tes); try { localStorage.setItem('mra_tes', JSON.stringify(r.tes)); } catch (e) { } } }).catch(() => { });
})();
