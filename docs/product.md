# Product scope

Updated: 2026-10-11.

## Current direction

Future platform requirement (2026-10-28): the user wants an iOS version eventually. Current Android work must preserve a shared application and isolated platform integrations. The iOS project path is reserved; implementation, device validation and App Store delivery remain future work. See [platform structure](platforms.md).

The user initially requested desktop browser delivery, confirmed on 2026-10-11. On 2026-10-28, the user approved a Capacitor Android prototype reusing the React app, with eventual Google Play publication as the goal. Native desktop packaging is not implemented. iOS remains deferred. See [Android scope and validation](android.md) and [ADR-0014](adr/0014-android-capacitor.md); Android audio performance is unverified.

English remains the language for code, UI, and documentation. Documentation changes accompany implementation.

Android prototype (2026-10-28): native/android/ packages the shared React UI using Capacitor, targeting API 36. Web Audio capture and worker DSP remain unchanged; native microphone permission declarations and native app-background cancellation are implemented. All practice screens and the metronome use the shared background subscription alongside browser visibility handling. No automatic session resume is added. Android automatic app-data backup is disabled; the existing explicit JSON backup flow still needs WebView file-handling validation. This is a debug prototype with template branding, not a published Google Play release. Device audio, permissions, layout and file handling remain unverified; see [Android validation](android.md).

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
5. Validate the approved Android prototype on physical hardware before preparing store distribution; iOS remains deferred.

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

## Spider Walk

Implemented 2026-10-12 in response to the request for an initial Spider Walk with an optional metronome. Initial design choice: guided coordination practice without microphone assessment or accuracy scores. Pitch cannot verify finger placement.

Choose patterns 1-2-3-4, 1-3-2-4, or 1-4-2-3; starting fret 1–17; tempo 30–180 BPM; and 1–20 repetitions. Defaults: fret 5, 60 BPM, three repetitions, return enabled, audible clicks enabled. Fingers always map to consecutive frets. Travel from string 6 to string 1; optional return retraces all 24 positions in reverse, including a repeated turnaround note. One repetition is 24 notes without return or 48 with return.

Four count-in beats precede one note per beat. The screen shows finger, string, fret, beat, repetition, and a six-string fretboard (thin string at top). Muting the metronome preserves automatic visual timing. Results describe the scheduled routine duration excluding count-in and guided completion, not playing accuracy. Setup saves immediately when valid in localStorage. Invalid stored setup falls back to defaults; storage failures show a notice.

Leaving the screen, stopping, hiding the tab, or audio interruption cancels the routine and closes its audio clock. No recording, microphone permission, high score, or performance history is used. Actual speaker timing, mobile behavior, and a real guitar session require hardware validation.

Verification (2026-10-12): production build and all 47 tests passed. Desktop browser checks completed a silent 24-note routine at 180 BPM with an 8-second practice result after count-in, and started the sound-enabled mode. Physical audibility/alignment and Motorola testing remain unverified.

## Scored Spider Walk routines (2026-10-12)

This supersedes the unscored single-pattern behavior above. User-confirmed requirements: change patterns between strings (not hand positions along the neck), schedule different patterns over repetitions, and award points for expected pitches during their beats.

The pattern library has five presets including 2-3-4-1. The creator accepts any permutation of fingers 1–4, each used exactly once, with undo and duplicate prevention. A routine contains 1–8 ordered blocks, each with 1–20 repetitions. Blocks can be added, removed, and reordered before starting. By default a block applies one pattern to all six strings; Mix patterns by string exposes six independent selectors, ordered string 6 to string 1. Blocks switch automatically after their repetitions. For example: block 1 = 1-2-3-4 × 1; block 2 = 2-3-4-1 × 2. The return journey reverses the actual outward positions, including each string's pattern and the turnaround note. The starting fret remains fixed throughout the routine. Editing is locked during playback.

Scored walks connect the microphone before starting the four-beat count-in. Tuning is selectable independently of Note Studio; device, gate, and reference pitch come from Settings. One point per target is awarded for its exact MIDI pitch (including octave), calculated from tuning + fret. This differs from octave-independent Note Practice. Wrong notes can be corrected before the beat deadline. Pre-target frames, stale frames, count-in input, and results arriving after their beat do not score. Adjacent identical targets require a detected release/different pitch within the new beat before matching again. This guards against sustained-note double scoring; it is not a dedicated onset detector.

