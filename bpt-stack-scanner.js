(function(){
'use strict';
const CHIPS=[{value:25,name:'Vert / marron',color:'#6fc64a'},{value:50,name:'Bleu / blanc',color:'#169cd7'},{value:100,name:'Noir / rose',color:'#34333e'},{value:500,name:'Violet / blanc',color:'#4e376b'},{value:5000,name:'Marron / vert',color:'#805334'},{value:10000,name:'Rouge / blanc',color:'#d74750'}];
const $=id=>document.getElementById(id);
const fmt=n=>n.toLocaleString('fr-FR');
let previousFocus=null,photoUrl=null;
function update(){let total=0,count=0;document.querySelectorAll('.bpt-stack-line').forEach(line=>{let n=Math.max(0,Math.min(99999,parseInt(line.querySelector('input').value,10)||0));count+=n;total+=n*Number(line.dataset.value)});$('bptStackTotal').textContent=fmt(total);$('bptStackCount').textContent=fmt(count)+' jeton'+(count===1?'':'s');}
function open(){previousFocus=document.activeElement;const m=$('bptStackModal');m.hidden=false;m.setAttribute('aria-hidden','false');$('bptStackClose').focus();}
function close(){const m=$('bptStackModal');m.hidden=true;m.setAttribute('aria-hidden','true');if(previousFocus&&previousFocus.focus)previousFocus.focus();}
function init(){const modal=$('bptStackModal'),lines=$('bptStackLines');if(!modal||!lines)return;
CHIPS.forEach(c=>{const row=document.createElement('div');row.className='bpt-stack-line';row.dataset.value=c.value;row.innerHTML='<span class="bpt-stack-dot" style="--chip:'+c.color+'"></span><span class="bpt-stack-label"><strong>'+c.name+'</strong><small>'+fmt(c.value)+' points</small></span><button type="button" data-delta="-1" aria-label="Retirer un jeton '+c.name+'">−</button><input type="number" inputmode="numeric" min="0" max="99999" step="1" value="0" aria-label="Quantité '+c.name+'"/><button type="button" data-delta="1" aria-label="Ajouter un jeton '+c.name+'">+</button>';lines.appendChild(row)});
 document.addEventListener('click',e=>{const b=e.target.closest('.bpt-stack-open');if(b){e.preventDefault();open();}});
 $('bptStackClose').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
 lines.addEventListener('click',e=>{const b=e.target.closest('[data-delta]');if(!b)return;const i=b.parentElement.querySelector('input');i.value=Math.max(0,(parseInt(i.value,10)||0)+Number(b.dataset.delta));update()});lines.addEventListener('input',update);
 $('bptStackReset').addEventListener('click',()=>{lines.querySelectorAll('input').forEach(i=>i.value=0);update()});
 $('bptStackCopy').addEventListener('click',async()=>{let t=$('bptStackTotal').textContent.replace(/[^0-9]/g,'');try{await navigator.clipboard.writeText(t);$('bptStackMessage').textContent='Total copié : '+fmt(Number(t));}catch(_){$('bptStackMessage').textContent='Copie non disponible : '+fmt(Number(t));}});
 $('bptStackFile').addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){$('bptStackMessage').textContent='Choisissez une image.';return;}if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(file);$('bptStackPreview').src=photoUrl;$('bptStackPhotoWrap').hidden=false;$('bptStackZoom').value=100;zoom();});
 function zoom(){const n=Number($('bptStackZoom').value);$('bptStackPreview').style.width=n+'%';$('bptStackZoomVal').textContent=n+' %';} $('bptStackZoom').addEventListener('input',zoom);
 window.addEventListener('pagehide',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl)});update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();