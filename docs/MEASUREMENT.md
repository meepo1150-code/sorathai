# Sorathai product measurement contract — M14 Phase 1

## Status

Measurement readiness only. Production analytics transport is **disabled**. This contract does not authorize sending telemetry to a provider.

## Principles

1. Measure product flow, not people.
2. Collect the minimum categorical state needed to answer a product question.
3. Never include birth date, name, free text, reading content or derived astrology values in measurement events.
4. Do not create persistent analytics identity, fingerprint visitors, or correlate activity across sessions.
5. Provider/transport activation is a separate product and privacy decision.

## Event taxonomy

| Event | Product question | Allowed properties |
| --- | --- | --- |
| `base_profile_created` | Does the core DOB flow complete? | none |
| `science_opened` | Which science entry point is used? | `science` |
| `combined_profile_opened` | Does the flow reach Combined Profile? | none |
| `export_completed` | Which product surfaces successfully export? | `surface`, `format` |

### Allowed property values

`science` is a closed product-surface identifier, not a calculated result. Allowed values are maintained with the UI's registered science entry points and must never contain a user's reading/result value.

`surface`:
- `base`
- `deep`
- `combined`

`format`:
- `png`

## Explicitly prohibited data

Measurement events must not contain or derive any of the following:

- day, month, year, full DOB, age or birth timestamp
- name, email, phone, account/contact identifier or other direct identifier
- free-form user input
- reading copy, generated interpretation text or export contents
- zodiac sign, element, weekday result, numerology result, Chinese zodiac result, tarot/dream result, auspicious values or any other derived divination/astrology output
- local-storage keys/values or saved-profile contents
- IP address captured by Sorathai application code
- precise location
- device fingerprint, advertising ID or cross-session identifier
- referrer/query-string values that may contain uncontrolled user data

## Transport and storage boundary

Phase 1 has no provider and no network transport. It must not add analytics cookies, analytics local-storage state, tracking pixels, beacons, third-party SDKs or a telemetry endpoint.

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

Any future measurement implementation must be allow-list based:

- unregistered event names fail validation
- unexpected property keys fail validation
- property values use closed enums where possible
- prohibited/sensitive keys fail validation even if accidentally added to an otherwise registered event
- production remains network-silent until a separate transport decision is explicitly merged

## Interpretation limits

These events can describe aggregate product-flow behavior. They cannot establish unique-user counts, cross-session retention, demographics, individual journeys or attribution. Those limitations are intentional in this privacy-first phase.
