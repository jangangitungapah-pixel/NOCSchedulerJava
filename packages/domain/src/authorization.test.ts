import {
  entityIdSchema,
  makePermissionGrantCode,
  revisionSchema,
  type AuthorizationPrincipal,
} from '@nocscheduler/contracts';
import { describe, expect, it } from 'vitest';

import { can, requirePermission } from './authorization';

function principal(overrides: Partial<AuthorizationPrincipal> = {}): AuthorizationPrincipal {
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
