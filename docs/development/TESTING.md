# Testing & Quality Foundation

WP-F02 establishes the baseline quality architecture for NOCScheduler.

## Principles

- Test rules close to the layer that owns them.
- E2E proves browser integration; it does not own every business-rule permutation.
- Flaky tests are defects.
- Coverage is a signal, not a vanity target.
- The active runtime has no Express/API server or Emulator Suite dependency.
- Push-before-QA remains canonical.

## Test layers

### Web unit/component

Vitest + jsdom + React Testing Library own browser/component tests.

### Domain/unit

Deterministic scheduling, payroll, date, money, lifecycle, and policy logic belongs under
`packages/domain` and is tested without React or Firebase.

### Firebase configuration/security

`npm run check:firebase` prevents Cloud Functions/API topology from returning and verifies the
fail-closed WP-F04 rules baseline. Later phases must add focused rule/data-access validation
appropriate to the final client-first security design.

### E2E

Playwright starts only the Vite web application. There is no API webServer dependency.

Current baseline projects:

- Chromium desktop;
- Chromium mobile emulation.

### Accessibility

`@axe-core/playwright` provides automated smoke checks. Manual keyboard, zoom/reflow, mobile
ergonomics, and human UX review remain required where relevant.

## Commands

```powershell
npm test
npm run test:coverage
npm run test:e2e
npm run test:a11y
npm run check:deadcode
npm run check:staged
```

## Fixtures

Fixtures must be deterministic, explicit, execution-order independent, timezone-aware when time
matters, repeatable, and free of production secrets/personal data.

The canonical business timezone is `Asia/Jakarta`.
