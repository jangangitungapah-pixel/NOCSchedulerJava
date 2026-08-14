import { z } from 'zod';

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
  return permissionGrantCodeSchema.parse(`${permission}:${scope}`);
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
