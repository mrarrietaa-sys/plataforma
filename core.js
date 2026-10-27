/* =====================================================================
   CORE — utilidades, estado (progreso), audio, voz, UI común
   ===================================================================== */
(function () {
  const D = window.M1DATA, C = window.M1CONFIG;
  // información del módulo (cada módulo la define en mod-a1.js / mod-a2.js)
  const MOD = Object.assign({ id: 'A1', n: 1, es: 'Módulo 1', en: 'Module 1', level: 'Elementary A1', levelEs: 'Elemental (A1)', classes: 28, topics: 14,
    stateKey: 'mra_m1_progress_v1', examKey: 'mra_m1_exam_v1', audio: 't', games: 'g3', next: 'Module 2' }, C.MOD || {});
  C.MODULE_ID = MOD.id;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const today = () => new Date().toISOString().slice(0, 10);

  /* ---------- hash for access codes (same one admin.html uses) ---------- */
  function codeHash(code) {
    const s = 'mra-m1|' + String(code).trim().toUpperCase();
    let h1 = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h1 ^= s.charCodeAt(i); h1 = Math.imul(h1, 0x01000193) >>> 0; }
    let h2 = 5381;
    for (let i = 0; i < s.length; i++) { h2 = (Math.imul(h2, 33) + s.charCodeAt(i)) >>> 0; }
    return 'h' + h1.toString(36) + h2.toString(36).slice(0, 3);
  }

  /* ---------- state (local, cloud-ready: one JSON object) ---------- */
  const KEY = MOD.stateKey;
  const fresh = () => ({ v: 1, name: '', created: Date.now(), xp: 0, streak: { last: '', n: 0 }, parts: {}, skills: { listening: [0, 0], reading: [0, 0], speaking: [0, 0], writing: [0, 0] }, weak: {}, unlocked: [], all: false, final: null, hw: {}, last: null, sound: true });
  let S;
  const TEACH = !!(window.MRTEACH && MRTEACH.on());
  try { S = TEACH ? Object.assign(fresh(), { tourDone: true, review: true }) : Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
  const save = () => { if (TEACH) return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  function touchStreak() {
    const t = today(); if (S.streak.last === t) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    S.streak.n = (S.streak.last === y) ? S.streak.n + 1 : 1; S.streak.last = t; save();
  }
  function addSkill(skill, c, t) { if (!skill || !S.skills[skill]) return; S.skills[skill][0] += c; S.skills[skill][1] += t; }
  function addWeak(w, au) { if (!w) return; const k = w; S.weak[k] = S.weak[k] || { n: 0, au }; S.weak[k].n++; if (au) S.weak[k].au = au; }
  function okWeak(w) { if (S.weak[w]) { S.weak[w].n--; if (S.weak[w].n <= 0) delete S.weak[w]; } }
  function skillPct(k) { const [c, t] = S.skills[k]; return t ? Math.round(c / t * 100) : 0; }

  /* ---------- access ---------- */
  // ACCESO (código pagado) + PROGRESO (los temas se abren en orden)
  const PF = window.MRAP; const MID = C.MODULE_ID || 'A1';
  const hasProfile = () => !!(PF && PF.get());
  const review = () => !!(C.UNLOCK_ALL || S.review || (PF && (PF.isStaff() || !!(PF.get() || {}).demo)));
  const partDone = (id) => !!(S.parts[id] && S.parts[id].done);
  function hasAccess(n) { return review() || S.all || (C.FREE_TOPICS || []).includes(n) || S.unlocked.includes(n); }
  function progressOpen(n) { if (review() || n <= 1) return true; return D.topics.filter(t => t.n < n).every(t => t.parts.every(p => partDone(p.id))); }
  function lockReason(n) {
    if (review()) return null; try { const pp = PF && PF.get && PF.get(); if (pp && pp.allOpen) return null; } catch (e) { }
    if (hasProfile()) { const r = PF.role(MID); if (r === 'review') return null; if (r !== 'current') return 'module';
      if (PF.isTrial() && n > PF.TRIAL_TOPICS) return 'trial'; if (!progressOpen(n)) return 'progress'; return paceReason(n); }
    if (!progressOpen(n)) return 'progress'; if (!hasAccess(n)) return 'access'; return null; }
  // 📅 ritmo del curso: el tema se abre en su fecha y si aprobó el anterior con 80% (lo que ya empezó nunca se bloquea)
  const topicStarted = (n) => { const t = D.topics.find(x => x.n === n); return !!(t && t.parts.some(p => S.parts[p.id] && (S.parts[p.id].done || S.parts[p.id].step))); };
  function paceDate(n) { return PF && PF.paceDate ? PF.paceDate(PF.mod(MID).n, n) : null; }
  function weakParts(n) { const t = D.topics.find(x => x.n === n - 1); if (!t) return []; return t.parts.filter(p => { const r = S.parts[p.id]; return r && r.done && r.best != null && r.best < PF.PACE_MIN; }); }
  function paceReason(n) {
    const paced = !!(PF.paceOn && PF.paceOn()), trial = PF.isTrial(); // gratuitos: sin fechas, pero también necesitan 80% para abrir el tema 2
    if ((!paced && !trial) || topicStarted(n)) return null;
    if (paced) { const d = paceDate(n); if (d && d > PF.todayISO()) return 'pace'; }
    if (n > 1 && weakParts(n).length) return 'mastery'; return null; }
  function isUnlocked(topicN) { return !lockReason(topicN); }
  const doneCount = () => D.topics.reduce((a, t) => a + t.parts.filter(p => partDone(p.id)).length, 0);
  const totalParts = () => D.topics.reduce((a, t) => a + t.parts.length, 0);
  // MODO REPASO: el estudiante ya superó este módulo (clasificación o avance) → todo abierto y las clases cuentan como superadas
  function reviewMode() { return !!(hasProfile() && !PF.isStaff() && PF.role(MID) === 'review'); }
  function revCount() { const R = S.rev || {}; return D.topics.reduce((a, t) => a + t.parts.filter(p => R[p.id]).length, 0); }
  function finalUnlocked() { if (review() || reviewMode()) return true; try { const pp = PF && PF.get && PF.get(); if (pp && pp.allOpen) return true; } catch (e) { } if (hasProfile() && (PF.isTrial() || !['current', 'review'].includes(PF.role(MID)))) return false; return doneCount() === totalParts(); }
  function redeem(code) {
    const hh = codeHash(code);
    if ((C.REVIEW_CODES || []).includes(hh)) { S.review = true; save(); return { topics: 'all', review: true }; }
    const hit = (C.ACCESS_CODES || []).find(c => c.hash === hh);
    if (!hit) return false;
    if (hit.topics === 'all') S.all = true;
    else S.unlocked = [...new Set([...S.unlocked, ...hit.topics])];
    save(); return hit;
  }

  /* ---------- helpers on content ---------- */
  const allParts = () => D.topics.flatMap(t => t.parts.map(p => Object.assign(p, { _t: t })));
  const partById = (id) => allParts().find(p => p.id === id);
  function prevPart(p) { const a = allParts(); const i = a.findIndex(x => x.id === p.id); return i > 0 ? a[i - 1] : null; }
  function nextPart(p) { const a = allParts(); const i = a.findIndex(x => x.id === p.id); return a[i + 1] || null; }
  function partStars(id) { return (S.parts[id] && S.parts[id].stars) || 0; }
  function overallPct() { const a = allParts(); return Math.round(a.filter(p => S.parts[p.id] && S.parts[p.id].done).length / a.length * 100); }

  /* ---------- images ---------- */
  function imgURL(src, w = 640, hgt = 480) {
    if (!src) return '';
    if (src.startsWith('u:')) return `https://images.unsplash.com/${src.slice(2)}?w=${w}&h=${hgt}&fit=crop&crop=entropy&q=82&auto=format`;
    if (src.startsWith('flag:')) return `https://flagcdn.com/w1280/${src.slice(5)}.png`;
    return '';
  }
  function photo(src, opts = {}) {
    const badge = opts.badge ? `<span class="badge">${esc(opts.badge)}</span>` : '';
    if (src && src.startsWith('#')) {
      const t = src.slice(1); const fs = t.length <= 2 ? 'clamp(54px,12vw,96px)' : t.length <= 3 ? 'clamp(40px,9vw,72px)' : 'clamp(22px,5vw,38px)';
      return `<div class="ph ${opts.cls || ''}"><div class="tc ${opts.dark ? 'dark' : ''}" style="font-size:${fs}">${esc(t)}</div>${badge}</div>`;
    }
    const isFlag = src && src.startsWith('flag:');
    // alta resolución en celulares (pantallas retina): el navegador elige 640, 960 o 1280 px
    const set = isFlag ? '' : ` srcset="${imgURL(src, 640, 480)} 640w, ${imgURL(src, 960, 720)} 960w, ${imgURL(src, 1280, 960)} 1280w" sizes="(max-width:600px) 92vw, 460px"`;
    return `<div class="ph ${isFlag ? 'flag' : ''} ${opts.cls || ''}"><img loading="lazy" decoding="async" alt="${esc(opts.alt || '')}" src="${imgURL(src, 960, 720)}"${set} onerror="this.style.opacity=0">${badge}</div>`;
  }

  /* ---------- audio (natural neural voices pre-generated as MP3) ---------- */
  let cur = null, curBtn = null, curEnd = null; const ext = new Set();
  // botón global "Detener audio" (aparece cuando suena cualquier audio)
  let pill = null;
  function audioUI() {
        const on = !!cur || [...ext].some(a => !a.paused && !a.ended) || !!(window.speechSynthesis && speechSynthesis.speaking);
    if (pill) pill.classList.toggle('on', on);
  }
  function halt() {
    if (cur) { cur.pause(); cur = null; }
    if (curBtn) { curBtn.classList.remove('playing'); curBtn = null; }
    if (curEnd) { const e = curEnd; curEnd = null; e(); }
    ext.forEach(a => { a.pause(); a.dispatchEvent(new Event('ended')); }); ext.clear();
    if (window.speechSynthesis && !window.__mraGreet) speechSynthesis.cancel();
    audioUI();
  }
  // stop(): detiene TODO el audio y avisa a las secuencias ("Escuchar todo", diálogos, lecturas)
  function stop() { halt(); window.dispatchEvent(new Event('m1-audio-stop')); }
  // botón rojo flotante "Detener" que aparece solo mientras suena una secuencia larga y su botón original ya no se ve en pantalla
  function floatStop(btn) {
    let pill = document.getElementById('stop-float');
    if (!pill) { pill = document.createElement('button'); pill.id = 'stop-float'; pill.type = 'button'; pill.innerHTML = '⏹ Detener audio'; document.body.appendChild(pill); }
    pill.onclick = () => stop();
    let io = null; try { io = new IntersectionObserver(([en]) => pill.classList.toggle('on', !en.isIntersecting && btn.isConnected), { rootMargin: '-70px 0px 0px 0px' }); io.observe(btn); } catch (e) { }
    let off = false; const hide = () => { if (off) return; off = true; if (io) io.disconnect(); pill.classList.remove('on'); window.removeEventListener('m1-audio-stop', hide); };
    window.addEventListener('m1-audio-stop', hide);
    return hide;
  }
  // 🔇 v415: la plataforma NUNCA se escucha a sí misma: se registra todo audio que suene (Audio, <audio>, voz del navegador)
  const ALLA = new Set(); let audEnd = 0;
  try { const P0 = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { const a = this; if (!a.__mraT) { a.__mraT = 1; const off = () => { ALLA.delete(a); audEnd = Date.now(); }; a.addEventListener('pause', off); a.addEventListener('ended', off); a.addEventListener('error', off); a.addEventListener('playing', () => ALLA.add(a)); } ALLA.add(a); return P0.apply(this, arguments); }; } catch (e) { }
  function audBusy() { let on = !!(window.speechSynthesis && speechSynthesis.speaking); const live = (a) => !a.paused && !a.ended && !a.muted && a.volume > 0 && a.readyState > 2 && !a.error; ALLA.forEach(a => { if (!live(a)) { if (a.paused || a.ended || a.error) ALLA.delete(a); } else on = true; }); if (cur && live(cur)) on = true; return on; } // v421: solo cuenta el audio que de verdad está sonando
  function audQuiet() { return !audBusy() && Date.now() - audEnd > 300; }
  function trackAudio(a) { ext.add(a); ['play', 'playing', 'pause'].forEach(ev => a.addEventListener(ev, audioUI)); a.addEventListener('ended', () => { ext.delete(a); audioUI(); }); audioUI(); return a; }
  function play(au, opts = {}) {
    halt();
    return new Promise(res => {
      if (!au) return res();
      const a = new Audio(audioSrc(au));
      a.playbackRate = opts.rate || 1; a.preservesPitch = true;
      cur = a; if (opts.btn) { curBtn = opts.btn; opts.btn.classList.add('playing'); }
      let done = false;
      const end = () => { if (done) return; done = true; if (opts.btn) opts.btn.classList.remove('playing'); if (cur === a) cur = null; if (curEnd === end) curEnd = null; audioUI(); res(); };
      curEnd = end;
      a.onended = end; a.onerror = end;
      a.play().then(audioUI).catch(end);
    });
  }
  // audio is packed in a few files (js/audio/*.js) so the folder is easy to upload to GitHub
  function loadAudio(groups, onProg) {
    window.__audLoaded = window.__audLoaded || {};
    const todo = groups.filter(g => !window.__audLoaded[g]); let nDone = 0; onProg && onProg(0, todo.length);
    return Promise.all(todo.map(g => new Promise(res0 => { const res = () => { nDone++; onProg && onProg(nDone, todo.length); res0(); };
      // works both with folders (js/audio/t1.js) and with all files in one folder (t1.js)
      const base = (document.querySelector('script[src*="core.js"]').getAttribute('src') || '').replace(/core\.js(\?.*)?$/, '');
      const tryLoad = (paths) => { if (!paths.length) return res(); const sc = document.createElement('script'); sc.src = paths[0]; sc.onload = res; sc.onerror = () => { sc.remove(); tryLoad(paths.slice(1)); }; document.head.appendChild(sc); };
      const q = ((document.querySelector('script[src*="core.js"]').getAttribute('src') || '').match(/\?.*$/) || [''])[0]; // misma versión que core.js → los audios nuevos no quedan en caché
      tryLoad([base + 'audio/' + g + '.js' + q, base + g + '.js' + q]);
    })));
  }
  async function playSeq(list, gap = 250) { for (const au of list) { await play(au); await sleep(gap); } }
  // little UI sound effects (WebAudio, no files)
  let actx = null;
  function sfx(type) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [[660, 0], [880, .09]], bad: [[220, 0], [180, .12]], tap: [[520, 0]], win: [[523, 0], [659, .12], [784, .24], [1046, .36]], flip: [[400, 0]] }[type] || [[440, 0]];
      notes.forEach(([f, t]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type === 'bad' ? 'square' : 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(type === 'bad' ? .06 : .14, actx.currentTime + t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + t + (type === 'win' ? .35 : .18));
        o.connect(g).connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + .4);
      });
    } catch (e) { }
  }
  // 👧 Kids y Teens (9 a 17 años): la voz que felicita y anima es de mujer; adultos: voz de hombre
  function ageGroup() { try { const p = window.MRAP && MRAP.get && MRAP.get(); const b = p && p.birth; if (!/^\d{4}-\d{2}-\d{2}/.test(b || '')) return p && (p.ag === 'kids' || p.ag === 'teens') ? p.ag : 'adult'; const t = new Date(), y = +b.slice(0, 4), m = +b.slice(5, 7), d = +b.slice(8, 10); let a = t.getFullYear() - y; if (t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) a--; return a < 12 ? 'kids' : a < 18 ? 'teens' : 'adult'; } catch (e) { return 'adult'; } }
  const femFB = () => ageGroup() !== 'adult';
  let fbfReq = null; const fbf = () => fbfReq || (fbfReq = loadAudio(['fbf']).catch(() => null));
  function fbPlay(id) { if (!femFB()) return play(id); const f = 'fb_' + id; if (window.AUD && window.AUD[f]) return play(f); return fbf().then(() => play(window.AUD && window.AUD[f] ? f : id)); }
  setTimeout(() => { if (femFB()) fbf(); }, 1500);
  const FBP = { 'Awesome!': '98561b5346', 'Great job!': 'a88a2d51d2', 'Perfect!': '9abc262823', 'Excellent!': '54f1859c38', 'Well done!': 'b93b9f5f0f', 'You got it!': '1a9de5fa28', 'Fantastic!': 'd5bfd68ea5', 'Nice work!': 'aa2b15da71' }, FBR = { 'Try again.': 'e4bbac6f81', 'Almost! Listen again.': '2ace7bd775', 'Not quite. You can do it!': '8b4c184411' };
  function praise() { const P = (D && D.praise) || FBP; const k = Object.keys(P); if (k.length) return fbPlay(P[k[Math.floor(Math.random() * k.length)]]); }
  // voz de ánimo cuando la respuesta no es correcta ("Try again.", "Almost! Listen again."…)
  function encourage() { const R = (D && D.retry) || FBR; const k = Object.keys(R); if (k.length) return fbPlay(R[k[Math.floor(Math.random() * k.length)]]); }

  /* ---------- speech recognition ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canSR = !!SR;
  // 📱 v383: medimos en silencio si el reconocimiento de voz funciona en cada tipo de celular (para decidir con datos)
  const UA = navigator.userAgent || '';
  const IOS = /iPhone|iPad|iPod/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
  const MOBILE = IOS || /Android/i.test(UA);
  const DEVK = (IOS ? 'iOS' : /Android/i.test(UA) ? 'Android' : 'PC') + '·' + (/CriOS/.test(UA) ? 'Chrome' : /FxiOS|Firefox/.test(UA) ? 'Firefox' : /EdgiOS|Edg\//.test(UA) ? 'Edge' : /SamsungBrowser/.test(UA) ? 'Samsung' : /Chrome/.test(UA) ? 'Chrome' : /Safari/.test(UA) ? 'Safari' : 'Otro');
  function srStat(kind, err) { try { const K = 'mra_srstat_v1', o = JSON.parse(localStorage.getItem(K) || '{}') || {}; const d = o[DEVK] = o[DEVK] || { ok: 0, em: 0, er: 0, sf: 0 }; d[kind] = (d[kind] || 0) + 1; if (kind === 'er' && err) { d.e = d.e || {}; d.e[err] = (d.e[err] || 0) + 1; } localStorage.setItem(K, JSON.stringify(o)); } catch (e) { } }
  const NOHEAR = (e) => !e || e === 'no-speech' || e === 'timeout';
  // 🎙️ MOTOR DE VOZ (v179): junta TODO lo que el estudiante dice (no solo la primera parte), no se corta en las pausas,
  // corrige los resultados repetidos de Android y espera un silencio real antes de terminar. Se habla normal, sin gritar.
  const lc = (x) => String(x || '').toLowerCase().replace(/\s+/g, ' ').trim();
  function segMerge(segs, alts) { // segs = [[alt0, alt1…], …]
    const t = lc(alts[0]); if (!t) return; const last = segs.length ? lc(segs[segs.length - 1][0]) : '';
    if (last && t.indexOf(last) === 0) segs[segs.length - 1] = alts;          // Android: el nuevo resultado repite y amplía el anterior
    else if (last && last.indexOf(t) === 0) return;                            // repetido
    else segs.push(alts);
  }
  function segAlts(segs, interim) {
    if (!segs.length) return interim && interim.length ? interim.slice() : [];
    const out = []; for (let k = 0; k < 5; k++) { const txt = segs.map(a => a[k] || a[0]).join(' ').replace(/\s+/g, ' ').trim(); if (txt && out.indexOf(txt) < 0) out.push(txt); }
    if (interim && interim[0]) { const t = (out[0] + ' ' + interim[0]).trim(); if (lc(interim[0]) && lc(out[0]).indexOf(lc(interim[0])) < 0) out.unshift(t); }
    return out;
  }
  function listen(timeoutMs = 8000, opts = {}) { // opts.quick: termina apenas el estudiante deja de hablar
    return new Promise((res) => {
      if (!SR) { srStat('er', 'nosupport'); return res({ error: 'nosupport', alts: [] }); }
      if (audBusy()) { try { stop(); } catch (e) { } return setTimeout(() => listen(timeoutMs, opts).then(res), 500); } // primero se calla la plataforma
      const t0 = Date.now(); let done = false, r = null, segs = [], interim = [], lastErr = '', idle = null, heardAny = false;
      timeoutMs = Math.max(timeoutMs, 9000); // nunca menos de 9 s: da tiempo a pensar y hablar con calma
      const fin = (err) => { if (done) return; done = true; clearTimeout(idle); try { r && r.abort(); } catch (e) { } const alts = segAlts(segs, interim); const e2 = err || lastErr || 'no-speech'; srStat(alts.length ? 'ok' : NOHEAR(e2) ? 'em' : 'er', e2); res(alts.length ? { alts } : { alts: [], error: e2 }); };
      const arm = () => { clearTimeout(idle); idle = setTimeout(() => fin(), opts.quick ? (segs.length ? 1300 : (interim.length ? 1700 : 3200)) : (segs.length ? 1800 : 3200)); }; // v421: espera a que el estudiante termine de hablar antes de calificar
      const hit = () => { return; if (!opts.target) return; try { const sc = (opts.scorer || ((a) => speechScore(opts.target, a)))(segAlts(segs, interim)).score; if (sc >= 90) { clearTimeout(idle); idle = setTimeout(() => fin(), segs.length ? 250 : 600); } } catch (e) { } }; // dijo la frase completa → se cierra ya // espera 1,8 s de silencio real antes de terminar
      const start = () => {
        if (done) return;
        r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = true;
        r.onresult = (e) => { if (!audQuiet()) { segs = []; interim = []; return; } heardAny = true; window.MRAWAVE && MRAWAVE.kick();
          for (let k = e.resultIndex; k < e.results.length; k++) { const rr = e.results[k], list = []; for (let i = 0; i < rr.length; i++) list.push(rr[i].transcript);
            if (rr.isFinal) { segMerge(segs, list); interim = []; } else interim = list; }
          arm(); hit(); };
        r.onspeechstart = () => { if (!audQuiet()) return; heardAny = true; window.MRAWAVE && MRAWAVE.kick(); arm(); };
        r.onerror = (e) => { lastErr = e.error; if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') fin(e.error); };
        r.onend = () => { if (done) return; if (Date.now() - t0 < timeoutMs - 500) { setTimeout(() => { try { start(); } catch (e) { fin('start'); } }, 60); } else fin(); }; // el navegador cortó en una pausa: sigue escuchando
        try { r.start(); } catch (e) { fin('start'); }
      };
      start();
      setTimeout(() => fin('timeout'), timeoutMs);
    });
  }
  // sesión larga "toca para grabar / toca para detener" (prueba de clasificación, exámenes): no pierde nada en las pausas
  function srSession(onText, onFatal) {
    const S = { onend: null }; if (!SR) return null; if (audBusy()) try { stop(); } catch (e) { }
    let active = true, segs = [], interim = [], r = null, ended = false;
    const text = () => segAlts(segs, interim)[0] || '';
    const start = () => { if (!active) return; r = new SR(); r.lang = 'en-US'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
      r.onresult = (e) => { if (!audQuiet()) return; window.MRAWAVE && MRAWAVE.kick(); for (let k = e.resultIndex; k < e.results.length; k++) { const rr = e.results[k], list = []; for (let i = 0; i < rr.length; i++) list.push(rr[i].transcript); if (rr.isFinal) { segMerge(segs, list); interim = []; } else interim = list; } onText && onText(text()); };
      r.onerror = (e) => { if (/not-allowed|audio-capture|service-not-allowed|language-not-supported/.test(e.error)) { active = false; srStat('er', e.error); onFatal && onFatal(e.error); } };
      r.onend = () => { if (active) setTimeout(start, 60); else if (!ended) { ended = true; srStat(text() ? 'ok' : 'em'); onText && onText(text()); S.onend && S.onend(); } };
      try { r.start(); } catch (e) { active = false; onFatal && onFatal('start'); } };
    S.stop = () => { active = false; try { r && r.stop(); } catch (e) { if (!ended) { ended = true; S.onend && S.onend(); } } };
    S.abort = () => { active = false; ended = true; try { r && r.abort(); } catch (e) { } };
    S.text = text; start(); return S;
  }
  /* ---------- voice recording (MediaRecorder) ---------- */
  async function recordVoice(ms = 4000, onTick) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); window.MRAWAVE && MRAWAVE.stream(stream);
    const rec = new MediaRecorder(stream); const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    const p = new Promise(r => rec.onstop = r);
    rec.start(); const t0 = Date.now();
    const iv = setInterval(() => onTick && onTick((Date.now() - t0) / ms), 100);
    await sleep(ms); rec.stop(); await p; clearInterval(iv);
    stream.getTracks().forEach(t => t.stop());
    return URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
  }

  /* ---------- text comparison ---------- */
  const CONTR = { "i'm": 'i am', "you're": 'you are', "he's": 'he is', "she's": 'she is', "it's": 'it is', "we're": 'we are', "they're": 'they are', "what's": 'what is', "that's": 'that is', "there's": 'there is', "isn't": 'is not', "aren't": 'are not', "don't": 'do not', "doesn't": 'does not', "i'll": 'i will', "can't": 'can not', "where's": 'where is', "how's": 'how is', "let's": 'let us' };
  const NUMW = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };
  function norm(s, expand = true) {
    s = String(s).toLowerCase().replace(/[’`´]/g, "'").replace(/[^a-z0-9'\s-]/g, ' ').replace(/-/g, ' ');
    if (expand) s = s.split(/\s+/).map(w => CONTR[w] || w).join(' ');
    return s.replace(/\s+/g, ' ').trim();
  }
  function words(s) { return norm(s).split(' ').filter(Boolean).map(w => (w in NUMW ? String(NUMW[w]) : w)); }
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) { const curr = [i]; for (let j = 1; j <= n; j++) curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = curr; }
    return prev[n];
  }
  // speaking score: % of target words found (order-tolerant), best over alternatives
  // 📱 iPhone (v383): Safari reconoce peor las palabras cortas → se califica con más tolerancia (palabras pequeñas omitidas valen la mitad)
  const FW = new Set(['a', 'an', 'the', 'is', 'are', 'am', 'to', 'of', 'do', 'does', 'it', 'in', 'on', 'at', 'and', 'i', 'my', 'your', 'he', 'she', 'we', 'you']);
  function speechScore(target, alts) {
    const tw = words(target); let best = { score: 0, heard: '', hit: [] };
    const L1 = IOS ? 2 : 3, L2 = IOS ? 5 : 6;
    for (const alt of alts) {
      const aw = words(alt); const pool = aw.slice(); const joined = aw.join(''); const hit = tw.map(w => { const i = pool.findIndex(x => x === w || (w.length > L1 && lev(x, w) <= 1) || (w.length > L2 && lev(x, w) <= 2)); if (i >= 0) { pool.splice(i, 1); return true; } return w.length > L1 && joined.indexOf(w) >= 0; });
      const got = hit.reduce((t, x, i) => t + (x ? 1 : IOS && FW.has(tw[i]) && hit.some(Boolean) ? 0.5 : 0), 0);
      const sc = Math.min(100, Math.round(got / tw.length * 100));
      let sc2 = sc;
      // v420: respuestas cortas: si dijo las palabras importantes (y las letras como letras), es correcto aunque falte "it's / a / the"
      if (tw.length <= 5) { const CW = tw.map((w, i) => [w, i]).filter(([w]) => !FW.has(w) && w !== 'is' && w !== 'it'); const ltr = (w) => /^[a-z]$/.test(w);
        if (CW.length) { const got2 = CW.filter(([w, i]) => hit[i] || (ltr(w) && aw.some(x => asLetter(x) === w))).length; if (got2 === CW.length) sc2 = Math.max(sc2, 90); else sc2 = Math.min(sc2, 50); } // falta la palabra clave (ej. dijo hat en vez de cat): no pasa
        else if (tw.some(ltr) && aw.some(x => tw.includes(asLetter(x)))) sc2 = Math.max(sc2, 90); }
      if (sc2 > best.score || !best.heard) best = { score: sc2, heard: alt, hit };
    }
    return best;
  }

  /* ---------- grabar + evaluar al mismo tiempo (para TODAS las grabaciones) ---------- */
  // devuelve { url, alts, score }  (score = null si el navegador no puede evaluar)
  async function recordScore(target, ms, onTick, scorer) {
    if (!scorer && /^\s*[A-Za-z]\s*$/.test(String(target || ''))) scorer = letterScorer(String(target).trim()); // letras sueltas (A, B, C…)
    if (audBusy()) { try { stop(); } catch (e) { } await sleep(500); } // 🔇 nunca graba mientras suena la plataforma
    let rec = null, stream = null; const chunks = [];
    try { if ((typeof SR !== 'undefined' && SR) && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) throw 0; // en celular el micrófono no se puede compartir: se prioriza el reconocimiento de voz
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); window.MRAWAVE && MRAWAVE.stream(stream); rec = new MediaRecorder(stream); rec.ondataavailable = e => chunks.push(e.data); rec.start(); }
    catch (e) { if (!SR) throw e; }
    const t0 = Date.now(); const iv = setInterval(() => onTick && onTick(Math.min(1, (Date.now() - t0) / ms)), 100);
    let r = { alts: [] };
    if (SR) { r = await listen(ms, { quick: true, target: String(target || '').trim() || null, scorer }); if (Date.now() - t0 < 1200 && !r.alts.length) await sleep(Math.min(3000, Math.max(0, ms - (Date.now() - t0)))); }
    else await sleep(ms);
    clearInterval(iv); onTick && onTick(1);
    let url = null;
    if (rec) { const p = new Promise(x => rec.onstop = x); try { rec.stop(); } catch (e) { } await p; stream.getTracks().forEach(t => t.stop()); url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })); }
    let score = null, heard = '';
    if (r.alts.length) { if (scorer) { const s = scorer(r.alts); score = s.score; heard = s.heard; } else { const s = speechScore(target, r.alts); score = s.score; heard = s.heard; } }
    else if (SR && r.error !== 'audio-capture' && r.error !== 'service-not-allowed' && r.error !== 'start') { score = 0; }
    return { url, alts: r.alts, score, heard, error: r.error };
  }
  // deletreo: convierte lo que dijo el estudiante (ej. "jay oh h n") en letras y lo compara
  const LETTER_WORDS = { a: 'a', ay: 'a', hey: 'a', eh: 'a', b: 'b', be: 'b', bee: 'b', c: 'c', see: 'c', sea: 'c', si: 'c', d: 'd', dee: 'd', de: 'd', e: 'e', ee: 'e', f: 'f', ef: 'f', eff: 'f', g: 'g', gee: 'g', ji: 'g', h: 'h', age: 'h', aitch: 'h', etch: 'h', i: 'i', eye: 'i', aye: 'i', j: 'j', jay: 'j', k: 'k', kay: 'k', okay: 'k', ok: 'k', l: 'l', el: 'l', elle: 'l', ell: 'l', m: 'm', em: 'm', n: 'n', en: 'n', and: 'n', o: 'o', oh: 'o', owe: 'o', p: 'p', pee: 'p', pea: 'p', q: 'q', cue: 'q', queue: 'q', r: 'r', are: 'r', our: 'r', ar: 'r', s: 's', es: 's', ess: 's', yes: 's', ass: 's', as: 's', t: 't', tea: 't', tee: 't', ti: 't', tv: 't', u: 'u', you: 'u', ew: 'u', yu: 'u', v: 'v', vee: 'v', w: 'w', x: 'x', ex: 'x', y: 'y', why: 'y', z: 'z', zee: 'z', zed: 'z', eight: 'a', hay: 'a', bea: 'b', bi: 'b', cee: 'c', she: 'c', dean: 'd', thee: 'd', e: 'e', eve: 'e', if: 'f', jee: 'g', gi: 'g', ach: 'h', eh: 'a', jae: 'j', jey: 'j', ajay: 'j', gay: 'j', jade: 'j', cay: 'k', key: 'k', que: 'k', cake: 'k', al: 'l', hell: 'l', elf: 'l', l: 'l', am: 'm', emm: 'm', in: 'n', end: 'n', o: 'o', pe: 'p', pay: 'p', kew: 'q', cute: 'q', art: 'r', or: 'r', est: 's', tee: 't', tea: 't', yo: 'u', ve: 'v', we: 'v', double: 'w', axe: 'x', ax: 'x', wye: 'y', wai: 'y', zi: 'z', see: 'c', sea: 'c', the: 'd', dee: 'd', di: 'd', bee: 'b', be: 'b', b: 'b', beat: 'b', each: 'h', itch: 'h', ache: 'h', hi: 'i', high: 'i', jean: 'g', gee: 'g', jeep: 'g', g: 'g', all: 'l', ill: 'l', ale: 'l', yell: 'l', cell: 'l', jay: 'j', day: 'd', bay: 'b', pea: 'p', peak: 'p', tease: 't', team: 't', you: 'u', ewe: 'u', vee: 'v', via: 'v', ex: 'x', why: 'y', zee: 'z', zed: 'z', an: 'n', and: 'n', em: 'm', im: 'm', oh: 'o', owe: 'o', are: 'r', our: 'r', ok: 'k', okay: 'k', kay: 'k', cue: 'q', q: 'q', yes: 's', ass: 's', is: 's' }; // v421: más formas en que el celular escribe cada letra // v420: más formas en que el reconocedor escribe las letras
  // v420: convierte lo que escuchó el reconocedor en una letra (ej. "ajay" → j, "the letter K" → k, "okay" → k)
  function asLetter(tok) { tok = String(tok || '').toLowerCase(); if (tok === '8') return 'a'; tok = tok.replace(/[^a-z]/g, ''); if (!tok) return ''; if (tok.length === 1) return tok; if (LETTER_WORDS[tok]) return LETTER_WORDS[tok]; const t2 = tok.replace(/^(a|e|the|uh)/, ''); if (t2 && (t2.length === 1 || LETTER_WORDS[t2])) return t2.length === 1 ? t2 : LETTER_WORDS[t2]; return ''; }
  function letterScorer(word) {
    const W = word.toLowerCase().replace(/[^a-z]/g, '');
    return (alts) => { let best = { score: 0, heard: alts[0] || '' };
      for (const alt of alts) {
        const t = alt.toLowerCase().replace(/double\s*(u|you)/g, ' w ').replace(/\b(the\s+)?letter\b/g, ' ').replace(/\b(it'?s|it\s+is|is)\b/g, ' ').replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
        if (W.length === 1 && t.some(x => asLetter(x) === W)) { best = { score: 100, heard: alt }; break; } // una sola letra: basta con que la diga
        const asLetters = t.map(x => asLetter(x) || x).join('');
        const cand = [asLetters, t.join('')];
        for (const c of cand) { const d = lev(c, W); const sc = Math.max(0, Math.round((1 - d / Math.max(W.length, 1)) * 100)); if (sc > best.score) best = { score: sc, heard: alt }; }
      }
      return best; };
  }
  // 🗣️ v420: respuestas LIBRES (preguntas personales / sí-no): se acepta lo que el estudiante quiera decir;
  // la plataforma solo corrige la gramática básica y la pronunciación (nunca le dice qué responder)
  const FULLC = { "he's": 'he is', "she's": 'she is', "it's": 'it is', "they're": 'they are', "we're": 'we are', "you're": 'you are', "i'm": 'I am', "that's": 'that is' };
  function grammarFix(txt) {
    let t = String(txt || '').trim().replace(/\s+/g, ' '); if (!t) return null; const orig = t;
    t = t.replace(/\b(he|she|it|they|we|you|i|that)['’]?(s|re|m)\s*$/i, (m) => { const k = m.toLowerCase().replace('’', "'").replace(/^(he|she|it|that)s$/, "$1's").replace(/^(they|we|you)re$/, "$1're").replace(/^im$/, "i'm"); return FULLC[k] || m; }); // "yes he's" → "yes he is"
    const AG = [[/\b(he|she|it)\s+(are|am)\b/gi, '$1 is'], [/\b(they|we|you)\s+(is|am)\b/gi, '$1 are'], [/\bi\s+(is|are)\b/gi, 'I am'], [/\b(he|she|it)\s+have\b/gi, '$1 has'], [/\bi\s+has\b/gi, 'I have'], [/\b(they|we|you)\s+has\b/gi, '$1 have'], [/\b(he|she|it)\s+don'?t\b/gi, "$1 doesn't"], [/\ba\s+([aeiou]\w+)/gi, 'an $1'], [/\ban\s+([bcdfgjklmnpqrstvwxyz]\w+)/gi, 'a $1'], [/\bi\s+(\w)/g, 'I $1'], [/\b(i|you|we|they|he|she)\s+(have|has)\s+(\w+)\s+years(\s+old)?\b/gi, (m, a, b, n) => (a.toLowerCase() === 'i' ? 'I am' : /^(he|she)$/i.test(a) ? a + ' is' : a + ' are') + ' ' + n + ' years old']];
    AG.forEach(([re, to]) => { t = t.replace(re, to); });
    t = t.replace(/^\w/, c => c.toUpperCase()).replace(/^(yes|no)\s+/i, (m, w) => w[0].toUpperCase() + w.slice(1).toLowerCase() + ', ').replace(/\bi\b/g, 'I');
    if (!/[.!?]$/.test(t)) t += '.';
    const n = (x) => x.toLowerCase().replace(/[^a-z' ]/g, '').replace(/\s+/g, ' ').trim();
    return n(t) !== n(orig) ? t : null;
  }
  // v432: la respuesta es libre, PERO tiene que corresponder a la pregunta (de quién se habla y de qué se habla).
  // Nunca se califica "el contenido" (lo que el estudiante quiera decir); solo que responda la pregunta + gramática y pronunciación.
  const SUBJ = { you: ['i', 'my', 'me', 'we', 'our'], your: ['i', 'my', 'me', 'we', 'our'], he: ['he', 'his', 'him'], his: ['he', 'his', 'him'], she: ['she', 'her'], her: ['she', 'her'], they: ['they', 'their', 'them'], their: ['they', 'their', 'them'], it: ['it', 'its'], we: ['we', 'our', 'us'] };
  const qSubj = (q) => { const w = words(q); for (const x of w) if (SUBJ[x]) return x; return null; };
  function freeJudge(q, tgt, alts) {
    const heard = (alts && alts[0]) || ''; const ws = words(heard); let fix = grammarFix(heard);
    const yn = /^\s*(are|is|am|do|does|did|can|could|was|were|have|has|will|would|should)\b/i.test(q || '');
    const cw = (x) => words(x).filter(w => w.length > 2 && !FW.has(w) && !['yes', 'yeah', 'not', 'fine', 'thank', 'thanks', 'okay'].includes(w));
    const sj = qSubj(q || ''), want = sj ? SUBJ[sj] : null, hasS = want ? ws.some(w => want.includes(w)) : true;
    const otherS = ws.some(w => Object.values(SUBJ).flat().includes(w) && !(want || []).includes(w));
    let ok = false, off = false;
    if (yn) {
      const startYN = /^(yes|no|yeah|yep|nope|sure|of)$/.test(ws[0] || '');
      ok = startYN && (ws.length === 1 || hasS || !otherS); // "Yes" / "Yes, she is" / "No, she isn't"
      if (startYN && !ok) { ok = true; const su = ({ you: 'I', your: 'I', his: 'he', her: 'she', their: 'they' }[sj] || sj), v0 = (String(q).match(/^\s*(\w+)/) || ['', 'is'])[1].toLowerCase(), sg = ['he', 'she', 'it'].includes(su);
        const be = ['are', 'is', 'am'].includes(v0) ? (su === 'I' ? 'am' : sg ? 'is' : 'are') : ['do', 'does'].includes(v0) ? (sg ? 'does' : 'do') : ['was', 'were'].includes(v0) ? (su === 'I' || sg ? 'was' : 'were') : v0;
        fix = ws[0] === 'no' ? (be === 'am' ? "No, I'm not." : 'No, ' + su + ' ' + be + "n't.") : 'Yes, ' + su + ' ' + be + '.'; } // respondió sí/no pero con otra persona: solo se corrige
      if (!startYN) { const pool = new Set(cw((q || '') + ' ' + (tgt || ''))); ok = hasS && cw(heard).some(w => pool.has(w)); off = !ok; }
    } else {
      const sc = tgt ? speechScore(tgt, alts).score : 0; const pool = new Set(cw((q || '') + ' ' + (tgt || '')));
      const share = cw(heard).some(w => pool.has(w));
      ok = sc >= 55 || (share && (hasS || ws.length <= 3)) || (hasS && !otherS && ws.length >= 3 && share);
      if (!ok && ws.length && ws.length <= 2) { const toks = String(heard).trim().split(/\s+/); if (toks.every(t => /^[A-Z]/.test(t)) && !toks.some(t => Object.values(SUBJ).flat().includes(t.toLowerCase()))) ok = true; } // respuesta corta con un nombre propio (ej. "Brazil", "John")
      if (!ok && ws.length) off = true; // no corresponde a la pregunta (ej. "Where is she from?" → "I'm fine, thank you")
    }
    // si solo repitió la pregunta, no cuenta: tiene que responderla
    let rep = false; if (ok && q && words(q).length >= 3 && speechScore(q, alts).score >= 80 && (!tgt || speechScore(tgt, alts).score < 60)) { ok = false; rep = true; off = false; }
    return { ok, heard, fix: ok ? fix : null, rep, off };
  }
  // tarjeta de resultado de voz: SIEMPRE dice si estuvo bien o mal y deja intentar otra vez
  function voiceResult(box, { score, heard, url, model, onRetry, pass = 70 }) {
    box.innerHTML = '';
    const me = url ? new Audio(url) : null;
    const ok = score != null && score >= pass, mid = score != null && score >= 45 && !ok;
    const card = h(`<div class="vres ${score == null ? 'self' : ok ? 'ok' : mid ? 'mid' : 'bad'}">
      ${score == null ? `<b>🎧 Escucha tu voz y el modelo. ¿Sonó parecido?</b>` :
        `<div class="vres-t">${ok ? '✅ ¡Muy bien! Lo dijiste correctamente.' : mid ? '🟡 ¡Casi! Escucha el modelo y repite despacio.' : '❌ No sonó bien todavía. Escucha el modelo y vuelve a intentarlo.'}</div>
         <div class="meter"><div class="bar"><i style="width:${score}%;background:${ok ? 'var(--ok)' : mid ? '#d4a017' : 'var(--bad)'}"></i></div><b>${score}%</b></div>
         ${heard ? `<small class="muted">Te escuché: “${esc(heard)}”</small>` : ''}`}
      <div class="row vres-b">${me ? '<button class="btn w sm" data-a="me">▶ Mi voz</button>' : ''}${model ? '<button class="btn sm" data-a="mo">▶ Modelo</button>' : ''}
        ${score == null ? '<button class="btn k sm" data-a="y">👍 Sí, sonó igual</button><button class="btn w sm" data-a="r">🔁 No, intentar otra vez</button>' : `<button class="btn ${ok ? 'w' : 'k'} sm" data-a="r">🔁 Intentar otra vez</button>`}</div></div>`);
    box.appendChild(card);
    const q = (a) => card.querySelector(`[data-a="${a}"]`);
    if (q('me')) q('me').onclick = () => { stop(); me.currentTime = 0; me.play(); };
    if (q('mo')) q('mo').onclick = () => model();
    q('r').onclick = () => onRetry && onRetry();
    if (q('y')) q('y').onclick = () => { card.className = 'vres ok'; card.querySelector('b').textContent = '✅ ¡Muy bien! Sigue practicando así.'; q('y').remove(); sfx('ok'); box.dispatchEvent(new CustomEvent('selfok')); };
    sfx(score == null ? 'tap' : ok || mid ? 'ok' : 'bad'); if (ok) praise(); else if (score != null) setTimeout(encourage, 250);
    return ok;
  }

  /* ---------- burbujas flotantes (diccionario, chat): arrastrables; se quitan soltándolas en la ✕ del centro ---------- */
  let dropX = null;
  function dropZone(show) {
    if (!dropX) { dropX = h('<div id="drop-x"><span>✕</span><small>Suelta aquí para quitar</small></div>'); document.body.appendChild(dropX); }
    dropX.classList.toggle('on', show);
  }
  function overDrop(x, y) { if (!dropX) return false; const r = dropX.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return Math.hypot(x - cx, y - cy) < 70; }
  function floatBubble({ id, img, label, posKey, hiddenKey, onOpen, onHide, cls = '' }) {
    if (document.getElementById(id)) return document.getElementById(id);
    const b = h(`<button id="${id}" class="fbub ${cls}" title="${esc(label)} (puedes arrastrarlo)"><img src="${img}" alt=""><span>${esc(label)}</span><i class="fbadge hidden"></i></button>`);
    document.body.appendChild(b);
    const place = () => { const p = S[posKey]; if (!p) { b.style.left = ''; b.style.top = ''; b.style.bottom = ''; return; }
      const x = Math.min(Math.max(4, p.x * innerWidth), innerWidth - b.offsetWidth - 4), y = Math.min(Math.max(4, p.y * innerHeight), innerHeight - b.offsetHeight - 4);
      b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.bottom = 'auto'; };
    place(); addEventListener('resize', place);
    let sx, sy, ox, oy, moved = false, down = false;
    b.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; const r = b.getBoundingClientRect(); ox = r.left; oy = r.top; try { b.setPointerCapture(e.pointerId); } catch (x) { } });
    b.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (!moved && Math.hypot(dx, dy) < 8) return;
      if (!moved) dropZone(true); moved = true; b.classList.add('drag');
      const x = Math.min(Math.max(4, ox + dx), innerWidth - b.offsetWidth - 4), y = Math.min(Math.max(4, oy + dy), innerHeight - b.offsetHeight - 4);
      b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.bottom = 'auto'; dropX.classList.toggle('hot', overDrop(e.clientX, e.clientY)); });
    const up = (e) => { if (!down) return; down = false; b.classList.remove('drag');
      if (moved) { const hide = e && overDrop(e.clientX, e.clientY); dropZone(false); dropX.classList.remove('hot');
        if (hide) { S[posKey] = null; place(); setBubbleHidden(hiddenKey, true); onHide && onHide(true); return; }
        const r = b.getBoundingClientRect(); S[posKey] = { x: r.left / innerWidth, y: r.top / innerHeight }; save(); } };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', () => up(null));
    b.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; return; } onOpen(); });
    b.classList.toggle('hidden', !!S[hiddenKey]);
    return b;
  }
  function setBubbleHidden(key, v) {
    S[key] = !!v; save();
    const map = { dictHidden: '#dict-fab', chatHidden: '#chat-fab' }; const el = $(map[key]); if (el) el.classList.toggle('hidden', !!v);
    window.dispatchEvent(new Event('m1-dict-toggle'));
    toast(v ? `Listo. Lo abres con el botón ${key === 'dictHidden' ? '🔎' : '💬'} de arriba` : 'Botón visible de nuevo 👍');
  }

  /* ---------- UI: feedback sheet, toast, modal, confetti, xp ---------- */
  function sheet({ ok, title, msg, tip, btn = 'Continuar', neutral }) {
    return new Promise(res => {
      let el = $('#sheet'); if (el) el.remove();
      const cls = neutral ? 'neu' : ok ? 'ok' : 'no';
      const ic = mascot('sheet-mra', neutral ? 'point' : ok ? ['wink', 'thumbs', 'celebrate', 'smile'][Math.floor(Math.random() * 4)] : (Math.random() < .5 ? 'think' : 'shrug'));
      el = h(`<div id="sheet" class="sheet ${cls}"><div class="in"><div class="ic">${ic}</div><div class="tx"><h3>${title}</h3>${msg ? `<p>${msg}</p>` : ''}${tip ? `<div class="tipline">💡 ${tip}</div>` : ''}</div><button class="btn ${ok || neutral ? 'k' : 'w'} lg">${btn} →</button></div></div>`);
      document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('show'));
      const go = () => { document.removeEventListener('keydown', kd); el.classList.remove('show'); setTimeout(() => el.remove(), 250); res(); };
      const kd = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
      setTimeout(() => document.addEventListener('keydown', kd), 300);
      $('button', el).onclick = go; $('button', el).focus({ preventScroll: true });
    });
  }
  const GOOD = ['¡Excelente!', '¡Muy bien!', '¡Perfecto!', '¡Genial!', '¡Así se hace!', '¡Bacano!', '¡Lo lograste!', '¡Súper!'];
  const BAD = ['¡Casi!', 'No te preocupes', 'Sigue intentando', '¡Uy, por poquito!'];
  const good = () => GOOD[Math.floor(Math.random() * GOOD.length)];
  const bad = () => BAD[Math.floor(Math.random() * BAD.length)];
  function toast(msg) { let t = $('#toast'); if (!t) { t = h('<div id="toast" class="toast"></div>'); document.body.appendChild(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); }
  function modal(html, opts = {}) {
    const m = h(`<div class="modal"><div class="card">${opts.x ? '<button class="mx" aria-label="Cerrar" title="Cerrar">✕</button>' : ''}${html}</div></div>`); document.body.appendChild(m);
    if (opts.x) m.querySelector('.mx').onclick = () => m.remove();
    m.addEventListener('click', e => { if (e.target === m) m.remove(); }); return m;
  }
  function xpFly(n, x, y) {
    const e = h(`<div class="xpfly">+${n} puntos ⚡</div>`); e.style.left = (x || innerWidth / 2 - 40) + 'px'; e.style.top = (y || innerHeight / 2) + 'px';
    document.body.appendChild(e); setTimeout(() => e.remove(), 1200);
    if (!S.ptsTip) { S.ptsTip = 1; save(); setTimeout(() => toast('⚡ ' + PTS_TIP), 1300); }
  }
  const PTS_TIP = 'Los puntos ⚡ se ganan al completar actividades, tareas y retos.';
  function confetti(ms = 2500, o = {}) {
    const cv = h('<canvas id="confetti"></canvas>'); document.body.appendChild(cv); const ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = o.cols || ['#E3242B', '#0B2A5B', '#ffffff', '#1D5FD1', '#E3242B']; if (o.z) cv.style.zIndex = o.z;
    const P = Array.from({ length: 160 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, r: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4, a: Math.random() * 6, va: -.2 + Math.random() * .4 }));
    const t0 = performance.now();
    (function fr(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); if (!o.flat) ctx.strokeRect(-p.r, -p.r / 2, p.r * 2, p.r); ctx.restore(); });
      if (t - t0 < ms) requestAnimationFrame(fr); else cv.remove();
    })(t0);
  }

  /* ---------- Mr. Arrieta: personaje guía con varias expresiones ---------- */
  const MOODS = { happy: 'welcome', welcome: 'welcome', smile: 'smile', thumbs: 'thumbs', wink: 'wink', wow: 'wow', think: 'think', book: 'idea', point: 'point', present: 'present', pointside: 'pointside', celebrate: 'celebrate', shrug: 'shrug', idea: 'idea', watch: 'watch' };
  function mascot(cls = 'mascot bounce', mood = 'thumbs') {
    const m = MOODS[mood] || 'thumbs';
    return `<img class="${cls} mra mra-${m}" src="mra-${m}.webp" alt="Mr. Arrieta" draggable="false">`;
  }
  function audioSrc(au) { return window.AUD && window.AUD[au] ? 'data:audio/mpeg;base64,' + window.AUD[au] : 'audio/' + au + '.mp3'; }

  // caras reales (fotos) para personajes de juegos — en vez de emojis
  const FACES = { f: ['photo-1646293890121-b16539364dcc', 'photo-1623039497550-c4f2ccc7b875', 'photo-1662850886700-4ec19bd30d11', 'photo-1489424731084-a5d8b219a5bb', 'photo-1590650213165-c1fef80648c4', 'photo-1506863530036-1efeddceb993', 'photo-1663429122432-c2769373768f', 'photo-1713256449316-1a4067517c3b'],
    m: ['photo-1757744705465-ea08b0ddc38a', 'photo-1527082395-e939b847da0d', 'photo-1522529599102-193c0d76b5b6', 'photo-1757620765404-a1ee66df5e27', 'photo-1560250097-0b93528c311a', 'photo-1698510047345-ff32de8a3b74', 'photo-1631407251097-9da3239d73c3', 'photo-1758612897972-dba54225048a'] };
  function face(i, g) { const L = FACES[g === 'm' ? 'm' : g === 'f' ? 'f' : (i % 2 ? 'm' : 'f')]; const id = L[Math.abs(i | 0) % L.length]; return `<img class="rface" src="https://images.unsplash.com/${id}?w=160&h=160&fit=crop&crop=faces&q=80&auto=format" alt="" loading="lazy">`; }
  /* ---------- palabras que no caben en su recuadro (celular): se achica la letra en vez de partir la palabra ---------- */
  (function () {
    const SEL = '.stage button, .stage .opt, .imglbl, .chip, .sb-c, .bb, .ml-b, .wg-c';
    function fitEl(el) {
      if (el.dataset.fit || !el.isConnected || !el.clientWidth) return; el.dataset.fit = '1';
      el.style.overflowWrap = 'normal'; el.style.wordBreak = 'normal'; el.style.hyphens = 'manual';
      let fs = parseFloat(getComputedStyle(el).fontSize) || 16, n = 0;
      while (el.scrollWidth > el.clientWidth + 1 && fs > 11 && n < 14) { fs -= 1; el.style.fontSize = fs + 'px'; n++; }
      if (el.scrollWidth > el.clientWidth + 1) el.style.overflowWrap = 'anywhere';
    }
    let q = false;
    const run = () => { q = false; try { document.querySelectorAll(SEL).forEach(fitEl); } catch (e) { } };
    const sched = () => { if (!q) { q = true; requestAnimationFrame(() => setTimeout(run, 30)); } };
    const start = () => { try { new MutationObserver(sched).observe(document.body, { childList: true, subtree: true }); } catch (e) { } sched(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  })();
  const WV = (f) => async function () { const W = window.MRAWAVE; W && W.on(); try { return await f.apply(this, arguments); } finally { W && W.off(); } };
  const listenW0 = WV(listen), recordScoreW0 = WV(recordScore), recordVoiceW = WV(recordVoice);
  // 🎧 v383: si no se escuchó nada, nunca queda bloqueado: "Intentar otra vez" o "Grábate y escúchate" (se autoevalúa)
  const noHearUI = (target, au) => window.MRVC && MRVC.noHear ? MRVC.noHear({ target, au }) : Promise.resolve('close');
  async function listenW() { const args = arguments; const r = await listenW0.apply(this, args);
    if (r && !r.alts.length && NOHEAR(r.error) && window.MRVC && MRVC.lastCard) { const c = MRVC.lastCard(), t = c && c.querySelector('.vc-say'); const target = t && t.textContent.trim();
      if (target) { const ch = await noHearUI(target, c.dataset.au || ''); if (ch === 'self') { srStat('sf'); return { alts: [target], self: true }; } if (ch === 'retry') return listenW.apply(this, args); } }
    return r; }
  async function recordScoreW(target) { const args = arguments; const r = await recordScoreW0.apply(this, args);
    if (r && !r.alts.length && r.score === 0 && NOHEAR(r.error) && target) { const c = window.MRVC && MRVC.lastCard && MRVC.lastCard(); const ch = await noHearUI(String(target), (c && c.dataset.au) || '');
      if (ch === 'self') { srStat('sf'); return Object.assign({}, r, { score: 80, heard: '', self: true }); } if (ch === 'retry') return recordScoreW.apply(this, args); }
    return r; }
  const srSessionW = function (onText, onFatal) { const W = window.MRAWAVE; let off = !W; const o = () => { if (!off) { off = true; W.off(); } }; if (W) W.on(); const S = srSession(onText, function () { o(); return onFatal && onFatal.apply(this, arguments); }); if (!W) return S; if (!S) { o(); return S; }
    const st = S.stop, ab = S.abort; S.stop = function () { o(); return st.apply(S, arguments); }; S.abort = function () { o(); return ab.apply(S, arguments); }; return S; };
  window.M1 = { face, D, C, MOD, S, $, $$, h, esc, shuffle, sample, sleep, save, touchStreak, addSkill, addWeak, okWeak, skillPct, isUnlocked, finalUnlocked, paceDate, weakParts, reviewMode, revCount, PTS_TIP, hasAccess, progressOpen, lockReason, review, hasProfile, doneCount, totalParts, redeem, codeHash,
    allParts, partById, trackAudio, audioUI, floatStop, recordScore: recordScoreW, letterScorer, voiceResult, floatBubble, setBubbleHidden, prevPart, nextPart, partStars, overallPct, imgURL, photo, play, playSeq, loadAudio, stop, sfx, praise, encourage, ageGroup, fbf, canSR, IOS, MOBILE, listen: listenW, srSession: srSessionW, recordVoice: recordVoiceW,
    norm, words, lev, speechScore, audBusy, freeJudge, grammarFix, sheet, good, bad, toast, modal, xpFly, confetti, mascot, audioSrc };
})();