Green feedback marks a hit; red feedback identifies a missed previous beat. Results show total points, percentage, misses and points by block. Results are session-only; Spider Walk high-score persistence is not implemented. Preview routine keeps the guide/metronome but does not request microphone access or score. Use headphones with audible clicks to reduce microphone pickup. No claim is made that scoring proves a particular finger/string was used, that clicks cannot cause false detections, or that acoustic latency is calibrated.

Valid routines and custom patterns save immediately under guitartrainer.spider.v2 in localStorage. The original v1 setup migrates into one block; the old data is retained. Invalid saved data falls back to defaults. Cancel, hidden tab, navigation, microphone loss or clock interruption stops both capture and clicks without a completed result. Real-guitar and Android scoring validation remain pending.

Verification for scored routines (2026-10-12): 53 tests, type checking, and production build passed. Browser checks verified custom pattern creation, per-string selection and persistence after reload, plus completion of a two-block, three-repetition preview (72 notes, 24 seconds at 180 BPM) with no score. A microphone session connected and entered count-in. These checks do not validate actual guitar accuracy or mobile acoustic timing.

The browser microphone run also completed with 0/72 points and correct block denominators (24 and 48); no guitar was played for this check. Immediate cancellation of a subsequent startup returned to the editor. Positive pitch scoring is covered by automated engine tests, not a physical guitar test.

## Settings backups

Settings → Backup & restore exports a versioned JSON file containing appearance/audio preferences, nickname, cookie high scores, Note Practice timing/tuning/selected notes, Scale Practice setup, and Spider Walk routines/custom patterns. Note and Scale setup now saves immediately when valid; exporting does not require starting practice. Empty note selections remain empty after reopening.

Import selects a local JSON file, validates all known sections and bounds (maximum 256 KB), then displays a replacement review. Applying replaces the saved app data with the backup, stops audio, and reloads. Cancel leaves data unchanged. Unsupported versions, malformed files and invalid sections are rejected before writes. On storage failure the importer attempts to restore the previous values and reports whether rollback succeeded. Unrelated origin storage is untouched. No file is uploaded. Active sessions, invalid unfinished edits, browser microphone permissions and unsaved session results are excluded. Saved microphone identifiers may not work on another device; select an available input in Settings. Cookie records receive a fresh one-year expiry on restore.

Backup verification (2026-10-12): all 57 automated tests, type checking and production build passed. Browser inspection confirmed the Settings controls. Download-event automation stalled; file download, file-picker selection and full browser reload after restore remain unverified end to end.

## Settings layout and navigation labels

The tuning screen is now named Tuning Studio in navigation, breadcrumbs and help. Sidebar sections use distinct icons: microphone for Tuning Studio, musical notes for Note Practice, C-sharp for Scale Practice, and a hand for Spider Walk. Icons are decorative; text labels remain accessible. Settings shows audio and appearance first, then Your profile, followed by Backup & restore. This changes presentation only, with no persistence or audio behavior changes.

## Compact navigation and logo feedback

At widths up to 850 px, the logo and a top-right Menu button replace the always-visible navigation links. The button expands an in-flow list containing all workspace screens and Settings, with an active-screen indicator. Choosing a screen, clicking outside, or pressing Escape closes it; Escape and selection return focus to the toggle. Hidden links are removed from keyboard navigation. Desktop retains its sidebar. The logo responds to pointer hover with a small tilt, scale and accent glow, and keyboard focus gets the glow. Reduced-motion preferences remove movement. Opening the menu alone does not stop practice audio.

Verification: type checking passed; a 390 × 844 browser viewport confirmed collapsed/expanded navigation, Settings selection, and Escape closure with focus on the menu toggle. Physical phone testing remains pending. Profile editing no longer autofocuses; first-launch nickname entry still does.

## Practice navigation, metronome and timing-free modes

The menu and breadcrumb now say Practice (Ćwiczenia in Polish). Settings has a larger icon. A standalone Metronome offers 30–240 BPM, 1–12 beats per bar, accented first beat, visual beat position and explicit start/stop. Stop before changing tempo/meter. It needs no microphone and closes its audio context on navigation, hidden tab or interruption.

