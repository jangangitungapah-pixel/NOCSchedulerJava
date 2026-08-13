# NOCScheduler

NOCScheduler is an internal operational scheduling, workforce, attendance, and payroll platform.
The implementation follows the PRDs under `docs/prd`, the production workplan under
`docs/workplan`, and the canonical generator workflow under `docs/workflow`.

## Current implementation phase

WP-F00 (repository/toolchain bootstrap) is accepted. WP-F01 scaffolds the canonical application
workspaces without implementing product business features.

Generated workspace direction:

```text
apps/
  web/
  api/
packages/
  domain/
  contracts/
  ui/
```

Firebase managed-platform wiring remains WP-F04. Authentication remains WP-F06. Real shared
domain/contracts start in WP-F05, and the production design system starts in WP-F03.

## Required local runtime

- Node.js 22.x
- npm 10 or newer
- Git
- Java 21+ before Firebase Emulator work begins

The accepted WP-F00 environment used Node.js 22.23.2 and npm 10.9.8.

## Install

```powershell
nvm use 22
node --version
npm --version
npm install
```

The canonical package manager is npm. Do not add pnpm/yarn lockfiles.

## Development

Start the local Express API and Vite web application together:

```powershell
npm run dev
```

Local endpoints:

```text
Web:       http://127.0.0.1:5173
API root:  http://127.0.0.1:8787/api/v1
Health:    http://127.0.0.1:8787/api/v1/health
Readiness: http://127.0.0.1:8787/api/v1/readiness
```

The Vite dev server proxies same-origin browser requests under `/api/**` to the local Express
server. Production Firebase Hosting rewrites are intentionally deferred to WP-F04.

The scaffold home page calls `/api/v1/health` through that proxy. A successful local runtime
shows **API connected**.

## WP-F01 manual runtime validation

After static/build gates pass:

1. run `npm run dev`;
2. open `http://127.0.0.1:5173`;
3. confirm the page shows **API connected**;
4. toggle Light/Dark mode and confirm the theme changes;
5. open `http://127.0.0.1:5173/does-not-exist` and confirm the 404 scaffold surface;
6. in development only, open `http://127.0.0.1:5173/__diagnostics/route-error` and confirm the
   route error boundary renders.

Stop the dev command with Ctrl+C after validation.

## Quality gates available after WP-F01

```powershell
npm run check:runtime
npm run typecheck
npm run lint
npm run format:check
npm run check:repo
npm run check:workspaces
npm run build
npm run smoke:api
```

`npm run smoke:api` starts the built API on a dedicated smoke port and verifies health +
readiness responses.

## Workspace responsibilities

### `apps/web`

React + Vite + TSX SPA shell. React Router owns routing, TanStack Query owns server state, and
Tailwind powers layout/styling. Theme support is only a scaffold in WP-F01; WP-F03 owns the full
semantic design system.

### `apps/api`

TypeScript ESM Express application with `/api/v1`, correlation IDs, structured Pino logs,
environment validation, health/readiness endpoints, security headers, compression, JSON body
limits, and canonical JSON error shells.

It is only a local Node server in WP-F01. Firebase Functions 2nd gen integration belongs to WP-F04.

### `packages/domain`

Framework-independent deterministic business logic boundary. No React/Tailwind dependency is
allowed.

### `packages/contracts`

Shared API/schema/type boundary. Real reusable contracts and Zod schemas begin in WP-F05.

### `packages/ui`

Future shared primitives/patterns/token helpers. Production components/tokens begin in WP-F03.

## Source standard

- React source: `.tsx`
- Non-React first-party application source: `.ts`
- Strict TypeScript is mandatory.
- `.js`/`.jsx` are not canonical first-party application source.
- Tooling/config files may use JavaScript-family extensions where appropriate.

## Secrets

Never commit Firebase service-account JSON, private keys, real `.env` files, or production
credentials. Vite-exposed variables are public browser configuration and must never contain
secrets.
