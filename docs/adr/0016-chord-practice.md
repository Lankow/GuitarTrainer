# Experimental microphone chord practice
Status: Accepted — 2026-10-30. Extends the previous single-note scope at the user's explicit request.

## Context
The user requested random Chord Practice with user-created chord sets and explicitly chose full-chord microphone detection rather than visual-only progression.

## Alternatives
- Visual-only timed/manual targets: rejected for this request.
- Reuse YIN single-pitch results: cannot establish simultaneous chord tones.
- Remote or learned recognition service: adds privacy/backend requirements outside scope.
- Local spectral templates: chosen as a bounded experimental baseline.

## Decision and rationale
Keep capture shared and route chord frames to a separate worker/pure detector. Hann-window FFT magnitudes are decomposed against cached harmonic pitch templates using nonnegative coordinate updates. Fold to chroma, compare all 36 major/minor/dominant-seventh templates, and reject unsupported, incomplete or ambiguous results. The exercise pool never biases detection. Require two fresh consecutive matching frames. Timed/Free orchestration and saved sets use the shared app/platform lifecycle.
Conceptual reference: [AudioLabs template-based chord recognition](https://www.audiolabs-erlangen.de/resources/MIR/FMP/C5/C5S2_ChordRec_Templates.html). Implementation is original and uses harmonic decomposition before chroma matching; this is not a reproduction of the notebook or a measured trained model.

## Consequences
Only 16 catalog chord types/voicings are offered initially. Incomplete voicings may be rejected; diagrams deliberately contain all chord tones. Chord analysis needs longer frames than single-note practice. Scores are experimental recognizer matches, not verified playing quality. No accounts, recording, uploads or remote processing. Legacy backup files remain compatible. Android shares the UI/logic but needs physical validation; iOS is deferred.

## Verification
Synthetic tests cover the catalog's chord tones, recognition at 44.1/48 kHz, harmonics, unequal string levels, references 432/442, octave shifts, unsupported chords, single notes, silence, DC, noise and invalid samples. Exercise tests cover fresh/stable matching, timing, repeated targets and backup roundtrips. Physical guitar/transient/noise validation remains required before accuracy claims.

Implementation checks on 2026-10-30: all 106 tests passed; production build and separate typecheck passed. The local development endpoint returned HTTP 200. Visual interaction checks remain incomplete because the in-app browser retained a connection-error page and navigation was blocked by its URL policy. No real-guitar, Android device, or end-to-end microphone accuracy result is claimed.
