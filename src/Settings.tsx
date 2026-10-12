import { tr } from './i18n';
import { useEffect, useState } from 'react';
import { TUNINGS } from './audio/tunings';
import type { useDesktopAudio } from './audio/useDesktopAudio';

type Preferences = { device: string; gate: number; reference: number; color: string; tuning: string };
const defaults: Preferences = { device: '', gate: -55, reference: 440, color: '#f5a45d', tuning: 'standard' };
const key = 'guitartrainer.preferences.v1';
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const p = JSON.parse(localStorage.getItem(key) || '{}');
      return {
        tuning: TUNINGS.some(t => t.id === p.tuning) ? p.tuning : 'standard',
        device: typeof p.device === 'string' ? p.device : defaults.device,
        gate: Number.isInteger(p.gate) && p.gate >= -70 && p.gate <= -30 ? p.gate : defaults.gate,
        reference: [432, 440, 442].includes(p.reference) ? p.reference : defaults.reference,
        color: typeof p.color === 'string' && /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : defaults.color,
      };
    } catch { return defaults; }
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(preferences)); setSaved(true); }
    catch { setSaved(false); }
  }, [preferences]);
  return [preferences, (patch: Partial<Preferences>) => setPreferences(p => ({ ...p, ...patch })), saved] as const;
}
function hueOf(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  return d === 0 ? 0 : ((max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
}
function hueColor(hue: number) {
  const c = 0.64, x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const rgb = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + rgb.map(v => Math.round((v + 0.26) * 255).toString(16).padStart(2, '0')).join('');
}
export function themeVariables(color: string) {
  const h = hueOf(color);
  const luminance = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  return { '--accent': color, '--accent-ink': luminance > .179 ? '#111111' : '#ffffff', '--accent-text': `hsl(${h} 65% 78%)`, '--surface': `hsl(${h} 16% 11%)`, '--background': `hsl(${h} 14% 8%)`, '--border': `hsl(${h} 15% 24%)`, '--tint': `hsl(${h} 22% 18%)`, '--muted': `hsl(${h} 12% 65%)` };
}
export function Settings({ preferences: p, update, saved, audio }: { preferences: Preferences; update: (patch: Partial<Preferences>) => void; saved: boolean; audio: ReturnType<typeof useDesktopAudio> }) {
  const busy = audio.mode !== 'idle';
  const hue = hueOf(p.color);
  const missingDevice = p.device && !audio.devices.some(d => d.deviceId === p.device);
  return <>
    <section className="page-heading"><div><div className="eyebrow">{tr("MAKE IT YOURS")}</div><h1>{tr("Settings")}<span>.</span></h1><p>{tr("Your sound. Your practice space.")}</p></div><span className="save-status" role="status">{saved ? tr("Saved on this browser") : tr("Changes apply now, but cannot be saved in this browser.")}</span></section>
    {audio.error && <div className="error-panel" role="alert">{tr(audio.error)}</div>}
    <div className="settings-grid">
      <section className="panel input-panel"><h2>{tr("Audio & tuning")}</h2><p className="settings-description">{tr("Set up your input before your next session.")}</p>
        <label htmlFor="microphone">{tr("Microphone")}</label><select id="microphone" value={p.device} disabled={busy} onChange={e => update({ device: e.target.value })}><option value="">{tr("System default")}</option>{missingDevice && <option value={p.device}>{tr("Saved microphone (unavailable or permission needed)")}</option>}{audio.devices.filter(d => d.deviceId !== 'default' && d.deviceId).map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${i + 1}`}</option>)}</select>
        <p className="hint">{busy ? tr("Stop the session to change your microphone.") : tr("Microphone names appear after you allow access. Start an input test to grant permission.")}</p>
        <button className="secondary-button" onClick={() => busy ? audio.stop() : void audio.start(false, p.device)}>{busy ? (audio.mode === 'starting' ? 'Cancel connection' : 'Stop session') : tr("Test microphone")}</button>
        <div className="level-heading"><span>{audio.mode === 'demo' ? tr("Demo level") : tr("Input level")}</span><span>{busy && audio.mode !== 'starting' ? Math.round(audio.level) : '—'} {tr("dBFS")}</span></div><div className="level-bars" aria-label={tr("Input level")}>{Array.from({ length: 28 }, (_, i) => <i key={i} className={busy && i < (audio.level + 80) / 80 * 28 ? 'lit' : ''} />)}</div>
        <div className="settings-divider" /><label htmlFor="gate" className="range-label">{tr("Noise gate")} <span>{p.gate} {tr("dB")}</span></label><input id="gate" type="range" min="-70" max="-30" step="1" value={p.gate} onChange={e => update({ gate: Number(e.target.value) })} /><p className="hint">{tr("Raise the gate to ignore quiet background noise.")}</p>
        <label htmlFor="reference" className="reference-label">{tr("Reference pitch")}<select id="reference" value={p.reference} onChange={e => update({ reference: Number(e.target.value) })}>{[432, 440, 442].map(hz => <option key={hz} value={hz}>{tr("A4 ·")} {hz} {tr("Hz")}</option>)}</select></label>
      </section>
      <section className="panel appearance-panel"><h2>{tr("Appearance")}</h2><p className="settings-description">{tr("Pick a color for your buttons, highlights, and workspace tint.")}</p>
        <div className="color-wheel" role="slider" tabIndex={0} aria-label={tr("Interface color hue")} aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(hue) % 360} aria-valuetext={tr("{0} degrees", Math.round(hue) % 360)} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); const r = e.currentTarget.getBoundingClientRect(); update({ color: hueColor((Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI + 450) % 360) }); }} onPointerMove={e => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; const r = e.currentTarget.getBoundingClientRect(); update({ color: hueColor((Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI + 450) % 360) }); }} onKeyDown={e => { if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'].includes(e.key)) { e.preventDefault(); update({ color: hueColor(e.key === 'Home' ? 0 : e.key === 'End' ? 359 : (hue + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 3 : -3) + 360) % 360) }); } }}><div className="wheel-center"><span style={{ background: p.color }} /><small>{tr("YOUR COLOR")}</small></div><span className="wheel-marker" style={{ transform: `rotate(${hue}deg)` }}><i /></span></div>
        <p className="hint wheel-hint">{tr("Drag around the wheel, or use the arrow keys.")}</p>
        <div className="color-presets">{[['Orange', '#f5a45d'], ['Sage', '#c4e99f'], ['Sky', '#8acbff'], ['Lavender', '#c1a5fa'], ['Rose', '#f5a5c5'], ['Amber', '#f0c070']].map(([name, color]) => <button key={name} aria-label={tr("{0} color", name)} aria-pressed={p.color.toLowerCase() === color} style={{ background: color }} onClick={() => update({ color })} />)}</div>
        <label className="custom-color" htmlFor="custom-color">{tr("Custom color")} <span>{p.color.toUpperCase()}</span><input id="custom-color" type="color" value={p.color} onChange={e => update({ color: e.target.value })} /></label>
        <button className="text-button reset-color" onClick={() => update({ color: defaults.color })}>{tr("Restore default orange")}</button>
      </section>
    </div>
  </>;
}
