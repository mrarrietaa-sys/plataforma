/* Tarjeta de voz premium (estilo del reto de la página) + ondas tipo ecualizador para TODAS las grabaciones.
   MRVC.card({...}) crea la tarjeta: micrófono con anillos, indicación, frase, traducción, botón de ejemplo y barras.
   MRAWAVE.on/off (llamado por listen / recordScore / srSession) anima la tarjeta activa con la voz real;
   si la grabación viene de un botón pequeño sin tarjeta, muestra una tira compacta de ondas junto al botón. */
(function () {
  const ag = () => { try { return (window.M1 && M1.ageGroup && M1.ageGroup()) || 'adult'; } catch (e) { return 'adult'; } };
  const KC = ['#f59e0b', '#fb7185', '#38bdf8', '#4ade80', '#a78bfa'];
  const IDLE = [8, 14, 20, 12, 18, 10, 16, 22, 12, 8, 15, 19, 11, 7, 13, 18, 9, 15, 21, 12, 8, 14, 19, 10, 16, 12, 8, 15, 20, 11];
  const SVG_MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/></svg>';
  const SVG_VOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
  const REC_LBL = { adult: 'TE ESCUCHO… HABLA AHORA', teens: 'GRABANDO NOTA DE VOZ', kids: '¡TE ESTOY ESCUCHANDO!' };
  const IDLE_FT = { adult: 'Toca y habla en inglés', teens: 'Toca y graba tu nota de voz', kids: '¡Toca y habla!' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bars = (n, g) => Array.from({ length: n }, (_, i) => `<i style="height:${Math.round(IDLE[i % IDLE.length] * (g === 'kids' ? .85 : .7))}px${g === 'kids' ? ';background:' + KC[i % 5] : ''}"></i>`).join('');
  /* opts: target (botón original: se oculta y la tarjeta lo activa), label, say (texto) o sayEl (elemento), es, au | onEx, ft, mascot (solo Kids) */
  function card(o) {
    const g = ag(), lbl = o.label || (g === 'teens' ? 'NOTA DE VOZ · TOCA Y RESPONDE' : g === 'kids' ? 'TOCA EL MICRÓFONO Y DI' : 'TOCA EL MICRÓFONO Y DI');
    const wrap = document.createElement('div'); wrap.className = 'vcw';
    if (g === 'kids' && o.mascot !== false && window.M1) wrap.innerHTML = `<div class="vc-kr">${M1.mascot('mascot', 'wow')}<div class="vc-kb"><b>¡Tú puedes!</b><span>${esc(o.cheer || 'Escucha y dilo en voz alta.')}</span></div></div>`;
    const el = document.createElement('div'); el.className = 'vc vc-' + g; el.dataset.lbl = lbl; el.dataset.ft = o.ft || IDLE_FT[g];
    const ex = !!(o.au || o.onEx);
    el.innerHTML = `<div class="vc-in"><button type="button" class="vc-mic" aria-label="Toca y habla"><span class="vc-rg"></span><span class="vc-rg"></span>${SVG_MIC}</button>
      <div class="vc-tx"><small class="vc-lb">${esc(lbl)}</small><b class="vc-say"></b>${o.es ? `<em>${esc(o.es)}</em>` : ''}</div>${ex ? `<button type="button" class="vc-ex" aria-label="Escuchar el ejemplo" title="Escuchar el ejemplo">${SVG_VOL}</button>` : ''}</div>
      <div class="vc-wv">${bars(g === 'kids' ? 16 : 30, g)}</div><div class="vc-ft"><span class="vc-dot"></span><span class="vc-ftt">${esc(el.dataset.ft)}</span></div>`;
    const sayB = el.querySelector('.vc-say');
    if (o.sayEl) { sayB.appendChild(o.sayEl); } else if (o.say) sayB.textContent = o.say; else sayB.remove();
    if (ex) el.querySelector('.vc-ex').onclick = (e) => { e.stopPropagation(); try { if (o.onEx) o.onEx(); else { window.M1 && M1.stop && M1.stop(); M1.play(o.au); } } catch (er) { } };
    const mic = el.querySelector('.vc-mic');
    if (o.target) { o.target.classList.add('vc-orig'); mic.onclick = (e) => { e.stopPropagation(); if (o.target.disabled) return; o.target.click(); };
      try { new MutationObserver(() => { mic.disabled = !!o.target.disabled; el.classList.toggle('vc-hide', !!o.target.hidden || o.target.classList.contains('hidden')); }).observe(o.target, { attributes: true, attributeFilter: ['disabled', 'hidden', 'class'] }); } catch (e) { } }
    wrap.appendChild(el);
    return wrap;
  }
  /* ---------- animación de la grabación ---------- */
  let depth = 0, raf = 0, an = null, ac = null, buf = null, act = 0, t0 = 0, vc = null, anchor = null, lastBtn = null, tick = 0, pill = null;
  document.addEventListener('pointerdown', e => { const b = e.target && e.target.closest && e.target.closest('button,.mic,[role=button]'); if (b) lastBtn = b; }, true);
  function findVc() {
    const a = lastBtn && document.body.contains(lastBtn) ? lastBtn : null;
    const c = a && a.closest('.vc'); if (c) return c;
    const own = a && a.closest('.stage,.modal,.player,body'); const all = [...document.querySelectorAll('.vc')].filter(x => x.offsetParent && !x.classList.contains('vc-hide'));
    if (all.length === 1 && (!a || a.classList.contains('vc-orig') || !a.closest('.lgrid,.ce-lrep'))) return all[0];
    const near = a && a.closest('.stage, .vk, .ms'); const inside = near && [...near.querySelectorAll('.vc')].filter(x => x.offsetParent);
    if (inside && inside.length === 1 && a.classList.contains('vc-orig')) return inside[0];
    void own; return null;
  }
  function buildPill() {
    const g = ag(); pill = document.createElement('div'); pill.className = 'vc-pill vc-' + g; pill.setAttribute('aria-hidden', 'true');
    pill.innerHTML = `<div class="vc-wv">${bars(g === 'kids' ? 12 : 22, g)}</div><span class="vc-ptm">0:00</span>`; document.body.appendChild(pill); placePill();
    requestAnimationFrame(() => pill && pill.classList.add('in'));
  }
  function placePill() {
    if (!pill) return; const W = pill.offsetWidth || 220, H = pill.offsetHeight || 46; let x = innerWidth / 2 - W / 2, y = innerHeight - H - 18;
    if (anchor && document.body.contains(anchor)) { const r = anchor.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight) { x = r.left + r.width / 2 - W / 2; y = r.bottom + 8; if (y + H > innerHeight - 8) y = Math.max(8, r.top - H - 8); } }
    pill.style.left = Math.max(8, Math.min(innerWidth - W - 8, x)) + 'px'; pill.style.top = y + 'px';
  }
  function loop() {
    raf = requestAnimationFrame(loop); tick++;
    const host = vc || pill; if (!host) return; const bs = host.querySelector('.vc-wv').children, n = bs.length, mx = vc ? 42 : 30;
    let lv = null; if (an) { an.getByteFrequencyData(buf); lv = buf; }
    act *= 0.965; const base = 0.22 + 0.6 * act;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 + 1), c = 1 - d; let v;
      if (lv) v = Math.min(1, (lv[Math.floor(2 + d * 38)] || 0) / 190) * (0.6 + 0.4 * c) + 0.08;
      else v = base * (0.45 + 0.55 * c) * (0.5 + 0.5 * Math.abs(Math.sin(tick * 0.2 + i * 0.85) * Math.cos(tick * 0.08 + i * 0.37)));
      bs[i].style.height = Math.max(4, mx * v) + 'px';
    }
    if (tick % 15 === 0) { const s = Math.floor((Date.now() - t0) / 1000), tx = '0:' + String(s % 60).padStart(2, '0');
      if (vc) { const f = vc.querySelector('.vc-ftt'); if (f) f.textContent = 'Grabando · ' + tx; } else { const p = pill.querySelector('.vc-ptm'); if (p) p.textContent = tx; placePill(); } }
  }
  function on() {
    depth++; if (depth > 1) return;
    t0 = Date.now(); act = 0.4; tick = 0; anchor = lastBtn; vc = findVc();
    if (vc) { vc.classList.add('rec'); const l = vc.querySelector('.vc-lb'); if (l) l.textContent = REC_LBL[ag()] || REC_LBL.adult; [...vc.querySelectorAll('.vc-wv i')].forEach(i => i.style.opacity = 1); }
    else buildPill();
    cancelAnimationFrame(raf); loop(); addEventListener('scroll', placePill, true);
  }
  function off() {
    depth = Math.max(0, depth - 1); if (depth) return;
    cancelAnimationFrame(raf); removeEventListener('scroll', placePill, true);
    if (vc) { const v = vc; v.classList.remove('rec'); const l = v.querySelector('.vc-lb'); if (l) l.textContent = v.dataset.lbl; const f = v.querySelector('.vc-ftt'); if (f) f.textContent = v.dataset.ft;
      [...v.querySelectorAll('.vc-wv i')].forEach((i, k) => { i.style.opacity = ''; i.style.height = Math.round(IDLE[k % IDLE.length] * (v.classList.contains('vc-kids') ? .85 : .7)) + 'px'; }); }
    if (pill) { const p = pill; pill = null; p.classList.remove('in'); setTimeout(() => p.remove(), 220); }
    vc = null; an = null; try { ac && ac.close(); } catch (e) { } ac = null;
  }
  function stream(s) { try { const C = window.AudioContext || window.webkitAudioContext; if (!C || !s) return; ac = new C(); const src = ac.createMediaStreamSource(s); an = ac.createAnalyser(); an.fftSize = 128; an.smoothingTimeConstant = 0.6; src.connect(an); buf = new Uint8Array(an.frequencyBinCount); } catch (e) { an = null; } }
  const kick = () => { act = Math.min(1, act + 0.6); };
  window.MRAWAVE = { on, off, stream, kick };
  window.MRVC = { card };
})();
