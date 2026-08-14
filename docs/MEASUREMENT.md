# Sorathai product measurement contract — M14

## Status

Measurement readiness and local-only instrumentation are enabled. Production analytics transport remains **disabled**. This contract does not authorize sending telemetry to a provider.

Sorathai already had a privacy-safe no-op event layer from M10. M14 hardens that existing contract and wires selected core-funnel call sites to it without changing the no-network event boundary.

## Principles

1. Measure product flow, not people.
2. Collect only small categorical product-state values.
3. Never include birth date, identity, free text, reading content or derived astrology/divination outputs in measurement events.
4. Do not create persistent analytics identity, fingerprint visitors, or correlate activity across sessions.
5. Provider/transport activation is a separate product and privacy decision.

## Registered event taxonomy

| Event | Purpose | Allowed properties |
| --- | --- | --- |
| `base_profile_created` | Core DOB flow completed | none |
| `base_profile_restored` | Existing local profile restored | none |
| `science_opened` | Science entry point opened | `scienceId` |
| `focus_selected` | A categorical reading focus selected | `scienceId`, `focus` |
| `deep_reading_viewed` | Deep-reading surface reached | `scienceId`, `focus` |
| `combined_opened` | Combined Profile reached | `exploredBucket` |
| `dream_started` | Dream flow started | none |
| `dream_result_viewed` | Dream result surface reached | none |
| `export_attempted` | Export action attempted | `surface` |
| `export_succeeded` | Export completed successfully | `surface` |
| `export_failed` | Export failed in a coarse technical category | `surface`, `reason` |

All properties are closed enums maintained in `sorathai-events.js`. They describe UI/product state only; they must never contain the user's astrology result or free-form content.

### Current enum families

`scienceId`: `thai`, `western`, `chinese`, `numerology`, `mayan`, `biorhythm`, `nakshatra`, `celtic`

`focus`: `identity`, `love`, `career`, `challenge`, `none`

`exploredBucket`: `0-1`, `2-3`, `4-7`, `8`

`surface`: `base`, `deep`, `combined`, `dream`

`reason`: `library_unavailable`, `render_failed`, `download_failed`, `unknown`

## Local-only instrumentation coverage

M14 Phase 2 wires the shared no-op event layer into the core funnel:

- valid new Base Profile creation → `base_profile_created`
- opening a science chooser → `science_opened`
- choosing or skipping a categorical focus → `focus_selected`
- entering a shared deep-reading context → `deep_reading_viewed`
- opening Combined Profile from the Home result → `combined_opened` with only a coarse explored-count bucket
- Base PNG export attempt/success/failure → export lifecycle events with only `surface` and a coarse failure `reason`

`sorathai-explore.js` dynamically ensures the local `sorathai-events.js` contract is available before emitting. Loading that first-party static JavaScript asset is an ordinary application asset request, not analytics/event transport: no event payload is placed in its URL, headers or body. `SorathaiEvents.emit()` itself remains a local no-op that returns sanitized data only.

## Explicitly prohibited data

Measurement events must not contain or derive any of the following:

- day, month, year, full DOB, age or birth timestamp
- name, email, phone, account/contact identifier or other direct identifier
- free-form user input, query strings or uncontrolled referrer values
- dream text, reading copy, generated interpretation text or export contents
- zodiac sign, element, weekday result, numerology result, Chinese zodiac result, tarot/dream result, auspicious values or any other derived divination/astrology output
- local-storage keys/values or saved-profile contents
- IP address captured by Sorathai application code
- precise location
- device fingerprint, advertising ID, session identity or cross-session identifier

`PROHIBITED_FIELDS` in `sorathai-events.js` is a code-level deny-list for known sensitive key names. It supplements, but does not replace, the event allow-list: any property not explicitly registered for that event is invalid even if its name is not on the deny-list.

## Runtime behavior

Two behaviors intentionally coexist:

- `sanitize(name, payload)` is the backward-compatible runtime safety layer. It returns only registered enum-valued fields and drops everything else.
- `validate(name, payload)` is the strict review/CI layer. It reports `unknown_event`, `prohibited_field`, `unexpected_field` and `invalid_enum` errors instead of silently accepting contract drift.

`emit(name, payload)` remains a local no-op that returns sanitized data only. It does not call `fetch`, `sendBeacon`, XHR, an SDK, a tracking pixel or any telemetry endpoint.

## Transport and storage boundary

M14 has no analytics provider and no event transport. It must not add analytics cookies, analytics local-storage state, tracking pixels, beacons, third-party analytics SDKs or a telemetry endpoint.

If a later milestone proposes transport, that change requires a separate review covering at minimum:

- provider and destination
- exact payload
- retention
- consent/legal basis where applicable
- IP handling
- cookie/storage behavior
- deletion/access implications
- privacy-page changes
- failure behavior and opt-out

## Validation contract

The measurement implementation is allow-list based:

- unregistered event names fail strict validation
- unexpected property keys fail strict validation
- prohibited/sensitive keys fail strict validation
- enum values outside their closed sets fail strict validation
- sanitizer continues to remove unregistered/invalid payload data for runtime compatibility
- production remains event-transport-silent until a separate transport decision is explicitly merged

The Node test suite covers sanitizer behavior, strict validation and the payload shapes used by local instrumentation inside the existing CI command `node --test tests/*.test.js`.

## Interpretation limits

No aggregate production analytics dataset is currently being collected. Local-only calls therefore provide wiring/test confidence, not traffic metrics. Even if transport is enabled later with this contract, the event model is intentionally not capable of establishing persistent unique-user identity, demographics, individual cross-session journeys or ad attribution.
