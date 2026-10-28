import { useEffect, useMemo, useRef, useState } from 'react';
import { tr } from '../i18n';
import { useOptions } from '../options';
import { TUNINGS } from '../audio/tunings';
import { describePitch, frequencyFor } from '../audio/pitch';
import { useDesktopAudio } from '../audio/useDesktopAudio';
import { Metronome } from '../audio/metronome';
import { SpiderCreator } from './SpiderCreator';
import { SpiderFiles } from './SpiderFiles';
import { SpiderFretboard } from './SpiderFretboard';
import { SPIDER_LIBRARY_KEY, validSpiderLibrary, repeatSpider, spiderTempo, type SpiderLibrary, type SpiderPattern } from './spiderLibrary';
import { beginSpider, advanceSpider, type SpiderRun } from './spiderRun';
function load():SpiderLibrary {
 const empty:SpiderLibrary={patterns:[],selected:'',tuning:'standard',bpm:60,audible:false};
 try {const v=JSON.parse(localStorage.getItem(SPIDER_LIBRARY_KEY)||'null');if(validSpiderLibrary(v))return v;return empty;}
 catch{return empty;}
}
const label=(midi:number)=>{const n=describePitch(frequencyFor(midi));return `${n.name}${n.octave}`;};
export function SpiderPractice({device,gate,reference}:{device:string;gate:number;reference:number}) {
 const [setup,setSetup]=useState(load),[creator,setCreator]=useState<SpiderPattern|'new'|null>(null),[help,setHelp]=useState(false),[message,setMessage]=useState('');
 const [phase,setPhase]=useState<'setup'|'starting'|'playing'|'done'>('setup'),[run,setRun]=useState<SpiderRun|null>(null),[now,setNow]=useState(0),[ready,setReady]=useState(false);
 const [options]=useOptions();const audio=useDesktopAudio(gate,48,reference);
 const clock=useRef<Metronome|null>(null),generation=useRef(0),launching=useRef(false);
 const pattern=setup.patterns.find(p=>p.id===setup.selected);
 const sequence=useMemo(()=>pattern?repeatSpider(pattern,setup.tuning,Number.isInteger(setup.patternRepetitions)&&setup.patternRepetitions!>=1&&setup.patternRepetitions!<=100?setup.patternRepetitions:1):[],[pattern,setup.tuning,setup.patternRepetitions]);
 const target=sequence[Math.min(run?.index??0,sequence.length-1)];
 const busy=phase==='starting'||phase==='playing';
 useEffect(()=>{if(!validSpiderLibrary(setup))return;try{localStorage.setItem(SPIDER_LIBRARY_KEY,JSON.stringify(setup));}catch{setMessage('Could not save Spider Walks. Export your changes before leaving.');}},[setup]);
 function update(patch:Partial<SpiderLibrary>){setSetup(s=>({...s,...patch}));}
 function stop(text='Session stopped. Incomplete results are not saved.') {generation.current++;clock.current?.stop();clock.current=null;launching.current=false;audio.stop();setReady(false);setPhase('setup');setRun(null);setMessage(text);}
 async function start(){
  if(!validSpiderLibrary(setup)||!pattern||busy)return;
  const token=++generation.current;setMessage('');setRun(null);setReady(false);setPhase('starting');launching.current=false;
  try{if(setup.audible){const instance=new Metronome(options.metronomeVolume??100);clock.current=instance;await instance.prepare();}
   if(token!==generation.current)return;setReady(true);void audio.start(false,device);
  }catch{if(token===generation.current)stop('Could not start audio. Please try again.');}
 }
 useEffect(()=>{
  if(phase==='starting'&&ready&&audio.error){stop(audio.error);return;}
  if(phase!=='starting'||!ready||audio.mode!=='microphone'||launching.current)return;
  launching.current=true;const token=generation.current;
  void (async()=>{try{if(clock.current)await clock.current.start(setup.bpm,Infinity,true);if(token!==generation.current)return;const time=performance.now();setRun(beginSpider(time));setNow(time);setPhase('playing');}catch{if(token===generation.current)stop('Could not start audio. Please try again.');}})();
 },[phase,ready,audio.mode,audio.error]);
 useEffect(()=>{
  if(phase!=='playing'||audio.mode!=='microphone')return;
  const midi=audio.pitch?describePitch(audio.pitch.frequency,reference).midi:null;
  setRun(s=>s?advanceSpider(s,sequence,midi,audio.capturedAt,performance.now()):s);
 },[phase,audio.mode,audio.pitch,audio.capturedAt,reference,sequence]);
 useEffect(()=>{
  if(phase!=='playing')return;
  if(run?.completedAt!==null&&run?.completedAt!==undefined){clock.current?.stop();clock.current=null;audio.stop();setNow(run.completedAt);setPhase('done');return;}
  if(audio.mode==='idle')stop(audio.error||'Microphone stopped. Please start again.');
 },[phase,run,audio.mode,audio.error]);
 useEffect(()=>{if(phase==='playing')clock.current?.setTempo(spiderTempo(setup.bpm,setup.bpmStep,target?.patternRepetition??0));},[phase,target?.patternRepetition,setup.bpm,setup.bpmStep]);
 useEffect(()=>{if(phase!=='playing')return;const timer=setInterval(()=>{if(clock.current&&!clock.current.running()){stop('Session stopped because audio was interrupted.');return;}setNow(performance.now());},40);return()=>clearInterval(timer);},[phase]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop('Session stopped because the tab was hidden.');};document.addEventListener('visibilitychange',hide);return()=>{generation.current++;document.removeEventListener('visibilitychange',hide);clock.current?.stop();clock.current=null;};},[]);
 function save(pattern:SpiderPattern){const exists=setup.patterns.some(p=>p.id===pattern.id);if(!exists&&setup.patterns.length>=24){setMessage('Library limit reached (24 walks).');return;}update({patterns:exists?setup.patterns.map(p=>p.id===pattern.id?pattern:p):[...setup.patterns,pattern],selected:pattern.id});setCreator(null);}
 function importWalks(patterns:SpiderPattern[]){if(setup.patterns.length+patterns.length>24){setMessage('Library limit reached (24 walks).');return false;}const copies=patterns.map(p=>({...p,id:crypto.randomUUID()}));update({patterns:[...setup.patterns,...copies],selected:copies[0].id});return true;}
 return <>
 <section className="page-heading practice-heading"><div><div className="eyebrow">{tr('CONTROL. COORDINATION. CONSISTENCY.')}</div><h1>{tr('Spider walk')}<span>.</span></h1><p>{tr('Your score is the time needed to complete the whole routine. The metronome does not control progression.')}</p></div><button className="text-button" aria-expanded={help} onClick={()=>setHelp(v=>!v)}>{tr('Quick guide')}</button></section>
 {help&&<section className="help-panel"><p>{tr('Create a walk by clicking string and fret positions in order. Add records with repetitions, save, then choose your tuning and start.')}</p><p>{tr('Play the displayed pitch, including its octave, to advance. Wrong notes do not advance. Mute between identical consecutive targets. Time starts when the microphone is ready and ends on the final correct note.')}</p><p>{tr('The metronome is optional and never advances a target. Use headphones to prevent clicks reaching the microphone. Pitch detection cannot verify the finger or string used.')}</p></section>}
 {message&&<p className="help-panel" role="status">{tr(message)}</p>}
 {phase==='setup'&&<>{creator?<SpiderCreator key={creator==='new'?'new':creator.id} initial={creator==='new'?undefined:creator} onSave={save} onCancel={()=>setCreator(null)}/>:<>
 <div className="settings-grid spider-setup-grid"><section className="panel practice-config"><h2>{tr('Session settings')}</h2>
 <label>{tr('Tuning')}<select value={setup.tuning} onChange={e=>update({tuning:e.target.value})}>{TUNINGS.map(t=><option key={t.id} value={t.id}>{tr(t.name)}</option>)}</select></label>
 <label>{tr('Selected Pattern')}<select disabled={!pattern} value={setup.selected} onChange={e=>update({selected:e.target.value})}>{!pattern&&<option value="">{tr('No saved walks')}</option>}{setup.patterns.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 <div className="spider-library-actions"><button className="secondary-button" disabled={setup.patterns.length>=24} onClick={()=>setCreator('new')}>{tr('New')}</button><button className="secondary-button" disabled={!pattern} onClick={()=>pattern&&setCreator(pattern)}>{tr('Edit')}</button><button className="secondary-button" disabled={!pattern} onClick={()=>{const patterns=setup.patterns.filter(p=>p.id!==pattern?.id);update({patterns,selected:patterns[0]?.id??''});}}>{tr('Remove')}</button></div>

 <label>{tr('Pattern repetitions')}<input type="number" min={1} max={100} value={setup.patternRepetitions??1} onChange={e=>update({patternRepetitions:Number(e.target.value)})}/></label>
 <label className="spider-toggle"><input type="checkbox" checked={setup.audible} onChange={e=>update({audible:e.target.checked})}/>{tr('Background metronome')}</label>
 {setup.audible&&<label>{tr('Tempo (BPM)')}<input type="number" min={30} max={240} value={setup.bpm||''} onChange={e=>{const bpm=Number(e.target.value);update({bpm});}}/></label>}
 {setup.audible&&<><label className="spider-toggle"><input type="checkbox" checked={!!setup.bpmStep} onChange={e=>update({bpmStep:e.target.checked?5:0})}/>{tr('Increase BPM after each pattern')}</label>{!!setup.bpmStep&&<label>{tr('BPM increase per pattern')}<input type="number" min={1} max={30} value={setup.bpmStep} onChange={e=>update({bpmStep:Number(e.target.value)})}/></label>}<p>{tr('Tempo increases after the full pattern, up to 240 BPM.')}</p></>}
 <div className="practice-actions"><button className="primary-button" disabled={!pattern||!validSpiderLibrary(setup)} onClick={()=>void start()}>{tr('Start practice')}</button></div>
 </section><section className="panel practice-config spider-routine-summary"><h2>{pattern?.name??tr('No saved walks')}</h2>{!pattern&&<p>{tr('Create a new walk or import one to begin.')}</p>}<p>{tr('Correct notes to finish: {0}. No forced pauses or response windows.',sequence.length)}</p><ol className="spider-summary spider-routine-list" tabIndex={0} aria-label={tr('Selected Pattern')}>{pattern?.records.map((r,i)=><li key={i}><span>{i+1}. {r.notes.map(n=>`S${n.string}:${n.fret}`).join(' → ')}</span><span>× {r.repetitions}</span></li>)}</ol></section></div>
 <SpiderFiles patterns={setup.patterns} onImport={importWalks}/>
 </>}</>}
 {phase==='starting'&&<section className="panel practice-stage"><h2>{tr('Connecting microphone…')}</h2><button className="secondary-button" onClick={()=>stop()}>{tr('Cancel')}</button></section>}
 {phase==='playing'&&run&&pattern&&<section className="panel practice-stage"><div className="panel-top"><span>{tr('Pattern {0} / {1}',target.patternRepetition+1,setup.patternRepetitions??1)} · {tr('Block')} {target.record+1} / {pattern.records.length} · {tr('Repetition {0} / {1}',target.repetition+1,pattern.records[target.record].repetitions)}</span><span>{tr('Completed {0} / {1} notes',run.index,sequence.length)}</span></div><h2>{tr('String {0} · Fret {1} · {2}',target.string,target.fret,label(target.midi))}</h2><div className="practice-target">{label(target.midi)}</div>{setup.audible&&<p>{spiderTempo(setup.bpm,setup.bpmStep,target.patternRepetition)} BPM</p>}<p>{tr('Elapsed:')} {((now-run.startedAt)/1000).toFixed(2)} {tr('s')}</p><p role="status">{run.releaseRequired?tr('Mute briefly, then play the note again.'):tr('Listening for your note…')}</p><SpiderFretboard frets={pattern.frets} notes={pattern.records[target.record].notes} target={target}/><progress aria-label={tr('Routine progress')} value={run.index} max={sequence.length}/><button className="secondary-button" onClick={()=>stop()}>{tr('Stop walk')}</button></section>}
 {phase==='done'&&run&&pattern&&<section className="panel practice-stage"><div className="eyebrow">{tr('ROUTINE COMPLETE')}</div><h2>{tr('Completion time')}</h2><div className="score-number">{((run.completedAt!-run.startedAt)/1000).toFixed(2)}<small> {tr('s')}</small></div><p>{pattern.name} · {tr('Completed {0} / {1} notes',sequence.length,sequence.length)}</p><p>{tr('Result shown for this session; it is not saved as a high score.')}</p><button className="primary-button" onClick={()=>{setPhase('setup');setRun(null);}}>{tr('Set up another session')}</button></section>}
 </>;
}
