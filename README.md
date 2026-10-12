# GuitarTrainer — desktop preview

A React + TypeScript application for detecting individual guitar notes in a desktop browser. Mobile development is paused. The previous Expo entry points and dependencies have been replaced; this is a browser app, not a Windows installer.

## Run locally

Requires Node.js 24 and npm. From this project folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173 in Chrome or Edge. On first launch, enter a nickname; rename it later in Settings. Click **Start listening**, allow microphone access, and pluck one string. Use **Try demo** to exercise the actual detector with an internal synthetic signal, without microphone access or audible playback.

Microphone capture requires localhost or HTTPS. Input device names may appear only after permission is granted. Open **Settings** to configure or test your microphone. Stop the session before changing input. Settings and Note studio share the same audio session. Sessions stop when the tab becomes hidden. No audio recordings are saved or uploaded.

## Initial features

- Note name, octave, frequency, and signed tuning deviation in cents.
- Tuning meter (within ±5 cents is shown as in tune).
- Settings screen with microphone selection, input testing, noise gate, and reference pitch.
- Color wheel, six color presets, custom color picker, and restore-default-orange action.
- Preferences saved locally in this browser; waveform remains in Note studio.
- A4 reference options: 432, 440, and 442 Hz.
- Six tuning presets in Note Studio, matching string highlights, and synthetic demo notes.
- Orange default theme and a local nickname profile stored in a one-year cookie.
- Note Practice: configure note count, response time, and break countdown; match displayed notes and retain your high score in a cookie.
- Permission/error handling and explicit start/stop.

Single notes only. Chords and finger placement are not recognized. Real-guitar accuracy and end-to-end latency still require physical testing.

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

Generated Android/Expo folders left over from the earlier prototype are ignored and are not used by this application. No global Android tools or phone installations were removed.

## Practice a session

Choose your microphone in Settings. In Note Practice, choose a tuning and check the note names you want to practice. Open **Note practice**, set the number of notes and timing, then click **Start practice**. For example, 10 notes / 2000 ms / 1000 ms gives a one-second countdown before each two-second response window. Play the displayed note in any detectable octave. **Preview timing** walks through the sequence without a microphone or saved score. Completed microphone sessions retain the best score for that exact configuration in a one-year cookie. Leaving practice or hiding the tab cancels the session.

## Scale Practice

Choose a root, scale, and mode. Random notes uses timed targets and a cookie-backed high score. Consecutive notes follows the ascending scale through the closing root for 1–100 repetitions; its result is total elapsed seconds, with no note deadlines or inter-note breaks. Mute briefly between repetitions. Matching is octave-independent; real-guitar end-to-end validation remains pending.

## GitHub Pages deployment

The Deploy GitHub Pages workflow tests and builds main with the /GuitarTrainer/ asset base, then publishes dist using GitHub Actions. Repository Settings → Pages uses GitHub Actions as the publishing source. The app is live at [GuitarTrainer](https://lankow.github.io/GuitarTrainer/), verified on 2026-10-12. Pushes to main automatically deploy after the workflow passes.

The repository was made public with owner approval to enable GitHub Pages. The initial deployment failed because Pages was disabled; enabling the Actions source and retrying deployment succeeded.

Open the HTTPS address in Chrome on Android and allow microphone access. Browser preferences/profile cookies are local to that phone and do not transfer from the PC. This is a browser app, not an Android package; real Motorola G34 / Android 15 testing is still required. Keep the app visible while practicing, since hiding it stops audio.

## Spider Walk

Open Spider Walk and build ordered pattern blocks with repetition counts. Use presets or the finger-pattern creator; enable Mix patterns by string for independent patterns on all six strings. Choose tuning, starting fret, BPM, optional return and audible metronome. Start scored walk uses the microphone and awards one point for each exact pitch played within its beat; Preview routine needs no microphone and awards no score. A four-beat count-in precedes the exercise. Results show total and per-block scores for the current session only. Routines and custom patterns save locally; use headphones with audible clicks. Pitch cannot verify finger or string choice. Stop or leave the screen to end the routine.
