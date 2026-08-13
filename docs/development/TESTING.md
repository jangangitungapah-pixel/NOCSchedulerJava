# Testing & Quality Foundation

WP-F02 establishes the baseline quality architecture for NOCScheduler.

## Principles

- Test rules close to the layer that owns them.
- E2E proves integration; it does not own every business-rule permutation.
- Flaky tests are defects.
- Coverage is a signal, not a vanity target.
- Formatting is deterministic hygiene and is auto-written before generated commits.
- Push-before-QA remains canonical; therefore no pre-commit hook is allowed to block the shared debugging checkpoint.

## Test layers

### Web unit/component

Tooling:

- Vitest;
- jsdom;
- React Testing Library;
- jest-dom;
- user-event;
- MSW.

Web tests live near source as `*.test.ts` / `*.test.tsx`.

MSW is initialized from `apps/web/src/test/setup.ts`. Shared deterministic fixtures belong under
`apps/web/src/test/fixtures`.

### API integration

API integration tests use Vitest in Node mode plus Supertest and live beside the API as
`*.integration.test.ts`.

These tests exercise the real Express application boundary without opening a TCP port.

Firebase/Firestore integration tests are intentionally deferred until WP-F04 introduces the Emulator Suite.

### Domain/unit

The `domain-unit` Vitest project is reserved now for deterministic tests under `packages/**`.
It may contain zero tests during WP-F02. Business/domain implementation begins later.

### E2E

Playwright owns browser-level integration.

Current baseline projects:

- Chromium desktop;
- Chromium mobile emulation.

The complete PRD-19 release matrix later expands to Firefox/WebKit/mobile WebKit. WP-F02 only proves
that the browser harness and application web/API startup model work in a CI-capable environment.

### Accessibility

`@axe-core/playwright` provides automated smoke checks. Automated accessibility checks never replace
manual keyboard, zoom/reflow, mobile ergonomics, or human UX review.

## Commands

```powershell
npm test
npm run test:integration
npm run test:coverage
npm run test:e2e
npm run test:a11y
npm run check:deadcode
npm run check:staged
```

## Coverage strategy

V8 coverage reports are available through `npm run test:coverage`.

WP-F02 intentionally does not enforce an arbitrary repository-wide percentage. Future critical
scheduling/payroll/authorization modules must gain meaningful branch coverage and deterministic
regression tests when those modules exist.

## Fixtures

Fixtures must be:

- deterministic;
- explicit;
- independent of execution order;
- timezone-aware when time matters;
- safe to run repeatedly;
- free of production secrets or copied production personal data.

The canonical business timezone is `Asia/Jakarta`.

## lint-staged

`npm run check:staged` is available as an opt-in developer command.

It is deliberately not wired to a Git pre-commit hook because this repository's canonical
collaboration workflow commits/pushes generated state before QA so that failures can be repaired
against the exact GitHub checkpoint.
