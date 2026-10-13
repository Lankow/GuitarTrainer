import { tr } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import { useDesktopAudio } from '../audio/useDesktopAudio';
import { describePitch, frequencyFor } from '../audio/pitch';
import { TUNINGS } from '../audio/tunings';
import { pitchClass, advance, begin, makeSequence, scoreNote, validConfig, type PracticeConfig, type Round } from './engine';
import { bestScore, saveScore, scoreKey } from './scores';

const defaults = { count: 20, responseMs: 2000, breakMs: 1000 };
function loadConfig(): PracticeConfig {
  try { const value = JSON.parse(localStorage.getItem('guitartrainer.practice.v1') || 'null'); return value && validConfig(value) ? value : defaults; } catch { return defaults; }
}
export function NotePractice({ device, gate, reference, tuningId }: { device: string; gate: number; reference: number; tuningId: string }) {
  const [config, setConfig] = useState(loadConfig);
  useEffect(() => { if (validConfig(config)) { try { localStorage.setItem('guitartrainer.practice.v1', JSON.stringify(config)); } catch { /* Current setup remains usable. */ } } }, [config]);
  const [customCount, setCustomCount] = useState(() => ![10, 20, 30, 40].includes(config.count));
  const [advanced, setAdvanced] = useState(false);

  const [selection, setSelection] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('guitartrainer.practice.notes.v1') || 'null');
      const t = TUNINGS.find(t => t.id === stored?.tuning);
      if (t && Array.isArray(stored.notes)) {
        const notes = t.notes.filter(n => stored.notes.includes(n));
        return { tuning: t.id, notes };
      }
    } catch { /* Use current studio tuning when no valid selection is saved. */ }
    const t = TUNINGS.find(t => t.id === tuningId) ?? TUNINGS[0];
    return { tuning: t.id, notes: t.notes };
  });
  useEffect(() => {
    try { localStorage.setItem('guitartrainer.practice.notes.v1', JSON.stringify(selection)); }
    catch { setMessage('Note selection could not be saved in this browser.'); }
  }, [selection]);
  const [round, setRound] = useState<Round | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<{ best: number; saved: boolean } | null>(null);
  const finished = useRef(false);
  const audio = useDesktopAudio(gate, 40, reference);
  const tuning = TUNINGS.find(t => t.id === selection.tuning) ?? TUNINGS[0];
  const noteChoices = tuning.notes.filter((n, i, all) => all.findIndex(v => pitchClass(v) === pitchClass(n)) === i);
  const selectedClasses = [...new Set(selection.notes.map(pitchClass))];
  const key = scoreKey(config, tuning.id, reference, selectedClasses.length === noteChoices.length ? undefined : selection.notes);
  const running = round !== null && round.phase !== 'finished';
  const target = round ? describePitch(frequencyFor(sequence[round.index])) : null;
  const detected = audio.pitch ? describePitch(audio.pitch.frequency, reference) : null;
  const outcome = round?.phase === 'note' ? (round.hit ? 'success' : undefined) : round?.lastOutcome;
  const remaining = round ? Math.max(0, round.deadline - now) : 0;

  function launch(isPreview: boolean) {
    if (!validConfig(config) || !selection.notes.length) return;
    setMessage(''); setResult(null); finished.current = false; setPreview(isPreview);
    setSequence(makeSequence(selection.notes, config.count));
    try { localStorage.setItem('guitartrainer.practice.v1', JSON.stringify(config)); }
    catch { setMessage('Practice settings could not be saved in this browser.'); }
    if (isPreview) { const t = performance.now(); setNow(t); setRound(begin(config, t)); }
    else { setRound(null); setWaiting(true); void audio.start(false, device); }
  }
  function cancel(text = 'Session stopped. Incomplete sessions do not update your high score.') {
    setWaiting(false); setRound(null); audio.stop(); setMessage(text);
  }
  useEffect(() => {
    if (waiting && audio.mode === 'microphone') {
      const t = performance.now(); setNow(t); setRound(begin(config, t)); setWaiting(false);
    } else if (waiting && audio.error) { setWaiting(false); }
  }, [waiting, audio.mode, audio.error, config]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const t = performance.now(); setNow(t); setRound(s => s ? advance(s, config, t) : s);
    }, 20);
    return () => clearInterval(timer);
  }, [running, config]);
  useEffect(() => {
    if (!preview && audio.mode === 'microphone') {
      const midi = audio.pitch ? describePitch(audio.pitch.frequency, reference).midi : null;
      setRound(s => s ? scoreNote(s, sequence[s.index], midi, audio.capturedAt, performance.now()) : s);
    }
  }, [audio.pitch, audio.capturedAt, audio.mode, preview, reference, sequence]);
  useEffect(() => {
    if (round?.phase === 'finished' && !finished.current) {
      finished.current = true;
      if (!preview) setResult(saveScore(key, round.score));
      audio.stop();
    }
  }, [round, preview, key, audio.stop]);
  useEffect(() => {
    if (running && !preview && audio.mode === 'idle') cancel('Audio stopped. Restart practice when your microphone is ready.');
  }, [running, preview, audio.mode]);
  useEffect(() => {
    const hide = () => { if (document.hidden) { setRound(null); setWaiting(false); setMessage('Session stopped because the tab was hidden. No high score was saved.'); } };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  return <>
    {audio.error && <div className="error-panel" role="alert">{tr(audio.error)}</div>}
    {message && <div className="help-panel" role="status">{tr(message)}</div>}
    {!running && !waiting && round?.phase !== 'finished' && <div className="settings-grid">
      <form className="panel practice-config" onSubmit={e => { e.preventDefault(); launch(false); }}><h2>{tr("Build your session")}</h2><p className="settings-description">{tr(tuning.name)} {tr("tuning · A4")} {reference} {tr("Hz.")} {tr("Selected notes: {0}. Any octave counts. Audio input and colors are saved in Settings.", `${selectedClasses.length} / ${noteChoices.length}`)}</p>
        <button className="text-button advanced-toggle" type="button" aria-expanded={advanced} aria-controls="practice-advanced" onClick={() => setAdvanced(v => !v)}>{tr("Advanced")} <span aria-hidden="true">{advanced ? '−' : '+'}</span></button>
        <div id="practice-advanced" hidden={!advanced}>
        <label htmlFor="practice-tuning">{tr("Tuning")}</label><select id="practice-tuning" value={tuning.id} onChange={e => { const t = TUNINGS.find(t => t.id === e.target.value)!; setSelection({ tuning: t.id, notes: t.notes }); }}>{TUNINGS.map(t => <option value={t.id} key={t.id}>{tr(t.name)}</option>)}</select>
        <fieldset className="note-choices"><legend>{tr("Notes to practice")}</legend><div>{noteChoices.map((midi) => { const note = describePitch(frequencyFor(midi)); return <label key={midi} className="note-tile"><input aria-label={tr("Practice {0}", note.name)} type="checkbox" checked={selectedClasses.includes(pitchClass(midi))} onChange={e => setSelection(s => ({ ...s, notes: e.target.checked ? [...s.notes, midi] : s.notes.filter(n => pitchClass(n) !== pitchClass(midi)) }))} /><strong>{note.name}</strong></label>; })}</div><button className="text-button" type="button" onClick={() => setSelection({ tuning: tuning.id, notes: tuning.notes })}>{tr("Select all notes")}</button></fieldset>
        {!selection.notes.length && <p role="alert">{tr("Select at least one note to begin.")}</p>}
        </div>
        <div className="count-options"><label htmlFor="note-count-choice">{tr("Number of notes")}</label><select id="note-count-choice" value={customCount ? 'custom' : String(config.count)} onChange={e => { const custom = e.target.value === 'custom'; setCustomCount(custom); if (!custom) setConfig({ ...config, count: Number(e.target.value) }); }}>{[10, 20, 30, 40].map(n => <option key={n} value={n}>{n} {tr("notes")}</option>)}<option value="custom">{tr("Custom")}</option></select>
        {customCount && <><label htmlFor="note-count">{tr("Custom number of notes (1–100)")}</label><input id="note-count" type="number" min={1} max={100} required value={config.count || ''} onChange={e => setConfig({ ...config, count: Number(e.target.value) })} /></>}
        </div>
        <label htmlFor="response-ms">{tr("Time to play each note (ms)")}</label><input id="response-ms" type="number" min={250} max={30000} required value={config.responseMs || ''} onChange={e => setConfig({ ...config, responseMs: Number(e.target.value) })} />
        <label htmlFor="break-ms">{tr("Countdown / break between notes (ms)")}</label><input id="break-ms" type="number" min={100} max={10000} required value={config.breakMs || ''} onChange={e => setConfig({ ...config, breakMs: Number(e.target.value) })} />
        <div className="practice-actions"><button className="primary-button" disabled={!validConfig(config) || !selection.notes.length}>{tr("Start practice")}</button><button type="button" className="secondary-button" disabled={!validConfig(config) || !selection.notes.length} onClick={() => launch(true)}>{tr("Preview timing")}</button></div>
      </form>
      <section className="panel practice-config"><div className="eyebrow">{tr("YOUR PERSONAL BEST")}</div><div className="score-number">{bestScore(key)}<small> / {config.count || '—'}</small></div><p className="settings-description">{tr("Best score for this note count, timing, tuning, selected notes, and reference pitch.")}</p><h2>{tr("How it works")}</h2><p>{tr("Wait through the countdown. Play the displayed note in any octave before time runs out. Each match earns one point; missed notes earn zero.")}</p><p>{tr("The full response window runs before the next break. Consecutive targets differ when more than one note is selected. Mute your strings during breaks.")}</p><p className="hint">{tr("Preview timing uses no microphone and never saves a score. Leaving practice or hiding this tab ends the session.")}</p></section>
    </div>}
    {waiting && <section className="panel practice-stage"><h2>{tr("Connecting your microphone…")}</h2><p>{tr("Allow access in your browser. The countdown starts once audio is ready.")}</p><button className="secondary-button" onClick={() => cancel()}>{tr("Cancel")}</button></section>}
    {running && round && <section className={`panel practice-stage ${outcome ? `practice-${outcome}` : ''}`}><div className="panel-top"><span>{preview ? tr("TIMING PREVIEW · NO SCORE SAVED") : tr("LIVE PRACTICE")}</span><span>{tr("Note")} {round.index + 1} / {config.count} {tr("· Score")} {round.score}</span></div><div aria-live="polite"><h2>{round.phase === 'break' ? (outcome === 'miss' ? 'Missed note · get ready' : 'Get ready') : round.hit ? tr("Nice work! One point.") : tr("Play this note")}</h2><div className="practice-target">{round.phase === 'break' ? tr("{0}s", (remaining / 1000).toFixed(1)) : <>{target?.name}</>}</div></div><p>{round.phase === 'break' ? tr("Mute your strings. Your next note is coming.") : tr("Any octave · {0} ms remaining", Math.ceil(remaining))}</p><progress max={round.phase === 'break' ? config.breakMs : config.responseMs} value={remaining} aria-label={tr("Time remaining")} /><p className="practice-feedback">{round.phase === 'note' ? round.hit ? tr("Correct pitch detected") : detected ? tr("Hearing {0} · keep trying", detected.name) : tr("Listening for your note…") : outcome === 'miss' ? tr("No point this time. Try the next note.") : outcome === 'success' ? tr("Point earned. Get ready for the next note.") : ' '}</p><button className="secondary-button" onClick={() => cancel()}>{tr("End session")}</button></section>}
    {round?.phase === 'finished' && <section className={`panel practice-stage ${outcome ? `practice-${outcome}` : ''}`} aria-live="polite"><div className="eyebrow">{preview ? tr("PREVIEW COMPLETE") : tr("SESSION COMPLETE")}</div><h2>{preview ? tr("Ready to play?") : tr("Every note is progress.")}</h2><div className="score-number">{round.score}<small> / {config.count}</small></div><p>{outcome === 'miss' ? tr("Last note missed.") : tr("Last note matched.")}</p><p>{tr("{0} missed", config.count - round.score)} · {Math.round(round.score / config.count * 100)} {tr("% accuracy")}</p><p>{preview ? tr("Timing preview only. Your high score was not changed.") : tr("High score for this setup: {0} / {1}", result?.best ?? round.score, config.count)}</p>{result && !result.saved && <p role="alert">{tr("Cookies are unavailable. This high score could not be saved.")}</p>}<button className="primary-button" onClick={() => { setRound(null); setResult(null); }}>{tr("Set up another session")}</button></section>}
  </>;
}
