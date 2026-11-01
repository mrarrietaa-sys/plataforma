/* v506 · SPEAKING CON AZURE para el test de clasificación y los exámenes finales.
   Tipos: read (lee en voz alta) · repeat (escucha y repite, sin texto) · answer (responde con una frase).
   La respuesta libre larga (tarea 4) sigue con el motor de siempre en cada examen.
   Nunca se muestra lo que se escuchó: solo si estuvo bien o no. */
(function () {
  const M = () => window.M1;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LV = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2' };
  const MIC = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
  const TITLE = { read: 'Lee en voz alta', repeat: 'Escucha y repite', answer: 'Responde con una frase' };
  const INS = { read: 'Toca el micrófono y lee la frase con tu voz normal.', repeat: 'La frase no aparece escrita: escúchala y repítela igual. Puedes escucharla 2 veces.', answer: 'Escucha la pregunta y contesta en 1 o 2 frases completas.' };
  const is = (it) => !!(it && (it.type === 'read' || it.type === 'repeat' || it.type === 'answer'));
  // opts.min: nota mínima de pronunciación con Azure (examen final 70)
  function render(body, it, a, feedback, opts) {
    opts = opts || {}; const min = opts.min || 60;
    const tgt = it.en || '', ms = Math.min(8000, Math.max(4000, tgt.split(/\s+/).length * 600 + 2500));
    body.innerHTML = `<div class="sp9"><div class="sp9-h"><b>${TITLE[it.type]}</b><span class="sp9-lv">Nivel ${LV[it.module] || ''}</span></div><p class="sp9-ins">${INS[it.type]}</p>
      <div class="sp9-card">${it.type === 'read' ? `<div class="sp9-en">${esc(it.en)}</div><div class="sp9-es">${esc(it.es)}</div>` : it.type === 'repeat' ? `<button type="button" class="sp9-play" id="sp9p" aria-label="Escuchar">${PLAY}</button><div class="sp9-es" id="sp9n">Toca para escuchar (2 veces)</div><div class="sp9-en sp9-hid" id="sp9t">${esc(it.en)}</div>` : `<div class="sp9-en">${esc(it.q)}</div><div class="sp9-es">${esc(it.es)}</div><button type="button" class="btn w sm" id="sp9p">🔊 Escuchar la pregunta</button>`}</div>
      <div class="sp9-mw"><button type="button" class="sp9-mic" id="sp9m" aria-label="Grabar">${MIC}</button><p class="sp9-st" id="sp9s">Toca el micrófono y habla</p></div><div id="sp9r"></div></div>`;
    const $ = (s) => body.querySelector(s), mic = $('#sp9m'), st = $('#sp9s'), out = $('#sp9r');
    let plays = 0, busy = false;
    if (it.type === 'repeat') { const pb = $('#sp9p'); pb.onclick = async () => { if (plays >= 2 || busy) return; plays++; pb.disabled = true; try { await M().play(it.au); } catch (e) { } pb.disabled = plays >= 2; $('#sp9n').textContent = plays >= 2 ? 'Ya la escuchaste 2 veces' : 'Puedes escucharla 1 vez más'; }; }
    if (it.type === 'answer') $('#sp9p').onclick = () => { try { M().play(it.au); } catch (e) { } };
    const show = () => {
      const ok = a.correct === true; mic.classList.remove('rec');
      out.innerHTML = a.neutral ? '<div class="sp9-res nt">✔ Respuesta guardada.</div>' : `<div class="sp9-res ${ok ? 'ok' : 'no'}">${ok ? '✅ ¡Muy bien!' : a.why === 'words' ? '❌ Casi: di cada palabra tal como es.' : a.why === 'nohear' ? 'No te escuché bien. Acércate al micrófono.' : it.type === 'answer' ? '❌ Casi: responde con una frase completa y correcta.' : '❌ Casi: repite despacio y claro.'}</div>`;
      if (it.type === 'repeat' && a.answered) $('#sp9t').classList.remove('sp9-hid');
      st.textContent = a.tries >= 2 || ok ? 'Toca Siguiente para continuar' : 'Puedes intentarlo una vez más';
      mic.disabled = ok || (a.tries || 0) >= 2;
      if (a.neutral) feedback(true, '', true); else feedback(ok, '');
    };
    if (a.answered) show();
    mic.onclick = async () => {
      if (busy || mic.disabled) return; if (it.type === 'repeat' && !plays) { M().toast('Primero escucha la frase 🔊'); return; }
      busy = true; try { M().stop(); } catch (e) { } mic.classList.add('rec'); st.textContent = '🔴 Te escucho…'; out.innerHTML = '';
      let ok = false, why = '', r = null;
      try {
        if (it.type === 'answer') {
          r = await (M().listenAsr || M().listen)(10000, { quick: true, target: it.pat }); /* v516: exámenes con Azure */
          if (!r.alts || !r.alts.length) why = 'nohear';
          else { const fj = M().freeJudge(it.q, it.pat, r.alts), w = String(r.alts[0] || '').trim().split(/\s+/).filter(Boolean).length; ok = !!fj.ok && w >= 2; a.gram = ok ? 1 : 0; }
        } else {
          r = await (M().recordScoreAsr || M().recordScore)(tgt, ms);
          if (r.score == null) { a.neutral = !M().canSR; }
          else if (!r.alts || !r.alts.length) why = 'nohear';
          else { const j = M().readJudge('', tgt, r.az ? Object.assign([r.heard || r.alts[0]], { az: r.az }) : r.alts); ok = !!j.ok && (!r.az || r.az.pron >= min); why = ok ? '' : j.gramMiss ? 'words' : 'pron'; }
          if (r.az && r.az.ref) { a.pron = r.az.pron; a.flu = r.az.flu; a.acc = r.az.acc; }
        }
      } catch (e) { why = 'nohear'; }
      busy = false; if (why === 'nohear' && !a.answered) { mic.classList.remove('rec'); st.textContent = 'No te escuché bien. Toca el micrófono otra vez.'; return; }
      a.tries = (a.tries || 0) + 1; a.answered = true; a.correct = ok; a.why = why; a.value = ''; try { M().sfx(ok ? 'ok' : 'bad'); } catch (e) { }
      show(); opts.onSave && opts.onSave();
    };
  }
  // promedio de pronunciación y fluidez (para el resultado)
  function summary(ITEMS, answers) { const P = [], F = []; ITEMS.forEach((it, i) => { const a = answers[i]; if (is(it) && a && a.pron != null) { P.push(a.pron); if (a.flu != null) F.push(a.flu); } }); const av = (x) => x.length ? Math.round(x.reduce((s, v) => s + v, 0) / x.length) : null; return { pron: av(P), flu: av(F) }; }
  window.MRSPK9 = { is, render, summary };
})();
