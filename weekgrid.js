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
    st.textContent = `.wg2{display:grid;gap:10px}
.wg2-d{display:grid;grid-template-columns:160px 1fr;gap:10px;align-items:start;border:2px solid #e3e9f3;border-radius:14px;padding:12px;background:#fff}
.wg2-d.has{border-color:#0B2A5B}
.wg2-n{font:800 15px Poppins,sans-serif;color:#0B2A5B;padding-top:6px}.wg2-n small{display:block;font:600 11.5px Inter,sans-serif;color:#64748B;margin-top:2px}
.wg2-c{display:flex;flex-wrap:wrap;gap:6px;min-height:32px;align-items:center}
.wg2-chip{display:inline-flex;align-items:center;gap:6px;background:#0B2A5B;color:#fff;font:700 13px Inter,sans-serif;border-radius:20px;padding:5px 6px 5px 12px}
.wg2-chip button{border:0;background:rgba(255,255,255,.2);color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:12px;line-height:1}
.wg2-e{font:600 13px Inter,sans-serif;color:#94a3b8}
.wg2-a{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px;font:600 12.5px Inter,sans-serif;color:#475569}
.wg2-a input{border:2px solid #cbd5e1;border-radius:10px;padding:6px 8px;font:700 14px Inter,sans-serif;color:#0B2A5B;width:118px}
.wg2-a input:focus{outline:none;border-color:#0B2A5B}
.wg2-a button{border:0;background:#E3242B;color:#fff;font:800 13px Poppins,sans-serif;border-radius:10px;padding:8px 14px;cursor:pointer}
.wg2-m{font:600 12.5px Inter,sans-serif;margin-top:6px;min-height:0}.wg2-m.bad{color:#b91c1c}.wg2-m.ok{color:#15803d}
.wg-tools{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;align-items:center;font-size:13px;color:#4a5568}
.wg-tools button{border:2px solid #0B2A5B;background:#fff;color:#0B2A5B;border-radius:10px;padding:4px 10px;font:700 13px Inter,sans-serif;cursor:pointer}
.wg-sum{font-size:13px;color:#0B2A5B;margin-top:8px;font-weight:700}
@media (max-width:560px){.wg2-d{grid-template-columns:1fr}.wg2-n{padding-top:0}}`;
    document.head.appendChild(st);
  }
  function render(el, value, opts) {
    addCss(); opts = opts || {};
    const v = {}; DAYS.forEach(([d]) => { v[d] = []; ((value && value[d]) || []).forEach((t) => { if (/^\d{2}:\d{2}$/.test(t) && fits(d, t) && !clash(v[d], t)) v[d].push(t); }); v[d].sort(); });
    el.innerHTML = `<div class="wg-tools"><span>Escribe la hora en que <b>empieza</b> cada clase (hora Colombia). Cada clase dura <b>50 minutos</b>. Para agregar varias seguidas, llena también «hasta».</span><button type="button" data-a="wk">Copiar el lunes a Mar–Vie</button><button type="button" data-a="clr">Borrar todo</button></div>
      <div class="wg2">${DAYS.map(([d, , l]) => `<div class="wg2-d" data-day="${d}"><div class="wg2-n">${l}<small>${d === '6' ? '7:00 a. m. – 5:00 p. m.' : '7:00 a. m. – 9:00 p. m.'}</small></div><div><div class="wg2-c"></div>
        <div class="wg2-a"><span>Desde</span><input type="time" step="300" min="07:00" max="${hm(close(d) - DUR)}" data-f="from" aria-label="${l}: hora de inicio"><span>hasta <i style="font-style:normal;color:#94a3b8">(opcional)</i></span><input type="time" step="300" min="07:50" max="${hm(close(d))}" data-f="to" aria-label="${l}: hasta"><button type="button" data-add="${d}">Agregar</button></div><div class="wg2-m"></div></div></div>`).join('')}</div><div class="wg-sum"></div>`;
    const dayEl = (d) => el.querySelector(`.wg2-d[data-day="${d}"]`);
    const msg = (d, t, bad) => { const m = dayEl(d).querySelector('.wg2-m'); m.textContent = t || ''; m.className = 'wg2-m' + (t ? (bad ? ' bad' : ' ok') : ''); };
    const paint = (d) => { const box = dayEl(d); box.classList.toggle('has', v[d].length > 0);
      box.querySelector('.wg2-c').innerHTML = v[d].length ? v[d].map((t) => `<span class="wg2-chip">${h12(t)} – ${h12(hm(mins(t) + DUR))}<button type="button" data-rm="${t}" aria-label="Quitar ${h12(t)}">✕</button></span>`).join('') : '<span class="wg2-e">Sin clases este día</span>';
      box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { v[d] = v[d].filter((x) => x !== b.dataset.rm); paint(d); msg(d, ''); sum(); }); };
    const sum = () => { const n = DAYS.reduce((a, [d]) => a + v[d].length, 0); el.querySelector('.wg-sum').textContent = n ? `✅ ${n} clase${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''} por semana` : 'Aún no agregas ninguna hora.'; opts.onChange && opts.onChange(get()); };
    el.querySelectorAll('[data-add]').forEach((b) => b.onclick = () => {
      const d = b.dataset.add, box = dayEl(d), f = box.querySelector('[data-f=from]').value, to = box.querySelector('[data-f=to]').value;
      if (!/^\d{2}:\d{2}$/.test(f)) return msg(d, 'Escribe la hora de inicio.', true);
      if (!fits(d, f)) return msg(d, `Fuera del horario: la clase de 50 min debe empezar desde las 7:00 a. m. y terminar antes de las ${d === '6' ? '5:00 p. m.' : '9:00 p. m.'}`, true);
      const want = []; if (to && mins(to) > mins(f)) { for (let m = mins(f); m + DUR <= mins(to) && m + DUR <= close(d); m += DUR) want.push(hm(m)); if (!want.length) return msg(d, 'En ese rango no cabe una clase de 50 minutos.', true); } else want.push(f);
      let add = 0, skip = 0; want.forEach((t) => { if (clash(v[d], t)) skip++; else { v[d].push(t); add++; } }); v[d].sort();
      paint(d); sum(); box.querySelector('[data-f=from]').value = ''; box.querySelector('[data-f=to]').value = '';
      msg(d, add ? `Agregada${add > 1 ? 's' : ''} ${add} clase${add > 1 ? 's' : ''}${skip ? ` · ${skip} no se agregó porque se cruza con otra clase` : ''}.` : 'Esa hora se cruza con una clase que ya tienes (cada clase dura 50 min).', !add);
    });
    el.querySelector('[data-a=wk]').onclick = () => { ['2', '3', '4', '5'].forEach((d) => { v[d] = v['1'].slice(); paint(d); msg(d, ''); }); sum(); };
    el.querySelector('[data-a=clr]').onclick = () => { if (!confirm('¿Borrar todas las horas de la semana?')) return; DAYS.forEach(([d]) => { v[d] = []; paint(d); msg(d, ''); }); sum(); };
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
