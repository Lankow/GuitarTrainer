import { useEffect, useState } from 'react';
import { tr } from '../i18n';
import type { FretPosition } from './spiderLibrary';
export function SpiderFretboard({frets,notes,target,onPick,lockedString,hideStringLabels=false}:{frets:number;notes:FretPosition[];target?:FretPosition;onPick?:(note:FretPosition)=>void;lockedString?:number;hideStringLabels?:boolean}) {
 const [offset,setOffset]=useState(0);
 const width=Math.min(5,frets+1),maxOffset=Math.max(0,frets-width+1),start=Math.min(offset,maxOffset);
 useEffect(()=>{if(target)setOffset(v=>target.fret<v?target.fret:target.fret>=v+width?Math.min(maxOffset,target.fret-width+1):v);},[target?.fret,width,maxOffset]);
 return <div className="fretboard-browser">
 <div className="fretboard-navigation"><button type="button" className="secondary-button" aria-label={tr('Previous frets')} disabled={start===0} onClick={()=>setOffset(Math.max(0,start-4))}>←</button><span aria-live="polite">{tr('Frets {0}–{1}',start,start+width-1)}</span><button type="button" className="secondary-button" aria-label={tr('Next frets')} disabled={start===maxOffset} onClick={()=>setOffset(Math.min(maxOffset,start+4))}>→</button></div>
 <div className="creator-fretboard" role="group" aria-label={tr('Fretboard guide: string 1 at top, string 6 at bottom')}>
 {[1,2,3,4,5,6].map(string=><div className={`creator-string ${lockedString&&lockedString!==string?'string-locked':''}`} style={{gridTemplateColumns:`${hideStringLabels?'':'60px '}repeat(${width},minmax(0,1fr))`}} key={string}>{!hideStringLabels&&<strong>{tr('String')} {string}</strong>}{Array.from({length:width},(_,i)=>start+i).map(fret=>{
 const positions=notes.flatMap((n,i)=>n.string===string&&n.fret===fret?[i+1]:[]);
 return <button type="button" key={fret} disabled={!onPick||(lockedString!==undefined&&lockedString!==string)} className={`${positions.length?'selected':''} ${target?.string===string&&target.fret===fret?'current':''}`} aria-label={tr('String {0} · Fret {1} · {2}',string,fret,positions.join(', '))} onClick={()=>onPick?.({string,fret})}><span>{fret}</span><small>{positions.join(', ')||'·'}</small></button>;
 })}</div>)}
 </div></div>;
}
