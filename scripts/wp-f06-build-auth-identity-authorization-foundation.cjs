const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const EXPECTED_BASE = '6a6f9d9d232caa78d077ccb0cc3e6c548e0047ca';
const GENERATOR_RELATIVE =
  'scripts/wp-f06-build-auth-identity-authorization-foundation.cjs';

function fail(message) {
  console.error(`[WP-F06] ${message}`);
  process.exit(1);
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr).trim() : '';
    fail(`Git command failed: git ${args.join(' ')}${stderr ? `\n${stderr}` : ''}`);
  }
}

const root = process.cwd();

if (!fs.existsSync(path.join(root, '.git'))) {
  fail('Run this generator from the NOCSchedulerJava repository root.');
}

const head = git(['rev-parse', 'HEAD']);

if (head !== EXPECTED_BASE) {
  fail(
    `Stale base. Expected HEAD ${EXPECTED_BASE}, got ${head}. ` +
      'Pull main first or request a regenerated WP-F06 script.',
  );
}

const statusOutput = git(['status', '--porcelain=v1', '-uall']);
const dirtyLines = statusOutput
  .split(/\r?\n/u)
  .filter(Boolean)
  .filter((line) => {
    const normalized = line.slice(3).replaceAll('\\', '/').replace(/^"|"$/gu, '');
    return !(line.startsWith('?? ') && normalized === GENERATOR_RELATIVE);
  });

if (dirtyLines.length > 0) {
  fail(`Repository has unrelated local changes:\n${dirtyLines.join('\n')}`);
}

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const target = absolute(relativePath);

  if (!fs.existsSync(target)) {
    fail(`Required file is missing: ${relativePath}`);
  }

  return fs.readFileSync(target, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function write(relativePath, contents) {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents, 'utf8');
}

function replaceExact(relativePath, before, after) {
  const original = read(relativePath);
  const count = original.split(before).length - 1;

  if (count !== 1) {
    fail(
      `${relativePath}: expected exactly one replacement target, found ${count}.\nTarget:\n${before}`,
    );
  }

  write(relativePath, original.replace(before, after));
}

for (const required of [
  'apps/web/package.json',
  'apps/web/src/app/providers.tsx',
  'apps/web/src/app/app-shell.tsx',
  'apps/web/src/routes/router.tsx',
  'apps/web/src/styles/index.css',
  'packages/contracts/src/index.ts',
  'packages/domain/src/index.ts',
  'firestore.rules',
  'tooling/firebase/check-config.cjs',
  'e2e/scaffold.spec.ts',
  'e2e/accessibility.spec.ts',
  'docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md',
  'docs/workflow/PHASE_CONTROL.md',
]) {
  read(required);
}

// -----------------------------------------------------------------------------
// Shared authorization contracts
// -----------------------------------------------------------------------------

write(
  'packages/contracts/src/authorization.ts',
  `import { z } from 'zod';

import { entityIdSchema } from './identifiers';
import { revisionSchema } from './revision';

export const PERMISSION_CODES = [
  'auth.login',
  'auth.logout',
  'profile.view_self',
  'profile.edit_self_preferences',
  'dashboard.view',
  'schedule.view_self',
  'schedule.view_team',
  'schedule.view_history',
  'schedule.view_draft',
  'schedule.create_draft',
  'schedule.manage',
  'schedule.bulk_manage',
  'schedule.validate',
  'schedule.publish',
  'schedule.correct_published',
  'schedule.override_warning',
  'schedule.archive_period',
  'request.create_self',
  'request.create_for_others',
  'request.view_self',
  'request.view_all',
  'request.cancel_self',
  'request.approve',
  'request.reject',
  'request.manage_exception',
  'request.manage_replacement',
  'request.manage_swap',
  'request.retroactive_correction',
  'employee.view',
  'employee.create',
  'employee.edit',
  'employee.activate',
  'employee.deactivate',
  'employee.view_history',
  'compensation.view',
  'compensation.manage_salary',
  'compensation.manage_incentive',
  'compensation.view_history',
  'payroll.view',
  'payroll.view_detail',
  'payroll.view_history',
  'payroll.calculate',
  'payroll.recalculate',
  'payroll.adjust',
  'payroll.finalize',
  'payroll.lock',
  'payroll.unlock',
  'payroll.correct_historical',
  'report.view',
  'report.export',
  'audit.view_operational',
  'audit.view_security',
  'settings.general.manage',
  'settings.shift.manage',
  'settings.payroll.manage',
  'settings.holiday.manage',
  'settings.notification.manage',
  'access.view',
  'access.manage_role',
  'access.assign_role',
  'access.manage_account_status',
] as const;

export const permissionCodeSchema = z.enum(PERMISSION_CODES);
export type PermissionCode = z.infer<typeof permissionCodeSchema>;

export const permissionScopeSchema = z.enum(['SELF', 'TEAM', 'ALL']);
export type PermissionScope = z.infer<typeof permissionScopeSchema>;

export const accountStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

export const BASELINE_ROLE_IDS = [
  'NOC_MEMBER',
  'SCHEDULER_SUPERVISOR',
  'ADMINISTRATOR',
] as const;

export const baselineRoleIdSchema = z.enum(BASELINE_ROLE_IDS);
export type BaselineRoleId = z.infer<typeof baselineRoleIdSchema>;

export type PermissionGrantCode = string & {
  readonly __permissionGrantCodeBrand: 'PermissionGrantCode';
};

function isPermissionGrantCode(value: string): boolean {
  const separatorIndex = value.lastIndexOf(':');

  if (separatorIndex <= 0 || separatorIndex === value.length - 1) {
    return false;
  }

  const permission = value.slice(0, separatorIndex);
  const scope = value.slice(separatorIndex + 1);

  return (
    permissionCodeSchema.safeParse(permission).success &&
    permissionScopeSchema.safeParse(scope).success
  );
}

export const permissionGrantCodeSchema = z
  .string()
  .refine(
    isPermissionGrantCode,
    'Permission grant must use the canonical <permission>:<scope> format.',
  )
  .transform((value) => value as PermissionGrantCode);

export function makePermissionGrantCode(
  permission: PermissionCode,
  scope: PermissionScope,
): PermissionGrantCode {
  return permissionGrantCodeSchema.parse(\`\${permission}:\${scope}\`);
}

export function parsePermissionGrantCode(
  value: PermissionGrantCode,
): Readonly<{
  permission: PermissionCode;
  scope: PermissionScope;
}> {
  const separatorIndex = value.lastIndexOf(':');

  return {
    permission: permissionCodeSchema.parse(value.slice(0, separatorIndex)),
    scope: permissionScopeSchema.parse(value.slice(separatorIndex + 1)),
  };
}

export const accessRecordSchema = z
  .object({
    uid: entityIdSchema('user'),
    employeeId: entityIdSchema('employee'),
    roleId: entityIdSchema('role'),
    status: accountStatusSchema,
    revision: revisionSchema,
  })
  .strict();

export type AccessRecord = z.infer<typeof accessRecordSchema>;

export const roleRecordSchema = z
  .object({
    roleId: entityIdSchema('role'),
    label: z.string().trim().min(1).max(120),
    active: z.boolean(),
    grants: z
      .array(permissionGrantCodeSchema)
      .max(PERMISSION_CODES.length * 3)
      .refine(
        (grants) => new Set(grants).size === grants.length,
        'Role grants must not contain duplicates.',
      ),
  })
  .strict();

export type RoleRecord = z.infer<typeof roleRecordSchema>;

export type AuthorizationPrincipal = Readonly<{
  uid: AccessRecord['uid'];
  employeeId: AccessRecord['employeeId'];
  roleId: AccessRecord['roleId'];
  accountStatus: AccountStatus;
  roleActive: boolean;
  grants: readonly PermissionGrantCode[];
}>;
`,
);