Note Practice and Scale Practice now offer Timed practice / Without timing. Existing timed behavior remains available, including the older consecutive-scale elapsed-time result. Without timing shows one target immediately after microphone readiness, waits indefinitely for the correct pitch class, and advances only on fresh matching audio. Wrong notes do not advance; identical adjacent targets require a release/different note. There is no countdown, response deadline, elapsed-time display or high-score write. Completion shows matched-note count. Scale practice offers random or consecutive ascending root-to-root sequences. Untimed setup is saved independently from timed setup, with note/scale fields in one shared configuration. Leaving or hiding the screen stops capture; switching modes cancels the old session.

Spider Walk adds Manual guide · no audio. It presents one four-finger combination at a time with string, frets, block and repetition. Next/Previous moves by combination; Finish completes the guide. It follows the same block, string and return sequence as scored practice. No microphone, metronome, automatic timer or accuracy score is started. Tempo and audible-click controls are hidden for this mode. Switching screens ends the guide; hiding the tab leaves its manual position available.

## English, Polish and Spanish

Form spacing refinement (2026-10-12): practice forms use 24 px between field groups and 10 px between labels and controls, including selects nested inside labels in untimed Note/Scale Practice. This separates Tuning from Notes to practice. Note-selection panels have additional inner spacing; Spider Walk pattern controls, toggle rows and Settings audio controls have wider spacing too. The same spacing applies at compact widths. This is a presentation-only change; input behavior and saved values are unchanged. Production build and TypeScript checking passed; visual validation on a physical phone remains pending.

Polish wording refinement (2026-10-12): musical terminology now uses “tonika”, “częstotliwość wzorcowa”, and “sekwencja palców” consistently. Manual Spider Walk is labelled “We własnym tempie · bez mikrofonu”; timing previews are described as an odliczanie trial. Instructions distinguish muting the strings from disabling audio. Repetition, block and selected-note summaries use complete translated labels rather than joining English-order fragments; this avoids incorrect Polish number agreement. International note spelling remains unchanged. All 63 tests and the production build (including TypeScript checking) passed. Translation tests cover placeholder preservation and count labels at singular, plural and teen values. A new visual review on a phone was not performed for this wording change.

Flag buttons beneath Settings in the navigation menu offer English / Polski / Español, saved locally with English as the default. On compact screens they appear inside the expanded Menu. The same buttons are available during onboarding. Flags are rendered as SVG for consistent Windows display, with no visible heading or language text. Each flag has a 44 × 44 px touch target, a subtle selected outline, keyboard focus, and a native-language accessible name and tooltip. The previous language dropdown is removed. Language changes apply immediately to navigation, controls, help, feedback and accessible labels. The document language attribute follows the selection. Code, documentation, identifiers, note names (international B, not H), profile names and device-provided microphone names are not translated. English strings are the fallback for unexpected external errors. Language and the new practice/metronome options are included in backups, as is untimed setup. Older backup files lacking these optional sections remain accepted and restore defaults for them.

Verification (2026-10-12): all 61 automated tests, TypeScript checking and the production build passed. Automated checks cover untimed matching, translations and older-backup compatibility. Desktop browser checks confirmed Polish survives reload, metronome start/stop controls work, untimed note practice starts directly on a target, untimed scales expose random/consecutive selection, and manual Spider Walk advances by combination. No physical guitar accuracy or Android metronome latency is inferred from these checks. Language is also available during first-launch onboarding.

Flag-switcher verification (2026-10-12): production build and TypeScript checking passed. Physical phone visual verification remains pending.

Spanish (2026-10-12): a third flag button selects Español in the menu and onboarding. Spanish covers all existing translation-catalog entries, including guides and error messages. Selection persists through the existing options store and backup format; older English/Polish backups remain valid. Note names retain international C–B spelling and sharps. All 65 tests and the production build (including TypeScript checking) passed. Tests verify catalog parity, placeholder preservation, error fallback and Spanish backup export/parse/restore. Browser inspection confirmed the selected Spanish flag and translated navigation/tuning screen. Physical phone layout and independent native-speaker review remain pending.

Practice mode selector (2026-10-12): Note Practice, Scale Practice and Spider Walk use one two-segment control labelled Timed mode / Free mode, translated into Polish and Spanish. Native grouped radio inputs provide keyboard arrow navigation and an exposed checked state; each segment has a 44 px minimum height. Existing saved modes are retained. Free mode waits for pitch in Note/Scale Practice and selects manual guidance without audio in Spider Walk. All 65 tests and the production build (including TypeScript checking) passed; physical phone visual review remains pending.

