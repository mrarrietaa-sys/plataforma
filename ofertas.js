/* v573 · Ofertas de video: aviso al entrar (el primero que acepta se la gana) + barra «Tienes un video pendiente» */
window.MROFR=(function(){
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SVG=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const CAM='<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',CLK='<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
let C=null,busy=false;
const prize=o=>o.aud==='est'?'1 clase gratis':'$'+Number(o.pay||0).toLocaleString('es-CO');
const seen=id=>{try{return sessionStorage.getItem('mra_ofr_'+id)}catch(e){return null}},mark=id=>{try{sessionStorage.setItem('mra_ofr_'+id,'1')}catch(e){}};
function left(o){const t=new Date(String(o.taken||'').replace(' ','T'));const h=Math.max(0,48-(Date.now()-t)/36e5);return isFinite(h)?(h>=1?Math.floor(h)+' h':'menos de 1 h'):'48 h';}
function bar(r){const el=document.querySelector(C.mount);if(!el)return;const m=r&&r.mine;
 if(!m){el.innerHTML='';return;}
 if(m.st==='sent'){el.innerHTML=`<div class="ofr-bar"><span class="ofr-ic">${SVG(CLK)}</span><div><b>Tu video está en revisión</b><small>«${esc(m.topic)}» · cuando la administración lo apruebe te llega un aviso.</small></div></div>`;return;}
 el.innerHTML=`<div class="ofr-bar"><span class="ofr-ic">${SVG(CAM)}</span><div><b>${m.note?'Tu video necesita un cambio':'Tienes un video pendiente por grabar'}</b><small>${m.note?esc(m.note)+' · ':''}«${esc(m.topic)}» · ${prize(m)} · te quedan ${left(m)}</small></div><button type="button" id="ofr-rec">Grabar mi video</button></div>`;
 el.querySelector('#ofr-rec').onclick=()=>studio(m);}
function studio(o){if(!window.MRSTUDIO)return;MRSTUDIO.open({offer:o,kind:C.kind,name:C.name,call:C.call,onDone:()=>load()});}
function pop(o){mark(o.id);const est=o.aud==='est';const d=document.createElement('div');d.className='ofr-pop';
 d.innerHTML=`<div class="ofr-c"><span class="ofr-ic">${SVG(CAM)}</span><h3>${est?'Graba tu testimonio y gana <em>1 clase gratis</em>':'Aprovecha: graba un video y gana <em>'+prize(o)+'</em>'}</h3>
 <p class="ofr-t">Tema: <b>${esc(o.topic)}</b></p>
 <ul><li>Video vertical de <b>máximo 1 minuto</b>, grabado con tu celular aquí en la plataforma</li><li>Te damos el guion en pantalla y la plataforma lo edita sola</li><li>Tienes <b>48 horas</b> para enviarlo</li><li>${est?'Cuando la administración lo apruebe, la clase se suma a tu saldo':'Se paga si se aprueba · se suma a tu pago del mes'}</li></ul>
 <p class="ofr-w">Solo hay 1 cupo: el primero que acepte se lo gana.</p>
 <div class="ofr-b"><button type="button" class="go" id="ofr-ok">Acepto, lo grabo</button><button type="button" id="ofr-no">Ahora no</button></div></div>`;
 document.body.appendChild(d);d.querySelector('#ofr-no').onclick=()=>d.remove();
 d.querySelector('#ofr-ok').onclick=async()=>{const b=d.querySelector('#ofr-ok');b.disabled=true;b.textContent='Un momento…';
  const r=await C.call(C.kind==='est'?'sOfferTake':'tOfferTake',{id:o.id}).catch(()=>null);
  if(r&&r.ok){d.querySelector('.ofr-c').innerHTML=`<span class="ofr-ic" style="background:#16A34A">${SVG('<path d="M20 6 9 17l-5-5"/>')}</span><h3>¡Es tuyo!</h3><p class="ofr-t">Tienes 48 horas para grabarlo y enviarlo.${window.MRSTUDIO&&!MRSTUDIO.isMobile()?' <b>Grábalo desde tu celular</b>: entra a tu portal allá.':''}</p><div class="ofr-b" style="margin-top:16px"><button type="button" class="go" id="ofr-go">${window.MRSTUDIO&&MRSTUDIO.isMobile()?'Grabar ahora':'Entendido'}</button><button type="button" id="ofr-later">Más tarde</button></div>`;
   d.querySelector('#ofr-later').onclick=()=>d.remove();d.querySelector('#ofr-go').onclick=()=>{d.remove();if(MRSTUDIO.isMobile())studio(r.mine);};bar({mine:r.mine});}
  else d.querySelector('.ofr-c').innerHTML=`<h3>Este video ya fue tomado</h3><p class="ofr-t">${r&&r.err==='busy'?'Ya tienes otro video pendiente: envíalo primero.':'Otra persona aceptó primero. Te avisaremos en la próxima oferta.'}</p><div class="ofr-b" style="margin-top:16px"><button type="button" id="ofr-x">Cerrar</button></div>`,d.querySelector('#ofr-x').onclick=()=>d.remove();};}
async function load(){if(!C||busy)return;busy=true;const r=await C.call(C.kind==='est'?'sOffer':'tOffer',{}).catch(()=>null);busy=false;if(!r||!r.ok)return;bar(r);
 if(r.open&&!seen(r.open.id))whenFree(()=>{if(!seen(r.open.id))pop(r.open);});}
// espera a que no haya otra ventana abierta (contrato, acuerdo, tour, etc.) antes de mostrar el aviso
function blocked(){if(document.querySelector('.ofr-pop,.mst'))return true;const W=innerWidth,H=innerHeight;return [...document.body.children].some(e=>{if(e.id==='topbar'||e.tagName==='SCRIPT')return false;const cs=getComputedStyle(e);if(cs.position!=='fixed'||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return false;const b=e.getBoundingClientRect();return b.width>W*.6&&b.height>H*.6;});}
function whenFree(fn,n){n=n||0;if(!blocked())return fn();if(n<150)setTimeout(()=>whenFree(fn,n+1),2000);}
function init(cfg){C=cfg;load();}
/* v580: abrir la oferta desde la notificación */
async function show(){if(!C)return;const r=await C.call(C.kind==='est'?'sOffer':'tOffer',{}).catch(()=>null);if(!r||!r.ok)return;bar(r);const m=r.mine;if(m&&m.st==='taken')return studio(m);if(r.open)return pop(r.open);const el=document.querySelector(C.mount);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});}
return {init,load,show};
})();