replaceExact(
  'packages/contracts/src/index.ts',
  `export * from './audit';`,
  `export * from './audit';
export * from './authorization';`,
);

write(
  'packages/contracts/src/authorization.test.ts',
  `import { describe, expect, it } from 'vitest';

import {
  accessRecordSchema,
  makePermissionGrantCode,
  permissionGrantCodeSchema,
  roleRecordSchema,
} from './authorization';

describe('authorization contracts', () => {
  it('rejects malformed permission grants', () => {
    expect(() => permissionGrantCodeSchema.parse('dashboard.view')).toThrow();
    expect(() => permissionGrantCodeSchema.parse('unknown.permission:ALL')).toThrow();
    expect(() => permissionGrantCodeSchema.parse('dashboard.view:WORLD')).toThrow();
  });

  it('validates strict access and role records', () => {
    expect(
      accessRecordSchema.parse({
        uid: 'firebase-user-001',
        employeeId: 'employee-001',
        roleId: 'NOC_MEMBER',
        status: 'ACTIVE',
        revision: 0,
      }),
    ).toMatchObject({
      roleId: 'NOC_MEMBER',
      status: 'ACTIVE',
    });

    expect(
      roleRecordSchema.parse({
        roleId: 'NOC_MEMBER',
        label: 'NOC Member',
        active: true,
        grants: [
          makePermissionGrantCode('auth.login', 'SELF'),
          makePermissionGrantCode('dashboard.view', 'ALL'),
        ],
      }),
    ).toMatchObject({
      active: true,
      roleId: 'NOC_MEMBER',
    });
  });

  it('rejects duplicate grants', () => {
    const grant = makePermissionGrantCode('dashboard.view', 'ALL');

    expect(() =>
      roleRecordSchema.parse({
        roleId: 'NOC_MEMBER',
        label: 'NOC Member',
        active: true,
        grants: [grant, grant],
      }),
    ).toThrow();
  });
});
`,
);

// -----------------------------------------------------------------------------
// Deterministic authorization service
// -----------------------------------------------------------------------------

write(
  'packages/domain/src/authorization.ts',
  `import {
  parsePermissionGrantCode,
  type AuthorizationPrincipal,
  type PermissionCode,
  type PermissionScope,
} from '@nocscheduler/contracts';

import { DomainInvariantError } from './invariant';

const SCOPE_RANK: Readonly<Record<PermissionScope, number>> = {
  SELF: 1,
  TEAM: 2,
  ALL: 3,
};

export function can(
  principal: AuthorizationPrincipal,
  permission: PermissionCode,
  requiredScope: PermissionScope = 'SELF',
): boolean {
  if (principal.accountStatus !== 'ACTIVE' || !principal.roleActive) {
    return false;
  }

  const requiredRank = SCOPE_RANK[requiredScope];

  return principal.grants.some((grant) => {
    const parsed = parsePermissionGrantCode(grant);

    return parsed.permission === permission && SCOPE_RANK[parsed.scope] >= requiredRank;
  });
}

export function requirePermission(
  principal: AuthorizationPrincipal,
  permission: PermissionCode,
  requiredScope: PermissionScope = 'SELF',
): void {
  if (!can(principal, permission, requiredScope)) {
    throw new DomainInvariantError(
      \`Permission denied: \${permission} requires \${requiredScope} scope.\`,
      'FORBIDDEN',
    );
  }
}
`,
);

replaceExact(
  'packages/domain/src/index.ts',
  `export * from './business-date';`,
  `export * from './authorization';
export * from './business-date';`,
);

