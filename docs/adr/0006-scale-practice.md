# ADR-0006: scale practice modes

Status: accepted. Date: 2026-10-11.

## Context
The user requests random scale notes and consecutive scale repetitions measured by elapsed time.

## Decision
Reuse timed practice for random mode. Implement a separate pure ordered state machine for ascending root-to-root repetitions, without per-note timeouts. Keep octave-independent matching from ADR-0005. Begin elapsed time on first-target presentation after microphone setup; end on final recognition.

## Alternatives
Octave-specific scale runs would change the current matching requirement. Omitting the final root makes scale completion less explicit. Counting a sustained root twice would allow false repetition progress.

## Rationale
Independent ordered progression keeps deadline logic out of the repetition mode and makes timing/release behavior testable.

## Consequences
Mute or change pitch between repeated roots. The app verifies note-name sequence, not fret position or physical pitch ascent. Timing includes detection latency. Random best scores persist; ordered results currently display elapsed time only.

## Verification
Automated tests cover scale intervals/transposition, wrong/stale notes, arbitrary-octave matches, no timeout, repetition boundaries, and exact completion time. Real guitar validation remains pending.
