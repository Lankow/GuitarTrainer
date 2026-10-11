# GuitarTrainer — desktop preview

A React + TypeScript application for detecting individual guitar notes in a desktop browser. Mobile development is paused. The previous Expo entry points and dependencies have been replaced; this is a browser app, not a Windows installer.

## Run locally

Requires Node.js 24 and npm. From this project folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173 in Chrome or Edge. Click **Start listening**, allow microphone access, and pluck one string. Use **Try demo** to exercise the actual detector with an internal synthetic signal, without microphone access or audible playback.

Microphone capture requires localhost or HTTPS. Input device names may appear only after permission is granted. Stop the session before changing input. Sessions stop when the tab becomes hidden. No audio recordings are saved or uploaded.

## Initial features

- Note name, octave, frequency, and signed tuning deviation in cents.
- Tuning meter (within ±5 cents is shown as in tune).
- Input selection, signal level, waveform, and adjustable noise gate.
- A4 reference options: 432, 440, and 442 Hz.
- Six-string standard tuning reference and synthetic demo notes.
- Permission/error handling and explicit start/stop.

Single notes only. Chords and finger placement are not recognized. Real-guitar accuracy and end-to-end latency still require physical testing.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Build output is in dist. Tests cover DSP and note calculations. GitHub Actions runs the tests and production build; it has not been run remotely for this change.

## Documentation

- [Product scope](docs/product.md)
- [Architecture](docs/architecture.md)
- [Audio validation](docs/audio-spike.md)
- [Desktop decision](docs/adr/0002-desktop.md)
- [Earlier platform proposal](docs/adr/0001-platform.md) — historical
- [Workflow](docs/workflow.md)
- [ADR template](docs/adr/template.md)
- [Agent instructions](AGENTS.md)

Repository: [Lankow/GuitarTrainer](https://github.com/Lankow/GuitarTrainer), private, main branch.

Generated Android/Expo folders left over from the earlier prototype are ignored and are not used by this application. No global Android tools or phone installations were removed.
