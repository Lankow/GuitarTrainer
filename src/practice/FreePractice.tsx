import { onAppBackground } from '../platform/background';
import { SessionFeedback } from './SessionFeedback';
import { tr } from '../i18n';
import { FREE_DEFAULTS, validFree, type FreeSetup } from './freeSetup';
import { useEffect, useRef, useState } from 'react';
import { useDesktopAudio } from '../audio/useDesktopAudio';
import { describePitch } from '../audio/pitch';
import { NoteSelector } from './NoteSelector';
import { readSelection, DEFAULT_SELECTION, selectedNoteName } from './noteSelection';
import { makeSequence } from './engine';
import { ROOTS, SCALES, scaleNotes, fullScaleNotes, startOrdered, acceptOrdered, type OrderedRun } from './scales';
const key='guitartrainer.free.v1';
function load(){try{const v=JSON.parse(localStorage.getItem(key)||'null');if(!validFree(v))return FREE_DEFAULTS;const selection=readSelection({tuning:v.tuning,notes:v.selected,sharps:v.sharps,flats:v.flats})!;return {...v,selected:selection.notes,sharps:selection.sharps,flats:selection.flats};}catch{return FREE_DEFAULTS;}}
export function FreePractice({kind,device,gate,reference}:{kind:'notes'|'scales';device:string;gate:number;reference:number}){
 const [setup,setSetup]=useState(load),[sequence,setSequence]=useState<number[]>([]),[run,setRun]=useState<OrderedRun|null>(null),[waiting,setWaiting]=useState(false),[message,setMessage]=useState('');const audio=useDesktopAudio(gate,48,reference);const completed=run?.completedAt!=null;const active=!!run&&!completed;const started=useRef(false);

 useEffect(()=>{if(validFree(setup))try{localStorage.setItem(key,JSON.stringify(setup));}catch{setMessage('Settings could not be saved in this browser.');}},[setup]);
 function cancel(){audio.stop();setWaiting(false);setRun(null);started.current=false;}
 function start(){if(!validFree(setup)||(kind==='notes'&&!setup.selected.length))return;const notes=kind==='notes'?setup.selected:scaleNotes(setup.root,setup.scale);const ascending=fullScaleNotes(setup.root,setup.scale,setup.returnToRoot);setSequence(kind==='scales'&&setup.order==='ascending'?Array.from({length:setup.repetitions},()=>ascending).flat():makeSequence(notes,setup.count));setMessage('');setWaiting(true);started.current=false;void audio.start(false,device);}
 useEffect(()=>{if(waiting&&audio.mode==='microphone'){setRun(startOrdered(performance.now()));started.current=true;setWaiting(false);}else if(waiting&&audio.error)setWaiting(false);},[waiting,audio.mode,audio.error]);
 useEffect(()=>{if(!active||audio.mode!=='microphone')return;const midi=audio.pitch?describePitch(audio.pitch.frequency,reference).midi:null;setRun(s=>s?acceptOrdered(s,sequence,1,midi,audio.capturedAt,performance.now()):s);},[audio.pitch,audio.capturedAt,audio.mode,active,sequence,reference]);
 useEffect(()=>{if(completed)audio.stop();else if(active&&started.current&&audio.mode==='idle')cancel();},[completed,active,audio.mode]);
 useEffect(()=>{const hide=()=>{cancel();setMessage('Session stopped because the tab was hidden.');};const removeBackground=onAppBackground(hide);return()=>removeBackground();},[]);
 const name=(midi:number)=>kind==='notes'?selectedNoteName(midi,{sharps:setup.sharps??false,flats:setup.flats}):ROOTS[((midi%12)+12)%12];
 return <>{(audio.error||message)&&<p className="help-panel" role="status">{tr(audio.error||message)}</p>}
 {!active&&!waiting&&!completed&&<div className="settings-grid free-practice-layout"><section className="panel practice-config"><h2>{tr("Practice without timing")}</h2>{kind==='notes'?<NoteSelector selection={readSelection({notes:setup.selected,sharps:setup.sharps,flats:setup.flats})??DEFAULT_SELECTION} onChange={s=>setSetup({...setup,selected:s.notes,sharps:s.sharps,flats:s.flats})}/>:<><label>{tr("Root note")}<select value={setup.root} onChange={e=>setSetup({...setup,root:Number(e.target.value)})}>{ROOTS.map((n,i)=><option key={i} value={i}>{n}</option>)}</select></label><label>{tr("Scale")}<select value={setup.scale} onChange={e=>setSetup({...setup,scale:e.target.value})}>{SCALES.map(s=><option key={s.id} value={s.id}>{tr(s.name)}</option>)}</select></label><label>{tr("Order")}<select value={setup.order} onChange={e=>setSetup({...setup,order:e.target.value as FreeSetup['order']})}><option value="random">{tr("Random notes")}</option><option value="ascending">{tr("Consecutive notes")}</option></select></label></>}
 {kind==='scales'&&setup.order==='ascending'?<label>{tr("Full-scale repetitions")}<input type="number" min={1} max={100} value={setup.repetitions||''} onChange={e=>setSetup({...setup,repetitions:Number(e.target.value)})}/></label>:<label>{tr("Number of notes")}<input type="number" min={1} max={100} value={setup.count||''} onChange={e=>setSetup({...setup,count:Number(e.target.value)})}/></label>}
 {kind==='scales'&&setup.order==='ascending'&&<label className="scale-return"><input type="checkbox" checked={setup.returnToRoot??false} onChange={e=>setSetup({...setup,returnToRoot:e.target.checked})}/>{tr("Up and back")}</label>}
 <p>{tr("Any octave counts. Wrong notes do not advance. Mute briefly between repeated notes. No countdown, deadline, timer, or high score.")}</p><button className="primary-button" disabled={!validFree(setup)||(kind==='notes'&&!setup.selected.length)} onClick={start}>{tr("Start practice")}</button></section></div>}
 {waiting&&<section className="panel practice-stage"><h2>{tr("Connecting your microphone…")}</h2><button className="secondary-button" onClick={cancel}>{tr("Cancel")}</button></section>}
 {active&&run&&<section className="panel practice-stage"><div className="eyebrow">{tr("WITHOUT TIMING")}</div><h2>{tr("Play this note")}</h2><div className="practice-target">{name(sequence[run.index])}</div><p>{run.index} / {sequence.length} {tr("completed")}</p><p>{run.releaseRequired?tr("Mute briefly, then play the note again."):tr("Listening for your note…")}</p><button className="secondary-button" onClick={cancel}>{tr("End session")}</button></section>}
 {completed&&<SessionFeedback noteLabel={name} sequence={sequence} hits={sequence.map((_,i)=>i)} free/>}
 {completed&&<section className="panel practice-stage"><h2>{tr("Session complete")}</h2><div className="score-number">{sequence.length} / {sequence.length}</div><p>{tr("All notes matched. No timed score recorded.")}</p><button className="primary-button" onClick={()=>setRun(null)}>{tr("Set up another session")}</button></section>}
 </>;
}
