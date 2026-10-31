/* BPT 10.4.119 — diagnostic conservateur des faces visibles.
   Les faces doivent être identifiées par un centre clair unique, pas par balayage de cercles.
   Ne compte ni les tranches cachées ni les piles complètes. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const keys=['green','blue','black','purple','brown','red'];
const val={green:25,blue:50,black:100,purple:500,brown:5000,red:10000};
const rgb={green:'#70c943',blue:'#12a4de',black:'#383342',purple:'#5b4275',brown:'#926038',red:'#d94a4d'};
function hsv(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;let h=0;if(d){if(M===r)h=((g-b)/d)%6;else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=(h*60+360)%360;}return [h,M?d/M:0,M];}
function classify(r,g,b){const [h,s,v]=hsv(r,g,b);if(v<.36&&s<.25)return 'black';if(s<.19)return null;if((h>=345||h<15)&&v>.27)return 'red';if(h>=185&&h<=250&&s>.27)return 'blue';if(h>=258&&h<=335&&s>.16&&v<.82)return 'purple';if(h>=75&&h<=171&&s>.25)return 'green';if(h>=13&&h<=72&&s>.19&&v<.85)return 'brown';return null;}
function analyze(img){const scale=Math.min(1,720/Math.max(img.naturalWidth,img.naturalHeight));const w=Math.round(img.naturalWidth*scale),h=Math.round(img.naturalHeight*scale);if(w<100||h<100)throw Error('Photo trop petite');const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const d=ctx.getImageData(0,0,w,h).data;const centers=new Uint8Array(w*h),seen=new Uint8Array(w*h);const color=new Uint8Array(w*h);const ids=Object.fromEntries(keys.map((k,i)=>[k,i+1]));
for(let i=0;i<w*h;i++){const j=i*4,r=d[j],g=d[j+1],b=d[j+2],max=Math.max(r,g,b),min=Math.min(r,g,b);const lum=(r+g+b)/3;centers[i]=lum>125&&max-min<65?1:0;const t=classify(r,g,b);if(t)color[i]=ids[t];}
// Each white central label gives one connected component. Reject implausible shape/size.
const minDim=Math.min(w,h),minArea=Math.max(28,Math.round(minDim*minDim*.00016));let candidates=[];
for(let start=0;start<centers.length;start++){if(!centers[start]||seen[start])continue;const q=[start];seen[start]=1;let head=0,minx=w,maxx=0,miny=h,maxy=0,sx=0,sy=0;
while(head<q.length){const p=q[head++],x=p%w,y=(p/w)|0;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);sx+=x;sy+=y;for(const n of [p-1,p+1,p-w,p+w]){if(n<0||n>=centers.length)continue;if((n===p-1&&x===0)||(n===p+1&&x===w-1))continue;if(centers[n]&&!seen[n]){seen[n]=1;q.push(n);}}}
const area=q.length,bw=maxx-minx+1,bh=maxy-miny+1,ratio=bw/bh;
if(area<minArea||area>w*h*.045||ratio<.58||ratio>1.72||bw<minDim*.045||bw>minDim*.43||bh<minDim*.045||bh>minDim*.43)continue;
const x=sx/area,y=sy/area,r=Math.max(bw,bh)*.85;let totals=new Array(7).fill(0),hits=0;for(let k=0;k<72;k++){const a=k*2*Math.PI/72,px=Math.round(x+Math.cos(a)*r),py=Math.round(y+Math.sin(a)*r);if(px<0||px>=w||py<0||py>=h)continue;const id=color[py*w+px];if(id){totals[id]++;hits++;}}
let best=1;for(let id=2;id<=6;id++)if(totals[id]>totals[best])best=id;
const coverage=totals[best]/72,dominance=hits?totals[best]/hits:0;
if(coverage<.19||dominance<.48)continue;
if(best===1&&totals[5]>totals[1]*.55)best=5;
candidates.push({x,y,r,id:best,confidence:coverage*dominance});}
candidates.sort((a,b)=>b.confidence-a.confidence);
const faces=[];for(const f of candidates){if(!faces.some(p=>Math.hypot(p.x-f.x,p.y-f.y)<Math.max(p.r,f.r)*.55))faces.push(f);}
return {faces,w,h,canvas:c};}
function draw(result){let old=$('bptStackDiagnostic');if(old)old.remove();const wrap=$('bptStackPhotoWrap');const cv=document.createElement('canvas');cv.id='bptStackDiagnostic';cv.width=result.w;cv.height=result.h;cv.style.cssText='display:block;width:100%;height:auto;max-width:100%;border:2px solid #27b0c4;border-radius:8px;';const ctx=cv.getContext('2d');ctx.drawImage(result.canvas,0,0);const font=Math.max(12,Math.round(result.w/35));ctx.font='bold '+font+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';result.faces.forEach((f,i)=>{ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.strokeStyle=rgb[keys[f.id-1]];ctx.lineWidth=Math.max(2,result.w/180);ctx.stroke();ctx.fillStyle='#071a2b';ctx.fillRect(f.x-font*.65,f.y-font*.65,font*1.3,font*1.3);ctx.fillStyle='white';ctx.fillText(String(i+1),f.x,f.y);});const caption=document.createElement('p');caption.id='bptStackDiagnosticCaption';caption.className='bpt-stack-tip';caption.textContent='Diagnostic : chaque cercle représente UNE face candidate, et non une pile complète. Vérifie chaque numéro.';wrap.append(cv,caption);}
function status(t){const el=$('bptStackAutoStatus');if(el)el.textContent=t;}
function init(){const btn=$('bptStackAuto'),img=$('bptStackPreview'),file=$('bptStackFile');if(!btn||!img||!file)return;btn.textContent='Analyser les faces (diagnostic)';btn.addEventListener('click',async()=>{if(!file.files?.length){status('Choisis une photo.');return;}btn.disabled=true;status('Analyse des centres de jetons en cours…');try{if(!img.complete||!img.naturalWidth)await new Promise((ok,fail)=>{img.addEventListener('load',ok,{once:true});img.addEventListener('error',fail,{once:true});});await new Promise(r=>requestAnimationFrame(r));const res=analyze(img);draw(res);let count=res.faces.length;const badge=$('bptStackAutoBadge');if(badge){badge.hidden=false;badge.textContent='DIAGNOSTIC SEUL : aucune quantité modifiée automatiquement. Les tranches doivent être ajoutées manuellement.';}
status(count+' face(s) candidate(s) entourée(s) et numérotée(s). Vérifie les faux positifs, puis saisis manuellement les quantités réelles dans le tableau. Aucun calcul automatique non fiable n’est appliqué.');}
catch(e){status('Diagnostic impossible : '+(e.message||e));}finally{btn.disabled=false;}});
file.addEventListener('change',()=>{const c=$('bptStackDiagnostic'),l=$('bptStackDiagnosticCaption');if(c)c.remove();if(l)l.remove();status('Photo chargée. Lance le diagnostic puis vérifie les tranches.');});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
