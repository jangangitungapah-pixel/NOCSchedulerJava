import {
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
