# ADR-0014: shared React application with Capacitor Android

Date: 2026-10-28. Status: accepted. Supersedes ADR-0002's Android deferral only; desktop browser delivery continues.

## Context

The user approved the Capacitor plan and intends to publish on Google Play eventually. The repository already contains a React browser application with independent DSP and exercise logic. An ignored Android directory from the historical Expo prototype remains locally.

## Alternatives

- Native Kotlin or React Native: requires replacing the current DOM UI and validating a different audio integration.
- PWA: useful browser delivery, but does not by itself produce the intended Android package.
- Capacitor: bundles the existing UI and allows native adapters if measured WebView audio performance requires them.

## Decision and rationale

Use Capacitor 8 and one repository. Keep shared code in src/, the active native project in native/android/, and package configuration at the root. Leave the old ignored /android/ prototype inactive. Build native web assets into ignored dist-android/ with the root asset base, separately from GitHub Pages builds. Commit the Gradle wrapper, manifests, resources and build configuration, including the sync-generated Gradle project references needed to review native dependencies.

Start with Web Audio capture and worker DSP. Add RECORD_AUDIO and MODIFY_AUDIO_SETTINGS for Capacitor's WebView permission flow. Use the App lifecycle plugin to cancel sessions on background, retaining browser visibility cleanup and explicit restart. Disable Android automatic app-data backup; portable backup remains an explicit user action.

The provisional application ID is io.github.lankow.guitartrainer. Confirm it before the first Play release; changing it later creates a different Android application. Compile/target SDK is 36; minimum SDK 24 is a framework setting, not evidence of tested device coverage.

## Consequences

Browser and Android share functionality and tests. Native changes live in the same PR as relevant documentation. Generated assets, local SDK paths, Gradle caches, APK/AAB files and signing credentials stay out of Git. Use CI artifacts or GitHub Releases for distributable builds later. No release signing or store submission is configured in this prototype. Capacitor template branding remains provisional. Native storage is separate from Chrome; use explicit export/import to transfer preferences once its device behavior is validated.

## Verification

Run npm test, npm run typecheck, npm run build, npm run android:sync, and Gradle assembleDebug. Record actual results in docs/android.md. Lifecycle tests cover browser/native cancellation and asynchronous listener cleanup. Real microphone permissions, lifecycle timing, audio accuracy and metronome latency require physical testing; synthetic results do not establish Android performance.

References: [Capacitor Android](https://capacitorjs.com/docs/android), [configuration](https://capacitorjs.com/docs/config), [Google Play target SDK](https://developer.android.com/google/play/requirements/target-sdk).