Stable practice headers (2026-10-12): Note and Scale Practice share a persistent header across Timed/Free mode, preserving the slogan, title, description and Quick guide button. The mode switch sits below the header and has no visible Practice mode caption (its accessible group name remains). Opening a guide preserves its open state across mode changes and displays instructions for the selected mode, including Free mode in English, Polish and Spanish. Practice headers use 16 px bottom padding with no extra top margin on the switch, reducing the gap in Spider Walk as well. All 65 tests and the production build/TypeScript check passed; interactive layout and phone verification remain pending.

Scale mode duplication fix (2026-10-12): the persistent header now has a distinct React key from the free-scale exercise body. Their previous shared key could leave duplicate headers and switches behind after mode changes. TypeScript checking passed. Browser verification after reload switched Free/Timed four times and confirmed exactly one Scale Practice heading after every switch.

Mode padding consistency (2026-10-12): Free mode now uses the same 22 px compact-screen panel padding as Timed mode (30 px on desktop). Practice panel headings have explicit shared margins, and label/select font sizes are consistent regardless of whether the panel is inside a settings grid. This removes the padding and heading-offset difference on mode changes. TypeScript checking passed; no exercise behavior changed.

Practice control dimensions (2026-10-12): Timed and Free setup panels now share the same responsive settings grid, so Free controls no longer span the entire desktop content area. Selects and numeric inputs use a shared 44 px height, 13 px text, 10 × 12 px padding and 6 px corner radius. Compact layouts retain the same grid breakpoints. Production build and TypeScript checking passed; visual measurement remains pending.

Free mode width adjustment (2026-10-12): the Free setup panel spans the available settings area (up to the existing 1100 px content limit), rather than reserving an empty second column. Shared input heights, padding and responsive panel spacing are retained. This supersedes the previous equal-column-width choice for Free mode. TypeScript checking passed.

## Guided microphone setup check
Settings includes a local, two-stage microphone check using the selected input and existing detector. After permission/readiness, three seconds of quiet samples estimate the median room level. The user explicitly starts a six-second single-string check. Results report median room noise, strongest sampled RMS level and consistent pitch detection. Proposed heuristic thresholds: at least ten samples per stage, five consecutive identical detected MIDI notes, signal at least 6 dB above the configured gate, noise below the gate, and signal/noise contrast of at least 10 dB. These are setup hints, not validated accuracy or latency guarantees; they do not measure clipping. Results are session-only, not exported or saved. No automatic preference changes occur. Cancel, leaving Settings, hidden tabs, denied permissions and capture interruptions stop the owned session. The existing input meter remains visible. English, Polish and Spanish are supported. Verification: all 67 tests and production build/TypeScript passed; tests cover silence, noisy input, stable/inconsistent notes and insufficient samples. Real guitar and physical phone validation remain pending.

## Saved metronome tempos
Four slots default to 60/80/100/120 BPM. Recall a slot with a short press; hold for 700 ms to save the current BPM. Space/Enter supports the same gesture. Saving announces the slot and tempo and suppresses recall on release. Moving more than 10 px, leaving the button, cancellation or blur cancels a pending hold. Save current buttons are removed. Reset beside Start/Stop restores only the four default slot values, leaving current BPM, meter and playback unchanged. Quick guide explains the gestures in all three languages. Recalling during playback restarts the metronome at beat one with the selected BPM; beats per bar stays unchanged. Slots persist in local options and settings backups. Older settings without slots use the defaults. Labels are translated into English, Polish and Spanish. Production build and existing tests passed; hardware timing validation remains pending.

## Session feedback and Spider Walk progression
Completed scored Note Practice and random Scale Practice show per-pitch-class hits/targets and accuracy, longest correct streak, missed-note priorities and average accepted response time (correct targets only, measured from target display to detection processing; includes capture/processing delay). Spider Walk adds exact-pitch feedback and streaks alongside existing per-block scores. Free Note/Scale and ordered Scale sessions show completed-note counts without assigning accuracy or speed ratings. Preview runs do not generate performance feedback; abandoned sessions have no completed summary. Feedback is session-only, not a history or exported result, and does not change high-score keys.
Spider Walk timed mode offers an optional tempo ladder, off for older settings. Configure a 1–20 BPM increment and maximum between starting BPM and 180. A full repetition includes the return journey when enabled. Tempo increases at repetition boundaries, continues across blocks and caps at the maximum. Count-in remains four beats at the starting tempo. Clicks, target position and scoring use the same precomputed schedule. Preview supports the ladder; manual guidance ignores it. Setup persists with routines and backups. Start/end tempo and adjusted routine duration appear in results. No automatic speed increase is tied to accuracy.
Automated checks cover feedback grouping, streaks, duplicate hits, response timing, progression boundaries, caps, returns and fresh scoring frames. Physical guitar and audible metronome timing validation remain pending.

