import { useState } from 'react';
import { describePitch, frequencyFor, STRINGS } from './audio/pitch';
import { useDesktopAudio } from './audio/useDesktopAudio';

function Icon({ name, size = 20 }: { name: 'wave' | 'mic' | 'play' | 'stop' | 'book' | 'arrow'; size?: number }) {
  const paths = { wave: 'M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4', mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8', play: 'm8 5 11 7-11 7Z', stop: 'M6 6h12v12H6Z', book: 'M4 4h6l2 2 2-2h6v15h-6l-2 2-2-2H4ZM12 6v15', arrow: 'M5 12h14m-5-5 5 5-5 5' };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function App() {
  const [device, setDevice] = useState('');
  const [gate, setGate] = useState(-55);
  const [reference, setReference] = useState(440);
  const [demoMidi, setDemoMidi] = useState(40);
  const [help, setHelp] = useState(false);
  const audio = useDesktopAudio(gate, demoMidi, reference);
  const active = audio.mode === 'microphone' || audio.mode === 'demo';
  const waiting = audio.mode === 'starting';
  const note = audio.pitch ? describePitch(audio.pitch.frequency, reference) : null;
  const inTune = note !== null && Math.abs(note.cents) <= 5;
  const tuningText = !active ? 'Your next note starts here' : !note ? 'Pluck one string and let it ring' : inTune ? 'Right on pitch' : note.cents < 0 ? 'A little flat · tune up' : 'A little sharp · tune down';
  const wavePath = audio.wave.map((value, i) => `${i ? 'L' : 'M'}${i * 5},${45 - value * 100}`).join(' ');
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" aria-label="GuitarTrainer home"><span className="brand-icon"><Icon name="wave" /></span><span>guitar<span className="brand-light">trainer</span><small>YOUR DAILY PRACTICE SPACE</small></span></a>
      <div className="nav-label">WORKSPACE</div>
      <div className="nav-active"><Icon name="wave" /> Note studio <span>01</span></div>
      <div className="nav-future"><Icon name="play" /> Note practice <small>SOON</small></div>
      <div className="nav-future"><Icon name="book" /> Finger exercises <small>SOON</small></div>
      <div className="sidebar-bottom"><div className="local-dot" /> A little practice, every day.<p>One note at a time.</p><div className="version">DESKTOP PREVIEW <span>v0.1</span></div></div>
    </aside>
    <main>
      <header className="topbar"><div>Workspace <span>/</span> <strong>Note studio</strong></div><span className="local-badge"><i /> LOCAL AUDIO</span></header>
      <section className="page-heading"><div><div className="eyebrow">LISTEN. ADJUST. PLAY.</div><h1>Find your note<span>.</span></h1><p>A space to get in tune with your guitar.</p></div><button className="text-button" onClick={() => setHelp(!help)} aria-expanded={help}><Icon name="book" size={16} /> Quick guide</button></section>
      {help && <section className="help-panel"><strong>A good place to start</strong><p>Choose your microphone and click Start listening. Allow microphone access, then pluck one string at a time. The meter shows how far the detected note is from its nearest pitch: left is flat, right is sharp. Try demo to test the interface without a microphone.</p><p>Use a clean guitar sound. Chords, distortion, and loud background audio can confuse detection. Audio stops when you switch tabs.</p></section>}
      {audio.error && <div className="error-panel" role="alert">{audio.error}</div>}
      <div className="studio-grid">
        <section className="detector panel" aria-label="Live note detector">
          <div className="panel-top"><span><Icon name="wave" size={16} /> LIVE NOTE DETECTOR</span><span className={`status ${active ? 'on' : ''}`}><i />{audio.mode === 'demo' ? 'Demo signal' : audio.mode === 'microphone' ? 'Listening' : waiting ? 'Connecting' : 'Standby'}</span></div>
          <div className="note-display"><div className="note-caption">{audio.mode === 'demo' ? 'SYNTHETIC DEMO · NO MICROPHONE' : 'DETECTED NOTE'}</div><div className={`big-note ${inTune ? 'in-tune' : ''}`}>{note?.name ?? '—'}<sub>{note?.octave ?? ''}</sub></div><div className="frequency">{audio.pitch ? audio.pitch.frequency.toFixed(1) : '—'} <span>Hz</span></div><div className="tuning-message"><span className={inTune ? 'tuned-dot' : 'neutral-dot'} />{tuningText}</div></div>
          <div className="tuner"><div className="tuner-labels"><span>FLAT</span><span className="center-label">IN TUNE</span><span>SHARP</span></div><div className="tuner-scale"><div className="tune-zone" /><div className="ticks">{Array.from({ length: 21 }, (_, i) => <i key={i} className={i % 5 === 0 ? 'major' : ''} />)}</div>{note && <div className="needle" style={{ left: `${50 + note.cents}%` }}><span /></div>}</div><div className="scale-labels"><span>−50</span><span>−25</span><span>0</span><span>+25</span><span>+50</span></div><div className="cents">{note ? `${note.cents > 0 ? '+' : ''}${note.cents.toFixed(1)}` : '—'} <span>cents</span></div></div>
          <div className="transport"><button className="primary-button" onClick={() => active || waiting ? audio.stop() : void audio.start(false, device)}><Icon name={active || waiting ? 'stop' : 'mic'} size={18} />{waiting ? 'Cancel connection' : active ? 'Stop listening' : 'Start listening'}</button><button className="secondary-button" disabled={waiting} onClick={() => audio.mode === 'demo' ? audio.stop() : void audio.start(true, '')}><Icon name="play" size={16} />{audio.mode === 'demo' ? 'End demo' : 'Try demo'}</button></div>
          <div className="privacy-note">Processed on your device. Never recorded or uploaded.</div>
        </section>
        <aside className="right-column">
          <section className="panel input-panel"><div className="panel-top"><span><Icon name="mic" size={16} /> AUDIO INPUT</span></div><label htmlFor="microphone">Microphone</label><select id="microphone" value={device} disabled={active || waiting} onChange={e => setDevice(e.target.value)}><option value="">System default</option>{audio.devices.filter(d => d.deviceId !== 'default' && d.deviceId).map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${i + 1}`}</option>)}</select><div className="level-heading"><span>Input level</span><span>{active ? Math.round(audio.level) : '—'} dBFS</span></div><div className="level-bars" aria-label="Input level">{Array.from({ length: 28 }, (_, i) => <i key={i} className={active && i < (audio.level + 80) / 80 * 28 ? 'lit' : ''} />)}</div><div className="settings-divider" /><label htmlFor="gate" className="range-label">Noise gate <span>{gate} dB</span></label><input id="gate" type="range" min="-70" max="-30" step="1" value={gate} onChange={e => setGate(Number(e.target.value))} /><p className="hint">Raise the gate to ignore quiet background noise.</p><label htmlFor="reference" className="reference-label">Reference pitch<select id="reference" value={reference} onChange={e => setReference(Number(e.target.value))}>{[432, 440, 442].map(hz => <option key={hz} value={hz}>A4 · {hz} Hz</option>)}</select></label></section>
          <section className="tip-card"><div className="tip-number">01 <span>/ PRACTICE NOTE</span></div><h2>Give each note<br />room to breathe.</h2><p>Pluck a single string, let it ring, and watch the pitch settle.</p><svg className="string-art" viewBox="0 0 240 60" fill="none" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M0 ${20 + i * 4} Q60 ${-20 + i * 9}, 120 ${20 + i * 4} T240 ${20 + i * 4}`} stroke="currentColor" strokeWidth="0.8" />)}</svg></section>
        </aside>
        <section className="panel strings-panel"><div className="section-title"><h2>Know your strings</h2><span>STANDARD TUNING · E A D G B E</span></div><div className="strings">{STRINGS.map((s, i) => <div className={`string ${note?.midi === s.midi ? 'matched' : ''}`} key={s.midi}><span className="string-number">{6 - i}<span>{i === 0 ? 'LOW' : i === 5 ? 'HIGH' : 'STRING'}</span></span><div className="string-wire" style={{ height: 1 + (5 - i) * 0.5 }} /><div className="string-note">{s.note}<sub>{s.octave}</sub></div><span className="string-hz">{frequencyFor(s.midi, reference).toFixed(1)} Hz</span>{audio.mode === 'demo' && <button className={`demo-note ${demoMidi === s.midi ? 'selected' : ''}`} onClick={() => setDemoMidi(s.midi)} aria-label={`Demo ${s.note}${s.octave}`}>{demoMidi === s.midi ? 'Selected' : 'Try note'}</button>}</div>)}</div></section>
        <section className="panel signal-panel"><div className="signal-meta"><div><h2>Your signal</h2><p>{audio.mode === 'demo' ? 'Synthetic waveform' : 'Live microphone waveform'}</p></div><span>{audio.sampleRate ? `${(audio.sampleRate / 1000).toFixed(1)} kHz` : 'NO INPUT'}<small>{active ? `${audio.computationMs.toFixed(1)} ms analysis*` : 'Start a session to see audio'}</small></span></div><svg className="waveform" viewBox="0 0 800 90" preserveAspectRatio="none" aria-label="Audio waveform"><defs><pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse"><path d="M40 0H0V30" fill="none" stroke="#2a3830" strokeWidth="0.5" /></pattern></defs><rect width="800" height="90" fill="url(#grid)" /><path d={wavePath || 'M0 45H800'} fill="none" stroke={active ? '#b9e68b' : '#4a5d50'} strokeWidth="1.7" /></svg></section>
      </div>
      <footer><span><i /> Built for focused practice.</span><span>*Analysis time is computation only, not total audio latency.</span></footer>
    </main>
  </div>;
}
