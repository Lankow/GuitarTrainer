# Product scope

Updated: 2026-10-11.

## Current direction

The user requested reverting the previous work and focusing on an initial desktop version. The active Expo implementation has been replaced by a React desktop browser app. On 2026-10-11, the user explicitly confirmed desktop browser delivery for the initial version. Native desktop packaging is not implemented. Android and iOS are deferred.

English remains the language for code, UI, and documentation. Documentation changes accompany implementation.

## Initial version

- Detect one pitched guitar note at a time from the selected microphone.
- Show note name, octave, Hz, and cents relative to the nearest equal-tempered pitch.
- Indicate in tune within ±5 cents. This is a UI tolerance, not a measured accuracy claim.
- Cover standard six-string guitar notes; detection search is 65–1350 Hz (including low D2 for alternate tunings).
- Provide a waveform, input level, noise gate (-70 to -30 dB), and reference pitch (A4 432/440/442 Hz).
- Provide explicit microphone start/stop, permission errors, disconnect handling, and stop on hidden tab.
- Include a labeled synthetic demo. Demo audio is generated internally and not played through speakers.
- Process audio locally with no audio storage, accounts, or backend.

Standard tuning: E2 A2 D3 G3 B3 E4. Use international names: B natural, not Polish H.

## Later work

1. Validate with real guitar recordings and live hardware.
2. Improve stabilization and measure end-to-end latency.
3. Extend note practice beyond open strings.
4. Add spider sequences and rhythm assessment.
5. Revisit packaging and mobile platforms after the desktop audio workflow is validated.

Pitch alone cannot verify a finger or uniquely identify a string/fret. The string reference highlights a matching open-string pitch; it does not identify which string the player used.

## Settings and appearance

User requirement: dedicated Settings screen for audio input and related options, plus a color wheel for choosing the UI color.

Implemented: sidebar navigation between Note studio and Settings. Settings contains microphone selection, an input test and level meter, noise gate, and reference pitch. Studio retains start/stop, demo, detector, and waveform. Switching these screens preserves the audio session; switching browser tabs still stops it. Stop/cancel is available in Settings before selecting another microphone. Unavailable saved devices are identified in the selector; choose System default if needed.

The hue wheel supports pointer dragging and arrow keys (Home/End select hue endpoints). Six presets and a native custom color picker provide alternatives. Changes apply immediately to accents and tinted surfaces; readable text and button foregrounds are derived separately. Restore default orange resets appearance only.

Implementation choice: microphone ID, gate, reference, and color persist in localStorage on this browser origin. No audio is saved. Invalid stored values fall back to defaults; storage failures show a notice while keeping the controls usable for the current session. No account or cross-device synchronization is provided.

Verification (2026-10-11): 27 existing DSP/music tests and production build passed. Browser checks confirmed preset and keyboard hue changes, color/reference persistence after reload, restore-green behavior, and a demo session continuing into Settings with input selection disabled until stopped. Real microphone testing and exhaustive contrast/accessibility validation remain pending.

## Local profile and alternate tunings

On first launch without a valid nickname cookie, the app asks for a nickname (1–30 characters after trimming). A single local profile is saved in a host-only, SameSite=Lax cookie for one year, with Secure on HTTPS. It can be renamed in Settings. Cookies are sent to the same host with requests; there is no account backend or login. If cookies are blocked, the nickname remains for the current session and a warning appears. Clearing or expiring the cookie shows onboarding again.

Note Studio offers Standard, Drop D, half step down, whole step down, Open G, and DADGAD, saved with local preferences. Targets and demo notes follow the chosen tuning. A card highlights when detected MIDI pitch matches its target, including octave; it says Detected when off pitch and In tune within ±5 cents. Silence clears the highlight. This indicates pitch correspondence, not physical string identification.