Verification (2026-10-13): all 73 tests, TypeScript checking and production build passed. A silent browser preview completed a two-repetition 150 → 170 BPM progression and reported 18.1 seconds excluding count-in. Manual completion reports combinations reviewed without claiming verified playing. Browser test setup was restored afterward.

Presentation fix (2026-10-13): removed a literal escaped newline rendered between Spider Walk result sections. No exercise behavior changed.

Tuning Studio demo removal (2026-10-15): removed the Try demo/End demo entry control and updated the quick guide in all three languages. Tuning Studio now starts microphone listening only. Earlier demo verification above is historical; synthetic DSP tests and the internal audio utility remain available to development. TypeScript checking passed.

Tuning Studio listening glow (2026-10-15): the detector card uses its accent glow only during active microphone capture. Idle, connecting, stopped and failed sessions show the plain panel background. The existing Listening status text remains available. TypeScript checking passed.

Metronome volume (2026-10-19): a shared 0–100% slider in Settings and Metronome controls standalone clicks and Spider Walk clicks. Zero mutes the output without stopping timing; 100% preserves the previous click level. Standalone changes apply during playback. Spider Walk reads the saved level when starting and still respects its audible-click toggle. The optional setting persists in options and backups; older data defaults to 100%. English, Polish and Spanish labels are provided. All 74 tests passed; physical listening verification remains pending.

Note selection (2026-10-27): Note Practice no longer uses a tuning in either mode. New setups offer C D E F G A B, with optional sharps for all twelve pitch classes. Select all and Deselect all affect the visible pool. Disabling sharps removes them from selection. Empty selections disable start/preview. Legacy tuning selections migrate to equivalent note letters; setups and backups preserve choices. Timed high scores use a new tuning-independent key; historical scores remain stored.
Verification: all 76 automated tests, TypeScript checking and production build passed. Browser visual review and real-guitar checks for the expanded note pool remain pending.

Accidental options (2026-10-27): both Note Practice modes now offer independent Include sharps and Include flats toggles. Flats-only shows D♭ E♭ G♭ A♭ B♭ in selections, targets and feedback. Both options show equivalent names together (C♯ / D♭) on one selectable pitch, avoiding duplicate target weighting. Turning both off removes accidentals. Options persist and export; older setups default flats off. Pitch matching remains octave-independent.
Verification: all 77 tests, typechecking and production build passed. Visual and real-guitar checks remain pending.

Scale return journey (2026-10-27): Consecutive full-scale repetitions in both modes offer Up and back. Each repetition plays the ascending scale, the upper root once, then descends to the starting root (15 targets for a seven-note scale, 11 for pentatonic). Repetition boundaries retain the existing release requirement between repeated roots. Timing/result rules are unchanged; any octave still counts, so physical ascending pitch is not enforced. The optional boolean persists and is included in backups; absent legacy values mean ascending only. Random-note sessions ignore it.
Verification: all 78 tests and the production build (including typechecking) passed. Physical guitar and browser visual checks remain pending.

## Spider Walk creator rework (2026-10-27)
The user confirmed microphone advancement and clicked order. Spider Walk now has one completion-time flow, replacing Timed/Free modes, beat scores, starting-fret controls and tempo progression. Tuning remains; Selected Pattern chooses a saved walk. The clock starts when audio is ready and targets are displayed, and ends on the final correct exact pitch. Wrong pitches wait indefinitely. Identical adjacent pitches require a non-target/silent frame before a fresh match; stale frames cannot advance. Optional background metronome follows configured BPM and saved volume independently of progress. Results are session-only, not persistent personal bests. Cancel, tab hiding, navigation and audio interruption stop the session without a result.
Creator: 1–24 frets plus open strings, 1–64 ordered positions per record, 1–100 repetitions, up to 32 records and 10,000 expanded targets per walk. Each record completes its repetitions before the next. Click order is preserved, including repeats and cross-string positions. Saved library holds up to 24 walks; records and saved walks can be edited or removed. Selected walks export as a versioned local JSON file; validated imports are reviewed and added under fresh IDs without replacing existing walks. Files are limited to 256 KB. Whole-app backups include the library and accept older files without it.
Legacy routines migrate by preserving string/fret positions, blocks and repetitions. Original legacy storage remains available; old beat scores and mode flags do not control the new screen. Notes identify exact pitches but cannot prove physical string or finger choice. Real-guitar and audible metronome validation remain pending.
Verification (2026-10-27): all 83 tests and the production build passed. Browser inspection confirmed the new setup without a mode switch and creation of the ordered S6:5 → S6:6 → S6:8 → S6:7 record with two repetitions. The test draft was cancelled without saving. Microphone completion, audible clicks and file-picker interaction still require manual validation.

