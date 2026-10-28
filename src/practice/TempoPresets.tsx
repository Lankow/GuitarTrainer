import { tr } from '../i18n';
import { useOptions } from '../options';
import { useEffect, useRef, useState } from 'react';

export function TempoPresets({recall}:{recall:(bpm:number)=>void}) {
 const [options,update]=useOptions();
 const presets=options.tempoPresets??[60,80,100,120];
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const held=useRef(false);
 const origin=useRef({x:0,y:0});
 const [message,setMessage]=useState('');
 function cancel(){if(timer.current!==null)clearTimeout(timer.current);timer.current=null;}
 useEffect(()=>()=>cancel(),[]);
 function begin(index:number){cancel();held.current=false;timer.current=setTimeout(()=>{held.current=true;save(index,options.bpm);setMessage(tr('Saved {0} BPM to slot {1}',options.bpm,index+1));timer.current=null;},700);}
 function save(index:number,bpm:number){update({tempoPresets:presets.map((value,i)=>i===index?bpm:value)});}
 return <section className="tempo-presets"><h2>{tr('Saved tempos')}</h2><div className="tempo-slots">{presets.map((bpm,index)=><div className="tempo-slot" key={index}>
 <button type="button" className="tempo-recall" aria-label={tr('Use tempo slot {0}: {1} BPM',index+1,bpm)} title={tr('Tap to recall. Hold to save the current tempo.')} aria-pressed={options.bpm===bpm}
 onPointerDown={e=>{if(e.button!==0)return;origin.current={x:e.clientX,y:e.clientY};begin(index);}}
 onPointerUp={cancel} onPointerCancel={()=>{cancel();held.current=true;}} onPointerLeave={cancel}
 onPointerMove={e=>{if(Math.hypot(e.clientX-origin.current.x,e.clientY-origin.current.y)>10){cancel();held.current=true;}}}
 onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();begin(index);}}}
 onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();cancel();if(!held.current)recall(bpm);}}}
 onBlur={cancel} onContextMenu={e=>e.preventDefault()}
 onClick={()=>{if(!held.current)recall(bpm);held.current=false;}}><small>{tr('Slot {0}',index+1)}</small><strong>{bpm}</strong><span>BPM</span></button>
 </div>)}</div><p role="status">{message}</p></section>;
}