write(
  'packages/domain/src/authorization.test.ts',
  `import {
  entityIdSchema,
  makePermissionGrantCode,
  revisionSchema,
  type AuthorizationPrincipal,
} from '@nocscheduler/contracts';
import { describe, expect, it } from 'vitest';

import { can, requirePermission } from './authorization';

function principal(
  overrides: Partial<AuthorizationPrincipal> = {},
): AuthorizationPrincipal {
  return {
    uid: entityIdSchema('user').parse('firebase-user-001'),
    employeeId: entityIdSchema('employee').parse('employee-001'),
    roleId: entityIdSchema('role').parse('NOC_MEMBER'),
    accountStatus: 'ACTIVE',
    roleActive: true,
    grants: [
      makePermissionGrantCode('profile.view_self', 'SELF'),
      makePermissionGrantCode('schedule.view_team', 'TEAM'),
      makePermissionGrantCode('dashboard.view', 'ALL'),
    ],
    ...overrides,
  };
}

describe('authorization service', () => {
  it('denies unknown/ungranted capabilities by default', () => {
    expect(can(principal(), 'payroll.finalize', 'ALL')).toBe(false);
  });

  it('allows a broader grant to satisfy a narrower required scope', () => {
    expect(can(principal(), 'dashboard.view', 'SELF')).toBe(true);
    expect(can(principal(), 'schedule.view_team', 'TEAM')).toBe(true);
    expect(can(principal(), 'schedule.view_team', 'ALL')).toBe(false);
  });

  it('denies inactive accounts and inactive roles', () => {
    expect(can(principal({ accountStatus: 'INACTIVE' }), 'dashboard.view', 'ALL')).toBe(false);
    expect(can(principal({ roleActive: false }), 'dashboard.view', 'ALL')).toBe(false);
  });

  it('throws a FORBIDDEN invariant when a required capability is missing', () => {
    expect(() => requirePermission(principal(), 'access.assign_role', 'ALL')).toThrow(
      /Permission denied/u,
    );
  });

  it('keeps optimistic revision construction valid for access records', () => {
    expect(revisionSchema.parse(0)).toBe(0);
  });
});
`,
);

// -----------------------------------------------------------------------------
// Web package dependencies
// -----------------------------------------------------------------------------

const webPackage = readJson('apps/web/package.json');
webPackage.dependencies = {
  ...webPackage.dependencies,
  '@nocscheduler/contracts': '0.0.0',
  '@nocscheduler/domain': '0.0.0',
};
write('apps/web/package.json', `${JSON.stringify(webPackage, null, 2)}\n`);

// -----------------------------------------------------------------------------
// Firebase access repository
// -----------------------------------------------------------------------------

write(
  'apps/web/src/features/auth/access-repository.ts',
  `import {
  accessRecordSchema,
  entityIdSchema,
  roleRecordSchema,
  type AuthorizationPrincipal,
} from '@nocscheduler/contracts';
import { doc, getDoc, type Firestore } from 'firebase/firestore';

export type AccessResolution =
  | Readonly<{
      status: 'authorized';
      principal: AuthorizationPrincipal;
    }>
  | Readonly<{
      status: 'denied';
      reason: 'MISSING_ACCESS' | 'INVALID_ACCESS' | 'INACTIVE_ACCOUNT' | 'INVALID_ROLE';
    }>;

export async function resolveAccessForUid(
  firestore: Firestore,
  firebaseUid: string,
): Promise<AccessResolution> {
  const uid = entityIdSchema('user').parse(firebaseUid);
  const accessSnapshot = await getDoc(doc(firestore, 'access', firebaseUid));

  if (!accessSnapshot.exists()) {
    return {
      status: 'denied',
      reason: 'MISSING_ACCESS',
    };
  }

  const accessResult = accessRecordSchema.safeParse(accessSnapshot.data());

  if (!accessResult.success || accessResult.data.uid !== uid) {
    return {
      status: 'denied',
      reason: 'INVALID_ACCESS',
    };
  }

  const access = accessResult.data;

  if (access.status !== 'ACTIVE') {
    return {
      status: 'denied',
      reason: 'INACTIVE_ACCOUNT',
    };
  }

  const roleSnapshot = await getDoc(doc(firestore, 'roles', access.roleId));

  if (!roleSnapshot.exists()) {
    return {
      status: 'denied',
      reason: 'INVALID_ROLE',
    };
  }

  const roleResult = roleRecordSchema.safeParse(roleSnapshot.data());

  if (
    !roleResult.success ||
    roleResult.data.roleId !== access.roleId ||
    !roleResult.data.active
  ) {
    return {
      status: 'denied',
      reason: 'INVALID_ROLE',
    };
  }

  return {
    status: 'authorized',
    principal: {
      uid: access.uid,
      employeeId: access.employeeId,
      roleId: access.roleId,
      accountStatus: access.status,
      roleActive: roleResult.data.active,
      grants: roleResult.data.grants,
    },
  };
}
`,
);

write(
  'apps/web/src/features/auth/auth-errors.ts',
  `export const GENERIC_LOGIN_ERROR =
  'Email atau password tidak valid, atau akses akun belum tersedia.';

export function authErrorMessage(_error: unknown): string {
  return GENERIC_LOGIN_ERROR;
}
`,
);

write(
  'apps/web/src/features/auth/auth-errors.test.ts',
  `import { describe, expect, it } from 'vitest';

import { authErrorMessage, GENERIC_LOGIN_ERROR } from './auth-errors';

describe('authentication error messaging', () => {
  it('does not disclose whether an email, password, or account status caused login failure', () => {
    expect(authErrorMessage(new Error('auth/user-not-found'))).toBe(GENERIC_LOGIN_ERROR);
    expect(authErrorMessage(new Error('auth/wrong-password'))).toBe(GENERIC_LOGIN_ERROR);
    expect(authErrorMessage(new Error('permission-denied'))).toBe(GENERIC_LOGIN_ERROR);
  });
});
`,
);

// -----------------------------------------------------------------------------
// Auth provider and authorization hooks
// -----------------------------------------------------------------------------

