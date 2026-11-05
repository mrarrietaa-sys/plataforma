/* v573 · Estudio de video (ofertas): recomendaciones → grabar desde el celular → edición automática (Reels/TikTok 1080×1920) → enviar en partes */
window.MRSTUDIO=(function(){
let CFG={},cur=null,ROOT=null;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=q=>ROOT?ROOT.querySelector(q):null;
const M=()=>({set innerHTML(h){const m=$('#mst-main');if(m){m.innerHTML=h;m.scrollTop=0;bindGo();}}});
const PRIZE=()=>cur.aud==='est'?'1 clase gratis':'$'+Number(cur.pay||0).toLocaleString('es-CO');
const SVG=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={shirt:'<path d="M20.4 6.6 16 4l-4 2-4-2-4.4 2.6L5 11l2-.6V20h10v-9.6l2 .6z"/>',mute:'<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',wall:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',phone:'<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',check:'<path d="M20 6 9 17l-5-5"/>'};
function bindGo(){if(!ROOT)return;ROOT.querySelectorAll('[data-go="studio"]').forEach(b=>b.onclick=()=>studio());}
function shell(){close();ROOT=document.createElement('div');ROOT.className='mst';ROOT.innerHTML=`<div class="mst-top"><img src="mra-brand.png" alt="mrarrieta.com"><button type="button" class="mst-x" aria-label="Cerrar">${SVG('<path d="M6 6l12 12M18 6 6 18"/>')}</button></div><div class="mst-in" id="mst-main"></div>`;document.body.appendChild(ROOT);document.documentElement.classList.add('mst-on');
 ROOT.querySelector('.mst-x').onclick=()=>{if(UPL){return;}if(REC_ON&&!confirm('¿Salir? Se pierde lo que estás grabando.'))return;close();};}
function close(){try{stopCam()}catch(e){}if(ROOT)ROOT.remove();ROOT=null;document.documentElement.classList.remove('mst-on');}
const IS_MOB=()=>window.__PCOK||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
let cam=null,rec=null,chunks=[],tmr=null,raf=null,SR=null,CAP=[],T0=0,REC_ON=false,UPL=false;
function stopCam(){REC_ON=false;try{rec&&rec.state!='inactive'&&rec.stop()}catch(e){}try{SR&&SR.stop()}catch(e){}clearInterval(tmr);cancelAnimationFrame(raf);if(cam){cam.getTracks().forEach(t=>t.stop());cam=null}}
function open(cfg){CFG=cfg||{};cur=Object.assign({},CFG.offer||{});if(!Array.isArray(cur.pts))cur.pts=[];shell();tips();}
function tips(){const est=cur.aud==='est';
 if(!IS_MOB()){M().innerHTML=`<div class="card mst-pc"><span class="mst-big">${SVG(IC.phone)}</span><div class="mst-tt">Este video se graba con tu celular</div>
  <p class="sub">La cámara del celular tiene mucha mejor calidad que la del computador. Así tu video sale nítido y profesional.</p>
  <div class="mst-steps"><b>1.</b> Abre <b>mrarrieta.com</b> en tu celular<br><b>2.</b> Entra a tu portal con tu código${est?'':' y tu clave'}<br><b>3.</b> Toca <b>«Grabar mi video»</b></div>
  <p class="mst-note">Tienes 48 horas para enviarlo desde que aceptaste.</p></div>`;return}
 const tip=(i,t,d)=>`<div class="tip"><span>${SVG(IC[i])}</span><div><b>${t}</b><small>${d}</small></div></div>`;
 M().innerHTML=`<h2>Antes de grabar</h2><p class="sub">${esc(cur.topic)} · máximo 1 minuto · ${PRIZE()}</p>
 <div class="card"><div class="mst-tt" style="font-size:18px">4 recomendaciones para que tu video quede profesional</div>
 ${tip('shirt','Vístete de forma adecuada',est?'Ropa sobria y presentable.':'Hombres: camisa o suéter. Mujeres: blusa decente, que no sea escotada.')}
 ${tip('mute','Busca un lugar silencioso','Sin ruido, sin música ni televisión de fondo.')}
 ${tip('sun','Buena iluminación','Ponte de frente a una ventana o a una luz. Nunca con la luz detrás de ti.')}
 ${tip('wall','Un fondo limpio','Una pared clara y ordenada. Sostén el celular en vertical, a la altura de tus ojos y a un brazo de distancia.')}
 <div style="margin-top:16px"><button class="btn" data-go="studio">Entendido, activar cámara</button></div></div>`}
/* 2 · grabación (se graba la cámara en su máxima calidad; la vista previa va como espejo) */
function studio(){
 M().innerHTML=`<h2>Graba tu video</h2><p class="sub">${esc(cur.topic)} · máximo 1 minuto · ${PRIZE()}</p>
 <div class="studio"><div class="phone"><canvas id="cv" width="720" height="1280"></canvas><div class="recb" id="rb">0:00</div><div class="prog" id="pg"></div><div class="lq" id="lq"></div><button class="recfab" id="b-go2" aria-label="Grabar"><i></i></button><div class="telem"><div id="tinm">${esc(cur.pts.join('\n'))}</div></div></div>
 <div class="side"><div class="card"><b>Guion</b><div class="tele"><div class="in" id="tin">${esc(cur.pts.join('\n\n'))}</div></div>
 <div id="ctl" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="b-go" disabled>Grabar</button><label class="btn g" style="margin:0;text-transform:none;letter-spacing:0;font-size:15px;color:var(--k)">Subir video<input type="file" accept="video/*" id="fu" hidden></label></div>
 <p id="msg" style="font-size:13px;color:var(--mut);margin:10px 0 0">Activando tu cámara…</p></div></div></div>`;
 $('#fu').onchange=e=>{const f=e.target.files[0];if(!f)return;const v=document.createElement('video');v.preload='metadata';v.src=URL.createObjectURL(f);
  v.onloadedmetadata=()=>{if(v.duration>61){$('#msg').innerHTML='<b style="color:var(--y)">Ese video dura más de 1 minuto. Recórtalo o grábalo aquí.</b>';return}stopCam();CAP=window.__CAPTEST||[];edit(f)}};
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1080},height:{ideal:1920},frameRate:{ideal:30}},audio:{noiseSuppression:true,echoCancellation:true,autoGainControl:true}}).then(s=>{cam=s;const v=document.createElement('video');v.muted=true;v.playsInline=true;v.srcObject=s;v.play();
  const cv=$('#cv'),cx=cv.getContext('2d'),sm=document.createElement('canvas');sm.width=32;sm.height=18;const sx2=sm.getContext('2d',{willReadFrequently:true});let fr=0;
  const draw=()=>{if(v.videoWidth){const vw=v.videoWidth,vh=v.videoHeight,tr=9/16;let sw=vw,sh=vh,sx=0,sy=0;if(vw/vh>tr){sw=vh*tr;sx=(vw-sw)/2}else{sh=vw/tr;sy=(vh-sh)/2}
   cx.save();cx.translate(720,0);cx.scale(-1,1);cx.drawImage(v,sx,sy,sw,sh,0,0,720,1280);cx.restore();
   if(!REC_ON){cx.save();cx.setLineDash([18,12]);cx.lineWidth=5;cx.strokeStyle='rgba(255,255,255,.9)';cx.beginPath();cx.ellipse(360,540,190,250,0,0,Math.PI*2);cx.stroke();cx.restore();
    cx.fillStyle='rgba(11,42,91,.78)';cx.fillRect(0,0,720,92);cx.fillStyle='#fff';cx.font='600 30px Inter, sans-serif';cx.textAlign='center';cx.fillText('Ubica tu cara dentro del óvalo',360,58)}
   if(++fr%20==0&&!REC_ON){sx2.drawImage(v,0,0,32,18);const d=sx2.getImageData(0,0,32,18).data;let L=0;for(let i=0;i<d.length;i+=4)L+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];L/=d.length/4;
    $('#lq').innerHTML=(L<70?'<span class="bad">Hay poca luz: acércate a una ventana</span>':'<span>Buena luz</span>')+`<span>${Math.min(v.videoWidth,v.videoHeight)>=1080?'Full HD':Math.min(v.videoWidth,v.videoHeight)>=720?'HD':'Baja calidad'}</span>`}}raf=requestAnimationFrame(draw)};draw();
  $('#b-go').disabled=false;$('#msg').textContent='Lee el guion mientras grabas. Se detiene solo al llegar a 1:00.';
  $('#b-go').onclick=()=>rec&&rec.state=='recording'?rec.stop():startRec();$('#b-go2').onclick=()=>$('#b-go').click()}).catch(()=>{$('#msg').innerHTML='<b>No se pudo activar la cámara.</b> Dale permiso al navegador o usa “Subir video”.'})}
