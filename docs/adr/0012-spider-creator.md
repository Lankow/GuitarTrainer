# Spider Walk creator and completion-time scoring

Status: Accepted — 2026-10-27. Supersedes Spider Walk behavior in ADRs 0008, 0010 and 0011; their historical records remain intact.

## Context
The user requested one mode, completion time as the score, optional background metronome, retained tuning, and saved user-created sequences with import/export. The user confirmed click order and automatic advancement on correct pitch.

## Alternatives
- Retain beat windows: conflicts with completion-time practice.
- Advance manually: rejected by the user.
- Store only fret numbers: cannot represent cross-string routines unambiguously.

## Decision and rationale
Store ordered string/fret positions in records with repetition counts, under named patterns. Match exact MIDI pitch computed from the selected tuning. Keep capture and UI outside the pure run reducer. Measure wall-clock elapsed time from microphone readiness/target presentation to final match. The metronome runs independently and never changes targets. Repeated equal pitches require release to avoid crediting one sustained note twice.

## Consequences
Timing includes detection delay and is not a latency benchmark. No deadline, beat accuracy, manual progression or tempo ladder remains in the active screen. Time is shown for the current session only. Legacy position order migrates and original storage stays intact. Imports add copies with new IDs. Bound file and record sizes; validate before mutation. Exact pitches cannot verify fingering or string choice.

## Verification
Automated coverage checks expansion, migration, file validation, exact-octave matching, wrong/stale/future frames, repeated-note release and final completion. Browser and real-guitar results are recorded separately; no physical accuracy claim is made.