write(
  'apps/web/src/features/auth/auth-provider.tsx',
  `import {
  can,
} from '@nocscheduler/domain';
import type {
  AuthorizationPrincipal,
  PermissionCode,
  PermissionScope,
} from '@nocscheduler/contracts';
import {
  browserSessionPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getFirebaseClientServices } from '../../lib/firebase/client';
import { resolveAccessForUid } from './access-repository';
import { authErrorMessage } from './auth-errors';

export type AuthState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'signed-out' }>
  | Readonly<{
      status: 'denied';
      user: User;
    }>
  | Readonly<{
      status: 'error';
      user: User | null;
    }>
  | Readonly<{
      status: 'authenticated';
      user: User;
      principal: AuthorizationPrincipal;
    }>;

type AuthContextValue = Readonly<{
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOutCurrentUser: () => Promise<void>;
  refreshAccess: () => Promise<void>;
  can: (permission: PermissionCode, scope?: PermissionScope) => boolean;
}>;

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = Readonly<{
  children: ReactNode;
}>;

export function AuthProvider({ children }: AuthProviderProps) {
  const { auth, firestore } = getFirebaseClientServices();
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const generationRef = useRef(0);

  const hydrateUser = useCallback(
    async (user: User | null) => {
      const generation = ++generationRef.current;

      if (user === null) {
        setState({ status: 'signed-out' });
        return;
      }

      try {
        const resolution = await resolveAccessForUid(firestore, user.uid);

        if (generation !== generationRef.current) {
          return;
        }

        if (resolution.status === 'denied') {
          setState({
            status: 'denied',
            user,
          });
          return;
        }

        setState({
          status: 'authenticated',
          user,
          principal: resolution.principal,
        });
      } catch {
        if (generation === generationRef.current) {
          setState({
            status: 'error',
            user,
          });
        }
      }
    },
    [firestore],
  );

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      void hydrateUser(user);
    });

    return unsubscribe;
  }, [auth, hydrateUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState({ status: 'loading' });

      try {
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (error) {
        setState({ status: 'signed-out' });
        throw new Error(authErrorMessage(error));
      }
    },
    [auth],
  );

  const signOutCurrentUser = useCallback(async () => {
    ++generationRef.current;
    await signOut(auth);
    setState({ status: 'signed-out' });
  }, [auth]);

  const refreshAccess = useCallback(async () => {
    setState({ status: 'loading' });
    await hydrateUser(auth.currentUser);
  }, [auth, hydrateUser]);

  const canCurrentUser = useCallback(
    (permission: PermissionCode, scope: PermissionScope = 'SELF') =>
      state.status === 'authenticated' && can(state.principal, permission, scope),
    [state],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signIn,
      signOutCurrentUser,
      refreshAccess,
      can: canCurrentUser,
    }),
    [canCurrentUser, refreshAccess, signIn, signOutCurrentUser, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

export function useAuthenticatedSession() {
  const { state } = useAuth();

  if (state.status !== 'authenticated') {
    throw new Error('Authenticated session requested outside a protected route.');
  }

  return state;
}
`,
);

// -----------------------------------------------------------------------------
// Auth route surfaces
// -----------------------------------------------------------------------------

write(
  'apps/web/src/features/auth/login-page.tsx',
  `import {
  Button,
  Card,
  FormField,
  Input,
  LoadingState,
} from '@nocscheduler/ui';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from './auth-provider';

function safeNextPath(search: string): string {
  const requested = new URLSearchParams(search).get('next');

  if (requested === null || !requested.startsWith('/') || requested.startsWith('//')) {
    return '/';
  }

  return requested;
}

export function LoginPage() {
  const location = useLocation();
  const { state, signIn, signOutCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (state.status === 'authenticated') {
    return <Navigate replace to={safeNextPath(location.search)} />;
  }

  if (state.status === 'loading') {
    return (
      <div className="auth-layout">
        <LoadingState label="Memeriksa sesi…" />
      </div>
    );
  }

  if (state.status === 'denied') {
    return (
      <div className="auth-layout">
        <Card className="auth-card">
          <div className="auth-brand">
            <span aria-hidden="true" className="auth-brand__mark">
              NS
            </span>
            <div>
              <p className="auth-brand__eyebrow">NOCScheduler</p>
              <h1 className="auth-title">Akses aplikasi belum aktif</h1>
            </div>
          </div>
          <p className="auth-description">
            Identitas Firebase berhasil dikenali, tetapi akun ini belum memiliki akses aplikasi
            aktif. Hubungi administrator internal.
          </p>
          <Button
            onClick={() => {
              void signOutCurrentUser();
            }}
            variant="secondary"
          >
            Kembali ke login
          </Button>
        </Card>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login gagal.');
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <Card className="auth-card">
        <div className="auth-brand">
          <span aria-hidden="true" className="auth-brand__mark">
            NS
          </span>
          <div>
            <p className="auth-brand__eyebrow">Internal NOC Operations</p>
            <h1 className="auth-title">Masuk ke NOCScheduler</h1>
          </div>
        </div>

        <p className="auth-description">
          Gunakan akun internal yang sudah dibuat dan diaktifkan oleh administrator.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField htmlFor="login-email" label="Email">
            <Input
              autoComplete="username"
              id="login-email"
              inputMode="email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              value={email}
            />
          </FormField>

          <FormField htmlFor="login-password" label="Password">
            <Input
              autoComplete="current-password"
              id="login-password"
              minLength={1}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              type="password"
              value={password}
            />
          </FormField>

          {error !== null ? (
            <p aria-live="polite" className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button loading={submitting} loadingLabel="Masuk…" type="submit" variant="primary">
            Masuk
          </Button>
        </form>

        <p className="auth-footnote">
          Tidak ada pendaftaran publik. Akses aplikasi ditentukan oleh Firebase Authentication dan
          record akses Firestore yang dikelola operator.
        </p>
      </Card>
    </div>
  );
}
`,
);

write(
  'apps/web/src/features/auth/require-authenticated.tsx',
  `import { Button, Card, ErrorState, LoadingState } from '@nocscheduler/ui';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from './auth-provider';

export function RequireAuthenticated() {
  const location = useLocation();
  const { state, refreshAccess, signOutCurrentUser } = useAuth();

  if (state.status === 'loading') {
    return (
      <div className="auth-layout">
        <LoadingState label="Memeriksa akses…" />
      </div>
    );
  }

  if (state.status === 'signed-out') {
    const next = encodeURIComponent(
      \`\${location.pathname}\${location.search}\${location.hash}\`,
    );

    return <Navigate replace to={\`/login?next=\${next}\`} />;
  }

  if (state.status === 'denied') {
    return (
      <div className="auth-layout">
        <Card className="auth-card">
          <ErrorState
            description="Akun Firebase ini tidak memiliki record akses aktif yang valid."
            title="Akses ditolak"
          />
          <div className="auth-actions">
            <Button
              onClick={() => {
                void refreshAccess();
              }}
              variant="secondary"
            >
              Periksa ulang akses
            </Button>
            <Button
              onClick={() => {
                void signOutCurrentUser();
              }}
              variant="ghost"
            >
              Keluar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="auth-layout">
        <Card className="auth-card">
          <ErrorState
            description="Status akses tidak dapat diverifikasi. Sistem gagal tertutup dan tidak membuka aplikasi."
            title="Tidak dapat memverifikasi akses"
          />
          <Button
            onClick={() => {
              void refreshAccess();
            }}
            variant="secondary"
          >
            Coba lagi
          </Button>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
`,
);

