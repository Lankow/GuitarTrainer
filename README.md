# GuitarTrainer — browser app and Android prototype

A React + TypeScript application for detecting individual guitar notes in a desktop browser, with a Capacitor Android prototype sharing the same code. iOS remains deferred. This is not a Windows installer. Android packaging does not establish real-device audio performance.

## Android and repository layout

Future iOS delivery will reuse the same application, with its native project at `native/ios/`. That path is reserved in Capacitor configuration; no iOS project or build exists yet. See the [shared platform structure](docs/platforms.md) for boundaries and future build requirements.

Keep browser and Android development in this repository: shared application code in `src/`, tests in `tests/`, the active Android project in `native/android/`, and documentation in `docs/`. Commit native source, resources, the Gradle wrapper, Capacitor configuration and npm lockfile. Generated web/native builds, APK/AAB files, SDK paths and signing credentials are ignored. Downloadable builds belong in CI artifacts or GitHub Releases when distribution is introduced.

Use Node.js 24, JDK 21, Android Studio and Android SDK 36. After `npm ci`, run `npm run android:sync`, then `npm run android:open`. In PowerShell, build a debug APK with `.\native\android\gradlew.bat -p native/android assembleDebug`. Sync again after shared code changes. See [Android setup, storage policy and device checklist](docs/android.md) and [ADR-0014](docs/adr/0014-android-capacitor.md). Release signing and Google Play publication are not configured yet. The [Android branding guide](docs/android.md#launcher-branding-2026-10-30) explains regenerating launcher resources from the shared logo geometry.

## Android early alpha

The first early alpha is version `0.1.0-alpha.1`, distributed as a debug-signed APK through [GitHub prereleases](https://github.com/Lankow/GuitarTrainer/releases). Read the [installation instructions and limitations](docs/releases/v0.1.0-alpha.1.md). Physical Android/guitar testing is pending; this is not a Google Play release.

## Run locally

Requires Node.js 24 and npm. From this project folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173 in Chrome or Edge. On first launch, enter a nickname; rename it later in Settings. Click **Start listening**, allow microphone access, and pluck one string.

Microphone capture requires localhost or HTTPS. Input device names may appear only after permission is granted. Open **Settings** to configure or test your microphone. Stop the session before changing input. Settings and Tuning Studio share the same audio session. Sessions stop when the tab becomes hidden. No audio recordings are saved or uploaded.

## Initial features

- Note name, octave, frequency, and signed tuning deviation in cents.
- Tuning meter (within ±5 cents is shown as in tune).
- Settings screen with microphone selection, input testing, noise gate, and reference pitch.
- Color wheel, six color presets, custom color picker, and restore-default-orange action.
- Preferences saved locally in this browser; waveform remains in Tuning Studio.
- A4 reference options: 432, 440, and 442 Hz.
- Six tuning presets in Tuning Studio, matching string highlights.
- Orange default theme and a local nickname profile stored in a one-year cookie.
- Note Practice: configure note count, response time, and break countdown; match displayed notes and retain your high score in a cookie.
- Permission/error handling and explicit start/stop.

Tuning/Note/Scale/Spider detection remains single-note. Chord Practice separately offers experimental recognition of 16 supported chords; finger placement is not verified. Real-guitar accuracy and end-to-end latency still require physical testing.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Build output is in dist. Tests cover DSP and note calculations. GitHub Actions runs the tests and production build. Desktop checks and the Pages deployment for d9511f0 passed remotely; the published app loaded successfully on 2026-10-12.

## Documentation

- [Product scope](docs/product.md)
- [Architecture](docs/architecture.md)
- [Audio validation](docs/audio-spike.md)
- [Desktop decision](docs/adr/0002-desktop.md)
- [Earlier platform proposal](docs/adr/0001-platform.md) — historical
- [Workflow](docs/workflow.md)
- [ADR template](docs/adr/template.md)
- [Agent instructions](AGENTS.md)

Repository: [Lankow/GuitarTrainer](https://github.com/Lankow/GuitarTrainer), public, main branch.

The root `android/` directory and Expo folders left over from the earlier prototype are ignored and inactive. The new Capacitor Android project is `native/android/`. No global Android tools or phone installations were removed.

## Practice a session

Choose your microphone in Settings. In Note Practice, select natural notes and optionally enable sharps; tuning is not required. Open **Note practice**, set the number of notes and timing, then click **Start practice**. For example, 10 notes / 2000 ms / 1000 ms gives a one-second countdown before each two-second response window. Play the displayed note in any detectable octave. **Preview timing** walks through the sequence without a microphone or saved score. Completed microphone sessions retain the best score for that exact configuration in a one-year cookie. Leaving practice or hiding the tab cancels the session.

## Scale Practice

Choose a root, scale, and mode. Random notes uses timed targets and a cookie-backed high score. Consecutive notes follows the ascending scale through the closing root for 1–100 repetitions; its result is total elapsed seconds, with no note deadlines or inter-note breaks. Mute briefly between repetitions. Matching is octave-independent; real-guitar end-to-end validation remains pending.

## GitHub Pages deployment

The Deploy GitHub Pages workflow tests and builds main with the /GuitarTrainer/ asset base, then publishes dist using GitHub Actions. Repository Settings → Pages uses GitHub Actions as the publishing source. The app is live at [GuitarTrainer](https://lankow.github.io/GuitarTrainer/), verified on 2026-10-12. Pushes to main automatically deploy after the workflow passes.

The repository was made public with owner approval to enable GitHub Pages. The initial deployment failed because Pages was disabled; enabling the Actions source and retrying deployment succeeded.

Open the HTTPS address in Chrome on Android and allow microphone access. Browser preferences/profile cookies are local to that phone and do not transfer from the PC. The website is separate from the new Capacitor Android package and its local data. Real Motorola G34 / Android 15 testing is still required. Keep the app visible while practicing, since backgrounding it stops audio.

## Spider Walk

Open Spider Walk and select a saved pattern or create one in Spider Walk Creator. Choose 1–24 frets, click string/fret positions in playing order, and add records with note counts and repetitions. Each record completes its repetitions before the next begins. Save the walk, choose tuning, and start. The microphone advances only on the correct pitch including octave; the score is total completion time from microphone readiness to the final match. Mute briefly between identical consecutive notes. An optional background metronome follows the saved volume but does not control advancement. Selected walks can be exported or imported as JSON copies. Leaving the screen, hiding the tab or stopping cancels the session. Pitch cannot verify finger or string choice; real-guitar validation remains pending.

## Export and import

In Settings → Backup & restore, select Export settings to download a JSON backup of preferences, profile, high scores, practice setups and custom Spider Walk patterns. To restore, select Import settings, choose the file, review replacement details, then Replace settings & reload. Export the existing setup first if you want to keep it. Files stay local; microphone permissions and active sessions are not transferred. On another device, check the selected microphone after importing.

## Practice modes and language

The Practice menu includes a standalone Metronome with BPM and beats-per-bar controls. Note Practice and Scale Practice offer Without timing: the app waits for each matching note without a timer. Scale targets can be random or consecutive. Spider Walk has one microphone-driven completion-time mode. Flag buttons beneath Settings in the navigation menu switch between English, Polski and Español and save the selection. On phones, open Menu to find them. These settings are included in exported backups.

## Microphone setup check
In Settings → Audio & tuning, stop any existing session and select Start microphone check. Keep the strings muted for the three-second noise measurement. Then select Check my guitar and pluck one open string a few times during the six-second detection check. Review the feedback and repeat after adjusting the microphone or noise gate. No settings change automatically and no recordings are saved.

Metronome offers four saved BPM slots. Tap a tempo to recall it; hold for 0.7 seconds to save the current BPM (or hold Space/Enter with keyboard focus). Reset restores the four default slots without changing current tempo or playback. Quick guide explains these gestures. Recalling while playing restarts the beat. Slots are included in settings backups.

Completed sessions include note-by-note feedback; timed notes also show streaks and average response time on correct targets. Spider Walk uses saved explicit position sequences and an optional fixed-tempo background metronome. Earlier beat-scoring, manual mode and tempo ladder controls are superseded.

Adjust Metronome volume in Settings or the Metronome screen. The saved level also applies to Spider Walk clicks; 0% mutes clicks while timing continues.

## Chord Practice (experimental)
Open Chord Practice, create a named set using chord tiles, choose Timed or Free mode, and start with your microphone. Strum the displayed standard-tuning shape with a clean sound and let all tones ring. Timed sessions use response/break durations and a recognition high score; Free waits for a match. Mute between repeated chords. Settings/backups retain sets and setup. Real-guitar accuracy and Android device behavior remain unvalidated; unsupported chord types and custom voicings are not offered.
