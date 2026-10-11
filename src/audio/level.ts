/** RMS of normalized mono PCM, expressed as dB relative to full scale. */
export function rmsDb(samples: Float32Array): number {
  if (samples.length === 0) return -120;
  let sum = 0;
  for (const sample of samples) {
    if (!Number.isFinite(sample)) return -120;
    sum += sample * sample;
  }
  return Math.max(-120, 20 * Math.log10(Math.sqrt(sum / samples.length)));
}
