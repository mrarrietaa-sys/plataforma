/* =====================================================================
   🧑‍🏫 PIZARRA DIGITAL (profes) — moderna, a pantalla completa, para compartir en Meet
   Herramientas: seleccionar · lápiz · resaltador · texto · nota adhesiva · rectángulo · flecha
   · imagen (subir o pegar) · puntero láser · borrador · colores · deshacer/rehacer · páginas · zoom
   window.MRPZ.open({ title, sub, data, onSave(data, pngs) })
   ===================================================================== */
(function () {
  const W = 1600, H = 900;
  const COLORS = ['#0B2A5B', '#E3242B', '#FFC21A', '#22C55E', '#3B9CFF'];
  const NOTE_BG = { '#0B2A5B': '#dfe8ff', '#E3242B': '#ffd6dc', '#FFC21A': '#fff3a6', '#22C55E': '#cfeedd', '#3B9CFF': '#d7ecff' };
  const IC = {
    sel: '<path d="M5 3l14 8-6 2-2 6z"/>', pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    hl: '<path d="M9 15l-4 4h5l2-2"/><path d="M8 13l7-9 5 5-9 7z"/>', text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    note: '<path d="M5 4h14v10l-5 6H5z"/><path d="M14 20v-6h5"/>', rect: '<rect x="4" y="6" width="16" height="12" rx="2"/>',
    arrow: '<path d="M5 19L19 5M10 5h9v9"/>', img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>',
    laser: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    erase: '<path d="M7 20h11M4 15l9-9 6 6-7 7H8z"/>', undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
  const TOOLS = [['sel', 'Seleccionar y mover (doble clic para editar · Supr para borrar)'], ['pen', 'Lápiz'], ['hl', 'Resaltador'], ['text', 'Texto'], ['note', 'Nota adhesiva'], ['rect', 'Rectángulo'], ['arrow', 'Flecha'], ['img', 'Imagen (también puedes pegarla con Ctrl+V)'], ['laser', 'Puntero láser'], ['erase', 'Borrador']];
  let css = false;
  function addCss() {
    if (css) return; css = true; const s = document.createElement('style'); s.textContent = `
.pz-ov{position:fixed;inset:0;z-index:99990;background:#eef2f8;font-family:Inter,Arial,sans-serif;color:#0B2A5B;user-select:none}
.pz-stage{position:absolute;inset:0;overflow:hidden;display:grid;place-items:center}
.pz-cv{background:#fbfcfe;border-radius:14px;box-shadow:0 12px 34px rgba(11,42,91,.14);touch-action:none;display:block}
.pz-pill{position:absolute;background:#fff;border:1px solid #e3e9f3;border-radius:14px;box-shadow:0 6px 18px rgba(11,42,91,.10);display:flex;align-items:center;gap:6px;padding:6px 8px;z-index:3}
.pz-ttl b{font:700 14px Poppins,sans-serif;display:block}.pz-ttl small{font-size:11.5px;color:#5b6577}
.pz-chip{font:600 12px Inter,sans-serif;padding:6px 10px;border-radius:10px;background:#f2f5fa;border:0;color:#0B2A5B;cursor:pointer}
.pz-chip.on{background:#0B2A5B;color:#fff}.pz-live{background:#fde8ea;color:#E3242B;cursor:default}
.pz-b{border:0;border-radius:10px;padding:8px 12px;font:700 12.5px Poppins,sans-serif;cursor:pointer;background:#fff;border:1px solid #dbe3ef;color:#0B2A5B;white-space:nowrap}
.pz-b.k{background:#0B2A5B;color:#fff;border-color:#0B2A5B}.pz-b:disabled{opacity:.5}
.pz-tools{left:50%;transform:translateX(-50%);bottom:16px;border-radius:18px;padding:6px 8px;gap:2px;max-width:calc(100vw - 24px);overflow-x:auto}
.pz-t{width:38px;height:38px;flex:0 0 38px;border-radius:11px;display:grid;place-items:center;border:0;background:none;color:#0B2A5B;cursor:pointer}
.pz-t svg{width:20px;height:20px}.pz-t.on{background:#0B2A5B;color:#fff}.pz-t:hover:not(.on){background:#f2f5fa}
.pz-sep{width:1px;height:24px;background:#e3e9f3;margin:0 5px;flex:0 0 1px}
.pz-c{width:20px;height:20px;flex:0 0 20px;border-radius:50%;margin:0 3px;border:0;cursor:pointer}.pz-c.on{box-shadow:0 0 0 2px #fff,0 0 0 4px #0B2A5B}
.pz-edit{position:absolute;z-index:4;border:2px dashed #3B9CFF;background:#ffffffee;outline:0;resize:none;font-family:Inter,Arial,sans-serif;font-weight:600;padding:6px 8px;border-radius:8px;color:#0B2A5B}
.pz-toast{position:absolute;left:50%;top:70px;transform:translateX(-50%);background:#0B2A5B;color:#fff;font:600 13px Inter;padding:8px 14px;border-radius:10px;z-index:5}
@media (max-width:760px){.pz-top-r .pz-b span{display:none}.pz-ttl small{display:none}.pz-live{display:none}#pz-zoom{display:none}#pz-pages{bottom:74px!important}.pz-tools{bottom:12px;left:8px;right:8px;transform:none;justify-content:flex-start}}
`; document.head.appendChild(s);
  }
  function open(opt) {
    opt = opt || {}; addCss();
    const D = (opt.data && opt.data.pages && opt.data.pages.length) ? JSON.parse(JSON.stringify(opt.data)) : { pages: [{ items: [] }] };
    let pg = 0, tool = 'pen', color = COLORS[0], zoom = 1, sel = null, hist = {}, fut = {}, laser = [], t0 = Date.now(), dirty = false;
    const imgCache = {};
    const ov = document.createElement('div'); ov.className = 'pz-ov';
    ov.innerHTML = `<div class="pz-stage"><canvas class="pz-cv"></canvas></div>
      <div class="pz-pill pz-ttl" style="left:14px;top:12px"><span style="font-size:20px">🧑‍🏫</span><div><b>${esc(opt.title || 'Pizarra de clase')}</b><small>${esc(opt.sub || '')}</small></div></div>
      <div class="pz-pill" style="left:50%;transform:translateX(-50%);top:12px"><span class="pz-chip pz-live" id="pz-live">● En clase · 00:00</span></div>
      <div class="pz-pill pz-top-r" style="right:14px;top:12px"><button class="pz-b" id="pz-fs">⛶ <span>Pantalla completa</span></button><button class="pz-b" id="pz-dl">⬇ <span>Imagen</span></button>${opt.onSave ? '<button class="pz-b k" id="pz-sv">💾 <span>Guardar</span></button>' : ''}<button class="pz-b" id="pz-x" title="Cerrar">✕</button></div>
      <div class="pz-pill pz-tools">${TOOLS.map(([k, t]) => `<button class="pz-t" data-t="${k}" title="${t}">${svg(k)}</button>`).join('')}<span class="pz-sep"></span>${COLORS.map(c => `<button class="pz-c" data-c="${c}" style="background:${c}" title="Color"></button>`).join('')}<span class="pz-sep"></span><button class="pz-t" id="pz-un" title="Deshacer">${svg('undo')}</button><button class="pz-t" id="pz-re" title="Rehacer">${svg('redo')}</button></div>
      <div class="pz-pill" style="left:14px;bottom:16px" id="pz-pages"></div>
      <div class="pz-pill" id="pz-zoom" style="right:14px;bottom:16px"><button class="pz-chip" id="pz-zo">−</button><span class="pz-chip" id="pz-zv" style="cursor:default">100%</span><button class="pz-chip" id="pz-zi">+</button></div>
      <input type="file" accept="image/*" id="pz-file" hidden>`;
    document.body.appendChild(ov); document.documentElement.style.overflow = 'hidden';
    const $ = (s) => ov.querySelector(s), cv = $('.pz-cv'), ctx = cv.getContext('2d'), stage = $('.pz-stage');
    const page = () => D.pages[pg];
    // ---- tamaño y escala
    let sc = 1; const DPR = Math.min(2, window.devicePixelRatio || 1);
    function fit() { const aw = innerWidth - 28, ah = innerHeight - (innerWidth < 760 ? 210 : 150); sc = Math.min(aw / W, ah / H) * zoom; cv.style.width = W * sc + 'px'; cv.style.height = H * sc + 'px'; cv.width = W * sc * DPR; cv.height = H * sc * DPR; $('#pz-zv').textContent = Math.round(zoom * 100) + '%'; draw(); }
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / sc, (e.clientY - r.top) / sc]; };
    // ---- dibujo
    function wrap(c, txt, maxW) { const out = []; String(txt || '').split('\n').forEach(par => { let line = ''; par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (maxW && c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); }); return out; }
    function noteH(c, it) { c.font = '600 22px Inter, Arial, sans-serif'; return Math.max(120, 36 + wrap(c, it.txt, it.w - 32).length * 30); }
    function drawItem(c, it) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      if (it.t === 'pen' || it.t === 'hl') { c.strokeStyle = it.c; c.lineWidth = it.t === 'hl' ? 22 : 4; c.globalAlpha = it.t === 'hl' ? .32 : 1; c.beginPath(); it.p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (it.p.length === 1) c.lineTo(it.p[0][0] + .1, it.p[0][1]); c.stroke(); }
      else if (it.t === 'rect') { c.strokeStyle = it.c; c.lineWidth = 4; const r = 10; c.beginPath(); c.roundRect ? c.roundRect(Math.min(it.x, it.x + it.w), Math.min(it.y, it.y + it.h), Math.abs(it.w), Math.abs(it.h), r) : c.rect(it.x, it.y, it.w, it.h); c.stroke(); }
      else if (it.t === 'arrow') { c.strokeStyle = it.c; c.fillStyle = it.c; c.lineWidth = 4; c.beginPath(); c.moveTo(it.x1, it.y1); c.lineTo(it.x2, it.y2); c.stroke(); const a = Math.atan2(it.y2 - it.y1, it.x2 - it.x1), L = 20; c.beginPath(); c.moveTo(it.x2, it.y2); c.lineTo(it.x2 - L * Math.cos(a - .45), it.y2 - L * Math.sin(a - .45)); c.lineTo(it.x2 - L * Math.cos(a + .45), it.y2 - L * Math.sin(a + .45)); c.closePath(); c.fill(); }
      else if (it.t === 'text') { c.fillStyle = it.c; c.font = `700 ${it.s || 34}px Poppins, Inter, Arial, sans-serif`; c.textBaseline = 'top'; String(it.txt).split('\n').forEach((l, i) => c.fillText(l, it.x, it.y + i * (it.s || 34) * 1.25)); }
      else if (it.t === 'note') { const h = noteH(c, it); it.h = h; c.translate(it.x + it.w / 2, it.y + h / 2); c.rotate((it.r || 0) * Math.PI / 180); c.translate(-it.w / 2, -h / 2); c.shadowColor = 'rgba(11,42,91,.15)'; c.shadowBlur = 16; c.shadowOffsetY = 6; c.fillStyle = it.bg; c.fillRect(0, 0, it.w, h); c.shadowColor = 'transparent'; c.fillStyle = '#0B2A5B'; c.font = '600 22px Inter, Arial, sans-serif'; c.textBaseline = 'top'; wrap(c, it.txt, it.w - 32).forEach((l, i) => c.fillText(l, 16, 18 + i * 30)); }
      else if (it.t === 'img') { const im = imgCache[it.src] || (imgCache[it.src] = Object.assign(new Image(), { src: it.src, onload: () => draw() })); c.shadowColor = 'rgba(0,0,0,.12)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = '#fff'; c.fillRect(it.x - 5, it.y - 5, it.w + 10, it.h + 10); c.shadowColor = 'transparent'; if (im.complete && im.naturalWidth) c.drawImage(im, it.x, it.y, it.w, it.h); }
      c.restore();
    }
    function bbox(it) {
      if (it.t === 'pen' || it.t === 'hl') { const xs = it.p.map(p => p[0]), ys = it.p.map(p => p[1]); const m = it.t === 'hl' ? 11 : 4; return [Math.min(...xs) - m, Math.min(...ys) - m, Math.max(...xs) + m, Math.max(...ys) + m]; }
      if (it.t === 'rect') return [Math.min(it.x, it.x + it.w), Math.min(it.y, it.y + it.h), Math.max(it.x, it.x + it.w), Math.max(it.y, it.y + it.h)];
      if (it.t === 'arrow') return [Math.min(it.x1, it.x2) - 8, Math.min(it.y1, it.y2) - 8, Math.max(it.x1, it.x2) + 8, Math.max(it.y1, it.y2) + 8];
      if (it.t === 'text') { ctx.font = `700 ${it.s || 34}px Poppins, Inter, Arial, sans-serif`; const ls = String(it.txt).split('\n'); const w = Math.max(...ls.map(l => ctx.measureText(l).width)); return [it.x, it.y, it.x + w, it.y + ls.length * (it.s || 34) * 1.25]; }
      if (it.t === 'note') return [it.x, it.y, it.x + it.w, it.y + (it.h || 120)];
      if (it.t === 'img') return [it.x, it.y, it.x + it.w, it.y + it.h];
      return [0, 0, 0, 0];
    }
    const near = (it, x, y) => { const b = bbox(it); if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return false;
      if (it.t === 'pen' || it.t === 'hl') { const r = it.t === 'hl' ? 14 : 9; return it.p.some(([px, py]) => (px - x) ** 2 + (py - y) ** 2 < r * r * 4); }
      if (it.t === 'rect') { const [a, b2, c2, d] = bbox(it), m = 10; return x < a + m || x > c2 - m || y < b2 + m || y > d - m; }
      if (it.t === 'arrow') { const dx = it.x2 - it.x1, dy = it.y2 - it.y1, L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - it.x1) * dx + (y - it.y1) * dy) / L)); return (it.x1 + t * dx - x) ** 2 + (it.y1 + t * dy - y) ** 2 < 144; }
      return true; };
    const hit = (x, y) => { const L = page().items; for (let i = L.length - 1; i >= 0; i--) if (near(L[i], x, y)) return L[i]; return null; };
    function grid(c) { c.fillStyle = '#fbfcfe'; c.fillRect(0, 0, W, H); c.fillStyle = '#d6deea'; for (let x = 22; x < W; x += 28) for (let y = 22; y < H; y += 28) { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); } }
    function render(c, items, withSel) { grid(c); items.forEach(it => drawItem(c, it)); if (withSel && sel) { const b = bbox(sel); c.save(); c.strokeStyle = '#3B9CFF'; c.setLineDash([8, 6]); c.lineWidth = 2; c.strokeRect(b[0] - 6, b[1] - 6, b[2] - b[0] + 12, b[3] - b[1] + 12); c.restore(); } }
    function draw() {
      ctx.setTransform(sc * DPR, 0, 0, sc * DPR, 0, 0); render(ctx, page().items, true);
      if (cur) drawItem(ctx, cur);
      if (laser.length) { const now = Date.now(); laser = laser.filter(p => now - p[2] < 700); ctx.save(); ctx.lineCap = 'round'; for (let i = 1; i < laser.length; i++) { const a = 1 - (now - laser[i][2]) / 700; ctx.strokeStyle = `rgba(227,36,43,${a})`; ctx.lineWidth = 8 * a + 2; ctx.beginPath(); ctx.moveTo(laser[i - 1][0], laser[i - 1][1]); ctx.lineTo(laser[i][0], laser[i][1]); ctx.stroke(); } const l = laser[laser.length - 1]; if (l) { ctx.fillStyle = '#E3242B'; ctx.shadowColor = '#E3242B'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(l[0], l[1], 7, 0, 7); ctx.fill(); } ctx.restore(); if (laser.length) requestAnimationFrame(draw); }
    }
    // ---- historial
    const snap = () => JSON.stringify(page().items);
    function commit(before) { (hist[pg] = hist[pg] || []).push(before); if (hist[pg].length > 60) hist[pg].shift(); fut[pg] = []; dirty = true; }
    function undo() { const h = hist[pg] || []; if (!h.length) return; (fut[pg] = fut[pg] || []).push(snap()); page().items = JSON.parse(h.pop()); sel = null; draw(); dirty = true; }
    function redo() { const f = fut[pg] || []; if (!f.length) return; (hist[pg] = hist[pg] || []).push(snap()); page().items = JSON.parse(f.pop()); sel = null; draw(); dirty = true; }
    // ---- edición de texto / notas
    let editing = null;
    function editBox(it, isNew) {
      endEdit(); const r = cv.getBoundingClientRect(), ta = document.createElement('textarea'); ta.className = 'pz-edit'; ta.value = it.txt || '';
      const fs = it.t === 'note' ? 22 : (it.s || 34); ta.style.font = `${it.t === 'note' ? 600 : 700} ${fs * sc}px ${it.t === 'note' ? 'Inter' : 'Poppins, Inter'}, Arial, sans-serif`;
      ta.style.left = r.left + it.x * sc + 'px'; ta.style.top = r.top + it.y * sc + 'px'; ta.style.width = (it.t === 'note' ? it.w : 520) * sc + 'px'; ta.style.height = (it.t === 'note' ? Math.max(120, it.h || 120) : fs * 3) * sc + 'px';
      if (it.t === 'note') ta.style.background = it.bg; else ta.style.color = it.c;
      ov.appendChild(ta); const before = isNew ? JSON.stringify(page().items.filter(x => x !== it)) : snap(); editing = { ta, it, before, isNew };
      if (!isNew) { it._hide = true; } ta.placeholder = it.t === 'note' ? 'Escribe la nota…' : 'Escribe aquí…'; ta.focus(); setTimeout(() => ta.focus(), 30);
      ta.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); endEdit(); } e.stopPropagation(); });
    }
    function endEdit() {
      if (!editing) return; const { ta, it, before } = editing; editing = null; it.txt = ta.value.replace(/\s+$/, ''); delete it._hide; ta.remove();
      if (!it.txt && it.t !== 'note') page().items = page().items.filter(x => x !== it); else if (!it.txt && it.t === 'note' && !before.includes('"note"')) page().items = page().items.filter(x => x !== it);
      if (before !== snap()) commit(before); draw();
    }
    const _di = drawItem; drawItem = function (c, it) { if (it._hide) return; _di(c, it); }; // eslint-disable-line no-func-assign
    // ---- puntero
    let cur = null, drag = null, erasing = false, eBefore = '';
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (editing) { endEdit(); return; }
      cv.setPointerCapture(e.pointerId); const [x, y] = pos(e);
      if (tool === 'pen' || tool === 'hl') cur = { t: tool, c: color, p: [[x, y]] };
      else if (tool === 'rect') cur = { t: 'rect', c: color, x, y, w: 0, h: 0 };
      else if (tool === 'arrow') cur = { t: 'arrow', c: color, x1: x, y1: y, x2: x, y2: y };
      else if (tool === 'laser') { laser.push([x, y, Date.now()]); draw(); }
      else if (tool === 'erase') { erasing = true; eBefore = snap(); const h = hit(x, y); if (h) { page().items = page().items.filter(i => i !== h); draw(); } }
      else if (tool === 'text') { const it = { t: 'text', c: color, x, y: y - 20, s: 34, txt: '' }; page().items.push(it); editBox(it, true); }
      else if (tool === 'note') { const it = { t: 'note', bg: NOTE_BG[color], x: x - 100, y: y - 30, w: 220, r: Math.round(Math.random() * 4 - 2), txt: '' }; page().items.push(it); draw(); editBox(it, true); }
      else if (tool === 'img') { $('#pz-file').click(); }
      else if (tool === 'sel') { const h = hit(x, y); sel = h; if (h) { drag = { x, y, before: snap(), moved: false }; } draw(); }
    });
    cv.addEventListener('pointermove', (e) => {
      const [x, y] = pos(e);
      if (tool === 'laser' && (e.buttons || e.pointerType === 'mouse')) { laser.push([x, y, Date.now()]); if (laser.length < 3) draw(); return; }
      if (cur) { if (cur.t === 'pen' || cur.t === 'hl') cur.p.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]); else if (cur.t === 'rect') { cur.w = x - cur.x; cur.h = y - cur.y; } else if (cur.t === 'arrow') { cur.x2 = x; cur.y2 = y; } draw(); }
      else if (erasing) { const h = hit(x, y); if (h) { page().items = page().items.filter(i => i !== h); draw(); } }
      else if (drag && sel) { const dx = x - drag.x, dy = y - drag.y; drag.x = x; drag.y = y; drag.moved = true; move(sel, dx, dy); draw(); }
    });
    const upF = () => {
      if (cur) { const ok = (cur.t === 'pen' || cur.t === 'hl') || (cur.t === 'rect' && Math.abs(cur.w) + Math.abs(cur.h) > 8) || (cur.t === 'arrow' && Math.abs(cur.x2 - cur.x1) + Math.abs(cur.y2 - cur.y1) > 8); if (ok) { const b = snap(); page().items.push(cur); commit(b); } cur = null; draw(); }
      if (erasing) { erasing = false; if (eBefore !== snap()) commit(eBefore); }
      if (drag) { if (drag.moved) commit(drag.before); drag = null; }
    };
    cv.addEventListener('pointerup', upF); cv.addEventListener('pointercancel', upF);
    cv.addEventListener('dblclick', (e) => { const [x, y] = pos(e); const h = hit(x, y); if (h && (h.t === 'text' || h.t === 'note')) { sel = null; editBox(h, false); draw(); } });
    function move(it, dx, dy) { if (it.p) it.p.forEach(p => { p[0] += dx; p[1] += dy; }); else if (it.t === 'arrow') { it.x1 += dx; it.x2 += dx; it.y1 += dy; it.y2 += dy; } else { it.x += dx; it.y += dy; } }
    // ---- imágenes (subir o pegar)
    function addImage(file) {
      if (!file || !/^image\//.test(file.type)) return; const rd = new FileReader();
      rd.onload = () => { const im = new Image(); im.onload = () => { const m = 900, k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); const src = c.toDataURL('image/jpeg', .82);
        const fw = Math.min(520, c.width), fh = c.height * fw / c.width; const b = snap(); page().items.push({ t: 'img', x: (W - fw) / 2, y: (H - fh) / 2, w: fw, h: fh, src }); commit(b); setTool('sel'); sel = page().items[page().items.length - 1]; draw(); }; im.src = rd.result; };
      rd.readAsDataURL(file);
    }
    $('#pz-file').onchange = (e) => { addImage(e.target.files[0]); e.target.value = ''; };
    const onPaste = (e) => { if (editing) return; const it = [...(e.clipboardData || {}).items || []].find(x => x.type.startsWith('image/')); if (it) { e.preventDefault(); addImage(it.getAsFile()); } };
    const onKey = (e) => { if (editing) return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); } else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { const b = snap(); page().items = page().items.filter(i => i !== sel); sel = null; commit(b); draw(); } };
    document.addEventListener('paste', onPaste); document.addEventListener('keydown', onKey);
    // ---- herramientas, colores, páginas, zoom
    function setTool(k) { tool = k; ov.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === k)); cv.style.cursor = k === 'sel' ? 'default' : k === 'text' ? 'text' : k === 'laser' ? 'none' : 'crosshair'; if (k !== 'sel') { sel = null; draw(); } }
    ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { endEdit(); setTool(b.dataset.t); if (b.dataset.t === 'img') $('#pz-file').click(); });
    function setColor(c) { color = c; ov.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === c)); if (sel && sel.t !== 'img') { const b = snap(); if (sel.t === 'note') sel.bg = NOTE_BG[c]; else sel.c = c; commit(b); draw(); } }
    ov.querySelectorAll('[data-c]').forEach(b => b.onclick = () => setColor(b.dataset.c));
    $('#pz-un').onclick = undo; $('#pz-re').onclick = redo;
    function pages() { $('#pz-pages').innerHTML = `<button class="pz-chip" id="pz-pv" ${pg ? '' : 'disabled'}>◀</button>${D.pages.map((_, i) => `<button class="pz-chip${i === pg ? ' on' : ''}" data-p="${i}">${i + 1}</button>`).join('')}<button class="pz-chip" id="pz-np">+ Página</button>`;
      $('#pz-pv').onclick = () => go(pg - 1); $('#pz-np').onclick = () => { D.pages.push({ items: [] }); dirty = true; go(D.pages.length - 1); }; ov.querySelectorAll('[data-p]').forEach(b => b.onclick = () => go(+b.dataset.p)); }
    function go(i) { if (i < 0 || i >= D.pages.length) return; endEdit(); pg = i; sel = null; pages(); draw(); }
    $('#pz-zi').onclick = () => { zoom = Math.min(2, zoom + .1); fit(); }; $('#pz-zo').onclick = () => { zoom = Math.max(.5, zoom - .1); fit(); };
    // ---- exportar, guardar, cerrar
    const png = (i) => { const c = document.createElement('canvas'); c.width = W; c.height = H; render(c.getContext('2d'), D.pages[i].items, false); return c.toDataURL('image/png'); };
    const toast = (t) => { const d = document.createElement('div'); d.className = 'pz-toast'; d.textContent = t; ov.appendChild(d); setTimeout(() => d.remove(), 2200); };
    $('#pz-dl').onclick = () => { endEdit(); const a = document.createElement('a'); a.href = png(pg); a.download = 'pizarra-' + (opt.file || 'clase') + '-p' + (pg + 1) + '.png'; a.click(); };
    $('#pz-fs').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : ov.requestFullscreen(); } catch (e) { } };
    if ($('#pz-sv')) $('#pz-sv').onclick = async () => { endEdit(); const b = $('#pz-sv'); b.disabled = true; b.innerHTML = '⏳ <span>Guardando…</span>';
      const used = D.pages.map((p, i) => i).filter(i => D.pages[i].items.length); const shots = used.map(i => png(i).split(',')[1]);
      const ok = await Promise.resolve(opt.onSave(D, shots)).catch(() => false); b.disabled = false; b.innerHTML = '💾 <span>Guardar</span>'; if (ok) { dirty = false; toast('✅ Pizarra guardada'); } else toast('⚠️ No se pudo guardar. Revisa tu conexión.'); };
    function close() { endEdit(); if (dirty && opt.onSave && !confirm('¿Cerrar sin guardar los cambios de la pizarra?')) return; clearInterval(tm); removeEventListener('resize', fit); document.removeEventListener('paste', onPaste); document.removeEventListener('keydown', onKey); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { } document.documentElement.style.overflow = ''; ov.remove(); opt.onClose && opt.onClose(); }
    $('#pz-x').onclick = close;
    const tm = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#pz-live').textContent = '● En clase · ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 1000);
    addEventListener('resize', fit); setTool('pen'); setColor(COLORS[0]); pages(); fit();
    return { close };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
  window.MRPZ = { open };
})();
