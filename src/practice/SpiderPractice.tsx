import { ModeSwitch } from './ModeSwitch';
import { tr } from '../i18n';
import { useOptions } from '../options';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Metronome } from '../audio/metronome';
import { useDesktopAudio } from '../audio/useDesktopAudio';
import { describePitch, frequencyFor } from '../audio/pitch';
import { TUNINGS } from '../audio/tunings';
import { spiderPosition } from './spider';
import { patternLabel } from './spiderPatterns';
import { DEFAULT_WALK, emptyWalkScore, migrateWalk, scoreWalk, validWalk, walkSequence, type WalkSetup } from './spiderRoutine';
import { RoutineEditor } from './RoutineEditor';
const storageKey = 'guitartrainer.spider.v2';
function load(): WalkSetup {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return validWalk(value) ? value : migrateWalk(JSON.parse(localStorage.getItem('guitartrainer.spider.v1') || 'null'));
  } catch { return DEFAULT_WALK; }
}
const noteLabel = (midi: number) => { const note = describePitch(frequencyFor(midi)); return `${note.name}${note.octave}`; };
export function SpiderPractice({ device, gate, reference }: { device: string; gate: number; reference: number }) {
  const [options, updateOptions] = useOptions();
  const [manualIndex, setManualIndex] = useState(0);
  const [setup, setSetup] = useState(load);
  const [phase, setPhase] = useState<'setup' | 'starting' | 'playing' | 'done' | 'manual'>('setup');
  const [preview, setPreview] = useState(false), [elapsed, setElapsed] = useState(0), [message, setMessage] = useState(''), [help, setHelp] = useState(false);
  const [score, setScore] = useState(emptyWalkScore);
  const scoreRef = useRef(score), clock = useRef<Metronome | null>(null), origin = useRef(0), launching = useRef(false), attempted = useRef(false);
  const audio = useDesktopAudio(gate, 48, reference);
  const audioStop = audio.stop;
  const sequence = useMemo(() => walkSequence(validWalk(setup) ? setup : DEFAULT_WALK), [setup]);
  const total = sequence.length;
  const position = spiderPosition(elapsed, setup.bpm, total);
  const target = sequence[Math.min(total - 1, position.index)];
  const busy = phase === 'playing' || phase === 'starting' || phase === 'manual';
  const hit = score.hits.includes(position.index);
  const lastMiss = !preview && !position.countIn && position.index > 0 && !score.hits.includes(position.index - 1);
  function update(patch: Partial<WalkSetup>) {
    const next = { ...setup, ...patch }; setSetup(next);
    if (validWalk(next)) { try { localStorage.setItem(storageKey, JSON.stringify(next)); setMessage(''); } catch { setMessage('Settings could not be saved. You can still practice this session.'); } }
  }
  function stop(text = 'Session stopped. Incomplete scores are not saved.') {
    clock.current?.stop(); clock.current = null; launching.current = false; audioStop(); setPhase('setup'); setMessage(text);
  }
  async function launch(instance: Metronome) {
    if (launching.current || clock.current !== instance) return;
    launching.current = true;
    try {
      await instance.start(setup.bpm, total + 4, setup.audible);
      if (clock.current !== instance) return;
      origin.current = instance.originTimestamp(); setPhase('playing');
    } catch { if (clock.current === instance) stop('Could not start the practice clock. Please try again.'); }
  }
  async function start(isPreview: boolean) {
    if (!validWalk(setup) || clock.current) return;
    if (options.spiderMode === 'manual') { setManualIndex(0); setPreview(true); setPhase('manual'); return; }
    attempted.current = false; setPreview(isPreview); setElapsed(0); const initial = emptyWalkScore(); scoreRef.current = initial; setScore(initial); setPhase('starting');
    let instance: Metronome | null = null;
    try {
      instance = new Metronome(); clock.current = instance; launching.current = false;
      await instance.prepare();
      if (clock.current !== instance) return;
      if (isPreview) void launch(instance); else { attempted.current = true; void audio.start(false, device); }
    } catch { if (!instance || clock.current === instance) stop('Could not start audio. Please try again.'); }
  }
  useEffect(() => {
    if (phase === 'starting' && !preview && clock.current) {
      if (audio.mode === 'microphone') void launch(clock.current);
      else if (attempted.current && audio.error) stop(audio.error);
    }
    if (phase === 'playing' && !preview && audio.mode === 'idle') stop(audio.error || 'Microphone stopped. Please start again.');
  }, [phase, preview, audio.mode, audio.error]);
  useEffect(() => {
    if (phase !== 'playing' || preview || audio.mode !== 'microphone') return;
    const midi = audio.pitch ? describePitch(audio.pitch.frequency, reference).midi : null;
    const next = scoreWalk(scoreRef.current, sequence, setup.bpm, origin.current, midi, audio.capturedAt, performance.now());
    scoreRef.current = next; setScore(next);
  }, [audio.pitch, audio.capturedAt, audio.mode, phase, preview, sequence, setup.bpm, reference]);
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      const active = clock.current; if (!active) return;
      if (!active.running()) { stop('Session stopped because audio was interrupted.'); return; }
      const time = active.elapsed(); setElapsed(time);
      if (spiderPosition(time, setup.bpm, total).done) { active.stop(); clock.current = null; audioStop(); setPhase('done'); }
    }, 20);
    return () => clearInterval(timer);
  }, [phase, setup.bpm, total, audioStop]);
  useEffect(() => {
    const hide = () => { if (document.hidden && clock.current) stop('Session stopped because the tab was hidden.'); };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); clock.current?.stop(); clock.current = null; };
  }, []);
  return <>
    <section className="page-heading practice-heading"><div><div className="eyebrow">{tr("CONTROL. COORDINATION. CONSISTENCY.")}</div><h1>{tr("Spider walk")}<span>.</span></h1><p>{tr("Build a routine. Mix patterns. Play on the beat.")}</p></div><button className="text-button" aria-expanded={help} onClick={() => setHelp(!help)}>{tr("Quick guide")}</button></section>
    {help && <section className="help-panel"><strong>{tr("Your routine, one beat at a time")}</strong><p>{tr("1 = index, 2 = middle, 3 = ring, 4 = little finger. Each uses its own fret, starting with your index at the starting fret. Each block plays its repetitions before moving to the next block. Enable Mix patterns by string for a different finger order on each string.")}</p><p>{tr("A repetition crosses strings 6 to 1. Return retraces the positions in reverse, including the turnaround note. Four count-in beats precede the routine. The higher click marks groups of four beats.")}</p><p>{tr("Scored practice awards one point for the expected pitch, including octave, within its beat. Wrong notes can be corrected before the beat ends. A sustained pitch cannot score adjacent identical targets: mute and pluck again. Pitch detection cannot verify the physical finger or string. Use headphones with audible clicks to avoid microphone pickup.")}</p><p>{tr("Preview routine needs no microphone and awards no score. Results are shown for this session only. Settings and custom patterns save locally. Leaving this screen or hiding the tab cancels practice.")}</p></section>}
    {message && <div className="help-panel" role="status">{tr(message)}</div>}
    {!busy && phase !== 'done' && <>
      <ModeSwitch free={options.spiderMode === 'manual'} onChange={free => updateOptions({ spiderMode: free ? 'manual' : 'timed' })} />
      <div className="settings-grid"><section className="panel practice-config"><h2>{tr("Session settings")}</h2>
        <label htmlFor="spider-tuning">{tr("Tuning")}</label><select id="spider-tuning" value={setup.tuning} onChange={e => update({ tuning: e.target.value })}>{TUNINGS.map(t => <option key={t.id} value={t.id}>{tr(t.name)}</option>)}</select>
        <label htmlFor="spider-fret">{tr("Starting fret")}</label><input id="spider-fret" type="number" min={1} max={17} required value={setup.fret || ''} onChange={e => update({ fret: Number(e.target.value) })}/>
        {options.spiderMode === 'timed' && <><label htmlFor="spider-bpm">{tr("Tempo (BPM) · one note per beat")}</label><input id="spider-bpm" type="number" min={30} max={180} required value={setup.bpm || ''} onChange={e => update({ bpm: Number(e.target.value) })}/></>}
        <label className="spider-toggle"><input type="checkbox" checked={setup.returning} onChange={e => update({ returning: e.target.checked })}/>{tr("Return from string 1 to string 6")}</label>
        {options.spiderMode === 'timed' && <label className="spider-toggle"><input type="checkbox" checked={setup.audible} onChange={e => update({ audible: e.target.checked })}/>{tr("Audible metronome")}</label>}
        {options.spiderMode === 'timed' && <p>{tr("Microphone input and reference pitch (")}{reference} {tr("Hz) come from Settings. Use headphones when scoring with audible clicks.")}</p>}
      </section><section className="panel practice-config"><div className="eyebrow">{tr("YOUR ROUTINE")}</div><h2>{tr("Pattern blocks: {0}", setup.blocks.length)}</h2>
        <ol className="spider-summary">{setup.blocks.map((b, i) => <li key={i}><strong>{b.mixed ? tr("Mixed by string") : patternLabel(b.pattern)}</strong><span>{tr("Repetitions: {0}", b.repetitions)}</span>{b.mixed && <small>{b.strings.map((p, index) => `S${6 - index}: ${patternLabel(p)}`).join(' · ')}</small>}</li>)}</ol>
        <p>{options.spiderMode === 'manual' ? tr('Play this combination at your own pace.') : validWalk(setup) ? tr("{0} notes · {1} seconds plus count-in", total, (total * 60 / setup.bpm).toFixed(0)) : tr("Choose valid settings to begin.")}</p><div className="practice-actions"><button className="primary-button" disabled={!validWalk(setup)} onClick={() => void start(false)}>{options.spiderMode === 'manual' ? tr("Start manual guide") : tr("Start scored walk")}</button>{options.spiderMode === 'timed' && <button className="secondary-button" disabled={!validWalk(setup)} onClick={() => void start(true)}>{tr("Preview routine")}</button>}</div>
      </section></div>
      <RoutineEditor setup={setup} change={update}/>
    </>}
    {phase === 'manual' && <section className="panel practice-stage"><div className="eyebrow">{tr("MANUAL GUIDE · NO AUDIO")}</div><h2>{tr("String")} {sequence[manualIndex].string} {tr("· Block")} {sequence[manualIndex].block + 1} {tr("· Repetition")} {sequence[manualIndex].repetition + 1}</h2><p>{tr("Play this combination at your own pace.")}</p><div className="scale-notes">{sequence.slice(manualIndex, manualIndex+4).map((note,i)=><span key={i}>{note.finger}</span>)}</div><p>{tr("Frets:")} {sequence.slice(manualIndex,manualIndex+4).map(n=>n.fret).join(' – ')}</p><p>{manualIndex/4+1} / {total/4} {tr("combinations")}</p><div className="practice-actions"><button className="secondary-button" disabled={manualIndex===0} onClick={()=>setManualIndex(i=>i-4)}>{tr("Previous combination")}</button><button className="primary-button" onClick={()=>manualIndex+4>=total?setPhase('done'):setManualIndex(i=>i+4)}>{manualIndex+4>=total?tr("Finish guide"):tr("Next combination")}</button></div><button className="text-button" onClick={()=>stop()}>{tr("Stop walk")}</button></section>}
    {busy && phase !== 'manual' && <section className={`panel practice-stage ${!preview && !position.countIn ? hit ? 'practice-success' : lastMiss ? 'practice-miss' : '' : ''}`}>
      <div className="panel-top"><span>{preview ? tr("PREVIEW · NO SCORE") : tr("SCORE {0} / {1}", score.hits.length, total)} · {setup.bpm} {tr("BPM")}</span><span>{tr("Block")} {target.block + 1} / {setup.blocks.length} {tr("· Repetition")} {target.repetition + 1} / {setup.blocks[target.block].repetitions}</span></div>
      <h2>{phase === 'starting' ? preview ? tr("Starting…") : tr("Connecting microphone…") : position.countIn ? tr("Get ready") : tr("String {0} · Fret {1} · {2}", target.string, target.fret, noteLabel(target.midi))}</h2>
      <div className="practice-target">{phase === 'starting' ? '…' : position.countIn || target.finger}</div><p>{position.countIn ? tr("Four-beat count-in") : tr("Finger {0} · {1} · Pattern {2}", target.finger, tr(['', 'Index', 'Middle', 'Ring', 'Little'][target.finger]), patternLabel(target.pattern))}</p>
      {!preview && <p className="practice-feedback" role="status">{hit ? tr("Correct pitch · +1 point") : lastMiss ? tr("Previous note missed · play the new target") : tr("Play the expected pitch within its beat")}</p>}
      <div className="spider-beats" aria-label={tr("Beat in group of four")}>{[0, 1, 2, 3].map(i => <span key={i} className={Math.floor(elapsed * setup.bpm / 60) % 4 === i ? 'current' : ''}>{i + 1}</span>)}</div>
      <div className="spider-board" aria-label={tr("Fretboard guide: string 1 at top, string 6 at bottom")}>{[1, 2, 3, 4, 5, 6].map(string => <div className="spider-string" key={string}><span>{tr("String")} {string}</span>{[1, 2, 3, 4].map(finger => <span key={finger} className={phase === 'playing' && !position.countIn && target.string === string && target.finger === finger ? 'current' : ''}>{setup.fret + finger - 1}</span>)}</div>)}</div>
      <p>{position.countIn ? tr("Prepare your fingers.") : tr("Note {0} / {1} · {2}", position.index + 1, total, target.returning ? tr('Return journey') : tr('Toward string 1'))}</p><progress aria-label={tr("Routine progress")} value={position.index} max={total}/><div className="transport"><button className="secondary-button" onClick={() => stop()}>{tr("Stop walk")}</button></div>
    </section>}
    {phase === 'done' && <section className="panel practice-stage"><div className="eyebrow">{preview ? tr("PREVIEW COMPLETE") : tr("ROUTINE COMPLETE")}</div><h2>{preview ? tr("Your routine is ready.") : tr("Your Spider Walk score")}</h2>
      {!preview && <><div className="practice-target">{score.hits.length}<small> / {total}</small></div><p>{Math.round(score.hits.length / total * 100)} {tr("% correct ·")} {tr("{0} missed", total - score.hits.length)}</p><p>{tr("Pitch accuracy within each beat; finger and string choice are not verified.")}</p>
        <ol className="spider-summary">{setup.blocks.map((_, block) => { const count = sequence.filter(n => n.block === block).length; const hits = score.hits.filter(i => sequence[i].block === block).length; return <li key={block}>{tr("Block")} {block + 1}<span>{hits} / {count} {tr("points")}</span></li>; })}</ol></>}
      {options.spiderMode === 'timed' && <p>{(total * 60 / setup.bpm).toFixed(1)} {tr("seconds ·")} {setup.bpm} {tr("BPM ·")} {total} {tr("notes, excluding count-in.")}</p>}<p>{preview ? tr("No microphone used. No score awarded.") : tr("Result shown for this session; it is not saved as a high score.")}</p><button className="primary-button" onClick={() => setPhase('setup')}>{tr("Edit routine")}</button>
    </section>}
  </>;
}

