# Optional metronome-led Spider Walk
Status: Accepted — 2026-10-28. Extends ADR 0012.

## Context
The user requested an alternative that advances frets on beats without detecting notes.

## Alternatives
Manual advancement does not meet the request. Independent UI and audio timers risk drift.

## Decision and rationale
Offer a persisted optional beat-advancement setting alongside pitch detection. Precompute shared target/beat offsets with existing full-pattern BPM progression. Use the audio clock to locate the displayed target. Do not start microphone capture in this mode.

## Consequences
Each target lasts a full beat. Duration is determined by the schedule and is not a verified playing score. Volume zero mutes clicks without stopping advancement. Existing pitch-mode behavior remains the default.

## Verification
Automated tests cover boundaries, single-note duration and pattern tempo changes. Physical audio/visual synchronization and device testing remain pending.
