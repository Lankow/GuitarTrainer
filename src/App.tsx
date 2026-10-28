import { PracticeHeader } from './practice/PracticeHeader';
import { tr, LanguageSettings } from './i18n';
import { useOptions } from './options';
import { FreePractice } from './practice/FreePractice';
import { MetronomePractice } from './practice/MetronomePractice';
import { BackupSettings } from './BackupSettings';
import { SpiderPractice } from './practice/SpiderPractice';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ScalePractice } from './practice/ScalePractice';
import { NotePractice } from './practice/NotePractice';
import { ProfileForm, useProfile } from './Profile';
import { TUNINGS } from './audio/tunings';
import { Settings, usePreferences, themeVariables } from './Settings';
import { describePitch, frequencyFor } from './audio/pitch';
import { useDesktopAudio } from './audio/useDesktopAudio';

function Icon({ name, size = 20 }: { name: 'wave' | 'mic' | 'play' | 'stop' | 'book' | 'arrow' | 'note' | 'scale' | 'hand'; size?: number }) {
  if (name === 'scale') return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><text x="1" y="17" fill="currentColor" fontSize="16" fontWeight="600" fontFamily="sans-serif">{tr("C♯")}</text></svg>;
  const paths = { note: 'M9 18V5l11-2v13M9 8l11-2M9 18c0 1.7-1.6 3-3.5 3S2 20 2 18.5 3.6 16 5.5 16 9 16.5 9 18ZM20 16c0 1.7-1.6 3-3.5 3S13 18 13 16.5s1.6-2.5 3.5-2.5S20 14.5 20 16Z', hand: 'M8 12V5a1.5 1.5 0 0 1 3 0v6-8a1.5 1.5 0 0 1 3 0v8-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v7c0 4-2 7-6 7h-1c-3 0-4-2-6-4l-3-4a1.5 1.5 0 0 1 2-2l2 2Z', wave: 'M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4', mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8', play: 'm8 5 11 7-11 7Z', stop: 'M6 6h12v12H6Z', book: 'M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4ZM12 6v15', arrow: 'M5 12h14m-5-5 5 5-5 5' };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function App() {
  const [options, updateOptions] = useOptions();
  useEffect(() => { document.documentElement.lang = options.language; }, [options.language]);
  const [page, setPage] = useState<'studio' | 'settings' | 'practice' | 'scales' | 'spider' | 'metronome'>('studio');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!sidebar.current?.contains(event.target as Node)) setMenuOpen(false); };
    document.addEventListener('keydown', escape); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); };
  }, [menuOpen]);
  const [preferences, updatePreferences, saved] = usePreferences();
  const { device, gate, reference } = preferences;
  const profile = useProfile();
  const tuning = TUNINGS.find(t => t.id === preferences.tuning) ?? TUNINGS[0];
  const strings = tuning.notes.map(midi => { const n = describePitch(frequencyFor(midi)); return { midi, note: n.name, octave: n.octave }; });
  const [demoString, setDemoString] = useState(0);
  const demoMidi = tuning.notes[demoString];
  const [help, setHelp] = useState(false);
  const audio = useDesktopAudio(gate, demoMidi, reference);
  function navigate(next: 'studio' | 'settings' | 'practice' | 'scales' | 'spider' | 'metronome') { if (next === 'practice' || next === 'scales' || next === 'spider' || next === 'metronome') audio.stop(); setPage(next); if (menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } }
  const active = audio.mode === 'microphone' || audio.mode === 'demo';
  const waiting = audio.mode === 'starting';
  const note = audio.pitch ? describePitch(audio.pitch.frequency, reference) : null;
  const inTune = note !== null && Math.abs(note.cents) <= 5;
  const tuningText = !active ? 'Your next note starts here' : !note ? 'Pluck one string and let it ring' : inTune ? 'Right on pitch' : note.cents < 0 ? 'A little flat · tune up' : 'A little sharp · tune down';
  const wavePath = audio.wave.map((value, i) => `${i ? 'L' : 'M'}${i * 5},${45 - value * 100}`).join(' ');
  return <div className="app-shell" style={themeVariables(preferences.color) as CSSProperties}>
    {!profile.nickname ? <main className="welcome"><section className="panel welcome-card"><div className="eyebrow">{tr("GUITARTRAINER · YOUR DAILY PRACTICE SPACE")}</div><h1>{tr("Make yourself at home")}<span>.</span></h1><p>{tr("Create your local profile to begin.")}</p><LanguageSettings /><ProfileForm onSave={profile.save} /></section></main> : <>
    <aside ref={sidebar} className={`sidebar ${menuOpen ? 'menu-open' : ''}`}><div className="sidebar-header">
      <a className="brand" href="#" onClick={() => navigate('studio')} aria-label={tr("GuitarTrainer home")}><span className="brand-icon"><Icon name="wave" /></span><span>{tr("Guitar")}<span className="brand-light">{tr("Trainer")}</span><small>{tr("YOUR DAILY PRACTICE SPACE")}</small></span></a>
      <button ref={menuButton} type="button" className="mobile-menu-button" aria-label={menuOpen ? tr("Close navigation") : tr("Open navigation")} aria-expanded={menuOpen} aria-controls="workspace-navigation" onClick={() => setMenuOpen(open => !open)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={menuOpen ? 'M6 6l12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'}/></svg><span>{tr("Menu")}</span></button></div>
      <div id="workspace-navigation" className="workspace-navigation"><div className="nav-label">{tr("PRACTICE")}</div>
      <nav aria-label={tr("Practice")}><button className={`nav-item ${page === 'studio' ? 'nav-active' : ''}`} aria-current={page === 'studio' ? 'page' : undefined} onClick={() => navigate('studio')}><Icon name="mic" />{tr("Tuning Studio")}</button>
      <button className={`nav-item ${page === 'practice' ? 'nav-active' : ''}`} aria-current={page === 'practice' ? 'page' : undefined} onClick={() => navigate('practice')}><Icon name="note" />{tr("Note practice")}</button></nav>
      <button className={`nav-item ${page === 'scales' ? 'nav-active' : ''}`} aria-current={page === 'scales' ? 'page' : undefined} onClick={() => navigate('scales')}><Icon name="scale" />{tr("Scale Practice")}</button>
      <button className={`nav-item ${page === 'spider' ? 'nav-active' : ''}`} aria-current={page === 'spider' ? 'page' : undefined} onClick={() => navigate('spider')}><Icon name="hand" />{tr("Spider Walk")}</button>
      <button className={`nav-item ${page === 'metronome' ? 'nav-active' : ''}`} aria-current={page === 'metronome' ? 'page' : undefined} onClick={() => navigate('metronome')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M8 3h8l4 18H4L8 3ZM12 17l6-11M8 17h8"/></svg>{tr("Metronome")}</button><div className="sidebar-settings"><button className={`nav-item ${page === 'settings' ? 'nav-active' : ''}`} aria-current={page === 'settings' ? 'page' : undefined} onClick={() => navigate('settings')}><span className="settings-icon" aria-hidden="true">⚙</span>{tr("Settings")}</button><LanguageSettings /></div>
      </div><div className="sidebar-bottom"><div className="version">{tr("DESKTOP PREVIEW")} <span>{tr("v0.1")}</span></div></div>
    </aside>
    <main>
      <header className="topbar"><div>{tr("Practice")} <span>/</span> <strong>{page === 'studio' ? tr("Tuning Studio") : page === 'practice' ? tr("Note practice") : page === 'scales' ? tr("Scale Practice") : page === 'spider' ? tr("Spider Walk") : page === 'metronome' ? tr("Metronome") : tr("Settings")}</strong></div><span className="local-badge" title={tr("Audio is processed on your device. This badge does not indicate microphone activity.")}><i aria-hidden="true" />{tr("LOCAL AUDIO")}</span></header>
      {profile.warning && <div className="error-panel" role="status">{tr(profile.warning)}</div>}
      {(page === 'practice' || page === 'scales') && <PracticeHeader key={`header-${page}`} kind={page === 'practice' ? 'notes' : 'scales'} />}
      {page === 'metronome' ? <MetronomePractice /> : page === 'practice' && options.noteMode === 'free' ? <FreePractice key="notes" kind="notes" device={device} gate={gate} reference={reference} /> : page === 'scales' && options.scaleMode === 'free' ? <FreePractice key="scales" kind="scales" device={device} gate={gate} reference={reference} /> : page === 'spider' ? <SpiderPractice device={device} gate={gate} reference={reference} /> : page === 'scales' ? <ScalePractice device={device} gate={gate} reference={reference} /> : page === 'practice' ? <NotePractice device={device} gate={gate} reference={reference} /> : page === 'settings' ? <><Settings preferences={preferences} update={updatePreferences} saved={saved} audio={audio} /><section className="panel profile-panel"><h2>{tr("Your profile")}</h2><ProfileForm initial={profile.nickname} onSave={profile.save} /></section><BackupSettings stopAudio={audio.stop} preferences={preferences} nickname={profile.nickname} /></> : <>
      <section className="page-heading"><div><div className="eyebrow">{tr("LISTEN. ADJUST. PLAY.")}</div><h1>{tr("Find your note")}<span>.</span></h1><p>{tr("Welcome back,")} {profile.nickname} {tr(". Let’s get in tune.")}</p></div><button className="text-button" onClick={() => setHelp(!help)} aria-expanded={help}><Icon name="book" size={16} />{tr("Quick guide")}</button></section>
      {help && <section className="help-panel"><strong>{tr("A good place to start")}</strong><p>{tr("Choose your microphone in Settings, return to Tuning Studio, and click Start listening. Allow microphone access, then pluck one string at a time. The meter shows how far the detected note is from its nearest pitch: left is flat, right is sharp.")}</p><p>{tr("Use a clean guitar sound. Chords, distortion, and loud background audio can confuse detection. Audio stops when you switch tabs.")}</p></section>}
      {audio.error && <div className="error-panel" role="alert">{tr(audio.error)}</div>}
      <div className="studio-grid">
        <section className={`detector panel ${audio.mode === 'microphone' ? 'is-listening' : ''}`} aria-label={tr("Live note detector")}>
          <div className="panel-top"><span><Icon name="wave" size={16} />{tr("LIVE NOTE DETECTOR")}</span><span className={`status ${active ? 'on' : ''}`}><i />{audio.mode === 'demo' ? tr("Demo signal") : audio.mode === 'microphone' ? tr("Listening") : waiting ? tr("Connecting") : tr("Standby")}</span></div>
          <div className="note-display"><div className="note-caption">{audio.mode === 'demo' ? tr("SYNTHETIC DEMO · NO MICROPHONE") : tr("DETECTED NOTE")}</div><div className={`big-note ${inTune ? 'in-tune' : ''}`}>{note?.name ?? '—'}<sub>{note?.octave ?? ''}</sub></div><div className="frequency">{audio.pitch ? audio.pitch.frequency.toFixed(1) : '—'} <span>{tr("Hz")}</span></div><div className="tuning-message"><span className={inTune ? 'tuned-dot' : 'neutral-dot'} />{tr(tuningText)}</div></div>
          <div className="tuner"><div className="tuner-labels"><span>{tr("FLAT")}</span><span className="center-label">{tr("IN TUNE")}</span><span>{tr("SHARP")}</span></div><div className="tuner-scale"><div className="tune-zone" /><div className="ticks">{Array.from({ length: 21 }, (_, i) => <i key={i} className={i % 5 === 0 ? 'major' : ''} />)}</div>{note && <div className="needle" style={{ left: `${50 + note.cents}%` }}><span /></div>}</div><div className="scale-labels"><span>−50</span><span>−25</span><span>0</span><span>+25</span><span>+50</span></div><div className="cents">{note ? `${note.cents > 0 ? '+' : ''}${note.cents.toFixed(1)}` : '—'} <span>{tr("cents")}</span></div></div>
          <div className="transport"><button className="primary-button" onClick={() => active || waiting ? audio.stop() : void audio.start(false, device)}><Icon name={active || waiting ? 'stop' : 'mic'} size={18} />{waiting ? tr("Cancel connection") : active ? tr("Stop listening") : tr("Start listening")}</button></div>
          <div className="privacy-note">{tr("Processed on your device. Never recorded or uploaded.")}</div>
        </section>
        <aside className="right-column">
          <section className="panel studio-settings"><div className="eyebrow">{tr("YOUR SETUP")}</div><h2>{tr("Ready when you are.")}</h2><p>{tr("A4 ·")} {reference} {tr("Hz")}<br />{tr("Noise gate ·")} {gate} {tr("dB")}</p><button className="text-button" onClick={() => navigate('settings')}>{tr("Audio & appearance")} <Icon name="arrow" size={16} /></button></section>
          <section className="tip-card"><div className="tip-number">01 <span>{tr("/ PRACTICE NOTE")}</span></div><h2>{tr("Give each note")}<br />{tr("room to breathe.")}</h2><p>{tr("Pluck a single string, let it ring, and watch the pitch settle.")}</p><svg className="string-art" viewBox="0 0 240 60" fill="none" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M0 ${20 + i * 4} Q60 ${-20 + i * 9}, 120 ${20 + i * 4} T240 ${20 + i * 4}`} stroke="currentColor" strokeWidth="0.8" />)}</svg></section>
        </aside>
        <section className="panel strings-panel"><div className="section-title"><h2>{tr("Know your strings")}</h2><label className="tuning-select" htmlFor="tuning">{tr("Tuning")}<select id="tuning" value={tuning.id} onChange={e => updatePreferences({ tuning: e.target.value })}>{TUNINGS.map(t => <option key={t.id} value={t.id}>{tr(t.name)}</option>)}</select></label></div><div className="strings">{strings.map((s, i) => <div className={`string ${note?.midi === s.midi ? 'matched' : ''}`} key={i}><span className="string-number">{6 - i}<span>{i === 0 ? tr("LOW") : i === 5 ? tr("HIGH") : tr("STRING")}</span></span><div className="string-wire" style={{ height: 1 + (5 - i) * 0.5 }} /><div className="string-note">{tr(s.note)}<sub>{s.octave}</sub></div><span className="string-match">{note?.midi === s.midi ? (inTune ? 'In tune' : 'Detected') : '\u00a0'}</span><span className="string-hz">{frequencyFor(s.midi, reference).toFixed(1)} {tr("Hz")}</span>{audio.mode === 'demo' && <button className={`demo-note ${demoMidi === s.midi ? 'selected' : ''}`} onClick={() => setDemoString(i)} aria-label={tr("Demo {0}{1}", s.note, s.octave)}>{demoMidi === s.midi ? tr("Selected") : tr("Try note")}</button>}</div>)}</div></section>
        <section className="panel signal-panel"><div className="signal-meta"><div><h2>{tr("Your signal")}</h2><p>{audio.mode === 'demo' ? tr("Synthetic waveform") : tr("Live microphone waveform")}</p></div><span>{audio.sampleRate ? tr("{0} kHz", (audio.sampleRate / 1000).toFixed(1)) : tr("NO INPUT")}<small>{active ? tr("{0} ms analysis*", audio.computationMs.toFixed(1)) : tr("Start a session to see audio")}</small></span></div><svg className="waveform" viewBox="0 0 800 90" preserveAspectRatio="none" aria-label={tr("Audio waveform")}><defs><pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse"><path d="M40 0H0V30" fill="none" stroke="#2a3830" strokeWidth="0.5" /></pattern></defs><rect width="800" height="90" fill="url(#grid)" /><path d={wavePath || 'M0 45H800'} fill="none" stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.7" /></svg></section>
      </div>
      </>}
      <footer><span><i />{tr("Built for focused practice.")}</span><span>{tr("*Analysis time is computation only, not total audio latency.")}</span></footer>
    </main>
    </>}
  </div>;
}
