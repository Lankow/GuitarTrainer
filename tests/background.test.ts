import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onAppBackground } from '../src/platform/background.ts';

test('browser hiding cancels but showing does not; cleanup disables callbacks', () => {
  let hidden = false, calls = 0, removals = 0;
  let visibility = () => {};
  const dispose = onAppBackground(() => calls++, {
    isHidden: () => hidden,
    listenVisibility: listener => { visibility = listener; return () => { removals++; }; },
  });
  visibility(); assert.equal(calls, 0);
  hidden = true; visibility(); assert.equal(calls, 1);
  hidden = false; visibility(); assert.equal(calls, 1);
  dispose(); hidden = true; visibility();
  assert.equal(calls, 1); assert.equal(removals, 1);
});

test('native background cancels even with visible document; late listener is removed', async () => {
  let calls = 0, removals = 0;
  let native = (_state: { isActive: boolean }) => {};
  let resolve!: (handle: { remove: () => Promise<void> }) => void;
  const dispose = onAppBackground(() => calls++, {
    isHidden: () => false,
    listenVisibility: () => () => {},
    listenNative: listener => { native = listener; return new Promise(done => { resolve = done; }); },
  });
  native({ isActive: true }); assert.equal(calls, 0);
  native({ isActive: false }); assert.equal(calls, 1);
  dispose();
  resolve({ remove: async () => { removals++; } });
  await Promise.resolve();
  native({ isActive: false });
  assert.equal(calls, 1); assert.equal(removals, 1);
});