New profiles/preferences default to orange (#f5a45d); existing saved color choices are preserved. Restore default orange is available in Settings. The logo reads GuitarTrainer.

Verification for profiles and tuning (2026-10-11): 31 automated tests passed, including D2/D-sharp2 at 44.1/48 kHz and low-D weak-fundamental detection at A4=432 Hz. Type checking and production build passed. Browser checks verified first-launch nickname entry, cookie persistence after reload, Drop D demo recognition at 73.4 Hz with the low-string highlight, highlight clearing on stop, and the orange reset action. Real guitar validation remains pending.

## Note Practice

User requirement: configure note count, response time, and inter-note countdown; award one point for a correct note during its response window; show a final score and retain a high score in a cookie.

Implemented defaults: 20 notes, 2000 ms response, 1000 ms break. Count is editable from 1–100 (presets 10/20/30/40), response 250–30000 ms, and break 100–10000 ms. The break countdown also precedes the first note. Microphone permission/setup completes before the first countdown. The full response window runs even after a hit. Each missed target scores zero; completed sessions show points, misses, and percentage.

Scope choice: targets are randomly chosen open-string MIDI pitches from the selected Note Studio tuning, without consecutive duplicates. Matching the nearest note name, regardless of octave earns one point per target; practice does not require the studio's stricter ±5-cent in-tune threshold. Only newly captured analysis windows after the target appears qualify, and results arriving at or after the deadline are rejected. Mute strings during breaks; this version detects pitch, not a fresh pluck. Timers use monotonic deadlines; a delayed render starts the next phase at its actual transition rather than skipping unseen targets.

Audio/color settings remain in Settings and save automatically. Practice configuration saves locally when starting a session. An explicitly labeled timing preview requires no microphone and cannot write high scores. Leaving practice, canceling, microphone interruption, or hiding the tab ends the session without saving incomplete scores.

High scores belong to the single local browser profile, and survive nickname edits. They are separated by note count, response time, break, tuning, and A4 reference. The cookie stores up to 12 most recently completed configurations for one year, host-only, SameSite=Lax, Secure on HTTPS. A lower score never replaces a higher score. Cookies being blocked produces an explicit unsaved-score notice. Clearing cookies clears these records; they are local, editable client data, not a competitive leaderboard.

Verification: 37 tests and production build passed, including deadline boundaries, stale/late frames, octave mismatch, one-point-only scoring, missed notes, sequence generation, and cookie best-score preservation/failure handling. A two-note browser timing preview completed with zero points and two misses, without saving a high score. Real-guitar end-to-end scoring remains unverified.

## Navigation and practice feedback

Settings is anchored near the bottom of the desktop sidebar, above the local profile/footer, and remains accessible in the compact header layout. A scored note immediately gives the practice card a green glow. A missed deadline gives it a red glow during the next break; the next target clears that feedback. The results card retains the final note's outcome with an explicit last-note label. Text accompanies the colors, which stay green/red regardless of the chosen UI theme. Feedback does not add delays or change scoring, and uses static glow rather than flashing animation.

## Practice tuning and note selection

The decorative 01 badge has been removed from Note Studio navigation. Practice setup now has its own tuning selector and one checkbox per distinct note name (any octave). It initially uses the studio tuning; subsequent practice choices persist independently. Changing tuning selects all note names in the new tuning. Select all notes restores the full set. Empty selection disables both start and preview, with an explanation. One selected note is allowed and repeats each round; players should mute during each break. With multiple notes, consecutive targets differ. Only checked notes appear.

Tuning/note selection saves immediately in localStorage. High scores distinguish selected pitch-class sets, independent of checkbox selection order; any-octave sessions use new score keys separate from historical octave-specific scores. Practice setup is locked during a session. Timing and pitch matching rules are unchanged.

Verification: 39 tests passed, including single-note/subset generation and order-independent subset score keys; production build passed. Browser checks verified tuning-dependent labels, empty-selection protection, and persisted tuning/subset after reload. Real-guitar scoring remains unverified.

Practice tuning and note checkboxes are now hidden by default under an Advanced toggle in the practice setup. Collapsing Advanced preserves the selection; the setup summary shows its tuning and selected-note count. Start Practice and Preview Timing have equal widths and heights. The sidebar nickname/motivational block is removed; the profile remains editable in Settings. The Local Audio badge continues to indicate on-device microphone processing.

Number of notes uses a compact dropdown with 10 / 20 / 30 / 40 / Custom options. Only Custom reveals the numeric input (1–100); preset selection directly sets the count. Saved counts outside the presets reopen as Custom.

The Local Audio badge has a subtle repeating pulse around its dot, independent of microphone state. Its tooltip clarifies that it indicates local processing, not active recording. Reduced-motion preferences replace the animation with a static ring.

Note Practice accepts matching note names in any octave within the detector range (65–1350 Hz). Targets and detected-note feedback omit octave numbers. Duplicate names in a tuning (such as E2/E4) share one checkbox and one equally weighted target. Existing saved selections map to their note names. New any-octave high scores are separated from older octave-specific records. Note Studio retains octave/frequency display and exact open-string highlighting for tuning.

Practice note selection uses accessible letter tiles: selected notes have an accent border and underline, while excluded notes are grey. The tiles omit the Any octave subtitle; octave-independent scoring is unchanged. Note Practice includes a collapsible Quick guide covering setup, scoring, microphone access, and completion. Octave Practice appears as a non-interactive SOON sidebar placeholder.

The future finger-coordination exercise is labeled Spider Walk in the sidebar and remains a non-interactive SOON placeholder.

## Scale Practice

The former Octave Practice placeholder is now an active Scale Practice screen. User requirements: random scale-note practice, plus consecutive scale repetitions scored by completion time rather than deadlines.

Initial scope choices: all 12 root pitch classes, major, natural minor, major pentatonic and minor pentatonic; sharp spellings for accidentals. Both modes accept any octave within the detector range. Scale settings save on session start separately from Note Practice.

Random mode uses the existing countdown/response engine, 1–100 targets, no consecutive identical note names, green/red outcomes, and separate cookie high scores for scale/root/reference/timing. A timing-only preview never saves scores.

Consecutive mode shows ascending scale degrees plus the closing root, repeated 1–100 times. There are no per-note deadlines or inter-note delays. The timer starts when the first target appears after microphone setup, and ends when the final correct pitch is detected. Wrong notes do not advance; fresh analysis windows are required for each target. A brief silence or different note must separate the closing root and the next repetition's opening root to prevent double-counting sustained audio. Results show elapsed seconds and completed repetitions. Completion times are displayed, not persisted as best times in this initial version.

Leaving the screen, hiding the tab, or losing microphone input cancels without a completed result. Processing/detection latency contributes to elapsed time; no physical latency guarantee is claimed.