// -----------------------------------------------------------------------------
// App providers, router, and authenticated shell
// -----------------------------------------------------------------------------

replaceExact(
  'apps/web/src/app/providers.tsx',
  `import { ThemeProvider } from './theme-provider';`,
  `import { AuthProvider } from '../features/auth/auth-provider';
import { ThemeProvider } from './theme-provider';`,
);

replaceExact(
  'apps/web/src/app/providers.tsx',
  `    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>`,
  `    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>`,
);

write(
  'apps/web/src/routes/router.tsx',
  `import { createBrowserRouter, type RouteObject } from 'react-router';

import { AppShell } from '../app/app-shell';
import { LoginPage } from '../features/auth/login-page';
import { RequireAuthenticated } from '../features/auth/require-authenticated';
import { DesignSystemPage } from './design-system-page';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';
import { RouteErrorBoundary } from './route-error-boundary';

function RouteErrorDiagnostic(): null {
  throw new Error('WP-F01 route error boundary diagnostic.');
}

const protectedChildRoutes: RouteObject[] = [
  {
    index: true,
    Component: HomePage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
];

const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    Component: LoginPage,
    ErrorBoundary: RouteErrorBoundary,
  },
];

if (import.meta.env.DEV) {
  publicRoutes.push(
    {
      path: '/__diagnostics/route-error',
      Component: RouteErrorDiagnostic,
      ErrorBoundary: RouteErrorBoundary,
    },
    {
      path: '/__design-system',
      Component: DesignSystemPage,
      ErrorBoundary: RouteErrorBoundary,
    },
  );
}

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    Component: RequireAuthenticated,
    children: [
      {
        path: '/',
        Component: AppShell,
        ErrorBoundary: RouteErrorBoundary,
        children: protectedChildRoutes,
      },
    ],
  },
]);
`,
);

replaceExact(
  'apps/web/src/app/app-shell.tsx',
  `  BellIcon,
  CalendarDaysIcon,
  HomeIcon,
  IconButton,`,
  `  BellIcon,
  Button,
  CalendarDaysIcon,
  HomeIcon,
  IconButton,`,
);

replaceExact(
  'apps/web/src/app/app-shell.tsx',
  `import { ThemeToggle } from '../components/theme-toggle';`,
  `import { ThemeToggle } from '../components/theme-toggle';
import { useAuthenticatedSession, useAuth } from '../features/auth/auth-provider';`,
);

replaceExact(
  'apps/web/src/app/app-shell.tsx',
  `export function AppShell() {
  const location = useLocation();

  return (`,
  `export function AppShell() {
  const location = useLocation();
  const session = useAuthenticatedSession();
  const { signOutCurrentUser } = useAuth();
  const accountName =
    session.user.displayName ??
    session.user.email ??
    session.principal.employeeId;

  return (`,
);

replaceExact(
  'apps/web/src/app/app-shell.tsx',
  `                <span className="app-shell__account-name">Foundation QA</span>
                <span className="app-shell__account-role">Local environment</span>
              </div>
            </div>`,
  `                <span className="app-shell__account-name">{accountName}</span>
                <span className="app-shell__account-role">{session.principal.roleId}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                void signOutCurrentUser();
              }}
              size="sm"
              variant="ghost"
            >
              Keluar
            </Button>`,
);

// -----------------------------------------------------------------------------
// Auth styles
// -----------------------------------------------------------------------------

write(
  'apps/web/src/styles/auth.css',
  `.auth-layout {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  background:
    radial-gradient(
      circle at top,
      color-mix(in srgb, var(--ui-action-primary-bg) 8%, transparent),
      transparent 32rem
    ),
    var(--ui-surface-sunken);
  padding: var(--ui-space-4);
}

.auth-card {
  display: grid;
  width: min(100%, 28rem);
  gap: var(--ui-space-4);
  padding: clamp(var(--ui-space-4), 4vw, var(--ui-space-6));
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.auth-brand__mark {
  display: inline-grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: var(--ui-radius-lg);
  background: var(--ui-action-primary-bg);
  color: var(--ui-action-primary-fg);
  font-size: var(--ui-text-label);
  font-weight: 800;
  box-shadow: var(--ui-shadow-e2);
}

.auth-brand__eyebrow {
  margin: 0 0 var(--ui-space-1);
  color: var(--ui-text-tertiary);
  font-size: var(--ui-text-caption);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.auth-title {
  margin: 0;
  color: var(--ui-text-primary);
  font-size: var(--ui-text-section-title);
  line-height: 1.2;
}

.auth-description,
.auth-footnote,
.auth-error {
  margin: 0;
  line-height: 1.5;
}

.auth-description {
  color: var(--ui-text-secondary);
  font-size: var(--ui-text-body);
}

.auth-footnote {
  color: var(--ui-text-tertiary);
  font-size: var(--ui-text-caption);
}

.auth-error {
  border-radius: var(--ui-radius-md);
  background: var(--ui-status-danger-soft);
  color: var(--ui-status-danger);
  padding: var(--ui-space-2) var(--ui-space-3);
  font-size: var(--ui-text-caption);
}

.auth-form {
  display: grid;
  gap: var(--ui-space-3);
}

.auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-2);
}

@media (max-width: 40rem) {
  .auth-layout {
    align-items: stretch;
    padding:
      max(var(--ui-space-3), env(safe-area-inset-top))
      var(--ui-space-3)
      max(var(--ui-space-3), env(safe-area-inset-bottom));
  }

  .auth-card {
    align-self: center;
  }
}
`,
);

replaceExact(
  'apps/web/src/styles/index.css',
  `@import './shell.css';`,
  `@import './shell.css';
@import './auth.css';`,
);

// -----------------------------------------------------------------------------
// Firestore Security Rules — first authenticated authorization boundary.
// Access/role writes are operator-only because client-side privilege mutation
// cannot safely enforce last-administrator / Firebase-Auth administration.
// -----------------------------------------------------------------------------

