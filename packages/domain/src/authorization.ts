import {
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
      `Permission denied: ${permission} requires ${requiredScope} scope.`,
      'FORBIDDEN',
    );
  }
}
