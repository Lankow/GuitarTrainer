# Shared browser, Android and future iOS structure

Updated: 2026-10-28. User requirement: account for an eventual iOS version while developing Android. Android is a prototype; iOS implementation and device validation remain deferred. Decision: [ADR-0015](adr/0015-future-ios-structure.md).

## Repository contract

One repository and one shared React application serve all delivery targets. Use short-lived feature branches; platform-specific permanent branches and copies of the application are not part of this structure.

| Location | Responsibility | Current state |
| --- | --- | --- |
| src/ | Shared UI, translations, settings, exercises and music/DSP logic | Implemented |
| src/platform/ | Browser/Capacitor integrations; future platform adapter contracts | Background lifecycle implemented |
| native/android/ | Android manifest, native entry point, resources and Gradle configuration | Prototype builds locally |
| native/ios/ | Future iOS Xcode project, native configuration and resources | Path reserved in Capacitor configuration; project not generated |
| tests/ | Shared automated tests, including platform adapter behavior | Implemented |
| docs/ | Shared architecture and platform-specific setup/validation | Android guide implemented; iOS setup deferred |

capacitor.config.json reserves native/ios/ alongside native/android/. It does not install the iOS package or create an Xcode project. The historical root /ios/ and /android/ directories remain ignored; native/ios/ source will be versioned when introduced. Generated Xcode build output, archives, signing certificates, provisioning profiles and credentials must be excluded before that project is added.

## Implementation boundaries

- Keep exercise state machines, note matching and DSP independent of React, Capacitor, Android and iOS. Supply detections and timestamps through their existing interfaces.
- Keep UI and translations shared. Express device capabilities and permission states through platform integrations when behavior differs; do not duplicate entire screens for each OS.
- Place shared integration code and TypeScript adapter contracts in src/platform/. Put native Kotlin/Java implementations under native/android/ and future Swift implementations under native/ios/.
- Use Capacitor APIs that support both mobile platforms where suitable. Check platform coverage before introducing a dependency; document any platform-specific fallback and remaining validation.
- If measurements require native capture, add it behind a common capture contract. Preserve the browser implementation and the same exercise inputs. Native capture and that contract are future work, not implemented adapters.
- Keep preferences local to each installed app/browser. Shared code does not imply shared storage or synchronization across devices.

The existing useDesktopAudio name is historical; it currently supplies Web Audio capture for browser and Android. It is not evidence of an iOS-compatible or native capture implementation. Rename or split it when introducing an actual second capture implementation rather than moving existing DSP into platform folders.

## Build and release boundaries

The browser emits dist/; Android emits dist-android/ with a root asset base and copies it during android:sync. When iOS is implemented, give its build/sync commands a distinct ignored output so platform packaging cannot accidentally consume stale assets or the GitHub Pages base. Keep current Android commands working; no iOS build commands or success claims are introduced yet.

iOS implementation will require adding the compatible @capacitor/ios package, generating native/ios/, configuring microphone usage descriptions, reviewing storage/file handling and lifecycle behavior, and validating real guitar input on an iPhone. Local iOS builds and simulator/device tooling require macOS and Xcode. A future Mac CI job can build it; CI does not replace physical audio validation. See [Capacitor iOS documentation](https://capacitorjs.com/docs/ios).

Android and iOS have separate signing, version/build metadata, store submissions and release testing even though features share source. Signing material stays outside Git. Store-specific setup and privacy declarations must be documented when implemented. No iOS support, signing, build or App Store readiness is claimed.

## Verification for this structure change

This change reserves the iOS project path and documents the contract; it adds no runtime code or native iOS project. JSON path validation, Capacitor Android sync and git diff --check passed on 2026-10-28. No new runtime tests were needed for this configuration/documentation change. Historical test/APK results remain in android.md; they do not validate iOS.
