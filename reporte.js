/* v708 · «Reportar un error» (todas las edades y módulos).
   - Solo aparece al final de la lección (pantalla de resultados). No es un paso de la lección y no tiene límite.
   - Audio que no suena / imagen que no carga: la plataforma lo revisa y lo arregla sola (vuelve a descargar y prueba).
   - Texto distinto al audio, respuesta mal u otro: lo revisa una persona → llega a administración.
   - Administración: al tocar el aviso en la campana ve el reporte y lo marca como corregido (el estudiante recibe aviso). */
(function () {
  try { const st = document.createElement('style'); st.textContent = '.r9-rep{display:flex;justify-content:center;margin-top:2px}\n.r9-rep button{display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:6px 8px;font:600 12px/1 var(--fb,Inter,system-ui,sans-serif);color:#8a97ab;cursor:pointer;border-radius:8px}\n.r9-rep button:hover{color:#0B2A5B;background:#eef3fa}\n.r9-rep svg{width:13px;height:13px;flex:0 0 auto}\n.erx-ov{position:fixed;inset:0;background:rgba(11,42,91,.45);display:flex;align-items:center;justify-content:center;padding:16px;z-index:10050;opacity:0;transition:opacity .25s;box-sizing:border-box}\n.erx-ov.on{opacity:1}\n.erx-ov .erx{display:block!important;background:#fff;border-radius:20px;box-shadow:0 20px 50px rgba(11,42,91,.25);width:100%;max-width:440px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow:auto;padding:22px 20px 18px;box-sizing:border-box;font-family:var(--fb,Inter,system-ui,sans-serif);color:#0B2A5B;text-align:left}\n.erx h3{margin:0 0 4px;font:700 19px/1.25 var(--fh,Poppins,system-ui,sans-serif);color:#0B2A5B}\n.erx p.s{margin:0 0 14px;font-size:13.5px;color:#4A5B78;line-height:1.4}\n.erx .lb{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#4A5B78;margin:0 0 8px}\n.erx .st{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}\n.erx .st button,.erx .ty button{display:flex;align-items:center;gap:8px;text-align:left;border:1.5px solid #DCE4F0;background:#fff;border-radius:12px;padding:9px 10px;font:600 13px/1.2 var(--fb,Inter,system-ui,sans-serif);color:#0B2A5B;min-width:0;cursor:pointer;box-shadow:none;margin:0;width:auto;height:auto;transform:none}\n.erx .st button b{flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:#EAF2FD;display:grid;place-items:center;font-size:11.5px}\n.erx .st button span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.erx .on2{border-color:#0B2A5B!important;background:#F3F7FD!important}\n.erx .st .on2 b{background:#0B2A5B;color:#fff}\n.erx .ty{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}\n.erx .ty button{padding:8px 11px;border-radius:999px}\n.erx textarea.tx{display:block;width:100%;box-sizing:border-box;border:1.5px solid #DCE4F0;border-radius:12px;padding:10px 12px;font:14px/1.4 var(--fb,Inter,system-ui,sans-serif);color:#0B2A5B;resize:none;height:64px;margin:0}\n.erx .ft{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap}\n.erx .ft small{margin-right:auto;font-size:12px;color:#8a97ab}\n.erx .ft button{border:0;border-radius:12px;padding:11px 16px;font:700 14px/1 var(--fb,Inter,system-ui,sans-serif);cursor:pointer;margin:0;width:auto}\n.erx .cn{background:#fff;color:#4A5B78;border:1.5px solid #DCE4F0!important}\n.erx .go{background:#0B2A5B;color:#fff}\n.erx .go:disabled,.erx .go.dis{opacity:.35;cursor:default}\n.erx .chk{list-style:none;margin:6px 0 4px;padding:0}\n.erx .chk li{display:flex;align-items:center;gap:10px;padding:9px 0;font-size:14px;color:#4A5B78;border-bottom:1px solid #EEF2F8;opacity:.35;transition:.3s}\n.erx .chk li.run,.erx .chk li.ok,.erx .chk li.no{opacity:1;color:#0B2A5B}\n.erx .chk i{flex:0 0 22px;height:22px;border-radius:50%;border:2px solid #DCE4F0;display:grid;place-items:center;box-sizing:border-box;font-style:normal;font-weight:800;font-size:13px}\n.erx .chk li.run i{border-color:#1D5FD1;border-right-color:transparent;animation:erxsp .8s linear infinite}\n.erx .chk li.ok i{border:0;background:#16A34A;color:#fff}\n.erx .chk li.no i{border:0;background:#F59E0B;color:#fff}\n.erx .chk i svg{width:13px;height:13px}\n@keyframes erxsp{to{transform:rotate(360deg)}}\n.erx .res{display:flex;gap:12px;align-items:flex-start;background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:14px;padding:12px;margin-top:12px}\n.erx .res.adm{background:#FFFBEB;border-color:#FDE68A}\n.erx .res .ic{flex:0 0 36px;height:36px;border-radius:50%;background:#16A34A;color:#fff;display:grid;place-items:center}\n.erx .res.adm .ic{background:#F59E0B}\n.erx .res .ic svg{width:18px;height:18px}\n.erx .res b{display:block;font:700 15px/1.3 var(--fh,Poppins,system-ui,sans-serif);margin-bottom:3px}\n.erx .res span{font-size:13px;color:#4A5B78;line-height:1.4}\n.erx button.play{display:flex;align-items:center;gap:10px;width:100%;margin-top:12px;border:1.5px solid #DCE4F0;border-radius:14px;padding:10px 12px;background:#fff;cursor:pointer;box-sizing:border-box}\n.erx .play .pb{flex:0 0 38px;height:38px;border-radius:50%;background:#E3242B;color:#fff;display:grid;place-items:center}\n.erx .play .pb svg{width:16px;height:16px}\n.erx .play .wv{display:flex;gap:3px;align-items:center;height:26px;flex:1;min-width:0;overflow:hidden}\n.erx .play .wv i{flex:0 0 3px;border-radius:2px;background:#C7D2E3;height:30%}\n.erx .play.on .wv i{background:#0B2A5B;animation:erxwv .6s ease-in-out infinite alternate}\n@keyframes erxwv{from{height:20%}to{height:100%}}\n.erx .play small{font-size:12.5px;color:#0B2A5B;font-weight:600}\n.erx-dt{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 6px}\n.erx-dt div{min-width:0}.erx-dt .w{grid-column:1/-1}\n.erx-dt span{display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#8a97ab;margin-bottom:2px}\n.erx-dt b{display:block;font-size:13.5px;line-height:1.4;font-weight:600;overflow-wrap:anywhere}\n.erx-dt b.mono{font:12px/1.4 ui-monospace,Menlo,monospace;color:#4A5B78}\n@media(max-width:340px){.erx .st{grid-template-columns:1fr}}\n@media(max-width:400px){.erx .ft>button{flex:1}}'; (document.head || document.documentElement).appendChild(st); } catch (e) { }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const W = ms => new Promise(r => setTimeout(r, ms));
  const OKI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const PERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg>';
  const FLAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4"/><path d="M4 4h12l-2 4 2 4H4"/></svg>';
  const TYPES = [['audio', 'El audio no suena'], ['sync', 'El texto no coincide con el audio'], ['ans', 'La respuesta correcta está mal'], ['img', 'La imagen no carga'], ['other', 'Otro']];

  /* ---------- registro por paso: qué audios sonaron y qué fotos se vieron ---------- */
  const LOG = {}; // índice de paso → { au:Set, img:Set, bad:Set }
  const cur = () => (window.__repStep && window.__repStep.i) || 0;
  const slot = i => (LOG[i] = LOG[i] || { au: new Set(), img: new Set(), bad: new Set() });
  window.MRREPLOG = { step(i, sec) { window.__repStep = { i, sec }; slot(i); }, reset() { Object.keys(LOG).forEach(k => delete LOG[k]); } };
  try {
    const P0 = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { try { if (this.__au) slot(cur()).au.add(this.__au); } catch (e) { } return P0.apply(this, arguments); };
  } catch (e) { }
  document.addEventListener('load', e => { const t = e.target; if (t && t.tagName === 'IMG' && /^https?:/.test(t.currentSrc || t.src || '')) slot(cur()).img.add(t.currentSrc || t.src); }, true);
  document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && /^https?:/.test(t.src || '')) { slot(cur()).img.add(t.src); slot(cur()).bad.add(t.src); } }, true);

  /* ---------- reparación automática ---------- */
  function audSrc(k) { const b = window.AUD && window.AUD[k]; if (!b) return ''; return /^data:|^https?:/.test(b) ? b : 'data:audio/mpeg;base64,' + b; }
  function testAudio(k) { return new Promise(res => { const s = audSrc(k); if (!s) return res(false); const a = new Audio(); let done = false; const end = v => { if (!done) { done = true; res(v); } }; a.preload = 'auto'; a.oncanplaythrough = () => end(true); a.onloadedmetadata = () => end(a.duration > 0.2); a.onerror = () => end(false); setTimeout(() => end(false), 5000); a.src = s; try { a.load(); } catch (e) { end(false); } }); }
  async function reloadAudio(keys) { // solo si falta algún audio: vuelve a descargar los paquetes de audio de la página (sin caché) y los carga de nuevo
    if (!keys.some(k => !(window.AUD && window.AUD[k]))) return;
    const srcs = [...new Set([...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src')).filter(u => !/(^|\/)(core|app|cloud|bell|icons|reporte|full|retos)\.js/.test(u)))];
    for (const u of srcs) { try { const t = await (await fetch(u.replace(/[?#].*$/, '') + '?r=' + Date.now(), { cache: 'reload' })).text(); if (/^\s*window\.AUD\s*=/.test(t.slice(0, 80))) (0, eval)(t); } catch (e) { } }
  }
  function testImg(u) { return new Promise(res => { const i = new Image(); let d = false; const end = v => { if (!d) { d = true; res(v); } }; i.onload = () => end(i.naturalWidth > 0); i.onerror = () => end(false); setTimeout(() => end(false), 8000); i.src = u + (u.includes('?') ? '&' : '?') + 'r=' + Date.now(); }); }

  /* ---------- ventana del estudiante ---------- */
  function open(ctx) {
    ctx = ctx || {}; const steps = ctx.steps || [];
    let st = -1, ty = '';
    const ov = document.createElement('div'); ov.className = 'erx-ov';
    ov.innerHTML = `<div class="erx" role="dialog" aria-label="Reportar un error"><h3>Reportar un error</h3><p class="s">Gracias por ayudarnos a mejorar.</p>
      <div class="lb">¿En qué paso?</div><div class="st">${steps.map((s, i) => `<button type="button" data-i="${i}"><b>${i + 1}</b><span>${esc(s)}</span></button>`).join('')}</div>
      <div class="lb">¿Qué pasó?</div><div class="ty">${TYPES.map(([k, t]) => `<button type="button" data-t="${k}">${t}</button>`).join('')}</div>
      <textarea class="tx" maxlength="400" placeholder="Cuéntanos con tus palabras (opcional)"></textarea>
      <div class="ft"><button type="button" class="cn">Cancelar</button><button type="button" class="go dis" disabled>Enviar</button></div></div>`;
    document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('on'));
    const $ = s => ov.querySelector(s), close = () => { ov.remove(); };
    const ready = () => { const b = $('.go'); const ok = st >= 0 && ty; b.disabled = !ok; b.classList.toggle('dis', !ok); };
    ov.querySelectorAll('.st button').forEach(b => b.onclick = () => { st = +b.dataset.i; ov.querySelectorAll('.st button').forEach(x => x.classList.toggle('on2', x === b)); ready(); });
    ov.querySelectorAll('.ty button').forEach(b => b.onclick = () => { ty = b.dataset.t; ov.querySelectorAll('.ty button').forEach(x => x.classList.toggle('on2', x === b)); ready(); });
    $('.cn').onclick = close; ov.onclick = e => { if (e.target === ov) close(); };
    $('.go').onclick = async () => { if (st < 0 || !ty) return; const text = $('.tx').value.trim(); await check(ov, ctx, st, ty, text); };
  }
  async function check(ov, ctx, st, ty, text) {
    const box = ov.querySelector('.erx'); const L = slot(st);
    const auto = ty === 'audio' ? [['Volviendo a descargar el audio'], ['Probando que suene'], ['Comparando el audio con el texto']]
      : ty === 'img' ? [['Volviendo a descargar la imagen'], ['Probando que se vea']]
        : [['Revisando la pregunta y sus opciones'], ['Comparando con el contenido de la lección'], ['¿Se puede corregir solo?']];
    box.innerHTML = `<h3>Revisando tu reporte</h3><p class="s">La plataforma lo revisa sola en unos segundos.</p><ul class="chk">${auto.map(a => `<li><i></i>${a[0]}</li>`).join('')}</ul><div class="out"></div>`;
    const LI = [...box.querySelectorAll('li')]; const mark = (i, ok) => { LI[i].className = ok ? 'ok' : 'no'; LI[i].querySelector('i').innerHTML = ok ? OKI : '!'; };
    const run = i => { LI[i].className = 'run'; };
    let fixed = false, first = '';
    if (ty === 'audio') {
      const keys = [...L.au]; run(0); await reloadAudio(keys); await W(600); mark(0, true);
      run(1); let good = keys.length > 0; for (const k of keys) { if (!(await testAudio(k))) { good = false; break; } } await W(300); mark(1, good);
      run(2); await W(700); mark(2, good); fixed = good; first = keys[0] || '';
    } else if (ty === 'img') {
      const ims = [...L.img]; run(0); await W(500); mark(0, true);
      run(1); let good = ims.length > 0; for (const u of ims) { if (!(await testImg(u))) { good = false; break; } } mark(1, good); fixed = good;
    } else { for (let i = 0; i < 2; i++) { run(i); await W(800); mark(i, true); } run(2); await W(700); mark(2, false); }
    const body = { lesson: ctx.lesson || '', mod: ctx.mod || '', step: st + 1, sec: (ctx.steps || [])[st] || '', type: ty, text, auto: fixed ? 'fixed' : 'admin', au: [...L.au].slice(0, 12).join(','), img: [...L.img].slice(0, 6).join(' ') };
    try { if (window.MRAC && MRAC.call && MRAC.code && MRAC.code()) MRAC.call('errReport', Object.assign({ code: MRAC.code() }, body)); } catch (e) { }
    const out = box.querySelector('.out');
    if (fixed) {
      out.innerHTML = `<div class="res"><span class="ic">${OKI}</span><div><b>Listo, ya quedó arreglado</b><span>${ty === 'img' ? 'Vuelve a entrar a la lección y la verás completa.' : 'Escúchalo de nuevo.'} Mr. Arrieta también recibe una copia del reporte.</span></div></div>${first ? `<button type="button" class="play"><span class="pb">${PLAY}</span><span class="wv">${Array.from({ length: 22 }, (_, i) => `<i style="animation-delay:${(i % 7) * .08}s"></i>`).join('')}</span><small>Escuchar</small></button>` : ''}<div class="ft"><button type="button" class="go">Listo</button></div>`;
      const pb = out.querySelector('.play'); if (pb) pb.onclick = () => { const a = new Audio(audSrc(first)); pb.classList.add('on'); a.onended = a.onerror = () => pb.classList.remove('on'); a.play().catch(() => pb.classList.remove('on')); };
    } else {
      out.innerHTML = `<div class="res adm"><span class="ic">${PERS}</span><div><b>Lo enviamos a Mr. Arrieta</b><span>Esto lo revisa una persona. Te avisaremos en tus notificaciones cuando esté corregido.</span></div></div><div class="ft"><button type="button" class="go">Listo</button></div>`;
    }
    out.querySelector('.ft .go').onclick = () => ov.remove();
  }
  window.MRREPORT = { open, FLAG };

  /* ---------- administración: ver el reporte y marcarlo corregido ---------- */
  window.MRERRREP = async function (x) {
    const api = window.MRADMAPI; if (!api) return;
    const id = x && x.data && x.data.id; const r = await api('aReports', { id });
    const it = r && r.ok && (r.reports || [])[0]; if (!it) return;
    const AG = { adult: 'Adulto', teens: 'Adolescente', kids: 'Niño' };
    const ov = document.createElement('div'); ov.className = 'erx-ov on';
    const T = Object.fromEntries(TYPES);
    ov.innerHTML = `<div class="erx"><h3>Reporte de error</h3><p class="s">${it.auto === 'fixed' ? 'La plataforma lo arregló sola.' : 'Necesita tu revisión.'}${+it.n > 1 ? ` Lo reportaron ${+it.n} estudiantes.` : ''}</p>
      <div class="erx-dt"><div><span>Lección</span><b>${esc(it.lesson)}</b></div><div><span>Paso</span><b>${esc(it.step)} · ${esc(it.sec)}</b></div><div><span>Edad · módulo</span><b>${AG[it.ag] || ''} · ${esc(it.mod)}</b></div><div><span>Qué pasó</span><b>${esc(T[it.type] || it.type)}</b></div>${it.text ? `<div class="w"><span>Comentarios</span><b>${esc(it.text)}</b></div>` : ''}${it.au ? `<div class="w"><span>Audios del paso</span><b class="mono">${esc(it.au)}</b></div>` : ''}<div class="w"><span>Estudiante</span><b>${esc(it.name)} · ${esc((() => { const m = String(it.date).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); if (!m) return it.date; const h = +m[4]; return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) + ' · ' + ((h % 12) || 12) + ':' + m[5] + (h < 12 ? ' a. m.' : ' p. m.'); })())}</b></div></div>
      <div class="ft">${it.status === 'done' ? '<small>Ya está marcado como corregido.</small>' : ''}<button type="button" class="cn">Cerrar</button>${it.status !== 'done' && it.auto !== 'fixed' ? '<button type="button" class="go">Marcar corregido</button>' : ''}</div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('.cn').onclick = () => ov.remove(); ov.onclick = e => { if (e.target === ov) ov.remove(); };
    const g = ov.querySelector('.go'); if (g) g.onclick = async () => { g.disabled = true; const d = await api('aReportDone', { id: it.id }); ov.remove(); };
  };
})();
