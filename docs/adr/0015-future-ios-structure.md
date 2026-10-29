# ADR-0015: reserve iOS alongside Android in the shared repository

Date: 2026-10-28. Status: accepted. Extends ADR-0014; does not activate iOS development.

## Context

The user explicitly requires the Android structure to accommodate a future iOS version. Shared UI, DSP and exercise logic already exist; the active native project is native/android/.

## Alternatives

A separate repository or permanent platform branches would duplicate shared features and complicate integration. Generating an iOS project now would introduce unvalidated native configuration without local iOS tooling. Reserving a sibling project path establishes boundaries without claiming an implementation.

## Decision and rationale

Reserve native/ios/ in Capacitor configuration. Keep one shared src/ tree, platform integration contracts in src/platform/, and native code within the respective native project. Require platform dependency coverage to be considered during Android work. Document the contract in docs/platforms.md.

## Consequences

Future iOS work can reuse features but still needs an iOS package/project, platform permissions, signing, store preparation and physical audio validation. Its build output and credentials must be ignored when added. iOS implementation remains deferred; current Android build commands remain unchanged.

## Verification

Validate both project paths in capacitor.config.json and run Capacitor Android sync after the configuration change. No runtime code changes are introduced; existing test/build results are recorded in docs/android.md. No iOS build or device result is claimed.