/* subtítulos automáticos: reconocimiento de voz del navegador mientras graba */
function startSR(){CAP=window.__CAPTEST||[];const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return;
 SR=new R();SR.lang=cur.aud=='est'?'es-CO':'en-US';SR.continuous=true;SR.interimResults=true;const st={};
 SR.onresult=e=>{const t=(performance.now()-T0)/1000;for(let i=e.resultIndex;i<e.results.length;i++){const k=i+'_'+(SR._n||0);if(st[k]==null)st[k]=Math.max(0,t-.6);if(e.results[i].isFinal){const tx=e.results[i][0].transcript.trim();if(tx)CAP.push({a:st[k],b:t,t:tx})}}};
 SR.onend=()=>{if(REC_ON){SR._n=(SR._n||0)+1;try{SR.start()}catch(e){}}};try{SR.start()}catch(e){}}
function startRec(){const mt=['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
 chunks=[];rec=new MediaRecorder(cam,mt?{mimeType:mt,videoBitsPerSecond:8000000}:{});rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
 let s=0;T0=performance.now();REC_ON=true;$('#lq').innerHTML='';startSR();
 rec.onstop=()=>{REC_ON=false;clearInterval(tmr);try{SR&&SR.stop()}catch(e){}const b=new Blob(chunks,{type:rec.mimeType||'video/webm'});setTimeout(()=>{stopCam();edit(b)},700)};
 rec.start(500);$('#b-go').textContent='Detener';$('#b-go2').classList.add('on');document.querySelector('.telem')&&document.querySelector('.telem').classList.add('on');$('#lq').style.display='none';$('#b-go').classList.add('k');$('#rb').classList.add('on');
 const tin=$('#tin'),max=Math.max(0,tin.scrollHeight-200);
 tmr=setInterval(()=>{s=(performance.now()-T0)/1000;$('#rb').textContent='0:'+String(Math.min(59,Math.floor(s))).padStart(2,'0');$('#pg').style.width=Math.min(100,s/60*100)+'%';tin.style.transform=`translateY(-${Math.min(max,s/55*max)}px)`;const tm=$('#tinm');if(tm){const mm=Math.max(0,tm.scrollHeight-70);tm.style.transform=`translateY(-${Math.min(mm,s/55*mm)}px)`}if(s>=60)rec.stop()},200)}

/* 3 · edición automática → 1080×1920 (Reels, TikTok, Facebook) */
const NAVY='#0B2A5B',RED='#E3242B';
let FD=null;async function faceDet(){if(FD!==null)return FD;try{const V=window.__MPV||'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';const m=await import(V+'/vision_bundle.mjs');const fs=await m.FilesetResolver.forVisionTasks(V+'/wasm');
 FD=await m.FaceDetector.createFromOptions(fs,{baseOptions:{modelAssetPath:window.__MPM||'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'},runningMode:'IMAGE'})}catch(e){FD=false}return FD}
const once=(el,ev)=>new Promise(r=>el.addEventListener(ev,r,{once:true}));
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
function wrap(cx,text,maxW){const ws=text.split(/\s+/),L=[];let l='';ws.forEach(w=>{const t=l?l+' '+w:w;if(cx.measureText(t).width>maxW&&l){L.push(l);l=w}else l=t});if(l)L.push(l);return L}
function rr(cx,x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
function chunksOf(cap){const out=[];cap.forEach(c=>{const ws=c.t.split(/\s+/).filter(Boolean),n=Math.ceil(ws.length/5),per=(c.b-c.a)/ws.length;for(let k=0;k<n;k++){const w=ws.slice(k*5,k*5+5);const a=c.a+k*5*per;out.push({a,b:a+w.length*per,w})}});return out}
async function edit(src){
 const est=cur.aud=='est';
 M().innerHTML=`<h2>Editando tu video…</h2><p class="sub">La plataforma lo está dejando listo para Reels, TikTok y Facebook. No cierres ni cambies de pestaña.</p>
 <div class="card" style="max-width:520px;margin:0 auto;text-align:center"><div class="ebar"><i id="ep"></i></div><p id="et" style="color:var(--mut);font-size:14px;margin:10px 0 0">Preparando…</p></div>`;
 try{await Promise.all([document.fonts.load('800 70px Poppins'),document.fonts.load('700 40px Poppins'),document.fonts.load('600 36px Inter')])}catch(e){}
 const logo=await loadImg('mra-brand.png');if($('#et'))$('#et').textContent='Buscando tu cara para ubicar los subtítulos…';const fdet=await Promise.race([faceDet(),new Promise(r=>setTimeout(()=>r(false),8000))]);
 const v=document.createElement('video');v.src=URL.createObjectURL(src);v.playsInline=true;v.preload='auto';await once(v,'loadedmetadata');
 if(!isFinite(v.duration)){v.currentTime=1e9;await once(v,'durationchange').catch(()=>{});v.currentTime=0;await once(v,'seeked')}
 const DUR=Math.min(60,v.duration||1);
 const W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d');
 /* luz automática: mide la luminosidad media y ajusta brillo */
 await new Promise(r=>{v.currentTime=Math.min(1,DUR/3);v.onseeked=r});const sm=document.createElement('canvas');sm.width=48;sm.height=27;const sc=sm.getContext('2d',{willReadFrequently:true});sc.drawImage(v,0,0,48,27);
 let L=0;const d=sc.getImageData(0,0,48,27).data;for(let i=0;i<d.length;i+=4)L+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];L/=d.length/4;
 const BR=Math.max(1,Math.min(1.45,118/Math.max(30,L)));const FIL=`brightness(${BR.toFixed(2)}) contrast(1.08) saturate(1.12)`;
 v.currentTime=0;await once(v,'seeked');
 const ac=new (window.AudioContext||window.webkitAudioContext)();const sn=ac.createMediaElementSource(v);const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=85;
 const comp=ac.createDynamicsCompressor();comp.threshold.value=-24;comp.ratio.value=3.5;const g=ac.createGain();g.gain.value=1.35;const dst=ac.createMediaStreamDestination();sn.connect(hp);hp.connect(comp);comp.connect(g);g.connect(dst);
 const out=cv.captureStream(30);dst.stream.getAudioTracks().forEach(t=>out.addTrack(t));
 const mt=['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
 const R=new MediaRecorder(out,mt?{mimeType:mt,videoBitsPerSecond:4000000,audioBitsPerSecond:128000}:{});const ch=[];R.ondataavailable=e=>e.data.size&&ch.push(e.data);
 const fcv=document.createElement('canvas');fcv.width=270;fcv.height=480;const fc=fcv.getContext('2d');let lastFD=0,chinY=null;
 const CH=chunksOf(CAP),IN=1.5,OUT=2.6,KICK=est?'TESTIMONIO':'TIP DE INGLÉS',WHO=CFG.name||'',ROLE=est?'Estudiante de mrarrieta.com':'Profe en mrarrieta.com';
 const card=(t,isOut)=>{cx.fillStyle='#fff';cx.fillRect(0,0,W,H);const k=ease(t/0.7);
  if(logo){const lw=(isOut?560:760)*(0.86+0.14*k),lh=lw*logo.height/logo.width;cx.globalAlpha=k;cx.drawImage(logo,(W-lw)/2,(isOut?620:930)-lh/2,lw,lh);cx.globalAlpha=1}
  const k2=ease((t-.35)/.6);cx.globalAlpha=k2;cx.textAlign='center';
  if(isOut){cx.fillStyle=NAVY;cx.font='800 70px Poppins';cx.fillText('Practica inglés',W/2,920);cx.fillText('todos los días',W/2,1005);
   cx.fillStyle='#5B6B85';cx.font='500 38px Inter';cx.fillText('con profes reales y una plataforma',W/2,1090);cx.fillText('que te corrige',W/2,1140);
   const k3=ease((t-.7)/.6);cx.globalAlpha=k3;cx.fillStyle=RED;rr(cx,W/2-330,1240,660,118,59);cx.fill();cx.fillStyle='#fff';cx.font='700 44px Poppins';cx.fillText('mrarrieta.com',W/2,1316);
   cx.fillStyle=NAVY;cx.font='600 34px Inter';cx.fillText('Empieza gratis hoy',W/2,1440)}
  cx.globalAlpha=1};
 const frame=(vt)=>{const vw=v.videoWidth,vh=v.videoHeight,tr=W/H;let sw=vw,sh=vh,sx=0,sy=0;if(vw/vh>tr){sw=vh*tr;sx=(vw-sw)/2}else{sh=vw/tr;sy=(vh-sh)*0.35}
  cx.filter=FIL;cx.drawImage(v,sx,sy,sw,sh,0,0,W,H);cx.filter='none';
  if(fdet&&performance.now()-lastFD>400){lastFD=performance.now();try{fc.drawImage(cv,0,0,270,480);const r=fdet.detect(fcv);const f=r.detections&&r.detections[0];if(f){const bb=f.boundingBox;const chin=(bb.originY+bb.height*1.12)*4;chinY=chinY==null?chin:chinY*.6+chin*.4}}catch(e){}}
  let gr=cx.createLinearGradient(0,0,0,560);gr.addColorStop(0,'rgba(6,16,38,.62)');gr.addColorStop(1,'rgba(6,16,38,0)');cx.fillStyle=gr;cx.fillRect(0,0,W,560);
  gr=cx.createLinearGradient(0,H*.5,0,H);gr.addColorStop(0,'rgba(6,16,38,0)');gr.addColorStop(1,'rgba(6,16,38,.55)');cx.fillStyle=gr;cx.fillRect(0,H*.5,W,H*.5);
  /* título (zona segura superior) */
  const a1=ease(vt/.5);cx.globalAlpha=a1;cx.textAlign='left';const X=110;
  cx.font='700 30px Poppins';const kw=cx.measureText(KICK).width+40;cx.fillStyle=RED;rr(cx,X,250-30*(1-a1),kw,52,26);cx.fill();cx.fillStyle='#fff';cx.fillText(KICK,X+20,286-30*(1-a1));
  cx.font='800 60px Poppins';cx.shadowColor='rgba(0,0,0,.45)';cx.shadowBlur=18;const TL=wrap(cx,cur.topic,W-2*X-40).slice(0,2);TL.forEach((l,i)=>cx.fillText(l,X,385+i*72-30*(1-a1)));if(WHO){const ny=385+TL.length*72-10-30*(1-a1);cx.font='600 34px Inter';cx.fillStyle='rgba(255,255,255,.92)';cx.fillText(WHO+' · '+ROLE,X,ny)}cx.fillStyle='#fff';cx.shadowBlur=0;cx.globalAlpha=1;
  /* subtítulos palabra por palabra */
  const c=CH.find(x=>vt>=x.a&&vt<x.b+.25);if(c){cx.font='800 74px Poppins';cx.textAlign='left';const sp=cx.measureText(' ').width,per=(c.b-c.a)/c.w.length,wid=c.w.map(w=>cx.measureText(w).width);
   const lines=[[]];let lw=0;c.w.forEach((w,i)=>{if(lw+wid[i]>W-220&&lines[lines.length-1].length){lines.push([]);lw=0}lines[lines.length-1].push(i);lw+=wid[i]+sp});
   lines.forEach((ln,li)=>{const tw=ln.reduce((s,i)=>s+wid[i],0)+sp*(ln.length-1);let x=(W-tw)/2;const top=Math.min(1500-(lines.length-1)*94,Math.max(1380,chinY==null?1440:chinY+70));const y=top+li*94;
    ln.forEach(i=>{const on=vt>=c.a+i*per&&vt<c.a+(i+1)*per;if(on){cx.fillStyle=RED;rr(cx,x-12,y-66,wid[i]+24,90,16);cx.fill()}cx.fillStyle='#fff';cx.shadowColor='rgba(0,0,0,.55)';cx.shadowBlur=on?0:16;cx.fillText(c.w[i],x,y);cx.shadowBlur=0;x+=wid[i]+sp})})}
 };
 let ph='in',t0=performance.now(),tOut=0,stopped=false;R.start(250);
 await new Promise(done=>{const loop=()=>{const t=(performance.now()-t0)/1000;
  if(ph=='in'){card(t,false);if(t>=IN){ph='main';v.play().catch(()=>{})}}
  else if(ph=='main'){frame(v.currentTime);if(v.currentTime<.35){cx.fillStyle=`rgba(255,255,255,${1-v.currentTime/.35})`;cx.fillRect(0,0,W,H)}
   if(v.ended||v.currentTime>=DUR-.04){v.pause();ph='out';tOut=t}}
  else{const u=t-tOut;card(u,true);if(u<.3){cx.fillStyle=`rgba(255,255,255,${u/.3})`}if(u>=OUT&&!stopped){stopped=true;R.stop();return done()}}
  const pct=Math.min(100,Math.round(t/(IN+DUR+OUT)*100));const ep=$('#ep');if(ep){ep.style.width=pct+'%';$('#et').textContent=pct<100?`Editando… ${pct}%`:'Terminando…'}
  requestAnimationFrame(loop)};loop()});
 await once(R,'stop');try{ac.close()}catch(e){}
 const b=new Blob(ch,{type:R.mimeType||'video/webm'});reviewMine(b,Math.round(DUR+IN+OUT))}
function reviewMine(blob,dur){const est=cur.aud==='est';const url=URL.createObjectURL(blob);
 M().innerHTML=`<h2>¿Quedó bien?</h2><p class="sub">Así queda tu video ya editado. Si no te gusta, repítelo.</p>
 <div class="studio"><div class="phone"><video src="${url}" controls playsinline></video></div><div class="side"><div class="card">
 <div class="row"><span>Duración</span><b>0:${String(Math.min(dur,60)).padStart(2,'0')}</b></div>
 <div class="row"><span>Formato</span><b>Vertical 1080×1920</b></div>
 <div class="row"><span>Listo para</span><b>Reels · TikTok · Facebook</b></div>
 <div class="row"><span>${est?'Premio si se aprueba':'Pago si se aprueba'}</span><b style="color:#16A34A">${PRIZE()}</b></div>
 ${CAP.length?'':'<p class="mst-note" style="text-align:left">Sin subtítulos: este navegador no permitió reconocer la voz. En Chrome sí salen.</p>'}
 <label class="chk"><input type="checkbox" id="aut"> <span>Autorizo a MRARRIETA.COM a publicar este video en sus redes sociales y página web.</span></label>
 <div class="ebar" id="ub" hidden><i id="up"></i></div><p class="mst-note" id="ut" hidden></p>
 <div style="display:flex;gap:10px;flex-wrap:wrap" id="ubtn"><button class="btn g" data-go="studio">Repetir</button><button class="btn ok" id="b-send" disabled>Enviar video</button></div></div></div></div>`;
 $('#aut').onchange=e=>$('#b-send').disabled=!e.target.checked;
 $('#b-send').onclick=()=>send(blob,dur);}
async function send(blob,dur){UPL=true;const CH=3*1024*1024,n=Math.max(1,Math.ceil(blob.size/CH));$('#ubtn').hidden=true;$('#ub').hidden=false;$('#ut').hidden=false;
 const b64=part=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;fr.readAsDataURL(part)});
 try{for(let i=0;i<n;i++){$('#ut').textContent=`Enviando tu video… ${Math.round(i/n*100)}%`;$('#up').style.width=(i/n*100)+'%';const data=await b64(blob.slice(i*CH,(i+1)*CH));let r=null;
   for(let k=0;k<3&&!(r&&r.ok);k++){r=await CFG.call(CFG.kind==='est'?'sOfferUp':'tOfferUp',{id:cur.id,i,n,mime:blob.type||'video/mp4',dur,data}).catch(()=>null);}
   if(!r||!r.ok)throw new Error((r&&r.err)||'net');}
  $('#up').style.width='100%';UPL=false;
  M().innerHTML=`<div class="card mst-pc"><span class="mst-big ok">${SVG(IC.check)}</span><div class="mst-tt">¡Video enviado!</div><p class="sub">La administración lo revisará. Cuando lo apruebe, ${cur.aud==='est'?'la clase gratis se suma a tu saldo':'los '+PRIZE()+' se suman a tu pago del mes'} y te llega un aviso y un correo.</p><button class="btn" id="mst-ok">Entendido</button></div>`;
  $('#mst-ok').onclick=()=>{close();CFG.onDone&&CFG.onDone();};
 }catch(e){UPL=false;$('#ub').hidden=true;$('#ut').textContent='No se pudo enviar. Revisa tu internet e inténtalo de nuevo.';$('#ubtn').hidden=false;}}
return {open,close,isMobile:IS_MOB};
})();