Spider Walk library controls (2026-10-27): New, Edit and Remove share one equal-width row. Remove all walks clears the library; Undo removal restores the previous library during the current screen visit. Empty libraries persist through reload and backups, disable practice/edit/remove, and allow creation/import. New installations no longer automatically create an imported legacy walk; existing saved walks remain removable, including the last one. Legacy storage remains untouched.
Browser verification: removed the unwanted Imported legacy walk with Remove all walks; the empty state, disabled practice/edit/remove buttons, and Undo removal appeared correctly.

Creator refinement (2026-10-27): removed Remove all walks and Undo removal. Individual Remove still permits deleting the last walk. When composing a record, the first selected note locks further clicks to that string; other strings are dimmed and disabled. Undoing every note unlocks string choice. Existing imported multi-string records remain compatible. The fretboard shows five fret positions at a time with labelled previous/next arrows, overlapping pages and disabled boundary controls, without a horizontal scrollbar. During practice the view follows each target fret automatically.

Creator presentation (2026-10-27): removed visible String 1–6 row labels and their reserved column in Spider Walk Creator. Fret buttons retain accessible string/fret names. The active practice board retains its string labels.

Spider Walk setup (2026-10-28): the routine summary matches the settings panel height on desktop and scrolls its record list; stacked layouts cap the summary height. The native file input remains hidden and Import opens the file picker. Pattern repetitions (1–100, default 1 for old settings) repeats the entire ordered walk after all record repetitions. Progress shows the current pattern repetition and total target count includes all repeats. Completion time spans the full session. This session setting persists in whole-app backups; individual walk exports keep their reusable record definitions.

Spider Walk export and tempo progression (2026-10-28): import/export has 24 px separation from setup. Export walks opens a modal selection dialog with Cancel/Escape support; no permanent selection checkboxes appear on the page. Optional metronome progression increases tempo by 1–30 BPM after each complete pattern repetition, capped at 240 BPM, independent of record repetitions. Disabled/missing progression means no increase. The setting persists with session settings and whole-app backups. The scheduler retains its audio context and applies new spacing to upcoming beats; already scheduled clicks may retain their old spacing briefly.
Verification: all 86 automated tests, TypeScript checking and production build passed on 2026-10-28. Real-guitar/audio progression and the export dialog visual check remain pending.

Creator layout (2026-10-28): added 24 px spacing below New/Edit/Remove. Save Spider Walk and Cancel now sit above the fretboard. Creator frets use a continuous horizontal viewport supporting touch/trackpad scrolling and arrow buttons, with the scrollbar hidden. The viewport is keyboard focusable. Active practice retains its target-following paged board.

Swipe correction (2026-10-28): supersedes continuous creator scrolling. A horizontal swipe or mouse drag of at least 40 px moves one fixed fret page; vertical movement remains available for page scrolling. Swiping suppresses note selection. Arrows and keyboard Left/Right also navigate; taps still select notes. No freely scrollable fret viewport or scrollbar remains.

Practice presentation (2026-10-28): all Quick guide buttons share the Tuning Studio book icon. Note selection uses an unwrapped horizontal flex row for Select all/Deselect all. Spider Walk Creator replaces the top fret-navigation row and range text with full-height left/right chevron buttons beside the board; fret rows are slimmer (36 px minimum). Swipe and keyboard navigation remain available.

Accidental selector layout (2026-10-28): Include sharps and Include flats share an equal-width horizontal flex row in both Note Practice modes, with labels wrapping within their controls. Polish uses krzyżyki/bemole, Spanish sostenidos/bemoles; Polish select/deselect labels now consistently use zaznacz/odznacz wszystkie dźwięki. International note spellings remain unchanged.

