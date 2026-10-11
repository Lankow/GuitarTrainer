# ADR-0003: local nickname profile

Date: 2026-10-11. Status: accepted.

## Context

The user requests first-launch nickname collection and cookie persistence for the desktop browser app.

## Decision

Store one nickname in a host-only cookie for one year, Path=/, SameSite=Lax, and Secure on HTTPS. Keep audio/theme/tuning preferences in existing localStorage. No authentication or server-side profile is introduced.

## Alternatives

localStorage avoids sending the nickname with requests but does not meet the explicit cookie requirement. Server accounts would introduce infrastructure outside the agreed scope.

## Rationale

A small local profile satisfies personalization while keeping setup simple. The cookie lifetime is an implementation choice.

## Consequences

The nickname is editable in Settings and visible to same-origin JavaScript; it is not an authentication credential. Cookies accompany requests to the host. Clearing or expiring cookies repeats onboarding. Blocked cookies permit session-only use with a warning. Profiles do not sync across devices.

## Verification

Browser onboarding and nickname persistence after reload were verified on 2026-10-11. Blocked-cookie behavior is implemented but not manually exercised. Production build and type checking passed.
