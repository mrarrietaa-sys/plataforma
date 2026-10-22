/* =====================================================================
   🎯 OBJETIVO PERSONAL DEL ESTUDIANTE (viajar, trabajo, estudios, exterior, conversar)
   Capa extra: NO cambia temas, actividades ni diseño. Solo personaliza:
   · pregunta del objetivo · línea + tarjeta "Mi objetivo" en el perfil
   · "por qué te sirve" en cada clase (js/goalsdata.js) · objetivo + preguntas para el profe
   ===================================================================== */
(function () {
  const G = { // 3 objetivos (los antiguos «exterior» y «conversar» pasan a Viajar / Trabajo)
    v: { mi: 'plane', col: 'r', name: 'Viajar y vivir afuera', short: 'Viajar', desc: 'Aeropuerto, hotel, restaurantes y el día a día afuera', meta: 'viajar con confianza', ready: 'listo para tu viaje',
      q: ['Where would you like to travel? Why?', 'Have you ever lost your luggage or missed a flight?', 'What do you say at hotel check-in?', 'What is the best trip you have taken?', 'How do you order food in a restaurant abroad?', 'Which country would you like to live in? Why?'] },
    t: { mi: 'briefcase', col: 'b', name: 'Trabajo', short: 'Trabajo', desc: 'Entrevistas, reuniones, correos y clientes', meta: 'usar el inglés en tu trabajo', ready: 'listo para tu trabajo',
      q: ['What do you do for a living?', 'Tell me about your work experience.', 'How do you introduce yourself in a job interview?', 'What are your strengths at work?', 'How often do you use English at work?', 'Describe a typical day at your job.'] },
    e: { mi: 'grad', col: 'g', name: 'Estudios y exámenes', short: 'Estudios', desc: 'Universidad, becas y certificaciones', meta: 'lograr tu meta académica', ready: 'listo para tu meta académica',
      q: ['What would you like to study? Why?', 'Are you preparing for an English exam?', 'How do you usually study?', 'Describe a chart or a graph you saw recently.', 'What is your opinion about online learning?', 'Where would you like to study abroad?'] }
  };
  const ALIAS = { x: 'v', c: 't' };
  const icon = (k, cls) => `<span class="gl-ic ${G[k].col}${cls ? ' ' + cls : ''}">${window.MRI ? MRI(G[k].mi) : ''}</span>`;
  const MONTHS = [[1, '1 mes'], [3, '3 meses'], [6, '6 meses'], [0, 'Sin prisa']], MINS = [10, 20, 30];
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const P = () => window.MRAP;
  const valid = (g) => { if (!g) return null; if (ALIAS[g.k]) g = Object.assign({}, g, { k: ALIAS[g.k] }); return G[g.k] ? g : null; };
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
  function label(g) { g = valid(g); if (!g) return ''; const m = MONTHS.find(x => x[0] === +g.months); return `Tu meta: ${G[g.k].meta}${g.months ? ' en ' + m[1] : ''}`; }
  function lineHTML() { return ''; } // ya no se muestra en el encabezado (va en la tarjeta «Mi objetivo»)
  // tarjeta "Mi objetivo" del perfil · pct = avance del módulo actual
  function cardHTML(pct) {
    const g = get(); if (!g) return `<div class="gl-card gl-empty"><div class="gl-eh">${window.MRI ? `<span class="gl-ic r">${MRI('target')}</span>` : ''}<div><b>¿Para qué quieres aprender inglés?</b><small>Adaptamos la plataforma a tu meta</small></div></div><button class="btn k sm" data-goal>Elegir mi objetivo</button></div>`;
    const d = G[g.k], w = weeksLeft(g), mo = MONTHS.find(x => x[0] === +g.months), p = Math.round(Math.max(0, Math.min(100, pct || 0)));
    return `<div class="gl-card"><div class="gl-top">${icon(g.k)}<div class="gl-tt"><small>Mi objetivo</small><b>${esc(d.short)}</b></div><button class="gl-ch" data-goal aria-label="Cambiar mi objetivo">Cambiar</button></div>
      <div class="gl-meta"><span>${window.MRI ? MRI('calendar') : ''}${g.months ? 'Meta: ' + mo[1] : 'A tu ritmo'}</span><span>${window.MRI ? MRI('clock') : ''}${g.min} min al día</span></div>
      <div class="gl-prog"><div class="gl-bar"><i style="width:${Math.max(4, p)}%"></i></div><b>${p}%</b></div>
      <p class="gl-s">${esc(d.ready.charAt(0).toUpperCase() + d.ready.slice(1))}${w != null ? ` · ${w ? 'faltan ' + w + ' semana' + (w === 1 ? '' : 's') : '¡llegó tu fecha meta!'}` : ''}</p></div>`;
  }
  // ventana para elegir el objetivo
  function ask(opts) {
    opts = opts || {}; const cur = get() || { k: '', months: 3, min: 20 };
    return new Promise(res => {
      const st = { k: cur.k, months: cur.months == null ? 3 : +cur.months, min: +cur.min || 20 };
      const m = document.createElement('div'); m.className = 'modal gl-modal';
      m.innerHTML = `<div class="card"><h3>¿Para qué quieres aprender inglés?</h3><p class="muted">Así adaptamos la plataforma a ti. Puedes cambiarlo cuando quieras.</p>
        <div class="gl-opts">${Object.entries(G).map(([k, d]) => `<button type="button" class="gl-o${st.k === k ? ' on' : ''}" data-k="${k}">${icon(k)}<div><b>${esc(d.name)}</b><small>${esc(d.desc)}</small></div></button>`).join('')}</div>
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
  function why(m, n, g) { g = valid(g || get()); if (!g || !window.MRGOALWHY) return ''; const x = MRGOALWHY[(+m || 1) + '-' + n]; return x && x[g.k] ? { k: g.k, name: G[g.k].short, t: x[g.k] } : ''; }
  function whyHTML(m, n, g) { const w = why(m, n, g); return w ? `<div class="gl-why"><div><b>Para tu objetivo · ${esc(w.name)}</b><span>${esc(w.t)}</span></div></div>` : ''; }
  // para el profe: chip + 3 preguntas sugeridas
  function chip(g) { g = valid(g); return g ? `<span class="gl-chip">${esc(G[g.k].short)}${g.months ? ' · meta en ' + MONTHS.find(x => x[0] === +g.months)[1] : ''}</span>` : '<span class="muted">Aún no lo ha elegido</span>'; }
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
@media (max-width:600px){.gl-opts{grid-template-columns:1fr}.gl-card{padding:10px 12px}.gl-card p{font-size:12px}}
.gl-ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;flex:none}.gl-ic .mri{width:21px;height:21px}
.gl-ic.r{background:#fde8ea;color:#E3242B}.gl-ic.b{background:#e7efff;color:#1D5FD1}.gl-ic.g{background:#e6f7ee;color:#16A34A}
.gl-ic.sm{width:32px;height:32px;border-radius:10px}.gl-ic.sm .mri{width:17px;height:17px}
.gl-o{align-items:center}.gl-o .gl-ic{width:44px;height:44px}
.gl-opts{grid-template-columns:1fr!important}
.gl-card{background:#fff!important;border:1px solid #e3e9f3!important;border-radius:18px!important;padding:14px!important;box-shadow:0 6px 16px rgba(11,42,91,.06)}
.gl-top{display:flex;align-items:center;gap:10px}.gl-tt{flex:1;min-width:0}.gl-tt small{display:block;white-space:nowrap;font:700 10px Inter,sans-serif;letter-spacing:.8px;text-transform:uppercase;color:#8a96ab}.gl-tt b{display:block;font:800 15px Poppins,sans-serif;color:#0B2A5B;line-height:1.2}
.gl-ch{border:1.5px solid #e3e9f3!important;border-radius:20px!important;padding:4px 10px!important;font-size:12px!important;background:#fff!important}
.gl-meta{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}.gl-meta span{display:inline-flex;align-items:center;gap:5px;background:#f4f7fc;border-radius:20px;padding:4px 9px;font:600 12px Inter,sans-serif;color:#3e4e6a}.gl-meta .mri{width:13px;height:13px;color:#0B2A5B}
.gl-prog{display:flex;align-items:center;gap:10px;margin:12px 0 4px}.gl-prog .gl-bar{flex:1;height:9px!important;margin:0!important}.gl-prog b{font:800 14px Poppins,sans-serif;color:#E3242B;min-width:38px;text-align:right}
.gl-bar i{background:linear-gradient(90deg,#E3242B,#ff6b6b)!important}
.gl-s{margin:2px 0 0!important;font-size:12.5px!important;color:#5a6a86!important}
.gl-eh{display:flex;gap:10px;align-items:center}.gl-eh b{display:block;color:#0B2A5B;font:800 14px Poppins,sans-serif}.gl-eh small{color:#5a6a86;font-size:12px}
.gl-empty{gap:12px!important}
.db-side .gl-card{width:100%!important;max-width:none!important;box-sizing:border-box;grid-column:1/-1;align-self:stretch}
.gl-why{display:flex;gap:10px;align-items:flex-start;border-left:0!important;background:#fffbea!important;border:1px solid #fbe7a6!important}.gl-why b{display:block;color:#0B2A5B;font-size:13.5px;margin-bottom:2px}.gl-why span{color:#5b4500}
`;
  document.head.appendChild(css);
  window.MRGOAL = { G, get, save, ask, shouldAsk, label, lineHTML, cardHTML, why, whyHTML, chip, questions, weeksLeft };
})();
