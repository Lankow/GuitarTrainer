import { useEffect, useRef, useState } from 'react';
import { tr } from '../i18n';
import { describePitch } from './pitch';
import type { useDesktopAudio } from './useDesktopAudio';
import { assessSetup, type CheckSample } from './setupCheck';

export function MicrophoneCheck({audio,device,gate,reference}:{audio:ReturnType<typeof useDesktopAudio>;device:string;gate:number;reference:number}) {
 const [phase,setPhase]=useState<'idle'|'connecting'|'quiet'|'ready'|'playing'|'done'>('idle');
 const [remaining,setRemaining]=useState(0);
 const [result,setResult]=useState<ReturnType<typeof assessSetup>|null>(null);
 const quiet=useRef<CheckSample[]>([]),playing=useRef<CheckSample[]>([]),since=useRef(0),owned=useRef(false);
 const finish=()=>{owned.current=false;audio.stop();setPhase('idle');};
 useEffect(()=>()=>{if(owned.current)audio.stop();},[audio.stop]);
 useEffect(()=>{if(phase==='connecting'&&audio.mode==='microphone'){since.current=performance.now();setRemaining(3);setPhase('quiet');}
 else if(phase!=='idle'&&phase!=='done'&&audio.mode==='idle'){owned.current=false;setPhase('idle');}},[audio.mode,phase]);
 useEffect(()=>{if(!['quiet','playing'].includes(phase)||audio.capturedAt<since.current||audio.mode!=='microphone')return;
 const sample={level:audio.level,midi:audio.pitch?describePitch(audio.pitch.frequency,reference).midi:null};
 (phase==='quiet'?quiet:playing).current.push(sample);
 },[audio.capturedAt]);
 useEffect(()=>{if(phase!=='quiet'&&phase!=='playing')return;
 const duration=phase==='quiet'?3000:6000;
 const timer=setInterval(()=>{const left=Math.max(0,duration-(performance.now()-since.current));setRemaining(Math.ceil(left/1000));if(left===0){
 if(phase==='quiet')setPhase('ready');else{setResult(assessSetup(quiet.current,playing.current,gate));owned.current=false;audio.stop();setPhase('done');}
 }},100);return()=>clearInterval(timer);
 },[phase,gate,audio.stop]);
 async function start(){quiet.current=[];playing.current=[];setResult(null);owned.current=true;setPhase('connecting');await audio.start(false,device);}
 const busy=phase!=='idle'&&phase!=='done';
 return <section className="microphone-check"><h3>{tr('Microphone setup check')}</h3>
 <p className="hint">{tr('Measure room noise, then play one string to check detection. Audio stays on your device; settings are not changed automatically.')}</p>
 {!busy&&<button type="button" className="secondary-button" disabled={audio.mode!=='idle'} onClick={()=>void start()}>{tr('Start microphone check')}</button>}
 <div role="status" aria-live="polite">
 {phase==='connecting'&&<p>{tr('Connecting your microphone…')}</p>}
 {phase==='quiet'&&<p>{tr('Keep your strings muted and stay quiet.')} {remaining} s</p>}
 {phase==='ready'&&<><p>{tr('Now pluck one open string a few times. Let each note ring.')}</p><button type="button" className="primary-button" onClick={()=>{since.current=performance.now();setRemaining(6);setPhase('playing');}}>{tr('Check my guitar')}</button></>}
 {phase==='playing'&&<p>{tr('Play one string at a time.')} {remaining} s · {audio.pitch?tr('Hearing {0}',describePitch(audio.pitch.frequency,reference).name):tr('Listening for your note…')}</p>}
 {phase==='done'&&result&&<><h4>{tr(result.enough&&result.stable&&!result.weak&&!result.noiseAboveGate&&result.contrast>=10?'Microphone check passed':'Review your microphone setup')}</h4>
 <p>{tr('Room noise: {0} dBFS · strongest signal: {1} dBFS',Math.round(result.noise),Math.round(result.signal))}</p>
 {!result.enough&&<p>{tr('Not enough audio samples. Repeat the check with this tab visible.')}</p>}
 {result.noiseAboveGate&&<p>{tr('Background noise reaches the noise gate. Reduce room noise or raise the gate in Settings, then check again.')}</p>}
 {(result.weak||result.contrast<10)&&<p>{tr('The guitar signal is weak or too close to the background level. Move closer to the microphone or adjust its input level.')}</p>}
 <p>{tr(result.stable?'A consistent note was detected.':'No consistent note was detected. Use a clean sound, play one string, and check the selected microphone and noise gate.')}</p>
 <p className="hint">{tr('This is a short setup check, not a guarantee of accuracy for every note.')}</p></>}
 </div>
 {busy&&<button type="button" className="text-button" onClick={finish}>{tr('Cancel')}</button>}
 </section>;
}
