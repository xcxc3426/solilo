import {VIEWS,paintScreen} from './render.mjs';
const $=id=>document.getElementById(id);
async function start(){
 const atlas=globalThis.SOLILO_ATLAS??await fetch('./data/atlas.json').then(r=>{if(!r.ok)throw new Error('Could not read room atlas');return r.json();});
 const canvas=$('terminal'),ctx=canvas.getContext('2d');let view=VIEWS[0].id;
 for(const v of VIEWS){const b=document.createElement('button');b.type='button';b.textContent=String(VIEWS.indexOf(v)+1).padStart(2,'0')+' '+v.title;b.dataset.view=v.id;b.addEventListener('click',()=>choose(v.id));$('views').append(b);}
 for(const r of atlas.rooms){const o=document.createElement('option');o.value=r.id;o.textContent=`ROOM/${String(r.id).padStart(3,'0')} ${r.name}`;$('room').append(o);}
 function render(){paintScreen(ctx,view,atlas,{selectedRoom:Number($('room').value),step:Number($('step').value)});$('step-count').textContent=$('step').value;$('terminal').setAttribute('aria-label',VIEWS.find(v=>v.id===view).title+' — scripted ASCII replay');}
 function choose(id){view=id;$('room').value=VIEWS.find(v=>v.id===id).room;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));render();}
 $('room').addEventListener('change',render);$('step').addEventListener('input',render);$('export').addEventListener('click',()=>{const a=document.createElement('a');a.download='solilo-'+view+'.png';a.href=canvas.toDataURL('image/png');a.click();});
 $('next').addEventListener('click',()=>choose(VIEWS[(VIEWS.findIndex(v=>v.id===view)+1)%VIEWS.length].id));
 $('prev').addEventListener('click',()=>choose(VIEWS[(VIEWS.findIndex(v=>v.id===view)+VIEWS.length-1)%VIEWS.length].id));
 try{await document.fonts.load('18px "Solilo Mono"');}catch{}choose(view);$('status').textContent='Ready. Every frame renders from the bundled atlas. No wallet or network connection.';
}
start().catch(e=>{$('status').textContent=e.message+'. Open the standalone SOLILO.html or use the local server.';});
