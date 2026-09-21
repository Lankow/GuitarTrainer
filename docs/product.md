# Product scope

Status: initial requirements and proposals for validation, 2026-09-21.

## User requirements

1. Installable on Android and iOS, with an optional web application.
2. Detect the currently played note in real time.
3. Later, an exercise asking the user to play a note shown by the application.
4. Later, spider exercises for finger coordination.
5. Documentation maintained from the beginning.
6. English for communication, implementation, documentation, and initial UI text.

## Initial prototype assumptions

A six-string guitar in standard tuning E2–A2–D3–G3–B3–E4, individual notes, the device microphone, and the application in the foreground. Use international note names internally and in the initial English UI: B natural corresponds to H in Polish notation.

Proposed measurement range for the first version: E2–E6. Calibration: A4 = 440 Hz. The instrument, available devices, and priority of app-store distribution versus PWA installation need confirmation before selecting the target platform.

## Milestones

| Stage | Outcome | Completion criterion |
| --- | --- | --- |
| 0: experiment | Microphone → note name, octave, Hz, cents | Documented measurements on Android and iPhone |
| 1: detector | Clear start/stop screen with silence, permission denial, and error states | Experiment criteria met on declared devices |
| 2: play a note | Target, stable-note assessment, session result | Defined tolerances, hold duration, and repetition rules |
| 3: spider exercises | String/fret/finger sequence, tempo, pitch and timing assessment | Distinguish successive attacks, including repeated notes |

Pitch alone cannot confirm which finger was used or uniquely identify the string/fret. Spider exercises can guide fingering and assess pitch/rhythm, but must not claim to verify finger movement through the microphone.

Outside the first version: chords, song transcription, sign-in, synchronization, payments, and background analysis. These are limits of the proposed MVP, not permanent product restrictions.
