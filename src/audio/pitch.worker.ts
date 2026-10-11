import { detectPitch } from './pitch';
self.onmessage = (event: MessageEvent<{ samples: Float32Array; sampleRate: number; gate: number }>) => {
  const { samples, sampleRate, gate } = event.data;
  const started = performance.now();
  const pitch = detectPitch(samples, sampleRate, gate);
  self.postMessage({ pitch, computationMs: performance.now() - started });
};
