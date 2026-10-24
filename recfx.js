/* Ondas de grabación premium (adultos · teens · kids). Aparecen bajo el botón que activó el micrófono
   y se mueven con la voz real (analizador de audio cuando hay stream; si no, con la actividad del reconocimiento de voz). */
(function () {
  let depth = 0, el = null, raf = 0, an = null, ac = null, buf = null, act = 0, t0 = 0, anchor = null, lastBtn = null, tick = 0;
  document.addEventListener('pointerdown', e => { const b = e.target && e.target.closest && e.target.closest('button,.mic,[role=button]'); if (b) lastBtn = b; }, true);
  const ag = () => { try { return (window.M1 && M1.ageGroup && M1.ageGroup()) || 'adult'; } catch (e) { return 'adult'; } };
  const KC = ['#f59e0b', '#fb7185', '#38bdf8', '#4ade80', '#a78bfa'];
  const LBL = { adult: 'Te escucho… habla ahora', teens: 'Grabando nota de voz', kids: '¡Te estoy escuchando!' };
  function build() {
    const g = ag(), n = g === 'kids' ? 13 : g === 'teens' ? 27 : 23;
    el = document.createElement('div'); el.className = 'recfx recfx-' + g; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="rf-wave">${Array.from({ length: n }, (_, i) => `<i${g === 'kids' ? ` style="background:${KC[i % 5]}"` : ''}></i>`).join('')}</div><div class="rf-live"><span class="rf-dot"></span><b>${LBL[g] || LBL.adult}</b><span class="rf-tm">0:00</span></div>`;
    document.body.appendChild(el);
  }
  function place() {
    if (!el) return; const W = el.offsetWidth || 260, H = el.offsetHeight || 80;
    let x = window.innerWidth / 2 - W / 2, y = window.innerHeight - H - 18;
    if (anchor && document.body.contains(anchor)) { const r = anchor.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < window.innerHeight) { x = r.left + r.width / 2 - W / 2; y = r.bottom + 12; if (y + H > window.innerHeight - 8) y = Math.max(8, r.top - H - 12); } }
    x = Math.max(8, Math.min(window.innerWidth - W - 8, x)); el.style.left = x + 'px'; el.style.top = y + 'px';
  }
  function loop() {
    raf = requestAnimationFrame(loop); if (!el) return; tick++;
    const bars = el.firstChild.children, n = bars.length, mx = el.classList.contains('recfx-kids') ? 40 : 46;
    let lv = null;
    if (an) { an.getByteFrequencyData(buf); lv = buf; }
    act *= 0.965; const base = 0.18 + 0.55 * act;
    for (let i = 0; i < n; i++) {
      const c = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 + 1);
      let v;
      if (lv) { const k = Math.floor(2 + (Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 + 1)) * 38); v = Math.min(1, (lv[k] || 0) / 190) * (0.6 + 0.4 * c) + 0.06; }
      else v = base * (0.45 + 0.55 * c) * (0.55 + 0.45 * Math.abs(Math.sin(tick * 0.18 + i * 0.9) * Math.cos(tick * 0.07 + i * 0.37)));
      bars[i].style.height = Math.max(4, mx * v) + 'px';
    }
    if (tick % 15 === 0) { const s = Math.floor((Date.now() - t0) / 1000); el.querySelector('.rf-tm').textContent = '0:' + String(s % 60).padStart(2, '0'); place(); }
  }
  function on() {
    depth++; if (depth > 1) return;
    anchor = lastBtn; t0 = Date.now(); act = 0.35; if (!el) build(); el.classList.remove('out'); place(); requestAnimationFrame(() => el && el.classList.add('in'));
    if (anchor) anchor.classList.add('recfx-pulse', 'recfx-p-' + ag());
    cancelAnimationFrame(raf); loop(); window.addEventListener('scroll', place, true); window.addEventListener('resize', place);
  }
  function off() {
    depth = Math.max(0, depth - 1); if (depth) return;
    cancelAnimationFrame(raf); window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place);
    if (anchor) anchor.classList.remove('recfx-pulse', 'recfx-p-adult', 'recfx-p-teens', 'recfx-p-kids');
    if (el) { const e = el; el = null; e.classList.remove('in'); e.classList.add('out'); setTimeout(() => e.remove(), 260); }
    an = null; try { ac && ac.close(); } catch (e) { } ac = null;
  }
  function stream(s) {
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C || !s) return; ac = new C(); const src = ac.createMediaStreamSource(s); an = ac.createAnalyser(); an.fftSize = 128; an.smoothingTimeConstant = 0.6; src.connect(an); buf = new Uint8Array(an.frequencyBinCount); } catch (e) { an = null; }
  }
  const kick = () => { act = Math.min(1, act + 0.6); };
  window.MRAWAVE = { on, off, stream, kick };
})();
