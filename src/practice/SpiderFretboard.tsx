import { useEffect, useState, useRef } from 'react';
import { tr } from '../i18n';
import type { FretPosition } from './spiderLibrary';
export function SpiderFretboard({frets,notes,target,onPick,lockedString,hideStringLabels=false}:{frets:number;notes:FretPosition[];target?:FretPosition;onPick?:(note:FretPosition)=>void;lockedString?:number;hideStringLabels?:boolean}) {
 const gesture=useRef<{id:number;x:number;y:number}|null>(null);
 const suppressClick=useRef(false);
 function move(direction:number){setOffset(v=>Math.max(0,Math.min(maxOffset,v+direction*4)));}
 const [offset,setOffset]=useState(0);
 const width=Math.min(5,frets+1),maxOffset=Math.max(0,frets-width+1),start=Math.min(offset,maxOffset);
 useEffect(()=>{if(target)setOffset(v=>target.fret<v?target.fret:target.fret>=v+width?Math.min(maxOffset,target.fret-width+1):v);},[target?.fret,width,maxOffset]);
 return <div className="fretboard-browser">
 {!hideStringLabels&&<div className="fretboard-navigation"><button type="button" className="secondary-button" aria-label={tr('Previous frets')} disabled={start===0} onClick={()=>move(-1)}>←</button><span aria-live="polite">{tr('Frets {0}–{1}',start,start+width-1)}</span><button type="button" className="secondary-button" aria-label={tr('Next frets')} disabled={start===maxOffset} onClick={()=>move(1)}>→</button></div>}
 <div className={hideStringLabels?'creator-board-frame':''}>
 {hideStringLabels&&<button className="secondary-button fret-side-button" type="button" aria-label={tr('Previous frets')} disabled={start===0} onClick={()=>move(-1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2"/></svg></button>}

 <div className="creator-fretboard fretboard-swipe" tabIndex={0} role="group" aria-label={tr('Fretboard guide: string 1 at top, string 6 at bottom')}
 onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}}}
 onPointerDown={e=>{if(!e.isPrimary||e.button!==0)return;gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY};suppressClick.current=false;}}
 onPointerMove={e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){suppressClick.current=true;e.currentTarget.setPointerCapture(e.pointerId);}}}
 onPointerUp={e=>{const g=gesture.current;gesture.current=null;if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)>=40&&Math.abs(dx)>Math.abs(dy)){suppressClick.current=true;move(dx<0?1:-1);}}}
 onPointerCancel={()=>{gesture.current=null;suppressClick.current=true;}}
 onClickCapture={e=>{if(suppressClick.current&&e.detail!==0){e.preventDefault();e.stopPropagation();}}}>

 {[1,2,3,4,5,6].map(string=><div className={`creator-string ${lockedString&&lockedString!==string?'string-locked':''}`} style={{gridTemplateColumns:`${hideStringLabels?'':'60px '}repeat(${width},minmax(0,1fr))`}} key={string}>{!hideStringLabels&&<strong>{tr('String')} {string}</strong>}{Array.from({length:width},(_,i)=>start+i).map(fret=>{
 const positions=notes.flatMap((n,i)=>n.string===string&&n.fret===fret?[i+1]:[]);
 return <button type="button" key={fret} disabled={!onPick||(lockedString!==undefined&&lockedString!==string)} className={`${positions.length?'selected':''} ${target?.string===string&&target.fret===fret?'current':''}`} aria-label={tr('String {0} · Fret {1} · {2}',string,fret,positions.join(', '))} onClick={()=>onPick?.({string,fret})}><span>{fret}</span><small>{positions.join(', ')||'·'}</small></button>;
 })}</div>)}
 </div>
 {hideStringLabels&&<button className="secondary-button fret-side-button" type="button" aria-label={tr('Next frets')} disabled={start===maxOffset} onClick={()=>move(1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2"/></svg></button>}
 </div></div>;
}
