# NOCScheduler Toolchain & Repository Conventions

> Package manager: npm  
> Runtime policy: Node.js 22.x for development tooling  
> Source language: TypeScript / TSX strict mode  
> Production runtime: Firebase Hosting + browser Firebase Web SDK

## Runtime policy

Node.js 22 is the development/build-tool baseline. Production application code runs as a static
Vite SPA in the browser; there is no managed Node application runtime in the active architecture.

Java is not a normal prerequisite because the Emulator Suite is not part of the active baseline.

## Workspace topology

```text
apps/web              -> @nocscheduler/web
packages/domain       -> @nocscheduler/domain
packages/contracts    -> @nocscheduler/contracts
packages/ui           -> @nocscheduler/ui
```

`apps/api` is intentionally absent.

## Boundary rules

- web may depend on shared packages;
- domain/contracts must not depend on React, Tailwind, Vite, or Firebase;
- UI must not import application-private web modules;
- Firebase Web SDK access stays behind web-owned adapters;
- business truth stays in domain/contracts, not page components.

## TypeScript baseline

- `strict: true`;
- `noUncheckedIndexedAccess: true`;
- `exactOptionalPropertyTypes: true`;
- `noImplicitOverride: true`;
- `useUnknownInCatchVariables: true`;
- avoid `any`;
- use Zod at external/untrusted data boundaries.

## Source extension policy

- React/JSX: `.tsx`
- first-party modules: `.ts`
- repository generators/tooling may use `.cjs`
- tool-native ESM config may use `.mjs`

## Environment and secrets

- real environment files stay local/ignored;
- Vite-exposed Firebase configuration is public client configuration;
- service-account JSON and private keys are forbidden;
- no server credential is required by the canonical runtime.
