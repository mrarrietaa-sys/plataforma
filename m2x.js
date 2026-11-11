/* v519 · MÓDULO 2 · experiencia propia (distinta del Módulo 1)
   - Práctica oral: Adultos = llamada telefónica · Teens = responder en una transmisión en vivo · Kids = walkie-talkie con Mr. Arrieta
   - Juego propio: Tema 1 (la hora) = agenda / speed clock / reloj mágico · Temas 2-11 = termina el correo / fact check / la carrera
   - Lectura en formato podcast · Misión con palabra oculta (+ pista) · Karaoke de la canción con melodía
   Todo sin reconocimiento de voz: motor de melodía (ritmo y entonación vs. el audio modelo). */
(function () {
  const M = () => window.M1, A = () => window.M1A;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = (s) => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const play = (au) => { try { return M().play(au); } catch (e) { return Promise.resolve(); } };
  const stopA = () => { try { M().stop(); } catch (e) { } try { window.MRMEL && MRMEL.stop(); } catch (e) { } };
  const sfx = (k) => { try { M().sfx(k); } catch (e) { } };
  const ag = () => { try { return M().ageGroup(); } catch (e) { return 'adult'; } };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const SV = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = { vol: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>', mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>', end: '<path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3-1.5v-2.5a10 10 0 0 0-7 0V16l-3 1.5z"/>', play: '<path d="M8 5v14l11-7z" fill="currentColor"/>', ck: '<path d="M5 12.5 10 17l9-10"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>' };
  const mod = () => { try { return +(M().MOD && M().MOD.n) || 0; } catch (e) { return 0; } };
  const on = () => mod() === 2 || mod() === 3 || mod() === 4; // v523: el Módulo 4 también // v520: el Módulo 3 también tiene su experiencia propia
  const theme = () => { const a = ag(); document.documentElement.classList.add('m2x'); document.documentElement.classList.toggle('m3x', mod() === 3); document.documentElement.classList.toggle('m4x', mod() === 4); ['adult', 'teens', 'kids'].forEach(x => document.documentElement.classList.toggle('m2x-' + x, x === a)); };
  function frame(stage, lbl, title, ins) { theme(); stage.classList.toggle('dk', ag() === 'teens'); stage.classList.add('as-stage', 'as-' + ag(), 'm2x-st'); return A().head(stage, { lbl, title, ins }); }
  const tes = (k) => { const t = window.MRKQAES && (MRKQAES[k.a] || MRKQAES[k.a.split(' / ')[0]]); return t ? String(t).split(' / ')[0] : ''; };

  /* =================== un turno de voz (común a los 3 formatos) =================== */
  // mode: 'tap' (toca y habla) · 'hold' (mantén presionado, walkie-talkie)
  function voiceTurn(host, k, opt) {
    const tgt = k.a.split(' / ')[0], blank = /_{2,}/.test(tgt);
    return new Promise(done => {
      if (blank) { // lo personal se escribe (igual que en el Módulo 1)
        const parts = tgt.split(/_{2,}/);
        host.innerHTML = `<div class="m2v-card"><small>${opt.lbl}</small><div class="bl9-r"><span>${esc(parts[0] || '')}</span><input class="inp bl9-i" autocomplete="off" placeholder="…"><span>${esc(parts.slice(1).join(' ') || '')}</span></div></div><div class="m2v-row"><button type="button" class="btn k m2v-wok">Enviar</button></div>`;
        const inp = host.querySelector('.bl9-i'); const go = () => { if (!/[a-z0-9]/i.test(inp.value)) { inp.focus(); return; } sfx('ok'); done({ ok: true, text: tgt.replace(/_{2,}/, inp.value.trim()) }); };
        host.querySelector('.m2v-wok').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; return;
      }
      const t2 = tes(k);
      host.innerHTML = `<div class="m2v-card${opt.compact ? ' cp' : ''}"><small>${opt.lbl}</small>${opt.compact ? '' : `<b>${esc(tgt)}</b>`}${t2 ? `<span>${esc(t2)}</span>` : ''}</div><div class="m2v-mel"></div><div class="m2v-res"></div>
        <div class="m2v-row">${opt.mode === 'hold' ? `<button type="button" class="m2v-ptt">${SV(IC.mic)}<span>Mantén presionado para hablar</span></button>` : `<button type="button" class="m2v-mic" aria-label="Hablar">${SV(IC.mic)}</button><div class="m2v-st"><b>Toca y responde</b><small>Imita el ritmo y la melodía del modelo</small></div>`}<button type="button" class="btn w sm m2v-mo">${SV(IC.vol)} Modelo</button></div>`;
      const v = MRMEL.view(host.querySelector('.m2v-mel')); MRMEL.model(k.aau).then(m => v.setModel(m)).catch(() => { });
      const res = host.querySelector('.m2v-res'), st = host.querySelector('.m2v-st'); let fails = 0, busy = false;
      const say = (a, b) => { if (st) st.innerHTML = `<b>${a}</b><small>${b || ''}</small>`; else if (a) res.insertAdjacentHTML('afterbegin', `<p class="mel9-tip">${a}</p>`); };
      host.querySelector('.m2v-mo').onclick = () => { stopA(); play(k.aau); };
      const go = async (btn) => {
        if (busy) return; busy = true; stopA(); btn.classList.add('rec'); res.innerHTML = ''; say('Te escucho…', 'Se detiene sola cuando terminas');
        let r = null; try { r = await MRMEL.take(k.aau, v); } catch (e) { r = { err: 1 }; } btn.classList.remove('rec'); busy = false;
        if (r.err) { if (r.err === 'mic') say('Permite el micrófono', 'Actívalo en el candado de la barra de direcciones.'); else say('Intenta otra vez', 'No se pudo preparar el audio. Toca el micrófono de nuevo.'); return; }
        if (r.silent) { say('No te escuché', 'Acércate al micrófono e intenta otra vez.'); if (!st) res.innerHTML = '<p class="mel9-tip">No te escuché. Acércate al micrófono e intenta otra vez.</p>'; return; }
        res.innerHTML = MRMEL.resultHTML(r);
        if (!r.ok) { fails++; sfx('bad'); say('Otra vez', 'Escucha el modelo y dilo igual'); if (fails >= 3 || r.unv) { res.insertAdjacentHTML('beforeend', '<div class="rp9"><button type="button" class="btn w sm m2v-sk">Seguir →</button></div>'); res.querySelector('.m2v-sk').onclick = () => { stopA(); done({ ok: false }); }; } return; }
        sfx('ok'); try { M().praise(); } catch (e) { } say('¡Muy bien!', 'Puedes repetirla o seguir');
        res.insertAdjacentHTML('beforeend', '<div class="rp9"><button type="button" class="btn w sm rp9-me">▶ Tu voz</button><button type="button" class="btn w sm rp9-ag">↻ Repetir</button><button type="button" class="btn k sm rp9-nx">Siguiente →</button></div>');
        res.querySelector('.rp9-me').onclick = () => { stopA(); MRMEL.play(r.buf); };
        res.querySelector('.rp9-ag').onclick = () => { res.innerHTML = ''; say(opt.mode === 'hold' ? '' : 'Toca y responde', 'Imita el ritmo y la melodía del modelo'); };
        res.querySelector('.rp9-nx').onclick = () => { stopA(); done({ ok: true, take: r, text: tgt }); };
      };
      if (opt.mode === 'hold') {
        const b = host.querySelector('.m2v-ptt'); let down = false;
        b.onpointerdown = (e) => { e.preventDefault(); if (busy) return; down = true; try { b.setPointerCapture(e.pointerId); } catch (er) { } go(b); };
        const up = () => { if (!down) return; down = false; setTimeout(() => { try { MRMEL.stop(); } catch (e) { } }, 250); };
        b.onpointerup = up; b.onpointercancel = up; b.oncontextmenu = e => e.preventDefault();
      } else { const b = host.querySelector('.m2v-mic'); b.onclick = () => { if (b.classList.contains('rec')) { MRMEL.stop(); return; } go(b); }; }
      if (!MRMEL.can()) { res.innerHTML = '<p class="mel9-tip">Este dispositivo no permite usar el micrófono. Escucha el modelo y dilo en voz alta.</p><div class="rp9"><button type="button" class="btn k sm rp9-nx">Siguiente →</button></div>'; res.querySelector('.rp9-nx').onclick = () => done({ ok: false }); }
    });
  }
  const KQ = p => (p.keyq || []).filter(k => k && k.q && k.a && k.qau && k.aau);

  /* ---------- 📞 Adultos · llamada telefónica ---------- */
  async function call(stage, p) {
    const Q = KQ(p); if (!Q.length) return null; let c = 0;
    const body = frame(stage, 'Practice', 'Llamada telefónica', 'Emma te llama. Escucha cada pregunta y responde leyendo tu respuesta.');
    body.insertAdjacentHTML('beforeend', `<div class="m2c"><div class="m2c-top"><span class="m2c-av" style="background-image:url('${M().imgURL('u:photo-1494790108377-be9c29b29330', 200, 200)}')"></span><b>Emma Wilson</b><small class="m2c-t">Llamando…</small></div><div class="m2c-q"></div><div class="m2c-turn"></div><div class="m2c-dots">${Q.map(() => '<i></i>').join('')}</div></div>`);
    const el = body.querySelector('.m2c'), qn = el.querySelector('.m2c-q'), turn = el.querySelector('.m2c-turn'), tl = el.querySelector('.m2c-t'); let t0 = 0;
    sfx('tap'); await sleep(900); if (!stage.isConnected) return null; t0 = Date.now(); el.classList.add('live');
    const tick = setInterval(() => { if (!stage.isConnected) return clearInterval(tick); const s = Math.floor((Date.now() - t0) / 1000); tl.textContent = 'Llamada en curso · ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500);
    for (let i = 0; i < Q.length; i++) {
      if (!stage.isConnected) break; const k = Q[i]; el.querySelectorAll('.m2c-dots i').forEach((d, j) => d.className = j < i ? 'ok' : j === i ? 'cur' : '');
      qn.innerHTML = `<button type="button" class="m2c-ql">${SV(IC.vol)}</button><div><b>${esc(k.q)}</b><small>${esc(k.es || '')}</small></div>`; qn.querySelector('.m2c-ql').onclick = () => { stopA(); play(k.qau); };
      turn.innerHTML = ''; el.classList.add('talk'); await play(k.qau); el.classList.remove('talk'); if (!stage.isConnected) break;
      const r = await voiceTurn(turn, k, { lbl: 'TU RESPUESTA', mode: 'tap' }); if (r.ok) c++;
    }
    clearInterval(tick); if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
    el.classList.remove('live'); el.classList.add('ended'); tl.textContent = 'Llamada finalizada'; qn.innerHTML = ''; el.querySelectorAll('.m2c-dots i').forEach(d => d.className = 'ok');
    turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>respuestas con buena melodía</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx(c === Q.length ? 'win' : 'ok');
    await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
  }

  /* ---------- 🔴 Teens · responder en un live ---------- */
  async function live(stage, p) {
    const Q = KQ(p); if (!Q.length) return null; let c = 0; const NK = ['nico_gg', 'vale.art', 'sam_plays', 'lu.dance'];
    const body = frame(stage, 'Practice', 'Responde en la transmisión', 'Tus seguidores te preguntan en el chat. Responde en voz alta.');
    body.insertAdjacentHTML('beforeend', `<div class="m2l"><div class="m2l-sc" style="background-image:url('${M().imgURL('u:photo-1542751371-adc38448a05e', 900, 520)}')"><span class="m2l-badge"><i></i>LIVE</span><span class="m2l-v">1.2K</span><div class="m2l-cm"></div></div><div class="m2l-turn"></div></div>`);
    const cm = body.querySelector('.m2l-cm'), turn = body.querySelector('.m2l-turn'), vw = body.querySelector('.m2l-v'); let views = 1200;
    const iv = setInterval(() => { if (!stage.isConnected) return clearInterval(iv); views += Math.floor(Math.random() * 9); vw.textContent = (views / 1000).toFixed(1) + 'K'; }, 1200);
    const add = (html, cls) => { const e = H(`<div class="m2l-c ${cls || ''}">${html}</div>`); cm.appendChild(e); while (cm.children.length > 3) cm.firstChild.remove(); return e; };
    for (let i = 0; i < Q.length; i++) {
      if (!stage.isConnected) break; const k = Q[i];
      const e = add(`<b>@${NK[i % NK.length]}</b> ${esc(k.q)}<button type="button" class="m2l-pl">${SV(IC.vol)}</button>`, 'q'); e.querySelector('.m2l-pl').onclick = () => { stopA(); play(k.qau); };
      turn.innerHTML = `<p class="m2l-es">${esc(k.es || '')}</p>`; await play(k.qau); if (!stage.isConnected) break;
      const r = await voiceTurn(turn, k, { lbl: 'RESPONDE EN EL LIVE', mode: 'tap' });
      if (r.ok) { c++; add(`<b>@tú</b> ${esc(r.text)} <span class="m2l-ok">${SV(IC.ck)}</span>`, 'me'); setTimeout(() => stage.isConnected && add(`<b>@${NK[(i + 1) % NK.length]}</b> ${['nice!', 'so cool', 'great answer', 'love it'][i % 4]}`, 'h'), 500); }
      await sleep(500);
    }
    clearInterval(iv); if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
    turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>comentarios respondidos</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx(c === Q.length ? 'win' : 'ok');
    await A().waitNext(stage, 'Terminar la transmisión'); return A().result(c, Q.length, 'speaking');
  }

  /* ---------- 📻 Kids · walkie-talkie con Mr. Arrieta ---------- */
  async function walkie(stage, p) {
    const Q = KQ(p); if (!Q.length) return null; let c = 0; const POSE = ['point', 'wink', 'present', 'idea'];
    const body = frame(stage, 'Practice', 'Walkie-talkie con Mr. Arrieta', 'Mr. Arrieta te habla por el walkie-talkie. Mantén presionado el botón y responde.');
    body.insertAdjacentHTML('beforeend', `<div class="m2w"><div class="m2w-top"><img class="m2w-mr" src="mra-point.webp" alt="Mr. Arrieta"><div class="m2w-b"></div></div><div class="m2w-radio"><span class="m2w-ch">CANAL 2</span><span class="m2w-led"></span><div class="m2w-turn"></div></div><div class="m2w-st">${Q.map(() => '<i></i>').join('')}</div></div>`);
    const b = body.querySelector('.m2w-b'), turn = body.querySelector('.m2w-turn'), mr = body.querySelector('.m2w-mr'), led = body.querySelector('.m2w-led');
    for (let i = 0; i < Q.length; i++) {
      if (!stage.isConnected) break; const k = Q[i]; mr.src = 'mra-' + POSE[i % POSE.length] + '.webp';
      b.innerHTML = `<b>${esc(k.q)}</b><small>${esc(k.es || '')}</small><button type="button" class="m2w-pl">${SV(IC.vol)}</button>`; b.querySelector('.m2w-pl').onclick = () => { stopA(); play(k.qau); };
      turn.innerHTML = ''; led.classList.add('rx'); sfx('tap'); await play(k.qau); led.classList.remove('rx'); if (!stage.isConnected) break;
      const r = await voiceTurn(turn, k, { lbl: 'RESPONDE POR EL WALKIE-TALKIE', mode: 'hold' });
      if (r.ok) { c++; mr.src = 'mra-thumbs.webp'; } body.querySelectorAll('.m2w-st i')[i].className = r.ok ? 'on' : 'off'; await sleep(400);
    }
    if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
    mr.src = MRMOOD(c, Q.length).img; b.innerHTML = `<b>Over and out!</b><small>Fin de la transmisión</small>`; turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>mensajes enviados</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
  }
  function oral(stage, p) { const a = ag(); if (mod() === 4) return a === 'teens' ? M4.podcast(stage, p) : a === 'kids' ? M4.control(stage, p) : M4.board(stage, p); if (mod() === 3) return a === 'teens' ? M3.prompter(stage, p) : a === 'kids' ? M3.news(stage, p) : M3.interview(stage, p); return a === 'teens' ? live(stage, p) : a === 'kids' ? walkie(stage, p) : call(stage, p); }

  /* =================== JUEGOS DEL TEMA «LA HORA» =================== */
  const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, 'twenty-five': 25 };
  function parseTime(s) { s = String(s).toLowerCase().replace(/[.!?,]/g, ' ').replace(/\s+/g, ' ').trim();
    if (/\bnoon\b/.test(s)) return { h: 12, m: 0 }; if (/\bmidnight\b/.test(s)) return { h: 12, m: 0, mid: 1 };
    let x = s.match(/\b(\w+) o'clock/); if (x && NUM[x[1]]) return { h: NUM[x[1]], m: 0 };
    x = s.match(/\bhalf past (\w+)/); if (x && NUM[x[1]]) return { h: NUM[x[1]], m: 30 };
    x = s.match(/\bquarter past (\w+)/); if (x && NUM[x[1]]) return { h: NUM[x[1]], m: 15 };
    x = s.match(/\bquarter to (\w+)/); if (x && NUM[x[1]]) return { h: (NUM[x[1]] + 10) % 12 + 1, m: 45 };
    x = s.match(/\b(five|ten|twenty|twenty-five) past (\w+)/); if (x && NUM[x[2]]) return { h: NUM[x[2]], m: NUM[x[1]] };
    x = s.match(/\b(five|ten|twenty|twenty-five) to (\w+)/); if (x && NUM[x[2]]) return { h: (NUM[x[2]] + 10) % 12 + 1, m: 60 - NUM[x[1]] };
    return null; }
  const dig = (t) => (t.h < 10 ? '0' : '') + t.h + ':' + String(t.m).padStart(2, '0');
  function timePool(p) { const L = [], seen = {}; const add = (en, au) => { if (!en || !au) return; const t = parseTime(en); if (!t || t.mid || !/^it's /i.test(en)) return; const key = dig(t); if (seen[key]) return; seen[key] = 1; L.push({ en: en.replace(/\.$/, '.'), au, t }); };
    const T = (M().D || window.M1DATA).topics.find(x => x.n === p.topic); (T ? T.parts : [p]).forEach(pp => { (pp.vocab || []).concat(pp.sentences || []).forEach(x => add(x.en, x.au)); (pp.keyq || []).forEach(k => add(k.a, k.aau)); }); return L; }
  function clockSVG(t, cls) { const hA = ((t.h % 12) + t.m / 60) * 30, mA = t.m * 6;
    const ticks = Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 80 : 85; return `<line x1="${100 + Math.sin(a) * r1}" y1="${100 - Math.cos(a) * r1}" x2="${100 + Math.sin(a) * 90}" y2="${100 - Math.cos(a) * 90}" class="${big ? 'b' : 's'}"/>`; }).join('');
    const nums = Array.from({ length: 12 }, (_, i) => { const n = i + 1, a = n * 30 * Math.PI / 180; return `<text x="${100 + Math.sin(a) * 66}" y="${100 - Math.cos(a) * 66 + 6}">${n}</text>`; }).join('');
    return `<svg class="m2k ${cls || ''}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" class="rim"/><circle cx="100" cy="100" r="90" class="face"/>${ticks}${nums}<line class="hh" x1="100" y1="100" x2="100" y2="52" transform="rotate(${hA} 100 100)"/><line class="mh" x1="100" y1="100" x2="100" y2="24" transform="rotate(${mA} 100 100)"/><circle cx="100" cy="100" r="6" class="ct"/></svg>`; }

  /* ---------- 🗓️ Adultos · la agenda del día ---------- */
  async function agenda(stage, p) {
    const pool = timePool(p).filter(x => x.t.h >= 5 && x.t.h <= 12 && !(x.t.h === 12 && x.t.m)); if (pool.length < 4) return null;
    const ACT = ['gets up', 'has breakfast', 'takes the bus', 'starts work', 'has a coffee', 'has lunch'];
    const R = shuffle(pool).slice(0, Math.min(5, pool.length)).sort((a, b) => (a.t.h * 60 + a.t.m) - (b.t.h * 60 + b.t.m)).map((x, i) => Object.assign({}, x, { act: ACT[i] }));
    const body = frame(stage, 'Practice', 'La agenda de Daniel', 'Ordena la mañana de Daniel: toca las horas de la más temprana a la más tarde. Al final verás qué hace a cada hora.');
    const cards = shuffle(R); const slots = R.map(() => null);
    body.insertAdjacentHTML('beforeend', `<div class="m2a"><div class="m2a-tl">${R.map((_, i) => `<button type="button" class="m2a-s" data-i="${i}"><span class="m2a-n">${i + 1}</span><span class="m2a-x">Toca una tarjeta</span></button>`).join('')}</div><div class="m2a-cards">${cards.map((x, i) => `<button type="button" class="m2a-c" data-i="${i}"><b>${esc(x.en.replace(/^It's /, '').replace(/\.$/, ''))}</b><small>${SV(IC.vol)} escuchar</small></button>`).join('')}</div><div class="m2a-fb"></div></div>`);
    const el = body.querySelector('.m2a'), fb = el.querySelector('.m2a-fb');
    const draw = () => { el.querySelectorAll('.m2a-s').forEach((s, i) => { const x = slots[i] == null ? null : cards[slots[i]]; s.classList.toggle('on', !!x); s.querySelector('.m2a-x').innerHTML = x ? `<b>${esc(x.en.replace(/^It's /, '').replace(/\.$/, ''))}</b>` : 'Toca una tarjeta'; });
      el.querySelectorAll('.m2a-c').forEach((b, i) => b.classList.toggle('used', slots.includes(i))); };
    const c = await new Promise(done => {
      el.querySelectorAll('.m2a-c').forEach((b, i) => b.onclick = () => { if (slots.includes(i)) return; const k = slots.indexOf(null); if (k < 0) return; slots[k] = i; sfx('tap'); play(cards[i].au); draw();
        if (!slots.includes(null)) { fb.innerHTML = '<button type="button" class="btn k lg m2a-ok">Comprobar</button>'; fb.querySelector('.m2a-ok').onclick = check; } });
      el.querySelectorAll('.m2a-s').forEach((s, i) => s.onclick = () => { if (s.classList.contains('m2a-lk') || slots[i] == null) return; slots[i] = null; fb.innerHTML = ''; draw(); });
      const check = () => { let n = 0; el.querySelectorAll('.m2a-s').forEach((s, i) => { const ok = cards[slots[i]] === R[i]; if (ok) n++; s.classList.add('m2a-lk', ok ? 'm2a-good' : 'm2a-bad'); s.querySelector('.m2a-x').innerHTML = `<span class="m2a-d">${dig(R[i].t)}</span><b>${esc(R[i].en.replace(/^It's /, '').replace(/\.$/, ''))}</b> · ${esc(R[i].act)}`; });
        sfx(n === R.length ? 'win' : 'bad'); fb.innerHTML = `<div class="as-fbk ${n === R.length ? 'ok' : 'no'}"><span>${n === R.length ? '¡Agenda perfecta!' : `${n} de ${R.length} en su lugar. Así es el orden correcto.`}</span></div>`; done(n); };
    });
    await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'listening');
  }

  /* ---------- ⏱️ Teens · speed clock ---------- */
  async function speedClock(stage, p) {
    const pool = timePool(p); if (pool.length < 4) return null; const R = shuffle(pool).slice(0, Math.min(6, pool.length)), SEC = 7; let c = 0, combo = 0, best = 0; const missed = [];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const opts = shuffle([it].concat(shuffle(pool.filter(x => x !== it)).slice(0, 3)));
      const body = frame(stage, 'Practice', 'Speed clock', '¿Qué hora es? Elige antes de que se acabe el tiempo.');
      body.insertAdjacentHTML('beforeend', `<div class="m2s"><div class="m2s-h"><span>${i + 1} / ${R.length}</span><span>COMBO <b>x${combo}</b></span></div><div class="m2s-tm"><i></i></div><div class="m2s-d">${dig(it.t)}</div><div class="m2s-o">${opts.map((o, k) => `<button type="button" class="m2s-b" data-k="${k}">${esc(o.en)}</button>`).join('')}</div><div class="m2s-fb"></div></div>`);
      const tm = body.querySelector('.m2s-tm i'), t0 = Date.now();
      const ok = await new Promise(done => { let over = false; const end = (k) => { if (over) return; over = true; clearInterval(iv); body.querySelectorAll('.m2s-b').forEach((b, j) => { b.disabled = true; if (opts[j] === it) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); }); const good = k != null && opts[k] === it; sfx(good ? 'ok' : 'bad'); if (good && combo + 1 >= 2) body.querySelector('.m2s-fb').innerHTML = `<b class="m2s-cb">Combo x${combo + 1}</b>`; play(it.au); setTimeout(() => done(good), 1300); };
        const iv = setInterval(() => { const f = 1 - (Date.now() - t0) / (SEC * 1000); tm.style.width = Math.max(0, f * 100) + '%'; tm.classList.toggle('lo', f < .3); if (f <= 0) end(null); }, 60);
        body.querySelectorAll('.m2s-b').forEach(b => b.onclick = () => end(+b.dataset.k)); });
      if (ok) { c++; combo++; best = Math.max(best, combo); } else { combo = 0; missed.push(it); }
    }
    const body = frame(stage, 'Practice', 'Speed clock', ''); body.insertAdjacentHTML('beforeend', `<div class="as-kpi"><div><b>${c}/${R.length}</b><small>correctas</small></div><div><b>x${best}</b><small>mejor combo</small></div><div><b>${Math.round(c / R.length * 100)}%</b><small>acierto</small></div></div>`); sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'listening', missed);
  }

  /* ---------- 🕰️ Kids · el reloj mágico ---------- */
  async function magicClock(stage, p) {
    const pool = timePool(p).filter(x => x.t.m % 15 === 0); if (pool.length < 3) return null; const R = shuffle(pool).slice(0, Math.min(4, pool.length)); let c = 0; const missed = [];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i]; const cur = { h: 12, m: 0 }; let hand = 'h', tries = 0;
      const body = frame(stage, 'Practice', 'El reloj mágico', 'Escucha la hora y mueve las agujas: toca el número donde va cada aguja.');
      body.insertAdjacentHTML('beforeend', `<div class="m2m"><div class="m2m-h"><span>${i + 1} DE ${R.length}</span><button type="button" class="m2m-pl">${SV(IC.vol)} Escuchar</button></div><div class="m2m-t">Pon el reloj en: <b>${esc(it.en.replace(/^It's /, '').replace(/\.$/, ''))}</b></div><div class="m2m-tabs"><button type="button" class="m2m-tb on" data-h="h"><i class="sh"></i>Aguja corta · hora</button><button type="button" class="m2m-tb" data-h="m"><i class="lg"></i>Aguja larga · minutos</button></div><div class="m2m-k"></div><div class="m2m-fb"></div><div class="m2m-act"><button type="button" class="btn k lg m2m-ok">Comprobar</button></div></div>`);
      const kh = body.querySelector('.m2m-k'), fb = body.querySelector('.m2m-fb');
      const draw = () => { kh.innerHTML = clockSVG(cur, 'sel-' + hand); kh.querySelector('svg').onpointerdown = (e) => { const r = e.currentTarget.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; let a = Math.atan2(x, -y) * 180 / Math.PI; if (a < 0) a += 360; const pos = Math.round(a / 30) % 12;
        if (hand === 'h') cur.h = pos || 12; else cur.m = pos * 5; sfx('tap'); fb.innerHTML = ''; draw(); }; };
      body.querySelectorAll('.m2m-tb').forEach(b => b.onclick = () => { hand = b.dataset.h; body.querySelectorAll('.m2m-tb').forEach(x => x.classList.toggle('on', x === b)); draw(); });
      body.querySelector('.m2m-pl').onclick = () => { stopA(); play(it.au); }; draw(); await sleep(250); play(it.au);
      const ok = await new Promise(done => { body.querySelector('.m2m-ok').onclick = async () => { const good = cur.h % 12 === it.t.h % 12 && cur.m === it.t.m; tries++;
        if (good) { sfx('ok'); kh.querySelector('svg').classList.add('win'); fb.innerHTML = `<div class="as-fbk ok"><span>¡Correcto! <b>${esc(it.en)}</b></span></div>`; play(it.au); body.querySelector('.m2m-act').innerHTML = ''; await sleep(1700); return done(tries === 1); }
        sfx('bad'); const hOk = cur.h % 12 === it.t.h % 12, mOk = cur.m === it.t.m;
        fb.innerHTML = `<div class="as-fbk no"><span>${!mOk ? 'Revisa la <b>aguja larga</b> (minutos).' : ''} ${!hOk ? 'Revisa la <b>aguja corta</b> (hora).' : ''}</span></div>`;
        if (tries >= 3) { Object.assign(cur, it.t); draw(); fb.innerHTML = `<div class="as-fbk no"><span>Así se pone: <b>${esc(it.en)}</b></span></div>`; body.querySelector('.m2m-act').innerHTML = '<button type="button" class="btn k lg m2m-nx">Siguiente</button>'; body.querySelector('.m2m-nx').onclick = () => done(false); } }; });
      if (ok) c++; else missed.push(it);
    }
    await A().waitNext(stage, `¡${c} de ${R.length}! Continuar`); return A().result(c, R.length, 'listening', missed);
  }
  /* =================== JUEGOS DE LOS TEMAS 2 A 11 (gramática A2) =================== */
  const clue = s => { const m = String(s || '').match(/\(([^)]*)\)/); return m ? m[1].trim() : ''; };
  const noPar = s => String(s || '').replace(/\s*\([^)]*\)/g, '').replace(/\s{2,}/g, ' ').replace(/\s+([.?!,])/g, '$1').trim();
  function fillPool(p) { // Kids y Teens ya usan las primeras frases en la explicación: aquí se priorizan las demás del tema
    const T = (window.M1DATA || {}).topics ? M1DATA.topics.find(x => x.n === p.topic) : null; const cur = (p.fill || []), oth = T ? T.parts.filter(x => x.id !== p.id).flatMap(x => x.fill || []) : [];
    const L = ag() === 'adult' ? cur.concat(oth) : cur.slice(3).concat(oth, cur.slice(0, 3)); const seen = {};
    return L.filter(f => f && /_{2,}/.test(f.s) && f.a && (f.o || []).length && f.au && !seen[f.s] && (seen[f.s] = 1)); }
  const sent = (f, w) => noPar(f.s.replace(/_{2,}/, w));
  const fullOf = f => noPar(f.full || f.s.replace(/_{2,}/, f.a));
  const hintBox = f => `${clue(f.s) ? `<span class="m2g-cl">${esc(clue(f.s))}</span>` : ''}`;

  /* ---------- ✉️ Adultos · termina el correo (completa los espacios y envíalo) ---------- */
  async function email(stage, p) {
    const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, 4); const tt = noPar((p._t && p._t.title) || ''); const pick = R.map(() => null); let cur = -1;
    const body = frame(stage, 'Practice', 'Termina el correo', 'Emma te pidió revisar este correo antes de enviarlo. Toca cada espacio y elige la palabra correcta.');
    window.__m2t = { ans: R.map(f => f.a) };
    body.insertAdjacentHTML('beforeend', `<div class="m2e"><div class="m2e-mail"><div class="m2e-hd"><div><small>Para</small><b>team@bayoffice.com</b></div><div><small>Asunto</small><b>${esc(tt)}</b></div></div><div class="m2e-bd"><p>Hi team,</p>${R.map((f, i) => { const pr = noPar(f.s).split(/_{2,}/); return `<p class="m2e-l" data-i="${i}">${esc(pr[0] || '')}<button type="button" class="m2e-g" data-i="${i}">&nbsp;</button>${esc(pr.slice(1).join(' ') || '')}${clue(f.s) ? ` <span class="m2g-cl">${esc(clue(f.s))}</span>` : ''}</p>`; }).join('')}<p>Best,<br>Emma</p></div></div><div class="m2e-ch"><p class="m2r-ins">Toca un espacio del correo</p></div><div class="m2e-act"></div></div>`);
    const ch = body.querySelector('.m2e-ch'), act = body.querySelector('.m2e-act');
    const sel = (i) => { cur = i; body.querySelectorAll('.m2e-g').forEach((g, j) => g.classList.toggle('on', j === i)); const f = R[i]; const ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j);
      ch.innerHTML = `<p class="m2r-ins">Espacio ${i + 1} de ${R.length}${f.h ? ` · <span class="m2e-h">${esc(f.h)}</span>` : ''}</p><div class="m2r-ops">${ops.map(o => `<button type="button" class="m2r-o${pick[i] === o ? ' on' : ''}" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      ch.querySelectorAll('.m2r-o').forEach(b => b.onclick = () => { pick[i] = b.dataset.o; sfx('tap'); const g = body.querySelector(`.m2e-g[data-i="${i}"]`); g.textContent = pick[i]; g.classList.add('done');
        const nx = pick.findIndex(x => x == null); if (nx >= 0) sel(nx); else { cur = -1; body.querySelectorAll('.m2e-g').forEach(x => x.classList.remove('on')); ch.innerHTML = '<p class="m2r-ins">¿Todo listo? Puedes tocar un espacio para cambiarlo.</p>'; act.innerHTML = '<button type="button" class="btn k lg m2e-send">Enviar correo</button>'; act.querySelector('.m2e-send').onclick = send; } }); };
    let send; const c = await new Promise(done => { send = () => { let n = 0; act.innerHTML = ''; body.querySelectorAll('.m2e-g').forEach((g, i) => { g.disabled = true; const ok = pick[i] === R[i].a; if (ok) n++; g.classList.add(ok ? 'good' : 'bad'); if (!ok) g.innerHTML = `<s>${esc(pick[i])}</s> ${esc(R[i].a)}`; });
        body.querySelectorAll('.m2e-l').forEach((l, i) => { l.classList.add('pl'); l.onclick = () => { stopA(); play(R[i].au); }; });
        sfx(n === R.length ? 'win' : n >= R.length / 2 ? 'ok' : 'bad'); ch.innerHTML = `<div class="as-fbk ${n === R.length ? 'ok' : 'no'}"><span>${n === R.length ? 'Correo enviado sin errores.' : `${n} de ${R.length} correctas. Revisa las correcciones en el correo.`} Toca cada frase para escucharla.</span></div>`; done(n); };
      body.querySelectorAll('.m2e-g').forEach(g => g.onclick = () => sel(+g.dataset.i)); sel(0); });
    await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'writing', R.filter((f, i) => pick[i] !== f.a).map(f => ({ en: fullOf(f), au: f.au })));
  }

  /* ---------- ✅ Teens · fact check (¿la frase está bien o tiene un error?) ---------- */
  async function factCheck(stage, p) {
    const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, Math.min(6, pool.length)).map((f, i) => ({ f, good: i % 2 === (Math.random() < .5 ? 0 : 1), wrong: f.o[Math.floor(Math.random() * f.o.length)] })); const SEC = 9; let c = 0, combo = 0, best = 0; const missed = [];
    const NK = ['nico_gg', 'vale.art', 'sam_plays', 'lu.dance', 'mateo.fit', 'sofi_cam'];
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const it = R[i], f = it.f, shown = it.good ? fullOf(f) : sent(f, it.wrong);
      const body = frame(stage, 'Practice', 'Fact check', '¿El post está bien escrito? Decide antes de que se acabe el tiempo.');
      body.insertAdjacentHTML('beforeend', `<div class="m2f"><div class="m2s-h"><span>${i + 1} / ${R.length}</span><span>COMBO <b>x${combo}</b></span></div><div class="m2s-tm"><i></i></div><div class="m2f-post"><div class="m2f-u"><span class="m2f-av">${NK[i % NK.length][0].toUpperCase()}</span><b>@${NK[i % NK.length]}</b><small>ahora</small></div><p>${esc(shown)}</p>${hintBox(f)}</div><div class="m2f-b"><button type="button" class="m2f-y" data-v="1">${SV(IC.ck)} Está bien</button><button type="button" class="m2f-n" data-v="0">${SV('<path d="M6 6l12 12M18 6 6 18"/>')} Tiene un error</button></div><div class="m2f-fb"></div></div>`);
      window.__m2t = { good: it.good }; const tm = body.querySelector('.m2s-tm i'), t0 = Date.now(), fb = body.querySelector('.m2f-fb');
      const ok = await new Promise(done => { let over = false; const end = (v) => { if (over) return; over = true; clearInterval(iv); body.querySelectorAll('.m2f-b button').forEach(b => b.disabled = true); const good = v != null && (v === 1) === it.good; sfx(good ? 'ok' : 'bad');
          if (v != null) body.querySelector(v ? '.m2f-y' : '.m2f-n').classList.add(good ? 'ok' : 'bad');
          fb.innerHTML = `<div class="as-fbk ${good ? 'ok' : 'no'}"><span>${v == null ? 'Se acabó el tiempo. ' : good ? (combo + 1 >= 2 ? `Combo x${combo + 1}. ` : 'Correcto. ') : 'No. '}${it.good ? 'La frase estaba bien.' : `Lo correcto es <b>${esc(f.a)}</b>, no “${esc(it.wrong)}”.`}<br><b>${esc(fullOf(f))}</b></span></div><button type="button" class="as-gt m2f-nx">${i < R.length - 1 ? 'Siguiente post' : 'Ver resultado'}</button>`;
          play(f.au); fb.querySelector('.m2f-nx').onclick = () => { stopA(); done(good); }; };
        const iv = setInterval(() => { if (!stage.isConnected) return clearInterval(iv); const fr = 1 - (Date.now() - t0) / (SEC * 1000); tm.style.width = Math.max(0, fr * 100) + '%'; tm.classList.toggle('lo', fr < .3); if (fr <= 0) end(null); }, 60);
        body.querySelectorAll('.m2f-b button').forEach(b => b.onclick = () => end(+b.dataset.v)); });
      if (ok) { c++; combo++; best = Math.max(best, combo); } else { combo = 0; missed.push({ en: fullOf(f), au: f.au }); }
    }
    const body = frame(stage, 'Practice', 'Fact check', ''); body.insertAdjacentHTML('beforeend', `<div class="as-kpi"><div><b>${c}/${R.length}</b><small>correctas</small></div><div><b>x${best}</b><small>mejor combo</small></div><div><b>${Math.round(c / R.length * 100)}%</b><small>acierto</small></div></div>`); sfx('win');
    await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'reading', missed);
  }

  /* ---------- 🏁 Kids · la carrera (cada palabra correcta mueve tu carro) ---------- */
  const CAR = (col) => `<svg class="m2q-car" viewBox="0 0 64 32" aria-hidden="true"><path d="M6 22v-6l8-8h22l10 8h10a4 4 0 0 1 4 4v2z" fill="${col}"/><path d="M17 10h8v7H12zM28 10h7l7 7H28z" fill="#dff3ff"/><circle cx="17" cy="24" r="6" fill="#1f2a33"/><circle cx="17" cy="24" r="2.5" fill="#cfd8dc"/><circle cx="47" cy="24" r="6" fill="#1f2a33"/><circle cx="47" cy="24" r="2.5" fill="#cfd8dc"/></svg>`;
  async function race(stage, p) {
    const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, Math.min(5, pool.length)); let me = 0, rv = 0; const missed = [];
    const body = frame(stage, 'Practice', 'La carrera', 'Elige la palabra que falta. Si aciertas, tu carro avanza. Si fallas, avanza el de Mr. Arrieta.');
    body.insertAdjacentHTML('beforeend', `<div class="m2q"><div class="m2q-tr"><div class="m2q-ln"><span class="m2q-tag">Tú</span><span class="m2q-p me">${CAR('#F59E0B')}</span><i class="m2q-fl"></i></div><div class="m2q-ln"><span class="m2q-tag">Mr. A</span><span class="m2q-p rv">${CAR('#0F8A6A')}</span><i class="m2q-fl"></i></div></div><div class="m2q-play"></div></div>`);
    const pl = body.querySelector('.m2q-play'), pm = body.querySelector('.m2q-p.me'), pr = body.querySelector('.m2q-p.rv');
    const move = () => { pm.style.left = `calc(${me / R.length * 100}% - ${me / R.length * 64}px)`; pr.style.left = `calc(${rv / R.length * 100}% - ${rv / R.length * 64}px)`; };
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const f = R[i]; const parts = noPar(f.s).split(/_{2,}/); const ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j);
      pl.innerHTML = `<div class="m2q-cnt">VUELTA ${i + 1} DE ${R.length}</div><div class="m2q-s">${esc(parts[0] || '')}<span class="m2q-gap">?</span>${esc(parts.slice(1).join(' ') || '')}</div>${hintBox(f)}${f.h ? `<button type="button" class="m2q-hb">${SV(IC.bulb)} Pista</button>` : ''}<div class="m2q-ops">${ops.map(o => `<button type="button" class="m2q-o" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="m2q-fb"></div>`;
      window.__m2t = { a: f.a }; const hb = pl.querySelector('.m2q-hb'); if (hb) hb.onclick = () => { hb.outerHTML = `<span class="m2q-h">${esc(f.h)}</span>`; sfx('tap'); };
      const ok = await new Promise(done => pl.querySelectorAll('.m2q-o').forEach(b => b.onclick = async () => { const good = b.dataset.o === f.a; pl.querySelectorAll('.m2q-o').forEach(x => { x.disabled = true; if (x.dataset.o === f.a) x.classList.add('ok'); }); if (!good) b.classList.add('bad');
        const g = pl.querySelector('.m2q-gap'); g.textContent = f.a; g.classList.add(good ? 'ok' : 'bad'); if (good) me++; else rv++; move(); sfx(good ? 'ok' : 'bad');
        pl.querySelector('.m2q-fb').innerHTML = `<div class="as-fbk ${good ? 'ok' : 'no'}"><span>${good ? '¡Bien! Tu carro avanza.' : 'Era <b>' + esc(f.a) + '</b>.'}</span></div>`; await play(f.au); await sleep(500); done(good); }));
      if (!ok) missed.push({ en: fullOf(f), au: f.au });
    }
    if (!stage.isConnected) return A().result(me, R.length, 'reading', missed);
    const win = me >= rv; pl.innerHTML = `<div class="m2q-end"><img src="${win ? 'mra-celebrate.webp' : 'mra-thumbs.webp'}" alt="Mr. Arrieta"><b>${win ? '¡Ganaste la carrera!' : '¡Casi! La próxima la ganas.'}</b><span>${me} de ${R.length} palabras correctas</span></div>`; sfx(win ? 'win' : 'ok'); if (win) { try { M().confetti(1200); } catch (e) { } }
    await A().waitNext(stage, 'Continuar'); return A().result(me, R.length, 'reading', missed);
  }

  function game(stage, p) { const a = ag(); if (mod() === 4) return a === 'teens' ? M4.duel(stage, p) : a === 'kids' ? M4.rocket(stage, p) : M4.blocks(stage, p); if (mod() === 3) return a === 'teens' ? M3.path(stage, p) : a === 'kids' ? M3.map(stage, p) : M3.bet(stage, p); const clock = p.topic === 1 && timePool(p).length >= 4;
    if (clock) return a === 'teens' ? speedClock(stage, p) : a === 'kids' ? magicClock(stage, p) : agenda(stage, p);
    return a === 'teens' ? factCheck(stage, p) : a === 'kids' ? race(stage, p) : email(stage, p); }
  const gameFor = (p) => on() && p && ((mod() === 2 && p.topic === 1 && timePool(p).length >= 4) || fillPool(p).length >= 3) ? 'm2game' : null;

  /* =================== 🎙️ LECTURA EN FORMATO PODCAST =================== */
  function podBox(r, sents, photo) { if (mod() === 3) return M3.magBox(r, sents, photo); const a = ag(); const kind = a === 'kids' ? 'Cuento en audio' : 'Podcast';
    return `<div class="reading pod9"><div class="pod9-pl"><div class="pod9-cv">${photo(r.img)}</div><div class="pod9-in"><small>${kind} · Episodio ${(M().partById && 0) || ''}</small><b>${esc(r.title)}</b><div class="pod9-bar"><i></i></div><div class="pod9-tm"><span class="pod9-c">0:00</span><span class="pod9-d"></span></div></div><button class="pod9-go" id="rp" aria-label="Escuchar">▶ Escuchar</button></div>
      <div class="pod9-lb">TRANSCRIPCIÓN</div><div class="txt">${sents.map(s => `<span class="s">${s.split(/(\s+)/).map(w => /\S/.test(w) ? `<i class="rw">${esc(w)}</i>` : w).join('')}</span>`).join(' ')}</div><button class="rd-tr" id="rdtr" type="button" aria-expanded="false"><span>ES</span> Ver traducción al español</button><div class="rd-es" id="rdes" hidden></div></div>`; }
  function podWatch(box) { theme(); if (mod() === 3) M3.magBind(box); const bar = box.querySelector('.pod9-bar i'), cu = box.querySelector('.pod9-c'), du = box.querySelector('.pod9-d'), f = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    const sm = box.querySelector('small'); if (sm && mod() !== 3) sm.textContent = (ag() === 'kids' ? 'Cuento en audio' : 'Podcast') + ' · Episodio ' + (window.__m2ep || 1);
    const loop = () => { if (!box.isConnected) return; const a = window.__ra; if (a && a.duration) { bar.style.width = (a.currentTime / a.duration * 100) + '%'; cu.textContent = f(a.currentTime); du.textContent = f(a.duration); } requestAnimationFrame(loop); }; loop(); }

  /* =================== 🎯 MISIÓN · palabra oculta =================== */
  const STOP = /^(the|and|but|you|your|are|was|were|have|has|this|that|with|from|for|not|yes|its|it's|i'm|what|when|where|very|much|please|thank|thanks|sure|okay)$/i;
  const focusOf = (p) => { const F = {}; try { const T = M1DATA.topics.find(x => x.n === p.topic); (T ? T.parts : [p]).forEach(pp => { (pp.fill || []).forEach(f => String(f.a).toLowerCase().split(/\s+/).forEach(w => F[w.replace(/[^a-z']/g, '')] = 1)); (pp.vocab || []).forEach(v => { const e = String(v.en || '').toLowerCase(); if (!/\s/.test(e)) F[e.replace(/[^a-z']/g, '')] = 1; }); }); } catch (e) { } return F; };
  function hide(a, p) { if (mod() === 4) return M4.eco(a); if (mod() === 3) return M3.initials(a); const w = a.split(/(\s+)/); const F = p ? focusOf(p) : {}; let best = -1, bl = 0, bf = -1, bfl = 0; w.forEach((x, i) => { if (!/\S/.test(x) || i === 0) return; const c = x.replace(/[^A-Za-z']/g, ''); if (c.length >= 2 && F[c.toLowerCase()] && c.length > bfl) { bfl = c.length; bf = i; } if (c.length >= 3 && !STOP.test(c) && c.length > bl) { bl = c.length; best = i; } }); if (bf >= 0) best = bf;
    if (best < 0) return `<b>${esc(a)}</b>`; const raw = w[best], core = raw.replace(/[^A-Za-z']/g, ''), pre = raw.slice(0, raw.indexOf(core)), post = raw.slice(raw.indexOf(core) + core.length);
    return `<b class="m2h">${w.map((x, i) => i === best ? `${esc(pre)}<span class="m2h-w" data-w="${esc(core)}">${'_'.repeat(Math.max(4, core.length))}</span>${esc(post)}` : esc(x)).join('')}</b><button type="button" class="m2h-hint">${SV(IC.bulb)} Ver pista</button>`; }
  function bindHint(host, au) { if (mod() === 4) return M4.bindEco(host, au); if (mod() === 3) return M3.bindIni(host); const b = host.querySelector('.m2h-hint'); if (!b) return; let n = 0; b.onclick = () => { const w = host.querySelector('.m2h-w'); if (!w) return; const word = w.dataset.w; n++; if (n === 1) { w.textContent = word[0] + '_'.repeat(Math.max(3, word.length - 1)); b.innerHTML = SV(IC.bulb) + ' Ver la palabra'; } else { w.textContent = word; w.classList.add('shown'); b.remove(); } sfx('tap'); }; }

  /* =================== 🎤 KARAOKE de la canción =================== */
  async function karaoke(stage, p) { if (mod() === 4) return M4.order(stage, p); if (mod() === 3) return M3.dictation(stage, p);
    const S = window.M1SONGS; const sid = S && S.map && S.map[p.id]; const so = sid && S.songs[sid]; const L = so && (so.lc || []).filter(x => x.full && x.au && x.full.split(' ').length <= 9); if (!L || !L.length) return null;
    const R = L.slice(0, 2); let c = 0;
    for (let i = 0; i < R.length; i++) {
      if (!stage.isConnected) break; const x = R[i];
      const body = frame(stage, 'Music', 'Karaoke', `Escucha la línea y dila al mismo ritmo. Línea ${i + 1} de ${R.length}.`);
      body.insertAdjacentHTML('beforeend', `<div class="m2o"><div class="m2o-sc"><span class="m2o-eq">${'<i></i>'.repeat(14)}</span><small>${ag() === 'adult' ? esc(so.title || '') : 'Karaoke'}</small><b class="m2o-ln">${esc(x.full)}</b></div><div class="m2o-turn"></div></div>`);
      const turn = body.querySelector('.m2o-turn'); body.querySelector('.m2o').classList.add('m2on'); await play(x.au); const m2 = body.querySelector('.m2o'); if (m2) m2.classList.remove('m2on'); if (!stage.isConnected) break;
      const ln = body.querySelector('.m2o-ln'); if (ln) ln.remove(); const r = await voiceTurn(turn, { a: x.full, aau: x.au }, { lbl: 'KARAOKE · DILA AL RITMO', mode: 'tap' }); if (r.ok) c++;
    }
    return { c, t: R.length };
  }

  /* =================== v520 · MÓDULO 3 (B1) · experiencia propia =================== */
  const M3 = (function () {
    const persona = { adult: ['Laura Kim', 'Recruiter', 'u:photo-1494790108377-be9c29b29330'] };
    /* ---------- 💼 Adultos · entrevista en video ---------- */
    async function interview(stage, p) {
      const Q = KQ(p); if (!Q.length) return null; let c = 0; const P = persona.adult;
      const body = frame(stage, 'Practice', 'Entrevista en video', 'Laura te entrevista. Escucha cada pregunta y responde leyendo tu respuesta.');
      body.insertAdjacentHTML('beforeend', `<div class="m3i"><div class="m3i-v" style="background-image:url('${M().imgURL(P[2], 700, 520)}')"><span class="m3i-rec"><i></i>REC <b>00:00</b></span><span class="m3i-who">${esc(P[0])} · ${esc(P[1])}</span><span class="m3i-me">${SV(IC.mic)}</span></div><div class="m3i-q"></div><div class="m3i-turn"></div><div class="m2c-dots">${Q.map(() => '<i></i>').join('')}</div></div>`);
      const el = body.querySelector('.m3i'), qn = el.querySelector('.m3i-q'), turn = el.querySelector('.m3i-turn'), tm = el.querySelector('.m3i-rec b'), t0 = Date.now();
      const tick = setInterval(() => { if (!stage.isConnected) return clearInterval(tick); const s = Math.floor((Date.now() - t0) / 1000); tm.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500);
      for (let i = 0; i < Q.length; i++) {
        if (!stage.isConnected) break; const k = Q[i]; el.querySelectorAll('.m2c-dots i').forEach((d, j) => d.className = j < i ? 'ok' : j === i ? 'cur' : '');
        qn.innerHTML = `<button type="button" class="m2c-ql">${SV(IC.vol)}</button><div><small>PREGUNTA ${i + 1} DE ${Q.length}</small><b>${esc(k.q)}</b><span>${esc(k.es || '')}</span></div>`; qn.querySelector('.m2c-ql').onclick = () => { stopA(); play(k.qau); };
        turn.innerHTML = ''; el.classList.add('talk'); await play(k.qau); el.classList.remove('talk'); if (!stage.isConnected) break;
        const r = await voiceTurn(turn, k, { lbl: 'TU RESPUESTA', mode: 'tap' }); if (r.ok) c++;
      }
      clearInterval(tick); if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
      qn.innerHTML = ''; turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>respuestas con buena melodía · entrevista terminada</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx(c === Q.length ? 'win' : 'ok');
      await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
    }
    /* ---------- 🎬 Teens · graba tu video con teleprompter ---------- */
    async function prompter(stage, p) {
      const Q = KQ(p); if (!Q.length) return null; let c = 0;
      const body = frame(stage, 'Practice', 'Graba tu video', 'Lee la respuesta del teleprompter como si grabaras un video para tu canal.');
      body.insertAdjacentHTML('beforeend', `<div class="m3t"><div class="m3t-v" style="background-image:url('${M().imgURL('u:photo-1522202176988-66273c2fd55f', 700, 700)}')"><span class="m3i-rec"><i></i>REC</span><span class="m3t-n"></span><div class="m3t-tp"></div></div><div class="m3t-turn"></div></div>`);
      const tp = body.querySelector('.m3t-tp'), turn = body.querySelector('.m3t-turn'), nn = body.querySelector('.m3t-n');
      for (let i = 0; i < Q.length; i++) {
        if (!stage.isConnected) break; const k = Q[i]; nn.textContent = `TOMA ${i + 1} / ${Q.length}`;
        tp.innerHTML = `<span class="m3t-q">${esc(k.q)} <button type="button" class="m3t-pl">${SV(IC.vol)}</button></span><b>${esc(k.a.split(' / ')[0])}</b>`; tp.querySelector('.m3t-pl').onclick = () => { stopA(); play(k.qau); };
        turn.innerHTML = `<p class="m2l-es">${esc(k.es || '')}</p>`; await play(k.qau); if (!stage.isConnected) break;
        const r = await voiceTurn(turn, k, { lbl: 'LEE EL TELEPROMPTER', mode: 'tap', compact: 1 }); if (r.ok) c++;
      }
      if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
      tp.innerHTML = `<b>That's a wrap!</b>`; turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>tomas aprobadas</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx(c === Q.length ? 'win' : 'ok');
      await A().waitNext(stage, 'Publicar y continuar'); return A().result(c, Q.length, 'speaking');
    }
    /* ---------- 📺 Kids · reportero de noticias ---------- */
    async function news(stage, p) {
      const Q = KQ(p); if (!Q.length) return null; let c = 0; const POSE = ['present', 'point', 'idea', 'wink'];
      const body = frame(stage, 'Practice', 'Reportero de noticias', 'Mr. Arrieta presenta las noticias. Tú eres el reportero: responde en vivo.');
      body.insertAdjacentHTML('beforeend', `<div class="m3n"><div class="m3n-tv"><img class="m3n-mr" src="mra-present.webp" alt="Mr. Arrieta"><div class="m3n-br"><span class="m3n-live">EN VIVO</span><b>KIDS NEWS</b></div><div class="m3n-tk">Reportero: tú · Reporte <span>1</span> de ${Q.length}</div></div><div class="m3n-q"></div><div class="m3n-turn"></div></div>`);
      const qn = body.querySelector('.m3n-q'), turn = body.querySelector('.m3n-turn'), mr = body.querySelector('.m3n-mr'), tk = body.querySelector('.m3n-tk span');
      for (let i = 0; i < Q.length; i++) {
        if (!stage.isConnected) break; const k = Q[i]; mr.src = 'mra-' + POSE[i % POSE.length] + '.webp'; tk.textContent = i + 1;
        qn.innerHTML = `<button type="button" class="m2c-ql">${SV(IC.vol)}</button><div><b>${esc(k.q)}</b><small>${esc(k.es || '')}</small></div>`; qn.querySelector('.m2c-ql').onclick = () => { stopA(); play(k.qau); };
        turn.innerHTML = ''; await play(k.qau); if (!stage.isConnected) break;
        const r = await voiceTurn(turn, k, { lbl: 'TU REPORTE', mode: 'tap' }); if (r.ok) { c++; mr.src = 'mra-thumbs.webp'; } await sleep(300);
      }
      if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
      mr.src = MRMOOD(c, Q.length).img; qn.innerHTML = `<div><b>That's all for today!</b><small>Fin del noticiero</small></div>`; turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>reportes en vivo</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx('win');
      await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
    }
    /* ---------- 🎲 Adultos · apuesta tu seguridad ---------- */
    async function bet(stage, p) {
      const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, Math.min(5, pool.length)); let pts = 10, c = 0; const missed = [];
      for (let i = 0; i < R.length; i++) {
        if (!stage.isConnected) break; const f = R[i], parts = noPar(f.s).split(/_{2,}/), ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j); window.__m2t = { a: f.a };
        const body = frame(stage, 'Practice', 'Apuesta tu seguridad', 'Elige la respuesta y apuesta 1, 2 o 3 puntos según qué tan seguro estés. Si aciertas, ganas lo apostado; si fallas, lo pierdes.');
        body.insertAdjacentHTML('beforeend', `<div class="m3b"><div class="m3b-bank"><span>Tus puntos</span><b>${pts}</b><small>Ronda ${i + 1} de ${R.length}</small></div><div class="m3b-s">${esc(parts[0] || '')}<span class="m3b-gap">?</span>${esc(parts.slice(1).join(' ') || '')}</div>${hintBox(f)}<div class="m3b-ops">${ops.map(o => `<button type="button" class="m3b-o" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="m3b-bet" hidden><p class="m2r-ins">¿Qué tan seguro estás?</p><div class="m3b-chips">${[1, 2, 3].map(n => `<button type="button" class="m3b-c" data-n="${n}">${n}</button>`).join('')}</div></div><div class="m3b-fb"></div></div>`);
        const el = body.querySelector('.m3b'), bt = el.querySelector('.m3b-bet'), fb = el.querySelector('.m3b-fb'); let pick = null;
        const ok = await new Promise(done => {
          el.querySelectorAll('.m3b-o').forEach(b => b.onclick = () => { pick = b.dataset.o; sfx('tap'); el.querySelectorAll('.m3b-o').forEach(x => x.classList.toggle('on', x === b)); el.querySelector('.m3b-gap').textContent = pick; bt.hidden = false; });
          el.querySelectorAll('.m3b-c').forEach(b => b.onclick = () => { if (!pick) return; const n = +b.dataset.n, good = pick === f.a; el.querySelectorAll('.m3b-o,.m3b-c').forEach(x => x.disabled = true); b.classList.add('on');
            el.querySelectorAll('.m3b-o').forEach(x => { if (x.dataset.o === f.a) x.classList.add('ok'); else if (x.dataset.o === pick) x.classList.add('bad'); });
            const g = el.querySelector('.m3b-gap'); g.textContent = f.a; g.classList.add(good ? 'ok' : 'bad'); pts = Math.max(0, pts + (good ? n : -n)); el.querySelector('.m3b-bank b').textContent = pts; el.querySelector('.m3b-bank').classList.add(good ? 'up' : 'dn'); sfx(good ? 'ok' : 'bad');
            fb.innerHTML = `<div class="as-fbk ${good ? 'ok' : 'no'}"><span>${good ? `Ganaste ${n} punto${n > 1 ? 's' : ''}.` : `Perdiste ${n} punto${n > 1 ? 's' : ''}. Era <b>${esc(f.a)}</b>.`}${f.h ? ' · ' + esc(f.h) : ''}</span></div><button type="button" class="btn k m3b-nx">${i < R.length - 1 ? 'Siguiente ronda' : 'Ver resultado'}</button>`;
            play(f.au); fb.querySelector('.m3b-nx').onclick = () => { stopA(); done(good); }; });
        });
        if (ok) c++; else missed.push({ en: fullOf(f), au: f.au });
      }
      const body = frame(stage, 'Practice', 'Apuesta tu seguridad', ''); body.insertAdjacentHTML('beforeend', `<div class="as-kpi"><div><b>${pts}</b><small>puntos finales</small></div><div><b>${c}/${R.length}</b><small>correctas</small></div><div><b>${pts >= 10 ? '+' : ''}${pts - 10}</b><small>ganancia</small></div></div>`); sfx(c === R.length ? 'win' : 'ok');
      await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'reading', missed);
    }
    /* ---------- 🧭 Teens · elige tu camino (historia por capítulos) ---------- */
    async function path(stage, p) {
      const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, Math.min(5, pool.length)); let c = 0; const missed = []; const NM = ['Mia', 'Leo', 'Sara', 'Nico'][Math.floor(Math.random() * 4)];
      const CH = ['El mensaje', 'El plan', 'La sorpresa', 'El problema', 'El final'];
      for (let i = 0; i < R.length; i++) {
        if (!stage.isConnected) break; const f = R[i], parts = noPar(f.s).split(/_{2,}/), ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j); window.__m2t = { a: f.a };
        const body = frame(stage, 'Practice', 'Elige tu camino', `Tú decides cómo sigue la historia con ${NM}. Elige la opción correcta para avanzar.`);
        body.insertAdjacentHTML('beforeend', `<div class="m3p"><div class="m3p-path">${R.map((_, j) => `<i class="${j < i ? 'd' : j === i ? 'c' : ''}"></i>`).join('<em></em>')}</div><div class="m3p-st"><small>CAPÍTULO ${i + 1} · ${CH[i % CH.length]}</small><p>${esc(parts[0] || '')}<span class="m3p-gap">?</span>${esc(parts.slice(1).join(' ') || '')}</p>${hintBox(f)}</div><div class="m3p-ops">${ops.map(o => `<button type="button" class="m3p-o" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="m3p-fb"></div></div>`);
        const el = body.querySelector('.m3p'), fb = el.querySelector('.m3p-fb');
        const ok = await new Promise(done => { let miss = 0; el.querySelectorAll('.m3p-o').forEach(b => b.onclick = () => { const good = b.dataset.o === f.a;
          if (!good) { miss++; b.classList.add('bad'); b.disabled = true; sfx('bad'); fb.innerHTML = `<div class="as-fbk no"><span>Ese camino no funciona aquí.${f.h ? ' Pista: ' + esc(f.h) : ''} Prueba otra opción.</span></div>`; return; }
          el.querySelectorAll('.m3p-o').forEach(x => x.disabled = true); b.classList.add('ok'); const g = el.querySelector('.m3p-gap'); g.textContent = f.a; g.classList.add('ok'); sfx('ok');
          fb.innerHTML = `<div class="as-fbk ok"><span>${miss ? 'Ahora sí. ' : '¡Perfecto! '}La historia sigue.</span></div><button type="button" class="as-gt m3p-nx">${i < R.length - 1 ? 'Siguiente capítulo' : 'Ver el final'}</button>`;
          play(f.au); fb.querySelector('.m3p-nx').onclick = () => { stopA(); done(miss === 0); }; }); });
        if (ok) c++; else missed.push({ en: fullOf(f), au: f.au });
      }
      const body = frame(stage, 'Practice', 'Fin de la historia', ''); body.insertAdjacentHTML('beforeend', `<div class="as-kpi"><div><b>${c}/${R.length}</b><small>a la primera</small></div><div><b>${R.length}</b><small>capítulos</small></div><div><b>${Math.round(c / R.length * 100)}%</b><small>acierto</small></div></div>`); sfx('win');
      await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'reading', missed);
    }
    /* ---------- 🗺️ Kids · el mapa del tesoro ---------- */
    async function map(stage, p) {
      const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, Math.min(5, pool.length)); let pos = 0; const missed = [];
      const body = frame(stage, 'Practice', 'El mapa del tesoro', 'Cada respuesta correcta te acerca al tesoro. ¡Llega a la X!');
      const PTS = [[12, 82], [30, 64], [50, 74], [66, 50], [80, 30], [90, 14]].slice(0, R.length + 1); PTS[PTS.length - 1] = [88, 16];
      body.insertAdjacentHTML('beforeend', `<div class="m3m"><div class="m3m-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${PTS.map(q => q.join(',')).join(' ')}" class="m3m-ln"/></svg>${PTS.map((q, j) => `<span class="m3m-st${j === PTS.length - 1 ? ' x' : ''}" style="left:${q[0]}%;top:${q[1]}%">${j === PTS.length - 1 ? '✕' : ''}</span>`).join('')}<span class="m3m-pin" style="left:${PTS[0][0]}%;top:${PTS[0][1]}%"></span></div><div class="m3m-play"></div></div>`);
      const pl = body.querySelector('.m3m-play'), pin = body.querySelector('.m3m-pin'), st = body.querySelectorAll('.m3m-st');
      for (let i = 0; i < R.length; i++) {
        if (!stage.isConnected) break; const f = R[i], parts = noPar(f.s).split(/_{2,}/), ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j); window.__m2t = { a: f.a };
        pl.innerHTML = `<div class="m2q-cnt">PISTA ${i + 1} DE ${R.length}</div><div class="m2q-s">${esc(parts[0] || '')}<span class="m2q-gap">?</span>${esc(parts.slice(1).join(' ') || '')}</div>${hintBox(f)}<div class="m2q-ops">${ops.map(o => `<button type="button" class="m2q-o" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="m2q-fb"></div>`;
        const ok = await new Promise(done => { let miss = 0; pl.querySelectorAll('.m2q-o').forEach(b => b.onclick = async () => { const good = b.dataset.o === f.a;
          if (!good) { miss++; b.classList.add('bad'); b.disabled = true; sfx('bad'); pl.querySelector('.m2q-fb').innerHTML = `<div class="as-fbk no"><span>${f.h ? 'Pista: <b>' + esc(f.h) + '</b>. ' : ''}¡Intenta otra vez!</span></div>`; return; }
          pl.querySelectorAll('.m2q-o').forEach(x => x.disabled = true); b.classList.add('ok'); const g = pl.querySelector('.m2q-gap'); g.textContent = f.a; g.classList.add('ok'); sfx('ok');
          pos++; const q = PTS[Math.min(pos, PTS.length - 1)]; pin.style.left = q[0] + '%'; pin.style.top = q[1] + '%'; if (st[pos - 1]) st[pos - 1].classList.add('d');
          pl.querySelector('.m2q-fb').innerHTML = `<div class="as-fbk ok"><span>${miss ? '¡Ahora sí!' : '¡Muy bien!'} Avanzas en el mapa.</span></div>`; await play(f.au); await sleep(400); done(miss === 0); }); });
        if (!ok) missed.push({ en: fullOf(f), au: f.au });
      }
      if (!stage.isConnected) return A().result(R.length - missed.length, R.length, 'reading', missed);
      body.querySelector('.m3m-map').classList.add('won'); pl.innerHTML = `<div class="m2q-end"><img src="mra-celebrate.webp" alt="Mr. Arrieta"><b>¡Encontraste el tesoro!</b><span>${R.length - missed.length} de ${R.length} a la primera</span></div>`; sfx('win'); try { M().confetti(1200); } catch (e) { }
      await A().waitNext(stage, 'Continuar'); return A().result(R.length - missed.length, R.length, 'reading', missed);
    }
    /* ---------- 📰 Lectura · revista / blog / diario con palabras clave ---------- */
    const partOfReading = (r) => { try { for (const t of M1DATA.topics) for (const pt of t.parts) if (pt.reading && (pt.reading === r || pt.reading.au === r.au)) return pt; } catch (e) { } return null; };
    function keyWords(r) { const pt = partOfReading(r); if (!pt || !window.MRGLOS3) return []; const g = ag()[0] === 't' ? 't' : ag()[0] === 'k' ? 'k' : 'a'; const L = MRGLOS3[g + ':' + pt.id] || []; const low = ' ' + r.text.toLowerCase().replace(/[^a-z' ]/g, ' ') + ' ';
      return L.filter(x => low.includes(' ' + x[0] + ' ')).map(x => ({ k: x[0], es: x[1] })); }
    function magBox(r, sents, photo) { const a = ag(), KW = keyWords(r); const kick = a === 'teens' ? 'BLOG' : a === 'kids' ? 'MI DIARIO' : 'MAGAZINE';
      const mark = (s) => { let h = s.split(/(\s+)/).map(w => /\S/.test(w) ? `<i class="rw">${esc(w)}</i>` : w).join(''); KW.forEach((k, n) => { const words = k.k.split(' '); const re = new RegExp('((?:<i class="rw">[^<]*</i>\\s*){' + words.length + '})', 'g'); h = h.replace(re, (m) => { const plain = m.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').trim().toLowerCase().replace(/[^a-z' ]/g, ''); return plain === k.k ? `<span class="gk" data-n="${n}">${m.trim()}</span> ` : m; }); }); return h; };
      return `<div class="reading pod9 mag9"><div class="pod9-pl mag9-hd"><div class="pod9-in"><small>${kick}</small><b>${esc(r.title)}</b><div class="pod9-bar"><i></i></div><div class="pod9-tm"><span class="pod9-c">0:00</span><span class="pod9-d"></span></div></div><button class="pod9-go" id="rp" aria-label="Escuchar">▶ Escuchar</button></div>
        ${KW.length ? '<div class="pod9-lb">TOCA LAS PALABRAS RESALTADAS</div>' : ''}<div class="txt">${sents.map(s => `<span class="s">${mark(s)}</span>`).join(' ')}</div><div class="mag9-gl" hidden></div><button class="rd-tr" id="rdtr" type="button" aria-expanded="false"><span>ES</span> Ver traducción al español</button><div class="rd-es" id="rdes" hidden></div></div>`; }
    function magBind(box) { const r0 = box.querySelector('.pod9-in b'); const gl = box.querySelector('.mag9-gl'); const r = (function () { try { for (const t of M1DATA.topics) for (const pt of t.parts) if (pt.reading && pt.reading.title === r0.textContent) return pt.reading; } catch (e) { } return null; })(); if (!r) return; const KW = keyWords(r);
      box.querySelectorAll('.gk').forEach(g => g.onclick = (e) => { e.stopPropagation(); const k = KW[+g.dataset.n]; if (!k) return; box.querySelectorAll('.gk').forEach(x => x.classList.toggle('on', x === g)); gl.hidden = false; gl.innerHTML = `<b>${esc(k.k)}</b> = ${esc(k.es)} ${k.au ? `<button type="button" class="mag9-pl">${SV(IC.vol)}</button>` : ''}`; const pb = gl.querySelector('.mag9-pl'); if (pb) pb.onclick = () => play(k.au); if (k.au && !(window.__ra && !window.__ra.paused)) play(k.au); sfx('tap'); }); }
    /* ---------- 🎯 Misión · solo las iniciales ---------- */
    function initials(a) { const w = a.split(/(\s+)/); const ini = w.map(x => /\S/.test(x) ? x.replace(/^([^A-Za-z0-9]*)([A-Za-z0-9])([A-Za-z0-9']*)(.*)$/, (m, p1, c1, rest, p2) => p1 + c1 + p2) : x).join('');
      return `<b class="m3ini" data-full="${esc(a)}">${w.map((x, i) => /\S/.test(x) ? `<span class="m3w" data-w="${esc(x)}">${esc(x.replace(/^([^A-Za-z0-9]*)([A-Za-z0-9])([A-Za-z0-9']*)(.*)$/, (m, p1, c1, rest, p2) => p1 + c1 + p2))}</span>` : ' ').join('')}</b><div class="m3ini-h"><button type="button" class="m3ini-1">${SV(IC.bulb)} Ver 1 palabra</button><button type="button" class="m3ini-all">Ver todo</button></div>`; }
    function bindIni(host) { const b1 = host.querySelector('.m3ini-1'), ba = host.querySelector('.m3ini-all'); if (!b1) return;
      const left = () => [...host.querySelectorAll('.m3w:not(.shown)')];
      b1.onclick = () => { const L = left(); if (!L.length) return; const w = L.sort((x, y) => y.dataset.w.length - x.dataset.w.length)[0]; w.textContent = w.dataset.w; w.classList.add('shown'); sfx('tap'); if (left().length === 0) host.querySelector('.m3ini-h').remove(); };
      ba.onclick = () => { left().forEach(w => { w.textContent = w.dataset.w; w.classList.add('shown'); }); sfx('tap'); host.querySelector('.m3ini-h').remove(); }; }
    /* ---------- 🎵 Música · dictado musical ---------- */
    const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/-/g, ' ').replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b|\bcannot\b/g, 'can not').replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'ve\b/g, ' have').replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim(); // v520: acepta contracciones o formas completas
    async function dictation(stage, p) {
      const S = window.M1SONGS; const sid = S && S.map && S.map[p.id]; const so = sid && S.songs[sid]; const L = so && (so.lc || []).filter(x => x.full && x.au && x.full.split(' ').length <= 9 && x.full.split(' ').length >= 3); if (!L || !L.length) return null;
      const R = L.slice(0, 2); let c = 0;
      for (let i = 0; i < R.length; i++) {
        if (!stage.isConnected) break; const x = R[i]; window.__m2t = { a: x.full };
        const body = frame(stage, 'Music', 'Dictado musical', `Escucha la frase de la canción y escríbela completa. Frase ${i + 1} de ${R.length}.`);
        body.insertAdjacentHTML('beforeend', `<div class="m3d"><div class="m2o-sc"><span class="m2o-eq">${'<i></i>'.repeat(14)}</span><small>${ag() === 'adult' ? esc(so.title || '') : 'Dictado'}</small></div><div class="m3d-row"><button type="button" class="btn w sm m3d-pl">${SV(IC.vol)} Escuchar otra vez</button><button type="button" class="btn w sm m3d-sl">Más despacio</button></div><textarea class="inp m3d-in" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Escribe lo que escuchas…"></textarea><div class="m3d-fb"></div><button type="button" class="btn k lg m3d-ok">Comprobar</button></div>`);
        const el = body.querySelector('.m3d'), inp = el.querySelector('.m3d-in'), fb = el.querySelector('.m3d-fb'), okb = el.querySelector('.m3d-ok');
        const say = async (slow) => { stopA(); el.classList.add('m2on'); try { await (slow ? M().play(x.au, { rate: .72 }) : play(x.au)); } catch (e) { } el.classList.remove('m2on'); };
        el.querySelector('.m3d-pl').onclick = () => say(false); el.querySelector('.m3d-sl').onclick = () => say(true); await say(false); try { inp.focus(); } catch (e) { }
        const ok = await new Promise(done => { let tries = 0; okb.onclick = () => { const v = norm(inp.value), t = norm(x.full); if (!v) { inp.focus(); return; } tries++;
          const tw = t.split(' '), vw = v.split(' '); const good = v === t;
          if (good) { sfx('ok'); inp.disabled = true; fb.innerHTML = `<div class="as-fbk ok"><span>Perfecto: <b>${esc(x.full)}</b></span></div>`; okb.textContent = i < R.length - 1 ? 'Siguiente frase' : 'Continuar'; okb.onclick = () => done(tries === 1); return; }
          const marked = vw.map((w, j) => tw[j] === w ? esc(w) : `<u>${esc(w)}</u>`).join(' ') + (vw.length < tw.length ? ' <u>…</u>' : '');
          sfx('bad'); if (tries >= 2) { inp.disabled = true; fb.innerHTML = `<div class="as-fbk no"><span>Así es la frase: <b>${esc(x.full)}</b></span></div>`; okb.textContent = i < R.length - 1 ? 'Siguiente frase' : 'Continuar'; okb.onclick = () => done(false); play(x.au); return; }
          fb.innerHTML = `<div class="as-fbk no"><span>Casi. Revisa lo subrayado y escucha otra vez: ${marked}${vw.length < tw.length ? ' (faltan palabras)' : ''}</span></div>`; }; });
        if (ok) c++;
      }
      return { c, t: R.length };
    }
    return { interview, prompter, news, bet, path, map, magBox, magBind, initials, bindIni, dictation };
  })();

  /* =================== v523 · MÓDULO 4 (B2) · experiencia propia =================== */
  const M4 = (function () {
    /* ---------- 🏛️ Adultos · presentación en la junta ---------- */
    async function board(stage, p) {
      const Q = KQ(p); if (!Q.length) return null; let c = 0; const AV = ['u:photo-1494790108377-be9c29b29330', 'u:photo-1507003211169-0a1dd7228f2d', 'u:photo-1438761681033-6461ffad8d80'];
      const body = frame(stage, 'Practice', 'Presentación en la junta', 'La junta directiva te hace preguntas. Escucha cada una y responde leyendo tu respuesta.');
      body.insertAdjacentHTML('beforeend', `<div class="m4b"><div class="m4b-room"><div class="m4b-sl"><small>BOARD MEETING · Q3</small><b></b></div><div class="m4b-aud">${AV.map((a, i) => `<span class="m4b-av" style="background-image:url('${M().imgURL(a, 160, 160)}')"></span>`).join('')}</div></div><div class="m4b-turn"></div><div class="m2c-dots">${Q.map(() => '<i></i>').join('')}</div></div>`);
      const el = body.querySelector('.m4b'), sl = el.querySelector('.m4b-sl b'), turn = el.querySelector('.m4b-turn'), avs = el.querySelectorAll('.m4b-av');
      for (let i = 0; i < Q.length; i++) {
        if (!stage.isConnected) break; const k = Q[i]; el.querySelectorAll('.m2c-dots i').forEach((d, j) => d.className = j < i ? 'ok' : j === i ? 'cur' : '');
        avs.forEach((a, j) => a.classList.toggle('on', j === i % avs.length)); sl.innerHTML = `${esc(k.q)} <button type="button" class="m4b-pl">${SV(IC.vol)}</button><span>${esc(k.es || '')}</span>`; sl.querySelector('.m4b-pl').onclick = () => { stopA(); play(k.qau); };
        turn.innerHTML = ''; await play(k.qau); if (!stage.isConnected) break;
        const r = await voiceTurn(turn, k, { lbl: 'TU RESPUESTA A LA JUNTA', mode: 'tap' }); if (r.ok) c++;
      }
      if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
      sl.innerHTML = 'Thank you. Great presentation.'; avs.forEach(a => a.classList.add('on')); turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>respuestas aprobadas por la junta</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx(c === Q.length ? 'win' : 'ok');
      await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
    }
    /* ---------- 🎙️ Teens · podcast ON AIR ---------- */
    async function podcast(stage, p) {
      const Q = KQ(p); if (!Q.length) return null; let c = 0; const NM = ['Kai', 'Mia', 'Leo', 'Zoe'][Math.floor(Math.random() * 4)];
      const body = frame(stage, 'Practice', 'Podcast ON AIR', `Estás al aire con ${NM}, tu co-host. Escucha cada pregunta y responde.`);
      body.insertAdjacentHTML('beforeend', `<div class="m4p"><div class="m4p-st"><span class="m4p-on"><i></i>ON AIR</span><span class="m4p-t">00:00</span><div class="m4p-mics"><span class="m4p-h" style="background-image:url('${M().imgURL('u:photo-1500648767791-00dcc994a43e', 160, 160)}')"></span><span class="m4p-lv">${'<i></i>'.repeat(9)}</span><span class="m4p-me">TÚ</span></div><small>EP. ${(+p.topic || 1) * 2 + (+p.part || 1)} · con ${NM}</small></div><div class="m4p-q"></div><div class="m4p-turn"></div></div>`);
      const el = body.querySelector('.m4p'), qn = el.querySelector('.m4p-q'), turn = el.querySelector('.m4p-turn'), tm = el.querySelector('.m4p-t'), t0 = Date.now();
      const tick = setInterval(() => { if (!stage.isConnected) return clearInterval(tick); const s = Math.floor((Date.now() - t0) / 1000); tm.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500);
      for (let i = 0; i < Q.length; i++) {
        if (!stage.isConnected) break; const k = Q[i];
        qn.innerHTML = `<button type="button" class="m2c-ql">${SV(IC.vol)}</button><div><small>${esc(NM.toUpperCase())}</small><b>${esc(k.q)}</b><span>${esc(k.es || '')}</span></div>`; qn.querySelector('.m2c-ql').onclick = () => { stopA(); play(k.qau); };
        turn.innerHTML = ''; el.classList.add('talk'); await play(k.qau); el.classList.remove('talk'); if (!stage.isConnected) break;
        const r = await voiceTurn(turn, k, { lbl: 'TU RESPUESTA AL AIRE', mode: 'tap' }); if (r.ok) c++;
      }
      clearInterval(tick); if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
      qn.innerHTML = `<div><b>That's a wrap for today!</b><span>Fin del episodio</span></div>`; turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>respuestas al aire</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx(c === Q.length ? 'win' : 'ok');
      await A().waitNext(stage, 'Terminar el episodio'); return A().result(c, Q.length, 'speaking');
    }
    /* ---------- 🚀 Kids · control de misión ---------- */
    async function control(stage, p) {
      const Q = KQ(p); if (!Q.length) return null; let c = 0;
      const body = frame(stage, 'Practice', 'Control de misión', 'Mr. Arrieta viaja en el cohete. Tú eres la base: escucha y responde.');
      body.insertAdjacentHTML('beforeend', `<div class="m4k"><div class="m4k-sp"><img class="m4k-rk" src="mra-x-rocket4.webp?v=7" alt="Mr. Arrieta en su cohete"><div class="m4k-hud"><small>MISSION CONTROL</small><b>T-minus <span>${Q.length}</span></b></div></div><div class="m4k-q"></div><div class="m4k-turn"></div></div>`);
      const qn = body.querySelector('.m4k-q'), turn = body.querySelector('.m4k-turn'), cnt = body.querySelector('.m4k-hud span'), sp = body.querySelector('.m4k-sp');
      for (let i = 0; i < Q.length; i++) {
        if (!stage.isConnected) break; const k = Q[i];
        qn.innerHTML = `<button type="button" class="m2c-ql">${SV(IC.vol)}</button><div><b>${esc(k.q)}</b><small>${esc(k.es || '')}</small></div>`; qn.querySelector('.m2c-ql').onclick = () => { stopA(); play(k.qau); };
        turn.innerHTML = ''; sp.classList.add('rx'); await play(k.qau); sp.classList.remove('rx'); if (!stage.isConnected) break;
        const r = await voiceTurn(turn, k, { lbl: 'RESPONDE A LA BASE', mode: 'tap' }); if (r.ok) c++; cnt.textContent = Q.length - i - 1;
      }
      if (!stage.isConnected) return A().result(c, Q.length, 'speaking');
      sp.classList.add('go'); qn.innerHTML = `<div><b>Liftoff!</b><small>¡Despegue!</small></div>`; turn.innerHTML = `<div class="m2-sum"><b>${c} de ${Q.length}</b><span>mensajes a la base</span>${MRMOOD(c, Q.length).k === "lo" ? `<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>` : ""}</div>`; sfx('win'); try { M().confetti(1000); } catch (e) { }
      await A().waitNext(stage, 'Continuar'); return A().result(c, Q.length, 'speaking');
    }
    /* ---------- 🧱 Adultos · arma la frase por bloques (uno sobra) ---------- */
    function chunksOf(f) { const full = fullOf(f), a = String(f.a); const i = full.toLowerCase().indexOf(a.toLowerCase()); if (i < 0) return null;
      const pre = full.slice(0, i).trim().split(/\s+/).filter(Boolean), post = full.slice(i + a.length).trim().split(/\s+/).filter(Boolean);
      const grp = (L, n) => { const out = []; for (let k = 0; k < L.length; k += n) out.push(L.slice(k, k + n).join(' ')); return out; };
      const ansChunk = [a].concat(post.slice(0, 1)).join(' '), rest = post.slice(1);
      const C = grp(pre, 3).concat([ansChunk]).concat(grp(rest, 3)).filter(Boolean); if (C.length < 3 || C.length > 6) return null;
      const bad = [f.o[0]].concat(post.slice(0, 1)).join(' '); return { C, bad, full }; }
    async function blocks(stage, p) {
      const pool = fillPool(p).map(f => ({ f, x: chunksOf(f) })).filter(o => o.x); if (pool.length < 2) return null; const R = pool.slice(0, 3); let c = 0; const missed = [];
      for (let i = 0; i < R.length; i++) {
        if (!stage.isConnected) break; const { f, x } = R[i]; const cards = shuffle(x.C.map((t, k) => ({ t, k })).concat([{ t: x.bad, k: -1 }])); const pick = []; window.__m2t = { order: x.C };
        const body = frame(stage, 'Practice', 'Arma la frase', `Toca los bloques en orden para formar la frase correcta. Uno sobra. Frase ${i + 1} de ${R.length}.`);
        body.insertAdjacentHTML('beforeend', `<div class="m4c"><div class="m4c-sl"></div>${hintBox(f)}<div class="m4c-cards">${cards.map((o, j) => `<button type="button" class="m4c-b" data-j="${j}">${esc(o.t)}</button>`).join('')}</div><div class="m4c-fb"></div></div>`);
        const sl = body.querySelector('.m4c-sl'), fb = body.querySelector('.m4c-fb');
        const draw = () => { sl.innerHTML = x.C.map((_, k) => pick[k] != null ? `<button type="button" class="m4c-s on" data-k="${k}">${esc(cards[pick[k]].t)}</button>` : `<span class="m4c-s">${k + 1}</span>`).join(''); body.querySelectorAll('.m4c-b').forEach((b, j) => b.classList.toggle('used', pick.includes(j)));
          sl.querySelectorAll('.m4c-s.on').forEach(s => s.onclick = () => { if (fb.dataset.done) return; pick.splice(+s.dataset.k); draw(); }); };
        draw();
        const ok = await new Promise(done => { body.querySelectorAll('.m4c-b').forEach((b, j) => b.onclick = () => { if (fb.dataset.done || pick.includes(j) || pick.length >= x.C.length) return; pick.push(j); sfx('tap'); draw();
          if (pick.length === x.C.length) { fb.dataset.done = 1; const good = pick.every((pj, k) => cards[pj].k === k); body.querySelectorAll('.m4c-b').forEach(bb => bb.disabled = true); sl.classList.add(good ? 'good' : 'bad'); sfx(good ? 'ok' : 'bad');
            fb.innerHTML = `<div class="as-fbk ${good ? 'ok' : 'no'}"><span>${good ? 'Perfecto.' : 'Así es la frase:'} <b>${esc(x.full)}</b>${!good && f.h ? ' · ' + esc(f.h) : ''}</span></div><button type="button" class="btn k m4c-nx">${i < R.length - 1 ? 'Siguiente frase' : 'Ver resultado'}</button>`; play(f.au); fb.querySelector('.m4c-nx').onclick = () => { stopA(); done(good); }; } }); });
        if (ok) c++; else missed.push({ en: x.full, au: f.au });
      }
      const body = frame(stage, 'Practice', 'Arma la frase', ''); body.insertAdjacentHTML('beforeend', `<div class="m2-sum"><b>${c} de ${R.length}</b><span>frases armadas a la primera</span></div>`); sfx(c === R.length ? 'win' : 'ok');
      await A().waitNext(stage, 'Continuar'); return A().result(c, R.length, 'writing', missed);
    }
    /* ---------- ⚔️ Teens · duelo 1 vs 1 ---------- */
    async function duel(stage, p) {
      const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, Math.min(6, pool.length)); let me = 100, rv = 100, c = 0; const missed = []; const RV = ['kai_99', 'zoe.gg', 'max_fx'][Math.floor(Math.random() * 3)]; const HIT = Math.ceil(100 / Math.min(4, R.length));
      for (let i = 0; i < R.length && me > 0 && rv > 0; i++) {
        if (!stage.isConnected) break; const f = R[i], parts = noPar(f.s).split(/_{2,}/), ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j); window.__m2t = { a: f.a };
        const body = frame(stage, 'Practice', 'Duelo 1 vs 1', 'Cada acierto le quita vida a tu rival. Cada error te la quita a ti. Tienes 10 segundos.');
        body.insertAdjacentHTML('beforeend', `<div class="m4d"><div class="m4d-bar"><div><small>TÚ</small><i class="m4d-hp"><b style="width:${me}%"></b></i></div><span class="m4d-vs">VS</span><div><small>@${RV}</small><i class="m4d-hp r"><b style="width:${rv}%"></b></i></div></div><div class="m2s-tm"><i></i></div><div class="m4d-s">${esc(parts[0] || '')}<span class="m3b-gap">?</span>${esc(parts.slice(1).join(' ') || '')}</div>${hintBox(f)}<div class="m3b-ops">${ops.map(o => `<button type="button" class="m4d-o" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="m4d-fb"></div></div>`);
        const tm = body.querySelector('.m2s-tm i'), t0 = Date.now(), fb = body.querySelector('.m4d-fb');
        const ok = await new Promise(done => { let over = false; const end = (o) => { if (over) return; over = true; clearInterval(iv); const good = o === f.a; body.querySelectorAll('.m4d-o').forEach(b => { b.disabled = true; if (b.dataset.o === f.a) b.classList.add('ok'); else if (b.dataset.o === o) b.classList.add('bad'); });
            const g = body.querySelector('.m3b-gap'); g.textContent = f.a; g.classList.add(good ? 'ok' : 'bad'); if (good) rv = Math.max(0, rv - HIT); else me = Math.max(0, me - HIT);
            const hp = body.querySelectorAll('.m4d-hp b'); hp[0].style.width = me + '%'; hp[1].style.width = rv + '%'; body.querySelector(good ? '.m4d-hp.r' : '.m4d-hp:not(.r)').classList.add('hit'); sfx(good ? 'ok' : 'bad');
            fb.innerHTML = `<div class="as-fbk ${good ? 'ok' : 'no'}"><span>${o == null ? 'Se acabó el tiempo. ' : good ? '¡Golpe! ' : 'Te golpearon. '}${good ? '' : `Era <b>${esc(f.a)}</b>.`}</span></div><button type="button" class="as-gt m4d-nx">${me > 0 && rv > 0 && i < R.length - 1 ? 'Siguiente ronda' : 'Ver resultado'}</button>`;
            play(f.au); fb.querySelector('.m4d-nx').onclick = () => { stopA(); done(good); }; };
          const iv = setInterval(() => { if (!stage.isConnected) return clearInterval(iv); const fr = 1 - (Date.now() - t0) / 10000; tm.style.width = Math.max(0, fr * 100) + '%'; tm.classList.toggle('lo', fr < .3); if (fr <= 0) end(null); }, 60);
          body.querySelectorAll('.m4d-o').forEach(b => b.onclick = () => end(b.dataset.o)); });
        if (ok) c++; else missed.push({ en: fullOf(f), au: f.au });
      }
      const win = rv <= me; const body = frame(stage, 'Practice', win ? '¡Ganaste el duelo!' : 'Perdiste el duelo', ''); body.insertAdjacentHTML('beforeend', `<div class="as-kpi"><div><b>${c}</b><small>golpes</small></div><div><b>${me}%</b><small>tu vida</small></div><div><b>${rv}%</b><small>vida del rival</small></div></div>`); sfx(win ? 'win' : 'ok');
      await A().waitNext(stage, win ? 'Continuar' : 'Revancha en la próxima · Continuar'); return A().result(c, Math.max(1, c + missed.length), 'reading', missed);
    }
    /* ---------- 🚀 Kids · construye el cohete ---------- */
    async function rocket(stage, p) {
      const pool = fillPool(p); if (pool.length < 3) return null; const R = pool.slice(0, 4); const PARTS = ['Punta', 'Ventana', 'Alas', 'Motor']; const got = []; const missed = [];
      const body = frame(stage, 'Practice', 'Construye el cohete', 'Cada respuesta correcta suma una pieza. Con las 4 piezas, ¡el cohete despega!');
      body.insertAdjacentHTML('beforeend', `<div class="m4r"><div class="m4r-pz">${PARTS.map((t, k) => `<i class="m4r-p" data-k="${k}">${t}</i>`).join('')}</div><div class="m4r-play"></div></div>`);
      const pl = body.querySelector('.m4r-play');
      for (let i = 0; i < R.length; i++) {
        if (!stage.isConnected) break; const f = R[i], parts = noPar(f.s).split(/_{2,}/), ops = shuffle([f.a].concat(f.o)).filter((x, j, a) => a.indexOf(x) === j); window.__m2t = { a: f.a };
        pl.innerHTML = `<div class="m2q-cnt">PIEZA ${i + 1} DE ${R.length}: ${PARTS[i].toUpperCase()}</div><div class="m2q-s">${esc(parts[0] || '')}<span class="m2q-gap">?</span>${esc(parts.slice(1).join(' ') || '')}</div>${hintBox(f)}<div class="m2q-ops">${ops.map(o => `<button type="button" class="m2q-o" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="m2q-fb"></div>`;
        const ok = await new Promise(done => { let miss = 0; pl.querySelectorAll('.m2q-o').forEach(b => b.onclick = async () => { const good = b.dataset.o === f.a;
          if (!good) { miss++; b.classList.add('bad'); b.disabled = true; sfx('bad'); pl.querySelector('.m2q-fb').innerHTML = `<div class="as-fbk no"><span>${f.h ? 'Pista: <b>' + esc(f.h) + '</b>. ' : ''}¡Intenta otra vez!</span></div>`; return; }
          pl.querySelectorAll('.m2q-o').forEach(x => x.disabled = true); b.classList.add('ok'); const g = pl.querySelector('.m2q-gap'); g.textContent = f.a; g.classList.add('ok'); sfx('ok'); body.querySelector(`.m4r-p[data-k="${i}"]`).classList.add('on');
          pl.querySelector('.m2q-fb').innerHTML = `<div class="as-fbk ok"><span>¡Pieza nueva: ${PARTS[i]}!</span></div>`; await play(f.au); await sleep(400); done(miss === 0); }); });
        if (!ok) missed.push({ en: fullOf(f), au: f.au });
      }
      if (!stage.isConnected) return A().result(R.length - missed.length, R.length, 'reading', missed);
      pl.innerHTML = `<div class="m4r-go"><img src="mra-x-rocket4.webp?v=7" alt="Mr. Arrieta en su cohete"><b>¡Despegue!</b><span>${R.length - missed.length} de ${R.length} a la primera</span></div>`; sfx('win'); try { M().confetti(1200); } catch (e) { }
      await A().waitNext(stage, 'Continuar'); return A().result(R.length - missed.length, R.length, 'reading', missed);
    }
    /* ---------- 📖 Lectura por partes (pregunta después de cada parte) ---------- */
    const splitS = t => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["”’)]*\s*/g) || [t];
    const ow = (a, b) => { const A0 = new Set(String(a).toLowerCase().match(/[a-z']{3,}/g) || []); let n = 0; (String(b).toLowerCase().match(/[a-z']{3,}/g) || []).forEach(w => { if (A0.has(w)) n++; }); return n; };
    async function readParts(stage, p) {
      const r = p.reading; if (!r || !r.text || !(r.q || []).length) return null; const S = splitS(r.text), Qs = r.q.slice(0, 3), a = ag();
      const at = Qs.map(q => { let bi = 0, bs = -1; S.forEach((s, k) => { const v = ow(q.s, s); if (v > bs) { bs = v; bi = k; } }); return bi; });
      const cuts = [...new Set(at.concat([S.length - 1]))].sort((x, y) => x - y); const P = []; let st = 0; cuts.forEach(cu => { if (cu >= st) { P.push({ s: S.slice(st, cu + 1), q: [] }); st = cu + 1; } });
      Qs.forEach((q, k) => { const idx = P.findIndex((pp, j) => { let end = -1; for (let m = 0; m <= j; m++) end += P[m].s.length; return at[k] <= end; }); (P[idx >= 0 ? idx : P.length - 1]).q.push(q); });
      const kick = a === 'teens' ? 'HILO' : a === 'kids' ? 'PÁGINA' : 'INFORME · PARTE'; const tot = S.join('').length; let off = 0; P.forEach(pp => { pp.t0 = off / tot; off += pp.s.join('').length; pp.t1 = off / tot; });
      const body = frame(stage, 'Reading', r.title, a === 'kids' ? 'Lee cada página, escúchala y responde antes de seguir.' : 'Lee por partes. Después de cada parte responde una pregunta rápida.');
      body.insertAdjacentHTML('beforeend', `<div class="m4l"><div class="m4l-hd"><small></small><div class="m4l-st">${P.map(() => '<i></i>').join('')}</div></div><div class="m4l-parts"></div><button class="rd-tr" id="rdtr" type="button" aria-expanded="false" hidden><span>ES</span> Ver traducción al español</button></div>`);
      const parts = body.querySelector('.m4l-parts'), hd = body.querySelector('.m4l-hd small'); let c = 0, n = 0; const A0 = M().audioEl ? M().audioEl(r.au) : new Audio(M().audioSrc(r.au)); try { M().trackAudio(A0); } catch (e) { }
      const playSeg = (pp, btn) => { stopA(); const go = () => { try { A0.currentTime = pp.t0 * A0.duration; } catch (e) { } try { A0.playbackRate = window.__mraSlow ? 0.75 : 1; A0.preservesPitch = true; } catch (e) { } A0.play().catch(() => { }); /* v603: «Más lento» también en la lectura por partes */ btn.classList.add('on'); const iv = setInterval(() => { if (!A0.duration || A0.paused || A0.currentTime >= pp.t1 * A0.duration - 0.05) { A0.pause(); btn.classList.remove('on'); clearInterval(iv); } }, 80); }; if (A0.readyState >= 1) go(); else A0.addEventListener('loadedmetadata', go, { once: true }); A0.load && A0.readyState < 1 && A0.load(); };
      for (let k = 0; k < P.length; k++) {
        if (!stage.isConnected) break; const pp = P[k]; hd.textContent = `${kick} ${k + 1} DE ${P.length}`; body.querySelectorAll('.m4l-st i').forEach((d, j) => d.className = j < k ? 'd' : j === k ? 'c' : '');
        const card = H(`<div class="m4l-p in"><button type="button" class="m4l-pl">${SV(IC.vol)} Escuchar esta parte</button><p>${pp.s.map(s => esc(s.trim())).join(' ')}</p><div class="m4l-q"></div></div>`); parts.querySelectorAll('.m4l-p').forEach(x => x.classList.add('past')); parts.appendChild(card); card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        const pb = card.querySelector('.m4l-pl'); pb.onclick = () => playSeg(pp, pb); playSeg(pp, pb);
        const qh = card.querySelector('.m4l-q');
        for (const q of pp.q) { n++; const L = a === 'teens' ? ['TRUE', 'FALSE'] : ['YES', 'NO'];
          const ok = await new Promise(done => { qh.innerHTML = `<div class="m4l-qq"><span>${esc(q.s)}</span><div><button type="button" data-v="yes">${L[0]}</button><button type="button" data-v="no">${L[1]}</button></div></div>`; window.__m2t = { a: q.a };
            qh.querySelectorAll('button').forEach(b => b.onclick = () => { const good = b.dataset.v === q.a; qh.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.dataset.v === q.a) x.classList.add('ok'); }); if (!good) b.classList.add('bad'); sfx(good ? 'ok' : 'bad'); setTimeout(() => done(good), 900); }); });
          if (ok) c++; qh.insertAdjacentHTML('beforeend', `<div class="m4l-ans ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${esc(q.s)}</div>`); qh.querySelector('.m4l-qq').remove(); }
        if (k < P.length - 1) await new Promise(res => { const b = H(`<button type="button" class="btn k m4l-nx">${a === 'kids' ? 'Pasar la página' : 'Siguiente parte'} ↓</button>`); card.appendChild(b); b.onclick = () => { A0.pause(); b.remove(); res(); }; });
      }
      try { A0.pause(); } catch (e) { } if (!stage.isConnected) return A().result(c, n, 'reading');
      body.querySelectorAll('.m4l-st i').forEach(d => d.className = 'd'); parts.querySelectorAll('.m4l-p').forEach(x => x.classList.remove('past'));
      parts.insertAdjacentHTML('beforeend', `<div class="m2-sum"><b>${c} de ${n}</b><span>respuestas correctas</span>${MRMOOD(c, n).k === 'lo' ? '<em class="m2-mood">Try again! Repasa y vuelve a intentarlo.</em>' : ''}</div>`); sfx(c === n ? 'win' : 'ok');
      await A().waitNext(stage, `${c}/${n} correctas — Continuar`); return A().result(c, n, 'reading');
    }
    /* ---------- 🔁 Misión eco · sin texto ---------- */
    function eco(a) { return `<b class="m4e" data-full="${esc(a)}"><span class="m4e-w">${'<i></i>'.repeat(20)}</span><em>Escucha la respuesta y repítela de memoria</em></b><div class="m3ini-h"><button type="button" class="m4e-ag">${SV(IC.vol)} Escuchar otra vez</button><button type="button" class="m4e-tx">Ver el texto (−1 estrella)</button></div>`; }
    function bindEco(host, au) { const b = host.querySelector('.m4e-ag'), t = host.querySelector('.m4e-tx'); if (b) b.onclick = () => { stopA(); if (au) play(au); }; if (t) t.onclick = () => { const e = host.querySelector('.m4e'); e.innerHTML = esc(e.dataset.full); e.classList.add('shown'); host.dataset.peek = 1; t.remove(); sfx('tap'); }; if (au) setTimeout(() => { if (host.isConnected) play(au); }, 300); }
    /* ---------- 🎵 Canción · ordena las frases ---------- */
    async function order(stage, p) {
      const S = window.M1SONGS; const sid = S && S.map && S.map[p.id]; const so = sid && S.songs[sid]; const L = so && (so.lc || []).filter(x => x.full && x.au && x.full.split(' ').length <= 13); if (!L || L.length < 3) return null;
      const R = L.slice(0, 3); const cards = shuffle(R.map((x, k) => ({ x, k }))); const pick = []; window.__m2t = { order: R.map(x => x.full) };
      const body = frame(stage, 'Music', 'Ordena las frases', 'Escucha las 3 frases de la canción y tócalas en el orden en que sonaron.');
      body.insertAdjacentHTML('beforeend', `<div class="m2o m4o"><div class="m2o-sc"><span class="m2o-eq">${'<i></i>'.repeat(14)}</span><small>${ag() === 'adult' ? esc(so.title || '') : 'Escucha con atención'}</small></div><button type="button" class="btn w sm m4o-ag">${SV(IC.vol)} Escuchar otra vez</button><div class="m4o-l">${cards.map((o, j) => `<button type="button" class="m4o-b" data-j="${j}"><b>?</b><span>${esc(o.x.full)}</span></button>`).join('')}</div><div class="m4o-fb"></div></div>`);
      const el = body.querySelector('.m4o'), fb = el.querySelector('.m4o-fb'); let busy = false;
      const listen = async () => { if (busy) return; busy = true; el.classList.add('m2on'); for (const x of R) { if (!stage.isConnected) break; await play(x.au); await sleep(350); } el.classList.remove('m2on'); busy = false; };
      el.querySelector('.m4o-ag').onclick = () => listen(); await listen();
      const c = await new Promise(done => el.querySelectorAll('.m4o-b').forEach(b => b.onclick = () => { if (fb.dataset.done) return; const j = +b.dataset.j; const at = pick.indexOf(j);
        if (at >= 0) { pick.splice(at); } else pick.push(j); el.querySelectorAll('.m4o-b').forEach((x, jj) => { const k = pick.indexOf(jj); x.classList.toggle('on', k >= 0); x.querySelector('b').textContent = k >= 0 ? k + 1 : '?'; }); sfx('tap');
        if (pick.length === R.length) { fb.dataset.done = 1; let n = 0; pick.forEach((pj, k) => { const good = cards[pj].k === k; if (good) n++; el.querySelectorAll('.m4o-b')[pj].classList.add(good ? 'good' : 'bad'); });
          sfx(n === R.length ? 'win' : 'bad'); fb.innerHTML = `<div class="as-fbk ${n === R.length ? 'ok' : 'no'}"><span>${n === R.length ? '¡Orden perfecto!' : `${n} de ${R.length} en su lugar. El orden era: ${R.map((x, k) => `${k + 1}. ${esc(x.full)}`).join(' · ')}`}</span></div><button type="button" class="btn k m4o-nx">Continuar</button>`; fb.querySelector('.m4o-nx').onclick = () => { stopA(); done(n); }; } }));
      return { c, t: R.length };
    }
    return { board, podcast, control, blocks, duel, rocket, readParts, eco, bindEco, order };
  })();

  // Kids y Teens: su canción propia también termina con el karaoke
  // v630: une el resultado de dos partes de una misma sección (ej. canción + dictado): los errores siempre cuentan
  window.MRMERGE = (a, b) => { if (!b || typeof b !== 'object' || !(b.t > 0)) return a; if (!a || typeof a !== 'object' || !(a.t > 0)) return Object.assign({ skill: 'listening' }, b); return Object.assign({}, a, { c: (a.c || 0) + (b.c || 0), t: a.t + b.t, missed: [...(a.missed || []), ...(b.missed || [])] }); };
  const wrapMusic = () => { const G = window.MRAGE2; if (!G || !G.music || G.music.__m2) return; const om = G.music; G.music = async (st, p) => { let r = await om(st, p); if (on() && r !== null && r !== undefined && st.isConnected) { try { st.innerHTML = ''; const k = await karaoke(st, p); r = MRMERGE(r, k); } catch (e) { console.error(e); } } return r; }; G.music.__m2 = 1; };
  wrapMusic(); document.addEventListener('DOMContentLoaded', wrapMusic);
  window.M2X = { readParts: (st, p) => M4.readParts(st, p), mod, on, oral, game, gameFor, podBox, podWatch, hide, bindHint, karaoke, parseTime, timePool, fillPool, focusOf, theme };
})();
