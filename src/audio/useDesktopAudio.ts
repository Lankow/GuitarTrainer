import { useCallback, useEffect, useRef, useState } from 'react';
import { frequencyFor, type Pitch } from './pitch';

type Mode = 'idle' | 'starting' | 'microphone' | 'demo';
type Session = { context: AudioContext; source: AudioNode; analyser: AnalyserNode; worker: Worker; stream?: MediaStream; oscillator?: OscillatorNode; frame: number; samples: Float32Array<ArrayBuffer>; pending: boolean };
export function useDesktopAudio(gate: number, demoMidi: number, reference: number) {
  const [mode, setMode] = useState<Mode>('idle');
  const [error, setError] = useState('');
  const [capturedAt, setCapturedAt] = useState(0);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [level, setLevel] = useState(-100);
  const [wave, setWave] = useState<number[]>([]);
  const [sampleRate, setSampleRate] = useState(0);
  const [computationMs, setComputationMs] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const session = useRef<Session | null>(null);
  const generation = useRef(0);
  const gateRef = useRef(gate);
  gateRef.current = gate;
  const refreshDevices = useCallback(async () => {
    try { setDevices((await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput')); } catch { /* Device names become available after permission. */ }
  }, []);
  const stop = useCallback(() => {
    generation.current++;
    const current = session.current;
    session.current = null;
    if (current) {
      cancelAnimationFrame(current.frame);
      current.worker.terminate();
      current.stream?.getTracks().forEach(t => t.stop());
      current.oscillator?.stop();
      current.source.disconnect();
      void current.context.close().catch(() => {});
    }
    setMode('idle'); setPitch(null); setLevel(-100); setWave([]); setSampleRate(0); setComputationMs(0);
  }, []);

  const start = useCallback(async (demo: boolean, deviceId: string) => {
    stop();
    const token = generation.current;
    setMode('starting'); setError('');
    let context: AudioContext | undefined;
    let stream: MediaStream | undefined;
    let worker: Worker | undefined;
    try {
      context = new AudioContext();
      await context.resume();
      if (!demo) {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone access requires localhost or HTTPS in a supported browser.');
        stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId ? { exact: deviceId } : undefined, channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      }
      if (token !== generation.current) { stream?.getTracks().forEach(t => t.stop()); await context.close(); return; }
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      let source: AudioNode;
      let oscillator: OscillatorNode | undefined;
      if (demo) {
        oscillator = context.createOscillator();
        oscillator.type = 'triangle'; oscillator.frequency.value = frequencyFor(demoMidi, reference);
        const gain = context.createGain(); gain.gain.value = 0.22;
        oscillator.connect(gain); source = gain; oscillator.start();
      } else source = context.createMediaStreamSource(stream!);
      source.connect(analyser);
      // Keep the graph processing without playing microphone or demo audio aloud.
      const silent = context.createGain(); silent.gain.value = 0;
      analyser.connect(silent); silent.connect(context.destination);
      worker = new Worker(new URL('./pitch.worker.ts', import.meta.url), { type: 'module' });
      const current: Session = { context, source, analyser, worker, stream, oscillator, frame: 0, samples: new Float32Array(4096), pending: false };
      session.current = current;
      let frameCapturedAt = 0;
      worker.onmessage = event => {
        if (session.current !== current) return;
        current.pending = false; setCapturedAt(frameCapturedAt); setPitch(event.data.pitch); setComputationMs(event.data.computationMs);
      };
      worker.onerror = () => { if (session.current === current) { stop(); setError('Audio analysis stopped. Please start again.'); } };
      stream?.getAudioTracks().forEach(track => track.addEventListener('ended', () => {
        if (session.current === current) { stop(); setError('Microphone disconnected. Select an input and reconnect.'); }
      }));
      context.onstatechange = () => {
        if (session.current === current && current.context.state === 'suspended') { stop(); setError('Audio was interrupted. Start a new session to continue.'); }
      };
      let last = 0;
      const tick = (now: number) => {
        if (session.current !== current) return;
        if (now - last >= 65) {
          last = now;
          analyser.getFloatTimeDomainData(current.samples);
          let sum = 0; for (const value of current.samples) sum += value * value;
          setLevel(Math.max(-100, 20 * Math.log10(Math.sqrt(sum / current.samples.length))));
          setWave(Array.from({ length: 160 }, (_, i) => current.samples[i * 8]));
          if (!current.pending) {
            current.pending = true;
            // Timestamp the oldest sample so pre-target audio cannot score.
            frameCapturedAt = now - current.samples.length / current.context.sampleRate * 1000;
            const copy = current.samples.slice();
            current.worker.postMessage({ samples: copy, sampleRate: current.context.sampleRate, gate: gateRef.current }, [copy.buffer]);
          }
        }
        current.frame = requestAnimationFrame(tick);
      };
      current.frame = requestAnimationFrame(tick);
      setSampleRate(context.sampleRate); setMode(demo ? 'demo' : 'microphone');
      if (!demo) void refreshDevices();
    } catch (cause) {
      stream?.getTracks().forEach(t => t.stop()); worker?.terminate();
      if (context && context.state !== 'closed') await context.close().catch(() => {});
      if (token !== generation.current) return;
      stop();
      const name = cause instanceof DOMException ? cause.name : '';
      setError(name === 'NotAllowedError' ? 'Microphone access was denied. Allow it in your browser’s site settings, then try again.' : name === 'NotFoundError' ? 'No microphone found. Connect a microphone or try the demo.' : name === 'NotReadableError' ? 'The microphone is unavailable. Close other audio apps and try again.' : cause instanceof Error ? cause.message : 'Could not start audio. Please try again.');
    }
  }, [stop, demoMidi, reference, refreshDevices]);

  useEffect(() => { session.current?.oscillator?.frequency.setTargetAtTime(frequencyFor(demoMidi, reference), session.current.context.currentTime, 0.03); }, [demoMidi, reference]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hide);
    navigator.mediaDevices?.addEventListener('devicechange', refreshDevices);
    void refreshDevices();
    return () => { document.removeEventListener('visibilitychange', hide); navigator.mediaDevices?.removeEventListener('devicechange', refreshDevices); stop(); };
  }, [stop, refreshDevices]);
  return { mode, error, pitch, capturedAt, level, wave, sampleRate, computationMs, devices, start, stop };
}
