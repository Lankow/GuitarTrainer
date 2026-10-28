# Audio validation

Updated: 2026-10-10. Desktop browser version.

## Automated evidence

- npm run build: passed (TypeScript and Vite production bundle).
- npm test: 27 tests passed.
- Synthetic note cases cover open strings plus A4, E5, and E6 at 44.1/48 kHz, within 5 cents.
- Weak-fundamental cases retain the correct low E octave despite stronger harmonics.
- Silence, DC input, invalid samples, sub-gate signals, and seeded broadband noise are rejected.
- Musical conversion tests cover names, octaves, positive/negative cents, and alternate reference tuning.
- npm install reported zero known vulnerabilities for the resulting dependency tree.

These are synthetic checks, not a claim of equivalent accuracy on a real guitar.

## Browser verification

The initial screen rendered and was visually inspected in the in-app Chromium browser. The internal demo produced E2 at 82.4 Hz, E4 at 329.6 Hz, and A2 at 110.0 Hz. With A4 reference set to 432 Hz, A2 was detected at 108.0 Hz. Stop cleared the live note/level, restart resumed analysis, and the quick guide opened and closed. Physical microphone permissions, disconnect behavior, and hidden-tab release still require separate checks.

## Required physical checks

1. In desktop Chrome or Edge, allow microphone access and select the intended input.
2. Test open strings and several fretted notes, including quiet plucks and decay.
3. Test permission denial, unplugging the input, stopping/restarting, and switching tabs.
4. Measure at least 30 attacks per setup. Report device, microphone, OS, browser, date, method, median and p95 latency. Worker computation time is not total latency.
5. Test 30 seconds of silence and representative room noise, followed by a 10-minute session.

Proposed quality targets for later hardware validation: 95% of stable reference frames within 10 cents, no confirmed notes in the silence test, and p95 attack-to-stable-display latency ≤150 ms. These targets are unverified and may require a shorter frame, different capture path, or improved stabilization.

No real guitar hardware measurements or iOS/Android validation have been completed for this desktop implementation.

## Fast Spider Walk synthetic checks (2026-10-28)
The earlier 4096-sample/65 ms submission profile imposes a long window and sparse observations. Spider Walk now uses a scaled 2048-sample short-window profile, a 16 ms eligibility interval and direct detector-result delivery. At 48 kHz, synthetic harmonic-rich sequences with 100 and 125 ms note durations complete through the actual detector and scoring reducer with simulated 60 Hz capture and 2 ms worker delivery. This simulation does not measure actual worker scheduling or browser latency. Low-note harmonic tests include 96 kHz capture with a scaled 4096-sample frame. Physical microphone/amp validation remains required.
