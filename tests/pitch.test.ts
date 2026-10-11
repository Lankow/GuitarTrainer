import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectPitch, describePitch, frequencyFor, STRINGS } from '../src/audio/pitch.ts';

function tone(frequency: number, rate: number, harmonic = false) {
  return Float32Array.from({ length: 4096 }, (_, i) => {
    const phase = 2 * Math.PI * frequency * i / rate;
    return harmonic ? 0.15 * Math.sin(phase) + 0.4 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase) : 0.5 * Math.sin(phase);
  });
}
for (const rate of [44100, 48000]) {
  for (const midi of [...STRINGS.map(s => s.midi), 69, 76, 88]) {
    test(`detects MIDI ${midi} at ${rate} Hz within 5 cents`, () => {
      const expected = frequencyFor(midi);
      const actual = detectPitch(tone(expected, rate), rate);
      assert.ok(actual);
      assert.ok(Math.abs(1200 * Math.log2(actual.frequency / expected)) < 5);
    });
  }
  test(`detects weak fundamental rather than stronger second harmonic at ${rate} Hz`, () => {
    const expected = frequencyFor(40);
    const actual = detectPitch(tone(expected, rate, true), rate);
    assert.ok(actual);
    assert.ok(Math.abs(1200 * Math.log2(actual.frequency / expected)) < 5);
  });
}
test('silence, DC, invalid data, and sub-gate signals are rejected', () => {
  assert.equal(detectPitch(new Float32Array(4096), 48000), null);
  assert.equal(detectPitch(new Float32Array(4096).fill(0.5), 48000), null);
  assert.equal(detectPitch(new Float32Array(4096).fill(NaN), 48000), null);
  assert.equal(detectPitch(tone(440, 48000).map(x => x / 10000), 48000), null);
});
test('seeded broadband noise is rejected', () => {
  let seed = 42;
  const noise = Float32Array.from({ length: 4096 }, () => { seed = (1664525 * seed + 1013904223) >>> 0; return (seed / 4294967296 - 0.5) * 0.5; });
  assert.equal(detectPitch(noise, 48000), null);
});
test('note names, octave, reference pitch, and signed cents are correct', () => {
  assert.equal(describePitch(440).name, 'A');
  assert.equal(describePitch(440).octave, 4);
  assert.ok(Math.abs(describePitch(440 * 2 ** (17 / 1200)).cents - 17) < 0.001);
  assert.ok(Math.abs(describePitch(440 * 2 ** (-23 / 1200)).cents + 23) < 0.001);
  assert.equal(describePitch(432, 432).midi, 69);
});