Active Spider Walk board (2026-10-28): removed visible string row labels and manual fret-navigation controls during exercise. The board follows the current target automatically; creator navigation is unchanged. Accessible string/fret descriptions and the current-target heading remain.

Active Spider Walk presentation (2026-10-28): removed the horizontal routine progress bar beneath the fretboard. The completed-note count remains visible above it; automatic target tracking is unchanged.

Metronome-led Spider Walk (2026-10-28): optional Follow metronome bypasses microphone capture and advances one target per beat. Each target including the final one receives a full beat. One shared precomputed schedule controls clicks and highlighting, including BPM increases at full-pattern boundaries. Metronome is enabled in this mode and respects saved volume (0% remains muted). Results report routine duration and explicitly mark playing unverified. Stop, hiding the tab, navigation and audio interruption cancel the run. Missing advanceBy defaults to pitch detection; the choice persists in whole-app backups.

Spider Walk fast detection (2026-10-28): Spider Walk opts into an approximately 43–46 ms frame at 44.1/48 kHz (2048 samples), scaled to a power-of-two frame for higher sample rates to preserve low-note periods. Analysis submissions are eligible every 16 ms rather than 65 ms, still limited by animation frames and one outstanding worker job. Every worker result is delivered directly to the Spider Walk reducer rather than waiting for a React pitch effect. Waveform updates are omitted and level updates limited to 10 Hz in this mode. Other practice capture windows/cadence are unchanged. Exact-pitch, stale-frame and repeated-note release rules remain intact.
Synthetic coverage includes harmonic-rich notes at 44.1/48/96 kHz, silence, and sequential 100/125 ms notes at 48 kHz. These tests are not hardware latency measurements; real guitar transient noise, room acoustics and browser load can still cause misses. Repeat the same fast routine with the same microphone and clean amp settings to compare behavior.

Android early alpha distribution (2026-10-29): the user requested a downloadable APK in GitHub Releases. Version 0.1.0-alpha.1 is prepared as an explicitly labeled prerelease using debug signing, with source tagged on a dedicated release branch. Existing functionality is unchanged. Physical device/audio validation and production signing remain pending; see docs/releases/v0.1.0-alpha.1.md.

## Chord Practice — experimental (2026-10-30)
User requirements: random chord practice similar to Note Practice, user-created chord sets, and microphone recognition (explicitly selected over visual-only progression). Implemented shared screen: Timed/Free modes, 1–100 targets, timed response 1–30 seconds and break 0.1–10 seconds. Create/edit/remove named sets (up to 24, retain at least one); select from 16 catalog chords: C D E G A F Am Dm Em Bm A7 B7 C7 D7 E7 G7. Random selection never repeats adjacent chords when multiple choices exist. Standard-tuning diagrams show open/muted strings; C7 uses a complete voicing including its fifth. New chord types/custom voicings are not editable in this version.
Microphone input, gate and A4 reference come from Settings. Recognition runs locally in a dedicated worker, using harmonic spectral decomposition and chroma templates for all 36 major/minor/dominant-seventh classes, then rejecting unsupported classes. User-selected sets never narrow the recognizer. Ambiguous, incomplete and below-gate frames return no chord. Two consecutive matching fresh frames are required, with a maximum 250 ms gap. Timed sessions award one point per recognized target, retain a cookie personal best keyed by chord membership/timing/reference, and run the full response window. Free sessions wait indefinitely; adjacent identical targets require an unrecognized/silent frame before playing again. Results reflect experimental recognition, not finger placement verification.
Sets and setup persist locally and are included in whole-app backups; older backups may omit the chord section. Backgrounding, navigation, cancellation and microphone interruption stop practice. No audio is recorded or uploaded.
Limitations: clean, sustained, complete chords in standard tuning are recommended. Chord transitions, arpeggios, distortion, missing tones and room noise may cause rejection or false matches. Frame size is approximately 170–186 ms at common sample rates before stability checks; this is not measured end-to-end latency. Real-guitar, Android device and iOS validation are not established.

## Appearance brightness (2026-10-30)

Settings → Appearance includes a 0–100% Brightness slider with an immediate preview. Zero preserves the original dark appearance; higher values lighten the shared background, panels, borders and muted text while preserving the chosen accent color. This controls the app theme, not device screen brightness. The value is saved in local preferences and included in settings backups. Older preferences/backups without brightness default to zero; imports reject values outside the integer range.
