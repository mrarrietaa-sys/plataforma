/* =====================================================================
   SOBER — clases con aspecto profesional:
   · títulos, etiquetas e instrucciones sin emojis
   · 🔊 / 🎤 / 🐢 en botones e instrucciones → íconos de línea (SVG)
   ===================================================================== */
(function () {
  const SV = (p) => `<svg class="sbi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    '🔊': SV('<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/>'),
    '🎤': SV('<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>'),
    '🐢': SV('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 2"/>'),
  };
  ICON['🎙️'] = ICON['🎙'] = ICON['🎤'];
  const ICON_RE = /🔊|🎙️|🎙|🎤|🐢/g;
  const EMO_RE = /(?![©®™‼⁉↔-↙↩↪])(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|⃣|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*️?/gu;
  const KEEP = ['✅', '❌', '⏳', '❓', '🤚', '👉', '🏃', '😃', '😟', '❤', '⚠', '🟢', '🔴', '🟡'];
  const SCOPE = '.player,#sheet,.wrap.fx'; // solo dentro de las clases (y el examen final)
  const TXT = 'h1,h2,h3,h4,.lbl,.ins,.tip,.sheet-t,.sheet-m,.ptopic';
  const SKIP = '[contenteditable],textarea,input,select,.pz-ov,.ann-bar,#mra-ann,.emo,.g-emo,.chat,.lc-w,.no-sober';
  const done = new WeakSet();

  function frag(text) { // texto con 🔊/🎤 → nodos con íconos
    const f = document.createDocumentFragment(); let last = 0; text.replace(ICON_RE, (m, i) => { if (i > last) f.appendChild(document.createTextNode(text.slice(last, i))); const s = document.createElement('span'); s.className = 'sbw'; s.innerHTML = ICON[m]; f.appendChild(s); last = i + m.length; return m; });
    if (last < text.length) f.appendChild(document.createTextNode(text.slice(last))); return f;
  }
  function fixText(n) {
    const el = n.parentElement; if (!el || el.closest(SKIP) || !el.closest(SCOPE)) return;
    const v = n.nodeValue; if (!v || !/[←-⯿\u{1F000}-\u{1FAFF}]/u.test(v)) return;
    const head = el.closest(TXT), btn = el.closest('button,.play,.aud');
    if (!head && !btn) return;
    let t = v;
    const act = !head && el.closest('.btn,.slowbtn'); // botones de acción (¡A jugar!, Continuar…): también sin emojis decorativos
    if (head || act) { const hd = head || act; // títulos e instrucciones: sin emojis decorativos (los íconos de audio/micrófono se vuelven de línea)
      const inst = !!head && !head.matches('h1,h2,h3,h4,.lbl,.ptopic'); // en instrucciones se conservan los símbolos que explican algo (✅ ❌ 🤚 👉…)
      const s = v.replace(EMO_RE, (m) => { const b = m.replace(/\uFE0F/g, ''); return (ICON[m] || ICON[b] || (inst && KEEP.indexOf(b) >= 0)) ? m : ''; }).replace(/ {2,}/g, ' ');
      if (!s.trim() && !hd.textContent.replace(v, '').trim()) return; // el título era solo un emoji (contenido del juego): se deja
      t = /^\s/.test(v) ? s : s.replace(/^\s+/, '');
      if (!/\s$/.test(v)) t = t.replace(/\s+$/, '');
    }
    if (ICON_RE.test(t)) { ICON_RE.lastIndex = 0; n.replaceWith(frag(t)); return; }
    ICON_RE.lastIndex = 0;
    if (t !== v) n.nodeValue = t;
  }
  function scan(root) {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || root.closest && root.closest(SKIP)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const L = []; let n; while ((n = w.nextNode())) L.push(n); L.forEach(fixText);
  }
  let q = new Set(), sch = false;
  const flush = () => { sch = false; const a = [...q]; q = new Set(); a.forEach(x => { if (x.isConnected) scan(x); }); };
  const mo = new MutationObserver((ms) => { ms.forEach(m => { if (m.type === 'characterData') q.add(m.target); else m.addedNodes.forEach(x => q.add(x)); }); if (!sch) { sch = true; requestAnimationFrame(flush); } });
  const start = () => { scan(document.body); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); };
  const st = document.createElement('style');
  st.textContent = `.sbw{display:inline-flex;vertical-align:-.15em}.sbi{width:1.05em;height:1.05em}.play .sbi{width:1.5em;height:1.5em}.aud .sbi{width:1.15em;height:1.15em}`;
  document.head.appendChild(st);
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
