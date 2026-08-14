# Shared Contracts & Domain Kernel

WP-F05 establishes the first reusable business-language boundary for NOCScheduler.

## Ownership

`packages/contracts` owns runtime-validatable, transport/persistence-safe primitives:

- stable/entity identifiers;
- operation keys;
- BusinessDate;
- ISO timestamps;
- integer IDR amounts;
- optimistic revision;
- operation result/error taxonomy;
- pagination/filter contracts;
- audit metadata;
- conservative Firestore serialization boundary.

`packages/domain` owns deterministic behavior:

- BusinessDate arithmetic;
- Asia/Jakarta instant-to-business-date conversion;
- cross-midnight shift date resolution;
- integer IDR arithmetic;
- deterministic Clock/FixedClock;
- invariant errors and operation-result helpers.

## Boundary rules

- domain/contracts never import React or Firebase;
- Firebase Timestamp/DocumentReference/GeoPoint types do not leak into shared packages;
- web-owned Firebase adapters convert Firestore-native values to/from these shared primitives;
- integer IDR means no floating-point rupiah amounts;
- BusinessDate is a calendar date, not a timestamp;
- timestamp strings require an explicit UTC offset or Z;
- optimistic `revision` is a non-negative safe integer;
- dangerous client-safe operations may use an `OperationKey` for duplicate-intent detection;
- UI components do not become a second implementation of business rules.

## Canonical timezone

```text
Asia/Jakarta
```

Cross-midnight example:

```text
BusinessDate: 2026-08-14
Shift:        23:00 -> 07:00
End date:     2026-08-15
```

## Firestore boundary

The shared contract deliberately uses a conservative recursively serializable shape composed only
of strings, finite numbers, booleans, null, arrays, and plain objects.

Firebase-native classes belong to `apps/web` adapters, not the shared domain/contracts packages.

## Required WP-F05 tests

- invalid calendar dates rejected;
- Jakarta midnight boundary;
- cross-midnight shift end date;
- leap-date arithmetic;
- integer IDR arithmetic and overflow rejection;
- Zod rejection of malformed external payloads;
- serialization round-trip;
- deterministic fixed clock.
