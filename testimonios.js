/* 🎬 Testimonios en video de la página de entrada.
   Se suben desde Administración → Testimonios. Esta lista solo se usa mientras carga o sin conexión. */
window.MRTESTIMONIOS = [
  { name: 'Mara Peña', info: '6 meses en la plataforma', video: 'tes-mara.mp4', poster: 'tes-mara.jpg' },
  { name: 'Natalia Pareja', info: 'Estudiante de mrarrieta.com', video: 'tes-natalia.mp4', poster: 'tes-natalia.jpg' },
  { name: 'Jhon Reales', info: 'Estudiante de mrarrieta.com', video: 'tes-jhon.mp4', poster: 'tes-jhon.jpg' },
  { name: 'Luisa Ortega', info: 'Estudiante de mrarrieta.com', video: 'tes-luisa.mp4', poster: 'tes-luisa.jpg' },
];
/* video en Drive ("drive:ID") → portada automática y reproductor de Drive */
window.MRTES = {
  drive: (v) => { const m = /^drive:(.+)$/.exec(String(v || '')); return m ? m[1] : ''; },
  poster: (t) => t.poster || (MRTES.drive(t.video) ? 'https://drive.google.com/thumbnail?id=' + MRTES.drive(t.video) + '&sz=w600' : ''),
  player: (t) => { const d = MRTES.drive(t.video); return d ? `<iframe src="https://drive.google.com/file/d/${d}/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>` : `<video src="${String(t.video).replace(/"/g, '')}" controls autoplay playsinline></video>`; },
};
(function () {
  const apply = (list) => { if (Array.isArray(list)) window.MRTESTIMONIOS = list; };
  try { apply(JSON.parse(localStorage.getItem('mra_tes') || 'null')); } catch (e) { }
  window.MRTESREADY = (window.MRAC && MRAC.on ? MRAC.call('testimonios', {}) : Promise.resolve(null)).then(r => { if (r && r.ok && Array.isArray(r.tes)) { apply(r.tes); try { localStorage.setItem('mra_tes', JSON.stringify(r.tes)); } catch (e) { } } }).catch(() => { });
})();
