/* v516 · MOTOR DE MELODÍA (sin reconocimiento de voz)
   Compara el ritmo (energía) y la entonación (tono) de la voz del estudiante con el audio modelo.
   No necesita entender palabras: funciona sin internet, en cualquier celular y sin costo.
   Uso:  const v = MRMEL.view(contenedor)  ·  const r = await MRMEL.take(au, v, {onStart})
   r = { silent } ó { r: 1-3, it: 1-3, tip, buf } */
(function () {
  const R = 16000, FR = 512, HOP = 320;
  let AC = null; const MODELS = {};
  const ac = () => { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; };
  function down(x, rate) { if (rate === R) return x; const r = rate / R, m = Math.floor(x.length / r), y = new Float32Array(m); for (let i = 0; i < m; i++) { const a = Math.floor(i * r), b = Math.min(x.length, Math.floor((i + 1) * r)); let q = 0; for (let j = a; j < b; j++) q += x[j]; y[i] = q / Math.max(1, b - a); } return y; }
  function frame(x, o) { let q = 0; for (let i = 0; i < FR; i++) { const v = x[o + i]; q += v * v; } const rms = Math.sqrt(q / FR); let f0 = 0;
    if (rms > 0.006) { let best = 0, bl = 0; for (let l = 40; l <= 230; l++) { let c = 0, e1 = 0; for (let i = 0; i < FR - l; i++) { c += x[o + i] * x[o + i + l]; e1 += x[o + i + l] * x[o + i + l]; } const n = c / Math.sqrt(q * e1 + 1e-9); if (n > best) { best = n; bl = l; } } if (best > 0.5 && bl) f0 = R / bl; }
    return { rms, f0 }; }
  function analyze(x) { const F = []; for (let o = 0; o + FR <= x.length; o += HOP) F.push(frame(x, o)); return F; }
  function voiceThr(F) { const s = F.map(f => f.rms).sort((a, b) => a - b); const noise = s[Math.floor(s.length * 0.15)] || 0, mx = s[s.length - 1] || 0; return Math.max(0.012, noise * 3, mx * 0.08); }
  function span(F, thr) { let a = F.findIndex(f => f.rms > thr); if (a < 0) return null; let b = F.length - 1; while (b > a && F[b].rms <= thr) b--; return [a, b]; }
  function med5(v) { return v.map((x, i) => { if (isNaN(x)) return NaN; const w = []; for (let k = -2; k <= 2; k++) { const y = v[i + k]; if (y !== undefined && !isNaN(y)) w.push(y); } w.sort((p, q) => p - q); return w[Math.floor(w.length / 2)]; }); }
  function contour(F, sp) { const seg = F.slice(sp[0], sp[1] + 1), vs = seg.filter(f => f.f0).map(f => f.f0).sort((p, q) => p - q), med = vs[Math.floor(vs.length / 2)] || 150, mx = Math.max(...seg.map(f => f.rms)) || 1;
    const st = med5(seg.map(f => f.f0 ? 12 * Math.log2(f.f0 / med) : NaN)); return seg.map((f, i) => ({ e: f.rms / mx, s: st[i] })); }
  function resample(arr, key, N) { const out = []; for (let i = 0; i < N; i++) { const p = i / (N - 1) * (arr.length - 1), lo = Math.floor(p), hi = Math.min(arr.length - 1, lo + 1), t = p - lo, A = arr[lo][key], B = arr[hi][key]; out.push(isNaN(A) ? B : isNaN(B) ? A : A * (1 - t) + B * t); } return out; }
  function fill(v) { const o = v.slice(); let l = NaN; for (let i = 0; i < o.length; i++) { if (!isNaN(o[i])) l = o[i]; else o[i] = l; } l = NaN; for (let i = o.length - 1; i >= 0; i--) { if (!isNaN(o[i])) l = o[i]; else o[i] = l; } return o.map(x => isNaN(x) ? 0 : x); }
  const smooth = v => v.map((x, i) => (v[Math.max(0, i - 1)] + x + v[Math.min(v.length - 1, i + 1)]) / 3);
  function pear(a, b) { const n = a.length; if (n < 3) return 0; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n; let c = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; c += x * y; va += x * x; vb += y * y; } return va && vb ? c / Math.sqrt(va * vb) : 0; }
  function pearS(a, b) { let best = -1; for (let k = -4; k <= 4; k++) { const A = [], B = []; for (let i = 0; i < a.length; i++) { const j = i + k; if (j >= 0 && j < b.length) { A.push(a[i]); B.push(b[j]); } } best = Math.max(best, pear(A, B)); } return best; }
  async function model(au) {
    if (MODELS[au]) return MODELS[au];
    const src = window.M1 && M1.audioSrc ? M1.audioSrc(au) : au; const ab = await (await fetch(src)).arrayBuffer(); const buf = await ac().decodeAudioData(ab);
    const x = down(buf.getChannelData(0), buf.sampleRate), F = analyze(x), thr = voiceThr(F), sp = span(F, thr) || [0, Math.max(0, F.length - 1)], con = contour(F, sp);
    return MODELS[au] = { buf, con, dur: Math.max(0.3, (sp[1] - sp[0] + 1) * HOP / R) };
  }
  // ---------- vista: línea del modelo + línea del estudiante ----------
  function view(host, opts) {
    opts = opts || {}; const w = document.createElement('div'); w.className = 'mel9';
    w.innerHTML = `<canvas class="mel9-cv"></canvas><div class="mel9-lg"><span><i class="mo"></i>Modelo</span><span><i class="me"></i>Tu voz</span></div>`;
    host.appendChild(w); const cv = w.querySelector('canvas'), g = cv.getContext('2d');
    const col = () => getComputedStyle(w).getPropertyValue('--mel9-me').trim() || '#E3242B', colM = () => getComputedStyle(w).getPropertyValue('--mel9-mo').trim() || '#c3cddd';
    const size = () => { const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = Math.max(10, Math.round(r.width * d)); cv.height = Math.max(10, Math.round((r.height || 70) * d)); };
    const yOf = (s) => cv.height / 2 - Math.max(-9, Math.min(9, s)) / 9 * (cv.height / 2 - 8);
    let M = null;
    function draw(stu, live) { size(); const W = cv.width, H = cv.height, d = window.devicePixelRatio || 1; g.clearRect(0, 0, W, H);
      const line = (pts, c, lw, a) => { g.globalAlpha = a; g.strokeStyle = c; g.lineWidth = lw * d; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); let on = false; pts.forEach(p => { if (!p || isNaN(p[1])) { on = false; return; } if (!on) { g.moveTo(p[0], p[1]); on = true; } else g.lineTo(p[0], p[1]); }); g.stroke(); g.globalAlpha = 1; };
      if (M) { const s = smooth(fill(M.con.map(c => c.s))); line(M.con.map((c, i) => [i / Math.max(1, M.con.length - 1) * W, c.e > 0.12 ? yOf(s[i]) : NaN]), colM(), 8, 0.9); }
      if (stu && stu.length) { let pv = null; const pts = stu.map(p => { let s = p.s; if (s != null && !isNaN(s) && pv != null && Math.abs(s - pv) > 6) s = NaN; if (s != null && !isNaN(s)) pv = s; return [Math.min(1.15, p.x) * W, s == null || isNaN(s) ? NaN : yOf(s)]; });
        line(pts, col(), 4, 1); const L = pts.filter(p => !isNaN(p[1])).pop(); if (L && live) { g.fillStyle = col(); g.beginPath(); g.arc(L[0], L[1], 5 * d, 0, 7); g.fill(); } } }
    return { el: w, setModel(m) { M = m; draw(null); }, draw, get model() { return M; } };
  }
  // ---------- una toma ----------
  let REC = null;
  function stop() { if (REC) REC(); }
  async function take(au, v, opts) {
    opts = opts || {}; stop(); const m = await model(au); v.setModel(m);
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); } catch (e) { return { err: 'mic' }; }
    const ctx = ac(), src = ctx.createMediaStreamSource(stream), pr = ctx.createScriptProcessor(2048, 1, 1), raw = []; let pend = new Float32Array(0), frames = [], noise = [], thr = 0.02, onset = -1, lastV = -1; const stu = [], t0 = performance.now();
    const maxMs = Math.max(4000, m.dur * 2200 + 2500); opts.onStart && opts.onStart();
    try { window.MRAWAVE && MRAWAVE.stream && MRAWAVE.stream(stream); } catch (e) { }
    return new Promise(res => {
      const fin = () => { if (!REC) return; REC = null; try { pr.disconnect(); src.disconnect(); } catch (e) { } stream.getTracks().forEach(t => t.stop()); res(score(raw, ctx.sampleRate, m, v)); };
      REC = fin;
      pr.onaudioprocess = e => { if (!REC) return; const d = e.inputBuffer.getChannelData(0); raw.push(new Float32Array(d)); const y = down(d, ctx.sampleRate), z = new Float32Array(pend.length + y.length); z.set(pend); z.set(y, pend.length); pend = z;
        while (pend.length >= FR) { const f = frame(pend, 0); frames.push(f); pend = pend.slice(HOP); const tms = frames.length * HOP / R * 1000;
          if (tms < 300) { noise.push(f.rms); thr = Math.max(0.018, (noise.reduce((a, b) => a + b, 0) / noise.length) * 3.2); continue; }
          if (f.rms > thr) { if (onset < 0) onset = frames.length - 1; lastV = frames.length - 1; }
          if (onset >= 0) { const el = (frames.length - 1 - onset) * HOP / R; stu.push({ x: el / m.dur, f0: f.f0 && f.rms > thr ? f.f0 : null });
            const vs = stu.filter(p => p.f0).map(p => p.f0).sort((a, b) => a - b), md = vs[Math.floor(vs.length / 2)]; v.draw(stu.map(p => ({ x: p.x, s: p.f0 && md ? 12 * Math.log2(p.f0 / md) : null })), true); opts.onLive && opts.onLive(el / m.dur); } }
        const now = performance.now() - t0; if (onset >= 0 && (frames.length - 1 - lastV) * HOP / R > 1.0) fin(); else if (onset < 0 && now > 7000) fin(); else if (now > maxMs) fin(); };
      src.connect(pr); pr.connect(ctx.destination);
    });
  }
  function score(raw, rate, m, v) {
    const n = raw.reduce((a, b) => a + b.length, 0), all = new Float32Array(n); let o = 0; raw.forEach(b => { all.set(b, o); o += b.length; });
    const F = analyze(down(all, rate)).slice(15), thr = voiceThr(F), sp = span(F, thr);
    const voiced = sp ? F.slice(sp[0], sp[1] + 1).filter(f => f.rms > thr).length : 0;
    if (!sp || voiced < 5 || Math.max(0, ...F.map(f => f.rms)) < 0.02) { v.draw(null); return { silent: true }; }
    const con = contour(F, sp), N = 60, eM = resample(m.con, 'e', N), eS = resample(con, 'e', N), pM = smooth(fill(resample(m.con, 's', N))), pS = smooth(fill(resample(con, 's', N)));
    const dur = (sp[1] - sp[0] + 1) * HOP / R, ratio = dur / m.dur, cr = pearS(eM, eS), ci = pearS(pM, pS);
    const r = (cr > 0.55 && ratio > 0.7 && ratio < 1.5) ? 3 : (cr > 0.3 && ratio > 0.55 && ratio < 1.9) ? 2 : 1, it = ci > 0.45 ? 3 : ci > 0.15 ? 2 : 1;
    const fin = a => a.slice(-12).reduce((s, x, i, arr) => i ? s + (x - arr[i - 1]) : 0, 0), fm = fin(pM), fs = fin(pS);
    let tip = '¡Suena muy natural!';
    if (r < 3 && ratio >= 1.5) tip = 'Dilo un poco más rápido y de corrido.';
    else if (r < 3 && ratio <= 0.7) tip = 'Más despacio: que se oiga cada palabra.';
    else if (it < 3 && fm > 1.5 && fs < 0) tip = 'Al final, sube la voz como el modelo.';
    else if (it < 3 && fm < -1.5 && fs > 0) tip = 'Al final, baja la voz como el modelo.';
    else if (it < 3) tip = 'Imita la melodía: dónde sube y baja la voz.';
    else if (r < 3) tip = 'Sigue el ritmo del modelo.';
    const a = Math.max(0, (sp[0] + 15) * HOP / R - 0.15), b = Math.min(all.length / rate, (sp[1] + 15) * HOP / R + FR / R + 0.2), seg = all.slice(Math.floor(a * rate), Math.floor(b * rate));
    const buf = ac().createBuffer(1, Math.max(1, seg.length), rate); buf.copyToChannel(seg, 0);
    v.draw(con.map((c, i) => ({ x: i / con.length * ratio, s: c.s })), false);
    const ok = r >= 2 && ratio > 0.5 && ratio < 2.1; // v517: hablar no basta: tiene que parecerse al modelo
    if (!ok) tip = 'No se parece a la frase. Escúchala y repítela.';
    return { r, it, tip, buf, ok };
  }
  let PS = null;
  function play(buf) { try { if (PS) PS.stop(); } catch (e) { } return new Promise(res => { const s = ac().createBufferSource(); s.buffer = buf; s.connect(ac().destination); s.onended = () => { if (PS === s) PS = null; res(); }; PS = s; s.start(); }); }
  const stars = (n) => '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i>';
  // resultado estándar: estrellas + consejo (nunca muestra lo que dijo)
  function resultHTML(r) { return `<div class="mel9-res${r.ok === false ? ' no' : ''}"><span>Ritmo <b>${stars(r.r)}</b></span><span>Entonación <b>${stars(r.it)}</b></span></div><p class="mel9-tip">${r.tip}</p>`; }
  const can = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext));
  // juicio completo en un contenedor: vista + resultado. Devuelve {silent}|{err}|{ok,r,it,tip,buf}
  async function judge(au, host) { host.innerHTML = ''; const v = view(host); let r; try { r = await take(au, v); } catch (e) { r = { err: 1 }; }
    if (r.err) { host.insertAdjacentHTML('beforeend', '<p class="mel9-tip">Permite el micrófono para practicar.</p>'); return r; }
    if (r.silent) { host.insertAdjacentHTML('beforeend', '<p class="mel9-tip">No te escuché. Acércate al micrófono y repite.</p>'); return r; }
    host.insertAdjacentHTML('beforeend', resultHTML(r)); return r; }
  // puntaje 0-100 para retos antiguos: 100 = 3+3 estrellas; si no se parece, menos de 60
  async function scoreAu(au, host) { const r = await judge(au, host); if (r.err) return { err: 1 }; if (r.silent) return { silent: 1 }; return { score: !r.ok ? 45 : r.r + r.it >= 6 ? 100 : r.r + r.it >= 5 ? 90 : 80, r }; }
  window.MRMEL = { can, model, view, take, stop, play, resultHTML, stars, judge, score: scoreAu };
})();
