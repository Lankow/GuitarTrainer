# ADR-0005: octave-independent note practice

Status: accepted. Date: 2026-10-11. Supersedes ADR-0004 octave-specific matching.

## Context
The user requests that a target E accept E2, E3, or another E octave.

## Decision
Match pitch classes (MIDI modulo 12), deduplicate tuning targets by note name, and omit octave numbers in practice UI. Separate new high-score keys from historical octave-specific scores. Studio keeps precise octave information.

## Alternatives
Keeping octave-specific scoring contradicts the requested exercise. Mixing historical scores would compare different rules.

## Rationale
The exercise now trains note names rather than pitch registers.

## Consequences
Octave errors do not affect practice scoring. The detector's frequency range still applies. Repeated note names in a tuning have one checkbox and equal target probability.

## Verification
Automated coverage checks octave equivalence, different-note rejection, and octave-deduplicated target generation. Real-guitar validation remains pending.