write(
  'firestore.rules',
  `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function currentAccess() {
      return get(/databases/$(database)/documents/access/$(request.auth.uid)).data;
    }

    function activeAccount() {
      return signedIn() &&
        currentAccess().uid == request.auth.uid &&
        currentAccess().status == 'ACTIVE';
    }

    function currentRole() {
      return get(
        /databases/$(database)/documents/roles/$(currentAccess().roleId)
      ).data;
    }

    function activeRole() {
      return activeAccount() &&
        currentRole().roleId == currentAccess().roleId &&
        currentRole().active == true;
    }

    function hasGrant(permission, scope) {
      return activeRole() &&
        currentRole().grants.hasAny([permission + ':' + scope]);
    }

    function hasAnyScope(permission) {
      return activeRole() &&
        currentRole().grants.hasAny([
          permission + ':SELF',
          permission + ':TEAM',
          permission + ':ALL'
        ]);
    }

    // Application access identity. A signed-in user may read only their own
    // access record unless their active role explicitly has access.view.
    //
    // Client writes are intentionally denied in the Spark baseline. Creating,
    // disabling, or changing roles/accounts remains an operator action until a
    // trusted privileged runtime is explicitly approved.
    match /access/{uid} {
      allow get: if signedIn() &&
        (request.auth.uid == uid || hasAnyScope('access.view'));
      allow list: if hasAnyScope('access.view');
      allow create, update, delete: if false;
    }

    // Role bundles are readable by active application accounts so the client
    // can render permission-aware UX. They are never client-writable.
    match /roles/{roleId} {
      allow get, list: if activeAccount();
      allow create, update, delete: if false;
    }

    // All product/business collections remain fail-closed until their owning
    // feature phase adds narrowly-scoped rules.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`,
);

// -----------------------------------------------------------------------------
// Firebase safety checker evolves from WP-F04 fail-closed to WP-F06 access model.
// -----------------------------------------------------------------------------

write(
  'tooling/firebase/check-config.cjs',
  `'use strict';

const fs = require('node:fs');

const errors = [];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function addError(message) {
  errors.push(message);
}

const firebaseRc = readJson('.firebaserc');
const firebaseJson = readJson('firebase.json');
const packageJson = readJson('package.json');
const indexes = readJson('firestore.indexes.json');
const rules = fs.readFileSync('firestore.rules', 'utf8');
const viteConfig = fs.readFileSync('apps/web/vite.config.ts', 'utf8');

if (firebaseRc.projects?.default !== 'nocschedule1') {
  addError('.firebaserc default project must be nocschedule1.');
}

const hostingSites = firebaseRc.targets?.nocschedule1?.hosting?.app;

if (
  !Array.isArray(hostingSites) ||
  hostingSites.length !== 1 ||
  hostingSites[0] !== 'nocmduscheduler'
) {
  addError('Hosting target app must resolve only to nocmduscheduler.');
}

if (firebaseJson.functions !== undefined) {
  addError('firebase.json must not define Cloud Functions in the Spark client-first baseline.');
}

if (firebaseJson.emulators !== undefined) {
  addError('firebase.json must not define Emulator Suite services in the active baseline.');
}

if (firebaseJson.hosting?.target !== 'app') {
  addError('Firebase Hosting target must remain app.');
}

if (firebaseJson.hosting?.public !== 'apps/web/dist') {
  addError('Firebase Hosting public directory must remain apps/web/dist.');
}

const rewrites = firebaseJson.hosting?.rewrites;

if (
  !Array.isArray(rewrites) ||
  rewrites.length !== 1 ||
  rewrites[0]?.source !== '**' ||
  rewrites[0]?.destination !== '/index.html'
) {
  addError('Firebase Hosting must contain only the SPA fallback rewrite to /index.html.');
}

if (
  Array.isArray(rewrites) &&
  rewrites.some((rewrite) => rewrite.function !== undefined || rewrite.run !== undefined)
) {
  addError('Firebase Hosting must not rewrite to Functions or Cloud Run.');
}

if (/proxy\\s*:/u.test(viteConfig) || /127\\.0\\.0\\.1:8787/u.test(viteConfig)) {
  addError('Vite must not proxy to the removed Express API runtime.');
}

if (fs.existsSync('apps/api')) {
  addError('apps/api must not exist in the Spark client-first baseline.');
}

const scriptText = JSON.stringify(packageJson.scripts ?? {});

for (const forbidden of [
  '@nocscheduler/api',
  'smoke:api',
  'test:integration',
  '--only functions',
  'functions,firestore',
]) {
  if (scriptText.includes(forbidden)) {
    addError(\`root scripts still contain removed backend token: \${forbidden}\`);
  }
}

const requiredRulePatterns = [
  [/function\\s+activeAccount\\s*\\(/u, 'activeAccount rule helper'],
  [/function\\s+hasGrant\\s*\\(/u, 'hasGrant rule helper'],
  [/match\\s+\\/access\\/\\{uid\\}/u, 'access document rules'],
  [/match\\s+\\/roles\\/\\{roleId\\}/u, 'role document rules'],
  [
    /match\\s+\\/access\\/\\{uid\\}[\\s\\S]*?allow\\s+create,\\s*update,\\s*delete:\\s*if\\s+false;/u,
    'client-denied access writes',
  ],
  [
    /match\\s+\\/roles\\/\\{roleId\\}[\\s\\S]*?allow\\s+create,\\s*update,\\s*delete:\\s*if\\s+false;/u,
    'client-denied role writes',
  ],
  [
    /match\\s+\\/\\{document=\\*\\*\\}[\\s\\S]*?allow\\s+read,\\s*write:\\s*if\\s+false;/u,
    'deny-by-default fallback',
  ],
];

for (const [pattern, label] of requiredRulePatterns) {
  if (!pattern.test(rules)) {
    addError(\`Firestore rules missing WP-F06 contract: \${label}\`);
  }
}

if (/allow\\s+read,\\s*write:\\s*if\\s+request\\.auth\\s*!=\\s*null/u.test(rules)) {
  addError('Firestore rules must not grant blanket authenticated read/write access.');
}

if (!Array.isArray(indexes.indexes) || !Array.isArray(indexes.fieldOverrides)) {
  addError('firestore.indexes.json must define indexes and fieldOverrides arrays.');
}

if (errors.length > 0) {
  console.error('[firebase-config] FAILED');

  for (const error of errors) {
    console.error(\`  - \${error}\`);
  }

  process.exit(1);
}

console.log(
  '[firebase-config] OK — Spark architecture preserved and WP-F06 Auth/access rules remain deny-by-default with operator-only privilege mutation.',
);
`,
);

