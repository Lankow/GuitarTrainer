# Product scope

Updated: 2026-10-11.

## Current direction

The user requested reverting the previous work and focusing on an initial desktop version. The active Expo implementation has been replaced by a React desktop browser app. On 2026-10-11, the user explicitly confirmed desktop browser delivery for the initial version. Native desktop packaging is not implemented. Android and iOS are deferred.

English remains the language for code, UI, and documentation. Documentation changes accompany implementation.

## Initial version

- Detect one pitched guitar note at a time from the selected microphone.
- Show note name, octave, Hz, and cents relative to the nearest equal-tempered pitch.
- Indicate in tune within ±5 cents. This is a UI tolerance, not a measured accuracy claim.
- Cover standard six-string guitar notes; detection search is 75–1350 Hz (approximately E2–E6 with margin).
- Provide a waveform, input level, noise gate (-70 to -30 dB), and reference pitch (A4 432/440/442 Hz).
- Provide explicit microphone start/stop, permission errors, disconnect handling, and stop on hidden tab.
- Include a labeled synthetic demo. Demo audio is generated internally and not played through speakers.
- Process audio locally with no audio storage, accounts, or backend.

Standard tuning: E2 A2 D3 G3 B3 E4. Use international names: B natural, not Polish H.

## Later work

1. Validate with real guitar recordings and live hardware.
2. Improve stabilization and measure end-to-end latency.
3. Add play-the-displayed-note exercises.
4. Add spider sequences and rhythm assessment.
5. Revisit packaging and mobile platforms after the desktop audio workflow is validated.

Pitch alone cannot verify a finger or uniquely identify a string/fret. The string reference highlights a matching open-string pitch; it does not identify which string the player used.
