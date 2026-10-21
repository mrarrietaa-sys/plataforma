/* =====================================================================
   🎯 OBJETIVO PERSONAL DEL ESTUDIANTE (viajar, trabajo, estudios, exterior, conversar)
   Capa extra: NO cambia temas, actividades ni diseño. Solo personaliza:
   · pregunta del objetivo · línea + tarjeta "Mi objetivo" en el perfil
   · "por qué te sirve" en cada clase (js/goalsdata.js) · objetivo + preguntas para el profe
   ===================================================================== */
(function () {
  const G = {
    v: { ic: '✈️', name: 'Viajar', desc: 'Aeropuerto, hotel, restaurantes', meta: 'viajar con confianza', ready: 'listo para tu viaje',
      q: ['Where would you like to travel? Why?', 'Have you ever lost your luggage or missed a flight?', 'What do you say at hotel check-in?', 'What is the best trip you have taken?', 'How do you order food in a restaurant abroad?', 'What do you always pack for a trip?'] },
    t: { ic: '💼', name: 'Trabajo', desc: 'Entrevistas, reuniones, correos', meta: 'usar el inglés en tu trabajo', ready: 'listo para tu trabajo',
      q: ['What do you do for a living?', 'Tell me about your work experience.', 'How do you introduce yourself in a job interview?', 'What are your strengths at work?', 'How often do you use English at work?', 'Describe a typical day at your job.'] },
    e: { ic: '🎓', name: 'Estudios y exámenes', desc: 'Universidad, becas, certificaciones', meta: 'lograr tu meta académica', ready: 'listo para tu meta académica',
      q: ['What would you like to study? Why?', 'Are you preparing for an English exam?', 'How do you usually study?', 'Describe a chart or a graph you saw recently.', 'What is your opinion about online learning?', 'Where would you like to study abroad?'] },
    x: { ic: '🌎', name: 'Vivir en el exterior', desc: 'Trámites, vecinos, día a día', meta: 'vivir en el exterior', ready: 'listo para vivir afuera',
      q: ['Which country would you like to live in? Why?', 'What do you think will be the hardest part?', 'How do you introduce yourself to a new neighbor?', 'How would you rent an apartment?', 'What would you miss most about home?', 'How do you make an appointment at the doctor?'] },
    c: { ic: '💬', name: 'Conversar y crecer', desc: 'Series, amigos, superación personal', meta: 'conversar con fluidez', ready: 'listo para conversar',
      q: ['What series or movies do you like to watch?', 'What do you like to do in your free time?', 'Tell me about your best friend.', 'What is a goal you have this year?', 'What music do you listen to?', 'What makes you happy?'] }
  };
  const MONTHS = [[1, '1 mes'], [3, '3 meses'], [6, '6 meses'], [0, 'Sin prisa']], MINS = [10, 20, 30];
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = () => window.MRAP;
  const valid = (g) => g && G[g.k] ? g : null;
  function get() { const p = P() && P().get(); return valid(p && p.goal); }
  function save(g) {
    const p = P() && P().get(); if (!p) return; p.goal = g; P().save(p);
    try { if (window.MRAC && MRAC.call && MRAC.code && MRAC.code()) MRAC.call('goalSet', { code: MRAC.code(), k: g.k, months: g.months, min: g.min }).catch(() => { }); } catch (e) { }
  }
  const SKIP = 'mra_goal_skip';
  function skipped() { try { return Date.now() - (+localStorage.getItem(SKIP) || 0) < 3 * 864e5; } catch (e) { return false; } }
  // semanas que faltan para la fecha meta (null = sin fecha)
  function weeksLeft(g) {
    if (!g || !g.months || !g.set) return null; const end = new Date(g.set + 'T12:00:00'); end.setMonth(end.getMonth() + g.months);
    return Math.max(0, Math.round((end - Date.now()) / (7 * 864e5)));
  }
  function label(g) { g = valid(g); if (!g) return ''; const m = MONTHS.find(x => x[0] === +g.months); return `${G[g.k].ic} Tu meta: ${G[g.k].meta}${g.months ? ' en ' + m[1] : ''}`; }
  function lineHTML() { const g = get(); return g ? `<span class="gl-line">${esc(label(g))}</span>` : ''; }
  // tarjeta "Mi objetivo" del perfil · pct = avance del módulo actual
  function cardHTML(pct) {
    const g = get(); if (!g) return `<div class="gl-card gl-empty"><b>🎯 ¿Para qué quieres aprender inglés?</b><button class="btn w sm" data-goal>Elegir mi objetivo</button></div>`;
    const d = G[g.k], w = weeksLeft(g), mo = MONTHS.find(x => x[0] === +g.months);
    return `<div class="gl-card"><div class="gl-h"><b>🎯 Mi objetivo</b><button class="gl-ch" data-goal>Cambiar</button></div>
      <p><b class="gl-k">${d.ic} ${esc(d.name)}</b> · ${g.months ? 'meta en ' + mo[1] : 'a tu ritmo'} · ${g.min} min al día</p>
      <div class="gl-bar"><i style="width:${Math.max(3, Math.min(100, pct || 0))}%"></i></div>
      <p class="gl-s">${Math.round(pct || 0)} % ${esc(d.ready)}${w != null ? ` · ${w ? 'te faltan ' + w + ' semana' + (w === 1 ? '' : 's') : '¡llegó tu fecha meta!'}` : ''}</p></div>`;
  }
  // ventana para elegir el objetivo
  function ask(opts) {
    opts = opts || {}; const cur = get() || { k: '', months: 3, min: 20 };
    return new Promise(res => {
      const st = { k: cur.k, months: cur.months == null ? 3 : +cur.months, min: +cur.min || 20 };
      const m = document.createElement('div'); m.className = 'modal gl-modal';
      m.innerHTML = `<div class="card"><h3>¿Para qué quieres aprender inglés? 🎯</h3><p class="muted">Así adaptamos la plataforma a ti. Puedes cambiarlo cuando quieras.</p>
        <div class="gl-opts">${Object.entries(G).map(([k, d]) => `<button type="button" class="gl-o${st.k === k ? ' on' : ''}" data-k="${k}"><span>${d.ic}</span><div><b>${esc(d.name)}</b><small>${esc(d.desc)}</small></div></button>`).join('')}</div>
        <p class="gl-q">¿Tienes una fecha meta? <small>(opcional)</small></p><div class="gl-chips" data-f="months">${MONTHS.map(([v, t]) => `<button type="button" class="gl-c${st.months === v ? ' on' : ''}" data-v="${v}">${t}</button>`).join('')}</div>
        <p class="gl-q">¿Cuánto tiempo al día?</p><div class="gl-chips" data-f="min">${MINS.map(v => `<button type="button" class="gl-c${st.min === v ? ' on' : ''}" data-v="${v}">${v} min</button>`).join('')}</div>
        <div class="gl-act"><button class="btn k" id="gl-ok" ${st.k ? '' : 'disabled'}>Guardar mi objetivo</button>${opts.noSkip ? '' : '<button class="btn w sm" id="gl-no">Ahora no</button>'}</div></div>`;
      document.body.appendChild(m);
      const ok = m.querySelector('#gl-ok');
      m.querySelectorAll('.gl-o').forEach(b => b.onclick = () => { st.k = b.dataset.k; m.querySelectorAll('.gl-o').forEach(x => x.classList.toggle('on', x === b)); ok.disabled = false; });
      m.querySelectorAll('.gl-chips').forEach(g => g.querySelectorAll('.gl-c').forEach(b => b.onclick = () => { st[g.dataset.f] = +b.dataset.v; g.querySelectorAll('.gl-c').forEach(x => x.classList.toggle('on', x === b)); }));
      ok.onclick = () => { const prev = get(); const g = { k: st.k, months: st.months, min: st.min, set: prev && prev.k === st.k && prev.months === st.months && prev.set ? prev.set : new Date().toISOString().slice(0, 10) }; save(g); m.remove(); res(g); };
      const no = m.querySelector('#gl-no'); if (no) no.onclick = () => { try { localStorage.setItem(SKIP, Date.now()); } catch (e) { } m.remove(); res(null); };
    });
  }
  // ¿mostrar la pregunta? solo estudiantes, sin objetivo y sin haber dicho "Ahora no" hace poco
  function shouldAsk() { const p = P() && P().get(); return !!p && p.type !== 'staff' && !get() && !skipped(); }
  // "por qué te sirve" para un tema (módulo m, tema n)
  function why(m, n, g) { g = valid(g || get()); if (!g || !window.MRGOALWHY) return ''; const x = MRGOALWHY[(+m || 1) + '-' + n]; return x && x[g.k] ? { ic: G[g.k].ic, name: G[g.k].name, t: x[g.k] } : ''; }
  function whyHTML(m, n, g) { const w = why(m, n, g); return w ? `<div class="gl-why">${w.ic} <b>Para tu objetivo (${esc(w.name)}):</b> ${esc(w.t)}</div>` : ''; }
  // para el profe: chip + 3 preguntas sugeridas
  function chip(g) { g = valid(g); return g ? `<span class="gl-chip">${G[g.k].ic} ${esc(G[g.k].name)}${g.months ? ' · meta en ' + MONTHS.find(x => x[0] === +g.months)[1] : ''}</span>` : '<span class="muted">Aún no lo ha elegido</span>'; }
  function questions(g, seed) { g = valid(g); if (!g) return []; const q = G[g.k].q, s = Math.abs(+seed || 0) % q.length; return [0, 1, 2].map(i => q[(s + i * 2) % q.length]); }
  // estilos
  const css = document.createElement('style'); css.textContent = `
.gl-line{display:inline-flex;gap:6px;align-items:center;background:#fff5f5;border:1.5px solid #fde0e2;color:#0B2A5B;font:700 12.5px Inter,sans-serif;border-radius:20px;padding:4px 10px;margin-top:6px;max-width:100%}
.gl-card{margin-top:12px;border:1px solid #e3e9f3;border-radius:16px;padding:12px 14px;text-align:left;background:#f9fbff}
.gl-card p{margin:3px 0;font-size:12.5px;color:#5a6a86;line-height:1.35}.gl-k{color:#0B2A5B}
.gl-h{display:flex;justify-content:space-between;align-items:center;font:800 14px Poppins,sans-serif;color:#0B2A5B}
.gl-ch{border:0;background:none;color:#E3242B;font:700 12.5px Inter,sans-serif;cursor:pointer;padding:2px 4px}
.gl-bar{height:7px;background:#e8edf5;border-radius:6px;overflow:hidden;margin:8px 0 4px}.gl-bar i{display:block;height:100%;background:#E3242B;border-radius:6px}
.gl-empty{display:grid;gap:8px;justify-items:start;font-size:13.5px;color:#0B2A5B}
.gl-modal .card{max-width:560px!important}.gl-modal h3{margin:0 0 4px}
.gl-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.gl-o{border:2px solid #e3e9f3;border-radius:16px;padding:10px 12px;display:flex;gap:10px;align-items:center;background:#fff;cursor:pointer;text-align:left;font-family:inherit}
.gl-o span{font-size:24px}.gl-o b{display:block;color:#0B2A5B;font:700 14px Inter,sans-serif}.gl-o small{color:#5a6a86;font-size:12px}
.gl-o.on{border-color:#E3242B;background:#fff5f5;box-shadow:0 0 0 3px #fde8ea}
.gl-q{font:700 14px Inter,sans-serif;color:#0B2A5B;margin:14px 0 6px}.gl-q small{color:#5a6a86;font-weight:500}
.gl-chips{display:flex;gap:8px;flex-wrap:wrap}.gl-c{border:1.5px solid #d7dfeb;border-radius:20px;padding:6px 12px;font:600 13px Inter,sans-serif;color:#0B2A5B;background:#fff;cursor:pointer}
.gl-c.on{background:#0B2A5B;color:#fff;border-color:#0B2A5B}
.gl-act{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}
.gl-why{border-left:5px solid #FFD23F;background:#fffbea;border-radius:12px;padding:10px 14px;font-size:14px;color:#5b4500;margin:0 0 12px;text-align:left;line-height:1.45}
.gl-chip{display:inline-block;background:#fde8ea;color:#E3242B;font:700 12.5px Inter,sans-serif;border-radius:20px;padding:4px 10px}
.gl-qs{display:grid;gap:6px;margin-top:6px}.gl-qs div{background:#f6f9ff;border-radius:10px;padding:8px 10px;font-size:13.5px;color:#0B2A5B}
@media (max-width:600px){.gl-opts{grid-template-columns:1fr}.gl-card{padding:10px 12px}.gl-card p{font-size:12px}}`;
  document.head.appendChild(css);
  window.MRGOAL = { G, get, save, ask, shouldAsk, label, lineHTML, cardHTML, why, whyHTML, chip, questions, weeksLeft };
})();