// -----------------------------------------------------------------------------
// Browser QA now validates the unauthenticated surface without live test users.
// -----------------------------------------------------------------------------

write(
  'e2e/scaffold.spec.ts',
  `import { expect, test } from '@playwright/test';

test('unauthenticated users are routed to the internal login surface', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: 'Masuk ke NOCScheduler',
    }),
  ).toBeVisible();

  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
});

test('unknown protected routes do not bypass authentication', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(
    page.getByRole('heading', {
      name: 'Masuk ke NOCScheduler',
    }),
  ).toBeVisible();
});

test('development diagnostic route is handled by the route error boundary', async ({ page }) => {
  await page.goto('/__diagnostics/route-error');

  await expect(
    page.getByRole('heading', {
      name: 'Unexpected route error',
    }),
  ).toBeVisible();

  await expect(page.getByText('WP-F01 route error boundary diagnostic.')).toBeVisible();
});
`,
);

write(
  'e2e/accessibility.spec.ts',
  `import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'login', path: '/login' },
  { name: 'design system', path: '/__design-system' },
] as const;

for (const route of routes) {
  test(\`@a11y \${route.name} has no serious or critical automated violations\`, async ({ page }) => {
    await page.goto(route.path);

    if (route.path === '/login') {
      await expect(
        page.getByRole('heading', {
          name: 'Masuk ke NOCScheduler',
        }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole('heading', {
          name: 'Primitive showcase',
        }),
      ).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(blockingViolations).toEqual([]);
  });
}
`,
);

// -----------------------------------------------------------------------------
// F06 docs and operator bootstrap.
// -----------------------------------------------------------------------------

write(
  'docs/development/AUTHORIZATION.md',
  `# Authentication, Identity & Authorization

WP-F06 uses Firebase Authentication + Cloud Firestore Security Rules under the PRD-23
Spark/client-first architecture.

## Trust boundary

The browser is untrusted.

\`\`\`text
Firebase Auth user (UID)
  -> /access/{uid}
     -> status + employeeId + roleId
        -> /roles/{roleId}
           -> grants[]
              -> client UX capability checks
              -> Firestore Security Rules authorization
\`\`\`

UI hiding, route guards, and \`packages/domain/can()\` improve UX and deterministic behavior.
They do not authorize Firestore operations.

## Account and employee identity

Firebase UID and Employee ID are intentionally separate.

Disabling application access never deletes the historical Employee identity.

## Permission grants

Grant storage uses:

\`\`\`text
<permission>:<scope>
\`\`\`

Examples:

\`\`\`text
profile.view_self:SELF
schedule.view_team:TEAM
dashboard.view:ALL
access.view:ALL
\`\`\`

Scopes are ordered:

\`\`\`text
SELF < TEAM < ALL
\`\`\`

A broader grant may satisfy a narrower operation, never the reverse.

## Spark privilege-management posture

Client writes to \`/access/**\` and \`/roles/**\` are denied.

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

Firestore Rules use document \`get()\` calls to resolve access and role state. Firebase documents
that these access calls count as document reads and are subject to rules access-call limits.
Keep future feature rules economical and reuse/caching-friendly.

## Session posture

Email/password sign-in uses Firebase Auth Web SDK with browser-session persistence. Closing the
browser session clears the chosen persistence baseline.

The app listens with \`onIdTokenChanged\` so token/session changes trigger a fresh access lookup.
Critical future actions may call \`refreshAccess()\` immediately before mutation when freshness is
required.
`,
);

write(
  'docs/development/FIREBASE_AUTH_BOOTSTRAP.md',
  `# Firebase Auth Bootstrap — Operator Procedure

This procedure creates the first internal application user without Cloud Functions or Admin SDK.

## 1. Enable Email/Password provider

In Firebase Console for \`nocschedule1\`:

\`\`\`text
Authentication
→ Sign-in method
→ Email/Password
→ Enable
\`\`\`

Do not enable public application self-registration. Firebase Console user creation remains an
operator action.

## 2. Create Firebase Authentication user

Create the internal user in Firebase Console and copy the generated Firebase UID.

The application never stores the user's password.

## 3. Create role document

In Firestore Console create:

\`\`\`text
roles/ADMINISTRATOR
\`\`\`

Fields:

\`\`\`text
roleId = "ADMINISTRATOR"
label  = "Administrator"
active = true
grants = [
  "auth.login:SELF",
  "auth.logout:SELF",
  "profile.view_self:SELF",
  "dashboard.view:ALL",
  "access.view:ALL"
]
\`\`\`

WP-F07+ expands the operational permission set as owning features become real. Deny-by-default
remains safer than pre-granting capabilities whose persistence rules do not exist yet.

## 4. Create access document

Create:

\`\`\`text
access/<FIREBASE_UID>
\`\`\`

Fields:

\`\`\`text
uid        = "<FIREBASE_UID>"
employeeId = "employee-bootstrap-001"
roleId     = "ADMINISTRATOR"
status     = "ACTIVE"
revision   = 0
\`\`\`

The Firebase UID in the field and document ID must match.

The Employee record itself is introduced in WP-F07. The stable employeeId is reserved now so Auth
identity remains separate from business identity.

## 5. Deploy Firestore Rules

After WP-F06 repository QA is green:

\`\`\`powershell
npm run firebase:deploy:firestore
\`\`\`

## 6. Manual acceptance

Validate:

1. unknown/not-signed-in browser opens Login;
2. valid Firebase user without \`access/{uid}\` is denied;
3. valid ACTIVE user with valid role can enter;
4. changing access status to INACTIVE and refreshing blocks the app;
5. browser client cannot write \`access/**\` or \`roles/**\`;
6. logout returns to Login.

Do not create production test users from CI.
`,
);

