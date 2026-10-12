# ADR 0007: Guided Spider Walk with optional metronome

Status: Accepted (initial implementation, 2026-10-12).

## Context
The user requested an initial Spider Walk proposal and implementation to review, with an optional metronome. Finger coordination cannot be verified by pitch alone.

## Alternatives
- Microphone-scored fret targets: assesses pitch but cannot prove finger or string choice and adds interaction with audible clicks.
- Static tablature: simple, but does not guide pacing.
- Timed visual positions with optional clicks: supports a complete coordination routine without claiming accuracy.

## Decision and rationale
Use timed visual guidance with optional Web Audio clicks, one note per beat, four count-in beats, and configurable finger pattern, fret, return journey and repetitions. Keep sequence logic independent from React and audio scheduling. Use one audio clock for clicks and visual position.

## Consequences
No microphone or accuracy score is required. The user self-assesses technique. Hidden tabs cancel; canceled routines produce no completed result. Setup persists locally. Output latency and main-thread load can affect perceived audiovisual alignment; hardware verification remains necessary.

## Verification
Pure tests cover sequence direction, pattern-to-fret mapping, count-in/end boundaries and invalid saved settings. Production build and browser checks are recorded with the implementation; real-device click alignment and physical technique are not automatically verified.
