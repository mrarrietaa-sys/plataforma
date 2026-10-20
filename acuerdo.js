/* =====================================================================
   📄 ACUERDO DE SERVICIO del estudiante (Premium / Plataforma)
   · se acepta UNA vez por versión y por plan → descarga PDF + correo (copia a administración)
   · después queda en "Mi cuenta → Mi acuerdo" solo para leer y descargar copia
   ===================================================================== */
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (t) => (window.M1 && M1.toast ? M1.toast(t) : alert(t));
  let A = null;
  const md = (t) => { const inl = (x) => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); let o = '', ul = false; String(t || '').split(/\n/).forEach((l) => { const v = l.trim(); if (/^- /.test(v)) { if (!ul) { o += '<ul>'; ul = true; } o += '<li>' + inl(v.slice(2)) + '</li>'; return; } if (ul) { o += '</ul>'; ul = false; } if (!v) return; o += /^# /.test(v) ? '<h2>' + inl(v.slice(2)) + '</h2>' : /^## /.test(v) ? '<h4>' + inl(v.slice(3)) + '</h4>' : '<p>' + inl(v) + '</p>'; }); return o + (ul ? '</ul>' : ''); };
  const h12 = (hm) => { const [h, m] = String(hm).split(':').map(Number); return ((h % 12) || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' a. m.' : ' p. m.'); };
  const fmtAcc = (d) => { const x = String(d || ''); const dd = new Date(x.slice(0, 10) + 'T12:00:00'); return dd.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) + (x.length > 15 ? ' · ' + h12(x.slice(11, 16)) : ''); };
  const lib = () => new Promise((ok) => { if (window.jspdf) return ok(window.jspdf); const a = document.createElement('script'); a.src = 'js/jspdf.min.js'; a.onload = () => ok(window.jspdf); a.onerror = () => { const b = document.createElement('script'); b.src = 'jspdf.min.js'; b.onload = () => ok(window.jspdf); b.onerror = () => ok(null); document.head.appendChild(b); }; document.head.appendChild(a); });
  async function pdf(c) {
    const L = await lib(); if (!L) { toast('No se pudo generar el PDF. Inténtalo de nuevo.'); return; }
    const d = new L.jsPDF({ unit: 'pt', format: 'letter' }); const W = 612, M = 54, CW = W - 2 * M; let y = 60;
    const need = (hh) => { if (y + hh > 740) { d.addPage(); y = 60; } }; const plain = (x) => String(x).replace(/\*\*(.+?)\*\*/g, '$1');
    try { const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = 'mra-brand.png'; }); const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; cv.getContext('2d').drawImage(im, 0, 0); const hh = 90 * im.height / im.width; d.addImage(cv.toDataURL('image/png'), 'PNG', M, 30, 90, hh); y = 30 + hh + 14; } catch (e) { }
    d.setDrawColor(227, 36, 43); d.setLineWidth(2); d.line(M, y, W - M, y); y += 22;
    String(c.text).split(/\n/).forEach((l) => { const v = l.trim(); if (!v) { y += 4; return; }
      if (/^# /.test(v)) { d.setFont('helvetica', 'bold'); d.setFontSize(14); d.setTextColor(11, 42, 91); need(24); d.text(plain(v.slice(2)), W / 2, y, { align: 'center' }); y += 16; d.setFontSize(8.5); d.setFont('helvetica', 'normal'); d.setTextColor(110); d.text('Versión ' + c.version, W / 2, y, { align: 'center' }); y += 18; return; }
      if (/^## /.test(v)) { d.setFont('helvetica', 'bold'); d.setFontSize(10.5); d.setTextColor(11, 42, 91); need(22); y += 4; d.text(plain(v.slice(3)), M, y); y += 14; return; }
      const bul = /^- /.test(v); d.setFont('helvetica', 'normal'); d.setFontSize(10); d.setTextColor(25);
      d.splitTextToSize(plain(bul ? v.slice(2) : v), CW - (bul ? 14 : 0)).forEach((ln, i) => { need(14); if (bul && !i) d.text('•', M + 2, y); d.text(ln, M + (bul ? 14 : 0), y); y += 13.5; }); y += 3; });
    need(80); y += 10; d.setDrawColor(11, 42, 91); d.setLineWidth(1.5); d.roundedRect(M, y, CW, 60, 8, 8); d.setFont('helvetica', 'bold'); d.setFontSize(10.5); d.setTextColor(11, 42, 91); d.text('CONSTANCIA DE ACEPTACIÓN ELECTRÓNICA', M + 12, y + 18);
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); d.setTextColor(25); d.text('Leído y aceptado por ' + String(c.name || '').toUpperCase() + ' · Código ' + (c.code || '') + ' · Plan ' + (c.plan || ''), M + 12, y + 36);
    d.text('Fecha y hora: ' + fmtAcc(c.accepted && c.accepted.date) + ' (hora Colombia) · Versión ' + c.version, M + 12, y + 50);
    d.save('acuerdo-mrarrieta-' + String(c.code || 'estudiante').toLowerCase() + '.pdf');
  }
  function show(c) {
    const must = c.needs; const m = document.createElement('div'); m.className = 'modal ag-modal' + (must ? ' need' : ''); m.setAttribute('role', 'dialog');
    m.innerHTML = `<div class="modal-card card ag-card">${must ? '' : '<button class="mx" data-x aria-label="Cerrar">✕</button>'}<h3>📄 ${must ? 'Tu acuerdo de servicio' : 'Mi acuerdo de servicio'}</h3>
      ${must ? '<p class="muted" style="margin:0 0 8px">Antes de empezar, lee las condiciones de tu plan. Al aceptarlas se descarga una copia en PDF y te llega a tu correo.</p>' : `<p class="ag-ok">✔ Leído y aceptado el ${fmtAcc(c.accepted.date)} · ${esc(c.accepted.plan || c.plan)}</p>`}
      <div class="ag-doc">${md(c.text)}</div>
      <div style="text-align:center;margin-top:12px">${must ? '<button class="btn k" id="ag-ok">✅ Leí y acepto</button>' : '<button class="btn w" id="ag-dl">⬇️ Descargar copia (PDF)</button>'}</div></div>`;
    document.body.appendChild(m);
    if (!must) { m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); }); m.querySelector('#ag-dl').onclick = () => pdf(c); return m; }
    m.querySelector('#ag-ok').onclick = async () => { const b = m.querySelector('#ag-ok'); b.disabled = true; b.textContent = 'Guardando…';
      const x = await MRAC.call('myAgreeAccept', { code: MRAC.code(), version: c.version }).catch(() => null);
      if (x && x.ok) { A = x; m.remove(); toast('✅ Acuerdo aceptado · se descargó tu copia'); pdf(x); }
      else { b.disabled = false; b.textContent = '✅ Leí y acepto'; toast(x && x.err === 'version' ? 'El acuerdo se actualizó: recarga la página.' : 'No se pudo guardar. Revisa tu conexión.'); } };
    return m;
  }
  // al entrar al perfil: si su plan pago no tiene el acuerdo aceptado, se muestra (bloquea hasta aceptar)
  async function check() { if (!window.MRAC || !MRAC.code()) return false; const r = await MRAC.call('myAgree', { code: MRAC.code() }).catch(() => null); if (!r || !r.ok || !r.kind) return false; A = r; if (r.needs && !document.querySelector('.ag-modal')) { show(r); return true; } return false; }
  async function open() { const r = A && !A.needs ? A : await MRAC.call('myAgree', { code: MRAC.code() }).catch(() => null); if (r && r.ok && r.kind) show(r); else toast('Tu acuerdo aparece cuando tienes un plan activo.'); }
  window.MRAGREE = { check, open };
})();
