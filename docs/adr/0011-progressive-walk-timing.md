# Shared timing schedule for progressive Spider Walk

Status: Accepted — 2026-10-13

## Context

The user requested Spider Walk progression and richer session feedback. Changing BPM independently in the audio scheduler, UI and scorer would risk inconsistent note windows.

## Alternatives

- Restart a fixed-tempo clock after every repetition, introducing a gap and resetting capture origins.
- Maintain separate calculations in each consumer, risking drift or boundary disagreements.
- Precompute one schedule for the complete routine.

## Decision and rationale

Use one immutable list of beat offsets for the four-beat count-in and every target. Increment tempo after complete repetitions (including returns), carry progression across blocks and cap at the configured maximum. The audio scheduler, visible target and scorer all consume that schedule. Optional setup fields preserve legacy data compatibility. Progression is independent of score.

## Consequences

The starting tempo determines count-in speed. There is no extra pause at a tempo change. Invalid setup disables launch; manual guidance ignores the ladder. Feedback remains session-local; response time includes audio processing delay and is not a latency measurement. No history storage or scoring rules are changed.

## Verification

Pure tests cover repetition/return boundaries, cross-block progression, the cap, disabled progression and stale-frame rejection. A silent browser preview completed two repetitions from 150 to 170 BPM and reported 18.1 seconds excluding count-in. This does not establish audible timing accuracy or real-guitar reliability; physical validation remains pending.