// -----------------------------------------------------------------------------
// Rebaseline the stale server/API wording in WP-F06 only.
// -----------------------------------------------------------------------------

const workplanPath = 'docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md';
let workplan = read(workplanPath);

const oldF06 = `# 13. WP-F06 — Authentication, Identity & Authorization

## PRD Focus

PRD-07, PRD-16, PRD-22.

## Goal

User dapat login, tetapi mutation hanya dapat dilakukan sesuai capability dan scope.

## Deliverables

- login;
- logout;
- session/token refresh awareness;
- Firebase ID token verification middleware;
- active/inactive account enforcement;
- user ↔ employee linkage;
- application role/capability model;
- authorization service;
- route/action guards;
- last-administrator protection;
- account disable flow;
- authorization audit events.

## Required Tests

- valid login;
- invalid login;
- expired/missing token;
- disabled user;
- direct API request tanpa permission;
- user mencoba actor/resource ID milik user lain;
- permission UI hidden tetapi API tetap authoritative;
- role/access mutation audit.

## Exit Gate

Authentication dan authorization test lulus dari UI dan adversarial HTTP path.

---`;

const newF06 = `# 13. WP-F06 — Authentication, Identity & Authorization

## PRD Focus

PRD-07, PRD-16, PRD-23.

## Goal

User dapat login melalui Firebase Authentication, tetapi application access dan seluruh future
Firestore mutation hanya boleh berjalan sesuai account status, capability, scope, dan Security
Rules.

## Deliverables

- Firebase email/password login;
- logout;
- browser-session persistence;
- \`onIdTokenChanged\` session/token refresh awareness;
- active/inactive/suspended application-account enforcement;
- Firebase UID ↔ stable employeeId linkage;
- canonical \`access/{uid}\` record;
- role/capability/scope contract;
- deterministic \`can()\` / \`requirePermission()\` domain service;
- protected-route and permission-aware UI helpers;
- first authenticated Firestore Security Rules boundary;
- deny-by-default business collections;
- operator-managed role/access bootstrap under Spark;
- generic login failure messaging;
- no public self-registration.

## Spark Security Boundary

- UI and domain helpers are not authorization boundaries;
- Firestore Security Rules are authoritative for browser database access;
- \`access/**\` and \`roles/**\` are never client-writable in this phase;
- self-escalation is impossible through the app client because privilege documents reject writes;
- last-administrator and Firebase Auth account administration remain operator responsibilities
  while no trusted backend/Admin SDK runtime is approved;
- future requirement for in-app privileged account administration requires an explicit architecture
  decision rather than silently reintroducing Cloud Functions.

## Required Tests

- auth/access contract validation;
- generic/non-enumerating login error mapping;
- missing/inactive access denied;
- role inactive denied;
- ungranted capability denied by default;
- scope ordering SELF < TEAM < ALL;
- protected route redirects signed-out users;
- login surface accessibility;
- Firebase architecture checker asserts access/role writes remain denied;
- clean CI does not create Auth users or write production Firestore data.

## Exit Gate

- repository quality gates green;
- clean GitHub Actions green;
- Firestore rules deploy successfully;
- valid operator-created Firebase user + ACTIVE access/role record can login;
- missing/inactive access is denied;
- logout works;
- browser client cannot mutate \`access/**\` or \`roles/**\`;
- no Cloud Functions/Admin SDK runtime introduced.

---`;

const f06Count = workplan.split(oldF06).length - 1;

if (f06Count !== 1) {
  fail(`Workplan expected one legacy WP-F06 section, found ${f06Count}.`);
}

workplan = workplan.replace(oldF06, newF06);
write(workplanPath, workplan);

// -----------------------------------------------------------------------------
// Phase ledger remains F06 until live/manual security validation.
// -----------------------------------------------------------------------------

let ledger = read('docs/workflow/PHASE_CONTROL.md');

const ledgerReplacements = [
  [
    '| Current Status | `GENERATOR_READY` |',
    '| Current Status | `PUSHED_UNVERIFIED` |',
  ],
  [
    '| Active Execution Model | WP-F06 generator → dependency materialization if needed → format write-stage → commit/push → QA against exact pushed checkpoint → explicit Firestore/Auth operator validation where required |',
    '| Active Execution Model | WP-F06 Auth/access generator applied → dependency materialization → format write-stage → commit/push → QA against exact pushed checkpoint → Firestore rules deploy + operator-created Auth/access manual acceptance |',
  ],
  [
    '| User Validation Pending | No for WP-F05; WP-F06 implementation/QA is next |',
    '| User Validation Pending | Yes — WP-F06 repository/CI QA, Firestore rules deployment, and operator-created Auth/access validation must pass |',
  ],
  [
    '| WP-F06 | GENERATOR_READY | Firebase Authentication + Firestore Security Rules authorization foundation may begin |',
    '| WP-F06 | PUSHED_UNVERIFIED | Firebase Auth UI/session + role/access contracts + deny-by-default Firestore authorization foundation prepared; QA/live validation pending |',
  ],
];

for (const [before, after] of ledgerReplacements) {
  const count = ledger.split(before).length - 1;

  if (count !== 1) {
    fail(`PHASE_CONTROL.md expected one target, found ${count}.\nTarget:\n${before}`);
  }

  ledger = ledger.replace(before, after);
}

write('docs/workflow/PHASE_CONTROL.md', ledger);

console.log('WP-F06 authentication/identity/authorization foundation written successfully.');
console.log('- Firebase email/password login + browser-session persistence');
console.log('- onIdTokenChanged access refresh awareness');
console.log('- Firebase UID separated from employeeId');
console.log('- role/capability/scope contracts + deterministic domain authorization service');
console.log('- protected login/app route boundary');
console.log('- access/{uid} + roles/{roleId} Firestore Rules');
console.log('- access/role client writes remain denied; privilege mutation is operator-managed on Spark');
console.log('- all other business collections remain fail-closed');
console.log('- browser E2E/accessibility expectations updated for login');
console.log('- no Cloud Functions, Admin SDK, API runtime, emulator, or CI production writes added');
console.log('- WP-F07 remains locked until WP-F06 QA + live operator validation passes');
