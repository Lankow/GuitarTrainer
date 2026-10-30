import { frequencyFor } from './pitch.ts';
import { CHORDS } from '../practice/chords.ts';
export type ChordDetection={id:string;confidence:number};
/** Radix-two FFT magnitudes after a Hann window. */
function spectrum(samples:Float32Array){
 const n=samples.length,re=new Float64Array(n),im=new Float64Array(n);let mean=0;for(const x of samples)mean+=x;mean/=n;
 for(let i=0;i<n;i++)re[i]=(samples[i]-mean)*(.5-.5*Math.cos(2*Math.PI*i/n));
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const t=re[i];re[i]=re[j];re[j]=t;}}
 for(let size=2;size<=n;size*=2){const angle=-2*Math.PI/size;for(let start=0;start<n;start+=size)for(let j=0;j<size/2;j++){const c=Math.cos(angle*j),s=Math.sin(angle*j),a=start+j,b=a+size/2,vr=re[b]*c-im[b]*s,vi=re[b]*s+im[b]*c;re[b]=re[a]-vr;im[b]=im[a]-vi;re[a]+=vr;im[a]+=vi;}}
 return Float64Array.from({length:n/2},(_,i)=>Math.hypot(re[i],im[i]));
}
const sinc=(x:number)=>Math.abs(x)<1e-8?1:Math.sin(Math.PI*x)/(Math.PI*x);
const lobe=(x:number)=>Math.abs(.5*sinc(x)+.25*sinc(x-1)+.25*sinc(x+1));
let cache:{key:string;columns:Float64Array[];gram:number[][];bins:number}|undefined;
function dictionary(n:number,rate:number,reference:number){
 const key=`${n}:${rate}:${reference}`;if(cache?.key===key)return cache;
 const bins=Math.min(n/2,Math.ceil(5000*n/rate));
 const columns=Array.from({length:48},(_,i)=>{const v=new Float64Array(bins);const f=frequencyFor(36+i,reference);for(let h=1;h<=6;h++){const center=f*h*n/rate;for(let b=Math.max(1,Math.floor(center)-3);b<=Math.min(bins-1,Math.ceil(center)+3);b++)v[b]+=lobe(b-center)/h**1.3;}const norm=Math.hypot(...v);return v.map(x=>x/norm);});
 const gram=columns.map(a=>columns.map(b=>{let sum=0;for(let k=0;k<bins;k++)sum+=a[k]*b[k];return sum;}));
 return cache={key,columns,gram,bins};
}
/** Experimental harmonic-template decomposition, followed by pitch-class chord matching. */
export function detectChord(samples:Float32Array,rate:number,gate=-55,reference=440):ChordDetection|null {
 if(!Number.isFinite(rate)||rate<8000||rate>192000||samples.length<4096||samples.length>32768||(samples.length&(samples.length-1))!==0||![432,440,442].includes(reference))return null;
 let sum=0,mean=0;for(const x of samples){if(!Number.isFinite(x))return null;sum+=x*x;mean+=x;}const energy=sum/samples.length-(mean/samples.length)**2;if(energy<10**(gate/10))return null;
 const spec=spectrum(samples),d=dictionary(samples.length,rate,reference);
 const dots=d.columns.map(col=>{let sum=0;for(let i=0;i<d.bins;i++)sum+=col[i]*spec[i];return sum;});
 const weights=new Float64Array(48);
 for(let pass=0;pass<30;pass++)for(let i=0;i<48;i++){let residual=dots[i];for(let j=0;j<48;j++)if(j!==i)residual-=d.gram[i][j]*weights[j];weights[i]=Math.max(0,residual);}
 const chroma=new Float64Array(12);for(let i=0;i<48;i++)chroma[i%12]+=weights[i];
 const peak=Math.max(...chroma);if(!peak)return null;
 const active=chroma.map(v=>v<peak*.14?0:v**.25);const norm=Math.hypot(...active);
 if(active.filter(v=>v>0).length<3)return null;
 const roots=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
 const candidates=roots.flatMap((root,r)=>[{suffix:'',steps:[0,4,7]},{suffix:'m',steps:[0,3,7]},{suffix:'7',steps:[0,4,7,10]}].map(type=>{const pcs=type.steps.map(n=>(n+r)%12);const score=pcs.reduce((s,pc)=>s+active[pc],0)/(norm*Math.sqrt(pcs.length));return {id:root+type.suffix,score,complete:pcs.every(pc=>active[pc]>0)};})).sort((a,b)=>b.score-a.score);
 const best=candidates[0];if(!best.complete||best.score<.90||best.score-candidates[1].score<.04||!CHORDS.some(c=>c.id===best.id))return null;
 return {id:best.id,confidence:best.score};
}

