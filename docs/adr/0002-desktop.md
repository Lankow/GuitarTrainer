# ADR-0002: desktop browser initial version

Date: 2026-10-10. Status: accepted for initial implementation.

Confirmation (2026-10-11): the user explicitly selected desktop browser delivery. This confirms the existing implementation direction; no Windows installer is planned for this milestone.

## Context

The user requested reverting the earlier changes and focusing on desktop first. The mobile prototype was uncommitted. Preserve the GitHub repository and documentation history while replacing the active app.

## Decision and alternatives

Use React, TypeScript, Vite, and Web Audio in a desktop browser. Use a worker for YIN pitch estimation and separate pure musical logic. This enables immediate Windows testing without Android builds or Apple hardware.

Alternatives: Electron or Tauri would add installer/runtime work before audio validation; Expo targets the deferred mobile use case. Native packaging remains a later option.

## Consequences

Microphone access requires localhost/HTTPS and user permission. Background tabs stop capture. Device/browser audio processing can affect quality. There is no Windows installer. The demo exercises the detector but cannot prove microphone performance.

Replace the Expo entry points, native audio hooks, package dependencies, and mobile-first documentation. Leave generated ignored build folders inactive rather than recursively deleting baseline-adjacent folders. Do not remove global SDKs or installed phone apps. ADR-0001 remains historical.

## Verification

See docs/audio-spike.md for synthetic tests, browser checks, and outstanding real-guitar measurements. No performance guarantee follows from a successful build.
