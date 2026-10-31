/* BPT — détection locale des faces de jetons (prototype expérimental).
 * Reconnaissance des anneaux colorés / centres clairs, suppression des doublons.
 * Une face visible = une détection ; les jetons dont seule la tranche est visible
 * ne sont pas dénombrés automatiquement. Aucun résultat n'est certifié.
 */
(function(){'use strict';
const $=id=>document.getElementById(id);
const VALUES={green:25,blue:50,black:100,purple:500,brown:5000,red:10000};
const COLORS=Object.keys(VALUES);
function hsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h=(h*60+360)%360;}return [h,max?d/max:0,max];}
function label(r,g,b){const [h,s,v]=hsv(r,g,b);if(v<.12)return null;
 if(v<.36 && s<.30)return 'black';
 if(s<.13)return null;
 if((h>=345||h<12)&&s>.26&&v>.27)return 'red';
 if(h>=185&&h<=246&&s>.28)return 'blue';
 if(h>=258&&h<=330&&s>.15&&v<.8)return 'purple';
 if(h>=72&&h<=172&&s>.24)return 'green';
 if(h>=13&&h<=65&&s>.20&&v<.82)return 'brown';
 return null;
}
function analyze(img){let w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)throw Error('Photo non disponible');const scale=Math.min(1,720/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const data=ctx.getImageData(0,0,w,h).data;const colors=new Uint8Array(w*h),light=new Uint8Array(w*h);const ids={green:1,blue:2,black:3,purple:4,brown:5,red:6};
 for(let i=0;i<w*h;i++){const off=i*4,r=data[off],g=data[off+1],b=data[off+2],sat=Math.max(r,g,b)-Math.min(r,g,b),lum=(r+g+b)/3;const key=label(r,g,b);if(key)colors[i]=ids[key];light[i]=(lum>93 && sat<55)?1:0;}
 const minDim=Math.min(w,h);const radii=[];for(let r=Math.max(13,Math.round(minDim*.027));r<=Math.min(90,minDim*.17);r=Math.round(r*1.19)+1)radii.push(r);
 const candidates=[];const samples=32;const co=Array.from({length:samples},(_,i)=>Math.cos(i*2*Math.PI/samples));const si=co.map((_,i)=>Math.sin(i*2*Math.PI/samples));
 const step=Math.max(3,Math.round(minDim/130));
 function get(x,y){const xx=Math.round(x),yy=Math.round(y);return xx>=0&&yy>=0&&xx<w&&yy<h?yy*w+xx:-1;}
 for(const rad of radii){const ringRad=rad*.80,innerRad=rad*.38;
  for(let y=rad;y<h-rad;y+=step)for(let x=rad;x<w-rad;x+=step){
   const counts=new Int16Array(7);let colored=0,bright=0;
   for(let t=0;t<samples;t++){let p=get(x+ringRad*co[t],y+ringRad*si[t]);if(p>=0&&colors[p]){counts[colors[p]]++;colored++;}
    if(t%2===0){p=get(x+innerRad*co[t],y+innerRad*si[t]);if(p>=0&&light[p])bright++;}}
   if(colored<9||bright<7)continue;
   const pairs=[[1,counts[1]],[2,counts[2]],[3,counts[3]],[4,counts[4]],[5,counts[5]],[6,counts[6]]].sort((a,b)=>b[1]-a[1]);
   const top=pairs[0],second=pairs[1];
   if(top[1]<Math.max(8,colored*.52))continue;
   // Les inserts verts des jetons 5000 ne doivent pas créer des jetons de 25.
   // Sur un anneau marron, priorité au marron si sa présence est dominante.
   let id=top[0];if(id===1&&counts[5]>=Math.max(5,counts[1]*.58))id=5;
   const score=counts[id]/samples+bright/16*.28-(second[1]/samples)*.25;
   if(score<.36)continue;
   candidates.push({x,y,r:rad,id,score});
  }
 }
 candidates.sort((a,b)=>b.score-a.score);
 const faces=[];
 for(const c of candidates){if(faces.length>140)break;
  const duplicate=faces.some(f=>Math.hypot(f.x-c.x,f.y-c.y)<Math.min(f.r,c.r)*.72);
  if(!duplicate)faces.push(c);
 }
 const quantities={green:0,blue:0,black:0,purple:0,brown:0,red:0};for(const face of faces){const key=COLORS[face.id-1];if(key)quantities[key]++;}
 return {faces,quantities,width:w,height:h};
}
function status(s){const e=$('bptStackAutoStatus');if(e)e.textContent=s;}
function init(){const btn=$('bptStackAuto'),preview=$('bptStackPreview'),file=$('bptStackFile');if(!btn||!preview||!file)return;
 btn.textContent='Détecter les jetons visibles (bêta)';
 btn.addEventListener('click',async()=>{if(!file.files?.length){status('Choisis une photo pour lancer le comptage.');return;}btn.disabled=true;status('Recherche des faces de jetons et suppression des détections en double…');
 try{if(!preview.complete||!preview.naturalWidth)await new Promise((resolve,reject)=>{preview.addEventListener('load',resolve,{once:true});preview.addEventListener('error',reject,{once:true});});await new Promise(r=>requestAnimationFrame(r));const result=analyze(preview);let n=0;
  for(const key of COLORS){const input=document.querySelector('.bpt-stack-line[data-value="'+VALUES[key]+'"] input');if(input)input.value=result.quantities[key];n+=result.quantities[key];}
  $('bptStackLines')?.dispatchEvent(new Event('input',{bubbles:true}));
  status('Détection de '+n+' face'+(n>1?'s':'')+' visible'+(n>1?'s':'')+'. Attention : les tranches sous une face, les jetons très proches et les piles épaisses peuvent ne pas être comptés. Corrige les quantités avant utilisation. Photo traitée uniquement sur cet appareil.');
  const badge=$('bptStackAutoBadge');if(badge){badge.hidden=false;badge.textContent='Estimation non validée : vérifier les épaisseurs et les 6 couleurs';}
 }catch(e){status('Analyse impossible : '+(e.message||'erreur inconnue'));}finally{btn.disabled=false;}});
 file.addEventListener('change',()=>{status('Photo sélectionnée. Lance la détection puis vérifie les jetons superposés.');const badge=$('bptStackAutoBadge');if(badge)badge.hidden=true;});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
