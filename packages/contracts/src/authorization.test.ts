import { describe, expect, it } from 'vitest';

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
