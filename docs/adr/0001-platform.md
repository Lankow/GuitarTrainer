# ADR-0001: platform and audio pipeline selection

Date: 2026-09-21. Status: historical proposal, superseded for current scope by [ADR-0002](0002-desktop.md). The earlier mobile proposal is retained below as decision history.

## Context

Android and iOS are required; web is optional. The main risks are access to live microphone samples, detection stability, and latency on real devices.

Available development hardware is a Windows PC and an Android phone. There is no local Mac, and iOS testing/debugging is currently difficult. Recommend an Android-first validation sequence while keeping this platform decision provisional for iOS.

## Options

| Option | Benefit | Risk / cost |
| --- | --- | --- |
| React + TypeScript + Web Audio, followed by Capacitor | Shared web/mobile UI, quick experiment | Audio behavior in WebView requires validation; a native plugin may be needed |
| React Native + Expo, separate web adapter | An option for a primarily mobile product | Do not assume recording APIs provide the PCM stream required by the detector; verify the module and build |
| Flutter with audio adapters | An alternative for a team that prefers Dart | Separate validation of plugins, web support, and DSP integration cost |

## Proposal

Start with a small TypeScript web experiment without committing to a UI framework. If the audio pipeline meets criteria in browsers and subsequently in the mobile wrapper, choose React + Capacitor. Otherwise, investigate a native adapter and the React Native option before expanding the UI.

A PWA and an application distributed through app stores are different delivery paths. PWA installation does not automatically satisfy an app-store distribution requirement.

## Consequences and verification

Parts of the prototype may be replaced. Music logic, test data, and contracts should remain portable. No backend at this stage. Accepting the decision requires results from docs/audio-spike.md and agreement on the target installation method.

Local native iOS builds with Capacitor require macOS and Xcode. Cloud builds can provide build infrastructure but do not replace real-device audio measurements. Delay iOS-specific infrastructure until the Android audio experiment is useful and a physical iPhone testing route is available. See [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup).

Sources checked on 2026-09-21: [Capacitor](https://capacitorjs.com/docs), [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/), [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet). The comparison is a design recommendation, not a performance guarantee for these tools.
