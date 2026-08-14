# Authentication, Identity & Authorization

WP-F06 uses Firebase Authentication + Cloud Firestore Security Rules under the PRD-23
Spark/client-first architecture.

## Trust boundary

The browser is untrusted.

```text
Firebase Auth user (UID)
  -> /access/{uid}
     -> status + employeeId + roleId
        -> /roles/{roleId}
           -> grants[]
              -> client UX capability checks
              -> Firestore Security Rules authorization
```

UI hiding, route guards, and `packages/domain/can()` improve UX and deterministic behavior.
They do not authorize Firestore operations.

## Account and employee identity

Firebase UID and Employee ID are intentionally separate.

Disabling application access never deletes the historical Employee identity.

## Permission grants

Grant storage uses:

```text
<permission>:<scope>
```

Examples:

```text
profile.view_self:SELF
schedule.view_team:TEAM
dashboard.view:ALL
access.view:ALL
```

Scopes are ordered:

```text
SELF < TEAM < ALL
```

A broader grant may satisfy a narrower operation, never the reverse.

## Spark privilege-management posture

Client writes to `/access/**` and `/roles/**` are denied.

This is intentional. Without a trusted privileged runtime, allowing role/account mutation from
the browser would make last-administrator protection, Firebase Auth account administration, and
security audit guarantees substantially weaker.

For the current Spark baseline:

- Firebase Auth user creation/disable/reset is operator-managed in Firebase Console;
- role/access documents are operator-managed in Firestore Console;
- application clients can read only what Rules allow;
- no public self-registration exists;
- future in-app access management requires a separate explicit architecture decision if it needs
  Admin SDK / trusted backend capability.

## Rule lookup cost

Firestore Rules use document `get()` calls to resolve access and role state. Firebase documents
that these access calls count as document reads and are subject to rules access-call limits.
Keep future feature rules economical and reuse/caching-friendly.

## Session posture

Email/password sign-in uses Firebase Auth Web SDK with browser-session persistence. Closing the
browser session clears the chosen persistence baseline.

The app listens with `onIdTokenChanged` so token/session changes trigger a fresh access lookup.
Critical future actions may call `refreshAccess()` immediately before mutation when freshness is
required.
