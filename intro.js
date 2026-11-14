/* v692 · Bienvenida de la página de entrada: el cohete de Mr. Arrieta dice «Welcome!» y aterriza en su lugar.
   · Solo la primera vez · se salta tocando la pantalla · nunca con una sesión abierta
   · Celular lento o «reducir movimiento»: versión simple (sin humo, rayos ni chispas) */
(function () {
  try {
    if (localStorage.getItem('mra_intro_v1')) return;
    if (localStorage.getItem('mra_profile_v1') || sessionStorage.getItem('mra_tp_session') || sessionStorage.getItem('mra_admin_key')) return;
    if (/[?&](out|ingresar|pc|prueba|tab)=/.test(location.search)) return;
    localStorage.setItem('mra_intro_v1', String(Date.now()));
  } catch (e) { return; }
  const lite = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  const css = `#mkI{position:fixed;inset:0;z-index:99998;background:linear-gradient(180deg,#fff 0%,#F2F7FF 55%,#DDEBFF 100%);overflow:hidden;transition:opacity .6s ease;cursor:pointer}
#mkI.go{opacity:0;pointer-events:none}
#mkI .c{position:absolute;background:#fff;border-radius:999px;box-shadow:0 10px 30px rgba(11,42,91,.10),inset 0 -6px 12px rgba(160,190,230,.25);animation:mkCm 9s linear infinite}
#mkI .c::before,#mkI .c::after{content:'';position:absolute;background:inherit;border-radius:50%;box-shadow:inherit}#mkI .c::before{width:55%;height:150%;left:14%;bottom:30%}#mkI .c::after{width:40%;height:120%;right:12%;bottom:35%}
@keyframes mkCm{to{transform:translateX(-160px)}}
#mkI .far{position:absolute;inset:0;filter:blur(3px);opacity:.7}#mkI .far .c{animation-duration:16s}
#mkI .ray{position:absolute;left:50%;top:30%;width:140vmax;height:140vmax;margin:-70vmax 0 0 -70vmax;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,0) 0 9deg,rgba(255,255,255,.55) 9deg 12deg);opacity:0;animation:mkRy 2.4s .6s ease-out forwards,mkSpin 20s linear infinite;-webkit-mask:radial-gradient(circle,#000 0,transparent 55%);mask:radial-gradient(circle,#000 0,transparent 55%)}
@keyframes mkRy{to{opacity:.8}}@keyframes mkSpin{to{rotate:360deg}}
#mkI .wd{position:absolute;left:0;right:0;top:calc(30% + min(30vh,250px) + 4px);display:flex;justify-content:center;gap:clamp(4px,1vw,8px)}
#mkI .wd span{display:grid;place-items:center;width:clamp(32px,6.4vw,58px);height:clamp(40px,8vw,72px);background:linear-gradient(180deg,#F0444B,#C81E25);color:#fff;border-radius:.3em;font:900 clamp(24px,5vw,48px) Poppins,system-ui,sans-serif;box-shadow:0 10px 22px rgba(200,30,37,.28),inset 0 2px 0 rgba(255,255,255,.35);position:relative;overflow:hidden;opacity:0;animation:mkLt .45s cubic-bezier(.3,1.6,.5,1) forwards}
#mkI .wd span:nth-child(odd){--r:-5deg}#mkI .wd span:nth-child(even){--r:4deg}
@keyframes mkLt{from{opacity:0;transform:translateY(-40px) scale(.4)}to{opacity:1;transform:rotate(var(--r))}}
#mkI .wd span::after{content:'';position:absolute;top:0;bottom:0;width:60%;left:-80%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:skewX(-20deg);animation:mkSh .8s 2.05s ease-in-out forwards}
@keyframes mkSh{to{left:140%}}
#mkI.go .wd{transition:opacity .3s;opacity:0}
#mkI.lite .ray,#mkI.lite .far{display:none}#mkI.lite .c{animation:none}
#mkR{position:fixed;z-index:99999;left:0;top:0;height:min(30vh,250px);will-change:transform;pointer-events:none;filter:drop-shadow(0 18px 22px rgba(11,42,91,.22))}
.mkP{position:fixed;z-index:99998;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fff 30%,rgba(210,225,250,.6) 60%,transparent 70%);animation:mkPf 1s ease-out forwards}
@keyframes mkPf{from{transform:scale(.4);opacity:.95}to{transform:scale(1.8) translateY(14px);opacity:0}}
.mkS{position:fixed;z-index:100000;width:7px;height:7px;border-radius:50%;background:#FFC83D;box-shadow:0 0 8px #FFC83D;pointer-events:none;animation:mkSp .8s ease-out forwards}
@keyframes mkSp{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--x),var(--y)) scale(.3);opacity:0}}
.mk-hide{opacity:0!important}`;
  const st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  const d = document.createElement('div'); d.id = 'mkI'; if (lite) d.className = 'lite';
  const cl = (L) => L.map(([l, t, w, h]) => `<i class="c" style="left:${l}%;top:${t}%;width:${w}px;height:${h}px"></i>`).join('');
  d.innerHTML = '<div class="ray"></div><div class="far">' + cl([[20, 20, 120, 36], [70, 30, 140, 40], [40, 60, 160, 44], [80, 70, 120, 36], [5, 80, 140, 40]]) + '</div>' +
    cl([[4, 10, 150, 46], [66, 6, 210, 58], [78, 40, 170, 50], [-6, 50, 230, 64], [28, 74, 260, 70], [62, 84, 190, 54], [12, 28, 110, 34], [44, 18, 130, 40]]) +
    '<div class="wd">' + [...'Welcome!'].map((c, i) => `<span style="animation-delay:${(1 + i * .1).toFixed(2)}s">${c}</span>`).join('') + '</div>';
  document.body.appendChild(d);
  const r = document.createElement('img'); r.id = 'mkR'; r.alt = ''; r.src = 'mra-x-rocket2.webp?v=2'; document.body.appendChild(r);
  let done = false, kv = 0;
  const TG = () => [...document.querySelectorAll('.pt-rkt,.ld-hero-mra')].find(e => e.getBoundingClientRect().width > 0);
  const kill = () => { const t = TG(); if (!t) return; t.classList.add('mk-hide'); t.getAnimations().forEach(a => { if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel(); }); };
  const finish = () => { if (done) return; done = true; clearInterval(kv); const t = TG(); if (t) t.classList.remove('mk-hide'); d.classList.add('go'); setTimeout(() => { d.remove(); r.remove(); st.remove(); }, 650); };
  d.addEventListener('pointerdown', finish); /* tocar la pantalla la salta */
  const fail = setTimeout(finish, 1500); /* si el cohete no carga rápido, no se hace esperar a nadie */
  const trail = (ms) => { if (lite) return; const t0 = performance.now(); const iv = setInterval(() => { if (done || performance.now() - t0 > ms) { clearInterval(iv); return; } const b = r.getBoundingClientRect(); if (!b.width) return; const p = document.createElement('i'); const sz = 14 + Math.random() * 16; p.className = 'mkP'; p.style.cssText = `left:${b.left + b.width * .12 - sz / 2}px;top:${b.top + b.height * .78 - sz / 2}px;width:${sz}px;height:${sz}px`; document.body.appendChild(p); setTimeout(() => p.remove(), 1000); }, 45); };
  const burst = (x, y) => { if (lite) return; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; const q = document.createElement('i'); q.className = 'mkS'; q.style.cssText = `left:${x}px;top:${y}px;--x:${Math.cos(a) * (50 + Math.random() * 30)}px;--y:${Math.sin(a) * (40 + Math.random() * 25)}px`; document.body.appendChild(q); setTimeout(() => q.remove(), 900); } };
  r.onerror = finish;
  r.onload = () => {
    if (done) return; clearTimeout(fail); kv = setInterval(kill, 100); kill();
    const W = innerWidth, H = innerHeight, rb = r.getBoundingClientRect(), rw = rb.width, rh = rb.height, cx = (W - rw) / 2, cy = H * .3 - rh * .1;
    trail(1300);
    r.animate([{ transform: `translate(${-rw}px,${H}px) rotate(-12deg)` }, { transform: `translate(${cx + 30}px,${cy - 30}px) rotate(4deg)`, offset: .75 }, { transform: `translate(${cx}px,${cy}px) rotate(0)` }], { duration: 1300, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'forwards' });
    setTimeout(() => {
      if (done) return; kill(); d.classList.add('go'); trail(1000);
      const t = TG(); if (!t) return finish(); const tr = t.getBoundingClientRect(), sc = tr.height / rh;
      r.style.transformOrigin = '0 0';
      r.animate([{ transform: `translate(${cx}px,${cy}px) rotate(0) scale(1)` }, { transform: `translate(${(cx + tr.left) / 2}px,${(cy + tr.top) / 2 - 40}px) rotate(-5deg) scale(${(1 + sc) / 2})`, offset: .5 }, { transform: `translate(${tr.left}px,${tr.top}px) rotate(0) scale(${sc})` }], { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).onfinish = () => {
        clearInterval(kv); t.getAnimations().forEach(a => { if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel(); }); t.classList.remove('mk-hide'); burst(tr.left + tr.width * .5, tr.top + tr.height * .6); done = true;
        setTimeout(() => { r.remove(); d.remove(); setTimeout(() => st.remove(), 900); }, 60);
      };
    }, 2500);
  };
})();
