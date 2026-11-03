(function(){
'use strict';
const CHIPS=[{value:25,name:'Vert',color:'#69BC48'},{value:50,name:'Bleu',color:'#159ED1'},{value:100,name:'Noir',color:'#292B35'},{value:500,name:'Violet',color:'#7850B2'},{value:1000,name:'Jaune',color:'#F3CC27'},{value:5000,name:'Rose',color:'#E65B9B'},{value:10000,name:'Orange',color:'#ED882A'}];
const $=id=>document.getElementById(id);
const fmt=n=>n.toLocaleString('fr-FR');
let previousFocus=null,photoUrl=null;
// 10.4.154 — pas des boutons + / − (1, 5, 10, 20), mémorisé sur l'appareil : les jetons se comptent souvent par piles.
const STEPS=[1,5,10,20],STEP_KEY='bptStackStep';
let step=1;try{const s=Number(localStorage.getItem(STEP_KEY));if(STEPS.includes(s))step=s;}catch(_){}
function setStepSize(n){step=STEPS.includes(n)?n:1;try{localStorage.setItem(STEP_KEY,String(step));}catch(_){}
 document.querySelectorAll('#bptStackStepBar [data-step]').forEach(b=>{const on=Number(b.dataset.step)===step;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',on?'true':'false');});
 document.querySelectorAll('.bpt-stack-line').forEach(line=>{const name=line.dataset.name,n=step===1?'un jeton':step+' jetons';
  line.querySelector('[data-delta="-1"]').setAttribute('aria-label','Retirer '+n+' '+name);line.querySelector('[data-delta="1"]').setAttribute('aria-label','Ajouter '+n+' '+name);
  line.querySelector('[data-delta="-1"]').textContent=step===1?'−':'−'+step;line.querySelector('[data-delta="1"]').textContent=step===1?'+':'+'+step;});
 const lines=document.getElementById('bptStackLines');if(lines)lines.classList.toggle('bpt-stack-step-big',step>1);}
function update(){let total=0,count=0;document.querySelectorAll('.bpt-stack-line').forEach(line=>{let n=Math.max(0,Math.min(99999,parseInt(line.querySelector('input').value,10)||0));count+=n;total+=n*Number(line.dataset.value)});$('bptStackTotal').textContent=fmt(total);$('bptStackCount').textContent=fmt(count)+' jeton'+(count===1?'':'s');}
function open(){previousFocus=document.activeElement;const m=$('bptStackModal');m.hidden=false;m.setAttribute('aria-hidden','false');const first=m.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');if(first&&first.focus)first.focus();}
function close(){const m=$('bptStackModal');m.hidden=true;m.setAttribute('aria-hidden','true');if(previousFocus&&previousFocus.focus)previousFocus.focus();}
// API stable : la fermeture n'est plus liée à la présence d'une croix dans le HTML.
window.BPTStackScanner={open,close};
function init(){const modal=$('bptStackModal'),lines=$('bptStackLines');if(!modal||!lines)return;
CHIPS.forEach(c=>{const row=document.createElement('div');row.className='bpt-stack-line';row.dataset.value=c.value;row.dataset.name=c.name;row.innerHTML='<span class="bpt-stack-dot" style="--chip:'+c.color+'"></span><span class="bpt-stack-label"><strong>'+c.name+'</strong><small>'+fmt(c.value)+' points</small></span><button type="button" data-delta="-1" aria-label="Retirer un jeton '+c.name+'">−</button><input type="number" inputmode="numeric" min="0" max="99999" step="1" value="0" aria-label="Quantité '+c.name+'"/><button type="button" data-delta="1" aria-label="Ajouter un jeton '+c.name+'">+</button>';lines.appendChild(row)});
 const stepBar=document.createElement('div');stepBar.id='bptStackStepBar';stepBar.className='bpt-stack-stepbar';stepBar.setAttribute('role','group');stepBar.setAttribute('aria-label','Pas des boutons plus et moins');
 stepBar.innerHTML='<span>Pas des boutons + / −</span>'+STEPS.map(n=>'<button type="button" data-step="'+n+'">'+n+'</button>').join('');
 lines.parentNode.insertBefore(stepBar,lines);
 stepBar.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)setStepSize(Number(b.dataset.step));});
 setStepSize(step);
 document.addEventListener('click',e=>{const b=e.target.closest('.bpt-stack-open');if(b){e.preventDefault();open();}});
 modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
 lines.addEventListener('click',e=>{const b=e.target.closest('[data-delta]');if(!b)return;const i=b.parentElement.querySelector('input');i.value=Math.max(0,Math.min(99999,(parseInt(i.value,10)||0)+Number(b.dataset.delta)*step));update()});lines.addEventListener('input',update);
 $('bptStackReset').addEventListener('click',()=>{lines.querySelectorAll('input').forEach(i=>i.value=0);update()});

 $('bptStackFile').addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){$('bptStackMessage').textContent='Choisissez une image.';return;}if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(file);$('bptStackPreview').src=photoUrl;$('bptStackPhotoWrap').hidden=false;$('bptStackZoom').value=100;zoom();});
 function zoom(){const n=Number($('bptStackZoom').value);$('bptStackPreview').style.width=n+'%';$('bptStackZoomVal').textContent=n+' %';} $('bptStackZoom').addEventListener('input',zoom);
 window.addEventListener('pagehide',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl)});update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();