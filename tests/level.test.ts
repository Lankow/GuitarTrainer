import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rmsDb } from '../src/audio/level.ts';

test('silence and empty input produce the meter floor', () => {
  assert.equal(rmsDb(new Float32Array(100)), -120);
  assert.equal(rmsDb(new Float32Array()), -120);
});
test('full scale and half amplitude use the expected dB reference', () => {
  assert.equal(rmsDb(new Float32Array([1, -1])), 0);
  assert.ok(Math.abs(rmsDb(new Float32Array([0.5, -0.5])) + 6.0206) < 0.001);
});
test('a full amplitude sinusoid has approximately -3.01 dBFS RMS', () => {
  const wave = Float32Array.from({ length: 480 }, (_, i) => Math.sin(2 * Math.PI * i / 48));
  assert.ok(Math.abs(rmsDb(wave) + 3.0103) < 0.001);
});
test('invalid samples do not produce an invalid meter value', () => {
  assert.equal(rmsDb(new Float32Array([NaN])), -120);
});
