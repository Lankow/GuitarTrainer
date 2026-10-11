export type Pitch = { frequency: number; clarity: number; rms: number };
export const STRINGS = [
  { note: 'E', octave: 2, midi: 40 }, { note: 'A', octave: 2, midi: 45 },
  { note: 'D', octave: 3, midi: 50 }, { note: 'G', octave: 3, midi: 55 },
  { note: 'B', octave: 3, midi: 59 }, { note: 'E', octave: 4, midi: 64 },
];
export const frequencyFor = (midi: number, reference = 440) => reference * 2 ** ((midi - 69) / 12);
export function describePitch(frequency: number, reference = 440) {
  const exact = 69 + 12 * Math.log2(frequency / reference);
  const midi = Math.round(exact);
  return { midi, name: ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][((midi % 12) + 12) % 12], octave: Math.floor(midi / 12) - 1, cents: (exact - midi) * 100 };
}

/** YIN difference / cumulative mean normalization. Mono, one pitched source. */
export function detectPitch(samples: Float32Array, sampleRate: number, gateDb = -55): Pitch | null {
  if (sampleRate < 8000 || !Number.isFinite(sampleRate) || samples.length < 1024) return null;
  let mean = 0;
  for (const value of samples) { if (!Number.isFinite(value)) return null; mean += value; }
  mean /= samples.length;
  let energy = 0;
  for (const value of samples) energy += (value - mean) ** 2;
  const rms = Math.sqrt(energy / samples.length);
  if (rms < 10 ** (gateDb / 20)) return null;
  const minTau = Math.max(2, Math.floor(sampleRate / 1400));
  const maxTau = Math.min(Math.ceil(sampleRate / 70), Math.floor(samples.length / 2) - 1);
  const window = samples.length - maxTau;
  const difference = new Float32Array(maxTau + 1);
  let total = 0;
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0;
    for (let i = 0; i < window; i++) sum += (samples[i] - samples[i + tau]) ** 2;
    total += sum;
    difference[tau] = total > 0 ? sum * tau / total : 1;
  }
  for (let tau = minTau; tau < maxTau; tau++) {
    if (difference[tau] >= 0.12) continue;
    while (tau + 1 <= maxTau && difference[tau + 1] < difference[tau]) tau++;
    const left = difference[tau - 1], center = difference[tau], right = difference[tau + 1] ?? center;
    const denominator = 2 * (2 * center - right - left);
    const adjustment = denominator ? (right - left) / denominator : 0;
    const frequency = sampleRate / (tau + Math.max(-1, Math.min(1, adjustment)));
    if (frequency < 75 || frequency > 1350) return null;
    return { frequency, clarity: Math.max(0, 1 - center), rms };
  }
  return null;
}
