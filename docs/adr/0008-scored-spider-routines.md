# ADR 0008: Scored Spider Walk with pattern blocks

Status: Accepted, 2026-10-12. Supersedes ADR 0007's single-pattern, unscored scope; retains its audio-clock and cancellation design.

## Context
The user explicitly requested a score, a pattern creator, consecutive blocks with different repetition counts, and mixed patterns. They confirmed that mixing means per-string changes, and scoring means matching the expected pitch within each beat.

## Alternatives
- Manual self-scoring cannot automatically check expected pitches.
- Untimed wait-for-note mode does not meet the confirmed per-beat requirement.
- Pitch-class matching follows Note Practice but accepts octave substitutions for a concrete fret target.
- Exact-pitch scoring checks the acoustic target while acknowledging that string and finger remain unobservable.

## Decision and rationale
Use exact-pitch, one-point-per-beat scoring and a separate unscored preview. Expand ordered blocks, repetition counts, and optional per-string patterns into immutable note targets before starting. Patterns are permutations of fingers 1–4. Routine switching is planned before the run and automatic during it, so targets and scoring remain stable. Keep high scores outside this change; display current-session totals and per-block results.

## Consequences
Microphone readiness precedes count-in. The chosen tuning must match the guitar. Headphones are recommended with audible clicks. Analysis delay reduces the usable response window; no latency compensation is claimed. Repeated equal pitches require a non-target detection within the new beat before matching. Local v1 settings migrate to a v2 one-block routine. Physical finger/string verification remains impossible from pitch alone.

## Verification
Tests cover preset/custom validation, block boundaries and repetitions, per-string patterns and reverse traversal, tuning-derived MIDI, exact-octave scoring, timing boundaries, duplicate rejection, and release gating. Build and browser verification accompany this change; real-guitar and phone scoring require later hardware validation.
