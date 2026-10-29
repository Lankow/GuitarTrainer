# Working on GuitarTrainer

## Context

Read README.md and documents relevant to the area being changed before starting work. The app detects individual guitar notes in a desktop browser; an Android Capacitor prototype is now in scope. Read docs/android.md for Android changes. iOS remains deferred. Distinguish implemented behavior from future plans.

## Language

Use English for all communication, documentation, implementation, code identifiers, comments, tests, and user-facing text unless the user explicitly requests another language.

## Documentation as part of each change

- Update relevant documents in the same change as the code. Do not defer documentation to a separate later task.
- Behavior changes → docs/product.md; module boundaries → docs/architecture.md; significant decisions → a new ADR; setup instructions → README.md.
- Distinguish user requirements, assumptions, proposals, and measured results.
- An ADR includes status, context, alternatives, rationale, consequences, and verification. Preserve accepted decision history by superseding decisions with a new ADR.
- Do not claim platform support, passing tests, or achieved latency without evidence. Record hardware results with device model, OS version, and date.
- At task completion, report changes, verification, limitations, and updated documents. If documentation needs no changes, briefly explain why.

## Implementation

- Preserve the shared browser/Android/future iOS structure in docs/platforms.md. Keep platform integrations separate from pure music/exercise code. The reserved native/ios/ path does not imply implemented iOS support.

- Separate audio capture from pitch detection and exercise logic. Music logic must not depend on the UI or a particular platform.
- Process audio locally; saving and uploading recordings are outside the initial scope.
- Do not add accounts, a backend, cloud services, or chord recognition unless required by the agreed scope.
- DSP tests cover reference signals, silence, harmonics, and octave errors; validation with a real guitar is still required.
- Run npm test and npm run build for relevant changes. npm run typecheck validates types separately. npm run dev starts the desktop app. No dedicated linter is configured yet.

## Collaboration

One agent is responsible for integration. Roles and example tasks are described in docs/workflow.md. Describing roles does not launch agents or authorize automatic delegation. When parallel work is requested, assign separate files and a shared contract; do not overwrite others' changes.
