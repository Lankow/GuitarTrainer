# ADR-0004: timed note practice and local high scores

Date: 2026-10-11. Status: accepted.

## Context

The user requests configurable note-count, response-time and break-time practice with final scores and a cookie-backed high score. Existing audio detection and a single local profile are available.

## Decision

Use a pure timestamp-driven exercise state machine and a separate microphone session owned by the practice screen. Choose random open-string targets from the current tuning without consecutive repeats. Count at most one nearest-semitone/octave match per target within its response window. Preserve the full response duration after a hit. Store best scores by configuration in a bounded cookie (12 most recently completed configurations, one-year lifetime).

## Alternatives

A single raw-point best score would unfairly mix note counts and difficulty. Early advancement after a hit would alter the requested cadence. A backend leaderboard is outside scope. Targeting every fret or requiring a detected pluck needs additional product and signal-processing work.

## Rationale

The chosen flow directly follows countdown, response, break, and final-score behavior while making timing and scoring independently testable. Audio and UI remain separate from exercise rules.

## Consequences

Same-host cookies carry score summaries and can be edited by the user; this is a local personal best, not a verified leaderboard. High scores follow the local profile across nickname edits. Incomplete/interrupted sessions and timing previews never save scores. Browser scheduling and audio latency affect the experience; no end-to-end timing guarantee is claimed.

## Verification

37 automated tests and production build passed. Tests cover deadlines, stale frames, wrong octaves, repeat scoring, misses, configuration boundaries, sequence generation, and score-cookie behavior. Browser timing preview reached its final result with the expected zero score. Real-guitar scoring remains to be validated.
