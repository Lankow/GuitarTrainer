# ADR 0010: Untimed practice and local bilingual UI

Status: Accepted, 2026-10-12.

## Context
The user requested a standalone metronome, timing-free note/scale practice, a Spider Walk guide independent of audio, and an English/Polish switch.

## Alternatives
- Infinitely extending a timed deadline would keep irrelevant score/timer UI.
- Automatically advancing a silent Spider Walk would still impose timing.
- Browser page translation would not provide predictable app copy or saved language selection.

## Decision and rationale
Use an explicit untimed note/scale screen sharing the existing pure ordered-note matcher, and manual four-note navigation for Spider Walk. Preserve timed modes separately. Use explicit translation calls and a Polish dictionary with English fallback; keep language and other new options in a subscribed local store. Reuse the existing metronome audio clock with configurable accent grouping.

## Consequences
Untimed completion is progress, not a competitive score. Modes use separate setup from timed practice. The guide cannot certify technique. Polish UI retains international note names. Additional backup sections are optional for backward compatibility; restoring an old backup clears these new settings to defaults. Actual guitar detection and speaker timing still require hardware validation.

## Verification
Automated tests cover indefinite waits, wrong-note rejection, any-octave matching, release gating, settings validation and translation interpolation. Browser checks cover language changes, metronome transport, mode selection and manual navigation. Hardware checks are reported separately rather than inferred from browser tests.
