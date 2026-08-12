# NOCScheduler

NOCScheduler is an internal operational scheduling, workforce, attendance, and payroll platform. The implementation follows the PRD set under `docs/prd`, the production workplan under `docs/workplan`, and the canonical generator workflow under `docs/workflow`.

## Current implementation phase

WP-F00 establishes only the repository and toolchain foundation. React/Vite application scaffolding belongs to WP-F01, and Firebase platform/emulator setup belongs to WP-F04.

## Required local runtime

- Node.js 22.x
- npm 10 or newer
- Git
- Java 21 before Firebase Firestore Emulator work begins (not required to pass WP-F00)

The root `.nvmrc` contains `22`. When using a Node version manager, switch to Node 22 before installing dependencies.

## Bootstrap

```powershell
node --version
npm --version
npm install
npm run check:runtime
npm run typecheck
npm run lint
npm run format:check
npm run check:repo
```

The canonical package manager is npm. Do not add pnpm/yarn lockfiles. `package-lock.json` is the dependency source-of-truth lockfile.

## Workspace direction

The root npm workspace patterns are intentionally reserved now and populated in WP-F01:

```text
apps/*
packages/*
```

Cross-workspace imports must use package boundaries rather than reaching into another workspace's private source tree. See `docs/development/TOOLCHAIN.md`.

## Source standard

- React source: `.tsx`
- Non-React first-party application source: `.ts`
- Strict TypeScript is mandatory.
- `.js`/`.jsx` are not canonical first-party application source. Tooling/config files may use JavaScript-family extensions when the tool requires or benefits from them.

## Secrets

Never commit Firebase service-account JSON, private keys, real `.env` files, or production credentials. The repository policy gate checks common tracked-secret filename patterns, while `.gitignore` provides a second line of protection.
