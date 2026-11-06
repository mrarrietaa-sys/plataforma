/* =====================================================================
   DISPONIBILIDAD SEMANAL (lunes a sábado) con horas libres: 11:10, 12:45…
   MRWG.render(el, value, opts) → { get(), count() }
   value = { "1": ["07:00", "11:10"], ..., "6": [...] }  (1 = lunes … 6 = sábado)
   Cada hora es el INICIO de una clase de 50 min. No se permiten clases que se crucen.
   ===================================================================== */
(function () {
  const DAYS = [['1', 'Lun', 'Lunes'], ['2', 'Mar', 'Martes'], ['3', 'Mié', 'Miércoles'], ['4', 'Jue', 'Jueves'], ['5', 'Vie', 'Viernes'], ['6', 'Sáb', 'Sábado']];
  const HOURS = []; for (let h = 7; h <= 20; h++) HOURS.push((h < 10 ? '0' : '') + h + ':00'); // compatibilidad
  const DUR = 50, OPEN = 7 * 60, CLOSE = { wk: 21 * 60, sat: 17 * 60 };
  const mins = (t) => { const p = String(t).split(':').map(Number); return p[0] * 60 + (p[1] || 0); };
  const hm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const h12 = (t) => { const m = mins(t), h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (h < 12 ? ' a. m.' : ' p. m.'); };
  const close = (d) => d === '6' ? CLOSE.sat : CLOSE.wk;
  const fits = (d, t) => { const m = mins(t); return m >= OPEN && m + DUR <= close(d); };
  const clash = (list, t) => list.some((x) => Math.abs(mins(x) - mins(t)) < DUR);
  let css = false;
  function addCss() {
    if (css) return; css = true; const st = document.createElement('style');
    st.textContent = `.wg3{display:grid;gap:8px}@media(min-width:900px){.wg3{grid-template-columns:1fr 1fr}}
.wg3-d{border:1.5px solid #e2e8f0;border-radius:16px;padding:10px 12px;background:#fff}
.wg3-d.has{border-color:#c7d6ee}
.wg3-h{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.wg3-h b{font:800 15px Poppins,sans-serif;color:#0B2A5B}.wg3-h small{display:block;font:600 11.5px Inter,sans-serif;color:#94a3b8;margin-top:1px}
.wg3-add{border:1.5px dashed #0B2A5B;background:#fff;color:#0B2A5B;border-radius:10px;padding:5px 11px;font:800 12.5px Poppins,sans-serif;white-space:nowrap;cursor:pointer}.wg3-add:hover{background:#F1F5FB}
.wg3-c{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.wg3-chip{display:inline-flex;align-items:center;gap:6px;background:#E8EFFA;color:#0B2A5B;border-radius:999px;padding:4px 5px 4px 11px;font:800 13px Poppins,sans-serif}
.wg3-chip button{border:0;width:20px;height:20px;border-radius:50%;background:#fff;color:#64748b;font-size:11px;cursor:pointer;line-height:1}.wg3-chip button:hover{color:#E3242B}
.wg3-e{font:600 12.5px Inter,sans-serif;color:#94a3b8;margin-top:6px}
.wg3-pk{margin-top:10px;border:1.5px solid #0B2A5B;border-radius:14px;padding:10px;background:#F8FAFF}
.wg3-pk p{margin:0 0 8px;font:700 12.5px Inter,sans-serif;color:#475569}
.wg3-tp{display:flex;align-items:center;gap:6px}
.wg3-sel{position:relative;flex:1;border:1.5px solid #0B2A5B;border-radius:11px;background:#fff;text-align:center;padding:4px}
.wg3-sel small{display:block;font:700 9px Inter,sans-serif;color:#64748b;letter-spacing:.05em}
.wg3-hb{display:block;width:100%;border:0;background:transparent;font:800 19px Poppins,sans-serif;color:#0B2A5B;cursor:pointer;padding:0;line-height:1.25}
.wg3-sel input{border:0;background:transparent;width:100%;text-align:center;font:800 19px Poppins,sans-serif;color:#0B2A5B;outline:none;padding:0;line-height:1.25}
.wg3-col{font:800 19px Poppins,sans-serif;color:#0B2A5B}
.wg3-ap{display:grid;gap:4px}.wg3-ap button{border:1.5px solid #dbe3ef;border-radius:9px;padding:3px 9px;font:700 11.5px Poppins,sans-serif;background:#fff;color:#0B2A5B;cursor:pointer}.wg3-ap button.on{background:#0B2A5B;color:#fff;border-color:#0B2A5B}
.wg3-pop{position:absolute;z-index:20;top:calc(100% + 6px);left:0;width:180px;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;background:#fff;border:1px solid #dbe3ef;border-radius:14px;padding:8px;box-shadow:0 14px 32px rgba(11,42,91,.18)}
.wg3-pop[hidden]{display:none}.wg3-pop button{border:1.5px solid #e2e8f0;background:#fff;border-radius:9px;padding:6px 0;font:800 14px Poppins,sans-serif;color:#0B2A5B;cursor:pointer}.wg3-pop button.on{background:#0B2A5B;color:#fff;border-color:#0B2A5B}
.wg3-pb{display:flex;gap:8px;justify-content:center;margin-top:10px}
.wg3-ok{background:#0B2A5B;color:#fff;border:0;border-radius:10px;padding:7px 18px;font:800 13px Poppins,sans-serif;cursor:pointer}.wg3-no{background:#fff;border:1.5px solid #dbe3ef;border-radius:10px;padding:7px 14px;font:700 13px Poppins,sans-serif;color:#475569;cursor:pointer}
.wg3-hint{font:600 11.5px Inter,sans-serif;color:#64748b;margin:8px 0 0;text-align:center}.wg3-hint.bad{color:#b91c1c}
.wg3-intro{font:600 13px Inter,sans-serif;color:#64748b;margin:0 0 10px;line-height:1.45}
.wg3-note{background:#FFF7E0;border-radius:12px;padding:8px 10px;font:600 12px Inter,sans-serif;color:#8a5a00;margin-bottom:10px;line-height:1.45}
.wg3-sum{font:700 13px Inter,sans-serif;color:#0B2A5B;text-align:center;margin-top:10px}
.wg3-tools{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:6px}.wg3-tools button{border:0;background:none;font:700 12.5px Inter,sans-serif;color:#0B2A5B;text-decoration:underline;cursor:pointer;padding:2px}.wg3-tools button.rm{color:#94a3b8}`;
    document.head.appendChild(st);
  }
  const ap12 = (m) => ({ h: (Math.floor(m / 60) + 11) % 12 + 1, mm: m % 60, p: Math.floor(m / 60) >= 12 ? 'p' : 'a' });
  function nextHoliday() { try { if (!window.MRFEST) return ''; const d = new Date(); for (let k = 1; k <= 120; k++) { d.setDate(d.getDate() + 1); const s = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); if (MRFEST.name(s) && d.getDay() !== 0) return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '') + ' (' + MRFEST.name(s) + ')'; } } catch (e) { } return ''; }
  function render(el, value, opts) {
    addCss(); opts = opts || {};
    const v = {}; DAYS.forEach(([d]) => { v[d] = []; ((value && value[d]) || []).forEach((t) => { if (/^\d{2}:\d{2}$/.test(t) && fits(d, t) && !clash(v[d], t)) v[d].push(t); }); v[d].sort(); });
    const nh = nextHoliday();
    el.innerHTML = `<p class="wg3-intro">Agrega la hora exacta en que puedes <b>empezar</b> cada clase (por ejemplo 8:05 a. m.), en hora Colombia. Cada clase dura <b>50 minutos</b>. Estas horas se repiten cada semana y los estudiantes reservan ahí.</p>
      <div class="wg3-note">Domingos y festivos no hay clases: la plataforma no publica tus horas esos días.${nh ? `<br>Próximo festivo: ${nh}.` : ''}</div>
      <div class="wg3">${DAYS.map(([d, , l]) => `<div class="wg3-d" data-day="${d}"><div class="wg3-h"><div><b>${l}</b><small>Clases entre 7:00 a. m. y ${h12(hm(close(d) - DUR))}</small></div><button type="button" class="wg3-add" data-add="${d}">+ Agregar hora</button></div><div class="wg3-c"></div><div class="wg3-pw"></div></div>`).join('')}</div>
      <div class="wg3-sum"></div><div class="wg3-tools"><button type="button" data-a="wk">Copiar las horas del lunes a toda la semana</button><button type="button" class="rm" data-a="clr">Borrar todo</button></div>`;
    const dayEl = (d) => el.querySelector(`.wg3-d[data-day="${d}"]`);
    const paint = (d) => { const box = dayEl(d); box.classList.toggle('has', v[d].length > 0);
      box.querySelector('.wg3-c').outerHTML = v[d].length ? `<div class="wg3-c">${v[d].map((t) => `<span class="wg3-chip">${h12(t)}<button type="button" data-rm="${t}" aria-label="Quitar ${h12(t)}">✕</button></span>`).join('')}</div>` : '<div class="wg3-c"><span class="wg3-e">Sin horas este día</span></div>';
      box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { v[d] = v[d].filter((x) => x !== b.dataset.rm); paint(d); sum(); }); };
    const sum = () => { const n = DAYS.reduce((a, [d]) => a + v[d].length, 0); el.querySelector('.wg3-sum').textContent = n ? `${n} clase${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''} por semana` : 'Aún no agregas ninguna hora.'; opts.onChange && opts.onChange(get()); };
    const closePk = () => el.querySelectorAll('.wg3-pw').forEach((w) => w.innerHTML = '');
    const openPk = (d) => { closePk(); const w = dayEl(d).querySelector('.wg3-pw'); const last = v[d].length ? mins(v[d][v[d].length - 1]) + DUR : 8 * 60; const st = ap12(fits(d, hm(last)) ? last : 8 * 60); let H = st.h, P = st.p;
      w.innerHTML = `<div class="wg3-pk"><p>¿A qué hora estás disponible?</p><div class="wg3-tp"><div class="wg3-sel"><button type="button" class="wg3-hb">${H}</button><small>HORA</small><div class="wg3-pop" hidden>${[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => `<button type="button" data-hv="${n}" class="${n === H ? 'on' : ''}">${n}</button>`).join('')}</div></div><span class="wg3-col">:</span><label class="wg3-sel"><input inputmode="numeric" maxlength="2" autocomplete="off" value="${String(st.mm).padStart(2, '0')}" aria-label="Minutos"><small>MINUTOS</small></label><div class="wg3-ap"><button type="button" data-p="a" class="${P === 'a' ? 'on' : ''}">a. m.</button><button type="button" data-p="p" class="${P === 'p' ? 'on' : ''}">p. m.</button></div></div>
        <div class="wg3-pb"><button type="button" class="wg3-no">Cancelar</button><button type="button" class="wg3-ok">Agregar</button></div><p class="wg3-hint"></p></div>`;
      const hb = w.querySelector('.wg3-hb'), pop = w.querySelector('.wg3-pop'), mi = w.querySelector('input'), hint = w.querySelector('.wg3-hint');
      const cur = () => { let h = H % 12; if (P === 'p') h += 12; return hm(h * 60 + Math.min(59, +mi.value || 0)); };
      const upd = () => { const t = cur(); if (!fits(d, t)) { hint.className = 'wg3-hint bad'; hint.textContent = `Fuera de la jornada: la clase debe empezar entre las 7:00 a. m. y las ${h12(hm(close(d) - DUR))}`; } else if (clash(v[d], t)) { hint.className = 'wg3-hint bad'; hint.textContent = 'Se cruza con otra clase que ya tienes (cada clase dura 50 minutos).'; } else { hint.className = 'wg3-hint'; hint.textContent = `Cada clase dura 50 minutos · termina a las ${h12(hm(mins(t) + DUR))}`; } };
      hb.onclick = (e) => { e.stopPropagation(); pop.hidden = !pop.hidden; };
      pop.querySelectorAll('[data-hv]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); H = +b.dataset.hv; hb.textContent = H; pop.querySelectorAll('[data-hv]').forEach((y) => y.classList.toggle('on', y === b)); pop.hidden = true; mi.focus(); mi.select(); upd(); });
      w.onclick = (e) => { if (!pop.hidden && !e.target.closest('.wg3-sel')) pop.hidden = true; };
      mi.onfocus = () => mi.select(); mi.oninput = () => { mi.value = mi.value.replace(/\D/g, '').slice(0, 2); if (+mi.value > 59) mi.value = '59'; upd(); }; mi.onblur = () => { mi.value = String(Math.min(59, +mi.value || 0)).padStart(2, '0'); };
      w.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => { P = b.dataset.p; w.querySelectorAll('[data-p]').forEach((y) => y.classList.toggle('on', y === b)); upd(); });
      w.querySelector('.wg3-no').onclick = closePk;
      const add = () => { const t = cur(); if (!fits(d, t) || clash(v[d], t)) { upd(); return; } v[d].push(t); v[d].sort(); paint(d); sum(); closePk(); };
      w.querySelector('.wg3-ok').onclick = add; mi.onkeydown = (e) => { if (e.key === 'Enter') add(); };
      upd(); };
    el.querySelectorAll('[data-add]').forEach((b) => b.onclick = () => openPk(b.dataset.add));
    el.querySelector('[data-a=wk]').onclick = () => { if (!v['1'].length) { const sm = el.querySelector('.wg3-sum'); sm.textContent = 'Primero agrega las horas del lunes.'; sm.style.color = '#b91c1c'; setTimeout(() => { sm.style.color = ''; sum(); }, 2500); return; } ['2', '3', '4', '5', '6'].forEach((d) => { v[d] = v['1'].filter((t) => fits(d, t)); paint(d); }); sum(); };
    el.querySelector('[data-a=clr]').onclick = () => { if (!confirm('¿Borrar todas las horas de la semana?')) return; DAYS.forEach(([d]) => { v[d] = []; paint(d); }); closePk(); sum(); };
    function get() { const o = {}; DAYS.forEach(([d]) => { if (v[d].length) o[d] = v[d].slice().sort(); }); return o; }
    DAYS.forEach(([d]) => paint(d)); sum();
    return { get, count: () => DAYS.reduce((a, [d]) => a + v[d].length, 0) };
  }
  // resumen de texto: "Lun 7:00 a. m.–9:30 a. m., 11:10 a. m.–12:00 p. m.; Mar …"
  function summary(w) {
    return DAYS.filter(([d]) => w && w[d] && w[d].length).map(([d, s]) => {
      const L = w[d].slice().sort().map(mins); const rs = []; let a = L[0], b = L[0];
      for (let i = 1; i <= L.length; i++) { if (L[i] !== undefined && L[i] - b <= 60) b = L[i]; else { rs.push(h12(hm(a)) + '–' + h12(hm(b + DUR))); a = b = L[i]; } }
      return s + ' ' + rs.join(', ');
    }).join('; ');
  }
  window.MRWG = { render, summary, DAYS, HOURS };
})();
