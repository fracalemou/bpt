/* BPT scanner — estimation locale expérimentale, sans API ni transfert de photo.
 * Détecte les régions de couleurs dominantes et estime le nombre de faces apparentes.
 * Ce n'est PAS un détecteur fiable de couches occultées. Validation manuelle obligatoire.
 */
(function(){'use strict';
const refs=[{v:25,key:'green'},{v:50,key:'blue'},{v:100,key:'black'},{v:500,key:'purple'},{v:5000,key:'brown'},{v:10000,key:'red'}];
const $=id=>document.getElementById(id);
let lastRegions=[];
function classify(r,g,b){
 const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 if(max<55||d<15)return null;
 // RGB couleur saturée; le vert des inserts sur jetons 5000 reste ambigu.
 if(r>g*1.28&&r>b*1.25&&r>90)return 'red';
 if(b>r*1.15&&b>g*1.05&&b>75&&b-r>18)return 'blue';
 if(g>r*1.18&&g>b*.98&&g>70)return 'green';
 if(r>54&&b>49&&b>g*1.14&&r>g*1.12&&Math.abs(r-b)<95)return 'purple';
 if(r>65&&g>40&&r>g*1.13&&g>b*1.09)return 'brown';
 return null;
}
function analyze(img){
 const c=document.createElement('canvas');let w=img.naturalWidth,h=img.naturalHeight;
 if(!w||!h)throw Error('Image non chargée');const s=Math.min(1,950/Math.max(w,h));w=Math.max(1,Math.round(w*s));h=Math.max(1,Math.round(h*s));c.width=w;c.height=h;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
 const rgb=ctx.getImageData(0,0,w,h).data;
 const step=3,gw=Math.ceil(w/step),gh=Math.ceil(h/step),N=gw*gh;
 const mask=new Uint8Array(N),idx={green:1,blue:2,black:3,purple:4,brown:5,red:6};
 for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){
  const px=Math.min(w-1,x*step+1),py=Math.min(h-1,y*step+1),i=(py*w+px)*4;
  const cl=classify(rgb[i],rgb[i+1],rgb[i+2]);if(cl)mask[y*gw+x]=idx[cl];
 }
 // 8-connected components for saturated colored patches.
 let components=[];const visited=new Uint8Array(N),queue=new Int32Array(N);
 for(let seed=0;seed<N;seed++){
  if(!mask[seed]||visited[seed])continue;
  const color=mask[seed];let start=0,end=1;queue[0]=seed;visited[seed]=1;
  let area=0,minX=gw,minY=gh,maxX=0,maxY=0;
  while(start<end){const p=queue[start++],x=p%gw,y=(p/gw)|0;area++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=gw||yy<0||yy>=gh)continue;
    const q=yy*gw+xx;if(!visited[q]&&mask[q]===color){visited[q]=1;queue[end++]=q;}
   }
  }
  if(area>=15)components.push({color,area,x:minX*step,y:minY*step,w:(maxX-minX+1)*step,h:(maxY-minY+1)*step});
 }
 // Join colored fragments belonging to the same chip group; white inserts split a chip into arcs.
 components=components.sort((a,b)=>b.area-a.area).slice(0,500);
 const byColor={};for(const key of Object.keys(idx))byColor[key]=[];
 for(const comp of components){const key=Object.keys(idx).find(k=>idx[k]===comp.color);if(key)byColor[key].push(comp);}
 // Heuristic: multiple islands of one ring compose one face. Group nearby islands, never assume every island is a chip.
 const results={};for(const [key,parts] of Object.entries(byColor)){
  const sizable=parts.filter(p=>p.area>=Math.max(20,N*.00012));
  const groups=[];
  for(const part of sizable){const cx=part.x+part.w/2,cy=part.y+part.h/2;
   const near=groups.find(g=>Math.hypot(g.cx-cx,g.cy-cy)<Math.max(35,Math.min(w,h)*.095));
   if(near){const a=near.area+part.area;near.cx=(near.cx*near.area+cx*part.area)/a;near.cy=(near.cy*near.area+cy*part.area)/a;near.area=a;near.parts.push(part);}
   else groups.push({cx,cy,area:part.area,parts:[part]});
  }
  const meaningful=groups.filter(g=>g.area>Math.max(45,N*.0005));
  results[key]={quantity:meaningful.length,groups:meaningful};
 }
 return {results,components,width:w,height:h};
}
function status(txt){const el=$('bptStackAutoStatus');if(el)el.textContent=txt;}
function init(){const btn=$('bptStackAuto');if(!btn)return;
 btn.addEventListener('click',async()=>{
  const img=$('bptStackPreview'),file=$('bptStackFile');if(!file||!file.files||!file.files.length){status('Prends une photo avant de lancer l’estimation.');return;}
  btn.disabled=true;status('Analyse locale des couleurs en cours…');
  try{
   if(!img.complete||!img.naturalWidth)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true})});
   await new Promise(r=>requestAnimationFrame(r));const analysis=analyze(img);lastRegions=analysis.components;
   let total=0;const notes=[];
   for(const ref of refs){const key=ref.key,qty=analysis.results[key].quantity;
     const input=document.querySelector('.bpt-stack-line[data-value="'+ref.v+'"] input');if(input)input.value=qty;
     total+=qty*ref.v;if(qty)notes.push(qty+' × '+ref.v.toLocaleString('fr-FR'));
   }
   const lines=$('bptStackLines');lines.dispatchEvent(new Event('input',{bubbles:true}));
   status('Estimation expérimentale : '+(notes.join(' · ')||'aucune face détectée')+'. Vérifie et ajuste chaque quantité : les jetons empilés, masqués et les couleurs des inserts peuvent être mal comptés. Aucune photo envoyée.');
   const badge=$('bptStackAutoBadge');if(badge){badge.hidden=false;badge.textContent='Estimation non validée — contrôler les tranches';}
  }catch(e){status('Analyse impossible : '+(e.message||'erreur inconnue'));}
  finally{btn.disabled=false;}
 });
 const input=$('bptStackFile');if(input)input.addEventListener('change',()=>{status('Photo sélectionnée : clique sur « Estimer par couleurs ».');const badge=$('bptStackAutoBadge');if(badge)badge.hidden=true;});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
