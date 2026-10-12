# ADR 0009: Local versioned settings backups

Status: Accepted, 2026-10-12.

## Context
The user requested a file export/import for all settings, presets and current setup. Data currently lives in several localStorage keys and two cookies, with no backend.

## Alternatives
- Cloud synchronization adds accounts and a backend outside scope.
- Exporting every origin storage entry could include unrelated data.
- An allowlisted versioned JSON snapshot supports local transfer without a service.

## Decision and rationale
Export only known GuitarTrainer configuration keys, profile and high-score cookies. Use a versioned JSON envelope and validate every section before import. Present replacement details and require an explicit application action. Replace the snapshot, verify writes, attempt rollback on failure, stop audio and reload to rehydrate state. Persist valid Note and Scale setup edits immediately to capture current choices before a run.

## Consequences
Backups are plaintext local files containing the nickname and device identifier. Browser permissions and active sessions are excluded. Microphone identifiers may be unavailable on a different device. Cookie expiry restarts on import. Browser storage offers no atomic multi-key transaction; rollback can itself fail and is reported explicitly. Unknown versions fail rather than silently discarding settings.

## Verification
57 automated tests and production build passed, including snapshot round trip, unrelated-key preservation, invalid-version/section rejection, write-failure rollback and silently blocked cookies. Browser inspection confirmed Settings controls. Automated download waiting stalled, so native download/file selection and full browser restore remain unverified.
